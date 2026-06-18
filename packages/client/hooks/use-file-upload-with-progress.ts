import { GetS3UploadUrlResponseType } from "@warp/shared/validation/api-get-s3-upload-url.schema";
import { apiRequest } from "../libs/api-request";

export const useFileUploadWithProgress = () => {
  // Function to upload a file with progress tracking
  const uploadFile = async (
    id: string,
    file: File,
    isCustomName: boolean,
    folderPath: string,
    onProgress?: (progress: number) => void // Add optional callback
  ): Promise<{ fileInfo: any | null; error: string | unknown, errorStack: string | undefined }> => {
    try {
      if (!file) return { fileInfo: null, error: "", errorStack: undefined };

      const fileName = file.name;
      const fileType = file.type;

      // Step 1: Get S3 Upload URL from the API
      const res = await apiRequest.post<GetS3UploadUrlResponseType>(
        `/api/awss3/get-upload-url`,
        { fileName, fileType, isCustomName, folderPath }
      );

      if (!res.data)
        return { fileInfo: null, error: "Failed to get upload URL", errorStack: undefined };

      const { url, fields } = res.data.uploadInfo;
      const formData = new FormData();
      Object.entries({ ...fields, file }).forEach(([key, value]) => {
        formData.append(key, value);
      });

      return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", url, true);

        const progressKey = `uploadProgress_${id}`;

        // Step 2: Track Upload Progress
        xhr.upload.onprogress = (event) => {
          if (event.lengthComputable) {
            const uploadProgress = Math.round(
              (event.loaded / event.total) * 100
            );

            // Call the optional callback if provided
            onProgress?.(uploadProgress);

            // Also store in localStorage for backward compatibility
            if (typeof window !== "undefined") {
              localStorage.setItem(progressKey, JSON.stringify(uploadProgress));
            }
          }
        };

        // Step 3: Handle Upload Completion.
        xhr.onload = () => {
          if (xhr.status === 204) {
            resolve({ fileInfo: res.data.fileInfo, error: "", errorStack: undefined });
          } else {
            const uploadError = new Error(`Upload failed with status ${xhr.status}`);
            reject({
              message: uploadError.message,
              stack: uploadError.stack
            });
          }
        };

        // Step 4: Handle Errors
        xhr.onerror = () => {
          console.error("Upload Error");
          const uploadError = new Error("Upload error");
          reject({
            message: uploadError.message,
            stack: uploadError.stack
          });
        };

        // Send the FormData to the S3 upload URL
        xhr.send(formData);
      });
    } catch (error) {
      console.error("Error during file upload:", error);

      // Cast to any to safely access `message` and `stack` properties
      const errAny = error as any;

      if (errAny && typeof errAny === "object" && ("message" in errAny || "stack" in errAny)) {
        return {
          fileInfo: null,
          error: String(errAny.message ?? "An error occurred"),
          errorStack: String(errAny.stack ?? ""),
        };
      } else if (error instanceof Error) {
        return {
          fileInfo: null,
          error: error.message,
          errorStack: error.stack || "No stack trace available",
        };
      } else {
        return {
          fileInfo: null,
          error: "An unknown error occurred",
          errorStack: "Error stack not available for non-Error types",
        };
      }
    }
  };

  return { uploadFile };
};
