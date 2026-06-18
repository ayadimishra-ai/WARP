export interface AISuggestedDocumentType {
  id: string;
  maxSize: number;
  sampleFileUrl?: string;
  seqIndex: number;
  title: string;
  acceptedFormats: { acceptedFormats: string[] };
  isOther: boolean;
  dataPoints?: number;
  warning: string;
  FileProcessingErrorMessage: string;
  sourceFileUrl: string;
}
export interface UploadFileStatData {
  file: File;
  metadata: string;
  fileUrl: string;
  warning: string;
  FileProcessingErrorMessage: string;
  raraResponse?: any;
  expiryDate?: string | null;
  extractionPercentage?: string | null;
}
export type DuplicateFileInfo = {
  title: string;
  originalFileName: string;
  documentLogsId: string;
};
export type TransferableFilePayload = {
  name: string;
  size: number;
  type: string;
  lastModified: number;
};
