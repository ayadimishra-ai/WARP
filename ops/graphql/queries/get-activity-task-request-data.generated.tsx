import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetactivityTaskRequestDataQueryVariables = Types.Exact<{
  where: Types.ActivityTaskRequest_Bool_Exp;
}>;


export type GetactivityTaskRequestDataQuery = { __typename?: 'query_root', ActivityTaskRequest: Array<{ __typename?: 'ActivityTaskRequest', activity_id: any, task_request_id: any, organization_address_id: any, id: any, TaskRequest: { __typename?: 'TaskRequest', id: any, organization_address_id: any, month: string, year?: number | null }, OrganizationAddress: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, pincode?: string | null } } }> };


export const GetactivityTaskRequestDataDocument = gql`
    query getactivityTaskRequestData($where: ActivityTaskRequest_bool_exp!) {
  ActivityTaskRequest(where: $where) {
    activity_id
    task_request_id
    organization_address_id
    id
    TaskRequest {
      id
      organization_address_id
      month
      year
    }
    OrganizationAddress {
      Address {
        name
        pincode
      }
    }
  }
}
    `;

/**
 * __useGetactivityTaskRequestDataQuery__
 *
 * To run a query within a React component, call `useGetactivityTaskRequestDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetactivityTaskRequestDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetactivityTaskRequestDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetactivityTaskRequestDataQuery(baseOptions: Apollo.QueryHookOptions<GetactivityTaskRequestDataQuery, GetactivityTaskRequestDataQueryVariables> & ({ variables: GetactivityTaskRequestDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetactivityTaskRequestDataQuery, GetactivityTaskRequestDataQueryVariables>(GetactivityTaskRequestDataDocument, options);
      }
export function useGetactivityTaskRequestDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetactivityTaskRequestDataQuery, GetactivityTaskRequestDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetactivityTaskRequestDataQuery, GetactivityTaskRequestDataQueryVariables>(GetactivityTaskRequestDataDocument, options);
        }
export function useGetactivityTaskRequestDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetactivityTaskRequestDataQuery, GetactivityTaskRequestDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetactivityTaskRequestDataQuery, GetactivityTaskRequestDataQueryVariables>(GetactivityTaskRequestDataDocument, options);
        }
export type GetactivityTaskRequestDataQueryHookResult = ReturnType<typeof useGetactivityTaskRequestDataQuery>;
export type GetactivityTaskRequestDataLazyQueryHookResult = ReturnType<typeof useGetactivityTaskRequestDataLazyQuery>;
export type GetactivityTaskRequestDataSuspenseQueryHookResult = ReturnType<typeof useGetactivityTaskRequestDataSuspenseQuery>;
export type GetactivityTaskRequestDataQueryResult = Apollo.QueryResult<GetactivityTaskRequestDataQuery, GetactivityTaskRequestDataQueryVariables>;