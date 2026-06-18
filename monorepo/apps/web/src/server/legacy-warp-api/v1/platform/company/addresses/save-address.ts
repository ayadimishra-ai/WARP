import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { SaveAddresses } from "@/modules/warp/packages/server/services/addresses.service";
import { NextApiRequest, NextApiResponse } from "next";
import * as yup from "yup";

const AddressBodySchema = yup.array().of(
  yup.object().shape({
    //addressType: yup.string().required("AddressType is Required"),
    addressLine1: yup.string().required("Address Line1 is Required"),
    country: yup.string().required("Country is Required"),
    state: yup.string().required("State is Required"),
    city: yup.string().required("City is Required"),
    zipcode: yup.string().required("Zipcode is Required"),
    companyId: yup.string().required("CompanyId is Required"),
  })
);

async function saveaddresshandler(req: NextApiRequest, res: NextApiResponse) {
  const input = await AddressBodySchema.validate(req.body);
  if (req.method === "POST") {
    const responseData = await SaveAddresses(input);
    res.status(200).send({ data: responseData, error: null });
  }
}
const handler = ApiErrorGuard(ApiMethodGuard(saveaddresshandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
