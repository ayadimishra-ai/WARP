import { sdk } from "@/modules/warp/packages/graphql/generated/server";
import { uploadError } from "@/modules/warp/packages/server/services/aws-s3.service";
import { deleteCompany } from "@/modules/warp/packages/server/services/company.service";
import { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    // Request Method Validation
    if (req.method !== "DELETE") {
      res.status(405).send({
        data: null,
        error: {
          code: res.statusCode,
          message: `${req.method} method not allowed.`,
          stack: null,
        },
      });
      return;
    }

    // Company Details check in db if exist or not exist...
    const companyDetail = await sdk.getCompanyDetailById({
      id: req.query.companyId,
    });
    if (!companyDetail.Company.length) {
      res.status(409).send({
        data: null,
        error: {
          code: res.statusCode,
          message: "Company Details not exist...",
          stack: null,
        },
      });
      return;
    }

    // Compnay Details Delete Section
    if (req.method === "DELETE") {
      const responseData = await deleteCompany(req.query.companyId);

      res.status(200).send({ data: responseData, error: null });
      return;
    }
  } catch (error: any) {
    const currentDate = new Date();
    const errorContent = JSON.stringify({
      datetime: currentDate.toISOString(),
      message: error.message,
      stack: error.stack
    });
    await uploadError("exception-logs", "exception-logs", errorContent);
    res.status(500).json({ error: error || "Internal Server Error" });
  }
}
