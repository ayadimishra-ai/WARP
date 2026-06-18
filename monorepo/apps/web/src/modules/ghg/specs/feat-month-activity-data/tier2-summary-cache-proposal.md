# Proposal: Precomputed Summary Cache (Tier 2 Performance)
**Feature:** Monthly Activity Summary — `data-log-summary`
**Author:** Vishal Chhadekar
**Status:** Implemented — branch `beta_deploy_ather_delivery`
**Target:** Beta → Live (post-approval)

---

## Context

Tier 1 (immediate fixes) has been deployed to demo:
- DB connection pool: `max: 1` → `max: 10` — removes concurrent request queuing
- 86 indexes added across all GHG/ESG tables — reduces query time from ~15s to 2–5s

Tier 1 is sufficient for the current live launch. This document proposes Tier 2 as the permanent, production-scale solution to be built in a future sprint.

---

## Problem

The summary page query runs a `UNION ALL` across **30+ GHG/ESG tables** on every page load to compute `pending / approved / rejected` counts. Even with indexes, this query re-scans all tables from scratch — including for users who just refreshed the page with no data change. Under concurrent load (10+ users), this degrades response time and risks timeouts.

---

## Proposed Solution

Introduce a precomputed `ActivitySummaryCache` table that stores counts at the `(org × location × activity × year × month)` level. The summary read query becomes a single indexed `GROUP BY` on this small table instead of a 30-table UNION.

**Expected result:** Summary page query time drops from 2–5s → under 50ms, regardless of concurrent users or data volume.

### Table Structure

```sql
CREATE TABLE "ActivitySummaryCache" (
  organization_id         uuid  NOT NULL,
  organization_address_id uuid  NOT NULL,
  activity_code           text  NOT NULL,
  year                    int   NOT NULL,
  month                   text  NOT NULL,  -- lowercase: 'april', 'may', ...
  pending_count           int   NOT NULL DEFAULT 0,
  approved_count          int   NOT NULL DEFAULT 0,
  updated_at              timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (organization_id, organization_address_id, activity_code, year, month)
);
```

> **Note:** `rejected_count` was removed from the final implementation — rejected status is not surfaced anywhere in the UI and is not counted by the existing `queries.ts` GHG_UNION either.

For a typical org with 5 locations, 23 activities, 2 years of data → ~2,760 rows total.

### Write Events (cache maintained on)

| Event | Cache action |
|---|---|
| Data uploaded | Recount from source tables → upsert cache row for that (location, activity, year, month) |
| Data re-uploaded | Same recount — old pending/approved automatically reflected (no delta tracking needed) |
| Admin approves | Recount from source tables → upsert cache row with updated approved_count |

**Recount-not-delta strategy:** After every write event, `upsertCacheForActivity()` re-reads the actual GHG/ESG source tables to produce fresh counts and overwrites the cache row. This eliminates all delta-tracking complexity and is resilient to partial failures — re-running is always safe.

Cache upserts run **fire-and-forget** (`after()` / `.catch()`) after the primary write response is sent. A cache failure never blocks the upload or approve response. If counts drift, re-run the backfill SQL against the affected org.

---

## Implementation Scope

1. **Migration** — Create `ActivitySummaryCache` table + backfill from existing data (one-time, runs current GHG UNION query once and writes results)
2. **Upload routes** — Add cache upsert after successful data write
3. **Approve route** — Add cache update after ATR + GHG row status propagation (already in `queries.ts`)
4. **Summary read** — Replace `queryTaskRequestSummary`'s GHG UNION with a `SELECT` on `ActivitySummaryCache` (org_activities LEFT JOIN and pagination logic unchanged)
5. **Re-upload handling** — Decrement old ATR counts before inserting new (requires resolving leaf activity_code from GHG table, since ATR stores parent code only)

---

## Key Risks

| Risk | Detail | Mitigation |
|---|---|---|
| Re-upload count drift | Soft-deleted ATR counts must be decremented; leaf activity_code must be resolved from GHG table (ATR stores parent code only) | Dedicated unit test + QA scenario |
| ESG status fallback | ESG tables have no status column; effective status = ATR status. Approve must update cache for ESG activities via ATR path | Test all ESG activity approvals explicitly |
| Multi-table activities | `water_consumption`, `human_resources`, `health_and_safety` etc. span 3–4 tables each; each upload must correctly increment the shared cache row | Covered by backfill validation |
| Cache update failure | Cache upsert runs fire-and-forget; a failure leaves counts stale until next write | Error is logged; `queries.ts` GHG_UNION fallback fires if cache query itself throws; re-run backfill to correct any drift |
| Future activity additions | Developer adding a new GHG table must also add cache update logic | Document as a mandatory checklist item in CLAUDE.md |

---

## Testing Plan (Beta First)

1. Deploy to **beta** with backfill migration
2. Validate backfill: run original GHG UNION query and diff against cache — counts must match exactly for all existing data
3. QA scenarios to cover explicitly:
   - Upload → pending count increments correctly
   - Re-upload → old counts decremented, new counts correct (no inflation)
   - Approve GHG activity → pending decrements, approved increments
   - Approve ESG activity (`csr`, `human_resources`, `health_and_safety`, `governance_and_board_composition`, `grievances_activity`) → counts correct
   - Approve with month/location filter applied → only scoped rows update
   - 0-record activities still appear in table with count 0
   - Location-wise tab counts match activity-type tab totals
4. Load test: 10+ concurrent users hitting summary page → verify sub-1s response
5. Only after full QA sign-off on beta → deploy to live

---

## What Does NOT Change

- All existing business rules (RULE-001 through RULE-010) remain enforced in the approve and upload routes
- The `org_activities` CTE (for 0-count activity rows) remains unchanged
- Export functionality (`queryExportData`, `queryMatchingAtrIds`) is unaffected — it reads GHG tables directly and is not part of this change
- Filters API (`queryMonthsWithData`, `queryDistinctDataYears`) is unaffected

---

## Effort Estimate

| Task | Estimate |
|---|---|
| Table creation + backfill migration | 0.5 day |
| Upload route cache updates (all activity types) | 1.5 days |
| Approve route cache update | 0.5 day |
| Summary read query replacement | 0.5 day |
| QA on beta | 1 day |
| **Total** | **~4 days** |

---

## Recommendation

Implement in the **next sprint** after the current live deployment is stable. Do not rush before live — the current Tier 1 fixes are sufficient for the client launch, and Tier 2 carries count-discrepancy risk if any of the 5 write paths are implemented incorrectly.
