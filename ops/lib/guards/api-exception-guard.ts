import { NextRequest, NextResponse } from "next/server";
import { ZodIssue } from "zod";

export const apiExceptionGuard =
  (handler: (_req: NextRequest) => Promise<any>) =>
  async (req: NextRequest) => {
    try {
      return await handler(req);
    } catch (error: any) {
      // Build a safe error object — only enumerate own properties so we capture
      // custom fields (statusCode, isCustomError, issues, etc.) but then strip
      // anything that should never leave the server.
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

      const errorResObj = Object.assign({}, err);

      // Custom Error — strip internal-only fields before responding.
      const isCustomError = errorResObj.error["isCustomError"];
      if (isCustomError) {
        delete errorResObj.error["isCustomError"];
        delete errorResObj.error["statusCode"];
        delete errorResObj.error["code"];
      }

      // Always remove fields that must never appear in API responses.
      delete errorResObj.error["stack"];
      // Remove any raw database / query details that may appear on DB errors.
      delete errorResObj.error["query"];
      delete errorResObj.error["parameters"];
      delete errorResObj.error["driverError"];
      delete errorResObj.error["detail"];
      delete errorResObj.error["hint"];
      delete errorResObj.error["internalQuery"];
      delete errorResObj.error["where"];
      delete errorResObj.error["schema"];
      delete errorResObj.error["table"];
      delete errorResObj.error["column"];
      delete errorResObj.error["dataType"];
      delete errorResObj.error["constraint"];
      delete errorResObj.error["file"];
      delete errorResObj.error["line"];
      delete errorResObj.error["routine"];

      // Zod Error — surface validation messages in a friendly shape.
      const isZodError = errorResObj.error["name"] === "ZodError";
      if (isZodError) {
        const errors: ZodIssue[] = errorResObj.error["issues"];
        errorResObj.error["validationErrors"] = errors.map(
          ({ code, ...rest }) => rest
        );

        errorResObj.error["message"] = "Validation failed";
        delete errorResObj.error["name"];
        delete errorResObj.error["issues"];
      }

      return NextResponse.json(errorResObj, {
        status: errorObj.statusCode ?? 500,
      });
    }
  };
