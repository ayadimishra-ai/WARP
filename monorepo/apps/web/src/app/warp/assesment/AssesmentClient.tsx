"use client";

import { Flex, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import type { AuthSessionType } from "@/modules/warp/packages/shared/types/auth.types";
import { useEffect } from "react";

type Props = {
  session: AuthSessionType | null;
};

export default function AssesmentClient({ session }: Props) {
  const userAccessDetails: any[] = (session as any)?.userAccessDetails ?? [];

  useEffect(() => {
    try {
      if (userAccessDetails.length > 0) {
        localStorage.setItem(
          "warp_user_access_token",
          userAccessDetails[0].warpUserAccessToken
        );
      } else {
        localStorage.setItem("warp_user_access_token", "");
      }
    } catch (error) {
      console.log("WARP : Error", "Pages>Assesment", error);
    }
  });

  if (userAccessDetails.length > 0) {
    return <div>Singed in</div>;
  }

  return (
    <Flex
      direction="column"
      align="center"
      justify="center"
      style={{ height: "95vh" }}
    >
      <Stack
        gap="md"
        align="center"
        p={40}
        style={{
          marginTop: "-2em",
          background: "#FFE1D3",
          borderRadius: 10,
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
        }}
      >
        <IconAlertCircle size="4.5rem" color="#AC0B0B" />
        <Title order={4} c="#AC0B0B">
          Session Expired
        </Title>

        <Text size="md" mb="md">
          Your session has expired. Please log in again to continue.
        </Text>
      </Stack>
    </Flex>
  );
}
