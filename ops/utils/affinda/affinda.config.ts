import axios from "axios";
import { UUID } from "crypto";
import {
  AFFINDA_MAX_RETRIES,
  AFFINDA_RETRY_DELAY_MS,
  AFFINDA_TIMEOUT_MS,
} from "~/shared/constants/ai-constant";
import { getServerEnv } from "../env/env.server";
import { logger } from "../logger";

// Send file for processing in affinda. Processing will happen background and it will trigger api\v1\ai-file-processing-webhook once processing is done.
export const affindaSendFileForProcessing = async (
  document_url: string,
  fileId: UUID
) => {
  let attempt = 0;
  const env = await getServerEnv();
  if (
    !env.AFFINDA_API_URL ||
    !env.AFFINDA_API_KEY ||
    !env.AFFINDA_WORKSPACE_ID
  ) {
    throw new Error("Missing required affinda credentials.");
  }

  while (attempt < AFFINDA_MAX_RETRIES) {
    try {
      const response = await axios.post(
        `${env.AFFINDA_API_URL}documents`,
        {
          url: document_url,
          workspace: env.AFFINDA_WORKSPACE_ID,
          customIdentifier: fileId,
        },
        {
          headers: {
            Authorization: `Bearer ${env.AFFINDA_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: AFFINDA_TIMEOUT_MS,
        }
      );
      // Return the full response from Affinda API (success)
      return response.data;
    } catch (error: any) {
      attempt++;
      // If it's an Axios error and we have a response, return the error response after max retries
      if (attempt >= AFFINDA_MAX_RETRIES) {
        if (error?.response) {
          return error.response.data;
        }
        // Return the error object if no response is available
        return error;
      }
      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, AFFINDA_RETRY_DELAY_MS)
      );
    }
  }
};

// get Specific file details and extracted fields based on unique identifier
export const affindaGetFileDetails = async (identifier: string) => {
  let attempt = 0;
  const env = await getServerEnv();
  logger.info(
    "getting single file details from affinda - affindaGetFileDetails",
    { identifier }
  );
  while (attempt < AFFINDA_MAX_RETRIES) {
    try {
      const response = await axios.get(
        `${env.AFFINDA_API_URL}documents/${identifier}`,
        {
          headers: {
            Authorization: `Bearer ${env.AFFINDA_API_KEY}`,
            "Content-Type": "application/json",
          },
          timeout: AFFINDA_TIMEOUT_MS,
        }
      );
      // Return the full response from Affinda API (success)
      return response.data;
    } catch (error: any) {
      attempt++;
      // If it's an Axios error and we have a response, return the error response after max retries
      if (attempt >= AFFINDA_MAX_RETRIES) {
        if (error?.response) {
          return error.response.data;
        }
        // Return the error object if no response is available
        logger.error("Error getting file details from Affinda:", {
          error,
          errorStack: error instanceof Error ? error.stack : undefined,
        });
        return error;
      }
      // Wait before retrying
      await new Promise((resolve) =>
        setTimeout(resolve, AFFINDA_RETRY_DELAY_MS)
      );
    }
  }
};
