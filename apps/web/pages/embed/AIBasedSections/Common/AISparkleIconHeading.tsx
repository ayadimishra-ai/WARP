import { Flex, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import SparkleCircleIcon from "@warp/client/icons/SparkleCircleIcon";
const AISparkleIconHeading: React.FC<{ label?: string }> = ({ label }) => {
  const smallScreen = useMediaQuery("(max-width: 1282px)");
  return (
    <Flex align="center" gap={15}>
      <SparkleCircleIcon width={29} height={29} />
      <Text fz={smallScreen ? 14 : 15} lh="100%" c="#444444">
        {label}
      </Text>
    </Flex>
  );
};

export default AISparkleIconHeading;
