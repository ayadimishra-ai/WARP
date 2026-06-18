import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  saveESGEmployeeDiversity,
  saveESGEmployeeTurnover,
  saveESGTrainingHours,
} from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
import {
  ExcelApiBodySchema,
  TExcelSheet,
  addDefaultMonthInExcelData,
  readDataFromURL,
  trimColumnNames,
  trimtrailingblankrows,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { inserthumanresourceTemplateData } from "@/modules/ghg/lib/organization-transaction/human-resources/human-resources.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/human-resources/human-resources.validations";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { HumanResourcesActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
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

  // read excel data
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    "humanresources"
  );
  const data = await readDataFromURL(input.fileUrl);
  const { sheets: templateSheets } =
    HumanResourcesActivityConstant.excel_template;
  let excelData = templateSheets
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];

  // add default month in each row of each sheet
  excelData = addDefaultMonthInExcelData(excelData);

  //trim column names
  excelData = trimColumnNames(excelData);
  // // Slice the data to keep only up to the last non-blank row
  excelData = trimtrailingblankrows(excelData);

  // Template validation
  let tempalteValidationErrros: Record<string, any>[] =
    validateExcelTemplate(excelData);
  if (!!tempalteValidationErrros?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: tempalteValidationErrros }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "human_resources",
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

  // Data Validation
  let dataValidationErrros: Awaited<ReturnType<typeof validateExcelTemplateData>>;
  try {
    dataValidationErrros = await validateExcelTemplateData(
      excelData,
      userSession.organizationId as UUID
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: HumanResourcesActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
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
      "human_resources",
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
    saveresponse = await inserthumanresourceTemplateData(
      excelData,
      HumanResourcesActivityConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: HumanResourcesActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  // Audit log calls for all 3 tables. i.e. waste water treatment, Effluent Discharge, Sludge Disposal
  saveESGEmployeeDiversity(
    saveresponse?.insert_ESGEmployeeDiversity?.returning,
    userSession,
    saveresponse?.delete_ESGEmployeeDiversity?.returning
  );
  saveESGEmployeeTurnover(
    saveresponse?.insert_ESGEmployeeTurnover?.returning,
    userSession,
    saveresponse?.delete_ESGEmployeeTurnover?.returning
  );
  saveESGTrainingHours(
    saveresponse?.insert_ESGTrainingHours?.returning,
    userSession,
    saveresponse?.delete_ESGTrainingHours?.returning
  );

  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "human_resources",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      HumanResourcesActivityConstant.name,
      uploadMonths,
      uploadYear
    );

    // After successful data write — update summary cache
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "human_resources",
      monthYears: uploadMonths.map((m) => ({
        year: uploadYear,
        month: m,
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
