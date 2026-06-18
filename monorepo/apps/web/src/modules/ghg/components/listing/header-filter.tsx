import { Button, Group } from "@mantine/core";

export interface HeaderFiltersProps {
  data: any;
}

const HeaderFilters: React.FC<HeaderFiltersProps> = () => {
  return (
    <Group gap={15}>
      <Button variant="transparent" p={0} h={20} fw={600} fz={14} c={"#FF9E1B"}>
        All (15)
      </Button>
      <Button variant="transparent" p={0} h={20} fw={600} fz={14} c={"#666"}>
        Pending (4)
      </Button>
      <Button variant="transparent" p={0} h={20} fw={600} fz={14} c={"#666"}>
        Submitted (5)
      </Button>
      <Button variant="transparent" p={0} h={20} fw={600} fz={14} c={"#666"}>
        Published (6)
      </Button>
    </Group>
  );
};
export default HeaderFilters;
