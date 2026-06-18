import { Box, Radio, Stack } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import SelectExistingCompany from "./SelectExistingCompany";
import SelectNewCompany from "./SelectNewCompany";
import { SendInvitationStep, useSendInvitationStore } from "./store";

import dayjs from "dayjs";

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

const SelectCompany = () => {
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

  const selectCompany =
    step === "selectExistingCompany" ? (
      <SelectExistingCompany />
    ) : step === "selectNewCompany" ? (
      <SelectNewCompany />
    ) : null;

  const monthyear = {
    Month: dayjs().format("MM"),
    Year: dayjs().format("YYYY"),
  };

  return (
    <Stack p={10}>
      <Box className="radio-group-btnC">
        <Radio.Group
        pt={8}
          onChange={changeStep}
          label="Select Partners for Assessment"
          styles={{
            label: {
              fontSize: "14px",
              fontWeight: 500,
              color: "#444444",
            },
          }}
          defaultValue={SendInvitationStep.selectExistingCompany}
        >
          <Radio
            color="orange.5"
            value={SendInvitationStep.selectExistingCompany}
            label="Existing Partners"
            style={{ cursor: "pointer", color: "#444444" }}
          />
          <Radio
            color="orange.5"
            value={SendInvitationStep.selectNewCompany}
            label="New Partners"
            style={{ cursor: "pointer", color: "#444444" }}
          />
        </Radio.Group>
      </Box>
      {selectCompany}
    </Stack>
  );
};

export default SelectCompany;
