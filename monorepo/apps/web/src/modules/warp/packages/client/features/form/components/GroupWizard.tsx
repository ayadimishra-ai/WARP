import { Box, Button, Group, Tabs } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { useBulkInsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-answer";
import { useBulkInsertInterimAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-intrim-answer";
import { useBulkUpdateInterimRecommendationByInterimAnswerIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-interim-recommendation";
import { useBulkUpdateSuggestionsMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-suggestions";
import { useUpdateAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-answer";
import { useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-interim-answer-by-question-id-and-submission-id";
import { useUpsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/upsert-answer";
import { useGetAnswerByQuestionIdAndSubmissionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answer-by-questionid-and-submissionid";
import { useGetAnswersByIdsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answers-by-ids";
import { useGetassesseeuserbyinvitationIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-assesseeuser-by-invitationid";
import { useGetFormFieldsByQuestionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-fields-by-question-id";
import { useGetInvitationAndSubmissionDetailsByInvitationIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-and-submission-details-by-invitation-id";
import { useGetinvitationstatusandreopenlistLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-status-and-reopen-list";
import { useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-recomendation-by-submissionId-and-formfieldId";
import { FormMode } from "@/modules/warp/packages/shared/constants/app.constants";
import { getLocalStorageData } from "@/modules/warp/packages/shared/utils/auth-session.util";
import { sortBy } from "lodash";
import { useParams } from "next/navigation";
import { memo, useEffect, useState } from "react";
import { useUserSession } from "../../../hooks/use-user-session";
import { setAnswersData } from "../common-functions";
import { useGroupWizardStore } from "../group-wizard.store";
import {
  getAnswersByQuestionId,
  getFormFieldStoreState,
  selectField,
  useFormFieldStore,
} from "../store";
import { FormFieldControl, GroupWizardPropsType } from "../types";
const useStyles = createStyles((theme) => ({
  fullWidth: {
    alignSelf: "stretch",
  },
  group: {
    display: "flex",
    gap: "10px",
    flexWrap: "wrap",
  },
  tabsList: {
    gap: "0",
    borderTop: "1px solid",
    borderBottom: "1px solid",
    borderColor: theme.colors.gray[4],
    paddingLeft: "20px",
    paddingRight: "20px",
  },
  template2QuestionSuccess: {
    background: theme?.colors?.questionSucces?.[0],
    height: "33px",
    "&:hover": {
      background: theme?.colors?.questionSucces?.[0],
      borderBottom: "3px solid " + theme.colors.teal[7],
      transition: "0.2s all",
    },
  },
  template2QuestionWarning: {
    background: theme?.colors?.questionWarning?.[0],
    height: "33px",
    "&:hover": {
      background: theme?.colors?.questionWarning?.[0],
      borderBottom: "3px solid " + theme.colors.orange[5],
      transition: "0.2s all",
    },
  },
  template1Tabs: {
    flexGrow: 1,
    fontWeight: 700,
    fontSize: "15px",
    padding: "6px 0",
  },
  activeTabs: {
    color: "#fff !important",
    backgroundColor: "#1C9689 !important",
  },
  nonActiveTabs: {
    color: "#878787 !important",
  },
  successTabs: {
    color: "#878787",
  },
}));

const GroupWizard: FormFieldControl<
  "group-wizard",
  Pick<GroupWizardPropsType, "steps">
> = ({ formField, steps }) => {
  // console.log("render", "GroupWizard");
  const query = useParams<{ invitationId: string; mode: string }>();
  const IsPageRefreshed: any | null = getLocalStorageData(
    window.localStorage,
    "IsPageRefreshed"
  );
  // Narrow store subscription: only `formId` is consumed below — subscribing
  // to the whole store re-rendered the wizard on every keystroke.
  const chkStoreFormId = useFormFieldStore((store) => store.formId);
  const userSession = useUserSession();

  const wizardSteps = sortBy(formField.children, [
    (field: any) => Number(field.seqIndex),
  ]);

  const wizardStepTabs = wizardSteps
    .map((m) =>
      !m.children ? null : { tab: m.children[0], stepField: m.field }
    )
    .filter((m) => !!m);

  const wizardStepTabQuestions = wizardStepTabs.flatMap((m) =>
    sortBy(m?.tab?.children, [(field: any) => Number(field.seqIndex)]).map(
      (q) => ({
        key: q.id,
        title: q.interfaceOptions?.title,
        questionId: q.Question?.id,
        section: m?.stepField ?? "",
        color: false,
        partialStatus: false,
        isRequired: false,
        type: q.type,
        sectionId: q.Section?.id,
      })
    )
  );
  const getAnswerByQuestionResult =
    useGetAnswerByQuestionIdAndSubmissionIdLazyQuery()[0];
  const insertBulkAnswer = useBulkInsertAnswerMutation()[0];
  const getAnswersByIds = useGetAnswersByIdsLazyQuery()[0];
  const updateSuggestionData = useBulkUpdateSuggestionsMutation()[0];
  const _sections = wizardSteps.map((step, index) => ({
    index,
    key: step.field,
    title: step.interfaceOptions.title,
  }));
  const _questions = [...wizardStepTabQuestions];
  const _questionsFilter = _questions.filter((x) => x.type !== "sub-theme");
  // console.log("Wizard", {
  //   wizardSteps,
  //   wizardStepTabs,
  //   wizardStepTabQuestions,
  //   _sections,
  //   _questions,
  // });

  const { interfaceOptions, fieldOptions } = useFormFieldStore((store) =>
    selectField<"group-wizard">(store, formField.field)
  );
  const currentWizard = useGroupWizardStore((store) => store.current);
  const questions = useGroupWizardStore((store) => store.questions);

  const { classes } = useStyles();
  let sectionId: any =
    questions.filter((d) => d.questionId === IsPageRefreshed)[0]?.section ||
    steps[0]?.key;

  const [activeTab, setActiveTab] = useState<string | null>(sectionId);

  let _questionId: any = IsPageRefreshed || "";

  const init = useGroupWizardStore((store) => store.init);

  const sectionHandler = useGroupWizardStore((store) => store.sectionHandler);
  const setAssignedUser = useGroupWizardStore((store) => store.setAssignedUser);

  /*
   * CENTRALIZED DATA FETCHING OPTIMIZATION
   * Fetching all global data required by child components (DisplayLabel, AddCommentButton, etc.)
   * This prevents hundreds of duplicate queries when rendering form fields.
   */

  const setGlobalData = useGroupWizardStore((store) => store.setGlobalData);

  // 2. Fetch Invitation Details (for AddCommentButton status checks)
  const [fetchInvitationDetails, { data: invitationDetailsData }] =
    useGetInvitationAndSubmissionDetailsByInvitationIdLazyQuery({
      fetchPolicy: "cache-first",
    });

  // 3. Fetch Assessee Mappings (for AddCommentButton visibility)
  const [fetchAssesseeMappings, { data: assesseeMappingsData }] =
    useGetassesseeuserbyinvitationIdLazyQuery({
      fetchPolicy: "cache-first",
    });

  // 4. Fetch Reopen Details (for Reopen button)
  const [fetchReopenDetails, { data: reopenDetailsData }] =
    useGetinvitationstatusandreopenlistLazyQuery({
      fetchPolicy: "cache-first",
    });

  // Effect to sync fetched data to store
  useEffect(() => {
    const updates: any = {};
    if (invitationDetailsData)
      updates.invitationDetails = invitationDetailsData;
    if (assesseeMappingsData?.AssesseeUserMapping)
      updates.assesseeMappings = assesseeMappingsData.AssesseeUserMapping;
    if (reopenDetailsData) updates.reopenDetails = reopenDetailsData;

    if (Object.keys(updates).length > 0) {
      setGlobalData(updates);
    }
  }, [
    invitationDetailsData,
    assesseeMappingsData,
    reopenDetailsData,
    setGlobalData,
  ]);

  // Trigger fetches on mount
  useEffect(() => {
    if (query?.invitationId) {
      fetchInvitationDetails({
        variables: { 
          invitationId: query.invitationId,
          includeAllSections: false
        },
      });
      fetchAssesseeMappings({
        variables: { invitationId: query.invitationId },
      });
      fetchReopenDetails({
        variables: { invitationId: query.invitationId, type: "CommentsAccess" },
      });
    }
  }, [
    query?.invitationId,
    fetchInvitationDetails,
    fetchAssesseeMappings,
    fetchReopenDetails,
  ]);

  useEffect(() => {
    init(_sections, _questionsFilter, _questionId, sectionId);
  }, [_sections, _questionsFilter, _questionId, sectionId]);

  useEffect(() => {
    if (IsPageRefreshed) {
      setActiveTab(
        questions.filter((d) => d.questionId === IsPageRefreshed)[0]?.section
      );
    } else if (currentWizard?.section) setActiveTab(currentWizard?.section);
  }, [currentWizard?.section, IsPageRefreshed, questions]);
  //console.log("activeTab", activeTab)
  const classNames =
    interfaceOptions?.template === "wizard1"
      ? {
          tab: classes.template2QuestionSuccess,
          tabsList: classes.tabsList,
        }
      : {
          tab: classes.template1Tabs,
          tabsList: "",
        };

  const [loading, setLoading] = useState(false);
  const upsertAnswer = useUpsertAnswerMutation()[0];
  const updateAnswer = useUpdateAnswerMutation()[0];
  const updateInterimAnswer =
    useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation()[0];
  const insertInterimAnsweronUpdate = useBulkInsertInterimAnswerMutation()[0];
  const updateRecommendation =
    useBulkUpdateInterimRecommendationByInterimAnswerIdMutation()[0];
  const getFormFieldsDetail = useGetFormFieldsByQuestionIdLazyQuery()[0];
  const getFormfieldRecommendation =
    useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery()[0];
  const upsertQuestionAnswer = async (formFieldId: string) => {
    if (loading) return false;
    setLoading(true);
    const _formField = getFormFieldStoreState().formFields.find(
      (m: any) => m.Question?.id === formFieldId
    );

    const questionId = _formField?.Question?.id;
    const submissionId = getFormFieldStoreState().formSubmissionId;

    if (!submissionId) {
      //alert("Invalid submission id");
      setLoading(false);

      return;
    }

    if (!questionId) {
      //alert("Invalid question id");
      setLoading(false);
      return;
    }

    const { data, error } = await getAnswerByQuestionResult({
      variables: {
        questionId: questionId,
        submissionId: submissionId,
      },
    });
    const answers = getAnswersByQuestionId(questionId);
    // console.log({ answers });

    // No answer found
    if (!answers?.length) {
      setLoading(false);
      return;
    }

    setLoading(true);
    await setAnswersData(
      data,
      submissionId,
      answers,
      answers,
      questionId,
      userSession?.user?.id,
      useFormFieldStore?.getState()?.answer,
      String(chkStoreFormId),
      String(query?.invitationId),
      "GroupWizard",
      "",
      formField?.id,
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
      userSession
    );

    // console.log({ result });

    setLoading(false);
    return true;
  };
  const tabChange = async (rec: any) => {
    setLoading(true);
    if (!!currentWizard.question && query?.mode === FormMode.Start) {
      await upsertQuestionAnswer(currentWizard.question);
    }
    sectionHandler(rec);
    setActiveTab(rec);
    setLoading(false);
  };

  const getTabColor = (key: string) => {
    let sectionColor: boolean = true;
    questions?.map((m) => {
      if (m.section === key && m.color === false) {
        sectionColor = false;
        return;
      }
    });
    //console.log({ questions_wizard: questions });
    return sectionColor;
  };

  return (
    <Box>
      {/* <LoadingOverlay
        style={{ minHeight: window.innerHeight, height: "100%" }}
        visible={loading}
      /> */}
      <Spinner visible={loading} />
      <Tabs
        variant={interfaceOptions?.template === "wizard1" ? "pills" : "pills"}
        radius="xs"
        color="gray.0"
        value={activeTab}
        onChange={tabChange}
        defaultValue={steps[0].key}
        classNames={classNames}
        keepMounted={false}
      >
        {/* <Tabs.List style={{ gap: 0, height: 0 }}>
          {steps?.map((step, i) => (
            <Tabs.Tab
              style={{
                zIndex: 99,
                whiteSpace: "nowrap",
                background: "#ffff",
                borderRadius: "10px 10px 0 0",
                padding: "12px 18px",
                flex: 0,
                fontWeight: 600,
              }}
              key={step.key}
              disabled={fieldOptions?.readonly}
              value={step.key}
              className={
                activeTab === step.key
                  ? classes.activeTabs + " main_tabs " + step.key
                  : getTabColor(step.key)
                  ? classes.successTabs + " main_tabs " + step.key
                  : classes.nonActiveTabs + " main_tabs " + step.key
              }
              rightSection={
                step.infoIconProps ? (
                  <></>
                ) : (
                  // <Box
                  //   style={{
                  //     color: "#424242",
                  //     fontSize: "11px",
                  //     fontWeight: 500,
                  //     lineHeight: 1.5,
                  //   }}
                  // >
                  //   <Info infoIconProps={step.infoIconProps} />
                  // </Box>
                  ""
                )
              }
            >
              {step.title}
            </Tabs.Tab>
          ))}
        </Tabs.List> */}

        {steps?.map((step, index) => (
          <Tabs.Panel
            key={step.key}
            style={{
              // borderTop: "12px solid #1C9689",
              borderRadius: "10px",
              borderTopLeftRadius: activeTab === "s1_step" ? "0" : "10px",
              background: "#F7F9FB",
              position: "relative",
              top: 0,
              zIndex: 99,
              // height: "45vh",
              height: "100vh",
            }}
            value={step.key}
            className={step.key + "_panel"}
          >
            {step.component}
            {interfaceOptions?.showControls && (
              <Group mt={20}>
                <Button
                  color="dark.3"
                  onClick={() => setActiveTab(index.toString())}
                  variant="outline"
                >
                  Prev
                </Button>
                <Button
                  color="orange.5"
                  onClick={() => setActiveTab((index + 2).toString())}
                >
                  Next
                </Button>
              </Group>
            )}
          </Tabs.Panel>
        ))}
      </Tabs>
    </Box>
  );
};
export default memo(GroupWizard);