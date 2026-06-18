# OPS-to-IQ Curation Feature

## Overview
AI feature that processes operational data from OPS system and maps it to form field answers. Uses **AISubscriptions** (company+form level, per-request opt-in).

**Key Difference**: Available to both AI and non-AI users. Does NOT affect `isUserAI` flag in JWT.

**Enablement Policy**: **OPT-IN ONLY** - Feature is disabled by default and must be explicitly enabled by inserting a record into `AISubscriptions` for the specific company+form pair.

## Architecture

### Subscription-Driven (AISubscriptions) - OPT-IN Model
Feature is **DISABLED by default**. It is enabled when **BOTH conditions** are explicitly met:
1. An active `AISubscriptions` record exists for the company+form with `subscriptionPlan = 'OPSToIQCuration'` and `isActive = true`
2. Form has FormFields with `generatedSQLQuery` (validated via GraphQL)

**Important**:
- Companies **WITHOUT** an `AISubscriptions` record for the form are NOT enabled
- Records with `isActive = false` are NOT enabled
- Even with an active subscription, forms still need SQL queries to be fully enabled
- Enablement is **per company+form** — different companies can have different access to the same form

### Enable/Disable

```sql
-- ENABLE: Insert an AISubscriptions record for the company+form pair
INSERT INTO public."AISubscriptions" ("companyId", "formId", "subscriptionPlan", "isActive", "startDate", notes)
VALUES (
  'your-company-uuid',
  'your-form-uuid',
  'OPSToIQCuration',
  true,
  CURRENT_DATE,
  'Enabled on request'
);

-- DISABLE: Deactivate the subscription record
UPDATE public."AISubscriptions"
SET "isActive" = false, "endDate" = CURRENT_DATE, "updatedAt" = CURRENT_DATE
WHERE "companyId" = 'your-company-uuid'
  AND "formId" = 'your-form-uuid'
  AND "subscriptionPlan" = 'OPSToIQCuration';

-- Requires: Form must have FormFields with generatedSQLQuery
-- JWT generation will automatically pick it up on next login
```

### Verify Configuration
```sql
-- Check which companies have active OPSToIQCuration subscriptions
SELECT s.id, s."companyId", s."formId", s."isActive", s."startDate", s."endDate", f.name AS form_name
FROM public."AISubscriptions" s
JOIN public."Form" f ON f.id = s."formId"
WHERE s."subscriptionPlan" = 'OPSToIQCuration';

-- Check form has SQL queries
SELECT id, "formId", "generatedSQLQuery"
FROM "FormField"
WHERE "formId" = 'your-form-uuid'
  AND "generatedSQLQuery" IS NOT NULL;
```

## JWT Integration

### Structure
```json
{
  "x-user-ai-details": {
    "isUserAI": "false",  // ← OPS alone does NOT make this "true"; only DocumentCuration/WebCuration do
    "aiPlanDetails": [
      {
        "formId": "uuid",
        "plan": "OPSToIQCuration",
        "formName": "form-name",
        "isActive": true
      }
    ]
  }
}
```

### Helper Functions
```typescript
import { hasOPSToIQCuration, canEnableOPSToIQCuration } from '@warp/shared/utils/jwt-ai.util';

// Check JWT only (recommended for most UI)
const hasOPS = hasOPSToIQCuration(accessToken, formId);

// Check JWT + OPS system presence (for FormInvitation metadata)
const canEnable = await canEnableOPSToIQCuration(accessToken, formId, companyId);
```

## Key Files

### JWT Generation
- **`signin.ts`**: `addOPSToIQCurationFromSubscriptions()` function
  - Filters already-fetched `AISubscriptions` for `subscriptionPlan = 'OPSToIQCuration'` and `isActive = true`
  - Validates each form has SQL queries via `GetFormFieldsWithSQLQuery`
  - Adds plan to JWT if both conditions met

### API Endpoint
- **`/api/v1/ops/check-company-eligibility`**: Server-side OPS system validation
  - Used by `canEnableOPSToIQCuration()` to check if company exists in OPS
  - Proxies PRO API call with secure authorization headers

### UI Integration
- **`FormIntroScreen.tsx`**:
  - Checks JWT for OPSToIQCuration in `allowedAICuration` array
  - Shows "Start With AI" button for OPS users (even non-AI users)
  - Calls `executeAICurationFlows()` which triggers OPS processing

## User Types

| User Type | isUserAI | Can Have OPS | Example |
|-----------|----------|--------------|---------|
| AI User | "true" | Yes | DocumentCuration + OPSToIQCuration |
| Non-AI User | "false" | Yes | Only OPSToIQCuration |

## Testing

### Test Flow
1. **Enable feature**: Insert `AISubscriptions` record for the test company+form with `subscriptionPlan = 'OPSToIQCuration'`
2. **Verify SQL queries**: Confirm form has FormFields with SQL queries
3. **Regenerate JWT**: User logout/login → JWT regenerated with OPS plan
4. **Check JWT**: Verify plan appears in x-user-ai-details claim
5. **Open form**: "Start With AI" button should be visible
6. **Trigger processing**: Click button → OPS processing triggers

## Troubleshooting

| Issue | Check |
|-------|-------|
| Plan not in JWT | **1.** Active `AISubscriptions` record exists for company+form with `subscriptionPlan = 'OPSToIQCuration'`?<br>**2.** Form has FormFields with SQL queries?<br>**3.** User logged out and back in to regenerate JWT? |
| Feature not working for a company | Check if company has an active `AISubscriptions` row — feature is OPT-IN per company+form |
| Button not visible | **1.** Check JWT contains OPSToIQCuration plan<br>**2.** Check `FormInvitation.metadata.AIData.allowedAICuration` includes "OPSToIQCuration" |
| API call failing | **1.** Check `/api/v1/ops/check-company-eligibility` endpoint<br>**2.** Verify `AI_SERVICES_AUTHORIZATION` env variable configured |

### Common Mistakes

| Mistake | Why It Fails | Solution |
|---------|--------------|----------|
| Assuming feature is enabled by default | **OPS is OPT-IN only** — no subscription means disabled | Insert an `AISubscriptions` record for the company+form |
| Setting `isActive = false` expecting it to work | `false` means disabled | Must be `isActive = true` |
| Not restarting session after adding subscription | JWT is generated at login time | User must logout and login to regenerate JWT with new plan |
| Using GlobalMaster to enable OPS | Old approach — no longer used | Use `AISubscriptions` table instead |
