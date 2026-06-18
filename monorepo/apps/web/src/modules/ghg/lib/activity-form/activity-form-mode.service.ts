import { getGraphQlServerSDK } from "@/modules/ghg/graphql/server";
import { PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE } from "@/modules/ghg/utils/const";

export type ActivityFormMode =
  | "standard"
  | "prepopulate_with_key"
  | "prepopulate_general";

export type ActivityFormModeResult = {
  mode: ActivityFormMode;
  isConfigured: boolean;
};

/**
 * Determines the activity form listing mode for an organization.
 *
 * Decision flow:
 * 1. Check PlatformFeatureFlags for `feat_prepopulate_activity_form`
 * 2. If flag is false or no record → "standard"
 * 3. If flag is true and masterKey provided → check OrgActivityMaster
 *    - Record exists → "prepopulate_with_key"
 *    - No record → "prepopulate_general"
 * 4. If flag is true and no masterKey → "prepopulate_general"
 *
 * @param organizationId - The organization UUID
 * @param masterKey - Optional master key to check in OrgActivityMaster
 */
export async function getActivityFormMode(
  organizationId: string,
  masterKey?: string | null
): Promise<ActivityFormModeResult> {
  const sdk = await getGraphQlServerSDK();

  // Step 1: Check PlatformFeatureFlags
  const flagsResponse = await sdk.GetPlatformFeatureFlags({
    organizationId,
    type: PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE,
  });

  const featureFlag = flagsResponse.PlatformFeatureFlags?.[0];

  if (!featureFlag || !featureFlag.feat_prepopulate_activity_form) {
    return { mode: "standard", isConfigured: false };
  }

  // Step 2: Feature flag is enabled — check masterKey
  if (masterKey) {
    const masterResponse = await sdk.checkOrgActivityMasterEntry({
      organizationId: organizationId,
      masterKey,
    });

    const hasOrgActivityMaster =
      (masterResponse.OrgActivityMaster?.length ?? 0) > 0;

    return {
      mode: hasOrgActivityMaster
        ? "prepopulate_with_key"
        : "prepopulate_general",
      isConfigured: true,
    };
  }

  // Step 3: Flag enabled, no masterKey
  return { mode: "prepopulate_general", isConfigured: true };
}
