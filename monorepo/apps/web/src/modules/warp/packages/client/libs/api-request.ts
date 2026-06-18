import { getAppApiUrl } from "@/modules/warp/packages/configs/api.config";
import { secretsManagerService } from "@/modules/warp/packages/secrets";
import { getLocalStorageSession } from "@/modules/warp/packages/shared/utils/auth-session.util";
import axios from "axios";

const baseURL = getAppApiUrl() ?? "";

const apiRequest = axios.create({
  baseURL,
  timeout: 1000 * 30,
});

apiRequest.interceptors.request.use(async (config) => {
  try {
    // On server-side (Next.js API routes), window is undefined
    if (typeof window === "undefined") {
      // AI_SERVICES_AUTHORIZATION lives in AWS Secrets Manager, not process.env.
      // Read from the cached secrets; fall back to a fresh load if the cache is cold.
      let token = secretsManagerService.getCachedSecret(
        "AI_SERVICES_AUTHORIZATION"
      );
      if (!token) {
        token = await secretsManagerService.getSecret(
          "AI_SERVICES_AUTHORIZATION"
        );
      }
      config.headers["x-ai-services-authorization"] = token ?? "";
      return config;
    }
    // Client-side logic (browser)
    const userSession = getLocalStorageSession(window.localStorage);

    if (config.headers && !!userSession?.accessToken) {
      config.headers["Authorization"] = `Bearer ${userSession.accessToken}`;
    }
  } catch (error) {
    console.log("WARP : Error", "apiRequest.interceptors", error);
  }

  return config;
});

export { apiRequest };
