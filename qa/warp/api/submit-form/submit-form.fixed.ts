import { sdk } from "@warp/graphql/generated/server";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { FormSubmissionStatus } from "@warp/shared/constants/form-submission.constants";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
if (!HASURA_GRAPHQL_JWT_SECRET) {
  throw new Error("HASURA_GRAPHQL_JWT_SECRET environment variable is required");
}

const submitFormHandler: NextApiHandler = async (req, res) => {
  let session;
  if (req?.headers?.authorization) {
    const accessToken = String(req.headers.authorization);
    try {
      const decodedToken = jwt.verify(accessToken, HASURA_GRAPHQL_JWT_SECRET, {
        algorithms: ["HS256"],
      }) as Record<string, any>;
      session = parseHasuraClaims(decodedToken, accessToken);
    } catch {
      return res.status(401).json({ error: { message: "Unauthorized" } });
    }
  }

  if (!session) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }

  const { submissionId } = req.body;
  if (!submissionId) {
    return res.status(400).json({ error: { message: "submissionId is required" } });
  }

  const result = await sdk.updateSubmissionStatus({
    submissionId,
    submissionStatus: FormSubmissionStatus.Submitted,
  });

  if (!result.update_FormSubmission?.affected_rows) {
    return res.status(404).json({ error: { message: "Submission not found" } });
  }

  return res.status(200).json({ data: "Success", error: null });
};

const handler = ApiErrorGuard(ApiMethodGuard(submitFormHandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
