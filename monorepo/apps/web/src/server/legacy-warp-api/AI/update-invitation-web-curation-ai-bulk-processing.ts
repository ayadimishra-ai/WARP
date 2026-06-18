import {
  callAIAPI,
  callUploadDocumentIngestingAPI,
} from "@/modules/warp/packages/client/features/form/common-functions";
import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { FormInvitationStatus } from "@/modules/warp/packages/shared/constants/app.constants";
import { NextApiRequest, NextApiResponse } from "next";

const updateInvitationWebCurationAIBulkProcessing = async (
  req: NextApiRequest,
  res: NextApiResponse
) => {
  // handle OPTIONS preflight quickly
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  try {
    const parsedBody = req.body ?? {};

    const { formId, invitationId, AIData, companyId, userId } = parsedBody;

    if (req.method !== "POST") {
      return res.status(405).send({ error: "Method not allowed" });
    }

    // decide which AI flows to run
    const allowed =
      AIData?.allowedAICuration ?? AIData?.allowedCuration ?? ([] as string[]);
    const shouldDocumentCuration = allowed.includes("DocumentCuration");
    const shouldWebCuration = allowed.includes("WebCuration");
    const shouldOPSToIQCuration = allowed.includes("OPSToIQCuration");

    const tasks: Promise<any>[] = [];

    if (shouldDocumentCuration) {
      tasks.push(
        callUploadDocumentIngestingAPI({
          form_invitation_id: invitationId,
          company_id: companyId ?? undefined,
        })
      );
    }

    if (shouldWebCuration) {
      // build payload expected by callAIAPI

      const formInvitationData = {
        form_invitation_id: invitationId,
        form_id: formId,
        company_id: companyId ?? "",
        created_by: userId ?? "",
      };

      // callAIAPI expects the array payload shape used elsewhere
      tasks.push(callAIAPI([formInvitationData] as any));
    }

    // OPS-to-IQ Curation Flow (Plug-and-Play)
    if (shouldOPSToIQCuration) {
      try {
        // Fetch submission ID from FormInvitation
        const invitationData = await sdk.getSourceDataByInvitationId?.({
          invitationId,
        });
        const submissionId =
          invitationData?.FormInvitation?.[0]?.FormSubmissions?.[0]?.id ?? "";
        const opsData =
          invitationData?.FormInvitation?.[0]?.metadata?.opsData ?? null;

        const opsToIQPayload = {
          form_invitation_id: invitationId,
          form_id: formId,
          iq_company_id: companyId ?? "",
          ops_company_id: opsData?.opsCompanyId ?? "",
          ops_company_name: opsData?.opsCompanyName ?? "",
          submission_id: submissionId,
          created_by: userId ?? "",
        };

        console.log(
          "[API] Triggering OPS-to-IQ curation:",
          opsToIQPayload,
        );

        tasks.push(
          callUploadDocumentIngestingAPI(opsToIQPayload, "opsToIQCuration"),
        );
      } catch (err) {
        console.error("Failed to prepare OPS-to-IQ curation task:", err);
      }
    }

    if (!tasks.length) {
      return res.status(200).send({ ok: true, results: {} });
    }

    // Write triggeredCuration BEFORE awaiting tasks so the DB is already updated
    // by the time the AI service completes and calls document-processing-completed.
    try {
      const pageData =
        (await sdk.getSourceDataByInvitationId?.({ invitationId })) ?? {};
      const existingMetadata = pageData?.FormInvitation?.[0]?.metadata ?? {};
      const existingAIData = existingMetadata?.AIData ?? {};
      console.log("[AI][meta] read existingAIData:", JSON.stringify(existingAIData), "| inv:", invitationId, " | existingMetadata:", JSON.stringify(existingMetadata));

      const triggered: string[] = [];
      if (shouldDocumentCuration) triggered.push("DocumentCuration");
      if (shouldWebCuration) triggered.push("WebCuration");
      if (shouldOPSToIQCuration) triggered.push("OPSToIQCuration");

      const newAIData = {
        ...existingAIData,
        allowedAICuration:
          existingAIData?.allowedAICuration ??
          existingAIData?.allowedCuration ??
          [],
        triggeredCuration: triggered,
      };

      const updatedMetadata = {
        ...existingMetadata,
        AIData: newAIData,
      };

      console.log("[AI][meta] writing triggeredCuration:", triggered, "| inv:", invitationId);
      try {
        await sdk.updateFormInvitation?.({
          invitationId,
          set: {
            status: FormInvitationStatus.Processing as string,
            metadata: updatedMetadata,
          },
        });
        console.log("[AI][meta] triggeredCuration written OK");
      } catch (err) {
        console.warn("[AI][meta] triggeredCuration write FAILED:", err);
      }
    } catch (err) {
      console.warn("[AI][meta] failed to resolve existing metadata | inv:", invitationId, err);
    }

    const settled = await Promise.allSettled(tasks);
    const results: any = { document: null, web: null, opsToIQ: null };
    let idx = 0;
    if (shouldDocumentCuration) {
      const r = settled[idx++];
      results.document =
        r.status === "fulfilled"
          ? r.value
          : { error: String((r as any).reason ?? r) };
    }
    if (shouldWebCuration) {
      const r = settled[idx++];
      results.web =
        r.status === "fulfilled"
          ? r.value
          : { error: String((r as any).reason ?? r) };
    }
    if (shouldOPSToIQCuration) {
      const r = settled[idx++];
      results.opsToIQ =
        r.status === "fulfilled"
          ? r.value
          : { error: String((r as any).reason ?? r) };
    }

    return res.status(200).send({ ok: true, results });
  } catch (error: any) {
    console.error("update-invitation error:", error);
    return res
      .status(500)
      .send({ error: (error && error.message) || String(error) });
  }
};

export default withEmailOrIpRateLimitWithProgressiveDelay(
  updateInvitationWebCurationAIBulkProcessing,
  {
    limitInterval: 1, // in minutes
    maxRequestCount: 60,
    progressiveDelay: false,
  }
);

export const dynamic = "force-dynamic";
