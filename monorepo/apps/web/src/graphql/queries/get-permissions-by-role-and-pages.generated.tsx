import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPermissionsByRoleAndPagesQueryVariables = Types.Exact<{
  roleGuid: Types.Scalars["uuid"]["input"];
  pageKeys:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetPermissionsByRoleAndPagesQuery = {
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

export const GetPermissionsByRoleAndPagesDocument = gql`
  query GetPermissionsByRoleAndPages($roleGuid: uuid!, $pageKeys: [String!]!) {
    Tbl_Permissions(
      where: {
        RoleGuid: { _eq: $roleGuid }
        Tbl_Page: { PageKey: { _in: $pageKeys } }
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
 * __useGetPermissionsByRoleAndPagesQuery__
 *
 * To run a query within a React component, call `useGetPermissionsByRoleAndPagesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPermissionsByRoleAndPagesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPermissionsByRoleAndPagesQuery({
 *   variables: {
 *      roleGuid: // value for 'roleGuid'
 *      pageKeys: // value for 'pageKeys'
 *   },
 * });
 */
export function useGetPermissionsByRoleAndPagesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPermissionsByRoleAndPagesQuery,
    GetPermissionsByRoleAndPagesQueryVariables
  > &
    (
      | {
          variables: GetPermissionsByRoleAndPagesQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPermissionsByRoleAndPagesQuery,
    GetPermissionsByRoleAndPagesQueryVariables
  >(GetPermissionsByRoleAndPagesDocument, options);
}
export function useGetPermissionsByRoleAndPagesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPermissionsByRoleAndPagesQuery,
    GetPermissionsByRoleAndPagesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPermissionsByRoleAndPagesQuery,
    GetPermissionsByRoleAndPagesQueryVariables
  >(GetPermissionsByRoleAndPagesDocument, options);
}
// @ts-ignore
export function useGetPermissionsByRoleAndPagesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPermissionsByRoleAndPagesQuery,
    GetPermissionsByRoleAndPagesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPermissionsByRoleAndPagesQuery,
  GetPermissionsByRoleAndPagesQueryVariables
>;
export function useGetPermissionsByRoleAndPagesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPermissionsByRoleAndPagesQuery,
        GetPermissionsByRoleAndPagesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPermissionsByRoleAndPagesQuery | undefined,
  GetPermissionsByRoleAndPagesQueryVariables
>;
export function useGetPermissionsByRoleAndPagesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPermissionsByRoleAndPagesQuery,
        GetPermissionsByRoleAndPagesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPermissionsByRoleAndPagesQuery,
    GetPermissionsByRoleAndPagesQueryVariables
  >(GetPermissionsByRoleAndPagesDocument, options);
}
export type GetPermissionsByRoleAndPagesQueryHookResult = ReturnType<
  typeof useGetPermissionsByRoleAndPagesQuery
>;
export type GetPermissionsByRoleAndPagesLazyQueryHookResult = ReturnType<
  typeof useGetPermissionsByRoleAndPagesLazyQuery
>;
export type GetPermissionsByRoleAndPagesSuspenseQueryHookResult = ReturnType<
  typeof useGetPermissionsByRoleAndPagesSuspenseQuery
>;
export type GetPermissionsByRoleAndPagesQueryResult = Apollo.QueryResult<
  GetPermissionsByRoleAndPagesQuery,
  GetPermissionsByRoleAndPagesQueryVariables
>;
