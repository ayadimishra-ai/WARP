import { convertDBAnswersToStoreAnswers } from "@warp/client/features/form/store";
import { useGetFormfieldAndAnswersByinvitationIdLazyQuery } from "@warp/graphql/queries/generated/get-formfield-and-answers-by-invitationId";
import {
  AlignmentType,
  BorderStyle,
  Document,
  ExternalHyperlink,
  Header,
  HeadingLevel,
  NumberFormat,
  Packer,
  PageBreak,
  Paragraph,
  Table,
  TableCell,
  TableLayoutType,
  TableRow,
  TextRun,
  UnderlineType,
  VerticalAlign,
  WidthType,
} from "docx";
import { saveAs } from "file-saver";
import { useState } from "react";

type ContentItem = TextContent | TableContent;

interface JsonData {
  title: string;
  author: string;
  date: string;
  pdfHeader: string;
  content: ContentItem[];
}
interface AnswerData {
  [key: string]: { value: string };
}
interface TextContent {
  type?:
    | "heading"
    | "paragraph"
    | "linebreak"
    | "hyperlink"
    | "html"
    | "pagebreak";
  text?: string;
  size?: number;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  alignment?: string;
  href?: string;
  decimalPrecesion?: number;
  pagebreak?: number;
  color?: string;
  isYear?: boolean;
  isLowerCase?: boolean;
  isPreserveCase?: boolean;
  requiresLinebreak?: boolean;
}
interface TableContent {
  type: "table";
  field?: string | null;
  columns: string[];
  subColumns: string[];
  rows: Array<{
    text: string;
    rowspan?: string;
    colspan?: number;
    isHtml?: boolean;
    alignment?: string;
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    decimalPrecesion?: number;
    isPreserveCase?: boolean;
    removeIfEmpty?: boolean;
  } | null>[];
  rowsDynamic?: {
    field: string | null;
    keyMap: { [key: string]: string };
  };

  keyMap?: { [key: string]: string };

  config?: {
    autonumbering?: {
      enable: boolean;
      name: string;
    };
    columnvalue?: Array<{
      name: string;
      field: string;
      position: "left" | "right";
      isFinancialYear: boolean;
    } | null>;

    style?: {
      width?: Array<{
        name: string;
        size: number;
      }>;
      alignment: Array<{
        name: string;
        value: string;
      }>;
      bold: Array<{
        name: string;
        value: boolean;
      }>;
    };
    rules?: Array<{
      index: number;
      rule: string;
    } | null>;
  };
}
interface CellOptions {
  text?: string;
  colspan?: number;
  rowspan?: number;
  width?: number;
  bold?: boolean;
  italics?: boolean;
  underline?: boolean;
  alignment?: string;
  isHtml?: boolean;
  isHyperlink?: boolean;
  verticalAlign?: any;
  hasBorder?: boolean;
  hasMargin?: boolean;
  url?: string; // For hyperlinks
}

const defaultConfig = {
  fontName: "Calibri",
  fontSize: 19, // 22 means 11 pt
};

let abstractNumberingId = 0;
let numberingInstances: any = [];

function isValidURL(url: any): boolean {
  if (typeof url !== "string") return false; // Ensure url is a string

  const regex = /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i;

  if (!regex.test(url)) {
    if (url.startsWith("www.")) {
      url = "http://" + url;
      return regex.test(url);
    }
    return false;
  }

  return true;
}

const FirstLetterCapital = (value: any): string => {
  if (typeof value !== "string" || !value) return value; // Ensure value is a string

  if (isValidURL(value)) {
    return value;
  }

  return value.charAt(0).toUpperCase() + value.slice(1);
};

const lowerCaseContent = (value: any): string => {
  if (typeof value !== "string" || !value) return value; // Ensure value is a string

  if (isValidURL(value)) {
    return value;
  }

  return value.toLowerCase();
};

const evaluateMathExpression = (
  expression: string,
  answerData: Record<string, any>,
): string => {
  try {
    const replacedExpression = expression.replace(
      /\b([a-zA-Z_][\w.]*)\b/g,
      (match) => {
        // Ignore direct numbers
        if (!isNaN(Number(match))) {
          return match;
        }

        // Check if the key exists in answerData and has a direct value
        if (answerData[match]?.value !== undefined) {
          return answerData[match].value.toString();
        }

        // Handle nested keys
        const keys = match.split(".");
        let value: any = answerData;

        for (const key of keys) {
          if (key === "length" && Array.isArray(value)) {
            return value.length.toString(); // Handle array length
          }
          value = value?.[key];
          if (value === undefined) return 0; // Keep unknown keys unchanged
        }

        return typeof value === "number" || !isNaN(Number(value))
          ? value.toString()
          : 0;
      },
    );

    return eval(replacedExpression).toString();
  } catch (error) {
    return "ERROR";
  }
};

const TableCellText = (value: string | null | undefined): string => {
  if (value == null || value == undefined) {
    return "";
  }

  return value.replace(
    /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z/g,
    (match) => formatDate(match, false), // Ensure formatDate returns a string
  );
};

const processNestedPlaceholder = (
  expression: string,
  answerData: Record<string, any>,
): string => {
  return expression.trim().replace(/(\w+\.\w+)/g, (match: string) => {
    if (match.includes(".")) {
      const fieldData = match.split(".");
      const fieldArray = answerData[fieldData[0]]?.value;

      if (Array.isArray(fieldArray)) {
        return fieldArray
          .map((entry: Record<string, any>, index: number, array: any[]) => {
            const nestedValue = FirstLetterCapital(entry[fieldData[1]]?.value);
            if (nestedValue) {
              return `${entry.value} - ${nestedValue}${
                index < array.length - 1 ? "," : "|Nested"
              }`;
            }
            return "";
          })
          .filter(Boolean) // Remove any empty results
          .join("");
      }
    }
    return ""; // If fieldData is not an array, return empty string
  });
};

const extractNestedValues = (
  answerData: Record<string, any>,
  keyPath: string,
): string[] => {
  // Extract the first part of the keyPath (e.g., "s3_6_1_q6_1_1_2_1.value")
  let mainKey = keyPath.split(".")[0];

  if (!answerData[mainKey] || !Array.isArray(answerData[mainKey].value)) {
    return []; // Return empty array if no valid data
  }

  return answerData[mainKey].value
    .map((item: any) => item?.s3_6_1_q6_1_1_2_1_1?.value ?? null) // Extract nested values
    .filter(Boolean) // Remove null/undefined values
    .map((val: any) => val.toString().trim()); // Convert to string and trim
};

const processArrayPush = (
  baseArray: string,
  keyPath: string,
  answerData: Record<string, any>,
): string => {
  let baseItems = baseArray
    .split(",")
    .map((item) => item.trim().replace(/['"\[\]]/g, "")); // Clean base array

  let pushValues = getNestedValue(answerData, keyPath.trim());
  let additionalItems: string[] = [];

  if (Array.isArray(pushValues)) {
    additionalItems = pushValues.map((val) =>
      typeof val === "object" && val.value
        ? val.value.toString().trim()
        : val.toString().trim(),
    );
  } else if (typeof pushValues === "string" && pushValues.includes(",")) {
    additionalItems = pushValues.split(",").map((val) => val.trim());
  } else if (pushValues) {
    additionalItems = [pushValues.toString().trim()];
  }

  // **New Handling for Nested Values**
  if (additionalItems.length === 0) {
    additionalItems = extractNestedValues(answerData, keyPath);
  }

  return `ARRAY:['${[...baseItems, ...additionalItems].join("', '")}']`; // Proper array format
};
const getContainedValue = (
  text: string,
  answerData: Record<string, any>,
): string => {
  try {
    return text.replace(
      /\{\{CONTAIN:([\w.]+)\[(.*?)\]\.(.*?)\}\}/g,
      (_, arrayPath, searchValue, targetKey) => {
        const keys = arrayPath.split(".");
        let data: any = answerData;

        for (const key of keys) {
          data = data?.[key];
          if (!data) {
            return "";
          }
        }
        if (!Array.isArray(data)) {
          return "";
        }

        const foundItem = data.find((item: any) => item.value === searchValue);

        if (!foundItem) {
          return "";
        }

        const result = foundItem[targetKey]?.value ?? "";

        return result;
      },
    );
  } catch (error) {
    return text;
  }
};

const evaluateCondition = (
  condition: string,
  answerData: Record<string, any>,
): boolean => {
  const operators = ["==", "!=", "<=", ">=", "<", ">"];
  const logicalOperators = ["&&", "||"];

  let conditionList = condition.split(/(&&|\|\|)/).map((s: string) => s.trim());
  let finalResult = true;
  let lastLogicalOp = "&&";

  for (let i = 0; i < conditionList.length; i++) {
    const cond = conditionList[i];

    if (logicalOperators.includes(cond)) {
      lastLogicalOp = cond;
      continue;
    }

    let [field, operator, expectedValue] = ["", "", ""];
    for (const op of operators) {
      if (cond.includes(op)) {
        [field, expectedValue] = cond.split(op).map((s: string) => s.trim());
        operator = op;
        break;
      }
    }

    const actualValue = answerData[field]?.value;
    if (actualValue === undefined) return false; // Field not found

    let conditionMet = false;
    switch (operator) {
      case "==":
        conditionMet =
          actualValue == expectedValue.replace(/^['"](.*?)['"]$/, "$1");
        break;
      case "!=":
        conditionMet =
          actualValue != expectedValue.replace(/^['"](.*?)['"]$/, "$1");
        break;
      case "<":
        conditionMet = parseFloat(actualValue) < parseFloat(expectedValue);
        break;
      case ">":
        conditionMet = parseFloat(actualValue) > parseFloat(expectedValue);
        break;
      case "<=":
        conditionMet = parseFloat(actualValue) <= parseFloat(expectedValue);
        break;
      case ">=":
        conditionMet = parseFloat(actualValue) >= parseFloat(expectedValue);
        break;
    }

    finalResult =
      lastLogicalOp === "&&"
        ? finalResult && conditionMet
        : finalResult || conditionMet;
  }

  return finalResult;
};

const processText = ({
  text,
  answerData,
  isYear = false,
  isLowerCase = false,
  isPreserveCase = false,
}: {
  text: string;
  answerData: Record<string, any>;
  isYear?: boolean;
  isLowerCase?: boolean;
  isPreserveCase?: boolean;
}): string => {
  if (typeof text !== "string") return text;

  return (
    text
      // ✅ Process Financial Year placeholders
      .replace(/\{\{FY:(.*?)\}\}/g, (match, fieldPath) => {
        return processFinancialYear(match, answerData);
      })
      // ✅ Process Math placeholders (Future-proofing)
      .replace(/\{\{MATH:(.*?)\}\}/g, (match, expression) => {
        return evaluateMathExpression(expression, answerData);
      })
      .replace(
        /ARRAY:\[(.*?)\]\.\{\{PUSH:(.*?)\}\}/g,
        (match, baseArray, keyPath) => {
          return processArrayPush(baseArray, keyPath, answerData);
        },
      )

      .replace(
        /\{\{COND\[(.*?)\](?:\[(.*?)\])?\:(.*?)\}\}/g,
        (match, conditions, symbol, trueValue) => {
          return evaluateCondition(conditions, answerData)
            ? (symbol !== undefined ? symbol : "") +
                (isPreserveCase
                  ? (answerData[trueValue]?.value ?? "")
                  : FirstLetterCapital(answerData[trueValue]?.value ?? ""))
            : "";
        },
      )
      .replace(
        /\{\{IF:(.*?)\}\}([\s\S]*?)(\{\{ELSE\}\}([\s\S]*?))?\{\{\/IF\}\}/g,
        (match, condition, ifContent, _, elseContent) => {
          return evaluateCondition(condition, answerData)
            ? processText({ text: ifContent?.trim(), answerData: answerData })
            : elseContent
              ? processText({
                  text: elseContent?.trim(),
                  answerData: answerData,
                })
              : "";
        },
      )

      .replace(
        /\{\{CONDN\[(.*?)\]\:(.*?)\}\}/g,
        (match, conditions: string, trueValue: string) => {
          const operators = ["==", "!=", "<=", ">=", "<", ">"];
          const logicalOperators = ["&&", "||"];
          var a = answerData;

          // Splitting the conditions based on logical operators and trimming whitespace
          let conditionList = conditions
            .split(/(&&|\|\|)/)
            .map((s: string) => s.trim());

          let finalResult = true;
          let lastLogicalOp = "&&"; // Default logical operation

          // Iterate through the conditions to check their validity
          for (let i = 0; i < conditionList.length; i++) {
            const condition = conditionList[i];

            if (logicalOperators.includes(condition)) {
              lastLogicalOp = condition; // Update logical operator
              continue;
            }

            let field = "";
            let expectedValue = "";
            let operator = "";

            // Detect the operator and split the condition
            for (const op of operators) {
              if (condition.includes(op)) {
                const parts = condition.split(op).map((s: string) => s.trim());
                field = parts[0];
                expectedValue = parts[1];
                operator = op;
                break;
              }
            }

            if (!field || !operator) return ""; // Invalid condition

            // Handle array access (e.g., field[0].value)
            const fieldParts = field.split(".");
            let actualValue: any = a;

            // Resolve the field access using dot notation and array indexing
            for (let j = 0; j < fieldParts.length; j++) {
              if (fieldParts[j].includes("[") && fieldParts[j].includes("]")) {
                // Handling array index notation
                const arrayIndex = parseInt(
                  fieldParts[j].match(/\[(\d+)\]/)?.[1] || "-1",
                  10,
                );
                if (arrayIndex < 0) return ""; // Return empty string if index is invalid

                actualValue = actualValue
                  ? actualValue[fieldParts[j].split("[")[0]]?.[arrayIndex]
                  : undefined;
              } else {
                // Handle normal dot notation
                actualValue = actualValue
                  ? actualValue[fieldParts[j]]
                  : undefined;
              }
            }

            if (actualValue === undefined) return ""; // If field is not found, return empty

            // Process the condition comparison
            let conditionMet = false;
            switch (operator) {
              case "==":
                conditionMet =
                  actualValue == expectedValue.replace(/['"]/g, "");
                break;
              case "!=":
                conditionMet =
                  actualValue != expectedValue.replace(/['"]/g, "");
                break;
              case "<":
                conditionMet =
                  parseFloat(actualValue) < parseFloat(expectedValue);
                break;
              case ">":
                conditionMet =
                  parseFloat(actualValue) > parseFloat(expectedValue);
                break;
              case "<=":
                conditionMet =
                  parseFloat(actualValue) <= parseFloat(expectedValue);
                break;
              case ">=":
                conditionMet =
                  parseFloat(actualValue) >= parseFloat(expectedValue);
                break;
              default:
                conditionMet = false;
            }

            // Apply logical operator
            if (lastLogicalOp === "&&") {
              finalResult = finalResult && conditionMet;
            } else if (lastLogicalOp === "||") {
              finalResult = finalResult || conditionMet;
            }
          }

          // Check if answerData is defined and trueValue exists within it
          if (a && trueValue) {
            // Return the processed value if the condition evaluates to true
            const pathParts = trueValue.split(".");

            let currentValue: any = a;

            for (const part of pathParts) {
              if (part.includes("[")) {
                // Handle array index (e.g., value[0])
                const [field, index] = part.split("[");
                const actualIndex = parseInt(index.replace("]", ""), 10);

                if (actualIndex < 0) return ""; // Return empty string if index is invalid

                // Access the array index
                currentValue = currentValue[field]?.[actualIndex];
              } else {
                // Access the direct field
                currentValue = currentValue[part.trim()];
              }
            }

            // If the current value is found, return it
            if (isPreserveCase) {
              return currentValue !== undefined ? currentValue : "";
            }
            return currentValue !== undefined
              ? FirstLetterCapital(currentValue)
              : "";
          }

          // Return an empty string if answerData or trueValue is invalid
          return "";
        },
      )
      .replace(/\{\{(NUM:)?(\w+)\}\}/g, (match, isNum, key) => {
        let value = answerData[key]?.value;
        if (value == "") {
          value = "0";
        }
        if (isNum) {
          return value !== undefined ? value : "0"; // Return 0 if NUM is used and value is missing
        }

        return FirstLetterCapital(value) || "";
      })
      .replace(/\{\{CONTAIN:([\w.]+)\[(.*?)\]\.(.*?)\}\}/g, (match) => {
        return getContainedValue(match, answerData);
      })

      // ✅ Process normal text placeholders ($key → value)
      .replace(/\$(\w+)/g, (match, key) => {
        if (isPreserveCase) {
          return answerData[key]?.value || "";
        } else if (isLowerCase) {
          return lowerCaseContent(answerData[key]?.value) || "";
        } else {
          return FirstLetterCapital(answerData[key]?.value) || "";
        }
      })
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/g, (match) =>
        formatDate(match, isYear),
      )
      // ✅ Process NESTED placeholders using the new function
      .replace(
        /\{\{NESTED:\s*([\s\S]*?)\}\}/g,
        (match: string, expression: string) => {
          return processNestedPlaceholder(expression, answerData);
        },
      )
      .replace(
        /\{\{CONDS\[(.*?)\]\s*:\s*(.*?)\}\}/g,
        (match, conditions: string, trueValue: string) => {
          try {
            // Extract the field and expected value
            const [fieldPath, expectedValue] = conditions
              .split("==")
              .map((s) => s.trim().replace(/['"]/g, ""));

            if (!fieldPath || !expectedValue) {
              return "";
            }

            // Split the field path into main and subfield parts
            const [mainField, subField] = fieldPath.split(">");
            const [parentKey, childKey] = mainField.split(".");

            // Validate the main field structure
            const fieldData = answerData?.[parentKey]?.[childKey];
            if (!Array.isArray(fieldData)) {
              return "";
            }

            // Find the matching item
            const matchingItem = fieldData.find(
              (item) => item?.[subField] === expectedValue,
            );
            if (!matchingItem) {
              return "";
            }

            // Extract the true value
            const outputPathParts = trueValue
              .split(">")
              .flatMap((part) => part.trim().split("."));
            let result = matchingItem;

            for (const key of outputPathParts) {
              if (result[key] === undefined) {
                return "";
              }
              result = FirstLetterCapital(result[key]);
            }

            return result ?? "";
          } catch (error) {
            return "";
          }
        },
      )
      .replace(/\u0002/g, "") // Remove invisible control characters
      .trim() // Trim any extra spaces
    // Other processing steps...
  );
};

const replacePlaceholders = (
  jsonData: JsonData,
  answerData: AnswerData,
): JsonData => {
  return {
    ...jsonData,
    content: (jsonData.content || [])
      .map((item) => {
        // ✅ Handle paragraph content
        if ("text" in item && item.text) {
          return {
            ...item,
            text: processText({
              text: item.text,
              answerData: answerData,
              isYear: item.isYear,
              isLowerCase: item.isLowerCase,
              isPreserveCase: item.isPreserveCase,
            }),
          };
        }

        if (item.type == "table") {
          // update data of alignment
          item.config?.style?.alignment?.map((e) => {
            e.name = processText({ text: e.name, answerData: answerData });
          });
          // update data of width
          item.config?.style?.width?.map((e) => {
            e.name = processText({ text: e.name, answerData: answerData });
          });
          item.config?.style?.bold?.map((e) => {
            e.name = processText({ text: e.name, answerData: answerData });
          });
        }
        // ✅ Handle Table content (with field mapping)
        if (
          item.type === "table" &&
          item.field &&
          answerData[item.field]?.value
        ) {
          const tableData = answerData[item.field].value;
          const keyMap = item.keyMap || {}; // Get key mapping from JSON
          // Auto-numbering
          const autoNumbering = item.config?.autonumbering?.enable;
          const numberColumnName = item.config?.autonumbering?.name || "S. No.";
          const updatedColumns = autoNumbering
            ? [numberColumnName, ...item.columns]
            : item.columns;

          if (Array.isArray(tableData)) {
            return {
              ...item,
              columns: updatedColumns.map((col) =>
                processText({ text: col, answerData: answerData }),
              ), // ✅ Process column placeholders
              rows: tableData.map((entry: any, index: number) =>
                updatedColumns.map((col, colIndex) => {
                  if (autoNumbering && colIndex === 0)
                    return { text: (index + 1).toString() }; // Handle numbering

                  const key = keyMap[col] as string | undefined; // Get mapped key

                  // Function to replace placeholders dynamically
                  const replacePlaceholders = (
                    template: string,
                    entry: Record<string, any>,
                  ): string => {
                    return template.replace(
                      /\{\{(.*?)\}\}(\s*%)?/g,
                      (_, placeholder, percentage) => {
                        const fieldValue = entry[placeholder];

                        let value = "";
                        if (fieldValue !== undefined) {
                          if (
                            typeof fieldValue === "object" &&
                            fieldValue.value !== undefined
                          ) {
                            value =
                              TableCellText(
                                FirstLetterCapital(fieldValue.value),
                              ) || "";
                          } else {
                            value =
                              TableCellText(FirstLetterCapital(fieldValue)) ||
                              "";
                          }
                        }

                        // If value is "NA", remove any trailing "%".
                        return value === "NA" && percentage
                          ? FirstLetterCapital(value)
                          : FirstLetterCapital(value + (percentage || ""));
                      },
                    );
                  };

                  let value = "";

                  if (key) {
                    if (key.includes("{{")) {
                      // Case 1: If placeholders exist, replace dynamically
                      value = replacePlaceholders(key, entry);
                    } else {
                      // Case 2: If it's a direct key, fetch value
                      const fieldValue = entry[key];

                      if (fieldValue !== undefined) {
                        if (
                          typeof fieldValue === "object" &&
                          fieldValue.value !== undefined
                        ) {
                          value =
                            TableCellText(
                              FirstLetterCapital(fieldValue.value),
                            ) || "";
                        } else {
                          value =
                            TableCellText(FirstLetterCapital(fieldValue)) || "";
                        }
                      }
                    }
                  }

                  return {
                    text: processText({ text: value, answerData: answerData }),
                  };
                }),
              ),
            };
          } else {
            return item; // Return the original item if table data is invalid
          }
        }
        // ✅ Handle Tables WITHOUT field mapping
        else if (item.type === "table" && !item.field) {
          return {
            ...item,
            rows: item.rows.map((row) =>
              row.map((cell) =>
                cell
                  ? {
                      ...cell,
                      text: processText({
                        text: cell.text,
                        answerData: answerData,
                        isPreserveCase: cell.isPreserveCase,
                      }),
                      rowspan: cell.rowspan
                        ? eval(
                            processText({
                              text: cell.rowspan,
                              answerData: answerData,
                            }),
                          )
                        : undefined,
                    }
                  : null,
              ),
            ),
            columns: item.columns.map((cell) =>
              processText({
                text: cell,
                answerData: answerData,
              }),
            ),
          };
        }

        return item;
      })
      // ✅ NEW: Add conditional linebreaks based on requiresLinebreak flag
      .flatMap((item) => {
        if (
          (item.type === "paragraph" || item.type === "heading") &&
          "text" in item &&
          "requiresLinebreak" in item &&
          item.requiresLinebreak &&
          item.text?.trim() // Only if content exists
        ) {
          return [{ type: "linebreak" as const }, item];
        }
        return [item];
      })
      // ✅ Filter out empty paragraphs and headings after placeholder replacement
      .filter((item) => {
        // Keep linebreaks, pagebreaks, tables, hyperlinks, and html content
        if (
          item.type === "linebreak" ||
          item.type === "pagebreak" ||
          item.type === "table" ||
          item.type === "hyperlink" ||
          item.type === "html"
        ) {
          return true;
        }

        // Filter out empty paragraphs and headings
        if (
          (item.type === "paragraph" || item.type === "heading") &&
          "text" in item
        ) {
          // Remove if text is empty, only whitespace, or only contains placeholder syntax
          const trimmedText = item.text?.trim() || "";

          // Check if text is empty or only contains unreplaced placeholders
          if (
            !trimmedText ||
            trimmedText === "" ||
            /^\$\w+$/.test(trimmedText) || // Single placeholder like $s1_1_q1_2
            /^{{.*}}$/.test(trimmedText) // Template syntax like {{IF:...}}
          ) {
            return false;
          }
        }

        return true;
      })
      // ✅ Ensure tables always have rows array defined (prevent undefined errors)
      .map((item) => {
        if (item.type === "table") {
          return {
            ...item,
            rows: item.rows || [], // Ensure rows is always an array
          };
        }
        return item;
      }),
  };
};

const evaluateExpression = (
  text: string,
  decimalPlaces: number = 0,
): string => {
  if (!text || text == undefined) {
    return text;
  }

  return text.replace(/#\(?([^)#]+)\)?#/g, (_, expression) => {
    try {
      const result = eval(expression);
      return (
        typeof result === "number" ? result.toFixed(decimalPlaces) : result
      ).toString();
    } catch {
      return "Invalid Expression";
    }
  });
};

const getAlignmentType = (
  alignment?: string,
): (typeof AlignmentType)[keyof typeof AlignmentType] => {
  switch (alignment) {
    case "center":
      return AlignmentType.CENTER;
    case "right":
      return AlignmentType.RIGHT;
    case "justify":
      return AlignmentType.JUSTIFIED;
    default:
      return AlignmentType.LEFT;
  }
};

const formatTextRun = (item: {
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: number;
  color?: string;
  font?: string;
}): (TextRun | ExternalHyperlink)[] => {
  if (!item.text) return [new TextRun("")];

  const elements: (TextRun | ExternalHyperlink)[] = [];

  // Check if text contains NEWLINE: prefix or has actual newlines
  if (item.text.includes("\n") || item.text.startsWith("NEWLINE:")) {
    // Split by newlines first, then handle each line
    const lines = item.text.split("\n");

    for (let lineIndex = 0; lineIndex < lines.length; lineIndex++) {
      const line = lines[lineIndex];
      const parts = line.split(/\s+/).filter((part) => part.length > 0);

      for (const part of parts) {
        if (isValidURL(part)) {
          elements.push(
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: part,
                  style: "Hyperlink",
                  bold: item.bold || false,
                  italics: item.italic || false,
                  underline: item.underline ? {} : undefined,
                  size: item.size ? item.size * 2 : defaultConfig.fontSize, // Default 11pt * 2
                  font: item.font || defaultConfig.fontName, // Default font
                  color: item.color ? item.color.replace("#", "") : "0000FF", // Default hyperlink color: blue
                }),
              ],
              link: part,
            }),
          );
        } else {
          elements.push(
            new TextRun({
              text: part + " ",
              bold: item.bold || false,
              italics: item.italic || false,
              underline: item.underline ? {} : undefined,
              size: item.size ? item.size * 2 : defaultConfig.fontSize, // Default 11pt * 2
              font: item.font || defaultConfig.fontName, // Default font
              color: item.color ? item.color.replace("#", "") : "000000", // Default text color: black
            }),
          );
        }
      }

      // Add line break after each line except the last one
      if (lineIndex < lines.length - 1) {
        elements.push(
          new TextRun({
            text: "",
            break: 1, // This creates a line break in the Word document
            bold: item.bold || false,
            italics: item.italic || false,
            underline: item.underline ? {} : undefined,
            size: item.size ? item.size * 2 : defaultConfig.fontSize,
            font: item.font || defaultConfig.fontName,
            color: item.color ? item.color.replace("#", "") : "000000",
          }),
        );
      }
    }
  } else {
    // Original behavior - no newline processing
    const parts = item.text.split(/\s+/);

    for (const part of parts) {
      if (isValidURL(part)) {
        elements.push(
          new ExternalHyperlink({
            children: [
              new TextRun({
                text: part,
                style: "Hyperlink",
                bold: item.bold || false,
                italics: item.italic || false,
                underline: item.underline ? {} : undefined,
                size: item.size ? item.size * 2 : defaultConfig.fontSize, // Default 11pt * 2
                font: item.font || defaultConfig.fontName, // Default font
                color: item.color ? item.color.replace("#", "") : "0000FF", // Default hyperlink color: blue
              }),
            ],
            link: part,
          }),
        );
      } else {
        elements.push(
          new TextRun({
            text: part + " ",
            bold: item.bold || false,
            italics: item.italic || false,
            underline: item.underline ? {} : undefined,
            size: item.size ? item.size * 2 : defaultConfig.fontSize, // Default 11pt * 2
            font: item.font || defaultConfig.fontName, // Default font
            color: item.color ? item.color.replace("#", "") : "000000", // Default text color: black
          }),
        );
      }
    }
  }

  return elements;
};

const getNestedValue = (
  answerData: Record<string, any>,
  fieldPath: string,
): string => {
  const keys = fieldPath.split("."); // Use dot notation for nested keys
  let value: any = answerData;

  for (const key of keys) {
    if (value?.value && Array.isArray(value.value)) {
      // Extract the required field from each object in the array
      value = value.value
        .map((item: Record<string, any>) => item[key] ?? item.value ?? "")
        .filter(Boolean);
    } else if (value && typeof value === "object" && key in value) {
      value = value[key]; // Traverse deeper
    } else {
      return ""; // Key missing
    }
  }

  // If value has a `.value` property and it's a string, return it directly
  if (typeof value?.value === "string") {
    return value.value;
  }

  // If the final value is an array, extract `.value` where possible
  if (Array.isArray(value)) {
    return value
      .map((item: any) =>
        typeof item === "object" ? (item.value ?? item) : item,
      )
      .join(", ");
  }

  return typeof value === "string" ? value : "";
};
// Helper function to format ISO dates to "DD/MM/YYYY"
const formatDate = (isoString: string, isYear: boolean): string => {
  const date = new Date(isoString);
  if (isNaN(date.getTime())) return isoString; // Return original if invalid date

  // Convert to IST (UTC+5:30)
  date.setMinutes(date.getMinutes() + date.getTimezoneOffset() + 330);

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();

  if (isYear) {
    return `${year}`;
  }
  return `${day}/${month}/${year}`;
};

const processFinancialYear = (
  text: string,
  answerData: Record<string, any>,
): string => {
  if (!text.includes("{{")) return text; // ✅ Skip processing if no placeholders exist

  return text.replace(/\{\{(.*?)\}\}/g, (match, fieldPath) => {
    const fields = fieldPath.split("|").map((field: string) => field.trim()); // Extract fields

    const years = fields
      .map((field: string) => {
        let addOne = false;

        // Detect "+1" and adjust field name
        if (field.includes("+1")) {
          field = field.replace("+1", "").trim();
          addOne = true;
        }

        // Extract year from "MM/YYYY"
        let year = getNestedValue(answerData, field)?.split("/")?.[1] ?? "";
        if (!year) return ""; // Handle missing data

        // Convert to number & apply "+1" if needed
        let yearNum = parseInt(year, 10);
        if (!isNaN(yearNum) && addOne) {
          yearNum += 1;
        }

        return yearNum.toString();
      })
      .filter(Boolean); // Remove empty values

    if (years.length === 0) return ""; // No valid data

    return years.length === 1 || years[0] === years[1]
      ? years[0]
      : `${years[0]}-${years[1].slice(-2)}`;
  });
};

//----------------Controls---------------------

const createParagraph = (item: {
  text?: string;
  bold?: boolean;
  italic?: boolean;
  underline?: boolean;
  size?: number;
  pagebreak?: number;
  borderTopSize?: number;
  borderBottomSize?: number;
  alignment?: string;
  isYear?: boolean;
  color?: string;
}): Paragraph => {
  if (item.text && /<\/?[a-z][\s\S]*>/i.test(item.text)) {
    const hasParentHtmlTag = /^<([a-z][\w-]*)\b[^>]*>[\s\S]*<\/\1>$/i.test(
      item.text.trim(),
    );
    const textContent: TextContent = {
      type: "html",
      text: hasParentHtmlTag ? item.text : `<div>${item.text}</div>`,
      size: item.size,
      color: item.color,
    };
    const paragraphs = parseHtmlToDocx(textContent);
    return Array.isArray(paragraphs) ? paragraphs[0] : paragraphs;
  }

  return new Paragraph({
    children: [
      ...(item.pagebreak === 1 ? [new TextRun(""), new PageBreak()] : []),
      ...formatTextRun(item),
    ],
    border:
      item.borderTopSize || item.borderBottomSize
        ? {
            top: item.borderTopSize
              ? {
                  color: "auto",
                  space: 1,
                  style: "single",
                  size: item.borderTopSize,
                }
              : undefined,
            bottom: item.borderBottomSize
              ? {
                  color: "auto",
                  space: 1,
                  style: "single",
                  size: item.borderBottomSize,
                }
              : undefined,
          }
        : undefined,
    alignment: getAlignmentType(item.alignment),
  });
};

const generateDynamicRows = (
  tableData: any[],
  keyMap: { [key: string]: string } | undefined,
  updatedColumns: string[],
  answerData: AnswerData,
) => {
  return tableData.map((entry: any, index: number) => {
    return updatedColumns.map((col, colIndex) => {
      const key = keyMap?.[col] as string | undefined;
      const value =
        key && entry[key] !== undefined
          ? typeof entry[key] === "object"
            ? (entry[key]?.value ?? "")
            : entry[key]
          : "";

      return { text: processText({ text: value, answerData: answerData }) };
    });
  });
};
const processKeyMapValues = (
  keyMap: { [key: string]: string },
  answerData: Record<string, any>,
): { [key: string]: string } => {
  const processedKeyMap: { [key: string]: string } = {};

  for (const [key, value] of Object.entries(keyMap)) {
    const processedKey = processText({ text: key, answerData: answerData });
    // Process the value to replace placeholders
    const processedValue = processText({ text: value, answerData: answerData });
    // Add the processed key and value to the new keyMap
    processedKeyMap[processedKey] = processedValue;
  }

  return processedKeyMap;
};
const createTableCell = ({
  text = "",
  colspan = 1,
  rowspan = 1,
  width,
  bold = false,
  italics = false,
  underline = false,
  alignment = "left",
  isHtml = false,
  isHyperlink = false,
  verticalAlign = VerticalAlign.TOP,
  hasBorder = true,
  hasMargin = true,
  url = "",
}: CellOptions): TableCell => {
  let content;
  if (text && /<\/?[a-z][\s\S]*>/i.test(text)) {
    const hasParentHtmlTag = /^<([a-z][\w-]*)\b[^>]*>[\s\S]*<\/\1>$/i.test(
      text.trim(),
    );
    const textContent: TextContent = {
      type: "html",
      text: hasParentHtmlTag ? text : `<div>${text}</div>`,
    };
    const paragraphs = parseHtmlToDocx(textContent);
    content = paragraphs;
  } else if (isHyperlink) {
    content = new Paragraph({
      children: [
        new ExternalHyperlink({
          children: [
            new TextRun({
              text,
              style: "Hyperlink",
              font: defaultConfig.fontName,
              size: defaultConfig.fontSize,
            }),
          ],
          link: url || "#",
        }),
      ],
      alignment:
        alignment == "center"
          ? "center"
          : alignment == "right"
            ? "right"
            : "left",
    });
  } else if (isHtml) {
    content = parseHtmlToDocx({ text });
  } else {
    content = new Paragraph({
      children: [
        new TextRun({
          text,
          bold,
          italics,
          underline: underline ? { type: "single" } : undefined,
          font: defaultConfig.fontName,
          size: defaultConfig.fontSize,
        }),
      ],
      alignment:
        alignment == "center"
          ? "center"
          : alignment == "right"
            ? "right"
            : "left",
    });
  }

  return new TableCell({
    children: Array.isArray(content) ? content : [content],
    columnSpan: colspan,
    rowSpan: rowspan,
    verticalAlign,
    borders: hasBorder
      ? {
          top: { style: BorderStyle.SINGLE, size: 1 },
          bottom: { style: BorderStyle.SINGLE, size: 1 },
          left: { style: BorderStyle.SINGLE, size: 1 },
          right: { style: BorderStyle.SINGLE, size: 1 },
        }
      : undefined,
    width: width ? { size: width, type: WidthType.PERCENTAGE } : undefined,

    margins: hasMargin
      ? {
          top: 100, // 20 = 1px
          bottom: 100,
          left: 100,
          right: 100,
        }
      : undefined,
  });
};
type EmissionData = {
  text: string;
  rowspan?: number;
  rowdynamic?: boolean;
};

const checkCondition = (ruleField: string | undefined, data: any): boolean => {
  if (!ruleField) return false;

  const match = ruleField.match(/(.*?)\.contain\((.*?)\)/);
  if (!match) return false;

  const fieldPath = match[1].trim();
  const conditionValue = match[2].trim();

  // Extract field value from data
  const fieldParts = fieldPath.split(".");
  let fieldValue: any = data;

  for (const part of fieldParts) {
    if (fieldValue && part in fieldValue) {
      fieldValue = fieldValue[part];
    } else {
      return false;
    }
  }

  // Check if fieldValue is an array of objects containing 'value' key
  if (Array.isArray(fieldValue)) {
    return fieldValue.some((item) => item.value === conditionValue);
  }

  return false;
};
const createTable = (
  { columns, rows, config, field, rowsDynamic, subColumns }: TableContent,
  answerData: AnswerData,
): Table => {
  const spanMap = new Map<string, number>(); // Tracks rowspan state
  let updatedColumns = [...columns];

  let updatedRows = rows.map((row) => [...row]);

  if (config?.rules) {
    const indexesToRemove = new Set();
    config.rules.forEach((e) => {
      const index = e?.index;
      if (index === undefined || index < 0 || index >= updatedRows.length)
        return;

      const ruleField = e?.rule?.match(/{{COND:(.*?)}}/)?.[1];
      const result = checkCondition(ruleField, answerData);

      if (!result) {
        indexesToRemove.add(index);
      }
    });

    updatedRows = updatedRows.filter((_, i) => !indexesToRemove.has(i));
  }

  const columnWidths: { [key: number]: number } = {};
  const columnAlignments: { [key: number]: string } = {};
  const columnBold: { [key: number]: boolean } = {};

  if (rowsDynamic?.field) {
    const tableData = answerData[rowsDynamic.field]?.value;
    const keyMap = rowsDynamic.keyMap || {};
    const processedKeyMap = processKeyMapValues(keyMap, answerData);
    if (Array.isArray(tableData)) {
      updatedRows.push(
        ...generateDynamicRows(
          tableData,
          processedKeyMap,
          updatedColumns,
          answerData,
        ),
      );
    }
  }

  if (!field || field.trim() === "" || field === "undefined") {
    updatedColumns = updatedColumns.map((col) =>
      processFinancialYear(col, answerData),
    );
  }

  // ✅ Handle Autonumbering (Prevent Duplicate "Sr. No.")
  if (
    config?.autonumbering?.enable &&
    !updatedColumns.includes(config.autonumbering.name)
  ) {
    updatedColumns.unshift(config.autonumbering.name);
  }

  // ✅ Handle Column Widths (Apply Width from Style Config)
  if (config?.style?.width) {
    config.style.width.forEach(({ name, size }) => {
      const colIndex = updatedColumns.indexOf(name);
      if (colIndex !== -1) {
        columnWidths[colIndex] = size; // ✅ Store column width mapped to column index
      }
    });
  }
  if (config?.style?.alignment) {
    config.style.alignment.forEach(({ name, value }) => {
      const colIndex = updatedColumns.indexOf(name);
      if (colIndex !== -1) {
        columnAlignments[colIndex] = value; // ✅ Store column width mapped to column index
      }
    });
  }
  if (config?.style?.bold) {
    config.style.bold.forEach(({ name, value }) => {
      const colIndex = updatedColumns.indexOf(name);
      if (colIndex !== -1) {
        columnBold[colIndex] = value == false ? false : true;
      }
    });
  }

  if (config?.columnvalue?.length) {
    config.columnvalue.forEach((colConfig) => {
      if (!colConfig) return; // ✅ Skip null values

      const { name, field, isFinancialYear } = colConfig; // ✅ Safe destructuring

      const colIndex = updatedColumns.indexOf(name);
      if (colIndex !== -1) {
        let fieldValue = getNestedValue(answerData, field); // Default value retrieval

        if (isFinancialYear === true && fieldValue) {
          fieldValue = processFinancialYear(`{{${field}}}`, answerData); // ✅ Use `processFinancialYear`
        }

        updatedColumns[colIndex] = `${name} ${fieldValue}`;
      }
    });
  }

  // ✅ Handle Table Headers (Including Sub-columns)
  let firstHeaderRow: any = [];
  let secondHeaderRow: any = [];
  let subColumnIndex = 0;
  updatedColumns.forEach((col, colIndex) => {
    const [text, colspanStr, rowspanStr] = col.split("^");
    const colspan = colspanStr ? parseInt(colspanStr, 10) : undefined;
    const rowspan = rowspanStr ? parseInt(rowspanStr, 10) : undefined;

    firstHeaderRow.push(
      createTableCell({
        text,
        colspan,
        rowspan,
        width: columnWidths[colIndex],
        bold: columnBold[colIndex] !== undefined ? columnBold[colIndex] : true,
        alignment: columnAlignments[colIndex],
      }),
    );

    // If sub-columns exist for this column, add them in the second header row
    if (subColumns && subColumns.length > 0) {
      // Ensure that subColumns are only added once per main column

      columns.forEach((col) => {
        const colSpan = col.split("^")[1] ? parseInt(col.split("^")[1], 10) : 1;

        if (colSpan > 1) {
          for (let i = 0; i < colSpan; i++) {
            if (subColumnIndex < subColumns.length) {
              secondHeaderRow.push(
                createTableCell({
                  text: subColumns[subColumnIndex],
                  bold: true,
                }),
              );
              subColumnIndex++;
            }
          }
        }
      });
    }
  });

  // ✅ Filter out rows where cells marked with removeIfEmpty are empty
  updatedRows = updatedRows.filter((row) => {
    return row.some((cell) => {
      if (!cell) return false;

      // If removeIfEmpty flag is NOT set, keep the row
      if (!cell.removeIfEmpty) return true;

      // Process the cell text to replace placeholders
      const processedText = processText({
        text: cell.text,
        answerData: answerData,
        isPreserveCase: cell.isPreserveCase,
      });

      // Check if the processed text is not empty
      const trimmedText = processedText?.trim() || "";

      // Keep row if cell has data
      return (
        trimmedText !== "" &&
        !/^\$\w+$/.test(trimmedText) && // Not a single unreplaced placeholder
        !/^{{.*}}$/.test(trimmedText) // Not unreplaced template syntax
      );
    });
  });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    layout: TableLayoutType.FIXED,
    rows: [
      new TableRow({ children: firstHeaderRow }), // ✅ First header row
      // Check if secondHeaderRow data exists
      ...(secondHeaderRow && secondHeaderRow.length
        ? [new TableRow({ children: secondHeaderRow })] // ✅ Subcolumns row
        : []), // If secondHeaderRow is empty, do not add the row
      ...updatedRows.map(
        (row, rowIndex) =>
          new TableRow({
            children: row
              .map((cell, colIndex) => {
                if (!cell) return null;

                // ✅ Handle Rowspan
                if (cell.rowspan) {
                  spanMap.set(
                    `${rowIndex}-${colIndex}`,
                    parseInt(cell.rowspan),
                  );
                } else if (spanMap.has(`${rowIndex}-${colIndex}`)) {
                  const remainingSpan = spanMap.get(`${rowIndex}-${colIndex}`)!;
                  if (remainingSpan > 1) {
                    spanMap.set(`${rowIndex}-${colIndex}`, remainingSpan - 1);
                    return null;
                  } else {
                    spanMap.delete(`${rowIndex}-${colIndex}`);
                  }
                }

                if (cell?.text?.includes("|Nested")) {
                  return new TableCell({
                    children: [
                      new Paragraph({
                        children: cell.text
                          .replace("|Nested", "")
                          .split(",")
                          .map((val: string) => {
                            return new TextRun({
                              text: FirstLetterCapital(val.trim()),
                              break: 1,
                              font: defaultConfig.fontName,
                              size: defaultConfig.fontSize,
                            });
                          }),
                        alignment: "left",
                      }),
                    ],
                    columnSpan: cell.colspan,
                    rowSpan: parseInt(cell.rowspan ? cell.rowspan : "0"),
                    margins: {
                      top: 100,
                      bottom: 100,
                      left: 100,
                      right: 100,
                    },
                  });
                } else {
                  return createTableCell({
                    text: cell.text,
                    colspan: cell.colspan,
                    rowspan: parseInt(cell.rowspan ? cell.rowspan : "0"),
                    bold: cell.bold,
                    italics: cell.italic,
                    underline: cell.underline,
                    width: columnWidths[colIndex],
                    isHyperlink: isValidURL(cell.text),
                    url: cell.text,
                    isHtml: cell.isHtml,
                    alignment: cell.alignment,
                  });
                }
              })
              .filter((cell): cell is TableCell => cell !== null),
          }),
      ),
    ],
  });
};

const createHyperlinkParagraph = (item: {
  text?: string;
  href?: string;
}): Paragraph => {
  return new Paragraph({
    children: [
      new ExternalHyperlink({
        children: [
          new TextRun({
            text: item.text || "",
            style: "Hyperlink",
            font: defaultConfig.fontName,
            size: defaultConfig.fontSize,
          }),
        ],
        link: item.href || "#",
      }),
    ],
  });
};

const parseHtmlToDocx = (
  item: TextContent,
  isTableHeader: boolean = false,
): Paragraph | Paragraph[] => {
  const parser = new DOMParser();
  let doc = parser.parseFromString(item?.text || "", "text/html");

  const elements: Paragraph[] = [];

  const processChildNodes = (
    node: Node,
    parentStyles: any = {},
  ): (TextRun | ExternalHyperlink | Paragraph)[] => {
    const textRuns: (TextRun | ExternalHyperlink | Paragraph)[] = [];

    node.childNodes.forEach((child) => {
      if (child.nodeType === Node.TEXT_NODE) {
        let textContent = child.textContent || "";

        if (textContent.includes("\n")) {
          const lines = textContent.split("\n").map((line) => line.trim());
          lines.forEach((line, index) => {
            if (line) {
              textRuns.push(
                new TextRun({
                  text: line,
                  ...parentStyles,
                  size: item.size ? item.size * 2 : defaultConfig.fontSize, // Default 11pt * 2
                  font: defaultConfig.fontName,
                }),
              );
            }
            if (index < lines.length - 1) {
              textRuns.push(new TextRun({ break: 1 }));
            }
          });
        } else if (textContent.trim()) {
          textRuns.push(
            new TextRun({
              text: textContent,
              ...parentStyles,
              size: item.size ? item.size * 2 : defaultConfig.fontSize, // Default 11pt * 2
              font: defaultConfig.fontName,
            }),
          );
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        const element = child as HTMLElement;
        const styles = { ...parentStyles };

        switch (element.tagName.toLowerCase()) {
          case "b":
          case "strong":
            styles.bold = true;
            break;
          case "i":
          case "em":
            styles.italics = true;
            break;
          case "u":
            styles.underline = { type: UnderlineType.SINGLE };
            break;
          case "br":
            textRuns.push(new TextRun({ break: 1 })); // Add line break
            break;
          case "h1":
          case "h2":
          case "h3":
          case "h4":
          case "h5":
          case "h6":
            //textRuns.push(new TextRun({ break: 1 }));

            styles.font = defaultConfig.fontName;
            styles.bold = true;
            styles.size = getHeadingSize(element.tagName.toLowerCase());

            textRuns.push(
              new TextRun({ text: element.textContent || "", ...styles }),
            );

            textRuns.push(new TextRun({ break: 1, ...styles }));
            return;
        }

        if (element.tagName.toLowerCase() === "a") {
          const href = element.getAttribute("href") || "#";

          textRuns.push(
            new ExternalHyperlink({
              children: [
                new TextRun({
                  text: element.textContent || "",
                  ...styles,
                  style: "Hyperlink",
                  size: item.size ? item.size * 2 : defaultConfig.fontSize, // Default 11pt * 2
                  font: defaultConfig.fontName,
                }),
              ],
              link: href,
            }),
          );
        } else {
          textRuns.push(...processChildNodes(element, styles));
        }
      }
    });

    return textRuns;
  };

  const getHeadingSize = (tag: string) => {
    switch (tag) {
      case "h1":
        return 54;
      case "h2":
        return 46;
      case "h3":
        return 38;
      case "h4":
        return 30;
      case "h5":
        return 26;
      case "h6":
        return 22;
      default:
        return defaultConfig.fontSize;
    }
  };

  // const processParagraphs = (htmlString: string) => {
  //   return htmlString.split(/<br\s*\/?>/i).map((part) => part.trim());
  // };
  const processParagraphs = (htmlString: string) => {
    return [htmlString]; // Keep the full HTML and process <br> inside `processChildNodes`
  };

  processParagraphs(doc.body.innerHTML).forEach((part) => {
    if (part) {
      const tempDoc = parser.parseFromString(part, "text/html");

      tempDoc.body.childNodes.forEach((node: ChildNode) => {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const element = node as HTMLElement;

          switch (element.tagName.toLowerCase()) {
            case "p":
            case "h1":
              elements.push(
                new Paragraph({
                  children: processChildNodes(element),
                  heading:
                    element.tagName.toLowerCase() === "h1"
                      ? HeadingLevel.HEADING_1
                      : undefined,
                }),
              );
              break;
            case "h2":
              elements.push(
                new Paragraph({
                  children: processChildNodes(element),
                  heading: HeadingLevel.HEADING_2,
                }),
              );
              break;
            case "a": {
              const href = element.getAttribute("href") || "#";
              elements.push(
                new Paragraph({
                  children: [
                    new ExternalHyperlink({
                      children: processChildNodes(element),
                      link: href,
                    }),
                  ],
                }),
              );
              break;
            }
            case "ul": // Unordered List
              Array.from(element.children).forEach((li) => {
                elements.push(
                  new Paragraph({
                    children: processChildNodes(li),
                    bullet: {
                      level: 0,
                    },
                    indent: { left: 360, hanging: 260 },
                    spacing: { before: 60, after: 60 },
                  }),
                );
              });
              break;

            case "ol": // Ordered List
              abstractNumberingId++;

              Array.from(element.children).forEach((li) => {
                elements.push(
                  new Paragraph({
                    children: processChildNodes(li),
                    numbering: {
                      reference: abstractNumberingId.toString(), // Use predefined reference
                      level: 0,
                    },
                    indent: { left: 360, hanging: 260 },
                    spacing: { before: 60, after: 60 },
                  }),
                );
              });

              numberingInstances.push({
                reference: abstractNumberingId.toString(),
                levels: [
                  {
                    level: 0,
                    format: NumberFormat.DECIMAL, // Numbering format
                    text: "%1.",
                    alignment: AlignmentType.START,
                  },
                ],
              });
              break;

            default:
              elements.push(
                new Paragraph({
                  children: processChildNodes(element),
                  spacing: { after: 50 },
                }),
              );
              break;
          }
        } else if (node.nodeType === Node.TEXT_NODE) {
          const textContent = node.textContent?.trim();
          if (textContent) {
            elements.push(
              new Paragraph({
                children: [
                  new TextRun({
                    text: textContent,
                    size: item.size ? item.size * 2 : defaultConfig.fontSize, // Default 11pt * 2
                    font: defaultConfig.fontName,
                  }),
                ],
              }),
            );
          }
        }
      });
    }
  });

  return elements.length === 1 ? elements[0] : elements;
};

export const useDownloadAssessmentDocs = () => {
  const refetchformfielddata =
    useGetFormfieldAndAnswersByinvitationIdLazyQuery()[0];
  const [loading, setLoading] = useState(false);

  const generateDownloadAssessmentDoc = async (
    invitationId: string,
    jsonData: string,
  ) => {
    setLoading(true);
    const formFielddata: any = await refetchformfielddata({
      variables: { invitationId },
    });

    let AnswerObject: any = convertDBAnswersToStoreAnswers(
      formFielddata?.data?.FormSubmission[0]?.FormInvitation?.Form?.FormFields,
      formFielddata?.data?.FormSubmission[0]?.Answers ?? [],
    );

    const finaljsonData = JSON.parse(jsonData);
    const updatedData = replacePlaceholders(finaljsonData, AnswerObject);
    const processedContent = updatedData.content.map((item) => {
      if (item.type === "table") {
        return {
          ...item,
          rows: item.rows.map((row) =>
            row.map((cell) =>
              cell
                ? {
                    ...cell,
                    text: cell.isHtml
                      ? cell.text
                      : evaluateExpression(
                          cell.text,
                          cell.decimalPrecesion || 0,
                        ),
                  }
                : null,
            ),
          ),
        };
      } else {
        return {
          ...item,
          text: item.text
            ? evaluateExpression(item.text, item.decimalPrecesion || 0)
            : item.text,
        };
      }
    });

    console.log("processedContent=", AnswerObject, processedContent);
    const generateDocx = async () => {
      const docContent = processedContent.map((item) => {
        switch (item.type) {
          case "heading":
            return createParagraph(item);
          case "paragraph":
            return createParagraph(item);
          case "hyperlink":
            return createHyperlinkParagraph(item);
          case "table":
            return createTable(item, AnswerObject);
          case "html":
            return parseHtmlToDocx(item);
          default:
            return createParagraph(item);
        }
      });

      const doc = new Document({
        numbering: {
          config: [...numberingInstances],
        },
        sections: [
          {
            properties: {
              page: {
                margin: {
                  top: 1400, // 0.5 inch (default is 1440 for 1 inch)
                  bottom: 720, // 0.5 inch
                  left: 500, // Reduce left margin
                  right: 500, // Reduce right margin
                },
              },
            },
            headers: {
              default: new Header({
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({
                        text: updatedData.pdfHeader,
                        bold: true,
                        font: defaultConfig.fontName,
                        size: defaultConfig.fontSize,
                      }),
                    ],
                    alignment: AlignmentType.LEFT,
                  }),
                ],
              }),
            },
            children: docContent.flat(),
          },
        ],
      });
      const currentDate = new Date().toISOString().split("T")[0]; // Format: YYYY-MM-DD
      const fileName = `${updatedData.title}.docx`;

      Packer.toBlob(doc).then((blob: any) => {
        saveAs(blob, fileName);
      });
      setLoading(false);
    };

    await generateDocx();
  };

  return { generateDownloadAssessmentDoc, loading };
};
