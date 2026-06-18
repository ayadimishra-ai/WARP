# Use of Sold Products - Frontend Integration Complete

## Overview

The "Use of Sold Products" activity has been successfully integrated into the frontend for the Snowkap platform. This document outlines what has been implemented and the current status.

## ✅ Completed Frontend Tasks

### 1. Activity Constants Definition

**File:** [shared/constants/activity.constant.ts](../../shared/constants/activity.constant.ts)

Added the `UseOfSoldProductsConstant` with complete configuration for the three Excel sheets:

- **Fuel Sheet** - Tracks fuel consumption for the lifetime of sold products
- **Electricity Sheet** - Tracks electricity consumption for the lifetime of sold products
- **Refrigerant Sheet** - Tracks refrigerant consumption for the lifetime of sold products

Each sheet includes all required and optional columns as specified in the requirements.

### 2. Data Import History Integration

**File:** [lib/shared/constants/dataimporthistory.constant.ts](../../lib/shared/constants/dataimporthistory.constant.ts)

Added "Use of Sold Products" to the `CustomHeaderFilter` configuration:

- Activity Code: `use_of_sold_products`
- Display Header: "Use of Sold Products"
- Short Name: "USP"
- Section: `use_of_sold_products`

This enables the activity to appear in the data import history table's category tabs with upload counts.

### 3. Feature Components

**Directory:** [features/manual-data-entry/use-of-sold-products/](../../features/manual-data-entry/use-of-sold-products/)

Created the following components:

#### listing.tsx

Main component displaying the Use of Sold Products data entry interface. Uses the `ManualEntryTable` component to manage data input across multiple sheets.

```tsx
const UseOfSoldProductsListing = () => {
  // Renders UI for data entry and validation
};
```

#### hooks.tsx

Custom React hooks providing sheet configuration and navigation logic:

- `useUseOfSoldProductsData()` - Hook for accessing sheet configuration
- `getSheetByCode()` - Retrieve sheet by code
- `getColumnsBySheet()` - Get columns for a specific sheet

#### SHEETS-GUIDE.md

Comprehensive documentation covering:

- Sheet structure and fields
- Field-specific validation rules
- Data flow and processing pipeline
- Related files and references

### 4. Page Routing

**File:** [app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/use-of-sold-products/page.tsx](../../app/[organizationId]/embed/v1/[accessToken]/manual-entry-data/use-of-sold-products/page.tsx)

Created the Next.js page component that wraps the `UseOfSoldProductsListing` component, enabling the activity to be accessible via the standard routing pattern used for other activities.

## 🔄 In-Progress Tasks (Backend)

The following backend components need to be implemented:

1. ~~**Validation Schemas** - Zod schemas for each sheet type~~ ✅ Completed
2. **Service Layer** - Database save logic
3. **API Routes** - Excel upload and template download endpoints
4. **GraphQL** - Mutations and queries for data persistence
5. **Emission Calculations** - Integration with calculation engine

### Validation Schema Details

**File:** `lib/organization-transaction/use-of-sold-products/use-of-sold-products.validation.ts`

All string fields across the 3 sheets (Fuel, Electricity, Refrigerant) use `z.preprocess()` to handle type coercion from Excel. This ensures that when a number is entered in a string column, it is automatically converted to a string before validation, producing proper error messages (e.g., "Type of Fuel Consumed is required") instead of the generic "Expected string, received number".

**Pattern used (matching Capital Goods / Material Procurement):**

```typescript
z.preprocess(
  (val) => (typeof val !== "string" ? String(val ?? "") : val),
  z.string().min(1, "Field Name is required")
);
```

**Fields using preprocess in each sheet:**

- **Fuel:** Type of Fuel Consumed, Product Code, UoM of Fuel Consumed, Additional comments, Remarks
- **Electricity:** Product Code, Region, Additional comments, Remarks
- **Refrigerant:** Product Code, Refrigerant type used in sold product, UoM of Refrigerant consumed, Additional comments, Remarks

## How the Frontend Integration Works

### 1. Data Import History Display

When a user uploads "Use of Sold Products" data via the API, the activity appears as a category tab in the data import history with a count:

```
All (1586) | General Details (45) | ... | Fuel Consumption (126) | ... | Use of Sold Products (0)
```

### 2. Manual Entry Flow

Users can navigate to `/manual-entry-data/use-of-sold-products/` to:

- Enter data for one or more of the three sheets
- Validate data against sheet-specific rules
- Access help documentation via SHEETS-GUIDE

### 3. Multi-Sheet Architecture

The component supports three sheets within a single upload:

| Sheet       | Purpose                      | Key Fields                  |
| ----------- | ---------------------------- | --------------------------- |
| Fuel        | Fuel consumption data        | Type of Fuel, Quantity, UoM |
| Electricity | Electricity consumption data | Region, Units (kWh)         |
| Refrigerant | Refrigerant consumption data | Type, Quantity, UoM         |

## UI Reference

The frontend follows the same pattern as existing multi-sheet activities like:

- **Fuel Consumption** (`energy_fuel_purchased`)
- **Waste** (`waste`)
- **Fuel Purchased** (with multiple sheets)

The listing component inherits styling and functionality from `ManualEntryTable`, ensuring consistency with the platform's design system.

## Integration Checklist

- ✅ Activity constant defined
- ✅ Category tab configured
- ✅ Listing component created
- ✅ Page routing configured
- ✅ Documentation written
- ✅ Backend validation schemas
- ✅ Database service
- ✅ API routes
- ✅ Ease of Product Master Data Onboarding (auto-creates missing OrgProductMaster entries from Product Code column)
- ⏳ GraphQL queries/mutations pending
- ⏳ Emission calculation pending

## Database Reference

The backend implementation uses these database tables:

- `GHGUseOfSoldProducts` (parent table)
- `GHGUseOfSoldProducts_Fuel`
- `GHGUseOfSoldProducts_Electricity`
- `GHGUseOfSoldProducts_Refrigerant`

For database migration details, see: [docs/Use-of-Sold-Products/db-migration/use-of-sold-products.md](./db-migration/use-of-sold-products.md)

## Testing the Frontend

To test the frontend implementation:

1. Navigate to `/[organizationId]/embed/v1/[accessToken]/manual-entry-data/use-of-sold-products/`
2. Verify the page loads without errors
3. Check that the "Use of Sold Products" tab appears in data import history
4. Verify the sheet names display correctly when backend is ready

## Next Steps

1. ~~Implement Zod validation schemas per sheet type~~ ✅
2. ~~Create service layer for database operations~~ ✅
3. ~~Add API route handlers for Excel upload/template download~~ ✅
4. Create GraphQL mutations and queries
5. Integrate with emission calculation engine
6. ~~Add audit logging~~ ✅
7. ~~Ease of Product Master Data Onboarding~~ ✅
8. Testing and QA

---

**Last Updated:** April 9, 2026
**Status:** Frontend Complete, Backend In-Progress
