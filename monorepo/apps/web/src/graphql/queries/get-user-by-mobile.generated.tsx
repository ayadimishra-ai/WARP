import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserByMobileQueryVariables = Types.Exact<{
  mobile?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetUserByMobileQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    MobileNumber?: string | null;
    FirstName?: string | null;
    LastName?: string | null;
    CpanelUserId?: string | null;
    OPSUserId?: string | null;
    IsVerified?: boolean | null;
    Password?: string | null;
    CreatedDate?: any | null;
    Tbl_UserRoleMappings: Array<{
      __typename?: "Tbl_UserRoleMapping";
      RoleGuid: any;
      Tbl_Role: {
        __typename?: "Tbl_Roles";
        RoleGuid: any;
        RoleName: string;
        IsActive: boolean;
        CreatedDateUtc: any;
      };
      Tbl_UserStatusMaster?: {
        __typename?: "Tbl_UserStatusMaster";
        StatusGuid: any;
        Status?: string | null;
      } | null;
    }>;
    Tbl_UserCompanyMappings: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      CompanyGuid?: any | null;
      Tbl_Company?: {
        __typename?: "Tbl_Companies";
        Tbl_CompanyRoleMappings: Array<{
          __typename?: "Tbl_CompanyRoleMapping";
          RoleGuid: any;
          StatusGuid: any;
          Tbl_CompanyStatusMaster: {
            __typename?: "Tbl_CompanyStatusMaster";
            CompanyStatusGuid: any;
            CompanyStatusName: string;
          };
        }>;
      } | null;
    }>;
  }>;
};

export const GetUserByMobileDocument = gql`
  query GetUserByMobile($mobile: String) {
    Tbl_Users(
      where: {
        _and: [
          { MobileNumber: { _eq: $mobile } }
          { IsActive: { _eq: true } }
          { IsDeleted: { _eq: false } }
        ]
      }
    ) {
      UserGuid
      EmailId
      MobileNumber
      FirstName
      LastName
      CpanelUserId
      OPSUserId
      Tbl_UserRoleMappings: Tbl_UserRoleMappings_userGuid {
        RoleGuid
        Tbl_Role {
          RoleGuid
          RoleName
          IsActive
          CreatedDateUtc
        }
        Tbl_UserStatusMaster {
          StatusGuid
          Status
        }
      }
      IsVerified
      Password
      CreatedDate
      Tbl_UserCompanyMappings {
        CompanyGuid
        Tbl_Company {
          Tbl_CompanyRoleMappings {
            RoleGuid
            StatusGuid
            Tbl_CompanyStatusMaster {
              CompanyStatusGuid
              CompanyStatusName
            }
          }
        }
      }
    }
  }
`;

/**
 * __useGetUserByMobileQuery__
 *
 * To run a query within a React component, call `useGetUserByMobileQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByMobileQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByMobileQuery({
 *   variables: {
 *      mobile: // value for 'mobile'
 *   },
 * });
 */
export function useGetUserByMobileQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserByMobileQuery,
    GetUserByMobileQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserByMobileQuery, GetUserByMobileQueryVariables>(
    GetUserByMobileDocument,
    options
  );
}
export function useGetUserByMobileLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserByMobileQuery,
    GetUserByMobileQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserByMobileQuery,
    GetUserByMobileQueryVariables
  >(GetUserByMobileDocument, options);
}
// @ts-ignore
export function useGetUserByMobileSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserByMobileQuery,
    GetUserByMobileQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserByMobileQuery,
  GetUserByMobileQueryVariables
>;
export function useGetUserByMobileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByMobileQuery,
        GetUserByMobileQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserByMobileQuery | undefined,
  GetUserByMobileQueryVariables
>;
export function useGetUserByMobileSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByMobileQuery,
        GetUserByMobileQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserByMobileQuery,
    GetUserByMobileQueryVariables
  >(GetUserByMobileDocument, options);
}
export type GetUserByMobileQueryHookResult = ReturnType<
  typeof useGetUserByMobileQuery
>;
export type GetUserByMobileLazyQueryHookResult = ReturnType<
  typeof useGetUserByMobileLazyQuery
>;
export type GetUserByMobileSuspenseQueryHookResult = ReturnType<
  typeof useGetUserByMobileSuspenseQuery
>;
export type GetUserByMobileQueryResult = Apollo.QueryResult<
  GetUserByMobileQuery,
  GetUserByMobileQueryVariables
>;
