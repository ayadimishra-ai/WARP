// Material Master Activity Constants
export const MATERIAL_MASTER_ID = "MaterialMasterID";
export const MATERIAL_NAME = "MaterialName";
export const MATERIAL_CODE = "MaterialCode";
export const MATERIAL_TYPE = "MaterialType";
export const MATERIAL_WEIGHT = "Material Weight";
export const UOM_MATERIAL_WEIGHT = "UoM Material Weight";
export const MATERIAL_CLASSIFICATION = "Material Classification";
export const MATERIAL_DESCRIPTION = "Material Description";
export const ADDITIONAL_INFORMATION = "Additional Information";

export const MATERIAL_MASTER = "Material Master";
export const MASTER = "Master";
export const GUIDELINE = "Guideline";

export type TMaterialMasterActivitySheetNames =
  | typeof GUIDELINE
  | typeof MATERIAL_MASTER
  | typeof MASTER;

export type TMaterialMasterActivitySheetColumnNames =
  | typeof MATERIAL_MASTER_ID
  | typeof MATERIAL_NAME
  | typeof MATERIAL_CODE
  | typeof MATERIAL_TYPE
  | typeof MATERIAL_WEIGHT
  | typeof UOM_MATERIAL_WEIGHT
  | typeof MATERIAL_CLASSIFICATION
  | typeof MATERIAL_DESCRIPTION
  | typeof ADDITIONAL_INFORMATION;

export const MaterialMasterActivityConstant = {
  code: "material_master",
  name: "Material Master",
  excel_template: {
    sheets: [
      {
        name: MATERIAL_MASTER,
        columns: [
          { name: MATERIAL_MASTER_ID, mandatory: false },
          { name: MATERIAL_NAME, mandatory: true },
          { name: MATERIAL_CODE, mandatory: true },
          { name: MATERIAL_TYPE, mandatory: true },
          { name: MATERIAL_WEIGHT, mandatory: false },
          { name: UOM_MATERIAL_WEIGHT, mandatory: false },
          { name: MATERIAL_CLASSIFICATION, mandatory: false },
          { name: MATERIAL_DESCRIPTION, mandatory: false },
          { name: ADDITIONAL_INFORMATION, mandatory: false },
        ],
      },
    ],
  },
};

// Material Type Options
export const MATERIAL_TYPES = [
  "Raw material",
  "Packaging material",
  "Finished Goods",
  "Waste",
  "Semi-Finished Goods",
  "Capital Goods",
  "Others",
] as const;

// UoM Material Weight Options
export const UOM_OPTIONS = [
  "Kilogram/litre",
  "Kilogram/EA",
  "Kilogram/Nos",
  "Tonne/litre",
  "Tonne/EA",
  "Tonne/Nos",
  "Gram/litre",
  "Gram/EA",
  "Gram/Nos",
] as const;
