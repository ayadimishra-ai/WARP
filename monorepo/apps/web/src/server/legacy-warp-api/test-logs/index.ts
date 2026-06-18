import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const writeLogs = async () => {
    try {
        console.log("started");
        // Intentionally causing an exception
        const result = JSON.parse("{"); // Invalid JSON syntax
        console.log("ended");
    } catch (error) {
        throw error;
    }
};

const testLogsHandler: NextApiHandler = async (req, res) => {
    try {
        const result = await writeLogs();
        return res.status(200).json({ result });
    } catch (error: any) {
        const currentDate = new Date();
        const errorContent = JSON.stringify({
            datetime: currentDate.toISOString(),
            message: error.message,
            stack: error.stack
        });
        await uploadError("exception-logs", "exception-logs", errorContent);
        res.status(500).json({ error: error?.message || "Internal Server Error" });
    }
};

const handler_NEW = ApiErrorGuard(ApiMethodGuard(testLogsHandler, "POST"));
export default handler_NEW as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
