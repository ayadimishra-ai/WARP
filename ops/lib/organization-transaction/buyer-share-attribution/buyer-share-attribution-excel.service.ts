import { randomUUID, UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  getTaskRequestActvityTaskRequestId,
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetDataWithId,
} from "~/lib/excel/excel.service";
import { sanitizeString } from "~/utils/sanitize.util";
import { TBuyerShareAttributionMainSheetNames } from "./buyer-share-attribution-excel.validation";

export interface GhgBuyerShareResponse {
  insert_GHGBuyer_Share: InsertGhgBuyerShare;
  delete_GHGBuyer_Share: DeleteGhgBuyerShare;
}

export interface InsertGhgBuyerShare {
  returning: any[];
}

export interface DeleteGhgBuyerShare {
  returning: any[];
}

const byMassBuyerShareAttributionSheetInsertionData = (
  excelSheetData: TExcelSheet,
  taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
  userId: UUID,
  totalExcelSheet: TExcelSheet
) => {
  const sheetRecord: any[] = [];
  const whereCondition: Record<string, any>[] = [];

  for (let j = 0; j < excelSheetData.data.length; j++) {
    let sheetDataItem = excelSheetData.data[j];

    let ActivityTaskData = taskRequestActivityTaskRequestData.filter(
      (dataItem: Record<string, any>) => {
        return (
          sanitizeString.v1(dataItem.month) ==
            sanitizeString.v1(sheetDataItem["Month"]) &&
          dataItem.year == sheetDataItem["Year"]
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

      const totalSheetData = totalExcelSheet?.data?.filter(
        (data) =>
          sanitizeString.v1(data["Month"]) ===
            sanitizeString.v1(sheetDataItem["Month"]) &&
          data["Year"] === sheetDataItem["Year"]
      );
      let totalDenominator = 0,
        uom = "";
      if (!!totalSheetData && totalSheetData?.length > 0) {
        totalDenominator =
          totalSheetData[0]["Total Mass of Products Produced in the Facility"];
        uom = String(totalSheetData[0]["UoM"] || "").trim();
      }

      sheetRecord.push({
        id: randomUUID(),
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Buyer_Name: String(sheetDataItem["Buyer Name"]).trim(),
        // Location_Code: sheetDataItem["Supplier Location Code"]?.trim(),
        method: "by_mass",
        by_mass_Mass_of_Products_Purchased:
          sheetDataItem["Mass of Products Purchased by Buyer"],
        by_mass_Total_Mass_of_Products_Produced: totalDenominator,
        by_mass_Mass_of_Products_Produced_UoM: uom,
        created_by: userId,
        updated_by: userId,
      });
    }
  }
  const excelSheetDataWithId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];

  return excelSheetDataWithId;
};

const byVolumeBuyerShareAttributionSheetInsertionData = (
  excelSheetData: TExcelSheet,
  taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
  userId: UUID,
  totalExcelSheet: TExcelSheet
) => {
  const sheetRecord: any[] = [];
  const whereCondition: Record<string, any>[] = [];

  for (let j = 0; j < excelSheetData.data.length; j++) {
    let sheetDataItem = excelSheetData.data[j];

    let ActivityTaskData = taskRequestActivityTaskRequestData.filter(
      (dataItem: Record<string, any>) => {
        return (
          sanitizeString.v1(dataItem.month) ==
            sanitizeString.v1(sheetDataItem["Month"]) &&
          dataItem.year == sheetDataItem["Year"]
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

      const totalSheetData = totalExcelSheet?.data?.filter(
        (data) =>
          sanitizeString.v1(data["Month"]) ===
            sanitizeString.v1(sheetDataItem["Month"]) &&
          data["Year"] === sheetDataItem["Year"]
      );
      let totalDenominator = 0,
        uom = "";
      if (!!totalSheetData && totalSheetData?.length > 0) {
        totalDenominator =
          totalSheetData[0]["Total Volume Produced of all the Products"];
        uom = sanitizeString.v2(String(totalSheetData[0]["UoM"] || ""));
      }

      sheetRecord.push({
        id: randomUUID(),
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Buyer_Name: sanitizeString.v2(String(sheetDataItem["Buyer Name"])),
        // Location_Code: sheetDataItem["Supplier Location Code"]?.trim(),
        method: "by_volume",
        by_volume_Volume_of_Products_Purchased:
          sheetDataItem["Volume of Products Purchased by Buyer"],
        by_volume_Total_Volume_of_Products_Purchased: totalDenominator,
        by_volume_Volume_of_Products_Purchased_UoM: uom,
        created_by: userId,
        updated_by: userId,
      });
    }
  }
  const excelSheetDataWithId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];

  return excelSheetDataWithId;
};

const byRevenueBuyerShareAttributionSheetInsertionData = (
  excelSheetData: TExcelSheet,
  taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
  userId: UUID,
  totalExcelSheet: TExcelSheet
) => {
  const sheetRecord: any[] = [];
  const whereCondition: Record<string, any>[] = [];

  for (let j = 0; j < excelSheetData.data.length; j++) {
    let sheetDataItem = excelSheetData.data[j];

    let ActivityTaskData = taskRequestActivityTaskRequestData.filter(
      (dataItem: Record<string, any>) => {
        return (
          sanitizeString.v1(dataItem.month) ==
            sanitizeString.v1(sheetDataItem["Month"]) &&
          dataItem.year == sheetDataItem["Year"]
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

      const totalSheetData = totalExcelSheet?.data?.filter(
        (data) =>
          sanitizeString.v1(data["Month"]) ===
            sanitizeString.v1(sheetDataItem["Month"]) &&
          data["Year"] === sheetDataItem["Year"]
      );
      let totalDenominator = 0,
        uom = "";
      if (!!totalSheetData && totalSheetData?.length > 0) {
        totalDenominator =
          totalSheetData[0]["Total Market Value of Products Produced"];
        uom = sanitizeString.v2(String(totalSheetData[0]["UoM"] || ""));
      }

      sheetRecord.push({
        id: randomUUID(),
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Buyer_Name: sanitizeString.v2(String(sheetDataItem["Buyer Name"])),
        // Location_Code: sheetDataItem["Supplier Location Code"]?.trim(),
        method: "by_revenue",
        by_revenue_Market_Value_of_Products_Purchased:
          sheetDataItem["Market Value of Products Purchased by Buyer"],
        by_revenue_Total_Market_Value_of_Products_Produced: totalDenominator,
        by_revenue_Market_Value_of_Products_Purchased_UoM: uom,
        created_by: userId,
        updated_by: userId,
      });
    }
  }
  const excelSheetDataWithId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];

  return excelSheetDataWithId;
};

const byNumberOfUnitsBuyerShareAttributionSheetInsertionData = (
  excelSheetData: TExcelSheet,
  taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
  userId: UUID,
  totalExcelSheet: TExcelSheet
) => {
  const sheetRecord: any[] = [];
  const whereCondition: Record<string, any>[] = [];

  for (let j = 0; j < excelSheetData.data.length; j++) {
    let sheetDataItem = excelSheetData.data[j];

    let ActivityTaskData = taskRequestActivityTaskRequestData.filter(
      (dataItem: Record<string, any>) => {
        return (
          sanitizeString.v1(dataItem.month) ==
            sanitizeString.v1(sheetDataItem["Month"]) &&
          dataItem.year == sheetDataItem["Year"]
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

      const totalSheetData = totalExcelSheet?.data?.filter(
        (data) =>
          sanitizeString.v1(data["Month"]) ===
            sanitizeString.v1(sheetDataItem["Month"]) &&
          data["Year"] === sheetDataItem["Year"]
      );
      let totalDenominator = 0;

      if (!!totalSheetData && totalSheetData?.length > 0) {
        totalDenominator = totalSheetData[0]["Total Number of Units Produced"];
      }

      sheetRecord.push({
        id: randomUUID(),
        task_request_id: ActivityTaskData[0].taskRequestId,
        organization_address_id: ActivityTaskData[0].organization_address_id,
        activity_task_request_id: ActivityTaskData[0].activityTaskRequestId,
        Buyer_Name: sanitizeString.v2(String(sheetDataItem["Buyer Name"])),
        // Location_Code: sheetDataItem["Supplier Location Code"]?.trim(),
        method: "by_number_of_units",
        by_number_of_units_Number_of_Units_Purchased:
          sheetDataItem["Number of Units Purchased by Buyer"],
        by_number_of_units_Total_Number_of_Units_Produced: totalDenominator,
        created_by: userId,
        updated_by: userId,
      });
    }
  }
  const excelSheetDataWithId: TSheetDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      where: whereCondition,
    },
  ];

  return excelSheetDataWithId;
};

const SheetInsertionDataMethods: Record<
  TBuyerShareAttributionMainSheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
    userId: UUID,
    totalExcelSheet: TExcelSheet
  ) => Record<string, any>
> = {
  "By Mass": byMassBuyerShareAttributionSheetInsertionData,
  "By Volume": byVolumeBuyerShareAttributionSheetInsertionData,
  "By Revenue": byRevenueBuyerShareAttributionSheetInsertionData,
  "By Number of Units": byNumberOfUnitsBuyerShareAttributionSheetInsertionData,
};

const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActivityTaskRequestData: TActivityTaskRequestMasterData[],
  userSession: TUserSession,
  buyerShareMethod: string
) => {
  const finalSheetDataEntries: {
    [key in TBuyerShareAttributionMainSheetNames]: TSheetDataWithId[];
  } = {
    "By Mass": [],
    "By Volume": [],
    "By Revenue": [],
    "By Number of Units": [],
  };
  excelData.forEach((sheet, index) => {
    const sheetName =
      sheet.sheetName.trim() as TBuyerShareAttributionMainSheetNames;
    if (
      sheetName === "By Mass" ||
      sheetName === "By Volume" ||
      sheetName === "By Revenue" ||
      sheetName === "By Number of Units"
    ) {
      finalSheetDataEntries[sheetName] = SheetInsertionDataMethods[sheetName](
        sheet,
        taskRequestActivityTaskRequestData,
        userSession.userId as UUID,
        excelData[index - 1]
      ) as TSheetDataWithId[];
    }
  });
  const sdk = await getGraphQlServerSDK();
  const batchSize = 2000; // Define your batch size

  // Convert to batches for optimization
  const byMassData = finalSheetDataEntries["By Mass"][0]?.sheetRecord;
  const byMassWhere = _.uniqWith(
    finalSheetDataEntries["By Mass"][0]?.where,
    _.isEqual
  );
  const byVolumeData = finalSheetDataEntries["By Volume"][0]?.sheetRecord;
  const byVolumeWhere = _.uniqWith(
    finalSheetDataEntries["By Volume"][0]?.where,
    _.isEqual
  );
  const byRevenueData = finalSheetDataEntries["By Revenue"][0]?.sheetRecord;
  const byRevenueWhere = _.uniqWith(
    finalSheetDataEntries["By Revenue"][0]?.where,
    _.isEqual
  );
  const byNumberOfUnitsData =
    finalSheetDataEntries["By Number of Units"][0]?.sheetRecord;
  const byNumberOfUnitsWhere = _.uniqWith(
    finalSheetDataEntries["By Number of Units"][0]?.where,
    _.isEqual
  );

  const processBatch = async (
    batch: any[],
    whereBatch: any[]
  ): Promise<any> => {
    return await sdk.upsertBuyerShareAttribution({
      where: { _or: whereBatch },
      buyerShareData: batch,
    });
  };

  const response: GhgBuyerShareResponse = {
    insert_GHGBuyer_Share: {
      returning: [],
    },
    delete_GHGBuyer_Share: {
      returning: [],
    },
  };

  const pushResToResponse = (res: any) => {
    if (
      res &&
      res.insert_GHGBuyer_Share &&
      res.insert_GHGBuyer_Share.returning &&
      res.insert_GHGBuyer_Share.returning.length > 0
    ) {
      response.insert_GHGBuyer_Share.returning = [
        ...response.insert_GHGBuyer_Share.returning,
        ...res.insert_GHGBuyer_Share.returning,
      ];
    }
    if (
      res &&
      res.delete_GHGBuyer_Share &&
      res.delete_GHGBuyer_Share.returning &&
      res.delete_GHGBuyer_Share.returning.length > 0
    ) {
      response.delete_GHGBuyer_Share.returning = [
        ...response.delete_GHGBuyer_Share.returning,
        ...res.delete_GHGBuyer_Share.returning,
      ];
    }
  };

  // Prevent other data to be inserted
  // Only those type of data are inserted which is mentioned in org's metadata
  // If No data mentioned on org's metadata, NO data will be inserted in the "GHGBuyer_Share" Table
  if (buyerShareMethod === "by_mass") {
    for (let i = 0; i < byMassData.length; i += batchSize) {
      const batch = byMassData.slice(i, i + batchSize);
      const whereBatch = byMassWhere.slice(i, i + batchSize);
      const res = await processBatch(batch, whereBatch);
      pushResToResponse(res);
    }
  }
  if (buyerShareMethod === "by_volume") {
    for (let i = 0; i < byVolumeData.length; i += batchSize) {
      const batch = byVolumeData.slice(i, i + batchSize);
      const whereBatch = byVolumeWhere.slice(i, i + batchSize);
      const res = await processBatch(batch, whereBatch);
      pushResToResponse(res);
    }
  }
  if (buyerShareMethod === "by_revenue") {
    for (let i = 0; i < byRevenueData.length; i += batchSize) {
      const batch = byRevenueData.slice(i, i + batchSize);
      const whereBatch = byRevenueWhere.slice(i, i + batchSize);
      const res = await processBatch(batch, whereBatch);
      pushResToResponse(res);
    }
  }
  if (buyerShareMethod === "by_number_of_units") {
    for (let i = 0; i < byNumberOfUnitsData.length; i += batchSize) {
      const batch = byNumberOfUnitsData.slice(i, i + batchSize);
      const whereBatch = byNumberOfUnitsWhere.slice(i, i + batchSize);
      const res = await processBatch(batch, whereBatch);
      pushResToResponse(res);
    }
  }
  return response;
};

export const saveBuyerShareAttributionSheetEntries = async (
  excelData: TExcelSheet[],
  activityCode: string,
  orgAddressId: UUID,
  userSession: TUserSession,
  buyerShareMethod: string
) => {
  const taskRequestActivityTaskRequestData =
    (await getTaskRequestActvityTaskRequestId(
      orgAddressId,
      excelData,
      activityCode,
      userSession
    )) as TActivityTaskRequestMasterData[];
  if (
    !!taskRequestActivityTaskRequestData &&
    taskRequestActivityTaskRequestData.length > 0
  ) {
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActivityTaskRequestData,
      userSession,
      buyerShareMethod
    );
    return insertionData;
  }
};
