import RecommendationList from "@warp/client/features/recommendation/components/RecommendationList";
import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { GetServerSideProps } from "next";

const EmbedRecommendationList: NextPageType = (invitationId) => {
  return <RecommendationList />;
};

EmbedRecommendationList.getLayout = (page) => {
  return page;
};

EmbedRecommendationList.title = "Home";

EmbedRecommendationList.auth = true;
export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;

export default EmbedRecommendationList;
