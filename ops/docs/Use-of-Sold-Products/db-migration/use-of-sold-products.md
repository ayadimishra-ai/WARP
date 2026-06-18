# Use of Sold Products - DB Migration Plan

## Overview

This document is the source of truth for database and Hasura changes required for Category 11 - Use of Sold Products.

Application-layer work such as GraphQL document creation, code generation, validation, service implementation, API routes, emission calculation, and audit logging remains in `specs/feat-category-11-use-of-sold-products/implementation.md`.

## Scope

This migration covers:

- PostgreSQL schema creation for the three independent tables
- Required indexes
- Hasura table tracking
- Hasura relationships
- Hasura role permissions
- Rollout order before application implementation begins
- Post-migration verification

## Confirmed Table Names

The following table names are confirmed as the actual database table names and should be used consistently in DDL, Hasura tracking, GraphQL mutation roots, and implementation code:

- `GHGUseOfSoldProducts_Fuel`
- `GHGUseOfSoldProducts_Electricity`
- `GHGUseOfSoldProducts_Refrigerant`

Important: These are table names. There is no parent table. The `GHGUseOfSoldProducts` parent table was removed; each table now directly holds `task_request_id`, `activity_task_request_id`, and `organization_address_id`.

## Schema Design

Three independent tables are required, one per sheet type. There is no parent table.

- `GHGUseOfSoldProducts_Fuel`
- `GHGUseOfSoldProducts_Electricity`
- `GHGUseOfSoldProducts_Refrigerant`

Each table directly holds `task_request_id`, `activity_task_request_id`, and `organization_address_id`. Rows from different months in the same upload batch carry different `task_request_id` values derived from the per-row month/year match.

### Design Decisions

#### 1. Flat table architecture

Use three independent tables, each holding task and facility context directly.

Rationale:

- Eliminates an extra round-trip insert for a parent record
- Simplifies the service layer: each row is inserted directly with its task context
- Supports independent querying and deletion per sheet type without a parent join
- Rows from different months in the same batch can carry different `task_request_id` values

#### 2. Working columns are stored in `metadata`

Working details 1-5 are stored in the `metadata` JSONB column on each table.

Rationale:

- Preserves user-entered working data for audit and redownload use cases
- Avoids creating five dedicated columns on every table
- Keeps the schema flexible for future worksheet variations

#### 3. `Lifetime_of_Product` stays as `TEXT`

`Lifetime_of_Product` should be nullable `TEXT` in all three tables.

Rationale:

- The field is optional
- Upload-time validation enforces positive numeric values when supplied
- Blank values can be stored as `NULL`

## PostgreSQL DDL

### Table: `GHGUseOfSoldProducts_Fuel`

```sql
CREATE TABLE "GHGUseOfSoldProducts_Fuel" (
id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
task_request_id             UUID NOT NULL REFERENCES "TaskRequest"(id),
activity_task_request_id    UUID NOT NULL REFERENCES "ActivityTaskRequest"(id),
organization_address_id     UUID NOT NULL REFERENCES "OrganizationAddress"(id),
"Date"                      TIMESTAMPTZ,
"Type_of_Fuel_Consumed"     TEXT NOT NULL,
"Product_Code"              TEXT NOT NULL,
"Lifetime_of_Product"       TEXT,
"Rationale"                 TEXT,
"Quantity_of_Fuel_Consumed" DECIMAL(19, 4),
"UoM_of_Fuel_Consumed"      TEXT,
"Additional_comments"       TEXT,
"Remarks"                   TEXT,
metadata                    JSONB,
is_deleted                  BOOLEAN NOT NULL DEFAULT false,
created_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at                  TIMESTAMPTZ NOT NULL DEFAULT now(),
created_by                  UUID,
updated_by                  UUID
);

CREATE INDEX idx_ghg_uosp_fuel_task_request
ON "GHGUseOfSoldProducts_Fuel" (task_request_id);
```

### Table: `GHGUseOfSoldProducts_Electricity`

```sql
CREATE TABLE "GHGUseOfSoldProducts_Electricity" (
id                                        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
task_request_id                           UUID NOT NULL REFERENCES "TaskRequest"(id),
activity_task_request_id                  UUID NOT NULL REFERENCES "ActivityTaskRequest"(id),
organization_address_id                   UUID NOT NULL REFERENCES "OrganizationAddress"(id),
"Date"                                    TIMESTAMPTZ,
"Product_Code"                            TEXT NOT NULL,
"Lifetime_of_Product"                     TEXT,
"Rationale"                               TEXT,
"Region"                                  TEXT NOT NULL,
"Units_of_Electricity_consumed_in_kWh"    DECIMAL(19, 4),
"Additional_comments"                     TEXT,
"Remarks"                                 TEXT,
metadata                                  JSONB,
is_deleted                                BOOLEAN NOT NULL DEFAULT false,
created_at                                TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at                                TIMESTAMPTZ NOT NULL DEFAULT now(),
created_by                                UUID,
updated_by                                UUID
);

CREATE INDEX idx_ghg_uosp_electricity_task_request
ON "GHGUseOfSoldProducts_Electricity" (task_request_id);
```

### Table: `GHGUseOfSoldProducts_Refrigerant`

```sql
CREATE TABLE "GHGUseOfSoldProducts_Refrigerant" (
id                                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
task_request_id                               UUID NOT NULL REFERENCES "TaskRequest"(id),
activity_task_request_id                      UUID NOT NULL REFERENCES "ActivityTaskRequest"(id),
organization_address_id                       UUID NOT NULL REFERENCES "OrganizationAddress"(id),
"Date"                                        TIMESTAMPTZ,
"Product_Code"                                TEXT NOT NULL,
"Lifetime_of_Product"                         TEXT,
"Rationale"                                   TEXT,
"Refrigerant_type_used_in_sold_product"       TEXT NOT NULL,
"Quantity_of_Refrigerant_consumed"            DECIMAL(19, 4),
"UoM_of_Refrigerant_consumed"                 TEXT,
"Additional_comments"                         TEXT,
"Remarks"                                     TEXT,
metadata                                      JSONB,
is_deleted                                    BOOLEAN NOT NULL DEFAULT false,
created_at                                    TIMESTAMPTZ NOT NULL DEFAULT now(),
updated_at                                    TIMESTAMPTZ NOT NULL DEFAULT now(),
created_by                                    UUID,
updated_by                                    UUID
);

CREATE INDEX idx_ghg_uosp_refrigerant_task_request
ON "GHGUseOfSoldProducts_Refrigerant" (task_request_id);
```

## Hasura Tracking

Track all three tables in Hasura after the DDL is applied.

- `GHGUseOfSoldProducts_Fuel`
- `GHGUseOfSoldProducts_Electricity`
- `GHGUseOfSoldProducts_Refrigerant`

## Hasura Relationships

For each of the three tables, configure the following object relationships:

- `TaskRequest` via `task_request_id`
- `ActivityTaskRequest` via `activity_task_request_id`
- `OrganizationAddress` via `organization_address_id`
- `AppUser` via `created_by`
- `appUserByUpdatedBy` via `updated_by`

## Hasura Permissions

Apply Select, Insert, Update, and Delete permissions for `organization_admin` with this filter pattern:

```json
{ "TaskRequest": { "organization_id": { "_eq": "x-hasura-org-id" } } }
```

Apply equivalent organization-scoped access on all three tables through the task request path used in your Hasura metadata model.

## Rollout Order

1. Apply PostgreSQL DDL for all three tables.
2. Create the supporting indexes.
3. Track the three tables in Hasura.
4. Configure object relationships on each table.
5. Configure `organization_admin` permissions.
6. Create required activity and master-data mappings for Category 11.
7. Verify the schema and Hasura metadata.
8. Only after the above is complete, continue with GraphQL documents and run `yarn codegen` from the application implementation flow.

## Applied Data Setup (Completed)

The following setup records were added in this environment for Category 11 - Use of Sold Products.

### 1. Activity table

- Added activity name: `Use of Sold Products`
- Added activity code: `use_of_sold_products`

### 2. ActivityMaster table

- Added `master_key`: `use_of_sold_products_fuel_type_of_fuel_consumed`
- Added `master_key`: `use_of_sold_products_fuel_type_of_fuel_consumed_uom`
- Added `master_key`: `use_of_sold_products_rationale`
- Added `master_key`: `use_of_sold_products_refrigerant_type`
- Added `master_key`: `use_of_sold_products_refrigerant_consumed_uom`

#### Refrigerant type master data (`use_of_sold_products_refrigerant_type`)

Populated `master_data` with the following refrigerant types:

| label   | value   |
|---------|---------|
| R-410A  | R-410A  |
| R-32    | R-32    |
| R-22    | R-22    |
| R-407C  | R-407C  |
| R-134a  | R-134a  |
| R-454B  | R-454B  |
| R-404A  | R-404A  |
| R-23    | R-23    |
| R-508B  | R-508B  |

#### Refrigerant UoM master data (`use_of_sold_products_refrigerant_consumed_uom`)

Populated `master_data` with the following UoMs. There is **no `group` field** — all nine refrigerant types accept any one of these three UoMs (flat validation, not group-based).

| label    | value    |
|----------|----------|
| Kilogram | kilogram |
| Pound    | pound    |
| Tonne    | tonne    |

**Validation behaviour:** Because no UoM row has a `group` array, `isGroupPopulated` returns `false`, `useGroup` is always `false`, and `validateActivityMasterDataByKey` (flat list check) is used for all refrigerant types. This is intentionally different from the Fuel sheet where UoMs are group-linked to specific fuel types.

### 3. OrganizationActivityMapping table

- Added a new mapping record for the relevant `activity_id` and `organization_id` for `use_of_sold_products`.

### 4. UserOrganizationAddressMapping table

- Added `use_of_sold_products` in the `activities` column for the relevant `user_id`.

### Optional SQL reference

Use this pattern when reproducing setup in another environment:

```sql
-- Activity
INSERT INTO "Activity" (name, code)
VALUES ('Use of Sold Products', 'use_of_sold_products');

-- ActivityMaster keys
INSERT INTO "ActivityMaster" (master_key)
VALUES
('use_of_sold_products_fuel_type_of_fuel_consumed'),
('use_of_sold_products_fuel_type_of_fuel_consumed_uom'),
('use_of_sold_products_rationale'),
('use_of_sold_products_refrigerant_type'),
('use_of_sold_products_refrigerant_consumed_uom');

-- Refrigerant type master data
UPDATE "ActivityMaster"
SET master_data = '[
  {"label": "R-410A", "value": "R-410A"},
  {"label": "R-32",   "value": "R-32"},
  {"label": "R-22",   "value": "R-22"},
  {"label": "R-407C", "value": "R-407C"},
  {"label": "R-134a", "value": "R-134a"},
  {"label": "R-454B", "value": "R-454B"},
  {"label": "R-404A", "value": "R-404A"},
  {"label": "R-23",   "value": "R-23"},
  {"label": "R-508B", "value": "R-508B"}
]'::jsonb
WHERE master_key = 'use_of_sold_products_refrigerant_type';

-- Refrigerant UoM master data
-- No group[] field: all refrigerant types accept any of the three UoMs (flat validation).
UPDATE "ActivityMaster"
SET master_data = '[
  {"label": "Kilogram", "value": "kilogram"},
  {"label": "Pound",    "value": "pound"},
  {"label": "Tonne",    "value": "tonne"}
]'::jsonb
WHERE master_key = 'use_of_sold_products_refrigerant_consumed_uom';

-- OrganizationActivityMapping
-- (use actual activity_id and organization_id values from your environment)
INSERT INTO "OrganizationActivityMapping" (activity_id, organization_id)
VALUES (:activity_id, :organization_id);

-- UserOrganizationAddressMapping
-- (append the activity code according to your column type/model)
-- Example intent: include 'use_of_sold_products' in activities for the target user.
```

## Verification

### Database verification

- Confirm all three tables exist.
- Confirm all three indexes exist (`idx_ghg_uosp_fuel_task_request`, `idx_ghg_uosp_electricity_task_request`, `idx_ghg_uosp_refrigerant_task_request`).
- Confirm each table has `task_request_id NOT NULL`, `activity_task_request_id NOT NULL`, `organization_address_id NOT NULL`.
- Confirm `metadata` exists as `JSONB` on all three tables.
- Confirm `Lifetime_of_Product` is nullable `TEXT` on all three tables.
- Confirm `Activity` has `name = 'Use of Sold Products'` and `code = 'use_of_sold_products'`.
- Confirm `ActivityMaster` contains all five master keys:
  - `use_of_sold_products_fuel_type_of_fuel_consumed`
  - `use_of_sold_products_fuel_type_of_fuel_consumed_uom`
  - `use_of_sold_products_rationale`
  - `use_of_sold_products_refrigerant_type`
  - `use_of_sold_products_refrigerant_consumed_uom`
- Confirm `use_of_sold_products_refrigerant_type` has `master_data` populated with 9 refrigerant types: R-410A, R-32, R-22, R-407C, R-134a, R-454B, R-404A, R-23, R-508B.
- Confirm `use_of_sold_products_refrigerant_consumed_uom` has `master_data` with 3 UoM entries (Kilogram, Pound, Tonne). No `group` field — all refrigerant types accept any of the three UoMs via flat validation.
- Confirm `OrganizationActivityMapping` includes mapping for the Category 11 `activity_id` and target `organization_id`.
- Confirm `UserOrganizationAddressMapping.activities` includes `use_of_sold_products` for the target user.

### Hasura verification

- Confirm all three tables are tracked.
- Confirm each table's `TaskRequest`, `ActivityTaskRequest`, and `OrganizationAddress` object relationships resolve correctly.
- Confirm `organization_admin` permissions work with organization-scoped filtering.

### Functional verification

- Confirm querying `GHGUseOfSoldProducts_Fuel` by `task_request_id` returns the expected rows.
- Confirm querying `GHGUseOfSoldProducts_Electricity` and `GHGUseOfSoldProducts_Refrigerant` by `task_request_id` return the expected rows.
- Confirm deleting rows from each table by `task_request_id` works independently.
- Confirm working details 1-5 can be stored in `metadata` and read back.
- Confirm empty working details result in `metadata = null` rather than an empty object.

## Dependency on Implementation Spec

After this migration is complete, continue the application delivery steps in `specs/feat-category-11-use-of-sold-products/implementation.md` for:

- GraphQL mutation and query files
- `yarn codegen`
- validation schemas
- service layer
- API routes
- emission calculation integration
- audit logging
