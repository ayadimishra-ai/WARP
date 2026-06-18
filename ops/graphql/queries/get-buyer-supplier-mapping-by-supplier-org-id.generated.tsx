import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetBuyerSupplierMappingBySupplierOrgIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetBuyerSupplierMappingBySupplierOrgIdQuery = { __typename?: 'query_root', BuyerSupplierMappings: Array<{ __typename?: 'BuyerSupplierMappings', id: any, buyerOrgid?: any | null, supplierOrgid?: any | null, metadata?: any | null, supplier_id?: any | null, Organization?: { __typename?: 'Organization', id: any, name: string } | null }> };


export const GetBuyerSupplierMappingBySupplierOrgIdDocument = gql`
    query GetBuyerSupplierMappingBySupplierOrgId($organizationId: uuid!) {
  BuyerSupplierMappings(where: {supplierOrgid: {_eq: $organizationId}}) {
    id
    buyerOrgid
    supplierOrgid
    metadata
    supplier_id
    Organization {
      id
      name
    }
  }
}
    `;

/**
 * __useGetBuyerSupplierMappingBySupplierOrgIdQuery__
 *
 * To run a query within a React component, call `useGetBuyerSupplierMappingBySupplierOrgIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBuyerSupplierMappingBySupplierOrgIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBuyerSupplierMappingBySupplierOrgIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetBuyerSupplierMappingBySupplierOrgIdQuery(baseOptions: Apollo.QueryHookOptions<GetBuyerSupplierMappingBySupplierOrgIdQuery, GetBuyerSupplierMappingBySupplierOrgIdQueryVariables> & ({ variables: GetBuyerSupplierMappingBySupplierOrgIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBuyerSupplierMappingBySupplierOrgIdQuery, GetBuyerSupplierMappingBySupplierOrgIdQueryVariables>(GetBuyerSupplierMappingBySupplierOrgIdDocument, options);
      }
export function useGetBuyerSupplierMappingBySupplierOrgIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBuyerSupplierMappingBySupplierOrgIdQuery, GetBuyerSupplierMappingBySupplierOrgIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBuyerSupplierMappingBySupplierOrgIdQuery, GetBuyerSupplierMappingBySupplierOrgIdQueryVariables>(GetBuyerSupplierMappingBySupplierOrgIdDocument, options);
        }
export function useGetBuyerSupplierMappingBySupplierOrgIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBuyerSupplierMappingBySupplierOrgIdQuery, GetBuyerSupplierMappingBySupplierOrgIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBuyerSupplierMappingBySupplierOrgIdQuery, GetBuyerSupplierMappingBySupplierOrgIdQueryVariables>(GetBuyerSupplierMappingBySupplierOrgIdDocument, options);
        }
export type GetBuyerSupplierMappingBySupplierOrgIdQueryHookResult = ReturnType<typeof useGetBuyerSupplierMappingBySupplierOrgIdQuery>;
export type GetBuyerSupplierMappingBySupplierOrgIdLazyQueryHookResult = ReturnType<typeof useGetBuyerSupplierMappingBySupplierOrgIdLazyQuery>;
export type GetBuyerSupplierMappingBySupplierOrgIdSuspenseQueryHookResult = ReturnType<typeof useGetBuyerSupplierMappingBySupplierOrgIdSuspenseQuery>;
export type GetBuyerSupplierMappingBySupplierOrgIdQueryResult = Apollo.QueryResult<GetBuyerSupplierMappingBySupplierOrgIdQuery, GetBuyerSupplierMappingBySupplierOrgIdQueryVariables>;