import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type UpsertGhgSludgeDisposalMutationVariables = Types.Exact<{
  where: Types.GhgSludgeDisposal_Bool_Exp;
  GHGSludgeDisposalData:
    | Array<Types.GhgSludgeDisposal_Insert_Input>
    | Types.GhgSludgeDisposal_Insert_Input;
}>;

export type UpsertGhgSludgeDisposalMutation = {
  __typename?: "mutation_root";
  delete_GHGSludgeDisposal?: {
    __typename?: "GHGSludgeDisposal_mutation_response";
    returning: Array<{
      __typename?: "GHGSludgeDisposal";
      activity_task_request_id: any;
      created_at: any;
      created_by?: any | null;
      id: any;
      organization_address_id: any;
      point_of_sludge_disposal: string;
      task_request_id: any;
      total_sludge_disposed_off: any;
      uom_sludge_disposed_off: string;
      updated_at: any;
      updated_by?: any | null;
    }>;
  } | null;
  insert_GHGSludgeDisposal?: {
    __typename?: "GHGSludgeDisposal_mutation_response";
    returning: Array<{
      __typename?: "GHGSludgeDisposal";
      total_sludge_disposed_off: any;
      point_of_sludge_disposal: string;
      uom_sludge_disposed_off: string;
      created_at: any;
      updated_at: any;
      activity_task_request_id: any;
      created_by?: any | null;
      id: any;
      organization_address_id: any;
      task_request_id: any;
      updated_by?: any | null;
    }>;
  } | null;
};

export const UpsertGhgSludgeDisposalDocument = gql`
  mutation upsertGHGSludgeDisposal(
    $where: GHGSludgeDisposal_bool_exp!
    $GHGSludgeDisposalData: [GHGSludgeDisposal_insert_input!]!
  ) {
    delete_GHGSludgeDisposal(where: $where) {
      returning {
        activity_task_request_id
        created_at
        created_by
        id
        organization_address_id
        point_of_sludge_disposal
        task_request_id
        total_sludge_disposed_off
        uom_sludge_disposed_off
        updated_at
        updated_by
      }
    }
    insert_GHGSludgeDisposal(
      objects: $GHGSludgeDisposalData
      on_conflict: { constraint: GHGSludgeDisposal_pkey }
    ) {
      returning {
        total_sludge_disposed_off
        point_of_sludge_disposal
        uom_sludge_disposed_off
        created_at
        updated_at
        activity_task_request_id
        created_by
        id
        organization_address_id
        task_request_id
        updated_by
      }
    }
  }
`;
export type UpsertGhgSludgeDisposalMutationFn = Apollo.MutationFunction<
  UpsertGhgSludgeDisposalMutation,
  UpsertGhgSludgeDisposalMutationVariables
>;

/**
 * __useUpsertGhgSludgeDisposalMutation__
 *
 * To run a mutation, you first call `useUpsertGhgSludgeDisposalMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpsertGhgSludgeDisposalMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [upsertGhgSludgeDisposalMutation, { data, loading, error }] = useUpsertGhgSludgeDisposalMutation({
 *   variables: {
 *      where: // value for 'where'
 *      GHGSludgeDisposalData: // value for 'GHGSludgeDisposalData'
 *   },
 * });
 */
export function useUpsertGhgSludgeDisposalMutation(
  baseOptions?: Apollo.MutationHookOptions<
    UpsertGhgSludgeDisposalMutation,
    UpsertGhgSludgeDisposalMutationVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useMutation<
    UpsertGhgSludgeDisposalMutation,
    UpsertGhgSludgeDisposalMutationVariables
  >(UpsertGhgSludgeDisposalDocument, options);
}
export type UpsertGhgSludgeDisposalMutationHookResult = ReturnType<
  typeof useUpsertGhgSludgeDisposalMutation
>;
export type UpsertGhgSludgeDisposalMutationResult =
  Apollo.MutationResult<UpsertGhgSludgeDisposalMutation>;
export type UpsertGhgSludgeDisposalMutationOptions = Apollo.BaseMutationOptions<
  UpsertGhgSludgeDisposalMutation,
  UpsertGhgSludgeDisposalMutationVariables
>;
