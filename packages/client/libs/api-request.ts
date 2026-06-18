import { getAppApiUrl } from "@warp/configs/api.config";
import { getLocalStorageSession } from "@warp/shared/utils/auth-session.util";
import axios from "axios";

const baseURL = getAppApiUrl() ?? "";

const apiRequest = axios.create({
  baseURL,
  timeout: 1000 * 30,
});

apiRequest.interceptors.request.use((config) => {
  try {
    // On server-side (Next.js API routes), window is undefined
    if (typeof window === "undefined") {
      // Add server-side headers
      if (config.headers) {
        config.headers["x-ai-services-authorization"] =
          process.env["AI_SERVICES_AUTHORIZATION"] ?? "";
      }
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
