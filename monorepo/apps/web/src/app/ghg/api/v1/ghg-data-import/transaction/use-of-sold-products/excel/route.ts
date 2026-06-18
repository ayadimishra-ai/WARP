import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  saveGHGUseOfSoldProductsElectricity,
  saveGHGUseOfSoldProductsFuel,
  saveGHGUseOfSoldProductsRefrigerant,
} from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
import {
  calculateEmission,
  saveEmissionDashboard,
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import {
  ExcelApiBodySchema,
  TExcelSheet,
  extractYearMonthPairsFromExcel,
  readDataFromURL,
  trimColumnNames,
  trimtrailingblankrows,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import {
  generateAndUploadMissingEmissionFactorsFileForUseOfSoldProducts,
  sendEmailForMissingUseOfSoldProductsEmissionFactors,
} from "@/modules/ghg/lib/organization-transaction/use-of-sold-products/use-of-sold-products-missing-emission-factors.service";
import { saveUseOfSoldProductsSheetEntries } from "@/modules/ghg/lib/organization-transaction/use-of-sold-products/use-of-sold-products.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/use-of-sold-products/use-of-sold-products.validation";
import { saveProductMasterBulk } from "@/modules/ghg/lib/product-master/product-master.service";
// import { calculatePCFEmissionFromSupplierData } from "@/modules/ghg/lib/pcf-emission/pcf-emission.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { UseOfSoldProductsConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  const input = await ExcelApiBodySchema.parseAsync(await req.json());
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );
  const fileName = s3FileName ?? urlFileName;

  // 1. Validate user permissions
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    UseOfSoldProductsConstant.parent_code
  );

  // 2. Read Excel data from S3
  const data = await readDataFromURL(input.fileUrl);

  // 3. Match sheets by name
  const { sheets: templateSheets } = UseOfSoldProductsConstant.excel_template;
  let excelData = templateSheets
    .map((sheet) =>
      data.find(
        (m) => sanitizeString.v4(m.sheetName) === sanitizeString.v4(sheet.name)
      )
    )
    .filter((sheet) => !!sheet) as TExcelSheet[];

  // 4. Trim columns & trailing blank rows
  excelData = trimColumnNames(excelData);
  excelData = trimtrailingblankrows(excelData);

  // 5. Template validation
  const templateValidationErrors = validateExcelTemplate(excelData);
  if (templateValidationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateValidationErrors }]
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      "use_of_sold_products",
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      { file_url: uploadResponse?.downloadUrl ?? "" },
      input.organizationAddressId
    );
    return NextResponse.json({ success: false, data: historyData });
  }

  // 6. Data validation
  const dataValidationErrors = await validateExcelTemplateData(
    excelData,
    userSession,
    input.organizationAddressId as UUID,
    false
  );
  if (dataValidationErrors.length > 0) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrors
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      "use_of_sold_products",
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      { file_url: uploadResponse?.downloadUrl ?? "" },
      input.organizationAddressId
    );
    return NextResponse.json({ success: false, data: historyData });
  }

  // 7. Ease of Product Master Data Onboarding
  // Extract product codes from all 3 sheets and create missing product master entries
  const allProductCodes = excelData.flatMap((sheet) =>
    sheet.data
      .filter((row) => !!row["Product Code"])
      .map((row) => String(row["Product Code"]))
  );
  await saveProductMasterBulk(userSession, allProductCodes);

  // 8. Save entries
  const saveResponse = await saveUseOfSoldProductsSheetEntries(
    excelData,
    UseOfSoldProductsConstant.parent_code,
    input.organizationAddressId as UUID,
    userSession
  );

  if (saveResponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);
    const yearMonthPairs = extractYearMonthPairsFromExcel(excelData);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "use_of_sold_products",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      UseOfSoldProductsConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );

    // 9. Emission calculation
    const uniqueTaskRequestIds = [
      ...(saveResponse?.insert_GHGUseOfSoldProducts_Fuel?.returning ?? []),
      ...(saveResponse?.insert_GHGUseOfSoldProducts_Electricity?.returning ??
        []),
      ...(saveResponse?.insert_GHGUseOfSoldProducts_Refrigerant?.returning ??
        []),
    ]
      .map((item: any) => item.task_request_id)
      .filter(
        (item: any, index: any, self: any) =>
          index === self.findIndex((t: any) => t === item)
      ) as UUID[];

    await calculateEmission(
      userSession?.organizationId,
      "use_of_sold_products",
      uniqueTaskRequestIds
    );

    await saveEmissionDashboard(
      uniqueTaskRequestIds,
      userSession?.organizationId
    );

    // 10. Audit Logs
    saveGHGUseOfSoldProductsFuel(
      saveResponse?.insert_GHGUseOfSoldProducts_Fuel?.returning,
      userSession,
      saveResponse?.delete_GHGUseOfSoldProducts_Fuel?.returning
    );
    saveGHGUseOfSoldProductsElectricity(
      saveResponse?.insert_GHGUseOfSoldProducts_Electricity?.returning,
      userSession,
      saveResponse?.delete_GHGUseOfSoldProducts_Electricity?.returning
    );
    saveGHGUseOfSoldProductsRefrigerant(
      saveResponse?.insert_GHGUseOfSoldProducts_Refrigerant?.returning,
      userSession,
      saveResponse?.delete_GHGUseOfSoldProducts_Refrigerant?.returning
    );

    // 11. Notify about missing electricity emission factors (Electricity sheet – Region)
    //shoot email for missing emission factors only when missing factors exist
    const objDownloadUrl =
      await generateAndUploadMissingEmissionFactorsFileForUseOfSoldProducts(
        userSession
      );
    if (typeof objDownloadUrl === "object") {
      sendEmailForMissingUseOfSoldProductsEmissionFactors(
        userSession,
        objDownloadUrl.downloadUrl
      );
    }

    // ! Note : Not needed for Use of Sold Products
    // await saveEnergyData({
    //   organizationId: userSession?.organizationId,
    //   uniquetask_request_id: uniqueTaskRequestIds,
    //   organizationAddressId: input.organizationAddressId,
    //   activity: "use_of_sold_products",
    // });

    // ! Note : Buyer & PCF Calculation is not needed for Use of Sold Products as it is out of scope for PCF.
    // 9. Buyer & PCF recalculation
    // await emissionCalculationForBuyer({
    //   instanceOrgId: userSession?.organizationId as UUID,
    //   instanceTaskRequestIds: uniqueTaskRequestIds as UUID[],
    // });

    // await calculatePCFEmissionFromSupplierData(
    //   userSession?.organizationId as UUID,
    //   uniqueTaskRequestIds as UUID[],
    //   userSession?.userId as UUID
    // );

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
