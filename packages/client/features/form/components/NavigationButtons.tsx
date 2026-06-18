import { Button, Group, Tooltip } from "@mantine/core";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons";
import React from "react";

interface NavigationButtonsProps {
  isFirst: boolean;
  isLast: boolean;
  nextQuesBtn: (e: any) => Promise<any>;
  prevQuesBtn: (e: any) => Promise<any>;
  loading: boolean;
  submitDetails?: () => Promise<void>;
  showSubmit?: boolean;
}

export const NavigationButtons: React.FC<NavigationButtonsProps> = ({
  isFirst,
  isLast,
  nextQuesBtn,
  prevQuesBtn,
  loading,
  submitDetails,
  showSubmit = false,
}) => {
  return (
    <Group position="apart">
      <Tooltip label={isFirst ? "First question" : "Previous question"}>
        <Button
          onClick={prevQuesBtn}
          disabled={isFirst || loading}
          leftIcon={<IconChevronLeft size={14} />}
          variant="outline"
        >
          Previous
        </Button>
      </Tooltip>

      {showSubmit && submitDetails ? (
        <Button onClick={submitDetails} disabled={loading} loading={loading}>
          Submit
        </Button>
      ) : (
        <Tooltip label={isLast ? "Last question" : "Next question"}>
          <Button
            onClick={nextQuesBtn}
            disabled={isLast || loading}
            rightIcon={<IconChevronRight size={14} />}
          >
            Next
          </Button>
        </Tooltip>
      )}
    </Group>
  );
};
