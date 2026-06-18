import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGlobalSettingsDataBySettingsKeyQueryVariables = Types.Exact<{
  SettingsKey?: Types.InputMaybe<
    Array<Types.Scalars["String"]["input"]> | Types.Scalars["String"]["input"]
  >;
}>;

export type GetGlobalSettingsDataBySettingsKeyQuery = {
  __typename?: "query_root";
  Tbl_GlobalSettings: Array<{
    __typename?: "Tbl_GlobalSettings";
    GlobalSettingsGuid: any;
    SettingsKey?: string | null;
    SettingsValue?: string | null;
  }>;
};

export const GetGlobalSettingsDataBySettingsKeyDocument = gql`
  query GetGlobalSettingsDataBySettingsKey($SettingsKey: [String!]) {
    Tbl_GlobalSettings(where: { SettingsKey: { _in: $SettingsKey } }) {
      GlobalSettingsGuid
      SettingsKey
      SettingsValue
    }
  }
`;

/**
 * __useGetGlobalSettingsDataBySettingsKeyQuery__
 *
 * To run a query within a React component, call `useGetGlobalSettingsDataBySettingsKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalSettingsDataBySettingsKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalSettingsDataBySettingsKeyQuery({
 *   variables: {
 *      SettingsKey: // value for 'SettingsKey'
 *   },
 * });
 */
export function useGetGlobalSettingsDataBySettingsKeyQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetGlobalSettingsDataBySettingsKeyQuery,
    GetGlobalSettingsDataBySettingsKeyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGlobalSettingsDataBySettingsKeyQuery,
    GetGlobalSettingsDataBySettingsKeyQueryVariables
  >(GetGlobalSettingsDataBySettingsKeyDocument, options);
}
export function useGetGlobalSettingsDataBySettingsKeyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGlobalSettingsDataBySettingsKeyQuery,
    GetGlobalSettingsDataBySettingsKeyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGlobalSettingsDataBySettingsKeyQuery,
    GetGlobalSettingsDataBySettingsKeyQueryVariables
  >(GetGlobalSettingsDataBySettingsKeyDocument, options);
}
// @ts-ignore
export function useGetGlobalSettingsDataBySettingsKeySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGlobalSettingsDataBySettingsKeyQuery,
    GetGlobalSettingsDataBySettingsKeyQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGlobalSettingsDataBySettingsKeyQuery,
  GetGlobalSettingsDataBySettingsKeyQueryVariables
>;
export function useGetGlobalSettingsDataBySettingsKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGlobalSettingsDataBySettingsKeyQuery,
        GetGlobalSettingsDataBySettingsKeyQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGlobalSettingsDataBySettingsKeyQuery | undefined,
  GetGlobalSettingsDataBySettingsKeyQueryVariables
>;
export function useGetGlobalSettingsDataBySettingsKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGlobalSettingsDataBySettingsKeyQuery,
        GetGlobalSettingsDataBySettingsKeyQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGlobalSettingsDataBySettingsKeyQuery,
    GetGlobalSettingsDataBySettingsKeyQueryVariables
  >(GetGlobalSettingsDataBySettingsKeyDocument, options);
}
export type GetGlobalSettingsDataBySettingsKeyQueryHookResult = ReturnType<
  typeof useGetGlobalSettingsDataBySettingsKeyQuery
>;
export type GetGlobalSettingsDataBySettingsKeyLazyQueryHookResult = ReturnType<
  typeof useGetGlobalSettingsDataBySettingsKeyLazyQuery
>;
export type GetGlobalSettingsDataBySettingsKeySuspenseQueryHookResult =
  ReturnType<typeof useGetGlobalSettingsDataBySettingsKeySuspenseQuery>;
export type GetGlobalSettingsDataBySettingsKeyQueryResult = Apollo.QueryResult<
  GetGlobalSettingsDataBySettingsKeyQuery,
  GetGlobalSettingsDataBySettingsKeyQueryVariables
>;
