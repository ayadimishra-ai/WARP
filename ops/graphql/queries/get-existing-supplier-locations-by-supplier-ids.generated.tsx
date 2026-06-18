import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetExistingSupplierLocationsBySupplierIdsQueryVariables = Types.Exact<{
  supplierMasterIds: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetExistingSupplierLocationsBySupplierIdsQuery = { __typename?: 'query_root', SupplierAddressMapping: Array<{ __typename?: 'SupplierAddressMapping', id: any, org_supplier_master_id: any, address_id: any, Address: { __typename?: 'Addresses', id: any, name: string, code?: string | null } }> };


export const GetExistingSupplierLocationsBySupplierIdsDocument = gql`
    query getExistingSupplierLocationsBySupplierIds($supplierMasterIds: [uuid!]!) {
  SupplierAddressMapping(
    where: {org_supplier_master_id: {_in: $supplierMasterIds}}
  ) {
    id
    org_supplier_master_id
    address_id
    Address {
      id
      name
      code
    }
  }
}
    `;

/**
 * __useGetExistingSupplierLocationsBySupplierIdsQuery__
 *
 * To run a query within a React component, call `useGetExistingSupplierLocationsBySupplierIdsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingSupplierLocationsBySupplierIdsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingSupplierLocationsBySupplierIdsQuery({
 *   variables: {
 *      supplierMasterIds: // value for 'supplierMasterIds'
 *   },
 * });
 */
export function useGetExistingSupplierLocationsBySupplierIdsQuery(baseOptions: Apollo.QueryHookOptions<GetExistingSupplierLocationsBySupplierIdsQuery, GetExistingSupplierLocationsBySupplierIdsQueryVariables> & ({ variables: GetExistingSupplierLocationsBySupplierIdsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetExistingSupplierLocationsBySupplierIdsQuery, GetExistingSupplierLocationsBySupplierIdsQueryVariables>(GetExistingSupplierLocationsBySupplierIdsDocument, options);
      }
export function useGetExistingSupplierLocationsBySupplierIdsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetExistingSupplierLocationsBySupplierIdsQuery, GetExistingSupplierLocationsBySupplierIdsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetExistingSupplierLocationsBySupplierIdsQuery, GetExistingSupplierLocationsBySupplierIdsQueryVariables>(GetExistingSupplierLocationsBySupplierIdsDocument, options);
        }
export function useGetExistingSupplierLocationsBySupplierIdsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetExistingSupplierLocationsBySupplierIdsQuery, GetExistingSupplierLocationsBySupplierIdsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetExistingSupplierLocationsBySupplierIdsQuery, GetExistingSupplierLocationsBySupplierIdsQueryVariables>(GetExistingSupplierLocationsBySupplierIdsDocument, options);
        }
export type GetExistingSupplierLocationsBySupplierIdsQueryHookResult = ReturnType<typeof useGetExistingSupplierLocationsBySupplierIdsQuery>;
export type GetExistingSupplierLocationsBySupplierIdsLazyQueryHookResult = ReturnType<typeof useGetExistingSupplierLocationsBySupplierIdsLazyQuery>;
export type GetExistingSupplierLocationsBySupplierIdsSuspenseQueryHookResult = ReturnType<typeof useGetExistingSupplierLocationsBySupplierIdsSuspenseQuery>;
export type GetExistingSupplierLocationsBySupplierIdsQueryResult = Apollo.QueryResult<GetExistingSupplierLocationsBySupplierIdsQuery, GetExistingSupplierLocationsBySupplierIdsQueryVariables>;