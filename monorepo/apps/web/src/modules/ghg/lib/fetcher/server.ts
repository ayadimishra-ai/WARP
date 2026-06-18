import axios, { type AxiosRequestHeaders } from "axios";
import { getServerEnv } from "@/modules/ghg/utils/env/env.server";

export const getSnowkapServicesApiClient = async () => {
  const env = await getServerEnv();

  const snowkapServicesApiClient = axios.create({
    baseURL: env.NEXT_PUBLIC_SITE_API_BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });

  snowkapServicesApiClient.interceptors.request.use((config) => {
    if (env.SK_SERVICES_AUTH_TOKEN) {
      if (!config.headers) config["headers"] = {} as AxiosRequestHeaders;
      config.headers.set("Authorization", env.SK_SERVICES_AUTH_TOKEN);
    }

    return config;
  });
  return snowkapServicesApiClient;
};
