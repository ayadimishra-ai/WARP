import { runEmbeddedAuthGuard } from "@/app/warp/_lib/embedded-auth";
import WarpGlobalMasterBootstrap from "@/app/warp/WarpGlobalMasterBootstrap";
import ProgressReportClient from "./ProgressReportClient";

type Props = {
  searchParams: Promise<{ accessToken?: string; [k: string]: string | undefined }>;
};

export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const { session } = await runEmbeddedAuthGuard(sp.accessToken);
  return (
    <WarpGlobalMasterBootstrap session={session}>
      <ProgressReportClient />
    </WarpGlobalMasterBootstrap>
  );
}
