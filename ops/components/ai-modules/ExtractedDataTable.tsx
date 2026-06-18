"use client";
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  createTheme,
  Flex,
  MantineProvider,
  NumberInput,
  Paper,
  Select,
  Text,
  TextInput,
  Tooltip,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useMediaQuery } from "@mantine/hooks";
import { IconChevronDown, IconChevronLeft } from "@tabler/icons-react";
import {
  MantineReactTable,
  useMantineReactTable,
  type MRT_ColumnDef,
} from "mantine-react-table";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "~/app/globals.css";
import { useAiFileData } from "~/hooks/useAiFileData";
import { GridPowerDetailsConstant } from "~/shared/constants/activity.constant";
import {
  AIFileUploadStatus,
  extractedValueLabels,
} from "~/shared/constants/ai-constant";
import {
  DataPoint,
  EditedValues,
  ExtractedValues,
  MeterDetail,
} from "~/shared/types/ai-types";
import {
  formatDateDisplay,
  getAiExtractedDataTableTheme,
  getMantineTableOptions,
  parseDateInput,
} from "~/utils/common-functions";
import {
  getOrganizationIdFromToken,
  getUserIdFromToken,
  getUserRoleFromToken,
  ROLE_ORGANIZATION_ADMIN,
} from "~/utils/jwt/getUserDataFromToken";
import { useCheckDuplicateMeterReadingLazyQuery } from "../../graphql/queries/check-duplicate-meter-reading.generated";
import { useGetMeterOrganizationAddressMappingQuery } from "../../graphql/queries/get-meterorganizationaddressmapping.generated";
import { useGetOrganizationAddressByUserIdOrgIdQuery } from "../../graphql/queries/get-organization-address.generated";
import CalenderIcon from "../icons/CalenderIcon";
import TrashIcon from "../icons/TrashIcon";

import { config } from "@fortawesome/fontawesome-svg-core";
import { useGetFileForVerificationOrEditQuery } from "../../graphql/queries/get-files-for-verify-or-edit.generated";
import classes from "./CSS.module.css";
config.autoAddCss = false;
interface ExtractedDataTableProps {
  fileId?: string;
  onUnsavedChangesChange?: (hasUnsavedChanges: boolean) => void;
}

const mandatoryFields = [
  "PresentReadingDate",
  "PreviousReadingDate",
  "Location",
  "MeterNumber",
  "UnitsConsumed",
];

function getParameterLabel(param: string) {
  return param in extractedValueLabels
    ? extractedValueLabels[param as keyof typeof extractedValueLabels]
    : param;
}

const ExtractedDataTable = ({
  fileId,
  onUnsavedChangesChange,
}: ExtractedDataTableProps) => {
  const params = useParams();
  const searchParams = useSearchParams();
  const fileIdParam = searchParams.get("fileId");

  // Use fileId from props if present, otherwise fallback to fileIdParam from URL
  const effectiveFileId = fileId || fileIdParam;

  // Add query for fetching individual file data
  const getFileForVerificationOrEdit = useGetFileForVerificationOrEditQuery({
    skip: !effectiveFileId,
    variables: {
      where: {
        id: { _eq: effectiveFileId },
        is_deleted: { _eq: false },
      },
    },
  });

  // Use fetched data if fileId is provided, otherwise use prop
  const currentFileData = useMemo(() => {
    if (
      effectiveFileId &&
      getFileForVerificationOrEdit.data?.AIFileUploads?.[0]
    ) {
      const file = getFileForVerificationOrEdit.data.AIFileUploads[0];
      return file.AIFileData?.[0]
        ? {
            ...file.AIFileData[0],
            status: file.status,
            fileUploadId: file.id,
            file_name: file.file_name,
            file_url: file.file_url,
          }
        : undefined;
    }
  }, [effectiveFileId, getFileForVerificationOrEdit.data]);

  const [baseLineDate, setBaseLineDate] = useState<Date>(
    new Date("2021-04-01")
  );
  const fileStatus =
    currentFileData?.status === AIFileUploadStatus.VerificationPending
      ? "Not Verified"
      : currentFileData?.status === AIFileUploadStatus.Verified
        ? "Verified"
        : "";
  const [tableData, setTableData] = useState<DataPoint[]>([]);
  const [validationErrors, setValidationErrors] = useState<
    Record<string, boolean>
  >({});
  const [meterMapping, setMeterMapping] = useState<Record<string, string>>({});
  const [locationOptions, setLocationOptions] = useState<
    Array<{ value: string; label: string }>
  >([]);
  const [organizationAddressMapping, setOrganizationAddressMapping] = useState<
    Record<string, { name: string; orgAddressId: string }>
  >({});
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  // Add refs for date inputs
  const prevDateInputRef = useRef<HTMLInputElement>(null);
  const presentDateInputRef = useRef<HTMLInputElement>(null);
  const smallDevice = useMediaQuery("(max-width: 1366px)");
  const aiExtractedDataTableTheme = getAiExtractedDataTableTheme(!!smallDevice);

  // Custom theme with button overrides to ensure styles are applied
  const customButtonTheme = createTheme({
    components: {
      Button: {
        classNames: {
          root: "custom-button-root",
        },
        styles: {
          root: {
            "&.filledGradientButton": {
              background:
                "linear-gradient(135deg, #005c81 0%, #122f47 100%) !important",
              color: "white !important",
              border: "none !important",
              padding: "8px 16px !important",
              borderRadius: "20px !important",
              cursor: "pointer !important",
              transition: "all 0.3s ease !important",
              "&:hover": {
                background:
                  "linear-gradient(135deg, #005c81 0%, #0f3751 50%, #122f47 100%) !important",
              },
              "&:disabled": {
                opacity: "0.5 !important",
                cursor: "not-allowed !important",
                transform: "none !important",
              },
            },
            "&.underline_btn": {
              border: "none !important",
              color: "#003b52 !important",
              fontWeight: "700 !important",
              fontSize: "12px !important",
              textTransform: "uppercase !important",
              textDecoration: "underline !important",
              backgroundColor: "transparent !important",
              background: "transparent !important",
              "&:hover": {
                color: "#003b52 !important",
                backgroundColor: "transparent !important",
                background: "transparent !important",
              },
            },
            "&.noAnimationButton": {
              transform: "none !important",
              transition: "none !important",
              animation: "none !important",
            },
          },
        },
      },
    },
  });

  // Refs for debounced meter validation and active editing tracking
  const meterValidationTimeoutRef = useRef<ReturnType<
    typeof setTimeout
  > | null>(null);
  const activelyEditedMeterIdsRef = useRef<Set<string>>(new Set());

  // 1. Add state and refs for error focus
  const [firstErrorFieldId, setFirstErrorFieldId] = useState<string | null>(
    null
  );
  const inputRefs = useRef<Record<string, HTMLInputElement | null>>({});
  const [scrollFocusTrigger, setScrollFocusTrigger] = useState(0);
  const [openedSelects, setOpenedSelects] = useState<Record<string, boolean>>(
    {}
  );

  const [userAddedMeterIndices, setUserAddedMeterIndices] = useState<number[]>(
    []
  );
  // State to track the header row of a newly added meter for scroll
  const [newMeterHeaderId, setNewMeterHeaderId] = useState<string | null>(null);
  const [validationType, setValidationType] = useState<"mandatory" | null>(
    null
  );

  // Add duplicate validation state
  const [duplicateErrors, setDuplicateErrors] = useState<
    Record<string, boolean>
  >({});
  const [duplicateErrorMessage, setDuplicateErrorMessage] = useState<
    string | null
  >(null);
  // Add a force update counter to trigger re-renders when needed
  const [forceUpdateCounter, setForceUpdateCounter] = useState<number>(0);
  const hasDuplicateMeters = Object.keys(duplicateErrors).length > 0;

  // Helper function to check if a meter has a duplicate number
  const hasDuplicateMeterNumber = useCallback(
    (meterIndex?: number): boolean => {
      if (meterIndex === undefined) return false;

      // First check if we have any duplicates at all
      if (!hasDuplicateMeters) return false;

      // Find all meter rows
      const meterRows = tableData.filter(
        (row) => row.parameter === "MeterNumber" && !row.isHeader
      );

      // Create a map of meter numbers and their indices
      const meterNumbersMap: Record<string, number[]> = {};
      meterRows.forEach((row) => {
        const meterNumber = (
          ((row.editedValue || row.extractedValue) as string) || ""
        )
          .trim()
          .toUpperCase();

        if (meterNumber) {
          if (!meterNumbersMap[meterNumber]) {
            meterNumbersMap[meterNumber] = [];
          }
          meterNumbersMap[meterNumber].push(row.meterIndex!);
        }
      });

      // Find this meter's number
      const thisMeterRow = meterRows.find(
        (row) => row.meterIndex === meterIndex
      );
      if (!thisMeterRow) return false;

      const thisMeterNumber = (
        ((thisMeterRow.editedValue || thisMeterRow.extractedValue) as string) ||
        ""
      )
        .trim()
        .toUpperCase();

      // If this meter number exists and has more than one entry, it's a duplicate
      const isDuplicate = !!(
        thisMeterNumber &&
        meterNumbersMap[thisMeterNumber] &&
        meterNumbersMap[thisMeterNumber].length > 1
      );

      // Debug info to help diagnose issues
      if (isDuplicate) {
        console.log(
          `Meter ${meterIndex} has duplicate number: ${thisMeterNumber}`
        );
      }

      return isDuplicate;
    },
    [tableData, hasDuplicateMeters]
  );

  // Duplicate validation function
  const validateDuplicateMeters = useCallback((data: DataPoint[]) => {
    const meterRows = data.filter(
      (r) => r.parameter === "MeterNumber" && !r.isHeader
    );

    const seen: Record<string, number[]> = {};
    meterRows.forEach((row) => {
      const meterNumber = (row.editedValue || row.extractedValue || "")
        ?.toString()
        .trim()
        .toUpperCase();

      if (!meterNumber) return;
      if (!seen[meterNumber]) seen[meterNumber] = [];
      seen[meterNumber].push(row.meterIndex!);
    });

    const errors: Record<string, boolean> = {};
    const duplicateGroups: number[][] = [];

    Object.entries(seen).forEach(([_, indices]) => {
      if (indices.length > 1) {
        indices.forEach((idx) => {
          const row = meterRows.find((r) => r.meterIndex === idx);
          if (row) errors[row.id] = true;
        });
        duplicateGroups.push(indices);
      }
    });

    setDuplicateErrors(errors);

    let finalMessage: string | null = null;

    if (duplicateGroups.length === 1) {
      const indices = duplicateGroups[0].map((i) => i + 1);
      // Use curly braces + "and"
      const formatted =
        indices.length > 2
          ? `{${indices.slice(0, -1).join("}, {")}} and {${indices.slice(-1)}}`
          : indices.map((i) => `{${i}}`).join(" and ");

      finalMessage = `Meter Details No. ${formatted} - must have unique meter numbers.`;
    } else if (duplicateGroups.length > 1) {
      // Use square brackets + "|"
      const groupsText = duplicateGroups
        .map((grp) => `[${grp.map((i) => i + 1).join(", ")}]`)
        .map((txt) => `Meter Details No. ${txt}`)
        .join(" | ");
      finalMessage = `${groupsText} - must have unique meter numbers.`;
    }

    setDuplicateErrorMessage(finalMessage);
  }, []);

  // Validate duplicates whenever tableData changes
  useEffect(() => {
    if (tableData.length) {
      // Use a small timeout to ensure this runs after the initial render
      setTimeout(() => {
        validateDuplicateMeters(tableData);

        // Force refresh the component when duplicate validation runs
        // This ensures all fields update their disabled state
        setForceUpdateCounter((prev) => prev + 1);
      }, 0);
    }
  }, [tableData, validateDuplicateMeters]);

  const lastSelectOpenTimeRef = useRef(0);

  // Add this constant at the top of the component (adjust as needed)
  const STICKY_HEADER_HEIGHT = 40;

  // Update the useEffect for firstErrorFieldId:
  useEffect(() => {
    if (!firstErrorFieldId) return;
    const inputEl = inputRefs.current[firstErrorFieldId];
    const scrollContainer = document.querySelector(".scrollForAI");
    if (!inputEl || !scrollContainer) return;

    // Scroll the input to the top of the container, just below the sticky header
    const inputRect = inputEl.getBoundingClientRect();
    const containerRect = scrollContainer.getBoundingClientRect();
    const scrollOffset =
      inputRect.top -
      containerRect.top +
      scrollContainer.scrollTop -
      STICKY_HEADER_HEIGHT +
      28;
    scrollContainer.scrollTop = scrollOffset;

    // Focus the input after scrolling
    setTimeout(() => {
      inputEl.focus({ preventScroll: true });
      // If the error field is a Select, open its dropdown after scroll/focus
      if (inputEl.className.includes("mantine-Select-input")) {
        setOpenedSelects((prev) => ({ ...prev, [firstErrorFieldId]: true }));
      }
    }, 150);
  }, [scrollFocusTrigger]);

  useEffect(() => {
    const scrollContainer = document.querySelector(".scrollForAI");
    if (!scrollContainer) return;
    // Handler to close all Mantine popovers/dropdowns on scroll
    const handleScroll = () => {
      // Blur any focused input (DateInput, Select, etc.)
      const active = document.activeElement;
      if (active && active instanceof HTMLElement) {
        active.blur();
      }
      // Clear controlled Select state
      setOpenedSelects({});
    };
    scrollContainer.addEventListener("scroll", handleScroll, true);
    return () => {
      scrollContainer.removeEventListener("scroll", handleScroll, true);
    };
  }, []);

  // Scroll logic for new meter header row
  useEffect(() => {
    if (!newMeterHeaderId) return;
    const headerRowEl = document.getElementById(newMeterHeaderId);
    const scrollContainer = document.querySelector(".scrollForAI");
    if (headerRowEl && scrollContainer) {
      const containerRect = scrollContainer.getBoundingClientRect();
      const elementRect = headerRowEl.getBoundingClientRect();
      const scrollTop =
        elementRect.top - containerRect.top + scrollContainer.scrollTop;
      scrollContainer.scrollTop = scrollTop;
    }
    setNewMeterHeaderId(null);
  }, [newMeterHeaderId]);

  const { insertVerifiedMeterMasterData, insertVerifiedDataGhgTables } =
    useAiFileData();

  // Function to check if there are actual meaningful changes
  const checkForActualChanges = useCallback(
    (currentTableData: DataPoint[]) => {
      if (!currentFileData) return false;

      // Check if any edited value is different from the original extracted/edited values
      return currentTableData.some((row) => {
        if (row.isHeader) return false;

        const currentEditedValue = row.editedValue;
        let originalEditedValue: string | Date = "";

        // Get the original edited value from currentFileData
        if (
          row.parameter === "InvoiceNumber" ||
          row.parameter === "PresentReadingDate" ||
          row.parameter === "PreviousReadingDate"
        ) {
          originalEditedValue =
            currentFileData.edited_values?.[row.parameter] ?? "";
          if (
            (row.parameter === "PresentReadingDate" ||
              row.parameter === "PreviousReadingDate") &&
            originalEditedValue
          ) {
            originalEditedValue = new Date(originalEditedValue);
          }
        } else if (row.meterIndex !== undefined) {
          // For meter details
          const param = row.parameter as keyof MeterDetail;
          originalEditedValue =
            currentFileData.edited_values?.MeterDetails?.[row.meterIndex]?.[
              param
            ] ?? "";
          if (
            (row.parameter === "PresentReadingDate" ||
              row.parameter === "PreviousReadingDate") &&
            originalEditedValue
          ) {
            originalEditedValue = new Date(originalEditedValue);
          }
        }

        // Compare current edited value with original edited value
        // Handle different data types properly
        if (
          currentEditedValue instanceof Date &&
          originalEditedValue instanceof Date
        ) {
          return currentEditedValue.getTime() !== originalEditedValue.getTime();
        } else if (
          currentEditedValue instanceof Date ||
          originalEditedValue instanceof Date
        ) {
          return true; // One is Date, one is not - definitely different
        } else {
          // Both are strings/numbers/null
          const currentStr = currentEditedValue?.toString() ?? "";
          const originalStr = originalEditedValue?.toString() ?? "";
          return currentStr !== originalStr;
        }
      });
    },
    [currentFileData]
  );
  const userRole = getUserRoleFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const organizationId = getOrganizationIdFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const userId = getUserIdFromToken(
    params?.accessToken as string | string[] | undefined
  );
  const isAdmin =
    Array.isArray(userRole) && userRole.includes(ROLE_ORGANIZATION_ADMIN);

  // Track if tableData has been initialized for the current file
  const [tableInitialized, setTableInitialized] = useState(false);

  // Reset tableInitialized, validation errors, and all form data when the file changes
  useEffect(() => {
    setTableInitialized(false);
    setValidationErrors({}); // Reset validation errors and hide error message
    setTableData([]); // Reset table data to ensure no values persist between bills
    setDuplicateErrors({}); // Reset duplicate errors
    setDuplicateErrorMessage(null);
    activelyEditedMeterIdsRef.current = new Set(); // Reset actively edited meter IDs
  }, [currentFileData?.id]);

  //Set Table Data based on currentFileData and mapping initialization
  const mappingsInitialized = useRef(false);
  const prevFileId = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Only run if currentFileData exists and mappings are ready
    if (
      !currentFileData ||
      Object.keys(meterMapping).length === 0 ||
      Object.keys(organizationAddressMapping).length === 0
    ) {
      return;
    }

    // Only initialize tableData if it hasn't been initialized for this file
    if (!tableInitialized) {
      const rows: DataPoint[] = [];
      const generalParams: (keyof ExtractedValues)[] = [
        "InvoiceNumber",
        "PreviousReadingDate",
        "PresentReadingDate",
      ];
      generalParams.forEach((param) => {
        if (
          currentFileData.extracted_values &&
          Object.prototype.hasOwnProperty.call(
            currentFileData.extracted_values,
            param
          )
        ) {
          // Only add if not MeterDetails (which is an array)
          if (param !== "MeterDetails") {
            let editedVal: string | Date =
              currentFileData.edited_values?.[param] ?? "";
            if (
              (param === "PresentReadingDate" ||
                param === "PreviousReadingDate") &&
              editedVal
            ) {
              editedVal = new Date(editedVal);
            }
            rows.push({
              id: `${param}-${currentFileData.id}`,
              parameter: param,
              extractedValue: currentFileData.extracted_values[param] as
                | string
                | number
                | Date
                | null,
              editedValue: editedVal,
            });
          }
        }
      });

      // ✅ Clone and extend MeterDetails safely
      let patchedMeterDetails: MeterDetail[] = currentFileData.extracted_values
        ?.MeterDetails
        ? [...currentFileData.extracted_values.MeterDetails]
        : [];

      const expectedMeterCount =
        currentFileData.edited_values?.MeterDetails?.length ??
        patchedMeterDetails.length;

      while (patchedMeterDetails.length < expectedMeterCount) {
        patchedMeterDetails.push({
          MeterNumber: "",
          Location: "",
          UnitsConsumed: 0, // ✅ Fix: null is valid for number | null
        });
      }

      patchedMeterDetails.forEach((meter: MeterDetail, index: number) => {
        rows.push({
          id: `meter-header-${index}-${currentFileData.id}`,
          parameter: `Meter Details No. ${index + 1}`,
          extractedValue: null,
          editedValue: null,
          isHeader: true,
          meterIndex: index,
        });
        ["MeterNumber", "Location", "UnitsConsumed"].forEach((param) => {
          let editedVal: string | number | Date =
            currentFileData.edited_values?.MeterDetails?.[index]?.[
              param as keyof MeterDetail
            ] ?? "";
          if (
            (param === "PresentReadingDate" ||
              param === "PreviousReadingDate") &&
            editedVal
          ) {
            editedVal = new Date(editedVal);
          } // For Location field, check if meter number is already mapped to a location
          let extractedValue = meter[param as keyof MeterDetail] ?? null;
          if (
            param === "Location" &&
            meter.MeterNumber &&
            Object.keys(meterMapping).length > 0
          ) {
            // Use uppercase for case-insensitive lookup
            const addressId =
              currentFileData.edited_values?.MeterDetails[index]?.LocationId;
            if (addressId) {
              if (!extractedValue) {
                editedVal = addressId;
              } else {
                extractedValue = addressId;
              }
            }
          } else {
            console.warn(
              `No location mapping found for meter ${meter.MeterNumber}`
            );
          }

          // After mapping, clear location if not present in locationOptions
          if (param === "Location") {
            const locationValue = editedVal || extractedValue || "";
            const found = locationOptions.some(
              (opt) =>
                opt.value === locationValue || opt.label === locationValue
            );
            if (!found) {
              editedVal = "";
              extractedValue = "";
            }
          }

          const isNew =
            currentFileData?.edited_values?.MeterDetails?.[index]?.manual ===
            true;

          // Determine if this meter (by index) has an explicit DB id in edited_values
          const meterDataIdFromEdited =
            currentFileData?.edited_values?.MeterDetails?.[index]?.id;

          // As a safer fallback, try to match by meter number among currentFileData.MeterData
          // but only if we have a non-empty meter number and the match is unambiguous.
          let matchedMeterDataId: string | undefined = undefined;
          const candidateMeterNumber = (
            currentFileData?.edited_values?.MeterDetails?.[index]
              ?.MeterNumber ||
            currentFileData?.extracted_values?.MeterDetails?.[index]
              ?.MeterNumber ||
            ""
          )
            .toString()
            .trim();

          if (!meterDataIdFromEdited && candidateMeterNumber) {
            const matches = (currentFileData?.MeterData || []).filter(
              (m) =>
                (m.meter_number || "").toString().trim().toUpperCase() ===
                candidateMeterNumber.toUpperCase()
            );
            if (matches.length === 1) matchedMeterDataId = matches[0].id;
          }

          const meterDataId = meterDataIdFromEdited || matchedMeterDataId;

          rows.push({
            id: `meter-${index}-${param}-${currentFileData.id}`,
            parameter: param,
            extractedValue: extractedValue
              ? (extractedValue as string | number | Date | null)
              : null,
            editedValue: editedVal ? editedVal : null,
            meterIndex: index,
            isNew: isNew,
            meterDataId: meterDataId,
          });
        });
      });
      setTableData(rows);

      // Run duplicate validation immediately on page load
      setTimeout(() => {
        validateDuplicateMeters(rows);
      }, 0);

      mappingsInitialized.current = true;
      prevFileId.current = currentFileData.id;
      setTableInitialized(true);
    }
  }, [
    currentFileData,
    meterMapping,
    organizationAddressMapping,
    locationOptions,
    tableInitialized,
    validateDuplicateMeters,
  ]);

  // Query for organization addresses to get location options
  const { data: orgAddressData } = useGetOrganizationAddressByUserIdOrgIdQuery({
    variables: {
      organizationId,
      userId,
    },
    skip: !organizationId || !userId,
  });

  // Query for meter mapping - get all mappings to allow for user-entered meter numbers
  const {
    refetch: fetchMeterAddressMapping,
    data: meterMappingData,
    loading: meterMappingLoading,
  } = useGetMeterOrganizationAddressMappingQuery({
    variables: {
      where: {}, // Get all mappings, we'll filter by organization later
    },
  });

  // Lazy query for duplicate meter reading check
  const [checkDuplicate, { loading: duplicateCheckLoading }] =
    useCheckDuplicateMeterReadingLazyQuery();

  // Store organization address mapping and location options
  useEffect(() => {
    if (orgAddressData?.UserOrganizationAddressMapping) {
      const addressMapping: Record<
        string,
        { name: string; orgAddressId: string }
      > = {};
      const locations: Array<{ value: string; label: string }> = [];
      let baseLineYear;
      let baseLineMonth;
      orgAddressData.UserOrganizationAddressMapping.forEach((mapping) => {
        if (mapping.OrganizationAddress?.Address) {
          const address = mapping.OrganizationAddress.Address;
          const orgAddressId = mapping.OrganizationAddress.id;

          addressMapping[orgAddressId] = {
            name: address.name,
            orgAddressId: orgAddressId,
          };

          locations.push({
            value: orgAddressId, // Use orgAddressId as value for backend logic
            label: address.name, // Use address name as label for display
          });
        }
        baseLineYear =
          mapping?.OrganizationAddress?.Organization?.Baselineyear ?? 2021;
        baseLineMonth =
          mapping?.OrganizationAddress?.Organization?.FinancialYearMonth ??
          "April";
      });
      const sortedLocations = [...locations].sort((a, b) =>
        a.label.localeCompare(b.label)
      );
      setOrganizationAddressMapping(addressMapping);
      setLocationOptions(sortedLocations);
      setBaseLineDate(new Date(`${baseLineYear}-${baseLineMonth}-01`));
    }
  }, [orgAddressData]);

  // Store meter mapping in state for easy lookup with case-insensitive keys
  useEffect(() => {
    if (
      meterMappingData?.MeterOrganizationAddressMapping &&
      Object.keys(organizationAddressMapping).length > 0
    ) {
      const mapping: Record<string, string> = {};

      // Only include meter mappings that map to addresses belonging to this organization
      meterMappingData.MeterOrganizationAddressMapping.forEach((item) => {
        // Check if this organization_address_id belongs to our organization
        if (organizationAddressMapping[item.organization_address_id]) {
          // Store with uppercase key for case-insensitive lookup
          mapping[item.meter_number.toUpperCase()] =
            item.organization_address_id;
        }
      });
      setMeterMapping(mapping);
    }
    fetchMeterAddressMapping();
  }, [meterMappingData, organizationAddressMapping, fetchMeterAddressMapping]);

  // Notify parent component when unsaved changes status changes
  useEffect(() => {
    onUnsavedChangesChange?.(hasUnsavedChanges);
  }, [hasUnsavedChanges, onUnsavedChangesChange]);

  // Reset unsaved changes when currentFileData changes (new bill loaded)
  useEffect(() => {
    setHasUnsavedChanges(false);
  }, [currentFileData?.id]);

  // 3. Update validateMandatoryFields to set firstErrorFieldId
  const validateMandatoryFields = () => {
    const errors: Record<string, boolean> = {};
    let hasErrors = false;
    let firstErrorId: string | null = null;
    tableData.forEach((row) => {
      if (!row.isHeader) {
        const isMandatory = mandatoryFields.includes(row.parameter);

        // Check if mandatory field is empty (check both extracted and edited values)
        if (isMandatory) {
          const editedIsEmpty = !row.editedValue || row.editedValue === "";
          const extractedIsEmpty =
            row.extractedValue === null ||
            row.extractedValue === undefined ||
            row.extractedValue === "";

          // Field is considered empty if both extracted and edited are empty
          const fieldIsEmpty = editedIsEmpty && extractedIsEmpty;

          if (fieldIsEmpty) {
            errors[row.id] = true;
            if (!firstErrorId) firstErrorId = row.id;
            hasErrors = true;
          }
        }
        // No validation needed for InvoiceNumber, only trim value on blur
        // Additional validations (keep as before)
        // if (
        //   row.parameter === "InvoiceNumber" &&
        //   row.editedValue !== null &&
        //   row.editedValue !== ""
        // ) {
        //   const value = row.editedValue as string;
        //   const isValidInvoiceNumber = /^[a-zA-Z0-9-]*$/.test(value);
        //   if (!isValidInvoiceNumber) {
        //     errors[row.id] = true;
        //     if (!firstErrorId) firstErrorId = row.id;
        //     hasErrors = true;
        //   }
        // }
        if (
          (row.parameter === "PreviousReadingDate" ||
            row.parameter === "PresentReadingDate") &&
          row.editedValue !== null &&
          row.editedValue !== ""
        ) {
          const isValidDate =
            row.editedValue instanceof Date &&
            !isNaN(row.editedValue.getTime());
          if (!isValidDate) {
            errors[row.id] = true;
            if (!firstErrorId) firstErrorId = row.id;
            hasErrors = true;
          }
        }
        if (
          row.parameter === "MeterNumber" &&
          row.editedValue !== null &&
          row.editedValue !== ""
        ) {
          const value = row.editedValue as string;
          const isValidMeterNumber = /^[a-zA-Z0-9 -]*$/.test(value);
          if (!isValidMeterNumber) {
            errors[row.id] = true;
            if (!firstErrorId) firstErrorId = row.id;
            hasErrors = true;
          }
        }
        // Location validation: must be present in locationOptions
        if (row.parameter === "Location") {
          const locationValue = row.editedValue || row.extractedValue || "";
          const found = locationOptions.some(
            (opt) => opt.value === locationValue || opt.label === locationValue
          );
          if (!found) {
            errors[row.id] = true;
            if (!firstErrorId) firstErrorId = row.id;
            hasErrors = true;
          }
        }
      }
    });
    setValidationErrors(errors);
    setValidationType(hasErrors ? "mandatory" : null);
    setFirstErrorFieldId(hasErrors ? firstErrorId : null);
    setScrollFocusTrigger(Date.now());
    return !hasErrors;
  };

  //Transforms table data into structured object with top-level and meter-specific fields
  const transformMeterData = (inputArray: Record<string, any>[]) => {
    const result = {
      AllMeterDetails: {
        MeterDetails: [] as Record<string, any>[],
        InvoiceNumber: "",
        PresentReadingDate: "",
        PreviousReadingDate: "",
      },
      EditedValues: {
        MeterDetails: [] as Record<string, any>[],
        InvoiceNumber: "",
        PresentReadingDate: "",
        PreviousReadingDate: "",
      },
    };

    // First, collect all meter indices and parameters to ensure consistent structure
    const meterIndices = new Set<number>();
    const meterParameters = new Set<string>();

    inputArray.forEach((item) => {
      if (typeof item.meterIndex === "number") {
        meterIndices.add(item.meterIndex);
        if (!item.isHeader) {
          meterParameters.add(item.parameter);
        }
      }
    });

    // Process top-level fields first
    inputArray.forEach((item) => {
      // Top-level fields (not meter-specific)
      if (typeof item.meterIndex !== "number") {
        if (!item.isHeader && item.parameter) {
          // Set the combined value in the AllMeterDetails
          if (
            item.parameter === "InvoiceNumber" ||
            item.parameter === "PresentReadingDate" ||
            item.parameter === "PreviousReadingDate"
          ) {
            const value =
              item.editedValue !== undefined &&
              item.editedValue !== null &&
              item.editedValue !== ""
                ? item.editedValue
                : item.extractedValue;

            result.AllMeterDetails[
              item.parameter as
                | "InvoiceNumber"
                | "PresentReadingDate"
                | "PreviousReadingDate"
            ] = value;

            // For EditedValues, use the edited value or empty string
            result.EditedValues[
              item.parameter as
                | "InvoiceNumber"
                | "PresentReadingDate"
                | "PreviousReadingDate"
            ] =
              item.editedValue !== undefined &&
              item.editedValue !== null &&
              item.editedValue !== ""
                ? item.editedValue
                : "";
          }
        }
      }
    });

    // Initialize meter arrays with all expected indices and parameters
    Array.from(meterIndices).forEach((index) => {
      // Initialize the meter objects
      result.AllMeterDetails.MeterDetails[index] = {};
      result.EditedValues.MeterDetails[index] = {};

      // Add all parameters to each meter with empty values
      Array.from(meterParameters).forEach((param) => {
        result.AllMeterDetails.MeterDetails[index][param] = "";
        result.EditedValues.MeterDetails[index][param] = "";
      });

      // NEW: Initialize LocationId for each meter
      result.AllMeterDetails.MeterDetails[index]["LocationId"] = "";
      result.EditedValues.MeterDetails[index]["LocationId"] = "";

      // Add id from currentFileData.MeterData using array index
      const meterDataId = currentFileData?.MeterData?.[index]?.id;
      if (meterDataId) {
        result.AllMeterDetails.MeterDetails[index]["id"] = meterDataId;
        result.EditedValues.MeterDetails[index]["id"] = meterDataId;
      }
    });

    // Now fill in the actual values
    inputArray.forEach((item) => {
      if (typeof item.meterIndex === "number" && !item.isHeader) {
        const index = item.meterIndex;
        const param = item.parameter;
        result.AllMeterDetails.MeterDetails[index]["manual"] = item.isNew;
        result.EditedValues.MeterDetails[index]["manual"] = item.isNew;

        let value =
          item.editedValue !== undefined &&
          item.editedValue !== null &&
          item.editedValue !== ""
            ? item.editedValue
            : item.extractedValue;

        if (param === "Location") {
          let locationId = "";
          let locationName = "";

          // If value is a label, map it to addressId using organizationAddressMapping
          if (
            value &&
            typeof value === "string" &&
            organizationAddressMapping
          ) {
            // If value is already a UUID, keep as is
            const isUUID = Object.keys(organizationAddressMapping).includes(
              value
            );
            if (isUUID) {
              locationId = value;
              locationName = organizationAddressMapping[value]?.name || "";
            } else {
              // Try to find UUID by label
              const found = Object.entries(organizationAddressMapping).find(
                ([id, addr]) => addr.name === value
              );
              if (found) {
                locationId = found[0]; // addressId
                locationName = found[1].name; // location name
              } else {
                // If not found in mapping, treat as location name
                locationName = value;
                locationId = "";
              }
            }
          }

          // Store both Location (name) and LocationId (UUID)
          result.AllMeterDetails.MeterDetails[index]["Location"] = locationName;
          result.AllMeterDetails.MeterDetails[index]["LocationId"] = locationId;

          if (
            item.editedValue !== undefined &&
            item.editedValue !== null &&
            item.editedValue !== ""
          ) {
            result.EditedValues.MeterDetails[index]["Location"] = locationName;
            result.EditedValues.MeterDetails[index]["LocationId"] = locationId;
          }
        } else {
          // For non-Location parameters, proceed as before
          result.AllMeterDetails.MeterDetails[index][param] = value;

          if (
            item.editedValue !== undefined &&
            item.editedValue !== null &&
            item.editedValue !== ""
          ) {
            result.EditedValues.MeterDetails[index][param] = value;
          }
        }
        // If this row carried a meterDataId, persist it into the result.id
        // const rowMeterDataId = (item as any).meterDataId as string | undefined;
        // if (rowMeterDataId) {
        //   result.AllMeterDetails.MeterDetails[index]["id"] = rowMeterDataId;
        //   result.EditedValues.MeterDetails[index]["id"] = rowMeterDataId;
        // }
      }
    });

    // Remove any undefined holes in the meters arrays (in case of sparse indices)
    result.AllMeterDetails.MeterDetails =
      result.AllMeterDetails.MeterDetails.filter(Boolean);
    result.EditedValues.MeterDetails =
      result.EditedValues.MeterDetails.filter(Boolean);

    return result;
  };

  /**
   * Returns a mapping of meter number (uppercased) to a set of associated locations
   * from the tableData (using editedValue if present, else extractedValue).
   */
  function getMeterNumberToLocations(
    tableData: DataPoint[]
  ): Record<string, Set<string>> {
    const mapping: Record<string, Set<string>> = {};

    tableData
      .filter((row) => row.parameter === "MeterNumber" && !row.isHeader)
      .forEach((meterRow) => {
        const meterNumber = (
          meterRow.editedValue ||
          meterRow.extractedValue ||
          ""
        )
          .toString()
          .trim()
          .toUpperCase();
        if (!meterNumber) return;

        // Find the corresponding location for this meter
        const locationRow = tableData.find(
          (row) =>
            row.parameter === "Location" &&
            row.meterIndex === meterRow.meterIndex
        );
        const locationVal = (
          locationRow?.editedValue ||
          locationRow?.extractedValue ||
          ""
        ).toString();

        if (!mapping[meterNumber]) {
          mapping[meterNumber] = new Set();
        }
        mapping[meterNumber].add(locationVal);
      });

    return mapping;
  }

  // Optimized function to renumber meters sequentially (1 to 10)
  const renumberMeters = useCallback(
    (data: DataPoint[]): DataPoint[] => {
      // Get headers and sort them by current meterIndex
      const headers = data
        .filter((row) => row.isHeader)
        .sort((a, b) => (a.meterIndex || 0) - (b.meterIndex || 0));

      // Create mapping from old to new indices
      const indexMap = new Map(
        headers.map((header, newIndex) => [header.meterIndex, newIndex])
      );

      // Update all rows with new sequential numbering
      return data.map((row) => {
        const newIndex = indexMap.get(row.meterIndex);
        if (newIndex === undefined) return row;

        return {
          ...row,
          meterIndex: newIndex,
          id: row.isHeader
            ? `meter-header-${newIndex}-${currentFileData?.id || "manual"}`
            : `meter-${newIndex}-${row.parameter}-${currentFileData?.id || "manual"}`,
          ...(row.isHeader && {
            parameter: `Meter Details No. ${newIndex + 1}`,
          }),
        };
      });
    },
    [currentFileData?.id]
  );

  // Optimized function to delete meter and renumber
  const deleteMeter = useCallback((meterIndexToDelete: number) => {
    // Reset validation errors and hide error message
    setValidationErrors({});

    // Remove all rows belonging to the meter being deleted,
    // then shift subsequent meters' indices down by 1 while keeping their data intact.
    // IMPORTANT: shifted rows must not retain DB-derived ids — use "-manual" suffix.
    setTableData((prev) => {
      const filtered = prev.filter(
        (row) => row.meterIndex !== meterIndexToDelete
      );

      const updated = filtered.map((row) => {
        // Only adjust rows that were after the deleted meter
        if (
          typeof row.meterIndex === "number" &&
          row.meterIndex > meterIndexToDelete
        ) {
          const newIndex = row.meterIndex - 1;

          // When a row shifts forward, it must NOT inherit any DB identity.
          // Clear meterDataId and mark as client-new so downstream logic won't
          // treat it as an existing DB record.
          return {
            ...row,
            meterIndex: newIndex,
            id: row.isHeader
              ? `meter-header-${newIndex}-manual`
              : `meter-${newIndex}-${row.parameter}-manual`,
            isNew: true,
            meterDataId: undefined,
            ...(row.isHeader && {
              parameter: `Meter Details No. ${newIndex + 1}`,
            }),
          };
        }
        return row;
      });

      return updated;
    });

    // Update user-added indices: remove the deleted index and decrement any indices > deleted
    setUserAddedMeterIndices((prev) =>
      prev
        .filter((idx) => idx !== meterIndexToDelete)
        .map((idx) => (idx > meterIndexToDelete ? idx - 1 : idx))
    );
  }, []);

  const resolveMeterDbId = (row: DataPoint): string | undefined => {
    if (typeof row.meterIndex !== "number") return undefined;

    // 1) prefer explicit id carried on the row
    if (row.meterDataId) return row.meterDataId;

    // 2) try to match by the meter number present in the row (edited > extracted > cell)
    const meterNumberFromRow = (row.editedValue || row.extractedValue || "")
      .toString()
      .trim();

    if (meterNumberFromRow) {
      const matches = (currentFileData?.MeterData || []).filter(
        (m) =>
          (m.meter_number || "").toString().trim().toUpperCase() ===
          meterNumberFromRow.toUpperCase()
      );
      // Only use the match if it's unambiguous
      if (matches.length === 1) return matches[0].id;
    }

    return undefined;
  };

  // Ref to store repeated row IDs for scroll functionality
  const repeatedRowIdsRef = useRef<string[]>([]);

  const handleVerifyAndConfirm = async () => {
    try {
      setIsLoading(true);
      if (!validateMandatoryFields()) {
        setValidationType("mandatory");
        setIsLoading(false);
        return;
      }

      // Use the helper function to get the mapping
      const meterNumberToLocations = getMeterNumberToLocations(tableData);

      // If any meter number has more than one unique location, show error and return
      const hasDuplicateMeterWithDifferentLocations = Object.values(
        meterNumberToLocations
      ).some((locationsSet) => locationsSet.size > 1);

      if (hasDuplicateMeterWithDifferentLocations) {
        const message = {
          type: "AIExtractedDataValidationPopup",
          title: "Duplicate Meter Number",
          message:
            "This meter number is linked to another location. Please update it or contact your administrator.",
          buttons: [{ text: "Ok", action: "ok" }],
        };
        window.parent.postMessage(JSON.stringify(message), "*");
        setIsLoading(false);
        return;
      }
      // Get date rows for duplicate checking and display
      const prevReadingRow = tableData.find(
        (row) => row.parameter === "PreviousReadingDate"
      );
      const presentReadingRow = tableData.find(
        (row) => row.parameter === "PresentReadingDate"
      );
      // Check for duplicate meter readings
      const meterRows = tableData.filter(
        (row) =>
          row.parameter === "MeterNumber" &&
          (row.editedValue || row.extractedValue)
      );
      // For edit mode, only check for duplicates on meters where the user has changed the value
      // (i.e., current editedValue is different from the last saved value in the DB).
      // For first-time verification, check all meters.
      const isEdit = currentFileData?.status === "Verified";
      const metersToCheck = isEdit
        ? meterRows.filter((row) => {
            // Get the original edited value from the DB (currentFileData)
            const originalEditedValue =
              row.meterIndex !== undefined
                ? (currentFileData?.edited_values?.MeterDetails?.[
                    row.meterIndex
                  ]?.[row.parameter] ?? "")
                : "";
            return row.editedValue !== originalEditedValue;
          })
        : meterRows;

      // ---- Check for duplicate meters (Meter-Address mapping) across different users ----
      if (meterRows.length > 0) {
        for (const meterRow of metersToCheck) {
          const meterNumber = (meterRow.editedValue ||
            meterRow.extractedValue) as string;

          if (meterNumber) {
            // Find the corresponding location for this meter
            const locationRow = tableData.find(
              (row) =>
                row.parameter === "Location" &&
                row.meterIndex === meterRow.meterIndex
            );

            const selectedLocationId =
              locationRow?.editedValue || locationRow?.extractedValue;

            if (selectedLocationId) {
              try {
                // Check if this meter number is already mapped to a different location
                const { data: existingMeterMapping } =
                  await fetchMeterAddressMapping({
                    where: {
                      meter_number: { _eq: meterNumber.trim().toUpperCase() },
                    },
                  });

                if (
                  existingMeterMapping?.MeterOrganizationAddressMapping
                    ?.length > 0
                ) {
                  const existingMapping =
                    existingMeterMapping.MeterOrganizationAddressMapping[0];

                  // Check if the existing mapping is for a different location
                  if (
                    existingMapping.organization_address_id !==
                    selectedLocationId
                  ) {
                    // Only show error if mapped location is NOT in locationOptions
                    const isMappedLocationInOptions = locationOptions.some(
                      (opt) =>
                        opt.value === existingMapping.organization_address_id
                    );
                    if (!isMappedLocationInOptions) {
                      const message = {
                        type: "AIExtractedDataValidationPopup",
                        title: "Duplicate Meter Number",
                        message:
                          "This meter number is linked to another location. Please update it or contact your administrator.",
                        buttons: [{ text: "Ok", action: "ok" }],
                      };
                      window.parent.postMessage(JSON.stringify(message), "*");
                      setIsLoading(false);
                      return;
                    }
                  }
                }
              } catch (error) {
                console.error("Error checking meter-location mapping:", error);
              }
            }
          }
        }
      }

      // Baseline year date validation
      const presentReadingDateValue =
        presentReadingRow?.editedValue || presentReadingRow?.extractedValue;
      if (presentReadingDateValue) {
        const presentDate = new Date(presentReadingDateValue);
        const baselineDateCompare = new Date(baseLineDate);
        baselineDateCompare.setDate(baselineDateCompare.getDate());
        const formattedBaselineDate = baseLineDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
        if (presentDate < baselineDateCompare) {
          window.parent.postMessage(
            JSON.stringify({
              type: "AIExtractedDataValidationPopup",
              title: "Invalid Present Reading Date",
              message: `Present Reading Date must be ${formattedBaselineDate} or later.`,
              buttons: [{ text: "Ok", action: "ok" }],
            }),
            "*"
          );
          setIsLoading(false);
          return;
        }
      }

      if (
        meterRows.length > 0 &&
        prevReadingRow &&
        presentReadingRow &&
        organizationId
      ) {
        const prevReadingDate =
          prevReadingRow.editedValue || prevReadingRow.extractedValue;
        const presentReadingDate =
          presentReadingRow.editedValue || presentReadingRow.extractedValue;

        // Check each meter for duplicates
        for (const meterRow of metersToCheck) {
          const meterNumber = (meterRow.editedValue ||
            meterRow.extractedValue) as string;

          if (meterNumber && prevReadingDate && presentReadingDate) {
            try {
              const { data } = await checkDuplicate({
                variables: {
                  meter_number: `%${meterNumber.toUpperCase()}%`, // Use ILIKE pattern for case-insensitive search
                  previous_reading_date: prevReadingDate,
                  present_reading_date: presentReadingDate,
                  organization_id: organizationId,
                },
                fetchPolicy: "network-only", // <-- This forces a network request every time
              });
              /**
               * Why organization_id filter?
               * Multi-tenant Architecture:
               *  This application serves multiple organizations, and each organization should only see and interact with their own data.
               *  Without the organization_id filter, we could accidentally find "duplicates" from other organizations, which would be incorrect.
               */
              // Instead of blocking on any AIFileData, check if the meter number is present in MeterData
              const currentMeterDbId =
                typeof meterRow.meterIndex === "number"
                  ? currentFileData?.MeterData?.[meterRow.meterIndex]?.id
                  : undefined;

              const duplicateMeter = data?.AIFileData?.[0]?.MeterData?.find(
                (m) =>
                  m.meter_number?.toUpperCase() === meterNumber.toUpperCase() &&
                  m.id !== currentMeterDbId // Exclude current meter's own DB record
              );
              if (duplicateMeter) {
                // Found duplicate entries - use getDateForDisplay helper function
                const message = {
                  type: "AIExtractedDataValidationPopup",
                  title: "Duplicate Entry",
                  message: `Bill Already Exists.`,
                  buttons: [{ text: "Ok", action: "ok" }],
                };
                window.parent.postMessage(JSON.stringify(message), "*");
                setIsLoading(false);
                return;
              }
            } catch (error) {
              console.error("Error checking for duplicates:", error);
              // Continue with verification if duplicate check fails
            }
          }
        }

        let meterdetails = transformMeterData(tableData);
        try {
          //insert ghg data
          const ghgResult = await insertVerifiedDataGhgTables(
            meterdetails.AllMeterDetails,
            GridPowerDetailsConstant.parent_code,
            userId || "",
            currentFileData?.file_id || "",
            currentFileData?.id || "",
            organizationId
          );
          //meter master data changes for
          const meterMasterResult = await insertVerifiedMeterMasterData(
            currentFileData?.id,
            currentFileData?.file_id,
            meterdetails.AllMeterDetails,
            userId,
            organizationId,
            meterdetails.EditedValues as EditedValues
          );

          if (
            ghgResult?.status === "success" &&
            meterMasterResult?.status === "success"
          ) {
            // Send postMessage to parent window with verification popup
            const getDateForDisplay = (val: string | number | Date | null) => {
              if (typeof val === "number") return "";
              return formatDateDisplay(val);
            };
            const prevReadingDateDisplay = getDateForDisplay(
              prevReadingRow?.editedValue ||
                prevReadingRow?.extractedValue ||
                null
            );
            const presentReadingDateDisplay = getDateForDisplay(
              presentReadingRow?.editedValue ||
                presentReadingRow?.extractedValue ||
                null
            );
            const message = {
              type: "AIDataVerifyPopup",
              title: "Data Verified Successfully",
              message: `<strong>Type:</strong> Electricity Consumption Data<br><br><strong>Period:</strong> ${prevReadingDateDisplay} to ${presentReadingDateDisplay}`,
            };
            window.parent.postMessage(JSON.stringify(message), "*");

            // Reset unsaved changes after successful verification
            setHasUnsavedChanges(false);
          } else {
            window.parent.postMessage(
              JSON.stringify({
                type: "AIExtractedDataValidationPopup",
                title: "Verification Failed",
                message:
                  "We are unable to verify bill due to incorrect data. Please update data and try again or contact support.",
                buttons: [{ text: "Ok", action: "ok" }],
              }),
              "*"
            );
          }
        } catch (error) {
          console.error("Verification failed:", error);
        }
      }
    } catch (error) {
      console.error("Error verifying data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns: MRT_ColumnDef<DataPoint>[] = useMemo(
    () => [
      {
        accessorKey: "parameter",
        header: "Parameter",
        size: 150,
        mantineTableHeadCellProps: {
          style: {
            borderRadius: "5px 0px 0px 5px",
          },
        },
        Cell: ({ row }: { row: { original: DataPoint } }) => {
          if (row.original.isHeader) {
            return (
              <Flex align="center" gap="xs" id={row.original.id}>
                <Text fw={700} fz={12} c="#000">
                  {getParameterLabel(row.original.parameter)}
                </Text>
              </Flex>
            );
          }

          return (
            <Text fz={12} c="#000">
              {getParameterLabel(row.original.parameter)}
              {mandatoryFields.includes(row.original.parameter) && (
                <Text span c="red" ml={4}>
                  *
                </Text>
              )}
            </Text>
          );
        },
      },
      {
        accessorKey: "extractedValue",
        header: "Extracted Data",
        size: 150,
        Cell: ({
          cell,
          row,
        }: {
          cell: { getValue: () => any };
          row: { original: DataPoint };
        }) => {
          if (row.original.isHeader) return null;
          const parameter = row.original.parameter;
          const value = cell.getValue();
          const isMandatory = mandatoryFields.includes(parameter);
          // Highlight if extracted value is empty and field is mandatory
          const extractedIsEmpty =
            value === null || value === undefined || value === "";

          const hasExistingDatabaseId = !!resolveMeterDbId(row.original);

          // Only show error for MeterNumber if new and not verified
          // For other meter fields (Location, UnitsConsumed, etc), only show error if their parent meter is not verified and isNew
          let showExtractedError = false;
          if (parameter === "MeterNumber") {
            showExtractedError = !!row.original.isNew && !hasExistingDatabaseId;
          } else if (
            typeof row.original.meterIndex === "number" &&
            ["Location", "UnitsConsumed"].includes(parameter)
          ) {
            // Find the parent MeterNumber row for this meterIndex
            const parentMeterRow = tableData.find(
              (r) =>
                r.parameter === "MeterNumber" &&
                r.meterIndex === row.original.meterIndex
            );
            const parentIsNew = !!parentMeterRow && !!parentMeterRow.isNew;
            const parentVerified = parentMeterRow
              ? !!resolveMeterDbId(parentMeterRow)
              : false;
            showExtractedError = parentIsNew && !parentVerified;
          } else {
            showExtractedError =
              isMandatory && extractedIsEmpty && fileStatus !== "Verified";
          }

          //If meter-data is extracted by AI is empty, and file status is not "Verified", show error
          if (extractedIsEmpty && fileStatus !== "Verified") {
            showExtractedError = true;
          }

          const bluePlaceholder =
            fileStatus === "Verified" &&
            isMandatory &&
            extractedIsEmpty &&
            row.original.isNew === true &&
            typeof row.original.meterIndex === "number" &&
            hasExistingDatabaseId &&
            false;

          const commonProps = {
            disabled: true,
            required: isMandatory,
            size: smallDevice ? "xs" : "sm",
            placeholder: "No data extracted",
            error: showExtractedError,
            classNames: { root: bluePlaceholder ? "blue-placeholder" : "" },
          };
          switch (parameter) {
            case "PreviousReadingDate":
            case "PresentReadingDate":
              return (
                <TextInput
                  value={formatDateDisplay(value)}
                  {...commonProps}
                  readOnly
                />
              );
            case "UnitsConsumed":
              return (
                <NumberInput
                  value={(value as number) ?? undefined}
                  {...commonProps}
                  readOnly
                  decimalScale={2}
                  fixedDecimalScale
                  hideControls
                  allowNegative={false}
                />
              );
            case "MeterNumber":
              return (
                <TextInput value={(value as string) ?? ""} {...commonProps} />
              );
            case "Location": {
              const locationName = locationOptions.find(
                (loc) => loc.value === value
              );
              return <TextInput value={locationName?.label} {...commonProps} />;
            }
            case "InvoiceNumber":
              return (
                <TextInput
                  value={((value as string) ?? "").replace(/[^a-zA-Z0-9-]/g, "")}
                  {...commonProps}
                />
              );
            default:
              return (
                <TextInput value={(value as string) ?? ""} {...commonProps} />
              );
          }
        },
      },
      {
        accessorKey: "editedValue",
        header: "Updated Data",
        size: 150,
        mantineTableHeadCellProps: {
          style: {
            borderRadius: "0px 5px 5px 0px",
          },
        },
        Cell: ({
          cell,
          row,
        }: {
          cell: { getValue: () => any };
          row: { original: DataPoint; index: number };
        }) => {
          const isUserAdded =
            row.original.isNew ||
            (() => {
              const edited =
                currentFileData?.edited_values?.MeterDetails?.[
                  row.original.meterIndex ?? -1
                ];
              return edited?.manual === true;
            })();
          if (row.original.isHeader) {
            return isUserAdded && !isAdmin ? (
              <Flex justify="flex-end" align="center" id={row.original.id}>
                <ActionIcon
                  variant="transparent"
                  onClick={() => {
                    const indexToDelete = row.original.meterIndex;
                    if (typeof indexToDelete !== "number") return;

                    // Check if any field is not empty
                    const meterRows = tableData.filter(
                      (r) => r.meterIndex === indexToDelete && !r.isHeader
                    );
                    const hasNonEmptyFields = meterRows.some(
                      (r) =>
                        r.editedValue !== undefined &&
                        r.editedValue !== null &&
                        r.editedValue !== ""
                    );

                    if (hasNonEmptyFields) {
                      window.parent.postMessage(
                        JSON.stringify({
                          type: "DeleteMeterPopup",
                          title: "Delete This Meter?",
                          message: "The meter details will be removed.",
                          meterIndex: indexToDelete,
                          buttons: [
                            { text: "NO, KEEP IT", action: "yes" },
                            { text: "YES, DELETE", action: "no" },
                          ],
                        }),
                        "*"
                      );
                      return;
                    }

                    // Delete immediately if all fields are empty
                    deleteMeter(indexToDelete);
                  }}
                  className="AIExtractTrashIcon"
                >
                  <TrashIcon color="rgba(0, 0, 0, 0.3)" stroke={1.5} />
                </ActionIcon>
              </Flex>
            ) : null;
          }
          const parameter = row.original.parameter;
          const value = cell.getValue();
          const isMandatory = mandatoryFields.includes(parameter);
          const handleChange = (newValue: any) => {
            setTableData((prev) => {
              const newData = [...prev];
              if (
                parameter === "PreviousReadingDate" ||
                parameter === "PresentReadingDate"
              ) {
                newData[row.index] = {
                  ...newData[row.index],
                  editedValue: newValue instanceof Date ? newValue : null,
                };
              } else if (parameter === "MeterNumber") {
                // Update MeterNumber
                newData[row.index] = {
                  ...newData[row.index],
                  editedValue: newValue,
                };

                // Also update the corresponding Location field if mapping exists
                const meterNumber =
                  newValue === "" || newValue === null
                    ? (newData[row.index].extractedValue || "")
                        .toString()
                        .toUpperCase()
                    : (newValue || "").toString().toUpperCase(); // Determine the correct meter number for mapping
                const mappedLocationId = meterMapping[meterNumber];
                if (row.original.meterIndex !== undefined) {
                  const locationRowIndex = newData.findIndex(
                    (item) =>
                      item.parameter === "Location" &&
                      item.meterIndex === row.original.meterIndex
                  );
                  newData[locationRowIndex] = {
                    ...newData[locationRowIndex],
                    editedValue: mappedLocationId,
                  };
                }
              } else {
                newData[row.index] = {
                  ...newData[row.index],
                  editedValue: newValue,
                };
              }

              // Check if there are actual meaningful changes after this update
              const actualChanges = checkForActualChanges(newData);
              setHasUnsavedChanges(actualChanges);

              return newData;
            });
            // Check if the field should show an error (if it's mandatory and empty)
            setValidationErrors((prev) => {
              const isMandatory = mandatoryFields.includes(
                row.original.parameter
              );
              const valueIsEmpty =
                newValue === null || newValue === undefined || newValue === "";
              const extractedIsEmpty =
                row.original.extractedValue === null ||
                row.original.extractedValue === undefined ||
                row.original.extractedValue === "";

              // If mandatory and both edited and extracted values are empty, show error
              const shouldShowError =
                isMandatory && valueIsEmpty && extractedIsEmpty;
              const newErrors = {
                ...prev,
                [row.original.id]: shouldShowError,
              };

              // Check if any mandatory fields still have errors
              if (validationType === "mandatory") {
                const anyMandatoryFieldHasError = tableData.some((tableRow) => {
                  if (tableRow.isHeader) return false;
                  const rowIsMandatory = mandatoryFields.includes(
                    tableRow.parameter
                  );
                  if (!rowIsMandatory) return false;

                  // For the current row being edited, use the shouldShowError value
                  if (tableRow.id === row.original.id) {
                    return shouldShowError;
                  }

                  // For other rows, check if they're empty
                  const rowEditedIsEmpty =
                    tableRow.editedValue === null ||
                    tableRow.editedValue === undefined ||
                    tableRow.editedValue === "";
                  const rowExtractedIsEmpty =
                    tableRow.extractedValue === null ||
                    tableRow.extractedValue === undefined ||
                    tableRow.extractedValue === "";

                  return (
                    rowIsMandatory && rowEditedIsEmpty && rowExtractedIsEmpty
                  );
                });

                // Only clear validation type if no mandatory fields have errors
                if (!anyMandatoryFieldHasError) {
                  setValidationType(null);
                }
              }

              return newErrors;
            });
          };
          switch (parameter) {
            case "PreviousReadingDate": {
              // Find the present reading date value (prefer edited, fallback to extracted)
              const presentRow = tableData.find(
                (r) => r.parameter === "PresentReadingDate"
              );
              let presentDate = presentRow?.editedValue;
              if (
                !(presentDate instanceof Date) ||
                isNaN(presentDate?.getTime?.())
              ) {
                presentDate = undefined;
              }
              return (
                <DateInput
                  value={value ? new Date(value) : null}
                  onChange={(date) => {
                    handleChange(date ? new Date(date) : null);
                  }}
                  ref={(el) => {
                    if (el instanceof HTMLInputElement) {
                      inputRefs.current[row.original.id] = el;
                      (
                        prevDateInputRef as React.MutableRefObject<HTMLInputElement | null>
                      ).current = el;
                    }
                  }}
                  leftSection={
                    <Flex
                      align="center"
                      onClick={() =>
                        inputRefs.current[row.original.id]?.focus()
                      }
                    >
                      <CalenderIcon />
                    </Flex>
                  }
                  placeholder={"DD MMM YYYY"}
                  valueFormat="DD MMM YYYY"
                  dateParser={parseDateInput}
                  required={isMandatory}
                  maxDate={presentDate ?? new Date()}
                  clearable={!isAdmin && true}
                  disabled={isAdmin || !!duplicateErrorMessage}
                  size={smallDevice ? "xs" : "sm"}
                  error={validationErrors[row.original.id]}
                />
              );
            }
            case "PresentReadingDate": {
              // Find the previous reading date value
              const prevRow = tableData.find(
                (r) => r.parameter === "PreviousReadingDate"
              );
              let prevDate = prevRow?.editedValue;
              if (!(prevDate instanceof Date) || isNaN(prevDate?.getTime?.())) {
                prevDate = undefined;
              }
              return (
                <DateInput
                  value={value ? new Date(value) : null}
                  onChange={(date) => {
                    handleChange(date ? new Date(date) : null);
                  }}
                  ref={(el) => {
                    if (el instanceof HTMLInputElement) {
                      inputRefs.current[row.original.id] = el;
                      (
                        presentDateInputRef as React.MutableRefObject<HTMLInputElement | null>
                      ).current = el;
                    }
                  }}
                  leftSection={
                    <Flex
                      align="center"
                      onClick={() =>
                        inputRefs.current[row.original.id]?.focus()
                      }
                    >
                      <CalenderIcon />
                    </Flex>
                  }
                  placeholder={"DD MMM YYYY"}
                  valueFormat="DD MMM YYYY"
                  dateParser={parseDateInput}
                  required={isMandatory}
                  minDate={prevDate}
                  maxDate={new Date()}
                  clearable={!isAdmin && true}
                  disabled={isAdmin || !!duplicateErrorMessage}
                  size={smallDevice ? "xs" : "sm"}
                  error={validationErrors[row.original.id]}
                />
              );
            }
            case "UnitsConsumed":
              return (
                <NumberInput
                  value={(value as number) ?? undefined}
                  onChange={handleChange}
                  decimalScale={2}
                  fixedDecimalScale
                  hideControls
                  placeholder={getParameterLabel(parameter)}
                  required={isMandatory}
                  disabled={isAdmin || !!duplicateErrorMessage}
                  size={smallDevice ? "xs" : "sm"}
                  error={validationErrors[row.original.id]}
                  ref={(el) => {
                    if (el instanceof HTMLInputElement) {
                      inputRefs.current[row.original.id] = el;
                    }
                  }}
                  allowNegative={false}
                />
              );
            case "MeterNumber": {
              // derive once just above <TextInput /> for clarity (optional)
              const currentVal = (value as string) ?? "";
              const isEmpty = currentVal.trim().length === 0;
              return (
                <TextInput
                  value={(value as string) ?? ""}
                  onChange={(event) => {
                    const newValue = event.currentTarget.value;
                    // Only allow alphanumeric and space
                    if (/^[a-zA-Z0-9 ]*$/.test(newValue) || newValue === "") {
                      handleChange(newValue);

                      // Mark this field as being actively edited
                      activelyEditedMeterIdsRef.current.add(row.original.id);

                      // Update data with debounced validation
                      setTableData((prev) => {
                        const newData = [...prev];
                        newData[row.index] = {
                          ...newData[row.index],
                          editedValue: newValue,
                        };

                        // Clear any existing timeout
                        if (meterValidationTimeoutRef.current) {
                          clearTimeout(meterValidationTimeoutRef.current);
                          meterValidationTimeoutRef.current = null;
                        }

                        // Set a new timeout to validate after typing stops
                        meterValidationTimeoutRef.current = setTimeout(() => {
                          validateDuplicateMeters(newData);
                          setForceUpdateCounter((prev) => prev + 1); // Force re-render
                          meterValidationTimeoutRef.current = null;
                        }, 500);

                        return newData;
                      });
                    }
                  }}
                  onBlur={(event) => {
                    // Use target instead of currentTarget as currentTarget can be null in blur events
                    const rawMeterNumber =
                      (event.target as HTMLInputElement)?.value || "";

                    // Convert to uppercase for case-insensitive matching
                    const meterNumber = rawMeterNumber.toUpperCase();

                    // Clear active editing status for this field
                    activelyEditedMeterIdsRef.current.delete(row.original.id);

                    // Clear any existing timeout and run validation immediately
                    if (meterValidationTimeoutRef.current) {
                      clearTimeout(meterValidationTimeoutRef.current);
                      meterValidationTimeoutRef.current = null;
                    }
                    validateDuplicateMeters(tableData);
                    setForceUpdateCounter((prev) => prev + 1); // Force re-render

                    // Check if this meter number has a location mapping and update the corresponding Location field
                    if (row.original.meterIndex !== undefined) {
                      const addressId = meterNumber
                        ? meterMapping[meterNumber]
                        : null;
                      const mappedLocation = addressId
                        ? organizationAddressMapping[addressId]?.name
                        : null;

                      // Find the corresponding Location row for this meter and update it
                      setTableData((prev) => {
                        const newData = [...prev];
                        const locationRowIndex = newData.findIndex(
                          (item) =>
                            item.parameter === "Location" &&
                            item.meterIndex === row.original.meterIndex
                        );

                        if (locationRowIndex !== -1) {
                          const newLocationValue =
                            mappedLocation !== null &&
                            mappedLocation !== undefined
                              ? mappedLocation
                              : newData[locationRowIndex].editedValue;
                          newData[locationRowIndex] = {
                            ...newData[locationRowIndex],
                            editedValue: newLocationValue,
                          };
                        } else {
                          console.warn(
                            `Location row not found for meterIndex: ${row.original.meterIndex}`
                          );
                        }

                        // Check if there are actual meaningful changes after this update
                        const actualChanges = checkForActualChanges(newData);
                        setHasUnsavedChanges(actualChanges);

                        return newData;
                      });
                    }
                  }}
                  placeholder={getParameterLabel(parameter)}
                  required={isMandatory}
                  disabled={
                    isAdmin ||
                    (!!duplicateErrorMessage && // Check if duplicateErrorMessage exists instead of hasDuplicateMeters
                      row.original.parameter !== "MeterNumber") || // ✅ disable all non-MeterNumber fields
                    (!!duplicateErrorMessage &&
                      row.original.parameter === "MeterNumber" &&
                      !duplicateErrors[row.original.id] &&
                      // Don't disable if this field is being actively edited
                      !activelyEditedMeterIdsRef.current.has(row.original.id)) // ✅ disable MeterNumber fields that are not duplicates and not being edited
                  }
                  size={smallDevice ? "xs" : "sm"}
                  error={
                    // ✅ Additional case:
                    // Show mandatory (required) error ONLY after the Verify & Confirm flow
                    // has run and set validationType === "mandatory".
                    // This lets cleared fields stay non-red while the user is editing,
                    // but they will turn red on submit if still empty.
                    (validationType === "mandatory" &&
                      validationErrors[row.original.id]) ||
                    // ✅ Keep duplicate error logic, but only when the field has some text.
                    // If the user clears the field, duplicate red highlight disappears.
                    (!isEmpty && duplicateErrors[row.original.id])
                  }
                  ref={(el) => {
                    if (el instanceof HTMLInputElement) {
                      inputRefs.current[row.original.id] = el;
                    }
                  }}
                />
              );
            }
            case "Location": {
              // Get extracted and edited meter numbers for this meter group
              let extractedMeterNumber = "";
              let editedMeterNumber = "";
              if (row.original.meterIndex !== undefined) {
                const meterNumberRow = tableData.find(
                  (item) =>
                    item.parameter === "MeterNumber" &&
                    item.meterIndex === row.original.meterIndex
                );
                extractedMeterNumber = (
                  (meterNumberRow?.extractedValue as string) || ""
                )
                  .trim()
                  .toUpperCase();
                editedMeterNumber = (
                  (meterNumberRow?.editedValue as string) || ""
                )
                  .trim()
                  .toUpperCase();
              }

              // Get the extracted location value for this row
              let extractedLocationValue = "";
              let editedLocationValue = "";
              if (
                row.original.meterIndex !== undefined &&
                currentFileData?.extracted_values?.MeterDetails
              ) {
                extractedLocationValue = (
                  currentFileData.extracted_values.MeterDetails[
                    row.original.meterIndex
                  ]?.Location || ""
                ).trim();
                editedLocationValue = (
                  currentFileData.edited_values?.MeterDetails?.[
                    row.original.meterIndex
                  ]?.Location || ""
                ).trim();
              } else {
                extractedLocationValue = (
                  (row.original.extractedValue as string) || ""
                ).trim();
                editedLocationValue = (
                  (row.original.editedValue as string) || ""
                ).trim();
              }

              // Meter mapping logic: If the meter number is mapped in the master table, always show a disabled TextInput with the mapped location name
              const isMeterMapped =
                editedMeterNumber &&
                meterMapping[editedMeterNumber.toUpperCase()] &&
                organizationAddressMapping[
                  meterMapping[editedMeterNumber.toUpperCase()]
                ];

              if (isMeterMapped) {
                const mappedLocationName =
                  organizationAddressMapping[
                    meterMapping[editedMeterNumber.toUpperCase()]
                  ]?.name || "";
                return (
                  <TextInput
                    value={mappedLocationName}
                    disabled
                    required={isMandatory}
                    placeholder="Auto-filled from master table"
                    size={smallDevice ? "xs" : "sm"}
                    error={validationErrors[row.original.id]}
                  />
                );
              } else {
                // Dropdown enable/disable logic:
                // 🟢 Enable if:
                //   1) The extracted location field is empty.
                //   2) The extracted location field is not empty AND there is a difference between the edited meter number and the extracted meter number.
                // 🔴 Disable if:
                //   The extracted location field is not empty AND (the edited meter number is the same as the extracted meter number OR the edited meter number is empty/untouched).
                //   Always disable for admin.
                let shouldDisableDropdown = false;
                const isMeterMapped =
                  extractedMeterNumber &&
                  meterMapping[extractedMeterNumber.toUpperCase()] &&
                  organizationAddressMapping[
                    meterMapping[extractedMeterNumber.toUpperCase()]
                  ];
                if (isAdmin) {
                  shouldDisableDropdown = true;
                } else if (
                  extractedLocationValue.length > 0 &&
                  (editedMeterNumber === extractedMeterNumber ||
                    editedMeterNumber === "")
                ) {
                  shouldDisableDropdown = true;
                } else if (editedMeterNumber === "" && isMeterMapped) {
                  //If Extracted Column don't have location field value, then check whether edited column's location value is mapped to either meter-number from edited or extracted columns
                  shouldDisableDropdown = true;
                } else {
                  shouldDisableDropdown = false;
                }
                // New logic: if location is not present in locationOptions, always enable
                const locationValue = (value as string) || "";
                const isLocationValid = locationOptions.some(
                  (opt) =>
                    opt.value === locationValue || opt.label === locationValue
                );
                if (!isLocationValid) {
                  shouldDisableDropdown = false;
                }
                return (
                  <Select
                    styles={{
                      dropdown: {
                        height: "max-content",
                      },
                      options: {
                        height: "min-content !important",
                      },
                    }}
                    data={locationOptions}
                    value={
                      (value as string) && (value as string) !== ""
                        ? (value as string)
                        : null
                    }
                    onChange={handleChange}
                    placeholder="Select Location"
                    required={isMandatory}
                    allowDeselect={true}
                    clearable={true}
                    rightSection={<IconChevronDown size={16} />}
                    // Disable if:
                    // 1. Admin user OR
                    // 2. Extracted location is present and meter numbers are the same or edited meter number is empty OR
                    // 3. There is a duplicate meter error message
                    disabled={shouldDisableDropdown || !!duplicateErrorMessage}
                    size={smallDevice ? "xs" : "sm"}
                    error={validationErrors[row.original.id]}
                    maxDropdownHeight={
                      Math.min(locationOptions.length, 4) *
                      (smallDevice ? 32 : 36)
                    }
                    ref={(el) => {
                      if (el instanceof HTMLInputElement) {
                        inputRefs.current[row.original.id] = el;
                      }
                    }}
                    dropdownOpened={!!openedSelects[row.original.id]}
                    onDropdownOpen={() => {
                      lastSelectOpenTimeRef.current = Date.now();
                      setOpenedSelects((prev) => ({
                        ...prev,
                        [row.original.id]: true,
                      }));
                    }}
                    onDropdownClose={() =>
                      setOpenedSelects((prev) => ({
                        ...prev,
                        [row.original.id]: false,
                      }))
                    }
                  />
                );
              }
            }
            case "InvoiceNumber":
              return (
                <TextInput
                  value={(value as string) ?? ""}
                  onChange={(event) => {
                    handleChange(event.currentTarget.value);
                  }}
                  onBlur={(event) => {
                    const trimmedValue = event.currentTarget.value.trim();
                    if (trimmedValue !== event.currentTarget.value) {
                      handleChange(trimmedValue);
                    }
                  }}
                  placeholder={getParameterLabel(parameter)}
                  required={isMandatory}
                  disabled={isAdmin || !!duplicateErrorMessage}
                  size={smallDevice ? "xs" : "sm"}
                  error={validationErrors[row.original.id]}
                  ref={(el) => {
                    if (el instanceof HTMLInputElement) {
                      inputRefs.current[row.original.id] = el;
                    }
                  }}
                />
              );
            default:
              return (
                <TextInput
                  value={(value as string) ?? ""}
                  onChange={(event) => handleChange(event.currentTarget.value)}
                  placeholder={getParameterLabel(parameter)}
                  required={isMandatory}
                  disabled={isAdmin || !!duplicateErrorMessage}
                  size={smallDevice ? "xs" : "sm"}
                  error={validationErrors[row.original.id]}
                  ref={(el) => {
                    if (el instanceof HTMLInputElement) {
                      inputRefs.current[row.original.id] = el;
                    }
                  }}
                />
              );
          }
        },
      },
    ],
    [
      smallDevice,
      locationOptions,
      validationErrors,
      checkForActualChanges,
      isAdmin,
      tableData,
      meterMapping,
      organizationAddressMapping,
      currentFileData?.extracted_values.MeterDetails,
      currentFileData?.edited_values?.MeterDetails,
      openedSelects,
      fileStatus,
      userAddedMeterIndices,
      hasDuplicateMeterNumber,
      forceUpdateCounter,
    ]
  );

  const table = useMantineReactTable({
    columns,
    data: tableData,
    mantineTableBodyRowProps: ({ row }) => {
      const { editedValue, isHeader } = row.original;
      const hasEditedValue = editedValue != null && editedValue !== "";
      return {
        style: {
          background: hasEditedValue && !isHeader ? "#FFEED8" : "inherit",
        },
      };
    },
    mantinePaperProps: { className: classes.tableStyling },
    mantineTableProps: {
      highlightOnHover: true,
      style: {
        "--table-highlight-on-hover-color": "#F1F3F6 !important",
      },
    },

    ...getMantineTableOptions<DataPoint>(),
  });

  const handleAddMeter = () => {
    const meterHeaderCount = tableData.filter((row) => row.isHeader).length;
    if (meterHeaderCount >= 10) return;

    // Reset validation errors and hide error message
    setValidationErrors({});

    const newIndex = meterHeaderCount;
    const meterParams = ["MeterNumber", "Location", "UnitsConsumed"];

    const newRows: DataPoint[] = [
      {
        id: `meter-header-${newIndex}-manual`,
        parameter: `Meter Details No. ${newIndex + 1}`,
        extractedValue: null,
        editedValue: null,
        isHeader: true,
        meterIndex: newIndex,
        isNew: true,
      },
      ...meterParams.map((param) => ({
        id: `meter-${newIndex}-${param}-manual`,
        parameter: param,
        extractedValue: null,
        editedValue: "",
        meterIndex: newIndex,
        isNew: true,
      })),
    ];

    setTableData((prev) => [...prev, ...newRows]);
    setUserAddedMeterIndices((prev) => [...prev, newIndex]);

    // Scroll to the new meter header
    setTimeout(() => {
      setNewMeterHeaderId(`meter-header-${newIndex}-manual`);
    }, 0);
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (typeof event.data === "string") {
        try {
          const messageData = JSON.parse(event.data);
          if (messageData.type === "DeleteMeterConfirmed") {
            deleteMeter(messageData.meterIndex);
          }
        } catch (e) {
          // Handle JSON parse errors silently
        }
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [deleteMeter]);

  return (
    <Paper bg="#fff" p="20px" radius={10}>
      <Flex justify="space-between" align="center" mb="sm">
        <Text fz={16} fw={600} c="#000000" mb={0}>
          {!isAdmin
            ? `Review ${tableData.filter((row) => !row.isHeader).length} Data Points`
            : "Data Points"}
        </Text>
        <Flex align="center" gap="xs">
          {currentFileData?.verified_at && (
            <Text fz={12} c="#444444">
              On {formatDateDisplay(currentFileData?.verified_at ?? null)}
            </Text>
          )}
          {fileStatus !== "" && (
            <Badge
              color={fileStatus === "Verified" ? "#03F4AC" : "#D9D9D9"}
              fw={400}
              fz="12"
              c="#444"
              px="sm"
              tt="capitalize"
            >
              {fileStatus}
            </Badge>
          )}
        </Flex>
      </Flex>
      {!isAdmin ? (
        <Text fz={12} c="#666666" mb="sm" lh="18px">
          Review and update extracted data for accuracy and completeness. Please
          see if all meters are captured. Add a new one with{" "}
          <Text fz={12} c="#666666" fw={700} span>
            &apos;ADD METER DETAILS&apos;
          </Text>
          . Finally, save all changes by clicking{" "}
          <Text fz={12} c="#666666" fw={700} span>
            &apos;VERIFY AND CONFIRM&apos;
          </Text>
          .
        </Text>
      ) : (
        <Text fz={12} c="#666666" mb="sm" lh="18px">
          Below are the data points extracted from the document along with their
          final updated values.
        </Text>
      )}
      <Box className="themeTable aiTable">
        <MantineProvider theme={aiExtractedDataTableTheme}>
          <MantineReactTable table={table} />
        </MantineProvider>
      </Box>
      {!isAdmin && (
        <Box>
          {duplicateErrorMessage && (
            <Text fz={12} c="#FC4E4E" mt="lg">
              {duplicateErrorMessage}
            </Text>
          )}
          {Object.values(validationErrors).some(Boolean) &&
            validationType === "mandatory" &&
            !duplicateErrorMessage && (
              <Text
                fz={12}
                c="#FC4E4E"
                mt={duplicateErrorMessage ? "0px" : "lg"}
              >
                Please fill in all highlighted mandatory fields to verify.
              </Text>
            )}
          <MantineProvider theme={customButtonTheme}>
            <Flex align="center" mt="md" justify={"space-between"}>
              <Flex align="center" gap={24}>
                <Button
                  variant="unstyled"
                  fw={600}
                  className="noAnimationButton filledGradientButton"
                  fz={12}
                  h={36}
                  lts="0.15rem"
                  radius="xl"
                  onClick={handleVerifyAndConfirm}
                  disabled={duplicateCheckLoading || !!duplicateErrorMessage}
                  loading={duplicateCheckLoading || isLoading}
                >
                  VERIFY AND CONFIRM
                </Button>
                {tableData.filter((row) => row.isHeader).length >= 10 ? (
                  <Tooltip
                    offset={5}
                    label="Max 10 meters allowed. To add another, please delete one."
                    position="bottom-start"
                    multiline
                    withinPortal
                  >
                    <Button
                      variant="outline"
                      color="#003B52"
                      fw={600}
                      fz={12}
                      h={36}
                      lts="0.15rem"
                      radius="xl"
                      disabled={true}
                      className="noAnimationButton outlineButtonHover"
                    >
                      ADD METER DETAILS
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    onClick={handleAddMeter}
                    variant="outline"
                    color="#003B52"
                    fw={600}
                    fz={12}
                    h={36}
                    lts="0.15rem"
                    radius="xl"
                    disabled={!!duplicateErrorMessage}
                    className="noAnimationButton outlineButtonHover"
                  >
                    ADD METER DETAILS
                  </Button>
                )}
              </Flex>
              <div>
                {/* <Tooltip label="Cancel and return to Upload History"> */}
                <Button
                  onClick={() => {
                    const message = {
                      type: "AIUploadHistoryPage",
                      title: "Navigate to Upload History Page",
                      message: ``,
                    };
                    window.parent.postMessage(JSON.stringify(message), "*");
                  }}
                  title="Go back to Upload History"
                  variant="unstyled"
                  color="#003B52"
                  fz={12}
                  h={36}
                  lts="0.15rem"
                  radius="xl"
                  leftSection={<IconChevronLeft size={16} />}
                  className="noAnimationButton underline_btn"
                  styles={{ section: { marginInlineEnd: "4px" } }}
                >
                  BACK
                </Button>
                {/* </Tooltip> */}
              </div>
            </Flex>
          </MantineProvider>
        </Box>
      )}
    </Paper>
  );
};

export default ExtractedDataTable;
