import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyDetailsByDynamicColumnsQueryVariables = Types.Exact<{
  where: Types.Tbl_Companies_Bool_Exp;
}>;

export type GetCompanyDetailsByDynamicColumnsQuery = {
  __typename?: "query_root";
  Tbl_Companies: Array<{
    __typename?: "Tbl_Companies";
    CompanyGuid: any;
    CPanelCompanyId?: string | null;
    OPSCompanyId?: string | null;
    CompanyName?: string | null;
    StatusGuid?: any | null;
    IsActive?: boolean | null;
    IsManufacturing?: boolean | null;
    CPanelCompanyIndustry?: string | null;
    CountryGuid?: any | null;
  }>;
};

export const GetCompanyDetailsByDynamicColumnsDocument = gql`
  query GetCompanyDetailsByDynamicColumns($where: Tbl_Companies_bool_exp!) {
    Tbl_Companies(where: $where) {
      CompanyGuid
      CPanelCompanyId
      OPSCompanyId
      CompanyName
      StatusGuid
      IsActive
      IsManufacturing
      CPanelCompanyIndustry
      CountryGuid
    }
  }
`;

/**
 * __useGetCompanyDetailsByDynamicColumnsQuery__
 *
 * To run a query within a React component, call `useGetCompanyDetailsByDynamicColumnsQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDetailsByDynamicColumnsQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDetailsByDynamicColumnsQuery({
 *   variables: {
 *      where: // value for 'where'
 *   },
 * });
 */
export function useGetCompanyDetailsByDynamicColumnsQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyDetailsByDynamicColumnsQuery,
    GetCompanyDetailsByDynamicColumnsQueryVariables
  > &
    (
      | {
          variables: GetCompanyDetailsByDynamicColumnsQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyDetailsByDynamicColumnsQuery,
    GetCompanyDetailsByDynamicColumnsQueryVariables
  >(GetCompanyDetailsByDynamicColumnsDocument, options);
}
export function useGetCompanyDetailsByDynamicColumnsLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyDetailsByDynamicColumnsQuery,
    GetCompanyDetailsByDynamicColumnsQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyDetailsByDynamicColumnsQuery,
    GetCompanyDetailsByDynamicColumnsQueryVariables
  >(GetCompanyDetailsByDynamicColumnsDocument, options);
}
// @ts-ignore
export function useGetCompanyDetailsByDynamicColumnsSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyDetailsByDynamicColumnsQuery,
    GetCompanyDetailsByDynamicColumnsQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDetailsByDynamicColumnsQuery,
  GetCompanyDetailsByDynamicColumnsQueryVariables
>;
export function useGetCompanyDetailsByDynamicColumnsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDetailsByDynamicColumnsQuery,
        GetCompanyDetailsByDynamicColumnsQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDetailsByDynamicColumnsQuery | undefined,
  GetCompanyDetailsByDynamicColumnsQueryVariables
>;
export function useGetCompanyDetailsByDynamicColumnsSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDetailsByDynamicColumnsQuery,
        GetCompanyDetailsByDynamicColumnsQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyDetailsByDynamicColumnsQuery,
    GetCompanyDetailsByDynamicColumnsQueryVariables
  >(GetCompanyDetailsByDynamicColumnsDocument, options);
}
export type GetCompanyDetailsByDynamicColumnsQueryHookResult = ReturnType<
  typeof useGetCompanyDetailsByDynamicColumnsQuery
>;
export type GetCompanyDetailsByDynamicColumnsLazyQueryHookResult = ReturnType<
  typeof useGetCompanyDetailsByDynamicColumnsLazyQuery
>;
export type GetCompanyDetailsByDynamicColumnsSuspenseQueryHookResult =
  ReturnType<typeof useGetCompanyDetailsByDynamicColumnsSuspenseQuery>;
export type GetCompanyDetailsByDynamicColumnsQueryResult = Apollo.QueryResult<
  GetCompanyDetailsByDynamicColumnsQuery,
  GetCompanyDetailsByDynamicColumnsQueryVariables
>;
