import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { sdk } from "@warp/graphql/generated/server";
import {
  Interim_Answer_Insert_Input,
  Interim_Answer_Updates,
} from "@warp/graphql/generated/types";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { FormInvitationStatus } from "@warp/shared/constants/app.constants";
import { FormSubmissionStatus } from "@warp/shared/constants/form-submission.constants";
import { processScoreCalculation } from "../../calculate-score";
import { processProgressReportScore } from "../../progress-report-score";

/**
 * Logs errors to S3 for debugging purposes.
 */
async function logErrorToS3(error: any) {
  console.error("Error in postFormSubmissionHandler:", error);
  const currentDate = new Date();
  const errorContent = JSON.stringify({
    datetime: currentDate.toISOString(),
    message: error.message,
    stack: error.stack,
  });
  try {
    await uploadError("exception-logs", "exception-logs", errorContent);
  } catch (s3Error) {
    console.error("Failed to upload error to S3:", s3Error);
  }
}

/**
 * Handles score and progress report processing.
 */
async function processScoresAndReports(params: {
  formId: string;
  submissionId: string;
  invitationId: string;
  targetInvitationStatus: string;
  questionId?: string | null;
  interimAnswerId?: string | null;
}) {
  const {
    formId,
    submissionId,
    invitationId,
    targetInvitationStatus,
    questionId,
    interimAnswerId,
  } = params;


  await processScoreCalculation(
    formId,
    submissionId,
    invitationId,
    targetInvitationStatus
  );

  const result = await processProgressReportScore(
    formId,
    submissionId,
    invitationId,
    "true",
    questionId || "",
    interimAnswerId || ""
  );

  if (result.status !== 200) {
    throw new Error("Process Progress Report Score Failed");
  }

  return result;
}

/**
 * Main API Handler for Form Submission Processing.
 */
const postFormSubmissionHander: NextApiHandler = async (req, res) => {
  const {
    id: submissionId,
    invitationId,
    status: submissionStatus,
    questionId,
    interimAnswerId,
  } = req.body;
  try {
    // 1. Validation
    if (!submissionId || !invitationId || !submissionStatus) {
      return res.status(400).json({
        error: { message: "Required details are missing", data: req.body },
      });
    }

    if (
      submissionStatus !== FormSubmissionStatus.Submitted &&
      submissionStatus !== FormSubmissionStatus.Approved
    ) {
      if (submissionStatus === FormSubmissionStatus.Successful) {
        return res.status(200).json({
          result: { data: "Form submission already processed" },
        });
      }
      return res.status(400).json({
        error: {
          message:
            "Invalid request. Only 'Submitted' or 'Approved' status can be processed.",
          data: req.body,
        },
      });
    }

    // 2. Fetch required metadata
    const submissionDetails = await sdk.getPostSubmissionRequiredDetails({
      formSubmissionId: submissionId,
    });

    const formMeta = submissionDetails?.FormSubmission[0]?.FormInvitation;
    const formId = formMeta?.Form?.id;
    const companyId = formMeta?.companyId;
    const reviewerParentCompanyId = formMeta?.reviewerParentCompanyId;

    if (!formId || !companyId) {
      return res.status(400).json({
        error: {
          message: "Required form/company details are missing",
          data: { formId, companyId },
        },
      });
    }

    const targetInvitationStatus = reviewerParentCompanyId
      ? FormInvitationStatus.Approved
      : FormInvitationStatus.Submitted;

    // 3. Determine if it's a Recommendation form
    const isRecommendation = await sdk.getGlobalMasterByType({
      type: "Recommendation_new",
    });
    const isRecommendationForm = isRecommendation?.GlobalMaster[0]?.data?.some(
      (record: any) => record.FormId === formId
    );

    if (isRecommendationForm) {
      // HANDLE RECOMMENDATION FLOW
      const formInvitationDetails = await sdk.getFormInvitationDetailsbyId({
        invitationId,
        sourceType: "form",
      });

      // Skip Interim_Answer insertion if isCarryForwardAsSuggestionsInvitation flag is true
      const shouldSkipInterim =
        !!formInvitationDetails?.FormInvitation?.[0]?.interimCheck
          ?.isCarryForwardAsSuggestionsInvitation;

      let interimAnswer_Answer: any = null;

      if (!shouldSkipInterim) {
        interimAnswer_Answer = await sdk.getAnswersByFormSubmissionId({
          SubmissionId: submissionId,
        });

        const interimAnswers: Interim_Answer_Insert_Input[] =
          interimAnswer_Answer.Answer;
        await sdk.bulkInsertInterimAnswer({ interinm_input: interimAnswers });
      }

      if (
        !shouldSkipInterim &&
        interimAnswer_Answer?.carryForWardData?.length
      ) {

        const updateChunks: Interim_Answer_Updates[] =
          interimAnswer_Answer.carryForWardData
            .filter((item: any) => item.Interim_Answers?.length > 0)
            .map((item: any) => {
              const answer = item.Interim_Answers[0];
              const answerId = answer?.interim_answer_id || answer?.id;
              return {
                where: {
                  formFieldId: { _eq: item.formFieldId },
                  submissionId: { _eq: item.submissionId },
                  questionId: { _eq: item.questionId },
                },
                _set: { interim_answer_id: answerId },
              };
            });

        if (updateChunks.length > 0) {
          await sdk.updateInterimAnswerByQuestionIdAndSubmissionId({
            Interim_AnswerUpdate: updateChunks,
          });
        }
      }


      // Processing score for recommendation
      await processScoresAndReports({
        formId,
        submissionId,
        invitationId,
        targetInvitationStatus,
        questionId,
        interimAnswerId,
      });

      await sdk.updateFormInvitationStatus({
        invitationId,
        invitationStatus: targetInvitationStatus,
      });
    } else {
      // HANDLE STANDARD FLOW
      await sdk.updateSubmissionStatusForInProgress({
        submissionId,
        submissionStatus: FormSubmissionStatus.InProgress,
      });

      await processScoresAndReports({
        formId,
        submissionId,
        invitationId,
        targetInvitationStatus,
        questionId: questionId || null,
        interimAnswerId: interimAnswerId || null,
      });

      await sdk.updateFormInvitationStatus({
        invitationId,
        invitationStatus: targetInvitationStatus,
      });
    }

    // 4. Final Success Update
    await sdk.updateSubmissionStatus({
      submissionId,
      submissionStatus: FormSubmissionStatus.Successful,
    });

    return res.status(200).send({ data: req.body, error: null });
  } catch (error: any) {
    await logErrorToS3(error);

    // Update status to failed
    try {
      await sdk.updateSubmissionStatus({
        submissionId,
        submissionStatus: FormSubmissionStatus.Failed,
      });
    } catch (statusError) {
      console.error(
        "Failed to update submission status to Failed:",
        statusError
      );
    }

    return res
      .status(500)
      .json({ error: error?.message || "Internal Server Error" });
  }
};

const handler = ApiErrorGuard(ApiMethodGuard(postFormSubmissionHander, "POST"));
export default handler as (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;
