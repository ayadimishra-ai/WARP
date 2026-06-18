import { FormFieldInterfaces } from "./types";

export const checkFormFieldIsInputType = (
  fieldKey: keyof FormFieldInterfaces
) => {
  if (
    fieldKey === "datetime" ||
    fieldKey === "file" ||
    fieldKey === "input" ||
    fieldKey === "number-input" ||
    fieldKey === "input-multiline" ||
    fieldKey === "input-auto-complete-api" ||
    fieldKey === "input-autocomplete" ||
    fieldKey === "input-rich-text" ||
    fieldKey === "select-radio" ||
    fieldKey === "select-multiple-checkbox" ||
    fieldKey === "select-toggle" ||
    fieldKey === "select-dropdown" ||
    fieldKey === "select-multiple-dropdown" ||
    fieldKey === "slider" ||
    fieldKey === "multi-select-row" ||
    fieldKey === "fixed-question-table"
  )
    return true;
  return false;
};

export function toTitleCase(str: string) {
  return str.replace(
    /\w\S*/g,
    (text) => text.charAt(0).toUpperCase() + text.substring(1).toLowerCase()
  );
}
