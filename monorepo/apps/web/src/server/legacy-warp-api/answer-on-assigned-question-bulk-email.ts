import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import { answerOnAssignedQuestionBulkEmail } from "@/modules/warp/packages/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  try {
    const date = new Date();

    const dateWithStartTime = new Date(date.setHours(0, 0, 0, 1));
    const dateWithEndTime = new Date(date.setHours(23, 59, 59, 999));
    // const dateWithStartTime = new Date("2023-09-24T18:30:00.001Z");
    // const dateWithEndTime = new Date("2023-09-25T18T18:29:59.999Z");
    const sharedKey = String(req.headers["x-warp-shared-key"]);
    const response: any = await answerOnAssignedQuestionBulkEmail(
      dateWithStartTime,
      dateWithEndTime,
      sharedKey
    );
    res.status(200).send({ data: response, error: null });
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

export default handler;
