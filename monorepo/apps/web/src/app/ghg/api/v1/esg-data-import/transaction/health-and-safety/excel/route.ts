import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
    saveESGAssessedLocations,
    saveESGHealthandSafety,
    saveESGHealthAndSafetyTraining,
    saveESGSafetyObservations,
} from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
import {
    addDefaultMonthInExcelData,
    ExcelApiBodySchema,
    readDataFromURL,
    TExcelSheet,
    trimColumnNames,
    trimtrailingblankrows,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { insertHealthAndSafetyTemplateData } from "@/modules/ghg/lib/organization-transaction/health-and-safety/health-and-safety.service";
import {
    validateHealthAndSafetyExcelTemplate,
    validateHealthAndSafetyExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/health-and-safety/health-and-safety.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { HealthandSafetyActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

async function postHandler(req: NextRequest, userSession: TUserSession) {
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
    HealthandSafetyActivityConstant.parent_code
  );
  // read excel data
  const data = await readDataFromURL(input.fileUrl);
  const { sheets: templateSheets } =
    HealthandSafetyActivityConstant.excel_template;

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
  // validate template
  let validationErrors: Record<string, any>[] =
    validateHealthAndSafetyExcelTemplate(excelData);

  if (!!validationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: validationErrors }]
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      HealthandSafetyActivityConstant.code,
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

  // validateWaterExcelTemplateData
  let datavalidationerrors = await validateHealthAndSafetyExcelTemplateData(
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
      HealthandSafetyActivityConstant.code,
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
    saveresponse = await insertHealthAndSafetyTemplateData(
      excelData,
      HealthandSafetyActivityConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: HealthandSafetyActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  // Audit log calls for all 4 tables
  saveESGHealthandSafety(
    saveresponse?.insert_ESGHealthAndSafety?.returning,
    userSession,
    saveresponse?.delete_ESGHealthAndSafety?.returning
  );

  saveESGSafetyObservations(
    saveresponse?.insert_ESGSafetyObservations?.returning,
    userSession,
    saveresponse?.delete_ESGSafetyObservations?.returning
  );

  saveESGHealthAndSafetyTraining(
    saveresponse?.insert_ESGHealthAndSafetyTraining?.returning,
    userSession,
    saveresponse?.delete_ESGHealthAndSafetyTraining?.returning
  );

  saveESGAssessedLocations(
    saveresponse?.insert_ESGAssessedLocations?.returning,
    userSession,
    saveresponse?.delete_ESGAssessedLocations?.returning
  );

  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);

    const historyData = await insertNewDataImportHistory(
      userSession,
      HealthandSafetyActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      HealthandSafetyActivityConstant.name,
      uploadMonths,
      uploadYear
    );

    // After successful data write — update summary cache
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "health_and_safety",
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
