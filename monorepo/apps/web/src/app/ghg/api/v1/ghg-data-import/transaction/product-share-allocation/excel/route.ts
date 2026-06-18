import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { UpsertProductShareAllocationMutation } from "@/modules/ghg/graphql/shared/types";
import { saveGHGProductShareAttribution } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { handleApprovalLockError } from "@/modules/ghg/lib/bulk-upload/bulk-upload-approval-error.handler";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import { extractUploadPeriod } from "@/modules/ghg/lib/data-import-history/extract-upload-period";
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
import { saveProductShareAllocationSheetEntries } from "@/modules/ghg/lib/organization-transaction/product-share-allocation/product-share-allocation-excel.service";
import {
    computeAllocationWarnings,
    validateExcelTemplate,
    validateExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/product-share-allocation/product-share-allocation-excel.validation";
import { calculatePCFEmissionFromSupplierData } from "@/modules/ghg/lib/pcf-emission/pcf-emission.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { ProductShareAllocationActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  try {
    // ✅ Read body ONLY once
    const body = await req.json();

    // ✅ Validate body
    const input = await ExcelApiBodySchema.parseAsync(body);

    await validateUserActivityAndOrganizationAddressPermissions(
      userSession,
      input.organizationAddressId,
      ProductShareAllocationActivityConstant.code
    );

    // Read Excel
    let data = await readDataFromURL(input.fileUrl);

    const urlFileName = getFilenameFromURL(input.fileUrl);
    const s3FileName = await getFileNameFromS3FileUrl(
      userSession.organizationId,
      input.fileUrl
    );

    const fileName = s3FileName ?? urlFileName;

    data = trimColumnNames(data);
    data = trimtrailingblankrows(data);

    const sheet =
      ProductShareAllocationActivityConstant.excel_template.sheets[0];

    const excelData = data
      .filter(
        (d) => sanitizeString.v1(d.sheetName) === sanitizeString.v1(sheet.name)
      )
      .filter(Boolean);

    const templateErrors = validateExcelTemplate(
      excelData.length ? excelData : data
    );

    if (templateErrors.length > 0) {
      const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
        userSession,
        fileName,
        [{ sheetName: "Error Data", data: templateErrors }]
      );

      const historyData = await insertNewDataImportHistory(
        userSession,
        ProductShareAllocationActivityConstant.code,
        "Excel",
        fileName,
        input.fileUrl,
        "failure",
        { file_url: uploadResponse?.downloadUrl ?? "" },
        input.organizationAddressId
      );

      return NextResponse.json({ success: false, data: historyData });
    }

    let dataErrors: Awaited<ReturnType<typeof validateExcelTemplateData>>;
    try {
      dataErrors = await validateExcelTemplateData(
        excelData,
        userSession.organizationId as UUID,
        input.organizationAddressId as UUID,
        new Date().getFullYear(),
        ""
      );
    } catch (err) {
      const lockResponse = await handleApprovalLockError(err, {
        userSession,
        fileName,
        fileUrl: input.fileUrl,
        activityCode: ProductShareAllocationActivityConstant.code,
        organizationAddressId: input.organizationAddressId,
        excelData: excelData as TExcelSheet[],
      });
      if (lockResponse) return lockResponse;
      throw err;
    }

    if (dataErrors.length > 0) {
      const uploadResponseData = await uploadActivityErrorsExcelJsonSheets(
        userSession,
        fileName,
        dataErrors
      );

      const historyData = await insertNewDataImportHistory(
        userSession,
        ProductShareAllocationActivityConstant.code,
        "Excel",
        fileName,
        input.fileUrl,
        "failure",
        { file_url: uploadResponseData?.downloadUrl ?? "" },
        input.organizationAddressId
      );

      return NextResponse.json({ success: false, data: historyData });
    }

    const warnings = computeAllocationWarnings(excelData);

    let saveResponse: UpsertProductShareAllocationMutation | null;
    try {
      saveResponse = await saveProductShareAllocationSheetEntries(
        excelData,
        input.organizationAddressId as UUID,
        userSession
      );
    } catch (err) {
      const lockResponse = await handleApprovalLockError(err, {
        userSession,
        fileName,
        fileUrl: input.fileUrl,
        activityCode: ProductShareAllocationActivityConstant.code,
        organizationAddressId: input.organizationAddressId,
        excelData: excelData as TExcelSheet[],
      });
      if (lockResponse) return lockResponse;
      throw err;
    }

    //Audit log for inserted and deleted records
    saveGHGProductShareAttribution(
      saveResponse?.insert_GHGProductShareAttribution?.returning,
      userSession,
      saveResponse?.delete_GHGProductShareAttribution?.returning
    );

    if (saveResponse) {
      const { months: uploadMonths, year: uploadYear } = extractUploadPeriod(
        excelData as TExcelSheet[]
      );
      const yearMonthPairs = extractYearMonthPairsFromExcel(excelData as TExcelSheet[]);

      const historyData = await insertNewDataImportHistory(
        userSession,
        ProductShareAllocationActivityConstant.code,
        "Excel",
        fileName,
        input.fileUrl,
        "successful",
        null,
        input.organizationAddressId,
        ProductShareAllocationActivityConstant.name,
        uploadMonths,
        uploadYear,
        yearMonthPairs
      );

      const uniqueTaskRequestIds =
        saveResponse?.insert_GHGProductShareAttribution?.returning
          .map((items: any) => items.task_request_id)
          .filter(
            (item: any, index: any, self: any) =>
              index === self.findIndex((t: any) => t === item)
          ) as UUID[];

      // PCF emission calculation for all buyers mapped to current supplier
      await calculatePCFEmissionFromSupplierData(
        userSession?.organizationId as UUID,
        uniqueTaskRequestIds as UUID[],
        userSession?.userId as UUID
      );

      // After successful data write — update summary cache
      upsertCacheForActivity({
        organizationId: userSession.organizationId,
        organizationAddressId: input.organizationAddressId,
        activityCode: "product_share_allocation",
        monthYears: yearMonthPairs.map((d: any) => ({
          year: Number(d.year),
          month: String(d.month).toLowerCase(),
        })),
      }).catch((err) => console.error("[summary-cache] upsert failed:", err));
      return NextResponse.json({
        success: true,
        data: historyData,
        warnings,
      });
    }

    return NextResponse.json({
      success: true,
      data: [],
      warnings,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { success: false, message: "Import failed" },
      { status: 500 }
    );
  }
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1,
    maxRequestCount: 30,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
