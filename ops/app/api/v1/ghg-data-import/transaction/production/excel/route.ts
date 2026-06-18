import { UUID } from "crypto";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGProductionDetails } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { handleApprovalLockError } from "~/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "~/lib/data-import-history/extract-upload-period";
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
import { saveProductionSheetEntries } from "~/lib/organization-transaction/production/production-excel.service";
import {
    validateExcelTemplate,
    validateExcelTemplateData,
} from "~/lib/organization-transaction/production/production-excel.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { ProductionDetailsActivity } from "~/lib/shared/constants/activity.constant";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { ProductionExcelActivityConstant } from "~/shared/constants/activity.constant";
import { opsUserType } from "~/shared/constants/input.constant";
import {
    uploadActivityErrorsExcelJsonSheets,
    uploadActivityFilesExcelJsonSheets,
} from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import {
    dynamicEmailHeader,
    sendEmailWithManipulateTemplate,
} from "~/utils/email.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";
async function postHandler(req: NextRequest, userSession: TUserSession) {
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
    ProductionDetailsActivity.code
  );
  // read excel data
  const data = await readDataFromURL(input.fileUrl);
  const { sheets: templateSheets } =
    ProductionExcelActivityConstant.excel_template;
  let Exceldata = templateSheets
    .map((sheet: { name: string }) => {
      return data?.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet: any) => !!sheet) as TExcelSheet[];

  // Trim column names
  Exceldata = trimColumnNames(Exceldata);
  // // Slice the data to keep only up to the last non-blank row
  Exceldata = trimtrailingblankrows(Exceldata);
  // Template validation
  let tempalteValidationErrros: Record<string, any>[] =
    validateExcelTemplate(Exceldata);
  if (!!tempalteValidationErrros?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: tempalteValidationErrros }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "production",
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

  //Data Validation
  let dataValidationErrros: Awaited<ReturnType<typeof validateExcelTemplateData>>;
  try {
    dataValidationErrros = await validateExcelTemplateData(
      Exceldata,
      userSession as TUserSession,
      input?.organizationAddressId as UUID
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: ProductionExcelActivityConstant.parent_code,
      organizationAddressId: input.organizationAddressId,
      excelData: Exceldata,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }
  if (dataValidationErrros.length > 0) {
    //validate Data
    const uploadResponsedata = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrros
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "production",
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

  // Save Production details
  let saveResponse;
  try {
    saveResponse = await saveProductionSheetEntries(
      Exceldata,
      ProductionExcelActivityConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: ProductionExcelActivityConstant.parent_code,
      organizationAddressId: input.organizationAddressId,
      excelData: Exceldata,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  saveGHGProductionDetails(
    saveResponse?.response?.insert_GHGProductionDetails?.returning,
    userSession,
    saveResponse?.response?.delete_GHGProductionDetails?.returning
  );

  if (!!saveResponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(Exceldata);
    const yearMonthPairs = extractYearMonthPairsFromExcel(Exceldata);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "production",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      ProductionExcelActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );
    if (saveResponse?.MasterDataInserted.length > 0) {
      const filedownLoadUrl = await uploadActivityFilesExcelJsonSheets(
        userSession,
        "Missing_SKU_Master_" + dayjs().format("YYYYMMDD_HHmmssSSS") + ".xlsx",
        saveResponse.MasterDataInserted,
        "sku-bom-uploads",
        true
      );
      //#region Email dynamic header
      const emailHeader = await dynamicEmailHeader(userSession.organizationId);
      //#endregion Email dynamic header
      await sendEmailWithManipulateTemplate(
        userSession,
        {
          fileUrl: filedownLoadUrl?.downloadUrl as string,
          userName: opsUserType?.OrganizationAdmin?.label,
          copyrightYear: new Date().getFullYear().toString(),
          HeaderContent: emailHeader,
        },
        "SKU_BOM_Weight_Email"
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
