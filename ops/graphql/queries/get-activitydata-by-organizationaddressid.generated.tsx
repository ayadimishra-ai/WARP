import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetActivityDataByOrganizationAddressIdQueryVariables = Types.Exact<{
  organization_address_id: Types.Scalars['uuid']['input'];
}>;


export type GetActivityDataByOrganizationAddressIdQuery = { __typename?: 'query_root', ActivityTaskRequest: Array<{ __typename?: 'ActivityTaskRequest', is_deleted: boolean, metadata?: any | null, status?: string | null, created_at: any, updated_at: any, activity_id: any, created_by?: any | null, id: any, organization_address_id: any, task_request_id: any, updated_by?: any | null }>, DataImportHistory: Array<{ __typename?: 'DataImportHistory', is_deleted: boolean, file_metadata?: any | null, metadata?: any | null, status_data?: any | null, activity_code?: string | null, file_name?: string | null, file_url?: string | null, import_method: string, status?: string | null, created_at: any, updated_at: any, created_by?: any | null, id: any, organization_address_id?: any | null, updated_by?: any | null }>, TaskRequest: Array<{ __typename?: 'TaskRequest', is_deleted: boolean, year?: number | null, metadata?: any | null, month: string, status?: string | null, created_at: any, updated_at: any, created_by?: any | null, id: any, organization_address_id: any, updated_by?: any | null }> };


export const GetActivityDataByOrganizationAddressIdDocument = gql`
    query GetActivityDataByOrganizationAddressID($organization_address_id: uuid!) {
  ActivityTaskRequest(
    where: {organization_address_id: {_eq: $organization_address_id}}
  ) {
    is_deleted
    metadata
    status
    created_at
    updated_at
    activity_id
    created_by
    id
    organization_address_id
    task_request_id
    updated_by
  }
  DataImportHistory(
    where: {organization_address_id: {_eq: $organization_address_id}}
  ) {
    is_deleted
    file_metadata
    metadata
    status_data
    activity_code
    file_name
    file_url
    import_method
    status
    created_at
    updated_at
    created_by
    id
    organization_address_id
    updated_by
  }
  TaskRequest(where: {organization_address_id: {_eq: $organization_address_id}}) {
    is_deleted
    year
    metadata
    month
    status
    created_at
    updated_at
    created_by
    id
    organization_address_id
    updated_by
  }
}
    `;

/**
 * __useGetActivityDataByOrganizationAddressIdQuery__
 *
 * To run a query within a React component, call `useGetActivityDataByOrganizationAddressIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActivityDataByOrganizationAddressIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActivityDataByOrganizationAddressIdQuery({
 *   variables: {
 *      organization_address_id: // value for 'organization_address_id'
 *   },
 * });
 */
export function useGetActivityDataByOrganizationAddressIdQuery(baseOptions: Apollo.QueryHookOptions<GetActivityDataByOrganizationAddressIdQuery, GetActivityDataByOrganizationAddressIdQueryVariables> & ({ variables: GetActivityDataByOrganizationAddressIdQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetActivityDataByOrganizationAddressIdQuery, GetActivityDataByOrganizationAddressIdQueryVariables>(GetActivityDataByOrganizationAddressIdDocument, options);
      }
export function useGetActivityDataByOrganizationAddressIdLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetActivityDataByOrganizationAddressIdQuery, GetActivityDataByOrganizationAddressIdQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetActivityDataByOrganizationAddressIdQuery, GetActivityDataByOrganizationAddressIdQueryVariables>(GetActivityDataByOrganizationAddressIdDocument, options);
        }
export function useGetActivityDataByOrganizationAddressIdSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetActivityDataByOrganizationAddressIdQuery, GetActivityDataByOrganizationAddressIdQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetActivityDataByOrganizationAddressIdQuery, GetActivityDataByOrganizationAddressIdQueryVariables>(GetActivityDataByOrganizationAddressIdDocument, options);
        }
export type GetActivityDataByOrganizationAddressIdQueryHookResult = ReturnType<typeof useGetActivityDataByOrganizationAddressIdQuery>;
export type GetActivityDataByOrganizationAddressIdLazyQueryHookResult = ReturnType<typeof useGetActivityDataByOrganizationAddressIdLazyQuery>;
export type GetActivityDataByOrganizationAddressIdSuspenseQueryHookResult = ReturnType<typeof useGetActivityDataByOrganizationAddressIdSuspenseQuery>;
export type GetActivityDataByOrganizationAddressIdQueryResult = Apollo.QueryResult<GetActivityDataByOrganizationAddressIdQuery, GetActivityDataByOrganizationAddressIdQueryVariables>;