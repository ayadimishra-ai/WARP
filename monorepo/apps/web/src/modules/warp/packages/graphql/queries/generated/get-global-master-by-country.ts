import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterByCountryDocument = gql`
    query GetGlobalMasterByCountry {
  GlobalMaster(where: {type: {_eq: "CountryMaster"}}) {
    id
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterByCountryQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterByCountryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterByCountryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterByCountryQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGlobalMasterByCountryQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>(GetGlobalMasterByCountryDocument, options);
      }
export function useGetGlobalMasterByCountryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>(GetGlobalMasterByCountryDocument, options);
        }
// @ts-ignore
export function useGetGlobalMasterByCountrySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>;
export function useGetGlobalMasterByCountrySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterByCountryQuery | undefined, Types.GetGlobalMasterByCountryQueryVariables>;
export function useGetGlobalMasterByCountrySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>(GetGlobalMasterByCountryDocument, options);
        }
export type GetGlobalMasterByCountryQueryHookResult = ReturnType<typeof useGetGlobalMasterByCountryQuery>;
export type GetGlobalMasterByCountryLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterByCountryLazyQuery>;
export type GetGlobalMasterByCountrySuspenseQueryHookResult = ReturnType<typeof useGetGlobalMasterByCountrySuspenseQuery>;
export type GetGlobalMasterByCountryQueryResult = Apollo.QueryResult<Types.GetGlobalMasterByCountryQuery, Types.GetGlobalMasterByCountryQueryVariables>;