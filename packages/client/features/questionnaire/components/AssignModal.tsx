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
  Textarea,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import {
  IconCalendar,
  IconInfoCircle,
  IconUserPlus,
} from "@tabler/icons-react";
import React, { useState } from "react";
import { useQuestionnaireModalContext } from "../context/QuestionnaireModalProvider";

export const AssignModal: React.FC = () => {
  const {
    isAssignModalOpen,
    closeAssignModal,
    selectedQuestionnaire,
    handleAssign,
  } = useQuestionnaireModalContext();
  const [selectedAssignee, setSelectedAssignee] = useState<string>("");
  const [dueDate, setDueDate] = useState<Date | null>(null);
  const [notes, setNotes] = useState("");

  // Mock assignee options - would come from real data in production
  const assigneeOptions = [
    { value: "admin", label: "Admin" },
    { value: "user1", label: "John Smith (Manager)" },
    { value: "user2", label: "Sarah Johnson (Analyst)" },
    { value: "company1", label: "Company A" },
    { value: "company2", label: "Company B" },
    { value: "team1", label: "Risk Assessment Team" },
    { value: "team2", label: "Compliance Team" },
  ];

  const handleSubmit = () => {
    if (selectedQuestionnaire && selectedAssignee) {
      handleAssign(
        selectedQuestionnaire,
        selectedAssignee,
        dueDate || undefined,
        notes || undefined
      );
    }
    // Reset form
    setSelectedAssignee("");
    setDueDate(null);
    setNotes("");
  };

  const handleClose = () => {
    setSelectedAssignee("");
    setDueDate(null);
    setNotes("");
    closeAssignModal();
  };

  const isFormValid = selectedAssignee.length > 0;

  return (
    <Modal
      opened={isAssignModalOpen}
      onClose={handleClose}
      title="Assign Questionnaire"
      size="md"
      centered
    >
      <Stack spacing="md">
        <Alert
          icon={<IconInfoCircle size={16} />}
          color="orange"
          variant="light"
        >
          <Text size="sm">
            This is a UI mockup. The assignment functionality is not yet
            implemented.
          </Text>
        </Alert>

        {selectedQuestionnaire && (
          <Box p="sm" style={{ backgroundColor: "#f8f9fa", borderRadius: 4 }}>
            <Text size="sm" weight={500} mb="xs">
              Selected Questionnaire:
            </Text>
            <Text size="sm">{selectedQuestionnaire.title}</Text>
            <Text size="xs" c="dimmed">
              {selectedQuestionnaire.description}
            </Text>
          </Box>
        )}

        <Divider />

        <Stack spacing="md">
          <Select
            label="Assign to"
            placeholder="Select a person, company, or team"
            data={assigneeOptions}
            value={selectedAssignee}
            onChange={(value) => setSelectedAssignee(value || "")}
            searchable
            required
            icon={<IconUserPlus size={16} />}
          />

          <DatePicker
            label="Due Date (Optional)"
            placeholder="Select due date"
            icon={<IconCalendar size={16} />}
            value={dueDate}
            onChange={setDueDate}
            minDate={new Date()}
            clearable
          />

          <Textarea
            label="Assignment Notes (Optional)"
            placeholder="Add any specific instructions or notes for the assignee..."
            value={notes}
            onChange={(event) => setNotes(event.currentTarget.value)}
            minRows={3}
            maxRows={5}
            autosize
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
              <Text size="sm" weight={500} mb="xs">
                Assignment Summary:
              </Text>
              <Text size="sm">
                <strong>Assignee:</strong>{" "}
                {
                  assigneeOptions.find((opt) => opt.value === selectedAssignee)
                    ?.label
                }
              </Text>
              {dueDate && (
                <Text size="sm">
                  <strong>Due Date:</strong> {dueDate.toLocaleDateString()}
                </Text>
              )}
              {notes && (
                <Text size="sm">
                  <strong>Notes:</strong> {notes}
                </Text>
              )}
            </Box>
          )}
        </Stack>

        <Group position="right" spacing="sm">
          <Button variant="subtle" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            leftIcon={<IconUserPlus size={16} />}
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
