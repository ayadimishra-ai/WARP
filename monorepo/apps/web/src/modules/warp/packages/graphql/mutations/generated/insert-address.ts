import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const InsertAddressDocument = gql`
    mutation insertAddress($addressLine1: String!, $addressLine2: String, $addressLine3: String, $poBoxNumber: String, $city: uuid!, $country: uuid!, $state: uuid!, $zipcode: String, $phoneNo: String, $landMark: String, $isDefault: Boolean, $gstNumber: String, $companyId: uuid!, $ownershipType: String, $addresstype: jsonb!, $addressLable: String) {
  insert_Addresses(
    objects: {addressLine1: $addressLine1, addressLine2: $addressLine2, addressLine3: $addressLine3, poBoxNumber: $poBoxNumber, city: $city, country: $country, isDefault: $isDefault, landMark: $landMark, companyId: $companyId, state: $state, zipcode: $zipcode, phoneNo: $phoneNo, gstNumber: $gstNumber, ownershipType: $ownershipType, addressType: $addresstype, addressLable: $addressLable}
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
export type InsertAddressMutationFn = Apollo.MutationFunction<Types.InsertAddressMutation, Types.InsertAddressMutationVariables>;

/**
 * __useInsertAddressMutation__
 *
 * To run a mutation, you first call `useInsertAddressMutation` within a React component and pass it any options that fit your needs.
 * When your component renders, `useInsertAddressMutation` returns a tuple that includes:
 * - A mutate function that you can call at any time to execute the mutation
 * - An object with fields that represent the current status of the mutation's execution
 *
 * @param baseOptions options that will be passed into the mutation, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options-2;
 *
 * @example
 * const [insertAddressMutation, { data, loading, error }] = useInsertAddressMutation({
 *   variables: {
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
 *      addressLable: // value for 'addressLable'
 *   },
 * });
 */
export function useInsertAddressMutation(baseOptions?: Apollo.MutationHookOptions<Types.InsertAddressMutation, Types.InsertAddressMutationVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useMutation<Types.InsertAddressMutation, Types.InsertAddressMutationVariables>(InsertAddressDocument, options);
      }
export type InsertAddressMutationHookResult = ReturnType<typeof useInsertAddressMutation>;
export type InsertAddressMutationResult = Apollo.MutationResult<Types.InsertAddressMutation>;
export type InsertAddressMutationOptions = Apollo.BaseMutationOptions<Types.InsertAddressMutation, Types.InsertAddressMutationVariables>;