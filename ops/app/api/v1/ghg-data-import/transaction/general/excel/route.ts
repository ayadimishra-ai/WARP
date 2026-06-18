import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGGeneralDetails } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { handleApprovalLockError } from "~/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "~/lib/data-import-history/extract-upload-period";
import {
    ExcelApiBodySchema,
    extractYearMonthPairsFromExcel,
    readDataFromURL,
    trimColumnNames,
    trimtrailingblankrows,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import * as generalService from "~/lib/organization-transaction/general/general.service";
import * as generalValidation from "~/lib/organization-transaction/general/general.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { GeneralActivityConstant } from "~/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";

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
