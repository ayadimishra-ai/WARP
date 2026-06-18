import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetGhgGeneralDetailsDataQueryVariables = Types.Exact<{
  where: Types.GhgGeneralDetails_Bool_Exp;
}>;


export type GetGhgGeneralDetailsDataQuery = { __typename?: 'query_root', GHGGeneralDetails: Array<{ __typename?: 'GHGGeneralDetails', task_request_id: any, Month_Year: string, Number_Employees: any }> };


export const GetGhgGeneralDetailsDataDocument = gql`
    query getGHGGeneralDetailsData($where: GHGGeneralDetails_bool_exp!) {
  GHGGeneralDetails(where: $where) {
    task_request_id
    Month_Year
    Number_Employees
  }
}
    `;

/**
 * __useGetGhgGeneralDetailsDataQuery__
 *
 * To run a query within a React component, call `useGetGhgGeneralDetailsDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGhgGeneralDetailsDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGhgGeneralDetailsDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetGhgGeneralDetailsDataQuery(baseOptions: Apollo.QueryHookOptions<GetGhgGeneralDetailsDataQuery, GetGhgGeneralDetailsDataQueryVariables> & ({ variables: GetGhgGeneralDetailsDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetGhgGeneralDetailsDataQuery, GetGhgGeneralDetailsDataQueryVariables>(GetGhgGeneralDetailsDataDocument, options);
      }
export function useGetGhgGeneralDetailsDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetGhgGeneralDetailsDataQuery, GetGhgGeneralDetailsDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetGhgGeneralDetailsDataQuery, GetGhgGeneralDetailsDataQueryVariables>(GetGhgGeneralDetailsDataDocument, options);
        }
export function useGetGhgGeneralDetailsDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetGhgGeneralDetailsDataQuery, GetGhgGeneralDetailsDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetGhgGeneralDetailsDataQuery, GetGhgGeneralDetailsDataQueryVariables>(GetGhgGeneralDetailsDataDocument, options);
        }
export type GetGhgGeneralDetailsDataQueryHookResult = ReturnType<typeof useGetGhgGeneralDetailsDataQuery>;
export type GetGhgGeneralDetailsDataLazyQueryHookResult = ReturnType<typeof useGetGhgGeneralDetailsDataLazyQuery>;
export type GetGhgGeneralDetailsDataSuspenseQueryHookResult = ReturnType<typeof useGetGhgGeneralDetailsDataSuspenseQuery>;
export type GetGhgGeneralDetailsDataQueryResult = Apollo.QueryResult<GetGhgGeneralDetailsDataQuery, GetGhgGeneralDetailsDataQueryVariables>;