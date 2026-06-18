import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetRoleByNameQueryVariables = Types.Exact<{
  roleName: Types.Scalars["String"]["input"];
}>;

export type GetRoleByNameQuery = {
  __typename?: "query_root";
  Tbl_Roles: Array<{
    __typename?: "Tbl_Roles";
    RoleGuid: any;
    RoleName: string;
    Priority?: number | null;
    ParentRoleGuid?: any | null;
  }>;
};

export const GetRoleByNameDocument = gql`
  query GetRoleByName($roleName: String!) {
    Tbl_Roles(where: { RoleName: { _eq: $roleName } }) {
      RoleGuid
      RoleName
      Priority
      ParentRoleGuid
    }
  }
`;

/**
 * __useGetRoleByNameQuery__
 *
 * To run a query within a React component, call `useGetRoleByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoleByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoleByNameQuery({
 *   variables: {
 *      roleName: // value for 'roleName'
 *   },
 * });
 */
export function useGetRoleByNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetRoleByNameQuery,
    GetRoleByNameQueryVariables
  > &
    (
      | { variables: GetRoleByNameQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetRoleByNameQuery, GetRoleByNameQueryVariables>(
    GetRoleByNameDocument,
    options
  );
}
export function useGetRoleByNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetRoleByNameQuery,
    GetRoleByNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetRoleByNameQuery, GetRoleByNameQueryVariables>(
    GetRoleByNameDocument,
    options
  );
}
// @ts-ignore
export function useGetRoleByNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetRoleByNameQuery,
    GetRoleByNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetRoleByNameQuery,
  GetRoleByNameQueryVariables
>;
export function useGetRoleByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRoleByNameQuery,
        GetRoleByNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetRoleByNameQuery | undefined,
  GetRoleByNameQueryVariables
>;
export function useGetRoleByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRoleByNameQuery,
        GetRoleByNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetRoleByNameQuery,
    GetRoleByNameQueryVariables
  >(GetRoleByNameDocument, options);
}
export type GetRoleByNameQueryHookResult = ReturnType<
  typeof useGetRoleByNameQuery
>;
export type GetRoleByNameLazyQueryHookResult = ReturnType<
  typeof useGetRoleByNameLazyQuery
>;
export type GetRoleByNameSuspenseQueryHookResult = ReturnType<
  typeof useGetRoleByNameSuspenseQuery
>;
export type GetRoleByNameQueryResult = Apollo.QueryResult<
  GetRoleByNameQuery,
  GetRoleByNameQueryVariables
>;
