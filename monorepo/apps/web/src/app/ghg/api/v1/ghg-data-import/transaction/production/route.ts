import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGProductionDetails } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import {
  ExcelApiBodySchema,
  TExcelSheet,
  extractYearMonthPairsFromExcel,
  readDataFromURL,
} from "@/modules/ghg/lib/excel/excel.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { saveProductionSheetEntries } from "@/modules/ghg/lib/organization-transaction/production/production-excel.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "@/modules/ghg/lib/organization-transaction/production/production-excel.validation";
import { ProductionDetailsActivity } from "@/modules/ghg/lib/shared/constants/activity.constant";
import { ProductionExcelActivityConstant } from "@/modules/ghg/shared/constants/activity.constant";
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
  const isActivityAllow = userSession.mappings[0].activities.some(
    (activity: string) => activity === ProductionDetailsActivity.code
  );
  if (!isActivityAllow) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [
        {
          sheetName: "Error Data",
          data: [{ Error: "Production activity is not allowed" }],
        },
      ]
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "production",
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

  // read excel data
  const data = await readDataFromURL(input.fileUrl);
  const { sheets: templateSheets } =
    ProductionExcelActivityConstant.excel_template;
  const Exceldata = templateSheets
    .map((sheet: { name: string }) => {
      return data?.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      );
    })
    .filter((sheet: any) => !!sheet) as TExcelSheet[];

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
      "production",
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

  //Data Validation
  const dataValidationErrros = await validateExcelTemplateData(
    Exceldata,
    userSession as TUserSession,
    input?.organizationAddressId as UUID
  );
  if (dataValidationErrros.length > 0) {
    //validate Data
    const uploadResponsedata = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrros
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "production",
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

  // Save Production details
  const saveResponse = await saveProductionSheetEntries(
    Exceldata,
    ProductionExcelActivityConstant.parent_code,
    input.organizationAddressId as UUID,
    userSession
  );

  saveGHGProductionDetails(
    saveResponse?.response?.insert_GHGProductionDetails?.returning,
    userSession,
    saveResponse?.response?.delete_GHGProductionDetails?.returning
  );

  if (!!saveResponse) {
    const historyData = await insertNewDataImportHistory(
      userSession,
      "production",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId
    );
    // After successful data write — update summary cache
    const yearMonthPairs = extractYearMonthPairsFromExcel(Exceldata);
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: input.organizationAddressId,
      activityCode: "production",
      monthYears: yearMonthPairs.map((d: any) => ({
        year: Number(d.year),
        month: String(d.month).toLowerCase(),
      })),
    }).catch((err) => console.error("[summary-cache] upsert failed:", err));
    return NextResponse.json({ success: true, data: historyData });
  }
}
export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
