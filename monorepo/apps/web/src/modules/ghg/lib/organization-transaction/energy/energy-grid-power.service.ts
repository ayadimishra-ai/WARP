import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgEnergyConsumption_GridPower_Insert_Input,
  GhgEnergyConsumption_GridPower_Updates,
} from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetGridDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "@/modules/ghg/lib/excel/excel.service";
import { TGridPowerSheetNames } from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

const GridPowerDetailsSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userId: UUID
) => {
  const sheetRecord: GhgEnergyConsumption_GridPower_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  let gridpower_data: Record<string, any>[] = [];
  let data: GhgEnergyConsumption_GridPower_Updates[] = [];
  const taskRequestIds = taskRequestActvityTaskRequestData.map(
    (item) => item.taskRequestId
  );
  const sdk = await getGraphQlServerSDK();
  const powerConsumptionData: any = await sdk.getPowerConsumptionData({
    task_request_id: taskRequestIds,
  });
  if (powerConsumptionData.GHGEnergyConsumption_GridPower.length > 0) {
    gridpower_data = powerConsumptionData.GHGEnergyConsumption_GridPower;
    //get power consumption data from task request id on data
    //check power consumption data insertion manual/ai
  }

  excelSheetData.data.forEach((sheetDataItem) => {
    let ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(dataitem.month) ==
          sanitizeString.v1(sheetDataItem["Month"]) &&
        dataitem.year == sheetDataItem["Year"]
    );
    if (ActivityTaskData.length > 0) {
      let metadata: Record<string, any> = gridpower_data.filter(
        (itemrow: Record<string, any>) =>
          sanitizeString.v1(itemrow.task_request_id) ==
          sanitizeString.v1(ActivityTaskData[0].taskRequestId)
      );
      if (
        metadata.length === 0 ||
        (metadata.length > 0 && metadata[0].metadata == null)
      ) {
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
        sheetRecord.push({
          task_request_id: ActivityTaskData[0].taskRequestId,
          organization_address_id: ActivityTaskData[0].organization_address_id,
          activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
          Name_of_Distribution_Company:
            sheetDataItem["Name of Distribution Company"].trim(),
          PowerConsumed_through_Grid_Kwh: Number(
            String(
              sheetDataItem["Units of Power Consumed - Grid (in Kwh)"]
            ).trim()
          ),
          NameOfCompany_PPA_Renewable:
            sheetDataItem["PPA Company Name - Renewable"].trim(),
          PowerPurchased_through_PPA_Kwh_Renewable: Number(
            String(
              sheetDataItem["Units of Renewable power - PPA (in Kwh)"]
            ).trim()
          ),

          NameOfCompany_PPA_NonRenewable:
            sheetDataItem["PPA Company Name - Non Renewable"].trim(),
          PowerPurchased_through_PPA_Kwh_NonRenewable: Number(
            String(
              sheetDataItem["Units of Non Renewable power - PPA (in Kwh)"]
            ).trim()
          ),
          Name_of_company_for_REC: sheetDataItem["REC Company"].trim(),
          PowerPurchased_through_REC_Kwh: Number(
            String(
              sheetDataItem["Units of power purchased - REC (in Kwh)"]
            ).trim()
          ),
          created_by: userId,
          updated_by: userId,
        });
      } else {
        data.push({
          where: { id: { _eq: metadata[0].id } },
          _set: {
            Name_of_Distribution_Company:
              sheetDataItem["Name of Distribution Company"].trim(),
            // PowerConsumed_through_Grid_Kwh: updated_units,
            NameOfCompany_PPA_Renewable:
              sheetDataItem["PPA Company Name - Renewable"].trim(),
            PowerPurchased_through_PPA_Kwh_Renewable: Number(
              String(
                sheetDataItem["Units of Renewable power - PPA (in Kwh)"]
              ).trim()
            ),

            NameOfCompany_PPA_NonRenewable:
              sheetDataItem["PPA Company Name - Non Renewable"].trim(),
            PowerPurchased_through_PPA_Kwh_NonRenewable: Number(
              String(
                sheetDataItem["Units of Non Renewable power - PPA (in Kwh)"]
              ).trim()
            ),
            Name_of_company_for_REC: sheetDataItem["REC Company"].trim(),
            PowerPurchased_through_REC_Kwh: Number(
              String(
                sheetDataItem["Units of power purchased - REC (in Kwh)"]
              ).trim()
            ),
            updated_by: userId,
            updated_at: new Date(),
          },
        });
      }
    }
  });
  const excelSheetDataWithGhgId: TSheetGridDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      UpdateRecord: data,
      where: whereCondition,
    },
  ];
  return excelSheetDataWithGhgId;
};

const SheetInsertionDataMethods: Record<
  TGridPowerSheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
    userId: UUID
  ) => Record<string, any>
> = {
  "Grid Power Details": async (
    sheet,
    taskRequestActvityTaskRequestData,
    userId
  ) => {
    return await GridPowerDetailsSheetInsertionData(
      sheet,
      taskRequestActvityTaskRequestData,
      userId
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const excelSheetData: TExcelSheet[] = [];
  const finalSheetDataEntries: {
    [key in TGridPowerSheetNames]: TSheetGridDataWithId[];
  } = { "Grid Power Details": [] };
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[i].sheetName.trim() as TGridPowerSheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      taskRequestActvityTaskRequestData,
      userSession.userId as UUID
    )) as TSheetGridDataWithId[];
  }
  const sdk = await getGraphQlServerSDK();
  const batchSize = 2000; // Define your batch size
  const allData = finalSheetDataEntries["Grid Power Details"][0].sheetRecord;
  const alldataupdate =
    finalSheetDataEntries["Grid Power Details"][0].UpdateRecord;
  const allWhere = _.uniqWith(
    finalSheetDataEntries["Grid Power Details"][0].where,
    _.isEqual
  );
  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    alldataupdate: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGEnergy_GridPowerActivity({
      where: { _or: whereBatch },
      gridPowerdata: batch,
      GHGEnergy_GridPower_update: alldataupdate,
    });
  };
  const response: any = {
    delete_GHGEnergyConsumption_GridPower: {
      returning: [],
    },
    insert_GHGEnergyConsumption_GridPower: {
      returning: [],
    },
  };
  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, alldataupdate);
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.insert_GHGEnergyConsumption_GridPower.returning = [
      ...response.insert_GHGEnergyConsumption_GridPower.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.insert_GHGEnergyConsumption_GridPower?.returning,
    ];
    // eslint-disable-next-line no-unsafe-optional-chaining
    response.delete_GHGEnergyConsumption_GridPower.returning = [
      ...response.delete_GHGEnergyConsumption_GridPower.returning,
      // eslint-disable-next-line no-unsafe-optional-chaining
      ...res?.delete_GHGEnergyConsumption_GridPower?.returning,
    ];

    if (res.update_GHGEnergyConsumption_GridPower_many.length > 0) {
      res.update_GHGEnergyConsumption_GridPower_many.map((item: any) => {
        response.insert_GHGEnergyConsumption_GridPower.returning = [
          ...response.insert_GHGEnergyConsumption_GridPower.returning,
          // eslint-disable-next-line no-unsafe-optional-chaining
          ...item?.returning,
        ];
      });
    }
  }
  if (allData.length === 0 && alldataupdate.length > 0) {
    for (let i = 0; i < alldataupdate.length; i += batchSize) {
      const batch = alldataupdate.slice(i, i + batchSize);
      const res = await processBatch([], [], batch);
      if (res.update_GHGEnergyConsumption_GridPower_many.length > 0) {
        res.update_GHGEnergyConsumption_GridPower_many.map((item: any) => {
          response.insert_GHGEnergyConsumption_GridPower.returning = [
            ...response.insert_GHGEnergyConsumption_GridPower.returning,
            // eslint-disable-next-line no-unsafe-optional-chaining
            ...item?.returning,
          ];
        });
      }
    }
  }
  // Below code is for single upload of all records in database
  // const res = await sdk.upsertGHGEnergy_GridPowerActivity({
  //   where: { _or: finalSheetDataEntries["Grid Power Details"][0].where },
  //   gridPowerdata: finalSheetDataEntries["Grid Power Details"][0].sheetRecord,
  // });
  return response;
};

export const saveGridPoweDetailsSheetEntries = async (
  excelData: TExcelSheet[],
  activitycode: string,
  org_address_id: UUID,
  userSession: TUserSession
) => {
  // ghgDataTableName: scopes the approval lock to rows that actually exist in this
  // specific GHG table — prevents false-positive blocks when a sibling activity
  // sharing the same parent ActivityTaskRequest gets approved first.
  const taskRequestActvityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      org_address_id,
      excelData,
      activitycode,
      userSession,
      "GHGEnergyConsumption_GridPower"
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActvityTaskRequestData,
      userSession
    );
    return insertionData;
  }
};

/**
 * Converts manual entry data to Excel sheet format compatible with saveGridPoweDetailsSheetEntries
 * @param manualData - Single row of manual entry data
 * @returns TExcelSheet[] - Excel sheet format data
 */
export const convertManualEntryToExcelSheet = (
  manualData: Record<string, any>
): TExcelSheet[] => {
  // Map manual entry field names to Excel column names
  const excelRow: Record<string, any> = {
    Year: Number(manualData.year),
    Month: manualData.month,
    "Name of Distribution Company": manualData.nameOfDistributionCompany,
    "Units of Power Consumed - Grid (in Kwh)":
      manualData.powerConsumedThroughGridKwh,
    "PPA Company Name - Renewable": manualData.nameOfCompanyPPARenewable,
    "Units of Renewable power - PPA (in Kwh)":
      manualData.powerPurchasedThroughPPAKwhRenewable,
    "PPA Company Name - Non Renewable": manualData.nameOfCompanyPPANonRenewable,
    "Units of Non Renewable power - PPA (in Kwh)":
      manualData.powerPurchasedThroughPPAKwhNonRenewable,
    "REC Company": manualData.nameOfCompanyForREC,
    "Units of power purchased - REC (in Kwh)":
      manualData.powerPurchasedThroughRECKwh,
  };

   // Preserve ID for edit operations (needed for duplicate validation)
  if (manualData.id) {
    excelRow.id = manualData.id;
  }
  if (manualData.row_id) {
    excelRow.row_id = manualData.row_id;
  }

  return [
    {
      sheetName: "Grid Power Details",
      data: [excelRow],
    },
  ];
};
