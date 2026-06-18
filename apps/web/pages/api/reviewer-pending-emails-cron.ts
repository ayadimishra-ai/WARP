import { uploadError } from "@warp/server/services/aws-s3.service";
import { sendReviewerPendingEmailsCron } from "@warp/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
    try {
        const sharedKey = String(req.headers["x-warp-shared-key"]);
        // Assuming sendReviewerPendingEmailsCron handles its own validation or doesn't strictly need the key for logic but for security
        await sendReviewerPendingEmailsCron(sharedKey);
        res.status(200).send({ data: "Cron job executed successfully", error: null });
    } catch (error: any) {
        const currentDate = new Date();
        const errorContent = JSON.stringify({
            datetime: currentDate.toISOString(),
            message: error.message,
            stack: error.stack,
        });
        await uploadError("exception-logs", "reviewer-pending-emails-cron", errorContent);
        res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
};

export default handler;
