import type { GetActiveSubscriptionByCompanyIdQuery } from "@warp/graphql/generated/types";
import jwt from "jsonwebtoken";

export const PLAN_DOCUMENT_CURATION = "DocumentCuration";
export const PLAN_WEB_CURATION = "WebCuration";
export const PLAN_OPS_TO_IQ_CURATION = "OPSToIQCuration";

export type AIPlanName =
  | typeof PLAN_DOCUMENT_CURATION
  | typeof PLAN_WEB_CURATION
  | string;

export interface AIPlanDetail {
  formId: string;
  plan: AIPlanName;
  isActive: boolean;
}
/**
 * Extracts AI details from JWT token using the new JWT structure.
 *
 * This function decodes the JWT token and retrieves the AI plan details
 * from the 'x-user-ai-details' claim in the token's Hasura claims section.
 *
 * @param accessToken - The JWT access token containing user AI subscription data
 * @returns AI data object containing aiPlanDetails array, or null if not available/invalid
 *
 * @example
 * const aiDetails = getAIDetailsFromJWT(userToken);
 * // Returns: { aiPlanDetails: [{ formId: "123", plan: "DocumentCuration", isActive: true }] }
 */
export const getAIDetailsFromJWT = (
  accessToken?: string | null | undefined
) => {
  if (typeof window === "undefined" || !accessToken) {
    return null;
  }

  try {
    const decodedToken: any = jwt.decode(String(accessToken));

    if (!decodedToken?.["https://hasura.io/jwt/claims"]) {
      return null;
    }

    const claims = decodedToken["https://hasura.io/jwt/claims"];

    // Return new JWT structure data
    return claims["x-user-ai-details"] || null;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    return null;
  }
};

/**
 * Get user AI details from JWT structure.
 *
 * This is a convenience wrapper around getAIDetailsFromJWT().
 * Provides a more semantic function name for retrieving user's AI subscription data.
 *
 * @param accessToken - The JWT access token containing user AI subscription data
 * @returns User AI details object containing aiPlanDetails array, or null if not available
 *
 * @example
 * const userAI = getUserAIDetails(session.accessToken);
 * if (userAI?.aiPlanDetails) {
 *   console.log("User has AI subscriptions:", userAI.aiPlanDetails.length);
 * }
 */
export const getUserAIDetails = (accessToken?: string | null | undefined) => {
  return getAIDetailsFromJWT(accessToken);
};

/**
 * Check if a specific form has any active AI capabilities enabled.
 *
 * This function determines whether a form has at least one active AI plan
 * associated with it in the user's JWT token. It checks both:
 * 1. That the form ID matches an entry in the user's AI plan details
 * 2. That at least one plan for this form is currently active
 *
 * This is the primary function for determining if AI features should be
 * enabled/visible for a specific form in the UI.
 *
 * @param accessToken - The JWT access token containing user AI subscription data
 * @param formId - The specific form ID to check for AI capabilities
 * @returns true if the form has at least one active AI plan, false otherwise
 *
 * @example
 * // Check if form "abc123" has any AI features enabled
 * const hasAI = isFormAIEnabled(userSession.accessToken, "abc123");
 * if (hasAI) {
 *   // Show AI-powered features in the UI
 *   showAIButtons();
 * }
 */
/**
 * Returns true if the specified form has at least one active AI plan in the JWT.
 */
export const isFormAIEnabled = (
  accessToken?: string | null,
  formId?: string
): boolean => {
  if (!formId) return false;

  const aiDetails = getAIDetailsFromJWT(accessToken);

  if (!aiDetails?.aiPlanDetails || !Array.isArray(aiDetails.aiPlanDetails)) {
    return false;
  }

  return aiDetails.aiPlanDetails.some(
    (plan: AIPlanDetail) => plan?.formId === formId && plan?.isActive
  );
};

/**
 * Get all active AI plans for a specific form.
 *
 * This function retrieves and filters the user's AI plan details to return
 * only the plans that:
 * 1. Belong to the specified form ID
 * 2. Are currently active (isActive = true)
 *
 * This is a foundational function used by other AI capability check functions
 * like hasDocumentCuration(), hasWebCuration(), and hasFullAICuration().
 *
 * @param accessToken - The JWT access token containing user AI subscription data
 * @param formId - The form ID to get plans for
 * @returns Array of active AI plan objects for the specified form
 *
 * @example
 * const plans = getFormAIPlans(token, "form123");
 * // Returns: [
 * //   { formId: "form123", plan: "DocumentCuration", isActive: true },
 * //   { formId: "form123", plan: "WebCuration", isActive: true }
 * // ]
 *
 * plans.forEach(plan => {
 *   console.log(`Form ${plan.formId} has ${plan.plan} capability`);
 * });
 */
export const getFormAIPlans = (
  accessToken?: string | null | undefined,
  formId?: string
) => {
  if (!formId) return [];

  const aiDetails = getAIDetailsFromJWT(accessToken);

  if (!aiDetails?.aiPlanDetails || !Array.isArray(aiDetails.aiPlanDetails)) {
    return [];
  }

  return aiDetails.aiPlanDetails.filter(
    (plan: AIPlanDetail) => plan?.formId === formId && plan?.isActive
  );
};

export const hasDocumentCuration = (
  accessToken?: string | null | undefined,
  formId?: string
): boolean => {
  const plans = getFormAIPlans(accessToken, formId);
  return plans.some(
    (plan: AIPlanDetail) => plan?.plan === PLAN_DOCUMENT_CURATION
  );
};

export const hasWebCuration = (
  accessToken?: string | null | undefined,
  formId?: string
): boolean => {
  const plans = getFormAIPlans(accessToken, formId);
  return plans.some((plan: AIPlanDetail) => plan?.plan === PLAN_WEB_CURATION);
};

/**
 * Check if OPSToIQCuration is enabled for a form.
 *
 * This function explicitly checks the JWT token for OPSToIQCuration plan.
 *
 * IMPORTANT: OPSToIQCuration is OPT-IN ONLY (disabled by default).
 * The JWT encoding (signin.ts) adds the plan ONLY when:
 * 1. An active AISubscriptions record exists for the company+form with subscriptionPlan = 'OPSToIQCuration'
 * 2. FormFields with SQL queries exist
 *
 * If the plan is not in JWT, the feature is disabled for that form/company.
 * This function simply verifies the plan exists in the token.
 *
 * @param accessToken - JWT access token containing user AI subscription data
 * @param formId - The form ID to check
 * @returns true if OPSToIQCuration plan exists and is active in JWT, false otherwise
 */
export const hasOPSToIQCuration = (
  accessToken?: string | null | undefined,
  formId?: string
): boolean => {
  if (!formId) return false;

  const aiDetails = getAIDetailsFromJWT(accessToken);

  if (!aiDetails?.aiPlanDetails || !Array.isArray(aiDetails.aiPlanDetails)) {
    return false;
  }

  // Check if form has OPSToIQCuration plan with isActive: true
  return aiDetails.aiPlanDetails.some(
    (plan: AIPlanDetail) =>
      plan?.formId === formId &&
      plan?.plan === PLAN_OPS_TO_IQ_CURATION &&
      plan?.isActive
  );
};

/**
 * Check if OPS-to-IQ curation can be enabled for a user.
 * 
 * IMPORTANT: OPSToIQCuration is OPT-IN ONLY - feature is disabled by default.
 *
 * This function combines TWO required conditions:
 * 1. JWT check: User has OPSToIQCuration plan for the form (via hasOPSToIQCuration)
 *    - Plan is only in JWT if an active AISubscriptions record exists for the company+form
 * 2. OPS system presence: User's company exists in OPS system with valid OPSCompanyId (verified via internal API)
 * 
 * The internal API (/api/v1/ops/check-company-eligibility) validates company existence by:
 * - Calling PRO API with server-side credentials
 * - Checking if OPSCompanyId is present and valid
 * 
 * Use this function when deciding whether to add "OPSToIQCuration" to 
 * FormInvitation metadata during creation.
 * 
 * @param accessToken - JWT access token containing user AI subscription data
 * @param formId - The specific form ID to check
 * @param companyId - The company ID (CPanelCompanyId) to verify in OPS system
 * @returns Promise<OPSEligibilityResult> - eligible flag plus OPS company details if eligible
 *
 * @example
 * // During FormInvitation creation
 * const opsResult = await canEnableOPSToIQCuration(session.accessToken, formId, session.company.id);
 * if (opsResult.eligible) {
 *   allowedAICuration.push("OPSToIQCuration");
 * }
 */
export interface OPSEligibilityResult {
  eligible: boolean;
  opsCompanyId: string | null;
  opsCompanyName: string | null;
  isActive: boolean | null;
}

const OPS_NOT_ELIGIBLE: OPSEligibilityResult = { eligible: false, opsCompanyId: null, opsCompanyName: null, isActive: null };

export const canEnableOPSToIQCuration = async (
  accessToken?: string | null | undefined,
  formId?: string,
  companyId?: string
): Promise<OPSEligibilityResult> => {
  // First check: JWT must have OPSToIQCuration plan
  if (!hasOPSToIQCuration(accessToken, formId)) {
    return OPS_NOT_ELIGIBLE;
  }

  // Second check: Company must exist in OPS system (via internal API)
  if (!companyId) {
    return OPS_NOT_ELIGIBLE;
  }

  try {
    // Call internal API route (works on both client and server)
    const response = await fetch(
      `/api/v1/ops/check-company-eligibility?companyId=${encodeURIComponent(companyId)}`,
      {
        method: 'GET',
      }
    );

    if (!response.ok) {
      console.error('[canEnableOPSToIQCuration] API error:', response.status);
      return OPS_NOT_ELIGIBLE;
    }

    const result = await response.json();
    return {
      eligible: result?.data?.eligible === true,
      opsCompanyId: result?.data?.opsCompanyId ?? null,
      opsCompanyName: result?.data?.opsCompanyName ?? null,
      isActive: result?.data?.isActive ?? null,
    };

  } catch (error) {
    console.error('[canEnableOPSToIQCuration] Error checking company eligibility:', error);
    return OPS_NOT_ELIGIBLE;
  }
};

/**
 * Rules (based on allowedAICuration in FormInvitation.metadata.AIData):
 * - AI user:     includes 'WebCuration' OR 'DocumentCuration'
 * - Non-AI user: empty, or only contains 'OPSToIQCuration'
 *
 * @param metadata - The raw FormInvitation metadata object
 */
export const isAIUserFromMetadata = (metadata?: any): boolean => {
  const allowedAICuration: string[] =
    metadata?.AIData?.allowedAICuration ?? [];
  return (
    allowedAICuration.includes(PLAN_WEB_CURATION) ||
    allowedAICuration.includes(PLAN_DOCUMENT_CURATION)
  );
};

export const hasFullAICuration = (
  accessToken?: string | null,
  formId?: string
): boolean => {
  const plans = getFormAIPlans(accessToken, formId);

  const hasDoc = plans.some(
    (plan: AIPlanDetail) => plan?.plan === PLAN_DOCUMENT_CURATION
  );
  const hasWeb = plans.some(
    (plan: AIPlanDetail) => plan?.plan === PLAN_WEB_CURATION
  );

  return hasDoc && hasWeb;
};
// [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
/**
 *
 * Company metadata structure for form features
 */
export interface CompanyMetadata {
  FormId?: string[];
  carryForwardAsSuggestionsFormIds?: string[];
  [key: string]: any;
}

/**
 * Determines if carry-forward as suggestions feature is enabled for a specific form.
 * This function checks two conditions with priority:
 * 1. Priority: AI enablement (using existing isFormAIEnabled) - if AI is enabled, carry-forward as suggestions is disabled
 * 2. Fallback: Company metadata configuration (carryForwardAsSuggestionsFormIds array in metadata)
 *
 * @param accessToken - JWT access token for AI feature checking
 * @param formId - The form ID to check
 * @param companyMetadata - Company metadata from database containing carryForwardAsSuggestionsFormIds array
 * @returns true if carry-forward as suggestions is enabled, false otherwise
 *
 * @example
 * const metadata = { carryForwardAsSuggestionsFormIds: ["85a21e3d-4903-4539-9903-a927ffeb54cf"] };
 * const isEnabled = isCarryForwardAsSuggestionsEnabled(token, formId, metadata);
 */
export const isCarryForwardAsSuggestionsEnabled = (
  accessToken?: string | null,
  formId?: string,
  companyMetadata?: CompanyMetadata | null
): boolean => {
  if (!formId) {
    return false;
  }

  // Priority check: AI enablement - if AI is enabled, carry-forward as suggestions should be disabled
  // This ensures AI users never get carry-forward-as-suggestions feature regardless of company metadata
  const isAIEnabled = isFormAIEnabled(accessToken, formId);
  if (isAIEnabled) {
    return false;
  }

  // Company metadata check: verify if form is in carryForwardAsSuggestionsFormIds array
  if (
    !companyMetadata?.carryForwardAsSuggestionsFormIds ||
    !Array.isArray(companyMetadata.carryForwardAsSuggestionsFormIds)
  ) {
    return false;
  }

  // Return true if formId is present in the carryForwardAsSuggestionsFormIds array
  return companyMetadata.carryForwardAsSuggestionsFormIds.includes(formId);
};

/**
 * [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
 * Determines which carry-forward feature should be enabled with proper precedence
 * Carry-forward-as-suggestions takes precedence over traditional carry-forward
 *
 * @param invitations Array of FormInvitation objects to check
 * @returns Object with feature flags and filtered invitations
 */
export const getCarryForwardPrecedence = (invitations: any[]) => {
  const carryForwardSuggestionsInvitations = invitations.filter(
    (invitation) =>
      invitation.interimCheck?.isCarryForwardAsSuggestionsInvitation === true
  );

  const hasCarryForwardSuggestions =
    carryForwardSuggestionsInvitations.length > 0;

  return {
    // Feature flags
    hasCarryForwardSuggestions,
    shouldSkipTraditionalCarryForward: hasCarryForwardSuggestions,

    // Filtered invitations
    carryForwardSuggestionsInvitations,
    traditionalCarryForwardInvitations: hasCarryForwardSuggestions
      ? []
      : invitations, // Only allow traditional if no suggestions exist
  };
};

// Subscription-related types and utilities
export type Subscription =
  GetActiveSubscriptionByCompanyIdQuery["AIChatSubscription"][0];

export interface SubscriptionFeatures {
  hasDocumentRepo: boolean;
  hasESG: boolean;
  hasBRSR: boolean;
  textualLimit: number;
  graphicalLimit: number;
  subscriptionName: string;
}

/**
 * Checks if a company has an active subscription.
 *
 * @param subscription - The subscription object from GraphQL query
 * @returns boolean indicating if subscription is active and within date range
 */
export const isSubscriptionActive = (subscription?: Subscription): boolean => {
  if (!subscription) {
    return false;
  }

  const currentDate = new Date();
  const startDate = new Date(subscription.startDate);
  const endDate = new Date(subscription.endDate);

  return (
    (subscription.isActive ?? false) &&
    currentDate >= startDate &&
    currentDate <= endDate
  );
};

/**
 * Extracts feature flags from subscription data.
 *
 * @param subscription - The subscription object from GraphQL query
 * @returns SubscriptionFeatures object with feature flags and limits
 */
export const getSubscriptionFeatures = (
  subscription?: Subscription
): SubscriptionFeatures => {
  const defaultFeatures: SubscriptionFeatures = {
    hasDocumentRepo: false,
    hasESG: false,
    hasBRSR: false,
    textualLimit: 0,
    graphicalLimit: 0,
    subscriptionName: "No Active Subscription",
  };

  if (!subscription || !isSubscriptionActive(subscription)) {
    return defaultFeatures;
  }

  return {
    hasDocumentRepo: subscription.hasDocumentRepo ?? false,
    hasESG: subscription.hasESG ?? false,
    hasBRSR: subscription.hasBRSR ?? false,
    textualLimit: subscription.textualLimit ?? 0,
    graphicalLimit: subscription.graphicalLimit ?? 0,
    subscriptionName: subscription.subscriptionName || "Unknown Subscription",
  };
};

/**
 * Checks if a specific feature is available in the subscription.
 *
 * @param subscription - The subscription object from GraphQL query
 * @param feature - The feature to check ('document_repo' | 'esg' | 'brsr')
 * @returns boolean indicating if the feature is available
 */
export const hasSubscriptionFeature = (
  subscription?: Subscription,
  feature: "document_repo" | "esg" | "brsr" = "document_repo"
): boolean => {
  if (!subscription || !isSubscriptionActive(subscription)) {
    return false;
  }

  switch (feature) {
    case "document_repo":
      return subscription.hasDocumentRepo ?? false;
    case "esg":
      return subscription.hasESG ?? false;
    case "brsr":
      return subscription.hasBRSR ?? false;
    default:
      return false;
  }
};

/**
 * Checks if the user has reached their allocation limits.
 * This function now works with the new user allocation system.
 *
 * @param subscription - The subscription object from GraphQL query (with nested user allocations)
 * @param userId - The user ID to check allocations for
 * @returns Object indicating if limits are exceeded for the specific user
 */
export const checkUserAllocationLimits = (
  subscription?: Subscription,
  userId?: string
) => {
  if (!subscription || !isSubscriptionActive(subscription) || !userId) {
    return {
      textualLimitExceeded: true,
      graphicalLimitExceeded: true,
      textualRemaining: 0,
      graphicalRemaining: 0,
      hasAllocation: false,
    };
  }

  // Find user allocation in the nested structure
  const userAllocation = subscription.AIChatUserAllocations?.[0];
  const userUsage = userAllocation?.AIChatUsages?.[0];

  if (!userAllocation) {
    return {
      textualLimitExceeded: true,
      graphicalLimitExceeded: true,
      textualRemaining: 0,
      graphicalRemaining: 0,
      hasAllocation: false,
    };
  }

  const currentTextualUsage = userUsage?.textualUsed ?? 0;
  const currentGraphicalUsage = userUsage?.graphicalUsed ?? 0;
  const userTextualLimit = userAllocation.textualAllocated ?? 0;
  const userGraphicalLimit = userAllocation.graphicalAllocated ?? 0;

  const textualLimitExceeded = currentTextualUsage >= userTextualLimit;
  const graphicalLimitExceeded = currentGraphicalUsage >= userGraphicalLimit;

  return {
    textualLimitExceeded,
    graphicalLimitExceeded,
    textualRemaining: Math.max(0, userTextualLimit - currentTextualUsage),
    graphicalRemaining: Math.max(0, userGraphicalLimit - currentGraphicalUsage),
    hasAllocation: true,
  };
};

/**
 * Legacy function for backward compatibility.
 * @deprecated Use checkUserAllocationLimits instead for the new user allocation system.
 */
export const checkSubscriptionLimits = (
  subscription?: Subscription,
  currentTextualUsage: number = 0,
  currentGraphicalUsage: number = 0
) => {
  if (!subscription || !isSubscriptionActive(subscription)) {
    return {
      textualLimitExceeded: true,
      graphicalLimitExceeded: true,
      textualRemaining: 0,
      graphicalRemaining: 0,
    };
  }

  const textualLimitExceeded =
    currentTextualUsage >= (subscription.textualLimit ?? 0);
  const graphicalLimitExceeded =
    currentGraphicalUsage >= (subscription.graphicalLimit ?? 0);

  return {
    textualLimitExceeded,
    graphicalLimitExceeded,
    textualRemaining: Math.max(
      0,
      (subscription.textualLimit ?? 0) - currentTextualUsage
    ),
    graphicalRemaining: Math.max(
      0,
      (subscription.graphicalLimit ?? 0) - currentGraphicalUsage
    ),
  };
};

/**
 * Gets subscription expiry information.
 *
 * @param subscription - The subscription object from GraphQL query
 * @returns Object with expiry information
 */
export const getSubscriptionExpiryInfo = (subscription?: Subscription) => {
  if (!subscription) {
    return {
      isExpired: true,
      daysUntilExpiry: 0,
      isExpiringSoon: false, // Within 30 days
    };
  }

  const currentDate = new Date();
  const endDate = new Date(subscription.endDate);
  const diffTime = endDate.getTime() - currentDate.getTime();
  const daysUntilExpiry = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return {
    isExpired: daysUntilExpiry <= 0,
    daysUntilExpiry: Math.max(0, daysUntilExpiry),
    isExpiringSoon: daysUntilExpiry <= 30 && daysUntilExpiry > 0,
  };
};

/**
 * Gets user allocation information from subscription data.
 * This function extracts user-specific allocation and usage data.
 *
 * @param subscription - The subscription object from GraphQL query (with nested user allocations)
 * @param userId - The user ID to get allocation for
 * @returns User allocation and usage information
 */
export const getUserAllocationInfo = (
  subscription?: Subscription,
  userId?: string
) => {
  if (!subscription || !userId || !isSubscriptionActive(subscription)) {
    return {
      hasAllocation: false,
      textualAllocated: 0,
      graphicalAllocated: 0,
      textualUsed: 0,
      graphicalUsed: 0,
      textualRemaining: 0,
      graphicalRemaining: 0,
      allocationId: null,
      usageId: null,
    };
  }

  const userAllocation = subscription.AIChatUserAllocations?.[0];
  const userUsage = userAllocation?.AIChatUsages?.[0];

  if (!userAllocation) {
    return {
      hasAllocation: false,
      textualAllocated: 0,
      graphicalAllocated: 0,
      textualUsed: 0,
      graphicalUsed: 0,
      textualRemaining: 0,
      graphicalRemaining: 0,
      allocationId: null,
      usageId: null,
    };
  }

  const textualAllocated = userAllocation.textualAllocated ?? 0;
  const graphicalAllocated = userAllocation.graphicalAllocated ?? 0;
  const textualUsed = userUsage?.textualUsed ?? 0;
  const graphicalUsed = userUsage?.graphicalUsed ?? 0;

  return {
    hasAllocation: true,
    textualAllocated,
    graphicalAllocated,
    textualUsed,
    graphicalUsed,
    textualRemaining: Math.max(0, textualAllocated - textualUsed),
    graphicalRemaining: Math.max(0, graphicalAllocated - graphicalUsed),
    allocationId: userAllocation.id,
    usageId: userUsage?.id ?? null,
  };
};

/**
 * Checks if user can perform a specific query type based on their allocation.
 *
 * @param subscription - The subscription object from GraphQL query
 * @param userId - The user ID to check
 * @param queryType - The type of query ('textual' or 'graphical')
 * @returns boolean indicating if user can perform the query
 */
export const canUserPerformQuery = (
  subscription?: Subscription,
  userId?: string,
  queryType: "textual" | "graphical" = "textual"
): boolean => {
  const allocationInfo = getUserAllocationInfo(subscription, userId);

  if (!allocationInfo.hasAllocation) {
    return false;
  }

  if (queryType === "textual") {
    return allocationInfo.textualRemaining > 0;
  } else {
    return allocationInfo.graphicalRemaining > 0;
  }
};
