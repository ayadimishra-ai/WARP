import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { saveAnswers } from "@warp/server/services/save-Answers/saveAnswers";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
if (!HASURA_GRAPHQL_JWT_SECRET) {
  throw new Error("HASURA_GRAPHQL_JWT_SECRET environment variable is required");
}

const saveAnswersHandler: NextApiHandler = async (req, res) => {
  const accessToken = String(req.headers.authorization ?? "");
  if (!accessToken) {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }
  try {
    const decoded = jwt.verify(accessToken, HASURA_GRAPHQL_JWT_SECRET, { algorithms: ["HS256"] });
    parseHasuraClaims(decoded as any, accessToken);
  } catch {
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }

  if (!req.body) {
    return res.status(400).json({ data: null, error: { message: "Request body is required." } });
  }

  try {
    const responseData = await saveAnswers(req.body);
    return res.status(200).json({ data: responseData, error: null });
  } catch (error: any) {
    const errorContent = JSON.stringify({
      datetime: new Date().toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    return res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
};

const handler = ApiErrorGuard(ApiMethodGuard(saveAnswersHandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
