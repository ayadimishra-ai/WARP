import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
    saveGHGFireExtinguisher,
    saveGHGIndustrialGas,
    saveGHGRefrigerantAndACSystems,
} from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
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
import { insertFugitiveTemplateData } from "@/modules/ghg/lib/organization-transaction/fugitive/fugitive-excel.service";
import {
    validateFugitiveExcelTemplate,
    validateFugitiveExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/fugitive/fugitive-excel.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { fugitiveActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
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

  // Validate User Permission
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    "fugitive"
  );

  // read excel data
  const data = await readDataFromURL(input.fileUrl);

  const { sheets: templateSheets } = fugitiveActivityConstant.excel_template;

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
    validateFugitiveExcelTemplate(excelData);

  if (!!validationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: validationErrors }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      fugitiveActivityConstant.code,
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
  let datavalidationerrors = await validateFugitiveExcelTemplateData(
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
      fugitiveActivityConstant.code,
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
    saveresponse = await insertFugitiveTemplateData(
      excelData,
      fugitiveActivityConstant.code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: fugitiveActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: excelData,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  saveGHGRefrigerantAndACSystems(
    saveresponse?.insert_GHGRefrigerantAndACSystems?.returning,
    userSession,
    saveresponse?.delete_GHGRefrigerantAndACSystems?.returning
  );

  saveGHGFireExtinguisher(
    saveresponse?.insert_GHGFireExtinguisher?.returning,
    userSession,
    saveresponse?.delete_GHGFireExtinguisher?.returning
  );

  saveGHGIndustrialGas(
    saveresponse?.insert_GHGIndustrialGas?.returning,
    userSession,
    saveresponse?.delete_GHGIndustrialGas?.returning
  );
  const unique_GHGRefrigeAndAC_TaskRequestId =
    saveresponse?.insert_GHGRefrigerantAndACSystems?.returning
      .map((items: Record<string, any>) => items.task_request_id)
      .filter(
        (item: any, index: any, self: any) =>
          index === self.findIndex((t: any) => t === item)
      ) as UUID[];
  const unique_GHGFireExtinguisher_TaskRequestId =
    saveresponse?.insert_GHGFireExtinguisher?.returning
      .map((items: Record<string, any>) => items.task_request_id)
      .filter(
        (item: any, index: any, self: any) =>
          index === self.findIndex((t: any) => t === item)
      ) as UUID[];
  const unique_GHGIndustrialGas_TaskRequestId =
    saveresponse?.insert_GHGIndustrialGas?.returning
      .map((items: Record<string, any>) => items.task_request_id)
      .filter(
        (item: any, index: any, self: any) =>
          index === self.findIndex((t: any) => t === item)
      ) as UUID[];
  const uniquetask_request_id: string[] = [];
  unique_GHGFireExtinguisher_TaskRequestId.forEach((item) => {
    uniquetask_request_id.push(item);
  });
  unique_GHGRefrigeAndAC_TaskRequestId.forEach((item) => {
    uniquetask_request_id.push(item);
  });
  unique_GHGIndustrialGas_TaskRequestId.forEach((item) => {
    uniquetask_request_id.push(item);
  });
  await calculateEmission(
    userSession?.organizationId,
    "fugitive_details",
    uniquetask_request_id.filter(
      (item: any, index: any, self: any) =>
        index === self.findIndex((t: any) => t === item)
    ) as string[]
  );
  const response: any = await saveEmissionDashboard(
    uniquetask_request_id.filter(
      (item: any, index: any, self: any) =>
        index === self.findIndex((t: any) => t === item)
    ) as string[],
    userSession?.organizationId
  );
  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(excelData);
    const yearMonthPairs = extractYearMonthPairsFromExcel(excelData);

    const historydata = await insertNewDataImportHistory(
      userSession,
      fugitiveActivityConstant.code,
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      fugitiveActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );

    // After successful data write — update summary cache
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "fugitive_details",
      monthYears: yearMonthPairs.map((d: any) => ({
        year: Number(d.year),
        month: String(d.month).toLowerCase(),
      })),
    }).catch((err) => console.error("[summary-cache] upsert failed:", err));
    return NextResponse.json({ success: true, data: historydata });
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
