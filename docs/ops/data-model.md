# OPs GHG Calculator — Data Model

## Database Architecture

The application uses two Postgres databases:

### 1. Hasura-managed DB (primary)
Accessed via Hasura GraphQL with row-level security enforced through JWT claims (`x-hasura-org-id`). Contains all GHG transaction tables, KPI tables, organisation master data, users, activities, and emission factors. Schema is managed outside this repository (Hasura migrations).

### 2. OPS DB (secondary)
Accessed directly via Drizzle ORM. Contains operational tables not in Hasura. Schema defined in `utils/drizzle/schema.ts`.

---

## Drizzle ORM Tables (`utils/drizzle/schema.ts`)

### `SupplierInvitations`
Tracks invitations between buyer and supplier organisations.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK, random default |
| `inviter_org_id` | uuid | Organisation sending the invitation |
| `invitee_org_id` | uuid | Organisation receiving the invitation |
| `invitation_date_time` | timestamptz | When invitation was sent |
| `status` | text | e.g. `pending`, `accepted`, `rejected` |
| `metadata` | jsonb | Arbitrary extra data |
| `is_deleted` | boolean | Soft delete flag |
| `created_at`, `updated_at` | timestamptz | Audit timestamps |
| `created_by`, `updated_by` | uuid | User audit |

### `BuyerSupplierAddressMappings`
Maps a buyer org address to a supplier org address for emissions attribution.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `buyer_org_id` | uuid | Buyer organisation |
| `supplier_org_id` | uuid | Supplier organisation |
| `instance_buyer_supplier_address_id` | uuid | The buyer's address in the instance |
| `instance_supplier_address_id` | uuid | The supplier's address |
| `status` | text | Mapping status |
| `metadata` | jsonb | |
| `is_deleted` | boolean | Soft delete |

### `EmailTemplates`
Stores organisation-scoped email templates.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `org_id` | uuid | nullable — global templates have no org |
| `name` | text | Template name |
| `type` | text | Template type key |
| `template` | text | HTML body with `{{variable}}` placeholders |
| `metadata` | jsonb | |
| `is_deleted` | boolean | |

### `GlobalConfigs`
Organisation-level configuration key-value store.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `org_id` | uuid | nullable |
| `type` | text | Config type/key |
| `configuration` | jsonb | Config payload |
| `metadata` | jsonb | |
| `is_deleted` | boolean | |

### `Organizations`
Mirrors top-level organisation records from the platform.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `instance_org_id` | uuid | Platform instance reference |
| `name` | text | |
| `status` | text | |
| `metadata` | jsonb | |
| `is_deleted` | boolean | |

### `OrganizationInstances`
Represents a tenant instance of an organisation.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid | PK |
| `org_id` | uuid | Parent organisation |
| `status` | text | |
| `metadata` | jsonb | |
| `configuration` | jsonb | Instance-specific config |
| `is_deleted` | boolean | |

---

## Drizzle ORM Views

### `view_page_data_supplier_master_material_mapping`
Convenience view joining supplier material mapping with supplier and material master data.

| Column | Type | Notes |
|---|---|---|
| `organization_id` | uuid | |
| `supplier_material_mapping_id` | uuid | |
| `org_material_master_id` | uuid | |
| `supplier_address_mapping_id` | uuid | |
| `supplier_code_name` | text | Supplier identifier display |
| `supplier_address_code_name` | text | Supplier location identifier |
| `material_master_code_name` | text | Material identifier |
| `from_period` | text | Mapping validity start |
| `to_period` | text | Mapping validity end |

---

## Hasura DB — Key Tables (from KPI SQL Views)

These tables are managed by Hasura and appear in the SQL view definitions:

### `KPIMain`
Central KPI emission table. One row per (organization, address, region, year, month).

Key pre-computed KPI fields:
- `kpi_em_Total_Emission` — total GHG emissions (tCO2e)
- `kpi_em_Total_Emission_Scope1` — Scope 1 total
- `kpi_em_Total_Emission_Scope2` — Scope 2 total
- `kpi_em_Total_Emission_Scope3` — Scope 3 total
- `kpi_em_Cont_TotalEmission_Categories_Energy` — emission contribution from energy
- `kpi_em_CurrentEmissionIntensity_PerTonProduction` — intensity per tonne of production
- `kpi_em_CurrentEmissionIntensity_PerEmployee` — intensity per employee
- `kpi_em_CurrentEmissionIntensity_PerProduct` — intensity per product
- `kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerProduct`
- `kpi_em_CurrentEmissionIntensity_Scope3_PerProduct`

### `KPIEnergy`
Energy consumption KPI table.

Key columns: `source` (`fuel_purchased` | `captive` | `grid`), `purpose` (`general` | `transportation` | `heating` | `auxiliary`), `resource` (fuel type e.g. `Diesel`), `energy_resource_type` (`renewable` | `nonrenewable`), `contract_type` (`ppa` | etc.), `quantity` (volume of fuel), `kpi_generated_units` (electricity in kWh).

### `KPIWaterConsumption`
Water KPI table. Columns: `total_fresh_water_consumption`, `total_waste_water_consumption`, `total_harvested_water_consumption`, `total_water_consumption_uom`.

### `KPIWasteManagement`
Waste KPI table. Columns: `kpi_waste_generated_type`, `kpi_waste_disposal_mechanism`, `kpi_waste_quantity`.

### `KPIEmissionByFuelConsumption`, `KPIEmissionByMaterialConsumption`, `KPIEmissionByMaterialConsumption_Suppliers`, `KPIEmissionByPowerConsumption`, `KPIEmissionByPowerConsumption_Vendors`, `KPIEmissionByProducts`, `KPIEmissionByTransportation`, `KPIEmissionByWasteGeneration`
Emission breakdown tables by category (all referenced in `view_global_filters`).

### `Organization`
Organisation master: `Baselineyear`, `FinancialYearMonth` — used in all KPI view date series generation.

### `OrganizationAddress`, `Addresses`, `Region`
Location and geographic hierarchy tables.

---

## SQL Views (`utils/queries/kpi_queries/`)

All KPI views follow the same CTE pattern:
1. `cte_date` — generates a monthly date series from the org's baseline year/month to current month using `generate_series`
2. `cte_period` — enriches each date with year, month, quarter (Indian financial year: Apr–Mar), financial_year (Jan–Mar belong to prior year)
3. Main SELECT — LEFT JOINs KPI table rows onto the date spine, enriched with org/region/location names

[QA: All KPI views hard-code the organisation UUID `cfe37694-341f-4ff7-afe4-97e0e77eaf7e` in subqueries for `Baselineyear` and `FinancialYearMonth`. This makes the views single-tenant and non-reusable across organisations without modification.]

---

### `view_overall_emission_from_kpi_main`
**Source table:** `KPIMain`

**Purpose:** Master emission view. Produces one row per (date × org × address) covering all months from baseline to current with emission totals and intensity metrics.

**Key output columns:** `total_emission`, `scope1`, `scope2`, `scope3`, `per_tonne_production`, `per_employee`, `per_product`, `financial_year`, `financial_year_new` (format: `"2024-25"`), `quarter` (format: `"Q1 - 2024"`).

**Financial year logic:** Months 1–3 (Jan–Mar) belong to `financial_year = year - 1`. Quarter offsets by 3 months (`date - '3 mons'`).

---

### `view_total_fuel_consumption`
**Source table:** `KPIEnergy`

**Purpose:** Aggregates total Diesel fuel quantity per (org, address, region, month, year). Filters: `source = 'fuel_purchased'`, `purpose = 'general'`, `resource = 'Diesel'`.

[QA: Only Diesel is included. Other fuel types (petrol, CNG, LPG) are excluded from this view. May undercount total fuel consumption.]

---

### `view_total_electricity_consumption`
**Source table:** `KPIEnergy`

**Purpose:** Aggregates total electricity consumed (captive + grid) per (org, address, region, month, year). Filter: `source = 'captive'` OR (`energy_resource_type = '' AND source = 'grid'`).

[QA: The `energy_resource_type = ''` condition means only blank/empty resource type grid rows are counted. This may be fragile if the field is populated differently in different records. Also: output column named `total_clectricity_consumption` — typo for `electricity`.]

---

### `view_electricity_consumption_renewable_vs_non_reneweable`
**Source table:** `KPIEnergy`

**Purpose:** Splits electricity consumption by renewable vs non-renewable and by source/contract type. Excludes `nonrenewable AND ppa` combinations (PPA is treated as renewable).

**Output columns:** `energy_resource_type` (display: `"Renewable"` | `"Non-Renewable"`), `source` (title-cased), `contract_type` (`"Captive"` for captive sources, else uppercased).

[QA: View name contains typo `non_reneweable`.]

---

### `View_KPI_Water_Consumption`
**Source table:** `KPIWaterConsumption`

**Purpose:** Water consumption per (org, address, region, month, year) with city and state enrichment via `cte_address` CTE.

**Output:** `total_fresh_water_consumption`, `total_waste_water_consumption`, `total_harvested_water_consumption`, `total_water_consumption_uom`.

---

### `View_KPI_Waste_Management`
**Source table:** `KPIWasteManagement`

**Purpose:** Waste data per (org, address, region, month, year) with city, state, and financial year enrichment.

**Output:** `kpi_waste_generated_type`, `kpi_waste_disposal_mechanism`, `kpi_waste_quantity`.

---

### `view_global_filters`
**Source:** UNION ALL of all 12 KPI tables.

**Purpose:** Produces the distinct set of (organization, address, region, year, month) combinations that have any KPI data. Used to populate filter dropdowns (available years, months with data per location) in the dashboard and data-log-summary.

**Output:** `organization_id`, `address_id`, `region_id`, `organization_name`, `region_name`, `location_name`, `year`, `month`, `month_name`, `financial_year` (format: `"2024-25"`).

[QA: DISTINCT UNION ALL over 12 large tables can be expensive. No index applies to views. Consider materialising for performance on large datasets.]

---

## Drizzle Migrations

| File | Description |
|---|---|
| `utils/drizzle/0000_fair_young_avengers.sql` | Initial schema: creates the 5 OPS DB tables |
| `utils/drizzle/0001_activity_task_request_status.sql` | Adds `status` column to activity task request table |

---

## Financial Year Logic (shared across all views)

All views apply the same CTE pattern to generate a date spine and classify dates into financial years. April–December belong to the current financial year; January–March belong to the previous financial year (i.e. India's April–March financial year convention).

```sql
-- Q1/Q2/Q3 quarters shift by 1: months 1-3 belong to prior FY
CASE
  WHEN EXTRACT(month FROM date) = ANY (ARRAY[1, 2, 3])
    THEN EXTRACT(year FROM date) - 1
  ELSE EXTRACT(year FROM date)
END AS financial_year
```

Financial year label format: `2023-24`, `2024-25` (computed as `FY || '-' || (FY+1) % 100`).

---

## KPI Tables Referenced

| Table | Contents |
|---|---|
| `KPIMain` | Aggregate emission totals per org/location/month: `kpi_em_Total_Emission`, `kpi_em_Total_Emission_Scope1/2/3`, intensity metrics |
| `KPIEnergy` | Energy consumption per org/location/month: fuel, grid, captive; `kpi_generated_units`, `energy_resource_type`, `source`, `contract_type` |
| `KPIWasteManagement` | Waste data per org/location/month: type, disposal mechanism, quantity |
| `KPIWaterConsumption` | Water data per org/location/month: fresh, waste, harvested, total UOM |
| `KPIEmissionByFuelConsumption` | Emissions broken down by fuel type |
| `KPIEmissionByMaterialConsumption` | Emissions from material consumption |
| `KPIEmissionByMaterialConsumption_Suppliers` | Same, attributed to suppliers |
| `KPIEmissionByPowerConsumption` | Emissions from electricity consumption |
| `KPIEmissionByPowerConsumption_Vendors` | Same, attributed to vendors |
| `KPIEmissionByProducts` | Emissions attributed to products |
| `KPIEmissionByTransportation` | Emissions from transport activity |
| `KPIEmissionByWasteGeneration` | Emissions from waste generation |

Supporting lookup tables: `Organization`, `Region`, `OrganizationAddress`, `Addresses`, `City`, `State`

---

## View: `view_overall_emission_from_kpi_main`

**File:** `utils/queries/kpi_queries/view_overall_emission_from_kpi_main.sql`

**Purpose:** Primary GHG dashboard view. Returns total and scoped emissions plus intensity metrics per organisation/location/month, enriched with date dimension (financial year, quarter, month name).

**Source table:** `KPIMain` joined to `Region`, `Organization`, `OrganizationAddress`, `Addresses`

**Key output columns:**

| Column | Description |
|---|---|
| `date` | Month date (first of month) |
| `year` / `financial_year` / `quarter` | Date dimensions |
| `financial_year_new` | Label format `YYYY-YY` |
| `organization_id` / `organization_name` | Tenant |
| `address_id` / `location_name` / `location_type` | Location |
| `region_id` / `region_name` | Region |
| `total_emissions_from_energy` | `kpi_em_Cont_TotalEmission_Categories_Energy` |
| `total_emission` | All scopes combined |
| `scope1` / `scope2` / `scope3` | GHG Protocol scope breakdown |
| `per_tonne_production` | Intensity: tCO2e per tonne produced |
| `per_employee` | Intensity: tCO2e per employee |
| `per_product` | Intensity: tCO2e per product |
| `kpi_em_CurrentEmissionIntensity_Scope1_Scope2_PerProduct` | Scope 1+2 intensity per product |
| `kpi_em_CurrentEmissionIntensity_Scope3_PerProduct` | Scope 3 intensity per product |

**Used by:** GHG dashboard parallel route slots (`@ghg_snapshot_org`, `@emission_intensity_insight_block`, etc.)

---

## View: `view_global_filters`

**File:** `utils/queries/kpi_queries/view_global_filters.sql`

**Purpose:** Generates the available filter options for the dashboard and data-log-summary UI. UNIONs all KPI tables to find which org/location/year/month combinations actually have data.

**Sources (UNIONed):** `KPIMain`, `KPIEmissionByFuelConsumption`, `KPIEmissionByMaterialConsumption`, `KPIEmissionByMaterialConsumption_Suppliers`, `KPIEmissionByPowerConsumption`, `KPIEmissionByPowerConsumption_Vendors`, `KPIEmissionByProducts`, `KPIEmissionByTransportation`, `KPIEmissionByWasteGeneration`, `KPIEnergy`, `KPIWasteManagement`, `KPIWaterConsumption`

**Key output columns:**

| Column | Description |
|---|---|
| `organization_id` / `organization_name` | Tenant |
| `address_id` / `location_name` | Location |
| `region_id` / `region_name` | Region |
| `year` / `month` / `month_name` | Calendar period |
| `financial_year` | FY label `YYYY-YY` |

**Used by:** `GET /api/v1/monthly-activity-summary/filters` to populate year/month/location dropdowns

---

## View: `view_total_fuel_consumption`

**File:** `utils/queries/kpi_queries/view_total_fuel_consumption.sql`

**Purpose:** Aggregates total Diesel fuel consumption per org/location/month from `KPIEnergy`. Uses a `CROSS JOIN` on distinct org/location combinations with the date spine to ensure every period appears (even if zero), preventing gaps in charts.

**Filter:** `source = 'fuel_purchased'` AND `purpose = 'general'` AND `resource = 'Diesel'`

**Key output columns:** `date`, `year`, `financial_year`, `organization_id/name`, `address_id/location_name`, `region_id/name`, `total_fuel_consumption` (sum of `quantity`, defaulting to 0 via COALESCE)

**[QA]** Only captures Diesel. Other fuel types (CNG, LPG, petrol) are excluded by the `resource = 'Diesel'` filter.

---

## View: `view_total_electricity_consumption`

**File:** `utils/queries/kpi_queries/view_total_electricity_consumption.sql`

**Purpose:** Total electricity consumed (captive + grid) per org/location/month.

**Filter:** `source = 'captive'` OR (`energy_resource_type = ''` AND `source = 'grid'`)

**[QA]** The grid filter `energy_resource_type = ''` (empty string) may miss grid records with a non-empty resource type. Combined with the captive filter, this may undercount total electricity.

**Key output:** `total_clectricity_consumption` — note the typo in the column name (`clectricity` vs `electricity`). **[QA: typo in output column name — downstream consumers must match this exact spelling.**]

---

## View: `view_electricity_consumption_renewable_vs_non_reneweable`

**File:** `utils/queries/kpi_queries/view_electricity_consumption_renewable_vs_non_reneweable.sql`

**Purpose:** Splits electricity consumption by renewable vs. non-renewable and by source (captive/grid) and contract type (e.g. PPA, open access).

**Key logic:**
- Excludes PPA non-renewable records: `NOT (energy_resource_type = 'nonrenewable' AND contract_type = 'ppa')`
- Normalises `energy_resource_type` to display labels (`'nonrenewable'` → `'Non-Renewable'`, `'renewable'` → `'Renewable'`)
- Normalises source to `'Captive'` for captive entries, otherwise uppercases `contract_type`

**Key output:** `consumption` (=`kpi_generated_units`), `energy_resource_type`, `source`, `contract_type`

**[QA]** View name has typo: `reneweable` should be `renewable`.

---

## View: `View_KPI_Waste_Management`

**File:** `utils/queries/kpi_queries/View_KPI_Waste_Management.sql`

**Purpose:** Waste data per org/location/month enriched with city/state geography.

**Source:** `KPIWasteManagement` joined to `Organization`, `Region`, `OrganizationAddress`, `Addresses`, `City`, `State`

**Key output columns:** `kpi_waste_generated_type`, `kpi_waste_disposal_mechanism`, `kpi_waste_quantity`, `city_name`, `state_name`, `location_address`, `financial_year_new`

**Used by:** Waste KPI dashboard panel

---

## View: `View_KPI_Water_Consumption`

**File:** `utils/queries/kpi_queries/View_KPI_Water_Consumption.sql`

**Purpose:** Water consumption data per org/location/month with city/state geography.

**Source:** `KPIWaterConsumption` joined to `Organization`, `Region`, `OrganizationAddress`, `Addresses`, `City`, `State`

**Key output columns:** `total_fresh_water_consumption`, `total_waste_water_consumption`, `total_harvested_water_consumption`, `total_water_consumption_uom`, `city_name`, `state_name`

**Used by:** Water KPI dashboard panel

---

## Drizzle ORM Schema (`utils/drizzle/schema.ts`)

Secondary database tables managed directly (not through Hasura):

| Table | Purpose |
|---|---|
| `Organizations` | Organisation master (Drizzle primary — org profile, financial year settings, baseline year) |
| `SupplierInvitations` | Supplier invitation records (email, status, token) |
| `EmailTemplates` | Email template definitions (type, subject, body, cc/bcc) |
| `GlobalConfigs` | Key/value config store per organisation |
| `BuyerSupplierAddressMappings` | Maps buyer address to supplier address for PCF attribution |

These tables require manual `WHERE org_id = ?` filters on every query — no automatic tenant scoping.
