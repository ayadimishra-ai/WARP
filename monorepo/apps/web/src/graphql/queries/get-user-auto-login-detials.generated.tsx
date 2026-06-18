import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserAutoLoginDetailsQueryVariables = Types.Exact<{
  email?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  password?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetUserAutoLoginDetailsQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    MobileNumber?: string | null;
    FirstName?: string | null;
    LastName?: string | null;
    ShowGradeLevel?: boolean | null;
    LanguageGuid?: any | null;
    IsNewsLetterSubscribed: boolean;
    Tbl_UserRoleMappings: Array<{
      __typename?: "Tbl_UserRoleMapping";
      RoleGuid: any;
      Tbl_Role: {
        __typename?: "Tbl_Roles";
        RoleGuid: any;
        RoleName: string;
        IsActive: boolean;
        CreatedDateUtc: any;
        Priority?: number | null;
      };
      Tbl_UserStatusMaster?: {
        __typename?: "Tbl_UserStatusMaster";
        StatusGuid: any;
        Status?: string | null;
      } | null;
    }>;
    Tbl_UserCompanyMappings: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      UserCompanyMappingGuid: any;
      Tbl_Company?: {
        __typename?: "Tbl_Companies";
        CompanyGuid: any;
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
    Tbl_UserPermissions: Array<{
      __typename?: "Tbl_UserPermissions";
      Tbl_Permission: {
        __typename?: "Tbl_Permissions";
        PageGuid: any;
        ResourceKey?: string | null;
        MenuType?: string | null;
        Tbl_Page: {
          __typename?: "Tbl_Pages";
          PageKey: string;
          PlatformType?: string | null;
        };
      };
    }>;
  }>;
};

export const GetUserAutoLoginDetailsDocument = gql`
  query GetUserAutoLoginDetails($email: String, $password: String) {
    Tbl_Users(
      where: {
        _and: [{ EmailId: { _eq: $email } }, { Password: { _eq: $password } }]
      }
    ) {
      UserGuid
      EmailId
      MobileNumber
      FirstName
      LastName
      ShowGradeLevel
      LanguageGuid
      IsNewsLetterSubscribed
      Tbl_UserRoleMappings: Tbl_UserRoleMappings_userGuid {
        RoleGuid
        Tbl_Role {
          RoleGuid
          RoleName
          IsActive
          CreatedDateUtc
          Priority
        }
        Tbl_UserStatusMaster {
          StatusGuid
          Status
        }
      }
      Tbl_UserCompanyMappings {
        UserCompanyMappingGuid
        Tbl_Company {
          CompanyGuid
          Tbl_CompanyCountries {
            Tbl_CountryMaster {
              CountryGuid
              CountryName
            }
          }
        }
      }
      Tbl_UserPermissions {
        Tbl_Permission {
          PageGuid
          ResourceKey
          MenuType
          Tbl_Page {
            PageKey
            PlatformType
          }
        }
      }
    }
  }
`;

/**
 * __useGetUserAutoLoginDetailsQuery__
 *
 * To run a query within a React component, call `useGetUserAutoLoginDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserAutoLoginDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserAutoLoginDetailsQuery({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useGetUserAutoLoginDetailsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserAutoLoginDetailsQuery,
    GetUserAutoLoginDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserAutoLoginDetailsQuery,
    GetUserAutoLoginDetailsQueryVariables
  >(GetUserAutoLoginDetailsDocument, options);
}
export function useGetUserAutoLoginDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserAutoLoginDetailsQuery,
    GetUserAutoLoginDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserAutoLoginDetailsQuery,
    GetUserAutoLoginDetailsQueryVariables
  >(GetUserAutoLoginDetailsDocument, options);
}
// @ts-ignore
export function useGetUserAutoLoginDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserAutoLoginDetailsQuery,
    GetUserAutoLoginDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserAutoLoginDetailsQuery,
  GetUserAutoLoginDetailsQueryVariables
>;
export function useGetUserAutoLoginDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserAutoLoginDetailsQuery,
        GetUserAutoLoginDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserAutoLoginDetailsQuery | undefined,
  GetUserAutoLoginDetailsQueryVariables
>;
export function useGetUserAutoLoginDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserAutoLoginDetailsQuery,
        GetUserAutoLoginDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserAutoLoginDetailsQuery,
    GetUserAutoLoginDetailsQueryVariables
  >(GetUserAutoLoginDetailsDocument, options);
}
export type GetUserAutoLoginDetailsQueryHookResult = ReturnType<
  typeof useGetUserAutoLoginDetailsQuery
>;
export type GetUserAutoLoginDetailsLazyQueryHookResult = ReturnType<
  typeof useGetUserAutoLoginDetailsLazyQuery
>;
export type GetUserAutoLoginDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetUserAutoLoginDetailsSuspenseQuery
>;
export type GetUserAutoLoginDetailsQueryResult = Apollo.QueryResult<
  GetUserAutoLoginDetailsQuery,
  GetUserAutoLoginDetailsQueryVariables
>;
