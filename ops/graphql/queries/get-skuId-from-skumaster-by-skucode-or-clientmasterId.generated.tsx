import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables = Types.Exact<{
  where: Types.OrgSkuMaster_Bool_Exp;
}>;


export type GetSkuDetailsFromBySkucodeOrClientMasterIdQuery = { __typename?: 'query_root', OrgSKUMaster: Array<{ __typename?: 'OrgSKUMaster', id: any, name: string, client_master_id?: string | null, code?: string | null, weight: any }> };


export const GetSkuDetailsFromBySkucodeOrClientMasterIdDocument = gql`
    query getSkuDetailsFromBySkucodeOrClientMasterId($where: OrgSKUMaster_bool_exp!) {
  OrgSKUMaster(where: $where) {
    id
    name
    client_master_id
    code
    weight
  }
}
    `;

/**
 * __useGetSkuDetailsFromBySkucodeOrClientMasterIdQuery__
 *
 * To run a query within a React component, call `useGetSkuDetailsFromBySkucodeOrClientMasterIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSkuDetailsFromBySkucodeOrClientMasterIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSkuDetailsFromBySkucodeOrClientMasterIdQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetSkuDetailsFromBySkucodeOrClientMasterIdQuery(baseOptions: Apollo.QueryHookOptions<GetSkuDetailsFromBySkucodeOrClientMasterIdQuery, GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables> & ({ variables: GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetSkuDetailsFromBySkucodeOrClientMasterIdQuery, GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables>(GetSkuDetailsFromBySkucodeOrClientMasterIdDocument, options);
      }
export function useGetSkuDetailsFromBySkucodeOrClientMasterIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetSkuDetailsFromBySkucodeOrClientMasterIdQuery, GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetSkuDetailsFromBySkucodeOrClientMasterIdQuery, GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables>(GetSkuDetailsFromBySkucodeOrClientMasterIdDocument, options);
        }
export function useGetSkuDetailsFromBySkucodeOrClientMasterIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetSkuDetailsFromBySkucodeOrClientMasterIdQuery, GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetSkuDetailsFromBySkucodeOrClientMasterIdQuery, GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables>(GetSkuDetailsFromBySkucodeOrClientMasterIdDocument, options);
        }
export type GetSkuDetailsFromBySkucodeOrClientMasterIdQueryHookResult = ReturnType<typeof useGetSkuDetailsFromBySkucodeOrClientMasterIdQuery>;
export type GetSkuDetailsFromBySkucodeOrClientMasterIdLazyQueryHookResult = ReturnType<typeof useGetSkuDetailsFromBySkucodeOrClientMasterIdLazyQuery>;
export type GetSkuDetailsFromBySkucodeOrClientMasterIdSuspenseQueryHookResult = ReturnType<typeof useGetSkuDetailsFromBySkucodeOrClientMasterIdSuspenseQuery>;
export type GetSkuDetailsFromBySkucodeOrClientMasterIdQueryResult = Apollo.QueryResult<GetSkuDetailsFromBySkucodeOrClientMasterIdQuery, GetSkuDetailsFromBySkucodeOrClientMasterIdQueryVariables>;