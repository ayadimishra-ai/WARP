import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyRoleMappingQueryVariables = Types.Exact<{
  companyGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetCompanyRoleMappingQuery = {
  __typename?: "query_root";
  Tbl_CompanyRoleMapping: Array<{
    __typename?: "Tbl_CompanyRoleMapping";
    CompanyGuid: any;
    StatusGuid: any;
    Tbl_Role: { __typename?: "Tbl_Roles"; RoleGuid: any; RoleName: string };
    Tbl_CompanyStatusMaster: {
      __typename?: "Tbl_CompanyStatusMaster";
      RoleGuid?: any | null;
      CompanyStatusName: string;
      CompanyStatusGuid: any;
    };
  }>;
  Tbl_UserCompanyMapping: Array<{
    __typename?: "Tbl_UserCompanyMapping";
    CompanyGuid?: any | null;
    UserCompanyMappingGuid: any;
    UserGuid?: any | null;
    Tbl_User?: {
      __typename?: "Tbl_Users";
      EmailId: string;
      UserGuid: any;
      Tbl_UserRoleMappings: Array<{
        __typename?: "Tbl_UserRoleMapping";
        Tbl_Role: { __typename?: "Tbl_Roles"; RoleGuid: any; RoleName: string };
      }>;
    } | null;
  }>;
};

export const GetCompanyRoleMappingDocument = gql`
  query GetCompanyRoleMapping($companyGuid: uuid!) {
    Tbl_CompanyRoleMapping(where: { CompanyGuid: { _eq: $companyGuid } }) {
      CompanyGuid
      StatusGuid
      Tbl_Role {
        RoleGuid
        RoleName
      }
      Tbl_CompanyStatusMaster {
        RoleGuid
        CompanyStatusName
        CompanyStatusGuid
      }
    }
    Tbl_UserCompanyMapping(where: { CompanyGuid: { _eq: $companyGuid } }) {
      CompanyGuid
      UserCompanyMappingGuid
      UserGuid
      Tbl_User {
        EmailId
        UserGuid
        Tbl_UserRoleMappings: Tbl_UserRoleMappings_userGuid {
          Tbl_Role {
            RoleGuid
            RoleName
          }
        }
      }
    }
  }
`;

/**
 * __useGetCompanyRoleMappingQuery__
 *
 * To run a query within a React component, call `useGetCompanyRoleMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyRoleMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyRoleMappingQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *   },
 * });
 */
export function useGetCompanyRoleMappingQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyRoleMappingQuery,
    GetCompanyRoleMappingQueryVariables
  > &
    (
      | { variables: GetCompanyRoleMappingQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyRoleMappingQuery,
    GetCompanyRoleMappingQueryVariables
  >(GetCompanyRoleMappingDocument, options);
}
export function useGetCompanyRoleMappingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyRoleMappingQuery,
    GetCompanyRoleMappingQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyRoleMappingQuery,
    GetCompanyRoleMappingQueryVariables
  >(GetCompanyRoleMappingDocument, options);
}
// @ts-ignore
export function useGetCompanyRoleMappingSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyRoleMappingQuery,
    GetCompanyRoleMappingQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyRoleMappingQuery,
  GetCompanyRoleMappingQueryVariables
>;
export function useGetCompanyRoleMappingSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyRoleMappingQuery,
        GetCompanyRoleMappingQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyRoleMappingQuery | undefined,
  GetCompanyRoleMappingQueryVariables
>;
export function useGetCompanyRoleMappingSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyRoleMappingQuery,
        GetCompanyRoleMappingQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyRoleMappingQuery,
    GetCompanyRoleMappingQueryVariables
  >(GetCompanyRoleMappingDocument, options);
}
export type GetCompanyRoleMappingQueryHookResult = ReturnType<
  typeof useGetCompanyRoleMappingQuery
>;
export type GetCompanyRoleMappingLazyQueryHookResult = ReturnType<
  typeof useGetCompanyRoleMappingLazyQuery
>;
export type GetCompanyRoleMappingSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyRoleMappingSuspenseQuery
>;
export type GetCompanyRoleMappingQueryResult = Apollo.QueryResult<
  GetCompanyRoleMappingQuery,
  GetCompanyRoleMappingQueryVariables
>;
