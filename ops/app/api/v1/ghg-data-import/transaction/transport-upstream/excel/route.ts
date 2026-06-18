import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGTransportUpstream } from "~/lib/auditlog/auditlog.service";
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
  saveTransportupstreamSheetEntries,
  sendEmailForUpstream,
} from "~/lib/organization-transaction/transport/transport-upstream-excel.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "~/lib/organization-transaction/transport/transport-upstream-excel.validation";
import { calculatePCFEmission } from "~/lib/pcf-emission/pcf-emission.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { generateAndUploadMissingEmissionFactorsFile } from "~/lib/supplier-master/supplier-master.service";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import {
  TransportUpstreamExcelActivityConstant,
  TTransportUpstreamActivitySheetColumnNames,
} from "~/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
// import { sendNotificationToSuppliersWithouData } from "~/shared/services/notification.service";
import {
  generateAndUploadMissingWeightFile,
  RequiredMaterialDataFields,
  sendEmailForMissingMaterialWeight,
} from "~/lib/material-master/material-master.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // Read the body once
  const body = await req.json();

  // Validate the request body
  const input = await ExcelApiBodySchema.parseAsync(body);

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
    TransportUpstreamExcelActivityConstant.parent_code
  );
  const data = await readDataFromURL(input.fileUrl);
  const { sheets: templateSheets } =
    TransportUpstreamExcelActivityConstant.excel_template;

  let Exceldata = templateSheets
    .map((sheet) => {
      const _sheet = data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
      // _sheet?.sheetName != undefined ? _sheet?.sheetName.trim() : "";

      if (!!_sheet?.data) {
        _sheet.data = _sheet?.data.map(
          (m: Record<TTransportUpstreamActivitySheetColumnNames, any>) => {
            if (m["Supplier code"])
              m["Supplier code"] = m["Supplier code"]?.toString()?.trim();
            if (m["Material Procured Code"])
              m["Material Procured Code"] = m["Material Procured Code"].toString().trim();
            return m;
          }
        ) as Record<string, any>[];

        return _sheet;
      }
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];

  // Trim column names
  Exceldata = trimColumnNames(Exceldata);
  // // Slice the data to keep only up to the last non-blank row
  Exceldata = trimtrailingblankrows(Exceldata);
  // Template validation
  let tempalteValidationErrros: Record<string, any>[] =
    validateExcelTemplate(Exceldata);

  if (!!tempalteValidationErrros?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: tempalteValidationErrros }]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_upstream",
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
  // Data Validation
  let dataValidationErrros: Awaited<ReturnType<typeof validateExcelTemplateData>>;
  try {
    dataValidationErrros = await validateExcelTemplateData(
      Exceldata,
      userSession.organizationId as UUID,
      input.organizationAddressId as UUID
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: TransportUpstreamExcelActivityConstant.parent_code,
      organizationAddressId: input.organizationAddressId,
      excelData: Exceldata,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  if (dataValidationErrros.length > 0) {
    //validate Data
    const uploadResponsedata = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrros
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_upstream",
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

  // service method call
  let saveResponse;
  try {
    saveResponse = await saveTransportupstreamSheetEntries(
      Exceldata,
      TransportUpstreamExcelActivityConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: TransportUpstreamExcelActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: Exceldata,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  //this is used for emission calculation
  if (!!saveResponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(Exceldata);
    const yearMonthPairs = extractYearMonthPairsFromExcel(Exceldata);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_upstream",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      TransportUpstreamExcelActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );

    let uniqueTaskRequestIds: UUID[] =
      saveResponse?.insert_GHGTransport_Upstream?.returning
        ?.flatMap((item: any) => item.task_request_id)
        .filter(
          (item: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];

    await calculateEmission(
      userSession?.organizationId,
      "transport_upstream",
      uniqueTaskRequestIds
    );

    await saveEmissionDashboard(
      uniqueTaskRequestIds,
      userSession?.organizationId
    );

    //Audit Log Service call
    // const config = await getConfig(userSession.organizationId);
    await saveGHGTransportUpstream(
      saveResponse?.insert_GHGTransport_Upstream?.returning,
      userSession,
      saveResponse?.delete_GHGTransport_Upstream?.returning
    );

    //Emission Update for all buyers mapped to current supplier
    await emissionCalculationForBuyer({
      instanceOrgId: userSession?.organizationId as UUID,
      instanceTaskRequestIds: uniqueTaskRequestIds as UUID[],
    });

    // PCF Emission Calculation — only recalculate changed supplier+material combos
    const changedMaterialKeys =
      saveResponse?.insert_GHGTransport_Upstream?.returning
        ?.map((item: any) => ({
          supplier_code: sanitizeString.v4(String(item?.Supplier_code || "")),
          buyer_material_code: sanitizeString.v4(
            String(item?.Material_ID || "")
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
      uniqueTaskRequestIds,
      userSession?.userId as UUID,
      changedMaterialKeys?.length > 0 ? changedMaterialKeys : undefined
    );

    //shoot email for new material added
    const objDownloadUrl = await generateAndUploadMissingEmissionFactorsFile(
      userSession,
      input.organizationAddressId
    );
    sendEmailForUpstream(
      userSession,
      typeof objDownloadUrl === "object" ? objDownloadUrl.downloadUrl : ""
    );

    const extractedData: RequiredMaterialDataFields[] =
      saveResponse?.insert_GHGTransport_Upstream?.returning?.map(
        (item: any) => ({
          year: item?.ActivityTaskRequest?.TaskRequest?.year ?? null,
          month: item?.ActivityTaskRequest?.TaskRequest?.month ?? null,
          organization_address_id: item.organization_address_id,
          task_request_id: item.task_request_id,
          activity_task_request_id: item.activity_task_request_id,
          Material_Procured: item.Material_Procured,
          Material_ID: item.Material_ID,
          Material_Quantity_Procured: item.Material_Quantity_Procured,
          Material_Quantity_Procured_uom: item.Material_Quantity_Procured_uom,
        })
      ) ?? [];

    const uniqueMaterial = saveResponse?.insert_GHGTransport_Upstream?.returning
      ?.map((items: any) => String(items.Material_ID))
      .filter(
        (item: any, index: any, self: any) =>
          index === self.findIndex((t: any) => t === item)
      );

    if (uniqueMaterial.length > 0) {
      //Material Weight Missing for Count/Volume UOMs
      const downloadUrlMissingWeight = await generateAndUploadMissingWeightFile(
        userSession,
        uniqueMaterial,
        extractedData,
        "transport_upstream_Material_Quantity_Procured_UOM"
      );

      if (
        !!downloadUrlMissingWeight &&
        downloadUrlMissingWeight.downloadUrl !== ""
      ) {
        const emailLogs = sendEmailForMissingMaterialWeight(
          userSession,
          downloadUrlMissingWeight.downloadUrl,
          "Upstream Transport"
        );
      }
    }

    //! Don't uncomment below code for UOM Mismatch
    //Send Email for UOM Mismatch - Conversion Factor Not Available
    // const downloadUrlMissingUOMConversion =
    //   await generateAndUploadMissingUOMConversionFile(
    //     userSession,
    //     uniqueMaterial,
    //     extractedData,
    //     "transport_upstream_Material_Quantity_Procured_UOM",
    //     "Upstream Transport"
    //   );
    // if (
    //   !!downloadUrlMissingUOMConversion &&
    //   downloadUrlMissingUOMConversion.downloadUrl !== ""
    // ) {
    //   const emailLogs = sendMaterialConversionFactorMissingEmail(
    //     userSession,
    //     downloadUrlMissingUOMConversion.downloadUrl
    //   );
    // }
    // }

    //==================================================================================================
    // Below Code is for Send Notification
    // let sheetData: any = saveResponse
    //   ?.flatMap(
    //     (response: any) =>
    //       response?.insert_GHGTransport_Upstream?.returning?.map(
    //         (item: any) => ({
    //           supplierCode: item.Supplier_code,
    //           month: item.ActivityTaskRequest.TaskRequest.month,
    //           year: item.ActivityTaskRequest.TaskRequest.year,
    //           pincode: item.Location_pin_or_zip_code,
    //         })
    //       ) || []
    //   )
    // let sheetData: any =
    //   saveResponse?.insert_GHGTransport_Upstream?.returning?.map(
    //     (item: any) => ({
    //       supplierCode: item.Supplier_code,
    //       month: item.ActivityTaskRequest.TaskRequest.month,
    //       year: item.ActivityTaskRequest.TaskRequest.year,
    //       pincode: item.Location_pin_or_zip_code,
    //     })
    //   ) ||
    //   [].filter(
    //     (item: any, index: number, self: any) =>
    //       index ===
    //       self.findIndex(
    //         (t: any) =>
    //           t.supplierCode === item.supplierCode &&
    //           t.month === item.month &&
    //           t.year === item.year &&
    //           t.pincode === item.pincode
    //       )
    //   );

    // await sendNotificationToSuppliersWithouData(
    //   userSession?.organizationId,
    //   sheetData
    // );

    return NextResponse.json({ success: true, data: historyData });
  } else {
    return NextResponse.json({ success: false, data: saveResponse });
  }
}
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
