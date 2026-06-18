import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetCityDataQueryVariables = Types.Exact<{
  where: Types.City_Bool_Exp;
}>;


export type GetCityDataQuery = { __typename?: 'query_root', City: Array<{ __typename?: 'City', id: any, name: string, code: string }> };


export const GetCityDataDocument = gql`
    query getCityData($where: City_bool_exp!) {
  City(where: $where) {
    id
    name
    code
  }
}
    `;

/**
 * __useGetCityDataQuery__
 *
 * To run a query within a React component, call `useGetCityDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCityDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCityDataQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetCityDataQuery(baseOptions: Apollo.QueryHookOptions<GetCityDataQuery, GetCityDataQueryVariables> & ({ variables: GetCityDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetCityDataQuery, GetCityDataQueryVariables>(GetCityDataDocument, options);
      }
export function useGetCityDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetCityDataQuery, GetCityDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetCityDataQuery, GetCityDataQueryVariables>(GetCityDataDocument, options);
        }
export function useGetCityDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetCityDataQuery, GetCityDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetCityDataQuery, GetCityDataQueryVariables>(GetCityDataDocument, options);
        }
export type GetCityDataQueryHookResult = ReturnType<typeof useGetCityDataQuery>;
export type GetCityDataLazyQueryHookResult = ReturnType<typeof useGetCityDataLazyQuery>;
export type GetCityDataSuspenseQueryHookResult = ReturnType<typeof useGetCityDataSuspenseQuery>;
export type GetCityDataQueryResult = Apollo.QueryResult<GetCityDataQuery, GetCityDataQueryVariables>;