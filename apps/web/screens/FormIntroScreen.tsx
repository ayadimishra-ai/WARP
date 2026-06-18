import { yupResolver } from "@hookform/resolvers/yup";
import {
  Accordion,
  Anchor,
  Box,
  Button,
  Card,
  Container,
  createStyles,
  Flex,
  Grid,
  Group,
  List,
  Stack,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import {
  IconAlertCircle,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons";
import {
  calculateEstimatedTime,
  callAIAPI,
  callUploadDocumentIngestingAPI,
  getAIProcesingStats,
} from "@warp/client/features/form/common-functions";
import AIUploadDocumentBtn from "@warp/client/features/form/components/AIUploadDocumentBtn";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import IntroImage from "@warp/client/icons/Introimage";
import Spinner from "@warp/client/layouts/Spinner";
import {
  cancelInvitationMessage,
  gotoDocumentRepository,
  gotoUploadDocs,
  hasExpiredDocumentsPopup,
  invitationFormReviewMessage,
  invitationFormStartMessage,
  prevListingPageredirect,
  redirectToDocumentProcessing,
  viewInvitationMessageForMaker
} from "@warp/client/services/platform-window-message.service";
import { useCreateFormSubmissionMutation } from "@warp/graphql/mutations/generated/create-form-submission";
import { useStartNewSubmissionByInvitationIdMutation } from "@warp/graphql/mutations/generated/start-new-submission-by-invitation-id";
import { useUpdateFormInvitationMutation } from "@warp/graphql/mutations/generated/update-form-invitation";
import { useGetassesseeuserbyinvitationIdQuery } from "@warp/graphql/queries/generated/get-assesseeuser-by-invitationid";
import { useGetDocumentLogsWithSourcesLazyQuery } from "@warp/graphql/queries/generated/get-document-logs-with-sources";
import { useGetExistingFormInvitationLazyQuery } from "@warp/graphql/queries/generated/get-existing-form-invitation";
import { useGetFirstDeclinedQuestionIdLazyQuery } from "@warp/graphql/queries/generated/get-first-declined-question-id";
import { useGetFormIntroByInvitationIdQuery } from "@warp/graphql/queries/generated/get-form-intro-by-invitationId";
import { useGetInvitationAndSubmissionDetailsByInvitationIdQuery } from "@warp/graphql/queries/generated/get-invitation-and-submission-details-by-invitation-id";
import { useGetLatestAnsweredQuestionIdLazyQuery } from "@warp/graphql/queries/generated/get-latest-answered-question-id";
import { useGetLatestAssignedQuestionIdLazyQuery } from "@warp/graphql/queries/generated/get-latest-assigned-question-id";
import { useGetWebCurationProcessAndAiBulkDocumentProcessingQuery } from "@warp/graphql/queries/generated/get-web-curation-process-and-ai-bulk-document-processing";

import { useGetInvitationStatusCountsLazyQuery } from "@warp/graphql/queries/generated/get-invitation-status-counts";
import {
  AI_SUPPORTED_FILE_EXTENSIONS,
  AIDataCardsType,
  AppRoles,
  commonValues,
  FormInvitationStatus,
  FormMode,
  InvitationAIStatus,
} from "@warp/shared/constants/app.constants";
import { setLocalStorageData } from "@warp/shared/utils/auth-session.util";
import {
  CompanyMetadata,
  isAIUserFromMetadata,
  PLAN_DOCUMENT_CURATION,
  PLAN_OPS_TO_IQ_CURATION,
  PLAN_WEB_CURATION,
} from "@warp/shared/utils/jwt-ai.util";
import {
  SendInvitationSelectExistingCompanySchema,
  SendInvitationSelectExistingCompanyType,
} from "@warp/shared/validation/send-invitation-select-existing-company.schema";
import axios from "axios";
import { useRouter } from "next/router";
import {
  FC,
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useForm } from "react-hook-form";
import { InfoData } from "../pages/embed/AIBasedSections/Common/InfoCard";
import InfoItem from "../pages/embed/AIBasedSections/Common/InfoItem";
import IntroArrow from "../public/images/IntroArrow";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

const AI_CARD_DATA = {
  totalInputsRequired: 0,
  dataCapturedUsingAI: 0,
  dataInputsWithMultipleValues: 0,
  totalTimeSaved: 0,
  pendingDataPoints: 0,
  mandatoryFieldsCount: 0,
  optionalFieldsCount: 0,
  timeSavedMinutes: 0,
  timeSavedUnit: "hrs",
};
const FormIntroScreen: FC<{ invitationId: string; isEmbeded?: boolean }> = ({
  invitationId,
  isEmbeded = false,
}) => {
  const isMobile = useMediaQuery("(max-width: 576px)");
  const is1366Resolution = useMediaQuery("(max-width: 1366px)");
  const is1440Resolution = useMediaQuery("(max-width: 1440px)");
  const router = useRouter();
  const userSession = useUserSession();
  const introRef = useRef<HTMLInputElement>(null);

  // Dynamic height based on resolution
  const defaultHeight = is1366Resolution || is1440Resolution ? 115 : 105;
  const [introHeight, setIntroHeight] = useState(defaultHeight + "px");
  const [loading, setLoading] = useState(true);
  const [aiDataLoading, setAiDataLoading] = useState(false);
  const [openedItem, setOpenedItem] = useState<string | null>(null);
  const [AIcardData, setAIcardData] = useState<AIDataCardsType>(AI_CARD_DATA);

  const { classes, cx } = useStyles({ opened: openedItem === "intro" });
  const [latestAnsweredQuestionIdQuery, {}] =
    useGetLatestAnsweredQuestionIdLazyQuery({ variables: { invitationId } });

  const [latestAssignedQuestionIdQuery, {}] =
    useGetLatestAssignedQuestionIdLazyQuery({
      variables: { invitationId, userId: userSession?.user?.id },
    });

  const [getFirstDeclinedQuestionIdQuery] = useGetFirstDeclinedQuestionIdLazyQuery({ variables: { invitationId } });

  const { data: AssesseeUserMappingQueryResult } =
    useGetassesseeuserbyinvitationIdQuery({
      variables: {
        invitationId,
      },
    });
  // lazy trigger to fetch DocumentLogs on demand
  const [getDocumentLogsWithSources] = useGetDocumentLogsWithSourcesLazyQuery();

  // cache and UI state for uploaded document logs count
  const [documentLogsCache, setDocumentLogsCache] = useState<{
    companyId: string;
    count: number;
  } | null>(null);
  const [noDocumentLogs, setNoDocumentLogs] = useState<boolean>(true);
  const [documentLogsCount, setDocumentLogsCount] = useState<number>(0);
  const [formInvitationAIData, setFormInvitationAIData] = useState<{
    allowedAICuration: string[];
    triggeredCuration: string[];
  }>({
    allowedAICuration: [],
    triggeredCuration: [],
  });

  // whether any AI curation data exists for this invitation
  const webCurationAndBulkProcessingQuery =
    useGetWebCurationProcessAndAiBulkDocumentProcessingQuery({
      skip: !invitationId,
      variables: { invitationIds: invitationId ? [invitationId] : [] },
      fetchPolicy: "network-only",
    });
  const [updateFormInvitation] = useUpdateFormInvitationMutation();

  const hasExistingCurationOrProcessing = useMemo(() => {
    const wc = webCurationAndBulkProcessingQuery?.data?.WebCuration ?? [];
    const bp =
      webCurationAndBulkProcessingQuery?.data?.AIBulkDocumentProcessing ?? [];
    const ops = webCurationAndBulkProcessingQuery?.data?.OPSToIQCuration ?? [];
    return (
      (Array.isArray(wc) ? wc.length : 0) +
        (Array.isArray(bp) ? bp.length : 0) +
        (Array.isArray(ops) ? ops.length : 0) >
      0
    );
  }, [webCurationAndBulkProcessingQuery?.data]);

  const [getExistingFormInvitation] = useGetExistingFormInvitationLazyQuery();

  const invitationAndSubmissionQueryResult =
    useGetInvitationAndSubmissionDetailsByInvitationIdQuery({
      skip: !invitationId,
      variables: {
        invitationId,
        includeAllSections: true,
      },
    });

    const [fetchInvitationStatusCounts, { data: invitationStatusData, loading: invitationStatusLoading }] =
    useGetInvitationStatusCountsLazyQuery({
      fetchPolicy: "cache-first",
    });

    useEffect(() => {
      if (invitationId) {
        fetchInvitationStatusCounts({ variables: { invitationId } });
      }
    }, [invitationId]);

  const formIntroQueryResult = useGetFormIntroByInvitationIdQuery({
    skip: !invitationAndSubmissionQueryResult.data,
    variables: { invitationId },
    fetchPolicy:
      invitationAndSubmissionQueryResult?.data?.FormInvitation[0]?.status ===
      FormInvitationStatus.Invited
        ? "network-only"
        : "cache-and-network", // fetch fresh data for Invited status, to update AI content and text
  });
 
  const formInvitation = invitationAndSubmissionQueryResult?.data?.FormInvitation?.[0];

  const isReviewer = formInvitation?.reviewerDetails?.id === userSession?.user?.id;

  const isMaker =
    formInvitation?.ParentCompanyMapping?.UserId === userSession?.user?.id ||
    formInvitation?.parentCompanyMappingByReviewerparentcompanyid?.ParentUserId ===
      userSession?.user?.id;

  let isFormSubmitted =
    formInvitation?.status === FormInvitationStatus.Submitted ||
    formInvitation?.status === FormInvitationStatus.Approved ||
    formInvitation?.status === FormInvitationStatus.UnderReview;

  // helper to fetch uploaded document logs count for a company (cached)
  const fetchDocumentLogsCount = useCallback(
    async (companyId: string) => {
      if (!companyId) return 0;
      if (documentLogsCache?.companyId === companyId)
        return documentLogsCache.count;

      if (
        invitationAndSubmissionQueryResult.loading ||
        formIntroQueryResult.loading ||
        !formIntroQueryResult.data?.FormInvitation?.[0]
      ) {
        console.log("Waiting for queries to complete...");
        return 0;
      }

      if (!formIntroQueryResult.data?.FormInvitation?.[0]) {
        console.log("No FormInvitation data available yet");
        return 0;
      }

      try {
        // 1. Get uploaded documents(not null records)
        const dlRes = await getDocumentLogsWithSources({
          variables: {
            where: {
              companyId: { _eq: companyId },
              status: { _in: ["Uploaded", "Processing", "Processed"] },
              createdBy: { _is_null: false }, //  Only user-uploaded documents
            },
            limit: 100,
            offset: 0,
            order_by: [{ createdAt: "desc" as any }],
          },
          fetchPolicy: "network-only",
        });
        let documentLogs = dlRes?.data?.DocumentLogs ?? [];

        /**
         * Document Collection Strategy for AI Processing Count
         *
         * PURPOSE: Count documents from two sources for comprehensive AI analysis
         *
         * SOURCE 1: Documents from DocumentLogs table, except system-generated (all)
         *
         * SOURCE 2: Previous Period System Report (1 file)
         * - Find immediate previous reporting period (e.g., if current is 25-26, look for 24-25)
         * - Search for FormInvitation from that period with same company/user
         * - If not found, skip historical report (no recursive search)
         * - Retrieve the system-generated report from that period
         *
         * RESULT: Merge both sources for AI processing count
         */

        //  Get current FormInvitation details (now guaranteed to exist)
        const currentFormInvitation =
          formIntroQueryResult.data.FormInvitation[0];
        let historicalSystemReport: any[] = [];

        //  If Form is AI enabled && currentFormInvitation exists
        if (
          currentFormInvitation?.Form?.isAIDataPointsAdded &&
          currentFormInvitation
        ) {
          try {
            // Extract current period dates
            const currentDurationFrom = new Date(
              currentFormInvitation.durationFrom,
            );
            const currentDurationTo = new Date(
              currentFormInvitation.durationTo,
            );

            // Calculate previous period (subtract 1 year from both dates)
            const previousDurationFrom = new Date(currentDurationFrom);
            previousDurationFrom.setFullYear(
              previousDurationFrom.getFullYear() - 1,
            );

            const previousDurationTo = new Date(currentDurationTo);
            previousDurationTo.setFullYear(
              previousDurationTo.getFullYear() - 1,
            );

            console.log(
              `[DocumentCount] current duration: ${
                currentDurationFrom.toISOString().split("T")[0]
              } to ${currentDurationTo.toISOString().split("T")[0]}`,
            );
            console.log(
              `[DocumentCount] Searching for previous period report: ${
                previousDurationFrom.toISOString().split("T")[0]
              } to ${previousDurationTo.toISOString().split("T")[0]}`,
            );

            // Search for FormInvitation from previous period
            const previousInvitationResult = await getExistingFormInvitation({
              variables: {
                companyId: [companyId],
                formId: [currentFormInvitation.formId],
                durationFrom: previousDurationFrom.toISOString().split("T")[0],
                durationTo: previousDurationTo.toISOString().split("T")[0],
                parentcompanyId: [currentFormInvitation.parentcompanyId],
              },
              fetchPolicy: "network-only",
            });

            const previousInvitation =
              previousInvitationResult?.data?.FormInvitation?.[0];

            if (previousInvitation) {
              console.log(
                `[DocumentCount] Found previous invitation: ${previousInvitation.id}`,
              );

              // Fetch system-generated report from previous period
              const previousReportResult = await getDocumentLogsWithSources({
                variables: {
                  where: {
                    uploadedFromInvitationId: { _eq: previousInvitation.id },
                    createdBy: { _is_null: true }, // System-generated files have null createdBy
                    status: { _eq: "Uploaded" },
                  },
                },
                fetchPolicy: "network-only",
              });

              const previousReport =
                previousReportResult?.data?.DocumentLogs?.[0];

              if (previousReport) {
                console.log(
                  `[DocumentCount] Found previous system report: ${previousReport.originalFileName}`,
                );
                historicalSystemReport = [previousReport];
              } else {
                console.log(
                  `[DocumentCount] No system-generated report found for previous period`,
                );
              }
            } else {
              console.log(
                `[DocumentCount] No FormInvitation found for previous period`,
              );
            }
          } catch (error) {
            console.warn(
              `[DocumentCount] Error fetching historical report:`,
              error,
            );
          }
        }

        // Filter documents to only include supported file types for AI processing
        const filteredDocumentLogs = documentLogs.filter((log: any) => {
          const fileName = log.originalFileName || "";
          const fileExtension = fileName.split(".").pop()?.toLowerCase();
          const isSupported = AI_SUPPORTED_FILE_EXTENSIONS.includes(
            fileExtension as any,
          );

          if (!isSupported) {
            console.warn(
              `Excluding file from AI processing count: ${fileName} (extension: ${fileExtension})`,
            );
          }

          return isSupported;
        });

        //  Merge current documents with historical system report
        const mergedDocumentLogs = [...filteredDocumentLogs];
        if (historicalSystemReport.length > 0) {
          mergedDocumentLogs.push(...historicalSystemReport);
        }
        documentLogs = mergedDocumentLogs;

        // Count unprocessed documents (documents without sources)
        const unprocessedCount = documentLogs.filter(
          (l: any) =>
            !(l?.documentLogsSources && l.documentLogsSources.length > 0),
        ).length;

        console.log(`Document count breakdown:
          - User-uploaded documents: ${filteredDocumentLogs.length}
          - Historical system reports: ${historicalSystemReport.length}
          - Total merged documents: ${documentLogs.length}
          - Unprocessed count: ${unprocessedCount}`);

        // Update cache and state
        setDocumentLogsCache({ companyId, count: unprocessedCount });
        setDocumentLogsCount(unprocessedCount);
        setNoDocumentLogs(unprocessedCount === 0);

        return unprocessedCount;
      } catch (err) {
        console.error(
          "Error fetching DocumentLogs count with historical reports:",
          err,
        );
        setDocumentLogsCount(0);
        setNoDocumentLogs(true);
        return 0;
      }
    },
    [
      getDocumentLogsWithSources,
      getExistingFormInvitation,
      documentLogsCache,
      invitationAndSubmissionQueryResult.loading,
      formIntroQueryResult.loading,
      formIntroQueryResult.data,
    ],
  );

  const formType =
    !!formIntroQueryResult?.data &&
    formIntroQueryResult?.data?.FormInvitation.length > 0
      ? formIntroQueryResult?.data?.FormInvitation[0]?.Form?.formtype
      : "";

  const isSelf =
    formType === "Report"
      ? formInvitation?.ParentCompanyMapping?.ParentUserId ===
        userSession?.user?.id && formInvitation?.ParentCompanyMapping?.UserId ===
        userSession?.user?.id
      : isMaker;

  // run initial fetch for current session company
  useEffect(() => {
    const companyId = userSession?.company?.id ?? "";

    // Only run when BOTH queries are complete
    if (
      !companyId ||
      invitationAndSubmissionQueryResult.loading ||
      formIntroQueryResult.loading ||
      !formIntroQueryResult.data
    ) {
      return;
    }

    let mounted = true;
    (async () => {
      const count = await fetchDocumentLogsCount(companyId);
      if (!mounted) return;
      // state already set inside helper
    })();
    return () => {
      mounted = false;
    };
  }, [
    userSession?.company?.id,
    fetchDocumentLogsCount,
    invitationAndSubmissionQueryResult.loading,
    formIntroQueryResult.loading,
    formIntroQueryResult.data,
  ]);

  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      try {
        if (typeof event.data !== "string") return;
        const messageData = JSON.parse(event.data);
        const type = messageData.type;
        if (type === "snowkap-isRefreshPage" && messageData.questionId) {
          setLocalStorageData(
            window.localStorage,
            "IsPageRefreshed",
            messageData.questionId,
          );
        }
      } catch (error) {
        // Silently ignore non-JSON messages or unrelated messages
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, []);

  const AssesseeUserMappingResult: any = useMemo(() => {
    if (!AssesseeUserMappingQueryResult?.AssesseeUserMapping[0]) return null;
    return AssesseeUserMappingQueryResult?.AssesseeUserMapping;
  }, [AssesseeUserMappingQueryResult]);

  let isResponderUser: any =
    AssesseeUserMappingResult?.filter(
      (x: any) => x.userId === userSession?.user?.id,
    ).length > 0
      ? true
      : false;
  let latestAnsweredQuestionId = "";

  // let isgroupform, isindustryselected;

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      if (
        introRef &&
        introRef.current &&
        introRef.current.clientHeight >= defaultHeight
      ) {
        if (userSession?.user?.role === AppRoles.Responder) {
          setIntroHeight(100 + "%");
          setLoading(false);
        } else {
          setIntroHeight(defaultHeight + "px");
          setLoading(false);
        }
      } else {
        setIntroHeight(100 + "%");
        setLoading(false);
      }
    }, 2000);
  }, [defaultHeight, userSession?.user?.role]);

  const viewMore = () => {
    setIntroHeight(100 + "%");
  };
  const viewLess = () => {
    setIntroHeight(defaultHeight + "px");
  };

  let isCarryForwardForm: boolean = !!formIntroQueryResult?.data
    ? !!formIntroQueryResult?.data?.FormInvitation[0]?.interimCheck
        .isCarryForward
    : false;

  const { query } = useRouter();
  const { accessToken } = query;
  const isAIUser = isAIUserFromMetadata(
    formIntroQueryResult?.data?.FormInvitation[0]?.metadata,
  );
  const hasAllowedAICuration = useMemo(() => {
    const allowedCuration = formInvitationAIData?.allowedAICuration || [];
    return allowedCuration.length > 0;
  }, [formInvitationAIData]);

  const hastriggeredAICuration = useMemo(() => {
    const triggeredCuration = formInvitationAIData?.triggeredCuration || [];
    return triggeredCuration.length > 0;
  }, [formInvitationAIData]);

  // Metadata-derived capability flags — single source of truth, no JWT needed.
  const hasDocumentCurationInMetadata =
    formInvitationAIData?.allowedAICuration?.includes(PLAN_DOCUMENT_CURATION) ?? false;
  const hasWebCurationInMetadata =
    formInvitationAIData?.allowedAICuration?.includes(PLAN_WEB_CURATION) ?? false;
  const hasOPSToIQInMetadata =
    formInvitationAIData?.allowedAICuration?.includes(PLAN_OPS_TO_IQ_CURATION) ?? false;
  const hasOnlyOPSToIQCuration = hasOPSToIQInMetadata && !hasDocumentCurationInMetadata && !hasWebCurationInMetadata; 

  //#region AIDataStats
  const formId =
    !!formIntroQueryResult?.data &&
    formIntroQueryResult?.data?.FormInvitation.length > 0
      ? formIntroQueryResult?.data?.FormInvitation[0]?.Form?.Details?.formId
      : "";

  useEffect(() => {
    const formInvitationAIData =
      formIntroQueryResult?.data?.FormInvitation[0]?.metadata?.AIData;

    const formType =
      !!formIntroQueryResult?.data &&
      formIntroQueryResult?.data?.FormInvitation.length > 0
        ? formIntroQueryResult?.data?.FormInvitation[0]?.Form?.formtype
        : "";

    // postParentMessage(BackToAssessmentOrReportButton(formType ?? ""));

    setFormInvitationAIData(formInvitationAIData);
  }, [formIntroQueryResult?.data]);

  // Memoize AIcardData to only recalculate when FormInvitation data changes
  const memoizedAICardData = useMemo(() => {
    const formInvitation = formIntroQueryResult?.data?.FormInvitation?.[0];
    const metadata = formInvitation?.metadata;
    return metadata?.dataStatsSummary || AI_CARD_DATA;
  }, [formIntroQueryResult?.data?.FormInvitation]);

  // Extract dataStatsSummary to avoid complex dependency
  const dataStatsSummary =
    formIntroQueryResult?.data?.FormInvitation?.[0]?.metadata?.dataStatsSummary;

  // Check if metadata has dataStatsSummary, if yes use it, otherwise call API
  useEffect(() => {
    const hasDataStatsSummary = !!dataStatsSummary;

    // Only proceed if we have formIntroQueryResult data
    if (!formIntroQueryResult?.data?.FormInvitation) {
      // If we have AI capabilities but no data yet, show loading
      if (isAIUser && formId && invitationId) {
        setAiDataLoading(true);
      }
      return;
    }

    if (hasDataStatsSummary) {
      // Use metadata data
      setAIcardData(memoizedAICardData);
      setAiDataLoading(false);
    } else if (formId && invitationId) {
      // Only call API if metadata doesn't have dataStatsSummary
      setAiDataLoading(true);
      getAIProcesingStats(formId, invitationId, isAIUser)
        .then((AIcardformData) => {
          setAIcardData(AIcardformData);
          setAiDataLoading(false);
        })
        .catch((error) => {
          console.error("Error calling getAIProcesingStats: ", error);
          setAiDataLoading(false);
        });
    } else {
      // Set default values if conditions not met
      setAIcardData(AI_CARD_DATA);
      setAiDataLoading(false);
    }
  }, [
    dataStatsSummary,
    formId,
    formIntroQueryResult?.data?.FormInvitation,
    invitationId,
    isAIUser,
    memoizedAICardData,
  ]);
  //#endregion

  useEffect(() => {
    const formInvitationStatus = formInvitation?.status;

    // if the invitation is in Processing state, redirect parent to upload docs
    if (
      !!formInvitationStatus &&
      formInvitationStatus === FormInvitationStatus.Processing
    ) {
      postParentMessage(
        gotoUploadDocs(
          String(
            !!formIntroQueryResult?.data &&
              formIntroQueryResult?.data?.FormInvitation.length > 0
              ? formIntroQueryResult?.data?.FormInvitation[0]?.id
              : "",
          ),
          String(
            !!formIntroQueryResult?.data &&
              formIntroQueryResult?.data?.FormInvitation.length > 0
              ? formIntroQueryResult?.data?.FormInvitation[0]?.Form?.name
              : "",
          ),
          String(
            !!formIntroQueryResult?.data &&
              formIntroQueryResult?.data?.FormInvitation.length > 0
              ? formIntroQueryResult?.data?.FormInvitation[0]?.Company?.name
              : "",
          ),
          // use AI-capability flag (falls back to false)
          !!isAIUser,
        ),
      );
    }
  }, [formIntroQueryResult?.data, isAIUser, formInvitation?.status]);
  const { setError, handleSubmit, control, reset } =
    useForm<SendInvitationSelectExistingCompanyType>({
      resolver: yupResolver(SendInvitationSelectExistingCompanySchema),
      defaultValues: {
        duration: { fromDate: new Date(), toDate: new Date() },
        selectedCompanyIds: [],
      },
    });

  const startNewSubmissionMutation =
    useStartNewSubmissionByInvitationIdMutation()[0];

  const createNewSubmissionMutation = useCreateFormSubmissionMutation()[0];

  // Helper function to check for expired documents
  const checkForExpiredDocuments = useCallback(
    async (companyId: string): Promise<boolean> => {
      try {
        const documentLogsResult = await getDocumentLogsWithSources({
          variables: {
            where: {
              companyId: { _eq: companyId },
              status: { _eq: "Uploaded" },
              createdBy: { _is_null: false }, // Only user-uploaded documents
              expiryDate: { _is_null: false }, // Only documents with expiry dates
            },
          },
          fetchPolicy: "cache-first", // Use cache first to avoid unnecessary network calls
        });

        const documentLogs = documentLogsResult?.data?.DocumentLogs ?? [];
        const currentDate = new Date();

        // Check for expired documents (expiryDate <= current date)
        const expiredDocuments = documentLogs.filter((doc: any) => {
          if (!doc.expiryDate) return false;
          const expiryDate = new Date(doc.expiryDate);
          return expiryDate <= currentDate;
        });

        const hasExpiredDocuments = expiredDocuments.length > 0;

        if (hasExpiredDocuments) {
          expiredDocuments.forEach((doc: any) => {
            const expiryDate = new Date(doc.expiryDate);
            const daysExpired = Math.floor(
              (currentDate.getTime() - expiryDate.getTime()) /
                (1000 * 60 * 60 * 24),
            );
            console.warn(
              `Expired document: ${doc.originalFileName} (expired ${daysExpired} days ago)`,
            );
          });
        }

        return hasExpiredDocuments;
      } catch (error) {
        console.error("Error checking for expired documents:", error);
        return false;
      }
    },
    [getDocumentLogsWithSources],
  );

  const formDetails = useMemo(() => {
    if (!formIntroQueryResult.data) return;

    const _formDetails =
      formIntroQueryResult.data.FormInvitation[0]?.Form?.Details;
    const globalMasterDetails = formIntroQueryResult.data?.GlobalMaster?.filter(
      (item) => item.type === "FormIcons",
    )[0]?.data;

    const globalMasterDetailsFocusarea =
      formIntroQueryResult.data?.GlobalMaster?.filter(
        (item) => item.type === "FocusArea",
      )[0]?.data;

    const _formIds =
      formIntroQueryResult.data.FormInvitation[0]?.Form?.GroupForms.map(
        (index: any) => index.formId,
      );

    if (!_formDetails) return null;

    return {
      ..._formDetails,
      focusArea: _formDetails.focusArea?.map((_focusArea: string) => ({
        [_focusArea]: globalMasterDetails[_focusArea],
      })),
      focusAreahide: globalMasterDetailsFocusarea,
    };
  }, [formIntroQueryResult.data]);
  const datapointsStats = [
    {
      label: "Total Data Inputs Required",
      info: `The total number of data points needed to complete the ${
        !!formDetails ? formDetails?.framework : ""
      }  for submission.`,
      value:
        !!AIcardData.totalInputsRequired && AIcardData.totalInputsRequired > 0
          ? AIcardData.totalInputsRequired
          : 0,
      mandatory: null,
      optional: null,
    },
    {
      label: isAIUser ? "Data Captured using AI" : "Data Capture from Activity Data",
      info: isAIUser ? "The number of data points successfully captured and curated from publicly available sources by the AI bot. These data points are automatically filled into the questionnaire to save time and reduce manual effort." : "This represents the number of data points successfully mapped from your uploaded activity data. These are automatically pre-filled into the questionnaire to save time and ensure consistency.",
      value:
        !!AIcardData.dataCapturedUsingAI && AIcardData.dataCapturedUsingAI > 0
          ? AIcardData.dataCapturedUsingAI
          : 0,
      mandatory: null,
      optional: null,
    },
    ...(!hasOnlyOPSToIQCuration ? [{
      label: "Data Inputs With Multiple Values",
      info: "The number of data points where conflicting or incomplete information was detected. These may require manual review or correction.",
      value:
        !!AIcardData.dataInputsWithMultipleValues &&
        AIcardData.dataInputsWithMultipleValues > 0
          ? AIcardData.dataInputsWithMultipleValues
          : 0,
      mandatory: null,
      optional: null,
    }] : []),
    {
      label: "Total Time Saved",
      info: isAIUser ? "An estimate of the time saved by using AI to curate data from public sources, allowing faster completion of the questionnaire." : "This indicates the estimated time saved by automatically mapping your activity data to the report, enabling faster and more consistent completion of the questionnaire.",
      value:
        !!AIcardData.totalTimeSaved && AIcardData.totalTimeSaved > 0
          ? AIcardData.totalTimeSaved
          : 0,
      mandatory: null,
      optional: null,
    },
    {
      label: "Data Points Pending",
      info:
        AIcardData.mandatoryFieldsCount > 0 &&
        AIcardData.optionalFieldsCount > 0
          ? `This shows the total number of data inputs required to complete the current process.\n
        Mandatory Inputs (${AIcardData.mandatoryFieldsCount}): Essential inputs required to proceed.\n
        Optional Inputs (${AIcardData.optionalFieldsCount}): Non-essential inputs that can enhance data completeness but are not required.`
          : AIcardData.mandatoryFieldsCount == 0 &&
            AIcardData.optionalFieldsCount > 0
          ? `This shows the total number of data inputs required to complete the current process.\n
        Optional Inputs (${AIcardData.optionalFieldsCount}): Non-essential inputs that can enhance data completeness but are not required.`
          : AIcardData.mandatoryFieldsCount > 0 &&
            AIcardData.optionalFieldsCount == 0
          ? `This shows the total number of data inputs required to complete the current process.\n
        Mandatory Inputs (${AIcardData.mandatoryFieldsCount}): Essential inputs required to proceed.`
          : AIcardData.mandatoryFieldsCount == 0 &&
            AIcardData.optionalFieldsCount == 0
          ? `This shows the total number of data inputs required to complete the current process.`
          : "",
      value:
        !!AIcardData.pendingDataPoints && AIcardData.pendingDataPoints > 0
          ? AIcardData.pendingDataPoints
          : 0,
      mandatory: AIcardData.mandatoryFieldsCount,
      optional: AIcardData.optionalFieldsCount,
    },
  ];

  // Compute review summary counts from ReviewerDetailsMapping
  // Must be called before early returns to satisfy React hooks rules
  const reviewSummaryCounts = useMemo(() => {
    // ReviewerDetailsMappings is a direct relationship on FormInvitation
    let reviewerMappings: any[] =
      (invitationStatusData?.FormInvitation?.[0] as any)
        ?.ReviewerDetailsMappings ?? [];

    // Filter by assigned questions if user is a Responder
    if (userSession?.user?.role === AppRoles.Responder && AssesseeUserMappingResult) {
      const assignedQuestionIds = AssesseeUserMappingResult
        .filter((m: any) => m.userId === userSession?.user?.id)
        .map((m: any) => m.questionId);
      
      reviewerMappings = reviewerMappings.filter((m: any) =>
        assignedQuestionIds.includes(m.questionId),
      );
    }

    const accepted = reviewerMappings.filter(
      (m: any) => m.currentStatus === "Accepted",
    ).length;

    const declined = reviewerMappings.filter(
      (m: any) => m.currentStatus === "Declined",
    ).length;

    const reSubmitted = reviewerMappings.filter(
      (m: any) => m.currentStatus === "Re-Submitted",
    ).length;

    // Pending for Approval: FormFields where interfaceOptions.isFirstQuestion === true
    let allFormFields: any[] =
      (invitationAndSubmissionQueryResult.data?.FormInvitation?.[0] as any)?.Form?.AllSections?.flatMap(
        (s: any) => s.Questions?.flatMap((q: any) => q.FormFields ?? []) ?? [],
      ) ?? [];

    // Filter allFormFields by assigned questions if user is a Responder
    if (userSession?.user?.role === AppRoles.Responder && AssesseeUserMappingResult) {
      const assignedQuestionIds = AssesseeUserMappingResult
        .filter((m: any) => m.userId === userSession?.user?.id)
        .map((m: any) => m.questionId);

      allFormFields = allFormFields.filter((f: any) =>
        assignedQuestionIds.includes(f.questionId),
      );
    }

    let pendingForApproval = allFormFields.filter(
      (f: any) =>
        f.questionId !== null &&
        f.questionId !== undefined &&
        f.groupField?.toLowerCase().includes("tabs"),
    ).length;
    let totalQuestions = pendingForApproval;
    pendingForApproval = pendingForApproval - (accepted + declined + reSubmitted);


    return { accepted, declined, reSubmitted, pendingForApproval, totalQuestions };
  }, [invitationAndSubmissionQueryResult.data?.FormInvitation, invitationStatusData?.FormInvitation, AssesseeUserMappingResult, userSession?.user?.id]);

  const cancel = () => {
    postParentMessage(cancelInvitationMessage());
  };
  if (
    invitationStatusLoading ||
    !invitationStatusData
  )
    return <Spinner visible={true} />;
  // return <LoadingOverlay visible />;

  if (
    !invitationStatusData
  )
    return <></>;

  if (!formInvitation) return <></>;
  const formSubmission = formInvitation?.FormSubmissions[0];

  const invitationStatus = formInvitation.status;
  const submissionStatus = formSubmission?.status;
  const isCarryForwarded = formInvitation.interimCheck?.isCarryForward;
  let firstQuestion = formInvitation.Form?.Sections[0]?.Questions[0]?.id;

  const isApproved = invitationStatus === FormInvitationStatus.Approved;
  const isStarted = invitationStatus === FormInvitationStatus.Draft;
  const isInvited = invitationStatus === FormInvitationStatus.Invited;
  const isSubmitted = invitationStatus === FormInvitationStatus.Submitted;
  const isUnderReview = invitationStatus === FormInvitationStatus.UnderReview;
  const isDeclined = submissionStatus === "Declined";

  // Review Summary: only show when status is Under Review
  const showReviewSummary = isUnderReview;

  // Role-based button cases
  // Cast to any because generated types haven't been regenerated yet (status was added to the GQL query)
  const formSubmissionStatus = (formSubmission as any)?.status as string | undefined;
  const reviewerUserId = formInvitation?.reviewerDetails?.userId;
  const parentCompanyUserId = formInvitation?.ParentCompanyMapping?.UserId;

  // Case 1: Reviewer – Under Review (non-resubmit)
  const isReviewerUnderReview =
    !!reviewerUserId &&
    userSession?.user?.id === reviewerUserId &&
    isUnderReview &&
    formSubmissionStatus !== "Re-Submitted";

  // Case 2: Parent Company – Submission Declined
  const isParentCompanyDeclined =
    (isMaker &&
    formSubmissionStatus === "Declined") || (userSession?.user?.role === AppRoles.Responder &&
    formSubmissionStatus === "Declined");

  // Case 3: Reviewer – Re-Submitted
  const isReviewerReSubmitted =
    !!reviewerUserId &&
    userSession?.user?.id === reviewerUserId &&
    isUnderReview &&
    formSubmissionStatus === "Re-Submitted";

  // Determine the action label text shown above the button
  const reviewActionLabel = isReviewerReSubmitted
    ? "Click the button below to review the resubmitted response on rejected questions."
    : isParentCompanyDeclined
    ? "Click the button below to view reviewer feedback on declined questions."
    : isReviewerUnderReview
    ? "Click the button below to review the questionnaire."
    : null;

  // button visibility per requirements:
  // - AI eligible + first visit => show Upload, Start (only if docs exist), Start Manually
  // - AI eligible + subsequent visit => show Prev + Resume
  // - Not AI eligible:
  //    * first visit => Prev + Let's Begin
  //    * subsequent visit => Prev + Resume
  
  // OPS-to-IQ is enabled when metadata's allowedAICuration explicitly contains it.
  const isOPSToIQEnabled = hasOPSToIQInMetadata;
  
  // Users are eligible for the AI flow if:
  // 1. They have AI capabilities (DocumentCuration/WebCuration), OR
  // 2. They have OPS-to-IQ explicitly enabled (even without AI subscription)
  const isAIFlowEligible = isAIUser || isOPSToIQEnabled;
  
  const isFirstVisit = !hasExistingCurationOrProcessing; // no rows => first time

  // Decide Prev/Resume visibility:
  // - non-AI users: always show Prev + begin/resume
  // - AI users: show Prev+Resume when it's NOT first visit OR form invitation already started/processing
  const showPrevResumeButtons = !isAIFlowEligible
    ? true
    : !isFirstVisit ||
      invitationStatus === FormInvitationStatus.Draft ||
      invitationStatus === (FormInvitationStatus as any).Processing;

  // label: "Resume" when this is actually a resumed flow (second visit or started/processing), otherwise "Let’s Begin"
  const isSecondVisitOrStarted =
    !isFirstVisit ||
    invitationStatus === FormInvitationStatus.Draft ||
    invitationStatus === (FormInvitationStatus as any).Processing;

  // Non-AI user with no curation configured or triggered = no flow started at all → show "Start"
  const isNoFlowConfigured = !hasAllowedAICuration && !hastriggeredAICuration;

  const resumeLabel = invitationStatus === FormInvitationStatus.Invited
    ? isSelf || isNoFlowConfigured
      ? "Start"
      : "Let’s Begin"
    : isSecondVisitOrStarted
    ? "Resume"
    : isSelf || isNoFlowConfigured
    ? "Start"
    : "Let’s Begin";

  // Upload button: Only show for users with DocumentCuration capability
  // (Not for OPS-only users or Web-only users)
  const showUploadButton =
    hasDocumentCurationInMetadata &&
    hasAllowedAICuration &&
    isFirstVisit &&
    invitationStatus !== FormInvitationStatus.Draft &&
    invitationStatus !== (FormInvitationStatus as any).Processing;
  /**
   * Show "Start" button when user has ANY of these capabilities:
   * 1. DocumentCuration + uploaded documents (AI users)
   * 2. WebCuration (AI users)
   * 3. OPSToIQCuration (both AI and non-AI users, OPT-IN only - explicitly enabled via GlobalMaster)
   * 
   * IMPORTANT: All capabilities are OPT-IN - must be explicitly configured.
   * If FormInvitation has no allowedAICuration configured, button won't show.
   */
  const showStartWithAIButton =
    hasAllowedAICuration &&
    isFirstVisit &&
    invitationStatus !== FormInvitationStatus.Draft &&
    invitationStatus !== (FormInvitationStatus as any).Processing &&
    (
      // DocumentCuration: show button regardless of uploaded documents;
      // the curation handler checks doc count and skips curation if none exist
      hasDocumentCurationInMetadata ||
      // WebCuration: no documents needed
      hasWebCurationInMetadata ||
      // OPSToIQCuration enabled
      isOPSToIQEnabled
    );

  const showStartManuallyButton =
    isAIFlowEligible &&
    isFirstVisit &&
    hasAllowedAICuration &&
    invitationStatus !== FormInvitationStatus.Draft &&
    invitationStatus !== (FormInvitationStatus as any).Processing;

  const disableStartButton = isReviewer
    ? false
    : isApproved || (isSubmitted && userSession?.user?.role !== "Approver");

  // Show Upload Document button for non-AI users when status is Invited
  const showUploadDocumentForNonAI = invitationStatus === FormInvitationStatus.Invited;

  const startHandler = async (toPopup: boolean, docWithAI: boolean) => {
    // If already approved then return;
    let latestAnsweredData = await latestAnsweredQuestionIdQuery({
      variables: { invitationId },
    });

    //POC dataflow

    if (
      [
        "5fcc28b9-bd53-4782-8768-146de9d25691",
        "604342a9-7630-4518-ab88-0bb565038e26",
      ].includes(userSession?.company?.id || "")
    ) {
      try {
        await axios.post("/api/v1/data-flow-iq", {
          invitationId,
        });
      } catch (error) {
        console.error("data-flow-iq", { error });
      }
    }
    let latestassingedData = await latestAssignedQuestionIdQuery({
      variables: { invitationId, userId: userSession?.user?.id },
    });
    let latestassignedquestionlist =
      latestassingedData?.data?.AssesseeUserMapping;

    if (isApproved) return alert("Already approved");

    //if (isStarted && !formSubmission) return alert("Started, no details found");

    if (!isReviewer && isSubmitted && !isDeclined) {
      // Only approver can start submitted invitation
      if (userSession?.user?.role !== "Approver")
        return alert("Already submitted");
    }

    if (!toPopup) {
      // If no submission details then create submission
      if (!formSubmission || isInvited) {
        const newSubmission = await startNewSubmissionMutation({
          variables: { invitationId },
        });

        //new form submission if not created at time of invite
        if (!formSubmission) {
          const newformSubmission = await createNewSubmissionMutation({
            variables: { invitationId },
          });
          //new form submission if not created at time of invite
          // const isSuccess = !!newSubmission.data?.insert_FormSubmission_one;
          // if (!isSuccess) return alert("Failed to start");
        }
      }
    }
    if (
      (userSession?.user?.role === AppRoles.Invitee ||
        userSession?.user?.role === AppRoles.Responder) &&
      latestassignedquestionlist !== undefined &&
      latestassignedquestionlist.length > 0
    ) {
      latestAnsweredQuestionId = latestassignedquestionlist[0]?.questionId;
    } else {
      if (!!latestAnsweredData) {
        if (
          !!latestAnsweredData?.data?.FormSubmission &&
          latestAnsweredData?.data?.FormSubmission.filter(
            (dataItems) => dataItems.Answers.length > 0,
          ).length > 0
        ) {
          latestAnsweredQuestionId =
            latestAnsweredData?.data?.FormSubmission.filter(
              (dataItems) => dataItems.Answers.length > 0,
            )[0]?.Answers[0]?.questionId;
        }
      }
    }

    if (isEmbeded) {
      // Check uploaded DocumentLogs for the company and, when present, show the unprocessed-document popup.
      const companyId = userSession?.company?.id ?? "";
      const userId = userSession?.user?.id ?? "";
      let isUnProcessDocument = false;
      const existingMetadata =
        formIntroQueryResult?.data?.FormInvitation?.[0]?.metadata ?? {};
      const existingAIData = existingMetadata?.AIData ?? {};
      if (isAIUser) {
        const documentLogsCount =
          companyId === documentLogsCache?.companyId
            ? documentLogsCache.count
            : await fetchDocumentLogsCount(companyId);

        // If has triggeredCuration, set isUnProcessDocument to false
        if (existingAIData?.triggeredCuration?.length > 0) {
          isUnProcessDocument = false;
        }
        // If no triggeredCuration but has document logs, set isUnProcessDocument to true
        else if (
          !existingAIData?.triggeredCuration?.length &&
          documentLogsCount > 0
        ) {
          isUnProcessDocument = true;
        }
        // If no triggeredCuration and no document logs, set isUnProcessDocument to false
        else {
          isUnProcessDocument = false;
        }
      }
      const formId =
        !!formIntroQueryResult?.data &&
        formIntroQueryResult?.data?.FormInvitation.length > 0
          ? formIntroQueryResult?.data?.FormInvitation[0]?.formId
          : "";
      const formType =
        !!formIntroQueryResult?.data &&
        formIntroQueryResult?.data?.FormInvitation.length > 0
          ? formIntroQueryResult?.data?.FormInvitation[0]?.Form?.formtype
          : "";
      const AIData = formInvitationAIData;

      if (!!isCarryForwarded) {
        if (
          userSession?.user?.role === AppRoles.Responder &&
          AssesseeUserMappingResult.length > 0
        ) {
          firstQuestion = latestAnsweredQuestionId;
        }
        setLocalStorageData(
          window.localStorage,
          "IsPageRefreshed",
          firstQuestion || "null",
        );
        postParentMessage(
          invitationFormStartMessage(
            isUnProcessDocument,
            documentLogsCount,
            invitationId,
            firstQuestion,
            toPopup,
            docWithAI,
            isStarted,
            AIData,
            formId,
            companyId,
            userId,
            formType ?? "",
            accessToken as string,
          ),
        );
      } else {
        if (userSession?.user?.role === AppRoles.Responder) {
          latestAnsweredQuestionId = "null";
        }
        setLocalStorageData(
          window.localStorage,
          "IsPageRefreshed",
          !!latestAnsweredQuestionId ? latestAnsweredQuestionId : "null",
        );

        postParentMessage(
          invitationFormStartMessage(
            isUnProcessDocument,
            documentLogsCount,
            invitationId,
            latestAnsweredQuestionId,
            toPopup,
            docWithAI,
            isStarted,
            AIData,
            formId,
            companyId,
            userId,
            formType ?? "",
            accessToken as string,
          ),
        );
      }
    } // else navigate to start form page
    else {
      router.push(`/form/invitation/${invitationId}/start`);
    }
  };

  const reviewHandler = async (toPopup: boolean, docWithAI: boolean) => {
    // Get latest answered question for review mode
    let latestAnsweredData = await latestAnsweredQuestionIdQuery({
      variables: { invitationId },
    });

    let latestassingedData = await latestAssignedQuestionIdQuery({
      variables: { invitationId, userId: userSession?.user?.id },
    });
    let latestassignedquestionlist =
      latestassingedData?.data?.AssesseeUserMapping;

    if (
      (userSession?.user?.role === AppRoles.Invitee ||
        userSession?.user?.role === AppRoles.Responder) &&
      latestassignedquestionlist !== undefined &&
      latestassignedquestionlist.length > 0
    ) {
      latestAnsweredQuestionId = latestassignedquestionlist[0]?.questionId;
    } else {
      if (!!latestAnsweredData) {
        if (
          !!latestAnsweredData?.data?.FormSubmission &&
          latestAnsweredData?.data?.FormSubmission.filter(
            (dataItems) => dataItems.Answers.length > 0,
          ).length > 0
        ) {
          latestAnsweredQuestionId =
            latestAnsweredData?.data?.FormSubmission.filter(
              (dataItems) => dataItems.Answers.length > 0,
            )[0]?.Answers[0]?.questionId;
        }
      }
    }

    // Reviewer: re-submitted case → jump to first re-submitted/declined question; otherwise start from first question
    if (isReviewer) {
      const firstDeclinedData = await getFirstDeclinedQuestionIdQuery({
        variables: { invitationId },
      });
      const firstResubmittedQuestionId =
        firstDeclinedData?.data?.ReviewerDetailsMappingResubmitted?.[0]?.questionId;
      const firstDeclinedQuestionId =
        firstDeclinedData?.data?.ReviewerDetailsMappingDeclined?.[0]?.questionId;
      latestAnsweredQuestionId = firstResubmittedQuestionId || firstQuestion;
    }

    if (isEmbeded) {
      const companyId = userSession?.company?.id ?? "";
      const userId = userSession?.user?.id ?? "";
      let isUnProcessDocument = false;
      const existingMetadata =
        formIntroQueryResult?.data?.FormInvitation?.[0]?.metadata ?? {};
      const existingAIData = existingMetadata?.AIData ?? {};
      
      if (isAIUser) {
        const documentLogsCount =
          companyId === documentLogsCache?.companyId
            ? documentLogsCache.count
            : await fetchDocumentLogsCount(companyId);

        if (existingAIData?.triggeredCuration?.length > 0) {
          isUnProcessDocument = false;
        } else if (
          !existingAIData?.triggeredCuration?.length &&
          documentLogsCount > 0
        ) {
          isUnProcessDocument = true;
        } else {
          isUnProcessDocument = false;
        }
      }
      
      const formId =
        !!formIntroQueryResult?.data &&
        formIntroQueryResult?.data?.FormInvitation.length > 0
          ? formIntroQueryResult?.data?.FormInvitation[0]?.formId
          : "";
      const formType =
        !!formIntroQueryResult?.data &&
        formIntroQueryResult?.data?.FormInvitation.length > 0
          ? formIntroQueryResult?.data?.FormInvitation[0]?.Form?.formtype
          : "";
      const AIData = formInvitationAIData;

      if (!!isCarryForwarded) {
        if (
          userSession?.user?.role === AppRoles.Responder &&
          AssesseeUserMappingResult.length > 0
        ) {
          firstQuestion = latestAnsweredQuestionId;
        }
        setLocalStorageData(
          window.localStorage,
          "IsPageRefreshed",
          latestAnsweredQuestionId || "null",
        );
        postParentMessage(
          invitationFormReviewMessage(
            isUnProcessDocument,
            documentLogsCount,
            invitationId,
            latestAnsweredQuestionId,
            toPopup,
            docWithAI,
            isUnderReview,
            AIData,
            formId,
            companyId,
            userId,
            formType ?? "",
            accessToken as string,
          ),
        );
      } else {
        if (userSession?.user?.role === AppRoles.Responder) {
          latestAnsweredQuestionId = "null";
        }
        setLocalStorageData(
          window.localStorage,
          "IsPageRefreshed",
          !!latestAnsweredQuestionId ? latestAnsweredQuestionId : "null",
        );

        postParentMessage(
          invitationFormReviewMessage(
            isUnProcessDocument,
            documentLogsCount,
            invitationId,
            latestAnsweredQuestionId,
            toPopup,
            docWithAI,
            isUnderReview,
            AIData,
            formId,
            companyId,
            userId,
            formType ?? "",
            accessToken as string,
          ),
        );
      }
    } else {
      router.push(`/form/invitation/${invitationId}/${FormMode.Review}`);
    }
  };

  const viewHandler = async (toPopup: boolean, docWithAI: boolean) => {
    const AssessmentFormName = formIntroQueryResult.data?.FormInvitation[0]?.Form?.name ?? "";
    const ComapnyName = formIntroQueryResult.data?.FormInvitation[0]?.Company?.name ?? "";
    const invitationStatus = formIntroQueryResult.data?.FormInvitation[0]?.status ?? "";
    const AIBulkDocumentProcessings = webCurationAndBulkProcessingQuery?.data?.AIBulkDocumentProcessing ?? [];
    const Sources = (formIntroQueryResult.data?.FormInvitation[0] as any)?.Sources ?? [];
    const formId = formIntroQueryResult.data?.FormInvitation[0]?.formId ?? "";
    
    // Construct AIStatus from metadata flags (set at component level)
    const AIStatus: InvitationAIStatus = {
      docWithAI: hasDocumentCurationInMetadata && hasWebCurationInMetadata,
      onlyDoc: hasDocumentCurationInMetadata && !hasWebCurationInMetadata,
    };
    if (isMaker) {
      const firstDeclinedData = await getFirstDeclinedQuestionIdQuery({
        variables: { invitationId },
      });
      const firstDeclinedQuestionId =
        firstDeclinedData?.data?.ReviewerDetailsMappingDeclined?.[0]?.questionId;
      if (firstDeclinedQuestionId) {
        latestAnsweredQuestionId = firstDeclinedQuestionId;
      }
    }else if(!!isResponderUser){
      // Question IDs assigned to this specific responder
      const assignedQuestionIds: string[] = (AssesseeUserMappingResult ?? [])
        .filter((x: any) => x.userId === userSession?.user?.id)
        .map((x: any) => x.questionId);

      // Fetch fresh data (network-only) so Question.key values are current for correct form-order sorting
      const freshViewData = await fetchInvitationStatusCounts({
        variables: { invitationId },
        fetchPolicy: "network-only",
      });
      const allMappings: any[] =
        (freshViewData.data?.FormInvitation?.[0] as any)?.ReviewerDetailsMappings ?? [];

      // First declined question among this responder's assigned questions (DB is pre-sorted by Question.key asc)
      const firstDeclinedQuestionId = allMappings
        .filter((m: any) => assignedQuestionIds.includes(m.questionId) && m.currentStatus === "Declined")[0]?.questionId;

      // Declined → first declined assigned question; otherwise → first section's first question
      latestAnsweredQuestionId = firstDeclinedQuestionId || firstQuestion;
    }

    postParentMessage(
      viewInvitationMessageForMaker(
        invitationId as string,
        AssessmentFormName,
        ComapnyName,
        AIStatus,
        invitationStatus as string,
        AIBulkDocumentProcessings as any,
        Sources as any,
        latestAnsweredQuestionId
      ),
    );
  };

  // new helper: run configured AI curation flows, update metadata & status, then redirect parent
  const executeAICurationFlows = async (params: {
    invitationId: string;
    formId: string;
    AIData: any;
    opsData?: { opsCompanyId?: string | null; opsCompanyName?: string | null } | null;
  }) => {
    const { invitationId, formId, AIData, opsData } = params;
    try {
      const allowed =
        AIData?.allowedAICuration ??
        AIData?.allowedCuration ??
        ([] as string[]);

      // For WebCuration, only check permission
      const shouldWebCuration = allowed.includes("WebCuration");

      // For OPSToIQCuration, check permission (OPT-IN via GlobalMaster, encoded in JWT at signin)
      const shouldOPSToIQCuration = allowed.includes("OPSToIQCuration");

      // For DocumentCuration, check both permission AND document existence
      let shouldDocumentCuration = false;
      if (allowed.includes("DocumentCuration")) {
        const companyId = userSession?.company?.id ?? "";
        const documentCount =
          companyId === documentLogsCache?.companyId
            ? documentLogsCache.count
            : await fetchDocumentLogsCount(companyId);

        shouldDocumentCuration = documentCount > 0;

        if (documentCount === 0) {
          console.log(
            `Skipping DocumentCuration for invitation ${invitationId}: No documents found for company ${companyId}`,
          );
        }
      }

      const tasks: Promise<any>[] = [];

      if (shouldDocumentCuration) {
        tasks.push(
          callUploadDocumentIngestingAPI({
            form_invitation_id: invitationId,
            company_id: userSession?.company?.id,
          }),
        );
      }

      if (shouldWebCuration) {
        const formInvitationData = {
          form_invitation_id: invitationId,
          form_id: formId,
          company_id: userSession?.company?.id ?? "",
          created_by: userSession?.user?.id ?? "",
        };
        tasks.push(callAIAPI(formInvitationData));
      }

      // OPS-to-IQ Curation Flow (Plug-and-Play)
      if (shouldOPSToIQCuration) {
        const submissionId =
          invitationAndSubmissionQueryResult?.data?.FormInvitation?.[0]
            ?.FormSubmissions?.[0]?.id;

        if (submissionId) {
          const opsToIQPayload = {
            form_invitation_id: invitationId,
            form_id: formId,
            iq_company_id: userSession?.company?.id ?? "",
            ops_company_id: opsData?.opsCompanyId ?? "",
            ops_company_name: opsData?.opsCompanyName ?? "",
            submission_id: submissionId,
            created_by: userSession?.user?.id ?? "",
          };

          console.log(
            "[FormIntroScreen] Triggering OPS-to-IQ curation:",
            opsToIQPayload,
          );

          tasks.push(
            callUploadDocumentIngestingAPI(
              opsToIQPayload,
              "opsToIQCuration",
            ),
          );
        } else {
          console.warn(
            "[FormIntroScreen] OPS-to-IQ curation skipped: no submission ID found for invitation",
            invitationId,
          );
        }
      }

      if (!tasks.length) return;

      // Write triggeredCuration BEFORE firing AI tasks so the DB is already updated
      // by the time the AI service completes and calls document-processing-completed.
      // This eliminates the race condition where calculateAndCacheAIDataStatistics
      // reads metadata before triggeredCuration is written and then overwrites it.
      const existingMetadata =
        formIntroQueryResult?.data?.FormInvitation?.[0]?.metadata ?? {};
      const existingAIData = existingMetadata?.AIData ?? {};
      const triggered: string[] = [];
      if (shouldDocumentCuration) triggered.push("DocumentCuration");
      if (shouldWebCuration) triggered.push("WebCuration");
      if (shouldOPSToIQCuration) triggered.push("OPSToIQCuration");

      const newAIData = {
        ...existingAIData,
        allowedAICuration:
          existingAIData?.allowedAICuration ??
          existingAIData?.allowedCuration ??
          [],
        triggeredCuration: triggered,
      };

      const updatedMetadata = {
        ...existingMetadata,
        AIData: newAIData,
      };

      console.log("[AI][meta] writing triggeredCuration:", triggered, "| inv:", invitationId, "UpdatedMetadata:", JSON.stringify(updatedMetadata));
      // persist status + metadata BEFORE tasks are awaited
      try {
        await updateFormInvitation({
          variables: {
            invitationId,
            set: {
              status: FormInvitationStatus.Processing as unknown as string,
              metadata: updatedMetadata,
            },
          },
        });
        console.log("[AI][meta] triggeredCuration written OK");
      } catch (err) {
        console.warn("[AI][meta] triggeredCuration write FAILED:", err);
      }

      const results = await Promise.allSettled(tasks);
      results.forEach((r, i) => {
        if (r.status === "rejected") {
          console.warn(`AI task[${i}] failed:`, r.reason);
      }
      });

      // notify parent to redirect to document processing
      postParentMessage(redirectToDocumentProcessing(invitationId));
    } catch (err) {
      console.error("executeAICurationFlows error:", err);
    }
  };

  const handleOnClickStartWithAI = async () => {
    try {
      // Check for expired documents before starting AI processing
      const companyId = userSession?.company?.id;
      let hasExpiredDocuments = false;
      // Get company metadata from the dedicated company query
      const companyMetadata = formIntroQueryResult.data?.FormInvitation?.[0]
        ?.Company?.metadata as CompanyMetadata;
      const isDocumentValidityCheckEnabled =
        companyMetadata?.isDocumentValidityCheckEnabled ?? false;

      if (companyId && isDocumentValidityCheckEnabled) {
        hasExpiredDocuments = await checkForExpiredDocuments(companyId);
      }

      if (hasExpiredDocuments && isDocumentValidityCheckEnabled) {
        const formType =
          !!formIntroQueryResult?.data &&
          formIntroQueryResult?.data?.FormInvitation.length > 0
            ? formIntroQueryResult?.data?.FormInvitation[0]?.Form?.formtype
            : "";

        const formId =
          !!formIntroQueryResult?.data &&
          formIntroQueryResult?.data?.FormInvitation.length > 0
            ? formIntroQueryResult?.data?.FormInvitation[0]?.formId
            : "";

        const AIData = formInvitationAIData;
        const userId = userSession?.user?.id ?? "";

        postParentMessage(
          hasExpiredDocumentsPopup(
            hasExpiredDocuments,
            formType ?? "",
            invitationId,
            formId,
            AIData,
            companyId ?? "",
            userId,
          ),
        );
      } else {
        const formId =
          !!formIntroQueryResult?.data &&
          formIntroQueryResult?.data?.FormInvitation.length > 0
            ? formIntroQueryResult?.data?.FormInvitation[0]?.formId
            : "";

        const AIData = formInvitationAIData;
        const opsData = formIntroQueryResult?.data?.FormInvitation[0]?.metadata?.opsData ?? null;
        // delegate to helper which runs selected AI flows, updates metadata/status and redirects
        await executeAICurationFlows({ invitationId, formId, AIData, opsData });
      }
    } catch (err) {
      console.error("handleOnClickStartWithAI error:", err);
    }
  };

  const PrevBtnHandler = async () => {
    let formType: any;
    formType =
      !!formIntroQueryResult?.data &&
      formIntroQueryResult?.data?.FormInvitation.length > 0
        ? formIntroQueryResult?.data?.FormInvitation[0]?.Form?.formtype
        : "";
    postParentMessage(prevListingPageredirect(formType));
  };

  const focusArea: Array<String> =
    formDetails?.focusArea !== undefined &&
    formDetails?.focusArea !== null &&
    formDetails?.focusArea !== ""
      ? formDetails?.focusArea.map((focusOn: any, index: number) => {
          // debugger;
          return Object.keys(focusOn)[0];
        })
      : "";

  const focusAreaDetails: any = formDetails?.focusArea
    ?.filter((item: { [s: string]: unknown } | ArrayLike<unknown>) => {
      const values = Object.values(item);
      return values.length > 0 && values[0] !== undefined;
    })
    ?.map((item: {}) => Object.keys(item)[0]);

  const showViewMoreLess =
    formDetails &&
    formDetails.bodyTemplate &&
    formDetails.bodyTemplate.length >= 410;

  let Focus_Area_Hide = formDetails?.focusAreahide[0]?.formId.includes(
    formDetails?.formId,
  );

  const bodyTemplatedata =
    isResponderUser !== undefined && isResponderUser == true
      ? formDetails?.bodyTemplate?.substring(
          0,
          formDetails?.notes?.contextCharCount,
        )
      : formDetails?.bodyTemplate;

  const renderStatValue = (item: InfoData) => {
    const key = item.label.toLocaleLowerCase();

    // Check if any processing has been triggered
    const isProcessingTriggered =
      formInvitationAIData?.triggeredCuration?.length > 0;

    // If no processing is triggered and value is 0, show "No Data Available"
    if (!isProcessingTriggered && item.value === 0) {
      return (
        <Text c="#999999" fz="16px" lh="18px" fw={300}>
          No Data Available
        </Text>
      );
    }

    // If processing is triggered OR value is not 0, show actual values
    if (key === "total time saved") {
      return String(item.value) + AIcardData.timeSavedUnit;
    }
    return item.value;
  };
  return (
    <Container
      p={isMobile ? 10 : 5}
      fluid
      className="AssessmentIntroDetails-overveiw"
    >
      <h1 className="heading">overview</h1>
      <Grid m={0} className={classes.intro}>
        <Grid.Col md={6} className="assign-intor-left">
          <Stack spacing={0} className="AssessmentIntroDetails-inner">
            <Group
              grow
              // position="apart"
              // style={{
              //   display: "flex",
              //   justifyContent: "flex-start",
              //   alignItems: "flex-start",
              // }}
              className={
                isResponderUser !== undefined && isResponderUser == true
                  ? ""
                  : "overview-section"
              }
            >
              <Grid columns={9} m="0" gutter="sm">
                {isResponderUser !== undefined && isResponderUser == true ? (
                  ""
                ) : Focus_Area_Hide === false ? (
                  formDetails?.focusArea !== undefined &&
                  formDetails?.focusArea !== null &&
                  formDetails?.focusArea !== "" ? (
                    <Grid.Col span="auto" className={classes.algnitmtop}>
                      <Card className={classes.frameworkcard}>
                        <Text
                          className={`${classes.label} heding-txt`}
                          c="#333333"
                          fz={12}
                          lh="18px"
                          fw={600}
                          mb={10}
                        >
                          Focus Areas
                        </Text>
                        <Group spacing="sm" fz={16} lh="18px" fw={600}>
                          {focusAreaDetails?.map(
                            (focusOn: any, index: number) => (
                              <>
                                <span className={`f-area ${focusOn}`}>
                                  {focusOn}
                                </span>
                              </>
                            ),
                          )}
                        </Group>
                      </Card>
                    </Grid.Col>
                  ) : (
                    // <Grid.Col md={6} className={classes.algnitmtop}></Grid.Col>
                    ""
                  )
                ) : (
                  // <Grid.Col md={6} className={classes.algnitmtop}></Grid.Col>
                  ""
                )}
                {isResponderUser !== undefined && isResponderUser == true ? (
                  ""
                ) : (
                  <Grid.Col span={2} className={classes.algnitmtop}>
                    <Card
                      className={classes.frameworkcard}
                      // style={{ textAlign: "center" }}
                    >
                      <Text
                        className={`${classes.label} heding-txt`}
                        c="#333333"
                        fz={12}
                        lh="18px"
                        fw={600}
                        mb={10}
                        // style={
                        //   formDetails?.focusArea
                        //     ? { textAlign: "center" }
                        //     : { textAlign: "left" }
                        // }
                      >
                        Total
                        <br />
                        Questions
                      </Text>
                      <Text
                        size="md"
                        className={classes.heading}
                        fz={12}
                        lh="18px"
                        fw={600}
                      >
                        <Text
                          className={classes.label}
                          mb={0}
                          variant="text"
                          fz={16}
                          lh="18px"
                          fw={300}
                          style={
                            formDetails?.focusArea
                              ? { width: "100%" }
                              : { width: "82px" }
                          }
                        >
                          {reviewSummaryCounts.totalQuestions}
                        </Text>
                      </Text>
                    </Card>
                  </Grid.Col>
                )}

                {/* {formDetails?.framework !== "BRSR Questionnaire" ? (
                <Grid.Col md={3} className={classes.algnitmtop}>
                  <Card className={classes.frameworkcard}>
                    <Text
                      className={classes.label}
                      c="#333333"
                      fz={12}
                      lh="18px"
                      fw={600}
                      mb={10}
                    >
                      Focus Area
                    </Text>
                    <Group spacing="sm" fz={16} lh="18px" fw={600}>
                      {
                        <Tooltip.Floating
                          position="top"
                          label={focusArea.toString()}
                        >
                          <Text
                            size="md"
                            className={classes.heading}
                            fz={16}
                            lh="18px"
                            fw={600}
                          >
                            {focusArea.toString()}
                          </Text>
                        </Tooltip.Floating>
                      }
                    </Group>
                  </Card>
                </Grid.Col>
              ) : (
                ""
              )} */}
                {/* <Grid.Col md={4}>
              <Card className={classes.frameworkcard}>
                  <Text 
                     className={classes.label}
                     c="#333333"
                     fz={12}
                     lh="18px"
                     fw={600}
                  >Focus Area</Text>
                  <Text size="md" 
                    className={classes.heading} 
                    fz={16}
                    lh="18px"
                    fw={600}
                  >
                    Environment, Social
                  </Text>
                </Card>
              </Grid.Col> */}
                {isResponderUser !== undefined && isResponderUser == true ? (
                  ""
                ) : (
                  <Grid.Col span={2} className={classes.algnitmtop}>
                    <Card className={classes.frameworkcard}>
                      <Text
                        className={`${classes.label} heding-txt`}
                        c="#333333"
                        fz={12}
                        lh="18px"
                        fw={600}
                        mb={10}
                      >
                        Data Inputs
                        <br />
                        Required
                      </Text>
                      {aiDataLoading ? (
                        <Flex h={20} style={{ paddingLeft: "30px" }}>
                          <div
                            style={{
                              width: 16,
                              height: 16,
                              border: "2px solid #f3f3f3",
                              borderTop: "2px solid #3498db",
                              borderRadius: "50%",
                              animation: "spin 1s linear infinite",
                            }}
                          />{" "}
                          <style jsx>{`
                            @keyframes spin {
                              0% {
                                transform: rotate(0deg);
                              }
                              100% {
                                transform: rotate(360deg);
                              }
                            }
                          `}</style>
                        </Flex>
                      ) : (
                        <Text
                          className={classes.label}
                          mb={0}
                          variant="text"
                          fz={16}
                          lh="18px"
                          fw={300}
                          tt="lowercase"
                        >
                          {AIcardData?.totalInputsRequired}
                        </Text>
                      )}
                    </Card>
                  </Grid.Col>
                )}
                {(isResponderUser !== undefined && isResponderUser == true) ||
                isReviewer ? (
                  ""
                ) : (
                  <Grid.Col span={2} className={classes.algnitmtop}>
                    <Card className={classes.frameworkcard}>
                      <Text
                        className={`${classes.label} heding-txt`}
                        c="#333333"
                        fz={12}
                        lh="18px"
                        fw={600}
                        mb={10}
                      >
                        Estimated
                        <br />
                        Time
                      </Text>
                      {/* <Group spacing={1}> */}
                      {/* <ThemeIcon
                        className={classes.clockIcon}
                        size={28}
                        variant="light"
                        color="orange.5"
                      >
                        <ClockSvgIcon />
                      </ThemeIcon> */}
                      <Text
                        className={classes.label}
                        mb={0}
                        variant="text"
                        fz={16}
                        lh="18px"
                        fw={300}
                        tt="lowercase"
                      >
                        {!!formIntroQueryResult?.data?.FormInvitation &&
                        formIntroQueryResult?.data?.FormInvitation.length
                          ? calculateEstimatedTime(
                              Number(AIcardData?.totalInputsRequired),
                              commonValues.perInputTime,
                            )
                          : 0}
                      </Text>
                      {/* </Group> */}
                    </Card>
                  </Grid.Col>
                )}
              </Grid>
            </Group>

            <Stack
              style={{ position: "relative" }}
              spacing={13}
              className="View-more-box"
            >
              {/* Reviewer Badge Code */}
              {formInvitation?.reviewerDetails ? (
                <Text
                  bg="#C0EFEC"
                  c="#454545"
                  py={4}
                  px={15}
                  style={{ 
                    borderRadius: 20, 
                    width: "max-content",
                    ...(userSession?.user?.role === AppRoles.Responder && { marginTop: 15 })
                  }}
                >
                  <b>Reviewer: </b>
                  {formInvitation?.reviewerDetails?.name}
                </Text>
              ) : (
                ""
              )}

              {/* End Reviewer Badge Code */}
              <Box
                ref={introRef}
                className={
                  classes.formDetails + " " + isResponderUser !== undefined &&
                  isResponderUser === true
                    ? "isResponderUserhide"
                    : ""
                }
                style={{
                  height: introHeight,
                  overflow: "hidden",
                }}
                fz={12}
                lh="20px"
                fw={400}
                dangerouslySetInnerHTML={{
                  __html: bodyTemplatedata ?? "",
                }}
              ></Box>
              {/* {loading && <LoadingOverlay visible={true} overlayBlur={100} />} */}
              {loading && <Spinner visible={true} />}
              {isResponderUser !== undefined && isResponderUser == true ? (
                ""
              ) : showViewMoreLess ? (
                introHeight === defaultHeight + "px" ? (
                  <a onClick={viewMore} className={classes.viewmorelessbtn}>
                    Read more
                  </a>
                ) : (
                  <a onClick={viewLess} className={classes.viewmorelessbtn}>
                    Read less
                  </a>
                )
              ) : (
                ""
              )}
            </Stack>
            {(formDetails?.notes ?? "") !== "" && !isReviewer ? (
              <Stack
                spacing={13}
                align="flex-start"
                className="Accordion-theme"
              >
                <Accordion
                  className={classes.root}
                  variant="filled"
                  defaultValue="intro"
                  chevron={<IntroArrow color="#005C81" />}
                  value={openedItem}
                  onChange={(value) => setOpenedItem(value)}
                  disableChevronRotation
                >
                  <Accordion.Item
                    value={"intro"}
                    className={classes.nobordaccord}
                  >
                    <Accordion.Control className={classes.accordbtnstyle}>
                      <Group position="left" spacing={8}>
                        <IconAlertCircle size={18} stroke={2} color="#005C81" />
                        <Text
                          fz={12}
                          weight={400}
                          c="#005C81"
                          lh="15.22px"
                          className={classes.heading}
                        >
                          {formDetails?.notes?.title}
                        </Text>
                      </Group>
                    </Accordion.Control>
                    <Accordion.Panel pt={20} pr={10}>
                      <List size="sm" pl={12} pr={20}>
                        {formDetails?.notes?.points?.map((point: string) => (
                          <List.Item
                            className={classes.accordianContentList}
                            key={point}
                            color="#444444"
                          >
                            {point}
                          </List.Item>
                        ))}
                      </List>
                    </Accordion.Panel>
                  </Accordion.Item>
                </Accordion>
              </Stack>
            ) : (
              ""
            )}
            {(isAIUser || isOPSToIQEnabled) && hasAllowedAICuration && !isReviewer &&(
              <Card
                px="30px"
                py="15px"
                radius={10}
                style={{ overflow: "visible" }}
                my="sm"
                id="aiSummary"
              >
                {aiDataLoading ? (
                  <Flex justify="center" align="center" h={200}>
                    <Spinner visible={true} />
                  </Flex>
                ) : (
                  <Table horizontalSpacing={0} verticalSpacing={3}>
                    <tbody>
                      {datapointsStats
                        .filter((stat) => 
                          !isFormSubmitted || stat.label !== "Total Data Inputs Required"
                        )
                        .map((item, index) => (
                        <tr key={index}>
                          <>
                            <td>
                              <Flex align="center">
                                <InfoItem
                                  c="#333333"
                                  fz="12px"
                                  lh="34px"
                                  fw={600}
                                  lts="0.15em"
                                  tt="uppercase"
                                  label={item.label}
                                  info={item.info}
                                  infoIconTop="6px"
                                />
                                {!isFormSubmitted && item.mandatory ? (
                                  <Anchor
                                    c="#005C81"
                                    fz="11px"
                                    lh="13.95px"
                                    fw={400}
                                    tt="capitalize"
                                    underline={false}
                                    lts="0px"
                                    pl="26px"
                                  >
                                    (
                                    <Text component="span" weight={700}>
                                      {item.mandatory}{" "}
                                    </Text>
                                    Mandatory,{" "}
                                    <Text component="span" weight={700}>
                                      {item.optional}{" "}
                                    </Text>
                                    Optional)
                                  </Anchor>
                                ) : isFormSubmitted && item.optional && item.optional > 0 ? (
                                  <Anchor
                                    c="#005C81"
                                    fz="11px"
                                    lh="13.95px"
                                    fw={400}
                                    tt="capitalize"
                                    underline={false}
                                    lts="0px"
                                    pl="26px"
                                  >
                                    (
                                    <Text component="span" weight={700}>
                                      {item.optional}{" "}
                                    </Text>
                                    Optional)
                                  </Anchor>
                                ) : null}
                              </Flex>
                            </td>
                            <td style={{ textAlign: "right" }}>
                              <Text c="#333333" fz="16px" lh="18px" fw={300}>
                                {isFormSubmitted && item.optional && item.optional > 0 ? item.optional : renderStatValue(item)}
                              </Text>
                            </td>
                          </>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                )}
              </Card>
            )}
            {(isAIUser || isOPSToIQEnabled) &&
              hasAllowedAICuration &&
              !hastriggeredAICuration &&
              !isStarted && (
                <>
                  <p style={{ fontWeight: 400 }}>
                    We recommend uploading documents first. Our AI will provide
                    suggestions or pre-fill your responses by extracting data
                    from your documents in all AI-enabled reports and
                    assessments.
                  </p>
                </>
              )}
            {/* Review Summary – only visible when invitation is Under Review */}
            {showReviewSummary && (
              <>
                <Card mt={10}>
                  <Table horizontalSpacing={0} verticalSpacing={3}>
                    <tbody>
                      <tr>
                        <td style={{ borderBottom: "none !important" }}>
                          <Text
                            tt="uppercase"
                            c="#333333"
                            fw={600}
                            fz={12}
                            py={8}
                          >
                            Review Summary
                          </Text>
                        </td>
                        <td
                          style={{
                            textAlign: "right",
                            borderBottom: "none !important",
                          }}
                        />
                      </tr>
                      <tr>
                        <td>
                          <Text
                            tt="uppercase"
                            c="#22964C"
                            fw={600}
                            fz={12}
                            py={8}
                          >
                            Accepted Questions
                          </Text>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Text
                            tt="uppercase"
                            c="#22964C"
                            fw={400}
                            fz={12}
                            py={8}
                          >
                            {reviewSummaryCounts.accepted}
                          </Text>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Text
                            tt="uppercase"
                            c="#E7122B"
                            fw={600}
                            fz={12}
                            py={8}
                          >
                            Declined Questions
                          </Text>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Text
                            tt="uppercase"
                            c="#E7122B"
                            fw={400}
                            fz={12}
                            py={8}
                          >
                            {reviewSummaryCounts.declined}
                          </Text>
                        </td>
                      </tr>
                      <tr>
                        <td>
                          <Text
                            tt="uppercase"
                            c="#FFA93C"
                            fw={600}
                            fz={12}
                            py={8}
                          >
                            Pending for Approval Questions
                          </Text>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Text
                            tt="uppercase"
                            c="#FFA93C"
                            fw={400}
                            fz={12}
                            py={8}
                          >
                            {reviewSummaryCounts.pendingForApproval}
                          </Text>
                        </td>
                      </tr>
                       <tr>
                        <td>
                          <Text
                            tt="uppercase"
                            c="#038FC7"
                            fw={600}
                            fz={12}
                            py={8}
                          >
                            Questions Re-Submitted
                          </Text>
                        </td>
                        <td style={{ textAlign: "right" }}>
                          <Text
                            tt="uppercase"
                            c="#038FC7"
                            fw={400}
                            fz={12}
                            py={8}
                          >
                            {reviewSummaryCounts.reSubmitted}
                          </Text>
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </Card>
                
              </>
            )}
            {/* Role-based action label */}
            {reviewActionLabel && (
              <Text c="#454545" size={12} mt={20}>
                {reviewActionLabel}
              </Text>
            )}
            <Flex gap={24} align="center" wrap="wrap">
              {showPrevResumeButtons ? (
                <>
                  {/* Show Upload Document button for non-AI users when status is Invited */}
                  {showUploadDocumentForNonAI ? (
                    <Box>
                      <Button
                        color="outlineBtn"
                        my="md"
                        onClick={() => {
                          const formType =
                            !!formIntroQueryResult?.data &&
                            formIntroQueryResult?.data?.FormInvitation.length >
                              0
                              ? formIntroQueryResult?.data?.FormInvitation[0]
                                  ?.Form?.formtype
                              : "";
                          postParentMessage(
                            gotoDocumentRepository(formType ?? "", "single"),
                          );
                        }}
                      >
                        UPLOAD DOCUMENTS
                      </Button>
                    </Box>
                  ) : (
                    <Box>
                      <Button
                        color="outlineBtn"
                        leftIcon={
                          <IconChevronLeft size="18px"/>
                        }
                        my="md"
                        styles={{
                          leftIcon:{
                            marginRight:6,
                            marginLeft:-6
                          }
                        }}
                        onClick={PrevBtnHandler}
                      >
                        Prev
                      </Button>
                    </Box>
                  )}
                  {(isFormSubmitted === undefined || isFormSubmitted === false)?
                  <Box>
                    <Button
                      color={isAIUser ? "solidBtn" : "outlineBtn"}
                      rightIcon={isAIUser ? (
                        <IconChevronRight size="18px"/>
                      ) : undefined}
                      styles={{
                        rightIcon:{
                          marginRight:-6,
                          marginLeft:6
                        }
                      }}
                      my="md"
                      onClick={() => startHandler(false, false)}
                      disabled={disableStartButton}
                    >
                      {resumeLabel}
                    </Button>
                  </Box> :
                  <>
                  {isReviewer || isMaker ||(isFormSubmitted === true && userSession?.user?.role === AppRoles.Responder)? null:
                  <Box>
                    <Button
                      color={isAIUser ? "solidBtn" : "outlineBtn"}
                      rightIcon={isAIUser ? (
                        <IconChevronRight size="18px"/>
                      ) : undefined}
                      styles={{
                        rightIcon:{
                          marginRight:-6,
                          marginLeft:6
                        }
                      }}
                      my="md"
                      onClick={() => startHandler(false, false)}
                      disabled={disableStartButton}
                    >
                      {resumeLabel}
                    </Button>
                  </Box>
                  }
                  </>}
                </>
              ) : (
                <>
                  {(showUploadButton || showStartWithAIButton) && (
                    <Tooltip
                      multiline
                      withArrow
                      arrowSize={10}
                      label="Upload documents to your repository."
                      openDelay={50}
                      closeDelay={50}
                      withinPortal={false}
                    >
                      <div>
                        {isAIUser ? (
                          <AIUploadDocumentBtn
                            label="UPLOAD DOCUMENT"
                            onClick={() => {
                              const formType =
                                !!formIntroQueryResult?.data &&
                                formIntroQueryResult?.data?.FormInvitation
                                  .length > 0
                                  ? formIntroQueryResult?.data?.FormInvitation[0]
                                      ?.Form?.formtype
                                  : "";
                              postParentMessage(
                                gotoDocumentRepository(formType ?? "", "single"),
                              );
                            }}
                          />
                        ) : (
                          <Button
                            color="outlineBtn"
                            my="md"
                            onClick={() => {
                              const formType =
                                !!formIntroQueryResult?.data &&
                                formIntroQueryResult?.data?.FormInvitation
                                  .length > 0
                                  ? formIntroQueryResult?.data?.FormInvitation[0]
                                      ?.Form?.formtype
                                  : "";
                              postParentMessage(
                                gotoDocumentRepository(formType ?? "", "single"),
                              );
                            }}
                          >
                            UPLOAD DOCUMENT
                          </Button>
                        )}
                      </div>
                    </Tooltip>
                  )}

                  {showStartWithAIButton && (
                    <Tooltip
                      multiline
                      width={300}
                      withArrow
                      arrowSize={10}
                      label={hasOnlyOPSToIQCuration ? "Click 'Start' to process your activity data and generate pre-filled suggestions. Once complete, click again to start the questionnaire." : "Process uploaded documents and fetch web data to get AI-powered suggestions for your responses"}
                      openDelay={50}
                      closeDelay={50}
                    >
                      <div>
                        {isAIUser ? (
                          <AIUploadDocumentBtn
                            onClick={() => {
                              handleOnClickStartWithAI();
                            }}
                            label="Start"
                          />
                        ) : (
                          <Button
                            color="outlineBtn"
                            my="md"
                            disabled={disableStartButton}
                            onClick={() => {
                              handleOnClickStartWithAI();
                            }}
                          >
                            START
                          </Button>
                        )}
                      </div>
                    </Tooltip>
                  )}

                </>
              )}
              {/* Case 2: Parent Company – Submission Declined */}
              {isParentCompanyDeclined && (
                <Box>
                  <Button
                    color="outlineBtn"
                    my="md"
                    onClick={() => {
                      if (isEmbeded) {
                        viewHandler(false, false);
                      } else {
                        router.push(`/form/invitation/${invitationId}/${FormMode.Review}`);
                      }
                    }}
                  >
                    View Declined Questions
                  </Button>
                </Box>
              )}
              {/* Case 1 & 3: Reviewer – Review Response button */}
              {(isReviewer) && (
                <Box>
                  <Button
                    // rightIcon={
                    //   <IconChevronRight
                    //     size="1rem"
                    //     style={{ marginLeft: "-8px" }}
                    //   />
                    // }
                    color="outlineBtn"
                    my="md"
                    onClick={() => {
                      if (isEmbeded) {
                        reviewHandler(false, false);
                      } else {
                        router.push(`/form/invitation/${invitationId}/${FormMode.Review}`);
                      }
                    }}
                  >
                    Review Responses
                  </Button>
                </Box>
              )}
              
            </Flex>
          </Stack>
        </Grid.Col>
        <Grid.Col md={6}>
          <Stack justify="flex-end" className={classes.fullheightstack}>
            <IntroImage />
          </Stack>
          {/* <Image src="/images/intro-image.svg" alt="Warp Intro" /> */}
        </Grid.Col>
      </Grid>
    </Container>
  );
};

const useStyles = createStyles(
  (theme: any, { opened }: { opened: boolean }) => ({
    root: {
      background: "#fff",
      width: "100%",
      border: "none",
      borderRadius: "30px",
      padding: "0px",
    },
    nobordaccord: {
      border: "none",
      backgroundColor: "#fff !important",
      borderRadius: opened
        ? "35px 35px 10px 10px !important"
        : "35px !important",
    },
    accordbtnstyle: {
      background: "#dfeef6",
      borderRadius: "30px !important",
      padding: "0px 35px 0px 15px",
      height: "40px",
      "&:hover": {
        background: "#dfeef6",
      },
    },
    accordianContentList: {
      color: "#444444",
      margin: "0px 0 10px 0",
      fontSize: "12px !important",
      lineHeight: "20px !important",
      fontWeight: "normal",
    },
    intro: {
      color: theme.colors.gray[6],
      fontSize: theme.fontSizes.sm,
      fontWeight: 500,
      letterSpacing: "0.4px",
      alignItems: "flex-start",
      li: {
        fontSize: theme.fontSizes.md,
        fontWeight: 400,
        lineHeight: "1.3",
      },
    },
    algnitmtop: {
      padding: "0 !important",
    },
    frameworkcard: {
      padding: `5px 0 !important`,
      justifyContent: "space-between",
      textTransform: "uppercase",
    },
    label: {
      fontSize: theme.fontSizes.sm,
      color: "#666",
      "@media (max-width: 576px)": {
        marginBottom: "0px",
      },
    },
    heading: {
      color: "#666",
    },
    card: {
      backgroundColor: theme.colors.gray[1],
      border: "1px solid",
      borderColor: theme.colors.gray[3],
      "&:hover": {
        backgroundColor: theme.colors.gray[2],
      },
    },
    focusAreaIcons: {
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: " 30px",
      height: "30px",
      borderRadius: "5px",
      backgroundColor: "#e2e2e2",
      "&:empty": {
        display: "none",
      },
    },
    formDetails: {
      color: "#3b3b3b",
      fontSize: "14px",
    },
    clockIcon: {
      backgroundColor: "transparent",
    },
    fullheightstack: {
      height: "100%",
      alignItems: "center",
    },
    viewmorelessbtn: {
      color: "#FFA93C",
      cursor: "pointer",
    },
  }),
);

export default memo(
  FormIntroScreen,
  (prev, next) => prev.invitationId === next.invitationId,
);
