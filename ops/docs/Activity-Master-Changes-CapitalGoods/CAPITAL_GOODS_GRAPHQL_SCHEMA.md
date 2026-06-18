# GraphQL Schema for Capital Goods

## Add this to your GraphQL mutations file (e.g., graphql/mutations/capital-goods.graphql)

```graphql
# Mutation for upserting Capital Goods data
mutation upsertGHGCapitalGoodsActivity(
  $where: GhgCapital_Goods_Bool_Exp!
  $capitalGoodsData: [GhgCapital_Goods_Insert_Input!]!
) {
  delete_GHGCapital_Goods(where: $where) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Code
      Supplier_Code
      Quantity_Procured
      Quantity_Procured_uom
      supporting_docs
      meta_data
      created_at
      updated_at
      created_by
      updated_by
      OrganizationAddress {
        id
        Organization {
          id
          name
        }
      }
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
        supporting_docs
        meta_data
        updated_by
        updated_at
      ]
    }
  ) {
    returning {
      id
      organization_address_id
      task_request_id
      activity_task_request_id
      Material_Code
      Supplier_Code
      Quantity_Procured
      Quantity_Procured_uom
      supporting_docs
      meta_data
      created_at
      updated_at
      created_by
      updated_by
      OrganizationAddress {
        id
        Organization {
          id
          name
        }
      }
    }
  }
}
```

## Add queries if needed (e.g., graphql/queries/capital-goods.graphql)

```graphql
# Query to fetch Capital Goods data
query getCapitalGoodsData(
  $where: GhgCapital_Goods_Bool_Exp!
  $limit: Int
  $offset: Int
  $order_by: [GhgCapital_Goods_Order_By!]
) {
  GHGCapital_Goods(
    where: $where
    limit: $limit
    offset: $offset
    order_by: $order_by
  ) {
    id
    organization_address_id
    task_request_id
    activity_task_request_id
    Material_Code
    Supplier_Code
    Quantity_Procured
    Quantity_Procured_uom
    supporting_docs
    meta_data
    created_at
    updated_at
    created_by
    updated_by
    OrganizationAddress {
      id
      address
      Organization {
        id
        name
      }
    }
    TaskRequest {
      id
      year
      month
    }
    ActivityTaskRequest {
      id
      activity_code
    }
  }
}

# Query to get aggregate data
query getCapitalGoodsAggregate($where: GhgCapital_Goods_Bool_Exp!) {
  GHGCapital_Goods_aggregate(where: $where) {
    aggregate {
      count
      sum {
        Quantity_Procured
      }
      avg {
        Quantity_Procured
      }
    }
  }
}
```

## Hasura/Database Setup

If using Hasura, ensure the following are configured:

### 1. Table Permissions

**Select**:

```json
{
  "organization_address_id": {
    "_in": "X-Hasura-Allowed-Org-Address-Ids"
  }
}
```

**Insert**:

```json
{
  "organization_address_id": {
    "_in": "X-Hasura-Allowed-Org-Address-Ids"
  }
}
```

**Update**:

```json
{
  "organization_address_id": {
    "_in": "X-Hasura-Allowed-Org-Address-Ids"
  }
}
```

**Delete**:

```json
{
  "organization_address_id": {
    "_in": "X-Hasura-Allowed-Org-Address-Ids"
  }
}
```

### 2. Column Permissions

**Select**: All columns
**Insert**: All columns except `id`, `created_at`, `updated_at` (set by database)
**Update**: All columns except `id`, `created_at`, `organization_address_id`, `task_request_id`, `activity_task_request_id`

### 3. Relationships

**Object Relationships**:

- `OrganizationAddress` → `organization_address_id` → `OrganizationAddress.id`
- `TaskRequest` → `task_request_id` → `TaskRequest.id`
- `ActivityTaskRequest` → `activity_task_request_id` → `ActivityTaskRequest.id`
- `CreatedBy` → `created_by` → `AppUser.id`
- `UpdatedBy` → `updated_by` → `AppUser.id`

**Array Relationships** (if needed):

- None typically needed for this table

## After Adding Schema

1. **Save the GraphQL files** in appropriate locations:

   - Mutations: `graphql/mutations/capital-goods.graphql`
   - Queries: `graphql/queries/capital-goods.graphql`

2. **Run Code Generation**:

   ```bash
   yarn codegen
   # or
   npm run codegen
   ```

3. **Verify Generated Types**:
   Check that these types are now available in `graphql/shared/types.ts`:

   - `GhgCapital_Goods`
   - `GhgCapital_Goods_Insert_Input`
   - `GhgCapital_Goods_Bool_Exp`
   - `GhgCapital_Goods_Order_By`
   - `UpsertGhgCapitalGoodsActivityMutation`
   - `UpsertGhgCapitalGoodsActivityMutationVariables`

4. **Verify SDK Method**:
   Check that `sdk.upsertGHGCapitalGoodsActivity()` is now available in the GraphQL SDK

5. **Remove TypeScript Ignores**:
   Once types are generated, you can remove the `@ts-ignore` comments from:
   - `lib/organization-transaction/capital-goods/capital-goods-excel.service.ts`

## Testing GraphQL

### Using GraphQL Playground/Hasura Console

```graphql
mutation TestCapitalGoods {
  insert_GHGCapital_Goods(
    objects: {
      organization_address_id: "uuid-here"
      task_request_id: "uuid-here"
      activity_task_request_id: "uuid-here"
      Material_Code: "MAT001"
      Supplier_Code: "SUP001"
      Quantity_Procured: 100.5
      Quantity_Procured_uom: "kilogram"
      created_by: "user-uuid-here"
      updated_by: "user-uuid-here"
    }
  ) {
    returning {
      id
      Material_Code
      Supplier_Code
      Quantity_Procured
    }
  }
}
```

### Query Test

```graphql
query TestQuery {
  GHGCapital_Goods(
    where: { organization_address_id: { _eq: "uuid-here" } }
    limit: 10
  ) {
    id
    Material_Code
    Supplier_Code
    Quantity_Procured
    Quantity_Procured_uom
  }
}
```
