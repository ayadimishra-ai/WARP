import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserByEmailQueryVariables = Types.Exact<{
  email?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetUserByEmailQuery = {
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
    isResetPasswordDone: boolean;
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
    Tbl_UserRoleMappings: Array<{
      __typename?: "Tbl_UserRoleMapping";
      RoleGuid: any;
      Tbl_Role: { __typename?: "Tbl_Roles"; RoleName: string };
    }>;
  }>;
};

export const GetUserByEmailDocument = gql`
  query GetUserByEmail($email: String) {
    Tbl_Users(
      where: {
        _and: [
          { EmailId: { _ilike: $email } }
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
      IsVerified
      Password
      CreatedDate
      isResetPasswordDone
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
      Tbl_UserRoleMappings: Tbl_UserRoleMappings_userGuid {
        RoleGuid
        Tbl_Role {
          RoleName
        }
      }
    }
  }
`;

/**
 * __useGetUserByEmailQuery__
 *
 * To run a query within a React component, call `useGetUserByEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserByEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserByEmailQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetUserByEmailQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserByEmailQuery,
    GetUserByEmailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserByEmailQuery, GetUserByEmailQueryVariables>(
    GetUserByEmailDocument,
    options
  );
}
export function useGetUserByEmailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserByEmailQuery,
    GetUserByEmailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserByEmailQuery, GetUserByEmailQueryVariables>(
    GetUserByEmailDocument,
    options
  );
}
// @ts-ignore
export function useGetUserByEmailSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserByEmailQuery,
    GetUserByEmailQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserByEmailQuery,
  GetUserByEmailQueryVariables
>;
export function useGetUserByEmailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByEmailQuery,
        GetUserByEmailQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserByEmailQuery | undefined,
  GetUserByEmailQueryVariables
>;
export function useGetUserByEmailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserByEmailQuery,
        GetUserByEmailQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserByEmailQuery,
    GetUserByEmailQueryVariables
  >(GetUserByEmailDocument, options);
}
export type GetUserByEmailQueryHookResult = ReturnType<
  typeof useGetUserByEmailQuery
>;
export type GetUserByEmailLazyQueryHookResult = ReturnType<
  typeof useGetUserByEmailLazyQuery
>;
export type GetUserByEmailSuspenseQueryHookResult = ReturnType<
  typeof useGetUserByEmailSuspenseQuery
>;
export type GetUserByEmailQueryResult = Apollo.QueryResult<
  GetUserByEmailQuery,
  GetUserByEmailQueryVariables
>;
