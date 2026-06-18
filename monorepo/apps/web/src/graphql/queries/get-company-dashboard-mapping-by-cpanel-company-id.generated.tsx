import type * as Types from "../types";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables =
  Types.Exact<{
    cpanelCompanyId: Types.Scalars["String"]["input"];
  }>;

export type GetCompanyDashboardMappingByCpanelCompanyIdQuery = {
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
    Tbl_Company?: {
      __typename?: "Tbl_Companies";
      CompanyGuid: any;
      CPanelCompanyId?: string | null;
      CompanyName?: string | null;
    } | null;
  }>;
};

export const GetCompanyDashboardMappingByCpanelCompanyIdDocument = gql`
  query GetCompanyDashboardMappingByCpanelCompanyId($cpanelCompanyId: String!) {
    Tbl_CompanyDashboardMapping(
      where: {
        IsActive: { _eq: true }
        Tbl_Company: { CPanelCompanyId: { _eq: $cpanelCompanyId } }
      }
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
      Tbl_Company {
        CompanyGuid
        CPanelCompanyId
        CompanyName
      }
    }
  }
`;

/**
 * __useGetCompanyDashboardMappingByCpanelCompanyIdQuery__
 *
 * To run a query within a React component, call `useGetCompanyDashboardMappingByCpanelCompanyIdQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetCompanyDashboardMappingByCpanelCompanyIdQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetCompanyDashboardMappingByCpanelCompanyIdQuery({
 *   variables: {
 *      cpanelCompanyId: // value for 'cpanelCompanyId'
 *   },
 * });
 */
export function useGetCompanyDashboardMappingByCpanelCompanyIdQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetCompanyDashboardMappingByCpanelCompanyIdQuery,
    GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
  > &
    (
      | {
          variables: GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetCompanyDashboardMappingByCpanelCompanyIdQuery,
    GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
  >(GetCompanyDashboardMappingByCpanelCompanyIdDocument, options);
}
export function useGetCompanyDashboardMappingByCpanelCompanyIdLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetCompanyDashboardMappingByCpanelCompanyIdQuery,
    GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetCompanyDashboardMappingByCpanelCompanyIdQuery,
    GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
  >(GetCompanyDashboardMappingByCpanelCompanyIdDocument, options);
}
// @ts-ignore
export function useGetCompanyDashboardMappingByCpanelCompanyIdSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetCompanyDashboardMappingByCpanelCompanyIdQuery,
    GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDashboardMappingByCpanelCompanyIdQuery,
  GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
>;
export function useGetCompanyDashboardMappingByCpanelCompanyIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDashboardMappingByCpanelCompanyIdQuery,
        GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetCompanyDashboardMappingByCpanelCompanyIdQuery | undefined,
  GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
>;
export function useGetCompanyDashboardMappingByCpanelCompanyIdSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetCompanyDashboardMappingByCpanelCompanyIdQuery,
        GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetCompanyDashboardMappingByCpanelCompanyIdQuery,
    GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
  >(GetCompanyDashboardMappingByCpanelCompanyIdDocument, options);
}
export type GetCompanyDashboardMappingByCpanelCompanyIdQueryHookResult =
  ReturnType<typeof useGetCompanyDashboardMappingByCpanelCompanyIdQuery>;
export type GetCompanyDashboardMappingByCpanelCompanyIdLazyQueryHookResult =
  ReturnType<typeof useGetCompanyDashboardMappingByCpanelCompanyIdLazyQuery>;
export type GetCompanyDashboardMappingByCpanelCompanyIdSuspenseQueryHookResult =
  ReturnType<
    typeof useGetCompanyDashboardMappingByCpanelCompanyIdSuspenseQuery
  >;
export type GetCompanyDashboardMappingByCpanelCompanyIdQueryResult =
  Apollo.QueryResult<
    GetCompanyDashboardMappingByCpanelCompanyIdQuery,
    GetCompanyDashboardMappingByCpanelCompanyIdQueryVariables
  >;
