"use client";
import { Stack } from "@mantine/core";
import MaterialListingTable from "~/components/common-table/materialListingTable";

const MaterialListingPage = () => {
  return (
    <Stack px={30} py={0}>
      <div>
        <MaterialListingTable />
      </div>
    </Stack>
  );
};

export default MaterialListingPage;
