import {
  CaptiveActivityConstant,
  FuelPurchasedActivityConstant,
  GeneralActivityConstant,
  GridPowerDetailsConstant,
  ProductionExcelActivityConstant,
  Transport_Business_TravelActivityConstant,
  TransportDownstreamExcelConstant,
  TransportEmployeeTravelActivityConstant,
  WasteActivityConstant,
} from "~/shared/constants/activity.constant";
import { ColumnSchema, ColumnType, TableSchema } from "./types";

/**
 * Maps column names from activity constants to appropriate input types
 * This follows the same logic used in the existing validation files
 */
const getColumnType = (columnName: string): ColumnType => {
  const lowerName = columnName.toLowerCase();

  if (lowerName.includes("year") || lowerName.includes("month")) {
    return "select";
  }

  if (
    lowerName.includes("unit") ||
    lowerName.includes("kwh") ||
    lowerName.includes("number") ||
    lowerName.includes("quantity") ||
    lowerName.includes("distance") ||
    lowerName.includes("percentage")
  ) {
    return "number";
  }

  return "text";
};

/**
 * Determines if a field should be required based on validation rules
 * Follows the same logic as energy-grid-power.validation.ts
 */
const isFieldRequired = (columnName: string): boolean => {
  // Year and Month are always required (consistent with YearMonthSchema)
  if (columnName === "Year" || columnName === "Month") {
    return true;
  }

  // Grid consumed is typically required for meaningful data
  if (columnName === "Units of Power Consumed - Grid (in Kwh)") {
    return true;
  }

  // Add other required fields based on business rules
  return false;
};

/**
 * Generates select options based on column type
 * Uses the same month names from utils/date.util for consistency
 */
const getSelectOptions = (columnName: string) => {
  if (columnName === "Year") {
    const currentYear = new Date().getFullYear();
    return [
      { value: "", label: "Select Year" },
      ...Array.from({ length: 5 }, (_, i) => {
        const year = (currentYear - i).toString();
        return { value: year, label: year };
      }),
    ];
  }

  if (columnName === "Month") {
    // Using same months as in validation for consistency
    const months = [
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
    ];
    return [
      { value: "", label: "Select Month" },
      ...months.map((month) => ({ value: month, label: month })),
    ];
  }

  return undefined;
};

/**
 * Converts a column code to a camelCase key for data binding
 */
const columnCodeToKey = (code: string): string => {
  // Convert snake_case or space-separated to camelCase
  return code
    .replace(/[-_\s]+(.)?/g, (_, c) => (c ? c.toUpperCase() : ""))
    .replace(/^(.)/, (c) => c.toLowerCase());
};

/**
 * Generates TableSchema from GridPowerDetailsConstant
 * Reuses the existing constant structure from activity.constant.ts
 */
export const generateGridPowerSchema = (): TableSchema => {
  const sheet = GridPowerDetailsConstant.excel_template.sheets[0];

  const columns: ColumnSchema[] = sheet.columns.map((column) => {
    const columnType = getColumnType(column.name);

    return {
      key: columnCodeToKey(column.code),
      label: column.name,
      type: columnType,
      required: isFieldRequired(column.name),
      options:
        columnType === "select" ? getSelectOptions(column.name) : undefined,
    };
  });

  return { columns };
};

/**
 * Generate schema for any activity constant (extensible design)
 * Supports: Grid Power, Captive Power, Waste, Fuel, Transport, etc.
 *
 * @param activityConstant - The activity constant from activity.constant.ts
 * @param sheetIndex - Which sheet to use (default: 0)
 */
export const generateSchemaFromConstant = (
  activityConstant:
    | typeof GridPowerDetailsConstant
    | typeof CaptiveActivityConstant
    | typeof WasteActivityConstant
    | typeof FuelPurchasedActivityConstant
    | typeof TransportDownstreamExcelConstant
    | typeof Transport_Business_TravelActivityConstant
    | typeof TransportEmployeeTravelActivityConstant
    | typeof ProductionExcelActivityConstant
    | typeof GeneralActivityConstant,
  sheetIndex: number = 0
): TableSchema => {
  const sheet = activityConstant.excel_template.sheets[sheetIndex];

  const columns: ColumnSchema[] = sheet.columns.map((column) => {
    const columnType = getColumnType(column.name);

    return {
      key: columnCodeToKey(column.code),
      label: column.name,
      type: columnType,
      required: isFieldRequired(column.name),
      options:
        columnType === "select" ? getSelectOptions(column.name) : undefined,
    };
  });

  return { columns };
};
