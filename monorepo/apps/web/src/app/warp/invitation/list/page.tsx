"use client";

import { Button, Container, Group, Title } from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useMediaQuery } from "@mantine/hooks";
import InvitationList from "@/modules/warp/packages/client/features/invitation/components/InvitationList";
import InvitationSideBar from "@/modules/warp/packages/client/features/invitation/components/InvitationSidebar";
import { useState } from "react";

const useStyles = createStyles(() => ({
  boxShadow: {
    boxShadow: "0 4px 6px rgb(0 0 0 / 10%)",
  },
  commonMargin: {
    margin: "10px 0",
  },
}));

function ActionHeading() {
  const { classes } = useStyles();
  const [opened, setOpened] = useState(false);
  const sideBarClickHandler = () => {
    setOpened(!opened);
  };

  return (
    <Group
      p={20}
      justify="space-between"
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
}

export default function InvitationListPage() {
  const smallScreen = useMediaQuery("(max-width: 800px)");
  return (
    <Container p={smallScreen ? 10 : 80} fluid>
      <ActionHeading />
      <InvitationList />
    </Container>
  );
}
