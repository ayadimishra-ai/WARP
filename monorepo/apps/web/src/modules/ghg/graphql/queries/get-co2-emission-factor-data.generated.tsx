import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCo2EmissionFactorsDataQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetCo2EmissionFactorsDataQuery = {
  __typename?: "query_root";
  CO2EmissionFactorMaster: Array<{
    __typename?: "CO2EmissionFactorMaster";
    year: number;
    category?: string | null;
    activity?: string | null;
    sub_activity?: string | null;
    type?: string | null;
    sub_type?: string | null;
    fuel_type?: string | null;
    factor: any;
    factor_uom: string;
    metadata?: any | null;
    Region?: { __typename?: "Region"; name: string } | null;
  }>;
};

export const GetCo2EmissionFactorsDataDocument = gql`
  query getCO2EmissionFactorsData {
    CO2EmissionFactorMaster {
      year
      category
      activity
      sub_activity
      type
      sub_type
      fuel_type
      factor
      factor_uom
      metadata
      Region {
        name
      }
    }
  }
`;

/**
 * __useGetCo2EmissionFactorsDataQuery__
 *
 * To run a query within a React component, call `useGetCo2EmissionFactorsDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCo2EmissionFactorsDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCo2EmissionFactorsDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetCo2EmissionFactorsDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetCo2EmissionFactorsDataQuery,
    GetCo2EmissionFactorsDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCo2EmissionFactorsDataQuery,
    GetCo2EmissionFactorsDataQueryVariables
  >(GetCo2EmissionFactorsDataDocument, options);
}
export function useGetCo2EmissionFactorsDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCo2EmissionFactorsDataQuery,
    GetCo2EmissionFactorsDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCo2EmissionFactorsDataQuery,
    GetCo2EmissionFactorsDataQueryVariables
  >(GetCo2EmissionFactorsDataDocument, options);
}
// @ts-ignore
export function useGetCo2EmissionFactorsDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCo2EmissionFactorsDataQuery,
    GetCo2EmissionFactorsDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCo2EmissionFactorsDataQuery,
  GetCo2EmissionFactorsDataQueryVariables
>;
export function useGetCo2EmissionFactorsDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCo2EmissionFactorsDataQuery,
        GetCo2EmissionFactorsDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCo2EmissionFactorsDataQuery | undefined,
  GetCo2EmissionFactorsDataQueryVariables
>;
export function useGetCo2EmissionFactorsDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCo2EmissionFactorsDataQuery,
        GetCo2EmissionFactorsDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCo2EmissionFactorsDataQuery,
    GetCo2EmissionFactorsDataQueryVariables
  >(GetCo2EmissionFactorsDataDocument, options);
}
export type GetCo2EmissionFactorsDataQueryHookResult = ReturnType<
  typeof useGetCo2EmissionFactorsDataQuery
>;
export type GetCo2EmissionFactorsDataLazyQueryHookResult = ReturnType<
  typeof useGetCo2EmissionFactorsDataLazyQuery
>;
export type GetCo2EmissionFactorsDataSuspenseQueryHookResult = ReturnType<
  typeof useGetCo2EmissionFactorsDataSuspenseQuery
>;
export type GetCo2EmissionFactorsDataQueryResult = Apollo.QueryResult<
  GetCo2EmissionFactorsDataQuery,
  GetCo2EmissionFactorsDataQueryVariables
>;
