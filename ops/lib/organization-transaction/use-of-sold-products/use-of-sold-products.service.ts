import { UUID } from "crypto";
import _ from "lodash";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GhgUseOfSoldProducts_Electricity_Insert_Input,
  GhgUseOfSoldProducts_Electricity_Updates,
  GhgUseOfSoldProducts_Fuel_Insert_Input,
  GhgUseOfSoldProducts_Fuel_Updates,
  GhgUseOfSoldProducts_Refrigerant_Insert_Input,
  GhgUseOfSoldProducts_Refrigerant_Updates,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import {
  TActivityTaskRequestMasterData,
  TExcelSheet,
  TSheetGridDataWithId,
  getTaskRequestActvityTaskRequestId,
} from "~/lib/excel/excel.service";
import {
  TUseOfSoldProductsSheetNames,
  UseOfSoldProductsConstant,
} from "~/shared/constants/activity.constant";
import { months } from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";

const { sheets: templateSheets } = UseOfSoldProductsConstant.excel_template;

/**
 * Extract working details 1-5 into a metadata JSONB object.
 * Returns null if all working detail fields are empty.
 */
const buildWorkingDetailsMetadata = (row: Record<string, any>) => {
  const metadata: Record<string, any> = {};
  for (let i = 1; i <= 5; i++) {
    const key = `Working details ${i}`;
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      metadata[key] = row[key];
    }
  }
  return Object.keys(metadata).length > 0 ? metadata : null;
};

/**
 * Normalize a Date value from Excel into an ISO 8601 string for the timestamptz column.
 * Handles: number (Excel serial date), Date object, or string (DD-MM-YYYY format).
 * Returns null if the value is empty/undefined.
 *
 * Uses the row's Month and Year columns to detect and correct the Excel day/month swap.
 * Excel (US locale) may interpret a date cell as M/D/YYYY internally; the Month column
 * is used as the source of truth to swap day and month back when needed.
 */
const normalizeExcelDate = (
  val: unknown,
  monthName?: string,
  yearVal?: unknown
): string | null => {
  if (val === null || val === undefined || val === "") return null;

  // Resolve expected month number from the Month column (1-based)
  let expectedMonth = -1;
  if (monthName) {
    const idx = months.findIndex(
      (m) => sanitizeString.v1(m) === sanitizeString.v1(monthName)
    );
    if (idx !== -1) expectedMonth = idx + 1;
  }

  // Resolve expected year from the Year column
  const expectedYear =
    yearVal !== null && yearVal !== undefined ? Number(yearVal) : NaN;

  /**
   * Given a JS Date, correct day/month swap if needed.
   * Returns the corrected ISO string.
   */
  const correctAndFormat = (jsDate: Date): string | null => {
    if (isNaN(jsDate.getTime())) return null;

    let day = jsDate.getDate();
    let month = jsDate.getMonth() + 1; // 1-based
    let year = jsDate.getFullYear();

    // Detect Excel day/month swap: if the extracted month doesn't match
    // the expected Month column, but the extracted day does (and day ≤ 12),
    // then Excel swapped D/M to M/D — swap them back.
    if (
      expectedMonth !== -1 &&
      month !== expectedMonth &&
      day <= 12 &&
      day === expectedMonth
    ) {
      // Swap day and month
      const temp = day;
      day = month;
      month = temp;
    }

    // Build corrected date
    const corrected = new Date(year, month - 1, day);
    if (isNaN(corrected.getTime())) return null;
    return corrected.toISOString();
  };

  // Excel serial date number
  if (typeof val === "number") {
    if (!Number.isFinite(val) || val < 1) return null;
    const excelEpoch = new Date(1899, 11, 30);
    const jsDate = new Date(excelEpoch.getTime() + val * 86400000);
    return correctAndFormat(jsDate);
  }

  // Date object
  if (val instanceof Date) {
    return correctAndFormat(val);
  }

  // String value
  const strVal = String(val).trim();
  if (strVal === "") return null;

  // Try DD-MM-YYYY or D-M-YYYY format (hyphen separator)
  const parts = strVal.split(/[/-]/);
  if (parts.length === 3) {
    const day = parseInt(parts[0], 10);
    const month = parseInt(parts[1], 10);
    const year = parseInt(parts[2], 10);
    if (!isNaN(day) && !isNaN(month) && !isNaN(year)) {
      const date = new Date(year, month - 1, day);
      if (!isNaN(date.getTime())) return date.toISOString();
    }
  }

  // Try parsing as ISO or other standard format
  const parsed = new Date(strVal);
  if (!isNaN(parsed.getTime())) return parsed.toISOString();

  return null;
};

//#region Fuel Sheet Insertion
const FuelSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActivityData: TActivityTaskRequestMasterData[],
  organizationAddressId: UUID,
  userId: UUID
) => {
  const sheetRecord: GhgUseOfSoldProducts_Fuel_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  let existingData: Record<string, any>[] = [];
  let updateData: GhgUseOfSoldProducts_Fuel_Updates[] = [];

  const taskRequestIds = taskRequestActivityData.map(
    (item) => item.taskRequestId
  );

  const sdk = await getGraphQlServerSDK();
  const existingResponse: any = await sdk.getUseOfSoldProductsData({
    task_request_id: taskRequestIds,
  });
  if (existingResponse.GHGUseOfSoldProducts_Fuel.length > 0) {
    existingData = existingResponse.GHGUseOfSoldProducts_Fuel;
  }

  excelSheetData.data.forEach((row) => {
    const activityTaskData = taskRequestActivityData.filter(
      (dataItem) =>
        sanitizeString.v4(dataItem.month) === sanitizeString.v4(row["Month"]) &&
        dataItem.year == row["Year"]
    );

    if (activityTaskData.length > 0) {
      let metadata: Record<string, any>[] = existingData.filter(
        (itemrow: Record<string, any>) =>
          sanitizeString.v1(itemrow.task_request_id) ==
          sanitizeString.v1(activityTaskData[0].taskRequestId)
      );

      if (
        metadata.length === 0 ||
        (metadata.length > 0 && metadata[0].metadata == null)
      ) {
        whereCondition.push({
          _and: {
            task_request_id: { _eq: activityTaskData[0].taskRequestId },
            organization_address_id: {
              _eq: activityTaskData[0].organization_address_id,
            },
            activity_task_request_id: {
              _eq: activityTaskData[0].activityTaskRequestId,
            },
          },
        });
        sheetRecord.push({
          task_request_id: activityTaskData[0].taskRequestId,
          activity_task_request_id: activityTaskData[0].activityTaskRequestId,
          organization_address_id: organizationAddressId,
          Date: normalizeExcelDate(row["Date"], row["Month"], row["Year"]),
          Type_of_Fuel_Consumed: row["Type of Fuel Consumed"],
          Product_Code: String(row["Product Code"] ?? "").trim(),
          Lifetime_of_Product:
            row["Lifetime of Product"]?.toString().trim() || null,
          Rationale: row["Rationale"]?.toString().trim() || null,
          Quantity_of_Fuel_Consumed: Number(
            row["Quantity of Fuel Consumed (product lifetime)"]
          ),
          UoM_of_Fuel_Consumed: row["UoM of Fuel Consumed"],
          Additional_comments: row["Additional comments"] || null,
          Remarks: row["Remarks"] || null,
          metadata: buildWorkingDetailsMetadata(row),
          created_by: userId,
          updated_by: userId,
        });
      } else {
        updateData.push({
          where: { id: { _eq: metadata[0].id } },
          _set: {
            Date: normalizeExcelDate(row["Date"], row["Month"], row["Year"]),
            Type_of_Fuel_Consumed: row["Type of Fuel Consumed"],
            Product_Code: String(row["Product Code"] ?? "").trim(),
            Lifetime_of_Product:
              row["Lifetime of Product"]?.toString().trim() || null,
            Rationale: row["Rationale"]?.toString().trim() || null,
            Quantity_of_Fuel_Consumed: Number(
              row["Quantity of Fuel Consumed (product lifetime)"]
            ),
            UoM_of_Fuel_Consumed: row["UoM of Fuel Consumed"],
            Additional_comments: row["Additional comments"] || null,
            Remarks: row["Remarks"] || null,
            metadata: buildWorkingDetailsMetadata(row),
            updated_by: userId,
            updated_at: new Date(),
          },
        });
      }
    }
  });

  const result: TSheetGridDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      UpdateRecord: updateData,
      where: whereCondition,
    },
  ];
  return result;
};
//#endregion

//#region Electricity Sheet Insertion
const ElectricitySheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActivityData: TActivityTaskRequestMasterData[],
  organizationAddressId: UUID,
  userId: UUID
) => {
  const sheetRecord: GhgUseOfSoldProducts_Electricity_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  let existingData: Record<string, any>[] = [];
  let updateData: GhgUseOfSoldProducts_Electricity_Updates[] = [];

  const taskRequestIds = taskRequestActivityData.map(
    (item) => item.taskRequestId
  );

  const sdk = await getGraphQlServerSDK();
  const existingResponse: any = await sdk.getUseOfSoldProductsData({
    task_request_id: taskRequestIds,
  });
  if (existingResponse.GHGUseOfSoldProducts_Electricity.length > 0) {
    existingData = existingResponse.GHGUseOfSoldProducts_Electricity;
  }

  excelSheetData.data.forEach((row) => {
    const activityTaskData = taskRequestActivityData.filter(
      (dataItem) =>
        sanitizeString.v4(dataItem.month) === sanitizeString.v4(row["Month"]) &&
        dataItem.year == row["Year"]
    );

    if (activityTaskData.length > 0) {
      let metadata: Record<string, any>[] = existingData.filter(
        (itemrow: Record<string, any>) =>
          sanitizeString.v1(itemrow.task_request_id) ==
          sanitizeString.v1(activityTaskData[0].taskRequestId)
      );

      if (
        metadata.length === 0 ||
        (metadata.length > 0 && metadata[0].metadata == null)
      ) {
        whereCondition.push({
          _and: {
            task_request_id: { _eq: activityTaskData[0].taskRequestId },
            organization_address_id: {
              _eq: activityTaskData[0].organization_address_id,
            },
            activity_task_request_id: {
              _eq: activityTaskData[0].activityTaskRequestId,
            },
          },
        });
        sheetRecord.push({
          task_request_id: activityTaskData[0].taskRequestId,
          activity_task_request_id: activityTaskData[0].activityTaskRequestId,
          organization_address_id: organizationAddressId,
          Date: normalizeExcelDate(row["Date"], row["Month"], row["Year"]),
          Product_Code: String(row["Product Code"] ?? "").trim(),
          Lifetime_of_Product:
            row["Lifetime of Product"]?.toString().trim() || null,
          Rationale: row["Rationale"]?.toString().trim() || null,
          Region: row["Region"],
          Units_of_Electricity_consumed_in_kWh: Number(
            row["Units of Electricity consumed in kWh (product lifetime)"]
          ),
          Additional_comments: row["Additional comments"] || null,
          Remarks: row["Remarks"] || null,
          metadata: buildWorkingDetailsMetadata(row),
          created_by: userId,
          updated_by: userId,
        });
      } else {
        updateData.push({
          where: { id: { _eq: metadata[0].id } },
          _set: {
            Date: normalizeExcelDate(row["Date"], row["Month"], row["Year"]),
            Product_Code: String(row["Product Code"] ?? "").trim(),
            Lifetime_of_Product:
              row["Lifetime of Product"]?.toString().trim() || null,
            Rationale: row["Rationale"]?.toString().trim() || null,
            Region: row["Region"],
            Units_of_Electricity_consumed_in_kWh: Number(
              row["Units of Electricity consumed in kWh (product lifetime)"]
            ),
            Additional_comments: row["Additional comments"] || null,
            Remarks: row["Remarks"] || null,
            metadata: buildWorkingDetailsMetadata(row),
            updated_by: userId,
            updated_at: new Date(),
          },
        });
      }
    }
  });

  const result: TSheetGridDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      UpdateRecord: updateData,
      where: whereCondition,
    },
  ];
  return result;
};
//#endregion

//#region Refrigerant Sheet Insertion
const RefrigerantSheetInsertionData = async (
  excelSheetData: TExcelSheet,
  taskRequestActivityData: TActivityTaskRequestMasterData[],
  organizationAddressId: UUID,
  userId: UUID
) => {
  const sheetRecord: GhgUseOfSoldProducts_Refrigerant_Insert_Input[] = [];
  const whereCondition: Record<string, any>[] = [];
  let existingData: Record<string, any>[] = [];
  let updateData: GhgUseOfSoldProducts_Refrigerant_Updates[] = [];

  const taskRequestIds = taskRequestActivityData.map(
    (item) => item.taskRequestId
  );

  const sdk = await getGraphQlServerSDK();
  const existingResponse: any = await sdk.getUseOfSoldProductsData({
    task_request_id: taskRequestIds,
  });
  if (existingResponse.GHGUseOfSoldProducts_Refrigerant.length > 0) {
    existingData = existingResponse.GHGUseOfSoldProducts_Refrigerant;
  }

  excelSheetData.data.forEach((row) => {
    const activityTaskData = taskRequestActivityData.filter(
      (dataItem) =>
        sanitizeString.v4(dataItem.month) === sanitizeString.v4(row["Month"]) &&
        dataItem.year == row["Year"]
    );

    if (activityTaskData.length > 0) {
      let metadata: Record<string, any>[] = existingData.filter(
        (itemrow: Record<string, any>) =>
          sanitizeString.v1(itemrow.task_request_id) ==
          sanitizeString.v1(activityTaskData[0].taskRequestId)
      );

      if (
        metadata.length === 0 ||
        (metadata.length > 0 && metadata[0].metadata == null)
      ) {
        whereCondition.push({
          _and: {
            task_request_id: { _eq: activityTaskData[0].taskRequestId },
            organization_address_id: {
              _eq: activityTaskData[0].organization_address_id,
            },
            activity_task_request_id: {
              _eq: activityTaskData[0].activityTaskRequestId,
            },
          },
        });
        sheetRecord.push({
          task_request_id: activityTaskData[0].taskRequestId,
          activity_task_request_id: activityTaskData[0].activityTaskRequestId,
          organization_address_id: organizationAddressId,
          Date: normalizeExcelDate(row["Date"], row["Month"], row["Year"]),
          Product_Code: String(row["Product Code"] ?? "").trim(),
          Lifetime_of_Product:
            row["Lifetime of Product"]?.toString().trim() || null,
          Rationale: row["Rationale"]?.toString().trim() || null,
          Refrigerant_type_used_in_sold_product:
            row["Refrigerant type used in sold product"],
          Quantity_of_Refrigerant_consumed: Number(
            row["Quantity of Refrigerant consumed"]
          ),
          UoM_of_Refrigerant_consumed: row["UoM of Refrigerant consumed"],
          Additional_comments: row["Additional comments"] || null,
          Remarks: row["Remarks"] || null,
          metadata: buildWorkingDetailsMetadata(row),
          created_by: userId,
          updated_by: userId,
        });
      } else {
        updateData.push({
          where: { id: { _eq: metadata[0].id } },
          _set: {
            Date: normalizeExcelDate(row["Date"], row["Month"], row["Year"]),
            Product_Code: String(row["Product Code"] ?? "").trim(),
            Lifetime_of_Product:
              row["Lifetime of Product"]?.toString().trim() || null,
            Rationale: row["Rationale"]?.toString().trim() || null,
            Refrigerant_type_used_in_sold_product:
              row["Refrigerant type used in sold product"],
            Quantity_of_Refrigerant_consumed: Number(
              row["Quantity of Refrigerant consumed"]
            ),
            UoM_of_Refrigerant_consumed: row["UoM of Refrigerant consumed"],
            Additional_comments: row["Additional comments"] || null,
            Remarks: row["Remarks"] || null,
            metadata: buildWorkingDetailsMetadata(row),
            updated_by: userId,
            updated_at: new Date(),
          },
        });
      }
    }
  });

  const result: TSheetGridDataWithId[] = [
    {
      sheetRecord: sheetRecord,
      UpdateRecord: updateData,
      where: whereCondition,
    },
  ];
  return result;
};
//#endregion

//#region Sheet Insertion Data Methods
const SheetInsertionDataMethods: Record<
  TUseOfSoldProductsSheetNames,
  (
    sheet: TExcelSheet,
    taskRequestActivityData: TActivityTaskRequestMasterData[],
    organizationAddressId: UUID,
    userId: UUID
  ) => Promise<TSheetGridDataWithId[]>
> = {
  Fuel: async (sheet, taskRequestActivityData, organizationAddressId, userId) =>
    await FuelSheetInsertionData(
      sheet,
      taskRequestActivityData,
      organizationAddressId,
      userId
    ),
  Electricity: async (
    sheet,
    taskRequestActivityData,
    organizationAddressId,
    userId
  ) =>
    await ElectricitySheetInsertionData(
      sheet,
      taskRequestActivityData,
      organizationAddressId,
      userId
    ),
  Refrigerant: async (
    sheet,
    taskRequestActivityData,
    organizationAddressId,
    userId
  ) =>
    await RefrigerantSheetInsertionData(
      sheet,
      taskRequestActivityData,
      organizationAddressId,
      userId
    ),
};
//#endregion

//#region Get Insertion Data and Batch Process
const getInsertionData = async (
  excelData: TExcelSheet[],
  taskRequestActivityData: TActivityTaskRequestMasterData[],
  organizationAddressId: UUID,
  userSession: TUserSession
) => {
  const finalSheetDataEntries: {
    [key in TUseOfSoldProductsSheetNames]: TSheetGridDataWithId[];
  } = { Fuel: [], Electricity: [], Refrigerant: [] };

  for (let i = 0; i < excelData.length; i++) {
    const sheetName = excelData[
      i
    ].sheetName.trim() as TUseOfSoldProductsSheetNames;
    if (SheetInsertionDataMethods[sheetName]) {
      finalSheetDataEntries[sheetName] = await SheetInsertionDataMethods[
        sheetName
      ](
        excelData[i],
        taskRequestActivityData,
        organizationAddressId,
        userSession.userId as UUID
      );
    }
  }

  const sdk = await getGraphQlServerSDK();
  const batchSize = 2000;

  // Storing response to this object (same pattern as Capital Goods)
  const response: any = {
    insert_GHGUseOfSoldProducts_Fuel: { returning: [] },
    delete_GHGUseOfSoldProducts_Fuel: { returning: [] },
    insert_GHGUseOfSoldProducts_Electricity: { returning: [] },
    delete_GHGUseOfSoldProducts_Electricity: { returning: [] },
    insert_GHGUseOfSoldProducts_Refrigerant: { returning: [] },
    delete_GHGUseOfSoldProducts_Refrigerant: { returning: [] },
  };

  // Process Fuel sheet
  if (finalSheetDataEntries["Fuel"].length > 0) {
    const fuelData = finalSheetDataEntries["Fuel"][0].sheetRecord;
    const fuelUpdate = finalSheetDataEntries["Fuel"][0]
      .UpdateRecord as GhgUseOfSoldProducts_Fuel_Updates[];
    const fuelWhere = _.uniqWith(
      finalSheetDataEntries["Fuel"][0].where,
      _.isEqual
    );

    for (let i = 0; i < fuelData.length; i += batchSize) {
      const batch = fuelData.slice(i, i + batchSize);
      const whereBatch = fuelWhere.slice(i, i + batchSize);
      const res: any = await sdk.upsertUseOfSoldProductsFuel({
        where: { _or: whereBatch },
        fuelData: batch,
        fuelUpdate: fuelUpdate,
      });
      res?.insert_GHGUseOfSoldProducts_Fuel?.returning?.forEach((r: any) => {
        response.insert_GHGUseOfSoldProducts_Fuel.returning.push(r);
      });
      res?.delete_GHGUseOfSoldProducts_Fuel?.returning?.forEach((r: any) => {
        response.delete_GHGUseOfSoldProducts_Fuel.returning.push(r);
      });
      if (
        Array.isArray(res?.update_GHGUseOfSoldProducts_Fuel_many) &&
        res.update_GHGUseOfSoldProducts_Fuel_many.length > 0
      ) {
        res.update_GHGUseOfSoldProducts_Fuel_many.map((item: any) => {
          item?.returning?.forEach((r: any) => {
            response.insert_GHGUseOfSoldProducts_Fuel.returning.push(r);
          });
        });
      }
    }
    if (fuelData.length === 0 && fuelUpdate.length > 0) {
      for (let i = 0; i < fuelUpdate.length; i += batchSize) {
        const batch = fuelUpdate.slice(i, i + batchSize);
        const res: any = await sdk.upsertUseOfSoldProductsFuel({
          where: { _or: [] },
          fuelData: [],
          fuelUpdate: batch,
        });
        if (
          Array.isArray(res?.update_GHGUseOfSoldProducts_Fuel_many) &&
          res.update_GHGUseOfSoldProducts_Fuel_many.length > 0
        ) {
          res.update_GHGUseOfSoldProducts_Fuel_many.map((item: any) => {
            item?.returning?.forEach((r: any) => {
              response.insert_GHGUseOfSoldProducts_Fuel.returning.push(r);
            });
          });
        }
      }
    }
  }

  // Process Electricity sheet
  if (finalSheetDataEntries["Electricity"].length > 0) {
    const electricityData = finalSheetDataEntries["Electricity"][0].sheetRecord;
    const electricityUpdate = finalSheetDataEntries["Electricity"][0]
      .UpdateRecord as GhgUseOfSoldProducts_Electricity_Updates[];
    const electricityWhere = _.uniqWith(
      finalSheetDataEntries["Electricity"][0].where,
      _.isEqual
    );

    for (let i = 0; i < electricityData.length; i += batchSize) {
      const batch = electricityData.slice(i, i + batchSize);
      const whereBatch = electricityWhere.slice(i, i + batchSize);
      const res: any = await sdk.upsertUseOfSoldProductsElectricity({
        where: { _or: whereBatch },
        electricityData: batch,
        electricityUpdate: electricityUpdate,
      });
      res?.insert_GHGUseOfSoldProducts_Electricity?.returning?.forEach(
        (r: any) => {
          response.insert_GHGUseOfSoldProducts_Electricity.returning.push(r);
        }
      );
      res?.delete_GHGUseOfSoldProducts_Electricity?.returning?.forEach(
        (r: any) => {
          response.delete_GHGUseOfSoldProducts_Electricity.returning.push(r);
        }
      );
      if (
        Array.isArray(res?.update_GHGUseOfSoldProducts_Electricity_many) &&
        res.update_GHGUseOfSoldProducts_Electricity_many.length > 0
      ) {
        res.update_GHGUseOfSoldProducts_Electricity_many.map((item: any) => {
          item?.returning?.forEach((r: any) => {
            response.insert_GHGUseOfSoldProducts_Electricity.returning.push(r);
          });
        });
      }
    }
    if (electricityData.length === 0 && electricityUpdate.length > 0) {
      for (let i = 0; i < electricityUpdate.length; i += batchSize) {
        const batch = electricityUpdate.slice(i, i + batchSize);
        const res: any = await sdk.upsertUseOfSoldProductsElectricity({
          where: { _or: [] },
          electricityData: [],
          electricityUpdate: batch,
        });
        if (
          Array.isArray(res?.update_GHGUseOfSoldProducts_Electricity_many) &&
          res.update_GHGUseOfSoldProducts_Electricity_many.length > 0
        ) {
          res.update_GHGUseOfSoldProducts_Electricity_many.map((item: any) => {
            item?.returning?.forEach((r: any) => {
              response.insert_GHGUseOfSoldProducts_Electricity.returning.push(
                r
              );
            });
          });
        }
      }
    }
  }

  // Process Refrigerant sheet
  if (finalSheetDataEntries["Refrigerant"].length > 0) {
    const refrigerantData = finalSheetDataEntries["Refrigerant"][0].sheetRecord;
    const refrigerantUpdate = finalSheetDataEntries["Refrigerant"][0]
      .UpdateRecord as GhgUseOfSoldProducts_Refrigerant_Updates[];
    const refrigerantWhere = _.uniqWith(
      finalSheetDataEntries["Refrigerant"][0].where,
      _.isEqual
    );

    for (let i = 0; i < refrigerantData.length; i += batchSize) {
      const batch = refrigerantData.slice(i, i + batchSize);
      const whereBatch = refrigerantWhere.slice(i, i + batchSize);
      const res: any = await sdk.upsertUseOfSoldProductsRefrigerant({
        where: { _or: whereBatch },
        refrigerantData: batch,
        refrigerantUpdate: refrigerantUpdate,
      });
      res?.insert_GHGUseOfSoldProducts_Refrigerant?.returning?.forEach(
        (r: any) => {
          response.insert_GHGUseOfSoldProducts_Refrigerant.returning.push(r);
        }
      );
      res?.delete_GHGUseOfSoldProducts_Refrigerant?.returning?.forEach(
        (r: any) => {
          response.delete_GHGUseOfSoldProducts_Refrigerant.returning.push(r);
        }
      );
      if (
        Array.isArray(res?.update_GHGUseOfSoldProducts_Refrigerant_many) &&
        res.update_GHGUseOfSoldProducts_Refrigerant_many.length > 0
      ) {
        res.update_GHGUseOfSoldProducts_Refrigerant_many.map((item: any) => {
          item?.returning?.forEach((r: any) => {
            response.insert_GHGUseOfSoldProducts_Refrigerant.returning.push(r);
          });
        });
      }
    }
    if (refrigerantData.length === 0 && refrigerantUpdate.length > 0) {
      for (let i = 0; i < refrigerantUpdate.length; i += batchSize) {
        const batch = refrigerantUpdate.slice(i, i + batchSize);
        const res: any = await sdk.upsertUseOfSoldProductsRefrigerant({
          where: { _or: [] },
          refrigerantData: [],
          refrigerantUpdate: batch,
        });
        if (
          Array.isArray(res?.update_GHGUseOfSoldProducts_Refrigerant_many) &&
          res.update_GHGUseOfSoldProducts_Refrigerant_many.length > 0
        ) {
          res.update_GHGUseOfSoldProducts_Refrigerant_many.map((item: any) => {
            item?.returning?.forEach((r: any) => {
              response.insert_GHGUseOfSoldProducts_Refrigerant.returning.push(
                r
              );
            });
          });
        }
      }
    }
  }

  return response;
};
//#endregion

//#region Main Save Function
export const saveUseOfSoldProductsSheetEntries = async (
  excelData: TExcelSheet[],
  activityCode: string,
  organizationAddressId: UUID,
  userSession: TUserSession
) => {
  const taskRequestActivityData = (await getTaskRequestActvityTaskRequestId(
    organizationAddressId,
    excelData,
    activityCode,
    userSession
  )) as TActivityTaskRequestMasterData[];

  if (!!taskRequestActivityData && taskRequestActivityData.length > 0) {
    const insertionData = await getInsertionData(
      excelData,
      taskRequestActivityData,
      organizationAddressId,
      userSession
    );
    return insertionData;
  }

  return null;
};
//#endregion
