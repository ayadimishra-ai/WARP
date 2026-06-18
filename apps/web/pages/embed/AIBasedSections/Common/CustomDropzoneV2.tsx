import {
  Anchor,
  Box,
  Button,
  Center,
  Divider,
  Flex,
  Progress,
  Text,
  Tooltip
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { IconUpload, IconX } from "@tabler/icons";
import { isURLValid } from "@warp/client/features/form/common-functions";
import AlertIcon from "@warp/client/icons/AlertIcon";
import AlertInfoIcon from "@warp/client/icons/AlertInfoIcon";
import DropzoneUploadIcon from "@warp/client/icons/DropzoneUploadIcon";
import SparkleDropzoneIcon from "@warp/client/icons/SparkleDropzoneIcon";
import SparkleGradientIcon from "@warp/client/icons/SparkleGradientIcon";
import { useGetDocumentLogsLazyQuery } from "@warp/graphql/queries/generated/get-document-logs";
import {
  DocumentLogsStatus,
  DropzoneStatus,
  UploadStatus,
  cardInfoLabel,
  commonValues,
  rejectedFiles
} from "@warp/shared/constants/app.constants";
import { formatFileSize } from "@warp/shared/utils/custom-error.util";
import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import InfoItem from "./InfoItem";
import RatingSummaryBlock from "./RatingSummaryBlock";

interface RaraResponse {
  document_rating: number | null;
  recommendations: string[];
  reason_for_rating: string;
}

const getExpiryStatus = (dateString: string | null): string => {
  if (!dateString) return "";

  try {
    // Remove time component if present (e.g., "2025-11-27T10:30:00" -> "2025-11-27")
    const cleanDateString = dateString.includes("T")
      ? dateString.split("T")[0]
      : dateString;

    // Parse YYYY-MM-DD format
    const parts = cleanDateString.split("-").map((num) => parseInt(num, 10));
    if (parts.length !== 3) {
      throw new Error("Invalid date format - expected YYYY-MM-DD");
    }

    const [expiryYear, expiryMonth, expiryDay] = parts;

    // Validate parsed values
    if (
      expiryMonth < 1 ||
      expiryMonth > 12 ||
      expiryDay < 1 ||
      expiryDay > 31
    ) {
      throw new Error("Invalid date values");
    }

    // Get current date components using local system date
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth() + 1; // getMonth() returns 0-11, so add 1
    const currentDay = today.getDate();

    // Create proper Date objects for accurate comparison
    const expiryDate = new Date(expiryYear, expiryMonth - 1, expiryDay); // month is 0-indexed in Date constructor
    const currentDate = new Date(currentYear, currentMonth - 1, currentDay);

    // Calculate difference in days
    const timeDiff = expiryDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Document expires the day AFTER expiry date (daysDiff < 0 means we're past expiry date)
    if (daysDiff < 0) return "Expired";
    // Show "Expiring Soon" if document expires within 30 days (including expiry date itself)
    if (daysDiff <= 30) return "Expiring Soon";
    // Document is valid for more than 30 days
    return "Valid";
  } catch (error) {
    console.error("Error parsing expiry date:", dateString, error);
    return ""; // fallback: return empty string if date parsing fails
  }
};

interface FileStatus {
  name: string;
  size: number;
  status: UploadStatus;
  metadata: any;
  documentLogsId: string;
}

interface DropzoneCardProps {
  id: string;
  heading: string;
  sampleLink?: string;
  files: FileStatus[];
  acceptedFormats: string[];
  uploadStatus: FileStatus["status"];
  uploadProgress?: number;
  onDrop: (files: File[]) => void;
  onReject?: (files: File[]) => void;
  onDelete: () => void;
  onComplete: () => void;
  onStatusChange?: (status: string) => void;
  onProcessWithAI?: (fileData: {
    documentLogsId: string;
    fileUrl: string;
    fileName: string;
  }) => Promise<void>;
  anyotherDocuments: boolean;
  maxSize: number;
  dataPoint: number;
  warningMessage: string;
  FileProcessingErrorMessage: string;
  isDeleting: boolean;
  insertRejectedFiles: (
    file: rejectedFiles[],
    anyotherDocuments: boolean
  ) => void;
  autoFetched?: boolean;
  expiryDate?: string | null;
  raraResponse?: RaraResponse | null;
  extractionPercentage?: number | string | null;
  isChatSubscriptionActive?: boolean;
  isSystemGenerated?: boolean;
  companyId?: string;
}

const CustomDropzone: React.FC<DropzoneCardProps> = ({
  files,
  heading,
  sampleLink,
  uploadStatus,
  uploadProgress: uploadProgressProp,
  onDrop,
  onDelete,
  onComplete,
  onStatusChange,
  onProcessWithAI,
  anyotherDocuments,
  acceptedFormats,
  maxSize,
  dataPoint,
  warningMessage,
  FileProcessingErrorMessage,
  isDeleting,
  id,
  insertRejectedFiles,
  autoFetched,
  expiryDate,
  raraResponse,
  extractionPercentage,
  isChatSubscriptionActive,
  isSystemGenerated,
  companyId,
}) => {
  const openRef = useRef<() => void>(null);
  const MB = 1024 * 1024; // 1 MB in bytes
  const MAX_SIZE = maxSize * MB;

  let isExpiringOrExpired = false;
  if (expiryDate) {
    const extractedExpiryDate = new Date(expiryDate);
    const currentDate = new Date();
    const timeDiff = extractedExpiryDate.getTime() - currentDate.getTime();
    const daysDiff = Math.ceil(timeDiff / (1000 * 3600 * 24));

    // Only set expiring status if expired (daysDiff < 0) or within 30 days (daysDiff <= 30)
    if (daysDiff < 0 || daysDiff <= 30) {
      isExpiringOrExpired = true;
    }
  }

  const [rejectionMessage, setRejectionMessage] = useState<string | null>(
    !!FileProcessingErrorMessage ? FileProcessingErrorMessage : null
  );
  const [errorTitle, setErrorTitle] = useState<string | null>(
    "View Uploading Error"
  );
  const [errorHeader, setErrorHeader] = useState<string | null>("Upload Error");
  const [localExtractionPercentage, setLocalExtractionPercentage] = useState<string | null>(null);
  const [getDocumentLogs] = useGetDocumentLogsLazyQuery();

  // Extract documentLogsId to avoid re-running effect when files array reference changes
  const documentLogsId = files?.[0]?.documentLogsId;

  React.useEffect(() => {
    // Only poll when: processing status + have IDs
    if (uploadStatus !== DropzoneStatus.processing || !documentLogsId || !companyId) {
      return;
    }

    let intervalId: NodeJS.Timeout | undefined;

    const pollExtractionProgress = async () => {
      try {
        const result = await getDocumentLogs({
          variables: {
            where: {
              id: { _eq: documentLogsId },
              companyId: { _eq: companyId }
            }
          },
          fetchPolicy: "no-cache",
        });

        const log = result.data?.DocumentLogs?.[0];
        
        if (!log) return;

        const { extractionPercentage, status } = log;
        
        // Update percentage in local state
        if (extractionPercentage !== null && extractionPercentage !== undefined) {
          const percentageValue = String(extractionPercentage);
          setLocalExtractionPercentage(percentageValue);
        } else {
          console.log(`[${id}] No extractionPercentage in DB yet`);
        }

        // Stop polling when complete
        if (status === DocumentLogsStatus.Success || status === DocumentLogsStatus.Processed) {
          onStatusChange?.(DropzoneStatus.complete);
          if (intervalId) clearInterval(intervalId);
        }
      } catch (error) {
        console.error(`[${id}] Polling error:`, error);
      }
    };
    pollExtractionProgress();
    intervalId = setInterval(pollExtractionProgress, 5 * 1000);

    return () => {
      if (intervalId) {
        console.log(`[${id}] Stopping polling`);
        clearInterval(intervalId);
      }
    };
  }, [uploadStatus, companyId, documentLogsId, onStatusChange, getDocumentLogs, id]);
  
  const [rejectedFileName, setRejectedFileName] = useState<string | null>(null);
  const [invalidTypeErrorFile, setInvalidTypeErrorFile] =
    useState<boolean>(false);
  const [validDroppedFiles, setValidDroppedFiles] = useState<File[]>([]);
  const [invalidDroppedFiles, setInvalidDroppedFiles] = useState<File[]>([]);

  // AI Processing handler - delegates to parent component
  const handleProcessWithAI = async () => {
    if (!onProcessWithAI) {
      console.error("No onProcessWithAI callback provided");
      return;
    }

    if (!files || files.length === 0) {
      console.error("No files available for AI processing");
      return;
    }

    const fileToProcess = files[0];
    if (!fileToProcess.documentLogsId || !fileToProcess.metadata?.Location) {
      console.error("Missing document log ID or file URL for AI processing");
      return;
    }

    try {
      // Call the parent component's callback with file data
      await onProcessWithAI({
        documentLogsId: fileToProcess.documentLogsId,
        fileUrl: fileToProcess.metadata.Location,
        fileName: fileToProcess.name,
      });
    } catch (error: any) {
      console.error("Error during AI processing callback:", error);
    }
  };

  const handleFileDrop = useCallback(
    async (files: File[]) => {
      if (!!files) {
        if (files.length === 0) {
          setRejectionMessage("Unknown error occurred.");
          setErrorTitle("Invalid File Type");
        }
      } else {
        setRejectionMessage("Unknown error occurred.");
        setErrorTitle("Invalid File Type");
        return;
      }
      let acceptedFiles: File[] = [];
      let rejectedFiles: rejectedFiles[] = [];
      const acceptedMimeTypes =
        !!acceptedFormats && acceptedFormats.length > 0
          ? acceptedFormats.map(
              (format) => MIME_TYPES[format as keyof typeof MIME_TYPES]
            )
          : [];
      files.forEach((file) => {
        if (file.size > MAX_SIZE) {
          let rejectionMessage = `File is larger than ${MAX_SIZE} bytes`;
          rejectedFiles.push({ file, rejectionMessage });
          return;
        }
        if (
          acceptedMimeTypes.includes(
            file.type as typeof MIME_TYPES[keyof typeof MIME_TYPES]
          )
        ) {
          // File matches accepted formats
          acceptedFiles.push(file);
        } else {
          // Handle rejection cases
          setRejectedFileName(file.name);
          let rejectionMessage =
            !!acceptedFormats && acceptedFormats.length > 0
              ? `Invalid file format. Accepted formats are: ${acceptedFormats
                  .map((format) => `.${format}`)
                  .join(", ")}`
              : "Invalid file type";
          let errorTitle = "Invalid File Type";

          setRejectionMessage(rejectionMessage);
          setErrorTitle(errorTitle);
          rejectedFiles.push({ file, rejectionMessage });
        }
      });
      if (!!acceptedFiles && acceptedFiles.length > 0) {
        // If at least one valid file exists, call onDrop for valid files
        onDrop(acceptedFiles);
      }

      if (!!rejectedFiles && rejectedFiles.length > 0) {
        // Continue rejection handling for invalid files
        await insertRejectedFiles(rejectedFiles, anyotherDocuments);
        setInvalidTypeErrorFile((prev) => !prev);
      }
    },
    [
      acceptedFormats,
      MAX_SIZE,
      onDrop,
      insertRejectedFiles,
      anyotherDocuments,
      setRejectedFileName,
      setRejectionMessage,
      setErrorTitle,
      setInvalidTypeErrorFile,
    ]//TODO: Need to check these dependencies
  );

  useEffect(() => {
    if (validDroppedFiles.length > 0 || invalidDroppedFiles.length > 0) {
      const allFiles = [...validDroppedFiles, ...invalidDroppedFiles];
      const limitedFiles = allFiles.slice(
        0,
        anyotherDocuments ? commonValues.maxFilesAllowedInAnyOther : 1
      );
      handleFileDrop(limitedFiles);
      //Clear state after processing to prevent re-trigger on parent re-render
      setValidDroppedFiles([]);
      setInvalidDroppedFiles([]);
    }
  }, [
    validDroppedFiles,
    invalidDroppedFiles,
    anyotherDocuments,
    handleFileDrop,
  ]);//TODO: Need to check these dependencies

  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>(
    () => {
      if (typeof window !== "undefined") {
        const storedProgress = localStorage.getItem(`uploadProgress_${id}`);
        return storedProgress ? { [id]: JSON.parse(storedProgress) } : {};
      }
      return {};
    }
  );

  React.useEffect(() => {
    if (uploadProgressProp !== undefined) {
      setUploadProgress({ [id]: uploadProgressProp });
      return; 
    }
    const progressKey = `uploadProgress_${id}`;
    let interval: NodeJS.Timeout | undefined;

    const getProgress = () => {
      if (typeof window !== "undefined") {
        const storedProgress = localStorage.getItem(progressKey);

        if (!storedProgress) {
          if (interval) clearInterval(interval);
          return;
        }

        const parsedProgress = JSON.parse(storedProgress);

        setUploadProgress((prev) => {
          if (prev[id] !== parsedProgress) {
            return { ...prev, [id]: parsedProgress };
          }
          return prev;
        });

        if (parsedProgress >= 100) {
          if (interval) clearInterval(interval);
        }
      }
    };

    getProgress();
    interval = setInterval(getProgress, 1000);

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [id, uploadProgressProp]);

  React.useEffect(() => {
    if (!!files && files.length > 0) {
      const validateURL = () => {
        if (!files[0]?.metadata?.Location) return;

        const isValid = isURLValid(files[0].metadata.Location);

        setErrorTitle(
          !!FileProcessingErrorMessage
            ? isValid
              ? "View Processing Error"
              : "View Uploading Error"
            : null
        );

        setErrorHeader(
          !!FileProcessingErrorMessage
            ? isValid
              ? "Processing Error"
              : "Upload Error"
            : ""
        );
      };

      if (files[0]?.status === DropzoneStatus.error) {
        validateURL();
      } else {
        // CRITICAL: Clear error states when status is NOT error
        setErrorTitle(null);
        setErrorHeader("");
        setRejectionMessage(null);
      }
    }
  }, [FileProcessingErrorMessage, files]);

  const fileUploadStatus = (): JSX.Element | null => {
    switch (uploadStatus) {
      case DropzoneStatus.uploading:
        return (
          <Flex align="center" gap="10px">
            <Text c="#FFA93C" fz="12px" lh="15.22px" fw="400" fs="italic">
              Uploading...
            </Text>
            <Progress
              value={uploadProgress[id] || 0}
              size={6}
              color="#FFA93C"
              w="80px"
            />
          </Flex>
        );
      case "pending":
        return (
          <Flex align="center" justify="center" gap="10px">
            <Text c="yellow" fz="12px" lh="15.22px" fw="400" fs="italic">
              {/* File Uploaded, pending for processing */}
            </Text>
          </Flex>
        );
      case DropzoneStatus.processing:
        return (
          <Flex align="center" gap="10px">
            <Text
              fz="12px"
              lh="15.22px"
              fw="400"
              fs="italic"
              variant="gradient"
              gradient={{ from: "#00A7E3", to: "#AE41F6", deg: 270.44 }}
            >
              Extraction...
            </Text>
            <Progress
              value={
                (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === null ||
                (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === undefined
                  ? 0
                  : typeof (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === "number"
                  ? Math.min(100, Math.max(0, Number(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage)))
                  : parseInt(String(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage)) || 0
              }
              size={6}
              w="80px"
              styles={{
                bar: {
                  background:
                    "linear-gradient(270.44deg, #00A7E3 0.03%, #DCB2FF 52.88%, #AE41F6 99.96%)",
                },
              }}
            />
            <Text c="#038FC7" fz="12px" lh="15.22px" fw="400">
              {(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === null ||
              (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === undefined
                ? "0%"
                : typeof (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === "number"
                ? `${Math.min(100, Math.max(0, Number(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage)))}%`
                : `${parseInt(String(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage)) || 0}%`}
            </Text>
          </Flex>
        );
      case DropzoneStatus.ProcessingError:
        return (
          <Flex align="center" gap="10px">
            <Text c="#DD3E3E" fz="12px" lh="15.22px" fw="400" fs="italic">
              AI Process failed...
            </Text>
            <Progress
              value={
                (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === null ||
                (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === undefined
                  ? 0
                  : typeof (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === "number"
                  ? Math.min(100, Math.max(0, Number(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage)))
                  : parseInt(String(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage)) || 0
              }
              size={6}
              color="#DD3E3E"
              w="80px"
            />
            <Text c="#DD3E3E" fz="12px" lh="15.22px" fw="400">
              {(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === null ||
              (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === undefined
                ? "0%"
                : typeof (localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage) === "number"
                ? `${Math.min(100, Math.max(0, Number(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage)))}%`
                : `${parseInt(String(localExtractionPercentage !== null ? localExtractionPercentage : extractionPercentage)) || 0}%`}
            </Text>
          </Flex>
        );
      case DropzoneStatus.complete:
      // return (
      //   <Text c="#003B52" fz="12px" lh="15.22px" fw="500">
      //     {dataPoint} Data Point Added
      //   </Text>
      // );
      default:
        if (
          uploadStatus !== DropzoneStatus.uploaded &&
          uploadStatus !== DropzoneStatus.error &&
          !isSystemGenerated &&
          !isExpiringOrExpired &&
          uploadStatus !== DropzoneStatus.complete &&
          uploadStatus !== DropzoneStatus.ProcessingError
        ) {
          return (
            <Text c="#1A1A1A" fz="12px" lh="18px" fw="400">
              Drag and drop
            </Text>
          );
        }
        return null;
    }
  };
  // const isComplete =
  //   uploadStatus === DropzoneStatus.complete &&
  //   (!FileProcessingErrorMessage || !warningMessage);
  //If RARA warning present, then only display InfoIcon
  const cardInfoTooltip = (() => {
    if (warningMessage && files.length > 0) return warningMessage;
    if (autoFetched) return "True";
    return undefined;
  })();

  const AIChatActiveProcessing =
    isChatSubscriptionActive && uploadStatus === DropzoneStatus.processing;
  const AIChatActiveCompleted =
    isChatSubscriptionActive && uploadStatus === DropzoneStatus.complete;
  const autoFetchedCard =
    autoFetched && uploadStatus === DropzoneStatus.uploaded;
  const dropzoneStyles = (() => {
    // System generated should be checked first to take priority
    if (isSystemGenerated) return { bg: "#DCFCF8", borderColor: "#1C9689" };

    if (
      (expiryDate && getExpiryStatus(expiryDate) === "Expired") ||
      uploadStatus === DropzoneStatus.ProcessingError
    )
      return { bg: "#FFE9E9", borderColor: "#DD3E3E" };
    if (cardInfoTooltip) return { bg: "#FFF5E9", borderColor: "#FFA93C" };
    if (AIChatActiveProcessing || (AIChatActiveCompleted && !cardInfoTooltip))
      return { bg: "#D4EDF6", borderColor: "#038FC7", hasGradientBorder: true };

    if (autoFetchedCard) return { bg: "#DCFCF8", borderColor: "#1C9689" };
    if (uploadStatus === DropzoneStatus.error)
      return { bg: "rgba(252, 78, 78, 0.1)", borderColor: "#DD3E3E" };
    if (uploadStatus === DropzoneStatus.uploaded)
      return { bg: "#FFF5E9", borderColor: "#FFA93C" };
    if (uploadStatus === DropzoneStatus.processing)
      return { bg: "#D4EDF6", borderColor: "#038FC7" };
    if (uploadStatus === DropzoneStatus.complete)
      return { bg: "#D4EDF6", borderColor: "#038FC7" };
    return { bg: "#fff", borderColor: "#038FC7" };
  })();

  const cardInfoLable = (() => {
    if (autoFetchedCard) return cardInfoLabel?.AutoFetch;
    if (FileProcessingErrorMessage) return "";
    // if (uploadStatus === DropzoneStatus.uploaded)
    //   return cardInfoLabel?.Uploaded;
    // if (uploadStatus === DropzoneStatus.processing)
    //   return cardInfoLabel?.Processing;
    // if (uploadStatus === DropzoneStatus.complete)
    //   return cardInfoLabel?.Processed;
    if (isSystemGenerated) return cardInfoLabel?.SystemGenerated;
    if (isExpiringOrExpired)
      return expiryDate && expiryDate !== null
        ? getExpiryStatus(expiryDate)
        : cardInfoLabel?.Expiring;
    if (
      uploadStatus === DropzoneStatus.idle ||
      uploadStatus === DropzoneStatus.error
    )
      return "";
    return undefined;
  })();

  //Helper function to format expiry dates
  const formatExpiryDate = (expiryDate: string) => {
    const date = new Date(expiryDate);
    const day = date.getDate();
    const month = date.toLocaleDateString("en-GB", { month: "short" });
    const year = date.getFullYear();
    const ordinalSuffix = (day: number) => {
      if (day > 3 && day < 21) return "th";
      switch (day % 10) {
        case 1:
          return "st";
        case 2:
          return "nd";
        case 3:
          return "rd";
        default:
          return "th";
      }
    };
    return `${day}${ordinalSuffix(day)} ${month} ${year}`;
  };

  //If RARA warning present, then only display InfoIcon
  // const expiryInfoTooltip = (() => {
  //   if (uploadStatus === DropzoneStatus.expiring && expiryDate) {
  //     const expiryStatus = getExpiryStatus(expiryDate);
  //     const formattedDate = formatExpiryDate(expiryDate);

  //     if (expiryStatus === "Expired") {
  //       return `This document has been expired on ${formattedDate}. Kindly upload the latest document.`;
  //     } else if (expiryStatus === "Expiring Soon") {
  //       return `This document will be expired on ${formattedDate}. You can upload latest available document.`;
  //     }
  //   }

  //   return undefined;
  // })();

  const showStatusIcon =
    (!!files &&
      files.length > 0 &&
      !FileProcessingErrorMessage &&
      (warningMessage ||
        [
          DropzoneStatus.complete,
          DropzoneStatus.processing,
          DropzoneStatus.pending,
          DropzoneStatus.uploaded,
          DropzoneStatus.error,
        ].includes(uploadStatus))) ||
    isExpiringOrExpired ||
    // Special case: Always show badge for system-generated documents, even without files
    isSystemGenerated;

  const showStatusIconStyle = (() => {
    if (autoFetchedCard) return "#1C9689";
    if (isSystemGenerated) return "#1C9689";
    if (uploadStatus === DropzoneStatus.uploaded) return "#FFA93C";
    if (uploadStatus === DropzoneStatus.processing) return "#038FC7";
    if (isExpiringOrExpired) return "#DD3E3E";
    return "#005C81";
  })();
  return (
    <Box
      pos="relative"
      sx={
        dropzoneStyles.hasGradientBorder
          ? {
              padding: 1,
              borderRadius: 10,
              background:
                "linear-gradient(270.44deg, #00A7E3 0.03%, #DCB2FF 52.88%, #AE41F6 99.96%)",
              backfaceVisibility: "hidden",
              willChange: "transform",
            }
          : undefined
      }
    >
      <Dropzone
        openRef={openRef}
        onDrop={(files) => {
          setValidDroppedFiles(() => [...files]);
        }}
        onReject={(files) => {
          // Silently accept the first `limit` files and ignore the rest.
          const allFiles = files.map((item) => item.file);
          const limit = anyotherDocuments
            ? commonValues.maxFilesAllowedInAnyOther
            : 1;

          if (!allFiles || allFiles.length === 0) return;

          const allowed = allFiles.slice(0, limit);
          if (allowed.length > 0) {
            // Hand the allowed files to the normal flow; do not show any UI messages.
            setValidDroppedFiles(allowed);
          }
        }}
        accept={
          !!acceptedFormats && acceptedFormats.length > 0
            ? acceptedFormats.map(
                (format) => MIME_TYPES[format as keyof typeof MIME_TYPES]
              )
            : []
        }
        maxFiles={
          anyotherDocuments ? commonValues.maxFilesAllowedInAnyOther : 1
        }
        multiple={anyotherDocuments}
        radius={10}
        h={291}
        p="0px"
        bg="#ffffff"
        styles={{
          root: {
            borderWidth: "1px",
            borderStyle: "solid",
            borderRadius: 10,
            borderColor: dropzoneStyles.hasGradientBorder
              ? "transparent"
              : dropzoneStyles.borderColor,
            boxShadow: "0px 4px 6px 0px rgba(11, 39, 50, 0.15)",
            // "&:hover": {
            //   backgroundColor: dropzoneStyles.bg,
            // },
          },
        }}
        disabled={
          uploadStatus === DropzoneStatus.uploading ||
          uploadStatus === DropzoneStatus.uploaded ||
          uploadStatus === DropzoneStatus.error ||
          uploadStatus === DropzoneStatus.processing ||
          uploadStatus === DropzoneStatus.complete ||
          isSystemGenerated ||
          isExpiringOrExpired
        }
      >
        {/* {uploadStatus} */}
        <Box px={18}>
          <Dropzone.Accept>
            <IconUpload size={0} style={{ position: "absolute" }} />
          </Dropzone.Accept>
          <Dropzone.Reject>
            <IconX size={0} style={{ position: "absolute" }} />
          </Dropzone.Reject>
          <Box
            sx={{
              position: "absolute",
              top: 31,
              left: 0,
              right: 0,
              bottom: 0,
              textAlign: "center",
              zIndex: 0,
              pointerEvents: "none",
            }}
          >
            {(() => {
              // If AI is enabled, prioritize sparkle icon for AI-processed statuses
              if (isChatSubscriptionActive) {
                const aiProcessedStatuses = [
                  DropzoneStatus.processed,
                  DropzoneStatus.processing,
                  DropzoneStatus.complete,
                ];

                // Show sparkle for AI-processed statuses (excluding system-generated with uploaded status)
                if (aiProcessedStatuses.includes(uploadStatus)) {
                  // Special case: If it's system-generated and status is uploaded, show upload icon
                  if (
                    isSystemGenerated &&
                    uploadStatus === DropzoneStatus.uploaded
                  ) {
                    return <DropzoneUploadIcon width={150} height={150} />;
                  }
                  return <SparkleDropzoneIcon width={150} height={150} />;
                }

                // Show sparkle for system-generated documents with processed statuses
                if (
                  isSystemGenerated &&
                  (uploadStatus === DropzoneStatus.complete ||
                    uploadStatus === DropzoneStatus.processed)
                ) {
                  return <SparkleDropzoneIcon />;
                }

                // Show triangle only for ProcessingError when there's a tooltip
                if (
                  cardInfoTooltip &&
                  uploadStatus === DropzoneStatus.ProcessingError
                ) {
                  return (
                    <AlertIcon/>
                  );
                }

                // Show sparkle for expired documents when AI is enabled
                if (isExpiringOrExpired) {
                  return <SparkleDropzoneIcon />;
                }
              } else {
                // AI is disabled - show triangle for warnings
                if (cardInfoTooltip) {
                  if (
                    uploadStatus === DropzoneStatus.uploaded ||
                    isExpiringOrExpired
                  ) {
                    return (
                      <AlertIcon/>
                    );
                  }
                }
              }

              // Default case - show upload icon
              return <DropzoneUploadIcon />;
            })()}
          </Box>

          <Flex
            align="center"
            justify="center"
            direction="column"
            sx={{ zIndex: 1 }}
            px={22}
          >
            {rejectionMessage &&
            uploadStatus !== DropzoneStatus.ProcessingError ? (
              <Box mt="73px" h="30px">
                <Text c="#FC4E4E" fz="12px" lh="15.22px" fw="400" fs="italic">
                  {errorHeader}
                </Text>
              </Box>
            ) : (
              <Box mt="73px" h="30px">
                {![
                  DropzoneStatus.uploading,
                  DropzoneStatus.processing,
                  DropzoneStatus.ProcessingError,
                ].includes(uploadStatus) && <Box>{fileUploadStatus()}</Box>}
              </Box>
            )}

            <Text
              variant={
                AIChatActiveProcessing || AIChatActiveCompleted
                  ? "gradient"
                  : undefined
              }
              gradient={
                AIChatActiveProcessing || AIChatActiveCompleted
                  ? { from: "#00A7E3", to: "#AE41F6", deg: 270.44 }
                  : undefined
              }
              c="#122F47"
              fz="18px"
              lh="22.82px"
              fw="400"
              h={raraResponse ? "" : "48px"}
              align="center"
              lineClamp={raraResponse ? 1 : 2}
              mb="8px"
              sx={{
                wordBreak: "break-word",
                pointerEvents: "auto",
              }}
              title={heading}
            >
              {heading}
            </Text>
            {/* Show RatingSummaryBlock when we have files and either raraResponse exists or should show rating unavailable */}
            {raraResponse && (
              <Box pos="absolute" top={131}>
                <RatingSummaryBlock
                  rating={raraResponse?.document_rating}
                  documentName={files[0]?.name || ""}
                  documentUrl={files[0]?.metadata?.Location || ""}
                  ratingContent={raraResponse?.reason_for_rating || ""}
                  recommendations={raraResponse?.recommendations}
                  tooltipContent={
                    raraResponse?.document_rating == undefined ||
                    raraResponse?.document_rating == null
                      ? "RARA rating is not available for this document."
                      : "The AI has analyzed the document and provided a rating based on Relevance, Accessibility, and Productivity. Click for detailed insights."
                  }
                />
              </Box>
            )}
            {!!files && files.length > 0 ? (
              <Box pos="absolute" top={160}>
                {rejectionMessage &&
                uploadStatus !== DropzoneStatus.ProcessingError ? (
                  <Text
                    sx={{
                      zIndex: 10,
                      pointerEvents: "auto",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    c={errorHeader === "Processing Error" ? "blue" : "red"}
                    fz="12px"
                    lh="15.22px"
                    fw="400"
                    w="230px"
                    align="center"
                    title={files[0].name}
                  >
                    {files[0].name}
                  </Text>
                ) : (
                  <Anchor
                    sx={{
                      zIndex: 2,
                      pointerEvents: "auto",
                    }}
                    c="#228be6"
                    fz="12px"
                    lh="18px"
                    fw="400"
                    href={files[0].metadata?.Location}
                    target="_blank"
                    align="center"
                    title={files[0].name}
                    lineClamp={1}
                    px={20}
                  >
                    {files[0].name}
                  </Anchor>
                )}
                {(!rejectionMessage ||
                  uploadStatus === DropzoneStatus.ProcessingError) && (
                  <Text c="#838B8F" fz="12px" lh="18px" align="center">
                    Uploaded File size: {formatFileSize(files[0].size)}
                  </Text>
                )}
                <Box
                  sx={{
                    zIndex: 10,
                    pointerEvents: "auto",
                  }}
                >
                  {rejectionMessage &&
                  uploadStatus !== DropzoneStatus.ProcessingError ? (
                    <Box
                      sx={{
                        zIndex: 10,
                        pointerEvents: "auto",
                      }}
                    >
                      <Tooltip
                        multiline
                        width={300}
                        withArrow
                        arrowSize={10}
                        label={rejectionMessage}
                        openDelay={50}
                        closeDelay={50}
                      >
                        <Text c="#FC4E4E" fz="12px" lh="18px">
                          {errorTitle}
                          <Divider m="0" color="#FC4E4E" />
                        </Text>
                      </Tooltip>
                    </Box>
                  ) : (
                    ""
                  )}
                </Box>
              </Box>
            ) : (
              <Box pos="absolute" top={160}>
                {rejectedFileName && (
                  <Text
                    sx={{
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      whiteSpace: "nowrap",
                    }}
                    c="#FC4E4E"
                    fz="12px"
                    lh="15.22px"
                    fw="400"
                    w="230px"
                    align="center"
                  >
                    {rejectedFileName}
                  </Text>
                )}
                {rejectionMessage && (
                  <Box
                    sx={{
                      zIndex: 10,
                      pointerEvents: "auto",
                    }}
                  >
                    <Tooltip
                      multiline
                      width={300}
                      withArrow
                      arrowSize={10}
                      label={rejectionMessage ? rejectionMessage : ""}
                      openDelay={50}
                      closeDelay={50}
                    >
                      <Text c="#FC4E4E" fz="12px" lh="18px">
                        {rejectedFileName}
                        {errorTitle}
                        <Divider m="0" color="#FC4E4E" />
                      </Text>
                    </Tooltip>
                  </Box>
                )}
                {!rejectionMessage && (
                  <>
                    <Text c="#838B8F" fz="12px" lh="18px" align="center">
                      Accepted formats:{" "}
                      {!!acceptedFormats && acceptedFormats.length > 0
                        ? acceptedFormats
                            .map((format) => `.${format}`)
                            .join(", ")
                        : ""}
                      <Text>
                        Max size: {maxSize} MB
                      </Text>
                    </Text>
                  </>
                )}
              </Box>
            )}
            {/* Status Badges for Uploaded Files */}
            {showStatusIcon && isSystemGenerated && (
              <Flex
                pos="absolute"
                top={17}
                right={17}
                gap={isExpiringOrExpired ? 10 : 0}
                align="center"
                sx={{
                  zIndex: 3,
                  pointerEvents: "auto",
                }}
              >
                {/* Primary Status Badge */}
                <Flex
                  h="22px"
                  pl="15px"
                  bg={
                    isSystemGenerated
                      ? showStatusIconStyle
                      : isExpiringOrExpired
                      ? "#FFA93C"
                      : showStatusIconStyle
                  }
                  align="center"
                  justify="center"
                  sx={{
                    zIndex: 3,
                    pointerEvents: "auto",
                    paddingRight: autoFetchedCard
                      ? 35
                      : autoFetchedCard || (isSystemGenerated && warningMessage)
                      ? 30
                      : autoFetchedCard || isSystemGenerated
                      ? 28
                      : 12,
                    borderRadius: "20px",
                  }}
                >
                  <Box pr={warningMessage ? "15px" : "0px"}>
                    <InfoItem
                      label={
                        isExpiringOrExpired
                          ? cardInfoLabel?.Uploaded
                          : cardInfoLable
                      }
                      c="#fff"
                      fz="12px"
                      lh="16px"
                      info={cardInfoTooltip}
                      infoIconTop="-0.5px"
                      iconColor="#fff"
                      iconSize={16}
                      warningInfo={true}
                      warningMessage
                      autoFetched={autoFetchedCard}
                    />
                  </Box>

                  {/* Info icons for System Generated */}
                  {isSystemGenerated && (
                    <Box pos="absolute" right="25px">
                      <InfoItem
                        label={""}
                        c="#fff"
                        fz="12px"
                        lh="16px"
                        info={
                          "This document was automatically created by the system when the assessment/report was submitted. System-generated documents can be used as a source to fetch data for your future assessments/reports."
                        }
                        infoIconTop="-9px"
                        iconColor="#fff"
                        iconSize={16}
                        warningInfo={false}
                        warningMessage={false}
                      />
                    </Box>
                  )}

                  {/* {autoFetchedCard && (
                    <Box pos="absolute" right="46px">
                      <InfoItem
                        label={""}
                        c="#fff"
                        fz="12px"
                        lh="16px"
                        info={
                          "This document was automatically fetched from your existing assessments."
                        }
                        infoIconTop="-9px"
                        iconColor="#fff"
                        iconSize={16}
                        warningInfo={false}
                        warningMessage={false}
                      />
                    </Box>
                  )} */}
                </Flex>

                {/* Expiry Status Badge (only for expiring documents) */}
                {/* {uploadStatus === DropzoneStatus.expiring && (
                  <Flex
                    h="22px"
                    pl="15px"
                    bg="#DD3E3E"
                    align="center"
                    justify="center"
                    sx={{
                      paddingRight: 28,
                      borderRadius: "20px",
                    }}
                  >
                    <Box>
                      <InfoItem
                        label={
                          expiryDate
                            ? getExpiryStatus(expiryDate)
                            : cardInfoLabel?.Expiring
                        }
                        c="#fff"
                        fz="12px"
                        lh="16px"
                        info={expiryInfoTooltip}
                        infoIconTop="-0.5px"
                        iconColor="#fff"
                        iconSize={16}
                        warningInfo={true}
                      />
                    </Box>
                  </Flex>
                )} */}
              </Flex>
            )}

            {/* {uploadStatus === DropzoneStatus.complete && (
              <Box pos="absolute" top={10} left={10}>
                {!!FileProcessingErrorMessage ? (
                  <IconCircleX stroke={2} color="#810000" />
                ) : (
                  <IconCircleCheck stroke={2} color="#005C81" />
                )}
              </Box>
            )} */}
            {/* rara warning message top left icon */}
            {(uploadStatus === DropzoneStatus.uploaded ||
              uploadStatus === DropzoneStatus.processing ||
              uploadStatus === DropzoneStatus.complete ||
              uploadStatus === DropzoneStatus.ProcessingError ||
              isExpiringOrExpired ||
              uploadStatus === DropzoneStatus.processed) &&
              cardInfoTooltip && (
                <Tooltip
                  label={cardInfoTooltip}
                  withArrow
                  withinPortal
                  multiline
                  width={300}
                  arrowSize={10}
                  openDelay={50}
                  closeDelay={50}
                >
                  <Box
                    pos="absolute"
                    top={17}
                    left={17}
                    sx={{ zIndex: 9999, pointerEvents: "auto" }}
                  >
                    <AlertInfoIcon />
                  </Box>
                </Tooltip>
              )}
            {expiryDate && (
              <Text
                pos="absolute"
                top={20.7}
                right={17}
                c="#DD3E3E"
                fz="12px"
                lh="16px"
                fw={400}
                h={16}
              >
                {(() => {
                  const expiryStatus = getExpiryStatus(expiryDate);
                  const formattedDate = formatExpiryDate(expiryDate);

                  if (expiryStatus === "Expired") {
                    return `Expired on ${formattedDate}`;
                  } else if (expiryStatus === "Expiring Soon") {
                    return `Expires on ${formattedDate}`;
                  }
                  return "";
                })()}
              </Text>
            )}
          </Flex>
        </Box>
      </Dropzone>
      {/* <Center
        sx={{
          position: "absolute",
          right: 0,
          bottom: "83px",
          left: 0,
        }}
      >
        {!!files && files.length > 0 && (
          <>
            {raraMessage && (
              <InfoItem
                label="Invalid File"
                c="red"
                fz="12px"
                lh="18px"
                info={raraMessage}
                infoIconTop="-3px"
                iconColor="red"
              />
            )}
          </>
        )}
        {rejectionMessage && (
          <>
            <InfoItem
              label="Invalid File"
              c="red"
              fz="12px"
              lh="18px"
              info={rejectionMessage}
              infoIconTop="-3px"
              iconColor="red"
            />
          </>
        )}
      </Center> */}
      <Center pos="absolute" left={0} right={0} top={208} h={36}>
        {uploadStatus === DropzoneStatus.idle && !invalidTypeErrorFile && (
          <Button color="solidBtn" onClick={() => openRef.current?.()}>
            CHOOSE FILE{anyotherDocuments && "S"} TO UPLOAD
          </Button>
        )}
        {isChatSubscriptionActive &&
          uploadStatus === DropzoneStatus.uploaded &&
          files &&
          files.length > 0 &&
          !rejectionMessage &&
          !isSystemGenerated && (
            <Button
              color="aiGradientBtn"
              leftIcon={<SparkleGradientIcon />}
              onClick={handleProcessWithAI}
            >
              Process with AI
            </Button>
          )}
        {isChatSubscriptionActive &&
          isSystemGenerated &&
          uploadStatus !== DropzoneStatus.processing &&
          uploadStatus !== DropzoneStatus.complete &&
          uploadStatus !== DropzoneStatus.processed && (
            <Button
              color="aiGradientBtn"
              leftIcon={<SparkleGradientIcon />}
              onClick={handleProcessWithAI}
            >
              Process with AI
            </Button>
          )}
        {uploadStatus !== DropzoneStatus.complete &&
          [
            DropzoneStatus.uploading,
            DropzoneStatus.processing,
            DropzoneStatus.ProcessingError,
          ].includes(uploadStatus) && <Box>{fileUploadStatus()}</Box>}
      </Center>
      <Center pos="absolute" right={0} top={254} left={0}>
        <Flex align="center" gap="30px">
          {!isSystemGenerated &&
            uploadStatus !== DropzoneStatus.uploading &&
            uploadStatus !== DropzoneStatus.processing &&
            (uploadStatus === DropzoneStatus.complete ||
              uploadStatus === DropzoneStatus.pending ||
              uploadStatus === DropzoneStatus.error ||
              uploadStatus === DropzoneStatus.uploaded ||
              isExpiringOrExpired ||
              uploadStatus === DropzoneStatus.ProcessingError ||
              invalidTypeErrorFile) && (
              <Anchor
                type="button"
                c="#DD3E3E"
                fz={12}
                lh="18px"
                fw={500}
                lts="0.15rem"
                tt="uppercase"
                underline={false}
                onClick={() => {
                  if (!isDeleting) {
                    onDelete();
                  }
                }}
              >
                {isDeleting ? "DELETING" : "DELETE"}
              </Anchor>
            )}
          {isChatSubscriptionActive &&
            uploadStatus === DropzoneStatus.ProcessingError && (
              <Anchor
                type="button"
                variant="gradient"
                gradient={{ from: "#00A7E3", to: "#AE41F6", deg: 270.44 }}
                fz={12}
                lh="18px"
                fw={500}
                lts="0.15rem"
                tt="uppercase"
                underline={false}
                onClick={handleProcessWithAI}
              >
                Retry AI process
              </Anchor>
            )}
        </Flex>
      </Center>
      {sampleLink && (
        <Button
          variant="white"
          c="#0B7D76"
          bg="transparent"
          p="0px"
          fz="12px"
          lh="18px"
          fw={400}
          lts="1.5px"
          onClick={() => window.open(sampleLink, "_blank")}
          w={160}
          h={18}
          pos="absolute"
          left="calc(50% - 75px)"
          right={0}
          bottom={15}
        >
          DOWNLOAD SAMPLE
        </Button>
      )}
    </Box>
  );
};

// Custom comparison function for React.memo to prevent unnecessary re-renders
// Only re-render when props that affect the visual output actually change
// BUG FIX: React.memo was blocking re-renders during upload because uploadProgress wasn't checked in comparison.
// Fixed by adding uploadProgress check so component re-renders on every progress update (0% → 100%) for smooth animation.
const arePropsEqual = (
  prevProps: DropzoneCardProps,
  nextProps: DropzoneCardProps
): boolean => {
  // Check primitive props first (cheap comparisons)
  if (
    prevProps.id !== nextProps.id ||
    prevProps.heading !== nextProps.heading ||
    prevProps.sampleLink !== nextProps.sampleLink ||
    prevProps.uploadStatus !== nextProps.uploadStatus ||
    prevProps.uploadProgress !== nextProps.uploadProgress ||
    prevProps.anyotherDocuments !== nextProps.anyotherDocuments ||
    prevProps.maxSize !== nextProps.maxSize ||
    prevProps.dataPoint !== nextProps.dataPoint ||
    prevProps.warningMessage !== nextProps.warningMessage ||
    prevProps.FileProcessingErrorMessage !==
      nextProps.FileProcessingErrorMessage ||
    prevProps.isDeleting !== nextProps.isDeleting ||
    prevProps.autoFetched !== nextProps.autoFetched ||
    prevProps.expiryDate !== nextProps.expiryDate ||
    prevProps.extractionPercentage !== nextProps.extractionPercentage ||
    prevProps.isChatSubscriptionActive !== nextProps.isChatSubscriptionActive ||
    prevProps.isSystemGenerated !== nextProps.isSystemGenerated
  ) {
    return false;
  }

  // Check acceptedFormats array (shallow comparison)
  if (prevProps.acceptedFormats?.length !== nextProps.acceptedFormats?.length) {
    return false;
  }

  // Check files array - compare by relevant properties
  const prevFiles = prevProps.files || [];
  const nextFiles = nextProps.files || [];
  if (prevFiles.length !== nextFiles.length) {
    return false;
  }
  for (let i = 0; i < prevFiles.length; i++) {
    if (
      prevFiles[i].name !== nextFiles[i].name ||
      prevFiles[i].size !== nextFiles[i].size ||
      prevFiles[i].status !== nextFiles[i].status ||
      prevFiles[i].documentLogsId !== nextFiles[i].documentLogsId
    ) {
      return false;
    }
  }

  // Check raraResponse object
  const prevRara = prevProps.raraResponse;
  const nextRara = nextProps.raraResponse;
  if (
    prevRara?.document_rating !== nextRara?.document_rating ||
    prevRara?.reason_for_rating !== nextRara?.reason_for_rating
  ) {
    return false;
  }

  // All relevant props are equal, skip re-render
  return true;
};

export default memo(CustomDropzone, arePropsEqual);
