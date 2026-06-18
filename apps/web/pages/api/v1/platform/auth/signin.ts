// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
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
const PlatformAuthSigninHandlerBodySchema = object({
  companyId: string().required("Company id is required."),
  userEmail: string()
    .required("User email is required")
    .email("Invalid user email"),
}).required("Invalid request body");

const HASURA_GRAPHQL_JWT_SECRET = process.env["HASURA_GRAPHQL_JWT_SECRET"];

// Function to generate user AI details with AI subscriptions (DocumentCuration, WebCuration)
// OPSToIQCuration is intentionally excluded here — it is handled separately by
// addOPSToIQCurationFromSubscriptions and must NOT affect the isUserAI flag.
// Non-AI users can have OPSToIQCuration without ever becoming AI users.
const generateUserAIDetails = (
  aiSubscriptions: any[],
  forms: any[]
): { isUserAI: string; aiPlanDetails: any[] } => {
  const aiPlanDetails: any[] = [];
  let hasActiveAI = false;

  // Only process DocumentCuration and WebCuration — these define AI user status
  const aiCurationSubscriptions = aiSubscriptions.filter(
    (sub) => sub.subscriptionPlan !== PLAN_OPS_TO_IQ_CURATION
  );

  for (const subscription of aiCurationSubscriptions) {
    if (subscription.Form?.id) {
      // Find corresponding form to check isAIDataPointsAdded
      const form = forms.find((f) => f.id === subscription.Form.id);

      // isActive is true only if BOTH conditions are met:
      // 1. AISubscriptions.isActive is true
      // 2. Form.isAIDataPointsAdded is true
      const isActive = Boolean(
        subscription.isActive && form?.isAIDataPointsAdded
      );

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

// Function to add OPSToIQCuration plans based on AISubscriptions + SQL queries
// IMPORTANT: Opt-in only - feature is DISABLED by default
// Only enabled when an active AISubscriptions record exists for the company+form pair
const addOPSToIQCurationFromSubscriptions = async (
  aiPlanDetails: any[],
  aiSubscriptions: any[],
  sdk: any
): Promise<void> => {
  // Filter subscriptions for OPSToIQCuration plan that are active
  const opsSubscriptions = aiSubscriptions.filter(
    (sub) => sub.subscriptionPlan === PLAN_OPS_TO_IQ_CURATION && sub.isActive && sub.Form?.id
  );

  if (opsSubscriptions.length === 0) {
    console.log(`[OPSToIQCuration] No active OPSToIQCuration subscriptions found`);
    return;
  }

  // For each subscription, verify the form has SQL queries configured
  for (const subscription of opsSubscriptions) {
    const formId = subscription.Form.id;

    try {
      // Check if form has FormFields with generatedSQLQuery
      const formFieldsWithSQL = await sdk.GetFormFieldsWithSQLQuery({ formId });
      const hasSQLQueries = formFieldsWithSQL.FormField?.length > 0;

      // Add OPSToIQCuration plan only if BOTH conditions are met:
      // 1. Active AISubscriptions record exists for the company+form (opt-in per request)
      // 2. Form has FormFields with SQL queries
      if (hasSQLQueries) {
        aiPlanDetails.push({
          formId,
          plan: PLAN_OPS_TO_IQ_CURATION,
          formName: subscription.Form.name || "",
          isActive: true,
        });

        console.log(`[OPSToIQCuration] ✓ Enabled for form ${formId} (AISubscriptions opt-in + SQL queries present)`);
      } else {
        console.log(`[OPSToIQCuration] ✗ Disabled for form ${formId} (no SQL queries found)`);
      }
    } catch (error) {
      console.error(`[OPSToIQCuration] Error checking form ${formId}:`, error);
    }
  }
};

const PlatformAuthSigninHandler: NextApiHandler = async (req, res) => {
  const sharedKey = String(req.headers["x-warp-shared-key"]);
  const secretKey = String(req.headers["x-warp-shared-secret"]);

  const validHeaders = sharedKey && secretKey;

  if (!validHeaders)
    throw CustomError({
      statusCode: 400,
      message: "Required headers are missing",
    });

  const requestBody = await PlatformAuthSigninHandlerBodySchema.validate(
    req.body
  );
  req.body.userEmail = await choosemethod(req.body.userEmail, "encrypt");
  const platformIdAndUserDetails =
    await sdk.getPlatformAndUserDetailsToGenerateToken({
      sharedKey,
      secretKey,
      ...requestBody,
    });

  /**
   * AI SUBSCRIPTION COMPANY RESOLUTION LOGIC
   *
   * BUSINESS SCENARIO:
   * - VC companies have AI subscriptions directly in AISubscriptions table
   * - Invited companies (created during invitation process) do NOT have AI subscriptions
   * - Invited companies inherit AI access from their parent VC company
   *
   * RESOLUTION STRATEGY:
   * 1. Fetch company details for the requesting company
   * 2. Check if company has a parent company mapping
   * 3. If parent exists → use parent company ID for AI subscriptions lookup
   * 4. If no parent → use original company ID (VC company scenario)
   *
   * EXAMPLE:
   * - VC Company (ID: vc-123) has AI subscriptions
   * - Invited Company (ID: inv-456) has ParentCompanyId: vc-123
   * - When inv-456 signs in, we fetch AI subscriptions for vc-123
   * - When vc-123 signs in, we fetch AI subscriptions for vc-123 directly
   */

  // Fetch AI subscriptions for the company
  // First, get company details to check if it has a parent company
  const companyDetailsData = await sdk.getCompanyDetailById({
    id: req.body.companyId,
  });

  // Determine which company ID to use for AI subscriptions
  // If company has a parent company, use parent company ID
  // Otherwise, use the original company ID (VC user scenario)
  const parentCompanyId =
    companyDetailsData.Company[0]?.ParentCompanyMappings?.[0]?.ParentCompanyId;
  const aiSubscriptionCompanyId = parentCompanyId || req.body.companyId;

  const aiSubscriptionsData = await sdk.GetCompanyAISubscriptions({
    companyId: aiSubscriptionCompanyId,
  });

  // Get form IDs from AI subscriptions and fetch form details
  const formIds = aiSubscriptionsData.AISubscriptions.map(
    (sub) => sub.Form?.id
  ).filter(Boolean) as string[];

  const formsData =
    formIds.length > 0
      ? await sdk.GetForms({
        ids: formIds,
      })
      : { Form: [] };

  /**
   * @Note Legacy code for existing functionality of JWT encoding (keeping for reference)
   */
  //#region Legacy code for existing functionality (keeping for reference)
  // const InvitationData = await sdk.formInvitationDatawithCompanyId({
  //   companyId: req.body.companyId,
  // });
  // const globalMasterData = await sdk.getGlobalMasterByTypeList({
  //   type: Platform[0].AITypes.map((items) => items.name),
  // });
  // const assessorConsultantMapping = await sdk.getAssessorConsultantMapping();
  // const formDetails = await sdk.formWithDataPoints();
  // const userList: Record<string, any>[] = [];
  // InvitationData?.FormInvitation.filter((datas) => !!datas.created_by)?.forEach(
  //   (items) => {
  //     if (
  //       !!items?.ParentUser &&
  //       items?.ParentUser?.UserRoles.filter(
  //         (item) =>
  //           String(item.roleName).toLocaleLowerCase() ===
  //           String(AppRoles.Consultant).toLocaleLowerCase()
  //       )?.length > 0
  //     ) {
  //       userList.push({
  //         userId: items?.created_by,
  //         role: AppRoles.Consultant,
  //         companyId: items?.ParentUser?.Company?.id,
  //       });
  //     } else {
  //       userList.push({
  //         userId: items.created_by,
  //         role: AppRoles.Inviter,
  //         companyId: items?.ParentUser?.Company?.id,
  //       });
  //     }
  //   }
  // );
  //#endregion

  const platform = platformIdAndUserDetails?.Platform[0];
  const company = platform?.Companies[0];
  const user = company?.Users[0];
  const role = user?.UserRoles[0];

  const authorized = platform && company && user && role;

  if (!authorized)
    throw CustomError({ statusCode: 401, message: "Unauthorized request" });

  //#region Generate AI details structure
  // Step 1: Generate AI plans from AI subscriptions (DocumentCuration, WebCuration)
  const userAIDetails = generateUserAIDetails(
    aiSubscriptionsData.AISubscriptions,
    formsData.Form
  );

  // Step 2: Add OPSToIQCuration plans based on AISubscriptions + SQL queries
  // IMPORTANT: OPSToIQCuration is OPT-IN ONLY - only added if an active AISubscriptions record
  // exists for the specific company+form pair. Note: Does NOT affect isUserAI flag.
  await addOPSToIQCurationFromSubscriptions(
    userAIDetails.aiPlanDetails,
    aiSubscriptionsData.AISubscriptions,
    sdk
  );

  // Legacy: Generate old formData structure for backward compatibility if needed
  // const formData = isAIFeaturedEnabledorNot(
  //   formDetails?.Form as Form[],
  //   assessorConsultantMapping?.AssessorConsultantMapping as AssessorConsultantMapping[],
  //   globalMasterData?.GlobalMaster?.map((items: Record<string, any>) => {
  //     return { type: items.type, data: items.data };
  //   }) as GlobalMaster[],
  //   true,
  //   userList,
  //   role.roleName,
  //   user.id,
  //   req.body.companyId,
  //   []
  // );
  //#endregion

  const jwtClaims = buildHasuraClaims(
    platform.id,
    user.id,
    user.companyId,
    user.email,
    role.roleName as any,
    userAIDetails,
    role.roleName
  );

  const accessToken = jwt.sign(jwtClaims, String(HASURA_GRAPHQL_JWT_SECRET), {
    algorithm: "HS256",
    expiresIn: "24h",
  });

  const responseData = {
    data: { accessToken },
    error: null,
  };

  res.status(200).json(responseData);
};

const handler_NEW = ApiErrorGuard(ApiMethodGuard(PlatformAuthSigninHandler, "POST"));
export default handler_NEW as (req: NextApiRequest, res: NextApiResponse) => Promise<void>;

