import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetPowerBiReportDetailsByGuidQueryVariables = Types.Exact<{
  guid: Types.Scalars["uuid"]["input"];
}>;

export type GetPowerBiReportDetailsByGuidQuery = {
  __typename?: "query_root";
  Tbl_PowerBIReportDetails: Array<{
    __typename?: "Tbl_PowerBIReportDetails";
    PowerBIGuid: any;
    PowerBIReportTokenDetails?: string | null;
    TokenExpirationTime?: any | null;
    DashboardHeight?: string | null;
    isBorder: boolean;
    isPowerBiReport: boolean;
  }>;
};

export const GetPowerBiReportDetailsByGuidDocument = gql`
  query GetPowerBiReportDetailsByGuid($guid: uuid!) {
    Tbl_PowerBIReportDetails(where: { PowerBIGuid: { _eq: $guid } }) {
      PowerBIGuid
      PowerBIReportTokenDetails
      TokenExpirationTime
      DashboardHeight
      isBorder
      isPowerBiReport
    }
  }
`;

/**
 * __useGetPowerBiReportDetailsByGuidQuery__
 *
 * To run a query within a React component, call `useGetPowerBiReportDetailsByGuidQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetPowerBiReportDetailsByGuidQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetPowerBiReportDetailsByGuidQuery({
 *   variables: {
 *      guid: // value for 'guid'
 *   },
 * });
 */
export function useGetPowerBiReportDetailsByGuidQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetPowerBiReportDetailsByGuidQuery,
    GetPowerBiReportDetailsByGuidQueryVariables
  > &
    (
      | {
          variables: GetPowerBiReportDetailsByGuidQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetPowerBiReportDetailsByGuidQuery,
    GetPowerBiReportDetailsByGuidQueryVariables
  >(GetPowerBiReportDetailsByGuidDocument, options);
}
export function useGetPowerBiReportDetailsByGuidLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetPowerBiReportDetailsByGuidQuery,
    GetPowerBiReportDetailsByGuidQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetPowerBiReportDetailsByGuidQuery,
    GetPowerBiReportDetailsByGuidQueryVariables
  >(GetPowerBiReportDetailsByGuidDocument, options);
}
// @ts-ignore
export function useGetPowerBiReportDetailsByGuidSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetPowerBiReportDetailsByGuidQuery,
    GetPowerBiReportDetailsByGuidQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetPowerBiReportDetailsByGuidQuery,
  GetPowerBiReportDetailsByGuidQueryVariables
>;
export function useGetPowerBiReportDetailsByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPowerBiReportDetailsByGuidQuery,
        GetPowerBiReportDetailsByGuidQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetPowerBiReportDetailsByGuidQuery | undefined,
  GetPowerBiReportDetailsByGuidQueryVariables
>;
export function useGetPowerBiReportDetailsByGuidSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetPowerBiReportDetailsByGuidQuery,
        GetPowerBiReportDetailsByGuidQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetPowerBiReportDetailsByGuidQuery,
    GetPowerBiReportDetailsByGuidQueryVariables
  >(GetPowerBiReportDetailsByGuidDocument, options);
}
export type GetPowerBiReportDetailsByGuidQueryHookResult = ReturnType<
  typeof useGetPowerBiReportDetailsByGuidQuery
>;
export type GetPowerBiReportDetailsByGuidLazyQueryHookResult = ReturnType<
  typeof useGetPowerBiReportDetailsByGuidLazyQuery
>;
export type GetPowerBiReportDetailsByGuidSuspenseQueryHookResult = ReturnType<
  typeof useGetPowerBiReportDetailsByGuidSuspenseQuery
>;
export type GetPowerBiReportDetailsByGuidQueryResult = Apollo.QueryResult<
  GetPowerBiReportDetailsByGuidQuery,
  GetPowerBiReportDetailsByGuidQueryVariables
>;
