# Supplier Material Mapping - Implementation Plan

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites](#prerequisites)
3. [Architecture & Data Flow](#architecture--data-flow)
4. [Implementation Phases](#implementation-phases)
   - [Phase 1: Database & GraphQL Layer](#phase-1-database--graphql-layer)
   - [Phase 2: Constants, Interfaces & Validation Schemas](#phase-2-constants-interfaces--validation-schemas)
   - [Phase 3: Service Layer](#phase-3-service-layer)
   - [Phase 4: API Routes](#phase-4-api-routes)
   - [Phase 5: UI Components](#phase-5-ui-components)
   - [Phase 6: Embed Page & Window Messages](#phase-6-embed-page--window-messages)
   - [Phase 7: Audit Logging](#phase-7-audit-logging)
5. [File Manifest](#file-manifest)
6. [Key Design Decisions](#key-design-decisions)
7. [Reference Patterns](#reference-patterns)
8. [Testing Checklist](#testing-checklist)

---

## Overview

The Supplier Material Mapping feature allows Supply Chain Admins to create, edit, and delete mappings between suppliers and materials with active date periods. Unlike the Product Master or Supplier Master features (which use a side-panel form for add/edit), this feature uses an **inline-editable table** pattern where rows are edited directly in the table.

**Key Differences from Product/Supplier Master:**

| Aspect | Product/Supplier Master | Supplier Material Mapping |
|--------|------------------------|--------------------------|
| Add/Edit UI | Side-panel form (separate embed page) | Inline row editing in the table |
| Data entry | One record at a time via form | Add new row directly in table |
| Fields | Text inputs, creatable selects | Searchable select dropdowns, month/year pickers |
| Bulk upload | Excel upload support | Not required |
| Delete | Not supported (soft delete via is_deleted) | Supported with confirmation dialog |
| Embed pages | 2 pages (listing + form) | 1 page (listing with inline editing) |

---

## Prerequisites

Before implementation, ensure the following exists in Hasura:

### Hasura Table: `SupplierMaterialMapping`

> **NOTE:** This table does NOT currently exist in the Hasura GraphQL schema. It must be created in PostgreSQL and tracked in Hasura before any GraphQL operations can be generated.

**Expected Schema:**

```sql
CREATE TABLE "SupplierMaterialMapping" (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES "Organization"(id),
  supplier_id     UUID NOT NULL REFERENCES "OrgSupplierMaster"(id),
  material_id     UUID NOT NULL REFERENCES "OrgMaterialMaster"(id),
  from_date       TIMESTAMPTZ NOT NULL,        -- Start of active period (month/year)
  to_date         TIMESTAMPTZ NOT NULL,         -- End of active period (month/year)
  metadata        JSONB,
  is_deleted      BOOLEAN NOT NULL DEFAULT false,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by      UUID REFERENCES "AppUser"(id),
  updated_by      UUID REFERENCES "AppUser"(id)
);

-- Unique constraint to prevent duplicate mappings
CREATE UNIQUE INDEX idx_supplier_material_mapping_unique
  ON "SupplierMaterialMapping" (organization_id, supplier_id, material_id, from_date, to_date)
  WHERE is_deleted = false;
```

**Hasura Relationships to configure:**

- `SupplierMaterialMapping.OrgSupplierMaster` → object relationship to `OrgSupplierMaster` via `supplier_id`
- `SupplierMaterialMapping.OrgMaterialMaster` → object relationship to `OrgMaterialMaster` via `material_id`
- `SupplierMaterialMapping.Organization` → object relationship to `Organization` via `organization_id`
- `SupplierMaterialMapping.AppUser` (created_by) → object relationship to `AppUser` via `created_by`
- `SupplierMaterialMapping.appUserByUpdatedBy` → object relationship to `AppUser` via `updated_by`

**Hasura Permissions:**

- Select/Insert/Update/Delete for role `organization_admin` with filter `{ organization_id: { _eq: "x-hasura-org-id" } }`

After table creation and Hasura tracking, run `yarn codegen` to generate TypeScript types.

---

## Architecture & Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│  Parent SPA                                                      │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  iframe: supplier-material-mapping (embed page)            │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │  Page Title + "ADD DATA" Button                      │  │  │
│  │  │  Record Count Badge ("All (N)")                      │  │  │
│  │  ├─────────────────────────────────────────────────────┤  │  │
│  │  │  Inline Editable Table (mantine-react-table)         │  │  │
│  │  │  ┌──────┬────────┬──────────┬──────┬──────┬───────┐ │  │  │
│  │  │  │  SN  │From    │To        │Suppl.│Mater.│Actions│ │  │  │
│  │  │  │      │Date    │Date      │Name  │Name  │ ✏️ 🗑️ │ │  │  │
│  │  │  ├──────┼────────┼──────────┼──────┼──────┼───────┤ │  │  │
│  │  │  │  1   │Jan 2026│Mar 2026  │ABC   │Steel │ ✏️ 🗑️ │ │  │  │
│  │  │  │  [+] │[picker]│[picker]  │[sel] │[sel] │ 💾 ❌ │ │  │  │
│  │  │  └──────┴────────┴──────────┴──────┴──────┴───────┘ │  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                  │
│  postMessage ↕ (delete confirmation, refresh)                    │
└─────────────────────────────────────────────────────────────────┘

API Layer:
  GET  /api/v1/master-data/supplier-material-mapping/listing   → Paginated list
  GET  /api/v1/master-data/supplier-material-mapping/form      → Fetch dropdown data (suppliers, materials)
  POST /api/v1/master-data/supplier-material-mapping/form      → Create mapping
  PUT  /api/v1/master-data/supplier-material-mapping/form      → Update mapping
  DELETE /api/v1/master-data/supplier-material-mapping/form     → Soft-delete mapping
  GET  /api/v1/master-data/supplier-material-mapping/counts    → Total record count
```

---

## Implementation Phases

### Phase 1: Database & GraphQL Layer

#### 1.1 Create Hasura Table

Create the `SupplierMaterialMapping` table in PostgreSQL, track it in Hasura, configure relationships and permissions as described in [Prerequisites](#prerequisites).

#### 1.2 GraphQL Queries (new files)

**`graphql/queries/get-supplier-material-mapping-list.gql`**

Paginated listing with relationships resolved for display:

```graphql
query getSupplierMaterialMappingList(
  $where: SupplierMaterialMapping_bool_exp
  $order_by: [SupplierMaterialMapping_order_by!]
  $limit: Int
  $offset: Int
) {
  SupplierMaterialMapping(
    where: $where
    order_by: $order_by
    limit: $limit
    offset: $offset
  ) {
    id
    supplier_id
    material_id
    from_date
    to_date
    created_at
    updated_at
    OrgSupplierMaster {
      id
      name
      code
    }
    OrgMaterialMaster {
      id
      name
      code
      type
    }
  }
  SupplierMaterialMapping_aggregate(where: $where) {
    aggregate {
      count
    }
  }
}
```

**`graphql/queries/get-supplier-material-mapping-by-id.gql`**

Fetch single mapping by ID for edit pre-population:

```graphql
query getSupplierMaterialMappingById(
  $id: uuid!
  $organizationId: uuid!
) {
  SupplierMaterialMapping(
    where: {
      id: { _eq: $id }
      organization_id: { _eq: $organizationId }
      is_deleted: { _eq: false }
    }
  ) {
    id
    supplier_id
    material_id
    from_date
    to_date
    organization_id
    OrgSupplierMaster {
      id
      name
      code
    }
    OrgMaterialMaster {
      id
      name
      code
      type
    }
  }
}
```

**`graphql/queries/get-suppliers-for-mapping-dropdown.gql`**

Fetch all active suppliers for dropdown (searchable):

```graphql
query getSuppliersForMappingDropdown($organizationId: uuid!) {
  OrgSupplierMaster(
    where: {
      organization_id: { _eq: $organizationId }
      is_deleted: { _eq: false }
    }
    order_by: { name: asc }
  ) {
    id
    name
    code
  }
}
```

**`graphql/queries/get-materials-for-mapping-dropdown.gql`**

Fetch all active materials for dropdown (searchable):

```graphql
query getMaterialsForMappingDropdown($organizationId: uuid!) {
  OrgMaterialMaster(
    where: {
      organization_id: { _eq: $organizationId }
      is_deleted: { _eq: false }
    }
    order_by: { name: asc }
  ) {
    id
    name
    code
    type
  }
}
```

**`graphql/queries/check-supplier-material-mapping-exists.gql`**

Duplicate check query:

```graphql
query checkSupplierMaterialMappingExists(
  $organizationId: uuid!
  $supplierId: uuid!
  $materialId: uuid!
  $fromDate: timestamptz!
  $toDate: timestamptz!
  $excludeId: uuid = "00000000-0000-0000-0000-000000000000"
) {
  SupplierMaterialMapping(
    where: {
      organization_id: { _eq: $organizationId }
      supplier_id: { _eq: $supplierId }
      material_id: { _eq: $materialId }
      from_date: { _eq: $fromDate }
      to_date: { _eq: $toDate }
      is_deleted: { _eq: false }
      id: { _neq: $excludeId }
    }
  ) {
    id
  }
}
```

#### 1.3 GraphQL Mutations (new files)

**`graphql/mutations/insert-supplier-material-mapping.gql`**

```graphql
mutation insertSupplierMaterialMapping(
  $object: SupplierMaterialMapping_insert_input!
) {
  insert_SupplierMaterialMapping_one(object: $object) {
    id
    supplier_id
    material_id
    from_date
    to_date
    created_at
  }
}
```

**`graphql/mutations/update-supplier-material-mapping.gql`**

```graphql
mutation updateSupplierMaterialMapping(
  $id: uuid!
  $set: SupplierMaterialMapping_set_input!
) {
  update_SupplierMaterialMapping_by_pk(
    pk_columns: { id: $id }
    _set: $set
  ) {
    id
    supplier_id
    material_id
    from_date
    to_date
    updated_at
  }
}
```

**`graphql/mutations/soft-delete-supplier-material-mapping.gql`**

```graphql
mutation softDeleteSupplierMaterialMapping($id: uuid!, $updatedBy: uuid!) {
  update_SupplierMaterialMapping_by_pk(
    pk_columns: { id: $id }
    _set: { is_deleted: true, updated_by: $updatedBy }
  ) {
    id
    is_deleted
  }
}
```

#### 1.4 Run Codegen

```bash
yarn codegen
```

This regenerates `graphql/shared/types.ts`, `graphql/shared/sdk.ts`, and per-file `*.generated.tsx` hooks.

---

### Phase 2: Constants, Interfaces & Validation Schemas

**`lib/supplier-material-mapping/supplier-material-mapping.interface.ts`** (new)

```typescript
export interface ISupplierMaterialMapping {
  id: string;
  organization_id: string;
  supplier_id: string;
  material_id: string;
  from_date: string;      // ISO date string
  to_date: string;        // ISO date string
  metadata?: Record<string, any> | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string | null;
  updated_by?: string | null;
}

export interface ISupplierMaterialMappingRow {
  id: string;
  supplier_id: string;
  supplier_name: string;
  supplier_code: string;
  material_id: string;
  material_name: string;
  material_code: string;
  material_type: string;
  from_date: string;
  to_date: string;
  created_at: string;
}

export interface ISupplierOption {
  id: string;
  name: string;
  code: string;
}

export interface IMaterialOption {
  id: string;
  name: string;
  code: string;
  type: string;
}
```

**`schemas/supplier-material-mapping.schema.ts`** (new)

```typescript
import { z } from "zod";

export const SupplierMaterialMappingFormSchema = (isEdit: boolean) =>
  z
    .object({
      id: isEdit
        ? z.string().uuid("Invalid mapping ID")
        : z.string().uuid().optional(),
      supplier_id: z.string().uuid("Please select a supplier"),
      material_id: z.string().uuid("Please select a material"),
      from_date: z
        .string()
        .min(1, "Please select a reporting period")
        .refine((val) => !isNaN(Date.parse(val)), "Invalid start date"),
      to_date: z
        .string()
        .min(1, "Please select a reporting period")
        .refine((val) => !isNaN(Date.parse(val)), "Invalid end date"),
    })
    .refine(
      (data) => {
        if (data.from_date && data.to_date) {
          return new Date(data.to_date) >= new Date(data.from_date);
        }
        return true;
      },
      {
        message: "End date must be after start date",
        path: ["to_date"],
      }
    );

export type TSupplierMaterialMappingForm = z.infer<
  ReturnType<typeof SupplierMaterialMappingFormSchema>
>;
```

**`lib/supplier-material-mapping/supplier-material-mapping.validation.ts`** (new)

```typescript
import { SupplierMaterialMappingFormSchema } from "@/modules/ghg/schemas/supplier-material-mapping.schema";

export const validateSupplierMaterialMappingInput = (
  data: unknown,
  isEdit: boolean
) => {
  const schema = SupplierMaterialMappingFormSchema(isEdit);
  const result = schema.safeParse(data);

  if (!result.success) {
    const errors: Record<string, string[]> = {};
    result.error.errors.forEach((err) => {
      const path = err.path.join(".");
      if (!errors[path]) errors[path] = [];
      errors[path].push(err.message);
    });
    return { success: false, data: null, errors };
  }

  return { success: true, data: result.data, errors: null };
};
```

---

### Phase 3: Service Layer

**`lib/supplier-material-mapping/supplier-material-mapping.service.ts`** (new)

Core service functions mirroring the product master pattern:

```typescript
// Functions to implement:

GetSupplierMaterialMappingList(userSession, params)
  // - Builds Hasura where clause: { organization_id, is_deleted: false }
  // - Applies search filter across OrgSupplierMaster.name, OrgMaterialMaster.name
  // - Default sort: created_at desc
  // - Returns paginated data with supplier/material names resolved
  // - Returns totalCount from aggregate

GetSupplierMaterialMappingById(id, organizationId)
  // - Fetches single mapping by pk
  // - Validates organization ownership

GetDropdownData(organizationId)
  // - Fetches active suppliers via getSuppliersForMappingDropdown
  // - Fetches active materials via getMaterialsForMappingDropdown
  // - Returns { suppliers: ISupplierOption[], materials: IMaterialOption[] }

CheckMappingExists(supplierId, materialId, fromDate, toDate, organizationId, excludeId?)
  // - Uses checkSupplierMaterialMappingExists query
  // - Returns boolean

SaveSupplierMaterialMapping(data, userSession)
  // - Calls insertSupplierMaterialMapping mutation
  // - Sets organization_id, created_by, updated_by from userSession

UpdateSupplierMaterialMapping(data, userSession)
  // - Calls updateSupplierMaterialMapping mutation
  // - Sets updated_by from userSession

DeleteSupplierMaterialMapping(id, userSession)
  // - Calls softDeleteSupplierMaterialMapping mutation
  // - Sets updated_by from userSession
  // - Optional: Check if mapping is in use before deleting

GetMappingCount(organizationId)
  // - Returns total count of non-deleted mappings
```

---

### Phase 4: API Routes

All routes follow the existing guard pattern:

```typescript
export const GET = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(handler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
```

#### 4.1 Listing Route

**`app/api/v1/master-data/supplier-material-mapping/listing/route.ts`** (new)

```
GET /api/v1/master-data/supplier-material-mapping/listing
  Query params: pageIndex, pageSize, search, sortBy, sortOrder
  Auth: isOrganizationAdmin check
  Service: GetSupplierMaterialMappingList()
  Response: { success, data: ISupplierMaterialMappingRow[], totalCount }
  Note: ISupplierMaterialMappingRow includes material_type resolved from OrgMaterialMaster relationship
```

#### 4.2 Form Route (CRUD)

**`app/api/v1/master-data/supplier-material-mapping/form/route.ts`** (new)

```
GET /api/v1/master-data/supplier-material-mapping/form
  Query params:
    - action=dropdown-data → returns { suppliers, materials }
    - id={uuid} → returns single mapping by ID
  Auth: isOrganizationAdmin check

POST /api/v1/master-data/supplier-material-mapping/form
  Body: { supplier_id, material_id, from_date, to_date }
  Auth: isOrganizationAdmin check
  Validation: validateSupplierMaterialMappingInput(body, false)
  Duplicate check: CheckMappingExists()
  Service: SaveSupplierMaterialMapping()
  Response: { success, data }

PUT /api/v1/master-data/supplier-material-mapping/form
  Body: { id, supplier_id, material_id, from_date, to_date }
  Auth: isOrganizationAdmin check
  Validation: validateSupplierMaterialMappingInput(body, true)
  Existence check: GetSupplierMaterialMappingById() — verify record exists
  Duplicate check: CheckMappingExists(excludeId)
  Service: UpdateSupplierMaterialMapping()
  Response: { success, data }

DELETE /api/v1/master-data/supplier-material-mapping/form
  Body: { id }
  Auth: isOrganizationAdmin check
  Validation: Verify ID is a valid UUID
  Existence check: Verify record exists and belongs to the organization
  In-use check: Check if mapping is referenced by active reports or purchase orders
    If in-use: Return 400 { success: false, message: "Cannot delete - this mapping is currently in use" }
    If not found: Return 404 { success: false, message: "Mapping not found or already deleted" }
  Service: DeleteSupplierMaterialMapping() (soft-delete)
  Response: { success: true, message: "Mapping deleted successfully" }
  Error: { success: false, message: "Delete failed. Please try again" }
```

#### 4.3 Counts Route

**`app/api/v1/master-data/supplier-material-mapping/counts/route.ts`** (new)

```
GET /api/v1/master-data/supplier-material-mapping/counts
  Auth: isOrganizationAdmin check
  Service: GetMappingCount()
  Response: { success, totalCount }
```

---

### Phase 5: UI Components

#### 5.1 Listing Table Component

**`components/supplier-material-mapping/supplierMaterialMappingTable.tsx`** (new)

This is the **core component** — an inline-editable table using `mantine-react-table`.

**Reference pattern:** `app/admin/(features)/uom-conversion/` (simpler inline editing) and `features/manual-data-entry/Common/ManualEntryTable.tsx` (comprehensive inline editing).

**Key Configuration:**

```typescript
const table = useMantineReactTable({
  columns,
  data: mappingData,
  createDisplayMode: "row",       // New row appears inline
  editDisplayMode: "row",         // Edit happens inline
  enableEditing: true,
  enableRowActions: true,
  positionActionsColumn: "last",

  // Callbacks
  onCreatingRowSave: handleCreateMapping,
  onCreatingRowCancel: handleCancelCreate,
  onEditingRowSave: handleEditMapping,
  onEditingRowCancel: handleCancelEdit,

  // Manual server-side pagination/sorting
  manualPagination: true,
  manualSorting: true,
  rowCount: totalCount,
  state: { pagination, sorting, isLoading, globalFilter },

  // Row actions: Edit + Delete icons
  renderRowActions: ({ row, table }) => (
    <Flex gap="xs">
      <ActionIcon onClick={() => table.setEditingRow(row)}>
        <IconEdit size={18} />
      </ActionIcon>
      <ActionIcon color="red" onClick={() => handleDeleteClick(row)}>
        <IconTrash size={18} />
      </ActionIcon>
    </Flex>
  ),
});
```

**Column Definitions:**

| Column | accessorKey | Type | Edit Mode |
|--------|------------|------|-----------|
| SN | (row index) | Computed | Read-only |
| From Date | `from_date` | MonthPickerInput | `editVariant: "custom"` with Mantine `MonthPickerInput` |
| To Date | `to_date` | MonthPickerInput | `editVariant: "custom"` with Mantine `MonthPickerInput` |
| Supplier Name | `supplier_name` | Display text | `editVariant: "select"` with searchable dropdown |
| Material Name | `material_name` | Display text | `editVariant: "select"` with searchable dropdown |
| Actions | — | Edit + Delete icons | Save + Cancel icons when editing |

**Date Picker:** Use Mantine `MonthPickerInput` component for month/year selection. Display format: "MMM YYYY" (e.g., "Jan 2026"). Store as ISO date string (first day of selected month).

**Searchable Select Dropdowns:**

- Supplier dropdown: Uses `mantineEditSelectProps` with `searchable: true`, data fetched from `GET /form?action=dropdown-data`
- Material dropdown: Uses `mantineEditSelectProps` with `searchable: true`, same data source
- Truncate long names with ellipsis in dropdown; show full name on hover via Mantine `Tooltip`

**Validation in Edit Mode:**

- Managed via `useState<Record<string, string | undefined>>` for field-level errors
- Zod validation on save (client-side)
- Duplicate check via API call before save
- Errors displayed inline in edit cells via `error` prop on each edit component

**"ADD DATA" Button Behavior:**

> **Single-row editing constraint:** `mantine-react-table` supports only one row in edit/create mode at a time. If the user clicks "ADD DATA" while already creating or editing a row, the button does nothing. The user must save or cancel the current row before adding a new one. This aligns with the `ManualEntryTable` pattern in the codebase. If an existing creating row has no values filled, it is discarded before opening a new one.

```typescript
const handleAddData = () => {
  // Prevent multiple creating rows - only one at a time
  if (table.getState().creatingRow || table.getState().editingRow) return;
  table.setCreatingRow(true);
};
```

**Delete Flow:**

1. Click delete icon → send `confirmDeleteSupplierMaterialMapping` message to parent SPA (includes mappingId, supplierName, materialName, fromDate, toDate for display in dialog)
2. Parent SPA shows confirmation dialog ("Are you sure you want to delete the mapping for **Supplier** → **Material** (From – To)? This cannot be undone.")
3. Parent SPA sends `confirm-delete-response` message back to iframe with `{ confirmed: true/false, mappingId }`
4. If confirmed, iframe calls `DELETE /api/v1/master-data/supplier-material-mapping/form` with `{ id: mappingId }`
5. On success: remove row, update count, send `supplierMaterialMappingDataChanged(false)` to parent for success notification
6. On failure: row remains, send `supplierMaterialMappingDataChanged(true)` to parent for error notification

**Empty State:** When `rowCount === 0` and no search is active, show empty state with illustration and "Add Your First Mapping" message with "ADD DATA" button.

**Listening for Parent Messages:**

```typescript
useEffect(() => {
  const handler = (event: MessageEvent) => {
    try {
      const message = JSON.parse(event.data);
      if (message.type === "callApi" || message.type === "refresh-supplier-material-mapping") {
        refetchData();
      }
      if (message.type === "confirm-delete-response" && message.data?.confirmed) {
        executeDelete(message.data.mappingId);
      }
    } catch {}
  };
  window.addEventListener("message", handler);
  return () => window.removeEventListener("message", handler);
}, []);
```

#### 5.2 Empty State Component

**`components/supplier-material-mapping/supplierMaterialMappingEmptyState.tsx`** (new)

- Empty state illustration (reuse existing empty state pattern)
- Title: "Add Supplier Material Mappings"
- Description: "Click Add Data to create a new supplier-material mapping with active date periods."
- "ADD DATA" primary button → triggers `table.setCreatingRow(true)` (callback prop)

---

### Phase 6: Embed Page & Window Messages

#### 6.1 Embed Page

**`app/[organizationId]/embed/v1/[accessToken]/supplier-material-mapping/page.tsx`** (new)

Single page layout (no tabs needed, no upload history):

```
┌──────────────────────────────────────────────────────────────┐
│  [Supplier Material Mapping]  (title, 22px)    [ADD DATA]    │
├──────────────────────────────────────────────────────────────┤
│  Badge: "All (N)"                              [Search...]   │
├──────────────────────────────────────────────────────────────┤
│  <SupplierMaterialMappingTable />                            │
└──────────────────────────────────────────────────────────────┘
```

```typescript
"use client";

export default function SupplierMaterialMappingPage() {
  return (
    <Stack>
      <Flex justify="space-between" align="center">
        <Text size="22px" fw={600}>Supplier Material Mapping</Text>
        <Button onClick={handleAddData}>ADD DATA</Button>
      </Flex>
      <SupplierMaterialMappingTable />
    </Stack>
  );
}
```

#### 6.2 Window Messages

**Add to `shared/services/platform-window-message-service.ts`:**

```typescript
// Delete confirmation request (FROM iframe TO parent SPA)
export const confirmDeleteSupplierMaterialMapping = (
  params: Record<string, any>
) =>
  JSON.stringify({
    type: "confirm-delete-supplier-material-mapping",
    data: { ...params },
  });

// Data changed notification (FROM iframe TO parent SPA)
export const supplierMaterialMappingDataChanged = (isFailed: boolean) =>
  JSON.stringify({
    type: "supplier-material-mapping-data-changed",
    isFailed,
  });
```

**Messages FROM Parent SPA TO Iframe:**

| Message Type | When Sent | Behavior |
|-------------|-----------|----------|
| `refresh-supplier-material-mapping` | After parent confirms an action | Table re-fetches data |
| `confirm-delete-response` | After user confirms/cancels delete dialog | If confirmed, iframe executes delete |

---

### Phase 7: Audit Logging

**Append to `lib/auditlog/auditlog.service.ts`:**

```typescript
export const saveSupplierMaterialMapping = async (
  data: any[],
  userSession: TUserSession
) => {
  // Insert to ClickHouse: snowkap_op_logs.SupplierMaterialMapping
  // Fields: id, organization_id, supplier_id, material_id,
  //         from_date, to_date, metadata, is_deleted,
  //         created_at, updated_at, created_by, updated_by
};
```

Call this after successful create, update, and delete operations in the API routes.

---

## File Manifest

### New Files

| # | File Path | Purpose |
|---|-----------|---------|
| 1 | `graphql/queries/get-supplier-material-mapping-list.gql` | Paginated listing query |
| 2 | `graphql/queries/get-supplier-material-mapping-by-id.gql` | Fetch single mapping |
| 3 | `graphql/queries/get-suppliers-for-mapping-dropdown.gql` | Supplier dropdown data |
| 4 | `graphql/queries/get-materials-for-mapping-dropdown.gql` | Material dropdown data |
| 5 | `graphql/queries/check-supplier-material-mapping-exists.gql` | Duplicate check |
| 6 | `graphql/mutations/insert-supplier-material-mapping.gql` | Insert mutation |
| 7 | `graphql/mutations/update-supplier-material-mapping.gql` | Update mutation |
| 8 | `graphql/mutations/soft-delete-supplier-material-mapping.gql` | Soft-delete mutation |
| 9 | `lib/supplier-material-mapping/supplier-material-mapping.interface.ts` | TypeScript interfaces |
| 10 | `lib/supplier-material-mapping/supplier-material-mapping.service.ts` | Core service layer |
| 11 | `lib/supplier-material-mapping/supplier-material-mapping.validation.ts` | Zod validation wrapper |
| 12 | `schemas/supplier-material-mapping.schema.ts` | Zod schema definitions |
| 13 | `app/api/v1/master-data/supplier-material-mapping/listing/route.ts` | Listing API route |
| 14 | `app/api/v1/master-data/supplier-material-mapping/form/route.ts` | CRUD API route (GET/POST/PUT/DELETE) |
| 15 | `app/api/v1/master-data/supplier-material-mapping/counts/route.ts` | Count API route |
| 16 | `components/supplier-material-mapping/supplierMaterialMappingTable.tsx` | Inline-editable table component |
| 17 | `components/supplier-material-mapping/supplierMaterialMappingEmptyState.tsx` | Empty state component |
| 18 | `app/[organizationId]/embed/v1/[accessToken]/supplier-material-mapping/page.tsx` | Embed page |

### Modified Files

| # | File Path | Change |
|---|-----------|--------|
| 1 | `shared/services/platform-window-message-service.ts` | Add delete confirmation + data changed messages |
| 2 | `lib/auditlog/auditlog.service.ts` | Add `saveSupplierMaterialMapping()` function |

### Auto-Generated Files (via `yarn codegen`)

| # | File Path |
|---|-----------|
| 1 | `graphql/shared/types.ts` (updated with SupplierMaterialMapping types) |
| 2 | `graphql/shared/sdk.ts` (updated with new query/mutation functions) |
| 3 | `graphql/queries/get-supplier-material-mapping-list.generated.tsx` |
| 4 | `graphql/queries/get-supplier-material-mapping-by-id.generated.tsx` |
| 5 | `graphql/queries/get-suppliers-for-mapping-dropdown.generated.tsx` |
| 6 | `graphql/queries/get-materials-for-mapping-dropdown.generated.tsx` |
| 7 | `graphql/queries/check-supplier-material-mapping-exists.generated.tsx` |
| 8 | `graphql/mutations/insert-supplier-material-mapping.generated.tsx` |
| 9 | `graphql/mutations/update-supplier-material-mapping.generated.tsx` |
| 10 | `graphql/mutations/soft-delete-supplier-material-mapping.generated.tsx` |

**Total: 18 new files + 2 modified files + 10 auto-generated files = 30 files**

---

## Key Design Decisions

### 1. Inline Editing vs Side-Panel Form

**Decision:** Use inline row editing (`editDisplayMode: "row"` in mantine-react-table).

**Rationale:**
- Requirements specify adding rows directly in the table (not opening a separate form)
- Only 4 fields per row (from_date, to_date, supplier, material) — lightweight enough for inline editing
- Matches the UOM Conversion and Manual Data Entry patterns already in the codebase
- No need for a second embed page (add-supplier-material-mapping), simplifying the integration

### 2. Month/Year Picker (Not Full Date)

**Decision:** Use Mantine `MonthPickerInput` for date fields.

**Rationale:**
- Requirements say "pick any valid month & year" and display as "Jan 2026"
- Store as first day of month (e.g., `2026-01-01T00:00:00Z`) for consistency
- "Same month" is valid (from_date === to_date when same month selected)

### 3. Soft Delete with Confirmation via Parent SPA

**Decision:** Soft-delete (set `is_deleted = true`) with confirmation dialog handled by parent SPA.

**Rationale:**
- Matches existing `confirmDeleteFormEntry` pattern in the codebase
- Parent SPA manages the confirmation dialog UI (consistent with other features)
- Soft delete preserves audit trail and allows recovery if needed

### 4. No Bulk Upload

**Decision:** No Excel bulk upload for this feature.

**Rationale:**
- Not mentioned in requirements
- Mapping data typically entered one-at-a-time or in small batches
- Inline editing with "ADD DATA" covers the batch creation use case

### 5. Single Embed Page (No Tabs)

**Decision:** One embed page with just the table (no Upload History tab).

**Rationale:**
- No bulk upload = no upload history to show
- Simpler integration for parent SPA (one iframe, no tabs)

### 6. Dropdown Data Fetched Once

**Decision:** Fetch supplier and material dropdown options once when the page loads (or when entering edit mode), not per-keystroke.

**Rationale:**
- `OrgSupplierMaster` and `OrgMaterialMaster` are relatively stable datasets
- Client-side filtering (`searchable: true` in Mantine Select) handles the search requirement
- Reduces API calls; for 500+ suppliers, the initial load is still fast via GraphQL

### 7. Duplicate Check: API-Side

**Decision:** Duplicate check (same supplier + material + dates) is performed server-side before insert/update.

**Rationale:**
- Client-side check could miss concurrent writes
- Uses `checkSupplierMaterialMappingExists` GraphQL query with `excludeId` for edit case
- Returns clear error: "This mapping already exists"

---

## Reference Patterns

| Pattern | Reference File | What to Reuse |
|---------|---------------|---------------|
| Inline row editing config | `app/admin/(features)/uom-conversion/hooks/use-data-table.tsx` | `createDisplayMode: "row"`, `editDisplayMode: "row"`, validation errors in state, Zod schema validation on save |
| Inline editing with multiple field types | `features/manual-data-entry/Common/ManualEntryTable.tsx` | Custom edit components for select/date fields, row-level save/cancel, prevent multiple rows editing simultaneously |
| API route guard pattern | `app/api/v1/master-data/org-product-master/listing/route.ts` | `apiExceptionGuard(withRateLimit(apiAuthGuard(handler)))` |
| Service layer pattern | `lib/product-master/product-master-form.service.ts` | Service functions calling `getGraphQlServerSDK()`, error handling, pagination |
| Zod validation pattern | `schemas/product-master.schema.ts` | Schema factory with `isEdit` parameter, UUID validation, string transforms |
| Window message pattern | `shared/services/platform-window-message-service.ts` | `confirmDeleteFormEntry` for delete confirmation flow |
| Delete confirmation flow | `shared/services/platform-window-message-service.ts` → `confirmDeleteFormEntry` | Message to parent SPA requesting confirmation, parent sends response back |
| Empty state component | `components/product-master/productMasterEmptyState.tsx` | Illustration + title + description + action button layout |
| Embed page layout | `app/[organizationId]/embed/v1/[accessToken]/product-master-list/page.tsx` | Title + action button layout, `"use client"` directive |
| Searchable select dropdown | `app/admin/(features)/uom-conversion/hooks/use-data-table.tsx` | `editVariant: "select"`, `mantineEditSelectProps: { searchable: true, data: [...] }` |
| Audit logging | `lib/auditlog/auditlog.service.ts` → `saveOrgProductMaster` | ClickHouse insert pattern for audit trail |

---

## Testing Checklist

### CRUD Operations

- [ ] ADD DATA creates a new editable row at the top of the table
- [ ] Clicking ADD DATA rapidly only creates one row
- [ ] Save with all fields filled succeeds and shows success message
- [ ] Record count increases by 1 after save
- [ ] Empty rows are discarded (not saved) when clicking save
- [ ] Edit icon makes row editable with pre-filled values
- [ ] Edit save updates row and returns to read-only mode
- [ ] Record count stays the same after edit
- [ ] Delete icon sends confirmation message to parent SPA (never deletes immediately)
- [ ] Confirming delete removes row and decreases count
- [ ] "Mapping deleted successfully" notification appears on success
- [ ] Delete blocked for in-use mappings with message "Cannot delete - this mapping is currently in use"
- [ ] Delete failure shows "Delete failed. Please try again" and row remains in list

### Validation

- [ ] Save without supplier shows "Please select a supplier"
- [ ] Save without material shows "Please select a material"
- [ ] Save without dates shows "Please select a reporting period"
- [ ] To date before From date shows "End date must be after start date"
- [ ] Same month From/To accepted as valid
- [ ] Duplicate mapping shows "This mapping already exists"
- [ ] Cross-year date ranges (Dec 2025 to Feb 2026) save correctly

### Dropdowns

- [ ] Supplier dropdown opens with search box
- [ ] Typing filters supplier list
- [ ] 500+ suppliers search performs without freezing
- [ ] Material dropdown opens with search box
- [ ] Deactivated materials do not appear
- [ ] Long material names truncated with "..." and show full on hover
- [ ] Escape key closes dropdown without selecting
- [ ] Failed API load shows "Could not load suppliers/materials. Please try again"

### Date Picker

- [ ] Clicking From date opens month/year picker
- [ ] Clicking To date opens month/year picker
- [ ] Selected date shows as "Jan 2026" format
- [ ] X button clears date
- [ ] Saved dates persist on page reload

### Edge Cases

- [ ] Editing near bottom of list keeps row visible
- [ ] Unsaved changes prompt on page leave
- [ ] Network error during save shows error, retains values
- [ ] Record deleted by another user shows appropriate message
- [ ] Multiple rows added but only filled ones save
- [ ] One invalid row doesn't block saving other valid rows

### Integration

- [ ] Embed page loads in parent SPA iframe
- [ ] Delete confirmation message sent to parent SPA
- [ ] Parent SPA confirmation triggers actual delete
- [ ] Refresh message from parent re-fetches data
- [ ] Role check: non-admin sees disabled action buttons
