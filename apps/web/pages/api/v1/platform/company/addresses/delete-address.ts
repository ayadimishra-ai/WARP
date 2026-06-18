import { deleteAddresses } from "@warp/server/services/addresses.service";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { NextApiRequest, NextApiResponse } from "next";
//import * as yup from "yup";

// const AddressBodySchema = yup.array().of(
//   yup.object().shape({
//     id: yup.string().required("Id is Required"),
//   })
// );

export default async function deleteaddresshandler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  //const input = await AddressBodySchema.validate(req.body);
  //   if (req.method === "Delete") {

  //     const responseData = await updateAddresses(input);
  //     res.status(200).send({ data: responseData, error: null });
  //   }
  try {
    if (req.method !== "DELETE") {
      res.status(405).send({
        data: null,
        error: {
          code: res.statusCode,
          message: `${req.method} method not allowed.`,
          stack: null,
        },
      });
      return;
    }
    const input = req.body[0].id;
    if (req.method === "DELETE" && input !== null) {
      const responseData = await deleteAddresses(req.body);

      res.status(200).send({ data: responseData, error: null });
      return;
    }
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    res.status(500).json({ error: error || "Internal Server Error" });
  }
}
//export default ApiErrorGuard(ApiMethodGuard(updateaddresshandler, "Delete"));
