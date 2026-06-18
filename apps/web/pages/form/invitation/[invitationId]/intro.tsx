import MainLayout from "@warp/client/layouts/MainLayout";
import { NextPageType } from "@warp/client/types/page-types";

import { useRouter } from "next/router";
import FormIntroScreen from "../../../../screens/FormIntroScreen";

const FormIntroPage: NextPageType = () => {
  const router = useRouter();
  const { invitationId } = router.query;

  if (!invitationId) return null;
  return <FormIntroScreen invitationId={String(invitationId)} />;
};

FormIntroPage.getLayout = (page) => {
  return <MainLayout>{page}</MainLayout>;
};

FormIntroPage.title = "Home";

export default FormIntroPage;
