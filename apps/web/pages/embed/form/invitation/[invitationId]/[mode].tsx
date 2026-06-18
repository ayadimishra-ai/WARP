import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { GetServerSideProps } from "next";
import { useRouter } from "next/router";
import WarpFormScreen from "../../../../../screens/WarpFormScreen";

const FormPage: NextPageType = () => {
  const { query } = useRouter();
  const { invitationId } = query;

  if (!invitationId) return null;
  return <WarpFormScreen invitationId={String(invitationId)} />;
};

FormPage.getLayout = (page) => {
  return page;
};

FormPage.title = "Form";

FormPage.auth = true;
export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;

export default FormPage;
