import { Box, Button, Group, Stack } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import AddCommentButton from "@warp/client/features/form/components/AddCommentButton";
import Spinner from "@warp/client/layouts/Spinner";
import {
  invitationFormquestionredirect,
  postParentMessage,
} from "@warp/client/services/platform-window-message.service";
import { InvitationComment_Bool_Exp } from "@warp/graphql/generated/types";
import { useGetAssignedQuestionDetailsByInvitationIdQuery } from "@warp/graphql/queries/generated/get-assigned-question-details-by-invitation-id";
import { useGetFormFieldsAndAnswerDataByInvitationIdQuery } from "@warp/graphql/queries/generated/get-formfields-and-answer-data-by-invitationId";
import { useGetinvitationcommentQuery } from "@warp/graphql/queries/generated/get-invitation-comment";
import { AppRoles } from "@warp/shared/constants/app.constants";
import {
  parseHasuraClaims,
  setLocalStorageData,
} from "@warp/shared/utils/auth-session.util";
import dayjs from "dayjs";
import jsonata from "jsonata";
import jwt from "jsonwebtoken";
import { useRouter } from "next/router";
import FormFieldComment from "./FormFieldCommentNew";
const CommentWithQuestionPopup = (formField: any) => {
  const [opened, { open, close }] = useDisclosure(false);
  let CommentsList: any = [];
  const { query } = useRouter();
  const { invitationId }: any = query;
  // useWarpContentSize();

  const GoToQuestion = (questionId: any) => {
    setLocalStorageData(window.localStorage, "IsPageRefreshed", questionId);
    postParentMessage(invitationFormquestionredirect(invitationId, questionId));
  };
  const { accessToken } = query;

  const decodedToken: any = jwt.decode(String(accessToken));
  const session = parseHasuraClaims(decodedToken, String(accessToken));

  const formDetails = useGetFormFieldsAndAnswerDataByInvitationIdQuery({
    variables: { invitationId },
  });
  const assignedQuestionDetail =
    useGetAssignedQuestionDetailsByInvitationIdQuery({
      variables: { invitationId: invitationId },
    });
  let totalcommentbutton: any =
    formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
      (x: any) => x.interfaceOptions?.isAddcomment == true
    );

  let distinctquestion: any = [];
  totalcommentbutton?.map((a: any) => {
    if (distinctquestion.filter((x: any) => x == a?.Question?.id).length == 0) {
      distinctquestion.push(a?.Question?.id);
    }
  });

  let questiondata: any =
    formDetails?.data?.FormInvitation[0]?.Form?.FormFields.filter(
      (c: any) =>
        distinctquestion.filter((d: any) => d == c.Question?.id).length > 0
    );

  let wheredata: InvitationComment_Bool_Exp = {
    invitationId: { _eq: invitationId },
    isActive: { _eq: true },
  };
  const invitationCommentsListData = useGetinvitationcommentQuery({
    variables: {
      where: wheredata,
    },
  });

  let comments: any = [];
  if (invitationCommentsListData?.data?.InvitationComment != undefined) {
    if (invitationCommentsListData?.data?.InvitationComment.length > 0) {
      if (session?.user?.role === AppRoles.Responder) {
        let alldata = assignedQuestionDetail?.data?.AssesseeUserMapping?.filter(
          (x: any) => x?.userByUserid?.id == session?.user?.id
        );
        alldata?.map((items: any) => {
          items?.Question?.FormFields.map((fielditem: any) => {
            if (
              invitationCommentsListData?.data?.InvitationComment != undefined
            ) {
              invitationCommentsListData?.data?.InvitationComment.filter(
                (d: any) => d.formFieldId == fielditem?.id
              ).map((commentmap: any) => {
                comments.push(commentmap);
              });
            }
          });
        });
        comments = comments
          .slice()
          ?.sort((a: any, b: any) => (a.created_at > b.created_at ? -1 : 1));
      } else {
        comments =
          invitationCommentsListData?.data?.InvitationComment.slice()?.sort(
            (a: any, b: any) => (a.created_at > b.created_at ? -1 : 1)
          );
      }
    }
  }

  let questioncommentorderdata: any = [];
  let quesiton_parentQuestionfield: any = [];
  let breadcrumbsdata: any = [];
  comments
    ?.filter((u: any) => u.formFieldId !== null)
    .map((x: any) => {
      let question_formfield_array: any = questiondata?.filter(
        (w: any) =>
          w.Question?.id ==
          questiondata?.filter((d: any) => d.id === x.formFieldId)[0]?.Question
            ?.id
      );

      let parentinputfield = question_formfield_array?.sort(function (
        a: any,
        b: any
      ) {
        const aNums = a.field.match(/\d+/g).map(Number);
        const bNums = b.field.match(/\d+/g).map(Number);
        const maxLength = Math.max(aNums.length, bNums.length);
        for (let i = 0; i < maxLength; i++) {
          if (aNums[i] !== bNums[i]) {
            return aNums[i] - bNums[i]; // sort by number value
          }
        }
        return a.field.localeCompare(b.field); // if numbers are equal, sort alphabetically
      })[0];
      //?.filter((w: any) => !w?.inteface?.includes("group"))
      // .sort((a: any, b: any) => (a.field < b.field ? -1 : 1))[0];
      if (
        quesiton_parentQuestionfield.filter(
          (z: any) => z == parentinputfield?.id
        ).length === 0
      ) {
        quesiton_parentQuestionfield.push(parentinputfield?.id);
      }

      if (
        questioncommentorderdata?.filter(
          (r: any) =>
            r.Question?.id ===
            questiondata?.filter((d: any) => d.id === x.formFieldId)[0]
              ?.Question?.id
        )?.length === 0
      ) {
        question_formfield_array?.map((q: any) => {
          questioncommentorderdata.push(q);
        });
      }
      // = question_formfield_array;
    });

  let parentQuestiondata: any = "";
  let IsDisabled: boolean = false;
  let parentquestionansertime: any = new Date();
  let enable: boolean = true;
  let lastquestionid = "";
  let parentQuestionanswer: any = "";
  let Qlabel: String = "";
  let QNumber: String = "";
  let childqtime: Date = new Date();
  let questiondatarow: any = "";
  let Qlabel_new: String = "";
  let Subtheme_label: String = "";
  let hirarchydata: any = "";
  let hirarchylevel: any = "";
  let breadcrumbdata: any = "";
  let breadcrumb: any = "";
  let section: any = "";
  let parentQuestiondata_new: any = "";
  let parentQuestionfield_id: any = "";
  return (
    <>
      {questioncommentorderdata?.length === 0 ? (
        // <LoadingOverlay visible={true} />
        <Spinner visible={true} />
      ) : (
        <Box>
          <Stack className="mainCaintainer">
            {questioncommentorderdata?.map((item: any) => {
              questiondatarow =
                formDetails?.data?.FormInvitation[0]?.Form?.FormFields.filter(
                  (c: any) =>
                    c.Question?.id == item?.Question?.id &&
                    c.interface === "group-detail"
                );
              /////////////////hirarchylevel
              let parentdata: any =
                formDetails?.data?.FormInvitation[0]?.Form?.FormFields.filter(
                  (c: any) => c.field === item?.groupField
                );

              hirarchydata =
                formDetails?.data?.FormInvitation[0]?.Form?.FormFields.filter(
                  (c: any) => c.interface === "group-wizard"
                  //c.field === "formWizard2"
                );

              hirarchylevel = hirarchydata[0]?.interfaceOptions?.hierarchyLevel;

              breadcrumbdata =
                formDetails?.data?.FormInvitation[0]?.Form?.FormFields.filter(
                  (c: any) =>
                    c.Section?.id == item?.Section?.id && c.type === "sub-theme"
                );
              let subthemeConditional: String = "";
              if (
                questiondatarow[0]?.subtheme != null &&
                questiondatarow[0]?.subtheme != undefined &&
                questiondatarow[0]?.subtheme != ""
              ) {
                subthemeConditional = " > " + questiondatarow[0]?.subtheme;
              }
              if (hirarchylevel !== undefined && hirarchylevel !== null) {             
                breadcrumb =
                  formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                    (g: any) => g.id === item.id
                  )[0].Section?.ParentSection !== null &&
                  formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                    (g: any) => g.id === item.id
                  )[0].Section?.ParentSection != undefined
                    ? formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                        (g: any) => g.id === item.id
                      )[0].Section?.ParentSection?.content
                    : formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                        (g: any) => g.id === item.id
                      )[0].Section?.content;
              } else {
                if (
                  breadcrumbdata[0]?.interfaceOptions?.breadcrumb !== undefined
                ) {
                  
                  breadcrumb =
                    breadcrumb = breadcrumbdata[0]?.interfaceOptions?.breadcrumb;
                  // + subthemeConditional;
                } else {
                  
                  breadcrumb =
                    formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                      (g: any) => g.id === item.id
                    )[0].Section?.ParentSection !== null &&
                    formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                      (g: any) => g.id === item.id
                    )[0].Section?.ParentSection != undefined
                      ? formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                          (g: any) => g.id === item.id
                        )[0].Section?.ParentSection?.content +
                        " > " +
                        formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                          (g: any) => g.id === item.id
                        )[0].Section?.content +
                        subthemeConditional
                      : //+  //subtheme
                        //" > " +
                        //formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                        //  (g: any) => g.id === item.id // &&
                        // )[0].subtheme

                        formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                          (g: any) => g.id === item.id
                        )[0].Section?.content;
                }
              }
              /////////hirarchylevel
              if (questiondatarow.length > 0) {
                Qlabel_new =
                  questiondatarow !== undefined
                    ? questiondatarow[0]?.fieldOptions?.label
                    : "";
              }

              IsDisabled = false;
              if (
                item.fieldOptions.label == "" ||
                item.fieldOptions.label == null ||
                item.fieldOptions.label == undefined
              ) {
                Qlabel = totalcommentbutton.filter(
                  (d: any) => d.field == item.groupField
                )[0]?.fieldOptions.label;
              } else {
                Qlabel = item.fieldOptions.label;
              }

              if (
                quesiton_parentQuestionfield.filter((d: any) => d == item.id)
                  .length > 0
              ) {
                parentQuestiondata =
                  formDetails?.data?.FormInvitation[0]?.FormSubmissions[0]?.Answers.filter(
                    (q: any) => q.questionId === item?.Question?.id
                  )[0];
              } else {
                parentQuestionanswer = parentQuestiondata?.data?.value;

                parentQuestionfield_id =
                  formDetails?.data?.FormInvitation[0]?.Form?.FormFields.filter(
                    (q: any) =>
                      q.Question?.id === item?.Question?.id &&
                      q.groupField.includes("tabs") === true
                  )[0].id;

                if (
                  parentQuestionfield_id !== undefined &&
                  parentQuestionfield_id !== null &&
                  parentQuestionfield_id !== ""
                ) {
                  parentQuestiondata_new =
                    formDetails?.data?.FormInvitation[0]?.FormSubmissions[0]?.Answers.filter(
                      (q: any) =>
                        q.questionId === item?.Question?.id &&
                        q.formFieldId === parentQuestionfield_id
                    )[0];
                }

                // if (item.displayRules !== null) {
                //   let fieldname = "",
                //     datatocheck: any = "";
                //   if (item.displayRules[0].rule.includes("=")) {
                //     fieldname = String(
                //       item.displayRules[0].rule
                //         .split("=")
                //         .filter((f: any) => String(f).trim().includes(".value"))
                //     )
                //       .trim()
                //       .replace(".value", "");
                //     datatocheck = String(
                //       item.displayRules[0].rule
                //         .split("=")
                //         .filter((f: any) => !String(f).trim().includes(".value"))
                //     )
                //       .trim()
                //       .replace("'", "")
                //       .replace("'", "");
                //   } else if (item.displayRules[0].rule.includes("in")) {
                //     fieldname = String(
                //       item.displayRules[0].rule
                //         .split("in")
                //         .filter((f: any) => String(f).trim().includes(".value"))
                //     )
                //       .trim()
                //       .replace(".value", "");
                //     datatocheck = String(
                //       item.displayRules[0].rule
                //         .split("in")
                //         .filter((f: any) => !String(f).trim().includes(".value"))
                //     )
                //       .trim()
                //       .replace("'", "")
                //       .replace("'", "");
                //   }

                //   let Answerdata =
                //     formDetails?.data?.FormInvitation[0]?.FormSubmissions[0]?.Answers?.filter(
                //       (x: any) =>
                //         x.formFieldId ==
                //         totalcommentbutton.filter(
                //           (d: any) => d.field == fieldname
                //         )[0]?.id
                //     )[0];
                //   childqtime =
                //     Answerdata?.updated_at == undefined &&
                //     Answerdata?.updated_at == null
                //       ? Answerdata?.created_at
                //       : Answerdata?.updated_at;
                //   enable = Answerdata?.data?.value == datatocheck ? true : false;
                // } else {
                //   enable = true;
                // }
                //  IsDisabled = !enable;
                let Answerdata =
                  formDetails?.data?.FormInvitation[0]?.FormSubmissions[0]?.Answers?.filter(
                    (x: any) => x.formFieldId == item.id
                  )[0];
                if (!!Answerdata) {
                  if (!!item.displayRules && !IsDisabled) {
                    const result = Boolean(
                      jsonata(item.displayRules[0].rule).evaluate(
                        Answerdata?.data?.value
                      )
                    )
                      ? false
                      : true;
                    IsDisabled = !result;
                  }
                } else {
                  if (!!item.displayRules) {
                    let parentdata: any = "";

                    if (
                      parentQuestiondata_new !== undefined &&
                      parentQuestiondata_new !== null &&
                      parentQuestiondata_new !== ""
                    ) {
                      parentdata = parentQuestiondata_new;
                    } else {
                      parentdata = parentQuestiondata;
                    }

                    if (!!parentdata) {
                      if (
                        parentdata?.data?.value === "yes" &&
                        item.displayRules[0].rule.includes("yes")
                      ) {
                        const result = Boolean(
                          jsonata(item.displayRules[0].rule).evaluate(
                            parentdata?.data?.value
                          )
                        )
                          ? false
                          : true;

                        IsDisabled = !result;
                      } else if (
                        parentdata?.data?.value === "no" &&
                        item.displayRules[0].rule.includes("no")
                      ) {
                        const result = Boolean(
                          jsonata(item.displayRules[0].rule).evaluate(
                            parentdata?.data?.value
                          )
                        )
                          ? false
                          : true;

                        IsDisabled = !result;
                      } else {
                        IsDisabled = true;
                      }
                    } else {
                      IsDisabled = true;
                    }
                  } else {
                    IsDisabled = false;
                  }
                }
                // parentquestionansertime =
                //   parentQuestiondata?.updated_at == undefined &&
                //   parentQuestiondata?.updated_at == null
                //     ? parentQuestiondata?.created_at
                //     : parentQuestiondata?.updated_at;
                // if (comments[0]?.created_at > childqtime) {
                //   childqtime = comments[0]?.created_at;
                // }
                // IsDisabled = !enable;
                // if (!IsDisabled) {
                //   if (childqtime < parentquestionansertime) {
                //     IsDisabled = true;
                //   }
                // }
              }
              if (lastquestionid != item?.Question?.id) {
                QNumber =
                  item !== undefined
                    ? item?.interfaceOptions?.subtitle !== undefined &&
                      item?.interfaceOptions?.subtitle !== ""
                      ? item?.interfaceOptions?.subtitle
                      : item?.interfaceOptions?.title !== undefined &&
                        item?.interfaceOptions?.title !== ""
                      ? item?.interfaceOptions?.title
                      : item?.fieldOptions.label !== undefined &&
                        item?.fieldOptions.label !== null &&
                        item?.fieldOptions.label !== ""
                      ? ""
                      : parentdata[0]?.interfaceOptions?.title !== undefined &&
                        parentdata[0]?.interfaceOptions?.title !== ""
                      ? parentdata[0]?.interfaceOptions?.title
                      : ""
                    : "";
                // item?.interfaceOptions?.title !== undefined &&
                // item?.interfaceOptions?.title !== ""
                //   ? item?.interfaceOptions?.title
                //   : QNumber !== undefined && QNumber != ""
                //   ? QNumber
                //   : item?.interfaceOptions?.subtitle;
              }
              return comments != undefined ? (
                comments?.filter((x: any) => x.formFieldId == item.id)?.length >
                0 ? (
                  <>
                    {lastquestionid != item?.Question?.id ? (
                      <Box className="breadCrumbsCointainer">
                        <p>
                          {console.log('breadcrumb',breadcrumb)}
                          {breadcrumb}
                          {/* {formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                            (g: any) => g.id === item.id
                          )[0].Section?.ParentSection !== null &&
                          formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                            (g: any) => g.id === item.id
                          )[0].Section?.ParentSection != undefined
                            ? formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                                (g: any) => g.id === item.id
                              )[0].Section?.ParentSection?.content +
                              " > " +
                              formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                                (g: any) => g.id === item.id
                              )[0].Section?.content +
                              Subtheme_label
                            : //+  //subtheme
                              //" > " +
                              //formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                              //  (g: any) => g.id === item.id // &&
                              // )[0].subtheme

                              formDetails?.data?.FormInvitation[0]?.Form?.FormFields?.filter(
                                (g: any) => g.id === item.id
                              )[0].Section?.content} */}
                        </p>
                      </Box>
                    ) : (
                      <Box></Box>
                    )}
                    <Box className={IsDisabled ? "disabledQuestion" : ""}>
                      <Box className="questionText">
                        <p
                          style={{
                            marginLeft:
                              lastquestionid == item?.Question?.id
                                ? "30px"
                                : "0px",
                          }}
                        >
                          {lastquestionid == item?.Question?.id ? "" : QNumber}
                          <span style={{ paddingLeft: "6px" }}>
                            {Qlabel !== "" && Qlabel !== undefined
                              ? Qlabel
                              : Qlabel_new}
                          </span>
                        </p>
                      </Box>
                      <Box mt={10} className="commentBox">
                        <FormFieldComment
                          invitationCommentsListData={comments?.filter(
                            (x: any) => x.formFieldId == item.id
                          )}
                        />
                      </Box>
                      <Group ml={IsDisabled ? 0 : 25} mb={15}>
                        <AddCommentButton formField={item} />
                        {IsDisabled ? (
                          <p className="actionBoxWarning">
                            This Quesiton is not applicable as the answer to
                            parent question was changed on &nbsp;
                            {dayjs(parentquestionansertime).format(
                              "DD MMM, YYYY hh:mm A"
                            )}
                          </p>
                        ) : (
                          <Button
                            color="solidBtn"
                            onClick={(e: any) =>
                              GoToQuestion(item?.Question?.id)
                            }
                          >
                            View Question Details
                          </Button>
                        )}
                      </Group>
                    </Box>
                    <p style={{ display: "none" }}>
                      {(lastquestionid = item?.Question?.id)}
                    </p>
                  </>
                ) : (
                  <></>
                )
              ) : (
                <></>
              );
            })}
          </Stack>
        </Box>
      )}
    </>
  );
};
export default CommentWithQuestionPopup;
