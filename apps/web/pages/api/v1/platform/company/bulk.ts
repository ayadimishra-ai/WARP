import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { bulkInsertCompanyWithUsers } from "@warp/server/services/platform-sync.service";

const BulkInsertCompanyWithUsersHandler: NextApiHandler = async (req, res) => {
  // if (!req.body) throw CustomError({ statusCode: 400, message: "Bad request" });

  const result = await bulkInsertCompanyWithUsers(req.body);
  return res.status(200).send({ data: result, error: null });
};



const handler = ApiErrorGuard(ApiMethodGuard(BulkInsertCompanyWithUsersHandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
