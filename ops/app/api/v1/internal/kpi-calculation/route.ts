import { NextRequest, NextResponse } from "next/server";
import { getGraphQlServerSDK } from "~/graphql/server";
import { GetActivityDataEnergyGridPowerQuery } from "~/graphql/shared/types";
import { TUserSession } from "~/lib/auth/auth.client";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";

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
  }
) {
  return emissionFactors.find((ef) => {
    const yearMatch = ef.year === year;
    const activityMatch = ef.activity === filter.activity;
    const subActivityMatch =
      filter.sub_activity === undefined ||
      ef.sub_activity === filter.sub_activity;
    const activitySpecificMatch =
      filter.activity_specific === undefined ||
      ef.activity_specific === filter.activity_specific;
    return (
      yearMatch && activityMatch && subActivityMatch && activitySpecificMatch
    );
  });
}

function calculateEmissions({ activity_data }: DataInput) {
  const emissionFactors = activity_data.emission_factors;

  let totalRenewableEmission = 0;
  let totalNonRenewableEmission = 0;

  for (const row of activity_data.ActivityDataEnergyGridPower) {
    const year = row.year;

    const renewableEF = getMatchingEmissionFactor(emissionFactors, year, {
      activity: "Energy",
      sub_activity: "Grid Power",
      activity_specific: "Renewable",
    });
    const nonRenewableEF = getMatchingEmissionFactor(emissionFactors, year, {
      activity: "Energy",
      sub_activity: "Grid Power",
      activity_specific: "Non-Renewable",
    });

    if (renewableEF) {
      totalRenewableEmission +=
        (row.renewable_units ?? 0) * renewableEF.emission_factor;
    }
    if (nonRenewableEF) {
      totalNonRenewableEmission +=
        (row.non_renewable_units ?? 0) * nonRenewableEF.emission_factor;
    }
  }

  return {
    emission_by_power_purchased_from_renewables: totalRenewableEmission,
    emission_by_power_purchased_from_nonrenewables: totalNonRenewableEmission,
    emission_by_total_power_purchased:
      totalRenewableEmission + totalNonRenewableEmission,
  };
}

async function POSTHandler(req: NextRequest, userSession: TUserSession) {
  const request_body = await req.json();
  const sdk = await getGraphQlServerSDK();

  const data = await sdk.getActivityDataEnergyGridPower({
    organization_address_id: request_body.organization_address_id,
  });

  const emissions = calculateEmissions({ activity_data: data });

  return NextResponse.json({ message: "Hello from OP", data, emissions });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POSTHandler), {
    limitInterval: 1,
    maxRequestCount: 60,
    progressiveDelay: false,
  })
);

export const dynamic = "force-dynamic";
