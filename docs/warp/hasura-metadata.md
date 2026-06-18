# WARP Hasura Metadata

Hasura version: v2.10.0 (from docker-compose image tag).
Metadata format: version 3 (from `metadata/version.yaml`).
Hasura endpoint: `https://e9jbguzixb.us-west-2.awsapprunner.com`

---

## Actions

**No custom Hasura Actions are defined.** `actions.yaml` contains:

```yaml
actions: []
custom_types:
  enums: []
  input_objects: []
  objects: []
  scalars: []
```

All business logic is implemented in Next.js API routes (`apps/web/pages/api/`), not as Hasura Actions. The Hasura `actions.yaml` handler base URL is set to `http://localhost:3000`, which is the local dev server.

---

## Remote Schemas

None configured. `remote_schemas.yaml` is empty (`[]`).

---

## REST Endpoints

None configured. `rest_endpoints.yaml` is empty (`[]`).

---

## Cron Triggers

None configured in Hasura. `cron_triggers.yaml` is empty (`[]`).

Recurring email tasks (reviewer pending reminders, recommendation reminders, document expiry notifications) are implemented as Next.js API routes called by an external scheduler (not tracked in this repository):
- `GET /api/reviewer-pending-emails-cron`
- `GET /api/recommendation/reminder/recommendation-reminder-pre-duedate`
- `GET /api/recommendation/reminder/recommendation-reminder-post-duedate`
- `POST /api/webhooks/document-expiry-notifications`

---

## Allow List

`allow_list.yaml` and `query_collections.yaml` are present but contents not inspected (likely auto-generated from codegen).

---

## Event Triggers

### User Table Triggers

All three DML operations fire to the same webhook with the same auth header.

| Trigger name | Table | Operation | Webhook |
|---|---|---|---|
| `ManageUser_Insert` | `User` | INSERT | `https://alphams.snowkap.com/api/warp/webhook/user/manage` |
| `ManageUser_Update` | `User` | UPDATE | `https://alphams.snowkap.com/api/warp/webhook/user/manage` |
| `ManageUser_Delete` | `User` | DELETE | `https://alphams.snowkap.com/api/warp/webhook/user/manage` |

Headers: `Authorization: EzqUt3IXQxidMdRA`, `Content-Type: application/json`
Body transform (Kriti): `{{$body.event}}` — sends only the `event` portion of the Hasura event payload.
Retry: 0 retries, 60 second timeout.

### Company Table Trigger

| Trigger name | Table | Operations | Webhook |
|---|---|---|---|
| `ManageCompany` | `Company` | INSERT, UPDATE, DELETE | `https://alphams.snowkap.com/api/warp/webhook/company/manage` |

Same headers and body transform as User triggers.

**Purpose**: Keeps the Snowkap AI microservice's user and company registry in sync with WARP's database. Whenever a user or company is created, updated, or deleted in WARP, the AI service at `alphams.snowkap.com` is notified immediately.

[QA] The `Authorization` header value `EzqUt3IXQxidMdRA` is a hardcoded shared secret in the metadata YAML file (checked into source control). This should be moved to a Hasura secret/env var.

---

## Computed Fields

Computed fields translate PostgreSQL `text[]` columns (which don't map cleanly to GraphQL) into JSONB:

| Table | Computed field | SQL function | Purpose |
|---|---|---|---|
| `Form` | `json_tags` | `fn_parse_form_tags_to_jsonb(form_row Form)` | Returns `tags text[]` as JSONB |
| `Platform` | `json_origin` | `fn_parse_platform_origin_to_jsonb(form_row Platform)` | Returns `origin text[]` as JSONB |
| `Question` | `json_tags` | `fn_parse_question_tags_to_jsonb(data Question)` | Returns `tags text[]` as JSONB |
| `Section` | `json_tags` | `fn_parse_section_tags_to_jsonb(data Section)` | Returns `tags text[]` as JSONB |

All functions are `LANGUAGE sql STABLE`.

---

## Permissions Per Table Per Role

The six application roles are: **Platform**, **Creator**, **Inviter**, **Invitee**, **Approver**, **Analytics**.

The permission model enforces row-level multi-tenancy using JWT session variables:
- `x-hasura-platform-id` — the tenant
- `x-hasura-company-id` — the user's company
- `X-Hasura-User-Id` — the user themselves

### Answer

| Role | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Platform | platform-scoped via CompanyForms path | — | — | — |
| Creator | unrestricted (`filter: {}`) | — | — | — |
| Inviter | child companies of their company, active submissions only | — | — | — |
| Invitee | own company's active submissions only | own company's active submissions | own company's active submissions (columns: data, status, updated_at, updated_by); auto-sets `updated_by` | — |
| Approver | child companies of their company, active submissions | child company, active submission | child company, active submission (columns: data, status, updated_at, updated_by) | — |
| Analytics | platform-scoped | — | — | — |

Note: `Invitee` update permission auto-sets `updated_by: x-hasura-User-Id`.

### Company

| Role | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Platform | `platformId = x-hasura-platform-id` | — | `platformId = x-hasura-platform-id` (all columns) | — |
| Creator | `id = x-hasura-company-id` (own company only) | — | — | — |
| Inviter | own company OR child companies of their company | — | — | — |
| Invitee | own company only (plus platform-id check) | — | — | — |
| Approver | own company OR child companies | — | — | — |
| Analytics | `platformId = x-hasura-platform-id` | — | — | — |

Only `Platform` role can update Company rows.

### Form

| Role | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Platform | forms linked to their platform via CompanyForms | — | — | — |
| Creator | forms linked to active companies on their platform | forms on their platform | calc, description, name, tags, title, type | — |
| Inviter | forms linked to child companies on their platform | — | — | — |
| Invitee | forms linked to their own company | — | — | — |
| Approver | forms linked to child companies of their company | — | — | — |
| Analytics | platform-scoped | — | — | — |

### FormField

| Role | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Creator | all fields (via company platform) | form-field creation for their platform | display, displayOptions, displayRules, fieldOptions, interfaceOptions, seqIndex, type, validationRules | — |
| All other roles | select only (platform/company scoped) | — | — | — |

### FormInvitation

| Role | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Platform | platform-scoped | — | — | — |
| Creator | platform-scoped | — | — | — |
| Inviter | own + child companies, active only | child companies only, auto-sets `created_by` | own child companies (all columns) | — |
| Invitee | own company, active only | — | — | — |
| Approver | child companies, active only | — | — | — |
| Analytics | platform-scoped | — | — | — |

[QA] `Inviter` insert permission's `set.created_at` value is `x-hasura-` (incomplete — value is cut off in the YAML).

### FormSubmission

| Role | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Platform | platform-scoped (via approver's company) | — | — | — |
| Creator | platform-scoped | — | — | — |
| Inviter | child companies, active | — | — | — |
| Invitee | own company, active | own company, active | own company, active (approvedBy, invitationId, isActive, remarks, submittedBy, updated_at) | — |
| Approver | child companies, active | child companies, active | child companies, active; auto-sets `approvedBy: x-hasura-User-Id` | — |
| Analytics | platform-scoped | — | — | — |

### FormResult

Select-only for all roles. No insert/update/delete permissions defined — writes happen server-side via admin secret in the score calculation API route.

| Role | Filter |
|---|---|
| Analytics | no filter (all results) |
| Creator | forms linked to their platform |
| Inviter | forms linked to child companies of their company |
| Invitee | own company's active submissions |
| Approver | forms linked to child companies of their company |
| Platform | forms linked to their platform |

### Platform

Select-only for all roles. Only `Platform` role can update.

| Role | Filter | Limit | Aggregations |
|---|---|---|---|
| Platform | companies on their platform | 5 | yes |
| All other roles | platform-scoped | — | — |

### User

| Role | Select | Insert | Update | Delete |
|---|---|---|---|---|
| Analytics | own user row only | — | all columns (own row) | — |
| Platform | own user row | — | all columns (own row) | — |
| Creator, Inviter, Invitee, Approver | own user row (isActive must be true) | — | details, image, name, phone, updated_at, updated_by | — |

No role can delete User rows via GraphQL. Deletion must go through API routes (which call the admin SDK).

### UserRole

Select-only for all roles: users can only see their own `UserRole` rows (`userId = X-Hasura-User-Id`).

### GlobalMaster

Select-only for all roles, filtered to `platformId = x-hasura-platform-id`.

### FormDetails

| Role | Select | Insert | Update |
|---|---|---|---|
| Creator | platform-scoped | platform-scoped | platform-scoped |
| All other roles | company/platform-scoped | — | — |

### CompanyForm

No explicit permissions in metadata (inherits via relationships).

### GroupForm

No explicit permissions in metadata.

### AnswerFile, EmailTemplate, EmailConfiguration, EmailConfig

No explicit permissions defined in YAML (accessible only via admin secret / server-side routes).

---

## Inherited Roles

`inherited_roles.yaml` is present. Contents not inspected — likely defines role hierarchy for permission inheritance.

---

## GraphQL Schema Introspection

`graphql_schema_introspection.yaml` is present — likely controls which roles can introspect the full schema.

---

## API Limits

`api_limits.yaml` is present — may define rate limits or depth limits.

---

## Network Configuration

`network.yaml` is present — may define TLS or CORS settings.

---

## Database Connection

From `docker-compose.yaml`:
- Metadata DB: `postgres://postgres:postgrespassword@postgres:5432/postgres`
- Data source: same connection (default database)

Production connection string is set via environment variables on App Runner; not in the repository.
