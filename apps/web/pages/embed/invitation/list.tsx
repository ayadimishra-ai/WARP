import InvitationList from "@warp/client/features/invitation/components/InvitationList";
import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { GetServerSideProps } from "next";

const EmbedInvitationList: NextPageType = () => {
  return <InvitationList />;
};

EmbedInvitationList.getLayout = (page) => {
  return page;
};

EmbedInvitationList.title = "Home";

EmbedInvitationList.auth = true;
export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;

export default EmbedInvitationList;
