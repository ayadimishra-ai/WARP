import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateAiChatUsageDocument = gql`
    mutation UpdateAIChatUsage($id: uuid!, $textualUsed: Int!, $graphicalUsed: Int!, $metadata: jsonb) {
  update_AIChatUsage_by_pk(
    pk_columns: {id: $id}
    _set: {textualUsed: $textualUsed, graphicalUsed: $graphicalUsed, metadata: $metadata, updatedAt: "now()"}
  ) {
    id
    subscriptionId
    companyId
    allocationId
    textualUsed
    graphicalUsed
    metadata
    updatedAt
  }
}
    `;
export type UpdateAiChatUsageMutationFn = Apollo.MutationFunction<Types.UpdateAiChatUsageMutation, Types.UpdateAiChatUsageMutationVariables>;

/**
 * __useUpdateAiChatUsageMutation__
 *
 * To run a mutation, you first call `useUpdateAiChatUsageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAiChatUsageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAiChatUsageMutation, { data, loading, error }] = useUpdateAiChatUsageMutation({
 *   variables: {
 *      id: // value for 'id'
 *      textualUsed: // value for 'textualUsed'
 *      graphicalUsed: // value for 'graphicalUsed'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useUpdateAiChatUsageMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateAiChatUsageMutation, Types.UpdateAiChatUsageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateAiChatUsageMutation, Types.UpdateAiChatUsageMutationVariables>(UpdateAiChatUsageDocument, options);
      }
export type UpdateAiChatUsageMutationHookResult = ReturnType<typeof useUpdateAiChatUsageMutation>;
export type UpdateAiChatUsageMutationResult = Apollo.MutationResult<Types.UpdateAiChatUsageMutation>;
export type UpdateAiChatUsageMutationOptions = Apollo.BaseMutationOptions<Types.UpdateAiChatUsageMutation, Types.UpdateAiChatUsageMutationVariables>;