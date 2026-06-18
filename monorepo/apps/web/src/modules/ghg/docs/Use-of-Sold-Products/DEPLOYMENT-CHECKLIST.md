# Category 11 KPI - Deployment Checklist

## Pre-Deployment ✅

- [x] SQL aggregation query implemented: `SQL_QUERY_GET_Category11_KPI_Details()`
- [x] KPI service function: `buildUseOfSoldProductsKPIData()`
- [x] Integration with `saveEmissionDashboard()` complete
- [x] Documentation complete

## Phase 1: Database Setup

### Create Table and Indexes

- [ ] **DB Team:** Execute DDL from `docs/Use-of-Sold-Products/db-migration/kpi-emission-lifetime-sold-products.md`
  ```bash
  psql -U postgres -h <db-host> -d <database> -f kpi-emission-lifetime-sold-products.md
  ```
- [ ] **Verify:** Check table exists
  ```sql
  \dt "KPIEmissionLifetimeSoldProductCategory11"
  ```
- [ ] **Verify:** Check indexes created
  ```sql
  \di idx_kpi_c11_*
  ```

### Verify Schema

- [ ] All 18 columns present (id through updated_by)
- [ ] Primary key on `id`
- [ ] Foreign keys on organization_id, region_id, address_id
- [ ] `em_uom` has DEFAULT 'tco2e'
- [ ] `is_deleted` has DEFAULT false
- [ ] `created_at`, `updated_at` have DEFAULT now()

## Phase 2: Hasura Configuration

### Table Tracking

- [ ] Open Hasura console
- [ ] Navigate to Data > default > public
- [ ] Click "Track all" or manually track `KPIEmissionLifetimeSoldProductCategory11`
- [ ] Set custom type name to `KpiEmissionLifetimeSoldProductCategory11`

### Role Permissions

- [ ] Set `organization_admin` role permissions:
  - [ ] **Select:** Enabled with row filter: `{"organization_id": {"_eq": "X-Hasura-Organization-Id"}}`
  - [ ] **Insert:** Enabled with same filter
  - [ ] **Update:** Enabled with same filter (columns: Fuel, Electricity, Refrigerant, Total, updated_at)
  - [ ] **Delete:** Disabled (use soft-delete via is_deleted)

### Metadata Reload

- [ ] Click "Reload" in Hasura to apply changes
- [ ] Verify table appears in GraphQL schema

## Phase 3: Code Generation

### Generate Types

- [ ] Run code generation:
  ```bash
  yarn codegen
  ```
- [ ] Verify TypeScript types generated:
  - [ ] `KpiEmissionLifetimeSoldProductCategory11` type
  - [ ] `KpiEmissionLifetimeSoldProductCategory11_Insert_Input` type
  - [ ] `KpiEmissionLifetimeSoldProductCategory11_bool_exp` type
  - [ ] Mutation type has `KPIEmissionLifetimeSoldProductCategory11` and `deleteKPIEmissionLifetimeSoldProductCategory11` fields
- [ ] Check for compilation errors:
  ```bash
  yarn typecheck
  ```

## Phase 4: Code Review

### File Changes

- [ ] Review `shared/Queries/dashboardqueries.ts`

  - [ ] SQL query has FULL OUTER JOINs
  - [ ] Filters products with zero emissions
  - [ ] Uses correct column names from source tables

- [ ] Review `lib/emission-calculation-engine/emission-use-of-sold-products-kpi.service.ts`

  - [ ] `buildUseOfSoldProductsKPIData()` function signature correct
  - [ ] Returns `Record<string, any>[]`
  - [ ] Handles empty task request array
  - [ ] Uses `sanitizeString.v3()` for month comparison

- [ ] Review `lib/emission-calculation-engine/emisison-calculation.service.ts`
  - [ ] Line ~233: Import statement for `buildUseOfSoldProductsKPIData`
  - [ ] Line ~235: Call to `buildUseOfSoldProductsKPIData(taskrequestid)`
  - [ ] Line ~268: Variable declaration `KPIEmissionLifetimeSoldProductCategory11`
  - [ ] Line ~906-929: Loop populating the array with correct field mappings
  - [ ] Line ~974-977: GraphQL mutation includes delete and insert parameters

## Phase 5: Pre-Production Testing

### Unit Tests

- [ ] Test `buildUseOfSoldProductsKPIData()` with sample data
  - [ ] Returns empty array when no task requests
  - [ ] Returns correct number of records for test data
  - [ ] Fields are correctly mapped
- [ ] Test SQL query directly:
  ```sql
  SELECT * FROM "KPIEmissionLifetimeSoldProductCategory11" LIMIT 1;
  ```

### Integration Tests

- [ ] Test in staging environment:
  - [ ] Upload sample Category 11 Excel (3 sheets)
  - [ ] Emission calculation completes without errors
  - [ ] Check logs for `saveEmissionDashboard()` execution
  - [ ] Verify KPI records inserted to database

### Data Validation

- [ ] Verify emission totals:

  ```sql
  SELECT
    product_code,
    kpi_em_Scope3_Category11_Fuel +
    kpi_em_Scope3_Category11_Electricity +
    kpi_em_Scope3_Category11_Refrigerant AS calculated_total,
    kpi_em_Scope3_Category11_Total AS stored_total,
    CASE WHEN (
      kpi_em_Scope3_Category11_Fuel +
      kpi_em_Scope3_Category11_Electricity +
      kpi_em_Scope3_Category11_Refrigerant
    ) = kpi_em_Scope3_Category11_Total THEN 'OK' ELSE 'MISMATCH' END AS validation
  FROM "KPIEmissionLifetimeSoldProductCategory11";
  ```

- [ ] Verify unique constraint:

  ```sql
  SELECT
    organization_id, address_id, product_code, year, month,
    COUNT(*) as count
  FROM "KPIEmissionLifetimeSoldProductCategory11"
  WHERE NOT is_deleted
  GROUP BY organization_id, address_id, product_code, year, month
  HAVING COUNT(*) > 1;
  -- Should return 0 rows
  ```

- [ ] Verify soft deletes work:
  - [ ] Recalculate same data
  - [ ] Old records marked with `is_deleted = true`
  - [ ] New records created (not duplicates)

### Performance Tests

- [ ] Upload with large dataset:
  - [ ] 10,000+ rows across 3 sheets
  - [ ] 100+ products
  - [ ] Multiple months/years
  - [ ] Verify completion time acceptable (< 5 minutes)
- [ ] Check database query performance:
  - [ ] Verify indexes are used (EXPLAIN plan)
  - [ ] No slow queries in logs

## Phase 6: Deployment

### Pre-Deployment Backup

- [ ] Database backup created
  ```bash
  pg_dump -U postgres -h <host> <database> > backup_before_c11_kpi.sql
  ```

### Code Deployment

- [ ] Merge PR to main branch
- [ ] Deploy `emission-calculation.service.ts` changes:
  - [ ] Updated `saveEmissionDashboard()` function
  - [ ] Import statement for KPI service
  - [ ] KPI array processing logic
- [ ] Deploy supporting files:
  - [ ] `emission-use-of-sold-products-kpi.service.ts`
  - [ ] `dashboardqueries.ts` with new SQL query

### Post-Deployment Verification

- [ ] Application deployed and running
- [ ] No TypeScript compilation errors
- [ ] No GraphQL errors in console
- [ ] Test upload on production:
  - [ ] Upload small Category 11 Excel (10-20 rows)
  - [ ] Monitor emission calculation logs
  - [ ] Query KPI table to verify records created

## Phase 7: Production Monitoring (First Week)

### Daily Checks

- [ ] Monitor application logs for errors
- [ ] Check `buildUseOfSoldProductsKPIData()` execution logs
- [ ] Verify KPI records being created for all uploads
- [ ] Monitor database performance (no slow queries)

### Weekly Validation

- [ ] Spot check 5 random calculations:
  - [ ] Total = Fuel + Electricity + Refrigerant
  - [ ] All three components > 0 (or explanation if one is 0)
  - [ ] Values are within expected ranges
- [ ] Check for any recalculation issues
- [ ] Review user feedback / issues

## Phase 8: Documentation

### Update Documentation

- [ ] Update API documentation with new KPI table
- [ ] Update dashboard documentation with Category 11 KPI table
- [ ] Add KPI table to data dictionary
- [ ] Create user guide for viewing KPI data

### Training

- [ ] Brief analytics/reporting team on new KPI table
- [ ] Show how to query the table
- [ ] Explain what the three components mean
- [ ] Discuss limitations and data quality considerations

## Rollback Plan (If Needed)

### If Critical Issues Found

- [ ] Stop accepting Category 11 uploads
- [ ] Revert deployment:
  ```bash
  git revert <commit-hash>
  ```
- [ ] Redeploy previous version
- [ ] Restore database from backup if needed:
  ```bash
  psql -U postgres -h <host> <database> < backup_before_c11_kpi.sql
  ```

### Issues That Require Rollback

- [ ] KPI calculations consistently wrong (e.g., totals don't match)
- [ ] Significant performance degradation
- [ ] Data corruption or loss
- [ ] Critical bugs in emission logic

---

## Sign-Off

- [ ] Database Team: ****\*\*****\_****\*\***** Date: **\_\_\_**
- [ ] DevOps/Deployment: **\*\*\*\***\_**\*\*\*\*** Date: **\_\_\_**
- [ ] QA: ******\*\*******\_******\*\******* Date: **\_\_\_**
- [ ] Product Manager: **\*\*\*\***\_\_\_**\*\*\*\*** Date: **\_\_\_**

## Notes

```
[Space for deployment notes, issues encountered, resolutions, etc.]
```

---

**Created:** April 17, 2026
**Last Updated:** April 17, 2026
**Status:** Ready for Deployment
