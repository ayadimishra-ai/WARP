import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GettaskRequestQueryVariables = Types.Exact<{
  where: Types.TaskRequest_Bool_Exp;
  activityId?: Types.InputMaybe<Types.Scalars['uuid']['input']>;
}>;


export type GettaskRequestQuery = { __typename?: 'query_root', TaskRequest: Array<{ __typename?: 'TaskRequest', id: any, organization_address_id: any, month: string, year?: number | null, status?: string | null, metadata?: any | null, is_deleted: boolean, ActivityTaskRequests: Array<{ __typename?: 'ActivityTaskRequest', id: any }>, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, code?: string | null, pincode?: string | null, type?: string | null, ownership_type?: string | null } } }> };


export const GettaskRequestDocument = gql`
    query gettaskRequest($where: TaskRequest_bool_exp!, $activityId: uuid) {
  TaskRequest(where: $where) {
    id
    organization_address_id
    month
    year
    status
    metadata
    is_deleted
    ActivityTaskRequests(
      where: {is_deleted: {_eq: false}, activity_id: {_eq: $activityId}}
    ) {
      id
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
 * __useGettaskRequestQuery__
 *
 * To run a query within a React component, call `useGettaskRequestQuery` and pass it any options that fit your needs.
 * When your component renders, `useGettaskRequestQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGettaskRequestQuery({
 *   variables: {
 *      where: // value for 'where'
 *      activityId: // value for 'activityId'
 *   },
 * });
 */
export function useGettaskRequestQuery(baseOptions: Apollo.QueryHookOptions<GettaskRequestQuery, GettaskRequestQueryVariables> & ({ variables: GettaskRequestQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GettaskRequestQuery, GettaskRequestQueryVariables>(GettaskRequestDocument, options);
      }
export function useGettaskRequestLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GettaskRequestQuery, GettaskRequestQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GettaskRequestQuery, GettaskRequestQueryVariables>(GettaskRequestDocument, options);
        }
export function useGettaskRequestSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GettaskRequestQuery, GettaskRequestQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GettaskRequestQuery, GettaskRequestQueryVariables>(GettaskRequestDocument, options);
        }
export type GettaskRequestQueryHookResult = ReturnType<typeof useGettaskRequestQuery>;
export type GettaskRequestLazyQueryHookResult = ReturnType<typeof useGettaskRequestLazyQuery>;
export type GettaskRequestSuspenseQueryHookResult = ReturnType<typeof useGettaskRequestSuspenseQuery>;
export type GettaskRequestQueryResult = Apollo.QueryResult<GettaskRequestQuery, GettaskRequestQueryVariables>;