import { Badge, Flex, Popover, Stack, Text } from "@mantine/core";
import { IconAlertCircleFilled } from "@tabler/icons-react";
import React from "react";

interface InputLabelSectionProps {
  label: string;
  withAsterisk?: boolean;
  resourceType?: string | null;
  actionIcon?: boolean;
  popoverText?: string;
  description?: string;
}

const InputLabelSection: React.FC<InputLabelSectionProps> = ({
  label,
  withAsterisk,
  resourceType,
  actionIcon,
  popoverText,
  description,
}) => {
  const alertIcon = <IconAlertCircleFilled color="#CDCDCD" size={16} />;
  const renewableText = resourceType === "Renewable";
  const backgroundColor = renewableText ? "#00B41D" : "#E9525B";

  return (
    <Stack gap="xs">
      <Flex align="center" gap="6px">
        <Flex align="center" gap="2px">
          <Text size="14px" fw="600" c="#1A1A1A" lh="16px">
            {label}
            {withAsterisk && (
              <Text component="span" size="12px" c="#FF0000" fw="600" ml="2px">
                *
              </Text>
            )}
          </Text>
        </Flex>
        {resourceType && (
          <Badge color={backgroundColor} radius="xs" size="sm">
            <Text size="11px" fw="600" tt="capitalize">
              {resourceType}
            </Text>
          </Badge>
        )}
        {actionIcon && (
          <Popover
            width={200}
            trapFocus
            position="bottom"
            withArrow
            shadow="md"
          >
            <Popover.Target>{alertIcon}</Popover.Target>
            <Popover.Dropdown>
              <Text size="xs" c="#666666">
                {popoverText}
              </Text>
            </Popover.Dropdown>
          </Popover>
        )}
      </Flex>
      {description && (
        <Text size="12px" fw={500} c="#1A1A1A">
          {description}
        </Text>
      )}
    </Stack>
  );
};

export default InputLabelSection;
