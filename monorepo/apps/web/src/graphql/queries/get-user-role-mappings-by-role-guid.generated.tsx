import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserroleMappingsByRoleGuidQueryVariables = Types.Exact<{
  roleguid?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type GetUserroleMappingsByRoleGuidQuery = {
  __typename?: "query_root";
  Tbl_UserRoleMapping: Array<{
    __typename?: "Tbl_UserRoleMapping";
    RoleGuid: any;
    UserGuid: any;
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
};

export const GetUserroleMappingsByRoleGuidDocument = gql`
  query getUserroleMappingsByRoleGuid($roleguid: uuid) {
    Tbl_UserRoleMapping(where: { RoleGuid: { _eq: $roleguid } }) {
      RoleGuid
      UserGuid
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
  }
`;

/**
 * __useGetUserroleMappingsByRoleGuidQuery__
 *
 * To run a query within a React component, call `useGetUserroleMappingsByRoleGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserroleMappingsByRoleGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserroleMappingsByRoleGuidQuery({
 *   variables: {
 *      roleguid: // value for 'roleguid'
 *   },
 * });
 */
export function useGetUserroleMappingsByRoleGuidQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GetUserroleMappingsByRoleGuidQuery,
    GetUserroleMappingsByRoleGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserroleMappingsByRoleGuidQuery,
    GetUserroleMappingsByRoleGuidQueryVariables
  >(GetUserroleMappingsByRoleGuidDocument, options);
}
export function useGetUserroleMappingsByRoleGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserroleMappingsByRoleGuidQuery,
    GetUserroleMappingsByRoleGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserroleMappingsByRoleGuidQuery,
    GetUserroleMappingsByRoleGuidQueryVariables
  >(GetUserroleMappingsByRoleGuidDocument, options);
}
// @ts-ignore
export function useGetUserroleMappingsByRoleGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserroleMappingsByRoleGuidQuery,
    GetUserroleMappingsByRoleGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserroleMappingsByRoleGuidQuery,
  GetUserroleMappingsByRoleGuidQueryVariables
>;
export function useGetUserroleMappingsByRoleGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserroleMappingsByRoleGuidQuery,
        GetUserroleMappingsByRoleGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserroleMappingsByRoleGuidQuery | undefined,
  GetUserroleMappingsByRoleGuidQueryVariables
>;
export function useGetUserroleMappingsByRoleGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserroleMappingsByRoleGuidQuery,
        GetUserroleMappingsByRoleGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserroleMappingsByRoleGuidQuery,
    GetUserroleMappingsByRoleGuidQueryVariables
  >(GetUserroleMappingsByRoleGuidDocument, options);
}
export type GetUserroleMappingsByRoleGuidQueryHookResult = ReturnType<
  typeof useGetUserroleMappingsByRoleGuidQuery
>;
export type GetUserroleMappingsByRoleGuidLazyQueryHookResult = ReturnType<
  typeof useGetUserroleMappingsByRoleGuidLazyQuery
>;
export type GetUserroleMappingsByRoleGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetUserroleMappingsByRoleGuidSuspenseQuery
>;
export type GetUserroleMappingsByRoleGuidQueryResult = Apollo.QueryResult<
  GetUserroleMappingsByRoleGuidQuery,
  GetUserroleMappingsByRoleGuidQueryVariables
>;
