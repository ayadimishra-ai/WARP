import { CustomError } from "@/modules/warp/packages/shared/utils/custom-error.util";
import { NextApiHandler } from "next";
type ApiErrorGuardType = (handler: NextApiHandler) => NextApiHandler;
const AUTH_KEY =
  "0137ceae819f42f37940acfbbb54db1aaf2162ee973581e695f9ec4f13389d56";
const ApiHasuraWebhookGuard: ApiErrorGuardType =
  (handler) => async (req, res) => {
    if (!handler)
      throw CustomError({
        code: 500,
        message: "Invalid error guard implementation.",
      });
    if (req.headers["authorization"] !== AUTH_KEY) {
      throw CustomError({
        code: 401,
        message: "Unauthorized",
      });
    }
    return await handler(req, res);
  };
export default ApiHasuraWebhookGuard;