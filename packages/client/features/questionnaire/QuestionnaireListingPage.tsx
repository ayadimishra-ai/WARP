import { Box, Button, Container, Flex, Stack } from "@mantine/core";
import { IconPlus } from "@tabler/icons";
import React from "react";
import {
  QuestionnaireFilters,
  QuestionnairePagination,
  QuestionnaireTable,
} from "./components";
import { AssignModal } from "./components/AssignModal";
import { DownloadModal } from "./components/DownloadModal";
import { UploadModal } from "./components/UploadModal";
import {
  QuestionnaireModalProvider,
  useQuestionnaireModalContext,
} from "./context/QuestionnaireModalProvider";
import { useQuestionnaireFilters, useQuestionnaireList } from "./hooks";

// Create a wrapper component to use the context
const QuestionnaireContent: React.FC = () => {
  const { filters } = useQuestionnaireFilters();
  const { refetch, loading } = useQuestionnaireList(filters);
  const { isUploadModalOpen, openCreateModal } = useQuestionnaireModalContext();

  const handleRefresh = async () => {
    try {
      // Force a hard refresh by calling refetch with a new timestamp
      await refetch({
        ...filters,
      });
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  return (
    <Container fluid>
      <Stack spacing="lg">
        {/* Debug info */}
        {/* <Text size="xs" c="dimmed">
          Modal state: {isUploadModalOpen ? "Open" : "Closed"}
        </Text> */}

        {/* Header */}
        <Flex gap="md" align="center">
          {/* <Button
              leftIcon={<IconRefresh size={16} />}
              onClick={handleRefresh}
              loading={loading}
            >
              Refresh
            </Button> */}

          {/* Filters */}
          <Box style={{ flex: 1 }}>
            <QuestionnaireFilters />
          </Box>
          <Button
            color="solidBtn"
            leftIcon={<IconPlus size={16} />}
            onClick={openCreateModal}
          >
            Create New
          </Button>
        </Flex>

        {/* Main Table */}
        <QuestionnaireTable />

        {/* Pagination */}
        <QuestionnairePagination />
      </Stack>

      {/* UI-only Modals at the parent level */}
      <UploadModal />
      <DownloadModal />
      <AssignModal />
    </Container>
  );
};

export const QuestionnaireListingPage: React.FC = () => {
  return (
    <QuestionnaireModalProvider>
      <QuestionnaireContent />
    </QuestionnaireModalProvider>
  );
};
