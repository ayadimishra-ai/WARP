import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgCapital_Goods_Updates,
  UpdateCapitalGoodsByIdsMutation,
} from "@/modules/ghg/graphql/shared/types";
import {
  ActivityMasterKey,
  CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
  MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
} from "@/modules/ghg/shared/constants/input.constant";
import { sanitize_compare_str_v4 } from "@/modules/ghg/utils/comapre.util";
import { ConvertUOMGeneralised } from "../data-conversion/uom-conversion.service";
import { getDefaultData } from "../excel/excel.service";
import { materialWeightUomConversion } from "../material-conversion/material-conversion.service";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import { initEmissionCalculation } from "./emission-factor.service";

export const saveEmissionCapitalGoods = async (
  organizationId: string,
  taskRequestIds: string[],
  organizationAddressId: UUID
) => {
  try {
    const sdk = await getGraphQlServerSDK();

    const uomConversion = await ConvertUOMGeneralised(organizationId);

    const activityMasterData = await sdk.getActivityMasterDataByKey({
      master_key: [
        ...ActivityMasterKey.capital_goods,
        ...ActivityMasterKey.material_master,
      ],
    });

    const whereObject = {
      _and: [
        { task_request_id: { _in: taskRequestIds } },
        { organization_address_id: { _eq: organizationAddressId } },
      ],
    };

    // Step 1: Get Capital Goods Records based on taskRequestIds and organizationAddressId
    const capitalGoodsData = await sdk.getCapitalGoodsByTaskRequestIds({
      where: whereObject,
    });

    const emissionFactorInit = await initEmissionCalculation(
      organizationId,
      String(
        capitalGoodsData?.GHGCapital_Goods?.[0]?.OrganizationAddress?.Address
          ?.country_id
      ),
      [ParentActivitiesType.CapitalGoods]
    );

    // Step 1.1: Extract, normalize, and deduplicate material codes
    const materialCodes = [
      ...new Set(
        (capitalGoodsData?.GHGCapital_Goods || [])
          .map((capitalGood) => capitalGood.Material_Code)
          .filter(
            (code) =>
              code !== null && code !== undefined && String(code).trim() !== ""
          )
          .map((code) => String(code).trim().toLowerCase())
      ),
    ];

    // Step 2: Fetch material master data for weight lookup
    const whereCondition = {
      _and: [
        {
          _or: materialCodes?.map((code) => ({
            code: { _ilike: code },
          })),
        },
        {
          organization_id: { _eq: organizationId },
        },
        {
          is_deleted: { _eq: false },
        },
      ],
    };

    const { OrgMaterialMaster: orgMaterialMaster } =
      await sdk.getOrgMaterialMasterByCodesInsensitive({
        where: whereCondition,
      });

    // Graphql object to update total weight for each capital good record after conversion
    const whereObjects: GhgCapital_Goods_Updates[] = [];

    // defaultUoM is Kilogram for mass group in capital goods quantity procured uom
    const defaultUoM = getDefaultData({
      masterKey: CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
      activityMasterData: activityMasterData?.ActivityMaster || [],
      valueForDefaultValue: "mass",
    });

    capitalGoodsData?.GHGCapital_Goods?.forEach((capitalGood) => {
      // Here you can implement the logic to calculate total weight for each capital good
      const {
        id,
        TaskRequest,
        organization_address_id,
        Material_Code,
        Quantity_Procured,
        Quantity_Procured_uom = "",
      } = capitalGood || {};
      const { month, year } = TaskRequest || {};

      // Implement common conversion logic to convert procured quantity to weight in KG using material master data
      const kpi_material_weight_kg = materialWeightUomConversion({
        materialCode: String(Material_Code),
        activityMasterData: activityMasterData?.ActivityMaster || [],
        quantityProcured: Number(Quantity_Procured) || 0,
        quantityProcuredUom: String(Quantity_Procured_uom),
        uomConversion: uomConversion,
        orgMaterialMaster: orgMaterialMaster,
        materialMasterWeightUomKey: MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY,
        activityUomMasterKey: CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY,
      });

      const materialMaster = orgMaterialMaster?.find((mItem) =>
        sanitize_compare_str_v4(String(mItem?.code), String(Material_Code))
      );

      let filters = [
        {
          field: "category",
          value: "material",
          additionalfilter: "",
        },
        {
          field: "activity",
          value: materialMaster?.type,
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: materialMaster?.name,
          additionalfilter: "Activity Specific",
        },
        {
          field: "yearMonth",
          value: {
            year: year,
            month: month,
          },
          additionalfilter: "",
        },
      ];

      // emissionValue is in KGCO2e and emissionFactorValue is in KGCO2e per unit of weight (KG)
      const { emissionValue, emissionFactorValue } = emissionFactorInit(
        "capital_goods",
        filters,
        kpi_material_weight_kg,
        defaultUoM,
        undefined,
        defaultUoM
      );

      const kpi_em_EmissionBy_CapitalGoods = emissionValue
        ? emissionValue / 1000
        : 0; // converting KG to tonne

      whereObjects.push({
        where: {
          id: { _eq: id },
          organization_address_id: { _eq: organization_address_id },
        },
        _set: {
          kpi_material_weight_kg: kpi_material_weight_kg,
          kpi_em_EmissionBy_CapitalGoods: kpi_em_EmissionBy_CapitalGoods,
          kpi_emf_EmissionBy_CapitalGoods: emissionFactorValue,
          updated_at: new Date().toISOString(),
        },
      });
    });

    // Process updates in batches
    const batchResponses: UpdateCapitalGoodsByIdsMutation[] = [];
    if (whereObjects.length > 0) {
      const processBatch = async (
        batch: GhgCapital_Goods_Updates[]
      ): Promise<UpdateCapitalGoodsByIdsMutation> => {
        const response = await sdk.updateCapitalGoodsByIds({
          updates: batch,
        });
        return response;
      };

      const batchSize = 2000;
      for (let i = 0; i < whereObjects.length; i += batchSize) {
        const batch = whereObjects.slice(i, i + batchSize);
        const batchResponse = await processBatch(batch);
        batchResponses.push(batchResponse);
      }
    }
    return batchResponses;
  } catch (error) {
    console.log("error", error);
    return error;
  }
};
