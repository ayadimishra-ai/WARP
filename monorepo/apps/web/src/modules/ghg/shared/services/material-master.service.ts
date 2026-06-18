import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";

/**
 * Downloads the Material Master Excel template
 * @returns Promise that resolves when download is complete
 */
export const downloadMaterialMasterTemplate = async (): Promise<void> => {
  try {
    const res = await apiClientWithAuth.get(
      "/api/v1/master-data/activity/material_master/download-template"
    );
    
    const url = res?.data?.response?.url;
    
    if (!url) {
      console.error("Template URL not found in response");
      return;
    }

    const fileName = "MaterialMaster.xlsx";

    // Fetch the file as a blob and trigger download
    const response = await fetch(url);
    const blob = await response.blob();
    const link = document.createElement("a");
    link.href = window.URL.createObjectURL(blob);
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up the object URL
    window.URL.revokeObjectURL(link.href);
  } catch (error) {
    console.error("Error downloading template:", error);
    throw error;
  }
};
