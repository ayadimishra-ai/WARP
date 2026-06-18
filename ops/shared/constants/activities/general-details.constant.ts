export const GeneralActivityConstant = {
  name: "General Details",
  code: "general",
  parent_code: null,
  excel_template: {
    "General Details": {
      code: "general",
      columns: [
        {
          name: "Year",
          code: "year",
        },
        {
          name: "Month",
          code: "month",
        },
        {
          name: "Number of Employees",
          code: "Number_Employees",
        },
        {
          name: "Number of Operational Days",
          code: "Number_Operational_Days",
        },
      ],
      column_name_code: {
        Year: "year",
        Month: "month",
        "Number of Employees": "Number_Employees",
        "Number of Operational Days": "Number_Operational_Days",
      },
    },
  },
} as const;

export type ReverseMap<T extends Record<keyof T, keyof any>> = {
  [P in T[keyof T]]: {
    [K in keyof T]: T[K] extends P ? K : never;
  }[keyof T];
};

export type TGeneralActivitySheetNames =
  keyof typeof GeneralActivityConstant.excel_template;

export type TGeneralActivitySheetCodes =
  (typeof GeneralActivityConstant.excel_template)[TGeneralActivitySheetNames]["code"];

export type TGeneralActivitySheetColumnProp<
  TSheetName extends TGeneralActivitySheetNames,
  TColumnProp extends
    keyof (typeof GeneralActivityConstant.excel_template)[TSheetName]["columns"][number],
> = (typeof GeneralActivityConstant.excel_template)[TSheetName]["columns"][number][TColumnProp];
