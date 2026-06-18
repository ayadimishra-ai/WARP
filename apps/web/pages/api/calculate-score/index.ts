import { cloneDeep } from "@apollo/client/utilities";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import {
  FormResult_Insert_Input,
  Interim_Answer_Insert_Input,
  Interim_Answer_Updates,
  Interim_Recommendation_Insert_Input,
} from "@warp/graphql/generated/types";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { uploadError } from "@warp/server/services/aws-s3.service";
import {
  FormInvitationStatus,
  RecommendationStatus,
} from "@warp/shared/constants/app.constants";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jsonata from "jsonata";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
const fillrecommendationArray = (
  eachobjectitem: any,
  question: any,
  invitedBy: any,
  isAnswer: boolean,
  recommendationWithFormfieldData: any[]
) => {
  for (let i = 0; i < eachobjectitem.length; i++) {
    let datas: any = {};
    let formfield: any = question?.FormFields;
    if (isAnswer) {
      datas = {
        [eachobjectitem[i][0]]: {
          value: eachobjectitem[i][1].value,
        },
      };
      formfield = question?.FormFields?.filter(
        (x: any) => x.field == eachobjectitem[i][0]
      )[0];
    } else {
      formfield = eachobjectitem[i];
    }
    if (
      recommendationWithFormfieldData.filter(
        (x: any) => x.formfieldId == formfield?.id
      ).length == 0
    ) {
      const singlerecommendations: any = !!formfield?.recommendationCalc
        ?.recommendation
        ? jsonata(formfield?.recommendationCalc?.recommendation).evaluate(
            datas
          ) ?? []
        : [];
      if (singlerecommendations != null) {
        if (Array.isArray(singlerecommendations)) {
          for (let j = 0; j < singlerecommendations.length; j++) {
            let isAddRecommendation: boolean = true;
            let answerData: any = question?.Answers.filter(
              (f: any) => f?.FormField?.id === formfield?.id
            )[0];
            let answerOptionValue: any = String(
              singlerecommendations[j]?.value
            );
            if (
              !!answerData?.Interim_Answers &&
              answerData?.Interim_Answers.length > 0
            ) {
              if (
                !!answerData?.Interim_Answers[0]?.Interim_Recommendations.filter(
                  (x: any) => x?.answeroption === answerOptionValue
                ) &&
                answerData?.Interim_Answers[0]?.Interim_Recommendations.filter(
                  (x: any) => x?.answeroption === answerOptionValue
                ).length > 0
              ) {
                if (
                  answerData?.Interim_Answers[0]?.Interim_Recommendations.filter(
                    (x: any) => x?.answeroption === answerOptionValue
                  )[0].status === RecommendationStatus.Closed
                ) {
                  isAddRecommendation = true;
                } else {
                  isAddRecommendation = false;
                }
              } else {
                isAddRecommendation = true;
              }
            } else {
              isAddRecommendation = true;
            }
            if (isAddRecommendation) {
              if (
                recommendationWithFormfieldData.filter(
                  (s: any) =>
                    s.Recommendation === singlerecommendations[j].comment &&
                    s.formfieldId === formfield?.id &&
                    s.answeroption === String(answerOptionValue)
                ).length === 0
              ) {
                recommendationWithFormfieldData.push({
                  Recommendation: singlerecommendations[j].comment,
                  formfieldId: formfield?.id,
                  created_by: invitedBy,
                  updated_by: invitedBy,
                  questionId: question.id,
                  answeroption: String(answerOptionValue),
                });
              }
            }
          }
        } else {
          let answerOptionValues: any = String(singlerecommendations.value);
          let isaddrecommendationElse: boolean = true;
          let answerData = question?.Answers.filter(
            (f: any) => f?.FormField?.id === formfield?.id
          )[0];
          if (
            !!answerData?.Interim_Answers &&
            answerData?.Interim_Answers.length > 0
          ) {
            if (
              !!answerData?.Interim_Answers[0]?.Interim_Recommendations.filter(
                (x: any) => x?.answeroption === answerOptionValues
              ) &&
              answerData?.Interim_Answers[0]?.Interim_Recommendations.filter(
                (x: any) => x?.answeroption === answerOptionValues
              ).length > 0
            ) {
              if (
                answerData?.Interim_Answers[0]?.Interim_Recommendations.filter(
                  (x: any) => x?.answeroption === answerOptionValues
                )[0].status === RecommendationStatus.Closed
              ) {
                isaddrecommendationElse = true;
              } else {
                isaddrecommendationElse = false;
              }
            } else {
              isaddrecommendationElse = true;
            }
          } else {
            isaddrecommendationElse = true;
          }
          if (isaddrecommendationElse) {
            if (
              recommendationWithFormfieldData.filter(
                (s: any) =>
                  s.Recommendation === singlerecommendations.comment &&
                  s.formfieldId === formfield?.id &&
                  s.answeroption === String(answerOptionValues)
              ).length == 0
            ) {
              recommendationWithFormfieldData.push({
                Recommendation: singlerecommendations.comment,
                formfieldId: formfield?.id,
                created_by: invitedBy,
                updated_by: invitedBy,
                questionId: question.id,
                answeroption: String(answerOptionValues),
              });
            }
          }
        }
      }
    }
  }
};
const calculateScore = async (
  formId: string,
  submissionId: string,
  invitationId: string
) => {
  const recommendationWithFormfieldData: any[] = [];
  const result = await sdk.getScoreCalculationDetails({
    formId,
    invitationId,
    submissionId,
  });
  // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
  // Get FormInvitation details to check interimCheck flag
  const formInvitationDetails = await sdk.getFormInvitationDetailsbyId({
    invitationId: invitationId,
    sourceType: "form",
  });
  const triggerResult = result?.GlobalMaster;
  const sectionScoreInput: any = {};
  const companyId = result.FormInvitation[0]?.companyId;
  const finalResult: FormResult_Insert_Input[] = [];
  let clonedeepInterimCheck: any = cloneDeep(
    result.FormInvitation[0]?.interimCheck
  );
  try {
    const invitedBy = result.FormInvitation[0]?.created_by;
    const form = result?.Form[0];
    if (!form) throw new Error("Invalid form submission");

    const originalResult = await sdk.getFormResultBySubmissionId({
      submissionId: submissionId,
    });

    const formResult = originalResult.FormResult;

    type FormSectionType = typeof result.Form[0]["Sections"][0];
    type FormSectionWithChildrenType = FormSectionType & {
      children: FormSectionWithChildrenType[];
    };
    const calcTreeChildren = (
      original: FormSectionType[],
      currentSection: FormSectionType
    ) => {
      let children: FormSectionType[] = original
        .filter((m) => m.sectionId === currentSection.id)
        .map((m) => calcTreeChildren(original, m));

      return { ...currentSection, children } as FormSectionWithChildrenType;
    };

    const treeMapSections = result.Form[0]?.Sections.reduce(
      (acc, curr, index, original) => {
        if (!curr.sectionId) acc.push(calcTreeChildren(original, curr));
        return acc;
      },
      [] as FormSectionWithChildrenType[]
    );
    const interimAnswer: Interim_Answer_Insert_Input[] = [];
    const updateInterimAnswer: Interim_Answer_Updates[] = [];
    let isrecommendation: boolean = false;
    const calculateChildrenScore = async (
      currentSection: FormSectionWithChildrenType
    ) => {
      // has questions
      if (!!currentSection.Questions.length) {
        for (let k = 0; k < currentSection.Questions.length; k++) {
          const question = currentSection.Questions[k];
          const _questionScoreInput = question.Answers.reduce((acc, curr) => {
            if (!!curr.FormField?.field) {
              acc[curr.FormField.field] = curr.data;
            }

            return acc;
          }, {} as any);
          const score = !!question.calc?.expression
            ? jsonata(question.calc.expression).evaluate(_questionScoreInput) ??
              0
            : 0;

          // question.key == "s4_q1" &&
          //   console.log(
          //     JSON.stringify({
          //       score,
          //       question,
          //       _questionScoreInput,
          //     })
          //   );

          // console.log(JSON.stringify({ question, questionScoreInput }));
          const recommendations = !!question.calc?.recommendation
            ? jsonata(question.calc.recommendation).evaluate(
                _questionScoreInput
              ) ?? []
            : [];

          const id = formResult.find(
            (m) =>
              m.submissionId === submissionId &&
              m.sectionId === currentSection.id &&
              m.questionId === question.id
          )?.id;
          sectionScoreInput[question.key] = score;
          finalResult.push({
            ...{ ...(id ? { id } : {}) },
            submissionId,
            sectionId: currentSection.id,
            questionId: question.id,
            score,
            recommendations,
            isActive: true,
          });
          if (
            result?.reopenlist_GlobalMaster[0].data?.filter(
              (x: any) => x.FormId == formId
            )?.length > 0
          ) {
            if (
              question.calc?.recommendation != undefined &&
              _questionScoreInput != null &&
              _questionScoreInput != ""
            ) {
              let allCheckBoxes: any = currentSection.Questions.filter(
                (x: any) => x.id == question.id
              )[0]?.FormFields.filter(
                (x: any) =>
                  (x?.interface == "select-multiple-checkbox" ||
                    x?.interface == "file") &&
                  _questionScoreInput[x?.field] == undefined
              );
              if (!!allCheckBoxes && allCheckBoxes.length > 0) {
                let toFillrecommendation: any = [];
                for (let m = 0; m < allCheckBoxes.length; m++) {
                  if (!!allCheckBoxes[m].displayRules) {
                    const isTrue = Boolean(
                      jsonata(allCheckBoxes[m].displayRules[0].rule).evaluate(
                        _questionScoreInput
                      )
                    )
                      ? true
                      : false;
                    if (isTrue) {
                      toFillrecommendation.push(allCheckBoxes[m]);
                    }
                  } else {
                    toFillrecommendation.push(allCheckBoxes[m]);
                  }
                }
                fillrecommendationArray(
                  toFillrecommendation,
                  question,
                  invitedBy,
                  false,
                  recommendationWithFormfieldData
                );
              }
              let eachobjectitem = Object.entries(_questionScoreInput);
              if (Array.isArray(eachobjectitem)) {
                fillrecommendationArray(
                  eachobjectitem,
                  question,
                  invitedBy,
                  true,
                  recommendationWithFormfieldData
                );
              }
            }
            let interimAnswerId: any = null;

            for (let n = 0; n < question?.Answers.length; n++) {
              let interimAnswerData = question?.Interim_Answers.filter(
                (d: any) =>
                  d.FormField?.id == question?.Answers[n].FormField?.id &&
                  d.submissionId == submissionId
              );
              let allCheckBoxes: any = currentSection.Questions.filter(
                (x: any) => x.id == question.id
              )[0]?.FormFields.filter(
                (x: any) =>
                  (x?.interface == "select-multiple-checkbox" ||
                    x?.interface == "file") &&
                  _questionScoreInput[x?.field] == undefined
              );
              interimAnswerId = null;
              if (question?.Answers[n]?.Interim_Answers?.length > 0) {
                interimAnswerId =
                  question?.Answers[n]?.Interim_Answers[0]?.interim_answer_id;
                if (
                  interimAnswerId == null ||
                  interimAnswerId == "" ||
                  interimAnswerId == undefined
                ) {
                  interimAnswerId =
                    question?.Answers[n]?.Interim_Answers[0]?.id;
                }
              }
              if (!!allCheckBoxes && allCheckBoxes.length > 0) {
                for (let g = 0; g < allCheckBoxes.length; g++) {
                  const currentInterimData = interimAnswer.filter(
                    (item) =>
                      item.questionId == question.id &&
                      item.submissionId == submissionId &&
                      item.formFieldId == allCheckBoxes[g]?.id
                  );
                  if (currentInterimData.length == 0) {
                    let isManipulateInterimAnswer: boolean = false;
                    if (!!allCheckBoxes[g].displayRules) {
                      isManipulateInterimAnswer = Boolean(
                        jsonata(allCheckBoxes[g].displayRules[0].rule).evaluate(
                          _questionScoreInput
                        )
                      )
                        ? true
                        : false;
                    } else {
                      isManipulateInterimAnswer = true;
                    }
                    if (isManipulateInterimAnswer) {
                      let checkBoxInterimAnswer: any =
                        question?.Interim_Answers.filter(
                          (d: any) =>
                            d.FormField?.id == allCheckBoxes[g]?.id &&
                            d.submissionId == submissionId
                        );
                      if (checkBoxInterimAnswer.length == 0) {
                        interimAnswer.push({
                          questionId: question.id,
                          data: { value: [] },
                          submissionId: submissionId,
                          created_by: question?.Answers[n].created_by,
                          updated_by: question?.Answers[n].updated_by,
                          status: question?.Answers[n].status,
                          formFieldId: allCheckBoxes[g]?.id,
                          interim_answer_id: interimAnswerId,
                        });
                      } else {
                        updateInterimAnswer.push({
                          where: {
                            id: {
                              _eq: checkBoxInterimAnswer[0].id,
                            },
                          },
                          _set: {
                            data: checkBoxInterimAnswer[0].data,
                          },
                        });
                      }
                    }
                  }
                }
              }
              if (interimAnswerData.length > 0) {
                updateInterimAnswer.push({
                  where: {
                    id: {
                      _eq: interimAnswerData[0].id,
                    },
                  },
                  _set: {
                    data: question?.Answers[n].data,
                  },
                });
              } else {
                interimAnswer.push({
                  questionId: question.id,
                  data: question?.Answers[n].data,
                  submissionId: submissionId,
                  created_by: question?.Answers[n].created_by,
                  updated_by: question?.Answers[n].updated_by,
                  status: question?.Answers[n].status,
                  formFieldId: question?.Answers[n].FormField?.id,
                  interim_answer_id: interimAnswerId,
                });
              }
              interimAnswerId = null;
            }
          }
        }
      }
      // has children
      if (!!currentSection.children.length) {
        currentSection.children.forEach((m) => calculateChildrenScore(m));
      }
      const score = !!currentSection.calc?.expression
        ? jsonata(currentSection.calc.expression).evaluate(sectionScoreInput) ??
          0
        : 0;

      // console.log(JSON.stringify({ currentSection, sectionScoreInput }));
      const recommendations = !!currentSection.calc?.recommendation
        ? jsonata(currentSection.calc.recommendation).evaluate(
            sectionScoreInput
          ) ?? []
        : [];
      const id = formResult.find(
        (m) =>
          m.submissionId === submissionId &&
          m.sectionId === currentSection.id &&
          m.questionId === null
      )?.id;
      sectionScoreInput[currentSection.key] = score;
      finalResult.push({
        ...{ ...(id ? { id } : {}) },
        submissionId,
        sectionId: currentSection.id,
        questionId: null,
        score,
        recommendations,
        isActive: true,
      });
    };
    for (let b = 0; b < treeMapSections.length; b++) {
      calculateChildrenScore(treeMapSections[b]);
    }

    // Calculate score for form
    const score = !!form.calc?.expression
      ? jsonata(form.calc.expression).evaluate(sectionScoreInput) ?? 0
      : 0;
    const recommendations = !!form.calc?.recommendation
      ? jsonata(form.calc.recommendation).evaluate(sectionScoreInput) ?? []
      : [];

    const id = formResult.find(
      (m) =>
        m.submissionId === submissionId &&
        m.sectionId === null &&
        m.questionId === null
    )?.id;
    finalResult.push({
      ...{ ...(id ? { id } : {}) },
      submissionId,
      sectionId: null,
      questionId: null,
      score,
      recommendations,
      isActive: true,
    });
    // return finalResult;
    let recommendationDetail: any = [];
    let interimAnswerCarryForwardedData: any = [];

    if (
      result?.reopenlist_GlobalMaster[0].data?.filter(
        (x: any) => x.FormId == formId
      )?.length > 0
    ) {
      if (updateInterimAnswer.length > 0) {
        const updateInterimAnswerResult =
          await sdk.updateInterimAnswerByQuestionIdAndSubmissionId({
            Interim_AnswerUpdate: updateInterimAnswer,
          });
      }
      if (!!interimAnswer && interimAnswer.length > 0) {
        interimAnswerCarryForwardedData = interimAnswer.filter(
          (x: any) => x.interim_answer_id !== null
        );
        // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
        // Check FormInvitation interimCheck for isCarryForwardAsSuggestionsInvitation flag - skip insertion if true
        const shouldSkipInterimAnswer =
          formInvitationDetails?.FormInvitation?.[0]?.interimCheck
            ?.isCarryForwardAsSuggestionsInvitation;

        if (!shouldSkipInterimAnswer) {
          const insertInterimAnswer = await sdk.bulkInsertInterimAnswer({
            interinm_input: interimAnswer,
          });
          if (
            insertInterimAnswer?.insert_Interim_Answer != undefined &&
            insertInterimAnswer?.insert_Interim_Answer != null &&
            insertInterimAnswer?.insert_Interim_Answer?.affected_rows > 0
          ) {
            const interimRecommend: Interim_Recommendation_Insert_Input[] = [];
            let intermid: any = null;
            for (let v = 0; v < recommendationWithFormfieldData.length; v++) {
              intermid =
                !!insertInterimAnswer?.insert_Interim_Answer?.returning.filter(
                  (x: any) =>
                    x.formFieldId ==
                    recommendationWithFormfieldData[v].formfieldId
                ) &&
                insertInterimAnswer?.insert_Interim_Answer?.returning.filter(
                  (x: any) =>
                    x.formFieldId ==
                    recommendationWithFormfieldData[v].formfieldId
                )?.length > 0
                  ? insertInterimAnswer?.insert_Interim_Answer?.returning.filter(
                      (x: any) =>
                        x.formFieldId ==
                        recommendationWithFormfieldData[v].formfieldId
                    )[0]?.id
                  : null;
              if (intermid == undefined) {
                intermid = null;
              }
              interimRecommend.push({
                recommendations:
                  recommendationWithFormfieldData[v].Recommendation,
                interim_answer_id: intermid,
                answeroption: recommendationWithFormfieldData[v].answeroption,
                created_by: recommendationWithFormfieldData[v].created_by,
                updated_by: recommendationWithFormfieldData[v].updated_by,
                questionId: recommendationWithFormfieldData[v].questionId,
              });
            }
            if (interimRecommend.length > 0) {
              recommendationDetail = interimRecommend;
              await sdk.bulkInsertInterimRecommendation({
                interinm_recommendation: interimRecommend,
              });
            }
          }
        }
      }
    }
    if (recommendationDetail.length > 0) {
      isrecommendation = true;
    }
    if (interimAnswerCarryForwardedData.length > 0) {
      isrecommendation = true;
    }
    clonedeepInterimCheck.isRecommendationIcon = isrecommendation;
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
  }
  return {
    triggerResult,
    finalResult,
    sectionScoreInput,
    companyId,
    clonedeepInterimCheck,
  };
};

// const sendFormSubmissionEmail = async (
//   formId: string,
//   invitationId: string,
//   companyId: string
// ) => {
//   if (!formId || !invitationId) return;
//   const responseData = await sdk.GetGlobalMasterByEmailOnSubmission();
//   const shouldSendEmail = responseData.GlobalMaster.some((m) =>
//     m.data.some((data: any) => data.formId === formId)
//   );
//   if (shouldSendEmail)
//     await sendFormResponseMail(invitationId, "FormResponse", companyId, formId);
// };

export const processScoreCalculation = async (
  formId: string,
  submissionId: string,
  invitationId: string,
  invitationStatus: string
) => {
  try {
    if (!formId || !submissionId || !invitationId || !invitationStatus)
      return {
        status: 500,
        result: { error: { message: "Required details missing" } },
      };

    const {
      finalResult: input,
      triggerResult,
      sectionScoreInput,
      companyId,
      clonedeepInterimCheck,
    } = await calculateScore(formId, submissionId, invitationId);

    const submissionResult: any = await sdk.upsertFormResult({
      invitationId,
      invitationStatus,
      input,
      interimCheck: clonedeepInterimCheck,
    });

    await Promise.all(
      triggerResult[0].data.map(async (job: any) => {
        if (formId === job?.formId) {
          const scoreData: any = jsonata(job?.transformExp).evaluate(
            sectionScoreInput
          );

          const score = {
            environment: scoreData?.environment ?? 0,
            social: scoreData?.social ?? 0,
            governance: scoreData?.governance ?? 0,
          };

          const { url, method, headers } = job?.api;

          const body = JSON.stringify({
            companyId,
            score,
          });

          await fetch(url, { method, body, headers });

          // console.log("OnFormScoreCalculationTrigger - Success", data);
        }
      })
    );
    // sending email on form submission
    // await sendFormSubmissionEmail(formId, invitationId, companyId);

    // console.log({ submissionResult });

    // res.status(200).json({ input });
    return {
      status: 200,
      result: { data: submissionResult, error: submissionResult.error },
    };
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);

    return {
      status: 500,
      result: { error: error.message || "Internal Server Error" },
    };
  }
};

const calculateScoreHandler: NextApiHandler = async (req, res) => {
  const { formId, submissionId, invitationId } = req.body;

  try {
    const invitationStatus: string = FormInvitationStatus.Submitted;

    const result = await processScoreCalculation(
      formId,
      submissionId,
      invitationId,
      invitationStatus
    );

    res.status(result.status).json(result.result);
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    res.status(500).json({ error: error.message || "Internal Server Error" });
  }
};

const handler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(calculateScoreHandler, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

export const dynamic = "force-dynamic";


