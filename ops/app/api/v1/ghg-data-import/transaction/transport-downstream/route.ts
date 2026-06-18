import { UUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { saveGHGTransportDownstream } from "~/lib/auditlog/auditlog.service";
import { TUserSession } from "~/lib/auth/auth.client";
import { insertNewDataImportHistory } from "~/lib/data-import-history/data-import-history.service";
import {
  calculateEmission,
  saveEmissionDashboard,
} from "~/lib/emission-calculation-engine/emisison-calculation.service";
import { apiExceptionGuard } from "~/lib/guards/api-exception-guard";
import { apiAuthGuard } from "~/lib/guards/api-user-auth-guard";
import { TransportDownstreamService } from "~/lib/organization-transaction/transport/transport-downstream.service";
import {
  validateApiBodySchema,
  validateApiMasterdata,
} from "~/lib/organization-transaction/transport/transport-downstream.validation";
import { uploadActivityJsonData } from "~/shared/services/error-file-upload.service";
import { getFilenameFromURL } from "~/utils/data-transformer.util";

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
    return NextResponse.json({
      statusCode: 200,
    });
  }
}

export const POST = apiExceptionGuard(apiAuthGuard(postHandler));
