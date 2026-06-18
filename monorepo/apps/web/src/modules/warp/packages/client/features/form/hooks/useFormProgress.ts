import { useMemo } from "react";

export const useFormProgress = (
  questions: any[],
  getAnswersByQuestionId: (questionId: string) => any[]
) => {
  const calculateProgress = useMemo(() => {
    if (!questions?.length) return 0;

    // Count answered questions
    const totalAnswered = questions.reduce((count, question) => {
      const answers = getAnswersByQuestionId(question.id);
      const isAnswered = answers?.some(
        (a: any) => a.value !== undefined && a.value !== null && a.value !== ""
      );
      return isAnswered ? count + 1 : count;
    }, 0);

    // Calculate percentage
    return Math.floor((totalAnswered / questions.length) * 100);
  }, [getAnswersByQuestionId, questions]);

  return {
    progressPercentage: calculateProgress,
  };
};
