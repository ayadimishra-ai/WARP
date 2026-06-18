import { toNumber } from "lodash";
import { z } from "zod";
import { TErrorExcelSheet, YearMonthSchema } from "~/lib/excel/excel.service";

import { TGeneralActivitySheetNames } from "~/shared/constants/activities/general-details.constant";
import { ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED } from "~/shared/constants/error.constant";

import {
  daysInMonth,
  isAboveBaseDate,
  months,
  validateMonthYear,
} from "~/utils/date.util";
import { sanitizeString } from "~/utils/sanitize.util";
let yearMonthError: TErrorExcelSheet[] = [];
export const GeneralDetailsSheetDataValidationSchema = (
  baseMonth: string,
  baseYear: number
) => {
  return YearMonthSchema(baseYear)
    .merge(
      z.object({
        "Number of Employees": z
          .unknown()
          .transform(Number)
          .refine(
            (val) => Number(val) > 0,
            (val) => ({
              message: !val
                ? isNaN(Number(val))
                  ? "Invalid data entered"
                  : `Number of employees is required.`
                : "Invalid number of employee",
            })
          )
          .refine(
            (n) => isNaN(Number(n)) || Number.isInteger(toNumber(n)),
            `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
          ),
        "Number of Operational Days": z
          .unknown()
          .transform(Number)
          .refine(
            (val) => Number(val) > 0,
            (val) => ({
              message: !val
                ? `Number of Operational Days is required.`
                : "Invalid number of operational days",
            })
          )
          .refine(
            (n) => isNaN(Number(n)) || Number.isInteger(toNumber(n)),
            `Invalid Input: ${ERROR_DECIMAL_VALUES_ARE_NOT_ALLOWED}.`
          ),
      })
    )
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (month) => sanitizeString.v1(month) == sanitizeString.v1(Month)
        );
        if (fullNameMonth.length > 0) {
          yearMonthError = validateMonthYear(Month, Year, baseMonth, baseYear);
          return yearMonthError.length == 0;
        }
        return true;
      },
      ({ Month }) => ({
        message: yearMonthError[0].errorMessage,
        path: Object.keys({ Month }),
      })
    )
    .refine(
      ({ Year, Month }) => {
        let fullNameMonth = months.filter(
          (monthItem) =>
            sanitizeString.v1(monthItem) == sanitizeString.v1(Month)
        );
        if (fullNameMonth.length > 0) {
          const result = isAboveBaseDate(Year, Month, baseYear, baseMonth);
          return result;
        }
        return true;
      },
      ({ Month }) => ({
        //message: "Month and Year should be from " + baseMonth + ", " + baseYear,
        message:
          "Data can only be uploaded from the baseline month and year (" +
          String(baseMonth) +
          ", " +
          String(baseYear) +
          ") onwards",
        path: Object.keys({ Month }),
      })
    )
    .refine(
      ({ "Number of Operational Days": days, Year, Month }) => {
        const monthDays = daysInMonth(Year, Month as any);
        const result = days <= monthDays;
        return result;
      },
      ({ "Number of Operational Days": days }) => {
        let columnMessage =
          "Operational days can't be more than no. of days in the selected month";
        if ((typeof days === "string" && Number(days) === 0) || isNaN(days)) {
          columnMessage = "Invalid data entered";
        }
        return {
          message: columnMessage,
          path: Object.keys({ "Number of Operational Days": days }),
        };
      }
    )
    .array();
};

export type TGeneralDetailsData = z.output<
  ReturnType<typeof GeneralDetailsSheetDataValidationSchema>
>;

export type TGeneralActivityTemplateErrorData = {
  sheet?: string;
  error_message: string;
}[];

export type TGeneralActivityErrorDataObject<
  TSheetName extends TGeneralActivitySheetNames,
> = TSheetName extends "General Details"
  ? {
      "Row Number": number;
    } & { [key in keyof TGeneralDetailsData[number]]: string }
  : never;

export type TGeneralActivitySheetErrorData = {
  [key in TGeneralActivitySheetNames]: TGeneralActivityErrorDataObject<key>;
};

export type TGeneralDetailsErrorDataObjectKeys<
  TSheetName extends TGeneralActivitySheetNames,
> = keyof TGeneralActivityErrorDataObject<TSheetName>;

export type TGenetalActivitySheetData<
  TSheetName extends TGeneralActivitySheetNames,
> = TSheetName extends "General Details" ? TGeneralDetailsData : never;
