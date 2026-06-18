import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgEnergy_CaptivePower_Insert_Input,
  GhgEnergy_CaptivePower_NonRenewable_Insert_Input,
  GhgEnergy_CaptivePower_Renewable_Fuel_Insert_Input,
  GhgEnergy_CaptivePower_Renewable_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { saveGHGEnergyCaptivePower } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TExcelSheet,
  TMonthYearGHGIDRelation,
  TSheetDataWithGhgId,
  getTaskRequestActvityTaskRequestId,
  getdefaultfuelquality,
} from "@/modules/ghg/lib/excel/excel.service";
import { TCaptivelActivitySheetNames } from "@/modules/ghg/shared/constants/activity.constant";
import { sanitize_compare_str_v1 } from "@/modules/ghg/utils/comapre.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

const save_ghg_captivepower = async (
  taskRequestActvityTaskRequestData: Record<string, any>[],
  usersession: TUserSession,
  ghgType: string
) => {
  const insertionGhgEnergyCaptivePowerData: GhgEnergy_CaptivePower_Insert_Input[] =
    [];
  const whereCondition: Record<string, any>[] = [];
  taskRequestActvityTaskRequestData.forEach((data) => {
    whereCondition.push({
      _and: {
        task_request_id: { _eq: data.taskRequestId },
        organization_address_id: { _eq: data.organization_address_id },
        activity_task_request_id: { _eq: data.activityTaskRequestId },
        Type_of_Captive_Power: { _eq: ghgType },
      },
    });
  });
  const sdk = await getGraphQlServerSDK();
  let finalGHGEnergyCaptivePowerData: Record<string, any>[] = [];
  const GetGhgEnergyCaptivePowerData = await sdk.getGHGEnergyCaptivePowerData({
    where: { _or: whereCondition },
  });
  if (
    !!GetGhgEnergyCaptivePowerData &&
    GetGhgEnergyCaptivePowerData.GHGEnergy_CaptivePower.length > 0
  ) {
    for (let i = 0; i < taskRequestActvityTaskRequestData.length; i++) {
      // taskRequestActvityTaskRequestData.forEach((dataitem) => {
      const dataitem = taskRequestActvityTaskRequestData[i];
      if (
        GetGhgEnergyCaptivePowerData.GHGEnergy_CaptivePower.filter(
          (data: Record<string, any>) =>
            dataitem.taskRequestId === data.task_request_id &&
            dataitem.organization_address_id === data.organization_address_id &&
            dataitem.activityTaskRequestId === data.activity_task_request_id &&
            data.Type_of_Captive_Power === ghgType
        ).length == 0
      ) {
        insertionGhgEnergyCaptivePowerData.push({
          task_request_id: dataitem.taskRequestId,
          organization_address_id: dataitem.organization_address_id,
          activity_task_request_id: dataitem.activityTaskRequestId,
          Do_You_Generate_Captive_Power_for_Own_Use: "Yes",
          Type_of_Captive_Power: ghgType,
          created_by: usersession?.userId,
          updated_by: usersession?.userId,
        });
      }
    }
  } else {
    for (let i = 0; i < taskRequestActvityTaskRequestData.length; i++) {
      const dataitem = taskRequestActvityTaskRequestData[i];
      // taskRequestActvityTaskRequestData.forEach((dataitem) => {
      insertionGhgEnergyCaptivePowerData.push({
        task_request_id: dataitem.taskRequestId,
        organization_address_id: dataitem.organization_address_id,
        activity_task_request_id: dataitem.activityTaskRequestId,
        Do_You_Generate_Captive_Power_for_Own_Use: "Yes",
        Type_of_Captive_Power: ghgType,
        created_by: usersession?.userId,
        updated_by: usersession?.userId,
      });
    }
  }

  if (insertionGhgEnergyCaptivePowerData.length > 0) {
    const insertGHGEnergyconsumptiondata =
      await sdk.insertGHGEnergyCaptivePower({
        insertData: insertionGhgEnergyCaptivePowerData,
      });
    await saveGHGEnergyCaptivePower(
      insertGHGEnergyconsumptiondata.insert_GHGEnergy_CaptivePower?.returning,
      usersession,
      []
    );
    if (!!insertGHGEnergyconsumptiondata) {
      finalGHGEnergyCaptivePowerData =
        GetGhgEnergyCaptivePowerData?.GHGEnergy_CaptivePower;
      insertGHGEnergyconsumptiondata?.insert_GHGEnergy_CaptivePower?.returning.forEach(
        (item) => {
          finalGHGEnergyCaptivePowerData.push(item);
        }
      );
    }
  } else {
    finalGHGEnergyCaptivePowerData =
      GetGhgEnergyCaptivePowerData?.GHGEnergy_CaptivePower;
  }

  const MonthYearRelationwithGHGId: TMonthYearGHGIDRelation[] = [];
  for (let i = 0; i < taskRequestActvityTaskRequestData.length; i++) {
    const item = taskRequestActvityTaskRequestData[i];
    //taskRequestActvityTaskRequestData.forEach((item) => {
    let ghgData = finalGHGEnergyCaptivePowerData.filter(
      (data: Record<string, any>) =>
        data.task_request_id == item.taskRequestId &&
        data.organization_address_id == item.organization_address_id &&
        data.activity_task_request_id == item.activityTaskRequestId &&
        data.Type_of_Captive_Power == ghgType
    );
    if (ghgData.length > 0) {
      MonthYearRelationwithGHGId.push({
        Month: item.month,
        Year: item.year,
        ghgId: ghgData[0].id,
      });
    }
  }
  return MonthYearRelationwithGHGId;
};

export const saveCaptivePowerSheetEntries = async (
  excelData: TExcelSheet[],
  activitycode: string,
  org_address_id: UUID,
  usersession: TUserSession
) => {
  // ghgDataTableName: scopes the approval lock to rows that actually exist in this
  // specific GHG table — prevents false-positive blocks when a sibling activity
  // sharing the same parent ActivityTaskRequest gets approved first.
  const taskRequestActvityTaskRequestData =
    await getTaskRequestActvityTaskRequestId(
      org_address_id,
      excelData,
      activitycode,
      usersession,
      "GHGEnergy_CaptivePower"
    );
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActvityTaskRequestData,
      usersession
    );
    return insertionData;
  }
};

const NonRenewableFuelSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: Record<string, any>[],
  usersession: TUserSession
) => {
  const sheetRecord: GhgEnergy_CaptivePower_NonRenewable_Insert_Input[] = [];
  const ghgIdArray: UUID[] = [];

  let fueluomlist = excelSheetData.data
    .map((item1) => item1["Type of Fuel Used"])
    .flatMap((item) => item);

  const fuelquality = await getdefaultfuelquality(
    fueluomlist,
    usersession.organizationId as UUID,
    ["Energy_CaptivePower_NonRenewable_FuelType"]
  );

  const insertionTaskRequestData = taskRequestActvityTaskRequestData?.filter(
    (obj1) =>
      excelSheetData.data.some(
        (obj2) =>
          sanitize_compare_str_v1(obj1.month, obj2["Month"]) &&
          obj1.year === obj2["Year"]
      )
  ) as Record<string, any>[];
  const MonthYearRelationwithGHGId = await save_ghg_captivepower(
    insertionTaskRequestData,
    usersession,
    "Non Renewable"
  );
  for (let i = 0; i < excelSheetData.data.length; i++) {
    const sheetDataItem = excelSheetData.data[i];
    // excelSheetData.data.forEach((sheetDataItem) => {
    let ghgId = MonthYearRelationwithGHGId.find(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(dataitem.Month) ==
          sanitizeString.v1(sheetDataItem["Month"]) &&
        dataitem.Year == parseInt(String(sheetDataItem["Year"]).trim())
    );
    if (!!ghgId) {
      ghgIdArray.push(ghgId.ghgId);
      sheetRecord.push({
        GHGEnergyConsumption_CaptivePower_id: ghgId.ghgId,
        Type_of_Fuel_Used: sheetDataItem["Type of Fuel Used"].trim(),
        Quantity_of_fuel_consumed: Number(
          String(sheetDataItem["Quantity of fuel consumed"]).trim()
        ),
        Quantity_of_fuel_consumed_uom:
          sheetDataItem["UoM for the Quantity of Fuel consumed"].trim(),
        Quality_of_fuel: !!sheetDataItem["Quality of fuel"]
          ? Number(String(sheetDataItem["Quality of fuel"]).trim())
          : !!fuelquality &&
              fuelquality.filter(
                (dataitem: Record<string, any>) =>
                  sanitizeString.v4(dataitem.label) ==
                  sanitizeString.v4(sheetDataItem["Type of Fuel Used"])
              ).length > 0
            ? fuelquality.filter(
                (dataitem: Record<string, any>) =>
                  sanitizeString.v4(dataitem.label) ==
                  sanitizeString.v4(sheetDataItem["Type of Fuel Used"])
              )[0].value
            : null,
        Unit_of_Energy_Generated_in_Kwh: Number(
          String(sheetDataItem["Unit of Energy Generated (in Kwh)"]).trim()
        ),
        created_by: usersession?.userId,
        updated_by: usersession?.userId,
      });
    }
  }
  const excelSheetDataWithGhgId: TSheetDataWithGhgId[] = [
    {
      sheetRecord: sheetRecord,
      ghgID: ghgIdArray,
      where: [],
    },
  ];
  return excelSheetDataWithGhgId;
};

const RenewableFuelSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: Record<string, any>[],
  usersession: TUserSession
) => {
  const sheetRecord: GhgEnergy_CaptivePower_Renewable_Fuel_Insert_Input[] = [];
  const ghgIdArray: UUID[] = [];

  let fuelList = excelSheetData.data
    .map((item1) => item1["Type of Fuel Used"])
    .flatMap((item) => item);

  const fuelquality = await getdefaultfuelquality(
    fuelList,
    usersession.organizationId as UUID,
    ["Energy_CaptivePower_Renewable_FuelType"]
  );

  const insertionTaskRequestData = taskRequestActvityTaskRequestData?.filter(
    (obj1) =>
      excelSheetData.data.some(
        (obj2) =>
          sanitize_compare_str_v1(obj1.month, obj2["Month"]) &&
          obj1.year === obj2["Year"]
      )
  ) as Record<string, any>[];

  const MonthYearRelationwithGHGId = await save_ghg_captivepower(
    insertionTaskRequestData,
    usersession,
    "Renewable"
  );

  for (let i = 0; i < excelSheetData.data.length; i++) {
    const sheetDataItem = excelSheetData.data[i];
    // excelSheetData.data.forEach((sheetDataItem) => {
    let ghgId = MonthYearRelationwithGHGId.find(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(dataitem.Month) ==
          sanitizeString.v1(sheetDataItem["Month"]) &&
        dataitem.Year == parseInt(String(sheetDataItem["Year"]).trim())
    );

    if (!!ghgId) {
      ghgIdArray.push(ghgId.ghgId);
      sheetRecord.push({
        GHGEnergyConsumption_CaptivePower_id: ghgId.ghgId,
        Type_of_Fuel_Used: sheetDataItem["Type of Fuel Used"].trim(),
        Quantity_of_fuel_consumed: Number(
          String(sheetDataItem["Quantity of fuel consumed"]).trim()
        ),
        Quantity_of_fuel_consumed_uom: String(
          sheetDataItem["UoM for the Quantity of Fuel consumed"]
        ).trim(),
        Quality_of_fuel: !!sheetDataItem["Quality of fuel"]
          ? Number(String(sheetDataItem["Quality of fuel"]).trim())
          : !!fuelquality &&
              fuelquality.filter(
                (dataitem: Record<string, any>) =>
                  sanitizeString.v4(dataitem.label) ==
                  sanitizeString.v4(sheetDataItem["Type of Fuel Used"])
              ).length > 0
            ? fuelquality.filter(
                (dataitem: Record<string, any>) =>
                  sanitizeString.v4(dataitem.label) ==
                  sanitizeString.v4(sheetDataItem["Type of Fuel Used"])
              )[0].value
            : null,
        Unit_of_Energy_Generated_in_Kwh: Number(
          String(sheetDataItem["Unit of Energy Generated (in Kwh)"]).trim()
        ),
        created_by: usersession?.userId,
        updated_by: usersession?.userId,
      });
    }
  }
  const excelSheetDataWithGhgId: TSheetDataWithGhgId[] = [
    {
      sheetRecord: sheetRecord,
      ghgID: ghgIdArray,
      where: [],
    },
  ];
  return excelSheetDataWithGhgId;
};

const RenewableSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: Record<string, any>[],
  usersession: TUserSession
) => {
  const sheetRecord: GhgEnergy_CaptivePower_Renewable_Insert_Input[] = [];
  const ghgIdArray: UUID[] = [];

  const insertionTaskRequestData = taskRequestActvityTaskRequestData?.filter(
    (obj1) =>
      excelSheetData.data.some(
        (obj2) =>
          sanitize_compare_str_v1(obj1.month, obj2["Month"]) &&
          obj1.year === obj2["Year"]
      )
  ) as Record<string, any>[];
  const MonthYearRelationwithGHGId = await save_ghg_captivepower(
    insertionTaskRequestData,
    usersession,
    "Renewable"
  );

  for (let i = 0; i < excelSheetData.data.length; i++) {
    const sheetDataItem = excelSheetData.data[i];

    // excelSheetData.data.forEach((sheetDataItem) => {
    let ghgId = MonthYearRelationwithGHGId.find(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(dataitem.Month) ==
          sanitizeString.v1(sheetDataItem["Month"]) &&
        dataitem.Year == parseInt(String(sheetDataItem["Year"]).trim())
    );
    if (!!ghgId) {
      ghgIdArray.push(ghgId.ghgId);
      sheetRecord.push({
        GHGEnergyConsumption_CaptivePower_id: ghgId.ghgId,
        Type_of_Technology_Used: String(
          sheetDataItem["Type of Technology Used"]
        ).trim(),
        Year_of_installation: parseInt(
          String(sheetDataItem["Installation Year"]).trim()
        ),
        Unit_of_Energy_Generated_in_Kwh: Number(
          String(sheetDataItem["Unit of Energy Generated (in Kwh)"]).trim()
        ),
        created_by: usersession?.userId,
        updated_by: usersession?.userId,
      });
    }
  }
  const excelSheetDataWithGhgId: TSheetDataWithGhgId[] = [
    {
      sheetRecord: sheetRecord,
      ghgID: ghgIdArray,
      where: [],
    },
  ];
  return excelSheetDataWithGhgId;
};

const SheetInsertionDataMethods: Record<
  TCaptivelActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: Record<string, any>[],
    usersession: TUserSession
  ) => Record<string, any>
> = {
  "Non Renewable Captive Power": async (
    sheet,
    taskRequestActvityTaskRequestData,
    usersession
  ) => {
    return await NonRenewableFuelSheetInsertionData(
      sheet,
      taskRequestActvityTaskRequestData,
      usersession
    );
  },
  // "Renewable Fuel Captive Power": async (
  //   sheet,
  //   taskRequestActvityTaskRequestData,
  //   usersession
  // ) => {
  //   return await RenewableFuelSheetInsertionData(
  //     sheet,
  //     taskRequestActvityTaskRequestData,
  //     usersession
  //   );
  // },
  "Renewable Captive Power": async (
    sheet,
    taskRequestActvityTaskRequestData,
    usersession
  ) => {
    return await RenewableSheetInsertionData(
      sheet,
      taskRequestActvityTaskRequestData,
      usersession
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: Record<string, any>[],
  usersession: TUserSession
) => {
  const finalSheetDataEntries: {
    [key in TCaptivelActivitySheetNames]: TSheetDataWithGhgId[];
  } = {
    "Non Renewable Captive Power": [],
    "Renewable Captive Power": [],
    // "Renewable Fuel Captive Power": [],
  };

  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TCaptivelActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      taskRequestActvityTaskRequestData,
      usersession
    )) as TSheetDataWithGhgId[];
  }
  const sdk = await getGraphQlServerSDK();
  const response = await sdk.upsertCaptivePowerActivity({
    GHGEnergy_CaptivePower_NonRenewable_id:
      finalSheetDataEntries["Non Renewable Captive Power"][0]?.ghgID ?? [],
    GHGEnergy_CaptivePower_Renewable_id:
      finalSheetDataEntries["Renewable Captive Power"][0]?.ghgID ?? [],
    NonRenewabledata:
      finalSheetDataEntries["Non Renewable Captive Power"][0]?.sheetRecord ??
      [],
    Renewabledata:
      finalSheetDataEntries["Renewable Captive Power"][0]?.sheetRecord ?? [],
  });
  return response;
};

/**
 * Converts manual entry data to Excel sheet format compatible with saveCaptivePowerSheetEntries (Renewable)
 * @param manualData - Single row of manual entry data for renewable captive power
 * @returns TExcelSheet[] - Excel sheet format data
 */
export const convertRenewableManualEntryToExcelSheet = (
  manualData: Record<string, any>
): TExcelSheet[] => {
  // Map manual entry field names to Excel column names for Renewable Captive Power
  const excelRow: Record<string, any> = {
    Year: Number(manualData.year),
    Month: manualData.month,
    "Type of Technology Used": manualData.typeOfTechnologyUsed,
    "Installation Year": Number(manualData.yearOfInstallation),
    "Unit of Energy Generated (in Kwh)": Number(
      manualData.unitOfEnergyGeneratedInKwh
    ),
  };
  // Preserve ID for edit operations (needed for duplicate validation)
  if (manualData.id) {
    excelRow.id = manualData.id;
  }
  if (manualData.row_id) {
    excelRow.row_id = manualData.row_id;
  }

  // Return all three sheet names expected by validateSheetMethods
  return [
    {
      sheetName: "Renewable Captive Power",
      data: [excelRow],
    },
    {
      sheetName: "Non Renewable Captive Power",
      data: [],
    },
    // {
    //   sheetName: "Renewable Fuel Captive Power",
    //   data: [],
    // },
  ];
};

/**
 * Converts manual entry data to Excel sheet format compatible with saveCaptivePowerSheetEntries (Non-Renewable)
 * @param manualData - Single row of manual entry data for non-renewable captive power
 * @returns TExcelSheet[] - Excel sheet format data
 */
export const convertNonRenewableManualEntryToExcelSheet = (
  manualData: Record<string, any>
): TExcelSheet[] => {
  // Map manual entry field names to Excel column names for Non-Renewable Captive Power
  const excelRow: Record<string, any> = {
    Year: Number(manualData.year),
    Month: manualData.month,
    "Type of Fuel Used": manualData.typeOfFuelUsed,
    "Quantity of fuel consumed": Number(manualData.quantityOfFuelConsumed),
    "UoM for the Quantity of Fuel consumed":
      manualData.UoM_for_the_quantity_of_fuel_consumed,
    "Quality of fuel": manualData.qualityOfFuel
      ? Number(manualData.qualityOfFuel)
      : "",
    "Unit of Energy Generated (in Kwh)": Number(
      manualData.unitOfEnergyGeneratedInKwh
    ),
  };
  // Preserve ID for edit operations (needed for duplicate validation)
  if (manualData.id) {
    excelRow.id = manualData.id;
  }
  if (manualData.row_id) {
    excelRow.row_id = manualData.row_id;
  }
  // Return all three sheet names expected by validateSheetMethods
  return [
    {
      sheetName: "Renewable Captive Power",
      data: [],
    },
    {
      sheetName: "Non Renewable Captive Power",
      data: [excelRow],
    },
    // {
    //   sheetName: "Renewable Fuel Captive Power",
    //   data: [],
    // },
  ];
};
