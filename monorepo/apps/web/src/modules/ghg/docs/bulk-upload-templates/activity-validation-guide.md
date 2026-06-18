# Activity Data Bulk Upload — Validation Guide

> **Audience.** Data stewards filling Excel upload templates, implementation consultants onboarding customers, and support engineers triaging upload errors.
>
> **Scope.** Every Excel `.xlsx` bulk upload template the Snowkap Operations platform exposes — environmental (GHG/PCF) and social/governance (ESG).
>
> **What's in this guide.** For every activity, every sheet: column-by-column validation rules, the full dropdown master-value list (label + stored value + conditional group rule + default behaviour), cross-column custom logic, and example valid / invalid rows.

---

## Table of Contents

1. [How to read this guide](#how-to-read-this-guide)
2. [Global rules (apply to every template)](#global-rules-apply-to-every-template)
3. [Master Data Reference](#master-data-reference) — every dropdown list, all allowed values
4. **Environmental (GHG / PCF) activities**
   - [General Details](#1-general-details)
   - [Production](#2-production)
   - [Energy — Fuel Purchased](#3-energy--fuel-purchased) (4 sheets)
   - [Energy — Captive Power](#4-energy--captive-power) (2 sheets)
   - [Energy — Grid Power](#5-energy--grid-power) (1 sheet)
   - [Transport — Upstream](#6-transport--upstream) (2 sheets)
   - [Transport — Downstream](#7-transport--downstream) (2 sheets)
   - [Transport — Business Travel](#8-transport--business-travel) (1 sheet)
   - [Transport — Employee Travel](#9-transport--employee-travel) (1 sheet)
   - [Waste](#10-waste) (1 sheet)
   - [Water — Consumption](#11-water--consumption) (3 sheets)
   - [Water — Withdrawal](#12-water--withdrawal) (1 sheet)
   - [Wastewater — Generation](#13-wastewater--generation) (1 sheet)
   - [Wastewater — Treatment](#14-wastewater--treatment) (3 sheets)
   - [Fugitive Emissions](#15-fugitive-emissions) (3 sheets)
   - [Material Procurement](#16-material-procurement) (1 sheet)
   - [Capital Goods](#17-capital-goods) (1 sheet)
   - [Buyer Share Attribution](#18-buyer-share-attribution) (8 sheets)
   - [Product Share Allocation](#19-product-share-allocation) (1 sheet)
5. **Social / Governance (ESG) activities**
   - [Human Resources](#20-human-resources) (3 sheets)
   - [Health & Safety](#21-health--safety) (4 sheets)
   - [Governance & Board Composition](#22-governance--board-composition) (2 sheets)
   - [CSR](#23-csr) (1 sheet)
   - [Grievances](#24-grievances) (1 sheet)
6. [Common error message catalogue](#common-error-message-catalogue)
7. [Submission workflow](#submission-workflow)

---

## How to read this guide

Each activity section follows the same layout:

```
### N. <Activity Name>

Activity code, parent code, API endpoint, validation source.

#### Sheet: <Sheet Name>

  Columns table       — Column | Required | Type | Validation | Master Key | Notes
  Allowed values      — Allowed value | Allowed when (parent =) | Default for
  Conditional rules   — Cross-column logic in plain English
  Examples            — Valid row sample, invalid row + reason
```

**Reading the columns table**

| Header | Meaning |
| --- | --- |
| **Required** | `Yes` = error if blank • `No` = optional • `Conditional` = required only when another column has a specific value |
| **Type** | `Text`, `Integer`, `Decimal`, `Year`, `Month`, `Dropdown` |
| **Validation** | The rules applied (range, format, master-data lookup) |
| **Master Key** | The `ActivityMaster` key that supplies the dropdown — see [Master Data Reference](#master-data-reference) for allowed values |
| **Notes** | Anything special — defaults, conditional behaviour, examples |

**Reading the dropdown tables**

| Column | Meaning |
| --- | --- |
| **Allowed value** | The exact label the user types into / picks from the cell. Matching is case-insensitive but must otherwise match exactly. |
| **Allowed when (parent =)** | The label of the parent column's value that activates this option. `—` means always available. |
| **Default for** | The label of the parent column's value where this option auto-fills if left blank. `—` means no default. |

---

## Global rules (apply to every template)

These rules apply to **every** activity template. They are NOT repeated in each section.

### File format

| Rule | Detail |
| --- | --- |
| Extension | `.xlsx` only. `.xls` and `.csv` are rejected at upload. |
| Sheet names | Must match the template sheet names **exactly** (case-insensitive). Renamed/missing sheets cause `Sheet '<name>' not found`. |
| Column headers | Must match the template headers **exactly** (case-insensitive). Renamed/missing columns are reported per-cell. |
| Empty sheet | Reported as `No data found in sheet '<name>'`. |
| Maximum rows | 10,000 rows per sheet for most activities (Material Procurement, Capital Goods enforce this hard cap; others may accept more — see per-activity sections). |

### Year column

| Rule | Detail |
| --- | --- |
| Required | Yes. Blank → `Year is required`. |
| Type | 4-digit integer. Decimals → `The year entered is invalid`. |
| Range | 1900 ≤ Year ≤ 2099. |
| Leading zeros | Strings beginning `0` rejected (`02024`). |
| Baseline | Year must be on or after the organization's baseline year. Pre-baseline → `Data can only be uploaded from the baseline month and year (<MM-YYYY>) onwards`. |

### Month column

| Rule | Detail |
| --- | --- |
| Required | Yes (except CSR, Board Composition, HR — Employee Turnover, H&S — Assessed Locations, which are annual-only). Blank → `Month is required`. |
| Type | Full English month name — `January`, `February`, ..., `December`. Case-insensitive. Numeric `1–12` is rejected. |
| Invalid value | `Invalid month`. |
| Baseline | The (Month, Year) pair must be on or after the organization's (baseline month, baseline year). |
| Future months | The (Month, Year) pair cannot be in the future relative to the upload date. |

### Numeric columns

| Rule | Detail |
| --- | --- |
| Format | No alphabetic or special characters (commas, currency signs, `%`). Use raw numbers. |
| Negative | Always rejected for quantities, distances, counts. |
| Decimals on count fields | Rejected (employees, days, vehicles, beneficiaries, etc.) — `cannot be a decimal. Please enter a whole number.` |
| Precision | Most quantity fields accept up to 4 decimal places (Grid Power explicit cap; others accept reasonable precision). |
| Empty | Optional fields may be left blank. Optional numeric **with a paired UOM** triggers conditional logic — see per-activity sections. |

### Dropdown / master-data columns

- The Excel cell value is matched against the `Label` column of the corresponding `ActivityMaster.master_data` array.
- Match is **case-insensitive** but otherwise exact (whitespace normalised).
- Mismatch error format: `Invalid value : Data should be <comma-separated list of allowed labels>`.
- Some dropdowns are **filtered by a parent column's value** (`group` mechanism) — e.g. `Fuel Used` allowed list depends on `Mode of Transport`. See [Master Data Reference](#master-data-reference).

### Cross-row rules

- **Duplicate periods** — multiple rows with identical (Year, Month, plus all key dimensions) in the same upload trigger `Duplicate Entry, Multiple identical records found in the uploaded data for the same period` (currently enforced for Energy Grid Power; other activities deduplicate at insertion).
- **UOM-group consistency** — within a single upload, the same Material Code must use UOMs from the same group (mass / volume / count). Switching between groups for the same material (e.g. `Kilogram` then `Litre`) triggers a UOM consistency error (Transport Upstream, Material Procurement).

### Error report

If any row fails validation, the API returns an Excel file mirroring the upload structure, with each failed cell populated by its error message. Successful rows are accepted; failed rows are not committed (atomic per sheet).

---

## Master Data Reference

This section lists every dropdown master used across activities, sourced live from the Hasura `ActivityMaster` table. Activity sections reference these by `master_key`.

> **How groups work.** When the **Allowed when (parent =)** cell is populated, that option only appears when the **parent column** (named in the activity section) equals the listed label. For example, the fuel dropdown for Transport — Upstream is filtered by the parent column `Mode of Transport`: **Diesel** is allowed when Mode = Road, Rail, or Water, while **Coal** is only allowed when Mode = Rail.
>
> **How defaults work.** When the **Default for** cell is populated, the platform auto-fills that value if the user leaves the cell blank AND the parent column matches the listed label.

### Index of master keys

| # | Master Key | Used in (activities) |
| --- | --- | --- |
| 1 | [`Energy_FuelPurchased_General_FuelType`](#energy_fuelpurchased_general_fueltype) | Energy — Fuel Purchased (General Purpose) |
| 2 | [`Energy_FuelPurchased_General_FuelType_UOM`](#energy_fuelpurchased_general_fueltype_uom) | Energy — Fuel Purchased (General Purpose) |
| 3 | [`Energy_FuelPurchased_General_PointOfConsumption`](#energy_fuelpurchased_general_pointofconsumption) | Energy — Fuel Purchased (General Purpose) |
| 4 | [`Energy_FuelPurchased_HeatingWater_FuelType`](#energy_fuelpurchased_heatingwater_fueltype) | Energy — Fuel Purchased (Heating Water) |
| 5 | [`Energy_FuelPurchased_HeatingWater_FuelType_UOM`](#energy_fuelpurchased_heatingwater_fueltype_uom) | Energy — Fuel Purchased (Heating Water) |
| 6 | [`Energy_FuelPurchased_Auxiliary_FuelType`](#energy_fuelpurchased_auxiliary_fueltype) | Energy — Fuel Purchased (AUX Fuel) |
| 7 | [`Energy_FuelPurchased_Auxiliary_FuelType_UOM`](#energy_fuelpurchased_auxiliary_fueltype_uom) | Energy — Fuel Purchased (AUX Fuel) |
| 8 | [`Energy_FuelPurchased_Transportation_Type`](#energy_fuelpurchased_transportation_type) | Energy — Fuel Purchased (Transportation) |
| 9 | [`energy_fuelpurchased_transportation_type_of_fuel`](#energy_fuelpurchased_transportation_type_of_fuel) | Energy — Fuel Purchased (Transportation) |
| 10 | [`energy_fuelpurchased_transportation_type_of_fuel_uom`](#energy_fuelpurchased_transportation_type_of_fuel_uom) | Energy — Fuel Purchased (Transportation) |
| 11 | [`Energy_Type_of_Captive_Power`](#energy_type_of_captive_power) | Energy — Captive Power |
| 12 | [`Energy_CaptivePower_Type_of_Technology_Used`](#energy_captivepower_type_of_technology_used) | Energy — Captive Power (Renewable) |
| 13 | [`Energy_CaptivePower_Renewable_FuelType`](#energy_captivepower_renewable_fueltype) | Energy — Captive Power (Renewable) |
| 14 | [`Energy_CaptivePower_Renewable_FuelType_UOM`](#energy_captivepower_renewable_fueltype_uom) | Energy — Captive Power (Renewable) |
| 15 | [`Energy_CaptivePower_NonRenewable_FuelType`](#energy_captivepower_nonrenewable_fueltype) | Energy — Captive Power (Non-Renewable) |
| 16 | [`Energy_CaptivePower_NonRenewable_FuelType_UOM`](#energy_captivepower_nonrenewable_fueltype_uom) | Energy — Captive Power (Non-Renewable) |
| 17 | [`transport_upstream_mode_of_transport`](#transport_upstream_mode_of_transport) | Transport — Upstream |
| 18 | [`transport_upstream_road_vehicle_type`](#transport_upstream_road_vehicle_type) | Transport — Upstream |
| 19 | [`transport_upstream_mode_of_transport_fuel_used`](#transport_upstream_mode_of_transport_fuel_used) | Transport — Upstream |
| 20 | [`transport_upstream_supplier_status`](#transport_upstream_supplier_status) | Transport — Upstream |
| 21 | [`transport_upstream_transport_managed_by`](#transport_upstream_transport_managed_by) | Transport — Upstream |
| 22 | [`transport_upstream_Material_Quantity_Procured_UOM`](#transport_upstream_material_quantity_procured_uom) | Transport — Upstream |
| 23 | [`transport_upstream_Distance_per_Trip_UOM`](#transport_upstream_distance_per_trip_uom) | Transport — Upstream |
| 24 | [`transport_upstream_quantity_of_fuel_consumed_UOM`](#transport_upstream_quantity_of_fuel_consumed_uom) | Transport — Upstream |
| 25 | [`transport_downstream_mode_of_transport`](#transport_downstream_mode_of_transport) | Transport — Downstream |
| 26 | [`transport_downstream_road_vehicle_type`](#transport_downstream_road_vehicle_type) | Transport — Downstream |
| 27 | [`transport_downstream_fuel_used`](#transport_downstream_fuel_used) | Transport — Downstream |
| 28 | [`transport_downstream_transport_managed_by`](#transport_downstream_transport_managed_by) | Transport — Downstream |
| 29 | [`transport_downstream_Distance_per_Trip_UOM`](#transport_downstream_distance_per_trip_uom) | Transport — Downstream |
| 30 | [`transport_downstream_quantity_of_fuel_consumed_UOM`](#transport_downstream_quantity_of_fuel_consumed_uom) | Transport — Downstream |
| 31 | [`transport_business_travel_mode_of_transport`](#transport_business_travel_mode_of_transport) | Transport — Business Travel |
| 32 | [`transport_business_travel_vehicle_type`](#transport_business_travel_vehicle_type) | Transport — Business Travel |
| 33 | [`transport_business_travel_fuel_used`](#transport_business_travel_fuel_used) | Transport — Business Travel |
| 34 | [`transport_business_travel_distance_per_trip_UOM`](#transport_business_travel_distance_per_trip_uom) | Transport — Business Travel |
| 35 | [`transport_employee_travel_distance_traveled_uom`](#transport_employee_travel_distance_traveled_uom) | Transport — Employee Travel |
| 36 | [`transport_employee_travel_ef_filters_default_fuel_type`](#transport_employee_travel_ef_filters_default_fuel_type) | Transport — Employee Travel |
| 37 | [`waste_disposal_managed_by`](#waste_disposal_managed_by) | Waste |
| 38 | [`waste_quantity_UOM`](#waste_quantity_uom) | Waste |
| 39 | [`waste_disposal_mechanism`](#waste_disposal_mechanism) | Waste |
| 40 | [`waste_transportation_managed_by`](#waste_transportation_managed_by) | Waste |
| 41 | [`waste_disposal_tansport_mode_of_transport`](#waste_disposal_tansport_mode_of_transport) | Waste |
| 42 | [`waste_disposal_tansport_road_vehicle_type`](#waste_disposal_tansport_road_vehicle_type) | Waste |
| 43 | [`waste_disposal_location_distance_uom`](#waste_disposal_location_distance_uom) | Waste |
| 44 | [`water_consumption_uom`](#water_consumption_uom) | Water — Consumption |
| 45 | [`water_withdrawal_uom`](#water_withdrawal_uom) | Water — Withdrawal |
| 46 | [`water_withdrawal_Source`](#water_withdrawal_source) | Water — Withdrawal |
| 47 | [`wastewater_uom`](#wastewater_uom) | Wastewater — Generation |
| 48 | [`point_of_wastewater_disposal`](#point_of_wastewater_disposal) | Wastewater — Generation |
| 49 | [`waste_water_treatment_uom_influent_effluent`](#waste_water_treatment_uom_influent_effluent) | Wastewater — Treatment |
| 50 | [`waste_water_treatment_uom_effluent`](#waste_water_treatment_uom_effluent) | Wastewater — Treatment |
| 51 | [`waste_water_treatment_uom_bod`](#waste_water_treatment_uom_bod) | Wastewater — Treatment |
| 52 | [`waste_water_treatment_uom_cod`](#waste_water_treatment_uom_cod) | Wastewater — Treatment |
| 53 | [`waste_water_treatment_uom_sludgedisposedoff`](#waste_water_treatment_uom_sludgedisposedoff) | Wastewater — Treatment |
| 54 | [`waste_water_treatment_point_of_discharge`](#waste_water_treatment_point_of_discharge) | Wastewater — Treatment |
| 55 | [`waste_water_treatment_type_of_sludge_disposal`](#waste_water_treatment_type_of_sludge_disposal) | Wastewater — Treatment |
| 56 | [`fugitive_type_of_refrigerant_used`](#fugitive_type_of_refrigerant_used) | Fugitive Emissions |
| 57 | [`fugitive_type_of_refrigerant_uom`](#fugitive_type_of_refrigerant_uom) | Fugitive Emissions |
| 58 | [`fugitive_gas_used_in_fire_extinguisher`](#fugitive_gas_used_in_fire_extinguisher) | Fugitive Emissions |
| 59 | [`fugitive_gas_used_in_fire_extinguisher_uom`](#fugitive_gas_used_in_fire_extinguisher_uom) | Fugitive Emissions |
| 60 | [`fugitive_type_of_industrial_gas_used`](#fugitive_type_of_industrial_gas_used) | Fugitive Emissions |
| 61 | [`fugitive_type_of_industrial_gas_used_uom`](#fugitive_type_of_industrial_gas_used_uom) | Fugitive Emissions |
| 62 | [`material_procurement_material_quantity_procured_uom`](#material_procurement_material_quantity_procured_uom) | Material Procurement |
| 63 | [`capital_goods_quantity_procured_uom`](#capital_goods_quantity_procured_uom) | Capital Goods |
| 64 | [`buyer_share_by_mass_uom`](#buyer_share_by_mass_uom) | Buyer Share Attribution |
| 65 | [`buyer_share_by_volume_uom`](#buyer_share_by_volume_uom) | Buyer Share Attribution |
| 66 | [`buyer_share_by_revenue_uom`](#buyer_share_by_revenue_uom) | Buyer Share Attribution |
| 67 | [`product_share_allocation_rationale_for_percentage`](#product_share_allocation_rationale_for_percentage) | Product Share Allocation |
| 68 | [`human_resources_employment_type`](#human_resources_employment_type) | Human Resources |
| 69 | [`human_resources_employee_category`](#human_resources_employee_category) | Human Resources |
| 70 | [`Health_and_Safety_Workforce_Type`](#health_and_safety_workforce_type) | Health & Safety |
| 71 | [`Health_and_Safety_Workforce_Category`](#health_and_safety_workforce_category) | Health & Safety |
| 72 | [`Health_and_Safety_Training_Type`](#health_and_safety_training_type) | Health & Safety |
| 73 | [`Health_and_Safety_Agency`](#health_and_safety_agency) | Health & Safety |
| 74 | [`Health_and_Safety_Assessed_By`](#health_and_safety_assessed_by) | Health & Safety |
| 75 | [`Board_Composition_and_Governance_Director_Category`](#board_composition_and_governance_director_category) | Governance & Board Composition |
| 76 | [`Board_Composition_and_Governance_Compliance_Issues`](#board_composition_and_governance_compliance_issues) | Governance & Board Composition |
| 77 | [`csr_themes`](#csr_themes) | CSR |
| 78 | [`csr_currency_uom`](#csr_currency_uom) | CSR |
| 79 | [`Grievances_Stakeholder_Category`](#grievances_stakeholder_category) | Grievances |

---

### Energy_FuelPurchased_General_FuelType

Fuel types for stationary combustion (general purpose).

| Allowed value |
| --- |
| Diesel |
| Gasoline |
| CNG |
| LPG |
| Biodiesel |
| Ethanol |
| Kerosene |
| HSD |
| PNG |
| Biogas |
| Furnace Oil |
| Coal Bed Methane |
| Coal |
| Biomass-Rice Husk |
| Biomass-Briquette |
| Biomass-Others |
| Natural Gas |
| SKO |
| Coke (low ash) |
| Coke (high ash) |
| Pyroil |
| Hydrocarbon Oil |
| Coconut shell |

### Energy_FuelPurchased_General_FuelType_UOM

UOMs for stationary fuel quantity. **Filtered by the parent column `Type of Fuel Consumption`.** Allowed UOMs depend on the chosen fuel — refer to [Energy_FuelPurchased_HeatingWater_FuelType_UOM](#energy_fuelpurchased_heatingwater_fueltype_uom) for the working filter table; the same fuel-to-UOM relationships apply here.

### Energy_FuelPurchased_General_PointOfConsumption

Where the fuel is consumed.

| Allowed value |
| --- |
| Direct |
| DG Set |

### Energy_FuelPurchased_HeatingWater_FuelType

Fuel types used for heating water.

| Allowed value |
| --- |
| Diesel |
| CNG |
| LPG |
| Heavy Fuel Oil |

### Energy_FuelPurchased_HeatingWater_FuelType_UOM

UOMs for heating-water fuel quantity. **Filtered by parent column `Type of Fuel Consumption`.**

| Allowed value | Allowed when Type of Fuel Consumption = | Default for |
| --- | --- | --- |
| Kilogram | LPG, CNG | — |
| Tonne | LPG | — |
| Cubic metre | Diesel, CNG, Heavy Fuel Oil | — |
| Litre | Diesel | — |
| Millilitre | Diesel | — |
| Gallon | Diesel | — |
| Cubic foot | Diesel | — |
| Fluid ounce | Diesel | — |

### Energy_FuelPurchased_Auxiliary_FuelType

Auxiliary / utility gases and fuels.

| Allowed value |
| --- |
| Gaseous Nitrogen |
| Gaseous Oxygen |
| Liquid Nitrogen |
| Compressed Air |
| Diesel |
| Ammonia |
| Aviation Turbine Fuel |
| Propane |
| Dissolved Acetylene Mixture |
| Jet Fuel |
| Acetylene |

### Energy_FuelPurchased_Auxiliary_FuelType_UOM

**Filtered by parent column `AUX Fuel Types Consumption`.**

| Allowed value | Allowed when AUX Fuel Types Consumption = | Default for |
| --- | --- | --- |
| Standard Cubic Meters | Gaseous Oxygen, Compressed Air | — |
| Kilogram | Gaseous Nitrogen, Gaseous Oxygen, Liquid Nitrogen, Propane, Dissolved Acetylene Mixture, Acetylene | — |
| Normal cubic foot | Gaseous Nitrogen, Gaseous Oxygen | — |
| Litre | Liquid Nitrogen, Diesel, Dissolved Acetylene Mixture, Jet Fuel, Acetylene | — |
| Cubic Metre | Liquid Nitrogen, Diesel, Gaseous Nitrogen, Ammonia, Dissolved Acetylene Mixture, Jet Fuel, Acetylene | — |
| Bar | Compressed Air | — |
| Millilitre | Diesel | — |
| Gallon | Diesel | — |
| Cubic foot | Diesel | — |
| Fluid ounce | Diesel | — |
| US Gallon | Aviation Turbine Fuel | — |
| Gram | Propane | — |
| Pound | Propane | — |
| Ounce | Propane | — |

### Energy_FuelPurchased_Transportation_Type

| Allowed value |
| --- |
| Upstream |
| Downstream |
| Internal |

### energy_fuelpurchased_transportation_type_of_fuel

Fuel types for transportation use. Currently only Road mode is exposed.

| Allowed value | Allowed when mode = | Default for |
| --- | --- | --- |
| Diesel | Road | Road |
| CNG | Road | — |
| Refuse Derived Fuel | Road | — |
| Gasoline | Road | — |
| Jet Fuel | Road | — |

### energy_fuelpurchased_transportation_type_of_fuel_uom

**Filtered by parent column `Type of Fuel Consumption`.**

| Allowed value | Allowed when Type of Fuel Consumption = | Default for |
| --- | --- | --- |
| Cubic metre | Diesel, CNG, Gasoline | — |
| Litre | Diesel, Gasoline, Jet Fuel | — |
| Millilitre | Diesel, Gasoline | — |
| Gallon | Diesel, Gasoline | — |
| Cubic foot | Diesel, Gasoline | — |
| Fluid ounce | Diesel, Gasoline | — |
| Kilogram | CNG | — |
| Pound | Refuse Derived Fuel | — |

### Energy_Type_of_Captive_Power

| Allowed value |
| --- |
| Renewable |
| Non Renewable |

### Energy_CaptivePower_Type_of_Technology_Used

| Allowed value |
| --- |
| Solar |
| Wind |
| Hydro |

### Energy_CaptivePower_Renewable_FuelType

| Allowed value |
| --- |
| Biomass |
| Bagasse |

### Energy_CaptivePower_Renewable_FuelType_UOM

**Filtered by parent column `Type of Fuel Used`.**

| Allowed value | Allowed when Type of Fuel Used = | Default for |
| --- | --- | --- |
| Kilogram | Bagasse, Biomass | — |
| Gram | Bagasse, Biomass | — |
| Milligram | Bagasse, Biomass | — |
| Tonne | Bagasse, Biomass | — |
| Pound | Bagasse, Biomass | — |
| Ounce | Bagasse, Biomass | — |

### Energy_CaptivePower_NonRenewable_FuelType

| Allowed value |
| --- |
| Coal |
| Diesel |
| Petcoke |
| Natural Gas |
| Jet Fuel |

### Energy_CaptivePower_NonRenewable_FuelType_UOM

**Filtered by parent column `Type of Fuel Used`.**

| Allowed value | Allowed when Type of Fuel Used = | Default for |
| --- | --- | --- |
| Kilogram | Coal, Petcoke | — |
| Gram | Coal, Petcoke | — |
| Milligram | Coal, Petcoke | — |
| Tonne | Coal, Petcoke | — |
| Pound | Coal, Petcoke | — |
| Ounce | Coal, Petcoke | — |
| Cubic metre | Diesel, Natural Gas | — |
| Litre | Diesel, Jet Fuel | — |
| Millilitre | Diesel | — |
| Gallon | Diesel | — |
| Cubic foot | Diesel | — |
| Fluid ounce | Diesel | — |
| Cubic Feet | Natural Gas | — |
| Thousands of cubic feet | Natural Gas | — |

### transport_upstream_mode_of_transport

| Allowed value |
| --- |
| Road |
| Rail |
| Water |
| Air |

### transport_upstream_road_vehicle_type

| Allowed value |
| --- |
| LDV |
| MDV |
| HDV |

### transport_upstream_mode_of_transport_fuel_used

**Filtered by parent column `Mode of Transport`.**

| Allowed value | Allowed when Mode of Transport = | Default for |
| --- | --- | --- |
| Diesel | Road, Rail, Water | Road, Rail, Water |
| CNG | Road | — |
| Gasoline | Road | — |
| Jet Fuel | Road | — |
| Electric | Road, Rail | Rail |
| Jet Fuel | Air | Air |
| SAF | Air | — |
| Hybrid Fuels | Road | — |
| Light Diesel Oil | Road | — |
| LNG | Road | — |
| Hydrogen | Rail | — |
| Biojet Fuel | Air | — |
| Methanol | Water | — |
| Coal | Rail | — |
| Kerosene | Water | — |
| Electric | Air | — |

### transport_upstream_supplier_status

| Allowed value |
| --- |
| Self |
| Third Party |

### transport_upstream_transport_managed_by

| Allowed value |
| --- |
| Self |
| Third Party |

### transport_upstream_Material_Quantity_Procured_UOM

UOMs for material quantity. Three groups — Mass, Volume, Count. All UOMs in the same upload (for the same Material Code) must belong to the same group.

| Allowed value | UOM group | Default for |
| --- | --- | --- |
| Kilogram | Mass | Mass |
| Gram | Mass | — |
| Milligram | Mass | — |
| Tonne | Mass | — |
| Pound | Mass | — |
| Ounce | Mass | — |
| Carat | Mass | — |
| Litre | Volume | Volume |
| Millilitre | Volume | — |
| Gallon | Volume | — |
| Kilolitre | Volume | — |
| Nos | Count | — |
| EA | Count | — |

### transport_upstream_Distance_per_Trip_UOM

| Allowed value |
| --- |
| Kilometer |
| Mile |

### transport_upstream_quantity_of_fuel_consumed_UOM

**Filtered by parent column `Type of Fuel Used`.**

| Allowed value | Allowed when Type of Fuel Used = | Default for |
| --- | --- | --- |
| Cubic metre | Diesel, Jet Fuel, SAF, CNG | — |
| Litre | Diesel, Jet Fuel, SAF | — |
| Millilitre | Diesel, Jet Fuel, SAF | — |
| Gallon | Diesel, Jet Fuel, SAF | — |
| Cubic foot | Diesel, Jet Fuel, SAF | — |
| Fluid ounce | Diesel, Jet Fuel, SAF | — |
| Kilogram | CNG | — |
| Kwh | Electric | — |

### transport_downstream_mode_of_transport

| Allowed value |
| --- |
| Road |
| Rail |
| Water |
| Air |

### transport_downstream_road_vehicle_type

| Allowed value |
| --- |
| LDV |
| MDV |
| HDV |

### transport_downstream_fuel_used

**Filtered by parent column `Mode of Transport`.**

| Allowed value | Allowed when Mode of Transport = | Default for |
| --- | --- | --- |
| Diesel | Road, Rail, Water | Road, Rail, Water |
| CNG | Road | — |
| Gasoline | Road | — |
| Jet Fuel | Road | — |
| Electric | Road, Rail | Rail |
| Jet Fuel | Air | Air |
| SAF | Air | — |
| Hydrogen Internal Combustion | Road | — |
| Fuel Cell Hydrogen | Road | — |
| Synthetic Fuels | Road | — |
| Solar Assisted Electric | Rail | — |
| Fischer Tropsch Synthetic Fuel | Air | — |
| Ultra Low Sulfur Fuel Oil | Water | — |
| Coal | Rail | — |
| Kerosene | Water | — |
| Electric | Air | — |

### transport_downstream_transport_managed_by

| Allowed value |
| --- |
| Self |
| Third Party |

### transport_downstream_Distance_per_Trip_UOM

| Allowed value |
| --- |
| Kilometer |
| Mile |

### transport_downstream_quantity_of_fuel_consumed_UOM

**Filtered by parent column `Type of Fuel Used`.**

| Allowed value | Allowed when Type of Fuel Used = | Default for |
| --- | --- | --- |
| Cubic metre | Diesel, Jet Fuel, SAF, CNG | — |
| Litre | Diesel, Jet Fuel, SAF | — |
| Millilitre | Diesel, Jet Fuel, SAF | — |
| Gallon | Diesel, Jet Fuel, SAF | — |
| Cubic foot | Diesel, Jet Fuel, SAF | — |
| Fluid ounce | Diesel, Jet Fuel, SAF | — |
| Kilogram | CNG | — |
| Kwh | Electric | — |

### transport_business_travel_mode_of_transport

| Allowed value |
| --- |
| Road |
| Rail |
| Air |

### transport_business_travel_vehicle_type

**Filtered by parent column `Mode of Transport`.**

| Allowed value | Allowed when Mode of Transport = | Default for |
| --- | --- | --- |
| 4 wheeler | Road | — |
| Bus | Road | — |
| 2 wheeler | Road | — |
| 3 wheeler | Road | — |
| Suburban | Rail | — |
| Non suburban | Rail | — |
| Airplane | Air | — |

### transport_business_travel_fuel_used

**Filtered by parent column `Mode of Transport`.**

| Allowed value | Allowed when Mode of Transport = | Default for |
| --- | --- | --- |
| Diesel | Road, Rail | — |
| Petrol | Road | — |
| CNG | Road | — |
| Jet Fuel | Road | — |
| Electric | Road, Rail | — |
| Jet Fuel | Air | — |
| SAF | Air | — |
| Coal | Rail | — |
| Kerosene | Water | — |
| Electric | Air | — |

### transport_business_travel_distance_per_trip_UOM

| Allowed value |
| --- |
| Kilometer |
| Mile |

### transport_employee_travel_distance_traveled_uom

| Allowed value |
| --- |
| Kilometer |
| Mile |

### transport_employee_travel_ef_filters_default_fuel_type

Default fuel type used internally by the emissions-factor engine. Auto-fills only — clients do not select it.

| Auto-filled value | Auto-fills when travel mode is | Default for |
| --- | --- | --- |
| Diesel | Private Vehicle - 4 Wheeler, Public Transport - 4 Wheeler | Private Vehicle - 4 Wheeler, Public Transport - 4 Wheeler |

### waste_disposal_managed_by

| Allowed value | Default |
| --- | --- |
| Self | ✓ (default) |
| Third Party | — |

### waste_quantity_UOM

| Allowed value |
| --- |
| Kilogram |
| Gram |
| Milligram |
| Tonne |
| Pound |
| Ounce |
| Cubic metre |
| Litre |
| Millilitre |
| Gallon |
| Cubic foot |
| Fluid ounce |

### waste_disposal_mechanism

| Allowed value | Default |
| --- | --- |
| Landfilled | ✓ (default) |
| Recycled | — |
| Upcycled | — |
| Co-processed | — |
| Incinerated | — |
| Reused | — |

### waste_transportation_managed_by

| Allowed value |
| --- |
| Self |
| Third Party |

### waste_disposal_tansport_mode_of_transport

| Allowed value | Default |
| --- | --- |
| Road | ✓ (default) |
| Rail | — |

### waste_disposal_tansport_road_vehicle_type

| Allowed value | Default |
| --- | --- |
| LDV | — |
| MDV | ✓ (default) |
| HDV | — |

### waste_disposal_location_distance_uom

| Allowed value |
| --- |
| Kilometer |
| Mile |

### water_consumption_uom

| Allowed value |
| --- |
| Litre |
| Gallon |
| Million Litres |
| Kilolitres |
| m3 |

### water_withdrawal_uom

| Allowed value |
| --- |
| Litre |
| Gallon |
| Million Litres |
| Kilolitres |
| m3 |

### water_withdrawal_Source

| Allowed value |
| --- |
| Ground Water |
| Municipal Water Supply |
| Surface Water |
| Other Third Party Sources |

### wastewater_uom

| Allowed value |
| --- |
| Litre |
| Gallon |
| Million Litres |
| Kilolitres |
| m3 |

### point_of_wastewater_disposal

| Allowed value |
| --- |
| Surface Water Body |
| Third Party Sewage System |
| Land Application |
| Others |
| Groundwater |

### waste_water_treatment_uom_influent_effluent

| Allowed value |
| --- |
| Litre |
| Gallon |
| Million Litre |
| Kilolitre |
| m3 |

### waste_water_treatment_uom_effluent

| Allowed value |
| --- |
| Litre |
| Gallon |
| Million Litre |
| Kilolitre |
| m3 |

### waste_water_treatment_uom_bod

| Allowed value |
| --- |
| mg/l |
| g/l |

### waste_water_treatment_uom_cod

| Allowed value |
| --- |
| mg/l |
| g/l |

### waste_water_treatment_uom_sludgedisposedoff

| Allowed value |
| --- |
| Kilogram |
| Tonne |

### waste_water_treatment_point_of_discharge

| Allowed value |
| --- |
| Surface Water Body |
| Third Party Sewer System |
| Land Application |
| Others |

### waste_water_treatment_type_of_sludge_disposal

| Allowed value |
| --- |
| Surface Water Body |
| Incineration |
| Land Application |
| Others |
| Co-processing |

### fugitive_type_of_refrigerant_used

| Allowed value |
| --- |
| R-410A |
| R-32 |
| R-22 |
| R-407C |
| R-134a |
| R-454B |
| R-23 |
| R-404A |
| R-508B |

### fugitive_type_of_refrigerant_uom

**Filtered by parent column `Type of Refrigerant used`.** All three UOMs are valid for every refrigerant (R-410A, R-32, R-22, R-407C, R-134a, R-454B, R-23, R-404A, R-508B).

| Allowed value |
| --- |
| Kilogram |
| Pound |
| Tonne |

### fugitive_gas_used_in_fire_extinguisher

| Allowed value |
| --- |
| CO2 |
| Nitrogen |

### fugitive_gas_used_in_fire_extinguisher_uom

**Filtered by parent column `Gas used in Fire extinguisher`.** All three UOMs are valid for both CO2 and Nitrogen.

| Allowed value |
| --- |
| Kilogram |
| Pound |
| Tonne |

### fugitive_type_of_industrial_gas_used

| Allowed value |
| --- |
| CO2 |
| Methane |
| Nitrous Oxide |
| Argon–CO2 Mixture |

### fugitive_type_of_industrial_gas_used_uom

**Filtered by parent column `Type of Industrial Gas used`.**

| Allowed value | Allowed when Type of Industrial Gas used = | Default for |
| --- | --- | --- |
| Kilogram | CO2, Methane, Nitrous Oxide | — |
| Pound | CO2, Methane, Nitrous Oxide | — |
| Tonne | CO2, Methane, Nitrous Oxide | — |
| Litre | Argon–CO2 Mixture | — |
| Cubic Metre | Argon–CO2 Mixture | — |

### material_procurement_material_quantity_procured_uom

UOMs grouped into Mass / Volume / Count. The same Material Code must use UOMs from the same group across rows.

| Allowed value | UOM group | Default for |
| --- | --- | --- |
| Kilogram | Mass | Mass |
| Gram | Mass | — |
| Milligram | Mass | — |
| Tonne | Mass | — |
| Pound | Mass | — |
| Ounce | Mass | — |
| Carat | Mass | — |
| Litre | Volume | Volume |
| Millilitre | Volume | — |
| EA | Count | — |
| Nos | Count | — |
| Kilolitre | Volume | — |
| Gallon | Volume | — |

### capital_goods_quantity_procured_uom

| Allowed value | UOM group | Default for |
| --- | --- | --- |
| Kilogram | Mass | Mass |
| Tonne | Mass | — |
| Nos | Count | — |
| EA | Count | — |
| Gram | Mass | — |
| Milligram | Mass | — |
| Pound | Mass | — |
| Ounce | Mass | — |

### buyer_share_by_mass_uom

| Allowed value |
| --- |
| Kilogram |
| Tonne |
| Pound |
| Ounce |

### buyer_share_by_volume_uom

| Allowed value |
| --- |
| Cubic metre |
| Litre |
| Barrel |
| Gallon |
| Cubic foot |
| Fluid ounce |

### buyer_share_by_revenue_uom

| Allowed value |
| --- |
| INR |
| USD |
| GBP |

### product_share_allocation_rationale_for_percentage

| Allowed value |
| --- |
| By Revenue |
| By Mass |
| By Volume |
| By No of units |

### human_resources_employment_type

| Allowed value |
| --- |
| Permanent |
| Contractual |

### human_resources_employee_category

| Allowed value |
| --- |
| Executive Management |
| Senior Management |
| Middle Management |
| Junior Management |
| Professional/Staff |
| Workers |
| Unskilled/Support Staff |

### Health_and_Safety_Workforce_Type

| Allowed value |
| --- |
| Permanent |
| Contractual |

### Health_and_Safety_Workforce_Category

| Allowed value |
| --- |
| Employees |
| Workers |

### Health_and_Safety_Training_Type

| Allowed value |
| --- |
| Classroom |
| Drills |
| Virtual |

### Health_and_Safety_Agency

| Allowed value |
| --- |
| Internal |
| External |

### Health_and_Safety_Assessed_By

| Allowed value |
| --- |
| Entity |
| Statutory Authority |
| Third Party |

### Board_Composition_and_Governance_Director_Category

| Allowed value |
| --- |
| Independent |
| Executive |
| Non Executive |

### Board_Composition_and_Governance_Compliance_Issues

| Allowed value |
| --- |
| Whistleblower Case |
| Bribery and Corruption |
| Ethics Violation |
| Regulatory fines/Legal Non Compliances |
| Conflict of Interest |

### csr_themes

| Allowed value |
| --- |
| Hunger, poverty and malnutrition |
| Education, vocational skills and livelihood |
| Gender equality, empowering women and senior citizens |
| Art and culture protection |
| Armed Forces Veteran Benefits |
| Promoting Sports |
| Contribution to PM Relief Fund |
| Contribution to incubators and R&D projects |
| Slum and Rural Development |
| Disaster Management |
| Research and Development |
| Environment Sustainability |
| Incubators and Startups |
| Health and Sanitation |

### csr_currency_uom

| Allowed value |
| --- |
| INR |
| USD |
| GBP |
| EUR |
| CAD |
| JPY |
| CNY |
| AED |
| SAR |

### Grievances_Stakeholder_Category

| Allowed value |
| --- |
| Community |
| Investors (other than shareholders) |
| Shareholders |
| Employees |
| Workers |
| Customers |
| Value Chain Partners |
| Others |

---

## 1. General Details

| Field | Value |
| --- | --- |
| **Activity code** | `general` |
| **Parent code** | — |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/general/excel` |
| **Validation file** | `lib/organization-transaction/general/general.validation.ts` |
| **Sheets** | 1 |

### Sheet: General Details

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Number of Employees | Yes | Integer | `> 0`. Whole number — no decimals. | — | — |
| 4 | Number of Operational Days | Yes | Integer | `> 0`. ≤ days in that month. Whole number — no decimals. | — | — |

#### Conditional rules

- `Number of Operational Days` must not exceed the calendar days in (Month, Year) — e.g. 31 days in January, 28/29 in February.
- The first allowed (Year, Month) is the organization's baseline period — earlier rows fail with `Data can only be uploaded from the baseline month and year (<MM-YYYY>) onwards`.

#### Examples

✓ Valid row: `2024 | March | 245 | 26`

✗ Invalid: `2024 | February | 100 | 30` → `Number of Operational Days` must be ≤ 29 (28 in non-leap years).

---

## 2. Production

| Field | Value |
| --- | --- |
| **Activity code** | `production` |
| **Parent code** | `production` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/production/excel` |
| **Validation file** | `lib/organization-transaction/production/production-excel.validation.ts` |
| **Sheets** | 1 |

### Sheet: Production

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Manufactured Product Code | Yes | Text | Must exist in the organization's product master | — | Pre-loaded from setup |
| 4 | Process Employeed | Yes | Text | Must exist in the organization's process master | — | (Note: column header keeps the original spelling) |
| 5 | Manufactured SKU Code | Yes | Text | Must exist in the organization's SKU master | — | — |
| 6 | Units of SKU Manufactured | Yes | Decimal | `> 0` | — | — |
| 7 | What Percentage of Total Production Represents Production of SKU | Yes | Decimal | `0 < value ≤ 100` | — | Sum across all SKUs of the same Product/Process should equal 100% per period |

#### Conditional rules

- The triple (Manufactured Product Code, Process Employeed, Manufactured SKU Code) must already be linked in the org's master data — uploads referencing unknown links fail.
- Aggregating the Percentage column across all rows of the same (Year, Month, Product, Process) should equal 100; the system flags non-100 sums but accepts them.

---

## 3. Energy — Fuel Purchased

| Field | Value |
| --- | --- |
| **Activity code** | `energy_fuel_purchased` |
| **Parent code** | `energy` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/energy-fuel-purchased/excel` |
| **Validation file** | `lib/organization-transaction/energy/energy-fuel-purchased.validation.ts` |
| **Sheets** | 4 — General Purpose, Heating Water, AUX Fuel, Transportation |
| **Max records** | 10,000 across all sheets per upload |

### Sheet: General Purpose

Used for stationary fuel combustion at the facility (e.g. on-site furnaces, boilers, DG sets).

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Type of Fuel Consumption | Yes | Dropdown | Master lookup | [`Energy_FuelPurchased_General_FuelType`](#energy_fuelpurchased_general_fueltype) | Drives UOM and Point of Consumption rules |
| 4 | Quantity of Fuel Consumption | Yes | Decimal | `> 0` | — | — |
| 5 | UoM for Fuel Consumption | Yes | Dropdown | Master lookup, filtered by fuel type | [`Energy_FuelPurchased_General_FuelType_UOM`](#energy_fuelpurchased_general_fueltype_uom) | Allowed UOMs depend on the chosen fuel |
| 6 | Quality of Fuel | No | Decimal | If provided, `> 0` | — | Calorific value or grade indicator |
| 7 | Point of Consumption | Conditional | Dropdown | Required when fuel = Diesel | [`Energy_FuelPurchased_General_PointOfConsumption`](#energy_fuelpurchased_general_pointofconsumption) | Allowed: `Direct`, `DG Set` |

#### Conditional rules

- **Fuel = Diesel → Point of Consumption required.** Other fuels accept blank.
- **UOM must match fuel group.** E.g. **Litre** is allowed when fuel is **Diesel** but not when fuel is **CNG** (where **Cubic metre** or **Kilogram** apply). The UOM dropdown is automatically filtered.

### Sheet: Heating Water

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Type of Fuel Consumption | Yes | Dropdown | Master lookup | [`Energy_FuelPurchased_HeatingWater_FuelType`](#energy_fuelpurchased_heatingwater_fueltype) | — |
| 4 | Quality of Fuel Consumption | No | Decimal | If provided, `> 0` | — | — |
| 5 | SKUs applicable | Yes (Buyer role) | Text | Must exist in the organization's SKU master | — | Comma-separate multiple SKUs |
| 6 | Quantity of Fuel Consumed | Yes | Decimal | `> 0` | — | — |
| 7 | UoM_Heating fuel | Yes | Dropdown | Master lookup, filtered by fuel | [`Energy_FuelPurchased_HeatingWater_FuelType_UOM`](#energy_fuelpurchased_heatingwater_fueltype_uom) | — |

#### Conditional rules

- **SKUs applicable** is required when uploaded under a buyer role; for own-facility data it may be blank. Each SKU listed must already be present in the org's SKU master and tied to a production task in the same period — otherwise: `No production details found for this sku`.

### Sheet: AUX Fuel

For auxiliary gases / utilities (compressed air, nitrogen, propane, etc.).

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | AUX Fuel Types Consumption | Yes | Dropdown | Master lookup | [`Energy_FuelPurchased_Auxiliary_FuelType`](#energy_fuelpurchased_auxiliary_fueltype) | — |
| 4 | SKUs applicable | Yes (Buyer role) | Text | SKU master lookup | — | Same rule as Heating Water |
| 5 | Quantity of fuel Consumed | Yes | Decimal | `> 0` | — | — |
| 6 | UoM_AuxFuel | Yes | Dropdown | Master lookup, filtered by AUX fuel | [`Energy_FuelPurchased_Auxiliary_FuelType_UOM`](#energy_fuelpurchased_auxiliary_fueltype_uom) | — |

### Sheet: Transportation

For fuel consumed by company-owned/contracted vehicles, classified as Upstream / Downstream / Internal flows.

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Vehicle Type Used for Road Transport | Yes | Dropdown | Master lookup | [`transport_upstream_road_vehicle_type`](#transport_upstream_road_vehicle_type) | Allowed: LDV, MDV, HDV |
| 4 | Type of Fuel Consumption | Yes | Dropdown | Master lookup | [`energy_fuelpurchased_transportation_type_of_fuel`](#energy_fuelpurchased_transportation_type_of_fuel) | — |
| 5 | Quantity of fuel Consumption | Yes | Decimal | `> 0` | — | — |
| 6 | UoM for fuel Consumption | Yes | Dropdown | Master lookup, filtered by fuel | [`energy_fuelpurchased_transportation_type_of_fuel_uom`](#energy_fuelpurchased_transportation_type_of_fuel_uom) | — |
| 7 | Distance travelled | No | Decimal | If provided, `> 0` | — | — |
| 8 | Transportation Type | Yes | Dropdown | Master lookup | [`Energy_FuelPurchased_Transportation_Type`](#energy_fuelpurchased_transportation_type) | Upstream / Downstream / Internal |

#### Address-level applicability (all sheets)

| Sheet | Manufacturing — Own | Manufacturing — Contract | Non-Manufacturing — Own |
| --- | --- | --- | --- |
| General Purpose | ✓ | ✓ | ✓ |
| Heating Water | ✓ | ✓ | — |
| AUX Fuel | ✓ | ✓ | — |
| Transportation | ✓ | ✓ | ✓ |

If a row is uploaded against an unsupported address-type / ownership combination, the row is rejected.

---

## 4. Energy — Captive Power

| Field | Value |
| --- | --- |
| **Activity code** | `energy_captive_power` |
| **Parent code** | `energy` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/energy-captive-power/excel` |
| **Validation file** | `lib/organization-transaction/energy/energy-captive-power.validation.ts` |
| **Sheets** | 2 — Renewable Captive Power, Non Renewable Captive Power |

### Sheet: Renewable Captive Power

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Type of Technology Used | Yes | Dropdown | Master lookup | [`Energy_CaptivePower_Type_of_Technology_Used`](#energy_captivepower_type_of_technology_used) | Solar / Wind / Hydro |
| 4 | Installation Year | Yes | Year | 4-digit, ≤ current year | — | When the captive plant was commissioned |
| 5 | Unit of Energy Generated (in Kwh) | Yes | Decimal | `> 0` | — | Always in kWh |

### Sheet: Non Renewable Captive Power

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Type of Fuel Used | Yes | Dropdown | Master lookup | [`Energy_CaptivePower_NonRenewable_FuelType`](#energy_captivepower_nonrenewable_fueltype) | Coal / Diesel / Petcoke / Natural Gas / Jet Fuel |
| 4 | Quantity of fuel consumed | Yes | Decimal | `> 0` | — | — |
| 5 | UoM for the Quantity of Fuel consumed | Yes | Dropdown | Master lookup, filtered by fuel | [`Energy_CaptivePower_NonRenewable_FuelType_UOM`](#energy_captivepower_nonrenewable_fueltype_uom) | — |
| 6 | Quality of fuel | No | Decimal | If provided, `> 0` | — | Calorific value or grade |
| 7 | Unit of Energy Generated (in Kwh) | Yes | Decimal | `> 0` | — | Always in kWh |

#### Conditional rules

- **UOM must match fuel group**: e.g. `Coal` and `Petcoke` accept mass UOMs (Kilogram, Tonne, Pound…); `Diesel` accepts volume UOMs (Litre, Cubic metre…); `Natural Gas` accepts `Cubic metre`, `Cubic Feet`, `Thousands of cubic feet`.

---

## 5. Energy — Grid Power

| Field | Value |
| --- | --- |
| **Activity code** | `energy_grid_power` |
| **Parent code** | `energy` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/energy-grid-power/excel` |
| **Validation file** | `lib/organization-transaction/energy/energy-grid-power.validation.ts` |
| **Sheets** | 1 |

### Sheet: Grid Power Details

This sheet has no master-data dropdowns; all validation is pure Zod with conditional logic between paired company-name / units columns.

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Name of Distribution Company | No | Text | Letters, spaces, hyphens (`-`), ampersands (`&`), dots (`.`) only. Max 100 chars. | — | — |
| 4 | Units of Power Consumed - Grid (in Kwh) | No | Decimal | `≥ 0`, max 4 decimal places, max 15 digits. | — | — |
| 5 | PPA Company Name - Renewable | Conditional | Text | Required when `Units of Renewable power - PPA > 0`. Same character set as #3. | — | — |
| 6 | Units of Renewable power - PPA (in Kwh) | Conditional | Decimal | Required when PPA Renewable name is provided. `≥ 0`, max 4 decimals. | — | — |
| 7 | PPA Company Name - Non Renewable | Conditional | Text | Required when `Units of Non Renewable power - PPA > 0`. Same character set. | — | — |
| 8 | Units of Non Renewable power - PPA (in Kwh) | Conditional | Decimal | Required when PPA Non-Renewable name is provided. `≥ 0`, max 4 decimals. | — | — |
| 9 | REC Company | Conditional | Text | Required when `Units of power purchased - REC > 0`. Same character set. | — | — |
| 10 | Units of power purchased - REC (in Kwh) | Conditional | Decimal | Required when REC company name is provided. `≥ 0`, max 4 decimals. | — | — |

#### Conditional rules

- **Paired columns (name ↔ units).** Each of the four power sources is a name + units pair. Either both are filled or both are blank. Filling units without a name → `<source> company name is required when <source> power units are entered`. Filling a name without units → `Please enter a valid numeric value for <source> power`.
- **At least one source.** Across (Grid consumption, PPA Renewable units, PPA Non-Renewable units, REC units) — at least ONE must be > 0. All-blank rows fail with `At least one power source must have a value (Grid consumption, PPA Renewable, PPA Non-Renewable, or REC)`.
- **Duplicate detection.** Multiple rows with the same (Year, Month) and identical data fail with `Duplicate Entry, Multiple identical records found in the uploaded data for the same period`. This also checks already-saved DB records.

---

## 6. Transport — Upstream

| Field | Value |
| --- | --- |
| **Activity code** | `transport_upstream` |
| **Parent code** | `transport` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/transport-upstream/excel` |
| **Validation file** | `lib/organization-transaction/transport/transport-upstream-excel.validation.ts` |
| **Sheets** | 2 — Upstream - Road, Upstream - Rail_Air_Water |

### Sheet: Upstream - Road

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Material Procured Code | Yes | Text | Must exist in org material master | — | — |
| 4 | Material Procured Quantity | Conditional | Decimal | Required if UOM is provided. Numeric, no alphabetic chars. | — | — |
| 5 | Material Procured Quantity UOM | Conditional | Dropdown | Required if quantity is provided. Master lookup. | [`transport_upstream_Material_Quantity_Procured_UOM`](#transport_upstream_material_quantity_procured_uom) | Group must be consistent across rows of the same Material Code |
| 6 | Supplier code | Yes | Text | Must exist in org supplier master | — | — |
| 7 | Procured from Location Country | Yes | Text | Letters only (spaces normalised) | — | — |
| 8 | Procured from Location Pincode | Yes | Text | Letters, numbers, spaces, hyphens, slashes only | — | — |
| 9 | Destination Location Country | Yes | Text | Letters only | — | — |
| 10 | Destination Location Pincode | Yes | Text | Same regex as #8 | — | — |
| 11 | Type of Vehicle | Yes | Dropdown | Master lookup | [`transport_upstream_road_vehicle_type`](#transport_upstream_road_vehicle_type) | LDV / MDV / HDV |
| 12 | Type of Fuel Used | No | Dropdown | Master lookup, filtered by mode (here: Road) | [`transport_upstream_mode_of_transport_fuel_used`](#transport_upstream_mode_of_transport_fuel_used) | — |
| 13 | Total Distance Travelled | Conditional | Decimal | Required if UOM provided. `> 0` if provided. | — | — |
| 14 | Total Distance Travelled UoM | Conditional | Dropdown | Required if distance provided. Master lookup. | [`transport_upstream_Distance_per_Trip_UOM`](#transport_upstream_distance_per_trip_uom) | Kilometer / Mile |

### Sheet: Upstream - Rail_Air_Water

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Material Procured Code | Yes | Text | Org material master | — | — |
| 4 | Material Procured Quantity | Conditional | Decimal | Same as Road | — | — |
| 5 | Material Procured Quantity UOM | Conditional | Dropdown | Same master + group rule | [`transport_upstream_Material_Quantity_Procured_UOM`](#transport_upstream_material_quantity_procured_uom) | — |
| 6 | Supplier code | Yes | Text | Org supplier master | — | — |
| 7 | Procured from Location Country | Yes | Text | Letters only | — | — |
| 8 | Procured from Location Pincode | Yes | Text | Same regex | — | — |
| 9 | Destination Location Country | Yes | Text | Letters only | — | — |
| 10 | Destination Location Pincode | Yes | Text | Same regex | — | — |
| 11 | Mode of Transport | Yes | Dropdown | Master lookup | [`transport_upstream_mode_of_transport`](#transport_upstream_mode_of_transport) | Rail / Water / Air (Road is on the other sheet) |
| 12 | Type of Fuel Used | No | Dropdown | Master lookup, filtered by mode | [`transport_upstream_mode_of_transport_fuel_used`](#transport_upstream_mode_of_transport_fuel_used) | — |
| 13 | Total Distance Travelled | Conditional | Decimal | Required if UOM provided. `> 0` if provided. | — | — |
| 14 | Total Distance Travelled UoM | Conditional | Dropdown | Required if distance provided | [`transport_upstream_Distance_per_Trip_UOM`](#transport_upstream_distance_per_trip_uom) | — |

#### Conditional rules

- **Quantity ↔ UOM pairing.** If one is filled, the other becomes required.
- **Distance ↔ UOM pairing.** Same rule for distance.
- **Fuel must match mode group.** E.g. when **Mode of Transport = Water**, allowed fuels are **Diesel, Methanol, Kerosene** only. **Mode = Air** allows only **Jet Fuel, SAF, Biojet Fuel, Electric**. See [`transport_upstream_mode_of_transport_fuel_used`](#transport_upstream_mode_of_transport_fuel_used).
- **UOM-group consistency for the same Material.** Within a single upload (and across both Road / Rail-Air-Water sheets), all rows for the same Material Procured Code must use UOMs from the same group (mass / volume / count). Switching from `Kilogram` to `Litre` for the same material → `Material Procured Quantity UOM '<x>' belongs to '<group>' group. All Material Procured Quantity UOMs for the same Material Procured Code must belong to the same group across sheets`.
- **Cross-table UOM consistency.** The same material's UOM group must also match how it was used in the Material Procurement and Capital Goods activities — `UOM is not consistent for this Material, allowed UOMs are <list>`.

---

## 7. Transport — Downstream

| Field | Value |
| --- | --- |
| **Activity code** | `transport_downstream` |
| **Parent code** | `transport` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/transport-downstream/excel` |
| **Validation file** | `lib/organization-transaction/transport/transport-downstream-excel.validation.ts` |
| **Sheets** | 2 — Downstream - Road, Downstream - Rail_Air_Water |

### Sheet: Downstream - Road

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | SKU Code | No | Text | Auto-uppercased; if provided must exist in SKU master | — | — |
| 4 | Number of SKUs | Yes | Integer | `≥ 1`, whole number | — | — |
| 5 | Distributor Code | Yes | Text | Org distributor master | — | — |
| 6 | Distributed from Location Country | Yes | Text | Letters only | — | — |
| 7 | Distributed from Location Pincode | Yes | Text | Letters/numbers/spaces/hyphens/slashes | — | — |
| 8 | Distributed to Location Country | Yes | Text | Letters only | — | — |
| 9 | Distributed to Location Pincode | Yes | Text | Same regex | — | — |
| 10 | Type of Vehicle | Yes | Dropdown | Master lookup | [`transport_downstream_road_vehicle_type`](#transport_downstream_road_vehicle_type) | LDV / MDV / HDV |
| 11 | Type of Fuel Used | No | Dropdown | Master lookup, filtered by mode (here: road) | [`transport_downstream_fuel_used`](#transport_downstream_fuel_used) | — |
| 12 | Total Distance Travelled | No | Decimal | If provided, numeric | — | — |
| 13 | Total Distance Travelled UoM | No | Dropdown | Master lookup | [`transport_downstream_Distance_per_Trip_UOM`](#transport_downstream_distance_per_trip_uom) | — |

### Sheet: Downstream - Rail_Air_Water

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | SKU Code | No | Text | Same as Road | — | — |
| 4 | Number of SKUs | Yes | Integer | `≥ 1` | — | — |
| 5 | Distributor Code | Yes | Text | Org distributor master | — | — |
| 6 | Distributed from Location Country | Yes | Text | Letters only | — | — |
| 7 | Distributed from Location Pincode | Yes | Text | Same regex | — | — |
| 8 | Distributed to Location Country | Yes | Text | Letters only | — | — |
| 9 | Distributed to Location Pincode | Yes | Text | Same regex | — | — |
| 10 | Mode of Transport | Yes | Dropdown | Master lookup | [`transport_downstream_mode_of_transport`](#transport_downstream_mode_of_transport) | Rail / Water / Air |
| 11 | Type of Fuel Used | No | Dropdown | Filtered by mode | [`transport_downstream_fuel_used`](#transport_downstream_fuel_used) | — |
| 12 | Total Distance Travelled | No | Decimal | If provided, numeric | — | — |
| 13 | Total Distance Travelled UoM | No | Dropdown | Master lookup | [`transport_downstream_Distance_per_Trip_UOM`](#transport_downstream_distance_per_trip_uom) | — |

#### Conditional rules

- Same fuel-by-mode group filter as Upstream.

---

## 8. Transport — Business Travel

| Field | Value |
| --- | --- |
| **Activity code** | `transport_business_travel` |
| **Parent code** | `transport` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/transport-business-travel/excel` |
| **Validation file** | `lib/organization-transaction/transport/transport-business-travel.validation.ts` |
| **Sheets** | 1 |

### Sheet: Business Travel

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Trip Start Location Pincode | Yes | Text | Letters/numbers/spaces/hyphens/slashes | — | — |
| 4 | Trip Start Location Country | Yes | Text | Letters only | — | — |
| 5 | Trip End Location Pincode | Yes | Text | Same regex | — | — |
| 6 | Trip End Location Country | Yes | Text | Letters only | — | — |
| 7 | Number Of Employees | Yes | Integer | `≥ 1`, whole number | — | — |
| 8 | Mode of Transport | Yes | Dropdown | Master lookup | [`transport_business_travel_mode_of_transport`](#transport_business_travel_mode_of_transport) | Road / Rail / Air |
| 9 | Vehicle Type Used | Yes | Dropdown | Master lookup, filtered by mode | [`transport_business_travel_vehicle_type`](#transport_business_travel_vehicle_type) | E.g. mode=Road → 4 wheeler / Bus / 2 wheeler / 3 wheeler |
| 10 | Fuel Used | Yes | Dropdown | Master lookup, filtered by mode | [`transport_business_travel_fuel_used`](#transport_business_travel_fuel_used) | E.g. mode=Air → Jet Fuel / SAF / Electric |

#### Conditional rules

- **Vehicle Type and Fuel Used are filtered by Mode**:
  - Mode = Road → vehicle ∈ {4 wheeler, Bus, 2 wheeler, 3 wheeler}; fuel ∈ {Diesel, Petrol, CNG, Jet Fuel, Electric}
  - Mode = Rail → vehicle ∈ {Suburban, Non suburban}; fuel ∈ {Diesel, Electric, Coal}
  - Mode = Air → vehicle ∈ {Airplane}; fuel ∈ {Jet Fuel, SAF, Electric}

---

## 9. Transport — Employee Travel

| Field | Value |
| --- | --- |
| **Activity code** | `transport` (Employee Travel sub-activity) |
| **Parent code** | `transport` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/transport-employee-travel/excel` |
| **Validation file** | `lib/organization-transaction/transport/transport-employee-travel.validation.ts` |
| **Sheets** | 1 |

### Sheet: Employee Travel

A single wide row tracks the percentage split of employees across travel modes plus the average daily distance for each. Each travel mode is captured as a triplet: % of employees + average daily distance + UOM.

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Percentage of Employees Travelled by company owned Bus | Yes | Decimal | `0 ≤ value ≤ 100` | — | — |
| 4 | Average Daily Distance Travelled by Office Bus | Conditional | Decimal | Required if % > 0 | — | — |
| 5 | UoM_CompBus | Conditional | Dropdown | Required if distance provided | [`transport_employee_travel_distance_traveled_uom`](#transport_employee_travel_distance_traveled_uom) | Kilometer / Mile |
| 6 | Percentage of Employees Travelled by Public Transport/Company contracted - Bus | Yes | Decimal | `0 ≤ value ≤ 100` | — | — |
| 7 | Average Daily Distance Travelled by Public Transport - Bus | Conditional | Decimal | Required if % > 0 | — | — |
| 8 | UoM_PubBus | Conditional | Dropdown | — | [`transport_employee_travel_distance_traveled_uom`](#transport_employee_travel_distance_traveled_uom) | — |
| 9 | Percentage of Employees Travelled by Public Transport - 4 Wheeler | Yes | Decimal | `0 ≤ value ≤ 100` | — | — |
| 10 | Average Daily Distance Travelled by Public Transport - 4 Wheeler | Conditional | Decimal | Required if % > 0 | — | — |
| 11 | UoM_4PubWheel | Conditional | Dropdown | — | [`transport_employee_travel_distance_traveled_uom`](#transport_employee_travel_distance_traveled_uom) | — |
| 12 | Percentage of Employees Travelled by Public Transport - 3 Wheeler | Yes | Decimal | `0 ≤ value ≤ 100` | — | — |
| 13 | Average Daily Distance Travelled by Public Transport - 3 Wheeler | Conditional | Decimal | Required if % > 0 | — | — |
| 14 | UoM_3PubWheel | Conditional | Dropdown | — | [`transport_employee_travel_distance_traveled_uom`](#transport_employee_travel_distance_traveled_uom) | — |
| 15 | Percentage of Employees Travelled by Private Vehicle - 4 Wheeler | Yes | Decimal | `0 ≤ value ≤ 100` | — | — |
| 16 | Average Daily Distance Travelled by Private Vehicle - 4 Wheeler | Conditional | Decimal | Required if % > 0 | — | — |
| 17 | UoM_4PvtWheel | Conditional | Dropdown | — | [`transport_employee_travel_distance_traveled_uom`](#transport_employee_travel_distance_traveled_uom) | — |
| 18 | Percentage of Employees Travelled by Private Vehicle - 2 Wheeler | Yes | Decimal | `0 ≤ value ≤ 100` | — | — |
| 19 | Average Daily Distance Travelled by Private Vehicle - 2 Wheeler | Conditional | Decimal | Required if % > 0 | — | — |
| 20 | UoM_2PvtWheel | Conditional | Dropdown | — | [`transport_employee_travel_distance_traveled_uom`](#transport_employee_travel_distance_traveled_uom) | — |
| 21 | Percentage of Employees Travelled by Rail - Suburban | Yes | Decimal | `0 ≤ value ≤ 100` | — | — |
| 22 | Average Daily Distance Travelled by Rail - Suburban | Conditional | Decimal | Required if % > 0 | — | — |
| 23 | UoM_RailSub | Conditional | Dropdown | — | [`transport_employee_travel_distance_traveled_uom`](#transport_employee_travel_distance_traveled_uom) | — |

#### Conditional rules

- **Percentages must sum to 100** across all seven travel modes.
- Distance + UOM are required only when the corresponding percentage > 0.
- Default fuel type for the calculation engine is `Diesel` for 4-wheeler buckets — see [`transport_employee_travel_ef_filters_default_fuel_type`](#transport_employee_travel_ef_filters_default_fuel_type).

---

## 10. Waste

| Field | Value |
| --- | --- |
| **Activity code** | `waste` |
| **Parent code** | — |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/waste/excel` |
| **Validation file** | `lib/organization-transaction/waste/waste.validation.ts` |
| **Sheets** | 1 |

### Sheet: Waste Produced Data

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Types of Waste Generated | Yes | Text | Free text | — | E.g. Hazardous, Plastic, E-Waste |
| 4 | Waste Disposal Managed by | Yes | Dropdown | Master lookup | [`waste_disposal_managed_by`](#waste_disposal_managed_by) | Self / Third Party. Default: Self |
| 5 | Name of Third Party | Conditional | Text | Required when Managed by = Third Party | — | — |
| 6 | Quantity of Waste | Yes | Decimal | `≥ 0` | — | — |
| 7 | UoM_Waste | Yes | Dropdown | Master lookup | [`waste_quantity_UOM`](#waste_quantity_uom) | — |
| 8 | Disposal Mechanism | No | Dropdown | Master lookup | [`waste_disposal_mechanism`](#waste_disposal_mechanism) | Default: Landfilled |
| 9 | Location of Waste Disposal | No | Text | Free text | — | — |
| 10 | Waste Transportation Managed By | No | Dropdown | Master lookup | [`waste_transportation_managed_by`](#waste_transportation_managed_by) | — |
| 11 | Mode of Transport | No | Dropdown | Master lookup | [`waste_disposal_tansport_mode_of_transport`](#waste_disposal_tansport_mode_of_transport) | Default: Road |
| 12 | Vehicle Type Used for Road Transport | Conditional | Dropdown | Master lookup; relevant when Mode = Road | [`waste_disposal_tansport_road_vehicle_type`](#waste_disposal_tansport_road_vehicle_type) | Default: MDV |
| 13 | Fuel Used | No | Dropdown | Master lookup, filtered by mode | (master_key `waste_disposal_tansport_fuel_used`) | — |
| 14 | Distance of Waste Disposal Location from Facility | No | Decimal | If provided, `> 0` | — | — |
| 15 | UoM (distance) | No | Dropdown | Master lookup | [`waste_disposal_location_distance_uom`](#waste_disposal_location_distance_uom) | Kilometer / Mile |

#### Conditional rules

- **Managed by = Third Party → Name of Third Party required.**
- **Distance > 0 only.** Blank means no transport leg; if a value is provided it must exceed zero.
- **Mode = Road → Vehicle Type relevant.** Vehicle Type is generally filled when transport is by road; rail mode skips it.
- **Fuel Used must match mode group.** Filtered through `validateActivityMasterDataGroupByKey` against the chosen Mode of Transport.

---

## 11. Water — Consumption

| Field | Value |
| --- | --- |
| **Activity code** | `water_consumption` |
| **Parent code** | — |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/water-consumption/excel` |
| **Validation file** | `lib/organization-transaction/water-consumption/water-consumption.validation.ts` |
| **Sheets** | 3 — Freshwater Use, Wastewater Reuse, Harvested Water Use |

### Sheet: Freshwater Use

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total Fresh Water Used for Domestic Use | Yes | Decimal | `≥ 0` | — | — |
| 4 | Total Fresh Water Used for Industrial Use | No | Decimal | `≥ 0` | — | — |
| 5 | Total Fresh Water Used for Landscaping | No | Decimal | `≥ 0` | — | — |
| 6 | Total Fresh Water Used for Miscellaneous Uses | No | Decimal | `≥ 0` | — | — |
| 7 | UoM Freshwater | Yes | Dropdown | Master lookup | [`water_consumption_uom`](#water_consumption_uom) | — |

### Sheet: Wastewater Reuse

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total Treated Effluent Reused for Domestic Use | No | Decimal | `≥ 0` | — | — |
| 4 | Total Treated Effluent Reused for Industrial Use | No | Decimal | `≥ 0` | — | — |
| 5 | Total Treated Effluent Reused for Landscaping | No | Decimal | `≥ 0` | — | — |
| 6 | Total Treated Effluent Used for Miscellaneous Uses | No | Decimal | `≥ 0` | — | — |
| 7 | UoM Treated Effluent | Yes | Dropdown | Master lookup | [`water_consumption_uom`](#water_consumption_uom) | — |

### Sheet: Harvested Water Use

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total Harvested Water Used for Domestic Use | No | Decimal | `≥ 0` | — | — |
| 4 | Total Harvested Water Used for Industrial Use | No | Decimal | `≥ 0` | — | — |
| 5 | Total Harvested Water Used for Landscaping | No | Decimal | `≥ 0` | — | — |
| 6 | Total Harvested Water Used for Miscellaneous Uses | No | Decimal | `≥ 0` | — | — |
| 7 | UoM Harvested Water | Yes | Dropdown | Master lookup | [`water_consumption_uom`](#water_consumption_uom) | — |

---

## 12. Water — Withdrawal

| Field | Value |
| --- | --- |
| **Activity code** | `water_withdrawal` |
| **Parent code** | `material` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/water-withdrawal/excel` |
| **Validation file** | `lib/organization-transaction/water-withdrawal/water-withdrawal.validation.ts` |
| **Sheets** | 1 |

### Sheet: Water Withdrawal

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total Fresh Water Withdrawal | Yes | Decimal | `≥ 0` | — | — |
| 4 | UoM Freshwater | Yes | Dropdown | Master lookup | [`water_withdrawal_uom`](#water_withdrawal_uom) | — |
| 5 | Source of Fresh Water | Yes | Dropdown | Master lookup | [`water_withdrawal_Source`](#water_withdrawal_source) | Ground Water / Municipal Water Supply / Surface Water / Other Third Party Sources |

---

## 13. Wastewater — Generation

| Field | Value |
| --- | --- |
| **Activity code** | `wastewater_generation` |
| **Parent code** | — |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/wastewater-generation/excel` |
| **Validation file** | `lib/organization-transaction/wastewater-generation/wastewatergeneration.validation.ts` |
| **Sheets** | 1 |

### Sheet: Wastewater Generation

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total Wastewater Generated from Domestic Use | Yes | Decimal | `≥ 0` | — | — |
| 4 | Total Wastewater Generated from Industrial Use | No | Decimal | `≥ 0` | — | — |
| 5 | UoM Wastewater | Yes | Dropdown | Master lookup | [`wastewater_uom`](#wastewater_uom) | — |
| 6 | Point of Wastewater Disposal | Yes | Dropdown | Master lookup | [`point_of_wastewater_disposal`](#point_of_wastewater_disposal) | — |

---

## 14. Wastewater — Treatment

| Field | Value |
| --- | --- |
| **Activity code** | `waste_water_treatment` |
| **Parent code** | — |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/wastewater-treatment/excel` |
| **Validation file** | `lib/organization-transaction/wastewater-treatment/waste-water-treatment.validation.ts` |
| **Sheets** | 3 — Wastewater Treatment, Effluent Discharge, Sludge Disposal |

### Sheet: Wastewater Treatment

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total Influent | Yes | Decimal | `≥ 0` | — | — |
| 4 | Total Treated Effluent | Yes | Decimal | `≥ 0` | — | Should be ≤ Total Influent (advisory) |
| 5 | UoM_Influent_Effluent | Yes | Dropdown | Master lookup | [`waste_water_treatment_uom_influent_effluent`](#waste_water_treatment_uom_influent_effluent) | — |
| 6 | Influent BOD Concentration | No | Decimal | `≥ 0` | — | — |
| 7 | Treated Effluent BOD Concentration | No | Decimal | `≥ 0` | — | — |
| 8 | UoM_BOD | Conditional | Dropdown | Required if any BOD value provided | [`waste_water_treatment_uom_bod`](#waste_water_treatment_uom_bod) | mg/l or g/l |
| 9 | Influent COD Concentration | No | Decimal | `≥ 0` | — | — |
| 10 | Treated Effluent COD Concentration | No | Decimal | `≥ 0` | — | — |
| 11 | UoM_COD | Conditional | Dropdown | Required if any COD value provided | [`waste_water_treatment_uom_cod`](#waste_water_treatment_uom_cod) | mg/l or g/l |

### Sheet: Effluent Discharge

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total Effluent Disposed Off | Yes | Decimal | `≥ 0` | — | — |
| 4 | UoM_Effluent | Yes | Dropdown | Master lookup | [`waste_water_treatment_uom_effluent`](#waste_water_treatment_uom_effluent) | — |
| 5 | Point of Discharge | Yes | Dropdown | Master lookup | [`waste_water_treatment_point_of_discharge`](#waste_water_treatment_point_of_discharge) | — |

### Sheet: Sludge Disposal

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total Sludge Disposed Off | Yes | Decimal | `≥ 0` | — | — |
| 4 | UoM_Sludge Disposed Off | Yes | Dropdown | Master lookup | [`waste_water_treatment_uom_sludgedisposedoff`](#waste_water_treatment_uom_sludgedisposedoff) | Kilogram / Tonne |
| 5 | Point of Sludge Disposal | Yes | Dropdown | Master lookup | [`waste_water_treatment_type_of_sludge_disposal`](#waste_water_treatment_type_of_sludge_disposal) | — |

---

## 15. Fugitive Emissions

| Field | Value |
| --- | --- |
| **Activity code** | `fugitive_details` |
| **Parent code** | `fugitive` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/fugitive/excel` |
| **Validation file** | `lib/organization-transaction/fugitive/fugitive-excel.validation.ts` |
| **Sheets** | 3 — Refrigerant and AC Systems, Fire Extinguisher, Industrial Gas |

### Sheet: Refrigerant and AC Systems

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Type of Refrigerant used | Yes | Dropdown | Master lookup | [`fugitive_type_of_refrigerant_used`](#fugitive_type_of_refrigerant_used) | R-410A, R-32, R-22, R-407C, R-134a, R-454B, R-23, R-404A, R-508B |
| 4 | Quantity of Refrigerant filled | Yes | Decimal | `≥ 0`, numeric only (no text/special chars) | — | — |
| 5 | UoM | Yes | Dropdown | Letters/numbers/spaces/hyphens; master lookup filtered by refrigerant | [`fugitive_type_of_refrigerant_uom`](#fugitive_type_of_refrigerant_uom) | Kilogram / Pound / Tonne (per refrigerant) |

### Sheet: Fire Extinguisher

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Gas used in Fire extinguisher | Yes | Dropdown | Master lookup | [`fugitive_gas_used_in_fire_extinguisher`](#fugitive_gas_used_in_fire_extinguisher) | CO2 / Nitrogen |
| 4 | Quantity of gas filled | Yes | Decimal | `≥ 0`, numeric only | — | — |
| 5 | UoM | Yes | Dropdown | Master lookup, filtered by gas | [`fugitive_gas_used_in_fire_extinguisher_uom`](#fugitive_gas_used_in_fire_extinguisher_uom) | Kilogram / Pound / Tonne |

### Sheet: Industrial Gas

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Type of Industrial Gas used | Yes | Dropdown | Master lookup | [`fugitive_type_of_industrial_gas_used`](#fugitive_type_of_industrial_gas_used) | CO2 / Methane / Nitrous Oxide / Argon–CO2 Mixture |
| 4 | Quantity of Industrial Gas filled | Yes | Decimal | `≥ 0`, numeric only | — | — |
| 5 | UoM | Yes | Dropdown | Master lookup, filtered by gas | [`fugitive_type_of_industrial_gas_used_uom`](#fugitive_type_of_industrial_gas_used_uom) | Mass UOMs for CO2/Methane/N2O; Litre or Cubic Metre for Argon–CO2 mixture |

---

## 16. Material Procurement

| Field | Value |
| --- | --- |
| **Activity code** | `material_procurement` |
| **Parent code** | `material` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/material-procurement/excel` |
| **Validation file** | `lib/organization-transaction/material-procurement/material-procurement-excel.validation.ts` |
| **Sheets** | 1 |
| **Max records** | 10,000 per upload |

### Sheet: Material Procurement

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Material Code | Yes | Text | Org material master | — | — |
| 4 | Supplier Code | Yes | Text | Org supplier master | — | — |
| 5 | Material Quantity Procured | Yes | Decimal | `> 0` | — | — |
| 6 | Material Quantity Procured UOM | Yes | Dropdown | Master lookup | [`material_procurement_material_quantity_procured_uom`](#material_procurement_material_quantity_procured_uom) | Group must match the material's UOM group across rows |

#### Conditional rules

- **UOM-group consistency** — within a single upload, all rows for the same Material Code must use UOMs from the same group (mass / volume / count). The same Material Code's UOM group must also match how that material is referenced in Material Master, Capital Goods, and Transport Upstream — otherwise: `UOM is not consistent for this Material, allowed UOMs are <list>`.
- Material × Supplier link must already exist in the org's procurement masters.

---

## 17. Capital Goods

| Field | Value |
| --- | --- |
| **Activity code** | `capital_goods` |
| **Parent code** | `capitalgoods` |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/capital-goods/excel` |
| **Validation file** | `lib/capital-goods/capital-goods-excel.validation.ts` |
| **Sheets** | 1 |
| **Max records** | 10,000 per upload |

### Sheet: Capital Goods

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Supplier Code | Yes | Text | Org supplier master (with `supplier_category = capital_goods`) | — | — |
| 4 | Material Code | Yes | Text | Org capital-goods material master | — | — |
| 5 | Quantity Procured | Yes | Decimal | `> 0` | — | — |
| 6 | UOM | Yes | Dropdown | Master lookup | [`capital_goods_quantity_procured_uom`](#capital_goods_quantity_procured_uom) | Mass (Kilogram, Tonne, …) or Count (Nos, EA) |

#### Conditional rules

- **UOM-group consistency** — same as Material Procurement. The chosen UOM's group (mass / count) must match how the same material code has been used elsewhere.

---

## 18. Buyer Share Attribution

| Field | Value |
| --- | --- |
| **Activity code** | `buyer_share` |
| **Parent code** | — |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/buyer-share/excel` |
| **Validation file** | `lib/organization-transaction/buyer-share-attribution/buyer-share-attribution-excel.validation.ts` |
| **Sheets** | 8 — paired Total + By for each of 4 allocation bases (Mass, Volume, Revenue, Number of Units) |

The template captures buyer-by-buyer attribution against four denominators. For each basis, a "Total" sheet records the facility's total production and the corresponding "By <Basis>" sheet records each buyer's share.

### Sheets

| Sheet name | Purpose |
| --- | --- |
| Total Mass | Total mass of products produced per period |
| By Mass | Buyer-wise mass procured |
| Total Volume | Total volume of products produced per period |
| By Volume | Buyer-wise volume procured |
| Total Revenue | Market value of products produced per period |
| By Revenue | Buyer-wise revenue (market value of products bought) |
| Total Number of Units | Total units produced per period |
| By Number of Units | Buyer-wise units procured |

### Common columns (all "Total" sheets)

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Total <Mass / Volume / Revenue / Units> | Yes | Decimal | `> 0` | — | — |
| 4 | UOM | Yes (Mass / Volume / Revenue) | Dropdown | Master lookup | [`buyer_share_by_mass_uom`](#buyer_share_by_mass_uom) / [`buyer_share_by_volume_uom`](#buyer_share_by_volume_uom) / [`buyer_share_by_revenue_uom`](#buyer_share_by_revenue_uom) | — |

### Common columns (all "By <Basis>" sheets)

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Buyer Name / Buyer Code | Yes | Text | Org buyer master | — | — |
| 4 | Quantity (Mass / Volume / Revenue / Units) | Yes | Decimal | `> 0` | — | — |
| 5 | UOM | Yes (Mass / Volume / Revenue) | Dropdown | Same master keys as Total | — | UOM must match the corresponding Total sheet |

#### Conditional rules

- **Total ≥ Σ buyer shares** — sum of buyer-wise allocations cannot exceed the period's Total. Excess fails validation.
- **UOM consistency** — the UOM in the "By" sheet must match the UOM declared in the corresponding "Total" sheet for the same period.

---

## 19. Product Share Allocation

| Field | Value |
| --- | --- |
| **Activity code** | `product_share_allocation` |
| **Parent code** | — |
| **API endpoint** | `POST /api/v1/ghg-data-import/transaction/product-share-allocation/template` |
| **Validation file** | `lib/organization-transaction/product-share-allocation/product-share-allocation-excel.validation.ts` |
| **Sheets** | 1 |

### Sheet: PCF Template

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Buyer's Name | Yes | Text | Org buyer master | — | — |
| 4 | Buyer's Material Code | Yes | Text | Org product master, linked to the buyer | — | — |
| 5 | Material Description | No | Text | Free text | — | Auto-filled from product master if blank |
| 6 | In % -> Quantity of a particular SKU purchased by a buyer vs total facility production across all SKUs | Yes | Decimal | `0 < value ≤ 100`, max 4 decimals | — | — |
| 7 | Rationale for percentage | Yes | Dropdown | Master lookup | [`product_share_allocation_rationale_for_percentage`](#product_share_allocation_rationale_for_percentage) | By Revenue / By Mass / By Volume / By No of units |

#### Conditional rules

- **Σ % per period ≤ 100** — within the same (Year, Month), the sum of all rows' percentages cannot exceed 100.

---

## 20. Human Resources

| Field | Value |
| --- | --- |
| **Activity code** | `human_resources` |
| **Parent code** | `humanresources` |
| **API endpoint** | `POST /api/v1/esg-data-import/transaction/human-resources/excel` |
| **Validation file** | `lib/organization-transaction/human-resources/human-resources.validations.ts` |
| **Sheets** | 3 — Employee Diversity, Employee Turnover, Training Hours |

### Sheet: Employee Diversity

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Employment Type | No | Dropdown / Text | Letters, spaces, slashes only; if used, must match master | [`human_resources_employment_type`](#human_resources_employment_type) | Permanent / Contractual |
| 4 | Employee Category | Yes | Dropdown / Text | Letters, spaces, slashes only; must match master | [`human_resources_employee_category`](#human_resources_employee_category) | — |
| 5 | Male Employees | Yes | Integer | `≥ 0`, whole number | — | No decimals — `cannot be a decimal. Please enter a whole number.` |
| 6 | Female Employees | Yes | Integer | `≥ 0`, whole number | — | — |
| 7 | Other Gender Employees | No | Integer | `≥ 0`, whole number | — | — |
| 8 | Minority Group Employees | No | Integer | `≥ 0`, whole number | — | — |
| 9 | Male Employees with Disabilities | No | Integer | `≥ 0`, whole number | — | — |
| 10 | Female Employees with Disabilities | No | Integer | `≥ 0`, whole number | — | — |
| 11 | Other Gender Employees with Disabilities | No | Integer | `≥ 0`, whole number | — | — |
| 12 | Under 30 years old | No | Integer | `≥ 0`, whole number | — | — |
| 13 | 30 to 50 years old | No | Integer | `≥ 0`, whole number | — | — |
| 14 | Above 50 years old | No | Integer | `≥ 0`, whole number | — | — |
| 15 | Average basic salary (Male) | No | Decimal | `≥ 0` | — | — |
| 16 | Average basic salary (Female) | No | Decimal | `≥ 0` | — | — |
| 17 | Average Remuneration (Male) | No | Decimal | `≥ 0` | — | — |
| 18 | Average Remuneration (Female) | No | Decimal | `≥ 0` | — | — |

### Sheet: Employee Turnover (annual)

> **No Month column** — this sheet is annual-only.

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Employment Type | No | Dropdown / Text | — | [`human_resources_employment_type`](#human_resources_employment_type) | — |
| 3 | Employee Category | Yes | Dropdown / Text | — | [`human_resources_employee_category`](#human_resources_employee_category) | — |
| 4 | Total Employees (Start of Period) | Yes | Integer | `≥ 0`, whole number | — | — |
| 5 | New Hires (During the period) | No | Integer | `≥ 0`, whole number | — | — |
| 6 | Exits (During the Period) | No | Integer | `≥ 0`, whole number | — | — |
| 7 | Number of Voluntary Exits | No | Integer | `≥ 0`, whole number | — | ≤ Exits |
| 8 | Number of Non Voluntary Exits | No | Integer | `≥ 0`, whole number | — | ≤ Exits |
| 9 | Average Tenure of Exiting Employees | No | Decimal | `≥ 0` | — | In years |

### Sheet: Training Hours

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Employment Type | No | Dropdown / Text | — | [`human_resources_employment_type`](#human_resources_employment_type) | — |
| 4 | Employee Category | Yes | Dropdown / Text | — | [`human_resources_employee_category`](#human_resources_employee_category) | — |
| 5 | Total Employees | Yes | Integer | `≥ 0`, whole number | — | — |
| 6 | Number of Employees Trained | Yes | Integer | `≥ 0`, ≤ Total Employees, whole number | — | — |
| 7 | Total Training Hours | Yes | Decimal | `≥ 0` | — | — |
| 8 | Training Type | No | Dropdown / Text | — | [`Health_and_Safety_Training_Type`](#health_and_safety_training_type) | Classroom / Drills / Virtual |
| 9 | Percentage Employees Certified (If Applicable) | No | Decimal | `0 ≤ value ≤ 100` | — | — |

---

## 21. Health & Safety

| Field | Value |
| --- | --- |
| **Activity code** | `health_and_safety` |
| **Parent code** | `healthandsafety` |
| **API endpoint** | `POST /api/v1/esg-data-import/transaction/health-and-safety/excel` |
| **Validation file** | `lib/organization-transaction/health-and-safety/health-and-safety.validation.ts` |
| **Sheets** | 4 — Health and Safety, Safety Observations, Health and Safety Training, Assessed Locations |

### Sheet: Health and Safety

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Workforce Type | Yes | Dropdown | Master lookup | [`Health_and_Safety_Workforce_Type`](#health_and_safety_workforce_type) | Permanent / Contractual |
| 4 | Workforce Category | Yes | Dropdown | Master lookup | [`Health_and_Safety_Workforce_Category`](#health_and_safety_workforce_category) | Employees / Workers |
| 5 | Total Man hours worked | Yes | Decimal | `≥ 0` | — | — |
| 6 | Fatalities Reported | No | Integer | `≥ 0`, whole number | — | — |
| 7 | High Consequence Work Related Injuries Reported | No | Integer | `≥ 0`, whole number | — | — |
| 8 | Total Recordable Injuries (TRI) | No | Integer | `≥ 0`, whole number | — | — |
| 9 | Lost Time Injuries (LTI) | No | Integer | `≥ 0`, whole number | — | ≤ TRI |
| 10 | Near Misses Reported | No | Integer | `≥ 0`, whole number | — | — |
| 11 | Lost Workdays (Due to Injury) | No | Integer | `≥ 0`, whole number | — | — |
| 12 | Number of First Aid Incidents | No | Integer | `≥ 0`, whole number | — | — |
| 13 | Medical Treatment Incidents | No | Integer | `≥ 0`, whole number | — | — |
| 14 | Number of people benefitted from regular health checkups | No | Integer | `≥ 0`, whole number | — | — |

### Sheet: Safety Observations

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Unsafe Acts/Behaviour Observations Reported | No | Integer | `≥ 0`, whole number | — | — |
| 4 | Total Safety Observations Closed/resolved | No | Integer | `≥ 0`, whole number | — | ≤ Observations Reported |
| 5 | Corrective Actions Closed | No | Integer | `≥ 0`, whole number | — | — |
| 6 | Number of Mock Drills conducted | No | Integer | `≥ 0`, whole number | — | — |
| 7 | Number of Fire Incidents reported | No | Integer | `≥ 0`, whole number | — | — |

### Sheet: Health and Safety Training

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Type of Workforce Trained | Yes | Dropdown | — | [`Health_and_Safety_Workforce_Type`](#health_and_safety_workforce_type) | — |
| 4 | Category of Workforce Trained | Yes | Dropdown | — | [`Health_and_Safety_Workforce_Category`](#health_and_safety_workforce_category) | — |
| 5 | Training Type | Yes | Dropdown | — | [`Health_and_Safety_Training_Type`](#health_and_safety_training_type) | — |
| 6 | Training Category | No | Text | Free text | — | E.g. fire-drill, ergonomics |
| 7 | Number of workforce trained | Yes | Integer | `≥ 0`, whole number | — | — |
| 8 | Total Training Hours | Yes | Decimal | `≥ 0` | — | — |
| 9 | Agency | Yes | Dropdown | — | [`Health_and_Safety_Agency`](#health_and_safety_agency) | Internal / External |

### Sheet: Assessed Locations (annual)

> **No Month column** — annual only.

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Total Locations | Yes | Integer | `≥ 0`, whole number | — | — |
| 3 | Number of Locations Assessed on Health and Safety Practices | No | Integer | `≥ 0`, ≤ Total Locations | — | — |
| 4 | Number of Locations Assessed on Working Conditions | No | Integer | `≥ 0`, ≤ Total Locations | — | — |
| 5 | Assessed by | Yes | Dropdown | — | [`Health_and_Safety_Assessed_By`](#health_and_safety_assessed_by) | Entity / Statutory Authority / Third Party |

---

## 22. Governance & Board Composition

| Field | Value |
| --- | --- |
| **Activity code** | `governance_and_board_composition` |
| **Parent code** | `boardandgovernance` |
| **API endpoint** | `POST /api/v1/esg-data-import/transaction/governance-and-board-composition/excel` |
| **Validation file** | `lib/organization-transaction/governance-and-board-composition/governance-and-board-composition-excel.validation.ts` |
| **Sheets** | 2 — Board Composition (annual), Governance |

### Sheet: Board Composition (annual)

> **No Month column** — annual only.

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Director Category | Yes | Dropdown | — | [`Board_Composition_and_Governance_Director_Category`](#board_composition_and_governance_director_category) | Independent / Executive / Non Executive |
| 3 | Number of Male Directors | Yes | Integer | `≥ 0`, whole number | — | — |
| 4 | Number of Female Directors | Yes | Integer | `≥ 0`, whole number | — | — |
| 5 | Number of Other Gender Directors | No | Integer | `≥ 0`, whole number | — | — |
| 6 | Number of Minority Group Directors | No | Integer | `≥ 0`, whole number | — | — |
| 7 | Number of Directors Under 30 years old | No | Integer | `≥ 0`, whole number | — | — |
| 8 | Number of Directors from 30 to 50 years old | No | Integer | `≥ 0`, whole number | — | — |
| 9 | Number of Directors Above 50 years old | No | Integer | `≥ 0`, whole number | — | — |
| 10 | Is the Board Chair Independent | Yes | Boolean | `Yes` / `No` | — | — |

### Sheet: Governance

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Compliance Issues | Yes | Dropdown | — | [`Board_Composition_and_Governance_Compliance_Issues`](#board_composition_and_governance_compliance_issues) | — |
| 3 | Stakeholder Category | Yes | Dropdown | — | [`Grievances_Stakeholder_Category`](#grievances_stakeholder_category) | — |
| 4 | Total Number of Issues | Yes | Integer | `≥ 0`, whole number | — | — |
| 5 | New Issues (Reporting period) | No | Integer | `≥ 0`, whole number, ≤ Total | — | — |
| 6 | Issues Resolved (Reporting period) | No | Integer | `≥ 0`, whole number, ≤ Total | — | — |

---

## 23. CSR

| Field | Value |
| --- | --- |
| **Activity code** | `csr` |
| **Parent code** | `csr_master` |
| **API endpoint** | `POST /api/v1/esg-data-import/transaction/csr/excel` |
| **Validation file** | `lib/organization-transaction/csr/csr-excel.validation.ts` |
| **Sheets** | 1 |

### Sheet: CSR (annual)

> **No Month column** — CSR data is captured annually.

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Project Name | Yes | Text | Free text | — | — |
| 3 | Theme of the Project | Yes | Dropdown | Master lookup | [`csr_themes`](#csr_themes) | One of the 14 official CSR themes |
| 4 | Number of Beneficiaries/Impact Created | No | Integer | `≥ 0`, whole number | — | — |
| 5 | Target Specified (in terms of impact/beneficiaries) | No | Text | Free text | — | — |
| 6 | Target Beneficiary Group/Impact Category | No | Text | Free text | — | — |
| 7 | Related SDGs | No | Text | Free text — comma-separated SDG numbers | — | E.g. `1, 3, 5` |
| 8 | Funds Earmarked for the Project for the year | No | Decimal | `≥ 0` | — | — |
| 9 | Annual Spend on the Project | Yes | Decimal | `≥ 0`, ≤ Funds Earmarked (advisory) | — | — |
| 10 | Currency | Yes | Dropdown | Master lookup | [`csr_currency_uom`](#csr_currency_uom) | INR / USD / GBP / EUR / CAD / JPY / CNY / AED / SAR |

---

## 24. Grievances

| Field | Value |
| --- | --- |
| **Activity code** | `grievances_activity` |
| **Parent code** | `grievances` |
| **API endpoint** | `POST /api/v1/esg-data-import/transaction/grievances/excel` |
| **Validation file** | `lib/organization-transaction/grievances/grievances-excel.validation.ts` |
| **Sheets** | 1 |

### Sheet: Grievances

#### Columns

| # | Column header | Required | Type | Validation | Master Key | Notes |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | Year | Yes | Year | See [Global rules](#year-column) | — | — |
| 2 | Month | Yes | Month | See [Global rules](#month-column) | — | — |
| 3 | Grievance Category | Yes | Text | Free text | — | E.g. POSH, harassment, working conditions |
| 4 | Stakeholder Category | Yes | Dropdown | Master lookup | [`Grievances_Stakeholder_Category`](#grievances_stakeholder_category) | Community / Investors / Shareholders / Employees / Workers / Customers / Value Chain Partners / Others |
| 5 | Total Number of Complaints | Yes | Integer | `≥ 0`, whole number | — | — |
| 6 | New Complaints (Reporting period) | No | Integer | `≥ 0`, whole number, ≤ Total | — | — |
| 7 | Complaints Resolved (Reporting period) | No | Integer | `≥ 0`, whole number, ≤ Total | — | — |

---

## Common error message catalogue

The platform surfaces validation errors verbatim in the response Excel file. Use this table to map error strings to triggers (helpful for support and self-troubleshooting).

| Error message | Source rule | Activities |
| --- | --- | --- |
| `<Field> is required` | Required-field check (Zod `.refine` or `.min(1)`) | All |
| `Year is required` | Year column blank | All |
| `The year entered is invalid` | Year not integer / out of 1900–2099 / leading zero / decimal | All |
| `Month is required` | Month column blank | All except CSR / Board Composition / annual sheets |
| `Invalid month` | Month not a valid English month name | All with Month |
| `Data can only be uploaded from the baseline month and year (<MM-YYYY>) onwards` | Period before org's baseline | All |
| `Invalid value : Data should be <comma-separated allowed labels>` | Master-data dropdown mismatch | All with dropdowns |
| `Invalid value: Data should be <filtered list>` | Master-data dropdown filtered by parent column | All with grouped dropdowns |
| `Invalid Entry: Please use only letters, spaces, hyphens (-), ampersands (&), and dots (.)` | Company-name regex (Grid Power) | Energy — Grid Power |
| `Maximum 100 characters allowed` | Length cap on company-name fields | Energy — Grid Power |
| `Please enter a valid numeric value for <field>` | Numeric parse failed | Most |
| `Please ensure that values are entered with up to 4 decimal places only` | Decimals exceed 4 | Energy — Grid Power |
| `Invalid Input: The value for <field> cannot be a decimal. Please enter a whole number.` | Decimal in count column | HR, H&S, Governance, Grievances |
| `Invalid Input: The value for <field> cannot be negative. Please enter a positive number.` | Negative count | HR, H&S, Governance, Grievances |
| `Invalid Input` | Invalid characters in name/category fields | HR |
| `Invalid Entry: Please enter a valid numeric value for <field>. Text or special characters are not allowed.` | Non-numeric in numeric field | HR, H&S, Fugitive |
| `Invalid Entry: The value for <field> cannot be negative. Please enter a positive number.` | Negative in non-negative numeric field | Fugitive |
| `<Source> company name is required when <source> power units are entered` | Paired-column rule | Energy — Grid Power |
| `Please enter a valid numeric value for <source> power` | Reverse paired-column rule | Energy — Grid Power |
| `At least one power source must have a value (Grid consumption, PPA Renewable, PPA Non-Renewable, or REC)` | All power columns blank | Energy — Grid Power |
| `Duplicate Entry, Multiple identical records found in the uploaded data for the same period` | Same period duplicated in upload or already in DB | Energy — Grid Power |
| `Material Procured Quantity is required if Material Procured Quantity UoM is given` | Quantity ↔ UOM pairing | Transport — Upstream |
| `Material Procured Quantity UoM is required if Material Procured Quantity is given` | Reverse pairing | Transport — Upstream |
| `Material Quantity should be a valid number` | Non-numeric quantity | Transport — Upstream |
| `Material Quantity should not contain alphabetic characters` | Alphabet in numeric | Transport — Upstream |
| `UOM is not consistent for this Material, allowed UOMs are <list>` | Cross-table material UOM-group mismatch | Transport — Upstream, Material Procurement, Capital Goods |
| `Material Procured Quantity UOM '<x>' belongs to '<group>' group. All Material Procured Quantity UOMs for the same Material Procured Code must belong to the same group across sheets` | Same-upload UOM-group inconsistency | Transport — Upstream |
| `Procured from Location Country must contain only alphabets` | Country regex | Transport — Upstream / Downstream |
| `Procured from Location Pincode must contain only letters, numbers, spaces, hyphens, and slashes` | Pincode regex | Transport — Upstream / Downstream / Business Travel |
| `Total Distance Travelled UoM is required if Total Distance Travelled is given` | Distance ↔ UOM pairing | Transport — Upstream |
| `Total Distance Travelled is required if Total Distance Travelled UoM is given` | Reverse pairing | Transport — Upstream |
| `Total Distance Travelled must be greater than 0` | Distance ≤ 0 | Transport — Upstream |
| `Number of SKUs should be a valid integer` | Non-integer SKU count | Transport — Downstream |
| `No production details found for this sku` | SKU not tied to a production task in the period | Energy — Fuel Purchased (Heating Water / AUX) |
| `SKU is required` | SKU column blank in Buyer-role upload | Energy — Fuel Purchased (Heating Water / AUX) |
| `Name of Third Party is required` | Conditional required | Waste |
| `Quantity of waste is required` | Required check | Waste |
| `Invalid quantity of waste` | Quantity ≤ 0 or non-numeric | Waste |
| `UoM Waste is required` | Required check | Waste |
| `Types of Waste Generated is required` | Required check | Waste |
| `Waste Disposal Managed by is required` | Required check | Waste |
| `Type of Refrigerant used is required` | Required check | Fugitive |
| `Quantity of Refrigerant filled is required` | Required check | Fugitive |
| `UoM is required` | Required check | Fugitive |
| `Invalid value: The data in this column must match the corresponding values in the respective column of the Master sheet.` | UOM regex / master mismatch | Fugitive |
| `Sheet '<name>' not found` | Required sheet missing | All |
| `No data found in sheet '<name>'` | Sheet present but empty | All |
| `Invalid number of operational days` | Operational days > days in month, ≤ 0, or decimal | General |
| `Number of Operational Days is required` | Blank | General |
| `Invalid number of employee` | Employees ≤ 0 or decimal | General |

---

## Submission workflow

1. **Download** the template from the activity's download link in the platform.
2. **Fill** the data following this guide. Do not rename sheets, columns, or change the column order.
3. **Upload** through the activity's bulk upload screen. The system synchronously validates the file.
4. **Review the response.** If any row fails, you receive an Excel mirror of your file with each failed cell populated by an error message. Successful rows in the same upload are accepted; you only need to re-upload corrected rows.
5. **Re-upload corrected rows** as a new file (do not re-upload already-accepted rows — they would create duplicates).

### Tips for clean uploads

- Use the dropdown picker the template provides — typing values manually risks typos.
- Always paste numeric values; avoid currency / `%` / unit suffixes inside numeric cells.
- Match Year and Month to your organization's financial-year configuration. If unsure, ask your implementation consultant for the baseline (Month, Year).
- For activities with grouped dropdowns (Mode → Fuel, Fuel → UOM, etc.), fill the parent column first — the child column's allowed values are filtered.
- For UOM-grouped materials (Transport Upstream, Material Procurement, Capital Goods), keep the same Material Code on the same UOM group across the entire upload and across activities.

---

*Generated from `shared/constants/activity.constant.ts`, `shared/constants/input.constant.ts`, the `lib/organization-transaction/<activity>/<activity>.validation.ts` files, and the live Hasura `ActivityMaster` table snapshot.*

