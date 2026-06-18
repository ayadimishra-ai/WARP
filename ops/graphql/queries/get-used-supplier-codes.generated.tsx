import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUsedSupplierCodesQueryVariables = Types.Exact<{
  capitalGoodsWhere: Types.GhgCapital_Goods_Bool_Exp;
  materialProcurementWhere: Types.GhgMaterialProcurement_Bool_Exp;
  transportUpstreamWhere: Types.GhgTransport_Upstream_Bool_Exp;
}>;


export type GetUsedSupplierCodesQuery = { __typename?: 'query_root', GHGCapital_Goods: Array<{ __typename?: 'GHGCapital_Goods', Supplier_Code?: string | null }>, GHGMaterialProcurement: Array<{ __typename?: 'GHGMaterialProcurement', Supplier_Code?: string | null }>, GHGTransport_Upstream: Array<{ __typename?: 'GHGTransport_Upstream', Supplier_Code?: string | null }> };


export const GetUsedSupplierCodesDocument = gql`
    query getUsedSupplierCodes($capitalGoodsWhere: GHGCapital_Goods_bool_exp!, $materialProcurementWhere: GHGMaterialProcurement_bool_exp!, $transportUpstreamWhere: GHGTransport_Upstream_bool_exp!) {
  GHGCapital_Goods(where: $capitalGoodsWhere, distinct_on: [Supplier_Code]) {
    Supplier_Code
  }
  GHGMaterialProcurement(
    where: $materialProcurementWhere
    distinct_on: [Supplier_Code]
  ) {
    Supplier_Code
  }
  GHGTransport_Upstream(
    where: $transportUpstreamWhere
    distinct_on: [Supplier_code]
  ) {
    Supplier_Code: Supplier_code
  }
}
    `;

/**
 * __useGetUsedSupplierCodesQuery__
 *
 * To run a query within a React component, call `useGetUsedSupplierCodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUsedSupplierCodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUsedSupplierCodesQuery({
 *   variables: {
 *      capitalGoodsWhere: // value for 'capitalGoodsWhere'
 *      materialProcurementWhere: // value for 'materialProcurementWhere'
 *      transportUpstreamWhere: // value for 'transportUpstreamWhere'
 *   },
 * });
 */
export function useGetUsedSupplierCodesQuery(baseOptions: Apollo.QueryHookOptions<GetUsedSupplierCodesQuery, GetUsedSupplierCodesQueryVariables> & ({ variables: GetUsedSupplierCodesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUsedSupplierCodesQuery, GetUsedSupplierCodesQueryVariables>(GetUsedSupplierCodesDocument, options);
      }
export function useGetUsedSupplierCodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUsedSupplierCodesQuery, GetUsedSupplierCodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUsedSupplierCodesQuery, GetUsedSupplierCodesQueryVariables>(GetUsedSupplierCodesDocument, options);
        }
export function useGetUsedSupplierCodesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUsedSupplierCodesQuery, GetUsedSupplierCodesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUsedSupplierCodesQuery, GetUsedSupplierCodesQueryVariables>(GetUsedSupplierCodesDocument, options);
        }
export type GetUsedSupplierCodesQueryHookResult = ReturnType<typeof useGetUsedSupplierCodesQuery>;
export type GetUsedSupplierCodesLazyQueryHookResult = ReturnType<typeof useGetUsedSupplierCodesLazyQuery>;
export type GetUsedSupplierCodesSuspenseQueryHookResult = ReturnType<typeof useGetUsedSupplierCodesSuspenseQuery>;
export type GetUsedSupplierCodesQueryResult = Apollo.QueryResult<GetUsedSupplierCodesQuery, GetUsedSupplierCodesQueryVariables>;