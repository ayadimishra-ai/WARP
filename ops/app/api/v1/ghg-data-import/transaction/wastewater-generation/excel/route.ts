import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGWasteWatergeneration } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { handleApprovalLockError } from "~/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "~/lib/data-import-history/extract-upload-period";
import {
    ExcelApiBodySchema,
    extractYearMonthPairsFromExcel,
    readDataFromURL,
    TExcelSheet,
    trimColumnNames,
    trimtrailingblankrows,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { insertWaterWasteGenerationTemplateData } from "~/lib/organization-transaction/wastewater-generation/wastewatergeneration.service";
import {
    validateWastewaterGenerationExcelTemplate,
    validateWastewaterGenerationExcelTemplateData,
} from "~/lib/organization-transaction/wastewater-generation/wastewatergeneration.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { WastewaterGenerationActivityConstant } from "~/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  const input = await ExcelApiBodySchema.parseAsync(await req.json());
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );
  const fileName = s3FileName ?? urlFileName;
  //Validate User Permission
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    "water"
  );
  // read excel data
  const data = await readDataFromURL(input.fileUrl);

  const { sheets: templateSheets } =
    WastewaterGenerationActivityConstant.excel_template;

  let excelData = templateSheets
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];
  //trim column names
  excelData = trimColumnNames(excelData);
  //trim column names
  // // Slice the data to keep only up to the last non-blank row
  excelData = trimtrailingblankrows(excelData);
  // validate template
  let validationErrors: Record<string, any>[] =
    validateWastewaterGenerationExcelTemplate(excelData);
  if (!!validationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: validationErrors }]
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      "wastewater_generation",
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
  //validateWaterExcelTemplateData
  let datavalidationerrors =
    await validateWastewaterGenerationExcelTemplateData(
      excelData,
      userSession.organizationId as UUID
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
      "wastewater_generation",
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

  ///duplicate validation
  ///duplicate validation
  //save data
  let saveresponse;
  try {
    saveresponse = await insertWaterWasteGenerationTemplateData(
      excelData,
      WastewaterGenerationActivityConstant.code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: WastewaterGenerationActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  saveGHGWasteWatergeneration(
    saveresponse?.insert_GHGWastewaterGeneration?.returning,
    userSession,
    saveresponse?.delete_GHGWastewaterGeneration?.returning
  );
  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);
    const yearMonthPairs = extractYearMonthPairsFromExcel(excelData);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "wastewater_generation",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      WastewaterGenerationActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );
    const taskRequestIds: string[] = [];
    // Iterate through the insert objects and extract task_request_id
    for (const key in saveresponse) {
      if (key.includes("insert") && saveresponse[key].returning) {
        saveresponse[key].returning.forEach((item: any) => {
          if (!taskRequestIds.includes(item.task_request_id)) {
            taskRequestIds.push(item.task_request_id);
          }
        });
      }
    }
    //this function is called to save fresh water consumption in kpiWaterConsumption table not to calculate emission
    // await saveEmissionDashboard(
    //   taskRequestIds,
    //   userSession?.organizationId,
    //   true
    // );

    return NextResponse.json({ success: true, data: historyData });
  }
  //save data
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
