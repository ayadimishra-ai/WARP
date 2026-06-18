# Use of Sold Products - Emission KPI Columns Migration

## Overview

This migration adds emission calculation result columns (kpi_em\_ and kpi_emf\_) to the three Use of Sold Products child tables. These columns store the calculated emission values and their corresponding emission factors, following the same pattern as other GHG tables (e.g., `GHGWaste`, `GHGRefrigerantAndACSystems`, `GHGCapital_Goods`).

## Prerequisite

The base tables must already exist as per `use-of-sold-products.md`.

## Emission Factor Setup (CO2EmissionFactorMaster)

> **⚠️ Required before emission calculation will work.**

The Fuel sheet uses a **new** EF path that does not yet exist in the `CO2EmissionFactorMaster` table.
Records must be inserted for each fuel type:

| Field          | Value                                          |
| -------------- | ---------------------------------------------- |
| `category`     | `Energy`                                       |
| `activity`     | `Sold Products`                                |
| `sub_activity` | `Fuel`                                         |
| `type`         | `<fuel_type>` (e.g., Diesel, LPG, Petrol, CNG) |
| `unit`         | Contains `/gj` (kgCO₂e/GJ)                    |

Electricity and Refrigerant sheets reuse existing EF records (Grid / GWP 100) — no new inserts needed.

This is a **DB/data team task** — to be coordinated with Harsh.

## PostgreSQL DDL

### Table: `GHGUseOfSoldProducts_Fuel`

```sql
-- Emission from fuel consumed during product use
-- EF Path: Energy → Sold Products → Fuel → Type of Fuel
-- Formula: Quantity (Tonne) × Quality (GJ/T) × EF (kgCO₂e/GJ)
ALTER TABLE "GHGUseOfSoldProducts_Fuel"
  ADD COLUMN IF NOT EXISTS "kpi_em_Scope3_Category11"  DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "kpi_emf_Scope3_Category11" DOUBLE PRECISION DEFAULT NULL;
```

### Table: `GHGUseOfSoldProducts_Electricity`

```sql
-- Emission from electricity consumed during product use
-- EF Path: Region → Energy → Grid
-- Formula: Units (kWh) × EF (kgCO₂e/kWh)
ALTER TABLE "GHGUseOfSoldProducts_Electricity"
  ADD COLUMN IF NOT EXISTS "kpi_em_Scope3_Category11"  DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "kpi_emf_Scope3_Category11" DOUBLE PRECISION DEFAULT NULL;
```

### Table: `GHGUseOfSoldProducts_Refrigerant`

```sql
-- Emission from refrigerant leakage during product use
-- EF Path: Fugitive → GWP 100 → Type of Refrigerant
-- Formula: Quantity (Tonne) × GWP (CO₂e)  [GWP NOT divided by 1000]
ALTER TABLE "GHGUseOfSoldProducts_Refrigerant"
  ADD COLUMN IF NOT EXISTS "kpi_em_Scope3_Category11"  DOUBLE PRECISION DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS "kpi_emf_Scope3_Category11" DOUBLE PRECISION DEFAULT NULL;
```

## Hasura Tracking

After applying the DDL, reload metadata in Hasura so the new columns are available in GraphQL.

The columns should be tracked with Select and Update permissions for `organization_admin` role, matching the existing filter pattern on the table.

## Column Naming Convention

Following the existing codebase pattern:

| Prefix     | Meaning              | Example from existing code                        |
| ---------- | -------------------- | ------------------------------------------------- |
| `kpi_em_`  | Calculated emission  | `kpi_em_EmissionBy_CapitalGoods` (Capital Goods)  |
| `kpi_emf_` | Emission factor used | `kpi_emf_EmissionBy_CapitalGoods` (Capital Goods) |

## Rollout Order

1. Apply the `ALTER TABLE` statements above.
2. Reload Hasura metadata.
3. Verify columns are available in GraphQL schema.
4. Run `yarn codegen` to regenerate types.

---

**Last Updated:** April 7, 2026
