import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGTransportUpstream } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import {
  calculateEmission,
  saveEmissionDashboard,
} from "~/lib/emission-calculation-engine/emisison-calculation.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { TransportUpstreamService } from "~/lib/organization-transaction/transport/transport-upstream.service";
import {
  validateApiBodySchema,
  validateApiBodydata,
} from "~/lib/organization-transaction/transport/transport-upstream.validation";
import { uploadActivityJsonData } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";

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

  return NextResponse.json({
    statusCode: 200,
  });
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
