import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetKpiDataQueryVariables = Types.Exact<{
  organization_id: Types.Scalars['uuid']['input'];
}>;


export type GetKpiDataQuery = { __typename?: 'query_root', kpiMain: Array<{ __typename?: 'KPIMain', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_uom: string, kpi_em_Total_Emission: any, kpi_em_Total_Emission_Scope1: any, kpi_em_Total_Emission_Scope2: any, kpi_em_Total_Emission_Scope3: any, kpi_em_TopEmission_Category: any, kpi_em_TopEmission_Product: any, kpi_em_CurrentEmissionIntensity_PerTonProduction: any, kpi_em_CurrentEmissionIntensity_PerEmployee: any, kpi_em_CurrentEmissionIntensity_PerProduct: any, kpi_em_Cont_TotalEmission_StreamOfWork_Upstream: any, kpi_em_Cont_TotalEmission_StreamOfWork_Operations: any, kpi_em_Cont_TotalEmission_StreamOfWork_Downstream: any, kpi_em_Cont_TotalEmission_Categories_Energy: any, kpi_em_Cont_TotalEmission_Categories_Waste: any, kpi_em_Cont_TotalEmission_Categories_Transport: any, kpi_em_Cont_TotalEmission_Categories_Material: any, kpi_em_Scope3_Cont_Upstream?: any | null, kpi_em_Scope3_Cont_Downstream?: any | null, timestamp: any, Region?: { __typename?: 'Region', name: string } | null, OrganizationAddress?: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, latitude?: any | null, longitude?: any | null, full_address: string, type?: string | null, ownership_type?: string | null, City?: { __typename?: 'City', name: string } | null } } | null }>, kpiEmissionByPowerConsumption: Array<{ __typename?: 'KPIEmissionByPowerConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_PowerPurchased_RenewableSources: any, kpi_em_PowerPurchased_NonRenewableSources: any, kpi_em_TotalPowerPurchased: any, kpi_em_Emission_PowerPurchased_PPA_Renewable: any, kpi_em_PowerPurchased_PPA_NonRenewable: any, kpi_em_Emission_PowerPurchased_REC: any, kpi_em_Renewable_CaptivePower: any, kpi_em_NonRenewable_CaptivePower: any, kpi_em_CaptivePower: any, kpi_em_PowerConsumption_Scope2: any, kpi_em_PowerConsumption_Scope1: any, kpi_CaptivePower_GeneratedUnits?: any | null, kpi_TotalPowerPurchased_GeneratedUnits?: any | null }>, kpiEmissionByFuelConsumption: Array<{ __typename?: 'KPIEmissionByFuelConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_Diesel_Consumption?: any | null, kpi_em_Gasoline_Consumption?: any | null, kpi_em_Biodiesel_Consumption?: any | null, kpi_em_Ethanol_Consumption?: any | null, kpi_em_LPG_Consumption?: any | null, kpi_em_CNG_Consumption?: any | null, kpi_em_GaseousNitrogen_Consumption?: any | null, kpi_em_GaseousOxygen_Consumption?: any | null, kpi_em_LiquidNitrogen_Consumption?: any | null, kpi_em_CompressedAir_Consumption?: any | null, kpi_em_Electric_Consumption?: any | null, kpi_em_JetFuel_Consumption?: any | null, kpi_em_SAF_Consumption?: any | null, kpi_em_Coal_Consumption?: any | null, kpi_em_Petcoke_Consumption?: any | null, kpi_em_NaturalGas_Consumption?: any | null, kpi_em_Biomass_Consumption?: any | null, kpi_em_Bagasse_Consumption?: any | null, kpi_em_TotalEmission_FuelConsumption?: any | null, kpi_em_FuelConsumption_Scope1?: any | null, kpi_em_Kerosene_Consumption?: any | null }>, kpiEmissionByTransportation: Array<{ __typename?: 'KPIEmissionByTransportation', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_UpstreamTransport: any, kpi_em_UpstreamTransport_Scope1: any, kpi_em_UpstreamTransport_Scope3: any, kpi_em_DownstreamTransport_Scope1: any, kpi_em_DownstreamTransport_Scope3: any, kpi_em_DownstreamTransport: any, kpi_em_EmployeeTravel: any, kpi_em_EmployeeTravel_Scope1: any, kpi_em_EmployeeTravel_Scope3: any, kpi_em_BusinessTravel: any, kpi_em_BusinessTravel_Scope3: any, kpi_em_Transport_WasteManagement: any, kpi_em_Transport_WasteManagement_Scope1: any, kpi_em_Transport_WasteManagement_Scope3: any, kpi_em_TotalEmission_Transport: any, kpi_em_Transport_Scope1: any, kpi_em_Transport_Scope3: any, kpi_em_Modes_and_Fuel_Types?: any | null }>, kpiEmissionByMaterialConsumption: Array<{ __typename?: 'KPIEmissionByMaterialConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_TotalEmission_MaterialProcurement: any, kpi_em_MaterialProcurement_Scope1: any, kpi_em_MaterialProcurement_Scope3: any }>, kpiEmissionByWasteGeneration: Array<{ __typename?: 'KPIEmissionByWasteGeneration', organization_id: any, region_id: any, address_id: any, year: any, month: any, WasteDisposal_ManagedBy_ThirdParty_Name: string, kpi_em_TotalEmission_WasteGeneration: any, kpi_em_WasteGeneration_Scope1: any, kpi_em_WasteGeneration_Scope3: any }>, kpiEmissionByMaterialConsumptionSuppliers: Array<{ __typename?: 'KPIEmissionByMaterialConsumption_Suppliers', organization_id: any, region_id: any, address_id: any, year: any, month: any, supplier_id: string, supplier_name: string, supplier_category?: string | null, kpi_em_MaterialProcurement_Scope3: any, kpi_em_TansportUpstreamEmission?: any | null }>, kpiEmissionByPowerConsumptionVendors: Array<{ __typename?: 'KPIEmissionByPowerConsumption_Vendors', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor: string, kpi_em_PowerPurchased_PPA_NonRenewable_vendor: string, kpi_em_PowerPurchased_NonRenewableSources_vendor: string, kpi_em_Emission_PowerPurchased_REC_vendor: string, kpi_em_Emission_PowerPurchased_PPA_Renewable: any, kpi_em_PowerPurchased_PPA_NonRenewable: any, kpi_em_PowerPurchased_NonRenewableSources: any, kpi_em_Emission_PowerPurchased_REC: any }>, kpiEmissionByProducts: Array<{ __typename?: 'KPIEmissionByProducts', organization_id: any, region_id: any, address_id: any, year: any, month: any, product_id: string, product_name: string, brand_id?: string | null, brand_name?: string | null, kpi_em_Total_Emission: any, kpi_weight: any }>, productionDetail: Array<{ __typename?: 'GHGProductionDetails', Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU?: any | null, TaskRequest: { __typename?: 'TaskRequest', month: string, year?: number | null }, OrganizationAddress: { __typename?: 'OrganizationAddress', id: any } }> };


export const GetKpiDataDocument = gql`
    query GetKPIData($organization_id: uuid!) {
  kpiMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    Region {
      name
    }
    OrganizationAddress {
      Address {
        name
        latitude
        longitude
        full_address
        type
        ownership_type
        City {
          name
        }
      }
    }
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_uom
    kpi_em_Total_Emission
    kpi_em_Total_Emission_Scope1
    kpi_em_Total_Emission_Scope2
    kpi_em_Total_Emission_Scope3
    kpi_em_TopEmission_Category
    kpi_em_TopEmission_Product
    kpi_em_CurrentEmissionIntensity_PerTonProduction
    kpi_em_CurrentEmissionIntensity_PerEmployee
    kpi_em_CurrentEmissionIntensity_PerProduct
    kpi_em_Cont_TotalEmission_StreamOfWork_Upstream
    kpi_em_Cont_TotalEmission_StreamOfWork_Operations
    kpi_em_Cont_TotalEmission_StreamOfWork_Downstream
    kpi_em_Cont_TotalEmission_Categories_Energy
    kpi_em_Cont_TotalEmission_Categories_Waste
    kpi_em_Cont_TotalEmission_Categories_Transport
    kpi_em_Cont_TotalEmission_Categories_Material
    kpi_em_Scope3_Cont_Upstream
    kpi_em_Scope3_Cont_Downstream
    timestamp
  }
  kpiEmissionByPowerConsumption: KPIEmissionByPowerConsumption(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_PowerPurchased_RenewableSources
    kpi_em_PowerPurchased_NonRenewableSources
    kpi_em_TotalPowerPurchased
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_PowerPurchased_PPA_NonRenewable
    kpi_em_Emission_PowerPurchased_REC
    kpi_em_Renewable_CaptivePower
    kpi_em_NonRenewable_CaptivePower
    kpi_em_CaptivePower
    kpi_em_PowerConsumption_Scope2
    kpi_em_PowerConsumption_Scope1
    kpi_CaptivePower_GeneratedUnits
    kpi_TotalPowerPurchased_GeneratedUnits
  }
  kpiEmissionByFuelConsumption: KPIEmissionByFuelConsumption(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_Diesel_Consumption
    kpi_em_Gasoline_Consumption
    kpi_em_Biodiesel_Consumption
    kpi_em_Ethanol_Consumption
    kpi_em_LPG_Consumption
    kpi_em_CNG_Consumption
    kpi_em_GaseousNitrogen_Consumption
    kpi_em_GaseousOxygen_Consumption
    kpi_em_LiquidNitrogen_Consumption
    kpi_em_CompressedAir_Consumption
    kpi_em_Electric_Consumption
    kpi_em_JetFuel_Consumption
    kpi_em_SAF_Consumption
    kpi_em_Coal_Consumption
    kpi_em_Petcoke_Consumption
    kpi_em_NaturalGas_Consumption
    kpi_em_Biomass_Consumption
    kpi_em_Bagasse_Consumption
    kpi_em_TotalEmission_FuelConsumption
    kpi_em_FuelConsumption_Scope1
    kpi_em_Kerosene_Consumption
  }
  kpiEmissionByTransportation: KPIEmissionByTransportation(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_UpstreamTransport
    kpi_em_UpstreamTransport_Scope1
    kpi_em_UpstreamTransport_Scope3
    kpi_em_DownstreamTransport_Scope1
    kpi_em_DownstreamTransport_Scope3
    kpi_em_DownstreamTransport
    kpi_em_EmployeeTravel
    kpi_em_EmployeeTravel_Scope1
    kpi_em_EmployeeTravel_Scope3
    kpi_em_BusinessTravel
    kpi_em_BusinessTravel_Scope3
    kpi_em_Transport_WasteManagement
    kpi_em_Transport_WasteManagement_Scope1
    kpi_em_Transport_WasteManagement_Scope3
    kpi_em_TotalEmission_Transport
    kpi_em_Transport_Scope1
    kpi_em_Transport_Scope3
    kpi_em_Modes_and_Fuel_Types
  }
  kpiEmissionByMaterialConsumption: KPIEmissionByMaterialConsumption(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_TotalEmission_MaterialProcurement
    kpi_em_MaterialProcurement_Scope1
    kpi_em_MaterialProcurement_Scope3
  }
  kpiEmissionByWasteGeneration: KPIEmissionByWasteGeneration(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    WasteDisposal_ManagedBy_ThirdParty_Name
    kpi_em_TotalEmission_WasteGeneration
    kpi_em_WasteGeneration_Scope1
    kpi_em_WasteGeneration_Scope3
  }
  kpiEmissionByMaterialConsumptionSuppliers: KPIEmissionByMaterialConsumption_Suppliers(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    supplier_id
    supplier_name
    supplier_category
    kpi_em_MaterialProcurement_Scope3
    kpi_em_TansportUpstreamEmission
  }
  kpiEmissionByPowerConsumptionVendors: KPIEmissionByPowerConsumption_Vendors(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor
    kpi_em_PowerPurchased_PPA_NonRenewable_vendor
    kpi_em_PowerPurchased_NonRenewableSources_vendor
    kpi_em_Emission_PowerPurchased_REC_vendor
    kpi_em_Emission_PowerPurchased_PPA_Renewable
    kpi_em_PowerPurchased_PPA_NonRenewable
    kpi_em_PowerPurchased_NonRenewableSources
    kpi_em_Emission_PowerPurchased_REC
  }
  kpiEmissionByProducts: KPIEmissionByProducts(
    where: {organization_id: {_eq: $organization_id}}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    region_id
    address_id
    year
    month
    product_id
    product_name
    brand_id
    brand_name
    kpi_em_Total_Emission
    kpi_weight
  }
  productionDetail: GHGProductionDetails(
    where: {OrganizationAddress: {organization_id: {_eq: $organization_id}, Address: {ownership_type: {_eq: "Contract"}, type: {_eq: "Manufacturing"}}}}
  ) {
    TaskRequest {
      month
      year
    }
    OrganizationAddress {
      id
    }
    Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU
  }
}
    `;

/**
 * __useGetKpiDataQuery__
 *
 * To run a query within a React component, call `useGetKpiDataQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetKpiDataQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetKpiDataQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *   },
 * });
 */
export function useGetKpiDataQuery(baseOptions: Apollo.QueryHookOptions<GetKpiDataQuery, GetKpiDataQueryVariables> & ({ variables: GetKpiDataQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetKpiDataQuery, GetKpiDataQueryVariables>(GetKpiDataDocument, options);
      }
export function useGetKpiDataLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetKpiDataQuery, GetKpiDataQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetKpiDataQuery, GetKpiDataQueryVariables>(GetKpiDataDocument, options);
        }
export function useGetKpiDataSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetKpiDataQuery, GetKpiDataQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetKpiDataQuery, GetKpiDataQueryVariables>(GetKpiDataDocument, options);
        }
export type GetKpiDataQueryHookResult = ReturnType<typeof useGetKpiDataQuery>;
export type GetKpiDataLazyQueryHookResult = ReturnType<typeof useGetKpiDataLazyQuery>;
export type GetKpiDataSuspenseQueryHookResult = ReturnType<typeof useGetKpiDataSuspenseQuery>;
export type GetKpiDataQueryResult = Apollo.QueryResult<GetKpiDataQuery, GetKpiDataQueryVariables>;