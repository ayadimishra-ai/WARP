import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveOrgMaterialMaster } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  ExcelApiBodySchemaWithoutAddressId,
  readDataFromURL,
  TExcelSheet,
  trimColumnNames,
  trimtrailingblankrows,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { insertMasterDataImportHistory } from "@/modules/ghg/lib/master-data-import-history/master-data-import-history.service";
import { initiatePCFEmissionProcessingForMaterials, saveMaterialMasterSheetEntries } from "@/modules/ghg/lib/material-master/material-master-excel.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "@/modules/ghg/lib/material-master/material-master-excel.validation";
import {
  sendEmailForMaterialUoMMismatch,
  sendEmailForMissingWeightInMaterialMaster,
} from "@/modules/ghg/lib/material-master/material-master.service";
import { resetEmissionsForUoMMismatch } from "@/modules/ghg/lib/material-master/reset-emissions-on-uom-mismatch.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { TActivityCodes } from "@/modules/ghg/shared/constants/activity.constant";
import { MaterialMasterActivityConstant } from "@/modules/ghg/shared/constants/material-master-activity.constant";
import { isOrganizationAdmin } from "@/modules/ghg/shared/constants/user-roles.constant";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";
import { uploadMasterDataErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { saveEmailLog } from "@/modules/ghg/utils/email.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // Validate Request Body
  const input = await ExcelApiBodySchemaWithoutAddressId.parseAsync(
    await req.json()
  );

  // Validate User Permission
  const isOrgAdmin = isOrganizationAdmin(userSession.userRole);
  if (!isOrgAdmin) {
    throw CustomError({
      statusCode: 401,
      message:
        "Permission denied: Only Organization Admins can perform this action",
    });
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
    MaterialMasterActivityConstant.excel_template;
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

    const totalRows = excelData[0]?.data?.length || 0;

    // Data Import Log with summary
    const historyData = await insertMasterDataImportHistory(
      userSession,
      MaterialMasterActivityConstant.code as TActivityCodes,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      {
        file_url: uploadResponse?.downloadUrl ?? "",
        summary: {
          total_rows: totalRows,
          rows_added: 0,
          rows_updated: 0,
          rows_failed: templateValidationErrors.length,
          uom_mismatches: 0,
          missing_weights: 0,
        },
      },
      userSession?.organizationId
    );

    return NextResponse.json({
      success: false,
      data: historyData,
    });
  }

  // Validate Data
  const dataValidationResult = await validateExcelTemplateData(
    excelData,
    userSession.organizationId as UUID
  );

  if (dataValidationResult.errors.length > 0) {
    const uploadResponseData = await uploadMasterDataErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationResult.errors as any
    );

    // Count total failed rows from all error sheets
    const totalFailedRows = (dataValidationResult.errors as any[]).reduce(
      (sum: number, errorSheet: any) => sum + (errorSheet.data?.length || 0),
      0
    );

    const totalRows = excelData[0]?.data?.length || 0;

    // Data Import Log with summary
    const historyData = await insertMasterDataImportHistory(
      userSession,
      MaterialMasterActivityConstant.code as TActivityCodes,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      {
        file_url: uploadResponseData?.downloadUrl ?? "",
        summary: {
          total_rows: totalRows,
          rows_added: 0,
          rows_updated: 0,
          rows_failed: totalFailedRows,
          uom_mismatches: dataValidationResult.context.uomMismatches.length,
          missing_weights:
            dataValidationResult.context.missingWeightNotifications.length,
        },
      },
      userSession?.organizationId
    );

    return NextResponse.json({
      success: false,
      data: historyData,
    });
  }

  // Data Insert/Update
  const saveResponse = await saveMaterialMasterSheetEntries(
    excelData,
    userSession,
    dataValidationResult.context
  );

  if (!!saveResponse) {
    // Prepare notifications
    const notifications = {
      uomMismatches: dataValidationResult.context.uomMismatches,
      missingWeights: dataValidationResult.context.missingWeightNotifications,
    };

    let allEmailLogs: any[] = [];

    // ============================================================================
    // Reset Emissions for UoM Mismatch (Scenario C)
    // ============================================================================
    // When Material Master UoM is updated and differs from activity data UoM,
    // we set emission values to 0 for all affected activity records.
    // Emissions will be recalculated once activity data is corrected with new UoM.
    let emissionResetSummary = null;

    if (notifications.uomMismatches.length > 0) {
      const materialCodesWithMismatch = notifications.uomMismatches.map(
        (m) => m.materialCode
      );

      emissionResetSummary = await resetEmissionsForUoMMismatch(
        materialCodesWithMismatch,
        userSession.organizationId as UUID
      );
    }

    // ============================================================================
    // Send Email Notifications
    // ============================================================================

    // 1. UoM Mismatch Notifications (Consolidated)
    if (notifications.uomMismatches.length > 0) {
      // Send email with inline material details
      const emailLogs = await sendEmailForMaterialUoMMismatch(
        userSession,
        notifications.uomMismatches
      );
      allEmailLogs.push(...emailLogs);
    }

    // 2. Missing Weight Notifications (Consolidated)
    if (notifications.missingWeights.length > 0) {
      // Send email with inline material details
      const emailLogs = await sendEmailForMissingWeightInMaterialMaster(
        userSession,
        notifications.missingWeights
      );
      allEmailLogs.push(...emailLogs);
    }

    // Save email logs to database
    if (allEmailLogs.length > 0) {
      await saveEmailLog(allEmailLogs);
    }

    // ============================================================================
    // Data Import Log with summary
    // ============================================================================
    const historyData = await insertMasterDataImportHistory(
      userSession,
      MaterialMasterActivityConstant.code as TActivityCodes,
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      {
        summary: {
          total_rows: excelData[0]?.data?.length || 0,
          rows_added:
            saveResponse?.insert_OrgMaterialMaster?.returning?.length || 0,
          rows_updated:
            saveResponse?.update_OrgMaterialMaster_many?.returning?.length || 0,
          uom_mismatches: notifications.uomMismatches.length,
          missing_weights: notifications.missingWeights.length,
          emission_reset: emissionResetSummary
            ? {
                total_records_affected:
                  emissionResetSummary.totalRecordsAffected,
                capital_goods: emissionResetSummary.capitalGoods,
                material_procurement: emissionResetSummary.materialProcurement,
                transport_upstream: emissionResetSummary.transportUpstream,
              }
            : null,
        },
      },
      userSession?.organizationId
    );

    //Add Audit Logs if needed
    await saveOrgMaterialMaster(
      [
        ...(saveResponse?.insert_OrgMaterialMaster?.returning || []),
        ...(saveResponse?.update_OrgMaterialMaster_many?.returning || []),
      ],
      userSession
    );

    await initiatePCFEmissionProcessingForMaterials(saveResponse, userSession)

    return NextResponse.json({
      success: true,
      data: historyData,
      notifications: {
        uomMismatches: notifications.uomMismatches.length > 0,
        missingWeights: notifications.missingWeights.length > 0,
      },
    });
  } else {
    throw CustomError({
      statusCode: 400,
      message: "No data to import",
    });
  }
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
