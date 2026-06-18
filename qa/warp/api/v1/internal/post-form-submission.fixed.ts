import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import { sdk } from "@warp/graphql/generated/server";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { FormInvitationStatus } from "@warp/shared/constants/app.constants";
import { FormSubmissionStatus } from "@warp/shared/constants/form-submission.constants";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { processScoreCalculation } from "../../calculate-score";
import { processProgressReportScore } from "../../progress-report-score";

const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
if (!HASURA_GRAPHQL_JWT_SECRET) {
  throw new Error("HASURA_GRAPHQL_JWT_SECRET environment variable is required");
}

// Keep in sync with @warp/shared/constants
const GLOBAL_MASTER_RECOMMENDATION_KEY = "Recommendation_new";

async function logErrorToS3(error: any) {
  console.error("Error in postFormSubmissionHandler:", error);
  const errorContent = JSON.stringify({
    datetime: new Date().toISOString(),
    message: error.message,
    stack: error.stack,
  });
  try {
    await uploadError("exception-logs", "exception-logs", errorContent);
  } catch (s3Error) {
    console.error("Failed to upload error to S3:", s3Error);
  }
}

async function processScoresAndReports(params: {
  formId: string;
  submissionId: string;
  invitationId: string;
  targetInvitationStatus: string;
  questionId?: string | null;
  interimAnswerId?: string | null;
}) {
  const { formId, submissionId, invitationId, targetInvitationStatus, questionId, interimAnswerId } =
    params;

  await processScoreCalculation(formId, submissionId, invitationId, targetInvitationStatus);

  const result = await processProgressReportScore(
    formId,
    submissionId,
    invitationId,
    true,
    questionId || "",
    interimAnswerId || ""
  );

  if (result.status !== 200) {
    throw new Error("Process Progress Report Score Failed");
  }

  return result;
}

const postFormSubmissionHandler: NextApiHandler = async (req, res) => {
  // Authentication
  const accessToken = String(req.headers.authorization ?? "");
  if (!accessToken) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
  try {
    const decoded = jwt.verify(accessToken, HASURA_GRAPHQL_JWT_SECRET, { algorithms: ["HS256"] });
    parseHasuraClaims(decoded as any, accessToken);
  } catch {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }

  const { id: submissionId, invitationId, status: submissionStatus, questionId, interimAnswerId } =
    req.body;

  try {
    if (!submissionId || !invitationId || !submissionStatus) {
      return res.status(400).json({ error: { message: "Required details are missing" } });
    }

    if (
      submissionStatus !== FormSubmissionStatus.Submitted &&
      submissionStatus !== FormSubmissionStatus.Approved
    ) {
      if (submissionStatus === FormSubmissionStatus.Successful) {
        return res.status(200).json({ result: { data: "Form submission already processed" } });
      }
      return res.status(400).json({
        error: { message: "Invalid request. Only 'Submitted' or 'Approved' status can be processed." },
      });
    }

    const submissionDetails = await sdk.getPostSubmissionRequiredDetails({
      formSubmissionId: submissionId,
    });

    const formMeta = submissionDetails?.FormSubmission[0]?.FormInvitation;
    const formId = formMeta?.Form?.id;
    const companyId = formMeta?.companyId;
    const reviewerParentCompanyId = formMeta?.reviewerParentCompanyId;

    if (!formId || !companyId) {
      return res.status(400).json({ error: { message: "Required form/company details are missing" } });
    }

    const targetInvitationStatus = reviewerParentCompanyId
      ? FormInvitationStatus.Approved
      : FormInvitationStatus.Submitted;

    const isRecommendation = await sdk.getGlobalMasterByType({ type: GLOBAL_MASTER_RECOMMENDATION_KEY });
    const isRecommendationForm = isRecommendation?.GlobalMaster[0]?.data?.some(
      (record: any) => record.FormId === formId
    );

    if (isRecommendationForm) {
      const formInvitationDetails = await sdk.getFormInvitationDetailsbyId({
        invitationId,
        sourceType: "form",
      });

      const shouldSkipInterim =
        !!formInvitationDetails?.FormInvitation?.[0]?.interimCheck
          ?.isCarryForwardAsSuggestionsInvitation;

      if (!shouldSkipInterim) {
        const answersData = await sdk.getAnswersByFormSubmissionId({ SubmissionId: submissionId });
        // TODO: map Answer[] → Interim_Answer_Insert_Input[] explicitly instead of casting
        await sdk.bulkInsertInterimAnswer({ interinm_input: answersData.Answer as any });
      }

      await processScoresAndReports({
        formId,
        submissionId,
        invitationId,
        targetInvitationStatus,
        questionId,
        interimAnswerId,
      });

      await sdk.updateFormInvitationStatus({ invitationId, invitationStatus: targetInvitationStatus });
    } else {
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

      await sdk.updateFormInvitationStatus({ invitationId, invitationStatus: targetInvitationStatus });
    }

    await sdk.updateSubmissionStatus({
      submissionId,
      submissionStatus: FormSubmissionStatus.Successful,
    });

    return res.status(200).json({ data: { submissionId, status: FormSubmissionStatus.Successful }, error: null });
  } catch (error: any) {
    await logErrorToS3(error);
    try {
      await sdk.updateSubmissionStatus({
        submissionId,
        submissionStatus: FormSubmissionStatus.Failed,
      });
    } catch (statusError) {
      console.error("Failed to update submission status to Failed:", statusError);
    }
    return res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

const handler = ApiErrorGuard(ApiMethodGuard(postFormSubmissionHandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
