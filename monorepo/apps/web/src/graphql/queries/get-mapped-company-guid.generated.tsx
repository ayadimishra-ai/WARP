import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetMappedCompanyGuidQueryVariables = Types.Exact<{
  DashboardType: Types.Scalars["String"]["input"];
}>;

export type GetMappedCompanyGuidQuery = {
  __typename?: "query_root";
  Tbl_CompanyDashboardMapping: Array<{
    __typename?: "Tbl_CompanyDashboardMapping";
    CompanyGuid?: any | null;
  }>;
};

export const GetMappedCompanyGuidDocument = gql`
  query GetMappedCompanyGuid($DashboardType: String!) {
    Tbl_CompanyDashboardMapping(
      where: {
        CompanyType: { _eq: "Portfolio Company" }
        DashboardType: { _eq: $DashboardType }
      }
      limit: 1
    ) {
      CompanyGuid
    }
  }
`;

/**
 * __useGetMappedCompanyGuidQuery__
 *
 * To run a query within a React component, call `useGetMappedCompanyGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetMappedCompanyGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetMappedCompanyGuidQuery({
 *   variables: {
 *      DashboardType: // value for 'DashboardType'
 *   },
 * });
 */
export function useGetMappedCompanyGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetMappedCompanyGuidQuery,
    GetMappedCompanyGuidQueryVariables
  > &
    (
      | { variables: GetMappedCompanyGuidQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetMappedCompanyGuidQuery,
    GetMappedCompanyGuidQueryVariables
  >(GetMappedCompanyGuidDocument, options);
}
export function useGetMappedCompanyGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetMappedCompanyGuidQuery,
    GetMappedCompanyGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetMappedCompanyGuidQuery,
    GetMappedCompanyGuidQueryVariables
  >(GetMappedCompanyGuidDocument, options);
}
// @ts-ignore
export function useGetMappedCompanyGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetMappedCompanyGuidQuery,
    GetMappedCompanyGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetMappedCompanyGuidQuery,
  GetMappedCompanyGuidQueryVariables
>;
export function useGetMappedCompanyGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMappedCompanyGuidQuery,
        GetMappedCompanyGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetMappedCompanyGuidQuery | undefined,
  GetMappedCompanyGuidQueryVariables
>;
export function useGetMappedCompanyGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetMappedCompanyGuidQuery,
        GetMappedCompanyGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetMappedCompanyGuidQuery,
    GetMappedCompanyGuidQueryVariables
  >(GetMappedCompanyGuidDocument, options);
}
export type GetMappedCompanyGuidQueryHookResult = ReturnType<
  typeof useGetMappedCompanyGuidQuery
>;
export type GetMappedCompanyGuidLazyQueryHookResult = ReturnType<
  typeof useGetMappedCompanyGuidLazyQuery
>;
export type GetMappedCompanyGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetMappedCompanyGuidSuspenseQuery
>;
export type GetMappedCompanyGuidQueryResult = Apollo.QueryResult<
  GetMappedCompanyGuidQuery,
  GetMappedCompanyGuidQueryVariables
>;
