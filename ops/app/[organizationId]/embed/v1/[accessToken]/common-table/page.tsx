"use client";
import { Stack } from "@mantine/core";
import LocationListingTable from "~/components/common-table/locationListingTable";
import UserListingTable from "~/components/common-table/userListingTable";

const CommonTablePage = () => {
  return (
    <Stack px={0} py={30}>
      <div>
        <h2 style={{ marginBottom: "20px", color: "#444444" }}>
          List of Users
        </h2>
        <UserListingTable />
      </div>
      <div>
        <h2 style={{ marginBottom: "20px", color: "#444444" }}>
          List of Locations
        </h2>
        <LocationListingTable />
      </div>
    </Stack>
  );
};

export default CommonTablePage;
