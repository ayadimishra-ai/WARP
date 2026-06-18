import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import {
  saveGHGEnergyCaptivePowerNonRenewable,
  saveGHGEnergyCaptivePowerRenewable,
} from "~/lib/auditlog/auditlog.service";
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
  TExcelSheet,
  extractYearMonthPairsFromExcel,
  readDataFromURL,
  trimColumnNames,
  trimtrailingblankrows,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { saveCaptivePowerSheetEntries } from "~/lib/organization-transaction/energy/energy-captive-power.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "~/lib/organization-transaction/energy/energy-captive-power.validation";
import { calculatePCFEmissionFromSupplierData } from "~/lib/pcf-emission/pcf-emission.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { CaptiveActivityConstant } from "~/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

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
    CaptiveActivityConstant.parent_code
  );
  const data = await readDataFromURL(input.fileUrl);
  const { sheets: templateSheets } = CaptiveActivityConstant.excel_template;
  let Exceldata = templateSheets
    .map((sheet) => {
      return data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
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
      "energy_captive_power",
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
  let dataValidationErrros: Awaited<
    ReturnType<typeof validateExcelTemplateData>
  >;
  try {
    dataValidationErrros = await validateExcelTemplateData(
      Exceldata,
      userSession.organizationId as UUID,
      input.organizationAddressId as UUID,
      false
    );
  } catch (err) {
    // Use leaf activity code (not parent_code) so assertNoApprovalLock checks the correct activity ATR
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: CaptiveActivityConstant.code,
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
      "energy_captive_power",
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
  // Use leaf activity code (not parent_code) so assertNoApprovalLock checks the correct activity ATR
  try {
    saveresponse = await saveCaptivePowerSheetEntries(
      Exceldata,
      CaptiveActivityConstant.parent_code,
      input.organizationAddressId as UUID,
      userSession
    );
  } catch (err) {
    const lockResponse = await handleApprovalLockError(err, {
      userSession,
      fileName,
      fileUrl: input.fileUrl,
      activityCode: CaptiveActivityConstant.code,
      organizationAddressId: input.organizationAddressId,
      excelData: Exceldata,
    });
    if (lockResponse) return lockResponse;
    throw err;
  }

  saveGHGEnergyCaptivePowerNonRenewable(
    saveresponse?.insert_GHGEnergy_CaptivePower_NonRenewable?.returning,
    userSession,
    saveresponse?.delete_GHGEnergy_CaptivePower_NonRenewable?.returning
  );
  //captive power renewable audit log save
  saveGHGEnergyCaptivePowerRenewable(
    saveresponse?.insert_GHGEnergy_CaptivePower_Renewable?.returning,
    userSession,
    saveresponse?.delete_GHGEnergy_CaptivePower_Renewable?.returning
  );

  if (!!saveresponse) {
    const { months: uploadMonths, year: uploadYear } =
      extractUploadPeriod(Exceldata);
    const yearMonthPairs = extractYearMonthPairsFromExcel(Exceldata);

    const historyData = await insertNewDataImportHistory(
      userSession,
      "energy_captive_power",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId,
      CaptiveActivityConstant.name,
      uploadMonths,
      uploadYear,
      yearMonthPairs
    );

    // Below code is for emission calculation
    const uniquerenewabletask_request_id =
      saveresponse.insert_GHGEnergy_CaptivePower_Renewable?.returning
        .map((items) => items.GHGEnergy_CaptivePower?.task_request_id)
        .filter(
          (item, index, self) => index === self.findIndex((t) => t === item)
        ) as UUID[];
    const uniquenonrenewabletask_request_id =
      saveresponse.insert_GHGEnergy_CaptivePower_NonRenewable?.returning
        .map((items) => items.GHGEnergy_CaptivePower?.task_request_id)
        .filter(
          (item, index, self) => index === self.findIndex((t) => t === item)
        ) as UUID[];

    const uniquetask_request_id: string[] = [];
    uniquerenewabletask_request_id.forEach((item) => {
      uniquetask_request_id.push(item);
    });
    uniquenonrenewabletask_request_id.forEach((item) => {
      uniquetask_request_id.push(item);
    });

    await calculateEmission(
      userSession?.organizationId,
      "energy_captive_power",
      uniquetask_request_id
    );
    const response: any = await saveEmissionDashboard(
      uniquetask_request_id,
      userSession?.organizationId
    );

    //#region save energy data
    // await saveEnergyData({
    //   organizationId: userSession?.organizationId,
    //   uniquetask_request_id: uniquetask_request_id,
    //   organizationAddressId: input.organizationAddressId,
    //   activity: "energy_captive_power",
    //   insertCaptivePowerRenewable: saveresponse
    //     ?.insert_GHGEnergy_CaptivePower_Renewable
    //     ?.returning as GhgEnergy_CaptivePower_Renewable[],
    //   insertCaptivePowerNonRenewable: saveresponse
    //     ?.insert_GHGEnergy_CaptivePower_NonRenewable
    //     ?.returning as GhgEnergy_CaptivePower_NonRenewable[],
    // });
    // console.log("DDDD = ", resSaveEnergy);
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
