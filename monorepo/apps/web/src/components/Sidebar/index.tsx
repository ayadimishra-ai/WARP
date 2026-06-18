"use client";

import { Box, Stack, NavLink, rem } from "@mantine/core";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Icons } from "../Icons";

interface ChildMenuItem {
  label: string;
  href: string;
}

interface SubMenuItem {
  label: string;
  href: string;
  children?: ChildMenuItem[];
}

interface NavItem {
  label: string;
  href: string;
  icon: keyof typeof Icons;
  submenu?: SubMenuItem[];
}

const navItems: NavItem[] = [
  {
    label: "DASHBOARD",
    href: "/dashboard",
    icon: "grid",
    submenu: [
      {
        label: "ESG OVERVIEW",
        href: "/dashboard/esg",
        children: [
          { label: "ESG Child 1", href: "/dashboard/esg/child1" },
          { label: "ESG Child 2", href: "/dashboard/esg/child2" }
        ]
      },
      { label: "GHG OVERVIEW", href: "/dashboard/ghg" },
      { label: "SCOPE 1, 2, 3 OVERVIEW", href: "/dashboard/scope" },
      { label: "REDUCTION OVERVIEW", href: "/dashboard/reduction" },
      { label: "REPORTS OVERVIEW", href: "/dashboard/reports" },
      { label: "EXCHANGE OVERVIEW", href: "/dashboard/exchange" },
      { label: "NOTIFICATIONS", href: "/dashboard/notifications" },
      { label: "GOALS", href: "/dashboard/goals" }
    ]
  },
  { label: "ASSESS", href: "/assess", icon: "clipboard" },
  { label: "MEASURE", href: "/measure", icon: "gauge" },
  { label: "ANALYSE", href: "/analyse", icon: "chart" },
  { label: "REDUCE", href: "/reduce", icon: "trending-down" },
  { label: "REPORT", href: "/report", icon: "file-text" },
  { label: "EXCHANGE", href: "/exchange", icon: "exchange" },
  { label: "SETTINGS", href: "/settings", icon: "settings" }
];

export function Sidebar() {
  const pathname = usePathname() ?? "/";
  const [openTray, setOpenTray] = useState<string | null>(null);
  const [activeSubMenu, setActiveSubMenu] = useState<string | null>(null);

  const activeNav =
    navItems.find((item) => pathname.startsWith(item.href)) || navItems[0];
  const handleOpenTray = (href: string) => setOpenTray(href);
  const handleCloseTray = () => {
    setOpenTray(null);
    setActiveSubMenu(null);
  };
  const isTrayOpen = !!openTray;
  const currentNav = navItems.find((item) => item.href === openTray);
  const currentSubMenu = currentNav?.submenu?.find(
    (sub) => sub.href === activeSubMenu
  );

  return (
    <Box
      style={{
        display: "flex",
        minHeight: "100vh",
        borderRight: "1px solid #e9ecef",
        position: "relative"
      }}
    >
      <Stack
        gap={0}
        style={{
          width: 80,
          borderRight: "1px solid #e9ecef",
          background: "#fff",
          alignItems: "center",
          paddingTop: rem(24),
          zIndex: 20
        }}
      >
        <Box mb={rem(32)}>
          <Link
            href="/dashboard"
            style={{ display: "block", cursor: "pointer" }}
          >
            <Image
              src="https://login.snowkap.com/CompanySymbol.svg"
              alt="Snowkap Logo"
              width={48}
              height={48}
              priority
            />
          </Link>
        </Box>
        <Stack gap={8} style={{ width: "100%", alignItems: "center" }}>
          {navItems.map((item) => {
            const isActive = activeNav.href === item.href;
            const Icon = Icons[item.icon];
            return (
              <NavLink
                key={item.href}
                label={
                  <span style={{ fontSize: 10, fontWeight: 500 }}>
                    {item.label.split(" ")[0]}
                  </span>
                }
                leftSection={<Icon width={24} height={24} />}
                component={Link}
                href={item.href}
                active={isActive}
                variant={isActive ? "filled" : "subtle"}
                color={isActive ? "#003b52" : "gray"}
                styles={{
                  root: {
                    width: 48,
                    height: 48,
                    marginBottom: 4,
                    justifyContent: "center",
                    borderRadius: isActive ? "4px" : 0,
                    background: isActive
                      ? "linear-gradient(91.49deg, #005c81 6.27%, #122f47 93.39%)"
                      : "transparent"
                  },
                  section: {
                    marginRight: 0,
                    marginInlineEnd: 0,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }
                }}
                onMouseEnter={() => handleOpenTray(item.href)}
                onClick={() => handleOpenTray(item.href)}
                title={item.label}
              />
            );
          })}
        </Stack>
      </Stack>
      {/* Tray (submenu links only, no menu title) */}
      {isTrayOpen && currentNav && (
        <Box
          style={{
            position: "absolute",
            left: 80,
            top: 0,
            height: "100%",
            width: 260,
            background: "#fff",
            borderRight: "1px solid #e9ecef",
            boxShadow: "0 0 16px rgba(0,0,0,0.04)",
            zIndex: 30,
            paddingTop: rem(24)
          }}
          onMouseEnter={() => handleOpenTray(currentNav.href)}
          onMouseLeave={handleCloseTray}
        >
          <Stack gap={4} px={8}>
            {currentNav.submenu &&
              currentNav.submenu.map((subItem) => {
                const isSubItemActive = pathname === subItem.href;
                const hasChildren = !!subItem.children;
                return (
                  <NavLink
                    key={subItem.href}
                    label={subItem.label}
                    component={Link}
                    href={subItem.href}
                    active={isSubItemActive}
                    rightSection={
                      hasChildren ? (
                        <span style={{ fontSize: 12 }}>▶</span>
                      ) : undefined
                    }
                    onMouseEnter={() =>
                      hasChildren
                        ? setActiveSubMenu(subItem.href)
                        : setActiveSubMenu(null)
                    }
                    onFocus={() =>
                      hasChildren
                        ? setActiveSubMenu(subItem.href)
                        : setActiveSubMenu(null)
                    }
                    style={{ fontWeight: 500, fontSize: 14 }}
                  />
                );
              })}
          </Stack>
        </Box>
      )}
      {/* Child Menu Tray (third panel) */}
      {isTrayOpen &&
        currentNav &&
        currentSubMenu &&
        currentSubMenu.children && (
          <Box
            style={{
              position: "absolute",
              left: 340,
              top: 0,
              height: "100%",
              width: 220,
              background: "#fff",
              borderRight: "1px solid #e9ecef",
              boxShadow: "0 0 16px rgba(0,0,0,0.04)",
              zIndex: 40,
              paddingTop: rem(24)
            }}
            onMouseEnter={() => setActiveSubMenu(currentSubMenu.href)}
            onMouseLeave={handleCloseTray}
          >
            <Stack gap={4} px={8}>
              {currentSubMenu.children.map((child) => {
                const isChildActive = pathname === child.href;
                return (
                  <NavLink
                    key={child.href}
                    label={child.label}
                    component={Link}
                    href={child.href}
                    active={isChildActive}
                    style={{ fontWeight: 500, fontSize: 14 }}
                  />
                );
              })}
            </Stack>
          </Box>
        )}
    </Box>
  );
}
