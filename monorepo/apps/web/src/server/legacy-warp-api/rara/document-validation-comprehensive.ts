import { withEmailOrIpRateLimitWithProgressiveDelay } from "@/modules/warp/packages/client/libs/progressive-delay-rate-limit";
import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import ApiErrorGuard from "@/modules/warp/packages/server/guards/api-error.guard";
import ApiMethodGuard from "@/modules/warp/packages/server/guards/api-method.guard";
import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import { parseHasuraClaims } from "@/modules/warp/packages/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler } from "next";
const documentvalidationComprehensiveHandler: NextApiHandler = async (
  req,
  res
) => {
  const {
    document_url,
    validations_to_check,
    company_name,
    document_name,
    parent_companies,
  } = req.body;
  try {
    if (
      !document_url ||
      !validations_to_check ||
      !Array.isArray(validations_to_check) ||
      !company_name ||
      !document_name ||
      !parent_companies ||
      !Array.isArray(parent_companies)
    )
      return res
        .status(500)
        .json({ error: { message: "Required details missing" } });

    let session;
    if (!!req?.headers?.authorization) {
      let accessToken = String(req.headers.authorization);
      accessToken =
        accessToken.indexOf("Bearer") === -1
          ? accessToken
          : accessToken.replaceAll("Bearer ", "").trim();
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

    const urlCheck = (url: any) => {
      try {
        new URL(url);
        return true;
      } catch (err) {
        return false;
      }
    };
    const isValidUrl = urlCheck(document_url);
    if (!isValidUrl) {
      return res
        .status(500)
        .json({ error: { message: "Document url is not valid" } });
    }
    const responseData = await sdk.getGlobalMasterByType({
      type: "Rara_integration",
    });

    let ValidationApiDetails;

    ValidationApiDetails = responseData.GlobalMaster[0].data.filter(
      (item: any) => item.name === "document-validation-comprehensive"
    );

    let body = {
      document_url: document_url,
      validations_to_check: validations_to_check,
      company_name: company_name,
      document_name: document_name,
      parent_companies: parent_companies,
    };

    let config = {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: ValidationApiDetails[0]?.authkey,
        "x-ai-services-authorization":
          process.env["AI_SERVICES_AUTHORIZATION"] ?? "",
      },
      body: JSON.stringify(body),
    };
    let docValidRes: any;
    let result: any;
    if (ValidationApiDetails) {
      docValidRes = await fetch(ValidationApiDetails[0].url, config);
      switch (docValidRes.status) {
        case 200:
          result = await docValidRes.json();
          res.status(200).json({ ...result });
          break;
        case 401:
          result = await docValidRes.json();
          res.status(401).json({ ...result });
          break;
        case 400:
          result = await docValidRes.json();
          res.status(400).json({ ...result });
          break;
        case 429:
          result = await docValidRes.json();
          res.status(429).json({ ...result });
          break;
        default:
          result = await docValidRes.json();
          res.status(500).json({ ...result });
          break;
      }
    }
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack,
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    res.status(500).json({ error: error || "Internal Server Error" });
  }
};

const handler: NextApiHandler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(documentvalidationComprehensiveHandler, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);

export default handler;

export const dynamic = "force-dynamic";
