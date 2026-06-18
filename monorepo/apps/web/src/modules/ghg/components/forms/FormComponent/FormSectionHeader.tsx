import React from "react";
import { Text, Popover, Card, Flex } from "@mantine/core";
import { IconAlertCircleFilled } from "@tabler/icons-react";

interface FormSectionHeaderProps {
  headerText: string;
  actionIcon: boolean;
  resourceType: string | null;
  popoverText:string;
}
const FormSectionHeader: React.FC<FormSectionHeaderProps> = ({
  headerText,
  resourceType,
  actionIcon,
  popoverText
}) => {
  const alertIcon = <IconAlertCircleFilled color="#CDCDCD" size={16} />;
  const renewableText = resourceType === "Renewable";
  const backgroundColor = renewableText ? "#00B41D" : "#E9525B";
  return (
    <>
      <Flex align="center" gap="md">
        <Text size="md" fw="700">
          {headerText}
        </Text>
        {resourceType && (
          <Card bg={backgroundColor} p="4" radius="xs">
            <Text size="11px" c="#FFF" fw="600">
              {resourceType}
            </Text>
          </Card>
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
    </>
  );
};

export default FormSectionHeader;
