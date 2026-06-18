import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { invitedAssessmentList } from "@warp/server/services/invited-assessment-list.services";
import { NextApiRequest, NextApiResponse } from "next";

async function GetInvitedAssessmentListByCompanyIdHandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const body = req.body;
  if (!body.companyId) {
    res.status(400).send("company is required");
    return;
  }

  const result = await invitedAssessmentList(body);
  return res.status(200).send({ response: result });

  // const response = await sdk.getInvitedAssessmentListByCompanyId(req.body);
  // res.send({ response });
  // return;
}


const handler = ApiErrorGuard(ApiMethodGuard(GetInvitedAssessmentListByCompanyIdHandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

