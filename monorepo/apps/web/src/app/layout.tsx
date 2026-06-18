import type { Metadata } from "next";
import "./globals.css";
import "@mantine/core/styles.css";
import { MantineProvider } from "@mantine/core";
import { Notifications } from "@mantine/notifications";
import "@mantine/notifications/styles.css";
import LayoutWrapper from "@/components/LayoutWrapper";
import { ApolloProvider } from "@/lib/apollo/client-provider";
import { getClientEnv } from "@/lib/env/env.client";

export const metadata: Metadata = {
  title: "Snowkap",
  description: "ESG and Sustainability Management Platform",
};

const theme = {
  fontFamily: "Euclid Circular B",
};
console.log("Layout");

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const env = await getClientEnv();

  return (
    <html lang="en">
      <body>
        <MantineProvider theme={theme}>
          <Notifications position="top-right" mr={13} />
          <LayoutWrapper>
            {children}
          </LayoutWrapper>
        </MantineProvider>
      </body>
    </html>
  );
}
