import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetRegionDataQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetRegionDataQuery = {
  __typename?: "query_root";
  Region: Array<{ __typename?: "Region"; id: any; name: string; code: string }>;
};

export const GetRegionDataDocument = gql`
  query getRegionData {
    Region {
      id
      name
      code
    }
  }
`;

/**
 * __useGetRegionDataQuery__
 *
 * To run a query within a React component, call `useGetRegionDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegionDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegionDataQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetRegionDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetRegionDataQuery,
    GetRegionDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetRegionDataQuery, GetRegionDataQueryVariables>(
    GetRegionDataDocument,
    options
  );
}
export function useGetRegionDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetRegionDataQuery,
    GetRegionDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetRegionDataQuery, GetRegionDataQueryVariables>(
    GetRegionDataDocument,
    options
  );
}
// @ts-ignore
export function useGetRegionDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetRegionDataQuery,
    GetRegionDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetRegionDataQuery,
  GetRegionDataQueryVariables
>;
export function useGetRegionDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRegionDataQuery,
        GetRegionDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetRegionDataQuery | undefined,
  GetRegionDataQueryVariables
>;
export function useGetRegionDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRegionDataQuery,
        GetRegionDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetRegionDataQuery,
    GetRegionDataQueryVariables
  >(GetRegionDataDocument, options);
}
export type GetRegionDataQueryHookResult = ReturnType<
  typeof useGetRegionDataQuery
>;
export type GetRegionDataLazyQueryHookResult = ReturnType<
  typeof useGetRegionDataLazyQuery
>;
export type GetRegionDataSuspenseQueryHookResult = ReturnType<
  typeof useGetRegionDataSuspenseQuery
>;
export type GetRegionDataQueryResult = Apollo.QueryResult<
  GetRegionDataQuery,
  GetRegionDataQueryVariables
>;
