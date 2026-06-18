import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserPermissionsByUserGuidQueryVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetUserPermissionsByUserGuidQuery = {
  __typename?: "query_root";
  Tbl_UserPermissions: Array<{
    __typename?: "Tbl_UserPermissions";
    UserPermissionGuid: any;
    PermissionGuid: any;
    UserGuid?: any | null;
    Rights: any;
  }>;
};

export const GetUserPermissionsByUserGuidDocument = gql`
  query getUserPermissionsByUserGuid($userGuid: uuid!) {
    Tbl_UserPermissions(where: { UserGuid: { _eq: $userGuid } }) {
      UserPermissionGuid
      PermissionGuid
      UserGuid
      Rights
    }
  }
`;

/**
 * __useGetUserPermissionsByUserGuidQuery__
 *
 * To run a query within a React component, call `useGetUserPermissionsByUserGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserPermissionsByUserGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserPermissionsByUserGuidQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *   },
 * });
 */
export function useGetUserPermissionsByUserGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserPermissionsByUserGuidQuery,
    GetUserPermissionsByUserGuidQueryVariables
  > &
    (
      | {
          variables: GetUserPermissionsByUserGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserPermissionsByUserGuidQuery,
    GetUserPermissionsByUserGuidQueryVariables
  >(GetUserPermissionsByUserGuidDocument, options);
}
export function useGetUserPermissionsByUserGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserPermissionsByUserGuidQuery,
    GetUserPermissionsByUserGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserPermissionsByUserGuidQuery,
    GetUserPermissionsByUserGuidQueryVariables
  >(GetUserPermissionsByUserGuidDocument, options);
}
// @ts-ignore
export function useGetUserPermissionsByUserGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserPermissionsByUserGuidQuery,
    GetUserPermissionsByUserGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserPermissionsByUserGuidQuery,
  GetUserPermissionsByUserGuidQueryVariables
>;
export function useGetUserPermissionsByUserGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserPermissionsByUserGuidQuery,
        GetUserPermissionsByUserGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserPermissionsByUserGuidQuery | undefined,
  GetUserPermissionsByUserGuidQueryVariables
>;
export function useGetUserPermissionsByUserGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserPermissionsByUserGuidQuery,
        GetUserPermissionsByUserGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserPermissionsByUserGuidQuery,
    GetUserPermissionsByUserGuidQueryVariables
  >(GetUserPermissionsByUserGuidDocument, options);
}
export type GetUserPermissionsByUserGuidQueryHookResult = ReturnType<
  typeof useGetUserPermissionsByUserGuidQuery
>;
export type GetUserPermissionsByUserGuidLazyQueryHookResult = ReturnType<
  typeof useGetUserPermissionsByUserGuidLazyQuery
>;
export type GetUserPermissionsByUserGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetUserPermissionsByUserGuidSuspenseQuery
>;
export type GetUserPermissionsByUserGuidQueryResult = Apollo.QueryResult<
  GetUserPermissionsByUserGuidQuery,
  GetUserPermissionsByUserGuidQueryVariables
>;
