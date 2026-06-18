# OPs GHG Calculator — Utilities Reference

All files under `utils/`. These are pure utility functions and infrastructure helpers with no React dependencies (unless noted).

---

## `utils/types.ts`

Email-related TypeScript interfaces shared across the codebase.

| Export | Type | Description |
|---|---|---|
| `SendEmailParams` | interface | `{ to, cc[], bcc[], preparedEmaiTemplate: { subject, content } }` |
| `EmailSendEnvelope` | interface | `{ from, to[] }` — nodemailer envelope |
| `EmailSendResult` | interface | `{ success, data?: EmailSendResponse, error? }` |
| `EmailSendResponse` | interface | Nodemailer send result: `accepted[]`, `rejected[]`, `messageId`, `response`, timing fields |
| `EmailTemplate` | interface | DB email template: `{ id, code, subject, template, cc_emails?, bcc_emails?, created_at, updated_at, created_by?, updated_by? }` |

---

## `utils/sanitize.util.ts`

String sanitisation functions. Used across form validation, Excel import parsing, and data normalisation before DB writes.

| Export | Behaviour |
|---|---|
| `stz_string_tlds(value)` | trim + lowercase + remove double space |
| `stz_string_tds(val)` | trim + remove double space (keeps case) |
| `stz_string_tldssc(stringvalue)` | trim + lowercase + remove spaces, dots, hyphens, underscores |
| `stz_string_tlms(val)` | collapse multiple spaces + trim + lowercase |
| `stz_string_tls(val)` | remove ALL spaces + lowercase |
| `stz_string_tl(val)` | trim + lowercase |
| `sanitizeString.v1` | alias for `stz_string_tlds` |
| `sanitizeString.v2` | alias for `stz_string_tds` |
| `sanitizeString.v3` | alias for `stz_string_tldssc` |
| `sanitizeString.v4` | alias for `stz_string_tlms` |
| `sanitizeString.v5` | alias for `stz_string_tls` |
| `stz_string_sheetName(value)` | Strips quotes from JSON.stringify output — used to clean Excel sheet names |
| `toSentenceCase(str)` | Capitalises first character, lowercases rest |
| `capitalizeEachWord(sentence)` | Title-cases each word |
| `isEmptyCell(val)` | Returns `true` if `undefined`, `null`, or blank/whitespace string. Returns `false` for `0`, `false`, or any non-blank value |

---

## `utils/common-functions.ts`

General-purpose helpers used across components and pages.

| Export | Description |
|---|---|
| `handleDownload(url, filename?)` | Triggers browser file download from a URL |
| `formatDateDisplay(date)` | Formats date for UI display |
| `parseDateInput(value)` | Parses user date input strings |
| MRT table config helpers | Utilities for consistent mantine-react-table configuration |

---

## `utils/date.util.ts`

Date and time utilities for financial year calculations and month handling.

| Export | Description |
|---|---|
| Month arrays | Ordered arrays of month names in full and abbreviated form |
| `validateMonthYear(month, year)` | Checks if a given month/year is within the organisation's valid data range (baseline year → now) |
| `getMonthNumberAndIndex(monthName)` | Converts a month name to `{ monthNumber, index }` |
| `getPastYears(count)` | Returns an array of the past N years |
| Financial year helpers | Converts between calendar and financial year conventions |

---

## `utils/enums.ts`

Application-wide TypeScript enums.

| Export | Values |
|---|---|
| `YearType` | `CALENDAR = "calendar"`, `FINANCIAL = "financial"` |
| `YearStartMonth` | Numeric month when the financial year starts (e.g. `4` for April) |

---

## `utils/const.ts`

App-wide constants and configuration keys.

| Export | Description |
|---|---|
| Email template type keys | String constants for template type lookups (e.g. `Welcome_Email`, `Reminder_Email`) |
| Other app-wide constants | Shared string/numeric constants used across `lib/` and `utils/` |

---

## `utils/logger.ts`

Structured logger wrapper. Wraps console or a log library with consistent formatting. Used server-side in `lib/` handlers.

---

## `utils/email.util.ts`

Email sending infrastructure. Used by all routes that send notifications.

| Export | Description |
|---|---|
| `sendEmail(params)` | Sends email via Nodemailer using SMTP config. Returns `EmailSendResult`. |
| `saveEmailLog(...)` | Persists email send record to DB for audit trail |
| `fetchEmailTemplate(type, orgId)` | Fetches org-specific or default email template from DB |
| `dynamicEmailHeader(orgId)` | Returns branded email header HTML for the org |
| Template variable replacement | Replaces `{{variable}}` placeholders in template strings with runtime values |

---

## `utils/data-transformer.util.ts`

Data transformation utilities.

| Export | Description |
|---|---|
| `getFilenameFromURL(url)` | Extracts filename from a URL or S3 path (strips query string, decodes URI components) |

---

## `utils/comapre.util.ts`

**[QA: Typo in filename — `comapre` should be `compare`.]**

Comparison utility functions used in validation and duplicate-detection logic.

---

## `utils/env/env.server.ts`

Server-only environment management.

| Export | Description |
|---|---|
| `getServerEnv()` | Returns Zod-validated server environment object. Throws at startup if any required variable is missing. Variables loaded from AWS Secrets Manager via `scripts/load-secrets.mjs`. |

Variables included: Hasura endpoint + admin secret, database URL, JWT secret, S3 credentials, SMTP config, Redis URL, ClickHouse config, SPA API URL, AI service keys.

---

## `utils/env/env.client.ts`

Client-safe (public) environment variables.

| Export | Description |
|---|---|
| `clientEnv` | Object of `NEXT_PUBLIC_*` variables only. Validated at module load. Safe to import in `"use client"` components. |

---

## `utils/jwt/`

JWT utilities split by execution context.

| File | Export | Description |
|---|---|---|
| `client.ts` | `decodeToken(token)` | Decodes JWT payload without verification (client-side use only) |
| `server.ts` | `signToken(payload)` | Signs JWT with HS256 using server secret |
| `server.ts` | `verifyToken(token)` | Verifies JWT and returns decoded payload. Throws on invalid/expired token. |
| `getUserDataFromToken.ts` | `getUserRoleFromToken(token)` | Extracts `x-hasura-default-role` from decoded claims |
| `getUserDataFromToken.ts` | `getOrganizationIdFromToken(token)` | Extracts `x-hasura-org-id` |
| `getUserDataFromToken.ts` | `getUserIdFromToken(token)` | Extracts `x-hasura-user-id` |
| `getUserDataFromToken.ts` | `isAIEnable(token)` | Returns boolean — whether AI features are enabled for this org |

---

## `utils/database/db-context.ts`

| Export | Description |
|---|---|
| `GetOPSDBContext()` | Returns the singleton Drizzle ORM connection to Postgres. Initialised once; reused across requests. Used only for secondary (non-Hasura) tables. |

---

## `utils/drizzle/`

| File | Description |
|---|---|
| `connection.ts` | Drizzle Postgres connection setup using `postgres` driver |
| `schema.ts` | Drizzle table and view definitions (Organisation, SupplierInvitations, EmailTemplates, GlobalConfigs, BuyerSupplierAddressMappings) |
| `schema-relations.ts` | Drizzle relational definitions between tables |
| `relations.ts` | Additional relation helpers |
| `drizzle.config.ts` | Drizzle Kit config for migration management |
| `0000_fair_young_avengers.sql` | Initial migration SQL |
| `0001_activity_task_request_status.sql` | Migration: adds status column to activity task request table |

---

## `utils/file-storage/`

S3 file storage utilities split by execution context.

| File | Export | Description |
|---|---|---|
| `server.service.ts` | `getPresignedUploadUrl(key)` | Generates an S3 presigned PUT URL for file upload |
| `server.service.ts` | `uploadToS3(buffer, key, mimeType)` | Uploads a buffer directly to S3 |
| `server.service.ts` | `getFilenameFromS3Url(url)` | Extracts the S3 object key from a full S3 URL |
| `client.service.ts` | `uploadFileToPresignedUrl(url, file)` | Client-side PUT to a presigned S3 URL |

---

## `utils/dom-purifier/`

HTML sanitisation wrappers to prevent XSS in user-provided content.

| File | Description |
|---|---|
| `dom-purify.client.util.ts` | DOMPurify wrapper for browser context (`"use client"`) |
| `dom-purifier.server.util.ts` | DOMPurify + jsdom wrapper for server-side sanitisation (SSR/API routes) |

---

## `utils/affinda/affinda.config.ts`

Affinda AI document parser configuration. Contains the API base URL, authentication token reference, and extractor model ID used for processing uploaded documents (invoices, bills, receipts) in the AI data import flow.
