# JWT Structure Update Summary

> ⚠️ **BREAKING CHANGE** — The JWT claim key has been renamed from `x-hasura-form-with-AI` to `x-user-ai-details` and the payload shape has changed. Any downstream service or client that decodes this claim **must** be updated before deploying.

## Overview

Updated the JWT structure to change from `x-hasura-form-with-AI` to `x-user-ai-details` with a new format for AI subscription information. This update introduces support for OPSToIQCuration as a configuration-driven feature available to both AI and non-AI users.

**Key Changes**:
- New JWT claim: `x-user-ai-details` (replaces `x-hasura-form-with-AI`)
- Separated AI subscriptions (DocumentCuration, WebCuration) from configuration-driven OPS feature
- `isUserAI` flag now ONLY reflects AI subscription status (DocumentCuration/WebCuration)
- Non-AI users can have OPSToIQCuration plans without being classified as "AI Users"

## Changes Made

### 1. New Functions in `signin.ts`

**Location**: `apps/web/pages/api/v1/platform/auth/signin.ts`

#### `generateUserAIDetails()`
- Replaces the functionality of `isAIFeaturedEnabledorNot()`
- Processes AI subscriptions (DocumentCuration, WebCuration) from AISubscriptions table
- Returns new structure: `{ isUserAI: string, aiPlanDetails: any[] }`

#### `addOPSToIQCurationPlans()`
- **NEW function** for OPSToIQCuration processing (config-driven, not subscription-based)
- Filters GlobalMaster for forms with `IAOPSToIQCuration: true`
- Validates each form has FormFields with SQL queries
- Adds OPSToIQCuration plans to existing `aiPlanDetails` array
- Does NOT modify `isUserAI` flag

**Processing Flow**:
1. Generate AI plans from subscriptions → `generateUserAIDetails()`
2. Add OPS plans from GlobalMaster + SQL validation → `addOPSToIQCurationPlans()`
3. Final JWT contains combined plans

**Business Logic**:

- `isUserAI`: "true" if ANY DocumentCuration OR WebCuration plan has `isActive: true`. **Note**: OPSToIQCuration does NOT affect this flag - non-AI users can have OPS plans.
- `aiPlanDetails[].isActive`: 
  - **DocumentCuration/WebCuration**: true only if BOTH `AISubscriptions.isActive` is true AND `Form.isAIDataPointsAdded` is true
  - **OPSToIQCuration**: Configuration-driven (NOT subscription-based). Added to JWT when BOTH conditions met:
    1. GlobalMaster configuration has `IAOPSToIQCuration: true` for the form
    2. Form has FormFields with `generatedSQLQuery` (verified via GetFormFieldsWithSQLQuery)
    
    **Important**: OPS is processed separately via `addOPSToIQCurationPlans()` function after AI subscriptions are processed.

### 2. Updated `buildHasuraClaims()` Function

**Location**: `packages/shared/utils/auth-session.util.ts`

- Changed parameter from `formwithAI: userInvitationAIStatus[]` to `userAIDetails: { isUserAI: string; aiPlanDetails: any[] }`
- Changed JWT claim key from `"x-hasura-form-with-AI"` to `"x-user-ai-details"`

### 3. Updated Data Fetching in `signin.ts`

- Added calls to `sdk.GetCompanyAISubscriptions()` and `sdk.GetForms()`
- Maintained legacy data fetching for backward compatibility
- Added proper logging for both old and new structures

## New JWT Structure

### Before:

```json
{
  "x-hasura-form-with-AI": [
    {
      "formId": "uuid",
      "vcUserId": "uuid",
      "consultants": [],
      "isAIDataPointsAdded": true,
      "docWithAI": true,
      "onlyDoc": false
    }
  ]
}
```

### After:

**Example 1: AI User with DocumentCuration + OPSToIQCuration**
```json
{
  "x-user-ai-details": {
    "isUserAI": "true",
    "aiPlanDetails": [
      {
        "formId": "uuid-form-1",
        "plan": "DocumentCuration",
        "formName": "ESG Assessment",
        "isActive": true
      },
      {
        "formId": "uuid-form-2",
        "plan": "OPSToIQCuration",
        "formName": "",
        "isActive": true
      }
    ]
  }
}
```

**Example 2: Non-AI User with ONLY OPSToIQCuration**
```json
{
  "x-user-ai-details": {
    "isUserAI": "false",
    "aiPlanDetails": [
      {
        "formId": "uuid-form-2",
        "plan": "OPSToIQCuration",
        "formName": "",
        "isActive": true
      }
    ]
  }
}
```

**Plan Types**: `DocumentCuration`, `WebCuration`, `OPSToIQCuration`

## Special Handling: OPSToIQCuration

**Architecture**: Configuration-driven (GlobalMaster), NOT subscription-based (AISubscriptions)

**Why Different**: OPS is available to both AI and non-AI users, so it's managed via GlobalMaster form configuration rather than company subscriptions.

**Eligibility Logic** (via `addOPSToIQCurationPlans()` function):
1. Check GlobalMaster `Recommendation_new` type for forms with `IAOPSToIQCuration: true`
2. For each enabled form, verify it has FormFields with `generatedSQLQuery`
3. If BOTH conditions met → Add plan with `isActive: true` to JWT
4. If either condition fails → Plan NOT added (feature disabled for that form)

**User Classification**:
- **AI Users** (isUserAI: "true"): Have DocumentCuration/WebCuration subscriptions + can ALSO have OPS plans
- **Non-AI Users** (isUserAI: "false"): No AI subscriptions BUT can have OPS plans

**Critical Business Rule**: OPSToIQCuration does NOT make a user an "AI User". The `isUserAI` flag is ONLY set by DocumentCuration/WebCuration subscriptions.

## GraphQL Queries Used

- `GetCompanyAISubscriptions`: Fetches AI subscriptions by company ID (for DocumentCuration/WebCuration)
- `GetForms`: Fetches form details including `isAIDataPointsAdded` (for AI subscription validation)
- `getGlobalMasterByTypeList`: Fetches GlobalMaster configuration with type `Recommendation_new` (for OPSToIQCuration eligibility)
- `GetFormFieldsWithSQLQuery`: Checks if forms have FormFields with `generatedSQLQuery` (validates OPS data generation capability)

## Backward Compatibility

- Legacy `isAIFeaturedEnabledorNot()` function still called for reference
- Both old and new structures are logged for comparison
- No breaking changes to existing functionality

## Testing Recommendations

1. **AI Subscription Tests**:
   - Test JWT generation with DocumentCuration/WebCuration subscriptions
   - Verify `isUserAI: "true"` when AI subscriptions are active
   - Ensure `aiPlanDetails[].isActive` logic works correctly (both AISubscriptions.isActive AND Form.isAIDataPointsAdded must be true)

2. **OPSToIQCuration Tests**:
   - Test form with GlobalMaster `IAOPSToIQCuration: true` + SQL queries → Plan added
   - Test form with `IAOPSToIQCuration: true` but NO SQL queries → Plan NOT added
   - Test form with `IAOPSToIQCuration: false` → Plan NOT added
   - Test non-AI user (no subscriptions) with OPS enabled → `isUserAI: "false"` but has OPS plan
   - Test AI user with both DocumentCuration AND OPS → `isUserAI: "true"` with multiple plans

3. **Edge Cases**:
   - Companies with no AI subscriptions AND no GlobalMaster OPS config
   - Companies with inactive AI subscriptions
   - Forms without `isAIDataPointsAdded` flag
   - Forms without FormFields with `generatedSQLQuery`

4. **JWT Validation**:
   - Validate JWT decoding on consuming applications
   - Verify `hasOPSToIQCuration()`, `hasDocumentCuration()`, `hasWebCuration()` utility functions work correctly

## Files Modified

1. `apps/web/pages/api/v1/platform/auth/signin.ts` - JWT generation with OPS support
2. `packages/shared/utils/auth-session.util.ts` - Updated JWT claims structure
3. `packages/shared/utils/jwt-ai.util.ts` - Updated JWT reading functions, fixed `canEnableOPSToIQCuration()`
4. `apps/web/pages/api/v1/ops/check-company-eligibility.ts` - **NEW** API endpoint for OPS company validation

## New API Endpoint

### `/api/v1/ops/check-company-eligibility`

**Purpose**: Check if a company exists in OPS system (used by `canEnableOPSToIQCuration()`)

**Method**: GET

**Query Params**: `companyId` (CPanelCompanyId)

**Response**:
```json
{
  "data": { "eligible": true },
  "error": null
}
```

**Why Needed**: The PRO API check requires server-side authorization headers (`AI_SERVICES_AUTHORIZATION` env variable), which cannot be accessed from client-side code. This internal API acts as a secure proxy.

## JWT Utility Functions

**Location**: `packages/shared/utils/jwt-ai.util.ts`

### Client-Safe Functions (Read JWT Token):
- `hasOPSToIQCuration(accessToken, formId)` - Check if OPS plan exists in JWT for specific form
- `hasDocumentCuration(accessToken, formId)` - Check if DocumentCuration plan exists
- `hasWebCuration(accessToken, formId)` - Check if WebCuration plan exists
- `isFormAIEnabled(accessToken, formId)` - Check if any AI plan is active for form
- `getAIDetailsFromJWT(accessToken)` - Extract full `x-user-ai-details` object from JWT

### Client/Server Function (Makes API Call):
- `canEnableOPSToIQCuration(accessToken, formId, companyId)` - Combines JWT check + OPS system validation
  - Uses internal API `/api/v1/ops/check-company-eligibility` to verify company in OPS system
  - Safe to call from both client and server

**Important**: All JWT reading functions simply check if a plan exists with `isActive: true`. The business logic for determining eligibility happens during JWT generation in `signin.ts`.
