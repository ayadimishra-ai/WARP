import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveOrgSupplierMaster } from "~/lib/auditlog/auditlog.service";
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
import { saveSupplierMasterSheetEntries } from "~/lib/supplier-master/supplier-master-excel-enterprise-setup.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "~/lib/supplier-master/supplier-master-excel-enterprise-setup.validation";
import { SupplierMasterEnterpriseSetupActivityConstant } from "~/shared/constants/supplier-master-enterprise-setup-activity.constant";
import { isOrganizationAdmin } from "~/shared/constants/user-roles.constant";
import { CustomError } from "~/shared/error/custom-error";
import { uploadMasterDataErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  const cachedBody = Reflect.get(req as object, "__parsedJsonBody");
  const requestBody = cachedBody ?? (await req.clone().json());

  // Validate Request Body
  const input =
    await ExcelApiBodySchemaWithoutAddressId.parseAsync(requestBody);

  // Validate User Permission
  const isOrgAdmin = isOrganizationAdmin(userSession.userRole);
  if (!isOrgAdmin) {
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
    SupplierMasterEnterpriseSetupActivityConstant.excel_template;
  let excelData = templateSheets
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];
  // Trim column names
  excelData = trimColumnNames(excelData);
  // Slice the data to keep only up to the last non-blank row
  excelData = trimtrailingblankrows(excelData);
  // Check Template validation
  let templateValidationErrors: Record<string, any>[] =
    validateExcelTemplate(excelData);

  if (!!templateValidationErrors?.length) {
    const uploadResponse = await uploadMasterDataErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateValidationErrors }]
    );

    // Data Import Log
    const historyData = await insertMasterDataImportHistory(
      userSession,
      SupplierMasterEnterpriseSetupActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      {
        file_url: uploadResponse?.downloadUrl ?? "",
      },
      userSession?.organizationId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  // Validate Data
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

    // Data Import Log
    const historyData = await insertMasterDataImportHistory(
      userSession,
      SupplierMasterEnterpriseSetupActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      {
        file_url: uploadResponseData?.downloadUrl ?? "",
      },
      userSession?.organizationId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  // Data Insert
  const saveResponse = await saveSupplierMasterSheetEntries(
    excelData,
    userSession
  );

  if (!!saveResponse) {
    // Data Import Log
    const historyData = await insertMasterDataImportHistory(
      userSession,
      SupplierMasterEnterpriseSetupActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      userSession?.organizationId
    );

    // Audit Logs
    await saveOrgSupplierMaster(
      [
        ...(saveResponse?.insert_OrgSupplierMaster?.returning || []),
        ...(saveResponse?.update_OrgSupplierMaster_many?.returning || []),
      ],
      userSession
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
