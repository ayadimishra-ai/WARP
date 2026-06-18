import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgRefrigerantAndAcSystemsActivityMutationVariables =
  Types.Exact<{
    where: Types.GhgRefrigerantAndAcSystems_Bool_Exp;
    ghgRefrigerantAndACSystemsData:
      | Array<Types.GhgRefrigerantAndAcSystems_Insert_Input>
      | Types.GhgRefrigerantAndAcSystems_Insert_Input;
  }>;

export type UpsertGhgRefrigerantAndAcSystemsActivityMutation = {
  __typename?: "mutation_root";
  delete_GHGRefrigerantAndACSystems?: {
    __typename?: "GHGRefrigerantAndACSystems_mutation_response";
    returning: Array<{
      __typename?: "GHGRefrigerantAndACSystems";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      type_of_refrigerant_used?: string | null;
      quantity_of_refrigerant_filled?: any | null;
      uom_refrigerant_and_ac_systems?: string | null;
    }>;
  } | null;
  insert_GHGRefrigerantAndACSystems?: {
    __typename?: "GHGRefrigerantAndACSystems_mutation_response";
    returning: Array<{
      __typename?: "GHGRefrigerantAndACSystems";
      id: any;
      organization_address_id: any;
      task_request_id: any;
      activity_task_request_id: any;
      created_at: any;
      updated_at: any;
      created_by?: any | null;
      updated_by?: any | null;
      type_of_refrigerant_used?: string | null;
      quantity_of_refrigerant_filled?: any | null;
      uom_refrigerant_and_ac_systems?: string | null;
    }>;
  } | null;
};

export const UpsertGhgRefrigerantAndAcSystemsActivityDocument = gql`
  mutation upsertGHGRefrigerantAndACSystemsActivity(
    $where: GHGRefrigerantAndACSystems_bool_exp!
    $ghgRefrigerantAndACSystemsData: [GHGRefrigerantAndACSystems_insert_input!]!
  ) {
    delete_GHGRefrigerantAndACSystems(where: $where) {
      returning {
        id
        organization_address_id
        task_request_id
        activity_task_request_id
        created_at
        updated_at
        created_by
        updated_by
        type_of_refrigerant_used
        quantity_of_refrigerant_filled
        uom_refrigerant_and_ac_systems
      }
    }
    insert_GHGRefrigerantAndACSystems(
      objects: $ghgRefrigerantAndACSystemsData
      on_conflict: { constraint: GHGRefrigerantAndACSystems_pkey }
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
        type_of_refrigerant_used
        quantity_of_refrigerant_filled
        uom_refrigerant_and_ac_systems
      }
    }
  }
`;
export type UpsertGhgRefrigerantAndAcSystemsActivityMutationFn =
  Apollo.MutationFunction<
    UpsertGhgRefrigerantAndAcSystemsActivityMutation,
    UpsertGhgRefrigerantAndAcSystemsActivityMutationVariables
  >;

/**
 * __useUpsertGhgRefrigerantAndAcSystemsActivityMutation__
 *
 * To run a mutation, you first call `useUpsertGhgRefrigerantAndAcSystemsActivityMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgRefrigerantAndAcSystemsActivityMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgRefrigerantAndAcSystemsActivityMutation, { data, loading, error }] = useUpsertGhgRefrigerantAndAcSystemsActivityMutation({
 *   variables: {
 *      where: // value for 'where'
 *      ghgRefrigerantAndACSystemsData: // value for 'ghgRefrigerantAndACSystemsData'
 *   },
 * });
 */
export function useUpsertGhgRefrigerantAndAcSystemsActivityMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgRefrigerantAndAcSystemsActivityMutation,
    UpsertGhgRefrigerantAndAcSystemsActivityMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgRefrigerantAndAcSystemsActivityMutation,
    UpsertGhgRefrigerantAndAcSystemsActivityMutationVariables
  >(UpsertGhgRefrigerantAndAcSystemsActivityDocument, options);
}
export type UpsertGhgRefrigerantAndAcSystemsActivityMutationHookResult =
  ReturnType<typeof useUpsertGhgRefrigerantAndAcSystemsActivityMutation>;
export type UpsertGhgRefrigerantAndAcSystemsActivityMutationResult =
  Apollo.MutationResult<UpsertGhgRefrigerantAndAcSystemsActivityMutation>;
export type UpsertGhgRefrigerantAndAcSystemsActivityMutationOptions =
  Apollo.BaseMutationOptions<
    UpsertGhgRefrigerantAndAcSystemsActivityMutation,
    UpsertGhgRefrigerantAndAcSystemsActivityMutationVariables
  >;
