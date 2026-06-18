import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetOpsCompanyDbDetailsQueryVariables = Types.Exact<{
  companyGuid: Types.Scalars["uuid"]["input"];
}>;

export type GetOpsCompanyDbDetailsQuery = {
  __typename?: "query_root";
  Tbl_OPsCompanyDBDetails: Array<{
    __typename?: "Tbl_OPsCompanyDBDetails";
    AccessTokenUrl?: string | null;
    PlatformSecret?: string | null;
  }>;
};

export const GetOpsCompanyDbDetailsDocument = gql`
  query GetOpsCompanyDbDetails($companyGuid: uuid!) {
    Tbl_OPsCompanyDBDetails(where: { CompanyGuid: { _eq: $companyGuid } }) {
      AccessTokenUrl
      PlatformSecret
    }
  }
`;

/**
 * __useGetOpsCompanyDbDetailsQuery__
 *
 * To run a query within a React component, call `useGetOpsCompanyDbDetailsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetOpsCompanyDbDetailsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetOpsCompanyDbDetailsQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *   },
 * });
 */
export function useGetOpsCompanyDbDetailsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetOpsCompanyDbDetailsQuery,
    GetOpsCompanyDbDetailsQueryVariables
  > &
    (
      | { variables: GetOpsCompanyDbDetailsQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetOpsCompanyDbDetailsQuery,
    GetOpsCompanyDbDetailsQueryVariables
  >(GetOpsCompanyDbDetailsDocument, options);
}
export function useGetOpsCompanyDbDetailsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetOpsCompanyDbDetailsQuery,
    GetOpsCompanyDbDetailsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetOpsCompanyDbDetailsQuery,
    GetOpsCompanyDbDetailsQueryVariables
  >(GetOpsCompanyDbDetailsDocument, options);
}
// @ts-ignore
export function useGetOpsCompanyDbDetailsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetOpsCompanyDbDetailsQuery,
    GetOpsCompanyDbDetailsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetOpsCompanyDbDetailsQuery,
  GetOpsCompanyDbDetailsQueryVariables
>;
export function useGetOpsCompanyDbDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOpsCompanyDbDetailsQuery,
        GetOpsCompanyDbDetailsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetOpsCompanyDbDetailsQuery | undefined,
  GetOpsCompanyDbDetailsQueryVariables
>;
export function useGetOpsCompanyDbDetailsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetOpsCompanyDbDetailsQuery,
        GetOpsCompanyDbDetailsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetOpsCompanyDbDetailsQuery,
    GetOpsCompanyDbDetailsQueryVariables
  >(GetOpsCompanyDbDetailsDocument, options);
}
export type GetOpsCompanyDbDetailsQueryHookResult = ReturnType<
  typeof useGetOpsCompanyDbDetailsQuery
>;
export type GetOpsCompanyDbDetailsLazyQueryHookResult = ReturnType<
  typeof useGetOpsCompanyDbDetailsLazyQuery
>;
export type GetOpsCompanyDbDetailsSuspenseQueryHookResult = ReturnType<
  typeof useGetOpsCompanyDbDetailsSuspenseQuery
>;
export type GetOpsCompanyDbDetailsQueryResult = Apollo.QueryResult<
  GetOpsCompanyDbDetailsQuery,
  GetOpsCompanyDbDetailsQueryVariables
>;
