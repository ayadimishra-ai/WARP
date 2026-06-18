"use client";
import { Alert, Box, Button, Flex, Menu, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import { downloadMaterialMasterTemplate } from "@/modules/ghg/shared/services/material-master.service";
import {
  bulkUploadMaterial,
  postParentMessage
} from "@/modules/ghg/shared/services/platform-window-message-service";
import SvgComponent from "../icons/AddUser_LocationPageIcon";

interface AddMaterialPageProps {
  onAddNewMaterial?: () => void;
}

const AddMaterialPage = ({ onAddNewMaterial }: AddMaterialPageProps) => {
  const [isLoading, setIsLoading] = useState(false);

  return (
    <Box
      style={{
        backgroundColor: "#F7F9FB",
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
          Add Your Materials
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
          Click <Text component="span" fw={700}>Add New Material</Text> to add a new material. For bulk uploads, click <Text component="span" fw={700}>Upload Data</Text> and download our sample template (supports .csv or .xls).
        </Text>

        {/* Note Alert */}
        <Alert
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
            Material master data is required for emission calculations.
          </Text>
        </Alert>

        {/* Action Buttons */}
        <Flex gap={16} align="center">
          {/* Upload Data Button with Dropdown */}
          <Menu position="bottom" offset={5} width={200} shadow="md">
            <Menu.Target>
              <Button
                variant="outline"
                size="lg"
                fw={600}
                fz={14}
                h={48}
                px={32}
                radius="xl"
                rightSection={
                  <IconChevronDown
                    size={16}
                    stroke={2.5}
                    style={{ marginLeft: "3px" }}
                  />
                }
                styles={{
                  root: {
                    border: "2px solid #003B52",
                    color: "#003B52",
                    backgroundColor: "transparent",
                    fontWeight: 600,
                    letterSpacing: "0.15rem",
                  },
                }}
              >
                UPLOAD DATA
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                style={{ fontSize: "14px", color: "#666666" }}
                onClick={() => {
                  postParentMessage(bulkUploadMaterial());
                }}
                styles={{
                  item: {
                    "&:hover, &:active, &[data-hovered]": {
                      background: "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                      color: "#FFFFFF",
                    },
                  },
                }}
              >
                Bulk Upload Data
              </Menu.Item>
              <Menu.Item
                style={{ fontSize: "14px", color: "#666666" }}
                onClick={() => {
                  downloadMaterialMasterTemplate();
                }}
                styles={{
                  item: {
                    "&:hover, &:active, &[data-hovered]": {
                      background: "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                      color: "#FFFFFF",
                    },
                  },
                }}
              >
                Download Template
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
          {/* Out of scope for current sprint */}
          {/* Add New Material Button */}
          {/* <Button
            variant="unstyled"
            size="lg"
            fw={600}
            fz={14}
            h={48}
            px={32}
            radius="xl"
            loading={isLoading}
            onClick={() => {
              postParentMessage(addEditMaterial(true, ""));
            }}
            className="noAnimationButton filledGradientButton"
            styles={{
              root: {
                letterSpacing: "0.15rem",
              },
            }}
          >
            ADD NEW MATERIAL
          </Button> */}
        </Flex>
      </Flex>
    </Box>
  );
};

export default AddMaterialPage;
