import { Flex, Popover, Stack, Text } from "@mantine/core";
import { IconAlertCircleFilled } from "@tabler/icons-react";
import React from "react";
import classes from "./formstyles.module.css";

interface FormHeaderProps {
  header: string;
  text: string;
  mandatoryText?: string | null;
}

const FormHeader: React.FC<FormHeaderProps> = ({
  header,
  text,
  mandatoryText = "* Mandatory fields",
}) => {
  let headerColor = "#FFA93C";
  let mandatoryTxtClr = "#FF0000";
  const alertIcon = <IconAlertCircleFilled color="#CDCDCD" size={16} />;
  return (
    <Stack gap="xs">
      <Text fw="700" size="20px">
        Please enter the required data to calculate carbon inventory of selected
        location & month
      </Text>
      <Flex justify="space-between">
        <Flex align="center" gap="sm">
          <Text
            c={headerColor}
            fw="600"
            classNames={{
              root: `${classes.formHeaderFontSize}`,
            }}
          >
            {header}
          </Text>
          <Popover
            width={200}
            trapFocus
            position="bottom"
            withArrow
            shadow="md"
          >
            <Popover.Target>{alertIcon}</Popover.Target>
            <Popover.Dropdown>
              <Text size={"12px"} c="#666666">
                {header}
              </Text>
            </Popover.Dropdown>
          </Popover>
        </Flex>
        {mandatoryText && (
          <Text size="10px" c={mandatoryTxtClr}>
            {mandatoryText}
          </Text>
        )}
      </Flex>
      <Text size="12px">{text}</Text>
    </Stack>
  );
};

export default FormHeader;
