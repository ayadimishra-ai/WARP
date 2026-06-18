# Activity Data Excel Bulk Upload — Validation & Data Entry Guide

## General Rules (All Templates)

| Rule | Details |
|------|---------|
| **File format** | `.xlsx` only (no `.xls`, `.csv`) |
| **Year** | Integer between 1900–2099, no decimals, no leading zeros |
| **Month** | Full month name: `January`, `February`, `March`, `April`, `May`, `June`, `July`, `August`, `September`, `October`, `November`, `December` |
| **Year + Month** | Must fall within your organization's configured baseline period |
| **Sheet & column names** | Must match the template exactly (case-insensitive) |
| **Empty rows** | Trailing blank rows are ignored; at least one data row required |

---

## 1. General Details

**Sheet:** `General Details`

| # | Column | Required | Type | Validation Rules |
|---|--------|----------|------|------------------|
| 1 | Year | ✅ | Integer | 1900–2099 |
| 2 | Month | ✅ | Text | Valid month name |
| 3 | Number of Employees | ✅ | Integer | ≥ 0, whole number only |
| 4 | Number of Operational Days | ✅ | Integer | ≥ 0, whole number only |

---

## 2. Energy — Grid Power

**Sheet:** `Grid Power Details`

| # | Column | Required | Type | Validation Rules |
|---|--------|----------|------|------------------|
| 1 | Year | ✅ | Integer | 1900–2099 |
| 2 | Month | ✅ | Text | Valid month name |
| 3 | Name of Distribution Company | ❌ | Text | Only letters, spaces, hyphens, ampersand (`&`), dots (`.`) |
| 4 | Units of Power Consumed - Grid (in Kwh) | ❌ | Decimal | ≥ 0, max 15 digits, up to 4 decimal places |
| 5 | PPA Company Name - Renewable | ❌ | Text | Same as #3 |
| 6 | Units of Renewable power - PPA (in Kwh) | ❌ | Decimal | Same as #4 |
| 7 | PPA Company Name - Non Renewable | ❌ | Text | Same as #3 |
| 8 | Units of Non Renewable power - PPA (in Kwh) | ❌ | Decimal | Same as #4 |
| 9 | REC Company | ❌ | Text | Same as #3 |
| 10 | Units of power purchased - REC (in Kwh) | ❌ | Decimal | Same as #4 |

---

## 3. Energy — Captive Power

### Sheet: `Renewable Captive Power`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Type of Technology Used | ✅ | Text | Must match allowed value | **Solar**, **Wind**, **Hydro** |
| 4 | Installation Year | ✅ | Integer | ≥ 100, ≤ 2099, no decimals, no leading zeros | — |
| 5 | Unit of Energy Generated (in Kwh) | ❌ | Decimal | ≥ 0, max 15 digits, up to 2 decimal places | — |

### Sheet: `Non Renewable Captive Power`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Type of Fuel Used | ✅ | Text | Must match allowed value | **Coal**, **Diesel**, **Petcoke**, **Natural Gas**, **Jet Fuel** |
| 4 | Quantity of fuel consumed | ✅ | Decimal | Must be > 0 (strictly positive) | — |
| 5 | UoM for the Quantity of Fuel consumed | ✅ | Text | Depends on Fuel Type selected (see table below) | See grouped UoM table |
| 6 | Quality of fuel | ❌ | Decimal | > 0 if provided | — |
| 7 | Unit of Energy Generated (in Kwh) | ✅ | Decimal | ≥ 0, max 15 digits, up to 2 decimals | — |

**UoM for Non-Renewable Captive Power (grouped by fuel type):**

| Fuel Type | Allowed UoM Values |
|-----------|--------------------|
| Coal | Kilogram, Gram, Milligram, Tonne, Pound, Ounce |
| Diesel | Cubic metre, Litre, Millilitre, Gallon, Cubic foot, Fluid ounce |
| Petcoke | Kilogram, Gram, Milligram, Tonne, Pound, Ounce |
| Natural Gas | Cubic metre, Cubic Feet, Thousands of cubic feet |
| Jet Fuel | Litre |

### Renewable Fuel Types (if applicable)

| Fuel Type | Allowed Values |
|-----------|---------------|
| Type of Fuel | **Biomass**, **Bagasse** |

| Fuel Type | Allowed UoM |
|-----------|-------------|
| Biomass | Kilogram, Gram, Milligram, Tonne, Pound, Ounce |
| Bagasse | Kilogram, Gram, Milligram, Tonne, Pound, Ounce |

---

## 4. Energy — Fuel Purchased

### Sheet: `General Purpose`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Type of Fuel Consumption | ✅ | Text | Must match allowed value | **Diesel**, **Gasoline**, **CNG**, **LPG**, **Biodiesel**, **Ethanol**, **Kerosene**, **HSD**, **PNG**, **Biogas**, **Furnace Oil**, **Coal Bed Methane**, **Coal**, **Biomass-Rice Husk**, **Biomass-Briquette**, **Biomass-Others**, **Natural Gas**, **SKO**, **Coke (low ash)**, **Coke (high ash)**, **Pyroil**, **Hydrocarbon Oil**, **Coconut shell** |
| 4 | Quantity of Fuel Consumption | ✅ | Decimal | > 0 (strictly positive) | — |
| 5 | UoM for Fuel Consumption | ✅ | Text | Depends on Fuel Type (see table below) | See grouped UoM table |
| 6 | Quality of Fuel | ❌ | Decimal | > 0 if provided | — |
| 7 | Point of Consumption | ⚠️ **Conditional** | Text | **Required if Fuel Type = "Diesel"** | **Direct**, **DG Set** |

**UoM for General Purpose Fuel (grouped by fuel type):**

| Fuel Type(s) | Allowed UoM Values |
|--------------|--------------------|
| LPG, CNG, Coal, Biomass-Rice Husk, Biomass-Briquette, Biomass-Others, Natural Gas, Coconut shell | Kilogram |
| LPG, Kerosene, HSD, Furnace Oil, Biogas, Coal, Biomass-Rice Husk, Biomass-Briquette, Biomass-Others, Coke (low ash), Coke (high ash), Coconut shell | Tonne |
| Diesel, Gasoline, Biodiesel, Ethanol, CNG, Kerosene, Biogas, Natural Gas | Cubic metre |
| Diesel, Gasoline, Ethanol, Biodiesel, Kerosene, HSD, Furnace Oil, SKO, Pyroil, Hydrocarbon Oil | Litre |
| Diesel, Gasoline, Ethanol, Biodiesel, Kerosene | Millilitre, Gallon, Cubic foot, Fluid ounce |
| HSD, Petrol, Furnace Oil, Biogas | Terajoule |
| PNG, Natural Gas | MMBtu |
| Coal Bed Methane | Standard cubic meter |
| SKO, Pyroil, Hydrocarbon Oil | Kilolitre |
| PNG | Standard Cubic Meters |

### Sheet: `Heating Water`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Type of Fuel Consumption | ✅ | Text | Must match allowed value | **Diesel**, **CNG**, **LPG**, **Heavy Fuel Oil** |
| 4 | Quality of Fuel Consumption | ❌ | Decimal | > 0 if provided | — |
| 5 | SKUs applicable | ✅ | Text | Free text, cannot be empty | — |
| 6 | Quantity of Fuel Consumed | ✅ | Decimal | > 0 | — |
| 7 | UoM_Heating fuel | ✅ | Text | Depends on Fuel Type | See table below |

**UoM for Heating Water Fuel:**

| Fuel Type | Allowed UoM Values |
|-----------|--------------------|
| LPG | Kilogram, Tonne |
| CNG | Kilogram, Cubic metre |
| Diesel | Cubic metre, Litre, Millilitre, Gallon, Cubic foot, Fluid ounce |
| Heavy Fuel Oil | Cubic metre |

### Sheet: `AUX Fuel`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | AUX Fuel Types Consumption | ✅ | Text | Must match allowed value | **Gaseous Nitrogen**, **Gaseous Oxygen**, **Liquid Nitrogen**, **Compressed Air**, **Diesel**, **Ammonia**, **Aviation Turbine Fuel**, **Propane**, **Dissolved Acetylene Mixture**, **Jet Fuel**, **Acetylene** |
| 4 | SKUs applicable | ✅ | Text | Cannot be empty | — |
| 5 | Quantity of fuel Consumed | ✅ | Decimal | > 0 | — |
| 6 | UoM_AuxFuel | ✅ | Text | Depends on AUX Fuel Type | See table below |

**UoM for AUX Fuel (grouped):**

| AUX Fuel Type | Allowed UoM Values |
|---------------|--------------------|
| Gaseous Nitrogen | Kilogram, Normal cubic foot, Cubic Metre |
| Gaseous Oxygen | Standard Cubic Meters, Kilogram, Normal cubic foot, Cubic Metre |
| Liquid Nitrogen | Kilogram, Litre, Cubic Metre |
| Compressed Air | Standard Cubic Meters, Bar |
| Diesel | Litre, Cubic Metre, Millilitre, Gallon, Cubic foot, Fluid ounce |
| Ammonia | Cubic Metre |
| Aviation Turbine Fuel | US Gallon |
| Propane | Kilogram, Gram, Pound, Ounce |
| Dissolved Acetylene Mixture | Kilogram, Litre, Cubic Metre |
| Jet Fuel | Litre, Cubic Metre |
| Acetylene | Kilogram, Litre, Cubic Metre |

### Sheet: `Transportation`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Vehicle Type Used for Road Transport | ✅ | Text | Free text (e.g. truck type) | — |
| 4 | Type of Fuel Consumption | ✅ | Text | Depends on vehicle type (road only) | **Diesel**, **CNG**, **Refuse Derived Fuel**, **Gasoline**, **Jet Fuel** |
| 5 | Quantity of fuel Consumption | ✅ | Decimal | > 0 | — |
| 6 | UoM for fuel Consumption | ✅ | Text | Depends on fuel type | See table below |
| 7 | Distance travelled | ❌ | Decimal | ≥ 0 if provided | — |
| 8 | Transportation Type | ❌ | Text | — | **Upstream**, **Downstream**, **Internal** |

**UoM for Transportation Fuel:**

| Fuel Type | Allowed UoM Values |
|-----------|--------------------|
| Diesel, CNG, Gasoline | Cubic metre |
| Diesel, Gasoline, Jet Fuel | Litre |
| Diesel, Gasoline | Millilitre, Gallon, Cubic foot, Fluid ounce |
| CNG | Kilogram |
| Refuse Derived Fuel | Pound |

---

## 5. Transport — Upstream

### Sheet: `Upstream - Road`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Material Procured Code | ✅ | Text | Must exist in your organization's Material Master | — |
| 4 | Material Procured Quantity | ✅ | Decimal | > 0, no alphabetic chars | — |
| 5 | Material Procured Quantity UOM | ✅ | Text | Depends on material's measurement group | See table below |
| 6 | Supplier code | ✅ | Text | Must exist in your organization's Supplier Master | — |
| 7 | Procured from Location Country | ✅ | Text | Cannot be empty | — |
| 8 | Procured from Location Pincode | ✅ | Text | Letters, digits, hyphens, slashes, spaces only | — |
| 9 | Destination Location Country | ✅ | Text | Cannot be empty | — |
| 10 | Destination Location Pincode | ✅ | Text | Letters, digits, hyphens, slashes, spaces only | — |
| 11 | Type of Vehicle | ✅ | Text | Must match allowed value | **LDV**, **MDV**, **HDV** |
| 12 | Type of Fuel Used | ❌ | Text | Depends on mode (road group) | **Diesel**, **CNG**, **Gasoline**, **Jet Fuel**, **Electric**, **Hybrid Fuels**, **Light Diesel Oil**, **LNG** |
| 13 | Total Distance Travelled | ❌ | Decimal | ≥ 0 if provided | — |
| 14 | Total Distance Travelled UoM | ⚠️ Conditional | Text | Required if distance is provided | **Kilometer**, **Mile** |

**Material Procured Quantity UOM (grouped by measurement type):**

| Measurement Group | Allowed UoM Values |
|-------------------|--------------------|
| Mass | Kilogram, Gram, Milligram, Tonne, Pound, Ounce, Carat |
| Volume | Litre, Millilitre, Gallon, Kilolitre |
| Count | Nos, EA |

### Sheet: `Upstream - Rail_Air_Water`

Same as Road sheet except column 11 changes to:

| # | Column | Required | Allowed Values |
|---|--------|----------|----------------|
| 11 | Mode of Transport | ✅ | **Road**, **Rail**, **Water**, **Air** |

**Fuel types vary by mode:**

| Mode | Allowed Fuel Values |
|------|---------------------|
| Road | Diesel, CNG, Gasoline, Jet Fuel, Electric, Hybrid Fuels, Light Diesel Oil, LNG |
| Rail | Diesel, Electric, Hydrogen, Coal |
| Water | Diesel, Methanol, Kerosene |
| Air | Jet Fuel, SAF, Biojet Fuel, Electric |

---

## 6. Transport — Downstream

### Sheet: `Downstream - Road`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | SKU Code | ❌ | Text | Auto-uppercased | — |
| 4 | Number of SKUs | ✅ | Integer | ≥ 1 | — |
| 5 | Distributor Code | ✅ | Text | Cannot be empty | — |
| 6 | Distributed from Location Country | ✅ | Text | Cannot be empty | — |
| 7 | Distributed from Location Pincode | ✅ | Text | Letters, digits, hyphens, slashes, spaces only | — |
| 8 | Distributed to Location Country | ✅ | Text | Cannot be empty | — |
| 9 | Distributed to Location Pincode | ✅ | Text | Letters, digits, hyphens, slashes, spaces only | — |
| 10 | Type of Vehicle | ✅ | Text | Must match allowed value | **LDV**, **MDV**, **HDV** |
| 11 | Type of Fuel Used | ❌ | Text | Road-group fuels | **Diesel**, **CNG**, **Gasoline**, **Jet Fuel**, **Electric**, **Hydrogen Internal Combustion**, **Fuel Cell Hydrogen**, **Synthetic Fuels** |
| 12 | Total Distance Travelled | ⚠️ Conditional | Decimal | Required if UoM provided (and vice versa) | — |
| 13 | Total Distance Travelled UoM | ⚠️ Conditional | Text | Required if distance provided | **Kilometer**, **Mile** |

### Sheet: `Downstream - Rail_Air_Water`

Same structure — **Mode of Transport** replaces **Type of Vehicle**:

| Mode | Allowed Fuel Values |
|------|---------------------|
| Rail | Diesel, Electric, Solar Assisted Electric, Coal |
| Water | Diesel, Ultra Low Sulfur Fuel Oil, Kerosene |
| Air | Jet Fuel, SAF, Fischer Tropsch Synthetic Fuel, Electric |

---

## 7. Transport — Business Travel

**Sheet:** `Business Travel`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Trip Start Location Pincode | ✅ | Text | Letters, digits, hyphens, slashes, spaces only | — |
| 4 | Trip Start Location Country | ✅ | Text | Cannot be empty | — |
| 5 | Trip End Location Pincode | ✅ | Text | Letters, digits, hyphens, slashes, spaces. **Must differ from Start Pincode** (unless mode is Road) | — |
| 6 | Trip End Location Country | ✅ | Text | Cannot be empty | — |
| 7 | Number Of Employees | ✅ | Integer | > 0 | — |
| 8 | Mode of Transport | ✅ | Text | Must match allowed value | **Road**, **Rail**, **Air** |
| 9 | Vehicle Type Used | ✅ | Text | Depends on Mode of Transport | See table below |
| 10 | Fuel Used | ✅ | Text | Depends on Mode of Transport | See table below |

**Vehicle Type (grouped by mode):**

| Mode | Allowed Vehicle Types |
|------|----------------------|
| Road | **4 wheeler**, **Bus**, **2 wheeler**, **3 wheeler** |
| Rail | **Suburban**, **Non suburban** |
| Air | **Airplane** |

**Fuel Used (grouped by mode):**

| Mode | Allowed Fuel Values |
|------|---------------------|
| Road | Diesel, Petrol, CNG, Jet Fuel, Electric |
| Rail | Diesel, Coal, Electric |
| Air | Jet Fuel, SAF, Electric |

---

## 8. Transport — Employee Travel

**Sheet:** `Employee Travel`

All travel mode columns follow the **same pattern** (Percentage → Distance → UoM). At least **one** travel mode must have data.

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | % Employees by Company Bus | ❌ | Decimal | 0–100 | — |
| 4 | Avg Daily Distance by Office Bus | ❌ | Decimal | ≥ 0 | — |
| 5 | UoM_CompBus | ⚠️ Conditional | Text | Required if distance (#4) provided | **Kilometer**, **Mile** |
| 6 | % Employees by Public/Contracted Bus | ❌ | Decimal | 0–100 | — |
| 7 | Avg Daily Distance by Public Bus | ❌ | Decimal | ≥ 0 | — |
| 8 | UoM_PubBus | ⚠️ Conditional | Text | Required if distance (#7) provided | **Kilometer**, **Mile** |
| 9 | % Employees by Public Transport - 4 Wheeler | ❌ | Decimal | 0–100 | — |
| 10 | Avg Distance by Public 4 Wheeler | ❌ | Decimal | ≥ 0 | — |
| 11 | UoM_4PubWheel | ⚠️ Conditional | Text | Required if distance (#10) provided | **Kilometer**, **Mile** |
| 12 | % Employees by Public Transport - 3 Wheeler | ❌ | Decimal | 0–100 | — |
| 13 | Avg Distance by Public 3 Wheeler | ❌ | Decimal | ≥ 0 | — |
| 14 | UoM_3PubWheel | ⚠️ Conditional | Text | Required if distance (#13) provided | **Kilometer**, **Mile** |
| 15 | % Employees by Private Vehicle - 4 Wheeler | ❌ | Decimal | 0–100 | — |
| 16 | Avg Distance by Private 4 Wheeler | ❌ | Decimal | ≥ 0 | — |
| 17 | UoM_4PvtWheel | ⚠️ Conditional | Text | Required if distance (#16) provided | **Kilometer**, **Mile** |
| 18 | % Employees by Private Vehicle - 2 Wheeler | ❌ | Decimal | 0–100 | — |
| 19 | Avg Distance by Private 2 Wheeler | ❌ | Decimal | ≥ 0 | — |
| 20 | UoM_2PvtWheel | ⚠️ Conditional | Text | Required if distance (#19) provided | **Kilometer**, **Mile** |
| 21 | % Employees by Rail - Suburban | ❌ | Decimal | 0–100 | — |
| 22 | Avg Distance by Rail - Suburban | ❌ | Decimal | ≥ 0 | — |
| 23 | UoM_rail | ⚠️ Conditional | Text | Required if distance (#22) provided | **Kilometer**, **Mile** |

---

## 9. Waste

**Sheet:** `Waste Produced Data`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Types of Waste Generated | ✅ | Text | Free text, cannot be empty | — |
| 4 | Waste Disposal Managed by | ✅ | Text | Must match allowed value | **Self**, **Third Party** |
| 5 | Name of Third Party | ⚠️ Conditional | Text | **Required if #4 = "Third Party"** | Free text |
| 6 | Quantity of Waste | ✅ | Decimal | ≥ 0 | — |
| 7 | UoM_Waste | ✅ | Text | Must match allowed value | **Kilogram**, **Gram**, **Milligram**, **Tonne**, **Pound**, **Ounce**, **Cubic metre**, **Litre**, **Millilitre**, **Gallon**, **Cubic foot**, **Fluid ounce** |
| 8 | Disposal Mechanism | ❌ | Text | — | **Landfilled**, **Recycled**, **Upcycled**, **Co-processed**, **Incinerated**, **Reused** |
| 9 | Location of Waste Disposal | ❌ | Text | Free text | — |
| 10 | Waste Transportation Managed By | ❌ | Text | — | **Self**, **Third Party** |
| 11 | Mode of Transport | ❌ | Text | — | **Road**, **Rail** |
| 12 | Vehicle Type Used for Road Transport | ⚠️ Conditional | Text | **Required if Mode = "Road"** | **LDV**, **MDV**, **HDV** |
| 13 | Fuel Used | ❌ | Text | Depends on Mode of Transport | See table below |
| 14 | Distance of Waste Disposal Location from Facility | ❌ | Decimal | > 0 if provided | — |
| 15 | UoM (Distance) | ❌ | Text | — | **Kilometer**, **Mile** |

**Waste Transport Fuel (grouped by mode):**

| Mode | Allowed Fuel Values |
|------|---------------------|
| Road | Diesel, CNG, Jet Fuel, Electric, Fischer Tropsch Fuel, Hydrogen Fuel Cell, Ultra Low Sulfur Diesel |
| Rail | Diesel, Coal, Electric, Battery Diesel Hybrid |

---

## 10. Water Withdrawal

**Sheet:** `Water Withdrawal`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Total Fresh Water Withdrawal | ✅ | Decimal | ≥ 0 | — |
| 4 | UoM Freshwater | ✅ | Text | Must match allowed value | **Litre**, **Gallon**, **Million Litres**, **Kilolitres**, **m3** |
| 5 | Source of Fresh Water | ✅ | Text | Must match allowed value | **Ground Water**, **Municipal Water Supply**, **Surface Water**, **Other Third Party Sources** |

> ⚠️ **Duplicate check:** No two rows can have the same `Year + Month + Source of Fresh Water` combination.

---

## 11. Water Consumption

Three sheets with identical structure:

### Sheet: `Freshwater Use` / `Wastewater Reuse` / `Harvested Water Use`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Total [type] for Domestic Use | ✅ | Decimal | ≥ 0 | — |
| 4 | Total [type] for Industrial Use | ❌ | Decimal | ≥ 0 (defaults to 0 if empty) | — |
| 5 | Total [type] for Landscaping | ❌ | Decimal | ≥ 0 (defaults to 0) | — |
| 6 | Total [type] for Miscellaneous Uses | ❌ | Decimal | ≥ 0 (defaults to 0) | — |
| 7 | UoM | ✅ | Text | Must not be a number | **Litre**, **Gallon**, **Million Litres**, **Kilolitres**, **m3** |

---

## 12. Wastewater Generation

**Sheet:** `Wastewater Generation`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Total Wastewater Generated from Domestic Use | ✅ | Decimal | ≥ 0 | — |
| 4 | Total Wastewater Generated from Industrial Use | ❌ | Decimal | ≥ 0 (defaults to 0) | — |
| 5 | UoM Wastewater | ✅ | Text | Must not be a number | **Litre**, **Gallon**, **Million Litres**, **Kilolitres**, **m3** |
| 6 | Point of Wastewater Disposal | ❌ | Text | — | **Surface Water Body**, **Third Party Sewage System**, **Land Application**, **Others**, **Groundwater** |

> ⚠️ **Duplicate check:** Unique key is `Year + Month` (or `Year + Month + Disposal Point` if provided).

---

## 13. Wastewater Treatment

### Sheet: `Wastewater Treatment`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Total Influent | ✅ | Decimal | ≥ 0 | — |
| 4 | Total Treated Effluent | ✅ | Decimal | ≥ 0, **must be ≤ Total Influent** | — |
| 5 | UoM_Influent_Effluent | ✅ | Text | Cannot be empty | **Litre**, **Gallon**, **Million Litre**, **Kilolitre**, **m3** |
| 6 | Influent BOD Concentration | ⚠️ Conditional | Decimal | ≥ 0. **If any BOD/COD column has a value, ALL BOD/COD columns + their UoMs become required** | — |
| 7 | Treated Effluent BOD Concentration | ⚠️ Conditional | Decimal | ≥ 0, **must be ≤ Influent BOD** | — |
| 8 | UoM_BOD | ⚠️ Conditional | Text | Required if any BOD value provided | **mg/l**, **g/l** |
| 9 | Influent COD Concentration | ⚠️ Conditional | Decimal | ≥ 0 | — |
| 10 | Treated Effluent COD Concentration | ⚠️ Conditional | Decimal | ≥ 0, **must be ≤ Influent COD** | — |
| 11 | UoM_COD | ⚠️ Conditional | Text | Required if any COD value provided | **mg/l**, **g/l** |

### Sheet: `Effluent Discharge`

| # | Column | Required | Type | Allowed Values |
|---|--------|----------|------|----------------|
| 1 | Year | ✅ | Integer | — |
| 2 | Month | ✅ | Text | — |
| 3 | Total Effluent Disposed Off | ✅ | Decimal (≥ 0) | — |
| 4 | UoM_Effluent | ✅ | Text | **Litre**, **Gallon**, **Million Litre**, **Kilolitre**, **m3** |
| 5 | Point of Discharge | ✅ | Text | **Surface Water Body**, **Third Party Sewer System**, **Land Application**, **Others** |

### Sheet: `Sludge Disposal`

| # | Column | Required | Type | Allowed Values |
|---|--------|----------|------|----------------|
| 1 | Year | ✅ | Integer | — |
| 2 | Month | ✅ | Text | — |
| 3 | Total Sludge Disposed Off | ✅ | Decimal (≥ 0) | — |
| 4 | UoM_Sludge Disposed Off | ✅ | Text | **Kilogram**, **Tonne** |
| 5 | Point of Sludge Disposal | ✅ | Text | **Surface Water Body**, **Incineration**, **Land Application**, **Others**, **Co-processing** |

---

## 14. Fugitive Emissions

### Sheet: `Refrigerant and AC Systems`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Type of Refrigerant used | ✅ | Text | Must match allowed value | **R-410A**, **R-32**, **R-22**, **R-407C**, **R-134a**, **R-454B**, **R-23**, **R-404A**, **R-508B** |
| 4 | Quantity of Refrigerant filled | ✅ | Decimal | ≥ 0 | — |
| 5 | UoM | ✅ | Text | Must contain at least one letter; depends on refrigerant type | **Kilogram**, **Pound**, **Tonne** (all types) |

### Sheet: `Fire Extinguisher`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Gas used in Fire extinguisher | ✅ | Text | Must match allowed value | **CO2**, **Nitrogen** |
| 4 | Quantity of gas filled | ✅ | Decimal | ≥ 0 | — |
| 5 | UoM | ✅ | Text | Depends on gas type | See table below |

| Gas Type | Allowed UoM |
|----------|-------------|
| CO2 | Kilogram, Pound, Tonne |
| Nitrogen | Tonne, Kilogram, Pound |

### Sheet: `Industrial Gas`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Type of Industrial Gas used | ✅ | Text | Must match allowed value | **CO2**, **Methane**, **Nitrous Oxide**, **Argon–CO2 Mixture** |
| 4 | Quantity of Industrial Gas filled | ✅ | Decimal | ≥ 0 | — |
| 5 | UoM | ✅ | Text | Depends on gas type | See table below |

| Gas Type | Allowed UoM |
|----------|-------------|
| CO2 | Kilogram, Pound, Tonne |
| Methane | Tonne, Kilogram, Pound |
| Nitrous Oxide | Tonne, Kilogram, Pound |
| Argon–CO2 Mixture | Litre, Cubic Metre |

---

## 15. Material Procurement

**Sheet:** `Material Procurement`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Material Code | ✅ | Text | Must exist in your organization's Material Master. **Materials of type "Capital Goods" are rejected** — use the Capital Goods template instead | — |
| 4 | Supplier Code | ✅ | Text | Must exist in your organization's Supplier Master | — |
| 5 | Material Quantity Procured | ✅ | Decimal | > 0 (strictly positive, zero not allowed) | — |
| 6 | Material Quantity Procured UOM | ✅ | Text | Depends on material measurement group | See table below |

**UOM (grouped by measurement type):**

| Measurement Group | Allowed UoM Values |
|-------------------|--------------------|
| Mass | Kilogram, Gram, Milligram, Tonne, Pound, Ounce, Carat |
| Volume | Litre, Millilitre, Kilolitre, Gallon |
| Count | EA, Nos |

> ⚠️ **UOM consistency rule:** The UOM group (mass/volume/count) must remain consistent for the same material across Material Procurement, Transport Upstream, and Material Master records.

---

## 16. Capital Goods

**Sheet:** `Capital Goods`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Supplier Code | ✅ | Text | Must exist in your organization's Supplier Master | — |
| 4 | Material Code | ✅ | Text | Must exist in your Material Master **with type = "Capital Goods"** | — |
| 5 | Quantity Procured | ✅ | Decimal | ≥ 0.01, ≤ 999,999,999.99, max 2 decimal places, digits only (no %, no letters, no negative signs) | — |
| 6 | UOM | ✅ | Text | Letters only; depends on measurement group | See table below |

**UOM (grouped by measurement type):**

| Measurement Group | Allowed UoM Values |
|-------------------|--------------------|
| Mass | Kilogram, Tonne, Gram, Milligram, Pound, Ounce |
| Count | Nos, EA |

> ⚠️ **Consistency rule:** All UOMs for the same Material Code must belong to the same group.

---

## 17. Production

**Sheet:** `Production`

| # | Column | Required | Type | Validation Rules |
|---|--------|----------|------|------------------|
| 1 | Year | ✅ | Integer | 1900–2099 |
| 2 | Month | ✅ | Text | Valid month name |
| 3 | Manufactured Product Code | ✅ | Text | Cannot be empty |
| 4 | Process Employeed | ❌ | Text | Free text |
| 5 | Manufactured SKU Code | ✅ | Text | Cannot be empty |
| 6 | Units of SKU Manufactured | ✅ | Decimal | ≥ 0 |
| 7 | What % of Total Production Represents Production of SKU | ❌ | Decimal | 0–100 |

---

## 18. Human Resources

### Sheet: `Employee Diversity`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Employment Type | ❌ | Text | Letters, spaces, slashes only | **Permanent**, **Contractual** |
| 4 | Employee Category | ✅ | Text | Letters, spaces, slashes only | **Executive Management**, **Senior Management**, **Middle Management**, **Junior Management**, **Professional/Staff**, **Workers**, **Unskilled/Support Staff** |
| 5 | Male Employees | ✅ | Integer | ≥ 0, no decimals | — |
| 6 | Female Employees | ✅ | Integer | ≥ 0, no decimals | — |
| 7 | Other Gender Employees | ❌ | Integer | ≥ 0 | — |
| 8 | Minority Group Employees | ❌ | Integer | ≥ 0 | — |
| 9 | Male Employees with Disabilities | ❌ | Integer | ≥ 0 | — |
| 10 | Female Employees with Disabilities | ❌ | Integer | ≥ 0 | — |
| 11 | Other Gender Employees with Disabilities | ❌ | Integer | ≥ 0 | — |
| 12 | Under 30 years old | ❌ | Integer | ≥ 0 | — |
| 13 | 30 to 50 years old | ❌ | Integer | ≥ 0 | — |
| 14 | Above 50 years old | ❌ | Integer | ≥ 0 | — |
| 15 | Average basic salary (Male) | ❌ | Decimal | ≥ 0 | — |
| 16 | Average basic salary (Female) | ❌ | Decimal | ≥ 0 | — |
| 17 | Average Remuneration (Male) | ❌ | Decimal | ≥ 0 | — |
| 18 | Average Remuneration (Female) | ❌ | Decimal | ≥ 0 | — |

### Sheet: `Employee Turnover` (Year only — no Month column)

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Employment Type | ❌ | Text | Letters, spaces, slashes only | **Permanent**, **Contractual** |
| 3 | Employee Category | ✅ | Text | Letters, spaces, slashes only | Same as Employee Diversity |
| 4 | Total Employees (Start of Period) | ✅ | Integer | ≥ 0 | — |
| 5 | New Hires (During the period) | ✅ | Integer | ≥ 0 | — |
| 6 | Exits (During the Period) | ✅ | Integer | ≥ 0 | — |
| 7 | Number of Voluntary Exits | ❌ | Integer | ≥ 0 | — |
| 8 | Number of Non Voluntary Exits | ❌ | Integer | ≥ 0 | — |
| 9 | Average Tenure of Exiting Employees | ❌ | Decimal | ≥ 0 | — |

### Sheet: `Training Hours`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Employment Type | ❌ | Text | Letters, spaces, slashes only | **Permanent**, **Contractual** |
| 4 | Employee Category | ✅ | Text | Same rules | Same as Employee Diversity |
| 5 | Total Employees | ✅ | Integer | ≥ 0 | — |
| 6 | Number of Employees Trained | ✅ | Integer | ≥ 0 | — |
| 7 | Total Training Hours | ✅ | Decimal | ≥ 0 | — |
| 8 | Training Type | ❌ | Text | Free text | — |
| 9 | % Employees Certified (If Applicable) | ❌ | Decimal | 0–100 | — |

---

## 19. Health & Safety

### Sheet: `Health and Safety` (Incidents)

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Workforce Type | ✅ | Text | Must not be a number | **Permanent**, **Contractual** |
| 4 | Workforce Category | ✅ | Text | Must not be a number | **Employees**, **Workers** |
| 5 | Total Man hours worked | ✅ | Decimal | ≥ 0 | — |
| 6 | Fatalities Reported | ❌ | Integer | ≥ 0 | — |
| 7 | High Consequence Work Related Injuries | ❌ | Integer | ≥ 0 | — |
| 8 | Total Recordable Injuries (TRI) | ❌ | Integer | ≥ 0 | — |
| 9 | Lost Time Injuries (LTI) | ❌ | Integer | ≥ 0 | — |
| 10 | Near Misses Reported | ❌ | Integer | ≥ 0 | — |
| 11 | Lost Workdays (Due to Injury) | ❌ | Decimal | ≥ 0 (decimals allowed) | — |
| 12 | Number of First Aid Incidents | ❌ | Integer | ≥ 0 | — |
| 13 | Medical Treatment Incidents | ❌ | Integer | ≥ 0 | — |
| 14 | Number of people benefitted from health checkups | ❌ | Integer | ≥ 0 | — |

### Sheet: `Safety Observations`

| # | Column | Required | Type | Validation Rules |
|---|--------|----------|------|------------------|
| 1 | Year | ✅ | Integer | 1900–2099 |
| 2 | Month | ✅ | Text | Valid month name |
| 3 | Unsafe Acts/Behaviour Observations Reported | ❌ | Integer | ≥ 0 |
| 4 | Total Safety Observations Closed/Resolved | ❌ | Integer | ≥ 0 |
| 5 | Corrective Actions Closed | ❌ | Integer | ≥ 0 |
| 6 | Number of Mock Drills Conducted | ❌ | Integer | ≥ 0 |
| 7 | Number of Fire Incidents Reported | ❌ | Integer | ≥ 0 |

### Sheet: `Health and Safety Training`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | — | — |
| 2 | Month | ✅ | Text | — | — |
| 3 | Type of Workforce Trained | ✅ | Text | Letters, digits, spaces only | **Permanent**, **Contractual** |
| 4 | Category of Workforce Trained | ✅ | Text | Letters, digits, spaces only | **Employees**, **Workers** |
| 5 | Training Type | ❌ | Text | Letters, digits, spaces only | **Classroom**, **Drills**, **Virtual** |
| 6 | Training Category | ❌ | Text | Letters, digits, spaces, hyphens, apostrophes, ampersands | — |
| 7 | Number of workforce trained | ❌ | Integer | ≥ 0 | — |
| 8 | Total Training Hours | ❌ | Decimal | ≥ 0 | — |
| 9 | Agency | ❌ | Text | Letters, digits, spaces only | **Internal**, **External** |

### Sheet: `Assessed Locations`

| # | Column | Required | Type | Allowed Values |
|---|--------|----------|------|----------------|
| 1 | Year | ✅ | Integer | — |
| 2 | Total Locations | ✅ | Integer (≥ 0) | — |
| 3 | Locations Assessed on Health and Safety | ✅ | Integer (≥ 0) | — |
| 4 | Locations Assessed on Working Conditions | ✅ | Integer (≥ 0) | — |
| 5 | Assessed by | ✅ | Text | **Entity**, **Statutory Authority**, **Third Party** |

---

## 20. Governance & Board Composition

### Sheet: `Board Composition`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Director Category | ✅ | Text | Cannot be empty | **Independent**, **Executive**, **Non Executive** |
| 3 | Number of Male Directors | ✅ | Integer | ≥ 0, no decimals | — |
| 4 | Number of Female Directors | ✅ | Integer | ≥ 0, no decimals | — |
| 5 | Number of Other Gender Directors | ❌ | Integer | ≥ 0 | — |
| 6 | Number of Minority Group Directors | ❌ | Integer | ≥ 0 | — |
| 7 | Number of Directors Under 30 years old | ❌ | Integer | ≥ 0 | — |
| 8 | Number of Directors from 30 to 50 years old | ❌ | Integer | ≥ 0 | — |
| 9 | Number of Directors Above 50 years old | ❌ | Integer | ≥ 0 | — |
| 10 | Is the Board Chair Independent | ❌ | Text | Free text | — |

### Sheet: `Governance`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Compliance Issues | ❌ | Text | Defaults to blank | **Whistleblower Case**, **Bribery and Corruption**, **Ethics Violation**, **Regulatory fines/Legal Non Compliances**, **Conflict of Interest** |
| 3 | Stakeholder Category | ❌ | Text | Letters, digits, spaces, punctuation allowed | — |
| 4 | Total Number of Issues | ❌ | Integer | ≥ 0, whole number | — |
| 5 | New Issues (Reporting period) | ✅ | Integer | ≥ 0, whole number | — |
| 6 | Issues Resolved (Reporting period) | ✅ | Integer | ≥ 0, whole number | — |

---

## 21. CSR

**Sheet:** `CSR`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Project Name | ✅ | Text | Letters, digits, spaces only (no special chars) | — |
| 3 | Theme of the Project | ✅ | Text | Must match allowed value | **Hunger, poverty and malnutrition**, **Education, vocational skills and livelihood**, **Gender equality, empowering women and senior citizens**, **Art and culture protection**, **Armed Forces Veteran Benefits**, **Promoting Sports**, **Contribution to PM Relief Fund**, **Contribution to incubators and R&D projects**, **Slum and Rural Development**, **Disaster Management**, **Research and Development**, **Environment Sustainability**, **Incubators and Startups**, **Health and Sanitation** |
| 4 | Number of Beneficiaries/Impact Created | ❌ | Decimal | ≥ 0 | — |
| 5 | Target Specified | ❌ | Decimal | ≥ 0 | — |
| 6 | Target Beneficiary Group/Impact Category | ❌ | Text | Letters, digits, spaces only | — |
| 7 | Related SDGs | ❌ | Any | Free text | — |
| 8 | Funds Earmarked for the Project for the year | ❌ | Decimal | ≥ 0 | — |
| 9 | Annual Spend on the Project | ❌ | Decimal | ≥ 0 | — |
| 10 | Currency | ❌ | Text | Letters, digits, spaces only | **INR**, **USD**, **GBP**, **EUR**, **CAD**, **JPY**, **CNY**, **AED**, **SAR** |

> ⚠️ **Duplicate check:** No two rows can have the same `Year + Theme + Project Name`.

---

## 22. Grievances

**Sheet:** `Grievances`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | 1900–2099 | — |
| 2 | Month | ✅ | Text | Valid month name | — |
| 3 | Grievance Category | ❌ | Text | Letters, digits, spaces, punctuation; cannot start with hyphen | — |
| 4 | Stakeholder Category | ❌ | Text | — | **Community**, **Investors (other than shareholders)**, **Shareholders**, **Employees**, **Workers**, **Customers**, **Value Chain Partners**, **Others** |
| 5 | Total Number of Complaints | ❌ | Integer | ≥ 0, no decimals | — |
| 6 | New Complaints (Reporting period) | ✅ | Integer | ≥ 0 | — |
| 7 | Complaints Resolved (Reporting period) | ✅ | Integer | ≥ 0 | — |

> ⚠️ **Duplicate check:** Unique key = `Year + Month + Grievance Category + Stakeholder Category`.

---

## 23. Buyer Share Attribution

**Template varies based on chosen allocation method.** Each method has a **Total** sheet and a **By Buyer** sheet.

### Method: By Mass

**Sheet: `Total Mass`**

| # | Column | Required | Type | Allowed Values |
|---|--------|----------|------|----------------|
| 1 | Year | ✅ | Integer | — |
| 2 | Month | ✅ | Text | — |
| 3 | Total Mass of Products Produced in the Facility | ✅ | Decimal (≥ 0) | — |
| 4 | UoM | ✅ | Text | **Kilogram**, **Tonne**, **Pound**, **Ounce** |

**Sheet: `By Mass`**

| # | Column | Required | Type |
|---|--------|----------|------|
| 1 | Year | ✅ | Integer |
| 2 | Month | ✅ | Text |
| 3 | Buyer Name | ✅ | Text (cannot be empty) |
| 4 | Mass of Products Purchased by Buyer | ✅ | Decimal (≥ 0) |

### Method: By Volume

**Sheet: `Total Volume`** — UoM allowed: **Cubic metre**, **Litre**, **Barrel**, **Gallon**, **Cubic foot**, **Fluid ounce**

**Sheet: `By Volume`** — `Volume of Products Purchased by Buyer` (Decimal ≥ 0)

### Method: By Revenue

**Sheet: `Total Revenue`** — UoM allowed: **INR**, **USD**, **GBP**

**Sheet: `By Revenue`** — `Market Value of Products Purchased by Buyer` (Decimal ≥ 0)

### Method: By Number of Units

**Sheet: `Total Number of Units`** — `Total Number of Units Produced` (Integer ≥ 0)

**Sheet: `By Number of Units`** — `Number of Units Purchased by Buyer` (Integer ≥ 0, no decimals)

---

## 24. Product Share Allocation

**Sheet:** `PCF Template`

| # | Column | Required | Type | Validation Rules | Allowed Values |
|---|--------|----------|------|------------------|----------------|
| 1 | Year | ✅ | Integer | Cannot be a future year | — |
| 2 | Month | ✅ | Text | Cannot be current or future month | — |
| 3 | Buyer's Name | ✅ | Text | Cannot be empty | — |
| 4 | Buyer's Material Code | ✅ | Text | Must exist in Supplier Material Mapping | — |
| 5 | Buyer's Material Name | ✅ | Text | Cannot be empty | — |
| 6 | In % → SKU purchased vs total production | ✅ | Decimal | 0–100, max 4 decimal places | — |
| 7 | Rationale for percentage | ✅ | Text | Must match allowed value. **All rows must have the same rationale.** Must match any existing rationale in the system for this facility. | **By Revenue**, **By Mass**, **By Volume**, **By No of units** |

> ⚠️ **Duplicate check:** Unique key = `Year + Month + Buyer's Material Code`. Rejects if record already exists in the database.

---

## Legend

| Symbol | Meaning |
|--------|---------|
| ✅ | Required — row will be rejected if empty |
| ❌ | Optional — can be left blank |
| ⚠️ Conditional | Required only when a specific condition is met (see rules column) |
| Decimal | Numeric with decimal places allowed |
| Integer | Whole number only, no decimal point |
| Text | String value |