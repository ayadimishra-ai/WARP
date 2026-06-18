import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { updateAddresses } from "@warp/server/services/addresses.service";
import { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";

const AddressBodySchema = yup.array().of(
  yup.object().shape({
    id: yup.string().required("Id is Required"),
    addressType: yup.object().required("AddressType is Required"),
    addressLine1: yup.string().required("Address Line1 is Required"),
    country: yup.string().required("Country is Required"),
    state: yup.string().required("State is Required"),
    city: yup.string().required("City is Required"),
    zipcode: yup.string().required("Zipcode is Required"),
    companyId: yup.string().required("CompanyId is Required"),
  })
);

async function updateaddresshandler(req: NextApiRequest, res: NextApiResponse) {
  const input = await AddressBodySchema.validate(req.body);
  if (req.method === "PUT") {
    const responseData = await updateAddresses(input);
    res.status(200).send({ data: responseData, error: null });
  }
}

const handler = ApiErrorGuard(ApiMethodGuard(updateaddresshandler, "PUT"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
