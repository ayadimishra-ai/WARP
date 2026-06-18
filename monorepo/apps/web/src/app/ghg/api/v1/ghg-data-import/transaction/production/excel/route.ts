import { UUID } from "crypto";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGProductionDetails } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
import {
    ExcelApiBodySchema,
    TExcelSheet,
    extractYearMonthPairsFromExcel,
    readDataFromURL,
    trimColumnNames,
    trimtrailingblankrows,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { saveProductionSheetEntries } from "@/modules/ghg/lib/organization-transaction/production/production-excel.service";
import {
    validateExcelTemplate,
    validateExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/production/production-excel.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { ProductionDetailsActivity } from "@/modules/ghg/lib/shared/constants/activity.constant";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { ProductionExcelActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { opsUserType } from "@/modules/ghg/shared/constants/input.constant";
import {
    uploadActivityErrorsExcelJsonSheets,
    uploadActivityFilesExcelJsonSheets,
} from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import {
    dynamicEmailHeader,
    sendEmailWithManipulateTemplate,
} from "@/modules/ghg/utils/email.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";
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
    // After successful data write — update summary cache
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "production",
      monthYears: yearMonthPairs.map((d: any) => ({
        year: Number(d.year),
        month: String(d.month).toLowerCase(),
      })),
    }).catch((err) => console.error("[summary-cache] upsert failed:", err));
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
