import createDOMPurify from "dompurify";
import { JSDOM } from "jsdom";
const { window } = new JSDOM("");
// ✅ Bypass trusted-types version mismatch safely
const DOMPurify = createDOMPurify(window as any);
export const domSanitiseValue = (input: string) => {
  try {
    return DOMPurify.sanitize(input.trim());
  } catch (error) {
    console.error("Error dompurify", error);
    return null;
  }
};
export const sanitiseServerSideValues = <T extends Record<string, any>>(
  data: T[]
): T[] => {
  return data.map((item) => {
    if (typeof item === "object" && item !== null) {
      return sanitiseObjectValues(item);
    } else {
      return sanitiseServerSideValuesByTypeOfData(item);
    }
  });
};
export const sanitiseObjectValues = <T extends Record<string, any>>(
  data: T
): T => {
  const sanitizedItem = {} as T;
  (Object.keys(data) as (keyof T)[]).forEach((key) => {
    if (Array.isArray(data[key])) {
      sanitizedItem[key] = sanitiseServerSideValues(
        data[key] as Record<string, any>[]
      ) as T[typeof key];
    } else {
      sanitizedItem[key] = sanitiseServerSideValuesByTypeOfData(
        data[key]
      ) as unknown as T[keyof T];
    }
  });
  return sanitizedItem;
};

export const sanitiseServerSideValuesByTypeOfData = (values: any) => {
  if (typeof values === "object" && values !== null) {
    const sanitizedItem = {} as typeof values;
    (Object.keys(values) as (keyof typeof values)[]).forEach((key) => {
      sanitizedItem[key] = sanitiseServerSideValuesByTypeOfData(values[key]);
    });
    return sanitizedItem;
  } else if (typeof values === "boolean") {
    return toBoolean(domSanitiseValue(String(values))) as unknown;
  } else if (typeof values === "number") {
    const sanitizedValue = domSanitiseValue(String(values));
    const parsedNumber = Number(sanitizedValue);
    const safeNumber = isNaN(parsedNumber) ? 0 : parsedNumber;
    return safeNumber as unknown;
  } else {
    return domSanitiseValue(String(values)) as unknown;
  }
};

const toBoolean = (val: unknown): boolean =>
  String(val).toLowerCase() === "true";
