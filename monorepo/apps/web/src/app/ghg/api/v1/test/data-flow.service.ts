import { z } from "zod";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";

type Prettify<T> = {
  [K in keyof T]: T[K];
} & {};

export const InputSchema = z.object({
  organization_id: z.string().uuid(),
  period_from: z.object({
    year: z.number(),
    month: z.number(),
  }),
  period_to: z.object({
    year: z.number(),
    month: z.number(),
  }),
  data_keys: z
    .enum([
      "HR_EMPLOYEE_TURNOVER",
      "GRIEVANCES",
      "GOVERNANCE_BOARD_COPMPOSITION",
      "HEALTH_AND_SAFETY",
    ])
    .array(),
});

export type TInput = z.infer<typeof InputSchema>;
export type TResult = {
  [key in TInput["data_keys"][number]]: any[]; // Array of {year: number, month: number, rest of the columns which are required for calculation....}
};

export const getDataFlowResult = async (input: TInput) => {
  const validation_result = await InputSchema.safeParseAsync(input);
  if (!validation_result.success) {
    return {
      success: false,
      data: null,
      error: {
        validation: validation_result.error.format(),
      },
    };
  }

  const sdk: any = await getGraphQlServerSDK();

  const { organization_id } = input;

  const result: Prettify<TResult> = {
    GOVERNANCE_BOARD_COPMPOSITION: [],
    GRIEVANCES: [],
    HEALTH_AND_SAFETY: [],
    HR_EMPLOYEE_TURNOVER: [],
  };

  input.data_keys.forEach(async (data_key) => {
    try {
      let data: any[] = [];
      if (!result[data_key] || result[data_key].length < 1) {
        switch (data_key) {
          case "GRIEVANCES":
            data = await sdk.POC_getGreviancesData({ organization_id });
            break;
          case "GOVERNANCE_BOARD_COPMPOSITION":
            data = await sdk.POC_getGreviancesData({ organization_id });
            break;
          case "HEALTH_AND_SAFETY":
            data = await sdk.POC_getGreviancesData({
              organization_id,
            });
            break;
          case "HR_EMPLOYEE_TURNOVER":
            data = await sdk.POC_getGreviancesData({
              organization_id,
            });
            break;
          default:
            break;
        }
        result[data_key] = data || [];
      }
    } catch (error) {
      console.log("DATA_FLOW_SERVICE -> getDataFlowResult", { error });
    }
  });

  return { success: true, data: result, error: null };
};
