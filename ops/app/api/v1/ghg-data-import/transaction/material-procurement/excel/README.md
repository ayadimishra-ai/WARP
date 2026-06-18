# Template Management Changes Guide

This document outlines the changes required for different template modifications in the GHG data import system.

## 1. Material Template Changes

while updating material master template, the following files needs to be modified:

### Database Changes

we need to add following columns in `OrgMaterialMaster` table in db, as per new specs.
`format`: column name in excel - db field name - type - status

    MaterialMasterID - client_master_id - text - present
    MaterialName - name - text - present
    MaterialCode - code - text - present
    MaterialType - type - text - present
    Material Weight - material_weight - double - new
    UoM Material Weight (Kg) - material_uom - text - new
    Material Classification - material_classification - double - new
    Material Description - material_description - text - new
    Additional Information - material_information - text - new

### Code Changes

create route file - API endpoint
create validation file - validation changes
create service file - business logic
create audit log file

## 2. Material Template Changes

When updating the Material Procurement template, the following components need to be modified:

### Database Changes

- Add new columns to existing material tables
- Update table constraints and indexes as needed

### Code Changes

- **material-procurement-excel.validation.ts** - Update validation rules for new fields
- **material-procurement-excel.service.ts** - Modify business logic to handle new data
- **activity.constants.ts** - Add new activity constants
- **auditlog.service.ts** - Update audit logging for new fields
- **emission-material-consumption.service.ts** - Update GHG emission calculations
- **emission-calculation.service.ts** - Refresh KPI table emissions
- **dashboardqueries.ts** - Update KPI data preparation queries

## 3. Upstream Template Changes

For Transport Upstream template modifications:

### Database Changes

- Column additions to transport tables
- Schema updates for upstream data

### Code Changes

- **transport-upstream-excel.validation.ts** - Validation updates
- **transport-upstream-excel.service.ts** - Business logic changes
- **activity.constants.ts** - New constants definition
- **auditlog.service.ts** - Audit trail updates
- **emission-transport.service.ts** - GHG calculation updates
- **emission-calculation.service.ts** - KPI emission updates
- **dashboardqueries.ts** - KPI query modifications

## 4. Capital Goods Template Implementation

Adding a new Capital Goods template requires comprehensive setup:

### Database Setup

- Create new capital goods table structure
- Add activity master entry
- Set up user activity mappings

### API Development

- Create new route endpoints
- Build validation file for data validation
- Develop service file for business logic
- Add activity constants

### Validation & Processing

- Implement schema validations
- Add data validation rules
- Create master data validations
- Build insertion logic

### Audit & Emissions

- Create audit log table
- Add audit methods to auditlog.service
- Implement emission calculation methods
- Update GHG table with new emissions

### Reporting & KPIs

- Create dashboard queries for KPIs
- Insert emission data into KPI tables
- Set up reporting structure

### Unit Conversion Consideration

- Evaluate kg conversion implementation using from_uom and to_uom
- Analyze impact on existing activities before implementation
- Pending confirmation on cross-activity effects
