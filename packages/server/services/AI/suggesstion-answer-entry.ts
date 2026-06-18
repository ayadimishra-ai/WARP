import { sdk } from "@warp/graphql/generated/server";
import {
  Answer_Insert_Input,
  GetSuggestionsAndFormFieldDataByInvitationIdQuery,
  Suggestions_Updates,
} from "@warp/graphql/generated/types";
import {
  formQuestionPercentageFill,
  inputFieldsinFormFields,
} from "@warp/shared/constants/app.constants";
import jsonata from "jsonata";
import { uploadError } from "../aws-s3.service";

export const suggestionAnswerEntry = async (
  invitationId: string,
  submissionId: string
) => {
  const response: Record<string, any>[] = [];
  const fieldItemsObject: any = {};
  const formPercentageFill: formQuestionPercentageFill[] = [];
  try {
    const suggestionData =
      await sdk.getSuggestionsAndFormFieldDataByInvitationId({
        invitationId: invitationId,
        inputFields: inputFieldsinFormFields,
      });
    const uniqueformFieldIds: GetSuggestionsAndFormFieldDataByInvitationIdQuery["FormInvitation"][0]["Suggestions"] =
      [];
    const duplicateFormFieldIds: GetSuggestionsAndFormFieldDataByInvitationIdQuery["FormInvitation"][0]["Suggestions"] =
      [];
    suggestionData?.FormInvitation.forEach((items) => {
      items.Suggestions.forEach((suggestionItem) => {
        if (
          !!items?.Suggestions &&
          items?.Suggestions.filter(
            (sItems) =>
              sItems.id != suggestionItem.id &&
              sItems.formFieldId == suggestionItem.formFieldId
          ).length == 0
        ) {
          let answerValue = suggestionItem?.suggestion;
          if (
            suggestionItem?.FormField?.type == "number" ||
            suggestionItem?.FormField?.type == "number-input"
          ) {
            answerValue = Number(
              String(suggestionItem?.suggestion?.value)?.replace(/,/g, "")
            );
          }
          if (!isNaN(answerValue)) {
            fieldItemsObject[suggestionItem?.FormField?.field] =
              suggestionItem?.suggestion;
          }
          uniqueformFieldIds.push(suggestionItem);
        } else {
          duplicateFormFieldIds.push(suggestionItem);
        }
      });
    });
    //#region to calculate Complete Percentage of Form Invitation
    suggestionData?.FormInvitation.forEach((items) => {
      const allQuestionKeys = items?.Form?.FormFields.sort(function (
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
        items?.Form?.FormFields.filter(
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
    });
    const totalrequiredAnswer = uniqueformFieldIds.filter((items) =>
      formPercentageFill.some(
        (data) => data.formfieldId == items.formFieldId && data.isRequired
      )
    );
    const finalPercentage = Math.ceil(
      !!totalrequiredAnswer && totalrequiredAnswer.length > 0
        ? (totalrequiredAnswer.length * 100) /
            formPercentageFill?.filter(
              (item: formQuestionPercentageFill) => item?.isRequired
            ).length
        : 0
    );
    //#endregion
    let suggestionUpdate: Suggestions_Updates[] = [];
    const AnswerUpsertData: Answer_Insert_Input[] = [];
    duplicateFormFieldIds.forEach((items) => {
      suggestionUpdate.push({
        where: {
          id: {
            _eq: items?.id,
          },
        },
        _set: {
          isSelected: false,
        },
      });
    });
    uniqueformFieldIds.forEach((items) => {
      let answervalue = items?.suggestion;
      if (
        items?.FormField?.type == "percentage" ||
        items?.FormField?.type == "text-with-prefix" ||
        items?.FormField?.type == "currency-with-comma" ||
        items?.FormField?.type == "decimal-number" ||
        items?.FormField?.type === "currency-number"
      ) {
        answervalue = {
          value: String(items?.suggestion?.value)?.replace(/,/g, ""),
        };
      } else if (
        items?.FormField?.type == "number" ||
        items?.FormField?.type == "number-input"
      ) {
        answervalue = {
          value: Number(String(items?.suggestion?.value)?.replace(/,/g, "")),
        };
      }
      AnswerUpsertData.push({
        submissionId: submissionId,
        questionId: items?.FormField?.questionId,
        formFieldId: items?.formFieldId,
        data: answervalue,
      });
    });
    let updateSuggestion: any = [];
    let insertAnswer: any = [];
    insertAnswer = await sdk.bulkUpsertAnswerforAI({
      answerData: AnswerUpsertData,
      submissionId: submissionId,
    });
    if (suggestionUpdate.length > 0) {
      updateSuggestion = await sdk.bulkUpdateSuggestions({
        suggestionData: suggestionUpdate,
      });
    }
    await sdk.updateCompletionPercentage({
      invitationId: invitationId,
      completionPercentage: String(finalPercentage),
    });
    response.push({
      updateSuggestion: updateSuggestion,
      insertAnswer: insertAnswer,
      completion: finalPercentage,
    });
  } catch (error: any) {
    const errorContent = JSON.stringify({
      datetime: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
  }
  return response;
};
