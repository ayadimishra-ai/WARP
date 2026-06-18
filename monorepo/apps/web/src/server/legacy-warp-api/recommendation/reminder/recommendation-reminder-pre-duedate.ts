import crypto from "crypto";
import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import { sendRecommenationReminderPreDueDate } from "@/modules/warp/packages/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  const expectedKey = process.env["WARP_INTERNAL_SHARED_KEY"];
  const incomingKey = req.headers["x-warp-shared-key"];
  if (
    !expectedKey ||
    typeof incomingKey !== "string" ||
    !incomingKey ||
    !crypto.timingSafeEqual(Buffer.from(incomingKey), Buffer.from(expectedKey))
  ) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const response: any = await sendRecommenationReminderPreDueDate(incomingKey);
    if (response === undefined) {
      res.status(200).send({ data: null, error: "Sending email" });
    } else {
      if (response.indexOf("OK") !== -1) {
        res.status(200).send({ data: response, error: null });
      } else {
        res.status(400).send({ data: null, error: "Failed to send email" });
      }
    }
    // } else {
    //   res.status(400).send({ error: "Body Should not be blank" });
    // }
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
