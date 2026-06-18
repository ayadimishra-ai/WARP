import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import { RaraValidationAndRating_Insert_Input } from "@warp/graphql/generated/types";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const getRaraConfig = async (): Promise<{ url: string; auth_key: string } | null> => {
  try {
    const globalMaster = await sdk.getGlobalMasterByTypeList({
      type: ["Rara_integration"],
    });
    const config = globalMaster?.GlobalMaster?.[0]?.data;
    if (!config?.url || !config?.auth_key) return null;
    return { url: config.url, auth_key: config.auth_key };
  } catch {
    return null;
  }
};

const raraSingleDocumentRatingHandler: NextApiHandler = async (req, res) => {
  const jwtSecret = process.env.HASURA_JWT_SECRET;
  let session;
  if (req?.headers?.authorization && jwtSecret) {
    const rawHeader = String(req.headers.authorization);
    const accessToken = rawHeader.startsWith("Bearer ") ? rawHeader.slice(7) : rawHeader;
    try {
      const decodedToken: any = jwt.verify(accessToken, jwtSecret);
      session = parseHasuraClaims(decodedToken, accessToken);
    } catch {
      return res.status(401).json({ error: "Unauthorized" });
    }
  }
  if (!session) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const raraConfig = await getRaraConfig();
  if (!raraConfig) {
    return res.status(503).json({ error: "RARA integration not configured" });
  }

  const {
    company_name,
    document_key,
    document_url,
    company_size,
    partialSaveData,
  } = req.body as {
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

  const raraApiResponse = await fetch(raraConfig.url, {
    method: "POST",
    body: JSON.stringify({
      document_url,
      company_name,
      document_key,
      company_size,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: raraConfig.auth_key,
      "x-ai-services-authorization":
        process.env["AI_SERVICES_AUTHORIZATION"] ?? "",
    },
  }).then((res: any) => res.json());

  if (raraApiResponse && typeof raraApiResponse.document_rating === "string") {
    const ratingNumber = parseInt(raraApiResponse.document_rating);
    if (!isNaN(ratingNumber)) {
      raraApiResponse.document_rating = ratingNumber;
    }
  }

  const saveData: RaraValidationAndRating_Insert_Input[] = [
    {
      ...partialSaveData,
      data: raraApiResponse,
    },
  ];

  const response = await sdk.insertRaraValidationAndRating({
    object: saveData,
  });

  return res.status(200).send(response);
};

const handler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(raraSingleDocumentRatingHandler, "POST"),
    {
      limitInterval: 1,
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);

export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
export const dynamic = "force-dynamic";
