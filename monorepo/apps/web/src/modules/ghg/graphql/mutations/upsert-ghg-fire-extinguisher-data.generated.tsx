import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgFireExtinguisherActivityMutationVariables = Types.Exact<{
  where: Types.GhgFireExtinguisher_Bool_Exp;
  ghgFireExtinguisherData:
    | Array<Types.GhgFireExtinguisher_Insert_Input>
    | Types.GhgFireExtinguisher_Insert_Input;
}>;

export type UpsertGhgFireExtinguisherActivityMutation = {
  __typename?: "mutation_root";
  delete_GHGFireExtinguisher?: {
    __typename?: "GHGFireExtinguisher_mutation_response";
    returning: Array<{
      __typename?: "GHGFireExtinguisher";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      gas_used_in_fire_extinguisher?: string | null;
      quantity_of_gas_filled?: any | null;
      uom_fire_extinguisher?: string | null;
    }>;
  } | null;
  insert_GHGFireExtinguisher?: {
    __typename?: "GHGFireExtinguisher_mutation_response";
    returning: Array<{
      __typename?: "GHGFireExtinguisher";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      gas_used_in_fire_extinguisher?: string | null;
      quantity_of_gas_filled?: any | null;
      uom_fire_extinguisher?: string | null;
    }>;
  } | null;
};

export const UpsertGhgFireExtinguisherActivityDocument = gql`
  mutation upsertGHGFireExtinguisherActivity(
    $where: GHGFireExtinguisher_bool_exp!
    $ghgFireExtinguisherData: [GHGFireExtinguisher_insert_input!]!
  ) {
    delete_GHGFireExtinguisher(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        created_at
        updated_at
        created_by
        updated_by
        gas_used_in_fire_extinguisher
        quantity_of_gas_filled
        uom_fire_extinguisher
      }
    }
    insert_GHGFireExtinguisher(
      objects: $ghgFireExtinguisherData
      on_conflict: { constraint: GHGFireExtinguisher_pkey }
    ) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        created_at
        updated_at
        created_by
        updated_by
        gas_used_in_fire_extinguisher
        quantity_of_gas_filled
        uom_fire_extinguisher
      }
    }
  }
`;
export type UpsertGhgFireExtinguisherActivityMutationFn =
  Apollo.MutationFunction<
    UpsertGhgFireExtinguisherActivityMutation,
    UpsertGhgFireExtinguisherActivityMutationVariables
  >;

/**
 * __useUpsertGhgFireExtinguisherActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgFireExtinguisherActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgFireExtinguisherActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgFireExtinguisherActivityMutation, { data, loading, error }] = useUpsertGhgFireExtinguisherActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgFireExtinguisherData: // value for 'ghgFireExtinguisherData'
 *   },
 * });
 */
export function useUpsertGhgFireExtinguisherActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgFireExtinguisherActivityMutation,
    UpsertGhgFireExtinguisherActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgFireExtinguisherActivityMutation,
    UpsertGhgFireExtinguisherActivityMutationVariables
  >(UpsertGhgFireExtinguisherActivityDocument, options);
}
export type UpsertGhgFireExtinguisherActivityMutationHookResult = ReturnType<
  typeof useUpsertGhgFireExtinguisherActivityMutation
>;
export type UpsertGhgFireExtinguisherActivityMutationResult =
  Apollo.MutationResult<UpsertGhgFireExtinguisherActivityMutation>;
export type UpsertGhgFireExtinguisherActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgFireExtinguisherActivityMutation,
    UpsertGhgFireExtinguisherActivityMutationVariables
  >;
