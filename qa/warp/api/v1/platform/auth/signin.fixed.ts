import { encryptionDecryption } from "@warp/client/hooks/encryption-decryption";
import { sdk } from "@warp/graphql/generated/server";
import ApiErrorGuard from "@warp/server/guards/api-error.guard";
import ApiMethodGuard from "@warp/server/guards/api-method.guard";
import { buildHasuraClaims } from "@warp/shared/utils/auth-session.util";
import { CustomError } from "@warp/shared/utils/custom-error.util";
import { PLAN_OPS_TO_IQ_CURATION } from "@warp/shared/utils/jwt-ai.util";
import jwt from "jsonwebtoken";
import { NextApiHandler, NextApiRequest, NextApiResponse } from "next";
import { object, string } from "yup";

const { choosemethod } = encryptionDecryption();

const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];
if (!HASURA_GRAPHQL_JWT_SECRET) {
  throw new Error("HASURA_GRAPHQL_JWT_SECRET environment variable is required");
}

const PlatformAuthSigninHandlerBodySchema = object({
  companyId: string().required("Company id is required."),
  userEmail: string()
    .required("User email is required")
    .email("Invalid user email"),
}).required("Invalid request body");

// Only DocumentCuration and WebCuration subscriptions define AI user status.
// OPSToIQCuration is intentionally excluded — non-AI users can have it without becoming AI users.
const generateUserAIDetails = (
  aiSubscriptions: any[],
  forms: any[]
): { isUserAI: string; aiPlanDetails: any[] } => {
  const aiPlanDetails: any[] = [];
  let hasActiveAI = false;

  const aiCurationSubscriptions = aiSubscriptions.filter(
    (sub) => sub.subscriptionPlan !== PLAN_OPS_TO_IQ_CURATION
  );

  for (const subscription of aiCurationSubscriptions) {
    if (subscription.Form?.id) {
      const form = forms.find((f) => f.id === subscription.Form.id);
      const isActive = Boolean(subscription.isActive && form?.isAIDataPointsAdded);

      if (isActive) {
        hasActiveAI = true;
      }

      aiPlanDetails.push({
        formId: subscription.Form.id,
        plan: subscription.subscriptionPlan,
        formName: subscription.Form.name || form?.name || "",
        isActive,
      });
    }
  }

  return {
    isUserAI: hasActiveAI ? "true" : "false",
    aiPlanDetails,
  };
};

// OPSToIQCuration is opt-in only — enabled only when an active AISubscriptions record
// exists for the company+form pair AND the form has FormFields with SQL queries.
const addOPSToIQCurationFromSubscriptions = async (
  aiPlanDetails: any[]
): Promise<void> => {
  const opsSubscriptions = (
    await sdk.GetCompanyAISubscriptions({ companyId: "" })
  ).AISubscriptions.filter(
    (sub) => sub.subscriptionPlan === PLAN_OPS_TO_IQ_CURATION && sub.isActive && sub.Form?.id
  );

  for (const subscription of opsSubscriptions) {
    const formId = subscription.Form!.id;
    try {
      const formFieldsWithSQL = await sdk.GetFormFieldsWithSQLQuery({ formId });
      if (formFieldsWithSQL.FormField?.length > 0) {
        aiPlanDetails.push({
          formId,
          plan: PLAN_OPS_TO_IQ_CURATION,
          formName: subscription.Form!.name || "",
          isActive: true,
        });
      }
    } catch (error) {
      console.error(`[OPSToIQCuration] Error checking form ${formId}:`, error);
    }
  }
};

const PlatformAuthSigninHandler: NextApiHandler = async (req, res) => {
  const sharedKey = req.headers["x-warp-shared-key"];
  const secretKey = req.headers["x-warp-shared-secret"];

  if (!sharedKey || !secretKey || typeof sharedKey !== "string" || typeof secretKey !== "string") {
    throw CustomError({ statusCode: 400, message: "Required headers are missing" });
  }

  const requestBody = await PlatformAuthSigninHandlerBodySchema.validate(req.body);

  const platformIdAndUserDetails = await sdk.getPlatformAndUserDetailsToGenerateToken({
    sharedKey,
    secretKey,
    ...requestBody,
  });

  const companyDetailsData = await sdk.getCompanyDetailById({ id: req.body.companyId });
  const parentCompanyId =
    companyDetailsData.Company[0]?.ParentCompanyMappings?.[0]?.ParentCompanyId;
  const aiSubscriptionCompanyId = parentCompanyId || req.body.companyId;

  const aiSubscriptionsData = await sdk.GetCompanyAISubscriptions({
    companyId: aiSubscriptionCompanyId,
  });

  const formIds = aiSubscriptionsData.AISubscriptions.map((sub) => sub.Form?.id).filter(
    Boolean
  ) as string[];

  const formsData =
    formIds.length > 0 ? await sdk.GetForms({ ids: formIds }) : { Form: [] };

  const platform = platformIdAndUserDetails?.Platform[0];
  const company = platform?.Companies[0];
  const user = company?.Users[0];
  const role = user?.UserRoles[0];

  const authorized = platform && company && user && role;
  if (!authorized) {
    throw CustomError({ statusCode: 401, message: "Unauthorized request" });
  }

  const userAIDetails = generateUserAIDetails(
    aiSubscriptionsData.AISubscriptions,
    formsData.Form
  );

  await addOPSToIQCurationFromSubscriptions(userAIDetails.aiPlanDetails);

  const jwtClaims = buildHasuraClaims(
    platform.id,
    user.id,
    user.companyId,
    user.email,
    role.roleName as any,
    userAIDetails,
    role.roleName
  );

  const accessToken = jwt.sign(jwtClaims, HASURA_GRAPHQL_JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: "24h",
  });

  res.status(200).json({ data: { accessToken }, error: null });
};

const handler = ApiErrorGuard(ApiMethodGuard(PlatformAuthSigninHandler, "POST"));
export default handler as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;
