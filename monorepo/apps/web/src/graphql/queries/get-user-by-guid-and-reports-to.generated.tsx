import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserByGuidAndReportsToQueryVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetUserByGuidAndReportsToQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    EmailId: string;
    Password?: string | null;
    FirstName?: string | null;
    UserGuid: any;
    MobileNumber?: string | null;
  }>;
};

export const GetUserByGuidAndReportsToDocument = gql`
  query GetUserByGuidAndReportsTo($userGuid: uuid!) {
    Tbl_Users(
      where: {
        _and: [
          { UserGuid: { _eq: $userGuid } }
          { ReportsTo: { _is_null: true } }
        ]
      }
    ) {
      EmailId
      Password
      FirstName
      UserGuid
      MobileNumber
    }
  }
`;

/**
 * __useGetUserByGuidAndReportsToQuery__
 *
 * To run a query within a React component, call `useGetUserByGuidAndReportsToQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByGuidAndReportsToQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByGuidAndReportsToQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *   },
 * });
 */
export function useGetUserByGuidAndReportsToQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserByGuidAndReportsToQuery,
    GetUserByGuidAndReportsToQueryVariables
  > &
    (
      | { variables: GetUserByGuidAndReportsToQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserByGuidAndReportsToQuery,
    GetUserByGuidAndReportsToQueryVariables
  >(GetUserByGuidAndReportsToDocument, options);
}
export function useGetUserByGuidAndReportsToLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserByGuidAndReportsToQuery,
    GetUserByGuidAndReportsToQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserByGuidAndReportsToQuery,
    GetUserByGuidAndReportsToQueryVariables
  >(GetUserByGuidAndReportsToDocument, options);
}
// @ts-ignore
export function useGetUserByGuidAndReportsToSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserByGuidAndReportsToQuery,
    GetUserByGuidAndReportsToQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserByGuidAndReportsToQuery,
  GetUserByGuidAndReportsToQueryVariables
>;
export function useGetUserByGuidAndReportsToSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByGuidAndReportsToQuery,
        GetUserByGuidAndReportsToQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserByGuidAndReportsToQuery | undefined,
  GetUserByGuidAndReportsToQueryVariables
>;
export function useGetUserByGuidAndReportsToSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByGuidAndReportsToQuery,
        GetUserByGuidAndReportsToQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserByGuidAndReportsToQuery,
    GetUserByGuidAndReportsToQueryVariables
  >(GetUserByGuidAndReportsToDocument, options);
}
export type GetUserByGuidAndReportsToQueryHookResult = ReturnType<
  typeof useGetUserByGuidAndReportsToQuery
>;
export type GetUserByGuidAndReportsToLazyQueryHookResult = ReturnType<
  typeof useGetUserByGuidAndReportsToLazyQuery
>;
export type GetUserByGuidAndReportsToSuspenseQueryHookResult = ReturnType<
  typeof useGetUserByGuidAndReportsToSuspenseQuery
>;
export type GetUserByGuidAndReportsToQueryResult = Apollo.QueryResult<
  GetUserByGuidAndReportsToQuery,
  GetUserByGuidAndReportsToQueryVariables
>;
