import SendInvitation from "@warp/client/features/invitation/components/send-invitation";
import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { GetServerSideProps } from "next";

const EmbedSendInvite: NextPageType = () => {
  return <SendInvitation />;
};

EmbedSendInvite.getLayout = (page) => {
  return page;
};

EmbedSendInvite.title = "Home";

EmbedSendInvite.auth = true;
export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;

export default EmbedSendInvite;
