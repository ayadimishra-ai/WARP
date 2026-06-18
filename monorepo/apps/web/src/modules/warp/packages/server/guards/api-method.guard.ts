import { NextApiHandler } from "next";

import { ApiMethodType } from "@/modules/warp/packages/shared/constants/api.constants";
import { CustomError } from "@/modules/warp/packages/shared/utils/custom-error.util";

type WithApiMethodType = (
  handler: NextApiHandler,
  method: ApiMethodType[] | ApiMethodType
) => NextApiHandler;

const ApiMethodGuard: WithApiMethodType =
  (handler, method = "GET") =>
  async (req, res) => {
    if (!handler || !req.method)
      throw CustomError({ code: 400, message: "Bad request" });

    let isValid = Array.isArray(method)
      ? method.map((m) => m.toLowerCase()).includes(req.method?.toLowerCase())
      : method.toLowerCase() === req.method?.toLowerCase();

    console.log({ method, req: req.method, isValid });

    if (!isValid) throw CustomError({ statusCode: 404, message: "Not found" });

    return await handler(req, res);
  };

export default ApiMethodGuard;
