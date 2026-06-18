import { v4 as uuidv4 } from "uuid";
import { FormField_Insert_Input } from "../../graphql/generated/types";
import {
  ExcelQuestionData,
  QuestionToInsert as OriginalQuestionData,
} from "./excel-questions-processor";
import { ProcessedSectionData as OriginalSectionData } from "./excel-sections-processor";

/**
 * Creates a sub-theme form field for a section
 * @param section Current section being processed
 * @param parentSection Parent section (if any)
 * @param allSections All sections data to build breadcrumb hierarchy
 * @param formId Form ID
 * @param seqIndex Sequence index for ordering
 * @returns FormField_Insert_Input for the sub-theme and the next sequence index
 */
function createSectionSubTheme(
  section: FormFieldSectionData,
  parentSection: FormFieldSectionData | null,
  allSections: Record<string, FormFieldSectionData>,
  formId: string,
  seqIndex: number
): { subTheme: FormField_Insert_Input; nextIndex: number } {
  // Generate field name for the sub-theme
  const subThemeField = `${section.key}_sub_theme_${seqIndex}`;

  // Build breadcrumb by traversing up the section hierarchy
  const breadcrumb: string[] = [];
  let currentSection: FormFieldSectionData | null = section;

  while (currentSection) {
    // Add the current section's title to the breadcrumb
    const sectionTitle = currentSection.title || currentSection.content;
    breadcrumb.unshift(sectionTitle);

    // Find parent using parentsectionCode and continue up the hierarchy
    const parentCode: string | null = currentSection.parentsectionCode;
    if (parentCode) {
      const parentSection: FormFieldSectionData | undefined = Object.values(
        allSections
      ).find((s: FormFieldSectionData) => s.sectionCode === parentCode);
      if (parentSection) {
        console.log(
          "Adding parent to breadcrumb:",
          parentSection.title || parentSection.content,
          "parentCode:",
          parentCode
        );
        currentSection = parentSection;
      } else {
        console.log("Parent section not found for code:", parentCode);
        currentSection = null;
      }
    } else {
      currentSection = null;
    }
  }

  // Determine the group field
  // - For first level children (parent has no sectionId), use tabs format
  // - For deeper levels, use parent's field name
  let groupField: string;
  if (parentSection) {
    if (!parentSection.sectionId) {
      // First level child - parent is root
      groupField = `${parentSection.key}_tabs`;
    } else {
      // Deeper level - use parent's field name
      groupField = `${parentSection.key}_sub_theme_${seqIndex - 1}`;
    }
  } else {
    // Fallback - shouldn't happen as this is for sub-sections
    groupField = "wizard_tabs";
  }

  return {
    subTheme: {
      id: uuidv4(),
      field: subThemeField,
      type: "sub-theme",
      fieldOptions: {
        enable: true,
        readonly: false,
        required: false,
      },
      interface: "group-wizard-sub-step",
      interfaceOptions: {
        title: section.title || section.content,
        template: "pagination",
        breadcrumb: breadcrumb.join(" > ").trim(),
        isHierarchy: "true",
      },
      display: {},
      displayOptions: {},
      displayRules: {},
      validationRules: {},
      seqIndex,
      groupField,
      formId,
      sectionId: section.id,
      questionId: null,
      tags: null,
      subtheme: (section.title || section.content).trim(),
      dataPoint: null,
    },
    nextIndex: seqIndex + 1,
  };
}

// Result of form field generation
export interface FormFieldGenerationResult {
  fields: any[];
  formFields: FormField_Insert_Input[];
}

/**
 * Type alias for question data in form field generation
 */
type ProcessedQuestionData = OriginalQuestionData;

/**
 * Interface for section data with additional properties for form field generation
 */
interface FormFieldSectionData extends Omit<OriginalSectionData, "content"> {
  title?: string;
  description?: string | null;
  sectionCode: string;
  parentsectionCode: string | null;
  content: string;
}

/**
 * Interface to extend Excel question data with parent question code
 */
interface ExcelQuestionDataWithParent extends ExcelQuestionData {
  "Parent Question Code"?: string;
}

/**
 * Interface for tracking field hierarchy relationships
 * Maintains the connections between fields for parent-child relationships
 */
interface FieldHierarchyMap {
  // Maps question code to its parent question code
  questionParentMap: Record<string, string>;
  // Maps field name to its field ID
  fieldIdMap: Record<string, string>;
  // Maps field name to its parent field name
  fieldParentMap: Record<string, string>;
}

/**
 * Generate form fields based on sections and questions following a specific hierarchy:
 * 1. group-wizard (always first, top-level)
 * 2. group-wizard-step (section-wise)
 * 3. group-tabs (parent section-wise)
 * 4. group-detail with type container ONLY for main questions from Excel
 * 5. The question form fields
 *
 * @param questionnaireId - ID of the questionnaire/form
 * @param sections - Processed sections data
 * @param questions - Processed questions data
 * @param rawQuestions - Original questions data from Excel (optional)
 * @returns Array of form field objects ready for database insertion
 */
export const generateFormFields = (
  questionnaireId: string,
  sections: FormFieldSectionData[],
  questions: ProcessedQuestionData[],
  sectionData: Record<
    string,
    {
      id: string;
      key: string;
      sectionId: string | null;
      sectionCode: any; // Using any for ExcelSectionData
      content: string;
      parentsectionCode: any | null;
      tags: string | null;
    }
  >,
  rawQuestions?: ExcelQuestionData[],
  useRecursiveProcessing: boolean = true
): FormField_Insert_Input[] => {
  const formFields: FormField_Insert_Input[] = [];
  // Create a hierarchy map to track parent-child relationships
  const hierarchyMap: FieldHierarchyMap = {
    questionParentMap: {},
    fieldIdMap: {},
    fieldParentMap: {},
  };

  // Pre-process rawQuestions to extract parent-child relationships
  if (rawQuestions && rawQuestions.length > 0) {
    rawQuestions.forEach((q) => {
      const questionCode = q["Question Code"];
      const parentQuestionCode = (q as ExcelQuestionDataWithParent)[
        "Parent Question Code"
      ];

      if (parentQuestionCode && parentQuestionCode.trim() !== "") {
        // Store relationship between child and parent question codes
        hierarchyMap.questionParentMap[questionCode] = parentQuestionCode;
      }
    });
  }

  // Add default fieldOptions for the top-level form wizard
  const defaultFieldOptions = {
    enable: true,
    readonly: false,
    required: false,
  };

  // Default form ID to use for any fields missing a groupField
  //   const defaultGroupField = `form_${questionnaireId.substring(0, 8)}`;
  const defaultGroupField = ``;

  // Step 1: Create the top-level group-wizard (always first)
  const wizardId = uuidv4();
  const wizardField = `${questionnaireId.substring(0, 8)}_form_wizard`;

  formFields.push({
    id: wizardId,
    formId: questionnaireId,
    interface: "group-wizard",
    type: "wizard",
    field: wizardField,
    seqIndex: 0,
    interfaceOptions: {
      label: "Questionnaire Wizard",
      description: "Navigate through the questionnaire sections",
      template: "template1",
      showControls: false,
      tabs: sections
        .filter((section) => section.sectionId === null)
        .map((section, index) => ({
          tabKey: index + 1,
          tabName: section.title || section.content,
          icon: {
            icon: "",
            size: "md",
            tooltip: section.title || section.content,
          },
        })),
    },
    fieldOptions: defaultFieldOptions,
    groupField: defaultGroupField,
  });

  // Store the wizard field ID in our map
  hierarchyMap.fieldIdMap[wizardField] = wizardId;

  // Step 2: Create group-wizard-step for only parent sections (where sectionId is null)
  let sectionIndex = 1;
  const sectionToStepMap: Record<string, string> = {};

  // Step 3: Create group-tabs only for parent sections
  const sectionToTabsMap: Record<string, string> = {};

  sections.forEach((section) => {
    // Only create group-wizard-step for parent sections (where sectionId is null)
    if (section.sectionId === null) {
      const stepId = uuidv4();
      sectionToStepMap[section.id] = stepId;

      // Process section code for field naming - replace dots with underscores
      const processedSectionCode = section.key;
      const stepField = `${processedSectionCode}_step`;

      //check if section has child sections
      const hasChildSections = sections.some(
        (child) => child.parentsectionCode === section.sectionCode
      );

      formFields.push({
        id: stepId,
        formId: questionnaireId,
        interface: "group-wizard-step",
        type: "wizard-step",
        field: stepField,
        seqIndex: sectionIndex,
        interfaceOptions: {
          title: section.content,
          breadcrumb: section.content,
        },
        displayOptions: {},
        groupField: wizardField,
        fieldOptions: defaultFieldOptions,
        sectionId: section.id, // Add sectionId to link back to section
      });

      // Store the step field ID in our map
      hierarchyMap.fieldIdMap[stepField] = stepId;
      // Store parent relationship
      hierarchyMap.fieldParentMap[stepField] = wizardField;

      const tabsId = uuidv4();

      if (stepId) {
        sectionToTabsMap[section.id] = tabsId;

        // Process section code for field naming - replace dots with underscores
        const tabsField = `${processedSectionCode}_tabs`;

        formFields.push({
          id: tabsId,
          formId: questionnaireId,
          interface: "group-tabs",
          type: "tabs",
          field: tabsField,
          seqIndex: 0,
          interfaceOptions: {
            ...(hasChildSections ? { title: "" } : {}),
            template: "pagination",
            breadcrumb: section.title || section.content,
          },
          displayOptions: {},
          groupField: stepField,
          sectionId: section.id,
          fieldOptions: defaultFieldOptions,
        });

        // Store the tabs field ID in our map
        hierarchyMap.fieldIdMap[tabsField] = tabsId;
        // Store parent relationship
        hierarchyMap.fieldParentMap[tabsField] = stepField;

        // Create a container map specifically for this section
        const sectionContainerMap: Record<string, string> = {};
        sectionContainerMap[section.key] = tabsId; // Map section code to tabs ID

        const formfieldquestions = processQuestionsForSectionRecursive({
          section,
          rawQuestions: rawQuestions || [],
          processedQuestions: questions,
          questionnaireId,
          formFields,
          hierarchyMap,
          parentContainerMap: { [section.key]: stepId },
          defaultFieldOptions,
          tabsField: undefined,
        });

        // Add the generated form fields to our main array
        if (formfieldquestions.length > 0) {
          formfieldquestions.forEach((field) => {
            formFields.push(field);
            console.log(
              `Added form field: ${field.interface} - ${field.field} - ${field.groupField} - ${field.sectionId} - ${field.id}`
            );
          });
        } else {
          console.warn(
            `No form fields were created for section ${section.key}`
          );
        }

        console.log(`Updated formFields total: ${formFields.length}`);
      }

      sectionIndex++;
    }

    // If this is a subsection (has a parent), create a sub-theme
    if (section.sectionId !== null) {
      console.log(
        `Creating sub-theme for section ${section.key} with parent ${section.sectionId}`
      );
      console.log("Full section data:", section);
      console.log("Available section data keys:", Object.keys(sectionData));
      console.log(
        "Full sectionData content:",
        JSON.stringify(sectionData, null, 2)
      );

      // Find the parent section code by looking up the section ID
      const parentSectionEntry = Object.entries(sectionData).find(
        ([_, data]) => data.id === section.sectionId
      );

      if (parentSectionEntry) {
        const [parentSectionCode, parentSectionData] = parentSectionEntry;
        console.log(`Found parent section with code ${parentSectionCode}`);
        console.log("Parent section data:", parentSectionData);
        // Convert section data to FormFieldSectionData
        const parentSection: FormFieldSectionData = {
          ...parentSectionData,
          formId: questionnaireId,
          weightage: 0,
          title: parentSectionData.content,
          description: null,
          tags: parentSectionData.tags || "",
        };

        const { subTheme, nextIndex } = createSectionSubTheme(
          {
            ...section,
            formId: questionnaireId,
            weightage: 0,
            title: section.content,
            description: null,
            tags: section.tags || "",
          },
          parentSection,
          // Convert all sections to FormFieldSectionData format
          Object.entries(sectionData).reduce(
            (acc, [key, data]) => {
              acc[key] = {
                ...data,
                formId: questionnaireId,
                weightage: 0,
                title: data.content,
                description: null,
                tags: data.tags || "",
              };
              return acc;
            },
            {} as Record<string, FormFieldSectionData>
          ),
          questionnaireId,
          sectionIndex
        );
        formFields.push(subTheme);
        sectionIndex = nextIndex;
      }
    }

    // Process child sections (where section.sectionId !== null)
    if (section.sectionId !== null) {
      console.log(
        `Processing child section ${section.key} with parent section ID ${section.sectionId}`
      );

      // Find the parent section's tabs ID from our mapping
      const parentTabsId = sectionToTabsMap[section.sectionId];

      if (parentTabsId) {
        console.log(
          `Found parent tabs ID ${parentTabsId} for child section ${section.key}`
        );

        // Find the parent tabs field by looking through our form fields
        const parentTabsField = formFields.find(
          (field) => field.id === parentTabsId
        )?.field;

        if (parentTabsField) {
          console.log(
            `Using parent tabs field ${parentTabsField} for child section ${section.key}`
          );

          // Create a container map for this child section, pointing to its parent's tabs ID
          const childSectionContainerMap: Record<string, string> = {
            [section.key]: parentTabsId,
          };

          // Process questions for this child section
          const childSectionFormFields = processQuestionsForSectionRecursive({
            section,
            rawQuestions: rawQuestions || [],
            processedQuestions: questions,
            questionnaireId,
            formFields,
            hierarchyMap,
            parentContainerMap: { [section.key]: parentTabsId },
            defaultFieldOptions,
            tabsField: parentTabsField,
          });

          // Add the generated form fields to our main array
          if (childSectionFormFields.length > 0) {
            childSectionFormFields.forEach((field) => {
              formFields.push(field);
              console.log(
                `Added child section form field: ${field.interface} - ${field.field}`
              );
            });
            console.log(
              `Added ${childSectionFormFields.length} form fields for child section ${section.key}`
            );
          } else {
            console.warn(
              `No form fields were created for child section ${section.key}`
            );
          }
        } else {
          console.warn(
            `Could not find parent tabs field for ID ${parentTabsId}`
          );
        }
      } else {
        // Check if this is a sub-child section (parent is also a child)
        // In this case, we need to trace up the hierarchy
        console.log(
          `No direct parent tabs ID found for child section ${section.key}. Checking if parent is also a child...`
        );

        // Find the parent section to see if it has a parent
        const parentSection = sections.find((s) => s.id === section.sectionId);
        if (parentSection && parentSection.sectionId !== null) {
          // This is a sub-child (nested hierarchy)
          console.log(
            `Section ${section.key} has a parent ${parentSection.key} which is also a child`
          );

          // Try to find the grandparent's tabs ID
          const grandparentTabsId = sectionToTabsMap[parentSection.sectionId];
          if (grandparentTabsId) {
            const grandparentTabsField = formFields.find(
              (field) => field.id === grandparentTabsId
            )?.field;

            if (grandparentTabsField) {
              console.log(
                `Using grandparent tabs field ${grandparentTabsField} for deeply nested section ${section.key}`
              );

              // Create container map for this nested child
              const nestedChildContainerMap: Record<string, string> = {
                [section.key]: grandparentTabsId,
              };

              // Process questions using the grandparent's tabs field
              const nestedChildFormFields = processQuestionsForSectionRecursive(
                {
                  section,
                  rawQuestions: rawQuestions || [],
                  processedQuestions: questions,
                  questionnaireId,
                  formFields,
                  hierarchyMap,
                  parentContainerMap: {
                    [section.key]: grandparentTabsId,
                  },
                  defaultFieldOptions,
                  tabsField: grandparentTabsField,
                }
              );

              // Add the generated form fields
              if (nestedChildFormFields.length > 0) {
                nestedChildFormFields.forEach((field) => {
                  formFields.push(field);
                  console.log(
                    `Added nested child section form field: ${field.interface} - ${field.field}`
                  );
                });
                console.log(
                  `Added ${nestedChildFormFields.length} form fields for nested child section ${section.key}`
                );
              } else {
                console.warn(
                  `No form fields were created for nested child section ${section.key}`
                );
              }
            }
          } else {
            console.warn(
              `Could not find tabs ID for grandparent of section ${section.key}`
            );
          }
        } else {
          console.warn(
            `No parent tabs ID found for child section ${section.key} with parent section ID ${section.sectionId}`
          );
        }
      }
    }
    // Remove the duplicate, unnecessary call to processQuestionsForSection
    // that was causing processing to happen twice for child sections
    /* Removing this problematic code that was causing duplicate processing
    const parentTabsField = sectionToTabsMap[section.sectionId];
    if (parentTabsField) {
      processQuestionsForSection({
        section,
        rawQuestions: rawQuestions || [],
        processedQuestions: questions,
        questionnaireId,
        formFields,
        hierarchyMap,
        parentContainerMap: { [section.key]: parentTabsField },
        defaultFieldOptions,
        tabsField: parentTabsField,
      });
    }
    */
  });

  // Ensure every form field has required fields
  return formFields.map((field) => ({
    ...field,
    // Make sure fieldOptions is never null
    fieldOptions: field.fieldOptions || defaultFieldOptions,
    // Make sure groupField is never null
    groupField: field.groupField || defaultGroupField,
  }));
};

/**
 * Helper function to determine if a question should be required
 * @param question - The processed question data
 * @returns Boolean indicating if the question should be required
 */
const isRequiredQuestion = (question: ProcessedQuestionData): boolean => {
  if (!question.isRequired) return false;

  const isRequired = question.isRequired ? question.isRequired : false;

  return isRequired;
};

/**
 * Determine the appropriate interface and field type for a question
 * based on its content and tags
 *
 * @param question - The processed question data
 * @returns Object with interfaceType and fieldType properties
 */
const determineInterfaceAndType = (
  question: ProcessedQuestionData
): {
  interfaceType: string;
  fieldType: string;
  interfaceOptions?: any;
  label?: string;
  visibleConditionRules?: any[];
} => {
  // Default interface and type
  let interfaceType = "input";
  let fieldType = "string";
  let interfaceOptions = {};

  const title = question.isMainQuestion ? question.questionCode || "" : "";
  const label = !question.isMainQuestion ? question.content || "" : "";
  const isHeading = !question.isMainQuestion ? true : false;
  const isAddcomment = !question.isMainQuestion ? true : false;
  const tooltip = question.tooltip || "";
  const visibleCondition = question.visibleCondition?.trim() || null;

  let visibleConditionRules: any[] = [];

  if (visibleCondition && visibleCondition.trim() !== "") {
    const visibleConditionFields = visibleCondition.split(".value");

    if (visibleConditionFields.length > 0) {
      const visibleConditionField =
        visibleConditionFields[0].trim().replace(/\./g, "_") || "";
      const visibleConditionValue = visibleConditionFields[1].trim() || "";
      const visibleConditionRule =
        visibleConditionField + ".value " + visibleConditionValue;
      visibleConditionRules = [
        {
          name: "if required",
          rule: visibleConditionRule,
          fieldOptions: {
            enable: true,
          },
        },
      ];
    } else {
      visibleConditionRules = [];
    }
  } else {
    visibleConditionRules = [];
  }

  console.log(
    "Processing question:",
    question.id,
    question.questionCode,
    question.isMainQuestion,
    title,
    question.content
  );

  // If tooltip is provided, set up infoIconProps and popoverDropdownProps
  let infoIconProps = {};
  let popoverDropdownProps = {};

  if (tooltip && tooltip.trim() !== "") {
    infoIconProps = {
      content:
        "<p>*YTD: From 1st day of Q1 till end of this reporting period.</p>",
      popoverProps: {
        width: "450px",
        shadow: "md",
        position: "bottom",
      },
    };

    popoverDropdownProps = {
      bg: "orange.1",
      sx: {
        borderRadius: "10px",
      },
    };

    interfaceOptions = {
      title: title,
      label: label,
      isAddcomment: isAddcomment,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
    };
  }

  // Extract tags if available
  const type = question.type
    ? question.type
        .replace("{", "")
        .replace("}", "")
        .split(",")
        .map((t: string) => t.trim().toLowerCase())
    : [];

  // Handle specific Excel sheet types from the 'type' column
  if (type.includes("text")) {
    interfaceType = "input";
    fieldType = "string";

    interfaceOptions = {
      title: title,
      label: label,
      placeholder: question.placeholder || "",
      isAddcomment: isAddcomment,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
    };
  } else if (type.includes("paragraph")) {
    interfaceType = "input";
    fieldType = "string";

    interfaceOptions = {
      title: title,
      isToolTip: true,
      isAdvanced: true,
      maxLength: question.max || 10000,
      placeholder: question.placeholder || "",
      isAddcomment: isAddcomment,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
    };
  } else if (type.includes("number")) {
    if (question.format && question.format.toLowerCase() === "percentage") {
      interfaceType = "number-input";
      fieldType = "percentage";

      interfaceOptions = {
        title: title,
        placeholder: question.placeholder || "",
        isAddcomment: isAddcomment,
        decimalLimit: 2,
        maxValue: 100,
        maxLength: 6,
        isToolTip: true,
        isAutoCalculate: false,
        ...(tooltip && {
          infoIconProps: infoIconProps,
          popoverDropdownProps: popoverDropdownProps,
        }),
      };
    } else if (
      question.format &&
      question.format.toLowerCase() === "currency"
    ) {
      interfaceType = "number-input";
      fieldType = "currency-with-comma";

      interfaceOptions = {
        title: title,
        placeholder: question.placeholder || "",
        prefix: "INR",
        columns: {
          lg: 3,
          md: 2,
          sm: 1,
          xs: 1,
        },
        spacing: 10,
        isHeading: isHeading,
        headingSize: "h6",
        isAddcomment: isAddcomment,
        ...(tooltip && {
          infoIconProps: infoIconProps,
          popoverDropdownProps: popoverDropdownProps,
        }),
      };
    } else if (question.format && question.format.toLowerCase() === "decimal") {
      interfaceType = "number-input";
      fieldType = "decimal-number";

      interfaceOptions = {
        title: title,
        ...(tooltip && {
          infoIconProps: infoIconProps,
          popoverDropdownProps: popoverDropdownProps,
        }),
        placeholder: "",
        isAddcomment: isAddcomment,
        isAutoCalculate: true,
        decimalLimit: 10,
      };
    } else if (question.format && question.format.toLowerCase() === "year") {
      interfaceType = "number-input";
      fieldType = "year";

      interfaceOptions = {
        title: title,
        ...(tooltip && {
          infoIconProps: infoIconProps,
          popoverDropdownProps: popoverDropdownProps,
        }),
        placeholder: question.placeholder || "",
        isAddcomment: isAddcomment,
      };
    } else if (
      question.format &&
      question.format.toLowerCase() === "month and year"
    ) {
      interfaceType = "number-input";
      fieldType = "month_year";

      interfaceOptions = {
        title: title,
        ...(tooltip && {
          infoIconProps: infoIconProps,
          popoverDropdownProps: popoverDropdownProps,
        }),
        placeholder: "Specify in year (mm/yyyy)",
        isAddcomment: isAddcomment,
      };
    } else {
      // Default number handling
      interfaceType = "number-input";
      fieldType = "number";

      interfaceOptions = {
        title: title,
        ...(tooltip && {
          infoIconProps: infoIconProps,
          popoverDropdownProps: popoverDropdownProps,
        }),
        placeholder: question.placeholder || "",
        isAddcomment: isAddcomment,
        maxValue: 999999999999999,
        spacing: 10,
        maxLength: 15,
      };
    }
  } else if (type.includes("phone")) {
    interfaceType = "input";
    fieldType = "global-phone-number";
    interfaceOptions = {
      title: title,
      placeholder: question.placeholder || "",
      isAddcomment: isAddcomment,
      maxLength: 25,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
    };
  } else if (type.includes("percentage")) {
    interfaceType = "number-input";
    fieldType = "percentage";
    interfaceOptions = {
      title: title,
      placeholder: question.placeholder || "",
      isAddcomment: isAddcomment,
      decimalLimit: 2,
      maxValue: 100,
      maxLength: 6,
      isToolTip: true,
      isAutoCalculate: false,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
    };
  } else if (type.includes("currency")) {
    interfaceType = "number-input";
    fieldType = "currency-with-comma";
    interfaceOptions = {
      title: title,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      placeholder: question.placeholder || "",
      prefix: "INR",
      columns: {
        lg: 3,
        md: 2,
        sm: 1,
        xs: 1,
      },
      spacing: 10,
      isHeading: isHeading,
      headingSize: "h6",
      isAddcomment: isAddcomment,
    };
  } else if (type.includes("decimal")) {
    interfaceType = "number-input";
    fieldType = "decimal-number";
    interfaceOptions = {
      title: title,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      placeholder: "",
      isAddcomment: isAddcomment,
      isAutoCalculate: false,
      decimalLimit: 10,
    };
  } else if (type.includes("file")) {
    interfaceType = "file";
    fieldType = "array";

    interfaceOptions = {
      title: title,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      isAddcomment: isAddcomment,
      accept: ["application/pdf"],
      showLabel: true,
      maxSizeInMb: 2,
      placeholder: "Choose",
      allowMultiple: false,
      directoryPath: "",
      maxFilesCount: 1,
    };
  } else if (type.includes("date")) {
    interfaceType = "datetime";
    fieldType = "string";

    interfaceOptions = {
      title: title,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      isAddcomment: isAddcomment,
      placeholder: question.placeholder || "",
    };
  } else if (type.includes("singleselect")) {
    interfaceType = "select-dropdown";
    fieldType = "string";

    const choices = question.options?.split("|").map((opt) => ({
      label: opt.trim(),
      value: opt.trim(),
    }));
    interfaceOptions = {
      title: title,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      placeholder: "Choose",
      isAddcomment: isAddcomment,
      choices: choices || [],
      creatable: (choices || []).length === 0 ? true : false,
      isHeading: isHeading,
      headingSize: "h2",
      searchable: true,
      showTitleDivider: false,
    };
  } else if (type.includes("radio")) {
    interfaceType = "select-radio";
    fieldType = "string";
    const choices = question.options?.split("|").map((opt) => ({
      label: opt.trim(),
      value: opt.trim(),
    }));
    interfaceOptions = {
      title: title,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      choices: choices || [],
      tooltip: "",
      isHeading: isHeading,
      headingSize: "h2",
      isAddcomment: isAddcomment,
    };
  } else if (type.includes("multiselect")) {
    interfaceType = "select-multiple-dropdown";
    fieldType = "array";
    const choices = question.options?.split("|").map((opt) => ({
      label: opt.trim(),
      value: opt.trim(),
    }));
    interfaceOptions = {
      title: title,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      //
      placeholder: question.placeholder || "Choose",
      //   showLabel: true,
      //   allowClear: true,
      choices: choices || [],
      creatable: false,
      isHeading: true,
      searchable: true,
      headingSize: "h6",
      isAddcomment: isAddcomment,
      showTitleDivider: false,
      maxSelectedValues: 0,
    };
  } else if (type.includes("multiselect table")) {
    interfaceType = "multi-select-row"; // Or a more specialized interface if available
    fieldType = "array";

    interfaceOptions = {
      apiUrl: "",
      title: title,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      isAddcomment: isAddcomment,
      choices: [],
      maxValue: 5,
      creatable: true,
      isNumeric: true,
      searchable: true,
      description: "",
      placeholder: "Select",
    };
  } else if (type.includes("label")) {
    interfaceType = "label";
    fieldType = "label";

    interfaceOptions = {
      title: title,
      columns: {
        lg: 3,
        md: 2,
        sm: 1,
        xs: 1,
      },
      spacing: 10,
      isHeading: true,
      headingSize: "h5",
      textComponentProps: {
        c: "teal.4",
        fz: "lg",
      },
    };
  }
  // Fall back to content-based determination if no specific type tag is found
  //   else if (type.includes("radio") || type.includes("single-select")) {
  //     interfaceType = "select-radio";
  //     fieldType = "string";
  //     const choices = question.options?.split("|").map((opt) => ({
  //       label: opt.trim(),
  //       value: opt.trim(),
  //     }));

  //     interfaceOptions = {
  //       title: question.questionCode || "",
  //       label: question.questionCode || "",
  //       tooltip: "",
  //       placeholder: "Choose",
  //       isAddcomment: true,
  //       choices: choices || [],
  //     };
  //   }
  //   else if (type.includes("checkbox") || type.includes("multi-select")) {
  //     interfaceType = "checkbox-group";
  //     fieldType = "array";
  //   }

  return {
    interfaceType,
    fieldType,
    interfaceOptions,
    label,
    visibleConditionRules,
  };
};

/**
 * Interface for function parameters to process questions for a section
 */
interface ProcessQuestionsParams {
  section: FormFieldSectionData;
  rawQuestions: ExcelQuestionData[];
  processedQuestions: ProcessedQuestionData[];
  questionnaireId: string;
  formFields: FormField_Insert_Input[];
  hierarchyMap: FieldHierarchyMap;
  parentContainerMap?: Record<string, string>;
  defaultFieldOptions?: any;
  tabsField: string | undefined;
}

/**
 * Interface for a question node in the hierarchical tree structure
 * Used in the recursive processing approach
 */
interface QuestionNode {
  questionCode: string;
  rawQuestion: ExcelQuestionData;
  processedQuestion: ProcessedQuestionData | undefined;
  children: QuestionNode[];
  container?: {
    id: string;
    field: string;
  };
  formField?: {
    id: string;
    field: string;
  };
}

/**
 * Process questions for a specific section using a recursive approach to handle hierarchies
 * This is an alternative implementation of processQuestionsForSection using recursion
 *
 * @param params - Processing parameters object
 * @returns Array of form fields created for the section
 */
export const processQuestionsForSectionRecursive = (
  params: ProcessQuestionsParams
): FormField_Insert_Input[] => {
  const {
    section,
    rawQuestions,
    processedQuestions,
    questionnaireId,
    formFields,
    hierarchyMap,
    parentContainerMap = {},
    defaultFieldOptions = {
      enable: true,
      readonly: false,
      required: false,
    },
    tabsField,
  } = params;

  const tabsFieldName = tabsField || section.key.replace(/\./g, "_") + "_tabs";

  console.log(`tabsFieldName for section ${section.key}: ${tabsFieldName}`);

  // Local variables to track state
  const sectionFormFields: FormField_Insert_Input[] = [];
  let questionIndex = 1;
  let fieldIndex = 1;

  // Find the section code from the section object
  const sectionCode = section.key;
  if (!sectionCode) {
    console.warn(
      `Section ${section.id} has no code, skipping question processing`
    );
    return sectionFormFields;
  }

  // Process section code for field naming - replace dots with underscores
  const processedSectionCode = sectionCode.replace(/\./g, "_");

  // Find the parent container for this section
  // This could be a tab container or the step itself
  let sectionParentId: string | undefined;

  // Use the provided parent container map or look for the parent ID
  if (parentContainerMap[section.key]) {
    sectionParentId = parentContainerMap[section.key];
    console.log(
      `Found parent container ${sectionParentId} for section ${section.key}`
    );
  } else if (section.sectionId) {
    // Try to find parent using section hierarchy
    // Just check if we have a mapping for the parent section ID
    if (parentContainerMap[section.sectionId]) {
      sectionParentId = parentContainerMap[section.sectionId];
      console.log(
        `Found parent container ${sectionParentId} for section ${section.key} via section ID`
      );
    } else {
      console.log(
        `Looking up parent container for section ${section.key}`,
        parentContainerMap
      );
    }
  } else {
    console.log(
      `Looking up parent container for section ${section.key}`,
      parentContainerMap
    );
  }

  // If no parent ID found, we'll use the tabsField parameter as fallback
  if (!sectionParentId && tabsField) {
    // Find the tabs ID from the hierarchy map using tabsField
    sectionParentId = hierarchyMap.fieldIdMap[tabsField];
    console.log(
      `Using tabsField ${tabsField} as fallback, found ID: ${sectionParentId}`
    );
  }

  // If still no parent ID found, we can't proceed
  if (!sectionParentId) {
    console.warn(
      `No parent container found for section ${section.key}, skipping question processing`
    );
    return sectionFormFields;
  }

  // Build maps for quick lookups
  const questionMap = new Map<string, ProcessedQuestionData>();
  const childQuestionsMap = new Map<string, ExcelQuestionData[]>();
  // Track processed questions to avoid duplicates
  const processedQuestionCodes = new Set<string>();

  // Build the questionMap for looking up processed questions
  console.log("===== BUILDING QUESTION MAP =====");
  processedQuestions.forEach((q) => {
    if (q.key) {
      console.log(`Adding to questionMap: ${q.key}`);
      questionMap.set(q.key, q);

      // Also add alternative mappings for better matching
      // Handle cases where section prefixes might be different
      const keyWithoutSection = q.key.split(".").pop(); // Get last part (e.g., Q1 from S1.Q1)
      if (keyWithoutSection && keyWithoutSection !== q.key) {
        console.log(
          `Adding alternative mapping: ${keyWithoutSection} -> ${q.key}`
        );
        questionMap.set(keyWithoutSection, q);
      }

      // Handle underscore variations
      const keyWithUnderscores = q.key.replace(/\./g, "_");
      if (keyWithUnderscores !== q.key) {
        console.log(
          `Adding underscore mapping: ${keyWithUnderscores} -> ${q.key}`
        );
        questionMap.set(keyWithUnderscores, q);
      }
    }
  });
  console.log(`Total questionMap entries: ${questionMap.size}`);

  // Helper function to normalize section codes for comparison
  const normalizeCode = (code: string): string => {
    return code.trim().toLowerCase().replace(/\./g, "_");
  };

  // Build the child questions map
  rawQuestions.forEach((q) => {
    const questionCode = q["Question Code"];

    // Check for parent-child relationship
    const parentCode = (q as ExcelQuestionDataWithParent)[
      "Parent Question Code"
    ];
    if (parentCode && parentCode.trim() !== "") {
      console.log(
        `Found child question: ${questionCode} -> parent: ${parentCode.trim()}`
      );

      if (!childQuestionsMap.has(parentCode.trim())) {
        childQuestionsMap.set(parentCode.trim(), []);
      }
      childQuestionsMap.get(parentCode.trim())?.push(q);

      // Also update the hierarchy map with the trimmed parent code
      hierarchyMap.questionParentMap[questionCode] = parentCode.trim();
    } else {
      // If parentCode is blank, this is a top-level question
      // Make sure it's properly associated with the tabs field if available
      console.log(
        `Question ${questionCode} has no parent - treating as top-level question`
      );
      if (tabsField) {
        console.log(
          `Associating question ${questionCode} with tabs field ${tabsField}`
        );
        // We don't add a direct relationship in childQuestionsMap since it's not a parent-child relationship
        // But we ensure it will be placed properly in the form structure
      }
    }
  });

  // Filter questions that belong to this section - use more precise matching
  const questionsForThisSection = rawQuestions.filter((q) => {
    const questionSectionCode = q["Section Code"];
    if (!questionSectionCode) return false;

    // Use exact match as primary strategy
    const exactMatch = questionSectionCode === section.key;

    // Use normalized match as secondary strategy (handles case and dot differences)
    const normalizedMatch =
      normalizeCode(questionSectionCode) === normalizeCode(section.key);

    // Only use prefix match for clear parent-child relationships
    // e.g. "S2_1" is clearly part of "S2"
    const prefixMatch =
      (questionSectionCode.includes("_") &&
        section.key === questionSectionCode.split("_")[0]) ||
      (section.key.includes("_") &&
        questionSectionCode === section.key.split("_")[0]);

    return exactMatch || normalizedMatch || prefixMatch;
  });

  console.log(
    `Found ${questionsForThisSection.length} questions for section ${section.key} after flexible matching`
  );

  /**
   * Build a tree structure from raw questions
   */
  function buildQuestionTree(
    questionsForSection: ExcelQuestionData[],
    childQuestionsMap: Map<string, ExcelQuestionData[]>,
    questionMap: Map<string, ProcessedQuestionData>
  ): QuestionNode[] {
    // First, ensure the childQuestionsMap is fully populated with all parent-child relationships
    questionsForSection.forEach((q) => {
      const questionCode = q["Question Code"];
      const parentCode = (q as ExcelQuestionDataWithParent)[
        "Parent Question Code"
      ];

      if (parentCode && parentCode.trim() !== "") {
        const trimmedParentCode = parentCode.trim();
        console.log(
          `Found parent-child relationship: ${questionCode} -> ${trimmedParentCode}`
        );

        // Create the entry in the map if it doesn't exist
        if (!childQuestionsMap.has(trimmedParentCode)) {
          childQuestionsMap.set(trimmedParentCode, []);
          console.log(
            `Created new entry in childQuestionsMap for parent ${trimmedParentCode}`
          );
        }

        // Check if this child question is already in the map to avoid duplicates
        const existingChildren = childQuestionsMap.get(trimmedParentCode) || [];
        const alreadyExists = existingChildren.some(
          (child) => child["Question Code"] === questionCode
        );

        if (!alreadyExists) {
          childQuestionsMap.get(trimmedParentCode)?.push(q);
          console.log(
            `Added child ${questionCode} to parent ${trimmedParentCode} in childQuestionsMap`
          );
        }

        // Make sure this relationship is in the hierarchy map
        hierarchyMap.questionParentMap[questionCode] = trimmedParentCode;
      }
    });

    // Get all main/root questions (is main question or has no parent)
    const rootQuestions = questionsForSection.filter((q) => {
      const isMainQuestion = q["Is Main Question"]?.toLowerCase() === "yes";
      const parentCode = (q as ExcelQuestionDataWithParent)[
        "Parent Question Code"
      ];
      const hasNoParent = !parentCode || parentCode.trim() === "";

      // For this section, prioritize main questions and questions without parents
      const isRoot = isMainQuestion || hasNoParent;
      if (isRoot) {
        console.log(
          `Identified root question: ${q["Question Code"]} (isMain: ${isMainQuestion}, hasNoParent: ${hasNoParent})`
        );
      }
      return isRoot;
    });

    // If we have main questions, prioritize those
    const mainQuestions = rootQuestions.filter(
      (q) => q["Is Main Question"]?.toLowerCase() === "yes"
    );

    console.log(
      `Found ${mainQuestions.length} main questions and ${rootQuestions.length} total root questions`
    );

    const questionsToProcess =
      mainQuestions.length > 0 ? mainQuestions : rootQuestions;

    console.log(
      `Processing ${questionsToProcess.length} root questions for tree building: ${questionsToProcess.map((q) => q["Question Code"]).join(", ")}`
    );

    // Build tree recursively
    return questionsToProcess.map((q) =>
      buildQuestionNodeRecursively(
        q,
        childQuestionsMap,
        questionMap,
        new Set<string>() // For tracking processed questions
      )
    );
  }

  /**
   * Recursively build a question node and its children
   */
  function buildQuestionNodeRecursively(
    rawQuestion: ExcelQuestionData,
    childQuestionsMap: Map<string, ExcelQuestionData[]>,
    questionMap: Map<string, ProcessedQuestionData>,
    processedCodes: Set<string>
  ): QuestionNode {
    const questionCode = rawQuestion["Question Code"];

    // Prevent circular references and duplicates
    if (processedCodes.has(questionCode)) {
      console.warn(`Circular reference detected for question ${questionCode}`);
      return {
        questionCode,
        rawQuestion,
        processedQuestion: questionMap.get(questionCode),
        children: [],
      };
    }
    processedCodes.add(questionCode);

    // Debug the processed question
    const processedQ = questionMap.get(questionCode);
    console.log(
      `Building node for question ${questionCode} (processed: ${processedQ ? "yes" : "no"})`
    );

    // Get children and process them recursively
    // Need to construct the full parent key (sectionCode.questionCode) to match childQuestionsMap keys
    const sectionCode = rawQuestion["Section Code"];
    const fullParentKey = `${sectionCode}.${questionCode}`;

    // Try both the full key and just the question code for backwards compatibility
    let childQuestions =
      childQuestionsMap.get(fullParentKey) ||
      childQuestionsMap.get(questionCode) ||
      [];

    console.log(
      `Processing children for ${questionCode} (full key: ${fullParentKey}), found ${childQuestions.length} children`
    );

    if (childQuestions.length > 0) {
      console.log(
        `Child question codes: ${childQuestions.map((c) => c["Question Code"]).join(", ")}`
      );
    }

    // Sort children by sequence if available
    const sortedChildren = [...childQuestions].sort((a, b) => {
      const seqA = parseInt(a["Sequence"] || "0", 10);
      const seqB = parseInt(b["Sequence"] || "0", 10);
      return seqA - seqB;
    });

    const children = sortedChildren.map((childQ) => {
      console.log(
        `Building node for child ${childQ["Question Code"]} of parent ${questionCode}`
      );
      return buildQuestionNodeRecursively(
        childQ,
        childQuestionsMap,
        questionMap,
        new Set([...processedCodes])
      );
    });

    // Log child structure for debugging
    if (children.length > 0) {
      console.log(
        `Question ${questionCode} has ${children.length} child nodes:`
      );
      children.forEach((child) => {
        console.log(`  - Child: ${child.questionCode}`);
      });
    }

    return {
      questionCode,
      rawQuestion,
      processedQuestion: questionMap.get(questionCode),
      children,
    };
  }

  /**
   * Process the question tree recursively to generate form fields
   */
  function processQuestionTreeRecursively(
    nodes: QuestionNode[],
    params: {
      section: FormFieldSectionData;
      questionnaireId: string;
      sectionParentId: string;
      tabsField: string | undefined;
      hierarchyMap: FieldHierarchyMap;
      processedSectionCode: string;
      processedQuestionCodes: Set<string>;
    },
    depth: number = 0,
    parentContainer?: { id: string; field: string },
    currentQuestionIndex: number = 1,
    currentFieldIndex: number = 1
  ): {
    formFields: FormField_Insert_Input[];
    questionIndex: number;
    fieldIndex: number;
  } {
    const formFields: FormField_Insert_Input[] = [];
    let questionIndex = currentQuestionIndex;
    let fieldIndex = currentFieldIndex;

    console.log("tab field:", params.tabsField);

    console.log(
      `Processing ${nodes.length} nodes at depth ${depth}${parentContainer ? ` with parent container ${parentContainer.field}` : ""}`
    );

    // Log all nodes being processed
    if (nodes.length > 0) {
      console.log(
        `Processing nodes: ${nodes.map((n) => n.questionCode).join(", ")}`
      );

      // Debug the child questions map
      console.log("Current childQuestionsMap entries:");
      childQuestionsMap.forEach((children, parent) => {
        console.log(
          `Parent ${parent} has children: ${children.map((c) => c["Question Code"]).join(", ")}`
        );
      });
    }

    // Process each node at current level
    for (const node of nodes) {
      const questionCode = node.questionCode;

      // Skip if already processed
      if (params.processedQuestionCodes.has(questionCode)) {
        continue;
      }

      params.processedQuestionCodes.add(questionCode);

      // Get the processed question data
      let processedQuestion = node.processedQuestion;
      if (!processedQuestion) {
        console.warn(
          `No processed question found for question ${questionCode}. Looking for it in the questionMap.`
        );

        // Try to find the processed question in the questionMap using the raw question key
        const rawQuestionKey = node.rawQuestion["Question Code"];
        if (questionMap.has(rawQuestionKey)) {
          console.log(
            `Found processed question for ${questionCode} in questionMap`
          );
          processedQuestion = questionMap.get(rawQuestionKey);
          node.processedQuestion = processedQuestion;
        } else {
          console.warn(`Could not find processed question for ${questionCode}`);
          continue;
        }
      }

      // Double-check that we now have a processed question
      if (!processedQuestion) {
        console.warn(
          `Still no processed question found for ${questionCode} after looking in questionMap`
        );
        continue;
      }

      // Process question code for field naming
      const processedQuestionCode = questionCode.replace(/\./g, "_");

      // Create container for main questions or questions with children at depth 0
      let containerField: string;
      let questionContainerId: string;

      if (
        depth === 0 ||
        node.rawQuestion["Is Main Question"]?.toLowerCase() === "yes"
      ) {
        // Create container for this question
        questionContainerId = uuidv4();
        containerField = `${params.processedSectionCode}_${processedQuestionCode}`;

        // Store container info in the node
        node.container = {
          id: questionContainerId,
          field: containerField,
        };

        // Create the container form field
        const containerFormField: FormField_Insert_Input = {
          id: questionContainerId,
          formId: params.questionnaireId,
          sectionId: params.section.id,
          questionId: processedQuestion.id || null, // Only use the actual question ID
          interface: "group-detail",
          type: "container",
          field: containerField,
          seqIndex: questionIndex++,
          interfaceOptions: {
            title: questionCode,
            columns: {
              lg: 3,
              md: 2,
              sm: 1,
              xs: 1,
            },
            spacing: 10,
            isHeading: true,
            headingSize: "h4",
            isAddcomment: true,
          },
          ...(params.section.parentsectionCode
            ? { subtheme: params.section.title || params.section.content }
            : {}),
          fieldOptions: {
            label: processedQuestion.content,
            enable: true,
            readonly: false,
            required: false,
          },
          displayOptions: {
            orientation: "vertical",
          },
          // Ensure we always have a valid groupField - if tabsField is not available, fallback to another valid container
          groupField:
            params.tabsField ||
            parentContainer?.field ||
            tabsFieldName ||
            "wizard_tabs",
        };

        // Add container to form fields
        formFields.push(containerFormField);

        // Store container in hierarchy map
        params.hierarchyMap.fieldIdMap[containerField] = questionContainerId;

        // Create form field for the question itself
        const {
          interfaceType,
          fieldType,
          interfaceOptions,
          label,
          visibleConditionRules,
        } = determineInterfaceAndType(processedQuestion);
        const questionId = uuidv4();
        const questionField = `${containerField}_field`; // Make unique from container

        // Store form field info in the node
        node.formField = {
          id: questionId,
          field: questionField,
        };

        const questionFormField: FormField_Insert_Input = {
          id: questionId,
          formId: params.questionnaireId,
          sectionId: params.section.id,
          questionId: processedQuestion.id || null, // Only use the actual question ID
          interface: interfaceType,
          type: fieldType,
          field: questionField,
          seqIndex: fieldIndex++,
          dataPoint: processedQuestion.key,
          subtheme: "",
          interfaceOptions: interfaceOptions,
          fieldOptions: {
            label: label,
            enable:
              visibleConditionRules && visibleConditionRules.length > 0
                ? false
                : true, // Start disabled if visibility rules exist
            readonly: false,
            required: isRequiredQuestion(processedQuestion),
          },
          displayOptions: {
            orientation: "horizontal",
          },
          ...(visibleConditionRules &&
            visibleConditionRules.length > 0 && {
              displayRules: visibleConditionRules,
            }),
          // Ensure groupField is never empty for question fields
          groupField: containerField || "wizard_tabs",
        };

        // Add question form field
        formFields.push(questionFormField);

        // Store in hierarchy map
        params.hierarchyMap.fieldIdMap[questionField] = questionId;
        params.hierarchyMap.fieldParentMap[questionField] = containerField;
      } else {
        // This is a child question
        if (!parentContainer) {
          console.warn(
            `No parent container found for child question ${questionCode}`
          );
          continue;
        }

        console.log(
          `Creating child form field for question ${questionCode} in parent container ${parentContainer.field}`
        );

        // Process child question
        const childField = `${params.processedSectionCode}_${processedQuestionCode}`;

        // Determine interface and type for child question
        const {
          interfaceType,
          fieldType,
          interfaceOptions,
          label,
          visibleConditionRules,
        } = determineInterfaceAndType(processedQuestion);

        // Create form field for child question
        const childId = uuidv4();

        // Store form field info in the node
        node.formField = {
          id: childId,
          field: childField,
        };

        // Log detailed information for debugging
        console.log(`Child question ${questionCode} details:`, {
          id: childId,
          field: childField,
          processedQuestion: processedQuestion ? "exists" : "missing",
          parentContainerId: parentContainer.id,
          parentContainerField: parentContainer.field,
          interfaceType,
          fieldType,
          parentQuestionId: processedQuestion.parentQuestionId || "N/A",
          QuestionId: processedQuestion.id || "N/A",
        });

        const childFormField: FormField_Insert_Input = {
          id: childId,
          formId: params.questionnaireId,
          sectionId: params.section.id,
          questionId: processedQuestion.parentQuestionId,
          interface: interfaceType,
          type: fieldType,
          field: childField,
          seqIndex: fieldIndex++,
          dataPoint: processedQuestion.key,
          subtheme: "",
          interfaceOptions: interfaceOptions,
          fieldOptions: {
            label: label,
            enable:
              visibleConditionRules && visibleConditionRules.length > 0
                ? false
                : true,
            readonly: false,
            required: isRequiredQuestion(processedQuestion),
          },
          displayOptions: {
            orientation: "horizontal",
          },
          ...(visibleConditionRules &&
            visibleConditionRules.length > 0 && {
              displayRules: visibleConditionRules,
            }),
          // Ensure groupField is never empty, use parentContainer.field or fallback to a default
          groupField: parentContainer.field || "wizard_tabs",
        };

        // Add child form field
        formFields.push(childFormField);
        console.log(
          `Added child form field ${childField} to parent ${parentContainer.field} (ID: ${childId}) for question ${processedQuestion.key}`
        );

        // Store in hierarchy map
        params.hierarchyMap.fieldIdMap[childField] = childId;
        params.hierarchyMap.fieldParentMap[childField] = parentContainer.field;

        // Set container for potential children
        containerField = parentContainer.field;
        questionContainerId = parentContainer.id;

        // Also update the node.container so any child nodes will be processed correctly
        node.container = {
          id: parentContainer.id,
          field: parentContainer.field,
        };
        console.log(
          `Set container for node ${questionCode} to parent container ${parentContainer.field}`
        );
      }

      // Process this node's children recursively
      if (node.children.length > 0) {
        console.log(
          `Processing ${node.children.length} child nodes for question ${node.questionCode}`
        );

        // Determine the container to use for child nodes
        const container = node.container || parentContainer;
        if (!container) {
          console.warn(
            `No container found for question ${node.questionCode}'s children`
          );
          continue;
        }

        console.log(
          `Using container ${container.field} for children of ${node.questionCode}`
        );

        // Log each child node before processing
        node.children.forEach((childNode) => {
          console.log(`Child node to process: ${childNode.questionCode}`);
        });

        const childResults = processQuestionTreeRecursively(
          node.children,
          params,
          depth + 1,
          container,
          questionIndex,
          fieldIndex
        );

        // Add child form fields to our results
        formFields.push(...childResults.formFields);
        console.log(
          `Added ${childResults.formFields.length} child form fields from ${node.questionCode}`
        );

        // Log each child form field that was created
        childResults.formFields.forEach((field) => {
          console.log(
            `Created child form field: ${field.field} with parent ${field.groupField}`
          );
        });

        questionIndex = childResults.questionIndex;
        fieldIndex = childResults.fieldIndex;
      }
    }

    return { formFields, questionIndex, fieldIndex };
  }

  /**
   * Process miscellaneous/standalone questions that aren't part of the main hierarchy
   */
  function processMiscellaneousQuestions(
    miscQuestions: ExcelQuestionData[],
    params: {
      section: FormFieldSectionData;
      questionnaireId: string;
      sectionParentId: string;
      tabsField: string | undefined;
      hierarchyMap: FieldHierarchyMap;
      processedSectionCode: string;
      processedQuestionCodes: Set<string>;
    },
    questionIndex: number,
    fieldIndex: number
  ): {
    formFields: FormField_Insert_Input[];
    questionIndex: number;
    fieldIndex: number;
    defaultContainer: { id: string; field: string } | undefined;
  } {
    // Filter out questions that have already been processed
    // And ensure we're only processing standalone questions without parents
    const remainingQuestions = miscQuestions.filter((q) => {
      const questionCode = q["Question Code"];

      // Skip if already processed
      if (params.processedQuestionCodes.has(questionCode)) return false;

      // Ensure we don't process child questions here
      const parentCode = (q as ExcelQuestionDataWithParent)[
        "Parent Question Code"
      ];
      if (parentCode && parentCode.trim() !== "") {
        // If the parent has already been processed, we need to handle the child
        // This should be rare if the tree building worked correctly
        const parentProcessed = params.processedQuestionCodes.has(
          parentCode.trim()
        );
        // If the parent isn't processed, this child may be an orphan
        return !parentProcessed;
      }

      return true;
    });

    if (remainingQuestions.length === 0) {
      return {
        formFields: [],
        questionIndex,
        fieldIndex,
        defaultContainer: undefined,
      };
    }

    const formFields: FormField_Insert_Input[] = [];
    let localQuestionIndex = questionIndex;
    let localFieldIndex = fieldIndex;

    // Create a default container for these questions
    const defaultContainerId = uuidv4();
    // Use a more specific container name to avoid conflicts
    const defaultContainerField = `${params.processedSectionCode}_container`;

    // Create a default container for misc questions
    const defaultContainer: FormField_Insert_Input = {
      id: defaultContainerId,
      formId: params.questionnaireId,
      sectionId: params.section.id,
      interface: "group-detail",
      type: "container",
      field: defaultContainerField,
      seqIndex: localQuestionIndex++,
      interfaceOptions: {
        title: `${params.section.title || params.section.content || "Section"} Questions`,
        columns: {
          lg: 3,
          md: 2,
          sm: 1,
          xs: 1,
        },
        spacing: 10,
        isHeading: true,
        headingSize: "h4",
        isAddcomment: true,
      },
      ...(params.section.parentsectionCode
        ? { subtheme: params.section.title || params.section.content }
        : {}),
      fieldOptions: {
        label: `${params.section.title || params.section.content || "Section"} Questions`,
        enable: true,
        readonly: false,
        required: false,
      },
      displayOptions: {
        orientation: "vertical",
      },
      // Use the parent container for this section rather than just tabs field
      groupField: params.sectionParentId
        ? params.hierarchyMap.fieldIdMap[params.sectionParentId] ||
          params.tabsField
        : params.tabsField,
    };

    formFields.push(defaultContainer);
    params.hierarchyMap.fieldIdMap[defaultContainerField] = defaultContainerId;

    // Process each misc question
    remainingQuestions.forEach((rawQ) => {
      const questionCode = rawQ["Question Code"];
      params.processedQuestionCodes.add(questionCode);

      // Find the processed question data
      const processedQuestion = questionMap.get(questionCode);
      if (!processedQuestion) {
        console.warn(
          `No processed question found for misc question ${questionCode}`
        );
        return;
      }

      // Process question code for field naming
      const processedQuestionCode = questionCode.replace(/\./g, "_");
      const questionField = `${params.processedSectionCode}_${processedQuestionCode}`;

      // Determine interface and type
      const {
        interfaceType,
        fieldType,
        interfaceOptions,
        label,
        visibleConditionRules,
      } = determineInterfaceAndType(processedQuestion);

      // Create form field for the question
      const questionId = uuidv4();

      const questionFormField: FormField_Insert_Input = {
        id: questionId,
        formId: params.questionnaireId,
        sectionId: params.section.id,
        questionId: processedQuestion.parentQuestionId,
        interface: interfaceType,
        type: fieldType,
        field: questionField,
        seqIndex: localFieldIndex++,
        dataPoint: processedQuestion.key,
        subtheme: "",
        interfaceOptions: interfaceOptions,
        fieldOptions: {
          label: label,
          enable:
            visibleConditionRules && visibleConditionRules.length > 0
              ? false
              : true,
          readonly: false,
          required: isRequiredQuestion(processedQuestion),
        },
        displayOptions: {
          orientation: "horizontal",
        },
        ...(visibleConditionRules &&
          visibleConditionRules.length > 0 && {
            displayRules: visibleConditionRules,
          }),
        groupField: defaultContainerField,
      };

      // Add question form field
      formFields.push(questionFormField);

      // Store in hierarchy map
      params.hierarchyMap.fieldIdMap[questionField] = questionId;
      params.hierarchyMap.fieldParentMap[questionField] = defaultContainerField;
    });

    return {
      formFields,
      questionIndex: localQuestionIndex,
      fieldIndex: localFieldIndex,
      defaultContainer: {
        id: defaultContainerId,
        field: defaultContainerField,
      },
    };
  }

  // Make sure childQuestionsMap is fully populated
  questionsForThisSection.forEach((q) => {
    const questionCode = q["Question Code"];
    const parentCode = (q as ExcelQuestionDataWithParent)[
      "Parent Question Code"
    ];

    if (parentCode && parentCode.trim() !== "") {
      const trimmedParentCode = parentCode.trim();
      console.log(
        `Adding child relationship: ${questionCode} -> parent: ${trimmedParentCode}`
      );

      if (!childQuestionsMap.has(trimmedParentCode)) {
        childQuestionsMap.set(trimmedParentCode, []);
        console.log(
          `Created new childQuestionsMap entry for parent ${trimmedParentCode}`
        );
      }

      // Avoid duplicates
      const existingChildren = childQuestionsMap.get(trimmedParentCode) || [];
      const alreadyExists = existingChildren.some(
        (child) => child["Question Code"] === questionCode
      );

      if (!alreadyExists) {
        childQuestionsMap.get(trimmedParentCode)?.push(q);
        console.log(
          `Added child ${questionCode} to parent ${trimmedParentCode} in childQuestionsMap`
        );
      }

      // Update hierarchy map with parent-child relationship
      hierarchyMap.questionParentMap[questionCode] = trimmedParentCode;

      // Also verify that the processed question exists for this child
      if (questionMap.has(questionCode)) {
        console.log(`Found processed question for child ${questionCode}`);
      } else {
        console.warn(`No processed question found for child ${questionCode}`);
      }
    }
  });

  // For debugging - dump the childQuestionsMap
  console.log("Child Questions Map contents:");
  childQuestionsMap.forEach((children, parent) => {
    console.log(
      `Parent ${parent} has children: ${children.map((c) => c["Question Code"]).join(", ")}`
    );
  });

  // Build the question tree
  const questionTree = buildQuestionTree(
    questionsForThisSection,
    childQuestionsMap,
    questionMap
  );

  console.log(`Built question tree with ${questionTree.length} root nodes`);

  // Log the tree structure for debugging
  questionTree.forEach((node: QuestionNode) => {
    console.log(
      `Root node: ${node.questionCode} with ${node.children.length} children`
    );
    logNodeStructure(node, 1);
  });

  // Helper function to log the tree structure
  function logNodeStructure(node: QuestionNode, depth: number) {
    const indent = "  ".repeat(depth);
    node.children.forEach((child) => {
      console.log(
        `${indent}- Child: ${child.questionCode} with ${child.children.length} sub-children`
      );
      logNodeStructure(child, depth + 1);
    });
  }

  // Log childQuestionsMap for debugging
  console.log("===== PARENT-CHILD RELATIONSHIPS =====");
  childQuestionsMap.forEach((children, parent) => {
    console.log(
      `Parent ${parent} has ${children.length} children: ${children.map((c) => c["Question Code"]).join(", ")}`
    );
  });

  // Log processed questions for debugging
  console.log("===== PROCESSED QUESTIONS =====");
  processedQuestions.forEach((q) => {
    console.log(`Processed question: ${q.key}`);
  });

  // Log raw questions for debugging
  console.log("===== RAW QUESTIONS =====");
  rawQuestions.forEach((q) => {
    console.log(
      `Raw question: ${q["Question Code"]} (Section: ${q["Section Code"]})`
    );
  });

  // Ensure all questions have processed question data
  rawQuestions.forEach((rawQ) => {
    const questionCode = rawQ["Question Code"];
    if (!questionMap.has(questionCode)) {
      console.warn(
        `No processed question data for ${questionCode} - adding it to questionMap`
      );

      // Check if we can find it by looking up the key in a different way
      const foundQuestion = processedQuestions.find((pq) => {
        // Direct match
        if (pq.key === questionCode) return true;

        // Underscore variations
        if (pq.key.replace(/\./g, "_") === questionCode) return true;
        if (questionCode.replace(/\./g, "_") === pq.key) return true;

        // Match without section prefix (e.g., S1.Q1 -> Q1)
        const questionCodeWithoutSection = questionCode.split(".").pop();
        const processedKeyWithoutSection = pq.key.split(".").pop();
        if (questionCodeWithoutSection && processedKeyWithoutSection) {
          if (questionCodeWithoutSection === processedKeyWithoutSection)
            return true;
          if (
            questionCodeWithoutSection.replace(/\./g, "_") ===
            processedKeyWithoutSection.replace(/\./g, "_")
          )
            return true;
        }

        // Match by removing section prefix from question code (e.g., S1.Q1 -> Q1)
        if (questionCodeWithoutSection === pq.key) return true;

        // Match by adding section prefix to processed key
        const sectionCode = questionCode.split(".")[0]; // Get section part (e.g., S1 from S1.Q1)
        if (sectionCode && `${sectionCode}.${pq.key}` === questionCode)
          return true;

        return false;
      });

      if (foundQuestion) {
        console.log(
          `Found matching processed question for ${questionCode} -> ${foundQuestion.key}`
        );
        questionMap.set(questionCode, foundQuestion);
      } else {
        console.error(
          `Could not find processed question for ${questionCode}. Available keys: ${processedQuestions.map((pq) => pq.key).join(", ")}`
        );
      }
    }
  });

  // Process the question tree recursively
  const treeProcessingResult = processQuestionTreeRecursively(
    questionTree,
    {
      section,
      questionnaireId,
      sectionParentId,
      tabsField,
      hierarchyMap,
      processedSectionCode,
      processedQuestionCodes,
    },
    0, // Start at depth 0
    undefined, // No parent container for root nodes
    questionIndex,
    fieldIndex
  );

  // Add tree-processed form fields to our results
  sectionFormFields.push(...treeProcessingResult.formFields);
  questionIndex = treeProcessingResult.questionIndex;
  fieldIndex = treeProcessingResult.fieldIndex;

  // Process miscellaneous questions (standalone questions)
  // Explicitly filter out questions that have parent-child relationships
  const standaloneQuestions = questionsForThisSection.filter((q) => {
    const questionCode = q["Question Code"];

    // Skip if already processed
    if (processedQuestionCodes.has(questionCode)) return false;

    // Skip if it's a child question (has a parent)
    const parentCode = (q as ExcelQuestionDataWithParent)[
      "Parent Question Code"
    ];
    if (parentCode && parentCode.trim() !== "") return false;

    // Skip if it's a main question (should have been processed already)
    if (q["Is Main Question"]?.toLowerCase() === "yes") return false;

    return true;
  });

  const miscResult = processMiscellaneousQuestions(
    standaloneQuestions,
    {
      section,
      questionnaireId,
      sectionParentId,
      tabsField,
      hierarchyMap,
      processedSectionCode,
      processedQuestionCodes,
    },
    questionIndex,
    fieldIndex
  );
  // Add misc form fields to our results
  sectionFormFields.push(...miscResult.formFields);
  questionIndex = miscResult.questionIndex;
  fieldIndex = miscResult.fieldIndex;

  // Check for potentially missed questions with complex section mapping patterns
  const potentiallyMissedQuestions = rawQuestions.filter((rawQ) => {
    const questionCode = rawQ["Question Code"];
    const questionSectionCode = rawQ["Section Code"] || "";

    // Skip if already processed
    if (processedQuestionCodes.has(questionCode)) return false;

    // Only include questions with a direct hierarchical relationship
    // This avoids incorrectly matching questions from unrelated sections
    if (questionSectionCode && section.key) {
      // Handle parent-child section relationships like S2 and S2_1
      if (
        questionSectionCode.includes("_") &&
        questionSectionCode.split("_")[0] === section.key
      ) {
        return true;
      }

      if (
        section.key.includes("_") &&
        section.key.split("_")[0] === questionSectionCode
      ) {
        return true;
      }
    }

    return false;
  });

  console.log(
    `Found ${potentiallyMissedQuestions.length} potentially missed questions for section ${section.key}`
  );

  // If we have missed questions, process them using the default container or create a new one
  if (potentiallyMissedQuestions.length > 0) {
    // Use existing default container or create a new one
    const defaultContainer =
      miscResult.defaultContainer ||
      (() => {
        const defaultContainerId = uuidv4();
        // Use a better naming convention to avoid conflicts
        const defaultContainerField = `${processedSectionCode}_additional`;

        // Create a default container for missed questions
        const defaultContainer: FormField_Insert_Input = {
          id: defaultContainerId,
          formId: questionnaireId,
          sectionId: section.id,
          interface: "group-detail",
          type: "container",
          field: defaultContainerField,
          seqIndex: questionIndex++,
          interfaceOptions: {
            title: `${section.title || section.content || "Section"} Additional Questions`,
            columns: {
              lg: 3,
              md: 2,
              sm: 1,
              xs: 1,
            },
            spacing: 10,
            isHeading: true,
            headingSize: "h4",
            isAddcomment: true,
          },
          ...(section.parentsectionCode
            ? { subtheme: section.title || section.content }
            : {}),
          fieldOptions: {
            label: `${section.title || section.content || "Section"} Additional Questions`,
            enable: true,
            readonly: false,
            required: false,
          },
          displayOptions: {
            orientation: "vertical",
          },
          // Use section parent ID if available, otherwise fall back to tabs field
          groupField: sectionParentId
            ? hierarchyMap.fieldIdMap[sectionParentId] || tabsField
            : tabsField,
        };

        sectionFormFields.push(defaultContainer);
        hierarchyMap.fieldIdMap[defaultContainerField] = defaultContainerId;

        return {
          id: defaultContainerId,
          field: defaultContainerField,
        };
      })();

    // Process missed questions
    potentiallyMissedQuestions.forEach((rawQ) => {
      const questionCode = rawQ["Question Code"];
      processedQuestionCodes.add(questionCode);

      // Find the processed question data
      const processedQuestion = questionMap.get(questionCode);
      if (!processedQuestion) {
        console.warn(
          `No processed question found for missed question ${questionCode}`
        );
        return;
      }

      // Process question code for field naming
      const processedQuestionCode = questionCode.replace(/\./g, "_");
      // Use a cleaner field name without the "_missed" suffix
      const questionField = `${processedSectionCode}_${processedQuestionCode}`;

      // Determine interface and type
      const {
        interfaceType,
        fieldType,
        interfaceOptions,
        label,
        visibleConditionRules,
      } = determineInterfaceAndType(processedQuestion);

      // Create form field for the question
      const questionId = uuidv4();

      const questionFormField: FormField_Insert_Input = {
        id: questionId,
        formId: questionnaireId,
        sectionId: section.id,
        questionId: processedQuestion.parentQuestionId,
        interface: interfaceType,
        type: fieldType,
        field: questionField,
        seqIndex: fieldIndex++,
        dataPoint: processedQuestion.key,
        subtheme: "",
        interfaceOptions: interfaceOptions,
        fieldOptions: {
          label: label,
          enable:
            visibleConditionRules && visibleConditionRules.length > 0
              ? false
              : true,
          readonly: false,
          required: isRequiredQuestion(processedQuestion),
        },
        displayOptions: {
          orientation: "horizontal",
        },
        ...(visibleConditionRules &&
          visibleConditionRules.length > 0 && {
            displayRules: visibleConditionRules,
          }),
        groupField: defaultContainer.field || "wizard_tabs",
      };

      // Add question form field
      sectionFormFields.push(questionFormField);

      // Store in hierarchy map
      hierarchyMap.fieldIdMap[questionField] = questionId;
      hierarchyMap.fieldParentMap[questionField] = defaultContainer.field;
    });
  }

  console.log(
    `Completed recursive processing for section ${section.key} - generated ${sectionFormFields.length} form fields`
  );
  return sectionFormFields;
};
