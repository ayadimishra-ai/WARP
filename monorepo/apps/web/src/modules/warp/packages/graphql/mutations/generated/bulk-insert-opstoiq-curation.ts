import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkinsertOpsToIqCurationDocument = gql`
    mutation bulkinsertOPSToIQCuration($opsToIQCurationInsertInput: [OPSToIQCuration_insert_input!]!) {
  insert_OPSToIQCuration(
    objects: $opsToIQCurationInsertInput
    on_conflict: {constraint: OPSToIQCuration_pkey}
  ) {
    returning {
      id
      formInvitationId
    }
  }
}
    `;
export type BulkinsertOpsToIqCurationMutationFn = Apollo.MutationFunction<Types.BulkinsertOpsToIqCurationMutation, Types.BulkinsertOpsToIqCurationMutationVariables>;

/**
 * __useBulkinsertOpsToIqCurationMutation__
 *
 * To run a mutation, you first call `useBulkinsertOpsToIqCurationMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkinsertOpsToIqCurationMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkinsertOpsToIqCurationMutation, { data, loading, error }] = useBulkinsertOpsToIqCurationMutation({
 *   variables: {
 *      opsToIQCurationInsertInput: // value for 'opsToIQCurationInsertInput'
 *   },
 * });
 */
export function useBulkinsertOpsToIqCurationMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkinsertOpsToIqCurationMutation, Types.BulkinsertOpsToIqCurationMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkinsertOpsToIqCurationMutation, Types.BulkinsertOpsToIqCurationMutationVariables>(BulkinsertOpsToIqCurationDocument, options);
      }
export type BulkinsertOpsToIqCurationMutationHookResult = ReturnType<typeof useBulkinsertOpsToIqCurationMutation>;
export type BulkinsertOpsToIqCurationMutationResult = Apollo.MutationResult<Types.BulkinsertOpsToIqCurationMutation>;
export type BulkinsertOpsToIqCurationMutationOptions = Apollo.BaseMutationOptions<Types.BulkinsertOpsToIqCurationMutation, Types.BulkinsertOpsToIqCurationMutationVariables>;