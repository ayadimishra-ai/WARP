import { Button, Flex, Text } from "@mantine/core";
import {
  LockedpageLink,
  postParentMessage,
} from "@warp/client/services/platform-window-message.service";
import { FormTypesPage } from "@warp/shared/constants/app.constants";
import { useRouter } from "next/router";
import React, { useMemo } from "react";
import AddPageIcon from "../../../icons/AddPageIcon";

const LockIcon = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={24}
    height={24}
    fill="currentColor"
    className="icon icon-tabler icons-tabler-filled icon-tabler-lock"
    {...props}
  >
    <path fill="none" d="M0 0h24v24H0z" />
    <path d="M12 2a5 5 0 0 1 5 5v3a3 3 0 0 1 3 3v6a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-6a3 3 0 0 1 3-3V7a5 5 0 0 1 5-5m0 12a2 2 0 0 0-1.995 1.85L10 16a2 2 0 1 0 2-2m0-10a3 3 0 0 0-3 3v3h6V7a3 3 0 0 0-3-3" />
  </svg>
);

const BlankAssessmentLockActions: React.FC = () => {
  const router = useRouter();
  const formtype = router.pathname.split("/").pop();

  const currentView = useMemo(() => {
    if (formtype === "assessments") return FormTypesPage.Assessment;
    if (formtype === "reports") return "reporting";
    return null;
  }, [formtype]);

  interface ActionConfig {
    primary: {
      label: string;
      onClick: () => void;
    };
    secondary?: {
      label: string;
      onClick: () => void;
    };
  }

  interface ViewConfig {
    title: string;
    nonAIDescription: string;
    action: ActionConfig;
    AIDescription: string;
  }

  const viewConfig: Record<"assessment" | "reporting", ViewConfig> = {
    assessment: {
      title: "Start Your First Assessment",
      nonAIDescription:
        "To begin, select an assessment and assign it to self, partner, or vendor.",
      AIDescription:
        "To begin, select an assessment and assign it to self, partner, or vendor.",
      action: {
        primary: {
          label: "START ASSESSMENT",
          onClick: () => {},
        },
        secondary: {
          label: "UPLOAD DOCUMENTS",
          onClick: () => {},
        },
      },
    },
    reporting: {
      title: "Start Your First Report",
      nonAIDescription:
        "To begin, select a reporting framework and assign it to self or internal users.",
      AIDescription:
        "To begin, select a reporting framework and assign it to self or internal users.",
      action: {
        primary: {
          label: "START NEW REPORT",
          onClick: () => {},
        },
        secondary: {
          label: "UPLOAD DOCUMENTS",
          onClick: () => {},
        },
      },
    },
  };
  // const { query } = useRouter();
  // const { accessToken } = query;
  // const isAIUser = isUserAllowedAIFeature(accessToken as string);

  if (!currentView) return null;

  const config = viewConfig[currentView as "assessment" | "reporting"];

  return (
    <Flex
      mt={{ base: 15, lg: 35 }}
      gap={30}
      justify="center"
      align="center"
      direction="column"
    >
      <AddPageIcon />
      <Text size={30} lh={"24px"} c="#122F47" ta="center">
        {config.title}
      </Text>
      <Text size={14} lh={"22px"} c="#444444" ta="center">
        {config.nonAIDescription}
      </Text>
      <Flex
        gap={{ base: 24, xs: 24, sm: 36 }}
        justify="center"
        align="center"
        wrap="wrap"
      >
        {config.action.secondary && (
          <Button
            color="outlineBtn"
            radius="xl"
            onClick={() => {
              postParentMessage(LockedpageLink());
            }}
            styles={{
              root: {
                opacity: 0.5,
                // "&:hover":
                // {
                //   backgroundColor: "#003B52",
                //   borderColor: "#003B52",
                //   color: "white",
                // },
              },
            }}
            rightIcon={<LockIcon />}
          >
            {config.action.secondary.label}
          </Button>
        )}
        <Button
          onClick={() => {
            postParentMessage(LockedpageLink());
          }}
          color="solidBtn"
          rightIcon={<LockIcon />}
          styles={{
            root: {
              opacity: 0.5,
            },
          }}
        >
          {config.action.primary.label}
        </Button>
      </Flex>
    </Flex>
  );
};

export default BlankAssessmentLockActions;
