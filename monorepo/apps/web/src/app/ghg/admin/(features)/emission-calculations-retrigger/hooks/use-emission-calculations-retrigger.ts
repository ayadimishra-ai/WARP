import { useState, useEffect, useCallback } from "react";
import { notifications } from "@mantine/notifications";
import { months } from "@/modules/ghg/utils/date.util";
import {
  getActivitiesByOrganization,
  getLocationsByOrganization,
  getOrganizationList,
  retriggerEmissions,
} from "../components/emission-calculations-retrigger-server";
import type {
  ActivityOption,
  EmissionCalculationsRetriggerFilters,
  LocationOption,
  OrganizationOption,
} from "../types";

// Allowed activities for emission retrigger
const ALLOWED_ACTIVITY_CODES = [
  "transport_upstream",
  "energy_grid_power",
  "energy_captive_power",
  "waste",
  "energy_fuel_purchased",
  "transport_business_travel",
  "transport_employee_travel",
  "transport_downstream",
  "material_procurement",
  "fugitive_details",
];

export const useEmissionCalculationsRetrigger = () => {
  // Form state
  const [filters, setFilters] = useState<EmissionCalculationsRetriggerFilters>({
    organizationId: "",
    locationId: "",
    activityId: "",
    month: "",
    year: "",
  });

  // Dropdown options state
  const [organizationOptions, setOrganizationOptions] = useState<
    OrganizationOption[]
  >([]);
  const [locationOptions, setLocationOptions] = useState<LocationOption[]>([]);
  const [activityOptions, setActivityOptions] = useState<ActivityOption[]>([]);
  const [loading, setLoading] = useState(false);

  // Confirmation modal state
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);

  // Generate year options (current year and previous 10 years)
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 11 }, (_, i) => ({
    label: String(currentYear - i),
    value: String(currentYear - i),
  }));

  // Generate month options
  const monthOptions = months.map((month) => ({
    label: month,
    value: month,
  }));

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
            mapping?.Activity?.Activities?.filter(
              (activity) =>
                activity?.code && ALLOWED_ACTIVITY_CODES.includes(activity.code)
            )?.map((activity) => ({
              label: activity?.name || "",
              value: activity?.code || "",
            })) || []
          ) || [];

        setActivityOptions(activityList);
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
  const handleFilterChange = useCallback(
    (field: keyof EmissionCalculationsRetriggerFilters, value: string) => {
      setFilters((prev) => ({ ...prev, [field]: value }));
    },
    []
  );

  // Check if all required fields are filled (month and year are optional)
  const isFormValid =
    !!filters.organizationId &&
    !!filters.locationId &&
    !!filters.activityId;

  // Handle retrigger button click
  const handleRetriggerClick = useCallback(() => {
    setConfirmModalOpen(true);
  }, []);

  // Handle confirmation
  const handleConfirmRetrigger = useCallback(async () => {
    setLoading(true);
    setConfirmModalOpen(false);

    console.log("🚀 Starting emission retrigger...");
    console.log("📋 Filters:", {
      organizationId: filters.organizationId,
      locationId: filters.locationId,
      activityId: filters.activityId,
      month: filters.month || "(not selected)",
      year: filters.year || "(not selected)",
    });

    try {
      // Build payload dynamically following activitydata-removal pattern
      // Only include month/year if selected (same as activity-data-removal)
      const payload = {
        organizationId: filters.organizationId,
        locationId: filters.locationId,
        activityId: filters.activityId,
        ...(filters.month && { month: filters.month }),
        ...(filters.year && { year: parseInt(filters.year, 10) }),
      };

      console.log("📦 Payload:", payload);
      
      // Call retrigger emissions (follows same pattern as activity-data-removal delete operations)
      const response = await retriggerEmissions(payload);
      
      console.log("✅ Response:", response);

      if (response.success) {
        notifications.show({
          title: "Success",
          message:
            response.message || "Emission retrigger completed successfully",
          color: "green",
        });
      } else {
        notifications.show({
          title: "Error",
          message: response.message || "Failed to retrigger emissions",
          color: "red",
        });
      }
    } catch (error) {
      console.error("❌ Error triggering emissions:", error);
      notifications.show({
        title: "Error",
        message:
          error instanceof Error
            ? error.message
            : "An unexpected error occurred",
        color: "red",
      });
    } finally {
      setLoading(false);
      console.log("🏁 Emission retrigger process completed\n");
    }
  }, [filters]);

  return {
    filters,
    organizationOptions,
    locationOptions,
    activityOptions,
    yearOptions,
    monthOptions,
    loading,
    confirmModalOpen,
    setConfirmModalOpen,
    isFormValid,
    handleFilterChange,
    handleRetriggerClick,
    handleConfirmRetrigger,
  };
};
