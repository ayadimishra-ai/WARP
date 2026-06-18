import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { GhgWaste, GhgWaste_Updates } from "@/modules/ghg/graphql/shared/types";
import { ParentActivitiesType } from "../shared/constants/activity.constant";
import { initEmissionCalculation } from "./emission-factor.service";

const quantityGeneratedOfEachWasteType = async (
  taskRequestId: string[],
  organizationId: string
) => {
  const sdk = await getGraphQlServerSDK();

  const response = await sdk.getGHGWasteByTaskRequestIds({
    taskRequestId: taskRequestId,
  });

  return response?.GHGWaste;
};

const emissionFromGenerationOfEachWasteType = async (
  data: GhgWaste[],
  organizationId: string
) => {
  const emissionfactorinit = await initEmissionCalculation(
    organizationId,
    String(data[0]?.OrganizationAddress?.Address?.country_id),
    [ParentActivitiesType.Waste, ParentActivitiesType.Transport]
  );

  let ghgWasteData: GhgWaste_Updates[] = [];
  const sdk = await getGraphQlServerSDK();
  // TODO Conflict below
  // const ghgWasteArray: UpdateGhgWasteByIdMutationVariables = {
  //   ghgWasteData: [],
  // };
  // const sdk = getGraphQlServerSDK();

  ghgWasteData = data.map((rec: any) => {
    let filters = [
      { field: "category", value: "Waste", additionalfilter: "" },
      {
        field: "sub_activity",
        value: rec.Types_of_Waste_Generated,
        additionalfilter: "",
      },
      {
        field: "yearMonth",
        value: {
          year: rec.TaskRequest?.year,
          month: rec.TaskRequest?.month,
        },
        additionalfilter: "",
      },
      {
        field: "metadata",
        value: "yes",
        additionalfilter: "Default",
      },
    ];
    if (!!rec.Disposal_Mechanism) {
      filters.splice(1, 0, {
        field: "activity",
        value: rec.Disposal_Mechanism,
        additionalfilter: "",
      });
    }

    const Emission = emissionfactorinit(
      "waste_generation",
      filters,
      rec.Quantity_of_Waste,
      String(rec.Quantity_of_Waste_UoM),
      ""
    );

    let insertionData = {
      where: {
        id: {
          _eq: rec.id,
        },
      },
      _set: {
        kpi_em_EmissionBy_Generation_of_Waste_Type: Emission.emissionValue,
        kpi_emf_EmissionBy_Generation_of_Waste_Type:
          Emission.emissionFactorValue,
        kpi_em_EmissionBy_TransportFor_Waste_Scope3:
          rec.Waste_Disposal_Managed_by == "thirdparty"
            ? Emission.emissionValue
            : 0,
        kpi_em_EmissionBy_TransportFor_Waste_Scope1:
          rec.Waste_Disposal_Managed_by == "thirdparty"
            ? 0
            : Emission.emissionValue,
      },
    };

    return insertionData;
  });

  const response = await sdk.updateGHGWasteById({ ghgWasteData: ghgWasteData });

  const eData =
    response.update_GHGWaste_many &&
    response.update_GHGWaste_many[0]?.returning;

  return eData;
};

const scope1EmissionFromWasteGeneration = (
  quantityGenerated: any,
  data: any
) => {
  let scope1EmissionData: number = 0;

  quantityGenerated.map((rec: any) => {
    const wasteTypeFilteredData = data.filter((eData: any) =>
      eData.sub_activity
        ?.toLowerCase()
        .includes(rec.Types_of_Waste_Generated?.toLowerCase())
    );

    if (rec.Waste_Disposal_Managed_by === "Self") {
      wasteTypeFilteredData.forEach((_rec: any) => {
        scope1EmissionData = scope1EmissionData + _rec.emission;
        // scope1EmissionData.push({
        //   ..._rec,
        //   Waste_Disposal_Managed_by: rec.Waste_Disposal_Managed_by,
        //   Name_of_Third_Party: rec.Name_of_Third_Party,
        // });
      });
    }
  });

  return scope1EmissionData;
};

const scope3EmissionFromWasteGeneration = (
  quantityGenerated: any,
  data: any
) => {
  let scope3EmissionData: number = 0;

  quantityGenerated.map((rec: any) => {
    const wasteTypeFilteredData = data.filter((eData: any) =>
      eData.sub_activity
        ?.toLowerCase()
        .includes(rec.Types_of_Waste_Generated?.toLowerCase())
    );

    if (rec.Waste_Disposal_Managed_by === "Third Party") {
      wasteTypeFilteredData.forEach((_rec: any) => {
        scope3EmissionData = scope3EmissionData + _rec.emission;
        // scope3EmissionData.push({
        //   ..._rec,
        //   Waste_Disposal_Managed_by: rec.Waste_Disposal_Managed_by,
        //   Name_of_Third_Party: rec.Name_of_Third_Party,
        // });
      });
    }
  });

  return scope3EmissionData;
};

const totalEmissionFromWasteGeneration = async (
  quantityGenerated: any,
  emissionGeneration: any
) => {
  let total: number = 0;

  const scope1 = await scope1EmissionFromWasteGeneration(
    quantityGenerated,
    emissionGeneration
  );
  const scope3 = await scope3EmissionFromWasteGeneration(
    quantityGenerated,
    emissionGeneration
  );

  // total.push(...scope1, ...scope3);

  total = scope1 + scope3;

  return total;
};

const emissionByUniqueThirdPartyForWasteDisposal = async (
  quantityGenerated: any,
  emissionGeneration: any
) => {
  // const scope3 = await Promise.all(
  //   scope3EmissionFromWasteGeneration(quantityGenerated, emissionGeneration)
  // );

  const emissionData: any = [];
  let uniqueCount: number = 0;

  quantityGenerated.map((rec: any) => {
    const wasteTypeFilteredData = emissionGeneration.filter((eData: any) =>
      eData.sub_activity
        ?.toLowerCase()
        .includes(rec.Types_of_Waste_Generated?.toLowerCase())
    );

    if (rec.Waste_Disposal_Managed_by === "Third Party") {
      wasteTypeFilteredData.forEach((_rec: any) => {
        emissionData.push({
          ..._rec,
          Waste_Disposal_Managed_by: rec.Waste_Disposal_Managed_by,
          Name_of_Third_Party: rec.Name_of_Third_Party,
        });
      });
    }
  });

  const unique = emissionData.filter(
    (s: any, i: any) =>
      emissionData.findIndex(
        (obj: any) => obj.Name_of_Third_Party === s.Name_of_Third_Party
      ) === i
  );

  unique.forEach((d: any) => {
    uniqueCount = uniqueCount + d.emission;
  });

  return uniqueCount;
};

// Base Method
export const emissionWasteGeneration = async (
  taskRequestId: string[],
  organizationId: string
) => {
  try {
    const quantityGenerated = await quantityGeneratedOfEachWasteType(
      taskRequestId,
      organizationId
    );
    const emissionGeneration = await emissionFromGenerationOfEachWasteType(
      quantityGenerated as GhgWaste[],
      organizationId
    );

    const scope1Emission = await scope1EmissionFromWasteGeneration(
      quantityGenerated,
      emissionGeneration
    );

    const scope3Emission = await scope3EmissionFromWasteGeneration(
      quantityGenerated,
      emissionGeneration
    );

    const totalEmission = await totalEmissionFromWasteGeneration(
      quantityGenerated,
      emissionGeneration
    );

    const emissionByUniqueThirdParty =
      await emissionByUniqueThirdPartyForWasteDisposal(
        quantityGenerated,
        emissionGeneration
      );
  } catch (error) {
    console.log("Emission waste generation calculation exception : ", error);
  }
};
