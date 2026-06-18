import { useUserSession } from "@warp/client/hooks/use-user-session";
import { AppRoles, FormMode } from "@warp/shared/constants/app.constants";
import { useRouter } from 'next/router';
import { useMemo } from 'react';
import { useReviewerContext } from "../reviewer-context";
import { useFormFieldStore } from "../store";

export const usePointerEvents = (questionId?: string, enableQuestionField: boolean = false) => {
    const { query } = useRouter();
    const userSession = useUserSession();
    const { isReviewer, isMaker, reviewerStatusMap } = useReviewerContext();
    const isFormSubmitted = useFormFieldStore((state) => state.isFormSubmitted);
    const mode = query?.mode;

    const statusEntry = useMemo(() => {
        const entry = reviewerStatusMap.get(questionId || "");
        if (entry?.remark === "Answered by Maker") return undefined;
        return entry;
    }, [reviewerStatusMap, questionId]);

    const pointerEventsStyle = useMemo(() => {
        // EnableQuestionField logic from individual fields (if any)
        if (enableQuestionField) {
            return { pointerEvents: "auto" as const };
        }


        if ((mode === FormMode.View ||
            mode === FormMode.ViewRecommendation) && enableQuestionField === false) {
            return { pointerEvents: "auto" as const };
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
            return { pointerEvents: "auto" as const };
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
            return { pointerEvents: "auto" as const };
        }

        return { pointerEvents: "auto" as const };
    }, [
        enableQuestionField,
        isReviewer,
        isMaker,
        userSession?.user?.role,
        isFormSubmitted,
        query?.mode,
        statusEntry?.status,
    ]);

    return pointerEventsStyle;
};
