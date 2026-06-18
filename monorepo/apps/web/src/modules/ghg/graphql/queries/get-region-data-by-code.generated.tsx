import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetRegionDataByCodeQueryVariables = Types.Exact<{
  code?: Types.InputMaybe<
    Array<Types.Scalars["String"]["input"]> | Types.Scalars["String"]["input"]
  >;
}>;

export type GetRegionDataByCodeQuery = {
  __typename?: "query_root";
  Region: Array<{ __typename?: "Region"; id: any; code: string }>;
};

export const GetRegionDataByCodeDocument = gql`
  query getRegionDataByCode($code: [String!]) {
    Region(where: { code: { _in: $code } }) {
      id
      code
    }
  }
`;

/**
 * __useGetRegionDataByCodeQuery__
 *
 * To run a query within a React component, call `useGetRegionDataByCodeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRegionDataByCodeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRegionDataByCodeQuery({
 *   variables: {
 *      code: // value for 'code'
 *   },
 * });
 */
export function useGetRegionDataByCodeQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetRegionDataByCodeQuery,
    GetRegionDataByCodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetRegionDataByCodeQuery,
    GetRegionDataByCodeQueryVariables
  >(GetRegionDataByCodeDocument, options);
}
export function useGetRegionDataByCodeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetRegionDataByCodeQuery,
    GetRegionDataByCodeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetRegionDataByCodeQuery,
    GetRegionDataByCodeQueryVariables
  >(GetRegionDataByCodeDocument, options);
}
// @ts-ignore
export function useGetRegionDataByCodeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetRegionDataByCodeQuery,
    GetRegionDataByCodeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetRegionDataByCodeQuery,
  GetRegionDataByCodeQueryVariables
>;
export function useGetRegionDataByCodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRegionDataByCodeQuery,
        GetRegionDataByCodeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetRegionDataByCodeQuery | undefined,
  GetRegionDataByCodeQueryVariables
>;
export function useGetRegionDataByCodeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRegionDataByCodeQuery,
        GetRegionDataByCodeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetRegionDataByCodeQuery,
    GetRegionDataByCodeQueryVariables
  >(GetRegionDataByCodeDocument, options);
}
export type GetRegionDataByCodeQueryHookResult = ReturnType<
  typeof useGetRegionDataByCodeQuery
>;
export type GetRegionDataByCodeLazyQueryHookResult = ReturnType<
  typeof useGetRegionDataByCodeLazyQuery
>;
export type GetRegionDataByCodeSuspenseQueryHookResult = ReturnType<
  typeof useGetRegionDataByCodeSuspenseQuery
>;
export type GetRegionDataByCodeQueryResult = Apollo.QueryResult<
  GetRegionDataByCodeQuery,
  GetRegionDataByCodeQueryVariables
>;
