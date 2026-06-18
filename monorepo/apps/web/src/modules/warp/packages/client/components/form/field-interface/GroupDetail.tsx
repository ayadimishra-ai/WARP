import { Divider, Stack, Title } from "@mantine/core";
import GroupRaw from "./GroupRaw";
import { ReactNode } from "react";
type Props = {
  children: ReactNode;
  title: string;
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    horizontal: boolean;
    spacing: number;
    columns: {
      xs: number;
      sm: number;
      md: number;
      lg: number;
    };
  };
  display: string;
  displayOptions: object;
};
const GroupDetails = ({
  children,
  title,
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Stack>
      <Title order={3}>{title}</Title>
      <Divider />
      {children}
      <GroupRaw
        fieldOptions={fieldOptions}
        interfaceOptions={interfaceOptions}
        display={display}
        displayOptions={displayOptions}
      >
        {children}
      </GroupRaw>
    </Stack>
  );
};
export default GroupDetails;
