# Category 11 KPI Implementation - Lifetime Product Emissions

## Overview

This document describes the implementation of `KPIEmissionLifetimeSoldProductCategory11` table, which aggregates and stores lifetime emissions for products sold by the organization.

The KPI table combines emissions calculated from three independent sources:

1. **Fuel-related emissions** (from `GHGUseOfSoldProducts_Fuel` → `kpi_em_Scope3_Category11`)
2. **Electricity-related emissions** (from `GHGUseOfSoldProducts_Electricity` → `kpi_em_Scope3_Category11`)
3. **Refrigerant-related emissions** (from `GHGUseOfSoldProducts_Refrigerant` → `kpi_em_Scope3_Category11`)

**Product Lifetime Emissions = Fuel Emissions + Electricity Emissions + Refrigerant Emissions**

## Emission Calculation Flow

```
┌─────────────────────────────────────────────────────┐
│  User uploads Category 11 Excel with 3 sheets       │
│  (Fuel, Electricity, Refrigerant)                   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  Validation & storage in three tables               │
│  • GHGUseOfSoldProducts_Fuel                        │
│  • GHGUseOfSoldProducts_Electricity                 │
│  • GHGUseOfSoldProducts_Refrigerant                 │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  calculateUseOfSoldProductsEmission()               │
│  • Retrieves rows from all 3 tables                 │
│  • Applies emission factor logic                    │
│  • Calculates & updates kpi_em_Scope3_Category11    │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│  calculateUseOfSoldProductsKPI()                    │
│  • Aggregates by product_code + year/month          │
│  • Sums fuel + electricity + refrigerant            │
│  • Upserts to KPIEmissionLifetimeSoldProductCategory11
└─────────────────────────────────────────────────────┘
```

## Data Model

### Source Tables (Pre-existing)

#### GHGUseOfSoldProducts_Fuel

```
id, task_request_id, Product_Code, Type_of_Fuel_Consumed,
Quantity_of_Fuel_Consumed, UoM_of_Fuel_Consumed, ...
kpi_em_Scope3_Category11 (calculated),
kpi_emf_Scope3_Category11 (EF value)
```

#### GHGUseOfSoldProducts_Electricity

```
id, task_request_id, Product_Code, Region,
Units_of_Electricity_consumed_in_kWh, ...
kpi_em_Scope3_Category11 (calculated),
kpi_emf_Scope3_Category11 (EF value)
```

#### GHGUseOfSoldProducts_Refrigerant

```
id, task_request_id, Product_Code, Refrigerant_type_used_in_sold_product,
Quantity_of_Refrigerant_consumed, ...
kpi_em_Scope3_Category11 (calculated),
kpi_emf_Scope3_Category11 (EF value)
```

### KPI Table (New)

#### KPIEmissionLifetimeSoldProductCategory11

| Column                                 | Type               | Description                              |
| -------------------------------------- | ------------------ | ---------------------------------------- |
| `id`                                   | UUID PK            | Unique identifier                        |
| `organization_id`                      | UUID FK            | Reporting organization                   |
| `region_id`                            | UUID FK (nullable) | Region from address country code         |
| `address_id`                           | UUID FK            | Facility/site address                    |
| `product_code`                         | TEXT               | Product identifier (grouping key)        |
| `year`                                 | NUMERIC(4)         | Reporting year                           |
| `month`                                | NUMERIC(2)         | Reporting month (1-12)                   |
| `em_uom`                               | TEXT               | Unit of measure (always "tco2e")         |
| `kpi_em_Scope3_Category11_Fuel`        | DOUBLE PRECISION   | Aggregated fuel emissions                |
| `kpi_em_Scope3_Category11_Electricity` | DOUBLE PRECISION   | Aggregated electricity emissions         |
| `kpi_em_Scope3_Category11_Refrigerant` | DOUBLE PRECISION   | Aggregated refrigerant emissions         |
| `kpi_em_Scope3_Category11_Total`       | DOUBLE PRECISION   | Total = Fuel + Electricity + Refrigerant |
| `metadata`                             | JSONB              | Future extensibility                     |
| `is_deleted`                           | BOOLEAN            | Soft delete flag                         |
| `created_at`, `updated_at`             | TIMESTAMPTZ        | Audit timestamps                         |
| `created_by`, `updated_by`             | UUID               | Audit user IDs                           |

**Unique Constraint:**

```sql
UNIQUE (organization_id, address_id, product_code, year, month)
WHERE NOT is_deleted
```

This ensures one KPI record per product per facility per reporting period.

## SQL Aggregation Query

**Function:** `SQL_QUERY_GET_Category11_KPI_Details(taskrequestlist)`
**Location:** `shared/Queries/dashboardqueries.ts`

### Logic

1. **Three CTE (Common Table Expressions)** aggregate each source:

   - `cat11_fuel_agg` – SUM kpi_em_Scope3_Category11 per product
   - `cat11_electricity_agg` – SUM kpi_em_Scope3_Category11 per product
   - `cat11_refrigerant_agg` – SUM kpi_em_Scope3_Category11 per product

2. **FULL OUTER JOIN** combines all three sources:

   - Handles products that appear in only 1–3 sheets
   - Uses COALESCE to pick first non-NULL task_request_id, product_code, etc.

3. **Final SELECT** enriches with task context:

   - Organization, region, address (from TaskRequest relationships)
   - Year/month (from TaskRequest)
   - Emission unit ("tco2e")

4. **WHERE clause** filters:
   - Only returns records where at least one emission > 0
   - Respects `is_deleted` flag on source tables

### Example Output

```
organization_id | product_code | year | month | fuel | electricity | refrigerant | total
————————————————|—————————————|——————|——————|——————|—————————————|—————————————|———————
org-123         | PROD-A      | 2026 |   1  | 100  | 50          | 25          | 175
org-123         | PROD-A      | 2026 |   2  | 120  | 60          | 30          | 210
org-123         | PROD-B      | 2026 |   1  | 80   | 40          | 20          | 140
```

## Service Implementation

### Main Function: `buildUseOfSoldProductsKPIData()`

**Location:** `lib/emission-calculation-engine/emission-use-of-sold-products-kpi.service.ts`

This function is called from within `saveEmissionDashboard()` and builds KPI data for insertion along with all other KPI tables.

#### Steps

1. **Validate Input:** Check task request IDs are not empty
2. **Execute SQL Query:** Fetch aggregated KPI data via `SQL_QUERY_GET_Category11_KPI_Details()`
3. **Transform Results:** Map database rows into KPI insert format
4. **Return Data:** Return array of KPI records ready for batch insertion

#### Implementation

```typescript
export const buildUseOfSoldProductsKPIData = async (
  taskRequestIds: string[]
): Promise<Record<string, any>[]> => {
  const taskrequestlist = `(${taskRequestIds.map((id) => `'${id}'`).join(",")})`;
  const kpiData = await dbContext.execute(
    SQL_QUERY_GET_Category11_KPI_Details(taskrequestlist)
  );
  return kpiData.map((row) => ({
    organization_id: row.organization_id,
    region_id: row.region_id,
    address_id: row.address_id,
    product_code: row.product_code,
    month: row.month,
    year: row.year,
    em_uom: "tco2e",
    kpi_em_Scope3_Category11_Fuel: row.kpi_em_scope3_category11_fuel ?? 0,
    kpi_em_Scope3_Category11_Electricity:
      row.kpi_em_scope3_category11_electricity ?? 0,
    kpi_em_Scope3_Category11_Refrigerant:
      row.kpi_em_scope3_category11_refrigerant ?? 0,
    kpi_em_Scope3_Category11_Total: row.kpi_em_scope3_category11_total ?? 0,
    metadata: {},
  }));
};
```

#### Integration with Dashboard

The `saveEmissionDashboard()` function:

1. Calls `buildUseOfSoldProductsKPIData()` to fetch and format Category 11 KPI data
2. Iterates through results and populates `KPIEmissionLifetimeSoldProductCategory11` array
3. Includes this array in the `insertkpiEmissionDashboardData()` GraphQL mutation call
4. The mutation handles deletion of old records and insertion of new ones atomically

## Integration with Main Emission Calculation

**File:** `lib/emission-calculation-engine/emission-use-of-sold-products.service.ts`

After computing row-level emissions and updating the three source tables, the main function calls:

```typescript
await calculateUseOfSoldProductsKPI(taskRequestIds, organizationId);
```

This ensures:

- KPI records are only created after row-level emissions exist
- Products without any emissions (all zeros) are excluded
- The aggregation reflects the latest emission calculations

## GraphQL Integration

**File:** `graphql/mutations/insertkpiEmissionDashboardData.gql`

Category 11 KPI data is inserted as part of the existing `insertkpiEmissionDashboardData()` mutation, which handles all KPI table insertions atomically.

### Mutation Call Pattern

```typescript
await sdk.insertkpiEmissionDashboardData({
  // Delete old KPI records for the affected months/years
  deleteKPIEmissionLifetimeSoldProductCategory11: { _or: deleteCondition },

  // Insert new KPI records
  KPIEmissionLifetimeSoldProductCategory11:
    KPIEmissionLifetimeSoldProductCategory11,

  // ... plus all other KPI table inserts ...
});
```

**Delete Condition:** For each task request, soft-delete all existing KPI records where:

```sql
month = task.month AND year = task.year AND address_id = task.address_id
```

**Insert Behavior:**

- Rows with ALL zero emissions (fuel=0, electricity=0, refrigerant=0) are excluded by the SQL query
- Records with same (org_id, address_id, product_code, year, month) use Hasura's upsert constraint to update existing records
- Audit columns (`created_by`, `updated_by`) are set to the current user ID

## Testing Checklist

- [ ] **Database:** Table `KPIEmissionLifetimeSoldProductCategory11` created with all columns and indexes
- [ ] **Hasura:** Table tracked, permissions configured for `organization_admin` role
- [ ] **TypeScript:** Types generated after `yarn codegen`
- [ ] **SQL Query:** `SQL_QUERY_GET_Category11_KPI_Details()` returns correct aggregations with zero-emission filtering
- [ ] **Service:** `buildUseOfSoldProductsKPIData()` executes and returns correctly formatted records
- [ ] **Integration:** `saveEmissionDashboard()` calls `buildUseOfSoldProductsKPIData()` and includes result in mutation
- [ ] **GraphQL Mutation:** `insertkpiEmissionDashboardData()` accepts Category 11 KPI parameters (after codegen)
- [ ] **Deletion:** Old KPI records soft-deleted correctly when recalculating data
- [ ] **Upsert:** Duplicate records (same org/product/address/month/year) update instead of duplicate
- [ ] **Totals:** Verify `kpi_em_Scope3_Category11_Total` = Fuel + Electricity + Refrigerant
- [ ] **End-to-End:** Upload 3-sheet Excel → verify Category 11 KPI records appear in `KPIEmissionLifetimeSoldProductCategory11` table
- [ ] **Dashboard:** Verify KPI data is queryable and displayable in analytics/reporting dashboards

## Reference Patterns

This implementation follows the same pattern as `KpiEmissionByScope3` for Category 3:

| Aspect            | Category 3 Pattern                    | Category 11 Implementation                 |
| ----------------- | ------------------------------------- | ------------------------------------------ |
| Source Tables     | 2 (GridPower, FuelPurchased)          | 3 (Fuel, Electricity, Refrigerant)         |
| Aggregation Key   | organization / address / year / month | + product_code                             |
| SQL CTE           | One per source                        | One per source                             |
| Join Type         | LEFT JOIN                             | FULL OUTER JOIN (handles partial data)     |
| KPI Table         | `KpiEmissionByScope3`                 | `KpiEmissionLifetimeSoldProductCategory11` |
| Batch Size        | 2000                                  | 1000                                       |
| Conflict Strategy | Upsert with constraint                | Same                                       |

---

**Last Updated:** April 17, 2026
**Author:** Implementation Guide
