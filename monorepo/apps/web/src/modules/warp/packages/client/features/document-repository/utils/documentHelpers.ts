import { DocumentLogs_Insert_Input } from "@/modules/warp/packages/graphql/generated/types";

import { DocumentLogsStatus } from "@/modules/warp/packages/shared/constants/app.constants";
import { AISuggestedDocumentType } from "../../document-repository/document-repository-utils";

export const customDropzoneIdPrefix = "custom-";

export const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
export const createTempOtherDocEntry = (
  file: File,
  index: number,
  otherDocTemplate: AISuggestedDocumentType,
  prefix: string = customDropzoneIdPrefix
) => {
  const tempOtherDocId = `${prefix}temp-${Date.now()}-${index}`;
  const entry: AISuggestedDocumentType = {
    title: file.name,
    sampleFileUrl: otherDocTemplate.sampleFileUrl,
    acceptedFormats: otherDocTemplate.acceptedFormats,
    maxSize: otherDocTemplate.maxSize,
    isOther: true,
    id: tempOtherDocId,
    seqIndex: otherDocTemplate.seqIndex + index,
    warning: "",
    FileProcessingErrorMessage: "",
    sourceFileUrl: "",
  };
  return { tempOtherDocId, entry };
};

export const buildDocumentLogsInsertEntry = (
  file: File,
  index: number,
  aiSuggestedId: string,
  userId?: string,
  companyId?: string
): DocumentLogs_Insert_Input => {
  const uniqueId = `${crypto.randomUUID()}-${index}`;
  return {
    originalFileName: file.name,
    fileUrl: uniqueId,
    fileName: uniqueId,
    aiSuggestedDocumentId: aiSuggestedId,
    createdBy: userId,
    fileSize: String(file.size),
    error: { warning: "", error: "" },
    status: DocumentLogsStatus.Uploading,
    companyId: companyId,
  } as DocumentLogs_Insert_Input;
};

export const generateUniqueId = (index: number | string = 0) =>
  `${crypto.randomUUID()}-${index}`;

export const removeProgressFromLocalStorage = (key: string) => {
  if (typeof window !== "undefined") {
    try {
      const progress = localStorage.getItem(key);
      if (progress === "100") {
        localStorage.removeItem(key);
        window.dispatchEvent(new Event("storage"));
      }
    } catch (e) {
      // ignore
    }
  }
};

export const formatDateAndTime = (dateString: string) => {
  if (!dateString) return "-";
  const date = new Date(dateString);
  return date
    ? date.toLocaleString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    })
    : "-";
};
