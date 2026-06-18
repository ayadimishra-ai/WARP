import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPowerBiSettingsQueryVariables = Types.Exact<{
  settingsKeys:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetPowerBiSettingsQuery = {
  __typename?: "query_root";
  Tbl_GlobalSettings: Array<{
    __typename?: "Tbl_GlobalSettings";
    SettingsKey?: string | null;
    SettingsValue?: string | null;
  }>;
};

export const GetPowerBiSettingsDocument = gql`
  query GetPowerBISettings($settingsKeys: [String!]!) {
    Tbl_GlobalSettings(where: { SettingsKey: { _in: $settingsKeys } }) {
      SettingsKey
      SettingsValue
    }
  }
`;

/**
 * __useGetPowerBiSettingsQuery__
 *
 * To run a query within a React component, call `useGetPowerBiSettingsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPowerBiSettingsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPowerBiSettingsQuery({
 *   variables: {
 *      settingsKeys: // value for 'settingsKeys'
 *   },
 * });
 */
export function useGetPowerBiSettingsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPowerBiSettingsQuery,
    GetPowerBiSettingsQueryVariables
  > &
    (
      | { variables: GetPowerBiSettingsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPowerBiSettingsQuery,
    GetPowerBiSettingsQueryVariables
  >(GetPowerBiSettingsDocument, options);
}
export function useGetPowerBiSettingsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPowerBiSettingsQuery,
    GetPowerBiSettingsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPowerBiSettingsQuery,
    GetPowerBiSettingsQueryVariables
  >(GetPowerBiSettingsDocument, options);
}
// @ts-ignore
export function useGetPowerBiSettingsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPowerBiSettingsQuery,
    GetPowerBiSettingsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPowerBiSettingsQuery,
  GetPowerBiSettingsQueryVariables
>;
export function useGetPowerBiSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPowerBiSettingsQuery,
        GetPowerBiSettingsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPowerBiSettingsQuery | undefined,
  GetPowerBiSettingsQueryVariables
>;
export function useGetPowerBiSettingsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPowerBiSettingsQuery,
        GetPowerBiSettingsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPowerBiSettingsQuery,
    GetPowerBiSettingsQueryVariables
  >(GetPowerBiSettingsDocument, options);
}
export type GetPowerBiSettingsQueryHookResult = ReturnType<
  typeof useGetPowerBiSettingsQuery
>;
export type GetPowerBiSettingsLazyQueryHookResult = ReturnType<
  typeof useGetPowerBiSettingsLazyQuery
>;
export type GetPowerBiSettingsSuspenseQueryHookResult = ReturnType<
  typeof useGetPowerBiSettingsSuspenseQuery
>;
export type GetPowerBiSettingsQueryResult = Apollo.QueryResult<
  GetPowerBiSettingsQuery,
  GetPowerBiSettingsQueryVariables
>;
