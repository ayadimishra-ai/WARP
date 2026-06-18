import { Box, createStyles } from "@mantine/core";
import { memo } from "react";
import SelectForm from "./SelectForm";
import SelectUser from "./SelectUser";
import { useSendInvitationStore } from "./store";

const useStyles = createStyles(() => ({
  container: {
    overflow: "hidden",
    position: "relative",
  },
}));

// Define step types for better type safety
type StepType = "selectForm" | "selectExistingUser" | "selectNewUser";

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

      case "selectExistingUser":
      case "selectNewUser":
        return (
          <>
            {selectForm}
            <SelectUser />
          </>
        );

      default:
        return null;
    }
  };

  const content = renderContent();
  if (!content) return null;

  return (
    <Box className={classes.container} style={{ height: 660 }}>
      {content}
    </Box>
  );
};

export default memo(SendInvitationAssessment);
