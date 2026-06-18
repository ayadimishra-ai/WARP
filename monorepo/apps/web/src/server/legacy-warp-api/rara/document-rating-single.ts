import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { RaraValidationAndRating_Insert_Input } from "@/modules/warp/packages/graphql/generated/types";
import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const raraSingleDocumentRatingHandler: NextApiHandler = async (req, res) => {
  let session;
  if (!!req?.headers?.authorization) {
    const accessToken = String(req.headers.authorization);
    try {
      const decodedToken: any = jwt.verify(accessToken, process.env.HASURA_GRAPHQL_JWT_SECRET!);
      session = parseHasuraClaims(decodedToken, accessToken);
    } catch {
      // invalid token — session stays undefined
    }
  }
  if (!session) {
    return res.status(401).json({
      error: {
        message: "Unauthorized",
      },
    });
  }

  // Fetch RARA URL and auth_key from DB (GlobalMaster) — never accept them from
  // the request body to prevent SSRF.
  const globalMasterData = await sdk.getGlobalMasterByTypeList({ type: ["Rara_integration"] });
  const raraData = globalMasterData?.GlobalMaster?.find(
    (master: any) => master.type === "Rara_integration"
  );
  const raraCheckConfig = raraData?.data?.find((config: any) => config.name === "rara-check");
  if (!raraCheckConfig?.url || !raraCheckConfig?.authkey) {
    return res.status(500).json({ error: { message: "RARA service configuration error" } });
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

  const raraApiResponse = await fetch(raraCheckConfig.url, {
    method: "POST",
    body: JSON.stringify({
      document_url,
      company_name,
      document_key,
      company_size,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: raraCheckConfig.authkey,
      "x-ai-services-authorization":
        process.env["AI_SERVICES_AUTHORIZATION"] ?? "",
    },
  }).then((res: any) => res.json());

  // Convert document_rating from string to number if it's a string
  if (raraApiResponse && typeof raraApiResponse.document_rating === "string") {
    const ratingNumber = parseInt(raraApiResponse.document_rating);
    if (!isNaN(ratingNumber)) {
      raraApiResponse.document_rating = ratingNumber;
      console.log(
        "Converted document_rating from string to number:",
        ratingNumber
      );
    } else {
      console.warn(
        "Could not convert document_rating to number:",
        raraApiResponse.document_rating
      );
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
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);

export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
export const dynamic = "force-dynamic";


