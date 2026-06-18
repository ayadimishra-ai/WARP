import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateSubscriptionMetadataDocument = gql`
    mutation UpdateSubscriptionMetadata($id: uuid!, $metadata: jsonb!) {
  update_AIChatSubscription(where: {id: {_eq: $id}}, _set: {metadata: $metadata}) {
    affected_rows
    returning {
      id
      metadata
      updatedAt
    }
  }
}
    `;
export type UpdateSubscriptionMetadataMutationFn = Apollo.MutationFunction<Types.UpdateSubscriptionMetadataMutation, Types.UpdateSubscriptionMetadataMutationVariables>;

/**
 * __useUpdateSubscriptionMetadataMutation__
 *
 * To run a mutation, you first call `useUpdateSubscriptionMetadataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateSubscriptionMetadataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateSubscriptionMetadataMutation, { data, loading, error }] = useUpdateSubscriptionMetadataMutation({
 *   variables: {
 *      id: // value for 'id'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useUpdateSubscriptionMetadataMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateSubscriptionMetadataMutation, Types.UpdateSubscriptionMetadataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateSubscriptionMetadataMutation, Types.UpdateSubscriptionMetadataMutationVariables>(UpdateSubscriptionMetadataDocument, options);
      }
export type UpdateSubscriptionMetadataMutationHookResult = ReturnType<typeof useUpdateSubscriptionMetadataMutation>;
export type UpdateSubscriptionMetadataMutationResult = Apollo.MutationResult<Types.UpdateSubscriptionMetadataMutation>;
export type UpdateSubscriptionMetadataMutationOptions = Apollo.BaseMutationOptions<Types.UpdateSubscriptionMetadataMutation, Types.UpdateSubscriptionMetadataMutationVariables>;