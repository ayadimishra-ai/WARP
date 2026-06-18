import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const BulkUpdateProcessingDataDocument = gql`
    mutation bulkUpdateProcessingData($AIBulkDocumentProcessingUpdate: [AIBulkDocumentProcessing_updates!]!) {
  update_AIBulkDocumentProcessing_many(updates: $AIBulkDocumentProcessingUpdate) {
    returning {
      id
    }
  }
}
    `;
export type BulkUpdateProcessingDataMutationFn = Apollo.MutationFunction<Types.BulkUpdateProcessingDataMutation, Types.BulkUpdateProcessingDataMutationVariables>;

/**
 * __useBulkUpdateProcessingDataMutation__
 *
 * To run a mutation, you first call `useBulkUpdateProcessingDataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useBulkUpdateProcessingDataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [bulkUpdateProcessingDataMutation, { data, loading, error }] = useBulkUpdateProcessingDataMutation({
 *   variables: {
 *      AIBulkDocumentProcessingUpdate: // value for 'AIBulkDocumentProcessingUpdate'
 *   },
 * });
 */
export function useBulkUpdateProcessingDataMutation(baseOptions?: Apollo.MutationHookOptions<Types.BulkUpdateProcessingDataMutation, Types.BulkUpdateProcessingDataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.BulkUpdateProcessingDataMutation, Types.BulkUpdateProcessingDataMutationVariables>(BulkUpdateProcessingDataDocument, options);
      }
export type BulkUpdateProcessingDataMutationHookResult = ReturnType<typeof useBulkUpdateProcessingDataMutation>;
export type BulkUpdateProcessingDataMutationResult = Apollo.MutationResult<Types.BulkUpdateProcessingDataMutation>;
export type BulkUpdateProcessingDataMutationOptions = Apollo.BaseMutationOptions<Types.BulkUpdateProcessingDataMutation, Types.BulkUpdateProcessingDataMutationVariables>;