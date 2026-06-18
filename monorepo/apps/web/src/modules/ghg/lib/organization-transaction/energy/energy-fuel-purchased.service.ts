import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgEnergyConsumption_FuelPurchased_Auxiliary_Insert_Input,
  GhgEnergyConsumption_FuelPurchased_General_Insert_Input,
  GhgEnergyConsumption_FuelPurchased_HeatingWater_Insert_Input,
  GhgEnergyConsumption_FuelPurchased_Insert_Input,
  GhgEnergyConsumption_FuelPurchased_Transportation_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { saveGHGEnergyConsumptionFuelPurchased } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  ApiHitType,
  TActivityMasterData,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TMonthYearGHGIDRelation,
  TSheetDataWithGhgId,
  getDefaultData,
  getMatchedMasterDataLabel,
  getTaskRequestActvityTaskRequestId,
  getdefaultfuelquality,
} from "@/modules/ghg/lib/excel/excel.service";
import { TFuelPurchasedActivitySheetNames } from "@/modules/ghg/shared/constants/activity.constant";
import { TransportModes } from "@/modules/ghg/shared/constants/input.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

export const saveFuelPurchasedSheetEntries = async (
  excelData: TExcelSheet[],
  activitycode: string,
  org_address_id: UUID,
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();
  // ghgDataTableName: scopes the approval lock to rows that actually exist in this
  // specific GHG table — prevents false-positive blocks when a sibling activity
  // sharing the same parent ActivityTaskRequest gets approved first.
  const taskRequestActvityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      org_address_id,
      excelData,
      activitycode,
      userSession,
      "GHGEnergyConsumption_FuelPurchased"
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const insertionGhgEnergyConsumptionFuelPurchasedData: GhgEnergyConsumption_FuelPurchased_Insert_Input[] =
      [];
    const whereCondition: Record<string, any>[] = [];
    taskRequestActvityTaskRequestData.forEach((data) => {
      whereCondition.push({
        _and: {
          task_request_id: { _eq: data.taskRequestId },
          organization_address_id: { _eq: data.organization_address_id },
          activity_task_request_id: { _eq: data.activityTaskRequestId },
        },
      });
    });

    let finalGHGEnergyConsumptionFuelPurchasedData: Record<string, any>[] = [];
    const GetGhgEnergyConsumptionFuelPurchasedData =
      await sdk.getGHGEnergyConsumptionFuelPurchasedData({
        where: { _or: whereCondition },
      });
    if (
      !!GetGhgEnergyConsumptionFuelPurchasedData &&
      GetGhgEnergyConsumptionFuelPurchasedData
        .GHGEnergyConsumption_FuelPurchased.length > 0
    ) {
      taskRequestActvityTaskRequestData.forEach((dataitem) => {
        if (
          GetGhgEnergyConsumptionFuelPurchasedData.GHGEnergyConsumption_FuelPurchased.filter(
            (data: Record<string, any>) =>
              dataitem.taskRequestId === data.task_request_id &&
              dataitem.organization_address_id ===
                data.organization_address_id &&
              dataitem.activityTaskRequestId === data.activity_task_request_id
          ).length == 0
        ) {
          insertionGhgEnergyConsumptionFuelPurchasedData.push({
            task_request_id: dataitem.taskRequestId,
            organization_address_id: dataitem.organization_address_id,
            activity_task_request_id: dataitem.activityTaskRequestId,
            created_by: userSession?.userId,
            updated_by: userSession?.userId,
          });
        }
      });
    } else {
      taskRequestActvityTaskRequestData.forEach((dataitem) => {
        insertionGhgEnergyConsumptionFuelPurchasedData.push({
          task_request_id: dataitem.taskRequestId,
          organization_address_id: dataitem.organization_address_id,
          activity_task_request_id: dataitem.activityTaskRequestId,
          created_by: userSession?.userId,
          updated_by: userSession?.userId,
        });
      });
    }
    if (insertionGhgEnergyConsumptionFuelPurchasedData.length > 0) {
      const insertGHGEnergyconsumptiondata =
        await sdk.insertGHGEnergyConsumptionFuelPurchased({
          insertData: insertionGhgEnergyConsumptionFuelPurchasedData,
        });
      await saveGHGEnergyConsumptionFuelPurchased(
        insertGHGEnergyconsumptiondata.insert_GHGEnergyConsumption_FuelPurchased
          ?.returning,
        userSession,
        []
      );
      if (!!insertGHGEnergyconsumptiondata) {
        finalGHGEnergyConsumptionFuelPurchasedData =
          GetGhgEnergyConsumptionFuelPurchasedData?.GHGEnergyConsumption_FuelPurchased;
        insertGHGEnergyconsumptiondata?.insert_GHGEnergyConsumption_FuelPurchased?.returning.forEach(
          (item) => {
            finalGHGEnergyConsumptionFuelPurchasedData.push(item);
          }
        );
      }
    } else {
      finalGHGEnergyConsumptionFuelPurchasedData =
        GetGhgEnergyConsumptionFuelPurchasedData?.GHGEnergyConsumption_FuelPurchased;
    }
    const MonthYearRelationwithGHGId: TMonthYearGHGIDRelation[] = [];
    taskRequestActvityTaskRequestData.forEach((item) => {
      let ghgData = finalGHGEnergyConsumptionFuelPurchasedData.filter(
        (data: Record<string, any>) =>
          data.task_request_id == item.taskRequestId &&
          data.organization_address_id == item.organization_address_id &&
          data.activity_task_request_id == item.activityTaskRequestId
      );
      if (ghgData.length > 0) {
        MonthYearRelationwithGHGId.push({
          Month: item.month,
          Year: item.year,
          ghgId: ghgData[0].id,
        });
      }
    });
    const insertionData = await getInsertionData(
      excelData,
      MonthYearRelationwithGHGId,
      userSession,
      taskRequestActvityTaskRequestData
    );
    return insertionData;
  }
};

const GeneralPurposeSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  MonthYearRelationwithGHGId: TMonthYearGHGIDRelation[],
  usersession: TUserSession,
  activityMasterData: TActivityMasterData[]
) => {
  const sheetRecord: GhgEnergyConsumption_FuelPurchased_General_Insert_Input[] =
    [];
  const ghgIdArray: UUID[] = [];

  let fueluomlist = excelSheetData.data
    .map((item1) => item1["Type of Fuel Consumption"])
    .flatMap((item) => item);

  const fuelquality = await getdefaultfuelquality(
    fueluomlist,
    usersession.organizationId as UUID,
    ["Energy_FuelPurchased_General_FuelType"]
  );

  excelSheetData.data.forEach((sheetDataItem) => {
    let ghgId = MonthYearRelationwithGHGId.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v4(dataitem.Month) ==
          sanitizeString.v4(sheetDataItem["Month"]) &&
        dataitem.Year == parseInt(String(sheetDataItem["Year"]).trim())
    );
    if (ghgId.length > 0) {
      ghgIdArray.push(ghgId[0].ghgId);
      sheetRecord.push({
        GHGEnergyConsumption_FuelPurchased_id: ghgId[0].ghgId,
        Type_of_Fuel_Purchased: getMatchedMasterDataLabel(
          activityMasterData,
          "Energy_FuelPurchased_General_FuelType",
          sheetDataItem["Type of Fuel Consumption"].trim(),
          ApiHitType.Excel
        ),
        Quantity_of_fuel_Consumed: Number(
          String(sheetDataItem["Quantity of Fuel Consumption"]).trim()
        ),
        Quantity_of_fuel_Consumed_uom: getMatchedMasterDataLabel(
          activityMasterData,
          "Energy_FuelPurchased_General_FuelType_UOM",
          sheetDataItem["UoM for Fuel Consumption"].trim(),
          ApiHitType.Excel
        ),
        Quality_of_fuel: !!sheetDataItem["Quality of Fuel"]
          ? Number(String(sheetDataItem["Quality of Fuel"]).trim())
          : !!fuelquality &&
              fuelquality.filter(
                (dataitem: Record<string, any>) =>
                  sanitizeString.v4(dataitem.label) ==
                  sanitizeString.v4(sheetDataItem["Type of Fuel Consumption"])
              ).length > 0
            ? fuelquality.filter(
                (dataitem: Record<string, any>) =>
                  sanitizeString.v4(dataitem.label) ==
                  sanitizeString.v4(sheetDataItem["Type of Fuel Consumption"])
              )[0].value
            : null,
        Point_of_Consumption: !!sheetDataItem["Point of Consumption"]?.trim()
          ? getMatchedMasterDataLabel(
              activityMasterData,
              "Energy_FuelPurchased_General_PointOfConsumption",
              sheetDataItem["Point of Consumption"].trim(),
              ApiHitType.Excel
            )
          : null,
        created_by: usersession.userId,
        updated_by: usersession.userId,
      });
    }
  });
  const excelSheetDataWithGhgId: TSheetDataWithGhgId[] = [
    {
      sheetRecord: sheetRecord,
      ghgID: ghgIdArray,
      where: [],
    },
  ];
  return excelSheetDataWithGhgId;
};

const HeatingWaterSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  MonthYearRelationwithGHGId: TMonthYearGHGIDRelation[],
  usersession: TUserSession
) => {
  const sheetRecord: GhgEnergyConsumption_FuelPurchased_HeatingWater_Insert_Input[] =
    [];
  const ghgIdArray: UUID[] = [];

  let fueluomlist = excelSheetData.data
    .map((item1) => item1["Type of Fuel Consumption"])
    .flatMap((item) => item);

  const fuelquality = await getdefaultfuelquality(
    fueluomlist,
    usersession.organizationId as UUID,
    ["Energy_FuelPurchased_HeatingWater_FuelType"]
  );

  excelSheetData.data.forEach((sheetDataItem) => {
    let ghgId = MonthYearRelationwithGHGId.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v4(dataitem.Month) ==
          sanitizeString.v4(sheetDataItem["Month"]) &&
        dataitem.Year == parseInt(String(sheetDataItem["Year"]))
    );
    if (ghgId.length > 0) {
      ghgIdArray.push(ghgId[0].ghgId);
      sheetRecord.push({
        GHGEnergyConsumption_FuelPurchased_id: ghgId[0].ghgId,
        Type_of_Fuel_Purchased:
          sheetDataItem["Type of Fuel Consumption"].trim(),
        Quality_of_fuel: !!sheetDataItem["Quality of Fuel Consumption"]
          ? Number(String(sheetDataItem["Quality of Fuel Consumption"]).trim())
          : !!fuelquality &&
              fuelquality.filter(
                (dataitem: Record<string, any>) =>
                  sanitizeString.v4(dataitem.label) ==
                  sanitizeString.v4(sheetDataItem["Type of Fuel Consumption"])
              ).length > 0
            ? fuelquality.filter(
                (dataitem: Record<string, any>) =>
                  sanitizeString.v4(dataitem.label) ==
                  sanitizeString.v4(sheetDataItem["Type of Fuel Consumption"])
              )[0].value
            : null,
        Used_for_Which_SKUs: sheetDataItem["SKUs applicable"].trim(),
        Quantity_of_fuel_consumed: Number(
          String(sheetDataItem["Quantity of Fuel Consumed"]).trim()
        ),
        Quantity_of_fuel_consumed_uom: sheetDataItem["UoM_Heating fuel"].trim(),
        created_by: usersession.userId,
        updated_by: usersession.userId,
      });
    }
  });
  const excelSheetDataWithGhgId: TSheetDataWithGhgId[] = [
    {
      sheetRecord: sheetRecord,
      ghgID: ghgIdArray,
      where: [],
    },
  ];
  return excelSheetDataWithGhgId;
};

const AuxFuelSheetInsertionData = (
  excelSheetData: TExcelSheet,
  MonthYearRelationwithGHGId: TMonthYearGHGIDRelation[],
  usersession: TUserSession
) => {
  const sheetRecord: GhgEnergyConsumption_FuelPurchased_Auxiliary_Insert_Input[] =
    [];
  const ghgIdArray: UUID[] = [];
  excelSheetData.data.forEach((sheetDataItem) => {
    let ghgId = MonthYearRelationwithGHGId.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v4(dataitem.Month) ==
          sanitizeString.v4(sheetDataItem["Month"]) &&
        dataitem.Year == parseInt(String(sheetDataItem["Year"]))
    );
    if (ghgId.length > 0) {
      ghgIdArray.push(ghgId[0].ghgId);
      sheetRecord.push({
        GHGEnergyConsumption_FuelPurchased_id: ghgId[0].ghgId,
        Type_of_Auxiliary_Fuel_Purchased:
          sheetDataItem["AUX Fuel Types Consumption"].trim(),
        Used_for_Which_SKUs: sheetDataItem["SKUs applicable"].trim(),
        Quantity_of_fuel_consumed: Number(
          String(sheetDataItem["Quantity of fuel Consumed"]).trim()
        ),
        Quantity_of_fuel_consumed_uom: sheetDataItem["UoM_AuxFuel"].trim(),
        created_by: usersession.userId,
        updated_by: usersession.userId,
      });
    }
  });
  const excelSheetDataWithGhgId: TSheetDataWithGhgId[] = [
    {
      sheetRecord: sheetRecord,
      ghgID: ghgIdArray,
      where: [],
    },
  ];
  return excelSheetDataWithGhgId;
};

const TransportationSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  MonthYearRelationwithGHGId: TMonthYearGHGIDRelation[],
  usersession: TUserSession,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  activityMasterData: TActivityMasterData[]
) => {
  const sheetRecord: GhgEnergyConsumption_FuelPurchased_Transportation_Insert_Input[] =
    [];
  const whereCondition: Record<string, any>[] = [];
  // Iterate over each item in the sheet data
  excelSheetData.data.forEach((sheetDataItem) => {
    // Find the corresponding GHG ID for the current item
    let ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v4(dataitem.month) ==
          sanitizeString.v4(sheetDataItem["Month"]) &&
        dataitem.year == sheetDataItem["Year"]
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
      }); // Prepare the record for insertion
      let sanitizedFuelUsed = !!String(
        sheetDataItem["Type of Fuel Consumption"]
      )
        ? String(sheetDataItem["Type of Fuel Consumption"]).trim()
        : getDefaultData({
            masterKey: "energy_fuelpurchased_transportation_type_of_fuel",
            valueForDefaultValue: TransportModes.Road,
            activityMasterData: activityMasterData,
          });

      sheetRecord.push({
        organization_address_id: ActivityTaskData[0].organization_address_id,
        task_request_id: ActivityTaskData[0].taskRequestId,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Vehicle_Type_Used_for_Road_Transport: !!sheetDataItem[
          "Vehicle Type Used for Road Transport"
        ]
          ? sheetDataItem["Vehicle Type Used for Road Transport"].trim()
          : "MDV",
        Type_of_Fuel_Purchased: sanitizedFuelUsed,
        Quantity_of_fuel_purchased: Number(
          String(sheetDataItem["Quantity of fuel Consumption"]).trim()
        ),
        UoM_for_fuel_purchased:
          sheetDataItem["UoM for fuel Consumption"].trim(),
        Distance_travelled: Number(
          String(sheetDataItem["Distance travelled"]).trim()
        ),
        Transportation_Type: sheetDataItem["Transportation Type"].trim(),
        created_by: usersession.userId,
        updated_by: usersession.userId,
      });
    }
  });
  // Return the formatted data with GHG IDs
  const excelSheetDataWithGhgId: TSheetDataWithGhgId[] = [
    {
      sheetRecord: sheetRecord,
      ghgID: [],
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const SheetInsertionDataMethods: Record<
  TFuelPurchasedActivitySheetNames,
  (
    sheet: TExcelSheet,
    MonthYearRelationwithGHGId: TMonthYearGHGIDRelation[],
    usersession: TUserSession,
    taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
    activityMasterData: TActivityMasterData[]
  ) => Record<string, any>
> = {
  "General Purpose": async (sheet, MonthYearRelationwithGHGId, usersession, _taskReq, activityMasterData) => {
    return await GeneralPurposeSheetInsertionData(
      sheet,
      MonthYearRelationwithGHGId,
      usersession,
      activityMasterData
    );
  },
  "Heating Water": async (sheet, MonthYearRelationwithGHGId, usersession) => {
    return await HeatingWaterSheetInsertionData(
      sheet,
      MonthYearRelationwithGHGId,
      usersession
    );
  },
  "AUX Fuel": AuxFuelSheetInsertionData,
  Transportation: TransportationSheetInsertionData,
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  MonthYearRelationwithGHGId: TMonthYearGHGIDRelation[],
  userSession: TUserSession,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[]
) => {
  const sdk = await getGraphQlServerSDK();
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: [
      "Energy_FuelPurchased_General_FuelType",
      "Energy_FuelPurchased_General_FuelType_UOM",
      "Energy_FuelPurchased_General_PointOfConsumption",
      "Energy_FuelPurchased_Auxiliary_FuelType",
      "Energy_FuelPurchased_HeatingWater_FuelType",
      "energy_fuelpurchased_transportation_type_of_fuel",
    ],
  });
  const finalSheetDataEntries: {
    [key in TFuelPurchasedActivitySheetNames]: TSheetDataWithGhgId[];
  } = {
    "Heating Water": [],
    "General Purpose": [],
    "AUX Fuel": [],
    Transportation: [],
  };
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName?.trim() as TFuelPurchasedActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      MonthYearRelationwithGHGId,
      userSession,
      taskRequestActvityTaskRequestData,
      activityMasterData?.ActivityMaster as TActivityMasterData[]
    )) as TSheetDataWithGhgId[];
  }

  const response = await sdk.upsertFuelPurchasedActivity({
    GHGEnergyConsumption_FuelPurchased_General_id:
      finalSheetDataEntries["General Purpose"].length > 0
        ? finalSheetDataEntries["General Purpose"][0].ghgID
        : [],
    GHGEnergyConsumption_FuelPurchased_Auxiliary_id:
      finalSheetDataEntries["AUX Fuel"].length > 0
        ? finalSheetDataEntries["AUX Fuel"][0].ghgID
        : [],
    GHGEnergyConsumption_FuelPurchased_HeatingWater__id:
      finalSheetDataEntries["Heating Water"].length > 0
        ? finalSheetDataEntries["Heating Water"][0].ghgID
        : [],
    Auxdata:
      finalSheetDataEntries["AUX Fuel"].length > 0
        ? finalSheetDataEntries["AUX Fuel"][0].sheetRecord
        : [],
    Generaldata:
      finalSheetDataEntries["General Purpose"].length > 0
        ? finalSheetDataEntries["General Purpose"][0].sheetRecord
        : [],
    HeatingWaterdata:
      finalSheetDataEntries["Heating Water"].length > 0
        ? finalSheetDataEntries["Heating Water"][0].sheetRecord
        : [],
  });

  const fuelResponse = await sdk.upsertGHGFuelPurchasedTransportation_Activity({
    fuelpurchasedtransportation:
      finalSheetDataEntries["Transportation"].length > 0
        ? finalSheetDataEntries["Transportation"][0].sheetRecord
        : [],
    where: {
      _or:
        finalSheetDataEntries["Transportation"].length > 0
          ? finalSheetDataEntries["Transportation"][0]?.where
          : [],
    },
  });
  return { response, fuelResponse };
};
