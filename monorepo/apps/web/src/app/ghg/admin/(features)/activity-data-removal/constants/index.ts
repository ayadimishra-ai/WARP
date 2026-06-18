import type { MonthOption, YearOption } from "../types";

export const MONTHS: MonthOption[] = [
  { label: "January", value: "January" },
  { label: "February", value: "February" },
  { label: "March", value: "March" },
  { label: "April", value: "April" },
  { label: "May", value: "May" },
  { label: "June", value: "June" },
  { label: "July", value: "July" },
  { label: "August", value: "August" },
  { label: "September", value: "September" },
  { label: "October", value: "October" },
  { label: "November", value: "November" },
  { label: "December", value: "December" },
];

// Generate year options (current year and previous 10 years)
const currentYear = new Date().getFullYear();
export const YEARS: YearOption[] = Array.from({ length: 11 }, (_, i) => ({
  label: String(currentYear - i),
  value: String(currentYear - i),
}));

export const TABLE_PAGE_SIZE = 10;

export const EMPTY_STATE_MESSAGE = "No data found. Use filters and click Load to fetch data.";

export const LOAD_SUCCESS_MESSAGE = "Data loaded successfully";
export const DELETE_SUCCESS_MESSAGE = "Records deleted successfully";
export const RESET_SUCCESS_MESSAGE = "All filters and data have been cleared";
export const DELETE_CONFIRM_TITLE = "Confirm Deletion";
export const DELETE_CONFIRM_MESSAGE = "Are you sure you want to delete the selected records? This action cannot be undone.";
