# Category 11 – Use of Sold Products - Requirements Document

## 1. Overview

Category 11 captures emissions generated during the **use phase** of products sold by the reporting company. Emissions are attributed to the energy, fuel, or refrigerant consumed/leaked when the end user operates the product.

**Examples:**

- An AC manufacturer reports emissions from refrigerant leakage during product use.
- A tire manufacturer reports emissions from fuel/electricity consumed by vehicles using their tires.
- An appliance manufacturer reports electricity consumed by their appliances during customer use.

---

## 2. Activity Template

### User Story: New Template – "Use of Sold Products"

**As a** GHG data manager,
**I want** a dedicated Excel template for Category 11 – Use of Sold Products,
**So that** I can upload emissions data for products whose use phase generates GHG emissions.

#### Template Structure

The template contains **three sheets**, each covering a distinct emission source during product use:

| Sheet Name      | Purpose                                                      | Primary Input Field           |
| --------------- | ------------------------------------------------------------ | ----------------------------- |
| **Fuel**        | Products used in fuel-powered equipment/vehicles             | Quantity of Fuel Consumed     |
| **Electricity** | Products used in electrically-powered equipment/vehicles     | Units of Electricity Consumed |
| **Refrigerant** | Products containing refrigerants (e.g., HVAC, refrigeration) | Quantity of Refrigerant       |

#### Acceptance Criteria

- The template is downloadable from the platform with the name **"Use_of_Sold_Products - DDMMYYYY"** (e.g., `Use_of_Sold_Products - 23032026`).
- The downloaded file contains exactly three sheets: Fuel, Electricity, and Refrigerant.
- Each sheet follows the standard column layout (Year, Month, Facility, etc.) plus sheet-specific fields defined below.
- Users may leave irrelevant sheets blank — the system processes only sheets with data rows.

---

## 3. Sheet Column Definitions

### 3.1 Common Columns (All Sheets)

| #   | Column Name | Mandatory | Validation                                                                                                                                                                |
| --- | ----------- | --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| A   | Year        | **Yes**   | Must match a valid reporting year (1900–2099). Must be >= the organization's data collection baseline year (field-level check). Current or future months are not allowed. |
| B   | Month       | **Yes**   | Must be a valid month name (January–December)                                                                                                                             |
| C   | Date        | No        | If provided, must be in DD/MM/YYYY format. Month and year in the date must match the Month and Year columns                                                               |

### 3.2 Fuel Sheet

| #   | Column Name                                  | Mandatory | Validation                                                                                                                                      |
| --- | -------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------- |
| D   | Type of Fuel Consumed                        | **Yes**   | Pure numeric values are not allowed (error: "Invalid Input: Numeric values are not allowed"). Must match an existing fuel type from master data |
| E   | Product Code                                 | **Yes**   | Alphanumeric with spaces, hyphens, dots, slashes, ampersands, parentheses. Invalid characters produce error.                                    |
| F   | Lifetime of Product                          | No        | Positive numeric (decimals permitted) if filled, optional                                                                                       |
| G   | Rationale                                    | No        | Optional. Pure numeric values and negative numbers not allowed. All other text (alpha, alphanumeric, special chars) accepted.                   |
| H   | Quantity of Fuel Consumed (product lifetime) | **Yes**   | Positive numeric, max 15 digits, up to 4 decimal places. Represents total fuel consumed over the product's lifetime                             |
| I   | UoM of Fuel Consumed                         | **Yes**   | Pure numeric values not allowed (error: "Invalid Input : Only alphabetic characters are allowed for UoM"). Must match valid UOM from master     |
| J   | Additional comments                          | No        | Free-text, optional                                                                                                                             |
| K   | Remarks                                      | No        | Free-text, optional                                                                                                                             |
| L–P | Working details 1–5                          | No        | Free-text, max 5000 characters each. Stored in `metadata` JSONB column (see §5)                                                                 |

### 3.3 Electricity Sheet

| #   | Column Name                                             | Mandatory | Validation                                                                                                                    |
| --- | ------------------------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------- |
| D   | Product Code                                            | **Yes**   | Alphanumeric with spaces, hyphens, dots, slashes, ampersands, parentheses. Invalid characters produce error.                  |
| E   | Lifetime of Product                                     | No        | Positive numeric (decimals permitted) if filled, optional                                                                     |
| F   | Rationale                                               | No        | Optional. Pure numeric values and negative numbers not allowed. All other text (alpha, alphanumeric, special chars) accepted. |
| G   | Region                                                  | **Yes**   | Must match an existing region from master data (for regional emission factor lookup)                                          |
| H   | Units of Electricity consumed in kWh (product lifetime) | **Yes**   | Positive numeric, max 15 digits, up to 4 decimal places. UoM is kWh (implicit in column header)                               |
| I   | Additional comments                                     | No        | Free-text, optional                                                                                                           |
| J   | Remarks                                                 | No        | Free-text, optional                                                                                                           |
| K–O | Working details 1–5                                     | No        | Free-text, max 5000 characters each. Stored in `metadata` JSONB column (see §5)                                               |

### 3.4 Refrigerant Sheet

| #   | Column Name                           | Mandatory | Validation                                                                                                                                                        |
| --- | ------------------------------------- | --------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| D   | Product Code                          | **Yes**   | Alphanumeric with spaces, hyphens, dots, slashes, ampersands, parentheses. Invalid characters produce error.                                                      |
| E   | Lifetime of Product                   | No        | Positive numeric (decimals permitted) if filled, optional                                                                                                         |
| F   | Rationale                             | No        | Optional. Pure numeric values and negative numbers not allowed. All other text (alpha, alphanumeric, special chars) accepted.                                     |
| G   | Refrigerant type used in sold product | **Yes**   | Pure numeric values not allowed. Must match an existing refrigerant type from master data                                                                         |
| H   | Quantity of Refrigerant consumed      | **Yes**   | Positive numeric, max 15 digits, up to 4 decimal places                                                                                                           |
| I   | UoM of Refrigerant consumed           | **Yes**   | Pure numeric values not allowed (error: "Invalid Input : Only alphabetic characters are allowed for UoM"). Must match valid UOM for the selected refrigerant type |
| J   | Additional comments                   | No        | Free-text, optional                                                                                                                                               |
| K   | Remarks                               | No        | Free-text, optional                                                                                                                                               |
| L–P | Working details 1–5                   | No        | Free-text, max 5000 characters each. Stored in `metadata` JSONB column (see §5)                                                                                   |

---

## 4. Lifetime of Product & Rationale Fields

### User Story: Capture Product Lifetime and Rationale

**As a** GHG data manager,
**I want** to record the expected lifetime of the product and a rationale for the data reported,
**So that** the platform can support data completeness, dashboard visualizations, and downstream analytics.

#### Acceptance Criteria

- Both fields appear on all three sheets (Fuel, Electricity, Refrigerant).
- If a user fills in "Lifetime of Product", it must be a positive number (decimals permitted).
- If a user fills in "Rationale", it is accepted as free-text.
- Both fields are **optional** — blank values are stored as-is (empty/null). No auto-fill is applied.

#### Validations

- "Lifetime of Product" must pass numeric validation if filled (positive number, decimals allowed).
- If "Lifetime of Product" contains a non-numeric value, a validation error is returned: _"Lifetime of Product must be a positive number or left blank."_

---

## 4.1 Duplicate Record Detection

### User Story: Prevent Duplicate Entries

**As a** GHG data manager,
**I want** the system to detect and flag duplicate rows in each sheet,
**So that** I can correct the data before it's imported.

#### Unique Key Definitions

| Sheet       | Unique Key Columns                                                          |
| ----------- | --------------------------------------------------------------------------- |
| Fuel        | `Year` + `Month` + `Type of Fuel Consumed` + `Product Code`                 |
| Electricity | `Year` + `Month` + `Product Code` + `Region`                                |
| Refrigerant | `Year` + `Month` + `Product Code` + `Refrigerant type used in sold product` |

#### Acceptance Criteria

- If two or more rows share the same unique key, only the duplicate row(s) (second occurrence onward) are flagged. The first (original) row is never marked as a duplicate.
- **Full-row duplicate check**: Additionally, if ALL columns A through I are identical between two rows, the second row is flagged as duplicate — even if the key-based check would not catch it.
  - Fuel sheet columns A–I: Year, Month, Date, Type of Fuel Consumed, Product Code, Lifetime of Product, Rationale, Quantity of Fuel Consumed (product lifetime), UoM of Fuel Consumed
  - Electricity sheet columns A–I: Year, Month, Date, Product Code, Lifetime of Product, Rationale, Region, Units of Electricity consumed in kWh (product lifetime), Additional comments
  - Refrigerant sheet columns A–I: Year, Month, Date, Product Code, Lifetime of Product, Rationale, Refrigerant type used in sold product, Quantity of Refrigerant consumed, UoM of Refrigerant consumed
- The duplicate error is added to the `Month` column only.
- Error message: _"Duplicate Entry Detected: This record already exists. Please enter unique data."_
- Duplicate detection runs as a separate validation step (Step 3), after Zod and master data validations.

---

## 5. Working Columns (K–O)

### User Story: Intermediate Calculation Space

**As a** data entry user,
**I want** free-form working columns in the template,
**So that** I can perform intermediate calculations before arriving at the primary input value.

#### Acceptance Criteria

- Working details columns (5 columns after Remarks) are present in the template as non-mandatory, free-form fields.
- Users may rename the column headers in the downloaded template to suit their calculation needs.
- The platform validates a max length of 5000 characters per working details column but does **not** lock or apply formulas to these columns.
- These columns are stored in the `metadata` JSONB column of the respective child table (`GHGUseOfSoldProducts_Fuel`, `_Electricity`, `_Refrigerant`) as a JSON object with keys `Working details 1` through `Working details 5`.

#### Column-to-Field Mapping

| Sheet       | Working Columns Support Calculation Of |
| ----------- | -------------------------------------- |
| Fuel        | Quantity of Fuel Consumed              |
| Electricity | Units of Electricity Consumed          |
| Refrigerant | Quantity of Refrigerant                |

#### Tooltip / Guideline

A tooltip or guideline text should be added to the template header row for columns K–O:

> _"These are working fields that can be used to log the data required for calculation of any mandatory fields in the sheet."_

---

## 6. Emission Factor Logic

### 6.1 Fuel Sheet – Fuel-Type-Based Emission Factor

**As a** GHG data manager,
**I want** the system to apply an emission factor based on the fuel type I specify,
**So that** emissions are calculated correctly for the type of fuel consumed during product use.

#### Acceptance Criteria

- The user specifies the **Type of Fuel Consumed** (e.g., Petrol, Diesel, CNG, LPG).
- The system looks up the corresponding fuel-type emission factor from the database.
- EF lookup path: **Energy (Category) → Sold Products (Activity) → Fuel (Sub-activity) → Type of Fuel**
- Calculation chain is the same as Category 3 KPI 2 (Ton → GJ → kgCO₂e → tCO₂e). Existing emission factor pick-up logic (as currently in the platform via `initEmissionCalculation`) applies.
- **No region/geography filter** is applied for fuel-based emission factor lookup.
- Emission calculation formula:
  ```
  Fuel Emissions = Quantity (tonnes) × Quality (GJ/T) × EF (kgCO₂e/GJ)
  ```
- Steps:
  1. Read `Quantity of Fuel Consumed (product lifetime)` and its UoM.
  2. If UoM is mass (Kilogram/Gram/Milligram/Tonne/Pound/Ounce), convert to Tonne using mass-to-tonne conversion factors from the Conversion Table.
  3. If UoM is volume (Cubic metre/Litre/Millilitre/Gallon/Cubic foot/Fluid ounce), use the fuel-specific conversion factor from the Conversion Table (From UoM → Tonne for that specific fuel type) to directly convert Quantity to Tonne.
  4. Multiply Quantity (Tonne) × default Quality (GJ/T) to obtain value in GJ.
  5. Identify EF from DB: Energy → Sold Products → Fuel → Type of Fuel (kgCO₂e/GJ).
  6. Multiply GJ × EF → emission in kgCO₂e.

#### Calculation Examples

**Example 1 – Mass Unit**

> 2023 – Fuel: LPG – Quantity of Fuel Consumed (product lifetime): 500 Kilogram
> Default Quality: 30 GJ/T | Emission Factor: 63.1 kgCO₂e/GJ
>
> 1. Quantity = 500 Kilogram
> 2. UoM = Kilogram → convert to Tonne: 500 × 0.001 = **0.5 Tonne**
> 3. Multiply by Quality: 0.5 × 30 = **15 GJ** _(note: use the actual default quality for LPG from the DB)_
> 4. EF lookup: Energy → Sold Products → Fuel → LPG → 63.1 kgCO₂e/GJ
> 5. Emission = 15 × 63.1 = 946.5 kgCO₂e = **0.9465 tCO₂e**

**Example 2 – Volume Unit**

> 2023 – Fuel: Diesel – Quantity of Fuel Consumed (product lifetime): 100 Litre
> Default Quality: 30 GJ/T | Emission Factor: 74.1 kgCO₂e/GJ
> Conversion factor (Diesel): litre → tonne = 0.0008400
>
> 1. Quantity = 100 Litre
> 2. UoM = Litre → use fuel-specific factor: 100 × 0.0008400 = **0.084 Tonne**
> 3. Multiply by Quality: 0.084 × 30 = **2.52 GJ**
> 4. EF lookup: Energy → Sold Products → Fuel → Diesel → 74.1 kgCO₂e/GJ
> 5. Emission = 2.52 × 74.1 = 186.732 kgCO₂e = **0.18673 tCO₂e**

#### Prerequisites

> **⚠️ EF table setup required:** Activity `Sold Products` and sub-activity `Fuel` are **currently missing** from the `CO2EmissionFactorMaster` table. New emission factor records must be inserted before this calculation will work:
>
> | Field          | Value                                          |
> | -------------- | ---------------------------------------------- |
> | `category`     | `Energy`                                       |
> | `activity`     | `Sold Products`                                |
> | `sub_activity` | `Fuel`                                         |
> | `type`         | `<fuel_type>` (e.g., Diesel, LPG, Petrol, CNG) |
> | `unit`         | Contains `/gj` (kgCO₂e/GJ)                     |
>
> This is a **DB/data team task** — to be coordinated with Harsh.

#### Validations

- If the Type of Fuel Consumed does not have a mapped emission factor, the system returns an error: _"No emission factor found for the selected fuel type."_

### 6.2 Electricity Sheet – Region-Based Emission Factor

**As a** GHG data manager,
**I want** the system to apply a regional electricity emission factor based on the region I select,
**So that** emissions are calculated accurately for the geography where the product is used.

#### Acceptance Criteria

- The user selects the **Region** where the product is being used (e.g., China, India, USA).
- The system looks up the corresponding regional electricity emission factor using **region-based exact match** logic.
- EF lookup path: **Energy (Category) → Grid (Activity) → Non Renewable (Sub-activity)**
- Filter fields (confirmed):

  | Filter Field   | Value           | Notes                                    |
  | -------------- | --------------- | ---------------------------------------- |
  | `category`     | `Energy`        |                                          |
  | `activity`     | `Grid`          |                                          |
  | `sub_activity` | `Non Renewable` | Existing platform logic (~22 months ago) |
  | `type`         | _(blank)_       | Blank as explicit filter condition       |

- Grid non-renewable emission factor is picked using the existing `sub_activity = "Non Renewable"` filter — unchanged from current platform logic (`emission-power-consumption.service.ts`).
- **Geography: region-based lookup with canonical name resolution.** The `Region` column (Col G) on each electricity row specifies the geography directly (e.g., "India", "China", "USA"). This is the **region where the product is used**, NOT the organization's country. Uses `initEmissionCalculation` with `geographyOverride` to bypass the country→hierarchy lookup. Before calling `initEmissionCalculation`, all unique regions are resolved against `EmissionFactorGeographyHierarchy` using a case-insensitive `_ilike` match (`getMatchedGeographiesByRegionsILike`) to get canonical geography names. The merged list (canonical names + original regions) is passed as `geographyOverride`. One combined `initEmissionCalculation` call for all regions at once.
- Emission calculation formula:
  ```
  Electricity Emissions = Units of Electricity consumed in kWh (product lifetime) × EF (kgCO₂e/kWh)
  ```
- Steps:
  1. Read `Units of Electricity consumed in kWh (product lifetime)`.
  2. Read `Region` from the row (Col G).
  3. Resolve canonical geography names via `EmissionFactorGeographyHierarchy` `_ilike` lookup.
  4. Call `initEmissionCalculation(orgId, "", [Energy], resolvedGeographies)` — geography override bypasses country hierarchy.
  5. Call closure with `use_of_sold_products_electricity` key + filter (Energy/Grid/Non Renewable/geography/yearMonth).
  6. Emission = kWh × EF (factor / 1000).

#### Calculation Example

> 2023 – Product A
> Units of Electricity consumed (product lifetime) = 5,000 kWh
> Region = India
> Emission Factor (Energy → Grid → Non Renewable, geography: India) = 0.82 kgCO₂e/kWh
>
> 1. Units of Electricity consumed = 5,000 kWh
> 2. Region = India
> 3. EF lookup: Energy → Grid → Non Renewable → India → 0.82 kgCO₂e/kWh
> 4. Emission = 5,000 × 0.82 = 4,100 kgCO₂e = **4.10 tCO₂e**

#### Validations

- If the selected region does not have a mapped emission factor, the system returns an error: _"No emission factor found for the selected region."_
- The emission factor must be sourced from the platform's existing emission factor database.
- No new emission factor records are required — existing Grid Non Renewable EFs are reused.

### 6.3 Refrigerant Sheet – Refrigerant-Type-Based GWP Emission Factor

#### Acceptance Criteria

- The user specifies the **Refrigerant type used in sold product**.
- The system looks up the corresponding GWP from the database.
- EF lookup path: **Fugitive (Category) → GWP 100 (Activity) → Type of Refrigerant Used**
- **Logic is identical to the existing Fugitive template** (`emission-fugitive.service.ts`) — no changes required from that pattern.
- UOM: All UOMs are **mass-based** (kilogram, pound, tonne); convert to Tonne using conversion factors.
- GWP factor is already **dimensionless per ton** — no `/1000` division is applied (bypass condition in `emission-factor.service.ts`).
- Emission calculation formula:
  ```
  Refrigerant Emissions = Quantity of Refrigerant consumed (Tonne) × GWP (CO₂e)
  ```
- Steps:
  1. Read `Quantity of Refrigerant consumed` and its UoM.
  2. All UoMs are mass-based — convert to Tonne using conversion factors (kg→T, pound→T, etc.).
  3. Identify GWP from DB: Fugitive → GWP 100 → Type of Refrigerant Used.
  4. Multiply Quantity (Tonne) × GWP → emission in tCO₂e.

#### Calculation Example

> 2023 – Product A
> Type of Refrigerant Used = R-134a
> Quantity of Refrigerant consumed (product lifetime) = 50 Kilogram
> GWP (Fugitive → GWP 100 → R-134a) = 1,430
>
> 1. Quantity = 50 Kilogram
> 2. UoM = Kilogram → convert to Tonne: 50 × 0.001 = **0.05 Tonne**
> 3. GWP lookup: Fugitive → GWP 100 → R-134a → 1,430
> 4. Emission = 0.05 × 1,430 = **71.5 tCO₂e**

### 6.4 Total Lifetime Emissions

- Total Product Emissions = Fuel Emissions + Electricity Emissions + Refrigerant Emissions

#### KPI Column Names

All three tables use the same column names:

- `kpi_em_Scope3_Category11` — calculated emission value
- `kpi_emf_Scope3_Category11` — emission factor used

#### Validations

- If the refrigerant type does not have a mapped emission factor, the system returns an error.

---

## 7. Excel Data Import (Upload)

### User Story: Upload Use of Sold Products Data via Excel

**As a** GHG data manager,
**I want** to upload the completed "Use of Sold Products" template,
**So that** emissions from product use phase are captured and calculated in the platform.

#### Acceptance Criteria

- The upload API accepts the three-sheet template.
- Only sheets with data rows are processed; blank sheets are skipped.
- Each row is validated against the schema defined in §3.
- On validation failure, an error file is generated and returned with row-level error details.
- On success:
  - Data is saved to the appropriate GHG transaction tables.
  - Emission calculations are triggered per the formulas in §6.
  - Emission dashboard is updated.
  - A data import history record is created with status "successful".
- On failure:
  - A data import history record is created with status "failure" and a link to the error file.

#### Validations

- Template validation: sheet names must match expected names (Fuel, Electricity, Refrigerant).
- Data validation: each row must pass the Zod schema for its sheet type.
- Duplicate detection: rows with the same Year + Month + Date + Product Code + (Type of Fuel Consumed / Region / Refrigerant Type) should be flagged.
- Blank "Lifetime of Product" and "Rationale" are stored as empty/null (no auto-fill).

---

## 8. Template Download

### User Story: Download Category 11 Template

**As a** GHG data manager,
**I want** to download the "Use of Sold Products" Excel template,
**So that** I can fill in the data offline and upload it to the platform.

#### Acceptance Criteria

- The template is pre-populated with the correct column headers for each sheet.
- Working columns (K–O) are included with the tooltip/guideline text.
- The downloaded file name follows the pattern: `Use_of_Sold_Products - DDMMYYYY.xlsx` (e.g., `Use_of_Sold_Products - 23032026.xlsx`)

### Proposed Enhancement: Selective Sheet Download

**Proposed (pending feasibility with Manish):** Allow users to select which sheets to include when downloading the template (e.g., only Electricity + Refrigerant, or Fuel only).

- **Alternative:** Keep all three sheets in every download; users leave irrelevant sheets blank.
- **Recommendation:** Treat as enhancement — do not block base release.

---

## 9. Open Items / Pending Clarifications

| #   | Item                                                              | Owner  | Status  |
| --- | ----------------------------------------------------------------- | ------ | ------- |
| 1   | Feasibility of selective sheet download at template download time | Manish | Pending |

---

## 10. General Validations

- All uploaded data must respect the user's facility/organization address permissions — users can only upload data for facilities they have access to.
- Rate limiting must be applied to the upload API (consistent with existing GHG import routes).
- Audit logging must capture all insert/update operations on Category 11 data.
- The upload flow must follow the existing pattern: read Excel → validate template → validate data → save entries → trigger emission calculation → update dashboard → log import history.

---

## 11. Master Data Key Integration

To support dropdown/master data resolution for Category 11, the input constants layer must include dedicated keys and activity mapping.

### Required Constants

- `USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY = "use_of_sold_products_fuel_type_of_fuel_consumed"`
- `USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY = "use_of_sold_products_fuel_type_of_fuel_consumed_uom"`
- `USE_OF_SOLD_PRODUCTS_RATIONALE_KEY = "use_of_sold_products_rationale"`
- `USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY = "use_of_sold_products_refrigerant_type"`
- `USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY = "use_of_sold_products_refrigerant_consumed_uom"`

### Activity Master Mapping

- `ActivityMasterKey.use_of_sold_products` must include all constants above.
- This mapping is used by the platform to resolve activity-specific master values for fuel type and fuel UoM fields.

### Source File

- `shared/constants/input.constant.ts`

---

## 12. Master Data Validation

During Excel upload, after Zod schema validation, a second validation pass checks that dropdown/master-data-driven columns contain values present in the `ActivityMaster` table. This follows the same pattern used by other activities (e.g., Capital Goods, Energy Fuel Purchased, Fugitive).

### Validation Flow

1. Fetch all master data for the activity using `sdk.getActivityMasterDataByKey({ master_key: ActivityMasterKey.use_of_sold_products })`.
2. For each sheet with data, iterate per row and validate master-data-driven columns using `validateActivityMasterDataByKey()`.
3. Combine master data errors with Zod errors using `combineAllErrorSheets()` and `combineAllTypeErrorInRow()`.

### Column-to-Master-Key Mapping

| Sheet       | Column Name                           | Master Key                                            | Required |
| ----------- | ------------------------------------- | ----------------------------------------------------- | -------- |
| Fuel        | Type of Fuel Consumed                 | `use_of_sold_products_fuel_type_of_fuel_consumed`     | Yes      |
| Fuel        | UoM of Fuel Consumed                  | `use_of_sold_products_fuel_type_of_fuel_consumed_uom` | Yes      |
| Refrigerant | Refrigerant type used in sold product | `use_of_sold_products_refrigerant_type`               | Yes      |
| Refrigerant | UoM of Refrigerant consumed           | `use_of_sold_products_refrigerant_consumed_uom`       | Yes      |

> **Note on Rationale:** The `Rationale` field is **free-text** across all three sheets and is **not** validated against master data. Its only constraint is enforced by the Zod schema: pure numeric values (positive or negative, with or without decimals) are rejected. The `use_of_sold_products_rationale` master key is defined in constants for potential future use but is not currently applied in validation.

### Validation Rules

- For **required** columns: the value must match a `label` in the corresponding master data. If no match, an error is returned listing all valid options.
- Comparison uses `sanitizeString.v1` (Excel mode) for case-insensitive, whitespace-normalized matching.

### Source File

- `lib/organization-transaction/use-of-sold-products/use-of-sold-products.validation.ts`
