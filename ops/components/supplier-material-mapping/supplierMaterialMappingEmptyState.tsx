"use client";

import { Box, Button, Flex, Menu, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import {
  bulkUploadSupplierMaterialMapping,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import SvgComponent from "../icons/AddUser_LocationPageIcon";

interface SupplierMaterialMappingEmptyStateProps {
  onDownloadTemplate: () => void;
}

const SupplierMaterialMappingEmptyState = ({
  onDownloadTemplate,
}: SupplierMaterialMappingEmptyStateProps) => {
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

        <Text
          size="30px"
          fw={400}
          c="#122F47"
          ta="center"
          style={{ lineHeight: "24px" }}
        >
          No Supplier & Material Data
        </Text>

        <Text
          size="14px"
          fw={400}
          c="#666666"
          ta="center"
          style={{ lineHeight: "22px" }}
        >
          Upload your supplier and material data to enable supplier mapping.
          Download our sample template to see the required format.
          <br></br> Supported file formats: .csv or .xls.
        </Text>

        <Flex gap="md">
          {/* Upload Data Dropdown */}
          <Menu shadow="md" width={200}>
            <Menu.Target>
              <Button
                variant="outline"
                color="#003B52"
                fw={600}
                fz={14}
                h={52}
                lts="0.15rem"
                radius="xl"
                className="noAnimationButton outlineButtonHover"
                rightSection={<IconChevronDown size={16} />}
              >
                UPLOAD DATA
              </Button>
            </Menu.Target>
            <Menu.Dropdown>
              <Menu.Item
                onClick={() =>
                  postParentMessage(bulkUploadSupplierMaterialMapping())
                }
              >
                Bulk Upload Data
              </Menu.Item>
              <Menu.Item onClick={onDownloadTemplate}>
                Download Template
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default SupplierMaterialMappingEmptyState;
