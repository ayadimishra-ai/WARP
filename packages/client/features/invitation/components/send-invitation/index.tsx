import { Box, createStyles } from "@mantine/core";
import { useEffect, useState } from "react";
import SelectCompany from "./SelectCompany";
import SelectForm from "./SelectForm";
import SelectUser from "./SelectUser";
import { useSendInvitationStore } from "./store";

const useStyles = createStyles((theme) => ({
  container: {
    overflow: "hidden", // Prevents scrollbars during animation
    position: "relative", // Ensure child positioning works properly
  },
  hide: {
    position: "absolute",
    right: "-120%",
    transition: "right 0.5s ease",
  },
  show: {
    position: "relative",
    right: "0",
    transition: "right 0.5s ease",
  },
}));

const SendInvitation = () => {
  const { classes } = useStyles();
  const [isVisible, setIsVisible] = useState(false);
  const step = useSendInvitationStore((store) => store.step);

  useEffect(() => {
    if (step === "selectExistingCompany" || step === "selectNewCompany") {
      setTimeout(() => setIsVisible(true), 100); // Delay visibility
    } else {
      setIsVisible(false); // Reset visibility for other steps
    }
  }, [step]);

  if (step === "selectForm") return <SelectForm />;
  if (step === "selectExistingCompany" || step === "selectNewCompany")
    return (
      <Box className={classes.container}>
        <Box className={isVisible ? classes.show : classes.hide}>
          <SelectCompany />
        </Box>
      </Box>
    );
  if (step === "selectExistingUser" || step === "selectNewUser")
    return (
      <Box>
        <SelectUser />
      </Box>
    );

  return <Box>Invalid Action</Box>;
};

export default SendInvitation;
