import { uploadError } from "@warp/server/services/aws-s3.service";
import { sendRecommenationReminderPostDueDate } from "@warp/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  try {
    const incomingKey = req.headers["x-warp-shared-key"];
    if (!incomingKey || String(incomingKey) !== process.env.WARP_CRON_SHARED_KEY) {
      return res.status(401).json({ error: "Unauthorized" });
    }
    const response: any = await sendRecommenationReminderPostDueDate(
      req.body.type,
      String(incomingKey)
    );

    if (response === undefined) {
      res.status(200).send({ data: null, error: "Sending email" });
    } else {
      if (!!response && response.includes("OK")) {
        res.status(200).send({ data: response, error: null });
      } else {
        res.status(400).send({ data: null, error: "Failed to send email" });
      }
    }
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
