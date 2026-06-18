import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import axios from "axios";
import jwt from "jsonwebtoken";
import { NextApiHandler } from "next";
import { secretsManagerService } from "@/modules/warp/packages/secrets";

const raraDocumentRatingDirectHandler: NextApiHandler = async (req, res) => {
  let session;
  if (!!req?.headers?.authorization) {
    const accessToken = String(req.headers.authorization);
    try {
      const decodedToken: any = jwt.verify(accessToken, process.env.HASURA_GRAPHQL_JWT_SECRET!);
      session = parseHasuraClaims(decodedToken, accessToken);
    } catch {
      // invalid token — session stays undefined
    }
  }
  if (!session) {
    return res.status(401).json({
      error: {
        message: "Unauthorized",
      },
    });
  }

  // Extract only document processing parameters from client
  const { company_name, document_key, document_url, company_size, document_log_id } =
    req.body as {
      company_name: string;
      document_key: string;
      document_url: string;
      company_size: string;
      document_log_id?: string;
    };

  // Fetch RARA configuration from GlobalMaster table
  let url = "";
  let auth_key = "";

  try {
    // Use SDK to fetch GlobalMaster data
    const globalMasterData = await sdk.getGlobalMasterByTypeList({
      type: ["Rara_integration"],
    });

    // Extract RARA configuration from GlobalMaster
    const raraData = globalMasterData?.GlobalMaster?.find(
      (master: any) => master.type === "Rara_integration"
    );

    if (raraData?.data) {
      const raraCheckConfig = raraData.data.find(
        (config: any) => config.name === "rara-check"
      );
      if (raraCheckConfig) {
        url = raraCheckConfig.url || "";
        auth_key = raraCheckConfig.authkey || "";
      }
    }
  } catch (error) {
    console.error("Error fetching RARA config from GlobalMaster:", error);
  }

  // Validate RARA configuration from GlobalMaster
  if (!url || !auth_key) {
    console.error("RARA configuration not found in GlobalMaster table");
    return res.status(500).json({
      error: {
        message: "RARA service configuration error",
        details: "GlobalMaster configuration missing or invalid",
      },
    });
  }

  // Validate client parameters
  if (!document_url || !company_name || !document_key) {
    return res.status(400).json({
      error: {
        message: "Missing required parameters",
        details: "document_url, company_name, and document_key are required",
      },
    });
  }

  try {
    console.log(`Starting RARA document rating API call for: ${document_url}`);

    // Prepare API payload - only include document_log_id if it's provided and not empty
    const apiPayload: any = {
      document_url,
      company_name,
      document_key,
      company_size: company_size || "large",
    };

    // Only add document_log_id if it's provided and not empty/null/undefined
    if (document_log_id && document_log_id.trim() !== "") {
      apiPayload.document_log_id = document_log_id;
    }
    const warpSecret_AIServiceAuth = await secretsManagerService.getSecret("AI_SERVICES_AUTHORIZATION");
    // Call the external RARA API
    const ratingResponse = await axios({
      method: "POST",
      url: url,
      data: apiPayload,
      headers: {
        "Content-Type": "application/json",
        Authorization: auth_key,
        "x-ai-services-authorization":
          warpSecret_AIServiceAuth ?? "",
      },
    });

    console.log("RARA API response received successfully");

    // Convert document_rating from string to number if it's a string
    const responseData = ratingResponse.data;
    if (responseData && typeof responseData.document_rating === "string") {
      const ratingNumber = parseInt(responseData.document_rating);
      if (!isNaN(ratingNumber)) {
        responseData.document_rating = ratingNumber;
        console.log(
          "Converted document_rating from string to number:",
          ratingNumber
        );
      } else {
        console.warn(
          "Could not convert document_rating to number:",
          responseData.document_rating
        );
      }
    }

    return res.status(200).json({
      success: true,
      data: responseData,
    });
  } catch (error: any) {
    console.error("RARA API call failed:", {
      message: error?.message,
      status: error?.response?.status,
      statusText: error?.response?.statusText,
      data: error?.response?.data,
    });

    return res.status(500).json({
      error: {
        message: "Failed to call RARA API",
        details:
          error?.response?.data?.error?.message ||
          error?.message ||
          "Unknown error",
      },
    });
  }
};

const handler: NextApiHandler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(raraDocumentRatingDirectHandler, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);

export default handler;

export const dynamic = "force-dynamic";
