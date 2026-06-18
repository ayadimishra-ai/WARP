export type CustomErrorType = {
  statusCode?: number;
  code?: number;
  message: string;
  data: any;
  isCustomError?: boolean;
};

type CustomErrorParamsType = {
  statusCode?: number;
  code?: number;
  message?: string;
  data?: any;
  error?: any;
};

export function CustomError(params: CustomErrorParamsType): CustomErrorType {
  let { error, data, message, statusCode, code } = params;

  const errorObj: any = {
    ...Object.getOwnPropertyNames(error ?? {}).reduce(
      (data, curr) => ({ ...data, [curr]: error[curr] }),
      {}
    ),
  };

  if (!data) data = null;
  if (!message) message = "Something went wrong.";

  if (statusCode && !code) code = statusCode;

  return {
    isCustomError: true,
    ...errorObj,
    statusCode,
    code,
    message,
    data,
  } as CustomErrorType;
}
