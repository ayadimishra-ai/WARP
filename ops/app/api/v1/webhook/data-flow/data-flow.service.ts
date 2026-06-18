import { z } from "zod";
import { getGraphQlServerSDK } from "~/graphql/server";

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
      "RENEWABLE_ELECTRICITY_CONSUMPTION",
      "EM_SCOPE1",
      "EM_SCOPE2",
      "EM_SCOPE3",
    ])
    .array(),
});

export type TInput = z.infer<typeof InputSchema>;
export type TResult = {
  [key in TInput["data_keys"][number]]: any[]; // Array of {year: number, month: any, rest of the columns which are required for calculation....}
};

export type TDataKey = TInput["data_keys"][number];

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

  const { organization_id, data_keys } = input;
  const sdk = await getGraphQlServerSDK();

  const result: Prettify<TResult> = {
    GOVERNANCE_BOARD_COPMPOSITION: [],
    GRIEVANCES: [],
    HEALTH_AND_SAFETY: [],
    HR_EMPLOYEE_TURNOVER: [],
    RENEWABLE_ELECTRICITY_CONSUMPTION: [],
    EM_SCOPE1: [],
    EM_SCOPE2: [],
    EM_SCOPE3: [],
  };

  // Use for...of to iterate through array values instead of for...in
  for (const data_key of data_keys) {
    try {
      let data: any[] = [];
      if (!result[data_key] || result[data_key].length < 1) {
        const fromDate = `${input.period_from.year}-${input.period_from.month}-${1}`;
        const toDate = `${input.period_to.year}-${input.period_to.month}-${1}`;

        const parameters = {
          fromDate,
          toDate,
          organizationId: organization_id,
        };

        switch (data_key) {
          case "GRIEVANCES":
            {
              const data = await sdk.getESGGrievancesByPeriod(parameters);
              result[data_key] = data?.poc_view_esg_grievances || [];
            }
            break;
          case "GOVERNANCE_BOARD_COPMPOSITION":
            {
              const data = await sdk.getESGBoardCompositionByPeriod(parameters);
              result[data_key] = data?.poc_view_esg_board_omposition || [];
            }
            break;
          case "HEALTH_AND_SAFETY":
            {
              const data = await sdk.getESGHealthAndSafetyByPeriod(parameters);
              result[data_key] = data?.poc_view_esg_health_and_safety || [];
            }
            break;
          case "HR_EMPLOYEE_TURNOVER":
            {
              const data = await sdk.getESGEmployeeTurnoverByPeriod(parameters);
              result[data_key] = data?.poc_view_esg_employee_turnover || [];
            }
            break;
          case "RENEWABLE_ELECTRICITY_CONSUMPTION":
            {
              const data =
                await sdk.getESGRenewableElectricityConsumption(parameters);
              result[data_key] =
                data?.poc_view_electricity_consumption_renewable || [];
            }
            break;
          case "EM_SCOPE1":
            {
              const data = await sdk.getESGScope1Emission(parameters);
              result[data_key] = data?.poc_view_emission_by_scope || [];
            }
            break;
          case "EM_SCOPE2":
            {
              const data = await sdk.getESGScope2Emission(parameters);
              result[data_key] = data?.poc_view_emission_by_scope || [];
            }
            break;
          case "EM_SCOPE3":
            {
              const data = await sdk.getESGScope3Emission(parameters);
              result[data_key] = data?.poc_view_emission_by_scope || [];
            }
            break;
          default:
            console.log(`Unknown data key: ${data_key}`);
            break;
        }
      }
    } catch (error) {
      console.error(`Error processing ${data_key}:`, error);
    }
  }

  return { success: true, data: result, error: null };
};
