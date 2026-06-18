import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyDetailsQueryVariables = Types.Exact<{
  companyGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetCompanyDetailsQuery = {
  __typename?: "query_root";
  Tbl_Companies: Array<{
    __typename?: "Tbl_Companies";
    CompanyGuid: any;
    CompanyName?: string | null;
    cpanelCompanyId?: string | null;
    opsCompanyId?: string | null;
  }>;
};

export const GetCompanyDetailsDocument = gql`
  query GetCompanyDetails($companyGuid: uuid!) {
    Tbl_Companies(where: { CompanyGuid: { _eq: $companyGuid } }) {
      CompanyGuid
      cpanelCompanyId: CPanelCompanyId
      opsCompanyId: OPSCompanyId
      CompanyName
    }
  }
`;

/**
 * __useGetCompanyDetailsQuery__
 *
 * To run a query within a React component, call `useGetCompanyDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDetailsQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *   },
 * });
 */
export function useGetCompanyDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyDetailsQuery,
    GetCompanyDetailsQueryVariables
  > &
    (
      | { variables: GetCompanyDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyDetailsQuery,
    GetCompanyDetailsQueryVariables
  >(GetCompanyDetailsDocument, options);
}
export function useGetCompanyDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyDetailsQuery,
    GetCompanyDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyDetailsQuery,
    GetCompanyDetailsQueryVariables
  >(GetCompanyDetailsDocument, options);
}
// @ts-ignore
export function useGetCompanyDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyDetailsQuery,
    GetCompanyDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDetailsQuery,
  GetCompanyDetailsQueryVariables
>;
export function useGetCompanyDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDetailsQuery,
        GetCompanyDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDetailsQuery | undefined,
  GetCompanyDetailsQueryVariables
>;
export function useGetCompanyDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDetailsQuery,
        GetCompanyDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyDetailsQuery,
    GetCompanyDetailsQueryVariables
  >(GetCompanyDetailsDocument, options);
}
export type GetCompanyDetailsQueryHookResult = ReturnType<
  typeof useGetCompanyDetailsQuery
>;
export type GetCompanyDetailsLazyQueryHookResult = ReturnType<
  typeof useGetCompanyDetailsLazyQuery
>;
export type GetCompanyDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyDetailsSuspenseQuery
>;
export type GetCompanyDetailsQueryResult = Apollo.QueryResult<
  GetCompanyDetailsQuery,
  GetCompanyDetailsQueryVariables
>;
