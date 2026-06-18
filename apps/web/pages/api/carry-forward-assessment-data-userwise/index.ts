import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { carryForwardAssessmentDataUserWise } from "@warp/server/services/carry-forward-assessment-data/carry-forward-user-wise.service";
import { NextApiRequest, NextApiResponse } from "next";

export const config = {
  api: {
    bodyParser: {
      sizeLimit: "5mb",
    },
  },
};

async function handler(req: NextApiRequest, res: NextApiResponse) {
  try {
    // Request Method Validation
    if (req.method !== "POST") {
      res.status(405).send({
        data: null,
        error: {
          code: res.statusCode,
          message: `${req.method} method not allowed.`,
          stack: null,
        },
      });
      return;
    }

    // Request Body Validation
    if (!req.body) {
      res.status(400).send({
        data: null,
        error: {
          code: 400,
          message: "Request body is required.",
          stack: null,
        },
      });
      return;
    }

    // Call Create User service with body parameter
    const body = req.body;
    if (req.method === "POST") {
      const responseData = await carryForwardAssessmentDataUserWise(body);

      res.status(200).send({ data: responseData, error: null });
      return;
    }
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    res.status(500).json({ error: error?.message || "Internal Server Error" });
  }
}

export default withEmailOrIpRateLimitWithProgressiveDelay(handler, {
  limitInterval: 1, // in minutes
  maxRequestCount: 60,
  progressiveDelay: true,
});

export const dynamic = "force-dynamic";
