import React from "react";
import { Text, Stack, Flex, Card } from "@mantine/core";

interface FormBannerProps {
  theme: string;
  text: boolean;
  confirmationHeader: boolean;
  confirmationText: boolean;
}

const FormTextBanner: React.FC<FormBannerProps> = ({
  theme,
  text,
  confirmationHeader,
  confirmationText,
}) => {
  return (
    <Card bg={theme} p="xs">
      {text && (
        <Flex>
          <Text fw="700" size="xs">
            Note :
          </Text>
          <Text size="xs">
            Don’t worry, you can add more products and related SKUs one by one.
          </Text>
        </Flex>
      )}
      {(confirmationHeader || confirmationText) && (
        <Stack gap="0">
          <Text fw="600" size="xs">
            Your entry is successfully added to the table.
          </Text>
          <Text size="xs">
            You can keep adding more entries in similar way. Once all the
            entries are added you can scroll to the next section of this form or
            click on next button at the bottom to proceed to next step.
          </Text>
        </Stack>
      )}
    </Card>
  );
};

export default FormTextBanner;
