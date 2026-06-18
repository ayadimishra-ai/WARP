import { useRouter } from "next/router";
import WarpFormScreen from "../../../../screens/WarpFormScreen";

const FormPage = () => {
  const { query } = useRouter();
  const { invitationId } = query;

  if (!invitationId) return null;
  return <WarpFormScreen invitationId={String(invitationId)} />;
};

export default FormPage;
