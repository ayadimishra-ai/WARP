"use client";

import { Button, Flex, Modal, Stack, Text, Textarea, Title } from "@mantine/core";
import { IconAlertCircle } from "@tabler/icons-react";
import WarpForm from "@/modules/warp/packages/client/features/form";
import { isUserAllowedAIFeature } from "@/modules/warp/packages/client/features/form/common-functions";
import { ReviewerRemark, ReviewerStatusEntry } from "@/modules/warp/packages/client/features/form/reviewer-context";
import { useFormFieldStore } from "@/modules/warp/packages/client/features/form/store";
import { GetRenderFormDetailsQuerySuggestionType } from "@/modules/warp/packages/client/features/form/types";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import {
  PageReload,
  hideViewRecommendationForReviewer,
  warpApproveEntireReport,
  warpDeclineAnswer,
  warpShowHideCommentList
} from "@/modules/warp/packages/client/services/platform-window-message.service";
import { InvitationComment_Bool_Exp } from "@/modules/warp/packages/graphql/generated/types";
import { useBulkUpsertReviewerDetailsMappingMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-upsert-reviewer-details-mapping";
import { useInsertMakerCheckerRemarkMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-maker-checker-remark";
import { useInsertReviewerDetailsMappingMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-reviewer-details-mapping";
import { useUpdateFormInvitationStatusMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-form-invitation-status";
import { useUpdateReviewerDetailsMappingMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-reviewer-details-mapping";
import { useUpdateSubmissionStatusMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-submission-status";
import { useGetAnsweredResultLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answered-result";
import { useGetAssignedQuestionDetailsByInvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-assigned-question-details-by-invitation-id";
import { useGetCompanyDetailByIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-companydetail-by-id";
import { useGetGlobalMasterByTypeQuery } from "@/modules/warp/packages/graphql/queries/generated/get-global-master-by-type";
import { useGetinvitationcommentQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-comment";
import { useGetInvitationStatusCountsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-status-counts";
import { useGetvalidationandratingQuery } from "@/modules/warp/packages/graphql/queries/generated/get-rara-validation-and-rating";
import { useGetRecommendationRenderFormDetailsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-recommendation-render-form-details";
import { useGetRenderFormDetailsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-render-form-details";
import { useGetRenderFormFieldDetailsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-render-formfield-details";
import {
  AppRoles,
  FormInvitationStatus,
  FormMode,
  FormTypes,
} from "@/modules/warp/packages/shared/constants/app.constants";
import { isFormAIEnabled } from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import { useParams, useSearchParams } from "next/navigation";
import { FC, memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
const WarpFormScreen: FC<{
  invitationId: string;
  mode?: string;
}> = ({ invitationId, mode: modeProp }) => {
  const assignedQuestionDetail =
    useGetAssignedQuestionDetailsByInvitationIdQuery({
      variables: { invitationId: invitationId },
    });
  const postParentMessage = (message: string) =>
    typeof window !== "undefined" && window?.parent?.postMessage(message, "*");
  const searchParams = useSearchParams();
  // Mode resolution: prop takes precedence (the embedded iframe route carries
  // the mode in the URL path segment), then fall back to the ?mode= search
  // param for callers that pass it that way.
  const query = useMemo(
    () => ({ mode: modeProp ?? searchParams?.get("mode") ?? undefined }),
    [modeProp, searchParams]
  );

  const isViewMode = query?.mode === FormMode.View;
  const userSession = useUserSession();
  const chkStore = useFormFieldStore((store) => store);
  const [formDetails, setformDetails] = useState<any>();
  const [formFieldsDetails, setformFieldsDetails] = useState<any>();
  const [loading, setLoading] = useState<boolean>();
  const [hasFetchedCompanyDetails, setHasFetchedCompanyDetails] =
    useState(false);

  // ── Reviewer state ──────────────────────────────────────────────────────────
  // Map from questionId → { id, status, remark, remarkTimestamp }
  const [reviewerStatusMap, setReviewerStatusMap] = useState<
    Map<string, ReviewerStatusEntry>
  >(new Map());
  // Decline modal state
  const [declineModalOpen, setDeclineModalOpen] = useState(false);
  const [declineQuestionId, setDeclineQuestionId] = useState<string | null>(null);
  const [declineRemark, setDeclineRemark] = useState("");
  const [declineRemarkError, setDeclineRemarkError] = useState("");
  const [declineSaving, setDeclineSaving] = useState(false);
  const [isRefetching, setIsRefetching] = useState(false);

  // ── Reviewer mutations ───────────────────────────────────────────────────────
  const [insertReviewerMapping] = useInsertReviewerDetailsMappingMutation();
  const [updateReviewerMapping] = useUpdateReviewerDetailsMappingMutation();
  const [bulkUpsertReviewerMapping] = useBulkUpsertReviewerDetailsMappingMutation();
  const [insertMakerCheckerRemark] = useInsertMakerCheckerRemarkMutation();
  const [updateSubmissionStatus] = useUpdateSubmissionStatusMutation();
  const [updateFormStatus] = useUpdateFormInvitationStatusMutation();

  // ── Fetch existing ReviewerDetailsMappings on load ───────────────────────────
  // const [invitationAndSubmissionQuery, { data: invitationAndSubmissionData, loading: invitationAndSubmissionLoading }] =
  //   useGetInvitationAndSubmissionDetailsByInvitationIdQuery({
  //     variables: {
  //       invitationId,
  //     },
  //   });

  const [fetchInvitationStatusCounts, { data: invitationStatusData, loading: detailsLoading }] =
    useGetInvitationStatusCountsLazyQuery({
      fetchPolicy: "cache-first",
    });

  useEffect(() => {
    if (invitationId) {
      fetchInvitationStatusCounts({ variables: { invitationId } });
    }
  }, [invitationId]);

  const reviewerDetails =
    invitationStatusData?.FormInvitation?.[0]?.reviewerDetails;
  let isMaker =
    invitationStatusData?.FormInvitation?.[0]?.ParentCompanyMapping?.UserId === userSession?.user?.id && useFormFieldStore?.getState()?.isFormSubmitted === true;
  // debugger;
  const isReviewer =
    !!reviewerDetails?.id &&
    userSession?.user?.id === reviewerDetails.id &&
    query?.mode === FormMode.Review;

  // Initialise local state from DB data (runs once when query resolves)
  const hasInitializedReviewerState = useRef(false);
  useEffect(() => {
    if (
      hasInitializedReviewerState.current ||
      detailsLoading ||
      !invitationStatusData
    )
      return;
    const mappings =
      invitationStatusData?.FormInvitation?.[0]
        ?.ReviewerDetailsMappings ?? [];
    if (mappings.length === 0) return;
    hasInitializedReviewerState.current = true;
    const map = new Map<string, ReviewerStatusEntry>();
    mappings.forEach((m: any) => {
      map.set(m.questionId, {
        id: m.id,
        status: m.currentStatus as "Accepted" | "Declined" | "Re-Submitted",
        remark: m.MakerCheckerRemarks?.[0]?.remark,
        remarkTimestamp: m.MakerCheckerRemarks?.[0]?.created_at,
        remarks: m.MakerCheckerRemarks?.map((r: any) => ({
          remark: r.remark,
          status: r.status as "Accepted" | "Declined" | "Re-Submitted",
          timestamp: r.created_at,
        })) ?? [],
      });
    });
    setReviewerStatusMap(map);
  }, [
    detailsLoading,
    invitationStatusData,
  ]);

  // ── Accept handler ───────────────────────────────────────────────────────────
  const handleAccept = useCallback(
    async (questionId: string) => {
      const userId = userSession?.user?.id ?? "";
      const existing = reviewerStatusMap.get(questionId);
      try {
        let mappingId = existing?.id;
        if (existing) {
          await updateReviewerMapping({
            variables: { id: existing.id, currentStatus: "Accepted", updatedBy: userId },
          });
        } else {
          const res = await insertReviewerMapping({
            variables: {
              questionId,
              currentStatus: "Accepted",
              createdBy: userId,
              updatedBy: userId,
              formInvitationId: invitationId,
            },
          });
          mappingId = res.data?.insert_ReviewerDetailsMapping_one?.id;
        }
        setReviewerStatusMap((prev) => {
          const next = new Map(prev);
          next.set(questionId, { id: mappingId!, status: "Accepted" });
          return next;
        });
        // Trigger a refetch to ensure database and local state are in sync
        const refetchedData = await fetchInvitationStatusCounts({ variables: { invitationId } });
        const refetchedInvitation = refetchedData.data?.FormInvitation?.[0];
        const mappings = refetchedInvitation?.ReviewerDetailsMappings ?? [];
        const reSubmittedCount = mappings.filter((m: any) => m.currentStatus === "Re-Submitted").length;

        const submissionId =
          refetchedInvitation?.FormSubmissions?.[0]?.id;
        const currentSubmissionStatus =
          refetchedInvitation?.FormSubmissions?.[0]?.status;

        if (reSubmittedCount === 0 && currentSubmissionStatus === "Re-Submitted") {
          if (submissionId) {
            await updateSubmissionStatus({
              variables: { submissionId, submissionStatus: "New" },
            });
          }
        }
        return true;
      } catch (err) {
        console.error("[Reviewer] Accept failed:", err);
        return false;
      }
    },
    [reviewerStatusMap, userSession?.user?.id, insertReviewerMapping, updateReviewerMapping, invitationId]
  );

  // ── Decline modal open ───────────────────────────────────────────────────────
  const handleDeclineOpen = useCallback((questionId: string) => {
    postParentMessage(warpDeclineAnswer(true, { questionId }, false));
  }, []);

  // ── Decline submit ───────────────────────────────────────────────────────────
  const handleDeclineSubmit = useCallback(async (questionId: string, remark: string, skipEmail: boolean = false) => {
    if (!remark.trim()) return false;
    const now = new Date().toISOString();
    setDeclineSaving(true);
    const userId = userSession?.user?.id ?? "";
    const existing = reviewerStatusMap.get(questionId);
    const mappings = invitationStatusData?.FormInvitation?.[0]?.ReviewerDetailsMappings ?? [];

    // Check if any email was sent today for this invitation
    const today = new Date().toISOString().split('T')[0];
    const emailSentToday = mappings.some((m: any) =>
      m.MakerCheckerRemarks?.some((r: any) =>
        r.Ismailsent === true && r.created_at?.split('T')[0] === today
      )
    );

    try {
      if (declineSaving) return false;
      let mappingId = existing?.id;
      if (existing) {
        await updateReviewerMapping({
          variables: { id: existing.id, currentStatus: "Declined", updatedBy: userId },
        });
      } else {
        const res = await insertReviewerMapping({
          variables: {
            questionId: questionId,
            currentStatus: "Declined",
            createdBy: userId,
            updatedBy: userId,
            formInvitationId: invitationId,
          },
        });
        mappingId = res.data?.insert_ReviewerDetailsMapping_one?.id;
      }
      if (mappingId) {
        // Only send first email today if not skipping
        const shouldSendEmail = !emailSentToday && !skipEmail;

        await insertMakerCheckerRemark({
          variables: {
            reviewerDetailsMappingId: mappingId,
            remark: remark.trim(),
            status: "Declined",
            createdBy: userId,
            Ismailsent: shouldSendEmail
          },
        });

        if (shouldSendEmail) {
          fetch("/warp/api/reviewer-declined-email", {
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
          }).catch(err => console.error("Immediate decline email failed:", err));
        }
      }
      // Update FormSubmission status to Declined
      const submissionId =
        invitationStatusData?.FormInvitation?.[0]
          ?.FormSubmissions?.[0]?.id;
      if (submissionId) {
        await updateSubmissionStatus({
          variables: { submissionId, submissionStatus: "Declined" },
        });
      }

      // Trigger a refetch to ensure database and local state are in sync
      const refetchedData = await fetchInvitationStatusCounts({ variables: { invitationId } });
      const freshMappings = refetchedData.data?.FormInvitation?.[0]?.ReviewerDetailsMappings ?? [];
      const freshMapping = freshMappings.find((m: any) => m.questionId === questionId);
      if (freshMapping) {
        mappingId = freshMapping.id;
      }

      setReviewerStatusMap((prev) => {
        const next = new Map(prev);
        const entry = next.get(questionId);
        const newRemark: ReviewerRemark = {
          remark: remark.trim(),
          status: "Declined",
          timestamp: now,
        };
        next.set(questionId, {
          id: mappingId!,
          status: "Declined",
          remark: remark.trim(),
          remarkTimestamp: now,
          remarks: entry ? [newRemark, ...(entry.remarks ?? [])] : [newRemark],
        });
        return next;
      });
      setDeclineModalOpen(false);
      setDeclineRemark("");
      return true;
    } catch (err) {
      console.error("[Reviewer] Decline failed:", err);
      return false;
    } finally {
      setDeclineSaving(false);
    }
  }, [
    reviewerStatusMap,
    userSession?.user?.id,
    insertReviewerMapping,
    updateReviewerMapping,
    insertMakerCheckerRemark,
    updateSubmissionStatus,
    fetchInvitationStatusCounts,
    invitationId,
    userSession?.platform?.id,
    declineSaving,
  ]);

  const handleJustifySubmit = useCallback(async (questionId: string, remark: string, skipEmail: boolean = false) => {
    if (!remark.trim()) return false;
    const now = new Date().toISOString();
    const userId = userSession?.user?.id ?? "";
    const userRole = userSession?.user?.role ?? "";
    const existing = reviewerStatusMap.get(questionId);

    const mappings = invitationStatusData?.FormInvitation?.[0]?.ReviewerDetailsMappings ?? [];
    const today = new Date().toISOString().split('T')[0];
    const emailSentToday = mappings.some((m: any) =>
      m.MakerCheckerRemarks?.some((r: any) =>
        r.Ismailsent === true && r.created_at?.split('T')[0] === today
      )
    );

    try {
      if (declineSaving) return false;
      setDeclineSaving(true);
      let mappingId = existing?.id;
      if (!mappingId) {
        const res = await insertReviewerMapping({
          variables: {
            questionId: questionId,
            currentStatus: "Re-Submitted",
            createdBy: userId,
            updatedBy: userId,
            formInvitationId: invitationId,
          },
        });
        mappingId = res.data?.insert_ReviewerDetailsMapping_one?.id;
      } else {
        // Update Mapping Status
        await updateReviewerMapping({
          variables: { id: mappingId, currentStatus: "Re-Submitted", updatedBy: userId },
        });
      }

      if (mappingId) {
        const shouldSendEmail = !emailSentToday && !skipEmail;

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
          fetch("/warp/api/reviewer-resubmit-email", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              id: invitationId,
              type: "ResubmitResponsesByReviewer",
              companyId: invitationStatusData?.FormInvitation?.[0]?.companyId,
              formId: invitationStatusData?.FormInvitation?.[0]?.formId,
              platformId: userSession?.platform?.id,
              questionId: questionId,
              userRole: userRole
            })
          }).catch(err => console.error("Immediate resubmit email failed:", err));
        }

        // Update FormSubmission status
        const submissionId =
          invitationStatusData?.FormInvitation?.[0]
            ?.FormSubmissions?.[0]?.id;

        // Re-calculate overall status (only Re-Submitted if no other Declined)
        const updatedMappings = mappings.map((m: any) => m.questionId === questionId ? { ...m, currentStatus: "Re-Submitted" } : m);
        const hasAnyDeclined = updatedMappings.some((m: any) => m.currentStatus === "Declined");

        if (submissionId && !hasAnyDeclined) {
          await updateSubmissionStatus({
            variables: { submissionId, submissionStatus: "Re-Submitted" },
          });
        }

        // Trigger a refetch to ensure database and local state are in sync
        const refetchedData = await fetchInvitationStatusCounts({ variables: { invitationId } });
        const freshMappings = refetchedData.data?.FormInvitation?.[0]?.ReviewerDetailsMappings ?? [];
        const freshMapping = freshMappings.find((m: any) => m.questionId === questionId);
        if (freshMapping) {
          mappingId = freshMapping.id;
        }

        setReviewerStatusMap((prev) => {
          const next = new Map(prev);
          const entry = next.get(questionId);
          const newRemark: ReviewerRemark = {
            remark: remark.trim(),
            status: "Re-Submitted",
            timestamp: now,
          };
          next.set(questionId, {
            id: mappingId!,
            status: "Re-Submitted",
            remark: remark.trim(),
            remarkTimestamp: now,
            remarks: entry ? [newRemark, ...(entry.remarks ?? [])] : [newRemark],
          });
          return next;
        });
        setDeclineModalOpen(false);
        setDeclineRemark("");
        return true;
      }
      return false;
    } catch (err) {
      console.error("[Reviewer] Justify failed:", err);
      return false;
    } finally {
      setDeclineSaving(false);
    }
  }, [
    reviewerStatusMap,
    userSession?.user?.id,
    insertReviewerMapping,
    updateReviewerMapping,
    insertMakerCheckerRemark,
    updateSubmissionStatus,
    fetchInvitationStatusCounts,
    invitationId,
    userSession?.platform?.id,
    declineSaving,
  ]);

  useEffect(() => {
    if (isReviewer) {
      const declinedCount = Array.from(reviewerStatusMap.values()).filter(
        (entry) => entry.status === "Declined"
      ).length;
      const isApproved = declinedCount === 0;
      postParentMessage(
        warpApproveEntireReport(isReviewer, isApproved, invitationId)
      );
    }
  }, [isReviewer, reviewerStatusMap]);

  // ────────────────────────────────────────────────────────────────────────────
  const fetchData = useGetRenderFormDetailsLazyQuery()[0];
  const fetchFormFieldData = useGetRenderFormFieldDetailsLazyQuery()[0];
  const fetchRecommendationData =
    useGetRecommendationRenderFormDetailsLazyQuery()[0];
  let invitaionIdArray: any = [];
  invitaionIdArray.push(invitationId);
  const { data: ratingValidation } = useGetvalidationandratingQuery({
    variables: {
      invitationId: invitaionIdArray,
    },
  });
  // showing form result in console for View mode only
  const [answeredQuestionResult, { data: answeredData }] =
    useGetAnsweredResultLazyQuery({
      variables: { invitationId },
    });
  let isCarryforward: boolean = false;
  let isAIDataPointsAdded: boolean = false;
  const [fetchCompanyDetails, { data: companyDetails }] =
    useGetCompanyDetailByIdLazyQuery({
      variables: {
        id: userSession?.company?.id,
      },
    });
  let wheredata: InvitationComment_Bool_Exp = {
    invitationId: { _eq: invitationId },
    isActive: { _eq: true },
  };
  const invitationCommentsListData = useGetinvitationcommentQuery({
    variables: {
      where: wheredata,
    },
  });
  // let distinctquestion: any = [];
  let totalCommentsOnQuestions: number = 0;
  let totalCommentButton: number = 0;
  if (formFieldsDetails?.FormInvitation[0]?.Form?.FormFields != undefined) {
    totalCommentButton =
      formFieldsDetails?.FormInvitation[0]?.Form?.FormFields.filter(
        (x: any) => x.interfaceOptions?.isAddcomment == true
      )?.length;
  }
  let isAllowAssignQuestion: boolean = false;
  if (formDetails?.FormInvitation[0]?.Form?.isDelegateQuestion != null) {
    isAllowAssignQuestion =
      formDetails?.FormInvitation[0]?.Form?.isDelegateQuestion;
  }
  if (invitationCommentsListData?.data?.InvitationComment != undefined) {
    if (userSession?.user?.role === AppRoles.Responder) {
      let alldata = assignedQuestionDetail?.data?.AssesseeUserMapping?.filter(
        (x: any) => x?.userByUserid?.id == userSession?.user?.id
      );
      alldata?.map((items: any) => {
        items?.Question?.FormFields.map((fielditem: any) => {
          if (
            invitationCommentsListData?.data?.InvitationComment != undefined
          ) {
            totalCommentsOnQuestions =
              totalCommentsOnQuestions +
              invitationCommentsListData?.data?.InvitationComment.filter(
                (d: any) => d.formFieldId == fielditem?.id
              ).length;
          }
        });
      });
    } else {
      totalCommentsOnQuestions =
        invitationCommentsListData?.data?.InvitationComment.filter(
          (d: any) => d.formFieldId != null
        ).length;
    }
  }

  if (isViewMode) console.log("QA-FormScore", answeredData); // Do not remove this.

  useEffect(() => {
    if (!invitationId || formDetails) return; // already fetched — do not re-run
    if (query?.mode === FormMode.ViewRecommendation) {
      fetchRecommendationData({ variables: { invitationId } }).then(
        (response) => {
          setformDetails(response.data);
        }
      );
      fetchFormFieldData({ variables: { invitationId } }).then(
        (responseFormField) => {
          const { data: formFieldsData } = responseFormField;
          setformFieldsDetails(formFieldsData);
        }
      );
    } else {
      fetchData({
        variables: {
          invitationId,
        },
      }).then((response) => {
        setformDetails(response.data);
      });

      fetchFormFieldData({ variables: { invitationId } }).then(
        (responseFormField) => {
          const { data: formFieldsData } = responseFormField;
          setformFieldsDetails(formFieldsData);
        }
      );
    }
    if (isViewMode) answeredQuestionResult();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invitationId, query?.mode]);

  let formDetails_new: any = {};
  const UserDetails = formDetails?.AssesseeUserMapping.filter(
    (item: any) => item.userId === userSession?.user?.id
  );
  if (!!formDetails && formDetails?.FormInvitation.length > 0) {
    isAIDataPointsAdded =
      formDetails?.FormInvitation[0]?.Form?.isAIDataPointsAdded;
  }
  let formInvitation: any;
  if (UserDetails !== undefined && UserDetails?.length > 0) {
    let unique = formFieldsDetails?.FormInvitation[0]?.Form?.FormFields.reduce(
      (acc: any, curr: any) => {
        const data = UserDetails?.find(
          (item: any) =>
            item.questionId === curr?.Question?.id || curr.Question === null
        );
        if (data) {
          acc.push(curr);
        }
        return acc;
      },
      []
    );

    let formFieldsList =
      formFieldsDetails?.FormInvitation[0]?.Form?.FormFields?.filter(
        (item: any) => {
          return UserDetails?.find(
            (itm: any) => itm.questionId === item.Question?.id
          );
        }
      );
    // if (
    //   formFieldsList.length > 0 &&
    //   userSession?.user?.role === AppRoles.Responder
    // ) {
    //   let questionId = formFieldsList[0]?.Question?.id;
    //   setLocalStorageData(
    //     window.localStorage,
    //     "IsPageRefreshed",
    //     questionId || "null"
    //   );
    // }
    let wizardList: any = unique?.filter(
      (x: any) => x.interface === "group-wizard"
    );
    let wizardStepsList: any =
      formFieldsDetails?.FormInvitation[0]?.Form?.FormFields?.filter(
        (x: any) => x.interface === "group-wizard-step"
      );

    let wizardTabList: any =
      formFieldsDetails?.FormInvitation[0]?.Form?.FormFields?.filter(
        (x: any) => x.interface === "group-tabs"
      );
    let finalWizardList: any = formFieldsList?.filter(
      (y: any) => y.interface === "group-wizard"
    );
    if (finalWizardList?.length === 0) {
      formFieldsList?.push(wizardList[0]);
    }
    let getTabStep: any = [];
    let getTabStep1 = formFieldsList?.filter(
      (x: any) =>
        x.subtheme !== null || x.Section?.content === "Business Overview"
    );
    if (!!getTabStep1 && getTabStep1?.length > 0) {
      getTabStep = getTabStep1;
    } else {
      getTabStep = formFieldsList?.filter(
        (x: any) => x.interface != "group-wizard"
        //x.Section?.content === "PS1" || x.Section?.content === "PS2"
      );
    }
    getTabStep?.map((subDetail: any) => {
      let groupFieldList: any = unique?.filter(
        (x: any) => x.field === subDetail.groupField
      );
      let finalgroupFieldList: any = formFieldsList?.filter(
        (y: any) => y.field === groupFieldList[0]?.field
      );
      if (finalgroupFieldList?.length === 0) {
        formFieldsList?.push(groupFieldList[0]);
        let stepList: any = unique?.filter(
          (x: any) => x.field === groupFieldList[0]?.groupField
        );
        let filterStepList: any = formFieldsList?.filter(
          (y: any) => y.field === stepList[0]?.field
        );
        if (filterStepList?.length === 0) {
          formFieldsList?.push(stepList[0]);
          let getAllThemes = unique?.filter((x: any) => x.type === "sub-theme");

          let getSectionQuestion = getTabStep?.filter(
            (x: any) => x.Section?.parentSectionId === stepList[0]?.Section?.id
          );

          getSectionQuestion?.map((subTheme: any) => {
            let getSpecificThemes = getAllThemes?.filter(
              (x: any) =>
                x.subtheme === subTheme?.subtheme &&
                x.type === "sub-theme" &&
                x.Section?.parentSectionId === stepList[0]?.Section?.id &&
                x.Section?.content === subTheme.Section.content
            );

            let getSpecificThemesExist = formFieldsList?.filter(
              (x: any) =>
                x.subtheme === subTheme?.subtheme &&
                x.type === "sub-theme" &&
                x.Section?.parentSectionId === stepList[0]?.Section?.id &&
                x.Section?.content === subTheme.Section.content
            );
            if (
              getSpecificThemesExist?.length === 0 &&
              getSpecificThemes?.length > 0
            ) {
              formFieldsList?.push(getSpecificThemes[0]);

              let getSubThemeBreadCrumb =
                getSpecificThemes[0]?.interfaceOptions?.breadcrumb;
              getSubThemeBreadCrumb
                ?.split(">")
                .map((item: any, index: number) => {
                  let getSpecificMainThemes = getAllThemes?.filter(
                    (x: any) =>
                      x.field === getSpecificThemes[0]?.groupField &&
                      x.type === "sub-theme" &&
                      x.subtheme === item.trim()
                  );

                  let getSpecificMainThemesExist = formFieldsList?.filter(
                    (x: any) =>
                      x.field === getSpecificThemes[0]?.groupField &&
                      x.type === "sub-theme" &&
                      x.subtheme === item.trim()
                  );
                  if (
                    getSpecificMainThemesExist?.length === 0 &&
                    getSpecificMainThemes?.length > 0
                  ) {
                    formFieldsList?.push(getSpecificMainThemes[0]);
                  }
                });
            }
          });
        }
      }
    });

    if (getTabStep?.length === 0) {
      wizardStepsList.map((item: any) => formFieldsList?.push(item));
      wizardTabList.map((item: any) => formFieldsList?.push(item));
    }
    formDetails_new = {
      AssesseeUserMapping: formDetails?.AssesseeUserMapping,
      FormInvitation: [
        {
          Form: {
            Details: formDetails?.FormInvitation[0]?.Form?.Details,
            FormFields: formFieldsList,
            id: formDetails?.FormInvitation[0]?.Form?.id,
            name: formDetails?.FormInvitation[0]?.Form?.name,
            __typename: formDetails?.FormInvitation[0]?.Form.__typename,
          },
          FormSubmissions: formDetails?.FormInvitation[0]?.FormSubmissions,
          ParentCompanyMapping:
            formDetails?.FormInvitation[0]?.ParentCompanyMapping,
          id: formDetails?.FormInvitation[0]?.id,
          status: formDetails?.FormInvitation[0]?.status,
          interimCheck: formDetails?.FormInvitation[0]?.interimCheck,
          __typename: formDetails?.FormInvitation[0]?.__typename,
        },
      ],
    };

    formInvitation = formDetails_new?.FormInvitation[0];
  } else {
    formInvitation = formDetails?.FormInvitation[0];
  }

  //const formInvitation = formDetails?.FormInvitation[0];
  let formSubmission: any;
  let formFields: any;
  let answers: any;
  let formId: any;
  let isError = false;
  if (
    !!formInvitation?.FormSubmissions[0]?.IsCarryForward &&
    formInvitation?.FormSubmissions[0]?.IsCarryForward.length > 0
  ) {
    if (
      formInvitation?.FormSubmissions[0]?.IsCarryForward?.filter(
        (d: any) => d?.Interim_Answers?.length > 0
      ).length > 0
    ) {
      isCarryforward = true;
    } else {
      if (
        !!formInvitation?.FormSubmissions[0]?.Interim_Answers &&
        formInvitation?.FormSubmissions[0]?.Interim_Answers.length > 0
      ) {
        if (
          formInvitation?.FormSubmissions[0]?.Interim_Answers?.filter(
            (d: any) => !!d.Interim_Answer && d.Interim_Answer.length > 0
          ).length > 0
        ) {
          isCarryforward = true;
        }
      }
    }
  }
  if (query?.mode === FormMode.Start) {
    if (
      (userSession?.user?.role === AppRoles.Invitee ||
        userSession?.user?.role === AppRoles.Responder) &&
      formInvitation?.status === FormInvitationStatus.Draft
    ) {
      formSubmission = formInvitation?.FormSubmissions[0];
      formFields =
        formInvitation?.Form?.FormFields?.length > 0
          ? formInvitation?.Form?.FormFields
          : formFieldsDetails?.FormInvitation[0]?.Form?.FormFields;
      answers = formSubmission?.Answers;
      formId = formInvitation?.Form?.id;
      isError = false;
    } else if (
      (userSession?.user?.role === AppRoles.Invitee ||
        userSession?.user?.role === AppRoles.Responder) &&
      formInvitation?.status === FormInvitationStatus.Invited
    ) {
      formSubmission = formInvitation?.FormSubmissions[0];
      formFields =
        formInvitation?.Form?.FormFields?.length > 0
          ? formInvitation?.Form?.FormFields
          : formFieldsDetails?.FormInvitation[0]?.Form?.FormFields;
      answers = formSubmission?.Answers;
      formId = formInvitation?.Form?.id;
      isError = false;
    } else {
      if (
        formInvitation?.ParentCompanyMapping?.ParentUserId ===
        formInvitation?.ParentCompanyMapping?.UserId &&
        (formInvitation?.Form?.formtype === FormTypes.Report ||
          formInvitation?.Form?.formtype === FormTypes.Assessment)
      ) {
        formSubmission = formInvitation?.FormSubmissions[0];
        formFields =
          formInvitation?.Form?.FormFields?.length > 0
            ? formInvitation?.Form?.FormFields
            : formFieldsDetails?.FormInvitation[0]?.Form?.FormFields;
        answers = formSubmission?.Answers;
        formId = formInvitation?.Form?.id;
        isError = false;
      } else {
        isError = true;
      }
    }
  } else if (query?.mode === FormMode.View) {
    formSubmission = formInvitation?.FormSubmissions[0];
    formFields =
      formInvitation?.Form?.FormFields?.length > 0
        ? formInvitation?.Form?.FormFields
        : formFieldsDetails?.FormInvitation[0]?.Form?.FormFields;
    answers = formSubmission?.Answers;
    formId = formInvitation?.Form?.id;
    isError = false;
  } else if (query?.mode === FormMode.ViewRecommendation) {
    formSubmission = formInvitation?.FormSubmissions[0];
    formFields =
      formInvitation?.Form?.FormFields?.length > 0
        ? formInvitation?.Form?.FormFields
        : formFieldsDetails?.FormInvitation[0]?.Form?.FormFields;
    answers = formSubmission?.Interim_Answers;
    formId = formInvitation?.Form?.id;
    isError = false;
  } else if (query?.mode === FormMode.Review) {
    formSubmission = formInvitation?.FormSubmissions[0];
    formFields =
      formInvitation?.Form?.FormFields?.length > 0
        ? formInvitation?.Form?.FormFields
        : formFieldsDetails?.FormInvitation[0]?.Form?.FormFields;
    answers = formSubmission?.Answers;
    formId = formInvitation?.Form?.id;
    isError = false;
  } else {
    isError = true;
  }
  let formFieldSuggestion: GetRenderFormDetailsQuerySuggestionType = [];
  if (
    userSession?.user?.role === AppRoles.Invitee ||
    userSession?.user?.role === AppRoles.Responder ||
    userSession?.user?.role === AppRoles.Consultant ||
    userSession?.user?.role === AppRoles.Inviter
  ) {
    formFieldSuggestion = formFieldsDetails?.FormInvitation[0]?.Suggestions;
  }
  let isFormSubmitted =
    formInvitation?.status === FormInvitationStatus.Submitted ||
      formInvitation?.status === FormInvitationStatus.Approved ||
      formInvitation?.status === FormInvitationStatus.UnderReview
      ? true
      : false;

  if (formInvitation?.status === FormInvitationStatus.Approved && !!reviewerDetails?.id &&
    userSession?.user?.id === reviewerDetails.id) {
    postParentMessage(hideViewRecommendationForReviewer(false));
  }

  isMaker = (invitationStatusData?.FormInvitation?.[0]?.ParentCompanyMapping?.UserId === userSession?.user?.id || invitationStatusData?.FormInvitation?.[0]?.parentCompanyMappingByReviewerparentcompanyid?.ParentUserId === userSession?.user?.id) && isFormSubmitted === true;

  const { data: commentsAccessData } = useGetGlobalMasterByTypeQuery({
    variables: {
      type: "CommentsAccess",
    },
  });

  // const invitationListData = useGetinvitationcommentQuery({
  //   variables: {
  //     invitationId: invitationId,
  //   },
  // });

  formId = formDetails?.FormInvitation[0]?.Form?.id;

  const companyId = useMemo(() => {
    if (userSession?.user?.role === AppRoles.Consultant) {
      return userSession?.company?.id;
    }
    if (userSession?.user?.role === AppRoles.Invitee) {
      return formInvitation?.ParentCompanyMapping?.ParentCompanyId;
    }
    return userSession?.company?.id;
  }, [
    userSession?.user?.role,
    formInvitation?.ParentCompanyMapping?.ParentCompanyId,
    userSession?.company?.id,
  ]);

  const commentsAccessFilteredData = useMemo(() => {
    if (
      commentsAccessData?.GlobalMaster &&
      commentsAccessData?.GlobalMaster.length > 0
    ) {
      return commentsAccessData?.GlobalMaster[0]?.data?.filter(
        (d: any) => d?.companyId === companyId && d?.formId === formId
      );
    }
    return [];
  }, [commentsAccessData, companyId, formId]);

  useEffect(() => {
    if (
      userSession?.user?.role === AppRoles.Consultant &&
      !hasFetchedCompanyDetails
    ) {
      fetchCompanyDetails();
      setHasFetchedCompanyDetails(true);
    }

    let variables = "";

    let IsShow: boolean = false;
    let IsShowComment: boolean = false;
    let IsEditComment: boolean = false;

    if (commentsAccessFilteredData.length > 0) {
      if (
        userSession?.user?.role === AppRoles.Inviter ||
        userSession?.user?.role === AppRoles.Consultant
      ) {
        switch (formInvitation?.status) {
          case FormInvitationStatus.Draft: {
            IsShow = false;
            IsShowComment = false;
            IsEditComment = true;
            break;
          }

          case FormInvitationStatus.Submitted: {
            if (!!commentsAccessFilteredData[0]?.IsReopeningEnabled) {
              IsShow = true;
              IsShowComment = false;
              IsEditComment = false;
              break;
            }
          }

          case FormInvitationStatus.Approved: {
            IsShow = false;
            IsShowComment = true;
            IsEditComment = false;
            break;
          }

          default:
            break;
        }
      } else if (
        userSession?.user?.role === AppRoles.Invitee ||
        userSession?.user?.role === AppRoles.Responder
      ) {
        switch (formInvitation?.status) {
          case FormInvitationStatus.Draft: {
            IsShow = false;
            IsShowComment = false;
            IsEditComment = true;
            break;
          }

          case FormInvitationStatus.Submitted: {
            IsShow = false;
            IsShowComment = true;
            break;
          }

          case FormInvitationStatus.Approved: {
            IsShow = false;
            IsShowComment = true;
            IsEditComment = false;
            break;
          }

          default:
            break;
        }
      }
    }
    variables = warpShowHideCommentList(
      IsShow,
      IsShowComment,
      IsEditComment,
      totalCommentsOnQuestions,
      totalCommentButton,
      isAllowAssignQuestion
    );
    postParentMessage(variables);
  }, [
    commentsAccessFilteredData,
    formInvitation?.status,
    userSession?.user?.role,
    hasFetchedCompanyDetails,
    fetchCompanyDetails,
    totalCommentsOnQuestions,
    totalCommentButton,
    isAllowAssignQuestion,
  ]);

  const handleBulkAccept = useCallback(async () => {
    if (!isReviewer || !formFields) return false;
    const userId = userSession?.user?.id ?? "";

    const questionIds = Array.from(new Set(
      formFields
        .filter((f: any) => f.Question?.id)
        .map((f: any) => f.Question.id)
    )) as string[];

    if (questionIds.length === 0) return false;

    const objects = questionIds.map((qId: string) => {
      const existing = reviewerStatusMap.get(qId);
      return {
        id: existing?.id,
        questionId: qId,
        FormInvitationId: invitationId,
        currentStatus: "Accepted",
        created_by: userId,
        updated_by: userId,
      };
    });

    try {
      const res = await bulkUpsertReviewerMapping({
        variables: { objects },
      });

      if (res.data?.insert_ReviewerDetailsMapping) {
        setReviewerStatusMap((prev) => {
          const next = new Map(prev);
          res.data?.insert_ReviewerDetailsMapping?.returning?.forEach((m: any) => {
            const entry = prev.get(m.questionId);
            next.set(m.questionId, {
              ...(entry || {}),
              id: m.id,
              status: m.currentStatus as any,
            });
          });
          return next;
        });
        await fetchInvitationStatusCounts();

        // Update FormInvitation status to Approved and FormSubmission status to Submitted
        const submissionId = formSubmission?.id;
        if (invitationId) {
          await updateFormStatus({
            variables: {
              invitationId,
              invitationStatus: FormInvitationStatus.Approved,
            },
          });
        }
        if (submissionId) {
          await updateSubmissionStatus({
            variables: {
              submissionId,
              submissionStatus: "Submitted",
            }
          });
        }

        await fetch("/warp/api/calculate-score/form-submission-email", {
          method: "POST",
          body: JSON.stringify({
            formId,
            submissionId,
            invitationId,
            companyId: userSession?.company?.id,
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: userSession?.accessToken ?? "",
          },
        });

        await fetch("/warp/api/reviewer-aaproved-email", {
          method: "POST",
          body: JSON.stringify({
            id: invitationId,
            type: "ApprovedByReviewerEmail",
            companyId: userSession?.company?.id,
            formId: formId,
            platformId: userSession?.platform?.id
          }),
          headers: {
            "Content-Type": "application/json",
            Authorization: userSession?.accessToken ?? "",
          },
        });

        const hasUserAICapabilities = isUserAllowedAIFeature(
          userSession?.accessToken ?? "",
        );

        // Generate and upload assessment report in background using server-side API
        try {
          // Only generate report if both user has AI capabilities AND form has AI enabled
          if (hasUserAICapabilities && hasAnyAICapabilities) {
            const questionaryName = `${formInvitation?.FormInvitation[0]?.Form?.name ||
              "Report"
              }`;

            // Call server-side API for background report generation
            const response = await fetch("/warp/api/AI/generate-background-report", {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: userSession?.accessToken ?? "",
              },
              body: JSON.stringify({
                invitationId: invitationId as string,
                questionaryName,
                companyId: userSession?.company?.id,
              }),
            });

            if (response.ok) {
              const result = await response.json();
              console.log(
                "Background report generation initiated successfully:",
                result,
              );
            } else {
              const error = await response.json();
              console.error(
                "Failed to initiate background report generation:",
                error,
              );
            }
          }
        } catch (error) {
          // Log error but don't let it affect the main submission flow
          console.error(
            "Failed to initiate background report generation:",
            error,
          );
        }



        return true;
      }
      return false;
    } catch (err) {
      console.error("[Reviewer] Bulk accept failed:", err);
      return false;
    }
  }, [isReviewer, formFields, userSession?.user?.id, invitationId, reviewerStatusMap, bulkUpsertReviewerMapping, formSubmission?.id, updateFormStatus, updateSubmissionStatus]);

  // ── Refetch callback (passed to GroupTab via context) ────────────────────────
  const handleRefetchInvitation = useCallback(async () => {
    try {
      setIsRefetching(true);
      // debugger;
      // 1. Refetch invitation/submission + reviewer mappings
      const refetchedData = await fetchInvitationStatusCounts({
        variables: {
          invitationId: invitationId as string,
        },
      });

      // 2. Rebuild reviewerStatusMap from fresh DB data (bypasses the one-shot ref guard)
      const freshMappings =
        refetchedData.data?.FormInvitation?.[0]?.ReviewerDetailsMappings ?? [];
      if (freshMappings.length > 0) {
        setReviewerStatusMap((prev) => {
          // Start from existing map so locally-managed entries are preserved
          const map = new Map<string, ReviewerStatusEntry>(prev);
          freshMappings.forEach((m: any) => {
            // Sort remarks newest-first (DB typically returns ascending)
            // This is critical: GroupTabs nullifies statusEntry when
            // entry.remark === "Answered by Maker", so stale oldest remark
            // would hide status badges on Re-Submitted questions.
            // debugger;
            const sortedRemarks = [...(m.MakerCheckerRemarks ?? [])].sort(
              (a: any, b: any) =>
                new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
            );
            const latestRemark = sortedRemarks[0];
            map.set(m.questionId, {
              id: m.id,
              status: m.currentStatus as "Accepted" | "Declined" | "Re-Submitted",
              remark: latestRemark?.remark,
              remarkTimestamp: latestRemark?.created_at,
              remarks: sortedRemarks.map((r: any) => ({
                remark: r.remark,
                status: r.status as "Accepted" | "Declined" | "Re-Submitted",
                timestamp: r.created_at,
              })),
            });
          });
          return map;
        });
      }

      // 3. Re-fetch form details so the form displays the maker's latest answers
      const mode = query?.mode;
      if (mode === FormMode.ViewRecommendation) {
        const [recResponse, fieldResponse] = await Promise.all([
          fetchRecommendationData({ variables: { invitationId } }),
          fetchFormFieldData({ variables: { invitationId } }),
        ]);
        if (recResponse.data) setformDetails(recResponse.data);
        if (fieldResponse.data) setformFieldsDetails(fieldResponse.data);
      } else {
        const [formResponse, fieldResponse] = await Promise.all([
          fetchData({ variables: { invitationId } }),
          fetchFormFieldData({ variables: { invitationId } }),
        ]);
        if (formResponse.data) setformDetails(formResponse.data);
        if (fieldResponse.data) setformFieldsDetails(fieldResponse.data);
      }
    } catch (err) {
      console.error("[handleRefetchInvitation] Refetch failed:", err);
    } finally {
      setIsRefetching(false);
    }
  }, [
    fetchInvitationStatusCounts,
    invitationId,
    query?.mode,
  ]);

  // if (loading || !formDetails) return <LoadingOverlay visible={true} />;
  if (loading || !formDetails) {
    return <></>;
  }

  if (
    isError &&
    (query?.mode === FormMode.Start || query?.mode === FormMode.Review)
  ) {
    postParentMessage(PageReload());
  }

  const hasAnyAICapabilities =
    !isCarryforward && isFormAIEnabled(userSession?.accessToken, formId);
  // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
  // Check if carry-forward-as-suggestions is enabled for this invitation
  const isCarryForwardAsSuggestionsEnabled =
    formInvitation?.interimCheck?.isCarryForwardAsSuggestionsInvitation;

  // Show suggestions for AI users OR when carry-forward-as-suggestions is enabled
  const shouldShowSuggestions =
    hasAnyAICapabilities || isCarryForwardAsSuggestionsEnabled;

  return (
    <Stack className="assessmentDetails-Ques-Ans">
      {/* ── Decline Reason Modal ─────────────────────────────────────────────── */}
      <Modal
        opened={declineModalOpen}
        onClose={() => setDeclineModalOpen(false)}
        title={<Text fw={600} size="lg">Reason for Decline</Text>}
        centered
        size="md"
      >
        <Stack gap="md">
          <Textarea
            label="Please mention the reason for declining this response."
            required
            minRows={4}
            value={declineRemark}
            onChange={(e) => {
              setDeclineRemark(e.currentTarget.value);
              if (e.currentTarget.value.trim()) setDeclineRemarkError("");
            }}
            error={declineRemarkError}
            placeholder="Enter your reason here..."
          />
          <Flex gap="sm" justify="flex-end">
            <Button
              variant="outline"
              onClick={() => setDeclineModalOpen(false)}
              disabled={declineSaving}
            >
              Cancel
            </Button>
            <Button
              color="red"
              loading={declineSaving}
              onClick={() => {
                if (declineQuestionId) {
                  handleDeclineSubmit(declineQuestionId, declineRemark);
                }
              }}
            >
              Submit
            </Button>
          </Flex>
        </Stack>
      </Modal>

      {isError === true ? (
        <Flex
          direction="column"
          align="center"
          justify="center"
          style={{ height: "95vh" }}
        >
          <Stack
            gap="md"
            align="center"
            p={40}
            style={{
              marginTop: "-2em",
              background: "#FFE1D3",
              borderRadius: 10,
              boxShadow:
                "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            }}
          >
            <IconAlertCircle size="4.5rem" color="#AC0B0B" />
            <Title order={4} fw={600} c="#AC0B0B">
              Session Expired
            </Title>

            <Text size="md" mb="md">
              Your session has expired. Please log in again to continue.
            </Text>
          </Stack>
        </Flex>
      ) : (
        <WarpForm
          formFields={formFields as any}
          answers={answers}
          formId={formId}
          formInvitationId={String(invitationId)}
          formSubmissionId={formSubmission?.id}
          isFormSubmitted={isFormSubmitted}
          isCarryForward={isCarryforward}
          ratingValidation={ratingValidation}
          Suggestions={shouldShowSuggestions ? formFieldSuggestion : []}
          isAIDataPointsAdded={isAIDataPointsAdded}
          isReviewer={isReviewer}
          reviewerStatusMap={reviewerStatusMap}
          onReviewerAccept={handleAccept}
          onReviewerDecline={handleDeclineSubmit}
          onReviewerJustify={handleJustifySubmit}
          onReviewerBulkAccept={handleBulkAccept}
          onRefetchInvitation={handleRefetchInvitation}
          isRefetching={isRefetching}
          isMaker={isMaker}
        />
      )}
    </Stack>
  );
};
export default memo(
  WarpFormScreen,
  (prev, next) => prev.invitationId === next.invitationId
);
