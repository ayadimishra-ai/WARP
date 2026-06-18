"use client";

import { Box, MantineProvider } from "@mantine/core";
import { MantineEmotionProvider, emotionTransform } from "@mantine/emotion";
import { NotificationsProvider } from "@/modules/warp/packages/client/compat/mantine-v8-compat";
import { warpContentSize } from "@/modules/warp/packages/client/services/platform-window-message.service";
import { theme } from "@/modules/warp/packages/client/themes";
import { ClientProvider } from "@/modules/warp/packages/graphql/provider";
import { useEffect } from "react";
import GlobalStyles from "./GlobalStyles";

export default function WarpClientShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    const ro = new ResizeObserver((e) => {
      window.parent?.postMessage(warpContentSize(e[0].contentRect.height), "*");
    });
    ro.observe(document.body);
    return () => {
      ro.disconnect();
    };
  }, []);

  return (
    <Box>
      <ClientProvider>
        <MantineProvider theme={theme} stylesTransform={emotionTransform}>
          <MantineEmotionProvider>
            <GlobalStyles />
            <NotificationsProvider position="top-right" zIndex={2077} />
            {children}
          </MantineEmotionProvider>
        </MantineProvider>
      </ClientProvider>
    </Box>
  );
}
