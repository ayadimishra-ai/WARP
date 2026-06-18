import * as _ from "lodash";
import { z } from "zod";
import type { TExcelSheet } from "@/modules/ghg/lib/excel/excel.service";

import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GeneralActivityConstant,
  TGeneralActivitySheetNames,
} from "@/modules/ghg/shared/constants/activities/general-details.constant";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import {
  GeneralDetailsSheetDataValidationSchema,
  TGeneralActivityErrorDataObject,
  TGeneralActivityTemplateErrorData,
  TGeneralDetailsErrorDataObjectKeys,
  TGenetalActivitySheetData,
} from "./validation.schema";

// Get single by sheet constant name
const getConstantSheetBySheetName = (sheetName: string) =>
  GeneralActivityConstant.excel_template[
    sanitizeString.v2(sheetName) as TGeneralActivitySheetNames
  ];

// Get single sheet from excel data
const getExcelSheetBySheetName = (
  sheetName: TGeneralActivitySheetNames,
  sheets: TExcelSheet[]
) =>
  sheets.find(
    (sh) => sanitizeString.v1(sh.sheetName) === sanitizeString.v1(sheetName)
  )!;

const parseExcelSheetDataToCode = <
  TSheetName extends TGeneralActivitySheetNames,
>(
  sheetName: TSheetName,
  sheetData: TGenetalActivitySheetData<TSheetName>
): TGeneralActivityErrorDataObject<TSheetName>[] => {
  const constantSheetColumnNameCode = getConstantSheetBySheetName(
    sheetName
  )?.columns.reduce(
    (acc, col) => ({ ...acc, [col.name]: col.code }),
    {} as any
  );

  const parsedData = sheetData.map((row: any) => {
    const newRow = Object.keys(row).reduce(
      (acc, key) => ({
        ...acc,
        [constantSheetColumnNameCode[key]]: row[key as keyof typeof row],
      }),
      {} as any
    );
    return newRow as TGeneralActivityErrorDataObject<TSheetName>;
  });

  return parsedData;
};

const getFailedEntriesData = <TSheetName extends TGeneralActivitySheetNames>(
  sheetName: string,
  errorEntries: z.ZodIssue[]
): TGeneralActivityErrorDataObject<TSheetName>[] => {
  const tempErrorObject = getConstantSheetBySheetName(sheetName).columns.reduce(
    (acc, colName) => ({ ...acc, [colName.name]: "" }),
    {} as any
  );

  let result = errorEntries.reduce((acc, err) => {
    const [row_index, column_name] = err.path as [
      number,
      TGeneralDetailsErrorDataObjectKeys<TSheetName>,
    ];
    const rowNumber = Number(row_index) + 2;

    let errorIndex = acc.findIndex((m) => m["Row Number"] === rowNumber);

    if (errorIndex < 0) {
      const newErrorObject = _.clone(tempErrorObject);
      newErrorObject["Row Number"] = rowNumber;
      errorIndex = acc.push(newErrorObject) - 1;
    }

    acc[errorIndex][column_name] = err.message as any;

    return acc;
  }, [] as TGeneralActivityErrorDataObject<TSheetName>[]);

  result = _.chain(result)
    .sortBy("Row Number")
    .value()
    .map(({ "Row Number": row_number, ...rest }) => ({
      "Row Number": row_number,
      ...rest,
    })) as any;

  return result;
};

// General Details Sheet
const validateGeneralDetailsSheetData = async <
  TSheetName extends TGeneralActivitySheetNames,
>(
  sheetName: TSheetName,
  sheets: TExcelSheet[],
  organizationId: UUID
) => {
  const _sheetName = sanitizeString.v2(sheetName) as TSheetName;

  const sheet = getExcelSheetBySheetName(_sheetName, sheets);
  const sdk = await getGraphQlServerSDK();
  const orgData = await sdk.getOrgData({
    organizationId: organizationId,
  });
  const parsedData = await GeneralDetailsSheetDataValidationSchema(
    orgData?.Organization[0]?.FinancialYearMonth,
    orgData?.Organization[0]?.Baselineyear
  ).safeParseAsync(sheet.data);

  if (parsedData.success) {
    return { success: true, data: parsedData.data };
  }

  const failedData = getFailedEntriesData<"General Details">(
    _sheetName,
    parsedData.error.errors
  );

  return { success: false, data: failedData };
};

// Template Validation
export const validateTemplate = (excelData: TExcelSheet[]) => {
  const sheets = GeneralActivityConstant.excel_template;

  const templateErrors: TGeneralActivityTemplateErrorData = [];

  Object.keys(sheets).forEach((sheetName) => {
    const sheetData = excelData.find(
      (sheet) =>
        sanitizeString.v2(sheet.sheetName) === sanitizeString.v2(sheetName)
    );

    if (!!sheetData) {
      const columns = sheets[
        sheetName as TGeneralActivitySheetNames
      ].columns.map((m) => sanitizeString.v2(m.name));
      if (sheetData.data.length > 0) {
        const sheetDataColumns = Object.keys(sheetData.data[0]).map(
          sanitizeString.v2
        );

        columns.forEach((col) => {
          if (!sheetDataColumns.some((sheetDataCol) => sheetDataCol === col)) {
            const error_message = `Column '${col}' not found`;
            templateErrors.push({ sheet: sheetName, error_message });
          }
        });
      } else {
        templateErrors.push({
          sheet: sheetName,
          error_message: `No data found in sheet '${sheetName}'`,
        });
      }
    } else {
      const error_message = `Sheet '${sheetName}' not found`;
      templateErrors.push({ sheet: "", error_message });
    }
  });

  return templateErrors;
};

// Validate Data
export const validateData = async (
  sheets: TExcelSheet[],
  organizationId: UUID
) => {
  // General Details Sheet
  const generalDetailsResult =
    await validateGeneralDetailsSheetData<"General Details">(
      "General Details",
      sheets,
      organizationId
    );

  return [{ sheetName: "General Details", ...generalDetailsResult }];
};
