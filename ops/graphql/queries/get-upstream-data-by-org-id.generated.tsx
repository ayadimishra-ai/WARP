import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetUpstreamDataByOrgIdQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
}>;


export type GetUpstreamDataByOrgIdQuery = { __typename?: 'query_root', GHGTransport_Upstream: Array<{ __typename?: 'GHGTransport_Upstream', id: any, task_request_id: any, total_distance_travelled?: any | null, total_distance_travelled_uom?: string | null, Material_ID?: string | null, Mode_of_Transport?: string | null, Vehicle_Type_Used_for_Road_Transport?: string | null, Fuel_Used?: string | null, TaskRequest: { __typename?: 'TaskRequest', year?: number | null, month: string } }> };


export const GetUpstreamDataByOrgIdDocument = gql`
    query getUpstreamDataByOrgId($organizationId: uuid!) {
  GHGTransport_Upstream(
    where: {OrganizationAddress: {organization_id: {_eq: $organizationId}}}
  ) {
    id
    task_request_id
    total_distance_travelled
    total_distance_travelled_uom
    Material_ID
    Mode_of_Transport
    Vehicle_Type_Used_for_Road_Transport
    Fuel_Used
    TaskRequest {
      year
      month
    }
  }
}
    `;

/**
 * __useGetUpstreamDataByOrgIdQuery__
 *
 * To run a query within a React component, call `useGetUpstreamDataByOrgIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUpstreamDataByOrgIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUpstreamDataByOrgIdQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *   },
 * });
 */
export function useGetUpstreamDataByOrgIdQuery(baseOptions: Apollo.QueryHookOptions<GetUpstreamDataByOrgIdQuery, GetUpstreamDataByOrgIdQueryVariables> & ({ variables: GetUpstreamDataByOrgIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetUpstreamDataByOrgIdQuery, GetUpstreamDataByOrgIdQueryVariables>(GetUpstreamDataByOrgIdDocument, options);
      }
export function useGetUpstreamDataByOrgIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetUpstreamDataByOrgIdQuery, GetUpstreamDataByOrgIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetUpstreamDataByOrgIdQuery, GetUpstreamDataByOrgIdQueryVariables>(GetUpstreamDataByOrgIdDocument, options);
        }
export function useGetUpstreamDataByOrgIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetUpstreamDataByOrgIdQuery, GetUpstreamDataByOrgIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetUpstreamDataByOrgIdQuery, GetUpstreamDataByOrgIdQueryVariables>(GetUpstreamDataByOrgIdDocument, options);
        }
export type GetUpstreamDataByOrgIdQueryHookResult = ReturnType<typeof useGetUpstreamDataByOrgIdQuery>;
export type GetUpstreamDataByOrgIdLazyQueryHookResult = ReturnType<typeof useGetUpstreamDataByOrgIdLazyQuery>;
export type GetUpstreamDataByOrgIdSuspenseQueryHookResult = ReturnType<typeof useGetUpstreamDataByOrgIdSuspenseQuery>;
export type GetUpstreamDataByOrgIdQueryResult = Apollo.QueryResult<GetUpstreamDataByOrgIdQuery, GetUpstreamDataByOrgIdQueryVariables>;