"use client";

import MainLayout from "@/modules/warp/packages/client/layouts/MainLayout";
import FormIntroScreen from "@/modules/warp/screens/FormIntroScreen";
import { useParams } from "next/navigation";

export default function FormIntroPage() {
  const params = useParams();
  const invitationId = params?.invitationId as string | undefined;

  if (!invitationId) return null;
  return (
    <MainLayout>
      <FormIntroScreen invitationId={String(invitationId)} />
    </MainLayout>
  );
}
