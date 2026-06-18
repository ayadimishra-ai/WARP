import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkDeleteSourceFilesFromIdDocument = gql`
    mutation bulkDeleteSourceFilesFromId($id: [uuid!]!) {
  delete_Sources(where: {sourceFilesId: {_in: $id}}) {
    returning {
      id
    }
  }
  delete_SourceFiles(where: {id: {_in: $id}}) {
    returning {
      id
    }
  }
}
    `;
export type BulkDeleteSourceFilesFromIdMutationFn = Apollo.MutationFunction<Types.BulkDeleteSourceFilesFromIdMutation, Types.BulkDeleteSourceFilesFromIdMutationVariables>;

/**
 * __useBulkDeleteSourceFilesFromIdMutation__
 *
 * To run a mutation, you first call `useBulkDeleteSourceFilesFromIdMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkDeleteSourceFilesFromIdMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkDeleteSourceFilesFromIdMutation, { data, loading, error }] = useBulkDeleteSourceFilesFromIdMutation({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useBulkDeleteSourceFilesFromIdMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkDeleteSourceFilesFromIdMutation, Types.BulkDeleteSourceFilesFromIdMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkDeleteSourceFilesFromIdMutation, Types.BulkDeleteSourceFilesFromIdMutationVariables>(BulkDeleteSourceFilesFromIdDocument, options);
      }
export type BulkDeleteSourceFilesFromIdMutationHookResult = ReturnType<typeof useBulkDeleteSourceFilesFromIdMutation>;
export type BulkDeleteSourceFilesFromIdMutationResult = Apollo.MutationResult<Types.BulkDeleteSourceFilesFromIdMutation>;
export type BulkDeleteSourceFilesFromIdMutationOptions = Apollo.BaseMutationOptions<Types.BulkDeleteSourceFilesFromIdMutation, Types.BulkDeleteSourceFilesFromIdMutationVariables>;