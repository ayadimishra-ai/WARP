import { useState } from "react";

export interface UseSectionUploadReturn {
  uploadSections: (file: File) => Promise<any>;
  loading: boolean;
  error: string | null;
  result: any;
}

export const useSectionUpload = (): UseSectionUploadReturn => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<any>(null);

  const uploadSections = async (file: File) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      // Create form data
      const formData = new FormData();
      formData.append("file", file);

      // Send the request
      const response = await fetch("/api/sections/bulk-insert", {
        method: "POST",
        body: formData,
      });

      // Parse the response
      const data = await response.json();

      // Check if the request was successful
      if (!response.ok) {
        throw new Error(data.message || "Failed to upload sections");
      }

      // Set the result
      setResult(data);
      return data;
    } catch (err: any) {
      const errorMessage =
        err.message || "An error occurred while uploading sections";
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    uploadSections,
    loading,
    error,
    result,
  };
};
