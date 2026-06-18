import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { GetActivityDataEnergyGridPowerQuery } from "@/modules/ghg/graphql/shared/types";

type EmissionFactor =
  GetActivityDataEnergyGridPowerQuery["emission_factors"][0];
type DataInput = { activity_data: GetActivityDataEnergyGridPowerQuery };

function getMatchingEmissionFactor(
  emissionFactors: EmissionFactor[],
  year: number,
  filter: {
    activity: string;
    sub_activity?: string;
    activity_specific?: string;
    region_name?: string; // Optional if region filtering is needed later
  }
): number {
  const filtered = emissionFactors.filter((ef) => {
    return (
      ef.activity === filter.activity &&
      (filter.sub_activity === undefined ||
        ef.sub_activity === filter.sub_activity) &&
      (filter.activity_specific === undefined ||
        ef.activity_specific === filter.activity_specific) &&
      (filter.region_name === undefined ||
        ef.Region?.name === filter.region_name)
    );
  });

  if (filtered.length === 0) {
    // throw new Error(
    //   `No emission factor found for filter: ${JSON.stringify(filter)}`
    // );
    return 0;
  }

  const exactYearMatch = filtered.find((ef) => ef.year === year);
  if (exactYearMatch) return exactYearMatch.factor;

  const earliestYearFactor = filtered.reduce((prev, current) =>
    current.year < prev.year ? current : prev
  );

  return earliestYearFactor.factor;
}

function calculateEmissions(data: DataInput) {
  const { TaskRequest, emission_factors } = data.activity_data;

  let totalRenewableEmission = 0;
  let totalNonRenewableEmission = 0;

  for (const task of TaskRequest) {
    for (const energy of task.energy_grid_power) {
      const year = task.year;

      const ppa_kwh = energy.ppa_renewable_kwh;
      const rec_kwh = energy.rec_kwh;
      const grid_kwh = energy.grid_kwh;

      const renewable_power = ppa_kwh + rec_kwh;
      const non_renewable_kwh = grid_kwh - renewable_power;

      // --- Renewable Emissions ---
      const ppa_renewable_factor = getMatchingEmissionFactor(
        emission_factors,
        year!,
        {
          activity: "Grid",
          sub_activity: "PPA Renewable",
        }
      );

      const rec_factor = getMatchingEmissionFactor(emission_factors, year!, {
        activity: "Grid",
        sub_activity: "REC",
      });

      const emissionFromPPA = ppa_kwh * ppa_renewable_factor;
      const emissionFromREC = rec_kwh * rec_factor;
      const emissionRenewable = emissionFromPPA + emissionFromREC;

      totalRenewableEmission += emissionRenewable;

      // --- Non-Renewable Emissions ---
      const nonRenewableFactor = getMatchingEmissionFactor(
        emission_factors,
        year!,
        {
          activity: "Grid",
          sub_activity: "Non Renewable",
          activity_specific: "Thermal",
        }
      );

      const emissionNonRenewable = non_renewable_kwh * nonRenewableFactor;
      totalNonRenewableEmission += emissionNonRenewable;
    }
  }

  return {
    emission_by_power_purchased_from_renewables: totalRenewableEmission,
    emission_by_power_purchased_from_nonrenewables: totalNonRenewableEmission,
    emission_by_total_power_purchased:
      totalRenewableEmission + totalNonRenewableEmission,
  };
}

export const POST = async (req: NextRequest) => {
  const request_body = await req.json();
  const sdk = await getGraphQlServerSDK();

  const data = await sdk.getActivityDataEnergyGridPower({
    organization_address_id: request_body.organization_address_id,
  });

  const emissions = calculateEmissions({ activity_data: data });

  return NextResponse.json({ message: "Hello from OP", data, emissions });
};
