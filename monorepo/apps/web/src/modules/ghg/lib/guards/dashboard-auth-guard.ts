// auth.guard.ts
import { NextRequest } from "next/server";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";
import { getUserSession } from "../auth/auth.server";

export const DashboardAuthGuard =
  () => (handler: (props: any) => Promise<any>) => async (req: NextRequest) => {
    //const accessToken = req?.params?.accessToken;
    const accessToken = req;
    if (!accessToken)
      throw CustomError({ statusCode: 401, message: "Unauthorized request" });

    let session;

    try {
      session = await getUserSession("accessToken");
    } catch (error) {
      throw CustomError({ statusCode: 401, message: "Unauthorized request" });
    }

    return await handler(req);
  };
