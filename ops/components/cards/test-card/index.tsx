"use client";

import { Badge, Card, Group, Image, Text } from "@mantine/core";

export interface ITestCardProps {
  imageUrl: string;
  title: string;
  description: string;
  badge: string;
}

const TestCard: React.FC<ITestCardProps> = (props) => {
  return (
    <Card shadow="sm" padding="lg" radius="md">
      <Card.Section>
        <Image src={props.imageUrl} height={160} alt="Norway" />
      </Card.Section>

      <Group justify="space-between" mt="md" mb="xs">
        <Text fw={500}>{props.title}</Text>
        <Badge color="pink">{props.badge}</Badge>
      </Group>

      <Text size="sm" c="dimmed">
        {props.description}
      </Text>
    </Card>
  );
};

export default TestCard;
