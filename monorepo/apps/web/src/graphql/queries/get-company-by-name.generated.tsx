import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyByNameQueryVariables = Types.Exact<{
  companyName: Types.Scalars["String"]["input"];
}>;

export type GetCompanyByNameQuery = {
  __typename?: "query_root";
  Tbl_Companies: Array<{
    __typename?: "Tbl_Companies";
    CompanyGuid: any;
    CompanyName?: string | null;
    CPanelCompanyId?: string | null;
  }>;
};

export const GetCompanyByNameDocument = gql`
  query GetCompanyByName($companyName: String!) {
    Tbl_Companies(where: { CompanyName: { _eq: $companyName } }) {
      CompanyGuid
      CompanyName
      CPanelCompanyId
    }
  }
`;

/**
 * __useGetCompanyByNameQuery__
 *
 * To run a query within a React component, call `useGetCompanyByNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyByNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyByNameQuery({
 *   variables: {
 *      companyName: // value for 'companyName'
 *   },
 * });
 */
export function useGetCompanyByNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyByNameQuery,
    GetCompanyByNameQueryVariables
  > &
    (
      | { variables: GetCompanyByNameQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetCompanyByNameQuery, GetCompanyByNameQueryVariables>(
    GetCompanyByNameDocument,
    options
  );
}
export function useGetCompanyByNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyByNameQuery,
    GetCompanyByNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyByNameQuery,
    GetCompanyByNameQueryVariables
  >(GetCompanyByNameDocument, options);
}
// @ts-ignore
export function useGetCompanyByNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyByNameQuery,
    GetCompanyByNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyByNameQuery,
  GetCompanyByNameQueryVariables
>;
export function useGetCompanyByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyByNameQuery,
        GetCompanyByNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyByNameQuery | undefined,
  GetCompanyByNameQueryVariables
>;
export function useGetCompanyByNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyByNameQuery,
        GetCompanyByNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyByNameQuery,
    GetCompanyByNameQueryVariables
  >(GetCompanyByNameDocument, options);
}
export type GetCompanyByNameQueryHookResult = ReturnType<
  typeof useGetCompanyByNameQuery
>;
export type GetCompanyByNameLazyQueryHookResult = ReturnType<
  typeof useGetCompanyByNameLazyQuery
>;
export type GetCompanyByNameSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyByNameSuspenseQuery
>;
export type GetCompanyByNameQueryResult = Apollo.QueryResult<
  GetCompanyByNameQuery,
  GetCompanyByNameQueryVariables
>;
