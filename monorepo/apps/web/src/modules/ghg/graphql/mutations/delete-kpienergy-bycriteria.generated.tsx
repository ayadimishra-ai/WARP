import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteKpiEnergybyconditionMutationVariables = Types.Exact<{
  criteria: Array<Types.KpiEnergy_Bool_Exp> | Types.KpiEnergy_Bool_Exp;
}>;

export type DeleteKpiEnergybyconditionMutation = {
  __typename?: "mutation_root";
  delete_KPIEnergy?: {
    __typename?: "KPIEnergy_mutation_response";
    affected_rows: number;
  } | null;
};

export const DeleteKpiEnergybyconditionDocument = gql`
  mutation DeleteKPIEnergybycondition($criteria: [KPIEnergy_bool_exp!]!) {
    delete_KPIEnergy(where: { _or: $criteria }) {
      affected_rows
    }
  }
`;
export type DeleteKpiEnergybyconditionMutationFn = Apollo.MutationFunction<
  DeleteKpiEnergybyconditionMutation,
  DeleteKpiEnergybyconditionMutationVariables
>;

/**
 * __useDeleteKpiEnergybyconditionMutation__
 *
 * To run a mutation, you first call `useDeleteKpiEnergybyconditionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteKpiEnergybyconditionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteKpiEnergybyconditionMutation, { data, loading, error }] = useDeleteKpiEnergybyconditionMutation({
 *   variables: {
 *      criteria: // value for 'criteria'
 *   },
 * });
 */
export function useDeleteKpiEnergybyconditionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteKpiEnergybyconditionMutation,
    DeleteKpiEnergybyconditionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteKpiEnergybyconditionMutation,
    DeleteKpiEnergybyconditionMutationVariables
  >(DeleteKpiEnergybyconditionDocument, options);
}
export type DeleteKpiEnergybyconditionMutationHookResult = ReturnType<
  typeof useDeleteKpiEnergybyconditionMutation
>;
export type DeleteKpiEnergybyconditionMutationResult =
  Apollo.MutationResult<DeleteKpiEnergybyconditionMutation>;
export type DeleteKpiEnergybyconditionMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteKpiEnergybyconditionMutation,
    DeleteKpiEnergybyconditionMutationVariables
  >;
