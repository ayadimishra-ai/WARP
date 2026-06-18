import { Carousel } from "@mantine/carousel";
import '@mantine/core/styles.css';
import "@mantine/carousel/styles.css";

import { Anchor, Box, Center, MantineProvider } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { useFormFieldStore } from "@/modules/warp/packages/client/features/form/store";
import { suggestionPopup } from "@/modules/warp/packages/client/services/platform-window-message.service";
import {
  AISuggestionCarouselProps,
  getSourceTypePriority,
  multipleFileUploadClick,
  SourcesType,
} from "@/modules/warp/packages/shared/constants/app.constants";
import { useRouter } from "next/router";
import React, { useEffect, useMemo, useState } from "react";
import SuggestionCard from "./SuggestionCard";
import { useMediaQuery } from "@mantine/hooks";

const AISuggestionCarousel: React.FC<AISuggestionCarouselProps> = ({
  onSelectSingleValueCard,
  onSelectMultipleCard,
  onSelectMultipleDrodpwonCard,
  data,
  type,
  isclicked,
  formFieldId,
  onFileCard,
  isFile,
  clickedFileIds,
  isDateTime,
  isSparkIconClick,
  halfWidth,
  isReplaceInfoContent,
}) => {
  
  const { query } = useRouter();
  const { invitationId } = query;
  const [selectedCardIds, setSelectedCardIds] = useState<string[]>([]);
  const suggestions = useFormFieldStore ((state) => state.Suggestions);

  useEffect(() => {
    const selectedIds =
      suggestions
        .filter(
          (sItems) => sItems?.isSelected && sItems?.formFieldId == formFieldId
        )
        .map((items) => items?.id) || [];
    setSelectedCardIds(selectedIds);
  }, [formFieldId, suggestions]);

  const formFieldData = useFormFieldStore
    ?.getState()
    ?.formFields?.find((items) => items?.id === formFieldId);

  useEffect(() => {
    if (isclicked) {
      setSuggestionStore(selectedCardIds[0], false, true);
      setSelectedCardIds([]);
    }
  }, [isclicked]);
  useEffect(() => {
    if (isSparkIconClick) {
      window.parent.postMessage(
        suggestionPopup(
          formFieldId,
          selectedCardIds.length > 0 ? selectedCardIds[0] : "",
          isFile
        ),
        "*"
      );
    }
  });
  useEffect(() => {
    if (!!clickedFileIds) {
      setSelectedCardIds(clickedFileIds.map((items) => items?.sourceId));
    }
  }, [clickedFileIds]);
  const setSuggestionStore = (
    suggestionId: string,
    isSelected: boolean,
    isfromFormField: boolean
  ) => {
    // ----Note: Commented out code, to fix multiple suggestion selection issue, through 'All Suggestions' popup
    // let otherFormFieldData = useFormFieldStore
    //   .getState()
    //   .Suggestions.filter(
    //     (suggestionItems) => suggestionItems?.id != suggestionId
    //   );
    // let currentFormFieldData = useFormFieldStore
    //   .getState()
    //   .Suggestions.filter(
    //     (suggestionItems) => suggestionItems?.id == suggestionId
    //   );
    // if (isfromFormField) {
    let otherFormFieldData = useFormFieldStore
      .getState()
      .Suggestions.filter((items) => items?.formFieldId != formFieldId);
    let currentFormFieldData = useFormFieldStore
      .getState()
      .Suggestions.filter(
        (suggestionItems) => suggestionItems?.formFieldId == formFieldId
      );
    // }
    const currentupdatedValue = currentFormFieldData.map((items) => {
      return {
        ...items,
        isSelected: items.id === suggestionId ? isSelected : false,
      };
    });
    const finalData = [...otherFormFieldData, ...currentupdatedValue];
    setSelectedCardIds([]);
    useFormFieldStore.setState({
      Suggestions: finalData,
    });
  };
  const handleSelect = (
    id: string,
    value: string | string[] | Record<string, any>[],
    isFromPopUp: boolean,
    isSelected: boolean,
    selectedData?: multipleFileUploadClick[],
    isHTMLSuggestion?: boolean,
    newTitle?: string
  ) => {
    if (!isFile) {
      if (isFromPopUp) {
        if (!isSelected) {
          setSuggestionStore(id, isSelected, false);
        } else {
          setSuggestionStore(id, isSelected, false);
        }
      } else {
        const currenStoreData = useFormFieldStore
          .getState()
          .Suggestions.filter((suggestionItems) => suggestionItems?.id == id);
        setSuggestionStore(
          id,
          currenStoreData?.length > 0 ? !currenStoreData[0].isSelected : true,
          true
        );
      }
    }
    //  else {
    //   setSourceState(id);
    // }

    if (!!onSelectSingleValueCard) {
      if (isFromPopUp) {
        if (!isSelected) {
          onSelectSingleValueCard(
            "",
            isFromPopUp,
            formFieldId,
            isHTMLSuggestion,
            newTitle
          );
        } else {
          onSelectSingleValueCard(
            String(value),
            isFromPopUp,
            formFieldId,
            isHTMLSuggestion,
            newTitle
          );
        }
      } else {
        if (selectedCardIds.filter((items) => items == id).length > 0) {
          onSelectSingleValueCard(
            "",
            isFromPopUp,
            formFieldId,
            isHTMLSuggestion,
            newTitle
          );
        } else {
          onSelectSingleValueCard(
            String(value),
            isFromPopUp,
            formFieldId,
            isHTMLSuggestion,
            newTitle
          );
        }
      }
    } else if (!!onSelectMultipleCard) {
      if (isFromPopUp) {
        if (!isSelected) {
          onSelectMultipleCard([]);
        } else {
          onSelectMultipleCard(value as string[]);
        }
      } else {
        if (selectedCardIds.filter((items) => items == id).length > 0) {
          onSelectMultipleCard([]);
        } else {
          onSelectMultipleCard(value as string[]);
        }
      }
    } else if (!!onSelectMultipleDrodpwonCard) {
      if (isFromPopUp) {
        if (!isSelected) {
          onSelectMultipleDrodpwonCard([]);
        } else {
          onSelectMultipleDrodpwonCard(value as Record<string, any>[]);
        }
      } else {
        if (selectedCardIds.filter((items) => items == id).length > 0) {
          onSelectMultipleDrodpwonCard([]);
        } else {
          onSelectMultipleDrodpwonCard(value as Record<string, any>[]);
        }
      }
    } else if (!!onFileCard) {
      if (isFromPopUp) {
        if (!isSelected) {
          onFileCard(id, [], isFromPopUp, selectedData);
        } else {
          onFileCard(id, value as Record<string, any>[], isFromPopUp);
        }
      } else {
        if (selectedCardIds.filter((items) => items == id).length > 0) {
          onFileCard(id, [], isFromPopUp, selectedData);
        } else {
          onFileCard(
            id,
            value as Record<string, any>[],
            isFromPopUp,
            selectedData
          );
        }
      }
    }
    if (isFile) {
      if (isFromPopUp) {
        if (
          useFormFieldStore
            .getState()
            .Suggestions.filter((suggestionItems) => suggestionItems?.id == id)
            .length > 0
        ) {
          setSelectedCardIds(
            useFormFieldStore
              .getState()
              .Suggestions.filter(
                (suggestionItems) => suggestionItems?.id != id
              )
              .map((items) => items.id)
          );
        } else {
          const allIds = useFormFieldStore
            .getState()
            .Suggestions.map((items) => items.id);
          allIds.push(id);
          setSelectedCardIds(allIds);
        }
      } else {
        if (selectedCardIds.filter((items) => items == id).length > 0) {
          setSelectedCardIds(selectedCardIds.filter((items) => items != id));
        } else {
          const allIds = selectedCardIds;
          allIds.push(id);
          setSelectedCardIds(allIds);
        }
      }
    } else {
      if (isFromPopUp) {
        setSelectedCardIds(isSelected ? [id] : []);
      } else {
        setSelectedCardIds(
          selectedCardIds.filter((items) => items == id).length > 0 ? [] : [id]
        );
      }
    }
    // setSelectedCardIds((prevSelected) => {
    //   const newSelected = new Set(prevSelected);
    // if (value.includes("|")) {
    //   value.split("|").forEach((items) => {
    //     multipleValueData.push({
    //       key: items,
    //       isselect:
    //         multipleCardValueData.filter((item) => item.key == items)
    //           .length == 0
    //           ? true
    //           : false,
    //     });
    //   });
    // } else {
    //   multipleValueData.push({
    //     key: value,
    //     isselect:
    //       multipleCardValueData.filter((item) => item.key == value).length ==
    //       0
    //         ? true
    //         : false,
    //   });
    // }
    // setmultipleCardValueData(multipleValueData);
    //   return newSelected;
    // });
  };
  const dataCheck = data?.length > 0 ? data : [];
  const cardData = dataCheck
    .sort((a, b) => (b.sourceCount < a.sourceCount ? -1 : 1))
    .sort((a, b) => {
      const priorityA = getSourceTypePriority(a.cardType || '');
      const priorityB = getSourceTypePriority(b.cardType || '');
      return priorityA - priorityB; // Ascending order: lower priority number comes first
    });
  useEffect(() => {
    globalThis.addEventListener("message", async (event: any) => {
      event.preventDefault();
      let messageData: any;
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "set-suggestion-store-value") {
            if (messageData.formFieldId == formFieldId) {
              handleSelect(
                messageData.id,
                messageData.suggestion,
                true,
                messageData.isSelected,
                messageData.selectedData,
                messageData.isHTMLSuggestion
              );
            }
          }
        } catch (error) {}
      }
    });
  }, []);
  const isTextArea = type === "textArea";
  const isActivityDataCard = dataCheck?.[0]?.cardType === SourcesType.OPS_Data?.dbTittle;
  const isMobile = useMediaQuery('(max-width: 720px)');
  const isTablet = useMediaQuery('(max-width: 1286px)');
  const isDesktop = useMediaQuery('(max-width: 1480px)');

  const slideSize = useMemo(() => {
    if (isMobile) return "100%";
    if (isTablet) return halfWidth ? "270px" : isTextArea ? "380px" : isActivityDataCard ? "270px" : "202px";
    if (isDesktop) return halfWidth ? "270px" : isTextArea ? "410px" : isActivityDataCard ? "270px" : "202px";
    return halfWidth ? "320px" : isTextArea ? "485px" : "270px";
  }, [isMobile, isTablet, isDesktop, halfWidth, isTextArea, isActivityDataCard]);

  return (
    <Box ml="-4px">
      <Carousel
        mt={10}
        id="carouselBlock"
        h="auto"
        slideSize={slideSize}
        slideGap={12}
        emblaOptions={{
          align: "start",
          containScroll: "trimSnaps",
        }}
        includeGapInSize={false}
        controlsOffset={0}
        controlSize={20}
        nextControlIcon={<IconChevronRight color="#99A7AD" size={16} />}
        previousControlIcon={<IconChevronLeft color="#99A7AD" size={16} />}
        styles={{
          control: {
            // "&[data-inactive]:nth-of-type(2)": {
            "&[data-inactive]": {
              opacity: 0,
              cursor: "default",
              pointerEvents: "none",
            },
          },
          root: {
            overflow: "inherit",
          },
          viewport: {
            overflow: "hidden",
          },
          slide: {
            overflow: "hidden",
          },
          controls: {
            left: "-6px",
            right: "-12px",
          },
        }}
      >
        {cardData.map((item, index) => {
          const isSelectedAny = cardData.filter((items) =>
            selectedCardIds.some((dataItems) => dataItems == items.id)
          );
          const {
            title,
            sourceCount,
            sourceTitle,
            sourceUrl,
            suggestionCount,
            suggestionlist,
            conflict,
            id,
          } = item;
          let newTitle = "NA";
          let isHTMLSuggestion: boolean = false;
          // Determine the display title for the suggestion card
          const isAdvancedInput =
            formFieldData?.interface === "input" &&
            formFieldData.type === "string" &&
            formFieldData?.interfaceOptions?.isAdvance === true;

          if (isAdvancedInput && item?.HTMLSuggestion?.shortSummary) {
            isHTMLSuggestion = true;
            newTitle = typeof item.HTMLSuggestion.shortSummary === "string"
              ? item.HTMLSuggestion.shortSummary
              : String(item.HTMLSuggestion.shortSummary);
          } else {
            // Defensively coerce to string — API may return an object instead of a plain string
            newTitle = typeof title === "string" ? title : String(title);
          }
          return (
            <Carousel.Slide key={index}>
              <SuggestionCard
                id={id}
                index={index}
                title={newTitle}
                sourceCount={sourceCount}
                sourceTitle={sourceTitle}
                sourceUrl={sourceUrl}
                suggestionCount={suggestionCount}
                suggestionlist={suggestionlist}
                isSelected={
                  isclicked
                    ? false
                    : selectedCardIds.filter((items) => items == id).length > 0
                }
                suggestion={item?.allSuggestions}
                popupSuggestion={item.suggestion}
                onSelect={(
                  suggestionId: string,
                  convertedValue: string | string[] | Record<string, any>[]
                ) =>
                  handleSelect(
                    suggestionId,
                    convertedValue,
                    false,
                    false,
                    [],
                    isHTMLSuggestion,
                    newTitle
                  )
                }
                type={type}
                conflict={
                  Array.from(isSelectedAny).length > 0 ? false : conflict
                }
                totalConflict={
                  data.filter((items) => items.conflict == true).length
                }
                isDateTime={isDateTime}
                selectedIds={Array.from(selectedCardIds)}
                isFile={isFile}
                formFieldId={formFieldId}
                cardType={item?.cardType}
                defaultData={item?.defaultData}
                isReplaceInfoContent={isReplaceInfoContent}
                halfWidth={halfWidth}
                isHTMLSuggestion={isHTMLSuggestion}
              />
            </Carousel.Slide>
          );
        })}
      </Carousel>
      {data?.length > 3 && (
        <Center mt="md">
          <Anchor
            c="#003B52"
            fz="12px"
            lh="30px"
            td="underline"
            component="button"
            type="button"
            onClick={() => {
              window.parent.postMessage(
                suggestionPopup(
                  formFieldId,
                  selectedCardIds.length > 0 ? selectedCardIds[0] : "",
                  isFile
                ),
                "*"
              );
            }}
          >
            {!!isFile ? "View All Documents" : " View All Suggestions"}
          </Anchor>
        </Center>
      )}
    </Box>
  );
};

export default AISuggestionCarousel;
