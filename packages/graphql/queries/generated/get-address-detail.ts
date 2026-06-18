import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetAddressDetailDocument = gql`
    query getAddressDetail($addressLine1: String, $addressLine2: String, $addressLine3: String, $poBoxNumber: String, $city: uuid, $country: uuid, $state: uuid, $zipcode: String, $phoneNo: String, $landMark: String, $isDefault: Boolean, $gstNumber: String, $companyId: uuid, $ownershipType: String, $addresstype: jsonb, $addressLable: String) {
  Addresses(
    where: {addressLine1: {_eq: $addressLine1}, addressLine2: {_eq: $addressLine2}, addressLine3: {_eq: $addressLine3}, addressType: {_eq: $addresstype}, city: {_eq: $city}, companyId: {_eq: $companyId}, country: {_eq: $country}, gstNumber: {_eq: $gstNumber}, isDefault: {_eq: $isDefault}, landMark: {_eq: $landMark}, ownershipType: {_eq: $ownershipType}, phoneNo: {_eq: $phoneNo}, poBoxNumber: {_eq: $poBoxNumber}, state: {_eq: $state}, zipcode: {_eq: $zipcode}, addressLable: {_eq: $addressLable}}
  ) {
    id
    addressLine1
    addressLine2
    addressLine3
    IsActive
  }
}
    `;

/**
 * __useGetAddressDetailQuery__
 *
 * To run a query within a React component, call `useGetAddressDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAddressDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAddressDetailQuery({
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
export function useGetAddressDetailQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetAddressDetailQuery, Types.GetAddressDetailQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetAddressDetailQuery, Types.GetAddressDetailQueryVariables>(GetAddressDetailDocument, options);
      }
export function useGetAddressDetailLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetAddressDetailQuery, Types.GetAddressDetailQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetAddressDetailQuery, Types.GetAddressDetailQueryVariables>(GetAddressDetailDocument, options);
        }
export type GetAddressDetailQueryHookResult = ReturnType<typeof useGetAddressDetailQuery>;
export type GetAddressDetailLazyQueryHookResult = ReturnType<typeof useGetAddressDetailLazyQuery>;
export type GetAddressDetailQueryResult = Apollo.QueryResult<Types.GetAddressDetailQuery, Types.GetAddressDetailQueryVariables>;