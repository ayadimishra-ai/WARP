import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpdateSourceFilesDocument = gql`
    mutation bulkUpdateSourceFiles($SourceFiles: [SourceFiles_updates!]!) {
  update_SourceFiles_many(updates: $SourceFiles) {
    returning {
      id
      status
    }
  }
}
    `;
export type BulkUpdateSourceFilesMutationFn = Apollo.MutationFunction<Types.BulkUpdateSourceFilesMutation, Types.BulkUpdateSourceFilesMutationVariables>;

/**
 * __useBulkUpdateSourceFilesMutation__
 *
 * To run a mutation, you first call `useBulkUpdateSourceFilesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpdateSourceFilesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpdateSourceFilesMutation, { data, loading, error }] = useBulkUpdateSourceFilesMutation({
 *   variables: {
 *      SourceFiles: // value for 'SourceFiles'
 *   },
 * });
 */
export function useBulkUpdateSourceFilesMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpdateSourceFilesMutation, Types.BulkUpdateSourceFilesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpdateSourceFilesMutation, Types.BulkUpdateSourceFilesMutationVariables>(BulkUpdateSourceFilesDocument, options);
      }
export type BulkUpdateSourceFilesMutationHookResult = ReturnType<typeof useBulkUpdateSourceFilesMutation>;
export type BulkUpdateSourceFilesMutationResult = Apollo.MutationResult<Types.BulkUpdateSourceFilesMutation>;
export type BulkUpdateSourceFilesMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpdateSourceFilesMutation, Types.BulkUpdateSourceFilesMutationVariables>;