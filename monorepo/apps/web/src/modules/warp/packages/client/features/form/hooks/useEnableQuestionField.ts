import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import { AppRoles, FormMode, RecommendationStatus } from "@/modules/warp/packages/shared/constants/app.constants";
import { useParams } from "next/navigation";
import { useFormFieldStore, useInterimAnswerStore } from "../store";
import { FormFieldWithChildrenType } from "../types";

/**
 * Hook to determine if a question field should be enabled in ViewRecommendation mode.
 * A field is enabled if it has an open recommendation OR if any of its parents have an open recommendation.
 */
export const useEnableQuestionField = (formField: FormFieldWithChildrenType) => {
    const query = useParams<{ invitationId: string; mode: string }>();
    const userSession = useUserSession();
    const interimAnswers = useInterimAnswerStore((state) => state.interim_answers);
    const formFields = useFormFieldStore((state) => state.formFields);

    // Guard: Only proceed for Invitee/Responder in ViewRecommendation mode
    if (
        query?.mode !== FormMode.ViewRecommendation ||
        (userSession?.user?.role !== AppRoles.Invitee &&
            userSession?.user?.role !== AppRoles.Responder)
    ) {
        return false;
    }

    // Traverse up the tree to check for active recommendations
    let currentField: any = formField;

    while (currentField) {
        const fieldName = currentField.field?.trim();
        const specificRecomm = (interimAnswers as any)[fieldName];

        if (specificRecomm && !specificRecomm.isViewOnly) {
            const recommendations = (specificRecomm?.interim_recommendation?.length > 0)
                ? specificRecomm?.interim_recommendation
                : (specificRecomm?.interim_answer?.Interim_Recommendations || []);

            const hasActiveRecommendation = recommendations.some(
                (x: any) =>
                    x.status !== RecommendationStatus.Closed &&
                    x.status !== RecommendationStatus.PendingForApproval
            );

            if (hasActiveRecommendation && currentField.id === specificRecomm?.formFieldId && !formField.field.includes("_comments")) {
                return true;
            }
        }

        // Move to parent
        if (currentField.groupField) {
            const parentFieldName = currentField.groupField.trim().toLowerCase();
            const parentField = formFields.find((f: any) => f.field.trim().toLowerCase() === parentFieldName);
            currentField = parentField;
        } else {
            currentField = null;
        }
    }

    return false;
};
