import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  ExcelApiBodySchemaWithoutAddressId,
  readDataFromURL,
  TExcelSheet,
  trimColumnNames,
  trimtrailingblankrows,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { insertMasterDataImportHistory } from "~/lib/master-data-import-history/master-data-import-history.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { saveSMMSheetEntries } from "~/lib/supplier-material-mapping/supplier-material-mapping-excel.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "~/lib/supplier-material-mapping/supplier-material-mapping-excel.validation";
import { SupplierMaterialMappingActivityConstant } from "~/shared/constants/activity.constant";
import { isOrganizationAdmin } from "~/shared/constants/user-roles.constant";
import { CustomError } from "~/shared/error/custom-error";
import { uploadMasterDataErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  if (!isOrganizationAdmin(userSession.userRole)) {
    throw CustomError({ statusCode: 401, message: "Permission denied" });
  }

  const input = await ExcelApiBodySchemaWithoutAddressId.parseAsync(
    await req.json()
  );

  const data = await readDataFromURL(input.fileUrl);
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );
  const fileName = s3FileName ?? urlFileName;

  const { sheets: templateSheets } =
    SupplierMaterialMappingActivityConstant.excel_template;

  let excelData = templateSheets
    .map((sheet) =>
      data.find(
        (m) => sanitizeString.v4(m.sheetName) === sanitizeString.v4(sheet.name)
      )
    )
    .filter(Boolean) as TExcelSheet[];

  excelData = trimColumnNames(excelData);
  excelData = trimtrailingblankrows(excelData);

  // Template structure validation
  const templateErrors = validateExcelTemplate(excelData);
  if (templateErrors.length > 0) {
    const uploadResponse = await uploadMasterDataErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateErrors }]
    );

    const historyData = await insertMasterDataImportHistory(
      userSession,
      SupplierMaterialMappingActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      { file_url: uploadResponse?.downloadUrl ?? "" },
      userSession.organizationId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  // Data validation
  const dataErrors = await validateExcelTemplateData(
    excelData,
    userSession.organizationId as UUID
  );
  if (dataErrors.length > 0) {
    const uploadResponse = await uploadMasterDataErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataErrors
    );

    const historyData = await insertMasterDataImportHistory(
      userSession,
      SupplierMaterialMappingActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      { file_url: uploadResponse?.downloadUrl ?? "" },
      userSession.organizationId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  // Insert data
  const saveResult = await saveSMMSheetEntries(excelData, userSession);

  const historyData = await insertMasterDataImportHistory(
    userSession,
    SupplierMaterialMappingActivityConstant.code,
    "Excel",
    fileName,
    input.fileUrl,
    saveResult.affected_rows > 0 ? "successful" : "failure",
    null,
    userSession.organizationId
  );

  // // PCF Emission Calculation
  // await triggerPCFEmissionForSMM(saveResult, excelData, userSession);

  return NextResponse.json({
    success: saveResult.affected_rows > 0,
    data: historyData,
    affected_rows: saveResult.affected_rows,
    skipped: saveResult.skipped,
  });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
