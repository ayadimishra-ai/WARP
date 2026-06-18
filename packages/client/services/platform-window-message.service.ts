import { FormField } from "@warp/graphql/generated/types";
import {
  IngestData,
  InvitationAIStatus,
  invitationFormDetails,
  multipleFileUploadClick,
} from "@warp/shared/constants/app.constants";
import {
  AISuggestedDocumentType,
  DuplicateFileInfo,
  TransferableFilePayload,
} from "../features/document-repository/document-repository-utils";
export const cancelInvitationMessage = () => {
  return JSON.stringify({
    type: "warp-new-invitation-cancel",
    data: true,
  });
};

export const sendInvitationLoadingStartedMessage = () => {
  return JSON.stringify({
    type: "warp-new-invitation-started",
    data: {
      loading: true,
    },
  });
};

export const sendInvitationLoadingStartedMessageNew = () => {
  return JSON.stringify({
    type: "warp-new-invitation-started-New",
    data: {
      loading: true,
    },
  });
};

export const redirectToDocumentRepository = () => {
  return JSON.stringify({
    type: "redirect-to-document-repository",
    data: {},
  });
};

export const sendInvitationLoadingStartedMessageReport = (
  isOpenedPopup: boolean,
  formType: string
) => {
  return JSON.stringify({
    type: "warp-new-invitation-started-Report",
    data: {
      isOpenedPopup: isOpenedPopup,
      formType: formType,
    },
  });
};

export const sendInvitationResponseMessage = (
  isSuccess?: Boolean,
  formDetails?: invitationFormDetails[],
  formtype?: string
) => {
  return JSON.stringify({
    type: "warp-new-invitation-finished",
    data: {
      loading: false,
      isSuccess: isSuccess,
      formDetails: formDetails,
      formtype: formtype,
    },
  });
};

export const sendQuestionAssignedResponseMessage = (isSuccess?: Boolean) => {
  return JSON.stringify({
    type: "warp-new-question-assigned-finished",
    data: {
      loading: false,
      isSuccess: isSuccess,
    },
  });
};

export const refreshQuestion = (questionId: string) => {
  return JSON.stringify({
    type: "warp-refresh-question",
    data: {
      questionId: questionId,
    },
  });
};
export const refreshQuestionAfterComment = (questionId: string) => {
  return JSON.stringify({
    type: "warp-refresh-question-after-comment",
    data: {
      questionId: questionId,
    },
  });
};

export const showRecommendationButton = () => {
  return JSON.stringify({
    type: "warp-show-recommendation-button",
    data: {
      isRecommendationIcon: true,
    },
  });
};

export const sendInvitationValidationFailedMessage = () => {
  return JSON.stringify({
    type: "warp-new-invitation-validation-failed",
    data: {
      loading: false,
    },
  });
};

export const prevNextClick = (
  questionId: string,
  invitationId: string,
  questionWithCommentsCount: number = 0
) => {
  return JSON.stringify({
    type: "warp-prevNextClick",
    questionId: questionId,
    questionWithCommentsCount: questionWithCommentsCount,
    invitationId: invitationId,
  });
};

export const prevListingPageredirect = (formType: string) => {
  return JSON.stringify({
    type: "warp-prevListingPageredirect",
    data: {
      formType: formType,
    },
  });
};

export const navigateToListingPage = (formType: string) => {
  return JSON.stringify({
    type: "warp-navigate-to-listing-page",
    data: {
      formType: formType,
    },
  });
};

export const redirectToDocumentProcessing = (invitationId: string) => {
  return JSON.stringify({
    type: "redirect-to-document-processing",
    data: {
      invitationId: invitationId,
    },
  });
};

export const startInvitationMessage = (
  InvitationId: String,
  AssessmentFormName: string,
  ComapnyName: string,
  AIStatus: InvitationAIStatus,
  invitationStatus: String,
  AIBulkDocumentProcessings: Record<string, any>[],
  Sources: Record<string, any>[]
) => {
  return JSON.stringify({
    type: "warp-invitation-list-respond",
    data: {
      invitationId: InvitationId,
      assessmentFormName: AssessmentFormName,
      comapnyName: ComapnyName,
      AIStatus: AIStatus,
      invitationStatus: invitationStatus,
      AIBulkDocumentProcessings: AIBulkDocumentProcessings,
      Sources: Sources,
    },
  });
};

export const invitationFormStartMessage = (
  isUnProcessDocument: boolean,
  documentLogsCount: number,
  InvitationId: string,
  questionId: string,
  toPopup: boolean,
  docWithAI: boolean,
  isStarted: boolean,
  AIData?: any,
  formId?: string,
  companyId?: string,
  userId?: string,
  formType?: string,
  accessToken?: string
) => {
  console.log(
    "called for invitationFormStartMessage formId, InvitationId, AIData,formType:",
    formId,
    InvitationId,
    AIData,
    formType
  );
  return JSON.stringify({
    type: "warp-invitation-form-start",
    data: {
      isUnProcessDocument: isUnProcessDocument,
      documentLogsCount: documentLogsCount,
      invitationId: InvitationId,
      questionId: questionId,
      toPopup: toPopup,
      docWithAI: docWithAI,
      isStarted: isStarted,
      AIData: AIData,
      formId: formId,
      companyId: companyId,
      userId: userId,
      formType: formType,
      accessToken: accessToken ?? "",
    },
  });
};

export const invitationFormReviewMessage = (
  isUnProcessDocument: boolean,
  documentLogsCount: number,
  InvitationId: string,
  questionId: string,
  toPopup: boolean,
  docWithAI: boolean,
  isStarted: boolean,
  AIData?: any,
  formId?: string,
  companyId?: string,
  userId?: string,
  formType?: string,
  accessToken?: string
) => {
  return JSON.stringify({
    type: "warp-invitation-form-review",
    data: {
      isUnProcessDocument: isUnProcessDocument,
      documentLogsCount: documentLogsCount,
      invitationId: InvitationId,
      questionId: questionId,
      toPopup: toPopup,
      docWithAI: docWithAI,
      isStarted: isStarted,
      AIData: AIData,
      formId: formId,
      companyId: companyId,
      userId: userId,
      formType: formType,
      accessToken: accessToken ?? "",
    },
  });
};

export const invitationFormViewMessage = (
  isUnProcessDocument: boolean,
  documentLogsCount: number,
  InvitationId: string,
  questionId: string,
  toPopup: boolean,
  docWithAI: boolean,
  isStarted: boolean,
  AIData?: any,
  formId?: string,
  companyId?: string,
  userId?: string,
  formType?: string,
  accessToken?: string
) => {
  return JSON.stringify({
    type: "warp-invitation-form-view",
    data: {
      isUnProcessDocument: isUnProcessDocument,
      documentLogsCount: documentLogsCount,
      invitationId: InvitationId,
      questionId: questionId,
      toPopup: toPopup,
      docWithAI: docWithAI,
      isStarted: isStarted,
      AIData: AIData,
      formId: formId,
      companyId: companyId,
      userId: userId,
      formType: formType,
      accessToken: accessToken ?? "",
    },
  });
};

export const invitationFormquestionredirect = (
  InvitationId: string,
  questionId: string
) => {
  return JSON.stringify({
    type: "warp-invitation-form-question-redirect",
    data: {
      invitationId: InvitationId,
      questionId: questionId,
    },
  });
};

export const invitationFormSubmitMessage = (formType: string) => {
  return JSON.stringify({
    type: "warp-invitation-form-submit",
    data: {
      formType: formType,
    },
  });
};

export const warpApprovedSuccessfully = () => {
  return JSON.stringify({
    type: "warp-approved-successfully",
    data: null,
  });
};

export const invitationFormValidationFailedMessage = (message: string) => {
  return JSON.stringify({
    type: "warp-invitation-form-validation-failed",
    data: {
      loading: false,
      message: message,
    },
  });
};

export const viewInvitationMessage = (
  InvitationId: String,
  AssessmentFormName: string,
  ComapnyName: string,
  isRecommendationIcon: boolean,
  period: string,
  requestedFrom: string,
  questionid: string,
  DeviationCount: number,
  IsCarryForward: Boolean,
  SubmissionId: string,
  Score: string
) => {
  return JSON.stringify({
    type: "warp-invitation-list-view",
    data: {
      invitationId: InvitationId,
      assessmentFormName: AssessmentFormName,
      comapnyName: ComapnyName,
      isRecommendationIcon: isRecommendationIcon,
      period: period,
      requestedFrom: requestedFrom,
      questionid: questionid,
      DeviationCount,
      IsCarryForward,
      SubmissionId,
      Score,
    },
  });
};
export const viewRecommendationInvitationMessage = (
  InvitationId: String,
  AssessmentFormName: string,
  ComapnyName: string,
  internalAssessmentCompanyName: string,
  isRecommendationIcon: boolean,
  period: string,
  requestedFrom: string,
  DeviationCount: number,
  IsCarryForward: Boolean,
  SubmissionId: string,
  Score: string
) => {
  return JSON.stringify({
    type: "warp-recommendation-invitation-list-view",
    data: {
      invitationId: InvitationId,
      assessmentFormName: AssessmentFormName,
      comapnyName: ComapnyName,
      internalAssessmentCompanyName: internalAssessmentCompanyName,
      isRecommendationIcon: isRecommendationIcon,
      period: period,
      requestedFrom: requestedFrom,
      deviationCount: DeviationCount,
      isCarryForward: IsCarryForward,
      submissionId: SubmissionId,
      score: Score,
    },
  });
};

export const invitationFormCancelMessage = () => {
  return JSON.stringify({
    type: "warp-invitation-form-cancel",
    data: null,
  });
};

export const warpContentSize = (height: Number) => {
  return JSON.stringify({
    type: "warp-content-resize",
    data: { height: height },
  });
};

export const warpShowHideCommentList = (
  IsShow: boolean,
  IsShowComment: boolean,
  IsEditComment: boolean,
  totalCommentsOnQuestions: number,
  totalCommentButton: number,
  isAllowAssignQuestion: boolean
) => {
  return JSON.stringify({
    type: "warp-ShowHide-CommentList",
    data: {
      IsShow: IsShow,
      IsShowComment: IsShowComment,
      IsEditComment: IsEditComment,
      totalQuestions: totalCommentsOnQuestions,
      totalCommentButton: totalCommentButton,
      isAllowAssignQuestion: isAllowAssignQuestion,
    },
  });
};

export const warpReopenAssessmentSubmit = (
  ClosePopUp: boolean,
  IsShowComment: boolean,
  ShowSuccessMessage: boolean
) => {
  return JSON.stringify({
    type: "warp-Reopen-Assessment",
    data: {
      closePopUp: ClosePopUp,
      isShowComment: IsShowComment,
      showSuccessMessage: ShowSuccessMessage,
    },
  });
};

export const warpClosePopup = (isClose: boolean) => {
  return JSON.stringify({
    type: "warp-ClosePopup",
    data: { isClose: isClose },
  });
};

export const warpShowLastComment = (InvitationId: string) => {
  return JSON.stringify({
    type: "warp-last-show-comments",
    data: { InvitationId: InvitationId },
  });
};
export const warpAssignQuestion = (
  isOpenedPopup: boolean,
  formDetails: object = {}
) => {
  return JSON.stringify({
    type: "warp-AssignQuestion",
    data: {
      title: "Assign Question",
      isOpenedPopup: isOpenedPopup,
      formDetails,
    },
  });
};

export const warpAssignReviewer = (
  isOpenedPopup: boolean,
  formDetails: object = {}
) => {
  return JSON.stringify({
    type: "warp-AssignReviewer",
    data: {
      title: "Assign Reviewer",
      isOpenedPopup: isOpenedPopup,
      formDetails
    },
  });
};

export const warpAssignReviewerforAssessment = (
  isOpenedPopup: boolean,
  formDetails: object = {}
) => {
  return JSON.stringify({
    type: "warp-AssignReviewer",
    data: {
      title: "Assign Reviewer",
      isOpenedPopup: isOpenedPopup,
      formDetails
    },
  });
};

export const warpJustify = (
  isOpenedPopup: boolean,
  formDetails: object = {},
  IsCancel: boolean,
) => {
  return JSON.stringify({
    type: "warp-Justify",

    data: {
      title: "Justify Your Response",
      IsCancel: IsCancel,
      isOpenedPopup: isOpenedPopup,
      formDetails,
    },
  });
};

export const warpDeclineAnswer = (
  isOpenedPopup: boolean,
  formDetails: object = {},
  IsCancel: boolean,
) => {
  return JSON.stringify({
    type: "warp-DeclineAnswer",

    data: {
      title: "Reason for Decline",
      isOpenedPopup: isOpenedPopup,
      formDetails,
      IsCancel: IsCancel
    },
  });
};

export const warpQuestionnaireReport = (
  isOpenedPopup: boolean,
  invitationId: string
) => {
  return JSON.stringify({
    type: "warp-QuestionnaireReport",
    data: {
      title: "Assigned Questions Status",
      isOpenedPopup: isOpenedPopup,
      invitationId: invitationId,
    },
  });
};

export const warpFormSubmitConfirmation = (
  formType: string,
  isResponder: boolean,
  reviewerDetails: any,
  questionId?: string,
  invitationId?: string,
  submissionId?: string,
  formId?: string,
  isReviewerSelf?: boolean,
  isInternalAssessment?: boolean,
  role?: string
) => {
  return JSON.stringify({
    type: "warp-FormSubmitConfirmation",
    data: {
      formType: formType,
      isResponder: isResponder,
      reviewerDetails: reviewerDetails,
      questionId: questionId,
      invitationId: invitationId,
      SubmissionId: submissionId,
      formId: formId,
      isReviewerSelf: isReviewerSelf,
      isInternalAssessment: isInternalAssessment,
      role: role
    },
  });
};

export const warpShowComment = (
  isFormField: boolean,
  formFieldId: string,
  formfieldcommentscount: any[],
  questionId: any
) => {
  return JSON.stringify({
    type: "warp-show-comments",
    data: {
      isFormField: isFormField,
      formFieldId: formFieldId,
      formfieldcommentscount: formfieldcommentscount,
      questionId: questionId,
    },
  });
};
export const sendCommentsButtonCount = (formfieldcommentscount: number) => {
  return JSON.stringify({
    type: "send-comments-buttoncount",
    data: {
      formfieldcommentscount: formfieldcommentscount,
    },
  });
};

export const warpAddRecommendationPopup = (
  isOpenedPopup: boolean,
  formDetails: object = {},
  title: String,
  isSubmit: boolean
) => {
  return JSON.stringify({
    type: "warp-Add-Recommendation",
    data: {
      title: title,
      isOpenedPopup: isOpenedPopup,
      formDetails,
      isSubmit: isSubmit,
    },
  });
};

export const RecommendationListionPageMessage = (
  invitationId: String,
  Questionnare: String,
  Period: String,
  ComapnyName: string,
  DeviationCount: number,
  IsCarryForward: any,
  SubmissionId: string,
  Score: string
) => {
  return JSON.stringify({
    type: "warp-Recommendation-Listing",
    data: {
      invitationId: invitationId,
      questionnare: Questionnare,
      period: Period,
      comapnyName: ComapnyName,
      deviationCount: DeviationCount,
      isCarryForward: IsCarryForward,
      submissionId: SubmissionId,
      score: Score,
    },
  });
};

export const PageReload = () => {
  return JSON.stringify({
    type: "warp-page-reload",
    data: "redirect-to-listing",
  });
};
export const warpApprovedRecommendationMessage = (isSubmit: boolean) => {
  return JSON.stringify({
    type: "warp-Recommendation-Approved",
    data: {
      isSubmit: isSubmit,
    },
  });
};

export const ProgressReportMessage = (
  invitationId: String,
  Questionnare: String,
  Period: String,
  ComapnyName: string,
  SubmissionId: string,
  DeviationCount: number,
  IsCarryForward: Boolean
) => {
  return JSON.stringify({
    type: "Progress-Report-Message",
    data: {
      invitationId: invitationId,
      questionnare: Questionnare,
      period: Period,
      comapnyName: ComapnyName,
      submissionId: SubmissionId,
      deviationCount: DeviationCount,
      isCarryForward: IsCarryForward,
    },
  });
};

export const ProgressReportMessageRecommendation = (
  invitationId: String,
  Questionnare: String,
  Period: String,
  ComapnyName: string,
  SubmissionId: string,
  DeviationCount: number,
  IsCarryForward: Boolean
) => {
  return JSON.stringify({
    type: "Progress-Report-Message-Recommendation",
    data: {
      invitationId: invitationId,
      questionnare: Questionnare,
      period: Period,
      comapnyName: ComapnyName,
      submissionId: SubmissionId,
      deviationCount: DeviationCount,
      isCarryForward: IsCarryForward,
    },
  });
};

export const warpWarningmessage = (message: any, step: any) => {
  return JSON.stringify({
    type: "warp-warninmessage",
    data: {
      loading: false,
      message: message,
      step: step,
    },
  });
};
export const warpDeviationReport = (
  invitationId: string,
  deviationCount: number,
  Questionnare: String,
  Period: String,
  ComapnyName: string
) => {
  return JSON.stringify({
    type: "warp-DeviationReport",
    data: {
      title: "Deviation Report",
      invitationId: invitationId,
      deviationCount: deviationCount,
      questionnare: Questionnare,
      period: Period,
      comapnyName: ComapnyName,
    },
  });
};
export const raraAlertPopup = (
  message?: string,
  step?: string,
  nextActivetabId?: string
) => {
  return JSON.stringify({
    type: "document-validation-alert",
    data: {
      type: "warning",
      heading: "Incorrect Document Uploaded",
      message: message,
      step: step,
      nextActivetabId: nextActivetabId,
    },
  });
};

export const raraGetTokenDetails = () => {
  return JSON.stringify({
    type: "rara-get-token-details",
  });
};

export const closeMainLoader = () => {
  return JSON.stringify({
    type: "close-main-loader",
  });
};
export const ProcessSkipAndContinue = (
  isSkip: boolean,
  isContinue: boolean,
  isProcessDoc: boolean,
  ingestData: IngestData,
  docWithAI: boolean
) => {
  return JSON.stringify({
    type: "enable-disable-skip-and-continue",
    data: {
      isSkip: isSkip,
      isContinue: isContinue,
      isProcessDoc: isProcessDoc,
      ingestData: ingestData,
      docWithAI: docWithAI,
    },
  });
};

export const UserAIStatusUpdate = (isAIUser: boolean) => {
  return JSON.stringify({
    type: "user-ai-status-update",
    data: {
      isAIUser: isAIUser,
    },
  });
};

export const deleteFileModal = (
  configId: string,
  fileUrl: string,
  sourceFileId: string,
  sourceId: string,
  submissionId: string,
  formId: string,
  cardArray: Record<string, any>[],
  status: string
) => {
  return JSON.stringify({
    type: "delete-file-modal",
    data: {
      configId: configId,
      sourceFileId: sourceFileId,
      fileUrl: fileUrl,
      sourceId: sourceId,
      cardArray: cardArray,
      submissionId: submissionId,
      formId: formId,
      status: status,
    },
  });
};

export const documentRepositoryDeleteFileModal = (
  configId: string,
  fileUrl: string,
  documentLogsId: string,
  cardArray: Record<string, any>[],
  status: string,
  fileName?: string
) => {
  return JSON.stringify({
    type: "document-repository-delete-file-modal",
    data: {
      configId: configId,
      documentLogsId: documentLogsId,
      fileUrl: fileUrl,
      cardArray: cardArray,
      status: status,
      fileName: fileName,
    },
  });
};

export const documentRepositoryDeleteFileModaltrue = (
  configId: string,
  fileUrl: string,
  documentLogsId: string
) => {
  return JSON.stringify({
    type: "document-repository-delete-file-from-modal-true",
    data: {
      configId: configId,
      documentLogsId: documentLogsId,
      fileUrl: fileUrl,
    },
  });
};

export const documentRepositoryDuplicateDocumentModal = (
  duplicateFilesData: DuplicateFileInfo,
  // Serializable shape plus optional transferable ArrayBuffer payload
  fileDataArray: (TransferableFilePayload & { buffer?: ArrayBuffer })[],
  configId: string,
  isOther: boolean,
  docTitle: string
) => {
  // Always send a valid array for serializableFiles
  return {
    type: "document-repository-duplicate-document-modal",
    data: {
      duplicateFilesData: duplicateFilesData,
      fileDataArray: fileDataArray,
      configId: configId,
      isOther: isOther,
      docTitle: docTitle,
    },
  };
};

export const rejectAlreadyDeletedFileMessageModal = (
  deletedByUserName: string,
  deletedFileDate: string,
  configId: string,
  dropzoneConfig: AISuggestedDocumentType[]
) => {
  return {
    type: "document-repository-reject-already-deleted-file-message",
    data: {
      deletedByUserName: deletedByUserName,
      deletedFileDate: deletedFileDate,
      configId: configId,
      dropzoneConfig: dropzoneConfig,
    },
  };
};

export const rejectAlreadyDeletedFileMessageModalTrue = (
  deletedByUserName: string,
  deletedFileDate: string,
  dropzoneConfig: AISuggestedDocumentType[],
  configId: string
) => {
  return {
    type: "document-repository-reject-already-deleted-file-message-true",
    data: {
      deletedByUserName: deletedByUserName,
      deletedFileDate: deletedFileDate,
      dropzoneConfig: dropzoneConfig,
      configId: configId,
    },
  };
};
export const documentRepositoryDuplicateDocumentModalTrue = (
  duplicateFilesData: (TransferableFilePayload & { buffer?: ArrayBuffer })[],
  configId: string,
  isOther: boolean,
  docTitle: string
) => {
  return JSON.stringify({
    type: "document-repository-duplicate-document-modal-true",
    data: {
      duplicateFilesData: duplicateFilesData,
      configId: configId,
      isOther: isOther,
      docTitle: docTitle,
    },
  });
};
export const deleteFileModaltrue = (
  configId: string,
  fileUrl: string,
  sourceFileId: string
) => {
  return JSON.stringify({
    type: "delete-file-modal-true",
    data: {
      configId: configId,
      sourceFileId: sourceFileId,
      fileUrl: fileUrl,
    },
  });
};
export const viewUploadDocumentPage = (actionName: string) => {
  return JSON.stringify({
    type: "warp-view-upload-document-page",
    data: { actionName: actionName },
  });
};

export const gotoUploadDocs = (
  invitationId: string,
  assessmentFormName: string,
  comapnyName: String,
  docWithAI: boolean
) => {
  return JSON.stringify({
    type: "go-to-upload-docs",
    data: {
      invitationId: invitationId,
      assessmentFormName: assessmentFormName,
      comapnyName: comapnyName,
      docWithAI: docWithAI,
    },
  });
};

export const gotoDocumentRepository = (formType: string, context: string) => {
  return JSON.stringify({
    type: "go-to-document-repository",
    data: {
      formType: formType,
      context: context,
    },
  });
};

export const suggestionPopup = (
  formFieldId: string,
  selectedId: string,
  isFile: boolean
) => {
  return JSON.stringify({
    type: "suggestions_popup",
    data: {
      formFieldId: formFieldId,
      selectedId: selectedId,
      isFile: isFile,
    },
  });
};
export const setSuggestionStoreValueFromPopup = (
  suggestionId: string,
  value: string | string[] | Record<string, any>[],
  isSelected: boolean,
  selectedData: multipleFileUploadClick[]
) => {
  return JSON.stringify({
    type: "set-store-suggestion-value-from-popup",
    data: {
      suggestionId: suggestionId,
      value: value,
      isSelected: isSelected,
      selectedData: selectedData,
    },
  });
};

export const warpPopupIframeContentSize = (height: Number) => {
  return JSON.stringify({
    type: "warp-popupIframeContent-resize",
    data: { height: height },
  });
};

// AI / Non AI File Uploads Popup
export const uploadFilesPopup = (
  popupTitle: string,
  formField: FormField,
  selectedId: string,
  allowMultiple?: boolean,
  isFileField: boolean = true,
  questionId?: string,
  filesForPopup?: Record<string, any>[] | string[] | string,
  isSystemGenerated?: boolean,
  isExpiredDocumentfound?: boolean
) => {
  return JSON.stringify({
    type: "suggestions_file_uploads_popup",
    data: {
      popupTitle: popupTitle,
      formField: formField,
      selectedId: selectedId,
      allowMultiple: allowMultiple,
      isFileField: true,
      questionId: questionId,
      filesForPopup: filesForPopup,
      isSystemGenerated: isSystemGenerated,
      isExpiredDocumentfound: isExpiredDocumentfound,
    },
  });
};

const getParentOrigin = () =>
  process.env.NEXT_PUBLIC_PARENT_ORIGIN || window.location.origin;

export const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, getParentOrigin());

export const validateRecaptcha = (iframeId: string) => {
  return JSON.stringify({
    type: "validate-recaptcha",
    data: {
      keepCheck: true,
      iframeId: iframeId,
    },
  });
};

export const sessionLogoutLoginLink = () => {
  return JSON.stringify({
    type: "session-logout-login-link",
  });
};

export const hasExpiredDocumentsPopup = (
  hasExpiredDocumentPopup: boolean,
  formType: string,
  invitationId: string,
  formId: string,
  AIData: any,
  companyId: string,
  userId: string
) => {
  return JSON.stringify({
    type: "has-expired-documents-popup",
    data: {
      hasExpiredDocumentPopup: hasExpiredDocumentPopup,
      formType: formType,
      invitationId: invitationId,
      formId: formId,
      AIData: AIData,
      companyId: companyId,
      userId: userId,
    },
  });
};

export const LockedpageLink = () => {
  return JSON.stringify({
    type: "locked-page-link",
  });
};

export const saveClick = () => {
  return JSON.stringify({
    type: "warp-saveClick",
    data: {},
  });
};

export const documentRepositoryExpiredDocumentsPopup = (
  expiredCount: number,
  totalCount: number,
  isUpdate: boolean = false
) => {
  return JSON.stringify({
    type: "document-repository-expired-documents-popup",
    data: {
      expiredCount: expiredCount,
      totalCount: totalCount,
      isUpdate: isUpdate, // true if updating existing popup, false if opening new
    },
  });
};

export const viewInvitationMessageForMaker = (
  InvitationId: String,
  AssessmentFormName: string,
  ComapnyName: string,
  AIStatus: InvitationAIStatus,
  invitationStatus: String,
  AIBulkDocumentProcessings: Record<string, any>[],
  Sources: Record<string, any>[],
  questionId?: string,
) => {
  return JSON.stringify({
    type: "warp-invitation-view",
    data: {
      invitationId: InvitationId,
      assessmentFormName: AssessmentFormName,
      comapnyName: ComapnyName,
      AIStatus: AIStatus,
      invitationStatus: invitationStatus,
      AIBulkDocumentProcessings: AIBulkDocumentProcessings,
      Sources: Sources,
      questionId: questionId,
    },
  });
};

export const warpApproveEntireReport = (isReviewer: boolean, enable: boolean, InvitationId: String) => {
  return JSON.stringify({
    type: "Approve-entire-report",
    data: {
      isreviewer: isReviewer,
      enable: enable,
      InvitationId: InvitationId,
    },
  });
};

export const hideViewRecommendationForReviewer = (isopen: boolean) => {
  return JSON.stringify({
    type: "hide-view-recommendation-for-reviewer",
    data: {
      isopen: isopen,
    },
  });
};
