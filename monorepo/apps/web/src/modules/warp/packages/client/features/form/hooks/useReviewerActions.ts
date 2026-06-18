import { useInsertMakerCheckerRemarkMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-maker-checker-remark";
import { useInsertReviewerDetailsMappingMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-reviewer-details-mapping";
import { useUpdateFormSubmissionStatusMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-form-submission-status";
import { useUpdateReviewerDetailsMappingMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-reviewer-details-mapping";
import { useGetDeclinedQuestionsCountLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-declined-questions-count";
import { useGetInvitationStatusCountsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-status-counts";
import { useCallback, useEffect, useState } from "react";
import { useUserSession } from "../../../hooks/use-user-session";

export const useReviewerActions = (invitationId: string) => {
    const userSession = useUserSession();
    const [insertReviewerMapping] = useInsertReviewerDetailsMappingMutation();
    const [updateReviewerMapping] = useUpdateReviewerDetailsMappingMutation();
    const [insertMakerCheckerRemark] = useInsertMakerCheckerRemarkMutation();
    const [updateSubmissionStatus] = useUpdateFormSubmissionStatusMutation();
    const [getDeclinedCount] = useGetDeclinedQuestionsCountLazyQuery({
        fetchPolicy: "network-only",
    });
    const [loading, setLoading] = useState(false);

    // Fetch submission details to get submissionId
    const [refetchInvData, { data: invitationStatusData }] = useGetInvitationStatusCountsLazyQuery({
        variables: {
            invitationId,
        },
    });

    useEffect(() => {
        refetchInvData();
    }, [invitationId]);

    const onReviewerDecline = useCallback(async (questionId: string, remark: string) => {
        // debugger;
        if (!remark.trim() || !invitationId || !questionId) {
            console.error("[ReviewerActions] Missing parameters:", {
                hasRemark: !!remark.trim(),
                invitationId,
                questionId
            });
            return false;
        }
        if (loading) return false;
        setLoading(true);
        const userId = userSession?.user?.id ?? "";

        // Refetch to get the latest data before performing mapping checks
        let latestInvData;
        try {
            const result = await refetchInvData();
            latestInvData = result.data;
        } catch (err) {
            console.error("[ReviewerActions] Failed to refetch invitation data:", err);
            latestInvData = invitationStatusData; // Fallback to current closure state
        }

        // Check if any email was sent today for this invitation
        const mappings = latestInvData?.FormInvitation?.[0]?.ReviewerDetailsMappings ?? [];
        const today = new Date().toISOString().split('T')[0];
        const emailSentToday = mappings.some((m: any) =>
            m.MakerCheckerRemarks?.some((r: any) =>
                r.Ismailsent === true && r.created_at?.split('T')[0] === today && r.status === "Declined"
            )
        );

        try {
            const existing = mappings.find((m: any) => m.questionId === questionId);
            let mappingId = existing?.id;
            if (existing) {
                await updateReviewerMapping({
                    variables: { id: existing.id, currentStatus: "Declined", updatedBy: userId },
                });
            } else {
                const res = await insertReviewerMapping({
                    variables: {
                        questionId,
                        currentStatus: "Declined",
                        createdBy: userId,
                        updatedBy: userId,
                        formInvitationId: invitationId,
                    },
                });
                mappingId = res.data?.insert_ReviewerDetailsMapping_one?.id;
            }

            if (mappingId) {
                const shouldSendEmail = !emailSentToday;
                await insertMakerCheckerRemark({
                    variables: {
                        reviewerDetailsMappingId: mappingId,
                        remark: remark.trim(),
                        status: "Declined",
                        createdBy: userId,
                        Ismailsent: shouldSendEmail,
                    },
                });

                if (shouldSendEmail) {
                    try {
                        await fetch("/warp/api/reviewer-declined-email", {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({
                                id: invitationId,
                                type: "ReviewerFormFirstDeclinedResponse",
                                companyId: invitationStatusData?.FormInvitation?.[0]?.companyId,
                                formId: invitationStatusData?.FormInvitation?.[0]?.formId,
                                platformId: userSession?.platform?.id,
                                questionId: questionId
                            })
                        });
                    } catch (err) {
                        console.error("Decline email failed:", err);
                    }
                }
            }

            // Update FormSubmission status to Declined
            const submissionId = invitationStatusData?.FormInvitation?.[0]?.FormSubmissions?.[0]?.id;
            if (submissionId) {
                await updateSubmissionStatus({
                    variables: { submissionId, status: "Declined" },
                });
            }

            await refetchInvData();

            return true;
        } catch (err) {
            console.error("[ReviewerActions] Decline failed:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [invitationId, invitationStatusData, userSession, insertReviewerMapping, updateReviewerMapping, insertMakerCheckerRemark, updateSubmissionStatus, refetchInvData, loading]);

    const onReviewerJustify = useCallback(async (questionId: string, remark: string) => {
        if (!remark.trim() || !invitationId || !questionId) {
            console.error("[ReviewerActions] Missing parameters:", {
                hasRemark: !!remark.trim(),
                invitationId,
                questionId
            });
            return false;
        }
        if (loading) return false;
        setLoading(true);
        const userId = userSession?.user?.id ?? "";
        const userRole = userSession?.user?.role ?? "";

        // Refetch to get the latest data before performing mapping checks
        let latestInvData;
        try {
            const result = await refetchInvData();
            latestInvData = result.data;
        } catch (err) {
            console.error("[ReviewerActions] Failed to refetch invitation data:", err);
            latestInvData = invitationStatusData; // Fallback to current closure state
        }

        // Check if any email was sent today for this invitation
        const mappings = latestInvData?.FormInvitation?.[0]?.ReviewerDetailsMappings ?? [];
        const today = new Date().toISOString().split('T')[0];
        const emailSentToday = mappings.some((m: any) =>
            m.MakerCheckerRemarks?.some((r: any) =>
                r.Ismailsent === true && r.created_at?.split('T')[0] === today && r.status === "Re-Submitted"
            )
        );

        try {
            const existing = mappings.find((m: any) => m.questionId === questionId);
            let mappingId = existing?.id;

            if (!mappingId) {
                const res = await insertReviewerMapping({
                    variables: {
                        questionId,
                        currentStatus: "Re-Submitted",
                        createdBy: userId,
                        updatedBy: userId,
                        formInvitationId: invitationId,
                    },
                });
                mappingId = res.data?.insert_ReviewerDetailsMapping_one?.id;
            } else {
                await updateReviewerMapping({
                    variables: { id: mappingId, currentStatus: "Re-Submitted", updatedBy: userId },
                });
            }

            const shouldSendEmail = !emailSentToday;

            // Step 2: Insert record in MakerCheckerremarks
            await insertMakerCheckerRemark({
                variables: {
                    reviewerDetailsMappingId: mappingId,
                    remark: remark.trim(),
                    status: "Re-Submitted",
                    createdBy: userId,
                    Ismailsent: shouldSendEmail,
                },
            });

            if (shouldSendEmail) {
                try {
                    await fetch("/warp/api/reviewer-resubmit-email", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            id: invitationId,
                            type: "ResubmitResponsesByReviewer",
                            companyId: latestInvData?.FormInvitation?.[0]?.companyId,
                            formId: latestInvData?.FormInvitation?.[0]?.formId,
                            platformId: userSession?.platform?.id,
                            questionId: questionId,
                            userRole: userRole
                        })
                    });
                } catch (err) {
                    console.error("Resubmit email failed:", err);
                }
            }

            // Step 3: Update FormSubmission.status if no other Declined questions remain
            const { data: countData } = await getDeclinedCount({
                variables: { invitationId },
            });

            const declinedCount = countData?.ReviewerDetailsMapping_aggregate?.aggregate?.count ?? 0;

            if (declinedCount === 0) {
                const submissionId = invitationStatusData?.FormInvitation?.[0]?.FormSubmissions?.[0]?.id;
                if (submissionId) {
                    await updateSubmissionStatus({
                        variables: { submissionId, status: "Re-Submitted" },
                    });
                }
            }

            await refetchInvData();

            return true;
        } catch (err) {
            console.error("[ReviewerActions] Justify failed:", err);
            return false;
        } finally {
            setLoading(false);
        }
    }, [invitationId, invitationStatusData, userSession, insertReviewerMapping, updateReviewerMapping, insertMakerCheckerRemark, updateSubmissionStatus, getDeclinedCount, refetchInvData, loading]);

    return { onReviewerDecline, onReviewerJustify, loading };
};
