import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyStatusesByRoleQueryVariables = Types.Exact<{
  roleGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetCompanyStatusesByRoleQuery = {
  __typename?: "query_root";
  createdStatus: Array<{
    __typename?: "Tbl_CompanyStatusMaster";
    CompanyStatusGuid: any;
    CompanyStatusName: string;
    RoleGuid?: any | null;
  }>;
  registeredStatus: Array<{
    __typename?: "Tbl_CompanyStatusMaster";
    CompanyStatusGuid: any;
    CompanyStatusName: string;
    RoleGuid?: any | null;
  }>;
};

export const GetCompanyStatusesByRoleDocument = gql`
  query GetCompanyStatusesByRole($roleGuid: uuid!) {
    createdStatus: Tbl_CompanyStatusMaster(
      where: {
        RoleGuid: { _eq: $roleGuid }
        CompanyStatusName: { _eq: "Created" }
      }
      limit: 1
    ) {
      CompanyStatusGuid
      CompanyStatusName
      RoleGuid
    }
    registeredStatus: Tbl_CompanyStatusMaster(
      where: {
        RoleGuid: { _eq: $roleGuid }
        CompanyStatusName: { _eq: "Registered" }
      }
      limit: 1
    ) {
      CompanyStatusGuid
      CompanyStatusName
      RoleGuid
    }
  }
`;

/**
 * __useGetCompanyStatusesByRoleQuery__
 *
 * To run a query within a React component, call `useGetCompanyStatusesByRoleQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyStatusesByRoleQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyStatusesByRoleQuery({
 *   variables: {
 *      roleGuid: // value for 'roleGuid'
 *   },
 * });
 */
export function useGetCompanyStatusesByRoleQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyStatusesByRoleQuery,
    GetCompanyStatusesByRoleQueryVariables
  > &
    (
      | { variables: GetCompanyStatusesByRoleQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyStatusesByRoleQuery,
    GetCompanyStatusesByRoleQueryVariables
  >(GetCompanyStatusesByRoleDocument, options);
}
export function useGetCompanyStatusesByRoleLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyStatusesByRoleQuery,
    GetCompanyStatusesByRoleQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyStatusesByRoleQuery,
    GetCompanyStatusesByRoleQueryVariables
  >(GetCompanyStatusesByRoleDocument, options);
}
// @ts-ignore
export function useGetCompanyStatusesByRoleSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyStatusesByRoleQuery,
    GetCompanyStatusesByRoleQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyStatusesByRoleQuery,
  GetCompanyStatusesByRoleQueryVariables
>;
export function useGetCompanyStatusesByRoleSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyStatusesByRoleQuery,
        GetCompanyStatusesByRoleQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyStatusesByRoleQuery | undefined,
  GetCompanyStatusesByRoleQueryVariables
>;
export function useGetCompanyStatusesByRoleSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyStatusesByRoleQuery,
        GetCompanyStatusesByRoleQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyStatusesByRoleQuery,
    GetCompanyStatusesByRoleQueryVariables
  >(GetCompanyStatusesByRoleDocument, options);
}
export type GetCompanyStatusesByRoleQueryHookResult = ReturnType<
  typeof useGetCompanyStatusesByRoleQuery
>;
export type GetCompanyStatusesByRoleLazyQueryHookResult = ReturnType<
  typeof useGetCompanyStatusesByRoleLazyQuery
>;
export type GetCompanyStatusesByRoleSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyStatusesByRoleSuspenseQuery
>;
export type GetCompanyStatusesByRoleQueryResult = Apollo.QueryResult<
  GetCompanyStatusesByRoleQuery,
  GetCompanyStatusesByRoleQueryVariables
>;
