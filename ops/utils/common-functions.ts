/**
 * Downloads a file from the given URL and saves it with the specified file name in the user's system.
 * Handles cross-origin requests and cleans up resources after download.
 *
 * @param fileURL  - The direct URL to the file to be downloaded.
 * @param fileName - The desired name for the downloaded file.
 */
export const handleDownload = async (fileURL: string, fileName: string) => {
  try {
    // Fetch the file as a blob from the provided URL
    let response;
    const maxRetries = 3;
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        response = await fetch(fileURL, { method: "GET" });
        if (!response.ok) {
          throw new Error(`Fetch failed with status ${response.status}`);
        }
        break;
      } catch (error) {
        if (attempt === maxRetries) {
          console.error("Failed to fetch file after retries:", error);
        }
        console.warn(`Retrying fetch (${attempt + 1}/${maxRetries})...`);
        await new Promise((resolve) => setTimeout(resolve, 500)); // delay before next retry
      }
    }

    if (response && response.ok) {
      // Convert the response to a blob
      const blob = await response.blob();
      // Create a temporary object URL for the blob
      const url = window.URL.createObjectURL(blob);
      // Create a temporary anchor element to trigger the download
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click(); // Programmatically click the anchor to start download
      a.remove(); // Remove the anchor from the DOM
      window.URL.revokeObjectURL(url); // Clean up the object URL
    } else {
      throw new Error(`Fetch failed with status ${response?.status}`);
    }
  } catch (err) {
    console.error("Download error:", err);
  }
};

/**
 * Formats a date as DD MMM YYYY (e.g., 01 Jan 2024) using en-GB locale.
 * @param date - The date to format (Date, string, or null)
 * @returns The formatted date string or an empty string if invalid
 */
export function formatDateDisplay(date: Date | string | null) {
  if (!date) return "";
  const d = typeof date === "string" ? new Date(date) : date;
  if (isNaN(d.getTime())) return "";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

// The parseDateInput function is used as the dateParser prop for Mantine's DateInput component.
// It takes the user's input string (e.g., "01-06-2024" or "01 Jun 2024") and converts it into a JavaScript Date object.
// This allows the DateInput to accept and correctly interpret different date formats typed or pasted by the user.
// Why is it needed?
// By default, DateInput may only accept certain date formats.
// By providing a custom dateParser, you allow users to enter dates in multiple formats (like "DD-MM-YYYY" or "DD MMM YYYY"), and your app will still understand and convert them to a valid Date object for the input.
// In summary:
// parseDateInput makes your date picker more flexible and user-friendly by supporting multiple input formats for dates.

export function parseDateInput(input: string): Date {
  // Accepts DD-MM-YYYY or DD MMM YYYY
  const dashParts = input.split("-");
  if (dashParts.length === 3) {
    const day = parseInt(dashParts[0], 10);
    const month = parseInt(dashParts[1], 10) - 1;
    const year = parseInt(dashParts[2], 10);
    return new Date(year, month, day);
  }
  const spaceParts = input.split(" ");
  if (spaceParts.length === 3) {
    const day = parseInt(spaceParts[0], 10);
    const monthStr = spaceParts[1];
    const year = parseInt(spaceParts[2], 10);
    const month = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ].indexOf(monthStr);
    if (month !== -1) {
      return new Date(year, month, day);
    }
  }
  return new Date(NaN);
}

// This is MRT table configuration for AI Verify Extracted Table
import { MRT_Row, MRT_TableOptions } from "mantine-react-table";

export const getMantineTableOptions = <
  T extends Record<string, any>,
>(): Partial<MRT_TableOptions<T>> => ({
  enableStickyHeader: true,
  enableEditing: false,
  enableRowActions: false,
  enableColumnActions: false,
  enableColumnFilters: false,
  enablePagination: false,
  enableSorting: false,
  enableBottomToolbar: false,
  enableTopToolbar: false,
  enableRowSelection: false,
  mantineTableContainerProps: {
    style: {
      position: "relative",
      boxShadow: "none",
      marginBottom: 0,
      borderRadius: 5,
    },
  },
  mantineTableHeadCellProps: {
    style: {
      backgroundColor: "#003b52",
      whiteSpace: "nowrap",
    },
  },
  initialState: {
    showColumnFilters: true,
    showGlobalFilter: true,
    columnVisibility: { "mrt-row-actions": false },
  },
  mantineTableBodyProps: {
    className: "scrollForAI",
  },
  mantineTableBodyCellProps: ({ row }: { row: MRT_Row<T> }) => ({
    style: {
      fontWeight: row.original.isHeader ? "700" : "400",
      color: row.original.isHeader ? "#000000" : "inherit",
    },
  }),
});

// This is for the thememing of MRT table for AI Verify Extracted Table
export const getAiExtractedDataTableTheme = (smallDevice: boolean) => ({
  components: {
    Text: {
      styles: {
        root: {
          fontSize: "14px",
          fontStyle: "normal",
          fontWeight: 400,
          lineHeight: "normal",
          color: "rgba(34, 51, 84, 0.50)",
        },
      },
    },
    Table: {
      styles: {
        table: {
          boxShadow: "none",
          height: "100%",
          width: "100%",
        },
        tbody: {
          borderBottomLeftRadius: "10px",
          borderBottomRightRadius: "10px",
          maxHeight: smallDevice ? 480 : 520,
          overflow: "auto",
          display: "block",
          paddingTop: 5,
        },
        thead: {
          width: "100%",
          tableLayout: "fixed",
        },
        tr: {
          display: "table",
          width: "100%",
          tableLayout: "fixed",
        },
        th: {
          height: 31,
          fontWeight: "bold",
          background: "#003b52",
          color: "#fff",
          fontSize: 12,
          padding: "0 10px",
        },
        td: {
          height: smallDevice ? 40 : 46,
          color: "#666",
          fontWeight: 400,
        },
      },
    },
    TextInput: {
      styles: {
        input: {
          borderRadius: "4px",
          "--input-bd-focus": "transparent",
        },
      },
    },
  },
});
