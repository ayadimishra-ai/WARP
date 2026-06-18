import {
  Accordion,
  ActionIcon,
  Anchor,
  Box,
  Button,
  Flex,
  Group,
  MantineTheme,
  Progress,
  Stack,
  Tabs,
  Text,
  Title,
  Tooltip,
  useMantineTheme
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useRouter } from "next/router";
import { MediaQuery } from "@/modules/warp/packages/client/compat/mantine-v8-compat";
import {
  IconChevronDown,
  IconChevronLeft,
  IconChevronRight,
  IconCircle,
  IconPlus,
  IconInfoCircle
} from "@tabler/icons-react";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { useBulkInsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-answer";
import { useBulkInsertInterimAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-intrim-answer";
import { useBulkUpdateInterimRecommendationByInterimAnswerIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-interim-recommendation";
import { useInsertRaraValidationAndRatingMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-rara-validation-and-rating";
import { useUpsertValidationWarningLogsMutation } from "@/modules/warp/packages/graphql/mutations/generated/Insert-validation-warning-logs";
import { useUpdateAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-answer";
import { useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-interim-answer-by-question-id-and-submission-id";
import { useUpsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/upsert-answer";
import { useUpsertFormInvitationCompletionMutation } from "@/modules/warp/packages/graphql/mutations/generated/upsert-form-invitation-completion-by-invitation-id";
import { useGetFormFieldsByQuestionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-fields-by-question-id";

import { useRaraCompanyAccessQuery } from "@/modules/warp/packages/graphql/queries/generated/get-rara-features-access-companyid";
import { useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-recomendation-by-submissionId-and-formfieldId";

// import { saveAs } from "file-saver";
import { useBulkUpdateSuggestionsMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-suggestions";
import { useUpdateAssesseeUserMappingbyInvitationIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-assessee-user-mapping-by-invitationid";
import { useUpdateAssesseeUserMappingForResponderMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-assessee-user-mapping-for-responder";
import { useUpdateAssesseeUserMappingResponderStatusByResponderMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-assesseeusermapping-responderstatus-byresponder";
import { useUpdateFormInvitationStatusMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-form-invitation-status";
import { useUpdateValidationWarningLogsMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-ValidationWarningLogs";
import { useGetAnswerByQuestionIdAndSubmissionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answer-by-questionid-and-submissionid";
import { useGetAnswersByIdsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answers-by-ids";
import { useGetassesseeuserbyinvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-assesseeuser-by-invitationid";
import { useGetformFieldsbySubmissionIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-formfield-by-submissionid";
import { useGetInvitationAndSubmissionDetailsByInvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-and-submission-details-by-invitation-id";
import { useGetQuestionListByInvitationIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-question-list-by-invitationId";
import {
  AppRoles,
  FormInvitationStatus,
  FormMode,
  QuestionStatus
} from "@/modules/warp/packages/shared/constants/app.constants";
import {
  getLocalStorageData,
  setLocalStorageData,
} from "@/modules/warp/packages/shared/utils/auth-session.util";
import { isFormAIEnabled } from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import InfoIcon from "@/modules/warp/public/images/InfoIcon";
import { useParams } from "next/navigation";
import { FC, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FormFieldRender } from "..";
import {
  invitationFormCancelMessage,
  invitationFormSubmitMessage,
  invitationFormValidationFailedMessage,
  prevListingPageredirect,
  prevNextClick,
  raraAlertPopup,
  saveClick,
  sendInvitationLoadingStartedMessage,
  sendInvitationValidationFailedMessage,
  warpApprovedSuccessfully,
  warpAssignQuestion,
  warpAssignReviewer,
  warpContentSize,
  warpDeclineAnswer,
  warpFormSubmitConfirmation,
  warpJustify,
  warpWarningmessage,
} from "../../../services/platform-window-message.service";
import {
  isAnswered,
  isUserAllowedAIFeature,
  setAnswersData,
  warninglogsave,
  flattenObjectValues
} from "../common-functions";
import { useGroupWizardStore } from "../group-wizard.store";
import { usePointerEvents } from "../hooks/usePointerEvents";
import { useRecommendationListStore } from "../recommendation.store";
import { useReviewerContext } from "../reviewer-context";
import {
  getAnswersByQuestionId,
  getFormFieldStoreState,
  selectFieldOptions,
  showErrorMessage,
  useFormFieldStore,
  useWarningMessageStore,
} from "../store";
import { GroupTabsPropsType, warningmessageObjectType } from "../types";
import QuestionBox from "./QuestionBox";
const isDevelopmentMode = process.env.NODE_ENV === "development";
useWarningMessageStore.getState();
const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

const useStyles = createStyles((theme) => ({
  activeTab: {
    backgroundColor: "#00216B",
    padding: "12px 16px",
    margin: "-10px -16px",
    height: "33px",
    "&:hover": {
      background: "#00216B",
      border: "0px solid #00216B",
    },
  },
  template2QuestionSuccess: {
    background: theme?.colors?.questionSucces?.[0],
    padding: "12px 16px",
    margin: "-10px -16px",
    height: "33px",
    "&:hover": {
      background: theme?.colors?.questionSucces?.[0],
      borderBottom: "3px solid " + theme.colors.teal[7],
      transition: "0.2s all",
    },
  },
  template2QuestionWarning: {
    background: theme?.colors?.questionWarning?.[0],
    padding: "12px 16px",
    margin: "-10px -16px",
    height: "33px",
    "&:hover": {
      background: theme?.colors?.questionWarning?.[0],
      borderBottom: "3px solid " + theme.colors.orange[5],
      transition: "0.2s all",
    },
  },
  jumpToSub: {
    width: "22px",
    height: "22px",
    borderRadius: "100%",
    background: "rgba(37, 209, 64, 0.7)",
    textAlign: "center",
    lineHeight: "22px",
    color: "#fff",
  },
  jumpToPartiallySub: {
    width: "22px",
    height: "22px",
    borderRadius: "100%",
    background: "#EBEBEB",
    textAlign: "center",
    lineHeight: "22px",
    color: "#B6B6B6",
  },
  jumpToActive: {
    width: "22px",
    height: "22px",
    borderRadius: "100%",
    background: "#FFA93C",
    textAlign: "center",
    lineHeight: "22px",
    color: "#fff",
  },
  noborderbottom: {
    borderBottom: "medium none !important",
  },
  paddingbottomno: {
    paddingBottom: "0 !important",
  },
  paddingtopbotno: {
    paddingBottom: "0 !important",
    paddingTop: "calc(0px / 2) !important",
  },
  breadcrumb: {
    minHeight: "48px",
    backgroundColor: "#162F4B",
    boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.1)",
    borderRadius: "5px",
    marginBottom: "20px",
    padding: "12px 0 12px 20px",
    lineHeight: "24px",
    fontSize: "16px",
  },
  colOrange: {
    color: "#FFA93C",
  },
  colWhite: {
    color: "#fff",
  },
  accordionItem: {
    "&:hover": {
      background: "linear-gradient(91.49deg, #005c81 6.27%, #122f47 93.39%)",
      color: "#fff",
    },
  },
  modalHeader: {
    background: "#EEFCFA",
    height: "68px",
    margin: "-20px -20px 0",
    padding: "10px 20px",
    fontWeight: "bold",
    borderTopLeftRadius: "20px",
    borderTopRightRadius: "20px",
    fontSize: "24px",
  },
  mainModal: {
    borderRadius: "20px",
  },
}));

const tabsStyles = (theme: MantineTheme) => ({
  tab: {
    color:
      theme.colors.gray[9],
    padding: "10px 16px",
    cursor: "pointer",
    fontSize: theme.fontSizes.xs,
    display: "flex",
    alignItems: "center",

    "&:disabled": {
      opacity: 0.5,
      cursor: "not-allowed",
    },

    "&[data-active]": {
      backgroundColor: "#00216B",
      color: theme.white,
      borderColor: "#00216B",
      border: "none",
      "&:hover": {
        background: "#00216B",
        borderColor: "#00216B",
        border: "none",
      },
    },
  },
});

type Question = {
  id: string;
  content: string;
  FormFields: {
    id: string;
    fieldOptions: { required: boolean };
  }[];
};

const GroupTabPanel = ({ tab, activeTab, questions }: { tab: any; activeTab: any; questions: any[] }) => {
  const pointerEventsStyle = usePointerEvents(tab.formField?.Question?.id);

  return (
    <MediaQuery
      query="(max-width: 1366px)"
      styles={{ minHeight: "280px !important" }}
      key={tab.formField?.id}
    >
      <Tabs.Panel
        key={tab.formField?.id}
        mih={350}
        value={tab.formField?.Question?.id}
        pt="xs"
      >
        <Box style={{ position: "relative" }}>
          <Group
            wrap="nowrap"
            gap={10}
            align="flex-start"
            style={pointerEventsStyle}
          >
            <Title
              fz={18}
              c="#162F4B"
              fw={600}
              w={34}
            >
              {
                questions?.filter(
                  (d: any) => d.questionId === activeTab,
                )[0]?.title
              }
            </Title>
            <Stack
              key={tab.formField?.Question?.id}
              style={{ flex: 1, minWidth: 0 }}
            >
              <FormFieldRender formField={tab.formField} />
            </Stack>
          </Group>
        </Box>
      </Tabs.Panel>
    </MediaQuery>
  );
};

const GroupTab: FC<GroupTabsPropsType> = ({
  formField,
  tabs,
  steps,
  hierarchyLevel,
}) => {
  const UpsertValidationWarningLogsMutation =
    useUpsertValidationWarningLogsMutation()[0];
  const getFormFieldsDetail = useGetFormFieldsByQuestionIdLazyQuery()[0];
  const getQuestionList = useGetQuestionListByInvitationIdLazyQuery()[0];
  const getFormfieldRecommendation =
    useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery()[0];
  const upsertAnswer = useUpsertAnswerMutation()[0];
  const upsertFormInvitationCompletion =
    useUpsertFormInvitationCompletionMutation()[0];
  const updateAnswer = useUpdateAnswerMutation()[0];
  const updateInterimAnswer =
    useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation()[0];
  const insertInterimAnsweronUpdate = useBulkInsertInterimAnswerMutation()[0];
  const insertBulkAnswer = useBulkInsertAnswerMutation()[0];
  const updateRecommendation =
    useBulkUpdateInterimRecommendationByInterimAnswerIdMutation()[0];
  const removeWarning = useWarningMessageStore(
    (store) => store.removeWarningRuleFields,
  );
  const IsPageRefreshed: any | null = getLocalStorageData(
    window.localStorage,
    "IsPageRefreshed",
  );
  const WarningData = useWarningMessageStore.getState().WarningRuleFields;
  let isHierarchyLevel = false;
  if (hierarchyLevel) {
    if (parseInt(hierarchyLevel) === 1) {
      isHierarchyLevel = true;
    }
  }
  if (isHierarchyLevel === false) {
    hierarchyLevel = "7";
  }
  const { query } = useRouter();
  const defaultQuestion = tabs.filter((x) => x.formField.type !== "sub-theme");
  const [getQuestionId, setQuestionId] = useState<string | null>();
  let questionId: any =
    getQuestionId ||
    IsPageRefreshed ||
    defaultQuestion[0]?.formField?.Question?.id;
  let invitationId: any = query?.invitationId || "";
  const theme = useMantineTheme();
  const { classes } = useStyles();
  const [activeTab, setActiveTab] = useState(questionId);
  // const [file, setFile] = useState<File | null>(null);
  // const [getUploadFile, setUploadFile] = useState(false);
  const nextHandler = useGroupWizardStore((store) => store.nextHandler);
  const prevHandler = useGroupWizardStore((store) => store.prevHandler);
  // const questionHandler = useGroupWizardStore((store) => store.questionHandler);
  const questions = useGroupWizardStore((store) => store.questions);
  const currentWizard = useGroupWizardStore((store) => store.current);

  //const brsrTemplateDataQuery = useGetGlobalMasterByBrsrTemplateLazyQuery()[0];
  //const { uploadFile } = useFromFileUpload();
  const sectionHandler = useGroupWizardStore((store) => store.sectionHandler);
  const [currentSec, setCurrentSec] = useState<string | null>();
  const [currentBreadCrumb, setCurrentBreadCrumb] = useState<string | null>();
  const [getaccordianBreadCrumb, setAccordianBreadCrumb] = useState<any>([]);
  const [requiredQuestions, setRequiredQuestions] = useState<any[]>([]);
  const chkStore = useFormFieldStore((store) => store);
  const updateQuestionStatuses = useGroupWizardStore(
    (store) => store.updateQuestionStatuses,
  );
  const changeColorHandler = useGroupWizardStore(
    (store) => store.changeColorHandler,
  );
  const [getInfoIconDetail, setInfoIconDetail] = useState<string | null>();
  const [isSaved, setIsSaved] = useState<boolean>(false);
  //const [opened, { open, close }] = useDisclosure(false);
  const nextRecommHandler = useRecommendationListStore(
    (store) => store.nextRecommHandler,
  );
  const prevRecommHandler = useRecommendationListStore(
    (store) => store.prevRecommHandler,
  );
  const questionRecommHandler = useGroupWizardStore(
    (store) => store.questionRecommHandler,
  );
  const questionrecomm: any = useRecommendationListStore(
    (store) => store.questions,
  );
  const questionsRecommForNext: any = useRecommendationListStore((store) =>
    store.hasdata(
      getFormFieldStoreState().formFields.find(
        (m: any) => m.Question?.id === currentWizard?.question,
      ),
      true,
    ),
  );
  const questionsRecommForPrev: any = useRecommendationListStore((store) =>
    store.hasdata(
      getFormFieldStoreState().formFields.find(
        (m: any) => m.Question?.id === currentWizard?.question,
      ),
      false,
    ),
  );

  const userSession = useUserSession();
  const hasUserAICapabilities = isUserAllowedAIFeature(
    userSession?.accessToken ?? "",
  );

  const hasAnyAICapabilities = isFormAIEnabled(
    userSession?.accessToken,
    useFormFieldStore?.getState()?.formId ?? undefined,
  );

  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );

  const {
    isReviewer,
    isMaker,
    isRefetching,
    reviewerStatusMap,
    onReviewerAccept,
    onReviewerDecline,
    onReviewerJustify,
    onReviewerBulkAccept,
    onRefetchInvitation,
  } = useReviewerContext();


  const statusEntry = useMemo(() => {
    const entry = reviewerStatusMap.get(activeTab || "");
    if (entry?.remark === "Answered by Maker") return undefined;
    return entry;
  }, [reviewerStatusMap, activeTab, isRefetching]);


  const raraCompanyId: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "RaraIntegrationAccess",
  );
  const { data: raraCompanies } = useRaraCompanyAccessQuery({
    variables: {
      companyIdList: raraCompanyId?.[0]?.data?.[0]?.companyId,
      companyId: userSession?.company?.id,
    },
  });
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });

  let FormHasRecommendation: any = recommendationNewResponce?.[0]?.data?.filter(
    (rec: any) => rec.FormId === formField?.formId,
  );

  const formInvitationStatusMutation =
    useUpdateFormInvitationStatusMutation()[0];

  const updateAssesseeUserMappingResponderStatusMutation =
    useUpdateAssesseeUserMappingResponderStatusByResponderMutation()[0];

  const updateAssesseeUserMappingMutation =
    useUpdateAssesseeUserMappingbyInvitationIdMutation()[0];

  const updateAssesseeUserMappingForResponderMutation =
    useUpdateAssesseeUserMappingForResponderMutation()[0];

  const UpdateValidationWarningLogsMutation =
    useUpdateValidationWarningLogsMutation()[0];
  const updateSuggestionData = useBulkUpdateSuggestionsMutation()[0];
  const WarningMessage = WarningData[0]?.isWarningRule;

  const AutoAppoverRecored: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "InviterFormAutoAppover",
  );

  // const { data: AutoAppoverRecored } =
  //   useGetGlobalMasterDataForInviterFormAutoAppoverQuery();

  // let wheredata: InvitationComment_Bool_Exp = {
  //   invitationId: { _eq: invitationId },
  //   isActive: { _eq: true },
  // };
  // const invitationCommentsListData = useGetinvitationcommentQuery({
  //   variables: {
  //     where: wheredata,
  //   },
  // });
  const { data: invitationAndSubmissionQueryResult } =
    useGetInvitationAndSubmissionDetailsByInvitationIdQuery({
      variables: {
        invitationId,
        includeAllSections: false,
      },
    });
  const { data: AssesseeUserMappingQueryResult } =
    useGetassesseeuserbyinvitationIdQuery({
      variables: {
        invitationId,
      },
    });

  const getAnswerByQuestionResult =
    useGetAnswerByQuestionIdAndSubmissionIdLazyQuery()[0];
  const getAnswersByIds = useGetAnswersByIdsLazyQuery()[0];

  const InternalCompanyData: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "InternalRequestCompany",
  );

  // const { data: InternalCompanyData } =
  //   useGetGlobalMasterByInternalRequestCompanyQuery();

  const chkCompanyId = InternalCompanyData?.length > 0 ? InternalCompanyData[0]?.data.filter(
    (a: any) => a.companyId === userSession?.company?.id,
  ) : [];

  const isExternalMaker = (invitationAndSubmissionQueryResult?.FormInvitation?.[0]?.companyId !== invitationAndSubmissionQueryResult?.FormInvitation?.[0]?.parentcompanyId && invitationAndSubmissionQueryResult?.FormInvitation?.[0]?.companyId === userSession?.company?.id) && useFormFieldStore.getState().isFormSubmitted === false && userSession?.user?.role !== AppRoles.Responder;
  // Message handler for reviewer actions (decline, justify, bulk accept)
  useEffect(() => {
    const handleMessage = async (event: MessageEvent) => {
      let message;
      if (typeof event.data === "string") {
        try {
          message = JSON.parse(event.data);
        } catch (e) {
          return;
        }
      } else {
        message = event.data;
      }

      if (!message || !message.type) return;

      try {
        if (
          message.type === "warp-DeclineAnswer" &&
          !message.data.isOpenedPopup
        ) {
          const remark = message.data.formDetails?.remark;
          const qId = message.data.formDetails?.questionId;
          if (remark && qId) {
            onReviewerDecline(qId, remark, true);
          }
        }
        if (message.type === "warp-Justify" && !message.data.isOpenedPopup) {
          const remark = message.data.formDetails?.remark;
          const qId = message.data.formDetails?.questionId;
          if (remark && qId) {
            // Save the answer first before updating review status
            await onReviewerJustify(qId, remark, true);
          }
        }
        if (
          message.type === "warp-approve-entire-report" &&
          message.response === true
        ) {
          try {
            postParentMessage(sendInvitationLoadingStartedMessage());

            const success = await onReviewerBulkAccept();

            if (success) {
              const formType = String(
                invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
                "",
              );
              postParentMessage(sendInvitationValidationFailedMessage());
              postParentMessage(prevListingPageredirect(formType));
            } else {
              postParentMessage(sendInvitationValidationFailedMessage());
            }
          } catch (error) {
            console.error("Bulk accept error:", error);
            postParentMessage(sendInvitationValidationFailedMessage());
          } finally {
            setLoading(false);
          }
        }
        if (
          message.type === "warp-decline-re-submit-refresh" &&
          message.response === true
        ) {
          try {
            await onRefetchInvitation();
          } catch (error) {
            console.error("decline-submit-refresh error:", error);
          }
        }
      } catch (e) { }
    };
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [activeTab, onReviewerDecline, onReviewerJustify, onReviewerBulkAccept, invitationAndSubmissionQueryResult]);

  const [progressPercentage, setProgressPercentage] = useState("0");
  const [pendingQuestionsMap, setPendingQuestionsMap] = useState<Record<string, string[]>>({});




  useEffect(() => {
    if (
      IsPageRefreshed &&
      IsPageRefreshed !== "undefined" &&
      IsPageRefreshed !== "null"
    ) {
      setActiveTab(IsPageRefreshed);
      return;
    }
    if (currentWizard?.question) {
      setActiveTab(currentWizard?.question);
      // setLocalStorageData(window.localStorage, "IsPageRefreshed", currentWizard?.question);
      if (userSession?.user?.role === AppRoles.Responder) {
        postParentMessage(
          prevNextClick(currentWizard?.question || "", invitationId),
        );
      }
    }
  }, [currentWizard?.question, invitationId, IsPageRefreshed, userSession?.user?.role]);

  useEffect(() => {
    // if (currentSec !== localStorage.getItem("secCurrent")!) {
    //   setCurrentSec(localStorage.getItem("secCurrent")!);
    // }
    if (IsPageRefreshed) {
      // setLoading(true);
      setCurrentSec(
        questions.filter((d: any) => d.questionId === IsPageRefreshed)[0]
          ?.section || currentWizard?.section,
      );

      sectionHandler(
        questions.filter((d: any) => d.questionId === IsPageRefreshed)[0]
          ?.section || currentWizard?.section,
      );
      // setTimeout((e: any) => {
      //   setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
      //   setLoading(false);
      // }, 1500);
      return;
    }

    setCurrentSec(
      questions.filter((d: any) => d.questionId === questionId)[0]?.section ||
      currentWizard?.section,
    );

    setInfoIconDetail(
      steps.filter(
        (x) =>
          x.key ===
          (questions || defaultQuestion).filter(
            (d: any) => d.questionId === activeTab,
          )[0]?.section,
      )[0]?.infoIconProps?.content ?? "",
    );
    if (IsPageRefreshed) setActiveTab(activeTab);
  }, [
    currentWizard?.section,
    questionId,
    questions,
    currentSec,
    IsPageRefreshed,
  ]);

  let accordianBreadCrumbData: any = [];

  useEffect(() => {
    if (steps !== undefined) {
      // document
      //   .querySelectorAll("[class$='accordianSubtheme']")
      //   .forEach((item: any) => {
      //     if (item.getAttribute("data-active") === "true") {
      //       //item.click();
      //       item.classList.remove("accordianSubtheme");
      //     }
      //   });

      const getQuestionSubthemeName = tabs
        .filter(
          (p) =>
            p.formField.Question !== null && p.formField.Question !== undefined,
        )
        .filter(
          (t) =>
            t.formField?.Section?.id ===
            questions.filter((d: any) => d.questionId === activeTab)[0]
              ?.sectionId && t.formField?.Question?.id === activeTab,
        )
        .map((u) => u.formField.subtheme)[0];

      const getBredcrum_tabs = tabs
        .filter(
          (x) =>
            x.formField?.Section?.id ===
            questions.filter((d: any) => d.questionId === activeTab)[0]
              ?.sectionId && x.formField.subtheme === getQuestionSubthemeName,
        )
        .filter((y) => y.formField.type === "sub-theme")
        .map((z) => z.formField.interfaceOptions.breadcrumb);
      if (getBredcrum_tabs.length > 0) {
        if (isHierarchyLevel && (getBredcrum_tabs[0] ?? "").indexOf(">") > -1) {
          setCurrentBreadCrumb(getBredcrum_tabs[0]?.split(">")[0]);
        } else {
          setCurrentBreadCrumb(getBredcrum_tabs[0]);
        }
        if (getBredcrum_tabs[0] !== "") {
          if (currentBreadCrumb !== getBredcrum_tabs[0]) {
            if ((getBredcrum_tabs[0] ?? "").indexOf(">") > -1) {
              let collectedItemArray: Array<string> = [];
              getBredcrum_tabs[0]
                ?.split(">")
                .map((item: any, index: number) => {
                  collectedItemArray.push(item.trim().split(" ").join("_"));
                  if (index === 0) {
                    const firstHeading = questions.filter(
                      (d: any) => d.questionId === activeTab,
                    )[0]?.section;
                    accordianBreadCrumbData.push(firstHeading);
                  } else if (
                    getBredcrum_tabs[0]?.split(">").length ===
                    index + 1
                  ) {
                    accordianBreadCrumbData.push(collectedItemArray.join("_"));
                    setAccordianBreadCrumb(accordianBreadCrumbData);
                  } else {
                    // accordianBreadCrumbData.push(
                    //   item.trim().split(" ").join("_")
                    // );
                    accordianBreadCrumbData.push(collectedItemArray.join("_"));
                  }

                  // const getDocumentId: any =
                  //   document.querySelector(`[id$="${item.trim()}"]`) || null;
                  // if (getDocumentId !== null) {
                  //   if (getDocumentId.getAttribute("data-active") === null) {
                  //     if (IsPageRefreshed) {
                  //       setTimeout((e: any) => {
                  //         setLocalStorageData(
                  //           window.localStorage,
                  //           "IsPageRefreshed",
                  //           "null"
                  //         );
                  //       }, 2000);
                  //     }
                  //   }
                  // }
                  return null;
                });
            }
          } else if (IsPageRefreshed) {
            if ((getBredcrum_tabs[0] ?? "").indexOf(">") > -1) {
              let collectedItemArray: Array<string> = [];
              getBredcrum_tabs[0]
                ?.split(">")
                .map((item: any, index: number) => {
                  collectedItemArray.push(item.trim().split(" ").join("_"));
                  if (index === 0) {
                    const firstHeading = questions.filter(
                      (d: any) => d.questionId === activeTab,
                    )[0]?.section;
                    accordianBreadCrumbData.push(firstHeading);
                  } else if (
                    getBredcrum_tabs[0]?.split(">").length ===
                    index + 1
                  ) {
                    accordianBreadCrumbData.push(collectedItemArray.join("_"));
                    setAccordianBreadCrumb(accordianBreadCrumbData);
                  } else {
                    // accordianBreadCrumbData.push(
                    //   item.trim().split(" ").join("_")
                    // );
                    accordianBreadCrumbData.push(collectedItemArray.join("_"));
                  }
                  // const getDocumentId: any =
                  //   document.querySelector(`[id$="${item.trim()}"]`) || null;
                  // if (getDocumentId !== null) {
                  //   if (getDocumentId.getAttribute("data-active") === null) {
                  //     if (IsPageRefreshed) {
                  //       setTimeout((e: any) => {
                  //         setLocalStorageData(
                  //           window.localStorage,
                  //           "IsPageRefreshed",
                  //           "null"
                  //         );
                  //         getDocumentId.click();
                  //       }, 2000);
                  //     }
                  //   }
                  // }
                  return null;
                });
            }
          }
        }
        setLoading(false); // this is added to stop the loading when question is changed
        return;
      }

      const getBredcrum_steps = steps.filter(
        (x) =>
          x.key ===
          (questions || defaultQuestion).filter(
            (d: any) => d.questionId === activeTab,
          )[0]?.section,
      )[0]?.breadcrumb;

      if (getBredcrum_steps !== undefined) {
        accordianBreadCrumbData.push(getBredcrum_steps.split(" ").join("_"));
        setAccordianBreadCrumb(accordianBreadCrumbData);
        setCurrentBreadCrumb(getBredcrum_steps);
        if (getBredcrum_steps !== "") {
          if ((getBredcrum_steps ?? "").indexOf(">") > -1) {
            getBredcrum_steps?.split(">").map((item: any, index: number) => {
              accordianBreadCrumbData.push(item.trim().split(" ").join("_"));
              if (getBredcrum_tabs[0]?.split(">").length === index + 1) {
                setAccordianBreadCrumb(accordianBreadCrumbData);
              }

              const getDocumentId: any =
                document.querySelector(`[id*="${item.trim()}"]`) || null;
              if (getDocumentId !== null) {
                if (getDocumentId.getAttribute("data-active") === null) {
                  // getDocumentId.click();
                }
              }
              return null;
            });
          }
        }
        return;
      }
      accordianBreadCrumbData.push(getBredcrum_steps);
      setAccordianBreadCrumb(accordianBreadCrumbData);
      setCurrentBreadCrumb(steps[0].breadcrumb);
    }
  }, [activeTab, currentBreadCrumb, IsPageRefreshed]);


  const InviterAutoAppoverRecord = useMemo(() => {
    if (!AutoAppoverRecored[0]?.data) return null;
    return AutoAppoverRecored[0]?.data.filter((x: any) =>
      userSession?.user?.role === "Invitee"
        ? x.formId === chkStore?.formId &&
        x.companyId ===
        invitationAndSubmissionQueryResult?.FormInvitation[0]
          ?.parentcompanyId &&
        x.IsEnable === true
        : x.formId === chkStore?.formId &&
        x.companyId === userSession?.company?.id &&
        x.UserId.indexOf(userSession?.user?.id) >= 0 &&
        x.IsEnable === true,
    );
  }, [
    AutoAppoverRecored,
    chkStore,
    userSession,
    invitationAndSubmissionQueryResult,
  ]);

  const FormSubmissionsStatus = useMemo(() => {
    if (!invitationAndSubmissionQueryResult?.FormInvitation[0]) return null;

    return invitationAndSubmissionQueryResult?.FormInvitation?.filter((m) =>
      userSession?.user?.role === "Consultant"
        ? m.formId === chkStore?.formId
        : m.formId === chkStore?.formId &&
        m.parentcompanyId === userSession?.company?.id,
    )[0];
  }, [invitationAndSubmissionQueryResult, chkStore, userSession]);

  let IsApprove = true;
  let Newurl = window.location.href;
  if (Newurl.includes("viewrecommendation")) {
    IsApprove = false;
  } else {
    IsApprove = true;
  }

  const isDelegateQuestion = useMemo(() => {
    if (!invitationAndSubmissionQueryResult?.FormInvitation[0]) return false;
    let getIsDelegate = invitationAndSubmissionQueryResult?.FormInvitation[0];
    if (
      getIsDelegate?.Form?.isDelegateQuestion &&
      (query?.mode === FormMode.Start ||
        query?.mode === FormMode.ViewRecommendation)
    )
      return true;
    else return false;
  }, [invitationAndSubmissionQueryResult, query?.mode]);

  const AssesseeUserMappingResult: any = useMemo(() => {
    if (!AssesseeUserMappingQueryResult?.AssesseeUserMapping[0]) return null;
    return AssesseeUserMappingQueryResult?.AssesseeUserMapping;
  }, [AssesseeUserMappingQueryResult]);

  const formInvitation = invitationAndSubmissionQueryResult?.FormInvitation[0];
  const isSelf =
    formInvitation?.ParentCompanyMapping?.UserId === userSession?.user?.id;
  let isAlreadyAssigned: any =
    AssesseeUserMappingResult?.filter((x: any) => x.questionId === activeTab)
      .length > 0
      ? true
      : false;

  const SelfAssessmentDisabled: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "SelfAssessmentDisabled",
  )?.some((y: any) => y.data?.some((d: any) => d.FormId === formField?.formId));

  setLocalStorageData(
    window.localStorage,
    "isResponderUser",
    AssesseeUserMappingResult?.filter(
      (x: any) => x.userId === userSession?.user?.id,
    ).length > 0
      ? true
      : false,
  );

  const answerByFormFieldIdMap = useMemo(() => {
    const map: Record<string, any> = {};
    Object.values(chkStore.answer || {}).forEach((ans: any) => {
      if (ans.formFieldId) map[ans.formFieldId] = ans;
    });
    return map;
  }, [chkStore.answer]);

  //const getCompanyDetailById = useGetCompanyDetailByIdLazyQuery()[0];

  //const getInterimRecommendation = useGetRecommendationByInterimAnswerIdAndQuestionIdLazyQuery()[0];
  const [loading, setLoading] = useState(false);
  const [NextPreviousloading, setNextPreviousloading] = useState(false);

  const { refetch: getformFieldsbySubmissionId } =
    useGetformFieldsbySubmissionIdQuery({ skip: true });

  const getQuestionRecord = useCallback(async (invitationId: string) => {
    const questionList = await getQuestionList({
      variables: { invitationId },
    });

    const filteredQuestions =
      questionList?.data?.FormInvitation[0]?.Form?.Sections.flatMap((section: any) =>
        section.Questions.filter((question: any) =>
          question.FormFields.some((field: any) => field.fieldOptions.required),
        ),
      );
    setRequiredQuestions(filteredQuestions || []);
  }, [getQuestionList]);

  useEffect(() => {
    if (invitationId) {
      getQuestionRecord(invitationId);
    }
  }, [invitationId, getQuestionRecord]);

  // Reset isSaved state when question changes or answer is modified
  useEffect(() => {
    setIsSaved(false);
  }, [activeTab, chkStore.answer]);

  // Centralized effect to sync all question statuses with chkStore.answer
  // This ensures that navigating, re-submitting, or declining always reflects correct progress
  // and updates pending list and active step progress in a single pass.
  useEffect(() => {
    if (!steps || !steps.length) return;

    let isMounted = true;
    const syncStatuses = async () => {
      const statusMap: Record<string, { color: boolean; partial: boolean; isRequired: boolean }> = {};
      const questionPromises: Promise<void>[] = [];
      const newPendingMap: Record<string, string[]> = {};
      const flattenedAnswers = flattenObjectValues(chkStore?.answer || {});

      let activeStepTotal = 0;
      let activeStepAnswered = 0;

      steps.forEach((stepData) => {
        const step = stepData?.component?.props?.formField;
        if (!step) return;

        const pendingList: string[] = [];
        const stepPromises: Promise<void>[] = [];
        const isActive = stepData.key === currentSec;

        const findQuestions = (field: any) => {
          if (field?.Question?.id) {
            if (isActive) {
              activeStepTotal++;
            }
            stepPromises.push(
              (async () => {
                const hasAnswer = await isAnswered(field, false, chkStore, flattenedAnswers);
                statusMap[field.Question.id] = {
                  color: hasAnswer,
                  partial: false,
                  isRequired: field?.fieldOptions?.required ?? false
                };
                if (hasAnswer) {
                  if (isActive) {
                    activeStepAnswered++;
                  }
                } else {
                  const title = field.interfaceOptions?.title || field.Question?.title || "Untitled Question";
                  pendingList.push(title);
                }
              })()
            );
            return;
          }

          if (field?.children && Array.isArray(field.children)) {
            field.children.forEach(findQuestions);
          }
        };

        findQuestions(step);

        questionPromises.push(
          (async () => {
            await Promise.all(stepPromises);
            if (pendingList.length > 0) {
              newPendingMap[stepData.key] = pendingList;
            }
          })()
        );
      });

      await Promise.all(questionPromises);

      if (isMounted) {
        if (Object.keys(statusMap).length > 0) {
          updateQuestionStatuses(statusMap);
        }
        const percentage = activeStepTotal === 0 ? "0" : ((activeStepAnswered / activeStepTotal) * 100).toFixed(0);
        setProgressPercentage(percentage);
        setPendingQuestionsMap(newPendingMap);
      }
    };

    syncStatuses();
    return () => {
      isMounted = false;
    };
  }, [
    steps,
    chkStore.answer,
    updateQuestionStatuses,
    userSession?.accessToken,
    currentSec,
    setProgressPercentage,
    setPendingQuestionsMap,
  ]);


  const getProgressBarPercentageForListing = useCallback(async () => {
    // Calculate progress in real-time based on current chkStore answers
    if (!requiredQuestions.length || !steps || !steps.length) return "0";

    const statusMap: Record<string, boolean> = {};
    const questionPromises: Promise<void>[] = [];

    const findQuestions = (field: any) => {
      if (field?.Question?.id) {
        questionPromises.push(
          (async () => {
            statusMap[field.Question.id] = await isAnswered(field, false, chkStore);
          })()
        );
        return;
      }

      if (field?.children && Array.isArray(field.children)) {
        field.children.forEach(findQuestions);
      }
    };

    // Traverse the form structure from steps to collect statuses
    steps.forEach((stepData: any) => {
      const field = stepData?.component?.props?.formField;
      if (field) {
        findQuestions(field);
      }
    });

    await Promise.all(questionPromises);

    const answeredCount = requiredQuestions.filter((q: any) => statusMap[q.id] === true).length;
    const percentage = (answeredCount / requiredQuestions.length) * 100;

    return percentage.toFixed(0);
  }, [steps, chkStore, requiredQuestions, userSession?.accessToken]);





  //Warning Rules changes started

  //Warning Rules changes end
  const assesseeUserLength =
    AssesseeUserMappingQueryResult?.AssesseeUserMapping.filter(
      (user: any) =>
        user.userId === userSession?.user?.id && user.questionId === questionId,
    ) || [];

  const upsertQuestionAnswer = useCallback(
    // showSpinner controls whether the in-page <Spinner> is displayed during save.
    // Default is true (Save / Next / Prev buttons show the spinner as expected).
    // Pass false when calling from SubmitDetails so that clicking "Submit Report /
    // Submit Assessment / Submit Responses" does NOT flash the in-page spinner —
    // the parent frame already shows its own full-screen loader via
    // sendInvitationLoadingStartedMessage(), and showing both simultaneously
    // looks broken.
    async (formFieldId: string, showSpinner = true) => {
      if (loading) return false;

      try {
        setNextPreviousloading(true);
        // Get required data
        const formField = getFormFieldStoreState().formFields.find(
          (m: any) => m.Question?.id === formFieldId,
        );
        const questionId = formField?.Question?.id;
        const submissionId = getFormFieldStoreState().formSubmissionId;
        if (showSpinner) setLoading(true);
        // Validate inputs
        if (!submissionId || !questionId) {
          return false;
        }

        const answers = getAnswersByQuestionId(questionId);
        if (!answers?.length) {
          return false;
        }

        // Get answer data
        const { data } = await getAnswerByQuestionResult({
          variables: { questionId, submissionId },
        });

        // Prepare answer payload
        const latestDataArray = answers.map((item: any) => ({
          submissionId: item.submissionId,
          questionId: item.questionId,
          formFieldId: item.formFieldId,
          // Bug: || "" coerces numeric 0 to "". Fix: ?? only falls back for null/undefined.
          value: item.value ?? "",
        }));

        // Common answer data setup
        setAnswersData(
          data,
          submissionId,
          answers,
          latestDataArray,
          questionId,
          userSession?.user?.id,
          useFormFieldStore?.getState()?.answer,
          String(useFormFieldStore?.getState()?.formId),
          invitationId,
          "GroupTab",
          "",
          "",
          getFormFieldsDetail,
          getFormfieldRecommendation,
          upsertAnswer,
          updateAnswer,
          updateInterimAnswer,
          insertInterimAnsweronUpdate,
          getAnswersByIds,
          insertBulkAnswer,
          updateRecommendation,
          updateSuggestionData,
          useFormFieldStore?.getState()?.Suggestions,
          userSession,
          query?.mode || ""
        );


        if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
          const completionPercentage = await getProgressBarPercentageForListing();
          await upsertFormInvitationCompletion({
            variables: {
              completion: completionPercentage,
              invitationId,
            },
          });
        }


        // Handle assessee user mapping if needed
        if (isAlreadyAssigned) {
          const partiallyData = JSON.parse(
            getLocalStorageData(window.localStorage, "IsPartiallyanswered") ||
            "[{}]",
          )[0];
          const allValuesPresent = answers.every(
            (item: any) =>
              item.value !== null &&
              item.value !== undefined &&
              item.value !== "",
          );
          const status = !partiallyData?.status

            ? QuestionStatus.Responded
            : !!allValuesPresent
              ? QuestionStatus.Responded
              : QuestionStatus.Pending;

          if (
            userSession?.user?.role === AppRoles.Responder &&
            assesseeUserLength.length > 0
          ) {
            const variables = {
              invitationId,
              invitationStatus: status,
              userId: userSession?.user?.id,
              questionId,
              ...(userSession?.user?.role === AppRoles.Responder &&
                assesseeUserLength.length > 0
                ? { isResponder: true }
                : {}),
              updatedAt: new Date(),
              responderStatus: "",
            };
            const mutation = updateAssesseeUserMappingForResponderMutation;

            await Promise.all(
              latestDataArray.map(() => mutation({ variables })),
            );
          } else {
            const variables = {
              invitationId,
              invitationStatus: status,
              userId: userSession?.user?.id,
              questionId,
              ...(userSession?.user?.role === AppRoles.Responder &&
                assesseeUserLength.length > 0
                ? { isResponder: true }
                : {}),
              updatedAt: new Date(),
            };
            const mutation = updateAssesseeUserMappingMutation;

            await Promise.all(
              latestDataArray.map(() => mutation({ variables })),
            );
          }
        }
        // setLoading(false);

        return true;
      } catch (error) {
        console.error("Error in upsertQuestionAnswer:", error);
        return false;
      } finally {
        setLoading(false);
        setNextPreviousloading(false);
      }
    },
    [
      loading,
      invitationId,
      isAlreadyAssigned,
      userSession,
      query,
      getAnswerByQuestionResult,
      getFormFieldsDetail,
      getFormfieldRecommendation,
      upsertAnswer,
      updateAnswer,
      updateInterimAnswer,
      insertInterimAnsweronUpdate,
      insertBulkAnswer,
      updateRecommendation,
      updateSuggestionData,
      updateAssesseeUserMappingMutation,
      updateAssesseeUserMappingForResponderMutation,
      upsertFormInvitationCompletion,
      getProgressBarPercentageForListing,
      assesseeUserLength.length,
    ],
  );

  const submitConfirmed = async () => {
    setLoading(true);
    const {
      formId,
      formInvitationId: invitationId,
      formSubmissionId: submissionId,
    } = getFormFieldStoreState();

    const isResponderUsercheck: any | null = getLocalStorageData(
      window.localStorage,
      "isResponderUser",
    );

    if (isResponderUsercheck === "true") {
      // const emailSendResponse = await fetch(
      //   "/api/question-assign-email-invitation",
      //   {
      //     method: "POST",
      //     headers: {
      //       "content-type": "application/json",
      //     },
      //     body: JSON.stringify({
      //       id: invitationId,
      //       type: "QuestionResponse",
      //       companyId: userSession?.company?.id,
      //       formId: chkStore?.formId,
      //       userId: AssesseeUserMappingResult?.filter(
      //         (x: any) => x.userId === userSession?.user?.id
      //       )[0]?.reviewerUserId,
      //     }),
      //   }
      // );
      if (isAlreadyAssigned) {
        const answers = getAnswersByQuestionId(questionId);
        if (
          answers.filter((x: any) => x.value === "" || x.value === undefined)
            .length === answers.length
        ) {
          const resultFormInvitation: any =
            await updateAssesseeUserMappingMutation({
              variables: {
                invitationId: invitationId,
                invitationStatus: QuestionStatus.Pending,
                userId: userSession?.user?.id,
                questionId: activeTab,
                updatedAt: new Date(),
              },
            });
          await updateAssesseeUserMappingResponderStatusMutation({
            variables: {
              invitationId: invitationId,
              userId: userSession?.user?.id,
              updatedAt: new Date(),
              ResponderStatus: QuestionStatus.Responded,
            },
          });
        } else {
          const resultFormInvitation: any =
            await updateAssesseeUserMappingMutation({
              variables: {
                invitationId: invitationId,
                invitationStatus: QuestionStatus.Responded,
                userId: userSession?.user?.id,
                questionId: activeTab,
                updatedAt: new Date(),
              },
            });
          await updateAssesseeUserMappingResponderStatusMutation({
            variables: {
              invitationId: invitationId,
              userId: userSession?.user?.id,
              updatedAt: new Date(),
              ResponderStatus: QuestionStatus.Responded,
            },
          });
        }
      }
      const formType = String(
        invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
        "",
      );
      postParentMessage(sendInvitationValidationFailedMessage());
      postParentMessage(invitationFormSubmitMessage(formType));
    } else {
      if (formInvitation?.reviewerDetails) {
        await formInvitationStatusMutation({
          variables: {
            invitationId: invitationId,
            invitationStatus: FormInvitationStatus.UnderReview,
          },
        });
        await fetch("/warp/api/calculate-score/reviewer-form-submission-email", {
          method: "POST",
          body: JSON.stringify({
            formId,
            submissionId,
            invitationId,
            companyId: userSession?.company?.id,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: userSession?.accessToken ?? "",
          },
        });
      } else {
        const res = await fetch("/warp/api/submit-form", {
          method: "POST",
          body: JSON.stringify({
            submissionId,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: userSession?.accessToken ?? "",
          },
        });

        if (!res.ok) {
          const error = await res.json().catch(() => res.text());
          console.error("Form submission failed:", error);
          setLoading(false);
          // Return early so the score/email flows don't run on failure
          return;
        }

        const result = await res.json();
        await fetch("/warp/api/calculate-score/form-submission-email", {
          method: "POST",
          body: JSON.stringify({
            formId,
            submissionId,
            invitationId,
            companyId: userSession?.company?.id,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: userSession?.accessToken ?? "",
          },
        });
        /*await fetch("/api/calculate-score", {
                  method: "POST",
                  body: JSON.stringify({
                  formId,
                  submissionId,
                  invitationId,
                  }),
                  headers: {
                  "Content-Type": "application/json",
                  Authorization: userSession?.accessToken ?? "",
                  },
                  });
                  await fetch("/api/calculate-score/form-submission-email", {
                  method: "POST",
                  body: JSON.stringify({
                  formId,
                  submissionId,
                  invitationId,
                  companyId: userSession?.company?.id,
                  }),
                  headers: {
                  "Content-Type": "application/json",
                  Authorization: userSession?.accessToken ?? "",
                  },
                  });
                  
                  await fetch("/api/progress-report-score", {
                  method: "POST",
                  body: JSON.stringify({
                  formId,
                  submissionId,
                  invitationId,
                  isApproved: "true",
                  }),
                  headers: {
                  "Content-Type": "application/json",
                  Authorization: userSession?.accessToken ?? "",
                  },
                  });*/

        setLoading(false);

        let companyId: any = raraCompanies?.ParentCompanyMapping?.filter(
          (rec: any) => rec.CompanyId === userSession?.company?.id,
        )[0]?.CompanyId;

        // if (companyId && submissionId && invitationId) {
        //   await processDocumentRating(submissionId, invitationId);
        // }

        // if (formId === "1cca8240-d2a1-424c-9cc2-36e44c8ef139") {
        //   await createPdfFileOnS3(invitationId, formId);
        // }

        // Generate and upload assessment report in background using server-side API
        try {
          // Allow report generation if ANY of these conditions are true:
          // 1. User has AI capabilities AND form has AI enabled, OR
          // 2. Form invitation has carry forward as suggestions enabled, OR
          // 3. Form invitation has carry forward enabled
          const allowReportGeneration =
            (hasUserAICapabilities && hasAnyAICapabilities) ||
            (formInvitation?.interimCheck?.isCarryForwardAsSuggestionsInvitation === true) ||
            (formInvitation?.interimCheck?.isCarryForward === true)

          if (allowReportGeneration) {
            const questionaryName = `${invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.name ||
              "Report"
              }`;

            // Call server-side API for background report generation
            const response = await fetch("/warp/api/AI/generate-background-report", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: userSession?.accessToken ?? "",
              },
              body: JSON.stringify({
                invitationId: invitationId as string,
                questionaryName,
                companyId: userSession?.company?.id,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log(
                "Background report generation initiated successfully:",
                result,
              );
            } else {
              const error = await response.json();
              console.error(
                "Failed to initiate background report generation:",
                error,
              );
            }
          }
        } catch (error) {
          // Log error but don't let it affect the main submission flow
          console.error(
            "Failed to initiate background report generation:",
            error,
          );
        }
      }
      const formType = String(
        invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
        "",
      );
      postParentMessage(sendInvitationValidationFailedMessage());
      postParentMessage(invitationFormSubmitMessage(formType));
      // router.push("/invitation/list");
    }
  };

  const SubmitDetails = async (
    activeTab: any,
    //upsertAnswer: any,
    setLoading: any,
    loading: any,
  ) => {
    postParentMessage(sendInvitationLoadingStartedMessage());

    // const upsertAnswer = useUpsertAnswerMutation()[0];
    // const [loading, setLoading] = useState(false);
    const formData = useFormFieldStore.getState();
    // const answer = formData.answer;
    // let getrootfield = prepareFormForRender(formData.formFields);
    let Isvalidate = true;
    //let IsvalidateArray: any = [];
    // createPdfFileOnS3(
    //   "5d42dc9c-568f-4e76-bec0-17414161fef4",
    //   "6331b3f1-d49f-48f6-9bbe-bfe331506dcf"
    // );
    // const upsertQuestionAnswer = async (formFieldId: string) => {
    //   if (loading) return false;
    //   setLoading(false);

    //   const _formField = getFormFieldStoreState().formFields.find(
    //     (m: any) => m.Question?.id === formFieldId,
    //   );
    //   const questionId = _formField?.Question?.id;
    //   const submissionId = getFormFieldStoreState().formSubmissionId;

    //   if (!submissionId) {
    //     //alert("Invalid submission id");
    //     setLoading(false);
    //     return;
    //   }

    //   if (!questionId) {
    //     //alert("Invalid question id");
    //     setLoading(false);
    //     return;
    //   }

    //   const answers = getAnswersByQuestionId(questionId);
    //   //console.log({ answers });

    //   // No answer found
    //   if (!answers?.length) {
    //     setLoading(false);
    //     return;
    //   }
    //   const { data, error } = await getAnswerByQuestionResult({
    //     variables: {
    //       questionId: questionId,
    //       submissionId: submissionId,
    //     },
    //   });
    //   Isvalidate =
    //     useGroupWizardStore
    //       .getState()
    //       .questions.filter((item: any) => item.color === false).length > 0
    //       ? false
    //       : true;

    //   if (isAlreadyAssigned) {
    //     let latestDataArray: any = [];
    //     let _chkIsAnswered = false;
    //     let answerDataArray: any = [];
    //     answers?.map((item: any) => {
    //       if (
    //         ((item.value !== undefined && item.value !== "") ||
    //           item?.value?.length > 0) &&
    //         Isvalidate
    //       ) {
    //         _chkIsAnswered = true;
    //       }
    //       let latestValue = data?.Answer?.filter(
    //         (x: any) =>
    //           x.questionId === item.questionId &&
    //           x.formFieldId === item.formFieldId,
    //       )[0]?.data;
    //       if (
    //         (item.value === "" ||
    //           item?.value?.length === 0 ||
    //           item?.value === undefined) &&
    //         latestValue?.value !== ""
    //       ) {
    //         latestDataArray.push({
    //           submissionId: item.submissionId,
    //           questionId: item.questionId,
    //           formFieldId: item.formFieldId,
    //           value: latestValue?.value,
    //         });
    //         answerDataArray.push({
    //           submissionId: item.submissionId,
    //           questionId: item.questionId,
    //           formFieldId: item.formFieldId,
    //           oldValue: latestValue?.value,
    //           newValue: item.value,
    //         });
    //       } else {
    //         latestDataArray.push({
    //           submissionId: item.submissionId,
    //           questionId: item.questionId,
    //           formFieldId: item.formFieldId,
    //           value: item?.value,
    //         });
    //         answerDataArray.push({
    //           submissionId: item.submissionId,
    //           questionId: item.questionId,
    //           formFieldId: item.formFieldId,
    //           oldValue: latestValue?.value,
    //           newValue: item.value,
    //         });
    //       }
    //     });
    //     await setAnswersData(
    //       data,
    //       submissionId,
    //       answers,
    //       latestDataArray,
    //       questionId,
    //       userSession?.user?.id,
    //       useFormFieldStore?.getState()?.answer,
    //       String(chkStore?.formId),
    //       invitationId,
    //       "GroupTab",
    //       "",
    //       "",
    //       getFormFieldsDetail,
    //       getFormfieldRecommendation,
    //       upsertAnswer,
    //       updateAnswer,
    //       updateInterimAnswer,
    //       insertInterimAnsweronUpdate,
    //       getAnswersByIds,
    //       insertBulkAnswer,
    //       updateRecommendation,
    //       updateSuggestionData,
    //       useFormFieldStore?.getState()?.Suggestions,
    //     );
    //     if (userSession?.user?.role !== AppRoles.Responder && FormMode.Start === query?.mode) {
    //       const percentage = await getProgressBarPercentageForListing();
    //       await upsertFormInvitationCompletion({
    //         variables: {
    //           completion: percentage,
    //           invitationId: invitationId,
    //         },
    //       });
    //     }
    //     if (_chkIsAnswered) {
    //       if (
    //         userSession?.user?.role === AppRoles.Responder &&
    //         assesseeUserLength.length > 0
    //       ) {
    //         const resultFormInvitation: any =
    //           await updateAssesseeUserMappingForResponderMutation({
    //             variables: {
    //               invitationId: invitationId,
    //               invitationStatus: QuestionStatus.Responded,
    //               userId: userSession?.user?.id,
    //               questionId: questionId,
    //               isResponder: true,
    //               updatedAt: new Date(),
    //               responderStatus: "",
    //             },
    //           });
    //         await updateAssesseeUserMappingResponderStatusMutation({
    //           variables: {
    //             invitationId: invitationId,
    //             userId: userSession?.user?.id,
    //             updatedAt: new Date(),
    //             ResponderStatus: QuestionStatus.Responded,
    //           },
    //         });
    //       } else if (
    //         userSession?.user?.role === "Invitee" &&
    //         assesseeUserLength.length > 0
    //       ) {
    //         const resultFormInvitation: any =
    //           await updateAssesseeUserMappingForResponderMutation({
    //             variables: {
    //               invitationId: invitationId,
    //               invitationStatus: QuestionStatus.Responded,
    //               userId: userSession?.user?.id,
    //               questionId: questionId,
    //               isResponder: true,
    //               updatedAt: new Date(),
    //               responderStatus: "",
    //             },
    //           });
    //       } else {
    //         const resultFormInvitation: any =
    //           await updateAssesseeUserMappingMutation({
    //             variables: {
    //               invitationId: invitationId,
    //               invitationStatus: QuestionStatus.Responded,
    //               userId: userSession?.user?.id,
    //               questionId: questionId,
    //               updatedAt: new Date(),
    //             },
    //           });
    //       }
    //     } else {
    //       answerDataArray?.map(async (itemAnswer: any) => {
    //         if (itemAnswer.oldValue !== "" && itemAnswer.newValue === "") {
    //           if (
    //             userSession?.user?.role === AppRoles.Responder &&
    //             assesseeUserLength.length > 0
    //           ) {
    //             const resultFormInvitation: any =
    //               updateAssesseeUserMappingForResponderMutation({
    //                 variables: {
    //                   invitationId: invitationId,
    //                   invitationStatus: QuestionStatus.Pending,
    //                   userId: userSession?.user?.id,
    //                   questionId: questionId,
    //                   isResponder: true,
    //                   updatedAt: new Date(),
    //                   responderStatus: "",
    //                 },
    //               });
    //             await updateAssesseeUserMappingResponderStatusMutation({
    //               variables: {
    //                 invitationId: invitationId,
    //                 userId: userSession?.user?.id,
    //                 updatedAt: new Date(),
    //                 ResponderStatus: QuestionStatus.Responded,
    //               },
    //             });
    //           } else if (
    //             userSession?.user?.role === "Invitee" &&
    //             assesseeUserLength.length > 0
    //           ) {
    //             const resultFormInvitation: any =
    //               updateAssesseeUserMappingForResponderMutation({
    //                 variables: {
    //                   invitationId: invitationId,
    //                   invitationStatus: QuestionStatus.Pending,
    //                   userId: userSession?.user?.id,
    //                   questionId: questionId,
    //                   isResponder: true,
    //                   updatedAt: new Date(),
    //                   responderStatus: "",
    //                 },
    //               });
    //           } else {
    //             const resultFormInvitation: any =
    //               updateAssesseeUserMappingMutation({
    //                 variables: {
    //                   invitationId: invitationId,
    //                   invitationStatus: QuestionStatus.Pending,
    //                   userId: userSession?.user?.id,
    //                   questionId: questionId,
    //                   updatedAt: new Date(),
    //                 },
    //               });
    //           }
    //         } else if (
    //           (itemAnswer.oldValue === "" && itemAnswer.newValue === "") ||
    //           (itemAnswer.oldValue === undefined &&
    //             itemAnswer.newValue === undefined)
    //         ) {
    //           if (
    //             userSession?.user?.role === AppRoles.Responder &&
    //             assesseeUserLength.length > 0
    //           ) {
    //             const resultFormInvitation: any =
    //               updateAssesseeUserMappingForResponderMutation({
    //                 variables: {
    //                   invitationId: invitationId,
    //                   invitationStatus: QuestionStatus.Pending,
    //                   userId: userSession?.user?.id,
    //                   questionId: questionId,
    //                   isResponder: true,
    //                   updatedAt: new Date(),
    //                   responderStatus: "",
    //                 },
    //               });
    //             await updateAssesseeUserMappingResponderStatusMutation({
    //               variables: {
    //                 invitationId: invitationId,
    //                 userId: userSession?.user?.id,
    //                 updatedAt: new Date(),
    //                 ResponderStatus: QuestionStatus.Responded,
    //               },
    //             });
    //           } else if (
    //             userSession?.user?.role === "Invitee" &&
    //             assesseeUserLength.length > 0
    //           ) {
    //             const resultFormInvitation: any =
    //               updateAssesseeUserMappingForResponderMutation({
    //                 variables: {
    //                   invitationId: invitationId,
    //                   invitationStatus: QuestionStatus.Pending,
    //                   userId: userSession?.user?.id,
    //                   questionId: questionId,
    //                   isResponder: true,
    //                   updatedAt: new Date(),
    //                   responderStatus: "",
    //                 },
    //               });
    //           } else {
    //             const resultFormInvitation: any =
    //               updateAssesseeUserMappingMutation({
    //                 variables: {
    //                   invitationId: invitationId,
    //                   invitationStatus: QuestionStatus.Pending,
    //                   userId: userSession?.user?.id,
    //                   questionId: questionId,
    //                   updatedAt: new Date(),
    //                 },
    //               });
    //           }
    //         }
    //       });
    //     }
    //   } else {
    //     await setAnswersData(
    //       data,
    //       submissionId,
    //       answers,
    //       answers,
    //       questionId,
    //       userSession?.user?.id,
    //       useFormFieldStore?.getState()?.answer,
    //       String(chkStore?.formId),
    //       invitationId,
    //       "GroupTab",
    //       "",
    //       "",
    //       getFormFieldsDetail,
    //       getFormfieldRecommendation,
    //       upsertAnswer,
    //       updateAnswer,
    //       updateInterimAnswer,
    //       insertInterimAnsweronUpdate,
    //       getAnswersByIds,
    //       insertBulkAnswer,
    //       updateRecommendation,
    //       updateSuggestionData,
    //       useFormFieldStore?.getState()?.Suggestions,
    //       query?.mode || ""
    //     );

    //     if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
    //       const percentage = await getProgressBarPercentageForListing();
    //       console.log("getProgressBarPercentageForListing 1530", getProgressBarPercentageForListing());
    //       await upsertFormInvitationCompletion({
    //         variables: {
    //           completion: percentage,
    //           invitationId: invitationId,
    //         },
    //       });
    //     }
    //   }
    //   // console.log({ result });
    //   setLoading(false);
    //   return true;
    // };

    formData.formFields.map(async (item: any) => {
      const UpdateFiledOption = selectFieldOptions(formData, item.id);
    });

    // Pass showSpinner=false to suppress the in-page <Spinner> during submit.
    // The parent frame already shows a full-screen loader via
    // sendInvitationLoadingStartedMessage() above; showing both simultaneously
    // looks broken. Save / Next / Prev still use the default (showSpinner=true).
    await upsertQuestionAnswer(activeTab, false);

    await checkQuestionAnswers(true);

    // Calculate validation status in real-time based on required questions and current answers
    const statusMap: Record<string, boolean> = {};
    const traverse = async (field: any) => {
      if (field?.Question?.id) {
        statusMap[field.Question.id] = await isAnswered(field, false, chkStore);

        return;
      }
      if (field?.children && Array.isArray(field.children)) {
        for (const child of field.children) {
          await traverse(child);
        }
      }
    };
    for (const step of steps) {
      const field = step.component?.props?.formField;
      if (field) await traverse(field);
    }

    const incompleteRequired = requiredQuestions.filter(q => statusMap[q.id] === false);

    Isvalidate = incompleteRequired.length === 0;

    const formType = String(
      invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
      "",
    );

    if (Isvalidate === true) {
      const isResponder = userSession?.user?.role === AppRoles.Responder;
      const submissionId = getFormFieldStoreState().formSubmissionId;
      const formId = invitationAndSubmissionQueryResult?.FormInvitation[0]?.formId;
      let isReviewerSelf = userSession?.user?.role === AppRoles.Inviter && isSelf && SelfAssessmentDisabled ? true : false;
      const role = userSession?.user?.role;
      const InternalCompanyData: any = userSession?.GlobalMaster?.filter(
        (x: any) => x.type === "InternalRequestCompany"
      );

      const isInternalAssessment =
        InternalCompanyData?.[0]?.data?.some(
          (a: { companyId: string; IsEnable: boolean; formId: string }) =>
            a.companyId === userSession?.company?.id &&
            a.IsEnable === true &&
            a.formId === formId
        ) ?? false;
      let reviewerDetails_new = reviewerDetails;
      if (userSession?.user?.role === AppRoles.Responder) {
        reviewerDetails_new = {
          isExternalResponder: true,
        }
      }
      postParentMessage(warpFormSubmitConfirmation(formType, isResponder, reviewerDetails_new, questionId, invitationId, submissionId || "", formId, isReviewerSelf, isInternalAssessment, role));

      window.addEventListener("message", (e) => {
        if (!!e.data?.isSubmitted) {
          submitConfirmed();
        }
      });
    } else {
      showErrorMessage();
      postParentMessage(sendInvitationValidationFailedMessage());
      postParentMessage(
        invitationFormValidationFailedMessage(
          "Some of the fields are incomplete or contain errors. Please review and try again.",
        ),
      );
      if (
        currentWizard?.question === questions[questions?.length - 1]?.questionId // checking for last question.
      ) {
        prevHandler();
      } else {
        nextHandler();
      }
      const moveToNonMandatory: any = incompleteRequired.length > 0
        ? { questionId: incompleteRequired[0].id }
        : "";
      if (!!moveToNonMandatory) {
        setLocalStorageData(
          window.localStorage,
          "IsPageRefreshed",
          moveToNonMandatory?.questionId,
        );
      }
    }
  };

  async function processDocumentRating(
    submissionId: string,
    invitationId: string,
  ) {
    try {
      if (!submissionId || !invitationId)
        return { error: { message: "Required details missing" }, status: 500 };

      const FormFeildsData = await getformFieldsbySubmissionId({
        submissionId: submissionId,
      }).then((res: any) => res.data);

      const raraApiConfigs = FormFeildsData?.GlobalMaster[0]?.data;
      const invitation = FormFeildsData.FormSubmission[0]?.FormInvitation;

      let formFields = invitation?.Form?.FormFields;
      const companyName = invitation?.Company?.name;

      formFields = formFields.filter((ff: any) => !!ff.Answers?.length);

      if (!formFields.length) {
        return {
          error: { message: "No answers found for RARA Rating." },
          status: 500,
        };
      }

      const ratingApiBodyInputs = formFields
        .filter((ff: any) => !!ff.Answers?.length)
        .flatMap(
          (ff: any) =>
            ff.Answers[0]?.data.value.map((val: any) => ({
              documentType: ff.interfaceOptions?.rara.documentType as string,
              formfieldId: ff.id as string,
              companyName: companyName,
              file: val.value[0],
              fileId: val.value[0]?.fileId,
            })) as {
              documentType: any;
              formfieldId: any;
              companyName: string | undefined;
              file: any;
              fileId: any;
            }[],
        );

      const raraRatingApiConfig = raraApiConfigs.find(
        (config: any) => config.name === "rara-check",
      );

      if (!raraRatingApiConfig) {
        return {
          error: { message: "No RARA rating api configs found" },
          status: 500,
        };
      }

      const urlCheck = (url: any) => {
        try {
          new URL(url);
          return true;
        } catch (err) {
          return false;
        }
      };

      const ratingPromises = ratingApiBodyInputs.map(async (item: any) => {
        const isValidUrl = urlCheck(item?.file?.path);
        if (!isValidUrl) {
          return {
            error: { message: "Document url is not valid" },
            status: 500,
          };
        }

        const processSingleFileBody = {
          url: raraRatingApiConfig.url,
          document_url: item?.file?.path,
          company_name: item?.companyName,
          document_key: item?.documentType,
          auth_key: raraRatingApiConfig.authkey,
          partialSaveData: {
            invitationId: invitationId,
            submissionId: submissionId,
            formFieldId: item.formfieldId as string,
            type: "validation",
            fileId: item.fileId.toString(),
            data: null,
          },
        };

        // const {
        //   url,
        //   auth_key,
        //   company_name,
        //   document_key,
        //   document_url,
        //   partialSaveData,
        // } = processSingleFileBody;

        // const raraApiResponse = await fetch(url, {
        //   method: "POST",
        //   body: JSON.stringify({ document_url, company_name, document_key }),
        //   headers: {
        //     "Content-Type": "application/json",
        //     Authorization: auth_key,
        //   },
        // }).then((res: any) => res.json());

        // const saveData: RaraValidationAndRating_Insert_Input[] = [
        //   {
        //     ...partialSaveData,
        //     data: raraApiResponse,
        //   },
        // ];

        // const response = await insertRaraValidationAndRating({
        //   variables: {
        //     object: saveData,
        //   },
        // }).then((res) => res.data);

        const response = fetch("/warp/api/rara/document-rating-single", {
          method: "POST",
          body: JSON.stringify(processSingleFileBody),
          headers: {
            "Content-Type": "application/json",
            Authorization: userSession?.accessToken ?? "",
          },
        });

        return response;
      });

      const ratingDocsResults = await Promise.all(ratingPromises);

      return ratingDocsResults;
    } catch (error) {
      console.error("rara rating process", error);
    }

    return null;
  }

  useEffect(() => {
    const onMessage = async (event: MessageEvent) => {
      const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;
      let messageData: any;
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "snowkap-isRefreshPage") {
            // One-shot guard for Re-submitted view click: ignore the parent's
            // questionId so the form opens on the 1st question.
            const forceFirstQuestion = getLocalStorageData(
              window.localStorage,
              "ForceFirstQuestionOnView",
            );
            if (forceFirstQuestion === "true") {
              setLocalStorageData(
                window.localStorage,
                "ForceFirstQuestionOnView",
                "null",
              );
              setLocalStorageData(
                window.localStorage,
                "IsPageRefreshed",
                "null",
              );
              return;
            }
            if (messageData.questionId) {
              setQuestionId(messageData.questionId);
              setActiveTab(messageData.questionId);
              setLocalStorageData(
                window.localStorage,
                "IsPageRefreshed",
                messageData.questionId,
              );
              return;
            }
          }

          const WarningRulestorequestionid = WarningData1?.[0]?.questionid ?? "";
          if (type === "snowkap-warningmessage") {
            if (messageData.response === true) {
              const Iswarningmessagereceived = WarningData1?.[0]?.isWarningRule;
              if (
                !!Iswarningmessagereceived &&
                Iswarningmessagereceived === true
              ) {
                const isFileUpload =
                  WarningData1?.filter((x) => !!x.isFileUpload === true)
                    .length > 0
                    ? true
                    : false;
                if (messageData.step === "prev") {
                  if (isFileUpload === false)
                    await warninglogsave(
                      query?.mode,
                      invitationId,
                      UpsertValidationWarningLogsMutation,
                      userSession
                    );


                  // useWarningMessageStore.setState({
                  //   WarningRuleFields: []
                  // });
                  removeWarning();

                  if (typeof window !== "undefined") {
                    window?.document?.getElementById("btnPrevious")?.click();
                  }
                } else if (messageData.step === "next") {
                  // const isFileUpload =
                  //   WarningData1?.filter((x) => !!x.isFileUpload === true)
                  //     .length > 0
                  //     ? true
                  //     : false;
                  if (isFileUpload === false)
                    await warninglogsave(
                      query?.mode,
                      invitationId,
                      UpsertValidationWarningLogsMutation,
                      userSession
                    );


                  // useWarningMessageStore.setState({
                  //   WarningRuleFields: []
                  // });
                  removeWarning();

                  if (typeof window !== "undefined") {
                    window?.document?.getElementById("btnNext")?.click();
                  }
                } else if (messageData.step === "jumptoquestionid") {
                  const gotoquestionid: any | null = getLocalStorageData(
                    window.localStorage,
                    "gotoquestionid",
                  );
                  if (isFileUpload === false)
                    await warninglogsave(
                      query?.mode,
                      invitationId,
                      UpsertValidationWarningLogsMutation,
                      userSession
                    );

                  await upsertQuestionAnswer(WarningRulestorequestionid);
                  let warningList: warningmessageObjectType[] = [];

                  // useWarningMessageStore.setState({
                  //   WarningRuleFields: warningList
                  // });
                  removeWarning();
                  setQuestionId(gotoquestionid);
                  // setActiveTab(gotoquestionid);
                  setLocalStorageData(
                    window.localStorage,
                    "IsPageRefreshed",
                    gotoquestionid,
                  );
                } else if (messageData.step === "submit") {
                  if (isFileUpload === false)
                    await warninglogsave(
                      query?.mode,
                      invitationId,
                      UpsertValidationWarningLogsMutation,
                      userSession
                    );


                  scrollToTop();

                  // useWarningMessageStore.setState({
                  //   WarningRuleFields: []
                  // });
                  removeWarning();
                  if (typeof window !== "undefined") {
                    window?.document?.getElementById("btnSubmit")?.click();
                  }
                } else if (messageData.step === "jumptoSectionquestionid") {
                  if (isFileUpload === false)
                    await warninglogsave(
                      query?.mode,
                      invitationId,
                      UpsertValidationWarningLogsMutation,
                      userSession
                    );

                  await upsertQuestionAnswer(WarningRulestorequestionid);

                  let warningList: warningmessageObjectType[] = [];

                  // useWarningMessageStore.setState({
                  //   WarningRuleFields: warningList
                  // });
                  removeWarning();
                  if (!!messageData.nextActivetabId) {
                    sectionHandler(messageData.nextActivetabId);
                    setCurrentSec(messageData.nextActivetabId);
                  }
                }
              }

              return;
            }
          }
        } catch (error) { }
      }
    };

    globalThis.addEventListener("message", onMessage);
    return () => {
      globalThis.removeEventListener("message", onMessage);
    };
  }, [
    getQuestionId,
    UpsertValidationWarningLogsMutation,
    invitationId,
    query?.mode,
    removeWarning,
    sectionHandler,
    upsertQuestionAnswer,
    userSession,
  ]);


  const ApproveFormInvitationStatus = async () => {
    if (IsPageRefreshed) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    }
    let invitationStatus: string = "";
    if (InviterAutoAppoverRecord) {
      if (
        InviterAutoAppoverRecord[0].IsEnable === true &&
        InviterAutoAppoverRecord[0].IsAutoApprove === false
      ) {
        invitationStatus = FormInvitationStatus.Approved;
      }
    }
    const success_data = await formInvitationStatusMutation({
      variables: {
        invitationId: invitationId,
        invitationStatus: invitationStatus,
      },
    }).then((rec) => {
      return rec?.data?.update_FormInvitation?.returning;
    });
    const formType = String(
      invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
      "",
    );
    const success = success_data && success_data?.length > 0;
    if (!!success) {
      postParentMessage(warpApprovedSuccessfully());
      postParentMessage(prevListingPageredirect(formType));
    } else {
      alert("Something went wrong.");
    }

    await fetch("/warp/api/assessmentapproved-email1", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        id: invitationId,
        type: "AssessmentApprovalEmail",
        companyId:
          invitationAndSubmissionQueryResult?.FormInvitation[0]?.companyId,
        formId: invitationAndSubmissionQueryResult?.FormInvitation[0]?.formId,
        platformId: userSession?.platform?.id,
      }),
    });
    // Generate and upload assessment report in background using server-side API
        try {
          // Allow report generation if ANY of these conditions are true:
          // 1. User has AI capabilities AND form has AI enabled, OR
          // 2. Form invitation has carry forward as suggestions enabled, OR
          // 3. Form invitation has carry forward enabled
          const allowReportGeneration =
            (hasUserAICapabilities && hasAnyAICapabilities) ||
            (formInvitation?.interimCheck?.isCarryForwardAsSuggestionsInvitation === true) ||
            (formInvitation?.interimCheck?.isCarryForward === true)

          if (allowReportGeneration) {
            const questionaryName = `${invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.name ||
              "Report"
              }`;

            // Call server-side API for background report generation
            const response = await fetch("/warp/api/AI/generate-background-report", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: userSession?.accessToken ?? "",
              },
              body: JSON.stringify({
                invitationId: invitationId as string,
                questionaryName,
                companyId: userSession?.company?.id,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log(
                "Background report generation initiated successfully:",
                result,
              );
            } else {
              const error = await response.json();
              console.error(
                "Failed to initiate background report generation:",
                error,
              );
            }
          }
        } catch (error) {
          // Log error but don't let it affect the main submission flow
          console.error(
            "Failed to initiate background report generation:",
            error,
          );
        }
  };

  const checkQuestionAnswers = async (onSubmit: boolean) => {
    if (onSubmit) {
      for (const stepData of steps) {
        const step = stepData?.component?.props?.formField;
        for (const tabdata of (step?.children || [])) {
          for (const formFieldData of (tabdata?.children || [])) {
            let tabColor = await isAnswered(formFieldData, false, chkStore);
            changeColorHandler(tabColor, formFieldData?.Question?.id);
          }
        }
      }
    } else {
      const currentSteps = steps.filter((items) => items.key == currentSec);
      for (const stepData of currentSteps) {
        const step = stepData?.component?.props?.formField;
        for (const tabdata of (step?.children || [])) {
          for (const formFieldData of (tabdata?.children || [])) {
            let tabColor = await isAnswered(formFieldData, false, chkStore);
            changeColorHandler(tabColor, formFieldData?.Question?.id);
          }
        }
      }
    }
  };

  let isFirst = true;
  let isLast = false;
  if (questions) {
    isFirst = activeTab === questions[0]?.questionId;
    isLast =
      currentWizard?.question === questions[questions?.length - 1]?.questionId;
  }
  let isFirstRecomm = false;
  let isLastRecomm = false;
  if (questionsRecommForNext?.length == 0) {
    isLastRecomm = true;
  }
  if (questionsRecommForPrev?.length == 0) {
    isFirstRecomm = true;
  }
  const scrollToTop = () => {
    // for smoothly scroll to top.
    window.scroll({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const getProgressBarPercentage = () => {
    return progressPercentage;
  };

  const setCurrentSection = async (section: any) => {
    //localStorage.setItem("secCurrent", section);
    if (IsPageRefreshed) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    }

    if (!!currentWizard.question && query?.mode === FormMode.Start) {
      const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;

      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);
        if (WarningData1[0]?.isFileUpload) {
          postParentMessage(
            raraAlertPopup(
              WarningData1[0]?.warningmessage,
              "jumptoSectionquestionid",
              section,
            ),
          );
        } else {
          postParentMessage(
            warpWarningmessage(
              WarningData1[0]?.warningmessage,
              "jumptoSectionquestionid",
            ),
          );
        }
        return false;
      } else {
        if (section !== null) {
          await upsertQuestionAnswer(activeTab);
          sectionHandler(section);
          setCurrentSec(section);
        }
        if (section === null) setCurrentSec("");
      }
    } else if (!!currentWizard.question && query?.mode === FormMode.Review) {
      const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;

      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);
        if (WarningData1[0]?.isFileUpload) {
          postParentMessage(
            raraAlertPopup(
              WarningData1[0]?.warningmessage,
              "jumptoSectionquestionid",
              section,
            ),
          );
        } else {
          postParentMessage(
            warpWarningmessage(
              WarningData1[0]?.warningmessage,
              "jumptoSectionquestionid",
            ),
          );
        }
        return false;
      } else {
        if (section !== null) {
          //await upsertQuestionAnswer(activeTab);
          // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
          //           await upsertFormInvitationCompletion({
          //             variables: {
          //               completion: getProgressBarPercentageForListing(),
          //               invitationId,
          //             },
          //           });
          //         }
          sectionHandler(section);
          setCurrentSec(section);
        }
        if (section === null) setCurrentSec("");
      }
    } else {
      if (section !== null) {
        sectionHandler(section);
        setCurrentSec(section);
      }
      if (section === null) setCurrentSec("");
    }
  };
  const nextQuesBtn = async (e: any) => {
    if (IsPageRefreshed) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    }
    scrollToTop();
    if (isLast) return;
    const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;
    if (query?.mode === FormMode.Start) {
      await upsertQuestionAnswer(activeTab);
      // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
      //   await upsertFormInvitationCompletion({
      //     variables: {
      //       completion: getProgressBarPercentageForListing(),
      //       invitationId,
      //     },
      //   });
      // }
      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);
        if (WarningData1[0]?.isFileUpload) {
          postParentMessage(
            raraAlertPopup(WarningData1[0]?.warningmessage, "next"),
          );
        } else {
          postParentMessage(
            warpWarningmessage(WarningData1[0]?.warningmessage, "next"),
          );
        }

        return false;
      } else {
        //remove warning log if recorded
        if (WarningData1.length > 0) {
          let data = WarningData1.filter(
            (x: any) => x.ispopupmessageremoved === true,
          );
          if (data.length > 0) {
            data.map((item: any) => {
              UpdateValidationWarningLogsMutation({
                variables: {
                  formfieldId: item?.formfieldid,
                  invitationId: invitationId,
                },
              });
            });
          }
        }
        //remove warning log if recorded
        await upsertQuestionAnswer(activeTab);

        let warningList: warningmessageObjectType[] = [];

        // useWarningMessageStore.setState({
        //   WarningRuleFields: warningList
        // });
        removeWarning();
      }
      ///////////upsert
    } else if (query?.mode === FormMode.ViewRecommendation) {
      // await upsertQuestionAnswer(activeTab);
      // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
      //           await upsertFormInvitationCompletion({
      //             variables: {
      //               completion: getProgressBarPercentageForListing(),
      //               invitationId,
      //             },
      //           });
      //         }
      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);
        postParentMessage(
          raraAlertPopup(WarningData1[0]?.warningmessage, "next"),
        );
        return false;
      } else {
        //remove warning log if recorded

        if (WarningData1.length > 0) {
          let data = WarningData.filter(
            (x: any) => x.ispopupmessageremoved === true,
          );
          if (data.length > 0) {
            data.map((item: any) => {
              UpdateValidationWarningLogsMutation({
                variables: {
                  formfieldId: item?.formfieldid,
                  invitationId: invitationId,
                },
              });
            });
          }
        }
        await upsertQuestionAnswer(activeTab);
        // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
        //           await upsertFormInvitationCompletion({
        //             variables: {
        //               completion: getProgressBarPercentageForListing(),
        //               invitationId,
        //             },
        //           });
        //         }

        //remove warning log if recorded
      }
      ///////////upsert
    } else if (query?.mode === FormMode.Review) {
      // await upsertQuestionAnswer(activeTab);
      // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
      //           await upsertFormInvitationCompletion({
      //             variables: {
      //               completion: getProgressBarPercentageForListing(),
      //               invitationId,
      //             },
      //           });
      //         }
      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);
        if (WarningData1[0]?.isFileUpload) {
          postParentMessage(
            raraAlertPopup(WarningData1[0]?.warningmessage, "next"),
          );
        } else {
          postParentMessage(
            warpWarningmessage(WarningData1[0]?.warningmessage, "next"),
          );
        }

        return false;
      } else {
        //remove warning log if recorded
        if (WarningData1.length > 0) {
          let data = WarningData1.filter(
            (x: any) => x.ispopupmessageremoved === true,
          );
          if (data.length > 0) {
            data.map((item: any) => {
              UpdateValidationWarningLogsMutation({
                variables: {
                  formfieldId: item?.formfieldid,
                  invitationId: invitationId,
                },
              });
            });
          }
        }
        //remove warning log if recorded
        //await upsertQuestionAnswer(activeTab);
        // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
        //           await upsertFormInvitationCompletion({
        //             variables: {
        //               completion: getProgressBarPercentageForListing(),
        //               invitationId,
        //             },
        //           });
        //         }

        let warningList: warningmessageObjectType[] = [];

        // useWarningMessageStore.setState({
        //   WarningRuleFields: warningList
        // });
        removeWarning();
      }
      ///////////upsert
    }

    let firstTabIndex =
      useGroupWizardStore
        .getState()
        .questions?.findIndex(
          (q: any) =>
            q.questionId === useGroupWizardStore.getState().current?.question,
        ) ?? 0;

    let nextQuestion =
      useGroupWizardStore.getState().questions[firstTabIndex + 1]?.questionId;
    nextHandler();
    postParentMessage(prevNextClick(nextQuestion || "", invitationId));
    // prevNext();
  };

  const saveBtn = async (e: any) => {
    if (IsPageRefreshed) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    }
    scrollToTop();

    const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;
    if (query?.mode === FormMode.Start) {
      // await upsertQuestionAnswer(activeTab);
      // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
      // await upsertFormInvitationCompletion({
      // variables: {
      // completion: getProgressBarPercentageForListing(),
      // invitationId,
      // },
      // });
      // }
      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);
        if (WarningData1[0]?.isFileUpload) {
          postParentMessage(
            raraAlertPopup(WarningData1[0]?.warningmessage, "next"),
          );
        } else {
          postParentMessage(
            warpWarningmessage(WarningData1[0]?.warningmessage, "next"),
          );
        }

        return false;
      } else {
        //remove warning log if recorded
        if (WarningData1.length > 0) {
          let data = WarningData1.filter(
            (x: any) => x.ispopupmessageremoved === true,
          );
          if (data.length > 0) {
            data.map((item: any) => {
              UpdateValidationWarningLogsMutation({
                variables: {
                  formfieldId: item?.formfieldid,
                  invitationId: invitationId,
                },
              });
            });
          }
        }
        //remove warning log if recorded
        await upsertQuestionAnswer(activeTab);
        // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
        //           await upsertFormInvitationCompletion({
        //             variables: {
        //               completion: getProgressBarPercentageForListing(),
        //               invitationId,
        //             },
        //           });
        //         }
        removeWarning();
        // Set saved state to true after successful save
        setIsSaved(true);
      }
    } else if ((query?.mode === FormMode.Review && isMaker) || (query?.mode === FormMode.Review && userSession?.user?.role === AppRoles.Responder)) {
      await upsertQuestionAnswer(activeTab);
      // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
      //           await upsertFormInvitationCompletion({
      //             variables: {
      //               completion: getProgressBarPercentageForListing(),
      //               invitationId,
      //             },
      //           });
      //         }
      removeWarning();
      // Set saved state to true after successful save
      setIsSaved(true);
      await onReviewerJustify(activeTab, "Answered by Maker", true);
      fetch("/warp/api/reviewer-resubmit-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: invitationId,
          type: "ResubmitResponsesByReviewer",
          companyId: userSession?.company?.id,
          formId: invitationAndSubmissionQueryResult?.FormInvitation?.[0]?.formId,
          platformId: userSession?.platform?.id,
          questionId: activeTab,
          userRole: userSession?.user?.role,
        }),
      }).catch(err => console.error("Resubmit email failed:", err));
    }
    postParentMessage(saveClick());
  };

  // For submit button enable disable based on required first questions answered or not
  const formFields = useFormFieldStore((store) => store.formFields);
  const answer = useFormFieldStore((store) => store.answer);

  // For submit button enable disable based on required first questions answered or not
  const allRequiredAnswered = useMemo(() => {
    const requiredFirstQuestions = formFields.filter(
      (field: any) =>
        field?.interfaceOptions?.isFirstQuestion === true &&
        field?.fieldOptions?.required === true &&
        field?.fieldOptions?.enable === true,
    );

    if (requiredFirstQuestions.length === 0) {
      return true;
    }

    const allAnswered = requiredFirstQuestions.every((field: any) => {
      const fieldAnswer = answerByFormFieldIdMap[field.id];

      if (!fieldAnswer) return false;

      const { value } = fieldAnswer;

      if (Array.isArray(value)) {
        return (
          value.length > 0 &&
          value.some(
            (item) =>
              item && (typeof item === "string" ? item.trim() !== "" : true),
          )
        );
      }

      if (typeof value === "string") {
        return value.trim() !== "";
      }

      if (typeof value === "object" && value !== null) {
        return Object.keys(value).length > 0;
      }

      return value !== undefined && value !== null && value !== "";
    });

    return allAnswered;
  }, [answerByFormFieldIdMap, formFields]);

  const prevQuesBtn = async (e: any) => {
    if (IsPageRefreshed) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    }
    scrollToTop();
    if (isFirst) return;

    const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;
    if (query?.mode === FormMode.Start) {
      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);
        if (WarningData1[0]?.isFileUpload) {
          postParentMessage(
            raraAlertPopup(WarningData1[0]?.warningmessage, "prev"),
          );
        } else {
          postParentMessage(
            warpWarningmessage(WarningData1[0]?.warningmessage, "prev"),
          );
        }
        return false;
      } else {
        //remove warning log if recorded

        if (WarningData1.length > 0) {
          let data = WarningData1.filter(
            (x: any) => x.ispopupmessageremoved === true,
          );
          if (data.length > 0) {
            data.map((item: any) => {
              UpdateValidationWarningLogsMutation({
                variables: {
                  formfieldId: item?.formfieldid,
                  invitationId: invitationId,
                },
              });
            });
          }
        }
        //remove warning log if recorded
        await upsertQuestionAnswer(activeTab);
        // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
        //   await upsertFormInvitationCompletion({
        //     variables: {
        //       completion: getProgressBarPercentageForListing(),
        //       invitationId,
        //     },
        //   });
        // }
        let warningList: warningmessageObjectType[] = [];

        // useWarningMessageStore.setState({
        //   WarningRuleFields: warningList,
        // });
        removeWarning();
      }
      ///////////upsert
      //  await upsertQuestionAnswer(activeTab);
      // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
      //           await upsertFormInvitationCompletion({
      //             variables: {
      //               completion: getProgressBarPercentageForListing(),
      //               invitationId,
      //             },
      //           });
      //         }
    } else if (query?.mode === FormMode.ViewRecommendation) {
      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);

        let messagedata = postParentMessage(
          raraAlertPopup(WarningData1[0]?.warningmessage, "prev"),
        );

        return false;
      } else {
        //remove warning log if recorded

        if (WarningData1.length > 0) {
          let data = WarningData1.filter(
            (x: any) => x.ispopupmessageremoved === true,
          );
          if (data.length > 0) {
            data.map((item: any) => {
              UpdateValidationWarningLogsMutation({
                variables: {
                  formfieldId: item?.formfieldid,
                  invitationId: invitationId,
                },
              });
            });
          }
        }
        //remove warning log if recorded
        await upsertQuestionAnswer(activeTab);
        // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
        //           await upsertFormInvitationCompletion({
        //             variables: {
        //               completion: getProgressBarPercentageForListing(),
        //               invitationId,
        //             },
        //           });
        //         }

        // useWarningMessageStore.setState({
        //   WarningRuleFields: [],

        // });
        removeWarning();
      }
    } else if (query?.mode === FormMode.Review) {
      if (WarningData1[0]?.isWarningRule) {
        setLoading(false);
        if (WarningData1[0]?.isFileUpload) {
          postParentMessage(
            raraAlertPopup(WarningData1[0]?.warningmessage, "prev"),
          );
        } else {
          postParentMessage(
            warpWarningmessage(WarningData1[0]?.warningmessage, "prev"),
          );
        }
        return false;
      } else {
        //remove warning log if recorded

        if (WarningData1.length > 0) {
          let data = WarningData1.filter(
            (x: any) => x.ispopupmessageremoved === true,
          );
          if (data.length > 0) {
            data.map((item: any) => {
              UpdateValidationWarningLogsMutation({
                variables: {
                  formfieldId: item?.formfieldid,
                  invitationId: invitationId,
                },
              });
            });
          }
        }
        //remove warning log if recorded
        // await upsertQuestionAnswer(activeTab);
        // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
        //   await upsertFormInvitationCompletion({
        //     variables: {
        //       completion: getProgressBarPercentageForListing(),
        //       invitationId,
        //     },
        //   });
        // }
        let warningList: warningmessageObjectType[] = [];

        // useWarningMessageStore.setState({
        //   WarningRuleFields: warningList,
        // });
        removeWarning();
      }
      ///////////upsert
      //  await upsertQuestionAnswer(activeTab);
      //   if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
      //             await upsertFormInvitationCompletion({
      //               variables: {
      //                 completion: getProgressBarPercentageForListing(),
      //                 invitationId,
      //               },
      //             });
      //           }
    }

    let prevTabIndex =
      useGroupWizardStore
        .getState()
        .questions?.findIndex(
          (q: any) =>
            q.questionId === useGroupWizardStore.getState().current?.question,
        ) ?? 0;

    let prevQuestion =
      useGroupWizardStore.getState().questions[prevTabIndex - 1]?.questionId;
    prevHandler();
    //prevNext();
    postParentMessage(prevNextClick(prevQuestion || "", invitationId));
  };
  const isEdge = useMemo(() => /Edg/.test(navigator.userAgent), []);

  const memoizedAccordion = useMemo(() => {
    const getSubSection = (
      stepChild: any,
      stepData: any,
      level: number,
      defaultAccordian: any,
    ) => {
      const heirachyLevel = 7;
      let isShowHeirachy = false;
      return stepChild
        ?.filter(
          (a: any) => a.interface === "group-tabs" || a.type === "sub-theme",
        )
        .map((subStep: any) => {
          //console.log("true subStep.type", subStep?.interfaceOptions?.title);
          // if (subStep.type === "sub-theme" || subStep.type === "tabs") {
          if (
            subStep?.interfaceOptions?.title === undefined ||
            parseInt(hierarchyLevel) === 1
          ) {
            return (
              <Group
                key={subStep.id || subStep.formField?.id || subStep.interfaceOptions?.breadcrumb}
                bg={"#038FC71A"}
                p={10}
                mb={1}
                gap={10}
                className="questionParent"
              >
                {questions.map((d, i) => {
                  if (d.section === stepData.key) {
                    return tabs.map((tab) => {
                      if (tab.title === d.title) {
                        let isAssigned: any = AssesseeUserMappingResult?.filter(
                          (x: any) =>
                            x.questionId === tab.formField?.Question?.id,
                        );

                        const currentFormfields = useFormFieldStore
                          ?.getState()
                          .formFields.filter(
                            (dataItems) =>
                              dataItems.questionId ==
                              tab.formField?.Question?.id,
                          );
                        return (
                          <Box key={tab.formField?.id}>
                            <QuestionBox
                              isSuggestion={
                                useFormFieldStore
                                  ?.getState()
                                  ?.Suggestions.filter(
                                    (qItems) =>
                                      currentFormfields.filter(
                                        (items) =>
                                          items.id == qItems?.formFieldId,
                                      ).length > 0,
                                  ).length > 0
                              }
                              formField={tab.formField}
                              activeTab={activeTab}
                              tabKey={tab.formField?.Question?.id}
                              section={d.section}
                              breadcrumb={subStep?.interfaceOptions?.breadcrumb}
                              nextPreviousHandler={async () => {
                                scrollToTop();
                                if (IsPageRefreshed) {
                                  setLocalStorageData(
                                    window.localStorage,
                                    "IsPageRefreshed",
                                    "null",
                                  );
                                }

                                //if (isLast) return; //commented to save the last question data on question switch
                                if (query?.mode === FormMode.Start) {
                                  await upsertQuestionAnswer(activeTab);
                                } else if (
                                  query?.mode === FormMode.ViewRecommendation
                                ) {
                                  await upsertQuestionAnswer(activeTab);
                                }
                                postParentMessage(
                                  prevNextClick(
                                    currentWizard?.question || "",
                                    invitationId,
                                  ),
                                );
                              }}
                              isAssigned={
                                isAssigned?.length > 0 &&
                                  (userSession?.user?.role === AppRoles.Invitee ||
                                    (userSession?.user?.role === AppRoles.Inviter &&
                                      isSelf &&
                                      !SelfAssessmentDisabled))
                                  ? true
                                  : false
                              }
                              isDeclined={!!reviewerStatusMap.get(tab.formField?.Question?.id)?.status ? reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Declined" : false}
                              isAccepted={!!reviewerStatusMap.get(tab.formField?.Question?.id)?.status ? reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Accepted" : false}
                              isPendingReview={reviewerStatusMap.get(tab.formField?.Question?.id)?.status === null || reviewerStatusMap.get(tab.formField?.Question?.id)?.status === undefined ? true : false}
                              isResubmitted={!!reviewerStatusMap.get(tab.formField?.Question?.id)?.status ? reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Re-Submitted" : false}
                            />
                          </Box>
                        );
                      }
                      return null;
                    });
                  }
                  return null;
                })}
              </Group>
            );
          } else {
            const TabSubthemeData = tabs.filter(
              (x) =>
                x.formField.type === "sub-theme" &&
                x.formField.subtheme === subStep.subtheme &&
                x.formField.Section?.key === subStep?.Section?.key &&
                subStep?.interfaceOptions?.title !== undefined,
            );
            let AccorValue: string = "";
            if (subStep?.interfaceOptions?.breadcrumb.indexOf(">") > -1) {
              const breadcrumbArray: string[] =
                subStep?.interfaceOptions?.breadcrumb
                  .toString()
                  .split(">")
                  .map((x: string) => x.trim().split(" ").join("_"));
              AccorValue = breadcrumbArray.join("_");

              if (breadcrumbArray.length < heirachyLevel) {
                isShowHeirachy = true;
                level = level + 1;
              }
            } else {
              AccorValue = subStep?.interfaceOptions?.breadcrumb.trim();
            }

            // if (level < heirachyLevel) {
            //   isShowHeirachy = true;
            //   level = level + 1;
            // }

            return (
              <Accordion
                key={AccorValue}
                multiple={true}
                chevron={
                  subStep?.children?.length > 0 ? (
                    <IconPlus size="1rem" />
                  ) : (
                    <IconChevronDown size="1rem" />
                  )
                }
                styles={{
                  chevron: {
                    "&[data-rotate]": {
                      transform:
                        subStep?.children?.length > 0
                          ? "rotate(45deg)"
                          : "rotate(180deg)",
                    },
                  },
                  item: {
                    borderBottom: "none",
                    paddingBottom: 0,
                    paddingLeft: 0,
                    paddingRight: 0,
                  },
                  control: {
                    marginBottom: 0 + "!important",
                    "&[data-active]": {
                      background:
                        subStep?.children?.length > 0
                          ? "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)"
                          : "#038FC71A",
                      color: subStep?.children?.length > 0 ? "#fff" : "#005C81",

                      "&:hover": {
                        backgroundColor:
                          subStep?.children?.length > 0
                            ? "#1C9689 !important"
                            : "#E7ECEB !important",
                      },
                    },
                  },
                  content: {
                    paddingBottom: 0,
                    paddingTop: subStep?.children?.length > 0 ? "0" : "0",
                  },
                }}
                // classNames={{
                //   control: classes.accordionItem,
                // }}
                value={getaccordianBreadCrumb ?? []}
                onChange={setAccordianBreadCrumb}
                defaultValue={defaultAccordian ?? []}
              // onChange={() =>
              //   handleSubTheme(subStep?.interfaceOptions?.breadcrumb)
              // }
              >
                <Accordion.Item
                  // value={subStep?.interfaceOptions?.title}
                  value={AccorValue}
                  style={{ borderBottom: "none !important" }}
                >
                  {subStep?.interfaceOptions?.title !== "" &&
                    subStep?.interfaceOptions?.title !== undefined &&
                    isShowHeirachy ? (
                    <>
                      <Accordion.Control
                        pr={5}
                        pl={10}
                        pt={8}
                        pb={8}
                        c="#969696"
                        fz={12}
                        fw={500}
                        mb={5}
                      >
                        {subStep?.interfaceOptions?.title}
                      </Accordion.Control>
                      <Accordion.Panel
                        ml={-16}
                        mr={-16}
                        className={classes.paddingbottomno}
                      >
                        {subStep?.children?.length > 0 ? (
                          getSubSection(
                            subStep?.children,
                            stepData,
                            level,
                            defaultAccordian,
                          )
                        ) : (
                          <Group
                            key={subStep.id || subStep.interfaceOptions?.title}
                            bg={"#038FC71A"}
                            p={10}
                            mb={5}
                            gap={10}
                            className="questionParent"
                          >
                            {TabSubthemeData.map((d) => {
                              const filterTab = tabs.filter(
                                (x) =>
                                  x.formField.type !== "sub-theme" &&
                                  x.formField.subtheme === d.title &&
                                  x.formField.Section?.key ===
                                  subStep?.Section?.key,
                              );
                              return filterTab.map((tab) => {
                                let isAssigned: any =
                                  AssesseeUserMappingResult?.filter(
                                    (x: any) =>
                                      x.questionId ===
                                      tab.formField?.Question?.id,
                                  );
                                const currentFormfields = useFormFieldStore
                                  ?.getState()
                                  .formFields.filter(
                                    (dataItems) =>
                                      dataItems.questionId ==
                                      tab.formField?.Question?.id,
                                  );
                                return (
                                  <Box key={tab.formField?.id}>
                                    <QuestionBox
                                      isSuggestion={
                                        useFormFieldStore
                                          ?.getState()
                                          ?.Suggestions.filter(
                                            (qItems) =>
                                              currentFormfields.filter(
                                                (items) =>
                                                  items.id == qItems?.formFieldId,
                                              ).length > 0,
                                          ).length > 0
                                      }
                                      formField={tab.formField}
                                      activeTab={activeTab}
                                      tabKey={tab.formField?.Question?.id}
                                      section={stepData.key}
                                      breadcrumb={
                                        subStep?.interfaceOptions?.breadcrumb
                                      }
                                      nextPreviousHandler={async () => {
                                        if (IsPageRefreshed) {
                                          setLocalStorageData(
                                            window.localStorage,
                                            "IsPageRefreshed",
                                            "null",
                                          );
                                        }
                                        scrollToTop();
                                        if (isLast) return;

                                        if (query?.mode === FormMode.Start) {
                                          if (WarningData[0]?.isWarningRule) {
                                            setLoading(false);

                                            // postParentMessage(
                                            //   warpWarningmessage(
                                            //     WarningData[0]?.warningmessage,
                                            //     "jumptoquestionid"
                                            //   )
                                            // );
                                            if (WarningData[0]?.isFileUpload) {
                                              postParentMessage(
                                                raraAlertPopup(
                                                  WarningData[0]?.warningmessage,
                                                  "jumptoquestionid",
                                                ),
                                              );
                                            } else {
                                              postParentMessage(
                                                warpWarningmessage(
                                                  WarningData[0]?.warningmessage,
                                                  "jumptoquestionid",
                                                ),
                                              );
                                            }
                                            return false;
                                          } else {
                                            //remove warning log if recorded

                                            if (WarningData.length > 0) {
                                              let data = WarningData.filter(
                                                (x: any) =>
                                                  x.ispopupmessageremoved ===
                                                  true,
                                              );
                                              if (data.length > 0) {
                                                data.map((item: any) => {
                                                  UpdateValidationWarningLogsMutation(
                                                    {
                                                      variables: {
                                                        formfieldId:
                                                          item?.formfieldid,
                                                        invitationId:
                                                          invitationId,
                                                      },
                                                    },
                                                  );
                                                });
                                              }
                                            }
                                            //remove warning log if recorded
                                            await upsertQuestionAnswer(activeTab);
                                            let warningList: warningmessageObjectType[] =
                                              [];

                                            // useWarningMessageStore.setState({
                                            //   WarningRuleFields: warningList,

                                            // });
                                            removeWarning();
                                          }
                                        } else if (
                                          query?.mode ===
                                          FormMode.ViewRecommendation
                                        ) {
                                          if (WarningData[0]?.isWarningRule) {
                                            setLoading(false);

                                            return false;
                                          } else {
                                            //remove warning log if recorded

                                            if (WarningData.length > 0) {
                                              let data = WarningData.filter(
                                                (x: any) =>
                                                  x.ispopupmessageremoved ===
                                                  true,
                                              );
                                              if (data.length > 0) {
                                                data.map((item: any) => {
                                                  UpdateValidationWarningLogsMutation(
                                                    {
                                                      variables: {
                                                        formfieldId:
                                                          item?.formfieldid,
                                                        invitationId:
                                                          invitationId,
                                                      },
                                                    },
                                                  );
                                                });
                                              }
                                            }
                                            //remove warning log if recorded
                                            await upsertQuestionAnswer(activeTab);
                                            // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
                                            //           await upsertFormInvitationCompletion({
                                            //             variables: {
                                            //               completion: getProgressBarPercentageForListing(),
                                            //               invitationId,
                                            //             },
                                            //           });
                                            //         }
                                            let warningList: warningmessageObjectType[] =
                                              [];
                                            // useWarningMessageStore.setState({
                                            //   WarningRuleFields: warningList,

                                            // });
                                            removeWarning();
                                          }
                                        }
                                        postParentMessage(
                                          prevNextClick(
                                            currentWizard?.question || "",
                                            invitationId,
                                          ),
                                        );
                                      }}
                                      isAssigned={
                                        isAssigned?.length > 0 &&
                                          (userSession?.user?.role ===
                                            AppRoles.Invitee ||
                                            (userSession?.user?.role ===
                                              AppRoles.Inviter &&
                                              isSelf &&
                                              !SelfAssessmentDisabled))
                                          ? true
                                          : false
                                      }
                                      isDeclined={reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Declined"}
                                      isAccepted={reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Accepted"}
                                      isPendingReview={!reviewerStatusMap.get(tab.formField?.Question?.id)?.status}
                                      isResubmitted={reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Re-Submitted"}
                                    />
                                  </Box>
                                );
                              });
                            })}
                          </Group>
                        )}
                      </Accordion.Panel>
                    </>
                  ) : (
                    <>
                      {subStep?.children?.length > 0 ? (
                        getSubSection(
                          subStep?.children,
                          stepData,
                          level,
                          defaultAccordian,
                        )
                      ) : (
                        <Stack gap="xs" className="questionParent">
                          {TabSubthemeData.map((d) => {
                            const filterTab = tabs.filter(
                              (x) =>
                                x.formField.type !== "sub-theme" &&
                                x.formField.subtheme === d.title &&
                                x.formField.Section?.key ===
                                subStep?.Section?.key,
                            );
                            return filterTab.map((tab) => {
                              let isAssigned: any =
                                AssesseeUserMappingResult?.filter(
                                  (x: any) =>
                                    x.questionId ===
                                    tab.formField?.Question?.id,
                                );

                              const currentFormfields = useFormFieldStore
                                ?.getState()
                                .formFields.filter(
                                  (dataItems) =>
                                    dataItems.questionId ==
                                    tab.formField?.Question?.id,
                                );
                              return (
                                <Box key={tab.formField?.id}>
                                  <QuestionBox
                                    isSuggestion={
                                      useFormFieldStore
                                        ?.getState()
                                        ?.Suggestions.filter((qItems) =>
                                          currentFormfields.filter(
                                            (items) =>
                                              items.id == qItems?.formFieldId,
                                          ),
                                        ).length > 0
                                    }
                                    formField={tab.formField}
                                    activeTab={activeTab}
                                    tabKey={tab.formField?.Question?.id}
                                    section={stepData.key}
                                    breadcrumb={
                                      subStep?.interfaceOptions?.breadcrumb
                                    }
                                    nextPreviousHandler={async () => {
                                      if (IsPageRefreshed) {
                                        setLocalStorageData(
                                          window.localStorage,
                                          "IsPageRefreshed",
                                          "null",
                                        );
                                      }
                                      scrollToTop();

                                      if (isLast) return;

                                      const WarningData1 =
                                        useWarningMessageStore.getState()
                                          .WarningRuleFields;
                                      if (query?.mode === FormMode.Start) {
                                        if (WarningData1[0]?.isWarningRule) {
                                          setLoading(false);

                                          // postParentMessage(
                                          //   warpWarningmessage(
                                          //     WarningData1[0]?.warningmessage,
                                          //     "jumptoquestionid"
                                          //   )
                                          // );
                                          if (WarningData1[0]?.isFileUpload) {
                                            postParentMessage(
                                              raraAlertPopup(
                                                WarningData1[0]?.warningmessage,
                                                "jumptoquestionid",
                                              ),
                                            );
                                          } else {
                                            postParentMessage(
                                              warpWarningmessage(
                                                WarningData1[0]?.warningmessage,
                                                "jumptoquestionid",
                                              ),
                                            );
                                          }
                                          return false;
                                        } else {
                                          //remove warning log if recorded

                                          if (WarningData1.length > 0) {
                                            let data = WarningData1.filter(
                                              (x: any) =>
                                                x.ispopupmessageremoved === true,
                                            );
                                            if (data.length > 0) {
                                              data.map((item: any) => {
                                                UpdateValidationWarningLogsMutation(
                                                  {
                                                    variables: {
                                                      formfieldId:
                                                        item?.formfieldid,
                                                      invitationId: invitationId,
                                                    },
                                                  },
                                                );
                                              });
                                            }
                                          }
                                          //remove warning log if recorded
                                          await upsertQuestionAnswer(activeTab);
                                          // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
                                          //           await upsertFormInvitationCompletion({
                                          //             variables: {
                                          //               completion: getProgressBarPercentageForListing(),
                                          //               invitationId,
                                          //             },
                                          //           });
                                          //         }
                                          let warningList: warningmessageObjectType[] =
                                            [];
                                          // useWarningMessageStore.setState({
                                          //   WarningRuleFields: warningList,

                                          // });
                                          removeWarning();
                                        }
                                      } else if (
                                        query?.mode ===
                                        FormMode.ViewRecommendation
                                      ) {
                                        if (WarningData[0]?.isWarningRule) {
                                          setLoading(false);

                                          let messagedata = postParentMessage(
                                            warpWarningmessage(
                                              WarningData[0]?.warningmessage,
                                              "prev",
                                            ),
                                          );

                                          return false;
                                        } else {
                                          //remove warning log if recorded

                                          if (WarningData.length > 0) {
                                            let data = WarningData.filter(
                                              (x: any) =>
                                                x.ispopupmessageremoved === true,
                                            );
                                            if (data.length > 0) {
                                              data.map((item: any) => {
                                                UpdateValidationWarningLogsMutation(
                                                  {
                                                    variables: {
                                                      formfieldId:
                                                        item?.formfieldid,
                                                      invitationId: invitationId,
                                                    },
                                                  },
                                                );
                                              });
                                            }
                                          }
                                          //remove warning log if recorded
                                          await upsertQuestionAnswer(activeTab);
                                          // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
                                          //   await upsertFormInvitationCompletion({
                                          //     variables: {
                                          //       completion: getProgressBarPercentageForListing(),
                                          //       invitationId,
                                          //     },
                                          //   });
                                          // }
                                          let warningList: warningmessageObjectType[] =
                                            [];
                                          // useWarningMessageStore.setState({
                                          //   WarningRuleFields: warningList,
                                          // });
                                          removeWarning();
                                        }
                                      }
                                      postParentMessage(
                                        prevNextClick(
                                          currentWizard?.question || "",
                                          invitationId,
                                        ),
                                      );
                                    }}
                                    isAssigned={
                                      isAssigned?.length > 0 &&
                                        (userSession?.user?.role ===
                                          AppRoles.Invitee ||
                                          (userSession?.user?.role ===
                                            AppRoles.Inviter &&
                                            isSelf &&
                                            !SelfAssessmentDisabled))
                                        ? true
                                        : false
                                    }
                                    isDeclined={reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Declined"}
                                    isAccepted={reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Accepted"}
                                    isPendingReview={isReviewer && !reviewerStatusMap.get(tab.formField?.Question?.id)?.status}
                                    isResubmitted={reviewerStatusMap.get(tab.formField?.Question?.id)?.status === "Re-Submitted"}
                                  />
                                </Box>
                              );
                            });
                          })}
                        </Stack>
                      )}
                    </>
                  )}
                </Accordion.Item>
              </Accordion>
            );
          }
          // }
        });
    };
    const bindAccordian = () => {
      return (
        <Accordion
          styles={{
            item: { borderBottom: "none", paddingBottom: 1 },
            control: {
              "&[data-active]": {
                cursor: "default",
              },
            },
            content: { paddingBottom: 0 },
          }}
          classNames={{
            control: classes.accordionItem,
          }}
          value={currentSec}
          onChange={(e) => setCurrentSection(e)}
        >
          {questions.length > 0 &&
            steps.map((stepData) => {
              const step = stepData?.component?.props?.formField;
              const setDefault = getaccordianBreadCrumb ?? [];
              return (
                <Accordion.Item value={stepData.key} key={stepData.key}>
                  <Accordion.Control
                    pr={5}
                    pl={10}
                    pt={8}
                    pb={8}
                    c="#888888"
                    fz={12}
                    bg="#ffffff"
                    lts={2}
                    style={{
                      // borderRadius: "5px",
                      textTransform: "uppercase",
                      pointerEvents:
                        stepData.key === currentSec ? "none" : "all",
                    }}
                  >
                    <Group gap="xs" style={{ display: "inline-flex", width: "100%", justifyContent: "space-between", flexWrap: "nowrap" }}>
                      <span>{step?.interfaceOptions?.title}</span>
                      
                    </Group>
                  </Accordion.Control>
                  {stepData.key === currentSec ? (
                    <Accordion.Panel
                      ml={-15}
                      mr={-15}
                      className={classes.paddingbottomno}
                    >
                      {getSubSection(step?.children, stepData, 1, setDefault)}
                    </Accordion.Panel>
                  ) : (
                    <></>
                  )}
                </Accordion.Item>
              );
            })}
        </Accordion>
      );
    };

    return bindAccordian();
  }, [
    currentSec,
    steps,
    getaccordianBreadCrumb,
    classes,
    questions,
    AssesseeUserMappingResult,
    IsPageRefreshed,
    SelfAssessmentDisabled,
    UpdateValidationWarningLogsMutation,
    WarningData,
    activeTab,
    currentWizard?.question,
    hierarchyLevel,
    invitationId,
    isLast,
    isSelf,
    query?.mode,
    removeWarning,
    setCurrentSection,
    tabs,
    upsertQuestionAnswer,
    userSession?.user?.role,
    reviewerStatusMap,
    isReviewer,
    pendingQuestionsMap,
  ]);
  const formDetails = {
    formId: chkStore.formId,
    invitationId: chkStore.formInvitationId,
    questionId: activeTab,
    SubmissionId: getFormFieldStoreState().formSubmissionId,
  };
  const nextRecommendation = () => {
    if (IsPageRefreshed) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    }
    //RARA warning starts
    const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;
    if (WarningData1[0]?.isWarningRule) {
      setLoading(false);
      if (WarningData1[0]?.isFileUpload) {
        postParentMessage(
          raraAlertPopup(WarningData1[0]?.warningmessage, "next"),
        );
      } else {
        postParentMessage(
          warpWarningmessage(WarningData1[0]?.warningmessage, "next"),
        );
      }
      //RARA warning ends
    } else {
      const currentQuestionData = getFormFieldStoreState().formFields.find(
        (m: any) => m.Question?.id === currentWizard?.question,
      );
      let nextQuestion: any = nextRecommHandler(currentQuestionData);
      if (!!nextQuestion) questionRecommHandler(nextQuestion);
      postParentMessage(prevNextClick(nextQuestion || "", invitationId));
    }
  };
  const prevRecommendation = () => {
    if (IsPageRefreshed) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
    }
    //RARA warning starts
    const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;
    if (WarningData1[0]?.isWarningRule) {
      setLoading(false);
      if (WarningData1[0]?.isFileUpload) {
        postParentMessage(
          raraAlertPopup(WarningData1[0]?.warningmessage, "next"),
        );
      } else {
        postParentMessage(
          warpWarningmessage(WarningData1[0]?.warningmessage, "next"),
        );
      }
      //RARA warning ends
    } else {
      const currentQuestionData = getFormFieldStoreState().formFields.find(
        (m: any) => m.Question?.id === currentWizard?.question,
      );
      let prevQuestion: any = prevRecommHandler(currentQuestionData);

      if (!!prevQuestion) questionRecommHandler(prevQuestion);
      postParentMessage(prevNextClick(prevQuestion || "", invitationId));
    }
  };

  const elementRef = useRef(null);

  useEffect(() => {
    if (!elementRef.current) return;

    const observer = new ResizeObserver((entries) => {
      for (let entry of entries) {
        if (entry.target === elementRef.current) {
          const newHeight = entry.contentRect.height;
          setTimeout(() => {
            postParentMessage(warpContentSize(newHeight + 20));
          }, 2000);
        }
      }
    });

    observer.observe(elementRef.current);

    // Cleanup observer on component unmount
    return () => {
      observer.disconnect();
    };
  }, []);

  const formType = String(
    invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype || "",
  );

  const reviewerDetails =
    invitationAndSubmissionQueryResult?.FormInvitation[0]?.reviewerDetails;

  return (
    <Flex
      gap={20}
      wrap="nowrap"
      align="flex-start"
    >
      <Stack ref={elementRef} style={{ flex: 1, minWidth: 0 }}>
        {/* <LoadingOverlay
          style={{ minHeight: window.innerHeight, height: "100%" }}
          visible={loading}
        /> */}

        <Spinner visible={loading} />
        <Box>
          <Flex
            justify="space-between"
            align="center"
            className={classes.breadcrumb}
          >
            <Text>
              <span className={classes.colWhite} style={{ fontWeight: "600" }}>
                {/* Sub Categoy 2 {">"} Section 2 {">"} */}
                {currentBreadCrumb}
              </span>
            </Text>
            <Flex>
              {(userSession?.user?.role === AppRoles.Invitee ||
                userSession?.user?.role === AppRoles.Responder ||
                (userSession?.user?.role === AppRoles.Inviter &&
                  isSelf &&
                  !SelfAssessmentDisabled)) &&
                isDelegateQuestion &&
                query?.mode !== FormMode.ViewRecommendation &&
                !isAlreadyAssigned && (
                  <Button
                    onClick={() =>
                      postParentMessage(warpAssignQuestion(true, formDetails))
                    }
                    color={"#72D0C6"}
                    radius="xl"
                    size="xs"
                    mr={10}
                    disabled={isAlreadyAssigned}
                    className="Assignbtn-qun"
                  >
                    Assign
                  </Button>
                )}
              {getInfoIconDetail !== "" && getInfoIconDetail !== undefined ? (
                <Tooltip
                  multiline
                  position="bottom-end"
                  offset={0}
                  label={
                    <Text size="sm">
                      {/* Hover card is revealed when user hovers over target element,
                                        it will be hidden once mouse is not over both target and
                                        dropdown elements */}
                      <Box
                        dangerouslySetInnerHTML={{
                          __html: getInfoIconDetail ?? "",
                        }}
                      />
                    </Text>
                  }
                >
                  <ActionIcon
                    style={{
                      position: "relative",
                      zIndex: 9,
                      marginRight: "20px",
                    }}
                    variant="transparent"
                  >
                    <InfoIcon color="#ffffff" size={20} />
                  </ActionIcon>
                </Tooltip>
              ) : (
                // <HoverCard
                //   width={400}
                //   withArrow
                //   shadow="md"
                //   position="bottom-end"
                //   offset={-1}
                //   arrowOffset={8}
                // >
                //   <HoverCard.Target>
                //     <ActionIcon
                //       style={{
                //         position: "relative",
                //         zIndex: 9,
                //         marginRight: "20px",
                //       }}
                //       variant="transparent"
                //     >
                //       <InfoIcon color="#ffffff" size={20} />
                //     </ActionIcon>
                //   </HoverCard.Target>
                //   <HoverCard.Dropdown>
                //     <Text size="sm">
                //       {/* Hover card is revealed when user hovers over target element,
                //   it will be hidden once mouse is not over both target and
                //   dropdown elements */}
                //       <Box
                //         dangerouslySetInnerHTML={{
                //           __html: getInfoIconDetail ?? "",
                //         }}
                //       />
                //     </Text>
                //   </HoverCard.Dropdown>
                // </HoverCard>
                ""
              )}
            </Flex>
          </Flex>
          <Tabs
            keepMounted={false}
            defaultValue={defaultQuestion[0]?.formField?.Question?.id}
            radius={0}
            value={activeTab}
            styles={tabsStyles}
            className="assessmentDetails-page"
          >
            {defaultQuestion.map((tab) => (
              <GroupTabPanel
                key={tab.formField?.id}
                tab={tab}
                activeTab={activeTab}
                questions={questions}
              />
            ))}
          </Tabs>
        </Box>
        {/* Remark section for decline and justification */}
        {statusEntry?.remarks && statusEntry.remarks.length > 0 && (
          <Box pr={0} mt={10}>
            <Stack gap={10}>
              {statusEntry.remarks.filter((r) => r.remark !== "Answered by Maker").map((r, idx) => (
                <Box key={idx} >
                  <Text
                    fz={12}
                    c={
                      r.status === "Declined"
                        ? "#E7122B"
                        : r.status === "Re-Submitted"
                          ? "#005C81"
                          : "#fae5e7"
                    }
                    bg={
                      r.status === "Declined"
                        ? "#FFF5F5"
                        : r.status === "Re-Submitted"
                          ? "#E7F5F5"
                          : ""
                    }
                    px={10}
                    py={5}
                    style={{
                      width: "100%",
                      borderRadius: "5px",
                      border: `1px solid ${r.status === "Declined"
                        ? "rgba(231, 18, 43, 0.5)"
                        : r.status === "Re-Submitted"
                          ? "rgba(0, 92, 129, 0.5)"
                          : "rgba(231, 18, 43, 0.5)"
                        }`,
                    }}
                  >
                    <b>
                      {r.status === "Declined"
                        ? "Reason for Decline:"
                        : r.status === "Re-Submitted"
                          ? "Justification (Re-Submitted):"
                          : "Remark:"}
                    </b>{" "}
                    {r.remark}
                  </Text>
                  <Text fz="xs" ta="right" c="#666666">
                    Date & Time:{" "}
                    {new Date(r.timestamp).toLocaleDateString("en-GB", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}{" "}
                    {new Date(r.timestamp).toLocaleTimeString("en-US", {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true,
                    })}
                  </Text>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
        {/* End Remark section for decline and justification */}

        {/* Justification section */}
        <Flex align="center" style={{ justifyContent: "space-between" }}>
          <Group mt={20}>
            <Button
              id="btnPrevious"
              leftSection={
                <IconChevronLeft size="1rem" style={{ marginRight: "-8px" }} />
              }
              pl={7}
              radius={40}
              disabled={isFirst}
              hidden={isFirst}
              loading={NextPreviousloading ? true : false}
              onClick={async (e: any) => {
                prevQuesBtn(e);
              }}
              color="outlineBtn"
            >
              Prev
            </Button>
            <Button
              id="btnNext"
              //
              //
              rightSection={
                <IconChevronRight size="1rem" style={{ marginLeft: "-8px" }} />
              }
              loading={NextPreviousloading ? true : false}
              pr={7}
              radius={40}
              disabled={isLast}
              hidden={isLast}
              onClick={async (e: any) => {
                nextQuesBtn(e);
              }}
              color="solidBtn"
            >
              Next
            </Button>
            {isReviewer && query?.mode === FormMode.Review && (
              <>
                <Button radius={40} color="errorBtn"
                  loading={isRefetching}
                  onClick={() => {
                    postParentMessage(warpDeclineAnswer(true, {
                      questionId: activeTab,
                      invitationId: invitationId,
                      remark: statusEntry?.remarks?.find((r) => r.status === "Declined")?.remark,
                    }, false));
                  }}
                  disabled={statusEntry?.status === "Declined" || statusEntry?.status === "Accepted"}
                >
                  Decline
                </Button>
                <Button
                  radius={40}
                  color="solidBtn"
                  loading={isRefetching}
                  disabled={statusEntry?.status === "Accepted" || statusEntry?.status === "Declined"}
                  onClick={() => onReviewerAccept(activeTab)}
                >
                  {statusEntry?.status === "Accepted" ? "Accepted" : "Accept"}
                </Button>
              </>
            )}

            {(isMaker && statusEntry?.status === "Declined" && query?.mode === FormMode.Review) && (
              <Button
                radius={40}
                color="solidBtn"
                loading={isRefetching}
                onClick={async () => {
                  await upsertQuestionAnswer(activeTab);
                  // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
                  //           await upsertFormInvitationCompletion({
                  //             variables: {
                  //               completion: getProgressBarPercentageForListing(),
                  //               invitationId,
                  //             },
                  //           });
                  //         }
                  removeWarning();
                  // Set saved state to true after successful save
                  setIsSaved(true);
                  postParentMessage(warpJustify(true, {
                    questionId: activeTab,
                    invitationId: invitationId,
                  }, false));
                }}
              >
                Justify
              </Button>
            )}
            {(userSession?.user?.role === AppRoles.Responder && statusEntry?.status === "Declined") && (
              <Button
                radius={40}
                color="solidBtn"
                loading={isRefetching}
                onClick={async () => {
                  await upsertQuestionAnswer(activeTab);
                  // if (userSession?.user?.role !== AppRoles.Responder && query?.mode === FormMode.Start) {
                  //           await upsertFormInvitationCompletion({
                  //             variables: {
                  //               completion: getProgressBarPercentageForListing(),
                  //               invitationId,
                  //             },
                  //           });
                  //         }
                  removeWarning();
                  // Set saved state to true after successful save
                  setIsSaved(true);
                  postParentMessage(warpJustify(true, {
                    questionId: activeTab,
                    invitationId: invitationId,
                  }, false));
                }}
              >
                Justify
              </Button>
            )}
            {(query?.mode === FormMode.Start || (query?.mode === FormMode.Review && isMaker) || (userSession?.user?.role === AppRoles.Responder)) && (
              <Button
                id="btnSave"
                disabled={(useFormFieldStore?.getState()?.isFormSubmitted === false) ? false : (statusEntry?.status === undefined || statusEntry?.status === "Accepted" || statusEntry?.status === "Re-Submitted") ? true : false}
                loading={NextPreviousloading || isRefetching ? true : false}
                radius={40}
                onClick={async (e: any) => {
                  saveBtn(e);
                }}
                color="solidBtn"
              >
                {isSaved ? "Saved" : "Save"}
              </Button>
            )}

            {isDevelopmentMode && (
              <Button
                radius={40}
                color="outlineBtn"
                onClick={() => {
                  console.log("allStoreValue", {
                    formFieldStore: useFormFieldStore?.getState(),
                    warninglogStore: useWarningMessageStore.getState(),
                    groupWizardStore: useGroupWizardStore.getState(),
                    currentQuestion: currentWizard?.question,
                    Suggestion: useFormFieldStore?.getState()?.Suggestions,
                    Answer: useFormFieldStore?.getState()?.answer,
                    formField: formField,
                  });
                }}
              >
                Get Store
              </Button>
            )}
            {query?.mode !== FormMode.Review && (
              <Button
                radius={40}
                color="outlineBtn"
                onClick={() => {
                  if (IsPageRefreshed) {
                    setLocalStorageData(
                      window.localStorage,
                      "IsPageRefreshed",
                      "null",
                    );
                  }
                  postParentMessage(invitationFormCancelMessage());
                }}
              >
                Cancel
              </Button>
            )}

            {(query?.mode === FormMode.View ||
              query?.mode === FormMode.ViewRecommendation) &&
              !!questionrecomm &&
              questionrecomm.length > 0 &&
              !!FormHasRecommendation &&
              FormHasRecommendation?.length > 0 && (
                <>
                  <Button
                    radius={40}
                    color="outlineBtn"
                    disabled={isFirstRecomm}
                    hidden={isFirstRecomm}
                    onClick={() => prevRecommendation()}
                  >
                    Previous Recommendation
                  </Button>
                  <Button
                    radius={40}
                    disabled={isLastRecomm}
                    hidden={isLastRecomm}
                    onClick={() => nextRecommendation()}
                    color="outlineBtn"
                  >
                    Next Recommendation
                  </Button>
                </>
              )}
          </Group>
          <Group mt={20} pr={30}>
            {IsApprove &&
              FormSubmissionsStatus &&
              FormSubmissionsStatus?.status === "Submitted" ? (
              InviterAutoAppoverRecord &&
                InviterAutoAppoverRecord[0]?.IsAutoApprove === false ? (
                <Button
                  // style={{
                  //   borderRadius: "20px",
                  //   backgroundColor: "#ff9e1b",
                  // }}
                  onClick={() => ApproveFormInvitationStatus()}
                  color="solidBtn"
                >
                  Approve
                </Button>
              ) : (
                <></>
              )
            ) : (
              <></>
            )}
            {query?.mode !== FormMode.View &&
              query?.mode !== FormMode.ViewRecommendation &&
              userSession?.user?.role === AppRoles.Approver && (
                <Button
                  id="btnSubmit"
                  radius={40}
                  onClick={() => {
                    if (IsPageRefreshed) {
                      setLocalStorageData(
                        window.localStorage,
                        "IsPageRefreshed",
                        "null",
                      );
                    }
                    const WarningData1 =
                      useWarningMessageStore.getState().WarningRuleFields;
                    if (!!WarningData1[0]?.isWarningRule) {
                      // postParentMessage(
                      //   warpWarningmessage(
                      //     WarningData1[0]?.warningmessage,
                      //     "submit"
                      //   )
                      // );
                      if (WarningData1[0]?.isFileUpload) {
                        postParentMessage(
                          raraAlertPopup(
                            WarningData1[0]?.warningmessage,
                            "submit",
                          ),
                        );
                      } else {
                        postParentMessage(
                          warpWarningmessage(
                            WarningData1[0]?.warningmessage,
                            "submit",
                          ),
                        );
                      }
                      return false;
                    } else {
                      scrollToTop();
                      SubmitDetails(activeTab, setLoading, loading);
                      //remove warning log if recorded

                      if (WarningData1.length > 0) {
                        let data = WarningData.filter(
                          (x: any) => x.ispopupmessageremoved === true,
                        );
                        if (data.length > 0) {
                          data.map((item: any) => {
                            UpdateValidationWarningLogsMutation({
                              variables: {
                                formfieldId: item?.formfieldid,
                                invitationId: invitationId,
                              },
                            });
                          });
                        }
                      }
                      //remove warning log if recorded
                    }
                  }}
                  color="solidBtn"
                >
                  Approve
                </Button>
              )}
            {query?.mode !== FormMode.View &&
              query?.mode !== FormMode.ViewRecommendation &&
              query?.mode !== FormMode.Review &&
              userSession?.user?.role != AppRoles.Approver &&
              !!formType && (
                <Button
                  id="btnSubmit"
                  radius={40}
                  disabled={!allRequiredAnswered}
                  onClick={() => {
                    if (IsPageRefreshed) {
                      setLocalStorageData(
                        window.localStorage,
                        "IsPageRefreshed",
                        "null",
                      );
                    }
                    const WarningData1 =
                      useWarningMessageStore.getState().WarningRuleFields;
                    if (!!WarningData1[0]?.isWarningRule) {
                      if (WarningData1[0]?.isFileUpload) {
                        postParentMessage(
                          raraAlertPopup(
                            WarningData1[0]?.warningmessage,
                            "submit",
                          ),
                        );
                      } else {
                        postParentMessage(
                          warpWarningmessage(
                            WarningData1[0]?.warningmessage,
                            "submit",
                          ),
                        );
                      }
                      return false;
                    } else {
                      scrollToTop();
                      SubmitDetails(activeTab, setLoading, loading);
                      //remove warning log if recorded
                      if (WarningData1.length > 0) {
                        let data = WarningData.filter(
                          (x: any) => x.ispopupmessageremoved === true,
                        );
                        if (data.length > 0) {
                          data.map((item: any) => {
                            UpdateValidationWarningLogsMutation({
                              variables: {
                                formfieldId: item?.formfieldid,
                                invitationId: invitationId,
                              },
                            });
                          });
                        }
                      }
                      //remove warning log if recorded
                    }
                  }}
                  color="solidBtn"
                >
                  {userSession?.user?.role === AppRoles.Responder
                    ? "Submit Responses"
                    : formType === "Assessment"
                      ? "Submit Assessment"
                      : "Submit Report"}
                </Button>
              )}
          </Group>
        </Flex>
        {query?.mode === FormMode.Start && formType && (
          <Text
            fz={12}
            c="#FC8F00"
            bg="#FFF9EF"
            px={10}
            py={5}
            style={{
              width: "max-content",
              borderRadius: "5px",
              border: "1px solid #FC8F00",
            }}
          >
            <b>Note:</b> To save your response, click <b>&apos;Save&apos;</b>
            {!isFirst && (
              <>
                {isLast ? " or " : ", "}
                <b>&apos;Prev&apos;</b>
              </>
            )}
            {!isLast && (
              <>
                {" "}
                or <b>&apos;Next&apos;</b>
              </>
            )}{" "}
            . The{" "}
            <b>
              &apos;
              {userSession?.user?.role === AppRoles.Responder
                ? "Submit Responses"
                : formType === "Assessment"
                  ? "Submit Assessment"
                  : "Submit Report"}
              &apos;
            </b>{" "}
            button enables once all mandatory responses are answered and saved.
          </Text>
        )}

        {/* Reviewer Note */}
        {isReviewer && (
          <Box pr={30} mt={10}>
            <Stack gap={10}>
              <Box>
                <Text
                  fz={12}
                  c="#FC8F00"
                  bg="#FFF9EF"
                  px={10}
                  py={5}
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                    border: "1px solid #FC8F00",
                  }}
                >
                  <b>Note:</b> Review the maker&apos;s response and click <b>&apos;Accept&apos;</b> to approve or <b>&apos;Decline&apos;</b> to request changes. If declined, the maker can provide justification and re-submit.
                </Text>
              </Box>
            </Stack>
          </Box>
        )}
        {/* End Reviewer Note */}

        {/* Maker Note */}
        {isMaker && query?.mode === FormMode.Review && (
          <Box pr={30} mt={10}>
            <Stack gap={10}>
              <Box>
                <Text
                  fz={12}
                  c="#FC8F00"
                  bg="#FFF9EF"
                  px={10}
                  py={5}
                  style={{
                    width: "100%",
                    borderRadius: "5px",
                    border: "1px solid #FC8F00",
                  }}
                >
                  <b>Note:</b> Use <b>&apos;Prev&apos;</b> and <b>&apos;Next&apos;</b> to navigate through declined responses. Please click <b>&apos;Save&apos;</b> to update the response or <b>&apos;Justify&apos;</b> to explain why no change is required. Once <b>Saved/Justified</b>, the action cannot be reverted.
                </Text>
              </Box>
            </Stack>
          </Box>
        )}
        {/* End Maker Note */}
      </Stack>
      <Stack
        className="assessmentDetails-inner-right"
        align="center"
        justify="flex-start"
        p={0}
        bg={"#fff"}
        w="320px"
        style={{
          borderRadius: "10px",
          borderColor: "1px solid #99A7AD4D",
        }}
      >
        <Stack className="assessmentDetails-tab-stack">
          {(userSession?.user?.role === AppRoles.Inviter && !!isSelf && !reviewerDetails && !useFormFieldStore?.getState()?.isFormSubmitted) || (isExternalMaker && !reviewerDetails && !useFormFieldStore?.getState()?.isFormSubmitted) ? (
            <Text
              bg="#C0EFEC"
              c="#454545"
              ta="center"
              py={10}
              w="100%"
              fz={13}
              fw={500}
              style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
            >
              Do you want to Assign Reviewer?{" "}
              <Anchor
                component="button"
                fz={13}
                style={{ color: "#396CDB", fontWeight: 600 }}
                onClick={() => {
                  postParentMessage(warpAssignReviewer(true, formDetails));
                }}
              >
                Click Here
              </Anchor>
            </Text>
          ) : userSession?.user?.role === AppRoles.Inviter && !!isSelf && reviewerDetails ? (
            <Text
              bg="#C0EFEC"
              c="#454545"
              ta="center"
              py={10}
              w="100%"
              fz={13}
              fw={500}
              style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
            >
              <b>Reviewer:</b> {reviewerDetails.name}
            </Text>
          ) : (reviewerDetails) ? (<Text
            bg="#C0EFEC"
            c="#454545"
            ta="center"
            py={10}
            w="100%"
            fz={13}
            fw={500}
            style={{ borderTopLeftRadius: 10, borderTopRightRadius: 10 }}
          >
            <b>Reviewer:</b> {reviewerDetails.name}
          </Text>) : null}
          <Box
            style={{
              padding: isEdge ? "19px" : "18px",
              background: "#fff",
              borderRadius: "10px"
            }}
          >
            <Title
              ta="center"
              mb={8.3}
              lh="15.22px"
              fw={500}
              fz={12}
            >
              {getProgressBarPercentage()} % Completed
            </Title>
            <Progress
              radius="md"
              size={6}
              value={parseInt(getProgressBarPercentage())}
              styles={{
                section: {
                  background:
                    "linear-gradient(90deg, #84D8D2 0%, #1C9689 100%)",
                },
              }}
            />
            {/* <Text color="teal" weight="500">
              Jump to
            </Text>
            <Divider mt={5} mb={5} color="#DAF2EF" />  */}
            <Group gap={5} mt={15} mb={15}>
              {/* // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                  Display 'Suggestions' if
                  1. AI Users with AI Capabilities
                  2. Non-AI Users with Carry Forward as Suggestions enabled
               */}
              {useFormFieldStore?.getState()?.isAIDataPointsAdded &&
                (hasAnyAICapabilities ||
                  formInvitation?.interimCheck
                    ?.isCarryForwardAsSuggestionsInvitation) ? (
                <Group align="center" gap={6} mr={10}>
                  <IconCircle
                    fill="#005C81"
                    style={{ stroke: "#fff" }}
                    size={11}
                  />
                  <Text fz={10} fw={400}>
                    AI Suggestions
                  </Text>
                </Group>
              ) : (
                <></>
              )}



              {query?.mode === FormMode.Review || (query?.mode === FormMode.View && useFormFieldStore?.getState()?.isFormSubmitted && (isMaker || isReviewer)) ?
                <>
                  <Group align="center" gap={6}>
                    {/* Maker Checker Accepted Status */}
                    <IconCircle
                      fill="#25D140B2"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Accepted
                    </Text>
                  </Group>
                  <Group align="center" gap={6}>
                    {/* Maker Checker Pending Approval Status */}
                    <IconCircle
                      fill="#FFA93C"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Pending For Approval
                    </Text>
                  </Group>
                  <Group align="center" gap={6}>
                    <IconCircle
                      fill="#E73232"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Declined
                    </Text>
                  </Group>

                  {/* Resubmitted Status */}
                  <Group align="center" gap={6}>
                    {/* Maker Checker Declined Status */}
                    <IconCircle
                      fill="#038FC7"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Resubmitted
                    </Text>
                  </Group>
                  <Group align="center" gap={6}>
                    {/* Maker Checker Unfilled Status */}
                    <IconCircle
                      fill="#ffffff"
                      style={{
                        stroke: "#fff",
                        border: "0.5px solid #B7B7B7",
                        borderRadius: "50%",
                      }}
                      size={8}
                    />
                    <Text fz={10} fw={400}>
                      Unfilled
                    </Text>
                  </Group>
                  <Group align="center" gap={6}>
                    <IconCircle
                      fill="#000000"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Active
                    </Text>
                  </Group>
                </>
                :
                <>
                  <Group align="center" gap={2} mr={10}>
                    <IconCircle
                      fill="#25D140"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Filled
                    </Text>
                  </Group>

                  <Group align="center" gap={6} mr={10}>
                    <IconCircle
                      fill="#000000"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Active
                    </Text>
                  </Group>
                  <Group align="center" gap={6} mr={10}>
                    <IconCircle
                      fill="#BBBABA"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Partially Filled
                    </Text>
                  </Group>
                  <Group align="center" gap={6} mr={10}>
                    <IconCircle
                      fill="#E73232"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Mandatory
                    </Text>
                  </Group>
                  <Group align="center" gap={6}>
                    {/* Maker Checker Unfilled Status */}
                    <IconCircle
                      fill="#ffffff"
                      style={{
                        stroke: "#fff",
                        border: "0.5px solid #B7B7B7",
                        borderRadius: "50%",
                      }}
                      size={8}
                    />
                    <Text fz={10} fw={400}>
                      Unfilled
                    </Text>
                  </Group>
                </>
              }

              {(userSession?.user?.role === AppRoles.Invitee ||
                (userSession?.user?.role === AppRoles.Inviter &&
                  isSelf &&
                  !SelfAssessmentDisabled)) &&
                isDelegateQuestion && (
                  <Group align="center" gap={6}>
                    <IconCircle
                      fill="#B765EA"
                      style={{ stroke: "#fff" }}
                      size={11}
                    />
                    <Text fz={10} fw={400}>
                      Assigned
                    </Text>
                  </Group>
                )}
            </Group>

            <Box
              style={{
                maxHeight: "415px",
                overflowY: "auto",
                marginRight: -18,
                paddingRight: 18,
              }}
            >
              {memoizedAccordion}
            </Box>
          </Box>
        </Stack>
      </Stack>
    </Flex>
  );
};
export default GroupTab;
