import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type DeleteFuelPurchasedGeneralBulkMutationVariables = Types.Exact<{
  ids: Array<Types.Scalars["uuid"]["input"]> | Types.Scalars["uuid"]["input"];
}>;

export type DeleteFuelPurchasedGeneralBulkMutation = {
  __typename?: "mutation_root";
  delete_GHGEnergyConsumption_FuelPurchased_General?: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_General_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased_General";
      id: any;
      GHGEnergyConsumption_FuelPurchased_id: any;
      GHGEnergyConsumption_FuelPurchased: {
        __typename?: "GHGEnergyConsumption_FuelPurchased";
        id: any;
        task_request_id: any;
        organization_address_id: any;
      };
    }>;
  } | null;
};

export const DeleteFuelPurchasedGeneralBulkDocument = gql`
  mutation deleteFuelPurchasedGeneralBulk($ids: [uuid!]!) {
    delete_GHGEnergyConsumption_FuelPurchased_General(
      where: { id: { _in: $ids } }
    ) {
      affected_rows
      returning {
        id
        GHGEnergyConsumption_FuelPurchased_id
        GHGEnergyConsumption_FuelPurchased {
          id
          task_request_id
          organization_address_id
        }
      }
    }
  }
`;
export type DeleteFuelPurchasedGeneralBulkMutationFn = Apollo.MutationFunction<
  DeleteFuelPurchasedGeneralBulkMutation,
  DeleteFuelPurchasedGeneralBulkMutationVariables
>;

/**
 * __useDeleteFuelPurchasedGeneralBulkMutation__
 *
 * To run a mutation, you first call `useDeleteFuelPurchasedGeneralBulkMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteFuelPurchasedGeneralBulkMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteFuelPurchasedGeneralBulkMutation, { data, loading, error }] = useDeleteFuelPurchasedGeneralBulkMutation({
 *   variables: {
 *      ids: // value for 'ids'
 *   },
 * });
 */
export function useDeleteFuelPurchasedGeneralBulkMutation(
  baseOptions?: Apollo.MutationHookOptions<
    DeleteFuelPurchasedGeneralBulkMutation,
    DeleteFuelPurchasedGeneralBulkMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    DeleteFuelPurchasedGeneralBulkMutation,
    DeleteFuelPurchasedGeneralBulkMutationVariables
  >(DeleteFuelPurchasedGeneralBulkDocument, options);
}
export type DeleteFuelPurchasedGeneralBulkMutationHookResult = ReturnType<
  typeof useDeleteFuelPurchasedGeneralBulkMutation
>;
export type DeleteFuelPurchasedGeneralBulkMutationResult =
  Apollo.MutationResult<DeleteFuelPurchasedGeneralBulkMutation>;
export type DeleteFuelPurchasedGeneralBulkMutationOptions =
  Apollo.BaseMutationOptions<
    DeleteFuelPurchasedGeneralBulkMutation,
    DeleteFuelPurchasedGeneralBulkMutationVariables
  >;
