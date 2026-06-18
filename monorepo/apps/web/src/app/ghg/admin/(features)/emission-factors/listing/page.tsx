import SuperAdminAuthGuard from "../../../libs/guards/auth-guard";
import EmissionFactorTable from "../components/emission-factor-table";

const Page = async (props: any) => {
  return (
    <SuperAdminAuthGuard {...props}>
      <EmissionFactorTable />
    </SuperAdminAuthGuard>
  );
};

export default Page;
