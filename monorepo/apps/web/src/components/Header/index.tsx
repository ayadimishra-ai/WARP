"use client";

import { useState, useRef, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { Group, Box, Text, Menu, Avatar, ActionIcon } from "@mantine/core";
import { IconSettings, IconLogout, IconInfoCircle } from "@tabler/icons-react";

const getUserInitials = (name: string = "Guest User") => {
  const initials = name
    .split(" ")
    .map((word) => word[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return initials || "GU";
};

const getPageTitle = (pathname: string) => {
  const pathTitles: { [key: string]: string } = {
    "/": "Overview",
    "/dashboard": "Dashboard",
    "/monthly-activity": "Monthly Activity Data",
    "/my-profile": "My Profile",
    "/suppliers": "My Suppliers"
  };

  return pathTitles[pathname] || "Overview";
};

export function Header() {
  // TODO: Replace with actual user name from authentication context
  const userName = "Sneha Gawas";
  const pathname = usePathname();
  const pageTitle = getPageTitle(pathname || "/");

  const hoverStyle = {
    transition: "background 0.3s ease",
    ":hover": {
      background:
        "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%) !important"
    }
  };

  return (
    <Box
      component="header"
      px={32}
      py={16}
      style={{ background: "#fff", borderBottom: "1px solid #f3f4f6" }}
    >
      <Group align="center" justify="space-between">
        <Group align="center" gap={8}>
          <Text fz={20} fw={500} c="#0D4D5E">
            {pageTitle}
          </Text>
          <ActionIcon variant="subtle" color="gray" title="Information">
            <IconInfoCircle size={20} />
          </ActionIcon>
        </Group>
        <Menu shadow="md" width={200} position="bottom-end">
          <Menu.Target>
            <Avatar
              size={40}
              radius={40}
              style={{
                background: "#0E97E7",
                cursor: "pointer",
                fontWeight: 500,
                transition: "background 0.3s ease",
                ":hover": {
                  background:
                    "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%) !important"
                }
              }}
              color="#ffffff"
            >
              {getUserInitials(userName)}
            </Avatar>
          </Menu.Target>
          <Menu.Dropdown>
            <Menu.Item
              component={Link}
              href="/myaccount"
              leftSection={<IconSettings size={16} />}
              style={{
                transition: "background 0.3s ease",
                ":hover": {
                  background:
                    "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%) !important",
                  color: "white"
                }
              }}
            >
              My Account
            </Menu.Item>
            <Menu.Item
              color="red"
              leftSection={<IconLogout size={16} />}
              style={{
                transition: "background 0.3s ease",
                ":hover": {
                  background:
                    "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%) !important",
                  color: "white"
                }
              }}
              onClick={() => {
                // TODO: Implement actual sign-out logic (e.g., clearing tokens, session)
                // Redirect to sign-in page
                window.location.href = "/signin";
              }}
            >
              Sign Out
            </Menu.Item>
          </Menu.Dropdown>
        </Menu>
      </Group>
    </Box>
  );
}
