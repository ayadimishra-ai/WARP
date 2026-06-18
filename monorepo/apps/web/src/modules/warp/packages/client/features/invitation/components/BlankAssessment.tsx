import { Button, Card, Flex, Text } from "@mantine/core";
import { FormTypes, FormTypesPage } from "@/modules/warp/packages/shared/constants/app.constants";
import { useSearchParams } from "next/navigation";
import React, { useMemo } from "react";
import { useUserSession } from "../../../hooks/use-user-session";
import AddPageIcon from "../../../icons/AddPageIcon";
import {
  gotoDocumentRepository,
  sendInvitationLoadingStartedMessageNew,
  sendInvitationLoadingStartedMessageReport,
} from "../../../services/platform-window-message.service";
import {
  isUserAllowedAIFeature,
  postParentMessage,
} from "../../form/common-functions";
import AIUploadDocumentBtn from "../../form/components/AIUploadDocumentBtn";

const BlankAssessment: React.FC = () => {
  const searchParams = useSearchParams();
  const userSession = useUserSession();
  const formtype = searchParams?.get("formtype");

  const currentView = useMemo(() => {
    if (formtype === "assessments") return FormTypesPage.Assessment;
    if (formtype === "reports") return "reporting";
    return null;
  }, [formtype]);

  const handleStartAssessment = () => {
    if (isAIUser) {
      postParentMessage(
        sendInvitationLoadingStartedMessageReport(
          true,
          FormTypes.Assessment.toLowerCase()
        )
      );
    } else {
      postParentMessage(sendInvitationLoadingStartedMessageNew());
    }
  };

  const handleStartReport = () => {
    if (isAIUser) {
      postParentMessage(
        sendInvitationLoadingStartedMessageReport(
          true,
          FormTypes.Report.toLowerCase()
        )
      );
    } else {
      postParentMessage(sendInvitationLoadingStartedMessageNew());
    }
  };
  const handleUploadDocuments = () => {
    const formTypeString = Array.isArray(formtype) ? formtype[0] : formtype;
    postParentMessage(gotoDocumentRepository(formTypeString ?? "", "listing"));
  };

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
          onClick: handleStartAssessment,
        },
        secondary: {
          label: "UPLOAD DOCUMENTS",
          onClick: handleUploadDocuments,
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
          onClick: handleStartReport,
        },
        secondary: {
          label: "UPLOAD DOCUMENTS",
          onClick: handleUploadDocuments,
        },
      },
    },
  };
  const accessToken = searchParams?.get("accessToken");
  const isAIUser = isUserAllowedAIFeature(accessToken as string);

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
      <Text fz={30} lh={"24px"} c="#122F47" ta="center">
        {config.title}
      </Text>
      <Text fz={14} lh={"22px"} c="#444444" ta="center">
        {isAIUser ? config.AIDescription : config.nonAIDescription}
      </Text>
      {isAIUser && (
        <Card
          bg="linear-gradient(90deg, #F9DAFF, #DAF1FF)"
          radius={5}
          px="8px"
          py="10px"
        >
          <Text fz={12} lh="16px" c="#444" maw={743} ta="center">
            We recommend uploading documents first. Our AI will provide
            suggestions or pre-fill your responses by extracting data from your
            documents in all AI-enabled reports and assessments.
          </Text>
        </Card>
      )}
      <Flex
        gap={{ base: 24, xs: 24, sm: 36 }}
        justify="center"
        align="center"
        wrap="wrap"
      >
        {isAIUser ? (
          <AIUploadDocumentBtn
            label="UPLOAD DOCUMENT"
            onClick={handleUploadDocuments}
          />
        ) : (
          config.action.secondary && (
            <Button
              color="outlineBtn"
              radius="xl"
              onClick={config.action.secondary.onClick}
              styles={{
                root: {
                  "&:hover": {
                    backgroundColor: "#003B52",
                    borderColor: "#003B52",
                    color: "white",
                  },
                },
              }}
            >
              {config.action.secondary.label}
            </Button>
          )
        )}
        <Button onClick={config.action.primary.onClick} color="solidBtn">
          {config.action.primary.label}
        </Button>
      </Flex>
    </Flex>
  );
};

export default BlankAssessment;
