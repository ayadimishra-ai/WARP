# Activity → GHG / ESG Table Architecture

This document is derived directly from `local/DB/ops-db-tables.sql` and covers every GHG/ESG table in the database, their join patterns, complete column sets (input data + computed KPI columns), and how they connect to the activity/reporting framework.

---

## 1. Core Framework Tables

These four tables form the backbone that every GHG/ESG row hangs off.

### `TaskRequest`
One row per reporting period at one location. Unique on `(organization_address_id, month, year)`.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_address_id | uuid | FK → OrganizationAddress |
| month | text | e.g. `"march"` |
| year | int4 | e.g. `2025` |
| status | text | not used for approval; use ATR status |
| is_deleted | bool | soft-delete |

### `ActivityTaskRequest` (ATR)
One row per Excel upload (one activity at one location for one reporting period). This is the **authoritative status record**.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_address_id | uuid | FK → OrganizationAddress |
| activity_id | uuid | FK → Activity |
| task_request_id | uuid | FK → TaskRequest |
| status | text | `NULL` / `'pending'` / `'saved'` = Pending; `'approved'` = Approved |
| is_deleted | bool | `true` when a re-upload has superseded this submission |

### `Activity`
Master list of activities. `UNIQUE` constraint on `code`.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| name | text | Display name |
| code | text UNIQUE | e.g. `energy_grid_power`, `fugitive_details` |
| parent_code | text NULL | e.g. `energy` for `energy_grid_power`; NULL for root |
| is_master | bool | `true` = master/template activity, excluded from queries |
| is_AI_enabled | bool | AI extraction capability flag |

`COALESCE(act.parent_code, act.code)` always resolves to the OAM root code.

### `OrganizationActivityMapping` (OAM)
Controls which activities are enabled for an organization.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid | FK → Organization |
| activity_id | uuid | FK → Activity (points at root activity) |
| is_deleted | bool | |

### `OrganizationAddress`
One row per facility/location belonging to an organization.

| Column | Type | Notes |
|---|---|---|
| id | uuid PK | |
| organization_id | uuid | FK → Organization |
| address_id | uuid | FK → Addresses |
| is_deleted | bool | |

---

## 2. Join Patterns

Every GHG/ESG row joins back to ATR and TaskRequest in one of two ways.

### DIRECT pattern
The GHG table itself carries `task_request_id`, `activity_task_request_id`, `organization_address_id`.

```sql
FROM "GHGTable" ghg
JOIN "TaskRequest"         tr  ON tr.id  = ghg.task_request_id
JOIN "ActivityTaskRequest" atr ON atr.id = ghg.activity_task_request_id
JOIN "Activity"            act ON act.code = ghg.activity_code  -- or via atr.activity_id
JOIN "OrganizationAddress" oa  ON oa.id  = ghg.organization_address_id
```

### CHILD pattern
The child table carries only a FK to its parent GHG row. The parent holds the three FK columns.

```sql
FROM "ChildTable"  child
JOIN "ParentTable" ghg   ON ghg.id = child."ParentTable_id"
JOIN "TaskRequest"         tr  ON tr.id  = ghg.task_request_id
JOIN "ActivityTaskRequest" atr ON atr.id = ghg.activity_task_request_id
JOIN "OrganizationAddress" oa  ON oa.id  = ghg.organization_address_id
```

**Note on ESG tables:** All ESG tables are DIRECT but have **no `status` column**. Approval state is always read from `atr.status`.

---

## 3. Column Convention

- `kpi_em_*` — computed emission amount (tCO₂e) populated by the emission calculation engine after upload
- `kpi_emf_*` — emission factor applied
- `kpi_*` (without `em`) — intermediate computed quantity (e.g. distance in standard UOM, weight in kg, litres)
- All tables share: `created_at`, `updated_at`, `created_by`, `updated_by`

---

## 4. GHG Activities

### 4.1 Energy  `OAM code: energy`

Three child activities, each with its own table structure.

---

#### 4.1.1 `energy_grid_power`

**`GHGEnergyConsumption_GridPower`** — DIRECT, 1 row per upload

FK columns: `task_request_id`, `organization_address_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Name_of_Distribution_Company | Grid power provider name |
| PowerConsumed_through_Grid_Kwh | Units consumed from the grid |
| PowerPurchased_through_PPA_Kwh_Renewable | PPA renewable units |
| NameOfCompany_PPA_Renewable | PPA renewable provider |
| PowerPurchased_through_PPA_Kwh_NonRenewable | PPA non-renewable units |
| NameOfCompany_PPA_NonRenewable | PPA non-renewable provider |
| PowerPurchased_through_REC_Kwh | REC (Renewable Energy Certificate) units |
| Name_of_company_for_REC | REC provider |
| kpi_em_Emission_PowerPurchased_PPA_Renewable | Emission from PPA renewable |
| kpi_emf_Emission_PowerPurchased_PPA_Renewable | Emission factor for PPA renewable |
| kpi_em_Emission_PowerPurchased_REC | Emission from REC |
| kpi_emf_Emission_PowerPurchased_REC | Emission factor for REC |
| kpi_em_Emission_PowerPurchased_RenewableSources | Total renewable emission |
| kpi_emf_Emission_PowerPurchased_RenewableSources | Emission factor for renewables |
| kpi_em_Emission_PowerPurchased_NonRenewableSources | Non-renewable emission |
| kpi_emf_Emission_PowerPurchased_NonRenewableSources | Emission factor non-renewable |
| kpi_em_Emission_TotalPowerPurchased | Total grid power emission |
| kpi_em_Emission_PowerPurchased_PPA_NonRenewable | Emission from PPA non-renewable |
| kpi_emf_Emission_PowerPurchased_PPA_NonRenewable | Emission factor PPA non-renewable |
| kpi_em_Scope3_Category3 | Scope 3 Cat 3 (energy indirect) |
| kpi_emf_Scope3_Category3 | Emission factor for Scope 3 Cat 3 |

---

#### 4.1.2 `energy_fuel_purchased`

**`GHGEnergyConsumption_FuelPurchased`** — PARENT (FK shell only), 1 row per upload

FK columns: `task_request_id`, `organization_address_id`, `activity_task_request_id`
No data columns. Exists solely as the anchor for child rows.

---

**`GHGEnergyConsumption_FuelPurchased_General`** — CHILD, N rows

FK: `GHGEnergyConsumption_FuelPurchased_id` → parent

| Column | Description |
|---|---|
| Type_of_Fuel_Purchased | Fuel type (Diesel, LPG, CNG, etc.) |
| Quantity_of_fuel_Consumed | Amount consumed |
| Quantity_of_fuel_Consumed_uom | Unit of measure |
| Quality_of_fuel | Calorific value / quality metric |
| Point_of_Consumption | Where fuel is consumed |
| kpi_em_Emission_QuantityOfFuelConsumed | Computed emission |
| kpi_emf_Emission_QuantityOfFuelConsumed | Emission factor |
| kpi_em_Scope3_Category3 | Scope 3 Cat 3 contribution |
| kpi_emf_Scope3_Category3 | Emission factor for Scope 3 |

---

**`GHGEnergyConsumption_FuelPurchased_HeatingWater`** — CHILD, N rows

FK: `GHGEnergyConsumption_FuelPurchased_id` → parent

| Column | Description |
|---|---|
| Type_of_Fuel_Purchased | Fuel type for heating/hot water |
| Quality_of_fuel | Calorific value |
| Used_for_Which_SKUs | Which products this fuel serves |
| Quantity_of_fuel_consumed | Amount consumed |
| Quantity_of_fuel_consumed_uom | Unit of measure |
| kpi_em_Emission_QuantityOfFuelConsumed | Computed emission |
| kpi_emf_Emission_QuantityOfFuelConsumed | Emission factor |

---

**`GHGEnergyConsumption_FuelPurchased_Auxiliary`** — CHILD, N rows

FK: `GHGEnergyConsumption_FuelPurchased_id` → parent

| Column | Description |
|---|---|
| Type_of_Auxiliary_Fuel_Purchased | Auxiliary fuel type |
| Used_for_Which_SKUs | Which products this fuel serves |
| Quantity_of_fuel_consumed | Amount consumed |
| Quantity_of_fuel_consumed_uom | Unit of measure |
| kpi_em_Emission_QuantityOfFuelConsumed | Computed emission |
| kpi_emf_Emission_QuantityOfFuelConsumed | Emission factor |

---

**`GHGEnergyConsumption_FuelPurchased_Transportation`** — DIRECT (own FKs), N rows

FK columns: `task_request_id`, `organization_address_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Vehicle_Type_Used_for_Road_Transport | Vehicle category |
| Type_of_Fuel_Purchased | Fuel type |
| Quantity_of_fuel_purchased | Fuel amount |
| UoM_for_fuel_purchased | Unit of measure |
| Distance_travelled | Distance covered |
| Transportation_Type | e.g. Internal, Third-party |
| kpi_emf_Transport_Scope1 | Emission factor (Scope 1) |
| kpi_em_Transport_Scope1 | Computed Scope 1 emission |

---

#### 4.1.3 `energy_captive_power`

**`GHGEnergy_CaptivePower`** — PARENT (minimal data), 1 row per upload

FK columns: `organization_address_id`, `task_request_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Do_You_Generate_Captive_Power_for_Own_Use | Yes/No |
| Type_of_Captive_Power | Renewable / Non-Renewable / Both |

---

**`GHGEnergy_CaptivePower_Renewable`** — CHILD, N rows

FK: `GHGEnergyConsumption_CaptivePower_id` → parent

| Column | Description |
|---|---|
| Type_of_Technology_Used | Solar, Wind, Hydro, etc. |
| Year_of_installation | Install year |
| Unit_of_Energy_Generated_in_Kwh | Generated units |
| kpi_em_Emission_EnergyGenerated_kwh | Computed emission |
| kpi_emf_Emission_EnergyGenerated_kwh | Emission factor |

---

**`GHGEnergy_CaptivePower_NonRenewable`** — CHILD, N rows

FK: `GHGEnergyConsumption_CaptivePower_id` → parent

| Column | Description |
|---|---|
| Type_of_Fuel_Used | Fuel type (Diesel, Coal, etc.) |
| Quantity_of_fuel_consumed | Fuel consumed |
| Quantity_of_fuel_consumed_uom | Unit of measure |
| Quality_of_fuel | Calorific value |
| Unit_of_Energy_Generated_in_Kwh | Generated units |
| kpi_em_Emission_EnergyGenerated_kwh | Computed emission |
| kpi_emf_Emission_EnergyGenerated_kwh | Emission factor |

---

**`GHGEnergy_CaptivePower_Renewable_Fuel`** — CHILD, N rows

FK: `GHGEnergyConsumption_CaptivePower_id` → parent

| Column | Description |
|---|---|
| Type_of_Fuel_Used | Bio-fuel type (Biomass, Biogas, etc.) |
| Quantity_of_fuel_consumed | Fuel consumed |
| Quantity_of_fuel_consumed_uom | Unit of measure |
| Quality_of_fuel | Calorific value |
| Unit_of_Energy_Generated_in_Kwh | Generated units |
| kpi_em_Emission_EnergyGenerated_kwh | Computed emission |
| kpi_emf_Emission_EnergyGenerated_kwh | Emission factor |

---

### 4.2 Transport  `OAM code: transport`

Four independent DIRECT tables. All share the same FK pattern.

FK columns (all four): `task_request_id`, `organization_address_id`, `activity_task_request_id`

---

#### `GHGTransport_Upstream` — `transport_upstream`

| Column | Description |
|---|---|
| Material_Procured | Material name |
| Material_ID | Material identifier |
| Supplier_Status | On-boarded / Third-party |
| Third_Party_Suppliers_of_Material | Supplier name |
| Supplier_code | Supplier code |
| Locations_Procured_From | Procurement location |
| Location_pin_or_zip_code | Pincode |
| Transport_Managed_by | Managed by whom |
| Mode_of_Transport | Road, Rail, Air, Water |
| Vehicle_Type_Used_for_Road_Transport | Vehicle category |
| Fuel_Used | Fuel type |
| Material_Quantity_Procured | Quantity |
| Material_Quantity_Procured_uom | Unit |
| Distance_per_Trip | Per-trip distance |
| Distance_per_Trip_uom | Distance unit |
| Number_of_Trips | Trip count |
| Quantity_of_Fuel_Consumed | Fuel consumed |
| Quantity_of_Fuel_Consumed_uom | Fuel unit |
| total_distance_travelled_in_kilometers | Pre-calculated total distance |
| total_distance_travelled | Alternative total distance field |
| total_distance_travelled_uom | Unit |
| Destination_Location_Country | Destination country |
| Destination_Location_Pincode | Destination pincode |
| kpi_Distance_Travelled | Calculated distance |
| kpi_Distance_Travelled_uom | Distance unit |
| kpi_em_EmissionBy_TravelledDistance | Total transport emission |
| kpi_emf_EmissionBy_TravelledDistance | Transport emission factor |
| kpi_em_EmissionBy_MaterialProcured | Material embodied emission |
| kpi_emf_EmissionBy_MaterialProcured | Material emission factor |
| kpi_em/emf_EmissionBy_Transport_Rail | Rail mode emissions |
| kpi_em/emf_EmissionBy_Transport_Air | Air mode emissions |
| kpi_em/emf_EmissionBy_Transport_Water | Water mode emissions |
| kpi_em/emf_EmissionBy_Transport_Road | Road mode emissions |
| kpi_em_EmissionBy_Transport | Total transport emission |
| kpi_em_EmissionBy_Transport_scope3 | Scope 3 portion |
| kpi_em_EmissionBy_Transport_scope1 | Scope 1 portion |
| kpi_emf_EmissionBy_Transport | Overall emission factor |

---

#### `GHGTransport_Downstream` — `transport_downstream`

| Column | Description |
|---|---|
| Which_Products | Product line |
| Which_SKUs | SKU identifier |
| Destination_Location_Name | Delivery destination |
| Destination_pin_or_zip_code | Pincode |
| Transport_Managed_by | Managed by |
| Mode_of_Transport | Road, Rail, Air, Water |
| Vehicle_Type_Used_for_Road_Transport | Vehicle category |
| Fuel_Used | Fuel type |
| Distance_per_trip | Per-trip distance |
| Distance_per_trip_UoM | Distance unit |
| Quantity_of_Fuel_Consumed | Fuel consumed |
| Quantity_of_Fuel_Consumed_UoM | Fuel unit |
| Number_of_Trips | Trip count |
| Number_of_Skus_Transported | SKU count |
| Total_Weight_of_SKUs | Total SKU weight |
| Total_sku_weight | Alternate weight field |
| supplier_code | Supplier code |
| quantity_dispatched | Quantity dispatched |
| quantity_dispatched_uom | Dispatch unit |
| total_distance_travelled | Pre-calculated total |
| total_distance_travelled_uom | Distance unit |
| distributed_from_country | Origin country |
| distributed_from_location_pincode | Origin pincode |
| distributed_to_country | Destination country |
| distributed_to_location_pincode | Destination pincode |
| kpi_Distance_Travelled | Calculated distance |
| kpi_em/emf_EmissionBy_TravelledDistance | Travel emission/factor |
| kpi_em/emf_EmissionBy_Transport_Rail/Air/Water/Road | Mode-wise emissions |
| kpi_em_EmissionBy_Transport | Total |
| kpi_em_EmissionBy_Transport_scope3 | Scope 3 |
| kpi_em_EmissionBy_Transport_scope1 | Scope 1 |
| kpi_total_weight_transported | Calculated total weight |
| kpi_total_weight_transported_uom | Weight unit |
| kpi_emf_EmissionBy_Transport | Emission factor |

---

#### `GHGTransport_EmployeeTravel` — `transport_employee_travel`

One row per upload. Uses percentage-based inputs per commute mode.

| Column | Description |
|---|---|
| PercOfEmp_TravBy_CompOwned_Bus | % employees on company bus |
| AvgDailyDist_TravBy_CompOwned_Bus | Avg daily km |
| PercOfEmp_TravBy_PublicTrans_or_CompContracted_Bus | % on public/contracted bus |
| AvgDailyDist_TravBy_PubTrans_or_CompContracted_Bus | Avg daily km |
| PercOfEmp_TravBy_PublicTrans_4Wheeler | % on 4-wheeler public transport |
| AvgDailyDist_TravBy_PubTrans_4Wheeler | Avg daily km |
| PercOfEmp_TravBy_PublicTrans_3Wheeler | % on 3-wheeler (auto-rickshaw) |
| AvgDailyDist_TravBy_PubTrans_3Wheeler | Avg daily km |
| PercOfEmp_TravBy_PvtVehicle_4Wheeler | % using own 4-wheeler |
| AvgDailyDist_TravBy_PvtVehicle_4Wheeler | Avg daily km |
| PercOfEmp_TravBy_PvtVehicle_2Wheeler | % using own 2-wheeler |
| AvgDailyDist_TravBy_PvtVehicle_2Wheeler | Avg daily km |
| PercOfEmp_TravBy_RailSuburban | % using suburban rail |
| AvgDailyDist_TravBy_RailSuburban | Avg daily km |
| kpi_NoOf_Emp_TravBy_* | Calculated employee count per mode |
| kpi_TotalDist_TravBy_* | Total distance per mode |
| kpi_em/emf_Emp_TravBy_* | Emission/factor per mode |
| kpi_em_EmissionBy_Travel | Total travel emission |
| kpi_em_EmissionBy_Travel_Scope1 | Scope 1 (company-owned buses) |
| kpi_em_EmissionBy_Travel_Scope3 | Scope 3 (all others) |

---

#### `GHGTransport_BusinessTravel` — `transport_business_travel`

| Column | Description |
|---|---|
| Mode_of_Transport | Road, Rail, Air |
| Vehicle_Type_Used_for_Road_Transport | Vehicle category |
| Fuel_Used | Fuel type |
| Distance_per_Trip | Per-trip distance |
| Distance_per_Trip_UoM | Distance unit |
| Number_of_Trips | Trip count |
| Trip_From_Pincode | Origin pincode |
| Trip_To_Pincode | Destination pincode |
| Trip_From_Country | Origin country |
| Trip_To_Country | Destination country |
| Trip_Distance | Direct trip distance |
| Trip_No_of_Employees_Travelled | Headcount |
| kpi_Distance_Travelled | Calculated distance |
| kpi_em/emf_EmissionBy_TravelledDistance | Travel emission/factor |
| kpi_em/emf_EmissionBy_Travel_Road_Bus | Road-bus emissions |
| kpi_em/emf_EmissionBy_Travel_Road_OtherThanBus | Road non-bus emissions |
| kpi_em/emf_EmissionBy_Travel_Rail | Rail emissions |
| kpi_em/emf_EmissionBy_Travel_Air | Air emissions |
| kpi_em_EmissionBy_Travel_Scope3 | Scope 3 total |

---

### 4.3 Water  `OAM code: water`

Four sub-activities, each with one or more DIRECT tables.

FK columns (all water tables): `task_request_id`, `organization_address_id`, `activity_task_request_id`

---

#### Sub-activity: `water_consumption`

**`GHGFreshWater`**

| Column | Description |
|---|---|
| total_fresh_water_used_for_domestic_use | Volume for domestic use |
| total_fresh_water_used_for_industrial_use | Volume for industrial use |
| total_fresh_water_used_for_landscaping | Volume for landscaping |
| total_fresh_water_used_for_miscellaneous_uses | Volume for misc uses |
| uom_freshwater | Unit of measure |
| kpi_total_domestic_use_litres | Normalised to litres |
| kpi_total_industrial_use_litres | Normalised |
| kpi_total_landscaping_use_litres | Normalised |
| kpi_total_miscellaneous_use_litres | Normalised |

**`GHGWasteWater`** (treated effluent reuse, not wastewater generation)

| Column | Description |
|---|---|
| total_treated_effluent_reused_for_domestic_use | Volume reused |
| total_treated_effluent_reused_for_industrial_use | Volume reused |
| total_treated_effluent_reused_for_landscaping | Volume reused |
| total_treated_effluent_used_for_miscellaneous_uses | Volume reused |
| uom_treated_effluent | Unit of measure |
| kpi_total_domestic_use_litres | Normalised |
| kpi_total_industrial_use_litres | Normalised |
| kpi_total_landscaping_use_litres | Normalised |
| kpi_total_miscellaneous_use_litres | Normalised |

**`GHGHarvestedWater`**

| Column | Description |
|---|---|
| total_harvested_water_used_for_domestic_use | Volume |
| total_harvested_water_used_for_industrial_use | Volume |
| total_harvested_water_used_for_landscaping | Volume |
| total_harvested_water_used_for_miscellaneous_uses | Volume |
| uom_harvested_water | Unit of measure |
| kpi_total_domestic_use_litres | Normalised |
| kpi_total_industrial_use_litres | Normalised |
| kpi_total_landscaping_use_litres | Normalised |
| kpi_total_miscellaneous_use_litres | Normalised |

---

#### Sub-activity: `wastewater_generation`

**`GHGWastewaterGeneration`**

| Column | Description |
|---|---|
| total_wastewater_generated_from_industrial_use | Volume |
| total_wastewater_generated_from_domestic_use | Volume |
| point_of_wastewater_disposal_Applicable | Disposal point |
| uom_wastewater | Unit of measure |
| kpi_total_wastewater_generated_domestic_use_litres | Normalised |
| kpi_total_wastewater_generated_industrial_use_litres | Normalised |

---

#### Sub-activity: `water_withdrawal`

**`GHGWaterWithdrawal`**

| Column | Description |
|---|---|
| total_fresh_water_withdrawal | Volume withdrawn |
| uom_freshwater | Unit of measure |
| source_of_fresh_water | Surface water, Groundwater, etc. |
| kpi_total_fresh_water_withdrawal_litres | Normalised |

---

#### Sub-activity: `waste_water_treatment`

**`GHGWasteWaterTreatment`** (active table)

| Column | Description |
|---|---|
| total_influent | Total inflow volume |
| total_treated_effluent | Total treated volume |
| uom_influent_effluent | Unit of measure |
| influent_bod_concentration | BOD in influent |
| treated_effluent_bod_concentration | BOD after treatment |
| uom_bod | BOD unit |
| influent_cod_concentration | COD in influent |
| treated_effluent_cod_concentration | COD after treatment |
| uom_cod | COD unit |
| kpi_total_influent_litres | Normalised influent |
| kpi_total_treated_effluent_litres | Normalised treated |
| kpi_influent_bod_concentration_mgl | Normalised BOD (mg/L) |
| kpi_treated_effluent_bod_concentration_mgl | Normalised treated BOD |
| kpi_influent_cod_concentration_mgl | Normalised COD (mg/L) |
| kpi_treated_effluent_cod_concentration_mgl | Normalised treated COD |

**`GHGEffluentDischarge`**

| Column | Description |
|---|---|
| total_effluent_disposed_off | Total effluent disposed |
| uom_effluent | Unit |
| point_of_discharge | Discharge point |
| qty_effluent_disposed_off | Quantity |
| qty_sludge_disposed_off | Sludge disposed |
| qty_sludge_generated | Sludge generated |
| effluent_disposed_off_umo | Effluent unit |
| sludge_disposed_off_umo | Sludge disposed unit |
| sludge_generated_umo | Sludge generated unit |
| kpi_total_effluent_disposed_off_litres | Normalised litres |

**`GHGSludgeDisposal`**

| Column | Description |
|---|---|
| total_sludge_disposed_off | Volume |
| uom_sludge_disposed_off | Unit |
| point_of_sludge_disposal | Disposal location/method |
| kpi_total_sludge_disposed_off_litres | Normalised litres |
| kpi_total_sludge_disposed_off_kg | Normalised kg |

---

### 4.4 Fugitive  `OAM code: fugitive`  `Activity.code: fugitive_details`

Three DIRECT tables. FK columns on all: `task_request_id`, `organization_address_id`, `activity_task_request_id`

**`GHGRefrigerantAndACSystems`**

| Column | Description |
|---|---|
| type_of_refrigerant_used | Refrigerant type (R22, R410A, etc.) |
| quantity_of_refrigerant_filled | Amount filled/charged |
| uom_refrigerant_and_ac_systems | Unit |
| kpi_em_refrigerant | Computed emission (tCO₂e) |
| kpi_emf_refrigerant | Emission factor |

**`GHGFireExtinguisher`**

| Column | Description |
|---|---|
| gas_used_in_fire_extinguisher | Gas type (CO₂, Halon, etc.) |
| quantity_of_gas_filled | Quantity |
| uom_fire_extinguisher | Unit |
| kpi_em_fire_extinguisher | Computed emission |
| kpi_emf_fire_extinguisher | Emission factor |

**`GHGIndustrialGas`**

| Column | Description |
|---|---|
| type_of_industrial_gas_used | Gas type (SF6, etc.) |
| quantity_of_industrial_gas_filled | Quantity |
| uom_industrial_gas | Unit |
| kpi_em_industrial_gas | Computed emission |
| kpi_emf_industrial_gas | Emission factor |

---

### 4.5 Waste  `OAM code: waste`  `Activity.code: waste`

**`GHGWaste`** — DIRECT

FK columns: `task_request_id`, `organization_address_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Types_of_Waste_Generated | Hazardous / Non-hazardous / E-waste etc. |
| Waste_Disposal_Managed_by | Self / Third-party |
| Name_of_Third_Party | Third-party disposal company |
| Quantity_of_Waste | Amount |
| Quantity_of_Waste_UoM | Unit |
| Disposal_Mechanism | Landfill / Incineration / Recycling etc. |
| Location_of_Waste_Disposal | Disposal site |
| Location_pin_or_zip_code | Site pincode |
| Who_Managed_Transportation_of_Waste | Self / Third-party |
| Mode_of_Transport | Road, Rail, etc. |
| Vehicle_Type_Used_for_Road_Transport | Vehicle |
| Fuel_Used | Fuel type |
| DistOf_WasteDisposalLoction_from_FacilityLocation | Distance |
| DistOf_WasteDisposalLoction_from_FacilityLocation_UoM | Distance unit |
| kpi_DistanceTravlled_For_WasteManagement | Calculated distance |
| kpi_DistanceTravlled_For_WasteManagement_uom | Distance unit |
| kpi_em_EmissionBy_TransportFor_WasteManagement | Transport emission |
| kpi_emf_EmissionBy_TransportFor_WasteManagement | Transport emission factor |
| kpi_em_EmissionBy_Generation_of_Waste_Type | Waste generation emission |
| kpi_emf_EmissionBy_Generation_of_Waste_Type | Emission factor |
| kpi_em_EmissionBy_TransportFor_Waste_Scope3 | Scope 3 portion |
| kpi_em_EmissionBy_TransportFor_Waste_Scope1 | Scope 1 portion |

---

### 4.6 Production  `OAM code: production`  `Activity.code: production`

**`GHGProductionDetails`** — DIRECT

FK columns: `organization_address_id`, `task_request_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Products_Manufactured_This_Month | Product name |
| Product_ID | Product identifier |
| SKUs_Manufactured | SKU name |
| SKU_ID | SKU identifier |
| Units_Of_SKU_Manufactured | Units produced |
| Total_Weight | Total production weight |
| Perc_of_Total_Prod_Represents_Prod_Of_Org_SKU | % share of this SKU |
| Processes_Employed | jsonb — manufacturing processes |
| manufactured_product_code | Normalised product code |
| manufactured_sku_code | Normalised SKU code |

---

### 4.7 General  `OAM code: general`  `Activity.code: general`

**`GHGGeneralDetails`** — DIRECT

FK columns: `organization_address_id`, `task_request_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Location_Name | Facility name |
| Location_ID_Code | Facility code |
| Location_Pincode | Pincode |
| Location_Type | Manufacturing / Office / Warehouse etc. |
| Month_Year | Display string (e.g. "March 2025") |
| Number_Employees | Headcount |
| Number_Operational_Days | Working days in the month |

---

### 4.8 Buyer Share  `OAM code: buyer_share`  `Activity.code: buyer_share`

**`GHGBuyer_Share`** — DIRECT

FK columns: `organization_address_id`, `task_request_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Buyer_Name | Buyer organisation |
| Location_Code | Location identifier |
| method | Allocation method: by_mass / by_volume / by_revenue / by_number_of_units |
| by_mass_Mass_of_Products_Purchased | Mass procured by this buyer |
| by_mass_Total_Mass_of_Products_Produced | Total mass produced |
| by_mass_Mass_of_Products_Produced_UoM | Mass unit |
| by_volume_Volume_of_Products_Purchased | Volume procured |
| by_volume_Total_Volume_of_Products_Purchased | Total volume produced |
| by_volume_Volume_of_Products_Purchased_UoM | Volume unit |
| by_revenue_Market_Value_of_Products_Purchased | Revenue |
| by_revenue_Total_Market_Value_of_Products_Produced | Total revenue |
| by_revenue_Market_Value_of_Products_Purchased_UoM | Currency |
| by_number_of_units_Number_of_Units_Purchased | Units purchased |
| by_number_of_units_Total_Number_of_Units_Produced | Total units produced |

---

### 4.9 Material Procurement  `OAM code: material`  `Activity.code: material_procurement`

**`GHGMaterialProcurement`** — DIRECT

FK columns: `organization_address_id`, `task_request_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Material_Procured | Material name |
| Material_ID | Material identifier |
| Material_Code | Normalised code |
| Supplier_Code | Supplier code |
| Supplier_Status | On-boarded / Third-party |
| Third_Party_Suppliers_of_Material | Supplier name |
| Locations_Procured_From | Procurement location |
| Location_pin_or_zip_code | Pincode |
| Transport_Managed_by | Who manages transport |
| Mode_of_Transport | Road, Rail, Air, Water |
| Vehicle_Type_Used_for_Road_Transport | Vehicle category |
| Fuel_Used | Fuel type |
| Distance_per_Trip | Per-trip distance |
| Distance_per_Trip_uom | Distance unit |
| Number_of_Trips | Trip count |
| Material_Quantity_Procured | Quantity |
| Material_Quantity_Procured_uom | Unit |
| kpi_Distance_Travelled | Calculated total distance |
| kpi_Distance_Travelled_uom | Distance unit |
| kpi_material_weight_kg | Material weight in kg |
| kpi_em_EmissionBy_TravelledDistance | Transport emission |
| kpi_emf_EmissionBy_TravelledDistance | Transport emission factor |
| kpi_em_EmissionBy_MaterialProcured | Material embodied emission |
| kpi_emf_EmissionBy_MaterialProcured | Material emission factor |
| kpi_em/emf_EmissionBy_Transport_Rail/Air/Water/Road | Per-mode emissions |
| kpi_em_EmissionBy_Transport | Total transport emission |
| kpi_em_EmissionBy_Transport_scope3 | Scope 3 |
| kpi_em_EmissionBy_Transport_scope1 | Scope 1 |

---

### 4.10 Capital Goods  `OAM code: capitalgoods`  `Activity.code: capital_goods`

**`GHGCapital_Goods`** — DIRECT

FK columns: `organization_address_id`, `task_request_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Supplier_Code | Supplier code |
| Material_Code | Material code |
| Quantity_Procured | Quantity |
| Quantity_Procured_uom | Unit |
| kpi_material_weight_kg | Weight in kg |
| kpi_em_EmissionBy_CapitalGoods | Computed emission (tCO₂e) |
| kpi_emf_EmissionBy_CapitalGoods | Emission factor |

---

### 4.11 Product Share Allocation  `OAM code: product_share_allocation`  `Activity.code: product_share_allocation`

**`GHGProductShareAttribution`** — DIRECT

FK columns: `organization_address_id`, `task_request_id`, `activity_task_request_id`

| Column | Description |
|---|---|
| Material_Code | Material code |
| Material_Name | Material name |
| Material_Description | Description |
| SKU_Production_Percentage | % of facility production for this buyer/SKU |
| Rationale_For_Percentage | Explanation of allocation basis |
| Buyer_Name | Buyer organisation |
| is_deleted | Soft-delete |

---

## 5. ESG Activities

ESG tables are all DIRECT. They have **no `status` column** — approval is always read from `atr.status` (ActivityTaskRequest).

FK columns on all ESG tables: `task_request_id`, `organization_address_id`, `activity_task_request_id`

---

### 5.1 Human Resources  `OAM code: humanresources`  `Activity.code: human_resources`

**`ESGEmployeeDiversity`**

| Column | Description |
|---|---|
| employee_category | Senior Mgmt / Mid-level / Entry-level etc. |
| employment_type | Permanent / Contract / Trainee |
| male_employees | Count |
| female_employees | Count |
| other_gender_employees | Count |
| minority_group_employees | Count |
| employees_with_disabilities | Total with disabilities |
| male_employees_with_disabilities | Breakdown |
| female_employees_with_disabilities | Breakdown |
| other_gender_employees_with_disabilities | Breakdown |
| under_thirty_years_old | Count by age band |
| thirty_to_fifty_years_old | Count |
| above_fifty_years_old | Count |
| average_basic_salary_male | Average basic salary |
| average_basic_salary_female | Average basic salary |
| average_remuneration_male | Total remuneration |
| average_remuneration_female | Total remuneration |

**`ESGEmployeeTurnover`**

| Column | Description |
|---|---|
| employee_category | Category |
| employment_type | Type |
| total_employees | Headcount at period start |
| new_hires | Hires in the period |
| exits | Exits in the period |
| number_of_voluntary_exits | Voluntary exits |
| number_of_non_voluntary_exits | Involuntary exits |
| average_tenure_of_exiting_employees | Avg tenure (years) |

**`ESGTrainingHours`**

| Column | Description |
|---|---|
| employee_category | Category |
| employment_type | Type |
| total_employees | Headcount |
| number_of_employees_trained | Trained count |
| total_training_hours | Total hours |
| training_type | e.g. Safety, Leadership, Technical |
| percentage_employees_certified | % certified after training |

---

### 5.2 Health & Safety  `OAM code: healthandsafety`  `Activity.code: health_and_safety`

**`ESGHealthAndSafety`**

| Column | Description |
|---|---|
| workforce_category | Employees / Contractors / Workers |
| workforce_type | Direct / Indirect |
| total_workforce_covered | Total headcount |
| total_hours_worked | Hours in period |
| total_man_hours_worked | Alternate field (default 0) |
| fatalities_reported | Count |
| high_consequence_work_related_injuries_reported | Count |
| total_recordable_injuries | Count |
| lost_time_injuries | LTI count |
| near_misses_reported | Near-miss count |
| lost_workdays_due_to_injury | Days lost |
| number_of_first_aid_incidents | First-aid count |
| medical_treatment_incidents | Medical treatment count |
| number_of_people_benefitted_from_regular_health_checkups | Checkup beneficiaries |

**`ESGSafetyObservations`**

| Column | Description |
|---|---|
| total_safety_observations_reported | Total safety observations |
| new_safety_observations_reported | New in this period |
| total_safety_observations_closed_resolved | Closed/resolved observations |
| corrective_actions_closed | Corrective actions closed |
| number_of_mock_drills_conducted | Drills conducted |
| number_of_fire_incidents_reported | Fire incidents |
| unsafe_acts_behaviour_observations_reported | Behavioural safety count |

**`ESGHealthAndSafetyTraining`**

| Column | Description |
|---|---|
| type_of_workforce_trained | Employees / Contractors |
| category_of_workforce_trained | Category |
| training_type | Type of H&S training |
| training_category | Category |
| number_of_workforce_trained | Count |
| total_training_hours | Hours |
| agency | Training provider |

**`ESGAssessedLocations`**

| Column | Description |
|---|---|
| total_locations | Total facility count |
| number_of_locations_assessed_on_health_and_safety_practices | Assessed for H&S |
| number_of_locations_assessed_on_working_conditions | Assessed for working conditions |
| assessed_by | Internal / Third-party auditor |

---

### 5.3 Board & Governance  `OAM code: boardandgovernance`  `Activity.code: governance_and_board_composition`

**`ESGBoardComposition`**

| Column | Description |
|---|---|
| director_category | Executive / Non-Executive / Independent etc. |
| number_of_male_directors | Count |
| number_of_female_directors | Count |
| number_of_other_gender_directors | Count |
| number_of_minority_group_directors | Count |
| number_of_directors_under_30 | Age band |
| number_of_directors_from_30_to_50 | Age band |
| number_of_directors_above_50 | Age band |
| is_the_board_chair_independent | Yes / No |

**`ESGGovernance`**

| Column | Description |
|---|---|
| stakeholder_category | Who raised the issue |
| compliance_issues | Type/description of compliance issue |
| total_number_of_issues | Total open issues |
| new_issues_reporting_period | New in this period |
| issues_resolved_reporting_period | Resolved in this period |
| number_of_whistleblower_cases_reported | Whistleblower cases |
| number_of_whistleblower_cases_resolved | Resolved |
| number_of_confirmed_corruption_incidents | Confirmed incidents |
| number_of_ethics_violations_reported | Ethics violations |
| number_of_ethics_violations_resolved | Resolved |
| number_of_regulatory_fines | Fines received |

---

### 5.4 CSR  `OAM code: csr_master`  `Activity.code: csr`

**`ESGCSR`** — DIRECT

| Column | Description |
|---|---|
| project_name | CSR project name |
| theme_of_the_project | Theme (Education, Healthcare, Environment, etc.) |
| number_of_beneficiaries_impact_created | Total beneficiaries |
| target_beneficiary_group_impact_category | Category (women, rural, tribal, etc.) |
| related_sdgs | Related UN SDGs |
| annual_spend_on_the_project | Annual spend |
| target_specified_in_terms_of_impact_beneficiaries | Target |
| funds_earmarked_for_the_project_for_the_year | Funds allocated |
| currency | Currency code |
| number_of_direct_beneficiaries | Direct beneficiaries |
| target_beneficiary_group | Beneficiary group |
| target_set | Numerical target |
| target_achieved | Achievement |

---

### 5.5 Grievances  `OAM code: grievances`  `Activity.code: grievances_activity`

**`ESGGrievances`** — DIRECT

| Column | Description |
|---|---|
| grievance_category | Type (Labour, Environmental, etc.) |
| stakeholder_category | Employee / Community / Supplier etc. |
| total_number_of_complaints | Total open complaints |
| new_complaints | New in this period |
| complaints_resolved | Resolved in this period |

---

## 6. Additional GHG Tables (Not in Active Export Config)

These tables exist in the database but are not included in the current `EXPORT_CONFIG`. They represent either legacy upload paths, alternative calculation methods, or features under development.

---

### 6.1 Alternative Downstream Transport Tables

These are calculation-method variants for downstream transport, replacing `GHGTransport_Downstream` for specific use cases. All are DIRECT with standard FK columns.

| Table | Differentiating Input |
|---|---|
| `GHGDownstreamDistanceBased` | Distance_per_trip + Number_of_Trips |
| `GHGDownstreamFuelBased` | Quantity_of_Fuel_Consumed |
| `GHGDownstreamSKUBased` | quantity_dispatched + Distance_per_trip |
| `GHGDownstreamTotalDistanceBased` | total_distance_travelled |

All four share: `Which_SKUs`, `supplier_code`, `Destination_Location_Name`, `Destination_pin_or_zip_code`, `Transport_Managed_by`, `Mode_of_Transport`, `Vehicle_Type_Used_for_Road_Transport`, `Fuel_Used`.

All four compute: `kpi_Distance_Travelled`, `kpi_em/emf_EmissionBy_TravelledDistance`, `kpi_em/emf_EmissionBy_Transport_Rail/Air/Water/Road`, `kpi_em_EmissionBy_Transport`, scope3, scope1 columns.

---

### 6.2 Alternative Upstream Transport Tables

Variants of upstream transport calculation, parallel to `GHGTransport_Upstream`. All DIRECT with standard FK columns.

| Table | Differentiating Input |
|---|---|
| `GHGUpstreamDistanceBased` | Distance_per_Trip + Number_of_Trips |
| `GHGUpstreamFuelBased` | Quantity_of_Fuel_Consumed |
| `GHGUpstreamTotalDistanceBased` | total_distance_travelled |

All share supplier/material/transport fields and the same KPI emission columns as the downstream variants.

---

### 6.3 Use of Sold Products (Scope 3, Category 11)

Three DIRECT tables. All have nullable FK columns (`task_request_id`, `activity_task_request_id`, `organization_address_id` can be NULL on older rows).

**`GHGUseOfSoldProducts_Electricity`**

| Column | Description |
|---|---|
| Product_Code | Product identifier |
| Lifetime_of_Product | Expected product lifetime |
| Rationale | Methodology rationale |
| Region | Geographic region |
| Units_of_Electricity_consumed_in_kWh | kWh consumed by sold products |
| Additional_comments | Free text |
| Remarks | Free text |
| kpi_em_Scope3_Category11 | Scope 3 Cat 11 emission |
| kpi_emf_Scope3_Category11 | Emission factor |

**`GHGUseOfSoldProducts_Fuel`**

| Column | Description |
|---|---|
| Product_Code | Product identifier |
| Type_of_Fuel_Consumed | Fuel type in sold product |
| Quantity_of_Fuel_Consumed | Quantity |
| UoM_of_Fuel_Consumed | Unit |
| Lifetime_of_Product | Expected lifetime |
| Rationale | Methodology rationale |
| kpi_em_Scope3_Category11 | Scope 3 Cat 11 emission |
| kpi_emf_Scope3_Category11 | Emission factor |

**`GHGUseOfSoldProducts_Refrigerant`**

| Column | Description |
|---|---|
| Product_Code | Product identifier |
| Refrigerant_type_used_in_sold_product | Refrigerant type |
| Quantity_of_Refrigerant_consumed | Quantity |
| UoM_of_Refrigerant_consumed | Unit |
| Lifetime_of_Product | Expected lifetime |
| Rationale | Methodology rationale |
| kpi_em_Scope3_Category11 | Scope 3 Cat 11 emission |
| kpi_emf_Scope3_Category11 | Emission factor |

---

### 6.4 GHGWaterTreatment (Legacy)

Older water treatment table — **different column naming** from the active `GHGWasteWaterTreatment`. No KPI computed columns. FK pattern is DIRECT.

| Column | Description |
|---|---|
| qty_influent | Influent volume |
| influent_umo | Influent unit |
| influent_bod_concentration | BOD in |
| bod_influent_umo | BOD unit |
| influent_cod_concentration | COD in |
| cod_influent_umo | COD unit |
| qty_treated_effluent | Treated volume |
| effluent_umo | Effluent unit |
| effluent_bod_concentration | BOD out |
| bod_effluent_umo | BOD out unit |
| effluent_cod_concentration | COD out |
| effluent_cod_umo | COD out unit |

---

## 7. KPI / Emission Result Tables

These tables are **written by the emission calculation engine**, not by the Excel upload flow. They store pre-aggregated emission results per location per month and are used by dashboards and analytics.

| Table | Scope | Description |
|---|---|---|
| `KPIMain` | All | Total/Scope1/Scope2/Scope3 emissions; intensity per product/employee/ton; stream and category contributions |
| `KPIEmissionByFuelConsumption` | Scope 1/3 | Per-fuel-type emissions (Diesel, Gasoline, LPG, CNG, Coal, NaturalGas, Biogas, etc.) + total |
| `KPIEmissionByPowerConsumption` | Scope 2 | Grid, PPA-renewable, PPA-non-renewable, REC, captive power emissions |
| `KPIEmissionByPowerConsumption_Vendors` | Scope 2 | Per-vendor breakdown of grid/PPA/REC emissions |
| `KPIEmissionByTransportation` | Scope 1/3 | Upstream, Downstream, Employee, Business travel — per type and scope |
| `KPIEmissionByWasteGeneration` | Scope 3 | Waste generation emission + waste transport emission |
| `KPIEmissionByFugitive` | Scope 1 | Refrigerant + fire extinguisher + industrial gas emissions |
| `KPIEmissionByMaterialConsumption` | Scope 1/3 | Total material procurement emissions |
| `KPIEmissionByMaterialConsumption_Suppliers` | Scope 3 | Per-supplier material + upstream transport emissions |
| `KPIEmissionByCapitalGoods_Suppliers` | Scope 3 | Capital goods emission per supplier |
| `KPIEmissionByScope3` | Scope 3 | Category 3 breakdown (grid power + fuel purchase) |
| `KPIEnergy` | — | Energy units generated/consumed per source, purpose, and resource type |
| `KPIFugitiveGases` | — | Fugitive gas consumption detail (jsonb per gas type) |
| `KPIWasteManagement` | Scope 3 | Waste quantity by type/disposal mechanism + emissions |
| `KPIWaterConsumption` | — | Fresh, wastewater, and harvested water totals |
| `KPIEmissionByProducts` | — | Per-product emissions with % contribution and weight |
| `KPISuplierEmissionsBSF` | — | Supplier emission summary (BSF = Buyer-Supplier Facility) |
| `KPIProductCarbonFootprintMaterialProcurement` | Scope 3 | PCF contribution from material procurement per supplier/material |
| `KPIProductCarbonFootprintSupplierFacility` | Scope 3 | PCF contribution from supplier facility (grid/captive/fuel/waste) |
| `KPIProductCarbonFootprintUpstream` | Scope 3 | PCF contribution from upstream transport |

---

## 8. OAM Code → Activity.code → Tables Reference

| OAM code | Activity.code (DB) | parent_code | GHG / ESG Tables |
|---|---|---|---|
| `energy` | `energy` | *(root)* | (container only) |
| `energy` | `energy_grid_power` | `energy` | `GHGEnergyConsumption_GridPower` |
| `energy` | `energy_fuel_purchased` | `energy` | `GHGEnergyConsumption_FuelPurchased` + `_General` + `_HeatingWater` + `_Auxiliary` + `_Transportation` |
| `energy` | `energy_captive_power` | `energy` | `GHGEnergy_CaptivePower` + `_Renewable` + `_NonRenewable` + `_Renewable_Fuel` |
| `transport` | `transport_upstream` | `transport` | `GHGTransport_Upstream` |
| `transport` | `transport_downstream` | `transport` | `GHGTransport_Downstream` |
| `transport` | `transport_employee_travel` | `transport` | `GHGTransport_EmployeeTravel` |
| `transport` | `transport_business_travel` | `transport` | `GHGTransport_BusinessTravel` |
| `water` | `water_consumption` | `water` | `GHGFreshWater`, `GHGWasteWater`, `GHGHarvestedWater` |
| `water` | `wastewater_generation` | `water` | `GHGWastewaterGeneration` |
| `water` | `water_withdrawal` | `water` | `GHGWaterWithdrawal` |
| `water` | `waste_water_treatment` | `water` | `GHGWasteWaterTreatment`, `GHGEffluentDischarge`, `GHGSludgeDisposal` |
| `fugitive` | `fugitive` | *(root)* | (container only) |
| `fugitive` | `fugitive_details` | `fugitive` | `GHGRefrigerantAndACSystems`, `GHGFireExtinguisher`, `GHGIndustrialGas` |
| `waste` | `waste` | *(root)* | `GHGWaste` |
| `production` | `production` | *(root)* | `GHGProductionDetails` |
| `general` | `general` | *(root)* | `GHGGeneralDetails` |
| `buyer_share` | `buyer_share` | *(root)* | `GHGBuyer_Share` |
| `material` | `material_procurement` | `material` | `GHGMaterialProcurement` |
| `capitalgoods` | `capital_goods` | `capitalgoods` | `GHGCapital_Goods` |
| `product_share_allocation` | `product_share_allocation` | *(root/TBD)* | `GHGProductShareAttribution` |
| `humanresources` | `human_resources` | `humanresources` | `ESGEmployeeDiversity`, `ESGEmployeeTurnover`, `ESGTrainingHours` |
| `healthandsafety` | `health_and_safety` | `healthandsafety` | `ESGHealthAndSafety`, `ESGSafetyObservations`, `ESGHealthAndSafetyTraining`, `ESGAssessedLocations` |
| `boardandgovernance` | `governance_and_board_composition` | `boardandgovernance` | `ESGBoardComposition`, `ESGGovernance` |
| `csr_master` | `csr` | `csr_master` | `ESGCSR` |
| `grievances` | `grievances_activity` | `grievances` | `ESGGrievances` |

---

## 9. Summary Count vs Export Row Count

Both are derived from the same leaf GHG rows with identical filters.

| Concern | Summary (`queryTaskRequestSummary`) | Export (`queryExportData`) |
|---|---|---|
| What it reads | All GHG tables via `GHG_UNION` | One specific GHG table per sheet |
| What it returns | `COUNT` grouped by activity | All data columns |
| `is_deleted` guard | `atr.is_deleted IS NOT TRUE` | Same |
| Multi-sheet activities | Counts rows from ALL leaf tables | One Excel sheet per leaf table |

For activities with multiple tables (e.g. energy = 4 leaf tables), the summary count is the sum across all tables; the export produces multiple sheets — one per table — and the sheet row counts sum to the summary count.

---

## 10. Adding a New Activity

1. Add every leaf GHG/ESG table to `GHG_UNION` in `lib/monthly-activity-summary/queries.ts` (tag with the correct activity code string).
2. Add an entry to `EXPORT_CONFIG` in `lib/monthly-activity-summary/export-config.ts` with one sheet per leaf table.
3. If the OAM code differs from `Activity.code`, add a parent-code alias at the bottom of `export-config.ts`.
4. If the GHG table has a `status` column of its own, add it to `GHG_TABLES_BY_ACTIVITY` in `queries.ts` so the approve operation propagates the status.
5. ESG tables never have a `status` column — no step 4 needed for ESG.
