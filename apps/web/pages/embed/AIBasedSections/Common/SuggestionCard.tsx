import { Box, Button, Card, Flex, Text } from "@mantine/core";
import {
  cardDefaultData,
  suggestionList,
} from "@warp/shared/constants/app.constants";
import React from "react";
import SourceBlock from "./SourceBlock";

type SuggestionCardProps = {
  id: string;
  index: number;
  title: string;
  sourceCount: number;
  sourceTitle: string;
  sourceUrl: string;
  suggestionCount: number;
  suggestionlist: suggestionList;
  isSelected: boolean;
  onSelect: (
    id: string,
    title: string | string[] | Record<string, any>[]
  ) => void;
  type?: string;
  conflict: boolean;
  totalConflict: number;
  selectedIds: string[];
  suggestion: string | string[] | Record<string, any>[];
  popupSuggestion: suggestionList;
  isDateTime?: boolean;
  isFile?: boolean;
  formFieldId: string;
  cardType: string;
  defaultData: cardDefaultData;
  isReplaceInfoContent?: boolean;
  halfWidth?: boolean;
  isHTMLSuggestion?: boolean;
};

const SuggestionCard: React.FC<SuggestionCardProps> = ({
  id,
  index,
  title,
  sourceCount,
  sourceTitle,
  sourceUrl,
  suggestionCount,
  suggestionlist,
  isSelected,
  onSelect,
  type,
  conflict,
  totalConflict,
  selectedIds,
  suggestion,
  popupSuggestion,
  isDateTime,
  isFile,
  formFieldId,
  cardType,
  defaultData,
  isReplaceInfoContent,
  halfWidth,
  isHTMLSuggestion,
}) => {
  const backgroundColor = isSelected
    ? "#D7FFE5"
    : conflict
    ? "#f9e9df"
    : "#F0F8FC";
  const cardTitle = conflict
    ? "Selected Answer #" + String(index + 1)
    : selectedIds?.length > 0
    ? "Suggestion #" + String(index + 1)
    : "Suggestion #" + String(index - totalConflict + 1);

  // Convert suggestion value for DateTime fields with month/year format
  const getConvertedSuggestionValue = () => {
    if (
      isDateTime &&
      typeof suggestion === "string" &&
      suggestion.includes("/")
    ) {
      const parts = suggestion.split("/");
      if (parts.length === 2) {
        const month = parseInt(parts[0]);
        const year = parseInt(parts[1]);

        if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
          // Convert "1/2025" to "01/01/2025" format
          const paddedMonth = month.toString().padStart(2, "0");
          return `01/${paddedMonth}/${year}`;
        }
      }
    }
    return suggestion;
  };
  return (
    <Card
      withBorder
      mx="5px"
      radius={6}
      p={0}
      bg={backgroundColor}
      onClick={(e: any) => {
        e.stopPropagation();
      }}
      data-suggestion={id}
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Flex
        p={10.5}
        direction="column"
        justify="space-between"
        style={{ flexGrow: 1 }}
      >
        <Flex direction="column" justify="space-between">
          {!isFile && (
            <Text c="#005C81" fz="11px" fw={700} lts="0.1em">
              {cardTitle}
            </Text>
          )}
          {/* <Flex gap="xs" justify="space-between">
          <Text c="#444444" fz="13px" lineClamp={1}>
            {title}
          </Text>
          {suggestionCount > 0 && (
            <Text c="#444444" fz="13px">
              +{suggestionCount}
            </Text>
          )}
        </Flex> */}
          <Box my="5px">
            {!isFile && (
              <SourceBlock
                id={id}
                suggestionContent={title}
                sourceTitle={title}
                sourceUrl={""}
                sourceCount={suggestionCount}
                suggestionlist={popupSuggestion}
                type={type}
                cardTitle={cardTitle}
                suggestion={suggestion}
                isDateTime={isDateTime}
                formFieldId={formFieldId}
                isSelected={isSelected}
                cardType={cardType}
                defaultData={defaultData}
                isReplaceInfoContent={isReplaceInfoContent}
                halfWidth={halfWidth}
                isHTMLSuggestion={isHTMLSuggestion}
              />
            )}
          </Box>
        </Flex>
        <SourceBlock
          id={id}
          suggestionContent={title}
          sourceTitle={sourceTitle}
          sourceUrl={sourceUrl}
          sourceCount={sourceCount}
          suggestionlist={suggestionlist}
          cardTitle={cardTitle}
          suggestion={suggestion}
          isFile
          formFieldId={formFieldId}
          isSelected={isSelected}
          cardType={cardType}
          defaultData={defaultData}
          isReplaceInfoContent={isReplaceInfoContent}
          isHTMLSuggestion={isHTMLSuggestion}
        />
      </Flex>

      <Button
        fullWidth
        variant="gradient"
        gradient={{
          from: isSelected ? "#12B549" : "#005C81",
          to: isSelected ? "#088532" : "#122F47",
        }}
        styles={{
          root: {
            borderRadius: "0 0 6px 6px",
            fontSize: 12,
            lineHeight: "14.4px",
            letterSpacing: "0.15em",
            fontWeight: 600,
            textTransform: "uppercase",
          },
        }}
        onClick={() => {
          const convertedValue = getConvertedSuggestionValue();
          onSelect(id, convertedValue);
        }}
      >
        {isSelected ? "Selected" : "Use This"}
      </Button>
    </Card>
  );
};

export default SuggestionCard;
