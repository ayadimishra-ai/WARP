import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSupplierAddressMappingQueryVariables = Types.Exact<{
  id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetSupplierAddressMappingQuery = { __typename?: 'query_root', SupplierAddressMapping: Array<{ __typename?: 'SupplierAddressMapping', id: any, org_supplier_master_id: any, address_id: any, OrgSupplierMaster: { __typename?: 'OrgSupplierMaster', id: any, client_master_id?: string | null }, Address: { __typename?: 'Addresses', pincode?: string | null, client_master_id?: string | null, code?: string | null } }> };


export const GetSupplierAddressMappingDocument = gql`
    query GetSupplierAddressMapping($id: [uuid!]!) {
  SupplierAddressMapping(where: {id: {_in: $id}}) {
    id
    org_supplier_master_id
    OrgSupplierMaster {
      id
      client_master_id
    }
    address_id
    Address {
      pincode
      client_master_id
      code
    }
  }
}
    `;

/**
 * __useGetSupplierAddressMappingQuery__
 *
 * To run a query within a React component, call `useGetSupplierAddressMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierAddressMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierAddressMappingQuery({
 *   variables: {
 *      id: // value for 'id'
 *   },
 * });
 */
export function useGetSupplierAddressMappingQuery(baseOptions: Apollo.QueryHookOptions<GetSupplierAddressMappingQuery, GetSupplierAddressMappingQueryVariables> & ({ variables: GetSupplierAddressMappingQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSupplierAddressMappingQuery, GetSupplierAddressMappingQueryVariables>(GetSupplierAddressMappingDocument, options);
      }
export function useGetSupplierAddressMappingLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSupplierAddressMappingQuery, GetSupplierAddressMappingQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSupplierAddressMappingQuery, GetSupplierAddressMappingQueryVariables>(GetSupplierAddressMappingDocument, options);
        }
export function useGetSupplierAddressMappingSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSupplierAddressMappingQuery, GetSupplierAddressMappingQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSupplierAddressMappingQuery, GetSupplierAddressMappingQueryVariables>(GetSupplierAddressMappingDocument, options);
        }
export type GetSupplierAddressMappingQueryHookResult = ReturnType<typeof useGetSupplierAddressMappingQuery>;
export type GetSupplierAddressMappingLazyQueryHookResult = ReturnType<typeof useGetSupplierAddressMappingLazyQuery>;
export type GetSupplierAddressMappingSuspenseQueryHookResult = ReturnType<typeof useGetSupplierAddressMappingSuspenseQuery>;
export type GetSupplierAddressMappingQueryResult = Apollo.QueryResult<GetSupplierAddressMappingQuery, GetSupplierAddressMappingQueryVariables>;