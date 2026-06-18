# Category 3 – Upstream Fuel and Energy Related Activities: Requirements Document

## 1. Overview

Category 3 captures **upstream emissions** associated with the production, extraction, processing, and transportation of fuel and electricity **before** they reach the reporting facility. This is commonly referred to as the **"Well-to-Tank"** phase.

**Two emission sources are in scope:**

| Source                                | Description                                                                                                                                |
| ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ |
| **Upstream Electricity (Grid Power)** | Emissions from T&D (Transmission & Distribution) losses — electricity generated at source but lost in transit before reaching the facility |
| **Upstream Fuel (Fuel Purchase)**     | Emissions from the extraction, refining, processing, and transport of fuel to the facility                                                 |

**No new activity template is required.** Existing activity templates (`Energy Grid` and `Fuel – General Purpose`) already capture the required data points.

---

## 2. KPIs

Category 3 introduces **two KPIs**:

| KPI   | Name                               | Description                                                     |
| ----- | ---------------------------------- | --------------------------------------------------------------- |
| KPI 1 | Emissions related to Grid Power    | Upstream emissions from T&D losses on grid electricity consumed |
| KPI 2 | Emissions related to Fuel Purchase | Upstream emissions from the well-to-tank phase of fuel consumed |

**Total Category 3 Emission = KPI 1 (Grid Power) + KPI 2 (Fuel Purchase)**

---

## 3. KPI 1 – Emissions Related to Grid Power

### 3.1 Data Source

**Activity Template:** Energy Grid (existing template)

**Source Table:** `GHGEnergyConsumption_GridPower`

**Source Field:** `PowerPurchased_through_PPA_Kwh_NonRenewable` (units: kWh)

> **Note:** `PowerPurchased_through_PPA_Kwh_NonRenewable` is **not currently used in any existing KPI calculation**, making it available exclusively for Category 3. No conflicts with Scope 1 or Scope 2 calculations.

### 3.2 Emission Factor

A **new emission factor line item** must be added to the `CO2EmissionFactorMaster` with the identifier:

```
Energy Grid > Scope 3 > Category 3
```

Filter path for the calculation engine:

| Filter Field   | Value        |
| -------------- | ------------ |
| `category`     | `Energy`     |
| `activity`     | `Grid`       |
| `sub_activity` | `Scope 3`    |
| `type`         | `Category 3` |

**T&D Loss Approach:** The emission factor already **embeds the T&D loss percentage** (standard fixed percentage per region, e.g., 15–20% losses). The factor value is provided by the backend/data team (Harsh). The application formula is a straightforward multiplication — no separate T&D loss percentage is managed in code.

### 3.3 Calculation Formula

```
Grid Power Emissions (tCO₂e) = PowerPurchased_through_PPA_Kwh_NonRenewable (kWh) × EF (Category 3, Grid)
```

### 3.4 Result Storage

- **Row-level result** stored on `GHGEnergyConsumption_GridPower`:

  - `kpi_em_Scope3_Category3` — calculated emission value (tCO₂e)
  - `kpi_em_Scope3_Category3` — emission factor used

- **Aggregated result** stored on `KpiEmissionByCategory3`:
  - `kpi_em_Category3_GridPower` — sum across all rows for the month/year/facility

### 3.5 Acceptance Criteria

- The calculation is triggered automatically when `energy_grid_power` activity data is processed (same trigger point as the existing Scope 1 / Scope 2 grid power calculation).
- If `PowerPurchased_through_PPA_Kwh_NonRenewable` is `NULL` or `0`, the emission is `0` (no error raised).
- If no emission factor is found for the `Energy > Grid > Scope 3 > Category 3` filter, the row-level result is stored as `NULL` and a warning is logged (consistent with existing EF lookup behaviour).
- The result is included in the `KpiEmissionByCategory3` dashboard table after each calculation run.

---

## 4. KPI 2 – Emissions Related to Fuel Purchase

### 4.1 Data Source

**Activity Template:** Fuel – General Purpose (existing template)

**Source Table:** `GHGEnergyConsumption_FuelPurchased_General`

**Source Field:** `Quantity_of_fuel_Consumed` (per fuel type, with `Quantity_of_fuel_Consumed_uom`)

**Fuel type field:** `Type_of_Fuel_Purchased`

### 4.2 Emission Factor

**Existing emission factors are reused.** No new emission factor line items are required.

The same fuel-type emission factors already used by the `energy_fuel_purchased` activity apply here. Filter path:

| Filter Field | Value                                          |
| ------------ | ---------------------------------------------- |
| `category`   | `Energy`                                       |
| `activity`   | `General Purpose`                              |
| `type`       | `<fuel_type>` (e.g., Diesel, LPG, Petrol, CNG) |

### 4.3 Calculation Formula

**Per fuel type:**

```
Fuel Purchase Emissions (per type, tCO₂e) = Quantity_of_fuel_Consumed × EF (fuel type)
```

**Total KPI 2:**

```
Total Fuel Purchase Emissions = Σ (Qty × EF) across all fuel types for the period
```

**Example** (facility using Diesel and LPG):

```
Total = (Qty Diesel × EF Diesel) + (Qty LPG × EF LPG)
```

### 4.4 UOM Handling

Fuel quantity is consumed in the client-supplied UOM (`Quantity_of_fuel_Consumed_uom`). The existing UOM conversion service (`ConvertUOMGeneralised`) is used to normalise the quantity before applying the emission factor — consistent with how the existing `energy_fuel_purchased` calculation (`emission-fuel-consumption.service.ts`) works.

### 4.5 Result Storage

- **Row-level result** stored on `GHGEnergyConsumption_FuelPurchased_General`:

  - `kpi_em_Scope3_Category3_FuelPurchase` — calculated emission value (tCO₂e) for this row
  - `kpi_emf_Scope3_Category3_FuelPurchase` — emission factor used

- **Aggregated result** stored on `KpiEmissionByCategory3`:
  - `kpi_em_Category3_FuelPurchase` — sum across all fuel type rows for the month/year/facility

### 4.6 Acceptance Criteria

- The calculation is triggered automatically when `energy_fuel_purchased` activity data is processed.
- Only rows from the **General Purpose** sub-sheet (`GHGEnergyConsumption_FuelPurchased_General`) are used. Auxiliary fuel (`GHGEnergyConsumption_FuelPurchased_Auxiliary`) and heating/water fuel (`GHGEnergyConsumption_FuelPurchased_HeatingWater`) are **excluded** from Category 3 KPI 2 in phase 1.
- If no emission factor is found for a given fuel type, that row's result is stored as `NULL` and a warning is logged.
- The result is included in the `KpiEmissionByCategory3` dashboard table after each calculation run.

---

## 5. Total Category 3 Aggregation

After both KPI 1 and KPI 2 are calculated for a month/year/facility, the total is stored in `KpiEmissionByCategory3`:

```
kpi_em_Category3_Total = kpi_em_Category3_GridPower + kpi_em_Category3_FuelPurchase
```

`NULL` values are treated as `0` in the total (`COALESCE(value, 0)`).

---

## 6. Calculation Trigger Points

Category 3 emission calculation is **not a standalone activity upload**. It is triggered as a side-effect of two existing activity uploads:

| Triggering Activity Upload     | Category 3 KPI Calculated |
| ------------------------------ | ------------------------- |
| `energy_grid_power` upload     | KPI 1 – Grid Power        |
| `energy_fuel_purchased` upload | KPI 2 – Fuel Purchase     |

Both KPI calculations are added to the existing `calculateEmission()` function in `emisison-calculation.service.ts` as additional steps within their respective activity branches.

---

## 7. Dashboard Integration

The aggregated `KpiEmissionByCategory3` data feeds into:

1. **Category-level Scope 3 reporting** — Category 3 total emissions displayed in the GHG dashboard under Scope 3.
2. **`KpiMain` total emission update** — `kpi_em_Total_Emission_Scope3` in `KpiMain` should include Category 3 emissions, summed via the dashboard SQL in `SQL_QUERY_GET_main_details`.

The `saveEmissionDashboard()` function in `emisison-calculation.service.ts` is responsible for populating `KpiEmissionByCategory3` using a new SQL query `SQL_QUERY_GET_Category3_details`.

---

## 8. No Template Changes Required

Category 3 does **not** require any changes to:

- The Energy Grid template (`GridPowerDetailsConstant`)
- The Fuel Purchased template (`FuelPurchasedActivityConstant`)
- Any data entry forms
- Any upload validation schemas

The `PowerPurchased_through_PPA_Kwh_NonRenewable` field already exists in the Energy Grid template and the `GHGEnergyConsumption_GridPower` table. No new input fields are exposed to end users for Category 3.

---

## 9. Open Items / Pending Clarifications

| #   | Item                                                                                                           | Owner                     | Status                                   |
| --- | -------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------------- |
| 1   | Confirm the `factor` value for Category 3 Grid Power emission factor (T&D loss %, per region)                  | Harsh (backend/data team) | Pending                                  |
| 2   | Confirm whether Auxiliary fuel and Heating/Water fuel sub-sheets should be included in KPI 2 in a future phase | Param / Tharani           | Pending (Phase 1 = General Purpose only) |
| 3   | Confirm whether KPI 2 should also cover `GHGEnergyConsumption_FuelPurchased_HeatingWater` in future            | Param / Tharani           | Pending                                  |
| 4   | Confirm dashboard visualisation requirements for Category 3 (chart type, breakdown by KPI 1 vs KPI 2)          | Tharani                   | Pending                                  |

---

## 10. Summary of Changes Required

| Area                               | Change                                                                                   |
| ---------------------------------- | ---------------------------------------------------------------------------------------- |
| **New Activity Template**          | Not required                                                                             |
| **New Emission Factor Line Items** | 1 new record — `Energy > Grid > Scope 3 > Category 3` (EF value from Harsh)              |
| **New KPIs**                       | 2 KPIs: Grid Power + Fuel Purchase                                                       |
| **New DB Columns**                 | 2 on `GHGEnergyConsumption_GridPower`, 2 on `GHGEnergyConsumption_FuelPurchased_General` |
| **New DB Table**                   | `KpiEmissionByCategory3`                                                                 |
| **Calculation Logic**              | New service `emission-category3.service.ts` wired into existing `calculateEmission()`    |
| **Dashboard SQL**                  | New `SQL_QUERY_GET_Category3_details` in `dashboardqueries.ts`                           |
| **GraphQL**                        | Update grid/fuel update mutations + new Category 3 KPI insert mutation                   |
| **Template Changes**               | None                                                                                     |
