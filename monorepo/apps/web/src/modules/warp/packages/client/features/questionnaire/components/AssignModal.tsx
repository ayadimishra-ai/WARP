import {
  Alert,
  Box,
  Button,
  Divider,
  Group,
  Modal,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import {
  IconInfoCircle,
  IconUserPlus,
} from "@tabler/icons-react";
import React, { useEffect, useMemo, useState } from "react";

import { useQuestionnaireModalContext } from "../context/QuestionnaireModalProvider";
import { useGetInvitersQuery } from "@/modules/warp/packages/graphql/queries/generated/get-inviters";
import { useGetInternalRequestCompanyQuery } from "@/modules/warp/packages/graphql/queries/generated/GetInternalRequestCompany";

export const AssignModal: React.FC = () => {
  const {
    isAssignModalOpen,
    closeAssignModal,
    selectedQuestionnaire,
    handleAssign,
  } = useQuestionnaireModalContext();
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [assignmentType, setAssignmentType] = useState<"Internal" | "External">(
    "External"
  );

  const { data: invitersData } = useGetInvitersQuery();
  const { data: internalCompanyData } = useGetInternalRequestCompanyQuery();

  const assigneeOptions = useMemo(
    () =>
      invitersData?.User.map((user) => ({
        value: user.Company?.id || user.id, // Use company ID if available
        label: `${user.name} (${user.Company?.name || "No Company"})`,
        userId: user.id, // Store user ID for reference
        companyId: user.Company?.id, // Store company ID
      })) || [],
    [invitersData]
  );

  useEffect(() => {
    if (selectedQuestionnaire?.assignedTo) {
      // Determine if assignment type is Internal or External based on GlobalMaster config
      const isInternal = !!internalCompanyData?.GlobalMaster?.[0]?.data?.some(
        (a: any) =>
          a.formId === selectedQuestionnaire.id &&
          a.companyId === selectedQuestionnaire.assignedTo &&
          a.IsEnable === true
      );
      setAssignmentType(isInternal ? "Internal" : "External");

      // Pre-load assignee if the questionnaire is already assigned
      // Try to find matching option by company ID or user ID
      const matchingOption = assigneeOptions.find(
        (opt) =>
          opt.value === selectedQuestionnaire.assignedTo ||
          opt.companyId === selectedQuestionnaire.assignedTo ||
          opt.userId === selectedQuestionnaire.assignedTo
      );

      if (matchingOption) {
        setSelectedAssignee(matchingOption.value);
      } else {
        // Fallback: use the assignedTo value directly
        setSelectedAssignee(selectedQuestionnaire.assignedTo);
      }
    } else {
      // Reset if no assignment
      setSelectedAssignee("");
      setAssignmentType("External");
    }
  }, [selectedQuestionnaire, assigneeOptions, internalCompanyData]);

  const handleSubmit = () => {
    if (selectedQuestionnaire && selectedAssignee) {
      // Find the selected user's company ID
      const selectedOption = assigneeOptions.find(
        (opt) => opt.value === selectedAssignee
      );
      const companyId = selectedOption?.companyId || selectedAssignee;

      const internalData =
        assignmentType === "Internal" &&
        internalCompanyData?.GlobalMaster &&
        internalCompanyData.GlobalMaster.length > 0
          ? internalCompanyData.GlobalMaster[0]
          : undefined;

      handleAssign(
        selectedQuestionnaire,
        companyId, // Pass company ID instead of user ID
        undefined, // No due date
        undefined, // No notes
        assignmentType,
        internalData
      );
    }
    // Reset form
    setSelectedAssignee("");
    setAssignmentType("External");
  };

  const handleClose = () => {
    setSelectedAssignee("");
    setAssignmentType("External");
    closeAssignModal();
  };

  const isFormValid =
    assignmentType === "Internal" || selectedAssignee.length > 0;

              console.log("🚀 ~ AssignModal ~ selectedQuestionnaire?.assignedTo:", selectedQuestionnaire?.assignedTo)
  return (
    <Modal
      opened={isAssignModalOpen}
      onClose={handleClose}
      title="Assign Questionnaire"
      size="md"
      centered
    >
      <Stack gap="md">
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="orange"
          variant="light"
        >
          <Text size="sm">
            Assign this questionnaire to an internal team or an external
            company.
          </Text>
        </Alert>

        {selectedQuestionnaire && (
          <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
            <Text size="sm" fw={500} mb="xs">
              Selected Questionnaire:
            </Text>
            <Text size="sm">{selectedQuestionnaire.title}</Text>
            <Text size="xs" c="dimmed">
              {selectedQuestionnaire.description}
            </Text>
          </Box>
        )}

        <Divider />

        {/* Show currently assigned companies if any */}
        {selectedQuestionnaire?.companyNames && (
          <Box
            p="sm"
            style={{
              backgroundColor: "#e7f5ff",
              borderRadius: 4,
              border: "1px solid #74c0fc",
            }}
          >
            <Text size="sm" fw={500} mb="xs">
              Currently Assigned To:
            </Text>
            <Text size="sm">{selectedQuestionnaire.companyNames}</Text>
          </Box>
        )}

        <Stack gap="md">
          {selectedQuestionnaire?.formtype !== "Report" && (
            <Select
              label="Assignment Type"
              data={[
                { value: "Internal", label: "Internal" },
                { value: "External", label: "External" },
              ]}
              value={assignmentType}
              onChange={(value) =>
                setAssignmentType(
                  (value as "Internal" | "External") || "External"
                )
              }
              required
              disabled={!!selectedQuestionnaire?.assignedTo}
            />
          )}

          <Select
            label="Assign to"
            placeholder="Select a person"
            data={assigneeOptions}
            value={selectedAssignee}
            onChange={(value) => setSelectedAssignee(value || "")}
            searchable
            required
            leftSection={<IconUserPlus size={16} />}
            leftSectionPointerEvents="none"
            styles={{
              input: {
                paddingLeft: "36px",
              },
            }}
            // disabled={assignmentType === "Internal"}
          />

          {selectedAssignee && (
            <Box
              p="sm"
              style={{
                backgroundColor: "#fff3cd",
                borderRadius: 4,
                border: "1px solid #ffeaa7",
              }}
            >
              {assignmentType && selectedQuestionnaire?.formtype !== "Report" && (
                <Text size="sm" fw={500} mb="xs">
                  New Assignment Summary:
                </Text>
              )}
              <Text size="sm">
                <strong>
                  {selectedQuestionnaire?.assignedTo ? "Assign to" : "Assignee"}
                  :
                </strong>{" "}
                {
                  assigneeOptions.find((opt) => opt.value === selectedAssignee)
                    ?.label
                }
              </Text>
              {assignmentType && selectedQuestionnaire?.formtype !== "Report" && (
                <Text size="sm">
                  <strong>Type:</strong> {assignmentType}
                </Text>
              )}
            </Box>
          )}
        </Stack>

        <Group justify="right" gap="sm">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftSection={<IconUserPlus size={16} />}
            onClick={handleSubmit}
            disabled={!isFormValid}
            color="orange"
          >
            Assign Questionnaire
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};
