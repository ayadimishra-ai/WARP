"use client";

import { Box, Button, Flex, Menu, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import {
  bulkUploadSupplierLocationMaster,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";
import SvgComponent from "../icons/AddUser_LocationPageIcon";

interface SupplierLocationMasterEmptyStateProps {
  onDownloadTemplate: () => void;
}

const SupplierLocationMasterEmptyState = ({
  onDownloadTemplate,
}: SupplierLocationMasterEmptyStateProps) => {
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
          Add Your Supplier Locations
        </Text>

        <Text
          size="14px"
          fw={400}
          c="#666666"
          ta="center"
          style={{ lineHeight: "22px" }}
        >
          Click <b>Add New Supplier Location</b> to add a new supplier location.
          For bulk uploads, click <b>Upload Data</b> and download our sample
          template <br></br> (supports .csv or .xlsx).
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
                  postParentMessage(bulkUploadSupplierLocationMaster())
                }
              >
                Bulk Upload Data
              </Menu.Item>
              <Menu.Item onClick={onDownloadTemplate}>
                Download Template
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* Add New Supplier Location Button */}
          {/* <Button
            variant="unstyled"
            fw={600}
            className="noAnimationButton filledGradientButton"
            fz={14}
            h={52}
            lts="0.15rem"
            radius="xl"
            style={{ borderRadius: 30 }}
            // onClick={() =>
            //   postParentMessage(addEditSupplierLocationMaster(true, ""))
            // }
          >
            ADD NEW SUPPLIER LOCATION
          </Button> */}
        </Flex>
      </Flex>
    </Box>
  );
};

export default SupplierLocationMasterEmptyState;
