import { sdk } from "@warp/graphql/generated/server";
import {
  Answer_Insert_Input,
  Suggestions_Updates,
} from "@warp/graphql/generated/types";
import { inputFieldsinFormFields } from "@warp/shared/constants/app.constants";
import { calculateCompletionPercentage } from "./calculate-completion-percentage";

export const suggestionCleanup = async (invitationId: string[]) => {
  let suggesstion_updates: Suggestions_Updates[] = [];
  let AnswerUpsertData: Answer_Insert_Input[] = [];
  let updateSuggestion: any = [];
  let insertAnswer: any = [];
  const suggestionInvitationData =
    await sdk.getSuggestionsAndFormFieldDataByInvitationId({
      invitationId: invitationId,
      inputFields: inputFieldsinFormFields,
    });
  suggestionInvitationData?.FormInvitation?.forEach(async (items) => {
    const submissionData = items?.FormSubmissions.filter(
      (fItems) =>
        !!fItems.Answers_aggregate?.aggregate?.count &&
        fItems.Answers_aggregate?.aggregate?.count > 0
    );
    let submissionId = "";
    if (!!submissionData && submissionData.length > 0) {
      submissionId = submissionData[0]?.id;
    }
    suggesstion_updates = [];
    AnswerUpsertData = [];
    items?.Suggestions?.forEach((suggestItems) => {
      let answervalue = suggestItems?.suggestion;
      if (
        suggestItems?.FormField?.type == "percentage" ||
        suggestItems?.FormField?.type == "text-with-prefix" ||
        suggestItems?.FormField?.type == "currency-with-comma" ||
        suggestItems?.FormField?.type == "decimal-number" ||
        suggestItems?.FormField?.type === "currency-number"
      ) {
        answervalue = {
          value: String(suggestItems?.suggestion?.value)?.replace(/,/g, ""),
        };
      } else if (
        suggestItems?.FormField?.type == "number" ||
        suggestItems?.FormField?.type == "number-input"
      ) {
        answervalue = {
          value: Number(
            String(suggestItems?.suggestion?.value)?.replace(/,/g, "")
          ),
        };
      }
      suggesstion_updates.push({
        where: {
          id: {
            _eq: suggestItems?.id,
          },
        },
        _set: {
          suggestion: answervalue,
        },
      });
      if (suggestItems?.isSelected && submissionId) {
        AnswerUpsertData.push({
          submissionId: submissionId,
          questionId: suggestItems?.FormField?.questionId,
          formFieldId: suggestItems?.formFieldId,
          data: answervalue,
        });
      }
    });
    if (AnswerUpsertData.length > 0 && submissionId) {
      const insertAnswerFormInvitation = await sdk.bulkUpsertAnswerforAI({
        answerData: AnswerUpsertData,
        submissionId: submissionId,
      });
      insertAnswer.push(insertAnswerFormInvitation);
    }
    if (suggesstion_updates.length > 0) {
      const updateSuggestionFormInvitation = await sdk.bulkUpdateSuggestions({
        suggestionData: suggesstion_updates,
      });
      updateSuggestion.push(updateSuggestionFormInvitation);
    }
  });
  const percentageFormInvitation = await calculateCompletionPercentage(
    suggestionInvitationData?.FormInvitation?.map((items) => items?.id),
    false
  );
  return {
    updateSuggestion: updateSuggestion,
    insertAnswer: insertAnswer,
    completion: percentageFormInvitation,
  };
};
