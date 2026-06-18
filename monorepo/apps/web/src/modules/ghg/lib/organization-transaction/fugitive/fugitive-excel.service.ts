import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgFireExtinguisher_Insert_Input,
  GhgIndustrialGas_Insert_Input,
  GhgRefrigerantAndAcSystems_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
} from "@/modules/ghg/lib/excel/excel.service";
import {
  fugitiveActivityConstant,
  TFugitiveActivitySheetNames,
} from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "@/modules/ghg/utils/sanitize.util";

const { sheets: templateSheets } = fugitiveActivityConstant.excel_template;

const refrigerantAndACSystemsSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgRefrigerantAndAcSystems_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();
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
    }

    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      type_of_refrigerant_used:
        sheetDataItem["Type of Refrigerant used"].trim(),
      quantity_of_refrigerant_filled: Number(
        String(sheetDataItem["Quantity of Refrigerant filled"]).trim()
      ),
      uom_refrigerant_and_ac_systems: sheetDataItem["UoM"].trim(),
      created_by: userId,
      updated_by: userId,
    });
  });

  const excelSheetDataWithGhgId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const fireExtinguisherSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgFireExtinguisher_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  //   const { ActivityMaster: activityMasterData } =
  //     await sdk.getActivityMasterDataByKey({
  //       master_key: ["waste_disposal_mechanism"],
  //     });

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
    }

    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      gas_used_in_fire_extinguisher: String(
        sheetDataItem["Gas used in Fire extinguisher"]
      ).trim(),
      quantity_of_gas_filled: Number(
        String(sheetDataItem["Quantity of gas filled"]).trim()
      ),
      uom_fire_extinguisher: sheetDataItem["UoM"].trim(),
      created_by: userId,
      updated_by: userId,
    });
  });

  const excelSheetDataWithGhgId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const industrialGasSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgIndustrialGas_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  //   const { ActivityMaster: activityMasterData } =
  //     await sdk.getActivityMasterDataByKey({
  //       master_key: ["waste_disposal_mechanism"],
  //     });

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
    }
    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      type_of_industrial_gas_used: String(
        sheetDataItem["Type of Industrial Gas used"]
      ).trim(),
      quantity_of_industrial_gas_filled: Number(
        String(sheetDataItem["Quantity of Industrial Gas filled"]).trim()
      ),
      uom_industrial_gas: sheetDataItem["UoM"].trim(),
      created_by: userId,
      updated_by: userId,
    });
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
  TFugitiveActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession
  ) => Record<string, any>
> = {
  "Refrigerant and AC Systems": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await refrigerantAndACSystemsSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  "Fire Extinguisher": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await fireExtinguisherSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  "Industrial Gas": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await industrialGasSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
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
    [key in TFugitiveActivitySheetNames]: TSheetDataWithId[];
  } = {
    "Refrigerant and AC Systems": [],
    "Fire Extinguisher": [],
    "Industrial Gas": [],
  };
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
    const sheetName = sheet.sheetName.trim() as TFugitiveActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession
    )) as TSheetDataWithId[];
  }

  const batchSize = 2000; // Define your batch size
  const allRefrigerantAndACSystemsData =
    finalSheetDataEntries["Refrigerant and AC Systems"][0].sheetRecord;
  const allRefrigerantAndACSystemsWhere = _.uniqWith(
    finalSheetDataEntries["Refrigerant and AC Systems"][0].where,
    _.isEqual
  );
  const allFireExtinguisherData =
    finalSheetDataEntries["Fire Extinguisher"][0].sheetRecord;
  const allFireExtinguisherWhere = _.uniqWith(
    finalSheetDataEntries["Fire Extinguisher"][0].where,
    _.isEqual
  );
  const allIndustrialGasData =
    finalSheetDataEntries["Industrial Gas"][0].sheetRecord;
  const allIndustrialGasWhere = _.uniqWith(
    finalSheetDataEntries["Industrial Gas"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    sheetName: string
  ): Promise<any> => {
    if (sheetName === "Refrigerant and AC Systems")
      return await sdk.upsertGHGRefrigerantAndACSystemsActivity({
        where: { _or: whereBatch },
        ghgRefrigerantAndACSystemsData: batch,
      });
    else if (sheetName === "Fire Extinguisher")
      return await sdk.upsertGHGFireExtinguisherActivity({
        where: { _or: whereBatch },
        ghgFireExtinguisherData: batch,
      });
    else if (sheetName === "Industrial Gas")
      return await sdk.upsertGHGIndustrialGasActivity({
        where: { _or: whereBatch },
        ghgIndustrialGasData: batch,
      });
  };

  const response: any = {
    insert_GHGRefrigerantAndACSystems: {
      returning: [],
    },
    delete_GHGRefrigerantAndACSystems: {
      returning: [],
    },
    insert_GHGFireExtinguisher: {
      returning: [],
    },
    delete_GHGFireExtinguisher: {
      returning: [],
    },
    insert_GHGIndustrialGas: {
      returning: [],
    },
    delete_GHGIndustrialGas: {
      returning: [],
    },
  };

  //insert Refrigerant and AC Systems using batch
  for (let i = 0; i < allRefrigerantAndACSystemsData.length; i += batchSize) {
    const batch = allRefrigerantAndACSystemsData.slice(i, i + batchSize);
    const whereBatch = allRefrigerantAndACSystemsWhere.slice(i, i + batchSize);
    const res = await processBatch(
      batch,
      whereBatch,
      "Refrigerant and AC Systems"
    );
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGRefrigerantAndACSystems.returning = [
      ...response.insert_GHGRefrigerantAndACSystems.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGRefrigerantAndACSystems?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGRefrigerantAndACSystems.returning = [
      ...response.delete_GHGRefrigerantAndACSystems.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGRefrigerantAndACSystems?.returning,
    ];
  }
  //insert Fire Extinguisher using batch
  for (let i = 0; i < allFireExtinguisherData.length; i += batchSize) {
    const batch = allFireExtinguisherData.slice(i, i + batchSize);
    const whereBatch = allFireExtinguisherWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Fire Extinguisher");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGFireExtinguisher.returning = [
      ...response.insert_GHGFireExtinguisher.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGFireExtinguisher?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGFireExtinguisher.returning = [
      ...response.delete_GHGFireExtinguisher.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGFireExtinguisher?.returning,
    ];
  }
  //insert Industrial Gas using batch
  for (let i = 0; i < allIndustrialGasData.length; i += batchSize) {
    const batch = allIndustrialGasData.slice(i, i + batchSize);
    const whereBatch = allIndustrialGasWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Industrial Gas");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGIndustrialGas.returning = [
      ...response.insert_GHGIndustrialGas.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGIndustrialGas?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGIndustrialGas.returning = [
      ...response.delete_GHGIndustrialGas.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGIndustrialGas?.returning,
    ];
  }

  return response;
};

export const insertFugitiveTemplateData = async (
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
