# GraphQL Mutation Setup for Category 11 KPI

## Mutation Definition

The Category 11 KPI data is inserted via the existing `insertkpiEmissionDashboardData` mutation. After the table is created and tracked in Hasura, the mutation will automatically support the new parameters.

### Required Mutation Parameters

Add these two parameters to the `insertkpiEmissionDashboardData` mutation:

```graphql
mutation InsertKpiEmissionDashboardData(
  # ... existing parameters ...
  $deleteKPIEmissionLifetimeSoldProductCategory11: KpiEmissionLifetimeSoldProductCategory11_bool_exp
  $kpiEmissionLifetimeSoldProductCategory11: [KpiEmissionLifetimeSoldProductCategory11_insert_input!]!
) {
  # ... existing mutations ...
  
  # Delete old Category 11 KPI records (soft delete)
  deleteKPIEmissionLifetimeSoldProductCategory11: update_KpiEmissionLifetimeSoldProductCategory11(
    where: $deleteKPIEmissionLifetimeSoldProductCategory11
    _set: { is_deleted: true, updated_at: "now()" }
  ) {
    affected_rows
  }
  
  # Insert new Category 11 KPI records
  insertKpiEmissionLifetimeSoldProductCategory11: insert_KpiEmissionLifetimeSoldProductCategory11(
    objects: $kpiEmissionLifetimeSoldProductCategory11
    on_conflict: {
      constraint: idx_kpi_c11_unique_product_period
      update_columns: [
        kpi_em_Scope3_Category11_Fuel
        kpi_em_Scope3_Category11_Electricity
        kpi_em_Scope3_Category11_Refrigerant
        kpi_em_Scope3_Category11_Total
        updated_at
        updated_by
      ]
    }
  ) {
    affected_rows
    returning {
      id
      product_code
      year
      month
      kpi_em_Scope3_Category11_Total
    }
  }
}
```

## Data Flow in Code

### 1. Delete Operation

**Location:** `lib/emission-calculation-engine/emisison-calculation.service.ts` (lines 924-939)

```typescript
const deleteCondition: Record<string, any>[] = [];
taskrequestalldata?.TaskRequest.forEach((item) => {
  deleteCondition.push({
    _and: {
      month: { _eq: monthNumber },
      year: { _eq: item.year },
      address_id: { _eq: item.organization_address_id },
    },
  });
});
```

This creates conditions to soft-delete all old KPI records matching:
- The same month AND year AND address_id
- Then the mutation sets `is_deleted = true` on those records

### 2. Insert Operation

**Location:** `lib/emission-calculation-engine/emisison-calculation.service.ts` (lines 900-920)

Data is collected from `buildUseOfSoldProductsKPIData()` and structured with all required fields:

```typescript
{
  organization_id: UUID,           // Required
  region_id: UUID | null,          // Optional (from organization address)
  address_id: UUID,                // Required
  product_code: string,            // Required (normalized to lowercase)
  month: number,                   // Required (1-12)
  year: number,                    // Required
  em_uom: string,                  // Required (default "tco2e")
  kpi_em_Scope3_Category11_Fuel: number,        // Aggregated fuel emissions
  kpi_em_Scope3_Category11_Electricity: number, // Aggregated electricity emissions
  kpi_em_Scope3_Category11_Refrigerant: number, // Aggregated refrigerant emissions
  kpi_em_Scope3_Category11_Total: number,       // Sum of all three
  metadata: object,                // Optional (audit/debugging data)
  created_by: UUID,                // Current user
  updated_by: UUID,                // Current user
}
```

### 3. Upsert via Unique Constraint

The mutation uses the unique constraint `idx_kpi_c11_unique_product_period`:

```sql
UNIQUE (organization_id, address_id, product_code, year, month) WHERE NOT is_deleted
```

**Behavior:**
- If a record exists with the same (org_id, address_id, product_code, year, month), it updates:
  - All four KPI columns (Fuel, Electricity, Refrigerant, Total)
  - `updated_at` timestamp
  - `updated_by` user ID
- If no record exists, it creates a new one
- Soft-deleted records (`is_deleted = true`) are excluded from the constraint, allowing reinsertion

## Soft Delete Strategy

**Why soft delete?**
- Preserves audit trail (who calculated, when)
- Allows recalculation without data loss
- Enables data recovery if needed

**Process:**
1. When emissions are recalculated, old KPI records are marked as deleted
2. New records are created (or updated via upsert)
3. Queries can filter with `WHERE NOT is_deleted` to get active records

## Verification Queries

After the mutation runs, verify the data:

```sql
-- Check new KPI records
SELECT 
  product_code, 
  year, 
  month,
  kpi_em_Scope3_Category11_Fuel,
  kpi_em_Scope3_Category11_Electricity,
  kpi_em_Scope3_Category11_Refrigerant,
  kpi_em_Scope3_Category11_Total,
  is_deleted
FROM "KpiEmissionLifetimeSoldProductCategory11"
WHERE NOT is_deleted
ORDER BY year, month, product_code;

-- Check deleted records
SELECT COUNT(*) as soft_deleted_count
FROM "KpiEmissionLifetimeSoldProductCategory11"
WHERE is_deleted = true;

-- Verify totals are correct
SELECT 
  product_code,
  CASE WHEN 
    (kpi_em_Scope3_Category11_Fuel + 
     kpi_em_Scope3_Category11_Electricity + 
     kpi_em_Scope3_Category11_Refrigerant) = kpi_em_Scope3_Category11_Total
  THEN 'OK' 
  ELSE 'MISMATCH' 
  END as validation_status,
  COUNT(*) as record_count
FROM "KpiEmissionLifetimeSoldProductCategory11"
WHERE NOT is_deleted
GROUP BY validation_status;
```

## Auto-Generation via Codegen

After the table is tracked in Hasura, running `yarn codegen` will generate:

1. **Insert Input Type:**
   ```typescript
   type KpiEmissionLifetimeSoldProductCategory11_insert_input = {
     organization_id: Scalars['uuid']['input'];
     region_id?: Scalars['uuid']['input'] | null;
     address_id: Scalars['uuid']['input'];
     product_code: Scalars['text']['input'];
     month: Scalars['numeric']['input'];
     year: Scalars['numeric']['input'];
     em_uom?: Scalars['text']['input'] | null;
     kpi_em_Scope3_Category11_Fuel?: Scalars['float8']['input'] | null;
     kpi_em_Scope3_Category11_Electricity?: Scalars['float8']['input'] | null;
     kpi_em_Scope3_Category11_Refrigerant?: Scalars['float8']['input'] | null;
     kpi_em_Scope3_Category11_Total?: Scalars['float8']['input'] | null;
     metadata?: Scalars['jsonb']['input'] | null;
     created_by?: Scalars['uuid']['input'] | null;
     updated_by?: Scalars['uuid']['input'] | null;
   };
   ```

2. **Boolean Expression Type:**
   ```typescript
   type KpiEmissionLifetimeSoldProductCategory11_bool_exp = {
     _and?: KpiEmissionLifetimeSoldProductCategory11_bool_exp[] | null;
     _or?: KpiEmissionLifetimeSoldProductCategory11_bool_exp[] | null;
     _not?: KpiEmissionLifetimeSoldProductCategory11_bool_exp | null;
     organization_id?: uuid_comparison_exp | null;
     address_id?: uuid_comparison_exp | null;
     product_code?: text_comparison_exp | null;
     year?: numeric_comparison_exp | null;
     month?: numeric_comparison_exp | null;
     is_deleted?: boolean_comparison_exp | null;
     // ... other fields ...
   };
   ```

## Testing the Mutation

After codegen, test with sample data:

```typescript
// In your test or emission calculation
await sdk.insertkpiEmissionDashboardData({
  // ... other parameters ...
  deleteKPIEmissionLifetimeSoldProductCategory11: {
    _or: [
      {
        _and: {
          month: { _eq: 1 },
          year: { _eq: 2026 },
          address_id: { _eq: "your-address-id" },
        },
      },
    ],
  },
  kpiEmissionLifetimeSoldProductCategory11: [
    {
      organization_id: "org-id",
      address_id: "address-id",
      product_code: "prod-a",
      month: 1,
      year: 2026,
      em_uom: "tco2e",
      kpi_em_Scope3_Category11_Fuel: 100,
      kpi_em_Scope3_Category11_Electricity: 50,
      kpi_em_Scope3_Category11_Refrigerant: 25,
      kpi_em_Scope3_Category11_Total: 175,
      created_by: "user-id",
      updated_by: "user-id",
    },
  ],
});
```

---

**Status:** ✅ Ready for deployment after:
1. Table created in database
2. Table tracked in Hasura
3. Permissions configured
4. `yarn codegen` executed
5. Application deployed

**Last Updated:** April 17, 2026
