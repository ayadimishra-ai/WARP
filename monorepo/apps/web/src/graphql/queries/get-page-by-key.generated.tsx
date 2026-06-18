import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPageByKeyQueryVariables = Types.Exact<{
  pageKey: Types.Scalars["String"]["input"];
}>;

export type GetPageByKeyQuery = {
  __typename?: "query_root";
  Tbl_Pages: Array<{
    __typename?: "Tbl_Pages";
    PageGuid: any;
    PageKey: string;
    URL?: string | null;
    PlatformType?: string | null;
    ParentPageGuid?: any | null;
  }>;
};

export const GetPageByKeyDocument = gql`
  query GetPageByKey($pageKey: String!) {
    Tbl_Pages(where: { PageKey: { _eq: $pageKey } }) {
      PageGuid
      PageKey
      URL
      PlatformType
      ParentPageGuid
    }
  }
`;

/**
 * __useGetPageByKeyQuery__
 *
 * To run a query within a React component, call `useGetPageByKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPageByKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPageByKeyQuery({
 *   variables: {
 *      pageKey: // value for 'pageKey'
 *   },
 * });
 */
export function useGetPageByKeyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPageByKeyQuery,
    GetPageByKeyQueryVariables
  > &
    (
      | { variables: GetPageByKeyQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPageByKeyQuery, GetPageByKeyQueryVariables>(
    GetPageByKeyDocument,
    options
  );
}
export function useGetPageByKeyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPageByKeyQuery,
    GetPageByKeyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetPageByKeyQuery, GetPageByKeyQueryVariables>(
    GetPageByKeyDocument,
    options
  );
}
// @ts-ignore
export function useGetPageByKeySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPageByKeyQuery,
    GetPageByKeyQueryVariables
  >
): Apollo.UseSuspenseQueryResult<GetPageByKeyQuery, GetPageByKeyQueryVariables>;
export function useGetPageByKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPageByKeyQuery,
        GetPageByKeyQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPageByKeyQuery | undefined,
  GetPageByKeyQueryVariables
>;
export function useGetPageByKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPageByKeyQuery,
        GetPageByKeyQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetPageByKeyQuery, GetPageByKeyQueryVariables>(
    GetPageByKeyDocument,
    options
  );
}
export type GetPageByKeyQueryHookResult = ReturnType<
  typeof useGetPageByKeyQuery
>;
export type GetPageByKeyLazyQueryHookResult = ReturnType<
  typeof useGetPageByKeyLazyQuery
>;
export type GetPageByKeySuspenseQueryHookResult = ReturnType<
  typeof useGetPageByKeySuspenseQuery
>;
export type GetPageByKeyQueryResult = Apollo.QueryResult<
  GetPageByKeyQuery,
  GetPageByKeyQueryVariables
>;
