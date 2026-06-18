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
import { IconX } from "@tabler/icons";
import SearchInputIcon from "@warp/client/components/svgIcons/SearchInputIcon";
import InfoItem from "@warp/web/pages/embed/AIBasedSections/Common/InfoItem";
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
      <Flex align="center" justify="space-between" wrap="nowrap">
        <InfoItem
          c="#122F47"
          fz="20px"
          lh="normal"
          fw={400}
          label={headingText.subHeading}
          align="left"
        />
        <Flex align="center" justify="flex-end" gap={30} wrap="nowrap">
          <TextInput
            placeholder="Search Documents..."
            value={searchTerm}
            onChange={(event) => onSearchChange(event.currentTarget.value)}
            w={320}
            h={36}
            onFocus={() => setisfocused(true)}
            onBlur={() => setisfocused(false)}
            icon={<SearchInputIcon color={isfocused ? "#005C81" : "#666666"} />}
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
              input: {
                border: `1px solid ${isfocused ? "#005C81" : "#F1F3F6"}`,
                borderRadius: 30,
                fontSize: "14px",
                backgroundColor: "#F1F3F6",
                color: "#495057",
                paddingRight: 30,
                "&::placeholder": { color: "#666666" },
                "&:hover": {
                  borderColor: "#005C81 !important",
                }
              },
              icon: { marginLeft: 5 },
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
                <Box
                  bg="#DD3E3E"
                  px={5}
                  ml={5}
                  h={18}
                  miw={18}
                  sx={{
                    borderRadius: 22,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontSize: 10,
                    letterSpacing: 0,
                    lineHeight: "22px",
                  }}
                >
                  {newExpiredCount}
                </Box>
              )}
            </Button>
          )}
        </Flex>
      </Flex>
      {/*End: Sub heading + search + tab switch */}
      <Space h={28} />

      {/* Grid */}
      <SimpleGrid
        cols={4}
        spacing={32}
        verticalSpacing={32}
        breakpoints={[
          {
            minWidth: "xs",
            cols: 1,
          },
          {
            minWidth: "sm",
            cols: 2,
          },
          {
            minWidth: "md",
            cols: 4,
          },
        ]}
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
