import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPowerBiReportDetailsByReportNameQueryVariables = Types.Exact<{
  rname: Types.Scalars["String"]["input"];
}>;

export type GetPowerBiReportDetailsByReportNameQuery = {
  __typename?: "query_root";
  Tbl_PowerBIReportDetails: Array<{
    __typename?: "Tbl_PowerBIReportDetails";
    TokenExpirationTime?: any | null;
    PowerBIReportFilters?: string | null;
    PowerBIReportSections?: string | null;
    PowerBIGuid: any;
    PowerBIReportTokenDetails?: string | null;
    DashboardHeight?: string | null;
    isBorder: boolean;
    isPowerBiReport: boolean;
  }>;
};

export const GetPowerBiReportDetailsByReportNameDocument = gql`
  query GetPowerBiReportDetailsByReportName($rname: String!) {
    Tbl_PowerBIReportDetails(where: { PowerBIReportName: { _eq: $rname } }) {
      TokenExpirationTime
      PowerBIReportFilters
      PowerBIReportSections
      PowerBIGuid
      PowerBIReportTokenDetails
      DashboardHeight
      isBorder
      isPowerBiReport
    }
  }
`;

/**
 * __useGetPowerBiReportDetailsByReportNameQuery__
 *
 * To run a query within a React component, call `useGetPowerBiReportDetailsByReportNameQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPowerBiReportDetailsByReportNameQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPowerBiReportDetailsByReportNameQuery({
 *   variables: {
 *      rname: // value for 'rname'
 *   },
 * });
 */
export function useGetPowerBiReportDetailsByReportNameQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPowerBiReportDetailsByReportNameQuery,
    GetPowerBiReportDetailsByReportNameQueryVariables
  > &
    (
      | {
          variables: GetPowerBiReportDetailsByReportNameQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPowerBiReportDetailsByReportNameQuery,
    GetPowerBiReportDetailsByReportNameQueryVariables
  >(GetPowerBiReportDetailsByReportNameDocument, options);
}
export function useGetPowerBiReportDetailsByReportNameLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPowerBiReportDetailsByReportNameQuery,
    GetPowerBiReportDetailsByReportNameQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPowerBiReportDetailsByReportNameQuery,
    GetPowerBiReportDetailsByReportNameQueryVariables
  >(GetPowerBiReportDetailsByReportNameDocument, options);
}
// @ts-ignore
export function useGetPowerBiReportDetailsByReportNameSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPowerBiReportDetailsByReportNameQuery,
    GetPowerBiReportDetailsByReportNameQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPowerBiReportDetailsByReportNameQuery,
  GetPowerBiReportDetailsByReportNameQueryVariables
>;
export function useGetPowerBiReportDetailsByReportNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPowerBiReportDetailsByReportNameQuery,
        GetPowerBiReportDetailsByReportNameQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPowerBiReportDetailsByReportNameQuery | undefined,
  GetPowerBiReportDetailsByReportNameQueryVariables
>;
export function useGetPowerBiReportDetailsByReportNameSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPowerBiReportDetailsByReportNameQuery,
        GetPowerBiReportDetailsByReportNameQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPowerBiReportDetailsByReportNameQuery,
    GetPowerBiReportDetailsByReportNameQueryVariables
  >(GetPowerBiReportDetailsByReportNameDocument, options);
}
export type GetPowerBiReportDetailsByReportNameQueryHookResult = ReturnType<
  typeof useGetPowerBiReportDetailsByReportNameQuery
>;
export type GetPowerBiReportDetailsByReportNameLazyQueryHookResult = ReturnType<
  typeof useGetPowerBiReportDetailsByReportNameLazyQuery
>;
export type GetPowerBiReportDetailsByReportNameSuspenseQueryHookResult =
  ReturnType<typeof useGetPowerBiReportDetailsByReportNameSuspenseQuery>;
export type GetPowerBiReportDetailsByReportNameQueryResult = Apollo.QueryResult<
  GetPowerBiReportDetailsByReportNameQuery,
  GetPowerBiReportDetailsByReportNameQueryVariables
>;
