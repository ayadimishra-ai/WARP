import { withEmailOrIpRateLimitWithProgressiveDelay } from "@warp/client/libs/progressive-delay-rate-limit";
import { sdk } from "@warp/graphql/generated/server";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { parseHasuraClaims } from "@warp/shared/utils/auth-session.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";

const internalSharedKey = "uvmscwvFeptiTkYwdoch+51xxWo4dEKYBVX7Hj4JrIU=";

const appurl = process.env.NEXT_PUBLIC_API_BASE_URL;

const handler = async (
  submissionId: string,
  invitationId: string,
  accessToken: any
) => {
  if (!submissionId || !invitationId)
    return { error: { message: "Required details missing" }, status: 500 };

  const FormFeildsData = await sdk.getformFieldsbySubmissionId({
    submissionId: submissionId,
  });

  const raraApiConfigs = FormFeildsData?.GlobalMaster[0]?.data;
  const invitation = FormFeildsData.FormSubmission[0]?.FormInvitation;

  let formFields = invitation?.Form?.FormFields;
  const companyName = invitation?.Company?.name;

  if (!formFields || !Array.isArray(formFields)) {
    return {
      error: { message: "No form fields found." },
      status: 500,
    };
  }

  formFields = formFields.filter((ff) => !!ff.Answers?.length);

  if (!formFields.length) {
    return {
      error: { message: "No answers found for RARA Rating." },
      status: 500,
    };
  }

  const ratingApiBodyInputs = formFields
    .filter((ff) => !!ff.Answers?.length)
    .flatMap(
      (ff) =>
        ff.Answers[0]?.data.value.map((val: any) => ({
          documentType: ff.interfaceOptions?.rara.documentType as string,
          formfieldId: ff.id as string,
          companyName: companyName,
          file: val.value[0],
          fileId: val.value[0]?.fileId
            ? val.value[0]?.fileId.toString()
            : new Date().getTime().toString(),
        })) as {
          documentType: any;
          formfieldId: any;
          companyName: string | undefined;
          file: any;
          fileId: any;
        }[]
    );

  const raraRatingApiConfig = raraApiConfigs.find(
    (config: any) => config.name === "rara-check"
  );

  if (!raraRatingApiConfig) {
    return {
      error: { message: "No RARA rating api configs found" },
      status: 500,
    };
  }

  const urlCheck = (url: any) => {
    try {
      new URL(url);
      return true;
    } catch (err) {
      return false;
    }
  };

  ratingApiBodyInputs.forEach((item: any) => {
    const isValidUrl = urlCheck(item?.file?.path);
    if (!isValidUrl) {
      return {
        error: { message: "Document url is not valid" },
        status: 500,
      };
    }

    const processSingleFileBody = {
      url: raraRatingApiConfig.url,
      document_url: item?.file?.path,
      company_name: item?.companyName,
      document_key: item?.documentType,
      company_size: "large", //defaulting to large
      auth_key: raraRatingApiConfig.authkey,
      partialSaveData: {
        invitationId: invitationId,
        submissionId: submissionId,
        formFieldId: item.formfieldId as string,
        type: "validation",
        fileId: item?.fileId
          ? item?.fileId.toString()
          : new Date().getTime().toString(),
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

const documentratingHandler = async (
  req: NextApiRequest,
  res: NextApiResponse
): Promise<void> => {
  const { submissionId, invitationId } = req.body;

  let session;
  let accessTokenValue;
  if (!!req?.headers?.authorization) {
    const authHeader = String(req.headers.authorization);
    const accessToken = authHeader.startsWith("Bearer ")
      ? authHeader.slice(7)
      : authHeader;
    accessTokenValue = accessToken;
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
  await handler(submissionId, invitationId, accessTokenValue);
  return res
    .status(200)
    .send({ message: "RARA Rating Documents process started..." });
};

const respondhandler: NextApiHandler = ApiErrorGuard(
  withEmailOrIpRateLimitWithProgressiveDelay(
    ApiMethodGuard(documentratingHandler, "POST"),
    {
      limitInterval: 1, // in minutes
      maxRequestCount: 60,
      progressiveDelay: true,
    }
  )
);

export default respondhandler;

export const dynamic = "force-dynamic";
