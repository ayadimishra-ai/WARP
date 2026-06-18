/**
 * Dropzone Component - Pure file drop UI
 * 
 * Responsibilities:
 * - Render file drop zone using existing CustomDropzoneV2 component
 * - Emit files via onDrop callback
 * - Display current file status
 * 
 * Rules:
 * - No API calls
 * - No domain knowledge beyond display
 * - Uses CustomDropzoneV2 for consistent UI/UX
 * - Memoized for performance
 */

import { DropzoneStatus, rejectedFiles } from "@warp/shared/constants/app.constants";
import CustomDropzoneV2 from "@warp/web/pages/embed/AIBasedSections/Common/CustomDropzoneV2";
import { useState } from "react";
import { DocumentStatus, DocumentTemplate } from "../domain/document.types";

interface DropzoneProps {
  template: DocumentTemplate;
  currentFile: {
    name: string;
    size: number;
    status: DocumentStatus;
    documentLogsId?: string;
  } | null;
  uploadProgress?: number;
  disabled?: boolean;
  badge?: {
    label: string;
    color: string;
  };
  onDrop: (files: File[]) => void;
  onDelete?: () => void;
  onProcessWithAI?: () => void;
  showProcessButton?: boolean;
  isChatSubscriptionActive?: boolean;
  expiryDate?: string | null;
  raraResponse?: {
    document_rating: number | null;
    recommendations: string[];
    reason_for_rating: string;
  } | null;
  extractionPercentage?: number | string | null;
  isSystemGenerated?: boolean;
  metadata?: any;
  warningMessage?: string;
  errorMessage?: string;
}

/**
 * Map domain status to UI status
 */
const mapDocumentStatusToDropzoneStatus = (status: DocumentStatus): any => {
  switch (status) {
    case DocumentStatus.Idle:
      return DropzoneStatus.idle;
    case DocumentStatus.Uploading:
      return DropzoneStatus.uploading;
    case DocumentStatus.Uploaded:
      return DropzoneStatus.uploaded;
    case DocumentStatus.Processing:
      return DropzoneStatus.processing;
    case DocumentStatus.Processed:
      return DropzoneStatus.complete;
    case DocumentStatus.UploadError:
      return DropzoneStatus.error;
    case DocumentStatus.ProcessingError:
      return DropzoneStatus.ProcessingError;
    default:
      return DropzoneStatus.idle;
  }
};

function Dropzone({
  template,
  currentFile,
  uploadProgress,
  disabled,
  badge,
  onDrop,
  onDelete,
  onProcessWithAI,
  showProcessButton,
  isChatSubscriptionActive,
  expiryDate,
  raraResponse,
  extractionPercentage,
  isSystemGenerated,
  metadata,
  warningMessage,
  errorMessage,
}: DropzoneProps) {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDrop = (files: File[]) => {
    onDrop(files);
  };

  const handleDelete = async () => {
    if (onDelete) {
      setIsDeleting(true);
      try {
        await onDelete();
      } finally {
        setIsDeleting(false);
      }
    }
  };

  const handleProcessWithAIWrapper = async (fileData: {
    documentLogsId: string;
    fileUrl: string;
    fileName: string;
  }) => {
    if (onProcessWithAI) {
      await onProcessWithAI();
    }
  };

  const handleInsertRejectedFiles = async (files: rejectedFiles[], anyotherDocuments: boolean) => {
    // Handle rejected files - could be extended in future
    console.log("[Dropzone] Rejected files:", files);
  };

  // Prepare files array for CustomDropzoneV2
  const files = currentFile
    ? [
        {
          name: currentFile.name,
          size: currentFile.size,
          status: mapDocumentStatusToDropzoneStatus(currentFile.status),
          metadata: metadata || {},
          documentLogsId: currentFile.documentLogsId || "",
        },
      ]
    : [];

  const uploadStatus = currentFile
    ? mapDocumentStatusToDropzoneStatus(currentFile.status)
    : DropzoneStatus.idle;

  return (
    <CustomDropzoneV2
      id={template.id}
      heading={template.title}
      sampleLink={template.sampleFileUrl || undefined}
      files={files}
      acceptedFormats={template.acceptedFormats}
      uploadStatus={uploadStatus}
      uploadProgress={uploadProgress}
      onDrop={handleDrop}
      onDelete={handleDelete}
      onComplete={() => {}}
      onProcessWithAI={showProcessButton ? handleProcessWithAIWrapper : undefined}
      anyotherDocuments={template.isOther || false}
      maxSize={template.maxSize}
      dataPoint={0}
      warningMessage={warningMessage || ""}
      FileProcessingErrorMessage={errorMessage || ""}
      isDeleting={isDeleting}
      insertRejectedFiles={handleInsertRejectedFiles}
      autoFetched={false}
      expiryDate={expiryDate || null}
      raraResponse={raraResponse || null}
      extractionPercentage={extractionPercentage || null}
      isChatSubscriptionActive={isChatSubscriptionActive || false}
      isSystemGenerated={isSystemGenerated || false}
    />
  );
}
export default Dropzone;
