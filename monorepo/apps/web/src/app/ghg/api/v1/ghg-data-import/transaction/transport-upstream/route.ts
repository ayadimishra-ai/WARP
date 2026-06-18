import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGTransportUpstream } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import {
  calculateEmission,
  saveEmissionDashboard,
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { TransportUpstreamService } from "@/modules/ghg/lib/organization-transaction/transport/transport-upstream.service";
import {
  validateApiBodySchema,
  validateApiBodydata,
} from "@/modules/ghg/lib/organization-transaction/transport/transport-upstream.validation";
import { uploadActivityJsonData } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // validate request body

  const responseBody = await req.json();

  const validatedData = await validateApiBodySchema(
    responseBody,
    userSession.organizationId as UUID
  );

  // Get original data file url
  const originalFile = await uploadActivityJsonData(
    userSession,
    "activity_uploads",
    "Upstream Transport",
    responseBody
  );

  const fileName = getFilenameFromURL(originalFile?.downloadUrl!);
  if (!!validatedData && validatedData.length > 0) {
    // Get failure data file url
    // Get original data file url
    const failureFile = await uploadActivityJsonData(
      userSession,
      "activity_uploads_failure",
      "Upstream Transport",
      validatedData
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_upstream",
      "Json",
      fileName,
      originalFile?.downloadUrl!,
      "failure",
      {
        file_url: failureFile?.downloadUrl ?? "",
      }
    );
    return NextResponse.json(
      {
        statusCode: 400,
        error: {
          message: "Validation failed",
          data: validatedData,
        },
      },
      { status: 400 }
    );
  }
  const validatedBodydata = await validateApiBodydata(
    responseBody,
    userSession
  );

  if (!!validatedBodydata && validatedBodydata.length > 0) {
    // Get failure data file url
    // Get original data file url
    const failureFile = await uploadActivityJsonData(
      userSession,
      "activity_uploads_failure",
      "Upstream Transport",
      validatedBodydata
    );

    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_upstream",
      "Json",
      fileName,
      originalFile?.downloadUrl!,
      "failure",
      {
        file_url: failureFile?.downloadUrl ?? "",
      }
    );
    return NextResponse.json(
      {
        statusCode: 400,
        error: {
          message: "Validation failed",
          data: validatedBodydata,
        },
      },
      { status: 400 }
    );
  }
  // service method
  const saveresponse = await TransportUpstreamService(
    responseBody,
    userSession
  );

  saveGHGTransportUpstream(
    saveresponse?.insert_GHGTransport_Upstream?.returning,
    userSession,
    saveresponse.delete_GHGTransport_Upstream?.returning
  );

  const historyData = await insertNewDataImportHistory(
    userSession,
    "transport_upstream",
    "Json",
    fileName,
    originalFile?.downloadUrl!,
    "successful",
    null
  );

  //#region save emission in table
  const uniquetask_request_id =
    saveresponse.insert_GHGTransport_Upstream?.returning
      .map((items: any) => items.task_request_id)
      .filter(
        (item: any, index: any, self: any) =>
          index === self.findIndex((t: any) => t === item)
      ) as UUID[];
  await calculateEmission(
    userSession?.organizationId,
    "transport_upstream",
    uniquetask_request_id
  );
  const response: any = await saveEmissionDashboard(
    uniquetask_request_id,
    userSession?.organizationId
  );
  //#endregion

  // After successful data write — update summary cache per actual saved address
  const savedUpstream =
    saveresponse?.insert_GHGTransport_Upstream?.returning ?? [];
  const upstreamGroupedByAddress = new Map<
    string,
    { year: number; month: string }[]
  >();
  for (const row of savedUpstream) {
    const addr = row.organization_address_id;
    if (!addr) continue;
    if (!upstreamGroupedByAddress.has(addr))
      upstreamGroupedByAddress.set(addr, []);
    const rowYear = Number(
      row.ActivityTaskRequest?.TaskRequest?.year ?? row.year
    );
    const rowMonth = String(
      row.ActivityTaskRequest?.TaskRequest?.month ?? row.month ?? ""
    ).toLowerCase();
    if (rowYear && rowMonth)
      upstreamGroupedByAddress.get(addr)!.push({ year: rowYear, month: rowMonth });
  }
  for (const [addrId, monthYears] of upstreamGroupedByAddress) {
    const uniqueMY = [
      ...new Map(
        monthYears.map((m) => [`${m.year}-${m.month}`, m])
      ).values(),
    ];
    upsertCacheForActivity({
      organizationId: userSession.organizationId,
      organizationAddressId: addrId,
      activityCode: "transport_upstream",
      monthYears: uniqueMY,
    }).catch((err) => console.error("[summary-cache] upsert failed:", err));
  }
  return NextResponse.json({
    statusCode: 200,
  });
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
