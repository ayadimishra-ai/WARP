import { capitalizeEachWord } from "@/modules/ghg/utils/sanitize.util";

export const errmsg_excel_template_sheet_missing = (sheetName: string) =>
  `sheet '${capitalizeEachWord(sheetName)}' is missing.`;

export const errmsg_excel_template_columns_missing = (
  sheetName: string,
  missingColumnNames: string[]
) => {
  const _names = missingColumnNames.map((cn) => `'${cn}'`).join(", ");
  const partial_msg =
    missingColumnNames.length > 1
      ? `columns ${_names} or data in the given columns are`
      : `column ${_names} or data in the given column is`;
  return ` ${partial_msg} missing in sheet '${capitalizeEachWord(sheetName)}'`;
};

export const errmsg_excel_template_sheet_no_data = (sheetName: string) =>
  `No data found in sheet '${capitalizeEachWord(sheetName)}'`;

export const errmsg_excel_template_data_validation = (sheetName: string) =>
  `some records are missing or data is not correct in sheet '${capitalizeEachWord(sheetName)}'`;
