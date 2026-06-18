import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetLanguageResourcesDataQueryVariables = Types.Exact<{
  pageKey?: Types.InputMaybe<
    Array<Types.Scalars["String"]["input"]> | Types.Scalars["String"]["input"]
  >;
}>;

export type GetLanguageResourcesDataQuery = {
  __typename?: "query_root";
  Tbl_LanguageResources: Array<{
    __typename?: "Tbl_LanguageResources";
    LanguageResourceGuid: any;
    PageKey?: string | null;
    ResourceKey?: string | null;
    ResourceValue?: string | null;
    LanguageGuid?: any | null;
    IsActive?: boolean | null;
    CreatedDate?: any | null;
  }>;
};

export const GetLanguageResourcesDataDocument = gql`
  query GetLanguageResourcesData($pageKey: [String!]) {
    Tbl_LanguageResources(
      where: { IsActive: { _eq: true }, PageKey: { _in: $pageKey } }
    ) {
      LanguageResourceGuid
      PageKey
      ResourceKey
      ResourceValue
      LanguageGuid
      IsActive
      CreatedDate
    }
  }
`;

/**
 * __useGetLanguageResourcesDataQuery__
 *
 * To run a query within a React component, call `useGetLanguageResourcesDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetLanguageResourcesDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetLanguageResourcesDataQuery({
 *   variables: {
 *      pageKey: // value for 'pageKey'
 *   },
 * });
 */
export function useGetLanguageResourcesDataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetLanguageResourcesDataQuery,
    GetLanguageResourcesDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetLanguageResourcesDataQuery,
    GetLanguageResourcesDataQueryVariables
  >(GetLanguageResourcesDataDocument, options);
}
export function useGetLanguageResourcesDataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetLanguageResourcesDataQuery,
    GetLanguageResourcesDataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetLanguageResourcesDataQuery,
    GetLanguageResourcesDataQueryVariables
  >(GetLanguageResourcesDataDocument, options);
}
// @ts-ignore
export function useGetLanguageResourcesDataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetLanguageResourcesDataQuery,
    GetLanguageResourcesDataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetLanguageResourcesDataQuery,
  GetLanguageResourcesDataQueryVariables
>;
export function useGetLanguageResourcesDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLanguageResourcesDataQuery,
        GetLanguageResourcesDataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetLanguageResourcesDataQuery | undefined,
  GetLanguageResourcesDataQueryVariables
>;
export function useGetLanguageResourcesDataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetLanguageResourcesDataQuery,
        GetLanguageResourcesDataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetLanguageResourcesDataQuery,
    GetLanguageResourcesDataQueryVariables
  >(GetLanguageResourcesDataDocument, options);
}
export type GetLanguageResourcesDataQueryHookResult = ReturnType<
  typeof useGetLanguageResourcesDataQuery
>;
export type GetLanguageResourcesDataLazyQueryHookResult = ReturnType<
  typeof useGetLanguageResourcesDataLazyQuery
>;
export type GetLanguageResourcesDataSuspenseQueryHookResult = ReturnType<
  typeof useGetLanguageResourcesDataSuspenseQuery
>;
export type GetLanguageResourcesDataQueryResult = Apollo.QueryResult<
  GetLanguageResourcesDataQuery,
  GetLanguageResourcesDataQueryVariables
>;
