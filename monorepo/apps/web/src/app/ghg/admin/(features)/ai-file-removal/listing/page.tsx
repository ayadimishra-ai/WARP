import SuperAdminAuthGuard from "../../../libs/guards/auth-guard";
import AiFileRemovalTable from "../components/ai-file-removal-table";

/**
 * AI File Removal Page
 * Protected by SuperAdminAuthGuard
 */
const Page = async (props: any) => {
  return (
    <SuperAdminAuthGuard {...props}>
      <AiFileRemovalTable />
    </SuperAdminAuthGuard>
  );
};

export default Page;
