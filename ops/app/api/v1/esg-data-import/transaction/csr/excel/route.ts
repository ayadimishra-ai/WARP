import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveESGCSR } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { handleApprovalLockError } from "~/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "~/lib/data-import-history/extract-upload-period";
import {
  ExcelApiBodySchema,
  TExcelSheet,
  addDefaultMonthInExcelData,
  readDataFromURL,
  trimColumnNames,
  trimtrailingblankrows,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { insertCSRTemplateData } from "~/lib/organization-transaction/csr/csr-excel.service";
import {
  validateCSRExcelTemplate,
  validateCSRExcelTemplateData,
} from "~/lib/organization-transaction/csr/csr-excel.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";

import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { CSRActivityConstant } from "~/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
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
    "csr_master"
  );

  // read excel data
  const data = await readDataFromURL(input.fileUrl);

  const { sheets: templateSheets } = CSRActivityConstant.excel_template;

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
  let validationErrors: Record<string, any>[] =
    validateCSRExcelTemplate(excelData);

  // add default month in each row of each sheet
  excelData = addDefaultMonthInExcelData(excelData);

  if (!!validationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: validationErrors }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "csr",
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
  let datavalidationerrors = await validateCSRExcelTemplateData(
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
      "csr",
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
    saveresponse = await insertCSRTemplateData(
      excelData,
      CSRActivityConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: CSRActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData
    });
    if (lockResponse) return lockResponse;
    throw err;
  }
  saveESGCSR(
    saveresponse?.insert_ESGCSR?.returning,
    userSession,
    saveresponse?.delete_ESGCSR?.returning
  );
  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "csr",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      CSRActivityConstant.name,
      uploadMonths,
      uploadYear
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
