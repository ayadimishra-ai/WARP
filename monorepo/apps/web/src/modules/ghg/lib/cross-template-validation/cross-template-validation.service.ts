/**
 * Cross-Template Validation Service
 *
 * Rules:
 * - Capital Goods ↔ Procurement Family = NOT ALLOWED
 * - Upstream ↔ Material Procurement = ALLOWED
 */

import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { sanitize_compare_str_v4 } from "@/modules/ghg/utils/comapre.util";

/**
 * UUID type
 * Prefer branded string instead of importing from crypto
 */
export type UUID = string;

/**
 * Template Groups
 */
export const TEMPLATE_GROUPS = {
  CAPITAL_GOODS: "CG_GROUP",
  PROCUREMENT: "PROCUREMENT_GROUP",
} as const;

export type TemplateGroup =
  (typeof TEMPLATE_GROUPS)[keyof typeof TEMPLATE_GROUPS];

/**
 * Template registry
 */
const TEMPLATE_GROUP_REGISTRY: Record<string, TemplateGroup> = {
  capital_goods: TEMPLATE_GROUPS.CAPITAL_GOODS,

  upstream: TEMPLATE_GROUPS.PROCUREMENT,
  transport_upstream: TEMPLATE_GROUPS.PROCUREMENT,
  material_procurement: TEMPLATE_GROUPS.PROCUREMENT,
};

/**
 * Validation Result
 */
export interface ICrossTemplateValidationResult {
  status: "pass" | "error";
  reason?: string;
}

export interface ICrossTemplateConflict {
  materialCode: string;
  conflictingTemplate: "Capital Goods" | "Upstream / Material Procurement";
}

/**
 * Normalize material code
 */
// const normalizeMaterialCode = (value: string): string =>
//   sanitize_compare_str_v4(String(value || ""));

// /**
//  * Get template group
//  */
// export const getTemplateGroup = (
//   templateCode: string
// ): TemplateGroup | null => {
//   const normalizedCode = normalizeMaterialCode(templateCode);

//   return TEMPLATE_GROUP_REGISTRY[normalizedCode] ?? null;
// };

export const getTemplateGroup = (
  templateCode: string
): TemplateGroup | null => {
  const normalizedCode = templateCode.toLowerCase().trim();
  return TEMPLATE_GROUP_REGISTRY[normalizedCode] ?? null;
};
/**
 * Core validation
 */
export const validateCrossTemplate = (
  materialCode: string,
  incomingTemplateCode: string,
  existingTemplateGroups: Set<TemplateGroup>
): ICrossTemplateValidationResult => {
  const incomingGroup = getTemplateGroup(incomingTemplateCode);

  if (!incomingGroup) {
    return { status: "pass" };
  }

  if (existingTemplateGroups.size === 0) {
    return { status: "pass" };
  }

  /**
   * Capital Goods cannot coexist with Procurement family
   */
  if (
    incomingGroup === TEMPLATE_GROUPS.CAPITAL_GOODS &&
    existingTemplateGroups.has(TEMPLATE_GROUPS.PROCUREMENT)
  ) {
    return {
      status: "error",
      reason: `Material Code '${materialCode}' already exists in Upstream / Material Procurement.`,
    };
  }

  /**
   * Procurement family cannot coexist with Capital Goods
   */
  if (
    incomingGroup === TEMPLATE_GROUPS.PROCUREMENT &&
    existingTemplateGroups.has(TEMPLATE_GROUPS.CAPITAL_GOODS)
  ) {
    return {
      status: "error",
      reason: `Material Code '${materialCode}' already exists in Capital Goods.`,
    };
  }

  return { status: "pass" };
};

/**
 * Fetch existing template usage
 */
export const fetchExistingTemplateGroups = async (
  materialCodes: string[],
  organizationId: UUID
): Promise<Map<string, Set<TemplateGroup>>> => {
  const templateGroupMap = new Map<string, Set<TemplateGroup>>();

  if (!materialCodes.length) {
    return templateGroupMap;
  }

  const sdk = await getGraphQlServerSDK();

  const normalizedCodes = materialCodes.map((code) => code.toLowerCase().trim());

  const result =
    await sdk.getDistinctUOMsUpstreamCapitalGoodsByMaterialCodes({
      whereUpstream: {
        _or: normalizedCodes.map((code) => ({
          Material_ID: { _ilike: `%${code}%` },
        })),
        OrganizationAddress: {
          organization_id: {
            _eq: organizationId,
          },
        },
      },

      whereCapitalGoods: {
        _or: normalizedCodes.map((code) => ({
          Material_Code: { _ilike: `%${code}%` },
        })),
        OrganizationAddress: {
          organization_id: {
            _eq: organizationId,
          },
        },
      },

      whereMaterialMaster: {
        _and: [
          {
            _or: normalizedCodes.map((code) => ({
              code: { _ilike: `%${code}%` },
            })),
          },
          {
            organization_id: {
              _eq: organizationId,
            },
          },
        ],
      },
    });

  /**
   * Capital Goods
   */
  result?.GHGCapital_Goods?.forEach((item) => {
    if (!item?.Material_Code) return;

    const code = item.Material_Code.toLowerCase().trim();

    if (!templateGroupMap.has(code)) {
      templateGroupMap.set(code, new Set());
    }

    templateGroupMap
      .get(code)!
      .add(TEMPLATE_GROUPS.CAPITAL_GOODS);
  });

  /**
   * Upstream
   */
  result?.GHGTransport_Upstream?.forEach((item) => {
    if (!item?.Material_ID) return;

    const code = item.Material_ID.toLowerCase().trim();

    if (!templateGroupMap.has(code)) {
      templateGroupMap.set(code, new Set());
    }

    templateGroupMap
      .get(code)!
      .add(TEMPLATE_GROUPS.PROCUREMENT);
  });

  /**
   * Material Master type — if a material was created with a specific type
   * through Material Master bulk upload (without activity data), enforce
   * the same cross-template ownership rules.
   *
   * - type = "Capital Goods" → belongs to CG_GROUP
   * - any other type         → belongs to PROCUREMENT_GROUP
   */
  const materialMasterResult =
    await sdk.getMaterialMasterByOrgIdAndCodes({
      where: {
        _and: [
          {
            _or: normalizedCodes.map((code) => ({
              code: { _ilike: `%${code}%` },
            })),
          },
          {
            organization_id: {
              _eq: organizationId,
            },
          },
        ],
      },
    });

  materialMasterResult?.OrgMaterialMaster?.forEach((item) => {
    if (!item?.code) return;

    const code = item.code.toLowerCase().trim();
    const materialType = (item.type || "").toLowerCase().trim();

    if (!materialType) return;

    if (!templateGroupMap.has(code)) {
      templateGroupMap.set(code, new Set());
    }

    if (materialType === "capital goods") {
      templateGroupMap
        .get(code)!
        .add(TEMPLATE_GROUPS.CAPITAL_GOODS);
    } else {
      templateGroupMap
        .get(code)!
        .add(TEMPLATE_GROUPS.PROCUREMENT);
    }
  });

  return templateGroupMap;
};

/**
 * Fetch material procurement usage
 */
export const fetchMaterialProcurementUsage = async (
  materialCodes: string[],
  organizationId: UUID
): Promise<Map<string, boolean>> => {
  const usageMap = new Map<string, boolean>();

  if (!materialCodes.length) {
    return usageMap;
  }

  const sdk = await getGraphQlServerSDK();

  const result =
    await sdk.getDistinctUOMsMaterialProcurementByMaterialCodes({
      organizationId,

      mpOr: materialCodes.map((code) => ({
        Material_Code: {
          _ilike: `%${code}%`,
        },
      })),

      tuOr: [],
      cgOr: [],
      mmOr: [],
    });

  result?.GHGMaterialProcurement?.forEach((item) => {
    if (!item?.Material_Code) return;

    const code = item.Material_Code.toLowerCase().trim();

    usageMap.set(code, true);
  });

  return usageMap;
};

/**
 * Batch validation
 */
export const validateCrossTemplateForBatch = async (
  materialCodes: string[],
  incomingTemplateCode: string,
  organizationId: UUID
): Promise<Map<string, ICrossTemplateValidationResult>> => {
  const results = new Map<
    string,
    ICrossTemplateValidationResult
  >();

  const incomingGroup = getTemplateGroup(
    incomingTemplateCode
  );

  if (!incomingGroup) {
    return results;
  }

  const templateGroupMap =
    await fetchExistingTemplateGroups(
      materialCodes,
      organizationId
    );

  /**
   * Also include Material Procurement checks
   */
  if (incomingGroup === TEMPLATE_GROUPS.CAPITAL_GOODS) {
    const procurementUsage =
      await fetchMaterialProcurementUsage(
        materialCodes,
        organizationId
      );

    procurementUsage.forEach((hasData, code) => {
      if (!hasData) return;

      if (!templateGroupMap.has(code)) {
        templateGroupMap.set(code, new Set());
      }

      templateGroupMap
        .get(code)!
        .add(TEMPLATE_GROUPS.PROCUREMENT);
    });
  }

  /**
   * Validate all codes
   */
  for (const rawCode of materialCodes) {
    const normalizedCode =
      rawCode.toLowerCase().trim();

    const existingGroups =
      templateGroupMap.get(normalizedCode) ??
      new Set<TemplateGroup>();

    const result = validateCrossTemplate(
      rawCode,
      incomingTemplateCode,
      existingGroups
    );

    if (result.status === "error") {
      results.set(normalizedCode, result);
    }
  }

  return results;
};

/**
 * Capital Goods upload validation
 */
export async function checkConflictsForCapitalGoods(
  materialCodes: string[],
  organizationId: UUID
): Promise<Map<string, ICrossTemplateConflict>> {
  const conflicts =
    new Map<string, ICrossTemplateConflict>();

  const validationResults =
    await validateCrossTemplateForBatch(
      materialCodes,
      "capital_goods",
      organizationId
    );

  validationResults.forEach((result, code) => {
    conflicts.set(code, {
      materialCode: code,
      conflictingTemplate:
        "Upstream / Material Procurement",
    });
  });

  return conflicts;
}

/**
 * Procurement upload validation
 */
export async function checkConflictsForUpstreamOrMaterialProcurement(
  materialCodes: string[],
  organizationId: UUID
): Promise<Map<string, ICrossTemplateConflict>> {
  const conflicts =
    new Map<string, ICrossTemplateConflict>();

  const validationResults =
    await validateCrossTemplateForBatch(
      materialCodes,
      "upstream",
      organizationId
    );

  validationResults.forEach((result, code) => {
    conflicts.set(code, {
      materialCode: code,
      conflictingTemplate: "Capital Goods",
    });
  });

  return conflicts;
}
