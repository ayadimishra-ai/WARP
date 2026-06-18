import { encryptionDecryption } from "@/modules/warp/packages/client/hooks/encryption-decryption";
import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import {
  createCompany,
  updateCompany,
} from "@/modules/warp/packages/server/services/company.service";
import { NextApiRequest, NextApiResponse } from "next";
const { choosemethod } = encryptionDecryption();
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Request Method Validation
    if (req.method !== "POST" && req.method !== "PUT") {
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
    req.body[0].primaryContact.email = await choosemethod(
      req.body[0].primaryContact.email,
      "encrypt"
    );
    const body = req.body;
    if (req.method === "POST") {
      const responseData = await createCompany(body);

      res.status(200).send({ data: responseData, error: null });
      return;
    }

    if (req.method === "PUT") {
      const responseData = await updateCompany(body);

      res.status(200).send({ data: responseData, error: null });
      return;
    }
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
}
