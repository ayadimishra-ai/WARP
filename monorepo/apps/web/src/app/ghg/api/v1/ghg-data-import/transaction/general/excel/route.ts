import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGGeneralDetails } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
import {
    ExcelApiBodySchema,
    extractYearMonthPairsFromExcel,
    readDataFromURL,
    trimColumnNames,
    trimtrailingblankrows,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import * as generalService from "@/modules/ghg/lib/organization-transaction/general/general.service";
import * as generalValidation from "@/modules/ghg/lib/organization-transaction/general/general.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { GeneralActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // validate request body
  const input = await ExcelApiBodySchema.parseAsync(await req.json());

  // Validate User Permission
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    "general"
  );

  // read excel data
  let data = await readDataFromURL(input.fileUrl);
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );

  const fileName = s3FileName ?? urlFileName;
  // Trim column names
  data = trimColumnNames(data);
  // // Slice the data to keep only up to the last non-blank row
  data = trimtrailingblankrows(data);
  ///filter Excel sheet according to Location Access

  // validate template
  let templateErrors = generalValidation.validateTemplate(data);
  if (!!templateErrors.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateErrors }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "general",
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
  const dataValidationResult = await generalValidation.validateData(
    data,
    userSession.organizationId as UUID
  );

  const failureSheets = dataValidationResult.filter((m) => !m.success);

  const successSheets = dataValidationResult.filter((m) => !!m.success);

  if (!!failureSheets.length) {
    const result = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      failureSheets.map(({ sheetName, data }) => ({ sheetName, data }))
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "general",
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      {
        file_url: result?.downloadUrl ?? "",
      },
      input.organizationAddressId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  let success;
  try {
    success = await generalService.saveData(
      userSession,
      input.organizationAddressId,
      dataValidationResult as any
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: "general",
      organizationAddressId: input.organizationAddressId,
      excelData: data,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }
  success?.map(async (insertionData) => {
    saveGHGGeneralDetails(
      insertionData.insert_GHGGeneralDetails?.returning,
      userSession,
      insertionData.delete_GHGGeneralDetails?.returning
    );
  });

  if (!!success) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(data);
    const yearMonthPairs = extractYearMonthPairsFromExcel(data);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "general",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      GeneralActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );

    // After successful data write — update summary cache
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "general",
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
