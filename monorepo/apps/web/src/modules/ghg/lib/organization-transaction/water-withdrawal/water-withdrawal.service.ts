import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { GhgWaterWithdrawal_Insert_Input } from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { ConvertUOMGeneralised } from "@/modules/ghg/lib/data-conversion/uom-conversion.service";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  TWaterWithdrawalActivitySheetNames,
  WaterWithdrawalActivityConstant,
} from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "@/modules/ghg/utils/sanitize.util";
const { sheets: templateSheets } =
  WaterWithdrawalActivityConstant.excel_template;

const waterWithdrawalSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  pinCode: string
) => {
  const sheetRecord: GhgWaterWithdrawal_Insert_Input[] = [];
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

      let fresh_water_withdrawal_in_litres = convertUom(
        Number(String(sheetDataItem["Total Fresh Water Withdrawal"]).trim()),
        sheetDataItem["UoM Freshwater"],
        "litre"
      );
      //let fresh_water_withdrawal_in_litres= sheetDataItem["Total Fresh Water Withdrawal"] * uom_conversion_data[0].factor;
      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        total_fresh_water_withdrawal: Number(
          String(sheetDataItem["Total Fresh Water Withdrawal"]).trim()
        ),
        uom_freshwater: sheetDataItem["UoM Freshwater"].trim(),
        source_of_fresh_water: sheetDataItem["Source of Fresh Water"].trim(),
        kpi_total_fresh_water_withdrawal_litres:
          fresh_water_withdrawal_in_litres,
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
  TWaterWithdrawalActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession,
    pinCode: string
  ) => Record<string, any>
> = {
  "Water Withdrawal": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession,
    pinCode
  ) => {
    return await waterWithdrawalSheetInsertionData(
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
    [key in TWaterWithdrawalActivitySheetNames]: TSheetDataWithId[];
  } = { "Water Withdrawal": [] };
  const sdk = await getGraphQlServerSDK();
  // Removing extra sheets.
  const data = templateSheets
    .map((sheet) => {
      return excelData.find(
        (m) => stz_string_tlds(m.sheetName) === stz_string_tlds(sheet.name)
      );
    })
    .filter((sheet) => !!sheet) as TExcelSheet[];

  const dataLength = data.length;
  for (let i = 0; i < dataLength; i++) {
    const sheet = data[i];
    const sheetName =
      sheet.sheetName.trim() as TWaterWithdrawalActivitySheetNames;
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
  const allData = finalSheetDataEntries["Water Withdrawal"][0].sheetRecord;
  const allWhere = _.uniqWith(
    finalSheetDataEntries["Water Withdrawal"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGWaterWithdrawalActivity({
      where: { _or: whereBatch },
      ghgWaterWithdrawalData: batch,
    });
  };

  const response: any = {
    insert_GHGWaterWithdrawal: {
      returning: [],
    },
    delete_GHGWaterWithdrawal: {
      returning: [],
    },
  };

  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGWaterWithdrawal.returning = [
      ...response.insert_GHGWaterWithdrawal.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGWaterWithdrawal?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGWaterWithdrawal.returning = [
      ...response.delete_GHGWaterWithdrawal.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGWaterWithdrawal?.returning,
    ];
  }

  return response;
};

export const insertWaterWithdrawalTemplateData = async (
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
