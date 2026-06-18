import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUomMasterdataQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetUomMasterdataQuery = {
  __typename?: "query_root";
  UomMaster: Array<{
    __typename?: "UomMaster";
    id: any;
    label?: string | null;
    code?: string | null;
    metadata?: any | null;
  }>;
};

export const GetUomMasterdataDocument = gql`
  query getUOMMasterdata {
    UomMaster {
      id
      label
      code
      metadata
    }
  }
`;

/**
 * __useGetUomMasterdataQuery__
 *
 * To run a query within a React component, call `useGetUomMasterdataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUomMasterdataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUomMasterdataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetUomMasterdataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUomMasterdataQuery,
    GetUomMasterdataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUomMasterdataQuery, GetUomMasterdataQueryVariables>(
    GetUomMasterdataDocument,
    options
  );
}
export function useGetUomMasterdataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUomMasterdataQuery,
    GetUomMasterdataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUomMasterdataQuery,
    GetUomMasterdataQueryVariables
  >(GetUomMasterdataDocument, options);
}
// @ts-ignore
export function useGetUomMasterdataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUomMasterdataQuery,
    GetUomMasterdataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUomMasterdataQuery,
  GetUomMasterdataQueryVariables
>;
export function useGetUomMasterdataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUomMasterdataQuery,
        GetUomMasterdataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUomMasterdataQuery | undefined,
  GetUomMasterdataQueryVariables
>;
export function useGetUomMasterdataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUomMasterdataQuery,
        GetUomMasterdataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUomMasterdataQuery,
    GetUomMasterdataQueryVariables
  >(GetUomMasterdataDocument, options);
}
export type GetUomMasterdataQueryHookResult = ReturnType<
  typeof useGetUomMasterdataQuery
>;
export type GetUomMasterdataLazyQueryHookResult = ReturnType<
  typeof useGetUomMasterdataLazyQuery
>;
export type GetUomMasterdataSuspenseQueryHookResult = ReturnType<
  typeof useGetUomMasterdataSuspenseQuery
>;
export type GetUomMasterdataQueryResult = Apollo.QueryResult<
  GetUomMasterdataQuery,
  GetUomMasterdataQueryVariables
>;
