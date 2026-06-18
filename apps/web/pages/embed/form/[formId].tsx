import SendInvitation from "@warp/client/features/invitation/components/send-invitation";
import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { GetServerSideProps } from 'next';

const EmbedForm: NextPageType = () => {
  return <SendInvitation />;
};

EmbedForm.getLayout = (page) => {
  return page;
};

export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;

EmbedForm.title = "Form";

EmbedForm.auth = true;

export default EmbedForm;
