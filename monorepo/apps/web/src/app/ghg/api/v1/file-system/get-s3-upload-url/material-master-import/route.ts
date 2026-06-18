import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { TUserSession } from "@/modules/ghg/lib/auth/auth.client";
import { apiExceptionGuard } from "@/modules/ghg/lib/guards/api-exception-guard";
import { apiAuthGuard } from "@/modules/ghg/lib/guards/api-user-auth-guard";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/ghg/lib/rate-limiter/progressive-delay-rate-limit";
import { MIME_TYPES_EXCEL } from "@/modules/ghg/shared/constants/http.constant";
import { CustomError } from "@/modules/ghg/shared/error/custom-error";
import {
    getS3ObjectPublicUrl,
    getS3SignedURL,
} from "@/modules/ghg/utils/file-storage/server.service";

const inputValidationSchema = z.object({
  files: z
    .array(z.custom<File>())
    .refine((files) => files.length > 0, "Files is required")
    .refine(
      (files) => files.every((file) => MIME_TYPES_EXCEL.includes(file.type)),
      "Invalid file, only excel files are allowed."
    ),
});

const postHandler = async (req: NextRequest, userSession: TUserSession) => {
  const formdata = await req.formData();

  const formDataPayload = {
    files: formdata.getAll("files"),
  };

  const parsedData =
    await inputValidationSchema.safeParseAsync(formDataPayload);

  if (!parsedData.success) {
    const errors = parsedData.error.issues.map((m) => m.message);

    throw CustomError({
      statusCode: 400,
      message: "Bad request",
      data: errors,
    });
  }

  const { files } = parsedData.data;
  const { organizationId, userId, userEmail } = userSession;

  const filesData = files.map((file) => ({
    name: file.name,
    type: file.type,
    size: file.size,
  }));

  const responseData: {
    uploadUrl: string;
    fileName: string;
    downloadUrl: string;
  }[] = [];

  for (let index = 0; index < filesData.length; index++) {
    const { name, size, type } = filesData[index];
    const { signedUrl, objectKey } = await getS3SignedURL(
      "material-master-uploads",
      organizationId,
      name,
      type,
      size,
      {
        organizationId,
        userId,
        userEmail,
        fileName: name,
        module: "material_master",
      }
    );

    const { filePublicUrl } = await getS3ObjectPublicUrl(
      organizationId,
      objectKey
    );

    responseData.push({
      uploadUrl: signedUrl,
      fileName: name,
      downloadUrl: filePublicUrl,
    });
  }

  return NextResponse.json({
    success: true,
    data: responseData,
  });
};

export const POST = apiExceptionGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(apiAuthGuard(postHandler), {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: true,
  })
);
