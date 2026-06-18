"use client";

import WarpFormScreen from "@/modules/warp/screens/WarpFormScreen";
import { useParams } from "next/navigation";

export default function FormPage() {
  const params = useParams();
  const invitationId = params?.invitationId as string | undefined;

  if (!invitationId) return null;
  return <WarpFormScreen invitationId={String(invitationId)} />;
}
