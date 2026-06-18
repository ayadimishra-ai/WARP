import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCountryEmissionGeographyQueryVariables = Types.Exact<{
  countryId: Types.Scalars["uuid"]["input"];
}>;

export type GetCountryEmissionGeographyQuery = {
  __typename?: "query_root";
  EmissionFactorGeographyHierarchy: Array<{
    __typename?: "EmissionFactorGeographyHierarchy";
    id: any;
    geography: string;
    sequence: any;
    Country: { __typename?: "Country"; name: string };
  }>;
  Country: Array<{ __typename?: "Country"; id: any; name: string }>;
};

export const GetCountryEmissionGeographyDocument = gql`
  query getCountryEmissionGeography($countryId: uuid!) {
    EmissionFactorGeographyHierarchy(
      where: { country_id: { _eq: $countryId } }
      order_by: { sequence: asc }
    ) {
      Country {
        name
      }
      id
      geography
      sequence
    }
    Country(where: { id: { _eq: $countryId } }) {
      id
      name
    }
  }
`;

/**
 * __useGetCountryEmissionGeographyQuery__
 *
 * To run a query within a React component, call `useGetCountryEmissionGeographyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCountryEmissionGeographyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCountryEmissionGeographyQuery({
 *   variables: {
 *      countryId: // value for 'countryId'
 *   },
 * });
 */
export function useGetCountryEmissionGeographyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCountryEmissionGeographyQuery,
    GetCountryEmissionGeographyQueryVariables
  > &
    (
      | { variables: GetCountryEmissionGeographyQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCountryEmissionGeographyQuery,
    GetCountryEmissionGeographyQueryVariables
  >(GetCountryEmissionGeographyDocument, options);
}
export function useGetCountryEmissionGeographyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCountryEmissionGeographyQuery,
    GetCountryEmissionGeographyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCountryEmissionGeographyQuery,
    GetCountryEmissionGeographyQueryVariables
  >(GetCountryEmissionGeographyDocument, options);
}
// @ts-ignore
export function useGetCountryEmissionGeographySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCountryEmissionGeographyQuery,
    GetCountryEmissionGeographyQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCountryEmissionGeographyQuery,
  GetCountryEmissionGeographyQueryVariables
>;
export function useGetCountryEmissionGeographySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryEmissionGeographyQuery,
        GetCountryEmissionGeographyQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCountryEmissionGeographyQuery | undefined,
  GetCountryEmissionGeographyQueryVariables
>;
export function useGetCountryEmissionGeographySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCountryEmissionGeographyQuery,
        GetCountryEmissionGeographyQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCountryEmissionGeographyQuery,
    GetCountryEmissionGeographyQueryVariables
  >(GetCountryEmissionGeographyDocument, options);
}
export type GetCountryEmissionGeographyQueryHookResult = ReturnType<
  typeof useGetCountryEmissionGeographyQuery
>;
export type GetCountryEmissionGeographyLazyQueryHookResult = ReturnType<
  typeof useGetCountryEmissionGeographyLazyQuery
>;
export type GetCountryEmissionGeographySuspenseQueryHookResult = ReturnType<
  typeof useGetCountryEmissionGeographySuspenseQuery
>;
export type GetCountryEmissionGeographyQueryResult = Apollo.QueryResult<
  GetCountryEmissionGeographyQuery,
  GetCountryEmissionGeographyQueryVariables
>;
