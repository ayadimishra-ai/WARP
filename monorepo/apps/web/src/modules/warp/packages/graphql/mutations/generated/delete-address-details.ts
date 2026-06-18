import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const DeleteAddressDetailsDocument = gql`
    mutation DeleteAddressDetails($id: uuid, $IsActive: Boolean) {
  update_Addresses(_set: {IsActive: $IsActive}, where: {id: {_eq: $id}}) {
    returning {
      id
      IsActive
    }
  }
}
    `;
export type DeleteAddressDetailsMutationFn = Apollo.MutationFunction<Types.DeleteAddressDetailsMutation, Types.DeleteAddressDetailsMutationVariables>;

/**
 * __useDeleteAddressDetailsMutation__
 *
 * To run a mutation, you first call `useDeleteAddressDetailsMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useDeleteAddressDetailsMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [deleteAddressDetailsMutation, { data, loading, error }] = useDeleteAddressDetailsMutation({
 *   variables: {
 *      id: // value for 'id'
 *      IsActive: // value for 'IsActive'
 *   },
 * });
 */
export function useDeleteAddressDetailsMutation(baseOptions?: Apollo.MutationHookOptions<Types.DeleteAddressDetailsMutation, Types.DeleteAddressDetailsMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.DeleteAddressDetailsMutation, Types.DeleteAddressDetailsMutationVariables>(DeleteAddressDetailsDocument, options);
      }
export type DeleteAddressDetailsMutationHookResult = ReturnType<typeof useDeleteAddressDetailsMutation>;
export type DeleteAddressDetailsMutationResult = Apollo.MutationResult<Types.DeleteAddressDetailsMutation>;
export type DeleteAddressDetailsMutationOptions = Apollo.BaseMutationOptions<Types.DeleteAddressDetailsMutation, Types.DeleteAddressDetailsMutationVariables>;