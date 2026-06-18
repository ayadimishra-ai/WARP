import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetTaskRequestV2QueryVariables = Types.Exact<{
  organizationAddressId: Types.Scalars['uuid']['input'];
  month: Types.Scalars['String']['input'];
  year: Types.Scalars['Int']['input'];
}>;


export type GetTaskRequestV2Query = { __typename?: 'query_root', TaskRequest: Array<{ __typename?: 'TaskRequest', id: any, organization_address_id: any, status?: string | null, month: string, year?: number | null, ActivityTaskRequests: Array<{ __typename?: 'ActivityTaskRequest', id: any, activity_id: any, status?: string | null, Activity: { __typename?: 'Activity', code: string } }>, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, code?: string | null, pincode?: string | null, type?: string | null, ownership_type?: string | null } } }> };


export const GetTaskRequestV2Document = gql`
    query getTaskRequestV2($organizationAddressId: uuid!, $month: String!, $year: Int!) {
  TaskRequest(
    where: {_and: [{is_deleted: {_eq: false}}, {organization_address_id: {_eq: $organizationAddressId}}, {year: {_eq: $year}}, {month: {_ilike: $month}}]}
  ) {
    id
    organization_address_id
    status
    month
    year
    ActivityTaskRequests(where: {is_deleted: {_eq: false}}) {
      id
      activity_id
      Activity {
        code
      }
      status
    }
    OrganizationAddress {
      Address {
        name
        code
        pincode
        type
        ownership_type
      }
    }
  }
}
    `;

/**
 * __useGetTaskRequestV2Query__
 *
 * To run a query within a React component, call `useGetTaskRequestV2Query` and pass it any options that fit your needs.
 * When your component renders, `useGetTaskRequestV2Query` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetTaskRequestV2Query({
 *   variables: {
 *      organizationAddressId: // value for 'organizationAddressId'
 *      month: // value for 'month'
 *      year: // value for 'year'
 *   },
 * });
 */
export function useGetTaskRequestV2Query(baseOptions: Apollo.QueryHookOptions<GetTaskRequestV2Query, GetTaskRequestV2QueryVariables> & ({ variables: GetTaskRequestV2QueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetTaskRequestV2Query, GetTaskRequestV2QueryVariables>(GetTaskRequestV2Document, options);
      }
export function useGetTaskRequestV2LazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetTaskRequestV2Query, GetTaskRequestV2QueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetTaskRequestV2Query, GetTaskRequestV2QueryVariables>(GetTaskRequestV2Document, options);
        }
export function useGetTaskRequestV2SuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetTaskRequestV2Query, GetTaskRequestV2QueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetTaskRequestV2Query, GetTaskRequestV2QueryVariables>(GetTaskRequestV2Document, options);
        }
export type GetTaskRequestV2QueryHookResult = ReturnType<typeof useGetTaskRequestV2Query>;
export type GetTaskRequestV2LazyQueryHookResult = ReturnType<typeof useGetTaskRequestV2LazyQuery>;
export type GetTaskRequestV2SuspenseQueryHookResult = ReturnType<typeof useGetTaskRequestV2SuspenseQuery>;
export type GetTaskRequestV2QueryResult = Apollo.QueryResult<GetTaskRequestV2Query, GetTaskRequestV2QueryVariables>;