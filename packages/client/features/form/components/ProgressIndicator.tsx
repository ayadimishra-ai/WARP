import { Box, Group, Progress, Text } from "@mantine/core";
import React from "react";

interface ProgressIndicatorProps {
  percentage: number;
  showText?: boolean;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  percentage,
  showText = true,
}) => {
  return (
    <Box mb={20}>
      {showText && (
        <Group position="apart" mb={5}>
          <Text size="sm" weight={500}>
            Progress
          </Text>
          <Text size="sm">{percentage}%</Text>
        </Group>
      )}
      <Progress value={percentage} size="sm" color="blue" radius="xl" />
    </Box>
  );
};
