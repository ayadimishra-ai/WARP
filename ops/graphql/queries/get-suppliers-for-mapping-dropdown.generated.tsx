import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSuppliersForMappingDropdownQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetSuppliersForMappingDropdownQuery = { __typename?: 'query_root', SupplierAddressMapping: Array<{ __typename?: 'SupplierAddressMapping', id: any, OrgSupplierMaster: { __typename?: 'OrgSupplierMaster', id: any, name: string, code?: string | null }, Address: { __typename?: 'Addresses', code?: string | null } }> };


export const GetSuppliersForMappingDropdownDocument = gql`
    query getSuppliersForMappingDropdown($organizationId: uuid!) {
  SupplierAddressMapping(
    where: {OrgSupplierMaster: {organization_id: {_eq: $organizationId}}}
    order_by: {OrgSupplierMaster: {name: asc}}
  ) {
    id
    OrgSupplierMaster {
      id
      name
      code
    }
    Address {
      code
    }
  }
}
    `;

/**
 * __useGetSuppliersForMappingDropdownQuery__
 *
 * To run a query within a React component, call `useGetSuppliersForMappingDropdownQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSuppliersForMappingDropdownQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSuppliersForMappingDropdownQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetSuppliersForMappingDropdownQuery(baseOptions: Apollo.QueryHookOptions<GetSuppliersForMappingDropdownQuery, GetSuppliersForMappingDropdownQueryVariables> & ({ variables: GetSuppliersForMappingDropdownQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSuppliersForMappingDropdownQuery, GetSuppliersForMappingDropdownQueryVariables>(GetSuppliersForMappingDropdownDocument, options);
      }
export function useGetSuppliersForMappingDropdownLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSuppliersForMappingDropdownQuery, GetSuppliersForMappingDropdownQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSuppliersForMappingDropdownQuery, GetSuppliersForMappingDropdownQueryVariables>(GetSuppliersForMappingDropdownDocument, options);
        }
export function useGetSuppliersForMappingDropdownSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSuppliersForMappingDropdownQuery, GetSuppliersForMappingDropdownQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSuppliersForMappingDropdownQuery, GetSuppliersForMappingDropdownQueryVariables>(GetSuppliersForMappingDropdownDocument, options);
        }
export type GetSuppliersForMappingDropdownQueryHookResult = ReturnType<typeof useGetSuppliersForMappingDropdownQuery>;
export type GetSuppliersForMappingDropdownLazyQueryHookResult = ReturnType<typeof useGetSuppliersForMappingDropdownLazyQuery>;
export type GetSuppliersForMappingDropdownSuspenseQueryHookResult = ReturnType<typeof useGetSuppliersForMappingDropdownSuspenseQuery>;
export type GetSuppliersForMappingDropdownQueryResult = Apollo.QueryResult<GetSuppliersForMappingDropdownQuery, GetSuppliersForMappingDropdownQueryVariables>;