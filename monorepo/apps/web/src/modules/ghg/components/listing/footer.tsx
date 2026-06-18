import { Pagination, useMantineTheme } from "@mantine/core";
export interface ListingPageFooterProps {
  data: any;
}

const ListingPageFooter: React.FC<ListingPageFooterProps> = (props: any) => {
  const theme = useMantineTheme();
  return (
    <Pagination
      mt={16}
      radius={100}
      color={theme.colors.secondary[5]}
      c={"#000"}
      fw={600}
      total={props.data}
    />
  );
};
export default ListingPageFooter;
