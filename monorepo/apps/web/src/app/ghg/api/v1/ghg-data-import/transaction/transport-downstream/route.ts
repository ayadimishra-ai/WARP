import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGTransportDownstream } from "@/modules/ghg/lib/auditlog/auditlog.service";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { insertNewDataImportHistory } from "@/modules/ghg/lib/data-import-history/data-import-history.service";
import {
  calculateEmission,
  saveEmissionDashboard,
} from "@/modules/ghg/lib/emission-calculation-engine/emisison-calculation.service";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { TransportDownstreamService } from "@/modules/ghg/lib/organization-transaction/transport/transport-downstream.service";
import {
  validateApiBodySchema,
  validateApiMasterdata,
} from "@/modules/ghg/lib/organization-transaction/transport/transport-downstream.validation";
import { uploadActivityJsonData } from "@/modules/ghg/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "@/modules/ghg/utils/data-transformer.util";
import { upsertCacheForActivity } from "@/modules/ghg/lib/monthly-activity-summary/cache-queries";

async function postHandler(req: NextRequest, userSession: TUserSession) {
  // validate request body
  const responseBody = await req.json();

  const originalFile = await uploadActivityJsonData(
    userSession,
    "activity_uploads",
    "Upstream Transport",
    responseBody
  );
  const fileName = getFilenameFromURL(originalFile?.downloadUrl!);
  const dataValidation = await validateApiBodySchema(
    responseBody,
    userSession.organizationId as UUID
  );
  if (!!dataValidation.length) {
    const failureFile = await uploadActivityJsonData(
      userSession,
      "activity_uploads_failure",
      "Downstream Transport",
      dataValidation
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_downstream",
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
          data: dataValidation,
        },
      },
      { status: 400 }
    );
  }

  const validatedBodydata = await validateApiMasterdata(
    responseBody,
    userSession
  );
  if (!!validatedBodydata.length) {
    const failureFile = await uploadActivityJsonData(
      userSession,
      "activity_uploads_failure",
      "Downstream Transport",
      validatedBodydata
    );
    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_downstream",
      "Json",
      fileName,
      originalFile?.downloadUrl!,
      "failure",
      {
        file_url: failureFile?.downloadUrl ?? "",
      }
    );

    // throw CustomError({
    //   statusCode: 400,
    //   message: "Validation failed",
    //   data: validatedBodydata,
    // });
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
  const success: any = await TransportDownstreamService(
    responseBody,
    userSession
  );
  saveGHGTransportDownstream(
    success?.insert_GHGTransport_Downstream?.returning,
    userSession,
    success?.delete_GHGTransport_Downstream?.returning
  );

  if (!!success) {
    const historyData = await insertNewDataImportHistory(
      userSession,
      "transport_downstream",
      "Json",
      fileName,
      originalFile?.downloadUrl!,
      "successful",
      null
    );

    // Below code is for Emission Calculation
    const uniquetask_request_id =
      success?.insert_GHGTransport_Downstream?.returning
        .map((items: any) => items.task_request_id)
        .filter(
          (item: any, index: number, self: any) =>
            index === self.findIndex((t: any) => t === item)
        ) as UUID[];
    await calculateEmission(
      userSession?.organizationId,
      "transport_downstream",
      uniquetask_request_id
    );
    const response: any = await saveEmissionDashboard(
      uniquetask_request_id,
      userSession?.organizationId
    );
    // After successful data write — update summary cache per actual saved address.
    // The downstream GQL mutation does not return month/year on each row, so we
    // derive the unique (year, month) pairs from the request payload and group
    // them by the organization_address_id present on each returned record.
    const savedDownstream =
      success?.insert_GHGTransport_Downstream?.returning ?? [];
    const downstreamGroupedByAddress = new Map<
      string,
      { year: number; month: string }[]
    >();
    // Build a quick lookup of all (year, month) pairs submitted in this request
    const requestMonthYears = (responseBody as any[]).map((d: any) => ({
      year: Number(d.year),
      month: String(d.month).toLowerCase(),
    }));
    for (const row of savedDownstream) {
      const addr = row.organization_address_id;
      if (!addr) continue;
      if (!downstreamGroupedByAddress.has(addr))
        downstreamGroupedByAddress.set(addr, []);
      downstreamGroupedByAddress.get(addr)!.push(...requestMonthYears);
    }
    for (const [addrId, monthYears] of downstreamGroupedByAddress) {
      const uniqueMY = [
        ...new Map(
          monthYears.map((m) => [`${m.year}-${m.month}`, m])
        ).values(),
      ];
      upsertCacheForActivity({
        organizationId: userSession.organizationId,
        organizationAddressId: addrId,
        activityCode: "transport_downstream",
        monthYears: uniqueMY,
      }).catch((err) => console.error("[summary-cache] upsert failed:", err));
    }
    return NextResponse.json({
      statusCode: 200,
    });
  }
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
