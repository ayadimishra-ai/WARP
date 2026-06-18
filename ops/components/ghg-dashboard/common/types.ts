import { UUID } from "crypto";

export interface CurrentType {
  currentYear: object | null;
  previousYear: object | null;
  baseLineYear: number | 0;
  baseLineMonth: number | 0;
  baseLineKPIData: object[] | null;
  baseLineCurrentYearKPIMainData: object[] | null;
  organizationLevelKPIData: object[] | null;
  previousYearOrganizationLevelKPIMain: object[] | null;
  previousYearorganisationLevelKPIEmissionByProducts: object[] | null;
  organisationLevelKPIEmissionByProducts: object[] | null;
  baselineLocationKPIMainData: object[] | null;
}

export interface GetKPIDataType {
  data: KPIDataType;
}

export interface KPIData {
  emissionByFuelConsumption: KpiEmissionByFuelConsumptionType[];
  emissionByMaterialConsumption: KpiEmissionByMaterialConsumptionType[];
  emissionByPowerConsumption: KpiEmissionByPowerConsumptionType[];
  emissionByTransportation: KpiEmissionByTransportationType[];
  emissionByWasteGeneration: KpiEmissionByWasteGenerationType[];
  main: KpiMainType[];
  emissionByMaterialConsumptionSuppliers: KpiEmissionByMaterialConsumptionSupplierType[];
  emissionByPowerConsumption_Vendors: KpiEmissionByPowerConsumptionVendorType[];
  emissionByProducts: KpiEmissionByProductType[];
  productionDetail: ghgProductionDetailsType[];
}

export interface KPIDataType {
  kpiMain: KpiMainType[];
  kpiEmissionByPowerConsumption: KpiEmissionByPowerConsumptionType[];
  kpiEmissionByFuelConsumption: KpiEmissionByFuelConsumptionType[];
  kpiEmissionByTransportation: KpiEmissionByTransportationType[];
  kpiEmissionByMaterialConsumption: KpiEmissionByMaterialConsumptionType[];
  kpiEmissionByWasteGeneration: KpiEmissionByWasteGenerationType[];
  kpiEmissionByMaterialConsumptionSuppliers: KpiEmissionByMaterialConsumptionSupplierType[];
  kpiEmissionByPowerConsumptionVendors: KpiEmissionByPowerConsumptionVendorType[];
  kpiEmissionByProducts: KpiEmissionByProductType[];
  productionDetail: ghgProductionDetailsType[];
}

export interface KpiMainType {
  Region: RegionType;
  OrganizationAddress: OrganizationAddressType;
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  kpi_em_uom: string;
  kpi_em_Total_Emission: number;
  kpi_em_Total_Emission_Scope1: number;
  kpi_em_Total_Emission_Scope2: number;
  kpi_em_Total_Emission_Scope3: number;
  kpi_em_TopEmission_Category: KpiEmTopEmissionCategoryType;
  kpi_em_TopEmission_Product: KpiEmTopEmissionProductType;
  kpi_em_CurrentEmissionIntensity_PerTonProduction: number;
  kpi_em_CurrentEmissionIntensity_PerEmployee: number;
  kpi_em_CurrentEmissionIntensity_PerProduct: number;
  kpi_em_Cont_TotalEmission_StreamOfWork_Upstream: number;
  kpi_em_Cont_TotalEmission_StreamOfWork_Operations: number;
  kpi_em_Cont_TotalEmission_StreamOfWork_Downstream: number;
  kpi_em_Cont_TotalEmission_Categories_Energy: number;
  kpi_em_Cont_TotalEmission_Categories_Waste: number;
  kpi_em_Cont_TotalEmission_Categories_Transport: number;
  kpi_em_Cont_TotalEmission_Categories_Material: number;
  timestamp: string;
  __typename: string;
}

export interface RegionType {
  name: string;
  __typename: string;
}

export interface OrganizationAddressType {
  Address: AddressType;
  __typename: string;
}

export interface AddressType {
  name: string;
  latitude: number;
  longitude: number;
  full_address: string;
  type: string;
  ownership_type: string;
  City: CityType;
  __typename: string;
}

export interface CityType {
  name: string;
  __typename: string;
}

export interface KpiEmTopEmissionCategoryType {
  Category: string;
  emission: number;
}

export interface KpiEmTopEmissionProductType {
  Product?: string;
  Emission?: number;
}

export interface KpiEmissionByPowerConsumptionType {
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  kpi_em_PowerPurchased_RenewableSources: number;
  kpi_em_PowerPurchased_NonRenewableSources: number;
  kpi_em_TotalPowerPurchased: number;
  kpi_em_Emission_PowerPurchased_PPA_Renewable: number;
  kpi_em_PowerPurchased_PPA_NonRenewable: number;
  kpi_em_Emission_PowerPurchased_REC: number;
  kpi_em_Renewable_CaptivePower: number;
  kpi_em_NonRenewable_CaptivePower: number;
  kpi_em_CaptivePower: number;
  kpi_em_PowerConsumption_Scope2: number;
  kpi_em_PowerConsumption_Scope1: number;
  kpi_CaptivePower_GeneratedUnits: number;
  kpi_TotalPowerPurchased_GeneratedUnits: number;
  __typename: string;
}

export interface KpiEmissionByFuelConsumptionType {
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  kpi_em_Diesel_Consumption: number;
  kpi_em_Gasoline_Consumption: number;
  kpi_em_Biodiesel_Consumption: number;
  kpi_em_Ethanol_Consumption: number;
  kpi_em_LPG_Consumption: number;
  kpi_em_CNG_Consumption: number;
  kpi_em_GaseousNitrogen_Consumption: number;
  kpi_em_GaseousOxygen_Consumption: number;
  kpi_em_LiquidNitrogen_Consumption: number;
  kpi_em_CompressedAir_Consumption: number;
  kpi_em_Electric_Consumption: number;
  kpi_em_JetFuel_Consumption: number;
  kpi_em_SAF_Consumption: number;
  kpi_em_TotalEmission_FuelConsumption: number;
  kpi_em_FuelConsumption_Scope1: number;
  __typename: string;
}

export interface KpiEmissionByTransportationType {
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  kpi_em_UpstreamTransport: number;
  kpi_em_UpstreamTransport_Scope1: number;
  kpi_em_UpstreamTransport_Scope3: number;
  kpi_em_DownstreamTransport_Scope1: number;
  kpi_em_DownstreamTransport_Scope3: number;
  kpi_em_DownstreamTransport: number;
  kpi_em_EmployeeTravel: number;
  kpi_em_EmployeeTravel_Scope1: number;
  kpi_em_EmployeeTravel_Scope3: number;
  kpi_em_BusinessTravel: number;
  kpi_em_BusinessTravel_Scope3: number;
  kpi_em_Transport_WasteManagement: number;
  kpi_em_Transport_WasteManagement_Scope1: number;
  kpi_em_Transport_WasteManagement_Scope3: number;
  kpi_em_TotalEmission_Transport: number;
  kpi_em_Transport_Scope1: number;
  kpi_em_Transport_Scope3: number;
  __typename: string;
}

export interface KpiEmissionByMaterialConsumptionType {
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  kpi_em_TotalEmission_MaterialProcurement: number;
  kpi_em_MaterialProcurement_Scope1: number;
  kpi_em_MaterialProcurement_Scope3: number;
  __typename: string;
}

export interface KpiEmissionByWasteGenerationType {
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  WasteDisposal_ManagedBy_ThirdParty_Name: string;
  kpi_em_TotalEmission_WasteGeneration: number;
  kpi_em_WasteGeneration_Scope1: number;
  kpi_em_WasteGeneration_Scope3: number;
  __typename: string;
}

export interface KpiEmissionByMaterialConsumptionSupplierType {
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  supplier_id: string;
  supplier_name: string;
  supplier_category: string;
  kpi_em_MaterialProcurement_Scope3: number;
  __typename: string;
}

export interface KpiEmissionByPowerConsumptionVendorType {
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  kpi_em_Emission_PowerPurchased_PPA_Renewable_vendor: string;
  kpi_em_PowerPurchased_PPA_NonRenewable_vendor: string;
  kpi_em_PowerPurchased_NonRenewableSources_vendor: string;
  kpi_em_Emission_PowerPurchased_REC_vendor: string;
  kpi_em_Emission_PowerPurchased_PPA_Renewable: number;
  kpi_em_PowerPurchased_PPA_NonRenewable: number;
  kpi_em_PowerPurchased_NonRenewableSources: number;
  kpi_em_Emission_PowerPurchased_REC: number;
  __typename: string;
}

export interface KpiEmissionByProductType {
  organization_id: string;
  region_id: string;
  address_id: string;
  year: number;
  month: number;
  product_id: string;
  product_name: string;
  brand_id: string;
  brand_name: string;
  kpi_em_Total_Emission: number;
  __typename: string;
}
export interface ghgProductionDetailsType {
  Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU: Number;
  TaskRequest: taskRequest;
  OrganizationAddress: organizationAddress;
  __typename: string;
}
export interface taskRequest {
  month: string;
  year: number;
}
export interface organizationAddress {
  id: UUID;
}
export interface cmlPercentageData {
  year: number;
  month: Number;
  address_id: UUID;
  percentageOfProduction: Number;
}
