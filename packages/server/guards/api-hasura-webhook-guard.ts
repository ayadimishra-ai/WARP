import { CustomError } from "@warp/shared/utils/custom-error.util";
import crypto from "crypto";
import { NextApiHandler } from "next";

type ApiErrorGuardType = (handler: NextApiHandler) => NextApiHandler;

const ApiHasuraWebhookGuard: ApiErrorGuardType =
  (handler) => async (req, res) => {
    if (!handler)
      throw CustomError({
        code: 500,
        message: "Invalid error guard implementation.",
      });

    const secret = process.env.HASURA_WEBHOOK_SECRET;
    const incoming = req.headers["authorization"];

    if (!secret || !incoming) {
      throw CustomError({ code: 401, message: "Unauthorized" });
    }

    const secretBuf = Buffer.from(secret);
    const incomingBuf = Buffer.from(String(incoming));
    const match =
      secretBuf.length === incomingBuf.length &&
      crypto.timingSafeEqual(secretBuf, incomingBuf);

    if (!match) {
      throw CustomError({ code: 401, message: "Unauthorized" });
    }

    return await handler(req, res);
  };

export default ApiHasuraWebhookGuard;
