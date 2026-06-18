import { UUID } from "crypto";
import { BuyerSupplierAddressMappings } from "@/modules/ghg/graphql/shared/types";

export interface GetSupplierListOfBuyerByInstanceOrgIdType {
  Organizations: OpOrganization[];
}

export interface OpOrganization {
  id: string;
  name: string;
  BuyerSupplierAddressMappings: OpBuyerSupplierAddressMapping[];
}

export interface OpBuyerSupplierAddressMapping {
  id: string;
  buyer_org_id: string;
  supplier_org_id: string;
  instance_buyer_supplier_address_id: string;
  instance_supplier_address_id: string;
  status: string;
  organizationBySupplierOrgId: OpOrganizationBySupplierOrgId;
}

export interface OpOrganizationBySupplierOrgId {
  id: string;
  name: string;
  OrganizationInstances: OpOrganizationInstance[];
}

export interface OpOrganizationInstance {
  id: string;
  configuration: Configuration;
}

export interface Configuration {
  env: Env;
  organizations: Organization[];
}

export interface Env {
  db: Db;
  s3: S3;
  smtp: Smtp;
  hasura: Hasura;
  cronJob: CronJob;
  clicHouse: ClicHouse;
}

export interface Db {
  DB_HOST: string;
  DB_NAME: string;
  DB_PORT: string;
  DB_USER: string;
  DB_PASSWORD: string;
}

export interface S3 {
  S3_BUCKET: string;
  S3_BUCKET_REGION: string;
  S3_PUBLIC_BASE_URL: string;
  S3_BUCKET_ACCESS_KEY: string;
  S3_BUCKET_ACCESS_KEY_SECRET: string;
}

export interface Smtp {
  MAIL_SMTP_HOST: string;
  EMAIL_SMTP_PORT: number;
  EMAIL_SMTP_USER: string;
  EMAIL_SMTP_SECURE: boolean;
  EMAIL_SMTP_PASSWORD: string;
}

export interface Hasura {
  JWT_SECRET: string;
  GRAPHQL_URL: string;
  ADMIN_SECRET: string;
}

export interface CronJob {
  authorization: string;
}

export interface ClicHouse {
  CLICKHOUSE_HOST: string;
  CLICKHOUSE_USER: string;
  CLICKHOUSE_PASSWORD: string;
}

export interface Organization {
  organizationId: string;
  organizationName: string;
}

export interface BuyerMonthYearType {
  month: string;
  year: number;
  buyer_address_id: UUID;
}

export interface SupplierEmissionMonthYearType {
  year: number;
  month: string;
  region_id?: string;
  supplier_code: string;
  supplier_address_id: string;
  kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerTonProduction: number;
  kpi_em_UpstreamTransport: number;
  kpi_em_TotalEmission_MaterialProcurement: number;
  kpi_em_TotalPowerPurchased: number;
  kpi_em_CaptivePower: number;
  kpi_em_TotalEmission_FuelConsumption: number;
  kpi_em_TotalEmission_WasteGeneration: number;
  buyer_share_allocation_percentage: number;
  total_sum_of_activities: number;
  total_emission: number;
  buyer_address_id: string;
}

export interface MaterialProcurementType {
  id: string;
  activity_task_request_id: string;
  organization_address_id: string;
  task_request_id: string;
  Material_Code: string;
  Supplier_Code: string;
  Material_Quantity_Procured: number;
  Material_Quantity_Procured_uom: string;
  kpi_em_EmissionBy_MaterialProcured: any;
  kpi_emf_EmissionBy_MaterialProcured: any;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
  supporting_docs: any;
  TaskRequest: TaskRequestType;
  OrganizationAddress: OrganizationAddressType;
}

export interface TaskRequestType {
  month: string;
  year: number;
}

export interface OrganizationAddressType {
  Address: AddressType;
}

export interface AddressType {
  Country: CountryType;
}

export interface CountryType {
  region_code: string;
}

//===========For Supplier End=====================

export enum OrgRole {
  Buyer,
  Supplier,
  None,
}

export type BuyerGHGMaterialProcurement = {
  id: string;
  activity_task_request_id: string;
  organization_address_id: string;
  task_request_id: string;
  Material_Code: string;
  Supplier_Code: string;
  Material_Quantity_Procured: number;
  Material_Quantity_Procured_uom: string;
  kpi_em_EmissionBy_MaterialProcured: number;
  kpi_emf_EmissionBy_MaterialProcured: number;
  created_at: string; // ISO date string
  updated_at: string; // ISO date string
  created_by: string;
  updated_by: string;
  supporting_docs: string | null; // Assuming it can be a string or null
};
export interface BuyerDataBySupplier {
  id: string;
  task_request_id: string;
  year: number;
  month: string;
  Buyer_Name: string;
  organization_address_id: string;
  share_allocation_percentage: number;
  share_allocation_value?: number;
}

export type BuyerWiseData = {
  [buyerName: string]: Omit<BuyerDataBySupplier, "Buyer_Name">[]; // Exclude Buyer_Name
};

export type KPIEntry = {
  organization_id: string;
  address_id: string;
  year: number;
  month: number;
  [key: string]: any;
};

export type SupplierKPIData = {
  [key: string]: KPIEntry[];
};

export type YearMonthLocationEmission = {
  year: number;
  month: number;
  location: string;
  totalEmission: number;
};

export interface GetBuyerListOfSupplierByInstanceOrgIdType {
  Organizations: BuyerOrganization[];
}
export interface BuyerOrganization {
  id: string;
  name: string;
  buyerSupplierAddressMappingsBySupplierOrgId: BuyerSupplierAddressMappingsBySupplierOrgId[];
}

export interface BuyerSupplierAddressMappingsBySupplierOrgId {
  id: string;
  buyer_org_id: string;
  supplier_org_id: string;
  status: string;
  Organization: Organization2;
}

export interface Organization2 {
  id: string;
  instance_org_id: string;
  name: string;
  OrganizationInstances: OrganizationInstance[];
}

export interface OrganizationInstance {
  id: string;
  configuration: Configuration;
}

export interface SupplierConfiguration {
  env: Env;
  organizations: Organization[];
}

export interface BuyerShareAllocationBuyerType {
  month: string;
  year: number;
  Buyer_Name: string;
  organization_address_id: string;
  share_allocation_percentage: number;
}

interface WhereCondition {
  year: {
    _eq: number;
  };
  month: {
    _eq: number;
  };
  supplier_code: {
    _eq: string;
  };
  address_id: {
    _eq: string;
  };
}

interface SetValues {
  month: number;
  year: number;
  supplier_code: string;
  address_id: string;
  kpi_em_TotalPowerPurchased: number;
  kpi_em_TotalEmission_MaterialProcurement: number;
  kpi_em_TotalEmission_FuelConsumption: number;
  kpi_em_UpstreamTransport: number;
  kpi_em_TotalEmission_WasteGeneration: number;
  attribute_emission: number;
}

export interface KpiSupplierEmissionEntry {
  where: WhereCondition;
  _set: SetValues;
}

export const OPSOrgRole = {
  BUYER: "BUYER",
  SUPPLIER: "SUPPLIER",
  BUYERSUPPLIER: "BUYERSUPPLIER",
};

export const GlobalMasterKeys = {
  GoogleMatrixApiKey: "google_matrix_api_key",
  RapidApiKey: "rapid_api_key",
  KpiDescriptionDashboardKey: "kpi_description_dashboard_key",
};

export type companymappingList = {
  buyerOrg: BuyerSupplierAddressMappings[];
  supplierOrg: BuyerSupplierAddressMappings[];
};
