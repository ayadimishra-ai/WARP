"use client";
import { Stack } from "@mantine/core";
import UserListingTable from "~/components/common-table/userListingTable";

const CommonTablePage = () => {
  return (
    <Stack px={30} py={0}>
      <div>
        <UserListingTable />
      </div>
    </Stack>
  );
};

export default CommonTablePage;
