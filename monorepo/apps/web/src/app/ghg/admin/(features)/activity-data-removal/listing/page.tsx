import SuperAdminAuthGuard from "../../../libs/guards/auth-guard";
import ActivityDataRemovalTable from "../components/activity-data-removal-table";

/**
 * Activity Data Removal Page
 * Protected by SuperAdminAuthGuard
 */
const Page = async (props: any) => {
  return (
    <SuperAdminAuthGuard {...props}>
      <ActivityDataRemovalTable />
    </SuperAdminAuthGuard>
  );
};

export default Page;
