export const AIFileUploadStatus = {
  Pending: "Pending",
  Uploading: "Uploading",
  Uploaded: "Uploaded",
  Processing: "Processing",
  VerificationPending: "VerificationPending",
  Verified: "Verified",
  UploadError: "UploadError",
  ProcessingError: "ProcessingError",
} as const;

export const AIFileUploadStatusTooltip = {
  Uploading: "File uploading in progress",
  Processing: "AI is currently extracting data from this file.",
  VerificationPending:
    "AI processing is complete. Data is ready for verification.",
  Verified: "The data has been reviewed and confirmed.",
  UploadError: "An error occurred during uploading of this file.",
  ProcessingError: "An error occurred during AI processing of this file.",
} as const;

export const AIActivityCodes = {
  EnergyGridPower: "energy_grid_power",
} as const;

export const AIEmailTemplateCodes = {
  AIFileProcessingCompleted: "AIFileProcessingCompleted",
} as const;

export const allowedTypes = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/tiff",
];
export const allowedFileTypesForErrorMessages = [
  "PDF",
  "JPG",
  "JPEG",
  "PNG",
  "TIFF",
];
export const maxFileSize = 20 * 1024 * 1024; // 20 MB

export const extractedValueLabels = {
  InvoiceNumber: "Invoice Number",
  Location: "Location",
  PreviousReadingDate: "Previous Reading Date",
  PresentReadingDate: "Present Reading Date",
  MeterNumber: "Meter Number",
  UnitsConsumed: "Units Consumed",
};

// ------ Affinda Constants. Rest are added in env file ------------
export const AFFINDA_MAX_RETRIES = 3;
export const AFFINDA_RETRY_DELAY_MS = 2000; // 2 seconds retry delay
export const AFFINDA_TIMEOUT_MS = 35000; // 35 seconds timeout

export const isUUID = (str: string) => {
  const uuidRegex =
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(str);
};
