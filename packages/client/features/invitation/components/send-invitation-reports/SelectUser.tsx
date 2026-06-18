import { Stack } from "@mantine/core";
import { memo } from "react";
import SelectNewUser from "./SelectNewUser";

// Memoize the SelectNewUser component
const MemoizedSelectNewUser = memo(SelectNewUser);

const SelectUser = () => {
  return (
    <Stack px={10} p={0}>
      <MemoizedSelectNewUser />
    </Stack>
  );
};

export default memo(SelectUser);
