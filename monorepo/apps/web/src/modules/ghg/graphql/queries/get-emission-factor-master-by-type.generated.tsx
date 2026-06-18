import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetEmissionFactorMasterByTypeQueryVariables = Types.Exact<{
  type?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  category?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetEmissionFactorMasterByTypeQuery = {
  __typename?: "query_root";
  CO2EmissionFactorMaster: Array<{
    __typename?: "CO2EmissionFactorMaster";
    id: any;
    category?: string | null;
    activity?: string | null;
    sub_activity?: string | null;
    metadata?: any | null;
    factor: any;
    factor_uom: string;
    year: number;
  }>;
};

export const GetEmissionFactorMasterByTypeDocument = gql`
  query getEmissionFactorMasterByType($type: String, $category: String) {
    CO2EmissionFactorMaster(
      where: {
        _and: { sub_activity: { _ilike: $type }, category: { _eq: $category } }
        is_deleted: { _eq: false }
      }
      order_by: { year: desc }
    ) {
      id
      category
      activity
      sub_activity
      metadata
      factor
      factor_uom
      year
    }
  }
`;

/**
 * __useGetEmissionFactorMasterByTypeQuery__
 *
 * To run a query within a React component, call `useGetEmissionFactorMasterByTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetEmissionFactorMasterByTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetEmissionFactorMasterByTypeQuery({
 *   variables: {
 *      type: // value for 'type'
 *      category: // value for 'category'
 *   },
 * });
 */
export function useGetEmissionFactorMasterByTypeQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetEmissionFactorMasterByTypeQuery,
    GetEmissionFactorMasterByTypeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetEmissionFactorMasterByTypeQuery,
    GetEmissionFactorMasterByTypeQueryVariables
  >(GetEmissionFactorMasterByTypeDocument, options);
}
export function useGetEmissionFactorMasterByTypeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetEmissionFactorMasterByTypeQuery,
    GetEmissionFactorMasterByTypeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetEmissionFactorMasterByTypeQuery,
    GetEmissionFactorMasterByTypeQueryVariables
  >(GetEmissionFactorMasterByTypeDocument, options);
}
// @ts-ignore
export function useGetEmissionFactorMasterByTypeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetEmissionFactorMasterByTypeQuery,
    GetEmissionFactorMasterByTypeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetEmissionFactorMasterByTypeQuery,
  GetEmissionFactorMasterByTypeQueryVariables
>;
export function useGetEmissionFactorMasterByTypeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEmissionFactorMasterByTypeQuery,
        GetEmissionFactorMasterByTypeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetEmissionFactorMasterByTypeQuery | undefined,
  GetEmissionFactorMasterByTypeQueryVariables
>;
export function useGetEmissionFactorMasterByTypeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetEmissionFactorMasterByTypeQuery,
        GetEmissionFactorMasterByTypeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetEmissionFactorMasterByTypeQuery,
    GetEmissionFactorMasterByTypeQueryVariables
  >(GetEmissionFactorMasterByTypeDocument, options);
}
export type GetEmissionFactorMasterByTypeQueryHookResult = ReturnType<
  typeof useGetEmissionFactorMasterByTypeQuery
>;
export type GetEmissionFactorMasterByTypeLazyQueryHookResult = ReturnType<
  typeof useGetEmissionFactorMasterByTypeLazyQuery
>;
export type GetEmissionFactorMasterByTypeSuspenseQueryHookResult = ReturnType<
  typeof useGetEmissionFactorMasterByTypeSuspenseQuery
>;
export type GetEmissionFactorMasterByTypeQueryResult = Apollo.QueryResult<
  GetEmissionFactorMasterByTypeQuery,
  GetEmissionFactorMasterByTypeQueryVariables
>;
