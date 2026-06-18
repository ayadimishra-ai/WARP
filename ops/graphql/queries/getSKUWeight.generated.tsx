import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSkuWeightQueryVariables = Types.Exact<{
  orgId: Types.Scalars['uuid']['input'];
  filters: Array<Types.OrgSkuMaster_Bool_Exp> | Types.OrgSkuMaster_Bool_Exp;
}>;


export type GetSkuWeightQuery = { __typename?: 'query_root', OrgSKUMaster: Array<{ __typename?: 'OrgSKUMaster', id: any, client_master_id?: string | null, code?: string | null, weight: any, weight_uom?: string | null, OrgSkuBomMasters: Array<{ __typename?: 'OrgSkuBomMaster', id: any, org_sku_master_id: any, material_quantity: any, material_quantity_uom?: string | null }> }> };


export const GetSkuWeightDocument = gql`
    query getSKUWeight($orgId: uuid!, $filters: [OrgSKUMaster_bool_exp!]!) {
  OrgSKUMaster(where: {organization_id: {_eq: $orgId}, _or: $filters}) {
    id
    client_master_id
    code
    weight
    weight_uom
    OrgSkuBomMasters {
      id
      org_sku_master_id
      material_quantity
      material_quantity_uom
    }
  }
}
    `;

/**
 * __useGetSkuWeightQuery__
 *
 * To run a query within a React component, call `useGetSkuWeightQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSkuWeightQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSkuWeightQuery({
 *   variables: {
 *      orgId: // value for 'orgId'
 *      filters: // value for 'filters'
 *   },
 * });
 */
export function useGetSkuWeightQuery(baseOptions: Apollo.QueryHookOptions<GetSkuWeightQuery, GetSkuWeightQueryVariables> & ({ variables: GetSkuWeightQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSkuWeightQuery, GetSkuWeightQueryVariables>(GetSkuWeightDocument, options);
      }
export function useGetSkuWeightLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSkuWeightQuery, GetSkuWeightQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSkuWeightQuery, GetSkuWeightQueryVariables>(GetSkuWeightDocument, options);
        }
export function useGetSkuWeightSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSkuWeightQuery, GetSkuWeightQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSkuWeightQuery, GetSkuWeightQueryVariables>(GetSkuWeightDocument, options);
        }
export type GetSkuWeightQueryHookResult = ReturnType<typeof useGetSkuWeightQuery>;
export type GetSkuWeightLazyQueryHookResult = ReturnType<typeof useGetSkuWeightLazyQuery>;
export type GetSkuWeightSuspenseQueryHookResult = ReturnType<typeof useGetSkuWeightSuspenseQuery>;
export type GetSkuWeightQueryResult = Apollo.QueryResult<GetSkuWeightQuery, GetSkuWeightQueryVariables>;