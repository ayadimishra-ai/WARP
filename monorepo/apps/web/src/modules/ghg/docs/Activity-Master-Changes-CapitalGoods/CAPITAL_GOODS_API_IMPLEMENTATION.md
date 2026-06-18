# Capital Goods API Implementation Summary

## API Endpoint Created

**URL**: `api/v1/ghg-data-import/transaction/capital-goods/excel`
**Method**: POST

## Files Created

### 1. API Route

- **Path**: `app/api/v1/ghg-data-import/transaction/capital-goods/excel/route.ts`
- **Purpose**: Main API endpoint handler for Capital Goods excel import
- **Features**:
  - Excel file validation
  - Data import with error handling
  - Emission calculation integration
  - Audit logging
  - Email notifications for missing emission factors

### 2. Service File

- **Path**: `lib/organization-transaction/capital-goods/capital-goods-excel.service.ts`
- **Purpose**: Business logic for Capital Goods data processing
- **Key Functions**:
  - `saveCapitalGoodsSheetEntries()` - Saves capital goods data to database
  - `sendEmailForCapitalGoods()` - Sends email notifications
  - Batch processing support for large datasets (1000 records per batch)
  - Material and Supplier master auto-generation

### 3. Validation File

- **Path**: `lib/organization-transaction/capital-goods/capital-goods-excel.validation.ts`
- **Purpose**: Excel template and data validation
- **Key Functions**:
  - `validateExcelTemplate()` - Validates sheet structure and columns
  - `validateExcelTemplateData()` - Validates data against business rules
  - Schema validation using Zod
  - Activity master data validation

## Files Modified

### 1. Activity Constants

- **Path**: `shared/constants/activity.constant.ts`
- **Changes**:
  - Added `CapitalGoodsActivityConstant` with excel template definition
  - Added "Capital Goods": "capital_goods" to `ActivityNameCodes`
  - Defined Capital Goods sheet structure with columns:
    - Year
    - Month
    - Material Code
    - Supplier Code
    - Quantity Procured
    - Quantity Procured UOM

### 2. Input Constants

- **Path**: `shared/constants/input.constant.ts`
- **Changes**:
  - Added `capital_goods: ["capital_goods_quantity_procured_uom"]` to `ActivityMasterKey`

### 3. Audit Log Service

- **Path**: `lib/auditlog/auditlog.service.ts`
- **Changes**:
  - Added `saveGHGCapitalGoods()` function for audit logging to ClickHouse
  - Supports batch processing with 1000 records per batch

## Database Requirements (To Be Completed)

### 1. GraphQL Schema

**Status**: ⚠️ **NEEDS TO BE CREATED**

Required GraphQL types and mutations:

```graphql
# Type Definition
type GhgCapital_Goods {
  id: uuid!
  organization_address_id: uuid!
  task_request_id: uuid!
  activity_task_request_id: uuid!
  Material_Code: String
  Supplier_Code: String
  Quantity_Procured: Float
  Quantity_Procured_uom: String
  supporting_docs: jsonb
  meta_data: jsonb
  created_at: timestamptz
  updated_at: timestamptz
  created_by: uuid
  updated_by: uuid
}

# Input Type
input GhgCapital_Goods_Insert_Input {
  organization_address_id: uuid!
  task_request_id: uuid!
  activity_task_request_id: uuid!
  Material_Code: String
  Supplier_Code: String
  Quantity_Procured: Float
  Quantity_Procured_uom: String
  supporting_docs: jsonb
  meta_data: jsonb
  created_by: uuid
  updated_by: uuid
}

# Mutation
mutation upsertGHGCapitalGoodsActivity(
  $where: GhgCapital_Goods_Bool_Exp!
  $capitalGoodsData: [GhgCapital_Goods_Insert_Input!]!
) {
  delete_GHGCapital_Goods(where: $where) {
    returning {
      id
      # ... all fields
    }
  }
  insert_GHGCapital_Goods(
    objects: $capitalGoodsData
    on_conflict: {
      constraint: GHGCapital_Goods_pkey
      update_columns: [
        Material_Code
        Supplier_Code
        Quantity_Procured
        Quantity_Procured_uom
        updated_by
        updated_at
      ]
    }
  ) {
    returning {
      id
      # ... all fields
    }
  }
}
```

**Action Required**:

1. Add the GraphQL schema to your GraphQL endpoint
2. Run code generation: `yarn codegen` or `npm run codegen`
3. This will generate the TypeScript types in `graphql/shared/types.ts`

### 2. Database Table

**Status**: ⚠️ **NEEDS TO BE CREATED**

Refer to: `db-migration/capital-goods-sprint-1.md`

SQL to execute:

```sql
CREATE TABLE "GHGCapital_Goods" (
  "id" uuid PRIMARY KEY UNIQUE DEFAULT gen_random_uuid(),
  "organization_address_id" uuid NOT NULL,
  "task_request_id" uuid NOT NULL,
  "activity_task_request_id" uuid NOT NULL,
  "Supplier_Code" text,
  "Material_Code" text,
  "Quantity_Procured" double precision,
  "Quantity_Procured_uom" text,
  "supporting_docs" jsonb,
  "meta_data" jsonb,
  "created_at" timestamp with time zone DEFAULT now(),
  "updated_at" timestamp with time zone DEFAULT now(),
  "created_by" uuid,
  "updated_by" uuid,

  CONSTRAINT "fk_activity_task_request"
    FOREIGN KEY ("activity_task_request_id")
    REFERENCES "ActivityTaskRequest"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_created_by"
    FOREIGN KEY ("created_by")
    REFERENCES "AppUser"("id")
    ON DELETE SET NULL,
  CONSTRAINT "fk_organization_address"
    FOREIGN KEY ("organization_address_id")
    REFERENCES "OrganizationAddress"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_task_request"
    FOREIGN KEY ("task_request_id")
    REFERENCES "TaskRequest"("id")
    ON DELETE CASCADE,
  CONSTRAINT "fk_updated_by"
    FOREIGN KEY ("updated_by")
    REFERENCES "AppUser"("id")
    ON DELETE SET NULL
);
```

### 3. Activity Master Data

**Status**: ⚠️ **NEEDS TO BE ADDED**

Add to ActivityMaster table:

```sql
-- Add master key for quantity UoM
INSERT INTO "ActivityMaster" (master_key, master_data)
VALUES (
  'capital_goods_quantity_procured_uom',
  '[
    {"label": "Kilogram", "value": "kilogram"},
    {"label": "Tonne", "value": "tonne"},
    {"label": "Nos", "value": "nos"},
    {"label": "EA", "value": "ea"},
    {"label": "Gram", "value": "gram"},
    {"label": "Milligram", "value": "milligram"},
    {"label": "Pound", "value": "pound"},
    {"label": "Ounce", "value": "ounce"}
  ]'::jsonb
);
```

### 4. Activity Entry

**Status**: ⚠️ **NEEDS TO BE ADDED**

Add parent and sub-activity to Activity table:

```sql
-- Parent Activity
INSERT INTO "Activity" (name, code, meta_data)
VALUES (
  'CapitalGoods',
  'capitalgoods',
  '{
    "ui": {
      "listing": {
        "column_name": "Capital Goods",
        "column_index": 16
      }
    }
  }'::jsonb
);

-- Sub Activity
INSERT INTO "Activity" (name, code, parent_code, meta_data)
VALUES (
  'Capital Goods',
  'capital_goods',
  'capitalgoods',
  '{
    "download_url_template": "https://beta.snowkap.com/ops/Capital_Goods_Procurement_Template.xlsx"
  }'::jsonb
);
```

### 5. ClickHouse Audit Table

**Status**: ⚠️ **NEEDS TO BE CREATED**

Create audit table in ClickHouse:

```sql
CREATE TABLE snowkap_op_logs.GHGCapital_Goods (
  id UUID,
  op_organization_id UUID,
  user_id UUID,
  organization_address_id UUID,
  task_request_id UUID,
  activity_task_request_id UUID,
  Material_Code String,
  Supplier_Code String,
  Quantity_Procured Float64,
  Quantity_Procured_uom String,
  env String,
  isdeleted Boolean,
  created_by UUID,
  updated_by UUID,
  created_at DateTime DEFAULT now()
) ENGINE = MergeTree()
ORDER BY (op_organization_id, created_at);
```

### 6. Excel Template

**Status**: ⚠️ **NEEDS TO BE UPLOADED**

Upload template file to:

- **URL**: `https://beta.snowkap.com/ops/Capital_Goods_Procurement_Template.xlsx`
- **Columns Required**:
  - Year
  - Month
  - Material Code
  - Supplier Code
  - Quantity Procured
  - Quantity Procured UOM

### 7. Permissions

**Status**: ⚠️ **NEEDS TO BE CONFIGURED**

Grant permissions to:

- Location Executive - Full CRUD access
- Location Admin - Full CRUD access

## Testing Steps

Once all database requirements are completed:

1. **Generate GraphQL Types**:

   ```bash
   yarn codegen
   ```

2. **Test API Endpoint**:

   ```bash
   POST /api/v1/ghg-data-import/transaction/capital-goods/excel
   Content-Type: application/json

   {
     "fileUrl": "https://your-s3-url.com/capital-goods-template.xlsx",
     "organizationAddressId": "uuid-here"
   }
   ```

3. **Verify**:
   - Check data imported in `GHGCapital_Goods` table
   - Check audit logs in ClickHouse
   - Verify emission calculations
   - Check email notification sent

## API Features

✅ **Implemented**:

- Excel template validation
- Data validation with Zod schemas
- Batch processing (1000 records per batch)
- Material and Supplier master auto-generation
- Error handling with detailed error reports
- Audit logging to ClickHouse
- Emission calculation integration
- Email notifications
- Data import history tracking
- Rate limiting (60 requests per minute)
- User permission validation

⚠️ **Pending**:

- GraphQL schema and mutations (needs codegen)
- Database table creation
- Activity master data setup
- ClickHouse audit table
- Excel template upload

## Integration Points

The API integrates with:

- **Emission Calculation Engine**: Calculates emissions after data import
- **Audit Log Service**: Logs all changes to ClickHouse
- **Material/Supplier Master**: Auto-creates missing materials/suppliers
- **Email Service**: Notifies about missing emission factors
- **Data Import History**: Tracks all import attempts
- **Rate Limiter**: Prevents API abuse

## Notes

1. The parent_code is set to "material" to align with existing patterns (material procurement also uses "material" as parent)
2. If you want "capitalgoods" as a separate parent activity, you need to:
   - Add "capitalgoods" to `AppGlobalMasterConstant.activities` in `shared/constants/app-global-master.constant.ts`
   - Add it to all address_activity_mappings arrays
3. The emission calculation uses activity code "capital_goods" - ensure emission factors are configured for this activity type

## Reference Implementation

This implementation follows the same pattern as:

- Material Procurement (`/api/v1/ghg-data-import/transaction/material-procurement/excel`)
- Waste (`/api/v1/ghg-data-import/transaction/waste/excel`)

## Support

For any issues or questions, refer to:

- Migration doc: `db-migration/capital-goods-sprint-1.md`
- Material Procurement implementation as reference
- GraphQL schema documentation
