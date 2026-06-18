import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMenuListQueryVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  roleGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetMenuListQuery = {
  __typename?: "query_root";
  Tbl_Permissions: Array<{
    __typename?: "Tbl_Permissions";
    PageGuid: any;
    MenuType?: string | null;
    MenuDisplayOrder?: number | null;
    IconName?: string | null;
    ResourceKey?: string | null;
    Tbl_Page: {
      __typename?: "Tbl_Pages";
      PageKey: string;
      URL?: string | null;
      ParentPageGuid?: any | null;
    };
    Tbl_LanguageResource?: {
      __typename?: "Tbl_LanguageResources";
      ResourceValue?: string | null;
    } | null;
  }>;
  Tbl_Roles: Array<{
    __typename?: "Tbl_Roles";
    Priority?: number | null;
    RoleName: string;
  }>;
};

export const GetMenuListDocument = gql`
  query GetMenuList($userGuid: uuid!, $roleGuid: uuid!) {
    Tbl_Permissions(
      where: {
        Tbl_UserPermissions: {
          UserGuid: { _eq: $userGuid }
          Rights: { _eq: "W" }
        }
        Tbl_Page: { IsActive: { _eq: true }, PageKey: { _neq: "POs" } }
        Tbl_LanguageResource: { IsActive: { _eq: true } }
        ResourceKey: { _is_null: false }
        IsActive: { _eq: true }
      }
      order_by: { MenuDisplayOrder: asc }
    ) {
      PageGuid
      MenuType
      MenuDisplayOrder
      IconName
      ResourceKey
      Tbl_Page {
        PageKey
        URL
        ParentPageGuid
      }
      Tbl_LanguageResource {
        ResourceValue
      }
    }
    Tbl_Roles(
      where: { RoleGuid: { _eq: $roleGuid }, IsActive: { _eq: true } }
    ) {
      Priority
      RoleName
    }
  }
`;

/**
 * __useGetMenuListQuery__
 *
 * To run a query within a React component, call `useGetMenuListQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMenuListQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMenuListQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      roleGuid: // value for 'roleGuid'
 *   },
 * });
 */
export function useGetMenuListQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMenuListQuery,
    GetMenuListQueryVariables
  > &
    (
      | { variables: GetMenuListQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetMenuListQuery, GetMenuListQueryVariables>(
    GetMenuListDocument,
    options
  );
}
export function useGetMenuListLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMenuListQuery,
    GetMenuListQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetMenuListQuery, GetMenuListQueryVariables>(
    GetMenuListDocument,
    options
  );
}
// @ts-ignore
export function useGetMenuListSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMenuListQuery,
    GetMenuListQueryVariables
  >
): Apollo.UseSuspenseQueryResult<GetMenuListQuery, GetMenuListQueryVariables>;
export function useGetMenuListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMenuListQuery,
        GetMenuListQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMenuListQuery | undefined,
  GetMenuListQueryVariables
>;
export function useGetMenuListSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMenuListQuery,
        GetMenuListQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<GetMenuListQuery, GetMenuListQueryVariables>(
    GetMenuListDocument,
    options
  );
}
export type GetMenuListQueryHookResult = ReturnType<typeof useGetMenuListQuery>;
export type GetMenuListLazyQueryHookResult = ReturnType<
  typeof useGetMenuListLazyQuery
>;
export type GetMenuListSuspenseQueryHookResult = ReturnType<
  typeof useGetMenuListSuspenseQuery
>;
export type GetMenuListQueryResult = Apollo.QueryResult<
  GetMenuListQuery,
  GetMenuListQueryVariables
>;
