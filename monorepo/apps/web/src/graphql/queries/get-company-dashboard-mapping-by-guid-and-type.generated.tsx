import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyDashboardMappingByGuidAndTypeQueryVariables =
  Types.Exact<{
    companyGuid: Types.Scalars["uuid"]["input"];
    dashboardType: Types.Scalars["String"]["input"];
  }>;

export type GetCompanyDashboardMappingByGuidAndTypeQuery = {
  __typename?: "query_root";
  Tbl_CompanyDashboardMapping: Array<{
    __typename?: "Tbl_CompanyDashboardMapping";
    CompanyGuid?: any | null;
    CompanyDashboardMappingGuid: any;
    DashboardType?: string | null;
    Url?: string | null;
    CreatedDate: any;
    CreatedBy?: any | null;
    ModifiedDate: any;
    ModifiedBy?: any | null;
    CompanyType?: string | null;
    DisplayOrder?: any | null;
    ColumnSize?: any | null;
    IFrameStyle?: any | null;
    IsActive?: boolean | null;
    LocationUrl?: string | null;
    ReportName?: string | null;
    IsBorder?: boolean | null;
    IsPowerBiReport?: boolean | null;
    DashboardHeight?: any | null;
    HideTabs?: any | null;
    Tbl_Company?: {
      __typename?: "Tbl_Companies";
      CompanyGuid: any;
      CPanelCompanyId?: string | null;
      CompanyName?: string | null;
    } | null;
  }>;
};

export const GetCompanyDashboardMappingByGuidAndTypeDocument = gql`
  query GetCompanyDashboardMappingByGuidAndType(
    $companyGuid: uuid!
    $dashboardType: String!
  ) {
    Tbl_CompanyDashboardMapping(
      where: {
        CompanyGuid: { _eq: $companyGuid }
        DashboardType: { _eq: $dashboardType }
        IsActive: { _eq: true }
      }
      order_by: { DisplayOrder: desc }
    ) {
      CompanyGuid
      CompanyDashboardMappingGuid
      DashboardType
      Url
      CreatedDate
      CreatedBy
      ModifiedDate
      ModifiedBy
      CompanyType
      DisplayOrder
      ColumnSize
      IFrameStyle
      IsActive
      LocationUrl
      ReportName
      IsBorder
      IsPowerBiReport
      DashboardHeight
      HideTabs
      Tbl_Company {
        CompanyGuid
        CPanelCompanyId
        CompanyName
      }
    }
  }
`;

/**
 * __useGetCompanyDashboardMappingByGuidAndTypeQuery__
 *
 * To run a query within a React component, call `useGetCompanyDashboardMappingByGuidAndTypeQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDashboardMappingByGuidAndTypeQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDashboardMappingByGuidAndTypeQuery({
 *   variables: {
 *      companyGuid: // value for 'companyGuid'
 *      dashboardType: // value for 'dashboardType'
 *   },
 * });
 */
export function useGetCompanyDashboardMappingByGuidAndTypeQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyDashboardMappingByGuidAndTypeQuery,
    GetCompanyDashboardMappingByGuidAndTypeQueryVariables
  > &
    (
      | {
          variables: GetCompanyDashboardMappingByGuidAndTypeQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyDashboardMappingByGuidAndTypeQuery,
    GetCompanyDashboardMappingByGuidAndTypeQueryVariables
  >(GetCompanyDashboardMappingByGuidAndTypeDocument, options);
}
export function useGetCompanyDashboardMappingByGuidAndTypeLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyDashboardMappingByGuidAndTypeQuery,
    GetCompanyDashboardMappingByGuidAndTypeQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyDashboardMappingByGuidAndTypeQuery,
    GetCompanyDashboardMappingByGuidAndTypeQueryVariables
  >(GetCompanyDashboardMappingByGuidAndTypeDocument, options);
}
// @ts-ignore
export function useGetCompanyDashboardMappingByGuidAndTypeSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyDashboardMappingByGuidAndTypeQuery,
    GetCompanyDashboardMappingByGuidAndTypeQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDashboardMappingByGuidAndTypeQuery,
  GetCompanyDashboardMappingByGuidAndTypeQueryVariables
>;
export function useGetCompanyDashboardMappingByGuidAndTypeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDashboardMappingByGuidAndTypeQuery,
        GetCompanyDashboardMappingByGuidAndTypeQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDashboardMappingByGuidAndTypeQuery | undefined,
  GetCompanyDashboardMappingByGuidAndTypeQueryVariables
>;
export function useGetCompanyDashboardMappingByGuidAndTypeSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDashboardMappingByGuidAndTypeQuery,
        GetCompanyDashboardMappingByGuidAndTypeQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyDashboardMappingByGuidAndTypeQuery,
    GetCompanyDashboardMappingByGuidAndTypeQueryVariables
  >(GetCompanyDashboardMappingByGuidAndTypeDocument, options);
}
export type GetCompanyDashboardMappingByGuidAndTypeQueryHookResult = ReturnType<
  typeof useGetCompanyDashboardMappingByGuidAndTypeQuery
>;
export type GetCompanyDashboardMappingByGuidAndTypeLazyQueryHookResult =
  ReturnType<typeof useGetCompanyDashboardMappingByGuidAndTypeLazyQuery>;
export type GetCompanyDashboardMappingByGuidAndTypeSuspenseQueryHookResult =
  ReturnType<typeof useGetCompanyDashboardMappingByGuidAndTypeSuspenseQuery>;
export type GetCompanyDashboardMappingByGuidAndTypeQueryResult =
  Apollo.QueryResult<
    GetCompanyDashboardMappingByGuidAndTypeQuery,
    GetCompanyDashboardMappingByGuidAndTypeQueryVariables
  >;
