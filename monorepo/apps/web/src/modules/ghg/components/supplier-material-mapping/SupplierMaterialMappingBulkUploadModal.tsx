"use client";

import {
  faCheckCircle,
  faCloudUploadAlt,
  faFileExcel,
  faTimesCircle,
  faTrash,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  Box,
  Button,
  Flex,
  Group,
  Loader,
  Modal,
  Stack,
  Text,
} from "@mantine/core";
import { Dropzone, MIME_TYPES } from "@mantine/dropzone";
import { useState } from "react";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";

interface Props {
  opened: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

type UploadState = "idle" | "uploading" | "processing" | "success" | "error";

const SupplierMaterialMappingBulkUploadModal: React.FC<Props> = ({
  opened,
  onClose,
  onSuccess,
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [affectedRows, setAffectedRows] = useState<number>(0);

  const handleClose = () => {
    if (uploadState === "uploading" || uploadState === "processing") return;
    setFile(null);
    setUploadState("idle");
    setErrorMessage("");
    setAffectedRows(0);
    onClose();
  };

  const handleDrop = (files: File[]) => {
    if (files.length > 0) {
      setFile(files[0]);
      setUploadState("idle");
      setErrorMessage("");
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setUploadState("idle");
    setErrorMessage("");
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploadState("uploading");

      // Step 1 — get S3 presigned URL
      const formData = new FormData();
      formData.append("files", file);

      const presignedRes = await apiClientWithAuth.post(
        "/api/v1/file-system/get-s3-upload-url/master-data-excel-import",
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      if (!presignedRes?.data?.success || !presignedRes.data.data?.length) {
        throw new Error("Failed to get upload URL. Please try again.");
      }

      const { uploadUrl, downloadUrl } = presignedRes.data.data[0];

      // Step 2 — PUT file directly to S3
      await fetch(uploadUrl, {
        method: "PUT",
        body: file,
        headers: { "Content-Type": file.type },
      });

      // Step 3 — trigger processing
      setUploadState("processing");
      const processRes = await apiClientWithAuth.post(
        "/api/v1/master-data/supplier-material-mapping/excel",
        { fileUrl: downloadUrl }
      );

      if (processRes?.data?.success) {
        setAffectedRows(processRes.data.affected_rows ?? 0);
        setUploadState("success");
        onSuccess();
      } else {
        setUploadState("error");
        setErrorMessage(
          "Some rows failed validation. Please download the error report from Upload History and fix the issues."
        );
      }
    } catch (err: any) {
      setUploadState("error");
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Upload failed. Please try again."
      );
    }
  };

  const isProcessing =
    uploadState === "uploading" || uploadState === "processing";

  return (
    <Modal
      opened={opened}
      onClose={handleClose}
      title={
        <Text fw={600} fz="16px" c="#122f47">
          Bulk Upload Supplier Material Mapping
        </Text>
      }
      size="lg"
      centered
      closeOnClickOutside={!isProcessing}
      closeOnEscape={!isProcessing}
    >
      <Stack gap="md" pb="sm">
        {/* Drop zone */}
        {uploadState !== "success" && (
          <>
            {!file ? (
              <Dropzone
                onDrop={handleDrop}
                accept={[MIME_TYPES.xlsx]}
                maxFiles={1}
                maxSize={10 * 1024 * 1024}
                disabled={isProcessing}
                styles={{
                  root: {
                    borderColor: "#122f47",
                    borderStyle: "dashed",
                    borderRadius: 8,
                    backgroundColor: "#f7f9fb",
                    cursor: isProcessing ? "not-allowed" : "pointer",
                  },
                }}
              >
                <Stack align="center" gap="xs" py="lg">
                  <FontAwesomeIcon
                    icon={faCloudUploadAlt}
                    style={{ fontSize: 40, color: "#FFA93C" }}
                  />
                  <Text fw={600} fz="14px" c="#333">
                    Drag & drop an Excel file here
                  </Text>
                  <Text fz="12px" c="#888">
                    or click to browse — only .xlsx files accepted (max 10 MB)
                  </Text>
                </Stack>
              </Dropzone>
            ) : (
              <Box
                style={{
                  border: "1px solid #e9ecef",
                  borderRadius: 8,
                  padding: "12px 16px",
                  backgroundColor: "#f7f9fb",
                }}
              >
                <Flex align="center" justify="space-between">
                  <Flex align="center" gap="sm">
                    <FontAwesomeIcon
                      icon={faFileExcel}
                      style={{ fontSize: 28, color: "#217346" }}
                    />
                    <Box>
                      <Text fz="13px" fw={600} c="#333" lineClamp={1}>
                        {file.name}
                      </Text>
                      <Text fz="11px" c="#888">
                        {(file.size / 1024).toFixed(1)} KB
                      </Text>
                    </Box>
                  </Flex>
                  {!isProcessing && (
                    <Button
                      variant="subtle"
                      color="red"
                      size="xs"
                      onClick={handleRemoveFile}
                      leftSection={
                        <FontAwesomeIcon
                          icon={faTrash}
                          style={{ fontSize: 12 }}
                        />
                      }
                    >
                      Remove
                    </Button>
                  )}
                </Flex>
              </Box>
            )}

            {/* Error message */}
            {uploadState === "error" && (
              <Flex
                align="flex-start"
                gap="xs"
                style={{
                  padding: "10px 14px",
                  backgroundColor: "#fff5f5",
                  borderRadius: 6,
                  border: "1px solid #ffc9c9",
                }}
              >
                <FontAwesomeIcon
                  icon={faTimesCircle}
                  style={{ fontSize: 16, color: "#e03131", marginTop: 2, flexShrink: 0 }}
                />
                <Text fz="13px" c="#e03131">
                  {errorMessage}
                </Text>
              </Flex>
            )}

            {/* Upload progress label */}
            {isProcessing && (
              <Flex align="center" gap="sm">
                <Loader size="xs" color="#122f47" />
                <Text fz="13px" c="#555">
                  {uploadState === "uploading"
                    ? "Uploading file to server..."
                    : "Validating and processing records..."}
                </Text>
              </Flex>
            )}
          </>
        )}

        {/* Success state */}
        {uploadState === "success" && (
          <Stack align="center" gap="sm" py="lg">
            <FontAwesomeIcon
              icon={faCheckCircle}
              style={{ fontSize: 48, color: "#2f9e44" }}
            />
            <Text fw={600} fz="16px" c="#2f9e44">
              Upload Successful
            </Text>
            <Text fz="13px" c="#555" ta="center">
              {affectedRows} record{affectedRows !== 1 ? "s" : ""} imported
              successfully.
            </Text>
          </Stack>
        )}

        {/* Footer actions */}
        <Group justify="flex-end" mt="xs">
          {uploadState === "success" ? (
            <Button
              variant="filled"
              color="#122f47"
              radius="xl"
              onClick={handleClose}
            >
              Close
            </Button>
          ) : (
            <>
              <Button
                variant="outline"
                color="#122f47"
                radius="xl"
                onClick={handleClose}
                disabled={isProcessing}
              >
                Cancel
              </Button>
              <Button
                variant="filled"
                color="#122f47"
                radius="xl"
                onClick={handleUpload}
                disabled={!file || isProcessing}
                loading={isProcessing}
              >
                Upload
              </Button>
            </>
          )}
        </Group>
      </Stack>
    </Modal>
  );
};

export default SupplierMaterialMappingBulkUploadModal;
