import SuperAdminAuthGuard from "../../../libs/guards/auth-guard";
import DataTable from "../components/data-table";

const Page = async (props: any) => {
  return (
    <SuperAdminAuthGuard {...props}>
      <DataTable />
    </SuperAdminAuthGuard>
  );
};

export default Page;
