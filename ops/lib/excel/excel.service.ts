import axios from "axios";
import { UUID } from "crypto";
import { Style as ExcelJSStyle, Workbook as ExcelJSWorkbook } from "exceljs";
import https from "https";
import * as _ from "lodash";
import * as xlsx from "xlsx";
import { WorkBook, WorkSheet } from "xlsx";
import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  ActivityTaskRequest_Insert_Input,
  AddressDistance_Insert_Input,
  OrgMaterialMaster_Insert_Input,
  OrgSupplierMaster_Insert_Input,
  TaskRequest_Insert_Input,
  TravelDistance_Insert_Input,
} from "~/graphql/shared/types";
import { assertNoApprovalLock } from "~/lib/bulk-upload/bulk-upload-approval.validation";
import { toTitleCase } from "~/lib/shared/constants/input.constant";
import { addressTypeAllowedActivity } from "~/shared/constants/input.constant";
import { sanitize_compare_str_v2 } from "~/utils/comapre.util";
import { toNumber } from "~/utils/data-transformer.util";
import { months } from "~/utils/date.util";
import { sanitizeString, toSentenceCase } from "~/utils/sanitize.util";
import { TUserSession } from "../auth/auth.client";

export const ExcelApiBodySchema = z.object({
  fileUrl: z.string().url(),
  organizationAddressId: z.string().uuid("Invalid organization id"),
});

export const ExcelApiBodySchemaWithoutAddressId = z.object({
  fileUrl: z.string().url(),
});

let globalYear: number;

export const YearMonthSchema = (baseYear: number) =>
  z.object({
    Year: z
      .unknown()
      .refine(
        (val) => {
          if (val === "" || val === null || val === undefined) {
            return false;
          }
          return true;
        },
        {
          message: "Year is required",
        }
      )
      .refine((q) => toNumber(q) > 0, "The year entered is invalid")
      .transform(toNumber)
      .refine((val) => Number.isInteger(val), {
        message: "The year entered is invalid", // This is the key line for blocking decimals
      })
      .refine(
        (val) => {
          const numVal = Number(val);
          // Reject values with leading zeros when entered as a string
          if (typeof val === "string" && /^0\d+/.test(val)) {
            return false;
          }
          return !isNaN(numVal) && numVal >= 100;
        },
        {
          message: "The year entered is invalid",
        }
      )
      .refine(
        (val) => {
          const numVal = Number(val);
          return !isNaN(numVal) && numVal >= 1900;
        },
        {
          message: "The year entered is invalid",
        }
      )
      .refine((q) => q <= 2099, {
        message: "The year entered is invalid",
      }),
    Month: z
      .string({ message: "Invalid month" })
      .min(1, { message: "Month is required" })
      .refine(
        (value) =>
          months.some(
            (month) => sanitizeString.v1(month) == sanitizeString.v1(value)
          ),
        {
          message: "Invalid month",
        }
      )
      // .refine(
      //   (d: any) => {
      //     const monthIndex = months.findIndex((m) => m === d);
      //     if (
      //       globalYear > new Date().getFullYear() ||
      //       (globalYear >= new Date().getFullYear() &&
      //         monthIndex >= new Date().getMonth())
      //     ) {
      //       return false;
      //     }
      //     return true;
      //   },
      //   {
      //     message: `Future Month and Years are not allowed.`,
      //   }
      // )
      .transform((val) => sanitizeString.v1(String(val))),
  });
export type TExcelApiBody = z.infer<typeof ExcelApiBodySchema>;

export type TExcelSheet<TDataKey extends string = string> = {
  sheetName: string;
  data: Record<TDataKey, any>[];
};
export type TErrorExcelSheet = {
  column: string;
  row: number;
  errorMessage: string;
};
export const ApiHitType = {
  Json: "Json",
  Excel: "Excel",
  Manual: "Manual Entry",
} as const;
export type TActivityMasterData = {
  master_key: string;
  master_data: TActivityMasterDataArray[];
};

export type TActivityMasterDataObject = {
  master_key: string;
  master_data: Record<string, any>;
};

export type TActivityMasterDataArray = {
  label: string;
  value: string;
  group: string[];
  default_for_group: string[];
};
export type TActivityTaskRequestMasterData = {
  taskRequestId: UUID;
  organization_address_id: UUID;
  month: string;
  year: number;
  activityTaskRequestId: UUID;
};
export type TMonthYearGHGIDRelation = {
  Month: string;
  Year: number;
  ghgId: UUID;
};
export type TSheetDataWithGhgId = {
  sheetRecord: Record<string, any>[];
  ghgID: UUID[];
  where: Record<string, any>[];
};
export type TSheetDataWithId = {
  sheetRecord: Record<string, any>[];
  where: Record<string, any>[];
};
export type TSheetDataWithIdAndMasterDataInsertionData = {
  sheetRecord: Record<string, any>[];
  where: Record<string, any>[];
  MasterDataInserted: TExcelSheet[];
};

export type TBusinessSheetDataWithIdandDistanceData = {
  sheetRecord: Record<string, any>[];
  where: Record<string, any>[];
  travelDistance: TravelDistance_Insert_Input[];
};
export type TSheetDataWithIdandDistanceData = {
  sheetRecord: Record<string, any>[];
  where: Record<string, any>[];
  travelDistance: AddressDistance_Insert_Input[];
  MasterDataInserted: TExcelSheet[];
};

export type TSheetDataWithMaterialAndSupplierMaster = {
  sheetRecord: Record<string, any>[];
  where: Record<string, any>[];
  travelDistance?: AddressDistance_Insert_Input[];
  materialMasters?: OrgMaterialMaster_Insert_Input[];
  supplierMasters?: OrgSupplierMaster_Insert_Input[];
};

export type TSheetDataSupplierMaster = {
  sheetRecord: Record<string, any>[];
  updateRecord: Record<string, any>[];
};

export type TTemplateErrorData = {
  sheet?: string;
  error_message: string;
};
export type sheettype = {
  name: string;
  code: String;
  columns: sheetcolumns[];
  activityKey: [];
};
export type sheetcolumns = {
  name: string;
  code: String;
};
export type Tdropdown = {
  label: string;
  value: string;
};

export type TSheetGridDataWithId = {
  sheetRecord: Record<string, any>[];
  UpdateRecord: Record<string, any>[];
  where: Record<string, any>[];
};

export const getTaskRequestActvityTaskRequestId = async (
  org_address_id: UUID,
  excelData: TExcelSheet[],
  activitycode: string,
  userSession: TUserSession,
  // Pass the exact GHG data table name (e.g. "GHGTransport_EmployeeTravel") so
  // assertNoApprovalLock can confirm that actual data for this specific activity
  // exists under the approved parent ATR — preventing false-positive blocks from
  // sibling activities that share the same parent ActivityTaskRequest row.
  ghgDataTableName?: string
) => {
  const sdk = await getGraphQlServerSDK();
  const monthYearlist: Record<string, any>[] = [];
  const finalYearMonth: Record<string, any>[] = [];
  const whereCondition: Record<string, any>[] = [];
  const activityTaskRequestWhereRequest: Record<string, any>[] = [];

  const AddressData = await sdk.getAddressDetail({
    organisationAddressId: org_address_id,
  });

  const addresstype = addressTypeAllowedActivity.filter(
    (item: Record<string, any>) =>
      sanitizeString.v1(item.name) ==
      sanitizeString.v1(AddressData.OrganizationAddress[0].Address.type ?? "")
  );
  const allowedactivity = addresstype[0]?.data?.filter(
    (item: Record<string, any>) =>
      sanitizeString.v1(item.name) ==
      sanitizeString.v1(
        AddressData.OrganizationAddress[0].Address.ownership_type ?? ""
      )
  )[0].data;
  const activityData = await sdk.getActivitybycode({
    activitycode: allowedactivity,
  });

  const currentActivityId = activityData?.Activity.filter(
    (item: any) =>
      sanitizeString.v1(item.code) == sanitizeString.v1(activitycode)
  )[0].id;
  excelData.forEach((sheetdata: TExcelSheet) => {
    sheetdata?.data.forEach((inputData) => {
      if (inputData.Year && inputData.Month)
        monthYearlist.push({
          Year: sanitizeString.v2(String(inputData.Year)),
          Month: toSentenceCase(inputData.Month),
          Combination:
            sanitizeString.v2(String(inputData.Year)) +
            "" +
            toSentenceCase(inputData.Month),
        });
    });
    const _ = require("lodash");
    let grouped_data = _.groupBy(monthYearlist, "Combination");
    Object.keys(grouped_data).map((item: any) => {
      let keydata = grouped_data[item];
      if (
        keydata.length > 0 &&
        finalYearMonth.filter(
          (x: any) => x.year == keydata[0].Year && x.month == keydata[0].Month
        ).length == 0
      ) {
        finalYearMonth.push({
          year: keydata[0].Year,
          month: keydata[0].Month,
        });
        whereCondition.push({
          _and: {
            year: { _eq: keydata[0].Year },
            month: { _eq: keydata[0].Month },
            organization_address_id: { _eq: org_address_id },
          },
        });
      }
    });
  });

  // RULE-008: Block upload if any month/year in this file has already been
  // approved for this location and activity. Throws a 422 CustomError if locked.
  // To revert to the pre-lock behaviour, remove this single call.
  await assertNoApprovalLock(
    String(org_address_id),
    activitycode,
    finalYearMonth.map((m) => ({ month: String(m.month), year: Number(m.year) })),
    ghgDataTableName
  );

  const { TaskRequest } = await sdk.gettaskRequest({
    where: { _or: whereCondition },
    activityId: currentActivityId,
  });
  const leftoutActivityTaskRequestData: Record<string, UUID>[] = [];
  const foreignKeyInsertionObject: Record<string, any>[] = [];
  if (!!TaskRequest && TaskRequest.length > 0) {
    TaskRequest.forEach((item: Record<string, any>) => {
      if (item.ActivityTaskRequests.length == 0) {
        leftoutActivityTaskRequestData.push({
          organization_address_id: org_address_id,
          activity_id: currentActivityId,
          task_request_id: item?.id,
          created_by: userSession.userId as UUID,
          updated_by: userSession.userId as UUID,
        });
      } else {
        item.ActivityTaskRequests.forEach(
          (activitytaskitem: Record<string, UUID>) => {
            foreignKeyInsertionObject.push({
              taskRequestId: item.id,
              organization_address_id: item.organization_address_id,
              month: item.month,
              year: item.year,
              activityTaskRequestId: activitytaskitem.id,
            });
          }
        );
      }
    });
  }

  if (leftoutActivityTaskRequestData.length > 0) {
    const pendingActivityTaskreuqestdata = await sdk.InsertActivityTaskRequest({
      input: leftoutActivityTaskRequestData,
    });
    if (!!pendingActivityTaskreuqestdata) {
      pendingActivityTaskreuqestdata.insert_ActivityTaskRequest?.returning.forEach(
        (activityitem) => {
          activityTaskRequestWhereRequest.push({
            _and: {
              organization_address_id: { _eq: org_address_id },
              activity_id: { _eq: activityitem.activity_id },
              task_request_id: { _eq: activityitem.task_request_id },
            },
          });
        }
      );
    }
  }

  const insertionTaskRequestData = monthYearlist?.filter(
    (obj1) =>
      !TaskRequest.some(
        (obj2) =>
          obj1.Month === obj2.month &&
          sanitize_compare_str_v2(String(obj1.Year), String(obj2.year))
      )
  ) as Record<string, any>[];

  //insert into Task Request Table Starts
  const taskRequestObj: TaskRequest_Insert_Input[] =
    insertionTaskRequestData.map((taskInput: Record<string, any>) => {
      const input = {
        organization_address_id: org_address_id,
        month: toTitleCase(taskInput.Month),
        year: taskInput.Year,
        created_by: userSession.userId as UUID,
        updated_by: userSession.userId as UUID,
      };
      return input;
    });
  const UniqtaskRequestObj = _.uniqWith(taskRequestObj, _.isEqual);

  const taskRequestInsert = await sdk.InsertTaskRequest({
    input: UniqtaskRequestObj,
  });
  //insert into Task Request Table Ends

  //insert into Activity Task Request Table Starts
  const ActivityTaskRequestDataCombination: Record<string, UUID>[] = [];
  taskRequestInsert?.insert_TaskRequest?.returning.map((taskid) => {
    activityData.Activity.map((activityitem) => {
      ActivityTaskRequestDataCombination.push({
        organization_address_id: org_address_id,
        activity_id: activityitem.id,
        task_request_id: taskid?.id,
        created_by: userSession.userId as UUID,
        updated_by: userSession.userId as UUID,
      });
      activityTaskRequestWhereRequest.push({
        _and: {
          organization_address_id: { _eq: org_address_id },
          activity_id: { _eq: activityitem.id },
          task_request_id: { _eq: taskid?.id },
        },
      });
    });
  });
  const activityTaskMasterData = await sdk.getactivityTaskRequestData({
    where: { _or: activityTaskRequestWhereRequest },
  });
  const activityTaskRequestobj = ActivityTaskRequestDataCombination?.filter(
    (obj1) =>
      !activityTaskMasterData.ActivityTaskRequest.some(
        (obj2) =>
          obj1.activity_id === obj2.activity_id &&
          obj1.task_request_id === obj2.task_request_id &&
          obj1.organization_address_id === obj2.organization_address_id
      )
  ) as ActivityTaskRequest_Insert_Input[];

  if (
    activityTaskRequestobj.length == 0 &&
    leftoutActivityTaskRequestData.length > 0
  ) {
    if (!!activityTaskMasterData) {
      activityTaskMasterData.ActivityTaskRequest.forEach((activitytaskitem) => {
        foreignKeyInsertionObject.push({
          taskRequestId: activitytaskitem.task_request_id,
          organization_address_id: org_address_id,
          month: activitytaskitem.TaskRequest.month,
          year: activitytaskitem.TaskRequest.year,
          activityTaskRequestId: activitytaskitem.id,
        });
      });
    }
  }

  const ActivityTaskreuqestdata = await sdk.InsertActivityTaskRequest({
    input: activityTaskRequestobj,
  });
  //insert into Activity Task Request Table Ends

  taskRequestInsert?.insert_TaskRequest?.returning.forEach((item) => {
    ActivityTaskreuqestdata?.insert_ActivityTaskRequest?.returning
      .filter(
        (activityTaskitem) =>
          activityTaskitem.task_request_id == item.id &&
          activityTaskitem.activity_id == currentActivityId
      )
      .forEach((activityTaskFiltereditem) => {
        foreignKeyInsertionObject.push({
          taskRequestId: item.id,
          organization_address_id: item.organization_address_id,
          month: item.month,
          year: item.year,
          activityTaskRequestId: activityTaskFiltereditem.id,
        });
      });
  });
  return foreignKeyInsertionObject;
};

export const readDataFromURL = async (fileUrl: string) => {
  let excelData: TExcelSheet[] = await readDataFromfile(fileUrl);
  return excelData;
};

export async function loadWorkbookFromUrl(url: string): Promise<WorkBook> {
  const agent = new https.Agent({ keepAlive: false }); // disable Keep-Alive
  const resp = await axios.get<ArrayBuffer>(url, {
    responseType: "arraybuffer",
    timeout: 120_000, // increase overall timeout
    maxContentLength: Infinity, // no size cap
    maxBodyLength: Infinity,
    proxy: false, // disable any HTTP proxy :contentReference[oaicite:1]{index=1}
    httpsAgent: agent,
  });

  const buffer = Buffer.from(resp.data);
  return xlsx.read(buffer, { cellStyles: true });
}

function trimSheetRange(ws: WorkSheet) {
  if (!ws["!ref"]) return null;
  const range = xlsx.utils.decode_range(ws["!ref"]!);
  let lastRow = range.s.r;
  for (let R = range.s.r; R <= range.e.r; ++R) {
    let hasValue = false;
    for (let C = range.s.c; C <= range.e.c; ++C) {
      const cellAddress = xlsx.utils.encode_cell({ r: R, c: C });
      const cell = ws[cellAddress];
      if (cell?.v != null && String(cell.v).trim() !== "") {
        hasValue = true;
        break;
      }
    }
    if (hasValue) {
      lastRow = R;
    } else {
      break;
    }
  }

  let data = xlsx.utils.encode_range({
    s: range.s,
    e: { r: lastRow, c: range.e.c },
  });
  ws["!ref"] = data;
  return data;
}

const readDataFromfile = async (fileUrl: string) => {
  const workbook = await loadWorkbookFromUrl(fileUrl);
  const data: TExcelSheet[] = [];
  await Promise.all(
    workbook.SheetNames.map(async (sheetName) => {
      const ws = workbook.Sheets[sheetName];
      let datarange = trimSheetRange(ws);
      if (datarange) {
        const rows: TExcelSheet[] = xlsx.utils.sheet_to_json(ws, {
          blankrows: false,
          defval: "",
          range: datarange,
        });
        data.push({ sheetName, data: rows });
      } else {
        data.push({ sheetName, data: [] });
      }
    })
  );
  return data;
};

export const validateActivityMasterDataByKey = (
  ActivityMasterData: TActivityMasterData[],
  columnValue: string,
  index: number,
  key: string,
  columnName: string,
  MethodType: string
) => {
  const errorEntries: TErrorExcelSheet[] = [];
  const MasterData: TActivityMasterDataArray[] = ActivityMasterData.filter(
    (masterData: TActivityMasterData) => masterData.master_key == key
  )[0]?.master_data;

  /// checking either data of excel is correct according to master data or not
  let length: number = 0;
  if (MethodType == ApiHitType.Json) {
    length = MasterData?.filter(
      (masterDatapair: TActivityMasterDataArray) =>
        sanitizeString.v3(masterDatapair.label) ==
        sanitizeString.v3(String(columnValue))
    ).length;
  } else {
    length = MasterData?.filter(
      (masterDatapair: TActivityMasterDataArray) =>
        sanitizeString.v1(masterDatapair.label) ==
        sanitizeString.v1(String(columnValue))
    ).length;
  }

  if (length == 0) {
    errorEntries.push({
      column: columnName,
      row: index,
      errorMessage:
        "Invalid value : Data should be " +
        ActivityMasterData.filter(
          (g: any) => g.master_key == key
        )[0]?.master_data.map((a: any) => a.label),
    });
  }

  return errorEntries;
};
export const getMatchedMasterDataLabel = (
  ActivityMasterData: TActivityMasterData[],
  key: string,
  columnValue: string,
  MethodType: string
): string => {
  const MasterData = ActivityMasterData.filter(
    (m) => m.master_key === key
  )[0]?.master_data;
  if (!MasterData) return columnValue;
  const match =
    MethodType === ApiHitType.Json
      ? MasterData.find(
          (m) =>
            sanitizeString.v3(m.label) === sanitizeString.v3(String(columnValue))
        )
      : MasterData.find(
          (m) =>
            sanitizeString.v1(m.label) === sanitizeString.v1(String(columnValue))
        );
  return match ? match.label : columnValue;
};

export const validateActivityMasterDataGroupByKey = (
  ActivityMasterData: TActivityMasterData[],
  MastercolumnValue: string,
  columnValue: string,
  index: number,
  key: string,
  columnName: string,
  MethodType: string,
  parentKey: string
) => {
  const errorEntries: TErrorExcelSheet[] = [];
  const MasterData: TActivityMasterDataArray[] = ActivityMasterData.filter(
    (masterData: TActivityMasterData) => masterData.master_key == key
  )[0]?.master_data;

  if (!!parentKey && parentKey?.trim() !== "") {
    const parentMasterData = ActivityMasterData.filter(
      (item) => item.master_key == parentKey
    )[0].master_data;
    let length: number = 0;
    const dataArray: TActivityMasterDataArray[] = [];
    if (MethodType == ApiHitType.Json) {
      const parentValue = parentMasterData.filter(
        (item) =>
          sanitizeString.v3(item.label) === sanitizeString.v3(MastercolumnValue)
      )[0].value;
      MasterData?.filter((masterDatapair: TActivityMasterDataArray) =>
        masterDatapair.group
          .filter(
            (groupitem) =>
              sanitizeString.v3(groupitem) == sanitizeString.v3(parentValue)
          )
          .forEach((matcheditem) => {
            dataArray.push(masterDatapair);
          })
      );
      length = dataArray.filter(
        (item) =>
          sanitizeString.v3(item.label) == sanitizeString.v3(columnValue)
      ).length;
    } else {
      const parentValue = parentMasterData.filter(
        (item) =>
          sanitizeString.v1(item.label) === sanitizeString.v1(MastercolumnValue)
      )[0].value;
      MasterData?.filter((masterDatapair: TActivityMasterDataArray) =>
        masterDatapair.group
          .filter(
            (groupitem) =>
              sanitizeString.v1(groupitem) == sanitizeString.v1(parentValue)
          )
          .forEach((matcheditem) => {
            dataArray.push(masterDatapair);
          })
      );
      length = dataArray.filter(
        (item) =>
          sanitizeString.v1(item.label) == sanitizeString.v1(columnValue)
      ).length;
    }
    ///cheking length of sheet
    if (length == 0) {
      errorEntries.push({
        column: columnName,
        row: index,
        errorMessage:
          "Invalid value : Data should be " +
          dataArray.map((a: any) => a.label),
      });
    }
  } else {
    let unitType = MasterData?.filter(
      (masterDatapair: TActivityMasterDataArray) =>
        sanitizeString.v1(masterDatapair.label) ==
        sanitizeString.v1(String(columnValue))
    )[0]?.group[0];
    if (unitType === "count" || unitType === "volume") {
      errorEntries.push({
        column: columnName,
        row: index,
        errorMessage:
          "The Material Procured Code is required for count or volume based UoMs.",
      });
    }
  }
  return errorEntries;
};
export const createErrorDataForExcel = (
  columns: sheetcolumns[],
  errorList: TErrorExcelSheet[]
) => {
  let errorTable: Record<string, string>[] = [];
  let errorRow: any = {};
  errorList.forEach((errorItem) => {
    if (errorRow["Row Number"] !== errorItem.row) {
      errorRow = {};
    }
    errorRow["Row Number"] = errorItem.row;
    columns.forEach((columnItem: sheetcolumns) => {
      if (
        errorList.filter(
          (eritem) =>
            sanitizeString.v1(eritem.column) ==
            sanitizeString.v1(columnItem.name)
        ).length > 0
      ) {
        if (!!errorRow[columnItem.name]) {
          return;
        }
        if (
          sanitizeString.v1(errorItem.column) ==
          sanitizeString.v1(columnItem.name)
        ) {
          errorRow[columnItem.name] = errorItem.errorMessage;
        } else {
          errorRow[columnItem.name] = "";
        }
      } else {
        errorRow[columnItem.name] = "";
      }
    });
    errorTable.push(errorRow);
  });
  return errorTable;
};

export type TTypeFsonToExcelStreamData = {
  sheetName: string;
  data: Record<string, any>[];
}[];

export const jsonToExcelBuffer = (data: TTypeFsonToExcelStreamData) => {
  if (!data.length) return null;

  let workbook = xlsx.utils.book_new();

  for (let index = 0; index < data.length; index++) {
    const sheet = data[index];
    const worksheet = xlsx.utils.json_to_sheet(sheet.data);
    xlsx.utils.book_append_sheet(workbook, worksheet, sheet.sheetName);
  }

  const buffer: Buffer = xlsx.write(workbook, {
    type: "buffer",
    bookType: "xlsx",
  });

  return buffer;
};

/**
 * Download an existing Excel template from a URL, replace the data rows
 * in the specified sheet (preserving the header row, images, font styles,
 * and all formatting), and return the updated workbook as a Buffer.
 *
 * Uses ExcelJS instead of SheetJS to preserve logos, font colors, cell
 * styles, and other rich formatting that SheetJS strips on write.
 */
export const updateExcelTemplateFromUrl = async (
  fileUrl: string,
  sheetName: string,
  newData: Record<string, any>[]
): Promise<Buffer> => {
  // Download the template file
  const agent = new https.Agent({ keepAlive: false });
  const resp = await axios.get<ArrayBuffer>(fileUrl, {
    responseType: "arraybuffer",
    timeout: 120_000,
    maxContentLength: Infinity,
    maxBodyLength: Infinity,
    proxy: false,
    httpsAgent: agent,
  });

  // Load with ExcelJS which preserves images, styles, and formatting
  const workbook = new ExcelJSWorkbook();
  await workbook.xlsx.load(Buffer.from(resp.data) as unknown as ArrayBuffer);

  const ws = workbook.getWorksheet(sheetName);
  if (!ws) {
    throw new Error(`Sheet "${sheetName}" not found in the template`);
  }

  // Read headers from row 1 (ExcelJS is 1-indexed)
  const headerRow = ws.getRow(1);
  const headers: { col: number; name: string }[] = [];
  headerRow.eachCell({ includeEmpty: true }, (cell: any, colNumber: any) => {
    headers.push({
      col: colNumber,
      name: cell.value != null ? String(cell.value) : "",
    });
  });

  // Capture cell styles from the first data row (row 2) as a template
  // so new data rows get the same formatting
  const templateStyles = new Map<number, ExcelJSStyle>();
  if (ws.rowCount >= 2) {
    const styleRow = ws.getRow(2);
    for (const { col } of headers) {
      const cell = styleRow.getCell(col);
      if (cell.style) {
        templateStyles.set(col, JSON.parse(JSON.stringify(cell.style)));
      }
    }
  }

  // Clear all existing data rows (row 2 onwards)
  const lastDataRow = ws.rowCount;
  for (let R = 2; R <= lastDataRow; R++) {
    const row = ws.getRow(R);
    for (const { col } of headers) {
      const cell = row.getCell(col);
      cell.value = null;
    }
  }

  // Write new data rows starting at row 2, applying the captured styles
  for (let R = 0; R < newData.length; R++) {
    const dataRow = newData[R];
    const excelRow = ws.getRow(R + 2);
    for (const { col, name } of headers) {
      const cell = excelRow.getCell(col);
      cell.value = dataRow[name] ?? "";
      const style = templateStyles.get(col);
      if (style) {
        cell.style = JSON.parse(JSON.stringify(style));
      }
    }
    excelRow.commit();
  }

  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
};

export const getdefaultfuelquality = async (
  fuelName: string[],
  organizationId: UUID,
  key: string[]
) => {
  if (fuelName.length > 0) {
    const sdk = await getGraphQlServerSDK();
    const activityMasterData = await sdk.getActivityMasterDataByKey({
      master_key: key,
    });

    const MasterData: TActivityMasterDataArray[] =
      activityMasterData.ActivityMaster.filter(
        (masterData: TActivityMasterData) => masterData.master_key == key[0]
      )[0]?.master_data;

    const activityMasterDataFuel: Record<string, any>[] = MasterData?.filter(
      (obj1: Record<string, any>) =>
        fuelName?.some(
          (obj2: any) =>
            sanitizeString.v1(obj1.label) === sanitizeString.v1(obj2)
        )
    );

    let fueldetails = await sdk.getDefaultFuelQualitybyfuelcode({
      fuelcode: activityMasterDataFuel.map((item) => item.value),
    });
    const finalValue: Tdropdown[] = [];
    fueldetails?.FuelQualityMaster?.forEach((item) => {
      let data = activityMasterDataFuel.filter(
        (items) => items.value == item.code
      );
      if (!!data.length) {
        finalValue.push({
          label: data[0].label,
          value: item.value,
        });
      }
    });
    return finalValue;
  } else {
    return [];
  }
};

export const combineAllErrorSheets = (
  errorData: TExcelSheet[],
  allError: TExcelSheet[]
) => {
  errorData.forEach((item) => {
    let sheetData = allError.filter(
      (items) => items.sheetName == item.sheetName
    );
    if (!!sheetData.length) {
      item.data.forEach((errorItem) => {
        sheetData[0].data.push(errorItem);
      });
    } else {
      allError.push({
        sheetName: item.sheetName,
        data: item.data,
      });
    }
  });
  return allError;
};
export const combineAllTypeErrorInRow = (
  allError: TExcelSheet[],
  templateSheets: any
) => {
  const finalError: TExcelSheet[] = [];
  allError.forEach((item) => {
    const uniquerow = item.data.map((record: any) => record["Row Number"]);
    const allcolumns = templateSheets.filter(
      (items: Record<string, string>) =>
        sanitizeString.v1(items.name) == sanitizeString.v1(item.sheetName)
    )[0].columns;
    const Errordata: Record<string, any>[] = [];
    uniquerow.forEach((rowItem) => {
      if (
        Errordata.filter((items) => items["Row Number"] == rowItem + 1)
          .length == 0
      ) {
        let currentRowData = item.data.filter(
          (filterDataItem) => filterDataItem["Row Number"] == rowItem
        );
        let errorRow: any = {};
        currentRowData.forEach((currentItem) => {
          errorRow["Row Number"] = rowItem + 1;
          allcolumns.forEach((columnsitem: any) => {
            if (!!errorRow[columnsitem.name]) {
              return;
            }
            if (!!currentItem[columnsitem.name]) {
              errorRow[columnsitem.name] = currentItem[columnsitem.name];
            } else {
              errorRow[columnsitem.name] = "";
            }
          });
        });
        Errordata.push(errorRow);
      }
    });
    const sortedErrordata = Errordata.sort((a, b) => {
      return a["Row Number"] - b["Row Number"];
    });
    finalError.push({
      sheetName: item.sheetName,
      data: sortedErrordata,
    });
  });
  return finalError;
};
export const trimColumnNames = (sheetData: TExcelSheet[]) => {
  return sheetData.map((sheet) => ({
    ...sheet,
    data: sheet.data.map((row) =>
      Object.fromEntries(
        Object.entries(row).map(([key, value]) => [
          sanitizeString.v2(key),
          value,
        ])
      )
    ),
  }));
};

export const trimtrailingblankrows = (sheetData: TExcelSheet[]) => {
  return sheetData.map((sheet) => {
    // Function to check if a row is completely blank
    const isBlank = (row: Record<string, any>) => {
      return Object.values(row).every(
        (value) => value === "" || value === null
      );
    };
    // Filter out trailing blank rows
    const dataWithoutTrailingBlanks = (() => {
      const data = sheet.data;
      let lastNonBlankIndex = -1;

      // Find the last non-blank row
      data.forEach((row, index) => {
        if (!isBlank(row)) {
          lastNonBlankIndex = index;
        }
      });

      return data.slice(0, lastNonBlankIndex + 1);
    })();

    return {
      ...sheet,
      data: dataWithoutTrailingBlanks.map((row) =>
        Object.fromEntries(
          Object.entries(row).map(([key, value]) => [
            sanitizeString.v2(key),
            value,
          ])
        )
      ),
    };
  });
};

/**
 * Extracts all distinct (year, month) pairs from the uploaded Excel sheets,
 * sorted in financial-year order (April → March, ascending).
 * e.g. Apr-2021 … Mar-2022, Apr-2022 … Mar-2023, …
 *
 * Reads the "Year" and "Month" columns that all GHG/ESG activity templates share.
 * Returns an empty array when no valid pairs are found (email service handles gracefully).
 */
export function extractYearMonthPairsFromExcel(
  sheets: TExcelSheet[]
): Array<{ year: number; month: string }> {
  const seen = new Map<string, { year: number; month: string; rank: number }>();
  const MONTH_TO_NUM: Record<string, number> = {
    january: 1, february: 2, march: 3, april: 4, may: 5, june: 6,
    july: 7, august: 8, september: 9, october: 10, november: 11, december: 12,
  };
  for (const sheet of sheets) {
    for (const row of sheet.data ?? []) {
      const r = row as Record<string, unknown>;
      const y = Number(r["Year"] ?? 0);
      const m = String(r["Month"] ?? "").toLowerCase().trim();
      const mNum = MONTH_TO_NUM[m] ?? 0;
      if (!y || !mNum) continue;
      const key = `${y}-${m}`;
      if (!seen.has(key)) {
        // Financial year starts in April (month 4).
        // April=1 … December=9, January=10 … March=12.
        // fyYear: Apr-Dec belong to the calendar year's FY; Jan-Mar belong to prior FY.
        const fyMonth = mNum >= 4 ? mNum - 3 : mNum + 9;
        const fyYear  = mNum >= 4 ? y : y - 1;
        seen.set(key, { year: y, month: m, rank: fyYear * 12 + fyMonth });
      }
    }
  }
  return [...seen.values()]
    .sort((a, b) => a.rank - b.rank)
    .map(({ year, month }) => ({ year, month }));
}

//IMPORTANT: Below method is created just for sng ESG changes
//which inserts default month in every ro of the excel data
export const addDefaultMonthInExcelData = (
  sheetData: TExcelSheet[]
): TExcelSheet[] => {
  return sheetData.map((sheet) => ({
    ...sheet,
    data: sheet.data.map((row: any) => {
      // Only add Month if it's completely missing
      if (!("Month" in row)) {
        return {
          ...row,
          Month: "March",
        };
      }
      return row;
    }),
  }));
};

export const createErrorDataForExcelForMultiRowData = (
  columns: sheetcolumns[],
  errorList: TErrorExcelSheet[]
) => {
  let errorTable: Record<string, string>[] = [];
  let errorRow: any = {};
  const uniqueRow = errorList
    ?.map((items) => items.row)
    .filter(
      (item, index, self) => index === self.findIndex((t) => t === item)
    ) as number[];
  uniqueRow.forEach((rowItems) => {
    errorList
      .filter((arrayItem) => arrayItem.row == rowItems)
      .forEach((errorItem) => {
        if (errorRow["Row Number"] !== errorItem.row) {
          errorRow = {};
        }
        errorRow["Row Number"] = errorItem.row;
        columns.forEach((columnItem: sheetcolumns) => {
          if (
            errorList.filter(
              (eritem) =>
                sanitizeString.v1(eritem.column) ==
                sanitizeString.v1(columnItem.name)
            ).length > 0
          ) {
            if (!!errorRow[columnItem.name]) {
              return;
            }
            if (
              sanitizeString.v1(errorItem.column) ==
              sanitizeString.v1(columnItem.name)
            ) {
              errorRow[columnItem.name] = !!errorItem.errorMessage
                ? errorItem.errorMessage
                : errorRow[columnItem.name];
            } else {
              errorRow[columnItem.name] = "";
            }
          } else {
            errorRow[columnItem.name] = "";
          }
        });
      });
    errorTable.push(errorRow);
  });
  return errorTable;
};
export const getDefaultData = ({
  masterKey,
  activityMasterData,
  valueForDefaultValue,
}: {
  masterKey: string;
  activityMasterData: TActivityMasterData[];
  valueForDefaultValue?: string;
}): string => {
  try {
    const activityMasterKeyData: TActivityMasterDataArray[] =
      activityMasterData?.filter((m) => m?.master_key === masterKey)?.[0]
        ?.master_data || [];

    let defaultValue: Record<string, any>[] = [];
    if (!!valueForDefaultValue) {
      defaultValue = activityMasterKeyData?.filter(
        (m) =>
          m?.default_for_group &&
          m?.group &&
          sanitizeString
            .v4(String(m?.group))
            ?.includes(sanitizeString.v4(String(valueForDefaultValue))) &&
          sanitizeString
            .v4(String(m?.default_for_group))
            ?.includes(sanitizeString.v4(String(valueForDefaultValue)))
      );
    } else {
      defaultValue = activityMasterKeyData?.filter(
        (m) => !!m?.default_for_group
      );
    }
    if (defaultValue.length > 0) {
      return defaultValue[0]?.label;
    } else {
      return "";
    }
  } catch (error) {
    console.error("Error in getDefaultData:", error);
    throw error;
  }
};
