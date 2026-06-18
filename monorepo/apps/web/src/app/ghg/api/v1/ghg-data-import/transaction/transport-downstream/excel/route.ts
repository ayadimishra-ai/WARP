import { UUID } from "crypto";
import dayjs from "dayjs";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGTransportDownstream } from "@/modules/ghg/lib/auditlog/auditlog.service";
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
import { saveTransportdownstreamSheetEntries } from "@/modules/ghg/lib/organization-transaction/transport/transport-downstream-excel.service";
import {
    validateExcelTemplate,
    validateExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/transport/transport-downstream-excel.validation";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "@/modules/ghg/lib/user/user.validation";
import { TransportDownstreamExcelConstant } from "@/modules/ghg/shared/constants/activity.constant";
import { opsUserType } from "@/modules/ghg/shared/constants/input.constant";
import {
    uploadActivityErrorsExcelJsonSheets,
    uploadActivityFilesExcelJsonSheets,
} from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import {
    dynamicEmailHeader,
    sendEmailWithManipulateTemplate,
} from "@/modules/ghg/utils/email.util";
import { getFileNameFromS3FileUrl } from "@/modules/ghg/utils/file-storage/server.service";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

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
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    TransportDownstreamExcelConstant.parent_code
  );
  const data = await readDataFromURL(input.fileUrl);
  const { sheets: templateSheets } =
    TransportDownstreamExcelConstant.excel_template;
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
  // Template validation
  // Template validation
  let templateValidationErrors: Record<string, any>[] =
    validateExcelTemplate(excelData);

  if (!!templateValidationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateValidationErrors }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_downstream",
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
      input.organizationAddressId as UUID
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: TransportDownstreamExcelConstant.parent_code,
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

    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_downstream",
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
  let saveResponse;
  try {
    saveResponse = await saveTransportdownstreamSheetEntries(
      excelData,
      TransportDownstreamExcelConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: TransportDownstreamExcelConstant.code,
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
      "transport_downstream",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      TransportDownstreamExcelConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );
    let uniqueTask_request_id: UUID[] =
      saveResponse?.insert_GHGTransport_Downstream?.returning
        ?.flatMap((item: any) => item.task_request_id)
        .filter(
          (item: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];

    // Row Level Emission Calculation
    await calculateEmission(
      userSession?.organizationId,
      "transport_downstream",
      uniqueTask_request_id
    );

    // KPI/Dashboard Level Emission Calculation
    await saveEmissionDashboard(
      uniqueTask_request_id,
      userSession?.organizationId
    );

    // Audit Logs
    if (!!saveResponse) {
      saveGHGTransportDownstream(
        saveResponse.insert_GHGTransport_Downstream?.returning,
        userSession,
        saveResponse.delete_GHGTransport_Downstream?.returning
      );
      if (saveResponse?.MasterDataInserted?.length > 0) {
        const filedownLoadUrl = await uploadActivityFilesExcelJsonSheets(
          userSession,
          "Missing_SKU_Master_" +
            dayjs().format("YYYYMMDD_HHmmssSSS") +
            ".xlsx",
          saveResponse.MasterDataInserted,
          "sku-bom-uploads",
          true
        );
        const emailHeader = await dynamicEmailHeader(
          userSession.organizationId
        );
        await sendEmailWithManipulateTemplate(
          userSession,
          {
            fileUrl: filedownLoadUrl?.downloadUrl as string,
            userName: opsUserType?.OrganizationAdmin?.label,
            copyrightYear: new Date().getFullYear().toString(),
            HeaderContent: emailHeader,
          },
          "SKU_BOM_Weight_Email"
        );
      }
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
