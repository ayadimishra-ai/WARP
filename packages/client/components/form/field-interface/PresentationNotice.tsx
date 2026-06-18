import { Icon } from "@iconify/react";
import { Box, Notification } from "@mantine/core";

type Props = {
  fieldOptions: {
    required: boolean;
    enable: boolean;
    readonly: boolean;
  };
  interfaceOptions: {
    title: string;
    subTitle: string;
    color: string;
    icon: string;
    closeButton: boolean;
  };
  display: string;
  displayOptions: {};
};

const PresentationNotice = ({
  fieldOptions,
  interfaceOptions,
  display,
  displayOptions,
}: Props) => {
  return (
    <Box>
      {fieldOptions.enable && (
        <Notification
          icon={<Icon icon={interfaceOptions?.icon} />}
          color="blue"
          title={interfaceOptions?.title}
          disallowClose={!interfaceOptions?.closeButton}
        >
          {interfaceOptions?.subTitle}
        </Notification>
      )}
    </Box>
  );
};
export default PresentationNotice;
