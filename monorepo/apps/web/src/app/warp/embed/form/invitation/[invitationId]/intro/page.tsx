import { runEmbeddedAuthGuard } from "@/app/warp/_lib/embedded-auth";
import WarpGlobalMasterBootstrap from "@/app/warp/WarpGlobalMasterBootstrap";
import EmbedIntroClient from "./EmbedIntroClient";

type Props = {
  params: Promise<{ invitationId: string }>;
  searchParams: Promise<{ accessToken?: string; [k: string]: string | undefined }>;
};

export default async function Page({ params, searchParams }: Props) {
  const [sp, p] = await Promise.all([searchParams, params]);
  const { session } = await runEmbeddedAuthGuard(sp.accessToken);
  return (
    <WarpGlobalMasterBootstrap session={session} requireAuth>
      <EmbedIntroClient invitationId={p.invitationId} />
    </WarpGlobalMasterBootstrap>
  );
}
