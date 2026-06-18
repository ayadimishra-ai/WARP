import { useCallback, useState } from "react";
import { useFormFieldStore } from "../store";

export interface FormSubmissionHookResult {
  upsertAnswer: (formFieldId: string) => Promise<boolean>;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  nextPrevLoading: boolean;
  setNextPrevLoading: (loading: boolean) => void;
}

export const useFormSubmission = (
  getAnswerByQuestionResult: any,
  userSession: any,
  setAnswersData: (
    data: any,
    submissionId: string,
    answers: any[],
    latestDataArray: any[],
    questionId: string,
    userId: string
  ) => void,
  getAnswersByQuestionId: (questionId: string) => any[]
): FormSubmissionHookResult => {
  const [loading, setLoading] = useState(false);
  const [nextPrevLoading, setNextPrevLoading] = useState(false);

  const upsertAnswer = useCallback(
    async (formFieldId: string): Promise<boolean> => {
      if (loading) return false;

      try {
        setNextPrevLoading(true);

        // Get required data
        const formField = useFormFieldStore
          .getState()
          .formFields.find((m: any) => m.Question?.id === formFieldId);
        const questionId = formField?.Question?.id;
        const submissionId = useFormFieldStore.getState().formSubmissionId;

        setLoading(true);

        // Validate inputs
        if (!submissionId || !questionId) {
          setLoading(false);
          setNextPrevLoading(false);
          return false;
        }

        const answers = getAnswersByQuestionId(questionId);
        if (!answers?.length) {
          setLoading(false);
          setNextPrevLoading(false);
          return false;
        }

        // Get answer data
        const { data } = await getAnswerByQuestionResult({
          variables: { questionId, submissionId },
        });

        // Prepare answer payload
        const latestDataArray = answers.map((item: any) => ({
          submissionId: item.submissionId,
          questionId: item.questionId,
          formFieldId: item.formFieldId,
          value: item.value || "",
        }));

        // Process the answer data
        setAnswersData(
          data,
          submissionId,
          answers,
          latestDataArray,
          questionId,
          userSession?.user?.id
        );

        setLoading(false);
        setNextPrevLoading(false);
        return true;
      } catch (error) {
        console.error("Error in upsertAnswer:", error);
        setLoading(false);
        setNextPrevLoading(false);
        return false;
      }
    },
    [
      getAnswerByQuestionResult,
      getAnswersByQuestionId,
      loading,
      setAnswersData,
      userSession?.user?.id,
    ]
  );

  return {
    upsertAnswer,
    loading,
    setLoading,
    nextPrevLoading,
    setNextPrevLoading,
  };
};
