import {
  Accordion,
  ActionIcon,
  Box,
  Group,
  Text,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { IconChevronDown, IconCircle } from "@tabler/icons-react";
import React, { useMemo } from "react";

const useStyles = createStyles((theme) => ({
  accordionWrapper: {
    height: "100%",
    padding: "15px",
    background: "#F8F9FB",
  },
  accordionControl: {
    padding: "10px 0",
  },
  accordionIcon: {
    marginRight: "10px",
  },
  activeAccordionItem: {
    backgroundColor: "#EDF0F8",
    borderRadius: "4px",
  },
}));

interface TabSidebarProps {
  tabs: any[];
  steps: any[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  getAnswersByQuestionId: (questionId: string) => any[];
}

export const TabSidebar: React.FC<TabSidebarProps> = ({
  tabs,
  steps,
  activeTab,
  setActiveTab,
  getAnswersByQuestionId,
}) => {
  const { classes } = useStyles();

  const renderSections = useMemo(() => {
    return steps.map((section) => {
      // Filter questions for this section
      const sectionQuestions = tabs.filter(
        (tab) => tab.group_id === section.id
      );

      // Skip empty sections
      if (!sectionQuestions.length) return null;

      const getSubSection = (
        subQuestions: any[],
        subHierarchyLevel: number
      ) => {
        return subQuestions.map((question) => {
          const answers = getAnswersByQuestionId(question.id);
          const isAnswered = answers?.some(
            (a) => a.value !== undefined && a.value !== null && a.value !== ""
          );

          return (
            <Accordion.Item
              key={question.id}
              value={question.id}
              className={
                activeTab === question.id ? classes.activeAccordionItem : ""
              }
            >
              <Group justify="space-between">
                <Accordion.Control
                  onClick={() => setActiveTab(question.id)}
                  className={classes.accordionControl}
                >
                  <Group>
                    <ActionIcon
                      color={isAnswered ? "green" : "gray"}
                      variant="transparent"
                      size="xs"
                    >
                      <IconCircle size={10} />
                    </ActionIcon>
                    <Text>{question.title}</Text>
                  </Group>
                </Accordion.Control>
              </Group>
            </Accordion.Item>
          );
        });
      };

      return (
        <Accordion.Item key={section.id} value={section.id}>
          <Group justify="space-between">
            <Accordion.Control className={classes.accordionControl}>
              <Group>
                <Text fw={500}>{section.title}</Text>
              </Group>
            </Accordion.Control>
            <ActionIcon className={classes.accordionIcon}>
              <IconChevronDown size={16} />
            </ActionIcon>
          </Group>
          <Accordion.Panel>
            <Accordion>{getSubSection(sectionQuestions, 1)}</Accordion>
          </Accordion.Panel>
        </Accordion.Item>
      );
    });
  }, [activeTab, classes, getAnswersByQuestionId, setActiveTab, steps, tabs]);

  return (
    <Box className={classes.accordionWrapper}>
      <Accordion defaultValue={["item-0"]} multiple>
        {renderSections}
      </Accordion>
    </Box>
  );
};
