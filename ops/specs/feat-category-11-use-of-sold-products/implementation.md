# Category 11 – Use of Sold Products - Implementation Plan

## Table of Contents

1. [Overview](#overview)
2. [Architecture & Data Flow](#architecture--data-flow)
3. [Implementation Phases](#implementation-phases)

- [Phase 1: GraphQL Layer](#phase-1-graphql-layer)
- [Phase 2: Activity Constants & Type Definitions](#phase-2-activity-constants--type-definitions)
- [Phase 3: Validation Schemas](#phase-3-validation-schemas)
- [Phase 4: Service Layer](#phase-4-service-layer)
- [Phase 5: API Routes](#phase-5-api-routes)
- [Phase 6: Template Download](#phase-6-template-download)
- [Phase 7: Emission Calculation Integration](#phase-7-emission-calculation-integration)
- [Phase 8: Audit Logging](#phase-8-audit-logging)

4. [File Manifest](#file-manifest)
5. [Key Design Decisions](#key-design-decisions)
6. [Reference Patterns](#reference-patterns)
7. [Testing Checklist](#testing-checklist)

---

## Overview

Category 11 – Use of Sold Products is a new GHG data import activity that captures emissions from the use phase of products sold by the reporting organization. It introduces a **multi-sheet Excel template** with three sheets (Fuel, Electricity, Refrigerant), each with its own emission factor logic.

**Key Characteristics:**

| Aspect                  | Detail                                                                                       |
| ----------------------- | -------------------------------------------------------------------------------------------- |
| Activity Code           | `use_of_sold_products`                                                                       |
| Parent Code             | `use_of_sold_products` (top-level category)                                                  |
| Template Sheets         | 3 (Fuel, Electricity, Refrigerant)                                                           |
| Emission Factor Sources | Fuel type (Fuel sheet), Regional EF (Electricity sheet), Refrigerant GWP (Refrigerant sheet) |
| Working Columns         | K–O on each sheet (free-form, preserved for downstream processing and redownload)            |
| New Fields              | Lifetime of Product, Rationale (optional, no auto-fill)                                      |

**Reference Implementation:** The closest existing pattern is `energy-grid-power` for single-sheet imports and `waste` / `fuel-purchased` for multi-sheet templates with activity key mappings.

---

**Database migration source of truth:** `docs/Use-of-Sold-Products/db-migration/use-of-sold-products.md`

**Confirmed DB table names:** `GHGUseOfSoldProducts`, `GHGUseOfSoldProducts_Fuel`, `GHGUseOfSoldProducts_Electricity`, `GHGUseOfSoldProducts_Refrigerant`

Note: GraphQL nested fields on the parent table must match Hasura relationship names in this environment: `GHGUseOfSoldProducts_Fuels`, `GHGUseOfSoldProducts_Electricities`, `GHGUseOfSoldProducts_Refrigerants`.

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│  Excel Upload Flow                                                   │
│                                                                      │
│  1. User uploads "Use of Sold Products" Excel template               │
│  2. API Route receives file URL                                      │
│  3. Read Excel data from S3 URL                                      │
│  4. Match sheets by name: "Fuel", "Electricity", "Refrigerant"       │
│  5. Trim column names & trailing blank rows                          │
│  6. Template validation (sheet names, column headers)                │
│  7. Data validation per sheet (Zod schemas)                          │
│  8. Persist validated sheet entries                                  │
│  9. Create import history and follow-up actions                      │
│  10. Trigger emission calculation                                    │
│  11. Update emission dashboard                                       │
│  12. Save energy data                                                │
│  13. Buyer emission recalculation                                    │
│  14. PCF emission calculation                                        │
│  15. Create data import history record                               │
└─────────────────────────────────────────────────────────────────────┘

API Routes:
  POST /api/v1/ghg-data-import/transaction/use-of-sold-products/excel      → Upload & process data
  POST /api/v1/ghg-data-import/transaction/use-of-sold-products/template   → Download template
```

---

## Implementation Phases

### Phase 1: GraphQL Layer

#### 1.1 Database migration dependency

Complete the database and Hasura rollout described in `docs/Use-of-Sold-Products/db-migration/use-of-sold-products.md` before starting GraphQL document work in this spec.

#### 1.2 GraphQL Mutations (new files)

**`graphql/mutations/insert-use-of-sold-products-fuel.gql`**

```graphql
mutation insertUseOfSoldProductsFuel(
  $objects: [GHGUseOfSoldProducts_Fuel_insert_input!]!
) {
  insert_GHGUseOfSoldProducts_Fuel(objects: $objects) {
    returning {
      id
      task_request_id
    }
  }
}
```

**`graphql/mutations/insert-use-of-sold-products-electricity.gql`**

```graphql
mutation insertUseOfSoldProductsElectricity(
  $objects: [GHGUseOfSoldProducts_Electricity_insert_input!]!
) {
  insert_GHGUseOfSoldProducts_Electricity(objects: $objects) {
    returning {
      id
      task_request_id
    }
  }
}
```

**`graphql/mutations/insert-use-of-sold-products-refrigerant.gql`**

```graphql
mutation insertUseOfSoldProductsRefrigerant(
  $objects: [GHGUseOfSoldProducts_Refrigerant_insert_input!]!
) {
  insert_GHGUseOfSoldProducts_Refrigerant(objects: $objects) {
    returning {
      id
      task_request_id
    }
  }
}
```

**`graphql/mutations/delete-use-of-sold-products-fuel.gql`** (+ Electricity, Refrigerant variants)

```graphql
mutation deleteUseOfSoldProductsFuel(
  $where: GHGUseOfSoldProducts_Fuel_bool_exp!
) {
  delete_GHGUseOfSoldProducts_Fuel(where: $where) {
    returning {
      id
      task_request_id
    }
  }
}
```

#### 1.3 GraphQL Queries (new files)

**`graphql/queries/get-use-of-sold-products-data.gql`** (Parent table with nested children)

```graphql
query getUseOfSoldProductsData($task_request_id: [uuid!]) {
  GHGUseOfSoldProducts_Fuel(
    where: { task_request_id: { _in: $task_request_id } }
  ) {
    id
    task_request_id
    activity_task_request_id
    organization_address_id
    Date
    Type_of_Fuel_Consumed
    Product_Code
    Lifetime_of_Product
    Rationale
    Quantity_of_Fuel_Consumed
    UoM_of_Fuel_Consumed
    Additional_comments
    Remarks
    metadata
  }
  GHGUseOfSoldProducts_Electricity(
    where: { task_request_id: { _in: $task_request_id } }
  ) {
    id
    task_request_id
    activity_task_request_id
    organization_address_id
    Date
    Product_Code
    Lifetime_of_Product
    Rationale
    Region
    Units_of_Electricity_consumed_in_kWh
    Additional_comments
    Remarks
    metadata
  }
  GHGUseOfSoldProducts_Refrigerant(
    where: { task_request_id: { _in: $task_request_id } }
  ) {
    id
    task_request_id
    activity_task_request_id
    organization_address_id
    Date
    Product_Code
    Lifetime_of_Product
    Rationale
    Refrigerant_type_used_in_sold_product
    Quantity_of_Refrigerant_consumed
    UoM_of_Refrigerant_consumed
    Additional_comments
    Remarks
    metadata
  }
}
```

**`graphql/queries/get-use-of-sold-products-fuel-data.gql`** (+ Electricity, Refrigerant variants — each filters by `task_request_id`)

```graphql
query getUseOfSoldProductsFuelData($task_request_id: [uuid!]) {
  GHGUseOfSoldProducts_Fuel(
    where: { task_request_id: { _in: $task_request_id } }
  ) {
    id
    task_request_id
    Date
    Type_of_Fuel_Consumed
    Product_Code
    Lifetime_of_Product
    Rationale
    Quantity_of_Fuel_Consumed
    UoM_of_Fuel_Consumed
    Additional_comments
    Remarks
    metadata
  }
}
```

#### 1.4 Run Codegen

```bash
yarn codegen
```

This generates types in `graphql/shared/types.ts` and SDK methods in `graphql/shared/sdk.ts`.

---

### Phase 2: Activity Constants & Type Definitions

#### 2.1 Add Activity Constant

**File:** `shared/constants/activity.constant.ts`

Add a new constant following the existing pattern (reference: `GridPowerDetailsConstant`):

```typescript
export const UseOfSoldProductsConstant = {
  name: "Use of Sold Products",
  code: "use_of_sold_products",
  parent_code: "use_of_sold_products",
  excel_template: {
    sheets: [
      {
        name: "Fuel",
        code: "use_of_sold_products_fuel",
        columns: [
          { name: "Year", code: "year" },
          { name: "Month", code: "month" },
          { name: "Date", code: "date" },
          { name: "Type of Fuel Consumed", code: "type_of_fuel_consumed" },
          { name: "Product Code", code: "product_code" },
          { name: "Lifetime of Product", code: "lifetime_of_product" },
          { name: "Rationale", code: "rationale" },
          {
            name: "Quantity of Fuel Consumed (product lifetime)",
            code: "quantity_of_fuel_consumed",
          },
          { name: "UoM of Fuel Consumed", code: "uom_of_fuel_consumed" },
          { name: "Additional comments", code: "additional_comments" },
          { name: "Remarks", code: "remarks" },
          { name: "Working details 1", code: "working_details_1" },
          { name: "Working details 2", code: "working_details_2" },
          { name: "Working details 3", code: "working_details_3" },
          { name: "Working details 4", code: "working_details_4" },
          { name: "Working details 5", code: "working_details_5" },
        ],
      },
      {
        name: "Electricity",
        code: "use_of_sold_products_electricity",
        columns: [
          { name: "Year", code: "year" },
          { name: "Month", code: "month" },
          { name: "Date", code: "date" },
          { name: "Product Code", code: "product_code" },
          { name: "Lifetime of Product", code: "lifetime_of_product" },
          { name: "Rationale", code: "rationale" },
          { name: "Region", code: "region" },
          {
            name: "Units of Electricity consumed in kWh (product lifetime)",
            code: "units_of_electricity_consumed_kwh",
          },
          { name: "Additional comments", code: "additional_comments" },
          { name: "Remarks", code: "remarks" },
          { name: "Working details 1", code: "working_details_1" },
          { name: "Working details 2", code: "working_details_2" },
          { name: "Working details 3", code: "working_details_3" },
          { name: "Working details 4", code: "working_details_4" },
          { name: "Working details 5", code: "working_details_5" },
        ],
      },
      {
        name: "Refrigerant",
        code: "use_of_sold_products_refrigerant",
        columns: [
          { name: "Year", code: "year" },
          { name: "Month", code: "month" },
          { name: "Date", code: "date" },
          { name: "Product Code", code: "product_code" },
          { name: "Lifetime of Product", code: "lifetime_of_product" },
          { name: "Rationale", code: "rationale" },
          {
            name: "Refrigerant type used in sold product",
            code: "refrigerant_type_used_in_sold_product",
          },
          {
            name: "Quantity of Refrigerant consumed",
            code: "quantity_of_refrigerant_consumed",
          },
          {
            name: "UoM of Refrigerant consumed",
            code: "uom_of_refrigerant_consumed",
          },
          { name: "Additional comments", code: "additional_comments" },
          { name: "Remarks", code: "remarks" },
          { name: "Working details 1", code: "working_details_1" },
          { name: "Working details 2", code: "working_details_2" },
          { name: "Working details 3", code: "working_details_3" },
          { name: "Working details 4", code: "working_details_4" },
          { name: "Working details 5", code: "working_details_5" },
        ],
      },
    ],
  },
} as const;
```

#### 2.2 Export Type Aliases

```typescript
export type TUseOfSoldProductsSheetCodes =
  (typeof UseOfSoldProductsConstant)["excel_template"]["sheets"][number]["code"];
export type TUseOfSoldProductsSheetNames =
  (typeof UseOfSoldProductsConstant)["excel_template"]["sheets"][number]["name"];
export type TUseOfSoldProductsColumnCodes =
  (typeof UseOfSoldProductsConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];
export type TUseOfSoldProductsColumnNames =
  (typeof UseOfSoldProductsConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];
```

#### 2.3 Input Constants & Activity Master Key Mapping

**File:** `shared/constants/input.constant.ts`

Add Category 11 master keys and wire them to `ActivityMasterKey.use_of_sold_products`:

```typescript
export const USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY =
  "use_of_sold_products_fuel_type_of_fuel_consumed";
export const USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY =
  "use_of_sold_products_fuel_type_of_fuel_consumed_uom";
export const USE_OF_SOLD_PRODUCTS_RATIONALE_KEY =
  "use_of_sold_products_rationale";
export const USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY =
  "use_of_sold_products_refrigerant_type";
export const USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY =
  "use_of_sold_products_refrigerant_consumed_uom";

export const ActivityMasterKey = {
  // ...existing mappings
  use_of_sold_products: [
    USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY,
    USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY,
    USE_OF_SOLD_PRODUCTS_RATIONALE_KEY,
    USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY,
    USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY,
  ],
};
```

---

### Phase 3: Validation Schemas

#### 3.1 Template Validation

**New File:** `lib/organization-transaction/use-of-sold-products/use-of-sold-products.validation.ts`

Reference pattern: `lib/organization-transaction/energy/energy-grid-power.validation.ts`

```typescript
import { z } from "zod";
import { UseOfSoldProductsConstant } from "~/shared/constants/activity.constant";

const { sheets: templateSheets } = UseOfSoldProductsConstant.excel_template;

const validProductNameRegex = /^[a-zA-Z0-9\s&.\-/()]*$/;
const validNumericRegex = /^\d+(\.\d{1,4})?$/;

// --- Shared field schemas ---
const lifetimeOfProductSchema = z.union([z.string(), z.number()])
  .optional()
  .transform((val) => {
    if (!val || val === "") return undefined;  // store as null
    const num = Number(val);
    if (isNaN(num) || num <= 0) return "INVALID";
    return String(val);
  })
  .refine((val) => val !== "INVALID", {
    message: "Lifetime of Product must be a positive number or left blank",
  });

const rationaleSchema = z
  .string({ invalid_type_error: "Invalid Input: Numeric values are not allowed" })
  .optional()
  .transform((val) => val?.trim() || undefined)
  .refine((val) => {
    if (!val) return true;
    // Block pure numeric values (positive or negative, with or without decimals)
    if (/^-?\d+(\.\d+)?$/.test(val)) return false;
    return true;
  }, { message: "Invalid Input: Numeric values are not allowed" });

// --- Date Field Schema ---
// Optional, but if provided: must be DD/MM/YYYY format.
// Accepts string, number (Excel serial date), or Date object.
// Transforms to DD/MM/YYYY string or undefined.
const dateFieldSchema = z.union([z.string(), z.number(), z.date()]).optional()
  .transform((val) => {
    // Convert Date objects and Excel serial numbers to DD/MM/YYYY string
    // Return undefined for empty values
  })
  .refine(/* validate DD/MM/YYYY format and valid day/month/year ranges */);

// --- Cross-validation: Date month/year must match Month and Year columns ---
const validateDateMatchesMonthYear = (data, ctx) => {
  // If Date is provided, extract month/year from DD/MM/YYYY
  // Compare month against Month column (full month name)
  // Compare year against Year column
  // Add Zod issues if mismatch
};

// --- Fuel Sheet Schema ---
// Required: Year, Month, Type of Fuel Consumed, Product Code,
//           Quantity of Fuel Consumed (product lifetime), UoM of Fuel Consumed
// Optional: Date, Lifetime of Product, Rationale, Additional comments, Remarks
export const fuelSheetSchema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear).extend({
    // Override Year with baseYear check at field level
    "Year": YearMonthSchema(baseYear).shape.Year.refine(
      (val) => val >= baseYear,
      { message: `Data can only be uploaded from the baseline year (${baseYear}) onwards` }
    ),
    // Optional fields
    "Date": dateFieldSchema,
    "Lifetime of Product": lifetimeOfProductSchema,
    "Rationale": rationaleSchema,
    "Additional comments": z.string().optional(),
    "Remarks": z.string().optional(),
    // Required fields - Type of Fuel uses z.string({ invalid_type_error }) to block pure numeric
    "Type of Fuel Consumed": z.string({
      invalid_type_error: "Invalid Input: Numeric values are not allowed",
    }).min(1, "Type of Fuel Consumed is required"),
    // Product Code uses regex for character validation
    "Product Code": z.preprocess(
      (val) => (typeof val !== "string" ? String(val ?? "") : val),
      z.string().min(1, "Product Code is required")
        .refine((val) => validProductCodeRegex.test(val), {
          message: "Invalid Entry: Product Code contains invalid characters",
        })
    ),
    "Quantity of Fuel Consumed (product lifetime)": z.union([z.string(), z.number()])
      .transform((val) => /* numeric validation, max 15 digits, 4 decimals */)
      .refine((val) => val !== "INVALID_FORMAT", {
        message: "Please enter a valid numeric value (max 15 digits, up to 4 decimal places)",
      }),
    // UoM uses z.string({ invalid_type_error }) following capital-goods pattern
    "UoM of Fuel Consumed": z.string({
      required_error: "UoM of Fuel Consumed is required",
      invalid_type_error: "Invalid Input : Only alphabetic characters are allowed for UoM",
    }).min(1, { message: "UoM of Fuel Consumed is required" }),
  })
  .refine(({ Year, Month }) => {
    // Validate Month+Year combination using validateMonthYear()
    // Error: "Data can only be uploaded from the baseline month and year (baseMonth, baseYear) onwards"
    // Error: "Current or future months are not allowed"
  })
  .superRefine(validateDateMatchesMonthYear);
};

// --- Electricity Sheet Schema ---
// Required: Year, Month, Product Code, Region,
//           Units of Electricity consumed in kWh (product lifetime)
// Optional: Date, Lifetime of Product, Rationale, Additional comments, Remarks
export const electricitySheetSchema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear).extend({
    // Optional fields
    "Date": dateFieldSchema,
    "Lifetime of Product": lifetimeOfProductSchema,
    "Rationale": rationaleSchema,
    "Additional comments": z.string().optional(),
    "Remarks": z.string().optional(),
    // Required fields
    "Product Code": z.string().min(1, "Product Code is required")
      .refine((val) => validProductCodeRegex.test(val), {
        message: "Invalid Entry: Product Code contains invalid characters",
      }),
    "Region": z.string().min(1, "Region is required"),
    "Units of Electricity consumed in kWh (product lifetime)": z.union([z.string(), z.number()])
      .transform((val) => /* numeric validation, max 15 digits, 4 decimals */)
      .refine((val) => val !== "INVALID_FORMAT", {
        message: "Please enter a valid numeric value (max 15 digits, up to 4 decimal places)",
      }),
  })
  .refine(({ Year, Month }) => {
    // Validate Year >= baseYear using validateMonthYear()
    // Error: "Data can only be uploaded from the baseline month and year (baseMonth, baseYear) onwards"
  })
  .superRefine(validateDateMatchesMonthYear);
};

// --- Refrigerant Sheet Schema ---
// Required: Year, Month, Product Code, Refrigerant type used in sold product,
//           Quantity of Refrigerant consumed, UoM of Refrigerant consumed
// Optional: Date, Lifetime of Product, Rationale, Additional comments, Remarks
export const refrigerantSheetSchema = (baseMonth: string, baseYear: number) => {
  return YearMonthSchema(baseYear).extend({
    // Override Year with baseYear check at field level
    "Year": YearMonthSchema(baseYear).shape.Year.refine(
      (val) => val >= baseYear,
      { message: `Data can only be uploaded from the baseline year (${baseYear}) onwards` }
    ),
    // Optional fields
    "Date": dateFieldSchema,
    "Lifetime of Product": lifetimeOfProductSchema,
    "Rationale": rationaleSchema,
    "Additional comments": z.string().optional(),
    "Remarks": z.string().optional(),
    // Required fields
    "Product Code": z.preprocess(
      (val) => (typeof val !== "string" ? String(val ?? "") : val),
      z.string().min(1, "Product Code is required")
        .refine((val) => validProductCodeRegex.test(val), {
          message: "Invalid Entry: Product Code contains invalid characters",
        })
    ),
    "Refrigerant type used in sold product": z.string({
      invalid_type_error: "Invalid Input: Numeric values are not allowed",
    }).min(1, "Refrigerant type used in sold product is required"),
    "Quantity of Refrigerant consumed": z.union([z.string(), z.number()])
      .transform((val) => /* numeric validation, max 15 digits, 4 decimals */)
      .refine((val) => val !== "INVALID_FORMAT", {
        message: "Please enter a valid numeric value (max 15 digits, up to 4 decimal places)",
      }),
    "UoM of Refrigerant consumed": z.string({
      required_error: "UoM of Refrigerant consumed is required",
      invalid_type_error: "Invalid Input : Only alphabetic characters are allowed for UoM",
    }).min(1, { message: "UoM of Refrigerant consumed is required" }),
  })
  .refine(({ Year, Month }) => {
    // Validate Month+Year combination using validateMonthYear()
  })
  .superRefine(validateDateMatchesMonthYear);
};
```

#### 3.2 Template Structure Validation

```typescript
// Validates that uploaded Excel has correct sheet names and column headers
export function validateExcelTemplate(
  excelData: TExcelSheet[]
): Record<string, any>[] {
  const errors: Record<string, any>[] = [];
  const expectedSheets = templateSheets.map((s) => s.name);

  // Check each expected sheet exists (at least one must have data)
  // Validate column headers match expected columns (including working details columns)
  // Return array of error records if validation fails

  return errors;
}
```

#### 3.3 Data Validation (per sheet)

```typescript
// Validates each data row against the appropriate sheet schema
export async function validateExcelTemplateData(
  excelData: TExcelSheet[],
  userSession: TUserSession,
  organizationAddressId: UUID,
  isUpdate: boolean
): Promise<{ sheetName: string; data: Record<string, any>[] }[]> {
  const allErrors: { sheetName: string; data: Record<string, any>[] }[] = [];

  for (const sheet of excelData) {
    const sheetConfig = templateSheets.find(
      (s) => sanitizeString.v1(s.name) === sanitizeString.v1(sheet.sheetName)
    );
    if (!sheetConfig || sheet.data.length === 0) continue;

    // Step 1: Zod schema validation (types, required fields, date ranges)
    // Step 2: Master data validation (values must exist in ActivityMaster DB)
    // Step 3: Duplicate record detection (Year-Month-key columns uniqueness)
    // Step 4: Combine all errors
  }

  return allErrors;
}
```

#### 3.4 Duplicate Record Detection

Duplicate detection ensures no two rows in a sheet represent the same record. Follows the same pattern as `water-withdrawal`, `fugitive`, and `water-consumption` activities.

##### Unique Key Definitions

| Sheet       | Unique Key Columns                                                          |
| ----------- | --------------------------------------------------------------------------- |
| Fuel        | `Year` + `Month` + `Type of Fuel Consumed` + `Product Code`                 |
| Electricity | `Year` + `Month` + `Product Code` + `Region`                                |
| Refrigerant | `Year` + `Month` + `Product Code` + `Refrigerant type used in sold product` |

##### Error Message

When a duplicate is detected, the error is added to the `Month` column of the duplicate row (second occurrence onward) only. The first (original) row is never flagged:

```
"Duplicate Entry Detected: This record already exists. Please enter unique data."
```

##### Logic

Two-tier duplicate detection per row:

1. **Key-based check**: For each row, check if any earlier row has the same unique key (Year-Month-key columns). If yes, flag as duplicate.
2. **Full-row check (columns A–I)**: If the key-based check did not flag the row, compare ALL columns A through I (case-insensitive, trimmed) against all earlier rows. If all values match, flag as duplicate.

This ensures rows that are complete copies are caught even when the key-based check columns vary across sheets.

##### Integration Flow

```typescript
// Step 3 in validateExcelTemplateData:
const duplicateEntries: TExcelSheet[] = await handleCheckDuplicates(excelData);
allError = combineAllErrorSheets(duplicateEntries, allError);
```

#### 3.5 Master Data Validation

**Pattern:** Same as `capital-goods-excel.validation.ts` and `energy-fuel-purchased.validation.ts`

Master data validation ensures that dropdown/master-data-driven Excel columns contain values that exist in the `ActivityMaster` table.

##### Flow

1. Fetch all master data in one call:

```typescript
const activityMasterData = await sdk.getActivityMasterDataByKey({
  master_key: ActivityMasterKey.use_of_sold_products,
});
```

2. Per-sheet validation functions validate each row's master-data columns:

```typescript
// Fuel sheet: validates 3 columns
const validateFuelSheetMasterData = (sheet, activityMasterData) => {
  sheet.data.forEach((dataItem, index) => {
    // "Type of Fuel Consumed" → USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY
    // "UoM of Fuel Consumed"  → USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY
    // "Rationale" (optional)  → USE_OF_SOLD_PRODUCTS_RATIONALE_KEY
  });
};

// Electricity sheet: validates 1 column
const validateElectricitySheetMasterData = (sheet, activityMasterData) => {
  sheet.data.forEach((dataItem, index) => {
    // "Rationale" (optional)  → USE_OF_SOLD_PRODUCTS_RATIONALE_KEY
  });
};

// Refrigerant sheet: validates 3 columns
const validateRefrigerantSheetMasterData = (sheet, activityMasterData) => {
  sheet.data.forEach((dataItem, index) => {
    // "Rationale" (optional)                      → USE_OF_SOLD_PRODUCTS_RATIONALE_KEY
    // "Refrigerant type used in sold product"     → USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY
    // "UoM of Refrigerant consumed"               → USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY
  });
};
```

3. Each column validation uses `validateActivityMasterDataByKey()` from `excel.service.ts`:

```typescript
const errors = validateActivityMasterDataByKey(
  activityMasterData, // full master data array from DB
  dataItem[columnName], // Excel cell value
  index, // row number (1-based)
  masterKey, // specific master_key string
  columnName, // column name for error message
  ApiHitType.Excel // comparison mode (sanitizeString.v1)
);
```

4. Errors are combined with Zod errors in `validateExcelTemplateData()`:

```typescript
const zodErrorEntries = await _validateDataByZod(excelData, organizationId);
const masterErrorEntries = await validateDataByDb(excelData, organizationId);
allError = combineAllErrorSheets(zodErrorEntries, allError);
allError = combineAllErrorSheets(masterErrorEntries, allError);
```

##### Column-to-Key Mapping

| Sheet       | Column                                | Master Key Constant                                       | Optional |
| ----------- | ------------------------------------- | --------------------------------------------------------- | -------- |
| Fuel        | Type of Fuel Consumed                 | `USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY`     | No       |
| Fuel        | UoM of Fuel Consumed                  | `USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY` | No       |
| Refrigerant | Refrigerant type used in sold product | `USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY`               | No       |
| Refrigerant | UoM of Refrigerant consumed           | `USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY`       | No       |

> **Rationale field:** Master data validation for `Rationale` is **not implemented** across all 3 sheets. The `validateActivityMasterDataByKey` call for Rationale is intentionally commented out in `use-of-sold-products.validation.ts`. Rationale is a free-text field — its only active constraint is the Zod `rationaleSchema` which blocks pure numeric values. The `USE_OF_SOLD_PRODUCTS_RATIONALE_KEY` constant is defined for potential future use.

---

### Phase 4: Service Layer

#### 4.1 Service File

**New File:** `lib/organization-transaction/use-of-sold-products/use-of-sold-products.service.ts`

Reference pattern: `lib/organization-transaction/energy/energy-grid-power.service.ts`

```typescript
import { UUID } from "crypto";
import { TExcelSheet } from "~/lib/excel/excel.service";
import { UseOfSoldProductsConstant } from "~/shared/constants/activity.constant";
import { getGraphQlServerSDK } from "~/graphql/server";

// --- Helper: Extract working details into metadata JSONB ---
const buildWorkingDetailsMetadata = (row: Record<string, any>) => {
  const metadata: Record<string, any> = {};
  for (let i = 1; i <= 5; i++) {
    const key = `Working details ${i}`;
    if (row[key] !== undefined && row[key] !== null && row[key] !== "") {
      metadata[key] = row[key];
    }
  }
  return Object.keys(metadata).length > 0 ? metadata : null;
};

// --- Fuel Sheet Insertion ---
// --- Fuel Sheet Insertion (flat: each row carries task_request_id directly) ---
const FuelSheetInsertionData = (
  excelSheetData: TExcelSheet,
  taskRequestActivityData: TActivityTaskRequestMasterData[],
  organizationAddressId: UUID,
  userId: UUID
) => {
  const insertRecords: Record<string, any>[] = [];

  excelSheetData.data.forEach((row) => {
    const activityTaskData = taskRequestActivityData.filter(
      (d) =>
        sanitizeString.v1(d.month) === sanitizeString.v1(row["Month"]) &&
        d.year == row["Year"]
    );
    if (activityTaskData.length > 0) {
      insertRecords.push({
        task_request_id: activityTaskData[0].taskRequestId,
        activity_task_request_id: activityTaskData[0].activityTaskRequestId,
        organization_address_id: organizationAddressId,
        Date: row["Date"] || null,
        Type_of_Fuel_Consumed: row["Type of Fuel Consumed"],
        Product_Code: row["Product Code"],
        Lifetime_of_Product:
          row["Lifetime of Product"]?.toString().trim() || null,
        Rationale: row["Rationale"]?.toString().trim() || null,
        Quantity_of_Fuel_Consumed: Number(
          row["Quantity of Fuel Consumed (product lifetime)"]
        ),
        UoM_of_Fuel_Consumed: row["UoM of Fuel Consumed"],
        Additional_comments: row["Additional comments"] || null,
        Remarks: row["Remarks"] || null,
        metadata: buildWorkingDetailsMetadata(row),
        created_by: userId,
        updated_by: userId,
      });
    }
  });

  return insertRecords;
};

// (ElectricitySheetInsertionData and RefrigerantSheetInsertionData follow the same flat pattern)

// --- Main Save Function ---
export const saveUseOfSoldProductsSheetEntries = async (
  excelData: TExcelSheet[],
  activityCode: string,
  organizationAddressId: UUID,
  userSession: TUserSession
) => {
  const taskRequestActivityData = (await getTaskRequestActvityTaskRequestId(
    organizationAddressId,
    excelData,
    activityCode,
    userSession
  )) as TActivityTaskRequestMasterData[];

  if (!taskRequestActivityData || taskRequestActivityData.length === 0)
    return null;

  const sdk = await getGraphQlServerSDK();
  const allInsertedTaskRequestIds: UUID[] = [];

  // Insert directly into each child table — no parent record
  for (const sheet of excelData) {
    const sheetConfig = templateSheets.find(
      (s) => sanitizeString.v1(s.name) === sanitizeString.v1(sheet.sheetName)
    );
    if (!sheetConfig || sheet.data.length === 0) continue;

    switch (sheetConfig.code) {
      case "use_of_sold_products_fuel": {
        const records = FuelSheetInsertionData(
          sheet,
          taskRequestActivityData,
          organizationAddressId,
          userSession.userId as UUID
        );
        if (records.length > 0) {
          await sdk.insertUseOfSoldProductsFuel({ objects: records });
          records.forEach((r) => {
            if (!allInsertedTaskRequestIds.includes(r.task_request_id))
              allInsertedTaskRequestIds.push(r.task_request_id);
          });
        }
        break;
      }
      // ... same pattern for electricity and refrigerant cases
    }
  }

  return { taskRequestIds: allInsertedTaskRequestIds };
};
```

---

### Phase 4.5: Ease of Product Master Data Onboarding ✅ Done

During Excel upload, the "Product Code" column from all 3 sheets (Fuel, Electricity, Refrigerant) is compared against the `OrgProductMaster` table's `code` column. If a product code doesn't exist, it is automatically created in the `OrgProductMaster` table.

**Reference pattern:** `saveMaterialMasterBulk` in `lib/supplier-master/supplier-master.service.ts`

#### Implementation

**New function:** `saveProductMasterBulk` in `lib/product-master/product-master.service.ts`

```typescript
export const saveProductMasterBulk = async (
  userSession: TUserSession,
  productCodesList: string[]
) => { ... };
```

**Flow:**

1. Extract product codes from all 3 Excel sheets
2. Deduplicate codes (case-insensitive)
3. Create case-insensitive variations for lookup
4. Query existing `OrgProductMaster` records using `getOrgProductMasterByCodesInsensitive`
5. Identify missing product codes
6. Bulk insert missing products using `insertProductAndSkuMaster` (with empty SKU input)
7. Return inserted records

**New GraphQL query:** `graphql/queries/get-org-product-master-by-codes-insensitive.gql`

```graphql
query getOrgProductMasterByCodesInsensitive($where: OrgProductMaster_bool_exp) {
  OrgProductMaster(where: $where) {
    id
    client_master_id
    name
    code
    organization_id
  }
}
```

**Called in route:** `app/api/v1/ghg-data-import/transaction/use-of-sold-products/excel/route.ts` (step 7, before saving entries)

---

### Phase 5: API Routes

#### 5.1 Excel Upload Route

**New File:** `app/api/v1/ghg-data-import/transaction/use-of-sold-products/excel/route.ts`

Reference pattern: `app/api/v1/ghg-data-import/transaction/energy-grid-power/excel/route.ts`

```typescript
import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { TUserSession } from "~/lib/auth/auth.client";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard,
  saveEnergyData,
} from "~/lib/emission-calculation-engine/emisison-calculation.service";
import {
  ExcelApiBodySchema,
  TExcelSheet,
  readDataFromURL,
  trimColumnNames,
  trimtrailingblankrows,
} from "~/lib/excel/excel.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { saveUseOfSoldProductsSheetEntries } from "~/lib/organization-transaction/use-of-sold-products/use-of-sold-products.service";
import {
  validateExcelTemplate,
  validateExcelTemplateData,
} from "~/lib/organization-transaction/use-of-sold-products/use-of-sold-products.validation";
import { calculatePCFEmissionFromSupplierData } from "~/lib/pcf-emission/pcf-emission.service";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { validateUserActivityAndOrganizationAddressPermissions } from "~/lib/user/user.validation";
import { UseOfSoldProductsConstant } from "~/shared/constants/activity.constant";
import { uploadActivityErrorsExcelJsonSheets } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";
import { getFileNameFromS3FileUrl } from "~/utils/file-storage/server.service";
import { sanitizeString } from "~/utils/sanitize.util";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  const input = await ExcelApiBodySchema.parseAsync(await req.json());
  const urlFileName = getFilenameFromURL(input.fileUrl);
  const s3FileName = await getFileNameFromS3FileUrl(
    userSession.organizationId,
    input.fileUrl
  );
  const fileName = s3FileName ?? urlFileName;

  // 1. Validate user permissions
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    input.organizationAddressId,
    UseOfSoldProductsConstant.parent_code
  );

  // 2. Read Excel data from S3
  const data = await readDataFromURL(input.fileUrl);

  // 3. Match sheets by name
  const { sheets: templateSheets } = UseOfSoldProductsConstant.excel_template;
  let excelData = templateSheets
    .map((sheet) =>
      data.find(
        (m) => sanitizeString.v1(m.sheetName) === sanitizeString.v1(sheet.name)
      )
    )
    .filter((sheet) => !!sheet) as TExcelSheet[];

  // 4. Trim columns & trailing blank rows
  excelData = trimColumnNames(excelData);
  excelData = trimtrailingblankrows(excelData);

  // 5. Template validation
  const templateValidationErrors = validateExcelTemplate(excelData);
  if (templateValidationErrors?.length) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      [{ sheetName: "Error Data", data: templateValidationErrors }]
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      "use_of_sold_products",
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      { file_url: uploadResponse?.downloadUrl ?? "" },
      input.organizationAddressId
    );
    return NextResponse.json({ success: false, data: historyData });
  }

  // 6. Data validation
  const dataValidationErrors = await validateExcelTemplateData(
    excelData,
    userSession,
    input.organizationAddressId as UUID,
    false
  );
  if (dataValidationErrors.length > 0) {
    const uploadResponse = await uploadActivityErrorsExcelJsonSheets(
      userSession,
      fileName,
      dataValidationErrors
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      "use_of_sold_products",
      "Excel",
      fileName,
      input.fileUrl,
      "failure",
      { file_url: uploadResponse?.downloadUrl ?? "" },
      input.organizationAddressId
    );
    return NextResponse.json({ success: false, data: historyData });
  }

  // 7. Ease of Product Master Data Onboarding
  // Extract product codes from all 3 sheets and create missing product master entries
  const allProductCodes = excelData.flatMap((sheet) =>
    sheet.data
      .filter((row) => !!row["Product Code"])
      .map((row) => String(row["Product Code"]))
  );
  await saveProductMasterBulk(userSession, allProductCodes);

  // 8. Save entries
  const saveResponse = await saveUseOfSoldProductsSheetEntries(
    excelData,
    UseOfSoldProductsConstant.parent_code,
    input.organizationAddressId as UUID,
    userSession
  );

  // 8. Audit logging (TODO: implement in Phase 8)

  if (saveResponse) {
    const historyData = await insertNewDataImportHistory(
      userSession,
      "use_of_sold_products",
      "Excel",
      fileName,
      input.fileUrl,
      "successful",
      null,
      input.organizationAddressId
    );

    // 9. Emission calculation
    const uniqueTaskRequestIds = /* extract from saveResponse */ [] as UUID[];
    await calculateEmission(
      userSession.organizationId,
      "use_of_sold_products",
      uniqueTaskRequestIds
    );
    await saveEmissionDashboard(
      uniqueTaskRequestIds,
      userSession.organizationId
    );
    await saveEnergyData({
      organizationId: userSession.organizationId,
      uniquetask_request_id: uniqueTaskRequestIds,
      organizationAddressId: input.organizationAddressId,
      activity: "use_of_sold_products",
      // sheet-specific data references
    });

    // 10. Buyer & PCF recalculation
    await emissionCalculationForBuyer({
      instanceOrgId: userSession.organizationId as UUID,
      instanceTaskRequestIds: uniqueTaskRequestIds,
    });
    await calculatePCFEmissionFromSupplierData(
      userSession.organizationId as UUID,
      uniqueTaskRequestIds,
      userSession.userId as UUID
    );

    return NextResponse.json({ success: true, data: historyData });
  }

  return NextResponse.json({ success: true, data: [] });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";
```

---

### Phase 6: Template Download

#### 6.1 Template Download Route

**New File:** `app/api/v1/ghg-data-import/transaction/use-of-sold-products/template/route.ts`

Reference pattern: `app/api/v1/ghg-data-import/transaction/product-share-allocation/template/route.ts`

```typescript
async function postHandler(req: NextRequest, userSession: TUserSession) {
  const body = await req.json();
  const { organizationAddressId, filePath } = body;

  // 1. Validate permissions
  await validateUserActivityAndOrganizationAddressPermissions(
    userSession,
    organizationAddressId,
    UseOfSoldProductsConstant.parent_code
  );

  // 2. For each sheet, generate pre-populated template data
  //    (headers only for new template, or existing data for re-download)

  // 3. Add tooltip text to working column headers (K-O)

  // 4. Update Excel buffer with data per sheet
  //    - Use updateExcelTemplateFromUrl for multi-sheet support

  // 5. Return file with date-stamped filename
  //    Pattern: Use_of_Sold_Products - DDMMYYYY.xlsx (e.g., Use_of_Sold_Products - 23032026.xlsx)

  return NextResponse.json({
    success: true,
    data: { fileName, fileData: binaryString },
  });
}
```

#### 6.2 Base Excel Template

A base `.xlsx` template file must be created and uploaded to S3 with:

- Three sheets: "Fuel", "Electricity", "Refrigerant"
- Column headers as defined in the activity constant
- Working columns (K–O) with tooltip guideline text in header row
- Proper column formatting (numeric columns set to number format)

---

### Phase 7: Emission Calculation Integration

#### 7.1 Emission Calculation Engine Entry Point

**File modified:** `lib/emission-calculation-engine/emisison-calculation.service.ts` ✅ Done

Added `use_of_sold_products` case in `calculateEmission`:

```typescript
else if (activity === "use_of_sold_products") {
  await emissionUseOfSoldProducts.calculateUseOfSoldProductsEmission(taskRequestIds, organizationId);
}
```

#### 7.2 Emission Factor Keys & Bypass

**File modified:** `lib/emission-calculation-engine/emission-factor.service.ts` ✅ Done

- Added 3 new keys to `EmissionFactorKeys`:
  - `use_of_sold_products_fuel`
  - `use_of_sold_products_electricity`
  - `use_of_sold_products_refrigerant`
- Added bypass condition so `use_of_sold_products_refrigerant` GWP is NOT divided by 1000 (same as fugitive keys).
- Added optional `geographyOverride?: string[]` parameter to `initEmissionCalculation`. When provided, the country-based geography hierarchy lookup is **skipped** and the override list is used directly. This enables Electricity to use the same EF engine with row-level Region values instead of org country.

#### 7.3 New Emission Calculation Service

**New File:** `lib/emission-calculation-engine/emission-use-of-sold-products.service.ts` ✅ Done

Main export: `calculateUseOfSoldProductsEmission(taskRequestIds, organizationId)`

**Architecture:**

- **Fuel + Refrigerant**: Uses `initEmissionCalculation` with org's `countryId` and `ParentActivitiesType` = `[Energy, Fugitive]` (standard hierarchy-based geography logic).
- **Electricity**: Uses `initEmissionCalculation` with `geographyOverride` — bypasses the country-based hierarchy lookup. Groups rows by Region (Col I), calls `initEmissionCalculation(orgId, "", [Energy], [region])` per unique Region, then uses the returned closure for rows with that Region. Same EF engine, same filter/year-month logic — only geography resolution is overridden.
- Single combined GraphQL mutation (`updateUseOfSoldProductsEmission`) updates all 3 tables.
- Batch processing with `batchSize = 2000`.

**Sub-calculations:**

| Sheet       | EF Key                             | EF Lookup Path                                                    | Formula                                        |
| ----------- | ---------------------------------- | ----------------------------------------------------------------- | ---------------------------------------------- |
| Fuel        | `use_of_sold_products_fuel`        | Energy → Sold Products → Fuel → Type of Fuel                      | Quantity (T) × Quality (GJ/T) × EF (kgCO₂e/GJ) |
| Electricity | `use_of_sold_products_electricity` | Energy → Grid → Non Renewable → geography = Region (via override) | Units (kWh) × EF (kgCO₂e/kWh)                  |
| Refrigerant | `use_of_sold_products_refrigerant` | Fugitive → GWP 100 → Type of Refrigerant                          | Quantity (T) × GWP (CO₂e)                      |

**Fuel sheet detail:**

> **⚠️ EF prerequisite:** Activity `Sold Products` and sub-activity `Fuel` are **currently missing** from `CO2EmissionFactorMaster`. New records must be inserted per fuel type before this calculation will work. See `use-of-sold-products-emission-columns.md` for the exact field values. DB/data team task — coordinate with Harsh.

- Calculation chain is the **same as Category 3 KPI 2** (Ton → GJ → kgCO₂e → tCO₂e). Existing emission factor pick-up logic (`initEmissionCalculation`) applies.
- **No region/geography filter** is applied for fuel-based EF lookup.

1. Read `quantity_of_fuel_consumed_product_lifetime` + UoM.
2. Convert to Tonne using `convertUom()` (mass) or `ConvertUOMGeneralised()` (volume with fuel-specific factor).
3. Read `quality_gj_t` (default value from DB).
4. Multiply: Quantity(T) × Quality(GJ/T) = value in GJ.
5. Lookup EF: `initCalculation()` with activity=`Sold Products`, sub_activity=`Fuel`, unit_filter containing `/gj`.
6. Emission = GJ × EF (kgCO₂e/GJ).

**Electricity sheet detail:**

- Uses `initEmissionCalculation` with `geographyOverride` — same EF engine as Fuel/Refrigerant, but bypasses the country→hierarchy lookup.
- A **single** `initEmissionCalculation` call handles all regions at once (not one call per region).
- Filter: `category=Energy`, `activity=Grid`, `sub_activity=Non Renewable`.
- **Region from row (Col G)** — NOT from `OrganizationAddress`. The `Region` column specifies where the product is used (could be any country/region).
- No new EF records required — existing Grid Non Renewable EFs are reused.

**Region resolution — `getMatchedGeographiesByRegionsILike` (implemented in `emission-use-of-sold-products.service.ts`):**

Before calling `initEmissionCalculation`, all unique regions from the Electricity rows are resolved against `EmissionFactorGeographyHierarchy` using a case-insensitive `_ilike` match per region. This function:

1. Normalizes all unique regions using `sanitizeString.v4`.
2. Queries `EmissionFactorGeographyHierarchy` with `geography _ilike %region%` for each region.
3. Returns canonical geography strings (exact DB spelling).

The caller merges canonical matches + original region strings, deduplicates, and passes the combined list as `geographyOverride` to `initEmissionCalculation`. This ensures EF lookups succeed even when user-entered region names differ in casing from the DB values.

1. Collect all unique regions from electricity rows.
2. Call `getMatchedGeographiesByRegionsILike(uniqueRegions)` → canonical geography names.
3. Merge canonical names + original regions, deduplicate → `resolvedGeographies`.
4. Call `initEmissionCalculation(orgId, "", [Energy], resolvedGeographies)` — single combined call.
5. For each row: call closure with `use_of_sold_products_electricity` key, geography filter = row's Region, kWh value → EF factor / 1000 → emission.
6. Collect all updates into a single updates array.

**Refrigerant sheet detail:**

- Logic is **identical to the existing Fugitive template** (`emission-fugitive.service.ts`) — no changes from that pattern.
- All UOMs are **mass-based** (kg, pound, tonne); convert to Tonne using conversion factors.
- GWP factor is already **dimensionless per ton** — NOT divided by 1000 (bypass condition in `emission-factor.service.ts`).

1. Read `quantity_of_refrigerant_consumed` + UoM.
2. Convert to Tonne (mass-based UoMs only: kg→T, pound→T, tonne as-is).
3. Lookup GWP: `initCalculation()` with category=`Fugitive`, activity=`GWP 100`, type = refrigerant type.
4. GWP is NOT divided by 1000 (bypass condition in `emission-factor.service.ts`).
5. Emission = Quantity(T) × GWP → tCO₂e.

**KPI columns (all 3 tables):**

- `kpi_em_Scope3_Category11` — calculated emission value
- `kpi_emf_Scope3_Category11` — emission factor used

#### 7.4 GraphQL Files for Emission

**New Query:** `graphql/queries/get-use-of-sold-products-data-for-emission.gql` ✅ Done

- Fetches all 3 tables joined with `TaskRequest { year month }` and `OrganizationAddress { Address { country_id Country { region_code } } }`.

**New Mutation:** `graphql/mutations/update-use-of-sold-products-emission.gql` ✅ Done

- Single combined mutation with `$fuelUpdates`, `$electricityUpdates`, `$refrigerantUpdates`.
- Uses `update_GHGUseOfSoldProducts_Fuel_many`, `_Electricity_many`, `_Refrigerant_many`.

#### 7.5 DB Migration for Emission Columns

**Doc:** `docs/Use-of-Sold-Products/db-migration/use-of-sold-products-emission-columns.md` ✅ Done

Adds 2 columns (`DOUBLE PRECISION`) to each of the 3 tables:

- `kpi_em_Scope3_Category11`
- `kpi_emf_Scope3_Category11`

---

### Phase 8: Audit Logging ✅ Completed

#### 8.1 Audit Log Service

**File:** `lib/auditlog/auditlog.service.ts`

Three audit log functions added directly to the existing auditlog service (following the same pattern as `saveGHGMaterialProcurement`, `saveGHGCapitalGoods`, etc.):

- `saveGHGUseOfSoldProductsFuel()` → writes to `snowkap_op_logs.GHGUseOfSoldProducts_Fuel`
- `saveGHGUseOfSoldProductsElectricity()` → writes to `snowkap_op_logs.GHGUseOfSoldProducts_Electricity`
- `saveGHGUseOfSoldProductsRefrigerant()` → writes to `snowkap_op_logs.GHGUseOfSoldProducts_Refrigerant`

Each function:

- Accepts `(data, userSession, deletedData)` matching the standard pattern
- Maps all table columns: `id`, `Date`, activity-specific fields, `Additional_comments`, `Remarks`, `metadata`, `is_deleted`, `created_by`, `updated_by`, `task_request_id`, `activity_task_request_id`, `organization_address_id`
- Uses `getDeletedDataInAuditLog()` to identify truly deleted records (same as Capital Goods) — only rows that were deleted from PostgreSQL but NOT re-inserted with the same values are logged with `is_deleted: true`
- Batch-inserts to ClickHouse in 1000-row batches using `JSONEachRow` format

**Service layer:** `use-of-sold-products.service.ts` returns a raw response object (same pattern as Capital Goods) with `insert_GHGUseOfSoldProducts_{Fuel|Electricity|Refrigerant}.returning` and `delete_GHGUseOfSoldProducts_{Fuel|Electricity|Refrigerant}.returning`.

**Excel route:** Extracts unique task request IDs from `insert_...returning` arrays across all 3 sheets for emission calculation. Passes `insert_...returning` and `delete_...returning` to audit log functions (fire-and-forget, non-blocking).

---

## File Manifest

Companion DB migration documents:

- `docs/Use-of-Sold-Products/db-migration/use-of-sold-products.md`
- `docs/Use-of-Sold-Products/db-migration/use-of-sold-products-emission-columns.md`

| #   | File Path                                                                                                                          | Action  | Description                                                                                                    |
| --- | ---------------------------------------------------------------------------------------------------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| 1   | `shared/constants/activity.constant.ts`                                                                                            | ✅ Done | Add `UseOfSoldProductsConstant`, type aliases, and `ParentActivitiesType.UseOfSoldProducts`                    |
| 2   | `lib/shared/constants/dataimporthistory.constant.ts`                                                                               | ✅ Done | Add "Use of Sold Products" to CustomHeaderFilter                                                               |
| 3   | `shared/constants/input.constant.ts`                                                                                               | ✅ Done | Add Category 11 fuel master keys and ActivityMasterKey mapping                                                 |
| 4   | `features/manual-data-entry/use-of-sold-products/listing.tsx`                                                                      | ✅ Done | Frontend listing component                                                                                     |
| 5   | `features/manual-data-entry/use-of-sold-products/hooks.tsx`                                                                        | ✅ Done | Custom hooks for sheet data handling                                                                           |
| 6   | `features/manual-data-entry/use-of-sold-products/SHEETS-GUIDE.md`                                                                  | ✅ Done | Sheet structure documentation                                                                                  |
| 7   | `app/[organizationId]/.../manual-entry-data/use-of-sold-products/page.tsx`                                                         | ✅ Done | Page wrapper for listing component                                                                             |
| 8   | `lib/organization-transaction/use-of-sold-products/use-of-sold-products.validation.ts`                                             | ✅ Done | Zod schemas for Fuel, Electricity, Refrigerant sheets; master data validation; duplicate detection             |
| 9   | `lib/organization-transaction/use-of-sold-products/use-of-sold-products.service.ts`                                                | ✅ Done | Service layer for saving sheet entries; working details metadata; flat insertion per child table               |
| 10  | `app/api/v1/ghg-data-import/transaction/use-of-sold-products/excel/route.ts`                                                       | ✅ Done | Excel upload API route — now includes missing emission factors notification (step 11)                          |
| 11  | `app/api/v1/ghg-data-import/transaction/use-of-sold-products/template/route.ts`                                                    | Create  | Template download API route                                                                                    |
| 12  | `graphql/mutations/insert-use-of-sold-products.gql`                                                                                | Create  | Insert mutation for parent table                                                                               |
| 13  | `graphql/mutations/insert-use-of-sold-products-fuel.gql`                                                                           | ✅ Done | Insert mutation for Fuel table (returns task_request_id)                                                       |
| 14  | `graphql/mutations/insert-use-of-sold-products-electricity.gql`                                                                    | ✅ Done | Insert mutation for Electricity table (returns task_request_id)                                                |
| 15  | `graphql/mutations/insert-use-of-sold-products-refrigerant.gql`                                                                    | ✅ Done | Insert mutation for Refrigerant table (returns task_request_id)                                                |
| 16  | `graphql/mutations/delete-use-of-sold-products-fuel.gql`                                                                           | ✅ Done | Delete mutation for Fuel table                                                                                 |
| 17  | `graphql/mutations/delete-use-of-sold-products-electricity.gql`                                                                    | ✅ Done | Delete mutation for Electricity table                                                                          |
| 18  | `graphql/mutations/delete-use-of-sold-products-refrigerant.gql`                                                                    | ✅ Done | Delete mutation for Refrigerant table                                                                          |
| 19  | `graphql/queries/get-use-of-sold-products-data.gql`                                                                                | ✅ Done | Multi-root query for all three tables by task_request_id                                                       |
| 20  | `graphql/queries/get-use-of-sold-products-fuel-data.gql`                                                                           | ✅ Done | Query for Fuel table by task_request_id                                                                        |
| 21  | `graphql/queries/get-use-of-sold-products-electricity-data.gql`                                                                    | ✅ Done | Query for Electricity table by task_request_id                                                                 |
| 22  | `graphql/queries/get-use-of-sold-products-refrigerant-data.gql`                                                                    | ✅ Done | Query for Refrigerant table by task_request_id                                                                 |
| 23  | `graphql/queries/get-use-of-sold-products-data-for-emission.gql`                                                                   | ✅ Done | Emission data query (all 3 tables + TaskRequest + OrgAddress)                                                  |
| 24  | `graphql/mutations/update-use-of-sold-products-emission.gql`                                                                       | ✅ Done | Single combined emission update mutation for all 3 tables                                                      |
| 25  | `lib/emission-calculation-engine/emission-use-of-sold-products.service.ts`                                                         | ✅ Done | Emission calc (Fuel/Refrigerant via initEmissionCalculation, Electricity via direct EF query)                  |
| 26  | `lib/emission-calculation-engine/emisison-calculation.service.ts`                                                                  | ✅ Done | Add `use_of_sold_products` case + import                                                                       |
| 27  | `lib/emission-calculation-engine/emission-factor.service.ts`                                                                       | ✅ Done | Add 3 EmissionFactorKeys + refrigerant GWP bypass                                                              |
| 28  | `lib/auditlog/auditlog.service.ts`                                                                                                 | ✅ Done | Audit logging for Category 11 (3 functions added to existing file)                                             |
| 29  | `graphql/queries/get-org-product-master-by-codes-insensitive.gql`                                                                  | ✅ Done | Query OrgProductMaster by codes (case-insensitive) for Ease of Product Master Onboarding                       |
| 30  | `graphql/queries/get-org-product-master-by-codes-insensitive.generated.tsx`                                                        | ✅ Done | Generated types for product master lookup query                                                                |
| 31  | `lib/product-master/product-master.service.ts`                                                                                     | ✅ Done | Added `saveProductMasterBulk` for Ease of Product Master Data Onboarding                                       |
| 32  | `lib/organization-transaction/use-of-sold-products/use-of-sold-products-missing-emission-factors.service.ts`                       | ✅ Done | Missing emission factors detection and email notification for Electricity sheet Region+Year+Month combinations |
| 33  | `lib/organization-transaction/use-of-sold-products/use-of-sold-products.types.ts`                                                  | ✅ Done | General types file: `TMissingElectricityEmissionFactor`, `TRegionYearMonth`                                    |
| 34  | `graphql/shared/sdk.ts` — `GetUseOfSoldProductsElectricityByOrgIdDocument` + `getUseOfSoldProductsElectricityByOrgId`              | ✅ Done | New SDK query: fetch all Electricity records for an organization (Region + TaskRequest year/month)             |
| 35  | `graphql/shared/types.ts` — `GetUseOfSoldProductsElectricityByOrgIdQuery` + `GetUseOfSoldProductsElectricityByOrgIdQueryVariables` | ✅ Done | TypeScript types for the new SDK query                                                                         |

---

## Key Design Decisions

Schema-level design decisions are captured in `docs/Use-of-Sold-Products/db-migration/use-of-sold-products.md`.

### 1. Multi-Sheet Processing

**Decision:** All three sheets are processed in a single upload request. Blank sheets are skipped.

**Rationale:** This matches the user workflow (single template upload) and simplifies the API surface. Sheets without data rows are simply ignored during validation and processing.

### 2. Selective Sheet Download Deferred

**Decision:** Base release includes all three sheets in every download. Selective sheet download is treated as a future enhancement.

**Rationale:** Pending feasibility confirmation with Manish. The base functionality is not blocked by this.

### 3. Missing Electricity Emission Factors Notification

**Decision:** After each successful Excel upload, the API checks whether all Region+Year+Month combinations present in the organization's **full** Electricity dataset have a matching `CO2EmissionFactorMaster` record for `Energy → Grid → Non Renewable`. If any are missing an email is sent with the missing factors Excel attached.

**Implementation details:**

- **Scope:** Organization-wide — not limited to the current upload. Every upload re-checks the entire org history so newly added regions from previous imports are also detected.
- **Region handling:** All regions from the Electricity sheet are included. If a region exists in `EmissionFactorGeographyHierarchy.geography`, its canonical casing is used for the emission factor lookup. If a region is **not** in the hierarchy, it is still included and will be reported as missing (since no emission factor can exist for an unknown geography). This matches the material-procurement pattern where every item is checked without pre-filtering.
- **Factor lookup:** Reuses `initEmissionCalculation` with `geographyOverride = uniqueRegions` (same path as the emission calculation engine) to avoid divergence between calculation and notification logic.
- **Email template:** `UseOfSoldProducts_Missing_Grid_Emission_Factors_Email` (must be seeded in `EmailTemplates` table before deployment).
- **Excel format:** Single sheet "Missing Emission Factors" with columns `Category`, `Activity`, `Region`, `Year`, `Month`. `Category` is always `"Energy"` and `Activity` is always `"Grid"` for electricity records.
- **Email dispatch pattern:** Follows the exact same pattern as material-procurement (`supplier-master.service.ts` + `material-procurement-excel.service.ts`). `generateAndUploadMissingEmissionFactorsFileForUseOfSoldProducts` returns `""` when no missing factors (including when there is no Electricity sheet data at all), or the raw S3 upload result object `{ downloadUrl }` when factors exist. The route guards with `if (typeof objDownloadUrl === "object")` — email is sent **only when missing factors exist**. When `""` is returned (no data or no missing factors), no email is sent.
- **Emission factor filter:** Uses `category: "Energy"`, `activity: "Grid"`, `sub_activity: "Non Renewable"`, `geography: region` — matching the exact same filters used by the emission calculation engine (`emission-use-of-sold-products.service.ts`). Using any other `sub_activity` value would cause false negatives (missing factors not detected) or false positives.
- **Types:** `TMissingElectricityEmissionFactor` and `TRegionYearMonth` are defined in `use-of-sold-products.types.ts` and imported into the service.
- **Non-blocking:** Email dispatch is fire-and-forget (no `await` on `sendEmail...` in route). Upload response is not affected by email failures.

**Files:**

| File                                                                                                         | Role                                                          |
| ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------- |
| `lib/organization-transaction/use-of-sold-products/use-of-sold-products.types.ts`                            | `TMissingElectricityEmissionFactor`, `TRegionYearMonth` types |
| `lib/organization-transaction/use-of-sold-products/use-of-sold-products-missing-emission-factors.service.ts` | Core logic, file generation, email dispatch                   |
| `graphql/shared/sdk.ts` – `getUseOfSoldProductsElectricityByOrgId`                                           | Query electricity data for the full organization              |
| `app/api/v1/ghg-data-import/transaction/use-of-sold-products/excel/route.ts` – step 11                       | Calls service after audit logs                                |

**DB seed requirement (deployment):**

```sql
INSERT INTO "EmailTemplates" (code, subject, template, to, cc_emails, bcc_emails)
VALUES (
  'UseOfSoldProducts_Missing_Grid_Emission_Factors_Email',
  'Missing Electricity Emission Factors – {{organization_name}}',
  '<p>Hi Team,</p><p>Organization <strong>{{organization_name}}</strong> has uploaded Use of Sold Products data. The following electricity emission factors are missing for the regions listed in the attached file.</p><p><a href="{{fileUrl}}">Download Missing Factors</a></p><p>Copyright {{copyrightYear}}</p>',
  'ops@snowkap.com',
  '{}',
  '{}'
);
```

---

## Reference Patterns

| Pattern                      | Reference File                                                                                     |
| ---------------------------- | -------------------------------------------------------------------------------------------------- |
| Activity constant structure  | `shared/constants/activity.constant.ts` → `GridPowerDetailsConstant`                               |
| Excel upload route           | `app/api/v1/ghg-data-import/transaction/energy-grid-power/excel/route.ts`                          |
| Template download route      | `app/api/v1/ghg-data-import/transaction/product-share-allocation/template/route.ts`                |
| Validation schemas (Zod)     | `lib/organization-transaction/energy/energy-grid-power.validation.ts`                              |
| Service layer (save entries) | `lib/organization-transaction/energy/energy-grid-power.service.ts`                                 |
| Emission calculation         | `lib/emission-calculation-engine/emisison-calculation.service.ts`                                  |
| Audit logging                | `lib/auditlog/auditlog.service.ts`                                                                 |
| Multi-sheet template         | `shared/constants/activity.constant.ts` → `WasteActivityConstant`, `FuelPurchasedActivityConstant` |

---

## Testing Checklist

### Template Download

- [ ] Download template returns Excel with 3 sheets (Fuel, Electricity, Refrigerant)
- [ ] Column headers match the activity constant definition
- [ ] Working columns (K–O) are present with tooltip text
- [ ] File name follows pattern: `Use_of_Sold_Products - DDMMYYYY.xlsx` (e.g., `Use_of_Sold_Products - 23032026.xlsx`)

### Excel Upload – Template Validation

- [ ] Upload with correct 3-sheet template passes template validation
- [ ] Upload with missing sheet name fails with descriptive error
- [ ] Upload with incorrect column headers fails with descriptive error
- [ ] Upload with all sheets blank returns appropriate response

### Excel Upload – Data Validation (Fuel Sheet)

- [ ] Valid rows pass validation
- [ ] Missing Product Code returns error
- [ ] Missing Type of Fuel Consumed returns error
- [ ] Non-numeric Quantity of Fuel Consumed (product lifetime) returns error
- [ ] Quantity with >4 decimal places returns error
- [ ] Quantity with >15 digits returns error
- [ ] Invalid Type of Fuel Consumed (not in master data) returns error
- [ ] Missing UoM of Fuel Consumed returns error
- [ ] Blank Lifetime of Product is stored as null
- [ ] Blank Rationale is stored as null
- [ ] Non-numeric Lifetime of Product (when filled) returns error
- [ ] Negative Lifetime of Product returns error

### Excel Upload – Data Validation (Electricity Sheet)

- [ ] Valid rows pass validation
- [ ] Missing Product Code returns error
- [ ] Missing Region returns error
- [ ] Invalid Region (not in master data) returns error
- [ ] Non-numeric Units of Electricity consumed in kWh (product lifetime) returns error

### Excel Upload – Data Validation (Refrigerant Sheet)

- [ ] Valid rows pass validation
- [ ] Missing Product Code returns error
- [ ] Missing Refrigerant type used in sold product returns error
- [ ] Invalid Refrigerant type used in sold product (not in master data) returns error
- [ ] Non-numeric Quantity of Refrigerant consumed returns error
- [ ] Missing UoM of Refrigerant consumed returns error

### Emission Calculation

- [ ] Fuel sheet: `Quantity (Tonne) × Quality (GJ/T) × EF (kgCO₂e/GJ)` produces correct result
- [ ] Fuel sheet: Mass UoM (e.g., kg) correctly converted to Tonne before calculation
- [ ] Fuel sheet: Volume UoM (e.g., Litre) uses fuel-specific volume-to-tonne conversion factor
- [ ] Electricity sheet: `Units of Electricity consumed in kWh × Regional EF (kgCO₂e/kWh)` produces correct result
- [ ] Electricity sheet: Region with different casing from DB is resolved via `getMatchedGeographiesByRegionsILike`
- [ ] Refrigerant sheet: `Quantity (Tonne) × GWP` produces correct result (GWP NOT divided by 1000)
- [ ] Refrigerant sheet: Mass UoM (e.g., kg) correctly converted to Tonne before calculation
- [ ] Missing emission factor returns zero (not an error — calculation proceeds with 0)
- [ ] Emission dashboard is updated after successful upload

### Audit & Security

- [x] Audit log entries created for insert/delete operations
- [ ] User without facility permission is blocked from upload
- [ ] Rate limiting is enforced on upload API

### Missing Emission Factors Notification (Electricity Sheet)

- [ ] Email is sent **only when missing factors exist** — no email sent when all factors are present or there is no Electricity data
- [ ] Upload with a region that has no emission factor for the given Year+Month → email sent with Excel download link containing that combination
- [ ] Upload with all regions having matching factors → `generateAndUploadMissingEmissionFactorsFileForUseOfSoldProducts` returns `""` → no email sent
- [ ] Upload with a region that does NOT exist in `EmissionFactorGeographyHierarchy` → region is still included in the missing factors check (not pre-filtered out)
- [ ] Missing factors list covers the full organization dataset (not just the current upload)
- [ ] Email uses template code `UseOfSoldProducts_Missing_Grid_Emission_Factors_Email`
- [ ] Excel download link in email works and downloads the file
- [ ] Email is fire-and-forget — a template error does not fail the upload response

### Persistence Workflow

- [ ] Re-upload for same period overwrites existing data (delete parent + insert)
- [ ] Data import history record created with correct status

### Edge Cases

- [ ] Upload with only 1 sheet filled (other 2 blank) processes only the filled sheet
- [ ] Upload with only 2 sheets filled processes both correctly
- [ ] Very large file (1000+ rows per sheet) processes without timeout
- [ ] Concurrent uploads for same facility are handled correctly
