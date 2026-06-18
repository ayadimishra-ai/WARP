import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpdateFuelPurchasedParentUpdatedByMutationVariables = Types.Exact<{
  id: Types.Scalars["uuid"]["input"];
  updated_by: Types.Scalars["uuid"]["input"];
  updated_at: Types.Scalars["timestamptz"]["input"];
}>;

export type UpdateFuelPurchasedParentUpdatedByMutation = {
  __typename?: "mutation_root";
  update_GHGEnergyConsumption_FuelPurchased_by_pk?: {
    __typename?: "GHGEnergyConsumption_FuelPurchased";
    id: any;
  } | null;
};

export const UpdateFuelPurchasedParentUpdatedByDocument = gql`
  mutation updateFuelPurchasedParentUpdatedBy(
    $id: uuid!
    $updated_by: uuid!
    $updated_at: timestamptz!
  ) {
    update_GHGEnergyConsumption_FuelPurchased_by_pk(
      pk_columns: { id: $id }
      _set: { updated_by: $updated_by, updated_at: $updated_at }
    ) {
      id
    }
  }
`;
export type UpdateFuelPurchasedParentUpdatedByMutationFn =
  Apollo.MutationFunction<
    UpdateFuelPurchasedParentUpdatedByMutation,
    UpdateFuelPurchasedParentUpdatedByMutationVariables
  >;

/**
 * __useUpdateFuelPurchasedParentUpdatedByMutation__
 *
 * To run a mutation, you first call `useUpdateFuelPurchasedParentUpdatedByMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateFuelPurchasedParentUpdatedByMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateFuelPurchasedParentUpdatedByMutation, { data, loading, error }] = useUpdateFuelPurchasedParentUpdatedByMutation({
 *   variables: {
 *      id: // value for 'id'
 *      updated_by: // value for 'updated_by'
 *      updated_at: // value for 'updated_at'
 *   },
 * });
 */
export function useUpdateFuelPurchasedParentUpdatedByMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpdateFuelPurchasedParentUpdatedByMutation,
    UpdateFuelPurchasedParentUpdatedByMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpdateFuelPurchasedParentUpdatedByMutation,
    UpdateFuelPurchasedParentUpdatedByMutationVariables
  >(UpdateFuelPurchasedParentUpdatedByDocument, options);
}
export type UpdateFuelPurchasedParentUpdatedByMutationHookResult = ReturnType<
  typeof useUpdateFuelPurchasedParentUpdatedByMutation
>;
export type UpdateFuelPurchasedParentUpdatedByMutationResult =
  Apollo.MutationResult<UpdateFuelPurchasedParentUpdatedByMutation>;
export type UpdateFuelPurchasedParentUpdatedByMutationOptions =
  Apollo.BaseMutationOptions<
    UpdateFuelPurchasedParentUpdatedByMutation,
    UpdateFuelPurchasedParentUpdatedByMutationVariables
  >;
