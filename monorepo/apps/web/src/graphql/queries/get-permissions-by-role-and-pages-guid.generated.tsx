import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPermissionsByRoleAndPagesGuidQueryVariables = Types.Exact<{
  roleGuid: Types.Scalars["uuid"]["input"];
  pageGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetPermissionsByRoleAndPagesGuidQuery = {
  __typename?: "query_root";
  Tbl_Permissions: Array<{
    __typename?: "Tbl_Permissions";
    PermissionGuid: any;
    RoleGuid: any;
    PageGuid: any;
    IsActive?: boolean | null;
    CreatedDate?: any | null;
    Tbl_Page: {
      __typename?: "Tbl_Pages";
      PageKey: string;
      URL?: string | null;
      ParentPageGuid?: any | null;
    };
    Tbl_Role: {
      __typename?: "Tbl_Roles";
      RoleGuid: any;
      RoleName: string;
      IsActive: boolean;
    };
  }>;
};

export const GetPermissionsByRoleAndPagesGuidDocument = gql`
  query GetPermissionsByRoleAndPagesGuid($roleGuid: uuid!, $pageGuid: uuid!) {
    Tbl_Permissions(
      where: {
        RoleGuid: { _eq: $roleGuid }
        PageGuid: { _eq: $pageGuid }
        IsActive: { _eq: true }
      }
    ) {
      PermissionGuid
      RoleGuid
      PageGuid
      IsActive
      CreatedDate
      Tbl_Page {
        PageKey
        URL
        ParentPageGuid
      }
      Tbl_Role {
        RoleGuid
        RoleName
        IsActive
      }
    }
  }
`;

/**
 * __useGetPermissionsByRoleAndPagesGuidQuery__
 *
 * To run a query within a React component, call `useGetPermissionsByRoleAndPagesGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPermissionsByRoleAndPagesGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPermissionsByRoleAndPagesGuidQuery({
 *   variables: {
 *      roleGuid: // value for 'roleGuid'
 *      pageGuid: // value for 'pageGuid'
 *   },
 * });
 */
export function useGetPermissionsByRoleAndPagesGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPermissionsByRoleAndPagesGuidQuery,
    GetPermissionsByRoleAndPagesGuidQueryVariables
  > &
    (
      | {
          variables: GetPermissionsByRoleAndPagesGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPermissionsByRoleAndPagesGuidQuery,
    GetPermissionsByRoleAndPagesGuidQueryVariables
  >(GetPermissionsByRoleAndPagesGuidDocument, options);
}
export function useGetPermissionsByRoleAndPagesGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPermissionsByRoleAndPagesGuidQuery,
    GetPermissionsByRoleAndPagesGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPermissionsByRoleAndPagesGuidQuery,
    GetPermissionsByRoleAndPagesGuidQueryVariables
  >(GetPermissionsByRoleAndPagesGuidDocument, options);
}
// @ts-ignore
export function useGetPermissionsByRoleAndPagesGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPermissionsByRoleAndPagesGuidQuery,
    GetPermissionsByRoleAndPagesGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPermissionsByRoleAndPagesGuidQuery,
  GetPermissionsByRoleAndPagesGuidQueryVariables
>;
export function useGetPermissionsByRoleAndPagesGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPermissionsByRoleAndPagesGuidQuery,
        GetPermissionsByRoleAndPagesGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPermissionsByRoleAndPagesGuidQuery | undefined,
  GetPermissionsByRoleAndPagesGuidQueryVariables
>;
export function useGetPermissionsByRoleAndPagesGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPermissionsByRoleAndPagesGuidQuery,
        GetPermissionsByRoleAndPagesGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPermissionsByRoleAndPagesGuidQuery,
    GetPermissionsByRoleAndPagesGuidQueryVariables
  >(GetPermissionsByRoleAndPagesGuidDocument, options);
}
export type GetPermissionsByRoleAndPagesGuidQueryHookResult = ReturnType<
  typeof useGetPermissionsByRoleAndPagesGuidQuery
>;
export type GetPermissionsByRoleAndPagesGuidLazyQueryHookResult = ReturnType<
  typeof useGetPermissionsByRoleAndPagesGuidLazyQuery
>;
export type GetPermissionsByRoleAndPagesGuidSuspenseQueryHookResult =
  ReturnType<typeof useGetPermissionsByRoleAndPagesGuidSuspenseQuery>;
export type GetPermissionsByRoleAndPagesGuidQueryResult = Apollo.QueryResult<
  GetPermissionsByRoleAndPagesGuidQuery,
  GetPermissionsByRoleAndPagesGuidQueryVariables
>;
