import { NextRequest, NextResponse } from "next/server";
import { ZodIssue } from "zod";

export const apiExceptionGuard =
  (handler: (_req: NextRequest) => Promise<any>) =>
  async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error: any) {
      const errorObj: any = {
        ...Object.getOwnPropertyNames(error).reduce(
          (data, curr) => ({ ...data, [curr]: error[curr] }),
          {}
        ),
      };

      console.error(JSON.stringify(errorObj));

      const err = {
        code: errorObj.code ?? 500,
        error: {
          message: errorObj.message ?? "Something went wrong",
          ...errorObj,
        },
      };

      const currentDate = new Date();
      const _errorContent = JSON.stringify({
        datetime: currentDate.toISOString(),
        error: err,
      });

      const errorResObj = Object.assign({}, err);

      // Custom Error
      const isCustomError = errorResObj.error["isCustomError"];
      if (isCustomError) {
        delete errorResObj.error["isCustomError"];
        delete errorResObj.error["statusCode"];
        delete errorResObj.error["code"];
        // delete errorResObj.error["data"];
      }
      delete errorResObj.error["stack"];

      // Zod Error
      const isZodError = errorResObj.error["name"] === "ZodError";
      if (isZodError) {
        const errors: ZodIssue[] = errorResObj.error["issues"];
        errorResObj.error["validationErrors"] = errors.map(
          ({ code, ...rest }) => rest
        );

        errorObj.message = "Validation failed";
        delete errorResObj.error["name"];
        delete errorResObj.error["issues"];
      }

      return NextResponse.json(errorResObj, {
        status: errorObj.statusCode ?? 500,
      });
    }
  };
