"use client";

import { useFetch } from "@mantine/hooks";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { initServerOPFetcher } from "./app-fetcher";

export const useOPFetcher_GET = function <T>(url: string) {
  const searchParams = useSearchParams();
  const accessToken = searchParams?.get("accessToken");

  return useFetch<T>(url, {
    headers: {
      "Content-Type": "application/json",
      "x-sk-op-authorization": `${accessToken}`,
    },
  });
};

export const useOPFetcher_POST = function <T>(url: string) {
  const searchParams = useSearchParams();
  const accessToken = searchParams?.get("accessToken");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);
  const [data, setData] = useState<T | null>(null);

  const execute = async (body: any, signal?: AbortSignal) => {
    try {
      setLoading(true);
      const fetcher = initServerOPFetcher(accessToken || "");

      const data = await fetcher
        .post<T>(url, body, { signal, data: body })
        .then((res) => res.data);

      setData(data);
      setError(null);
    } catch (error) {
      setError(error);
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, execute };
};
