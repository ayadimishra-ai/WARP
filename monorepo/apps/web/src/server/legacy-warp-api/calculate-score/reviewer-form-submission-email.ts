import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import { sendReviewerFormResponseMail } from "@/modules/warp/packages/server/services/notification.service";
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
                status: 500,
                result: { error: { message: "Required details missing" } },
            };
        const responseData = await sdk.GetGlobalMasterByEmailOnSubmission();
        const shouldSendEmail = responseData.GlobalMaster.some((m: any) =>
            m.data.some((data: any) => data.formId === formId)
        );
        if (shouldSendEmail)
            await sendReviewerFormResponseMail(
                invitationId,
                "ReviewerFormResponse",
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
            result: { error: error?.message || "Internal Server Error" },
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
        res.status(500).json({ error: error?.message || "Internal Server Error" });
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
