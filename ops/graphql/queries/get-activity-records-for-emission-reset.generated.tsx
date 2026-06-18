import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetActivityRecordsForEmissionResetQueryVariables = Types.Exact<{
  material_codes: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  org_address_ids: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
}>;


export type GetActivityRecordsForEmissionResetQuery = { __typename?: 'query_root', CapitalGoods: Array<{ __typename?: 'GHGCapital_Goods', id: any, Material_Code?: string | null, organization_address_id: any }>, MaterialProcurement: Array<{ __typename?: 'GHGMaterialProcurement', id: any, Material_Code?: string | null, organization_address_id: any }>, UpstreamTransport: Array<{ __typename?: 'GHGTransport_Upstream', id: any, Material_ID?: string | null, organization_address_id: any }> };


export const GetActivityRecordsForEmissionResetDocument = gql`
    query getActivityRecordsForEmissionReset($material_codes: [String!]!, $org_address_ids: [uuid!]!) {
  CapitalGoods: GHGCapital_Goods(
    where: {Material_Code: {_in: $material_codes}, organization_address_id: {_in: $org_address_ids}}
  ) {
    id
    Material_Code
    organization_address_id
  }
  MaterialProcurement: GHGMaterialProcurement(
    where: {Material_Code: {_in: $material_codes}, organization_address_id: {_in: $org_address_ids}}
  ) {
    id
    Material_Code
    organization_address_id
  }
  UpstreamTransport: GHGTransport_Upstream(
    where: {Material_ID: {_in: $material_codes}, organization_address_id: {_in: $org_address_ids}}
  ) {
    id
    Material_ID
    organization_address_id
  }
}
    `;

/**
 * __useGetActivityRecordsForEmissionResetQuery__
 *
 * To run a query within a React component, call `useGetActivityRecordsForEmissionResetQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityRecordsForEmissionResetQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityRecordsForEmissionResetQuery({
 *   variables: {
 *      material_codes: // value for 'material_codes'
 *      org_address_ids: // value for 'org_address_ids'
 *   },
 * });
 */
export function useGetActivityRecordsForEmissionResetQuery(baseOptions: Apollo.QueryHookOptions<GetActivityRecordsForEmissionResetQuery, GetActivityRecordsForEmissionResetQueryVariables> & ({ variables: GetActivityRecordsForEmissionResetQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActivityRecordsForEmissionResetQuery, GetActivityRecordsForEmissionResetQueryVariables>(GetActivityRecordsForEmissionResetDocument, options);
      }
export function useGetActivityRecordsForEmissionResetLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActivityRecordsForEmissionResetQuery, GetActivityRecordsForEmissionResetQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActivityRecordsForEmissionResetQuery, GetActivityRecordsForEmissionResetQueryVariables>(GetActivityRecordsForEmissionResetDocument, options);
        }
export function useGetActivityRecordsForEmissionResetSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActivityRecordsForEmissionResetQuery, GetActivityRecordsForEmissionResetQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActivityRecordsForEmissionResetQuery, GetActivityRecordsForEmissionResetQueryVariables>(GetActivityRecordsForEmissionResetDocument, options);
        }
export type GetActivityRecordsForEmissionResetQueryHookResult = ReturnType<typeof useGetActivityRecordsForEmissionResetQuery>;
export type GetActivityRecordsForEmissionResetLazyQueryHookResult = ReturnType<typeof useGetActivityRecordsForEmissionResetLazyQuery>;
export type GetActivityRecordsForEmissionResetSuspenseQueryHookResult = ReturnType<typeof useGetActivityRecordsForEmissionResetSuspenseQuery>;
export type GetActivityRecordsForEmissionResetQueryResult = Apollo.QueryResult<GetActivityRecordsForEmissionResetQuery, GetActivityRecordsForEmissionResetQueryVariables>;