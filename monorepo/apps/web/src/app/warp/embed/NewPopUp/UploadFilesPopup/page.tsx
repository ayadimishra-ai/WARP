import { runEmbeddedAuthGuard } from "@/app/warp/_lib/embedded-auth";
import WarpGlobalMasterBootstrap from "@/app/warp/WarpGlobalMasterBootstrap";
import UploadFilesPopupClient from "./UploadFilesPopupClient";

type Props = {
  searchParams: Promise<{ accessToken?: string; [k: string]: string | undefined }>;
};

// The SPA opens this popup without an `accessToken` query param (see
// AssessmentDetails.js:2594 / AssessmentRecommendDetails.js:1641 — it sends
// invitationId/formFieldId/questionId/allowMultiple only). The legacy
// standalone WARP `pages/embed/NewPopUp/UploadFilesPopup.tsx` had no
// server-side auth check at all and relied on the client hook to use whatever
// session/localStorage is available plus parent postMessage. We mirror that
// behaviour here: do NOT set `requireAuth`, otherwise WarpGlobalMasterBootstrap
// shows "Session Expired" because session is always null on this URL. We still
// run the guard so that any token-bearing variants populate session, but
// rendering does not depend on it.
export default async function Page({ searchParams }: Props) {
  const sp = await searchParams;
  const { session } = await runEmbeddedAuthGuard(sp.accessToken);
  return (
    <WarpGlobalMasterBootstrap session={session}>
      <UploadFilesPopupClient />
    </WarpGlobalMasterBootstrap>
  );
}
