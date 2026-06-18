# Capital Goods Excel Validation - Test Cases with Examples

## Overview

This document contains comprehensive test cases for Capital Goods Excel validation based on the specification for Category 2 (Scope 3) GHG emissions.

---

## TEST CASE 1: Material Type Check (CAPITAL_GOODS_MATERIAL_TYPE)

### Requirement

Material Code must have MaterialType = "Capital Goods" in Material Master. If not, block upload.

### Test Case 1.1: PASS - Valid Material Type (Capital Goods)

**Description**: Material with correct type "Capital Goods" should be accepted

| Year | Month | Supplier Code | Material Code     | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ----------------- | ----------------- | -------- |
| 2021 | April | HAASMACH      | HAAS-CNC-VF2-2021 | 10                | Kilogram |

**Material Master Data**:

- Material Code: HAAS-CNC-VF2-2021
- Material Type: **Capital Goods** ✓
- Weight Per Unit: 500 KG

**Expected Result**: ✅ PASS - Upload accepted

---

### Test Case 1.2: FAIL - Invalid Material Type (Raw Material)

**Description**: Material with type "Raw Material" instead of "Capital Goods" should be rejected

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | RM-STEEL-001  | 1000              | Kilogram |

**Material Master Data**:

- Material Code: RM-STEEL-001
- Material Type: **raw_material** ✗ (Not capital_goods)

**Expected Result**: ❌ FAIL

**Error Message**:

```
Material Code 'RM-STEEL-001' is not defined as Capital Goods.
Please use materials with Material Type = 'Capital Goods' only.
```

---

### Test Case 1.3: FAIL - Invalid Material Type (Packaging Material)

**Description**: Packaging Material should be rejected for Capital Goods template

| Year | Month | Supplier Code | Material Code    | Quantity Procured | UoM |
| ---- | ----- | ------------- | ---------------- | ----------------- | --- |
| 2021 | May   | SUPPLIER002   | PKG-MATERIAL-001 | 500               | Nos |

**Material Master Data**:

- Material Code: PKG-MATERIAL-001
- Material Type: **packaging_material** ✗ (Not capital_goods)

**Expected Result**: ❌ FAIL - Block Upload

**Error Message**:

```
Material Code 'PKG-MATERIAL-001' is not defined as Capital Goods.
Please use materials with Material Type = 'Capital Goods' only.
```

---

### Test Case 1.4: FAIL - Invalid Material Type (Semi-Finished Goods)

**Description**: Semi-Finished Goods should be rejected

| Year | Month | Supplier Code | Material Code     | Quantity Procured | UoM |
| ---- | ----- | ------------- | ----------------- | ----------------- | --- |
| 2021 | June  | SUPPLIER003   | SEMI-FINISHED-001 | 250               | Nos |

**Material Master Data**:

- Material Code: SEMI-FINISHED-001
- Material Type: **semi_finished_goods** ✗

**Expected Result**: ❌ FAIL

**Error Message**:

```
Material Code 'SEMI-FINISHED-001' is not defined as Capital Goods.
```

---

### Test Case 1.5: FAIL - Invalid Material Type (Finished Goods)

**Description**: Finished Goods should be rejected

| Year | Month | Supplier Code | Material Code    | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ---------------- | ----------------- | -------- |
| 2021 | July  | SUPPLIER004   | FINISHED-PROD-01 | 100               | Kilogram |

**Material Master Data**:

- Material Code: FINISHED-PROD-01
- Material Type: **finished_goods** ✗

**Expected Result**: ❌ FAIL

**Error Message**:

```
Material Code 'FINISHED-PROD-01' is not defined as Capital Goods.
```

---

### Test Case 1.6: FAIL - Invalid Material Type (Waste)

**Description**: Waste materials should be rejected

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | Aug   | SUPPLIER005   | WASTE-001     | 500               | Kilogram |

**Material Master Data**:

- Material Code: WASTE-001
- Material Type: **waste** ✗

**Expected Result**: ❌ FAIL

**Error Message**:

```
Material Code 'WASTE-001' is not defined as Capital Goods.
Please use materials with Material Type = 'Capital Goods' only.
```

---

## TEST CASE 2: Year Field Validation (Format: YYYY, Range: 2000-2100)

### Test Case 2.1: PASS - Valid Year (2021)

| Year     | Month | Supplier Code | Material Code     | Quantity Procured | UoM      |
| -------- | ----- | ------------- | ----------------- | ----------------- | -------- |
| **2021** | April | HAASMACH      | HAAS-CNC-VF2-2021 | 10                | Kilogram |

**Validation**: ✅ PASS

- Format: 4 digits ✓
- Range: 2021 is between 2000-2100 ✓

---

### Test Case 2.2: PASS - Boundary Year (2000)

| Year     | Month   | Supplier Code | Material Code | Quantity Procured | UoM |
| -------- | ------- | ------------- | ------------- | ----------------- | --- |
| **2000** | January | SUPPLIER001   | MAT-001       | 5                 | Nos |

**Validation**: ✅ PASS - Year 2000 is valid (minimum boundary)

---

### Test Case 2.3: PASS - Boundary Year (2100)

| Year     | Month    | Supplier Code | Material Code | Quantity Procured | UoM |
| -------- | -------- | ------------- | ------------- | ----------------- | --- |
| **2100** | December | SUPPLIER001   | MAT-001       | 5                 | Nos |

**Validation**: ✅ PASS - Year 2100 is valid (maximum boundary)

---

### Test Case 2.4: FAIL - Year Below Range (1999)

| Year     | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| -------- | ----- | ------------- | ------------- | ----------------- | -------- |
| **1999** | April | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Year must be between 2000 and 2100
```

---

### Test Case 2.5: FAIL - Year Above Range (2101)

| Year     | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| -------- | ----- | ------------- | ------------- | ----------------- | -------- |
| **2101** | April | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL - Year exceeds maximum

**Error Message**:

```
Year must be between 2000 and 2100
```

---

### Test Case 2.6: FAIL - Invalid Year Format (2-digit: 21)

| Year   | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ------ | ----- | ------------- | ------------- | ----------------- | -------- |
| **21** | April | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL - Not 4-digit format

**Error Message**:

```
Year must be in YYYY format (4 digits)
```

---

### Test Case 2.7: FAIL - Invalid Year Format (Text: "TWENTY-TWENTY-ONE")

| Year                  | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| --------------------- | ----- | ------------- | ------------- | ----------------- | -------- |
| **TWENTY-TWENTY-ONE** | April | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL - Non-numeric

**Error Message**:

```
Invalid Entry: Please enter a valid numeric value for Year
```

---

## TEST CASE 3: Month Field Validation (Full month names only: January-December)

### Test Case 3.1: PASS - Valid Full Month Name (April)

| Year | Month     | Supplier Code | Material Code     | Quantity Procured | UoM      |
| ---- | --------- | ------------- | ----------------- | ----------------- | -------- |
| 2021 | **April** | HAASMACH      | HAAS-CNC-VF2-2021 | 10                | Kilogram |

**Validation**: ✅ PASS - Full month name with proper casing

---

### Test Case 3.2: PASS - All Valid Full Months

| Year | Month     | Supplier Code | Material Code | Quantity Procured | UoM |
| ---- | --------- | ------------- | ------------- | ----------------- | --- |
| 2021 | January   | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | February  | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | March     | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | April     | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | May       | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | June      | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | July      | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | August    | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | September | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | October   | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | November  | SUP001        | MAT-001       | 5                 | Nos |
| 2021 | December  | SUP001        | MAT-001       | 5                 | Nos |

**Validation**: ✅ PASS - All valid

---

### Test Case 3.3: FAIL - Abbreviated Month (Jan)

| Year | Month   | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ------- | ------------- | ------------- | ----------------- | -------- |
| 2021 | **Jan** | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Month must be full month name (e.g., January, not Jan)
```

---

### Test Case 3.4: FAIL - Abbreviated Month (Apr)

| Year | Month   | Supplier Code | Material Code     | Quantity Procured | UoM      |
| ---- | ------- | ------------- | ----------------- | ----------------- | -------- |
| 2021 | **Apr** | HAASMACH      | HAAS-CNC-VF2-2021 | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Month must be full month name (January-December)
```

---

### Test Case 3.5: FAIL - Numeric Month (01)

| Year | Month  | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ------ | ------------- | ------------- | ----------------- | -------- |
| 2021 | **01** | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Month must be text month name, not numeric. Use 'January' instead of '01'
```

---

### Test Case 3.6: FAIL - Numeric Month (4)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | **4** | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Month must be text month name. Use 'April' instead of '4'
```

---

### Test Case 3.7: FAIL - Wrong Casing (april - lowercase)

| Year | Month     | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | --------- | ------------- | ------------- | ----------------- | -------- |
| 2021 | **april** | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Month must start with uppercase letter (e.g., April not april)
```

---

### Test Case 3.8: FAIL - Wrong Casing (APRIL - uppercase)

| Year | Month     | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | --------- | ------------- | ------------- | ----------------- | -------- |
| 2021 | **APRIL** | SUPPLIER001   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Month must be in format 'April' (only first letter uppercase)
```

---

## TEST CASE 4: Quantity Procured Validation (0.01 to 999,999,999.99, max 2 decimal places)

### Test Case 4.1: PASS - Valid Quantity (Integer: 10)

| Year | Month | Supplier Code | Material Code     | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ----------------- | ----------------- | -------- |
| 2021 | April | HAASMACH      | HAAS-CNC-VF2-2021 | **10**            | Kilogram |

**Validation**: ✅ PASS

---

### Test Case 4.2: PASS - Valid Quantity (1 Decimal Place: 10.5)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **10.5**          | Kilogram |

**Validation**: ✅ PASS - Valid decimal places (1)

---

### Test Case 4.3: PASS - Valid Quantity (2 Decimal Places: 10.25)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **10.25**         | Kilogram |

**Validation**: ✅ PASS - Valid decimal places (2)

---

### Test Case 4.4: PASS - Minimum Quantity (0.01)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **0.01**          | Kilogram |

**Validation**: ✅ PASS - Minimum valid quantity

---

### Test Case 4.5: PASS - Maximum Quantity (999,999,999.99)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **999999999.99**  | Kilogram |

**Validation**: ✅ PASS - Maximum valid quantity

---

### Test Case 4.6: FAIL - Below Minimum (0)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **0**             | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Quantity Procured must be greater than 0 (minimum: 0.01)
```

---

### Test Case 4.7: FAIL - Below Minimum (0.001)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **0.001**         | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Quantity Procured must be at least 0.01
```

---

### Test Case 4.8: FAIL - Negative Quantity (-10)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **-10**           | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Quantity Procured must be greater than 0
```

---

### Test Case 4.9: FAIL - Exceeds Maximum (1,000,000,000)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **1000000000**    | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Quantity Procured must not exceed 999,999,999.99
```

---

### Test Case 4.10: FAIL - Too Many Decimal Places (10.125)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **10.125**        | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Quantity Procured must have maximum 2 decimal places
```

---

### Test Case 4.11: FAIL - Too Many Decimal Places (10.9999)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **10.9999**       | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Quantity Procured must have maximum 2 decimal places (received 4 decimal places)
```

---

### Test Case 4.12: FAIL - Non-Numeric (100kg)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | MAT-001       | **100kg**         | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Invalid Entry: Please enter a valid numeric value for Quantity Procured
```

---

## TEST CASE 5: UoM (Unit of Measure) Validation - Must be from approved list, case-sensitive

### Test Case 5.1: PASS - Valid UoM (Nos)

| Year | Month | Supplier Code | Material Code     | Quantity Procured | UoM     |
| ---- | ----- | ------------- | ----------------- | ----------------- | ------- |
| 2021 | April | HAASMACH      | HAAS-CNC-VF2-2021 | 10                | **Nos** |

**Material Master**:

- HAAS-CNC-VF2-2021: Weight Per Unit = 500 KG per Nos

**Validation**: ✅ PASS - Valid UoM from master

---

### Test Case 5.2: PASS - Valid UoM (Kilogram)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM          |
| ---- | ----- | ------------- | ------------- | ----------------- | ------------ |
| 2021 | April | SUPPLIER001   | MAT-STEEL-001 | 1000              | **Kilogram** |

**Validation**: ✅ PASS - Valid UoM

---

### Test Case 5.3: PASS - Valid UoM (EA - Each)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM    |
| ---- | ----- | ------------- | ------------- | ----------------- | ------ |
| 2021 | April | SUPPLIER001   | MAT-001       | 5                 | **EA** |

**Validation**: ✅ PASS - Valid UoM

---

### Test Case 5.3a: PASS - Valid UoM (Litre - Volume Group)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM       |
| ---- | ----- | ------------- | ------------- | ----------------- | --------- |
| 2021 | April | SUPPLIER001   | MAT-LIQUID    | 500               | **Litre** |

**Validation**: ✅ PASS - Valid UoM (Volume group)

---

### Test Case 5.3b: PASS - Valid UoM (Kilolitre - Volume Group)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM           |
| ---- | ----- | ------------- | ------------- | ----------------- | ------------- |
| 2021 | April | SUPPLIER001   | MAT-LIQUID2   | 100               | **Kilolitre** |

**Validation**: ✅ PASS - Valid UoM (Volume group)

---

### Test Case 5.4: FAIL - Wrong Case (nos - lowercase)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM     |
| ---- | ----- | ------------- | ------------- | ----------------- | ------- |
| 2021 | April | SUPPLIER001   | MAT-001       | 10                | **nos** |

**Validation**: ❌ FAIL - Case-sensitive mismatch

**Error Message**:

```
UoM 'nos' is not valid. Use 'Nos' (case-sensitive matching)
```

---

### Test Case 5.5: FAIL - Wrong Case (KILOGRAM - uppercase)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM          |
| ---- | ----- | ------------- | ------------- | ----------------- | ------------ |
| 2021 | April | SUPPLIER001   | MAT-001       | 1000              | **KILOGRAM** |

**Validation**: ❌ FAIL - Case-sensitive

**Error Message**:

```
UoM 'KILOGRAM' is not valid. Use 'Kilogram' (case-sensitive)
```

---

### Test Case 5.6: FAIL - Wrong Case (kilogram - lowercase)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM          |
| ---- | ----- | ------------- | ------------- | ----------------- | ------------ |
| 2021 | April | SUPPLIER001   | MAT-001       | 1000              | **kilogram** |

**Validation**: ❌ FAIL

**Error Message**:

```
UoM 'kilogram' not found. Valid UoMs: Nos, Kilogram, EA, Liter, Meter, etc.
```

---

### Test Case 5.7: FAIL - Invalid UoM (KG - abbreviation)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM    |
| ---- | ----- | ------------- | ------------- | ----------------- | ------ |
| 2021 | April | SUPPLIER001   | MAT-001       | 1000              | **KG** |

**Validation**: ❌ FAIL

**Error Message**:

```
UoM 'KG' is not valid. Use 'Kilogram' or other valid UoMs from master
```

---

### Test Case 5.8: FAIL - Invalid UoM (piece)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM       |
| ---- | ----- | ------------- | ------------- | ----------------- | --------- |
| 2021 | April | SUPPLIER001   | MAT-001       | 100               | **piece** |

**Validation**: ❌ FAIL

**Error Message**:

```
UoM 'piece' not found in master. Use 'Nos' or other valid UoMs
```

---

### Test Case 5.8a: FAIL - Invalid UoM (Liter - Wrong Case/Spelling)

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM       |
| ---- | ----- | ------------- | ------------- | ----------------- | --------- |
| 2021 | April | SUPPLIER001   | MAT-001       | 100               | **Liter** |

**Validation**: ❌ FAIL - Case-sensitive (must be 'Litre' not 'Liter')

**Error Message**:

```
UoM 'Liter' is not valid. Use 'Litre' (case-sensitive matching)
```

---

### Test Case 5.9: FAIL - Empty UoM

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM         |
| ---- | ----- | ------------- | ------------- | ----------------- | ----------- |
| 2021 | April | SUPPLIER001   | MAT-001       | 10                | **(empty)** |

**Validation**: ❌ FAIL

**Error Message**:

```
UoM is required
```

---

## TEST CASE 6: Supplier Code Validation - Must exist or auto-create (Ease of Master Data)

**Feature**: Supplier codes that do NOT exist in Supplier Master will be automatically created.

**Purpose**: To ease data entry and master data management - users don't need to pre-create suppliers in master.

### Test Case 6.1: PASS - Existing Supplier Code

| Year | Month | Supplier Code | Material Code     | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ----------------- | ----------------- | -------- |
| 2021 | April | **HAASMACH**  | HAAS-CNC-VF2-2021 | 10                | Kilogram |

**Supplier Master**:

- Code: HAASMACH
- Name: HAAS Machinery India
- Status: Active

**Validation**: ✅ PASS - Supplier already exists in master

**Processing**: Use existing supplier details

---

### Test Case 6.2: PASS - New Supplier Code (Auto-created)

| Year | Month | Supplier Code        | Material Code | Quantity Procured | UoM      |
| ---- | ----- | -------------------- | ------------- | ----------------- | -------- |
| 2021 | April | **NEW_SUPPLIER_XYZ** | MAT-001       | 10                | Kilogram |

**Supplier Master**:

- NEW_SUPPLIER_XYZ: Does NOT exist initially

**Validation**: ✅ PASS - Auto-created (Ease of Master Data)

**Action Performed**:

1. System detects supplier code NEW_SUPPLIER_XYZ not in master
2. Automatically creates new supplier record with:
   - Code: NEW_SUPPLIER_XYZ
   - Name: NEW_SUPPLIER_XYZ (same as code, can be updated later)
   - Status: Active
3. Links supplier to the uploaded record
4. Upload accepted and processed

**Result**: User doesn't need to manually create supplier in master - it's auto-generated

---

### Test Case 6.2a: PASS - Multiple New Supplier Codes in Same Upload (All Auto-created)

| Row | Year | Month | Supplier Code   | Material Code | Quantity Procured | UoM      |
| --- | ---- | ----- | --------------- | ------------- | ----------------- | -------- |
| 1   | 2021 | April | **SUP_NEW_001** | MAT-001       | 10                | Kilogram |
| 2   | 2021 | April | **SUP_NEW_002** | MAT-002       | 20                | Kilogram |
| 3   | 2021 | April | **SUP_NEW_003** | MAT-003       | 15                | Kilogram |

**Supplier Master**: None of these codes exist

**Validation**: ✅ PASS - All three suppliers auto-created

**Processing**:

- Row 1: Auto-create SUP_NEW_001, process record
- Row 2: Auto-create SUP_NEW_002, process record
- Row 3: Auto-create SUP_NEW_003, process record

**Result**: 3 new suppliers added to master, all records accepted

---

### Test Case 6.3: FAIL - Empty Supplier Code

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | **(empty)**   | MAT-001       | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Supplier Code is required - Cannot auto-create without a code value
```

---

---

## TEST CASE 7: Material Code Validation - Must exist or auto-create as Capital Goods (Ease of Master Data)

**Feature**: Material codes that do NOT exist in Material Master will be automatically created as Capital Goods type.

**Purpose**: To ease data entry and master data management - users don't need to pre-create materials in master.

### Test Case 7.1: PASS - Existing Capital Goods Material

| Year | Month | Supplier Code | Material Code         | Quantity Procured | UoM      |
| ---- | ----- | ------------- | --------------------- | ----------------- | -------- |
| 2021 | April | HAASMACH      | **HAAS-CNC-VF2-2021** | 10                | Kilogram |

**Material Master**:

- Code: HAAS-CNC-VF2-2021
- Name: HAAS CNC VF2 Machine
- Type: **Capital Goods** ✓
- Weight Per Unit: 500 KG

**Validation**: ✅ PASS - Material already exists in master with Capital Goods type

**Processing**: Use existing material details

---

### Test Case 7.2: PASS - New Material Code (Auto-created as Capital Goods)

| Year | Month | Supplier Code | Material Code       | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | **NEW-MAT-PUMP-01** | 10                | Kilogram |

**Material Master**:

- NEW-MAT-PUMP-01: Does NOT exist initially

**Validation**: ✅ PASS - Auto-created as Capital Goods (Ease of Master Data)

**Action Performed**:

1. System detects material code NEW-MAT-PUMP-01 not in master
2. Automatically creates new material record with:
   - Code: NEW-MAT-PUMP-01
   - Name: NEW-MAT-PUMP-01 (same as code, can be edited later)
   - Type: **Capital Goods** (automatically set for this template)
   - Status: Active
   - Default Weight Per Unit: 1 KG per unit (can be updated in master)
3. Links material to the uploaded record
4. Upload accepted and processed

**Result**: User doesn't need to manually create material in master - it's auto-generated with Capital Goods type

---

### Test Case 7.2a: PASS - Multiple New Material Codes in Same Upload (All Auto-created)

| Row | Year | Month | Supplier Code | Material Code     | Quantity Procured | UoM      |
| --- | ---- | ----- | ------------- | ----------------- | ----------------- | -------- |
| 1   | 2021 | April | SUPPLIER001   | **MAT-PUMP-NEW**  | 10                | Kilogram |
| 2   | 2021 | April | SUPPLIER001   | **MAT-MOTOR-NEW** | 20                | Kilogram |
| 3   | 2021 | April | SUPPLIER001   | **MAT-VALVE-NEW** | 15                | Kilogram |

**Material Master**: None of these codes exist

**Validation**: ✅ PASS - All three materials auto-created as Capital Goods

**Processing**:

- Row 1: Auto-create MAT-PUMP-NEW with Type=Capital Goods, process record
- Row 2: Auto-create MAT-MOTOR-NEW with Type=Capital Goods, process record
- Row 3: Auto-create MAT-VALVE-NEW with Type=Capital Goods, process record

**Result**: 3 new materials added to master, all records accepted

---

### Test Case 7.3: FAIL - Empty Material Code

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | **(empty)**   | 10                | Kilogram |

**Validation**: ❌ FAIL

**Error Message**:

```
Material Code is required - Cannot auto-create without a code value
```

---

### Test Case 7.4: FAIL - Existing Material but Type is NOT Capital Goods (Raw Material)

| Year | Month | Supplier Code | Material Code    | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ---------------- | ----------------- | -------- |
| 2021 | April | SUPPLIER001   | **RM-STEEL-001** | 1000              | Kilogram |

**Material Master**:

- Code: RM-STEEL-001
- Name: Raw Steel
- Type: **Raw Material** ✗ (not Capital Goods)

**Validation**: ❌ FAIL - Material exists but has wrong type

**Error Message**:

```
Material Code 'RM-STEEL-001' is defined as 'Raw Material', not 'Capital Goods'.
Auto-created materials are always 'Capital Goods' type.
To use this material, update its type in Material Master to 'Capital Goods'.
```

---

## TEST CASE 8: Multiple Entries per Location per Month (ALLOW_MULTIPLE_ENTRIES_LOCATION_MONTH_MATERIAL)

### Test Case 8.1: PASS - Multiple Entries Allowed

**Description**: Same material at same location in same month with different quantities should all be processed

| Row | Year | Month   | Location | Supplier Code | Material Code | Quantity Procured | UoM      |
| --- | ---- | ------- | -------- | ------------- | ------------- | ----------------- | -------- |
| 1   | 2024 | January | LOC-001  | SUP-A         | M001          | 100               | Kilogram |
| 2   | 2024 | January | LOC-001  | SUP-A         | M001          | 50                | Kilogram |
| 3   | 2024 | January | LOC-001  | SUP-A         | M001          | 75                | Kilogram |

**Validation**: ✅ PASS - All 3 rows accepted

**Processing**:

- Row 1: 100 KG × 2.5 = 250 KG CO2e
- Row 2: 50 KG × 2.5 = 125 KG CO2e
- Row 3: 75 KG × 2.5 = 187.5 KG CO2e

**Monthly Total**: 250 + 125 + 187.5 = **562.5 KG CO2e**

---

### Test Case 8.2: PASS - Different Suppliers, Same Material, Same Location, Same Month

| Row | Year | Month   | Location | Supplier Code | Material Code | Quantity Procured | UoM      |
| --- | ---- | ------- | -------- | ------------- | ------------- | ----------------- | -------- |
| 1   | 2024 | January | LOC-001  | **SUP-A**     | M001          | 100               | Kilogram |
| 2   | 2024 | January | LOC-001  | **SUP-B**     | M001          | 150               | Kilogram |

**Validation**: ✅ PASS - Both suppliers accepted

**Processing**: Each row calculated separately and summed for location-month-material total

---

## TEST CASE 9: Duplicate Records Prevention

### Test Case 9.1: FAIL - Exact Duplicate Rows

| Row | Year | Month   | Supplier Code | Material Code | Quantity Procured | UoM      |
| --- | ---- | ------- | ------------- | ------------- | ----------------- | -------- |
| 1   | 2024 | January | SUP-A         | M001          | 100               | Kilogram |
| 2   | 2024 | January | SUP-A         | M001          | 100               | Kilogram |

**Validation**: ❌ FAIL - Duplicate record detected

**Error Message** (Row 2):

```
Duplicate record found. Records with same Year, Month, Supplier Code,
Material Code, Quantity Procured, and UoM are not allowed.
```

---

### Test Case 9.2: PASS - Same Combination, Different Quantity (NOT a duplicate)

| Row | Year | Month   | Supplier Code | Material Code | Quantity Procured | UoM      |
| --- | ---- | ------- | ------------- | ------------- | ----------------- | -------- |
| 1   | 2024 | January | SUP-A         | M001          | 100               | Kilogram |
| 2   | 2024 | January | SUP-A         | M001          | **150**           | Kilogram |

**Validation**: ✅ PASS - Different quantities, both accepted

---

## TEST CASE 10: UoM Group Consistency (Different UoM groups not allowed for same material in same month)

### Test Case 10.1: FAIL - Different UoM Groups for Same Material in Same Month

| Row | Year | Month   | Material Code | UoM      | UoM Group |
| --- | ---- | ------- | ------------- | -------- | --------- |
| 1   | 2024 | January | M001          | Kilogram | Mass      |
| 2   | 2024 | January | M001          | Nos      | **Count** |

**Validation**: ❌ FAIL - Row 2 rejected

**Error Message** (Row 2):

```
UoM 'Nos' belongs to 'Count' group. All UoMs for the same Material Code
in the same Year-Month must belong to the same group.
Material 'M001' in January 2024 uses 'Mass' group (Kilogram).
```

---

### Test Case 10.2: PASS - Same UoM Group for Same Material in Same Month

| Row | Year | Month   | Material Code | UoM      | UoM Group |
| --- | ---- | ------- | ------------- | -------- | --------- |
| 1   | 2024 | January | M001          | Kilogram | Mass      |
| 2   | 2024 | January | M001          | Gram     | **Mass**  |

**Validation**: ✅ PASS - Both use Mass group

**Processing**:

- Row 1: Converted to KG as-is
- Row 2: Convert Gram to KG (divide by 1000)

---

### Test Case 10.2a: PASS - Same Volume Group for Same Material in Same Month

| Row | Year | Month   | Material Code | UoM        | UoM Group  |
| --- | ---- | ------- | ------------- | ---------- | ---------- |
| 1   | 2024 | January | M-LIQUID-001  | Litre      | Volume     |
| 2   | 2024 | January | M-LIQUID-001  | Millilitre | **Volume** |

**Validation**: ✅ PASS - Both use Volume group

**Processing**:

- Row 1: 100 Litres as-is
- Row 2: 50,000 Millilitres converted to Litres (divide by 1,000)

---

### Test Case 10.3: PASS - Different Materials, Different UoM Groups in Same Month

| Row | Year | Month   | Material Code | UoM      | UoM Group |
| --- | ---- | ------- | ------------- | -------- | --------- |
| 1   | 2024 | January | **M001**      | Kilogram | Mass      |
| 2   | 2024 | January | **M002**      | Nos      | Count     |

**Validation**: ✅ PASS - Different materials, so different UoM groups OK

---

## TEST CASE 11: Complete Valid Upload (Sample from Specification)

### Test Case 11.1: PASS - All Valid Rows

| Year | Month | Supplier Code | Material Code | Quantity Procured | UoM      |
| ---- | ----- | ------------- | ------------- | ----------------- | -------- |
| 2021 | April | SUP001        | CG001         | 5                 | Nos      |
| 2021 | April | SUP002        | CG002         | 1000              | Kilogram |
| 2021 | May   | SUP001        | CG003         | 10                | EA       |

**Expected Calculations**:

**Row 1**:

- Material: CG001, Weight/Unit: 500 KG per Nos, Emission Factor: 2.5
- Total Weight: 5 × 500 = 2,500 KG
- Emissions: 2,500 × 2.5 = **6,250 KG CO2e**

**Row 2**:

- Material: CG002, Already in KG, Emission Factor: 0.5
- Total Weight: 1,000 KG
- Emissions: 1,000 × 0.5 = **500 KG CO2e**

**Row 3**:

- Material: CG003, Weight/Unit: 200 KG per EA, Emission Factor: 1.8
- Total Weight: 10 × 200 = 2,000 KG
- Emissions: 2,000 × 1.8 = **3,600 KG CO2e**

**Monthly Summary**:

- April Total: 6,250 + 500 = **6,750 KG CO2e**
- May Total: 3,600 = **3,600 KG CO2e**
- Grand Total: **10,350 KG CO2e**

**Validation**: ✅ PASS - All rows valid, upload accepted

---

## Summary Table: Quick Reference

| Rule              | Test Condition                           | Valid Value                        | Invalid Values                                                               | Result | Error                   |
| ----------------- | ---------------------------------------- | ---------------------------------- | ---------------------------------------------------------------------------- | ------ | ----------------------- |
| Material Type     | capital_goods only                       | capital_goods                      | raw_material, semi_finished_goods, finished_goods, packaging_material, waste | ✅     | ❌ Not capital_goods    |
| Year Range        | 2000-2100                                | 2021                               | 1999, 2101                                                                   | ✅     | ❌ Outside range        |
| Year Format       | 4 digits (YYYY)                          | 2021                               | 21, 2021-04                                                                  | ✅     | ❌ Not 4 digits         |
| Month             | Full name (January-December)             | April                              | Apr, 04, 4                                                                   | ✅     | ❌ Abbreviated/numeric  |
| Month Case        | First letter uppercase                   | April                              | april, APRIL                                                                 | ✅     | ❌ Wrong casing         |
| Quantity          | 0.01 to 999,999,999.99                   | 10, 10.5, 10.25                    | 0, 0.001, 1000000000                                                         | ✅     | ❌ Out of range         |
| Quantity Decimals | Max 2 decimal places                     | 10.25                              | 10.125, 10.9999                                                              | ✅     | ❌ More than 2 decimals |
| UoM               | From approved list                       | Kilogram, Nos, EA, Litre           | KG, kg, piece, units, Liter                                                  | ✅     | ❌ Not in master        |
| UoM Case          | Case-sensitive match                     | Kilogram, Litre                    | kilogram, kilogram, liter, LITRE                                             | ✅     | ❌ Wrong case           |
| Material Code     | Exists or auto-create as CG (Ease of MD) | HAAS-CNC-VF2-2021, NEW-MAT-PUMP-01 | (empty) - Must have value                                                    | ✅     | ❌ Empty only           |
| Supplier Code     | Exists or auto-create (Ease of MD)       | HAASMACH, NEW_SUP_XYZ              | (empty) - Must have value                                                    | ✅     | ❌ Empty only           |
| Duplicates        | Unique combo per row                     | Different quantities               | Exact Year-Month-Supplier-Material-Qty-UoM match                             | ✅     | ❌ Exact duplicate      |
| UoM Groups        | Same group for same material-month       | Kilogram + Gram (Mass)             | Kilogram (Mass) + Nos (Count)                                                | ✅     | ❌ Mixed UoM groups     |

---

## Reference: Valid Material Types

Only materials with type **capital_goods** are accepted for Capital Goods template.

| Material Type ID    | Label               | Status       | Note                                  |
| ------------------- | ------------------- | ------------ | ------------------------------------- |
| **capital_goods**   | Capital Goods       | **ACCEPTED** | **ONLY valid type for this template** |
| raw_material        | Raw Material        | Rejected     | Use material_procurement template     |
| semi_finished_goods | Semi-Finished Goods | Rejected     | Not for capital goods procurement     |
| finished_goods      | Finished Goods      | Rejected     | Not for capital goods procurement     |
| packaging_material  | Packaging Material  | Rejected     | Not for capital goods procurement     |
| waste               | Waste               | Rejected     | Use waste management template         |

### Valid Type Value

\\\
capital_goods
\\\

### Invalid Type Values (Will be rejected)

\\\
raw_material
semi_finished_goods
finished_goods
packaging_material
waste
\\\

---

## Reference: Complete UoM Master List (13 Options)

All UoM values are **case-sensitive**. Use exact values as shown below.

### Mass Group (Weight Units - 6 UoMs)

| UoM Value | Description           | Conversion Factor  | Usage                   |
| --------- | --------------------- | ------------------ | ----------------------- |
| Kilogram  | Kilogram              | Base unit (1)      | Standard for most goods |
| Tonne     | Metric Tonne (1000kg) | 1,000 kg per tonne | Heavy equipment, bulk   |
| Gram      | Gram                  | 1/1000 kg          | Small components        |
| Milligram | Milligram             | 1/1,000,000 kg     | Precious materials      |
| Pound     | Pound (Imperial)      | 0.453592 kg        | For imperial regions    |
| Ounce     | Ounce (Imperial)      | 0.0283495 kg       | Precious metals, spices |

### Count Group (Unit/Number - 2 UoMs)

| UoM Value | Description        | Conversion Factor                  | Usage                          |
| --------- | ------------------ | ---------------------------------- | ------------------------------ |
| Nos       | Number/Quantity    | Uses Weight Per Unit from Material | For items counted individually |
| EA        | Each (Same as Nos) | Uses Weight Per Unit from Material | Alternative notation for Nos   |

### Volume Group (Liquid/Capacity Units - 5 UoMs)

| UoM Value  | Description          | Conversion Factor | Usage                    |
| ---------- | -------------------- | ----------------- | ------------------------ |
| Litre      | Litre                | Base unit (1)     | Standard for liquids     |
| Millilitre | Millilitre (1/1000L) | 1/1000 litre      | Small volumes            |
| Kilolitre  | Kilolitre (1000L)    | 1,000 litres      | Large volumes, tankers   |
| Gallon     | US Gallon (3.785L)   | 3.785 litres      | North American suppliers |

### Total UoMs: 13 (6 Mass + 2 Count + 5 Volume)

**Important Notes**:

- All UoMs must match exactly (case-sensitive)
- Each material has a pre-defined UoM group in Material Master
- Cannot mix different UoM groups for same material in same month
- Material Master specifies "Weight Per Unit" for Nos/EA, "UoM Group" for validation

---

## Reference: Ease of Master Data - Auto-Create Supplier Feature

### Overview

The Capital Goods template implements **Ease of Master Data** principle by automatically creating supplier codes that don't exist in the Supplier Master.

### Feature Benefits

| Benefit                         | Description                                                        |
| ------------------------------- | ------------------------------------------------------------------ |
| **Reduced Pre-setup Work**      | Users don't need to pre-create all suppliers before uploading data |
| **Faster Data Entry**           | No delays waiting for master data setup                            |
| **Master Data Auto-Population** | Supplier master grows as new suppliers are referenced in uploads   |
| **Error Reduction**             | No rejections due to missing supplier codes                        |
| **User Experience**             | Seamless, non-blocking upload process                              |

### How It Works

```
User uploads Capital Goods data
         ↓
System validates each row
         ↓
For each Supplier Code:
    Check: Does supplier exist in master?
         ↓
    YES → Use existing supplier
         ↓
    NO → Auto-create new supplier
         ↓
Add supplier to master
         ↓
Process the data row
         ↓
Upload completes successfully
```

### Auto-Created Supplier Details

When a new supplier code is auto-created:

| Field          | Value                               |
| -------------- | ----------------------------------- |
| **Code**       | User-provided supplier code (as-is) |
| **Name**       | Same as code (can be edited later)  |
| **Status**     | Active                              |
| **Created By** | System (during data import)         |
| **Created On** | Current timestamp                   |

### Constraints

- ✅ Supplier code MUST have a value (cannot be empty)
- ✅ Supplier code format must be valid (per Supplier Master rules)
- ✅ Multiple new suppliers can be auto-created in single upload
- ✅ Auto-created suppliers have default name = code
- ✅ Users can edit supplier details later in Supplier Master

### Examples

**Example 1: Mixed Existing and New Suppliers**

- Upload contains 3 rows
- Row 1: Uses existing supplier "HAASMACH" → Accepted, processed
- Row 2: Uses new supplier "NEWCORP123" → Auto-created, accepted, processed
- Row 3: Uses existing supplier "SUPPLIER001" → Accepted, processed
- Result: Upload succeeds, 1 new supplier added to master

**Example 2: All New Suppliers**

- Upload contains 5 rows with 5 different new supplier codes
- All 5 suppliers auto-created in master
- All 5 rows accepted and processed
- Result: Upload succeeds, 5 new suppliers added to master

### Related Test Cases

- Test Case 6.1: Existing supplier (no auto-create)
- Test Case 6.2: Single new supplier auto-create
- Test Case 6.2a: Multiple new suppliers auto-create in same upload
- Test Case 6.3: Empty supplier code rejection

---

## Reference: Ease of Master Data - Auto-Create Material Feature

### Overview

The Capital Goods template implements **Ease of Master Data** principle by automatically creating material codes that don't exist in the Material Master, with type automatically set to **Capital Goods**.

### Feature Benefits

| Benefit                         | Description                                                             |
| ------------------------------- | ----------------------------------------------------------------------- |
| **Reduced Pre-setup Work**      | Users don't need to pre-create all materials before uploading data      |
| **Faster Data Entry**           | No delays waiting for master data setup                                 |
| **Master Data Auto-Population** | Material master grows as new materials are referenced in uploads        |
| **Type Auto-Assignment**        | Auto-created materials always have type = Capital Goods (template-safe) |
| **Error Reduction**             | No rejections due to missing material codes or wrong types              |
| **User Experience**             | Seamless, non-blocking upload process                                   |

### How It Works

```
User uploads Capital Goods data
         ↓
System validates each row
         ↓
For each Material Code:
    Check: Does material exist in master?
         ↓
    YES → Check: Type = Capital Goods?
         ↓
    YES → Use existing material
         ↓
    NO → FAIL (wrong type)
         ↓
    NO → Auto-create new material
         ↓
Set Type = 'Capital Goods' automatically
         ↓
Add material to master
         ↓
Process the data row
         ↓
Upload completes successfully
```

### Auto-Created Material Details

When a new material code is auto-created:

| Field               | Value                                        |
| ------------------- | -------------------------------------------- |
| **Code**            | User-provided material code (as-is)          |
| **Name**            | Same as code (can be edited later)           |
| **Type**            | **Capital Goods** (automatically set)        |
| **Status**          | Active                                       |
| **Weight Per Unit** | 1 KG per unit (default, can be adjusted)     |
| **Emission Factor** | 0 (default, must be set in Material Master)  |
| **UoM Group**       | (blank, must be assigned in Material Master) |
| **Created By**      | System (during data import)                  |
| **Created On**      | Current timestamp                            |

### Important Constraints

- ✅ Material code MUST have a value (cannot be empty)
- ✅ Material code format must be valid (per Material Master rules)
- ✅ Multiple new materials can be auto-created in single upload
- ✅ Auto-created materials ALWAYS have type = Capital Goods
- ✅ Existing materials MUST have type = Capital Goods (otherwise rejected)
- ✅ Users can edit material details later in Material Master
- ✅ Default Weight Per Unit = 1 KG (must update if different)
- ✅ Emission Factor defaults to 0 (must update for accurate calculations)
- ✅ UoM Group must be assigned for UoM validation to work

### Type Validation Rule

**Critical**: If a material code already exists in master but has type ≠ Capital Goods, it will be **REJECTED**.

Only two scenarios result in PASS:

1. Material exists AND type = Capital Goods → Accept (use existing)
2. Material does NOT exist → Auto-create with type = Capital Goods → Accept

Any other combination → REJECT

### Examples

**Example 1: Mixed Existing and New Materials**

- Upload contains 3 rows
- Row 1: Uses existing "HAAS-CNC-VF2-2021" (type=Capital Goods) → Accepted, processed
- Row 2: Uses new material "NEW-PUMP-001" → Auto-created with type=Capital Goods, accepted, processed
- Row 3: Uses existing "HAAS-CNC-VF2-2021" → Accepted, processed
- Result: Upload succeeds, 1 new material added to master with Capital Goods type

**Example 2: All New Materials**

- Upload contains 4 rows with 4 different new material codes
- All 4 materials auto-created with type = Capital Goods
- All 4 rows accepted and processed
- Result: Upload succeeds, 4 new materials added to master

**Example 3: Type Mismatch Rejection**

- Upload contains 2 rows
- Row 1: Uses material "RM-STEEL-001" (exists but type=Raw Material) → REJECTED
- Row 2: Cannot be processed due to Row 1 failure
- Result: Upload fails with clear error message about type mismatch

### Related Test Cases

- Test Case 7.1: Existing material with Capital Goods type (no auto-create)
- Test Case 7.2: Single new material auto-create
- Test Case 7.2a: Multiple new materials auto-create in same upload
- Test Case 7.3: Empty material code rejection
- Test Case 7.4: Existing material with wrong type rejection

---

## Reference: Material Type Rejection Examples

### Rejection Flow Diagram

\\\
Upload Material Code

Check Material Master

Get Material Type

Is type = 'capital_goods'?

YES NO

ACCEPT REJECT
Display Error:
"Material Code 'XXX' is not
defined as Capital Goods.
Please use materials with
Material Type = 'Capital Goods' only."
\\\

### Why Only capital_goods is Valid

- **Capital Goods** = Long-term fixed assets and equipment
- Other material types represent different categories in the supply chain
- Each category has its own template and emission calculation method
- Mixing types would produce inaccurate emissions data

---

## Test Execution Checklist

- [ ] Test Case 1.1: Valid capital_goods material - PASS
- [ ] Test Case 1.2: raw_material rejected - FAIL with error
- [ ] Test Case 1.3: packaging_material rejected - FAIL with error
- [ ] Test Case 1.4: semi_finished_goods rejected - FAIL with error
- [ ] Test Case 1.5: finished_goods rejected - FAIL with error
- [ ] Test Case 1.6: waste rejected - FAIL with error
- [ ] Test Cases 2-11: Other field validations
- [ ] All error messages display correctly
- [ ] Duplicate detection works
- [ ] UoM group consistency validated
- [ ] Multiple entries processed separately
- [ ] Monthly aggregation calculated correctly
