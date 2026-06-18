import { v4 as uuidv4 } from "uuid";
import * as XLSX from "xlsx";

/**
 * Interface for the section data from Excel
 */
export interface ExcelSectionData {
  "Section Code": string;
  "Section Name": string;
  "Parent Section Code": string;
  "Section Tags": string;
  Tooltip: string;
}

/**
 * Interface for the processed section data to be inserted into the database
 */
export interface ProcessedSectionData {
  id: string; // Added UUID field
  key: string;
  content: string;
  sectionId: string | null;
  tags: string | ""; // Fixed to allow string or any string array
  formId: string;
  weightage: number | null;
}

/**
 * Reads the Excel file and extracts section data
 * @param file Excel file
 * @returns Array of section data
 */
export const readSectionsFromExcel = (
  file: File
): Promise<ExcelSectionData[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: "array" });
        // Get the Sections sheet
        const sectionsSheet = workbook.Sheets["Sections"];
        if (!sectionsSheet) {
          reject(new Error("No Sections sheet found in the Excel file"));
          return;
        }

        // Convert to JSON
        const sections =
          XLSX.utils.sheet_to_json<ExcelSectionData>(sectionsSheet);
        resolve(sections);
      } catch (error) {
        reject(error);
        return;
      }
    };

    reader.onerror = (error) => {
      reject(error);
      return;
    };

    reader.readAsArrayBuffer(file);
  });
};

/**
 * Processes the section data from Excel to match the database schema
 * @param sections Array of section data from Excel
 * @param formId The ID of the form to associate with these sections
 * @returns Array of processed section data ready for database insertion
 */
export const processSectionData = (
  sections: ExcelSectionData[],
  formId: string
): ProcessedSectionData[] => {
  // First pass: create a map of section codes to UUIDs
  const sectionCodeToIdMap: Record<string, string> = {};

  // Create UUIDs for each section
  sections.forEach((section) => {
    // If this section has a code, assign it a UUID
    if (section["Section Code"]) {
      // Convert dots to underscores in section code before storing
      const normalizedSectionCode = section["Section Code"].replace(/\./g, "_");
      sectionCodeToIdMap[normalizedSectionCode] = uuidv4();

      // Also store the mapping with the original section code for reference
      if (section["Section Code"] !== normalizedSectionCode) {
        // Silently convert section code
      }
    }
  });

  // If the Excel file doesn't have parent section codes explicitly set,
  // let's try to infer them from the section codes (e.g., S2.1 would have parent S2)
  const processedSections = sections.map((section) => {
    // Handle the sectionId (parent section) relationship
    let parentSectionId = null;
    let parentCode = section["Parent Section Code"];

    // Convert parent code dots to underscores if it exists
    if (parentCode && parentCode.trim() !== "") {
      parentCode = parentCode.replace(/\./g, "_");
    }

    // If no parent code is explicitly set but the section code has a dot (like S2.1),
    // try to infer the parent code (S2 in this case)
    if (
      (!parentCode || parentCode.trim() === "") &&
      section["Section Code"].includes(".")
    ) {
      const lastDotIndex = section["Section Code"].lastIndexOf(".");
      if (lastDotIndex > 0) {
        const inferredParentCode = section["Section Code"].substring(
          0,
          lastDotIndex
        );

        // Convert inferred parent code dots to underscores
        const normalizedInferredParentCode = inferredParentCode.replace(
          /\./g,
          "_"
        );

        // Check if this inferred parent code exists in our map
        if (sectionCodeToIdMap[normalizedInferredParentCode]) {
          parentCode = normalizedInferredParentCode;
          console.log(
            `Inferred parent code "${parentCode}" for section "${section["Section Code"]}"`
          );
        }
      }
    }

    if (parentCode && parentCode.trim() !== "") {
      parentSectionId = sectionCodeToIdMap[parentCode];

      // Silent if parent section code exists but ID wasn't found
      if (!parentSectionId) {
        // No warning needed
      }
    }

    return {
      id:
        sectionCodeToIdMap[section["Section Code"].replace(/\./g, "_")] ||
        uuidv4(),
      key: section["Section Code"].replace(/\./g, "_"), // Convert dots to underscores in the key
      content: section["Section Name"],
      sectionId: parentSectionId,
      tags: !!section["Section Tags"]
        ? "{" + section["Section Tags"] + "}"
        : "{}",
      formId,
      weightage: 0, // Default weightage is ZERO
    };
  });

  // Return processed sections
  return processedSections;
};

/**
 * Validates the Excel file for proper section data
 * @param file Excel file to validate
 * @returns Boolean indicating if the file is valid
 */
export const validateSectionsExcelFile = async (
  file: File
): Promise<{
  isValid: boolean;
  error?: { isValid: boolean; error?: string }[];
}> => {
  try {
    const sections = await readSectionsFromExcel(file);

    // Check if we have at least one section
    if (sections.length === 0) {
      return {
        isValid: false,
        error: [
          { isValid: false, error: "No sections found in the Excel file" },
        ],
      };
    }

    // Check all rows for required fields
    const requiredFields = ["Section Code", "Section Name"];
    let missingFields: string[] = [];
    let result: { isValid: boolean; error?: string }[] = [];

    for (let i = 0; i < sections.length; i++) {
      const section = sections[i];
      missingFields = requiredFields.filter(
        (field) => !section[field as keyof ExcelSectionData]?.toString().trim()
      );

      if (missingFields.length > 0) {
        result.push({
          isValid: false,
          error: `Row ${
            i + 2
          } is missing required field(s): ${missingFields.join(", ")}`,
        });
      }
    }
    if (result.length > 0) {
      return {
        isValid: false,
        error: result,
      };
    }

    return { isValid: true, error: result };
  } catch (error) {
    return {
      isValid: false,
      error: [{ isValid: false, error: "Failed to validate Excel file" }],
    };
  }
};
