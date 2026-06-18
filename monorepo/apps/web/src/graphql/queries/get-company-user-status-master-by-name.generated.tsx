import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyUserStatusMasterByNameQueryVariables = Types.Exact<{
  status: Types.Scalars["String"]["input"];
  CompanyRoleGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetCompanyUserStatusMasterByNameQuery = {
  __typename?: "query_root";
  Tbl_CompanyStatusMaster: Array<{
    __typename?: "Tbl_CompanyStatusMaster";
    CompanyStatusGuid: any;
    CompanyStatusName: string;
    RoleGuid?: any | null;
  }>;
  Tbl_UserStatusMaster: Array<{
    __typename?: "Tbl_UserStatusMaster";
    StatusGuid: any;
    Status?: string | null;
  }>;
};

export const GetCompanyUserStatusMasterByNameDocument = gql`
  query GetCompanyUserStatusMasterByName(
    $status: String!
    $CompanyRoleGuid: uuid!
  ) {
    Tbl_CompanyStatusMaster(
      where: {
        _and: [
          { CompanyStatusName: { _ilike: $status } }
          { RoleGuid: { _eq: $CompanyRoleGuid } }
        ]
      }
    ) {
      CompanyStatusGuid
      CompanyStatusName
      RoleGuid
    }
    Tbl_UserStatusMaster(where: { Status: { _ilike: $status } }) {
      StatusGuid
      Status
    }
  }
`;

/**
 * __useGetCompanyUserStatusMasterByNameQuery__
 *
 * To run a query within a React component, call `useGetCompanyUserStatusMasterByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyUserStatusMasterByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyUserStatusMasterByNameQuery({
 *   variables: {
 *      status: // value for 'status'
 *      CompanyRoleGuid: // value for 'CompanyRoleGuid'
 *   },
 * });
 */
export function useGetCompanyUserStatusMasterByNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyUserStatusMasterByNameQuery,
    GetCompanyUserStatusMasterByNameQueryVariables
  > &
    (
      | {
          variables: GetCompanyUserStatusMasterByNameQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyUserStatusMasterByNameQuery,
    GetCompanyUserStatusMasterByNameQueryVariables
  >(GetCompanyUserStatusMasterByNameDocument, options);
}
export function useGetCompanyUserStatusMasterByNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyUserStatusMasterByNameQuery,
    GetCompanyUserStatusMasterByNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyUserStatusMasterByNameQuery,
    GetCompanyUserStatusMasterByNameQueryVariables
  >(GetCompanyUserStatusMasterByNameDocument, options);
}
// @ts-ignore
export function useGetCompanyUserStatusMasterByNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyUserStatusMasterByNameQuery,
    GetCompanyUserStatusMasterByNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyUserStatusMasterByNameQuery,
  GetCompanyUserStatusMasterByNameQueryVariables
>;
export function useGetCompanyUserStatusMasterByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyUserStatusMasterByNameQuery,
        GetCompanyUserStatusMasterByNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyUserStatusMasterByNameQuery | undefined,
  GetCompanyUserStatusMasterByNameQueryVariables
>;
export function useGetCompanyUserStatusMasterByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyUserStatusMasterByNameQuery,
        GetCompanyUserStatusMasterByNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyUserStatusMasterByNameQuery,
    GetCompanyUserStatusMasterByNameQueryVariables
  >(GetCompanyUserStatusMasterByNameDocument, options);
}
export type GetCompanyUserStatusMasterByNameQueryHookResult = ReturnType<
  typeof useGetCompanyUserStatusMasterByNameQuery
>;
export type GetCompanyUserStatusMasterByNameLazyQueryHookResult = ReturnType<
  typeof useGetCompanyUserStatusMasterByNameLazyQuery
>;
export type GetCompanyUserStatusMasterByNameSuspenseQueryHookResult =
  ReturnType<typeof useGetCompanyUserStatusMasterByNameSuspenseQuery>;
export type GetCompanyUserStatusMasterByNameQueryResult = Apollo.QueryResult<
  GetCompanyUserStatusMasterByNameQuery,
  GetCompanyUserStatusMasterByNameQueryVariables
>;
