export interface ISupplierMaterialMapping {
  id: string;
  organization_id: string;
  supplier_address_mapping_id: string;
  org_material_master_id: string;
  From_Year: number;
  From_Month: string;
  To_Year: number;
  To_Month: string;
  meta_data?: Record<string, any> | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ISupplierMaterialMappingRow {
  id: string;
  supplier_address_mapping_id: string;
  org_material_master_id: string;
  supplier_code_name: string;
  supplier_address_code_name: string;
  material_master_code_name: string;
  from_period: string;
  to_period: string;
}

export interface ISupplierAddressMappingOption {
  id: string;            // SupplierAddressMapping.id — used as the select value
  supplier_name: string;
  supplier_code: string;
}

export interface IMaterialOption {
  id: string;
  name: string;
  code: string;
  type: string;
}

export const VALID_MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
] as const;

export type TMonth = (typeof VALID_MONTHS)[number];
