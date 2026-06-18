"use client";

import { Box } from "@mantine/core";
import MainLayout from "@/modules/warp/packages/client/layouts/MainLayout";
import { useEffect } from "react";

export default function TestPage() {
  useEffect(() => {
    try {
      if (typeof window !== "undefined") {
        const message = JSON.stringify({
          type: "warp-check-localStorage-access",
          data: { success: !!window.localStorage },
        });
        window.parent?.postMessage(message, "*");
      }
    } catch (error) {
      const err = JSON.stringify(error, Object.getOwnPropertyNames(error));
      const message = JSON.stringify({
        type: "warp-check-localStorage-access",
        data: { success: false },
        error: err,
      });
      window.parent?.postMessage(message, "*");
    }
  }, []);

  return (
    <MainLayout>
      <Box>Test Page</Box>
    </MainLayout>
  );
}
