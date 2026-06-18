"use client";

import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import {
  DOCUMENT_LOGS_ACTION,
} from "@/modules/warp/packages/shared/constants/app.constants";
import type { AuthSessionType } from "@/modules/warp/packages/shared/types/auth.types";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import { FC, useEffect, useState } from "react";

import type {
  Document,
  DocumentTemplate,
  SubscriptionStatus,
} from "@/modules/warp/packages/client/features/document-repository-v2/domain/document.types";

import DocumentRepositoryV2 from "@/modules/warp/packages/client/features/document-repository-v2/pages/document-repository";

const DocumentLogsTable = dynamic(
  () =>
    import(
      "@/modules/warp/packages/client/features/document-repository/components/DocumentLogsTable"
    ),
  {
    ssr: false,
  }
);

type CompanyMetadata = {
  name: string;
  isRARAEnabled?: boolean;
  isDocumentValidationEnabled?: boolean;
  isDocumentValidityCheckEnabled?: boolean;
};

interface Props {
  session: AuthSessionType | null;
  initialDocuments: Document[];
  templates: DocumentTemplate[];
  subscription: SubscriptionStatus;
  companyMetadata?: CompanyMetadata;
}

const DocumentRepositoryClient: FC<Props> = ({
  session,
  initialDocuments,
  templates,
  subscription,
  companyMetadata,
}) => {
  const searchParams = useSearchParams();
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    setIsReady(true);
  }, []);

  if (!isReady) {
    return <Spinner visible={true} />;
  }

  if (searchParams?.get("action") === DOCUMENT_LOGS_ACTION) {
    return <DocumentLogsTable />;
  }

  const userContext = {
    userId: session?.user?.id || "",
    companyId: session?.company?.id || "",
  };

  const sessionData = session
    ? {
        accessToken: session.accessToken,
        company: companyMetadata
          ? {
              id: session.company?.id || "",
              name: companyMetadata.name,
              isRARAEnabled: companyMetadata.isRARAEnabled,
              isDocumentValidationEnabled:
                companyMetadata.isDocumentValidationEnabled,
              isDocumentValidityCheckEnabled:
                companyMetadata.isDocumentValidityCheckEnabled,
            }
          : undefined,
      }
    : undefined;

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

export default DocumentRepositoryClient;
