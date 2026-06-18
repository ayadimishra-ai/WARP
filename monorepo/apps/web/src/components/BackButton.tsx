import { Anchor, Group } from "@mantine/core";
import { IconArrowNarrowLeft } from "@tabler/icons-react";
import Link from "next/link";

interface BackButtonProps {
  href: string;
  color?: string;
  size?: number;
}

export default function BackButton({
  href,
  color = "#999999",
  size = 25,
}: BackButtonProps) {
  return (
      <Anchor
        component={Link}
        href={href}
        underline="never"
        fz={10}
        fw={600}
        c={color}
        pos="absolute"
        top={10}
        left={10}
        lts="0.2rem"
      >
        <Group gap={4} align="center">
          <IconArrowNarrowLeft size={size} />
          <span>BACK</span>
        </Group>
      </Anchor>
  );
}
