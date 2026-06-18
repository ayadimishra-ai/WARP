import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { documentProcessingCompleted } from "@/modules/warp/packages/server/services/AI/document-processing-completed";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  const start = Date.now();
  console.log("document-processing-completed API START", {
    timestamp: new Date().toISOString(),
    method: req.method,
    url: req.url,
    headers: {
      // avoid logging sensitive headers in production
      authorization: req.headers.authorization,
    },
  });

  try {
    if (req.method !== "POST") {
      console.warn("Invalid method for document-processing-completed", {
        method: req.method,
      });
      res.setHeader("Allow", "POST");
      return res.status(405).json({ data: null, error: "Method Not Allowed" });
    }

    const bulkProcessingId = req.body?.bulkProcessingId;

    const { data: responseData, error: serviceError } = await documentProcessingCompleted(bulkProcessingId);

    console.log("documentProcessingCompleted result:", {
      success: responseData !== null,
      returnedLength: Array.isArray(responseData) ? responseData.length : undefined,
      serviceError,
    });

    const durationMs = Date.now() - start;
    console.log("document-processing-completed API END", {
      timestamp: new Date().toISOString(),
      durationMs,
    });

    if (responseData !== null) {
      return res.status(200).json({ data: responseData, error: null });
    }

    return res.status(400).json({ data: null, error: serviceError || "Failed to send email" });
  } catch (error: any) {
    const durationMs = Date.now() - start;
    console.error("document-processing-completed API ERROR", {
      message: error?.message,
      stack: error?.stack,
      durationMs,
    });
    return res
      .status(500)
      .json({ data: null, error: error?.message || "Internal Server Error" });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1,
  maxRequestCount: 60,
  progressiveDelay: false,
});

export const dynamic = "force-dynamic";
