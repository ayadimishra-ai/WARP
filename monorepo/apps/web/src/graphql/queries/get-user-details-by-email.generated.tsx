import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserDetailsByEmailIdQueryVariables = Types.Exact<{
  EmailId: Types.Scalars["String"]["input"];
}>;

export type GetUserDetailsByEmailIdQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    FirstName?: string | null;
    CpanelUserId?: string | null;
    OPSUserId?: string | null;
    Tbl_UserRoleMappings: Array<{
      __typename?: "Tbl_UserRoleMapping";
      RoleGuid: any;
      Tbl_Role: { __typename?: "Tbl_Roles"; RoleGuid: any; RoleName: string };
    }>;
    Tbl_UserCompanyMappings: Array<{
      __typename?: "Tbl_UserCompanyMapping";
      UserGuid?: any | null;
      CompanyGuid?: any | null;
      Tbl_Company?: {
        __typename?: "Tbl_Companies";
        CompanyGuid: any;
        CompanyName?: string | null;
        CPanelCompanyId?: string | null;
        OPSCompanyId?: string | null;
        Tbl_CompanyGeneralDetails: Array<{
          __typename?: "Tbl_CompanyGeneralDetails";
          PANCardNumber?: string | null;
        }>;
      } | null;
    }>;
  }>;
};

export const GetUserDetailsByEmailIdDocument = gql`
  query GetUserDetailsByEmailId($EmailId: String!) {
    Tbl_Users(where: { EmailId: { _eq: $EmailId } }) {
      UserGuid
      FirstName
      CpanelUserId
      OPSUserId
      Tbl_UserRoleMappings: Tbl_UserRoleMappings_userGuid {
        RoleGuid
        Tbl_Role {
          RoleGuid
          RoleName
        }
      }
      Tbl_UserCompanyMappings {
        UserGuid
        CompanyGuid
        Tbl_Company {
          CompanyGuid
          CompanyName
          CPanelCompanyId
          OPSCompanyId
          Tbl_CompanyGeneralDetails {
            PANCardNumber
          }
        }
      }
    }
  }
`;

/**
 * __useGetUserDetailsByEmailIdQuery__
 *
 * To run a query within a React component, call `useGetUserDetailsByEmailIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailsByEmailIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailsByEmailIdQuery({
 *   variables: {
 *      EmailId: // value for 'EmailId'
 *   },
 * });
 */
export function useGetUserDetailsByEmailIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserDetailsByEmailIdQuery,
    GetUserDetailsByEmailIdQueryVariables
  > &
    (
      | { variables: GetUserDetailsByEmailIdQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserDetailsByEmailIdQuery,
    GetUserDetailsByEmailIdQueryVariables
  >(GetUserDetailsByEmailIdDocument, options);
}
export function useGetUserDetailsByEmailIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserDetailsByEmailIdQuery,
    GetUserDetailsByEmailIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserDetailsByEmailIdQuery,
    GetUserDetailsByEmailIdQueryVariables
  >(GetUserDetailsByEmailIdDocument, options);
}
// @ts-ignore
export function useGetUserDetailsByEmailIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserDetailsByEmailIdQuery,
    GetUserDetailsByEmailIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsByEmailIdQuery,
  GetUserDetailsByEmailIdQueryVariables
>;
export function useGetUserDetailsByEmailIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsByEmailIdQuery,
        GetUserDetailsByEmailIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsByEmailIdQuery | undefined,
  GetUserDetailsByEmailIdQueryVariables
>;
export function useGetUserDetailsByEmailIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsByEmailIdQuery,
        GetUserDetailsByEmailIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserDetailsByEmailIdQuery,
    GetUserDetailsByEmailIdQueryVariables
  >(GetUserDetailsByEmailIdDocument, options);
}
export type GetUserDetailsByEmailIdQueryHookResult = ReturnType<
  typeof useGetUserDetailsByEmailIdQuery
>;
export type GetUserDetailsByEmailIdLazyQueryHookResult = ReturnType<
  typeof useGetUserDetailsByEmailIdLazyQuery
>;
export type GetUserDetailsByEmailIdSuspenseQueryHookResult = ReturnType<
  typeof useGetUserDetailsByEmailIdSuspenseQuery
>;
export type GetUserDetailsByEmailIdQueryResult = Apollo.QueryResult<
  GetUserDetailsByEmailIdQuery,
  GetUserDetailsByEmailIdQueryVariables
>;
