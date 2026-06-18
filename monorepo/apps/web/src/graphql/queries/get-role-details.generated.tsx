import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetRoleDetailsQueryVariables = Types.Exact<{
  roleName:
    | Array<Types.Scalars["String"]["input"]>
    | Types.Scalars["String"]["input"];
}>;

export type GetRoleDetailsQuery = {
  __typename?: "query_root";
  Tbl_Roles: Array<{
    __typename?: "Tbl_Roles";
    RoleGuid: any;
    RoleName: string;
    Priority?: number | null;
    ParentRoleGuid?: any | null;
  }>;
};

export const GetRoleDetailsDocument = gql`
  query GetRoleDetails($roleName: [String!]!) {
    Tbl_Roles(where: { RoleName: { _in: $roleName } }) {
      RoleGuid
      RoleName
      Priority
      ParentRoleGuid
    }
  }
`;

/**
 * __useGetRoleDetailsQuery__
 *
 * To run a query within a React component, call `useGetRoleDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetRoleDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetRoleDetailsQuery({
 *   variables: {
 *      roleName: // value for 'roleName'
 *   },
 * });
 */
export function useGetRoleDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetRoleDetailsQuery,
    GetRoleDetailsQueryVariables
  > &
    (
      | { variables: GetRoleDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetRoleDetailsQuery, GetRoleDetailsQueryVariables>(
    GetRoleDetailsDocument,
    options
  );
}
export function useGetRoleDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetRoleDetailsQuery,
    GetRoleDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<GetRoleDetailsQuery, GetRoleDetailsQueryVariables>(
    GetRoleDetailsDocument,
    options
  );
}
// @ts-ignore
export function useGetRoleDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetRoleDetailsQuery,
    GetRoleDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetRoleDetailsQuery,
  GetRoleDetailsQueryVariables
>;
export function useGetRoleDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRoleDetailsQuery,
        GetRoleDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetRoleDetailsQuery | undefined,
  GetRoleDetailsQueryVariables
>;
export function useGetRoleDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetRoleDetailsQuery,
        GetRoleDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetRoleDetailsQuery,
    GetRoleDetailsQueryVariables
  >(GetRoleDetailsDocument, options);
}
export type GetRoleDetailsQueryHookResult = ReturnType<
  typeof useGetRoleDetailsQuery
>;
export type GetRoleDetailsLazyQueryHookResult = ReturnType<
  typeof useGetRoleDetailsLazyQuery
>;
export type GetRoleDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetRoleDetailsSuspenseQuery
>;
export type GetRoleDetailsQueryResult = Apollo.QueryResult<
  GetRoleDetailsQuery,
  GetRoleDetailsQueryVariables
>;
