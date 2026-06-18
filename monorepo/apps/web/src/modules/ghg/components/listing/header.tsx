import { Title } from "@mantine/core";

export interface HeaderProps {
  data: any;
}

const Header: React.FC<HeaderProps> = () => {
  return (
    <Title fz={16} c="#000" fw={600}>
      GHG Report
    </Title>
  );
};
export default Header;
