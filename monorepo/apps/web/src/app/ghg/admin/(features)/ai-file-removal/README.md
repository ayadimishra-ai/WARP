# AI File Removal Feature

## File Structure

```
ai-file-removal/
├── listing/
│   └── page.tsx                              # Main page with auth guard
├── components/
│   ├── ai-file-removal-table.tsx             # Main UI component with filter and table
│   └── ai-file-removal-server.ts             # Server actions and API calls
├── hooks/
│   └── use-ai-file-removal.tsx               # State management and business logic
├── types/
│   └── index.ts                              # TypeScript interfaces
├── constants/
│   └── index.ts                              # Constants
└── README.md                                 # This file
```

## Feature Overview

A super-admin feature to view and delete AI file uploads by organization.

### Features:
- Organization dropdown filter
- Load data button to fetch AI file uploads
- Display all files uploaded by users in the selected organization
- Multi-select deletion with row selection
- Delete button with confirmation modal
- Loading states
- Empty states
- Success/Error notifications

## Usage

### Access the Page

Navigate to: `/ghg/admin/ai-file-removal/listing`

**Full URL:** `http://localhost:3000/ghg/admin/ai-file-removal/listing`

### Page Flow

1. **Select Organization**
   - Choose an organization from the dropdown (required)

2. **Load Data**
   - Click "Load Data" button
   - System fetches all users in the organization using `getAppUserData` query
   - System then fetches all AI file uploads for those users using `GetAIFileUploadsByUser` query
   - Files are displayed in a paginated table

3. **Delete Files**
   - Select rows from the table
   - Click "Delete Selected" button
   - Confirm deletion in modal
   - Selected files are soft deleted (is_deleted set to true)

## Implementation Details

### Data Flow

1. **Organization Selection** - User selects an organization from dropdown
2. **Fetch Users** - `getUsersByOrganization()` fetches all users in that organization using `getAppUserData` GraphQL query
3. **Fetch File Uploads** - `getAiFileUploadsByUsers()` fetches all AI file uploads for those user IDs using `GetAIFileUploadsByUser` GraphQL query
4. **Display** - Files are displayed in a table with columns:
   - File Name
   - Status
   - Uploaded By (User Name)
   - Email
   - File URL (clickable link)

### Queries Used

#### getAppUserData
Fetches users by organization ID with filter for non-deleted users

#### GetAIFileUploadsByUser
Fetches all AI file uploads for given user IDs

## Table Columns

| Column | Description |
|--------|-------------|
| File Name | Name of the uploaded file |
| Status | Current status of the file |
| Uploaded By | Name of user who uploaded the file |
| Email | Email of user who uploaded the file |
| File URL | Clickable link to view/download the file |

## Security

- Protected by `SuperAdminAuthGuard`
- Only super admins can access this page
- Server actions use secure GraphQL SDK

## Notes

- Only shows files from users in the selected organization
- Filters by non-deleted users (`is_deleted: false`)
- Filters by non-deleted files (`is_deleted: false`)
- Delete functionality performs soft delete (sets `is_deleted: true`)
- Deleted files are hidden from the listing
- All console logging is in place for debugging
