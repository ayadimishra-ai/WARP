import dayjs from "dayjs";
import { TErrorExcelSheet } from "@/modules/ghg/lib/excel/excel.service";
import { sanitizeString } from "./sanitize.util";

export const months = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
] as const;

export const short_months = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
] as const;

export type TMonths = (typeof months)[number];
export type TShortMonths = (typeof short_months)[number];

const getDateMonthYear = (year: number, month: string) => {
  const monthDetail = getMonthNumberAndIndex(month);

  // console.log({ _month, year, month, monthIndex });

  return dayjs(new Date(year, monthDetail.monthIndex));
};

export const daysInMonth = (year: number, month: TMonths | TShortMonths) => {
  return getDateMonthYear(year, month).daysInMonth();
};

export const isPreviousMonth = (year: number, month: string) => {
  const date = getDateMonthYear(year, month);
  const current_date = dayjs(new Date(dayjs().year(), dayjs().month()));

  // console.log({ date, current_date });

  return date < current_date;
};
export const isAboveBaseDate = (
  year: number,
  month: string,
  baseYear: number,
  baseMonth: string
) => {
  const date = getDateMonthYear(year, month);
  const baseDate = getDateMonthYear(baseYear, baseMonth);
  return baseDate <= date;
};
export const validateMonthYear = (
  month: string,
  Year: number,
  baseMonth: string,
  baseYear: number
) => {
  const errorEnteries: TErrorExcelSheet[] = [];
  //#region baseMonth
  const baseMonthDetail = getMonthNumberAndIndex(baseMonth);
  const baseFinancialYearDate = new Date(baseYear, baseMonthDetail.monthIndex);
  //#endregion

  //#region dataMonth
  const monthDetail = getMonthNumberAndIndex(month);
  const excelDate = new Date(Year, monthDetail.monthIndex);
  //#endregion
  const newDate = new Date();
  const CurrentDate = new Date(newDate.getFullYear(), newDate.getMonth());
  if (CurrentDate <= excelDate) {
    errorEnteries.push({
      column: "Month",
      row: 0,
      errorMessage: "Current or future months are not allowed",
    });
  } else if (excelDate < baseFinancialYearDate) {
    errorEnteries.push({
      column: "Month",
      row: 0,
      //errorMessage: "Month and Year entries should be from " +String(baseMonth) + ", " + String(baseYear),
      errorMessage:
        "Data can only be uploaded from the baseline month and year (" +
        String(baseMonth) +
        ", " +
        String(baseYear) +
        ") onwards",
    });
  }
  return errorEnteries;
};

export const colorList = (totalEmissionLength: number) => {
  const color =
    totalEmissionLength === 3
      ? ["#FF9907", "#656565", "#9E9E9E"].reverse()
      : ["#FF9907", "#656565", "#9E9E9E", "#C6C6C6"].reverse();
  return color;
};

export const getMonthNumberAndIndex = (
  monthName: string
): {
  monthNumber: number;
  monthIndex: number;
} => {
  const _month = sanitizeString.v4(monthName);

  const isShortMonth = short_months
    .map(sanitizeString.v4)
    .some((m) => m === _month);

  const monthIndex = isShortMonth
    ? short_months.map(sanitizeString.v4).findIndex((m) => m === _month)
    : months.map(sanitizeString.v4).findIndex((m) => m === _month);

  return {
    monthNumber: monthIndex + 1,
    monthIndex: monthIndex,
  };
};

export const validateYearWithoutMonth = (
  month: string,
  Year: number,
  baseMonth: string,
  baseYear: number
) => {
  const errorEnteries: TErrorExcelSheet[] = [];
  //#region baseMonth
  const baseMonthDetail = getMonthNumberAndIndex(baseMonth);
  const baseFinancialYearDate = new Date(baseYear, baseMonthDetail.monthIndex);
  //#endregion

  //#region dataMonth
  const monthDetail = getMonthNumberAndIndex(month);
  const excelDate = new Date(Year, monthDetail.monthIndex);
  //#endregion
  const newDate = new Date();
  const CurrentDate = new Date(newDate.getFullYear(), newDate.getMonth());
  if (CurrentDate <= excelDate) {
    errorEnteries.push({
      column: "Month",
      row: 0,
      errorMessage: "Current or future months are not allowed",
    });
  } else if (Year < baseYear) {
    errorEnteries.push({
      column: "Year",
      row: 0,
      //errorMessage: "Month and Year entries should be from " +String(baseMonth) + ", " + String(baseYear),
      errorMessage:
        "Data can only be uploaded from the baseline year (" +
        String(baseYear) +
        ") onwards",
    });
  }
  return errorEnteries;
};

export const getMonthName = (monthNumber: number) => {
  const date = new Date(2000, monthNumber - 1); // monthNumber: 1-12
  return date.toLocaleString("default", { month: "long" });
};

export function formatDateToLocalISO(date: Date) {
  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);
  return localDate.toISOString().split("T")[0];
}

export const formatDateToLocalISO_compare = (date: any) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Months are 0-indexed
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

export function getPastYears(startYear = 2000): string[] {
  const currentYear = new Date().getFullYear();
  const from = Math.min(startYear, currentYear);
  return Array.from({ length: currentYear - from + 1 }, (_, i) =>
    String(from + i)
  );
}

export function getNextYearsFromBaseline(
  baseLineYear: number,
  range: number = 50
): string[] {
  return Array.from({ length: range }, (_, i) => String(baseLineYear + i));
}

export function getYearRange(): string[] {
  const startYear = 1900;
  const endYear = 2099;
  const years: string[] = [];

  for (let year = startYear; year <= endYear; year++) {
    years.push(year.toString());
  }

  return years;
}

/**
 * Month name to number mapping (1-indexed)
 */
export const monthNameToNumber: Record<string, number> = {
  'January': 1, 'February': 2, 'March': 3, 'April': 4,
  'May': 5, 'June': 6, 'July': 7, 'August': 8,
  'September': 9, 'October': 10, 'November': 11, 'December': 12
};
