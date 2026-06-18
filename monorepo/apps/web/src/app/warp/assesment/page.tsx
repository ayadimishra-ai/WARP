import { runEmbeddedAuthGuard } from "@/app/warp/_lib/embedded-auth";
import WarpGlobalMasterBootstrap from "@/app/warp/WarpGlobalMasterBootstrap";
import AssesmentClient from "./AssesmentClient";

type Props = {
  searchParams: Promise<{ accessToken?: string; [k: string]: any }>;
};

export default async function AssesmentPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { session } = await runEmbeddedAuthGuard(sp.accessToken);
  return (
    <WarpGlobalMasterBootstrap session={session} requireAuth>
      <AssesmentClient session={session} />
    </WarpGlobalMasterBootstrap>
  );
}
