-- Sprint BSF-P1 Supplier Management Page : Buyer workflow

-- Add supplier_pan_or_license_number to OrgSupplierMaster : 17-11-2025
ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "supplier_pan_or_license_number" text;

-- Add supplier_full_address to OrgSupplierMaster : 17-11-2025
ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "supplier_full_address" text;

-- Add buyer_features to OrgSupplierMaster : 17-11-2025
ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "buyer_features" jsonb;

-- Add supplier_admin_email_id to OrgSupplierMaster : 17-11-2025
ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "supplier_admin_email_id" text;

-- Add supplier_admin_name to OrgSupplierMaster : 17-11-2025
ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "supplier_admin_name" text;

-- Add supplier_org_id to OrgSupplierMaster : 17-11-2025
ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "supplier_org_id" uuid;

-- Add supplier_status to OrgSupplierMaster : 17-11-2025
ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "supplier_status" text;

-- Add supplier_id to BuyerSupplierMappings : 17-11-2025
ALTER TABLE "BuyerSupplierMappings"
ADD COLUMN "supplier_id" uuid;

-- TODO: "supplier_id" Reference constraint to be added on OrgSupplierMaster(id)

-- Create FeatureActivityMapping table : 17-11-2025
CREATE TABLE "FeatureActivityMapping" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    client_master_id TEXT,
    organization_id UUID REFERENCES "Organization"(id),

    feature_code TEXT NOT NULL,
    feature_name TEXT NOT NULL,

    activities JSONB DEFAULT NULL,
    metadata JSONB DEFAULT NULL,

    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_by UUID,
    updated_by UUID
);

-- Insert PCF activity feature : 17-11-2025
INSERT INTO "FeatureActivityMapping"
(id, client_master_id, organization_id, feature_code, feature_name, activities)
VALUES
(
    gen_random_uuid(),
    'pcf',
    'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e',
    'pcf',
    'PCF',
    '[{"activity_code":"general"},{"activity_code":"production"}]'::jsonb
);

-- Insert Energy activity feature : 17-11-2025
INSERT INTO "FeatureActivityMapping"
(id, client_master_id, organization_id, feature_code, feature_name, activities)
VALUES
(
    gen_random_uuid(),
    'energy',
    'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e',
    'energy',
    'Energy',
    '[
        {"activity_code":"energy"},
        {"activity_code":"fugitive"},
        {"activity_code":"energy_grid_power"},
        {"activity_code":"energy_captive_power"}
    ]'::jsonb
);

-- Insert Scope 3 Emission activity feature : 17-11-2025
INSERT INTO "FeatureActivityMapping"
(id, client_master_id, organization_id, feature_code, feature_name, activities)
VALUES
(
    gen_random_uuid(),
    'scope_3_emission',
    'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e',
    'scope_3_emission',
    'Scope 3 Emission',
    '[{"activity_code":"transport"}]'::jsonb
);

-- Alter table ActivityFeatures table : 18-11-2025
ALTER TABLE "ActivityFeatures" RENAME TO "FeatureActivityMapping";

--changes of columns in OrgSupplierMaster table : 19-11-2025
ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "onboarding_date" timestamp NULL;

ALTER TABLE "OrgSupplierMaster"
RENAME COLUMN supplier_pan_or_license_number TO supplier_gst_or_license_number;

ALTER TABLE "OrgSupplierMaster"
ADD COLUMN "country" text NULL;

-- Add new activity "Supplier Details" to "Activity" : 19-11-2025
INSERT INTO "Activity" (
    code,
    name,
    parent_code,
    is_AI_enabled,
    is_deleted,
    metadata,
    created_at,
    updated_at,
    created_by,
    updated_by
) VALUES (
    'supplier_details',
    'Supplier Details',
    NULL,
    FALSE,
    FALSE,
    '{}'::jsonb,
    '2025-11-19T12:26:19.951482+00:00',
    '2025-11-19T12:26:19.951482+00:00',
    NULL,
    NULL
);

-- TODO : Add download link to metadata column in "Activity" table for "Supplier Details" activity

-- Insert supplier_category master data into ActivityMaster : 20-11-2025
INSERT INTO "ActivityMaster" (
  id,
  organization_address_id,
  master_key,
  metadata,
  is_deleted,
  master_data,
  created_at,
  updated_at,
  created_by,
  updated_by
) VALUES (
  gen_random_uuid(),
  NULL,
  'supplier_category',
  NULL,
  FALSE,
  '[
    { "label": "Packaging Material", "value": "packaging_material" },
    { "label": "Semi-Finished Goods", "value": "semi_finished_goods" },
    { "label": "Raw Material", "value": "raw_material" },
    { "label": "Finished Goods", "value": "finished_goods" },
    { "label": "Waste", "value": "waste" }
  ]'::jsonb,
  now(),
  now(),
  NULL,
  NULL
);

-- Click house Audit logs
CREATE TABLE snowkap_op_logs.OrgSupplierMaster
(
    `id` UUID,
    `client_master_id` Nullable(String),
    `name` String,
    `code` Nullable(String),
    `category` Nullable(String),
    `organization_id` UUID,
    `metadata` Nullable(String) COMMENT 'JSONB field',
    `is_deleted` Bool DEFAULT false,
    `created_at` DateTime DEFAULT now(),
    `updated_at` DateTime DEFAULT now(),
    `created_by` Nullable(UUID),
    `updated_by` Nullable(UUID),
    `supplier_status` Nullable(String) DEFAULT 'Not Invited',
    `supplier_gst_or_license_number` Nullable(String),
    `supplier_full_address` Nullable(String),
    `buyer_features` Nullable(String) COMMENT 'JSONB field',
    `supplier_admin_email_id` Nullable(String),
    `supplier_admin_name` Nullable(String),
    `supplier_org_id` Nullable(UUID),
    `onboarding_date` Nullable(DateTime),
    `country` Nullable(String),
    `supplier_pan_number` Nullable(String),
    `env` Nullable(String)
)
ENGINE = Log;

-- Rename table OrgSupplierMaster_New to OrgSupplierMaster in ClickHouse
ALTER TABLE snowkap_op_logs.OrgSupplierMaster_New RENAME TO OrgSupplierMaster;

-- TODO: Add Permission for supplier details : 21-11-2025

-- Update activity in UserOrganizationAddressMapping table for supplier_details activity : 21-11-2025
UPDATE "UserOrganizationAddressMapping"
SET activities = activities || '["supplier_details"]'::jsonb
WHERE id = 'b4ce653c-ddb0-4ada-bc00-7dc8090b1fb2';

UPDATE "UserOrganizationAddressMapping"
SET activities = activities || '["supplier_details"]'::jsonb
WHERE id = '99368a43-0834-4fc9-9795-a038abb954d6';

UPDATE "UserOrganizationAddressMapping"
SET activities = activities || '["supplier_details"]'::jsonb
WHERE id = '739c014c-c295-4dca-a392-8852f6ae90e5';


-- Create MasterDataImportHistory table : 22-11-2025

CREATE TABLE public."MasterDataImportHistory" (
	id uuid NOT NULL DEFAULT gen_random_uuid(),
	organization_id uuid NULL,
	import_method text NOT NULL,
	file_name text NULL,
	file_url text NULL,
	status text NULL,
	created_at timestamptz NOT NULL DEFAULT now(),
	updated_at timestamptz NOT NULL DEFAULT now(),
	created_by uuid NULL,
	updated_by uuid NULL,
	is_deleted bool NOT NULL DEFAULT false,
	file_metadata jsonb NULL,
	metadata jsonb NULL,
	status_data jsonb NULL,
	activity_code text NULL,
	CONSTRAINT "MasterDataImportHistory_pkey" PRIMARY KEY (id)
);


-- public."MasterDataImportHistory" foreign keys

ALTER TABLE public."MasterDataImportHistory" ADD CONSTRAINT "MasterDataImportHistory_activity_code_fkey" FOREIGN KEY (activity_code) REFERENCES public."Activity"(code) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE public."MasterDataImportHistory" ADD CONSTRAINT "MasterDataImportHistory_created_by_fkey" FOREIGN KEY (created_by) REFERENCES public."AppUser"(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE public."MasterDataImportHistory" ADD CONSTRAINT "MasterDataImportHistory_organization_id_fkey" FOREIGN KEY (organization_id) REFERENCES public."Organization"(id) ON DELETE RESTRICT ON UPDATE RESTRICT;
ALTER TABLE public."MasterDataImportHistory" ADD CONSTRAINT "MasterDataImportHistory_updated_by_fkey" FOREIGN KEY (updated_by) REFERENCES public."AppUser"(id) ON DELETE RESTRICT ON UPDATE RESTRICT;

-- supplier location master data changes : 24-11-2025
CREATE TABLE IF NOT EXISTS snowkap_op_logs.SupplierAddressMapping
(
    `id`                              UUID,
    `op_organization_id`              UUID,
    `user_id`                         UUID,
    `org_supplier_master_id`          UUID,
    `address_id`                      UUID,
    `supplier_organization_address_id` Nullable(UUID),
    `metadata`                        Nullable(String),
    `is_deleted`                      Boolean,
    `created_by`                      Nullable(UUID),
    `updated_by`                      Nullable(UUID),
    `env`                             String,
    `created_at`                      DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (op_organization_id, created_at)
SETTINGS index_granularity = 8192;

CREATE TABLE IF NOT EXISTS snowkap_op_logs.Addresses
(
    `id`               UUID,
    `op_organization_id` UUID,
    `user_id`          UUID,
    `name`             String,
    `code`             Nullable(String),
    `full_address`     String,
    `country_id`       UUID,
    `state_id`         Nullable(UUID),
    `city_id`          Nullable(UUID),
    `pincode`          String,
    `type`             String,
    `ownership_type`   String,
    `facility_type`    Nullable(String),
    `is_wwtp`          String,
    `latitude`         Nullable(Float64),
    `longitude`        Nullable(Float64),
    `client_master_id` Nullable(String),
    `metadata`         Nullable(String),
    `is_deleted`       Boolean,
    `created_by`       Nullable(UUID),
    `updated_by`       Nullable(UUID),
    `env`              String,
    `created_at`       DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (op_organization_id, created_at)
SETTINGS index_granularity = 8192;