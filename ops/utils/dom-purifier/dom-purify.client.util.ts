import { UseFormReturnType } from "@mantine/form";
import DOMPurify from "dompurify";
import { FieldValues, Path, UseFormReturn } from "react-hook-form";

export const domSanitiseValue = (input: string) => {
  try {
    return DOMPurify.sanitize(input.trim());
  } catch (error) {
    console.error("Error dompurify", error);
    return null;
  }
};
export const sanitiseFormReturnValues = <T extends FieldValues>(
  form: UseFormReturn<T>
) => {
  const values = form.getValues();

  (Object.keys(values) as Path<T>[]).forEach((field) => {
    let value = sanitiseValuesByTypeOfData(values[field]);
    form.setValue(field, value as T[Path<T>]);
  });

  return form;
};

export const sanitiseFormValuesWithType = <T extends FieldValues>(
  form: UseFormReturnType<T, (values: T) => T>
) => {
  const values = form.getValues();

  (Object.keys(values) as Path<T>[]).forEach((field) => {
    let value = sanitiseValuesByTypeOfData(values[field]);
    form.setValues({ ...form.getValues(), [field]: value as T[Path<T>] });
  });

  return form;
};

const toBoolean = (val: unknown): boolean =>
  String(val).toLowerCase() === "true";

export const sanitiseValuesByTypeOfData = (values: any) => {
  if (typeof values === "object" && values !== null) {
    const sanitizedItem = {} as typeof values;
    (Object.keys(values) as (keyof typeof values)[]).forEach((key) => {
      sanitizedItem[key] = sanitiseValuesByTypeOfData(values[key]);
    });
    return sanitizedItem;
  } else if (typeof values === "boolean") {
    return toBoolean(domSanitiseValue(String(values))) as unknown;
  } else if (typeof values === "number") {
    const sanitizedValue = domSanitiseValue(String(values));
    const parsedNumber = Number(sanitizedValue);
    const safeNumber = isNaN(parsedNumber) ? 0 : parsedNumber;
    return safeNumber as unknown;
  } else if (typeof values === "string") {
    return domSanitiseValue(String(values)) as unknown;
  } else {
    return values;
  }
};
