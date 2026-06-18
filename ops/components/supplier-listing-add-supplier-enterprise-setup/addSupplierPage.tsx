"use client";
import { Box, Button, Flex, Menu, Text } from "@mantine/core";
import { IconChevronDown } from "@tabler/icons-react";
import { useState } from "react";
import { apiClientWithAuth } from "~/lib/fetcher";
import {
  bulkUploadSupplierMaster,
  postParentMessage,
} from "~/shared/services/platform-window-message-service";
import SvgComponent from "../icons/AddUser_LocationPageIcon";

const AddSupplierPage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleDownloadTemplate = async () => {
    try {
      const res = await apiClientWithAuth.get(
        "/api/v1/master-data/activity/supplier-master/download-template"
      );
      const url = res?.data?.response?.url;
      const fileName = `Supplier Master.xlsx`;

      if (url) {
        const response = await fetch(url);
        const blob = await response.blob();
        const link = document.createElement("a");
        link.href = window.URL.createObjectURL(blob);
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  return (
    <Box
      style={{
        backgroundColor: "#F7F9FB",
        height: "70vh",
        width: "100vw",
        marginLeft: "-30px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 24px",
      }}
    >
      <Flex
        direction="column"
        align="center"
        justify="center"
        gap={20}
        style={{ width: "100%", maxWidth: 1240, marginLeft: 30 }}
      >
        <SvgComponent />

        <Text
          size="30px"
          fw={400}
          c="#173B5A"
          ta="center"
          style={{ lineHeight: 1.1, letterSpacing: "-0.02em" }}
        >
          Add Your Suppliers
        </Text>

        <Text
          size="13px"
          fw={400}
          c="#444444"
          ta="center"
          style={{ lineHeight: "22px", maxWidth: "920px" }}
        >
          {/* Click <b>Add New Supplier</b> to add a new supplier.  */}
          For bulk uploads, click <b> Upload Data</b> and download our sample
          template (supports .csv or .xls).
        </Text>

        <Flex align="center" justify="center" gap={28} wrap="wrap">
          <Menu
            shadow="0px 8px 24px rgba(15, 44, 66, 0.18)"
            width={232}
            position="bottom-start"
            offset={10}
            withArrow
            arrowSize={10}
            arrowPosition="center"
            withinPortal={false}
            styles={{
              arrow: {
                backgroundColor: "#000000",
                borderColor: "#000000",
              },
              dropdown: {
                padding: 12,
                borderRadius: 12,
                border: "1px solid #E4E8EC",
                backgroundColor: "#FFFFFF",
              },
              item: {
                borderRadius: 8,
                padding: "12px 18px",
                fontSize: 14,
                fontWeight: 500,
                color: "#5D6772",
              },
            }}
          >
            <Menu.Target>
              <Button
                variant="outline"
                color="#0C4A67"
                size="lg"
                fw={600}
                fz={13}
                h={46}
                px={22}
                radius="xl"
                rightSection={<IconChevronDown size={15} stroke={2.5} />}
                styles={{
                  root: {
                    borderColor: "#0C5A7A",
                    color: "#0F4762",
                    backgroundColor: "transparent",
                    letterSpacing: "0.16em",
                    boxShadow: "none",
                    minWidth: 196,
                  },
                  section: {
                    marginLeft: 6,
                  },
                }}
              >
                UPLOAD DATA
              </Button>
            </Menu.Target>

            <Menu.Dropdown>
              <Menu.Item
                // style={{
                //   background:
                //     "linear-gradient(90deg, #0C5A7A 0%, #163C59 100%)",
                //   color: "#FFFFFF",
                // }}
                onClick={() => {
                  postParentMessage(bulkUploadSupplierMaster());
                }}
              >
                Bulk Upload Data
              </Menu.Item>
              <Menu.Item onClick={handleDownloadTemplate}>
                Download Template
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>

          {/* <Button
            variant="unstyled"
            size="lg"
            fw={600}
            fz={13}
            h={46}
            px={26}
            radius="xl"
            loading={isLoading}
            onClick={() => {
              postParentMessage(addEditSupplierMaster(true, ""));
            }}
            className="noAnimationButton filledGradientButton"
            styles={{
              root: {
                minWidth: 214,
                letterSpacing: "0.16em",
              },
            }}
          >
            ADD NEW SUPPLIER
          </Button> */}
        </Flex>
      </Flex>
    </Box>
  );
};

export default AddSupplierPage;
