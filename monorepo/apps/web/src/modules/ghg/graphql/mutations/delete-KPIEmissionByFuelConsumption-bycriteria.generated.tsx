import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteKpiEmissionByFuelConsumptionbyconditionMutationVariables =
  Types.Exact<{
    criteria:
      | Array<Types.KpiEmissionByFuelConsumption_Bool_Exp>
      | Types.KpiEmissionByFuelConsumption_Bool_Exp;
  }>;

export type DeleteKpiEmissionByFuelConsumptionbyconditionMutation = {
  __typename?: "mutation_root";
  delete_KPIEmissionByFuelConsumption?: {
    __typename?: "KPIEmissionByFuelConsumption_mutation_response";
    affected_rows: number;
  } | null;
};

export const DeleteKpiEmissionByFuelConsumptionbyconditionDocument = gql`
  mutation DeleteKPIEmissionByFuelConsumptionbycondition(
    $criteria: [KPIEmissionByFuelConsumption_bool_exp!]!
  ) {
    delete_KPIEmissionByFuelConsumption(where: { _or: $criteria }) {
      affected_rows
    }
  }
`;
export type DeleteKpiEmissionByFuelConsumptionbyconditionMutationFn =
  Apollo.MutationFunction<
    DeleteKpiEmissionByFuelConsumptionbyconditionMutation,
    DeleteKpiEmissionByFuelConsumptionbyconditionMutationVariables
  >;

/**
 * __useDeleteKpiEmissionByFuelConsumptionbyconditionMutation__
 *
 * To run a mutation, you first call `useDeleteKpiEmissionByFuelConsumptionbyconditionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteKpiEmissionByFuelConsumptionbyconditionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteKpiEmissionByFuelConsumptionbyconditionMutation, { data, loading, error }] = useDeleteKpiEmissionByFuelConsumptionbyconditionMutation({
 *   variables: {
 *      criteria: // value for 'criteria'
 *   },
 * });
 */
export function useDeleteKpiEmissionByFuelConsumptionbyconditionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteKpiEmissionByFuelConsumptionbyconditionMutation,
    DeleteKpiEmissionByFuelConsumptionbyconditionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteKpiEmissionByFuelConsumptionbyconditionMutation,
    DeleteKpiEmissionByFuelConsumptionbyconditionMutationVariables
  >(DeleteKpiEmissionByFuelConsumptionbyconditionDocument, options);
}
export type DeleteKpiEmissionByFuelConsumptionbyconditionMutationHookResult =
  ReturnType<typeof useDeleteKpiEmissionByFuelConsumptionbyconditionMutation>;
export type DeleteKpiEmissionByFuelConsumptionbyconditionMutationResult =
  Apollo.MutationResult<DeleteKpiEmissionByFuelConsumptionbyconditionMutation>;
export type DeleteKpiEmissionByFuelConsumptionbyconditionMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteKpiEmissionByFuelConsumptionbyconditionMutation,
    DeleteKpiEmissionByFuelConsumptionbyconditionMutationVariables
  >;
