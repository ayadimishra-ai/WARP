import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
    saveGHGEnergyConsumptionFuelPurchasedAuxiliary,
    saveGHGEnergyConsumptionFuelPurchasedGeneral,
    saveGHGEnergyConsumptionFuelPurchasedHeatingWater,
    saveGHGEnergyConsumptionFuelPurchasedTranspotation,
} from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
import {
    calculateEmission,
    emissionCalculationForBuyer,
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
import { getUserRole } from "@/modules/ghg/lib/op-database/op-service.server";
import { OPSOrgRole } from "@/modules/ghg/lib/op-database/types";
import { saveFuelPurchasedSheetEntries } from "@/modules/ghg/lib/organization-transaction/energy/energy-fuel-purchased.service";
import {
    validateExcelTemplate,
    validateExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/energy/energy-fuel-purchased.validation";
import { calculatePCFEmissionFromSupplierData } from "@/modules/ghg/lib/pcf-emission/pcf-emission.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { FuelPurchasedActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // validate request body
  const input = await ExcelApiBodySchema.parseAsync(await req.json());
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );
  const fileName = s3FileName ?? urlFileName;
  // read excel data

  // Validate User Permission
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    FuelPurchasedActivityConstant.parent_code
  );
  const sdk = await getGraphQlServerSDK();
  /// get AddressDetails
  const addressDetail = await sdk.getAddressDetail({
    organisationAddressId: input.organizationAddressId,
  });
  const data = await readDataFromURL(input.fileUrl);
  const { sheets: templateSheets } =
    FuelPurchasedActivityConstant.excel_template;
  let Exceldata = templateSheets
    .map((sheet) => {
      return data.find(
        (m) =>
          sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name) &&
          sheet.address_permissions.filter(
            (item) =>
              sanitizeString.v1(item.address_owership_type) ==
                sanitizeString.v1(
                  addressDetail.OrganizationAddress[0]?.Address
                    ?.ownership_type ?? ""
                ) &&
              sanitizeString.v1(item.address_type) ==
                sanitizeString.v1(
                  addressDetail.OrganizationAddress[0]?.Address?.type ?? ""
                )
          ).length > 0
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];
  // Trim column names
  Exceldata = trimColumnNames(Exceldata);
  // // Slice the data to keep only up to the last non-blank row
  Exceldata = trimtrailingblankrows(Exceldata);
  ///filter Excel sheet according to Location Access
  ///filter Excel sheet according to Location Access
  // Template validation
  let tempalteValidationErrros: Record<string, any>[] = validateExcelTemplate(
    Exceldata,
    addressDetail.OrganizationAddress[0]?.Address?.ownership_type ?? "",
    addressDetail.OrganizationAddress[0]?.Address?.type ?? ""
  );
  if (!!tempalteValidationErrros?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: tempalteValidationErrros }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "energy_fuel_purchased",
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
  //Get Role of the Organization ----> Buyer or Supplier
  const org_role = (await getUserRole(
    userSession.organizationId
  )) as keyof typeof OPSOrgRole;

  let dataValidationErrros: Awaited<ReturnType<typeof validateExcelTemplateData>>;
  try {
    dataValidationErrros = await validateExcelTemplateData(
      Exceldata,
      userSession.organizationId as UUID,
      input.organizationAddressId as UUID,
      org_role
    );
  } catch (err) {
    // Use leaf activity code (not parent_code) so assertNoApprovalLock checks the correct activity ATR
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: FuelPurchasedActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: Exceldata,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }
  // Data Validation
  if (dataValidationErrros.length > 0) {
    //validate Data
    const uploadResponsedata = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrros
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "energy_fuel_purchased",
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

  let saveresponse: any;
  // Use leaf activity code (not parent_code) so assertNoApprovalLock checks the correct activity ATR
  try {
    saveresponse = await saveFuelPurchasedSheetEntries(
      Exceldata,
      FuelPurchasedActivityConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: FuelPurchasedActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: Exceldata,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  saveGHGEnergyConsumptionFuelPurchasedGeneral(
    saveresponse?.response?.insert_GHGEnergyConsumption_FuelPurchased_General
      ?.returning,
    userSession,
    saveresponse?.response?.delete_GHGEnergyConsumption_FuelPurchased_General
      ?.returning
  );
  saveGHGEnergyConsumptionFuelPurchasedHeatingWater(
    saveresponse?.response
      ?.insert_GHGEnergyConsumption_FuelPurchased_HeatingWater?.returning,
    userSession,
    saveresponse?.response
      ?.delete_GHGEnergyConsumption_FuelPurchased_HeatingWater?.returning
  );
  saveGHGEnergyConsumptionFuelPurchasedAuxiliary(
    saveresponse?.response?.insert_GHGEnergyConsumption_FuelPurchased_Auxiliary
      ?.returning,
    userSession,
    saveresponse?.response?.delete_GHGEnergyConsumption_FuelPurchased_Auxiliary
      ?.returning
  );
  saveGHGEnergyConsumptionFuelPurchasedTranspotation(
    saveresponse?.fuelResponse
      ?.insert_GHGEnergyConsumption_FuelPurchased_Transportation?.returning,
    userSession,
    saveresponse?.fuelResponse
      ?.delete_GHGEnergyConsumption_FuelPurchased_Transportation?.returning
  );
  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(Exceldata);
    const yearMonthPairs = extractYearMonthPairsFromExcel(Exceldata);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "energy_fuel_purchased",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      FuelPurchasedActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );

    // Below code is for Emission Calculation
    const uniquegeneraltask_request_id =
      saveresponse.response.insert_GHGEnergyConsumption_FuelPurchased_General?.returning
        .map(
          (items: any) =>
            items.GHGEnergyConsumption_FuelPurchased?.task_request_id
        )
        .filter(
          (item: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];
    const uniqueheatingwatertask_request_id =
      saveresponse.response.insert_GHGEnergyConsumption_FuelPurchased_HeatingWater?.returning
        .map(
          (items: any) =>
            items.GHGEnergyConsumption_FuelPurchased?.task_request_id
        )
        .filter(
          (item: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];
    const uniqueauxiliarytask_request_id =
      saveresponse.response.insert_GHGEnergyConsumption_FuelPurchased_Auxiliary?.returning
        .map(
          (items: any) =>
            items.GHGEnergyConsumption_FuelPurchased?.task_request_id
        )
        .filter(
          (item: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];
    const uniquetranspotationtask_request_id =
      saveresponse.fuelResponse?.insert_GHGEnergyConsumption_FuelPurchased_Transportation?.returning
        .map((items: any) => items?.task_request_id)
        .filter(
          (item: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];

    const uniquetask_request_id: string[] = [];
    uniquegeneraltask_request_id.forEach((item) => {
      uniquetask_request_id.push(item);
    });
    uniqueheatingwatertask_request_id.forEach((item) => {
      uniquetask_request_id.push(item);
    });
    uniqueauxiliarytask_request_id.forEach((item) => {
      uniquetask_request_id.push(item);
    });
    uniquetranspotationtask_request_id.forEach((item) => {
      uniquetask_request_id.push(item);
    });
    await calculateEmission(
      userSession?.organizationId,
      "energy_fuel_purchased",
      uniquetask_request_id
    );
    //#region Save Emission Dashboard Data
    const response: any = await saveEmissionDashboard(
      uniquetask_request_id,
      userSession?.organizationId
    );
    //#endregion

    //#region save energy data
    // await saveEnergyData({
    //   organizationId: userSession?.organizationId,
    //   uniquetask_request_id: uniquetask_request_id,
    //   organizationAddressId: input.organizationAddressId,
    //   activity: "energy_fuel_purchased",
    //   insertFuelPurchasedGeneral:
    //     saveresponse?.response
    //       ?.insert_GHGEnergyConsumption_FuelPurchased_General?.returning,
    //   insertedHeatingWater:
    //     saveresponse?.response
    //       ?.insert_GHGEnergyConsumption_FuelPurchased_HeatingWater?.returning,
    //   insertedAuxiliary:
    //     saveresponse?.response
    //       ?.insert_GHGEnergyConsumption_FuelPurchased_Auxiliary?.returning,
    // });
    //#endregion

    //Emission Update for all buyers mapped to current supplier
    await emissionCalculationForBuyer({
      instanceOrgId: userSession?.organizationId as UUID,
      instanceTaskRequestIds: uniquetask_request_id as UUID[],
    });

    // PCF emission calculation for all buyers mapped to current supplier
    await calculatePCFEmissionFromSupplierData(
      userSession?.organizationId as UUID,
      uniquetask_request_id as UUID[],
      userSession?.userId as UUID
    );

    // After successful data write — update summary cache
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "energy_fuel_purchased",
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
