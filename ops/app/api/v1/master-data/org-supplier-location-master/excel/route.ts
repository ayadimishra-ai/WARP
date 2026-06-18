import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  saveAddresses,
  saveSupplierAddressMapping,
} from "~/lib/auditlog/auditlog.service";
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
import { saveSupplierLocationMasterSheetEntries } from "~/lib/supplier-location-master/supplier-location-master-excel.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "~/lib/supplier-location-master/supplier-location-master-excel.validation";
import { SupplierLocationMasterActivityConstant } from "~/shared/constants/supplier-location-master-activity.constant";
import { isOrganizationAdmin } from "~/shared/constants/user-roles.constant";
import { CustomError } from "~/shared/error/custom-error";
import { uploadMasterDataErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // Validate Request Body
  const input = await ExcelApiBodySchemaWithoutAddressId.parseAsync(
    await req.json()
  );

  // Validate User Permission
  if (!isOrganizationAdmin(userSession.userRole)) {
    throw CustomError({ statusCode: 401, message: "Permission denied" });
  }

  // Read Excel Data
  const data = await readDataFromURL(input.fileUrl);
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );
  const fileName = s3FileName ?? urlFileName;

  // Excel Sheet Validations
  const { sheets: templateSheets } =
    SupplierLocationMasterActivityConstant.excel_template;

  let excelData = templateSheets
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];

  excelData = trimColumnNames(excelData);
  excelData = trimtrailingblankrows(excelData);

  // Check Template validation
  const templateValidationErrors = validateExcelTemplate(excelData);

  if (templateValidationErrors.length > 0) {
    const uploadResponse = await uploadMasterDataErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateValidationErrors }]
    );

    const historyData = await insertMasterDataImportHistory(
      userSession,
      SupplierLocationMasterActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      { file_url: uploadResponse?.downloadUrl ?? "" },
      userSession.organizationId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  // Validate Data (Zod + DB checks)
  const dataValidationErrors = await validateExcelTemplateData(
    excelData,
    userSession.organizationId as UUID
  );

  if (dataValidationErrors.length > 0) {
    const uploadResponseData = await uploadMasterDataErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrors
    );

    const historyData = await insertMasterDataImportHistory(
      userSession,
      SupplierLocationMasterActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      { file_url: uploadResponseData?.downloadUrl ?? "" },
      userSession.organizationId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  // Data Insert
  const saveResponse = await saveSupplierLocationMasterSheetEntries(
    excelData,
    userSession
  );

  if (saveResponse && saveResponse.affected_rows > 0) {
    const historyData = await insertMasterDataImportHistory(
      userSession,
      SupplierLocationMasterActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      userSession.organizationId
    );

    // Audit Logs
    await saveAddresses(saveResponse.addressData, userSession);
    await saveSupplierAddressMapping(saveResponse.mappingData, userSession);

    return NextResponse.json({ success: true, data: historyData });
  }

  return NextResponse.json({ success: true, data: [] });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
