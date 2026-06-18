import { sdk } from "@warp/graphql/generated/server";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

interface ApiResponse {
  enabledChatWithSnowkapAI: boolean;
  subscription?: any;
  message?: string;
}

const getChatWithSnowkapAIStatusHandler: NextApiHandler = async (
  req: NextApiRequest,
  res: NextApiResponse<ApiResponse>
) => {
  // Set CORS headers
  // AITODO: remove below setHeader
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS"
  );
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // Handle OPTIONS preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST method
  if (req.method !== "POST") {
    return res.status(405).json({
      enabledChatWithSnowkapAI: false,
      message: "Method not allowed. Only POST requests are supported.",
    });
  }

  try {
    // Get userId and companyId from req.data
    const { userId, companyId } = JSON.parse((req as any).body || {});

    if (!userId || !companyId) {
      return res.status(400).json({
        enabledChatWithSnowkapAI: false,
        message: "userId and companyId are required in req.data",
      });
    }

    // Query for active subscription using data from client's localStorage
    const subscriptionData = await sdk.GetActiveSubscriptionByCompanyId({
      companyId,
      userId,
    });

    // Check if there are active user allocations
    const hasActiveSubscription =
      subscriptionData?.AIChatSubscription &&
      subscriptionData.AIChatSubscription.length > 0 &&
      subscriptionData.AIChatSubscription[0]?.AIChatUserAllocations &&
      subscriptionData.AIChatSubscription[0].AIChatUserAllocations.length > 0;

    if (hasActiveSubscription) {
      return res.status(200).json({
        enabledChatWithSnowkapAI: true,
        message: "Active subscription found",
      });
    }

    // No active subscription found
    return res.status(200).json({
      enabledChatWithSnowkapAI: false,
      message: "No active subscription found",
    });
  } catch (error: any) {
    console.error("Error checking chat with Snowkap AI status:", error);
    return res.status(500).json({
      enabledChatWithSnowkapAI: false,
      message: "Internal server error",
    });
  }
};

export default getChatWithSnowkapAIStatusHandler;
