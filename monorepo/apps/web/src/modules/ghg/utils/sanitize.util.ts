/** @description Sanitize value by applying trim, lower, remove double space */
export const stz_string_tlds = (value: string) =>
 value ? String(value).trim().replace("  ", " ").toLocaleLowerCase() : value;

/** @description Sanitize value by applying trim, remove double space */
export const stz_string_tds = (val: string) => val ? String(val).trim().replace("  ", " ") : val;
export const stz_string_tldssc = (stringvalue: string) =>
 stringvalue ? String(stringvalue) 
    .trim()
    .replace("  ", " ")
    .replace(" ", "")
    .replace(".", "")
    .replace("-", "")
    .replace("_", "")
    .toLocaleLowerCase() : stringvalue;
export const stz_string_tlms = (val: string) =>
  val ? String(val).replace(/\s+/g, " ").trim().toLocaleLowerCase() : val;
export const stz_string_tls = (val: string) =>
 val ? String(val) .replace(/\s+/g, "").toLocaleLowerCase() : val;
export const stz_string_tl = (val: string) => val ? String(val).trim().toLocaleLowerCase() : val;
/**
 * @description
 *   v1 : Sanitize value by applying trim, lower, remove double space |
 *   v2 : Sanitize value by applying trim, remove double space
 *   v4 : Sanitize value by applying trim, lower, remove multiple spaces
 * */

export const sanitizeString = {
  /** @description Sanitize value by applying trim, lower, remove double space */
  v1: stz_string_tlds,
  /** @description Sanitize value by applying trim, remove double space */
  v2: stz_string_tds,
  v3: stz_string_tldssc,
  /** @description Sanitize value by applying trim, lower, remove multiple spaces */
  v4: stz_string_tlms,
  /** @description Sanitize value by applying trim, lower, remove all spaces */
  v5: stz_string_tls,
};

export const stz_string_sheetName = (value: string) =>
  JSON.stringify(value).replace(/['"]+/g, "").trim();

export function toSentenceCase(str: string): string {
  if (!str) return str;
  return String(str).trim().charAt(0).toUpperCase() + String(str).trim().slice(1).toLowerCase();
}

//function which capitalizes each word's first letter to UpperCase.
export function capitalizeEachWord(sentence: string): string {
  if(!sentence) return sentence;
  return  String(sentence) 
    .toLowerCase()
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

//this function will check the cell value is empty or not
//return true if value is undefined/null/blank/only empty spaces present
//return false if value is string/number/special chars/boolean values/0
export const isEmptyCell = (val: any) =>
  val === undefined || val === null || val.toString().trim() === "";
