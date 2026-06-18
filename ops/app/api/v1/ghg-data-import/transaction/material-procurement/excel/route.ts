import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGMaterialProcurement } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { handleApprovalLockError } from "~/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "~/lib/data-import-history/extract-upload-period";
import {
    calculateEmission,
    emissionCalculationForBuyer,
    saveEmissionDashboard,
} from "~/lib/emission-calculation-engine/emisison-calculation.service";
import {
    ExcelApiBodySchema,
    extractYearMonthPairsFromExcel,
    readDataFromURL,
    TExcelSheet,
    trimColumnNames,
    trimtrailingblankrows,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import {
    generateAndUploadMissingWeightFile,
    RequiredMaterialDataFields,
    sendEmailForMissingMaterialWeight,
} from "~/lib/material-master/material-master.service";
import {
    saveMaterialProcurementSheetEntries,
    sendEmailForMaterial,
} from "~/lib/organization-transaction/material-procurement/material-procurement-excel.service";
import {
    validateExcelTemplate,
    validateExcelTemplateData,
} from "~/lib/organization-transaction/material-procurement/material-procurement-excel.validation";
import { calculatePCFEmission } from "~/lib/pcf-emission/pcf-emission.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { generateAndUploadMissingEmissionFactorsFile } from "~/lib/supplier-master/supplier-master.service";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { MaterialProcurementActivityConstant } from "~/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

//? Deployment steps on server
//? 1. Add this key "material_procurement_material_quantity_procured_uom" to "ActivityMaster" table
//? 2. Add new activity named "Material Procurement" in "Activity" table
//? 3. Modify columns based on latest "Material Procurement" sheet to "GHGMaterialProcurement" table
//? 4. Create table in "Click House" Db for audit log named "GHGMaterialProcurement"

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // Validate Request Body
  const input = await ExcelApiBodySchema.parseAsync(await req.json());

  // Validate User Permission
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    MaterialProcurementActivityConstant.parent_code
  );

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
    MaterialProcurementActivityConstant.excel_template;
  let excelData = templateSheets
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];
  // Trim column names
  excelData = trimColumnNames(excelData);
  // // Slice the data to keep only up to the last non-blank row
  excelData = trimtrailingblankrows(excelData);
  // Check Template validation
  let templateValidationErrors: Record<string, any>[] =
    validateExcelTemplate(excelData);

  if (!!templateValidationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateValidationErrors }]
    );

    // Data Import Log
    const historyData = await insertNewDataImportHistory(
      userSession,
      MaterialProcurementActivityConstant.code,
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

  // Validate Data
  let dataValidationErrors: Awaited<ReturnType<typeof validateExcelTemplateData>>;
  try {
    dataValidationErrors = await validateExcelTemplateData(
      excelData,
      userSession.organizationId as UUID
    );
  } catch (err) {
    // Use leaf activity code (not parent_code) so assertNoApprovalLock checks the correct activity ATR
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: MaterialProcurementActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  if (dataValidationErrors.length > 0) {
    const uploadResponseData = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrors
    );

    // Data Import Log
    const historyData = await insertNewDataImportHistory(
      userSession,
      MaterialProcurementActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      {
        file_url: uploadResponseData?.downloadUrl ?? "",
      },
      input.organizationAddressId
    );

    return NextResponse.json({ success: false, data: historyData });
  }

  // Data Insert
  let saveResponse;
  // Use leaf activity code (not parent_code) so assertNoApprovalLock checks the correct activity ATR
  try {
    saveResponse = await saveMaterialProcurementSheetEntries(
      excelData,
      MaterialProcurementActivityConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: MaterialProcurementActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  if (!!saveResponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);
    const yearMonthPairs = extractYearMonthPairsFromExcel(excelData);

    // Data Import Log
    const historyData = await insertNewDataImportHistory(
      userSession,
      MaterialProcurementActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      MaterialProcurementActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );

    // Emission Calculation
    const uniqueTaskRequestId =
      saveResponse?.insert_GHGMaterialProcurement?.returning
        .map((items: any) => items.task_request_id)
        .filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];

    const uniqueMaterial =
      saveResponse?.insert_GHGMaterialProcurement?.returning
        ?.map((items: any) => String(items.Material_Code))
        .filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t === item)
        );

    if (uniqueTaskRequestId.length > 0 && uniqueMaterial.length > 0) {
      await calculateEmission(
        userSession?.organizationId,
        "material_procurement",
        uniqueTaskRequestId,
        uniqueMaterial,
        input.organizationAddressId
      );
      const response: any = await saveEmissionDashboard(
        uniqueTaskRequestId,
        userSession?.organizationId
      );
    }

    // Audit Logs
    await saveGHGMaterialProcurement(
      saveResponse?.insert_GHGMaterialProcurement?.returning,
      userSession,
      saveResponse?.delete_GHGMaterialProcurement?.returning
    );
    //Emission Update for all buyers mapped to current supplier
    await emissionCalculationForBuyer({
      instanceOrgId: userSession?.organizationId as UUID,
      instanceTaskRequestIds: uniqueTaskRequestId,
    });

    // PCF Emission Calculation — only recalculate changed supplier+material combos
    const changedMaterialKeys =
      saveResponse?.insert_GHGMaterialProcurement?.returning
        ?.map((item: any) => ({
          supplier_code: sanitizeString.v4(String(item?.Supplier_Code || "")),
          buyer_material_code: sanitizeString.v4(
            String(item?.Material_Code || "")
          ),
        }))
        .filter(
          (item: any, index: number, self: any[]) =>
            index ===
            self.findIndex(
              (t) =>
                t.supplier_code === item?.supplier_code &&
                t.buyer_material_code === item?.buyer_material_code
            )
        );
    await calculatePCFEmission(
      userSession?.organizationId,
      uniqueTaskRequestId,
      userSession?.userId as UUID,
      changedMaterialKeys?.length > 0 ? changedMaterialKeys : undefined
    );

    //shoot email for new material added
    const objDownloadUrl = await generateAndUploadMissingEmissionFactorsFile(
      userSession,
      input.organizationAddressId
    );
    sendEmailForMaterial(
      userSession,
      typeof objDownloadUrl === "object" ? objDownloadUrl.downloadUrl : ""
    );

    const extractedData: RequiredMaterialDataFields[] =
      saveResponse?.insert_GHGMaterialProcurement?.returning?.map(
        (item: any) => ({
          year: item?.ActivityTaskRequest?.TaskRequest?.year ?? null,
          month: item?.ActivityTaskRequest?.TaskRequest?.month ?? null,
          organization_address_id: item.organization_address_id,
          task_request_id: item.task_request_id,
          activity_task_request_id: item.activity_task_request_id,
          Material_Procured: item.Material_Code,
          Material_ID: item.Material_Code,
          Material_Quantity_Procured: item.Material_Quantity_Procured,
          Material_Quantity_Procured_uom: item.Material_Quantity_Procured_uom,
        })
      ) ?? [];

    //Send Email for Missing Material Weight and UOM Conversion Factor
    if (uniqueMaterial.length > 0) {
      //Material Weight Missing for Count/Volume UOMs
      const downloadUrlMissingWeight = await generateAndUploadMissingWeightFile(
        userSession,
        uniqueMaterial,
        extractedData,
        "material_procurement_material_quantity_procured_uom"
      );
      if (
        !!downloadUrlMissingWeight &&
        downloadUrlMissingWeight.downloadUrl !== ""
      ) {
        const emailLogs = sendEmailForMissingMaterialWeight(
          userSession,
          downloadUrlMissingWeight.downloadUrl,
          "Material Procurement"
        );
      }

      //UOM Mismatch - Conversion Factor Not Available
      /*const downloadUrlMissingUOMConversion =
        await generateAndUploadMissingUOMConversionFile(
          userSession,
          uniqueMaterial,
          extractedData,
          "material_procurement_material_quantity_procured_uom",
          "Material Procurement"
        );
      if (
        !!downloadUrlMissingUOMConversion &&
        downloadUrlMissingUOMConversion.downloadUrl !== ""
      ) {
        const emailLogs = sendMaterialConversionFactorMissingEmail(
          userSession,
          downloadUrlMissingUOMConversion.downloadUrl
        );
      }*/
    }
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
