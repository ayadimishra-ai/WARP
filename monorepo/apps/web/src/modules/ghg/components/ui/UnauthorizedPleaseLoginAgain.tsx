"use client";
import { Flex, Stack, Text, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import {
  postParentMessage,
  sessionLogoutLoginLink,
} from "@/modules/ghg/shared/services/platform-window-message-service";

const UnauthorizedPleaseLoginAgain = () => {
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
        <Title
          order={4}
          style={{
            fontWeight: 600,
            color: "#AC0B0B",
          }}
        >
          Session Expired
        </Title>

        <Text size="md" mb="md">
          Your session has expired. Please{" "}
          <a
            href="#"
            style={{ color: "#0066CC", textDecoration: "none" }}
            onClick={() => postParentMessage(sessionLogoutLoginLink())}
          >
            log in
          </a>{" "}
          again to continue.
        </Text>
      </Stack>
    </Flex>
  );
};

export default UnauthorizedPleaseLoginAgain;
