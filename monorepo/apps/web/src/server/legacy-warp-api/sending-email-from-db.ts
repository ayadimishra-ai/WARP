import crypto from "crypto";
import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import { sendingEmailFromDb } from "@/modules/warp/packages/server/services/notification.service";
import { NextApiHandler } from "next";

const handler: NextApiHandler = async (req, res) => {
  // Guard: require a valid shared key using constant-time comparison to
  // prevent String(undefined) bypass and timing attacks.
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
    const date = new Date();

    const dateWithStartTime = new Date(date.setHours(0, 0, 0, 1));
    const dateWithEndTime = new Date(date.setHours(23, 59, 59, 999));

    const response: any = await sendingEmailFromDb(
      dateWithStartTime,
      dateWithEndTime,
      incomingKey
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
