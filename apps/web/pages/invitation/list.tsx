import { Button, Container, createStyles, Group, Title } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import InvitationList from "@warp/client/features/invitation/components/InvitationList";
import InvitationSideBar from "@warp/client/features/invitation/components/InvitationSidebar";
import { NextPageType } from "@warp/client/types/page-types";
import { useState } from "react";

//download
const useStyles = createStyles((theme) => ({
  boxShadow: {
    boxShadow: "0 4px 6px rgb(0 0 0 / 10%)",
  },
  commonMargin: {
    margin: "10px 0",
  },
}));

const ActionHeading = ({}) => {
  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);
  const sideBarClickHandler = () => {
    setOpened(!opened);
  };

  return (
    <Group
      p={20}
      position="apart"
      className={[classes.boxShadow, classes.commonMargin].join(" ")}
    >
      <Title order={2}>Assessments</Title>
      <Button onClick={sideBarClickHandler} color="orange.5">
        Assign Survey
      </Button>
      <InvitationSideBar
        closeSidebarHandler={sideBarClickHandler}
        sideBarOpenedState={opened}
      />
    </Group>
  );
};

const InvitationListPage: NextPageType = ({}) => {
  const smallScreen = useMediaQuery("(max-width: 800px)");
  return (
    <Container p={smallScreen ? 10 : 80} fluid>
      <ActionHeading />
      <InvitationList />
    </Container>
  );
};

InvitationListPage.title = "Home";

export default InvitationListPage;
