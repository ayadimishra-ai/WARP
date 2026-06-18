# Server-Side Pagination API Requirements

## Overview

The `userAndActivityMapping.tsx` component has been refactored to support server-side pagination with **separated data fetching architecture**. The system now uses three dedicated API endpoints instead of a single combined endpoint for better separation of concerns.

## Architecture Changes

### Before

Single API endpoint returned all data:

```
GET /api/v1/master-data/users/user-activity-permission
Response: {activities, addresses, userMappings}
```

### After

Three dedicated API endpoints with independent data fetching:

```
GET /api/v1/activity (fetches all activities)
GET /api/v1/organization-address (fetches all addresses)
GET /api/v1/master-data/users/user-activity-permission (fetches paginated user mappings)
```

## API Endpoints

### 1. Activity Endpoint (NEW)

`GET /api/v1/activity`

### 2. Organization Address Endpoint (NEW)

`GET /api/v1/organization-address`

### 3. User Activity Permission Endpoint (MODIFIED)

`GET /api/v1/master-data/users/user-activity-permission`

---

## API Endpoint Details

### 1. GET /api/v1/activity

**Purpose**: Fetch all activities for the organization

**Authentication**: Required (apiAuthGuard)

**Rate Limiting**: 60 requests per minute with progressive delay

**Query Parameters**: None (uses organizationId from user session)

**Response Format**:

```typescript
{
  success: true,
  data: Activity[] // Array of all activities
}
```

**Example Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "activity-id-1",
      "code": "SCOPE1",
      "name": "Scope 1 Emissions",
      "parent_code": null,
      "metadata": {
        "ui": {
          "listing": {
            "column_name": "Scope 1",
            "column_index": 1
          }
        }
      }
    }
  ]
}
```

**Implementation Notes**:

- Uses `await getGraphQlServerSDK().getActivities({ organizationId })`
- Returns all activities (not paginated) as they are used for table headers
- Called once on component mount

---

### 2. GET /api/v1/organization-address

**Purpose**: Fetch all organization addresses/locations

**Authentication**: Required (apiAuthGuard)

**Rate Limiting**: 60 requests per minute with progressive delay

**Query Parameters**: None (uses organizationId from user session)

**Response Format**:

```typescript
{
  success: true,
  data: OrganizationAddress[] // Array of all organization addresses
}
```

**Example Response**:

```json
{
  "success": true,
  "data": [
    {
      "id": "org-address-id-1",
      "Address": {
        "id": "address-id-1",
        "name": "Main Office",
        "code": "HQ001",
        "type": "Office",
        "ownership_type": "Owned"
      }
    }
  ]
}
```

**Implementation Notes**:

- Uses `await getGraphQlServerSDK().getAddresses({ organisationAddressId: organizationId })`
- Returns all addresses (not paginated) as they are used for location dropdown
- Called once on component mount
- Component transforms this data into dropdown format and location allowed activities

---

### 3. GET /api/v1/master-data/users/user-activity-permission (MODIFIED)

**Purpose**: Fetch paginated user activity mappings with search support

**Authentication**: Required (apiAuthGuard)

**Rate Limiting**: 60 requests per minute with progressive delay

**Changes from Original**:

- ❌ **Removed**: `allActivities` from response (now in dedicated `/api/v1/activity` endpoint)
- ❌ **Removed**: `orgAddress` from response (now in dedicated `/api/v1/organization-address` endpoint)
- ✅ **Added**: Pagination support with `pageIndex` and `pageSize`
- ✅ **Added**: Search functionality with `search` parameter
- ✅ **Added**: `totalCount` in response for pagination controls

**Query Parameters**:

### Pagination Parameters

- `pageIndex` (required): Zero-based page index
  - Type: string (converted from number)
  - Example: `"0"` (first page), `"1"` (second page), `"2"` (third page)
- `pageSize` (required): Number of records per page
  - Type: string (converted from number)
  - Default values used in UI: 1000, 2000, 3000
  - Example: `"1000"`

### Search Parameter

- `search` (optional): Search term for filtering users
  - Type: string
  - Searches in: username and location name fields
  - Example: `"john"`, `"office"`

## Example API Calls

```
# Fetch activities (called once on mount)
GET /api/v1/activity

# Fetch addresses (called once on mount)
GET /api/v1/organization-address

# Fetch paginated user mappings (first page, 10 records)
GET /api/v1/master-data/users/user-activity-permission?pageIndex=0&pageSize=10

# Fetch second page with search
GET /api/v1/master-data/users/user-activity-permission?pageIndex=1&pageSize=10&search=john

# Fetch with different page size
GET /api/v1/master-data/users/user-activity-permission?pageIndex=0&pageSize=1000
```

## Response Formats

### Activity Endpoint Response

```typescript
{
  success: true,
  data: Activity[]
}
```

### Organization Address Endpoint Response

```typescript
{
  success: true,
  data: OrganizationAddress[]
}
```

### User Activity Permission Endpoint Response (UPDATED)

The API response has been simplified to only return user mappings data:

```typescript
{
  success: true,
  data: {
    userActivityMappings: view_user_activity_mappings[], // Paginated and filtered user mappings
    totalCount: number                                   // Total count of records (before pagination)
  }
}
```

**Key Changes**:

1. ❌ **Removed `allActivities`**: Now fetched from `/api/v1/activity`
2. ❌ **Removed `orgAddress`**: Now fetched from `/api/v1/organization-address`
3. ✅ **Simplified to `userActivityMappings`**: Only returns paginated user mapping data
4. ✅ **Added `totalCount`**: Total count of all user records matching the search criteria (before pagination)

**Previous Response Structure** (for reference):

```typescript
// OLD - No longer used
{
  data: {
    allActivities: Activity[],
    appUserData: AppUser[],
    userPermission: UserOrganizationAddressMapping[],
    orgAddress: {
      OrganizationAddress: OrganizationAddress[]
    },
    totalCount: number
  }
}
```

## Backend Implementation Guide

### Updated Service Layer: `GetAppUserPermissionDetail()`

**Location**: `lib/user/form/user.service.ts`

**Changes Made**:

- ❌ **Removed**: `sdk.getActivities()` call
- ❌ **Removed**: `sdk.getAddresses()` call
- ✅ **Simplified**: Now only fetches user activity mappings with pagination

### Implementation for User Activity Permission Endpoint

### 1. Parse Query Parameters

```typescript
const pageIndex = parseInt(searchParams.get("pageIndex") || "0", 10);
const pageSize = parseInt(searchParams.get("pageSize") || "10", 10);
const searchTerm = searchParams.get("search") || "";

const pagination = {
  pageIndex,
  pageSize,
};
```

### 2. Apply Search Filter (if provided)

Filter user mappings by username or location name:

```typescript
// Pseudo-code
const searchFilter = search
  ? {
      OR: [
        { name: { contains: search, mode: "insensitive" } },
        {
          organizationAddress: {
            address: { name: { contains: search, mode: "insensitive" } },
          },
        },
      ],
    }
  : {};
```

### 3. Get Total Count

```typescript
// Get total count of user mappings matching the search criteria
const totalCount = await getUserActivityMappingsCount({
  where: searchFilter,
});
```

### 4. Apply Pagination

```typescript
const offset = pageIndex * pageSize;
const userActivityMappings = await getUserActivityMappingsPaginated({
  where: searchFilter,
  offset: offset,
  limit: pageSize,
  // ... include user details, organization, address, activities
});
```

### 5. Return Response

```typescript
return NextResponse.json({
  success: true,
  data: {
    userActivityMappings, // Paginated user mappings
    totalCount, // Total count for pagination
  },
});
```

**Note**: Activities and addresses are no longer returned from this endpoint.

## Frontend Changes Summary

The component has been completely refactored with a new data fetching architecture:

### 1. New State Variables Added

```typescript
// Activity data state
const [allActivitiesData, setAllActivitiesData] = useState<
  GetActivitiesQuery["Activity"]
>([]);
const [isLoadingActivities, setIsLoadingActivities] = useState(false);

// Address data state
const [orgAddressData, setOrgAddressData] = useState<
  GetAddressesQuery["OrganizationAddress"]
>([]);
const [isLoadingAddress, setIsLoadingAddress] = useState(false);

// Existing states
const [totalCount, setTotalCount] = useState(0);
const [debouncedSearchTerm, setDebouncedSearchTerm] = useState<string>("");
```

### 2. New useEffect Hooks for Independent Data Fetching

#### Fetch Activities (runs once on mount)

```typescript
useEffect(() => {
  const fetchActivities = async () => {
    setIsLoadingActivities(true);
    try {
      const response = await apiClientWithAuth.get("/api/v1/activity");
      if (response?.status === 200 && response?.data?.success) {
        setAllActivitiesData(response?.data?.data);
      }
    } catch (error) {
      console.error("Error fetching activities:", error);
    } finally {
      setIsLoadingActivities(false);
    }
  };
  fetchActivities();
}, []); // Empty dependency array - runs once on mount
```

#### Fetch Addresses (runs once on mount)

```typescript
useEffect(() => {
  const fetchAddresses = async () => {
    setIsLoadingAddress(true);
    try {
      const response = await apiClientWithAuth.get(
        "/api/v1/organization-address"
      );
      if (response?.status === 200 && response?.data?.success) {
        setOrgAddressData(response?.data?.data);
        // Transform addresses into dropdown format
        const allLocations = response?.data?.data?.map(
          (items: GetAddressesQuery["OrganizationAddress"][number]) => ({
            label: items?.Address?.name,
            value: items?.id,
          })
        ) as Tdropdown[];
        setlocationDropdown(allLocations);
      }
    } catch (error) {
      console.error("Error fetching addresses:", error);
    } finally {
      setIsLoadingAddress(false);
    }
  };
  fetchAddresses();
}, []); // Empty dependency array - runs once on mount
```

### 3. New Helper Functions Created

#### `processActivitiesData(activities)`

- Filters activities by `parent_code == null`
- Maps activities to header format with name, code, and sort order
- Returns `{ dynamicHeaderdata, headercontent }`

#### `processLocationDetails(addresses)`

- Maps addresses to location details with allowed activities
- Calculates allowed activities based on address type and ownership type
- Returns array of `{ orgAddressId, allowedActivities }`

#### `processUserActivityMappings(userData, dynamicHeaderdata, headercontent)`

- Extracted from inline code for better separation of concerns
- Processes user activity mappings into table row data
- Handles both users with and without permissions
- Returns `UserActivityRow[]`

### 4. Updated Search Debouncing

```typescript
// Debounce changed from 500ms to 200ms
useEffect(() => {
  const timer = setTimeout(() => {
    setDebouncedSearchTerm(searchTerm);
  }, 200);
  return () => clearTimeout(timer);
}, [searchTerm]);
```

### 5. Modified Data Fetching in getUserData

```typescript
useEffect(() => {
  const getUserData = async () => {
    // Wait for activities and address data to be loaded first
    if (
      !allActivitiesData ||
      allActivitiesData?.length === 0 ||
      !orgAddressData ||
      orgAddressData?.length === 0
    ) {
      return;
    }

    // ... existing loading logic ...

    // Fetch only user mappings (activities and addresses already loaded)
    const userData = await apiClientWithAuth.get(
      `/api/v1/master-data/users/user-activity-permission?${params.toString()}`
    );

    // Process data using helper functions
    const { dynamicHeaderdata, headercontent } =
      processActivitiesData(allActivitiesData);
    const rowData = processUserActivityMappings(
      userData,
      dynamicHeaderdata,
      headercontent
    );
    const locationDetail = processLocationDetails(orgAddressData);

    // ... set states ...
  };
  getUserData();
}, [
  pagination.pageIndex,
  pagination.pageSize,
  debouncedSearchTerm,
  allActivitiesData, // NEW DEPENDENCY
  orgAddressData, // NEW DEPENDENCY
]);
```

### 6. Updated Loading State

```typescript
state: {
  isLoading: isLoading || isLoadingActivities || isLoadingAddress,
  showProgressBars: isRefetching,
  pagination,
}
```

### 7. Data Flow Changes

**Before**:

```
Component mount → Fetch all data → Process → Render
                 (single API call)
```

**After**:

```
Component mount → Fetch activities → Store in state
                → Fetch addresses → Store in state
                → Wait for both → Fetch user mappings → Process → Render
                                 (depends on pagination/search)
```

## Testing Checklist

### Activity API Tests

- [ ] `/api/v1/activity` returns all activities for organization
- [ ] Response format matches `{success: true, data: Activity[]}`
- [ ] Authentication is required
- [ ] Rate limiting works (60 requests/minute)

### Organization Address API Tests

- [ ] `/api/v1/organization-address` returns all addresses for organization
- [ ] Response format matches `{success: true, data: OrganizationAddress[]}`
- [ ] Authentication is required
- [ ] Rate limiting works (60 requests/minute)

### User Activity Permission API Tests

- [ ] API returns correct total count in `totalCount`
- [ ] Response no longer includes `allActivities` or `orgAddress`
- [ ] Response format matches `{success: true, data: {userActivityMappings, totalCount}}`
- [ ] Pagination works correctly (pageIndex 0, 1, 2, etc.)
- [ ] Search filters users correctly
- [ ] Search + pagination work together
- [ ] Page size changes work (5,10, 15, 20)
- [ ] Empty search returns all records
- [ ] Special characters in search are handled properly
- [ ] Performance is acceptable with large datasets

### Frontend Integration Tests

- [ ] Activities load on component mount
- [ ] Addresses load on component mount
- [ ] User mappings load after activities and addresses are ready
- [ ] Table headers render correctly from activities data
- [ ] Location dropdown renders correctly from addresses data
- [ ] Pagination controls display total count correctly
- [ ] Search triggers debounced API call (200ms delay)
- [ ] Loading states work for all three API calls
- [ ] All three loading states are combined in table loading indicator

## Notes

### Architecture Benefits

- **Separation of Concerns**: Each API endpoint has a single responsibility
- **Better Caching**: Activities and addresses can be cached independently
- **Improved Performance**: Only user mappings are re-fetched on pagination/search
- **Reduced Payload**: Smaller response sizes as data is split across endpoints
- **Independent Loading**: Activities and addresses load in parallel on mount

### Performance Considerations

- The debounce delay is set to 200ms for better responsiveness
- Activities and addresses are fetched once on mount (not re-fetched on pagination)
- Only user mappings API is called when pagination or search changes
- Consider adding indexes on frequently searched columns (username, location name) for better performance

### TypeScript Type Safety

- All API responses use properly typed GraphQL generated types
- Component uses indexed access types: `GetActivitiesQuery["Activity"]`, `GetAddressesQuery["OrganizationAddress"]`
- No `any` types used in data transformations (except in legacy `processUserActivityMappings` function which will be refactored later)

### Code Organization

- Helper functions extracted for better maintainability:
  - `processActivitiesData()` - Processes activities for table headers
  - `processLocationDetails()` - Processes addresses with allowed activities
  - `processUserActivityMappings()` - Processes user mappings into row data
- Separate useEffect hooks for independent data fetching
- Clear separation between data loading and data processing

### Migration Notes

If migrating from the old single-endpoint approach:

1. Activities API (`/api/v1/activity`) must be created first
2. Organization Address API (`/api/v1/organization-address`) must be created second
3. User Activity Permission API response must be updated to remove `allActivities` and `orgAddress`
4. Frontend component must be updated with new state variables and useEffect hooks
5. Service layer (`GetAppUserPermissionDetail()`) must remove activities and addresses queries
