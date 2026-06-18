import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import {
  calculateEmission,
  saveEmissionDashboard,
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";

const InputSchema = z.object({
  orgid: z.string().uuid(),
  task_request_id: z.array(z.string().uuid()),
});

async function POST_Hander(req: NextRequest, userSession: TUserSession) {
  let body = await req.json();
  const input = InputSchema.safeParse(body);

  if (!input.success) {
    return NextResponse.json(
      { message: "Invalid input", errors: input.error.errors },
      { status: 400 }
    );
  }

  if (userSession.organizationId !== input.data.orgid) {
    return NextResponse.json(
      { message: "Unauthorized access to organization data" },
      { status: 403 }
    );
  }

  if (input.data.task_request_id.length === 0) {
    return NextResponse.json(
      { message: "No task_request_id provided" },
      { status: 400 }
    );
  }

  const validatedData = input.data;

  // await calculateEmission(
  //   validatedData.orgid,
  //   "transport_upstream",
  //   validatedData.task_request_id
  // );
  // await calculateEmission(
  //   validatedData.orgid,
  //   "energy_grid_power",
  //   validatedData.task_request_id
  // );
  // await calculateEmission(
  //   validatedData?.orgid,
  //   "energy_captive_power",
  //   validatedData?.task_request_id
  // );
  // await calculateEmission(validatedData?.orgid, "waste", validatedData?.task_request_id);
  await calculateEmission(
    validatedData?.orgid,
    "energy_fuel_purchased",
    validatedData?.task_request_id
  );
  // await calculateEmission(
  //   validatedData?.orgid,
  //   "transport_business_travel",
  //   validatedData?.task_request_id
  // );
  // await calculateEmission(
  //   validatedData?.orgid,
  //   "transport_employee_travel",
  //   validatedData?.task_request_id
  // );
  // await calculateEmission(
  //   validatedData?.orgid,
  //   "transport_downstream",
  //   validatedData?.task_request_id
  // );
  // await calculateEmission(
  //   validatedData?.orgid,
  //   "material_procurement",
  //   validatedData?.task_request_id
  // );
  // await calculateEmission(
  //   validatedData?.orgid,
  //   "fugitive_details",
  //   validatedData?.task_request_id
  // );

  const response: any = await saveEmissionDashboard(
    validatedData?.task_request_id,
    validatedData?.orgid
  );

  return NextResponse.json({
    message: "Success",
    data: response,
  });
}

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(POST_Hander), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);