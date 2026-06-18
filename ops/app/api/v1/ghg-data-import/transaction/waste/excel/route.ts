import { UUID } from "crypto";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGWaste } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { handleApprovalLockError } from "~/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "~/lib/data-import-history/extract-upload-period";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard,
} from "~/lib/emission-calculation-engine/emisison-calculation.service";
import {
  ExcelApiBodySchema,
  TExcelSheet,
  extractYearMonthPairsFromExcel,
  readDataFromURL,
  trimColumnNames,
  trimtrailingblankrows,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { insertWasteTemplateData } from "~/lib/organization-transaction/waste/waste.service";
import {
  validateWasteExcelTemplate,
  validateWasteExcelTemplateData,
} from "~/lib/organization-transaction/waste/waste.validation";
import { calculatePCFEmissionFromSupplierData } from "~/lib/pcf-emission/pcf-emission.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { ParentActivitiesType } from "~/lib/shared/constants/activity.constant";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { createExcelForEmail } from "~/lib/waste-master/waste-master.service";
import { WasteActivityConstant } from "~/shared/constants/activity.constant";
import {
  uploadActivityErrorsExcelJsonSheets,
  uploadActivityFilesExcelJsonSheets,
} from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { sendEmailWithManipulateTemplate } from "~/utils/email.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // let organizationAddressId = userSession?.mappings[0]?.organization_address_id;

  // validate request body
  const input = await ExcelApiBodySchema.parseAsync(await req.json());
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );
  const fileName = s3FileName ?? urlFileName;

  // Validate User Permission
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    "waste"
  );

  // read excel data
  const data = await readDataFromURL(input.fileUrl);

  const { sheets: templateSheets } = WasteActivityConstant.excel_template;

  let excelData = templateSheets
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];

  //trim column names
  excelData = trimColumnNames(excelData);
  // // Slice the data to keep only up to the last non-blank row
  excelData = trimtrailingblankrows(excelData);
  // validate template
  // validate template
  let validationErrors: Record<string, any>[] =
    validateWasteExcelTemplate(excelData);

  if (!!validationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: validationErrors }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "waste",
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      {
        file_url: uploadResponse?.downloadUrl ?? "",
      },
      input.organizationAddressId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  // validate template data
  let datavalidationerrors = await validateWasteExcelTemplateData(
    excelData,
    userSession.organizationId as UUID,
    input.organizationAddressId as UUID
  );

  if (datavalidationerrors.length > 0) {
    //validate Data
    const uploadResponsedata = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      datavalidationerrors
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "waste",
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      {
        file_url: uploadResponsedata?.downloadUrl ?? "",
      },
      input.organizationAddressId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  let saveresponse;
  try {
    saveresponse = await insertWasteTemplateData(
      excelData,
      WasteActivityConstant.code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: WasteActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }
  saveGHGWaste(
    saveresponse?.insert_GHGWaste?.returning,
    userSession,
    saveresponse?.delete_GHGWaste?.returning
  );
  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);
    const yearMonthPairs = extractYearMonthPairsFromExcel(excelData);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "waste",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      WasteActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );

    // Below code is for Emission Calculation
    const uniquetask_request_id = saveresponse.insert_GHGWaste?.returning
      .map((items: any) => items.task_request_id)
      .filter(
        (item: any, index: any, self: any) =>
          index === self.findIndex((t: any) => t === item)
      ) as UUID[];

    await calculateEmission(
      userSession?.organizationId,
      "waste",
      uniquetask_request_id
    );
    const response: any = await saveEmissionDashboard(
      uniquetask_request_id,
      userSession?.organizationId
    );

    // await saveKpiWasteManagement({
    //   data: saveresponse,
    //   organizationId: userSession?.organizationId as UUID,
    //   uniqueTaskRequestIds: uniquetask_request_id,
    //   userId: userSession?.userId as UUID,
    // });

    //Emission Update for all buyers mapped to current supplier
    await emissionCalculationForBuyer({
      instanceOrgId: userSession?.organizationId as UUID,
      instanceTaskRequestIds: uniquetask_request_id as UUID[],
    });

    // PCF emission calculation for all buyers mapped to current supplier
    await calculatePCFEmissionFromSupplierData(
      userSession?.organizationId as UUID,
      uniquetask_request_id as UUID[],
      userSession?.userId as UUID
    );

    const emissionFactorDataExcelToMail = await createExcelForEmail(
      String(userSession?.organizationId),
      input.organizationAddressId
    );
    if (
      !!emissionFactorDataExcelToMail &&
      emissionFactorDataExcelToMail.length > 0 &&
      emissionFactorDataExcelToMail[0]?.data?.length > 0
    ) {
      const filedownLoadUrl = await uploadActivityFilesExcelJsonSheets(
        userSession,
        "Missing_Waste_Emissions_" +
          dayjs().format("YYYYMMDD_HHmmssSSS") +
          ".xlsx",
        emissionFactorDataExcelToMail,
        "waste-master",
        true
      );
      await sendEmailWithManipulateTemplate(
        userSession,
        {
          fileUrl: filedownLoadUrl?.downloadUrl as string,
          organizationName:
            saveresponse?.insert_GHGWaste?.returning[0].OrganizationAddress
              ?.Organization?.name,
          Activity: ParentActivitiesType.Waste,
          copyrightYear: new Date().getFullYear().toString(),
        },
        "Waste_Type_Missing_Email"
      );
    }
    return NextResponse.json({ success: true, data: historyData });
  }
  return NextResponse.json({ success: true, data: [] });
}
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
