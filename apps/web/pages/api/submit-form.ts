import { sdk } from "@warp/graphql/generated/server";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { FormSubmissionStatus } from "@warp/shared/constants/form-submission.constants";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const submitFormHandler: NextApiHandler = async (req, res) => {
  let session;
  const jwtSecret = process.env.HASURA_JWT_SECRET;
  if (!!req?.headers?.authorization && jwtSecret) {
    const rawHeader = String(req.headers.authorization);
    const accessToken = rawHeader.startsWith("Bearer ") ? rawHeader.slice(7) : rawHeader;
    try {
      const decodedToken: any = jwt.verify(accessToken, jwtSecret);
      session = parseHasuraClaims(decodedToken, accessToken);
    } catch {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }
  }
  if (!session) {
    return res.status(401).json({
      error: {
        message: "Unauthorized",
      },
    });
  }
  const { submissionId } = req.body;
  if (!submissionId) {
    return res.status(500).json({
      error: {
        message: "Required details are missing",
        data: req.body,
      },
    });
  }
  const submissionDetails = await sdk.updateSubmissionStatus({
    submissionId,
    submissionStatus: FormSubmissionStatus.Submitted,
  });
  return res.status(200).send({ data: "Success", error: null });
};

const handler = ApiErrorGuard(ApiMethodGuard(submitFormHandler, "POST"));
export default handler as (
  req: NextApiRequest,
  res: NextApiResponse
) => Promise<void>;
