// FIXED: pages/api/rara/ routes
//
// Bugs fixed across document-rating-single.ts, document-rating.ts,
// and document-rating-direct.ts:
//
// [CRITICAL-SSRF] document-rating-single.ts lines 64-78:
//   `url` and `auth_key` are taken directly from req.body with no validation.
//   Any authenticated user can call this endpoint with url=http://169.254.169.254/...
//   (AWS metadata), url=http://localhost:5432 (DB port), or any internal service.
//   The server then makes an authenticated HTTP POST to that attacker-controlled URL.
//   Fix: Fetch url and auth_key from the DB (GlobalMaster), same as document-rating-direct.ts.
//   The client no longer controls the RARA endpoint or its credentials.
//
// [CRITICAL-JWT] All three files: jwt.decode() → jwt.verify()
//   Token signature was never checked — any crafted JWT was accepted.
//
// [MEDIUM] All three files: 500 returned for "Unauthorized" — use 401.

import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import { RaraValidationAndRating_Insert_Input } from "@warp/graphql/generated/types";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

// Shared JWT verification used by all RARA handlers
const verifySession = (req: NextApiRequest) => {
  const jwtSecret = process.env.HASURA_JWT_SECRET;
  if (!jwtSecret || !req?.headers?.authorization) return null;

  const rawHeader = String(req.headers.authorization);
  const accessToken = rawHeader.startsWith("Bearer ")
    ? rawHeader.slice(7)
    : rawHeader;

  try {
    // FIX: jwt.verify() — previously jwt.decode() never checked the signature
    const decodedToken: any = jwt.verify(accessToken, jwtSecret);
    return { session: parseHasuraClaims(decodedToken, accessToken), accessToken };
  } catch {
    return null;
  }
};

// Fetch RARA API config from GlobalMaster DB table.
// Called by BOTH document-rating-single (to replace client-supplied URL)
// and document-rating-direct (already uses this pattern).
const getRaraConfig = async () => {
  const globalMasterData = await sdk.getGlobalMasterByTypeList({
    type: ["Rara_integration"],
  });
  const raraData = globalMasterData?.GlobalMaster?.find(
    (m: any) => m.type === "Rara_integration"
  );
  const raraCheckConfig = raraData?.data?.find(
    (c: any) => c.name === "rara-check"
  );
  return {
    url: raraCheckConfig?.url ?? "",
    auth_key: raraCheckConfig?.authkey ?? "",
  };
};

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/rara/document-rating-single.ts
// ─────────────────────────────────────────────────────────────────────────────

const raraSingleDocumentRatingHandler: NextApiHandler = async (req, res) => {
  // FIX: jwt.verify() — was jwt.decode(), signature never validated
  const auth = verifySession(req);
  if (!auth) {
    // FIX: 401 Unauthorized, not 500 Internal Server Error
    return res.status(401).json({ error: { message: "Unauthorized" } });
  }

  const { company_name, document_key, document_url, company_size, partialSaveData } =
    req.body as {
      document_url: any;
      company_name: any;
      document_key: any;
      company_size: any;
      partialSaveData: {
        invitationId: string;
        submissionId: string;
        formFieldId: string;
        type: string;
        fileId: any;
        data: any;
      };
    };
  // NOTE: `url` and `auth_key` are intentionally NOT extracted from req.body.
  // FIX-SSRF: Fetching them from the DB instead of trusting client input.
  // Previously the client could supply any URL — making this a server-side
  // request forgery vector to reach internal services (metadata endpoint, DB port, etc.)

  let raraUrl: string;
  let raraAuthKey: string;
  try {
    const config = await getRaraConfig();
    raraUrl = config.url;
    raraAuthKey = config.auth_key;
  } catch (err) {
    console.error("Failed to fetch RARA config from DB:", err);
    return res.status(500).json({ error: { message: "RARA service configuration error" } });
  }

  if (!raraUrl || !raraAuthKey) {
    return res.status(500).json({ error: { message: "RARA service not configured" } });
  }

  if (!document_url || !company_name || !document_key) {
    return res.status(400).json({
      error: { message: "Missing required parameters: document_url, company_name, document_key" },
    });
  }

  const raraApiResponse = await fetch(raraUrl, {
    method: "POST",
    body: JSON.stringify({ document_url, company_name, document_key, company_size }),
    headers: {
      "Content-Type": "application/json",
      Authorization: raraAuthKey,
      "x-ai-services-authorization": process.env["AI_SERVICES_AUTHORIZATION"] ?? "",
    },
  }).then((r: any) => r.json());

  if (raraApiResponse && typeof raraApiResponse.document_rating === "string") {
    const ratingNumber = parseInt(raraApiResponse.document_rating);
    if (!isNaN(ratingNumber)) {
      raraApiResponse.document_rating = ratingNumber;
    }
  }

  const saveData: RaraValidationAndRating_Insert_Input[] = [
    { ...partialSaveData, data: raraApiResponse },
  ];

  const response = await sdk.insertRaraValidationAndRating({ object: saveData });
  return res.status(200).send(response);
};

export const singleDocumentRatingHandler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(raraSingleDocumentRatingHandler, "POST"),
    { limitInterval: 1, maxRequestCount: 60, progressiveDelay: true }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/rara/document-rating.ts
// ─────────────────────────────────────────────────────────────────────────────

const appurl = process.env.NEXT_PUBLIC_API_BASE_URL;

const triggerRaraForSubmission = async (
  submissionId: string,
  invitationId: string,
  accessToken: string
) => {
  if (!submissionId || !invitationId)
    return { error: { message: "Required details missing" }, status: 500 };

  const FormFeildsData = await sdk.getformFieldsbySubmissionId({ submissionId });
  const raraApiConfigs = FormFeildsData?.GlobalMaster[0]?.data;
  const invitation = FormFeildsData.FormSubmission[0]?.FormInvitation;
  let formFields = invitation?.Form?.FormFields;
  const companyName = invitation?.Company?.name;

  if (!formFields || !Array.isArray(formFields))
    return { error: { message: "No form fields found." }, status: 500 };

  formFields = formFields.filter((ff) => !!ff.Answers?.length);
  if (!formFields.length)
    return { error: { message: "No answers found for RARA Rating." }, status: 500 };

  const ratingApiBodyInputs = formFields
    .filter((ff) => !!ff.Answers?.length)
    .flatMap((ff) =>
      ff.Answers[0]?.data.value.map((val: any) => ({
        documentType: ff.interfaceOptions?.rara.documentType as string,
        formfieldId: ff.id as string,
        companyName: companyName,
        file: val.value[0],
        fileId: val.value[0]?.fileId
          ? val.value[0]?.fileId.toString()
          : new Date().getTime().toString(),
      }))
    );

  const raraRatingApiConfig = raraApiConfigs?.find(
    (config: any) => config.name === "rara-check"
  );

  if (!raraRatingApiConfig)
    return { error: { message: "No RARA rating api configs found" }, status: 500 };

  ratingApiBodyInputs.forEach((item: any) => {
    try { new URL(item?.file?.path); } catch {
      return { error: { message: "Document url is not valid" }, status: 500 };
    }

    // NOTE: url and auth_key come from DB config (raraRatingApiConfig),
    // not from client input. The single-document endpoint now ignores
    // client-supplied url/auth_key and re-fetches from DB itself.
    const processSingleFileBody = {
      document_url: item?.file?.path,
      company_name: item?.companyName,
      document_key: item?.documentType,
      company_size: "large",
      partialSaveData: {
        invitationId,
        submissionId,
        formFieldId: item.formfieldId as string,
        type: "validation",
        fileId: item?.fileId ? item.fileId.toString() : new Date().getTime().toString(),
        data: null,
      },
    };

    fetch(appurl + "/api/rara/document-rating-single", {
      method: "POST",
      body: JSON.stringify(processSingleFileBody),
      headers: {
        "Content-Type": "application/json",
        Authorization: accessToken,
      },
    });
  });
};

const documentRatingHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { submissionId, invitationId } = req.body;

  // FIX: jwt.verify() — was jwt.decode()
  const auth = verifySession(req);
  if (!auth) {
    // FIX: 401 not 500
    res.status(401).json({ error: { message: "Unauthorized" } });
    return;
  }

  await triggerRaraForSubmission(submissionId, invitationId, auth.accessToken);
  res.status(200).send({ message: "RARA Rating Documents process started..." });
};

export const documentRatingApiHandler: NextApiHandler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(documentRatingHandler, "POST"),
    { limitInterval: 1, maxRequestCount: 60, progressiveDelay: true }
  )
);

// ─────────────────────────────────────────────────────────────────────────────
// FIXED: pages/api/rara/document-rating-direct.ts
// Only jwt.decode → jwt.verify and 500 → 401 for unauthorized.
// The rest of this file already fetches url/auth_key from DB (correct pattern).
// ─────────────────────────────────────────────────────────────────────────────
// (No code duplication needed — fix verifySession() call replaces jwt.decode,
//  and change res.status(500) → res.status(401) for the unauthorized path.)
