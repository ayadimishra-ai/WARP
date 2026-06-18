"use client";

import { useState, useEffect, useMemo } from "react";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { MRT_ColumnDef } from "mantine-react-table";
import type {
  ActivityDataRemovalFilters,
  OrganizationOption,
  LocationOption,
  ActivityOption,
  ActivityDataRecord,
  ActivityDataSection,
  SectionedActivityData,
} from "../types";
import {
  MONTHS,
  YEARS,
  DELETE_SUCCESS_MESSAGE,
  DELETE_CONFIRM_TITLE,
  DELETE_CONFIRM_MESSAGE,
  LOAD_SUCCESS_MESSAGE,
  RESET_SUCCESS_MESSAGE,
} from "../constants";
import {
  getOrganizationList,
  getLocationsByOrganization,
  getActivitiesByOrganization,
  getActivityDataByFilters,
  deleteGridPowerRecords,
  deleteCaptivePowerRecords,
  deleteFuelPurchasedRecords,
} from "../components/activity-data-removal-server";

// Note: log+email is handled server-side inside each delete function via logParams
import { useUserSession } from "@/modules/ghg/hooks/use-user-session";

/**
 * Custom hook for Activity Data Removal feature
 * Manages filters, data loading, and delete operations
 */
export const useActivityDataRemoval = () => {
  const userSession = useUserSession();
  // Filter state
  const [filters, setFilters] = useState<ActivityDataRemovalFilters>({
    organizationId: "",
    locationId: "",
    activityId: "",
    month: "",
    year: "",
  });

  // Data state
  const [data, setData] = useState<ActivityDataRecord[]>([]);
  const [sectionedData, setSectionedData] = useState<ActivityDataSection[]>([]);
  const [taskRequestIds, setTaskRequestIds] = useState<string[]>([]); // Store task request IDs from query
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({});

  // Dropdown options state
  const [organizationOptions, setOrganizationOptions] = useState<
    OrganizationOption[]
  >([]);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [activityOptions, setActivityOptions] = useState<ActivityOption[]>([]);

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

  // Fetch locations when organization changes
  useEffect(() => {
    const fetchLocations = async () => {
      if (!filters.organizationId) {
        setLocationOptions([]);
        return;
      }

      try {
        const locations = await getLocationsByOrganization(
          filters.organizationId
        );
        const locationList =
          locations?.OrganizationAddress?.map((orgAddress) => ({
            label: orgAddress?.Address?.name || "",
            value: orgAddress?.id || "",
          })) || [];

        setLocationOptions(locationList);
      } catch (error) {
        console.error("Error fetching locations:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load locations",
          color: "red",
        });
      }
    };

    fetchLocations();
    // Reset location and activity when organization changes
    setFilters((prev) => ({ ...prev, locationId: "", activityId: "" }));
  }, [filters.organizationId]);

  // Fetch activities when organization changes
  useEffect(() => {
    const fetchActivities = async () => {
      if (!filters.organizationId) {
        setActivityOptions([]);
        return;
      }

      try {
        const activities = await getActivitiesByOrganization(
          filters.organizationId
        );
        const activityList =
          activities?.OrganizationActivityMapping?.flatMap((mapping) =>
            mapping?.Activity?.Activities?.map((activity) => ({
              label: activity?.name || "",
              value: activity?.code || "",
            })) || []
          ) || [];

        // TODO: Filter to only show energy-related activities (temporary restriction)
        // Remove this filter when ready to enable all activity types
        const energyActivities = activityList.filter((activity) =>
          activity.value.toLowerCase().includes("energy")
        );

        setActivityOptions(energyActivities);
        
        //console.log("Available energy activities:", energyActivities.map(a => a.value));
      } catch (error) {
        console.error("Error fetching activities:", error);
        notifications.show({
          title: "Error",
          message: "Failed to load activities",
          color: "red",
        });
      }
    };

    fetchActivities();
  }, [filters.organizationId]);

  // Handle filter changes
  const handleFilterChange = (
    field: keyof ActivityDataRemovalFilters,
    value: string
  ) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  // Check if all required filters are filled
  const isLoadButtonEnabled =
    !!filters.organizationId &&
    !!filters.locationId &&
    !!filters.activityId &&
    !!filters.month &&
    !!filters.year;

  /**
   * Handle Load Data button click
   * Fetches data based on selected filters
   */
  const handleLoadData = async () => {
    if (!isLoadButtonEnabled) {
      notifications.show({
        title: "Validation Error",
        message: "Please fill all filter fields",
        color: "orange",
      });
      return;
    }

    setLoading(true);

    try {
      // Prepare payload with all selected parameters
      const payload = {
        organizationId: filters.organizationId,
        locationId: filters.locationId,
        activityCode: filters.activityId, // Activity code
        month: filters.month, // Month in text format (e.g., "January")
        year: filters.year, // Year as string
      };


      // console.log("=".repeat(60));
      // console.log("📤 Load Data Request Payload:");
      // console.log("=".repeat(60));
      // console.log("Organization ID:", payload.organizationId);
      // console.log("Location ID:", payload.locationId);
      // console.log("Activity Code:", payload.activityCode);
      // console.log("Month:", payload.month);
      // console.log("Year:", payload.year);
      // console.log("=".repeat(60));

      // Fetch activity-specific data
      const result = await getActivityDataByFilters({
        orgAddressId: payload.locationId,
        activityCode: payload.activityCode,
        month: payload.month,
        year: parseInt(payload.year, 10),
      });

      // console.log("📦 Raw result from server:", result);

      // Store task request IDs from the query
      setTaskRequestIds(result.taskRequestIds || []);
      // console.log("📋 Stored task request IDs for emission recalculation:", result.taskRequestIds);

      // Set sectioned data with visibility flag
      const sectionsWithVisibility: ActivityDataSection[] = result.sections.map(
        (section) => ({
          ...section,
          isVisible: true, // All sections visible by default
        })
      );

      // console.log("📋 Sections with visibility:", sectionsWithVisibility.map(s => ({
      //   id: s.id,
      //   title: s.title,
      //   dataCount: s.data.length,
      //   sampleRecord: s.data[0] || null,
      // })));

      setSectionedData(sectionsWithVisibility);
      
      // Clear legacy data array
      setData([]);
      
      // Clear row selection when loading new data
      setRowSelection({});

      const totalRecords = result.sections.reduce(
        (sum, section) => sum + section.data.length,
        0
      );

      // console.log("✅ Data loaded successfully:");
      // console.log(`   - ${result.sections.length} sections`);
      // console.log(`   - ${totalRecords} total records`);
      // result.sections.forEach((section) => {
      //   console.log(`   - ${section.title}: ${section.data.length} records`);
      // });

      notifications.show({
        title: "Success",
        message: `${LOAD_SUCCESS_MESSAGE} (${totalRecords} records in ${result.sections.length} sections)`,
        color: "green",
      });
    } catch (error) {
      console.error("❌ Error loading data:", error);
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
  const handleDelete = () => {
    const selectedRowIds = Object.keys(rowSelection).filter(
      (key) => rowSelection[key]
    );

    if (selectedRowIds.length === 0) {
      notifications.show({
        title: "No Selection",
        message: "Please select records to delete",
        color: "orange",
      });
      return;
    }

    // Extract actual IDs from row selection keys (format: "sectionId-recordId")
    // Since section IDs and record IDs both can contain hyphens (UUIDs),
    // we need to map back to the actual records to get the correct IDs
    const recordIdsToDelete: string[] = [];
    const selectedRecords: any[] = [];

    sectionedData.forEach((section) => {
      section.data.forEach((record) => {
        const rowId = `${section.id}-${record.id}`;
        if (selectedRowIds.includes(rowId)) {
          recordIdsToDelete.push(record.id);
          selectedRecords.push(record);
        }
      });
    });

    // console.log("🗑️  Selected row IDs:", selectedRowIds);
    // console.log("🗑️  Record IDs to delete:", recordIdsToDelete);
    // console.log("📋 Task Request IDs (from query):", taskRequestIds);

    modals.openConfirmModal({
      title: "Confirm Deletion",
      children: `Are you sure you want to delete ${selectedRowIds.length} record${selectedRowIds.length > 1 ? "s" : ""}? This action cannot be undone.`,
      labels: { confirm: "Yes, Delete", cancel: "No, Cancel" },
      confirmProps: { color: "red" },
      cancelProps: { variant: "outline" },
      onCancel: () => {
        // console.log("❌ Delete cancelled by user");
      },
      onConfirm: async () => {
        setDeleting(true);

        try {
          // console.log("🔍 Activity Code:", filters.activityId);
          //  console.log("📋 Deleting records for activity:", filters.activityId);
          //console.log("🆔 Record IDs to delete:", recordIdsToDelete);  

          // Activity-specific delete logic
          let isImplemented = false;
          
          switch (filters.activityId) {
            case "energy_captive_power":
              // console.log("🔌 Deleting Captive Power records...");
              //console.log("   Selected Records:", selectedRecords.length);
              
              // Separate records into renewable, non-renewable, and renewable fuel
              const renewableIds: string[] = [];
              const nonRenewableIds: string[] = [];
              const renewableFuelIds: string[] = [];
              
              // Determine which section each record belongs to based on row ID prefix
              selectedRowIds.forEach((rowId) => {
                if (rowId.startsWith("renewable-fuel-")) {
                  const recordId = rowId.replace("renewable-fuel-", "");
                  renewableFuelIds.push(recordId);
                } else if (rowId.startsWith("renewable-")) {
                  const recordId = rowId.replace("renewable-", "");
                  renewableIds.push(recordId);
                } else if (rowId.startsWith("non-renewable-")) {
                  const recordId = rowId.replace("non-renewable-", "");
                  nonRenewableIds.push(recordId);
                }
              });
              
              // console.log("   Renewable IDs:", renewableIds);
              // console.log("   Non-Renewable IDs:", nonRenewableIds);
              // console.log("   Renewable Fuel IDs:", renewableFuelIds);
              // console.log("   Task Request IDs:", taskRequestIds);
              // console.log("   Organization ID:", filters.organizationId);
              // console.log("   Month:", filters.month);
              // console.log("   Year:", filters.year);
              // console.log("   Location ID:", filters.locationId);
 
              await deleteCaptivePowerRecords({
                renewableIds,
                nonRenewableIds,
                renewableFuelIds,
                taskRequestIds: taskRequestIds,
                organizationId: filters.organizationId,
                month: filters.month,
                year: filters.year,
                orgAddressId: filters.locationId,
                userId: userSession?.userId,
                userEmail: userSession?.userEmail,
                organizationName:
                  organizationOptions.find(
                    (option) => option.value === filters.organizationId
                  )?.label ?? "",
                locationName:
                  locationOptions.find(
                    (option) => option.value === filters.locationId
                  )?.label ?? "",
              });
              isImplemented = true;
              break;

            case "energy_grid_power":
              // console.log("⚡ Deleting Grid Power records...");
              // console.log("   IDs:", recordIdsToDelete);
              // console.log("   Task Request IDs:", taskRequestIds);
              // console.log("   Organization ID:", filters.organizationId);
              // console.log("   Month:", filters.month);
              // console.log("   Year:", filters.year);
              // console.log("   Location ID:", filters.locationId);
              

              await deleteGridPowerRecords({
                ids: recordIdsToDelete,
                taskRequestIds: taskRequestIds,
                organizationId: filters.organizationId,
                month: filters.month,
                year: filters.year,
                orgAddressId: filters.locationId,
                userId: userSession?.userId,
                userEmail: userSession?.userEmail,
                organizationName:
                  organizationOptions.find(
                    (option) => option.value === filters.organizationId
                  )?.label ?? "",
                locationName:
                  locationOptions.find(
                    (option) => option.value === filters.locationId
                  )?.label ?? "",
              });
              isImplemented = true;
              break;

            case "energy_fuel_purchased":
              // console.log("⛽ Deleting Fuel Purchased records...");
              // console.log("   Selected Records:", selectedRecords.length);
              
              // Separate records into general, auxiliary, heating water, and transportation
              const generalIds: string[] = [];
              const auxiliaryIds: string[] = [];
              const heatingWaterIds: string[] = [];
              const transportationIds: string[] = [];
              
              // Determine which section each record belongs to based on row ID prefix
              selectedRowIds.forEach((rowId) => {
                if (rowId.startsWith("general-")) {
                  const recordId = rowId.replace("general-", "");
                  generalIds.push(recordId);
                } else if (rowId.startsWith("auxiliary-")) {
                  const recordId = rowId.replace("auxiliary-", "");
                  auxiliaryIds.push(recordId);
                } else if (rowId.startsWith("heating-water-")) {
                  const recordId = rowId.replace("heating-water-", "");
                  heatingWaterIds.push(recordId);
                } else if (rowId.startsWith("transportation-")) {
                  const recordId = rowId.replace("transportation-", "");
                  transportationIds.push(recordId);
                }
              });
              
              // console.log("   General IDs:", generalIds);
              // console.log("   Auxiliary IDs:", auxiliaryIds);
              // console.log("   Heating Water IDs:", heatingWaterIds);
              // console.log("   Transportation IDs:", transportationIds);
              // console.log("   Task Request IDs:", taskRequestIds);
              // console.log("   Organization ID:", filters.organizationId);
              // console.log("   Month:", filters.month);
              // console.log("   Year:", filters.year);
              // console.log("   Location ID:", filters.locationId);
              
              await deleteFuelPurchasedRecords({
                generalIds,
                auxiliaryIds,
                heatingWaterIds,
                transportationIds,
                taskRequestIds: taskRequestIds,
                organizationId: filters.organizationId,
                month: filters.month,
                year: filters.year,
                orgAddressId: filters.locationId,
                userId: userSession?.userId,
                userEmail: userSession?.userEmail,
                organizationName:
                  organizationOptions.find(
                    (option) => option.value === filters.organizationId
                  )?.label ?? "",
                locationName:
                  locationOptions.find(
                    (option) => option.value === filters.locationId
                  )?.label ?? "",
              });
              isImplemented = true;
              break;

            case "waste":
              // console.log("🗑️ Preparing to delete Waste records...");
              // console.log("   IDs:", recordIdsToDelete);
              // TODO: Implement delete for waste
              // await deleteWaste({ ids: recordIdsToDelete });
              break;

            case "transport_upstream":
              // console.log("🚚 Preparing to delete Transport Upstream records...");
              //  console.log("   IDs:", recordIdsToDelete);
              // TODO: Implement delete for transport upstream
              // await deleteTransportUpstream({ ids: recordIdsToDelete });
              break;

            case "transport_downstream":
              // console.log("🚛 Preparing to delete Transport Downstream records...");
              // console.log("   IDs:", recordIdsToDelete);
              // TODO: Implement delete for transport downstream
              // await deleteTransportDownstream({ ids: recordIdsToDelete });
              break;

            case "transport_business_travel":
              // console.log("✈️ Preparing to delete Business Travel records...");
              // console.log("   IDs:", recordIdsToDelete);
              // TODO: Implement delete for business travel
              // await deleteBusinessTravel({ ids: recordIdsToDelete });
              break;

            case "transport_employee_travel":
              // console.log("🚗 Preparing to delete Employee Travel records...");
              // console.log("   IDs:", recordIdsToDelete);
              // TODO: Implement delete for employee travel
              // await deleteEmployeeTravel({ ids: recordIdsToDelete });
              break;

            default:
              console.warn(`⚠️  No delete handler for activity: ${filters.activityId}`);
              throw new Error(`Delete not implemented for activity: ${filters.activityId}`);
          }

          // Simulate API delay for unimplemented activities
          if (!isImplemented) {
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          console.log("✅ Delete completed successfully");

          // Remove deleted records from sectioned data
          setSectionedData((prevSections) =>
            prevSections.map((section) => ({
              ...section,
              data: section.data.filter(
                (record) => !recordIdsToDelete.includes(record.id)
              ),
            }))
          );

          // Clear row selection
          setRowSelection({});

          notifications.show({
            title: "Success",
            message: `Successfully deleted ${selectedRowIds.length} record${selectedRowIds.length > 1 ? "s" : ""}`,
            color: "green",
          });

          console.log("🎉 Delete operation completed");
        } catch (error) {
          console.error("❌ Error deleting data:", error);
          notifications.show({
            title: "Error",
            message: error instanceof Error ? error.message : "Failed to delete records",
            color: "red",
          });
        } finally {
          setDeleting(false);
        }
      },
    });
  };

  // Define table columns
  const columns = useMemo<MRT_ColumnDef<ActivityDataRecord>[]>(
    () => [
      {
        accessorKey: "id",
        header: "ID",
        size: 80,
      },
      {
        accessorKey: "organizationName",
        header: "Organization",
        size: 200,
      },
      {
        accessorKey: "locationName",
        header: "Location",
        size: 200,
      },
      {
        accessorKey: "month",
        header: "Month",
        size: 120,
      },
      {
        accessorKey: "year",
        header: "Year",
        size: 100,
      },
      {
        accessorKey: "status",
        header: "Status",
        size: 120,
      },
      {
        accessorKey: "createdDate",
        header: "Created Date",
        size: 150,
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
   * Clears all filters, data, and selections (page refresh simulation)
   */
  const handleReset = () => {
    //console.log("🔄 Resetting all filters and data...");
    
    // Clear filters
    setFilters({
      organizationId: "",
      locationId: "",
      activityId: "",
      month: "",
      year: "",
    });

    // Clear data
    setData([]);
    setSectionedData([]);
    setTaskRequestIds([]); // Clear task request IDs

    // Clear row selection
    setRowSelection({});

    // Clear dependent dropdown options
    setLocationOptions([]);
    setActivityOptions([]);

    //console.log("✅ Reset complete - all filters cleared");

    notifications.show({
      title: "Reset Complete",
      message: RESET_SUCCESS_MESSAGE,
      color: "blue",
    });
  };

  /**
   * Toggle section visibility
   */
  const toggleSectionVisibility = (sectionId: string) => {
    setSectionedData((prev) =>
      prev.map((section) =>
        section.id === sectionId
          ? { ...section, isVisible: !section.isVisible }
          : section
      )
    );
  };

  /**
   * Get total record count across all visible sections
   */
  const getTotalRecordCount = () => {
    return sectionedData
      .filter((section) => section.isVisible)
      .reduce((sum, section) => sum + section.data.length, 0);
  };

  return {
    filters,
    organizationOptions,
    locationOptions,
    activityOptions,
    monthOptions: MONTHS,
    yearOptions: YEARS,
    data,
    sectionedData,
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
    toggleSectionVisibility,
    getTotalRecordCount,
  };
};
