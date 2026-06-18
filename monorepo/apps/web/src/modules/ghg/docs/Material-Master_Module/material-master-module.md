# Material Master Module

**Version:** 2.0 | **Updated:** March 12, 2026 | **Status:** Production

---

## Overview

The Material Master Module manages organizational material and product definitions through bulk Excel uploads. It enforces intelligent update restrictions based on whether materials are actively used in GHG emission calculations, ensuring data integrity across the system.

**Key Capabilities:**
- Bulk insert and update operations via Excel (up to 10,000 records)
- Activity-aware validation across 4 GHG emission tables
- Automated UoM mismatch detection and notification
- Comprehensive error reporting with downloadable error files
- All-or-nothing transaction processing

---

## Business Rules

### Material Identity

**Material Code (Unique Identifier)**
- Acts as the primary identifier for all materials
- Must be unique within each organization (multi-tenant isolation)
- Immutable once created - cannot be changed via any method
- Duplicates within a single upload file trigger complete rejection

**Material Name (Non-Unique)**
- Multiple materials can share the same name
- Example: "Steel Rod" can exist for codes "MAT001" and "MAT002"
- Can be updated only if the material is not linked to any activity data

### Operation Rules

**Supported Operations:**
- INSERT: Create new material records
- UPDATE: Modify existing material records based on activity linkage
- DELETE: Not supported via bulk upload

**Transaction Behavior:**
- Complete file validation before any database changes
- Single error in any row causes entire upload to fail
- No partial data commits
- Failed uploads generate downloadable error file with row-specific issues

---

## Update Scenarios

The system enforces different update rules based on activity data linkage. Four distinct scenarios govern what can be modified:

### Scenario A: No Activity Linkage
**Condition:** Material exists in master data but not used in any emission calculations

**Allowed Updates:**
- Material Name
- Material Type
- Material Weight
- Unit of Measure (UoM)
- Material Classification
- Material Description
- Additional Information

**Blocked:**
- Material Code (always immutable)

**Example:** Material "MAT001" exists as "Raw Material". Since it's not used in any activity, you can change its type to "Capital Goods" without restrictions.

---

### Scenario B: Activity Linkage with Matching UoM
**Condition:** Material is used in activities AND the uploaded UoM matches the existing UoM

**Allowed Updates:**
- Material Weight (value update)
- UoM (if unchanged)
- Material Classification
- Material Description
- Additional Information

**Blocked:**
- Material Name → Error: "Material Name cannot be updated - linked to activity data"
- Material Type → Error: "Material Type cannot be updated - linked to activity data"
- Material Code (always immutable)

**Notifications:** None (UoM consistency means no emission impact)

**Example:** Material "MAT002" used in GHGMaterialProcurement with UoM "kilogram". Upload with UoM "kilogram" and new weight 2.5kg succeeds. Attempting to change type to "Capital Goods" fails with error.

---

### Scenario C: UoM Mismatch
**Condition:** Material is used in activities BUT uploaded UoM differs from existing UoM

**Allowed Updates:**
- Material Weight
- UoM (even when different - master data is source of truth)
- Material Classification
- Material Description
- Additional Information

**Blocked:**
- Material Name
- Material Type
- Material Code (always immutable)

**Notifications:**
- Email triggered to designated recipients
- Contains: affected material code, old vs new UoM, impacted activity records, action required

**Future Behavior (Planned):**
- Affected activity emission values set to zero
- Emissions recalculated after activity data corrected

**Example:** Material "MAT003" exists with UoM "kilogram", used in GHGCapitalGoods. Upload with UoM "ton" succeeds with notification email stating: "UoM mismatch detected for MAT003. Previous: kilogram, New: ton. Action Required: Update activity data to match new UoM."

---

### Scenario D: Material Type Update Attempt
**Condition:** Attempt to change Material Type when material is linked to any activity

**Behavior:**
- Material Type update blocked with row-level error
- Other non-restricted fields in same row still processed
- Error message includes specific material code

**Error Format:** "Material Type cannot be updated for Material Code [MAT004] as it is already linked to activity data"

**Example:** Material "MAT004" exists as "Raw Material" and used in GHGProductShareAttribution. Upload attempting to change type to "Capital Goods" fails with error. However, updates to weight, classification, or description in the same row succeed.

---

### Insert Operations (New Materials)

**Behavior:**
- Creates record even if optional fields are blank
- Only Material Name, Material Code, and Material Type are required
- Missing weight for Capital Goods triggers notification but record still created
- No activity linkage exists at creation, so no restrictions apply

**Missing Weight Notification:**
- Triggered when Material Type requires weight (e.g., Capital Goods)
- Weight field is blank or zero
- Email sent: "Material [CODE] created without required weight. Type: [TYPE]. Update for accurate calculations."

---

## Data Structure

### Material Master Fields

| Field | Required | Type | Max Length | Validation | Notes |
|-------|----------|------|------------|------------|-------|
| Material Name | Yes | Text | 500 chars | Alphanumeric + special chars (. - _ ; ,) | Auto-trimmed, spaces collapsed |
| Material Code | Yes | Text | 500 chars | Alphanumeric + special chars, no spaces | Unique per organization, immutable |
| Material Type | Yes | Dropdown | - | Must match predefined list | See valid values below |
| Material Weight | No | Decimal | 4 decimal places | Non-negative | Required for Capital Goods (recommended) |
| UoM of Material Weight | Conditional | Dropdown | - | Must match predefined list | Required if weight provided |
| Material Classification | No | Text | 500 chars | - | Optional categorization |
| Material Description | No | Text | 4000 chars | - | Detailed material description |
| Additional Information | No | Text | 4000 chars | - | Supplementary notes |

**Valid Material Types:**
- Raw Material
- Capital Goods
- Finished Goods
- Semi-Finished Goods
- Packing Material
- Consumables
- Others

**Valid UoM Values:**
- kilogram, gram, ton, metric ton
- litre, millilitre, cubic meter
- piece, unit

### Activity Linkage  Tables

The system queries these tables to determine material usage:

**GHGCapital_Goods** - Capital goods procurement
**GHGMaterialProcurement** - Raw material procurement
**GHGTransport_Upstream** - Upstream transportation
**GHGProductShareAttribution** - Product share allocation

All queries scoped by organization address IDs for multi-tenant isolation.

---

## Process Flow

### Upload Workflow

**1. File Preparation**
- User downloads Excel template
- Fills material data (max 10,000 rows)
- Uploads file to S3 via presigned URL

**2. Template Validation**
- Checks sheet structure ("Material Master data" sheet required)
- Verifies all required columns present
- Validates row count ≤ 10,000
- Confirms data format consistency

**3. Activity Mapping**
- Fetches existing materials for organization
- Queries 4 activity tables for material usage
- Builds activity mapping with UoM information
- Determines which scenario applies to each material

**4. Field Validation**
- Validates each field per row (8 fields × scenarios)
- Checks Material Code uniqueness within file
- Verifies Material Type against allowed values
- Validates conditional UoM requirement
- Applies scenario-based update restrictions

**5. Error Handling**
- If any row fails: Generate error file, upload to S3, abort transaction
- Error file contains: row number, field value, specific error message

**6. Data Persistence**
- If all valid: Execute INSERT for new materials, UPDATE for existing
- Log operation in import history with summary statistics
- Track UoM mismatches and missing weights

**7. Notifications**
- Trigger email for UoM mismatches (details affected materials and activities)
- Trigger email for missing weights (lists Capital Goods without weight)

**8. Response**
- Success: Return summary (total rows, added, updated, mismatches, missing weights)
- Failure: Return error file URL for download

---

## Component Architecture

### Backend Components

**Location:** `app/api/v1/master-data/materials/excel/`

**API Route** (`route.ts`)
- Handles POST request for material upload
- Orchestrates validation → save → notification flow
- Rate limiting: 60 requests/minute
- Returns import history record with summary

**Validation Layer** (`lib/material-master/`)

- `material-master-excel.validation.ts` - Orchestrates full validation process
- `field-validators.ts` - Individual field validation logic
- `material-master-rules.config.ts` - Scenario rule definitions
- `material-master-rule-engine.ts` - Applies rules based on context
- `base-scenario-rule.ts` - Base class for scenario handlers
- `scenario-rules/*.ts` - Scenario A, B, C, D implementations

**Services** (`lib/material-master/`)

- `material-master-excel.service.ts` - Insert/update operations
- `material-activity-mapping.service.ts` - Queries activity tables for usage
- `validation.interfaces.ts` - Shared types and data mappers

**GraphQL Queries** (`graphql/queries/`)

- `check-material-used-in-activities.gql` - Fetches material usage from 4 activity tables
- `get-organization-address-ids.gql` - Retrieves org address IDs for scoping
- `get-material-with-activity-usage.gql` - Combined material + activity query

**Shared Services** (`shared/services/`)

- `material-master.service.ts` - Template download helper
- `error-file-upload.service.ts` - Error Excel generation and S3 upload
- `master-data-import-history.service.ts` - Audit log persistence

### Frontend Components

**Location:** `components/`

**Material Listing** (`common-table/materialListingTable.tsx`)
- Displays paginated material list
- Server-side sorting and searching
- Bulk upload trigger via dropdown menu
- Template download integration

**Empty State** (`material-listing-add-material/addMaterialPage.tsx`)
- Shown when no materials exist
- Provides upload guidance and template download
- Dropdown menu: "Bulk Upload Data" and "Download Template"

**Platform Integration** (`shared/services/platform-window-message-service.ts`)
- Message passing to parent application
- Triggers bulk upload modal in parent

---

## API Endpoints

### Get S3 Upload URL
**POST** `/api/v1/file-system/get-s3-upload-url/material-master-import`

Generates presigned S3 URL for Excel upload.

**Request:**
- fileType: Excel MIME type

**Response:**
- uploadUrl: S3 presigned URL for PUT
- fileUrl: S3 URL for file retrieval
- Stored in folder: `material-master-uploads/`

### Process Material Upload
**POST** `/api/v1/master-data/materials/excel`

Validates and imports material data from Excel.

**Request:**
- organizationId: UUID
- fileUrl: S3 URL from previous endpoint

**Success Response:**
- Import history record with status "successful"
- Summary: total_rows, rows_added, rows_updated, uom_mismatches, missing_weights
- Notifications: flags for email triggers

**Failure Response:**
- Import history record with status "failure"
- Error file URL for download from S3

---

## Error Handling

### Template Errors (Immediate Rejection)

- Missing "Material Master data" sheet
- Missing required columns
- Incorrect column order
- More than 10,000 rows
- Empty data section

### Field-Level Errors (Row-Specific)

- Required field blank (Material Name, Material Code, Material Type)
- Invalid Material Type (not in predefined list)
- Invalid UoM (not in predefined list)
- Negative Material Weight
- Material Code with spaces
- Material Code duplicate within file
- Material Weight provided without UoM
- Field exceeds maximum length

### Business Rule Errors (Scenario-Based)

- Material Type update when activity linked (Scenario D)
- Material Name update when activity linked (Scenarios B/C/D)
- Material Code update attempt (always immutable)

**Error File Format:**
Excel file with sheet "Error Data" containing:
- Row Number
- Field Name
- Field Value
- Error Message

Uploaded to S3 folder: `master-data-uploads-failure/`

---

## Notifications

### UoM Mismatch Email
**Triggered:** When uploaded UoM differs from existing (Scenario C)

**Contains:**
- Material Code
- Material Name
- Old UoM vs New UoM
- List of affected activity records
-Action required: Update activity data to match

**Status:** Email service integration pending (TODO)

### Missing Weight Email
**Triggered:** New Capital Goods material created without weight

**Contains:**
- Material Code
- Material Name
- Material Type
- Action required: Add weight for accurate emission calculations

**Status:** Email service integration pending (TODO)

---

## Testing Considerations

### Test Scenarios
- **Template validation**: Wrong sheet names, missing columns, excess rows
- **Insert operations**: All fields, optional fields blank, Capital Goods without weight
- **Scenario A**: Update all fields when no activity linkage
- **Scenario B**: Update allowed fields with matching UoM, block type/name changes
- **Scenario C**: UoM mismatch triggers notification, blocks type/name changes
- **Scenario D**: Type change blocked with error, other fields proceed
- **Edge cases**: Single row file, partial uploads, duplicate codes

### Performance Benchmarks
- 100 rows: < 5 seconds
- 1,000 rows: < 15 seconds
- 10,000 rows: < 60 seconds

---

## Future Enhancements

**Automatic Emission Recalculation**
- Set emissions to zero for UoM mismatch scenarios
- Trigger background recalculation job
- Update emissions after activity data corrected

**Bulk Delete Operation**
- Separate endpoint with safeguards
- Prevent deletion of materials used in activities

**Email Notification Service**
- Complete integration for UoM mismatch alerts
- Complete integration for missing weight alerts

**Audit Log Enhancement**
- Field-level change tracking
- Before/after values for all updates

**Template Flexibility**
- Support for column reordering
- Optional fields configuration

---

## Troubleshooting

**"No data found in sheet"**
→ Sheet must be named exactly "Material Master data" (case-sensitive)

**"Material Type cannot be updated"**
→ Material is used in emission calculations. Cannot change type. Create new material code if type change needed.

**"Duplicate Entry Detected"**
→ Same Material Code appears multiple times in upload file. Each code must be unique within file.

**"UoM required when Material Weight provided"**
→ If weight is filled, UoM must also be specified. Either provide both or leave both blank.

**"Maximum 10,000 records exceeded"**
→ Split upload into multiple files under 10,000 rows each.

---

**Maintained By:** Development Team | **Contact:** tech-lead@snowkap.com
