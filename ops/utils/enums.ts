/**
 * utils/enums.ts
 *
 * Enum to represent different year types used across the app.
 */

import { months } from "./date.util";

export enum YearType {
  CALENDAR = "CALENDAR_YEAR",
  FINANCIAL = "FINANCIAL_YEAR",
}

/**
 * Type representing the string values of YearType enum.
 * Equivalent to: 'CALENDAR_YEAR' | 'FINANCIAL_YEAR'
 */
export type YearTypeValue = (typeof YearType)[keyof typeof YearType];

export const YearTypeString = {
  CALENDAR: "Calendar Year",
  FINANCIAL: "Financial Year",
} as const;

export const YearStartMonth = {
  [YearType.CALENDAR]: months[0], // "January",
  [YearType.FINANCIAL]: months[3], // "April"
} as const;
