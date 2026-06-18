# Category 3 – Upstream Fuel and Energy Related Activities: DB Migration Plan

## Overview

This document is the source of truth for all database and Hasura changes required for **Category 3 – Upstream Fuel and Energy Related Activities** (Scope 3 emission calculation).

Application-layer work such as GraphQL document changes, code generation, emission calculation service, and dashboard query updates remains in `specs/feat-category-3-upstream-fuel-energy/implementation.md`.

---

## Background

Category 3 captures **upstream emissions** from the production, extraction, processing, and transport of fuel and electricity **before** they reach the reporting facility (the "Well-to-Tank" phase). No new activity template or data-entry form is required — Category 3 reuses existing activity data:

| KPI                                  | Source Table                                 | Source Field                                  |
| ------------------------------------ | -------------------------------------------- | --------------------------------------------- |
| KPI 1 – Grid Power (T&D losses)      | `GHGEnergyConsumption_GridPower`             | `PowerPurchased_through_PPA_Kwh_NonRenewable` |
| KPI 2 – Fuel Purchase (Well-to-Tank) | `GHGEnergyConsumption_FuelPurchased_General` | `Quantity_of_fuel_Consumed` per fuel type     |

---

## Scope

This migration covers:

1. New KPI columns on `GHGEnergyConsumption_GridPower` (row-level Category 3 calculation result)
2. New KPI columns on `GHGEnergyConsumption_FuelPurchased_General` (row-level Category 3 calculation result)
3. New `KpiEmissionByCategory3` dashboard KPI table
4. Indexes on the new KPI table
5. Hasura table tracking and relationships for `KpiEmissionByCategory3`
6. Hasura role permissions for `KpiEmissionByCategory3`
7. New emission factor line item in `CO2EmissionFactorMaster` (for KPI 1 – Grid Power)
8. New `KPIEmissionByScope3` rollup table (KPI 3 – Total Category 3) ✅ **Table created**
9. Indexes and Hasura setup for `KPIEmissionByScope3`
10. Rollout order before application implementation begins

---

## Section 1 – Column Additions to Existing Tables

### 1.1 `GHGEnergyConsumption_GridPower` — New Columns

Two new columns store the **row-level** Category 3 emission result for each grid power record.

```sql
ALTER TABLE "GHGEnergyConsumption_GridPower"
  ADD COLUMN "kpi_em_Scope3_Category3"  double precision,
  ADD COLUMN "kpi_em_Scope3_Category3" double precision;
```

| Column                    | Type               | Nullable | Description                                                  |
| ------------------------- | ------------------ | -------- | ------------------------------------------------------------ |
| `kpi_em_Scope3_Category3` | `double precision` | Yes      | Calculated emission (tCO₂e) for Category 3 KPI 1 on this row |
| `kpi_em_Scope3_Category3` | `double precision` | Yes      | Emission factor value used in the calculation                |

### 1.2 `GHGEnergyConsumption_FuelPurchased_General` — New Columns

Two new columns store the **row-level** Category 3 well-to-tank emission result for each fuel line.

```sql
ALTER TABLE "GHGEnergyConsumption_FuelPurchased_General"
  ADD COLUMN "kpi_em_Scope3_Category3"  double precision,
  ADD COLUMN "kpi_emf_Scope3_Category3" double precision;
```

| Column                    | Type               | Nullable | Description                                                   |
| ------------------------- | ------------------ | -------- | ------------------------------------------------------------- |
| `kpi_em_Scope3_Category3` | `double precision` | Yes      | Calculated emission (tCO₂e) for Category 3 KPI 2 on this row |
| `kpi_emf_Scope3_Category3`| `double precision` | Yes      | Emission factor value used in the calculation                 |

> **Note:** Both `GHGEnergyConsumption_GridPower` and `GHGEnergyConsumption_FuelPurchased_General` use the same column name `kpi_em_Scope3_Category3` for the row-level emission result. They are distinguished at the dashboard aggregation layer (`SQL_QUERY_GET_Category3_details`) by aliasing them to `kpi_em_scope3_category3_gridpower` and `kpi_em_scope3_category3_fuelpurchase` respectively before writing to the KPI tables.

---

## Section 2 – New `KpiEmissionByCategory3` Table

This table aggregates Category 3 emissions at the **month / year / facility** level for use in the dashboard. It follows the same structural pattern as `KpiEmissionByPowerConsumption` and `KpiEmissionByFuelConsumption`.

### DDL

```sql
CREATE TABLE "KpiEmissionByCategory3" (
  id                                    UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id                       UUID,
  address_id                            UUID,
  region_id                             UUID,
  month                                 INTEGER,
  year                                  INTEGER,
  em_uom                                TEXT          DEFAULT 'tco2e',
  kpi_em_Scope3_Category3     double precision,
  kpi_em_Scope3_Category3_FuelPurchase  double precision,
  kpi_em_Scope3_Category3_Total         double precision,
  metadata                              JSONB,
  created_at                            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at                            TIMESTAMPTZ   NOT NULL DEFAULT now(),
  created_by                            UUID,
  updated_by                            UUID
);
```

### Column Descriptions

| Column                                 | Type               | Description                                                     |
| -------------------------------------- | ------------------ | --------------------------------------------------------------- |
| `kpi_em_Scope3_Category3`              | `double precision` | Aggregated emission from KPI 1 (T&D losses on grid electricity) |
| `kpi_em_Scope3_Category3_FuelPurchase` | `double precision` | Aggregated emission from KPI 2 (well-to-tank of fuel consumed)  |
| `kpi_em_Scope3_Category3_Total`        | `double precision` | Total Category 3 emission = GridPower + FuelPurchase            |
| `em_uom`                               | `TEXT`             | Always `'tco2e'`                                                |
| `metadata`                             | `JSONB`            | Reserved for future breakdown or audit data                     |

### Indexes

```sql
CREATE INDEX idx_kpi_category3_org_address_month_year
  ON "KpiEmissionByCategory3" (organization_id, address_id, month, year);

CREATE INDEX idx_kpi_category3_address_month_year
  ON "KpiEmissionByCategory3" (address_id, month, year);
```

---

## Section 2b – New `KPIEmissionByScope3` Table ✅ Done

This table stores the **KPI 3 – Total Category 3** rollup at the **month / year / facility** level. It holds only the two emission columns (Grid Power and Fuel Purchase) plus their computed total. The table has been **created in the database**.

### DDL

```sql
CREATE TABLE "KPIEmissionByScope3" (
  id                                       UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id                          UUID,
  address_id                               UUID,
  region_id                                UUID,
  month                                    INTEGER,
  year                                     INTEGER,
  em_uom                                   TEXT          DEFAULT 'tco2e',
  kpi_em_Scope3_Category3_GridPower        double precision,
  kpi_em_Scope3_Category3_FuelPurchase     double precision,
  kpi_em_Scope3_Category3_Total            double precision,
  metadata                                 JSONB,
  created_at                               TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at                               TIMESTAMPTZ   NOT NULL DEFAULT now(),
  created_by                               UUID,
  updated_by                               UUID
);
```

### Column Descriptions

| Column                                  | Type               | Description                                                              |
| --------------------------------------- | ------------------ | ------------------------------------------------------------------------ |
| `kpi_em_Scope3_Category3_GridPower`     | `double precision` | Aggregated emission from KPI 1 (T&D losses on grid power)                |
| `kpi_em_Scope3_Category3_FuelPurchase`  | `double precision` | Aggregated emission from KPI 2 (well-to-tank of purchased fuel)          |
| `kpi_em_Scope3_Category3_Total`         | `double precision` | KPI 3 total = `GridPower + FuelPurchase`                                 |
| `em_uom`                                | `TEXT`             | Always `'tco2e'`                                                         |
| `metadata`                              | `JSONB`            | Reserved for future breakdown or audit data                              |

### Indexes

```sql
CREATE UNIQUE INDEX uq_kpi_emission_by_scope3
  ON "KPIEmissionByScope3" (organization_id, address_id, month, year);

CREATE INDEX idx_kpi_scope3_address_month_year
  ON "KPIEmissionByScope3" (address_id, month, year);
```

### Hasura Setup for `KPIEmissionByScope3`

1. **Track** `KPIEmissionByScope3` in Hasura after DDL is applied.
2. **Object relationships:**

| Relationship Name     | FK Column         | Target Table          |
| --------------------- | ----------------- | --------------------- |
| `Organization`        | `organization_id` | `Organization`        |
| `OrganizationAddress` | `address_id`      | `OrganizationAddress` |
| `Region`              | `region_id`       | `Region`              |
| `appUserByCreatedBy`  | `created_by`      | `AppUser`             |
| `appUserByUpdatedBy`  | `updated_by`      | `AppUser`             |

3. **Permissions** — apply Select, Insert, Update, Delete for `organization_admin` with the same filter used on other KPI tables:

```json
{ "organization_id": { "_eq": "x-hasura-org-id" } }
```

---

## Section 3 – Emission Factor Setup

### 3.1 New Line Item — KPI 1 Grid Power (T&D Losses)

A **new emission factor line item** must be added to the `CO2EmissionFactorMaster` table (or its equivalent data-entry UI) to support the Category 3 Grid Power calculation.

**Identifier filter values** (matching the `filterData` logic in `emission-factor.service.ts`):

| Field          | Value        |
| -------------- | ------------ |
| `category`     | `Energy`     |
| `activity`     | `Grid`       |
| `sub_activity` | `Scope 3`    |
| `type`         | `Category 3` |

**Notes:**

- The `factor` value (in `kgCO₂e/kWh`) must be provided by the backend/data team (Harsh). It already embeds the T&D loss percentage (e.g., 15–20% losses), so the application formula remains a straightforward multiplication.
- This emission factor should be tagged with a geography (region or country) following the same regional hierarchy used for other grid EFs.
- It should carry a `year` and `month` for the version-date lookup (consistent with the existing `yearMonth` filter logic).
- A `metadata[0].Default = "yes"` flag should be set if this is the default factor when multiple records match.

### 3.2 KPI 2 Fuel Purchase — Existing Emission Factors Reused

No new emission factor records are needed for KPI 2. The existing fuel-type emission factors already in `CO2EmissionFactorMaster` (used by `energy_fuel_purchased`) are reused. The filter path used in the calculation service will be:

| Field      | Value                                     |
| ---------- | ----------------------------------------- |
| `category` | `Energy`                                  |
| `activity` | `General Purpose`                         |
| `type`     | `<fuel_type>` (e.g., Diesel, LPG, Petrol) |

---

## Section 4 – Hasura Changes

### 4.1 Track New Table

Track `KpiEmissionByCategory3` in Hasura after the DDL is applied.

### 4.2 Relationships

Configure the following object relationships on `KpiEmissionByCategory3`:

| Relationship Name     | FK Column         | Target Table          |
| --------------------- | ----------------- | --------------------- |
| `Organization`        | `organization_id` | `Organization`        |
| `OrganizationAddress` | `address_id`      | `OrganizationAddress` |
| `Region`              | `region_id`       | `Region`              |
| `appUserByCreatedBy`  | `created_by`      | `AppUser`             |
| `appUserByUpdatedBy`  | `updated_by`      | `AppUser`             |

### 4.3 Permissions

Apply **Select, Insert, Update, Delete** permissions for `organization_admin` on `KpiEmissionByCategory3` with the same organization-scoped filter used on other KPI tables:

```json
{ "organization_id": { "_eq": "x-hasura-org-id" } }
```

Also update the existing Hasura tracked columns on `GHGEnergyConsumption_GridPower` and `GHGEnergyConsumption_FuelPurchased_General` to include the two new columns each so that mutations and queries can reference them.

---

## Section 5 – Rollout Order

Complete these steps **in order** before starting application-layer implementation:

1. Apply the `ALTER TABLE` DDL for `GHGEnergyConsumption_GridPower` (Section 1.1).
2. Apply the `ALTER TABLE` DDL for `GHGEnergyConsumption_FuelPurchased_General` (Section 1.2).
3. Apply the `CREATE TABLE` DDL for `KpiEmissionByCategory3` (Section 2).
4. Create both indexes on `KpiEmissionByCategory3` (Section 2).
5. Track `KpiEmissionByCategory3` in Hasura (Section 4.1).
6. Configure object relationships on `KpiEmissionByCategory3` (Section 4.2).
7. Configure `organization_admin` permissions on `KpiEmissionByCategory3` (Section 4.3).
8. Refresh tracked column lists on `GHGEnergyConsumption_GridPower` and `GHGEnergyConsumption_FuelPurchased_General` in Hasura to expose new columns (Section 4.3).
9. ✅ **Done** — Apply the `CREATE TABLE` DDL for `KPIEmissionByScope3` (Section 2b).
10. ✅ **Done** — Create indexes on `KPIEmissionByScope3` (Section 2b).
11. Track `KPIEmissionByScope3` in Hasura and configure relationships + permissions (Section 2b).
12. Add the new Category 3 Grid Power emission factor line item (Section 3.1) — coordinate with Harsh for the `factor` value.
13. Only after all the above is complete, proceed to GraphQL documents and run `yarn codegen`.

---

## Section 6 – Verification Checklist

### Database Verification

- [ ] `GHGEnergyConsumption_GridPower` has columns `kpi_em_Scope3_Category3` and `kpi_emf_Scope3_Category3` (both nullable `double precision`).
- [ ] `GHGEnergyConsumption_FuelPurchased_General` has columns `kpi_em_Scope3_Category3` and `kpi_emf_Scope3_Category3` (both nullable `double precision`).
- [ ] `KpiEmissionByCategory3` table exists with all columns defined in Section 2.
- [ ] Both indexes on `KpiEmissionByCategory3` exist.
- [x] `KPIEmissionByScope3` table exists with columns `kpi_em_Scope3_Category3_GridPower`, `kpi_em_Scope3_Category3_FuelPurchase`, `kpi_em_Scope3_Category3_Total` (all nullable `double precision`). ✅ **Done**
- [x] Unique index `uq_kpi_emission_by_scope3` on `KPIEmissionByScope3` exists. ✅ **Done**
- [ ] `CO2EmissionFactorMaster` has at least one record with `category=Energy`, `activity=Grid`, `sub_activity=Scope 3`, `type=Category 3`.

### Hasura Verification

- [ ] `KpiEmissionByCategory3` is tracked in Hasura.
- [ ] All five object relationships on `KpiEmissionByCategory3` resolve correctly.
- [ ] `organization_admin` permissions on `KpiEmissionByCategory3` enforce `organization_id` filter.
- [ ] New columns on `GHGEnergyConsumption_GridPower` are visible in Hasura schema.
- [ ] New columns on `GHGEnergyConsumption_FuelPurchased_General` are visible in Hasura schema.
- [ ] `KPIEmissionByScope3` is tracked in Hasura.
- [ ] All five object relationships on `KPIEmissionByScope3` resolve correctly.
- [ ] `organization_admin` permissions on `KPIEmissionByScope3` enforce `organization_id` filter.

### Functional Verification

- [ ] Querying `GHGEnergyConsumption_GridPower` returns the new columns (`NULL` for existing rows before calculation is run).
- [ ] Querying `GHGEnergyConsumption_FuelPurchased_General` returns the new columns (`NULL` for existing rows before calculation is run).
- [ ] Querying `KpiEmissionByCategory3` by `organization_id` + `address_id` + `month` + `year` returns expected aggregated values after a calculation run.
- [ ] Querying `KPIEmissionByScope3` by `organization_id` + `address_id` + `month` + `year` returns `kpi_em_Scope3_Category3_GridPower`, `kpi_em_Scope3_Category3_FuelPurchase`, and `kpi_em_Scope3_Category3_Total` after a calculation run.
- [ ] `KPIEmissionByScope3.kpi_em_Scope3_Category3_Total = kpi_em_Scope3_Category3_GridPower + kpi_em_Scope3_Category3_FuelPurchase` for all rows.
- [ ] The emission factor record for Category 3 Grid Power can be retrieved via the `getEmissionFactorsForDownload` GraphQL query using the filters in Section 3.1.

---

## Dependency on Implementation Spec

After this migration is complete, continue the application delivery steps in `specs/feat-category-3-upstream-fuel-energy/implementation.md` for:

- GraphQL mutation and query files (including `insert-kpi-emission-by-scope3.gql` and `get-kpi-emission-by-scope3.gql`)
- `yarn codegen`
- `EmissionFactorKeys` constant update
- Emission calculation service (`emission-category3.service.ts`)
- `calculateEmission()` wiring
- Dashboard SQL query — `SQL_QUERY_GET_Category3_details` (2-CTE, aggregates directly from `GHGEnergyConsumption_GridPower` and `GHGEnergyConsumption_FuelPurchased_General` with per-address grouping)
- `saveEmissionDashboard()` wiring:
  - `KpiEmissionByCategory3` populate + upsert (Phase 6)
  - `KPIEmissionByScope3` populate + upsert from the **same `category3Data`** result (Phase 8) — no separate rollup query required
- `insertkpiEmissionDashboardData` GraphQL mutation update (Phase 8.6)
- `KpiMain` total emission aggregation update
