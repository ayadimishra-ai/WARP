import { ActionIcon, Box, Tooltip } from "@mantine/core";
import AddRecommendationIcon from "@warp/client/components/svgIcons/AddRecommendationIcon2";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import { warpAddRecommendationPopup } from "@warp/client/services/platform-window-message.service";
import { useGetInvitationDetailsQuery } from "@warp/graphql/queries/generated/get-forminvitation-details";
import { useGetRecommendationListByInvitationIdQuery } from "@warp/graphql/queries/generated/get-recommendation-list-by-invitation-id";
import {
  AppRoles,
  FormInvitationStatus,
  FormMode,
  RecommendationStatus,
} from "@warp/shared/constants/app.constants";
import { useRouter } from "next/router";
import Recommendation from "./Recommendation";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

type Props = {
  formField: any;
  answerOptionData: any;
};

const AddRecommendationButton = ({ formField, answerOptionData }: Props) => {
  const session = useUserSession();
  const { query } = useRouter();
  const { invitationId } = query;
  const isViewModeRecommendation = query?.mode === FormMode.ViewRecommendation;
  const isOnlyView = query?.mode === FormMode.View;
  const recommendationNewResponce: any = session?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new"
  );

  // const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
  //   variables: { type: "Recommendation_new" },
  // });

  const { data: recommendationList, loading } =
    useGetRecommendationListByInvitationIdQuery({
      variables: {
        invitationId: invitationId,
        questionId: formField?.Question?.id,
      },
    });

  const { data: invitationDetails } = useGetInvitationDetailsQuery({
    variables: {
      formId: formField?.formId,
      companyId: recommendationList?.FormInvitation[0]?.companyId,
    },
  });

  let recommendationArray: any = [];
  let isViewOnly: boolean = false;
  let recommendationListArray: any = [];
  //#region for isviewOnly
  if (
    !!recommendationList?.FormInvitation[0]?.FormSubmissions[0]
      ?.Interim_Answers &&
    recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.Interim_Answers
      .length > 0
  ) {
    recommendationListArray =
      recommendationList?.FormInvitation[0]?.FormSubmissions[0]
        ?.Interim_Answers;
  } else if (
    !!recommendationList?.FormInvitation[0]?.FormSubmissions[0]
      ?.carryforwardAfterSubmit &&
    recommendationList?.FormInvitation[0]?.FormSubmissions[0]
      ?.carryforwardAfterSubmit.length > 0
  ) {
    recommendationListArray =
      recommendationList?.FormInvitation[0]?.FormSubmissions[0]
        ?.carryforwardAfterSubmit;
  }
  if (recommendationListArray.length > 0) {
    if (
      recommendationListArray[0]?.isViewOnly !== undefined &&
      recommendationListArray[0]?.isViewOnly !== null
    ) {
      isViewOnly = recommendationListArray[0]?.isViewOnly;
    } else {
      isViewOnly = true;
    }
  } else {
    if (
      !!invitationDetails?.FormInvitation &&
      (invitationDetails?.FormInvitation[0]?.status ===
        FormInvitationStatus.Submitted ||
        invitationDetails?.FormInvitation[0]?.status ===
          FormInvitationStatus.Draft) &&
      recommendationList?.FormInvitation[0]?.id ===
        invitationDetails?.FormInvitation[0]?.id
    ) {
      isViewOnly = false;
    } else {
      isViewOnly = true;
    }
  }
  //#endregion
  let InterimAnswer: any =
    recommendationList?.FormInvitation[0]?.FormSubmissions[0]
      ?.addRecommendation;
  let invitationDate: any = recommendationList?.FormInvitation[0]?.created_at;

  let allrecommendation: any = [];
  if (
    !!recommendationList?.FormInvitation[0]?.FormSubmissions &&
    recommendationList?.FormInvitation[0]?.FormSubmissions.length > 0
  ) {
    const interimRecommendation =
      recommendationList?.FormInvitation[0]?.FormSubmissions[0]
        ?.Interim_Answers;
    const carryForwardinterimRecommendation =
      recommendationList?.FormInvitation[0]?.FormSubmissions[0]
        ?.carryforwardAfterSubmit;
    const carryforwardbeforeSubmit =
      recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.Answers;

    if (query?.mode != FormMode?.Start) {
      let interimRecommendationFormFieldData = interimRecommendation.filter(
        (item) => item.formFieldId == formField?.id
      );
      let carryForWardInterimRecommendationFormFieldData =
        carryForwardinterimRecommendation.filter(
          (item) => item.formFieldId == formField?.id
        );
      //#region  code for interim answer of current invitaion starts
      if (!!interimRecommendationFormFieldData.length) {
        if (
          interimRecommendationFormFieldData[0]?.Interim_Recommendations
            .length > 0
        ) {
          interimRecommendationFormFieldData[0].Interim_Recommendations?.map(
            (selfrecomitems: any) => {
              allrecommendation.push(selfrecomitems);
            }
          );
        }
      }
      //#endregion

      //#region code for interim answer of carryforward invitaion starts
      if (!!carryForWardInterimRecommendationFormFieldData.length) {
        if (
          !!carryForWardInterimRecommendationFormFieldData[0]?.Interim_Answer
        ) {
          carryForWardInterimRecommendationFormFieldData[0]?.Interim_Answer?.Interim_Recommendations?.map(
            (items: any) => {
              if (
                items.status == RecommendationStatus.NA ||
                items.status == RecommendationStatus.Closed
              ) {
                if (items.updated_at > invitationDate) {
                  allrecommendation.push(items);
                }
              } else {
                allrecommendation.push(items);
              }
            }
          );
        }
      } else {
        allrecommendation = allrecommendation;
      }
      //#endregion
    } else {
      //#region code for carryforward invitation for start mode
      let formfielddata = carryforwardbeforeSubmit.filter(
        (item) => item.formFieldId == formField?.id
      );
      if (!!formfielddata && formfielddata.length > 0) {
        //#region first condition of start mode
        if (
          !!formfielddata[0]?.carryforwardbeforesubmit0 &&
          formfielddata[0]?.carryforwardbeforesubmit0.length > 0
        ) {
          if (
            formfielddata[0]?.carryforwardbeforesubmit0[0]
              .Interim_Recommendations.length > 0
          ) {
            if (!isViewModeRecommendation) {
              formfielddata[0]?.carryforwardbeforesubmit0[0].Interim_Recommendations.filter(
                (f: any) =>
                  f.status != RecommendationStatus.NA &&
                  f.status != RecommendationStatus.Closed
              )?.map((selfrecomitems: any) => {
                allrecommendation.push(selfrecomitems);
              });
            } else {
              formfielddata[0]?.carryforwardbeforesubmit0[0].Interim_Recommendations?.map(
                (selfrecomitems: any) => {
                  allrecommendation.push(selfrecomitems);
                }
              );
            }
          }
        }
        //#endregion

        //#region second condition of start mode
        if (
          !!formfielddata[0]?.carryforwardbeforesubmit1 &&
          formfielddata[0]?.carryforwardbeforesubmit1.length > 0
        ) {
          if (!!formfielddata[0]?.carryforwardbeforesubmit1[0].Interim_Answer) {
            !!formfielddata[0]?.carryforwardbeforesubmit1[0].Interim_Answer?.Interim_Recommendations?.map(
              (items: any) => {
                if (
                  items.status == RecommendationStatus.NA ||
                  items.status == RecommendationStatus.Closed
                ) {
                  if (items.updated_at > invitationDate) {
                    allrecommendation.push(items);
                  }
                } else {
                  allrecommendation.push(items);
                }
              }
            );
          } else {
            allrecommendation = allrecommendation;
          }
        }
        //#endregion

        //#region third condition of start mode
        if (
          !!formfielddata[0]?.carryforwardbeforesubmit2 &&
          formfielddata[0]?.carryforwardbeforesubmit2.length > 0
        ) {
          if (
            !!formfielddata[0]?.carryforwardbeforesubmit2[0]?.Interim_Answers
          ) {
            formfielddata[0]?.carryforwardbeforesubmit2[0]?.Interim_Answers[0]?.Interim_Recommendations?.filter(
              (x: any) =>
                x.status !== RecommendationStatus.NA &&
                x.status !== RecommendationStatus.Closed
            )?.map((items: any) => {
              allrecommendation.push(items);
            });
          } else {
            allrecommendation = allrecommendation;
          }
        }
        //#endregion
      }
      //#endregion
    }
    recommendationArray = allrecommendation;
  }

  const clickHandler = async (event: any) => {
    let objFormdata = {
      interimAnswerId: InterimAnswer.filter(
        (x: any) => x.formFieldId === formField?.id
      )?.[0]?.id,
      questionId: formField?.Question?.id,
      answerOption: answerOptionData,
      formId: formField?.formId,
    };
    postParentMessage(
      warpAddRecommendationPopup(true, objFormdata, "Add Recommendation", false)
    );
  };
  let interfacesForUpdateAnswerOption: any = [
    "input",
    "input-multiline",
    "number-input",
    "select-dropdown",
    "select-multiple-dropdown",
    "file",
  ];
  let issinglerecommendation: boolean = false;
  if (
    interfacesForUpdateAnswerOption.filter(
      (d: any) => d == formField?.interface
    ).length > 0
  ) {
    issinglerecommendation = true;
  }
  let FormHasRecommendation: any = [];
  if (!!recommendationNewResponce) {
    FormHasRecommendation = recommendationNewResponce[0]?.data.filter(
      (rec: any) => rec.FormId === formField?.formId
    );
  }
  return FormHasRecommendation?.length > 0 ? (
    !!recommendationArray ? (
      session?.user?.role === AppRoles.Inviter ||
      session?.user?.role === AppRoles.Consultant ? (
        recommendationArray?.length === 0 ? (
          recommendationList?.FormInvitation[0]?.status ===
            FormInvitationStatus.Submitted &&
          FormHasRecommendation[0]?.IsManualApproverer === true &&
          FormHasRecommendation[0]?.IsAutoRecommendation === false &&
          !FormHasRecommendation[0]?.noRecommendationIcon &&
          !isViewOnly &&
          !recommendationList?.FormInvitation[0]?.FormSubmissions[0]
            .addRecommendation[0].isViewOnly ? (
            <Tooltip
              offset={0}
              position="bottom-start"
              label="Add Recommendation"
            >
              <ActionIcon
                variant="transparent"
                onClick={clickHandler}
                style={{ zIndex: 299, pointerEvents: "all" }}
                className="recommandation-button-group"
              >
                <AddRecommendationIcon />
              </ActionIcon>
            </Tooltip>
          ) : (
            <></>
          )
        ) : recommendationArray.filter(
            (x: any) => x.status === RecommendationStatus.Closed
          )?.length > 0 ? (
          issinglerecommendation ? (
            <Box w="100%">
              <Recommendation
                recommendations={recommendationArray}
                formField={formField}
                formStatus={recommendationList?.FormInvitation[0]?.status}
                isCarryForward={
                  recommendationList?.FormInvitation[0]?.interimCheck
                    ?.isCarryForward
                }
                submissionId={
                  recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.id
                }
                invitationId={recommendationList?.FormInvitation[0]?.id}
                isViewOnly={isViewOnly}
                companyId={recommendationList?.FormInvitation[0]?.companyId}
                queryMode={String(query?.mode)}
              />
            </Box>
          ) : String(
              recommendationArray.filter(
                (x: any) => x.status === RecommendationStatus.Closed
              )[0]?.answeroption
            ).toLowerCase() !== String(answerOptionData).toLowerCase() ? (
            !!recommendationArray.filter(
              (d: any) =>
                String(d.answeroption).toLowerCase() ==
                String(answerOptionData).toLowerCase()
            ) &&
            recommendationArray.filter(
              (d: any) =>
                String(d.answeroption).toLowerCase() ==
                String(answerOptionData).toLowerCase()
            ).length > 0 ? (
              <Box w="100%">
                <Recommendation
                  recommendations={recommendationArray.filter(
                    (d: any) =>
                      String(d.answeroption).toLowerCase() ==
                      String(answerOptionData).toLowerCase()
                  )}
                  formField={formField}
                  formStatus={recommendationList?.FormInvitation[0]?.status}
                  isCarryForward={
                    recommendationList?.FormInvitation[0]?.interimCheck
                      ?.isCarryForward
                  }
                  submissionId={
                    recommendationList?.FormInvitation[0]?.FormSubmissions[0]
                      ?.id
                  }
                  invitationId={recommendationList?.FormInvitation[0]?.id}
                  isViewOnly={isViewOnly}
                  companyId={recommendationList?.FormInvitation[0]?.companyId}
                  queryMode={String(query?.mode)}
                />
              </Box>
            ) : isViewModeRecommendation ? (
              recommendationList?.FormInvitation[0]?.status ===
                FormInvitationStatus.Submitted &&
              FormHasRecommendation[0]?.IsManualApproverer === true &&
              FormHasRecommendation[0]?.IsAutoRecommendation === false &&
              !FormHasRecommendation[0]?.noRecommendationIcon &&
              !isViewOnly &&
              !recommendationList?.FormInvitation[0]?.FormSubmissions[0]
                .addRecommendation[0].isViewOnly ? (
                <Tooltip
                  offset={0}
                  position="bottom-start"
                  label="Add Recommendation"
                >
                  <ActionIcon
                    variant="transparent"
                    onClick={clickHandler}
                    style={{ zIndex: 299, pointerEvents: "all" }}
                  >
                    <AddRecommendationIcon />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <></>
              )
            ) : isOnlyView &&
              !recommendationList?.FormInvitation[0]?.interimCheck
                ?.isCarryForward ? (
              recommendationList?.FormInvitation[0]?.status ===
                FormInvitationStatus.Submitted &&
              FormHasRecommendation[0]?.IsManualApproverer === true &&
              FormHasRecommendation[0]?.IsAutoRecommendation === false &&
              !FormHasRecommendation[0]?.noRecommendationIcon &&
              !isViewOnly &&
              !recommendationList?.FormInvitation[0]?.FormSubmissions[0]
                .addRecommendation[0].isViewOnly ? (
                <Tooltip
                  offset={0}
                  position="bottom-start"
                  label="Add Recommendation"
                >
                  <ActionIcon
                    variant="transparent"
                    onClick={clickHandler}
                    style={{ zIndex: 299, pointerEvents: "all" }}
                  >
                    <AddRecommendationIcon />
                  </ActionIcon>
                </Tooltip>
              ) : (
                <></>
              )
            ) : (
              <></>
            )
          ) : (
            <Box w="100%">
              <Recommendation
                recommendations={recommendationArray.filter(
                  (d: any) =>
                    String(d.answeroption).toLowerCase() ==
                    String(answerOptionData).toLowerCase()
                )}
                formField={formField}
                formStatus={recommendationList?.FormInvitation[0]?.status}
                isCarryForward={
                  recommendationList?.FormInvitation[0]?.interimCheck
                    ?.isCarryForward
                }
                submissionId={
                  recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.id
                }
                invitationId={recommendationList?.FormInvitation[0]?.id}
                isViewOnly={isViewOnly}
                companyId={recommendationList?.FormInvitation[0]?.companyId}
                queryMode={String(query?.mode)}
              />
            </Box>
          )
        ) : recommendationArray.filter(
            (x: any) =>
              String(x.answeroption).toLowerCase() ===
              String(answerOptionData).toLowerCase()
          )?.length > 0 ? (
          <Box w="100%">
            <Recommendation
              recommendations={recommendationArray.filter(
                (d: any) =>
                  String(d.answeroption).toLowerCase() ==
                  String(answerOptionData).toLowerCase()
              )}
              formField={formField}
              formStatus={recommendationList?.FormInvitation[0]?.status}
              isCarryForward={
                recommendationList?.FormInvitation[0]?.interimCheck
                  ?.isCarryForward
              }
              submissionId={
                recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.id
              }
              invitationId={recommendationList?.FormInvitation[0]?.id}
              isViewOnly={isViewOnly}
              companyId={recommendationList?.FormInvitation[0]?.companyId}
              queryMode={String(query?.mode)}
            />
          </Box>
        ) : issinglerecommendation ? (
          <Box w="100%">
            <Recommendation
              recommendations={recommendationArray}
              formField={formField}
              formStatus={recommendationList?.FormInvitation[0]?.status}
              isCarryForward={
                recommendationList?.FormInvitation[0]?.interimCheck
                  ?.isCarryForward
              }
              submissionId={
                recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.id
              }
              invitationId={recommendationList?.FormInvitation[0]?.id}
              isViewOnly={isViewOnly}
              companyId={recommendationList?.FormInvitation[0]?.companyId}
              queryMode={String(query?.mode)}
            />
          </Box>
        ) : (
          <></>
        )
      ) : recommendationArray?.length > 0 ? (
        issinglerecommendation ? (
          <Box w="100%">
            <Recommendation
              recommendations={recommendationArray}
              formField={formField}
              formStatus={recommendationList?.FormInvitation[0]?.status}
              isCarryForward={
                recommendationList?.FormInvitation[0]?.interimCheck
                  ?.isCarryForward
              }
              submissionId={
                recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.id
              }
              invitationId={recommendationList?.FormInvitation[0]?.id}
              isViewOnly={isViewOnly}
              companyId={recommendationList?.FormInvitation[0]?.companyId}
              queryMode={String(query?.mode)}
            />
          </Box>
        ) : recommendationArray.filter(
            (x: any) =>
              String(x.answeroption).toLowerCase() ===
              String(answerOptionData).toLowerCase()
          )?.length > 0 ? (
          recommendationArray.filter(
            (d: any) =>
              String(d.answeroption).toLowerCase() ==
              String(answerOptionData).toLowerCase()
          )[0].status === RecommendationStatus.Closed ? (
            recommendationArray.filter(
              (d: any) =>
                String(d.answeroption).toLowerCase() ==
                  String(answerOptionData).toLowerCase() &&
                d.status === RecommendationStatus.Closed
            )[0]?.updated_at > invitationDate ? (
              <Box w="100%">
                <Recommendation
                  recommendations={recommendationArray.filter(
                    (d: any) =>
                      String(d.answeroption).toLowerCase() ==
                      String(answerOptionData).toLowerCase()
                  )}
                  formField={formField}
                  formStatus={recommendationList?.FormInvitation[0]?.status}
                  submissionId={
                    recommendationList?.FormInvitation[0]?.FormSubmissions[0]
                      ?.id
                  }
                  isCarryForward={
                    recommendationList?.FormInvitation[0]?.interimCheck
                      ?.isCarryForward
                  }
                  invitationId={recommendationList?.FormInvitation[0]?.id}
                  isViewOnly={isViewOnly}
                  companyId={recommendationList?.FormInvitation[0]?.companyId}
                  queryMode={String(query?.mode)}
                />
              </Box>
            ) : (
              <></>
            )
          ) : (
            <Box w="100%">
              <Recommendation
                recommendations={recommendationArray.filter(
                  (d: any) =>
                    String(d.answeroption).toLowerCase() ==
                    String(answerOptionData).toLowerCase()
                )}
                formField={formField}
                formStatus={recommendationList?.FormInvitation[0]?.status}
                isCarryForward={
                  recommendationList?.FormInvitation[0]?.interimCheck
                    ?.isCarryForward
                }
                submissionId={
                  recommendationList?.FormInvitation[0]?.FormSubmissions[0]?.id
                }
                invitationId={recommendationList?.FormInvitation[0]?.id}
                isViewOnly={isViewOnly}
                companyId={recommendationList?.FormInvitation[0]?.companyId}
                queryMode={String(query?.mode)}
              />
            </Box>
          )
        ) : (
          <></>
        )
      ) : (
        <></>
      )
    ) : (
      <></>
    )
  ) : (
    <></>
  );
};
export default AddRecommendationButton;
