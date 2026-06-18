import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetActiveSessionsByBrowserTokenQueryVariables = Types.Exact<{
  userId: Types.Scalars["uuid"]["input"];
  browserToken: Types.Scalars["String"]["input"];
}>;

export type GetActiveSessionsByBrowserTokenQuery = {
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

export const GetActiveSessionsByBrowserTokenDocument = gql`
  query GetActiveSessionsByBrowserToken(
    $userId: uuid!
    $browserToken: String!
  ) {
    Tbl_UserSessions(
      where: {
        UserId: { _eq: $userId }
        Status: { _eq: "Active" }
        BrowserToken: { _eq: $browserToken }
      }
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
 * __useGetActiveSessionsByBrowserTokenQuery__
 *
 * To run a query within a React component, call `useGetActiveSessionsByBrowserTokenQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetActiveSessionsByBrowserTokenQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetActiveSessionsByBrowserTokenQuery({
 *   variables: {
 *      userId: // value for 'userId'
 *      browserToken: // value for 'browserToken'
 *   },
 * });
 */
export function useGetActiveSessionsByBrowserTokenQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetActiveSessionsByBrowserTokenQuery,
    GetActiveSessionsByBrowserTokenQueryVariables
  > &
    (
      | {
          variables: GetActiveSessionsByBrowserTokenQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetActiveSessionsByBrowserTokenQuery,
    GetActiveSessionsByBrowserTokenQueryVariables
  >(GetActiveSessionsByBrowserTokenDocument, options);
}
export function useGetActiveSessionsByBrowserTokenLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetActiveSessionsByBrowserTokenQuery,
    GetActiveSessionsByBrowserTokenQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetActiveSessionsByBrowserTokenQuery,
    GetActiveSessionsByBrowserTokenQueryVariables
  >(GetActiveSessionsByBrowserTokenDocument, options);
}
// @ts-ignore
export function useGetActiveSessionsByBrowserTokenSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetActiveSessionsByBrowserTokenQuery,
    GetActiveSessionsByBrowserTokenQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetActiveSessionsByBrowserTokenQuery,
  GetActiveSessionsByBrowserTokenQueryVariables
>;
export function useGetActiveSessionsByBrowserTokenSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActiveSessionsByBrowserTokenQuery,
        GetActiveSessionsByBrowserTokenQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetActiveSessionsByBrowserTokenQuery | undefined,
  GetActiveSessionsByBrowserTokenQueryVariables
>;
export function useGetActiveSessionsByBrowserTokenSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetActiveSessionsByBrowserTokenQuery,
        GetActiveSessionsByBrowserTokenQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetActiveSessionsByBrowserTokenQuery,
    GetActiveSessionsByBrowserTokenQueryVariables
  >(GetActiveSessionsByBrowserTokenDocument, options);
}
export type GetActiveSessionsByBrowserTokenQueryHookResult = ReturnType<
  typeof useGetActiveSessionsByBrowserTokenQuery
>;
export type GetActiveSessionsByBrowserTokenLazyQueryHookResult = ReturnType<
  typeof useGetActiveSessionsByBrowserTokenLazyQuery
>;
export type GetActiveSessionsByBrowserTokenSuspenseQueryHookResult = ReturnType<
  typeof useGetActiveSessionsByBrowserTokenSuspenseQuery
>;
export type GetActiveSessionsByBrowserTokenQueryResult = Apollo.QueryResult<
  GetActiveSessionsByBrowserTokenQuery,
  GetActiveSessionsByBrowserTokenQueryVariables
>;
