import * as XLSX from "xlsx";
import {
  FormFieldData,
  FormTemplateData,
  SectionData,
} from "./excel-template-generator.util";

/**
 * Preserves the original Excel template structure while updating data
 * This ensures the downloaded file matches the uploaded template
 */

/**
 * Extracts numeric parts from a key (e.g. "S10.1", "Q4_3") for consistent numerical sorting
 */
const parseKey = (key: string): number[] => {
  if (!key) return [0];
  // Replace underscores with dots for consistent parsing
  const normalized = key.replace(/_/g, ".");

  // Extract all numeric parts
  const matches = normalized.match(/\d+/g);
  if (!matches) return [0];

  return matches.map((num) => parseInt(num, 10));
};

/**
 * Sorts sections numerically instead of alphabetically
 * Handles formats like: S1, S2, S9, S10, S10.1, S10.2, S11
 */
const sortSectionsNumerically = (sections: SectionData[]): SectionData[] => {
  return [...sections].sort((a, b) => {
    const keyA = a.key;
    const keyB = b.key;

    const partsA = parseKey(keyA);
    const partsB = parseKey(keyB);

    // Compare each numeric part
    for (let i = 0; i < Math.max(partsA.length, partsB.length); i++) {
      const numA = partsA[i] || 0;
      const numB = partsB[i] || 0;

      if (numA !== numB) {
        return numA - numB;
      }
    }

    return 0;
  });
};

/**
 * Sorts form fields numerically by section code and then by question code
 * Handles formats like: S3_9_2_Q4.4, S10q1.1
 */
export const sortFormFieldsNumerically = (
  formFields: FormFieldData[]
): FormFieldData[] => {
  return [...formFields].sort((a, b) => {
    // Helper to get section part before 'q'
    const getSectionCode = (field: FormFieldData): string => {
      const fieldLower = field.field.toLowerCase();
      if (fieldLower.includes("q")) {
        const qIndex = fieldLower.indexOf("q");
        return field.field.substring(0, qIndex);
      }
      return field.field;
    };

    // Helper to get question part after 'q'
    const getQuestionCode = (field: FormFieldData): string => {
      const fieldLower = field.field.toLowerCase();
      if (fieldLower.includes("q")) {
        const qIndex = fieldLower.indexOf("q");
        return field.field.substring(qIndex + 1);
      }
      return "";
    };

    const sectionCodeA = getSectionCode(a);
    const sectionCodeB = getSectionCode(b);

    const sPartsA = parseKey(sectionCodeA);
    const sPartsB = parseKey(sectionCodeB);

    // 1. Compare section codes numerically
    for (let i = 0; i < Math.max(sPartsA.length, sPartsB.length); i++) {
      const numA = sPartsA[i] || 0;
      const numB = sPartsB[i] || 0;

      if (numA !== numB) {
        return numA - numB;
      }
    }

    // 2. If section codes are the same, sort by question code numerically
    const questionCodeA = getQuestionCode(a);
    const questionCodeB = getQuestionCode(b);

    const qPartsA = parseKey(questionCodeA);
    const qPartsB = parseKey(questionCodeB);

    for (let i = 0; i < Math.max(qPartsA.length, qPartsB.length); i++) {
      const numA = qPartsA[i] || 0;
      const numB = qPartsB[i] || 0;

      if (numA !== numB) {
        return numA - numB;
      }
    }

    // 3. If question codes are also the same (e.g. sub-fields), sort by sequence
    return a.seqIndex - b.seqIndex;
  });
};

/**
 * Reads the original template file from a URL or file path
 */
export const loadOriginalTemplate = async (
  templateUrl: string
): Promise<XLSX.WorkBook> => {
  try {
    console.log("Fetching template from:", templateUrl);

    // Fetch the template file
    const response = await fetch(templateUrl);

    console.log("Response status:", response.status);
    console.log("Response content-type:", response.headers.get("content-type"));

    if (!response.ok) {
      throw new Error(
        `Failed to fetch template: ${response.status} ${response.statusText}`
      );
    }

    // Check if response is actually an Excel file
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      throw new Error(
        `Template URL returned HTML instead of Excel file. URL: ${templateUrl}. ` +
        `This usually means the file was not found. Check that the file exists at: ` +
        `packages/client/public${templateUrl}`
      );
    }

    const arrayBuffer = await response.arrayBuffer();
    console.log("ArrayBuffer size:", arrayBuffer.byteLength);

    const workbook = XLSX.read(arrayBuffer, { type: "array" });
    console.log("Workbook loaded successfully. Sheets:", workbook.SheetNames);

    return workbook;
  } catch (error) {
    console.error("Error loading original template:", error);
    throw error;
  }
};

/**
 * Updates the Sections sheet in the original template with new data
 * Preserves the original structure, headers, and formatting
 */
export const updateSectionsSheet = (
  workbook: XLSX.WorkBook,
  sections: SectionData[]
): void => {
  const sheetName = "Sections";

  if (!workbook.Sheets[sheetName]) {
    console.warn(`Sheet "${sheetName}" not found in template`);
    return;
  }

  // Get the original sheet
  const sheet = workbook.Sheets[sheetName];

  // Convert to array to preserve structure
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as any[][];

  if (data.length === 0) return;

  // Keep the header row (row 0)
  const headers = data[0] as any[];

  // Sort sections numerically (S1, S2, ... S9, S10, S10.1, S11)
  const sortedSections = sortSectionsNumerically(sections);

  // Create new data rows from sorted sections
  const newDataRows = sortedSections.map((section) => {
    return [
      section.key, // Section Code - PRESERVE DOTS (S10.1, not S10_1)
      section.content, // Section Name
      section.ParentSection?.key || "", // Parent Section Code
      Array.isArray(section.tags)
        ? section.tags.join(", ")
        : section.tags || "", // Section Tags
      "", // Tooltip - always blank
    ];
  });

  // Combine header with new data
  const updatedData: any[][] = [headers, ...newDataRows];

  // Replace the sheet with updated data
  const newSheet = XLSX.utils.aoa_to_sheet(updatedData);

  // Preserve column widths if they exist
  if (sheet["!cols"]) {
    newSheet["!cols"] = sheet["!cols"];
  }

  workbook.Sheets[sheetName] = newSheet;
};

/**
 * Updates the Questions sheet in the original template with new data
 * Preserves the original structure, headers, and column names (including "Guidence")
 */
export const updateQuestionsSheet = (
  workbook: XLSX.WorkBook,
  formFields: FormFieldData[],
  sections: SectionData[]
): void => {
  const sheetName = "Questions";

  if (!workbook.Sheets[sheetName]) {
    console.warn(`Sheet "${sheetName}" not found in template`);
    return;
  }

  // Get the original sheet
  const sheet = workbook.Sheets[sheetName];

  // Convert to array to preserve structure
  const data = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
  }) as any[][];

  if (data.length === 0) return;

  // Keep the original header row - IMPORTANT: Preserves "Guidence" spelling
  const headers = data[0] as any[];

  // Find column indices from original headers
  const getColumnIndex = (headerName: string): number => {
    return headers.findIndex((h: any) =>
      h.toString().toLowerCase().includes(headerName.toLowerCase())
    );
  };

  const colIndices = {
    sectionCode: getColumnIndex("section code"),
    questionCode: getColumnIndex("question code"),
    questionTags: getColumnIndex("question tags"),
    isMainQuestion: getColumnIndex("is main question"),
    questions: getColumnIndex("questions"),
    type: getColumnIndex("type"),
    parentQuestionCode: getColumnIndex("parent question"),
    required: getColumnIndex("required"),
    sequence: getColumnIndex("sequence"),
    options: getColumnIndex("options"),
    min: getColumnIndex("min"),
    max: getColumnIndex("max"),
    format: getColumnIndex("format"),
    placeholder: getColumnIndex("placeholder"),
    visibleCondition: getColumnIndex("visible condition"),
    guidance:
      getColumnIndex("guidence") >= 0
        ? getColumnIndex("guidence")
        : getColumnIndex("guidance"),
    comments: getColumnIndex("comments"),
    customValidation: getColumnIndex("custom validation"),
  };

  // Sort form fields by section code (numerically) and then by question code
  const sortedFormFields = sortFormFieldsNumerically(formFields);

  // First pass: Build a set of fields that are parents (have children)
  const parentFields = new Set<string>();
  sortedFormFields.forEach((field) => {
    if (field.groupField) {
      parentFields.add(field.groupField);
    }
  });

  // Filter out container/structural rows and build maps of container labels and sequences
  const containerLabels = new Map<string, string>();
  const containerSequences = new Map<string, number>();
  const fieldsWithoutContainers = sortedFormFields.filter((field) => {
    const fieldLower = field.field.toLowerCase();

    // Check if this is a container or structural field
    const isContainer =
      // Check by interface type
      field.interface === "group-detail" ||
      field.interface === "group-raw" ||
      field.interface === "presentation-divider" ||
      field.interface === "group-wizard-sub-step" ||
      // Check by field name suffix
      fieldLower.endsWith("_container") ||
      fieldLower.endsWith("_form_wizard") ||
      fieldLower.endsWith("_step") ||
      fieldLower.endsWith("_tabs") ||
      // Check by field name pattern
      fieldLower.includes("_sub_theme") ||
      fieldLower.includes("sub_theme") ||
      // Check if this field is a parent (has children)
      // BUT exclude select-multiple-dropdown and multi-select-row as they should appear in output
      (parentFields.has(field.field) &&
        field.interface !== "select-multiple-dropdown" &&
        field.interface !== "multi-select-row" &&
        field.interface !== "number-input" &&
        field.interface !== "input" &&
        field.interface !== "select-radio" &&
        field.interface !== "file");

    // Debug logging for parent fields
    if (parentFields.has(field.field)) {
      console.log(
        `Parent field check: ${field.field} (${field.interface}) - isContainer: ${isContainer}`
      );
    }

    if (isContainer) {
      // Store the container's label and sequence for its children
      const containerLabel =
        field.fieldOptions?.label || field.Question?.content || "";
      containerLabels.set(field.field, containerLabel);

      // Store sequence from group-detail containers
      if (field.interface === "group-detail" && field.seqIndex) {
        containerSequences.set(field.field, field.seqIndex);
      }

      console.log(
        `Filtering out container: ${field.field} (${field.interface}) - Label: "${containerLabel}"`
      );
      return false; // Exclude container from output
    }
    return true; // Include non-container fields
  });

  // Create new data rows from sorted and filtered form fields
  const newDataRows = fieldsWithoutContainers.map((formField) => {
    // Parse field to get section and question codes
    // Field format examples: "S1q1", "S1Q1", "S10.1q5", "S10_1_Q1", "S1"
    let sectionCode = "";
    let questionCode = "";

    if (formField.field.toLowerCase().includes("q")) {
      // Split by 'q' (case insensitive)
      const qIndex = formField.field.toLowerCase().indexOf("q");
      sectionCode = formField.field.substring(0, qIndex);
      questionCode = formField.field.substring(qIndex + 1);
    } else {
      // No 'q' found, entire field is section code
      sectionCode = formField.field;
      questionCode = "";
    }

    // Normalize section code: convert underscores to dots and remove trailing underscore
    // S10_1_ => S10.1, S10_1_Q1 => S10.1
    sectionCode = sectionCode
      .replace(/_(\\d)/g, ".$1") // Replace _digit with .digit
      .replace(/_+$/, ""); // Remove trailing underscores

    // Normalize question code: add 'Q' prefix if not present, replace underscores with dots
    // 1_1 => Q1.1, Q1_1 => Q1.1
    if (questionCode) {
      // Replace underscores with dots
      questionCode = questionCode.replace(/_/g, ".");
      // Add 'Q' prefix if not already present
      if (!questionCode.toUpperCase().startsWith("Q")) {
        questionCode = "Q" + questionCode;
      }
    }

    console.log(
      `Parsing field: ${formField.field} => Section: ${sectionCode}, Question: ${questionCode}`
    );

    // Find related section
    const section = sections.find(
      (s) => s.key === sectionCode || s.id === formField.sectionId
    );

    // Use section key from the found section or derive from field
    const actualSectionCode = section?.key || sectionCode;

    // Check if this field's parent is a container
    const parentIsContainer =
      formField.groupField &&
      (formField.groupField.toLowerCase().endsWith("_container") ||
        formField.groupField.toLowerCase().endsWith("_form_wizard") ||
        formField.groupField.toLowerCase().endsWith("_step") ||
        formField.groupField.toLowerCase().endsWith("_tabs") ||
        containerLabels.has(formField.groupField));

    // Check if this is a main question
    // If parent is a container, this child becomes the main question
    let isMainQuestion = false;
    if (parentIsContainer) {
      isMainQuestion = true;
    } else {
      isMainQuestion =
        formField.fieldOptions?.label === formField.Question?.content;
    }

    // Extract guidance/tooltip content
    const guidanceContent =
      formField.interfaceOptions?.infoIconProps?.content || "";

    // Get the question text - try multiple sources
    let questionText = formField.fieldOptions?.label || "";

    // Fallback to Question.content if label is empty
    if (!questionText && formField.Question?.content) {
      questionText = formField.Question.content;
    }

    // If parent is a container and we still don't have a label, use the container's label
    if (!questionText && parentIsContainer && formField.groupField) {
      questionText = containerLabels.get(formField.groupField) || "";
      console.log(
        `Using container label fallback for ${formField.field}: "${questionText}"`
      );
    }

    // Log if question is still blank to help debug
    if (!questionText) {
      console.warn(
        `Blank question for field ${formField.field} (type: ${formField.interface})`,
        {
          fieldOptions: formField.fieldOptions,
          Question: formField.Question,
          interface: formField.interface,
        }
      );
    }

    // Create row array with correct number of columns
    const row = new Array(headers.length).fill("");

    // Fill in the data at correct column indices
    if (colIndices.sectionCode >= 0)
      row[colIndices.sectionCode] = actualSectionCode;
    if (colIndices.questionCode >= 0)
      row[colIndices.questionCode] = questionCode;
    if (colIndices.questionTags >= 0)
      row[colIndices.questionTags] = Array.isArray(formField.tags)
        ? formField.tags.join(", ")
        : formField.tags || "";
    if (colIndices.isMainQuestion >= 0)
      row[colIndices.isMainQuestion] = isMainQuestion ? "Yes" : "";
    if (colIndices.questions >= 0) row[colIndices.questions] = questionText;
    if (colIndices.type >= 0) {
      // Find parent field if this field has a groupField
      const parentField = formField.groupField
        ? sortedFormFields.find((f) => f.field === formField.groupField)
        : undefined;

      row[colIndices.type] = mapToOriginalType(
        formField.interface,
        formField.type,
        formField.interfaceOptions,
        parentField
      );
    }

    // Filter Parent Question Code based on special patterns and normalize format
    let parentQuestionCode = formField.groupField || "";
    if (parentQuestionCode) {
      const lowerParent = parentQuestionCode.toLowerCase();
      // Remove parent if it ends with these patterns
      if (
        lowerParent.endsWith("_form_wizard") ||
        lowerParent.endsWith("_step") ||
        lowerParent.endsWith("_tabs") ||
        lowerParent.endsWith("_container")
      ) {
        parentQuestionCode = "";
      } else {
        // Normalize parent question code: replace underscores with dots
        parentQuestionCode = parentQuestionCode.replace(/_/g, ".");
      }
    }

    if (colIndices.parentQuestionCode >= 0)
      row[colIndices.parentQuestionCode] = parentQuestionCode;
    if (colIndices.required >= 0)
      row[colIndices.required] = formField.fieldOptions?.required ? "Yes" : "";

    // Get sequence from parent group-detail container if available, otherwise use field's seqIndex
    let sequenceValue = formField.seqIndex;
    if (formField.groupField && containerSequences.has(formField.groupField)) {
      sequenceValue = containerSequences.get(formField.groupField)!;
    }
    if (colIndices.sequence >= 0) row[colIndices.sequence] = sequenceValue;
    if (colIndices.options >= 0)
      row[colIndices.options] = extractOptions(formField.interfaceOptions);
    if (colIndices.min >= 0)
      row[colIndices.min] =
        formField.interfaceOptions?.minValue?.toString() || "";
    if (colIndices.max >= 0)
      row[colIndices.max] =
        formField.interfaceOptions?.maxValue?.toString() || "";
    if (colIndices.format >= 0)
      row[colIndices.format] = generateFormatRules(
        formField.interface,
        formField.interfaceOptions,
        formField.displayOptions,
        formField.type
      );
    if (colIndices.placeholder >= 0)
      row[colIndices.placeholder] =
        formField.interfaceOptions?.placeholder || "";
    if (colIndices.visibleCondition >= 0)
      row[colIndices.visibleCondition] = formField.displayRules?.rule || "";
    if (colIndices.guidance >= 0) row[colIndices.guidance] = guidanceContent;
    if (colIndices.comments >= 0) row[colIndices.comments] = "";
    if (colIndices.customValidation >= 0)
      row[colIndices.customValidation] = generateCustomValidation(
        formField.autoCalculatedCalculation,
        formField.validationRules
      );

    return row;
  });

  // Combine header with new data
  const updatedData: any[][] = [headers, ...newDataRows];

  // Replace the sheet with updated data
  const newSheet = XLSX.utils.aoa_to_sheet(updatedData);

  // Preserve column widths if they exist
  if (sheet["!cols"]) {
    newSheet["!cols"] = sheet["!cols"];
  }

  workbook.Sheets[sheetName] = newSheet;
};

/**
 * Maps interface types to the ORIGINAL template type names
 * This preserves the exact type names from the uploaded template
 */
const mapToOriginalType = (
  interfaceType: string,
  fieldType?: string,
  interfaceOptions?: any,
  parentField?: any
): string => {
  // Special handling for input fields to distinguish Text vs Paragraph
  if (interfaceType === "input" && fieldType === "string") {
    // Check if it's an advanced/multiline input (Paragraph) or single-line (Text)
    const isAdvance = interfaceOptions?.isAdvance === true;
    const mappedType = isAdvance ? "Paragraph" : "Text";
    console.log(
      `Type mapping for input:string - isAdvance: ${isAdvance} => ${mappedType}`
    );
    return mappedType;
  }

  // Special handling for child fields of select-multiple-dropdown parents
  // Child fields inherit the type from their parent (Add to List vs Multiselect dropdown)
  if (
    parentField &&
    parentField.interface === "select-multiple-dropdown" &&
    parentField.type === "array"
  ) {
    const isCreatable = parentField.interfaceOptions?.creatable === true;
    const mappedType = isCreatable ? "Add to List" : "Multiselect dropdown";
    console.log(
      `Type mapping for child of select-multiple-dropdown - parent creatable: ${isCreatable} => ${mappedType}`
    );
    return mappedType;
  }

  // Special handling for select-multiple-dropdown to distinguish Add to List vs Multiselect dropdown
  if (interfaceType === "select-multiple-dropdown" && fieldType === "array") {
    // Check interfaceOptions.creatable to determine which type it is
    // Add to List has creatable: true, Multiselect dropdown has creatable: false
    const isCreatable = interfaceOptions?.creatable === true;
    const mappedType = isCreatable ? "Add to List" : "Multiselect dropdown";
    console.log(
      `Type mapping for select-multiple-dropdown:array - creatable: ${isCreatable} => ${mappedType}`
    );
    return mappedType;
  }

  // Map to original template type names (Text, Paragraph, Number, etc.)
  const typeKey = fieldType ? `${interfaceType}:${fieldType}` : interfaceType;

  const typeMapping: Record<string, string> = {
    input: "Text",
    "input:string": "Text", // Default to Text, isAdvance check above handles Paragraph
    "number-input": "Number",
    "number-input:number": "Number",
    "number-input:global-phone-number": "Phone",
    "number-input:percentage": "Percentage",
    "number-input:currency-with-comma": "Currency",
    "number-input:decimal-number": "Decimal",
    file: "File",
    "file:array": "File",
    datetime: "Date",
    "datetime:string": "Date",
    "select-dropdown": "SingleSelect",
    "select-dropdown:string": "SingleSelect",
    "select-radio": "Radio",
    "select-radio:string": "Radio",
    "select-multiple-dropdown": "Multiselect dropdown",
    "select-multiple-dropdown:array": "Multiselect dropdown", // Default, check above handles Add to List
    "multi-select-row": "Multiselect Table",
    "multi-select-row:array": "Multiselect Table",
    "group-detail": "Label",
    "group-detail:container": "Label",
    "select-multiple-checkbox": "Multiselect checkbox",
    "select-multiple-checkbox:array": "Multiselect checkbox",
    "select-toggle": "Add to List",
    "select-toggle:array": "Add to List",
  };

  return typeMapping[typeKey] || typeMapping[interfaceType] || "Text";
};

/**
 * Extracts choices/options from interface options
 */
const extractOptions = (interfaceOptions?: any): string => {
  if (!interfaceOptions) return "";

  if (interfaceOptions.choices && Array.isArray(interfaceOptions.choices)) {
    return interfaceOptions.choices
      .map((choice: any) =>
        typeof choice === "string" ? choice : choice.label || choice.value || ""
      )
      .join(" | ");
  }

  if (interfaceOptions.options && Array.isArray(interfaceOptions.options)) {
    return interfaceOptions.options
      .map((option: any) =>
        typeof option === "string" ? option : option.label || option.value || ""
      )
      .join(" | ");
  }

  return "";
};

/**
 * Generates format rules based on field type and interface options
 */
const generateFormatRules = (
  interfaceType: string,
  interfaceOptions?: any,
  displayOptions?: any,
  fieldType?: string
): string => {
  const formatParts: string[] = [];

  console.log(
    `generateFormatRules called - interface: ${interfaceType}, fieldType: ${fieldType}, decimalLimit: ${interfaceOptions?.decimalLimit}`
  );

  switch (interfaceType) {
    case "datetime":
      // DateTime format comes from displayOptions, not interfaceOptions
      if (displayOptions?.format) {
        formatParts.push(`format | ${displayOptions.format};`);
      } else if (interfaceOptions?.format) {
        formatParts.push(`format | ${interfaceOptions.format};`);
      } else {
        formatParts.push("format | DD/MM/YYYY;");
      }
      break;

    case "file":
      // Extract file extensions from interfaceOptions.accept array
      if (interfaceOptions?.accept && Array.isArray(interfaceOptions.accept)) {
        const extensions = interfaceOptions.accept
          .map((mimeType: string) => {
            // Reverse mapping from MIME types to extensions
            const mimeToExt: Record<string, string> = {
              "application/pdf": "pdf",
              "image/jpeg": "jpg",
              "image/png": "png",
              "image/gif": "gif",
              "image/webp": "webp",
              "image/svg+xml": "svg",
              "video/mp4": "mp4",
              "video/webm": "webm",
              "application/msword": "doc",
              "application/vnd.openxmlformats-officedocument.wordprocessingml.document":
                "docx",
              "text/csv": "csv",
              "application/csv": "csv",
              "application/vnd.ms-excel": "xls",
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet":
                "xlsx",
              "application/vnd.ms-powerpoint": "ppt",
              "application/vnd.openxmlformats-officedocument.presentationml.presentation":
                "pptx",
              "application/zip": "zip",
              "application/x-rar-compressed": "rar",
              "application/x-7z-compressed": "7z",
            };
            return mimeToExt[mimeType] || null;
          })
          .filter((ext: string | null) => ext !== null);

        // Remove duplicates
        const uniqueExtensions = Array.from(new Set(extensions));

        if (uniqueExtensions.length > 0) {
          formatParts.push(`format | ${uniqueExtensions.join(", ")};`);
        }
      } else {
        // Default file formats if accept is not specified
        formatParts.push("format | jpg, jpeg, png, pdf, csv, xls, xlsx;");
      }
      break;

    case "number-input":
      // Check fieldType for currency, decimal, or percentage
      if (
        fieldType === "currency-with-comma" ||
        fieldType === "decimal-number" ||
        fieldType === "percentage"
      ) {
        // Generate decimal format based on decimalLimit
        // decimalLimit = 2 => "0.11", decimalLimit = 4 => "0.1111"
        const decimalLimit = interfaceOptions?.decimalLimit || 2;
        const decimalFormat = "0." + "1".repeat(decimalLimit);
        const formatString = `decimal | ${decimalFormat};`;
        formatParts.push(formatString);
        console.log(
          `Decimal format generated: ${formatString} (fieldType: ${fieldType}, decimalLimit: ${decimalLimit})`
        );
      }
      break;

    case "select-multiple-checkbox":
      if (interfaceOptions?.selectAllChoice) {
        formatParts.push(
          `SelectAllChoice | ${interfaceOptions.selectAllChoice};`
        );
      }
      if (interfaceOptions?.selectNoneChoice) {
        formatParts.push(
          `SelectNoneChoice | ${interfaceOptions.selectNoneChoice};`
        );
      }
      break;
  }

  // Check for vertical orientation in displayOptions
  if (displayOptions?.orientation === "vertical") {
    formatParts.push("display | vertical;");
  }

  // Join format parts with space (each part already has semicolon)
  const result = formatParts.join(" ");
  console.log(`generateFormatRules result: "${result}"`);
  return result;
};

/**
 * Generates custom validation string
 */
const generateCustomValidation = (
  autoCalculatedCalculation?: any,
  validationRules?: any
): string => {
  const validationParts: string[] = [];

  if (autoCalculatedCalculation && autoCalculatedCalculation.isAutoCalculate) {
    validationParts.push("autoCalculate | true");
    if (autoCalculatedCalculation.rule) {
      validationParts.push(`rule | ${autoCalculatedCalculation.rule}`);
    }
  } else if (validationRules) {
    if (validationRules.rule) {
      validationParts.push(`rule | ${validationRules.rule}`);
    }
    if (validationRules.message) {
      validationParts.push(`message | ${validationRules.message}`);
    }
  }

  return validationParts.join("; ");
};

/**
 * Main function to update the original template with new data
 * This preserves the original template structure including:
 * - Guidelines sheet (unchanged)
 * - Masters sheet (unchanged)
 * - Section codes with dots (S10.1, not S10_1)
 * - Original column headers (including "Guidence" spelling)
 * - All other sheets (unchanged)
 */
export const updateOriginalTemplate = (
  originalWorkbook: XLSX.WorkBook,
  formData: FormTemplateData
): XLSX.WorkBook => {
  // Clone the workbook by creating a deep copy
  // We'll work directly on a copy to preserve all original properties
  const workbook: XLSX.WorkBook = {
    SheetNames: [...originalWorkbook.SheetNames],
    Sheets: {},
    Props: originalWorkbook.Props,
    Custprops: originalWorkbook.Custprops,
    Workbook: originalWorkbook.Workbook,
  };

  // Copy all sheets from original (this preserves Guidelines, Masters, etc.)
  originalWorkbook.SheetNames.forEach((sheetName) => {
    // Create a deep copy of each sheet to avoid mutation
    const originalSheet = originalWorkbook.Sheets[sheetName];
    workbook.Sheets[sheetName] = { ...originalSheet };
  });

  console.log("Workbook cloned. Sheet names:", workbook.SheetNames);

  // Update only the Sections and Questions sheets
  // These functions will replace the sheets in the workbook
  updateSectionsSheet(workbook, formData.Sections);
  updateQuestionsSheet(workbook, formData.FormFields, formData.Sections);

  console.log("Sections and Questions sheets updated");

  return workbook;
};

/**
 * Downloads the updated template file
 */
export const downloadUpdatedTemplate = (
  workbook: XLSX.WorkBook,
  fileName: string
): void => {
  // Log final workbook state before download
  console.log("Final workbook state before download:");
  console.log("- Sheet names:", workbook.SheetNames);
  workbook.SheetNames.forEach((sheetName) => {
    const sheet = workbook.Sheets[sheetName];
    if (sheet) {
      const range = sheet["!ref"];
      console.log(`  - ${sheetName}: ${range || "empty"}`);
    } else {
      console.log(`  - ${sheetName}: MISSING!`);
    }
  });

  XLSX.writeFile(workbook, fileName);
  console.log(`File downloaded: ${fileName}`);
};
