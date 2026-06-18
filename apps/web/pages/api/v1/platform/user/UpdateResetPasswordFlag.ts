import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { UpdateResetPassword } from "@warp/server/services/user.service";
import { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";

const AddressBodySchema = yup.object().shape({
  id: yup.string().required("IsResetPassword is Required"),
});

async function UpdateResetPasswordhandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const input = await AddressBodySchema.validate(req.body);
  if (req.method === "PUT") {
    const responseData = await UpdateResetPassword(input);
    res.status(200).send({ data: responseData, error: null });
  }
}

const handler = ApiErrorGuard(ApiMethodGuard(UpdateResetPasswordhandler, "PUT"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

