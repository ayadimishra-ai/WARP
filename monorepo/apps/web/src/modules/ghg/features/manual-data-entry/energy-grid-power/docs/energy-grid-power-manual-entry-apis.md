# API Specification

## Listing API

### Flow

1. **Load Data**
   - Load **User Permissions**
     - Locations
     - Activities
   - Load **Organization Details**
     - Start / Baseline Year
     - Financial Month
   - Load **Master Data**
     - Dropdowns or any required reference data for validation

2. **Authorization**
   - API must return data **only if** the user has permission for the requested activity.
   - If required permissions are not found:
     - Return **access denied**
     - Show **empty listing page**
3. **Listing**
   - Pagination, sorting & searching.

---

## Upsert API

### Insert / Update Flow

1. **Request Handling**
   - Read input data from request body.

2. **Update Validation**
   - If request is an update:
     - Validate whether data has actually changed.
     - If no changes are detected:
       - Return response: **No changes found**

3. **Load Data**
   - Load **User Permissions**
     - Locations
     - Activities
   - Load **Organization Details**
     - Start / Baseline Year
     - Financial Month
   - Load **Master Data**
     - Dropdowns or any required reference data for validation

4. **Authorization**
   - Validate that the user has permission for the specified activities.

5. **Input Validation**
   - Perform **Zod schema validation**
     - Use existing **activity Excel Zod schema**
     - Include validation for specified location

6. **Master Data Validation**
   - Validate input using existing **activity Excel master data validations**.

7. **Business Logic**
   - Perform **row-level emission calculation** before saving.

8. **Persistence**
   - Save validated data to the database.

9. **Audit Logging**
   - Insert an audit log entry for the operation.

10. **Post-Processing**
    - Re-run **KPI calculation**
      - By month
      - By year
      - By location

11. **Response**
    - Return **success response** after successful completion.
