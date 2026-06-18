import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetGlobalSettingByKeyQueryVariables = Types.Exact<{
  settingsKey: Types.Scalars["String"]["input"];
}>;

export type GetGlobalSettingByKeyQuery = {
  __typename?: "query_root";
  Tbl_GlobalSettings: Array<{
    __typename?: "Tbl_GlobalSettings";
    GlobalSettingsGuid: any;
    SettingsKey?: string | null;
    SettingsValue?: string | null;
    IsSuperAdminSetting?: boolean | null;
  }>;
};

export const GetGlobalSettingByKeyDocument = gql`
  query GetGlobalSettingByKey($settingsKey: String!) {
    Tbl_GlobalSettings(where: { SettingsKey: { _eq: $settingsKey } }) {
      GlobalSettingsGuid
      SettingsKey
      SettingsValue
      IsSuperAdminSetting
    }
  }
`;

/**
 * __useGetGlobalSettingByKeyQuery__
 *
 * To run a query within a React component, call `useGetGlobalSettingByKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetGlobalSettingByKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetGlobalSettingByKeyQuery({
 *   variables: {
 *      settingsKey: // value for 'settingsKey'
 *   },
 * });
 */
export function useGetGlobalSettingByKeyQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetGlobalSettingByKeyQuery,
    GetGlobalSettingByKeyQueryVariables
  > &
    (
      | { variables: GetGlobalSettingByKeyQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetGlobalSettingByKeyQuery,
    GetGlobalSettingByKeyQueryVariables
  >(GetGlobalSettingByKeyDocument, options);
}
export function useGetGlobalSettingByKeyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetGlobalSettingByKeyQuery,
    GetGlobalSettingByKeyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetGlobalSettingByKeyQuery,
    GetGlobalSettingByKeyQueryVariables
  >(GetGlobalSettingByKeyDocument, options);
}
// @ts-ignore
export function useGetGlobalSettingByKeySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetGlobalSettingByKeyQuery,
    GetGlobalSettingByKeyQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetGlobalSettingByKeyQuery,
  GetGlobalSettingByKeyQueryVariables
>;
export function useGetGlobalSettingByKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGlobalSettingByKeyQuery,
        GetGlobalSettingByKeyQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetGlobalSettingByKeyQuery | undefined,
  GetGlobalSettingByKeyQueryVariables
>;
export function useGetGlobalSettingByKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetGlobalSettingByKeyQuery,
        GetGlobalSettingByKeyQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetGlobalSettingByKeyQuery,
    GetGlobalSettingByKeyQueryVariables
  >(GetGlobalSettingByKeyDocument, options);
}
export type GetGlobalSettingByKeyQueryHookResult = ReturnType<
  typeof useGetGlobalSettingByKeyQuery
>;
export type GetGlobalSettingByKeyLazyQueryHookResult = ReturnType<
  typeof useGetGlobalSettingByKeyLazyQuery
>;
export type GetGlobalSettingByKeySuspenseQueryHookResult = ReturnType<
  typeof useGetGlobalSettingByKeySuspenseQuery
>;
export type GetGlobalSettingByKeyQueryResult = Apollo.QueryResult<
  GetGlobalSettingByKeyQuery,
  GetGlobalSettingByKeyQueryVariables
>;
