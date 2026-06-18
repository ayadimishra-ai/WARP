import Spinner from "@warp/client/layouts/Spinner";
import { NextPageType } from "@warp/client/types/page-types";
import { embeddedAuthGuard } from "@warp/server/guards/embedded-auth-guard";
import {
  DOCUMENT_LOGS_ACTION,
  DOCUMENT_REPOSITORY_PAGE,
} from "@warp/shared/constants/app.constants";
import { AuthSessionType } from "@warp/shared/types/auth.types";
import { GetServerSideProps } from "next";
import dynamic from "next/dynamic";
import { useRouter } from "next/router";
import { FC, useEffect, useState } from "react";

// Import server functions for SSR data fetching
import { mergeWithLatestSystemGenerated } from "@warp/client/features/document-repository-v2/domain/document.selectors";
import type {
  Document,
  DocumentTemplate,
  SubscriptionStatus,
} from "@warp/client/features/document-repository-v2/domain/document.types";
import {
  fetchDocumentTemplates,
  fetchDocuments,
  fetchFormInvitationsMapping,
  fetchSubscriptionStatus,
} from "@warp/client/features/document-repository-v2/server/fetchDocuments";
import { initClient } from "@warp/graphql/provider/init-client";
import { GetCompanyDetailByIdDocument } from "@warp/graphql/queries/generated/get-companydetail-by-id";

// Import new v2 implementation directly (not dynamic for SSR to work properly)
import DocumentRepositoryV2 from "@warp/client/features/document-repository-v2/pages/document-repository";

// Keep DocumentLogsTable for logs view
const DocumentLogsTable = dynamic(
  () =>
    import(
      "@warp/client/features/document-repository/components/DocumentLogsTable"
    ),
  {
    ssr: false,
  }
);

interface DocumentRepositoryContainerProps {
  session: AuthSessionType | null;
  initialDocuments: Document[];
  templates: DocumentTemplate[];
  subscription: SubscriptionStatus;
  companyMetadata?: {
    name: string;
    isRARAEnabled?: boolean;
    isDocumentValidationEnabled?: boolean;
    isDocumentValidityCheckEnabled?: boolean;
  };
}

const DocumentRepositoryContainer: FC<DocumentRepositoryContainerProps> = ({
  session,
  initialDocuments,
  templates,
  subscription,
  companyMetadata,
}) => {
  const router = useRouter();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    if (router.isReady) {
      setIsReady(true);
    }
  }, [router.isReady, router.query]);

  if (!isReady) {
    return <Spinner visible={true} />;
  }

  // Show DocumentLogsTable if action is "document-logs"
  if (router.query.action === DOCUMENT_LOGS_ACTION) {
    return <DocumentLogsTable />;
  }

  // Extract user context from session
  const userContext = {
    userId: session?.user?.id || "",
    companyId: session?.company?.id || "",
  };

  // Extract session data for upload manager (RARA, validation, AI processing)
  const sessionData = session ? {
    accessToken: session.accessToken,
    company: companyMetadata ? {
      id: session.company?.id || "",
      name: companyMetadata.name,
      isRARAEnabled: companyMetadata.isRARAEnabled,
      isDocumentValidationEnabled: companyMetadata.isDocumentValidationEnabled,
      isDocumentValidityCheckEnabled: companyMetadata.isDocumentValidityCheckEnabled,
    } : undefined,
  } : undefined;

  // All initial data is fetched server-side in getServerSideProps
  return (
    <DocumentRepositoryV2
      initialDocuments={initialDocuments}
      templates={templates}
      subscription={subscription}
      userContext={userContext}
      session={sessionData}
    />
  );
};
///

interface DocumentRepositoryPageProps {
  session: AuthSessionType | null;
  initialDocuments: Document[];
  templates: DocumentTemplate[];
  subscription: SubscriptionStatus;
  companyMetadata?: {
    name: string;
    isRARAEnabled?: boolean;
    isDocumentValidationEnabled?: boolean;
    isDocumentValidityCheckEnabled?: boolean;
  };
}

const DocumentRepositoryPage: NextPageType<DocumentRepositoryPageProps> = ({
  session,
  initialDocuments,
  templates,
  subscription,
  companyMetadata,
}) => {
  return (
    <DocumentRepositoryContainer
      session={session}
      initialDocuments={initialDocuments}
      templates={templates}
      subscription={subscription}
      companyMetadata={companyMetadata}
    />
  );
};

DocumentRepositoryPage.getLayout = (page) => {
  return page;
};

DocumentRepositoryPage.title = DOCUMENT_REPOSITORY_PAGE;

DocumentRepositoryPage.auth = true;

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Get authenticated session
  const sessionProps = await embeddedAuthGuard(context);

  // If no session (redirect), return early
  if ("redirect" in sessionProps || "notFound" in sessionProps) {
    return sessionProps;
  }

  // Type assertion after redirect check
  const session = (sessionProps as { props: { session: AuthSessionType } }).props.session;

  // Extract user context
  const userContext = {
    userId: session?.user?.id || "",
    companyId: session?.company?.id || "",
  };

  // Initialize Apollo Client for SSR
  const apolloClient = initClient();

  try {
    // Fetch all initial data server-side (follows clean architecture)
    const [templates, rawDocuments, subscription, companyDetails] = await Promise.all([
      fetchDocumentTemplates(apolloClient),
      fetchDocuments(apolloClient, userContext),
      fetchSubscriptionStatus(apolloClient, userContext),
      apolloClient.query({
        query: GetCompanyDetailByIdDocument,
        variables: { id: userContext.companyId },
      }),//Get company details for metadata
    ]);

    // ============================================================
    // SYSTEM-GENERATED DOCUMENTS FILTERING
    // ============================================================
    // Apply business logic to show only latest system-generated document per form
    // This prevents duplicate system-generated reports from the same form appearing in the UI

    // Step 1: Extract unique invitation IDs from system-generated documents
    const systemGeneratedDocs = rawDocuments.filter(
      (doc) =>
        doc.createdBy === null &&
        doc.uploadedFromInvitationId !== null &&
        doc.uploadedFromInvitationId !== undefined
    );

    const uniqueInvitationIds = Array.from(
      new Set(systemGeneratedDocs.map((doc) => doc.uploadedFromInvitationId!))
    );

    // Step 2: Fetch form invitation mappings (invitationId -> formId)
    const invitationToFormMap = await fetchFormInvitationsMapping(
      apolloClient,
      uniqueInvitationIds
    );

    // Step 3: Apply domain selector to merge non-system with latest system-generated per form
    const documents = mergeWithLatestSystemGenerated(
      rawDocuments,
      invitationToFormMap
    );
    // Extract company metadata with feature flags from metadata field
    const company = companyDetails.data?.Company?.[0];
    const metadata = company?.metadata || {};
    const companyMetadata = {
      name: company?.name || "",
      isRARAEnabled: metadata?.isRARAEnabled || false,
      isDocumentValidationEnabled: metadata?.isDocumentValidationEnabled || false,
      isDocumentValidityCheckEnabled: metadata?.isDocumentValidityCheckEnabled || false,
    };

    return {
      props: {
        session,
        initialDocuments: documents,
        templates,
        subscription,
        companyMetadata,
      },
    };
  } catch (error) {
    console.error("Error fetching document repository data:", error);

    // Return empty data on error (page will handle gracefully)
    return {
      props: {
        session,
        initialDocuments: [],
        templates: [],
        subscription: { isChatSubscriptionActive: false },
        companyMetadata: {
          name: "",
          isRARAEnabled: false,
          isDocumentValidationEnabled: false,
          isDocumentValidityCheckEnabled: false,
        },
      },
    };
  }
};

export default DocumentRepositoryPage;
