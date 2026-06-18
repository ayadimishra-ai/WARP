import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserPermissionsByUserAndPermissionGuidQueryVariables =
  Types.Exact<{
    userGuid: Types.Scalars["uuid"]["input"];
    permissionGuids:
      | Array<Types.Scalars["uuid"]["input"]>
      | Types.Scalars["uuid"]["input"];
  }>;

export type GetUserPermissionsByUserAndPermissionGuidQuery = {
  __typename?: "query_root";
  Tbl_UserPermissions: Array<{
    __typename?: "Tbl_UserPermissions";
    UserPermissionGuid: any;
    UserGuid?: any | null;
    PermissionGuid: any;
    Rights: any;
  }>;
};

export const GetUserPermissionsByUserAndPermissionGuidDocument = gql`
  query GetUserPermissionsByUserAndPermissionGuid(
    $userGuid: uuid!
    $permissionGuids: [uuid!]!
  ) {
    Tbl_UserPermissions(
      where: {
        UserGuid: { _eq: $userGuid }
        PermissionGuid: { _in: $permissionGuids }
      }
    ) {
      UserPermissionGuid
      UserGuid
      PermissionGuid
      Rights
    }
  }
`;

/**
 * __useGetUserPermissionsByUserAndPermissionGuidQuery__
 *
 * To run a query within a React component, call `useGetUserPermissionsByUserAndPermissionGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserPermissionsByUserAndPermissionGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserPermissionsByUserAndPermissionGuidQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      permissionGuids: // value for 'permissionGuids'
 *   },
 * });
 */
export function useGetUserPermissionsByUserAndPermissionGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserPermissionsByUserAndPermissionGuidQuery,
    GetUserPermissionsByUserAndPermissionGuidQueryVariables
  > &
    (
      | {
          variables: GetUserPermissionsByUserAndPermissionGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserPermissionsByUserAndPermissionGuidQuery,
    GetUserPermissionsByUserAndPermissionGuidQueryVariables
  >(GetUserPermissionsByUserAndPermissionGuidDocument, options);
}
export function useGetUserPermissionsByUserAndPermissionGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserPermissionsByUserAndPermissionGuidQuery,
    GetUserPermissionsByUserAndPermissionGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserPermissionsByUserAndPermissionGuidQuery,
    GetUserPermissionsByUserAndPermissionGuidQueryVariables
  >(GetUserPermissionsByUserAndPermissionGuidDocument, options);
}
// @ts-ignore
export function useGetUserPermissionsByUserAndPermissionGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserPermissionsByUserAndPermissionGuidQuery,
    GetUserPermissionsByUserAndPermissionGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserPermissionsByUserAndPermissionGuidQuery,
  GetUserPermissionsByUserAndPermissionGuidQueryVariables
>;
export function useGetUserPermissionsByUserAndPermissionGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserPermissionsByUserAndPermissionGuidQuery,
        GetUserPermissionsByUserAndPermissionGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserPermissionsByUserAndPermissionGuidQuery | undefined,
  GetUserPermissionsByUserAndPermissionGuidQueryVariables
>;
export function useGetUserPermissionsByUserAndPermissionGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserPermissionsByUserAndPermissionGuidQuery,
        GetUserPermissionsByUserAndPermissionGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserPermissionsByUserAndPermissionGuidQuery,
    GetUserPermissionsByUserAndPermissionGuidQueryVariables
  >(GetUserPermissionsByUserAndPermissionGuidDocument, options);
}
export type GetUserPermissionsByUserAndPermissionGuidQueryHookResult =
  ReturnType<typeof useGetUserPermissionsByUserAndPermissionGuidQuery>;
export type GetUserPermissionsByUserAndPermissionGuidLazyQueryHookResult =
  ReturnType<typeof useGetUserPermissionsByUserAndPermissionGuidLazyQuery>;
export type GetUserPermissionsByUserAndPermissionGuidSuspenseQueryHookResult =
  ReturnType<typeof useGetUserPermissionsByUserAndPermissionGuidSuspenseQuery>;
export type GetUserPermissionsByUserAndPermissionGuidQueryResult =
  Apollo.QueryResult<
    GetUserPermissionsByUserAndPermissionGuidQuery,
    GetUserPermissionsByUserAndPermissionGuidQueryVariables
  >;
