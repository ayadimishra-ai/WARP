import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import { GhgWastewaterGeneration_Insert_Input } from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { ConvertUOMGeneralised } from "~/lib/data-conversion/uom-conversion.service";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "~/lib/excel/excel.service";
import {
  TWastewaterGenerationActivitySheetNames,
  WastewaterGenerationActivityConstant,
} from "~/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "~/utils/sanitize.util";

const { sheets: templateSheets } =
  WastewaterGenerationActivityConstant.excel_template;

const wastewatergenerationSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const sheetRecord: GhgWastewaterGeneration_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();
  const convertUom = await ConvertUOMGeneralised(userSession.organizationId);
  excelSheetData.data.forEach(async (sheetDataItem) => {
    let ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(dataitem.month) ===
          sanitizeString.v1(sheetDataItem["Month"]) &&
        dataitem.year === sheetDataItem["Year"]
    );

    if (ActivityTaskData.length > 0) {
      whereCondition.push({
        _and: {
          task_request_id: { _eq: ActivityTaskData[0].taskRequestId },
          organization_address_id: {
            _eq: ActivityTaskData[0].organization_address_id,
          },
          activity_task_request_id: {
            _eq: ActivityTaskData[0].activityTaskRequestId,
          },
        },
      });

      let domestic_use_in_litres = convertUom(
        Number(
          String(
            sheetDataItem["Total Wastewater Generated from Domestic Use"]
          ).trim()
        ),
        sheetDataItem["UoM Wastewater"],
        "litre"
      );
      let industrial_use_in_litres = convertUom(
        Number(
          String(
            sheetDataItem["Total Wastewater Generated from Industrial Use"]
          ).trim()
        ),
        sheetDataItem["UoM Wastewater"],
        "litre"
      );

      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        total_wastewater_generated_from_domestic_use: Number(
          String(
            sheetDataItem["Total Wastewater Generated from Domestic Use"]
          ).trim()
        ),
        total_wastewater_generated_from_industrial_use: !!sheetDataItem[
          "Total Wastewater Generated from Industrial Use"
        ]
          ? Number(
              String(
                sheetDataItem["Total Wastewater Generated from Industrial Use"]
              ).trim()
            )
          : null,
        uom_wastewater: sheetDataItem["UoM Wastewater"].trim(),
        point_of_wastewater_disposal_Applicable: !!sheetDataItem[
          "Point of Wastewater Disposal"
        ]
          ? sheetDataItem["Point of Wastewater Disposal"].trim()
          : null,
        kpi_total_wastewater_generated_domestic_use_litres:
          domestic_use_in_litres,
        kpi_total_wastewater_generated_industrial_use_litres:
          industrial_use_in_litres,
        created_by: userId,
        updated_by: userId,
      });
    }
  });

  const excelSheetDataWithGhgId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const SheetInsertionDataMethods: Record<
  TWastewaterGenerationActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession,
    pinCode: string
  ) => Record<string, any>
> = {
  // "Waste Produced Data":  wasteSheetInsertionData(),
  "Wastewater Generation": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession,
    pinCode
  ) => {
    return await wastewatergenerationSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession,
      pinCode
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const excelSheetData: TExcelSheet[] = [];
  const finalSheetDataEntries: {
    [key in TWastewaterGenerationActivitySheetNames]: TSheetDataWithId[];
  } = { "Wastewater Generation": [] };
  const sdk = await getGraphQlServerSDK();
  // Removing extra sheets.
  const data = templateSheets
    .map((sheet) => {
      return excelData.find(
        (m) => stz_string_tlds(m.sheetName) === stz_string_tlds(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];
  // data.forEach(async (sheet) => {
  //   const sheetName = sheet.sheetName.trim() as TWasteActivitySheetNames;
  //   finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
  //     sheetName
  //   ](
  //     sheet,
  //     taskRequestActvityTaskRequestData,
  //     userSession,
  //     pinCode
  //   )) as TSheetDataWithId[];
  // });
  const dataLength = data.length;
  for (let i = 0; i < dataLength; i++) {
    const sheet = data[i];
    const sheetName =
      sheet.sheetName.trim() as TWastewaterGenerationActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession,
      pinCode
    )) as TSheetDataWithId[];
  }
  const batchSize = 2000; // Define your batch size
  const allData = finalSheetDataEntries["Wastewater Generation"][0].sheetRecord;
  const allWhere = _.uniqWith(
    finalSheetDataEntries["Wastewater Generation"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGWastewaterGenerationActivity({
      where: { _or: whereBatch },
      ghgWastewaterdenerationData: batch,
    });
  };

  const response: any = {
    insert_GHGWastewaterGeneration: {
      returning: [],
    },
    delete_GHGWastewaterGeneration: {
      returning: [],
    },
  };
  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGWastewaterGeneration.returning = [
      ...response.insert_GHGWastewaterGeneration.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGWastewaterGeneration?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGWastewaterGeneration.returning = [
      ...response.delete_GHGWastewaterGeneration.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGWastewaterGeneration?.returning,
    ];
  }

  // const response = await sdk.upsertGHGWasteActivity({
  //   where: { _or: finalSheetDataEntries["Waste Produced Data"][0].where },
  //   ghgWasteData: finalSheetDataEntries["Waste Produced Data"][0].sheetRecord,
  // });
  return response;
};

export const insertWaterWasteGenerationTemplateData = async (
  excelData: TExcelSheet[],
  activitycode: string,
  org_address_id: UUID,
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();
  const taskRequestActvityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      org_address_id,
      excelData,
      activitycode,
      userSession
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const addressData = await sdk.getAddressDetail({
      organisationAddressId: org_address_id,
    });
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActvityTaskRequestData,
      userSession,
      addressData.OrganizationAddress[0].Address.pincode ?? ""
    );
    return insertionData;
  }
};
