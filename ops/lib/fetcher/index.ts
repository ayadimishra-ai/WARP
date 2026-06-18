import axios, { type AxiosRequestHeaders } from "axios";
import { clientEnv } from "~/utils/env/env.client";

export const apiClient = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

export const apiClientWithAuth = axios.create({
  baseURL: clientEnv.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// attach token dynamically to each request
apiClientWithAuth.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token) {
    if (!config.headers) config["headers"] = {} as AxiosRequestHeaders;
    config.headers.set("x-sk-op-authorization", `${token}`);
  }

  return config;
});
