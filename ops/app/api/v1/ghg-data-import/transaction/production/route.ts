import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGProductionDetails } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import {
  ExcelApiBodySchema,
  TExcelSheet,
  readDataFromURL,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { saveProductionSheetEntries } from "~/lib/organization-transaction/production/production-excel.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "~/lib/organization-transaction/production/production-excel.validation";
import { ProductionDetailsActivity } from "~/lib/shared/constants/activity.constant";
import { ProductionExcelActivityConstant } from "~/shared/constants/activity.constant";
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
    return NextResponse.json({ success: true, data: historyData });
  }
}
export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
