# Category 3 – Upstream Fuel and Energy Related Activities: Implementation Plan

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Implementation Phases](#implementation-phases)
   - [Phase 1: GraphQL Layer](#phase-1-graphql-layer)
   - [Phase 2: Emission Factor Key Registration](#phase-2-emission-factor-key-registration)
   - [Phase 3: Emission Calculation Service](#phase-3-emission-calculation-service)
   - [Phase 4: Wire into calculateEmission()](#phase-4-wire-into-calculateemission)
   - [Phase 5: Dashboard SQL Queries](#phase-5-dashboard-sql-queries)
   - [Phase 6: Wire into saveEmissionDashboard()](#phase-6-wire-into-saveemissiondashboard)
   - [Phase 7: KpiMain Aggregation Update](#phase-7-kpimain-aggregation-update)
   - [Phase 8: KPIEmissionByScope3 – Total Category 3 Rollup](#phase-8-kpiemissionbyscope3--total-category-3-rollup)
4. [File Manifest](#file-manifest)
5. [Key Design Decisions](#key-design-decisions)
6. [Reference Patterns](#reference-patterns)
7. [Testing Checklist](#testing-checklist)

---

## Overview

Category 3 emission calculation is a **pure back-end calculation feature** — no new templates, upload routes, or frontend components are required. It reuses:

- **Data input:** `GHGEnergyConsumption_GridPower` and `GHGEnergyConsumption_FuelPurchased_General` (both already populated by existing activity uploads)
- **Emission factors:** New factor for Grid (Category 3 EF from Harsh) + existing factors for fuel types

**Key Characteristics:**

| Aspect                  | Detail                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Trigger                 | Automatically fired when `energy_grid_power` or `energy_fuel_purchased` upload completes     |
| KPI 1 Source            | `GHGEnergyConsumption_GridPower.PowerPurchased_through_PPA_Kwh_NonRenewable`                 |
| KPI 2 Source            | `GHGEnergyConsumption_FuelPurchased_General.Quantity_of_fuel_Consumed` (per fuel type)       |
| Row-level result tables | `GHGEnergyConsumption_GridPower`, `GHGEnergyConsumption_FuelPurchased_General` (new columns) |
| Dashboard KPI table     | `KpiEmissionByCategory3` (new table)                                                         |
| New emission factor     | `Energy > Grid > Scope 3 > Category 3` (value from Harsh)                                    |

**Database migration source of truth:** `docs/Category-3-Upstream-Fuel-Energy/db-migration/category-3-upstream-fuel-energy.md`

---

## Architecture & Data Flow

```
┌───────────────────────────────────────────────────────────────────────┐
│  Category 3 Calculation Flow                                           │
│                                                                        │
│  Triggered by energy_grid_power upload:                                │
│    1. Existing: calculatePowerConsumptionGrid() runs (Scope 1/2)       │
│    2. NEW: calculateScope3Category3GridPowerEmission() runs            │
│         → reads GHGEnergyConsumption_GridPower                         │
│         → applies EF: Energy > Grid > Scope 3 > Category 3            │
│         → formula: PPA_NonRenewable_kWh × EF                          │
│         → writes kpi_em_Scope3_Category3 per row                       │
│                                                                        │
│  Triggered by energy_fuel_purchased upload:                            │
│    1. Existing: calculateEmissionConsumption() runs (Scope 1)          │
│    2. NEW: calculateCategory3FuelPurchaseEmission() runs               │
│         → reads GHGEnergyConsumption_FuelPurchased_General             │
│         → applies existing EF per fuel type                            │
│         → formula: Qty × EF (per fuel type)                           │
│         → writes kpi_em_Scope3_Category3_FuelPurchase per row          │
│                                                                        │
│  Triggered by saveEmissionDashboard() (both activities):               │
│    1. SQL_QUERY_GET_Category3_details aggregates row-level results     │
│         → SUM per (task_request_id, organization_address_id)           │
│         → outputs: gridpower, fuelpurchase, total (all lowercase)      │
│    2. KpiEmissionByCategory3 upserted with month/year/facility totals  │
│    3. KPIEmissionByScope3 upserted from the same category3Data result  │
│         → kpi_em_Scope3_Category3_GridPower    = gridpower             │
│         → kpi_em_Scope3_Category3_FuelPurchase = fuelpurchase          │
│         → kpi_em_Scope3_Category3_Total        = gridpower+fuelpurchase│
│    4. KpiMain.kpi_em_Total_Emission_Scope3 includes Category 3         │
└───────────────────────────────────────────────────────────────────────┘
```

---

## Implementation Phases

### Phase 1: GraphQL Layer

**Prerequisite:** Complete the DB migration in `docs/Category-3-Upstream-Fuel-Energy/db-migration/category-3-upstream-fuel-energy.md` before writing any GraphQL documents.

#### 1.1 Update Existing Mutation — Grid Power

**File:** `graphql/mutations/update-emission-power-consumption-data.gql`

Add the two new Category 3 columns to the `_set` block inside `update_GHGEnergyConsumption_GridPower_many`:

```graphql
# Inside the _set block for GHGEnergyConsumption_GridPower, add:
kpi_em_Scope3_Category3
kpi_em_Scope3_Category3
```

Also update the companion file (if it exists):
`graphql/mutations/update-emission-power-cosumption-data.gql` (note: typo in existing filename — update both files).

#### 1.2 Update Existing Query — Grid Power

**File:** `graphql/queries/get-power-consumption-data.gql`

Add the two new columns to the `GHGEnergyConsumption_GridPower` selection set:

```graphql
# Add inside GHGEnergyConsumption_GridPower { ... }:
kpi_em_Scope3_Category3
kpi_em_Scope3_Category3
```

#### 1.3 Update Existing Mutation — Fuel Purchased General

**File:** `graphql/mutations/update-emission-fuel-consumption-data.gql` _(or the equivalent mutation that writes kpi columns back to `GHGEnergyConsumption_FuelPurchased_General`)_

Add the two new Category 3 columns to the `_set` block:

```graphql
# Add inside the FuelPurchased_General _set block:
kpi_em_Scope3_Category3
kpi_emf_Scope3_Category3
```

> **Note:** `GHGEnergyConsumption_FuelPurchased_General` uses the same column name `kpi_em_Scope3_Category3` as `GHGEnergyConsumption_GridPower`. The `_FuelPurchase` distinction is only applied at the dashboard aggregation layer via SQL alias.

#### 1.4 New Mutation — Insert / Upsert KpiEmissionByCategory3

**New File:** `graphql/mutations/insert-kpi-emission-by-category3.gql`

```graphql
mutation insertKpiEmissionByCategory3(
  $objects: [KpiEmissionByCategory3_insert_input!]!
  $deleteWhere: KpiEmissionByCategory3_bool_exp!
) {
  delete_KpiEmissionByCategory3(where: $deleteWhere) {
    affected_rows
  }
  insert_KpiEmissionByCategory3(objects: $objects) {
    returning {
      id
      organization_id
      address_id
      month
      year
      kpi_em_Scope3_Category3
      kpi_em_Scope3_Category3_FuelPurchase
      kpi_em_Scope3_Category3_Total
    }
  }
}
```

#### 1.5 New Query — Get KpiEmissionByCategory3

**New File:** `graphql/queries/get-kpi-emission-by-category3.gql`

```graphql
query getKpiEmissionByCategory3($where: KpiEmissionByCategory3_bool_exp) {
  KpiEmissionByCategory3(where: $where) {
    id
    organization_id
    address_id
    region_id
    month
    year
    em_uom
    kpi_em_Scope3_Category3
    kpi_em_Scope3_Category3_FuelPurchase
    kpi_em_Scope3_Category3_Total
  }
}
```

#### 1.6 Run Codegen

```bash
yarn codegen
```

This regenerates types in `graphql/shared/types.ts` and SDK methods in `graphql/shared/sdk.ts`, making `KpiEmissionByCategory3_insert_input`, `KpiEmissionByCategory3_bool_exp`, and new field types available.

---

### Phase 2: Emission Factor Key Registration

**File:** `lib/emission-calculation-engine/emission-factor.service.ts`

Add a new key to the `EmissionFactorKeys` constant:

```typescript
const EmissionFactorKeys = {
  // ...existing keys...
  energy_grid_scope3_category3: "energy_grid_scope3_category3",
  energy_fuel_scope3_category3: "energy_fuel_scope3_category3",
} as const;
```

**Note:** `energy_fuel_scope3_category3` reuses the same fuel-type EF path as `fuel_purchased_consumption` — no new `filterData` logic is needed. The separate key is for readability and to allow future divergence if fuel-specific Scope 3 factors are introduced.

---

### Phase 3: Emission Calculation Service

**Modified File:** `lib/emission-calculation-engine/emission-power-consumption.service.ts` (KPI 1)
**New File:** `lib/emission-calculation-engine/emission-category3.service.ts` (KPI 2)

#### KPI 1 – Grid Power

Category 3 grid power reuses the existing `calculateEmissionsByGridPower()` flow. A new **pure helper function** `calculateScope3Category3GridPowerEmission()` is added to `emission-power-consumption.service.ts`. It receives a single grid power row and the already-initialised `emissionfactorinit` closure, computes the Category 3 EF lookup, and returns `{ emissionValue, emissionFactorValue }`. The result is appended to the existing `_set` block inside `calculateEmissionsByGridPower()` — no extra SDK call, no extra data fetch.

```typescript
// In lib/emission-calculation-engine/emission-power-consumption.service.ts

/**
 * Scope 3 Category 3 – upstream T&D losses for a single grid power row.
 * Pure function: receives an already-fetched row + the emissionfactorinit closure.
 * Returns { emissionValue, emissionFactorValue } — caller adds these to its _set block.
 */
export const calculateScope3Category3GridPowerEmission = (
  gridPowerRow: any,
  emissionfactorinit: any
) => {
  const category3Filters = [
    { field: "category", value: "Energy", additionalfilter: "" },
    { field: "activity", value: "Grid", additionalfilter: "" },
    { field: "sub_activity", value: "Scope 3", additionalfilter: "" },
    { field: "type", value: "Category 3", additionalfilter: "" },
    {
      field: "yearMonth",
      value: {
        year: gridPowerRow?.TaskRequest?.year,
        month: gridPowerRow?.TaskRequest?.month,
      },
      additionalfilter: "",
    },
  ];

  return emissionfactorinit(
    "scope3_category3_grid_power",
    category3Filters,
    gridPowerRow.PowerPurchased_through_PPA_Kwh_NonRenewable,
    "",
    ""
  );
};
```

Inside `calculateEmissionsByGridPower()`, after computing `PPANonRenewableEmission`, call the helper and add the two columns to the `_set` block:

```typescript
const category3GridPowerEmission = calculateScope3Category3GridPowerEmission(
  gridPowerData[index],
  emissionfactorinit
);

data.push({
  where: { id: { _eq: gridPowerData[index].id } },
  _set: {
    // ...existing columns...
    kpi_em_Scope3_Category3: category3GridPowerEmission.emissionValue,
    kpi_em_Scope3_Category3: category3GridPowerEmission.emissionFactorValue,
  },
});
```

No new GraphQL mutation file is needed for KPI 1 — the two columns are added to the `returning` block of the existing `updateEmissionPowerConsumptionData` mutation.

#### KPI 2 – Fuel Purchase

A new file `emission-category3.service.ts` handles KPI 2 only. It has its own data fetch and SDK call because the fuel purchase flow is a separate activity.

```typescript
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { GhgEnergyConsumption_FuelPurchased_General_Updates } from "@/modules/ghg/graphql/shared/types";
import { emissionFactorUnits } from "@/modules/ghg/shared/constants/input.constant";
import { sanitize_compare_str_v1 } from "@/modules/ghg/utils/comapre.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import { initEmissionCalculation } from "./emission-factor.service";

// ─────────────────────────────────────────────────────────────────────────────
// KPI 2 – Fuel Purchase (Well-to-Tank)
// Source: GHGEnergyConsumption_FuelPurchased_General.Quantity_of_fuel_Consumed
// EF:     Energy > General Purpose > <fuel_type> (existing EFs reused)
// ─────────────────────────────────────────────────────────────────────────────

export const calculateCategory3FuelPurchaseEmission = async (
  organizationId: string,
  taskRequestIds: string[]
) => {
  try {
    const sdk = await getGraphQlServerSDK();

    // Reuse the existing getGHGEnergyConsumption_FuelPurchased query.
    // It already returns GHGEnergyConsumption_FuelPurchased_Generals with
    // Type_of_Fuel_Purchased, Quantity_of_fuel_Consumed, and UOM.
    const ghgData = await sdk.getGHGEnergyConsumption_FuelPurchased({
      task_request_id: taskRequestIds,
    });

    if (!ghgData.GHGEnergyConsumption_FuelPurchased?.length) return;

    const emissionfactorinit = await initEmissionCalculation(
      organizationId,
      String(
        ghgData.GHGEnergyConsumption_FuelPurchased[0]?.OrganizationAddress
          ?.Address?.country_id
      ),
      [ParentActivitiesType.Energy, ParentActivitiesType.Transport]
    );

    const updateData: GhgEnergyConsumption_FuelPurchased_General_Updates[] = [];
    const uniqueIds = new Set<number>();

    for (const fuelRecord of ghgData.GHGEnergyConsumption_FuelPurchased) {
      for (const generalRow of fuelRecord.GHGEnergyConsumption_FuelPurchased_Generals) {
        if (uniqueIds.has(generalRow.id)) continue;
        uniqueIds.add(generalRow.id);

        const fuelType = generalRow.Type_of_Fuel_Purchased ?? "";

        // Determine Point_of_Consumption for Diesel/Kerosene (mirrors existing fuel calc)
        let pointOfConsumption = "Direct";
        if (
          sanitizeString.v1(fuelType) === "diesel" ||
          sanitizeString.v1(fuelType) === "kerosene"
        ) {
          pointOfConsumption = generalRow.Point_of_Consumption ?? "Direct";
        }

        // Reuse the same EF filters as the existing General Purpose fuel calculation
        const cat3FuelFilters = [
          { field: "category", value: "Energy", additionalfilter: "" },
          { field: "activity", value: "General Purpose", additionalfilter: "" },
          { field: "type", value: fuelType, additionalfilter: "" },
          {
            field: "metadata",
            value: pointOfConsumption,
            additionalfilter: "Activity Specific",
          },
          {
            field: "unitFilter",
            value: emissionFactorUnits.gj,
            additionalfilter: "",
          },
          {
            field: "yearMonth",
            value: {
              year: fuelRecord.TaskRequest?.year,
              month: fuelRecord.TaskRequest?.month,
            },
            additionalfilter: "",
          },
          {
            field: "metadata",
            value: "yes",
            additionalfilter: "Default",
          },
        ];

        const cat3FuelEmission = emissionfactorinit(
          "energy_fuel_scope3_category3",
          cat3FuelFilters,
          generalRow.Quantity_of_fuel_Consumed,
          String(generalRow.Quantity_of_fuel_Consumed_uom),
          fuelType
        );

        updateData.push({
          where: { id: { _eq: generalRow.id } },
          _set: {
            kpi_em_Scope3_Category3:  cat3FuelEmission.emissionValue,
            kpi_emf_Scope3_Category3: cat3FuelEmission.emissionFactorValue,
          },
        });
      }
    }

    if (updateData.length > 0) {
      await sdk.updateEmissionCategory3FuelPurchaseData({
        GHGEnergyConsumption_FuelPurchased_General: updateData,
      });
    }
  } catch (error) {
    console.log(
      "Category 3 fuel purchase emission calculation exception:",
      error
    );
  }
};
```

#### 3.1 New GraphQL Mutations for Category 3 Row Updates

> **KPI 1 – Grid Power:** No new mutation file is needed. The two new Category 3 columns (`kpi_em_Scope3_Category3`, `kpi_em_Scope3_Category3`) are added to the `_set` block and `returning` of the **existing** `updateEmissionPowerConsumptionData` mutation in both files below.
>
> **Files to modify:**
>
> - `graphql/mutations/update-emission-power-consumption-data.gql`
> - `graphql/mutations/update-emission-power-cosumption-data.gql`

Add to the `returning` block of `update_GHGEnergyConsumption_GridPower_many` in both files:

```graphql
      kpi_em_Scope3_Category3
      kpi_em_Scope3_Category3
```

**New File:** `graphql/mutations/update-emission-category3-fuel-purchase-data.gql`

```graphql
mutation updateEmissionCategory3FuelPurchaseData(
  $GHGEnergyConsumption_FuelPurchased_General: [GHGEnergyConsumption_FuelPurchased_General_updates!]!
) {
  update_GHGEnergyConsumption_FuelPurchased_General_many(
    updates: $GHGEnergyConsumption_FuelPurchased_General
  ) {
    returning {
      id
      kpi_em_Scope3_Category3
      kpi_emf_Scope3_Category3
    }
  }
}
```

---

### Phase 4: Wire into calculateEmission()

**File:** `lib/emission-calculation-engine/emisison-calculation.service.ts`

#### 4.1 Add Import

```typescript
import * as emissionCategory3 from "./emission-category3.service";
```

#### 4.2 Update `calculateEmission()` Function

Add Category 3 calculation calls inside the **existing** activity branches:

```typescript
export const calculateEmission = async (
  organizationId: string,
  activity: TActivityCodes,
  taskRequestIds: string[],
  uniqueMaterial?: string[],
  orgAddressId?: string
) => {
  if (!!!taskRequestIds.length) return;

  if (activity === "transport_upstream") {
    await emisisonTransportion.tranportUpstreamEmissionService(
      taskRequestIds,
      organizationId
    );
  } else if (activity === "energy_grid_power") {
    // Existing Scope 1 / Scope 2 grid power calculation
    await emissionPowerConsumption.calculatePowerConsumptionGrid(
      organizationId,
      taskRequestIds
    );
    // NEW: Category 3 KPI 1 – T&D losses on grid power (pure helper, already wired into calculateEmissionsByGridPower)
  } else if (activity === "energy_captive_power") {
    await emissionPowerConsumption.calculatePowerConsumptionCaptive(
      organizationId,
      taskRequestIds
    );
  } else if (activity === "energy_fuel_purchased") {
    // Existing Scope 1 fuel consumption calculation
    await emissionFuelCalculation.calculateEmissionConsumption(
      taskRequestIds,
      organizationId
    );
    // NEW: Category 3 KPI 2 – Well-to-Tank fuel purchase
    await emissionCategory3.calculateCategory3FuelPurchaseEmission(
      organizationId,
      taskRequestIds
    );
  }
  // ... rest of existing branches unchanged
};
```

---

### Phase 5: Dashboard SQL Queries

**File:** `shared/Queries/dashboardqueries.ts`

#### 5.1 New Export: `SQL_QUERY_GET_Category3_details`

Add a new exported function following the same structural pattern as `SQL_QUERY_GET_Power_Grid_details` and `SQL_QUERY_GET_Fuel_details`:

```typescript
export const SQL_QUERY_GET_Category3_details = (taskrequestlist: string) => {
  return sql.raw(`
    WITH cat3_grid_agg AS (
      SELECT
        task_request_id,
        organization_address_id,
        SUM(COALESCE("kpi_em_Scope3_Category3", 0)) AS kpi_em_scope3_category3_gridpower
      FROM "GHGEnergyConsumption_GridPower"
      WHERE task_request_id IN ${taskrequestlist}
      GROUP BY task_request_id, organization_address_id
    ),
    cat3_fuel_agg AS (
      SELECT
        gcfp.task_request_id,
        gcfp.organization_address_id,
        SUM(COALESCE(gcfpg."kpi_em_Scope3_Category3", 0)) AS kpi_em_scope3_category3_fuelpurchase
      FROM "GHGEnergyConsumption_FuelPurchased_General" gcfpg
      INNER JOIN "GHGEnergyConsumption_FuelPurchased" gcfp
        ON gcfp.id = gcfpg."GHGEnergyConsumption_FuelPurchased_id"
      WHERE gcfp.task_request_id IN ${taskrequestlist}
      GROUP BY gcfp.task_request_id, gcfp.organization_address_id
    )
    SELECT
      o.id                                                                              AS organization_id,
      r.id                                                                              AS region_id,
      oa.id                                                                             AS address_id,
      tr."month"                                                                        AS month,
      tr."year"                                                                         AS year,
      'tco2e'                                                                           AS em_uom,
      COALESCE(cgg.kpi_em_scope3_category3_gridpower,        0)                        AS kpi_em_scope3_category3_gridpower,
      COALESCE(cfg.kpi_em_scope3_category3_fuelpurchase,     0)                        AS kpi_em_scope3_category3_fuelpurchase,
      COALESCE(cgg.kpi_em_scope3_category3_gridpower,        0)
        + COALESCE(cfg.kpi_em_scope3_category3_fuelpurchase, 0)                        AS kpi_em_scope3_category3_total
    FROM "TaskRequest" tr
    INNER JOIN "OrganizationAddress" oa  ON oa.id = tr.organization_address_id
    INNER JOIN "Organization"        o   ON oa.organization_id = o.id
    INNER JOIN "Addresses"           a   ON a.id = oa.address_id
    INNER JOIN "Country"             c   ON a.country_id = c.id
    LEFT  JOIN "Region"              r   ON r.code = c.region_code
    LEFT  JOIN cat3_grid_agg         cgg ON cgg.task_request_id = tr.id
                                        AND cgg.organization_address_id = oa.id
    LEFT  JOIN cat3_fuel_agg         cfg ON cfg.task_request_id = tr.id
                                        AND cfg.organization_address_id = oa.id
    WHERE tr.id IN ${taskrequestlist}
      AND (cgg.kpi_em_scope3_category3_gridpower    IS NOT NULL
           OR cfg.kpi_em_scope3_category3_fuelpurchase IS NOT NULL)
    ORDER BY tr."year", tr."month";
  `);
};
```

> **Design notes:**
> - Two CTEs replace the previous four — the intermediate `cat3_grid` / `cat3_fuel` steps were redundant.
> - Both CTEs include `organization_address_id` in the `GROUP BY` **and** in the final `LEFT JOIN` condition. This prevents a cross-product when a single task request spans multiple facilities.
> - All output column aliases use all-lowercase (`kpi_em_scope3_category3_gridpower`, `…fuelpurchase`, `…total`) to match PostgreSQL's unquoted identifier behaviour. The service reads the same lowercase names.
> - The final `GROUP BY` was removed — each CTE already produces at most one row per `(task_request_id, organization_address_id)`, so the outer query returns exactly one row per task request.

#### 5.2 Add Import Reference in `SQL_QUERY_GET_main_details`

Verify that `SQL_QUERY_GET_main_details` (line ~2831) sources total Scope 3 from a pattern that will naturally include the new `KpiEmissionByCategory3` once it is populated. If `kpi_em_Total_Emission_Scope3` is computed in that SQL directly, add a join to `KpiEmissionByCategory3`:

```sql
-- Inside SQL_QUERY_GET_main_details, add to the Scope3 total sum:
+ COALESCE(kc3.kpi_em_scope3_category3_total, 0)
-- with a corresponding LEFT JOIN:
LEFT JOIN (
  SELECT address_id, month, year, SUM(kpi_em_Scope3_Category3_Total) AS kpi_em_scope3_category3_total
  FROM "KpiEmissionByCategory3"
  GROUP BY address_id, month, year
) kc3 ON kc3.address_id = oa.id AND kc3.month = ... AND kc3.year = ...
```

> **Note:** Exact modification depends on the current structure of `SQL_QUERY_GET_main_details`. Review lines 2831–3858 of `shared/Queries/dashboardqueries.ts` and integrate consistently with how other Scope 3 contributions (e.g., `kpi_em_UpstreamTransport_Scope3`, `kpi_em_MaterialProcurement_Scope3`) are included.

---

### Phase 6: Wire into saveEmissionDashboard()

**File:** `lib/emission-calculation-engine/emisison-calculation.service.ts`

#### 6.1 Add Import

Ensure `SQL_QUERY_GET_Category3_details` is imported from `@/modules/ghg/shared/Queries/dashboardqueries`:

```typescript
import {
  // ...existing imports...
  SQL_QUERY_GET_Category3_details,
} from "@/modules/ghg/shared/Queries/dashboardqueries";
```

#### 6.2 Add KPI Array Declaration

Inside `saveEmissionDashboard()`, declare the new array after the existing KPI arrays:

```typescript
const kpiEmissionByCategory3: KpiEmissionByCategory3_Insert_Input[] = [];
```

#### 6.3 Fetch Category 3 Data

Add the data fetch after the existing SQL executions (e.g., after `SQL_QUERY_GET_Fugitive_Gas_Details`):

```typescript
const category3Data: Record<string, any>[] = await dbContext.execute(
  SQL_QUERY_GET_Category3_details(taskrequestid_forsql)
);
```

#### 6.4 Populate the KPI Array

Add after the fugitive details loop:

```typescript
for (const cat3 of category3Data) {
  kpiEmissionByCategory3.push({
    organization_id: cat3.organization_id,
    region_id: cat3.region_id,
    address_id: cat3.address_id,
    month:
      months.findIndex(
        (x) => sanitizeString.v3(x) === sanitizeString.v3(String(cat3.month))
      ) + 1,
    year: cat3.year,
    em_uom: em_uom,
    kpi_em_Scope3_Category3: cat3.kpi_em_Scope3_Category3 ?? 0,
    kpi_em_Scope3_Category3_FuelPurchase:
      cat3.kpi_em_scope3_category3_fuelpurchase ?? 0,
    kpi_em_Scope3_Category3_Total: cat3.kpi_em_scope3_category3_total ?? 0,
    metadata: {},
  });
}
```

#### 6.5 Update `insertkpiEmissionDashboardData` Call

Add the new delete + insert pair to the existing `sdk.insertkpiEmissionDashboardData({...})` call:

```typescript
const kpidata = await sdk.insertkpiEmissionDashboardData({
  // ...existing params...
  deleteKpiEmissionByCategory3: { _or: deleteCondition },
  kpiEmissionByCategory3: kpiEmissionByCategory3,
});
```

#### 6.6 Update the `insertkpiEmissionDashboardData` GraphQL Mutation

**File:** `graphql/mutations/insert-kpi-emission-dashboard-data.gql` _(or equivalent)_

Add the two new parameters:

```graphql
mutation insertkpiEmissionDashboardData(
  # ...existing params...
  $deleteKpiEmissionByCategory3: KpiEmissionByCategory3_bool_exp!
  $kpiEmissionByCategory3: [KpiEmissionByCategory3_insert_input!]!
) {
  # ...existing operations...

  delete_KpiEmissionByCategory3(where: $deleteKpiEmissionByCategory3) {
    affected_rows
  }
  insert_KpiEmissionByCategory3(objects: $kpiEmissionByCategory3) {
    returning {
      id
      address_id
      month
      year
      kpi_em_Scope3_Category3
      kpi_em_Scope3_Category3_FuelPurchase
      kpi_em_Scope3_Category3_Total
    }
  }
}
```

---

### Phase 7: KpiMain Aggregation Update

**File:** `shared/Queries/dashboardqueries.ts` — inside `SQL_QUERY_GET_main_details`

Ensure `kpi_em_Total_Emission_Scope3` in `KpiMain` includes the Category 3 total. The exact SQL edit depends on the existing aggregation pattern — reference how other Scope 3 contributions are included.

**Conceptually:**

```sql
kpi_em_Total_Emission_Scope3 =
    kpi_em_MaterialProcurement_Scope3
  + kpi_em_UpstreamTransport_Scope3
  + kpi_em_WasteGeneration_Scope3
  + kpi_em_BusinessTravel_Scope3
  + kpi_em_EmployeeTravel_Scope3
  + kpi_em_DownstreamTransport_Scope3
  + kpi_em_CapitalGoods_Scope3
  + kpi_em_Scope3_Category3_Total            -- NEW
```

---

### Phase 8: KPIEmissionByScope3 – Total Category 3 Rollup

> **Business Rule (KPI 3):**
>
> | #   | KPI Name                                | Calculation                                                                                        |
> | --- | --------------------------------------- | -------------------------------------------------------------------------------------------------- |
> | 3   | Total fuel and energy related emissions | `Total fuel and energy emissions (kgCO2) = Grid Power emissions + Total purchased fuels emissions` |
>
> Formula:
>
> ```
> kpi_em_Scope3_Category3_Total = kpi_em_Scope3_Category3 (Grid Power)
>                                 + kpi_em_Scope3_Category3_FuelPurchase (Fuel Purchase)
> ```
>
> This is already computed per-row in `KpiEmissionByCategory3.kpi_em_Scope3_Category3_Total` (Phase 5 SQL).
> The `KPIEmissionByScope3` table stores the **organization / facility / month / year** level rollup with only the two Category 3 emission columns: Grid Power and Fuel Purchase.

#### 8.1 New Table: `KPIEmissionByScope3`

> **DB migration:** Add the table definition to `docs/Category-3-Upstream-Fuel-Energy/db-migration/category-3-upstream-fuel-energy.md`.

```sql
CREATE TABLE "KPIEmissionByScope3" (
  "id"                                    uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  "organization_id"                       uuid NOT NULL,
  "region_id"                             uuid,
  "address_id"                            uuid NOT NULL,
  "month"                                 integer NOT NULL,   -- 1–12
  "year"                                  integer NOT NULL,
  "em_uom"                                text DEFAULT 'tco2e',
  -- Category 3: Upstream Fuel & Energy (only two emission columns)
  "kpi_em_Scope3_Category3_GridPower"     numeric(18,6),
  "kpi_em_Scope3_Category3_FuelPurchase"  numeric(18,6),
  "kpi_em_Scope3_Category3_Total"         numeric(18,6),     -- Grid Power + Fuel Purchase
  "metadata"                              jsonb DEFAULT '{}',
  "created_at"                            timestamptz DEFAULT now(),
  "updated_at"                            timestamptz DEFAULT now()
);

CREATE UNIQUE INDEX uq_kpi_emission_by_scope3
  ON "KPIEmissionByScope3" ("organization_id", "address_id", "month", "year");
```

#### 8.2 New GraphQL Mutation — Upsert `KPIEmissionByScope3`

**New File:** `graphql/mutations/insert-kpi-emission-by-scope3.gql`

```graphql
mutation insertKPIEmissionByScope3(
  $objects: [KPIEmissionByScope3_insert_input!]!
  $deleteWhere: KPIEmissionByScope3_bool_exp!
) {
  delete_KPIEmissionByScope3(where: $deleteWhere) {
    affected_rows
  }
  insert_KPIEmissionByScope3(objects: $objects) {
    returning {
      id
      organization_id
      address_id
      month
      year
      kpi_em_Scope3_Category3_GridPower
      kpi_em_Scope3_Category3_FuelPurchase
      kpi_em_Scope3_Category3_Total
    }
  }
}
```

#### 8.3 New GraphQL Query — Get `KPIEmissionByScope3`

**New File:** `graphql/queries/get-kpi-emission-by-scope3.gql`

```graphql
query getKPIEmissionByScope3($where: KPIEmissionByScope3_bool_exp) {
  KPIEmissionByScope3(where: $where) {
    id
    organization_id
    address_id
    region_id
    month
    year
    em_uom
    kpi_em_Scope3_Category3_GridPower
    kpi_em_Scope3_Category3_FuelPurchase
    kpi_em_Scope3_Category3_Total
  }
}
```

#### 8.4 ~~New SQL Query: `SQL_QUERY_GET_Scope3_Rollup`~~ — Removed

> **Decision (implemented):** A separate `SQL_QUERY_GET_Scope3_Rollup` that read from `KpiEmissionByCategory3` was removed. `KPIEmissionByScope3` is now populated directly from `SQL_QUERY_GET_Category3_details` (Phase 5) — the same query that feeds `KpiEmissionByCategory3`. This avoids a redundant intermediate read and keeps the two dashboard tables in sync from the same source of truth.

#### 8.5 Wire `KPIEmissionByScope3` into `saveEmissionDashboard()`

**File:** `lib/emission-calculation-engine/emisison-calculation.service.ts`

`KPIEmissionByScope3` is populated by iterating the **same `category3Data` result** already fetched for `KpiEmissionByCategory3` (Phase 6.3). No additional SQL query or DB round-trip is needed.

Add the array declaration alongside the other KPI arrays:

```typescript
const kpiEmissionByScope3: KpiEmissionByScope3_Insert_Input[] = [];
```

Add the populate loop after the `KpiEmissionByCategory3` loop:

```typescript
// Phase 8 – KPIEmissionByScope3 (KPI 3 – Total Category 3 rollup)
// Re-uses the same category3Data already fetched for KpiEmissionByCategory3.
for (const s3 of category3Data) {
  kpiEmissionByScope3.push({
    organization_id: s3.organization_id,
    region_id:       s3.region_id,
    address_id:      s3.address_id,
    month:
      months.findIndex(
        (x) => sanitizeString.v3(x) === sanitizeString.v3(String(s3.month))
      ) + 1,
    year:    s3.year,
    em_uom:  em_uom,
    kpi_em_Scope3_Category3_GridPower:    s3.kpi_em_scope3_category3_gridpower    ?? 0,
    kpi_em_Scope3_Category3_FuelPurchase: s3.kpi_em_scope3_category3_fuelpurchase ?? 0,
    kpi_em_Scope3_Category3_Total:        s3.kpi_em_scope3_category3_total        ?? 0,
    metadata: {},
  });
}
```

> **Column name mapping** — `SQL_QUERY_GET_Category3_details` outputs all-lowercase aliases (PostgreSQL behaviour for unquoted identifiers). The mapping is:
>
> | SQL alias (lowercase)                   | `KPIEmissionByScope3` column              |
> | --------------------------------------- | ----------------------------------------- |
> | `kpi_em_scope3_category3_gridpower`     | `kpi_em_Scope3_Category3_GridPower`       |
> | `kpi_em_scope3_category3_fuelpurchase`  | `kpi_em_Scope3_Category3_FuelPurchase`    |
> | `kpi_em_scope3_category3_total`         | `kpi_em_Scope3_Category3_Total`           |

Add to the `sdk.insertkpiEmissionDashboardData({...})` call:

```typescript
deleteKPIEmissionByScope3: { _or: deleteCondition },
kpiEmissionByScope3: kpiEmissionByScope3,
```

#### 8.6 Update `insertkpiEmissionDashboardData` GraphQL Mutation

Add to `graphql/mutations/insert-kpi-emission-dashboard-data.gql`:

```graphql
  $deleteKPIEmissionByScope3: KPIEmissionByScope3_bool_exp!
  $kpiEmissionByScope3: [KPIEmissionByScope3_insert_input!]!

  delete_KPIEmissionByScope3(where: $deleteKPIEmissionByScope3) {
    affected_rows
  }
  insert_KPIEmissionByScope3(objects: $kpiEmissionByScope3) {
    returning {
      id
      address_id
      month
      year
      kpi_em_Scope3_Category3_GridPower
      kpi_em_Scope3_Category3_FuelPurchase
      kpi_em_Scope3_Category3_Total
    }
  }
```

#### 8.7 Run Codegen

```bash
yarn codegen
```

This generates `KPIEmissionByScope3_insert_input`, `KPIEmissionByScope3_bool_exp`, and all new field types.

---

## File Manifest

**DB migration source of truth:** `docs/Category-3-Upstream-Fuel-Energy/db-migration/category-3-upstream-fuel-energy.md`

| #   | File Path                                                                              | Action     | Description                                                                                              |
| --- | -------------------------------------------------------------------------------------- | ---------- | -------------------------------------------------------------------------------------------------------- |
| 1   | `docs/Category-3-Upstream-Fuel-Energy/db-migration/category-3-upstream-fuel-energy.md` | ✅ Done    | DB migration plan                                                                                        |
| 2   | `specs/feat-category-3-upstream-fuel-energy/requirements.md`                           | ✅ Done    | Requirements document                                                                                    |
| 3   | `specs/feat-category-3-upstream-fuel-energy/implementation.md`                         | ✅ Done    | This file                                                                                                |
| 4   | `graphql/queries/get-power-consumption-data.gql`                                       | Modify     | Add 2 new Category 3 columns to selection                                                                |
| 5   | `graphql/mutations/update-emission-power-consumption-data.gql`                         | ✅ Done    | Added `kpi_em_Scope3_Category3` + `kpi_emf_*` to `returning` block                                       |
| 6   | `graphql/mutations/update-emission-power-cosumption-data.gql`                          | ✅ Done    | Same as #5 (duplicate file with typo in name)                                                            |
| 7   | `graphql/mutations/update-emission-category3-fuel-purchase-data.gql`                   | Create     | Dedicated mutation to write Cat3 KPI 2 row results (fuel purchase only)                                  |
| 8   | `graphql/mutations/insert-kpi-emission-by-category3.gql`                               | Create     | Delete + insert for `KpiEmissionByCategory3` dashboard table                                             |
| 9   | `graphql/queries/get-kpi-emission-by-category3.gql`                                    | Create     | Query for `KpiEmissionByCategory3`                                                                       |
| 10  | `graphql/mutations/insert-kpi-emission-dashboard-data.gql`                             | Modify     | Add `deleteKpiEmissionByCategory3` + `kpiEmissionByCategory3` params                                     |
| 11  | `lib/emission-calculation-engine/emission-factor.service.ts`                           | Modify     | Add 1 new key to `EmissionFactorKeys` (`scope3_category3_grid_power`)                                    |
| 12  | `lib/emission-calculation-engine/emission-power-consumption.service.ts`                | ✅ Done    | Added `calculateScope3Category3GridPowerEmission()` helper; wired into `calculateEmissionsByGridPower()` |
| 13  | `lib/emission-calculation-engine/emission-category3.service.ts`                        | **Create** | New service for Cat3 KPI 2 only (`calculateCategory3FuelPurchaseEmission()`)                             |
| 14  | `lib/emission-calculation-engine/emisison-calculation.service.ts`                      | Modify     | Import + call Cat3 KPI 2 service in `calculateEmission()` + wire `saveEmissionDashboard()`               |
| 15  | `shared/Queries/dashboardqueries.ts`                                                   | ✅ Done    | Added `SQL_QUERY_GET_Category3_details` (2-CTE, address join fixed, lowercase aliases); update `SQL_QUERY_GET_main_details` pending |
| 16  | `docs/Category-3-Upstream-Fuel-Energy/db-migration/category-3-upstream-fuel-energy.md` | ✅ Done    | Added `KPIEmissionByScope3` table DDL + unique index (Section 2b)                                        |
| 17  | `graphql/mutations/insert-kpi-emission-by-scope3.gql`                                  | **Create** | Delete + insert mutation for `KPIEmissionByScope3` rollup table                                          |
| 18  | `graphql/queries/get-kpi-emission-by-scope3.gql`                                       | **Create** | Query for `KPIEmissionByScope3`                                                                          |
| 19  | `shared/Queries/dashboardqueries.ts`                                                   | ✅ Done    | `SQL_QUERY_GET_Scope3_Rollup` was **removed** — `KPIEmissionByScope3` is populated directly from `category3Data` (same result as `SQL_QUERY_GET_Category3_details`), no extra query needed |
| 20  | `lib/emission-calculation-engine/emisison-calculation.service.ts`                      | ✅ Done    | `kpiEmissionByScope3` array populated from `category3Data`; delete+insert wired into `sdk.insertkpiEmissionDashboardData()`       |
| 21  | `graphql/mutations/insert-kpi-emission-dashboard-data.gql`                             | ✅ Done    | Added `$deleteKPIEmissionByScope3` + `$kpiEmissionByScope3` params and operations                        |

---

## Key Design Decisions

### 1. No New Activity Template or Upload Route

Category 3 is a pure **calculation-layer addition**. All input data already exists in `GHGEnergyConsumption_GridPower` and `GHGEnergyConsumption_FuelPurchased_General`. No new API routes, validation schemas, or frontend changes are required.

### 2. Row-Level Storage Before Dashboard Aggregation

Each grid power row and fuel general row stores its own Category 3 emission value in new columns on the source table. The dashboard SQL then aggregates these row-level values. This matches the existing pattern for all other activities (e.g., `kpi_em_Emission_PowerPurchased_PPA_Renewable` on `GHGEnergyConsumption_GridPower`).

### 3. Reuse of Existing Emission Factor Infrastructure

`initEmissionCalculation()` and `filterData()` in `emission-factor.service.ts` are reused without modification. Only new filter values are applied. The Category 3 Grid Power EF must be inserted into `CO2EmissionFactorMaster` by the data team before the calculation will produce non-NULL results.

### 4. General Purpose Fuel Only for KPI 2 (Phase 1)

Only `GHGEnergyConsumption_FuelPurchased_General` is used for KPI 2. Auxiliary fuel and heating/water sub-sheets are excluded in Phase 1, consistent with the PRD.

### 5. Calculation Ordering

Both Category 3 calculations are called **after** the existing Scope 1/2 calculations in the same activity branch. This ensures the existing KPI columns are written first and prevents data conflicts if the same SDK call updates the same row.

### 6. NULL Safety

- If `PowerPurchased_through_PPA_Kwh_NonRenewable` is `NULL`, the emission is not calculated (treated as zero via the emission factor service's `if (!!emissionFactorValue)` guard in `initEmissionCalculation`).
- If no EF is found, the emission value is stored as `NULL`, consistent with existing behaviour across all activities.

---

## Reference Patterns

| Pattern                                       | Reference File                                                                                |
| --------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Emission calculation service structure        | `lib/emission-calculation-engine/emission-power-consumption.service.ts`                       |
| Fuel emission calculation with UOM conversion | `lib/emission-calculation-engine/emission-fuel-consumption.service.ts`                        |
| Emission factor lookup + filtering            | `lib/emission-calculation-engine/emission-factor.service.ts`                                  |
| Dashboard SQL structure                       | `shared/Queries/dashboardqueries.ts` → `SQL_QUERY_GET_Fuel_details`                           |
| Dashboard KPI push pattern                    | `lib/emission-calculation-engine/emisison-calculation.service.ts` → `saveEmissionDashboard()` |
| KPI table with same columns pattern           | `KpiEmissionByPowerConsumption`, `KpiEmissionByFuelConsumption`                               |

---

## Testing Checklist

### Emission Factor Setup

- [ ] `CO2EmissionFactorMaster` contains a record with `category=Energy`, `activity=Grid`, `sub_activity=Scope 3`, `type=Category 3` (from Harsh)
- [ ] Emission factor value is non-zero and geography-tagged correctly

### KPI 1 – Grid Power Calculation

- [ ] After `energy_grid_power` upload, `calculateScope3Category3GridPowerEmission()` is called
- [ ] `GHGEnergyConsumption_GridPower.kpi_em_Scope3_Category3` is populated for rows with non-null `PowerPurchased_through_PPA_Kwh_NonRenewable`
- [ ] `GHGEnergyConsumption_GridPower.kpi_em_Scope3_Category3` is populated with the EF value used
- [ ] Rows with `PowerPurchased_through_PPA_Kwh_NonRenewable = NULL` produce `kpi_em_Scope3_Category3 = NULL`
- [ ] Formula: `kpi_em_Scope3_Category3 ≈ PowerPurchased_through_PPA_Kwh_NonRenewable × EF` (verify with known test values from Harsh)

### KPI 2 – Fuel Purchase Calculation

- [ ] After `energy_fuel_purchased` upload, `calculateCategory3FuelPurchaseEmission()` is called
- [ ] `GHGEnergyConsumption_FuelPurchased_General.kpi_em_Scope3_Category3` is populated for each fuel row
- [ ] `GHGEnergyConsumption_FuelPurchased_General.kpi_emf_Scope3_Category3` is populated with the EF value used
- [ ] Different fuel types (Diesel, LPG, CNG, etc.) each produce their own EF lookup and row result
- [ ] UOM conversion is applied correctly before EF multiplication
- [ ] Auxiliary fuel rows are NOT included in Category 3 KPI 2

### Dashboard Aggregation

- [ ] `saveEmissionDashboard()` populates `KpiEmissionByCategory3` after each calculation
- [ ] `kpi_em_Scope3_Category3_Total = kpi_em_Scope3_Category3 + kpi_em_Scope3_Category3_FuelPurchase` (coalescing NULLs to 0)
- [ ] Re-running the calculation for the same month/year/facility overwrites the previous `KpiEmissionByCategory3` records (delete + insert pattern)
- [ ] `KpiMain.kpi_em_Total_Emission_Scope3` includes Category 3 total emissions

### KPI 3 – Total Category 3 Emissions & KPIEmissionByScope3 Rollup

- [x] `KPIEmissionByScope3` is populated after `saveEmissionDashboard()` runs ✅ Done
- [x] Data source is `category3Data` (same result set as `SQL_QUERY_GET_Category3_details`) — no separate rollup query ✅ Done
- [ ] `kpi_em_Scope3_Category3_Total = kpi_em_Scope3_Category3_GridPower + kpi_em_Scope3_Category3_FuelPurchase` (KPI 3 formula verified)
- [ ] Values in `KPIEmissionByScope3` match `KpiEmissionByCategory3` for the same facility/month/year:
  - `KPIEmissionByScope3.kpi_em_Scope3_Category3_GridPower` = `KpiEmissionByCategory3.kpi_em_Scope3_Category3`
  - `KPIEmissionByScope3.kpi_em_Scope3_Category3_FuelPurchase` = `KpiEmissionByCategory3.kpi_em_Scope3_Category3_FuelPurchase`
  - `KPIEmissionByScope3.kpi_em_Scope3_Category3_Total` = `KpiEmissionByCategory3.kpi_em_Scope3_Category3_Total`
- [ ] Re-running overwrites the previous `KPIEmissionByScope3` record for the same facility/month/year (delete + insert via `on_conflict: KPIEmissionByScope3_pkey`)
- [ ] `KPIEmissionByScope3.kpi_em_Scope3_Category3_Total` is included in `KpiMain.kpi_em_Total_Emission_Scope3`
- [ ] When only Grid Power data exists, `kpi_em_Scope3_Category3_FuelPurchase = 0` and total equals grid power value
- [ ] When only Fuel Purchase data exists, `kpi_em_Scope3_Category3_GridPower = 0` and total equals fuel purchase value

### Edge Cases

- [ ] Upload with no `PowerPurchased_through_PPA_Kwh_NonRenewable` data → `kpi_em_Scope3_Category3 = NULL`, dashboard entry is skipped or zero
- [ ] Missing emission factor for Category 3 grid → row result `NULL`, no crash
- [ ] Missing emission factor for a specific fuel type → that row result `NULL`, other fuel rows calculated correctly
- [ ] Multiple facilities in the same upload batch → each facility aggregated independently in `KpiEmissionByCategory3`
- [ ] Large batch (1000+ rows) does not cause timeout in `calculateCategory3FuelPurchaseEmission()`

### Regression

- [ ] Existing `kpi_em_Emission_PowerPurchased_*` columns on `GHGEnergyConsumption_GridPower` are unchanged after Category 3 calculation runs
- [ ] Existing `kpi_em_Emission_QuantityOfFuelConsumed` on `GHGEnergyConsumption_FuelPurchased_General` is unchanged
- [ ] Scope 1 / Scope 2 dashboard KPIs are unchanged
