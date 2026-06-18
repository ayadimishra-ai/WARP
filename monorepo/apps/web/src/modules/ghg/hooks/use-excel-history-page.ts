"use client";

import { useLocalStorage } from "@mantine/hooks";
import { useParams, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useGetPlatformFeatureFlagsQuery } from "@/modules/ghg/graphql/queries/get-platform-feature-flags.generated";
import { apiClientWithAuth } from "@/modules/ghg/lib/fetcher";
import {
  ACTIVITY_CODES,
  CAPTIVE_SUB_TABS,
  CaptiveSubTab,
  CustomHeaderFilter,
  MESSAGE_TYPES,
  TAB_VALUES,
  TabValue,
  UNLOCKED_FORM_CODES,
} from "@/modules/ghg/lib/shared/constants/dataimporthistory.constant";
import {
  getUserIdFromToken,
  isAIEnable,
} from "@/modules/ghg/utils/jwt/getUserDataFromToken";
import {
  FORM_MODE_PREPOPULATE,
  PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE,
} from "@/modules/ghg/utils/const";

export const useExcelHistoryPage = () => {
  const params = useParams();
  const searchParams = useSearchParams();

  const [permittedFormCodes, setPermittedFormCodes] = useState<Set<string>>(
    new Set()
  );
  const [captiveSubTab, setCaptiveSubTab] = useState<CaptiveSubTab>(
    CAPTIVE_SUB_TABS.RENEWABLE
  );

  // ── Prepopulate mode: check platform feature flag ────────────────────────
  const organizationId = params?.organizationId as string;
  const { data: featureFlagsData } = useGetPlatformFeatureFlagsQuery({
    variables: {
      organizationId,
      type: PLATFORM_FEATURE_FLAG_TYPE_PREPOPULATE,
    },
    skip: !organizationId,
    fetchPolicy: "cache-and-network",
  });

  const isPrepopulateMode = useMemo(() => {
    if (!featureFlagsData?.PlatformFeatureFlags?.length) return false;
    return featureFlagsData.PlatformFeatureFlags[0]?.feat_prepopulate_activity_form === true;
  }, [featureFlagsData]);

  const activityCodeFromParent = useMemo(() => {
    const code =
      searchParams.get("activityCode") ?? searchParams.get("activitycode");
    return code ? code.toLowerCase() : null;
  }, [searchParams]);

  const isAIEnabled = useMemo(
    () => isAIEnable(params?.accessToken as string | string[]),
    [params?.accessToken]
  );

  const showAiTab = useMemo(
    () =>
      activityCodeFromParent === ACTIVITY_CODES.ENERGY_GRID_POWER &&
      isAIEnabled,
    [activityCodeFromParent, isAIEnabled]
  );

  const showFormsTab = useMemo(
    () =>
      !!activityCodeFromParent &&
      permittedFormCodes.has(activityCodeFromParent),
    [activityCodeFromParent, permittedFormCodes]
  );

  const showBulkTab = useMemo(
    () =>
      !isPrepopulateMode &&
      !!activityCodeFromParent &&
      (UNLOCKED_FORM_CODES as readonly string[]).includes(activityCodeFromParent),
    [activityCodeFromParent, isPrepopulateMode]
  );

  // Prepopulate + no AI → render form directly with no tab bar
  const formsOnlyMode = useMemo(
    () => isPrepopulateMode && !showAiTab && showFormsTab,
    [isPrepopulateMode, showAiTab, showFormsTab]
  );

  const activityName = useMemo(
    () =>
      CustomHeaderFilter.find(
        (item) => item.activity_code === activityCodeFromParent
      )?.activityHeader ?? "Upload History",
    [activityCodeFromParent]
  );

  const [activeTab, setActiveTab] = useLocalStorage<TabValue>({
    key: "DataImportHistory-active-tab",
    defaultValue: TAB_VALUES.BULK,
  });

  useEffect(() => {
    if (
      activityCodeFromParent === ACTIVITY_CODES.ENERGY_GRID_POWER &&
      isAIEnabled
    ) {
      setActiveTab(TAB_VALUES.AI);
      return;
    }
    setActiveTab(TAB_VALUES.BULK);
  }, [activityCodeFromParent, isAIEnabled, setActiveTab]);

  useEffect(() => {
    const orgId = params.organizationId as string;
    const userId = getUserIdFromToken(params.accessToken as string);
    if (!orgId || !userId) return;

    const cacheKey = `permittedFormCodes_${orgId}_${userId}`;
    const cached = sessionStorage.getItem(cacheKey);
    if (cached) {
      setPermittedFormCodes(new Set(JSON.parse(cached)));
    }

    apiClientWithAuth
      .post("/api/v1/users/activity-permissions", {
        organizationId: orgId,
        userId,
      })
      .then((response) => {
        const permittedCodes: string[] = response.data.data.map(
          (item: { sub_activity: string }) => item.sub_activity
        );
        const codes = UNLOCKED_FORM_CODES.filter((code) =>
          permittedCodes.includes(code)
        );
        sessionStorage.setItem(cacheKey, JSON.stringify(codes));
        setPermittedFormCodes(new Set(codes));
      })
      .catch(() => {});
  }, [params.organizationId, params.accessToken]);

  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!elementRef.current) return;
    const resizeObserver = new ResizeObserver(() => {
      window.parent.postMessage(elementRef.current!.clientHeight, "*");
    });
    resizeObserver.observe(elementRef.current);
    return () => resizeObserver.disconnect();
  }, []);

  const handleMessage = useCallback(
    (event: MessageEvent) => {
      try {
        const messageData: { type?: string } =
          typeof event.data === "string"
            ? JSON.parse(event.data)
            : event.data;
        if (!messageData || typeof messageData !== "object") return;
        if (messageData.type === MESSAGE_TYPES.AI_UPLOAD) {
          setActiveTab(TAB_VALUES.AI);
        } else if (messageData.type === MESSAGE_TYPES.MANUAL_UPLOAD) {
          setActiveTab(TAB_VALUES.BULK);
        }
      } catch {
        return;
      }
    },
    [setActiveTab]
  );

  useEffect(() => {
    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleMessage]);

  return {
    activityCodeFromParent,
    activityName,
    activeTab,
    setActiveTab,
    captiveSubTab,
    setCaptiveSubTab,
    showAiTab,
    showFormsTab,
    showBulkTab,
    formsOnlyMode,
    elementRef,
  };
};
