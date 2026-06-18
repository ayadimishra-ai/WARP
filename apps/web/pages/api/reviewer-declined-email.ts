import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { reviewerFormDeclinedResponseEmail } from "@warp/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
    try {
        const response: any = await reviewerFormDeclinedResponseEmail(
            req.body.id,
            req.body.type,
            req.body.companyId,
            req.body.formId,
            req.body.platformId,
            req.body.questionId
        );

        if (!!response?.response && response.response.includes("OK")) {
            res.status(200).send({ data: response, error: null });
        } else if (response === "") {
            // Empty response indicates no reviewer exists or email not sent
            // This is not an error, just a no-op
            res.status(200).send({ data: "No reviewer email sent", error: null });
        } else {
            res.status(400).send({ data: null, error: "Failed to send reviewer email" });
        }
    } catch (error) {
        console.error("[Reviewer Email API] Error:", error);
        // Return 200 to not block the main flow
        res.status(200).send({ data: null, error: "Reviewer email failed but flow continues" });
    }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
});

export const dynamic = "force-dynamic";
