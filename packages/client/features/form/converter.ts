import dayjs from "dayjs";
import { FormFieldInterfaceKeysType } from "./types";

export const convertInterfaceValueToString = (
  interfaceType: string,
  value: any
) => {
  if (!value) return "N/A";

  if ((interfaceType as FormFieldInterfaceKeysType) === "datetime")
    return dayjs(value, "MMM DD YYYY").isValid()
      ? dayjs(value).format("MMM DD YYYY")
      : "Invalid Date";

  if ((interfaceType as FormFieldInterfaceKeysType) === "input")
    return value.toString();
  if (
    (interfaceType as FormFieldInterfaceKeysType) === "input-auto-complete-api"
  )
    return value.toString();
  if ((interfaceType as FormFieldInterfaceKeysType) === "input-autocomplete")
    return value.toString();
  if ((interfaceType as FormFieldInterfaceKeysType) === "input-multiline")
    return value.toString();
  if ((interfaceType as FormFieldInterfaceKeysType) === "input-rich-text")
    return value.toString();
  if ((interfaceType as FormFieldInterfaceKeysType) === "select-dropdown")
    return value.toString();
  if ((interfaceType as FormFieldInterfaceKeysType) === "select-radio")
    return value.toString();
  if ((interfaceType as FormFieldInterfaceKeysType) === "select-toggle")
    return value.toString();
  if ((interfaceType as FormFieldInterfaceKeysType) === "slider")
    return value.toString();

  if (
    (interfaceType as FormFieldInterfaceKeysType) === "select-multiple-checkbox"
  )
    return value.join(", ");
  if (
    (interfaceType as FormFieldInterfaceKeysType) === "select-multiple-dropdown"
  )
    return value.join(", ");

  if ((interfaceType as FormFieldInterfaceKeysType) === "file")
    return value.name ?? "";
  if ((interfaceType as FormFieldInterfaceKeysType) === "multi-select-row")
    return value.join(", ");

  return value.toString();
};
