import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { uploadError } from "@warp/server/services/aws-s3.service";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import type { NextApiHandler } from 'next';

const documentvalidationHandler: NextApiHandler = async (req, res) => {
  const {
    document_url,
    document_name,
    company_name,
    parentCompanies,
    isvaliddate,
  } = req.body;
  try {
    if (
      !document_url ||
      !document_name ||
      !company_name ||
      !parentCompanies ||
      isvaliddate === undefined
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

    if (!!isvaliddate) {
      ValidationApiDetails = responseData.GlobalMaster[0].data.filter(
        (item: any) => item.name === "Document-validation-date"
      );
    } else {
      ValidationApiDetails = responseData.GlobalMaster[0].data.filter(
        (item: any) => item.name === "Document-validation"
      );
    }

    let body = {
      document_url: document_url,
      document_name: document_name,
      company_name: company_name,
      parentCompanies: parentCompanies,
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
    ApiMethodGuard(documentvalidationHandler, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);

export default handler;

export const dynamic = "force-dynamic";
