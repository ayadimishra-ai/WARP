import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOrganizationSecretKeyQueryVariables = Types.Exact<{
  [key: string]: never;
}>;

export type GetOrganizationSecretKeyQuery = {
  __typename?: "query_root";
  AppGlobalMaster: Array<{
    __typename?: "AppGlobalMaster";
    key: string;
    data: any;
  }>;
};

export const GetOrganizationSecretKeyDocument = gql`
  query getOrganizationSecretKey {
    AppGlobalMaster(
      where: {
        _and: [
          { type: { _eq: "organization-config" } }
          { sub_type: { _eq: "secret-key" } }
          { key: { _eq: "ce25acad-8602-4c9f-9365-ebf4ac2d5a8e" } }
        ]
      }
    ) {
      key
      data
    }
  }
`;

/**
 * __useGetOrganizationSecretKeyQuery__
 *
 * To run a query within a React component, call `useGetOrganizationSecretKeyQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOrganizationSecretKeyQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOrganizationSecretKeyQuery({
 *   variables: {
 *   },
 * });
 */
export function useGetOrganizationSecretKeyQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetOrganizationSecretKeyQuery,
    GetOrganizationSecretKeyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOrganizationSecretKeyQuery,
    GetOrganizationSecretKeyQueryVariables
  >(GetOrganizationSecretKeyDocument, options);
}
export function useGetOrganizationSecretKeyLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOrganizationSecretKeyQuery,
    GetOrganizationSecretKeyQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOrganizationSecretKeyQuery,
    GetOrganizationSecretKeyQueryVariables
  >(GetOrganizationSecretKeyDocument, options);
}
// @ts-ignore
export function useGetOrganizationSecretKeySuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOrganizationSecretKeyQuery,
    GetOrganizationSecretKeyQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationSecretKeyQuery,
  GetOrganizationSecretKeyQueryVariables
>;
export function useGetOrganizationSecretKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationSecretKeyQuery,
        GetOrganizationSecretKeyQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetOrganizationSecretKeyQuery | undefined,
  GetOrganizationSecretKeyQueryVariables
>;
export function useGetOrganizationSecretKeySuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOrganizationSecretKeyQuery,
        GetOrganizationSecretKeyQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOrganizationSecretKeyQuery,
    GetOrganizationSecretKeyQueryVariables
  >(GetOrganizationSecretKeyDocument, options);
}
export type GetOrganizationSecretKeyQueryHookResult = ReturnType<
  typeof useGetOrganizationSecretKeyQuery
>;
export type GetOrganizationSecretKeyLazyQueryHookResult = ReturnType<
  typeof useGetOrganizationSecretKeyLazyQuery
>;
export type GetOrganizationSecretKeySuspenseQueryHookResult = ReturnType<
  typeof useGetOrganizationSecretKeySuspenseQuery
>;
export type GetOrganizationSecretKeyQueryResult = Apollo.QueryResult<
  GetOrganizationSecretKeyQuery,
  GetOrganizationSecretKeyQueryVariables
>;
