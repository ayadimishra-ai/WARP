import { encryptionDecryption } from "@warp/client/hooks/encryption-decryption";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { updateEmailSubscribed } from "@warp/server/services/isemailsubscribed.service";
import { NextApiRequest, NextApiResponse } from "next";
const { choosemethod } = encryptionDecryption();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Request Method Validation
    if (req.method !== "PUT") {
      res.status(405).send({
        data: null,
        error: {
          code: res.statusCode,
          message: `${req.method} method not allowed.`,
          stack: null,
        },
      });
      return;
    }
    // Request Body Validation
    if (!req.body) {
      res.status(405).send({
        data: null,
        error: {
          code: res.statusCode,
          message: "Request body is required.",
          stack: null,
        },
      });
      return;
    }
    const body = req.body;
    if (req.method === "PUT") {
      const responseData = await updateEmailSubscribed(body);
      res.status(200).send({ data: responseData, error: null });
      return;
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
}
