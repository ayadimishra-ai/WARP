import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import {
  IEmissionReductionPlan,
  INetZeroTargetYearInput,
} from "./net-zero-target-year.interface";

export async function updateNetZeroTargetYearDetails(
  payload: INetZeroTargetYearInput,
  userId: string,
  organizationId: string
) {
  const sdk = await getGraphQlServerSDK();
  const net_zero_metadata: IEmissionReductionPlan = {
    mechanism_type: payload.mechanism_type,
    targets: payload.targets,
    baseline_year: payload.baseline_year,
  };
  try {
    const resp = await sdk.updateNetZeroTargetYear({
      id: organizationId,
      net_zero_metadata: net_zero_metadata,
    });

    if (!resp.update_Organization)
      return {
        success: false,
        data: "something went wrong while updating the net zero target year details",
      };

    return {
      success: true,
      data: resp?.update_Organization?.returning[0],
    };
  } catch (error) {
    console.error(
      "Error while updating the net zero target year details:",
      error
    );
    return {
      success: false,
      message: "Failed to update net zero target year details.",
    };
  }
}
