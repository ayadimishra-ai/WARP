import {
  errmsg_excel_template_columns_missing,
  errmsg_excel_template_sheet_missing,
  errmsg_excel_template_sheet_no_data,
} from "@/modules/ghg/shared/error/messages";
import { capitalizeEachWord, sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { TExcelSheet, TTemplateErrorData } from "./excel.service";

export const validateSheetName = (
  sheetsData: TExcelSheet[],
  templateSheetName: string
) => {
  const errorMessageData: TTemplateErrorData[] = [];
  const sheet = sheetsData.find(
    (m) =>
      sanitizeString.v1(m.sheetName) == sanitizeString.v1(templateSheetName)
  );

  if (Boolean(sheet) === false) {
    errorMessageData.push({
      sheet: capitalizeEachWord(templateSheetName),
      error_message: errmsg_excel_template_sheet_missing(templateSheetName),
    });
  }

  return errorMessageData;
};

export const validateColumnNames = (
  sheetData: TExcelSheet,
  templateColumnNames: string[]
) => {
  // const firstData = sheetData.data[0];
  const errorMessageData: TTemplateErrorData[] = [];
  // if (Boolean(firstData) === false) {
  //   errorMessageData.push({
  //     sheet: capitalizeEachWord(sheetData.sheetName),
  //     error_message: errmsg_excel_template_sheet_no_data(sheetData.sheetName),
  //   });
  // } else {
  if (sheetData.data.length > 0) {
    const firstData = sheetData.data[0];
    const keys = Object.keys(firstData);
    const missingColumnNames = templateColumnNames.reduce(
      (prev: string[], templateColumnName: string) => {
        if (!keys.includes(templateColumnName)) prev.push(templateColumnName);
        return prev;
      },
      []
    );

    if (missingColumnNames.length > 0) {
      errorMessageData.push({
        sheet: capitalizeEachWord(sheetData.sheetName),
        error_message: errmsg_excel_template_columns_missing(
          sheetData.sheetName,
          missingColumnNames
        ),
      });
    }
  }

  return errorMessageData;
};

export const validateMultipleSheetColumnNames = (
  sheetData: TExcelSheet,
  templateColumnNames: string[]
) => {
  const errorMessageData: TTemplateErrorData[] = [];
  if (sheetData.data.length > 0) {
    const firstData = sheetData.data[0];
    const keys = Object.keys(firstData);
    const missingColumnNames = templateColumnNames.reduce(
      (prev: string[], templateColumnName: string) => {
        if (!keys.includes(templateColumnName)) prev.push(templateColumnName);
        return prev;
      },
      []
    );
    if (missingColumnNames.length > 0) {
      errorMessageData.push({
        sheet: capitalizeEachWord(sheetData.sheetName),
        error_message: errmsg_excel_template_columns_missing(
          sheetData.sheetName,
          missingColumnNames
        ),
      });
    }
  }

  return errorMessageData;
};
