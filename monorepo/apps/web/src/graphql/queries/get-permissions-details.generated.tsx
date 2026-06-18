import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPermissionsDetailsQueryVariables = Types.Exact<{
  where: Types.Tbl_Permissions_Bool_Exp;
}>;

export type GetPermissionsDetailsQuery = {
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

export const GetPermissionsDetailsDocument = gql`
  query GetPermissionsDetails($where: Tbl_Permissions_bool_exp!) {
    Tbl_Permissions(where: $where) {
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
 * __useGetPermissionsDetailsQuery__
 *
 * To run a query within a React component, call `useGetPermissionsDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPermissionsDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPermissionsDetailsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetPermissionsDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPermissionsDetailsQuery,
    GetPermissionsDetailsQueryVariables
  > &
    (
      | { variables: GetPermissionsDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPermissionsDetailsQuery,
    GetPermissionsDetailsQueryVariables
  >(GetPermissionsDetailsDocument, options);
}
export function useGetPermissionsDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPermissionsDetailsQuery,
    GetPermissionsDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPermissionsDetailsQuery,
    GetPermissionsDetailsQueryVariables
  >(GetPermissionsDetailsDocument, options);
}
// @ts-ignore
export function useGetPermissionsDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPermissionsDetailsQuery,
    GetPermissionsDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPermissionsDetailsQuery,
  GetPermissionsDetailsQueryVariables
>;
export function useGetPermissionsDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPermissionsDetailsQuery,
        GetPermissionsDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPermissionsDetailsQuery | undefined,
  GetPermissionsDetailsQueryVariables
>;
export function useGetPermissionsDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPermissionsDetailsQuery,
        GetPermissionsDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPermissionsDetailsQuery,
    GetPermissionsDetailsQueryVariables
  >(GetPermissionsDetailsDocument, options);
}
export type GetPermissionsDetailsQueryHookResult = ReturnType<
  typeof useGetPermissionsDetailsQuery
>;
export type GetPermissionsDetailsLazyQueryHookResult = ReturnType<
  typeof useGetPermissionsDetailsLazyQuery
>;
export type GetPermissionsDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetPermissionsDetailsSuspenseQuery
>;
export type GetPermissionsDetailsQueryResult = Apollo.QueryResult<
  GetPermissionsDetailsQuery,
  GetPermissionsDetailsQueryVariables
>;
