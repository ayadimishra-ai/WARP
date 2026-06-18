import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const UpdateAddressDocument = gql`
    mutation UpdateAddress($id: uuid!, $addressLine1: String!, $addressLine2: String, $addressLine3: String, $poBoxNumber: String, $city: uuid!, $country: uuid!, $state: uuid!, $zipcode: String, $phoneNo: String, $landMark: String, $isDefault: Boolean, $gstNumber: String, $companyId: uuid!, $ownershipType: String, $addresstype: jsonb!, $IsActive: Boolean, $addressLable: String) {
  update_Addresses(
    _set: {addressLine1: $addressLine1, addressLine2: $addressLine2, addressLine3: $addressLine3, poBoxNumber: $poBoxNumber, city: $city, country: $country, state: $state, zipcode: $zipcode, phoneNo: $phoneNo, landMark: $landMark, isDefault: $isDefault, gstNumber: $gstNumber, companyId: $companyId, ownershipType: $ownershipType, addressType: $addresstype, IsActive: $IsActive, addressLable: $addressLable}
    where: {id: {_eq: $id}}
  ) {
    returning {
      id
      addressLine1
      addressLine2
      addressLine3
    }
  }
}
    `;
export type UpdateAddressMutationFn = Apollo.MutationFunction<Types.UpdateAddressMutation, Types.UpdateAddressMutationVariables>;

/**
 * __useUpdateAddressMutation__
 *
 * To run a mutation, you first call `useUpdateAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useUpdateAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [updateAddressMutation, { data, loading, error }] = useUpdateAddressMutation({
 *   variables: {
 *      id: // value for 'id'
 *      addressLine1: // value for 'addressLine1'
 *      addressLine2: // value for 'addressLine2'
 *      addressLine3: // value for 'addressLine3'
 *      poBoxNumber: // value for 'poBoxNumber'
 *      city: // value for 'city'
 *      country: // value for 'country'
 *      state: // value for 'state'
 *      zipcode: // value for 'zipcode'
 *      phoneNo: // value for 'phoneNo'
 *      landMark: // value for 'landMark'
 *      isDefault: // value for 'isDefault'
 *      gstNumber: // value for 'gstNumber'
 *      companyId: // value for 'companyId'
 *      ownershipType: // value for 'ownershipType'
 *      addresstype: // value for 'addresstype'
 *      IsActive: // value for 'IsActive'
 *      addressLable: // value for 'addressLable'
 *   },
 * });
 */
export function useUpdateAddressMutation(baseOptions?: Apollo.MutationHookOptions<Types.UpdateAddressMutation, Types.UpdateAddressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.UpdateAddressMutation, Types.UpdateAddressMutationVariables>(UpdateAddressDocument, options);
      }
export type UpdateAddressMutationHookResult = ReturnType<typeof useUpdateAddressMutation>;
export type UpdateAddressMutationResult = Apollo.MutationResult<Types.UpdateAddressMutation>;
export type UpdateAddressMutationOptions = Apollo.BaseMutationOptions<Types.UpdateAddressMutation, Types.UpdateAddressMutationVariables>;