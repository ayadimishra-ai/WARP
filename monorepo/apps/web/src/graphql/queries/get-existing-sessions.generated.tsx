import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetExistingSessionsQueryVariables = Types.Exact<{
  userId: Types.Scalars["uuid"]["input"];
  browserToken?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetExistingSessionsQuery = {
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

export const GetExistingSessionsDocument = gql`
  query GetExistingSessions($userId: uuid!, $browserToken: String) {
    Tbl_UserSessions(
      where: { UserId: { _eq: $userId }, BrowserToken: { _eq: $browserToken } }
      order_by: { ModifiedDate: desc }
      limit: 1
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
 * __useGetExistingSessionsQuery__
 *
 * To run a query within a React component, call `useGetExistingSessionsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetExistingSessionsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetExistingSessionsQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      browserToken: // value for 'browserToken'
 *   },
 * });
 */
export function useGetExistingSessionsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetExistingSessionsQuery,
    GetExistingSessionsQueryVariables
  > &
    (
      | { variables: GetExistingSessionsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetExistingSessionsQuery,
    GetExistingSessionsQueryVariables
  >(GetExistingSessionsDocument, options);
}
export function useGetExistingSessionsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetExistingSessionsQuery,
    GetExistingSessionsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetExistingSessionsQuery,
    GetExistingSessionsQueryVariables
  >(GetExistingSessionsDocument, options);
}
// @ts-ignore
export function useGetExistingSessionsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetExistingSessionsQuery,
    GetExistingSessionsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetExistingSessionsQuery,
  GetExistingSessionsQueryVariables
>;
export function useGetExistingSessionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetExistingSessionsQuery,
        GetExistingSessionsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetExistingSessionsQuery | undefined,
  GetExistingSessionsQueryVariables
>;
export function useGetExistingSessionsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetExistingSessionsQuery,
        GetExistingSessionsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetExistingSessionsQuery,
    GetExistingSessionsQueryVariables
  >(GetExistingSessionsDocument, options);
}
export type GetExistingSessionsQueryHookResult = ReturnType<
  typeof useGetExistingSessionsQuery
>;
export type GetExistingSessionsLazyQueryHookResult = ReturnType<
  typeof useGetExistingSessionsLazyQuery
>;
export type GetExistingSessionsSuspenseQueryHookResult = ReturnType<
  typeof useGetExistingSessionsSuspenseQuery
>;
export type GetExistingSessionsQueryResult = Apollo.QueryResult<
  GetExistingSessionsQuery,
  GetExistingSessionsQueryVariables
>;
