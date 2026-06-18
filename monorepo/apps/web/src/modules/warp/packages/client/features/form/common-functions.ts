import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import {
  AssessorConsultantMapping,
  BulkUpdateInterimRecommendationByInterimAnswerIdMutationVariables,
  Form,
  GetRenderFormFieldDetailsQuery,
  GetSourceDataByInvitationIdQuery,
  GlobalMaster,
  ValidationWarningLogs_Insert_Input,
} from "@/modules/warp/packages/graphql/generated/types";
import {
  AICArouselData,
  AIDataCardsType,
  AppRoles,
  FormInvitationStatus,
  FormMode,
  InvitationIdAIDetails,
  Platform,
  RecommendationStatus,
  SourcesType,
  getAIFeatureByDBType,
  getSourceTypePriority,
  suggestionCategory,
  userInvitationAIStatus,
  webCurationAPIDataType,
} from "@/modules/warp/packages/shared/constants/app.constants";
import {
  getFormAIPlans,
  getUserAIDetails,
  hasDocumentCuration,
  hasFullAICuration,
  hasWebCuration,
} from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import dayjs from "dayjs";
import _jsonata from "jsonata";
const jsonata = (typeof _jsonata === "function" ? _jsonata : (_jsonata as any).default) as typeof _jsonata;
import { isEqual } from "lodash";
import {
  getJsonataExpression,
  selectDisplayOptions,
  selectFieldOptions,
  selectInterfaceOptions,
  selectSimpleFieldOptions,
  useFormFieldStore,
  useWarningMessageStore,
} from "./store";
import {
  FormFieldWithChildrenType,
  GetRenderFormDetailsQuerySuggestionType,
  StateType,
} from "./types";
import { checkFormFieldIsInputType } from "./utils";



export const isUserAllowedAIFeature = (accessToken: string): boolean => {
  if (!accessToken) {
    return false;
  }

  try {
    const userAIDetails = getUserAIDetails(accessToken);
    return (
      userAIDetails?.isUserAI === "true" || userAIDetails?.isUserAI === true
    );
  } catch (error) {
    console.error("Error checking AI feature access:", error);
    return false;
  }
};

/**
 * Decodes a JWT access token and extracts Hasura claims for companyId and userId.
 * Returns empty strings if the token is invalid or claims are missing.
 * Note: This does not verify the token signature or expiry.
 *
 * @param accessToken - JWT string (header.payload.signature)
 * @returns { companyId: string, userId: string }
 */
export const getUserContext = (
  accessToken: string
): { companyId: string; userId: string } => {
  if (!accessToken) {
    return { companyId: "", userId: "" };
  }

  try {
    // Decode the JWT token
    const base64Payload = accessToken.split(".")[1];
    const decodedPayload = JSON.parse(atob(base64Payload));

    // Extract Hasura claims
    const hasuraClaims = decodedPayload["https://hasura.io/jwt/claims"];

    return {
      companyId: hasuraClaims?.["x-hasura-company-id"] || "",
      userId: hasuraClaims?.["x-hasura-user-id"] || "",
    };
  } catch (error) {
    console.error("Error getting user context:", error);
    return { companyId: "", userId: "" };
  }
};

const checkValidation = (
  validationRules: any,
  answer: any,
  debugContext?: {
    formFieldId?: string;
    formFieldName?: string;
    questionId?: string;
    questionTitle?: string;
    interfaceType?: string;
    ruleIndex?: number;
  },
  accessToken?: string
) => {
  const isAIUser = isUserAllowedAIFeature(accessToken ?? "");

  const originalData = useFormFieldStore.getState().answer ?? answer;
  let safeAnswerData: any;

  if (isAIUser) {
    safeAnswerData = structuredClone(originalData);

    if (validationRules.includes("replace")) {
      Object.keys(safeAnswerData).forEach((key) => {
        if (typeof safeAnswerData[key]?.value === "number") {
          safeAnswerData[key] = { value: String(safeAnswerData[key]?.value) };
        }
      });
    }
  }

  try {
    const expression = getJsonataExpression(validationRules);
    if (!expression) return false;
    const jsonatarulevalue = expression.evaluate(isAIUser ? safeAnswerData : originalData);
    const Result = Boolean(jsonatarulevalue);
    return Result;
  } catch (error) {
    console.group("🔴 JSONata Validation Error");
    console.error("Error details:", error);
    console.groupEnd();
    return false;
  }
};


const isInputField = (field: StateType["formFields"][0]) => {
  if (field.interface.toLowerCase().includes("group")) return false;
  return true;
};

export const hasAnyInputFields = (formField: any): boolean => {
  if (formField.fieldOptions?.enable === false) return false;
  if (checkFormFieldIsInputType(formField.interface as any)) return true;
  if (formField.children?.length) {
    return formField.children.some(hasAnyInputFields);
  }
  return false;
};

export const isMandatoryQuestion = (formField: any): boolean => {
  if (formField.fieldOptions?.enable === false) return false;
  if (formField.fieldOptions?.required) return true;
  if (formField.children?.length) {
    return formField.children.some(isMandatoryQuestion);
  }
  return false;
};

/**
 * Robustly checks if a value represents a filled answer.
 * Handles strings, numbers (0 is valid), arrays, and objects.
 */
export const hasValue = (value: any): boolean => {
  if (value === undefined || value === null) return false;
  if (typeof value === "string") return value.trim() !== "";
  if (Array.isArray(value)) return value.length > 0;
  if (typeof value === "object") return Object.keys(value).length > 0;
  if (typeof value === "number") return true; // 0 is a valid value
  return !!value;
};

export const isAnswered = (
  formField: FormFieldWithChildrenType,
  _isAnswered: boolean = false,
  chkStore: any,
  flattenedAnswers?: any
): boolean => {
  const targetQId = formField.Question?.id || formField.questionId;
  const _formFields =
    chkStore?.formFields?.length > 0
      ? chkStore?.formFields
        .filter((m: any) => {
          const mQId = m.Question?.id || m.questionId;
          return mQId && mQId === targetQId;
        })
        .filter(isInputField)
      : [];

  const formFieldKeys = _formFields.map((m: any) => m.field);
  const answerFormFieldKeys =
    chkStore?.answer && formFieldKeys
      ? Object.keys(chkStore.answer).filter((key) =>
        formFieldKeys.includes(key)
      )
      : [];

  const answersData = answerFormFieldKeys.reduce((result: any, curr) => {
    const ans = chkStore?.answer[curr];
    if (!!ans) result[curr] = ans;
    return result;
  }, {});
  
  let localIsAnswered = false;

  const fieldOptions = selectFieldOptions(
    useFormFieldStore.getState(),
    formField.id
  );



  let children: any[] | undefined = [];

  if (
    (formField.interface !== "select-multiple-dropdown" &&
      formField.interface !== "selected-multiple-dropdown" &&
      formField.interface !== "multi-select-row" &&
      formField.interface !== "select-multiple-checkbox") ||
    !formField.children?.length
  ) {
    children = formField.children
      ?.map((m: any) => {
        const fieldOptions = selectFieldOptions(
          useFormFieldStore.getState(),
          m.id
        );
        const displayOptions = selectDisplayOptions(
          useFormFieldStore.getState(),
          m.id
        );
        const interfaceOptions = selectInterfaceOptions(
          useFormFieldStore.getState(),
          m.id
        );

        return { ...m, fieldOptions, displayOptions, interfaceOptions };
      })
      .filter((m: any) => m.fieldOptions.enable);
  }

  // check interface value (input)
  if (checkFormFieldIsInputType(formField.interface as any)) {
    if (fieldOptions?.enable) {
      if (
        (formField.interface === "select-multiple-dropdown" ||
          formField.interface === "selected-multiple-dropdown" ||
          formField.interface === "multi-select-row" ||
          formField.interface === "select-multiple-checkbox") &&
        formField.children?.length
      ) {
        if (hasValue(answersData[formField.field]?.value)) {
          localIsAnswered = answersData[formField.field]?.value
            ?.map((rec: any, index: any) => {
              let _isAns = formField?.children
                ?.map((m: any) => {
                  const keyExists = Object.keys(rec).filter((a) => a === m?.field);
                  const val = rec[m?.field]?.value;
                  const valHasValue = hasValue(val);

                  if (
                    keyExists.length > 0 &&
                    valHasValue
                  ) {
                    return true;
                  } else {
                    const fieldOptionsRow = selectSimpleFieldOptions(
                      useFormFieldStore.getState(),
                      m.id,
                      index
                    );
                    if (
                      fieldOptionsRow.enable === true &&
                      fieldOptionsRow.required === true
                    ) {
                      return false;
                    } else {
                      return true;
                    }
                  }
                })
                ?.every((v: any) => v === true);

              return _isAns;
            })
            ?.every((v: any) => v === true);
        } else {
          localIsAnswered = false;
        }
      } else {
        localIsAnswered = hasValue(answersData[formField.field]?.value);
      }
    }
  }

  if (!!children?.length) {
    const childrenResults: {
      answered: boolean;
      required: boolean;
      isInput: boolean;
    }[] = children.map((child) => {
      const ans = isAnswered(child, false, chkStore, flattenedAnswers);
      return {
        answered: ans,
        required: child.fieldOptions?.required,
        isInput: checkFormFieldIsInputType(child.interface as any),
      };
    });

    const hasRequiredChildren = childrenResults.some((r: any) => r.required);
    const allRequiredAnswered: boolean = childrenResults
      .filter((r: any) => r.required)
      .every((r: any) => r.answered);

    const isParentInputType = checkFormFieldIsInputType(formField.interface as any);

    if (isParentInputType) {
      localIsAnswered = localIsAnswered && allRequiredAnswered;
    } else {
      localIsAnswered = childrenResults.every((r: any) => r.answered);
    }
  }

  if (!!formField.validationRules?.length) {
    if (Object.keys(answersData).length > 0) {
      formField.validationRules.map((m: any, ruleIndex: number) => {
        if (checkValidation(m.rule, answersData, {
          formFieldId: formField.id,
          formFieldName: formField.field,
          questionId: formField.Question?.id,
          questionTitle: formField.interfaceOptions?.title,
          interfaceType: formField.interface,
          ruleIndex: ruleIndex,
        })) {
          localIsAnswered = false;
        }
      });
    }
  }

  const isFieldMandatory = (field: any): boolean => {
    const opts = selectFieldOptions(useFormFieldStore.getState(), field.id);
    if (opts?.enable === false) return false;
    if (opts?.required) return true;
    if (
      field.children?.length &&
      field.interface !== "select-multiple-dropdown" &&
      field.interface !== "selected-multiple-dropdown" &&
      field.interface !== "multi-select-row" &&
      field.interface !== "select-multiple-checkbox"
    ) {
      return field.children.some(isFieldMandatory);
    }
    return false;
  };
  if (!isFieldMandatory(formField)) {
    const storeState = useFormFieldStore.getState();
    const leafFields = extractAllChildren(formField).filter((f) => {
      const opts = selectFieldOptions(storeState, f.id);
      return opts?.enable !== false;
    });
    const answersObj = flattenedAnswers || flattenObjectValues(answersData);
    const anyAnswered = leafFields.some((f) => hasValue(answersObj[f.field]?.value));

    if (!anyAnswered) {
      localIsAnswered = true;
    }
  }
  return localIsAnswered;
};


export const warninglogsave: any = async (
  queryMode: string,
  invitationId: string,
  UpsertValidationWarningLogsMutation: any,
  userSession?: any
) => {

  try {
    // const removeWarning = useWarningMessageStore(
    //   (store) => store.removeWarningRuleFields
    // );
    const WarningData1 = useWarningMessageStore.getState().WarningRuleFields;
    const InsertValidationWaringDeatils: ValidationWarningLogs_Insert_Input[] = [];
    let deletecondition: Record<string, any>[] = [];

    if (WarningData1.length > 0) {
      WarningData1.forEach((rec: any) => {
        let OldValueobject = { Value: rec?.oldvalue };
        let newValueobject = { Value: rec?.newValue };

        InsertValidationWaringDeatils.push({
          OldValue: OldValueobject,
          NewValue: newValueobject,
          Ratio: rec?.ratio,
          formFieldId: rec?.formfieldid,
          QuestionId: rec?.questionid,
          InvitationId: invitationId,
          created_by: userSession?.user?.id,
          updated_by: userSession?.user?.id,
          values: {
            OldValue: rec?.oldvalue,
            NewValue: rec?.newValue,
            ActualDeviation: rec?.ratio,
            Threshold_Deviation: rec?.Threshold_Deviation,
            Deviation_differential: rec?.Deviation_differential,
          },
          Logtype:
            queryMode === FormMode.ViewRecommendation
              ? "recommendation"
              : "invitation",
        });

        deletecondition.push({
          _and: {
            formFieldId: { _eq: rec?.formfieldid },
            InvitationId: { _eq: invitationId },
            Logtype: {
              _eq:
                queryMode === FormMode.ViewRecommendation
                  ? "recommendation"
                  : "invitation",
            },
          },
        });
      });
      // useWarningMessageStore.setState({
      //   WarningRuleFields: [],
      // });
      //removeWarning();
      const data = await UpsertValidationWarningLogsMutation({
        variables: {
          deleteobject: { _or: deletecondition },
          object: InsertValidationWaringDeatils,
        },
      });
    }
    // useWarningMessageStore.setState({
    //   WarningRuleFields: []
    // });
    //removeWarning();

    return true;
  } catch (error) {
    console.error("Error in warninglogsave:", error);
  }
};
//// save Answer Start
export const setAnswersData = async (
  data: any,
  submissionId: any,
  Answerdata: any,
  OtherAnswerData: any,
  questionId: any,
  userId: any,
  storeData: any,
  formId: string,
  invitationId: string,
  pageName: string,
  recommendationStatus: string,
  formFieldId: string,
  getFormFieldsDetail: any,
  getFormfieldRecommendation: any,
  upsertAnswer: any,
  updateAnswer: any,
  updateInterimAnswer: any,
  insertInterimAnsweronUpdate: any,
  getAnswersByIds: any,
  insertBulkAnswer: any,
  updateRecommendation: any,
  updateSuggestionData: any,
  suggestionStoreData: GetRenderFormDetailsQuerySuggestionType,
  userSession?: any,
  querymode?: any
) => {

  try {
    // Determine if we're working with interim answers
     const isIntrimAnswer =
      (data?.Interim_Answer?.length > 0 &&
        data?.FormSubmission[0]?.FormInvitation?.status ===
        FormInvitationStatus.Submitted) ||
      (data?.Interim_Answer?.length > 0 &&
        data?.FormSubmission[0]?.FormInvitation?.status ===
        FormInvitationStatus.Approved);


    // Prepare answer data
    const oldAnswer = isIntrimAnswer ? data?.Interim_Answer : data?.Answer;
    const sourceData = isIntrimAnswer ? Answerdata : OtherAnswerData;

    // Find updated answers
    const updatedAnswer = sourceData.filter(
      (item: any) =>
        oldAnswer?.filter(
          (x: any) =>
            x.formFieldId === item.formFieldId && !isEqual(x.data?.value, item.value)
        ).length > 0
    );

    // Find answers that exist in old data but not in new
    const removedAnswers = oldAnswer?.filter(
      (s: any) =>
        sourceData.filter((f: any) => f.formFieldId === s.formFieldId)
          .length === 0
    );

    // Combine updated and removed answers
    const allChangedAnswers = [...updatedAnswer, ...removedAnswers];

    // Find new answers to insert
    const newAnswers = sourceData.filter(
      (item1: any) =>
        oldAnswer?.filter(
          (item2: any) => item2.formFieldId === item1.formFieldId
        ).length === 0
    );

    /**
     * [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
     * SUGGESTION SELECTION PERSISTENCE FIX
     *
     * PROBLEM: User suggestion selections weren't being saved to database.
     * - Original logic only updated suggestions in ViewRecommendation mode with valid FormField response
     * - When navigating from GroupTab, FormField data was empty, causing filter to return no suggestions
     * - Result: isSelected flag remained false in DB, selections lost on page refresh
     *
     * SOLUTION: Move suggestion updates before recommendation processing and change filter logic.
     * - Filter suggestions that have isSelected defined and valid formFieldId (not dependent on FormField response)
     * - Execute suggestion updates regardless of page context or query mode
     *
     * RESULT: Suggestion selections now persist to database immediately on navigation,
     * maintaining user choices across page refreshes and route changes.
     */
    const currentSuggestion = suggestionStoreData.filter(
      (idItem: any) => idItem?.isSelected !== undefined && idItem?.formFieldId
    );

    if (currentSuggestion.length > 0) {
      const suggestionUpdate = currentSuggestion.map((suggestionItems) => ({
        where: {
          id: { _eq: suggestionItems?.id },
        },
        _set: {
          isSelected: suggestionItems?.isSelected,
          selectedByUserId: userId,
        },
      }));

      await updateSuggestionData({
        variables: { suggestionData: suggestionUpdate },
      });
    }

    // Handle form field recommendations if needed
    let formFieldResponse: any = null;
    let RecommendationsData: any = null;
    if (
      pageName !== "AddComment" &&
      querymode === FormMode.ViewRecommendation
    ) {
      formFieldResponse = await getFormFieldsDetail({
        variables: { questionId },
      });

      RecommendationsData = await getFormfieldRecommendation({
        variables: {
          submissionid: submissionId,
          formfieldid: formFieldResponse?.data?.FormField?.map(
            (item: any) => item.id
          ),
        },
      });
    }

    // Process answer updates based on type
    if (isIntrimAnswer) {
      // Update interim answers
      if (allChangedAnswers.length > 0) {
        const updateInterimData = {
          Interim_AnswerUpdate: allChangedAnswers.map((m: any) => ({
            where: {
              submissionId: { _eq: submissionId },
              formFieldId: { _eq: m.formFieldId },
            },
            _set: {
              data: { value: m.data?.value || m.value },
              isDeleted:
                removedAnswers.filter(
                  (items: any) => items.formFieldId == m.formFieldId
                ).length > 0,
            },
          })),
        };

        await updateInterimAnswer({
          variables: {
            Interim_AnswerUpdate: updateInterimData.Interim_AnswerUpdate,
          },
        });

        if (pageName !== "AddComment") {
          await Promise.all(
            allChangedAnswers.map(async (item: any) => {
              if (item.value) {
                await UpdateChildRecommendationStatus(
                  formFieldResponse?.data?.FormField,
                  item.formFieldId,
                  Answerdata,
                  isIntrimAnswer,
                  RecommendationsData?.data,
                  false,
                  storeData,
                  item.formFieldId,
                  updateRecommendation
                );
              }
            })
          );
        }
      }

      // Insert new interim answers
      if (newAnswers.length > 0) {
        const answerInsertData = newAnswers.map((x: any) => ({
          submissionId,
          questionId: x.questionId,
          formFieldId: x.formFieldId,
          data: { value: x.value },
          created_by: userId,
          updated_by: userId,
        }));

        await insertInterimAnsweronUpdate({
          variables: { interinm_input: answerInsertData },
        });
      }
    } else {
      // Handle regular answers
      if (allChangedAnswers.length > 0) {
        const updateAnswerData = {
          AnswerUpdate: allChangedAnswers.map((m: any) => ({
            where: {
              submissionId: { _eq: submissionId },
              formFieldId: { _eq: m.formFieldId },
            },
            _set: {
              data: { value: m.data?.value || m.value },
              isDeleted:
                removedAnswers.filter(
                  (items: any) => items.formFieldId == m.formFieldId
                ).length > 0,
            },
          })),
        };

        await updateAnswer({
          variables: { AnswerUpdate: updateAnswerData.AnswerUpdate },
        });

        if (pageName !== "AddComment") {
          await Promise.all(
            allChangedAnswers.map(async (item: any) => {
              if (item.value) {
                await UpdateChildRecommendationStatus(
                  formFieldResponse?.data?.FormField,
                  item.formFieldId,
                  Answerdata,
                  isIntrimAnswer,
                  RecommendationsData?.data,
                  true,
                  storeData,
                  item.formFieldId,
                  updateRecommendation
                );
              }
            })
          );
        }
      }

      // Insert new answers
      if (newAnswers.length > 0) {
        const answerBulkInsertData = await newAnswers.map((x: any) => ({
          submissionId,
          questionId: x.questionId,
          formFieldId: x.formFieldId,
          data: { value: x.value },
          created_by: userId,
          updated_by: userId,
        }));

        const where = {
          _and: answerBulkInsertData.map((ans: any) => ({
            submissionId: { _eq: ans.submissionId },
            questionId: { _eq: ans.questionId },
            formFieldId: { _eq: ans.formFieldId },
          })),
        };

        const existingAnswersResponse = await getAnswersByIds({ variables: { where: where }, fetchPolicy: "no-cache", });
        const existingAnswers = existingAnswersResponse?.data?.Answer

        if (existingAnswers?.length === 0) {
          await insertBulkAnswer({
            variables: { answerData: answerBulkInsertData },
          });
        }
      }
    }

    // Handle progress report updates if needed
    const shouldUpdateProgress =
      (allChangedAnswers.length > 0 || newAnswers.length > 0) &&
      (pageName === "Recommendation" ||
        pageName === "AddComment" ||
        pageName === "GroupWizard" ||
        recommendationStatus === RecommendationStatus.Closed);

    if (shouldUpdateProgress) {
      const answerData = isIntrimAnswer ? data?.Interim_Answer : data?.Answer;
      const interimAnswer = answerData?.find(
        (rec: any) => rec.formFieldId === formFieldId
      );
      const interimAnswerId =
        interimAnswer?.Interim_Answer?.id || interimAnswer?.id;

      fetch("/api/progress-report-score", {
        method: "POST",
        body: JSON.stringify({
          formId,
          submissionId,
          invitationId,
          isApproved: "true",
          questionId,
          interimAnswerId: interimAnswerId || null,
        }),
        headers: {
          "Content-Type": "application/json",
          Authorization: userSession?.accessToken ?? "",
        },
      }).catch((error) => console.error("Error in progress report:", error));
    }
  } catch (error) {
    console.error("Error in setAnswersData:", error);
    throw error;
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
  storeData: any,
  stableFormFieldId: any,
  updateRecommendation: any
) => {
  const today = new Date();
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
        maindata
          .filter((d: any) => d.groupField === formFieldData[0].field)
          ?.map(async (child: any) => {
            if (!!child.displayRules && child.displayRules.length > 0) {
              const expression = getJsonataExpression(child.displayRules[0].rule);
              const IsVisible = expression ? Boolean(
                await expression.evaluate(answerDetails)
              ) : false;
              let mainRecommendationdata: any =
                RecommendationsData?.Interim_Answer.filter(
                  (ans: any) => ans.formFieldId === child.id
                );
              if (isDraftedCarry) {
                mainRecommendationdata = RecommendationsData?.Answer.filter(
                  (ans: any) => ans.formFieldId === child.id
                );
              }
              if (
                !!mainRecommendationdata &&
                mainRecommendationdata?.length > 0
              ) {
                if (isDraftedCarry) {
                  if (
                    !!mainRecommendationdata[0]?.Interim_Answers &&
                    mainRecommendationdata[0]?.Interim_Answers.length > 0
                  ) {
                    mainRecommendationdata[0]?.Interim_Answers[0]?.Interim_Recommendations.filter(
                      (s: any) => s.status != RecommendationStatus.Closed
                    )?.map((recom: any) => {
                      changesDataArray.push({
                        where: {
                          id: {
                            _eq: recom.id,
                          },
                        },
                        _set: {
                          status: IsVisible
                            ? recom.status == RecommendationStatus.NA
                              ? RecommendationStatus.Open
                              : recom.status
                            : RecommendationStatus.NA,
                          updated_at: today,
                        },
                      });
                    });
                  }
                  if (
                    !!mainRecommendationdata[0]?.Interim_Answers[0]
                      ?.Interim_Answer
                  ) {
                    mainRecommendationdata[0]?.Interim_Answers[0]?.Interim_Answer?.Interim_Recommendations.filter(
                      (s: any) => s.status != RecommendationStatus.Closed
                    )?.map((recom: any) => {
                      changesDataArray.push({
                        where: {
                          id: {
                            _eq: recom.id,
                          },
                        },
                        _set: {
                          status: IsVisible
                            ? recom.status == RecommendationStatus.NA
                              ? RecommendationStatus.Open
                              : recom.status
                            : RecommendationStatus.NA,
                          updated_at: today,
                        },
                      });
                    });
                  }
                  if (
                    !!mainRecommendationdata[0]?.Interim_Answers[0]
                      ?.Interim_Answers &&
                    mainRecommendationdata[0]?.Interim_Answers[0]
                      ?.Interim_Answers.length > 0
                  ) {
                    mainRecommendationdata[0]?.Interim_Answers[0]?.Interim_Answers?.Interim_Recommendations?.filter(
                      (s: any) => s.status != RecommendationStatus.Closed
                    )?.map((recom: any) => {
                      changesDataArray.push({
                        where: {
                          id: {
                            _eq: recom.id,
                          },
                        },
                        _set: {
                          status: IsVisible
                            ? recom.status == RecommendationStatus.NA
                              ? RecommendationStatus.Open
                              : recom.status
                            : RecommendationStatus.NA,
                          updated_at: today,
                        },
                      });
                    });
                  }
                } else {
                  mainRecommendationdata[0]?.Interim_Recommendations.filter(
                    (s: any) => s.status != RecommendationStatus.Closed
                  )?.map((recom: any) => {
                    changesDataArray.push({
                      where: {
                        id: {
                          _eq: recom.id,
                        },
                      },
                      _set: {
                        status: IsVisible
                          ? recom.status == RecommendationStatus.NA
                            ? RecommendationStatus.Open
                            : recom.status
                          : RecommendationStatus.NA,
                        updated_at: today,
                      },
                    });
                  });
                  if (!!mainRecommendationdata[0]?.Interim_Answer) {
                    mainRecommendationdata[0]?.Interim_Answer?.Interim_Recommendations.filter(
                      (s: any) => s.status != RecommendationStatus.Closed
                    )?.map((recom: any) => {
                      changesDataArray.push({
                        where: {
                          id: {
                            _eq: recom.id,
                          },
                        },
                        _set: {
                          status: IsVisible
                            ? recom.status == RecommendationStatus.NA
                              ? RecommendationStatus.Open
                              : recom.status
                            : RecommendationStatus.NA,
                          updated_at: today,
                        },
                      });
                    });
                  }
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
              storeData,
              stableFormFieldId,
              updateRecommendation
            );
          });
      } else {
        let data = maindata.filter(
          (x: any) =>
            x.id === formFieldData[0]?.id && x.id !== stableFormFieldId
        );
        if (!!data && data.length > 0) {
          if (!!data[0]?.displayRules && data[0]?.displayRules.length > 0) {
            const expression = getJsonataExpression(data[0]?.displayRules[0].rule);
            const IsVisible = expression ? Boolean(
              await expression.evaluate(answerDetails)
            ) : false;
            const ansData = answers.filter(
              (ans: any) => ans.formFieldId === formFieldData[0]?.id
            );
            let mainRecommendationdata: any =
              RecommendationsData?.Interim_Answer.filter(
                (ans: any) => ans.formFieldId === formFieldData[0]?.id
              );
            if (isDraftedCarry) {
              mainRecommendationdata = RecommendationsData?.Answer.filter(
                (ans: any) => ans.formFieldId === formFieldData[0]?.id
              );
            }
            if (
              !!mainRecommendationdata &&
              mainRecommendationdata?.length > 0
            ) {
              if (isDraftedCarry) {
                if (
                  !!mainRecommendationdata[0]?.Interim_Answers &&
                  mainRecommendationdata[0]?.Interim_Answers.length > 0
                ) {
                  mainRecommendationdata[0]?.Interim_Answers[0]?.Interim_Recommendations.filter(
                    (s: any) => s.status != RecommendationStatus.Closed
                  )?.map((recom: any) => {
                    changesDataArray.push({
                      where: {
                        id: {
                          _eq: recom.id,
                        },
                      },
                      _set: {
                        status: IsVisible
                          ? recom.status == RecommendationStatus.NA
                            ? RecommendationStatus.Open
                            : recom.status
                          : RecommendationStatus.NA,
                        updated_at: today,
                      },
                    });
                  });
                }
                if (
                  !!mainRecommendationdata[0]?.Interim_Answers[0]
                    ?.Interim_Answer
                ) {
                  mainRecommendationdata[0]?.Interim_Answers[0]?.Interim_Answer?.Interim_Recommendations.filter(
                    (s: any) => s.status != RecommendationStatus.Closed
                  )?.map((recom: any) => {
                    changesDataArray.push({
                      where: {
                        id: {
                          _eq: recom.id,
                        },
                      },
                      _set: {
                        status: IsVisible
                          ? recom.status == RecommendationStatus.NA
                            ? RecommendationStatus.Open
                            : recom.status
                          : RecommendationStatus.NA,
                        updated_at: today,
                      },
                    });
                  });
                }
                if (
                  !!mainRecommendationdata[0]?.Interim_Answers[0]
                    ?.Interim_Answers &&
                  mainRecommendationdata[0]?.Interim_Answers[0]?.Interim_Answers
                    .length > 0
                ) {
                  mainRecommendationdata[0]?.Interim_Answers[0]?.Interim_Answers?.Interim_Recommendations?.filter(
                    (s: any) => s.status != RecommendationStatus.Closed
                  )?.map((recom: any) => {
                    changesDataArray.push({
                      where: {
                        id: {
                          _eq: recom.id,
                        },
                      },
                      _set: {
                        status: IsVisible
                          ? recom.status == RecommendationStatus.NA
                            ? RecommendationStatus.Open
                            : recom.status
                          : RecommendationStatus.NA,
                        updated_at: today,
                      },
                    });
                  });
                }
              } else {
                mainRecommendationdata[0]?.Interim_Recommendations.filter(
                  (s: any) => s.status != RecommendationStatus.Closed
                )?.map((recom: any) => {
                  changesDataArray.push({
                    where: {
                      id: {
                        _eq: recom.id,
                      },
                    },
                    _set: {
                      status: IsVisible
                        ? recom.status == RecommendationStatus.NA
                          ? RecommendationStatus.Open
                          : recom.status
                        : RecommendationStatus.NA,
                      updated_at: today,
                    },
                  });
                });
                if (
                  !!mainRecommendationdata[0]?.Interim_Answer &&
                  mainRecommendationdata[0]?.Interim_Answer.length > 0
                ) {
                  mainRecommendationdata[0]?.Interim_Answer[0]?.Interim_Recommendations.filter(
                    (s: any) => s.status != RecommendationStatus.Closed
                  )?.map((recom: any) => {
                    changesDataArray.push({
                      where: {
                        id: {
                          _eq: recom.id,
                        },
                      },
                      _set: {
                        status: IsVisible
                          ? recom.status == RecommendationStatus.NA
                            ? RecommendationStatus.Open
                            : recom.status
                          : RecommendationStatus.NA,
                        updated_at: today,
                      },
                    });
                  });
                }
              }
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
    updatebulkrecommendation.Interim_Recommendation = changesDataArray;
    const results = await updateRecommendation({
      variables: {
        Interim_Recommendation: updatebulkrecommendation.Interim_Recommendation,
      },
    });
  }
};
//// save Answer End

export const isAIFeaturedEnabledorNot = (
  formDetails: Form[],
  assessorConsultantMappingData: AssessorConsultantMapping[],
  globalMasterData: GlobalMaster[],
  isfromLogin: boolean,
  userList?: Record<string, any>[],
  userRole?: string,
  userId?: string,
  companyId?: string,
  InvitationDetail?: getAIFeatureByDBType[]
) => {
  let VCuserData: Record<string, any>[] = [];
  if (isfromLogin) {
    if (
      String(userRole).toLocaleLowerCase() ==
      String(AppRoles.Consultant).toLocaleLowerCase()
    ) {
      assessorConsultantMappingData
        .filter((items) => items.consultantCompanyId == companyId)
        .forEach((items) =>
          items?.Company?.Users.forEach((dataItem) =>
            dataItem.UserRoles.filter(
              (roleitem) => roleitem.roleName == AppRoles.Inviter
            ).forEach((roleItem) => {
              if (
                VCuserData.filter((data) => data.vcuserId == roleItem.userId)
                  .length == 0
              ) {
                VCuserData.push({
                  vcuserId: roleItem.userId,
                  consultants: [],
                });
              }
            })
          )
        );
    } else if (
      String(userRole).toLocaleLowerCase() ==
      String(AppRoles.Inviter).toLocaleLowerCase()
    ) {
      VCuserData.push({ vcuserId: String(userId), consultants: [] });
    } else {
      if (!!userList) {
        const userConsultantCompany = userList
          .filter((items) => items.role == AppRoles.Consultant)
          .map((items) => items.companyId);
        if (userConsultantCompany.length > 0) {
          const vcCompany = assessorConsultantMappingData.filter((items) =>
            userConsultantCompany.some(
              (cItems) => cItems == items.assessorCompanyId
            )
          );
          const consultantCompanyList = assessorConsultantMappingData.filter(
            (items) =>
              userConsultantCompany.some(
                (cItems) => cItems == items.consultantCompanyId
              )
          );
          vcCompany.forEach((items) =>
            items?.Company?.Users.forEach((dataItem) =>
              dataItem.UserRoles.filter(
                (roleitem) => roleitem.roleName == AppRoles.Inviter
              ).forEach((roleItem) => {
                if (
                  VCuserData.filter((data) => data.vcuserId == roleItem.userId)
                    .length == 0
                ) {
                  VCuserData.push({
                    vcuserId: roleItem.userId,
                    consultants: userList
                      .filter(
                        (userItems) =>
                          userItems.role == AppRoles.Consultant &&
                          userItems.companyId == items.assessorCompanyId
                      )
                      .map((items) => items.userId),
                  });
                }
              })
            )
          );
          consultantCompanyList.forEach((items) =>
            items?.Company?.Users.forEach((dataItem) =>
              dataItem.UserRoles.filter(
                (roleitem) => roleitem.roleName == AppRoles.Inviter
              ).forEach((roleItem) => {
                if (
                  VCuserData.filter((data) => data.vcuserId == roleItem.userId)
                    .length == 0
                ) {
                  VCuserData.push({
                    vcuserId: roleItem.userId,
                    consultants: userList
                      .filter(
                        (userItems) =>
                          userItems.role == AppRoles.Consultant &&
                          userItems.companyId == items.consultantCompanyId
                      )
                      .map((items) => items.userId),
                  });
                }
              })
            )
          );
        }
        VCuserData = [
          ...VCuserData,
          ...userList
            .filter((items) => items.role == AppRoles.Inviter)
            .map((items) => {
              return { vcuserId: items.userId, consultants: [] };
            }),
        ];
      }
    }
  } else {
    if (!!InvitationDetail)
      InvitationDetail.filter((datas) => !!datas.created_by).forEach(
        (Listitems) => {
          switch (String(Listitems.userRole).toLocaleUpperCase()) {
            case String(AppRoles.Inviter).toLocaleUpperCase():
              VCuserData.push({
                vcuserId: String(Listitems.created_by),
                consultants: [],
              });
              break;
            case String(AppRoles.Consultant).toLocaleUpperCase():
              assessorConsultantMappingData
                ?.filter(
                  (items) => items.consultantCompanyId == Listitems?.companyId
                )
                .forEach((items) =>
                  items?.Company?.Users.forEach((dataItem) =>
                    dataItem.UserRoles.filter(
                      (roleitem) => roleitem.roleName == AppRoles.Inviter
                    ).forEach((roleItem) => {
                      if (
                        VCuserData.filter(
                          (data) => data.vcuserId == roleItem.userId
                        ).length == 0
                      ) {
                        VCuserData.push({
                          vcuserId: roleItem.userId,
                          consultants: [],
                        });
                      }
                    })
                  )
                );
              break;
            default:
              break;
          }
        }
      );
  }
  const VCuserAIPlan: Record<string, any>[] = [];
  globalMasterData?.filter((items: any) =>
    items.data.filter((item: string) => {
      const vcUserDetail = VCuserData.filter((vitem) => vitem.vcuserId == item);
      if (vcUserDetail.length > 0) {
        VCuserAIPlan.push({
          VCuserID: item,
          consultants: vcUserDetail[0].consultants,
          docWithAI: Platform[0].AITypes.filter(
            (planItems) => planItems.name == items.type
          )[0].docWithAI,
          onlyDoc: Platform[0].AITypes.filter(
            (planItems) => planItems.name == items.type
          )[0].onlyDoc,
        });
      }
    })
  );
  const FormDataPointDetails: userInvitationAIStatus[] = [];
  formDetails?.map((items) => {
    if (VCuserAIPlan.length > 0) {
      VCuserAIPlan.forEach((vcItems) => {
        FormDataPointDetails.push({
          formId: items?.id,
          vcUserId: vcItems?.VCuserID,
          consultants: vcItems?.consultants,
          isAIDataPointsAdded: items?.isAIDataPointsAdded,
          docWithAI: vcItems?.docWithAI,
          onlyDoc: vcItems?.onlyDoc,
        });
      });
    } else {
      FormDataPointDetails.push({
        formId: items?.id,
        vcUserId: undefined,
        isAIDataPointsAdded: items?.isAIDataPointsAdded,
        docWithAI: false,
        onlyDoc: false,
        consultants: [],
      });
    }
  });
  return FormDataPointDetails;
};

/**
 * MIGRATION FROM USER-SPECIFIC TO FORM-SPECIFIC AI ACCESS
 *
 * OLD LOGIC (REMOVED):
 * - Complex user-specific AI access control per invitation
 * - Checked consultants[] array and vcUserId fields
 * - Different access patterns for consultant vs non-consultant invitations
 *
 * NEW LOGIC (CURRENT):
 * - Simple form-level AI access control using new JWT structure
 * - Uniform AI visibility for all users accessing the same form
 *
 * BUSINESS IMPACT:
 *     LOST: Granular per-user AI access control per invitation
 *     GAINED: Simplified, consistent AI management at form level
 */
export const AIFeatureForInvitationId = (
  formId: string,
  isInvitedByConsultant: boolean,
  created_by: string,
  accessToken?: string
): userInvitationAIStatus[] => {
  const aiData = getFormAIPlans(accessToken, formId);
  const transformedAIData =
    aiData.length > 0
      ? [
        {
          formId: formId,
          docWithAI: hasFullAICuration(accessToken, formId), // Both DocumentCuration + WebCuration
          onlyDoc:
            hasDocumentCuration(accessToken, formId) &&
            !hasWebCuration(accessToken, formId), // Only DocumentCuration
          //Keeping vcUserId, consultants, and isAIDataPointsAdded for type
          vcUserId: "",
          consultants: [],
          isAIDataPointsAdded: false,
        },
      ]
      : [];
  return transformedAIData;
};


export const AIFeatureForInvitationIdByDB = async (
  InvitationDetail: getAIFeatureByDBType[],
  userSession?: any
) => {
  const AIData: InvitationIdAIDetails[] = [];
  const formDetails = await sdk.formWithDataPoints();
  const assessorConsultantMappingData =
    await sdk.getAssessorConsultantMapping();
  const globalMasterAIData = await sdk.getGlobalMasterByTypeList({
    type: Platform[0].AITypes.map((items) => items.name),
  });
  if (
    !!globalMasterAIData?.GlobalMaster &&
    globalMasterAIData?.GlobalMaster.length > 0
  ) {
    const formData = isAIFeaturedEnabledorNot(
      formDetails?.Form as Form[],
      assessorConsultantMappingData?.AssessorConsultantMapping as AssessorConsultantMapping[],
      globalMasterAIData?.GlobalMaster?.map((items: Record<string, any>) => {
        return { type: items.type, data: items.data };
      }) as GlobalMaster[],
      false,
      [],
      "",
      "",
      "",
      InvitationDetail
    );
    InvitationDetail.forEach((items) => {
      if (
        !!formData &&
        formData?.filter((dataItems: any) => dataItems?.formId == items.formId)
          .length > 0
      ) {
        const formWithAIData = formData?.filter(
          (formItems: any) =>
            formItems?.formId == items.formId &&
            (userSession?.user?.role === AppRoles.Invitee &&
              items.isInvitedByConsultant
              ? formItems.consultants.filter(
                (cItem: string) => cItem == items.created_by
              ).length > 0
              : formItems?.vcUserId == items.created_by)
        );
        formWithAIData.forEach((itemData) => {
          AIData.push({
            invitationId: items?.id,
            AIDetail: itemData,
          });
        });
      }
    });
  }
  return AIData;
};

export const getAISuggestionCarouselData = (
  suggestionData: GetRenderFormFieldDetailsQuery["FormInvitation"][0]["Suggestions"],
  fieldInterface?: string
) => {
  const isMultiDropdown: boolean =
    String(fieldInterface) == "select-multiple-dropdown";
  const AISuggestionCarouseldata: AICArouselData[] = [];
  suggestionData.forEach((suggestionItems) => {
    const isAnySelected =
      suggestionData.filter((selectedItem) => selectedItem.isSelected == true)
        .length > 0
        ? true
        : false;
    let allSources = suggestionItems?.SuggestionSourceMappings.map(
      (sourceItems) => {
        return {
          sourceItem: sourceItems?.Source,
          pageNo: sourceItems?.suggestionPageNo,
          sourceType: sourceItems?.Source?.type,
          fileUrl: sourceItems?.Source?.SourceFile?.originalFileUrl,
          infoIconText: sourceItems?.suggestionInfoContent,
          createdAt: sourceItems?.Source?.SourceFile?.created_at,
        };
      }
    );
    allSources = allSources.sort((a, b) => {
      const priorityA = getSourceTypePriority(a.sourceItem?.type || '');
      const priorityB = getSourceTypePriority(b.sourceItem?.type || '');
      return priorityA - priorityB; // Ascending order: lower priority number comes first
    });
    const suggestionCategories = allSources.map((dataItems, index) => {
      if (index > 0) {
        return {
          categoryName:
            dataItems?.sourceItem?.type == SourcesType.Uploaded?.dbTittle
              ? SourcesType.Uploaded?.frontEndTitle
              : dataItems?.sourceItem?.type == SourcesType.OPS_Data?.dbTittle
                ? SourcesType.OPS_Data?.frontEndTitle
                : SourcesType.Web?.frontEndTitle,
          description:
            dataItems?.sourceType == SourcesType.Uploaded?.dbTittle
              ? ""
              : dataItems?.sourceType == SourcesType.OPS_Data?.dbTittle
                ? dataItems?.createdAt
                  ? dayjs(dataItems?.createdAt).format("DD MMMM YYYY - HH:mm A")
                  : ""
                : dataItems?.fileUrl,
          docs: [
            {
              docName: dataItems?.sourceItem?.SourceFile?.originalFileName,
              docUrl:
                dataItems?.sourceType == SourcesType.OPS_Data?.dbTittle
                  ? ""
                  : !!dataItems?.pageNo && dataItems?.pageNo > 0
                    ? String(dataItems?.sourceItem?.SourceFile?.originalFileUrl) +
                    "#page=" +
                    dataItems?.pageNo
                    : String(dataItems?.sourceItem?.SourceFile?.originalFileUrl),
              pageNo: !!dataItems?.pageNo ? Number(dataItems?.pageNo) : 0,
              tooltipLabelText: dataItems?.infoIconText,
            },
          ],
          isOptions: false,
        };
      }
    }) as suggestionCategory[];

    /**
     * CONFLICT DETECTION LOGIC
     * 
     * Purpose: Detects when multiple AI suggestions propose different values for the same form field,
     * requiring explicit user selection to resolve data ambiguity.
     * 
     * Participating Source Types:
     * - "Uploaded": User-uploaded documents
     * - "OPS_Data": Historical operational data from OPSToIQCuration feature (newly added)
     * 
     * Why These Sources?
     * Both Uploaded and OPS_Data represent high-priority trusted sources (priority 1-2) containing
     * factual data that may legitimately differ across documents or historical assessments. When
     * multiple suggestions from these sources propose different values, users must explicitly choose
     * the correct one to maintain data integrity.
     * 
     * Excluded Sources:
     * - "Web": Lower priority (3), typically generic information, not considered for conflicts
     * - "Options": Multiple choice options (4), intentionally diverse, not conflicting data
     * 
     * How It Works:
     * 1. Collect all suggestions for the current form field that have NOT been selected yet
     * 2. Filter suggestions that have "Uploaded" OR "OPS_Data" source mappings
     * 3. Extract distinct suggestion IDs from filtered sources
     * 4. If distinctSuggestionId.length > 1, mark this suggestion as conflicting
     * 
     * Visual Indicator:
     * - Conflicting suggestions display with ORANGE background (#f9e9df)
     * - Once user selects any suggestion, isAnySelected=true, all conflicts clear
     * 
     * Business Impact:
     * - Prevents automatic selection of potentially incorrect historical data
     * - Ensures users are aware of data discrepancies across sources
     * - Maintains traceability and data quality standards
     */
    let suggestionForSameInput: any[] = [];
    const SourceTypeforSameInput: Record<string, any>[] = [];
    if (!isAnySelected) {
      suggestionForSameInput = suggestionData?.filter(
        (items) => items.formFieldId == suggestionItems?.formFieldId
      );
      suggestionForSameInput.forEach((data) => {
        data?.SuggestionSourceMappings.forEach((items) => {
          // Include both Uploaded and OPS_Data sources for conflict detection
          if (
            items.Source?.type == SourcesType?.Uploaded?.dbTittle ||
            items.Source?.type == SourcesType?.OPS_Data?.dbTittle
          ) {
            SourceTypeforSameInput.push({
              suggestionId: data?.id,
              type: items.Source?.type,
            });
          }
        });
      });
    }
    const suggestionIdArray = SourceTypeforSameInput.map(
      (data) => data.suggestionId
    );
    const distinctSuggestionId = suggestionIdArray.filter(
      (item, index) => suggestionIdArray.indexOf(item) === index
    );
    const suggestionList: suggestionCategory[] = [];
    if (Array.isArray(suggestionItems?.suggestion?.value)) {
      suggestionItems?.suggestion?.value.forEach((item: any, index: number) => {
        if (index > 0) {
          suggestionList.push({
            categoryName: SourcesType?.Options?.frontEndTitle,
            description: isMultiDropdown
              ? !!item?.value
                ? item?.value
                : item
              : item,
            docs: [],
            isOptions: true,
          });
        }
      });
    }
    const isConflict = isAnySelected
      ? false
      : distinctSuggestionId.length > 1 &&
        distinctSuggestionId.filter((items) => items == suggestionItems?.id)
          .length > 0
        ? true
        : false;
    AISuggestionCarouseldata.push({
      id: suggestionItems?.id,
      cardType: allSources.length > 0 ? allSources[0]?.sourceItem?.type : "",
      defaultData: {
        pageNo: allSources.length > 0 ? Number(allSources[0]?.pageNo) : 0,
        infoContent:
          allSources.length > 0
            ? !!allSources[0]?.infoIconText
              ? String(allSources[0]?.infoIconText)
              : ""
            : "",
      },
      title: Array.isArray(suggestionItems?.suggestion?.value)
        ? isMultiDropdown
          ? !!suggestionItems?.suggestion?.value[0].value
            ? suggestionItems?.suggestion?.value[0].value
            : suggestionItems?.suggestion?.value[0]
          : suggestionItems?.suggestion?.value[0]
        : suggestionItems?.suggestion?.value,
      suggestionCount: Array.isArray(suggestionItems?.suggestion?.value)
        ? suggestionItems?.suggestion?.value?.length - 1
        : 0,
      suggestion: {
        suggestionCategory: suggestionList,
      },
      allSuggestions: suggestionItems?.suggestion?.value,
      sourceUrl:
        allSources.length > 0
          ? allSources[0]?.sourceItem?.type == SourcesType?.OPS_Data?.dbTittle
            ? ""
            : !!allSources[0]?.pageNo && allSources[0]?.pageNo > 0
              ? String(allSources[0]?.sourceItem?.SourceFile?.originalFileUrl) +
              "#page=" +
              allSources[0]?.pageNo
              : String(allSources[0]?.sourceItem?.SourceFile?.originalFileUrl)
          : "",
      sourceTitle:
        allSources.length > 0
          ? allSources[0]?.sourceItem?.type == SourcesType?.OPS_Data?.dbTittle
            ? allSources[0]?.createdAt
              ? dayjs(allSources[0]?.createdAt).format("DD MMMM YYYY - HH:mm A")
              : ""
            : allSources[0]?.sourceItem?.type == SourcesType?.Uploaded?.dbTittle
              ? String(allSources[0]?.sourceItem?.SourceFile?.originalFileName)
              : String(allSources[0]?.sourceItem?.SourceFile?.originalFileUrl)
          : "",
      sourceCount: allSources.length - 1,
      suggestionlist: {
        suggestionCategory: suggestionCategories,
      },
      conflict: isConflict,
      isSeletect: suggestionItems?.isSelected,
      formFieldId: suggestionItems?.formFieldId,
      HTMLSuggestion: suggestionItems?.suggestion,
    });
  });
  return AISuggestionCarouseldata;
};

export const getAISuggestionCarouselforFileData = (
  sourceData: GetSourceDataByInvitationIdQuery["Sources"],
  formFieldId: string
) => {
  const AISuggestionCarouseldata: AICArouselData[] = [];
  sourceData.forEach((sourceItems) => {
    if (sourceItems.type == SourcesType.Uploaded?.dbTittle || sourceItems.type == SourcesType.OPS_Data?.dbTittle) {
      const isOPSData = sourceItems.type == SourcesType.OPS_Data?.dbTittle;
      const displayTitle = isOPSData && sourceItems?.SourceFile?.created_at
        ? dayjs(sourceItems?.SourceFile?.created_at).format("DD MMMM YYYY - HH:mm A")
        : isOPSData
          ? ""
          : String(sourceItems?.SourceFile?.originalFileName);

      AISuggestionCarouseldata.push({
        id: sourceItems?.id,
        cardType: sourceItems.type,
        defaultData: {
          pageNo: 0,
          infoContent: "",
        },
        title: displayTitle,
        suggestionCount: 0,
        suggestion: {
          suggestionCategory: [],
        },
        allSuggestions: [
          {
            fileurl: isOPSData ? "" : String(sourceItems?.SourceFile?.originalFileUrl),
            fileName: displayTitle,
          },
        ],
        sourceUrl: isOPSData ? "" : String(sourceItems?.SourceFile?.originalFileUrl),
        sourceTitle: displayTitle,
        sourceCount: 0,
        suggestionlist: {
          suggestionCategory: [],
        },
        conflict: false,
        isSeletect: false,
        formFieldId: formFieldId,
      });
    }
  });
  return AISuggestionCarouseldata.sort((a, b) =>
    b.conflict < a.conflict ? -1 : 1
  ).sort((a, b) => {
    if (a.isSeletect && !b.isSeletect) return -1;
    if (!a.isSeletect && b.isSeletect) return 1;
    return 0;
  });
};

export const urlToFile = async (url: string, filename: string) => {
  try {
    // Fetch the file from the URL
    const response = await fetch(url);

    // Ensure the fetch was successful
    if (!response.ok) {
      throw new Error(`Failed to fetch file: ${response.statusText}`);
    }

    // Convert the response to a Blob
    const blob = await response.blob();

    // Create a File from the Blob
    return new File([blob], filename, { type: blob.type });
  } catch (error) {
    console.error("Error converting URL to File:", error);
    throw error;
  }
};

export const getAIProcesingStats = async (
  formId: string,
  invitationId: string,
  isAIUser?: boolean
) => {
  let AIcardData: AIDataCardsType = {
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
  if (!!formId && !!invitationId) {
    const apiBase = await resolveApiBase();
    await fetch(
      apiBase + "/warp/api/AI/AI-dataStats-calculation",
      {
        method: "POST",
        headers: {
          "content-type": "application/json",
        },
        body: JSON.stringify({
          formId: formId,
          invitationId: invitationId,
          isAIUser: isAIUser,
        }),
      }
    )
      .then((response) => response.json())
      .then(async (apiData) => {
        AIcardData.totalInputsRequired = apiData.data.totalInputsRequired;
        AIcardData.dataCapturedUsingAI = apiData.data.dataCapturedUsingAI;
        AIcardData.dataInputsWithMultipleValues =
          apiData.data.dataInputsWithMultipleValues;
        AIcardData.totalTimeSaved = apiData.data.totalTimeSaved;
        AIcardData.pendingDataPoints = apiData.data.pendingDataPoints;
        AIcardData.mandatoryFieldsCount = apiData.data.mandatoryFieldsCount;
        AIcardData.optionalFieldsCount = apiData.data.optionalFieldsCount;
        AIcardData.timeSavedMinutes = apiData.data.timeSavedMinutes;
        AIcardData.timeSavedUnit = apiData.data.timeSavedUnit;
      })
      .catch((error) => {
        console.error("Error:", error);
        return null;
      });
  }
  return AIcardData;
};

export const formatFileName = (fileName: string): string => {
  // Remove file extension (e.g., '.pdf', '.txt')
  let formattedName = fileName.replace(/\.[^/.]+$/, "");

  // Replace non-alphanumeric characters with a space, and treat consecutive special chars as one space
  formattedName = formattedName.replace(/[^a-zA-Z0-9]+/g, " ").trim();

  // Capitalize the first letter of each word
  formattedName = formattedName.replace(/\b\w/g, (char) => char.toUpperCase());

  return formattedName;
};
export const calculateEstimatedTime = (
  inputCount: number,
  perInputTime: number
) => {
  let totalTime: number = inputCount * perInputTime;
  //let totalTimeUnit = " hrs";
  // if (totalTime > 60) {
  //   const hours = Math.floor(totalTime / 60);
  //   const minutes = totalTime % 60;
  //   totalTime = minutes >= 30 ? hours + 0.3 : hours;
  // } else {
  //   totalTimeUnit = " min";
  //   if (totalTime > 0 && totalTime <= 15) {
  //     totalTime = 15;
  //   } else if (totalTime > 15 && totalTime <= 30) {
  //     totalTime = 30;
  //   } else if (totalTime > 30 && totalTime <= 60) {
  //     totalTime = 30;
  //   }
  // }
  // return totalTime + totalTimeUnit;
  const estimatedTime = Math.floor(totalTime / 60);
  return estimatedTime < 1 ? "1 hr" : estimatedTime + " hrs";
};

export const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

export const isURLValid = (location: string | undefined): boolean => {
  if (!location) return false;

  // Regular expression to match an S3 URL
  const s3UrlPattern = /^https?:\/\/s3\.[a-z0-9-]+\.amazonaws\.com\//i;

  return s3UrlPattern.test(location);
};

export function extractAllChildren(formFieldObj: FormFieldWithChildrenType) {
  let allChildrenList: any[] = [];
  let childs = new Set<FormFieldWithChildrenType>(
    formFieldObj?.children?.length
      ? [...formFieldObj.children, formFieldObj]
      : [{ ...formFieldObj }]
  );

  while (childs.size > 0) {
    const currentChild = Array.from(childs).pop(); // Get the last child
    if (!currentChild) continue;

    childs.delete(currentChild); // Remove it from the set

    if (currentChild.type !== "container" && currentChild.type !== "label") {
      allChildrenList.push(currentChild);
    }

    if (currentChild.children && currentChild.children.length > 0) {
      currentChild.children.forEach((child) => childs.add(child));
    }
  }
  return allChildrenList;
}

export function extractMultipleSelectChildren(
  formFieldObj: FormFieldWithChildrenType,
  answers: any
) {
  let allChildrenList: any[] = [];
  let childs = new Set<FormFieldWithChildrenType>(
    formFieldObj?.children?.length
      ? [...formFieldObj.children, formFieldObj]
      : [{ ...formFieldObj }]
  );

  while (childs.size > 0) {
    const currentChild = Array.from(childs).pop(); // Get the last child
    if (!currentChild) continue;

    childs.delete(currentChild); // Remove it from the set

    if (
      (currentChild.interface === "select-multiple-dropdown" ||
        currentChild.interface === "selected-multiple-dropdown" ||
        currentChild.interface === "multi-select-row" ||
        currentChild.interface === "select-multiple-checkbox") &&
      answers[currentChild?.field]?.value?.length > 0
    ) {
      allChildrenList.push(currentChild);

      if (currentChild.children && currentChild.children.length > 0) {
        currentChild.children.forEach((child) => allChildrenList.push(child));
      }
    }

    if (currentChild.children && currentChild.children.length > 0) {
      currentChild.children.forEach((child) => childs.add(child));
    }
  }
  return allChildrenList;
}

export function extractGroupFieldIDwithAnswer(obj: any, answers: any) {
  return obj
    .filter((child: any) => child.interfaceOptions?.isOptional ? child.field && child.interfaceOptions?.isOptional !== true : child.field)
    .map((child: any) => ({
      field: child.field,
      value: answers[child?.field]?.value ? true : false,
      ans: answers[child?.field]?.value,
      required: child.fieldOptions.required,
    }));
}

export function flattenObjectValues(input: any) {
  let output: any = {};

  function processEntry(key: any, entry: any) {
    if (entry && typeof entry === "object" && !Array.isArray(entry)) {
      if ("value" in entry) {
        if (Array.isArray(entry.value)) {
          // Handling array values (nested objects)
          entry.value.forEach((item: any) => {
            if (item._id && "value" in item) {
              output[key] = { value: item.value };
            } else {
              output[key] = { value: true };
            }
            for (let subKey in item) {
              if (subKey !== "_id" && subKey !== "value") {
                const hasItemVal = hasValue(item[subKey]?.value);
                const prevVal = output[subKey] === undefined ? true : output[subKey].value;
                output[subKey] = { value: prevVal && hasItemVal };
              }
            }
          });
        } else {
          output[key] = { value: entry.value };
        }
      }
    }
  }

  for (let key in input) {
    processEntry(key, input[key]);
  }

  return output;
}

export function extractValidChildren(formField: FormFieldWithChildrenType) {
  const validChildren = new Set();

  function processChildren(
    children: FormFieldWithChildrenType[],
    isParentContainer: boolean
  ) {
    for (const child of children) {
      if (child.type === "container" || child.type === "label") {
        // If the child is a container or label, process its children
        processChildren(child.children || [], false);
      } else {
        // Add child to set only if its parent is a container/label
        if (child?.fieldOptions?.enable) {
          validChildren.add(child);
        }
      }
    }
  }
  if (formField?.type !== "container" && formField?.type !== "label") {
    validChildren.add(formField);
  }
  processChildren(
    formField?.children || [],
    formField.type === "container" || formField.type === "label"
  );
  return Array.from(validChildren).length > 0
    ? Array.from(validChildren)
    : [formField];
}

export async function refineVisibleFields(questions: any, answers: any) {
  let visibleFields = new Set();
  let queue = [...questions];

  while (queue.length > 0) {
    const field = queue.pop();

    if (field.displayRules && Array.isArray(field.displayRules)) {
      for (const ruleObj of field.displayRules) {
        if (ruleObj.rule) {
          try {
            const expression = getJsonataExpression(ruleObj.rule);
            const result = await expression.evaluate(answers);

            if (result) {
              visibleFields.add(field);

              // Extract field names from the rule
              const fieldMatches = ruleObj.rule.match(/\b([a-zA-Z0-9_]+)\b/g);
              if (fieldMatches) {
                fieldMatches.forEach((fieldKey: any) => {
                  const referencedField = questions.find(
                    (q: any) => q.field === fieldKey
                  );
                  if (referencedField) {
                    visibleFields.add(referencedField);
                  }
                });
              }

              queue.push(
                ...questions.filter((q: any) =>
                  q.displayRules?.some((dr: any) => dr.rule.includes(field.field))
                )
              );
            }
          } catch (error) {
            console.error("Error evaluating display rule:", error);
          }
        }
      }
    }
  }

  return Array.from(visibleFields);
}

/**
 * Resolve the base URL for AIprocessing fetch calls.
 *
 * On the client returns "" (relative — resolves from site root).
 * On the server reads NEXT_PUBLIC_API_BASE_URL from AWS Secrets Manager;
 * falls back to process.env if the secrets fetch fails (e.g. local dev
 * without AWS credentials). The dynamic import keeps the AWS SDK out of
 * the client bundle.
 */
async function resolveApiBase(): Promise<string> {
  if (typeof window !== "undefined") return "";
  let raw = "";
  try {
    const { getSecret } = await import(
      "@/lib/util/secrete/secrets-manager.service"
    );
    raw = (await getSecret("NEXT_PUBLIC_API_BASE_URL")) ?? "";
  } catch (error) {
    console.warn(
      "[common-functions] Falling back to process.env for NEXT_PUBLIC_API_BASE_URL:",
      error
    );
    raw = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
  }
  // Strip trailing slash so caller can concat `apiBase + "/warp/api/..."`
  // without producing a double slash (".env.local" often ships with a trailing /).
  return raw.replace(/\/+$/, "");
}

//to call Curation for AI
export const callAIAPI = async (formInvitationData: webCurationAPIDataType) => {
  /**
   * Path note: the AIprocessing route lives at /api/warp/AI/AIprocessing, but
   * is exposed publicly as /warp/api/AI/AIprocessing via next.config.ts
   * rewrites. That public path bypasses the /api/* JWT middleware, matching
   * every other AIprocessing caller in the codebase. Hitting /api/AI/...
   * would route through the auth middleware and 401 with "Missing
   * authorization header".
   *
   * apiBase resolution:
   * - Client: "" so the path resolves from the site root. NEXT_PUBLIC_ env
   *   vars are inlined at build time and may be undefined in the browser
   *   bundle if absent during build.
   * - Server: fetch needs an absolute URL. Source it from AWS Secrets
   *   Manager (the canonical config store per CLAUDE.md) rather than
   *   process.env, which is unreliable at runtime. Dynamic-import to keep
   *   the AWS SDK out of the client bundle.
   */
  const apiBase = await resolveApiBase();
  await fetch(apiBase + "/warp/api/AI/AIprocessing", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      process: "newFormInvitation",
      data: formInvitationData,
    }),
  })
    .then((response) => {
      if (response?.statusText == "OK" && response?.status == 200) {
        return response.json();
      }
    })
    .then(async (resultdata) => {
      console.log(JSON.stringify(resultdata), "resultdata");
    });
};

export const callUploadDocumentIngestingAPI = async (
  requestBody: any,
  processType: string = "ingesting"
) => {
  const apiBase = await resolveApiBase();
  const response = await fetch(apiBase + "/warp/api/AI/AIprocessing", {
    method: "POST",
    headers: {
      "content-type": "application/json",
    },
    body: JSON.stringify({
      process: processType,
      data: requestBody,
    }),
  });

  const resultdata = await response.json().catch(() => null);
  if (!response.ok) {
    throw new Error(
      resultdata?.error ??
      resultdata?.message ??
      `AI processing request failed with status ${response.status}`
    );
  }
  return resultdata;
};

export const LongTextTrim = (text: string, maxLength: number): string => {
  return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
};

// Helper function to check if a document is expired
export const isDocumentExpired = (
  expiryDate: string | null | undefined
): boolean => {
  if (!expiryDate) return false;

  try {
    // Extract date components to avoid timezone parsing issues
    const expiryDateString = expiryDate.includes("T")
      ? expiryDate.split("T")[0]
      : expiryDate;

    const [expiryYear, expiryMonth, expiryDay] = expiryDateString
      .split("-")
      .map((num) => parseInt(num, 10));

    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11
    const currentDay = today.getDate();

    // Compare year, month, day directly without timezone conversion
    if (currentYear > expiryYear) return true;
    if (currentYear < expiryYear) return false;

    if (currentMonth > expiryMonth) return true;
    if (currentMonth < expiryMonth) return false;

    // Same year and month, compare days
    // Document is valid throughout the entire expiry date, becomes expired the next day
    return currentDay > expiryDay;
  } catch (error) {
    console.error("Error parsing expiry date:", expiryDate, error);
    return false; // Fallback: treat as not expired if parsing fails
  }
};
// Capitalize the first letter of each word
export const capitalize = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};
