# Capital Goods API - Deployment Checklist

## ✅ Completed

- [x] Created API route: `app/api/v1/ghg-data-import/transaction/capital-goods/excel/route.ts`
- [x] Created service file: `lib/organization-transaction/capital-goods/capital-goods-excel.service.ts`
- [x] Created validation file: `lib/organization-transaction/capital-goods/capital-goods-excel.validation.ts`
- [x] Added `CapitalGoodsActivityConstant` to `shared/constants/activity.constant.ts`
- [x] Added "Capital Goods" to `ActivityNameCodes`
- [x] Added `capital_goods` to `ActivityMasterKey` in `shared/constants/input.constant.ts`
- [x] Added `saveGHGCapitalGoods()` to `lib/auditlog/auditlog.service.ts`
- [x] Created implementation documentation

## ⚠️ Pending - Database Setup

### 1. Create PostgreSQL Table

```bash
# Run SQL from db-migration/capital-goods-sprint-1.md
```

- [ ] Create `GHGCapital_Goods` table
- [ ] Add foreign key constraints
- [ ] Set up permissions for Location Executive and Location Admin

### 2. Add Activity Master Data

```sql
INSERT INTO "ActivityMaster" (master_key, master_data)
VALUES ('capital_goods_quantity_procured_uom', ...);
```

- [ ] Add UoM master data for capital_goods_quantity_procured_uom

### 3. Add Activity Entry

```sql
-- Parent Activity
INSERT INTO "Activity" (name, code, meta_data)
VALUES ('CapitalGoods', 'capitalgoods', ...);

-- Sub Activity
INSERT INTO "Activity" (name, code, parent_code, meta_data)
VALUES ('Capital Goods', 'capital_goods', 'capitalgoods', ...);
```

- [ ] Add parent activity "CapitalGoods"
- [ ] Add sub-activity "Capital Goods"

### 4. Create ClickHouse Audit Table

```sql
CREATE TABLE snowkap_op_logs.GHGCapital_Goods (...);
```

- [ ] Create audit table in ClickHouse

### 5. GraphQL Setup

- [ ] Add GraphQL schema for `GHGCapital_Goods` type
- [ ] Add `GhgCapital_Goods_Insert_Input` input type
- [ ] Add `upsertGHGCapitalGoodsActivity` mutation
- [ ] Add necessary queries for Capital Goods
- [ ] Run codegen: `yarn codegen` or `npm run codegen`
- [ ] Verify types generated in `graphql/shared/types.ts`

### 6. Upload Excel Template

- [ ] Create Capital Goods Excel template with columns:
  - Year
  - Month
  - Material Code
  - Supplier Code
  - Quantity Procured
  - Quantity Procured UOM
- [ ] Upload to: `https://beta.snowkap.com/ops/Capital_Goods_Procurement_Template.xlsx`

### 7. Optional - Add as Separate Parent Activity

If you want "capitalgoods" as its own parent (not under "material"):

- [ ] Add "capitalgoods" to `AppGlobalMasterConstant.activities`
- [ ] Add to all `address_activity_mappings` arrays in Manufacturing/NonManufacturing
- [ ] Update `parent_code` in `CapitalGoodsActivityConstant` from "material" to "capitalgoods"

### 8. Emission Factors Setup

- [ ] Configure emission factors for activity code "capital_goods"
- [ ] Set up material-specific emission factors in the system

## 📝 Testing

After completing all pending items:

### 1. Run Code Generation

```bash
cd d:\Pradip\Work\uigw\snowkap_op_nextjs
yarn codegen
```

### 2. Verify No TypeScript Errors

- Check `capital-goods-excel.service.ts`
- Check `capital-goods-excel.validation.ts`
- Check `route.ts`

### 3. Test API Endpoint

```bash
POST http://localhost:3000/api/v1/ghg-data-import/transaction/capital-goods/excel

Headers:
Authorization: Bearer <token>
Content-Type: application/json

Body:
{
  "fileUrl": "https://your-s3-bucket.com/test-capital-goods.xlsx",
  "organizationAddressId": "<valid-uuid>"
}
```

### 4. Verify Results

- [ ] Data inserted in `GHGCapital_Goods` table
- [ ] Audit logs in ClickHouse `snowkap_op_logs.GHGCapital_Goods`
- [ ] Data import history created
- [ ] Emission calculations triggered
- [ ] Email sent if missing emission factors
- [ ] Material/Supplier masters auto-created if needed

## 🔗 Related Files

- **API Route**: `app/api/v1/ghg-data-import/transaction/capital-goods/excel/route.ts`
- **Service**: `lib/organization-transaction/capital-goods/capital-goods-excel.service.ts`
- **Validation**: `lib/organization-transaction/capital-goods/capital-goods-excel.validation.ts`
- **Constants**: `shared/constants/activity.constant.ts`
- **Input Constants**: `shared/constants/input.constant.ts`
- **Audit Service**: `lib/auditlog/auditlog.service.ts`
- **Migration Doc**: `db-migration/capital-goods-sprint-1.md`
- **Implementation Doc**: `CAPITAL_GOODS_API_IMPLEMENTATION.md`

## 📞 Support

For reference implementations, check:

- Material Procurement: `app/api/v1/ghg-data-import/transaction/material-procurement/excel/route.ts`
- Waste: `app/api/v1/ghg-data-import/transaction/waste/excel/route.ts`
