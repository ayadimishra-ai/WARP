import { netZeroTargetSchema } from "@/modules/ghg/components/net-zero-target-setting/validation";
import { INetZeroTargetYearInput } from "./net-zero-target-year.interface";

export const validateNetZeroTargetFormInput = (
  payload: INetZeroTargetYearInput
) => {
  const result = netZeroTargetSchema.safeParse(payload);

  const errors = result.error?.flatten()?.fieldErrors;

  if (result.success) {
    return {
      success: true,
      errors: null,
    };
  } else {
    return {
      success: false,
      errors: errors,
    };
  }
};
