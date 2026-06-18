import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSmtpDetailQueryVariables = Types.Exact<{ [key: string]: never }>;

export type GetSmtpDetailQuery = {
  __typename?: "query_root";
  Tbl_GlobalSettings: Array<{
    __typename?: "Tbl_GlobalSettings";
    SettingsKey?: string | null;
    SettingsValue?: string | null;
  }>;
};

export const GetSmtpDetailDocument = gql`
  query GetSMTPDetail {
    Tbl_GlobalSettings(where: { SettingsKey: { _like: "%SMTP%" } }) {
      SettingsKey
      SettingsValue
    }
  }
`;

/**
 * __useGetSmtpDetailQuery__
 *
 * To run a query within a React component, call `useGetSmtpDetailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSmtpDetailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSmtpDetailQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetSmtpDetailQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetSmtpDetailQuery,
    GetSmtpDetailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetSmtpDetailQuery, GetSmtpDetailQueryVariables>(
    GetSmtpDetailDocument,
    options
  );
}
export function useGetSmtpDetailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSmtpDetailQuery,
    GetSmtpDetailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetSmtpDetailQuery, GetSmtpDetailQueryVariables>(
    GetSmtpDetailDocument,
    options
  );
}
// @ts-ignore
export function useGetSmtpDetailSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSmtpDetailQuery,
    GetSmtpDetailQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSmtpDetailQuery,
  GetSmtpDetailQueryVariables
>;
export function useGetSmtpDetailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSmtpDetailQuery,
        GetSmtpDetailQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSmtpDetailQuery | undefined,
  GetSmtpDetailQueryVariables
>;
export function useGetSmtpDetailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSmtpDetailQuery,
        GetSmtpDetailQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSmtpDetailQuery,
    GetSmtpDetailQueryVariables
  >(GetSmtpDetailDocument, options);
}
export type GetSmtpDetailQueryHookResult = ReturnType<
  typeof useGetSmtpDetailQuery
>;
export type GetSmtpDetailLazyQueryHookResult = ReturnType<
  typeof useGetSmtpDetailLazyQuery
>;
export type GetSmtpDetailSuspenseQueryHookResult = ReturnType<
  typeof useGetSmtpDetailSuspenseQuery
>;
export type GetSmtpDetailQueryResult = Apollo.QueryResult<
  GetSmtpDetailQuery,
  GetSmtpDetailQueryVariables
>;
