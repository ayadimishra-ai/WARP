import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GhgFreshWater_Insert_Input,
  GhgHarvestedWater_Insert_Input,
  GhgWasteWater_Insert_Input,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { ConvertUOMGeneralised } from "~/lib/data-conversion/uom-conversion.service";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "~/lib/excel/excel.service";
import {
  TWaterConsumptionActivitySheetNames,
  WaterConsumptionActivityConstant,
} from "~/shared/constants/activity.constant";
import { sanitizeString, stz_string_tlds } from "~/utils/sanitize.util";

const { sheets: templateSheets } =
  WaterConsumptionActivityConstant.excel_template;

const freshWaterSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgFreshWater_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  //   const { ActivityMaster: activityMasterData } =
  //     await sdk.getActivityMasterDataByKey({
  //       master_key: ["waste_disposal_mechanism"],
  //     });
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
    }

    let total_fresh_water_used_for_domestic_use_litres = convertUom(
      Number(
        String(sheetDataItem["Total Fresh Water Used for Domestic Use"]).trim()
      ),
      sheetDataItem["UoM Freshwater"],
      "litre"
    );
    let total_fresh_water_used_for_industrial_use_litres = convertUom(
      Number(
        String(
          sheetDataItem["Total Fresh Water Used for Industrial Use"]
        ).trim()
      ),
      sheetDataItem["UoM Freshwater"],
      "litre"
    );
    let total_fresh_water_used_for_landscaping = convertUom(
      Number(
        String(sheetDataItem["Total Fresh Water Used for Landscaping"]).trim()
      ),
      sheetDataItem["UoM Freshwater"],
      "litre"
    );
    let total_fresh_water_used_for_miscellaneous_uses = convertUom(
      Number(
        String(
          sheetDataItem["Total Fresh Water Used for Miscellaneous Uses"]
        ).trim()
      ),
      sheetDataItem["UoM Freshwater"],
      "litre"
    );

    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      total_fresh_water_used_for_domestic_use: Number(
        String(sheetDataItem["Total Fresh Water Used for Domestic Use"]).trim()
      ),
      total_fresh_water_used_for_industrial_use: Number(
        String(
          sheetDataItem["Total Fresh Water Used for Industrial Use"]
        ).trim()
      ),
      total_fresh_water_used_for_landscaping: Number(
        String(sheetDataItem["Total Fresh Water Used for Landscaping"]).trim()
      ),
      total_fresh_water_used_for_miscellaneous_uses: Number(
        String(
          sheetDataItem["Total Fresh Water Used for Miscellaneous Uses"]
        ).trim()
      ),
      uom_freshwater: String(sheetDataItem["UoM Freshwater"]).trim(),

      created_by: userId,
      updated_by: userId,
      kpi_total_domestic_use_litres:
        total_fresh_water_used_for_domestic_use_litres,

      kpi_total_industrial_use_litres:
        total_fresh_water_used_for_industrial_use_litres,

      kpi_total_landscaping_use_litres: total_fresh_water_used_for_landscaping,
      kpi_total_miscellaneous_use_litres:
        total_fresh_water_used_for_miscellaneous_uses,
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

const wasteWaterSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgWasteWater_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  //   const { ActivityMaster: activityMasterData } =
  //     await sdk.getActivityMasterDataByKey({
  //       master_key: ["waste_disposal_mechanism"],
  //     });
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
    }

    let total_treated_effluent_reused_for_domestic_use = convertUom(
      Number(
        String(
          sheetDataItem["Total Treated Effluent Reused for Domestic Use"]
        ).trim()
      ),
      sheetDataItem["UoM Treated Effluent"],
      "litre"
    );
    let total_treated_effluent_reused_for_industrial_use = convertUom(
      Number(
        String(
          sheetDataItem["Total Treated Effluent Reused for Industrial Use"]
        ).trim()
      ),
      sheetDataItem["UoM Treated Effluent"],
      "litre"
    );
    let total_treated_effluent_reused_for_landscaping = convertUom(
      Number(
        String(
          sheetDataItem["Total Treated Effluent Reused for Landscaping"]
        ).trim()
      ),
      sheetDataItem["UoM Treated Effluent"],
      "litre"
    );
    let total_treated_effluent_reused_for_miscellaneous_Uses = convertUom(
      Number(
        String(
          sheetDataItem["Total Treated Effluent Used for Miscellaneous Uses"]
        ).trim()
      ),
      sheetDataItem["UoM Treated Effluent"],
      "litre"
    );
    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      total_treated_effluent_reused_for_domestic_use: Number(
        String(
          sheetDataItem["Total Treated Effluent Reused for Domestic Use"]
        ).trim()
      ),
      total_treated_effluent_reused_for_industrial_use: Number(
        String(
          sheetDataItem["Total Treated Effluent Reused for Industrial Use"]
        ).trim()
      ),
      total_treated_effluent_reused_for_landscaping: Number(
        String(
          sheetDataItem["Total Treated Effluent Reused for Landscaping"]
        ).trim()
      ),
      total_treated_effluent_used_for_miscellaneous_uses: Number(
        String(
          sheetDataItem["Total Treated Effluent Used for Miscellaneous Uses"]
        ).trim()
      ),
      uom_treated_effluent: String(
        sheetDataItem["UoM Treated Effluent"]
      ).trim(),

      created_by: userId,
      updated_by: userId,
      kpi_total_domestic_use_litres:
        total_treated_effluent_reused_for_domestic_use,
      kpi_total_industrial_use_litres:
        total_treated_effluent_reused_for_industrial_use,
      kpi_total_landscaping_use_litres:
        total_treated_effluent_reused_for_landscaping,
      kpi_total_miscellaneous_use_litres:
        total_treated_effluent_reused_for_miscellaneous_Uses,
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

const harvestedWaterSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const sheetRecord: GhgHarvestedWater_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const userId = userSession.userId;
  const sdk = await getGraphQlServerSDK();

  //   const { ActivityMaster: activityMasterData } =
  //     await sdk.getActivityMasterDataByKey({
  //       master_key: ["waste_disposal_mechanism"],
  //     });

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
    }

    let total_harvested_water_used_for_domestic_use = convertUom(
      Number(
        String(
          sheetDataItem["Total Harvested Water Used for Domestic Use"]
        ).trim()
      ),
      sheetDataItem["UoM Harvested Water"],
      "litre"
    );
    let total_harvested_water_used_for_industrial_use = convertUom(
      Number(
        String(
          sheetDataItem["Total Harvested Water Used for Industrial Use"]
        ).trim()
      ),
      sheetDataItem["UoM Harvested Water"],
      "litre"
    );
    let total_harvested_water_used_for_landscaping = convertUom(
      Number(
        String(
          sheetDataItem["Total Harvested Water Used for Landscaping"]
        ).trim()
      ),
      sheetDataItem["UoM Harvested Water"],
      "litre"
    );
    let total_harvested_water_used_for_miscellaneous_uses = convertUom(
      Number(
        String(
          sheetDataItem["Total Harvested Water Used for Miscellaneous Uses"]
        ).trim()
      ),
      sheetDataItem["UoM Harvested Water"],
      "litre"
    );
    sheetRecord.push({
      task_request_id: ActivityTaskData[0].taskRequestId,
      organization_address_id: ActivityTaskData[0].organization_address_id,
      activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,

      total_harvested_water_used_for_domestic_use: Number(
        String(
          sheetDataItem["Total Harvested Water Used for Domestic Use"]
        ).trim()
      ),
      total_harvested_water_used_for_industrial_use: Number(
        String(
          sheetDataItem["Total Harvested Water Used for Industrial Use"]
        ).trim()
      ),
      total_harvested_water_used_for_landscaping: Number(
        String(
          sheetDataItem["Total Harvested Water Used for Landscaping"]
        ).trim()
      ),
      total_harvested_water_used_for_miscellaneous_uses: Number(
        String(
          sheetDataItem["Total Harvested Water Used for Miscellaneous Uses"]
        ).trim()
      ),
      uom_harvested_water: String(sheetDataItem["UoM Harvested Water"]).trim(),

      created_by: userId,
      updated_by: userId,
      kpi_total_domestic_use_litres:
        total_harvested_water_used_for_domestic_use,
      kpi_total_industrial_use_litres:
        total_harvested_water_used_for_industrial_use,
      kpi_total_landscaping_use_litres:
        total_harvested_water_used_for_landscaping,
      kpi_total_miscellaneous_use_litres:
        total_harvested_water_used_for_miscellaneous_uses,
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
  TWaterConsumptionActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userSession: TUserSession
  ) => Record<string, any>
> = {
  "Freshwater Use": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await freshWaterSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  "Wastewater Reuse": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await wasteWaterSheetInsertionData(
      sheet,
      taskRequestActivityTaskRequestData,
      userSession
    );
  },
  "Harvested Water Use": async (
    sheet,
    taskRequestActivityTaskRequestData,
    userSession
  ) => {
    return await harvestedWaterSheetInsertionData(
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
    [key in TWaterConsumptionActivitySheetNames]: TSheetDataWithId[];
  } = {
    "Freshwater Use": [],
    "Wastewater Reuse": [],
    "Harvested Water Use": [],
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
    const sheetName =
      sheet.sheetName.trim() as TWaterConsumptionActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession
    )) as TSheetDataWithId[];
  }

  const batchSize = 2000; // Define your batch size
  const allFreshWaterData =
    finalSheetDataEntries["Freshwater Use"][0].sheetRecord;
  const allFreshWaterWhere = _.uniqWith(
    finalSheetDataEntries["Freshwater Use"][0].where,
    _.isEqual
  );
  const allWasteWaterData =
    finalSheetDataEntries["Wastewater Reuse"][0].sheetRecord;
  const allWasteWaterWhere = _.uniqWith(
    finalSheetDataEntries["Wastewater Reuse"][0].where,
    _.isEqual
  );
  const allHarvestedWaterData =
    finalSheetDataEntries["Harvested Water Use"][0].sheetRecord;
  const allHarvestedWaterWhere = _.uniqWith(
    finalSheetDataEntries["Harvested Water Use"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    sheetName: string
  ): Promise<any> => {
    if (sheetName === "Freshwater Use")
      return await sdk.upsertGHGFreshWaterActivity({
        where: { _or: whereBatch },
        ghgFreshWaterData: batch,
      });
    else if (sheetName === "Wastewater Reuse")
      return await sdk.upsertGHGWasteWaterActivity({
        where: { _or: whereBatch },
        ghgWasteWaterData: batch,
      });
    else if (sheetName === "Water Harvested")
      return await sdk.upsertGHGHarvestedWaterActivity({
        where: { _or: whereBatch },
        ghgHarvestedWaterData: batch,
      });
  };

  const response: any = {
    insert_GHGFreshWater: {
      returning: [],
    },
    delete_GHGFreshWater: {
      returning: [],
    },
    insert_GHGWasteWater: {
      returning: [],
    },
    delete_GHGWasteWater: {
      returning: [],
    },
    insert_GHGHarvestedWater: {
      returning: [],
    },
    delete_GHGHarvestedWater: {
      returning: [],
    },
  };

  //insert fresh water using batch
  for (let i = 0; i < allFreshWaterData.length; i += batchSize) {
    const batch = allFreshWaterData.slice(i, i + batchSize);
    const whereBatch = allFreshWaterWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Freshwater Use");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGFreshWater.returning = [
      ...response.insert_GHGFreshWater.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGFreshWater?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGFreshWater.returning = [
      ...response.delete_GHGFreshWater.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGFreshWater?.returning,
    ];
  }
  //insert waste water using batch
  for (let i = 0; i < allWasteWaterData.length; i += batchSize) {
    const batch = allWasteWaterData.slice(i, i + batchSize);
    const whereBatch = allWasteWaterWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Wastewater Reuse");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGWasteWater.returning = [
      ...response.insert_GHGWasteWater.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGWasteWater?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGWasteWater.returning = [
      ...response.delete_GHGWasteWater.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGWasteWater?.returning,
    ];
  }
  //insert harvested water using batch
  for (let i = 0; i < allHarvestedWaterData.length; i += batchSize) {
    const batch = allHarvestedWaterData.slice(i, i + batchSize);
    const whereBatch = allHarvestedWaterWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, "Water Harvested");
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGHarvestedWater.returning = [
      ...response.insert_GHGHarvestedWater.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGHarvestedWater?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGHarvestedWater.returning = [
      ...response.delete_GHGHarvestedWater.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGHarvestedWater?.returning,
    ];
  }

  return response;
};

export const insertWaterTemplateData = async (
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
