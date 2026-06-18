import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { moveFileFromPath } from "@warp/server/services/aws-s3.service";
import { DeleteS3UploadUrlRequestSchema } from "@warp/shared/validation/api-get-s3-upload-url.schema";
import { NextApiRequest, NextApiResponse } from "next";

interface ApiResponse {
  statusCode: number;
  data: any[];
  message?: string;
}

const moveFileHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) => {
  try {
    // Validate request body
    const reqData = await DeleteS3UploadUrlRequestSchema.validate(req.body);
    reqData.filePath = decodeURIComponent(reqData.filePath);
    
    // Move the file
    await moveFileFromPath(reqData.filePath);
    
    // Send response
    return res.status(200).json({
      statusCode: 200,
      data: [],
      message: "File moved successfully"
    });
  } catch (error) {
    console.error('Error moving file:', error);
    return res.status(500).json({
      statusCode: 500,
      data: [],
      message: error instanceof Error ? error.message : 'An error occurred while moving the file'
    });
  }
};

const handler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(moveFileHandler, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);


export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
export const dynamic = "force-dynamic";


