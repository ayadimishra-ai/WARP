import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserStatusMasterByNameQueryVariables = Types.Exact<{
  status: Types.Scalars["String"]["input"];
}>;

export type GetUserStatusMasterByNameQuery = {
  __typename?: "query_root";
  Tbl_UserStatusMaster: Array<{
    __typename?: "Tbl_UserStatusMaster";
    StatusGuid: any;
    Status?: string | null;
  }>;
};

export const GetUserStatusMasterByNameDocument = gql`
  query GetUserStatusMasterByName($status: String!) {
    Tbl_UserStatusMaster(where: { Status: { _ilike: $status } }) {
      StatusGuid
      Status
    }
  }
`;

/**
 * __useGetUserStatusMasterByNameQuery__
 *
 * To run a query within a React component, call `useGetUserStatusMasterByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserStatusMasterByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserStatusMasterByNameQuery({
 *   variables: {
 *      status: // value for 'status'
 *   },
 * });
 */
export function useGetUserStatusMasterByNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserStatusMasterByNameQuery,
    GetUserStatusMasterByNameQueryVariables
  > &
    (
      | { variables: GetUserStatusMasterByNameQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserStatusMasterByNameQuery,
    GetUserStatusMasterByNameQueryVariables
  >(GetUserStatusMasterByNameDocument, options);
}
export function useGetUserStatusMasterByNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserStatusMasterByNameQuery,
    GetUserStatusMasterByNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserStatusMasterByNameQuery,
    GetUserStatusMasterByNameQueryVariables
  >(GetUserStatusMasterByNameDocument, options);
}
// @ts-ignore
export function useGetUserStatusMasterByNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserStatusMasterByNameQuery,
    GetUserStatusMasterByNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserStatusMasterByNameQuery,
  GetUserStatusMasterByNameQueryVariables
>;
export function useGetUserStatusMasterByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserStatusMasterByNameQuery,
        GetUserStatusMasterByNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserStatusMasterByNameQuery | undefined,
  GetUserStatusMasterByNameQueryVariables
>;
export function useGetUserStatusMasterByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserStatusMasterByNameQuery,
        GetUserStatusMasterByNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserStatusMasterByNameQuery,
    GetUserStatusMasterByNameQueryVariables
  >(GetUserStatusMasterByNameDocument, options);
}
export type GetUserStatusMasterByNameQueryHookResult = ReturnType<
  typeof useGetUserStatusMasterByNameQuery
>;
export type GetUserStatusMasterByNameLazyQueryHookResult = ReturnType<
  typeof useGetUserStatusMasterByNameLazyQuery
>;
export type GetUserStatusMasterByNameSuspenseQueryHookResult = ReturnType<
  typeof useGetUserStatusMasterByNameSuspenseQuery
>;
export type GetUserStatusMasterByNameQueryResult = Apollo.QueryResult<
  GetUserStatusMasterByNameQuery,
  GetUserStatusMasterByNameQueryVariables
>;
