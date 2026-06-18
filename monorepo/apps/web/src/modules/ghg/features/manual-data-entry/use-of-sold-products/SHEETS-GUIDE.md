# Use of Sold Products - Multiple Sheets Implementation Guide

## Overview

The "Use of Sold Products" activity consists of 3 sheets:

1. **Fuel** (Sheet 0) - For fuel consumption data
2. **Electricity** (Sheet 1) - For electricity consumption data
3. **Refrigerant** (Sheet 2) - For refrigerant consumption data

Each sheet has multiple fields that must be validated and processed.

---

## Sheet Structure

### Common Fields (All Sheets)

- **Year** (Required) - Year of the data
- **Month** (Required) - Month of the data
- **Date** (Optional) - Specific date in `DD-MM-YYYY` format (hyphen separator). Validation has two stages:
  1. **Format check** (`dateFieldSchema`): single-digit day/month values (e.g. `4-6-2026`) are accepted and zero-padded automatically. Slash-separated text strings (e.g. `04/06/2026` or `1/4/2021`) are rejected with `"Date must be in DD-MM-YYYY format"`. Excel serial date numbers and JS Date objects (produced when the cell is formatted as a date in Excel) are **decoded**, not rejected — the decoded date proceeds to stage 2. Calendar-invalid dates (month > 12, day > daysInMonth, year < 1900 or > 2099) are rejected with the format error.
  2. **Cross-validation** (`validateDateMatchesMonthYear`): the decoded/parsed date's month and year are compared to the row's Month and Year columns. Mismatches surface a specific error rather than the generic format error:
     - Month mismatch only → `"The month in Date does not match the Month column"`
     - Year mismatch only → `"The year in Date does not match the Year column"`
     - Both mismatch → `"The month and year in Date do not match the Month and Year columns"`
     - Day/month swap detection: when the cell is formatted as a date in Excel and Excel parsed the user's `DD-MM-YYYY` input as `MM-DD-YYYY` (US locale), the decoded day will equal the Month column's number and day ≤ 12 — in that case the row is accepted (the user's intent is recovered).
- **Product Code** (Required on Electricity & Refrigerant, Optional on Fuel) - Code for the product
- **Lifetime of Product** (Optional) - Lifetime of product in years
- **Rationale** (Optional) - Rationale for the data
- **Additional comments** (Optional) - Any additional comments
- **Remarks** (Optional) - Any remarks about the data
- **Working details 1-5** (Optional) - Free text, max 5000 characters each. Stored in `metadata` JSONB column

### Fuel Sheet Specific Fields

- **Type of Fuel Consumed** (Required) - Type of fuel used
- **Quantity of Fuel Consumed (product lifetime)** (Required) - Quantity in product lifetime
- **UoM of Fuel Consumed** (Required) - Unit of measure for fuel

### Electricity Sheet Specific Fields

- **Region** (Required) - Geographic region for electricity grid
- **Units of Electricity consumed in kWh (product lifetime)** (Required) - kWh units for lifetime

### Refrigerant Sheet Specific Fields

- **Refrigerant type used in sold product** (Required) - Type of refrigerant
- **Quantity of Refrigerant consumed** (Required) - Quantity consumed
- **UoM of Refrigerant consumed** (Required) - Unit of measure for refrigerant

---

## Implementation Reference

The implementation follows the pattern of multi-sheet templates like "Waste" and "Fuel Purchased".

### Component Structure Example

```typescript
// features/manual-data-entry/use-of-sold-products/listing.tsx
import { UseOfSoldProductsConstant } from "@/modules/ghg/shared/constants/activity.constant";

const UseOfSoldProductsListing = () => {
  const sheetConfigs = UseOfSoldProductsConstant.excel_template.sheets;

  return (
    <Box>
      <Text>Use of Sold Products</Text>
      <Tabs defaultValue="fuel">
        <Tabs.List>
          {sheetConfigs.map((sheet) => (
            <Tabs.Tab key={sheet.code} value={sheet.code}>
              {sheet.name}
            </Tabs.Tab>
          ))}
        </Tabs.List>
        {sheetConfigs.map((sheet) => (
          <Tabs.Panel key={sheet.code} value={sheet.code}>
            <ManualEntryTable
              columns={sheet.columns}
              sheetCode={sheet.code}
              onDataChange={handleDataChange}
            />
          </Tabs.Panel>
        ))}
      </Tabs>
    </Box>
  );
};

export default UseOfSoldProductsListing;
```

---

## Field Validation Rules

> **Note:** All string fields use `z.preprocess()` to convert non-string values (e.g., numbers from Excel) to strings before validation. This ensures proper error messages like `"Type of Fuel Consumed is required"` instead of the generic `"Expected string, received number"`. This follows the same pattern used in Capital Goods and Material Procurement validations.

> **Script / HTML stripping:** Every TEXT-stored column in the service layer is run through `stripScriptContent()` (or `stripScriptContentOrNull()` for optional fields) from `utils/script-stripper/script-stripper.util.ts` before being saved.
>
> The stripper removes `<script>` / `<style>` blocks (with content), HTML comments, all letter-prefixed HTML tags (e.g. `<div>`, `<img>`, `<svg/onload=…>`), inline event-handler attributes (`onclick=`, `onerror=`, …) and dangerous URI schemes (`javascript:`, `vbscript:`, `data:text/html`).
>
> **Why not DOMPurify?** Server-side DOMPurify HTML-encodes every stray `<` / `>` to `&lt;` / `&gt;`, which would corrupt legitimate master-data values such as `Industrial gas-oil <0.10% sulfur>` and break downstream emission-factor lookups. DOMPurify also keeps "safe" HTML (`<b>`, `<div>`, `<a>`, `<img>`) which is still unwanted in tabular data. The custom stripper preserves text containing stray `<`/`>` characters and removes every HTML-tag-shaped substring that begins with a letter.
>
> Numeric columns (`Quantity`, `Units`) and the `Date` column are coerced via `Number(...)` / `normalizeExcelDate(...)` and therefore cannot carry script content; they are not run through the stripper.

### Fuel Sheet

- **Year/Month** - Standard year/month validation
- **Type of Fuel Consumed** - Required, must be valid fuel type (preprocessed: numbers auto-converted to string)
- **Product Code** - Required, alphanumeric format; numeric-only values (e.g. `3452`) are accepted and converted to string before saving — the service uses `stripScriptContent()` to coerce to TEXT and remove any HTML/script payload regardless of what type the Excel parser produces
- **Quantity of Fuel Consumed** - Required, numeric, max 15 digits, 4 decimals
- **UoM of Fuel Consumed** - Required, must be a UoM allowed for the selected `Type of Fuel Consumed` (cross-validated against the parent fuel type's group in `ActivityMaster`, key `use_of_sold_products_fuel_type_of_fuel_consumed_uom`). Cross-validation is skipped and falls back to flat validation when the fuel type's `value` field cannot be matched in any UoM `group[]` entry (e.g. fuel types whose names contain `<`, `>`, `(`, `)` where the DB `value` may differ from the `group` reference format).
- **Rationale** - Optional. Leading/trailing whitespace (spaces, tabs, newlines) is trimmed before validation. Whitespace-only values (e.g. multiple spaces or Enter presses) are treated as not provided and saved as `null`. Pure numeric values are rejected with `"Invalid Input: Numeric values are not allowed"`. HTML/script content stripped in the service layer before saving.
- **Additional comments** - Optional (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)
- **Remarks** - Optional (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)
- **Working details 1-5** - Optional, free text, max 5000 characters (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)

### Electricity Sheet

- **Year/Month** - Standard year/month validation
- **Product Code** - Required, alphanumeric format; numeric-only values (e.g. `3452`) are accepted and converted to string before saving — the service uses `stripScriptContent()` to coerce to TEXT and remove any HTML/script payload regardless of what type the Excel parser produces
- **Region** - Required, valid region code (preprocessed: numbers auto-converted to string)
- **Units of Electricity consumed** - Required, numeric, max 15 digits, 4 decimals
- **Rationale** - Optional. Leading/trailing whitespace (spaces, tabs, newlines) is trimmed before validation. Whitespace-only values (e.g. multiple spaces or Enter presses) are treated as not provided and saved as `null`. Pure numeric values are rejected with `"Invalid Input: Numeric values are not allowed"`. HTML/script content stripped in the service layer before saving.
- **Additional comments** - Optional (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)
- **Remarks** - Optional (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)
- **Working details 1-5** - Optional, free text, max 5000 characters (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)

### Refrigerant Sheet

- **Year/Month** - Standard year/month validation
- **Product Code** - Required, alphanumeric format; numeric-only values (e.g. `3452`) are accepted and converted to string before saving — the service uses `stripScriptContent()` to coerce to TEXT and remove any HTML/script payload regardless of what type the Excel parser produces
- **Refrigerant type** - Required, valid refrigerant type (preprocessed: numbers auto-converted to string)
- **Quantity of Refrigerant** - Required, numeric, max 15 digits, 4 decimals
- **UoM of Refrigerant** - Required, must be one of the UoMs in `ActivityMaster` key `use_of_sold_products_refrigerant_consumed_uom` (Kilogram, Pound, Tonne). All refrigerant types accept any of these three UoMs — there is no per-type UoM restriction. Flat validation (`validateActivityMasterDataByKey`) is used because the UoM master data has no `group` field.
- **Rationale** - Optional. Leading/trailing whitespace (spaces, tabs, newlines) is trimmed before validation. Whitespace-only values (e.g. multiple spaces or Enter presses) are treated as not provided and saved as `null`. Pure numeric values are rejected with `"Invalid Input: Numeric values are not allowed"`. HTML/script content stripped in the service layer before saving.
- **Additional comments** - Optional (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)
- **Remarks** - Optional (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)
- **Working details 1-5** - Optional, free text, max 5000 characters (preprocessed: numbers auto-converted to string; HTML/script stripped before saving)

---

## Data Validation & Storage

1. Template is read from S3 URL
2. Sheet names are matched against expected names (Fuel, Electricity, Refrigerant)
3. Column headers are trimmed and validated
4. Trailing blank rows are removed
5. Data is validated against Zod schemas per sheet type
6. Master-data validation against `ActivityMaster`:
   - Parent values (`Type of Fuel Consumed`, `Refrigerant type used in sold product`) validated via `validateActivityMasterDataByKey`
   - Dependent child values (`UoM of Fuel Consumed`, `UoM of Refrigerant consumed`) validated via `validateActivityMasterDataGroupByKey` so only UoMs belonging to the selected parent's group are accepted
7. Duplicate detection (within the current sheet only):
   - A row is flagged as a duplicate **only** when every column A–I matches an earlier row exactly. If any single column differs (e.g. different `Quantity`, `Date`, `Lifetime`, `Rationale`, `UoM`), the rows are treated as distinct entries.
   - Columns compared per sheet:
     - **Fuel**: Year, Month, Date, Type of Fuel Consumed, Product Code, Lifetime of Product, Rationale, Quantity of Fuel Consumed (product lifetime), UoM of Fuel Consumed
     - **Electricity**: Year, Month, Date, Product Code, Lifetime of Product, Rationale, Region, Units of Electricity consumed in kWh (product lifetime)
     - **Refrigerant**: Year, Month, Date, Product Code, Lifetime of Product, Rationale, Refrigerant type used in sold product, Quantity of Refrigerant consumed, UoM of Refrigerant consumed
8. Validated data is persisted to database via GraphQL mutations (upsert):
   - **New rows** (no existing record for the same task_request_id, or existing record has `metadata = null`) are deleted-and-inserted with all fields including the `metadata` JSONB (Working details 1–5).
   - **Existing rows** are updated in place. The UPDATE `_set` includes **every** mutable field — including the `metadata` JSONB — so re-uploading a template with modified Working details 1–5 will overwrite the prior values. Cleared cells reset the corresponding key in `metadata`; clearing all 5 working details sets `metadata` back to `null`.
9. Emission calculations are triggered for impact assessment

---

## Audit Log

All 3 sheets write to ClickHouse via `lib/auditlog/auditlog.service.ts`:
- `saveGHGUseOfSoldProductsFuel` → `snowkap_op_logs.GHGUseOfSoldProducts_Fuel`
- `saveGHGUseOfSoldProductsElectricity` → `snowkap_op_logs.GHGUseOfSoldProducts_Electricity`
- `saveGHGUseOfSoldProductsRefrigerant` → `snowkap_op_logs.GHGUseOfSoldProducts_Refrigerant`

Each `mapData` function includes `env: Envs.name` (from `~/shared/constants/env-variable.constant`) so the `env` column is populated the same way as all other activities.

---

## Related Files

- Activity Constant: `shared/constants/activity.constant.ts`
- Validation Schema: `lib/organization-transaction/use-of-sold-products/use-of-sold-products.validation.ts`
- Service Layer: `lib/organization-transaction/use-of-sold-products/use-of-sold-products.service.ts`
- Script Stripper: `utils/script-stripper/script-stripper.util.ts`
- API Route: `app/api/v1/ghg-data-import/transaction/use-of-sold-products/excel/route.ts`
- GraphQL Mutations: `graphql/mutations/insert-use-of-sold-products*.gql`
- Audit Log Service: `lib/auditlog/auditlog.service.ts`
