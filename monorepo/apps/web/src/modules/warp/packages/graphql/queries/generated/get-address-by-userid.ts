import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const Getaddressesbyuser_IdDocument = gql`
    query getaddressesbyuser_id($userId: uuid!, $companyId: uuid!) {
  Addresses(where: {AddressMappings: {UserId: {_eq: $userId}}}) {
    id
    addressLine1
    addressLine2
    addressLine3
    poBoxNumber
    zipcode
    phoneNo
    landMark
    isDefault
    region
    gstNumber
    ownershipType
    IsActive
    countryName
    stateName
    cityName
    addressLable
    companyId
  }
  AddressesByCompanyId: Addresses(where: {companyId: {_eq: $companyId}}) {
    id
    addressLine1
    addressLine2
    addressLine3
    poBoxNumber
    zipcode
    phoneNo
    landMark
    isDefault
    region
    gstNumber
    ownershipType
    IsActive
    countryName
    stateName
    cityName
    addressLable
    companyId
  }
}
    `;

/**
 * __useGetaddressesbyuser_IdQuery__
 *
 * To run a query within a React component, call `useGetaddressesbyuser_IdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetaddressesbyuser_IdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetaddressesbyuser_IdQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      companyId: // value for 'companyId'
 *   },
 * });
 */
export function useGetaddressesbyuser_IdQuery(baseOptions: Apollo.QueryHookOptions<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables> & ({ variables: Types.Getaddressesbyuser_IdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>(Getaddressesbyuser_IdDocument, options);
      }
export function useGetaddressesbyuser_IdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>(Getaddressesbyuser_IdDocument, options);
        }
// @ts-ignore
export function useGetaddressesbyuser_IdSuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>;
export function useGetaddressesbyuser_IdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>): Apollo.UseSuspenseQueryResult<Types.Getaddressesbyuser_IdQuery | undefined, Types.Getaddressesbyuser_IdQueryVariables>;
export function useGetaddressesbyuser_IdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>(Getaddressesbyuser_IdDocument, options);
        }
export type Getaddressesbyuser_IdQueryHookResult = ReturnType<typeof useGetaddressesbyuser_IdQuery>;
export type Getaddressesbyuser_IdLazyQueryHookResult = ReturnType<typeof useGetaddressesbyuser_IdLazyQuery>;
export type Getaddressesbyuser_IdSuspenseQueryHookResult = ReturnType<typeof useGetaddressesbyuser_IdSuspenseQuery>;
export type Getaddressesbyuser_IdQueryResult = Apollo.QueryResult<Types.Getaddressesbyuser_IdQuery, Types.Getaddressesbyuser_IdQueryVariables>;