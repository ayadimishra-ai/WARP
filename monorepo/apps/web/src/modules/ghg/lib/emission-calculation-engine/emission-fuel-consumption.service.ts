import { UUID } from "crypto";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  GhgEnergyConsumption_FuelPurchased_Auxiliary_Updates,
  GhgEnergyConsumption_FuelPurchased_General_Updates,
  GhgEnergyConsumption_FuelPurchased_HeatingWater_Updates,
  GhgEnergyConsumption_FuelPurchased_Transportation_Updates,
} from "@/modules/ghg/graphql/shared/types";
import { emissionFactorUnits } from "@/modules/ghg/shared/constants/input.constant";
import { sanitize_compare_str_v1 } from "@/modules/ghg/utils/comapre.util";
import { sanitizeString } from "@/modules/ghg/utils/sanitize.util";
import { getdefaultfuelquality } from "../excel/excel.service";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import { initEmissionCalculation } from "./emission-factor.service";

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
 * Calculates Scope 3 Category 3 (well-to-tank) for a single General fuel row.
 * Reuses the same EF that Scope 1 General Purpose uses — no new EF record needed.
 * Pure function: receives the already-fetched row + the emissionfactorinit closure.
 *
 * @returns { emissionValue, emissionFactorValue }
 */
export const calculateScope3Category3FuelPurchaseEmission = (
  generalRow: Record<string, any>,
  taskRequest: Record<string, any>,
  emissionFactorInit: EmissionFactorInitFn
): Pick<EmissionResult, "emissionValue" | "emissionFactorValue"> => {
  const fuelType = String(generalRow.Type_of_Fuel_Purchased ?? "");

  const category3Filters: Record<string, any>[] = [
    { field: "category", value: "Energy", additionalfilter: "" },
    { field: "activity", value: "General Purpose", additionalfilter: "" },
    {
      field: "sub_activity",
      value: "Scope 3 Cat.3 (Fuel)",
      additionalfilter: "",
    },
    { field: "type", value: fuelType, additionalfilter: "" },
    {
      field: "unitFilter",
      value: emissionFactorUnits.gj,
      additionalfilter: "",
    },
    {
      field: "yearMonth",
      value: {
        year: taskRequest?.year,
        month: taskRequest?.month,
      },
      additionalfilter: "",
    },
    {
      field: "metadata",
      value: "yes",
      additionalfilter: "Default",
    },
  ];

  const result: EmissionResult = emissionFactorInit(
    "fuel_purchased_consumption",
    category3Filters,
    generalRow.Quantity_of_fuel_Consumed,
    String(generalRow.Quantity_of_fuel_Consumed_uom ?? ""),
    fuelType
  );

  return {
    emissionValue: result.emissionValue,
    emissionFactorValue: result.emissionFactorValue,
  };
};

export const calculateEmissionConsumption = async (
  task_request_id: string[],
  organizationId: string
) => {
  const uniqueGeneralIds = new Set<number>();
  const uniqueHeatingWaterIds = new Set<number>();
  const uniqueAuxiliaryIds = new Set<number>();
  let generalUpdateData: GhgEnergyConsumption_FuelPurchased_General_Updates[] =
    [];
  let heatingWaterUpdateData: GhgEnergyConsumption_FuelPurchased_HeatingWater_Updates[] =
    [];
  let auxiliaryFuelUpdateData: GhgEnergyConsumption_FuelPurchased_Auxiliary_Updates[] =
    [];
  let transportationFuelUpdateData: GhgEnergyConsumption_FuelPurchased_Transportation_Updates[] =
    [];
  const sdk = await getGraphQlServerSDK();
  const ghgData = await sdk.getGHGEnergyConsumption_FuelPurchased({
    task_request_id: task_request_id,
  });
  const activityMasterData = await sdk.getActivityMasterDataByKey({
    master_key: ["Energy_FuelPurchased_Auxiliary_FuelType"],
  });
  let allfuels: string[] = [];
  activityMasterData?.ActivityMaster?.forEach((item) => {
    item?.master_data?.forEach((items: Record<string, string>) => {
      if (
        allfuels.filter((fuelitems) =>
          sanitize_compare_str_v1(items.label, fuelitems)
        ).length == 0
      ) {
        allfuels.push(sanitizeString.v1(items.label));
      }
    });
  });

  const fuelquality = await getdefaultfuelquality(
    allfuels,
    organizationId as UUID,
    ["Energy_FuelPurchased_Auxiliary_FuelType"]
  );
  const emissionfactorinit = await initEmissionCalculation(
    organizationId,
    String(
      ghgData.GHGEnergyConsumption_FuelPurchased[0]?.OrganizationAddress
        ?.Address?.country_id
    ),
    [ParentActivitiesType.Energy, ParentActivitiesType.Transport]
  );
  for (
    let fueldata = 0;
    fueldata < ghgData.GHGEnergyConsumption_FuelPurchased.length;
    fueldata++
  ) {
    //#region General start
    for (
      let generals = 0;
      generals <
      ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
        .GHGEnergyConsumption_FuelPurchased_Generals.length;
      generals++
    ) {
      const fuelType =
        ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
          .GHGEnergyConsumption_FuelPurchased_Generals[generals]
          .Type_of_Fuel_Purchased!;
      const id =
        ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
          .GHGEnergyConsumption_FuelPurchased_Generals[generals].id;

      if (!uniqueGeneralIds.has(id)) {
        uniqueGeneralIds.add(id);

        let pointOfConsumption = "Direct";
        if (
          sanitizeString.v1(fuelType) == "diesel" ||
          sanitizeString.v1(fuelType) == "kerosene"
        ) {
          pointOfConsumption =
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
              .GHGEnergyConsumption_FuelPurchased_Generals[generals]
              .Point_of_Consumption!;
        }
        const filters = [
          { field: "category", value: "Energy", additionalfilter: "" },
          { field: "activity", value: "General Purpose", additionalfilter: "" },
          { field: "type", value: fuelType, additionalfilter: "" },
          {
            field: "metadata",
            value: pointOfConsumption,
            additionalfilter: "Activity Specific",
          },
          {
            field: "unitFilter",
            value: emissionFactorUnits.gj,
            additionalfilter: "",
          },
          {
            field: "yearMonth",
            value: {
              year: ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
                .TaskRequest?.year,
              month:
                ghgData.GHGEnergyConsumption_FuelPurchased[fueldata].TaskRequest
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

        const Emission = emissionfactorinit(
          "fuel_purchased_consumption",
          filters,
          ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
            .GHGEnergyConsumption_FuelPurchased_Generals[generals]
            .Quantity_of_fuel_Consumed,
          String(
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
              .GHGEnergyConsumption_FuelPurchased_Generals[generals]
              .Quantity_of_fuel_Consumed_uom
          ),
          String(
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
              .GHGEnergyConsumption_FuelPurchased_Generals[generals]
              .Type_of_Fuel_Purchased
          )
        );

        let multiplyEmissionGeneral =
          Emission.emissionValue! *
          ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
            .GHGEnergyConsumption_FuelPurchased_Generals[generals]
            .Quality_of_fuel;

        const category3FuelEmission =
          calculateScope3Category3FuelPurchaseEmission(
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
              .GHGEnergyConsumption_FuelPurchased_Generals[generals],
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata].TaskRequest,
            emissionfactorinit as unknown as EmissionFactorInitFn
          );

        generalUpdateData.push({
          where: { id: { _eq: id } },
          _set: {
            kpi_em_Emission_QuantityOfFuelConsumed: multiplyEmissionGeneral,
            kpi_emf_Emission_QuantityOfFuelConsumed:
              Emission.emissionFactorValue,
            kpi_em_Scope3_Category3: category3FuelEmission.emissionValue
              ? category3FuelEmission.emissionValue *
                ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
                  .GHGEnergyConsumption_FuelPurchased_Generals[generals]
                  .Quality_of_fuel
              : category3FuelEmission.emissionValue,
            kpi_emf_Scope3_Category3: category3FuelEmission.emissionFactorValue,
            quantity_in_tonne: Emission.valueInTonne,
            quantity_quality_product: Emission.valueInTonne *
              ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
                .GHGEnergyConsumption_FuelPurchased_Generals[generals]
                .Quality_of_fuel,
          } as any,
        });
      }
    }
    //#endregion

    //#region Heating Waters start
    for (
      let heatingWaters = 0;
      heatingWaters <
      ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
        .GHGEnergyConsumption_FuelPurchased_HeatingWaters.length;
      heatingWaters++
    ) {
      const fuelType =
        ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
          .GHGEnergyConsumption_FuelPurchased_HeatingWaters[heatingWaters]
          .Type_of_Fuel_Purchased;
      const id =
        ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
          .GHGEnergyConsumption_FuelPurchased_HeatingWaters[heatingWaters].id;

      if (!uniqueHeatingWaterIds.has(id)) {
        uniqueHeatingWaterIds.add(id);

        const filters = [
          { field: "category", value: "Energy", additionalfilter: "" },
          { field: "activity", value: "Heating Water", additionalfilter: "" },
          { field: "type", value: fuelType, additionalfilter: "" },
          {
            field: "unitFilter",
            value: emissionFactorUnits.gj,
            additionalfilter: "",
          },
          {
            field: "yearMonth",
            value: {
              year: ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
                .TaskRequest?.year,
              month:
                ghgData.GHGEnergyConsumption_FuelPurchased[fueldata].TaskRequest
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

        const Emission = emissionfactorinit(
          "fuel_purchased_consumption",
          filters,
          ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
            .GHGEnergyConsumption_FuelPurchased_HeatingWaters[heatingWaters]
            .Quantity_of_fuel_consumed,
          String(
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
              .GHGEnergyConsumption_FuelPurchased_HeatingWaters[heatingWaters]
              .Quantity_of_fuel_consumed_uom
          ),
          String(
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
              .GHGEnergyConsumption_FuelPurchased_HeatingWaters[heatingWaters]
              .Type_of_Fuel_Purchased
          )
        );

        let multiplyEmissionHeatingWaters =
          Emission.emissionValue! *
          ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
            .GHGEnergyConsumption_FuelPurchased_HeatingWaters[heatingWaters]
            .Quality_of_fuel;

        heatingWaterUpdateData.push({
          where: { id: { _eq: id } },
          _set: {
            kpi_em_Emission_QuantityOfFuelConsumed:
              multiplyEmissionHeatingWaters,
            kpi_emf_Emission_QuantityOfFuelConsumed:
              Emission.emissionFactorValue,
               quantity_in_tonne: Emission.valueInTonne,
            quantity_quality_product: Emission.valueInTonne *
             ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
            .GHGEnergyConsumption_FuelPurchased_HeatingWaters[heatingWaters]
            .Quality_of_fuel,
          },
        });
      }
    }

    //#endregion
    //#region Auxiliaries start
    for (
      let auxiliaries = 0;
      auxiliaries <
      ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
        .GHGEnergyConsumption_FuelPurchased_Auxiliaries.length;
      auxiliaries++
    ) {
      const fuelType =
        ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
          .GHGEnergyConsumption_FuelPurchased_Auxiliaries[auxiliaries]
          .Type_of_Auxiliary_Fuel_Purchased;
      const id =
        ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
          .GHGEnergyConsumption_FuelPurchased_Auxiliaries[auxiliaries].id;

      if (!uniqueAuxiliaryIds.has(id)) {
        uniqueAuxiliaryIds.add(id);

        const filters = [
          { field: "category", value: "Energy", additionalfilter: "" },
          { field: "activity", value: "Auxiliary Fuel", additionalfilter: "" },
          { field: "type", value: fuelType, additionalfilter: "" },
          {
            field: "unitFilter",
            value: emissionFactorUnits.gj,
            additionalfilter: "",
          },
          {
            field: "yearMonth",
            value: {
              year: ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
                .TaskRequest?.year,
              month:
                ghgData.GHGEnergyConsumption_FuelPurchased[fueldata].TaskRequest
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

        const Emission = emissionfactorinit(
          "fuel_purchased_consumption",
          filters,
          ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
            .GHGEnergyConsumption_FuelPurchased_Auxiliaries[auxiliaries]
            .Quantity_of_fuel_consumed,
          String(
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
              .GHGEnergyConsumption_FuelPurchased_Auxiliaries[auxiliaries]
              .Quantity_of_fuel_consumed_uom
          ),
          String(
            ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
              .GHGEnergyConsumption_FuelPurchased_Auxiliaries[auxiliaries]
              .Type_of_Auxiliary_Fuel_Purchased
          )
        );
        const defaultvalue = fuelquality.filter(
          (items) =>
            sanitizeString.v3(items.label) ==
            sanitizeString.v3(
              String(
                ghgData.GHGEnergyConsumption_FuelPurchased[fueldata]
                  .GHGEnergyConsumption_FuelPurchased_Auxiliaries[auxiliaries]
                  .Type_of_Auxiliary_Fuel_Purchased
              )
            )
        ) as Record<string, any>[];
        auxiliaryFuelUpdateData.push({
          where: { id: { _eq: id } },
          _set: {
            kpi_em_Emission_QuantityOfFuelConsumed:
              defaultvalue.length > 0
                ? Emission.emissionValue! * defaultvalue[0]?.value
                : Emission.emissionValue! * 0,
            kpi_emf_Emission_QuantityOfFuelConsumed:
              Emission.emissionFactorValue,
               quantity_in_tonne: Emission.valueInTonne,
            quantity_quality_product: Emission.valueInTonne *
             defaultvalue[0]?.value,
          },
        });
      }
    }
    //#endregion
  }
  //#region Transportation start
  for (
    let transportation = 0;
    transportation <
    ghgData.GHGEnergyConsumption_FuelPurchased_Transportation.length;
    transportation++
  ) {
    const filters = [
      { field: "category", value: "Transport", additionalfilter: "" },
      { field: "activity", value: "Road", additionalfilter: "" },
      {
        field: "type",
        value:
          ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
            transportation
          ].Type_of_Fuel_Purchased,
        additionalfilter: "",
      },
      {
        field: "unitFilter",
        value:
          sanitizeString.v3(
            String(
              ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
                transportation
              ].Type_of_Fuel_Purchased
            )
          ) == "cng"
            ? emissionFactorUnits.kg
            : emissionFactorUnits.lit,
        additionalfilter: "",
      },
      {
        field: "yearMonth",
        value: {
          year: ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
            transportation
          ].TaskRequest?.year,
          month:
            ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
              transportation
            ].TaskRequest?.month,
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
      "fuel_purchased_transportation",
      filters,
      ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[transportation]
        .Quantity_of_fuel_purchased,
      String(
        ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
          transportation
        ].UoM_for_fuel_purchased
      ),
      String(
        ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
          transportation
        ].Type_of_Fuel_Purchased
      ),
      sanitizeString.v3(
        String(
          ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
            transportation
          ].Type_of_Fuel_Purchased
        )
      ) == sanitizeString.v3("Diesel") &&
        sanitizeString.v3(
          String(
            ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
              transportation
            ].UoM_for_fuel_purchased
          )
        ) == sanitizeString.v3("Litre")
        ? "litre"
        : undefined
    );
            const defaultvalue = fuelquality.filter(
          (items) =>
            sanitizeString.v3(items.label) ==
            sanitizeString.v3(
              String(
                ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
            transportation
          ].Type_of_Fuel_Purchased
              )
            )
        ) as Record<string, any>[];

    transportationFuelUpdateData.push({
      where: {
        id: {
          _eq: ghgData.GHGEnergyConsumption_FuelPurchased_Transportation[
            transportation
          ].id,
        },
      },
      _set: {
        kpi_em_Transport_Scope1: Emission?.emissionValue,
        kpi_emf_Transport_Scope1: Emission?.emissionFactorValue,
         quantity_in_tonne: Emission.valueInTonne,
            quantity_quality_product: Emission.valueInTonne *
              defaultvalue[0]?.value,
      },
    });
  }
  const updatedEmissionFuelPurchasedConsumptionData =
    await sdk.updateGHGEnergyConsumption_FuelPurchasedData({
      GHGEnergyConsumption_FuelPurchased_General: generalUpdateData,
      GHGEnergyConsumption_FuelPurchased_HeatingWater: heatingWaterUpdateData,
      GHGEnergyConsumption_FuelPurchased_Auxiliary: auxiliaryFuelUpdateData,
      GHGEnergyConsumption_FuelPurchased_Transportation:
        transportationFuelUpdateData,
    });

  return updatedEmissionFuelPurchasedConsumptionData;
};
