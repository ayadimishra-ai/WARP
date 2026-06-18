import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { sendFormResponseMail } from "@warp/server/services/notification.service";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

export async function processFormSubmissionEmail(
  formId: string,
  submissionId: string,
  invitationId: string,
  companyId: string,
  platformId: string = "8459adc3-5375-4828-b127-4fc630b16c44"
) {
  try {
    if (!formId || !submissionId || !invitationId || !companyId)
      return {
        status: 400,
        result: { error: { message: "Required details missing" } },
      };

    //let session: any = "";
    // if (!!req?.headers?.authorization) {
    //   const accessToken = String(req.headers.authorization);
    //   const decodedToken: any = jwt.decode(accessToken);
    //   session = parseHasuraClaims(decodedToken, accessToken);
    // }
    const responseData = await sdk.GetGlobalMasterByEmailOnSubmission();
    const shouldSendEmail = responseData.GlobalMaster.some((m) =>
      m.data.some((data: any) => data.formId === formId)
    );
    if (shouldSendEmail)
      await sendFormResponseMail(
        invitationId,
        "FormResponse",
        companyId,
        formId,
        platformId
      );

    return {
      status: 200,
      result: "success",
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
      result: { error: error || "Internal Server Error" },
    };
  }
}

const formSubmissionEmailHandler: NextApiHandler = async (req, res) => {
  const { formId, submissionId, invitationId, companyId, platformId } =
    req.body;

  try {
    const result = await processFormSubmissionEmail(
      formId,
      submissionId,
      invitationId,
      companyId,
      platformId
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
    res.status(500).json({ error: error || "Internal Server Error" });
  }
};

const handler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(formSubmissionEmailHandler, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);

export default handler as (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;
export const dynamic = "force-dynamic";
