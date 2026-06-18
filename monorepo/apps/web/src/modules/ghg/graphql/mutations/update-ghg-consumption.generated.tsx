import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateGhgEnergyConsumptionMutationVariables = Types.Exact<{
  where: Types.GhgEnergyConsumption_GridPower_Bool_Exp;
  set: Types.GhgEnergyConsumption_GridPower_Set_Input;
}>;

export type UpdateGhgEnergyConsumptionMutation = {
  __typename?: "mutation_root";
  update_GHGEnergyConsumption_GridPower?: {
    __typename?: "GHGEnergyConsumption_GridPower_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergyConsumption_GridPower";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      metadata?: any | null;
      supporting_docs?: any | null;
      updated_at: any;
      updated_by?: any | null;
      created_at: any;
      created_by?: any | null;
    }>;
  } | null;
};

export const UpdateGhgEnergyConsumptionDocument = gql`
  mutation UpdateGHGEnergyConsumption(
    $where: GHGEnergyConsumption_GridPower_bool_exp!
    $set: GHGEnergyConsumption_GridPower_set_input!
  ) {
    update_GHGEnergyConsumption_GridPower(where: $where, _set: $set) {
      affected_rows
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        metadata
        supporting_docs
        updated_at
        updated_by
        created_at
        created_by
      }
    }
  }
`;
export type UpdateGhgEnergyConsumptionMutationFn = Apollo.MutationFunction<
  UpdateGhgEnergyConsumptionMutation,
  UpdateGhgEnergyConsumptionMutationVariables
>;

/**
 * __useUpdateGhgEnergyConsumptionMutation__
 *
 * To run a mutation, you first call `useUpdateGhgEnergyConsumptionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateGhgEnergyConsumptionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateGhgEnergyConsumptionMutation, { data, loading, error }] = useUpdateGhgEnergyConsumptionMutation({
 *   variables: {
 *      where: // value for 'where'
 *      set: // value for 'set'
 *   },
 * });
 */
export function useUpdateGhgEnergyConsumptionMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateGhgEnergyConsumptionMutation,
    UpdateGhgEnergyConsumptionMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateGhgEnergyConsumptionMutation,
    UpdateGhgEnergyConsumptionMutationVariables
  >(UpdateGhgEnergyConsumptionDocument, options);
}
export type UpdateGhgEnergyConsumptionMutationHookResult = ReturnType<
  typeof useUpdateGhgEnergyConsumptionMutation
>;
export type UpdateGhgEnergyConsumptionMutationResult =
  Apollo.MutationResult<UpdateGhgEnergyConsumptionMutation>;
export type UpdateGhgEnergyConsumptionMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateGhgEnergyConsumptionMutation,
    UpdateGhgEnergyConsumptionMutationVariables
  >;
