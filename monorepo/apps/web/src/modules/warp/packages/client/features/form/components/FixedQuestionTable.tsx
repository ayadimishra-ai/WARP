import {
  ActionIcon,
  Box,
  Flex,
  Paper,
  ScrollArea,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useFullscreen } from "@mantine/hooks";
import { useGetInvitationAndSubmissionDetailsByInvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-and-submission-details-by-invitation-id";
import { isAIUserFromMetadata } from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import AISuggestionCarousel from "@/modules/warp/components/embed/AIBasedSections/Common/AISuggestionCarousel";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import CarryForwardAnswerIcon from "../../../icons/CarryForwardAnswerIcon";
import ManimizeScreenIcon from "../../../icons/ManimizeScreenIcon";
import MaximizeScreenIcon from "../../../icons/MaximizeScreenIcon";
import SparkleGradientIcon from "../../../icons/SparkleGradientIcon";
import { getAISuggestionCarouselData } from "../common-functions";
import { useDisabledField } from "../hooks/useDisabledField";
import { useEnableQuestionField } from "../hooks/useEnableQuestionField";
import { FormFieldRender } from "../index";
import {
  getJsonataExpression,
  useFormFieldControl,
  useFormFieldRemoveAnswerOnEnableFalse,
  useFormFieldStore,
  useInterimAnswerStore,
} from "../store";
import { FormFieldControl } from "../types";
import DisplayLabel from "./DisplayLabel";

const useStyles = createStyles((theme) => ({
  table: {
    backgroundColor: "#e9edf3",
    border: "none",
    borderCollapse: "collapse",
    "& tbody": {
      background: "#fff",
    },
    "& td": {
      color:"#444444",
      verticalAlign: "middle",
      textAlign: "center",
      padding: "10px 15px !important",
      minHeight: 56,
      borderBottom: "1px solid #E9EDF3" + " !important",
      "&:first-of-type": {
        textAlign: "left",
      },
    },
    "& td+td": {
      border: "1px solid #E9EDF3",
    },
    "& th": {
      border: "1px solid #dee2e6" + " !important",
      fontSize: 12,
      fontWeight: 600,
      color:"#101113 !important",
      lineHeight:"normal",
      padding: "10px" + " !important",
    },
    "& .has-suggestions":{
      "& input": {
        paddingRight: "28px", // Add padding to prevent text overlap with AI icon
        marginRight: "-28px",
      },
      "& input.mantine-Radio-radio": {
        paddingRight: "0px",
        marginRight: "0px",
      },
    },
    "& .uploaded-doc-td": {
      position: "relative",
      // overflow: "hidden",
      "& > div": {
        display: "block",
      },
      "& > div:has(.mantine-RadioGroup-root)": {
        display: "block",
        alignItems: "unset",
        justifyContent: "unset",
      },
      "& .mantine-TextInput-error, & .mantine-NumberInput-error": {
        textAlign: "justify",
        width: "100%",
        fontSize: "10px",
        marginTop: "2px",
      },
      "& .mantine-RadioGroup-root": {
        width: "auto",
        display: "inline-block",
      },
      "& .mantine-Radio-root": {
        marginBottom: "4px",
        paddingLeft: 0,
      },
      "& .mantine-Radio-body": {
        alignItems: "center",
        display: "flex",
        gap: "12px",
      },
      "& .mantine-Radio-radio": {
        cursor: "pointer",
        width: "16px",
        height: "16px",
        minWidth: "16px",
        minHeight: "16px",
        marginRight: "0",
      },
      "& .mantine-Radio-label": {
        cursor: "pointer",
        paddingLeft: "0 !important",
        marginLeft: "12px",
        fontSize: "12px",
      },
      "& .mantine-Stack-root": {
          gap: 0,
      },
    },
  },
}));

const FixedQuestionTable: FormFieldControl<"fixed-question-table"> = ({
  formField,
}) => {
  const formInvitationId = useFormFieldStore((store) => store.formInvitationId);
  const { data: invitationData, loading } =
    useGetInvitationAndSubmissionDetailsByInvitationIdQuery({
      variables: {
        invitationId: formInvitationId as string,
        includeAllSections: false,
      },
      skip: !formInvitationId,
    });
  const EnableQuestionField = useEnableQuestionField(formField);
  const isDisabled = useDisabledField(formField.questionId, EnableQuestionField);

  const formInvitation = invitationData?.FormInvitation?.[0];
  const isAIUser = isAIUserFromMetadata(formInvitation?.metadata);
  // Error logic state (like SelectMultipleDropdown)
  const [showErrorMessage, setShowErrorMessage] = useState("");
  const { classes } = useStyles();
  const { ref, toggle, fullscreen } = useFullscreen();

  // State management for the table
  const state = useFormFieldControl<"fixed-question-table">(formField);
  useFormFieldRemoveAnswerOnEnableFalse(formField, state.fieldOptions.enable);

  // For interim logic (recommendations, etc.)
  const interimStore = useInterimAnswerStore.getState();
  const formFieldStore = useFormFieldStore.getState();

  // AI Suggestions state
  const [focusedFieldId, setFocusedFieldId] = useState<string | null>(null);
  const [showCarousel, setShowCarousel] = useState(false);
  const [carouselFieldId, setCarouselFieldId] = useState<string | null>(null); // Track field for carousel separately
  const focusTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  // Ref for carousel section
  const carouselSectionRef = useRef<HTMLDivElement | null>(null);
  // Ref for main container (to detect clicks on fullscreen button, etc.)
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Ref map for each input field
  const inputRefs = useRef<Record<string, HTMLTableCellElement | null>>({});
  // Track last focused field for scroll-back
  const lastFocusedFieldId = useRef<string | null>(null);
  // Track when we're actively applying a suggestion (to prevent sync from interfering)
  const isApplyingSuggestion = useRef(false);
  // Track field rerender keys to force remounting when applying suggestions
  const [fieldRerenderKeys, setFieldRerenderKeys] = useState<Record<string, number>>({});

  // Each child field manages its own database state individually
  // No initialization needed - child fields load from their own DB rows

  // Auto-calculation function that can be called on-demand
  const runAutoCalculations = useCallback(async () => {
    if (!formField?.children?.length) return;

    // Get fresh store state inside the callback to avoid stale values
    const currentStore = useFormFieldStore.getState();
    const currentAnswer = currentStore.answer;

    // Build data object from ALL answers in the store to support cross-table dependencies
    const allData: Record<string, any> = {};
    Object.keys(currentAnswer).forEach((key) => {
      allData[key] = { value: currentAnswer[key]?.value ?? "" };
    });

    const newCalculatedAnswers: Record<string, any> = {};

    // Use for...of to allow awaiting each calculation sequentially
    // as subsequent fields may depend on earlier ones in the same table
    for (const childField of (formField.children as any[])) {
      // Check if this child field is auto-calculated
      if (
        childField?.interfaceOptions?.isAutoCalculate &&
        Array.isArray(childField?.autoCalculatedCalculation) &&
        childField.autoCalculatedCalculation[0]?.rule
      ) {
        try {
          const formula = childField.autoCalculatedCalculation[0].rule;

          // Use cached jsonata expression from store
          const expression = getJsonataExpression(formula);
          // IMPORTANT: JSONata 2.x evaluate() returns a Promise if async features are detected.
          // We MUST await it to prevent leaking Promises into the Zustand store.
          let calculatedValue = await expression.evaluate(allData);

          // Handle undefined or null results (jsonata formula should handle NaN/Infinity)
          if (calculatedValue === undefined || calculatedValue === null) {
            calculatedValue = 0;
          }

          // Get current value from database answer
          const currentValue = currentAnswer[childField.field]?.value;

          // Convert current value to number for comparison
          const currentNumValue = parseFloat(currentValue || "0");

          // Update the child field's database answer if value changed
          // Use a small epsilon for float comparison if needed, but here we assume simple equality is fine for now
          if (calculatedValue !== currentNumValue) {
            // Collect changes to save in batch later
            newCalculatedAnswers[childField.field] = calculatedValue;

            // Also update the allData for subsequent calculations in the SAME table
            allData[childField.field] = { value: calculatedValue };
          }
        } catch (e) {
          console.error(
            `Error calculating auto-calc for field ${childField.field}:`,
            e,
            {
              rule: childField.autoCalculatedCalculation[0].rule,
              availableFields: Object.keys(allData),
            },
          );
        }
      }
    }

    // Batch update the store if there are changes
    if (Object.keys(newCalculatedAnswers).length > 0) {
      currentStore.setAnswers(newCalculatedAnswers);
    }
  }, [formField]);

  // Run auto-calculations on mount
  useEffect(() => {
    runAutoCalculations();
  }, [runAutoCalculations]);

  // Watch child field values and trigger auto-calc when they change
  const childValues = useFormFieldStore(useCallback((store) => 
    formField.children?.map((child: any) => store.answer[child.field]?.value).join(",")
  , [formField.children]));

  useEffect(() => {
    if (!formField?.children?.length) return;

    // Run auto-calc whenever any child field value changes in the answer store
    // Use a small debounce to prevent blocking the UI during rapid typing
    const handler = setTimeout(() => {
      runAutoCalculations();
    }, 300);

    return () => clearTimeout(handler);
  }, [childValues, runAutoCalculations]);

  // Auto-patch pre-selected suggestions on mount
  // This ensures that if suggestions were previously selected (isSelected=true in DB),
  // their values are automatically applied to input fields on page load
  useEffect(() => {
    if (!formField?.children?.length) return;

    const allSuggestions = useFormFieldStore.getState().Suggestions || [];
    
    // Process each child field
    formField.children.forEach((childField: any) => {
      // Find suggestions for this field that are marked as selected
      const selectedSuggestion = allSuggestions.find(
        (suggestion) => 
          suggestion.formFieldId === childField.id && 
          suggestion.isSelected === true
      );

      if (selectedSuggestion) {
        // Extract suggestion value directly from the database structure
        const suggestionValue = selectedSuggestion.suggestion?.value;

        // Get current field value from store
        const currentValue = formFieldStore.answer[childField.field]?.value;

        // Only patch if the field is empty or the value is different
        // This prevents overwriting user-edited values
        if (suggestionValue !== undefined && suggestionValue !== currentValue) {
          formFieldStore.setAnswer(childField.id, suggestionValue);
        }
      }
    });
  }, [formField?.children]);

  // Sync suggestion state when field values are manually changed
  // This ensures that if a user clears a field, the suggestion is marked as not selected
  useEffect(() => {
    if (!formField?.children?.length) return;
    
    // Skip sync if we're actively applying a suggestion
    // This prevents the sync from immediately unsetting a suggestion that's being applied
    if (isApplyingSuggestion.current) {
      return;
    }

    // ROOT CAUSE: Carousel sets isSelected=true BEFORE our callback runs, triggering this sync effect while field still has old value, causing immediate deselection.
    // FIX: 50ms delay lets our callback update field value first, so when sync runs, values match and suggestion stays selected.
    const timeoutId = setTimeout(() => {
      if (isApplyingSuggestion.current) return; // Double-check flag after delay

      const allSuggestions = useFormFieldStore.getState().Suggestions || [];
      const currentAnswers = useFormFieldStore.getState().answer;
      
      let needsUpdate = false;
      const updatedSuggestions = allSuggestions.map((suggestion) => {
        // Only process suggestions that are currently marked as selected
        if (!suggestion.isSelected) return suggestion;
        
        // Find the child field this suggestion belongs to
        const childField = formField.children?.find(
          (child: any) => child.id === suggestion.formFieldId
        );
        
        // Only process suggestions for this table's fields
        if (!childField) return suggestion;
        
        // Get current field value
        const currentValue = currentAnswers[childField.field]?.value;
        const suggestionValue = suggestion.suggestion?.value;
        
        // Check if field is empty or value doesn't match suggestion
        // Use string comparison to handle type mismatches (e.g., 123 vs "123")
        const isEmpty = currentValue === undefined || currentValue === null || currentValue === "";
        const valuesDiffer = String(currentValue) !== String(suggestionValue);
        
        // If field is empty or values don't match, mark suggestion as not selected
        if (isEmpty || valuesDiffer) {
          needsUpdate = true;
          return { ...suggestion, isSelected: false };
        }
        
        return suggestion;
      });
      
      // Only update store if changes were made
      if (needsUpdate) {
        useFormFieldStore.setState({ Suggestions: updatedSuggestions });
      }
    }, 50); // 50ms delay to allow value update to complete

    return () => clearTimeout(timeoutId);
  }, [
    // Only watch changes to this table's specific field values
    formField?.children?.map((child: any) => formFieldStore.answer[child.field]?.value).join(','),
    formField?.children?.length
  ]);

  // Get carousel data for the field being used in carousel (may differ from focusedField during value update)
  const carouselField = formField?.children?.find(
    (child: any) => child.id === carouselFieldId,
  );
  const AISuggestionCarouseldata = carouselField
    ? getAISuggestionCarouselData(
        !!useFormFieldStore?.getState()?.Suggestions
          ? useFormFieldStore
              ?.getState()
              ?.Suggestions.filter(
                (items) => items.formFieldId === carouselFieldId,
              )
          : [],
        carouselField?.interface,
      )
    : [];

  // Handle field focus
  const handleFieldFocus = (fieldId: string) => {
    // Clear any existing timeout
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    // If carousel is visible for a different field, hide it immediately
    // This ensures focusing on Input B hides the carousel from Input A
    if (showCarousel && carouselFieldId && carouselFieldId !== fieldId) {
      setShowCarousel(false);
      setCarouselFieldId(null);
    }

    setFocusedFieldId(fieldId);
    // Don't show carousel immediately, wait for AI icon click
  };

  // Handle field blur - SIMPLIFIED: Don't auto-hide carousel on blur
  // The carousel will be hidden by:
  // 1. Clicking a different input field (handled in handleFieldFocus)
  // 2. Click-outside detection (handled by useEffect below)
  const handleFieldBlur = () => {
    // Clear any pending timeout
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }
    
    // Only clear focusedFieldId, but DON'T hide carousel
    // This allows carousel to remaiuggestionn visible for interaction
    setFocusedFieldId(null);
  };

  // Handle AI icon click
  const handleAIIconClick = (e: React.MouseEvent) => {
    // Stop all event propagation to prevent blur
    e.preventDefault();
    e.stopPropagation();

    // Clear any pending blur timeout
    if (focusTimeoutRef.current) {
      clearTimeout(focusTimeoutRef.current);
      focusTimeoutRef.current = null;
    }

    // Set carousel field ID to the currently focused field
    setCarouselFieldId(focusedFieldId);
    setShowCarousel(true);

    // Store last focused field for scroll-back
    lastFocusedFieldId.current = focusedFieldId;

    // Scroll to carousel section after render
    setTimeout(() => {
      if (carouselSectionRef.current) {
        carouselSectionRef.current.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });
      }
    }, 100);
  };

  // Handle suggestion selection
  const handleSuggestionSelect = (value: any) => {
    if (carouselField) {
      // Set flag to prevent sync from interfering during suggestion application
      isApplyingSuggestion.current = true;
      
      // Force remount of the NumberInput to reset hasUserTyped ref
      // This allows the field to accept the programmatic value update
      setFieldRerenderKeys(prev => ({
        ...prev,
        [carouselField.id]: (prev[carouselField.id] || 0) + 1
      }));
      
      // Update the field value in the store using field ID (not field name)
      formFieldStore.setAnswer(carouselField.id, value);

      // Clear the flag after a short delay to allow the value to be set
      setTimeout(() => {
        isApplyingSuggestion.current = false;
      }, 100);

      // Force a re-render of the child component by briefly clearing and resetting focus
      // This ensures the Input component picks up the new value from the store
      // carouselFieldId stays the same so carousel remains visible
      const currentFieldId = carouselField.id;
      setFocusedFieldId(null);
      setTimeout(() => {
        setFocusedFieldId(currentFieldId);
      }, 10);

      // After selection, scroll back to the input field
      setTimeout(() => {
        const fieldId = lastFocusedFieldId.current;
        if (fieldId && inputRefs.current[fieldId]) {
          inputRefs.current[fieldId]?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }
      }, 200);
    }
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (focusTimeoutRef.current) {
        clearTimeout(focusTimeoutRef.current);
      }
    };
  }, []);

  // Click-outside detection to hide carousel
  // This properly handles clicking outside both the carousel and input areas
  useEffect(() => {
    if (!showCarousel) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      // Check if click is inside carousel
      const clickedInsideCarousel = carouselSectionRef.current?.contains(target);
      // Check if click is inside the actual input element of the focused field
      let clickedInsideInput = false;
      if (carouselFieldId && inputRefs.current[carouselFieldId]) {
        // Try to find an input or textarea inside the cell
        const cell = inputRefs.current[carouselFieldId];
        const input = cell?.querySelector('input, textarea');
        if (input && input.contains(target as Node)) {
          clickedInsideInput = true;
        }
      }
      // Check if click is inside a Mantine Popover (info tooltips with page numbers)
      const clickedElement = target as HTMLElement;
      const clickedInsidePopover = clickedElement.closest?.('.mantine-Popover-dropdown') !== null ||
                                    clickedElement.closest?.('[data-portal]') !== null;
      // Only keep carousel open if click is inside the input, carousel, or popover
      if (!clickedInsideCarousel && !clickedInsideInput && !clickedInsidePopover) {
        setShowCarousel(false);
        setCarouselFieldId(null);
      }
    };

    // Add listener with slight delay to avoid immediate trigger
    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showCarousel, carouselFieldId]);

  /* ---------------- HEADER CONFIG ---------------- */
  const headerConfig: any = Array.isArray(formField?.interfaceOptions?.header)
    ? formField.interfaceOptions.header[0]
    : null;

  /* ---------------- GROUP FIELDS BY ROW ---------------- */
  // Group children fields by their row position (using interfaceOptions.rowId).
  // Memoized on `formField.children` so the bucketing + sort only re-runs when
  // the schema changes — previously it ran on every render (every keystroke),
  // sorting every row's columns each time.
  const fieldsByRow: Record<string, any[]> = useMemo(() => {
    if (!state.fieldOptions.enable) return {};
    const grouped: Record<string, any[]> = {};

    formField?.children?.forEach((childField: any) => {
      const rowId = childField?.interfaceOptions?.rowId || "default";
      if (!grouped[rowId]) {
        grouped[rowId] = [];
      }
      grouped[rowId].push(childField);
    });

    Object.keys(grouped).forEach((rowId) => {
      grouped[rowId].sort((a, b) => {
        const colA = parseInt(a?.interfaceOptions?.columnId || "999", 10);
        const colB = parseInt(b?.interfaceOptions?.columnId || "999", 10);

        if (colA !== 999 && colB !== 999 && colA !== colB) {
          return colA - colB;
        }

        const extractNumber = (field: string) => {
          const match = field.match(/_(\d+)$/);
          return match ? parseInt(match[1], 10) : 999;
        };

        const numA = extractNumber(a.field || "");
        const numB = extractNumber(b.field || "");

        return numA - numB;
      });
    });

    return grouped;
  }, [formField?.children, state.fieldOptions.enable]);

  if (!state.fieldOptions.enable) return null;

  // Build rows configuration
  const rows = headerConfig?.ChildColumnName || [];

  /* ---------------- HEADERS WITH ROWSPAN/COLSPAN ---------------- */
  // Top header row: GroupColumnName (colspan)
  const groupHeaderRow = headerConfig?.GroupColumnName?.length ? (
    <tr>
      {headerConfig.GroupColumnName.map((group: any, idx: number) => (
        <th
          key={"group-" + idx}
          colSpan={group.colspan || 1}
          rowSpan={group.rowspan || 1}
          style={{
            textAlign: "center",
            ...(group.width && { width: group.width }),
          }}
        >
          {group.label}
        </th>
      ))}
    </tr>
  ) : null;

  // Second header row: SubChildColumnName (rowspan/colspan)
  const subChildHeaderRow = headerConfig?.SubChildColumnName?.length ? (
    <tr>
      {headerConfig?.SubChildColumnName.map((sub: any, idx: number) => (
        <th
          key={"subchild-" + idx}
          colSpan={sub.colspan || 1}
          rowSpan={sub.rowspan || 1}
          style={{
            textAlign: "center",
            ...(sub.width && { width: sub.width }),
          }}
        >
          {sub.label}
        </th>
      ))}
    </tr>
  ) : null;

  // Third header row: ThirdLevelColumnName (for 3-level headers like the screenshot)
  const thirdLevelHeaderRow = headerConfig?.ThirdLevelColumnName?.length ? (
    <tr>
      {headerConfig.ThirdLevelColumnName.map((col: any, idx: number) => (
        <th
          key={"thirdlevel-" + idx}
          colSpan={col.colspan || 1}
          rowSpan={col.rowspan || 1}
          style={{
            textAlign: "center",
            ...(col.width && { width: col.width }),
          }}
        >
          {col.label}
        </th>
      ))}
    </tr>
  ) : null;

  /* ---------------- BODY ---------------- */
  // Render table body with individual fields (no loops)
  const tableBody = rows.map((row: any, rowIndex: number) => {
    // Check if this row is a category heading (has colspan)
    const isCategoryHeading = row.colspan && row.colspan > 1;

    if (isCategoryHeading) {
      // Render as a category heading row (like "Permanent", "Other than Permanent")
      return (
        <tr key={rowIndex}>
          <td
            colSpan={row.colspan}
            style={{
              fontWeight: 700,
              backgroundColor: "#F6F8FB",
              padding: "10px",
              textAlign: "left",
            }}
          >
            {row.label}
          </td>
        </tr>
      );
    } else {
      // Get fields for this specific row
      // Try to match by rowId, or fallback to convention-based matching
      let rowFields = fieldsByRow[row.rowId] || [];

      // Fallback: If no rowId match, try matching by row index convention
      if (rowFields.length === 0) {
        // Map rowIndex to conventional rowId names: 0 -> row1, 1 -> row2, etc.
        // Skip category heading rows when counting
        let dataRowIndex = 0;
        for (let i = 0; i <= rowIndex; i++) {
          const r = rows[i];
          if (!r.colspan || r.colspan <= 1) {
            dataRowIndex++;
          }
        }
        const fallbackRowId = `row${dataRowIndex}`;
        rowFields = fieldsByRow[fallbackRowId] || [];
      }
      // Render as a regular editable row
      return (
        <tr key={rowIndex}>
          <td style={{ fontWeight: row.bold ? 700 : 400 }}>{row.label}</td>
          {rowFields.map((childFormField: any, colIdx: number) => {
            // Create a modified field with label and buttons hidden
            // IMPORTANT: Also hide individual field suggestions - they'll be shown at table level
            const fieldWithoutLabel = {
              ...childFormField,
              interfaceOptions: {
                ...childFormField.interfaceOptions,
                showLabel: false,
                hideCommentButton: true,
                hideInfoIcon: true,
                hideAISuggestions: true, // Prevent individual fields from showing their own suggestions
              },
              fieldOptions: {
                ...childFormField.fieldOptions,
                // Force label to be empty string
                label: "",
                // Ensure readonly fields have consistent styling
                readonly: childFormField.interfaceOptions?.isAutoCalculate
                  ? true
                  : childFormField.fieldOptions?.readonly,
              },
            };
            const isFieldFocused = focusedFieldId === childFormField.id;
            const suggestionsCount =
              useFormFieldStore
                ?.getState()
                ?.Suggestions?.filter(
                  (s) => s.formFieldId === childFormField.id,
                )?.length ?? 0;
            const hasSuggestions = suggestionsCount > 0;

            return (
              <td
                key={childFormField.id}
                className={
                  [
                    "uploaded-doc-td",
                    isFieldFocused && hasSuggestions && !fieldWithoutLabel.fieldOptions?.readonly && !isAIUser
                      ? "has-suggestions"
                      : null,
                  ].filter(Boolean).join(" ")
                }
                id={`FormField-${childFormField.id}`}
                ref={(el) => {
                  inputRefs.current[childFormField.id] = el;
                }}
                style={{
                  background:
                    isFieldFocused &&
                    hasSuggestions &&
                    !fieldWithoutLabel.fieldOptions?.readonly &&
                    isAIUser
                      ? "linear-gradient(129.57deg, #F9DAFF 6.66%, #DAF1FF 96.23%)"
                      : undefined,
                  transition: "background-color 0.2s ease",
                }}
              >
                <Flex
                  align="center"
                  pos="relative"
                  key={`${childFormField.id}-${fieldRerenderKeys[childFormField.id] || 0}`}
                  onFocus={() => handleFieldFocus(childFormField.id)}
                  onBlur={handleFieldBlur}
                >
                  <FormFieldRender formField={fieldWithoutLabel} />
                  {isFieldFocused &&
                    hasSuggestions &&
                    !fieldWithoutLabel.fieldOptions?.readonly && (
                      <Tooltip
                        withinPortal
                        label={`View Suggestion${suggestionsCount > 1 ? "s" : ""}`}
                        withArrow
                        arrowSize={10}
                        openDelay={50}
                        closeDelay={50}
                        position="bottom"
                      >
                        <ActionIcon
                          variant="transparent"
                          onClick={handleAIIconClick}
                          onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
                            // Prevent blur when clicking AI icon
                            e.preventDefault();
                          }}
                          pos="absolute"
                          top={5}
                          right={4}
                          styles={{
                            root: {
                              zIndex: 10,
                              cursor: "pointer",
                            }
                          }}
                          bg="#fff"
                        >
                          {isAIUser ? <SparkleGradientIcon /> : <CarryForwardAnswerIcon />}
                        </ActionIcon>
                      </Tooltip>
                    )}
                </Flex>
              </td>
            );
          })}
        </tr>
      );
    }
  });

  return (
    <>
      <Box
        ref={(node: HTMLDivElement | null) => {
          // Set both refs: fullscreen callback ref and our container ref
          ref(node);
          containerRef.current = node;
        }}
        px={fullscreen ? 15 : 0}
        py={fullscreen ? 15 : 0}
        bg="#f6f8fa"
        className="fixedQuestionTable"
      >
        <Flex
          align="center"
          justify={formField.fieldOptions.label ? "space-between" : "flex-end"}
          wrap="wrap"
          pb={10}
        >
          {formField.fieldOptions.label ? (
            <DisplayLabel
              text={formField.fieldOptions.label}
              isHeading={!!formField.interfaceOptions.isHeading}
              headingSize={formField.interfaceOptions.headingSize}
              infoIconProps={state.interfaceOptions?.infoIconProps}
              subtitle={formField.interfaceOptions.subtitle}
              // showassigner={showassigner}
              formField={formField}
              showbutton={"NA"}
            />
          ) : (
            ""
          )}
          <ActionIcon
            variant="transparent"
            onClick={toggle}
            mr={5}
            onMouseDown={(e: React.MouseEvent<HTMLButtonElement>) => {
              // Prevent blur when clicking fullscreen toggle
              // This maintains carousel visibility when switching between normal and fullscreen modes
              e.preventDefault();
            }}
            styles={{
              root: {
                pointerEvents: "auto",
                opacity: 0.3,
              },
            }}
          >
            {fullscreen ? <ManimizeScreenIcon /> : <MaximizeScreenIcon />}
          </ActionIcon>
        </Flex>
        <ScrollArea
          type="auto"
          classNames={{
            scrollbar:"mantine-ScrollArea-Classes-scrollbar" ,
          }}
          styles={{
            root: {
              ...(fullscreen && { maxHeight: "70vh", overflowX: "auto",
                overflowY: "auto", }),
              borderRadius: "10px",
              boxShadow:
                "0px 9px 16px rgba(159, 162, 191, 0.18), 0px 2px 2px rgba(159, 162, 191, 0.32)",
            },
            
            scrollbar: {
              "&, &:hover": {
                background: "transparent",
              },
              '&[data-orientation="vertical"] .mantine-ScrollArea-thumb': {
                backgroundColor: "#e4e4e4",
                transition: "opacity 0.2s ease",
              },
              '&[data-orientation="vertical"] .mantine-ScrollArea-thumb:hover':
                {
                  backgroundColor: "#d1d1d1",
                },
            },
          }}
        >
          <Table className={classes.table} id="fixed-question-table">
            <thead>
              {groupHeaderRow}
              {subChildHeaderRow}
              {thirdLevelHeaderRow}
            </thead>
            <tbody>{tableBody}</tbody>
          </Table>
        </ScrollArea>
        {!!showErrorMessage && showErrorMessage !== "" ? (
          <div
            className="labelStyle mantine-MultiSelect-error"
            style={{ color: "#fa5252" }}
          >
            {showErrorMessage}
          </div>
        ) : null}
        {/* AI Suggestions Carousel - Displayed below the entire table */}
        {/* Moved inside fullscreen container so it appears in both normal and fullscreen modes */}
        {showCarousel &&
          AISuggestionCarouseldata?.length > 0 &&
          carouselField && (
            <Box
              mt="lg"
              ref={carouselSectionRef}
            >
              <Flex align="center" gap={10} mb={15}>
                {isAIUser && <SparkleGradientIcon />}
                <Text fz={14} fw={600} lh="30px" c="#162F4B">
                  Suggestion{AISuggestionCarouseldata.length > 1 ? "s" : ""} For
                  Selected Field
                </Text>
              </Flex>
              <Paper
                bg="transparent"
                styles={{
                  root: {
                    pointerEvents: isDisabled ? "none" : "auto",
                    marginLeft: 0,
                    marginRight: 0,
                    "&:has(.mantine-Carousel-control:not([data-inactive]))": {
                      marginLeft: 10,
                      marginRight: 10,
                    },
                  },
                }}
              >
                <AISuggestionCarousel
                  data={AISuggestionCarouseldata}
                  onSelectSingleValueCard={handleSuggestionSelect}
                  formFieldId={carouselField.id}
                  isclicked={false}
                  isFile={false}
                  isSparkIconClick={false}
                  isReplaceInfoContent={true}
                />
              </Paper>
            </Box>
          )}
        </Box>
    </>
  );
};
export default FixedQuestionTable;