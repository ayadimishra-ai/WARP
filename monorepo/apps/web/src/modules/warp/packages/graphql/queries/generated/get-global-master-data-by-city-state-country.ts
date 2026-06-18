import * as Types from '../../generated/types';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;

export const GetGlobalMasterDatabyCityStateCountryDocument = gql`
    query GetGlobalMasterDatabyCityStateCountry($type: String) {
  GlobalMaster(where: {type: {_eq: $type}}) {
    id
    type
    data
  }
}
    `;

/**
 * __useGetGlobalMasterDatabyCityStateCountryQuery__
 *
 * To run a query within a React component, call `useGetGlobalMasterDatabyCityStateCountryQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalMasterDatabyCityStateCountryQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalMasterDatabyCityStateCountryQuery({
 *   variables: {
 *      type: // value for 'type'
 *   },
 * });
 */
export function useGetGlobalMasterDatabyCityStateCountryQuery(baseOptions?: Apollo.QueryHookOptions<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>(GetGlobalMasterDatabyCityStateCountryDocument, options);
      }
export function useGetGlobalMasterDatabyCityStateCountryLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>(GetGlobalMasterDatabyCityStateCountryDocument, options);
        }
// @ts-ignore
export function useGetGlobalMasterDatabyCityStateCountrySuspenseQuery(baseOptions?: Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>;
export function useGetGlobalMasterDatabyCityStateCountrySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>): Apollo.UseSuspenseQueryResult<Types.GetGlobalMasterDatabyCityStateCountryQuery | undefined, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>;
export function useGetGlobalMasterDatabyCityStateCountrySuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>(GetGlobalMasterDatabyCityStateCountryDocument, options);
        }
export type GetGlobalMasterDatabyCityStateCountryQueryHookResult = ReturnType<typeof useGetGlobalMasterDatabyCityStateCountryQuery>;
export type GetGlobalMasterDatabyCityStateCountryLazyQueryHookResult = ReturnType<typeof useGetGlobalMasterDatabyCityStateCountryLazyQuery>;
export type GetGlobalMasterDatabyCityStateCountrySuspenseQueryHookResult = ReturnType<typeof useGetGlobalMasterDatabyCityStateCountrySuspenseQuery>;
export type GetGlobalMasterDatabyCityStateCountryQueryResult = Apollo.QueryResult<Types.GetGlobalMasterDatabyCityStateCountryQuery, Types.GetGlobalMasterDatabyCityStateCountryQueryVariables>;