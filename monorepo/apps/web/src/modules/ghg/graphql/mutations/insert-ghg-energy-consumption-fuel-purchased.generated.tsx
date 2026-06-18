import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type InsertGhgEnergyConsumptionFuelPurchasedMutationVariables =
  Types.Exact<{
    insertData:
      | Array<Types.GhgEnergyConsumption_FuelPurchased_Insert_Input>
      | Types.GhgEnergyConsumption_FuelPurchased_Insert_Input;
  }>;

export type InsertGhgEnergyConsumptionFuelPurchasedMutation = {
  __typename?: "mutation_root";
  insert_GHGEnergyConsumption_FuelPurchased?: {
    __typename?: "GHGEnergyConsumption_FuelPurchased_mutation_response";
    affected_rows: number;
    returning: Array<{
      __typename?: "GHGEnergyConsumption_FuelPurchased";
      id: any;
      task_request_id: any;
      organization_address_id: any;
      activity_task_request_id: any;
    }>;
  } | null;
};

export const InsertGhgEnergyConsumptionFuelPurchasedDocument = gql`
  mutation insertGHGEnergyConsumptionFuelPurchased(
    $insertData: [GHGEnergyConsumption_FuelPurchased_insert_input!]!
  ) {
    insert_GHGEnergyConsumption_FuelPurchased(
      objects: $insertData
      on_conflict: { constraint: GHGEnergyConsumption_FuelPurchased_pkey }
    ) {
      affected_rows
      returning {
        id
        task_request_id
        organization_address_id
        activity_task_request_id
      }
    }
  }
`;
export type InsertGhgEnergyConsumptionFuelPurchasedMutationFn =
  Apollo.MutationFunction<
    InsertGhgEnergyConsumptionFuelPurchasedMutation,
    InsertGhgEnergyConsumptionFuelPurchasedMutationVariables
  >;

/**
 * __useInsertGhgEnergyConsumptionFuelPurchasedMutation__
 *
 * To run a mutation, you first call `useInsertGhgEnergyConsumptionFuelPurchasedMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertGhgEnergyConsumptionFuelPurchasedMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertGhgEnergyConsumptionFuelPurchasedMutation, { data, loading, error }] = useInsertGhgEnergyConsumptionFuelPurchasedMutation({
 *   variables: {
 *      insertData: // value for 'insertData'
 *   },
 * });
 */
export function useInsertGhgEnergyConsumptionFuelPurchasedMutation(
  baseOptions?: Apollo.MutationHookOptions<
    InsertGhgEnergyConsumptionFuelPurchasedMutation,
    InsertGhgEnergyConsumptionFuelPurchasedMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    InsertGhgEnergyConsumptionFuelPurchasedMutation,
    InsertGhgEnergyConsumptionFuelPurchasedMutationVariables
  >(InsertGhgEnergyConsumptionFuelPurchasedDocument, options);
}
export type InsertGhgEnergyConsumptionFuelPurchasedMutationHookResult =
  ReturnType<typeof useInsertGhgEnergyConsumptionFuelPurchasedMutation>;
export type InsertGhgEnergyConsumptionFuelPurchasedMutationResult =
  Apollo.MutationResult<InsertGhgEnergyConsumptionFuelPurchasedMutation>;
export type InsertGhgEnergyConsumptionFuelPurchasedMutationOptions =
  Apollo.BaseMutationOptions<
    InsertGhgEnergyConsumptionFuelPurchasedMutation,
    InsertGhgEnergyConsumptionFuelPurchasedMutationVariables
  >;
