import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GettbluserrolemappingsdataQueryVariables = Types.Exact<{
  userguid?: Types.InputMaybe<Types.Scalars["uuid"]["input"]>;
}>;

export type GettbluserrolemappingsdataQuery = {
  __typename?: "query_root";
  Tbl_UserRoleMapping: Array<{
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
};

export const GettbluserrolemappingsdataDocument = gql`
  query gettbluserrolemappingsdata($userguid: uuid) {
    Tbl_UserRoleMapping(where: { UserGuid: { _eq: $userguid } }) {
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
  }
`;

/**
 * __useGettbluserrolemappingsdataQuery__
 *
 * To run a query within a React component, call `useGettbluserrolemappingsdataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGettbluserrolemappingsdataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGettbluserrolemappingsdataQuery({
 *   variables: {
 *      userguid: // value for 'userguid'
 *   },
 * });
 */
export function useGettbluserrolemappingsdataQuery(
  baseOptions?: Apollo.QueryHookOptions<
    GettbluserrolemappingsdataQuery,
    GettbluserrolemappingsdataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GettbluserrolemappingsdataQuery,
    GettbluserrolemappingsdataQueryVariables
  >(GettbluserrolemappingsdataDocument, options);
}
export function useGettbluserrolemappingsdataLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GettbluserrolemappingsdataQuery,
    GettbluserrolemappingsdataQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GettbluserrolemappingsdataQuery,
    GettbluserrolemappingsdataQueryVariables
  >(GettbluserrolemappingsdataDocument, options);
}
// @ts-ignore
export function useGettbluserrolemappingsdataSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GettbluserrolemappingsdataQuery,
    GettbluserrolemappingsdataQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GettbluserrolemappingsdataQuery,
  GettbluserrolemappingsdataQueryVariables
>;
export function useGettbluserrolemappingsdataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GettbluserrolemappingsdataQuery,
        GettbluserrolemappingsdataQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GettbluserrolemappingsdataQuery | undefined,
  GettbluserrolemappingsdataQueryVariables
>;
export function useGettbluserrolemappingsdataSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GettbluserrolemappingsdataQuery,
        GettbluserrolemappingsdataQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GettbluserrolemappingsdataQuery,
    GettbluserrolemappingsdataQueryVariables
  >(GettbluserrolemappingsdataDocument, options);
}
export type GettbluserrolemappingsdataQueryHookResult = ReturnType<
  typeof useGettbluserrolemappingsdataQuery
>;
export type GettbluserrolemappingsdataLazyQueryHookResult = ReturnType<
  typeof useGettbluserrolemappingsdataLazyQuery
>;
export type GettbluserrolemappingsdataSuspenseQueryHookResult = ReturnType<
  typeof useGettbluserrolemappingsdataSuspenseQuery
>;
export type GettbluserrolemappingsdataQueryResult = Apollo.QueryResult<
  GettbluserrolemappingsdataQuery,
  GettbluserrolemappingsdataQueryVariables
>;
