import { Box, Group, Radio, Stack } from "@mantine/core";
import { memo, useMemo } from "react";
import SelectExistingUser from "./SelectExistingUser";
import SelectNewUser from "./SelectNewUser";
import { SendInvitationStep, useSendInvitationStore } from "./store";

// Define radio options as a constant to prevent recreation
const RADIO_OPTIONS = [
  {
    value: SendInvitationStep.selectExistingUser,
    label: "Existing User",
  },
  {
    value: SendInvitationStep.selectNewUser,
    label: "New User",
  },
] as const;

// Memoized components to prevent unnecessary re-renders
const MemoizedSelectExistingUser = memo(SelectExistingUser);
const MemoizedSelectNewUser = memo(SelectNewUser);

const SelectUser = () => {
  // Get only what we need from the store
  const { changeStep, step } = useSendInvitationStore(
    useMemo(
      () => (store) => ({
        changeStep: store.changeStep,
        step: store.step,
      }),
      []
    )
  );

  // Memoize user component selection
  const UserComponent = useMemo(() => {
    switch (step) {
      case "selectExistingUser":
        return MemoizedSelectExistingUser;
      case "selectNewUser":
        return MemoizedSelectNewUser;
      default:
        return null;
    }
  }, [step]);

  return (
    <Stack px={25} gap={12} py={0}>
      <Box className="radio-group-btnC">
        <Radio.Group
          pt={8}
          onChange={(val) => changeStep(val as keyof typeof SendInvitationStep)}
          label="Select Users for Assessment"
          defaultValue={SendInvitationStep.selectExistingUser}
        >
          <Group mt="xs">
            {RADIO_OPTIONS.map(({ value, label }) => (
              <Radio key={value} color="orange.5" value={value} label={label} />
            ))}
          </Group>
        </Radio.Group>
      </Box>
      {UserComponent && <UserComponent />}
    </Stack>
  );
};

export default memo(SelectUser);
