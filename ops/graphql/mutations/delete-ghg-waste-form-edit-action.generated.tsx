import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type DeleteGhgWasteFormEditActionMutationVariables = Types.Exact<{
  deleteId: Types.Scalars['uuid']['input'];
}>;


export type DeleteGhgWasteFormEditActionMutation = { __typename?: 'mutation_root', delete_GHGWaste?: { __typename?: 'GHGWaste_mutation_response', returning: Array<{ __typename?: 'GHGWaste', id: any, task_request_id: any }> } | null };


export const DeleteGhgWasteFormEditActionDocument = gql`
    mutation deleteGHGWasteFormEditAction($deleteId: uuid!) {
  delete_GHGWaste(where: {id: {_eq: $deleteId}}) {
    returning {
      id
      task_request_id
    }
  }
}
    `;
export type DeleteGhgWasteFormEditActionMutationFn = Apollo.MutationFunction<DeleteGhgWasteFormEditActionMutation, DeleteGhgWasteFormEditActionMutationVariables>;

/**
 * __useDeleteGhgWasteFormEditActionMutation__
 *
 * To run a mutation, you first call `useDeleteGhgWasteFormEditActionMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteGhgWasteFormEditActionMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteGhgWasteFormEditActionMutation, { data, loading, error }] = useDeleteGhgWasteFormEditActionMutation({
 *   variables: {
 *      deleteId: // value for 'deleteId'
 *   },
 * });
 */
export function useDeleteGhgWasteFormEditActionMutation(baseOptions?: Apollo.MutationHookOptions<DeleteGhgWasteFormEditActionMutation, DeleteGhgWasteFormEditActionMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<DeleteGhgWasteFormEditActionMutation, DeleteGhgWasteFormEditActionMutationVariables>(DeleteGhgWasteFormEditActionDocument, options);
      }
export type DeleteGhgWasteFormEditActionMutationHookResult = ReturnType<typeof useDeleteGhgWasteFormEditActionMutation>;
export type DeleteGhgWasteFormEditActionMutationResult = Apollo.MutationResult<DeleteGhgWasteFormEditActionMutation>;
export type DeleteGhgWasteFormEditActionMutationOptions = Apollo.BaseMutationOptions<DeleteGhgWasteFormEditActionMutation, DeleteGhgWasteFormEditActionMutationVariables>;