# Material Master new columns

# Table Name - OrgMaterialMaster

## New Columns

1. **Material_Weight_Per_Unit**

   - Type: `double precision`
   - Nullable: `true`
   - Default: `'0'::double precision`

2. **UoM_Material_Weight**

   - Type: `text`
   - Nullable: `true`

3. **Material_Classification**

   - Type: `text`
   - Nullable: `true`

4. **Material_Description**

   - Type: `text`
   - Nullable: `true`

5. **Additional_Information**
   - Type: `text`
   - Nullable: `true`

## SQL ALTER TABLE Query

```sql
-- Add new columns to OrgMaterialMaster table
ALTER TABLE "OrgMaterialMaster"
ADD COLUMN "Material_Weight_Per_Unit" double precision DEFAULT '0'::double precision,
ADD COLUMN "UoM_Material_Weight" text,
ADD COLUMN "Material_Classification" text,
ADD COLUMN "Material_Description" text,
ADD COLUMN "Additional_Information" text;
```

# Add Material Type Entry to Activity Master

# Table Name - ActivityMaster

# Master Key[master_key] - supplier_category

## New Material Type to Add

Add the following object to the `master_data` array:

```json
{
  "label": "Capital Goods",
  "value": "capital_goods"
}
```

---

# Add Material Weight UoM to Activity Master

# Table Name - ActivityMaster

# Master Key[master_key] - material_master_material_weight_uom

## New UoM Values to Add

Add the following UoM values to the `master_data` array:

1. Kilogram/litre
2. Kilogram/EA
3. Kilogram/Nos
4. Tonne/litre
5. Tonne/EA
6. Tonne/Nos
7. Gram/litre
8. Gram/EA
9. Gram/Nos

## Master Data Array Format

```json
[
  { "label": "Kilogram/litre", "value": "kilogram/litre" },
  { "label": "Kilogram/EA", "value": "kilogram/ea" },
  { "label": "Kilogram/Nos", "value": "kilogram/nos" },
  { "label": "Tonne/litre", "value": "tonne/litre" },
  { "label": "Tonne/EA", "value": "tonne/ea" },
  { "label": "Tonne/Nos", "value": "tonne/nos" },
  { "label": "Gram/litre", "value": "gram/litre" },
  { "label": "Gram/EA", "value": "gram/ea" },
  { "label": "Gram/Nos", "value": "gram/nos" }
]
```

---

# Create New Table: GHGCapital_Goods

# Table Name - GHGCapital_Goods

## Table Columns

1. **id**

   - Type: `uuid`
   - Primary Key: `true`
   - Unique: `true`
   - Default: `gen_random_uuid()`

2. **organization_address_id**

   - Type: `uuid`
   - Nullable: `false`

3. **task_request_id**

   - Type: `uuid`
   - Nullable: `false`

4. **activity_task_request_id**

   - Type: `uuid`
   - Nullable: `false`

5. **Supplier_Code**

   - Type: `text`
   - Nullable: `true`

6. **Material_Code**

   - Type: `text`
   - Nullable: `true`

7. **Quantity_Procured**

   - Type: `double precision`
   - Nullable: `true`

8. **Quantity_Procured_uom**

   - Type: `text`
   - Nullable: `true`

9. **kpi_material_weight_kg**

   - Type: `double precision`
   - Nullable: `true`

10. **supporting_docs**

- Type: `jsonb`
- Nullable: `true`

10. **supporting_docs**

    - Type: `jsonb`
    - Nullable: `true`

11. **meta_data**

    - Type: `jsonb`
    - Nullable: `true`

12. **created_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

13. **updated_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

14. **created_by**

    - Type: `uuid`
    - Nullable: `true`

15. **updated_by**
    - Type: `uuid`
    - Nullable: `true`

## Foreign Key References

- `activity_task_request_id` → `ActivityTaskRequest.id`
- `created_by` → `AppUser.id`
- `organization_address_id` → `OrganizationAddress.id`
- `task_request_id` → `TaskRequest.id`
- `updated_by` → `AppUser.id`

## SQL CREATE TABLE Query

```sql
-- Create GHGCapital_Goods table
CREATE TABLE "GHGCapital_Goods" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_address_id" uuid NOT NULL,
  "task_request_id" uuid NOT NULL,
  "activity_task_request_id" uuid NOT NULL,
  "Supplier_Code" text,
  "Material_Code" text,
  "Quantity_Procured" double precision,
  "Quantity_Procured_uom" text,
  "kpi_material_weight_kg" double precision,
  "supporting_docs" jsonb,
  "meta_data" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,

  -- Foreign Key Constraints
  CONSTRAINT "fk_activity_task_request"
    FOREIGN KEY ("activity_task_request_id")
    REFERENCES "ActivityTaskRequest"("id")
    ON DELETE CASCADE,

  CONSTRAINT "fk_created_by"
    FOREIGN KEY ("created_by")
    REFERENCES "AppUser"("id")
    ON DELETE SET NULL,

  CONSTRAINT "fk_organization_address"
    FOREIGN KEY ("organization_address_id")
    REFERENCES "OrganizationAddress"("id")
    ON DELETE CASCADE,

  CONSTRAINT "fk_task_request"
    FOREIGN KEY ("task_request_id")
    REFERENCES "TaskRequest"("id")
    ON DELETE CASCADE,

  CONSTRAINT "fk_updated_by"
    FOREIGN KEY ("updated_by")
    REFERENCES "AppUser"("id")
    ON DELETE SET NULL
);

```

## Permissions Configuration

### Required Permissions

Allow the following roles to access the `GHGCapital_Goods` table:

- **Location Executive** - Full CRUD access (Create, Read, Update, Delete)
- **Location Admin** - Full CRUD access (Create, Read, Update, Delete)

---

# Add New Activity Entry

# Table Name - Activity

## Activity Details

Add a new activity for Capital Goods with the following details:

- Parent Activity

- **name**: `CapitalGoods`
- **code**: `capitalgoods`
- **meta_data**:

```json
{
  "ui": {
    "listing": {
      "column_name": "Capital Goods",
      "column_index": 16
    }
  }
}
```

- Sub Activity

- **name**: `Capital Goods`
- **code**: `capital_goods`
- **meta_data**:

```json
{
  "download_url_template": "https://beta.snowkap.com/ops/Capital_Goods_Procurement_Template.xlsx"
}
```

- **parent_code** : `capitalgoods`

## Template File Upload

**Action Required:**

Upload the Capital Goods Excel template file to the following location:

- **URL**: `https://beta.snowkap.com/ops/Capital_Goods_Procurement_Template.xlsx`
- **File Type**: Excel (.xlsx)
- **Purpose**: Template file for Capital Goods data upload

**Note:**

- Ensure the template file is uploaded before deploying this migration
- The template URL is referenced in the activity's `meta_data.download_url_template`
- Users will download this template to fill in Capital Goods data

---

# Add Capital Goods Quantity UoM to Activity Master

# Table Name - ActivityMaster

# Master Key[master_key] - capital_goods_quantity_procured_uom

## New UoM Values to Add

Add the following UoM values for Capital Goods quantity to the `master_data` array:

1. Kilogram
2. Tonne
3. Nos
4. EA
5. Gram
6. Milligram
7. Pound
8. Ounce

## Master Data Array Format

```json
[
  { "label": "Kilogram", "value": "kilogram" },
  { "label": "Tonne", "value": "tonne" },
  { "label": "Nos", "value": "nos" },
  { "label": "EA", "value": "ea" },
  { "label": "Gram", "value": "gram" },
  { "label": "Milligram", "value": "milligram" },
  { "label": "Pound", "value": "pound" },
  { "label": "Ounce", "value": "ounce" }
]
```

---

# Create ClickHouse Audit Log Table

# Table Name - GHGCapital_Goods (ClickHouse)

## Database - snowkap_op_logs

### Purpose

This table stores audit logs for all Capital Goods data changes, including:

- Insert operations
- Update operations
- Delete operations (marked with `isdeleted = true`)

### Table Schema

#### Columns

1. **id** - UUID (Capital Goods record ID)
2. **op_organization_id** - UUID (Organization ID from session)
3. **user_id** - UUID (User ID who performed the action)
4. **organization_address_id** - UUID (Organization Address ID)
5. **task_request_id** - UUID (Task Request ID)
6. **activity_task_request_id** - UUID (Activity Task Request ID)
7. **Material_Code** - String (Material Code)
8. **Supplier_Code** - String (Supplier Code)
9. **Quantity_Procured** - Float64 (Quantity Procured)
10. **Quantity_Procured_uom** - String (Unit of Measurement)
11. **env** - String (Environment: dev/staging/production)
12. **isdeleted** - Boolean (true if record was deleted)
13. **created_by** - UUID (User who created the record)
14. **updated_by** - UUID (User who updated the record)
15. **created_at** - DateTime (Timestamp of audit log entry)

## SQL CREATE TABLE Query (ClickHouse)

```sql
-- Create GHGCapital_Goods audit log table in ClickHouse
CREATE TABLE IF NOT EXISTS snowkap_op_logs.GHGCapital_Goods
(
    `id` UUID,
    `op_organization_id` UUID,
    `user_id` UUID,
    `organization_address_id` UUID,
    `task_request_id` UUID,
    `activity_task_request_id` UUID,
    `Material_Code` String,
    `Supplier_Code` String,
    `Quantity_Procured` Float64,
    `Quantity_Procured_uom` String,
    `env` String,
    `isdeleted` Boolean,
    `created_by` UUID,
    `updated_by` UUID,
    `created_at` DateTime DEFAULT now()
)
ENGINE = MergeTree()
ORDER BY (op_organization_id, created_at)
SETTINGS index_granularity = 8192;
```

## Table Configuration

### Engine

- **MergeTree**: High-performance storage engine for time-series and audit log data

### Order By

- **Primary Sort Key**: `(op_organization_id, created_at)`
  - Optimized for queries filtering by organization
  - Sorted by timestamp for efficient time-range queries

### Index Granularity

- **8192**: Default granularity for efficient data access

## Usage

### Audit Log Flow

1. **Insert Operation**:

   - Record added to PostgreSQL `GHGCapital_Goods` table
   - Audit log entry created with `isdeleted = false`

2. **Update Operation**:

   - Record updated in PostgreSQL `GHGCapital_Goods` table
   - Audit log entry created with `isdeleted = false` (new version)

3. **Delete Operation**:
   - Record deleted from PostgreSQL `GHGCapital_Goods` table
   - Audit log entry created with `isdeleted = true`

---

# Add or Update UOM to UOM Master Table

# Table Name - UomMaster

## UOM Records to Add or Update

Add or update the following UOM entries in the `UomMaster` table:

| ID                                   | Code           | Label          | Display Name   | Alias                                |
| ------------------------------------ | -------------- | -------------- | -------------- | ------------------------------------ |
| 5ec3e3cb-af26-4e5e-bf22-0bfac3d8796c | carat          | carat          | Carat          | ["carat", "Carat"]                   |
| 908273d5-f768-4b81-a297-0b3be976ed7e | ea             | ea             | EA             | ["ea", "EA"]                         |
| 0db8b0b9-b488-44ba-888d-eb152e44f8c4 | nos            | nos            | Nos.           | ["nos", "Nos."]                      |
| 739e5571-6cf7-4c2c-a207-42cfef9e4674 | gram_nos       | gram_nos       | Gram/Nos       | ["gram_nos", "Gram/Nos"]             |
| bd9560c2-2fb0-4cfd-8cd9-9d062bb6b7ff | gram_ea        | gram_ea        | Gram/EA        | ["gram_ea", "Gram/EA"]               |
| 03ddc99d-476d-467b-bda9-999befcc1ae9 | gram_litre     | gram_litre     | Gram/litre     | ["gram_litre", "Gram/litre"]         |
| 79ebd0d5-690b-403b-b411-205a2b4bced1 | tonne_nos      | tonne_nos      | Tonne/Nos      | ["tonne_ea", "Tonne/Nos"]            |
| d795f8b0-112f-4295-be32-a25f67a80f5f | tonne_ea       | tonne_ea       | Tonne/EA       | ["tonne_ea", "Tonne/EA"]             |
| e2c26b77-66f0-4470-a08d-ac013fe9a1f7 | tonne_litre    | tonne_litre    | Tonne/litre    | ["tonne_litre", "Tonne/litre"]       |
| 5621efb4-18e9-44cc-b9c5-ed6916792ee9 | kilogram_nos   | kilogram_nos   | Kilogram/Nos   | ["kilogram_nos", "Kilogram/Nos"]     |
| 1f3fcb66-6883-4b7b-b2bb-9f090f6a8010 | kilogram_ea    | kilogram_ea    | Kilogram/EA    | ["kilogram_ea", "Kilogram/EA"]       |
| b1103e6a-8036-4318-b74a-b89e6a22dc25 | kilogram_litre | kilogram_litre | Kilogram/litre | ["kilogram_litre", "Kilogram/litre"] |

## SQL INSERT/UPDATE Query

```sql
-- Insert or update UOM records in UomMaster table
INSERT INTO "UomMaster" (id, code, label, display_name, alias)
VALUES
  ('5ec3e3cb-af26-4e5e-bf22-0bfac3d8796c', 'carat', 'carat', 'Carat', '{"alias": ["carat", "Carat"]}'::jsonb),
  ('908273d5-f768-4b81-a297-0b3be976ed7e', 'ea', 'ea', 'EA', '{"alias": ["ea", "EA"]}'::jsonb),
  ('0db8b0b9-b488-44ba-888d-eb152e44f8c4', 'nos', 'nos', 'Nos.', '{"alias": ["nos", "Nos."]}'::jsonb),
  ('739e5571-6cf7-4c2c-a207-42cfef9e4674', 'gram_nos', 'gram_nos', 'Gram/Nos', '{"alias": ["gram_nos", "Gram/Nos"]}'::jsonb),
  ('bd9560c2-2fb0-4cfd-8cd9-9d062bb6b7ff', 'gram_ea', 'gram_ea', 'Gram/EA', '{"alias": ["gram_ea", "Gram/EA"]}'::jsonb),
  ('03ddc99d-476d-467b-bda9-999befcc1ae9', 'gram_litre', 'gram_litre', 'Gram/litre', '{"alias": ["gram_litre", "Gram/litre"]}'::jsonb),
  ('79ebd0d5-690b-403b-b411-205a2b4bced1', 'tonne_nos', 'tonne_nos', 'Tonne/Nos', '{"alias": ["tonne_ea", "Tonne/Nos"]}'::jsonb),
  ('d795f8b0-112f-4295-be32-a25f67a80f5f', 'tonne_ea', 'tonne_ea', 'Tonne/EA', '{"alias": ["tonne_ea", "Tonne/EA"]}'::jsonb),
  ('e2c26b77-66f0-4470-a08d-ac013fe9a1f7', 'tonne_litre', 'tonne_litre', 'Tonne/litre', '{"alias": ["tonne_litre", "Tonne/litre"]}'::jsonb),
  ('5621efb4-18e9-44cc-b9c5-ed6916792ee9', 'kilogram_nos', 'kilogram_nos', 'Kilogram/Nos', '{"alias": ["kilogram_nos", "Kilogram/Nos"]}'::jsonb),
  ('1f3fcb66-6883-4b7b-b2bb-9f090f6a8010', 'kilogram_ea', 'kilogram_ea', 'Kilogram/EA', '{"alias": ["kilogram_ea", "Kilogram/EA"]}'::jsonb),
  ('b1103e6a-8036-4318-b74a-b89e6a22dc25', 'kilogram_litre', 'kilogram_litre', 'Kilogram/litre', '{"alias": ["kilogram_litre", "Kilogram/litre"]}'::jsonb)
ON CONFLICT (id) DO UPDATE SET
  label = EXCLUDED.label,
  display_name = EXCLUDED.display_name,
  alias = EXCLUDED.alias;
```

---

# Add or Update UOM Conversion Factor

# Table Name - UomConversionMaster

## UOM Conversion Records to Add or Update

Add or update the following UOM conversion factor entries in the `UomConversionMaster` table:

| ID                                   | From UOM  | To UOM   | Conversion Factor | Created At                    | Updated At                    |
| ------------------------------------ | --------- | -------- | ----------------- | ----------------------------- | ----------------------------- |
| a1f27315-24c0-4571-ad6c-6a14c44d603f | gram      | kilogram | 0.001             | 2026-02-13 19:40:39.022 +0530 | 2026-02-13 19:40:39.022 +0530 |
| 44b40c00-af63-46e0-a709-29d7ea195078 | ounce     | kilogram | 0.0283495         | 2026-02-16 08:11:21.947 +0530 | 2026-02-16 08:11:21.947 +0530 |
| f4bc1bef-5ff3-4412-a7b6-973130621319 | milligram | kilogram | 0.000001          | 2026-02-23 18:45:10.904 +0530 | 2026-02-23 18:45:10.904 +0530 |
| 7a28960d-d860-4bbf-bbd2-e35218356012 | pound     | kilogram | 0.453592          | 2025-06-24 17:11:10.168 +0530 | 2025-06-24 17:11:10.168 +0530 |
| 65aa1101-bb89-4161-ae9c-321ad9741d24 | tonne     | kilogram | 1000.0            | 2025-06-24 17:13:39.552 +0530 | 2025-06-24 17:13:39.552 +0530 |
| d1f7698a-ecff-43ea-9217-64a10fd66363 | bar       | kilogram | 1.0               | 2025-10-27 18:13:51.804 +0530 | 2025-10-27 18:13:51.804 +0530 |
| f351333a-40eb-46f2-927b-61e78dd75e0a | kilogram  | kilogram | 1.0               | 2025-12-29 12:12:34.123 +0530 | 2025-12-29 12:12:34.123 +0530 |

## SQL INSERT/UPDATE Query

```sql
-- Insert or update UOM conversion factor records in UomConversionMaster table
INSERT INTO "UomConversionMaster" (id, from_uom, to_uom, conversion_factor, created_at, updated_at)
VALUES
  ('a1f27315-24c0-4571-ad6c-6a14c44d603f', 'gram', 'kilogram', 0.001, '2026-02-13 19:40:39.022 +0530', '2026-02-13 19:40:39.022 +0530'),
  ('44b40c00-af63-46e0-a709-29d7ea195078', 'ounce', 'kilogram', 0.0283495, '2026-02-16 08:11:21.947 +0530', '2026-02-16 08:11:21.947 +0530'),
  ('f4bc1bef-5ff3-4412-a7b6-973130621319', 'milligram', 'kilogram', 0.000001, '2026-02-23 18:45:10.904 +0530', '2026-02-23 18:45:10.904 +0530'),
  ('7a28960d-d860-4bbf-bbd2-e35218356012', 'pound', 'kilogram', 0.453592, '2025-06-24 17:11:10.168 +0530', '2025-06-24 17:11:10.168 +0530'),
  ('65aa1101-bb89-4161-ae9c-321ad9741d24', 'tonne', 'kilogram', 1000.0, '2025-06-24 17:13:39.552 +0530', '2025-06-24 17:13:39.552 +0530'),
  ('d1f7698a-ecff-43ea-9217-64a10fd66363', 'bar', 'kilogram', 1.0, '2025-10-27 18:13:51.804 +0530', '2025-10-27 18:13:51.804 +0530'),
  ('f351333a-40eb-46f2-927b-61e78dd75e0a', 'kilogram', 'kilogram', 1.0, '2025-12-29 12:12:34.123 +0530', '2025-12-29 12:12:34.123 +0530')
ON CONFLICT (id) DO UPDATE SET
  from_uom = EXCLUDED.from_uom,
  to_uom = EXCLUDED.to_uom,
  conversion_factor = EXCLUDED.conversion_factor,
  updated_at = EXCLUDED.updated_at;
```

---

# Create New Table: KPIEmissionByCapitalGoods

# Table Name - KPIEmissionByCapitalGoods

## Table Columns

1. **id**

   - Type: `uuid`
   - Primary Key: `true`
   - Unique: `true`
   - Default: `gen_random_uuid()`

2. **organization_id**

   - Type: `uuid`
   - Nullable: `false`

3. **region_id**

   - Type: `uuid`
   - Nullable: `false`

4. **address_id**

   - Type: `uuid`
   - Nullable: `false`

5. **month**

   - Type: `numeric`
   - Nullable: `false`

6. **year**

   - Type: `numeric`
   - Nullable: `false`

7. **timestamp**

   - Type: `timestamp with time zone`
   - Default: `now()`

8. **em_uom**

   - Type: `text`
   - Nullable: `true`

9. **kpi_em_TotalEmission_CapitalGoods**

   - Type: `double precision`
   - Default: `0`

10. **kpi_em_CapitalGoods_Scope3**

    - Type: `double precision`
    - Default: `0`

11. **metadata**

    - Type: `jsonb`
    - Nullable: `true`

12. **created_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

13. **updated_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

14. **created_by**

    - Type: `uuid`
    - Nullable: `true`

15. **updated_by**

    - Type: `uuid`
    - Nullable: `true`

16. **is_deleted**

    - Type: `boolean`
    - Default: `false`

## SQL CREATE TABLE Query

```sql
-- Create KPIEmissionByCapitalGoods table
CREATE TABLE "KPIEmissionByCapitalGoods" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "region_id" uuid NOT NULL,
  "address_id" uuid NOT NULL,
  "month" numeric NOT NULL,
  "year" numeric NOT NULL,
  "timestamp" timestamp with time zone DEFAULT now(),
  "em_uom" text,
  "kpi_em_TotalEmission_CapitalGoods" double precision DEFAULT 0,
  "kpi_em_CapitalGoods_Scope3" double precision DEFAULT 0,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "is_deleted" boolean DEFAULT false
);
```

## Permissions Configuration

### Required Permissions

Allow the following roles to access the `KPIEmissionByCapitalGoods` table:

- **Location Executive** - Full CRUD access (Create, Read, Update, Delete)
- **Location Admin** - Full CRUD access (Create, Read, Update, Delete)

---

# Create New Table: KPIEmissionByCapitalGoods_Suppliers

# Table Name - KPIEmissionByCapitalGoods_Suppliers

## Table Columns

1. **id**

   - Type: `uuid`
   - Primary Key: `true`
   - Unique: `true`
   - Default: `gen_random_uuid()`

2. **organization_id**

   - Type: `uuid`
   - Nullable: `false`

3. **region_id**

   - Type: `uuid`
   - Nullable: `false`

4. **address_id**

   - Type: `uuid`
   - Nullable: `false`

5. **month**

   - Type: `numeric`
   - Nullable: `false`

6. **year**

   - Type: `numeric`
   - Nullable: `false`

7. **timestamp**

   - Type: `timestamp with time zone`
   - Default: `now()`

8. **supplier_id**

   - Type: `text`
   - Nullable: `true`

9. **supplier_name**

   - Type: `text`
   - Nullable: `true`

10. **supplier_category**

    - Type: `text`
    - Nullable: `true`

11. **em_uom**

    - Type: `text`
    - Nullable: `true`

12. **kpi_em_CapitalGoods_Scope3**

    - Type: `double precision`
    - Nullable: `true`

13. **metadata**

    - Type: `jsonb`
    - Nullable: `true`

14. **created_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

15. **updated_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

16. **created_by**

    - Type: `uuid`
    - Nullable: `true`

17. **updated_by**

    - Type: `uuid`
    - Nullable: `true`

18. **is_deleted**
    - Type: `boolean`
    - Default: `false`

## SQL CREATE TABLE Query

```sql
-- Create KPIEmissionByCapitalGoods_Suppliers table
CREATE TABLE "KPIEmissionByCapitalGoods_Suppliers" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "region_id" uuid NOT NULL,
  "address_id" uuid NOT NULL,
  "month" numeric NOT NULL,
  "year" numeric NOT NULL,
  "timestamp" timestamp with time zone DEFAULT now(),
  "supplier_id" text,
  "supplier_name" text,
  "supplier_category" text,
  "em_uom" text,
  "kpi_em_CapitalGoods_Scope3" double precision,
  "metadata" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "is_deleted" boolean DEFAULT false
);
```

---

# Add New Column to KPIMain

# Table Name - KPIMain

## New Column

1. **kpi_em_Cont_TotalEmission_Categories_CapitalGoods**

   - Type: `double precision`
   - Nullable: `true`
   - Default: `'0'::double precision`

## SQL ALTER TABLE Query

```sql
-- Add new column to KPIMain table
ALTER TABLE "KPIMain"
ADD COLUMN "kpi_em_Cont_TotalEmission_Categories_CapitalGoods" double precision DEFAULT '0'::double precision;
```

---
