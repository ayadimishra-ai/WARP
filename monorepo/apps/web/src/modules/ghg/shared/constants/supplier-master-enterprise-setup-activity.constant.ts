export const SUPPLIERS = "Suppliers";
export const SUPPLIER_NAME = "SupplierName";
export const SUPPLIER_CODE = "SupplierCode";
export const SUPPLIER_CATEGORY = "SupplierCategory";
export const SUPPLIER_PAN_OR_LICENSE_NUMBER = "SupplierPANorLicenseNumber";
export const SUPPLIER_GST_OR_LICENSE_NUMBER = "SupplierPANorLicenseNumber";
export const ACTIVITY_MASTER_KEY = "supplier_category";
// export const SUPPLIER_FULL_ADDRESS = "SupplierFullAddress";
// export const DATA_REQUIRED_FOR = "DataRequiredFor";
export const SUPPLIER_ADMIN_EMAIL_ID = "SupplierAdminEmailId";
export const SUPPLIER_ADMIN_NAME = "SupplierAdminName";
// export const COUNTRY = "Country";

export const SupplierMasterEnterpriseSetupActivityConstant = {
  name: "Supplier Master",
  code: "supplier_master",
  parent_code: "supplier_master",
  excel_template: {
    sheets: [
      {
        name: SUPPLIERS,
        code: "suppliers",
        columns: [
          {
            name: SUPPLIER_NAME,
            code: "supplier_name",
          },
          {
            name: SUPPLIER_CODE,
            code: "supplier_code",
          },
          {
            name: SUPPLIER_CATEGORY,
            code: "supplier_category",
          },
          {
            name: SUPPLIER_GST_OR_LICENSE_NUMBER,
            code: "supplier_gst_or_license_number",
          },
          {
            name: SUPPLIER_ADMIN_EMAIL_ID,
            code: "supplier_admin_email_id",
          },
          {
            name: SUPPLIER_ADMIN_NAME,
            code: "supplier_admin_name",
          },
        ],
      },
    ],
  },
} as const;

export type TSupplierMasterEnterpriseSetupActivityCode =
  (typeof SupplierMasterEnterpriseSetupActivityConstant)["code"];

export type TSupplierMasterEnterpriseSetupSheetNames =
  (typeof SupplierMasterEnterpriseSetupActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TSupplierMasterEnterpriseSetupSheetColumnCodes =
  (typeof SupplierMasterEnterpriseSetupActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["code"];

export type TSupplierMasterEnterpriseSetupSheetColumnNames =
  (typeof SupplierMasterEnterpriseSetupActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];

export type TSupplierMasterEnterpriseSetupSheetData = Record<
  TSupplierMasterEnterpriseSetupSheetColumnNames,
  any
>;
