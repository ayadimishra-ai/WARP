import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserDetailsByDynamicColumnsQueryVariables = Types.Exact<{
  where: Types.Tbl_Users_Bool_Exp;
}>;

export type GetUserDetailsByDynamicColumnsQuery = {
  __typename?: "query_root";
  Tbl_Users: Array<{
    __typename?: "Tbl_Users";
    UserGuid: any;
    EmailId: string;
    MobileNumber?: string | null;
    FirstName?: string | null;
    CpanelUserId?: string | null;
    OPSUserId?: string | null;
    Tbl_Roles: Array<{
      __typename?: "Tbl_Roles";
      RoleGuid: any;
      RoleName: string;
      IsActive: boolean;
      CreatedDateUtc: any;
    }>;
  }>;
};

export const GetUserDetailsByDynamicColumnsDocument = gql`
  query GetUserDetailsByDynamicColumns($where: Tbl_Users_bool_exp!) {
    Tbl_Users(where: $where) {
      UserGuid
      EmailId
      MobileNumber
      FirstName
      CpanelUserId
      OPSUserId
      Tbl_Roles {
        RoleGuid
        RoleName
        IsActive
        CreatedDateUtc
      }
    }
  }
`;

/**
 * __useGetUserDetailsByDynamicColumnsQuery__
 *
 * To run a query within a React component, call `useGetUserDetailsByDynamicColumnsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserDetailsByDynamicColumnsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserDetailsByDynamicColumnsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetUserDetailsByDynamicColumnsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserDetailsByDynamicColumnsQuery,
    GetUserDetailsByDynamicColumnsQueryVariables
  > &
    (
      | {
          variables: GetUserDetailsByDynamicColumnsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserDetailsByDynamicColumnsQuery,
    GetUserDetailsByDynamicColumnsQueryVariables
  >(GetUserDetailsByDynamicColumnsDocument, options);
}
export function useGetUserDetailsByDynamicColumnsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserDetailsByDynamicColumnsQuery,
    GetUserDetailsByDynamicColumnsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserDetailsByDynamicColumnsQuery,
    GetUserDetailsByDynamicColumnsQueryVariables
  >(GetUserDetailsByDynamicColumnsDocument, options);
}
// @ts-ignore
export function useGetUserDetailsByDynamicColumnsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserDetailsByDynamicColumnsQuery,
    GetUserDetailsByDynamicColumnsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsByDynamicColumnsQuery,
  GetUserDetailsByDynamicColumnsQueryVariables
>;
export function useGetUserDetailsByDynamicColumnsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsByDynamicColumnsQuery,
        GetUserDetailsByDynamicColumnsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserDetailsByDynamicColumnsQuery | undefined,
  GetUserDetailsByDynamicColumnsQueryVariables
>;
export function useGetUserDetailsByDynamicColumnsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserDetailsByDynamicColumnsQuery,
        GetUserDetailsByDynamicColumnsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserDetailsByDynamicColumnsQuery,
    GetUserDetailsByDynamicColumnsQueryVariables
  >(GetUserDetailsByDynamicColumnsDocument, options);
}
export type GetUserDetailsByDynamicColumnsQueryHookResult = ReturnType<
  typeof useGetUserDetailsByDynamicColumnsQuery
>;
export type GetUserDetailsByDynamicColumnsLazyQueryHookResult = ReturnType<
  typeof useGetUserDetailsByDynamicColumnsLazyQuery
>;
export type GetUserDetailsByDynamicColumnsSuspenseQueryHookResult = ReturnType<
  typeof useGetUserDetailsByDynamicColumnsSuspenseQuery
>;
export type GetUserDetailsByDynamicColumnsQueryResult = Apollo.QueryResult<
  GetUserDetailsByDynamicColumnsQuery,
  GetUserDetailsByDynamicColumnsQueryVariables
>;
