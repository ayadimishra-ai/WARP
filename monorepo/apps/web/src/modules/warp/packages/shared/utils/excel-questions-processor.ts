import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";
import { readSectionsFromExcel } from "./excel-sections-processor";

/**
 * Interface for the question data from Excel
 */
export interface ExcelQuestionData {
  "Section Code": string;
  "Question Code": string;
  Questions: string;
  "Question Tags": string;
  "Is Main Question": string;
  "Parent Question Code"?: string;
  Sequence: string;
  Type?: string;
  Required?: string;
  Tooltip: string;
  "Guidence / Tool Tip"?: string;
  Options?: string;
  Min?: string;
  Max?: string;
  Placeholder?: string;
  "Visible Condition"?: string;
  "Custom Validation"?: string;
  Format?: string;
}

/**
 * Interface for the section data from Excel
 */
export interface ExcelSectionData {
  "Section Code": string;
  "Section Name": string;
  "Section Description"?: string;
  "Section Order"?: number;
  "Parent Section Code"?: string;
  "Section Tags"?: string;
}

/**
 * Interface for the processed question data to be inserted into the database
 */
export interface ProcessedQuestionData {
  id: string; // UUID
  key: string; // Question Code
  content: string; // Questions
  sectionId: string | null; // Section ID mapped from Section Code
  tags: string | null; // Question Tags
  weightage: number; // Default 0
  parentQuestionId?: string | null; // Parent question ID for database insertion
}

// create object for logging
export interface QuestionToInsert {
  id: string;
  key: string;
  content: string;
  sectionId: string | null;
  tags: string;
  weightage: number;
  Sequence: number | null;
  type: string | null;
  isRequired?: boolean;
  tooltip: string | null;
  // Store parent code for relationship tracking in form fields
  parentCode?: string | null;
  // Use parentQuestionId for database insertion
  parentQuestionId?: string | null;
  min?: number | null;
  max?: number | null;
  options?: string | null;
  format?: string | null;
  placeholder?: string | null;
  isMainQuestion?: boolean;
  questionCode?: string | null;
  visibleCondition?: string | null;
  customValidation?: string | null;
}

/**
 * Reads the Excel file and extracts question data
 * @param file Excel file
 * @returns Array of question data
 */
export const readQuestionsFromExcel = (
  file: File
): Promise<ExcelQuestionData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });

        // Get the Questions sheet
        const questionsSheet = workbook.Sheets["Questions"];
        if (!questionsSheet) {
          reject(new Error("No Questions sheet found in the Excel file"));
          return;
        }

        // Convert to JSON
        const questions =
          XLSX.utils.sheet_to_json<ExcelQuestionData>(questionsSheet);

        resolve(questions);
      } catch (error) {
        reject(error);
      }
    };

    reader.onerror = (error) => {
      reject(error);
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Processes the question data from Excel to match the database schema
 * Filters only questions where "Is Main Question" is "Yes"
 * @param questions Array of question data from Excel
 * @param sectionCodeToIdMap Map of section codes to their IDs
 * @returns Array of processed question data ready for database insertion
 */
/**
 * Processes question data from Excel and maps it to the correct format for database insertion
 * @param questions Array of question data from Excel
 * @param sectionCodeToIdMap Mapping of section codes to their corresponding database IDs
 * @param sectionsData Optional array of original section data to help with advanced matching
 * @returns Array of processed questions ready for database insertion
 */
export const processQuestionData = (
  questions: ExcelQuestionData[],
  sectionCodeToIdMap: Record<
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
  >
): {
  questionsToInsert: QuestionToInsert[];
  processedQuestions: ProcessedQuestionData[];
} => {
  try {
    // Normalize the section code to ID map keys
    const normalizedSectionMap: Record<string, string> = {};

    // Check if sectionCodeToIdMap is empty or invalid
    if (!sectionCodeToIdMap || Object.keys(sectionCodeToIdMap).length === 0) {
      // Map is empty or invalid, but we'll continue silently
    }
    // First create a map of question codes to their IDs
    const questionCodeToIdMap: Record<string, string> = {};
    questions.forEach((q) => {
      const questionCode = q["Section Code"] + "." + q["Question Code"];
      const id = uuidv4();
      questionCodeToIdMap[questionCode] = id;
    });

    const questionsToInsert: QuestionToInsert[] = [];

    // Create a map of child to parent relationships
    const childToParentMap: Record<string, string> = {};
    questions.forEach((q) => {
      const questionCode = q["Section Code"] + "." + q["Question Code"];
      const parentCode = q["Parent Question Code"]
        ? q["Parent Question Code"].trim()
        : null;
      if (parentCode) {
        childToParentMap[questionCode] = parentCode;
      }
    });

    // Helper function to check if a question is a descendant of another
    const isDescendantOf = (
      childCode: string,
      potentialAncestorCode: string
    ): boolean => {
      const visited = new Set<string>();
      let currentCode = childCode;

      while (childToParentMap[currentCode]) {
        // Check for cycle
        if (visited.has(currentCode)) {
          console.warn(
            `Cycle detected in question hierarchy at: ${currentCode}`
          );
          return false;
        }
        visited.add(currentCode);

        if (childToParentMap[currentCode] === potentialAncestorCode) {
          return true;
        }
        currentCode = childToParentMap[currentCode];
      }
      return false;
    };

    console.log("childToParentMap", childToParentMap);

    // Sort questions to ensure parents come before children
    const sortedQuestions = [...questions].sort((a, b) => {
      const aCode = a["Section Code"] + "." + a["Question Code"];
      const bCode = b["Section Code"] + "." + b["Question Code"];

      // If B is a descendant of A, A should come first
      if (isDescendantOf(bCode, aCode)) return -1;

      // If A is a descendant of B, B should come first
      if (isDescendantOf(aCode, bCode)) return 1;

      // Otherwise, keep original order
      return 0;
    });

    console.log("sortedQuestions", sortedQuestions);
    // Process all questions, not just main questions
    const processedQuestions: ProcessedQuestionData[] = sortedQuestions.map(
      (q) => {
        // Normalize the section code by replacing dots with underscores
        // Add null checks to prevent errors with undefined values
        const sectionCodeRaw = q["Section Code"] || "";

        // const normalizedSectionCode = sectionCodeRaw.trim().replace(/\./g, "_");
        let sectionId = sectionCodeToIdMap[sectionCodeRaw]?.id || null;

        //create a two seperate objects one for question insert input and another for logging

        const id =
          questionCodeToIdMap[q["Section Code"] + "." + q["Question Code"]];

        // Check for parent question code
        const parentCode = q["Parent Question Code"]
          ? q["Parent Question Code"].trim().replace("_container", "")
          : null;

        // insert value in questionsToInsert array
        const parentQuestionId = parentCode
          ? questionCodeToIdMap[parentCode]
          : null;
        console.log("parentQuestionId", parentQuestionId);

        const keyWithUnderscores = (
          q["Section Code"] +
          "." +
          q["Question Code"]
        )
          .trim()
          .replace(/\./g, "_");
        const parentCodeWithUnderscores = parentCode
          ? parentCode.trim().replace(/\./g, "_")
          : null;

        questionsToInsert.push({
          id,
          key: keyWithUnderscores,
          content: q["Questions"],
          sectionId,
          tags: "{}", // Default empty tags to avoid null issues
          weightage: 0, // Default weightage
          Sequence: q["Sequence"] ? Number(q["Sequence"]) : null, // Convert to number or null
          type: q["Type"] || null,
          tooltip: q["Guidence / Tool Tip"] || q["Tooltip"] || null, // Default to null if not provided
          parentCode: parentCodeWithUnderscores, // Store parent code for form field relationship tracking
          parentQuestionId, // Add parent question ID for database insertion
          isRequired: q["Required"] === "Yes" || q["Required"] === "true", // Convert to boolean
          min: q["Min"] ? Number(q["Min"]) : null,
          max: q["Max"] ? Number(q["Max"]) : null,
          options: q["Options"] || null,
          format: q["Format"] || null,
          placeholder: q["Placeholder"] || null,
          isMainQuestion: q["Is Main Question"] === "Yes" || false,
          questionCode: q["Question Code"] || null,
          visibleCondition: q["Visible Condition"] || null,
          customValidation: q["Custom Validation"] || null,
        });
        return {
          id,
          key: keyWithUnderscores,
          content: q["Questions"],
          sectionId,
          tags: "{}", // Default empty tags to avoid null issues
          weightage: 0, // Default weightage
          parentQuestionId, // Add parent question ID for database relationships
        };
      }
    );

    // Return the processed questions and questionsToInsert
    return {
      questionsToInsert,
      processedQuestions,
    };
  } catch (error) {
    return { questionsToInsert: [], processedQuestions: [] };
  }
};

/**
 * Validates the Excel file for proper question data
 * @param file Excel file to validate
 * @returns Boolean indicating if the file is valid
 */
export const validateQuestionsExcelFile = async (
  file: File
): Promise<{
  isValid: boolean;
  error?: { isValid: boolean; error?: string }[];
}> => {
  try {
    const questions = await readQuestionsFromExcel(file);

    // Check if we have at least one question
    if (questions.length === 0) {
      return {
        isValid: false,
        error: [
          {
            isValid: false,
            error: "No questions found in the Excel file",
          },
        ],
      };
    }

    // Define required fields
    const requiredFields = [
      "Section Code",
      "Question Code",
      "Questions",
      "Type",
      "Sequence",
    ];
    let missingFields: string[] = [];
    let result: { isValid: boolean; error?: string }[] = [];

    // Check all rows for required fields
    const questionCodeSet = new Set<string>();

    // READ SECTIONS to validate if section code exists
    let sectionCodes: Set<string> = new Set();
    try {
      const sections = await readSectionsFromExcel(file);
      sectionCodes = new Set(sections.map((s) => s["Section Code"]?.toString().trim()));
    } catch (e) {
      // If sections cannot be read, we will report it if questions depend on them
    }

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];
      missingFields = requiredFields.filter(
        (field) =>
          !question[field as keyof ExcelQuestionData]?.toString().trim()
      );

      if (missingFields.length > 0) {
        result.push({
          isValid: false,
          error: `Row ${i + 2
            } is missing required field(s): ${missingFields.join(", ")}`,
        });
      }

      // Check if section code exists in Sections sheet
      const sectionCode = question["Section Code"]?.toString().trim();
      if (sectionCode && !sectionCodes.has(sectionCode)) {
        result.push({
          isValid: false,
          error: `Section code "${sectionCode}" found in "Questions" sheet but not in "Sections" sheet`,
        });
      }

      // Check if the question code is unique
      const questionCode =
        question["Section Code"] + "." + question["Question Code"];
      if (questionCodeSet.has(questionCode)) {
        result.push({
          isValid: false,
          error: `Question code ${questionCode} is not unique`,
        });
      }
      questionCodeSet.add(questionCode);
    }
    if (result?.length > 0) {
      return {
        isValid: false,
        error: result,
      };
    }

    return { isValid: true, error: result };
  } catch (error) {
    return {
      isValid: false,
      error:
        error instanceof Error
          ? [{ isValid: false, error: error.message }]
          : [{ isValid: false, error: "Failed to validate Excel file" }],
    };
  }
};
