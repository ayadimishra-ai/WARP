import axios, { AxiosRequestHeaders } from "axios";
import { clientEnv } from "@/modules/ghg/utils/env/env.client";

export const initServerOPFetcher = (token: string) =>
  axios.create({
    baseURL: new URL(clientEnv.NEXT_PUBLIC_API_BASE_URL).origin,
    headers: {
      "Content-Type": "application/json",
      "x-sk-op-authorization": `${token}`,
    },
  });

export const clientOPFetcher = axios.create({
  baseURL: new URL(clientEnv.NEXT_PUBLIC_API_BASE_URL).origin,
  headers: {
    "Content-Type": "application/json",
  },
});

clientOPFetcher.interceptors.request.use((config) => {
  const token =
    typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  if (token) {
    if (!config.headers) config["headers"] = {} as AxiosRequestHeaders;
    config.headers.set("x-sk-op-authorization", `${token}`);
  }

  return config;
});
