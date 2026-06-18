import { uploadError } from "@warp/server/services/aws-s3.service";
import { sendingEmailFromDb } from "@warp/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  try {
    const date = new Date();

    const dateWithStartTime = new Date(date.setHours(0, 0, 0, 1));
    const dateWithEndTime = new Date(date.setHours(23, 59, 59, 999));

    // const dateWithStartTime = new Date("2024-05-17T00:00:00.001Z");
    // const dateWithEndTime = new Date("2024-05-17T23:59:59.999Z");
    const incomingKey = req.headers["x-warp-shared-key"];
    if (!incomingKey || String(incomingKey) !== process.env.WARP_CRON_SHARED_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const sharedKey = String(incomingKey);
    const response: any = await sendingEmailFromDb(
      dateWithStartTime,
      dateWithEndTime,
      sharedKey
    );

    res.status(200).send({ data: response });
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

export default handler;
