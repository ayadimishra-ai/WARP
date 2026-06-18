import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { FormSubmissionStatus } from "@/modules/warp/packages/shared/constants/form-submission.constants";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const submitFormHandler: NextApiHandler = async (req, res) => {
  let session;
  if (!!req?.headers?.authorization) {
    const accessToken = String(req.headers.authorization);
    const decodedToken: any = jwt.decode(accessToken);
    session = parseHasuraClaims(decodedToken, accessToken);
  }
  if (!session) {
    return res.status(500).json({
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
