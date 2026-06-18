import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import { AppRoles, FormMode } from "@/modules/warp/packages/shared/constants/app.constants";
import { useParams } from "next/navigation";
import { useMemo } from 'react';
import { useReviewerContext } from "../reviewer-context";
import { useFormFieldStore } from "../store";

export const useDisabledField = (questionId?: string, enableQuestionField: boolean = false) => {
    const query = useParams<{ invitationId: string; mode: string }>();
    const userSession = useUserSession();
    const { isReviewer, isMaker, reviewerStatusMap } = useReviewerContext();
    const isFormSubmitted = useFormFieldStore((state) => state.isFormSubmitted);
    const mode = query?.mode;

    const statusEntry = useMemo(() => {
        const entry = reviewerStatusMap.get(questionId || "");
        if (entry?.remark === "Answered by Maker") return undefined;
        return entry;
    }, [reviewerStatusMap, questionId]);

    const isDisabled = useMemo(() => {
        // EnableQuestionField logic from individual fields (if any)
        if (enableQuestionField) {
            return false; // Not disabled if explicitly enabled
        }

        if ((mode === FormMode.View ||
            mode === FormMode.ViewRecommendation) && enableQuestionField === false) {
            return true; // Disabled in view modes
        }

        // Logic from GroupTabs Style
        if (
            !isReviewer &&
            !isMaker &&
            userSession?.user?.role !== AppRoles.Responder &&
            isFormSubmitted === true &&
            (mode !== FormMode.View ||
                mode !== FormMode.ViewRecommendation)
        ) {
            return false; // Not disabled for regular users after submission
        }

        const status = statusEntry?.status;
        const userRole = userSession?.user?.role;

        if (
            mode === FormMode.View ||
            mode === FormMode.ViewRecommendation ||
            (mode === FormMode.Review && isReviewer) ||
            (mode === FormMode.Review && isMaker && (status === undefined || status === "Re-Submitted" || status === "Accepted")) ||
            (mode === FormMode.Review && userRole === AppRoles.Responder && (status === undefined || status === "Re-Submitted" || status === "Accepted"))
        ) {
            return true; // Disabled in these conditions
        }

        return false; // Not disabled by default
    }, [
        enableQuestionField,
        isReviewer,
        isMaker,
        userSession?.user?.role,
        isFormSubmitted,
        query?.mode,
        statusEntry?.status,
    ]);

    return isDisabled;
};
