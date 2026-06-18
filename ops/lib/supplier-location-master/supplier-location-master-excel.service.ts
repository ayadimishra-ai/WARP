import { UUID } from "crypto";
import { getGraphQlServerSDK } from "~/graphql/server";
import {
  Addresses_Insert_Input,
  Addresses_Set_Input,
  SupplierAddressMapping_Insert_Input,
} from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { TExcelSheet } from "~/lib/excel/excel.service";
import { saveMaterialMasterBulk } from "~/lib/supplier-master/supplier-master.service";
import {
  LOCATION_ADDRESS,
  LOCATION_CODE,
  LOCATION_COUNTRY,
  LOCATION_NAME,
  LOCATION_PIN_OR_ZIP_CODE,
  SUPPLIER_CODE,
} from "~/shared/constants/supplier-location-master-activity.constant";
import { sanitizeString } from "~/utils/sanitize.util";

export const saveSupplierLocationMasterSheetEntries = async (
  excelData: TExcelSheet[],
  userSession: TUserSession
) => {
  const sdk = await getGraphQlServerSDK();
  const organizationId = userSession.organizationId as UUID;
  const sheetData = excelData[0]; // Only one sheet: SupplierLocations

  // Fetch reference data
  const countryData = await sdk.getCountryData();
  const countryList = countryData?.Country ?? [];

  // Fetch existing supplier codes for this org
  const supplierCodes = sheetData.data.map((item) =>
    sanitizeString.v2(String(item[SUPPLIER_CODE]))
  );
  // Auto-create missing supplier codes using saveMaterialMasterBulk

  const createdSupplierData = await saveMaterialMasterBulk(
    userSession,
    [],
    sheetData.data
      .filter((item) => !!item["SupplierCode"])
      .map((item) => String(item["SupplierCode"])),
    "supplier_master"
  );

  // Re-fetch supplier master data (now includes any newly created suppliers)
  const supplierMasterResponse = await sdk.getSupplierCodesByCodes({
    where: {
      organization_id: { _eq: organizationId },
      is_deleted: { _eq: false },
      _or: supplierCodes.map((code) => ({ code: { _ilike: code } })),
    },
  });
  const supplierMasterData = supplierMasterResponse?.OrgSupplierMaster ?? [];

  // Fetch existing SupplierAddressMappings for these suppliers to detect updates
  const supplierMasterIds = supplierMasterData.map((s) => s.id);
  const existingMappingsResponse =
    supplierMasterIds.length > 0
      ? await sdk.getExistingSupplierLocationsBySupplierIds({
          supplierMasterIds,
        })
      : null;
  const existingMappings =
    existingMappingsResponse?.SupplierAddressMapping ?? [];

  // Build lookup: "supplierMasterId::locationName" -> existing address_id
  const existingLookup = new Map<string, string>();
  for (const mapping of existingMappings) {
    const key = `${mapping.org_supplier_master_id}::${sanitizeString.v1(mapping.Address?.name ?? "")}`;
    existingLookup.set(key, mapping.address_id);
  }

  // Separate rows into new inserts and updates
  const newAddressInserts: Addresses_Insert_Input[] = [];
  const newRowSupplierIds: string[] = [];

  const addressUpdates: { addressId: string; data: Addresses_Set_Input }[] = [];

  for (let i = 0; i < sheetData.data.length; i++) {
    const row = sheetData.data[i];

    const supplierCode = sanitizeString.v2(String(row[SUPPLIER_CODE]));
    const locationName = sanitizeString.v2(String(row[LOCATION_NAME]));
    const locationCode = sanitizeString.v2(String(row[LOCATION_CODE] ?? ""));
    const locationAddress = sanitizeString.v2(String(row[LOCATION_ADDRESS]));
    const countryName = sanitizeString.v2(String(row[LOCATION_COUNTRY]));
    const pincode = sanitizeString.v2(String(row[LOCATION_PIN_OR_ZIP_CODE]));

    // Resolve country ID
    const countryObj = countryList.find(
      (c) => sanitizeString.v1(c?.name ?? "") === sanitizeString.v1(countryName)
    );
    const countryId = countryObj?.id;

    // Resolve supplier master ID
    const supplierObj = supplierMasterData.find(
      (s) =>
        sanitizeString.v1(s?.code || "") === sanitizeString.v1(supplierCode)
    );

    if (!supplierObj || !countryId) continue;

    // Check if this supplier + location name already exists
    const lookupKey = `${supplierObj.id}::${sanitizeString.v1(locationName)}`;
    const existingAddressId = existingLookup.get(lookupKey);

    if (existingAddressId) {
      // UPDATE existing address
      addressUpdates.push({
        addressId: existingAddressId,
        data: {
          name: locationName,
          code: locationCode || locationName,
          client_master_id: locationCode || locationName,
          full_address: locationAddress,
          pincode: pincode,
          country_id: countryId,
          updated_by: userSession.userId,
        },
      });
    } else {
      // INSERT new address
      newAddressInserts.push({
        name: locationName,
        code: locationCode || locationName,
        client_master_id: locationCode || locationName,
        full_address: locationAddress,
        pincode: pincode,
        country_id: countryId,
        type: "Manufacturing",
        ownership_type: "Own",
        facility_type: "Factory",
        is_wwtp: "no",
        created_by: userSession.userId,
        updated_by: userSession.userId,
      });
      newRowSupplierIds.push(supplierObj.id);
    }
  }

  let totalAffectedRows = 0;
  const allAddressData: any[] = [];

  // ── Update existing addresses one by one ──
  for (const update of addressUpdates) {
    const updateResponse = await sdk.updateAddressByPk({
      addressId: update.addressId,
      updateAddress: update.data,
    });
    if (updateResponse?.update_Addresses_by_pk) {
      allAddressData.push(updateResponse.update_Addresses_by_pk);
    }
    totalAffectedRows++;
  }

  // ── Insert new addresses in batches ──
  const batchSize = 500;
  const allNewAddressIds: string[] = [];

  for (let i = 0; i < newAddressInserts.length; i += batchSize) {
    const batch = newAddressInserts.slice(i, i + batchSize);
    const addressResponse = await sdk.insertAddresses({
      AddressData: batch,
    });
    const returning = addressResponse?.insert_Addresses?.returning ?? [];
    returning.forEach((addr) => {
      allNewAddressIds.push(addr.id);
      allAddressData.push(addr);
    });
  }

  // ── Create SupplierAddressMapping for new entries only ──
  const mappingInserts: SupplierAddressMapping_Insert_Input[] = [];
  const allMappingData: any[] = [];

  for (let i = 0; i < allNewAddressIds.length; i++) {
    const addressId = allNewAddressIds[i];
    const supplierMasterId = newRowSupplierIds[i];

    if (!supplierMasterId) continue;

    mappingInserts.push({
      address_id: addressId,
      org_supplier_master_id: supplierMasterId,
      created_by: userSession.userId,
      updated_by: userSession.userId,
    });
  }

  for (let i = 0; i < mappingInserts.length; i += batchSize) {
    const batch = mappingInserts.slice(i, i + batchSize);
    const mappingResponse = await sdk.upsertSupplierAddressMapping({
      objects: batch,
    });
    const mappingReturning =
      mappingResponse?.insert_SupplierAddressMapping?.returning ?? [];
    allMappingData.push(...mappingReturning);
    totalAffectedRows +=
      mappingResponse?.insert_SupplierAddressMapping?.affected_rows ?? 0;
  }

  return {
    affected_rows: totalAffectedRows,
    addressData: allAddressData,
    mappingData: allMappingData,
    supplierMasters: createdSupplierData.supplierMasters,
  };
};
