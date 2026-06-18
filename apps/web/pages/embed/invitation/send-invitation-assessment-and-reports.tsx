import SendInvitationAssessment from "@warp/client/features/invitation/components/send-invitation-assessment";
import SendInvitationReports from "@warp/client/features/invitation/components/send-invitation-reports";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import { FormTypesPage } from "@warp/shared/constants/app.constants";
import type { GetServerSideProps, NextPage } from "next";
import { useRouter } from "next/router";
import { ReactElement, useMemo } from "react";

type CustomNextPage = NextPage & {
  getLayout?: (page: ReactElement) => ReactElement;
  auth?: boolean;
  title?: string;
};

const EmbedSendInvite: CustomNextPage = () => {
  const {
    query: { formtype },
  } = useRouter();

  // Memoize the component to prevent unnecessary re-renders
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
};

// Inline the layout since it's a simple passthrough
EmbedSendInvite.getLayout = (page: ReactElement): ReactElement => page;

// Static properties
Object.assign(EmbedSendInvite, {
  title: "Home",
  auth: true,
});

export const getServerSideProps: GetServerSideProps = embeddedAuthGuard;

export default EmbedSendInvite;
