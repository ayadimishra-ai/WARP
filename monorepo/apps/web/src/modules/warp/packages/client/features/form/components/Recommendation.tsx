import {
  ActionIcon,
  Box,
  Button,
  FileInput,
  Group,
  Stack,
  Switch,
  Text,
  TextInput,
} from "@mantine/core";
import { IconSend } from "@tabler/icons-react";
import { useCaptchaValidationBeforeSubmit } from "@/modules/warp/packages/client/hooks/google-invisible-recaptcha";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import {
  refreshQuestionAfterComment,
  warpApprovedRecommendationMessage,
  warpWarningmessage,
} from "@/modules/warp/packages/client/services/platform-window-message.service";
import { useUpsertValidationWarningLogsMutation } from "@/modules/warp/packages/graphql/mutations/generated/Insert-validation-warning-logs";
import { useBulkInsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-answer";
import { useBulkInsertInterimAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-intrim-answer";
import { useBulkUpdateInterimRecommendationByInterimAnswerIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-interim-recommendation";
import { useBulkUpdateSuggestionsMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-suggestions";
import { useInsertIntoInterimCommentsMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-into-interim-comments";
import { useUpdateValidationWarningLogsMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-ValidationWarningLogs";
import { useUpdateAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-answer";
import { useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-interim-answer-by-question-id-and-submission-id";
import { useUpdateRecommendationStatusMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-recommendation-status";
import { useUpsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/upsert-answer";
import { useGetAnswerByQuestionIdAndSubmissionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answer-by-questionid-and-submissionid";
import { useGetAnswersByIdsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answers-by-ids";
import { useGetFormFieldsByQuestionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-fields-by-question-id";
import { useGetinterimcommentsbyrecommendidLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-interim-comments-by-recommendid";
import { useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-recomendation-by-submissionId-and-formfieldId";
import {
  AppRoles,
  FormInvitationStatus,
  FormMode,
  RecommendationStatus,
} from "@/modules/warp/packages/shared/constants/app.constants";
import {
  getLocalStorageData,
  setLocalStorageData,
} from "@/modules/warp/packages/shared/utils/auth-session.util";
import { sanitiseValuesByTypeOfData } from "@/modules/warp/packages/shared/utils/dom-purifier/dom-purify.client.util";
import dayjs from "dayjs";
import { useParams } from "next/navigation";
import { FC, useEffect, useRef, useState } from "react";
import { useFromFileUpload } from "../../../hooks/use-form-file-upload";
import UploadFileSvgIcon from "../../../icons/UploadFileSvgIcon";
import Spinner from "../../../layouts/Spinner";
import { setAnswersData, warninglogsave } from "../common-functions";
import { useReviewerContext } from "../reviewer-context";
import {
  getAnswersByQuestionId,
  useFormFieldStore,
  useWarningMessageStore,
} from "../store";
import { warningmessageObjectType } from "../types";
import classes from "./Recommendation.module.css";
import { FilevalidationErrorMessage } from "../validation.service";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");
const Recommendation: FC<{
  recommendations: any;
  formField: any;
  formStatus: any;
  isCarryForward: boolean;
  submissionId: any;
  invitationId: any;
  isViewOnly: boolean;
  companyId: any;
  queryMode: string;
}> = ({
  recommendations,
  formField,
  formStatus,
  isCarryForward,
  submissionId,
  invitationId,
  isViewOnly,
  companyId,
  queryMode,
}) => {
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  let recommendationStatus: string = recommendations?.[0]?.status;
  let recommendationOpenDate: Date = recommendations?.[0]?.created_at;
  let question_id = formField?.Question?.id;

  const { 
    isReviewer,
  } = useReviewerContext();

  console.log("isReviewer", isReviewer);

  const [recommendCommentData, setrecommendCommentData] = useState("");
  const { uploadFile } = useFromFileUpload();
  const [loading, setloading] = useState(true);
  const [fileerror, setfileerror] = useState("");
  const [fileToUpload, setfileToUpload] = useState<File | null>();
  const [showTextBox, setshowTextBox] = useState(false);
  const [commentsError, setCommentsError] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isDisabled, setIsDisabled] = useState(false);
  const isSubmittingRef = useRef(false);
  const query = useParams<{ invitationId: string; mode: string }>();
  const isViewMode = query?.mode === FormMode.View;
  const isRecommendViewMode = query?.mode === FormMode.ViewRecommendation;
  const WarningData = useWarningMessageStore.getState().WarningRuleFields;
  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });
  const removeWarning = useWarningMessageStore(
    (store) => store.removeWarningRuleFields
  );
  const userSession = useUserSession();
  const recommendationNewResponce: any =
    userSession?.GlobalMaster?.filter(
      (x: any) => x.type === "Recommendation_new"
    ) ?? [];
  const updateSuggestionData = useBulkUpdateSuggestionsMutation()[0];
  let isMannualApprove =
    recommendationNewResponce?.[0]?.data?.filter(
      (rec: any) => rec.FormId === formField?.formId
    )?.[0]?.IsManualApproverer ?? false;
  const [insertRecommendationComment, { loading: insertCommentsLoading }] =
    useInsertIntoInterimCommentsMutation();
  const [
    updateRecommendationStatus,
    { loading: updateRecommendationStatusloading },
  ] = useUpdateRecommendationStatusMutation();

  const [
    fetchrecommendCommentsData,
    { loading: recommendationCommentsLoading, data: commentdata },
  ] = useGetinterimcommentsbyrecommendidLazyQuery({
    variables: {
      recommendationId: recommendations?.[0]?.id,
    },
    fetchPolicy: "no-cache",
  });
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
  const getAnswerByQuestionResult =
    useGetAnswerByQuestionIdAndSubmissionIdLazyQuery()[0];
  const insertBulkAnswer = useBulkInsertAnswerMutation()[0];
  const getAnswersByIds = useGetAnswersByIdsLazyQuery()[0];
  useEffect(() => {
    fetchrecommendCommentsData();
    setloading(recommendationCommentsLoading);
  }, []);

  useWarningMessageStore.getState();
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");
  const UpsertValidationWarningLogsMutation =
    useUpsertValidationWarningLogsMutation()[0];

  const UpdateValidationWarningLogsMutation =
    useUpdateValidationWarningLogsMutation()[0];
  const WarningRulestore = useWarningMessageStore((store) => store);

  useEffect(() => {
    globalThis.addEventListener("message", async (event: any) => {
      event.preventDefault();
      let messageData: any;
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          const WarningData1 =
            useWarningMessageStore.getState().WarningRuleFields;
          if (type === "snowkap-warningmessage") {
            if (messageData.response === true) {
              const Iswarningmessagereceived = WarningData1?.[0]?.isWarningRule;
              const Reccomandation_questionid_new = WarningData1?.[0]?.questionid;
              const WarningRulestoreformfieldid = WarningData1?.[0]?.formfieldid;

              if (
                Iswarningmessagereceived === true &&
                Reccomandation_questionid_new === formField?.Question?.id
              ) {
                if (messageData.step === "addrecc") {
                  const recommendCommentData_check: any | null =
                    getLocalStorageData(
                      window.localStorage,
                      "recommendCommentData"
                    );
                  await warninglogsave(
                    queryMode,
                    invitationId,
                    UpsertValidationWarningLogsMutation,
                    userSession
                  );

                  // useWarningMessageStore.setState({
                  //   WarningRuleFields: [],
                  // });
                  removeWarning();
                  const buttonid = getLocalStorageData(
                    window.localStorage,
                    "buttonid"
                  );

                  setLocalStorageData(window.localStorage, "buttonid", "");
                  if (typeof window !== "undefined") {
                    window?.document?.getElementById(buttonid)?.click();
                  }
                  // Insertcomment();
                }
              }

              return;
            }
          }
        } catch (error) {}
      }
    });
  }, []);
  let fileerrors: any = "";
  const Insertcomment = async () => {
    if (isSubmittingRef.current) return;
    isSubmittingRef.current = true;
    try {
      setloading(true);
      let uploadedFileName: string = "";
      let uploadedFilePath: string = "";
      let fileResult: any = null;
      let commentStatus = "";
      let isApproved: boolean = false;
      setCommentsError("");
      let apiUrl: any = "";
      let apiType: any = "";
      let apiBody: any = {};
      const todayDate = new Date();
      const sessionPlatformId = userSession?.platform?.id;
      if (
        userSession?.user?.role === AppRoles.Inviter ||
        userSession?.user?.role === AppRoles.Consultant
      ) {
        apiUrl = "/warp/api/recommendation/email-when-a-recommendation-is-reopened";
        apiType = "RecommendationReopened";
        apiBody = {
          id: invitationId,
          questionId: formField?.Question?.id,
          type: apiType,
          companyId: companyId,
          formId: formField?.formId,
          recommendation: String(recommendations?.[0]?.recommendations).replace(
            "`",
            "'"
          ),
          comments: sanitiseValuesByTypeOfData(recommendCommentData),
          // dateandtime: dayjs(todayDate).format("DD MMM, YYYY"),
          dateandtime: dayjs(todayDate).format("DD MMM, YYYY HH:mm:ss"),
          platformId: sessionPlatformId,
          //platformId: await String(useUserSession()?.platform?.id)
        };
        commentStatus = RecommendationStatus.Reopened;
      } else if (
        userSession?.user?.role === AppRoles.Invitee ||
        userSession?.user?.role === AppRoles.Responder
      ) {
        apiUrl =
          "/warp/api/recommendation/email-after-actions-been-taken-by-the-portfolio-company-or-assessee";
        apiType = "RecommendationActionTaken";
        apiBody = {
          id: invitationId,
          type: apiType,
          companyId: companyId,
          formId: formField?.formId,
          recommendation: String(recommendations?.[0]?.recommendations).replace(
            "`",
            "'"
          ),
          comments: sanitiseValuesByTypeOfData(recommendCommentData),
          dateandtime: dayjs(todayDate).format("DD MMM, YYYY"),
          platformId: sessionPlatformId,
        };
        if (!!fileToUpload) {
          // setloading(true);
          fileResult = await uploadFile(fileToUpload, false, "recommendation");
          uploadedFileName = fileResult.name;
          uploadedFilePath = fileResult.path;
        }
        commentStatus = RecommendationStatus.PendingForApproval;
        if (isMannualApprove == false) {
          commentStatus = RecommendationStatus.Closed;
          isApproved = true;
        }
      }

      const recommendCommentData_check: any | null =
        recommendCommentData ||
        getLocalStorageData(window.localStorage, "recommendCommentData");
      const sanitiseRecommendationComment = sanitiseValuesByTypeOfData(
        recommendCommentData_check
      );
      if (
        !!sanitiseRecommendationComment &&
        sanitiseRecommendationComment.trim() !== ""
      ) {
        //if (recommendCommentData) {
        setCommentsError("");
        setLocalStorageData(window.localStorage, "recommendCommentData", "");
        // setloading(true);
        setIsDisabled(true);
        let commentsInserted = await insertRecommendationComment({
          variables: {
            interim_recommendation_id: recommendations?.[0]?.id,
            comments: sanitiseRecommendationComment,
            upload_document: uploadedFilePath,
            filename: uploadedFileName,
            userId: userSession?.user?.id,
            status: commentStatus,
            recommendationId: recommendations?.[0]?.id,
            isApproved: isApproved,
            invitationId: invitationId,
          },
        });
        if (
          commentsInserted?.data?.insert_Interim_Comments?.returning &&
          commentsInserted?.data?.insert_Interim_Comments?.returning.length > 0
        ) {
          if (apiUrl != "" && apiType != "") {
            const newRecommendationEmailResponse = await fetch(apiUrl, {
              method: "POST",
              headers: {
                "content-type": "application/json",
              },
              body: JSON.stringify(apiBody),
            });
          }
          setrecommendCommentData("");
          let recommendscommentdata = await fetchrecommendCommentsData({
            variables: {
              recommendationId: recommendations?.[0]?.id,
            },
            fetchPolicy: "no-cache",
          });
          const { data, error } = await getAnswerByQuestionResult({
            variables: {
              questionId: formField?.Question?.id,
              submissionId: submissionId,
            },
          });
          
          const answers = getAnswersByQuestionId(formField?.Question?.id);
          await setAnswersData(
            data,
            submissionId,
            answers,
            answers,
            formField?.Question?.id,
            userSession?.user?.id,
            useFormFieldStore?.getState()?.answer,
            formField?.formId,
            invitationId,
            "Recommendation",
            commentStatus,
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
            userSession,
            query?.mode
          );

          if (
            commentStatus == RecommendationStatus.PendingForApproval ||
            commentStatus == RecommendationStatus.Closed ||
            commentStatus == RecommendationStatus.Reopened
          ) {
            postParentMessage(
              refreshQuestionAfterComment(formField?.Question?.id)
            );
          }
          setloading(false);
        }
      } else {
        setloading(false);
        setrecommendCommentData("");
        setCommentsError("Comments is required.");
      }
    } catch (error) {
      setloading(false);
      console.log(error);
    } finally {
      isSubmittingRef.current = false;
    }
  };
  const updatestatus = async (Status: string) => {
    postParentMessage(warpApprovedRecommendationMessage(true));
    setloading(true);
    let statusupdate = await updateRecommendationStatus({
      variables: {
        recommendationId: recommendations?.[0]?.id,
        status: Status,
        isApproved: true,
      },
    });
    if (
      statusupdate?.data?.update_Interim_Recommendation?.affected_rows &&
      statusupdate?.data?.update_Interim_Recommendation?.affected_rows > 0
    ) {
      setloading(false);
      let recommendscommentdata = await fetchrecommendCommentsData({
        variables: {
          recommendationId: recommendations?.[0]?.id,
        },
        fetchPolicy: "no-cache",
      });
      setloading(false);
    }
    let commentStatus = "";
    setCommentsError("");
    let apiUrl: any = "";
    let apiType: any = "";
    let apiBody: any = {};
    const todayDate = new Date();
    if (
      userSession?.user?.role === AppRoles.Inviter ||
      userSession?.user?.role === AppRoles.Consultant
    ) {
      const sessionPlatformId = userSession?.platform?.id;
      apiUrl =
        "/warp/api/recommendation/email-when-the-actions-taken-on-the-recommendations-are-approved";
      apiType = "actionsapproved";
      apiBody = {
        id: invitationId,
        questionId: formField?.Question?.id,
        type: apiType,
        companyId: companyId,
        formId: formField?.formId,
        dateAndTime: dayjs(todayDate).format("DD MMM, YYYY"),
        platformId: sessionPlatformId,
      };
      if (apiUrl != "" && apiType != "") {
        const newRecommendationEmailActiontaken = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify(apiBody),
        });
      }
      commentStatus = RecommendationStatus.Closed;
    }
  };
  if (
    !!commentdata?.Interim_Comments &&
    commentdata?.Interim_Comments.length > 0
  ) {
    recommendationStatus = String(
      commentdata?.Interim_Comments[0]?.Interim_Recommendation?.status
    );
  }
  return (
    <div
      className="recommendationBox"
      style={{ pointerEvents: "all", position: "relative" }}
    >
      <Spinner visible={loading} />
      <div className="recommendationTitle">
        <p
          style={{
            marginBottom: "5px",
            // fontFamily: "Sora,sans-serif",
          }}
        >
          Recommendation
        </p>
        <p
          style={{
            marginBottom: 5,
            fontSize: 12,
            fontWeight: 400,
            wordWrap: "break-word",
          }}
        >
          {String(recommendations?.[0]?.recommendations).replace("`", "'")}
        </p>
      </div>
      <Group style={{ justifyContent: "space-between" }}>
        <div className="recommendationExpectedTime">
          <p>
            Expected By:{" "}
            <span>
              {recommendations?.[0]?.expectedDate === null
                ? "No Due Date"
                : dayjs(recommendations?.[0]?.expectedDate).format(
                    "DD MMM, YYYY"
                  )}
            </span>
          </p>
        </div>
        <div className="recommendationExpectedTime">
          <p>
            {recommendationStatus === RecommendationStatus.Open ? (
              <span
                style={{
                  color: "#FFA93C",
                  fontSize: 12,
                  marginBottom: 0,
                  lineHeight: "16px",
                }}
              >
                &nbsp; Raised on :{" "}
                {dayjs(recommendationOpenDate).format("DD MMM YYYY")}
              </span>
            ) : (
              ""
            )}
          </p>
        </div>
      </Group>
      <div>
        <p style={{ fontSize: 12, marginBottom: 0 }}>
          Status : <span>{recommendationStatus}</span>
        </p>
      </div>

      <div
        className={
          !!commentdata?.Interim_Comments &&
          commentdata?.Interim_Comments.length > 0
            ? "recommendationCommentBox"
            : // : "recommendationCommentBoxHide"
              ""
        }
      >
        {
          // loading ? (
          //   // <LoadingOverlay visible={true} />
          //   <Spinner visible={true} />
          // ) :
          !!commentdata?.Interim_Comments &&
          commentdata?.Interim_Comments.length > 0 ? (
            <div className="commentLogContainer">
              {commentdata?.Interim_Comments?.map((commentsitem: any) => {
                return (
                  <>
                    {userSession?.user?.id == commentsitem?.User?.id ? (
                      <div className="selfSentComment">
                        <div className="selfSentInfo">
                          <div className="selfUserName">
                            {commentsitem?.User?.name}
                          </div>
                          <div className="selfSentIcon"></div>
                        </div>
                        <div className="selfSentCommentTextBox">
                          {commentsitem?.comments}
                          {!!commentsitem?.upload_document ? (
                            <div className="uploadedAttachment">
                              <span>Uploaded File :</span>
                              <a
                                target="_blank"
                                rel="noreferrer"
                                href={commentsitem?.upload_document}
                                title={commentsitem?.filename}
                              >
                                {commentsitem?.filename}
                              </a>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="selfSentcommentDayDateTime">
                          {dayjs(commentsitem?.created_at).format(
                            "dddd, hh:mm"
                            // "DD MMM, YYYY"
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="receivedComment">
                        <div className="senderInfo">
                          <div className="senderIcon"></div>
                          <div className="senderName">
                            {commentsitem?.User?.name}
                          </div>
                        </div>
                        <div className="senderCommentTextBox">
                          {commentsitem?.comments}
                          {!!commentsitem?.upload_document ? (
                            <div className="uploadedAttachment">
                              <span>Uploaded File :</span>
                              <a
                                target="_blank"
                                rel="noreferrer"
                                href={commentsitem?.upload_document}
                                title={commentsitem?.filename}
                              >
                                {commentsitem?.filename}
                              </a>
                            </div>
                          ) : (
                            ""
                          )}
                        </div>
                        <div className="commentDayDateTime">
                          {dayjs(commentsitem?.created_at).format(
                            "dddd, hh:mm"
                            // "DD MMM, YYYY"
                          )}
                        </div>
                      </div>
                    )}
                  </>
                );
              })}
            </div>
          ) : (
            ""
          )
        }
        {isViewOnly && recommendationStatus !== RecommendationStatus.Closed ? (
          <p className="noteInfoStrip">
            <b>Note :</b> Action on this recommendation is no more allowed
            because a further assessment was initiated.
          </p>
        ) : (
          ""
        )}
        {(userSession?.user?.role === AppRoles.Inviter ||
          userSession?.user?.role === AppRoles.Consultant) &&
        recommendationStatus == RecommendationStatus.PendingForApproval ? (
          formStatus == FormInvitationStatus.Draft && isCarryForward ? (
            <></>
          ) : (
            <>
              {showTextBox ? (
                <>
                  <div
                    className={
                      isFocused ? "commentInputSendOrange" : "commentInputSend"
                    }
                  >
                    <TextInput
                      onFocus={() => setIsFocused(true)}
                      onBlur={() => setIsFocused(false)}
                      classNames={{ input: "RecommendationCommentInput" }}
                      placeholder="Add your recommendation here..."
                      variant="unstyled"
                      style={{ flex: "1" }}
                      value={recommendCommentData}
                      onChange={(event) => {
                        setrecommendCommentData(event.currentTarget.value);
                        // Clear the error when user types
                        if (event.currentTarget.value.trim() !== "") {
                          setCommentsError("");
                        }
                        setLocalStorageData(
                          window.localStorage,
                          "recommendCommentData",
                          event.currentTarget.value
                        );
                      }}
                    />
                    <Button
                      id={recommendations?.[0]?.id}
                      variant="subtle"
                      p={0}
                      size="compact-sm"
                      style={{ backgroundColor: "transparent", opacity: isDisabled ? 0.3 : 1,minWidth: 40 }}
                      disabled={isDisabled}
                      onClick={async (e: any) => {
                        //warning rule changes
                        const buttonId = e.currentTarget.id; // Capture the ID before the async callback
                        captchaValidationBeforeSubmitHandler(async () => {
                          const WarningData1 =
                            useWarningMessageStore.getState().WarningRuleFields;

                          setLocalStorageData(
                            window.localStorage,
                            "buttonid",
                            buttonId
                          );

                          if (
                            WarningData1?.length > 0 &&
                            WarningData1?.[0]?.isWarningRule &&
                            !WarningData1?.[0]?.isFileUpload
                          ) {
                            postParentMessage(
                              warpWarningmessage(
                                WarningData1?.[0]?.warningmessage,
                                "addrecc"
                              )
                            );
                          } else {
                            await Insertcomment();
                            //remove warning log if recorded

                            if (WarningData1.length > 0) {
                              let data = WarningData1.filter(
                                (x: any) => x.ispopupmessageremoved === true
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
                            let warningList: warningmessageObjectType[] = [];
                            // useWarningMessageStore.setState({
                            //   WarningRuleFields: warningList,
                            // });
                            removeWarning();
                            //remove warning log if recorded
                          }
                          //warning rule changes
                          // insertcomment
                        }, "listIframe1");
                      }}
                    >
                      <ActionIcon variant="transparent" className={classes.sendIcon}>
                        <IconSend  />
                      </ActionIcon>
                    </Button>
                  </div>
                  {commentsError !== "" && (
                    <Text fz={12} c="radioCheckBoxError.0">
                      {commentsError}
                    </Text>
                  )}
                </>
              ) : !isViewMode && !isViewOnly ? (
                <div
                  className="actionButtonsContainer"
                  style={{ width: "100%" }}
                >
                  <Stack style={{ flex: 1 }}>
                    <Switch
                      className="toggele-swatches"
                      styles={{
                        track: {
                          backgroundColor: "rgb(186 191 195 / 45%)",
                          borderColor: "rgb(186 191 195 / 45%)",
                        },
                        body: {
                          justifyContent: "space-between",
                          width: "100%",
                          marginTop: 5,
                        },
                        input: {
                          display: "none",
                        },
                      }}
                      labelPosition="left"
                      //color="Blue"
                      label="Toggle to approve, then click on 'Confirm Approval' to confirm"
                      checked={checked}
                      onClick={(event) => {
                        if (!!checked) {
                          setChecked(false);
                        } else {
                          setChecked(true);
                        }
                      }}
                      // onChange={(event) => {
                      //   alert(event.currentTarget.checked);
                      //   setChecked(event.currentTarget.checked);
                      // }}
                    />
                    <Group>
                      <Button
                        onClick={() => {
                          updatestatus(RecommendationStatus.Closed);
                        }}
                        color="orange.4"
                        radius="xl"
                        disabled={checked ? false : true}
                      >
                        Confirm Approval
                      </Button>
                      <Button
                        onClick={() => {
                          setshowTextBox(true);
                        }}
                        color="orange.4"
                        radius="xl"
                      >
                        Reopen
                      </Button>
                    </Group>
                  </Stack>
                </div>
              ) : (
                <Box></Box>
              )}
            </>
          )
        ) : (
          <Box></Box>
        )}
        {(userSession?.user?.role === AppRoles.Invitee ||
          userSession?.user?.role === AppRoles.Responder) &&
        (recommendationStatus == RecommendationStatus.Reopened ||
          recommendationStatus == RecommendationStatus.Open) ? (
          !isViewMode ? (
            isRecommendViewMode ? (
              (formStatus == FormInvitationStatus.Submitted && !isViewOnly && !isReviewer) || (formStatus == FormInvitationStatus.Approved && !isViewOnly && !isReviewer) ? (
                <>
                  <div className="commentInputUploadSend">
                    <Stack style={{ flex: "60%", gap: 0 }}>
                      <TextInput
                        classNames={{ input: "input-comment" }}
                        placeholder="Add your comments here..."
                        onChange={(event) => {
                          setrecommendCommentData(event.currentTarget.value);
                          // Clear the error when user types
                          if (event.currentTarget.value.trim() !== "") {
                            setCommentsError("");
                          }
                          setLocalStorageData(
                            window.localStorage,
                            "recommendCommentData",
                            event.currentTarget.value
                          );
                        }}
                        style={{ width: "100%" }}
                        value={recommendCommentData}
                      />
                      {commentsError !== "" && (
                        <Text fz={12} c="radioCheckBoxError.0">
                          {commentsError}
                        </Text>
                      )}
                    </Stack>
                    <Stack
                      style={{
                        flex: "1 40%",
                        flexDirection: "row",
                        alignItems: "center",
                      }}
                    >
                      <FileInput
                      placeholder="Upload document"
                        classNames={{ input: "fileUpload-comment" }}
                        styles={{ placeholder: { color: "#ADB5BD" } }}
                        style={{ width: "100%" }}
                        onChange={(value: any) => {
                          fileerrors = FilevalidationErrorMessage(value);
                          setfileerror(fileerrors);
                          if (fileerrors === "") {
                            if (!!value) {
                              setfileToUpload(value);
                            }
                          } else {
                            setfileToUpload(null);
                            return fileerrors;
                          }
                        }}
                        value={fileToUpload}
                        rightSection={
                          <UploadFileSvgIcon
                            width={30}
                            height={30}
                            style={{ marginRight: "10px", backgroundColor: "white" }}
                            fill="#aaaaaa"
                          />
                        }
                      />
                      {fileerror !== "" && fileerror !== undefined ? (
                        <span
                          style={{
                            fontSize: "12px",
                            marginTop: "5px",
                            color: "red",
                          }}
                        >
                          {fileerror}
                        </span>
                      ) : (
                        <Button
                          id={recommendations?.[0]?.id}
                          variant="subtle"
                          p={0}
                          size="compact-sm"
                          style={{ backgroundColor: "transparent", minWidth: 40 }}
                          disabled={isDisabled}
                          onClick={async (e: any) => {
                            //warning rule changes
                            const buttonId = e.currentTarget.id; // Capture the ID before the async callback
                            captchaValidationBeforeSubmitHandler(async () => {
                              const WarningData1 =
                                useWarningMessageStore.getState()
                                  .WarningRuleFields;

                              setLocalStorageData(
                                window.localStorage,
                                "buttonid",
                                buttonId
                              );

                              if (
                                WarningData1?.length > 0 &&
                                WarningData1?.[0]?.isWarningRule &&
                                !WarningData1?.[0]?.isFileUpload
                              ) {
                                postParentMessage(
                                  warpWarningmessage(
                                    WarningData1?.[0].warningmessage,
                                    "addrecc"
                                  )
                                );
                              } else {
                                await Insertcomment();
                                const WarningData2 =
                                  useWarningMessageStore.getState()
                                    .WarningRuleFields;
                                //remove warning log if recorded

                                if (WarningData2.length > 0) {
                                  let data = WarningData1.filter(
                                    (x: any) => x.ispopupmessageremoved === true
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

                                    let warningList: warningmessageObjectType[] =
                                      [];
                                    // useWarningMessageStore.setState({
                                    //   WarningRuleFields: warningList,
                                    // });
                                    removeWarning();
                                    //remove warning log if recorded
                                  }
                                }
                              }
                              //warning rule changes
                              // insertcomment
                            }, "listIframe1");
                          }}
                        >
                          <ActionIcon variant="transparent">
                            <IconSend  />
                          </ActionIcon>
                        </Button>
                      )}
                    </Stack>
                  </div>
                </>
              ) : (
                <></>
              )
            ) : (
              <>
                {!isViewOnly ? (
                  <>
                    <div className="commentInputUploadSend">
                      <Stack style={{ flex: "1 60%", gap: 0 }}>
                        <TextInput
                          classNames={{ input: "input-comment" }}
                          placeholder="Add your comments here..."
                          onChange={(event) => {
                            setrecommendCommentData(event.currentTarget.value);
                            // Clear the error when user types
                            if (event.currentTarget.value.trim() !== "") {
                              setCommentsError("");
                            }
                            setLocalStorageData(
                              window.localStorage,
                              "recommendCommentData",
                              event.currentTarget.value
                            );
                          }}
                          style={{ width: "100%" }}
                          value={recommendCommentData}
                        />
                        {commentsError !== "" && (
                          <Text fz={12} c="radioCheckBoxError.0">
                            {commentsError}
                          </Text>
                        )}
                      </Stack>
                      <Stack
                        style={{
                          flex: "1 40%",
                          flexDirection: "row",
                          alignItems: "center",
                        }}
                      >
                        <FileInput
                          placeholder="Upload document"
                          classNames={{ input: "fileUpload-comment" }}
                          styles={{ placeholder: { color: "#ADB5BD" } }}
                          style={{ width: "100%" }}
                          onChange={(value: any) => {
                            fileerrors = FilevalidationErrorMessage(value);
                            setfileerror(fileerrors);
                            if (fileerrors === "") {
                              if (!!value) {
                                setfileToUpload(value);
                              }
                            } else {
                              setfileToUpload(null);
                              return fileerrors;
                            }
                          }}
                          value={fileToUpload}
                          rightSection={
                            <UploadFileSvgIcon
                              width={30}
                              height={30}
                              style={{ marginRight: "10px", backgroundColor: "white" }}
                              fill="#aaaaaa"
                            />
                          }
                        />
                        {fileerror !== "" && fileerror !== undefined ? (
                          <span
                            style={{
                              fontSize: "12px",
                              marginTop: "5px",
                              color: "red",
                            }}
                          >
                            {fileerror}
                          </span>
                        ) : (
                          <Button
                            id={recommendations?.[0]?.id}
                            variant="subtle"
                            p={0}
                            size="compact-sm"
                            style={{ backgroundColor: "transparent", minWidth: 40 }}
                            disabled={isDisabled}
                            onClick={async (e: any) => {
                              //warning rule changes
                              const buttonId = e.currentTarget.id; // Capture the ID before the async callback
                              captchaValidationBeforeSubmitHandler(async () => {
                                const WarningData1 =
                                  useWarningMessageStore.getState()
                                    .WarningRuleFields;
                                setLocalStorageData(
                                  window.localStorage,
                                  "buttonid",
                                  buttonId
                                );

                                if (
                                  WarningData1?.length > 0 &&
                                  WarningData1?.[0]?.isWarningRule &&
                                  !WarningData1?.[0]?.isFileUpload
                                ) {
                                  postParentMessage(
                                    warpWarningmessage(
                                      WarningData1?.[0].warningmessage,
                                      "addrecc"
                                    )
                                  );
                                } else {
                                  await Insertcomment();
                                  //remove warning log if recorded
                                  if (WarningData1.length > 0) {
                                    let data = WarningData1.filter(
                                      (x: any) =>
                                        x.ispopupmessageremoved === true
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
                                      let warningList: warningmessageObjectType[] =
                                        [];
                                      // useWarningMessageStore.setState({
                                      //   WarningRuleFields: warningList,
                                      // });
                                      removeWarning();
                                      //remove warning log if recorded
                                    }
                                  }
                                }
                                //warning rule changes
                                // insertcomment
                              }, "listIframe1");
                            }}
                          >
                            <ActionIcon variant="transparent">
                              <IconSend />
                            </ActionIcon>
                          </Button>
                        )}
                      </Stack>
                    </div>
                    <Text fz="sm" mb={5}>
                      Note: Before closing the recommendation, please modify the
                      responses as necessary
                    </Text>
                  </>
                ) : (
                  <Box></Box>
                )}
              </>
            )
          ) : (
            <></>
          )
        ) : (
          <Box></Box>
        )}
      </div>
    </div>
  );
};

export default Recommendation;
