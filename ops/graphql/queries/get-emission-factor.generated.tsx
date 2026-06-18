import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetemissionfactorQueryVariables = Types.Exact<{
  region?: Types.InputMaybe<Types.Scalars['String']['input']>;
}>;


export type GetemissionfactorQuery = { __typename?: 'query_root', Region: Array<{ __typename?: 'Region', CO2EmissionFactorMasters: Array<{ __typename?: 'CO2EmissionFactorMaster', year: number, category?: string | null, activity?: string | null, sub_activity?: string | null, type?: string | null, factor: any, factor_uom: string, metadata?: any | null }> }>, globalregion: Array<{ __typename?: 'CO2EmissionFactorMaster', year: number, category?: string | null, activity?: string | null, sub_activity?: string | null, type?: string | null, factor: any, factor_uom: string, metadata?: any | null }> };


export const GetemissionfactorDocument = gql`
    query getemissionfactor($region: String) {
  Region(where: {code: {_eq: $region}}) {
    CO2EmissionFactorMasters(where: {category: {_eq: "Material"}}) {
      year
      category
      activity
      sub_activity
      type
      factor
      factor_uom
      metadata
    }
  }
  globalregion: CO2EmissionFactorMaster(
    where: {region: {_is_null: true}, category: {_eq: "Material"}}
  ) {
    year
    category
    activity
    sub_activity
    type
    factor
    factor_uom
    metadata
  }
}
    `;

/**
 * __useGetemissionfactorQuery__
 *
 * To run a query within a React component, call `useGetemissionfactorQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetemissionfactorQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetemissionfactorQuery({
 *   variables: {
 *      region: // value for 'region'
 *   },
 * });
 */
export function useGetemissionfactorQuery(baseOptions?: Apollo.QueryHookOptions<GetemissionfactorQuery, GetemissionfactorQueryVariables>) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetemissionfactorQuery, GetemissionfactorQueryVariables>(GetemissionfactorDocument, options);
      }
export function useGetemissionfactorLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetemissionfactorQuery, GetemissionfactorQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetemissionfactorQuery, GetemissionfactorQueryVariables>(GetemissionfactorDocument, options);
        }
export function useGetemissionfactorSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetemissionfactorQuery, GetemissionfactorQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetemissionfactorQuery, GetemissionfactorQueryVariables>(GetemissionfactorDocument, options);
        }
export type GetemissionfactorQueryHookResult = ReturnType<typeof useGetemissionfactorQuery>;
export type GetemissionfactorLazyQueryHookResult = ReturnType<typeof useGetemissionfactorLazyQuery>;
export type GetemissionfactorSuspenseQueryHookResult = ReturnType<typeof useGetemissionfactorSuspenseQuery>;
export type GetemissionfactorQueryResult = Apollo.QueryResult<GetemissionfactorQuery, GetemissionfactorQueryVariables>;