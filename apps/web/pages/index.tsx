import { Box } from "@mantine/core";
import MainLayout from "@warp/client/layouts/MainLayout";
import { NextPageType } from "@warp/client/types/page-types";

const HomePage: NextPageType = ({}) => {
  return <Box>Home Page</Box>;
};

HomePage.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>;
};

HomePage.title = "Home";

export default HomePage;
