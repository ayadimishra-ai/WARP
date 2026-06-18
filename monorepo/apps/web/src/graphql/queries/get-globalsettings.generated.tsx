import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGlobalSettingsQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetGlobalSettingsQuery = {
  __typename?: "query_root";
  Tbl_GlobalSettings: Array<{
    __typename?: "Tbl_GlobalSettings";
    GlobalSettingsGuid: any;
    SettingsKey?: string | null;
    SettingsValue?: string | null;
  }>;
};

export const GetGlobalSettingsDocument = gql`
  query GetGlobalSettings {
    Tbl_GlobalSettings {
      GlobalSettingsGuid
      SettingsKey
      SettingsValue
    }
  }
`;

/**
 * __useGetGlobalSettingsQuery__
 *
 * To run a query within a React component, call `useGetGlobalSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalSettingsQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetGlobalSettingsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetGlobalSettingsQuery,
    GetGlobalSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGlobalSettingsQuery,
    GetGlobalSettingsQueryVariables
  >(GetGlobalSettingsDocument, options);
}
export function useGetGlobalSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGlobalSettingsQuery,
    GetGlobalSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGlobalSettingsQuery,
    GetGlobalSettingsQueryVariables
  >(GetGlobalSettingsDocument, options);
}
// @ts-ignore
export function useGetGlobalSettingsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGlobalSettingsQuery,
    GetGlobalSettingsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGlobalSettingsQuery,
  GetGlobalSettingsQueryVariables
>;
export function useGetGlobalSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGlobalSettingsQuery,
        GetGlobalSettingsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGlobalSettingsQuery | undefined,
  GetGlobalSettingsQueryVariables
>;
export function useGetGlobalSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGlobalSettingsQuery,
        GetGlobalSettingsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGlobalSettingsQuery,
    GetGlobalSettingsQueryVariables
  >(GetGlobalSettingsDocument, options);
}
export type GetGlobalSettingsQueryHookResult = ReturnType<
  typeof useGetGlobalSettingsQuery
>;
export type GetGlobalSettingsLazyQueryHookResult = ReturnType<
  typeof useGetGlobalSettingsLazyQuery
>;
export type GetGlobalSettingsSuspenseQueryHookResult = ReturnType<
  typeof useGetGlobalSettingsSuspenseQuery
>;
export type GetGlobalSettingsQueryResult = Apollo.QueryResult<
  GetGlobalSettingsQuery,
  GetGlobalSettingsQueryVariables
>;
