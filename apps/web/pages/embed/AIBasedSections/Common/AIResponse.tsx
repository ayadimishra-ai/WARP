import {
  Anchor,
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Menu,
  Paper,
  Text,
} from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { capitalize } from "@warp/client/features/form/common-functions";
import ExportButtonIcon from "@warp/client/icons/ExportButtonIcon";
import LinkIcon from "@warp/client/icons/LinkIcon";
import {
  DOCUMENT_TYPE_COLORS,
  getDocumentTypeLabel,
  getSourceColor,
} from "@warp/shared/constants/ai.constants";
import { AI_DATA_SOURCES } from "@warp/shared/constants/app.constants";
import {
  AIResponseProps,
  DocumentType,
  SubscriptionFeatures,
} from "@warp/shared/types/ai.types";
import { domSanitiseValue } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";
import { useMemo, useState } from "react";
import {
  handleExportJSON,
  handleExportPDFWithContainer,
} from "./ExportPdfJson";

/**
 * Generate source legend based on subscription features.
 * This function creates an array of available source types based on what
 * the company's subscription allows (hasDocumentRepo, hasESG, hasBRSR).
 *
 * @param features - The subscription features object
 * @returns Array of available source types with their labels and colors
 */
const getSubscriptionBasedSourceLegend = (features?: SubscriptionFeatures) => {
  const availableSources = [];

  if (features?.hasDocumentRepo) {
    availableSources.push({
      documentType: DocumentType.DOCUMENT_REPO,
      label: AI_DATA_SOURCES.COMPANY_DOCUMENTS.label,
      color: DOCUMENT_TYPE_COLORS.company_documents, // Light orange/beige
    });
  }

  if (features?.hasESG) {
    availableSources.push({
      documentType: DocumentType.ESG_DOCUMENTS,
      label: AI_DATA_SOURCES.ESG_DOCUMENTS.label,
      color: DOCUMENT_TYPE_COLORS.esg_documents, // Light green
    });
  }

  if (features?.hasBRSR) {
    availableSources.push({
      documentType: DocumentType.BRSR_DOCUMENTS,
      label: AI_DATA_SOURCES.BRSR_DOCUMENTS.label,
      color: DOCUMENT_TYPE_COLORS.brsr_documents, // Light blue
    });
  }

  return availableSources;
};

const AIResponse: React.FC<AIResponseProps> = ({
  content,
  sources,
  queryType,
  metadata,
  userQuery,
  features,
}) => {
  // Check if content is from getDummyResponse sample (contains governance scores comparison)
  const hasActualResponse = content && content.trim().length > 0;

  // Export loading states
  const [isExportingPDF, setIsExportingPDF] = useState(false);
  const [isExportingJSON, setIsExportingJSON] = useState(false);
  // Deduplicate sources to show only unique files (prefer source_file_id, fallback to file_name+page)
  const uniqueSources = useMemo(() => {
    if (!sources?.length) return [];

    const seenKeys = new Set<string>();

    return sources.filter((sourceItem) => {
      const dedupeKey = `${sourceItem.file_name ?? ""}|${
        sourceItem.file_url ?? ""
      }`;

      if (!dedupeKey || seenKeys.has(String(dedupeKey))) return false;
      seenKeys.add(String(dedupeKey));
      return true;
    });
  }, [sources]);

  const subscriptionLegend = getSubscriptionBasedSourceLegend(features);

  // Export handlers
  const handlePDFExport = async () => {
    if (isExportingPDF) return;

    try {
      setIsExportingPDF(true);

      // Prepare results object
      const results = {
        query_type: capitalize(queryType || ""),
        answer: content,
        sources: sources || [],
        metadata: metadata || { query_id: Date.now() },
        confidence: metadata?.confidence,
        processing_time_ms: metadata?.processing_time_ms,
      };

      await handleExportPDFWithContainer(
        results,
        userQuery,
        ".aiChatResponseContent",
      );
    } catch (error) {
      console.error("PDF export failed:", error);
      alert("Failed to export PDF. Please try again.");
    } finally {
      setIsExportingPDF(false);
    }
  };

  const handleJSONExport = () => {
    if (isExportingJSON) return;

    try {
      setIsExportingJSON(true);

      // Prepare results object
      const results = {
        query_type: capitalize(queryType || ""),
        answer: content,
        sources: sources || [],
        metadata: metadata || { query_id: Date.now() },
        confidence: metadata?.confidence,
        processing_time_ms: metadata?.processing_time_ms,
      };

      handleExportJSON(results, userQuery);
    } catch (error) {
      console.error("JSON export failed:", error);
      alert("Failed to export JSON. Please try again.");
    } finally {
      setIsExportingJSON(false);
    }
  };

  const getExpiryStatus = (
    documentType: string,
    expiryDate: string | null,
  ): {
    isExpired: boolean;
  } => {
    if (documentType !== "document_repo" || !expiryDate) {
      return { isExpired: false };
    }

    const today = new Date();
    const expiry = new Date(expiryDate);
    const timeDiff = expiry.getTime() - today.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    const isExpired = daysDiff < 0;
    return { isExpired };
  };

  const smallScreen = useMediaQuery("(max-width: 1282px)");
  const midScreen = useMediaQuery("(max-width: 1480px)");

  return (
    <Paper
      className={
        hasActualResponse ? "aiChatResponseContent" : "aiChatNoResponseContent"
      }
    >
      {hasActualResponse && (
        <Flex align="center" justify="space-between" mb="xs" pl={5}>
          <Paper bg="#E7F3F8" radius={20} px={15} h={29}>
            <Text
              fz={smallScreen ? 14 : 15}
              c="#444444"
              fw={600}
              lh="29px"
            >{`${capitalize(queryType || "")} Output`}</Text>
          </Paper>
          <Menu
            shadow="md"
            width={188}
            position="bottom-end"
            offset={6}
            trigger="hover"
            openDelay={100}
            closeDelay={400}
            arrowOffset={15}
            withArrow
            withinPortal
            styles={{
              arrow: {
                width: "0px !important",
                height: "0px !important",
                borderLeft: "9px solid transparent !important",
                borderRight: "9px solid transparent !important",
                borderBottom: "9px solid #003B52 !important",
                transform: "rotate(0deg) !important",
                top: "-9px !important",
              },
              itemLabel: {
                color: "#666666",
                fontSize: 14,
                lineHeight: "16px",
              },
              item: {
                "&:hover": {
                  background:
                    "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                  "& .mantine-Menu-itemLabel": {
                    color: "#ffffff !important",
                  },
                },
              },
            }}
          >
            <Menu.Target>
              <Button color="solidBtn" leftIcon={<ExportButtonIcon />}>
                Export
              </Button>
            </Menu.Target>
            <Menu.Dropdown
              styles={{
                label: {
                  color: "red",
                  fontSize: 14,
                  lineHeight: "16px",
                },
              }}
            >
              <Menu.Item
                onClick={handlePDFExport}
                disabled={isExportingPDF || isExportingJSON}
              >
                {isExportingPDF ? "Exporting PDF..." : "Export As PDF"}
              </Menu.Item>
              <Menu.Item
                onClick={handleJSONExport}
                disabled={isExportingPDF || isExportingJSON}
              >
                {isExportingJSON ? "Exporting JSON..." : "Export As JSON"}
              </Menu.Item>
            </Menu.Dropdown>
          </Menu>
        </Flex>
      )}
      <div
        dangerouslySetInnerHTML={{ __html: domSanitiseValue(content) }}
        style={{ maxWidth: "100%" }}
      />

      {/* Sources Section */}
      {subscriptionLegend &&
        subscriptionLegend.length > 0 &&
        sources &&
        sources.length > 0 && (
          <Box>
            <Flex align="center" gap={20} mb={10}>
              <Text fz={smallScreen ? 14 : 16} weight={400} c="#003B52">
                Source References
              </Text>
              {/* Display subscription-based legend if available, otherwise fall back to actual sources */}
              {subscriptionLegend.length > 0
                ? subscriptionLegend.map((sourceType) => (
                    <Flex key={sourceType.documentType} align="center" gap={6}>
                      <Paper bg={sourceType.color} radius="xl" w={14} h={14} />
                      <Text fz={14} c="#626262">
                        {sourceType.label}
                      </Text>
                    </Flex>
                  ))
                : Array.from(
                    new Set((uniqueSources || []).map((s) => s.document_type)),
                  ).map((documentType) => (
                    <Flex key={documentType} align="center" gap={6}>
                      <Paper
                        bg={getSourceColor(documentType)}
                        radius="xl"
                        w={14}
                        h={14}
                      />
                      <Text fz={14} c="#626262">
                        {getDocumentTypeLabel(documentType)}
                      </Text>
                    </Flex>
                  ))}
            </Flex>
            <Group spacing="xs">
              {uniqueSources?.map((source, index) => {
                const { isExpired } = getExpiryStatus(
                  source.document_type,
                  source.expiry_date,
                );
                return (
                  <Box
                    key={`${source.source_file_id}-${index}`}
                    sx={{
                      cursor: "unset",
                    }}
                  >
                    <Anchor
                      type="button"
                      h="auto"
                      line-clamp={1}
                      c="#101010"
                      bg={getSourceColor(source.document_type)}
                      p={midScreen ? "4px 10px" : "6px 10px"}
                      underline={false}
                      fz={midScreen ? 12 : 14}
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                        borderRadius: 5,
                        "&:hover": {
                          filter: "brightness(1.08)",
                        },
                      }}
                      onClick={() => {
                        if (source.file_url) {
                          // For PDF files, append page number to URL for direct navigation
                          const url = source.file_url
                            .toLowerCase()
                            .includes(".pdf")
                            ? `${source.file_url}#page=${source.page_number}`
                            : source.file_url;
                          window.open(url, "_blank");
                        }
                      }}
                      title={source.file_name}
                    >
                      {source.file_name && source.file_name.length > 25
                        ? source.file_name.slice(0, 25) + "..."
                        : source.file_name}{" "}
                      {isExpired && (
                        <Badge
                          h="18px"
                          size="xs"
                          variant="filled"
                          bg="#DD3E3E"
                          c="#fff"
                          fz={smallScreen ? 9 : 11}
                          tt="capitalize"
                        >
                          Expired
                        </Badge>
                      )}
                      <LinkIcon
                        color="#101010"
                        width={smallScreen ? 14 : midScreen ? 16 : 18}
                        height={smallScreen ? 14 : midScreen ? 16 : 18}
                      />
                    </Anchor>
                  </Box>
                );
              })}
            </Group>
          </Box>
        )}
    </Paper>
  );
};

export default AIResponse;
