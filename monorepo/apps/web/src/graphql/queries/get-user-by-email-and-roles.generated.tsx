import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserByEmailAndRolesQueryVariables = Types.Exact<{
  email: Types.Scalars["String"]["input"];
}>;

export type GetUserByEmailAndRolesQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    IsActive?: boolean | null;
    FirstName?: string | null;
    LastName?: string | null;
    EmailId: string;
    CpanelUserId?: string | null;
    OPSUserId?: string | null;
    Tbl_UserRoleMappings: Array<{
      __typename?: "Tbl_UserRoleMapping";
      Tbl_Role: { __typename?: "Tbl_Roles"; RoleName: string };
    }>;
    Tbl_UserCompanyMappings: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      CompanyGuid?: any | null;
    }>;
  }>;
};

export const GetUserByEmailAndRolesDocument = gql`
  query GetUserByEmailAndRoles($email: String!) {
    Tbl_Users(where: { EmailId: { _eq: $email } }, distinct_on: [UserGuid]) {
      UserGuid
      IsActive
      FirstName
      LastName
      EmailId
      CpanelUserId
      OPSUserId
      Tbl_UserRoleMappings: Tbl_UserRoleMappings_userGuid {
        Tbl_Role {
          RoleName
        }
      }
      Tbl_UserCompanyMappings {
        CompanyGuid
      }
    }
  }
`;

/**
 * __useGetUserByEmailAndRolesQuery__
 *
 * To run a query within a React component, call `useGetUserByEmailAndRolesQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByEmailAndRolesQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByEmailAndRolesQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetUserByEmailAndRolesQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserByEmailAndRolesQuery,
    GetUserByEmailAndRolesQueryVariables
  > &
    (
      | { variables: GetUserByEmailAndRolesQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserByEmailAndRolesQuery,
    GetUserByEmailAndRolesQueryVariables
  >(GetUserByEmailAndRolesDocument, options);
}
export function useGetUserByEmailAndRolesLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserByEmailAndRolesQuery,
    GetUserByEmailAndRolesQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserByEmailAndRolesQuery,
    GetUserByEmailAndRolesQueryVariables
  >(GetUserByEmailAndRolesDocument, options);
}
// @ts-ignore
export function useGetUserByEmailAndRolesSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserByEmailAndRolesQuery,
    GetUserByEmailAndRolesQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserByEmailAndRolesQuery,
  GetUserByEmailAndRolesQueryVariables
>;
export function useGetUserByEmailAndRolesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByEmailAndRolesQuery,
        GetUserByEmailAndRolesQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserByEmailAndRolesQuery | undefined,
  GetUserByEmailAndRolesQueryVariables
>;
export function useGetUserByEmailAndRolesSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByEmailAndRolesQuery,
        GetUserByEmailAndRolesQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserByEmailAndRolesQuery,
    GetUserByEmailAndRolesQueryVariables
  >(GetUserByEmailAndRolesDocument, options);
}
export type GetUserByEmailAndRolesQueryHookResult = ReturnType<
  typeof useGetUserByEmailAndRolesQuery
>;
export type GetUserByEmailAndRolesLazyQueryHookResult = ReturnType<
  typeof useGetUserByEmailAndRolesLazyQuery
>;
export type GetUserByEmailAndRolesSuspenseQueryHookResult = ReturnType<
  typeof useGetUserByEmailAndRolesSuspenseQuery
>;
export type GetUserByEmailAndRolesQueryResult = Apollo.QueryResult<
  GetUserByEmailAndRolesQuery,
  GetUserByEmailAndRolesQueryVariables
>;
