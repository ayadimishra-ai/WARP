import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetBuyerSupplierRoleQueryVariables = Types.Exact<{
  organizationId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type GetBuyerSupplierRoleQuery = { __typename?: 'query_root', supplierOrgList: Array<{ __typename?: 'BuyerSupplierAddressMappings', id: any, supplierOrgid?: any | null, supplierOrgAddresId?: any | null, BuyerSupplierAddresId?: any | null, status?: string | null, metadata?: any | null, organizationBySupplierorgid?: { __typename?: 'Organization', name: string } | null }>, buyerOrgList: Array<{ __typename?: 'BuyerSupplierAddressMappings', id: any, buyerOrgid?: any | null, supplierOrgAddresId?: any | null, BuyerSupplierAddresId?: any | null, status?: string | null, metadata?: any | null, Organization?: { __typename?: 'Organization', name: string } | null }> };


export const GetBuyerSupplierRoleDocument = gql`
    query getBuyerSupplierRole($organizationId: uuid) {
  supplierOrgList: BuyerSupplierAddressMappings(
    where: {buyerOrgid: {_eq: $organizationId}}
  ) {
    id
    supplierOrgid
    supplierOrgAddresId
    BuyerSupplierAddresId
    status
    metadata
    organizationBySupplierorgid {
      name
    }
  }
  buyerOrgList: BuyerSupplierAddressMappings(
    where: {supplierOrgid: {_eq: $organizationId}}
  ) {
    id
    buyerOrgid
    supplierOrgAddresId
    BuyerSupplierAddresId
    status
    metadata
    Organization {
      name
    }
  }
}
    `;

/**
 * __useGetBuyerSupplierRoleQuery__
 *
 * To run a query within a React component, call `useGetBuyerSupplierRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetBuyerSupplierRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetBuyerSupplierRoleQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetBuyerSupplierRoleQuery(baseOptions?: Apollo.QueryHookOptions<GetBuyerSupplierRoleQuery, GetBuyerSupplierRoleQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetBuyerSupplierRoleQuery, GetBuyerSupplierRoleQueryVariables>(GetBuyerSupplierRoleDocument, options);
      }
export function useGetBuyerSupplierRoleLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetBuyerSupplierRoleQuery, GetBuyerSupplierRoleQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetBuyerSupplierRoleQuery, GetBuyerSupplierRoleQueryVariables>(GetBuyerSupplierRoleDocument, options);
        }
export function useGetBuyerSupplierRoleSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetBuyerSupplierRoleQuery, GetBuyerSupplierRoleQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetBuyerSupplierRoleQuery, GetBuyerSupplierRoleQueryVariables>(GetBuyerSupplierRoleDocument, options);
        }
export type GetBuyerSupplierRoleQueryHookResult = ReturnType<typeof useGetBuyerSupplierRoleQuery>;
export type GetBuyerSupplierRoleLazyQueryHookResult = ReturnType<typeof useGetBuyerSupplierRoleLazyQuery>;
export type GetBuyerSupplierRoleSuspenseQueryHookResult = ReturnType<typeof useGetBuyerSupplierRoleSuspenseQuery>;
export type GetBuyerSupplierRoleQueryResult = Apollo.QueryResult<GetBuyerSupplierRoleQuery, GetBuyerSupplierRoleQueryVariables>;