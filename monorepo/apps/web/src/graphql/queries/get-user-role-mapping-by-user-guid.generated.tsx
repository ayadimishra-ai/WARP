import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserRoleMappingByUserGuidQueryVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetUserRoleMappingByUserGuidQuery = {
  __typename?: "query_root";
  Tbl_UserRoleMapping: Array<{
    __typename?: "Tbl_UserRoleMapping";
    RoleGuid: any;
    Tbl_Role: { __typename?: "Tbl_Roles"; RoleName: string };
  }>;
};

export const GetUserRoleMappingByUserGuidDocument = gql`
  query GetUserRoleMappingByUserGuid($userGuid: uuid!) {
    Tbl_UserRoleMapping(where: { UserGuid: { _eq: $userGuid } }) {
      RoleGuid
      Tbl_Role {
        RoleName
      }
    }
  }
`;

/**
 * __useGetUserRoleMappingByUserGuidQuery__
 *
 * To run a query within a React component, call `useGetUserRoleMappingByUserGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserRoleMappingByUserGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserRoleMappingByUserGuidQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *   },
 * });
 */
export function useGetUserRoleMappingByUserGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserRoleMappingByUserGuidQuery,
    GetUserRoleMappingByUserGuidQueryVariables
  > &
    (
      | {
          variables: GetUserRoleMappingByUserGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserRoleMappingByUserGuidQuery,
    GetUserRoleMappingByUserGuidQueryVariables
  >(GetUserRoleMappingByUserGuidDocument, options);
}
export function useGetUserRoleMappingByUserGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserRoleMappingByUserGuidQuery,
    GetUserRoleMappingByUserGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserRoleMappingByUserGuidQuery,
    GetUserRoleMappingByUserGuidQueryVariables
  >(GetUserRoleMappingByUserGuidDocument, options);
}
// @ts-ignore
export function useGetUserRoleMappingByUserGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserRoleMappingByUserGuidQuery,
    GetUserRoleMappingByUserGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserRoleMappingByUserGuidQuery,
  GetUserRoleMappingByUserGuidQueryVariables
>;
export function useGetUserRoleMappingByUserGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserRoleMappingByUserGuidQuery,
        GetUserRoleMappingByUserGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserRoleMappingByUserGuidQuery | undefined,
  GetUserRoleMappingByUserGuidQueryVariables
>;
export function useGetUserRoleMappingByUserGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserRoleMappingByUserGuidQuery,
        GetUserRoleMappingByUserGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserRoleMappingByUserGuidQuery,
    GetUserRoleMappingByUserGuidQueryVariables
  >(GetUserRoleMappingByUserGuidDocument, options);
}
export type GetUserRoleMappingByUserGuidQueryHookResult = ReturnType<
  typeof useGetUserRoleMappingByUserGuidQuery
>;
export type GetUserRoleMappingByUserGuidLazyQueryHookResult = ReturnType<
  typeof useGetUserRoleMappingByUserGuidLazyQuery
>;
export type GetUserRoleMappingByUserGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetUserRoleMappingByUserGuidSuspenseQuery
>;
export type GetUserRoleMappingByUserGuidQueryResult = Apollo.QueryResult<
  GetUserRoleMappingByUserGuidQuery,
  GetUserRoleMappingByUserGuidQueryVariables
>;
