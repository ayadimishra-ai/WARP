import { Flex, Image } from "@mantine/core";

interface LogoProps {
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}

export default function Logo({ width = 160}: LogoProps) {
  return (
    <Flex justify="center" mb={12}>
      <Image
        src="/snowkap-logo.svg"
        alt="Snowkap Logo"
        w={width}
      />
    </Flex>
  );
}
