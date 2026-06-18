import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertUseOfSoldProductsFuelMutationVariables = Types.Exact<{
  where: Types.GhgUseOfSoldProducts_Fuel_Bool_Exp;
  fuelData:
    | Array<Types.GhgUseOfSoldProducts_Fuel_Insert_Input>
    | Types.GhgUseOfSoldProducts_Fuel_Insert_Input;
  fuelUpdate:
    | Array<Types.GhgUseOfSoldProducts_Fuel_Updates>
    | Types.GhgUseOfSoldProducts_Fuel_Updates;
}>;

export type UpsertUseOfSoldProductsFuelMutation = {
  __typename?: "mutation_root";
  delete_GHGUseOfSoldProducts_Fuel?: {
    __typename?: "GHGUseOfSoldProducts_Fuel_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Fuel";
      id: any;
      task_request_id?: any | null;
      activity_task_request_id?: any | null;
      organization_address_id?: any | null;
      Date?: any | null;
      Type_of_Fuel_Consumed: string;
      Product_Code: string;
      Lifetime_of_Product?: string | null;
      Rationale?: string | null;
      Quantity_of_Fuel_Consumed?: any | null;
      UoM_of_Fuel_Consumed?: string | null;
      Additional_comments?: string | null;
      Remarks?: string | null;
      metadata?: any | null;
    }>;
  } | null;
  insert_GHGUseOfSoldProducts_Fuel?: {
    __typename?: "GHGUseOfSoldProducts_Fuel_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Fuel";
      id: any;
      task_request_id?: any | null;
      activity_task_request_id?: any | null;
      organization_address_id?: any | null;
      Date?: any | null;
      Type_of_Fuel_Consumed: string;
      Product_Code: string;
      Lifetime_of_Product?: string | null;
      Rationale?: string | null;
      Quantity_of_Fuel_Consumed?: any | null;
      UoM_of_Fuel_Consumed?: string | null;
      Additional_comments?: string | null;
      Remarks?: string | null;
      metadata?: any | null;
    }>;
  } | null;
  update_GHGUseOfSoldProducts_Fuel_many?: Array<{
    __typename?: "GHGUseOfSoldProducts_Fuel_mutation_response";
    returning: Array<{
      __typename?: "GHGUseOfSoldProducts_Fuel";
      id: any;
      task_request_id?: any | null;
      activity_task_request_id?: any | null;
      organization_address_id?: any | null;
      Date?: any | null;
      Type_of_Fuel_Consumed: string;
      Product_Code: string;
      Lifetime_of_Product?: string | null;
      Rationale?: string | null;
      Quantity_of_Fuel_Consumed?: any | null;
      UoM_of_Fuel_Consumed?: string | null;
      Additional_comments?: string | null;
      Remarks?: string | null;
      metadata?: any | null;
    }>;
  } | null> | null;
};

export const UpsertUseOfSoldProductsFuelDocument = gql`
  mutation upsertUseOfSoldProductsFuel(
    $where: GHGUseOfSoldProducts_Fuel_bool_exp!
    $fuelData: [GHGUseOfSoldProducts_Fuel_insert_input!]!
    $fuelUpdate: [GHGUseOfSoldProducts_Fuel_updates!]!
  ) {
    delete_GHGUseOfSoldProducts_Fuel(where: $where) {
      returning {
        id
        task_request_id
        activity_task_request_id
        organization_address_id
        Date
        Type_of_Fuel_Consumed
        Product_Code
        Lifetime_of_Product
        Rationale
        Quantity_of_Fuel_Consumed
        UoM_of_Fuel_Consumed
        Additional_comments
        Remarks
        metadata
      }
    }
    insert_GHGUseOfSoldProducts_Fuel(
      objects: $fuelData
      on_conflict: { constraint: GHGUseOfSoldProducts_Fuel_pkey }
    ) {
      returning {
        id
        task_request_id
        activity_task_request_id
        organization_address_id
        Date
        Type_of_Fuel_Consumed
        Product_Code
        Lifetime_of_Product
        Rationale
        Quantity_of_Fuel_Consumed
        UoM_of_Fuel_Consumed
        Additional_comments
        Remarks
        metadata
      }
    }
    update_GHGUseOfSoldProducts_Fuel_many(updates: $fuelUpdate) {
      returning {
        id
        task_request_id
        activity_task_request_id
        organization_address_id
        Date
        Type_of_Fuel_Consumed
        Product_Code
        Lifetime_of_Product
        Rationale
        Quantity_of_Fuel_Consumed
        UoM_of_Fuel_Consumed
        Additional_comments
        Remarks
        metadata
      }
    }
  }
`;
export type UpsertUseOfSoldProductsFuelMutationFn = Apollo.MutationFunction<
  UpsertUseOfSoldProductsFuelMutation,
  UpsertUseOfSoldProductsFuelMutationVariables
>;

/**
 * __useUpsertUseOfSoldProductsFuelMutation__
 *
 * To run a mutation, you first call `useUpsertUseOfSoldProductsFuelMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertUseOfSoldProductsFuelMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertUseOfSoldProductsFuelMutation, { data, loading, error }] = useUpsertUseOfSoldProductsFuelMutation({
 *   variables: {
 *      where: // value for 'where'
 *      fuelData: // value for 'fuelData'
 *      fuelUpdate: // value for 'fuelUpdate'
 *   },
 * });
 */
export function useUpsertUseOfSoldProductsFuelMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertUseOfSoldProductsFuelMutation,
    UpsertUseOfSoldProductsFuelMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertUseOfSoldProductsFuelMutation,
    UpsertUseOfSoldProductsFuelMutationVariables
  >(UpsertUseOfSoldProductsFuelDocument, options);
}
export type UpsertUseOfSoldProductsFuelMutationHookResult = ReturnType<
  typeof useUpsertUseOfSoldProductsFuelMutation
>;
export type UpsertUseOfSoldProductsFuelMutationResult =
  Apollo.MutationResult<UpsertUseOfSoldProductsFuelMutation>;
export type UpsertUseOfSoldProductsFuelMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertUseOfSoldProductsFuelMutation,
    UpsertUseOfSoldProductsFuelMutationVariables
  >;
