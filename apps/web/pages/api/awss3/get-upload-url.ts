import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { generateS3PresignUplaodUrl } from "@warp/server/services/aws-s3.service";
import {
  GetS3UploadUrlRequestSchema,
  GetS3UploadUrlResponseType,
} from "@warp/shared/validation/api-get-s3-upload-url.schema";
import { NextApiHandler } from "next";

const GetFileUploadData: NextApiHandler<GetS3UploadUrlResponseType> = async (
  req,
  res
) => {
  // Validate request body
  const reqData = await GetS3UploadUrlRequestSchema.validate(req.body);
  reqData.fileName = decodeURIComponent(reqData.fileName);
  reqData.fileType = decodeURIComponent(reqData.fileType);
  reqData.folderPath = decodeURIComponent(reqData.folderPath || "");

  const data = await generateS3PresignUplaodUrl(
    reqData.fileName,
    reqData.fileType,
    reqData.isCustomName,
    reqData.folderPath
  );

  // Send response
  res.status(200).json(data);
};

const handler =  ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(GetFileUploadData, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);
export default handler as NextApiHandler<GetS3UploadUrlResponseType>;
export const dynamic = "force-dynamic";

