import { sanitizeString } from "./sanitize.util";

export const sanitize_compare_str_v1 = (value1: string, value2: string) =>
  sanitizeString.v1(value1) === sanitizeString.v1(value2);

export const sanitize_compare_str_v2 = (value1: string, value2: string) =>
  sanitizeString.v2(value1) === sanitizeString.v2(value2);

export const sanitize_compare_str_v3 = (value1: string, value2: string) =>
  sanitizeString.v3(value1) === sanitizeString.v3(value2);

export const sanitize_compare_str_v4 = (value1: string, value2: string) =>
  sanitizeString.v4(value1) === sanitizeString.v4(value2);
//changes
