import { Box, createStyles } from "@mantine/core";
import { memo } from "react";
import SelectCompany from "./SelectCompany";
import SelectForm from "./SelectForm";
import SelectUser from "./SelectUser";
import { useSendInvitationStore } from "./store";

const useStyles = createStyles(() => ({
  container: {
    overflow: "hidden",
    position: "relative",
    minHeight: "100vh",
  },
}));

// Define step types for better type safety
type StepType =
  | "selectForm"
  | "selectExistingCompany"
  | "selectNewCompany"
  | "selectExistingUser"
  | "selectNewUser";

const SelectFormComponent = memo(() => <SelectForm />);
SelectFormComponent.displayName = "SelectFormComponent";

const SendInvitationAssessment = () => {
  const { classes } = useStyles();
  const step = useSendInvitationStore((store) => store.step) as StepType;

  const renderContent = () => {
    // Always render SelectForm
    const selectForm = <SelectFormComponent />;

    switch (step) {
      case "selectForm":
        return selectForm;

      case "selectExistingCompany":
      case "selectNewCompany":
        return (
          <div>
            {selectForm}
            <Box mt={0}>
              <SelectCompany />
            </Box>
          </div>
        );

      case "selectExistingUser":
      case "selectNewUser":
        return (
          <div>
            {selectForm}
            <Box mt={0}>
              <SelectUser />
            </Box>
          </div>
        );

      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return <Box className={classes.container}>{content}</Box>;
};

export default memo(SendInvitationAssessment);
