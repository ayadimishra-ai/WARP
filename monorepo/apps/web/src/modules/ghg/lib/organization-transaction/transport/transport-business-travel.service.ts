import { UUID } from "crypto";
import * as _ from "lodash";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgTransport_BusinessTravel_Insert_Input,
  TravelDistance,
  TravelDistance_Insert_Input,
} from "@/modules/ghg/graphql/shared/types";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TBusinessSheetDataWithIdandDistanceData,
  TExcelSheet,
  getTaskRequestActvityTaskRequestId,
} from "@/modules/ghg/lib/excel/excel.service";
import { TTransport_Business_TravelActivitySheetNames } from "@/modules/ghg/shared/constants/activity.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

const GhgTransport_BusinessTravelSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userId: UUID,
  organizationId: UUID
) => {
  const sdk = await getGraphQlServerSDK();
  const sheetRecord: GhgTransport_BusinessTravel_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  const ExcelDatawhereCondition: Record<string, any>[] = [];
  const TravelDistancewhereCondition: Record<string, any>[] = [];
  const travelDistanceInsertInput: TravelDistance_Insert_Input[] = [];
  excelSheetData.data.forEach((sheetDataItem) => {
    TravelDistancewhereCondition.push({
      _and: {
        from_location_pincode: {
          _eq: sanitizeString.v4(
            String(sheetDataItem["Trip Start Location Pincode"])
          ),
        },
        from_location_country: {
          _ilike: sanitizeString.v4(
            String(sheetDataItem["Trip Start Location Country"])
          ),
        },
        to_location_pincode: {
          _eq: sanitizeString.v4(
            String(sheetDataItem["Trip End Location Pincode"])
          ),
        },
        to_location_country: {
          _ilike: sanitizeString.v4(
            String(sheetDataItem["Trip End Location Country"])
          ),
        },
        mode_of_transport: {
          _ilike: sanitizeString.v4(String(sheetDataItem["Mode of Transport"])),
        },
        // distance: {
        //   _is_null: false,
        // },
        is_deleted: { _eq: false },
      },
    });
    ExcelDatawhereCondition.push({
      from_location_pincode: sanitizeString.v4(
        String(sheetDataItem["Trip Start Location Pincode"])
      ),
      from_location_country: sanitizeString.v4(
        String(sheetDataItem["Trip Start Location Country"])
      ),
      to_location_pincode: sanitizeString.v4(
        String(sheetDataItem["Trip End Location Pincode"])
      ),
      to_location_country: sanitizeString.v4(
        String(sheetDataItem["Trip End Location Country"])
      ),
      mode_of_transport: sanitizeString.v4(
        String(sheetDataItem["Mode of Transport"])
      ),
    });
  });
  // Remove Duplicate From Travel Distance
  const uniqueTravelDistanceWhereCondition = _.uniqWith(
    TravelDistancewhereCondition,
    _.isEqual
  );
  const UniqueExcelData = _.uniqWith(ExcelDatawhereCondition, _.isEqual);
  // Dividing the whole api calls of Travel Distance into batches to avoid memory exhaust issue
  const batchSize = 1000; // Define your batch size
  const allWhere = uniqueTravelDistanceWhereCondition;

  const processBatch = async (whereBatch: any[]): Promise<any> => {
    return await sdk.getTravelDistanceDetail({
      where: { _or: whereBatch },
    });
  };

  // Storing response to this object for travel distance
  const TravelDistanceData: { TravelDistance: TravelDistance[] } = {
    TravelDistance: [],
  };
  for (let i = 0; i < allWhere.length; i += batchSize) {
    const whereBatch = allWhere.slice(i, i + batchSize);
    const res = await processBatch(whereBatch);
    if (res && res.TravelDistance && res.TravelDistance.length > 0) {
      TravelDistanceData.TravelDistance = [
        ...TravelDistanceData.TravelDistance,
        ...res.TravelDistance,
      ];
    }
  }
  const dataforEtlApiHit = UniqueExcelData?.filter(
    (obj1) =>
      !TravelDistanceData.TravelDistance.some(
        (obj2) =>
          sanitizeString.v4(String(obj1.from_location_pincode)) ==
            sanitizeString.v4(String(obj2.from_location_pincode)) &&
          sanitizeString.v4(String(obj1.from_location_country)) ==
            sanitizeString.v4(String(obj2.from_location_country)) &&
          sanitizeString.v4(String(obj1.to_location_pincode)) ==
            sanitizeString.v4(String(obj2.to_location_pincode)) &&
          sanitizeString.v4(String(obj1.to_location_country)) ==
            sanitizeString.v4(String(obj2.to_location_country)) &&
          sanitizeString.v4(String(obj1.mode_of_transport)) ==
            sanitizeString.v4(String(obj2.mode_of_transport))
      )
  ) as Record<string, any>[];
  // Store calculated distance if those distance are not found in Address Distance table
  for (let j = 0; j < dataforEtlApiHit.length; j++) {
    travelDistanceInsertInput.push({
      distance: null,
      from_location_pincode: sanitizeString.v4(
        String(dataforEtlApiHit[j].from_location_pincode)
      ),
      from_location_country: sanitizeString.v4(
        String(dataforEtlApiHit[j].from_location_country)
      ),
      to_location_country: sanitizeString.v4(
        String(dataforEtlApiHit[j].to_location_country)
      ),
      to_location_pincode: sanitizeString.v4(
        String(dataforEtlApiHit[j].to_location_pincode)
      ),
      mode_of_transport: sanitizeString.v4(
        String(dataforEtlApiHit[j].mode_of_transport)
      ),
    });
  }
  for (let i = 0; i < excelSheetData.data.length; i++) {
    let ActivityTaskData = taskRequestActvityTaskRequestData.filter(
      (dataitem: Record<string, any>) =>
        sanitizeString.v1(dataitem.month) ==
          sanitizeString.v1(excelSheetData.data[i]["Month"]) &&
        dataitem.year ==
          parseInt(sanitizeString.v2(String(excelSheetData.data[i]["Year"])))
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
      let tripdistance = null;
      const travelDistanceData = TravelDistanceData?.TravelDistance.filter(
        (item) =>
          sanitizeString.v4(String(item.from_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[i]["Trip Start Location Pincode"])
            ) &&
          sanitizeString.v4(String(item.from_location_country)) ==
            sanitizeString.v4(
              excelSheetData.data[i]["Trip Start Location Country"]
            ) &&
          sanitizeString.v4(String(item.mode_of_transport)) ==
            sanitizeString.v4(excelSheetData.data[i]["Mode of Transport"]) &&
          sanitizeString.v4(String(item.to_location_pincode)) ==
            sanitizeString.v4(
              String(excelSheetData.data[i]["Trip End Location Pincode"])
            ) &&
          sanitizeString.v4(String(item.to_location_country)) ==
            sanitizeString.v4(
              excelSheetData.data[i]["Trip End Location Country"]
            )
      );
      if (travelDistanceData.length > 0) {
        tripdistance = travelDistanceData[0].distance;
      } else {
        if (
          sanitizeString
            .v4(String(excelSheetData.data[i]["Trip Start Location Pincode"]))
            .trim() ==
          sanitizeString.v4(
            String(excelSheetData.data[i]["Trip End Location Pincode"])
          )
        ) {
          tripdistance = 0;
        }
      }
      sheetRecord.push({
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Mode_of_Transport: excelSheetData.data[i]["Mode of Transport"].trim(),
        Vehicle_Type_Used_for_Road_Transport:
          excelSheetData.data[i]["Vehicle Type Used"].trim(),
        Fuel_Used: excelSheetData.data[i]["Fuel Used"].trim(),
        Trip_From_Pincode: String(
          excelSheetData.data[i]["Trip Start Location Pincode"]
        ).trim(),
        Trip_To_Pincode: String(
          excelSheetData.data[i]["Trip End Location Pincode"]
        ).trim(),
        Trip_Distance: tripdistance,
        Trip_From_Country:
          excelSheetData.data[i]["Trip Start Location Country"].trim(),
        Trip_To_Country:
          excelSheetData.data[i]["Trip End Location Country"].trim(),
        Trip_No_of_Employees_Travelled: parseInt(
          String(excelSheetData.data[i]["Number Of Employees"]).trim()
        ),
        created_by: userId,
        updated_by: userId,
      });
    }
  }
  const excelSheetDataWithGhgId: TBusinessSheetDataWithIdandDistanceData[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
      travelDistance: travelDistanceInsertInput,
    },
  ];
  return excelSheetDataWithGhgId;
};

const SheetInsertionDataMethods: Record<
  TTransport_Business_TravelActivitySheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
    userId: UUID,
    organizationId: UUID
  ) => Record<string, any>
> = {
  "Business Travel": async (
    sheet,
    taskRequestActvityTaskRequestData,
    userId,
    organizationId
  ) => {
    return await GhgTransport_BusinessTravelSheetInsertionData(
      sheet,
      taskRequestActvityTaskRequestData,
      userId,
      organizationId
    );
  },
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActvityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession
) => {
  const finalSheetDataEntries: {
    [key in TTransport_Business_TravelActivitySheetNames]: TBusinessSheetDataWithIdandDistanceData[];
  } = { "Business Travel": [] };
  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TTransport_Business_TravelActivitySheetNames;
    finalSheetDataEntries[sheetName] = (await SheetInsertionDataMethods[
      sheetName
    ](
      excelData[i],
      taskRequestActvityTaskRequestData,
      userSession.userId as UUID,
      userSession.organizationId as UUID
    )) as TBusinessSheetDataWithIdandDistanceData[];
  }
  const sdk = await getGraphQlServerSDK();

  // Dividing api calls into batches to avoid memory exhaust issue
  const batchSize = 1000; // Define your batch size
  const allWhere = _.uniqWith(
    finalSheetDataEntries["Business Travel"][0].where,
    _.isEqual
  );
  const allData = finalSheetDataEntries["Business Travel"][0].sheetRecord;
  const allTravelDistanceData =
    finalSheetDataEntries["Business Travel"][0].travelDistance;
  const processBatch = async (
    batch: any[],
    whereBatch: any[],
    distanceBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertGHGTransport_BusinessTravelActivity({
      where: { _or: whereBatch },
      businessTraveldata: batch,
      TravelDistanceData: distanceBatch,
    });
  };

  // Storing response to this object
  const response: any = {
    insert_GHGTransport_BusinessTravel: {
      returning: [],
    },
    delete_GHGTransport_BusinessTravel: {
      returning: [],
    },
  };

  for (let i = 0; i < allData.length; i += batchSize) {
    const whereBatch = allWhere.slice(i, i + batchSize);
    const batch = allData.slice(i, i + batchSize);
    const distanceBatch = allTravelDistanceData.slice(i, i + batchSize);
    const res = await processBatch(batch, whereBatch, distanceBatch);
    if (
      res &&
      res.insert_GHGTransport_BusinessTravel &&
      res.insert_GHGTransport_BusinessTravel.returning &&
      res.insert_GHGTransport_BusinessTravel.returning.length > 0
    ) {
      response.insert_GHGTransport_BusinessTravel.returning = [
        ...response.insert_GHGTransport_BusinessTravel.returning,
        ...res.insert_GHGTransport_BusinessTravel.returning,
      ];
    }
    if (
      res &&
      res.delete_GHGTransport_BusinessTravel &&
      res.delete_GHGTransport_BusinessTravel.returning &&
      res.delete_GHGTransport_BusinessTravel.returning.length > 0
    ) {
      response.delete_GHGTransport_BusinessTravel.returning = [
        ...response.delete_GHGTransport_BusinessTravel.returning,
        ...res.delete_GHGTransport_BusinessTravel.returning,
      ];
    }
  }
  return response;
};

export const saveTransportBusinessSheetEntries = async (
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
      "GHGTransport_BusinessTravel"
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
