# Cron Reminder Job — N+1 Query Fix

**File:** `lib/monthly-activity-summary/email/monthly-activity-summary-email.service.ts`  
**Functions affected:** `sendUploadPendingReminders` (US-10 / US-11)  
**Change type:** Performance — no behavioral change

---

## Background

The monthly reminder cron job fires on the 1st and 10th of every month at 9:00 AM IST to email Location Executives who have pending data uploads. It was identified as a contributing cause of a production RDS connection exhaustion incident on 2026-05-19.

---

## What the Existing Implementation Did

`sendUploadPendingReminders` ran in three phases:

### Phase 1 — Parallel batch queries (correct)
```
fetchPendingUsers()         → 1 query (complex JSONB + EXISTS across all orgs)
fetchEmailTemplate()        → 1 query
fetchOrgAdmins() per org    → N queries, parallel Promise.all
fetchEmailFeatureFlags()    → 1 query (all orgs batched)
```

### Phase 2 — Sequential per-user loop (the problem)
For every pending user, the loop ran sequentially:
```
for each user:
  fetchPendingCombosForUser(userId)    ← 1 DB query
  generateAndUploadEmailExcel()        ← S3 upload (500–2000ms)
  sendEmail()                          ← SMTP (300–1500ms)
  saveEmailLog()                       ← 1 DB query
```

This created an **N+1 query pattern**: `fetchPendingCombosForUser` was a separate DB round-trip for every pending user. With 40 users this meant **40 sequential DB queries**, each interleaved with S3 and SMTP I/O that held the execution context for seconds per user.

### Query count formula (before fix)
```
Total DB queries = 3 + O_orgs + (2 × Y_users)

Examples:
  5 orgs, 30 users  →  68 queries  (~2–4 min total)
  5 orgs, 50 users  → 108 queries  (~3–6 min total)
```

---

## What the Issues Were

### Issue 1 — N+1 DB round-trips in a sequential loop
`fetchPendingCombosForUser` executed a JSONB `LATERAL` + `NOT EXISTS` query once per user. Each call opened/used a DB connection and waited for a result before proceeding to the next user.

### Issue 2 — DB connections held during S3 and SMTP I/O
Because the loop was sequential (`for...of` with `await`), the job cycled through DB → S3 → SMTP → DB for every user, one at a time. The job retained connection-pool pressure for the entire duration of the run (minutes), not just the DB-read phase (seconds).

### Issue 3 — Contribution to RDS connection exhaustion (2026-05-19 incident)
On the demo environment the cron fired while regular user traffic was also hitting the database. The sustained connection pressure from the sequential loop, combined with ongoing user requests and small RDS `max_connections`, caused:
- Direct Drizzle connections to time out (`CONNECT_TIMEOUT` on port 5432)
- Hasura (which shares the same RDS) to return 502/504
- Every API request to fail with 401 because `getUserSessionFromDecodedClaims` calls `getAuthUserDetails` via Hasura on **every** request — making the platform appear completely down

---

## What Was Fixed

### The change — one bulk query replaces N per-user queries

**Removed:** `fetchPendingCombosForUser(userId: string)` — called once per user inside the loop.

**Added:** `fetchAllPendingCombosForUsers(userIds: string[])` — called once before the loop. SQL logic is identical to the removed function; the only difference is the WHERE clause changes from `= '${userId}'` to `IN (${idList})` and `uoam.user_id` is added to SELECT so results can be grouped by user.

**Changed inside the loop (one line):**
```typescript
// Before
const pendingCombos = await fetchPendingCombosForUser(user.userId);

// After
const pendingCombos = allPendingCombosMap.get(user.userId) ?? [];
```

The bulk query result is a `Map<userId, PendingCombo[]>` built once before the loop. Each iteration does a simple in-memory lookup.

### Query count formula (after fix)
```
Total DB queries = 3 + O_orgs + 1  (constant, independent of user count)

Examples:
  5 orgs, 30 users  →  9 queries
  5 orgs, 50 users  →  9 queries
```

---

## What Was NOT Changed

Every item in this list is byte-for-byte identical before and after the fix:

| Concern | Status |
|---|---|
| `fetchPendingUsers()` — the main user-selection query | **Unchanged** |
| Scenario C — deactivated LEs excluded | **Unchanged** (handled by `fetchPendingUsers`) |
| Scenario D — deactivated activities excluded | **Unchanged** (both queries keep `act.is_deleted IS NOT TRUE`) |
| Scenario E — mappings created on run date excluded | **Unchanged** (`uoam.created_at::date < CURRENT_DATE` preserved in bulk query) |
| Scenario F — org onboarded last month excluded | **Unchanged** (handled by `fetchPendingUsers`) |
| Scenario G — Org Admins CC'd on 10th reminder | **Unchanged** (lines 971–974, untouched) |
| Feature flag check per org | **Unchanged** |
| `max_recipients` cap per org | **Unchanged** |
| Email TO recipient | **Unchanged** |
| Email subject, body, template variables | **Unchanged** |
| Excel rows per user (Location × Activity content) | **Unchanged** — same data, fetched in bulk |
| `saveEmailLog` per user | **Unchanged** |
| `successCount` tracking | **Unchanged** |
| US-8 (`notifyOrgAdminsOnDataUpload`) | **Not touched** |
| US-9 (`notifyLocationExecutivesOnApproval`) | **Not touched** |

---

## QA Impact Analysis

### What QA should verify
QA behavior is identical. The observable outcomes to verify:

1. **Recipients** — each pending LE still receives exactly one email. No duplicates, no missing recipients.
2. **Excel attachment** — each LE's Excel still lists only their own pending (Location × Activity) combinations for the previous month.
3. **CC on 10th** — on the 10th reminder, Org Admins are CC'd; on the 1st they are not.
4. **Feature flag suppression** — if the flag is off for an org, no email is sent to users in that org.
5. **`max_recipients` cap** — if a cap is set for an org, no more than that many emails are sent per org per run.
6. **Scenario E** — a user whose mapping was created on the run date receives no email.
7. **Scenario F** — users from an org onboarded in the previous month receive no email.

### What QA cannot distinguish
- Number of DB queries (internal, not observable)
- Whether the bulk query or the per-user query was used
- Total job execution time (faster now, but no behavioral difference)

### Risk rating
**Zero behavioral risk.** This is a pure query-batching change. The SQL `WHERE user_id IN (...)` is semantically equivalent to N separate `WHERE user_id = '...'` calls; PostgreSQL returns the same rows.

---

## Related: Auth Architecture Issue (Not Fixed in This PR)

The 2026-05-19 incident also revealed a structural vulnerability in `lib/auth/auth.server.ts:27` — `getUserSessionFromDecodedClaims` makes a live Hasura GraphQL call (`getAuthUserDetails`) on **every** API request. When RDS is degraded, Hasura degrades, and every request returns 401 making the platform appear fully down.

This is a separate issue requiring its own fix (session caching or embedding mappings in the JWT) and is **not addressed** in this change.
