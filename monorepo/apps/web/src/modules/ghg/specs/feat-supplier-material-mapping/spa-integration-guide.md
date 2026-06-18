# Supplier Material Mapping - SPA Integration Guide

## Table of Contents

1. [Overview](#overview)
2. [Embedded Page](#embedded-page)
3. [Window Messages Specification](#window-messages-specification)
   - [Messages FROM Embedded Page TO Parent SPA](#messages-from-embedded-page-to-parent-spa)
   - [Messages FROM Parent SPA TO Embedded Page](#messages-from-parent-spa-to-embedded-page)
4. [Complete Implementation Example](#complete-implementation-example)
   - [Vanilla JavaScript](#vanilla-javascript-implementation)
   - [React/TypeScript Implementation](#reacttypescript-implementation)
5. [Delete Confirmation Modal](#delete-confirmation-modal)
6. [Common Integration Patterns](#common-integration-patterns)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Business Rules](#business-rules)
9. [UI/UX Guidelines](#uiux-guidelines)
10. [Security Considerations](#security-considerations)
11. [Testing Checklist](#testing-checklist)
12. [Troubleshooting](#troubleshooting)
13. [Change Log](#change-log)

---

## Overview

**What This Guide Covers:**

This integration guide provides everything needed to integrate the Supplier Material Mapping feature into your parent SPA application:

- Complete window message protocol (4 message types)
- Delete confirmation modal implementation
- API endpoint specifications with request/response examples
- React/TypeScript and vanilla JavaScript examples
- Security best practices
- Testing checklist and troubleshooting guide

**Key Difference from Product/Supplier Master:**

Unlike Product Master or Supplier Master (which require **two iframes** — a listing page and a separate form page in a drawer), Supplier Material Mapping uses **a single iframe** with inline row editing. There is no separate form page, no drawer, and no bulk upload modal. The only parent SPA interaction beyond hosting the iframe is the **delete confirmation dialog**.

**Quick Start:**

1. Embed the [listing page](#embedded-page) in an iframe
2. Implement the [window message listener](#complete-implementation-example)
3. Create the [delete confirmation modal](#delete-confirmation-modal)
4. Test using the [testing checklist](#testing-checklist)

---

## Embedded Page

### Supplier Material Mapping Listing Page

**URL Pattern:**

```
/{organizationId}/embed/v1/{accessToken}/supplier-material-mapping
```

**Purpose:** Displays a single-page interface with:

- Page title "Supplier Material Mapping" (left-aligned)
- "ADD DATA" button (right-aligned) — adds a new editable row inline
- Record count badge (e.g., "All (45)")
- Searchable inline-editable table with pagination

**Layout:**

```
┌──────────────────────────────────────────────────────────────────┐
│  Supplier Material Mapping              [ADD DATA]               │
├──────────────────────────────────────────────────────────────────┤
│  All (45)                                        [Search...]     │
├──────┬──────────┬──────────┬─────────────┬────────────┬─────────┤
│  SN  │ From     │ To       │ Supplier    │ Material   │ Actions │
│      │ Date     │ Date     │ Name        │ Name       │         │
├──────┼──────────┼──────────┼─────────────┼────────────┼─────────┤
│  1   │ Jan 2026 │ Mar 2026 │ ABC Corp    │ Steel Rod  │  ✏️  🗑️ │
│  2   │ Feb 2026 │ Jun 2026 │ XYZ Ltd     │ Copper Wire│  ✏️  🗑️ │
│  ... │          │          │             │            │         │
└──────┴──────────┴──────────┴─────────────┴────────────┴─────────┘
│  < 1 2 3 >                               Rows per page: [10]    │
└──────────────────────────────────────────────────────────────────┘
```

**Inline Editing Behavior:**

- Clicking "ADD DATA" inserts a new editable row at the top with empty dropdowns and date pickers
- Clicking the edit (pencil) icon on any row makes that row editable in-place
- Each editable row shows Save and Cancel action icons instead of Edit and Delete
- Only one row can be in edit/create mode at a time

**Features:**

- Search across Supplier Name, Supplier Code, Material Name, Material Code
- Sort by any column (default: created_at descending)
- Pagination with configurable rows per page (10, 25, 50, 100)
- Searchable dropdowns for Supplier and Material selection
- Month/Year picker for From and To dates (displayed as "Jan 2026")
- Edit: inline row editing with validation
- Delete: triggers confirmation via parent SPA

---

## Window Messages Specification

### Messages FROM Embedded Page TO Parent SPA

#### 1. `confirm-delete-supplier-material-mapping`

Requests the parent SPA to show a delete confirmation dialog.

**Sent When:**

- User clicks the delete (trash) icon on a mapping row

**Message Structure:**

```typescript
{
  type: "confirm-delete-supplier-material-mapping",
  data: {
    mappingId: string,        // UUID of the mapping to delete
    supplierName: string,     // For display in confirmation dialog
    materialName: string,     // For display in confirmation dialog
    fromDate: string,         // For display (e.g., "Jan 2026")
    toDate: string            // For display (e.g., "Mar 2026")
  }
}
```

**JavaScript Example:**

```javascript
// From embedded page
window.parent.postMessage(
  JSON.stringify({
    type: "confirm-delete-supplier-material-mapping",
    data: {
      mappingId: "123e4567-e89b-12d3-a456-426614174000",
      supplierName: "ABC Corp",
      materialName: "Steel Rod",
      fromDate: "Jan 2026",
      toDate: "Mar 2026",
    },
  }),
  "*"
);
```

**Expected Parent SPA Action:**

1. Show confirmation dialog with message:
   > "Are you sure you want to delete the mapping for **ABC Corp** → **Steel Rod** (Jan 2026 – Mar 2026)? This cannot be undone."
2. If user confirms → send `confirm-delete-response` back to iframe
3. If user cancels → send `confirm-delete-response` with `confirmed: false` or do nothing

---

#### 2. `supplier-material-mapping-data-changed`

Notifies parent that data has been modified (record created, updated, or deleted).

**Sent When:**

- A new mapping is successfully saved
- An existing mapping is successfully updated
- A mapping is successfully deleted

**Message Structure:**

```typescript
{
  type: "supplier-material-mapping-data-changed",
  isFailed: boolean  // true = operation failed, false = success
}
```

**JavaScript Example:**

```javascript
// Success
window.parent.postMessage(
  JSON.stringify({
    type: "supplier-material-mapping-data-changed",
    isFailed: false,
  }),
  "*"
);

// Failure
window.parent.postMessage(
  JSON.stringify({
    type: "supplier-material-mapping-data-changed",
    isFailed: true,
  }),
  "*"
);
```

**Expected Parent SPA Action:**

1. If `isFailed === false`:
   - Show success notification (e.g., "Mapping saved successfully" or "Mapping deleted successfully")
2. If `isFailed === true`:
   - Show error notification (e.g., "Operation failed. Please try again.")

---

### Messages FROM Parent SPA TO Embedded Page

#### 3. `confirm-delete-response`

Sends the user's confirmation decision back to the embedded page.

**Send When:**

- After the user interacts with the delete confirmation dialog (confirm or cancel)

**Message Format:**

```typescript
{
  type: "confirm-delete-response",
  data: {
    confirmed: boolean,   // true = user confirmed deletion, false = cancelled
    mappingId: string      // UUID of the mapping (echo back for identification)
  }
}
```

**JavaScript Example:**

```javascript
const iframe = document.getElementById("supplier-material-mapping-iframe");

// User confirmed deletion
if (iframe && iframe.contentWindow) {
  iframe.contentWindow.postMessage(
    JSON.stringify({
      type: "confirm-delete-response",
      data: {
        confirmed: true,
        mappingId: "123e4567-e89b-12d3-a456-426614174000",
      },
    }),
    "*"
  );
}
```

**Behavior:**

- If `confirmed === true`: Embedded page calls the DELETE API and removes the row on success
- If `confirmed === false`: Embedded page cancels the delete operation, row remains unchanged

---

#### 4. `refresh-supplier-material-mapping`

Triggers the mapping table to refresh its data.

**Send When:**

- When the parent SPA needs to force a data refresh (e.g., after external data changes)
- When the user manually requests a refresh

**Message Format:**

```typescript
{ type: "refresh-supplier-material-mapping" }
```

**JavaScript Example:**

```javascript
const iframe = document.getElementById("supplier-material-mapping-iframe");

if (iframe && iframe.contentWindow) {
  iframe.contentWindow.postMessage(
    JSON.stringify({ type: "refresh-supplier-material-mapping" }),
    "*"
  );
}
```

**Behavior:**

- Table resets to page 1, clears search/filters, and re-fetches data from the API

---

## Complete Implementation Example

### Vanilla JavaScript Implementation

```javascript
// ===================================================================
// Parent SPA - Supplier Material Mapping Integration
// ===================================================================

// State
let pendingDeleteMappingId = null;

// --- Message Listener ---
window.addEventListener("message", (event) => {
  // Security: In production, validate event.origin
  // if (event.origin !== "https://yourdomain.com") return;

  let message;
  try {
    message = JSON.parse(event.data);
  } catch (error) {
    return; // Ignore non-JSON messages
  }

  switch (message.type) {
    case "confirm-delete-supplier-material-mapping":
      handleDeleteConfirmation(message.data);
      break;

    case "supplier-material-mapping-data-changed":
      handleDataChanged(message.isFailed);
      break;

    default:
      // Ignore unknown message types
      break;
  }
});

// --- Handler: Show Delete Confirmation ---
function handleDeleteConfirmation(data) {
  const { mappingId, supplierName, materialName, fromDate, toDate } = data;

  pendingDeleteMappingId = mappingId;

  // Show your confirmation dialog
  const confirmed = confirm(
    `Are you sure you want to delete the mapping for ${supplierName} → ${materialName} (${fromDate} – ${toDate})?\n\nThis cannot be undone.`
  );

  // Send response back to iframe
  const iframe = document.getElementById("supplier-material-mapping-iframe");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        type: "confirm-delete-response",
        data: { confirmed, mappingId },
      }),
      "*"
    );
  }

  pendingDeleteMappingId = null;
}

// --- Handler: Data Changed Notification ---
function handleDataChanged(isFailed) {
  if (!isFailed) {
    showNotification("success", "Operation completed successfully");
  } else {
    showNotification("error", "Operation failed. Please try again.");
  }
}

// --- Helper: Refresh Table ---
function refreshMappingTable() {
  const iframe = document.getElementById("supplier-material-mapping-iframe");
  if (iframe && iframe.contentWindow) {
    iframe.contentWindow.postMessage(
      JSON.stringify({ type: "refresh-supplier-material-mapping" }),
      "*"
    );
  }
}

// --- Helper: Show Notification ---
function showNotification(type, message) {
  // Implement your notification system (toast, snackbar, etc.)
  console.log(`[${type}] ${message}`);
}
```

**HTML:**

```html
<!-- Single iframe - no drawer/form iframe needed -->
<div class="supplier-material-mapping-container">
  <iframe
    id="supplier-material-mapping-iframe"
    src="/{organizationId}/embed/v1/{accessToken}/supplier-material-mapping"
    title="Supplier Material Mapping"
    style="width: 100%; height: 100%; border: none;"
  ></iframe>
</div>
```

---

### React/TypeScript Implementation

```typescript
// types.ts
export interface SupplierMaterialMappingMessage {
  type:
    | "confirm-delete-supplier-material-mapping"
    | "supplier-material-mapping-data-changed";
  data?: {
    mappingId?: string;
    supplierName?: string;
    materialName?: string;
    fromDate?: string;
    toDate?: string;
  };
  isFailed?: boolean;
}

export interface DeleteConfirmationData {
  mappingId: string;
  supplierName: string;
  materialName: string;
  fromDate: string;
  toDate: string;
}
```

```typescript
// useSupplierMaterialMappingMessages.ts
import { useEffect, useCallback, useRef } from "react";

export const useSupplierMaterialMappingMessages = ({
  onDeleteConfirmation,
  onDataChanged,
}: {
  onDeleteConfirmation: (data: DeleteConfirmationData) => void;
  onDataChanged: (isFailed: boolean) => void;
}) => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Security: validate origin in production
      // if (event.origin !== window.location.origin) return;

      let message: SupplierMaterialMappingMessage;
      try {
        message = JSON.parse(event.data);
      } catch {
        return;
      }

      switch (message.type) {
        case "confirm-delete-supplier-material-mapping":
          if (message.data) {
            onDeleteConfirmation(message.data as DeleteConfirmationData);
          }
          break;
        case "supplier-material-mapping-data-changed":
          onDataChanged(message.isFailed || false);
          break;
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [onDeleteConfirmation, onDataChanged]);

  const sendToIframe = useCallback((message: string) => {
    iframeRef.current?.contentWindow?.postMessage(message, "*");
  }, []);

  const sendDeleteResponse = useCallback(
    (confirmed: boolean, mappingId: string) => {
      sendToIframe(
        JSON.stringify({
          type: "confirm-delete-response",
          data: { confirmed, mappingId },
        })
      );
    },
    [sendToIframe]
  );

  const refreshTable = useCallback(() => {
    sendToIframe(
      JSON.stringify({ type: "refresh-supplier-material-mapping" })
    );
  }, [sendToIframe]);

  return { iframeRef, sendDeleteResponse, refreshTable };
};
```

```tsx
// SupplierMaterialMappingContainer.tsx
import React, { useState, useCallback } from "react";
import {
  useSupplierMaterialMappingMessages,
  DeleteConfirmationData,
} from "./useSupplierMaterialMappingMessages";

interface Props {
  organizationId: string;
  accessToken: string;
}

export const SupplierMaterialMappingContainer: React.FC<Props> = ({
  organizationId,
  accessToken,
}) => {
  const [deleteDialog, setDeleteDialog] = useState<{
    open: boolean;
    data: DeleteConfirmationData | null;
  }>({ open: false, data: null });

  const { iframeRef, sendDeleteResponse, refreshTable } =
    useSupplierMaterialMappingMessages({
      onDeleteConfirmation: useCallback((data: DeleteConfirmationData) => {
        setDeleteDialog({ open: true, data });
      }, []),
      onDataChanged: useCallback((isFailed: boolean) => {
        if (!isFailed) {
          showNotification("success", "Operation completed successfully");
        } else {
          showNotification("error", "Operation failed. Please try again.");
        }
      }, []),
    });

  const handleConfirmDelete = () => {
    if (deleteDialog.data) {
      sendDeleteResponse(true, deleteDialog.data.mappingId);
    }
    setDeleteDialog({ open: false, data: null });
  };

  const handleCancelDelete = () => {
    if (deleteDialog.data) {
      sendDeleteResponse(false, deleteDialog.data.mappingId);
    }
    setDeleteDialog({ open: false, data: null });
  };

  const iframeUrl = `/${organizationId}/embed/v1/${accessToken}/supplier-material-mapping`;

  return (
    <>
      {/* Mapping Table - Single iframe, no drawer needed */}
      <div style={{ width: "100%", height: "100%" }}>
        <iframe
          ref={iframeRef}
          id="supplier-material-mapping-iframe"
          src={iframeUrl}
          title="Supplier Material Mapping"
          style={{ width: "100%", height: "100%", border: "none" }}
        />
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && deleteDialog.data && (
        <ConfirmationDialog
          open={deleteDialog.open}
          title="Delete Mapping"
          message={`Are you sure you want to delete the mapping for ${deleteDialog.data.supplierName} → ${deleteDialog.data.materialName} (${deleteDialog.data.fromDate} – ${deleteDialog.data.toDate})? This cannot be undone.`}
          onConfirm={handleConfirmDelete}
          onCancel={handleCancelDelete}
          confirmLabel="Delete"
          confirmColor="red"
        />
      )}
    </>
  );
};
```

---

## Delete Confirmation Modal

The delete confirmation modal is the **only modal** required for this feature (no bulk upload modal, no form drawer).

### Implementation

```typescript
// State for delete confirmation
interface DeleteDialogState {
  isOpen: boolean;
  mappingId: string | null;
  supplierName: string;
  materialName: string;
  fromDate: string;
  toDate: string;
}

let deleteDialogState: DeleteDialogState = {
  isOpen: false,
  mappingId: null,
  supplierName: "",
  materialName: "",
  fromDate: "",
  toDate: "",
};

// Open delete dialog (called from message handler)
function openDeleteDialog(data: DeleteConfirmationData) {
  deleteDialogState = {
    isOpen: true,
    mappingId: data.mappingId,
    supplierName: data.supplierName,
    materialName: data.materialName,
    fromDate: data.fromDate,
    toDate: data.toDate,
  };
  renderDeleteDialog();
}

// Confirm deletion
function confirmDeletion() {
  const iframe = document.getElementById(
    "supplier-material-mapping-iframe"
  ) as HTMLIFrameElement;

  if (iframe?.contentWindow && deleteDialogState.mappingId) {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        type: "confirm-delete-response",
        data: {
          confirmed: true,
          mappingId: deleteDialogState.mappingId,
        },
      }),
      "*"
    );
  }

  closeDeleteDialog();
}

// Cancel deletion
function cancelDeletion() {
  const iframe = document.getElementById(
    "supplier-material-mapping-iframe"
  ) as HTMLIFrameElement;

  if (iframe?.contentWindow && deleteDialogState.mappingId) {
    iframe.contentWindow.postMessage(
      JSON.stringify({
        type: "confirm-delete-response",
        data: {
          confirmed: false,
          mappingId: deleteDialogState.mappingId,
        },
      }),
      "*"
    );
  }

  closeDeleteDialog();
}

// Close dialog
function closeDeleteDialog() {
  deleteDialogState = {
    isOpen: false,
    mappingId: null,
    supplierName: "",
    materialName: "",
    fromDate: "",
    toDate: "",
  };
  renderDeleteDialog();
}

// Render dialog (adapt to your UI framework)
function renderDeleteDialog() {
  const modal = document.getElementById("delete-confirmation-modal");
  if (!modal) return;

  if (!deleteDialogState.isOpen) {
    modal.style.display = "none";
    return;
  }

  modal.style.display = "block";
  modal.innerHTML = `
    <div class="modal-overlay" onclick="cancelDeletion()">
      <div class="modal-content" onclick="event.stopPropagation()">
        <div class="modal-header">
          <h3>Delete Mapping</h3>
          <button onclick="cancelDeletion()" class="close-btn">&times;</button>
        </div>
        <div class="modal-body">
          <p>
            Are you sure you want to delete the mapping for
            <strong>${deleteDialogState.supplierName}</strong> →
            <strong>${deleteDialogState.materialName}</strong>
            (${deleteDialogState.fromDate} – ${deleteDialogState.toDate})?
          </p>
          <p class="warning-text">This cannot be undone.</p>
        </div>
        <div class="modal-footer">
          <button onclick="cancelDeletion()" class="btn-secondary">Cancel</button>
          <button onclick="confirmDeletion()" class="btn-danger">Delete</button>
        </div>
      </div>
    </div>
  `;
}
```

---

## Common Integration Patterns

### Pattern 1: Refresh Table After External Changes

```javascript
function refreshMappingTable() {
  const iframe = document.getElementById("supplier-material-mapping-iframe");
  if (iframe?.contentWindow) {
    iframe.contentWindow.postMessage(
      JSON.stringify({ type: "refresh-supplier-material-mapping" }),
      "*"
    );
  }
}

// Call after: external data sync, master data updates, etc.
```

### Pattern 2: Handle Token Refresh

```javascript
// If your access token expires, update the iframe URL
function refreshIframeToken(newAccessToken) {
  const iframe = document.getElementById(
    "supplier-material-mapping-iframe"
  ) as HTMLIFrameElement;

  if (iframe) {
    const currentUrl = new URL(iframe.src);
    const pathParts = currentUrl.pathname.split("/");
    // Replace access token segment in the path
    const tokenIndex = pathParts.indexOf("v1") + 1;
    pathParts[tokenIndex] = newAccessToken;
    iframe.src = pathParts.join("/");
  }
}
```

### Pattern 3: Resize Iframe to Content

```javascript
// Listen for content resize messages from iframe
window.addEventListener("message", (event) => {
  let message;
  try {
    message = JSON.parse(event.data);
  } catch {
    return;
  }

  if (message.type === "warp-content-resize" && message.data?.height) {
    const iframe = document.getElementById("supplier-material-mapping-iframe");
    if (iframe) {
      iframe.style.height = `${message.data.height}px`;
    }
  }
});
```

---

## API Endpoints Reference

### Mapping Listing

**GET** `/api/v1/master-data/supplier-material-mapping/listing`

**Query Parameters:**

- `pageIndex` (number, default: 0)
- `pageSize` (number, default: 10)
- `search` (string, optional): Searches supplier name, supplier code, material name, material code
- `sortBy` (string, optional): Column to sort by
- `sortOrder` ("asc" | "desc", optional)

**Response:**

```typescript
{
  success: true,
  data: Array<{
    id: string;
    supplier_id: string;
    supplier_name: string;
    supplier_code: string;
    material_id: string;
    material_name: string;
    material_code: string;
    material_type: string;
    from_date: string;       // ISO date
    to_date: string;         // ISO date
    created_at: string;
  }>,
  totalCount: number
}
```

---

### Get Dropdown Data (Suppliers & Materials)

**GET** `/api/v1/master-data/supplier-material-mapping/form?action=dropdown-data`

**Response:**

```typescript
{
  success: true,
  suppliers: Array<{
    id: string;
    name: string;
    code: string;
  }>,
  materials: Array<{
    id: string;
    name: string;
    code: string;
    type: string;
  }>
}
```

---

### Get Mapping by ID

**GET** `/api/v1/master-data/supplier-material-mapping/form?id={uuid}`

**Response:**

```typescript
{
  success: true,
  data: {
    id: string;
    supplier_id: string;
    material_id: string;
    from_date: string;
    to_date: string;
    OrgSupplierMaster: { id: string; name: string; code: string };
    OrgMaterialMaster: { id: string; name: string; code: string; type: string };
  }
}
```

---

### Create Mapping

**POST** `/api/v1/master-data/supplier-material-mapping/form`

**Request Body:**

```typescript
{
  supplier_id: string;    // Required UUID
  material_id: string;    // Required UUID
  from_date: string;      // Required ISO date (first day of month)
  to_date: string;        // Required ISO date (first day of month)
}
```

**Success Response (200):**

```typescript
{
  success: true,
  data: {
    id: string;
    supplier_id: string;
    material_id: string;
    from_date: string;
    to_date: string;
    created_at: string;
  }
}
```

**Validation Error (400):**

```typescript
{
  success: false,
  message: "Validation failed.",
  data: {
    supplier_id: ["Please select a supplier"],
    to_date: ["End date must be after start date"]
  }
}
```

**Duplicate Error (400):**

```typescript
{
  success: false,
  message: "This mapping already exists."
}
```

**Authentication Error (401):**

```typescript
{
  success: false,
  message: "Invalid or expired token"
}
```

**Authorization Error (403):**

```typescript
{
  success: false,
  message: "Access denied. OrganizationAdmin role required"
}
```

---

### Update Mapping

**PUT** `/api/v1/master-data/supplier-material-mapping/form`

**Request Body:**

```typescript
{
  id: string;             // Required UUID
  supplier_id: string;    // Required UUID
  material_id: string;    // Required UUID
  from_date: string;      // Required ISO date
  to_date: string;        // Required ISO date
}
```

**Response:** Same structure as Create.

---

### Delete Mapping

**DELETE** `/api/v1/master-data/supplier-material-mapping/form`

**Request Body:**

```typescript
{
  id: string;  // Required UUID
}
```

**Success Response (200):**

```typescript
{
  success: true,
  message: "Mapping deleted successfully"
}
```

**In-Use Error (400):**

```typescript
{
  success: false,
  message: "Cannot delete — this mapping is currently in use."
}
```

**Not Found (404):**

```typescript
{
  success: false,
  message: "Mapping not found or already deleted."
}
```

**Server Error (500):**

```typescript
{
  success: false,
  message: "Delete failed. Please try again."
}
```

---

### Get Total Count

**GET** `/api/v1/master-data/supplier-material-mapping/counts`

**Response:**

```typescript
{
  success: true,
  totalCount: number
}
```

---

## Business Rules

### Access Control

- **Role Required:** OrganizationAdmin (Supply Chain Admin)
- **Authentication:** JWT token with `x-hasura-org-id` claim must match `{organizationId}` in URL

### Validation Rules

**Supplier:**

- Required — must select a valid supplier from the dropdown
- Must be an active (non-deleted) supplier in the organization
- Error: "Please select a supplier"

**Material:**

- Required — must select a valid material from the dropdown
- Must be an active (non-deleted) material in the organization
- Deactivated materials do not appear in the dropdown
- Error: "Please select a material"

**From Date:**

- Required — must select a month/year
- Stored as first day of month (e.g., `2026-01-01T00:00:00Z`)
- Displayed as "Jan 2026"
- Error: "Please select a reporting period"

**To Date:**

- Required — must select a month/year
- Must be on or after the From Date (same month is valid)
- Stored as first day of month
- Error: "End date must be after start date"

**Uniqueness:**

- The combination of supplier_id + material_id + from_date + to_date must be unique within the organization
- Checked server-side before insert/update (excluding current record on update)
- Error: "This mapping already exists"

### Delete Rules

- Soft delete (sets `is_deleted = true`)
- Must always show confirmation dialog before deleting
- If the mapping is referenced by active reports or purchase orders, deletion is blocked
- Error: "Cannot delete — this mapping is currently in use"

### Inline Editing Rules

- Only one row can be in edit/create mode at a time
- Clicking "ADD DATA" while already creating/editing another row does nothing (button is effectively disabled)
- Empty (unfilled) rows are discarded on cancel
- If an existing creating row has no values filled and the user clicks "ADD DATA" again, the empty row is discarded before a new one appears

---

## UI/UX Guidelines

### Page Features

- **Record Count Badge:** "All (N)" in highlighted color above the table, always reflects current count
- **Search:** Debounced (200ms) across supplier name/code and material name/code
- **Pagination:** 10, 25, 50, 100 rows per page; current page highlighted; record range indicator
- **Sort:** Click column headers to toggle ascending/descending
- **Empty State:** Illustration + "Add Supplier Material Mappings" title + "ADD DATA" button when no records exist

### Inline Editing UX

- **Row enters edit mode:** All cells become editable (dropdowns, date pickers)
- **Actions column changes:** Edit + Delete icons become Save + Cancel icons
- **Validation errors:** Shown inline below each field in the edit row
- **Loading state:** Save button shows spinner while API call is in progress
- **Success feedback:** Row returns to read-only mode with updated values; brief highlight animation

### Dropdown UX

- **Searchable:** Typing filters the list client-side
- **Long names:** Truncated with "..." in dropdown, full name on hover (Tooltip)
- **Empty state:** "No materials available" if supplier has no linked materials
- **Error state:** "Could not load suppliers. Please try again" if API fails
- **Keyboard:** Escape closes dropdown without selecting

### Date Picker UX

- **Format:** Month/Year picker (not full date), displays as "Jan 2026"
- **Clear button:** Small X to clear the selected date
- **Responsive:** Should display correctly on tablets and smaller screens
- **Persistence:** Saved dates show correctly on page reload

### Recommended Parent SPA UI

- **No drawer needed:** All editing happens inline in the table
- **Delete confirmation:** Modal/dialog with "Cancel" and "Delete" (red) buttons
- **Notifications:** Toast/snackbar for success/error after data changes
- **Iframe sizing:** Full-width iframe, height auto-adjusts to content

---

## Security Considerations

### PostMessage Security

```javascript
// Production: Validate origin
window.addEventListener("message", (event) => {
  const allowedOrigins = [
    "https://yourdomain.com",
    "https://app.yourdomain.com",
  ];
  if (!allowedOrigins.includes(event.origin)) {
    console.warn("Blocked message from unauthorized origin:", event.origin);
    return;
  }
  // Process message...
});

// When sending messages, specify target origin (avoid "*" in production)
iframe.contentWindow.postMessage(message, "https://yourdomain.com");
```

### Access Token Management

- Store `accessToken` securely (not in localStorage for production)
- Validate token expiry on the backend
- Use HTTPS only in production

### Content Security Policy (CSP)

```http
Content-Security-Policy: frame-ancestors 'self' https://yourdomain.com;
```

### Input Sanitization

- All dropdown values are selected from server-provided lists (no free-text injection)
- Dates are validated as valid ISO dates server-side
- UUIDs are validated server-side before any database operation
- Search input is sanitized to prevent query injection

---

## Testing Checklist

### Iframe Integration

- [ ] Mapping page loads in iframe
- [ ] Page title and "ADD DATA" button render correctly
- [ ] Record count badge shows correct number
- [ ] Table displays mapping data with proper formatting

### Inline Editing - Create

- [ ] "ADD DATA" inserts a new editable row at the top
- [ ] Rapid "ADD DATA" clicks only create one row
- [ ] Supplier dropdown opens with searchable list
- [ ] Material dropdown opens with searchable list
- [ ] Date pickers open and allow month/year selection
- [ ] Save with all fields filled creates the mapping
- [ ] Success notification appears after save
- [ ] Record count increases by 1
- [ ] Cancel discards the empty row

### Inline Editing - Edit

- [ ] Edit icon makes row editable with pre-filled values
- [ ] Changes save correctly and row returns to read-only
- [ ] Record count stays the same after edit
- [ ] Cancel reverts changes to original values

### Delete Flow

- [ ] Delete icon sends confirmation message to parent
- [ ] Parent shows confirmation dialog with mapping details
- [ ] Confirming sends response back to iframe
- [ ] Record is removed and count decreases by 1
- [ ] "Mapping deleted successfully" notification appears
- [ ] Cancelling keeps the record unchanged
- [ ] In-use mappings show blocked message

### Validation

- [ ] Save without supplier shows "Please select a supplier"
- [ ] Save without material shows "Please select a material"
- [ ] Save without dates shows "Please select a reporting period"
- [ ] To date before From date shows "End date must be after start date"
- [ ] Same month From/To is accepted
- [ ] Duplicate mapping shows "This mapping already exists"
- [ ] Cross-year ranges (Dec 2025 – Feb 2026) work correctly

### Dropdowns

- [ ] Supplier search filters list correctly
- [ ] Material search filters list correctly
- [ ] Long names show "..." with tooltip on hover
- [ ] Escape key closes dropdown
- [ ] Deactivated materials don't appear
- [ ] API failure shows error message in dropdown

### Message Flow

- [ ] `confirm-delete-supplier-material-mapping` message received by parent
- [ ] `supplier-material-mapping-data-changed` message received by parent
- [ ] `confirm-delete-response` message sent and processed by iframe
- [ ] `refresh-supplier-material-mapping` message triggers data refresh

### Edge Cases

- [ ] 403 Forbidden for non-admin users
- [ ] 401 Unauthorized for invalid/expired tokens
- [ ] Network error shows appropriate message, retains unsaved data
- [ ] Concurrent delete (record deleted by another user) shows appropriate message
- [ ] Page leave with unsaved changes shows warning prompt
- [ ] Table works correctly with 500+ suppliers in dropdowns

---

## Troubleshooting

### Common Issues

**Issue:** Mapping table doesn't load in iframe
- **Solution:** Verify the iframe URL follows the correct pattern: `/{organizationId}/embed/v1/{accessToken}/supplier-material-mapping`. Check that the access token is valid and the user has OrganizationAdmin role.

**Issue:** Delete confirmation dialog doesn't appear
- **Solution:** Verify the parent SPA message listener is registered and handles `confirm-delete-supplier-material-mapping` type. Check browser console for JSON parse errors.

**Issue:** Delete doesn't execute after confirmation
- **Solution:** Verify `confirm-delete-response` message is sent to the correct iframe reference (check iframe ID). Ensure `confirmed: true` and `mappingId` are included in the response.

**Issue:** Dropdowns are empty
- **Solution:** Check the `GET /form?action=dropdown-data` API response. Verify the organization has active suppliers and materials. Check for API errors in the network tab.

**Issue:** Date picker shows wrong format
- **Solution:** Ensure dates are stored as first-of-month ISO strings (e.g., `2026-01-01T00:00:00Z`). The display format should be "Jan 2026" using a date formatting library.

**Issue:** "This mapping already exists" error on save
- **Solution:** The same combination of supplier + material + from_date + to_date already exists. Check the existing mappings or adjust the date range.

**Issue:** Edit icon is unresponsive
- **Solution:** Verify no other row is currently in edit/create mode. Only one row can be edited at a time. Cancel or save the current edit first.

**Issue:** 403 Forbidden on all API calls
- **Solution:** Verify the user has OrganizationAdmin role. Check JWT token claims include `x-hasura-default-role` with appropriate permissions.

**Issue:** Success notification not showing
- **Solution:** Ensure the parent SPA handles `supplier-material-mapping-data-changed` messages and checks the `isFailed` flag.

---

## Change Log

| Version | Date       | Changes                    |
|---------|------------|----------------------------|
| 1.0.0   | 2026-03-19 | Initial release            |

---

## Support

For technical questions or issues with integration, contact the backend development team or refer to the main project documentation at `docs/`.

**Key Integration Points:**

- Window message protocol (4 message types)
- Delete confirmation flow (parent ↔ iframe round-trip)
- API authentication and authorization
- Inline editing behavior
