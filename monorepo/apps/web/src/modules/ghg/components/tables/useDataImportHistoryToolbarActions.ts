import dayjs from "dayjs";
import { useState } from "react";
import * as XLSX from "xlsx";
import { useGetDataImportHistoryViewLazyQuery } from "@/modules/ghg/graphql/queries/get-data-import-history-view.generated";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import {
  AppRoles,
  DataImportHistoryStatus,
} from "@/modules/ghg/lib/shared/constants/dataimporthistory.constant";
import {
  openAiUpload,
  openExcelBulkUpload,
  postParentMessage,
} from "@/modules/ghg/shared/services/platform-window-message-service";

interface UseDataImportHistoryToolbarActionsProps {
  session: any;
  initialActivityCode: string | null;
  selectedLocation: string[];
}

export const useDataImportHistoryToolbarActions = ({
  session,
  initialActivityCode,
  selectedLocation,
}: UseDataImportHistoryToolbarActionsProps) => {
  const [isDownloadingTemplate, setIsDownloadingTemplate] = useState(false);
  const [fetchDataImportHistoryList] = useGetDataImportHistoryViewLazyQuery();

  const handleExportData = async () => {
    try {
      if (!session) {
        return;
      }

      // Build the same filter that's currently applied to the table
      let where: object = {
        organization_id: { _eq: session?.organizationId },
        ...(session?.userRole === AppRoles.LocationExecutive && {
          uploader_user_id: { _eq: session.userId },
        }),
      };

      if (initialActivityCode) {
        where = {
          _and: {
            ...where,
            activity_code: { _eq: initialActivityCode },
          },
        };
      }

      if (selectedLocation?.length > 0) {
        where = {
          _and: {
            ...where,
            location_name: { _in: selectedLocation },
          },
        };
      }

      // Fetch ALL records
      const response = await fetchDataImportHistoryList({
        variables: {
          where,
          start: 0,
          size: 999999,
          orderBy: { created_at: "desc" } as any,
        },
      });

      const allRecords = response.data?.view_page_data_import_history;

      if (!allRecords || allRecords.length === 0) {
        return;
      }

      const tableColumns = [
        { label: "Section", key: "activity_name" },
        { label: "File Name", key: "file_name" },
        { label: "Location Covered", key: "location_name" },
        { label: "Date", key: "created_at" },
        { label: "Uploaded By", key: "uploader_name" },
        { label: "Status", key: "status" },
      ];

      const exportRows = allRecords.map((source: any) => {
        return tableColumns.reduce(
          (acc, col) => {
            let value = source[col.key] ?? "";
            if (col.key === "created_at" && value) {
              value = dayjs(value).format("DD MMM YYYY");
            }
            if (col.key === "status") {
              value =
                value === DataImportHistoryStatus.Failure
                  ? "File Error"
                  : "Uploaded";
            }
            acc[col.label] = value;
            return acc;
          },
          {} as Record<string, string | number>
        );
      });

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Data Import History");

      const date = new Date();
      const stamp = `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}_${String(date.getHours()).padStart(2, "0")}${String(date.getMinutes()).padStart(2, "0")}${String(date.getSeconds()).padStart(2, "0")}`;
      XLSX.writeFile(workbook, `data-import-history-export-${stamp}.xlsx`);
    } catch (error) {
      console.error("Failed to export all rows:", error);
    }
  };

  const handleDownloadTemplate = async () => {
    if (!initialActivityCode || isDownloadingTemplate) return;
    setIsDownloadingTemplate(true);
    try {
      const response = await apiClientWithAuth.get(
        `/api/v1/master-data/activity/${initialActivityCode}/download-template`
      );
      if (response?.data?.success && response?.data?.response?.url) {
        const url = response.data.response.url;
        const link = document.createElement("a");
        link.href = url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Failed to download template:", error);
    } finally {
      setIsDownloadingTemplate(false);
    }
  };

  const handleBulkUploadClick = () => {
    postParentMessage(openExcelBulkUpload(initialActivityCode ?? undefined));
  };

  const handleAiBulkUploadClick = () => {
    postParentMessage(openAiUpload(initialActivityCode ?? undefined));
  };

  return {
    handleExportData,
    handleDownloadTemplate,
    handleBulkUploadClick,
    handleAiBulkUploadClick,
    isDownloadingTemplate,
  };
};
