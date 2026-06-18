import { Anchor, Box, Flex, Menu, Text } from "@mantine/core";
import {
  cardDefaultData,
  SourcesType,
  suggestionList,
} from "@/modules/warp/packages/shared/constants/app.constants";
import dayjs from "dayjs";
import Image from "next/image";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import PageInfoTooltip from "./PageInfoTooltip";

const SourceBlock: React.FC<{
  id: string;
  suggestionContent: string;
  sourceTitle: string;
  sourceUrl: string;
  sourceCount: number;
  suggestionlist: suggestionList;
  type?: string;
  cardTitle: string;
  suggestion: string | string[] | Record<string, any>[];
  isDateTime?: boolean;
  isFile?: boolean;
  formFieldId: string;
  isSelected: boolean;
  cardType: string;
  defaultData: cardDefaultData;
  isReplaceInfoContent?: boolean;
  halfWidth?: boolean;
  isHTMLSuggestion?: boolean;
  isTableView?: boolean;
}> = ({
  id,
  suggestionContent,
  sourceTitle,
  sourceUrl,
  sourceCount,
  suggestionlist,
  type,
  cardTitle,
  suggestion,
  isDateTime,
  isFile,
  formFieldId,
  isSelected,
  cardType,
  defaultData,
  isReplaceInfoContent,
  halfWidth,
  isHTMLSuggestion,
  isTableView,
}) => {
  const { query } = useRouter();
  const [menuOpened, setMenuOpened] = useState(false);
  const isTextArea = type === "textArea";
  let currentType: string = "";
  const LongTextTrim = (text: string, maxLength: number): string => {
    return text.length > maxLength ? text.slice(0, maxLength) + "..." : text;
  };
  let cardOptionTitle: string = sourceTitle;
  if (!!isDateTime) {
    if (isDateTime) {
      let selectedDate: Date | null = null;

      // Handle month/year format like "1/2025"
      if (sourceTitle.includes("/")) {
        const parts = sourceTitle.split("/");
        if (parts.length === 2) {
          const month = parseInt(parts[0]);
          const year = parseInt(parts[1]);

          if (!isNaN(month) && !isNaN(year) && month >= 1 && month <= 12) {
            // Create date for the first day of the month (e.g., "1/2025" becomes Jan 01, 2025)
            selectedDate = new Date(year, month - 1, 1);
            // Keep display as original format "1/2025" - don't format to DD MMM YYYY
            cardOptionTitle = sourceTitle;
          }
        }
      } else {
        // Try to parse as a regular date
        selectedDate = new Date(sourceTitle);
        if (selectedDate && !isNaN(selectedDate.getTime())) {
          // For full dates, show the formatted version
          cardOptionTitle = dayjs(selectedDate).format("DD MMM YYYY");
        }
      }

      // If parsing failed, keep original title
      if (!selectedDate || isNaN(selectedDate.getTime())) {
        cardOptionTitle = sourceTitle;
      }
    }
  }
  useEffect(() => {
    const handleWindowBlur = () => {
      setMenuOpened(false);
    };
    window.addEventListener("blur", handleWindowBlur);
    return () => {
      window.removeEventListener("blur", handleWindowBlur);
    };
  }, []);

  return (
    <Flex gap="xs" justify="space-between" align="center" style={{ pointerEvents: "all" }}>
      {sourceUrl ? (
        <Flex
          align="center"
          styles={{
            root: {
              flex: sourceCount > 0 ? 1 : "unset",
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: "nowrap",
            }
          }}
        >
          <Anchor
            c={isFile ? "#444444" : "#666666"}
            fz={isFile ? "13px" : "12px"}
            lh={isFile ? "15.6px" : "14.4px"}
            href={sourceUrl}
            title="Opens in new tab"
            target="_blank"
            styles={{
              root: {
                textOverflow: "ellipsis",
                overflow: "hidden",
                whiteSpace: "nowrap",
              }
            }}
          >
              {sourceTitle}
          </Anchor>
          {cardType === SourcesType.Uploaded?.dbTittle &&
            !!defaultData?.infoContent &&
            Number(defaultData?.pageNo) > 0 && (
              <PageInfoTooltip
                pageContent={defaultData?.infoContent}
                pageurl={sourceUrl}
                pageNumber={defaultData?.pageNo}
                suggestionContent={suggestionContent}
                isReplaceInfoContent={isReplaceInfoContent}
              />
            )}
        </Flex>
      ) : cardType === SourcesType.OPS_Data?.dbTittle && isFile ? (
        isTableView ? (
          <Text
            c="#666666"
            fz="13px"
            title={sourceTitle ? `Fetched from Data Uploads - ${sourceTitle}` : "Fetched from Data Uploads"}
            lineClamp={1}
            fw={700}
          >
            Fetched from Data Uploads<Text fw={400} component="span">{sourceTitle ? ` - ${sourceTitle}` : ""}</Text>
          </Text>
        ) : (
          <Flex direction="column" styles={{ root: { flex: 1 } }}>
              <Text
                c="#666666"
                fz="12px"
                lh="14px"
                fw={600}
              >
                Fetched from Data Uploads
              </Text>
            {sourceTitle && (
              <Text
                c="#666666"
                fz="11px"
                lh="14px"
                fw={400}
              >
                {sourceTitle}
              </Text>
            )}
          </Flex>
        )
      ) : (
        <Text
          c="#444444"
          fz="13px"
          lh="15.6px"
          title={sourceTitle}
          styles={{
            root: {
              flex: 1,
              textOverflow: "ellipsis",
              overflow: "hidden",
              whiteSpace: isTextArea ? "normal" : "nowrap",
            }
          }}
        >
          {isTextArea
            ? LongTextTrim(sourceTitle, halfWidth ? 92 : 140)
            : cardOptionTitle}
          {isTextArea &&
            (sourceTitle?.length > (halfWidth ? 92 : 140) ||
              isHTMLSuggestion) && (
              <Anchor
                component="span"
                onClick={() =>
                  window.parent.postMessage(
                    JSON.stringify({
                      type: "suggestionCardText_Popup",
                      data: {
                        aiSuggestionTitle: cardTitle,
                        aiSuggestionMessage: sourceTitle,
                        value: suggestion,
                        suggestionId: id,
                        formFieldId: formFieldId,
                        isSelected: isSelected,
                        isHTMLSuggestion: isHTMLSuggestion,
                        mode: query?.mode,
                      },
                    }),
                    "*"
                  )
                }
                tt="uppercase"
                fw={600}
                fz="9px"
                lh="11.41px"
                c="#038FC7"
                ml="5px"
              >
                View More
              </Anchor>
            )}
        </Text>
      )}
      <Menu
        withinPortal
        width="246px"
        position="right-start"
        radius={0}
        closeOnItemClick={false}
        opened={menuOpened}
        onChange={setMenuOpened}
        styles={{
          dropdown: {
            borderBottom: "1px solid #e0e0e0",
            boxShadow: "0px 4px 4px rgba(0, 0, 0, 0.25)",
            padding: "0px !important",
          },
          label: {
            fontWeight: 600,
            fontSize: 12,
            lineHeight: "20px",
            letterSpacing: "0.15em",
            color: "#444444",
            borderBottom: "1px solid #e0e0e0",
          },
          item: {
            paddingTop: "5px",
            paddingBottom: "5px",
            "&:hover a": {
              textDecoration: "none",
            },
            "&:hover svg": { strokeWidth: 0 },
          },
          itemLabel: {
            overflow: "hidden",
            "&:hover": {
              textTransform: "none",
            },
          },
        }}
        transitionProps={{
          transition: "scale-x",
          duration: 150,
        }}
      >
        <Menu.Target>
          <Flex styles={{ root: { cursor: "pointer" } }} align="center">
            {sourceCount > 0 ? (
              <>
            {!!sourceUrl && (
              <Image
                width={11}
                height={12}
                    src="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTMiIGhlaWdodD0iMTQiIHZpZXdCb3g9IjAgMCAxMyAxNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTEgMVY0LjcyNDE0QzEgNS42MzgyNiAxLjc1NzY3IDYuMzc5MzEgMi42OTIzMSA2LjM3OTMxQzMuNjI2OTQgNi4zNzkzMSA0LjM4NDYyIDUuNjM4MjYgNC4zODQ2MiA0LjcyNDE0VjIuMjQxMzhDNC4zODQ2MiAxLjc4NDMyIDQuMDA1NzggMS40MTM3OSAzLjUzODQ2IDEuNDEzNzlDMy4wNzExNSAxLjQxMzc5IDIuNjkyMzEgMS43ODQzMiAyLjY5MjMxIDIuMjQxMzhWNS4xMzc5M001LjY1Mzg1IDEuNDEzNzlIMTEuMTUzOEMxMS42MjEyIDEuNDEzNzkgMTIgMS43ODQzMiAxMiAyLjI0MTM4VjEyLjE3MjRDMTIgMTIuNjI5NSAxMS42MjEyIDEzIDExLjE1MzggMTNIMi42OTIzMUMyLjIyNDk5IDEzIDEuODQ2MTUgMTIuNjI5NSAxLjg0NjE1IDEyLjE3MjRWNy42MjA2OU05Ljg4NDYyIDQuNzI0MTRINi41TTkuODg0NjIgNy4yMDY5SDYuNU05Ljg4NDYyIDkuNjg5NjZIMy45NjE1NCIgc3Ryb2tlPSIjOTlBN0FEIiBzdHJva2Utd2lkdGg9IjEuNSIvPgo8L3N2Zz4K"
                alt="clip"
              />
            )}
              <Text c="#666666" fz="12px" lh="14.4px" ml="3px" h="12px">
                +{sourceCount}
              </Text>
              </>
            ) : (
              <></>
            )}
          </Flex>
        </Menu.Target>
        <Menu.Dropdown>
          {suggestionlist?.suggestionCategory?.map((category, catIdx) => (
            <Box key={catIdx}>
              {category?.categoryName &&
              category?.categoryName !== currentType ? (
                ((currentType = category?.categoryName),
                (<Menu.Label>{category?.categoryName}</Menu.Label>))
              ) : (
                <></>
              )}
              {category?.isOptions ? (
                <Menu.Item style={{ cursor: "context-menu" }}>
                  <Text
                    title={category?.description}
                    c="#666666"
                    fz="12px"
                    lh="20px"
                  >
                    {category?.description}
                  </Text>
                </Menu.Item>
              ) : category?.categoryName === SourcesType.OPS_Data?.frontEndTitle ? (
                <Menu.Item style={{ cursor: "context-menu" }}>
                  <Text
                    title={category?.description ? `Fetched from Data Uploads - ${category?.description}` : "Fetched from Data Uploads"}
                    c="#666666"
                    fz="12px"
                    lh="20px"
                    styles={{
                      root: {
                        textOverflow: "ellipsis",
                        overflow: "hidden",
                        whiteSpace: "nowrap",
                      },
                    }}
                  >
                    Fetched from Data Uploads{category?.description ? ` - ${category?.description}` : ""}
                  </Text>
                </Menu.Item>
              ) : (
                category?.docs.map((doc, docIdx) => {
                  const uniqueKey = `${catIdx}-${docIdx}`;
                  return (
                    <Menu.Item key={uniqueKey} component="span">
                      <Flex align="center" justify="flex-start">
                        <Anchor
                          href={doc?.docUrl}
                          target="_blank"
                          fz="12px"
                          lh="20px"
                          c="#666666"
                          styles={{
                            root: {
                              textOverflow: "ellipsis",
                              overflow: "hidden",
                              whiteSpace: "nowrap",
                              "&:hover": {
                                color: "#038FC7",
                              },
                            }
                          }}
                        >
                          {category?.description ? doc?.docUrl : doc.docName}
                        </Anchor>
                        {!category?.description &&
                          !!doc?.tooltipLabelText &&
                          Number(doc?.pageNo) > 0 && (
                            <Box style={{ flex: 1 }}>
                              <PageInfoTooltip
                                pageContent={doc?.tooltipLabelText}
                                pageurl={doc?.docUrl}
                                pageNumber={doc?.pageNo}
                                suggestionContent={suggestionContent}
                                isReplaceInfoContent={isReplaceInfoContent}
                                isChildToolTip={true}
                              />
                            </Box>
                          )}
                      </Flex>
                    </Menu.Item>
                  );
                })
              )}
            </Box>
          ))}
        </Menu.Dropdown>
      </Menu>
    </Flex>
  );
};

export default SourceBlock;
