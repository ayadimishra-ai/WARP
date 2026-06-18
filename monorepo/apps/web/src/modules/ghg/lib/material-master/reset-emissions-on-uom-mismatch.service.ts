import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
    GhgCapital_Goods_Updates,
    GhgMaterialProcurement_Updates,
    GhgTransport_Upstream_Updates,
} from "@/modules/ghg/graphql/shared/types";

export interface IEmissionResetSummary {
  totalRecordsAffected: number;
  capitalGoods: number;
  materialProcurement: number;
  transportUpstream: number;
  materialCodes: string[];
}

/**
 * Reset emissions to zero for activity data records affected by Material Master UoM mismatch
 * This is triggered when Material Master UoM is updated and differs from existing activity data UoM
 *
 * Business Rule (Scenario C):
 * - Material Master is source of truth, update is allowed
 * - All affected activity emission fields must be set to 0
 * - Emissions will be recalculated once activity data is corrected with new UoM
 *
 * @param materialCodes - Array of material codes with UoM mismatch
 * @param organizationId - Organization UUID
 * @returns Summary of affected records
 */
export async function resetEmissionsForUoMMismatch(
  materialCodes: string[],
  organizationId: UUID
): Promise<IEmissionResetSummary> {
  try {
    if (materialCodes.length === 0) {
      return {
        totalRecordsAffected: 0,
        capitalGoods: 0,
        materialProcurement: 0,
        transportUpstream: 0,
        materialCodes: [],
      };
    }

    const sdk = await getGraphQlServerSDK();

    // Get all organization addresses for scoping
    const orgAddressesResponse = await sdk.getOrganizationAddressIds({
      organization_id: organizationId,
    });

    const orgAddressIds =
      orgAddressesResponse?.OrganizationAddress?.map((addr) => addr.id) || [];

    if (orgAddressIds.length === 0) {
      console.log(
        "[resetEmissionsForUoMMismatch] No organization addresses found"
      );
      return {
        totalRecordsAffected: 0,
        capitalGoods: 0,
        materialProcurement: 0,
        transportUpstream: 0,
        materialCodes: [],
      };
    }

    // Fetch all affected activity records
    const activityResponse = await sdk.getActivityRecordsForEmissionReset({
      material_codes: materialCodes,
      org_address_ids: orgAddressIds,
    });

    // Build update mutations for Capital Goods
    const capitalGoodsUpdates: GhgCapital_Goods_Updates[] = [];
    activityResponse?.CapitalGoods?.forEach((record) => {
      if (record.id && record.organization_address_id) {
        capitalGoodsUpdates.push({
          where: {
            id: { _eq: record.id },
            organization_address_id: { _eq: record.organization_address_id },
          },
          _set: {
            kpi_em_EmissionBy_CapitalGoods: 0,
            kpi_emf_EmissionBy_CapitalGoods: 0,
            updated_at: new Date().toISOString(),
          },
        });
      }
    });

    // Build update mutations for Material Procurement
    const materialProcurementUpdates: GhgMaterialProcurement_Updates[] = [];
    activityResponse?.MaterialProcurement?.forEach((record) => {
      if (record.id && record.organization_address_id) {
        materialProcurementUpdates.push({
          where: {
            id: { _eq: record.id },
            organization_address_id: { _eq: record.organization_address_id },
          },
          _set: {
            kpi_em_EmissionBy_MaterialProcured: 0,
            kpi_emf_EmissionBy_MaterialProcured: 0,
            updated_at: new Date().toISOString(),
          },
        });
      }
    });

    // Build update mutations for Transport Upstream
    const transportUpstreamUpdates: GhgTransport_Upstream_Updates[] = [];
    activityResponse?.UpstreamTransport?.forEach((record) => {
      if (record.id && record.organization_address_id) {
        transportUpstreamUpdates.push({
          where: {
            id: { _eq: record.id },
            organization_address_id: { _eq: record.organization_address_id },
          },
          _set: {
            kpi_em_EmissionBy_MaterialProcured: 0,
            kpi_emf_EmissionBy_MaterialProcured: 0,
            updated_at: new Date().toISOString(),
          },
        });
      }
    });

    const totalRecordsAffected =
      capitalGoodsUpdates.length +
      materialProcurementUpdates.length +
      transportUpstreamUpdates.length;

    // Execute emission reset mutations
    if (totalRecordsAffected > 0) {
      // For empty arrays, provide a dummy update that matches nothing to avoid GraphQL errors
      const emptyCapitalGoodsUpdate: GhgCapital_Goods_Updates[] =
        capitalGoodsUpdates.length > 0
          ? capitalGoodsUpdates
          : [
              {
                where: { id: { _eq: "00000000-0000-0000-0000-000000000000" } },
                _set: { kpi_em_EmissionBy_CapitalGoods: 0 },
              },
            ];

      const emptyMaterialProcurementUpdate: GhgMaterialProcurement_Updates[] =
        materialProcurementUpdates.length > 0
          ? materialProcurementUpdates
          : [
              {
                where: { id: { _eq: "00000000-0000-0000-0000-000000000000" } },
                _set: { kpi_em_EmissionBy_MaterialProcured: 0 },
              },
            ];

      const emptyTransportUpstreamUpdate: GhgTransport_Upstream_Updates[] =
        transportUpstreamUpdates.length > 0
          ? transportUpstreamUpdates
          : [
              {
                where: { id: { _eq: "00000000-0000-0000-0000-000000000000" } },
                _set: { kpi_em_EmissionBy_MaterialProcured: 0 },
              },
            ];

      await sdk.resetEmissionsForUoMMismatch({
        capitalGoodsUpdates: emptyCapitalGoodsUpdate,
        materialProcurementUpdates: emptyMaterialProcurementUpdate,
        transportUpstreamUpdates: emptyTransportUpstreamUpdate,
      });
    } else {
      console.log(
        "[resetEmissionsForUoMMismatch] No activity records found to reset"
      );
    }

    return {
      totalRecordsAffected,
      capitalGoods: capitalGoodsUpdates.length,
      materialProcurement: materialProcurementUpdates.length,
      transportUpstream: transportUpstreamUpdates.length,
      materialCodes,
    };
  } catch (error) {
    console.error("[resetEmissionsForUoMMismatch] Error:", error);
    // Don't throw - we don't want to block material master update if emission reset fails
    // Log the error and return zero summary
    return {
      totalRecordsAffected: 0,
      capitalGoods: 0,
      materialProcurement: 0,
      transportUpstream: 0,
      materialCodes,
    };
  }
}
