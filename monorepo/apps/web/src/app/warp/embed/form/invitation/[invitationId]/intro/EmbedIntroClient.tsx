"use client";

import FormIntroScreen from "@/modules/warp/screens/FormIntroScreen";

type Props = { invitationId: string };

export default function EmbedIntroClient({ invitationId }: Props) {
  if (!invitationId) return null;
  return <FormIntroScreen invitationId={String(invitationId)} isEmbeded />;
}
