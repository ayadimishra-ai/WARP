import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { AIChatSubscriptionNotificationService } from "@/modules/warp/packages/server/services/ai-chat-subscription-notification.service";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

interface AIChatSubscriptionNotificationResponse {
  success: boolean;
  message: string;
  data?: any;
  error?: string;
}

const handler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<AIChatSubscriptionNotificationResponse>
) => {
  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({
      success: false,
      message: "Method not allowed. Only POST requests are supported.",
    });
  }

  try {
    const { companyId, userId, queryType, platformId } = req.body;

    // Validate required fields
    if (!companyId || !userId || !queryType || !platformId) {
      return res.status(400).json({
        success: false,
        message:
          "Missing required fields: companyId, userId, queryType, and platformId are required",
      });
    }

    // Validate queryType
    if (!["textual", "graphical"].includes(queryType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid queryType. Must be 'textual' or 'graphical'",
      });
    }

    console.log(
      `[AI-CHAT-SUBSCRIPTION] Processing subscription limit notification for user: ${userId}, company: ${companyId}, queryType: ${queryType}`
    );

    // Process the subscription limit exceeded notification
    const result =
      await AIChatSubscriptionNotificationService.processSubscriptionLimitExceededNotification(
        {
          companyId,
          userId,
          queryType,
          platformId,
        }
      );

    // Return the result
    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: result,
    });
  } catch (error) {
    console.error(
      "[AI-CHAT-SUBSCRIPTION] Error processing subscription limit notification:",
      error
    );

    return res.status(500).json({
      success: false,
      message:
        "Internal server error while processing subscription notification",
      error: error instanceof Error ? error.message : "Unknown error",
    });
  }
};

// Apply rate limiting to the handler
export default withEmailOrIpRateLimitWithProgressiveDelay(handler);
