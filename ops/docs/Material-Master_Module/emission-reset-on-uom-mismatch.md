# Emission Reset on UoM Mismatch

**Version:** 1.0 | **Implemented:** March 13, 2026 | **Status:** Production

---

## Overview

When a Material Master record is updated with a different Unit of Measure (UoM) than what exists in activity data, the system automatically resets emission values to zero for all affected activity records. This ensures data integrity and prevents incorrect emission calculations based on mismatched UoMs.

**Business Rule:** Scenario C - UoM Mismatch (from Material Master Module Requirements)

---

## Business Rationale

### Why Reset Emissions?

**Problem:** Material Master defines a material as "kilogram" but activity data references it as "ton"
- Existing emission calculations were based on original UoM
- Changing UoM invalidates previous emission values
- Continuing to show old emissions would be misleading

**Solution:** Automatic emission reset when UoM changes
- Sets material-specific emission KPIs to 0
- Preserves all other activity data (distances, transport modes, quantities)
- Triggers notification email to OrgAdmin with affected materials
- Emissions will be recalculated after activity data is corrected

---

## Technical Implementation

### Affected Tables & Fields

| Activity Table | Material Reference | Emission Fields Reset |
|----------------|-------------------|----------------------|
| `GHGCapital_Goods` | `Material_Code` | `kpi_em_EmissionBy_CapitalGoods`<br>`kpi_emf_EmissionBy_CapitalGoods` |
| `GHGMaterialProcurement` | `Material_Code` | `kpi_em_EmissionBy_MaterialProcured`<br>`kpi_emf_EmissionBy_MaterialProcured` |
| `GHGTransport_Upstream` | `Material_ID` | `kpi_em_EmissionBy_MaterialProcured`<br>`kpi_emf_EmissionBy_MaterialProcured` |
| `GHGProductShareAttribution` | `Material_Code` | *No emission fields (allocation only)* |

**Note:** Only material-specific emission fields are reset. Transportation emissions, distance emissions, and other non-material KPIs remain unchanged.

---

## Process Flow

```
Material Upload 
  ↓
Validation Detects UoM Mismatch
  ↓
Material Master Updated (Source of Truth)
  ↓
[NEW] Query Affected Activity Records
  ↓
[NEW] Reset Emission KPIs to 0
  ↓
Send Email Notification
  ↓
User Corrects Activity Data
  ↓
[FUTURE] Emission Recalculation Triggered
```

---

## Implementation Components

### 1. GraphQL Mutation
**File:** `graphql/mutations/reset-emissions-for-uom-mismatch.gql`

**Purpose:** Batch update emission fields across multiple activity tables

**Structure:**
```graphql
mutation resetEmissionsForUoMMismatch(
  $capitalGoodsUpdates: [GHGCapital_Goods_updates!]!
  $materialProcurementUpdates: [GHGMaterialProcurement_updates!]!
  $transportUpstreamUpdates: [GHGTransport_Upstream_updates!]!
)
```

**Returns:** Updated records with `id`, `Material_Code`, emission fields, `updated_at`

---

### 2. Service Layer
**File:** `lib/material-master/reset-emissions-on-uom-mismatch.service.ts`

**Main Function:** `resetEmissionsForUoMMismatch(materialCodes, organizationId)`

**Process:**
1. Fetch all organization addresses for multi-tenant scoping
2. Query 3 activity tables for records using specified material codes
3. Build batch update mutations (sets emission KPIs to 0)
4. Execute GraphQL mutations
5. Return summary: total affected, breakdown by activity type

**Error Handling:**
- Non-blocking: Material Master update succeeds even if emission reset fails
- Logs errors for manual intervention
- Returns zero summary on failure

**Performance:**
- Uses existing `checkMaterialUsedInActivities` query
- Batch processing (follows existing 2000-record pattern)
- Scoped by organization_address_ids for efficiency

---

### 3. API Integration
**File:** `app/api/v1/master-data/materials/excel/route.ts`

**Integration Point:** After Material Master update, before email notification

**Code Flow:**
```typescript
if (notifications.uomMismatches.length > 0) {
  // NEW: Reset emissions for mismatched materials
  emissionResetSummary = await resetEmissionsForUoMMismatch(
    materialCodesWithMismatch,
    organizationId
  );
  
  // Existing: Send email notification
  await sendEmailForMaterialUoMMismatch(userSession, uomMismatches);
}
```

**Audit Logging:**
- Adds `emission_reset` field to `DataImportHistory.meta_data.summary`
- Tracks: `total_records_affected`, `capital_goods`, `material_procurement`, `transport_upstream`

---

### 4. Type Definitions
**File:** `lib/material-master/validation.interfaces.ts`

**New Interface:**
```typescript
export interface IEmissionResetSummary {
  totalRecordsAffected: number;
  capitalGoods: number;
  materialProcurement: number;
  transportUpstream: number;
  materialCodes: string[];
}
```

---

## Data Integrity Guarantees

### What Gets Reset
✅ Material-specific emission values (KPIs related to material weight/quantity)
✅ Emission factor values (kpi_emf_*)
✅ Emission magnitude values (kpi_em_*)

### What Stays Unchanged
❌ Material codes, quantities, UoMs
❌ Transportation-related emissions (distance, mode, fuel)
❌ Supplier information
❌ Supporting documents
❌ All other activity metadata

### Multi-Tenancy
- All queries scoped by `organization_address_ids`
- Materials from one organization cannot affect another organization's activities
- UUID-based filtering prevents cross-contamination

---

## Example Scenario

**Initial State:**
- Material Master: MAT001, "Steel Bar", 2.5 kg, UoM: "kilogram"
- Capital Goods: Procured 100 units, UoM: "kilogram", Emission: 250 kgCO2e

**User Action:**
- Update Material Master UoM from "kilogram" to "ton"

**System Response:**
1. ✅ Material Master updated (MAT001 now has UoM: "ton")
2. ✅ Query finds 1 Capital Goods record with MAT001
3. ✅ Update Capital Goods: `kpi_em_EmissionBy_CapitalGoods = 0`, `kpi_emf_EmissionBy_CapitalGoods = 0`
4. ✅ Email sent: "UoM mismatch for MAT001. Previous: kilogram, New: ton. 1 Capital Goods record affected."

**User Correction:**
- Update Capital Goods activity data to reflect "ton" instead of "kilogram"
- System will recalculate emissions based on correct UoM (future enhancement)

---

## Email Notification Enhancement

**Current Notification:**
- Lists affected materials with old vs new UoM
- Shows which activity types are impacted

**Recommended Enhancement:**
- Add emission reset summary to email body
- Include count of affected records per activity type
- Example: "Emissions have been reset to 0 for 5 Capital Goods records, 12 Material Procurement records, and 8 Upstream Transport records. Please update activity data to match the new UoM."

---

## Future Enhancements

### Phase 2: Automatic Recalculation (Planned)
**Goal:** Trigger emission recalculation after activity data corrected

**Approach:**
1. Add `needs_recalculation` metadata flag to affected activity records
2. User updates activity data with correct UoM
3. Background job detects flagged records and triggers emission calculation
4. Emissions recalculated using existing emission-calculation-engine services

**Benefits:**
- Eliminates manual recalculation requests
- Ensures emissions stay synchronized with data corrections
- Audit trail of recalculation operations

### Phase 3: Bulk UoM Correction Tool
**Goal:** Allow users to bulk-correct activity data UoMs in one operation

**Features:**
- UI showing materials with UoM mismatches
- Bulk select affected activity records
- Preview emission impact before applying
- One-click UoM correction + emission recalculation

---

## Troubleshooting

### "Emissions reset failed but Material Master updated successfully"
**Expected Behavior:** Material Master update is source of truth and always succeeds
**Action Required:** Check server logs for emission reset error details. Manually trigger emission calculation for affected materials if needed.

### "Activity records still show old emissions"
**Diagnosis:** Browser cache or query not refreshed
**Resolution:** Hard refresh (Ctrl+Shift+R) or clear cache. If persists, check database directly.

### "UoM mismatch detected but no activity records found"
**Explanation:** Material exists in master data but not yet used in any activities
**Action:** No emission reset needed. Email notification may still be sent for audit purposes.

### "Performance degradation during large uploads"
**Cause:** Resetting emissions for thousands of activity records
**Mitigation:** Current implementation handles batching automatically. Monitor query execution time in logs.

---

## Testing Checklist

**Unit Tests:**
- [ ] Reset emissions for single material across all 3 tables
- [ ] Handle empty material codes array
- [ ] Handle materials with no activity data
- [ ] Verify multi-tenant isolation (org A cannot affect org B)

**Integration Tests:**
- [ ] Material upload with UoM change triggers emission reset
- [ ] Emission reset summary appears in import history
- [ ] Email notification includes correct affected material count
- [ ] Audit log captures emission reset operation

**Performance Tests:**
- [ ] Upload 100 materials with UoM mismatches
- [ ] Upload 1000 materials with UoM mismatches
- [ ] Verify emission reset completes within 60 seconds for 10,000 activity records

---

## Database Migration Notes

**No Schema Changes Required**
- Existing emission fields used (kpi_em_*, kpi_emf_*)
- DataImportHistory.meta_data is JSONB (supports new emission_reset field)
- No new tables or columns needed

**Backward Compatibility**
- Old import history records won't have emission_reset field (null/undefined)
- UI should handle missing field gracefully
- No migration script needed

---

## Monitoring & Alerts

**Key Metrics to Track:**
- Number of UoM mismatches per upload session
- Average emission reset execution time
- Emission reset failure rate
- Materials with persistent UoM mismatches (not corrected after 30 days)

**Recommended Alerts:**
- Emission reset failure rate > 5% (investigate query performance)
- Single upload affects > 10,000 activity records (validate user intent)
- Same material has repeated UoM mismatches (data quality issue)

---

## Code Ownership

**Primary Maintainer:** Material Master Module Team  
**Related Modules:** Emission Calculation Engine, Activity Data Upload  
**Documentation:** [Material Master Module](./material-master-module.md)

---

**Last Updated:** March 13, 2026  
**Reviewed By:** Development Team  
**Approval Status:** Production Ready ✅
