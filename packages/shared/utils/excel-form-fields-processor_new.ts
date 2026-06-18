import { v4 as uuidv4 } from "uuid";
import { FormField_Insert_Input } from "../../graphql/generated/types";

interface GetGroupFieldParams {
  sectionId: string | null | undefined;
  isSubSection: boolean;
  parentSectionId: string | null;
  sectionToTabsFieldMap: Record<string, string>;
  visitedSections?: Set<string>;
  processedSections: ProcessedSectionData[];
}

/**
 * Recursively finds the appropriate group field for a section
 * by checking the section hierarchy until it finds a valid tab mapping
 * or falls back to 'wizard_tabs' as default
 */
function getGroupFieldForSection({
  sectionId,
  isSubSection,
  parentSectionId,
  sectionToTabsFieldMap,
  visitedSections = new Set<string>(),
  processedSections,
}: GetGroupFieldParams): string {
  // If we've already visited this section, break the potential infinite loop
  if (sectionId && visitedSections.has(sectionId)) {
    return "wizard_tabs Row no 29";
  }

  // Check if current section has a tab mapping
  if (sectionId && sectionToTabsFieldMap[sectionId]) {
    return sectionToTabsFieldMap[sectionId];
  }

  const section = processedSections.find((section) => section.id === sectionId);
  if (section) {
    if (section.sectionId !== null) {
      isSubSection = true;
    }
    parentSectionId = section.sectionId;
  }

  // If it's a subsection, check parent sections
  if (isSubSection && parentSectionId) {
    // Add current section to visited set to prevent infinite loops
    if (sectionId) {
      visitedSections.add(sectionId);
    }

    // Recursively check parent section
    return getGroupFieldForSection({
      sectionId: parentSectionId,
      isSubSection: true, // Parent sections are treated as subsections in the hierarchy
      parentSectionId: null, // Reset parentSectionId to avoid infinite loops
      sectionToTabsFieldMap,
      visitedSections,
      processedSections,
    });
  }

  // Default fallback
  return "wizard_tabs Row no 64";
}

import {
  ExcelQuestionData,
  QuestionToInsert,
} from "./excel-questions-processor";
import {
  ProcessedSectionData as OriginalSectionData,
  ProcessedSectionData,
} from "./excel-sections-processor";

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

export const generateFormFields_new = (
  questionnaireId: string,
  questions: QuestionToInsert[],
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
  processedSections: ProcessedSectionData[],
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
    seqIndex: 1,
    interfaceOptions: {
      label: "Questionnaire Wizard",
      description: "Navigate through the questionnaire sections",
      template: "template1",
      showControls: false,
      tabs: Object.values(sectionData)
        .filter((section) => section.sectionId === null)
        .map((section, index) => ({
          tabKey: index + 1,
          tabName: section.content,
          icon: {
            icon: "",
            size: "md",
            tooltip: section.content,
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
  const sectionToTabsFieldMap: Record<string, string> = {};

  Object.values(sectionData).forEach((section, index) => {
    let sectionName = section.content;
    let issubSection = false;
    const parentSectionId = section.sectionId || null;

    if (section.sectionId === null) {
      const stepId = uuidv4();
      sectionToStepMap[section.id] = stepId;

      const processedSectionCode = section.key;
      const stepField = `${processedSectionCode}_step`;

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

      hierarchyMap.fieldIdMap[stepField] = stepId;
      hierarchyMap.fieldParentMap[stepField] = wizardField;
      const tabsId = uuidv4();

      if (stepId) {
        sectionToTabsMap[section.id] = tabsId;

        //check if section has child sections
        const hasChildSections = Object.values(sectionData).some(
          (child) => child.parentsectionCode === section.sectionCode
        );

        // Process section code for field naming - replace dots with underscores
        const processedSectionCode = section.key;
        const tabsField = `${processedSectionCode}_tabs`;
        sectionToTabsFieldMap[section.id] = tabsField;

        formFields.push({
          id: tabsId,
          formId: questionnaireId,
          interface: "group-tabs",
          type: "tabs",
          field: tabsField,
          seqIndex: index + 1,
          interfaceOptions: {
            ...(hasChildSections ? { title: "" } : {}),
            template: "pagination",
            breadcrumb: section.content,
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

        console.log(`Updated formFields total: ${formFields.length}`);
      }
      sectionIndex++;
    }

    // If this is a subsection (has a parent), create a sub-theme
    if (section.sectionId !== null) {
      issubSection = true;
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
          Object.entries(sectionData).reduce((acc, [key, data]) => {
            acc[key] = {
              ...data,
              formId: questionnaireId,
              weightage: 0,
              title: data.content,
              description: null,
              tags: data.tags || "",
            };
            return acc;
          }, {} as Record<string, FormFieldSectionData>),
          questionnaireId,
          sectionIndex,
          formFields
        );
        formFields.push(subTheme);
        sectionIndex = nextIndex;
      }
    }

    questions
      .filter((q) => q.sectionId === section.id)
      .forEach((question) => {
        const questionFormFields = processQuestionsForSection(
          question,
          sectionToTabsFieldMap,
          questionnaireId,
          sectionName,
          issubSection,
          parentSectionId,
          processedSections
        );
        console.log("questions formFields", questionFormFields);
        console.log("formFields BEFORE push child formFields", formFields);
        formFields.push(...questionFormFields);
        console.log("formFields AFTER push child formFields", formFields);
      });
  });

  console.log(`Generated ${formFields.length} form fields`);
  console.log("formFields", formFields);

  return formFields;
};

export const processQuestionsForSection = (
  question: QuestionToInsert,
  sectionToTabsFieldMap: Record<string, string>,
  questionnaireId: string,
  sectionName: string,
  issubSection: boolean,
  parentSectionId: string | null,
  processedSections: ProcessedSectionData[]
): FormField_Insert_Input[] => {
  // Local variables to track state
  const sectionFormFields: FormField_Insert_Input[] = [];
  let questionIndex = 1;
  let fieldIndex = 1;

  // Create container for main questions or questions with children at depth 0
  let containerField: string;
  let questionContainerId: string;

  if (question.isMainQuestion) {
    // Create container for this question
    questionContainerId = uuidv4();
    containerField = `${question.key}_container`;

    // Create form field for the question itself
    const {
      interfaceType,
      fieldType,
      interfaceOptions,
      label,
      visibleConditionRules,
      displayOption,
      dateformat,
      autoCalculateCalculation,
      validationRules,
    } = determineInterfaceAndType(question);
    const questionId = uuidv4();
    const questionField = `${question.key}`; // Make unique from container

    let formatValue_date: { orientation: string; format?: string | null } = {
      orientation: displayOption || "horizontal",
    };
    if (question.type?.trim().toLowerCase() === "date") {
      formatValue_date = {
        format: dateformat || null,
        orientation: displayOption || "horizontal",
      };
    }

    // Create the container form field
    const containerFormField: FormField_Insert_Input = {
      id: questionContainerId,
      formId: questionnaireId,
      sectionId: question.sectionId,
      questionId: question.id || null, // Only use the actual question ID
      interface: "group-detail",
      type: "container",
      field: containerField,
      seqIndex: question.Sequence,
      interfaceOptions: {
        title: question.questionCode,
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
        ...(interfaceOptions.infoIconProps && {
          infoIconProps: interfaceOptions.infoIconProps,
        }),
        ...(interfaceOptions.popoverDropdownProps && {
          popoverDropdownProps: interfaceOptions.popoverDropdownProps,
        }),
      },
      ...(issubSection ? { subtheme: sectionName } : {}),
      fieldOptions: {
        label: question.content,
        enable: true,
        readonly: false,
        required: false,
      },
      displayOptions: {
        orientation: "vertical",
      },

      // Get the appropriate group field based on section hierarchy
      groupField:
        (question.sectionId && sectionToTabsFieldMap[question.sectionId]) ||
        getGroupFieldForSection({
          sectionId: question.sectionId,
          isSubSection: issubSection,
          parentSectionId,
          sectionToTabsFieldMap,
          processedSections,
        }),
    };

    // Add container to form fields
    sectionFormFields.push(containerFormField);

    const questionFormField: FormField_Insert_Input = {
      id: questionId,
      formId: questionnaireId,
      sectionId: question.sectionId,
      questionId: question.id || null, // Only use the actual question ID
      interface: interfaceType,
      type: fieldType,
      field: questionField,
      seqIndex: question.Sequence,
      dataPoint: question.key,
      subtheme: "",
      interfaceOptions: interfaceOptions,
      fieldOptions: {
        label: label,
        enable:
          visibleConditionRules && visibleConditionRules.length > 0
            ? false
            : true, // Start disabled if visibility rules exist
        readonly: false,
        required: question.isRequired,
      },
      displayOptions: formatValue_date,
      ...(visibleConditionRules &&
        visibleConditionRules.length > 0 && {
          displayRules: visibleConditionRules,
        }),
      // Ensure groupField is never empty for question fields
      groupField: containerField || "wizard_tabs Row no 469",
      autoCalculatedCalculation:
        !!autoCalculateCalculation && autoCalculateCalculation?.length > 0
          ? autoCalculateCalculation
          : null,
      validationRules:
        !!validationRules && validationRules?.length > 0
          ? validationRules
          : null,
    };

    // Add question form field
    sectionFormFields.push(questionFormField);
  } else {
    // Process child question
    const childField = `${question.key}`;

    // Determine interface and type for child question
    const {
      interfaceType,
      fieldType,
      interfaceOptions,
      label,
      visibleConditionRules,
      displayOption,
      dateformat,
      autoCalculateCalculation,
      validationRules,
    } = determineInterfaceAndType(question);

    let formatValue_date: { orientation: string; format?: string | null } = {
      orientation: displayOption || "horizontal",
    };
    if (question.type?.trim().toLowerCase() === "date") {
      formatValue_date = {
        format: dateformat || null,
        orientation: displayOption || "horizontal",
      };
    }

    // Create form field for child question
    const childId = uuidv4();

    // Log detailed information for debugging
    console.log(`Child question ${question.questionCode} details:`, {
      id: childId,
      field: childField,
      // parentContainerId: parentContainer.id,
      // parentContainerField: parentContainer.field,
      interfaceType,
      fieldType,
      parentQuestionId: question.parentQuestionId || "N/A",
      QuestionId: question.id || "N/A",
    });

    const childFormField: FormField_Insert_Input = {
      id: childId,
      formId: questionnaireId,
      sectionId: question.sectionId,
      questionId: question.parentQuestionId,
      interface: interfaceType,
      type: fieldType,
      field: childField,
      seqIndex: question.Sequence,
      dataPoint: question.key,
      subtheme: "",
      interfaceOptions: interfaceOptions,
      fieldOptions: {
        label: label,
        enable:
          visibleConditionRules && visibleConditionRules.length > 0
            ? false
            : true,
        readonly: false,
        required: question.isRequired,
      },
      displayOptions: formatValue_date,
      ...(visibleConditionRules &&
        visibleConditionRules.length > 0 && {
          displayRules: visibleConditionRules,
        }),
      // Ensure groupField is never empty, use parentContainer.field or fallback to a default
      groupField: question.parentCode || "wizard_tabs Row no 542",
      autoCalculatedCalculation:
        !!autoCalculateCalculation && autoCalculateCalculation?.length > 0
          ? autoCalculateCalculation
          : null,
      validationRules:
        !!validationRules && validationRules?.length > 0
          ? validationRules
          : null,
    };

    // Add child form field
    sectionFormFields.push(childFormField);
    console.log(
      `Added child form field ${childField} to parent ${question.parentCode} (ID: ${childId}) for question ${question.key}`
    );
  }

  console.log("sectionFormFields", sectionFormFields);

  return sectionFormFields;
};

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
  seqIndex: number,
  formFields: FormField_Insert_Input[]
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
      const parentFormField = formFields.find(
        (f: FormField_Insert_Input) => f.sectionId === parentSection.id
      );
      if (parentFormField) {
        groupField =
          parentFormField.field ||
          `${parentSection.key}_sub_theme_${seqIndex - 1}`;
      } else {
        groupField = `${parentSection.key}_sub_theme_${seqIndex - 1}`;
      }
    }
  } else {
    // Fallback - shouldn't happen as this is for sub-sections
    groupField = `${section.key}_tabs`;
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

/**
 * Determine the appropriate interface and field type for a question
 * based on its content and tags
 *
 * @param question - The processed question data
 * @returns Object with interfaceType and fieldType properties
 */
const determineInterfaceAndType = (
  question: QuestionToInsert
): {
  isAutoCalculate?: boolean;
  interfaceType: string;
  fieldType: string;
  interfaceOptions?: any;
  label?: string;
  visibleConditionRules?: any[];
  dateformat?: string;
  displayOption?: string;
  autoCalculateCalculation?: any[];
  validationRules?: any[];
} => {
  // Default interface and type
  let interfaceType = "input";
  let fieldType = "string";
  let interfaceOptions = {};
  let autoCalculateCalculation: any[] = [];
  let validationRules: any[] = [];

  const title = question.isMainQuestion ? question.questionCode || "" : "";
  const label = !question.isMainQuestion ? question.content || "" : "";
  const isHeading = !question.isMainQuestion ? true : false;
  const isAddcomment = !question.isMainQuestion ? true : false;
  const tooltip = question.tooltip || "";
  const visibleCondition = question.visibleCondition?.trim() || null;

  let decimalLimit = null;
  let dateformat = "";
  let SelectAllChoice = "";
  let SelectNoneChoice = "";
  let displayOption = "horizontal";
  let isAutoCalculate = false;

  question.format?.split(";").forEach((value: string) => {
    let key = value.trim().split("|")[0];
    if (key) {
      if (key[0] === "format") {
        dateformat = key[1] || "";
      }

      if (key[0] === "decimal") {
        decimalLimit = key[1] || null;
      }

      if (key[0] === "selectallchoice") {
        SelectAllChoice = key[1] || "";
      }
      if (key[0] === "selectnonechoice") {
        SelectNoneChoice = key[1] || "";
      }

      if (key[0] === "display") {
        displayOption = key[1] || "horizontal";
      }
    }
  });

  question.customValidation?.split(";").forEach((value: string) => {
    let key = value.trim().split("|")[0];
    if (key) {
      if (key[0] === "autoCalculate") {
        isAutoCalculate = key[1] === "true";
      }

      if (isAutoCalculate) {
        if (key[0] === "rule") {
          autoCalculateCalculation.push({
            fieldName: label,
            rule: key[1] || "",
          });
        }
      }

      if (key[0] === "rule") {
        validationRules.push({
          name: label,
          rule: key[1] || "",
          message: key[2] || "",
          fieldOptions: {
            enable: true,
          },
        });
      }
    }
  });

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
      content: question.tooltip,
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
      isAutoCalculate: isAutoCalculate,
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
      isAutoCalculate: isAutoCalculate,
      maxLength: question.max || 10000,
    };
  } else if (type.includes("paragraph")) {
    interfaceType = "input";
    fieldType = "string";

    interfaceOptions = {
      title: title,
      isToolTip: true,
      isAdvance: true,
      maxLength: question.max || 10000,
      placeholder: question.placeholder || "",
      isAddcomment: isAddcomment,
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      isAutoCalculate: isAutoCalculate,
    };
  } else if (type.includes("number")) {
    if (question.format && question.format.toLowerCase() === "percentage") {
      interfaceType = "number-input";
      fieldType = "percentage";

      interfaceOptions = {
        title: title,
        placeholder: question.placeholder || "",
        isAddcomment: isAddcomment,
        decimalLimit: decimalLimit || 2,
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
        isAutoCalculate: isAutoCalculate,
        decimalLimit: decimalLimit || 10,
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
        isAutoCalculate: isAutoCalculate,
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
        isAutoCalculate: isAutoCalculate,
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
    interfaceType = "number-input";
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
      decimalLimit: decimalLimit || 2,
      maxValue: 100,
      maxLength: 6,
      isToolTip: true,
      isAutoCalculate: isAutoCalculate,
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
      isAutoCalculate: isAutoCalculate,
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
      isAutoCalculate: isAutoCalculate,
      decimalLimit: decimalLimit || 10,
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
      isHeading: isHeading,
      headingSize: "h2",
    };
  } else if (type.includes("multiselect dropdown")) {
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
  } else if (type.includes("add to list")) {
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
      creatable: true,
      isHeading: true,
      searchable: true,
      headingSize: "h6",
      isAddcomment: isAddcomment,
      showTitleDivider: false,
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
  } else if (type.includes("singleselect checkbox")) {
    interfaceType = "select-multiple-checkbox";
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
      placeholder: "Choose",
      isAddcomment: isAddcomment,
      choices: choices || [],
      isHeading: isHeading,
      headingSize: "h2",
      creatable: false,
      searchable: true,
      ...(typeof SelectAllChoice !== "undefined" && {
        selectAllChoice: SelectAllChoice,
      }),
      ...(typeof SelectNoneChoice !== "undefined" && {
        selectNoneChoice: SelectNoneChoice,
      }),
    };
  } else if (type.includes("multiselect checkbox")) {
    interfaceType = "select-multiple-checkbox";
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
      placeholder: "Choose",
      isAddcomment: isAddcomment,
      choices: choices || [],
      isHeading: isHeading,
      headingSize: "h2",
      creatable: false,
      searchable: true,
      ...(typeof SelectAllChoice !== "undefined" && {
        SelectAllChoice: Boolean(SelectAllChoice),
      }),
      ...(typeof SelectNoneChoice !== "undefined" && {
        SelectNoneChoice: Boolean(SelectNoneChoice),
      }),
    };
  } else if (type.includes("label")) {
    interfaceType = "group-detail";
    fieldType = "container";

    // interfaceOptions = {
    //   title: title,
    //   columns: {
    //     lg: 3,
    //     md: 2,
    //     sm: 1,
    //     xs: 1,
    //   },
    //   spacing: 10,
    //   isHeading: true,
    //   headingSize: "h5",
    //   textComponentProps: {
    //     c: "teal.4",
    //     fz: "lg",
    //   },
    // };
    interfaceOptions = {
      title: "",
      columns: {
        lg: 3,
        md: 2,
        sm: 1,
        xs: 1,
      },
      ...(tooltip && {
        infoIconProps: infoIconProps,
        popoverDropdownProps: popoverDropdownProps,
      }),
      spacing: 10,
      isHeading: true,
      headingSize: "h2",
    };
  }

  return {
    interfaceType,
    fieldType,
    interfaceOptions,
    label,
    visibleConditionRules,
    dateformat,
    displayOption,
    isAutoCalculate,
    autoCalculateCalculation,
    validationRules,
  };
};
