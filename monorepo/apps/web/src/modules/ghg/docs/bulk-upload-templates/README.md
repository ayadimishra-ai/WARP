# Bulk Upload Template Documentation

This folder contains the client-facing documentation for the Excel `.xlsx` bulk upload templates used by the Snowkap Operations platform to capture activity data (energy, transport, waste, water, fugitive emissions, material procurement, HR, health & safety, governance, CSR, etc.).

## Contents

- [activity-validation-guide.md](activity-validation-guide.md) — comprehensive validation guide covering every activity template, every sheet, every column, every dropdown, and every cross-column rule.

## Audience

- **Data stewards / customer-side users** filling in upload templates
- **Implementation consultants** onboarding new customers
- **Support engineers** decoding upload errors
- **Internal engineering** maintaining validations

## How the documentation is sourced

The guide is hand-compiled from three sources of truth in the codebase:

| Source | What it provides |
| --- | --- |
| [shared/constants/activity.constant.ts](../../shared/constants/activity.constant.ts) | Sheet names, column headers, column codes, master_key → column bindings (`activityKey[]`) |
| [shared/constants/input.constant.ts](../../shared/constants/input.constant.ts) | The `ActivityMasterKey` map: which master_keys each activity consumes |
| `lib/organization-transaction/<activity>/<activity>.validation.ts` | Zod schemas, conditional rules, error messages |
| `ActivityMaster` Hasura table | The actual dropdown values (label, value, group, default_for_group) |

If you change validation logic, sheet structure, or master data, please update [activity-validation-guide.md](activity-validation-guide.md) in the same PR.
