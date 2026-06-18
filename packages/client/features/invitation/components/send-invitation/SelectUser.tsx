import { Box, createStyles, Radio, Stack } from "@mantine/core";
import dayjs from "dayjs";
import SelectExistingUser from "./SelectExistingUser";
import SelectNewUser from "./SelectNewUser";
import { SendInvitationStep, useSendInvitationStore } from "./store";

const useStyles = createStyles((theme) => ({
  yearMonthPicker: {
    flexWrap: "nowrap",
  },
  actionButtons: {
    marginTop: 50,
  },
  rightSection: {
    width: "50%",
  },
}));

const SelectUser = () => {
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");

  const { classes } = useStyles();

  const { changeStep, step } = useSendInvitationStore((store) => {
    const { changeStep, step } = store;
    return {
      changeStep,
      step,
    };
  });

  const selectUser =
    step === "selectExistingUser" ? (
      <SelectExistingUser />
    ) : step === "selectNewUser" ? (
      <SelectNewUser />
    ) : null;

  const monthyear = {
    Month: dayjs().format("MM"),
    Year: dayjs().format("YYYY"),
  };

  return (
    <Stack p={10}>
      <Box>
        <Radio.Group
          onChange={changeStep}
          label="Select Partners for Assessment"
          defaultValue={SendInvitationStep.selectExistingUser}
          styles={{
            label: {
              fontSize: "14px",
              fontWeight: 500,
              color: "#444444",
            },
          }}
        >
          <Radio
            color="orange.5"
            value={SendInvitationStep.selectExistingUser}
            label="Existing Partner"
          />
          <Radio
            color="orange.5"
            value={SendInvitationStep.selectNewUser}
            label="New Partner"
          />
        </Radio.Group>
      </Box>
      {selectUser}
    </Stack>
  );
};
export default SelectUser;
