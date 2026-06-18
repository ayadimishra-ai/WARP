import {
  Box,
  Button,
  Flex,
  Grid,
  MultiSelect,
  Text,
  TextInput,
} from "@mantine/core";
import { isAnswered, isUserAllowedAIFeature, setAnswersData } from "@/modules/warp/packages/client/features/form/common-functions";
import { useGroupWizardStore } from "@/modules/warp/packages/client/features/form/group-wizard.store";
import { useReviewerContext } from "@/modules/warp/packages/client/features/form/reviewer-context";
import { getAnswersByQuestionId, getFormFieldStoreState, selectFieldOptions, showErrorMessage, useFormFieldStore } from "@/modules/warp/packages/client/features/form/store";
import { encryptionDecryption } from "@/modules/warp/packages/client/hooks/encryption-decryption";
import { useUserSession } from "@/modules/warp/packages/client/hooks/use-user-session";
import { useWarpContentSize } from "@/modules/warp/packages/client/hooks/use-warp-content-size";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import { invitationFormSubmitMessage, invitationFormValidationFailedMessage, sendInvitationLoadingStartedMessage, sendInvitationValidationFailedMessage, warpAssignReviewer } from "@/modules/warp/packages/client/services/platform-window-message.service";
import {
  ParentCompanyMapping_Insert_Input,
  User_Insert_Input,
} from "@/modules/warp/packages/graphql/generated/types";
import { useBulkInsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-answer";
import { useBulkInsertInterimAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-intrim-answer";
import { useBulkUpdateInterimRecommendationByInterimAnswerIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-interim-recommendation";
import { useBulkUpdateSuggestionsMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-update-suggestions";
import { useCreateParentCompanyMappingMutation } from "@/modules/warp/packages/graphql/mutations/generated/create-ParentCompanyMapping";
import { useCreateUserMutation } from "@/modules/warp/packages/graphql/mutations/generated/create-user";
import { useUpdateAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-answer";
import { useUpdateAssesseeUserMappingbyInvitationIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-assessee-user-mapping-by-invitationid";
import { useUpdateAssesseeUserMappingForResponderMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-assessee-user-mapping-for-responder";
import { useUpdateAssesseeUserMappingResponderStatusByResponderMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-assesseeusermapping-responderstatus-byresponder";
import { useUpdateFormInvitationMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-form-invitation";
import { useUpdateFormInvitationStatusMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-form-invitation-status";
import { useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-interim-answer-by-question-id-and-submission-id";
import { useUpsertAnswerMutation } from "@/modules/warp/packages/graphql/mutations/generated/upsert-answer";
import { useUpsertFormInvitationCompletionMutation } from "@/modules/warp/packages/graphql/mutations/generated/upsert-form-invitation-completion-by-invitation-id";
import { useGetAnswerByQuestionIdAndSubmissionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answer-by-questionid-and-submissionid";
import { useGetAnswersByIdsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-answers-by-ids";
import { useGetassesseeuserbyinvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-assesseeuser-by-invitationid";
import { useGetFormFieldsByQuestionIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-fields-by-question-id";
import { useGetInvitationAndSubmissionDetailsByInvitationIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-invitation-and-submission-details-by-invitation-id";
import { useGetParentCompanyMappingDetailsByCompanyIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-parent-company-mapping-details-by-company-id";
import { useRaraCompanyAccessQuery } from "@/modules/warp/packages/graphql/queries/generated/get-rara-features-access-companyid";
import { useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-recomendation-by-submissionId-and-formfieldId";
import { useGetUserDetailByEmailLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-email";
import { useGetUserDetailByParentCompanyIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-parentcompany-id";
import { AppRoles, FormInvitationStatus, QuestionStatus } from "@/modules/warp/packages/shared/constants/app.constants";
import { getLocalStorageData, setLocalStorageData } from "@/modules/warp/packages/shared/utils/auth-session.util";
import { isFormAIEnabled } from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import { useRouter } from "next/router";
import { useCallback, useEffect, useMemo, useState } from "react";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

type ReviewerDetails = {
  id: string;
  name: string;
  email: string;
  isNewReviewer: boolean;
} | null;

const AssignReviewerPopup = () => {
  useWarpContentSize();
  const { query } = useRouter();
  const userSession = useUserSession();

  const [userName, setUserName] = useState("");
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [filterReviewerNameList, setFilterReviewerNameList] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [tempNewReviewer, setTempNewReviewer] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [isNewReviewerAdded, setIsNewReviewerAdded] = useState(false);
  const [reviewerSearchValue, setReviewerSearchValue] = useState("");

  const { choosemethodForMultiple } = encryptionDecryption();
  const insertUser = useCreateUserMutation()[0];
  const updateFormInvitation = useUpdateFormInvitationMutation()[0];
  const updateFormInvitationStatusMutation =
    useUpdateFormInvitationStatusMutation()[0];
  const insertParentCompanyMapping = useCreateParentCompanyMappingMutation()[0];
  const getExistingEmails = useGetUserDetailByEmailLazyQuery()[0];
  const getParentCompanyMappingDetails =
    useGetParentCompanyMappingDetailsByCompanyIdLazyQuery()[0];
  const getUserList = useGetUserDetailByParentCompanyIdLazyQuery()[0];
  const getAnswerByQuestionResult =
      useGetAnswerByQuestionIdAndSubmissionIdLazyQuery()[0];
  const upsertFormInvitationCompletion =
    useUpsertFormInvitationCompletionMutation()[0];
  const getFormFieldsDetail = useGetFormFieldsByQuestionIdLazyQuery()[0];
  const getFormfieldRecommendation =
    useGetRecomendationBySubmissionIdAndFormfieldIdLazyQuery()[0];
  const upsertAnswer = useUpsertAnswerMutation()[0];
  const updateAnswer = useUpdateAnswerMutation()[0];
  const updateInterimAnswer =
    useUpdateInterimAnswerByQuestionIdAndSubmissionIdMutation()[0];
  const insertInterimAnsweronUpdate = useBulkInsertInterimAnswerMutation()[0];
  const insertBulkAnswer = useBulkInsertAnswerMutation()[0];
  const updateRecommendation =
    useBulkUpdateInterimRecommendationByInterimAnswerIdMutation()[0];
  const updateSuggestionData = useBulkUpdateSuggestionsMutation()[0];
  const chkStore = useFormFieldStore((store) => store);
  const nextHandler = useGroupWizardStore((store) => store.nextHandler);
  const prevHandler = useGroupWizardStore((store) => store.prevHandler);
  const changeColorHandler = useGroupWizardStore(
    (store) => store.changeColorHandler,
  );
  const getAnswersByIds = useGetAnswersByIdsLazyQuery()[0];
  const currentWizard = useGroupWizardStore((store) => store.current);
  const questions = useGroupWizardStore((store) => store.questions);
    const [loading, setLoading] = useState(false);
  const invitationId = String(query?.invitationId || "");
  const formId = String(query?.formId || "");
  const questionId= String(query?.questionId || "");
  const submissionId= String(query?.SubmissionId || "");
  // Load user list

  console.log("= query", query);
  const [activeTab, setActiveTab] = useState(questionId);
  
  // Get form fields and prepare steps
  const storeFormFields = useFormFieldStore((store) => store.formFields);
  
  // Track current section
  const [currentSec, setCurrentSec] = useState<string | null>();
  
  // Get required questions from form fields
  const requiredQuestions = useMemo(() => {
    return storeFormFields
      .filter((field: any) => field.Question?.isRequired)
      .map((field: any) => field.Question)
      .filter(Boolean);
  }, [storeFormFields]);
  const { 
    isReviewer,
  } = useReviewerContext();
  
  const updateAssesseeUserMappingMutation =
      useUpdateAssesseeUserMappingbyInvitationIdMutation()[0];
  const updateAssesseeUserMappingResponderStatusMutation =
      useUpdateAssesseeUserMappingResponderStatusByResponderMutation()[0];

  const updateAssesseeUserMappingForResponderMutation =
      useUpdateAssesseeUserMappingForResponderMutation()[0];

  const { data: invitationAndSubmissionQueryResult } =
      useGetInvitationAndSubmissionDetailsByInvitationIdQuery({
        variables: {
          invitationId,
          includeAllSections: false,
        },
      });
  const { data: AssesseeUserMappingQueryResult } =
      useGetassesseeuserbyinvitationIdQuery({
        variables: {
          invitationId,
        },
      });
  const AssesseeUserMappingResult: any = useMemo(() => {
    if (!AssesseeUserMappingQueryResult?.AssesseeUserMapping[0]) return null;
    return AssesseeUserMappingQueryResult?.AssesseeUserMapping;
  }, [AssesseeUserMappingQueryResult]);
    
  const formType = String(
        invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
          "",
      );
  console.log("= formType:", formType);
  let isAlreadyAssigned: any =
    AssesseeUserMappingResult?.filter((x: any) => x.questionId === activeTab)
      .length > 0
      ? true
      : false;

  const raraCompanyId: any = userSession?.GlobalMaster?.filter(
      (x: any) => x.type === "RaraIntegrationAccess",
    );
  const { data: raraCompanies } = useRaraCompanyAccessQuery({
    variables: {
      companyIdList: raraCompanyId?.[0]?.data?.[0]?.companyId,
      companyId: userSession?.company?.id,
    },
  });
  const hasUserAICapabilities = isUserAllowedAIFeature(
      userSession?.accessToken ?? "",
    );
  
  const hasAnyAICapabilities = isFormAIEnabled(
      userSession?.accessToken,
      useFormFieldStore?.getState()?.formId ?? undefined,
    );

  const assesseeUserLength =
    AssesseeUserMappingQueryResult?.AssesseeUserMapping.filter(
      (user: any) =>
        user.userId === userSession?.user?.id && user.questionId === questionId,
    ) || [];

  useEffect(() => {
    const fetchData = async () => {
      const newuserList: any = await getUserList({
        variables: {
          companyId: userSession?.company?.id,
          userId: userSession?.user?.id,
        },
        fetchPolicy: "no-cache",
      });
      let newData: any[] = [];

      // ✅ Add ParentCompanyMapping users
      if (newuserList?.data?.ParentCompanyMapping) {
        newData = [
          ...newData,
          ...newuserList.data.ParentCompanyMapping.flatMap((item: any) => {
            const result: any[] = [];
            if (item?.User) {
              // Filter out users with 'Responder' role
              const hasResponderRole = item.User.UserRoles?.some(
                (userRole: any) => userRole.roleName === AppRoles.Responder
              );
              
              if (!hasResponderRole) {
                result.push({
                  id: item.User.id,
                  email: choosemethodForMultiple(
                    item.User.email,
                    "decryptForMultiple",
                  ),
                  name: item.User.name,
                  addressId: item.AddressId,
                });
              }
            }
            return result;
          }),
        ];
      }

      // ✅ Add direct Users filtered by company ID
      if (newuserList?.data?.User) {
        newData = [
          ...newData,
          ...newuserList.data.User.filter(
            (item: any) => item.companyId === userSession?.company?.id,
          ).flatMap((item: any) => {
            const result: any[] = [];
            if (item) {
              // Filter out users with 'Responder' role
              const hasResponderRole = item.UserRoles?.some(
                (userRole: any) => userRole.roleName === AppRoles.Responder
              );
              
              if (!hasResponderRole) {
                result.push({
                  id: item.id,
                  email: choosemethodForMultiple(
                    item.email,
                    "decryptForMultiple",
                  ),
                  name: item.name,
                  addressId: item.AddressId,
                  companyId: item.companyId,
                });
              }
            }
            return result;
          }),
        ];
      }

      // Filter and store users with both name and email, excluding current user
      const filteredNames = newData
        .filter(
          (item: any) =>
            item.name && item.email && item.id !== userSession?.user?.id,
        )
        .map((item: any) => ({
          id: item.id,
          name: item.name,
          email: item.email,
        }))
        .filter(
          (value: any, index: any, self: any) =>
            index ===
            self.findIndex(
              (t: any) => t.email === value.email && t.name === value.name,
            ),
        );
      setFilterReviewerNameList(filteredNames);
    };
    fetchData();
  }, [userSession?.company?.id, userSession?.user?.id]);

  const handleAssign = async (type: string) => {
    try {
      setIsLoading(true);
      setErrorMessage("");
      // Validation
      if (!userName.trim() || !email.trim()) {
        setErrorMessage("Please fill in both name and email fields.");
        setIsLoading(false);
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email.trim())) {
        setErrorMessage("Please enter a valid email address.");
        setIsLoading(false);
        return;
      }

      const encryptedEmail = choosemethodForMultiple(
        email.trim().toLowerCase(),
        "encryptformultiple",
      ) as string;

      // Check if reviewer already exists
      let existingReviewers: any[] = [];
      let allReviewerUsers: any[] = [];
      const existingReviewerResult = await getExistingEmails({
        variables: {
          newEmail: [encryptedEmail],
        },
      });

      const existingUser= existingReviewerResult?.data?.User?.filter(
        (user: any) => user.email === encryptedEmail,
      );

      // If creating a new reviewer and user already exists, show validation
      if (existingUser && existingUser?.length > 0 && isNewReviewerAdded) {
        setErrorMessage("User email id already exist.");
        setIsLoading(false);
        return;
      }

      if (
        existingReviewerResult.data &&
        existingReviewerResult.data.User.length > 0
      ) {
        // Filter reviewers that belong to the same company
        existingReviewers = existingReviewerResult.data.User.filter(
          (user: any) => user.companyId === userSession?.company?.id,
        );

        allReviewerUsers = [...existingReviewers];
      }

      // Check if this reviewer already exists
      const reviewerExists = existingReviewers.some(
        (existingUser: any) => existingUser.email === encryptedEmail,
      );
      let reviewerUser: any = null;
      let reviewerParentCompanyId: string | null = null;

      if (!reviewerExists) {
        // Insert new reviewer
        const newReviewersToInsert: User_Insert_Input[] = [];

        newReviewersToInsert.push({
          name: userName.trim(),
          email: encryptedEmail,
          phone: "",
          companyId: userSession?.company?.id,
          created_by: userSession?.user?.id,
          updated_by: userSession?.user?.id,
          UserRoles: {
            data: {
              roleName: AppRoles.Invitee,
            },
          },
        } as unknown as User_Insert_Input);

        const resultReviewer = await insertUser({
          variables: {
            input: newReviewersToInsert,
          },
        });

        if (
          resultReviewer?.data?.insert_User?.returning &&
          resultReviewer.data.insert_User.returning.length > 0
        ) {
          reviewerUser = resultReviewer.data.insert_User.returning[0];
          allReviewerUsers.push(reviewerUser);

          // Create ParentCompanyMapping for new reviewer
          const reviewerMapping: ParentCompanyMapping_Insert_Input = {
            CompanyId: userSession?.company?.id,
            ParentCompanyId: userSession?.company?.id,
            UserId: reviewerUser.id,
            ParentUserId: userSession?.user?.id,
            AddressId: null,
          };

          const resultParentCompany = await insertParentCompanyMapping({
            variables: {
              input: [reviewerMapping],
            },
          });

          // Get the ParentCompanyMapping Id from the insert result
          if (
            resultParentCompany?.data?.insert_ParentCompanyMapping?.returning &&
            resultParentCompany.data.insert_ParentCompanyMapping.returning
              .length > 0
          ) {
            reviewerParentCompanyId =
              resultParentCompany.data.insert_ParentCompanyMapping.returning[0]
                .Id;
          }
        }
      } else {
        // Use existing reviewer
        reviewerUser = existingReviewers[0];

        // Create ParentCompanyMapping for new reviewer
        const reviewerMapping: ParentCompanyMapping_Insert_Input = {
          CompanyId: userSession?.company?.id,
          ParentCompanyId: userSession?.company?.id,
          UserId: reviewerUser.id,
          ParentUserId: userSession?.user?.id,
          AddressId: null,
        };
        const resultParentCompany = await insertParentCompanyMapping({
          variables: {
            input: [reviewerMapping],
          },
        });
        // Get the ParentCompanyMapping Id from the insert result
        if (
          resultParentCompany?.data?.insert_ParentCompanyMapping?.returning &&
          resultParentCompany.data.insert_ParentCompanyMapping.returning
            .length > 0
        ) {
          reviewerParentCompanyId =
            resultParentCompany.data.insert_ParentCompanyMapping.returning[0]
              .Id;
        }
      }

      if (!reviewerUser) {
        setErrorMessage("Failed to create or find reviewer user.");
        setIsLoading(false);
        return;
      }

      // Build ReviewerDetails
      const isNewReviewer = !reviewerExists;
      const reviewerDetails: ReviewerDetails = {
        id: reviewerUser.id,
        name: userName.trim(),
        email: encryptedEmail,
        isNewReviewer: isNewReviewer,
      };

      // Update FormInvitation with reviewer details
      await updateFormInvitation({
        variables: {
          invitationId: invitationId,
          set: {
            reviewerDetails: reviewerDetails as any,
            reviewerParentCompanyId: reviewerParentCompanyId,
          },
        },
      });

      console.log("Assign reviewer successful:", {
        userName,
        email,
        reviewerDetails,
      });

      // Send email to reviewer if needed
      if (reviewerDetails && reviewerDetails.email) {
        try {
          const emailType = reviewerDetails.isNewReviewer
            ? "ReviewerReportingFormInvitation"
            : "ExistingReviewerReportingFormInvitation";

          await fetch("/warp/api/Reviewer-email-invitation", {
            method: "POST",
            headers: {
              "content-type": "application/json",
            },
            body: JSON.stringify({
              id: invitationId,
              type: emailType,
              companyId: userSession?.company?.id,
              formId: formId,
              NewUser: reviewerDetails.isNewReviewer,
              platformId: userSession?.platform?.id,
            }),
          });
        } catch (error) {
          console.error("Failed to send reviewer email:", error);
          // Continue without throwing - email is optional
        }
      }

      await handleSubmitWithoutAssign(activeTab, setLoading, loading, type);
      setIsLoading(false);
      postParentMessage(warpAssignReviewer(false));
    } catch (error) {
      console.error("Error assigning reviewer:", error);
      setErrorMessage("An error occurred while assigning the reviewer.");
      setIsLoading(false);
    }
  };

  const checkQuestionAnswers = (onSubmit: boolean) => {
    // Process all form fields to check if questions are answered
    const processFormFields = (fields: any[]) => {
      fields.forEach((formFieldData: any) => {
        if (formFieldData?.Question) {
          let tabColor = isAnswered(formFieldData, false, chkStore);
          changeColorHandler(tabColor, formFieldData?.Question?.id);
        }
        // Recursively process children
        if (formFieldData?.children) {
          processFormFields(formFieldData.children);
        }
      });
    };

    if (onSubmit) {
      // Check all form fields
      processFormFields(storeFormFields);
    } else {
      // Check only form fields in current section
      const currentSectionFields = storeFormFields.filter(
        (field: any) => field?.Section?.field === currentSec
      );
      processFormFields(currentSectionFields);
    }
  };

  // const getProgressBarPercentageForListing = () => {
  //   // Process all form fields to update question colors
  //   const processFormFields = (fields: any[]) => {
  //     fields.forEach((formFieldData: any) => {
  //       if (formFieldData?.Question) {
  //         let tabColor = isAnswered(formFieldData, false, chkStore);
  //         changeColorHandler(tabColor, formFieldData?.Question?.id);
  //       }
  //       // Recursively process children
  //       if (formFieldData?.children) {
  //         processFormFields(formFieldData.children);
  //       }
  //     });
  //   };

  //   processFormFields(storeFormFields);

  //   let allquestiondata = useGroupWizardStore
  //     .getState()
  //     .questions.filter((item) =>
  //       requiredQuestions.some((record) => record.id === item.questionId),
  //     );

  //   return (
  //     (allquestiondata.filter((item: any) => item.color === true).length /
  //       allquestiondata.length) *
  //     100
  //   ).toFixed(0);
  // };

  const getProgressBarPercentageForListing = useCallback(() => {
    // Read pre-calculated colors from store instead of recalculating
    const allQuestions = useGroupWizardStore.getState().questions;

    const relevantQuestions = allQuestions.filter((item) =>
      requiredQuestions.some((record) => record.id === item.questionId),
    );

    if (!relevantQuestions.length) return "0";

    const answeredCount = relevantQuestions.filter((item: any) => item.color === true).length;
    const percentage = (answeredCount / relevantQuestions.length) * 100;


    return percentage.toFixed(0);
  }, [requiredQuestions]);

  const submitConfirmed = async (type: string) => {
      setLoading(true); 
      const isResponderUsercheck: any | null = getLocalStorageData(
        window.localStorage,
        "isResponderUser",
      );
  
      if (isResponderUsercheck === "true") {
        if (isAlreadyAssigned) {
          const answers = getAnswersByQuestionId(questionId);
          if (
            answers.filter((x: any) => x.value === "" || x.value === undefined)
              .length === answers.length
          ) {
            const resultFormInvitation: any =
              await updateAssesseeUserMappingMutation({
                variables: {
                  invitationId: invitationId,
                  invitationStatus: QuestionStatus.Pending,
                  userId: userSession?.user?.id,
                  questionId: activeTab,
                  updatedAt: new Date(),
                },
              });
            await updateAssesseeUserMappingResponderStatusMutation({
              variables: {
                invitationId: invitationId,
                userId: userSession?.user?.id,
                updatedAt: new Date(),
                ResponderStatus: QuestionStatus.Responded,
              },
            });
          } else {
            const resultFormInvitation: any =
              await updateAssesseeUserMappingMutation({
                variables: {
                  invitationId: invitationId,
                  invitationStatus: QuestionStatus.Responded,
                  userId: userSession?.user?.id,
                  questionId: activeTab,
                  updatedAt: new Date(),
                },
              });
            await updateAssesseeUserMappingResponderStatusMutation({
              variables: {
                invitationId: invitationId,
                userId: userSession?.user?.id,
                updatedAt: new Date(),
                ResponderStatus: QuestionStatus.Responded,
              },
            });
          }
        }
        const formType = String(
          invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
            "",
        );
        postParentMessage(sendInvitationValidationFailedMessage());
        postParentMessage(invitationFormSubmitMessage(formType));
      } else {
        try {

          if(type === "SKIP & SUBMIT"){
            const result = await fetch("/warp/api/submit-form", {
            method: "POST",
            body: JSON.stringify({
              submissionId,
            }),
            headers: {
              "Content-Type": "application/json",
              Authorization: userSession?.accessToken ?? "",
            },
          }).then((res) => res.json());

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

          // Generate and upload assessment report in background using server-side API
        try {
          // Only generate report if both user has AI capabilities AND form has AI enabled
          if (hasUserAICapabilities && hasAnyAICapabilities) {
            const questionaryName = `${
              invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.name ||
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

          
      }else if(type === "ASSIGN & SUBMIT"){
        await updateFormInvitationStatusMutation({
          variables: {
            invitationId: invitationId,
            invitationStatus: FormInvitationStatus.UnderReview,
          },
        });

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

        await fetch("/warp/api/calculate-score/reviewer-form-submission-email", {
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
      }
          
          
          // await fetch("/warp/api/calculate-score/reviewer-form-submission-email", {
          //   method: "POST",
          //   body: JSON.stringify({
          //     formId,
          //     submissionId,
          //     invitationId,
          //     companyId: userSession?.company?.id,
          //   }),
          //   headers: {
          //     "Content-Type": "application/json",
          //     Authorization: userSession?.accessToken ?? "",
          //   },
          // });
        } catch (error) {
          console.error("Error submitting form:", error);
          // Continue to send messages even if API fails
        }
        setLoading(false);
  
        let companyId: any = raraCompanies?.ParentCompanyMapping?.filter(
          (rec: any) => rec.CompanyId === userSession?.company?.id,
        )[0]?.CompanyId;
        // Generate and upload assessment report in background using server-side API
        try {
          // Only generate report if both user has AI capabilities AND form has AI enabled
          if (hasUserAICapabilities && hasAnyAICapabilities) {
            const questionaryName = `${
              invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.name ||
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
        const formType = String(
          invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
            "",
        );
        postParentMessage(sendInvitationValidationFailedMessage());
        postParentMessage(invitationFormSubmitMessage(formType));
        // router.push("/invitation/list");
      }
    };

  const handleSubmitWithoutAssign = async (
    activeTab: any,
    //upsertAnswer: any,
    setLoading: any,
    loading: any,
    type: string,
  ) => {
    postParentMessage(sendInvitationLoadingStartedMessage());
    const formData = useFormFieldStore.getState();
    let Isvalidate = true;

    const upsertQuestionAnswer = async (formFieldId: string) => {
      if (loading) return false;
      setLoading(false);

      const _formField = getFormFieldStoreState().formFields.find(
        (m: any) => m.Question?.id === formFieldId,
      );
      const questionId = _formField?.Question?.id;
      // Use submissionId from component scope (query params) instead of store
      // Store is not initialized in this popup context

      if (!submissionId) {
        //alert("Invalid submission id");
        setLoading(false);
        return;
      }

      if (!questionId) {
        //alert("Invalid question id");
        setLoading(false);
        return;
      }

      const answers = getAnswersByQuestionId(questionId);
      //console.log({ answers });

      // No answer found
      if (!answers?.length) {
        setLoading(false);
        return;
      }
      const { data, error } = await getAnswerByQuestionResult({
        variables: {
          questionId: questionId,
          submissionId: submissionId,
        },
      });
      Isvalidate =
        useGroupWizardStore
          .getState()
          .questions.filter((item: any) => item.color === false).length > 0
          ? false
          : true;

      if (isAlreadyAssigned) {
        let latestDataArray: any = [];
        let _chkIsAnswered = false;
        let answerDataArray: any = [];
        answers?.map((item: any) => {
          if (
            ((item.value !== undefined && item.value !== "") ||
              item?.value?.length > 0) &&
            Isvalidate
          ) {
            _chkIsAnswered = true;
          }
          let latestValue = data?.Answer?.filter(
            (x: any) =>
              x.questionId === item.questionId &&
              x.formFieldId === item.formFieldId,
          )[0]?.data;
          if (
            (item.value === "" ||
              item?.value?.length === 0 ||
              item?.value === undefined) &&
            latestValue?.value !== ""
          ) {
            latestDataArray.push({
              submissionId: item.submissionId,
              questionId: item.questionId,
              formFieldId: item.formFieldId,
              value: latestValue?.value,
            });
            answerDataArray.push({
              submissionId: item.submissionId,
              questionId: item.questionId,
              formFieldId: item.formFieldId,
              oldValue: latestValue?.value,
              newValue: item.value,
            });
          } else {
            latestDataArray.push({
              submissionId: item.submissionId,
              questionId: item.questionId,
              formFieldId: item.formFieldId,
              value: item?.value,
            });
            answerDataArray.push({
              submissionId: item.submissionId,
              questionId: item.questionId,
              formFieldId: item.formFieldId,
              oldValue: latestValue?.value,
              newValue: item.value,
            });
          }
        });
        await setAnswersData(
          data,
          submissionId,
          answers,
          latestDataArray,
          questionId,
          userSession?.user?.id,
          useFormFieldStore?.getState()?.answer,
          String(chkStore?.formId),
          invitationId,
          "GroupTab",
          "",
          "",
          getFormFieldsDetail,
          getFormfieldRecommendation,
          upsertAnswer,
          updateAnswer,
          updateInterimAnswer,
          insertInterimAnsweronUpdate,
          getAnswersByIds,
          insertBulkAnswer,
          updateRecommendation,
          updateSuggestionData,
          useFormFieldStore?.getState()?.Suggestions,
        );
        if (userSession?.user?.role !== AppRoles.Responder) {

          await upsertFormInvitationCompletion({
            variables: {
              completion: getProgressBarPercentageForListing(),
              invitationId: invitationId,
            },
          });
        }
        if (_chkIsAnswered) {
          if (
            userSession?.user?.role === AppRoles.Responder &&
            assesseeUserLength.length > 0
          ) {
            const resultFormInvitation: any =
              await updateAssesseeUserMappingForResponderMutation({
                variables: {
                  invitationId: invitationId,
                  invitationStatus: QuestionStatus.Responded,
                  userId: userSession?.user?.id,
                  questionId: questionId,
                  isResponder: true,
                  updatedAt: new Date(),
                  responderStatus: "",
                },
              });
            await updateAssesseeUserMappingResponderStatusMutation({
              variables: {
                invitationId: invitationId,
                userId: userSession?.user?.id,
                updatedAt: new Date(),
                ResponderStatus: QuestionStatus.Responded,
              },
            });
          } else if (
            userSession?.user?.role === "Invitee" &&
            assesseeUserLength.length > 0
          ) {
            const resultFormInvitation: any =
              await updateAssesseeUserMappingForResponderMutation({
                variables: {
                  invitationId: invitationId,
                  invitationStatus: QuestionStatus.Responded,
                  userId: userSession?.user?.id,
                  questionId: questionId,
                  isResponder: true,
                  updatedAt: new Date(),
                  responderStatus: "",
                },
              });
          } else {
            const resultFormInvitation: any =
              await updateAssesseeUserMappingMutation({
                variables: {
                  invitationId: invitationId,
                  invitationStatus: QuestionStatus.Responded,
                  userId: userSession?.user?.id,
                  questionId: questionId,
                  updatedAt: new Date(),
                },
              });
          }
        } else {
          answerDataArray?.map(async (itemAnswer: any) => {
            if (itemAnswer.oldValue !== "" && itemAnswer.newValue === "") {
              if (
                userSession?.user?.role === AppRoles.Responder &&
                assesseeUserLength.length > 0
              ) {
                const resultFormInvitation: any =
                  await updateAssesseeUserMappingForResponderMutation({
                    variables: {
                      invitationId: invitationId,
                      invitationStatus: QuestionStatus.Pending,
                      userId: userSession?.user?.id,
                      questionId: questionId,
                      isResponder: true,
                      updatedAt: new Date(),
                      responderStatus: "",
                    },
                  });
                await updateAssesseeUserMappingResponderStatusMutation({
                  variables: {
                    invitationId: invitationId,
                    userId: userSession?.user?.id,
                    updatedAt: new Date(),
                    ResponderStatus: QuestionStatus.Responded,
                  },
                });
              } else if (
                userSession?.user?.role === "Invitee" &&
                assesseeUserLength.length > 0
              ) {
                const resultFormInvitation: any =
                  await updateAssesseeUserMappingForResponderMutation({
                    variables: {
                      invitationId: invitationId,
                      invitationStatus: QuestionStatus.Pending,
                      userId: userSession?.user?.id,
                      questionId: questionId,
                      isResponder: true,
                      updatedAt: new Date(),
                      responderStatus: "",
                    },
                  });
              } else {
                const resultFormInvitation: any =
                  await updateAssesseeUserMappingMutation({
                    variables: {
                      invitationId: invitationId,
                      invitationStatus: QuestionStatus.Pending,
                      userId: userSession?.user?.id,
                      questionId: questionId,
                      updatedAt: new Date(),
                    },
                  });
              }
            } else if (
              (itemAnswer.oldValue === "" && itemAnswer.newValue === "") ||
              (itemAnswer.oldValue === undefined &&
                itemAnswer.newValue === undefined)
            ) {
              if (
                userSession?.user?.role === AppRoles.Responder &&
                assesseeUserLength.length > 0
              ) {
                const resultFormInvitation: any =
                  await updateAssesseeUserMappingForResponderMutation({
                    variables: {
                      invitationId: invitationId,
                      invitationStatus: QuestionStatus.Pending,
                      userId: userSession?.user?.id,
                      questionId: questionId,
                      isResponder: true,
                      updatedAt: new Date(),
                      responderStatus: "",
                    },
                  });
                await updateAssesseeUserMappingResponderStatusMutation({
                  variables: {
                    invitationId: invitationId,
                    userId: userSession?.user?.id,
                    updatedAt: new Date(),
                    ResponderStatus: QuestionStatus.Responded,
                  },
                });
              } else if (
                userSession?.user?.role === "Invitee" &&
                assesseeUserLength.length > 0
              ) {
                const resultFormInvitation: any =
                  await updateAssesseeUserMappingForResponderMutation({
                    variables: {
                      invitationId: invitationId,
                      invitationStatus: QuestionStatus.Pending,
                      userId: userSession?.user?.id,
                      questionId: questionId,
                      isResponder: true,
                      updatedAt: new Date(),
                      responderStatus: "",
                    },
                  });
              } else {
                const resultFormInvitation: any =
                  await updateAssesseeUserMappingMutation({
                    variables: {
                      invitationId: invitationId,
                      invitationStatus: QuestionStatus.Pending,
                      userId: userSession?.user?.id,
                      questionId: questionId,
                      updatedAt: new Date(),
                    },
                  });
              }
            }
          });
        }
      } else {
        await setAnswersData(
          data,
          submissionId,
          answers,
          answers,
          questionId,
          userSession?.user?.id,
          useFormFieldStore?.getState()?.answer,
          String(chkStore?.formId),
          invitationId,
          "GroupTab",
          "",
          "",
          getFormFieldsDetail,
          getFormfieldRecommendation,
          upsertAnswer,
          updateAnswer,
          updateInterimAnswer,
          insertInterimAnsweronUpdate,
          getAnswersByIds,
          insertBulkAnswer,
          updateRecommendation,
          updateSuggestionData,
          useFormFieldStore?.getState()?.Suggestions,
          query?.mode,
        );
        await upsertFormInvitationCompletion({
          variables: {
            completion: getProgressBarPercentageForListing(),
            invitationId: invitationId,
          },
        });
      }
      // console.log({ result });
      setLoading(false);
      return true;
    };

    formData.formFields.map(async (item: any) => {
      const UpdateFiledOption = selectFieldOptions(formData, item.id);
    });

    await upsertQuestionAnswer(activeTab);

    checkQuestionAnswers(true);

    Isvalidate =
      useGroupWizardStore
        .getState()
        .questions.filter((item: any) => item.color === false).length > 0
        ? false
        : true;
    console.log({
      Isvalidate: Isvalidate,
      activeTab: activeTab,
      formData: formData,
      questions: useGroupWizardStore.getState().questions,
    });
    const formType = String(
      invitationAndSubmissionQueryResult?.FormInvitation[0]?.Form?.formtype ||
        "",
    );

    if (Isvalidate === true) {
      // Directly submit without confirmation (SKIP & SUBMIT)
      await submitConfirmed(type);
    } else {
      showErrorMessage();
      postParentMessage(sendInvitationValidationFailedMessage());
      postParentMessage(
        invitationFormValidationFailedMessage(
          "Some of the fields are incomplete or contain errors. Please review and try again.",
        ),
      );
      if (
        currentWizard?.question === questions[questions?.length - 1]?.questionId // checking for last question.
      ) {
        prevHandler();
      } else {
        nextHandler();
      }
      const moveToNonMandatory: any =
        questions.filter((item: any) => item.color === false).length > 0
          ? questions.filter((item: any) => item.color === false)[0]
          : "";
      if (!!moveToNonMandatory) {
        setLocalStorageData(
          window.localStorage,
          "IsPageRefreshed",
          moveToNonMandatory?.questionId,
        );
      }
    }
  };

  return (
    <Box h={"100%"} className="assign-reviewer-popup" py={10} px={0}>
      <Spinner visible={isLoading} />
      <>
        {/* <Title size={18} mb={10} weight={600} color="#162F4B">
          Assign Reviewer
        </Title> */}

        <Text fz={14} c="#444444" mb={8} lh={2}>
          Choose a reviewer responsible for reviewing and approving the
          questions.
        </Text>

        <Grid m={0} px={8}>
          <Grid.Col span={6} px={0}>
            <MultiSelect
              classNames={{ option: "darkDropdown"}}
              withCheckIcon={false}
              data={(() => {
                const base = Array.from(
                  new Map(
                    filterReviewerNameList.map((item) => [
                      item.id,
                      { value: item.id, label: item.name },
                    ])
                  ).values()
                );
                const trimmed = (reviewerSearchValue || "").trim();
                if (
                  trimmed &&
                  !base.some(
                    (o) => o.label === trimmed || o.value === trimmed
                  )
                ) {
                  base.push({
                    value: `__create__:${trimmed}`,
                    label: `+ Create "${trimmed}"`,
                  });
                }
                return base;
              })()}
              withScrollArea={true}
              maxDropdownHeight={81}
              scrollAreaProps={{ type: "auto", scrollbarSize: 8, }}
              placeholder="Enter Name*"
              searchable
              searchValue={reviewerSearchValue}
              value={
                isNewReviewerAdded === true
                  ? tempNewReviewer
                    ? [tempNewReviewer?.id]
                    : []
                  : filterReviewerNameList.find((u) => u.name === userName)
                  ? [
                      filterReviewerNameList.find((u) => u.name === userName)!
                        .id,
                    ]
                  : []
              }
              onSearchChange={(searchValue) => {
                setReviewerSearchValue(searchValue);
                if (searchValue) {
                  setErrorMessage("");
                }
              }}
              onChange={(value) => {
                setErrorMessage("");

                if (!value || value.length === 0) {
                  setIsNewReviewerAdded(false);
                  setTempNewReviewer(null);
                  setUserName("");
                  setEmail("");
                  return;
                }

                const picked = value[0];

                if (picked && picked.startsWith("__create__:")) {
                  const query = picked.slice("__create__:".length);
                  const nameRegex = /^[A-Za-z\s]+$/;
                  if (!nameRegex.test(query)) {
                    setErrorMessage("Full Name must contain only alphabets");
                    return;
                  }
                  const newItem = {
                    id: `new-reviewer-${Date.now()}`,
                    name: query,
                    email: "",
                  };
                  setFilterReviewerNameList((prev) => [...prev, newItem]);
                  setUserName(newItem.name);
                  setEmail("");
                  setErrorMessage("");
                  setIsNewReviewerAdded(true);
                  setTempNewReviewer(newItem);
                  setReviewerSearchValue("");
                  return;
                }

                const selectedReviewer = filterReviewerNameList.find(
                  (u) => u.id === picked,
                );

                if (selectedReviewer) {
                  const nameRegex = /^[A-Za-z\s]+$/;
                  if (!nameRegex.test(selectedReviewer.name)) {
                    setUserName(selectedReviewer.name);
                    setErrorMessage("Full Name must contain only alphabets");
                  } else {
                    setIsNewReviewerAdded(false);
                    setTempNewReviewer(null);
                    setUserName(selectedReviewer.name);
                    setEmail(selectedReviewer.email);
                    setErrorMessage("");
                  }
                } else {
                  setUserName("");
                  setEmail("");
                }
              }}
              maxValues={1}
              disabled={isLoading}
            />
          </Grid.Col>

          <Grid.Col span={6} pr={0}>
            <TextInput
              placeholder="Enter Email ID*"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              disabled={isLoading}
            />
          </Grid.Col>
        </Grid>

        <Box h={42}>
          {errorMessage && (
            <Text fz={12} c="red" mb={10}>
              {errorMessage}
            </Text>
          )}
        </Box>

        <Flex mt={20} gap={10}>
          <Button
            onClick={() => handleAssign("ASSIGN & SUBMIT")}
            color={"solidBtn"}
            disabled={isLoading}
          >
            ASSIGN & SUBMIT
          </Button>
          <Button
            color="outlineBtn"
            onClick={() => handleSubmitWithoutAssign(activeTab, setLoading, loading, "SKIP & SUBMIT")}
            disabled={isLoading}
          >
            SKIP & SUBMIT {formType}
          </Button>
        </Flex>
      </>
    </Box>
  );
};

export default AssignReviewerPopup;
