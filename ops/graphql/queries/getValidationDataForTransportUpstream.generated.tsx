import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetValidationDataForTransportUpstreamQueryVariables = Types.Exact<{
  organizationId: Types.Scalars['uuid']['input'];
  activityLocationMasterIds: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
  activityMasterIds: Array<Types.Scalars['String']['input']> | Types.Scalars['String']['input'];
}>;


export type GetValidationDataForTransportUpstreamQuery = { __typename?: 'query_root', activity_locations: Array<{ __typename?: 'Addresses', id: any, client_master_id?: string | null }>, activity_masters: Array<{ __typename?: 'ActivityMaster', master_key: string, master_data: any }> };


export const GetValidationDataForTransportUpstreamDocument = gql`
    query getValidationDataForTransportUpstream($organizationId: uuid!, $activityLocationMasterIds: [String!]!, $activityMasterIds: [String!]!) {
  activity_locations: Addresses(
    where: {_and: [{client_master_id: {_in: $activityLocationMasterIds}}, {OrganizationAddresses: {organization_id: {_eq: $organizationId}}}, {type: {_eq: "Manufacturing"}}]}
  ) {
    id
    client_master_id
  }
  activity_masters: ActivityMaster(where: {master_key: {_in: $activityMasterIds}}) {
    master_key
    master_data
  }
}
    `;

/**
 * __useGetValidationDataForTransportUpstreamQuery__
 *
 * To run a query within a React component, call `useGetValidationDataForTransportUpstreamQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetValidationDataForTransportUpstreamQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetValidationDataForTransportUpstreamQuery({
 *   variables: {
 *      organizationId: // value for 'organizationId'
 *      activityLocationMasterIds: // value for 'activityLocationMasterIds'
 *      activityMasterIds: // value for 'activityMasterIds'
 *   },
 * });
 */
export function useGetValidationDataForTransportUpstreamQuery(baseOptions: Apollo.QueryHookOptions<GetValidationDataForTransportUpstreamQuery, GetValidationDataForTransportUpstreamQueryVariables> & ({ variables: GetValidationDataForTransportUpstreamQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetValidationDataForTransportUpstreamQuery, GetValidationDataForTransportUpstreamQueryVariables>(GetValidationDataForTransportUpstreamDocument, options);
      }
export function useGetValidationDataForTransportUpstreamLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetValidationDataForTransportUpstreamQuery, GetValidationDataForTransportUpstreamQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetValidationDataForTransportUpstreamQuery, GetValidationDataForTransportUpstreamQueryVariables>(GetValidationDataForTransportUpstreamDocument, options);
        }
export function useGetValidationDataForTransportUpstreamSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetValidationDataForTransportUpstreamQuery, GetValidationDataForTransportUpstreamQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetValidationDataForTransportUpstreamQuery, GetValidationDataForTransportUpstreamQueryVariables>(GetValidationDataForTransportUpstreamDocument, options);
        }
export type GetValidationDataForTransportUpstreamQueryHookResult = ReturnType<typeof useGetValidationDataForTransportUpstreamQuery>;
export type GetValidationDataForTransportUpstreamLazyQueryHookResult = ReturnType<typeof useGetValidationDataForTransportUpstreamLazyQuery>;
export type GetValidationDataForTransportUpstreamSuspenseQueryHookResult = ReturnType<typeof useGetValidationDataForTransportUpstreamSuspenseQuery>;
export type GetValidationDataForTransportUpstreamQueryResult = Apollo.QueryResult<GetValidationDataForTransportUpstreamQuery, GetValidationDataForTransportUpstreamQueryVariables>;