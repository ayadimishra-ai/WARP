import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const CreateAiChatUsageDocument = gql`
    mutation CreateAIChatUsage($subscriptionId: uuid!, $companyId: uuid!, $allocationId: uuid, $textualUsed: Int!, $graphicalUsed: Int!, $metadata: jsonb) {
  insert_AIChatUsage_one(
    object: {subscriptionId: $subscriptionId, companyId: $companyId, allocationId: $allocationId, textualUsed: $textualUsed, graphicalUsed: $graphicalUsed, metadata: $metadata, createdAt: "now()", updatedAt: "now()"}
  ) {
    id
    subscriptionId
    companyId
    allocationId
    textualUsed
    graphicalUsed
    metadata
    createdAt
    updatedAt
  }
}
    `;
export type CreateAiChatUsageMutationFn = Apollo.MutationFunction<Types.CreateAiChatUsageMutation, Types.CreateAiChatUsageMutationVariables>;

/**
 * __useCreateAiChatUsageMutation__
 *
 * To run a mutation, you first call `useCreateAiChatUsageMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useCreateAiChatUsageMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [createAiChatUsageMutation, { data, loading, error }] = useCreateAiChatUsageMutation({
 *   variables: {
 *      subscriptionId: // value for 'subscriptionId'
 *      companyId: // value for 'companyId'
 *      allocationId: // value for 'allocationId'
 *      textualUsed: // value for 'textualUsed'
 *      graphicalUsed: // value for 'graphicalUsed'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useCreateAiChatUsageMutation(baseOptions?: Apollo.MutationHookOptions<Types.CreateAiChatUsageMutation, Types.CreateAiChatUsageMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.CreateAiChatUsageMutation, Types.CreateAiChatUsageMutationVariables>(CreateAiChatUsageDocument, options);
      }
export type CreateAiChatUsageMutationHookResult = ReturnType<typeof useCreateAiChatUsageMutation>;
export type CreateAiChatUsageMutationResult = Apollo.MutationResult<Types.CreateAiChatUsageMutation>;
export type CreateAiChatUsageMutationOptions = Apollo.BaseMutationOptions<Types.CreateAiChatUsageMutation, Types.CreateAiChatUsageMutationVariables>;