import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserByCpanelIdQueryVariables = Types.Exact<{
  cpanelUserId: Types.Scalars["String"]["input"];
}>;

export type GetUserByCpanelIdQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    FirstName?: string | null;
    MobileNumber?: string | null;
    EmailId: string;
    CpanelUserId?: string | null;
    LastName?: string | null;
    CreatedBy?: any | null;
    OPSUserId?: string | null;
    SetPasswordToken?: string | null;
    Tbl_Roles: Array<{
      __typename?: "Tbl_Roles";
      RoleGuid: any;
      RoleName: string;
    }>;
    Tbl_UserCompanyMappings: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      CompanyGuid?: any | null;
      Tbl_Company?: {
        __typename?: "Tbl_Companies";
        CompanyName?: string | null;
        CPanelCompanyId?: string | null;
        Tbl_CompanyRoleMappings: Array<{
          __typename?: "Tbl_CompanyRoleMapping";
          RoleGuid: any;
          Tbl_Role: {
            __typename?: "Tbl_Roles";
            RoleGuid: any;
            RoleName: string;
          };
        }>;
      } | null;
    }>;
  }>;
};

export const GetUserByCpanelIdDocument = gql`
  query GetUserByCpanelId($cpanelUserId: String!) {
    Tbl_Users(where: { CpanelUserId: { _eq: $cpanelUserId } }) {
      UserGuid
      FirstName
      MobileNumber
      EmailId
      CpanelUserId
      LastName
      CreatedBy
      OPSUserId
      SetPasswordToken
      Tbl_Roles {
        RoleGuid
        RoleName
      }
      Tbl_UserCompanyMappings {
        CompanyGuid
        Tbl_Company {
          CompanyName
          CPanelCompanyId
          Tbl_CompanyRoleMappings {
            RoleGuid
            Tbl_Role {
              RoleGuid
              RoleName
            }
          }
        }
      }
    }
  }
`;

/**
 * __useGetUserByCpanelIdQuery__
 *
 * To run a query within a React component, call `useGetUserByCpanelIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByCpanelIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByCpanelIdQuery({
 *   variables: {
 *      cpanelUserId: // value for 'cpanelUserId'
 *   },
 * });
 */
export function useGetUserByCpanelIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserByCpanelIdQuery,
    GetUserByCpanelIdQueryVariables
  > &
    (
      | { variables: GetUserByCpanelIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserByCpanelIdQuery,
    GetUserByCpanelIdQueryVariables
  >(GetUserByCpanelIdDocument, options);
}
export function useGetUserByCpanelIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserByCpanelIdQuery,
    GetUserByCpanelIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserByCpanelIdQuery,
    GetUserByCpanelIdQueryVariables
  >(GetUserByCpanelIdDocument, options);
}
// @ts-ignore
export function useGetUserByCpanelIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserByCpanelIdQuery,
    GetUserByCpanelIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserByCpanelIdQuery,
  GetUserByCpanelIdQueryVariables
>;
export function useGetUserByCpanelIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByCpanelIdQuery,
        GetUserByCpanelIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserByCpanelIdQuery | undefined,
  GetUserByCpanelIdQueryVariables
>;
export function useGetUserByCpanelIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByCpanelIdQuery,
        GetUserByCpanelIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserByCpanelIdQuery,
    GetUserByCpanelIdQueryVariables
  >(GetUserByCpanelIdDocument, options);
}
export type GetUserByCpanelIdQueryHookResult = ReturnType<
  typeof useGetUserByCpanelIdQuery
>;
export type GetUserByCpanelIdLazyQueryHookResult = ReturnType<
  typeof useGetUserByCpanelIdLazyQuery
>;
export type GetUserByCpanelIdSuspenseQueryHookResult = ReturnType<
  typeof useGetUserByCpanelIdSuspenseQuery
>;
export type GetUserByCpanelIdQueryResult = Apollo.QueryResult<
  GetUserByCpanelIdQuery,
  GetUserByCpanelIdQueryVariables
>;
