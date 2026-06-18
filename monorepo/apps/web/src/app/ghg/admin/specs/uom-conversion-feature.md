# UOM Conversion Management - Development Specifications

## 1. Overview

The UOM Conversion Management feature enables Super Admins to manage unit of measurement conversions with associated fuel types for emission calculations. This feature provides CRUD operations (Create, Read, Update - Delete is not allowed) with comprehensive audit logging.

## 2. UI/UX Specifications

### 2.1 Design System

- Follow existing Snowkap design system and component library
- Use consistent spacing, typography, and color schemes
- Responsive design supporting desktop and tablet views
- Implement accessibility standards (WCAG 2.1 AA)

### 2.2 Layout Structure

```
Admin Dashboard > UOM Conversion Management
├── Header Section (Breadcrumb + Page Title)
├── Action Bar (Create New Button + Filters)
├── Data Table (Listing)
└── Footer (Pagination)
```

### 2.3 Visual Elements

- **Primary Actions**: Use primary button styling for "Create New"
- **Secondary Actions**: Use secondary button styling for "Edit"
- **Status Indicators**: Visual feedback for form validation states
- **Loading States**: Skeleton loaders for table and form data
- **Empty States**: Informative message when no data exists

## 3. User Role Permissions

### 3.1 New Role: Super Admin

- **Access Level**: Full administrative access to UOM conversion management
- **Permissions**:
  - View UOM conversion listing
  - Create new UOM conversions
  - Update existing UOM conversions
  - Access audit logs (read-only)
- **Restrictions**:
  - Cannot delete UOM conversions
  - Cannot modify system-generated audit entries

### 3.2 Permission Implementation

- Role-based access control (RBAC) at API level
- Frontend permission checks for UI element visibility
- Route protection for unauthorized access attempts

## 4. Scope & Deliverables

### 4.1 In Scope

- UOM Conversion listing page with full CRUD (except Delete)
- Form creation and validation
- Audit logging implementation
- Super Admin role integration
- Backend API endpoints
- Frontend components and pages

### 4.2 Out of Scope

- Automated emission recalculation (manual process by SK Team)
- Delete functionality for UOM conversions
- Mobile-specific optimizations
- Integration with external UOM services

### 4.3 Rerun Emission Calculation

- **Current Approach**: Manual process only
- **Trigger**: Backend request initiated by SK Team
- **Scope**: No automation implemented in this phase
- **Future Consideration**: Automated recalculation can be added in subsequent phases

## 5. UOM + Fuel Types Integration

### 5.1 Data Relationships

- UOM conversions are linked to specific fuel types
- Each conversion record maps: From UOM → To UOM → Fuel Type
- Support for fuel-agnostic conversions (applicable to all fuel types)

### 5.2 Data Sources

- UOM master data from existing system tables
- Fuel types from current fuel master configuration
- Conversion factors manually entered by Super Admins

## 6. Actions & Permissions Matrix

| Action | Super Admin    | Other Roles | Notes                           |
| ------ | -------------- | ----------- | ------------------------------- |
| Create | ✅ Allowed     | ❌ Denied   | Full create permissions         |
| Read   | ✅ Allowed     | ❌ Denied   | View listing and details        |
| Update | ✅ Allowed     | ❌ Denied   | Edit existing records           |
| Delete | ❌ Not Allowed | ❌ Denied   | Hard restriction - no deletions |

## 7. Audit Logging Requirements

### 7.1 Logged Events

- UOM conversion record creation
- UOM conversion record updates
- Field-level change tracking
- User session information

### 7.2 Audit Data Structure

```json
{
  "eventId": "uuid",
  "userId": "user_id",
  "userName": "user_display_name",
  "action": "CREATE|UPDATE",
  "entityType": "UOM_CONVERSION",
  "entityId": "conversion_record_id",
  "timestamp": "ISO_8601_datetime",
  "changes": {
    "fieldName": {
      "oldValue": "previous_value",
      "newValue": "updated_value"
    }
  },
  "ipAddress": "client_ip",
  "userAgent": "browser_info"
}
```

### 7.3 Implementation

- Backend-only audit logging (no frontend audit triggers)
- Automatic logging on all CUD operations
- Immutable audit records
- Retention policy: 7 years minimum

## 8. Detailed Feature Specifications

### 8.1 Listing Page

#### 8.1.1 Page Structure

```
┌─────────────────────────────────────────────────┐
│ Breadcrumb: Admin > UOM Conversion Management   │
├─────────────────────────────────────────────────┤
│ [Create New] [Filters: UOM▼] [Fuel▼] [Value🔍] │
├─────────────────────────────────────────────────┤
│ ┌─────────────────────────────────────────────┐ │
│ │    Data Table (Sortable Headers)           │ │
│ │ From UOM | To UOM | Factor | Fuel | Actions │ │
│ └─────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────┤
│           Pagination Controls                   │
└─────────────────────────────────────────────────┘
```

#### 8.1.2 Actions

- **Create New Button**
  - Position: Top-right of action bar
  - Action: Opens UOM conversion form modal/page
  - Validation: Super Admin role required

#### 8.1.3 Filters

- **UOM Filter**: Dropdown with From UOM and To UOM options
- **Fuel Filter**: Multi-select dropdown with fuel types + "All Fuels" option
- **Conversion Value Filter**: Numeric range input (min-max)
- **Clear Filters**: Reset all filters to default state

#### 8.1.4 Headers & Sorting

- **Sortable Columns**: From UOM, To UOM, Conversion Factor Value
- **Default Sort**: From UOM (ascending)
- **Sort Indicators**: Visual arrows for sort direction
- **Multi-column Sort**: Not required for initial implementation

#### 8.1.5 Table Columns

| Column                | Data Type    | Width | Sortable | Description                               |
| --------------------- | ------------ | ----- | -------- | ----------------------------------------- |
| From UOM              | String       | 15%   | Yes      | Source unit of measurement                |
| To UOM                | String       | 15%   | Yes      | Target unit of measurement                |
| Conversion Factor     | Decimal      | 20%   | Yes      | Multiplication factor (4 decimal places)  |
| Applicable Fuel Types | String/Array | 35%   | No       | Comma-separated fuel types or "All Fuels" |
| Actions               | Buttons      | 15%   | No       | Edit button only                          |

#### 8.1.6 Footer Actions

- **Pagination**: Standard pagination component
- **Items per page**: 10, 25, 50, 100 options
- **Page info**: "Showing X to Y of Z entries"
- **Navigation**: First, Previous, Page Numbers, Next, Last

### 8.2 Form Specifications

#### 8.2.1 Form Layout

```
┌─────────────────────────────────────────────────┐
│ Create/Edit UOM Conversion                      │
├─────────────────────────────────────────────────┤
│ From UOM *          [Dropdown ▼]              │
│ To UOM *            [Dropdown ▼]              │
│ Conversion Factor * [0.0000    ]              │
│ Applicable Fuel     [None Selected ▼]         │
├─────────────────────────────────────────────────┤
│                    [Cancel] [Save]             │
└─────────────────────────────────────────────────┘
```

#### 8.2.2 Field Specifications

##### From UOM

- **Type**: Single-Select Dropdown
- **Required**: Yes
- **Data Source**: UOM master table
- **Validation**: Must be selected
- **Error Message**: "From UOM is required"

##### To UOM

- **Type**: Single-Select Dropdown
- **Required**: Yes
- **Data Source**: UOM master table
- **Validation**: Must be selected, cannot be same as From UOM
- **Error Messages**:
  - "To UOM is required"
  - "To UOM cannot be the same as From UOM"

##### Conversion Factor Value

- **Type**: Decimal Input
- **Required**: Yes
- **Default**: 0.0000
- **Format**: Up to 10 digits with 4 decimal places
- **Validation**: Must be greater than 0
- **Error Messages**:
  - "Conversion factor is required"
  - "Conversion factor must be greater than 0"
  - "Invalid decimal format (max 4 decimal places)"

##### Applicable Fuel Types

- **Type**: Single-Select Dropdown
- **Required**: No
- **Default**: "None" (applies to all fuel types)
- **Options**:
  - "None" (applies to all fuels)
  - Individual fuel types from fuel master
- **Validation**: Optional field

#### 8.2.3 Form Validations

##### Business Rules

1. **Uniqueness Constraint**: Combination of From UOM + To UOM + Applicable Fuel Types must be unique
2. **Self-Reference Prevention**: From UOM cannot equal To UOM
3. **Positive Values Only**: Conversion factor must be > 0

##### Validation Messages

```json
{
  "unique_constraint": "This UOM conversion already exists for the selected fuel type",
  "self_reference": "From UOM and To UOM cannot be the same",
  "positive_value": "Conversion factor must be greater than zero",
  "required_field": "{fieldName} is required",
  "invalid_format": "Please enter a valid decimal number (max 4 decimal places)"
}
```

##### Client-Side Validation

- Real-time validation on field blur
- Form submission prevention if validation errors exist
- Visual indicators for field validation states (success, error, warning)

##### Server-Side Validation

- Duplicate validation against existing records
- Data type and range validation
- Business rule enforcement

## 9. Technical Implementation

### 9.1 Frontend Architecture

- **Framework**: Next.js with TypeScript
- **State Management**: React hooks + Context API
- **UI Components**: Custom component library
- **Form Management**: React Hook Form with Yup validation
- **API Integration**: GraphQL with Apollo Client

### 9.2 Backend Architecture

- **API**: GraphQL mutations and queries
- **Database**: PostgreSQL with proper indexing
- **Audit**: Dedicated audit table with triggers
- **Validation**: Schema-level and business logic validation

### 9.3 Database Schema

#### UOM Conversions Table

```sql
CREATE TABLE uom_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  from_uom_id UUID NOT NULL REFERENCES uom_master(id),
  to_uom_id UUID NOT NULL REFERENCES uom_master(id),
  conversion_factor DECIMAL(14,4) NOT NULL CHECK (conversion_factor > 0),
  applicable_fuel_type_id UUID REFERENCES fuel_types(id), -- NULL means all fuels
  created_by UUID NOT NULL REFERENCES users(id),
  updated_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

  UNIQUE(from_uom_id, to_uom_id, applicable_fuel_type_id),
  CHECK(from_uom_id != to_uom_id)
);
```

#### Audit Table

```sql
CREATE TABLE uom_conversion_audit (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  entity_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES users(id),
  action VARCHAR(20) NOT NULL CHECK (action IN ('CREATE', 'UPDATE')),
  old_values JSONB,
  new_values JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 9.4 API Endpoints

#### GraphQL Queries

```graphql
# Get UOM conversions with pagination and filters
query GetUomConversions(
  $limit: Int!
  $offset: Int!
  $filters: UomConversionFilters
  $sortBy: String
  $sortOrder: SortOrder
) {
  uomConversions(
    limit: $limit
    offset: $offset
    filters: $filters
    sortBy: $sortBy
    sortOrder: $sortOrder
  ) {
    data {
      id
      fromUom {
        id
        name
      }
      toUom {
        id
        name
      }
      conversionFactor
      applicableFuelType {
        id
        name
      }
      createdAt
      updatedAt
    }
    total
  }
}

# Get master data for form dropdowns
query GetFormMasterData {
  uomMaster {
    id
    name
  }
  fuelTypes {
    id
    name
  }
}
```

#### GraphQL Mutations

```graphql
# Create new UOM conversion
mutation CreateUomConversion($input: CreateUomConversionInput!) {
  createUomConversion(input: $input) {
    id
    fromUom {
      name
    }
    toUom {
      name
    }
    conversionFactor
    applicableFuelType {
      name
    }
  }
}

# Update existing UOM conversion
mutation UpdateUomConversion($id: UUID!, $input: UpdateUomConversionInput!) {
  updateUomConversion(id: $id, input: $input) {
    id
    fromUom {
      name
    }
    toUom {
      name
    }
    conversionFactor
    applicableFuelType {
      name
    }
  }
}
```

## 10. Testing Requirements

### 10.1 Unit Testing

- Form validation logic
- API integration functions
- Utility functions for data transformation

### 10.2 Integration Testing

- End-to-end form submission workflow
- API endpoint testing with various data scenarios
- Role-based access control validation

### 10.3 User Acceptance Testing

- Super Admin workflow testing
- Form validation scenarios
- Data integrity verification
- Audit log accuracy verification

## 11. Performance Considerations

### 11.1 Frontend Optimization

- Lazy loading for form dropdowns with large datasets
- Debounced search/filter inputs
- Virtual scrolling for large table datasets
- Memoization of expensive calculations

### 11.2 Backend Optimization

- Database indexing on filter columns
- Pagination with proper LIMIT/OFFSET
- GraphQL query optimization
- Audit log archival strategy

## 12. Security Considerations

### 12.1 Access Control

- JWT-based authentication
- Role-based authorization middleware
- API endpoint protection
- Input sanitization and validation

### 12.2 Data Protection

- SQL injection prevention
- XSS protection on form inputs
- Secure audit log storage
- HTTPS enforcement

## 13. Deployment & Release

### 13.1 Development Phases

1. **Phase 1**: Database schema and backend API
2. **Phase 2**: Frontend components and forms
3. **Phase 3**: Integration testing and bug fixes
4. **Phase 4**: UAT and production deployment

### 13.2 Rollback Plan

- Database migration rollback scripts
- Feature flag implementation for gradual rollout
- Backup strategy for configuration changes

## 14. Future Enhancements

### 14.1 Potential Improvements

- Bulk import/export functionality
- Automated emission recalculation triggers
- Advanced filtering and search capabilities
- Integration with external UOM conversion services
- Mobile-responsive optimizations

### 14.2 Scalability Considerations

- Microservice architecture preparation
- Caching layer implementation
- API rate limiting
- Database partitioning strategies

---

**Document Version**: 1.0  
**Last Updated**: October 23, 2025  
**Author**: Development Team  
**Review Status**: Pending Approval
