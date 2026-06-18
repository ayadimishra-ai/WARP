import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCountryEmissionGeographyDataQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetCountryEmissionGeographyDataQuery = {
  __typename?: "query_root";
  EmissionFactorGeographyHierarchy: Array<{
    __typename?: "EmissionFactorGeographyHierarchy";
    id: any;
    country_id: any;
    geography: string;
    sequence: any;
    geography_type: string;
    Country: { __typename?: "Country"; name: string };
  }>;
};

export const GetCountryEmissionGeographyDataDocument = gql`
  query getCountryEmissionGeographyData {
    EmissionFactorGeographyHierarchy {
      Country {
        name
      }
      id
      country_id
      geography
      sequence
      geography_type
    }
  }
`;

/**
 * __useGetCountryEmissionGeographyDataQuery__
 *
 * To run a query within a React component, call `useGetCountryEmissionGeographyDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountryEmissionGeographyDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountryEmissionGeographyDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCountryEmissionGeographyDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCountryEmissionGeographyDataQuery,
    GetCountryEmissionGeographyDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCountryEmissionGeographyDataQuery,
    GetCountryEmissionGeographyDataQueryVariables
  >(GetCountryEmissionGeographyDataDocument, options);
}
export function useGetCountryEmissionGeographyDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCountryEmissionGeographyDataQuery,
    GetCountryEmissionGeographyDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCountryEmissionGeographyDataQuery,
    GetCountryEmissionGeographyDataQueryVariables
  >(GetCountryEmissionGeographyDataDocument, options);
}
// @ts-ignore
export function useGetCountryEmissionGeographyDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCountryEmissionGeographyDataQuery,
    GetCountryEmissionGeographyDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCountryEmissionGeographyDataQuery,
  GetCountryEmissionGeographyDataQueryVariables
>;
export function useGetCountryEmissionGeographyDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryEmissionGeographyDataQuery,
        GetCountryEmissionGeographyDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCountryEmissionGeographyDataQuery | undefined,
  GetCountryEmissionGeographyDataQueryVariables
>;
export function useGetCountryEmissionGeographyDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryEmissionGeographyDataQuery,
        GetCountryEmissionGeographyDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCountryEmissionGeographyDataQuery,
    GetCountryEmissionGeographyDataQueryVariables
  >(GetCountryEmissionGeographyDataDocument, options);
}
export type GetCountryEmissionGeographyDataQueryHookResult = ReturnType<
  typeof useGetCountryEmissionGeographyDataQuery
>;
export type GetCountryEmissionGeographyDataLazyQueryHookResult = ReturnType<
  typeof useGetCountryEmissionGeographyDataLazyQuery
>;
export type GetCountryEmissionGeographyDataSuspenseQueryHookResult = ReturnType<
  typeof useGetCountryEmissionGeographyDataSuspenseQuery
>;
export type GetCountryEmissionGeographyDataQueryResult = Apollo.QueryResult<
  GetCountryEmissionGeographyDataQuery,
  GetCountryEmissionGeographyDataQueryVariables
>;
