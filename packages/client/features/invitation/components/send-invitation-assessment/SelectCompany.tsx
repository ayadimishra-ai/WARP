import { Box, createStyles, Radio, Stack } from "@mantine/core";
import type { FC } from "react";
import { memo, useMemo } from "react";
import SelectExistingCompany from "./SelectExistingCompany";
import SelectNewCompany from "./SelectNewCompany";
import { SendInvitationStep, useSendInvitationStore } from "./store";

// Only define styles that are actually used
const useStyles = createStyles(() => ({
  // Removed unused styles
}));

// Memoized radio options for better performance
const RADIO_OPTIONS = [
  {
    value: SendInvitationStep.selectExistingCompany,
    label: "Existing Partners",
  },
  {
    value: SendInvitationStep.selectNewCompany,
    label: "New Partners",
  },
] as const;

const SelectCompany: FC = () => {
  const { classes } = useStyles();

  const { changeStep, step, formId } = useSendInvitationStore((store) => ({
    changeStep: store.changeStep,
    step: store.step,
    formId: store.formId,
  }));

  // Effect to reset step when formId changes
  // useEffect(() => {
  //   if (formId) {
  //     changeStep(SendInvitationStep.selectExistingCompany);
  //   }
  // }, [formId, changeStep]);

  // Memoize the company component selection
  const CompanyComponent = useMemo(() => {
    switch (step) {
      case "selectExistingCompany":
        return SelectExistingCompany;
      case "selectNewCompany":
        return SelectNewCompany;
      default:
        return null;
    }
  }, [step]);

  return (
    <Stack px={25} spacing={12} py={0}>
      <Box className="radio-group-btnC">
        <Radio.Group
          //key={formId} // Reset radio group when formId changes
          onChange={changeStep}
          label="Select Partners for Assessment"
          defaultValue={SendInvitationStep.selectExistingCompany}
          value={step}
          pt={8}
          styles={{
            label: {
              fontSize: "14px",
              fontWeight: 500,
              color: "#444444",
            },
          }}
        >
          {RADIO_OPTIONS.map(({ value, label }) => (
            <Radio
              key={value}
              color="orange.5"
              value={value}
              label={label}
              style={{ cursor: "pointer" }}
            />
          ))}
        </Radio.Group>
      </Box>
      {CompanyComponent && <CompanyComponent />}
    </Stack>
  );
};

export default memo(SelectCompany);
