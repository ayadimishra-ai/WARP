# Material Weight Data for Non-Mass Based UOMs

This document contains the material weight per unit data for materials that use non-mass based UOMs (EA, Nos, Litre, Millilitre, Kilolitre, Gallon).

## Material Weight Mapping

| Material Code | Material Weight Per Unit | UoM Material Weight |
| ------------- | ------------------------ | ------------------- |
| CEAT-AG-008   | 15.5                     | Kilogram/EA         |
| CEAT-AG-009   | 16.2                     | Kilogram/Nos        |
| CEAT-OHT-010  | 18.7                     | Kilogram/EA         |
| CEAT-CON-011  | 22.3                     | Kilogram/EA         |
| CEAT-EM-012   | 0.85                     | Kilogram/litre      |
| CEAT-PCR-013  | 0.92                     | Kilogram/litre      |
| CEAT-SP-014   | 850                      | Kilogram/litre      |
| CEAT-AT-015   | 0.88                     | Kilogram/litre      |
| CEAT-WG-016   | 0.95                     | Kilogram/litre      |
| CEAT-ACC-017  | 0.78                     | Kilogram/litre      |
| CEAT-ACC-018  | 12.5                     | Kilogram/EA         |
| CEAT-ACC-019  | 14.8                     | Kilogram/Nos        |
| CEAT-RR-020   | 920                      | Kilogram/litre      |
| CEAT-IND-021  | 0.91                     | Kilogram/litre      |
| CEAT-3W-022   | 8.5                      | Kilogram/Nos        |
| CEAT-3W-023   | 9.2                      | Kilogram/EA         |
| CEAT-RC-025   | 25.0                     | Kilogram/EA         |
| CEAT-PCR-026  | 11.5                     | Kilogram/EA         |
| CEAT-SCO-029  | 13.8                     | Kilogram/EA         |
| CEAT-CV-030   | 45.5                     | Kilogram/EA         |
| CEAT-CV-031   | 48.2                     | Kilogram/Nos        |
| CEAT-LCV-032  | 0.82                     | Kilogram/litre      |
| CEAT-AG-033   | 0.89                     | Kilogram/litre      |
| CEAT-AG-034   | 52.5                     | Kilogram/EA         |
| CEAT-OHT-035  | 0.87                     | Kilogram/litre      |
| CEAT-CON-036  | 880                      | Kilogram/litre      |
| CEAT-PCR-038  | 10.8                     | Kilogram/Nos        |
| CEAT-SP-039   | 0.93                     | Kilogram/litre      |
| CEAT-ACC-042  | 0.84                     | Kilogram/litre      |
| CEAT-ACC-043  | 0.86                     | Kilogram/litre      |
| CEAT-IND-044  | 0.90                     | Kilogram/litre      |
| CEAT-3W-045   | 0.88                     | Kilogram/litre      |
| CEAT-MC-028   | 6.5                      | Kilogram/Nos        |

## Notes

- **EA (Each)** and **Nos (Numbers)**: Material weight represents the weight per individual unit
- **Litre**: Material weight represents kg per litre (density)
- **Millilitre**: Material weight represents kg per millilitre (will be converted internally)
- **Kilolitre**: Material weight represents kg per kilolitre (will be converted internally)
- **Gallon**: Material weight represents kg per gallon (will be converted internally)

## SQL INSERT for OrgMaterialMaster

```sql
-- Update Material Weight Per Unit for non-mass based UOMs
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 15.5, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-AG-008' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 16.2, "UoM_Material_Weight" = 'Kilogram/Nos' WHERE code = 'CEAT-AG-009' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 18.7, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-OHT-010' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 22.3, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-CON-011' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.85, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-EM-012' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.92, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-PCR-013' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 850, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-SP-014' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.88, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-AT-015' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.95, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-WG-016' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.78, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-ACC-017' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 12.5, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-ACC-018' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 14.8, "UoM_Material_Weight" = 'Kilogram/Nos' WHERE code = 'CEAT-ACC-019' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 920, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-RR-020' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.91, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-IND-021' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 8.5, "UoM_Material_Weight" = 'Kilogram/Nos' WHERE code = 'CEAT-3W-022' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 9.2, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-3W-023' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 25.0, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-RC-025' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 11.5, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-PCR-026' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 13.8, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-SCO-029' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 45.5, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-CV-030' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 48.2, "UoM_Material_Weight" = 'Kilogram/Nos' WHERE code = 'CEAT-CV-031' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.82, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-LCV-032' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.89, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-AG-033' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 52.5, "UoM_Material_Weight" = 'Kilogram/EA' WHERE code = 'CEAT-AG-034' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.87, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-OHT-035' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 880, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-CON-036' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 10.8, "UoM_Material_Weight" = 'Kilogram/Nos' WHERE code = 'CEAT-PCR-038' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.93, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-SP-039' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.84, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-ACC-042' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.86, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-ACC-043' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.90, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-IND-044' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 0.88, "UoM_Material_Weight" = 'Kilogram/litre' WHERE code = 'CEAT-3W-045' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
UPDATE "OrgMaterialMaster" SET "Material_Weight_Per_Unit" = 6.5, "UoM_Material_Weight" = 'Kilogram/Nos' WHERE code = 'CEAT-MC-028' AND organization_id = 'ce25acad-8602-4c9f-9365-ebf4ac2d5a8e';
```

## Summary

- **Total materials with non-mass UOMs**: 33
- **EA (Each)**: 11 materials
- **Nos (Numbers)**: 8 materials
- **Litre**: 14 materials
- **Millilitre**: 0 materials (not in provided data)
- **Kilolitre**: 0 materials (not in provided data)
- **Gallon**: 0 materials (not in provided data)

Materials with mass-based UOMs (Kilogram, Gram, Tonne, Milligram, Pound, Ounce, Carat) do NOT need Material_Weight_Per_Unit as the quantity itself represents the mass.
