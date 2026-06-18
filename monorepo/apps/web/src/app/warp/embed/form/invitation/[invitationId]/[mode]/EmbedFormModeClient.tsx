"use client";

import WarpFormScreen from "@/modules/warp/screens/WarpFormScreen";

type Props = { invitationId: string; mode?: string };

export default function EmbedFormModeClient({ invitationId, mode }: Props) {
  if (!invitationId) return null;
  return <WarpFormScreen invitationId={String(invitationId)} mode={mode} />;
}
