import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgEnergy_CaptivePower_NonRenewable_Updates,
  GhgEnergy_CaptivePower_Renewable_Updates,
  GhgEnergyConsumption_GridPower_Updates,
  GhgEnergy_CaptivePower_Renewable_Fuel_Updates,
  GetPowerConsumptionDataQuery
} from "@/modules/ghg/graphql/shared/types";
import { emissionFactorUnits } from "@/modules/ghg/shared/constants/input.constant";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import { initEmissionCalculation } from "./emission-factor.service";

//base Method
export const calculatePowerConsumptionGrid = async (
  organizationId: string,
  taskRequestId: string[]
) => {
  try {
    const sdk = await getGraphQlServerSDK();

    const powerConsumptionData: any = await sdk.getPowerConsumptionData({
      task_request_id: taskRequestId,
    });

    const emissionfactorinit = await initEmissionCalculation(
      organizationId,
      String(
        powerConsumptionData.GHGEnergyConsumption_GridPower[0]
          ?.OrganizationAddress?.Address?.country_id
      ),
      [ParentActivitiesType.Energy]
    );

    const updatedGridPowerData: any = await calculateEmissionsByGridPower(
      powerConsumptionData.GHGEnergyConsumption_GridPower,
      emissionfactorinit
    );
    const renewableCaptivePowerData: any =
      await calculateEmissionsByRenewableCaptivePower(
        powerConsumptionData.GHGEnergy_CaptivePower,
        emissionfactorinit
      );
    const nonRenewableCaptivePowerData: any =
      await calculateEmissionsByNonRenewableCaptivePower(
        powerConsumptionData.GHGEnergy_CaptivePower,
        emissionfactorinit
      );

    const renewableCaptivePowerFuelData: any =
      await calculateEmissionsByRenewableFuelCaptivePower(
        powerConsumptionData.GHGEnergy_CaptivePower,
        emissionfactorinit
      );

    const response = await updateDbWithCalculations(
      updatedGridPowerData,
      renewableCaptivePowerData,
      nonRenewableCaptivePowerData,
      renewableCaptivePowerFuelData,
      organizationId
    );
    return response;
    //await insertAuditLog(response, userSession);
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

//base Method
export const calculatePowerConsumptionCaptive = async (
  organizationId: string,
  taskRequestId: string[]
) => {
  try {
    const sdk = await getGraphQlServerSDK();

    const powerConsumptionData: any = await sdk.getPowerConsumptionData({
      task_request_id: taskRequestId,
    });

    const emissionfactorinit = await initEmissionCalculation(
      organizationId,
      String(
        powerConsumptionData.GHGEnergy_CaptivePower[0]?.OrganizationAddress
          ?.Address?.country_id
      ),
      [ParentActivitiesType.Energy]
    );

    const updatedGridPowerData: any = await calculateEmissionsByGridPower(
      powerConsumptionData.GHGEnergyConsumption_GridPower,
      emissionfactorinit
    );
    const renewableCaptivePowerData: any =
      await calculateEmissionsByRenewableCaptivePower(
        powerConsumptionData.GHGEnergy_CaptivePower,
        emissionfactorinit
      );
    const nonRenewableCaptivePowerData: any =
      await calculateEmissionsByNonRenewableCaptivePower(
        powerConsumptionData.GHGEnergy_CaptivePower,
        emissionfactorinit
      );

       const renewableCaptivePowerFuelData: any =
      await calculateEmissionsByRenewableFuelCaptivePower(
        powerConsumptionData.GHGEnergy_CaptivePower,
        emissionfactorinit
      );

    const response = await updateDbWithCalculations(
      updatedGridPowerData,
      renewableCaptivePowerData,
      nonRenewableCaptivePowerData,
      renewableCaptivePowerFuelData,
      organizationId
    );
    return response;
    //await insertAuditLog(response, userSession);
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

export const calculateEmissionsByGridPower = async (
  gridPowerData: any,
  emissionfactorinit: any
) => {
  try {
    let data = [];
    for (let index = 0; index < gridPowerData?.length; index++) {
      let PPARenewableFilters = [
        { field: "category", value: "Energy", additionalfilter: "" },
        { field: "activity", value: "PPA", additionalfilter: "" },
        { field: "sub_activity", value: "Renewable", additionalfilter: "" },
        {
          field: "yearMonth",
          value: {
            year: gridPowerData[index]?.TaskRequest?.year,
            month: gridPowerData[index]?.TaskRequest?.month,
          },
          additionalfilter: "",
        },
        // {
        //   field: "metadata",
        //   value: "yes",
        //   additionalfilter: "Default",
        // },
      ];

      const PPARenewableEmission = emissionfactorinit(
        "power_purchased_through_ppa_renewable",
        PPARenewableFilters,
        gridPowerData[index].PowerPurchased_through_PPA_Kwh_Renewable,
        "",
        ""
      );

      let RECFilters = [
        { field: "category", value: "Energy", additionalfilter: "" },
        { field: "activity", value: "REC", additionalfilter: "" },
        { field: "sub_activity", value: "Renewable", additionalfilter: "" },
        {
          field: "yearMonth",
          value: {
            year: gridPowerData[index]?.TaskRequest?.year,
            month: gridPowerData[index]?.TaskRequest?.month,
          },
          additionalfilter: "",
        },
        // {
        //   field: "metadata",
        //   value: "yes",
        //   additionalfilter: "Default",
        // },
      ];

      const RECEmission = emissionfactorinit(
        "power_purchased_through_rec_renewable",
        RECFilters,
        gridPowerData[index].PowerPurchased_through_REC_Kwh,
        "",
        ""
      );
      const kpi_em_Emission_PowerPurchased_RenewableSources =
        await emissionsByPowerPurchasedFromRenewableSources(
          PPARenewableEmission.emissionValue,
          RECEmission.emissionValue
        );

      let GridFilters = [
        { field: "category", value: "Energy", additionalfilter: "" },
        { field: "activity", value: "Grid", additionalfilter: "" },
        { field: "sub_activity", value: "Non Renewable", additionalfilter: "" },
        {
          field: "yearMonth",
          value: {
            year: gridPowerData[index]?.TaskRequest?.year,
            month: gridPowerData[index]?.TaskRequest?.month,
          },
          additionalfilter: "",
        },
        // {
        //   field: "metadata",
        //   value: "yes",
        //   additionalfilter: "Default",
        // },
      ];

      const GridEmission = emissionfactorinit(
        "power_purchased_through_grid_non_renewable",
        GridFilters,
        gridPowerData[index].PowerConsumed_through_Grid_Kwh,
        "",
        ""
      );

      const kpi_em_Emission_PowerPurchased_NonRenewableSources =
        await emissionsByPowerPurchasedFromNonRenewableSources(
          gridPowerData[index].PowerPurchased_through_PPA_Kwh_Renewable,
          gridPowerData[index].PowerPurchased_through_REC_Kwh,
          gridPowerData[index].PowerConsumed_through_Grid_Kwh,
          GridEmission.emissionFactorValue
        );

      const kpi_em_Emission_TotalPowerPurchased =
        await emissionsByTotalPowerPurchased(
          kpi_em_Emission_PowerPurchased_RenewableSources,
          kpi_em_Emission_PowerPurchased_NonRenewableSources
        );

      let PPANonRenewableFilters = [
        { field: "category", value: "Energy", additionalfilter: "" },
        { field: "activity", value: "PPA", additionalfilter: "" },
        { field: "sub_activity", value: "Non Renewable", additionalfilter: "" },
        {
          field: "yearMonth",
          value: {
            year: gridPowerData[index]?.TaskRequest?.year,
            month: gridPowerData[index]?.TaskRequest?.month,
          },
          additionalfilter: "",
        },
        // {
        //   field: "metadata",
        //   value: "yes",
        //   additionalfilter: "Default",
        // },
      ];

      const PPANonRenewableEmission = emissionfactorinit(
        "power_purchased_through_ppa_non_renewable",
        PPANonRenewableFilters,
        gridPowerData[index].PowerPurchased_through_PPA_Kwh_NonRenewable,
        "",
        ""
      );

      const category3GridPowerEmission =
        calculateScope3Category3GridPowerEmission(
          gridPowerData[index],
          emissionfactorinit as unknown as EmissionFactorInitFn
        );

      data.push({
        where: { id: { _eq: gridPowerData[index].id } },
        _set: {
          kpi_em_Emission_PowerPurchased_PPA_Renewable:
            PPARenewableEmission.emissionValue,
          kpi_emf_Emission_PowerPurchased_PPA_Renewable:
            PPARenewableEmission.emissionFactorValue,

          kpi_em_Emission_PowerPurchased_REC: RECEmission.emissionValue,
          kpi_emf_Emission_PowerPurchased_REC: RECEmission.emissionFactorValue,

          kpi_em_Emission_TotalPowerPurchased:
            kpi_em_Emission_TotalPowerPurchased,

          kpi_em_Emission_PowerPurchased_RenewableSources:
            kpi_em_Emission_PowerPurchased_RenewableSources,

          kpi_emf_Emission_PowerPurchased_RenewableSources: 0,

          kpi_em_Emission_PowerPurchased_NonRenewableSources:
            kpi_em_Emission_PowerPurchased_NonRenewableSources,

          kpi_emf_Emission_PowerPurchased_NonRenewableSources:
            GridEmission.emissionFactorValue,

          kpi_em_Emission_PowerPurchased_PPA_NonRenewable:
            PPANonRenewableEmission.emissionValue,

          kpi_emf_Emission_PowerPurchased_PPA_NonRenewable:
            PPANonRenewableEmission.emissionFactorValue,

          kpi_em_Scope3_Category3: category3GridPowerEmission.emissionValue,
          kpi_emf_Scope3_Category3:
            category3GridPowerEmission.emissionFactorValue,
        },
      });
    }

    return data;
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

/**
 * Shape returned by the emissionfactorinit closure from initEmissionCalculation().
 */
type EmissionResult = {
  emissionValue: number | null;
  emissionFactorValue: number | null;
  emissionFactorBasicValue: number | null;
};

type EmissionFactorInitFn = (
  key: string,
  filters: Record<string, any>[],
  value: number,
  valueUom: string,
  fuelType: string
) => EmissionResult;

/**
 * Calculates Scope 3 Category 3 (upstream T&D losses) for a single grid power row.
 * Uses the EF keyed on Energy > Grid > Scope 3 > Category 3 and the
 * PowerPurchased_through_PPA_Kwh_NonRenewable value from the row.
 *
 * @returns { emissionValue, emissionFactorValue }
 */
export const calculateScope3Category3GridPowerEmission = (
  gridPowerRow: Record<string, any>,
  emissionFactorInit: EmissionFactorInitFn
): Pick<EmissionResult, "emissionValue" | "emissionFactorValue"> => {
  const category3Filters: Record<string, any>[] = [
    { field: "category", value: "Energy", additionalfilter: "" },
    { field: "activity", value: "Grid", additionalfilter: "" },
    {
      field: "sub_activity",
      value: "Scope 3 Cat.3 (T&D loss)",
      additionalfilter: "",
    },
    {
      field: "yearMonth",
      value: {
        year: gridPowerRow?.TaskRequest?.year,
        month: gridPowerRow?.TaskRequest?.month,
      },
      additionalfilter: "",
    },
  ];

  const result: EmissionResult = emissionFactorInit(
    "power_purchased_through_ppa_non_renewable",
    category3Filters,
    gridPowerRow.PowerPurchased_through_PPA_Kwh_NonRenewable,
    "",
    ""
  );

  return {
    emissionValue: result.emissionValue,
    emissionFactorValue: result.emissionFactorValue,
  };
};

export const emissionsByPowerPurchasedFromRenewableSources = async (
  calculateEmissionFromPowerPurchasedThroughPPARenewable: any,
  calculateEmissionFromPowerPurchasedThroughREC: any
) => {
  try {
    return (
      calculateEmissionFromPowerPurchasedThroughPPARenewable +
      calculateEmissionFromPowerPurchasedThroughREC
    );
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

export const emissionsByPowerPurchasedFromNonRenewableSources = async (
  powerPurchasedThroughPPARenewable: any,
  powerPurchasedThroughREC: any,
  PowerConsumedThroughGridKwh: any,
  powerPurchasedThroughGridThermalEmissionFactor: any
) => {
  try {
    const renewablePowerPurchased =
      powerPurchasedThroughPPARenewable + powerPurchasedThroughREC;
    const powerPurchasedFromNonRenewableSources =
      PowerConsumedThroughGridKwh - renewablePowerPurchased;
    return (
      powerPurchasedFromNonRenewableSources *
      powerPurchasedThroughGridThermalEmissionFactor
    );
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

export const emissionsByTotalPowerPurchased = async (
  emissionPowerPurchasedRenewableSources: any,
  emissionPowerPurchasedNonRenewableSources: any
) => {
  try {
    return (
      emissionPowerPurchasedRenewableSources +
      emissionPowerPurchasedNonRenewableSources
    );
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

export const emissionFromPowerPurchasedThroughPPANonRenewable = async (
  PowerPurchasedThroughPPAKwhNonRenewable: any,
  powerPurchasedThroughPPANonRenewableEmissionFactor: any
) => {
  try {
    return (
      PowerPurchasedThroughPPAKwhNonRenewable *
      powerPurchasedThroughPPANonRenewableEmissionFactor
    );
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

export const calculateEmissionsByRenewableCaptivePower = async (
  renewablesData: any,
  emissionfactorinit: any
) => {
  try {
    let data: any = [];
    for (
      let outerIndex = 0;
      outerIndex < renewablesData?.length;
      outerIndex++
    ) {
      for (
        let index = 0;
        index <
        renewablesData[outerIndex].GHGEnergy_CaptivePower_Renewables?.length;
        index++
      ) {
        let filters = [
          { field: "category", value: "energy", additionalfilter: "" },
          { field: "activity", value: "Captive", additionalfilter: "" },
          { field: "sub_activity", value: "Renewable", additionalfilter: "" },
          {
            field: "metadata",
            value:
              renewablesData[outerIndex]?.GHGEnergy_CaptivePower_Renewables[
                index
              ]?.Type_of_Technology_Used,
            additionalfilter: "Activity Specific",
          },
          {
            field: "yearMonth",
            value: {
              year: renewablesData[outerIndex]?.TaskRequest?.year,
              month: renewablesData[outerIndex]?.TaskRequest?.month,
            },
            additionalfilter: "",
          },
          {
            field: "metadata",
            value: "yes",
            additionalfilter: "Default",
          },
        ];
        const Emission = emissionfactorinit(
          "power_purchased_through_captive_renewable",
          filters,
          renewablesData[outerIndex]?.GHGEnergy_CaptivePower_Renewables[index]
            ?.Unit_of_Energy_Generated_in_Kwh,
          "",
          ""
        );
        data.push({
          where: {
            id: {
              _eq: renewablesData[outerIndex]
                ?.GHGEnergy_CaptivePower_Renewables[index]?.id,
            },
          },
          _set: {
            kpi_em_Emission_EnergyGenerated_kwh: Emission.emissionValue,
            kpi_emf_Emission_EnergyGenerated_kwh: Emission.emissionFactorValue,
          },
        });
      }
    }

    return data;
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

export const calculateEmissionsByNonRenewableCaptivePower = async (
  nonRenewablesData: any,
  emissionfactorinit: any
) => {
  try {
    let data = [];
    for (
      let outerIndex = 0;
      outerIndex < nonRenewablesData?.length;
      outerIndex++
    ) {
      for (
        let index = 0;
        index <
        nonRenewablesData[outerIndex]?.GHGEnergy_CaptivePower_NonRenewables
          ?.length;
        index++
      ) {
        let filters = [
          { field: "category", value: "Energy", additionalfilter: "" },
          { field: "activity", value: "Captive", additionalfilter: "" },
          {
            field: "type",
            value:
              nonRenewablesData[outerIndex]
                ?.GHGEnergy_CaptivePower_NonRenewables[index]
                ?.Type_of_Fuel_Used,
            additionalfilter: "",
          },
          //   {
          //     field: "metadata",
          //     value: "yes",
          //     additionalfilter: "Default",
          //   },
          {
            field: "sub_activity",
            value: "Non Renewable",
            additionalfilter: "",
          },
          {
            field: "unitFilter",
            value: emissionFactorUnits.gj,
            additionalfilter: "",
          },
          {
            field: "yearMonth",
            value: {
              year: nonRenewablesData[outerIndex]?.TaskRequest?.year,
              month: nonRenewablesData[outerIndex]?.TaskRequest?.month,
            },
            additionalfilter: "",
          },
          {
            field: "metadata",
            value: "yes",
            additionalfilter: "Default",
          },
        ];
        const Emission = emissionfactorinit(
          // "power_purchased_through_captive_non_renewable",
          "power_purchased_through_captive_non_renewable_fuel",
          filters,
          nonRenewablesData[outerIndex]?.GHGEnergy_CaptivePower_NonRenewables[
            index
          ]?.Quantity_of_fuel_consumed,
          nonRenewablesData[outerIndex]?.GHGEnergy_CaptivePower_NonRenewables[
            index
          ]?.Quantity_of_fuel_consumed_uom ?? undefined,
          nonRenewablesData[outerIndex]?.GHGEnergy_CaptivePower_NonRenewables[
            index
          ]?.Type_of_Fuel_Used ?? undefined
        );
        data.push({
          where: {
            id: {
              _eq: nonRenewablesData[outerIndex]
                ?.GHGEnergy_CaptivePower_NonRenewables[index]?.id,
            },
          },
          _set: {
            kpi_em_Emission_EnergyGenerated_kwh:
              Emission.emissionValue *
              nonRenewablesData[outerIndex]
                ?.GHGEnergy_CaptivePower_NonRenewables[index]?.Quality_of_fuel,
            kpi_emf_Emission_EnergyGenerated_kwh: Emission.emissionFactorValue,
          },
        });
      }
    }
    return data;
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

export const calculateEmissionsByRenewableFuelCaptivePower = async (
  renewableFuelData: GetPowerConsumptionDataQuery["GHGEnergy_CaptivePower"],
  emissionfactorinit: Awaited<ReturnType<typeof initEmissionCalculation>>
): Promise<GhgEnergy_CaptivePower_Renewable_Fuel_Updates[]> => {
  try {
    let data: GhgEnergy_CaptivePower_Renewable_Fuel_Updates[] = [];
    for (
      let outerIndex = 0;
      outerIndex < renewableFuelData?.length;
      outerIndex++
    ) {
      for (
        let index = 0;
        index <
        renewableFuelData[outerIndex]?.GHGEnergy_CaptivePower_Renewable_Fuels
          ?.length;
        index++
      ) {
        let filters = [
          { field: "category", value: "Energy", additionalfilter: "" },
          { field: "activity", value: "Captive", additionalfilter: "" },
          {
            field: "type",
            value:
              renewableFuelData[outerIndex]
                ?.GHGEnergy_CaptivePower_Renewable_Fuels[index]
                ?.Type_of_Fuel_Used,
            additionalfilter: "",
          },
          {
            field: "sub_activity",
            value: "Renewable",
            additionalfilter: "",
          },
          {
            field: "unitFilter",
            value: emissionFactorUnits.gj,
            additionalfilter: "",
          },
          {
            field: "yearMonth",
            value: {
              year: renewableFuelData[outerIndex]?.TaskRequest?.year,
              month: renewableFuelData[outerIndex]?.TaskRequest?.month,
            },
            additionalfilter: "",
          },
          {
            field: "metadata",
            value: "yes",
            additionalfilter: "Default",
          },
        ];
        const Emission = emissionfactorinit(
          "power_purchased_through_captive_renewable_fuel",
          filters,
          renewableFuelData[outerIndex]?.GHGEnergy_CaptivePower_Renewable_Fuels[
            index
          ]?.Quantity_of_fuel_consumed,
          renewableFuelData[outerIndex]?.GHGEnergy_CaptivePower_Renewable_Fuels[
            index
          ]?.Quantity_of_fuel_consumed_uom ?? undefined,
          renewableFuelData[outerIndex]?.GHGEnergy_CaptivePower_Renewable_Fuels[
            index
          ]?.Type_of_Fuel_Used ?? undefined
        );
        data.push({
          where: {
            id: {
              _eq: renewableFuelData[outerIndex]
                ?.GHGEnergy_CaptivePower_Renewable_Fuels[index]?.id,
            },
          },
          _set: {
            kpi_em_Emission_EnergyGenerated_kwh:
              (Emission.emissionValue ?? 0) *
              (renewableFuelData[outerIndex]
                ?.GHGEnergy_CaptivePower_Renewable_Fuels[index]
                ?.Quality_of_fuel ?? 0),
            kpi_emf_Emission_EnergyGenerated_kwh: Emission.emissionFactorValue,
          },
        });
      }
    }
    return data;
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
    return [];
  }
};

export const updateDbWithCalculations = async (
  gridPowerData: GhgEnergyConsumption_GridPower_Updates,
  captivePowerRenewableData: GhgEnergy_CaptivePower_Renewable_Updates,
  captivePowerNonRenewableData: GhgEnergy_CaptivePower_NonRenewable_Updates,
  captivePowerRenewableFuelData: GhgEnergy_CaptivePower_Renewable_Fuel_Updates[],
  organizationId: string
) => {
  try {
    const sdk = await getGraphQlServerSDK();
    const updatedEmissionPowerConsumptionData =
      await sdk.updateEmissionPowerConsumptionData({
        GHGEnergyConsumption_GridPower: gridPowerData,
        GHGEnergy_CaptivePower_Renewable: captivePowerRenewableData,
        GHGEnergy_CaptivePower_NonRenewable: captivePowerNonRenewableData,
        GHGEnergy_CaptivePower_Renewable_Fuel: captivePowerRenewableFuelData,
      });

    return updatedEmissionPowerConsumptionData;
  } catch (error) {
    console.log("Emission power consumption calculation exception: " + error);
  }
};

// export const insertAuditLog = async (
//   response: any,
//   organizationId:string
// ) => {
//   try {
//     response?.updateGHGEnergyConsumptionGridPowerMany?.forEach(
//       async (item: any) => {
//         await saveGHGEnergyConsumptionGridPower(
//           item?.returning,
//           organizationId,
//           []
//         );
//       }
//     );
//     response?.updateGHGEnergyCaptivePowerRenewableMany?.forEach(
//       async (item: any) => {
//         await saveGHGEnergyCaptivePowerRenewable(
//           item?.returning,
//           organizationId,
//           []
//         );
//       }
//     );
//     response?.updateGHGEnergyCaptivePowerNonRenewableMany?.forEach(
//       async (item: any) => {
//         await saveGHGEnergyCaptivePowerNonRenewable(response, organizationId, []);
//       }
//     );
//   } catch (error) {
//     console.log("Emission power consumption calculation exception: " + error);
//   }
//};
