import { Stack } from "@mantine/core";
import Body from "../listing/body";
export interface ListingPageProps {
  data: any;
}

const ListingPage: React.FC<ListingPageProps> = () => {
  return (
    <Stack gap={10}>
      {/* <Header data="ddd" /> */}
      {/* <HeaderFilters data={"55"} /> */}
      <Body data="dd" />
      {/* <Footer data={10} /> */}
    </Stack>
  );
};
export default ListingPage;
