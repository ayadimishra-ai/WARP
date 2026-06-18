import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyDashboardMappingQueryVariables = Types.Exact<{
  companyGuid: Types.Scalars["uuid"]["input"];
  DashboardType: Types.Scalars["String"]["input"];
}>;

export type GetCompanyDashboardMappingQuery = {
  __typename?: "query_root";
  Tbl_CompanyDashboardMapping: Array<{
    __typename?: "Tbl_CompanyDashboardMapping";
    CompanyGuid?: any | null;
    CompanyType?: string | null;
    DashboardType?: string | null;
    Url?: string | null;
    DisplayOrder?: any | null;
    ColumnSize?: any | null;
    IFrameStyle?: any | null;
    IsActive?: boolean | null;
    ReportName?: string | null;
    DashboardHeight?: any | null;
    IsBorder?: boolean | null;
    LocationUrl?: string | null;
    IsPowerBiReport?: boolean | null;
  }>;
};

export const GetCompanyDashboardMappingDocument = gql`
  query GetCompanyDashboardMapping(
    $companyGuid: uuid!
    $DashboardType: String!
  ) {
    Tbl_CompanyDashboardMapping(
      where: {
        CompanyType: { _eq: "Portfolio Company" }
        DashboardType: { _eq: $DashboardType }
        CompanyGuid: { _eq: $companyGuid }
      }
    ) {
      CompanyGuid
      CompanyType
      DashboardType
      Url
      DisplayOrder
      ColumnSize
      IFrameStyle
      IsActive
      ReportName
      DashboardHeight
      IsBorder
      LocationUrl
      IsPowerBiReport
    }
  }
`;

/**
 * __useGetCompanyDashboardMappingQuery__
 *
 * To run a query within a React component, call `useGetCompanyDashboardMappingQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDashboardMappingQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDashboardMappingQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *      DashboardType: // value for 'DashboardType'
 *   },
 * });
 */
export function useGetCompanyDashboardMappingQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyDashboardMappingQuery,
    GetCompanyDashboardMappingQueryVariables
  > &
    (
      | { variables: GetCompanyDashboardMappingQueryVariables; skip?: boolean }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyDashboardMappingQuery,
    GetCompanyDashboardMappingQueryVariables
  >(GetCompanyDashboardMappingDocument, options);
}
export function useGetCompanyDashboardMappingLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyDashboardMappingQuery,
    GetCompanyDashboardMappingQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyDashboardMappingQuery,
    GetCompanyDashboardMappingQueryVariables
  >(GetCompanyDashboardMappingDocument, options);
}
// @ts-ignore
export function useGetCompanyDashboardMappingSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyDashboardMappingQuery,
    GetCompanyDashboardMappingQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDashboardMappingQuery,
  GetCompanyDashboardMappingQueryVariables
>;
export function useGetCompanyDashboardMappingSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDashboardMappingQuery,
        GetCompanyDashboardMappingQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDashboardMappingQuery | undefined,
  GetCompanyDashboardMappingQueryVariables
>;
export function useGetCompanyDashboardMappingSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDashboardMappingQuery,
        GetCompanyDashboardMappingQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyDashboardMappingQuery,
    GetCompanyDashboardMappingQueryVariables
  >(GetCompanyDashboardMappingDocument, options);
}
export type GetCompanyDashboardMappingQueryHookResult = ReturnType<
  typeof useGetCompanyDashboardMappingQuery
>;
export type GetCompanyDashboardMappingLazyQueryHookResult = ReturnType<
  typeof useGetCompanyDashboardMappingLazyQuery
>;
export type GetCompanyDashboardMappingSuspenseQueryHookResult = ReturnType<
  typeof useGetCompanyDashboardMappingSuspenseQuery
>;
export type GetCompanyDashboardMappingQueryResult = Apollo.QueryResult<
  GetCompanyDashboardMappingQuery,
  GetCompanyDashboardMappingQueryVariables
>;
