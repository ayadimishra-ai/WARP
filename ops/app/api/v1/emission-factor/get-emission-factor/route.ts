import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getEmissionFactorsForDownload } from "~/lib/emission-factor/get-emission-factor.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "~/lib/rate-limiter/progressive-delay-rate-limit";
import { sanitizeString } from "~/utils/sanitize.util";

// -------------------------------------------------------------------------------
// // #region get req handler
// //if we are using get request use this..
// async function getHandler(req: NextRequest, userSession: TUserSession) {
//   const res = await getEmissionFactorsForDownload(userSession.organizationId);
//   return NextResponse.json({ statusCode: 200, data: res });
// }

// export const GET = apiExceptionGuard(apiAuthGuard(getHandler));
// // #end region get req handler

// -------------------------------------------------------------------------------
// #region post req handler
const ValidateAPIEmissionFactorDownload = z.object({
  organization_id: z
    .string()
    .uuid("Invalid organization id")
    .transform(sanitizeString.v1),
});

//if we are using post request use this..
async function postHandler(req: NextRequest) {
  const input = await ValidateAPIEmissionFactorDownload.parseAsync(
    await req.json()
  );

  const res = await getEmissionFactorsForDownload(input.organization_id);
  const finalResponse = res?.map((i) => ({
    Region: i?.Region?.name || i?.metadata[0]?.Region || "",
    "Year(Version)": i?.year || "",
    Database: i?.metadata[0]?.Database || "",
    Category: i?.category || "",
    Activity: i?.activity || "",
    Subactivity: i?.sub_activity || "",
    "Activity Specific": i?.metadata?.[0]?.["Activity Specific"] || "",
    Type: i?.type || "",
    SubType: i?.sub_type || "",
    "Emision Factor": i?.factor || 0,
    UoM: i?.factor_uom || "",
    Default: i?.metadata?.[0]?.Default || "",
  }));
  return NextResponse.json({ statusCode: 200, data: finalResponse });
}
export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);

export const dynamic = "force-dynamic";

// # end region post handler
