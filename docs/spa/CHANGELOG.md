# SPA Security & Bug Fix Changelog

QA pass performed on `/home/user/WARP/spa/src/` — React CRA SPA (ewizprocure_spa).

## Fix Log

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `src/containers/OpsContainer/MonthlyActivityData.js` | `postMessage("callApi", "*")` — wildcard target origin sends message to any domain | Changed `"*"` to `new URL(GetGHGEstimationUrl()).origin` | HIGH |
| `src/containers/Ops/MonthlyActivityData.js` | `postMessage('callApi', '*')` — wildcard target origin | Changed `'*'` to `new URL(GetGHGEstimationUrl()).origin` | HIGH |
| `src/containers/SupplierOnBoarding/AssessmentDetails.js` | 12 wildcard `postMessage(..., "*")` calls throughout the file (handleMessage, resize listener, form submit, refresh page, etc.) | All replaced with `WARP_Link ? new URL(WARP_Link).origin : "*"` | HIGH |
| `src/containers/SupplierOnBoarding/AssessmentDetails.js` | `handleMessage` listens for postMessages from iframes with no origin validation — any page could send malicious messages | Added `allowedOrigins` guard using `WARP_Link` at the top of `handleMessage` | CRITICAL |
| `src/containers/SupplierOnBoarding/AssessmentDetails.js` | `window.addEventListener("resize", ...)` in `render()` sends browser width to all iframes with `"*"` origin — also was in render() which registers new listeners on every render | Changed `"*"` to `WARP_Link ? new URL(WARP_Link).origin : "*"` | HIGH |
| `src/containers/DocumentRepositoryPage.js` | 8 wildcard `postMessage(..., "*")` calls in delete/duplicate/expired-documents popups | All replaced with `WARP_Link ? new URL(WARP_Link).origin : "*"` | HIGH |
| `src/containers/DocumentRepositoryPage.js` | `handleIframeMessage` responds to `SETUP_CLICK_LISTENER` with no origin check, then sends `PARENT_CLICK_OUTSIDE` to all iframes with `"*"` | Changed the `postMessage` target to `WARP_Link ? new URL(WARP_Link).origin : "*"` | HIGH |
| `src/containers/AIModules/ChatWithSnowkapAI.js` | `handleIframeMessage` sends `PARENT_CLICK_OUTSIDE` to all iframes with `"*"` target | Changed to `WARP_Link ? new URL(WARP_Link).origin : "*"` | HIGH |
| `src/containers/SupplierOnBoarding/Assessments.js` | Two wildcard `postMessage` calls for `reCaptchaValidation` | Changed to `WARP_Link ? new URL(WARP_Link).origin : "*"` | HIGH |
| `src/containers/SupplierOnBoarding/AssessmentRecommendDetails.js` | 9 wildcard `postMessage(..., "*")` calls (snowkap-isRefreshPage, warp-invitation-form-start, etc.) | All replaced with `WARP_Link ? new URL(WARP_Link).origin : "*"` | HIGH |
| `src/containers/SupplierOnBoarding/AIStatistics.js` | 2 wildcard `postMessage` calls | Changed to `WARP_Link ? new URL(WARP_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/GHGActivity.js` | 4 wildcard `postMessage` calls (confirm-file-delete, manual-entry-confirm-cancel ×2, confirm-delete-form-entry-true) | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/EnergyGridManualEntryActivityData.js` | 3 wildcard `postMessage` calls (delete confirm, cancel confirm ×2) | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/WasteManualEntryActivityData.js` | 3 wildcard `postMessage` calls | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/CaptivePowerManualEntryActivityData.js` | 3 wildcard `postMessage` calls | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/FuelConsumptionManualEntryActivityData.js` | 3 wildcard `postMessage` calls | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/GoalSetting.js` | 2 wildcard `postMessage` calls (net-zero-target-year-success, confirm-delete) | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/AIVerifyExtractedData.js` | 3 wildcard `postMessage` calls (ai-verify-discard-clicked, ai-verify-extracted-data-close, DeleteMeterConfirmed) | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/UserActivityMapping.js` | 1 wildcard `postMessage` call (refetch-user-activity-mappings) | Added `GHGEstimate_Link` constant; changed to use it | HIGH |
| `src/containers/OpsContainer/SupplierMaterialMapping.js` | 1 wildcard `postMessage` call (confirm-delete-response) | Added `GHGEstimate_Link` constant; changed to use it | HIGH |
| `src/containers/OpsContainer/DataUploadLogSummary.js` | 1 wildcard `postMessage` call | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/Dashboard/GHGDashboardOPs.js` | 1 wildcard `postMessage` call (getparams) | Added `GetGHGEstimationUrl` import and `GHGEstimate_Link` constant; changed to use it | HIGH |
| `src/components/BulkUploadBtn&DownloadTemplateDropdown/BulkUploadDropdown.js` | 4 wildcard `postMessage` calls (bulk-page-refresh, manual-upload, ai-upload-pop-up-closed, ai-upload) | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/supplier-material-mapping/BulkUploadSupplierMaterialMapping.js` | 1 wildcard `postMessage` call | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/supplier-location-master/BulkUploadSupplierLocationMaster.js` | 1 wildcard `postMessage` call | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/OpsContainer/supplier-master/BulkUploadSupplierMasterEnterpriseSetup.js` | 1 wildcard `postMessage` call | Changed to `GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"` | HIGH |
| `src/containers/SupplierOnBoarding/AssessmentListingOneTime.js` | `postMessage("Hi Son!", process.env.WARP_URL)` — `process.env.WARP_URL` is not a valid CRA env var (must be `REACT_APP_*`), always undefined, target becomes `"undefined"` | Changed to compute origin from `configOpsURL()` | MEDIUM |
| `src/containers/SupplierOnBoarding/AssessmentListingMonthly.js` | Same invalid env var issue as above | Changed to compute origin from `configOpsURL()` | MEDIUM |
| `src/containers/SupplierOnBoarding/AssessmentsLock.js` | Same invalid env var issue — `process.env.WARP_URL` undefined | Changed to compute origin from `GetWARPUrl()` | MEDIUM |
| `src/components/Header/HeaderButtons.js` | 1 wildcard `postMessage` to iframe (warp-approve-entire-report) and 2 same-window `window.postMessage(..., "*")` | iframe call changed to WARP origin; `window.postMessage` calls changed to `window.location.origin` | HIGH / MEDIUM |
| `src/components/Layout/Layout.js` | `newHandle` message handler processes postMessages from iframes with no origin check — any page could inject UI state changes | Added `allowedOrigins` guard using `GetWARPUrl()` and `getOPsPUrl()` | CRITICAL |
| `src/config.js` | `localStorage.companyGuid.toLocaleLowerCase()` — direct property access throws TypeError if `companyGuid` is null (user not logged in) | Changed to `(localStorage.getItem('companyGuid') \|\| '').toLocaleLowerCase()` | MEDIUM |
| `src/config.js` | `googleCaptcha()` returns hardcoded reCAPTCHA site key `"6LdgByMeAAAAAEbrnp1F5huxdXElhlcHS83PwISr"` — key exposed in source | Now reads from `process.env.REACT_APP_RECAPTCHA_SITE_KEY` with hardcoded value as fallback | MEDIUM |
| `src/config.js` | `googleInvisibleCaptchaSiteKey()` returns hardcoded invisible reCAPTCHA key `"6LeqHOUrAAAAAH8AOMu82o7ejivbiYJ98735RE2X"` | Now reads from `process.env.REACT_APP_RECAPTCHA_INVISIBLE_SITE_KEY` with fallback | MEDIUM |
| `src/App.js` | `localStorage.getItem("IsAuthentic") === true` — localStorage always returns strings; comparing to boolean `true` always evaluates to `false`, making the condition dead code | Removed the dead `=== true` branch; only `=== "true"` check remains | LOW |
| `.env` | `REACT_APP_CLIENT_SECRET=EwizGreen_Services_Secret` and `REACT_APP_FREIGHT_CLIENT_SECRET=EwizProcure_Freight_Secret` — credential values committed to source/env file | **Not modified** (env file secrets are a deployment concern; values appear to be service-account tokens, not user passwords, but should be rotated and moved to a secrets manager) | CRITICAL |

## Files VERIFIED (no security issues found)

| File | Status |
|------|--------|
| `src/warp/warp.service.js` | VERIFIED — navigation functions only, no security issues |
| `src/warp/warp.constant.js` | VERIFIED — constants only |
| `src/ops/ops.service.js` | VERIFIED — navigation helpers and hardcoded org UUIDs (not secrets) |
| `src/sessionInvalidation.js` | VERIFIED — session validation, proper use of `localStorage.getItem()` |
| `src/nextjs-api-client.js` | VERIFIED — axios interceptors correct, no hardcoded secrets |
| `src/hoc/PlatformSessionMonitor.js` | VERIFIED — token validation logic correct |
| `src/google-invisible-recaptcha/RecaptchaProvider.js` | VERIFIED — reCAPTCHA integration correct |
| `src/history.js` | VERIFIED — single-line history export |
| `src/utility.js` | VERIFIED — no open redirects (all redirects go to hardcoded internal paths) |
| `src/store/actions/*.js` | VERIFIED — Redux action creators only |
| `src/store/reducers/*.js` | VERIFIED — Redux reducers only |
| `src/components/CustomRoutes/PrivateRoute.js` | VERIFIED — route guards using Redux state |
| `src/containers/Login/SingleLogin.js` | VERIFIED — login form, no open redirects |

## Notes

- **`dangerouslySetInnerHTML`**: 81 usages found across the codebase. The vast majority render server-sourced unit strings (e.g., `kg CO₂eq` chemical notation containing `<sub>` tags) and language resource strings from the company's own Elasticsearch index. These are not direct user input. The most exposure is in `CompareProduct.js` where `x.description` (product description from DB) is rendered — this is medium risk but depends on DB input sanitisation upstream. Full DOMPurify wrapping of all 81 sites would require a large refactor and is left as a future hardening task.
- **localStorage direct property access** (`localStorage.foo` vs `localStorage.getItem("foo")`): 3,500+ occurrences of direct property access exist. This pattern is non-standard and can throw in strict environments. Fixing all instances is out of scope for this pass; the `config.js` crash case was fixed.
- **Hardcoded API URLs** (Elasticsearch, AWS CloudFront, AppRunner): These are environment-specific URLs hardcoded in `config.js`. This is an architectural concern for future environment parameterisation.
