import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetRoleAndStatusQueryVariables = Types.Exact<{
  roleName: Types.Scalars["String"]["input"];
}>;

export type GetRoleAndStatusQuery = {
  __typename?: "query_root";
  Tbl_Roles: Array<{
    __typename?: "Tbl_Roles";
    RoleGuid: any;
    RoleName: string;
    Priority?: number | null;
  }>;
  Tbl_UserStatusMaster: Array<{
    __typename?: "Tbl_UserStatusMaster";
    StatusGuid: any;
    Status?: string | null;
  }>;
};

export const GetRoleAndStatusDocument = gql`
  query getRoleAndStatus($roleName: String!) {
    Tbl_Roles(where: { RoleName: { _eq: $roleName } }) {
      RoleGuid
      RoleName
      Priority
    }
    Tbl_UserStatusMaster(where: { Status: { _eq: "Registered" } }) {
      StatusGuid
      Status
    }
  }
`;

/**
 * __useGetRoleAndStatusQuery__
 *
 * To run a query within a React component, call `useGetRoleAndStatusQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoleAndStatusQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoleAndStatusQuery({
 *   variables: {
 *      roleName: // value for 'roleName'
 *   },
 * });
 */
export function useGetRoleAndStatusQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetRoleAndStatusQuery,
    GetRoleAndStatusQueryVariables
  > &
    (
      | { variables: GetRoleAndStatusQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetRoleAndStatusQuery, GetRoleAndStatusQueryVariables>(
    GetRoleAndStatusDocument,
    options
  );
}
export function useGetRoleAndStatusLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetRoleAndStatusQuery,
    GetRoleAndStatusQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetRoleAndStatusQuery,
    GetRoleAndStatusQueryVariables
  >(GetRoleAndStatusDocument, options);
}
// @ts-ignore
export function useGetRoleAndStatusSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetRoleAndStatusQuery,
    GetRoleAndStatusQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetRoleAndStatusQuery,
  GetRoleAndStatusQueryVariables
>;
export function useGetRoleAndStatusSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRoleAndStatusQuery,
        GetRoleAndStatusQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetRoleAndStatusQuery | undefined,
  GetRoleAndStatusQueryVariables
>;
export function useGetRoleAndStatusSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRoleAndStatusQuery,
        GetRoleAndStatusQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetRoleAndStatusQuery,
    GetRoleAndStatusQueryVariables
  >(GetRoleAndStatusDocument, options);
}
export type GetRoleAndStatusQueryHookResult = ReturnType<
  typeof useGetRoleAndStatusQuery
>;
export type GetRoleAndStatusLazyQueryHookResult = ReturnType<
  typeof useGetRoleAndStatusLazyQuery
>;
export type GetRoleAndStatusSuspenseQueryHookResult = ReturnType<
  typeof useGetRoleAndStatusSuspenseQuery
>;
export type GetRoleAndStatusQueryResult = Apollo.QueryResult<
  GetRoleAndStatusQuery,
  GetRoleAndStatusQueryVariables
>;
