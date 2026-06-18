import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActiveSessionsQueryVariables = Types.Exact<{
  userId: Types.Scalars["uuid"]["input"];
}>;

export type GetActiveSessionsQuery = {
  __typename?: "query_root";
  Tbl_UserSessions: Array<{
    __typename?: "Tbl_UserSessions";
    id: any;
    UserId: any;
    PlatformToken?: string | null;
    OpsToken?: string | null;
    WarpToken?: string | null;
    BrowserToken?: string | null;
    Status?: string | null;
    Metadata?: any | null;
    StatusMetadata?: any | null;
    CreatedBy?: any | null;
    CreatedDate: any;
    ModifiedBy?: any | null;
    ModifiedDate: any;
  }>;
};

export const GetActiveSessionsDocument = gql`
  query GetActiveSessions($userId: uuid!) {
    Tbl_UserSessions(
      where: { UserId: { _eq: $userId }, Status: { _eq: "Active" } }
    ) {
      id
      UserId
      PlatformToken
      OpsToken
      WarpToken
      BrowserToken
      Status
      Metadata
      StatusMetadata
      CreatedBy
      CreatedDate
      ModifiedBy
      ModifiedDate
    }
  }
`;

/**
 * __useGetActiveSessionsQuery__
 *
 * To run a query within a React component, call `useGetActiveSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveSessionsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *   },
 * });
 */
export function useGetActiveSessionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActiveSessionsQuery,
    GetActiveSessionsQueryVariables
  > &
    (
      | { variables: GetActiveSessionsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActiveSessionsQuery,
    GetActiveSessionsQueryVariables
  >(GetActiveSessionsDocument, options);
}
export function useGetActiveSessionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActiveSessionsQuery,
    GetActiveSessionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActiveSessionsQuery,
    GetActiveSessionsQueryVariables
  >(GetActiveSessionsDocument, options);
}
// @ts-ignore
export function useGetActiveSessionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActiveSessionsQuery,
    GetActiveSessionsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActiveSessionsQuery,
  GetActiveSessionsQueryVariables
>;
export function useGetActiveSessionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActiveSessionsQuery,
        GetActiveSessionsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActiveSessionsQuery | undefined,
  GetActiveSessionsQueryVariables
>;
export function useGetActiveSessionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActiveSessionsQuery,
        GetActiveSessionsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActiveSessionsQuery,
    GetActiveSessionsQueryVariables
  >(GetActiveSessionsDocument, options);
}
export type GetActiveSessionsQueryHookResult = ReturnType<
  typeof useGetActiveSessionsQuery
>;
export type GetActiveSessionsLazyQueryHookResult = ReturnType<
  typeof useGetActiveSessionsLazyQuery
>;
export type GetActiveSessionsSuspenseQueryHookResult = ReturnType<
  typeof useGetActiveSessionsSuspenseQuery
>;
export type GetActiveSessionsQueryResult = Apollo.QueryResult<
  GetActiveSessionsQuery,
  GetActiveSessionsQueryVariables
>;
