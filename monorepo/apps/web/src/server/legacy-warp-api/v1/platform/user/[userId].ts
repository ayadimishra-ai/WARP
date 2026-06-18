import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import { deleteUser } from "@/modules/warp/packages/server/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Request Method Validation
    if (req.method !== "DELETE") {
      res.status(405).send({
        data: null,
        error: {
          code: res.statusCode,
          message: `${req.method} not Request allowed.`,
          stack: null,
        },
      });
      return;
    }

    // User Details check in db if exist or not exist...
    const userDetail = await sdk.getUserDetailById({
      id: req.query.userId,
    });
    if (!userDetail.User.length) {
      res.status(409).send({
        data: null,
        error: {
          code: res.statusCode,
          message: "User Details not exist...",
          stack: null,
        },
      });
      return;
    }

    // User Details Delete Section
    if (req.method === "DELETE") {
      const responseData = await deleteUser(req.query.userId);

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
    res.status(500).json({ error: error || "Internal Server Error" });
  }
}
