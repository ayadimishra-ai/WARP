import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateUserAllocationMetadataDocument = gql`
    mutation UpdateUserAllocationMetadata($id: uuid!, $metadata: jsonb!) {
  update_AIChatUserAllocation(
    where: {id: {_eq: $id}}
    _set: {metadata: $metadata}
  ) {
    affected_rows
    returning {
      id
      metadata
      updatedAt
    }
  }
}
    `;
export type UpdateUserAllocationMetadataMutationFn = Apollo.MutationFunction<Types.UpdateUserAllocationMetadataMutation, Types.UpdateUserAllocationMetadataMutationVariables>;

/**
 * __useUpdateUserAllocationMetadataMutation__
 *
 * To run a mutation, you first call `useUpdateUserAllocationMetadataMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateUserAllocationMetadataMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateUserAllocationMetadataMutation, { data, loading, error }] = useUpdateUserAllocationMetadataMutation({
 *   variables: {
 *      id: // value for 'id'
 *      metadata: // value for 'metadata'
 *   },
 * });
 */
export function useUpdateUserAllocationMetadataMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateUserAllocationMetadataMutation, Types.UpdateUserAllocationMetadataMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateUserAllocationMetadataMutation, Types.UpdateUserAllocationMetadataMutationVariables>(UpdateUserAllocationMetadataDocument, options);
      }
export type UpdateUserAllocationMetadataMutationHookResult = ReturnType<typeof useUpdateUserAllocationMetadataMutation>;
export type UpdateUserAllocationMetadataMutationResult = Apollo.MutationResult<Types.UpdateUserAllocationMetadataMutation>;
export type UpdateUserAllocationMetadataMutationOptions = Apollo.BaseMutationOptions<Types.UpdateUserAllocationMetadataMutation, Types.UpdateUserAllocationMetadataMutationVariables>;