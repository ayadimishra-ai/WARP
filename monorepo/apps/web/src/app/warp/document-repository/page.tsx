import { runEmbeddedAuthGuard } from "@/app/warp/_lib/embedded-auth";
import WarpGlobalMasterBootstrap from "@/app/warp/WarpGlobalMasterBootstrap";
import { mergeWithLatestSystemGenerated } from "@/modules/warp/packages/client/features/document-repository-v2/domain/document.selectors";
import type {
  Document,
  DocumentTemplate,
  SubscriptionStatus,
} from "@/modules/warp/packages/client/features/document-repository-v2/domain/document.types";
import {
  fetchDocumentTemplates,
  fetchDocuments,
  fetchFormInvitationsMapping,
  fetchSubscriptionStatus,
} from "@/modules/warp/packages/client/features/document-repository-v2/server/fetchDocuments";
import { Suspense } from "react";
import DocumentRepositoryClient from "./DocumentRepositoryClient";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";

type Props = {
  searchParams: Promise<{ accessToken?: string; [k: string]: any }>;
};

type CompanyMetadata = {
  name: string;
  isRARAEnabled?: boolean;
  isDocumentValidationEnabled?: boolean;
  isDocumentValidityCheckEnabled?: boolean;
};

export default async function DocumentRepositoryPage({ searchParams }: Props) {
  const sp = await searchParams;
  const { session } = await runEmbeddedAuthGuard(sp.accessToken);

  let initialDocuments: Document[] = [];
  let templates: DocumentTemplate[] = [];
  let subscription: SubscriptionStatus = { isChatSubscriptionActive: false };
  let companyMetadata: CompanyMetadata = {
    name: "",
    isRARAEnabled: false,
    isDocumentValidationEnabled: false,
    isDocumentValidityCheckEnabled: false,
  };

  if (session) {
    const userContext = {
      userId: session?.user?.id || "",
      companyId: session?.company?.id || "",
    };

    try {
      const [templatesRes, rawDocuments, subscriptionRes, companyDetails] =
        await Promise.all([
          fetchDocumentTemplates(),
          fetchDocuments(userContext),
          fetchSubscriptionStatus(userContext),
          sdk.getCompanyDetailById({
            id: userContext.companyId
          }),
        ]);

      const systemGeneratedDocs = rawDocuments.filter(
        (doc) =>
          doc.createdBy === null &&
          doc.uploadedFromInvitationId !== null &&
          doc.uploadedFromInvitationId !== undefined
      );

      const uniqueInvitationIds = Array.from(
        new Set(systemGeneratedDocs.map((doc) => doc.uploadedFromInvitationId!))
      );

      const invitationToFormMap = await fetchFormInvitationsMapping(
        uniqueInvitationIds
      );

      const documents = mergeWithLatestSystemGenerated(
        rawDocuments,
        invitationToFormMap
      );

      const company = companyDetails?.Company?.[0];
      const metadata = (company as any)?.metadata || {};

      templates = templatesRes;
      subscription = subscriptionRes;
      initialDocuments = documents;
      companyMetadata = {
        name: company?.name || "",
        isRARAEnabled: metadata?.isRARAEnabled || false,
        isDocumentValidationEnabled:
          metadata?.isDocumentValidationEnabled || false,
        isDocumentValidityCheckEnabled:
          metadata?.isDocumentValidityCheckEnabled || false,
      };
    } catch (error) {
      console.error("Error fetching document repository data:", error);
    }
  }

  return (
    <WarpGlobalMasterBootstrap session={session} requireAuth>
      {/* <Suspense fallback={null}> */}
        <DocumentRepositoryClient
          session={session}
          initialDocuments={initialDocuments}
          templates={templates}
          subscription={subscription}
          companyMetadata={companyMetadata}
        />
      {/* </Suspense> */}
    </WarpGlobalMasterBootstrap>
  );
}
