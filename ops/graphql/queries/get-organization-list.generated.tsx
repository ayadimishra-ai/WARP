import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetOrganizationListQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetOrganizationListQuery = { __typename?: 'query_root', Organization: Array<{ __typename?: 'Organization', id: any, name: string }> };


export const GetOrganizationListDocument = gql`
    query getOrganizationList {
  Organization(where: {is_deleted: {_eq: false}}, order_by: {name: asc}) {
    id
    name
  }
}
    `;

/**
 * __useGetOrganizationListQuery__
 *
 * To run a query within a React component, call `useGetOrganizationListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationListQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOrganizationListQuery(baseOptions?: Apollo.QueryHookOptions<GetOrganizationListQuery, GetOrganizationListQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetOrganizationListQuery, GetOrganizationListQueryVariables>(GetOrganizationListDocument, options);
      }
export function useGetOrganizationListLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetOrganizationListQuery, GetOrganizationListQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetOrganizationListQuery, GetOrganizationListQueryVariables>(GetOrganizationListDocument, options);
        }
export function useGetOrganizationListSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetOrganizationListQuery, GetOrganizationListQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetOrganizationListQuery, GetOrganizationListQueryVariables>(GetOrganizationListDocument, options);
        }
export type GetOrganizationListQueryHookResult = ReturnType<typeof useGetOrganizationListQuery>;
export type GetOrganizationListLazyQueryHookResult = ReturnType<typeof useGetOrganizationListLazyQuery>;
export type GetOrganizationListSuspenseQueryHookResult = ReturnType<typeof useGetOrganizationListSuspenseQuery>;
export type GetOrganizationListQueryResult = Apollo.QueryResult<GetOrganizationListQuery, GetOrganizationListQueryVariables>;