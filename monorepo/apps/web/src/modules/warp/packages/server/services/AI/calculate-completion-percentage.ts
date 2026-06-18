import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { FormInvitation_Updates } from "@/modules/warp/packages/graphql/generated/types";
import {
  formQuestionPercentageFill,
  inputFieldsinFormFields,
  invitationCompletion,
} from "@/modules/warp/packages/shared/constants/app.constants";
import jsonata from "jsonata";
import { uploadError } from "../aws-s3.service";

export const calculateCompletionPercentage = async (
  invitationIdArray: string[],
  isForuploadDocPage: boolean
) => {
  const invitationPercentage: invitationCompletion[] = [];
  const formInvitationUpdates: FormInvitation_Updates[] = [];
  try {
    const invitationdata = await sdk.getFormInvitationbasicDetails({
      invitationId: invitationIdArray,
      inputFields: inputFieldsinFormFields,
    });
    invitationdata?.FormInvitation?.forEach((items) => {
      const formPercentageFill: formQuestionPercentageFill[] = [];
      const fieldItemsObject: any = {};
      let AnswerData = isForuploadDocPage
        ? items?.FormSubmissions[0]?.Answers
        : !!items?.FormSubmissions &&
          items?.FormSubmissions?.filter(
            (submissionItems) => submissionItems?.Answers.length > 0
          ).length > 0
          ? items?.FormSubmissions?.filter(
            (submissionItems) => submissionItems?.Answers.length > 0
          )[0]?.Answers
          : [];
      AnswerData?.forEach((answerItems) => {
        fieldItemsObject[String(answerItems?.FormField?.field)] =
          answerItems?.data;
      });
      const allQuestionKeys = items?.Form?.FormFields?.sort(function (
        a: any,
        b: any
      ) {
        if (!!a && !!b) {
          const aNums = a.Question.key.match(/\d+/g).map(Number);
          const bNums = a.Question.key.match(/\d+/g).map(Number);
          const maxLength = Math.max(aNums.length, bNums.length);
          for (let i = 0; i < maxLength; i++) {
            if (aNums[i] !== bNums[i]) {
              return aNums[i] - bNums[i]; // sort by number value
            }
          }
          return a.Question.key.localeCompare(b.Question.key); // if numbers are equal, sort alphabetically
        }
      }).map((fieldItems) => fieldItems.Question?.key);
      const uniqueQuestionKeys = allQuestionKeys.filter(
        (item, index) => allQuestionKeys.indexOf(item) === index
      );
      uniqueQuestionKeys.forEach((questionKeyItems) => {
        items?.Form?.FormFields?.filter(
          (fieldItems) => fieldItems.Question?.key == questionKeyItems
        ).forEach((questionItems) => {
          let fieldRequired: boolean = false;
          if (
            questionItems?.fieldOptions?.required &&
            questionItems?.fieldOptions?.enable
          ) {
            fieldRequired = true;
          } else {
            if (!!questionItems?.displayRules) {
              if (Array.isArray(questionItems?.displayRules)) {
                questionItems?.displayRules.forEach((displayItems) => {
                  if (jsonata(displayItems.rule).evaluate(fieldItemsObject)) {
                    if (
                      displayItems?.fieldOptions?.required &&
                      displayItems.fieldOptions?.enable
                    ) {
                      fieldRequired = true;
                    }
                  }
                });
              } else {
                if (
                  jsonata(questionItems?.displayRules?.rule).evaluate(
                    fieldItemsObject
                  )
                ) {
                  if (
                    questionItems?.displayRules?.fieldOptions?.required &&
                    questionItems?.displayRules?.fieldOptions?.enable
                  ) {
                    fieldRequired = true;
                  }
                }
              }
            }
          }
          formPercentageFill.push({
            isRequired: fieldRequired,
            questionId: questionItems?.questionId,
            formfieldId: questionItems?.id,
          });
        });
      });
      const totalrequiredAnswer = formPercentageFill.filter(
        (data) => data.isRequired
      );
      const totalrequiredAnswerGiven = AnswerData?.filter((items) =>
        formPercentageFill.some(
          (data) => data.formfieldId == items?.formFieldId && data.isRequired
        )
      );
      const finalPercentage = Math.ceil(
        !!totalrequiredAnswer && totalrequiredAnswer.length > 0
          ? (totalrequiredAnswerGiven.length * 100) / totalrequiredAnswer.length
          : 0
      );
      invitationPercentage.push({
        invitationId: items?.id,
        percentage: finalPercentage,
      });
    });
    invitationPercentage.forEach((items) => {
      formInvitationUpdates.push({
        where: {
          id: {
            _eq: items?.invitationId,
          },
        },
        _set: {
          completion: String(items?.percentage),
        },
      });
    });
    await sdk.updateFormInvitationStatusBulkbyId({
      formInvitationUpdateData: formInvitationUpdates,
      webCurationUpdateData: [],
      aiBulkDocumentProcessingUpdateData: [],
      opsCurationUpdateData: [],
    });
    //#endregion
  } catch (error: any) {
    const errorContent = JSON.stringify({
      datetime: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
  }
  return invitationPercentage;
};
