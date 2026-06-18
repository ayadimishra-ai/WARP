import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { createInvitation } from "@/modules/warp/packages/server/services/invitation.service";
import { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";

const SendInvitationBodySchema = yup.array().of(
  yup.object().shape({
    companyId: yup.string().required("companyId is Required"),
    email: yup.string().email().required("email is Required"),
    formId: yup.string().required("formId is Required"),
  })
);

async function sendInvitationhandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = await SendInvitationBodySchema.validate(req.body);
  const responseData = await createInvitation(input);
  res.status(200).send({ data: responseData, error: null });
}

const handler = ApiErrorGuard(ApiMethodGuard(sendInvitationhandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;


