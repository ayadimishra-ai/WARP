import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkinsertwebCurationDocument = gql`
    mutation bulkinsertwebCuration($webCurationInsertInput: [WebCuration_insert_input!]!) {
  insert_WebCuration(
    objects: $webCurationInsertInput
    on_conflict: {constraint: WebCurationLogs_pkey}
  ) {
    returning {
      id
      formInvitationId
    }
  }
}
    `;
export type BulkinsertwebCurationMutationFn = Apollo.MutationFunction<Types.BulkinsertwebCurationMutation, Types.BulkinsertwebCurationMutationVariables>;

/**
 * __useBulkinsertwebCurationMutation__
 *
 * To run a mutation, you first call `useBulkinsertwebCurationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkinsertwebCurationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkinsertwebCurationMutation, { data, loading, error }] = useBulkinsertwebCurationMutation({
 *   variables: {
 *      webCurationInsertInput: // value for 'webCurationInsertInput'
 *   },
 * });
 */
export function useBulkinsertwebCurationMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkinsertwebCurationMutation, Types.BulkinsertwebCurationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkinsertwebCurationMutation, Types.BulkinsertwebCurationMutationVariables>(BulkinsertwebCurationDocument, options);
      }
export type BulkinsertwebCurationMutationHookResult = ReturnType<typeof useBulkinsertwebCurationMutation>;
export type BulkinsertwebCurationMutationResult = Apollo.MutationResult<Types.BulkinsertwebCurationMutation>;
export type BulkinsertwebCurationMutationOptions = Apollo.BaseMutationOptions<Types.BulkinsertwebCurationMutation, Types.BulkinsertwebCurationMutationVariables>;