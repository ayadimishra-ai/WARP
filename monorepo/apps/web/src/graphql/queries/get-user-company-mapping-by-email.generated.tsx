import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserCompanyMappingsDetailsByEmailQueryVariables = Types.Exact<{
  email: Types.Scalars["String"]["input"];
}>;

export type GetUserCompanyMappingsDetailsByEmailQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    FirstName?: string | null;
    EmailId: string;
    MobileNumber?: string | null;
    Tbl_UserCompanyMappings: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      CompanyGuid?: any | null;
      Tbl_Company?: {
        __typename?: "Tbl_Companies";
        CPanelCompanyId?: string | null;
        Tbl_CompanyRoleMappings: Array<{
          __typename?: "Tbl_CompanyRoleMapping";
          Tbl_Role: {
            __typename?: "Tbl_Roles";
            RoleName: string;
            RoleGuid: any;
          };
        }>;
      } | null;
    }>;
  }>;
};

export const GetUserCompanyMappingsDetailsByEmailDocument = gql`
  query GetUserCompanyMappingsDetailsByEmail($email: String!) {
    Tbl_Users(where: { EmailId: { _eq: $email } }) {
      UserGuid
      FirstName
      EmailId
      MobileNumber
      Tbl_UserCompanyMappings {
        CompanyGuid
        Tbl_Company {
          CPanelCompanyId
          Tbl_CompanyRoleMappings {
            Tbl_Role {
              RoleName
              RoleGuid
            }
          }
        }
      }
    }
  }
`;

/**
 * __useGetUserCompanyMappingsDetailsByEmailQuery__
 *
 * To run a query within a React component, call `useGetUserCompanyMappingsDetailsByEmailQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserCompanyMappingsDetailsByEmailQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserCompanyMappingsDetailsByEmailQuery({
 *   variables: {
 *      email: // value for 'email'
 *   },
 * });
 */
export function useGetUserCompanyMappingsDetailsByEmailQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserCompanyMappingsDetailsByEmailQuery,
    GetUserCompanyMappingsDetailsByEmailQueryVariables
  > &
    (
      | {
          variables: GetUserCompanyMappingsDetailsByEmailQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserCompanyMappingsDetailsByEmailQuery,
    GetUserCompanyMappingsDetailsByEmailQueryVariables
  >(GetUserCompanyMappingsDetailsByEmailDocument, options);
}
export function useGetUserCompanyMappingsDetailsByEmailLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserCompanyMappingsDetailsByEmailQuery,
    GetUserCompanyMappingsDetailsByEmailQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserCompanyMappingsDetailsByEmailQuery,
    GetUserCompanyMappingsDetailsByEmailQueryVariables
  >(GetUserCompanyMappingsDetailsByEmailDocument, options);
}
// @ts-ignore
export function useGetUserCompanyMappingsDetailsByEmailSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserCompanyMappingsDetailsByEmailQuery,
    GetUserCompanyMappingsDetailsByEmailQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserCompanyMappingsDetailsByEmailQuery,
  GetUserCompanyMappingsDetailsByEmailQueryVariables
>;
export function useGetUserCompanyMappingsDetailsByEmailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserCompanyMappingsDetailsByEmailQuery,
        GetUserCompanyMappingsDetailsByEmailQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserCompanyMappingsDetailsByEmailQuery | undefined,
  GetUserCompanyMappingsDetailsByEmailQueryVariables
>;
export function useGetUserCompanyMappingsDetailsByEmailSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserCompanyMappingsDetailsByEmailQuery,
        GetUserCompanyMappingsDetailsByEmailQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserCompanyMappingsDetailsByEmailQuery,
    GetUserCompanyMappingsDetailsByEmailQueryVariables
  >(GetUserCompanyMappingsDetailsByEmailDocument, options);
}
export type GetUserCompanyMappingsDetailsByEmailQueryHookResult = ReturnType<
  typeof useGetUserCompanyMappingsDetailsByEmailQuery
>;
export type GetUserCompanyMappingsDetailsByEmailLazyQueryHookResult =
  ReturnType<typeof useGetUserCompanyMappingsDetailsByEmailLazyQuery>;
export type GetUserCompanyMappingsDetailsByEmailSuspenseQueryHookResult =
  ReturnType<typeof useGetUserCompanyMappingsDetailsByEmailSuspenseQuery>;
export type GetUserCompanyMappingsDetailsByEmailQueryResult =
  Apollo.QueryResult<
    GetUserCompanyMappingsDetailsByEmailQuery,
    GetUserCompanyMappingsDetailsByEmailQueryVariables
  >;
