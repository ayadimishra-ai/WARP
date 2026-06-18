import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { RaraValidationAndRating_Insert_Input } from "@/modules/warp/packages/graphql/generated/types";
import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const internalSharedKey = "uvmscwvFeptiTkYwdoch+51xxWo4dEKYBVX7Hj4JrIU=";

const raraSingleDocumentRatingHandler: NextApiHandler = async (req, res) => {
  // const requestAuthKey = req?.headers?.authorization;

  // if (requestAuthKey !== internalSharedKey) {
  //   return res.status(401).send({
  //     error: {
  //       message: "Authorization did not match with internalSharedKey",
  //     },
  //   });
  // }

  //   console.log(req.body);

  let session;
  if (!!req?.headers?.authorization) {
    const accessToken = String(req.headers.authorization);
    const decodedToken: any = jwt.decode(accessToken);
    session = parseHasuraClaims(decodedToken, accessToken);
  }
  if (!session) {
    return res.status(500).json({
      error: {
        message: "Unauthorized",
      },
    });
  }

  const {
    url,
    auth_key,
    company_name,
    document_key,
    document_url,
    company_size,
    partialSaveData,
  } = req.body as {
    url: any;
    document_url: any;
    company_name: any;
    document_key: any;
    company_size: any;
    auth_key: any;
    partialSaveData: {
      invitationId: string;
      submissionId: string;
      formFieldId: string;
      type: string;
      fileId: any;
      data: any;
    };
  };

  const raraApiResponse = await fetch(url, {
    method: "POST",
    body: JSON.stringify({
      document_url,
      company_name,
      document_key,
      company_size,
    }),
    headers: {
      "Content-Type": "application/json",
      Authorization: auth_key,
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


