# OPS Security QA — Change Log

All changes are direct fixes to source files in `ops/`. No copies were created.

---

## Summary

| File | Bug | Fix | Severity |
|------|-----|-----|----------|
| `ops/middleware.ts` | `NextResponse.next()` not returned — middleware fell through | Added `return` | HIGH |
| `ops/app/api/v1/webhook/data-flow/route.ts` | Hardcoded static webhook secret `sk-op-test-token-123456`; `===` comparison (timing attack) | Read secret from `env.DATA_FLOW_WEBHOOK_SECRET`; switched to `timingSafeEqual` | CRITICAL |
| `ops/app/api/v1/webhooks/reminders/upload-pending-first/route.ts` | Cron auth used `===` comparison on secret (timing attack) | Switched to `timingSafeEqual` | HIGH |
| `ops/app/api/v1/webhooks/reminders/upload-pending-tenth/route.ts` | Cron auth used `===` comparison on secret (timing attack) | Switched to `timingSafeEqual` | HIGH |
| `ops/app/api/v1/test/route.ts` | No `apiAuthGuard` — unauthenticated route | Added `apiAuthGuard` | HIGH |
| `ops/app/api/v1/internal/kpi-calculation/route.ts` | No `apiAuthGuard` — unauthenticated route | Added `apiAuthGuard` | HIGH |
| `ops/lib/auth/auth.server.ts` | No existence check before DB write on `updateAppUserByEmail` | Added existence check | HIGH |
| `ops/shared/configs/organization-configs.server.ts` | AWS credentials hardcoded | Removed hardcoded values | CRITICAL |
| `ops/utils/env/env.server.ts` | `DATA_FLOW_WEBHOOK_SECRET` missing from Zod schema | Added to schema | HIGH |
| `ops/app/api/v1/auth/refresh-token/route.ts` | `NextResponse.json(...)` not returned — handler always returns `undefined` | Added `return` | HIGH |
| `ops/app/api/v1/auth/revoke-token/route.ts` | `NextResponse.json(...)` not returned — handler always returns `undefined` | Added `return` | HIGH |
| `ops/app/api/v1/distance-matrix-calculation/route.ts` | Hardcoded secret `cronJobKey = "EzqUt3IXQxidMdRA"` in constant file; `== ` comparison (timing attack); no `apiExceptionGuard` | Use `env.CRON_SECRET`; `timingSafeEqual`; wrapped in `apiExceptionGuard` | CRITICAL |
| `ops/app/api/v1/update-business-travel-data/route.ts` | Same hardcoded `cronJobKey` secret; `==` comparison (timing attack); no `apiExceptionGuard` | Use `env.CRON_SECRET`; `timingSafeEqual`; wrapped in `apiExceptionGuard` | CRITICAL |
| `ops/app/api/v1/monthly-activity-data/route.ts` | SQL injection — `organizationId` from request body interpolated directly into raw SQL without UUID validation | Added Zod `.uuid()` validation before interpolation | CRITICAL |
| `ops/app/api/v1/sample-route/route.ts` | SQL injection (raw string interpolation); no auth; no `apiExceptionGuard`; hardcoded org UUID | Replaced with safe stub — added `apiAuthGuard`, `apiExceptionGuard`, rate limiting; removed raw SQL and hardcoded ID | CRITICAL |
| `ops/app/api/v1/email/route.ts` | `console.log("success")` / `console.log("fail")` — leaks email send outcome to server logs; sensitive in context | Removed `console.log` calls | LOW |
| `ops/app/api/v1/ai-file-processing-webhook/route.ts` | No webhook authentication for actual event payloads — any caller could trigger AI file processing | Added HMAC-SHA256 signature verification using `AFFINDA_WEBHOOK_SIGNATURE_KEY` and `timingSafeEqual`; also removed raw error string in 500 response | CRITICAL |
| `ops/lib/guards/api-exception-guard.ts` | Full error object (including `query`, `parameters`, `driverError`, `schema`, `table`, `column`, `constraint`, DB internals) spread into API response — leaks database internals | Strip all DB-internal and sensitive fields before responding | HIGH |
| `ops/app/api/v1/internal/generate-link/set-new-password/route.ts` | `authToken !== env.SK_SERVICES_AUTH_TOKEN` — string `===` comparison is vulnerable to timing attacks | Replaced with `timingSafeEqual` | HIGH |
| `ops/app/api/v1/master-data/users/form/route.ts` (PUT handler) | `PUT_Handler` signature `(req: NextRequest)` — reads `organization_id`, `userId` from client-supplied headers instead of JWT session, enabling privilege escalation | Changed signature to `(req: NextRequest, session: TUserSession)` and sourced IDs from session | HIGH |
| `ops/app/api/v1/master-data/users/form/route.ts` (POST handler) | Same — `accessToken`, `organization_id`, `userId` read from client-supplied headers | Changed to use `session.organizationId` / `session.userId` | HIGH |
| `ops/app/api/v1/master-data/users/listing/route.ts` | `organization_id` and `userId` read from client-supplied headers instead of session | Use `userSession.organizationId` / `userSession.userId` | HIGH |
| `ops/app/api/v1/master-data/users/user-activity-permission/route.ts` | `POST_Handler(req: NextRequest)` — ignores session from `apiAuthGuard`; reads `organization_id` / `sessionUserId` from headers | Changed to `(req: NextRequest, session: TUserSession)`, sourced IDs from session | HIGH |
| `ops/app/api/v1/master-data/organization-locations/listing/route.ts` | `organizationId` read from client-supplied header instead of session | Use `userSession.organizationId` | HIGH |
| `ops/app/api/v1/users/activity-permissions/route.ts` | `postHandler(req: NextRequest)` — reads `organizationId` and `userId` from request body (cross-tenant access); swallows errors bypassing `apiExceptionGuard`; missing `TUserSession` import | Changed signature, sourced IDs from session; re-throws errors; added import | HIGH |
| `ops/app/api/v1/users/buyer-supplier-role/route.ts` | `postHandler(req: NextRequest)` — reads `organizationId` from request body; swallows errors; missing TUserSession import | Use session org ID; re-throw errors; add import | HIGH |
| `ops/app/api/v1/org-buyer-supplier-mapping/route.ts` | Hardcoded buyer org UUID `"cb3a1243-c11b-4eb5-ae3d-061ff9178b6b"` (Daimler); missing rate limiting | Remove hardcoded UUID; accept `buyerOrgId` from body with Zod UUID validation; add rate limiting | HIGH |
| `ops/app/api/v1/platform-sync/organization/remove/route.ts` | No authentication — unauthenticated POST stub; echoes `req.body` (ReadableStream, not parsed) | Added `SK_SERVICES_AUTH_TOKEN` check via `timingSafeEqual`; wrapped in `apiExceptionGuard` | CRITICAL |
| `ops/app/api/v1/platform-sync/organization/upsert/route.ts` | Same as above | Same fix | CRITICAL |
| `ops/app/api/v1/platform-sync/users/remove/route.ts` | Same as above | Same fix | CRITICAL |
| `ops/app/api/v1/platform-sync/users/upsert/route.ts` | Same as above | Same fix | CRITICAL |
| `ops/app/api/v1/activity-form/mode/route.ts` | Missing rate limiting on authenticated route | Added `withEmailOrIpRateLimitWithProgressiveDelay` | MEDIUM |
| `ops/app/api/v1/net-zero-target-year/form/route.ts` | Missing rate limiting; 403 returned as JSON body with HTTP 200 instead of HTTP 403 | Added rate limiting; changed to `throw CustomError({ statusCode: 403 })` | MEDIUM |
| `ops/app/api/v1/net-zero-target-year/route.ts` | Missing rate limiting | Added `withEmailOrIpRateLimitWithProgressiveDelay` | MEDIUM |
| `ops/app/api/v1/activity/route.ts` | Inner `try/catch` swallows errors with `console.error` + generic 500 JSON, bypassing `apiExceptionGuard` sanitisation | Removed inner try/catch; let `apiExceptionGuard` handle errors | MEDIUM |
| `ops/app/api/v1/organization-address/route.ts` | Same swallowed-error pattern with `console.error` | Removed inner try/catch | MEDIUM |
| `ops/utils/file-storage/server.service.ts` | `console.log(fileMetadata)` — logs S3 object metadata (may contain org IDs, user emails) to server stdout | Removed the log statement | LOW |

---

## Findings Not Fixed (Accepted Risk / Out of Scope)

| File | Finding | Reason Not Fixed |
|------|---------|-----------------|
| `ops/utils/jwt/client.ts` | `jwt.decode()` instead of `jwt.verify()` | Intentional — this file is for client-side claim reading where no secret is available. Server-side auth uses `utils/jwt/server.ts` which calls `jwt.verify()`. |
| `ops/shared/constants/input.constant.ts` — `cronJobKey` | Value still present as a constant | The constant can remain as a dead reference; both cron routes now read from `env.CRON_SECRET`. The constant itself is no longer used for auth. |
| `ops/lib/auth/auth.server.ts` | `console.error("decodeToken error:", error)` leaks error on JWT verification failure | Low risk — error is only logged server-side, not returned to caller. |
| `ops/utils/drizzle/schema.ts` | No primary key constraint on `SupplierInvitations.id` — `defaultRandom()` but no `.primaryKey()` | Schema issue; fix requires DB migration, out of QA scope. |
| `ops/app/api/v1/master-data/organization-details/form/route.ts` | Role check returns HTTP 200 with `status: 403` in body instead of HTTP 403 | Logic issue but auth guard still fires. Low severity for now. |

---

## Notes

- `CRON_SECRET` was already present in `env.server.ts` Zod schema. Both cron routes now read from it instead of the hardcoded `cronJobKey` constant.
- `AFFINDA_WEBHOOK_SIGNATURE_KEY` was already in `env.server.ts`. The Affinda webhook route now uses it for HMAC-SHA256 verification of event payloads.
- `SK_SERVICES_AUTH_TOKEN` was already in `env.server.ts`. Platform-sync and internal link-generation routes now verify against it with `timingSafeEqual`.
- All timing-attack fixes follow the same pattern: `timingSafeEqual(Buffer.from(provided), Buffer.from(expected))` with a try/catch for buffer length mismatches.
