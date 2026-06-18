import { sanitizeString } from "./sanitize.util";

export const toNumber = (value: any) => {
  return Number(sanitizeString.v1(String(value)));
};
export const toNumberWith0Acceptance = (value: any) => {
  if (value === "" || value === null) {
    return -1;
  }
  return Number(sanitizeString.v1(String(value)));
};
export const getFileExtension = (filename: string) =>
  filename.split(".")[filename.split(".").length - 1];

export function getFilenameFromURL(url: string) {
  const lastIndex = url.lastIndexOf("/");
  const filename = url.substring(lastIndex + 1);
  return filename;
}
