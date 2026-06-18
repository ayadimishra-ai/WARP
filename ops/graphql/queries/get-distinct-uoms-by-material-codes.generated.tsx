import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetDistinctUoMsByMaterialCodesQueryVariables = Types.Exact<{
  materialCodes: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetDistinctUoMsByMaterialCodesQuery = { __typename?: 'query_root', GHGTransport_Upstream: Array<{ __typename?: 'GHGTransport_Upstream', Material_ID?: string | null, Material_Quantity_Procured_uom?: string | null }> };


export const GetDistinctUoMsByMaterialCodesDocument = gql`
    query getDistinctUOMsByMaterialCodes($materialCodes: [String!]!, $organizationId: uuid!) {
  GHGTransport_Upstream(
    where: {Material_ID: {_in: $materialCodes}, Material_Quantity_Procured_uom: {_is_null: false}, OrganizationAddress: {organization_id: {_eq: $organizationId}}}
    distinct_on: [Material_Quantity_Procured_uom]
  ) {
    Material_ID
    Material_Quantity_Procured_uom
  }
}
    `;

/**
 * __useGetDistinctUoMsByMaterialCodesQuery__
 *
 * To run a query within a React component, call `useGetDistinctUoMsByMaterialCodesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDistinctUoMsByMaterialCodesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDistinctUoMsByMaterialCodesQuery({
 *   variables: {
 *      materialCodes: // value for 'materialCodes'
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetDistinctUoMsByMaterialCodesQuery(baseOptions: Apollo.QueryHookOptions<GetDistinctUoMsByMaterialCodesQuery, GetDistinctUoMsByMaterialCodesQueryVariables> & ({ variables: GetDistinctUoMsByMaterialCodesQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetDistinctUoMsByMaterialCodesQuery, GetDistinctUoMsByMaterialCodesQueryVariables>(GetDistinctUoMsByMaterialCodesDocument, options);
      }
export function useGetDistinctUoMsByMaterialCodesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetDistinctUoMsByMaterialCodesQuery, GetDistinctUoMsByMaterialCodesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetDistinctUoMsByMaterialCodesQuery, GetDistinctUoMsByMaterialCodesQueryVariables>(GetDistinctUoMsByMaterialCodesDocument, options);
        }
export function useGetDistinctUoMsByMaterialCodesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetDistinctUoMsByMaterialCodesQuery, GetDistinctUoMsByMaterialCodesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetDistinctUoMsByMaterialCodesQuery, GetDistinctUoMsByMaterialCodesQueryVariables>(GetDistinctUoMsByMaterialCodesDocument, options);
        }
export type GetDistinctUoMsByMaterialCodesQueryHookResult = ReturnType<typeof useGetDistinctUoMsByMaterialCodesQuery>;
export type GetDistinctUoMsByMaterialCodesLazyQueryHookResult = ReturnType<typeof useGetDistinctUoMsByMaterialCodesLazyQuery>;
export type GetDistinctUoMsByMaterialCodesSuspenseQueryHookResult = ReturnType<typeof useGetDistinctUoMsByMaterialCodesSuspenseQuery>;
export type GetDistinctUoMsByMaterialCodesQueryResult = Apollo.QueryResult<GetDistinctUoMsByMaterialCodesQuery, GetDistinctUoMsByMaterialCodesQueryVariables>;