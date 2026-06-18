import { getGraphQlServerSDK } from "~/graphql/server";
import {
  GhgFireExtinguisher_Updates,
  GhgIndustrialGas_Updates,
  GhgRefrigerantAndAcSystems_Updates,
} from "~/graphql/shared/types";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import { initEmissionCalculation } from "./emission-factor.service";
export const calculateFugitiveEmission = async (
  taskRequestIds: string[],
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const fugitiveDetailsData = await sdk.getFugitiveDataByTaskRequestIds({
      taskRequestId: taskRequestIds,
    });
    const countryId =
      !!fugitiveDetailsData?.GHGRefrigerantAndACSystems &&
      fugitiveDetailsData?.GHGRefrigerantAndACSystems.length > 0
        ? fugitiveDetailsData?.GHGRefrigerantAndACSystems[0]
            ?.OrganizationAddress?.Address?.country_id
        : !!fugitiveDetailsData?.GHGIndustrialGas &&
            fugitiveDetailsData?.GHGIndustrialGas.length > 0
          ? fugitiveDetailsData?.GHGIndustrialGas[0]?.OrganizationAddress
              ?.Address?.country_id
          : !!fugitiveDetailsData?.GHGFireExtinguisher &&
              fugitiveDetailsData?.GHGFireExtinguisher.length > 0
            ? fugitiveDetailsData?.GHGFireExtinguisher[0]?.OrganizationAddress
                ?.Address?.country_id
            : "";
    const emissionCalculator = await initEmissionCalculation(
      organizationId,
      String(countryId),
      [ParentActivitiesType.Fugitive]
    );
    const GHGFireExtinguisherUpdates: GhgFireExtinguisher_Updates[] = [];
    const GHGIndustrialGasUpdates: GhgIndustrialGas_Updates[] = [];
    const GHGRefridgeAndACUpdates: GhgRefrigerantAndAcSystems_Updates[] = [];
    //#region GHGRefrigerantAndACSystems row Level Emission Calculation
    for (
      let i = 0;
      i < fugitiveDetailsData?.GHGRefrigerantAndACSystems.length;
      i++
    ) {
      const filters = [
        {
          field: "category",
          value: ParentActivitiesType.Fugitive,
          additionalfilter: "",
        },
        { field: "activity", value: "GWP 100", additionalfilter: "" },
        {
          field: "type",
          value:
            fugitiveDetailsData?.GHGRefrigerantAndACSystems[i]
              .type_of_refrigerant_used,
          additionalfilter: "",
        },
        {
          field: "yearMonth",
          value: {
            year: fugitiveDetailsData?.GHGRefrigerantAndACSystems[i].TaskRequest
              ?.year,
            month:
              fugitiveDetailsData?.GHGRefrigerantAndACSystems[i].TaskRequest
                ?.month,
          },
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: "yes",
          additionalfilter: "Default",
        },
      ];

      const emission = emissionCalculator(
        "fugitive_refrigerant_and_ac_systems",
        filters,
        fugitiveDetailsData?.GHGRefrigerantAndACSystems[i]
          .quantity_of_refrigerant_filled,
        String(
          fugitiveDetailsData?.GHGRefrigerantAndACSystems[i]
            .uom_refrigerant_and_ac_systems
        ),
        ""
      );
      GHGRefridgeAndACUpdates.push({
        where: {
          id: { _eq: fugitiveDetailsData?.GHGRefrigerantAndACSystems[i].id },
        },
        _set: {
          kpi_em_refrigerant: emission?.emissionValue,
          kpi_emf_refrigerant: emission.emissionFactorValue,
        },
      });
    }
    //#endregion

    //#region GHGIndustrialGas row Level Emission Calculation
    for (let j = 0; j < fugitiveDetailsData?.GHGIndustrialGas.length; j++) {
      const filters = [
        {
          field: "category",
          value: ParentActivitiesType.Fugitive,
          additionalfilter: "",
        },
        { field: "activity", value: "GWP 100", additionalfilter: "" },
        {
          field: "type",
          value:
            fugitiveDetailsData?.GHGIndustrialGas[j]
              .type_of_industrial_gas_used,
          additionalfilter: "",
        },
        {
          field: "yearMonth",
          value: {
            year: fugitiveDetailsData?.GHGIndustrialGas[j].TaskRequest?.year,
            month: fugitiveDetailsData?.GHGIndustrialGas[j].TaskRequest?.month,
          },
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: "yes",
          additionalfilter: "Default",
        },
      ];

      const emission = emissionCalculator(
        "fugitive_industrial_gas",
        filters,
        fugitiveDetailsData?.GHGIndustrialGas[j]
          .quantity_of_industrial_gas_filled,
        String(fugitiveDetailsData?.GHGIndustrialGas[j].uom_industrial_gas),
        ""
      );
      GHGIndustrialGasUpdates.push({
        where: {
          id: { _eq: fugitiveDetailsData?.GHGIndustrialGas[j].id },
        },
        _set: {
          kpi_em_industrial_gas: emission?.emissionValue,
          kpi_emf_industrial_gas: emission.emissionFactorValue,
        },
      });
    }
    //#endregion

    //#region GHGFireExtinguisher row Level Emission Calculation
    for (let k = 0; k < fugitiveDetailsData?.GHGFireExtinguisher.length; k++) {
      const filters = [
        {
          field: "category",
          value: ParentActivitiesType.Fugitive,
          additionalfilter: "",
        },
        { field: "activity", value: "GWP 100", additionalfilter: "" },
        {
          field: "type",
          value:
            fugitiveDetailsData?.GHGFireExtinguisher[k]
              .gas_used_in_fire_extinguisher,
          additionalfilter: "",
        },
        {
          field: "yearMonth",
          value: {
            year: fugitiveDetailsData?.GHGFireExtinguisher[k].TaskRequest?.year,
            month:
              fugitiveDetailsData?.GHGFireExtinguisher[k].TaskRequest?.month,
          },
          additionalfilter: "",
        },
        {
          field: "metadata",
          value: "yes",
          additionalfilter: "Default",
        },
      ];

      const emission = emissionCalculator(
        "fugitive_fire_extinguisher",
        filters,
        fugitiveDetailsData?.GHGFireExtinguisher[k].quantity_of_gas_filled,
        String(
          fugitiveDetailsData?.GHGFireExtinguisher[k].uom_fire_extinguisher
        ),
        ""
      );
      GHGFireExtinguisherUpdates.push({
        where: {
          id: { _eq: fugitiveDetailsData?.GHGFireExtinguisher[k].id },
        },
        _set: {
          kpi_em_fire_extinguisher: emission?.emissionValue,
          kpi_emf_fire_extinguisher: emission.emissionFactorValue,
        },
      });
    }
    //#endregion

    //#region Execute Update Mutations
    const processBatch = async (
      batch: any[],
      batchName: string
    ): Promise<any> => {
      switch (batchName) {
        case "GHGRefrigerantAndACSystems":
          return await sdk.updateFugitiveRefridgeAndACSystemsData({
            GHGRefrigerantAndACSystemsUpdation: batch,
          });
        case "GHGIndustrialGas":
          return await sdk.updateFugitiveIndustrialGasData({
            GHGIndustrialGasUpdation: batch,
          });
        case "GHGFireExtinguisher":
          return await sdk.updateFugitiveFireExtinguisherData({
            GhgGHGFireExtinguisherUpdation: batch,
          });
      }
    };
    const batchSize = 2000;
    for (let i = 0; i < GHGRefridgeAndACUpdates.length; i += batchSize) {
      const batch = GHGRefridgeAndACUpdates.slice(i, i + batchSize);
      await processBatch(batch, "GHGRefrigerantAndACSystems");
    }
    for (let i = 0; i < GHGIndustrialGasUpdates.length; i += batchSize) {
      const batch = GHGIndustrialGasUpdates.slice(i, i + batchSize);
      await processBatch(batch, "GHGIndustrialGas");
    }
    for (let i = 0; i < GHGFireExtinguisherUpdates.length; i += batchSize) {
      const batch = GHGFireExtinguisherUpdates.slice(i, i + batchSize);
      await processBatch(batch, "GHGFireExtinguisher");
    }
    //#endregion
  } catch (error) {
    console.error("Error saving KPI Fugitive Gases Emission:", error);
    throw error;
  }
};
