import { sdk } from "@warp/graphql/generated/server";
import {
  Answer_Insert_Input,
  BulkUpdateInterimRecommendationByInterimAnswerIdMutationVariables,
  Interim_Answer_Insert_Input,
  Interim_Recommendation_Updates,
  UpdateAnswerMutationVariables,
  UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables,
} from "@warp/graphql/generated/types";
import {
  FormInvitationStatus,
  RecommendationStatus,
} from "@warp/shared/constants/app.constants";
import jsonata from "jsonata";

export const saveAnswers = async (body: any) => {
  setAnswersData(
    body.data,
    body.submissionId,
    body.Answerdata,
    body.OtherAnswerData,
    body.questionId,
    body.userId,
    body.store
  );
};
const setAnswersData = async (
  data: any,
  submissionId: any,
  Answerdata: any,
  OtherAnswerData: any,
  questionId: any,
  userId: any,
  storeData: any
) => {
  let oldAnswer: any = [];
  let updatedAnswer: any = [];
  let InsertInterimAnsweronUpdateData: any = [];
  let InsertAnswerOnUpdate: any = [];
  let isIntrimAnswer: boolean = false;
  if (
    !!data &&
    !!data?.Interim_Answer &&
    data?.Interim_Answer?.length > 0 &&
    data?.FormSubmission[0]?.FormInvitation?.status ==
      FormInvitationStatus.Submitted
  ) {
    // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
    // Check FormInvitation interimCheck for isCarryForwardAsSuggestionsInvitation flag - skip interim answer operations if true
    const formInvitation = data?.FormSubmission[0]?.FormInvitation;
    const shouldSkipInterimAnswer =
      formInvitation?.interimCheck?.isCarryForwardAsSuggestionsInvitation;

    if (shouldSkipInterimAnswer) {
      // Skip interim answer operations when carry forward as suggestions is enabled
      isIntrimAnswer = false;
      InsertAnswerOnUpdate = [];
      if (Answerdata >= data?.Answer) {
        Answerdata?.map((item1: any) => {
          if (
            data?.Answer?.filter(
              (item2: any) => item2.formFieldId === item1.formFieldId
            ).length == 0
          ) {
            InsertAnswerOnUpdate.push(item1);
          }
        });
      }
    } else {
      oldAnswer = data?.Interim_Answer;
      updatedAnswer = Answerdata.filter(
        (item1: any) =>
          !oldAnswer.some(
            (item2: any) =>
              item2.formFieldId === item1.formFieldId &&
              item2.data.value === item1.value
          )
      );
      if (Answerdata >= oldAnswer) {
        Answerdata?.map((item1: any) => {
          if (
            oldAnswer?.filter(
              (item2: any) => item2.formFieldId === item1.formFieldId
            ).length == 0
          ) {
            InsertInterimAnsweronUpdateData.push(item1);
          }
        });
      }
      isIntrimAnswer = true;
    }
  } else {
    isIntrimAnswer = false;
    InsertAnswerOnUpdate = [];
    if (Answerdata >= data?.Answer) {
      Answerdata?.map((item1: any) => {
        if (
          data?.Answer?.filter(
            (item2: any) => item2.formFieldId === item1.formFieldId
          ).length == 0
        ) {
          InsertAnswerOnUpdate.push(item1);
        }
      });
    }
  }
  const formFieldResponse = await sdk.getFormFieldsByQuestionId({
    questionId: questionId,
  });
  const formfieldids = formFieldResponse?.FormField?.map(
    (item: any) => item.id
  );
  const RecommendationsData =
    await sdk.getRecomendationBySubmissionIdAndFormfieldId({
      submissionid: submissionId,
      formfieldid: formfieldids,
    });
  if (isIntrimAnswer) {
    // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
    // Check again if we should skip interim answer operations based on interimCheck flag
    const formInvitation = data?.FormSubmission[0]?.FormInvitation;
    const shouldSkipInterimAnswer =
      formInvitation?.interimCheck?.isCarryForwardAsSuggestionsInvitation;

    if (!shouldSkipInterimAnswer) {
      //Update Interim Answer
      let updateInterimData: UpdateInterimAnswerByQuestionIdAndSubmissionIdMutationVariables =
        {
          Interim_AnswerUpdate: [],
        };
      let updateInterimanswer: any = [];
      await Promise.all(
        updatedAnswer?.map((m: any) => {
          updateInterimanswer.push({
            where: {
              submissionId: {
                _eq: submissionId,
              },
              formFieldId: {
                _eq: m.formFieldId,
              },
            },
            _set: {
              data: {
                value: m.value,
              },
            },
          });
        })
      );
      updateInterimData.Interim_AnswerUpdate = updateInterimanswer;
      const result = await sdk.updateInterimAnswerByQuestionIdAndSubmissionId({
        Interim_AnswerUpdate: updateInterimData.Interim_AnswerUpdate,
      });
      await Promise.all(
        updatedAnswer.map(async (item: any) => {
          if (item.value) {
            await UpdateChildRecommendationStatus(
              formFieldResponse?.FormField,
              item.formFieldId,
              Answerdata,
              isIntrimAnswer,
              RecommendationsData,
              false,
              storeData
            );
          }
        })
      );
      //Insert child questions answer in Interim Answer
      const answerInsertData: Interim_Answer_Insert_Input[] = [];

      await Promise.all(
        InsertInterimAnsweronUpdateData.map((x: any) => {
          answerInsertData.push({
            submissionId: submissionId,
            questionId: x.questionId,
            formFieldId: x.formFieldId,
            data: {
              value: x.value,
            },
            created_by: userId,
            updated_by: userId,
          });
        })
      );
      const insertintoInterimAnser = await sdk.bulkInsertInterimAnswer({
        interinm_input: answerInsertData,
      });
    }
  } else {
    if (
      !!data &&
      !!data?.Answer?.filter((x: any) => x?.Interim_Answers.length > 0) &&
      data?.Answer?.filter((x: any) => x?.Interim_Answers.length > 0).length > 0
    ) {
      let updateAnswerData: UpdateAnswerMutationVariables = {
        AnswerUpdate: [],
      };
      updateAnswerData.AnswerUpdate = await Promise.all(
        OtherAnswerData?.map((m: any) => {
          let datas = {
            data: {
              value: m.value,
            },
          };
          let answerUpdationData = {
            where: {
              submissionId: {
                _eq: submissionId,
              },
              formFieldId: {
                _eq: m.formFieldId,
              },
            },
            _set: {
              data: {
                value: m.value,
              },
            },
          };
          return answerUpdationData;
        })
      );
      const returnupdateAnswer = await sdk.updateAnswer({
        AnswerUpdate: updateAnswerData.AnswerUpdate,
      });
      await Promise.all(
        updatedAnswer.map(async (item: any) => {
          if (item.value) {
            await UpdateChildRecommendationStatus(
              formFieldResponse?.FormField,
              item.formFieldId,
              Answerdata,
              isIntrimAnswer,
              RecommendationsData,
              true,
              storeData
            );
          }
        })
      );
      //Insert child questions answer in Answer table
      const answerBulkInsertData: Answer_Insert_Input[] = [];
      await Promise.all(
        InsertAnswerOnUpdate.map((x: any) => {
          answerBulkInsertData.push({
            submissionId: submissionId,
            questionId: x.questionId,
            formFieldId: x.formFieldId,
            data: {
              value: x.value,
            },
            created_by: userId,
            updated_by: userId,
          });
        })
      );
      const insertintoAnser = await sdk.bulkInsertAnswer({
        answerData: answerBulkInsertData,
      });
    } else if (
      !!data &&
      !!data?.Answer?.filter((x: any) => x?.Interim_Answers.length == 0) &&
      data?.Answer?.filter((x: any) => x?.Interim_Answers.length == 0).length ==
        data?.Answer?.length
    ) {
      const AnswerUpsertData: Answer_Insert_Input[] = [];
      await Promise.all(
        OtherAnswerData?.map((m: any) => {
          AnswerUpsertData.push({
            submissionId: submissionId,
            questionId: m.questionId,
            formFieldId: m.formFieldId,
            data: {
              value: m.value,
            },
            created_by: userId,
          });
        })
      );
      if (
        AnswerUpsertData != undefined &&
        AnswerUpsertData != null &&
        AnswerUpsertData.length > 0
      ) {
        const result = await sdk.upsertAnswer({
          answerData: AnswerUpsertData,
          submissionId: submissionId,
          questionId: questionId,
        });
      }
    }
  }
};
let changesDataArray: any = [];
const UpdateChildRecommendationStatus = async (
  maindata: any,
  formFieldId: any,
  answers: any,
  isIntrimAnswer: boolean,
  RecommendationsData: any,
  isDraftedCarry: boolean,
  storeData: any
) => {
  const answerDetails = storeData;
  // const maindata: any = [];
  // maindata.push(...da);
  if (maindata !== undefined && maindata?.length > 0) {
    let formFieldData: any = maindata?.filter(
      (field: any) => field.id === formFieldId
    );
    if (!!formFieldData && formFieldData.length > 0) {
      if (
        maindata.filter((d: any) => d.groupField === formFieldData[0].field)
          ?.length > 0
      ) {
        await Promise.all(
          maindata
            .filter((d: any) => d.groupField === formFieldData[0].field)
            ?.map(async (child: any) => {
              const IsVisible = Boolean(
                jsonata(child.displayRules[0].rule).evaluate(answerDetails)
              )
                ? true
                : false;
              let mainRecommendationdata: any =
                RecommendationsData?.Interim_Answer;
              if (isDraftedCarry) {
                mainRecommendationdata = RecommendationsData?.Answer;
              }
              if (
                !!mainRecommendationdata &&
                !!mainRecommendationdata?.filter(
                  (ans: any) => ans.formFieldId === child.id
                ) &&
                mainRecommendationdata?.filter(
                  (ans: any) => ans.formFieldId === child.id
                ).length > 0
              ) {
                if (isDraftedCarry) {
                  if (
                    !!mainRecommendationdata.filter(
                      (ans: any) => ans.formFieldId === child.id
                    )[0]?.Interim_Answers &&
                    mainRecommendationdata.filter(
                      (ans: any) => ans.formFieldId === child.id
                    )[0]?.Interim_Answers.length > 0
                  ) {
                    mainRecommendationdata
                      .filter((ans: any) => ans.formFieldId === child.id)[0]
                      ?.Interim_Answers[0]?.Interim_Recommendations.filter(
                        (s: any) => s.status != RecommendationStatus.Closed
                      )
                      ?.map((recom: any) => {
                        changesDataArray.push({
                          where: {
                            id: {
                              _eq: recom.id,
                            },
                          },
                          _set: {
                            status: IsVisible
                              ? RecommendationStatus.Open
                              : RecommendationStatus.NA,
                          },
                        });
                      });
                  }
                } else {
                  mainRecommendationdata
                    .filter((ans: any) => ans.formFieldId === child.id)[0]
                    ?.Interim_Recommendations.filter(
                      (s: any) => s.status != RecommendationStatus.Closed
                    )
                    ?.map((recom: any) => {
                      changesDataArray.push({
                        where: {
                          id: {
                            _eq: recom.id,
                          },
                        },
                        _set: {
                          status: IsVisible
                            ? RecommendationStatus.Open
                            : RecommendationStatus.NA,
                        },
                      });
                    });
                  if (
                    !!mainRecommendationdata.filter(
                      (ans: any) => ans.formFieldId === child.id
                    )[0]?.Interim_Answer &&
                    mainRecommendationdata.filter(
                      (ans: any) => ans.formFieldId === child.id
                    )[0]?.Interim_Answer.length > 0
                  ) {
                    mainRecommendationdata
                      .filter((ans: any) => ans.formFieldId === child.id)[0]
                      ?.Interim_Answer[0]?.Interim_Recommendations.filter(
                        (s: any) => s.status != RecommendationStatus.Closed
                      )
                      ?.map((recom: any) => {
                        changesDataArray.push({
                          where: {
                            id: {
                              _eq: recom.id,
                            },
                          },
                          _set: {
                            status: IsVisible
                              ? RecommendationStatus.Open
                              : RecommendationStatus.NA,
                          },
                        });
                      });
                  }
                }
              }
              await UpdateChildRecommendationStatus(
                maindata,
                child.id,
                answers,
                isIntrimAnswer,
                RecommendationsData,
                isDraftedCarry,
                storeData
              );
            })
        );
      } else {
        let data = maindata.filter((x: any) => x.id === formFieldData[0]?.id);
        const IsVisible = Boolean(
          jsonata(data[0]?.displayRules[0].rule).evaluate(answerDetails)
        )
          ? true
          : false;
        const ansData = answers.filter(
          (ans: any) => ans.formFieldId === formFieldData[0]?.id
        );
        let mainRecommendationdata: any = RecommendationsData?.Interim_Answer;
        if (isDraftedCarry) {
          mainRecommendationdata = RecommendationsData?.Answer;
        }
        if (
          !!mainRecommendationdata &&
          !!mainRecommendationdata?.filter(
            (ans: any) => ans.formFieldId === formFieldData[0]?.id
          ) &&
          mainRecommendationdata?.filter(
            (ans: any) => ans.formFieldId === formFieldData[0]?.id
          ).length > 0
        ) {
          if (isDraftedCarry) {
            if (
              !!mainRecommendationdata.filter(
                (ans: any) => ans.formFieldId === formFieldData[0]?.id
              )[0]?.Interim_Answers &&
              mainRecommendationdata.filter(
                (ans: any) => ans.formFieldId === formFieldData[0]?.id
              )[0]?.Interim_Answers.length > 0
            ) {
              await Promise.all(
                mainRecommendationdata
                  .filter(
                    (ans: any) => ans.formFieldId === formFieldData[0]?.id
                  )[0]
                  ?.Interim_Answers[0]?.Interim_Recommendations.filter(
                    (s: any) => s.status != RecommendationStatus.Closed
                  )
                  ?.map((recom: any) => {
                    changesDataArray.push({
                      where: {
                        id: {
                          _eq: recom.id,
                        },
                      },
                      _set: {
                        status: IsVisible
                          ? RecommendationStatus.Open
                          : RecommendationStatus.NA,
                      },
                    });
                  })
              );
            }
          } else {
            await Promise.all(
              mainRecommendationdata
                .filter(
                  (ans: any) => ans.formFieldId === formFieldData[0]?.id
                )[0]
                ?.Interim_Recommendations.filter(
                  (s: any) => s.status != RecommendationStatus.Closed
                )
                ?.map((recom: any) => {
                  changesDataArray.push({
                    where: {
                      id: {
                        _eq: recom.id,
                      },
                    },
                    _set: {
                      status: IsVisible
                        ? RecommendationStatus.Open
                        : RecommendationStatus.NA,
                    },
                  });
                })
            );
            if (
              !!mainRecommendationdata.filter(
                (ans: any) => ans.formFieldId === formFieldData[0]?.id
              )[0]?.Interim_Answer &&
              mainRecommendationdata.filter(
                (ans: any) => ans.formFieldId === formFieldData[0]?.id
              )[0]?.Interim_Answer.length > 0
            ) {
              await Promise.all(
                mainRecommendationdata
                  .filter(
                    (ans: any) => ans.formFieldId === formFieldData[0]?.id
                  )[0]
                  ?.Interim_Answer[0]?.Interim_Recommendations.filter(
                    (s: any) => s.status != RecommendationStatus.Closed
                  )
                  ?.map((recom: any) => {
                    changesDataArray.push({
                      where: {
                        id: {
                          _eq: recom.id,
                        },
                      },
                      _set: {
                        status: IsVisible
                          ? RecommendationStatus.Open
                          : RecommendationStatus.NA,
                      },
                    });
                  })
              );
            }
          }
        }
      }
    }
  }
  if (changesDataArray && changesDataArray?.length > 0) {
    let updatebulkrecommendation: BulkUpdateInterimRecommendationByInterimAnswerIdMutationVariables =
      {
        Interim_Recommendation: [],
      };
    const UpdateInterimRecommendation: Interim_Recommendation_Updates =
      changesDataArray.map((item: any) => {
        const input: any = {
          where: { id: { _eq: item.id } },
          _set: { status: item.NewStatus },
        };
        return input;
      });
    updatebulkrecommendation.Interim_Recommendation = changesDataArray;
    const results = await sdk.bulkUpdateInterimRecommendationByInterimAnswerId({
      Interim_Recommendation: updatebulkrecommendation.Interim_Recommendation,
    });
  }
};
