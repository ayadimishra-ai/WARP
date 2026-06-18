"use client";

import {
  Button,
  Flex,
  Modal,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { useEmissionCalculationsRetrigger } from "../hooks/use-emission-calculations-retrigger";

const EmissionCalculationsRetrigger = () => {
  const {
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
  } = useEmissionCalculationsRetrigger();

  return (
    <Stack gap={24} p={24}>
      <Title order={2} c="#003b52">
        Emission Calculations Retrigger
      </Title>

      <Text c="dimmed" size="sm">
        Select filters and retrigger emission calculations for the specified
        criteria.
      </Text>

      {/* Filter Section */}
      <Flex
        direction={{ base: "column", sm: "row" }}
        gap={16}
        wrap="wrap"
        align="flex-end"
      >
        <Select
          label="Organization"
          placeholder="Select organization"
          data={organizationOptions}
          value={filters.organizationId}
          onChange={(value) =>
            handleFilterChange("organizationId", value || "")
          }
          searchable
          clearable
          style={{ flex: 1, minWidth: 200 }}
          required
        />

        <Select
          label="Location"
          placeholder="Select location"
          data={locationOptions}
          value={filters.locationId}
          onChange={(value) => handleFilterChange("locationId", value || "")}
          searchable
          clearable
          disabled={!filters.organizationId}
          style={{ flex: 1, minWidth: 200 }}
          required
        />

        <Select
          label="Activity"
          placeholder="Select activity"
          data={activityOptions}
          value={filters.activityId}
          onChange={(value) => handleFilterChange("activityId", value || "")}
          searchable
          clearable
          disabled={!filters.organizationId}
          style={{ flex: 1, minWidth: 200 }}
          required
        />

        <Select
          label="Month"
          placeholder="Select month"
          data={monthOptions}
          value={filters.month}
          onChange={(value) => handleFilterChange("month", value || "")}
          searchable
          clearable
          style={{ flex: 1, minWidth: 200 }}
        />

        <Select
          label="Year"
          placeholder="Select year"
          data={yearOptions}
          value={filters.year}
          onChange={(value) => handleFilterChange("year", value || "")}
          searchable
          clearable
          style={{ flex: 1, minWidth: 200 }}
        />

        <Button
          onClick={handleRetriggerClick}
          disabled={!isFormValid || loading}
          loading={loading}
          style={{
            background: isFormValid
              ? "linear-gradient(90deg, #0B3C5D 0%, #1E6072 100%)"
              : undefined,
          }}
        >
          Retrigger Emissions
        </Button>
      </Flex>

      {/* Confirmation Modal */}
      <Modal
        opened={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Retrigger"
        centered
      >
        <Stack gap={16}>
          <Text>
            Are you sure you want to retrigger emissions for the selected
            filters?
          </Text>

          <Stack gap={8}>
            <Text size="sm" c="dimmed">
              <strong>Organization:</strong>{" "}
              {organizationOptions.find(
                (org) => org.value === filters.organizationId
              )?.label || filters.organizationId}
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Location:</strong>{" "}
              {locationOptions.find((loc) => loc.value === filters.locationId)
                ?.label || filters.locationId}
            </Text>
            <Text size="sm" c="dimmed">
              <strong>Activity:</strong>{" "}
              {activityOptions.find((act) => act.value === filters.activityId)
                ?.label || filters.activityId}
            </Text>
            {filters.month && (
              <Text size="sm" c="dimmed">
                <strong>Month:</strong> {filters.month}
              </Text>
            )}
            {filters.year && (
              <Text size="sm" c="dimmed">
                <strong>Year:</strong> {filters.year}
              </Text>
            )}
          </Stack>

          <Flex gap={12} justify="flex-end" mt={16}>
            <Button
              variant="outline"
              onClick={() => setConfirmModalOpen(false)}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirmRetrigger}
              loading={loading}
              style={{
                background: "linear-gradient(90deg, #0B3C5D 0%, #1E6072 100%)",
              }}
            >
              Confirm
            </Button>
          </Flex>
        </Stack>
      </Modal>
    </Stack>
  );
};

export default EmissionCalculationsRetrigger;
