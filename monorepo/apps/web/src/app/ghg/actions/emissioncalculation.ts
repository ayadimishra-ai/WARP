"use server";
import { UUID } from "crypto";
import {
  calculateEmission,
  emissionCalculationForBuyer,
  saveEmissionDashboard,
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import { logger } from "@/modules/ghg/utils/logger";

export async function EmissioncalculationEnergyGrid({
  data,
  organizationId,
}: {
  data: any;
  deletedData?: any;
  organizationId: string;
}) {
  // Below code is for Emission Calculation
  try {
    logger.debug(
      "All GHGEnergyConsumptionGridPower Emission Calculation mapped",
      { allData: data }
    );
    const uniquetask_request_id =
      data.insert_GHGEnergyConsumption_GridPower?.returning
        .map((items: any) => items.task_request_id)
        .filter(
          (item: any, index: any, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];
    let calculations = await calculateEmission(
      organizationId,
      "energy_grid_power",
      uniquetask_request_id
    );
    // Below code is for emission dashboard kpi entries
    const response: any = await saveEmissionDashboard(
      uniquetask_request_id,
      organizationId
    );

    const responseEmission: any = await emissionCalculationForBuyer({
      instanceOrgId: organizationId as UUID,
      instanceTaskRequestIds: uniquetask_request_id as UUID[],
    });
  } catch (error: unknown) {
    logger.error("emission data insertion failed", { error: error });
  }
}
