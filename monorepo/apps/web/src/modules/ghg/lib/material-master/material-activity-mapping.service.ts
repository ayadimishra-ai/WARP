import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";

export interface IMaterialActivityMapping {
  materialCode: string;
  isUsedInActivity: boolean;
  usedIn: {
    capitalGoods: boolean;
    materialProcurement: boolean;
    upstreamTransport: boolean;
    productShare: boolean;
  };
  uomInActivity?: string[]; // UoMs used in activity data
}

/**
 * Check if materials are used in any activity data
 * Returns mapping of material codes to their activity usage
 */
export async function checkMaterialActivityMapping(
  materialCodes: string[],
  organizationId: UUID
): Promise<Map<string, IMaterialActivityMapping>> {
  const sdk = await getGraphQlServerSDK();
  const resultMap = new Map<string, IMaterialActivityMapping>();

  // Initialize all material codes with default values
  materialCodes.forEach((code) => {
    const sanitized = sanitizeString.v1(code);
    resultMap.set(sanitized, {
      materialCode: code,
      isUsedInActivity: false,
      usedIn: {
        capitalGoods: false,
        materialProcurement: false,
        upstreamTransport: false,
        productShare: false,
      },
      uomInActivity: [],
    });
  });

  // Get all organization addresses first
  const orgAddressesResponse = await sdk.getOrganizationAddressIds({
    organization_id: organizationId,
  });

  const orgAddressIds =
    orgAddressesResponse?.OrganizationAddress?.map((addr) => addr.id) || [];

  if (orgAddressIds.length === 0) {
    return resultMap; // No addresses, so no activity data possible
  }

  const material_codes_upper = materialCodes.map(x => x.toUpperCase());
  const material_codes_lower = materialCodes.map(x => x.toLowerCase());

  // Check material usage in all activity tables
  const activityResponse = await sdk.checkMaterialUsedInActivities({
    material_codes: materialCodes,
    material_codes_upper: material_codes_upper,
    material_codes_lower: material_codes_lower,
    org_address_ids: orgAddressIds,
  });

  // Process Capital Goods usage
  activityResponse?.CapitalGoods?.forEach((item) => {
    if (item.Material_Code) {
      const sanitized = sanitizeString.v1(item.Material_Code);
      const mapping = resultMap.get(sanitized);
      if (mapping) {
        mapping.isUsedInActivity = true;
        mapping.usedIn.capitalGoods = true;
        if (item.Quantity_Procured_uom) {
          mapping.uomInActivity = mapping.uomInActivity || [];
          if (!mapping.uomInActivity.includes(item.Quantity_Procured_uom)) {
            mapping.uomInActivity.push(item.Quantity_Procured_uom);
          }
        }
      }
    }
  });

  // Process Material Procurement usage
  activityResponse?.MaterialProcurement?.forEach((item) => {
    if (item.Material_Code) {
      const sanitized = sanitizeString.v1(item.Material_Code);
      const mapping = resultMap.get(sanitized);
      if (mapping) {
        mapping.isUsedInActivity = true;
        mapping.usedIn.materialProcurement = true;
      }
    }
  });

  // Process Upstream Transport usage
  activityResponse?.UpstreamTransport?.forEach((item) => {
    if (item.Material_ID) {
      const sanitized = sanitizeString.v1(item.Material_ID);
      const mapping = resultMap.get(sanitized);
      if (mapping) {
        mapping.isUsedInActivity = true;
        mapping.usedIn.upstreamTransport = true;
      }
    }
  });

  // Process Product Share usage
  activityResponse?.ProductShare?.forEach((item) => {
    if (item.Material_Code) {
      const sanitized = sanitizeString.v1(item.Material_Code);
      const mapping = resultMap.get(sanitized);
      if (mapping) {
        mapping.isUsedInActivity = true;
        mapping.usedIn.productShare = true;
      }
    }
  });

  return resultMap;
}

/**
 * Check if a single material is used in activity data
 */
export async function checkSingleMaterialActivityMapping(
  materialCode: string,
  organizationId: UUID
): Promise<IMaterialActivityMapping> {
  const mappingMap = await checkMaterialActivityMapping(
    [materialCode],
    organizationId
  );
  const sanitized = sanitizeString.v1(materialCode);
  return (
    mappingMap.get(sanitized) || {
      materialCode,
      isUsedInActivity: false,
      usedIn: {
        capitalGoods: false,
        materialProcurement: false,
        upstreamTransport: false,
        productShare: false,
      },
      uomInActivity: [],
    }
  );
}
