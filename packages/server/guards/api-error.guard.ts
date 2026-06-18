import {
  CustomError,
  CustomErrorType,
} from "@warp/shared/utils/custom-error.util";
import { NextApiHandler } from "next";
import { uploadError } from "../services/aws-s3.service";

type ErrorResponseType = {
  statusCode: number;
  error: CustomErrorType & {
    isValidationError: boolean;
  };
};

type ApiErrorGuardType = (handler: NextApiHandler) => NextApiHandler;

const ApiErrorGuard: ApiErrorGuardType = (handler) => async (req, res) => {
  if (!handler)
    throw CustomError({
      code: 500,
      message: "Invalid error guard implementation.",
    });

  try {
    return await handler(req, res);
  } catch (error: any) {
    const errorObj: any = {
      ...Object.getOwnPropertyNames(error).reduce(
        (data, curr) => ({ ...data, [curr]: error[curr] }),
        {}
      ),
    };

    const response: ErrorResponseType = {
      statusCode: errorObj.statusCode ?? 500,
      error: {
        code: errorObj.code ?? 500,
        message: errorObj.message ?? "Something went wrong",
        ...errorObj,
        isValidationError: errorObj.name === "ValidationError",
      },
    };

    !!response.error.statusCode && delete response.error.statusCode;

    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: response,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);

    res.status(response.statusCode).json(response);
  }
};

export default ApiErrorGuard;
