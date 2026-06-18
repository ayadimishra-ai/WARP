"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { MRT_ColumnDef } from "mantine-react-table";
import type {
  AiFileRemovalFilters,
  OrganizationOption,
  AiFileUpload,
} from "../types";
import {
  DELETE_SUCCESS_MESSAGE,
  LOAD_SUCCESS_MESSAGE,
  RESET_SUCCESS_MESSAGE,
} from "../constants";
import {
  getOrganizationList,
  getUsersByOrganization,
  getAiFileUploadsByUsers,
  deleteAiFileUploads,
  getAIFileDataAndMeterMappings,
  getTaskRequestIdsByMonthAndAddress,
  calculateEmissionAfterDeletion,
  cascadeDeleteRelatedData,
} from "../components/ai-file-removal-server";

// Constants
const SEPARATOR = "=".repeat(60);
const VERIFIED_STATUS = "Verified" as const;

/**
 * Custom hook for AI File Removal feature
 * Manages filters, data loading, and delete operations
 */
export const useAiFileRemoval = () => {
  // Filter state
  const [filters, setFilters] = useState<AiFileRemovalFilters>({
    organizationId: "",
  });

  // Data state
  const [data, setData] = useState<AiFileUpload[]>([]);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Dropdown options state
  const [organizationOptions, setOrganizationOptions] = useState<
    OrganizationOption[]
  >([]);

  // Fetch organizations on mount
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgList = await getOrganizationList();
        setOrganizationOptions(
          orgList?.Organization?.map((org) => ({
            label: org?.name || "",
            value: org?.id || "",
          })) || []
        );
      } catch (error) {
        console.error("Error fetching organizations:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load organizations",
          color: "red",
        });
      }
    };

    fetchOrganizations();
  }, []);

  // Handle filter changes
  const handleFilterChange = useCallback(
    (field: keyof AiFileRemovalFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Check if organization filter is filled
  const isLoadButtonEnabled = !!filters.organizationId;

  /**
   * Handle Load Data button click
   * Fetches users by organization and then their AI file uploads
   */
  const handleLoadData = async () => {
    if (!isLoadButtonEnabled) {
      notifications.show({
        title: "Validation Error",
        message: "Please select an organization",
        color: "orange",
      });
      return;
    }

    setLoading(true);

    try {
      //console.log(`${SEPARATOR}\n?? Load Data Request:\n${SEPARATOR}`);
      //console.log(`Organization ID: ${filters.organizationId}\n${SEPARATOR}`);

      // Step 1: Fetch all users for this organization
      const users = await getUsersByOrganization(filters.organizationId);
      const userIds = users.map((user) => user.id);

      //console.log(`?? Found ${users.length} users in organization`);
      //console.log(`User IDs: ${userIds.join(", ")}`);

      // Step 2: Fetch AI file uploads for all these users
      const fileUploads = await getAiFileUploadsByUsers(userIds);

      //console.log(`?? Found ${fileUploads.length} AI file uploads`);

      setData(fileUploads as AiFileUpload[]);

      // Clear row selection when loading new data
      setRowSelection({});

      notifications.show({
        title: "Success",
        message: `${LOAD_SUCCESS_MESSAGE} (${fileUploads.length} files)`,
        color: "green",
      });
    } catch (error) {
      console.error("? Error loading data:", error);
      notifications.show({
        title: "Error",
        message: "Failed to load data",
        color: "red",
      });
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handle Delete button click
   * Opens confirmation modal and deletes selected records
   */
  const handleDelete = useCallback(() => {
    const selectedRowIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key]
    );

    if (selectedRowIds.length === 0) {
      notifications.show({
        title: "No Selection",
        message: "Please select files to delete",
        color: "orange",
      });
      return;
    }

    // Get the actual file records and their details
    const selectedFiles = data.filter((file) =>
      selectedRowIds.includes(file.id)
    );

    //console.log("Selected files for deletion:");
    selectedFiles.forEach((file) => {
      //console.log(`   - ID: ${file.id}`);
      //console.log(`     Name: ${file.file_name}`);
      //console.log(`     Status: ${file.status}`);
      //console.log(`     Uploaded by: ${file.AppUser?.name || "Unknown"}`);
    });

    // Extract AIFileUploads IDs for deletion
    const fileIdsToDelete = selectedFiles.map((file) => file.id);
    //console.log(`AIFileUploads IDs to delete: ${fileIdsToDelete.join(", ")}`);

    modals.openConfirmModal({
      title: "Confirm Deletion",
      children: `Are you sure you want to delete ${selectedRowIds.length} file${selectedRowIds.length > 1 ? "s" : ""}? This action cannot be undone.`,
      labels: { confirm: "Yes, Delete", cancel: "No, Cancel" },
      confirmProps: { color: "red" },
      cancelProps: { variant: "outline" },
      onCancel: () => {
       // console.log("Delete cancelled by user");
      },
      onConfirm: async () => {
        setDeleting(true);

        try {
          //console.log(`Sending delete request for AIFileUploads IDs: ${fileIdsToDelete.join(", ")}`);

          // Step 1: Fetch all related data (AIFileData, MeterData, GridPower, TaskRequest, etc.)
          const relatedData = await getAIFileDataAndMeterMappings(
            fileIdsToDelete,
            filters.organizationId
          );
          
          //console.log("📊 Related data fetched:");
          // console.log(`  - AIFileData records: ${relatedData.aiFileDataRecords.length}`);
          // console.log(`  - MeterData records: ${relatedData.meterData.length}`);
          // console.log(`  - Meter mappings: ${relatedData.meterMappings.length}`);
          // console.log(`  - GridPower records: ${relatedData.gridPowerData.length}`);
          // console.log(`  - Task Request details: ${relatedData.taskRequestDetails.length}`);
          // console.log(`  - AIFileData IDs: ${relatedData.aiFileDataIds.join(", ")}`);
          // console.log(`  - Task Request IDs: ${relatedData.taskRequestIds.join(", ")}`);
          // console.log(`  - Organization ID: ${relatedData.organizationId}`);
          
          // Filter verified files (emission calculation is only for verified files)
          const verifiedFiles = selectedFiles.filter((file) => file.status === VERIFIED_STATUS);
          const hasVerifiedFiles = verifiedFiles.length > 0;
          
          //console.log(`📋 Files breakdown: ${selectedFiles.length} total, ${verifiedFiles.length} verified`);
          
          // Step 2: Perform soft delete on AIFileUploads
          const result = await deleteAiFileUploads(fileIdsToDelete);

          //console.log("✅ Soft delete completed successfully");
          //console.log("Delete result:", result);

          // Step 3: Cascade delete all related data (GridPower, KPI, etc.)
          //console.log("\n🗑️ Starting cascade delete of related data...");
          try {
            // Extract verified file IDs (already filtered above)
            const verifiedFileIds = verifiedFiles.map((file) => file.id);
            
            // Note: MeterData and MeterOrganizationAddressMapping will be deleted using filedata_id
            // Note: GridPower will be updated/deleted based on UnitsConsumed from AIFileData
            
            const cascadeResult = await cascadeDeleteRelatedData(
              fileIdsToDelete,
              verifiedFileIds,
              relatedData.aiFileDataIds,
              relatedData.taskRequestDetails
            );
            
            //console.log("✅ Cascade delete completed successfully");
            //console.log("Cascade delete results:", cascadeResult.deleteResults);
          } catch (cascadeError) {
            console.error("❌ Error during cascade delete:", cascadeError);
            // Don't fail the operation since soft delete already succeeded
            //console.log("⚠️ AIFileUploads were soft deleted, but some related data may remain");
          }
          
          // Step 4: Recalculate emissions AFTER deletion (only for verified files)
          if (hasVerifiedFiles && relatedData.taskRequestDetails.length > 0) {
            //console.log("\n⚡ Starting emission recalculation after deletion...");
            try {
              // Get all task request IDs that match the month/address combinations
              const allTaskRequestIds = await getTaskRequestIdsByMonthAndAddress(
                relatedData.taskRequestDetails
              );
              
              //console.log(`📊 Found ${allTaskRequestIds.length} total task request(s) for emission calculation`);
              //console.log(`📊 Organization ID: ${relatedData.organizationId}`);
              //console.log(`📊 Task Request IDs: ${allTaskRequestIds.join(", ")}`);
              
              if (allTaskRequestIds.length > 0) {
                //console.log("⚡ Calling emission calculation for energy_grid_power...");
                await calculateEmissionAfterDeletion(
                  relatedData.organizationId,
                  allTaskRequestIds
                );
                console.log("✅ Emission calculation completed successfully");
              } else {
                console.log("⚠️ No task requests found for emission calculation");
              }
            } catch (emissionError) {
              console.error("❌ Error during emission calculation:", emissionError);
              // Don't fail the delete operation if emission calculation fails
              console.log("⚠️ Delete operation succeeded, but emission calculation failed");
            }
          } else {
            console.log("⚠️ No verified files or no task request details found, skipping emission calculation");
          }

          // Remove deleted records from data
          setData((prevData) =>
            prevData.filter((file) => !fileIdsToDelete.includes(file.id))
          );

          // Clear row selection
          setRowSelection({});

          notifications.show({
            title: "Success",
            message: `Successfully deleted ${fileIdsToDelete.length} file${fileIdsToDelete.length > 1 ? "s" : ""} and related data`,
            color: "green",
          });

          console.log("✅ Complete delete operation finished");
        } catch (error) {
          console.error("Error deleting data:", error);
          notifications.show({
            title: "Error",
            message: error instanceof Error ? error.message : "Failed to delete files",
            color: "red",
          });
        } finally {
          setDeleting(false);
        }
      },
    });
  }, [data, rowSelection, filters.organizationId]);

  // Define table columns
  const columns = useMemo<MRT_ColumnDef<AiFileUpload>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 100,
      },
      {
        accessorKey: "file_name",
        header: "File Name",
        size: 250,
      },
      {
        accessorKey: "present_reading_date",
        header: "Present Reading Date",
        size: 180,
        Cell: ({ row }) => {
          const aiFileData = row.original.AIFileData;
          if (!aiFileData || aiFileData.length === 0) return "-";
          const date = aiFileData[0]?.present_reading_date;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        accessorKey: "previous_reading_date",
        header: "Previous Reading Date",
        size: 180,
        Cell: ({ row }) => {
          const aiFileData = row.original.AIFileData;
          if (!aiFileData || aiFileData.length === 0) return "-";
          const date = aiFileData[0]?.previous_reading_date;
          return date ? new Date(date).toLocaleDateString() : "-";
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
      },
      {
        accessorKey: "AppUser.name",
        header: "Uploaded By",
        size: 180,
        Cell: ({ row }) => row.original.AppUser?.name || "-",
      },
      {
        accessorKey: "AppUser.email",
        header: "Email",
        size: 220,
        Cell: ({ row }) => row.original.AppUser?.email || "-",
      },
      {
        accessorKey: "file_url",
        header: "File URL",
        size: 200,
        Cell: ({ cell }) => {
          const url = cell.getValue() as string | null;
          return url ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ color: "#003b52", textDecoration: "underline" }}
            >
              View File
            </a>
          ) : (
            "-"
          );
        },
      },
    ],
    []
  );

  // Get count of selected rows
  const selectedRowCount = Object.keys(rowSelection).filter(
    (key) => rowSelection[key]
  ).length;

  /**
   * Handle Reset button click
   * Clears all filters, data, and selections
   */
  const handleReset = useCallback(() => {
    //console.log("?? Resetting all filters and data...");

    // Clear filters
    setFilters({ organizationId: "" });

    // Clear data
    setData([]);

    // Clear row selection
    setRowSelection({});

    //console.log("? Reset complete - all filters cleared");

    notifications.show({
      title: "Reset Complete",
      message: RESET_SUCCESS_MESSAGE,
      color: "blue",
    });
  }, []);

  return {
    filters,
    organizationOptions,
    data,
    loading,
    deleting,
    isLoadButtonEnabled,
    columns,
    rowSelection,
    setRowSelection,
    selectedRowCount,
    handleFilterChange,
    handleLoadData,
    handleDelete,
    handleReset,
  };
};
