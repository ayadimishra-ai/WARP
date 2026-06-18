import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";

import { useRouter } from "next/router";
import FormIntroScreen from "../../../../../screens/FormIntroScreen";
import { GetServerSideProps } from "next";

const FormIntroPage: NextPageType = () => {
  const router = useRouter();
  const { invitationId } = router.query;

  if (!invitationId) return null;
  return <FormIntroScreen invitationId={String(invitationId)} isEmbeded />;
};

FormIntroPage.getLayout = (page) => {
  return page;
};

FormIntroPage.title = "Form Intro";

FormIntroPage.auth = true;
export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;

export default FormIntroPage;
