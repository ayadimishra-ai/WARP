"use client";
import { Box } from "@mantine/core";
import dynamic from "next/dynamic";

const Sidebar = dynamic(() => import("~/components/ghg-dashboard/Sidebar"), {
  ssr: false,
});
const SidebarPage = () => {
  return (
    <Box>
      <Sidebar />
    </Box>
  );
};
export default SidebarPage;
