import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { getDownloadURL } from "@/modules/warp/packages/server/services/aws-s3.service";
import { NextApiHandler } from "next";
const GetDownloadData: NextApiHandler = async (req, res) => {
  const data = await getDownloadURL();
  res.status(200).json(data);
};

const handler: NextApiHandler =  ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(GetDownloadData, "GET"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);
export default handler;
export const dynamic = "force-dynamic";


