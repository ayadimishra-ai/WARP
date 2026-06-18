"use client";

import SendInvitationAssessment from "@/modules/warp/packages/client/features/invitation/components/send-invitation-assessment";
import SendInvitationReports from "@/modules/warp/packages/client/features/invitation/components/send-invitation-reports";
import { FormTypesPage } from "@/modules/warp/packages/shared/constants/app.constants";
import { useSearchParams } from "next/navigation";
import { useMemo } from "react";

export default function EmbedSendInvitationAssessmentReportsClient() {
  const searchParams = useSearchParams();
  const formtype = searchParams?.get("formtype") ?? undefined;

  const Component = useMemo(() => {
    if (typeof formtype === "string") {
      switch (formtype) {
        case FormTypesPage.Assessment:
          return SendInvitationAssessment;
        case FormTypesPage.Report:
          return SendInvitationReports;
        default:
          return SendInvitationAssessment;
      }
    }
    return SendInvitationAssessment;
  }, [formtype]);

  return <Component />;
}
