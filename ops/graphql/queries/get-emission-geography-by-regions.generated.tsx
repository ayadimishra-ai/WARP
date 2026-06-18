import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetEmissionGeographyByRegionsQueryVariables = Types.Exact<{
  where: Types.EmissionFactorGeographyHierarchy_Bool_Exp;
}>;


export type GetEmissionGeographyByRegionsQuery = { __typename?: 'query_root', EmissionFactorGeographyHierarchy: Array<{ __typename?: 'EmissionFactorGeographyHierarchy', id: any, country_id: any, geography: string, sequence: any, geography_type: string, Country: { __typename?: 'Country', name: string } }> };


export const GetEmissionGeographyByRegionsDocument = gql`
    query getEmissionGeographyByRegions($where: EmissionFactorGeographyHierarchy_bool_exp!) {
  EmissionFactorGeographyHierarchy(where: $where) {
    id
    country_id
    geography
    sequence
    geography_type
    Country {
      name
    }
  }
}
    `;

/**
 * __useGetEmissionGeographyByRegionsQuery__
 *
 * To run a query within a React component, call `useGetEmissionGeographyByRegionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmissionGeographyByRegionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmissionGeographyByRegionsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetEmissionGeographyByRegionsQuery(baseOptions: Apollo.QueryHookOptions<GetEmissionGeographyByRegionsQuery, GetEmissionGeographyByRegionsQueryVariables> & ({ variables: GetEmissionGeographyByRegionsQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetEmissionGeographyByRegionsQuery, GetEmissionGeographyByRegionsQueryVariables>(GetEmissionGeographyByRegionsDocument, options);
      }
export function useGetEmissionGeographyByRegionsLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetEmissionGeographyByRegionsQuery, GetEmissionGeographyByRegionsQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetEmissionGeographyByRegionsQuery, GetEmissionGeographyByRegionsQueryVariables>(GetEmissionGeographyByRegionsDocument, options);
        }
export function useGetEmissionGeographyByRegionsSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetEmissionGeographyByRegionsQuery, GetEmissionGeographyByRegionsQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetEmissionGeographyByRegionsQuery, GetEmissionGeographyByRegionsQueryVariables>(GetEmissionGeographyByRegionsDocument, options);
        }
export type GetEmissionGeographyByRegionsQueryHookResult = ReturnType<typeof useGetEmissionGeographyByRegionsQuery>;
export type GetEmissionGeographyByRegionsLazyQueryHookResult = ReturnType<typeof useGetEmissionGeographyByRegionsLazyQuery>;
export type GetEmissionGeographyByRegionsSuspenseQueryHookResult = ReturnType<typeof useGetEmissionGeographyByRegionsSuspenseQuery>;
export type GetEmissionGeographyByRegionsQueryResult = Apollo.QueryResult<GetEmissionGeographyByRegionsQuery, GetEmissionGeographyByRegionsQueryVariables>;