import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetStatesWithCountryQueryVariables = Types.Exact<{ [key: string]: never; }>;


export type GetStatesWithCountryQuery = { __typename?: 'query_root', State: Array<{ __typename?: 'State', id: any, name: string, Country?: { __typename?: 'Country', id: any, name: string } | null }> };


export const GetStatesWithCountryDocument = gql`
    query getStatesWithCountry {
  State {
    id
    name
    Country {
      id
      name
    }
  }
}
    `;

/**
 * __useGetStatesWithCountryQuery__
 *
 * To run a query within a React component, call `useGetStatesWithCountryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetStatesWithCountryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetStatesWithCountryQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetStatesWithCountryQuery(baseOptions?: Apollo.QueryHookOptions<GetStatesWithCountryQuery, GetStatesWithCountryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetStatesWithCountryQuery, GetStatesWithCountryQueryVariables>(GetStatesWithCountryDocument, options);
      }
export function useGetStatesWithCountryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetStatesWithCountryQuery, GetStatesWithCountryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetStatesWithCountryQuery, GetStatesWithCountryQueryVariables>(GetStatesWithCountryDocument, options);
        }
export function useGetStatesWithCountrySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetStatesWithCountryQuery, GetStatesWithCountryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetStatesWithCountryQuery, GetStatesWithCountryQueryVariables>(GetStatesWithCountryDocument, options);
        }
export type GetStatesWithCountryQueryHookResult = ReturnType<typeof useGetStatesWithCountryQuery>;
export type GetStatesWithCountryLazyQueryHookResult = ReturnType<typeof useGetStatesWithCountryLazyQuery>;
export type GetStatesWithCountrySuspenseQueryHookResult = ReturnType<typeof useGetStatesWithCountrySuspenseQuery>;
export type GetStatesWithCountryQueryResult = Apollo.QueryResult<GetStatesWithCountryQuery, GetStatesWithCountryQueryVariables>;