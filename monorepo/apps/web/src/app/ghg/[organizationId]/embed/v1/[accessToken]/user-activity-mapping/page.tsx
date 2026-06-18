"use client";
import { Stack } from "@mantine/core";
import UserAndActivityMapping from "@/modules/ghg/components/common-table/userAndActivityMapping";

const UserAndActivityMappingTable = () => {
  return (
    <Stack px={30} py={0}>
      <UserAndActivityMapping />
    </Stack>
  );
};

export default UserAndActivityMappingTable;
