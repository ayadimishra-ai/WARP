import SuperAdminAuthGuard from "../../libs/guards/auth-guard";
import EmissionCalculationsRetrigger from "./components/emission-calculations-retrigger";

const Page = async (props: any) => {
  return (
    <SuperAdminAuthGuard {...props}>
      <EmissionCalculationsRetrigger />
    </SuperAdminAuthGuard>
  );
};

export default Page;
