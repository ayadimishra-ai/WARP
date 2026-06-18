# Activity Data Removal Feature

## 📁 File Structure

```
activity-data-removal/
├── listing/
│   └── page.tsx                              # Main page with auth guard
├── components/
│   └── activity-data-removal-table.tsx       # Main UI component with filters and table
├── hooks/
│   └── use-activity-data-removal.tsx         # State management and business logic
├── types/
│   └── index.ts                              # TypeScript interfaces
├── constants/
│   └── index.ts                              # Constants (months, years, messages)
└── README.md                                 # This file
```

## 🎯 Feature Overview

A super-admin feature to load and delete activity data records with filtered criteria.

### Features:
- ✅ Organization dropdown filter
- ✅ Location dropdown filter (depends on organization)
- ✅ Month dropdown filter
- ✅ Year dropdown filter
- ✅ Load button to fetch data
- ✅ Data table with pagination
- ✅ Delete button with confirmation modal
- ✅ Loading states
- ✅ Empty states
- ✅ Success/Error notifications

## 🚀 Usage

### Access the Page

Navigate to: `/ghg/admin/activity-data-removal/listing`

### Page Flow

1. **Select Filters**
   - Choose Organization (required)
   - Choose Location (required, loads after organization selection)
   - Choose Month (required)
   - Choose Year (required)

2. **Load Data**
   - Click "Load" button
   - Table displays mock data (replace with actual API)

3. **Delete Data**
   - Click "Delete" button (enabled when data exists)
   - Confirm deletion in modal
   - Data is cleared after successful deletion

## 🔧 Implementation Status

### ✅ Completed (UI & Structure)

- [x] Page layout with filters
- [x] Organization dropdown
- [x] Location dropdown (cascading)
- [x] Month dropdown
- [x] Year dropdown
- [x] Load button with validation
- [x] Data table with columns
- [x] Delete button
- [x] Confirmation modal
- [x] Loading states
- [x] Empty states
- [x] Success/Error notifications
- [x] TypeScript types
- [x] Mock data for testing

### ❌ TODO (API Integration)

You need to implement the following:

#### 1. **Fetch Organizations API**

Replace mock in `use-activity-data-removal.tsx` (line ~64):

```typescript
// TODO: Replace with actual API call
const response = await fetch('/api/organizations');
const data = await response.json();
setOrganizationOptions(data.organizations);
```

#### 2. **Fetch Locations API**

Replace mock in `use-activity-data-removal.tsx` (line ~88):

```typescript
// TODO: Replace with actual API call
const response = await fetch(`/api/locations?organizationId=${filters.organizationId}`);
const data = await response.json();
setLocationOptions(data.locations);
```

#### 3. **Load Data API**

Replace mock in `handleLoadData` function (line ~140):

```typescript
// TODO: Replace with actual API call
const response = await fetch('/api/activity-data', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const result = await response.json();
setData(result.data);
```

Expected payload:
```typescript
{
  organizationId: string,
  locationId: string,
  month: string,
  year: string
}
```

#### 4. **Delete Data API**

Replace mock in `handleDelete` function (line ~227):

```typescript
// TODO: Replace with actual API call
const response = await fetch('/api/activity-data', {
  method: 'DELETE',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(payload),
});
const result = await response.json();
```

Expected payload:
```typescript
{
  organizationId: string,
  locationId: string,
  month: string,
  year: string
}
```

## 🎨 Styling & Patterns

### Followed Conventions

- ✅ Uses Mantine UI components (v7+)
- ✅ Follows uom-conversion reference structure
- ✅ Uses MantineReactTable for data display
- ✅ Uses @mantine/modals for confirmation
- ✅ Uses @mantine/notifications for feedback
- ✅ Consistent naming (PascalCase for components, camelCase for functions)
- ✅ Protected by SuperAdminAuthGuard
- ✅ Matches existing admin page styling

### Color Scheme

- Primary heading: `#003b52`
- Borders: `#e0e0e0`
- Background: `#fafafa` (filter section)
- Dimmed text: `dimmed` (Mantine)

## 📊 Table Columns

| Column | Description |
|--------|-------------|
| ID | Record identifier (hidden by default) |
| Organization | Organization name |
| Location | Location name |
| Month | Activity month |
| Year | Activity year |
| Status | Record status |
| Created Date | Date record was created |

## 🔐 Security

- Protected by `SuperAdminAuthGuard`
- Only super admins can access this page

## 🧪 Testing the UI

Even without backend APIs, you can test:

1. **Filter Interaction**
   - Organization dropdown populates with mock data
   - Location dropdown becomes enabled after selecting organization
   - Location dropdown populates with mock locations
   - Load button is disabled until all filters are selected

2. **Load Button**
   - Shows loading state
   - Displays mock data in table
   - Shows success notification

3. **Delete Button**
   - Disabled when no data
   - Enabled when data exists
   - Opens confirmation modal
   - Shows loading state during deletion
   - Clears table after deletion
   - Shows success notification

## 📝 Notes

- Mock data includes 2 sample records
- Pagination is set to 10 records per page
- Global search is disabled (can be enabled if needed)
- Column filters are disabled (can be enabled if needed)
- Year dropdown shows current year + 10 previous years

## 🔄 Next Steps

1. Create backend API endpoints:
   - `GET /api/organizations` - List organizations
   - `GET /api/locations?organizationId=<id>` - List locations
   - `POST /api/activity-data` - Load activity data
   - `DELETE /api/activity-data` - Delete activity data

2. Update the hook's placeholder functions with actual API calls

3. Adjust table columns based on actual data structure

4. Add additional validations if needed

5. Consider adding:
   - Export to CSV functionality
   - Bulk selection for deletion
   - Advanced filters
   - Date range picker instead of month/year

## 📚 Reference

This feature follows the architecture pattern from:
- `apps/web/src/app/ghg/admin/(features)/uom-conversion`
- `apps/web/src/app/ghg/admin/(features)/emission-factors`
- `apps/web/src/app/ghg/admin/(features)/emission-calculations-retrigger`
