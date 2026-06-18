import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUomConversionFactorsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetUomConversionFactorsQuery = {
  __typename?: "query_root";
  UomConversionMaster: Array<{
    __typename?: "UomConversionMaster";
    id: any;
    from_key: string;
    to_key: string;
    factor: any;
    metadata?: any | null;
    created_at: any;
    created_by?: any | null;
    updated_at: any;
    updated_by?: any | null;
  }>;
};

export const GetUomConversionFactorsDocument = gql`
  query getUomConversionFactors @cached {
    UomConversionMaster(order_by: { from_key: asc, to_key: asc }) {
      id
      from_key
      to_key
      factor
      metadata
      created_at
      created_by
      updated_at
      updated_by
    }
  }
`;

/**
 * __useGetUomConversionFactorsQuery__
 *
 * To run a query within a React component, call `useGetUomConversionFactorsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUomConversionFactorsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUomConversionFactorsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUomConversionFactorsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUomConversionFactorsQuery,
    GetUomConversionFactorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUomConversionFactorsQuery,
    GetUomConversionFactorsQueryVariables
  >(GetUomConversionFactorsDocument, options);
}
export function useGetUomConversionFactorsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUomConversionFactorsQuery,
    GetUomConversionFactorsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUomConversionFactorsQuery,
    GetUomConversionFactorsQueryVariables
  >(GetUomConversionFactorsDocument, options);
}
// @ts-ignore
export function useGetUomConversionFactorsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUomConversionFactorsQuery,
    GetUomConversionFactorsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUomConversionFactorsQuery,
  GetUomConversionFactorsQueryVariables
>;
export function useGetUomConversionFactorsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUomConversionFactorsQuery,
        GetUomConversionFactorsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUomConversionFactorsQuery | undefined,
  GetUomConversionFactorsQueryVariables
>;
export function useGetUomConversionFactorsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUomConversionFactorsQuery,
        GetUomConversionFactorsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUomConversionFactorsQuery,
    GetUomConversionFactorsQueryVariables
  >(GetUomConversionFactorsDocument, options);
}
export type GetUomConversionFactorsQueryHookResult = ReturnType<
  typeof useGetUomConversionFactorsQuery
>;
export type GetUomConversionFactorsLazyQueryHookResult = ReturnType<
  typeof useGetUomConversionFactorsLazyQuery
>;
export type GetUomConversionFactorsSuspenseQueryHookResult = ReturnType<
  typeof useGetUomConversionFactorsSuspenseQuery
>;
export type GetUomConversionFactorsQueryResult = Apollo.QueryResult<
  GetUomConversionFactorsQuery,
  GetUomConversionFactorsQueryVariables
>;
