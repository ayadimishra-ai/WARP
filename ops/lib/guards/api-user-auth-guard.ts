import { NextRequest } from "next/server";
import { CustomError } from "~/shared/error/custom-error";
import { TUserSession } from "../auth/auth.client";
import { getUserSession } from "../auth/auth.server";

export const apiAuthGuard =
  (handler: (_req: NextRequest, session: TUserSession) => Promise<any>) =>
  async (req: NextRequest) => {
    const accessToken = req.headers.get("x-sk-op-authorization");
    if (!accessToken)
      throw CustomError({ statusCode: 401, message: "Unauthorized request" });

    let session;

    try {
      session = await getUserSession(accessToken);
    } catch (error) {
      throw CustomError({ statusCode: 401, message: "Unauthorized request" });
    }

    return await handler(req, session);
  };
