# PCF Supplier Facility - Implementation Reference

## Status: ✅ IMPLEMENTED

The supplier facility PCF logic is fully implemented as a single optimised SQL CTE query in:
- **Query:** `lib/pcf-emission/pcf-emission.queries.ts` → `SQL_QUERY_Kpi_PCF_Supplier_Facility`
- **Service:** `lib/pcf-emission/pcf-emission.service.ts`

---

## Data Ownership

- **PCF data is always the buyer's data.** All calculated PCF records are stored under the buyer's `organization_id`.
- **Supplier facility emissions are fetched from the supplier's GHG data** (Grid Power, Captive Power, Fuel Purchased, Waste Generation), but the resulting KPI records belong to and are stored on the buyer's end.

---

## Overview

The supplier facility calculation fetches KPI emission data from the **supplier's** GHG tables (not the buyer's), scoped to the correct supplier addresses and time periods defined in `SupplierMaterialMapping`, and validated through `BuyerSupplierAddressMappings`.

**Input:** Buyer's `organization_id` + `task_request_ids[]`

**Output per row:**
| Column | Description |
|--------|-------------|
| `organization_id` | Buyer's org ID |
| `address_id` | Buyer's `OrganizationAddress.id` (PCF data is buyer's data) |
| `region_id` | Buyer's region (resolved from buyer's address) |
| `year` / `month` | Buyer's task request period |
| `supplier_address_mapping_id` | `SupplierAddressMapping.id` |
| `org_material_master_id` | `OrgMaterialMaster.id` |
| `supplier_code` | Resolved from `Addresses.code` (for reference) |
| `buyer_material_code` | Resolved from `OrgMaterialMaster.code` (for reference) |
| `allocation_percentage` | From `GHGProductShareAttribution` |
| `kpi_allocated_em_Grid_Power` | tCO2e × 1000 → kgCO2e |
| `kpi_allocated_em_Captive_Power` | tCO2e × 1000 → kgCO2e |
| `kpi_allocated_em_Fuel_Purchased` | tCO2e × 1000 → kgCO2e |
| `kpi_allocated_em_Waste_Generation` | tCO2e × 1000 → kgCO2e |

---

## SQL Query Flow — `SQL_QUERY_Kpi_PCF_Supplier_Facility`

### Data Flow Graph

```
INPUT: organization_id (buyer) + task_request_ids[]
         │
         ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 1: buyer_periods CTE                               │
│  TaskRequest ──► OrganizationAddress                    │
│  Filter: task_request_ids + buyer org_id                │
│  Output: year, month (text), month_num (1-12 numeric)   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 2: valid_mappings CTE                              │
│                                                         │
│  SupplierMaterialMapping (smm)                          │
│    ├── WHERE organization_id = buyer_org_id             │
│    ├── WHERE is_deleted = false                         │
│    └── DATE RANGE FILTER:                               │
│         buyer period must fall within                   │
│         From_Year/From_Month → To_Year/To_Month         │
│         (using month_num CASE conversion)               │
│                                                         │
│  INNER JOIN SupplierAddressMapping sam                  │
│    ON sam.id = smm.supplier_address_mapping_id          │
│                                                         │
│  INNER JOIN OrganizationAddress supplier_oa             │
│    ON supplier_oa.id = sam.supplier_organization_address_id
│                                                         │
│  Resolves:                                              │
│    supplier_oa_id   = sam.supplier_organization_address_id
│    supplier_org_id  = supplier_oa.organization_id       │
│                                                         │
│  Output: supplier_address_mapping_id,                   │
│          org_material_master_id, supplier_oa_id,        │
│          supplier_org_id, year, month, month_num        │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 3: validated_suppliers CTE                         │
│                                                         │
│  INNER JOIN BuyerSupplierAddressMappings bsam           │
│    ON bsam.buyerOrgid  = buyer_org_id                   │
│    AND bsam.supplierOrgid = vm.supplier_org_id          │
│                                                         │
│  → Only supplier orgs officially mapped to buyer pass   │
│                                                         │
│  Output: supplier_address_mapping_id, supplier_oa_id   │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 4: supplier_locations CTE                          │
│                                                         │
│  INNER JOIN OrganizationAddress ON id = supplier_oa_id  │
│  INNER JOIN Addresses ON id = oa.address_id             │
│  INNER JOIN Country   ON id = a.country_id             │
│  LEFT  JOIN Region    ON code = c.region_code           │
│                                                         │
│  Output: supplier_address_mapping_id, supplier_oa_id,  │
│          region_id                                       │
└────────────────────────┬────────────────────────────────┘
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ STEP 5a      │ │ STEP 5b      │ │ STEP 5c      │
│ agg_power    │ │ agg_fuel     │ │ agg_waste    │
│              │ │              │ │              │
│ KPIEmission  │ │ KPIEmission  │ │ KPIEmission  │
│ ByPower      │ │ ByFuel       │ │ ByWaste      │
│ Consumption  │ │ Consumption  │ │ Generation   │
│              │ │              │ │              │
│ JOIN supplier│ │ JOIN supplier│ │ JOIN supplier│
│ _locations   │ │ _locations   │ │ _locations   │
│ GROUP BY     │ │ GROUP BY     │ │ GROUP BY     │
│ address/yr/mo│ │ address/yr/mo│ │ address/yr/mo│
│ ×1000 kgCO2e │ │ ×1000 kgCO2e │ │ ×1000 kgCO2e │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       └─────────────────┼────────────────┘
                         ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 5d: supplier_emissions CTE                         │
│                                                         │
│  supplier_locations sl                                  │
│  INNER JOIN valid_mappings vm                           │
│    ON vm.supplier_address_mapping_id                    │
│     = sl.supplier_address_mapping_id                    │
│                                                         │
│  LEFT JOIN agg_power  ap                                │
│    ON ap.address_id = sl.supplier_oa_id                 │
│    AND ap.year  = vm.year                               │
│    AND ap.month = vm.month_num  ← numeric match        │
│  LEFT JOIN agg_fuel   af  (same)                        │
│  LEFT JOIN agg_waste  aw  (same)                        │
│                                                         │
│  WHERE at least one KPI source IS NOT NULL              │
│                                                         │
│  Output: supplier_oa_id, region_id,                    │
│          org_material_master_id, year, month,           │
│          em_grid_power, em_captive_power,               │
│          em_fuel_purchased, em_waste_generation          │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ STEP 6: allocation_data CTE                             │
│                                                         │
│  GHGProductShareAttribution psa                        │
│  INNER JOIN TaskRequest tr ON tr.id = psa.task_request_id
│  INNER JOIN supplier_locations sl                       │
│    ON sl.supplier_oa_id = psa.organization_address_id  │
│  CROSS JOIN Organization o_buyer                        │
│    WHERE o_buyer.id = buyer_org_id                     │
│    AND LOWER(psa.Buyer_Name) = LOWER(o_buyer.name)     │
│    AND psa.is_deleted = false                          │
│                                                         │
│  GROUP BY: org_address_id, Material_Code, year, month  │
│  Output: organization_address_id, Material_Code,       │
│          allocation_percentage, year, month             │
└────────────────────────┬────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────┐
│ FINAL SELECT                                            │
│                                                         │
│  supplier_emissions se                                  │
│  INNER JOIN OrganizationAddress oa_supplier             │
│    ON oa_supplier.id = se.supplier_oa_id               │
│  INNER JOIN Addresses a_supplier                        │
│    ON a_supplier.id = oa_supplier.address_id           │
│    └─► supplier_code = LOWER(TRIM(a_supplier.code))    │
│  INNER JOIN OrgMaterialMaster omm                       │
│    ON omm.id = se.org_material_master_id               │
│    └─► buyer_material_code = LOWER(TRIM(omm.code))     │
│  LEFT JOIN allocation_data ad                           │
│    ON ad.organization_address_id = se.supplier_oa_id   │
│    AND ad.Material_Code = omm.code                     │
│    AND ad.year = se.year AND ad.month = se.month       │
│                                                         │
│  ORDER BY year, month, supplier_code, buyer_material_code
└─────────────────────────────────────────────────────────┘
         │
         ▼
OUTPUT: rows per supplier-address + material + month
  with buyer's org_id, supplier's address, KPI emissions, allocation %
```

---

## Key Relation Chain

```
SupplierMaterialMapping
├── organization_id                       → Organization.id  (BUYER)
├── supplier_address_mapping_id           → SupplierAddressMapping.id
│   ├── org_supplier_master_id            → OrgSupplierMaster.id
│   ├── address_id                        → Addresses.id
│   └── supplier_organization_address_id  → OrganizationAddress.id  (SUPPLIER facility)
│       └── organization_id              → Organization.id  (SUPPLIER)
└── org_material_master_id               → OrgMaterialMaster.id
    └── code                             → material code string

BuyerSupplierAddressMappings
├── buyerOrgid        → Organization.id (BUYER)
├── supplierOrgid     → Organization.id (SUPPLIER)  ← used in STEP 3 validation
└── supplierOrgAddresId → OrganizationAddress.id (SUPPLIER)

KPI Tables  (address_id = OrganizationAddress.id,  month = numeric 1-12)
├── KPIEmissionByPowerConsumption
├── KPIEmissionByFuelConsumption
└── KPIEmissionByWasteGeneration
```

---

## Design Decisions

### Why ID-based instead of code-based?
The old design used `Supplier_Code` and `Material_Code` string columns on `SupplierMaterialMapping`. The new schema uses FK relations:
- `supplier_address_mapping_id` → eliminates `Supplier_Code` string matching
- `org_material_master_id` → eliminates `Material_Code` string matching
- `supplier_code` and `buyer_material_code` only appear in the FINAL SELECT, resolved from master tables for human-readable reference

### Why `supplier_organization_address_id` in STEP 2?
`SupplierAddressMapping.supplier_organization_address_id` is directly the supplier's `OrganizationAddress.id` — exactly what KPI tables use as `address_id`. This avoids re-resolving through `Addresses.code` string matching.

### Why validate via `BuyerSupplierAddressMappings.supplierOrgid`?
`supplierOrgid` = supplier's `Organization.id`, resolved from `OrganizationAddress.organization_id` in STEP 2. This validates the official buyer-supplier org relationship before any KPI data is fetched.

### Why pre-aggregate KPI tables (STEP 5a-c)?
Prevents cartesian product explosion when multiple KPI rows exist for the same `address_id/year/month`. Pre-aggregating guarantees exactly 1 row per address/period before the STEP 5d join.

### Why `month_num` (numeric) for KPI joins?
`TaskRequest.month` is text (e.g., `"January"`). KPI tables store `month` as numeric (1-12). The CASE expression in STEP 1 converts text → numeric and is carried through all CTEs.

### Why `supplier_code` and `buyer_material_code` only in FINAL SELECT?
These are resolved for the service layer aggregation key and human-readable debugging only. All actual data joins use IDs.

---

## Service Layer Interface

```typescript
// pcf-emission.service.ts

interface KPIPCFSupplierFacilityRecord {
  organization_id: string;             // buyer's org
  address_id: string;                  // supplier's OrganizationAddress.id
  region_id: string | null;
  year: number;
  month: string;                       // text month name from buyer_periods
  supplier_address_mapping_id: string;
  org_material_master_id: string;
  supplier_code: string;               // from Addresses.code (reference)
  buyer_material_code: string | null;  // from OrgMaterialMaster.code (reference)
  allocation_percentage: number | null;
  kpi_allocated_em_Grid_Power: number;
  kpi_allocated_em_Captive_Power: number;
  kpi_allocated_em_Fuel_Purchased: number;
  kpi_allocated_em_Waste_Generation: number;
}
```

---

## Known Limitations

| Issue | Notes |
|-------|-------|
| `GHGProductShareAttribution` matched by `Buyer_Name` string | Fragile if org name changes. Pre-existing pattern from table structure. |
| `supplier_organization_address_id` is nullable | Suppliers not onboarded (no org address) are silently excluded — correct behaviour, no KPI data possible |
| `allocation_data` `Material_Code` matched by string to `OrgMaterialMaster.code` | Pre-existing pattern from `GHGProductShareAttribution` table structure |

---

## Optimization: Selective Recalculation (Buyer Side)

### Problem

When a buyer uploads material procurement or upstream transport data, the system receives `task_request_ids[]` from the inserted records. A task request represents an entire month at a location. If a buyer updates 1 material out of 100 for that month, the current logic recalculates **all 100 materials** for those periods — wasteful.

### Scope

This optimization applies **only to buyer-side triggers**:
- Material Procurement upload → `calculatePCFEmission()` in `material-procurement/excel/route.ts`
- Upstream Transport upload → `calculatePCFEmission()` in `transport-upstream/excel/route.ts`

It does **NOT** apply to supplier-side triggers (`calculatePCFEmissionFromSupplierData`) because when a supplier updates their facility emissions (grid/fuel/waste), ALL buyer materials for that supplier+period are affected.

### Solution

Pass an optional `changedMaterialKeys` parameter — an array of `{ supplier_code, buyer_material_code }` — from the upload route to `calculatePCFEmission()`, which flows down to the SQL queries and delete conditions.

### Data Flow

```
Upload Route (buyer)
│
│ Extract from insert response:
│   uniqueTaskRequestIds = [...task_request_ids]
│   changedMaterialKeys  = [{ supplier_code, buyer_material_code }, ...]
│
▼
calculatePCFEmission(org_id, taskRequestIds, user_id, changedMaterialKeys?)
│
├── processMaterialProcurementPCF(... changedMaterialKeys?)
│     SQL filter: AND (Supplier_Code, Material_Code) IN changedMaterialKeys
│     Delete:     year + month + address_id + supplier_code + buyer_material_code
│
├── processUpstreamPCF(... changedMaterialKeys?)
│     SQL filter: AND (Supplier_code, Material_ID) IN changedMaterialKeys
│     Delete:     year + month + address_id + supplier_code + buyer_material_code
│
└── processSupplierFacilityPCF(... changedMaterialKeys?)
      SQL_QUERY_Kpi_PCF_Supplier_Facility: no SQL change needed
        (driven by SupplierMaterialMapping, not buyer data)
      SQL_QUERY_Buyer_Material_Procurement_Quantities:
        AND (Supplier_Code, Material_Code) IN changedMaterialKeys
      Delete: year + month + address_id + supplier_code + buyer_material_code
```

### Interface

```typescript
interface ChangedMaterialKey {
  supplier_code: string;
  buyer_material_code: string;
}

// Updated signature
export async function calculatePCFEmission(
  organization_id: string,
  taskRequestIds: string[],
  user_id?: string,
  changedMaterialKeys?: ChangedMaterialKey[]  // NEW — optional
): Promise<CalculatePCFEmissionResult | undefined>
```

### SQL Query Changes

When `changedMaterialKeys` is provided, append an additional WHERE clause to scope the queries:

**Material Procurement query** — filter on `GHGMaterialProcurement`:
```sql
-- When changedMaterialKeys is provided:
AND (LOWER(TRIM(gp."Supplier_Code")), LOWER(TRIM(gp."Material_Code"))) 
  IN (('supplier1','material1'), ('supplier2','material2'), ...)
```

**Upstream query** — filter on `GHGTransport_Upstream`:
```sql
-- When changedMaterialKeys is provided:
AND (LOWER(TRIM(gu."Supplier_code")), LOWER(TRIM(gu."Material_ID"))) 
  IN (('supplier1','material1'), ('supplier2','material2'), ...)
```

**Buyer Material Procurement Quantities** — filter on `GHGMaterialProcurement`:
```sql
-- When changedMaterialKeys is provided:
AND (LOWER(TRIM(gmp."Supplier_Code")), LOWER(TRIM(gmp."Material_Code"))) 
  IN (('supplier1','material1'), ('supplier2','material2'), ...)
```

**Supplier Facility query** — NO change needed. It's driven by `SupplierMaterialMapping` (all valid mappings for the period). But the delete condition and buyer quantity lookup are scoped.

### Delete Condition Changes

**Current** (deletes ALL records for year+month+address):
```typescript
allMaterialProcurementWhere.push({
  _and: {
    year: { _eq: year },
    month: { _eq: monthNumber },
    address_id: { _eq: address_id },
  },
});
```

**With changedMaterialKeys** (deletes only changed supplier+material combos):
```typescript
allMaterialProcurementWhere.push({
  _and: {
    year: { _eq: year },
    month: { _eq: monthNumber },
    address_id: { _eq: address_id },
    supplier_code: { _eq: supplier_code },
    buyer_material_code: { _eq: buyer_material_code },
  },
});
```

### Behaviour Summary

| Caller | `changedMaterialKeys` | Query Scope | Delete Scope |
|--------|----------------------|-------------|--------------|
| Material Procurement route (buyer) | `[{supplier_code, buyer_material_code}, ...]` | Only changed materials | Only changed materials |
| Upstream Transport route (buyer) | `[{supplier_code, buyer_material_code}, ...]` | Only changed materials | Only changed materials |
| Supplier emission route (supplier trigger) | `undefined` (not passed) | All materials for period | All materials for period |

### Route Changes

**`material-procurement/excel/route.ts`:**
```typescript
const changedMaterialKeys = saveResponse?.insert_GHGMaterialProcurement?.returning
  .map((item: any) => ({
    supplier_code: String(item.Supplier_Code || "").toLowerCase().trim(),
    buyer_material_code: String(item.Material_Code || "").toLowerCase().trim(),
  }))
  .filter((item, index, self) =>
    index === self.findIndex(
      (t) => t.supplier_code === item.supplier_code 
          && t.buyer_material_code === item.buyer_material_code
    )
  );

await calculatePCFEmission(
  userSession?.organizationId,
  uniqueTaskRequestId,
  userSession?.userId,
  changedMaterialKeys  // NEW
);
```

**`transport-upstream/excel/route.ts`:**
```typescript
const changedMaterialKeys = saveResponse?.insert_GHGTransport_Upstream?.returning
  .map((item: any) => ({
    supplier_code: String(item.Supplier_code || "").toLowerCase().trim(),
    buyer_material_code: String(item.Material_ID || "").toLowerCase().trim(),
  }))
  .filter((item, index, self) =>
    index === self.findIndex(
      (t) => t.supplier_code === item.supplier_code 
          && t.buyer_material_code === item.buyer_material_code
    )
  );

await calculatePCFEmission(
  userSession?.organizationId,
  uniqueTaskRequestId,
  userSession?.userId,
  changedMaterialKeys  // NEW
);
```


---

## Data Flow Architecture

### Step 1: Identify Buyer's Suppliers
**Input:** Buyer's `organization_id`, `task_request_ids[]`

**Process:**
1. Get buyer's task request data (year, month ranges)
2. Query `OrgSupplierMaster` where `organization_id = buyer_organization_id`
3. Get all supplier codes and names from the result

**Tables Involved:**
- `OrgSupplierMaster` (buyer's supplier list)
  - Fields: `code`, `name`, `organization_id`

---

### Step 2: Get Supplier-Material Mappings with Time Ranges
**Input:** Buyer's `organization_id`, supplier codes from Step 1, task request year/month ranges

**Process:**
1. Query `SupplierMaterialMapping` where:
   - `buyer_organization_id = buyer's organization_id`
   - `Supplier_Code IN (supplier codes from Step 1)`
   - Task request year/month falls within `From_Year/From_Month` to `To_Year/To_Month` range
2. Get mappings: supplier_code → material_code → time_range → supplier_organization_id

**Tables Involved:**
- `SupplierMaterialMapping`
  - Fields: `buyer_organization_id`, `supplier_organization_id`, `Supplier_Code`, `Material_Code`, `From_Year`, `From_Month`, `To_Year`, `To_Month`

**Important:**
- Only fetch data for supplier-material combinations that exist in this mapping table
- Only fetch for months that fall within the mapped time ranges

---

### Step 3: Find Supplier Organizations from Supplier Names
**Input:** Supplier names from Step 1

**Process:**
1. Use supplier `name` from `OrgSupplierMaster` (buyer's table)
2. Query `Organization` table where `name = supplier_name`
3. Get `organization_id` of each supplier organization
4. Match with `supplier_organization_id` from `SupplierMaterialMapping` to validate

**Tables Involved:**
- `Organization`
  - Fields: `id`, `name`

**Matching Logic:**
```
OrgSupplierMaster.name (from buyer's table) 
  → Organization.name 
  → Organization.id (this is the supplier's organization_id)
  → Must match SupplierMaterialMapping.supplier_organization_id
```
**Input:** Buyer's `organization_id`, Supplier organization IDs from Step 3

**Process:**
1. Query `BuyerSupplierMappings` where:
   - `buyerOrgid = buyer_organization_id`
   - `supplierOrgid IN (supplier organization IDs from Step 3)`
2. **FILTER:** Keep only supplier organizations that exist in this mapping table
3. This ensures we only fetch data from officially mapped buyer-supplier relationships

**Tables Involved:**
- `BuyerSupplierMappings`
  - Fields: `buyerOrgid`, `supplierOrgid`, `id`

**Table Structure:**
```typescript
export type BuyerSupplierMappings = {
  id: Scalars['uuid']['output'];
  buyerOrgid?: Maybe<Scalars['uuid']['output']>;
  supplierOrgid?: Maybe<Scalars['uuid']['output']>;
  Organization?: Maybe<Organization>;  // Buyer organization
  organizationBySupplierorgid?: Maybe<Organization>;  // Supplier organization
}
```

**Validation Logic:**
```
Step 3 supplier_organization_ids 
  → FILTER BY → 
BuyerSupplierMappings.supplierOrgid (WHERE buyerOrgid = buyer_org_id)
  → KEEP ONLY MATCHED →
Valid supplier_organization_ids for data fetching
```

**Why This Is Critical:**
- Prevents fetching data from suppliers not officially linked to the buyer
- Enforces business relationship validation
- Ensures data security and access control

---

### Step 4: Get Supplier Address from Address Code
**Input:** Supplier codes from Step 1

**Process:**
1. Query `Addresses` table where `code = supplier_code`
2. Get `id` (address_id) of the supplier facility
3. Ensure `organization_id` of this address matches supplier organization from Step 3

**Tables Involved:**
- `Addresses`
  - Fields: `id`, `code`, `organization_id`

**Validation:**
- `Addresses.code` should match `OrgSupplierMaster.code`
- `Addresses.organization_id` should match supplier's `Organization.id` from Step 3

---

### Step 5: Fetch Supplier's Emission Data (4 Sources)
**Input:** 
- Supplier organization IDs from Step 3
- Supplier address IDs from Step 4
- Task request IDs from buyer (to match year/month)
- Material codes from Step 2

**Process:**
Fetch data from **supplier's** GHG tables (NOT buyer's):

1. **Grid Power:** `GHGEnergyConsumption_GridPower`
   - Where: `organization_id IN (supplier org IDs)` AND `address_id IN (supplier address IDs)` AND `task_request_id IN (...)` or match year/month
   
2. **Captive Power:** `GHGEnergyConsumption_CaptivePower`
   - Same filters as Grid Power
   
3. **Fuel Purchased:** `GHGFuelPurchased`
   - Same filters as Grid Power
   
4. **Waste Generation:** `GHGWaste`
   - Same filters as Grid Power

**Important:**
- Filter by `task_request_id` from **supplier's** task requests (NOT buyer's task request IDs)
- Need to find supplier's task requests that match the same year/month as buyer's requests
- Sum emissions from all 4 sources per supplier-material-month combination

**Tables Involved:**
- `GHGEnergyConsumption_GridPower` (supplier's data)
- `GHGEnergyConsumption_CaptivePower` (supplier's data)
- `GHGFuelPurchased` (supplier's data)
- `GHGWaste` (supplier's data)

---

### Step 6: Get Allocation Percentage from Supplier
**Input:** 
- Supplier organization IDs from Step 3
- Supplier address IDs from Step 4
- Material codes from Step 2
- Buyer organization name

**Process:**
1. Query `GHGProductShareAttribution` where:
   - Supplier's `organization_address_id IN (supplier address IDs from Step 4)`
   - `Material_Code IN (material codes from Step 2)`
   - Match year/month with buyer's task request
2. Get `SKU_Production_Percentage` (this is the allocation_percentage)
3. **CRITICAL:** Validate that the buyer name matches
   - Get buyer's organization name from `Organization.name` where `id = buyer_organization_id`
   - Compare with some buyer reference in `GHGProductShareAttribution` (need to check if table has buyer reference field)

**Tables Involved:**
- `GHGProductShareAttribution` (supplier's data)
  - Fields: `organization_address_id`, `Material_Code`, `SKU_Production_Percentage`, task_request info, buyer reference (?)

**Question to Resolve:**
- ❓ Does `GHGProductShareAttribution` have a field to identify which buyer the allocation is for?
- ❓ Need to check table structure for buyer identification

---

### Step 7: Calculate KPI Values
**Input:** All data from Steps 1-6

**Process:**
For each supplier-material-month combination:

1. **Get individual emission components:**
   - `kpi_allocated_em_Grid_Power = (allocation_percentage / 100) × Grid_Power_emission`
   - `kpi_allocated_em_Captive_Power = (allocation_percentage / 100) × Captive_Power_emission`
   - `kpi_allocated_em_Fuel_Purchased = (allocation_percentage / 100) × Fuel_Purchased_emission`
   - `kpi_allocated_em_Waste_Generation = (allocation_percentage / 100) × Waste_emission`

2. **Calculate total:**
   ```
   total_facility_emission = Grid_Power + Captive_Power + Fuel + Waste
   
   kpi_em_pcf_per_unit = 
     (allocation_percentage / 100) × (total_facility_emission × 1000) / buyer_material_procurement_quantity
   ```

3. **Note:** Keep `kpi_em_pcf_per_unit = 0` for now (as requested)
   - Focus on data fetching first
   - Implement calculation logic later

---

### Step 8: Prepare Final Dataset
**Input:** Calculated KPIs from Step 7

**Output Structure:**
```typescript
{
  organization_id: buyer_organization_id,  // Buyer's org ID
  address_id: supplier_address_id,         // Supplier's facility address
  region_id: supplier_region_id,           // From supplier's address
  year: year,
  month: month_number,
  supplier_code: supplier_code,            // From OrgSupplierMaster
  buyer_material_code: material_code,      // From SupplierMaterialMapping
  buyer_material_procurement_quantity: quantity,  // From buyer's GHGMaterialProcurement (?)
  buyer_material_procurement_uom: uom,
  allocation_percentage: SKU_Production_Percentage,  // From GHGProductShareAttribution
  kpi_allocated_em_Grid_Power: calculated_value,
  kpi_allocated_em_Captive_Power: calculated_value,
  kpi_allocated_em_Fuel_Purchased: calculated_value,
  kpi_allocated_em_Waste_Generation: calculated_value,
  kpi_em_pcf_per_unit: 0,  // Keep 0 for now
  created_by: user_id,
  updated_by: user_id
}
```

---

## Implementation Checklist

### Phase 1: Understanding & Planning ✅
- [x] Document business logic flow
- [x] Identify all tables involved
- [x] Map relationships between tables
- [x] Identify open questions

### Phase 2: Database Schema Review
- [ ] Check `GHGProductShareAttribution` table structure
  - [ ] Confirm buyer identification field exists
  - [ ] Understand how to match buyer name
- [ ] Check `ActivityTaskRequest` or `TaskRequest` structure
  - [ ] Understand how to find supplier's task requests matching buyer's year/month
- [ ] Verify `SupplierMaterialMapping` table exists and has correct structure
- [ ] Review `OrgSupplierMaster` relationship with `Organization` and `Addresses`

### Phase 3: SQL Query Development
- [ ] **Query 1:** Get buyer's suppliers
  ```sql
  -- Get supplier codes and names for a buyer organization
  SELECT code, name, organization_id
  FROM OrgSupplierMaster
  WHERE organization_id = ${buyer_organization_id}
    AND is_deleted = false
  ```

- [ ] **Query 2:** Get supplier-material mappings with time validation
  ```sql
  -- Get supplier-material mappings within task request date ranges
  SELECT 
    supplier_organization_id,
    Supplier_Code,
    Material_Code,
    From_Year, From_Month,
    To_Year, To_Month
  FROM SupplierMaterialMapping
  WHERE buyer_organization_id = ${buyer_organization_id}
    AND Supplier_Code IN (${supplier_codes})
    AND is_deleted = false
    -- Add date range validation based on task request year/month
  ```

- [ ] **Query 3:** Find supplier organizations by name
  ```sql
  -- Match supplier names to organization IDs
  SELECT id, name
  FROM Organization
  WHERE name IN (${supplier_names})
    AND is_deleted = false
  ```

- [ ] **Query 3.5:** Validate supplier organizations with BuyerSupplierMappings
  ```sql
  -- Keep only officially mapped buyer-supplier relationships
  SELECT 
    buyerOrgid,
    supplierOrgid
  FROM BuyerSupplierMappings
  WHERE buyerOrgid = ${buyer_organization_id}
    AND supplierOrgid IN (${supplier_organization_ids_from_step_3})
  
  -- Then filter Step 3 results to keep only matched supplier_organization_ids
  ```

- [ ] **Query 4:** Get supplier addresses by code
  ```sql
  -- Get supplier facility addresses
  SELECT id, code, organization_id, region_id
  FROM Addresses
  WHERE code IN (${supplier_codes})
    AND organization_id IN (${supplier_organization_ids})
    AND is_deleted = false
  ```

- [ ] **Query 5:** Get supplier task requests matching buyer's time periods
  ```sql
  -- Find supplier's task requests for the same year/month as buyer
  -- Need to join ActivityTaskRequest or TaskRequest
  -- Filter by supplier organization_id and year/month matches
  ```

- [ ] **Query 6:** Fetch supplier emission data (complex JOIN of 4 tables)
  ```sql
  -- LEFT JOIN all 4 emission sources for suppliers
  -- Similar to current query but:
  --   1. Filter by supplier organization_ids (NOT buyer's)
  --   2. Filter by supplier address_ids
  --   3. Filter by supplier task_request_ids matching buyer's year/month
  --   4. Group by supplier, material, year, month
  ```

- [ ] **Query 7:** Get allocation percentages from GHGProductShareAttribution
  ```sql
  -- Get supplier's allocation percentages for buyer's materials
  SELECT 
    organization_address_id,
    Material_Code,
    SKU_Production_Percentage as allocation_percentage,
    year, month  -- (need to confirm these fields exist)
  FROM GHGProductShareAttribution
  WHERE organization_address_id IN (${supplier_address_ids})
    AND Material_Code IN (${material_codes})
    AND [buyer_validation_condition]  -- Need to determine this
  ```

### Phase 4: GraphQL Queries/Mutations
- [ ] Review if existing queries can be used or need new ones
- [ ] Create query to fetch OrgSupplierMaster with filters
- [ ] Create query to fetch SupplierMaterialMapping with date range logic
- [ ] Create query to fetch Organization by names
- [ ] **Create query to fetch/validate BuyerSupplierMappings**
- [ ] Create query to fetch Addresses by codes
- [ ] Create query to fetch supplier task requests
- [ ] Create query to fetch supplier GHG data (4 tables)
- [ ] Create query to fetch GHGProductShareAttribution with buyer validation

### Phase 5: TypeScript Service Implementation
- [ ] Create new file: `lib/pcf-emission/pcf-supplier-facility.queries.ts`
  - [ ] Implement query to get buyer's suppliers
  - [ ] Implement query to get supplier-material mappings
  - [ ] Implement query to get supplier organizations
  - [ ] Implement query to get supplier addresses
  - [ ] Implement query to get supplier task requests
  - [ ] Implement main query to get supplier emission data

- [ ] Update `lib/pcf-emission/pcf-emission.service.ts`
  - [ ] Remove current incorrect supplier facility query
  - [ ] Add new multi-step logic:
    - [ ] Step 1: Get buyer's suppliers from OrgSupplierMaster
    - [ ] Step 2: Get supplier-material mappings with time validation
    - [ ] Step 3: Find supplier organization IDs by matching names
    - [ ] **Step 3.5: Validate supplier org IDs with BuyerSupplierMappings (CRITICAL)**
    - [ ] Step 4: Get supplier address IDs from Addresses table
    - [ ] Step 5: Find supplier task requests matching buyer's year/month
    - [ ] Step 6: Fetch supplier emission data from 4 tables
    - [ ] Step 7: Get allocation percentages from GHGProductShareAttribution
    - [ ] Step 8: Calculate KPI values (keep total = 0 for now)
  - [ ] Add proper error handling for each step
  - [ ] Add logging for debugging complex multi-step logic

- [ ] Update interfaces in `pcf-emission.service.ts`
  - [ ] Add interface for buyer's suppliers result
  - [ ] Add interface for supplier-material mapping result
  - [ ] Add interface for supplier organization result
  - [ ] **Add interface for buyer-supplier mapping validation result**
  - [ ] Add interface for supplier address result
  - [ ] Add interface for supplier task request result
  - [ ] Add interface for supplier emission data result
  - [ ] Add interface for allocation percentage result

### Phase 6: Testing & Validation
- [ ] Test with sample data:
  - [ ] Verify buyer's suppliers are correctly identified
  - [ ] Verify supplier-material mappings filter correctly by date range
  - [ ] Verify supplier organization matching works
  - [ ] **Verify BuyerSupplierMappings validation filters out unmapped suppliers**
  - [ ] Verify supplier addresses are found correctly
  - [ ] Verify supplier task requests match buyer's periods
  - [ ] Verify emission data comes from supplier organizations (NOT buyer)
  - [ ] Verify allocation percentages match correct buyer
- [ ] Test edge cases:
  - [ ] Supplier with no emission data for some months
  - [ ] Supplier with only some emission sources (not all 4)
  - [ ] Material mapping expires mid-period
  - [ ] Supplier name not found in Organization table
  - [ ] **Supplier organization exists but not in BuyerSupplierMappings (should be filtered out)**
  - [ ] Multiple suppliers with same material code
- [ ] Verify data accuracy:
  - [ ] Compare results with manual calculation
  - [ ] Ensure organization_id in result is buyer's (not supplier's)
  - [ ] Ensure address_id in result is supplier's facility
  - [ ] Ensure allocation percentages are from correct source
  - [ ] **Ensure only officially mapped suppliers have data fetched**

### Phase 7: Calculation Logic (Later)
- [ ] Implement formula for `kpi_allocated_em_Grid_Power`
- [ ] Implement formula for `kpi_allocated_em_Captive_Power`
- [ ] Implement formula for `kpi_allocated_em_Fuel_Purchased`
- [ ] Implement formula for `kpi_allocated_em_Waste_Generation`
- [ ] Implement formula for `kpi_em_pcf_per_unit`
- [ ] Test calculation accuracy

---

## Open Questions & Clarifications Needed

### Question 1: Task Request Mapping ✅ ANSWERED
✅ **CONFIRMED: Use year/month matching instead of direct task_request_id mapping**

**TaskRequest Structure (from GraphQL types):**
```typescript
export type TaskRequest = {
  id: Scalars['uuid']['output'];
  month: Scalars['String']['output'];  // Month name as string (e.g., "January")
  year?: Maybe<Scalars['Int']['output']>;
  organization_address_id: Scalars['uuid']['output'];
  OrganizationAddress: OrganizationAddress;
  // ... other fields
}
```

**Mapping Strategy:**
1. **Buyer Side:** Get buyer's task requests by `task_request_id IN (provided IDs)`
2. **Extract:** year and month from buyer's task requests
3. **Supplier Side:** Query supplier's task requests where:
   - `organization_address_id IN (supplier address IDs from Step 4)`
   - `year` and `month` match buyer's year/month
4. **Use:** supplier's `task_request_id` to query GHG emission tables

**Implementation:**
```sql
-- Get buyer's year/month ranges
SELECT DISTINCT year, month FROM TaskRequest
WHERE id IN (buyer_task_request_ids)

-- Find matching supplier task requests
SELECT id, year, month, organization_address_id
FROM TaskRequest
WHERE organization_address_id IN (supplier_address_ids)
  AND year IN (buyer_years)
  AND month IN (buyer_months)
```

---

### Question 2: Buyer Identification in GHGProductShareAttribution ✅ ANSWERED
✅ **CONFIRMED: `GHGProductShareAttribution` has `Buyer_Name` field**

**Table Structure (from GraphQL types):**
```typescript
export type GhgProductShareAttribution = {
  Buyer_Name?: Maybe<Scalars['String']['output']>;
  Material_Code?: Maybe<Scalars['String']['output']>;
  SKU_Production_Percentage: Scalars['numeric']['output'];
  organization_address_id: Scalars['uuid']['output'];
  activity_task_request_id: Scalars['uuid']['output'];
  task_request_id: Scalars['uuid']['output'];
  // ... other fields
}
```

**Validation Logic:**
1. Get buyer's organization name: `SELECT name FROM Organization WHERE id = buyer_organization_id`
2. Query `GHGProductShareAttribution` where:
   - `Buyer_Name = buyer_organization_name`
   - `Material_Code IN (material codes from SupplierMaterialMapping)`
   - `organization_address_id IN (supplier address IDs)`
   - Match year/month via `task_request_id` or `activity_task_request_id`

---

### Question 3: Buyer Material Procurement Quantity
❓ **Where does `buyer_material_procurement_quantity` come from?**
- From buyer's `GHGMaterialProcurement` table?
- From `SupplierMaterialMapping`?
- From `GHGProductShareAttribution`?

**Current assumption:** From buyer's `GHGMaterialProcurement` based on supplier_code and material_code match

---

### Question 4: Region ID
❓ **Which region_id should be stored?**
- Buyer's region?
- Supplier's facility region?

**Current assumption:** Supplier's facility region (from Addresses table)

---

### Question 5: Multiple Suppliers for Same Material
❓ **What if buyer procures the same material from multiple suppliers?**
- Do we create separate records for each supplier?
- How do we aggregate or differentiate?

**Proposed Solution:**
- Create separate records for each supplier-material combination
- Store supplier_code to differentiate

---

## Key Validation Rules

### Time Range Validation
- Only fetch supplier data if the year/month falls within `SupplierMaterialMapping.From_Year/From_Month` to `To_Year/To_Month`
- Handle cases where mapping expires mid-period

### Organization Matching
```
Buyer's OrgSupplierMaster.name 
  → MUST MATCH → 
Supplier's Organization.name 
  → MUST MATCH → 
SupplierMaterialMapping.supplier_organization_id
  → MUST EXIST IN →
BuyerSupplierMappings (buyerOrgid = buyer, supplierOrgid = supplier)
```

**Critical Validation Chain:**
1. Supplier name from buyer's OrgSupplierMaster
2. Match to Organization table by name → get supplier_organization_id
3. Verify in SupplierMaterialMapping.supplier_organization_id
4. **Validate in BuyerSupplierMappings (buyerOrgid, supplierOrgid)**
5. Only proceed with validated supplier organizations

### Address Matching
```
OrgSupplierMaster.code 
  → MUST MATCH → 
Addresses.code
  AND
Addresses.organization_id 
  → MUST MATCH → 
Supplier's Organization.id
```

### Material Code Matching
```
SupplierMaterialMapping.Material_Code 
  → MUST MATCH → 
GHGProductShareAttribution.Material_Code
  → USED IN → 
Final KPI record as buyer_material_code
```

---

## Data Flow Diagram (Text)

```
BUYER SIDE:
Organization (buyer_org_id)
  ↓
OrgSupplierMaster (supplier codes, names)
  ↓
SupplierMaterialMapping (supplier-material-time mapping)
  ↓
  
SUPPLIER SIDE:
Organization (match by supplier name) → supplier_organization_id
  ↓
BuyerSupplierMappings (VALIDATE buyer-supplier relationship) ← CRITICAL FILTER
  ↓
Addresses (match by supplier code) → supplier_address_id
  ↓
Task Requests (match by year/month) → supplier_task_request_ids
  ↓
GHG Tables (Grid, Captive, Fuel, Waste) → emission data
  ↓
GHGProductShareAttribution → allocation_percentage
  ↓
  
CALCULATION:
Combine all data → Calculate KPIs → Store in KPIProductCarbonFootprintSupplierFacility
(with organization_id = buyer, address_id = supplier facility)
```

---

## Summary

This implementation requires a **multi-step, cross-organization data fetch** that is significantly more complex than Material Procurement and Upstream Transportation. 

**Key Differences:**
1. **Material Procurement & Upstream:** Simple query from buyer's tables
2. **Supplier Facility:** 
   - Start from buyer's supplier list
   - Match to supplier organizations
   - **Validate with BuyerSupplierMappings (ensures official buyer-supplier relationship)**
   - Fetch data from supplier's GHG tables
   - Validate with SupplierMaterialMapping time ranges
   - Get allocation % from supplier's GHGProductShareAttribution
   - Store result with buyer's org_id but supplier's address_id

**Critical Success Factors:**
- Accurate name/code matching between buyer and supplier records
- **BuyerSupplierMappings validation to prevent unauthorized data access**
- Proper time range validation from SupplierMaterialMapping
- Correct organization_id filtering (supplier data, not buyer data)
- Buyer validation in allocation percentage lookup

---

## Next Steps

1. **Immediate:** Resolve open questions by checking database schema
2. **Then:** Start implementing queries in order (1 through 7)
3. **Finally:** Integrate into service with proper error handling and logging
