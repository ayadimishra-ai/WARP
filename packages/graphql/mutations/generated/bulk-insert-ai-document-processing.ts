import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const Bulk_Insert_AiBulkDocumentProcessingDocument = gql`
    mutation bulk_insert_AIBulkDocumentProcessing($data: [AIBulkDocumentProcessing_insert_input!]!) {
  insert_AIBulkDocumentProcessing(
    objects: $data
    on_conflict: {constraint: AIBulkDocumentProcessing_pkey}
  ) {
    returning {
      id
      formInvitationId
    }
  }
}
    `;
export type Bulk_Insert_AiBulkDocumentProcessingMutationFn = Apollo.MutationFunction<Types.Bulk_Insert_AiBulkDocumentProcessingMutation, Types.Bulk_Insert_AiBulkDocumentProcessingMutationVariables>;

/**
 * __useBulk_Insert_AiBulkDocumentProcessingMutation__
 *
 * To run a mutation, you first call `useBulk_Insert_AiBulkDocumentProcessingMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulk_Insert_AiBulkDocumentProcessingMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkInsertAiBulkDocumentProcessingMutation, { data, loading, error }] = useBulk_Insert_AiBulkDocumentProcessingMutation({
 *   variables: {
 *      data: // value for 'data'
 *   },
 * });
 */
export function useBulk_Insert_AiBulkDocumentProcessingMutation(baseOptions?: Apollo.MutationHookOptions<Types.Bulk_Insert_AiBulkDocumentProcessingMutation, Types.Bulk_Insert_AiBulkDocumentProcessingMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.Bulk_Insert_AiBulkDocumentProcessingMutation, Types.Bulk_Insert_AiBulkDocumentProcessingMutationVariables>(Bulk_Insert_AiBulkDocumentProcessingDocument, options);
      }
export type Bulk_Insert_AiBulkDocumentProcessingMutationHookResult = ReturnType<typeof useBulk_Insert_AiBulkDocumentProcessingMutation>;
export type Bulk_Insert_AiBulkDocumentProcessingMutationResult = Apollo.MutationResult<Types.Bulk_Insert_AiBulkDocumentProcessingMutation>;
export type Bulk_Insert_AiBulkDocumentProcessingMutationOptions = Apollo.BaseMutationOptions<Types.Bulk_Insert_AiBulkDocumentProcessingMutation, Types.Bulk_Insert_AiBulkDocumentProcessingMutationVariables>;