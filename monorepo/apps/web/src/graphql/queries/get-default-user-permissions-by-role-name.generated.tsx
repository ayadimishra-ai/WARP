import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetDefaultUserPermissionsByRoleNameQueryVariables = Types.Exact<{
  roleName?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetDefaultUserPermissionsByRoleNameQuery = {
  __typename?: "query_root";
  Tbl_Permissions: Array<{
    __typename?: "Tbl_Permissions";
    PermissionGuid: any;
    PageGuid: any;
    RoleGuid: any;
    is_default: boolean;
    workflow_key: any;
  }>;
};

export const GetDefaultUserPermissionsByRoleNameDocument = gql`
  query getDefaultUserPermissionsByRoleName($roleName: String) {
    Tbl_Permissions(
      where: {
        Tbl_Role: { RoleName: { _ilike: $roleName } }
        is_default: { _eq: true }
      }
    ) {
      PermissionGuid
      PageGuid
      RoleGuid
      is_default
      workflow_key
    }
  }
`;

/**
 * __useGetDefaultUserPermissionsByRoleNameQuery__
 *
 * To run a query within a React component, call `useGetDefaultUserPermissionsByRoleNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetDefaultUserPermissionsByRoleNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetDefaultUserPermissionsByRoleNameQuery({
 *   variables: {
 *      roleName: // value for 'roleName'
 *   },
 * });
 */
export function useGetDefaultUserPermissionsByRoleNameQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetDefaultUserPermissionsByRoleNameQuery,
    GetDefaultUserPermissionsByRoleNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetDefaultUserPermissionsByRoleNameQuery,
    GetDefaultUserPermissionsByRoleNameQueryVariables
  >(GetDefaultUserPermissionsByRoleNameDocument, options);
}
export function useGetDefaultUserPermissionsByRoleNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetDefaultUserPermissionsByRoleNameQuery,
    GetDefaultUserPermissionsByRoleNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetDefaultUserPermissionsByRoleNameQuery,
    GetDefaultUserPermissionsByRoleNameQueryVariables
  >(GetDefaultUserPermissionsByRoleNameDocument, options);
}
// @ts-ignore
export function useGetDefaultUserPermissionsByRoleNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetDefaultUserPermissionsByRoleNameQuery,
    GetDefaultUserPermissionsByRoleNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetDefaultUserPermissionsByRoleNameQuery,
  GetDefaultUserPermissionsByRoleNameQueryVariables
>;
export function useGetDefaultUserPermissionsByRoleNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetDefaultUserPermissionsByRoleNameQuery,
        GetDefaultUserPermissionsByRoleNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetDefaultUserPermissionsByRoleNameQuery | undefined,
  GetDefaultUserPermissionsByRoleNameQueryVariables
>;
export function useGetDefaultUserPermissionsByRoleNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetDefaultUserPermissionsByRoleNameQuery,
        GetDefaultUserPermissionsByRoleNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetDefaultUserPermissionsByRoleNameQuery,
    GetDefaultUserPermissionsByRoleNameQueryVariables
  >(GetDefaultUserPermissionsByRoleNameDocument, options);
}
export type GetDefaultUserPermissionsByRoleNameQueryHookResult = ReturnType<
  typeof useGetDefaultUserPermissionsByRoleNameQuery
>;
export type GetDefaultUserPermissionsByRoleNameLazyQueryHookResult = ReturnType<
  typeof useGetDefaultUserPermissionsByRoleNameLazyQuery
>;
export type GetDefaultUserPermissionsByRoleNameSuspenseQueryHookResult =
  ReturnType<typeof useGetDefaultUserPermissionsByRoleNameSuspenseQuery>;
export type GetDefaultUserPermissionsByRoleNameQueryResult = Apollo.QueryResult<
  GetDefaultUserPermissionsByRoleNameQuery,
  GetDefaultUserPermissionsByRoleNameQueryVariables
>;
