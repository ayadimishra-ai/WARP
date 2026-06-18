import { ActionIcon, Box, Tooltip } from "@mantine/core";
import RaiseRespondQueryIcon from "@/modules/warp/packages/client/components/svgIcons/Raise&RespondQueryIcon";
import { warpShowComment } from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useBulkInsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-answer";
import { useBulkInsertInterimAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-intrim-answer";
import { useBulkUpdateSuggestionsMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-suggestions";
import { useUpdateAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-answer";
import { useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-interim-answer-by-question-id-and-submission-id";
import { useUpsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/upsert-answer";
import { useGetAnswerByQuestionIdAndSubmissionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answer-by-questionid-and-submissionid";
import { useGetAnswersByIdsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answers-by-ids";
import { useGetassesseeuserbyinvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-assesseeuser-by-invitationid";
import { useGetInvitationAndSubmissionDetailsByInvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-and-submission-details-by-invitation-id";
import { useGetinvitationstatusandreopenlistQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-status-and-reopen-list";
import { AppRoles, FormMode } from "@/modules/warp/packages/shared/constants/app.constants";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { useParams, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useUserSession } from "../../../hooks/use-user-session";
import { setAnswersData } from "../common-functions";
import {
  getAnswersByQuestionId,
  getFormFieldStoreState,
  useFormFieldStore,
} from "../store";
const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");
type Props = {
  formField: any;
};
const openCommentPopup = (
  formFieldId: any,
  fieldcommentscount: any,
  questionId: any
) => {
  let variables = warpShowComment(
    true,
    formFieldId,
    fieldcommentscount,
    questionId
  );
  postParentMessage(variables);
};
const invitationStatuses: string[] = ["Submitted", "Approved"];
const AddCommentButton = ({ formField }: Props) => {
  const userSession = useUserSession();
  let session: any = "";
  const query = useParams<{ invitationId: string; mode: string }>();
  const searchParams = useSearchParams();
  const invitationId = query?.invitationId || searchParams?.get('invitationId');
  const mode = query?.mode || searchParams?.get('mode');
  const accessToken = searchParams?.get('accessToken');
  const decodedToken: any = jwt.decode(String(accessToken));
  session = parseHasuraClaims(decodedToken, String(accessToken));
  const [loading, setLoading] = useState(false);
  const updateSuggestionData = useBulkUpdateSuggestionsMutation()[0];
  const getAnswerByQuestionResult =
    useGetAnswerByQuestionIdAndSubmissionIdLazyQuery()[0];
  const upsertAnswer = useUpsertAnswerMutation()[0];
  const updateAnswer = useUpdateAnswerMutation()[0];
  const insertBulkAnswer = useBulkInsertAnswerMutation()[0];
  const getAnswersByIds = useGetAnswersByIdsLazyQuery()[0];
  const updateInterimAnswer =
    useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation()[0];
  const insertInterimAnsweronUpdate = useBulkInsertInterimAnswerMutation()[0];
  useEffect(() => {
    window.addEventListener("message", (event: any) => {
      event.preventDefault();
      let messageData: any;
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "snowkap-isRefreshPage") {
            if (mode === FormMode.Start) {
              upsertQuestionAnswer(formField?.Question?.id);
            }

            return;
          }
        } catch (error) { }
      }
    });
  }, []);

  const Approverandinvitationdata = useGetinvitationstatusandreopenlistQuery({
    variables: {
      invitationId: invitationId,
      type: "CommentsAccess",
    },
  });

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
  const formInvitation = invitationAndSubmissionQueryResult?.FormInvitation[0];
  const isSelf =
    formInvitation?.ParentCompanyMapping?.UserId === userSession?.user?.id;

  const assesseeUserLength =
    AssesseeUserMappingQueryResult?.AssesseeUserMapping.filter(
      (user: any) => user.questionId === formField?.Question?.id
    ) || [];

  let showaddquery = false;
  if (
    userSession?.user?.role &&
    (userSession.user.role !== AppRoles.Inviter ||
      assesseeUserLength.length > 0 ||
      (formInvitation && !isSelf) ||
      (formField?.InvitationComments_aggregate?.aggregate?.count ?? 0) > 0 ||
      (typeof window !== "undefined" && window.location.pathname.includes("CommentWithQuestionPopup")))
  ) {
    showaddquery = true;
  }
  let isReopenEnable: boolean = false;
  if (
    Approverandinvitationdata?.data?.GlobalMaster[0].data?.filter(
      (x: any) =>
        x.formId == Approverandinvitationdata?.data?.FormInvitation[0].formId &&
        x.companyId ==
        Approverandinvitationdata?.data?.FormInvitation[0]
          .companyByParentcompanyid?.id &&
        x.IsEnable == true
    ).length > 0
  ) {
    isReopenEnable =
      Approverandinvitationdata?.data?.GlobalMaster[0].data?.filter(
        (x: any) =>
          x.formId ==
          Approverandinvitationdata?.data?.FormInvitation[0].formId &&
          x.companyId ==
          Approverandinvitationdata?.data?.FormInvitation[0]
            .companyByParentcompanyid?.id &&
          x.IsEnable == true
      )[0].IsReopeningEnabled;
  }
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
    const answers = getAnswersByQuestionId(questionId);
    // No answer found
    if (!answers?.length) {
      //setLoading(false);
      setTimeout(() => {
        setLoading(false);
      }, 2000);
      return;
    }
    const { data, error } = await getAnswerByQuestionResult({
      variables: {
        questionId: questionId,
        submissionId: submissionId,
      },
    });
    await setAnswersData(
      data,
      submissionId,
      answers,
      answers,
      formField?.Question?.id,
      userSession?.user?.id,
      null,
      formField?.formId,
      String(invitationId),
      "AddComment",
      "",
      formField?.id,
      null,
      null,
      upsertAnswer,
      updateAnswer,
      updateInterimAnswer,
      insertInterimAnsweronUpdate,
      getAnswersByIds,
      insertBulkAnswer,
      null,
      updateSuggestionData,
      useFormFieldStore?.getState()?.Suggestions,
      userSession,
      mode
    );


    // console.log({ result });
    setLoading(false);
    return true;
  };
  const clickHandler = async (event: any) => {
    if (mode === FormMode.Start) {
      await upsertQuestionAnswer(formField?.Question?.id);
    }
    openCommentPopup(
      formField?.id,
      formField?.InvitationComments_aggregate?.aggregate?.count,
      formField?.Question?.id
    );
  };
  return formField?.interfaceOptions?.isAddcomment == true && showaddquery ? (
    <Box>
      {session?.user?.role == "Approver" ||
        session?.user?.role == "Inviter" ||
        session?.user?.role == "Consultant" ? (
        Approverandinvitationdata?.data?.FormInvitation[0].status ==
          "Submitted" ? (
          // listingData.length == 0 ? (
          isReopenEnable ? (
            <ActionIcon
              variant="transparent"
              // onClick={(e) => CommonModalHandler(e)}
              onClick={clickHandler}
              disabled={false}
              style={{ pointerEvents: "all" }}
            >
              <Tooltip
                offset={0}
                styles={{ arrow: { left: "10px !important" } }}
                position="bottom-start"
                label="Reopen Assessment"
              >
                <Box>
                  <RaiseRespondQueryIcon />
                </Box>
              </Tooltip>
            </ActionIcon>
          ) : formField?.InvitationComments_aggregate?.aggregate?.count == 0 ? (
            <ActionIcon
              variant="transparent"
              // onClick={(e) => CommonModalHandler(e)}
              onClick={clickHandler}
              disabled={false}
              style={{ pointerEvents: "all" }}
            >
              {session?.user?.role == "Inviter" ||
                session?.user?.role == "Consultant" ? (
                <Tooltip
                  offset={0}
                  styles={{ arrow: { left: "10px !important" } }}
                  position="bottom-start"
                  label="Respond to Queries/View Queries"
                >
                  <Box>
                    <RaiseRespondQueryIcon />
                  </Box>
                </Tooltip>
              ) : (
                <Tooltip
                  offset={0}
                  styles={{ arrow: { left: "10px !important" } }}
                  position="bottom-start"
                  label="Raise Queries/View Responses"
                >
                  <Box>
                    <RaiseRespondQueryIcon />
                  </Box>
                </Tooltip>
              )}
            </ActionIcon>
          ) : (
            <ActionIcon
              variant="transparent"
              disabled={false}
              onClick={clickHandler}
              style={{ pointerEvents: "all", height: 38, width: 38, marginTop: -5 }}
            >
              {session?.user?.role == "Inviter" ||
                session?.user?.role == "Consultant" ? (
                <Tooltip
                  offset={0}
                  styles={{ arrow: { left: "10px !important" } }}
                  position="bottom-start"
                  label="Respond to Queries/View Queries"
                >
                  <Box>
                    <RaiseRespondQueryIcon />
                  </Box>
                </Tooltip>
              ) : (
                <Tooltip
                  offset={0}
                  styles={{ arrow: { left: "10px !important" } }}
                  position="bottom-start"
                  label="Raise Queries/View Responses"
                >
                  <Box>
                    <RaiseRespondQueryIcon />
                  </Box>
                </Tooltip>
              )}
              {/* Comment Count STARTS */}
              <span className="commentCount">
                {formField?.InvitationComments_aggregate?.aggregate?.count > 9
                  ? formField?.InvitationComments_aggregate?.aggregate?.count
                  : "0" +
                  formField?.InvitationComments_aggregate?.aggregate?.count}
              </span>
              {/* Comment Count ENDS */}
            </ActionIcon>
          )
        ) : // ) : (
          //   <Box></Box>
          // )
          formField?.InvitationComments_aggregate?.aggregate?.count == 0 ? (
            <ActionIcon
              variant="transparent"
              // onClick={(e) => CommonModalHandler(e)}
              onClick={clickHandler}
              disabled={false}
              style={{ zIndex: 299, pointerEvents: "all" }}
            >
              {session?.user?.role == "Inviter" ||
                session?.user?.role == "Consultant" ? (
                <Tooltip
                  offset={0}
                  styles={{ arrow: { left: "10px !important" } }}
                  position="bottom-start"
                  label="Respond to Queries/View Queries"
                >
                  <Box>
                    <RaiseRespondQueryIcon />
                  </Box>
                </Tooltip>
              ) : (
                <Tooltip
                  offset={0}
                  styles={{ arrow: { left: "10px !important" } }}
                  position="bottom-start"
                  label="Raise Queries/View Responses"
                >
                  <Box>
                    <RaiseRespondQueryIcon />
                  </Box>
                </Tooltip>
              )}
            </ActionIcon>
          ) : (
            <ActionIcon
              variant="transparent"
              disabled={false}
              onClick={clickHandler}
              style={{ zIndex: 299, pointerEvents: "all", height: 38, width: 38, marginTop: -5 }}
            >
              {session?.user?.role == "Inviter" ||
                session?.user?.role == "Consultant" ? (
                <Tooltip
                  offset={0}
                  styles={{ arrow: { left: "10px !important" } }}
                  position="bottom-start"
                  label="Respond to Queries/View Queries"
                >
                  <Box>
                    <RaiseRespondQueryIcon />
                  </Box>
                </Tooltip>
              ) : (
                <Tooltip
                  offset={0}
                  styles={{ arrow: { left: "10px !important" } }}
                  position="bottom-start"
                  label="Raise Queries/View Responses"
                >
                  <Box>
                    <RaiseRespondQueryIcon />
                  </Box>
                </Tooltip>
              )}
              {/* Comment Count STARTS */}
              <span className="commentCount">
                {formField?.InvitationComments_aggregate?.aggregate?.count > 9
                  ? formField?.InvitationComments_aggregate?.aggregate?.count
                  : "0" +
                  formField?.InvitationComments_aggregate?.aggregate?.count}
              </span>
              {/* Comment Count ENDS */}
            </ActionIcon>
          )
      ) : formField?.InvitationComments_aggregate?.aggregate?.count == 0 ? (
        <ActionIcon
          variant="transparent"
          // onClick={(e) => CommonModalHandler(e)}
          onClick={clickHandler}
          disabled={false}
          style={{ zIndex: 299, pointerEvents: "all" }}
        >
          {session?.user?.role == "Inviter" ||
            session?.user?.role == "Consultant" ? (
            <Tooltip
              offset={0}
              styles={{ arrow: { left: "10px !important" } }}
              position="bottom-start"
              label="Respond to Queries/View Queries"
            >
              <Box>
                <RaiseRespondQueryIcon />
              </Box>
            </Tooltip>
          ) : (
            <Tooltip
              offset={0}
              styles={{ arrow: { left: "10px !important" } }}
              position="bottom-start"
              label="Raise Queries/View Responses"
            >
              <Box>
                <RaiseRespondQueryIcon />
              </Box>
            </Tooltip>
          )}
        </ActionIcon>
      ) : (
        <ActionIcon
          variant="transparent"
          disabled={false}
          onClick={clickHandler}
          style={{ zIndex: 299, pointerEvents: "all", height: 48, width: 38, marginTop: -9 }}
        >
          {session?.user?.role == "Inviter" ||
            session?.user?.role == "Consultant" ? (
            <Tooltip
              offset={0}
              styles={{ arrow: { left: "10px !important" } }}
              position="bottom-start"
              label="Respond to Queries/View Queries"
            >
              <Box>
                <RaiseRespondQueryIcon />
              </Box>
            </Tooltip>
          ) : (
            <Tooltip
              offset={0}
              styles={{ arrow: { left: "10px !important" } }}
              position="bottom-start"
              label="Raise Queries/View Responses"
            >
              <Box>
                <RaiseRespondQueryIcon />
              </Box>
            </Tooltip>
          )}
          {/* Comment Count STARTS */}
          <span className="commentCount">
            {formField?.InvitationComments_aggregate?.aggregate?.count > 9
              ? formField?.InvitationComments_aggregate?.aggregate?.count
              : "0" + formField?.InvitationComments_aggregate?.aggregate?.count}
          </span>
          {/* Comment Count ENDS */}
        </ActionIcon>
      )}
    </Box>
  ) : (
    <></>
  );
};
export default AddCommentButton;
