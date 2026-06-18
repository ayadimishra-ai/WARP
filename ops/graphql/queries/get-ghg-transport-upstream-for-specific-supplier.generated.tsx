import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgTransportUpstreamForSpecificSupplierQueryVariables = Types.Exact<{
  month?: Types.InputMaybe<Types.Scalars['String']['input']>;
  year?: Types.InputMaybe<Types.Scalars['Int']['input']>;
  addressId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
  pincode?: Types.InputMaybe<Types.Scalars['String']['input']>;
  supplierCode?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetGhgTransportUpstreamForSpecificSupplierQuery = { __typename?: 'query_root', GHGTransport_Upstream: Array<{ __typename?: 'GHGTransport_Upstream', id: any, Location_pin_or_zip_code?: string | null, Supplier_code?: string | null, Destination_Location_Pincode?: string | null, TaskRequest: { __typename?: 'TaskRequest', id: any, month: string, year?: number | null, OrganizationAddress: { __typename?: 'OrganizationAddress', address_id: any, Address: { __typename?: 'Addresses', name: string, pincode?: string | null } } } }> };


export const GetGhgTransportUpstreamForSpecificSupplierDocument = gql`
    query GetGHGTransportUpstreamForSpecificSupplier($month: String, $year: Int, $addressId: uuid, $pincode: String, $supplierCode: String) {
  GHGTransport_Upstream(
    where: {Location_pin_or_zip_code: {_eq: $pincode}, Supplier_code: {_eq: $supplierCode}, TaskRequest: {month: {_eq: $month}, year: {_eq: $year}, OrganizationAddress: {address_id: {_eq: $addressId}}}}
  ) {
    id
    Location_pin_or_zip_code
    Supplier_code
    Destination_Location_Pincode
    TaskRequest {
      id
      month
      year
      OrganizationAddress {
        address_id
        Address {
          name
          pincode
        }
      }
    }
  }
}
    `;

/**
 * __useGetGhgTransportUpstreamForSpecificSupplierQuery__
 *
 * To run a query within a React component, call `useGetGhgTransportUpstreamForSpecificSupplierQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgTransportUpstreamForSpecificSupplierQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgTransportUpstreamForSpecificSupplierQuery({
 *   variables: {
 *      month: // value for 'month'
 *      year: // value for 'year'
 *      addressId: // value for 'addressId'
 *      pincode: // value for 'pincode'
 *      supplierCode: // value for 'supplierCode'
 *   },
 * });
 */
export function useGetGhgTransportUpstreamForSpecificSupplierQuery(baseOptions?: Apollo.QueryHookOptions<GetGhgTransportUpstreamForSpecificSupplierQuery, GetGhgTransportUpstreamForSpecificSupplierQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgTransportUpstreamForSpecificSupplierQuery, GetGhgTransportUpstreamForSpecificSupplierQueryVariables>(GetGhgTransportUpstreamForSpecificSupplierDocument, options);
      }
export function useGetGhgTransportUpstreamForSpecificSupplierLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgTransportUpstreamForSpecificSupplierQuery, GetGhgTransportUpstreamForSpecificSupplierQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgTransportUpstreamForSpecificSupplierQuery, GetGhgTransportUpstreamForSpecificSupplierQueryVariables>(GetGhgTransportUpstreamForSpecificSupplierDocument, options);
        }
export function useGetGhgTransportUpstreamForSpecificSupplierSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgTransportUpstreamForSpecificSupplierQuery, GetGhgTransportUpstreamForSpecificSupplierQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgTransportUpstreamForSpecificSupplierQuery, GetGhgTransportUpstreamForSpecificSupplierQueryVariables>(GetGhgTransportUpstreamForSpecificSupplierDocument, options);
        }
export type GetGhgTransportUpstreamForSpecificSupplierQueryHookResult = ReturnType<typeof useGetGhgTransportUpstreamForSpecificSupplierQuery>;
export type GetGhgTransportUpstreamForSpecificSupplierLazyQueryHookResult = ReturnType<typeof useGetGhgTransportUpstreamForSpecificSupplierLazyQuery>;
export type GetGhgTransportUpstreamForSpecificSupplierSuspenseQueryHookResult = ReturnType<typeof useGetGhgTransportUpstreamForSpecificSupplierSuspenseQuery>;
export type GetGhgTransportUpstreamForSpecificSupplierQueryResult = Apollo.QueryResult<GetGhgTransportUpstreamForSpecificSupplierQuery, GetGhgTransportUpstreamForSpecificSupplierQueryVariables>;