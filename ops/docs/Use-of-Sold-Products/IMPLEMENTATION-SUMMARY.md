# Category 11 Lifetime Product Emissions KPI - Implementation Summary

## Overview

Category 11 (Use of Sold Products) has been implemented with complete support for calculating and aggregating lifetime product emissions. The implementation combines three types of emissions (Fuel, Electricity, Refrigerant) into a single KPI table for reporting and analytics.

## What Was Implemented

### 1. Database Migration

**File:** `docs/Use-of-Sold-Products/db-migration/kpi-emission-lifetime-sold-products.md`

Creates `KPIEmissionLifetimeSoldProductCategory11` table with:

- **Columns:** organization_id, address_id, product_code, year, month, em_uom
- **KPI Fields:**
  - `kpi_em_Scope3_Category11_Fuel` - Aggregated fuel emissions per product
  - `kpi_em_Scope3_Category11_Electricity` - Aggregated electricity emissions per product
  - `kpi_em_Scope3_Category11_Refrigerant` - Aggregated refrigerant emissions per product
  - `kpi_em_Scope3_Category11_Total` - Sum of all three components
- **Unique Constraint:** One record per (org, product, address, year, month)
- **Indexes:** For efficient querying by org, address, product, year/month

### 2. SQL Aggregation Query

**File:** `shared/Queries/dashboardqueries.ts`
**Function:** `SQL_QUERY_GET_Category11_KPI_Details(taskrequestlist)`

Aggregates data from three independent sheets:

- Uses **FULL OUTER JOIN** to handle products that appear in only 1-3 sheets
- Filters out records with zero emissions (fuel=0 AND electricity=0 AND refrigerant=0)
- Groups by product_code per organization per reporting period
- Returns combined results with all aggregation done at SQL layer for performance

### 3. Service Layer

**File:** `lib/emission-calculation-engine/emission-use-of-sold-products-kpi.service.ts`
**Function:** `buildUseOfSoldProductsKPIData(taskRequestIds)`

- Executes the SQL aggregation query
- Transforms results into KPI insert format
- Returns array of records ready for batch insertion
- Called from `saveEmissionDashboard()` - reuses existing dashboard mutation pattern

### 4. Integration with Dashboard

**File:** `lib/emission-calculation-engine/emisison-calculation.service.ts`
**Function:** `saveEmissionDashboard()`

Integration points:

1. **Line ~233-235:** Imports and calls `buildUseOfSoldProductsKPIData()`
2. **Line ~268:** Declares `KPIEmissionLifetimeSoldProductCategory11` array
3. **Line ~906-929:** Processes Category 11 data like Category 3 (transforms and populates array)
4. **Line ~974-977:** Includes in `insertkpiEmissionDashboardData()` mutation call with:
   - Delete condition: Soft-deletes old records for affected months/years/addresses
   - Insert array: New/updated KPI records

### 5. Data Flow

```
Excel Upload (3 sheets)
         ↓
┌─────────────────────────────────┐
│ Row-level Emission Calculation  │
├─────────────────────────────────┤
│ Fuel: Qty × Quality × EF        │
│ Electricity: kWh × EF           │
│ Refrigerant: Qty × GWP          │
└────────┬────────────────────────┘
         ↓ (stored in source tables with kpi_em_Scope3_Category11)
┌─────────────────────────────────┐
│ saveEmissionDashboard()         │
├─────────────────────────────────┤
│ 1. Query aggregates by product  │
│ 2. buildUseOfSoldProductsKPIData│
│ 3. Transform to insert format   │
│ 4. Insert via dashboard mutation│
└────────┬────────────────────────┘
         ↓
┌─────────────────────────────────┐
│ KPIEmissionLifetimeSoldProductC11│
├─────────────────────────────────┤
│ product_code | fuel | elec | ref│
│ PROD-A       | 100  | 50   | 25 │ (total: 175)
│ PROD-B       | 80   | 40   | 20 │ (total: 140)
└─────────────────────────────────┘
```

## Key Features

### ✅ Multi-source Aggregation

- Combines fuel, electricity, and refrigerant emissions per product
- Handles products that only have 1-2 emission types (e.g., only fuel & electricity, no refrigerant)
- Uses FULL OUTER JOIN to ensure no data is lost

### ✅ Product-level Grouping

- Aggregates across all rows for the same product in a reporting period
- Allows tracking emissions per product, not just per transaction
- Supports product lifecycle analysis (total emissions over time)

### ✅ Performance Optimized

- All aggregation done at SQL layer (not in application)
- Filters zero-emission records at database level
- Uses proper indexes for fast lookups
- Batch insertable via existing dashboard mutation

### ✅ Soft Deletes

- Recalculation deletes old records via soft-delete flag
- No data loss, audit trail preserved
- Allows re-running emission calculations without duplicates

### ✅ Audit Trail

- `created_by`, `updated_by` fields track who calculated emissions
- `created_at`, `updated_at` timestamps for when calculations ran
- `is_deleted` flag for soft-delete capability

## Emission Formula

Each product's lifetime emissions are calculated as:

```
Total Lifetime Emissions =
  SUM(Fuel Emissions) + SUM(Electricity Emissions) + SUM(Refrigerant Emissions)

Where:
  - Fuel Emissions = Σ(Quantity × Quality × EF) per product
  - Electricity Emissions = Σ(kWh × EF) per product
  - Refrigerant Emissions = Σ(Quantity × GWP) per product
```

## Deployment Steps

### Step 1: Database

```bash
# Create table and indexes
psql -f docs/Use-of-Sold-Products/db-migration/kpi-emission-lifetime-sold-products.md
```

### Step 2: Hasura

```
1. Go to Hasura console
2. Track "KPIEmissionLifetimeSoldProductCategory11" table
3. Set up organization_admin role permissions with row-level filtering
4. Reload metadata
```

### Step 3: Codegen

```bash
# Generate TypeScript types
yarn codegen
```

### Step 4: Deploy

```bash
# Deploy updated emission-calculation.service.ts with Category 11 integration
git push main
```

### Step 5: Verify

1. Upload Category 11 Excel file with 3 sheets
2. Wait for emission calculation to complete
3. Query `KPIEmissionLifetimeSoldProductCategory11` table
4. Verify `kpi_em_Scope3_Category11_Total` = Sum of three components

## Files Changed

| File                                                                            | Change                                                    | Type          |
| ------------------------------------------------------------------------------- | --------------------------------------------------------- | ------------- |
| `shared/Queries/dashboardqueries.ts`                                            | Added `SQL_QUERY_GET_Category11_KPI_Details()`            | Query         |
| `lib/emission-calculation-engine/emission-use-of-sold-products-kpi.service.ts`  | Rewrote to use `buildUseOfSoldProductsKPIData()`          | Service       |
| `lib/emission-calculation-engine/emisison-calculation.service.ts`               | Integrated Category 11 KPI into `saveEmissionDashboard()` | Integration   |
| `docs/Use-of-Sold-Products/db-migration/kpi-emission-lifetime-sold-products.md` | New DDL for KPI table                                     | Migration     |
| `docs/Use-of-Sold-Products/KPI-IMPLEMENTATION.md`                               | Complete implementation guide                             | Documentation |

## What's NOT Changed

- Row-level emission calculation (still in `emission-use-of-sold-products.service.ts`)
- GraphQL mutations for individual sheet uploads
- Validation schemas
- Template structure

## Testing

Run end-to-end test:

1. **Upload Category 11 Excel**

   - Include Fuel, Electricity, and Refrigerant sheets
   - Use at least 2 different products to verify aggregation

2. **Check results:**

   ```sql
   SELECT
     product_code,
     kpi_em_Scope3_Category11_Fuel,
     kpi_em_Scope3_Category11_Electricity,
     kpi_em_Scope3_Category11_Refrigerant,
     kpi_em_Scope3_Category11_Total
   FROM "KPIEmissionLifetimeSoldProductCategory11"
   WHERE organization_id = 'your-org-id'
   ORDER BY year, month, product_code;
   ```

3. **Verify calculations:**
   - Total = Fuel + Electricity + Refrigerant
   - No missing products that had emissions
   - Correct grouping by product and period

## Future Enhancements

- Dashboard visualization of product lifecycle emissions
- Trending analysis (emissions over time per product)
- Product comparison reports
- Integration with product LCA (Life Cycle Assessment) tools
- Export to external reporting tools

---

**Last Updated:** April 17, 2026
**Status:** ✅ Implementation Complete
**Ready for:** Database Migration → Hasura Setup → Deployment
