import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { saveGHGBuyerShare } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
import { emissionCalculationForBuyer } from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import {
    ExcelApiBodySchema,
    extractYearMonthPairsFromExcel,
    readDataFromURL,
    TExcelSheet,
    trimColumnNames,
    trimtrailingblankrows,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { saveBuyerShareAttributionSheetEntries } from "@/modules/ghg/lib/organization-transaction/buyer-share-attribution/buyer-share-attribution-excel.service";
import {
    validateExcelTemplate,
    validateExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/buyer-share-attribution/buyer-share-attribution-excel.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { BuyerShareAttributionActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

//? DB Changes Required for this Api
//? 1. Create new Table GHGBuyer_Share
//? 2. Add new activity "buyer_share" in "Activity" Table, also add in SPA side[connect with sonika]
//? 3. Add UoM which are not added in "UomMaster" like INR, USD, GBP and etc.
//? 4. Add new records for ByMass, ByVolume and ByRevenue in "ActivityMaster" Table
//? 5. Add Mapping Of Activity "OrganizationActivityMapping" and "UserOrganizationAddressMapping" Table
//? 6. Add "BuyerShareMethod" method like "by_mass", "by_volume", "by_revenue" and "by_number_of_units" to "Organization" Table

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // Validate Request Body
  const input = await ExcelApiBodySchema.parseAsync(await req.json());

  // Validate User Permission
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    BuyerShareAttributionActivityConstant.code
  );

  // Read Excel Data
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

  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: userSession.organizationId,
  });
  const orgMetaData = orgData?.Organization[0]?.metadata || [];
  const [metaData] = orgMetaData || [];
  const buyerShareMethod = metaData?.BuyerShareMethod || "";

  // Excel Sheet Validations
  const { sheets: templateSheets } =
    BuyerShareAttributionActivityConstant.excel_template;

  // Get the tabs from sheet note : guide and master tab's data ignored
  const excelData = templateSheets
    .filter((sheet) => {
      if (buyerShareMethod === "by_mass") {
        return sheet.code === "By_Mass" || sheet.code === "Total_Mass";
      }
      if (buyerShareMethod === "by_volume") {
        return sheet.code === "By_Volume" || sheet.code === "Total_Volume";
      }
      if (buyerShareMethod === "by_revenue") {
        return sheet.code === "By_Revenue" || sheet.code === "Total_Revenue";
      }
      if (buyerShareMethod === "by_number_of_units") {
        return (
          sheet.code === "By_Number_of_Units" ||
          sheet.code === "Total_Number_of_Units"
        );
      }
    })
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];

  // Check Template validation
  let templateValidationErrors: Record<string, any>[] = validateExcelTemplate(
    excelData,
    buyerShareMethod
  );

  // Upload excel file to s3 if excel sheet template has errors
  if (!!templateValidationErrors?.length) {
    // Upload File to S3
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateValidationErrors }]
    );

    // Insert data import log
    const historyData = await insertNewDataImportHistory(
      userSession,
      BuyerShareAttributionActivityConstant.code,
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

  let dataValidationErrors: Awaited<ReturnType<typeof validateExcelTemplateData>>;
  try {
    dataValidationErrors = await validateExcelTemplateData(
      excelData,
      userSession.organizationId as UUID,
      input.organizationAddressId as UUID,
      userSession.userId as UUID,
      orgData?.Organization[0]?.FinancialYearMonth,
      orgData?.Organization[0]?.Baselineyear,
      buyerShareMethod
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: BuyerShareAttributionActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  if (dataValidationErrors.length > 0) {
    // Upload File to S3
    const uploadResponseData = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrors
    );

    // Insert data import log
    const historyData = await insertNewDataImportHistory(
      userSession,
      BuyerShareAttributionActivityConstant.code,
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
  try {
    saveResponse = await saveBuyerShareAttributionSheetEntries(
      excelData,
      BuyerShareAttributionActivityConstant.code,
      input.organizationAddressId as UUID,
      userSession,
      buyerShareMethod
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: BuyerShareAttributionActivityConstant.code,
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

    const historyData = await insertNewDataImportHistory(
      userSession,
      BuyerShareAttributionActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      BuyerShareAttributionActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );
    // Audit Logs
    await saveGHGBuyerShare(
      saveResponse?.insert_GHGBuyer_Share?.returning,
      userSession,
      saveResponse?.delete_GHGBuyer_Share?.returning
    );
    //Emission Update for all buyers mapped to current supplier
    await emissionCalculationForBuyer({
      instanceOrgId: userSession?.organizationId as UUID,
      instanceTaskRequestIds:
        saveResponse?.insert_GHGBuyer_Share?.returning.map(
          (gbs) => gbs.task_request_id
        ),
    });
    // After successful data write — update summary cache
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "buyer_share",
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
