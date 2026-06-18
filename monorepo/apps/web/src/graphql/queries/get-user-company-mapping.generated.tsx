import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetUserCompanyMappingQueryVariables = Types.Exact<{
  userGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetUserCompanyMappingQuery = {
  __typename?: "query_root";
  Tbl_UserCompanyMapping: Array<{
    __typename?: "Tbl_UserCompanyMapping";
    CompanyGuid?: any | null;
  }>;
};

export const GetUserCompanyMappingDocument = gql`
  query GetUserCompanyMapping($userGuid: uuid!) {
    Tbl_UserCompanyMapping(where: { UserGuid: { _eq: $userGuid } }) {
      CompanyGuid
    }
  }
`;

/**
 * __useGetUserCompanyMappingQuery__
 *
 * To run a query within a React component, call `useGetUserCompanyMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetUserCompanyMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetUserCompanyMappingQuery({
 *   variables: {
 *      userGuid: // value for 'userGuid'
 *   },
 * });
 */
export function useGetUserCompanyMappingQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetUserCompanyMappingQuery,
    GetUserCompanyMappingQueryVariables
  > &
    (
      | { variables: GetUserCompanyMappingQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetUserCompanyMappingQuery,
    GetUserCompanyMappingQueryVariables
  >(GetUserCompanyMappingDocument, options);
}
export function useGetUserCompanyMappingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetUserCompanyMappingQuery,
    GetUserCompanyMappingQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetUserCompanyMappingQuery,
    GetUserCompanyMappingQueryVariables
  >(GetUserCompanyMappingDocument, options);
}
// @ts-ignore
export function useGetUserCompanyMappingSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetUserCompanyMappingQuery,
    GetUserCompanyMappingQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetUserCompanyMappingQuery,
  GetUserCompanyMappingQueryVariables
>;
export function useGetUserCompanyMappingSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserCompanyMappingQuery,
        GetUserCompanyMappingQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetUserCompanyMappingQuery | undefined,
  GetUserCompanyMappingQueryVariables
>;
export function useGetUserCompanyMappingSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetUserCompanyMappingQuery,
        GetUserCompanyMappingQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetUserCompanyMappingQuery,
    GetUserCompanyMappingQueryVariables
  >(GetUserCompanyMappingDocument, options);
}
export type GetUserCompanyMappingQueryHookResult = ReturnType<
  typeof useGetUserCompanyMappingQuery
>;
export type GetUserCompanyMappingLazyQueryHookResult = ReturnType<
  typeof useGetUserCompanyMappingLazyQuery
>;
export type GetUserCompanyMappingSuspenseQueryHookResult = ReturnType<
  typeof useGetUserCompanyMappingSuspenseQuery
>;
export type GetUserCompanyMappingQueryResult = Apollo.QueryResult<
  GetUserCompanyMappingQuery,
  GetUserCompanyMappingQueryVariables
>;
