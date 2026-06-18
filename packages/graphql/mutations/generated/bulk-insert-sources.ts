import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkInsertSourcesDocument = gql`
    mutation BulkInsertSources($data: [Sources_insert_input!]!) {
  insert_Sources(objects: $data) {
    returning {
      id
      formInvitationId
      type
      url
      sourceFilesId
      created_at
      documentLogsId
    }
  }
}
    `;
export type BulkInsertSourcesMutationFn = Apollo.MutationFunction<Types.BulkInsertSourcesMutation, Types.BulkInsertSourcesMutationVariables>;

/**
 * __useBulkInsertSourcesMutation__
 *
 * To run a mutation, you first call `useBulkInsertSourcesMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkInsertSourcesMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertSourcesMutation, { data, loading, error }] = useBulkInsertSourcesMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useBulkInsertSourcesMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkInsertSourcesMutation, Types.BulkInsertSourcesMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkInsertSourcesMutation, Types.BulkInsertSourcesMutationVariables>(BulkInsertSourcesDocument, options);
      }
export type BulkInsertSourcesMutationHookResult = ReturnType<typeof useBulkInsertSourcesMutation>;
export type BulkInsertSourcesMutationResult = Apollo.MutationResult<Types.BulkInsertSourcesMutation>;
export type BulkInsertSourcesMutationOptions = Apollo.BaseMutationOptions<Types.BulkInsertSourcesMutation, Types.BulkInsertSourcesMutationVariables>;