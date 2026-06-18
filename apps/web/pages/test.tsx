import { Box } from "@mantine/core";
import MainLayout from "@warp/client/layouts/MainLayout";
import { NextPageType } from "@warp/client/types/page-types";
import { useEffect } from "react";

const TestPage: NextPageType = ({}) => {
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

  return <Box>Test Page</Box>;
};

TestPage.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>;
};

TestPage.title = "Test";

export default TestPage;
