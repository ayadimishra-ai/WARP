# Product Share Attribution (PCF) - Database Migration

## Overview

This migration document covers the database schema and master data setup required for the Product Share Attribution feature, enabling suppliers to allocate production percentages to buyers at the location level.

---

# Create New Table: GHGProductShareAttribution

# Table Name - GHGProductShareAttribution

## Table Description

This table stores product share allocation data where suppliers attribute a percentage of their total facility production to specific buyers' material codes. This data is used for Product Carbon Footprint (PCF) calculations and buyer-specific emissions attribution.

## Table Columns

1. **id**

   - Type: `uuid`
   - Primary Key: `true`
   - Unique: `true`
   - Default: `gen_random_uuid()`
   - Description: Unique identifier for each product share attribution record

2. **organization_address_id**

   - Type: `uuid`
   - Nullable: `false`
   - Description: Reference to the specific location/facility where production occurs

3. **task_request_id**

   - Type: `uuid`
   - Nullable: `true`
   - Description: Reference to the task request (if applicable)

4. **activity_task_request_id**

   - Type: `uuid`
   - Nullable: `true`
   - Description: Reference to the activity task request

5. **Material_Code**

   - Type: `text`
   - Nullable: `false`
   - Description: Material code as defined by the buyer

6. **Material_Name**

   - Type: `text`
   - Nullable: `true`
   - Description: Name of the material

7. **Material_Description**

   - Type: `text`
   - Nullable: `true`
   - Description: Description of the material (pre-populated from buyer mapping)

8. **SKU_Production_Percentage**

   - Type: `numeric`
   - Nullable: `true`
   - Default: `0`
   - Description: Percentage (0.01 to 100.0000) of total facility production allocated to this SKU
   - Constraint: Value must be between 0.01 and 100 when provided

9. **Rationale_For_Percentage**

   - Type: `text`
   - Nullable: `false`
   - Description: Rationale for the allocation percentage (By Revenue, By Mass, By Volume, By No of units)

10. **supporting_docs**

    - Type: `jsonb`
    - Nullable: `true`
    - Description: Supporting documents and attachments in JSON format

11. **meta_data**

    - Type: `jsonb`
    - Nullable: `true`
    - Description: Additional metadata including validation info, upload details, etc.

12. **created_at**

    - Type: `timestamp with time zone`
    - Default: `now()`
    - Description: Timestamp when the record was created

13. **updated_at**

    - Type: `timestamp with time zone`
    - Default: `now()`
    - Description: Timestamp when the record was last updated

14. **created_by**

    - Type: `uuid`
    - Nullable: `true`
    - Description: User who created the record

15. **updated_by**

    - Type: `uuid`
    - Nullable: `true`
    - Description: User who last updated the record

16. **is_deleted**
    - Type: `boolean`
    - Default: `false`
    - Description: Soft delete flag

## SQL CREATE TABLE Query

```sql
-- Create GHGProductShareAttribution table
CREATE TABLE "GHGProductShareAttribution" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_address_id" uuid NOT NULL,
  "task_request_id" uuid,
  "activity_task_request_id" uuid,
  "Material_Code" text,
  "Material_Name" text,
  "Material_Description" text,
  "SKU_Production_Percentage" numeric DEFAULT 0,
  "Rationale_For_Percentage" text,
  "supporting_docs" jsonb,
  "meta_data" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "is_deleted" boolean DEFAULT false
);

-- Add comment to table
COMMENT ON TABLE "GHGProductShareAttribution" IS
  'Stores product share allocation data for PCF calculations, attributing facility production percentages to specific buyer material codes';
```

## Permissions Configuration

### Required Permissions

Allow the following roles to access the `GHGProductShareAttribution` table:

- **Location Executive** - Full CRUD access (Create, Read, Update, Delete)
- **Location Admin** - Full CRUD access (Create, Read, Update, Delete)
- **Organization Admin** - Read-only access for reporting and analytics

---

# Add Rationale Master Data to Activity Master

# Table Name - ActivityMaster

# Master Key - product_share_allocation_rationale_for_percentage

## Description

Master data for rationale options that suppliers can select to justify their SKU production percentage calculations.

## New Master Data Entry

Add the following entry to the `ActivityMaster` table:

```json
{
  "master_key": "product_share_allocation_rationale_for_percentage",
  "master_data": [
    {
      "label": "By Revenue",
      "value": "by_revenue"
    },
    {
      "label": "By Mass",
      "value": "by_mass"
    },
    {
      "label": "By Volume",
      "value": "by_volume"
    },
    {
      "label": "By No of units",
      "value": "by_no_of_units"
    }
  ]
}
```

## SQL INSERT Query

```sql
-- Insert Product Share Allocation Rationale master data
INSERT INTO "ActivityMaster" ("master_key", "master_data", "created_at", "updated_at")
VALUES (
  'product_share_allocation_rationale_for_percentage',
  '[
    {
      "label": "By Revenue",
      "value": "by_revenue"
    },
    {
      "label": "By Mass",
      "value": "by_mass"
    },
    {
      "label": "By Volume",
      "value": "by_volume"
    },
    {
      "label": "By No of units",
      "value": "by_no_of_units"
    }
  ]'::jsonb,
  now(),
  now()
)
ON CONFLICT ("master_key")
DO UPDATE SET
  "master_data" = EXCLUDED."master_data",
  "updated_at" = now();
```

---

# Create Supplier Material Mapping Table

# Table Name - SupplierMaterialMapping

## Table Description

This table maintains the mapping between supplier addresses and material codes along with time periods. It uses ID-based relations instead of string codes:

- `organization_id` → Buyer's Organization (the org that owns this mapping)
- `supplier_address_mapping_id` → `SupplierAddressMapping.id` (resolves the supplier's address and org)
- `org_material_master_id` → `OrgMaterialMaster.id` (resolves the material code)

This data is uploaded in bulk from the backend by the SK Tech team based on buyer-provided information. There is no frontend UI for this table in Phase 1.

### Relation Chain

```
SupplierMaterialMapping
├── organization_id → Organization.id (buyer)
├── supplier_address_mapping_id → SupplierAddressMapping.id
│   ├── org_supplier_master_id → OrgSupplierMaster.id (supplier master record, owned by buyer)
│   ├── address_id → Addresses.id (supplier's address)
│   └── supplier_organization_address_id → OrganizationAddress.id (supplier's org address, if onboarded)
│       └── organization_id → Organization.id (supplier's org)
└── org_material_master_id → OrgMaterialMaster.id
    └── code → Material code string
```

## Table Columns

1. **id**

   - Type: `uuid`
   - Primary Key: `true`
   - Unique: `true`
   - Default: `gen_random_uuid()`
   - Description: Unique identifier for each mapping

2. **organization_id**

   - Type: `uuid`
   - Nullable: `false`
   - Description: Reference to the buyer organization that owns this mapping (Organization.id)

3. **supplier_address_mapping_id**

   - Type: `uuid`
   - Nullable: `false`
   - Description: Reference to the supplier address mapping (SupplierAddressMapping.id). Resolves the supplier via SupplierAddressMapping → OrgSupplierMaster, and the supplier's facility via SupplierAddressMapping.supplier_organization_address_id → OrganizationAddress.

4. **org_material_master_id**

   - Type: `uuid`
   - Nullable: `false`
   - Description: Reference to the material master record (OrgMaterialMaster.id). Resolves the material code via OrgMaterialMaster.code.

5. **From_Year**

   - Type: `numeric`
   - Nullable: `false`
   - Description: Start year of the period (4-digit numeric value, cannot be future year)

6. **From_Month**

   - Type: `text`
   - Nullable: `true`
   - Description: Start month of the period (Month name: January, February, March, April, May, June, July, August, September, October, November, December)

7. **To_Year**

   - Type: `numeric`
   - Nullable: `false`
   - Description: End year of the period (4-digit numeric value, must be >= From_Year)

8. **To_Month**

   - Type: `text`
   - Nullable: `true`
   - Description: End month of the period (Month name: January, February, March, April, May, June, July, August, September, October, November, December)

9. **meta_data**

   - Type: `jsonb`
   - Nullable: `true`
   - Description: Additional metadata including upload details, validation info

10. **created_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

11. **updated_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

12. **created_by**

    - Type: `uuid`
    - Nullable: `true`

13. **updated_by**

    - Type: `uuid`
    - Nullable: `true`

14. **is_deleted**
    - Type: `boolean`
    - Default: `false`

## SQL CREATE TABLE Query

```sql
-- Create SupplierMaterialMapping table
CREATE TABLE "SupplierMaterialMapping" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "supplier_address_mapping_id" uuid NOT NULL,
  "org_material_master_id" uuid NOT NULL,
  "From_Year" numeric NOT NULL,
  "From_Month" text,
  "To_Year" numeric NOT NULL,
  "To_Month" text,
  "meta_data" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,
  "is_deleted" boolean DEFAULT false
);

-- Add comment to table
COMMENT ON TABLE "SupplierMaterialMapping" IS
  'Maintains supplier material codes and time periods for Product Share Allocation. Uses ID-based relations: organization_id (buyer), supplier_address_mapping_id (supplier address), org_material_master_id (material). Data is bulk uploaded from backend by SK Tech team.';
```

## GraphQL Query

```graphql
query getSupplierMaterialMappig($organizationId: uuid!) {
  SupplierMaterialMapping(
    where: { organization_id: { _eq: $organizationId } }
  ) {
    id
    organization_id
    supplier_address_mapping_id
    org_material_master_id
    From_Year
    From_Month
    To_Year
    To_Month
    meta_data
  }
}
```

## Sample Data INSERT Queries

Sample data for CEAT supplier material mappings:

> **Note:** Replace `<supplier_address_mapping_id>` and `<org_material_master_id>` with actual UUIDs from the `SupplierAddressMapping` and `OrgMaterialMaster` tables respectively.

```sql
-- Insert SupplierMaterialMapping data for CEAT supplier
-- Buyer Org: ce25acad-8602-4c9f-9365-ebf4ac2d5a8e
-- supplier_address_mapping_id: lookup from SupplierAddressMapping where supplier is CEAT_001
-- org_material_master_id: lookup from OrgMaterialMaster for each material code

INSERT INTO "SupplierMaterialMapping"
  ("organization_id", "supplier_address_mapping_id", "org_material_master_id", "From_Year", "From_Month", "To_Year", "To_Month")
VALUES
  ('ce25acad-8602-4c9f-9365-ebf4ac2d5a8e', '<supplier_address_mapping_id>', '<org_material_master_id_CEAT-PCR-001>', 2021, 'April', 2024, 'December'),
  ('ce25acad-8602-4c9f-9365-ebf4ac2d5a8e', '<supplier_address_mapping_id>', '<org_material_master_id_CEAT-SUV-002>', 2021, 'May', 2024, 'December'),
  ('ce25acad-8602-4c9f-9365-ebf4ac2d5a8e', '<supplier_address_mapping_id>', '<org_material_master_id_CEAT-MC-003>', 2021, 'June', 2024, 'December');
```

## Sample TaskRequest Data INSERT Queries

Sample TaskRequest data for the periods covered by CEAT material mappings:

```sql
-- Insert TaskRequest data for organization_address_id: 3494f7e5-6b22-4d6c-a863-968365a84a63
-- Covers periods from April 2021 to March 2023

INSERT INTO "TaskRequest"
  ("organization_address_id", "year", "month")
VALUES
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'April'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'May'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'June'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'July'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'August'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'September'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'October'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'November'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2021, 'December'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'January'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'February'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'March'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'April'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'May'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'June'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'July'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'August'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'September'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'October'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'November'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2022, 'December'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2023, 'January'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2023, 'February'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 2023, 'March');

-- Verify the inserted TaskRequest data
SELECT "id", "organization_address_id", "year", "month", "created_at"
FROM "TaskRequest"
WHERE "organization_address_id" = '3494f7e5-6b22-4d6c-a863-968365a84a63'
ORDER BY "year", "month";
```

## Sample ActivityTaskRequest Data INSERT Queries

Sample ActivityTaskRequest data linking the activity to the 24 task requests:

```sql
-- Insert ActivityTaskRequest data
-- organization_address_id: 3494f7e5-6b22-4d6c-a863-968365a84a63
-- activity_id: 6f9c17f6-3b22-4f88-aef1-f38bf42f432c

INSERT INTO "ActivityTaskRequest"
  ("organization_address_id", "activity_id", "task_request_id")
VALUES
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'de36aaa1-32a8-4d9c-81aa-aa8d4740b151'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'b295eb38-0d72-4637-9fa1-e2e360b6e436'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '9d242cfa-cd9d-4e8b-ae55-38875d163731'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'ddb2e353-d9dd-440b-a8a3-683187866c92'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'e3f4134e-e27a-4a35-83ed-48d46fa64c1e'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'e1e5920a-d118-4258-bf9f-b677f9eae59e'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '6182655f-73d5-4817-a301-d68b0a1d07f6'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'bbf35965-ca1f-42a5-8f1d-387dae51baab'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '68e56f2e-0f8f-4246-be57-5dbaa17f2e39'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '1482f7bc-98fc-4d97-9658-049b338bc013'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'b3090058-ec43-47f4-9409-99b8e3444c2c'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '373146f6-96ef-4ba2-ad2f-7cb80d9436eb'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'fc108699-cdd1-463d-b306-4f33035b31cf'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'ed6d7a73-87f6-4e3b-a506-ee639f39673a'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'afb9a28f-72ff-49b1-bf63-1b1891ce67c0'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '39e1082a-3856-4e9d-96af-7ace7b8cc429'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'f3ff1f77-8969-401f-8e80-da0dca0c652b'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '64e5bc85-54b1-402f-97e7-e44dc7fb9f14'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'a55a6799-bb2c-4578-9d34-f3d4e482416f'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'c67a286b-fc42-4f39-963c-fc703a9d2909'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', 'ceac607b-4983-444a-91af-6669f4a9318f'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '959719c1-9e91-480d-a239-7ceea5a58cf8'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '06111a8d-f309-451c-9a1d-964d28ddcdb2'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6f9c17f6-3b22-4f88-aef1-f38bf42f432c', '12f8c027-89d4-4d1c-83cb-68407e12c49d');

-- Verify the inserted ActivityTaskRequest data
SELECT "id", "organization_address_id", "activity_id", "task_request_id", "created_at"
FROM "ActivityTaskRequest"
WHERE "organization_address_id" = '3494f7e5-6b22-4d6c-a863-968365a84a63'
  AND "activity_id" = '6f9c17f6-3b22-4f88-aef1-f38bf42f432c'
ORDER BY "created_at";
```

## Sample GHGProductShareAttribution Data INSERT Queries

Sample GHGProductShareAttribution data with material codes for each period:

```sql
-- Insert GHGProductShareAttribution data
-- organization_address_id: 3494f7e5-6b22-4d6c-a863-968365a84a63
-- activity_id: 6f9c17f6-3b22-4f88-aef1-f38bf42f432c
-- Buyer_Name: India services

-- Note: task_request_id and activity_task_request_id mappings:
-- 2021-April: task=de36aaa1-32a8-4d9c-81aa-aa8d4740b151, activity_task=d068d3ec-3e56-434d-9079-d6b0d0667d66
-- 2021-May: task=b295eb38-0d72-4637-9fa1-e2e360b6e436, activity_task=894e6212-0218-4526-88e9-9e3423b66fcb
-- 2021-June: task=9d242cfa-cd9d-4e8b-ae55-38875d163731, activity_task=1fab6591-024b-48ea-80e9-932ec0b0fcd9
-- 2021-July: task=ddb2e353-d9dd-440b-a8a3-683187866c92, activity_task=516ad9b7-ee4f-44af-9986-f25f8968ef32
-- 2021-August: task=e3f4134e-e27a-4a35-83ed-48d46fa64c1e, activity_task=00ca61a3-e7a3-4371-9816-c04642676caf
-- 2021-September: task=e1e5920a-d118-4258-bf9f-b677f9eae59e, activity_task=f793580a-6348-4945-9e50-63faef406628
-- 2021-October: task=6182655f-73d5-4817-a301-d68b0a1d07f6, activity_task=1741ac1a-7d12-47cd-9afb-41dee41dc281
-- 2021-November: task=bbf35965-ca1f-42a5-8f1d-387dae51baab, activity_task=62de47de-77d8-4ab6-acce-f09679d6745a
-- 2021-December: task=68e56f2e-0f8f-4246-be57-5dbaa17f2e39, activity_task=5d775c36-b55c-40d5-8763-9233e0f5f40f
-- 2022-January: task=1482f7bc-98fc-4d97-9658-049b338bc013, activity_task=2e209551-2472-407d-82ff-7ee1902b14ae
-- 2022-February: task=b3090058-ec43-47f4-9409-99b8e3444c2c, activity_task=7a0eefec-918e-48c9-9a25-429c083f2c3f
-- 2022-March: task=373146f6-96ef-4ba2-ad2f-7cb80d9436eb, activity_task=93c0d084-b3f7-438e-b3e6-d2ee717f18be
-- 2022-April: task=fc108699-cdd1-463d-b306-4f33035b31cf, activity_task=88d9559a-67ac-49c3-9513-b3c3f7fed966
-- 2022-May: task=ed6d7a73-87f6-4e3b-a506-ee639f39673a, activity_task=2fbb551b-dce9-4304-856a-5ab71904c847
-- 2022-June: task=afb9a28f-72ff-49b1-bf63-1b1891ce67c0, activity_task=3b365465-b721-4faa-9247-8a1d11ff1824
-- 2022-July: task=39e1082a-3856-4e9d-96af-7ace7b8cc429, activity_task=22d161f4-6223-40ae-8313-5dbd140733c0
-- 2022-August: task=f3ff1f77-8969-401f-8e80-da0dca0c652b, activity_task=0ee7de6a-0020-45ae-87b2-0500fda10873
-- 2022-September: task=64e5bc85-54b1-402f-97e7-e44dc7fb9f14, activity_task=a2eb0013-3bd5-447d-bb39-f8a99b5e3363
-- 2022-October: task=a55a6799-bb2c-4578-9d34-f3d4e482416f, activity_task=caeaf1b6-22b0-4bce-b5c2-9a2d4c7523d6
-- 2022-November: task=c67a286b-fc42-4f39-963c-fc703a9d2909, activity_task=74a54881-f551-4efc-bc3f-b8ebd9243fd5
-- 2022-December: task=ceac607b-4983-444a-91af-6669f4a9318f, activity_task=864bcd83-63ff-486c-aa16-3029f318d4fb
-- 2023-January: task=959719c1-9e91-480d-a239-7ceea5a58cf8, activity_task=87e3c0c4-f270-468a-b62a-f8e936d8a6e4
-- 2023-February: task=06111a8d-f309-451c-9a1d-964d28ddcdb2, activity_task=746c9bfd-953a-4890-8ce0-bab172cb84b9
-- 2023-March: task=12f8c027-89d4-4d1c-83cb-68407e12c49d, activity_task=22d93cef-f399-48c6-9247-99a7d195e61e

INSERT INTO "GHGProductShareAttribution"
  ("organization_address_id", "task_request_id", "activity_task_request_id", "Material_Code", "Buyer_Name", "SKU_Production_Percentage", "Rationale_For_Percentage")
VALUES
  -- 2021 April - CEAT-PCR-001 and CEAT-RC-025
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'de36aaa1-32a8-4d9c-81aa-aa8d4740b151', 'd068d3ec-3e56-434d-9079-d6b0d0667d66',
   'CEAT-PCR-001', 'India services', 45.5000, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'de36aaa1-32a8-4d9c-81aa-aa8d4740b151', 'd068d3ec-3e56-434d-9079-d6b0d0667d66',
   'CEAT-RC-025', 'India services', 54.5000, 'By Mass'),

  -- 2021 May - CEAT-SUV-002 and CEAT-PCR-026
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'b295eb38-0d72-4637-9fa1-e2e360b6e436', '894e6212-0218-4526-88e9-9e3423b66fcb',
   'CEAT-SUV-002', 'India services', 48.7500, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'b295eb38-0d72-4637-9fa1-e2e360b6e436', '894e6212-0218-4526-88e9-9e3423b66fcb',
   'CEAT-PCR-026', 'India services', 51.2500, 'By No of units'),

  -- 2021 June - CEAT-MC-003 and CEAT-SUV-027
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '9d242cfa-cd9d-4e8b-ae55-38875d163731', '1fab6591-024b-48ea-80e9-932ec0b0fcd9',
   'CEAT-MC-003', 'India services', 52.3333, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '9d242cfa-cd9d-4e8b-ae55-38875d163731', '1fab6591-024b-48ea-80e9-932ec0b0fcd9',
   'CEAT-SUV-027', 'India services', 47.6667, 'By Mass'),

  -- 2021 July - CEAT-SCO-004 and CEAT-MC-028
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'ddb2e353-d9dd-440b-a8a3-683187866c92', '516ad9b7-ee4f-44af-9986-f25f8968ef32',
   'CEAT-SCO-004', 'India services', 49.1250, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'ddb2e353-d9dd-440b-a8a3-683187866c92', '516ad9b7-ee4f-44af-9986-f25f8968ef32',
   'CEAT-MC-028', 'India services', 50.8750, 'By No of units'),

  -- 2021 August - CEAT-CV-005 and CEAT-SCO-029
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'e3f4134e-e27a-4a35-83ed-48d46fa64c1e', '00ca61a3-e7a3-4371-9816-c04642676caf',
   'CEAT-CV-005', 'India services', 46.2500, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'e3f4134e-e27a-4a35-83ed-48d46fa64c1e', '00ca61a3-e7a3-4371-9816-c04642676caf',
   'CEAT-SCO-029', 'India services', 53.7500, 'By Mass'),

  -- 2021 September - CEAT-CV-006 and CEAT-CV-030
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'e1e5920a-d118-4258-bf9f-b677f9eae59e', 'f793580a-6348-4945-9e50-63faef406628',
   'CEAT-CV-006', 'India services', 50.0000, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'e1e5920a-d118-4258-bf9f-b677f9eae59e', 'f793580a-6348-4945-9e50-63faef406628',
   'CEAT-CV-030', 'India services', 50.0000, 'By No of units'),

  -- 2021 October - CEAT-LCV-007 and CEAT-CV-031
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6182655f-73d5-4817-a301-d68b0a1d07f6', '1741ac1a-7d12-47cd-9afb-41dee41dc281',
   'CEAT-LCV-007', 'India services', 47.8900, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '6182655f-73d5-4817-a301-d68b0a1d07f6', '1741ac1a-7d12-47cd-9afb-41dee41dc281',
   'CEAT-CV-031', 'India services', 52.1100, 'By Mass'),

  -- 2021 November - CEAT-AG-008 and CEAT-LCV-032
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'bbf35965-ca1f-42a5-8f1d-387dae51baab', '62de47de-77d8-4ab6-acce-f09679d6745a',
   'CEAT-AG-008', 'India services', 51.5500, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'bbf35965-ca1f-42a5-8f1d-387dae51baab', '62de47de-77d8-4ab6-acce-f09679d6745a',
   'CEAT-LCV-032', 'India services', 48.4500, 'By No of units'),

  -- 2021 December - CEAT-AG-009 and CEAT-AG-033
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '68e56f2e-0f8f-4246-be57-5dbaa17f2e39', '5d775c36-b55c-40d5-8763-9233e0f5f40f',
   'CEAT-AG-009', 'India services', 49.6700, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '68e56f2e-0f8f-4246-be57-5dbaa17f2e39', '5d775c36-b55c-40d5-8763-9233e0f5f40f',
   'CEAT-AG-033', 'India services', 50.3300, 'By Mass'),

  -- 2022 January - CEAT-OHT-010 and CEAT-AG-034
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '1482f7bc-98fc-4d97-9658-049b338bc013', '2e209551-2472-407d-82ff-7ee1902b14ae',
   'CEAT-OHT-010', 'India services', 48.9000, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '1482f7bc-98fc-4d97-9658-049b338bc013', '2e209551-2472-407d-82ff-7ee1902b14ae',
   'CEAT-AG-034', 'India services', 51.1000, 'By No of units'),

  -- 2022 February - CEAT-CON-011 and CEAT-OHT-035
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'b3090058-ec43-47f4-9409-99b8e3444c2c', '7a0eefec-918e-48c9-9a25-429c083f2c3f',
   'CEAT-CON-011', 'India services', 52.4400, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'b3090058-ec43-47f4-9409-99b8e3444c2c', '7a0eefec-918e-48c9-9a25-429c083f2c3f',
   'CEAT-OHT-035', 'India services', 47.5600, 'By Mass'),

  -- 2022 March - CEAT-EM-012 and CEAT-CON-036
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '373146f6-96ef-4ba2-ad2f-7cb80d9436eb', '93c0d084-b3f7-438e-b3e6-d2ee717f18be',
   'CEAT-EM-012', 'India services', 46.8800, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '373146f6-96ef-4ba2-ad2f-7cb80d9436eb', '93c0d084-b3f7-438e-b3e6-d2ee717f18be',
   'CEAT-CON-036', 'India services', 53.1200, 'By No of units'),

  -- 2022 April - CEAT-PCR-013 and CEAT-EM-037
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'fc108699-cdd1-463d-b306-4f33035b31cf', '88d9559a-67ac-49c3-9513-b3c3f7fed966',
   'CEAT-PCR-013', 'India services', 50.5000, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'fc108699-cdd1-463d-b306-4f33035b31cf', '88d9559a-67ac-49c3-9513-b3c3f7fed966',
   'CEAT-EM-037', 'India services', 49.5000, 'By Mass'),

  -- 2022 May - CEAT-SP-014 and CEAT-PCR-038
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'ed6d7a73-87f6-4e3b-a506-ee639f39673a', '2fbb551b-dce9-4304-856a-5ab71904c847',
   'CEAT-SP-014', 'India services', 47.2200, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'ed6d7a73-87f6-4e3b-a506-ee639f39673a', '2fbb551b-dce9-4304-856a-5ab71904c847',
   'CEAT-PCR-038', 'India services', 52.7800, 'By No of units'),

  -- 2022 June - CEAT-AT-015 and CEAT-SP-039
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'afb9a28f-72ff-49b1-bf63-1b1891ce67c0', '3b365465-b721-4faa-9247-8a1d11ff1824',
   'CEAT-AT-015', 'India services', 51.3300, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'afb9a28f-72ff-49b1-bf63-1b1891ce67c0', '3b365465-b721-4faa-9247-8a1d11ff1824',
   'CEAT-SP-039', 'India services', 48.6700, 'By Mass'),

  -- 2022 July - CEAT-WG-016 and CEAT-AT-040
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '39e1082a-3856-4e9d-96af-7ace7b8cc429', '22d161f4-6223-40ae-8313-5dbd140733c0',
   'CEAT-WG-016', 'India services', 49.7500, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '39e1082a-3856-4e9d-96af-7ace7b8cc429', '22d161f4-6223-40ae-8313-5dbd140733c0',
   'CEAT-AT-040', 'India services', 50.2500, 'By No of units'),

  -- 2022 August - CEAT-ACC-017 and CEAT-WG-041
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'f3ff1f77-8969-401f-8e80-da0dca0c652b', '0ee7de6a-0020-45ae-87b2-0500fda10873',
   'CEAT-ACC-017', 'India services', 48.1100, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'f3ff1f77-8969-401f-8e80-da0dca0c652b', '0ee7de6a-0020-45ae-87b2-0500fda10873',
   'CEAT-WG-041', 'India services', 51.8900, 'By Mass'),

  -- 2022 September - CEAT-ACC-018 and CEAT-ACC-042
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '64e5bc85-54b1-402f-97e7-e44dc7fb9f14', 'a2eb0013-3bd5-447d-bb39-f8a99b5e3363',
   'CEAT-ACC-018', 'India services', 50.0000, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '64e5bc85-54b1-402f-97e7-e44dc7fb9f14', 'a2eb0013-3bd5-447d-bb39-f8a99b5e3363',
   'CEAT-ACC-042', 'India services', 50.0000, 'By No of units'),

  -- 2022 October - CEAT-ACC-019 and CEAT-ACC-043
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'a55a6799-bb2c-4578-9d34-f3d4e482416f', 'caeaf1b6-22b0-4bce-b5c2-9a2d4c7523d6',
   'CEAT-ACC-019', 'India services', 46.5000, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'a55a6799-bb2c-4578-9d34-f3d4e482416f', 'caeaf1b6-22b0-4bce-b5c2-9a2d4c7523d6',
   'CEAT-ACC-043', 'India services', 53.5000, 'By Mass'),

  -- 2022 November - CEAT-RR-020 and CEAT-IND-044
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'c67a286b-fc42-4f39-963c-fc703a9d2909', '74a54881-f551-4efc-bc3f-b8ebd9243fd5',
   'CEAT-RR-020', 'India services', 52.6600, 'By Volume'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'c67a286b-fc42-4f39-963c-fc703a9d2909', '74a54881-f551-4efc-bc3f-b8ebd9243fd5',
   'CEAT-IND-044', 'India services', 47.3400, 'By No of units'),

  -- 2022 December - CEAT-IND-021 and CEAT-3W-045
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'ceac607b-4983-444a-91af-6669f4a9318f', '864bcd83-63ff-486c-aa16-3029f318d4fb',
   'CEAT-IND-021', 'India services', 49.9900, 'By Revenue'),
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', 'ceac607b-4983-444a-91af-6669f4a9318f', '864bcd83-63ff-486c-aa16-3029f318d4fb',
   'CEAT-3W-045', 'India services', 50.0100, 'By Mass'),

  -- 2023 January - CEAT-3W-022
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '959719c1-9e91-480d-a239-7ceea5a58cf8', '87e3c0c4-f270-468a-b62a-f8e936d8a6e4',
   'CEAT-3W-022', 'India services', 100.0000, 'By Volume'),

  -- 2023 February - CEAT-3W-023
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '06111a8d-f309-451c-9a1d-964d28ddcdb2', '746c9bfd-953a-4890-8ce0-bab172cb84b9',
   'CEAT-3W-023', 'India services', 100.0000, 'By No of units'),

  -- 2023 March - CEAT-RACE-024
  ('3494f7e5-6b22-4d6c-a863-968365a84a63', '12f8c027-89d4-4d1c-83cb-68407e12c49d', '22d93cef-f399-48c6-9247-99a7d195e61e',
   'CEAT-RACE-024', 'India services', 100.0000, 'By Revenue');

-- Verify the inserted GHGProductShareAttribution data
SELECT "id", "organization_address_id", "task_request_id", "Material_Code", "Buyer_Name", "SKU_Production_Percentage", "created_at"
FROM "GHGProductShareAttribution"
WHERE "organization_address_id" = '3494f7e5-6b22-4d6c-a863-968365a84a63'
ORDER BY "task_request_id", "Material_Code";
```

---

# Supplier Material Mapping - Validation Rules

## Field Validations

### From_Year

**Field Type:** Integer | **Mandatory:** Yes

**Validation Rules:**

- Must be a 4-digit numeric value (e.g., 2023)
- Cannot be a future year beyond the current year
- Must be less than or equal to "To_Year"

**Error Messages:**

- If blank: "From Year is required."
- If not 4 digits: "From Year must be a 4-digit numeric value."
- If future year: "From Year cannot be a future year."
- If > To_Year: "From Year must be less than or equal to To Year."

### From_Month

**Field Type:** Text | **Mandatory:** Yes

**Validation Rules:**

- Must be a valid month name: January, February, March, April, May, June, July, August, September, October, November, December
- Case-insensitive validation (accepts "january", "JANUARY", "January", etc.)
- If "From_Year" equals "To_Year", From_Month must be chronologically before or equal to "To_Month"

**Error Messages:**

- If blank: "From Month is required."
- If invalid: "From Month must be a valid month name (January - December)."
- If invalid when same year: "From Month must be chronologically before or equal to To Month when years are the same."

### To_Year

**Field Type:** Integer | **Mandatory:** Yes

**Validation Rules:**

- Must be a 4-digit numeric value
- Must be greater than or equal to "From_Year"
- Cannot be a future year beyond the current year

**Error Messages:**

- If blank: "To Year is required."
- If not 4 digits: "To Year must be a 4-digit numeric value."
- If < From_Year: "To Year must be greater than or equal to From Year."
- If future year: "To Year cannot be a future year."

### To_Month

**Field Type:** Text | **Mandatory:** Yes

**Validation Rules:**

- Must be a valid month name: January, February, March, April, May, June, July, August, September, October, November, December
- Case-insensitive validation (accepts "january", "JANUARY", "January", etc.)
- If "From_Year" equals "To_Year", To_Month must be chronologically after or equal to "From_Month"
- The resulting date range (From Year+Month to To Year+Month) must not exceed a defined maximum period

**Error Messages:**

- If blank: "To Month is required."
- If invalid: "To Month must be a valid month name (January - December)."
- If invalid when same year: "To Month must be chronologically after or equal to From Month when years are the same."
- If period too long: "The date range exceeds the maximum allowed period."

### Supplier_Code

**Field Type:** Text | **Mandatory:** Yes

**Validation Rules:**

- Must exist in the system's registered supplier master
- Alphanumeric with allowed special characters: `-`, `.`, `_`
- Maximum character limit as per system standard

**Error Messages:**

- If blank: "Supplier Code is required."
- If not found: "Supplier Code does not exist in the system."
- If invalid format: "Supplier Code contains invalid characters. Only alphanumeric and -.\_ are allowed."

### Material_Code

**Field Type:** Text | **Mandatory:** Yes

**Validation Rules:**

- Must exist in the system's material master
- Must be mapped/linked to the provided Supplier_Code
- Alphanumeric with allowed special characters: `,`, `.`, `-`, `_`
- Must be active in the system

**Error Messages:**

- If blank: "Material Code is required."
- If not found: "Material Code does not exist in the system."
- If not linked to supplier: "Material Code is not associated with the provided Supplier Code."
- If invalid format: "Material Code contains invalid characters. Only alphanumeric and ,.-\_ are allowed."
- If inactive: "Material Code is not active in the system."

## Duplicate Check

**Fields Checked:** All fields combined

**Logic:** If all the below fields have exactly the same data, the record is marked as duplicate:

- Buyer Organization ID
- Supplier Organization ID
- From_Year
- From_Month
- To_Year
- To_Month
- Supplier_Code
- Material_Code

**Error Message:**

```
"Duplicate record found. A mapping with the same Supplier Code, Material Code, and period already exists."
```

## Backend Upload Approach

**Phase 1 Implementation:**

- Data will be bulk uploaded from the Backend by SK Tech team
- Template Name: `SupplierMaterialMapping`
- No Frontend UI in this phase
- Buyer provides details in Excel sheet format
- SK Tech team uploads data via backend scripts/tools

**Excel Template Columns:**

1. Buyer Organization ID (or Buyer Organization Name)
2. Supplier Organization ID (or Supplier Organization Name)
3. From Year
4. From Month
5. To Year
6. To Month
7. Supplier Code
8. Material Code

---

# Add New Activity Entry for Product Share Allocation

# Table Name - Activity

## Activity Details

Add a new activity for Product Share Allocation with the following details:

- **name**: `Product Share Allocation`
- **code**: `product_share_allocation`
- **meta_data**:

```json
{
  "ui": {
    "listing": {
      "column_name": "Product Share Allocation",
      "column_index": 17
    }
  },
  "download_url_template": "https://beta.snowkap.com/ops/Product_Share_Allocation_Template.xlsx"
}
```

## SQL INSERT Query

```sql
-- Insert Product Share Allocation Activity
INSERT INTO "Activity" ("name", "code", "meta_data", "created_at", "updated_at")
VALUES (
  'Product Share Allocation',
  'product_share_allocation',
  '{
    "ui": {
      "listing": {
        "column_name": "Product Share Allocation",
        "column_index": 18
      }
    },
    "download_url_template": "https://beta.snowkap.com/ops/Product_Share_Allocation_Template.xlsx"
  }'::jsonb,
  now(),
  now()
)
ON CONFLICT ("code") DO NOTHING;
```

---

# Migration Checklist

## Database Changes

- [ ] Create `GHGProductShareAttribution` table
- [ ] Create `SupplierMaterialMapping` table
- [ ] Create `KPIProductCarbonFootprintSupplierFacility` table
- [ ] Create `KPIProductCarbonFootprintMaterialProcurement` table
- [ ] Create `KPIProductCarbonFootprintUpstream` table
- [ ] Insert `product_share_allocation_rationale_for_percentage` master data
- [ ] Insert activity `Product Share Allocation`
- [ ] Configure row-level security policies
- [ ] Grant permissions to Location Executive role
- [ ] Grant permissions to Location Admin role

## Template Configuration

- [ ] Create Excel template for SupplierMaterialMapping (backend upload)
- [ ] Create Excel template for Product Share Allocation (user upload)
- [ ] Add data validation rules to Excel templates
- [ ] Upload Product Share Allocation template to CDN/file storage
- [ ] Update download URL in Activity meta_data

## API Development

- [ ] Create backend script/API for SupplierMaterialMapping bulk upload
- [ ] Implement validation logic for SupplierMaterialMapping fields
- [ ] Create GraphQL queries for fetching supplier material mappings
- [ ] Create GraphQL mutation for Product Share Allocation template upload
- [ ] Implement duplicate validation logic
- [ ] Implement location validation logic
- [ ] Implement percentage range validation
- [ ] Implement total allocation validation
- [ ] Create API for template download

## UI Development

- [ ] Add "Product Share Allocation" to Download Template dropdown
- [ ] Update upload popup to include location validation
- [ ] Implement error display for row-specific validation errors
- [ ] Add success/failure notifications
- [ ] Update Data Update Logs listing to show Product Share Allocation records
- [ ] Implement edit/delete functionality for Location Executives

## Testing

- [ ] Test SupplierMaterialMapping backend bulk upload
- [ ] Test SupplierMaterialMapping field validations
- [ ] Test SupplierMaterialMapping duplicate check
- [ ] Test Product Share Allocation template generation
- [ ] Test duplicate validation (within file)
- [ ] Test duplicate validation (against database)
- [ ] Test location validation
- [ ] Test percentage range validation
- [ ] Test rationale dropdown values
- [ ] Test role-based permissions
- [ ] Test location dropdown filtering
- [ ] Test soft delete functionality with is_deleted flag
- [ ] Test total allocation warning/blocking

---

# Notes

1. **Backend Upload:** In Phase 1, `SupplierMaterialMapping` data is bulk uploaded by SK Tech team from the backend. There is no frontend UI for this functionality.

2. **Percentage Flexibility:** The system allows percentages that don't sum to exactly 100% (with warnings), acknowledging that suppliers may have other SKUs not listed or rounding differences.

3. **Audit Trail:** The `created_by`, `updated_by`, `created_at`, and `updated_at` fields provide a complete audit trail for compliance and troubleshooting.

4. **Soft Delete:** The `is_deleted` flag enables soft deletion, preserving historical data while marking records as deleted.

5. **Location Consistency:** Location dropdown filtering matches other activity upload screens, providing a consistent user experience.

6. **Role Isolation:** Location Executives can only access data for their assigned locations, ensuring data security and privacy.

---

# KPI Tables for PCF Calculation

The following three KPI tables store calculated Product Carbon Footprint data at different stages of the supply chain. The final PCF is calculated by aggregating data from these three tables.

---

# Create New Table: KPIProductCarbonFootprintSupplierFacility

# Table Name - KPIProductCarbonFootprintSupplierFacility

## Table Description

This table stores allocated emissions from supplier facility operations (grid power, captive power, fuel, waste) attributed to specific buyer materials based on supplier-provided allocation percentages.

## Data Ownership Summary

This is a **buyer-centric** KPI table that combines data from multiple sources:

| Category | Columns | Source |
|----------|---------|--------|
| **Buyer Context** | `organization_id`, `address_id`, `region_id`, `year`, `month` | Buyer's Organization, OrganizationAddress, TaskRequest |
| **Material Mapping** | `supplier_code`, `buyer_material_code` | Buyer's `SupplierMaterialMapping` table |
| **Procurement Data** | `buyer_material_procurement_quantity`, `buyer_material_procurement_uom` | Buyer's `GHGMaterialProcurement` table |
| **Allocation Data** | `allocation_percentage` | Supplier's `GHGProductShareAttribution` table (matched by year/month) |
| **Emission Data** | `kpi_allocated_em_Grid_Power`, `kpi_allocated_em_Captive_Power`, `kpi_allocated_em_Fuel_Purchased`, `kpi_allocated_em_Waste_Generation` | Supplier's KPI tables (`KPIEmissionByPowerConsumption`, `KPIEmissionByFuelConsumption`, `KPIEmissionByWasteGeneration`) |
| **Calculated** | `kpi_em_pcf_per_unit`, `kpi_em_pcf_per_unit_uom` | Calculated in service layer |
| **Audit** | `created_by`, `updated_by`, `created_at`, `updated_at` | User session / system defaults |

## Table Columns

1. **id**

   - Type: `uuid`
   - Primary Key: `true`
   - Unique: `true`
   - Default: `gen_random_uuid()`
   - Description: Unique identifier for each record

2. **organization_id**

   - Type: `uuid`
   - Nullable: `false`
   - Source: Buyer's `Organization.id`
   - Description: Reference to the buyer organization

3. **address_id**

   - Type: `uuid`
   - Nullable: `false`
   - Source: Buyer's `OrganizationAddress.id` (from `TaskRequest.organization_address_id`)
   - Description: Reference to the buyer's location/facility. PCF data is stored from the buyer's perspective; supplier emissions are fetched from supplier's KPI tables and allocated to buyer.

4. **region_id**

   - Type: `uuid`
   - Nullable: `true`
   - Source: Buyer's Region (resolved from buyer's `address_id` → `Addresses` → `Country` → `Region`)
   - Description: Reference to the buyer's region

5. **year**

   - Type: `numeric`
   - Nullable: `false`
   - Source: Buyer's `TaskRequest.year`
   - Description: Year of the emission data

6. **month**

   - Type: `numeric`
   - Nullable: `false`
   - Source: Buyer's `TaskRequest.month` (converted to numeric 1-12)
   - Description: Month of the emission data (1-12)

7. **timestamp**

   - Type: `timestamp with time zone`
   - Nullable: `true`
   - Default: `now()`
   - Description: Timestamp for the data point

8. **supplier_code**

   - Type: `text`
   - Nullable: `false`
   - Source: Buyer's `SupplierMaterialMapping` → `SupplierAddressMapping.supplier_organization_address_id` → `OrganizationAddress` → `Addresses.code`
   - Description: Supplier facility code (resolved from buyer's supplier-material mappings)

9. **buyer_material_code**

   - Type: `text`
   - Nullable: `false`
   - Source: Buyer's `SupplierMaterialMapping.org_material_master_id` → `OrgMaterialMaster.code`
   - Description: Material code as defined by the buyer

10. **buyer_material_procurement_quantity**

    - Type: `double precision`
    - Nullable: `true`
    - Source: Buyer's `GHGMaterialProcurement.Material_Quantity_Procured` (UOM-converted and aggregated in service layer)
    - Description: Quantity of material procured by the buyer (converted to standard UOM)

11. **buyer_material_procurement_uom**

    - Type: `text`
    - Nullable: `true`
    - Source: Buyer's `GHGMaterialProcurement.Material_Quantity_Procured_uom` (standardized in service layer)
    - Description: Unit of measure for procurement quantity (KG, Litre, etc.)

12. **allocation_percentage**

    - Type: `double precision`
    - Nullable: `true`
    - Source: Supplier's `GHGProductShareAttribution.SKU_Production_Percentage` (matched by year/month from supplier's TaskRequest)
    - Description: Supplier-provided allocation percentage for this material (Quantity of SKU purchased by buyer vs total facility production)

13. **kpi_allocated_em_Grid_Power**

    - Type: `double precision`
    - Nullable: `true`
    - Source: Supplier's `KPIEmissionByPowerConsumption.kpi_em_TotalPowerPurchased` (converted tCO2e → KgCO2e)
    - Description: Allocated emissions from grid power consumption (KgCO2e)

14. **kpi_allocated_em_Captive_Power**

    - Type: `double precision`
    - Nullable: `true`
    - Source: Supplier's `KPIEmissionByPowerConsumption.kpi_em_CaptivePower` (converted tCO2e → KgCO2e)
    - Description: Allocated emissions from captive power generation (KgCO2e)

15. **kpi_allocated_em_Fuel_Purchased**

    - Type: `double precision`
    - Nullable: `true`
    - Source: Supplier's `KPIEmissionByFuelConsumption.kpi_em_TotalEmission_FuelConsumption` (converted tCO2e → KgCO2e)
    - Description: Allocated emissions from fuel consumption (KgCO2e)

16. **kpi_allocated_em_Waste_Generation**

    - Type: `double precision`
    - Nullable: `true`
    - Source: Supplier's `KPIEmissionByWasteGeneration.kpi_em_TotalEmission_WasteGeneration` (converted tCO2e → KgCO2e)
    - Description: Allocated emissions from waste generated (KgCO2e)

17. **kpi_em_pcf_per_unit**

    - Type: `double precision`
    - Nullable: `true`
    - Source: Calculated in service layer
    - Formula: `(allocation_percentage / 100) × (Grid + Captive + Fuel + Waste) / buyer_material_procurement_quantity`
    - Description: Facility Emissions Per Unit (KgCO2e per unit quantity)

18. **kpi_em_pcf_per_unit_uom**

    - Type: `text`
    - Nullable: `true`
    - Source: Calculated in service layer
    - Description: Emission unit of measure (e.g., `KgCO2e/KG`, `KgCO2e/Litre`)

19. **metadata**

    - Type: `jsonb`
    - Nullable: `true`
    - Description: Additional metadata

20. **is_deleted**

    - Type: `boolean`
    - Default: `false`

21. **created_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

22. **updated_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

23. **created_by**

    - Type: `uuid`
    - Nullable: `true`
    - Source: User session `user_id`
    - Description: User who created the record

24. **updated_by**

    - Type: `uuid`
    - Nullable: `true`
    - Source: User session `user_id`
    - Description: User who last updated the record

## SQL CREATE TABLE Query

```sql
-- Create KPIProductCarbonFootprintSupplierFacility table
CREATE TABLE "KPIProductCarbonFootprintSupplierFacility" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "address_id" uuid NOT NULL,
  "region_id" uuid,
  "year" numeric NOT NULL,
  "month" numeric NOT NULL,
  "timestamp" timestamp with time zone,
  "supplier_code" text NOT NULL,
  "buyer_material_code" text NOT NULL,
  "buyer_material_procurement_quantity" double precision,
  "buyer_material_procurement_uom" text,
  "allocation_percentage" double precision,
  "kpi_allocated_em_Grid_Power" double precision,
  "kpi_allocated_em_Captive_Power" double precision,
  "kpi_allocated_em_Fuel_Purchased" double precision,
  "kpi_allocated_em_Waste_Generation" double precision,
  "kpi_em_pcf_per_unit" double precision,
  "kpi_em_pcf_per_unit_uom" text,
  "metadata" jsonb,
  "is_deleted" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid
);

-- Add comment to table
COMMENT ON TABLE "KPIProductCarbonFootprintSupplierFacility" IS
  'Stores allocated supplier facility emissions for PCF calculation based on supplier allocation percentages';
```

---

# Create New Table: KPIProductCarbonFootprintMaterialProcurement

# Table Name - KPIProductCarbonFootprintMaterialProcurement

## Table Description

This table stores emissions associated with material procurement from suppliers. These emissions are calculated based on buyer's material procurement data.

## Table Columns

1. **id**

   - Type: `uuid`
   - Primary Key: `true`
   - Unique: `true`
   - Default: `gen_random_uuid()`
   - Description: Unique identifier for each record

2. **organization_id**

   - Type: `uuid`
   - Nullable: `false`
   - Description: Reference to the buyer organization

3. **address_id**

   - Type: `uuid`
   - Nullable: `false`
   - Description: Reference to the buyer location receiving the material

4. **region_id**

   - Type: `uuid`
   - Nullable: `true`
   - Description: Reference to the region

5. **year**

   - Type: `numeric`
   - Nullable: `false`
   - Description: Year of the procurement data

6. **month**

   - Type: `numeric`
   - Nullable: `false`
   - Description: Month of the procurement data (1-12)

7. **timestamp**

   - Type: `timestamp with time zone`
   - Nullable: `true`
   - Description: Timestamp for the data point

8. **supplier_code**

   - Type: `text`
   - Nullable: `false`
   - Description: Supplier code

9. **buyer_material_code**

   - Type: `text`
   - Nullable: `false`
   - Description: Material code as defined by the buyer

10. **buyer_material_procurement_quantity**

    - Type: `double precision`
    - Nullable: `true`
    - Description: Quantity of material procured

11. **buyer_material_procurement_uom**

    - Type: `text`
    - Nullable: `true`
    - Description: Unit of measure for procurement

12. **material_weight_per_unit**

    - Type: `numeric`
    - Nullable: `true`
    - Description: Weight per unit (for non-mass UoM conversion)

13. **material_weight_per_unit_uom**

    - Type: `text`
    - Nullable: `true`
    - Description: Unit for weight per unit (e.g., Kg/EA, Kg/Litre)

14. **kpi_emf_material_procurement**

    - Type: `double precision`
    - Nullable: `true`
    - Description: Emission factor value used for material emissions calculation (e.g., KgCO2e/Kg)

15. **kpi_em_pcf_per_unit**

    - Type: `numeric`
    - Nullable: `true`
    - Description: Material procurement emissions per unit (KgCO2e). Calculated as: Material Weight Per Unit × Emission Factor

16. **kpi_em_pcf_per_unit_uom**

    - Type: `text`
    - Nullable: `true`
    - Description: Emission unit of measure (tCO2e, KgCO2e, etc.)

17. **metadata**

    - Type: `jsonb`
    - Nullable: `true`
    - Description: Additional metadata

18. **is_deleted**

    - Type: `boolean`
    - Default: `false`

19. **created_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

20. **updated_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

21. **created_by**

    - Type: `uuid`
    - Nullable: `true`

22. **updated_by**

    - Type: `uuid`
    - Nullable: `true`

## SQL CREATE TABLE Query

```sql
-- Create KPIProductCarbonFootprintMaterialProcurement table
CREATE TABLE "KPIProductCarbonFootprintMaterialProcurement" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
"address_id" uuid NOT NULL,
"region_id" uuid,
"year" numeric NOT NULL,
"month" numeric NOT NULL,
"timestamp" timestamp with time zone,
"supplier_code" text NOT NULL,
"buyer_material_code" text NOT NULL,
"buyer_material_procurement_quantity" double precision,
"buyer_material_procurement_uom" text,
"material_weight_per_unit" numeric,
"material_weight_per_unit_uom" text,
"kpi_emf_material_procurement" double precision,
"kpi_em_pcf_per_unit" numeric,
"kpi_em_pcf_per_unit_uom" text,
"metadata" jsonb,
"is_deleted" boolean DEFAULT false,
"created_at" timestamp with time zone DEFAULT now(),
"updated_at" timestamp with time zone DEFAULT now(),
"created_by" uuid,
"updated_by" uuid
);

-- Add comment to table
COMMENT ON TABLE "KPIProductCarbonFootprintMaterialProcurement" IS
'Stores material procurement emissions for PCF calculation';

```

---

# Create New Table: KPIProductCarbonFootprintUpstream

# Table Name - KPIProductCarbonFootprintUpstream

## Table Description

This table stores upstream transportation emissions from supplier to buyer facility. These emissions are calculated based on buyer's upstream transportation data.

## Table Columns

1. **id**

   - Type: `uuid`
   - Primary Key: `true`
   - Unique: `true`
   - Default: `gen_random_uuid()`
   - Description: Unique identifier for each record

2. **organization_id**

   - Type: `uuid`
   - Nullable: `false`
   - Description: Reference to the buyer organization

3. **address_id**

   - Type: `uuid`
   - Nullable: `false`
   - Description: Reference to the buyer location (destination)

4. **region_id**

   - Type: `uuid`
   - Nullable: `true`
   - Description: Reference to the region

5. **year**

   - Type: `numeric`
   - Nullable: `false`
   - Description: Year of the transportation data

6. **month**

   - Type: `numeric`
   - Nullable: `false`
   - Description: Month of the transportation data (1-12)

7. **timestamp**

   - Type: `timestamp with time zone`
   - Nullable: `true`
   - Description: Timestamp for the data point

8. **supplier_code**

   - Type: `text`
   - Nullable: `false`
   - Description: Supplier code (origin facility)

9. **buyer_material_code**

   - Type: `text`
   - Nullable: `true`
   - Description: Material code as defined by the buyer (if available)

10. **buyer_material_procurement_quantity**

    - Type: `double precision`
    - Nullable: `true`
    - Description: Quantity of material transported

11. **buyer_material_procurement_uom**

    - Type: `text`
    - Nullable: `true`
    - Description: Unit of measure for transportation quantity

12. **kpi_em_upstream**

    - Type: `numeric`
    - Nullable: `true`
    - Description: Total upstream transportation emissions

13. **kpi_em_pcf_per_unit**

    - Type: `numeric`
    - Nullable: `true`
    - Description: Upstream emissions per unit. Calculated as: kpi_em_upstream (KgCO2e) / buyer_material_procurement_quantity (converted UOM)

14. **kpi_em_pcf_per_unit_uom**

    - Type: `text`
    - Nullable: `true`
    - Description: Emission unit of measure for kpi_em_pcf_per_unit (e.g., KgCO2e/Kilogram, KgCO2e/Litre, KgCO2e/EA, KgCO2e/Nos)

15. **metadata**

    - Type: `jsonb`
    - Nullable: `true`
    - Description: Additional metadata

16. **is_deleted**

    - Type: `boolean`
    - Default: `false`

17. **created_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

18. **updated_at**

    - Type: `timestamp with time zone`
    - Default: `now()`

19. **created_by**

    - Type: `uuid`
    - Nullable: `true`

20. **updated_by**

    - Type: `uuid`
    - Nullable: `true`

## SQL CREATE TABLE Query

```sql
-- Create KPIProductCarbonFootprintUpstream table
CREATE TABLE "KPIProductCarbonFootprintUpstream" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_id" uuid NOT NULL,
  "address_id" uuid NOT NULL,
  "region_id" uuid,
  "year" numeric NOT NULL,
  "month" numeric NOT NULL,
  "timestamp" timestamp with time zone,
  "supplier_code" text NOT NULL,
  "buyer_material_code" text,
  "buyer_material_procurement_quantity" double precision,
  "buyer_material_procurement_uom" text,
  "kpi_em_upstream" numeric,
  "kpi_em_pcf_per_unit" numeric,
  "kpi_em_pcf_per_unit_uom" text,
  "metadata" jsonb,
  "is_deleted" boolean DEFAULT false,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid
);

-- Add comment to table
COMMENT ON TABLE "KPIProductCarbonFootprintUpstream" IS
  'Stores upstream transportation emissions for PCF calculation (Supplier to Buyer)';
```

---

# PCF Calculation Logic Summary

## System Boundary

**Supplier In-Gate → Buyer In-Gate**

Includes:

- Supplier operational emissions (allocated)
- Upstream transportation emissions

Excludes:

- Buyer facility emissions
- Buyer downstream emissions

## PCF Formula

```
PCF = Supplier Facility Emissions Per Unit
    + Material Procurement Emissions Per Unit
    + Upstream Transportation Emissions Per Unit
```

## Supplier Facility Emissions Per Unit Formula

```
kpi_em_pcf_per_unit = allocation_percentage × (kpi_allocated_em_Grid_Power + kpi_allocated_em_Captive_Power + kpi_allocated_em_Fuel_Purchased + kpi_allocated_em_Waste_Generation) / buyer_material_procurement_quantity
```

**Where:**

- `allocation_percentage` = Quantity of SKU purchased by buyer vs total facility production (%)
- `kpi_allocated_em_*` = Individual facility emission components (KgCO2e)
- `buyer_material_procurement_quantity` = Quantity of material procured by buyer

## Material Emissions Per Unit Formula

```
Material Emissions Per Unit (KgCO2e) = Material Weight Per Unit × Emission Factor (KgCO2e/Kg)
```

## Upstream Emissions Per Unit Formula

```
kpi_em_pcf_per_unit = kpi_em_upstream / buyer_material_procurement_quantity
kpi_em_pcf_per_unit_uom = KgCO2e / {converted_quantity_uom}
```

**Where:**

- `kpi_em_upstream` = Total Upstream Emissions (KgCO2e, converted from tCO2e × 1000)
- `buyer_material_procurement_quantity` = Material Quantity (converted to standard UOM: Kilogram for mass, Litre for volume, as-is for count)
- `kpi_em_pcf_per_unit_uom` = e.g., KgCO2e/Kilogram, KgCO2e/Litre, KgCO2e/EA, KgCO2e/Nos

**Important Note on Multiple Transportation Records:**

If there are multiple rows with the same:

- `year`
- `month`
- `buyer_material_code`
- `supplier_code`
- `address_id`

Then the `buyer_material_procurement_quantity` values should be **converted to standard UOM first** (mass→Kilogram, volume→Litre, count→as-is), then **summed** before calculating the per-unit emissions.

**Example:**

| Year | Month | Material Code | Quantity | UoM | Supplier | Mode | Distance (km) | Emissions (tCO2e) |
| ---- | ----- | ------------- | -------- | --- | -------- | ---- | ------------- | ----------------- |
| 2024 | 1     | M001          | 300      | EA  | S001     | Road | 200           | 30                |
| 2024 | 1     | M001          | 100      | EA  | S001     | Road | 100           | 20                |

**Calculation:**

- Total Quantity = 300 + 100 = 400 EA (count group, no conversion needed)
- Total Emissions = 30 + 20 = 50 tCO2e = 50,000 KgCO2e
- kpi_em_pcf_per_unit = 50,000 / 400 = 125 KgCO2e/EA
- kpi_em_pcf_per_unit_uom = KgCO2e/EA

## Emission Unit Conversion

| From        | To          | Conversion |
| ----------- | ----------- | ---------- |
| tCO2e/unit  | KgCO2e/unit | × 1000     |
| KgCO2e/unit | gCO2e/unit  | × 1000     |

## UoM Validation Rules

1. **UoM Consistency**: Material procurement and upstream transportation must use the same UoM
2. **Non-Mass UoM**: For volume-based (Litre, Kilolitre) or number-based (EA, Nos.) units, weight per unit must exist in material master
3. **Upstream Transportation**: If upstream transportation data is provided without buyer_material_code, PCF calculation will not be performed for upstream transportation

---

# End of Migration Document
