# KPI Emission Lifetime Sold Products - DB Migration

## Overview

This migration creates the `KPIEmissionLifetimeSoldProductCategory11` table to store aggregated lifetime emissions for products sold by the organization. This KPI table combines emissions from three sources (Fuel, Electricity, Refrigerant) calculated during the use phase of sold products.

## Table Purpose

Aggregates emissions data from:
- `GHGUseOfSoldProducts_Fuel` → `kpi_em_Scope3_Category11`
- `GHGUseOfSoldProducts_Electricity` → `kpi_em_Scope3_Category11`
- `GHGUseOfSoldProducts_Refrigerant` → `kpi_em_Scope3_Category11`

And stores:
- Individual component emissions (Fuel, Electricity, Refrigerant)
- Total lifetime emissions per product

## PostgreSQL DDL

### Table: `KPIEmissionLifetimeSoldProductCategory11`

```sql
CREATE TABLE "KPIEmissionLifetimeSoldProductCategory11" (
  id                                   UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id                      UUID NOT NULL REFERENCES "Organization"(id),
  region_id                            UUID REFERENCES "Region"(id),
  address_id                           UUID NOT NULL REFERENCES "OrganizationAddress"(id),
  product_code                         TEXT NOT NULL,
  month                                NUMERIC(2) NOT NULL,
  year                                 NUMERIC(4) NOT NULL,
  em_uom                               TEXT DEFAULT 'tco2e',
  kpi_em_Scope3_Category11_Fuel        DOUBLE PRECISION,
  kpi_em_Scope3_Category11_Electricity DOUBLE PRECISION,
  kpi_em_Scope3_Category11_Refrigerant DOUBLE PRECISION,
  kpi_em_Scope3_Category11_Total       DOUBLE PRECISION,
  metadata                             JSONB,
  is_deleted                           BOOLEAN NOT NULL DEFAULT false,
  created_at                           TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at                           TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by                           UUID,
  updated_by                           UUID
);

-- Indexes for efficient querying
CREATE INDEX idx_kpi_c11_org_id
ON "KPIEmissionLifetimeSoldProductCategory11" (organization_id);

CREATE INDEX idx_kpi_c11_address_id
ON "KPIEmissionLifetimeSoldProductCategory11" (address_id);

CREATE INDEX idx_kpi_c11_product_code
ON "KPIEmissionLifetimeSoldProductCategory11" (product_code);

CREATE INDEX idx_kpi_c11_year_month
ON "KPIEmissionLifetimeSoldProductCategory11" (year, month);

-- Unique constraint: one record per organization/product/address/month/year
CREATE UNIQUE INDEX idx_kpi_c11_unique_product_period
ON "KPIEmissionLifetimeSoldProductCategory11" (organization_id, address_id, product_code, year, month)
WHERE NOT is_deleted;
```

## Hasura Configuration

### Table Tracking

After applying the DDL, track the table in Hasura:

1. **Data Source:** default
2. **Schema:** public
3. **Table:** `KPIEmissionLifetimeSoldProductCategory11`
4. **Customization:** Set custom type name to `KpiEmissionLifetimeSoldProductCategory11`

### Relationships

No relationships required. The table queries emission data that was already calculated and stored in the source tables.

### Permissions

Set `organization_admin` role permissions:
- **Select:** Row-level filter on `organization_id` matching user's organization
- **Insert:** Allow (same filter)
- **Update:** Allow (same filter)
- **Delete:** Not required (soft deletes via `is_deleted` flag)

## Rollout Order

1. Apply the `CREATE TABLE` and `CREATE INDEX` statements.
2. Verify table exists in database: `\dt "KPIEmissionLifetimeSoldProductCategory11"`
3. Track table in Hasura console.
4. Set permissions as described above.
5. Reload Hasura metadata.
6. Run `yarn codegen` to generate TypeScript types.
7. Deploy application code changes.

## Related Files

- Application layer: `lib/emission-calculation-engine/emission-use-of-sold-products-kpi.service.ts` (new)
- GraphQL mutations: `graphql/mutations/upsert-kpi-emission-lifetime-sold-products.gql` (new)
- Integration: Called from `lib/emission-calculation-engine/emisison-calculation.service.ts`

---

**Last Updated:** April 17, 2026
