"use client";
import { Alert, Box, Button, Flex, Text } from "@mantine/core";
import { useState } from "react";
import {
  addEditUser,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import SvgComponent from "../icons/AddUser_LocationPageIcon";

interface AddUserPageProps {
  onAddNewUser?: () => void;
}

const AddUserPage = ({ onAddNewUser }: AddUserPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Box
      style={{
        backgroundColor: "#F7F9FB",
        // border: "1px solid #E9ECEF",
        height: "100vh",
        width: "100vw",
        marginLeft: "-30px",
      }}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap={32}
        pt={100}
      >
        <SvgComponent />

        {/* Title */}
        <Text
          size="30px"
          fw={400}
          c="#122F47"
          ta="center"
          style={{
            lineHeight: "24px",
          }}
        >
          Add Your Users
        </Text>

        {/* Description */}
        <Text
          size="14px"
          fw={400}
          c="#666666"
          ta="center"
          style={{
            lineHeight: "22px",
          }}
        >
          Click the button below to add a new user. Once you add them, they will
          appear here.
        </Text>

        {/* Note Alert */}
        <Alert
          // icon={<IconInfoCircle size={16} style={{ marginRight: 0 }} />}
          color="orange"
          variant="light"
          radius="md"
          style={{
            height: 32,
            backgroundColor: "#FFE1D3",
            border: "1px solid #FFE1D3",
            maxWidth: "max-content",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
          styles={{
            icon: {
              color: "#FF9800",
            },
            message: {
              color: "#444444",
              fontSize: "12px",
              fontWeight: 400,
            },
          }}
        >
          <Text size="12px" fw={400}>
            <Text component="span" fw={700}>
              Note:
            </Text>{" "}
            Users data is required for user and activity mapping.
          </Text>
        </Alert>

        {/* Add New User Button */}
        <Button
          variant="unstyled"
          size="lg"
          fw={600}
          fz={14}
          h={48}
          px={32}
          radius="xl"
          loading={isLoading}
          onClick={() => {
            postParentMessage(addEditUser(true, ""));
          }}
          className="noAnimationButton filledGradientButton"
        >
          ADD NEW USER
        </Button>
      </Flex>
    </Box>
  );
};

export default AddUserPage;
