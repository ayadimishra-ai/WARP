export interface IOrgSupplierMaster {
  id?: string; // uuid, primary key, unique
  client_master_id?: string | null;
  name?: string;
  code?: string | null;
  category?: string | null;
  organization_id?: string; // uuid
  metadata?: Record<string, any> | null;
  is_deleted?: boolean; // default: false
  created_at?: string; // ISO timestamp, default: now()
  updated_at?: string; // ISO timestamp, default: now()
  created_by?: string | null; // uuid
  updated_by?: string | null; // uuid
  // supplier_status?: string | null; // default: 'Not Invited'
  supplier_gst_or_license_number?: string | null;
  // supplier_full_address?: string | null;
  // buyer_features?: Record<string, any> | null;
  supplier_admin_email_id?: string | null;
  // supplier_admin_name?: string | null;
  // supplier_org_id?: string | null; // uuid
  // onboarding_date?: string | null; // ISO timestamp
  // country?: string | null;
}

export interface ICountry {
  id?: string;
  name?: string;
}

export interface IFeatureActivityMapping {
  id?: string;
  feature_code?: string;
  feature_name?: string;
}

export interface IAppUser {
  id?: string;
  email?: string;
  organization_id?: string;
  Organization?: IOrganization;
}

export interface IOrganization {
  name?: string;
  metadata?: Record<string, any>;
}

export interface IUpsertOrgSupplierMasterResponse {
  insert_OrgSupplierMaster: {
    returning: IOrgSupplierMaster[];
  };
  update_OrgSupplierMaster_many: {
    returning: IOrgSupplierMaster[];
  };
}
