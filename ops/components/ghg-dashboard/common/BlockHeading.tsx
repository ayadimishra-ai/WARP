import { Text } from "@mantine/core";
type props = {
  title: string;
};
const BlockHeading: React.FC<props> = ({ title }) => {
  return (
    <Text fz={{ base: 14, xl: 16 }} c="#000000" fw={700} pt="xl" pb="0">
      {title}
    </Text>
  );
};

export default BlockHeading;
