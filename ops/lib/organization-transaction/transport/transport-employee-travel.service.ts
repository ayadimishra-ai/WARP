import { UUID, randomUUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import { GhgTransport_EmployeeTravel_Insert_Input } from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "~/lib/excel/excel.service";
import { TTransportEmployeeTravelActivitySheetNames } from "~/shared/constants/activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";

const GhgTransport_EmployeeTravelSheetInsertionData = (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userId: UUID
) => {
  const sheetRecord: GhgTransport_EmployeeTravel_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];

  excelSheetData.data.forEach((sheetDataItem) => {
    let ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) => {
        return (
          sanitizeString.v1(dataitem.month) ==
            sanitizeString.v1(sheetDataItem["Month"]) &&
          dataitem.year == sheetDataItem["Year"]
        );
      }
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

      sheetRecord.push({
        id: randomUUID(),
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        PercOfEmp_TravBy_CompOwned_Bus: Number(
          String(
            sheetDataItem[
              "Percentage of Employees Travelled by company owned Bus"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_CompOwned_Bus: Number(
          String(
            sheetDataItem["Average Daily Distance Travelled by Office Bus"]
          ).trim()
        ),
        AvgDailyDist_TravBy_CompOwned_Bus_UoM:
          sheetDataItem["UoM_CompBus"].trim(),
        PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus: Number(
          String(
            sheetDataItem[
              "Percentage of Employees Travelled by Public Transport/Company contracted - Bus"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus: Number(
          String(
            sheetDataItem[
              "Average Daily Distance Travelled by Public Transport - Bus"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus_UoM:
          sheetDataItem["UoM_PubBus"].trim(),
        PercOfEmp_TravBy_PublicTrans_4Wheeler: Number(
          String(
            sheetDataItem[
              "Percentage of Employees Travelled by Public Transport - 4 Wheeler"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PubTrans_4Wheeler: Number(
          String(
            sheetDataItem[
              "Average Daily Distance Travelled by Public Transport - 4 Wheeler"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PubTrans_4Wheeler_UoM:
          sheetDataItem["UoM_4PubWheel"].trim(),
        PercOfEmp_TravBy_PublicTrans_3Wheeler: Number(
          String(
            sheetDataItem[
              "Percentage of Employees Travelled by Public Transport - 3 Wheeler"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PubTrans_3Wheeler: Number(
          String(
            sheetDataItem[
              "Average Daily Distance Travelled by Public Transport - 3 Wheeler"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PubTrans_3Wheeler_UoM:
          sheetDataItem["UoM_3PubWheel"].trim(),
        PercOfEmp_TravBy_PvtVehicle_4Wheeler: Number(
          String(
            sheetDataItem[
              "Percentage of Employees Travelled by Private Vehicle - 4 Wheeler"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PvtVehicle_4Wheeler: Number(
          String(
            sheetDataItem[
              "Average Daily Distance Travelled by Private Vehicle - 4 Wheeler"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PvtVehicle_4Wheeler_UoM:
          sheetDataItem["UoM_4PvtWheel"].trim(),
        PercOfEmp_TravBy_PvtVehicle_2Wheeler: Number(
          String(
            sheetDataItem[
              "Percentage of Employees Travelled by Private Vehicle - 2 Wheeler"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PvtVehicle_2Wheeler: Number(
          String(
            sheetDataItem[
              "Average Daily Distance Travelled (in kms) by Private Vehicle - 2 Wheeler"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_PvtVehicle_2Wheeler_UoM:
          sheetDataItem["UoM_2PvtWheel"].trim(),
        PercOfEmp_TravBy_RailSuburban: Number(
          String(
            sheetDataItem[
              "Percentage of Employees Travelled by Rail - Suburban"
            ]
          ).trim()
        ),
        AvgDailyDist_TravBy_RailSuburban: Number(
          String(
            sheetDataItem["Average Daily Distance Travelled by Rail - Suburban"]
          ).trim()
        ),
        AvgDailyDist_TravBy_RailSuburban_UoM: sheetDataItem["UoM_rail"].trim(),
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
  TTransportEmployeeTravelActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
    userId: UUID
  ) => Record<string, any>
> = {
  "Employee Travel": GhgTransport_EmployeeTravelSheetInsertionData,
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const finalSheetDataEntries: {
    [key in TTransportEmployeeTravelActivitySheetNames]: TSheetDataWithId[];
  } = { "Employee Travel": [] };
  excelData.forEach((sheet) => {
    const sheetName =
      sheet.sheetName.trim() as TTransportEmployeeTravelActivitySheetNames;
    finalSheetDataEntries[sheetName] = SheetInsertionDataMethods[sheetName](
      sheet,
      taskRequestActvityTaskRequestData,
      userSession.userId as UUID
    ) as TSheetDataWithId[];
  });
  const sdk = await getGraphQlServerSDK();
  const batchSize = 2000; // Define your batch size
  const allData = finalSheetDataEntries["Employee Travel"][0].sheetRecord;
  const allWhere = _.uniqWith(
    finalSheetDataEntries["Employee Travel"][0].where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGTransport_EmployeeTravelActivity({
      where: { _or: whereBatch },
      employeeTraveldata: batch,
    });
  };
  const response: any = {
    insert_GHGTransport_EmployeeTravel: {
      returning: [],
    },
    delete_GHGTransport_EmployeeTravel: {
      returning: [],
    },
  };

  for (let i = 0; i < allData.length; i += batchSize) {
    const batch = allData.slice(i, i + batchSize);
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch);
    if (
      res &&
      res.insert_GHGTransport_EmployeeTravel &&
      res.insert_GHGTransport_EmployeeTravel.returning &&
      res.insert_GHGTransport_EmployeeTravel.returning.length > 0
    ) {
      response.insert_GHGTransport_EmployeeTravel.returning = [
        ...response.insert_GHGTransport_EmployeeTravel.returning,
        ...res.insert_GHGTransport_EmployeeTravel.returning,
      ];
    }
    if (
      res &&
      res.delete_GHGTransport_EmployeeTravel &&
      res.delete_GHGTransport_EmployeeTravel.returning &&
      res.delete_GHGTransport_EmployeeTravel.returning.length > 0
    ) {
      response.delete_GHGTransport_EmployeeTravel.returning = [
        ...response.delete_GHGTransport_EmployeeTravel.returning,
        ...res.delete_GHGTransport_EmployeeTravel.returning,
      ];
    }
  }
  return response;
};

export const saveEmployeeTravelSheetEntries = async (
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
      "GHGTransport_EmployeeTravel"
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActvityTaskRequestData &&
    taskRequestActvityTaskRequestData.length > 0
  ) {
    const InsertionData = await getInsertionData(
      excelData,
      taskRequestActvityTaskRequestData,
      userSession
    );
    return InsertionData;
  }
};
