import {
  Box,
  Button,
  Flex,
  Grid,
  Group,
  ScrollArea,
  Stack,
  Text,
  Textarea,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useFocusTrap } from "@mantine/hooks";
import { IconSend } from "@tabler/icons";
import { useCaptchaValidationBeforeSubmit } from "@/modules/warp/packages/client/hooks/google-invisible-recaptcha";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import { useWarpContentSize } from "@/modules/warp/packages/client/hooks/use-warp-content-size";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import {
  invitationFormquestionredirect,
  refreshQuestion,
  sendCommentsButtonCount,
  warpClosePopup,
  warpReopenAssessmentSubmit,
} from "@/modules/warp/packages/client/services/platform-window-message.service";
import {
  GetinvitationcommentQuery,
  InvitationComment_Bool_Exp,
} from "@/modules/warp/packages/graphql/generated/types";
import { useInsertFormInvitationCommentMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-invitation-comments";
import { useReopen_InvitationMutation } from "@/modules/warp/packages/graphql/mutations/generated/reopen-invitation";
import { useGetformFieldsbyInvitationIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-fields-by-Invitation-Id";
import { useGetGlobalMasterByTypeQuery } from "@/modules/warp/packages/graphql/queries/generated/get-global-master-by-type";
import { useGetinvitationcommentLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-comment";
import {
  AppRoles,
  FormInvitationStatus,
} from "@/modules/warp/packages/shared/constants/app.constants";
import {
  parseHasuraClaims,
  setLocalStorageData,
} from "@/modules/warp/packages/shared/utils/auth-session.util";
import { sanitiseValuesByTypeOfData } from "@/modules/warp/packages/shared/utils/dom-purifier/dom-purify.client.util";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";
import InvitationLog from "./invitationlog";

const useStyles = createStyles((theme) => ({
  submitBtn: {
    backgroundColor: "#72D0C6",
    ":hover": {
      backgroundColor: "#72D0C6",
    },
  },
  oppUserComment: {
    padding: "10px 29px 10px 10px",
    backgroundColor: "#EEFCFA",
    borderRadius: "5px 0px 5px 5px",
    margin: "1px 0",
    width: "auto",
    maxWidth: "80%",
  },
  mainUserComment: {
    padding: "10px 29px 10px 10px",
    backgroundColor: "#EEFCFA",
    borderRadius: "5px 5px 5px 0px",
    margin: "1px 0",
    width: "auto",
    maxWidth: "80%",
  },
  back: {
    background: "transparent",
    color: "#72d0c6",
    border: "1px solid #72d0c6",
    paddingLeft: "30px",
    ":hover": {
      background: "transparent",
    },
    ":after": {
      content: "''",
      position: "absolute",
      left: "15px",
      top: "50%",
      display: "block",
      borderLeft: "2px solid #72d0c6 !important",
      borderTop: "2px solid #72d0c6",
      width: "7px",
      height: "7px",
      transform: "translate(-50%, -50%) rotate(-45deg)",
    },
  },
}));
function InvitationQuery() {
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const { classes } = useStyles();
  const focusTrapRef = useFocusTrap();
  const [showCommentLogs, setShowCommentLogs] = useState(false);
  const [comment, setComment] = useState<string>();
  const [commentData, setCommentData] = useState<string>();
  const [isComment, setIsComment] = useState<boolean>(false);
  const [isShow, setIsShow] = useState<boolean>(false);
  const [isShowComment, setIsShowComment] = useState<boolean>(false);
  let session: any = "";
  const { query } = useRouter();
  const { invitationId } = query;
  const { accessToken } = query;
  const { formfieldid } = query;
  const { questionId } = query;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const decodedToken: any = jwt.decode(String(accessToken));
  session = parseHasuraClaims(decodedToken, String(accessToken));
  let formFieldId: any = formfieldid;
  const showCommentHandler = async () => {
    setShowCommentLogs((prevCheck) => !prevCheck);
  };

  useWarpContentSize();

  const userSession = useUserSession();

  const { data: commentsAccessData } = useGetGlobalMasterByTypeQuery({
    variables: {
      type: "CommentsAccess",
    },
  });
  // const [fetchComapnyId, { data: comapnyId }] =
  //   useGetcompanyidbyinvitationidLazyQuery({
  //     variables: {
  //       invitationId: invitationId,
  //     },
  //   });
  let wheredata: InvitationComment_Bool_Exp = {
    invitationId: { _eq: invitationId },
    isActive: { _eq: true },
    formFieldId: { _eq: formFieldId },
  };
  const [fetchRenderFormDetails, { loading, data: formDetails }] =
    useGetformFieldsbyInvitationIdLazyQuery({
      variables: { invitationId, questionId },
    });

  // const [fetchCompanyDetails, { data: companyDetails }] =
  //   useGetCompanyDetailByIdLazyQuery({
  //     variables: {
  //       id: session?.company?.id,
  //     },
  //   });
  const [
    fetchInvitationCommentsData,
    { loading: invitationListDataLoading, data: invitationListData },
  ] = useGetinvitationcommentLazyQuery({
    variables: {
      where: wheredata,
    },
  });
  let comments: any = invitationListData;
  if (formFieldId == undefined) {
    comments = {
      InvitationComment: invitationListData?.InvitationComment?.filter(
        (x: any) => x.formFieldId == null
      ),
    };
  }
  const allComments: GetinvitationcommentQuery = comments ?? {
    InvitationComment: [],
  };
  const formInvitation = formDetails?.FormInvitation[0];
  let questiontitle: any = "";
  let questiontext: any = "";
  let totalCommentButton: number = 0;
  let isAllowAssignQuestion: boolean = false;
  if (!!formFieldId) {
    let questiondata: any =
      formDetails?.FormInvitation[0]?.Form?.FormFields.filter(
        (c: any) => c.id === formFieldId
      );
    let parentdata: any =
      formDetails?.FormInvitation[0]?.Form?.FormFields.filter(
        (c: any) => c.field === questiondata[0]?.groupField
      );
    if (formDetails?.FormInvitation[0]?.Form?.FormFields != undefined) {
      totalCommentButton =
        formDetails?.FormInvitation[0]?.Form?.FormFields.filter(
          (x: any) => x.interfaceOptions?.isAddcomment == true
        )?.length;
    }
    if (formDetails?.FormInvitation[0]?.Form?.isDelegateQuestion != null) {
      isAllowAssignQuestion =
        formDetails?.FormInvitation[0]?.Form?.isDelegateQuestion;
    }
    let questiondatarow: any = "";
    let Qlabel_new: string = "";
    questiontitle =
      questiondata !== undefined
        ? questiondata[0]?.interfaceOptions?.subtitle !== undefined &&
          questiondata[0]?.interfaceOptions?.subtitle !== ""
          ? questiondata[0]?.interfaceOptions?.subtitle
          : questiondata[0]?.interfaceOptions?.title !== undefined &&
            questiondata[0]?.interfaceOptions?.title !== ""
          ? questiondata[0]?.interfaceOptions?.title
          : questiondata[0]?.fieldOptions.label !== undefined &&
            questiondata[0]?.fieldOptions.label !== null &&
            questiondata[0]?.fieldOptions.label !== ""
          ? ""
          : parentdata[0]?.interfaceOptions?.title !== undefined &&
            parentdata[0]?.interfaceOptions?.title !== ""
          ? parentdata[0]?.interfaceOptions?.title
          : ""
        : "";

    questiondatarow = formDetails?.FormInvitation[0]?.Form?.FormFields.filter(
      (c: any) => c.Question?.id == questionId && c.interface === "group-detail"
    );
    if (questiondatarow !== undefined && questiondatarow !== null) {
      if (questiondatarow.length > 0) {
        Qlabel_new =
          questiondatarow !== undefined
            ? questiondatarow[0]?.fieldOptions?.label
            : "";
      }
    }
    questiontext =
      questiondata !== undefined
        ? questiondata[0]?.fieldOptions.parentHeading !== undefined &&
          questiondata[0]?.fieldOptions.parentHeading !== null &&
          questiondata[0]?.fieldOptions.parentHeading !== ""
          ? questiondata[0]?.fieldOptions.parentHeading
          : questiondata[0]?.fieldOptions.label !== undefined &&
            questiondata[0]?.fieldOptions.label !== null &&
            questiondata[0]?.fieldOptions.label !== ""
          ? questiondata[0]?.fieldOptions.label
          : Qlabel_new
        : Qlabel_new;
  }
  useEffect(() => {
    const formId = formDetails?.FormInvitation[0]?.Form?.id;

    // if (session?.user?.role === AppRoles.Consultant) {
    //   fetchCompanyDetails();
    // }

    if (invitationId) {
      fetchRenderFormDetails({ variables: { invitationId, questionId } });
      // fetchComapnyId({ variables: { invitationId } });
      fetchInvitationCommentsData({
        variables: { where: wheredata },
      });
    }

    let commentsAccessFilteredData: any = [];

    const companyId =
      session?.user?.role === AppRoles.Consultant
        ? !!formDetails?.FormInvitation[0]?.parentcompanyId
          ? formDetails?.FormInvitation[0]?.parentcompanyId
          : formDetails?.FormInvitation[0]?.ParentCompanyMapping
              ?.ParentCompanyId
        : //companyDetails?.Company[0].ParentCompany?.id
          session?.company?.id;

    if (
      commentsAccessData?.GlobalMaster &&
      commentsAccessData?.GlobalMaster?.length > 0
    ) {
      commentsAccessFilteredData =
        commentsAccessData?.GlobalMaster[0]?.data?.filter((d: any) => {
          if (d?.companyId === companyId && d.formId === formId) return d;
        });
    }

    const role = session?.user?.role;
    const status = formInvitation?.status;

    if (
      role === AppRoles.Inviter ||
      role === AppRoles.Responder ||
      role === AppRoles.Consultant ||
      role === AppRoles.Approver
    ) {
      switch (status) {
        case FormInvitationStatus.Draft:
        case FormInvitationStatus.Invited:
        case FormInvitationStatus.UnderReview: {
          setIsShow(false);
          setIsShowComment(true);
          setIsComment(true);
          break;
        }

        case FormInvitationStatus.Submitted: {
          if (!!commentsAccessFilteredData[0]?.IsReopeningEnabled) {
            setIsShow(true);
            setIsShowComment(false);
            setIsComment(false);
            break;
          }
          // Fall through to view only if re-opening is not enabled
        }

        case FormInvitationStatus.Approved:
        case FormInvitationStatus.Completed: {
          setIsShow(false);
          setIsShowComment(true);
          setIsComment(false);
          break;
        }

        default:
          setIsShow(false);
          setIsShowComment(true);
          setIsComment(true);
          break;
      }
    } else if (role === AppRoles.Invitee) {
      switch (status) {
        case FormInvitationStatus.Draft:
        case FormInvitationStatus.Invited:
        case FormInvitationStatus.UnderReview: {
          setIsShow(false);
          setIsShowComment(true);
          setIsComment(true);
          break;
        }

        case FormInvitationStatus.Submitted:
        case FormInvitationStatus.Approved:
        case FormInvitationStatus.Completed: {
          setIsShow(false);
          setIsShowComment(true);
          setIsComment(false);
          break;
        }

        default:
          setIsShow(false);
          setIsShowComment(true);
          setIsComment(true);
          break;
      }
    }
  }, [
    session?.user?.role,
    commentsAccessData?.GlobalMaster,
    fetchRenderFormDetails,
    // fetchComapnyId,
    fetchInvitationCommentsData,
    formDetails?.FormInvitation,
    formInvitation?.status,
    invitationId,
    session?.company?.id,
    // companyDetails,
    // fetchCompanyDetails,
  ]);

  const scrollToBottom = () => {
    setTimeout(() => {
      let scoollDiv = messagesEndRef?.current?.getElementsByClassName(
        "mantine-ScrollArea-viewport"
      );
      if (!!scoollDiv) {
        if (scoollDiv.length > 0) {
          scoollDiv[0].scrollTop = scoollDiv[0].scrollHeight;
        }
      }
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 3000);
  };

  useEffect(() => {
    scrollToBottom();
  }, []);

  const [insertInvitationComment, { loading: insertCommentsLoading }] =
    useInsertFormInvitationCommentMutation();
  const [reopeninvitation, { loading: reopeninvitationLoading }] =
    useReopen_InvitationMutation();
  //space added
  const insertComment = async (emailType: any = null) => {
    captchaValidationBeforeSubmitHandler(async () => {
      if (commentData?.trim() === "") {
        setCommentData("");
        return;
      }
      const queryData = sanitiseValuesByTypeOfData(commentData?.trim());
      if (!!queryData) {
        setLocalStorageData(window.localStorage, "IsPageRefreshed", questionId);
        let variables = "";
        let commentsInserted;
        let invitationStatus = formDetails?.FormInvitation[0]?.status;
        if (emailType === "Reopen Assessment") {
          invitationStatus = "Draft";
        }
        commentsInserted = await insertInvitationComment({
          variables: {
            companyId: formDetails?.FormInvitation[0]?.companyId,
            content: queryData,
            invitationId: invitationId,
            userId: session?.user?.id,
            formFieldId: formFieldId,
            status: invitationStatus,
          },
        });
        // else {
        if (emailType === "Reopen Assessment") {
          let reopen_invitation = await reopeninvitation({
            variables: {
              companyId: formDetails?.FormInvitation[0]?.companyId,
              invitationId: invitationId,
              userId: session?.user?.id,
              status: invitationStatus,
            },
          });
        }

        setCommentData("");
        scrollToBottom();
        if (
          commentsInserted?.data?.insert_InvitationComment?.returning &&
          commentsInserted?.data?.insert_InvitationComment?.returning.length > 0
        ) {
          let commentcount: any =
            commentsInserted?.data?.insert_InvitationComment?.returning[0]
              ?.FormInvitation?.InvitationComments_aggregate?.aggregate?.count;
          let msgCount = sendCommentsButtonCount(commentcount);
          postParentMessage(msgCount);
          try {
            const successInvitationListData = await fetchInvitationCommentsData(
              {
                variables: { where: wheredata },
                fetchPolicy: "no-cache",
              }
            );

            if (emailType === "Reopen Assessment") {
              await fetch("/warp/api/assessmentreopen-email", {
                method: "POST",
                headers: {
                  "content-type": "application/json",
                },
                body: JSON.stringify({
                  id: invitationId,
                  type: "AssessmentReopenEmail",
                  companyId: formDetails?.FormInvitation[0]?.companyId,
                  formId: formDetails?.FormInvitation[0]?.formId,
                  platformId: session?.platform?.id,
                }),
              });

              variables = warpReopenAssessmentSubmit(true, true, true);
              postParentMessage(variables);
            }
            // else if (emailType === "Send") {
            //   await fetch("/warp/api/commentsubmission-email", {
            //     method: "POST",
            //     headers: {
            //       "content-type": "application/json",
            //     },
            //     body: JSON.stringify({
            //       id: invitationId,
            //       type: "CommentSubmissionEmail",
            //       companyId: formDetails?.FormInvitation[0]?.companyId,
            //       formId: comapnyId?.FormInvitation[0].formId,
            //       userRole: session?.user?.role,
            //     }),
            //   });
            //   await fetch("/warp/api/commentsubmissionuser2-email", {
            //     method: "POST",
            //     headers: {
            //       "content-type": "application/json",
            //     },

            //     body: JSON.stringify({
            //       id: invitationId,
            //       type: "CommentSubmissionEmailUser2",
            //       companyId: formDetails?.FormInvitation[0]?.companyId,
            //       formId: comapnyId?.FormInvitation[0].formId,
            //       userRole: session?.user?.role,
            //     }),
            //   });
            // }
          } catch (error) {
            console.log("error - ", error);
          }
        }
        if (emailType === "Reopen Assessment") {
          postParentMessage(refreshQuestion(questionId as string));
        }
      }
    }, "listIframe");
    //GoToQuestion(questionid);
  };
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");

  const GoToQuestion = (QuestionId: any) => {
    let invitationId_new: any = "";
    invitationId_new = invitationId;
    postParentMessage(
      invitationFormquestionredirect(invitationId_new, QuestionId)
    );
  };

  const closepopup = () => {
    let variables = warpClosePopup(false);
    postParentMessage(variables);
  };
  // let scrollHeight = session?.user?.role === AppRoles.Invitee ? "69vh" : "69vh";
  let scrollHeight2 = isComment ? "64vh" : "80vh";
  return (
    <Stack
      gap={0}
      ref={messagesEndRef}
      // style={
      //   allComments?.InvitationComment?.length == 0
      //     ? { height: 410 }
      //     : { height: "auto" }
      // }
    >
      {loading ? (
        <Box className="popup_spinner">
          <Spinner visible={true} />
        </Box>
      ) : showCommentLogs ? (
        <Stack gap={0}>
          <Group mb={0} grow={true} mt={0}>
            {invitationListDataLoading ? (
              // <LoadingOverlay visible={true} />
              <Spinner visible={true} />
            ) : allComments?.InvitationComment.length > 0 ? (
              <Stack>
                {allComments?.InvitationComment.length == 0 ? (
                  <Text
                    mb={5}
                    mt={20}
                    style={{ padding: "0px", marginTop: "0px" }}
                  >
                    Raise your query here...
                  </Text>
                ) : (
                  <Text
                  lh={2}
                    mb={5}
                    style={{
                      padding: "0 10px",
                      marginTop: "10px",
                      fontWeight: "bolder",
                      fontSize: "16px",
                      height: 65,
                      overflow: "hidden",
                      wordBreak: "break-word",
                      textOverflow: "clip",
                      display: "flex",
                      gap: 8,
                    }}
                  >
                    <span>{questiontitle}</span>
                    <span>{questiontext}</span>
                  </Text>
                )}
                <ScrollArea
                  style={{
                    // padding: "15px 15px 15px 0",
                    // height: scrollHeight2,
                    overflowY: "auto",
                  }}
                  styles={(theme) => ({
                    scrollbar: {
                      '&[data-orientation="vertical"] .mantine-ScrollArea-thumb':
                        {
                          backgroundColor: theme.colors.orange,
                        },
                    },
                  })}
                >
                  <InvitationLog
                    allComments={allComments}
                    InvitationId={invitationId || ""}
                    session={session}
                  />
                </ScrollArea>
                {isComment ? (
                  <Group mb={0} grow={showCommentLogs ? true : false} mt={0}>
                    <Grid>
                      <Grid.Col span={8}>
                        {userSession?.user?.role === AppRoles.Responder ||
                        userSession?.user?.role === AppRoles.Invitee ? (
                          <Text
                            mb={15}
                            mt={20}
                            size={"14px"}
                            fw={400}
                            lh={2}
                            style={{
                              padding: "0px",
                              marginTop: "0px",
                              color: "#444444",
                            }}
                          >
                            If you have any doubts /clarifications needed on
                            this question you can raise the query to the
                            assessor.
                          </Text>
                        ) : (
                          ""
                        )}
                        <Textarea
                          classNames={{
                            input: "mantine-Textarea-input popup_textarea",
                          }}
                          ref={focusTrapRef}
                          style={{ marginTop: "0px", flex: "1 auto" }}
                          placeholder="Raise your query here..."
                          value={commentData}
                          onChange={(event) =>
                            setCommentData(event.currentTarget.value)
                          }
                          autosize
                          minRows={1}
                          maxRows={1}
                        ></Textarea>
                      </Grid.Col>
                      <Grid.Col span={4}>
                        <Button
                          style={{ flex: 0 }}
                          onClick={() => insertComment("Send")}
                          size="md"
                          disabled={!commentData || insertCommentsLoading}
                          mr={3}
                        >
                          {insertCommentsLoading ? "Sending..." : "Send"}
                        </Button>
                        <Button
                          className={classes.back}
                          style={{ flex: 0 }}
                          onClick={() => showCommentHandler()}
                          size="md"
                        >
                          Back
                        </Button>
                      </Grid.Col>
                    </Grid>
                  </Group>
                ) : (
                  <Group mb={0} grow={showCommentLogs ? true : false} mt={0}>
                    <Button
                      className={classes.back}
                      style={{ flex: 0 }}
                      onClick={() => showCommentHandler()}
                      size="md"
                    >
                      Back
                    </Button>
                  </Group>
                )}
              </Stack>
            ) : (
              <Box>Raise your query here...</Box>
            )}
          </Group>
        </Stack>
      ) : !!isShow ? (
        <>
          {totalCommentButton == 0 && isAllowAssignQuestion == false ? (
            <>
              <Box mt={15}>
                <Text
                lh={2}
                  mb={5}
                  style={{
                    padding: "0 10px",
                    marginTop: "10px",
                    fontWeight: 400,
                    fontSize: "14px",
                  }}
                >
                  <b> Are you sure want to Reopen Assessment?</b>
                </Text>
              </Box>
              <Flex mt={10} gap={10}>
                <Button
                  onClick={() => insertComment("Reopen Assessment")}
                  color={"#72D0C6"}
                  radius="xl"
                >
                  Yes
                </Button>
                <Button
                  variant="outline"
                  style={{ borderColor: "#666", color: "#666" }}
                  radius="xl"
                  onClick={() => {
                    setLocalStorageData(
                      window.localStorage,
                      "IsPageRefreshed",
                      questionId
                    );
                    postParentMessage(refreshQuestion(questionId as string));
                  }}
                >
                  No
                </Button>
              </Flex>
            </>
          ) : (
            <>
              {allComments?.InvitationComment.length == 0 ? (
                userSession?.user?.role === AppRoles.Responder ||
                userSession?.user?.role === AppRoles.Invitee ? (
                  <Text
                    mb={15}
                    size={"14px"}
                    fw={400}
                    lh={2}
                    style={{
                      padding: "0px",
                      marginTop: "0px",
                      width: "100%",
                      display: "block",
                      position: "relative",
                      top: "0%",
                      color: "#444444",
                    }}
                  >
                    If you have any doubts /clarifications needed on this
                    question you can raise the query to the assessor.
                  </Text>
                ) : (
                  <Text
                  lh={2}
                    mb={5}
                    style={{
                      padding: "0px",
                      marginTop: "0px",
                      width: "100%",
                      display: "block",
                      position: "relative",
                      top: "0%",
                    }}
                  >
                    If you have any remarks on this question for the responder,
                    you can add a comment here.
                  </Text>
                )
              ) : (
                <Text
                lh={2}
                  mb={5}
                  style={{
                    padding: "0 10px",
                    marginTop: "10px",
                    fontWeight: 400,
                    fontSize: "14px",
                  }}
                >
                  <b> {questiontitle + " " + questiontext}</b>
                </Text>
              )}
              <Textarea
                classNames={{ input: "mantine-Textarea-input popup_textarea" }}
                ref={focusTrapRef}
                mt={10}
                placeholder="Raise your query here..."
                value={commentData}
                onChange={(event) => setCommentData(event.currentTarget.value)}
                autoFocus
              ></Textarea>
              <Group mb={0} mt={20}>
                <Button
                  // className={classes.submitBtn}
                  onClick={() => insertComment("Reopen Assessment")}
                  disabled={!commentData || insertCommentsLoading}
                  color="solidBtn"
                >
                  {insertCommentsLoading ? "Loading..." : "Reopen Assessment"}
                </Button>
                {allComments?.InvitationComment.length ? (
                  <Button
                    onClick={() => showCommentHandler()}
                    color="outlineBtn"
                  >
                    View Queries
                  </Button>
                ) : (
                  ""
                )}
              </Group>
            </>
          )}
        </>
      ) : invitationListDataLoading ? (
        // <LoadingOverlay visible={true} />
        <Spinner visible={true} />
      ) : (
        !!isShowComment && (
          <>
            {allComments.InvitationComment.length == 0 ? (
              userSession?.user?.role === AppRoles.Responder ||
              userSession?.user?.role === AppRoles.Invitee ? (
                <Text
                  mb={15}
                  size={"14px"}
                  fw={400}
                  lh={2}
                  style={{
                    padding: "0px",
                    marginTop: "0px",
                    width: "100%",
                    display: "block",
                    position: "relative",
                    top: "0%",
                    color: "#444444",
                  }}
                >
                  If you have any doubts /clarifications needed on this question
                  you can raise the query to the assessor.
                </Text>
              ) : (
                <Text
                  mb={15}
                  style={{
                    padding: "0px",
                    marginTop: "0px",
                    width: "100%",
                    display: "block",
                    position: "relative",
                    top: "0%",
                  }}
                >
                  If you have any remarks on this question for the responder,
                  you can add a comment here.
                </Text>
              )
            ) : (
              <Text
                mb={0}
                // mt={20}
                style={{
                  padding: "0px",
                  marginTop: "0px",
                  width: "100%",
                  display: "block",
                  marginBottom: 0,
                }}
              >
                Your query logs are as follows.
              </Text>
            )}
            {allComments?.InvitationComment.length == 0 ? (
              <></>
            ) : (
              <Text
                lh={2}
                style={{
                  margin: "5px 0px",
                  marginTop: "10px",
                  fontWeight: "bolder",
                  fontSize: "16px",
                  minHeight: 55,
                  display: "flex",
                  lineHeight:2,
                }}
              >
                {questiontitle && (
                  <span style={{ marginRight: "6px" }}>{questiontitle}</span>
                )}
                <span>{questiontext}</span>
              </Text>
            )}
            <ScrollArea
              style={
                {
                  // maxHeight:
                  //   allComments?.InvitationComment.length === 0
                  //     ? "100vh"
                  //     : "80vh",
                  // padding: "0px 20px 20px 0px",
                  // overflowY: "auto",
                }
              }
              // styles={(theme) => ({
              //   scrollbar: {
              //     '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
              //       backgroundColor: theme.colors.orange,
              //     },
              //   },
              // })}
            >
              <InvitationLog
                allComments={allComments}
                InvitationId={invitationId || ""}
                session={session}
              />
              <Stack style={{ gap: 10 }}>
                <Box
                  mb={0}
                  // grow={isComment ? true : false}
                  mt={0}
                  style={
                    allComments.InvitationComment.length == 0
                      ? {
                          display: "flex",
                          flexDirection: "column",
                          //paddingRight: "20px",
                        }
                      : {
                          display: "flex",
                          flexDirection: "row",
                          backgroundColor: "#fff",
                          width: "100%",
                          // position: "absolute",
                          // bottom: 0,
                        }
                  }
                >
                  {" "}
                  <Textarea
                    ref={focusTrapRef}
                    classNames={{
                      input:
                        "mantine-Textarea-input" +
                        (allComments.InvitationComment.length === 0
                          ? " popup_textarea"
                          : ""),
                    }}
                    className={
                      allComments.InvitationComment.length == 0
                        ? " "
                        : "chatInput"
                    }
                    style={{
                      marginTop: "0px",
                      width: "100%",
                    }}
                    placeholder="Raise your query here..."
                    value={commentData}
                    onChange={(event) =>
                      setCommentData(event.currentTarget.value)
                    }
                    minRows={allComments.InvitationComment.length == 0 ? 12 : 1}
                    maxRows={allComments.InvitationComment.length == 0 ? 12 : 1}
                  ></Textarea>
                  {allComments.InvitationComment.length == 0 ? (
                    <Group
                      style={{
                        alignContent: "flex-start",
                        justifyContent: "flex-start",
                        width: "100%",
                        marginTop: "15px",
                      }}
                    >
                      <Button
                        style={{ borderRadius: "20px", order: "2" }}
                        onClick={() => insertComment("Send")}
                        size="sm"
                        disabled={!commentData || insertCommentsLoading}
                        color="solidBtn"
                      >
                        {insertCommentsLoading ? "Sending..." : "Submit"}
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => closepopup()}
                        color="outlineBtn"
                      >
                        Cancel
                      </Button>
                    </Group>
                  ) : (
                    <Button
                      variant="subtle"
                      className="sendBtn"
                      style={{
                        borderTopRightRadius: 5,
                        borderBottomRightRadius: 5,
                      }}
                      onClick={() => insertComment("Send")}
                      size="sm"
                      disabled={!commentData || insertCommentsLoading}
                    >
                      {insertCommentsLoading ? (
                        "Sending..."
                      ) : (
                        <IconSend className="sendIcon" />
                      )}
                    </Button>
                  )}
                </Box>
              </Stack>
            </ScrollArea>
            {/* {!isComment && (
              <Group
                mb={0}
                // grow={isComment ? true : false}
                mt={0}
              >
                <Textarea
                  style={{ marginTop: "0px", flex: "1" }}
                  placeholder="Raise your query here..."
                  value={commentData}
                  onChange={(event) =>
                    setCommentData(event.currentTarget.value)
                  }
                  autosize
                  minRows={1}
                  maxRows={1}
                ></Textarea>
                <Button
                  style={{ flex: 0 }}
                  onClick={() => insertComment("Send")}
                  size="md"
                  disabled={!commentData || insertCommentsLoading}
                >
                  {insertCommentsLoading ? "Sending..." : "Send"}
                </Button>
              </Group>
            )} */}
          </>
        )
      )}
    </Stack>
  );
}
export default InvitationQuery;
