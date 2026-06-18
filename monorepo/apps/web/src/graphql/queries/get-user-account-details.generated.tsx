import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserAccountDetailsQueryVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
  languageGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetUserAccountDetailsQuery = {
  __typename?: "query_root";
  userRoles: Array<{
    __typename?: "Tbl_UserRoleMapping";
    Tbl_Role: { __typename?: "Tbl_Roles"; RoleName: string };
  }>;
  userAccount: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    FirstName?: string | null;
    LastName?: string | null;
    CompanyName?: string | null;
    UserProfileImage?: string | null;
  }>;
  userRoleMapping: Array<{
    __typename?: "Tbl_UserRoleMapping";
    RoleGuid: any;
    Tbl_Role: { __typename?: "Tbl_Roles"; RoleName: string };
  }>;
  userCompanyMapping: Array<{
    __typename?: "Tbl_UserCompanyMapping";
    CompanyGuid?: any | null;
    Tbl_Company?: {
      __typename?: "Tbl_Companies";
      CompanyName?: string | null;
      Tbl_CompanyCountries: Array<{
        __typename?: "Tbl_CompanyCountry";
        Tbl_CountryMaster?: {
          __typename?: "Tbl_CountryMaster";
          CountryGuid: any;
          CountryName: string;
        } | null;
      }>;
    } | null;
  }>;
  emailTemplates: Array<{
    __typename?: "Tbl_EmailTemplateNotificationDetails";
    UserEmailTemplateNotificationGuid: any;
    IsActive?: boolean | null;
    Tbl_EmailTemplate?: {
      __typename?: "Tbl_EmailTemplate";
      EmailTemplateGUID: any;
      EmailTemplateName?: string | null;
      Description?: string | null;
    } | null;
  }>;
};

export const GetUserAccountDetailsDocument = gql`
  query GetUserAccountDetails($userGuid: uuid!, $languageGuid: uuid!) {
    userRoles: Tbl_UserRoleMapping(where: { UserGuid: { _eq: $userGuid } }) {
      Tbl_Role {
        RoleName
      }
    }
    userAccount: Tbl_Users(
      where: {
        UserGuid: { _eq: $userGuid }
        LanguageGuid: { _eq: $languageGuid }
      }
      limit: 1
    ) {
      UserGuid
      EmailId
      FirstName
      LastName
      CompanyName
      UserProfileImage
    }
    userRoleMapping: Tbl_UserRoleMapping(
      where: { UserGuid: { _eq: $userGuid } }
    ) {
      RoleGuid
      Tbl_Role {
        RoleName
      }
    }
    userCompanyMapping: Tbl_UserCompanyMapping(
      where: { UserGuid: { _eq: $userGuid } }
    ) {
      CompanyGuid
      Tbl_Company {
        CompanyName
        Tbl_CompanyCountries {
          Tbl_CountryMaster {
            CountryGuid
            CountryName
          }
        }
      }
    }
    emailTemplates: Tbl_EmailTemplateNotificationDetails(
      where: {
        UserGuid: { _eq: $userGuid }
        Tbl_EmailTemplate: { IsActive: { _eq: true } }
      }
    ) {
      UserEmailTemplateNotificationGuid
      IsActive
      Tbl_EmailTemplate {
        EmailTemplateGUID
        EmailTemplateName
        Description
      }
    }
  }
`;

/**
 * __useGetUserAccountDetailsQuery__
 *
 * To run a query within a React component, call `useGetUserAccountDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserAccountDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserAccountDetailsQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *      languageGuid: // value for 'languageGuid'
 *   },
 * });
 */
export function useGetUserAccountDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserAccountDetailsQuery,
    GetUserAccountDetailsQueryVariables
  > &
    (
      | { variables: GetUserAccountDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserAccountDetailsQuery,
    GetUserAccountDetailsQueryVariables
  >(GetUserAccountDetailsDocument, options);
}
export function useGetUserAccountDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserAccountDetailsQuery,
    GetUserAccountDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserAccountDetailsQuery,
    GetUserAccountDetailsQueryVariables
  >(GetUserAccountDetailsDocument, options);
}
// @ts-ignore
export function useGetUserAccountDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserAccountDetailsQuery,
    GetUserAccountDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserAccountDetailsQuery,
  GetUserAccountDetailsQueryVariables
>;
export function useGetUserAccountDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserAccountDetailsQuery,
        GetUserAccountDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserAccountDetailsQuery | undefined,
  GetUserAccountDetailsQueryVariables
>;
export function useGetUserAccountDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserAccountDetailsQuery,
        GetUserAccountDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserAccountDetailsQuery,
    GetUserAccountDetailsQueryVariables
  >(GetUserAccountDetailsDocument, options);
}
export type GetUserAccountDetailsQueryHookResult = ReturnType<
  typeof useGetUserAccountDetailsQuery
>;
export type GetUserAccountDetailsLazyQueryHookResult = ReturnType<
  typeof useGetUserAccountDetailsLazyQuery
>;
export type GetUserAccountDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetUserAccountDetailsSuspenseQuery
>;
export type GetUserAccountDetailsQueryResult = Apollo.QueryResult<
  GetUserAccountDetailsQuery,
  GetUserAccountDetailsQueryVariables
>;
