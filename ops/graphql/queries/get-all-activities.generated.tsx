import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetAllActivitiesQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetAllActivitiesQuery = { __typename?: 'query_root', Activity: Array<{ __typename?: 'Activity', id: any, code: string, name: string, is_master?: boolean | null, parent_code?: string | null, metadata?: any | null }> };


export const GetAllActivitiesDocument = gql`
    query getAllActivities {
  Activity(where: {is_deleted: {_eq: false}}) {
    id
    code
    name
    is_master
    parent_code
    is_master
    metadata
  }
}
    `;

/**
 * __useGetAllActivitiesQuery__
 *
 * To run a query within a React component, call `useGetAllActivitiesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetAllActivitiesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetAllActivitiesQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetAllActivitiesQuery(baseOptions?: Apollo.QueryHookOptions<GetAllActivitiesQuery, GetAllActivitiesQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetAllActivitiesQuery, GetAllActivitiesQueryVariables>(GetAllActivitiesDocument, options);
      }
export function useGetAllActivitiesLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetAllActivitiesQuery, GetAllActivitiesQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetAllActivitiesQuery, GetAllActivitiesQueryVariables>(GetAllActivitiesDocument, options);
        }
export function useGetAllActivitiesSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetAllActivitiesQuery, GetAllActivitiesQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetAllActivitiesQuery, GetAllActivitiesQueryVariables>(GetAllActivitiesDocument, options);
        }
export type GetAllActivitiesQueryHookResult = ReturnType<typeof useGetAllActivitiesQuery>;
export type GetAllActivitiesLazyQueryHookResult = ReturnType<typeof useGetAllActivitiesLazyQuery>;
export type GetAllActivitiesSuspenseQueryHookResult = ReturnType<typeof useGetAllActivitiesSuspenseQuery>;
export type GetAllActivitiesQueryResult = Apollo.QueryResult<GetAllActivitiesQuery, GetAllActivitiesQueryVariables>;