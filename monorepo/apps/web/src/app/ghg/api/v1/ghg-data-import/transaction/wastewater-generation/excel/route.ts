import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGWasteWatergeneration } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
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
import { insertWaterWasteGenerationTemplateData } from "@/modules/ghg/lib/organization-transaction/wastewater-generation/wastewatergeneration.service";
import {
    validateWastewaterGenerationExcelTemplate,
    validateWastewaterGenerationExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/wastewater-generation/wastewatergeneration.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { WastewaterGenerationActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  const input = await ExcelApiBodySchema.parseAsync(await req.json());
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );
  const fileName = s3FileName ?? urlFileName;
  //Validate User Permission
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    "water"
  );
  // read excel data
  const data = await readDataFromURL(input.fileUrl);

  const { sheets: templateSheets } =
    WastewaterGenerationActivityConstant.excel_template;

  let excelData = templateSheets
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];
  //trim column names
  excelData = trimColumnNames(excelData);
  //trim column names
  // // Slice the data to keep only up to the last non-blank row
  excelData = trimtrailingblankrows(excelData);
  // validate template
  let validationErrors: Record<string, any>[] =
    validateWastewaterGenerationExcelTemplate(excelData);
  if (!!validationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: validationErrors }]
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      "wastewater_generation",
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
  //validateWaterExcelTemplateData
  let datavalidationerrors =
    await validateWastewaterGenerationExcelTemplateData(
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
      "wastewater_generation",
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

  ///duplicate validation
  ///duplicate validation
  //save data
  let saveresponse;
  try {
    saveresponse = await insertWaterWasteGenerationTemplateData(
      excelData,
      WastewaterGenerationActivityConstant.code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: WastewaterGenerationActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  saveGHGWasteWatergeneration(
    saveresponse?.insert_GHGWastewaterGeneration?.returning,
    userSession,
    saveresponse?.delete_GHGWastewaterGeneration?.returning
  );
  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);
    const yearMonthPairs = extractYearMonthPairsFromExcel(excelData);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "wastewater_generation",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      WastewaterGenerationActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );
    const taskRequestIds: string[] = [];
    // Iterate through the insert objects and extract task_request_id
    for (const key in saveresponse) {
      if (key.includes("insert") && saveresponse[key].returning) {
        saveresponse[key].returning.forEach((item: any) => {
          if (!taskRequestIds.includes(item.task_request_id)) {
            taskRequestIds.push(item.task_request_id);
          }
        });
      }
    }
    //this function is called to save fresh water consumption in kpiWaterConsumption table not to calculate emission
    // await saveEmissionDashboard(
    //   taskRequestIds,
    //   userSession?.organizationId,
    //   true
    // );

    // After successful data write — update summary cache
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "wastewater_generation",
      monthYears: yearMonthPairs.map((d: any) => ({
        year: Number(d.year),
        month: String(d.month).toLowerCase(),
      })),
    }).catch((err) => console.error("[summary-cache] upsert failed:", err));
    return NextResponse.json({ success: true, data: historyData });
  }
  //save data
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
