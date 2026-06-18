"use client";
import { Stack } from "@mantine/core";
import LocationListingTable from "~/components/common-table/locationListingTable";

const CommonTablePage = () => {
  return (
    <Stack px={30} py={0}>
      <div>
        <LocationListingTable />
      </div>
    </Stack>
  );
};

export default CommonTablePage;
