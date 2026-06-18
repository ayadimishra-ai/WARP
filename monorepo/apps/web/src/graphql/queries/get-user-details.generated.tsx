import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserDetailsQueryVariables = Types.Exact<{
  email?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
  password?: Types.InputMaybe<Types.Scalars["String"]["input"]>;
}>;

export type GetUserDetailsQuery = {
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
        Tbl_Page: { __typename?: "Tbl_Pages"; PageKey: string };
      };
    }>;
  }>;
};

export const GetUserDetailsDocument = gql`
  query GetUserDetails($email: String, $password: String) {
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
          }
        }
      }
    }
  }
`;

/**
 * __useGetUserDetailsQuery__
 *
 * To run a query within a React component, call `useGetUserDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailsQuery({
 *   variables: {
 *      email: // value for 'email'
 *      password: // value for 'password'
 *   },
 * });
 */
export function useGetUserDetailsQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserDetailsQuery,
    GetUserDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetUserDetailsQuery, GetUserDetailsQueryVariables>(
    GetUserDetailsDocument,
    options
  );
}
export function useGetUserDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserDetailsQuery,
    GetUserDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetUserDetailsQuery, GetUserDetailsQueryVariables>(
    GetUserDetailsDocument,
    options
  );
}
// @ts-ignore
export function useGetUserDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserDetailsQuery,
    GetUserDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsQuery,
  GetUserDetailsQueryVariables
>;
export function useGetUserDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsQuery,
        GetUserDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsQuery | undefined,
  GetUserDetailsQueryVariables
>;
export function useGetUserDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsQuery,
        GetUserDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserDetailsQuery,
    GetUserDetailsQueryVariables
  >(GetUserDetailsDocument, options);
}
export type GetUserDetailsQueryHookResult = ReturnType<
  typeof useGetUserDetailsQuery
>;
export type GetUserDetailsLazyQueryHookResult = ReturnType<
  typeof useGetUserDetailsLazyQuery
>;
export type GetUserDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetUserDetailsSuspenseQuery
>;
export type GetUserDetailsQueryResult = Apollo.QueryResult<
  GetUserDetailsQuery,
  GetUserDetailsQueryVariables
>;
