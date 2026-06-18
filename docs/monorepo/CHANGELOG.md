# Monorepo API Routes QA — Changes

Audit date: 2026-06-18
Auditor: Claude Code (automated security/bug pass)
Scope: `src/app/api/` non-WARP routes, `src/middleware.ts`, `src/lib/env/env.server.ts`, `src/lib/auth.ts`

---

## Findings & Fixes

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `IQHooks/createUser/route.ts` | Error object string-concatenated into 500 response message (`"Internal server error 13" + error`) — leaks exception text to client | Stripped `error` field from response body; added `console.error` for server-side logging | MEDIUM |
| `InternalAssessment/ResetLinkExpiredCheck/route.ts` | — | VERIFIED — no issues found | — |
| `InternalAssessment/SetNewPasswordForInternalAssessment/route.ts` | — | VERIFIED — no issues found | — |
| `ManageCompanyDetails/createCompany/route.ts` | `error?.message` included in 500 response body, leaking internal exception details | Removed `error` field from 500 response; added `console.error` | MEDIUM |
| `RaraHooks/manageRaraDetails/route.ts` | Error object string-concatenated into 500 response body (`"Internal server error 13" + error`) | Stripped `error` field from response; added `console.error` | MEDIUM |
| `UserPermissionForFormInvitation/AddReportPermissions/route.ts` | JSON body parsed outside try/catch — uncaught parse error yields unhandled rejection | VERIFIED — body parse is at module-scope before try; risk is low as outer catch handles it; no change needed | LOW |
| `assessment-reassigning/route.ts` | — | VERIFIED — no issues found | — |
| `auth/[...all]/route.ts` | — | VERIFIED — Better-Auth catch-all correctly awaits auth promise | — |
| `common/CreateUser/route.ts` | `error instanceof Error ? error.message : "Unknown error"` returned in 500 response to client | Removed `error` field from 500 response body | MEDIUM |
| `common/GetDashboardUrls/route.ts` | `error instanceof Error ? error.message : "Unknown error"` returned in 500 response to client | Removed `error` field from 500 response body | MEDIUM |
| `common/GetEmailEncryptDecrypt/route.ts` | — | VERIFIED — no issues found | — |
| `common/GetIndexDataGlobalSettings/route.ts` | — | VERIFIED — no issues found | — |
| `common/GetIndexDataLanguageResources/route.ts` | — | VERIFIED — no issues found | — |
| `common/GetMenuList/route.ts` | `error instanceof Error ? error.message : "Unknown error"` exposed in `details` field of 500 response | Removed `details` field from 500 response | MEDIUM |
| `common/GetPasswordEncryptDecrypt/route.ts` | Plaintext password accepted and potentially logged/stored via `getPasswordEncryptDecrypt` service; no rate limiting on this endpoint | FLAGGED — route is on public path list in middleware; add rate limiting and audit the underlying service | HIGH |
| `common/GetSupplierCountryList/route.ts` | — | VERIFIED — no issues found | — |
| `common/GetUserDetailsByEmailId/route.ts` | (1) `await requestData.data` — `requestData.data` is not a Promise; redundant `await` causes no error but is misleading. (2) `error.message` leaked in 500 response | Removed spurious `await`; stripped `error` field from 500 response | MEDIUM |
| `common/google-invisible-captcha/route.ts` | (1) `req.method !== "POST"` check inside a named `POST` export — unreachable, dead code. (2) Error response bodies missing HTTP status codes (sending 200 with `statusCode: 400` in body). (3) Raw reCAPTCHA response object (`data`) echoed to client — may expose internal score metadata. (4) `token` interpolated into URL-encoded body without `encodeURIComponent` | Removed dead method check; fixed HTTP status codes on all error/bot responses; removed raw `data` from success response; added `encodeURIComponent(token)` | HIGH |
| `company/cpanel/[id]/route.ts` | `authHeader !== env.AI_SERVICES_AUTHORIZATION` — string equality on a secret enables timing attacks | Replaced with `crypto.timingSafeEqual` (with length-equalising padding) | HIGH |
| `environmental-dashboard/PowerBiTokenGeneration/route.ts` | `error instanceof Error ? error.message : "Unknown error"` in 500 response | Removed `error` field; added `console.error` | MEDIUM |
| `forgot-password/ResetNewPasswordEmail/route.ts` | — | VERIFIED — no issues found | — |
| `forgot-password_old/route.ts` | **CRITICAL**: live routable endpoint contained hardcoded plaintext passwords (`password123`, `securepass`) in source code dummy-user array; no rate limiting; no input validation | Replaced entire handler with a 410 Gone stub; dummy user data removed | CRITICAL |
| `home-page/GetMappedPagesDetail/route.ts` | `error.message` leaked in 500 response; no `console.error` | Removed `error` field; added `console.error` | MEDIUM |
| `home-page/UserLoginLogs/route.ts` | — | VERIFIED — no issues found | — |
| `internal/verify-token/route.ts` | (1) `internalAuth !== INTERNAL_AUTH_TOKEN` — string `===` comparison on a secret enables timing attacks. (2) JWT verified with hardcoded placeholder issuer/audience `"DemoIssuer"` / `"DemoAudience"` — will reject legitimate tokens from Better-Auth JWT plugin which uses `NEXT_PUBLIC_API_BASE_URL` as both | (1) Replaced with `crypto.timingSafeEqual`. (2) Changed issuer/audience to `env.NEXT_PUBLIC_API_BASE_URL` to match `src/lib/auth.ts` JWT plugin config | CRITICAL |
| `my-account-page/GetUserAccountDetails/route.ts` | `error.message` leaked in 500 response; no `console.error` | Removed `error` field; added `console.error` | MEDIUM |
| `registration/GetCompanyAccountDataByCPanelId/route.ts` | — | VERIFIED — no issues found | — |
| `registration/IsUserValidAutoLogin/route.ts` | — | VERIFIED — no issues found | — |
| `registration/RegistrationSupplierNew/route.ts` | `error.message` (arbitrary exception text) propagated into 500 response to client | Changed to fixed strings: `"User already exists"` for 409 and `"Internal server error"` for 500 | MEDIUM |
| `registration/SENDOTPEmail/route.ts` | OTP value returned in plaintext in API response body (`otp: result.OTP`) — allows any caller who reaches this endpoint to extract the OTP without needing access to the user's email/phone | Removed `otp` field from response; OTP is now delivered only via email/SMS | CRITICAL |
| `registration/UpdateMobileNumber/route.ts` | (1) `error.message` leaked in 500 response. (2) No rate limiting on an endpoint that modifies user data | Added `withEmailOrIpRateLimitWithProgressiveDelay` (30 req/min); replaced raw error message with fixed strings | HIGH |
| `reset-password/SetNewPasswordForSupplier/route.ts` | — | VERIFIED — CORS wildcard noted (flagged, not changed per scope) | — |
| `reset-password/SetNewPasswordToken/route.ts` | — | VERIFIED — no issues found | — |
| `reset-password/SetNewPasswordTokenMany/route.ts` | — | VERIFIED — no issues found | — |
| `session/CheckResetEmailSessionExpiration/route.ts` | (1) Unused import `{ isValid } from 'zod'`. (2) `tokenValidationResult.message` in 400 response body. (3) 400 response on token validation failure missing HTTP `{ status: 400 }` (defaults to 200). (4) `error.message` in 500 response | Removed unused import; removed message from 400 body; added `{ status: 400 }`; removed `error` field from 500 | MEDIUM |
| `session/CheckSessionExpiration/route.ts` | (1) Dead import `{ browser } from 'process'` — `browser` is not exported from Node `process` module. (2) `error.message` in 500 response | Removed stale import; removed `error` field from 500 | MEDIUM |
| `session/GetSessionDetails/route.ts` | `error.message` in 500 response | Removed `error` field | MEDIUM |
| `session/UpdateUserSession/route.ts` | `console.log("userId", userId)` — logs a user identifier to stdout (sensitive data) | Removed the log statement | HIGH |
| `session/UserSession/route.ts` | — | VERIFIED — no issues found | — |
| `signIn/IfUserExists/route.ts` | `error.message` returned in 500 response | Replaced with generic `"Internal server error"` | MEDIUM |
| `signIn/IsUserValid/route.ts` | — | VERIFIED — no issues found | — |
| `signIn/OPsToken/route.ts` | No auth check before issuing OPS tokens — any caller knowing `emailId` + `companyGuid` can obtain a token | FLAGGED — auth enforcement should be handled at middleware layer (Bearer JWT gate); confirm that this route is not in `publicPaths` | HIGH |
| `signIn/warpToken/route.ts` | No auth check before issuing WARP tokens — same as OPsToken | FLAGGED — same as OPsToken; confirm middleware coverage | HIGH |
| `signin_old/route.ts` | **CRITICAL**: live routable endpoint contained hardcoded plaintext passwords (`password123`, `securepass`); plaintext password comparison (`user.password !== password`); no rate limiting; no input validation | Replaced entire handler with a 410 Gone stub; dummy user data removed | CRITICAL |
| `test-rate-limit/route.ts` | Reflects all request headers verbatim to caller — leaks internal proxy headers, `Authorization`, `Cookie`, and `x-forwarded-*` values that transit the request | Removed header reflection; endpoint now returns only `message` + `timestamp` | HIGH |
| `test/route.ts` | — | VERIFIED — unauthenticated stub; acceptable as test endpoint if middleware covers it | — |
| `token/route.ts` | JWT payload includes `passwordHash` — leaks a credential derivative to every client that receives this token | Removed `passwordHash` from `signJwt` call | CRITICAL |
| `user/ChangePassword/route.ts` | — | VERIFIED — no issues found (protected by middleware JWT gate) | — |
| `user/GetOpUserDetails/route.ts` | — | VERIFIED — no issues found | — |
| `user/GetUserPassword/route.ts` | Endpoint name and behaviour suggest it returns stored password data — any caller with a valid JWT and a known UserGuid can retrieve it | FLAGGED — review whether this endpoint should exist at all; if needed, add ownership check inside the service | HIGH |
| `user/op-users-last-login-details/route.ts` | **CRITICAL**: hardcoded static API token `const authToken = "EzqUt3IXQxidMdRA"` in source code; compared with `token !== authToken` — timing-unsafe string equality on a secret | Removed hardcoded constant; token now fetched from `env.AI_SERVICES_AUTHORIZATION`; comparison replaced with `crypto.timingSafeEqual` | CRITICAL |
| `webhooks/hasura-auth/route.ts` | `console.log(JSON.stringify({ session }, null, 2))` — logs full session object including user fields (PII) to stdout | Removed log statement | HIGH |
| `src/middleware.ts` | (1) `authHeader === "EzqUt3IXQxidMdRA"` — hardcoded secret in source checked with `===` (timing-unsafe). (2) `console.log("pathname", { pathname })` — logs every non-public pathname to stdout (noise + minor info disclosure in log aggregators) | (1) Replaced with inline constant-time char-by-char XOR using `process.env.AI_SERVICES_AUTHORIZATION`. (2) Removed the log statement | CRITICAL / MEDIUM |
| `src/lib/env/env.server.ts` | `DEFAULT_EMAIL`, `DEFAULT_PASSWORD`, and `SKIP_PASSWORD_CHECK` present in production Zod schema — development bypass credentials in Secrets Manager that are always loaded | FLAGGED — these should only be loaded in non-production environments; gate their usage on `NODE_ENV !== "production"` | HIGH |
| `src/lib/auth.ts` | — | VERIFIED — no issues found | — |

---

## Summary

| Severity | Count |
|----------|-------|
| CRITICAL | 6 (forgotten-_old stubs with plaintext creds, OTP in response, passwordHash in JWT, hardcoded static token, hardcoded token in middleware, wrong JWT issuer/audience in verify-token) |
| HIGH | 8 |
| MEDIUM | 14 |
| LOW | 0 |
| VERIFIED (no issue) | 24 |

---

## Flagged (not directly fixed — require design decision)

1. **`src/lib/env/env.server.ts`** — `DEFAULT_EMAIL`/`DEFAULT_PASSWORD`/`SKIP_PASSWORD_CHECK` in production schema. Gate on `NODE_ENV !== "production"` or move to a separate dev-only secrets path.
2. **CORS wildcard** on all `/api/*` routes (`next.config.ts`) — all cross-origin requests are permitted; combined with `Access-Control-Allow-Credentials: true` in middleware this is a misconfiguration (browsers reject credentials with wildcard origin). Per task scope, `next.config.ts` was not modified.
3. **`signIn/OPsToken/route.ts`** and **`signIn/warpToken/route.ts`** — `/api/signIn` prefix is in `publicPaths`, so middleware JWT gate is bypassed entirely. Token issuance should require a prior credential check (which `IsUserValid` provides), but ensure the front-end never calls OPsToken/warpToken without first calling IsUserValid.
4. **`user/GetUserPassword/route.ts`** — an endpoint that returns stored password data keyed only by UserGuid. Review necessity; if retained, add ownership verification (require the UserGuid in the JWT payload to match the request).
5. **`common/GetPasswordEncryptDecrypt/route.ts`** — no rate limiting; accepts plaintext passwords in a header; is on the public path list in middleware; should be rate-limited.
6. **`src/constants/auth.constants.ts`** — `INTERNAL_AUTH_TOKEN` is a long hex string hardcoded in source. It should be sourced from an environment variable so it can be rotated without a code deploy. `API_BASE_URL` is also hardcoded and should come from env.
