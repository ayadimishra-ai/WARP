export const AppRoles = {
  Analytics: "Analytics",
  Approver: "Approver",
  Creator: "Creator",
  Invitee: "Invitee",
  Inviter: "Inviter",
  Platform: "Platform",
  Consultant: "Consultant",
  Responder: "Responder",
};
export const FormInvitationUIStatus = {
  Processing: "Processing",
  Requested: "Requested",
  Started: "Started",
  Responded: "Responded",
  Approved: "Approved",
  Completed: "Completed",
  Failed: "Failed",
  ReadyForReporting: "Ready for Reporting",
  ReadyForAssessment: "Ready for Assessment",
  InProgress: "In Progress",
  PendingReview: "Pending Review",
  Declined: "Declined",
  Accepted: "Accepted",
  Resubmitted: "Re-submitted",
  UnderReview: "Under Review",
};

export const FormTypes = {
  Assessment: "Assessment",
  Report: "Report",
};

export const FormInvitationStatus = {
  Draft: "Draft",
  Invited: "Invited",
  Submitted: "Submitted",
  Approved: "Approved",
  Processing: "Processing",
  Completed: "Completed",
  Failed: "Failed",
  Uploaded: "Uploaded",
  UnderReview: "Under Review",
};

export const QuestionStatus = {
  Draft: "Draft",
  Submitted: "Submitted",
  Approved: "Approved",
  Pending: "Pending",
  Responded: "Responded",
};

export const FormType = {
  Report: "Report",
  Assessment: "Assessment",
};

export const FormMode = {
  Start: "start",
  View: "view",
  Review: "review",
  ViewRecommendation: "viewrecommendation",
};

export const RecommendationStatus = {
  PendingForApproval: "Pending for approval",
  Closed: "Closed",
  TotalRecommendation: "All",
  Open: "Open",
  Reopened: "Reopened",
  NA: "NA",
};

export const EmailStatus = {
  pending: "pending",
  success: "success",
  fail: "fail",
};

export const Platform = [
  {
    Types: [
      "InviterFormAutoAppover",
      "OnFormScoreCalculationTrigger",
      "BRSRreportdata",
      "SendSuccessEmailOnSubmissionFormList",
      "InvitationListDashboardActionPermission",
      "InternalRequestCompany",
      "CommentsAccess",
      "companyFundType",
      "Recommendation_new",
      "FormIcons",
      "RaraIntegrationAccess",
      "IHCPredealFundTypeChange",
      "SelfAssessmentDisabled",
      "SelfAssessmentFiltersEnable",
    ],
    AITypes: [
      { name: "AI_AIWithDocuments_Users", docWithAI: true, onlyDoc: false },
      { name: "AI_DocumentsOnly_Users", docWithAI: false, onlyDoc: true },
    ],
  },
];
export const AtherCompanyid = {
  id: "5fcc28b9-bd53-4782-8768-146de9d25691",
};

export const HealthandSafety_formid = {
  id: "ab6bd8e1-efaf-4f75-bad8-85b679738cf0",
};

export const BRSRPDFFormId = {
  FormId: "1cca8240-d2a1-424c-9cc2-36e44c8ef139",
};
export const SourceFilesStatus = {
  Pending: "Pending",
  Ingesting: "Ingesting",
  Embedding: "Embedding",
  Success: "Success",
  Error: "Error",
  Curating: "Curating",
  Uploaded: "Uploaded",
};

export const DocumentLogsStatus = {
  Success: "Success",
  Pending: "Pending",
  Uploading: "Uploading",
  Uploaded: "Uploaded",
  Error: "Error",
  Deleted: "Deleted",
  SystemGenerated: "System Generated",
  Expiring: "Expiring",
  Processing: "Processing",
  Processed: "Processed",
  ProcessingError: "ProcessingError",
  UploadError: "UploadError"
};
export const DocumentLogsStatusServer = {
  Pending: "Pending",
  Uploading: "Uploading",
  Uploaded: "Uploaded",
  Processing: "Processing",
  Processed: "Processed",
  UploadError: "UploadError",
  ProcessingError: "ProcessingError",
  Deleted: "Deleted"
};

export type SourceTypeEntry = {
  dbTittle: string;
  frontEndTitle: string;
  priority: number;
};

export const SourcesType: Record<string, SourceTypeEntry> = {
  Web: { dbTittle: "Web", frontEndTitle: "WEBLINK", priority: 3 },
  Uploaded: { dbTittle: "Uploaded", frontEndTitle: "DOCUMENT", priority: 2 },
  OPS_Data: { dbTittle: "OPS_Data", frontEndTitle: "DATA UPLOADS", priority: 1 },
  Options: { dbTittle: "Options", frontEndTitle: "Options", priority: 4 },
};

// Helper function to get source type priority for sorting
export const getSourceTypePriority = (sourceType: string): number => {
  const source = Object.values(SourcesType).find(s => s.dbTittle === sourceType);
  return source?.priority ?? 999; // Default to high number for unknown types
};
export const DropzoneStatus = {
  idle: "idle",
  uploading: "uploading",
  processing: "processing",
  processed: "processed",
  complete: "complete",
  error: "error",
  pending: "pending",
  uploaded: "uploaded",
  systemgenerated: "System Generated",
  expiring: "Expiring",
  ProcessingError: "ProcessingError",
  UploadError: "UploadError"
};

export type InvitationAIStatus = {
  docWithAI: boolean;
  onlyDoc: boolean;
};
export type userInvitationAIStatus = {
  formId: string;
  vcUserId?: string;
  consultants: string[];
  isAIDataPointsAdded: boolean;
  docWithAI: boolean;
  onlyDoc: boolean;
};
export type AIEmailInvitation = {
  invitationId: string;
  emailType: string[];
  isInternalUSer: boolean;
};
export type getAIFeatureByDBType = {
  id: string;
  formId: string;
  isInvitedByConsultant: boolean;
  created_by: string;
  companyId: string;
  userRole: string;
};
export type InvitationIdAIDetails = {
  invitationId: string;
  AIDetail: userInvitationAIStatus;
};

export type AISuggestionCarouselProps = {
  onSelectSingleValueCard?: (
    Value: string,
    isFromPopup: boolean,
    formFieldId: string,
    isHTMLSuggestion?: boolean,
    newTitle?: string
  ) => void;
  //onSelectMultipleCard?: (Value: multiselectCard[]) => void;
  onSelectMultipleCard?: (Value: string[]) => void;
  onSelectMultipleDrodpwonCard?: (Value: Record<string, any>[]) => void;
  onFileCard?: (
    id: string,
    Value: Record<string, any>[],
    isFromPopUp: boolean,
    selectedData?: multipleFileUploadClick[]
  ) => void;
  data: AICArouselData[];
  type?: string;
  formFieldId: string;
  isclicked: boolean;
  isFile: boolean;
  clickedFileIds?: multipleFileUploadClick[];
  isDateTime?: boolean;
  isSparkIconClick?: boolean;
  halfWidth?: boolean;
  isReplaceInfoContent?: boolean;
  isActivityDataCard?: boolean;
};
export type multiselectCard = {
  key: string;
  isselect: boolean;
};
export type AICArouselData = {
  id: string;
  cardType: string;
  title: string;
  defaultData: cardDefaultData;
  suggestion: suggestionList;
  allSuggestions: string | string[] | Record<string, any>[];
  sourceCount: number;
  sourceTitle: string;
  sourceUrl: string;
  suggestionCount: number;
  suggestionlist: suggestionList;
  conflict: boolean;
  isSeletect: boolean;
  formFieldId: string;
  HTMLSuggestion?: {
    value: string;
    shortSummary?: string;
  };
};
export type suggestionCategory = {
  categoryName: string;
  description?: string;
  docs: {
    docName: string;
    docUrl: string;
    pageNo: number;
    tooltipLabelText: string;
  }[];
  isOptions: boolean;
};
export type selectedCardType = { id: string; isClicked: boolean };

export type multipleFileUploadClick = { sourceId: string; filepath: string };

export const blankCheck = [undefined, "", null, []];

export type formQuestionPercentageFill = {
  questionId: string;
  isRequired: boolean;
  formfieldId: string;
};

export type invitationFormDetails = {
  isAIForm: boolean;
  AIData: userInvitationAIStatus[];
};
export type suggestionList = {
  suggestionCategory: suggestionCategory[];
};
export const commonValues = {
  perInputTime: 2,
  youtubeLink: "",
  maxFilesAllowedInAnyOther: 10,
  commonError:
    "An unexpected error occurred while processing the document. Please try again or upload a different document.",
};
export type cardDefaultData = {
  pageNo: number;
  infoContent: string;
};

// Start - Only AI Specific Constants

export type AIDataCardsType = {
  totalInputsRequired: number;
  dataCapturedUsingAI: number;
  dataInputsWithMultipleValues: number;
  totalTimeSaved: number;
  pendingDataPoints: number;
  mandatoryFieldsCount: number;
  optionalFieldsCount: number;
  timeSavedMinutes: number;
  timeSavedUnit: string;
};

export type webCurationAPIDataType = {
  company_id: string;
  form_id: string;
  form_invitation_id: string;
  web_curation_id?: string;
  created_by?: string;
};

export const WebDataCurationStatus = {
  Pending: "Pending",
  Processing: "Processing",
  Completed: "Completed",
  Error: "Error",
};
export const bulkFileCurationStatus = {
  Pending: "Pending",
  Processing: "Processing",
  Completed: "Completed",
};
export const OPSToIQCurationStatus = {
  Pending: "Pending",
  Processing: "Processing",
  Completed: "Completed",
  Error: "Error",
};
export const AIProcessingTypes = {
  AIBulkDocumentProcessing: "AIBulkDocumentProcessing",
  WebCuration: "WebCuration",
  OPSToIQCuration: "OPSToIQCuration",
} as const;

export type AIProcessingType = typeof AIProcessingTypes[keyof typeof AIProcessingTypes];

export const AIActions = {
  uploadDocuments: "upload-documents",
  documentProcessing: "document-processing",
};
export type emailSourceFileDetails = {
  fileName: string;
  Status: string;
  fileUrl: string;
  documentName: string;
};
export type AIBulkProcessingCompleteEmail = {
  invitationId: string;
  emailType: string[];
  FileDetails: emailSourceFileDetails[];
};

export type AICurationCompleteEmail = {
  invitationId: string;
  emailType: string[];
};
export const AIEmailTemplates = {
  AIDocumentProcessed: "AIDocumentProcessed",
  AINewFormInvitation: "AINewFormInvitation",
  AINewOnboarding: "AINewOnboarding",
  AIProcessingCompletedAssessment: "AIProcessingCompleted-Assessment",
  AIProcessingCompletedReporting: "AIProcessingCompleted-Reporting",
  DataCaptureCompletedReporting: "DataCaptureCompleted-Reporting",
};

export type raraBody = {
  document_url: string;
  document_name: string;
  company_name: string;
  parentCompanies: string[];
  error: { warning: string; error: string };
  sourceFileId: string;
  isvaliddate: boolean;
};
export type raraAPIReqBody = {
  raraAPIBody: raraBody[];
  reqUrl: string;
  configData: {
    headers: {
      Authorization: string;
      "Content-Type": string;
    };
  };
  isDBUpdation: boolean;
};

export const inputFieldsinFormFields = [
  "month_year",
  "global-phone-number",
  "year",
  "decimal-number",
  "percentage",
  "boolean",
  "currency-with-comma",
  "string",
  "number-input",
  "currency-number",
  "number",
  "file",
  "array",
];
export type invitationCompletion = {
  invitationId: string;
  percentage: number;
};

export type IngestFile = {
  url: string;
  file_name: string;
  original_filename: string;
  source_id: string;
};

export type IngestData = {
  form_invitation_id: string;
  form_id: string;
  company_id: string;
  submission_id: string;
  files: IngestFile[];
  request_id?: string;
};

export type SourceFile = {
  id: any;
  error: any;
  fileName: string;
  filePath: string;
  originalFileName: string;
  originalFileUrl?: string | null;
  Sources: {
    id: any;
    FormInvitation: any;
  }[];
};
export type DocumentLogs = {
  id: string;
  companyId?: string | null;
  originalFileName?: string | null;
  status?: string | null;
  aiSuggestedDocumentId?: string;
  updatedBy?: string | null;
  updatedAt?: string | null;
  fileSize?: string | null;
  fileName?: string | null;
  fileUrl?: string | null;
  createdBy?: string | null;
  error?: any | null;
  deletedBy?: string | null;
  deletedAt?: string | null;
  __typename?: string;
};
export type rejectedFiles = { file: File; rejectionMessage: string };

export const cardInfoLabel = {
  Processed: "Processed",
  Processing: "Processing",
  AutoFetch: "Auto-fetched",
  Uploaded: "Uploaded",
  SystemGenerated: "System Generated",
  Expiring: "Expiring",
};

export type UploadStatus =
  | "idle"
  | "uploading"
  | "uploaded"
  | "processing"
  | "complete"
  | "error"
  | "pending"
  | "systemgenerated"
  | "expiring";

export const FormTypesPage = {
  Assessment: "assessment",
  Report: "reports",
};

// Form type display constants for UI
export const FORM_TYPE_UI_LABELS = {
  TITLES: {
    [FormTypes.Assessment]: "Assessment",
    [FormTypes.Report]: "Reporting",
  },
  TITLES_LOWERCASE: {
    [FormTypes.Assessment]: "assessment",
    [FormTypes.Report]: "reporting",
  },
  BUTTON_LABELS: {
    [FormTypes.Assessment]: "VIEW ALL ASSESSMENTS",
    [FormTypes.Report]: "VIEW ALL REPORTS",
  },
  PROCEED_LABELS: {
    [FormTypes.Assessment]: "ASSESSMENT",
    [FormTypes.Report]: "REPORTING",
  }
} as const;
// File type constants: Allowed file types for AI(Document) processing
export const AI_SUPPORTED_FILE_EXTENSIONS = [
  "csv",
  "pdf",
  "xlsx",
  "xls",
] as const;

export const DOCUMENT_LOGS_ACTION = "document-logs";
export const DOCUMENT_REPOSITORY_PAGE = "Document Repository";
export const CHAT_WITH_SNOWKAP_AI = "Chat with Snowkap AI";

export type internalUserformFields = {
  location: string;
  email: string;
  fullName: string;
  mobileNumber: string;
  reviewerFullName?: string;
  reviewerEmail?: string;
};

export const FORM_NAMES = {
  BRSR_CORE: "BRSR Core",
  BRSR_QUESTIONNAIRE: "BRSR Questionnaire",
  BRSR_COMPREHENSIVE_CORE: "BRSR Comprehensive Core",
} as const;

// Document validation types for RARA API
export const DOCUMENT_VALIDATION_TYPES = {
  VALIDATE_COMPANY_NAME: "validateCompanyName",
  VALIDATE_DOCUMENT_NAME: "validateDocumentName",
  EXTRACT_EXPIRY_DATE: "extractExpiryDate",
  VALIDATE_GIVEN_DATE: "validateGivenDate",
} as const;

// Document expiry notification constants
export const DOCUMENT_EXPIRY_NOTIFICATION = {
  ALERT_TYPES: {
    REMINDER_5_DAYS: "reminder_5_days",
    REMINDER_20_DAYS: "reminder_20_days",
    REMINDER_30_DAYS: "reminder_30_days",
    REMINDER_EXPIRED: "reminder_expired",
  },
  NOTIFICATION_TYPES: {
    EXPIRED: "expired",
    EXPIRING_SOON: "expiring_soon",
    BOTH: "both",
  },
  EMAIL_TYPES: {
    DOCUMENTS_EXPIRING_SOON: "DocumentsExpiringSoon", //AITODO: Need to confirm
    AI_DOCUMENTS_EXPIRED_USER: "AIDocumentsExpired-User",
    AI_DOCUMENTS_EXPIRING_SOON_USER: "AIDocumentsExpiringSoon-User",
    AI_DOCUMENTS_EXPIRED_ADMIN: "AIDocumentsExpired-Admin",
    AI_DOCUMENTS_EXPIRING_SOON_ADMIN: "AIDocumentsExpiringSoon-Admin",
  },
  THRESHOLDS: {
    DAYS_5: 5,
    DAYS_20: 20,
    DAYS_30: 30,
    MAX_DAYS: 999,
  },
} as const;

// AI Data Sources for subscription-based access control
export const AI_DATA_SOURCES = {
  COMPANY_DOCUMENTS: {
    value: "company_documents",
    label: "Document Repository",
    subscriptionKey: "hasDocumentRepo",
  },
  ESG_DOCUMENTS: {
    value: "esg_documents",
    label: "ESG Reports",
    subscriptionKey: "hasESG",
  },
  BRSR_DOCUMENTS: {
    value: "brsr_documents",
    label: "BRSR Reports",
    subscriptionKey: "hasBRSR",
  },
} as const;

// Helper type for data source configurations
export type AIDataSource = {
  value: string;
  label: string;
  enabled: boolean;
};

// End - Only AI Specific Constants
// Email Template Types
export const HeaderEmailTemplateTypes = {
  HeaderWithClientDetails: "HeaderWithClientDetails",
  Header: "Header",
}
// End Email Template Types