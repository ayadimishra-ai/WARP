import * as Types from "../shared/types.js";

import { gql } from "@apollo/client";
import * as Apollo from "@apollo/client";
const defaultOptions = {} as const;
export type GetSupplierKpiDataByMonthYearQueryVariables = Types.Exact<{
  whereTransportation: Types.KpiEmissionByTransportation_Bool_Exp;
  whereMaterialConsumption: Types.KpiEmissionByMaterialConsumption_Bool_Exp;
  wherePowerConsumption: Types.KpiEmissionByPowerConsumption_Bool_Exp;
  whereFuelConsumption: Types.KpiEmissionByFuelConsumption_Bool_Exp;
  whereWasteGeneration: Types.KpiEmissionByWasteGeneration_Bool_Exp;
  whereKpiMain: Types.KpiMain_Bool_Exp;
}>;

export type GetSupplierKpiDataByMonthYearQuery = {
  __typename?: "query_root";
  kpiEmissionByTransportation: Array<{
    __typename?: "KPIEmissionByTransportation";
    organization_id: any;
    address_id: any;
    year: any;
    month: any;
    kpi_em_UpstreamTransport: any;
  }>;
  kpiEmissionByMaterialConsumption: Array<{
    __typename?: "KPIEmissionByMaterialConsumption";
    organization_id: any;
    address_id: any;
    year: any;
    month: any;
    kpi_em_TotalEmission_MaterialProcurement: any;
  }>;
  kpiEmissionByPowerConsumption: Array<{
    __typename?: "KPIEmissionByPowerConsumption";
    organization_id: any;
    address_id: any;
    year: any;
    month: any;
    kpi_em_TotalPowerPurchased: any;
    kpi_em_CaptivePower: any;
  }>;
  kpiEmissionByFuelConsumption: Array<{
    __typename?: "KPIEmissionByFuelConsumption";
    organization_id: any;
    address_id: any;
    year: any;
    month: any;
    kpi_em_TotalEmission_FuelConsumption?: any | null;
  }>;
  kpiEmissionByWasteGeneration: Array<{
    __typename?: "KPIEmissionByWasteGeneration";
    organization_id: any;
    address_id: any;
    year: any;
    month: any;
    kpi_em_TotalEmission_WasteGeneration: any;
  }>;
  kpiMain: Array<{
    __typename?: "KPIMain";
    organization_id: any;
    address_id: any;
    year: any;
    month: any;
    kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction?: any | null;
  }>;
};

export const GetSupplierKpiDataByMonthYearDocument = gql`
  query GetSupplierKPIDataByMonthYear(
    $whereTransportation: KPIEmissionByTransportation_bool_exp!
    $whereMaterialConsumption: KPIEmissionByMaterialConsumption_bool_exp!
    $wherePowerConsumption: KPIEmissionByPowerConsumption_bool_exp!
    $whereFuelConsumption: KPIEmissionByFuelConsumption_bool_exp!
    $whereWasteGeneration: KPIEmissionByWasteGeneration_bool_exp!
    $whereKpiMain: KPIMain_bool_exp!
  ) {
    kpiEmissionByTransportation: KPIEmissionByTransportation(
      where: $whereTransportation
      order_by: { year: asc, month: asc }
    ) {
      organization_id
      address_id
      year
      month
      kpi_em_UpstreamTransport
    }
    kpiEmissionByMaterialConsumption: KPIEmissionByMaterialConsumption(
      where: $whereMaterialConsumption
      order_by: { year: asc, month: asc }
    ) {
      organization_id
      address_id
      year
      month
      kpi_em_TotalEmission_MaterialProcurement
    }
    kpiEmissionByPowerConsumption: KPIEmissionByPowerConsumption(
      where: $wherePowerConsumption
      order_by: { year: asc, month: asc }
    ) {
      organization_id
      address_id
      year
      month
      kpi_em_TotalPowerPurchased
      kpi_em_CaptivePower
    }
    kpiEmissionByFuelConsumption: KPIEmissionByFuelConsumption(
      where: $whereFuelConsumption
      order_by: { year: asc, month: asc }
    ) {
      organization_id
      address_id
      year
      month
      kpi_em_TotalEmission_FuelConsumption
    }
    kpiEmissionByWasteGeneration: KPIEmissionByWasteGeneration(
      where: $whereWasteGeneration
      order_by: { year: asc, month: asc }
    ) {
      organization_id
      address_id
      year
      month
      kpi_em_TotalEmission_WasteGeneration
    }
    kpiMain: KPIMain(
      where: $whereKpiMain
      order_by: { year: asc, month: asc }
    ) {
      organization_id
      address_id
      year
      month
      kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction
    }
  }
`;

/**
 * __useGetSupplierKpiDataByMonthYearQuery__
 *
 * To run a query within a React component, call `useGetSupplierKpiDataByMonthYearQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetSupplierKpiDataByMonthYearQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetSupplierKpiDataByMonthYearQuery({
 *   variables: {
 *      whereTransportation: // value for 'whereTransportation'
 *      whereMaterialConsumption: // value for 'whereMaterialConsumption'
 *      wherePowerConsumption: // value for 'wherePowerConsumption'
 *      whereFuelConsumption: // value for 'whereFuelConsumption'
 *      whereWasteGeneration: // value for 'whereWasteGeneration'
 *      whereKpiMain: // value for 'whereKpiMain'
 *   },
 * });
 */
export function useGetSupplierKpiDataByMonthYearQuery(
  baseOptions: Apollo.QueryHookOptions<
    GetSupplierKpiDataByMonthYearQuery,
    GetSupplierKpiDataByMonthYearQueryVariables
  > &
    (
      | {
          variables: GetSupplierKpiDataByMonthYearQueryVariables;
          skip?: boolean;
        }
      | { skip: boolean }
    )
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<
    GetSupplierKpiDataByMonthYearQuery,
    GetSupplierKpiDataByMonthYearQueryVariables
  >(GetSupplierKpiDataByMonthYearDocument, options);
}
export function useGetSupplierKpiDataByMonthYearLazyQuery(
  baseOptions?: Apollo.LazyQueryHookOptions<
    GetSupplierKpiDataByMonthYearQuery,
    GetSupplierKpiDataByMonthYearQueryVariables
  >
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useLazyQuery<
    GetSupplierKpiDataByMonthYearQuery,
    GetSupplierKpiDataByMonthYearQueryVariables
  >(GetSupplierKpiDataByMonthYearDocument, options);
}
// @ts-ignore
export function useGetSupplierKpiDataByMonthYearSuspenseQuery(
  baseOptions?: Apollo.SuspenseQueryHookOptions<
    GetSupplierKpiDataByMonthYearQuery,
    GetSupplierKpiDataByMonthYearQueryVariables
  >
): Apollo.UseSuspenseQueryResult<
  GetSupplierKpiDataByMonthYearQuery,
  GetSupplierKpiDataByMonthYearQueryVariables
>;
export function useGetSupplierKpiDataByMonthYearSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierKpiDataByMonthYearQuery,
        GetSupplierKpiDataByMonthYearQueryVariables
      >
): Apollo.UseSuspenseQueryResult<
  GetSupplierKpiDataByMonthYearQuery | undefined,
  GetSupplierKpiDataByMonthYearQueryVariables
>;
export function useGetSupplierKpiDataByMonthYearSuspenseQuery(
  baseOptions?:
    | Apollo.SkipToken
    | Apollo.SuspenseQueryHookOptions<
        GetSupplierKpiDataByMonthYearQuery,
        GetSupplierKpiDataByMonthYearQueryVariables
      >
) {
  const options =
    baseOptions === Apollo.skipToken
      ? baseOptions
      : { ...defaultOptions, ...baseOptions };
  return Apollo.useSuspenseQuery<
    GetSupplierKpiDataByMonthYearQuery,
    GetSupplierKpiDataByMonthYearQueryVariables
  >(GetSupplierKpiDataByMonthYearDocument, options);
}
export type GetSupplierKpiDataByMonthYearQueryHookResult = ReturnType<
  typeof useGetSupplierKpiDataByMonthYearQuery
>;
export type GetSupplierKpiDataByMonthYearLazyQueryHookResult = ReturnType<
  typeof useGetSupplierKpiDataByMonthYearLazyQuery
>;
export type GetSupplierKpiDataByMonthYearSuspenseQueryHookResult = ReturnType<
  typeof useGetSupplierKpiDataByMonthYearSuspenseQuery
>;
export type GetSupplierKpiDataByMonthYearQueryResult = Apollo.QueryResult<
  GetSupplierKpiDataByMonthYearQuery,
  GetSupplierKpiDataByMonthYearQueryVariables
>;
