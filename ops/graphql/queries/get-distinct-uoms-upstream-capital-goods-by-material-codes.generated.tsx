import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables = Types.Exact<{
  whereUpstream: Types.GhgTransport_Upstream_Bool_Exp;
  whereCapitalGoods: Types.GhgCapital_Goods_Bool_Exp;
  whereMaterialMaster: Types.OrgMaterialMaster_Bool_Exp;
}>;


export type GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery = { __typename?: 'query_root', GHGTransport_Upstream: Array<{ __typename?: 'GHGTransport_Upstream', Material_ID?: string | null, Material_Quantity_Procured_uom?: string | null }>, GHGCapital_Goods: Array<{ __typename?: 'GHGCapital_Goods', Material_Code?: string | null, Quantity_Procured_uom?: string | null }>, OrgMaterialMaster: Array<{ __typename?: 'OrgMaterialMaster', code?: string | null, Material_Weight_Per_Unit?: any | null, UoM_Material_Weight?: string | null }> };


export const GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesDocument = gql`
    query getDistinctUOMsUpstreamCapitalGoodsByMaterialCodes($whereUpstream: GHGTransport_Upstream_bool_exp!, $whereCapitalGoods: GHGCapital_Goods_bool_exp!, $whereMaterialMaster: OrgMaterialMaster_bool_exp!) {
  GHGTransport_Upstream(
    where: $whereUpstream
    distinct_on: [Material_Quantity_Procured_uom]
  ) {
    Material_ID
    Material_Quantity_Procured_uom
  }
  GHGCapital_Goods(
    where: $whereCapitalGoods
    distinct_on: [Quantity_Procured_uom]
  ) {
    Material_Code
    Quantity_Procured_uom
  }
  OrgMaterialMaster(where: $whereMaterialMaster) {
    code
    Material_Weight_Per_Unit
    UoM_Material_Weight
  }
}
    `;

/**
 * __useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery__
 *
 * To run a query within a React component, call `useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery({
 *   variables: {
 *      whereUpstream: // value for 'whereUpstream'
 *      whereCapitalGoods: // value for 'whereCapitalGoods'
 *      whereMaterialMaster: // value for 'whereMaterialMaster'
 *   },
 * });
 */
export function useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery(baseOptions: Apollo.QueryHookOptions<GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery, GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables> & ({ variables: GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery, GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables>(GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesDocument, options);
      }
export function useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery, GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery, GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables>(GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesDocument, options);
        }
export function useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery, GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery, GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables>(GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesDocument, options);
        }
export type GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryHookResult = ReturnType<typeof useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery>;
export type GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesLazyQueryHookResult = ReturnType<typeof useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesLazyQuery>;
export type GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesSuspenseQueryHookResult = ReturnType<typeof useGetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesSuspenseQuery>;
export type GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryResult = Apollo.QueryResult<GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQuery, GetDistinctUoMsUpstreamCapitalGoodsByMaterialCodesQueryVariables>;