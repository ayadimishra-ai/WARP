import { NextRequest } from "next/server";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";
import { getSession, ISession } from "../auth/auth-helpers";

export const apiSuperAdminAuthGuard =
  (handler: (req: NextRequest, session: ISession) => Promise<any>) =>
  async (req: NextRequest) => {
    const accessToken = req.headers.get("x-sk-op-authorization");
    if (!accessToken)
      throw CustomError({ statusCode: 401, message: "Unauthorized request" });

    let session: ISession;

    try {
      session = await getSession(accessToken);
      if (!session.isAdmin) {
        throw Error("Unauthorized request");
      }
    } catch (error) {
      throw CustomError({ statusCode: 401, message: "Unauthorized request" });
    }

    return await handler(req, session);
  };
