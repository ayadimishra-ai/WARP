/**
 * DocumentGrid Component - Layout for document cards
 * 
 * Responsibilities:
 * - Map documents to cards
 * - Grid layout (SimpleGrid for responsive design)
 * - Filter controls matching old UI
 * 
 * Rules:
 * - No logic beyond layout
 * - Pure presentation
 * - Matches old implementation UI/UX
 */

import { ActionIcon, Box, Button, Center, Flex, SimpleGrid, Space, Text, TextInput } from "@mantine/core";
import { IconX } from "@tabler/icons-react";
import SearchInputIcon from "@/modules/warp/packages/client/components/svgIcons/SearchInputIcon";
import InfoItem from "@/modules/warp/components/embed/AIBasedSections/Common/InfoItem";
import { useState } from "react";
import {
  Document,
  DocumentTemplate,
  SubscriptionStatus,
} from "../domain/document.types";
import DocumentCard from "./DocumentCard";
interface DocumentGridProps {
  templates: DocumentTemplate[];
  documentsByTemplate: Map<string, Document | null>;
  uploadProgress: Map<string, number>;
  subscription: SubscriptionStatus;
  companyMetadata: any;
  searchTerm: string;
  showExpiredOnly: boolean;
  expiredCount: number;
  mainViewCount: number; // Count of non-expired templates for main view
  headingText: { mainHeading: string; subHeading: string }; // Dynamic heading text
  newExpiredCount?: number; // New expired documents count for badge (optional)
  hasViewedExpiredTab?: boolean; // Track if user has viewed expired tab (optional)
  onSearchChange: (term: string) => void;
  onToggleExpiredView: () => void;
  onDrop: (templateId: string, files: File[]) => void;
  onDelete: (documentId: string) => void;
  onProcessWithAI: (documentId: string) => void;
}

function DocumentGrid({
  templates,
  documentsByTemplate,
  uploadProgress,
  subscription,
  companyMetadata,
  searchTerm,
  showExpiredOnly,
  expiredCount,
  mainViewCount,
  headingText,
  newExpiredCount = 0,
  hasViewedExpiredTab = false,
  onSearchChange,
  onToggleExpiredView,
  onDrop,
  onDelete,
  onProcessWithAI,
}: DocumentGridProps) {
  const NumberOfDatainFirstRow: number = 8;
  const [showAll, setShowAll] = useState(false);
  const [showAllExpired, setShowAllExpired] = useState(false);
  const [isfocused, setisfocused] = useState(false);
  const toggleShowAll = () => setShowAll(!showAll);

  return (
    <Box>
      {/* Main Heading */}
      <InfoItem
        c="#122F47"
        fz="30px"
        lh="normal"
        fw={400}
        label={headingText.mainHeading}
        align="left"
      />
      <Space h={28} />
      {/* Start: Sub heading + search + tab switch */}
      <Flex align="center" justify="space-between" wrap={{ base: "wrap", md: "nowrap" }} gap={24}>
        <InfoItem
          c="#122F47"
          fz="20px"
          lh="normal"
          fw={400}
          label={headingText.subHeading}
          align="left"
        />
        <Flex align="center" justify="flex-end" wrap={{ base: "wrap", md: "nowrap" }} gap={24}>
          <TextInput
            variant="search"
            placeholder="Search Documents..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            w={{ base: "100%", md: 320 }}
            onFocus={() => setisfocused(true)}
            onBlur={() => setisfocused(false)}
            leftSection={<SearchInputIcon color={isfocused ? "#005C81" : "#666666"} />}
            rightSection={
              searchTerm && (
                <ActionIcon
                  size="xs"
                  variant="transparent"
                  onClick={() => onSearchChange("")}
                >
                  <IconX size={16} color={isfocused ? "#005C81" : "#666666"} />
                </ActionIcon>
              )
            }
            styles={{
              section: { marginLeft: 5 },
            }}
          />
          {expiredCount > 0 && (
            <Button
              color="outlineBtn"
              onClick={onToggleExpiredView}
            >
              {showExpiredOnly
                ? "View All Documents"
                : "View Expired Documents"}

              {!hasViewedExpiredTab && newExpiredCount !== 0 && (
                <Flex align="center" justify="center"
                  bg="#DD3E3E"
                  px={5}
                  ml={5}
                  h={18}
                  miw={18}
                  styles={{
                    root:{
                      borderRadius: 22,
                    }
                  }}
                >
                  <Text c="#fff" fz="xs" lh="22px">{newExpiredCount}</Text>
                </Flex>
              )}
            </Button>
          )}
        </Flex>
      </Flex>
      {/*End: Sub heading + search + tab switch */}
      <Space h={28} />

      {/* Grid */}
      <SimpleGrid
        cols={{ base: 1, sm: 2, md: 4 }}
        spacing={32}
        verticalSpacing={32}
      >
        {templates
          .slice(
            0,
            showExpiredOnly
              ? showAllExpired
                ? templates.length
                : 8
              : showAll
                ? templates.length
                : NumberOfDatainFirstRow
          )
          .map((template) => {
            const document = documentsByTemplate.get(template.id) || null;
            const progress = document
              ? uploadProgress.get(document.documentLogsId)
              : undefined;

            return (
              <DocumentCard
                key={template.id}
                template={template}
                document={document}
                uploadProgress={progress}
                subscription={subscription}
                companyMetadata={companyMetadata}
                onDrop={onDrop}
                onDelete={onDelete}
                onProcessWithAI={onProcessWithAI}
              />
            );
          })}
      </SimpleGrid>

      {/* Show More/Less Buttons */}
      {showExpiredOnly ? (
        // Show "Show More" button for expired documents if there are more than 8
        templates.length > 8 ? (
          <Center mt="xl">
            <Button
              color="outlineBtn"
              mb={30}
              onClick={() => setShowAllExpired(!showAllExpired)}
            >
              {showAllExpired
                ? "SHOW LESS"
                : `SHOW MORE (${templates.length - 8} MORE EXPIRED DOCUMENTS)`}
            </Button>
          </Center>
        ) : null
      ) : // Show "VIEW ALL SUGGESTED DOCUMENTS" button for non-expired documents
      templates.length > NumberOfDatainFirstRow ? (
        <Center mt="xl">
          <Button
            color="outlineBtn"
            mb={30}
            onClick={toggleShowAll}
          >
            {showAll
              ? "SHOW LESS"
              : `VIEW ALL ${templates.length} SUGGESTED DOCUMENTS`}
          </Button>
        </Center>
      ) : null}

      {/* Empty State */}
      {templates.length === 0 && (
         <Center h={300}>
          <Text c="#666" fz={18} my={40}>
            No Result Found
            </Text>
          </Center>
      )}
    </Box>
  );
}
export default DocumentGrid;
