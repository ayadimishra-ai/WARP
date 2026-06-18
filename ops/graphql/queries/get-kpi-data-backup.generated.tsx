import * as Types from '../shared/types.js';

import { gql } from '@apollo/client';
import * as Apollo from '@apollo/client';
const defaultOptions = {} as const;
export type GetKpiDataBackupQueryVariables = Types.Exact<{
  organization_id: Types.Scalars['uuid']['input'];
  address_id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
  region_id: Array<Types.Scalars['uuid']['input']> | Types.Scalars['uuid']['input'];
  from_year: Types.Scalars['numeric']['input'];
  to_year: Types.Scalars['numeric']['input'];
  from_month: Types.Scalars['numeric']['input'];
  to_month: Types.Scalars['numeric']['input'];
  previous_from_year: Types.Scalars['numeric']['input'];
  previous_to_year: Types.Scalars['numeric']['input'];
  previous_from_month: Types.Scalars['numeric']['input'];
  previous_to_month: Types.Scalars['numeric']['input'];
  baseline_from_year: Types.Scalars['numeric']['input'];
  baseline_to_year: Types.Scalars['numeric']['input'];
  baseline_from_month: Types.Scalars['numeric']['input'];
  baseline_to_month: Types.Scalars['numeric']['input'];
  baseline_from_year_current: Types.Scalars['numeric']['input'];
  baseline_to_year_current: Types.Scalars['numeric']['input'];
  baseline_from_month_current: Types.Scalars['numeric']['input'];
  baseline_to_month_current: Types.Scalars['numeric']['input'];
}>;


export type GetKpiDataBackupQuery = { __typename?: 'query_root', currentYearKPIMain: Array<{ __typename?: 'KPIMain', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_uom: string, kpi_em_Total_Emission: any, kpi_em_Total_Emission_Scope1: any, kpi_em_Total_Emission_Scope2: any, kpi_em_Total_Emission_Scope3: any, kpi_em_TopEmission_Category: any, kpi_em_TopEmission_Product: any, kpi_em_CurrentEmissionIntensity_PerTonProduction: any, kpi_em_CurrentEmissionIntensity_PerEmployee: any, kpi_em_CurrentEmissionIntensity_PerProduct: any, kpi_em_Cont_TotalEmission_StreamOfWork_Upstream: any, kpi_em_Cont_TotalEmission_StreamOfWork_Operations: any, kpi_em_Cont_TotalEmission_StreamOfWork_Downstream: any, kpi_em_Cont_TotalEmission_Categories_Energy: any, kpi_em_Cont_TotalEmission_Categories_Waste: any, kpi_em_Cont_TotalEmission_Categories_Transport: any, kpi_em_Cont_TotalEmission_Categories_Material: any, timestamp: any, Region?: { __typename?: 'Region', name: string } | null, OrganizationAddress?: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, latitude?: any | null, longitude?: any | null, full_address: string, City?: { __typename?: 'City', name: string } | null } } | null }>, previousYearKPIMain: Array<{ __typename?: 'KPIMain', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_uom: string, kpi_em_Total_Emission: any, kpi_em_Total_Emission_Scope1: any, kpi_em_Total_Emission_Scope2: any, kpi_em_Total_Emission_Scope3: any, kpi_em_TopEmission_Category: any, kpi_em_TopEmission_Product: any, kpi_em_CurrentEmissionIntensity_PerTonProduction: any, kpi_em_CurrentEmissionIntensity_PerEmployee: any, kpi_em_CurrentEmissionIntensity_PerProduct: any, kpi_em_Cont_TotalEmission_StreamOfWork_Upstream: any, kpi_em_Cont_TotalEmission_StreamOfWork_Operations: any, kpi_em_Cont_TotalEmission_StreamOfWork_Downstream: any, kpi_em_Cont_TotalEmission_Categories_Energy: any, kpi_em_Cont_TotalEmission_Categories_Waste: any, kpi_em_Cont_TotalEmission_Categories_Transport: any, kpi_em_Cont_TotalEmission_Categories_Material: any, Region?: { __typename?: 'Region', name: string } | null, OrganizationAddress?: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, latitude?: any | null, longitude?: any | null, full_address: string } } | null }>, baselineYearKPIMain: Array<{ __typename?: 'KPIMain', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_uom: string, kpi_em_Total_Emission: any, kpi_em_Total_Emission_Scope1: any, kpi_em_Total_Emission_Scope2: any, kpi_em_Total_Emission_Scope3: any, kpi_em_TopEmission_Category: any, kpi_em_TopEmission_Product: any, kpi_em_CurrentEmissionIntensity_PerTonProduction: any, kpi_em_CurrentEmissionIntensity_PerEmployee: any, kpi_em_CurrentEmissionIntensity_PerProduct: any, kpi_em_Cont_TotalEmission_StreamOfWork_Upstream: any, kpi_em_Cont_TotalEmission_StreamOfWork_Operations: any, kpi_em_Cont_TotalEmission_StreamOfWork_Downstream: any, kpi_em_Cont_TotalEmission_Categories_Energy: any, kpi_em_Cont_TotalEmission_Categories_Waste: any, kpi_em_Cont_TotalEmission_Categories_Transport: any, kpi_em_Cont_TotalEmission_Categories_Material: any, timestamp: any, Region?: { __typename?: 'Region', name: string } | null, OrganizationAddress?: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, latitude?: any | null, longitude?: any | null, full_address: string, City?: { __typename?: 'City', name: string } | null } } | null }>, baselineCurrentYearKPIMain: Array<{ __typename?: 'KPIMain', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_uom: string, kpi_em_Total_Emission: any, kpi_em_Total_Emission_Scope1: any, kpi_em_Total_Emission_Scope2: any, kpi_em_Total_Emission_Scope3: any, kpi_em_TopEmission_Category: any, kpi_em_TopEmission_Product: any, kpi_em_CurrentEmissionIntensity_PerTonProduction: any, kpi_em_CurrentEmissionIntensity_PerEmployee: any, kpi_em_CurrentEmissionIntensity_PerProduct: any, kpi_em_Cont_TotalEmission_StreamOfWork_Upstream: any, kpi_em_Cont_TotalEmission_StreamOfWork_Operations: any, kpi_em_Cont_TotalEmission_StreamOfWork_Downstream: any, kpi_em_Cont_TotalEmission_Categories_Energy: any, kpi_em_Cont_TotalEmission_Categories_Waste: any, kpi_em_Cont_TotalEmission_Categories_Transport: any, kpi_em_Cont_TotalEmission_Categories_Material: any, timestamp: any, Region?: { __typename?: 'Region', name: string } | null, OrganizationAddress?: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, latitude?: any | null, longitude?: any | null, full_address: string, City?: { __typename?: 'City', name: string } | null } } | null }>, organizationLevelKPIMain: Array<{ __typename?: 'KPIMain', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_uom: string, kpi_em_Total_Emission: any, kpi_em_Total_Emission_Scope1: any, kpi_em_Total_Emission_Scope2: any, kpi_em_Total_Emission_Scope3: any, kpi_em_TopEmission_Category: any, kpi_em_TopEmission_Product: any, kpi_em_CurrentEmissionIntensity_PerTonProduction: any, kpi_em_CurrentEmissionIntensity_PerEmployee: any, kpi_em_CurrentEmissionIntensity_PerProduct: any, kpi_em_Cont_TotalEmission_StreamOfWork_Upstream: any, kpi_em_Cont_TotalEmission_StreamOfWork_Operations: any, kpi_em_Cont_TotalEmission_StreamOfWork_Downstream: any, kpi_em_Cont_TotalEmission_Categories_Energy: any, kpi_em_Cont_TotalEmission_Categories_Waste: any, kpi_em_Cont_TotalEmission_Categories_Transport: any, kpi_em_Cont_TotalEmission_Categories_Material: any, Region?: { __typename?: 'Region', name: string } | null, OrganizationAddress?: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, latitude?: any | null, longitude?: any | null, full_address: string, City?: { __typename?: 'City', name: string } | null } } | null }>, previousYearOrganisationLevelKPIMain: Array<{ __typename?: 'KPIMain', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_uom: string, kpi_em_Total_Emission: any, kpi_em_Total_Emission_Scope1: any, kpi_em_Total_Emission_Scope2: any, kpi_em_Total_Emission_Scope3: any, kpi_em_TopEmission_Category: any, kpi_em_TopEmission_Product: any, kpi_em_CurrentEmissionIntensity_PerTonProduction: any, kpi_em_CurrentEmissionIntensity_PerEmployee: any, kpi_em_CurrentEmissionIntensity_PerProduct: any, kpi_em_Cont_TotalEmission_StreamOfWork_Upstream: any, kpi_em_Cont_TotalEmission_StreamOfWork_Operations: any, kpi_em_Cont_TotalEmission_StreamOfWork_Downstream: any, kpi_em_Cont_TotalEmission_Categories_Energy: any, kpi_em_Cont_TotalEmission_Categories_Waste: any, kpi_em_Cont_TotalEmission_Categories_Transport: any, kpi_em_Cont_TotalEmission_Categories_Material: any, Region?: { __typename?: 'Region', name: string } | null, OrganizationAddress?: { __typename?: 'OrganizationAddress', Address: { __typename?: 'Addresses', name: string, latitude?: any | null, longitude?: any | null, full_address: string, City?: { __typename?: 'City', name: string } | null } } | null }>, currentYearKPIEmissionByPowerConsumption: Array<{ __typename?: 'KPIEmissionByPowerConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_PowerPurchased_RenewableSources: any, kpi_em_PowerPurchased_NonRenewableSources: any, kpi_em_TotalPowerPurchased: any, kpi_em_Emission_PowerPurchased_PPA_Renewable: any, kpi_em_PowerPurchased_PPA_NonRenewable: any, kpi_em_Emission_PowerPurchased_REC: any, kpi_em_Renewable_CaptivePower: any, kpi_em_NonRenewable_CaptivePower: any, kpi_em_CaptivePower: any, kpi_em_PowerConsumption_Scope2: any, kpi_em_PowerConsumption_Scope1: any, kpi_CaptivePower_GeneratedUnits?: any | null, kpi_TotalPowerPurchased_GeneratedUnits?: any | null }>, previousYearKPIEmissionByPowerConsumption: Array<{ __typename?: 'KPIEmissionByPowerConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_PowerPurchased_RenewableSources: any, kpi_em_PowerPurchased_NonRenewableSources: any, kpi_em_TotalPowerPurchased: any, kpi_em_Emission_PowerPurchased_PPA_Renewable: any, kpi_em_PowerPurchased_PPA_NonRenewable: any, kpi_em_Emission_PowerPurchased_REC: any, kpi_em_Renewable_CaptivePower: any, kpi_em_NonRenewable_CaptivePower: any, kpi_em_CaptivePower: any, kpi_em_PowerConsumption_Scope2: any, kpi_em_PowerConsumption_Scope1: any, kpi_CaptivePower_GeneratedUnits?: any | null, kpi_TotalPowerPurchased_GeneratedUnits?: any | null }>, currentYearKPIEmissionByFuelConsumption: Array<{ __typename?: 'KPIEmissionByFuelConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_Diesel_Consumption?: any | null, kpi_em_Gasoline_Consumption?: any | null, kpi_em_Biodiesel_Consumption?: any | null, kpi_em_Ethanol_Consumption?: any | null, kpi_em_LPG_Consumption?: any | null, kpi_em_CNG_Consumption?: any | null, kpi_em_GaseousNitrogen_Consumption?: any | null, kpi_em_GaseousOxygen_Consumption?: any | null, kpi_em_LiquidNitrogen_Consumption?: any | null, kpi_em_CompressedAir_Consumption?: any | null, kpi_em_Electric_Consumption?: any | null, kpi_em_JetFuel_Consumption?: any | null, kpi_em_SAF_Consumption?: any | null, kpi_em_TotalEmission_FuelConsumption?: any | null, kpi_em_FuelConsumption_Scope1?: any | null }>, previousYearKPIEmissionByFuelConsumption: Array<{ __typename?: 'KPIEmissionByFuelConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_Diesel_Consumption?: any | null, kpi_em_Gasoline_Consumption?: any | null, kpi_em_Biodiesel_Consumption?: any | null, kpi_em_Ethanol_Consumption?: any | null, kpi_em_LPG_Consumption?: any | null, kpi_em_CNG_Consumption?: any | null, kpi_em_GaseousNitrogen_Consumption?: any | null, kpi_em_GaseousOxygen_Consumption?: any | null, kpi_em_LiquidNitrogen_Consumption?: any | null, kpi_em_CompressedAir_Consumption?: any | null, kpi_em_Electric_Consumption?: any | null, kpi_em_JetFuel_Consumption?: any | null, kpi_em_SAF_Consumption?: any | null, kpi_em_TotalEmission_FuelConsumption?: any | null, kpi_em_FuelConsumption_Scope1?: any | null }>, currentYearKPIEmissionByTransportation: Array<{ __typename?: 'KPIEmissionByTransportation', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_UpstreamTransport: any, kpi_em_UpstreamTransport_Scope1: any, kpi_em_UpstreamTransport_Scope3: any, kpi_em_DownstreamTransport_Scope1: any, kpi_em_DownstreamTransport_Scope3: any, kpi_em_DownstreamTransport: any, kpi_em_EmployeeTravel: any, kpi_em_EmployeeTravel_Scope1: any, kpi_em_EmployeeTravel_Scope3: any, kpi_em_BusinessTravel: any, kpi_em_BusinessTravel_Scope3: any, kpi_em_Transport_WasteManagement: any, kpi_em_Transport_WasteManagement_Scope1: any, kpi_em_Transport_WasteManagement_Scope3: any, kpi_em_TotalEmission_Transport: any, kpi_em_Transport_Scope1: any, kpi_em_Transport_Scope3: any }>, previousYearKPIEmissionByTransportation: Array<{ __typename?: 'KPIEmissionByTransportation', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_UpstreamTransport: any, kpi_em_UpstreamTransport_Scope1: any, kpi_em_UpstreamTransport_Scope3: any, kpi_em_DownstreamTransport: any, kpi_em_DownstreamTransport_Scope1: any, kpi_em_DownstreamTransport_Scope3: any, kpi_em_EmployeeTravel: any, kpi_em_EmployeeTravel_Scope1: any, kpi_em_EmployeeTravel_Scope3: any, kpi_em_BusinessTravel: any, kpi_em_BusinessTravel_Scope3: any, kpi_em_Transport_WasteManagement: any, kpi_em_Transport_WasteManagement_Scope1: any, kpi_em_Transport_WasteManagement_Scope3: any, kpi_em_TotalEmission_Transport: any, kpi_em_Transport_Scope1: any, kpi_em_Transport_Scope3: any }>, currentYearKPIEmissionByMaterialConsumption: Array<{ __typename?: 'KPIEmissionByMaterialConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_TotalEmission_MaterialProcurement: any, kpi_em_MaterialProcurement_Scope1: any, kpi_em_MaterialProcurement_Scope3: any }>, previousYearKPIEmissionByMaterialConsumption: Array<{ __typename?: 'KPIEmissionByMaterialConsumption', organization_id: any, region_id: any, address_id: any, year: any, month: any, kpi_em_TotalEmission_MaterialProcurement: any, kpi_em_MaterialProcurement_Scope1: any, kpi_em_MaterialProcurement_Scope3: any }>, currentYearKPIEmissionByWasteGeneration: Array<{ __typename?: 'KPIEmissionByWasteGeneration', organization_id: any, region_id: any, address_id: any, year: any, month: any, WasteDisposal_ManagedBy_ThirdParty_Name: string, kpi_em_TotalEmission_WasteGeneration: any, kpi_em_WasteGeneration_Scope1: any, kpi_em_WasteGeneration_Scope3: any }>, previousYearKPIEmissionByWasteGeneration: Array<{ __typename?: 'KPIEmissionByWasteGeneration', organization_id: any, region_id: any, address_id: any, year: any, month: any, WasteDisposal_ManagedBy_ThirdParty_Name: string, kpi_em_TotalEmission_WasteGeneration: any, kpi_em_WasteGeneration_Scope1: any, kpi_em_WasteGeneration_Scope3: any }>, currentYearKPIEmissionByMaterialConsumptionSuppliers: Array<{ __typename?: 'KPIEmissionByMaterialConsumption_Suppliers', organization_id: any, year: any, month: any, supplier_id: string, supplier_name: string, supplier_category?: string | null, kpi_em_MaterialProcurement_Scope3: any }>, previousYearKPIEmissionByMaterialConsumptionSuppliers: Array<{ __typename?: 'KPIEmissionByMaterialConsumption_Suppliers', organization_id: any, year: any, month: any, supplier_id: string, supplier_name: string, supplier_category?: string | null, kpi_em_MaterialProcurement_Scope3: any }>, currentYearKPIEmissionByPowerConsumption_Vendors: Array<{ __typename?: 'KPIEmissionByPowerConsumption_Vendors', organization_id: any, year: any, month: any, kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor: string, kpi_em_PowerPurchased_PPA_NonRenewable_vendor: string, kpi_em_PowerPurchased_NonRenewableSources_vendor: string, kpi_em_Emission_PowerPurchased_REC_vendor: string, kpi_em_Emission_PowerPurchased_PPA_Renewable: any, kpi_em_PowerPurchased_PPA_NonRenewable: any, kpi_em_PowerPurchased_NonRenewableSources: any, kpi_em_Emission_PowerPurchased_REC: any }>, previousYearKPIEmissionByPowerConsumption_Vendors: Array<{ __typename?: 'KPIEmissionByPowerConsumption_Vendors', organization_id: any, year: any, month: any, kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor: string, kpi_em_PowerPurchased_PPA_NonRenewable_vendor: string, kpi_em_PowerPurchased_NonRenewableSources_vendor: string, kpi_em_Emission_PowerPurchased_REC_vendor: string, kpi_em_Emission_PowerPurchased_PPA_Renewable: any, kpi_em_PowerPurchased_PPA_NonRenewable: any, kpi_em_PowerPurchased_NonRenewableSources: any, kpi_em_Emission_PowerPurchased_REC: any }>, currentYearKPIEmissionByProducts: Array<{ __typename?: 'KPIEmissionByProducts', organization_id: any, year: any, month: any, product_id: string, product_name: string, brand_id?: string | null, brand_name?: string | null, kpi_em_Total_Emission: any }>, previousYearKPIEmissionByProducts: Array<{ __typename?: 'KPIEmissionByProducts', organization_id: any, year: any, month: any, product_id: string, product_name: string, brand_id?: string | null, brand_name?: string | null, kpi_em_Total_Emission: any }> };


export const GetKpiDataBackupDocument = gql`
    query GetKPIDataBackup($organization_id: uuid!, $address_id: [uuid!]!, $region_id: [uuid!]!, $from_year: numeric!, $to_year: numeric!, $from_month: numeric!, $to_month: numeric!, $previous_from_year: numeric!, $previous_to_year: numeric!, $previous_from_month: numeric!, $previous_to_month: numeric!, $baseline_from_year: numeric!, $baseline_to_year: numeric!, $baseline_from_month: numeric!, $baseline_to_month: numeric!, $baseline_from_year_current: numeric!, $baseline_to_year_current: numeric!, $baseline_from_month_current: numeric!, $baseline_to_month_current: numeric!) {
  currentYearKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
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
    timestamp
  }
  previousYearKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
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
  }
  baselineYearKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $baseline_from_year}}, {month: {_gte: $baseline_from_month}}]}, {year: {_gt: $baseline_from_year}}]}, {_or: [{_and: [{year: {_eq: $baseline_to_year}}, {month: {_lte: $baseline_to_month}}]}, {year: {_lt: $baseline_to_year}}]}]}
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
    timestamp
  }
  baselineCurrentYearKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, _and: [{_or: [{_and: [{year: {_eq: $baseline_from_year_current}}, {month: {_gte: $baseline_from_month_current}}]}, {year: {_gt: $baseline_from_year_current}}]}, {_or: [{_and: [{year: {_eq: $baseline_to_year_current}}, {month: {_lte: $baseline_to_month_current}}]}, {year: {_lt: $baseline_to_year_current}}]}]}
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
    timestamp
  }
  organizationLevelKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
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
  }
  previousYearOrganisationLevelKPIMain: KPIMain(
    where: {organization_id: {_eq: $organization_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
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
  }
  currentYearKPIEmissionByPowerConsumption: KPIEmissionByPowerConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
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
  previousYearKPIEmissionByPowerConsumption: KPIEmissionByPowerConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
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
  currentYearKPIEmissionByFuelConsumption: KPIEmissionByFuelConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
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
    kpi_em_TotalEmission_FuelConsumption
    kpi_em_FuelConsumption_Scope1
  }
  previousYearKPIEmissionByFuelConsumption: KPIEmissionByFuelConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
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
    kpi_em_TotalEmission_FuelConsumption
    kpi_em_FuelConsumption_Scope1
  }
  currentYearKPIEmissionByTransportation: KPIEmissionByTransportation(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
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
  }
  previousYearKPIEmissionByTransportation: KPIEmissionByTransportation(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
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
    kpi_em_DownstreamTransport
    kpi_em_DownstreamTransport_Scope1
    kpi_em_DownstreamTransport_Scope3
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
  }
  currentYearKPIEmissionByMaterialConsumption: KPIEmissionByMaterialConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
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
  previousYearKPIEmissionByMaterialConsumption: KPIEmissionByMaterialConsumption(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
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
  currentYearKPIEmissionByWasteGeneration: KPIEmissionByWasteGeneration(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
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
  previousYearKPIEmissionByWasteGeneration: KPIEmissionByWasteGeneration(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
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
  currentYearKPIEmissionByMaterialConsumptionSuppliers: KPIEmissionByMaterialConsumption_Suppliers(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    supplier_id
    supplier_name
    supplier_category
    kpi_em_MaterialProcurement_Scope3
  }
  previousYearKPIEmissionByMaterialConsumptionSuppliers: KPIEmissionByMaterialConsumption_Suppliers(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    supplier_id
    supplier_name
    supplier_category
    kpi_em_MaterialProcurement_Scope3
  }
  currentYearKPIEmissionByPowerConsumption_Vendors: KPIEmissionByPowerConsumption_Vendors(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
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
  previousYearKPIEmissionByPowerConsumption_Vendors: KPIEmissionByPowerConsumption_Vendors(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
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
  currentYearKPIEmissionByProducts: KPIEmissionByProducts(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $from_year}}, {month: {_gte: $from_month}}]}, {year: {_gt: $from_year}}]}, {_or: [{_and: [{year: {_eq: $to_year}}, {month: {_lte: $to_month}}]}, {year: {_lt: $to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    product_id
    product_name
    brand_id
    brand_name
    kpi_em_Total_Emission
  }
  previousYearKPIEmissionByProducts: KPIEmissionByProducts(
    where: {organization_id: {_eq: $organization_id}, address_id: {_in: $address_id}, region_id: {_in: $region_id}, _and: [{_or: [{_and: [{year: {_eq: $previous_from_year}}, {month: {_gte: $previous_from_month}}]}, {year: {_gt: $previous_from_year}}]}, {_or: [{_and: [{year: {_eq: $previous_to_year}}, {month: {_lte: $previous_to_month}}]}, {year: {_lt: $previous_to_year}}]}]}
    order_by: {year: asc, month: asc}
  ) {
    organization_id
    year
    month
    product_id
    product_name
    brand_id
    brand_name
    kpi_em_Total_Emission
  }
}
    `;

/**
 * __useGetKpiDataBackupQuery__
 *
 * To run a query within a React component, call `useGetKpiDataBackupQuery` and pass it any options that fit your needs.
 * When your component renders, `useGetKpiDataBackupQuery` returns an object from Apollo Client that contains loading, error, and data properties
 * you can use to render your UI.
 *
 * @param baseOptions options that will be passed into the query, supported options are listed on: https://www.apollographql.com/docs/react/api/react-hooks/#options;
 *
 * @example
 * const { data, loading, error } = useGetKpiDataBackupQuery({
 *   variables: {
 *      organization_id: // value for 'organization_id'
 *      address_id: // value for 'address_id'
 *      region_id: // value for 'region_id'
 *      from_year: // value for 'from_year'
 *      to_year: // value for 'to_year'
 *      from_month: // value for 'from_month'
 *      to_month: // value for 'to_month'
 *      previous_from_year: // value for 'previous_from_year'
 *      previous_to_year: // value for 'previous_to_year'
 *      previous_from_month: // value for 'previous_from_month'
 *      previous_to_month: // value for 'previous_to_month'
 *      baseline_from_year: // value for 'baseline_from_year'
 *      baseline_to_year: // value for 'baseline_to_year'
 *      baseline_from_month: // value for 'baseline_from_month'
 *      baseline_to_month: // value for 'baseline_to_month'
 *      baseline_from_year_current: // value for 'baseline_from_year_current'
 *      baseline_to_year_current: // value for 'baseline_to_year_current'
 *      baseline_from_month_current: // value for 'baseline_from_month_current'
 *      baseline_to_month_current: // value for 'baseline_to_month_current'
 *   },
 * });
 */
export function useGetKpiDataBackupQuery(baseOptions: Apollo.QueryHookOptions<GetKpiDataBackupQuery, GetKpiDataBackupQueryVariables> & ({ variables: GetKpiDataBackupQueryVariables; skip?: boolean; } | { skip: boolean; }) ) {
        const options = {...defaultOptions, ...baseOptions}
        return Apollo.useQuery<GetKpiDataBackupQuery, GetKpiDataBackupQueryVariables>(GetKpiDataBackupDocument, options);
      }
export function useGetKpiDataBackupLazyQuery(baseOptions?: Apollo.LazyQueryHookOptions<GetKpiDataBackupQuery, GetKpiDataBackupQueryVariables>) {
          const options = {...defaultOptions, ...baseOptions}
          return Apollo.useLazyQuery<GetKpiDataBackupQuery, GetKpiDataBackupQueryVariables>(GetKpiDataBackupDocument, options);
        }
export function useGetKpiDataBackupSuspenseQuery(baseOptions?: Apollo.SkipToken | Apollo.SuspenseQueryHookOptions<GetKpiDataBackupQuery, GetKpiDataBackupQueryVariables>) {
          const options = baseOptions === Apollo.skipToken ? baseOptions : {...defaultOptions, ...baseOptions}
          return Apollo.useSuspenseQuery<GetKpiDataBackupQuery, GetKpiDataBackupQueryVariables>(GetKpiDataBackupDocument, options);
        }
export type GetKpiDataBackupQueryHookResult = ReturnType<typeof useGetKpiDataBackupQuery>;
export type GetKpiDataBackupLazyQueryHookResult = ReturnType<typeof useGetKpiDataBackupLazyQuery>;
export type GetKpiDataBackupSuspenseQueryHookResult = ReturnType<typeof useGetKpiDataBackupSuspenseQuery>;
export type GetKpiDataBackupQueryResult = Apollo.QueryResult<GetKpiDataBackupQuery, GetKpiDataBackupQueryVariables>;