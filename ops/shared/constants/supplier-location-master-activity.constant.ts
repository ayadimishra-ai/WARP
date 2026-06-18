export const SUPPLIER_LOCATIONS = "Suppliers Locations";
export const SUPPLIER_CODE = "SupplierCode";
export const LOCATION_NAME = "LocationName";
export const LOCATION_CODE = "LocationCode";
export const LOCATION_ADDRESS = "LocationFullAddress";
export const LOCATION_COUNTRY = "LocationCountry";
export const LOCATION_PIN_OR_ZIP_CODE = "LocationPinOrZipCode";

export const SupplierLocationMasterActivityConstant = {
  name: "Supplier Location Master",
  code: "supplier_location_master",
  parent_code: "supplier_location_master",
  excel_template: {
    sheets: [
      {
        name: SUPPLIER_LOCATIONS,
        code: "supplier_locations",
        columns: [
          {
            name: SUPPLIER_CODE,
            code: "supplier_code",
          },
          {
            name: LOCATION_NAME,
            code: "location_name",
          },
          {
            name: LOCATION_CODE,
            code: "location_code",
          },
          {
            name: LOCATION_ADDRESS,
            code: "location_address",
          },
          {
            name: LOCATION_COUNTRY,
            code: "location_country",
          },
          {
            name: LOCATION_PIN_OR_ZIP_CODE,
            code: "location_pin_or_zip_code",
          },
        ],
      },
    ],
  },
} as const;

export type TSupplierLocationMasterActivitySheetNames =
  (typeof SupplierLocationMasterActivityConstant)["excel_template"]["sheets"][number]["name"];

export type TSupplierLocationMasterActivitySheetColumnNames =
  (typeof SupplierLocationMasterActivityConstant)["excel_template"]["sheets"][number]["columns"][number]["name"];
