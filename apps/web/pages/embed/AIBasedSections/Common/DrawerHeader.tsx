import { ActionIcon, Flex, Text } from "@mantine/core";
import { useMediaQuery } from "@mantine/hooks";
import { IconX } from "@tabler/icons";
import { useState } from "react";

interface DrawerHeaderProps {
  title: string;
  onClose: () => void;
}

const DrawerHeader: React.FC<DrawerHeaderProps> = ({ title, onClose }) => {
  const smallScreen = useMediaQuery("(max-width: 1282px)");
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <Flex align="center" justify="space-between" h={36}>
      <Text fw={500} fz={smallScreen ? 12 : 14} c="#B7B7B7">
        {title}
      </Text>
      <ActionIcon
        variant="transparent"
        size={smallScreen ? 16 : 20}
        onClick={onClose}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        sx={{ opacity: isHovered ? 1 : 0.3 }}
      >
        <IconX color={isHovered ? "#003B52" : "#444444"} />
      </ActionIcon>
    </Flex>
  );
};

export default DrawerHeader;
