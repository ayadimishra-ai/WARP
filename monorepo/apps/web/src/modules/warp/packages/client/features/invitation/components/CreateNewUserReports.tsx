import { yupResolver } from "@hookform/resolvers/yup";
import {
  Button,
  Group,
  MultiSelect,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useCaptchaValidationBeforeSubmit } from "@/modules/warp/packages/client/hooks/google-invisible-recaptcha";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import {
  FormInvitation_Insert_Input,
  FormSubmission_Insert_Input,
  InputMaybe,
  ParentCompanyMapping_Insert_Input,
  User_Insert_Input,
} from "@/modules/warp/packages/graphql/generated/types";
import { useBulkInsertFormSubmissionMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-form-submission";
import { useCreateParentCompanyMappingMutation } from "@/modules/warp/packages/graphql/mutations/generated/create-ParentCompanyMapping";
import { useCreateUserMutation } from "@/modules/warp/packages/graphql/mutations/generated/create-user";
import { useInsertFormInvitationNewCompanyMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-form-invitation-new-company";
import { useUpdateUserDetailByIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-userdetail-by-id";
import { useGetaddressesbyuser_IdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-address-by-userid";
import { useGetCompanyDetailByIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-companydetail-by-id";
import { useGetFormSubmissionByInvitationsLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-submission-by-invitation-id";
import { useGetformInvitationdatabycustomwhereLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-formInvitation-data-by-custom-where";
import { useGetLastInvitationAnswerDetailsForUserByUserIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-last-invitation-answer-details-for-user-by-user-id";
import { useGetUserDetailByEmailLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-email";
import { useGetUserDetailByParentCompanyIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-parentcompany-id";
import { useGetUserDetailByPhoneLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-phone";
import {
  AIEmailInvitation,
  AIEmailTemplates,
  AppRoles,
  FormInvitationStatus,
  FormTypesPage,
  internalUserformFields,
  invitationFormDetails,
  RecommendationStatus,
} from "@/modules/warp/packages/shared/constants/app.constants";
import { sanitiseArrayValues } from "@/modules/warp/packages/shared/utils/dom-purifier/dom-purify.client.util";
import {
  canEnableOPSToIQCuration,
  CompanyMetadata,
  getCarryForwardPrecedence,
  getFormAIPlans,
  hasDocumentCuration,
  hasFullAICuration,
  hasWebCuration,
  isCarryForwardAsSuggestionsEnabled,
  isFormAIEnabled,
} from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import InvitationNewUserSchema from "@/modules/warp/packages/shared/validation/invitation-new-user.schema";
import dayjs from "dayjs";
import { useEffect, useMemo, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { MonthYearRangePickerValueType } from "../../../components/MonthYearPicker";
import { encryptionDecryption } from "../../../hooks/encryption-decryption";
import { useUserSession } from "../../../hooks/use-user-session";
import { useCarryForwardSuggestions } from "../../../services/carry-forward-suggestions.service";
import {
  cancelInvitationMessage,
  sendInvitationLoadingStartedMessage,
  sendInvitationResponseMessage,
  sendInvitationValidationFailedMessage,
} from "../../../services/platform-window-message.service";
import { isUserAllowedAIFeature } from "../../form/common-functions";
import {
  initialState,
  useSendInvitationStore,
} from "./send-invitation-reports/store";
const useStyles = createStyles((theme) => ({
  commonMargin: {
    marginBottom: 10,
    marginTop: 10,
  },
  yearMonthPicker: {
    flexWrap: "nowrap",
  },
  actionButtons: {
    marginTop: 0,
  },
  repeatFormIcon: {
    background: theme.colors.dark[8],
    color: theme.colors.gray[0],
    width: "20px",
    height: "20px",
    borderRadius: "100%",
    padding: "3px",
  },
  rightSection: {
    width: "50%",
  },
  monthDelete: {
    height: "0",
    overflow: "hidden",
  },
  active: {
    color: "#fff !important",
    backgroundColor: theme.colors.orange[5],
    "&:hover": {
      backgroundColor: theme.colors.orange[5],
    },
  },
  day: {
    color: "#000 !important",
  },
  dateInput: {
    cursor: "pointer",
  },
}));

type ReviewerDetails = {
  id: string;
  name: string;
  email: string;
  isNewReviewer: boolean;
} | null;

const CreateNewUserReports = () => {
  // Add carry-forward suggestions hook
  const { processMultipleInvitations } = useCarryForwardSuggestions();
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const [isLoading, setIsLoading] = useState(false);
  const [isSelfAssign, setIsSelfAssign] = useState(true);
  const session = useUserSession();
  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: session?.company?.id,
    },
  });
  const getExistingEmails = useGetUserDetailByEmailLazyQuery()[0];
  const getExistingPhones = useGetUserDetailByPhoneLazyQuery()[0];

  const { choosemethod, choosemethodForMultiple } = encryptionDecryption();
  //const formId: any = useSendInvitationStore((store) => store.formId);
  const {
    formId,
    groupFormIds,
    parentCompanyId: selectedFormParentCompanyId,
    startDate,
    endDate,
    setAssessmentPeriod,
  } = useSendInvitationStore((store) => ({
    formId: store.formId,
    groupFormIds: store.groupFormIds,
    parentCompanyId: store.parentCompanyId,
    startDate: store.startDate,
    endDate: store.endDate,
    setAssessmentPeriod: store.setAssessmentPeriod,
  }));
  const userSession = useUserSession();
  const { classes } = useStyles();
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");
  const cancel = useSendInvitationStore((store) => () => {
    store.init(initialState);
    postParentMessage(cancelInvitationMessage());
  });
  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null);
  const [duplicatePhone, setDuplicatePhone] = useState(null);
  const [existingEmailName, setExistingEmailName] = useState(null);
  const [existingReviewerName, setExistingReviewerName] = useState<string | null>(null);
  const [oldInvitationSubmitted, setOldInvitationSubmitted] = useState(false);
  const [recomNewAssessmentPeriod, setRecomNewAssessmentPeriod] =
    useState(false);
  const [submitProgress, setSubmitProgress] = useState(false);
  const [existingPhone, setExistingPhone] = useState(null);
  const [formIdError, setFormIdError] = useState(false);
  const [IsNewUserAdded, setIsNewUserAdded] = useState(false);
  const [tempNewUser, settempNewUser] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const insertParentCompanyMapping = useCreateParentCompanyMappingMutation()[0];
  const insertFormInvitation = useInsertFormInvitationNewCompanyMutation()[0];
  const lastInvitationForUserData =
    useGetLastInvitationAnswerDetailsForUserByUserIdLazyQuery()[0];
  const insertUser = useCreateUserMutation()[0];
  const updateUserDetailById = useUpdateUserDetailByIdMutation()[0];
  const locationDetail: any = useGetaddressesbyuser_IdQuery({
    variables: {
      userId: session?.user?.id,
      companyId:
        session?.user?.role === AppRoles.Consultant
          ? selectedFormParentCompanyId
          : session?.company?.id,
    },
  });
  const locationList = useMemo(
    () =>
      locationDetail?.data?.Addresses?.length > 0
        ? locationDetail?.data?.Addresses?.map((item: any) => ({
            value: item.id,
            label: item.addressLable,
          }))
        : locationDetail?.data?.AddressesByCompanyId?.map((item: any) => ({
            value: item.id,
            label: item.addressLable,
          })).filter((x: any) => x.label !== null) ?? [],
    [locationDetail],
  );
  const [defaultLocation, setDefaultLocation] = useState(
    locationList[0]?.value,
  );
  const [defaultemail, setDefaultemail] = useState("");
  const [defaultname, setDefaultname] = useState("");
  const [filterUserEmailList, setFilterUserEmailList] = useState<
    Array<{ id: string; email: string; name: string }>
  >([]);
  const [filterUserNameList, setFilterUserNameList] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [filterReviewerNameList, setFilterReviewerNameList] = useState<
    Array<{ id: string; name: string; email: string }>
  >([]);
  const [filterReviewerEmailList, setFilterReviewerEmailList] = useState<
    Array<{ id: string; email: string; name: string }>
  >([]);
  const [tempNewReviewer, setTempNewReviewer] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);
  const [IsNewReviewerAdded, setIsNewReviewerAdded] = useState(false);
  const [userSearchValueByIndex, setUserSearchValueByIndex] = useState<
    Record<number, string>
  >({});
  const [reviewerSearchValueByIndex, setReviewerSearchValueByIndex] = useState<
    Record<number, string>
  >({});
  const bulkInsertFormSubmission = useBulkInsertFormSubmissionMutation()[0];
  const getFormSubmissionByInvitations =
    useGetFormSubmissionByInvitationsLazyQuery()[0];
  const forms_DetailBycustomWhere =
    useGetformInvitationdatabycustomwhereLazyQuery()[0];
  const getUserList = useGetUserDetailByParentCompanyIdLazyQuery()[0];
  const getParentUserList = useGetUserDetailByParentCompanyIdLazyQuery()[0];
  const [parentUserId, setparentUserId] = useState();
  type FormValues = {
    userForm: Array<{
      location: string;
      email: string;
      fullName: string;
      mobileNumber: string;
      reviewerFullName?: string;
      reviewerEmail?: string;
    }>;
    selectedEmailIds: string[];
  };

  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new",
  );

  const InternalRequestCompanyResponce: any = userSession?.GlobalMaster?.filter(
    (a: any) => a.type === "InternalRequestCompany",
  );

  const chkFormId: any = !!InternalRequestCompanyResponce
    ? InternalRequestCompanyResponce[0]?.data.filter(
        (a: any) => a.formId === formId,
      )
    : [];

  let recommendationNewData;
  let recommendationNewFormDetails: any;
  if (!!recommendationNewResponce?.length && formId) {
    recommendationNewData = recommendationNewResponce;
  }

  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
    watch,
    clearErrors,
    setError,
  } = useForm<FormValues>({
    defaultValues: {
      userForm: [
        {
          location: defaultLocation,
          email: defaultemail ?? "",
          fullName: defaultname ?? "",
          mobileNumber: "",
          reviewerFullName: "",
          reviewerEmail: "",
        },
      ],
      selectedEmailIds: [],
    },
    resolver: yupResolver(InvitationNewUserSchema) as any,
  });
  useEffect(() => {
    const fetchData = async () => {
      if (userSession?.user?.role === AppRoles.Consultant) {
        const parentUserList: any = await getParentUserList({
          variables: {
            companyId:
              userSession?.user?.role === AppRoles.Consultant
                ? selectedFormParentCompanyId
                : userSession?.company?.id,
            userId: userSession?.user?.id,
          },
          fetchPolicy: "no-cache",
        });
        setparentUserId(
          parentUserList?.data?.ParentCompanyMapping[0]?.ParentUserId,
        );
      }
      const newuserList: any = await getUserList({
        variables: {
          companyId:
            session?.user?.role === AppRoles.Consultant
              ? selectedFormParentCompanyId
              : session?.company?.id,
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

      // Filter and store users with both name and email
      const filteredNames = newData
        .filter((item: any) => item.name && item.email)
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
      setFilterUserEmailList(newData);
      setFilterUserNameList(filteredNames);

      // Set Reviewer lists (same as Reporter for now)
      setFilterReviewerEmailList(newData);
      setFilterReviewerNameList(filteredNames);
    };
    fetchData();
  }, [selectedFormParentCompanyId]);

  const {
    fields: dynamicCompanyForm,
    append,
    remove,
  } = useFieldArray({
    control,
    name: "userForm",
  });
  const addFormFields = () => {
    append({
      location: "",
      email: "",
      fullName: "",
      mobileNumber: "",
      reviewerFullName: "",
      reviewerEmail: "",
    });
  };
  //let _fromDate = dayjs().startOf("month").toDate();
  //const _toDate = dayjs().endOf("month").toDate();
  const date = new Date();
  const [duration, setDuration] = useState<MonthYearRangePickerValueType>({
    fromDate: startDate
      ? dayjs(startDate).startOf("month").toDate()
      : dayjs().startOf("month").toDate(),
    toDate: endDate
      ? dayjs(endDate).endOf("month").toDate()
      : dayjs().endOf("month").toDate(),
  });

  const formInvitationWhereCondition: Record<string, any>[] = [];
  const [assessmentPeriodRequired, setAssessmentPeriodRequired] =
    useState(false);
  const [assessmentPeriodError, setAssessmentPeriodError] = useState(false);

  useEffect(() => {
    if (filterUserEmailList.length > 0 && filterUserNameList.length > 0) {
      const userItem = filterUserEmailList.find(
        (item: any) => item.id === userSession?.user?.id,
      );
      if (userItem) {
        reset({
          userForm: [
            {
              location: defaultLocation || "",
              email: userItem.email,
              fullName: userItem.name,
              mobileNumber: "",
              reviewerFullName: "",
              reviewerEmail: "",
            },
          ],
          selectedEmailIds: [],
        });
      }
    }
  }, [
    filterUserEmailList,
    // filterUserNameList intentionally excluded: adding new names via onCreate
    // triggers setFilterUserNameList which was causing the form to reset and
    // overwrite the user-typed name (e.g. "Susan") back to the logged-in
    // user's DB name (e.g. "Organization Admin").
    userSession?.user?.id,
    defaultLocation,
    reset,
  ]);

  useEffect(() => {
    if (locationList.length > 0) {
      setDefaultLocation(locationList[0]?.value.toString());
    }
  }, [defaultLocation, locationList]);

  // Update duration when startDate or endDate change in the store
  useEffect(() => {
    if (startDate || endDate) {
      setDuration({
        fromDate: startDate
          ? dayjs(startDate).startOf("month").toDate()
          : dayjs().startOf("month").toDate(),
        toDate: endDate
          ? dayjs(endDate).endOf("month").toDate()
          : dayjs().endOf("month").toDate(),
      });

      // Clear all assessment period related validation messages
      setRecomNewAssessmentPeriod(false);
      setAssessmentPeriodRequired(false);
      setAssessmentPeriodError(false);
      setOldInvitationSubmitted(false);

      // Reset form submission states
      setSubmitProgress(false);
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  // Clear formId error when formId is set
  useEffect(() => {
    if (formId) {
      setFormIdError(false);
    }
  }, [formId]);

  // Check if user is AI user and form is AI enabled
  const isAIUser = isUserAllowedAIFeature(userSession?.accessToken ?? "");
  const isFormHasAIEnabled = isFormAIEnabled(
    userSession?.accessToken,
    formId ? formId : undefined,
  );

  // Disable carryforward for AI users with AI-enabled forms
  const shouldDisableCarryForward = isAIUser && isFormHasAIEnabled;

  const checkExistingEmails = async (emailIds: string[]) => {
    const getData = await getExistingEmails({
      variables: {
        newEmail: emailIds,
      },
    });
    return getData;
  };
  const checkExistingPhones = async (phones: any[]) => {
    const getData = await getExistingPhones({
      variables: {
        phone: phones,
      },
    });
    return getData;
  };

  // const InternalRequestCompanyResponce: any = userSession?.GlobalMaster?.filter(
  //   (a: any) => a.type === "InternalRequestCompany"
  // );

  // const chkFormId: any = InternalRequestCompanyResponce[0]?.data.filter(
  //   (a: any) => a.formId === formId && a.companyId === userSession?.company?.id
  // );

  //const IsFormLocationHide: any = chkFormId[0]?.IsFormLocationHide;
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCaptchaValidation = async () => {
    let formDetails: invitationFormDetails[] = [];
    let isError = false;
    let isemailexist = false;
    let _success = false;
    setIsLoading(true);
    setSubmitProgress(true);
    setFormIdError(false);
    const formData = getValues();
    try {
      const data = {
        userForm: sanitiseArrayValues<internalUserformFields>(
          formData.userForm,
        ),
      };

      data.userForm = data.userForm.map((item: any) => ({
        ...item,
        email: item.email.toLowerCase(),
      }));

      const userParentCompanymappingData: any = await getUserList({
        variables: {
          companyId:
            userSession?.user?.role === AppRoles.Consultant
              ? selectedFormParentCompanyId
              : userSession?.company?.id,
          userId: userSession?.user?.id,
        },
        fetchPolicy: "no-cache",
      });
      // Check if formId is null or undefined
      if (!formId) {
        setFormIdError(true);
        setIsLoading(false);
        setSubmitProgress(false);
        postParentMessage(sendInvitationValidationFailedMessage());
        setIsSubmitting(false);
        return;
      }

      // Validation for assessment period.
      if (
        !duration ||
        Date.parse(duration.fromDate.toString()) >
          Date.parse(duration.toDate.toString())
      ) {
        if (!duration) setAssessmentPeriodRequired(true);
        else setAssessmentPeriodError(true);
        isError = true;
        setIsSubmitting(false);
        return;
      } else {
        setAssessmentPeriodError(false);
        setAssessmentPeriodRequired(false);
      }

      // If startDate or endDate is null, show "Choose Assessment Period is Required" instead
      if (!startDate || !endDate) {
        setAssessmentPeriodRequired(true);
        setRecomNewAssessmentPeriod(false);
        isError = true;
        setSubmitProgress(false);
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }

      let date = new Date();
      let previousMonthYear = "";
      if (date.getMonth() === 0) {
        previousMonthYear = date.getFullYear() - 1 + "-" + 12;
      } else {
        previousMonthYear = date.getFullYear() + "-" + date.getMonth();
      }

      // Create a new Date instance to avoid mutating the original
      let finalFromDate = new Date(duration.fromDate);
      let finalToDate = new Date(duration.toDate);
      // new Date(
      //   duration.toDate.getFullYear(),
      //   duration.toDate.getMonth() + 1,
      //   0
      // ); //last month

      const fromMonthYear =
        duration.fromDate.getFullYear() +
        "-" +
        (duration.fromDate.getMonth() + 1);
      const toMonthYear =
        duration.toDate.getFullYear() + "-" + (duration.toDate.getMonth() + 1);
      const fromDate = new Date(fromMonthYear);
      const toDate = new Date(toMonthYear);
      const previousDate = new Date(previousMonthYear);

      let currentMonthYear = dayjs().startOf("month").toDate();

      currentMonthYear.setHours(currentMonthYear.getHours() + 5);
      currentMonthYear.setMinutes(currentMonthYear.getMinutes() + 30);

      finalFromDate.setHours(finalFromDate.getHours() + 5);
      finalFromDate.setMinutes(finalFromDate.getMinutes() + 30);

      finalToDate.setHours(finalToDate.getHours() + 5);
      finalToDate.setMinutes(finalToDate.getMinutes() + 30);

      let selectedUsersId: any = [];

      let emails: any = filterUserEmailList.filter(
        (x: any) =>
          x.addressId === defaultLocation &&
          data?.userForm.find((eRec: any) => eRec?.email === x?.email),
      );

      emails.map((uRec: any) => {
        selectedUsersId.push(uRec.id);
      });

      selectedUsersId = Array.from(new Set(selectedUsersId));

      // Get encrypted email for the selected user
      const selectedUserEmail = data.userForm.map((rec: { email: string }) =>
        choosemethodForMultiple(rec.email, "encryptformultiple"),
      )[0];

      // Check if there are any pending past assessments for the selected user
      const previousAssessmentCheck = await forms_DetailBycustomWhere({
        variables: {
          where: {
            _and: [
              { email: { _eq: selectedUserEmail } },
              { formId: { _eq: formId } },
              {
                status: {
                  _in: [
                    FormInvitationStatus.Invited,
                    FormInvitationStatus.Draft,
                    FormInvitationStatus.UnderReview,
                  ],
                },
              },
            ],
          },
        },
      });

      const hasPendingPastAssessment =
        previousAssessmentCheck?.data?.FormInvitation != null &&
        Array.isArray(previousAssessmentCheck.data.FormInvitation) &&
        previousAssessmentCheck.data.FormInvitation.length > 0;

      if (
        currentMonthYear >= finalFromDate &&
        currentMonthYear >= finalToDate
      ) {
        if (hasPendingPastAssessment) {
          setOldInvitationSubmitted(true);
          isError = true;
          setIsLoading(false);
          setSubmitProgress(false);
          setIsSubmitting(false);
          return;
        }
        setRecomNewAssessmentPeriod(false);
        //setOldInvitationSubmitted(false);
      } else {
        setRecomNewAssessmentPeriod(true);
        //setOldInvitationSubmitted(false);
        isError = true;
        setIsLoading(false);
        setSubmitProgress(false);
        setIsSubmitting(false);
        return;
      }

      // remove extra space between string. start and end of the staring also.
      data.userForm.filter(async (rec: any) => {
        //rec.companyName = rec.companyName.replace(/\s+/g, " ").trim();
        rec.email = rec.email.trim();
        if (rec.reviewerEmail) {
          rec.reviewerEmail = rec.reviewerEmail.trim();
        }
      });

      // Validate that Reporter and Reviewer are not the same
      for (let i = 0; i < data.userForm.length; i++) {
        const form = data.userForm[i];
        if (form.reviewerEmail && form.reviewerFullName) {
          if (
            form.email.toLowerCase() === form.reviewerEmail.toLowerCase() ||
            form.fullName === form.reviewerFullName
          ) {
            setError(`userForm.${i}.reviewerEmail`, {
              type: "manual",
              message: "Reviewer cannot be the same as Reporter",
            });
            setIsLoading(false);
            setSubmitProgress(false);
            setIsSubmitting(false);
            return;
          }
        }
      }

      // Check if NEW reviewers already exist in the database (not existing selections)
      const reviewerEmailsToValidate: string[] = [];
      const newReviewerEmailsForValidation: string[] = [];
      
      data.userForm.forEach((rec: any) => {
        if (rec.reviewerEmail && rec.reviewerFullName) {
          // Check if this reviewer email is NOT in the existing reviewer list
          const isExistingReviewer = filterReviewerEmailList.some(
            (existingReviewer: any) =>
              existingReviewer.email.toLowerCase() === rec.reviewerEmail.toLowerCase()
          );
          
          // Only validate if it's a NEW reviewer (not selected from existing list)
          if (!isExistingReviewer) {
            const encryptedEmail = choosemethodForMultiple(
              rec.reviewerEmail.toLowerCase(),
              "encryptformultiple",
            ) as string;
            reviewerEmailsToValidate.push(encryptedEmail);
            newReviewerEmailsForValidation.push(rec.reviewerEmail.toLowerCase());
          }
        }
      });

      // Only run validation if there are NEW reviewers to validate
      if (reviewerEmailsToValidate.length > 0) {
        const existingReviewerCheck = await getExistingEmails({
          variables: {
            newEmail: reviewerEmailsToValidate,
          },
        });

        if (
          existingReviewerCheck.data &&
          existingReviewerCheck.data.User.length > 0
        ) {
          // Filter to check if reviewer exists in the same company
          const existingInSameCompany = existingReviewerCheck.data.User.filter(
            (user: any) =>
              user.companyId ===
              (userSession?.user?.role === AppRoles.Consultant
                ? selectedFormParentCompanyId
                : userSession?.company?.id),
          );

          if (existingInSameCompany.length > 0) {
            // Decrypt the existing reviewer emails to show in error message
            const existingReviewerEmails = existingInSameCompany.map(
              (user: any) =>
                choosemethodForMultiple(user.email, "decryptForMultiple"),
            );
            setExistingReviewerName(existingReviewerEmails.join(", "));
            isError = true;
            setIsLoading(false);
            setSubmitProgress(false);
            setIsSubmitting(false);
            return;
          } else {
            setExistingReviewerName(null);
          }
        } else {
          setExistingReviewerName(null);
        }
      }

      let emailidnew: any;
      let emailList: InputMaybe<string | string[]> | undefined = [];
      emailList = data.userForm.map((rec: any) => {
        emailidnew = rec.email;
        return rec.email;
      });
      // checking of duplicate data for email
      const duplicateEmailData = data.userForm
        .map((item: any, index: any) => {
          if (emailList && emailList.indexOf(item.email) !== index)
            return item.email;
          return null;
        })
        .filter((item: any) => !!item);

      if (!duplicateEmailData || duplicateEmailData.length > 0) {
        isError = true;
        setDuplicateEmail(duplicateEmailData.join(", "));
        setIsLoading(false);
        setIsSubmitting(false);
        return;
      }
      setDuplicateEmail(null);

      // checking of duplicate data for phone
      // let phoneList: any = [];
      // phoneList = data.userForm.map((rec: any) => {
      //   return rec.mobileNumber;
      // });
      // if (phoneList?.length > 0) {
      //   const duplicatePhoneData = data.userForm
      //     .map((item: any, index: any) => {
      //       if (phoneList && phoneList.indexOf(item.mobileNumber) !== index)
      //         return item.mobileNumber;
      //       return null;
      //     })
      //     .filter((item: any) => !!item);

      //   if (!duplicatePhoneData || duplicatePhoneData.length > 0) {
      //     isError = true;
      //     setDuplicatePhone(duplicatePhoneData.join(", "));
      //     setIsLoading(false);
      //     return;
      //   }
      //   setDuplicatePhone(null);
      // }

      // for (
      //   let datalength = 0;
      //   datalength < data.userForm.length;
      //   datalength++
      // ) {
      //   data.userForm[datalength].email = await choosemethod(
      //     String(data.userForm[datalength].email).toLowerCase().trim(),
      //     "encrypt"
      //   );
      // }
      // Checking for existing email to db.
      let existingEmailData: any = [];
      const getEmails = data.userForm.map((rec: internalUserformFields) => {
        return choosemethodForMultiple(rec.email, "encryptformultiple");
        //return rec.email;
      });
      let Getlocation: any = [];
      Getlocation = data.userForm.map((rec: internalUserformFields) => {
        return rec.location;
      });
      const result = await checkExistingEmails(getEmails as string[]);
      if (result.error) {
        isError = true;
        setIsSubmitting(false);
        return;
      }
      if (result.data && result.data.User.length > 0) {
        const decryptEmails: any = result?.data?.User?.map((rec: any) => {
          return choosemethodForMultiple(rec.email, "decryptForMultiple");
        });
        isError = false; //selecting existing email id
        // setIsLoading(false);
        const filteredUsers = result.data.User.filter(
          (user) =>
            user.companyId ===
            (userSession?.user?.role === AppRoles.Consultant
              ? selectedFormParentCompanyId
              : userSession?.company?.id),
        );
        if (filteredUsers.length === 0) {
          setExistingEmailName(decryptEmails.join(", "));
          isError = true;
          setSubmitProgress(false);
          setIsSubmitting(false);
          return;
        }
        isemailexist = true;
        // return;
      } else if (
        result.data &&
        result.data.User.length === 0 &&
        result.data.Company.length > 0
      ) {
        setExistingEmailName(emailidnew);
        isError = true;
        setSubmitProgress(false);
        setIsSubmitting(false);
        return;
      } else {
        setExistingEmailName(null);
        isemailexist = false;
      }
      // Checking for existing phone to db.
      // const getPhones = data.userForm.map((rec: any) => {
      //   return rec.mobileNumber;
      // });
      // if (getPhones.length > 0) {
      //   const resultPhone = await checkExistingPhones(getPhones);
      //   if (resultPhone.error) {
      //     isError = true;
      //     return;
      //   }
      //   if (resultPhone.data && resultPhone.data.User.length > 0) {
      //     const phones: any = resultPhone?.data?.User?.map((rec: any) => {
      //       return rec.phone;
      //     });
      //     isError = true;
      //     setIsLoading(false);
      //     setExistingPhone(phones.join(", "));
      //     return;
      //   } else {
      //     setExistingPhone(null);
      //   }
      // }
      if (isError === false && isemailexist === false) {
        postParentMessage(sendInvitationLoadingStartedMessage());
        const insertInvitationData = data.userForm;

        // Inserting user data
        let userDataArray: User_Insert_Input[] = [];

        // Inserting FormInvitation data
        let formInvitationDataArray: FormInvitation_Insert_Input[] = [];
        // Inserting parent company mapping  data insertion
        let parentcompanymapping: ParentCompanyMapping_Insert_Input[];
        userDataArray = data?.userForm?.map((rec: any) => {
          return {
            name: rec.fullName,
            email: choosemethodForMultiple(rec.email, "encryptformultiple"),
            phone: rec.mobileNumber,
            companyId:
              session?.user?.role === AppRoles.Consultant
                ? selectedFormParentCompanyId
                : userSession?.company?.id,
            created_by: session?.user?.id,
            updated_by: session?.user?.id,
            UserRoles: {
              data: {
                roleName: AppRoles.Invitee,
              },
            },
          };
        }) as unknown as User_Insert_Input[];
        // Prepare Reviewer users - check if they exist first
        const reviewerFormIndices: number[] = [];
        const reviewerEmailsToCheck: string[] = [];
        const reviewerFormMap: Map<string, any> = new Map();

        data?.userForm?.forEach((rec: any, index: number) => {
          if (rec.reviewerEmail && rec.reviewerFullName) {
            const encryptedEmail = choosemethodForMultiple(
              rec.reviewerEmail,
              "encryptformultiple",
            ) as string;
            reviewerEmailsToCheck.push(encryptedEmail);
            reviewerFormMap.set(rec.reviewerEmail.toLowerCase(), {
              name: rec.reviewerFullName,
              email: encryptedEmail,
              index: index,
            });
            reviewerFormIndices.push(index);
          }
        });

        // Check if reviewers already exist in the database
        let existingReviewers: any[] = [];
        let allReviewerUsers: any[] = [];

        if (reviewerEmailsToCheck.length > 0) {
          const existingReviewerResult = await getExistingEmails({
            variables: {
              newEmail: reviewerEmailsToCheck,
            },
          });

          if (
            existingReviewerResult.data &&
            existingReviewerResult.data.User.length > 0
          ) {
            // Filter reviewers that belong to the same company
            existingReviewers = existingReviewerResult.data.User.filter(
              (user: any) =>
                user.companyId ===
                (userSession?.user?.role === AppRoles.Consultant
                  ? selectedFormParentCompanyId
                  : userSession?.company?.id),
            );

            // Add existing reviewers to the all reviewers list
            allReviewerUsers = [...existingReviewers];
          }
        }

        // Only insert reviewers that don't exist
        const newReviewersToInsert: User_Insert_Input[] = [];
        data?.userForm?.forEach((rec: any) => {
          if (rec.reviewerEmail && rec.reviewerFullName) {
            const encryptedEmail = choosemethodForMultiple(
              rec.reviewerEmail,
              "encryptformultiple",
            );

            // Check if this reviewer already exists
            const reviewerExists = existingReviewers.some(
              (existingUser: any) => existingUser.email === encryptedEmail,
            );

            if (!reviewerExists) {
              newReviewersToInsert.push({
                name: rec.reviewerFullName,
                email: encryptedEmail,
                phone: "",
                companyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : userSession?.company?.id,
                created_by: session?.user?.id,
                updated_by: session?.user?.id,
                UserRoles: {
                  data: {
                    roleName: AppRoles.Invitee,
                  },
                },
              } as unknown as User_Insert_Input);
            }
          }
        });

        // Insert Reporter users
        const resultUser = await insertUser({
          variables: {
            input: userDataArray,
          },
        });

        // Insert only new Reviewer users (if any)
        let resultReviewer: any = null;
        if (newReviewersToInsert.length > 0) {
          resultReviewer = await insertUser({
            variables: {
              input: newReviewersToInsert,
            },
          });

          // Add newly inserted reviewers to the all reviewers list
          if (resultReviewer?.data?.insert_User?.returning) {
            allReviewerUsers = [
              ...allReviewerUsers,
              ...resultReviewer.data.insert_User.returning,
            ];
          }
        }

        if (resultUser && resultUser?.data?.insert_User?.returning) {
          parentcompanymapping = resultUser?.data?.insert_User?.returning?.map(
            (rec: any) => {
              formInvitationWhereCondition.push({
                _and: {
                  companyId: { _eq: userSession?.company?.id },
                  formId: { _eq: formId },
                  email: { _eq: rec.email },
                },
              });
              return {
                CompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : userSession?.company?.id,
                ParentCompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : session?.company?.id,
                UserId: rec.id,
                ParentUserId:
                  userSession?.user?.role === AppRoles.Consultant
                    ? parentUserId
                    : session?.user?.id,
                AddressId:
                  Getlocation.length > 0 &&
                  Getlocation[0] != null &&
                  Getlocation[0] !== ""
                    ? Getlocation[0]
                    : session?.user?.role === AppRoles.Consultant
                    ? defaultLocation
                    : null, //need to confirm
              };
            },
          );
          // Track number of reporters for later use
          const reporterCount = parentcompanymapping.length;

          // Create ParentCompanyMapping for Reviewers (both existing and new)
          // Note: Reviewers will NOT get formInvitations created for them
          if (allReviewerUsers.length > 0) {
            const reviewerMappings = allReviewerUsers.map((rec: any) => ({
              CompanyId:
                session?.user?.role === AppRoles.Consultant
                  ? selectedFormParentCompanyId
                  : userSession?.company?.id,
              ParentCompanyId:
                session?.user?.role === AppRoles.Consultant
                  ? selectedFormParentCompanyId
                  : session?.company?.id,
              UserId: rec.id,
              ParentUserId:
                userSession?.user?.role === AppRoles.Consultant
                  ? parentUserId
                  : session?.user?.id,
              AddressId:
                Getlocation.length > 0 &&
                Getlocation[0] != null &&
                Getlocation[0] !== ""
                  ? Getlocation[0]
                  : session?.user?.role === AppRoles.Consultant
                  ? defaultLocation
                  : null,
            }));
            parentcompanymapping = [
              ...parentcompanymapping,
              ...reviewerMappings,
            ];
          }
          const resultParentCompany = await insertParentCompanyMapping({
            variables: {
              input: parentcompanymapping,
            },
          });
          let forms_FormInvitationDetail: any = [];
          if (formInvitationWhereCondition.length > 0) {
            forms_FormInvitationDetail = await forms_DetailBycustomWhere({
              variables: {
                where: { _or: formInvitationWhereCondition },
              },
            });
          }
          if (
            resultParentCompany &&
            resultParentCompany?.data?.insert_ParentCompanyMapping?.returning
          ) {
            // Only create formInvitations for reporters (first reporterCount entries)
            // Reviewers should NOT get their own formInvitations
            const reporterMappings =
              resultParentCompany?.data?.insert_ParentCompanyMapping?.returning.slice(
                0,
                reporterCount,
              );

            // Get all reviewer mappings (after reporterCount)
            const reviewerMappings =
              resultParentCompany?.data?.insert_ParentCompanyMapping?.returning.slice(
                reporterCount,
              );

            const isOPSEnabledForInvitation = await canEnableOPSToIQCuration(
              userSession?.accessToken,
              formId,
              userSession?.company?.id,
            );
            //Comment for Code Reviewer: Current companyId is different from parentCompanyId, thus, always use session companyId for checking OPS to IQCuration enablement as formInvitations are created only for reporters who belong to the session company, not parentCompany
            formInvitationDataArray = await Promise.all(
              reporterMappings?.map(
              async (rec: any, index: number) => {
                const hasFormFullAICuration = hasFullAICuration(
                  userSession?.accessToken,
                  formId,
                );
                // console.log("rec", rec);
                const hasDocCuration = hasDocumentCuration(
                  userSession?.accessToken,
                  formId,
                );
                const hasWebCuration_ = hasWebCuration(
                  userSession?.accessToken,
                  formId,
                );

                // Build allowedAICuration array based on available capabilities
                const allowedAICuration: string[] = [];
                if (hasWebCuration_) {
                  allowedAICuration.push("WebCuration");
                }
                if (hasDocCuration) {
                  allowedAICuration.push("DocumentCuration");
                }
                if (isOPSEnabledForInvitation.eligible) {
                  allowedAICuration.push("OPSToIQCuration");
                }
                // Build metadata object
                const metadata = {
                  AIData: {
                    allowedAICuration: allowedAICuration,
                    triggeredCuration: [],
                  },
                  ...(isOPSEnabledForInvitation.eligible && {
                    opsData: {
                      opsCompanyId: isOPSEnabledForInvitation.opsCompanyId,
                      opsCompanyName: isOPSEnabledForInvitation.opsCompanyName,
                    },
                  }),
                };
                // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                // Build interimCheck object with carry-forward suggestions flag
                const interimCheck = {
                  isCarryForwardAsSuggestionsInvitation:
                    isCarryForwardAsSuggestionsEnabled(
                      userSession?.accessToken,
                      formId,
                      companyDetails?.Company[0]?.metadata,
                    ),
                };

                // Build ReviewerDetails if reviewer exists for this form entry
                let reviewerDetails: ReviewerDetails = null;
                let reviewerParentCompanyId: string | null = null;
                const formEntry = data.userForm[index];
                if (
                  formEntry?.reviewerEmail &&
                  formEntry?.reviewerFullName &&
                  allReviewerUsers.length > 0
                ) {
                  const reviewerUser = allReviewerUsers.find(
                    (r: any) =>
                      choosemethodForMultiple(r.email, "decryptForMultiple") ===
                      formEntry.reviewerEmail,
                  );

                  if (reviewerUser) {
                    // Check if this reviewer was newly created or already existed
                    const isNewReviewer = !existingReviewers.some(
                      (existing: any) => existing.id === reviewerUser.id,
                    );

                    reviewerDetails = {
                      id: reviewerUser.id,
                      name: formEntry.reviewerFullName,
                      email:
                        choosemethodForMultiple(
                          formEntry.reviewerEmail,
                          "encryptformultiple",
                        ) ?? "",
                      isNewReviewer: isNewReviewer,
                    };
                    // Find reviewer's ParentCompanyMapping ID
                    const reviewerMapping = reviewerMappings?.find(
                      (mapping: any) => mapping?.User?.id === reviewerUser.id,
                    );
                    if (reviewerMapping) {
                      reviewerParentCompanyId = reviewerMapping.Id;
                    }
                  }
                }

                const data2 = {
                  companyId:
                    userSession?.user?.role === AppRoles.Consultant
                      ? selectedFormParentCompanyId
                      : userSession?.company?.id,
                  formId: formId,
                  email: rec?.User?.email,
                  status: FormInvitationStatus.Invited,
                  created_by: session?.user?.id,
                  updated_by: session?.user?.id,
                  durationFrom: finalFromDate,
                  durationTo: finalToDate,
                  ParentCompanyMappingId: rec.Id,
                  parentcompanyId:
                    session?.user?.role === AppRoles.Consultant
                      ? selectedFormParentCompanyId
                      : session?.company?.id,
                  metadata: metadata,
                  interimCheck: interimCheck,
                  reviewerDetails: reviewerDetails,
                  reviewerParentCompanyId: reviewerParentCompanyId,
                };

                return data2;
              },
            ));
          }
          const resultFormInvitation = await insertFormInvitation({
            variables: {
              object: formInvitationDataArray,
            },
          });

          if (
            resultFormInvitation &&
            resultFormInvitation?.data?.insert_FormInvitation?.returning
          ) {
            // AITODO: commented code to be removed
            // const isAIUser = isUserAllowedAIFeature(
            //   userSession?.accessToken ?? ""
            // );
            // if (isAIUser === false) {
            //#region for AI Functionality
            // formDetails =
            //   resultFormInvitation?.data?.insert_FormInvitation?.returning.map(
            //     (inviteItems) => {
            //       const formData =
            //         !!AITokenValue && AITokenValue.length > 0
            //           ? AITokenValue?.filter(
            //               (items: any) =>
            //                 items?.formId == inviteItems?.formId &&
            //                 (items?.docWithAI == true || items?.onlyDoc == true)
            //             )
            //           : [];
            //       return {
            //         isAIForm: formData.length > 0,
            //         AIData: formData,
            //       };
            //     }
            //   ) as invitationFormDetails[];
            // const processingInvitation =
            //   resultFormInvitation?.data?.insert_FormInvitation?.returning.filter(
            //     (items) => items.status == FormInvitationStatus.Processing
            //   );

            const invitedStatusInvitation =
              resultFormInvitation?.data?.insert_FormInvitation?.returning
                .filter((items) => items.status == FormInvitationStatus.Invited)
                .map((items) => {
                  return {
                    invitationId: items.id,
                    // isNormalInvitation: !isFormAIEnabled(
                    //   session?.accessToken,
                    //   items.formId
                    // ),
                    companyId: items?.companyId,
                    formId: items?.formId,
                    platformId: session?.platform?.id,
                    reviewerDetails: (items as any)?.reviewerDetails,
                  };
                });
            // if (!!processingInvitation && processingInvitation.length > 0) {
            //   const bulkInsertionData: FormSubmission_Insert_Input[] = [];
            //   const webCurationInsertInput: WebCuration_Insert_Input[] = [];
            //   processingInvitation?.forEach((items) => {
            //     bulkInsertionData.push({
            //       invitationId: items?.id,
            //       isActive: true,
            //     });
            //     webCurationInsertInput.push({
            //       formInvitationId: items?.id,
            //       status: WebDataCurationStatus.Processing,
            //       triggeredByUserId: session?.user?.id,
            //       startAt: new Date(),
            //     });
            //   });
            //   await bulkInsertFormSubmission({
            //     variables: {
            //       formSubmissionInput: bulkInsertionData,
            //     },
            //   });
            //   const webCurationInsertion = await insertWebCuration({
            //     variables: {
            //       webCurationInsertInput: webCurationInsertInput,
            //     },
            //   });
            //   const formInvitationData = processingInvitation?.map((items) => {
            //     return {
            //       company_id: items?.companyId,
            //       form_id: items?.formId,
            //       form_invitation_id: items?.id,
            //       web_curation_id:
            //         !!webCurationInsertion?.data?.insert_WebCuration
            //           ?.returning &&
            //         webCurationInsertion?.data?.insert_WebCuration?.returning
            //           .length > 0
            //           ? webCurationInsertion?.data?.insert_WebCuration?.returning.filter(
            //               (curationItems) =>
            //                 curationItems?.formInvitationId == items?.id
            //             )[0]?.id
            //           : "",
            //     };
            //   });
            //   if (!!formInvitationData && formInvitationData.length > 0) {
            //     await callAIAPI(formInvitationData);
            //   }
            // }
            // if (
            //   !!invitedStatusInvitation &&
            //   invitedStatusInvitation.length > 0
            // ) {
            //   if (
            //     invitedStatusInvitation.filter(
            //       (items) => !items.isNormalInvitation
            //     ).length > 0
            //   ) {
            //     const bulkInsertionData: FormSubmission_Insert_Input[] = [];
            //     const emailInviteData = invitedStatusInvitation
            //       .filter((items) => !items.isNormalInvitation)
            //       .map((invitedItems) => {
            //         bulkInsertionData.push({
            //           invitationId: invitedItems?.invitationId,
            //           isActive: true,
            //         });
            //         return {
            //           invitationId: String(invitedItems?.invitationId),
            //           isInternalUSer: true,
            //           emailType: [
            //             AIEmailTemplates.AINewFormInvitation,
            //             AIEmailTemplates.AINewOnboarding,
            //           ],
            //         };
            //       }) as AIEmailInvitation[];
            //     await bulkInsertFormSubmission({
            //       variables: {
            //         formSubmissionInput: bulkInsertionData,
            //       },
            //     });
            //     if (emailInviteData.length > 0) {
            //       await fetch("/warp/api/AI/email-invitation", {
            //         method: "POST",
            //         headers: {
            //           "content-type": "application/json",
            //         },
            //         body: JSON.stringify(emailInviteData),
            //       });
            //     }
            //   }
            if (invitedStatusInvitation && invitedStatusInvitation.length > 0) {
              const bulkInsertionData: FormSubmission_Insert_Input[] = invitedStatusInvitation.map((items) => ({
                invitationId: items.invitationId,
                isActive: true,
              }));
              await bulkInsertFormSubmission({
                variables: { formSubmissionInput: bulkInsertionData },
              });
            }
            // send data to API for company email invitation.
            for (const items of invitedStatusInvitation) {
              try {
                await fetch("/warp/api/khaitan-email-invitation", {
                  method: "POST",
                  headers: {
                    "content-type": "application/json",
                  },
                  body: JSON.stringify({
                    id: items?.invitationId,
                    type: "ReportingFormInviation",
                    companyId:
                      session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                    formId: formId,
                    NewUser: true,
                    platformId: session?.platform?.id,
                  }),
                });
              } catch (error) {
                console.error(`[Khaitan Email] Failed to send for invitation ${items?.invitationId}:`, error);
              }
            }
            // Only triggers if reviewer exists and has data
            for (const items of invitedStatusInvitation) {
              if (items?.reviewerDetails && items?.reviewerDetails?.email) {
                try {
                  const emailType = items?.reviewerDetails?.isNewReviewer
                    ? "ReviewerReportingFormInvitation"
                    : "ExistingReviewerReportingFormInvitation";

                  await fetch("/warp/api/Reviewer-email-invitation", {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify({
                      id: items?.invitationId,
                      type: emailType,
                      companyId:
                        session?.user?.role === AppRoles.Consultant
                          ? selectedFormParentCompanyId
                          : session?.company?.id,
                      formId: formId,
                      NewUser: items?.reviewerDetails?.isNewReviewer,
                      platformId: session?.platform?.id,
                    }),
                  });
                } catch (error) {
                  console.error(
                    `[Reviewer Email] Failed to send for invitation ${items?.invitationId}:`,
                    error
                  );
                }
              }
            }
            // }
            //#endregion
            // }
            reset({
              userForm: [
                {
                  location: "",
                  email: "",
                  fullName: "",
                  mobileNumber: "",
                  reviewerFullName: "",
                  reviewerEmail: "",
                },
              ],
            });
          }
          cancel();
          setIsLoading(false);
          setSubmitProgress(false);
          _success = true;
        }
      } else if (isError === false && isemailexist !== false) {
        const insertInvitationData = data.userForm;
        // Inserting user data
        let userDataArray: User_Insert_Input[] = [];

        // Inserting FormInvitation data
        let formInvitationDataArray: FormInvitation_Insert_Input[] = [];
        // Inserting parent company mapping  data insertion
        let parentcompanymapping: ParentCompanyMapping_Insert_Input[];
        let existingMapping = [];

        // Check and insert reviewers for existing user scenario
        let allReviewerUsers: any[] = [];
        const reviewerEmailsToCheck: string[] = [];

        data?.userForm?.forEach((rec: any) => {
          if (rec.reviewerEmail && rec.reviewerFullName) {
            const encryptedEmail = choosemethodForMultiple(
              rec.reviewerEmail,
              "encryptformultiple",
            ) as string;
            reviewerEmailsToCheck.push(encryptedEmail);
          }
        });

        // Check if reviewers already exist in the database
        let existingReviewers: any[] = [];

        if (reviewerEmailsToCheck.length > 0) {
          const existingReviewerResult = await getExistingEmails({
            variables: {
              newEmail: reviewerEmailsToCheck,
            },
          });

          if (
            existingReviewerResult.data &&
            existingReviewerResult.data.User.length > 0
          ) {
            // Filter reviewers that belong to the same company
            existingReviewers = existingReviewerResult.data.User.filter(
              (user: any) =>
                user.companyId ===
                (userSession?.user?.role === AppRoles.Consultant
                  ? selectedFormParentCompanyId
                  : userSession?.company?.id),
            );

            // Add existing reviewers to the all reviewers list
            allReviewerUsers = [...existingReviewers];
          }
        }

        // Only insert reviewers that don't exist
        const newReviewersToInsert: User_Insert_Input[] = [];
        data?.userForm?.forEach((rec: any) => {
          if (rec.reviewerEmail && rec.reviewerFullName) {
            const encryptedEmail = choosemethodForMultiple(
              rec.reviewerEmail,
              "encryptformultiple",
            ) as string;

            // Check if this reviewer already exists
            const reviewerExists = existingReviewers.some(
              (existingUser: any) => existingUser.email === encryptedEmail,
            );

            if (!reviewerExists) {
              newReviewersToInsert.push({
                name: rec.reviewerFullName,
                email: encryptedEmail,
                phone: "",
                companyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : userSession?.company?.id,
                created_by: session?.user?.id,
                updated_by: session?.user?.id,
                UserRoles: {
                  data: {
                    roleName: AppRoles.Invitee,
                  },
                },
              } as unknown as User_Insert_Input);
            }
          }
        });

        // Insert only new Reviewer users (if any)
        let resultReviewer: any = null;
        if (newReviewersToInsert.length > 0) {
          resultReviewer = await insertUser({
            variables: {
              input: newReviewersToInsert,
            },
          });

          // Add newly inserted reviewers to the all reviewers list
          if (resultReviewer?.data?.insert_User?.returning) {
            allReviewerUsers = [
              ...allReviewerUsers,
              ...resultReviewer.data.insert_User.returning,
            ];
          }
        }

        if (result.data && result.data.User.length > 0) {
          // If the user typed a different name in the form, update it in the DB
          // so the invitation email and all downstream uses reflect the new name.
          const nameUpdateInputs = result.data.User.flatMap((dbUser: any) => {
            const formEntry = data.userForm.find(
              (rec: any) =>
                choosemethodForMultiple(rec.email, "encryptformultiple") ===
                dbUser.email,
            );
            if (
              formEntry &&
              formEntry.fullName &&
              formEntry.fullName.trim() !== "" &&
              formEntry.fullName.trim() !== dbUser.name
            ) {
              return [
                {
                  where: { id: { _eq: dbUser.id } },
                  _set: { name: formEntry.fullName.trim() },
                },
              ];
            }
            return [];
          });
          if (nameUpdateInputs.length > 0) {
            try {
              await updateUserDetailById({ variables: { input: nameUpdateInputs } });
            } catch (err) {
              console.error("Failed to update user name:", err);
            }
          }

          parentcompanymapping = result?.data?.User?.map((rec: any) => {
            // Check if mapping already exists
            if (session?.user?.role === AppRoles.Inviter) {
              if (getEmails.includes(userSession?.user?.email)) {
                existingMapping =
                  userParentCompanymappingData.data.ParentCompanyMapping.filter(
                    (x: any) => x.AddressId === defaultLocation,
                  );
              } else {
                existingMapping =
                  userParentCompanymappingData.data.ParentCompanyMapping.filter(
                    (x: any) =>
                      x.ParentCompanyId === session?.company?.id &&
                      x.AddressId === defaultLocation,
                  );
              }
            } else {
              existingMapping =
                userParentCompanymappingData.data.ParentCompanyMapping.filter(
                  (x: any) =>
                    x.AddressId ===
                      (session?.user?.role === AppRoles.Consultant
                        ? defaultLocation
                        : Getlocation[0]) &&
                    x.CompanyId ===
                      (session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : userSession?.company?.id) &&
                    x.ParentCompanyId ===
                      (userSession?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id) &&
                    x.UserId === rec.id &&
                    x.ParentUserId ===
                      (session?.user?.role === AppRoles.Consultant
                        ? parentUserId
                        : session?.user?.id),
                );
            }
            // If mapping doesn't exist, add to formInvitationWhereCondition and return mapping data
            if (existingMapping.length > 0) {
              formInvitationWhereCondition.push({
                _and: {
                  companyId: {
                    _eq:
                      session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                  },
                  formId: { _eq: formId },
                  email: {
                    _eq: rec.email,
                    //                  _eq: choosemethodForMultiple(rec.email, "encryptformultiple"),
                  },
                },
              });
              return {
                CompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : userSession?.company?.id,
                ParentCompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : session?.company?.id,
                UserId: rec.id,
                ParentUserId:
                  userSession?.user?.role === AppRoles.Consultant
                    ? parentUserId
                    : session?.user?.id,
                AddressId:
                  Getlocation.length > 0 &&
                  Getlocation[0] != null &&
                  Getlocation[0] !== ""
                    ? Getlocation[0]
                    : null,
              };
            }
            return []; // Skip if mapping already exists
          }).filter(Boolean) as ParentCompanyMapping_Insert_Input[];

          // Track number of reporters for later use
          const reporterCount = parentcompanymapping.length;

          // Create ParentCompanyMapping for Reviewers (both existing and new)
          // Note: Reviewers will NOT get formInvitations created for them
          if (allReviewerUsers.length > 0) {
            const reviewerMappings = allReviewerUsers.map((rec: any) => ({
              CompanyId:
                session?.user?.role === AppRoles.Consultant
                  ? selectedFormParentCompanyId
                  : userSession?.company?.id,
              ParentCompanyId:
                session?.user?.role === AppRoles.Consultant
                  ? selectedFormParentCompanyId
                  : session?.company?.id,
              UserId: rec.id,
              ParentUserId:
                userSession?.user?.role === AppRoles.Consultant
                  ? parentUserId
                  : session?.user?.id,
              AddressId:
                Getlocation.length > 0 &&
                Getlocation[0] != null &&
                Getlocation[0] !== ""
                  ? Getlocation[0]
                  : session?.user?.role === AppRoles.Consultant
                  ? defaultLocation
                  : null,
            }));
            parentcompanymapping = [
              ...parentcompanymapping,
              ...reviewerMappings,
            ];
          }

          let resultParentCompany: any = [];
          if (parentcompanymapping && parentcompanymapping.length > 0) {
            resultParentCompany = await insertParentCompanyMapping({
              variables: {
                input: parentcompanymapping,
              },
            });
          }
          //   return {
          //     CompanyId: userSession?.company?.id,
          //     ParentCompanyId: session?.company?.id,
          //     UserId: rec.id,
          //     ParentUserId: session?.user?.id,
          //     AddressId:
          //       Getlocation.length > 0 &&
          //       Getlocation[0] != null &&
          //       Getlocation[0] !== ""
          //         ? Getlocation[0]
          //         : null,
          //   };
          // });
          // const resultParentCompany = await insertParentCompanyMapping({
          //   variables: {
          //     input: parentcompanymapping,
          //   },
          //
          //});
          let forms_FormInvitationDetail: any = [];
          if (formInvitationWhereCondition.length > 0) {
            forms_FormInvitationDetail = await forms_DetailBycustomWhere({
              variables: {
                where: { _or: formInvitationWhereCondition },
              },
            });
          }

          recommendationNewFormDetails =
            recommendationNewResponce[0]?.data?.filter(
              (rec: any) => rec.FormId === formId,
            );

          let lastInvitationDataQuery: any = [];
          if (
            !shouldDisableCarryForward &&
            recommendationNewFormDetails.length > 0 &&
            chkFormId.length > 0
          ) {
            if (!!chkFormId && chkFormId[0].IsEnable) {
              lastInvitationDataQuery = await lastInvitationForUserData({
                variables: {
                  userIds: selectedUsersId,
                  formId: formId,
                  status: [
                    RecommendationStatus.Closed,
                    RecommendationStatus.NA,
                  ],
                  parentcompanyId: userSession?.company?.id,
                },
                fetchPolicy: "no-cache",
              });
            }
          }

          if (
            resultParentCompany &&
            resultParentCompany?.data?.insert_ParentCompanyMapping?.returning
          ) {
            // Only create formInvitations for reporters (first reporterCount entries)
            // Reviewers should NOT get their own formInvitations
            const reporterMappings =
              resultParentCompany?.data?.insert_ParentCompanyMapping?.returning.slice(
                0,
                reporterCount,
              );

            // Get all reviewer mappings (after reporterCount)
            const reviewerMappings =
              resultParentCompany?.data?.insert_ParentCompanyMapping?.returning.slice(
                reporterCount,
              );

            // Build ReviewerDetails for existing users (if reviewer specified)
            let reviewerDetails: ReviewerDetails = null;
            let reviewerParentCompanyId: string | null = null;
            const formEntry = data.userForm[0]; // Assuming single form for existing user
            if (formEntry?.reviewerEmail && formEntry?.reviewerFullName) {
              // Check if reviewer exists in the allReviewerUsers list (existing or newly created)
              const existingReviewer = allReviewerUsers.find(
                (r: any) =>
                  choosemethodForMultiple(r.email, "decryptForMultiple") ===
                  formEntry.reviewerEmail,
              );
              if (existingReviewer) {
                // Check if this reviewer was newly created or already existed
                const isNewReviewer = !existingReviewers.some(
                  (existing: any) => existing.id === existingReviewer.id,
                );
                reviewerDetails = {
                  id: existingReviewer.id,
                  name: formEntry.reviewerFullName,
                  email: choosemethodForMultiple(
                          formEntry.reviewerEmail,
                          "encryptformultiple",
                        ) ?? "",
                  isNewReviewer: isNewReviewer,
                };
                // Find reviewer's ParentCompanyMapping ID
                const reviewerMapping = reviewerMappings?.find(
                  (mapping: any) => mapping?.User?.id === existingReviewer.id,
                );
                if (reviewerMapping) {
                  reviewerParentCompanyId = reviewerMapping.Id;
                }
              }
            }
            const isOPSEnabledForInvitation2 = await canEnableOPSToIQCuration(
              userSession?.accessToken,
              formId,
              userSession?.company?.id,
            );
            formInvitationDataArray = await Promise.all(
              reporterMappings?.map(async (rec: any) => {
              const hasFormFullAICuration = hasFullAICuration(
                userSession?.accessToken,
                formId,
              );
              const hasDocCuration = hasDocumentCuration(
                userSession?.accessToken,
                formId,
              );
              const hasWebCuration_ = hasWebCuration(
                userSession?.accessToken,
                formId,
              );

              // Build allowedAICuration array based on available capabilities
              const allowedAICuration: string[] = [];
              if (hasWebCuration_) {
                allowedAICuration.push("WebCuration");
              }
              if (hasDocCuration) {
                allowedAICuration.push("DocumentCuration");
              }
              if (isOPSEnabledForInvitation2.eligible) {
                allowedAICuration.push("OPSToIQCuration");
              }
              // Build metadata object
              const metadata = {
                AIData: {
                  allowedAICuration: allowedAICuration,
                  triggeredCuration: [],
                },
                ...(isOPSEnabledForInvitation2.eligible && {
                  opsData: {
                    opsCompanyId: isOPSEnabledForInvitation2.opsCompanyId,
                    opsCompanyName: isOPSEnabledForInvitation2.opsCompanyName,
                  },
                }),
              };
              // console.log("rec", rec);
              const data2 = {
                companyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : userSession?.company?.id,
                formId: formId,
                email: rec?.User?.email,
                status: FormInvitationStatus.Invited,
                created_by: session?.user?.id,
                updated_by: session?.user?.id,
                durationFrom: finalFromDate,
                durationTo: finalToDate,
                ParentCompanyMappingId: rec.Id,
                parentcompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : session?.company?.id,
                metadata: metadata,
                reviewerDetails: reviewerDetails,
                reviewerParentCompanyId: reviewerParentCompanyId,
              };
              return data2;
            }));
          } else {
            const isOPSEnabledForInvitation3 = await canEnableOPSToIQCuration(
              userSession?.accessToken,
              formId,
              userSession?.company?.id,
            );
            formInvitationDataArray = (await Promise.all(
              result.data?.User?.map(async (rec: any) => {
              const hasFormFullAICuration = hasFullAICuration(
                userSession?.accessToken,
                formId,
              );
              const hasDocCuration = hasDocumentCuration(
                userSession?.accessToken,
                formId,
              );
              const hasWebCuration_ = hasWebCuration(
                userSession?.accessToken,
                formId,
              );

              // Build allowedAICuration array based on available capabilities
              const allowedAICuration: string[] = [];
              if (hasWebCuration_) {
                allowedAICuration.push("WebCuration");
              }
              if (hasDocCuration) {
                allowedAICuration.push("DocumentCuration");
              }
              if (isOPSEnabledForInvitation3.eligible) {
                allowedAICuration.push("OPSToIQCuration");
              }
              // Build metadata object
              const metadata = {
                AIData: {
                  allowedAICuration: allowedAICuration,
                  triggeredCuration: [],
                },
                ...(isOPSEnabledForInvitation3.eligible && {
                  opsData: {
                    opsCompanyId: isOPSEnabledForInvitation3.opsCompanyId,
                    opsCompanyName: isOPSEnabledForInvitation3.opsCompanyName,
                  },
                }),
              };
              // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
              // Build interimCheck object with carry-forward suggestions flag
              const interimCheck = {
                isCarryForwardAsSuggestionsInvitation:
                  isCarryForwardAsSuggestionsEnabled(
                    userSession?.accessToken,
                    formId,
                    companyDetails?.Company[0]?.metadata as CompanyMetadata,
                  ),
              };

              // Build ReviewerDetails for existing users (if reviewer specified)
              let reviewerDetails: ReviewerDetails = null;
              let reviewerParentCompanyId: string | null = null;
              const formEntry = data.userForm[0]; // Assuming single form for existing user
              if (formEntry?.reviewerEmail && formEntry?.reviewerFullName) {
                // Check if reviewer exists in the allReviewerUsers list (existing or newly created)
                const existingReviewer = allReviewerUsers.find(
                  (r: any) =>
                    choosemethodForMultiple(r.email, "decryptForMultiple") ===
                    formEntry.reviewerEmail,
                );
                if (existingReviewer) {
                  // Check if this reviewer was newly created or already existed
                  const isNewReviewer = !existingReviewers.some(
                    (existing: any) => existing.id === existingReviewer.id,
                  );

                  reviewerDetails = {
                    id: existingReviewer.id,
                    name: formEntry.reviewerFullName,
                    email:
                      choosemethodForMultiple(
                        formEntry.reviewerEmail,
                        "encryptformultiple",
                      ) ?? "",
                    isNewReviewer: isNewReviewer,
                  };
                  // Find reviewer's ParentCompanyMapping ID
                  const reviewerMapping =
                    userParentCompanymappingData.data.ParentCompanyMapping.find(
                      (x: any) =>
                        x.UserId === existingReviewer.id &&
                        x.CompanyId ===
                          (session?.user?.role === AppRoles.Consultant
                            ? selectedFormParentCompanyId
                            : userSession?.company?.id) &&
                        x.ParentCompanyId ===
                          (session?.user?.role === AppRoles.Consultant
                            ? selectedFormParentCompanyId
                            : session?.company?.id) &&
                        x.ParentUserId ===
                          (session?.user?.role === AppRoles.Consultant
                            ? parentUserId
                            : session?.user?.id),
                    );
                  if (reviewerMapping) {
                    reviewerParentCompanyId = reviewerMapping.Id;
                  }
                }
              }

              let parentCompanyMappingId =
                userParentCompanymappingData.data.ParentCompanyMapping.filter(
                  (x: any) =>
                    x.AddressId ===
                      (Getlocation.length > 0 &&
                      Getlocation[0] != null &&
                      Getlocation[0] !== ""
                        ? Getlocation[0]
                        : null) &&
                    x.CompanyId ===
                      (session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : userSession?.company?.id) &&
                    x.ParentCompanyId ===
                      (session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id) &&
                    x.UserId === rec.id &&
                    x.ParentUserId ===
                      (session?.user?.role === AppRoles.Consultant
                        ? parentUserId
                        : session?.user?.id),
                )[0].Id;
              return {
                companyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : userSession?.company?.id,
                formId: formId,
                email: rec?.email,
                status: FormInvitationStatus.Invited,
                created_by: session?.user?.id,
                updated_by: session?.user?.id,
                durationFrom: finalFromDate,
                durationTo: finalToDate,
                ParentCompanyMappingId: parentCompanyMappingId,
                parentcompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : session?.company?.id,
                metadata: metadata,
                interimCheck: interimCheck,
                reviewerDetails: reviewerDetails,
                reviewerParentCompanyId: reviewerParentCompanyId,
              };
            }) || []) as FormInvitation_Insert_Input[]) || [];
          }
          const resultFormInvitation = await insertFormInvitation({
            variables: {
              object: formInvitationDataArray,
            },
          });

          let isCarryForwardApiHit: boolean = false;
          if (
            !shouldDisableCarryForward &&
            !!lastInvitationDataQuery?.data?.User
          )
            lastInvitationDataQuery?.data?.User?.forEach((items: any) => {
              if (items?.Company?.LastFormInvitation.length > 0) {
                if (
                  (items?.Company?.LastFormInvitation[0]?.FormInvitations
                    .length > 0 ||
                    items?.Company?.LastFormInvitationWithoutUserId[0]
                      ?.FormInvitations.length > 0) &&
                  isCarryForwardApiHit == false
                ) {
                  isCarryForwardApiHit = true;
                }
              }
            });

          if (
            resultFormInvitation &&
            resultFormInvitation?.data?.insert_FormInvitation?.returning
          ) {
            //#region for AI Functionality
            formDetails =
              resultFormInvitation?.data?.insert_FormInvitation?.returning.map(
                (inviteItems) => {
                  const hasAnyAICapabilities = isFormAIEnabled(
                    userSession?.accessToken,
                    inviteItems?.formId,
                  );
                  const aiData = getFormAIPlans(
                    userSession?.accessToken,
                    inviteItems?.formId,
                  );
                  const transformedAIData =
                    aiData.length > 0
                      ? [
                          {
                            formId: inviteItems?.formId,
                            docWithAI: hasFullAICuration(
                              userSession?.accessToken,
                              inviteItems?.formId,
                            ), // Both DocumentCuration + WebCuration
                            onlyDoc:
                              hasDocumentCuration(
                                userSession?.accessToken,
                                inviteItems?.formId,
                              ) &&
                              !hasWebCuration(
                                userSession?.accessToken,
                                inviteItems?.formId,
                              ), // Only DocumentCuration
                          },
                        ]
                      : [];
                  return {
                    isAIForm: hasAnyAICapabilities,
                    AIData: transformedAIData,
                  };
                },
              ) as invitationFormDetails[];

            // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
            const precedenceResult = getCarryForwardPrecedence(
              resultFormInvitation?.data?.insert_FormInvitation?.returning ||
                [],
            );
            // [TRADITIONAL CARRY-FORWARD] Only execute if precedence allows it
            if (
              !shouldDisableCarryForward &&
              !precedenceResult.shouldSkipTraditionalCarryForward &&
              recommendationNewFormDetails.length > 0 &&
              isCarryForwardApiHit
            ) {
              let bodyobject = {
                iscarryforwardImplemented: recommendationNewFormDetails,
                insertFormInvitationResult:
                  resultFormInvitation.data?.insert_FormInvitation?.returning,
                lastInvitationDataQuery: lastInvitationDataQuery?.data?.User,
              };

              await fetch("/warp/api/carry-forward-assessment-data-userwise", {
                method: "POST",
                body: JSON.stringify(bodyobject),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: userSession?.accessToken ?? "",
                },
              });
            }
            // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
            if (
              precedenceResult.hasCarryForwardSuggestions &&
              isCarryForwardApiHit
            ) {
              // Process carry-forward suggestions using the centralized service

              await processMultipleInvitations(
                precedenceResult.carryForwardSuggestionsInvitations,
                {
                  accessToken: userSession?.accessToken ?? "",
                  globalMasterData: userSession?.GlobalMaster,
                },
              );
            }

            const processingInvitation =
              resultFormInvitation?.data?.insert_FormInvitation?.returning.filter(
                (items) => items.status == FormInvitationStatus.Processing,
              );
            const invitedStatusInvitation =
              resultFormInvitation?.data?.insert_FormInvitation?.returning
                .filter((items) => items.status == FormInvitationStatus.Invited)
                .map((items) => {
                  return {
                    invitationId: items.id,
                    // isNormalInvitation: !isFormAIEnabled(
                    //   session?.accessToken,
                    //   items.formId
                    // ),
                    companyId: items?.companyId,
                    formId: items?.formId,
                    platformId: session?.platform?.id,
                    reviewerDetails: (items as any)?.reviewerDetails,
                  };
                });
            if (!!processingInvitation && processingInvitation.length > 0) {
              const bulkInsertionData: FormSubmission_Insert_Input[] = [];
              // const webCurationInsertInput: WebCuration_Insert_Input[] = [];
              processingInvitation?.forEach((items) => {
                bulkInsertionData.push({
                  invitationId: items?.id,
                  isActive: true,
                });
                // webCurationInsertInput.push({
                //   formInvitationId: items?.id,
                //   status: WebDataCurationStatus.Processing,
                //   triggeredByUserId: session?.user?.id,
                //   startAt: new Date(),
                // });
              });
              const formSubmissionQueryInput = bulkInsertionData.map(
                (item) => ({
                  invitationId: { _eq: item.invitationId },
                  isActive: { _eq: item.isActive },
                }),
              );

              const formSubmissionResult = await getFormSubmissionByInvitations(
                {
                  variables: {
                    where: formSubmissionQueryInput,
                  },
                },
              );

              const isFormSubmissionExists =
                formSubmissionResult.data &&
                formSubmissionResult?.data?.FormSubmission.length > 0;

              // If data already exist to FormSubmission table then do not insert again.
              if (!isFormSubmissionExists) {
                await bulkInsertFormSubmission({
                  variables: {
                    formSubmissionInput: bulkInsertionData,
                  },
                });
              }

              //AITODO: remove commented code
              // const webCurationInsertion = await insertWebCuration({
              //   variables: {
              //     webCurationInsertInput: webCurationInsertInput,
              //   },
              // });
              // const formInvitationData = processingInvitation?.map((items) => {
              //   return {
              //     company_id: items?.companyId,
              //     form_id: items?.formId,
              //     form_invitation_id: items?.id,
              //     web_curation_id:
              //       !!webCurationInsertion?.data?.insert_WebCuration
              //         ?.returning &&
              //       webCurationInsertion?.data?.insert_WebCuration?.returning
              //         .length > 0
              //         ? webCurationInsertion?.data?.insert_WebCuration?.returning.filter(
              //             (curationItems) =>
              //               curationItems?.formInvitationId == items?.id
              //           )[0]?.id
              //         : "",
              //   };
              // });
              // if (!!formInvitationData && formInvitationData.length > 0) {
              //   await callAIAPI(formInvitationData[0]);
              // }
            }
            if (
              !!invitedStatusInvitation &&
              invitedStatusInvitation.length > 0 &&
              isSelfAssign !== true
            ) {
              if (invitedStatusInvitation.length > 0) {
                const bulkInsertionData: FormSubmission_Insert_Input[] = [];
                const emailInviteData = invitedStatusInvitation
                  // .filter((items) => !items.isNormalInvitation)
                  .map((invitedItems) => {
                    bulkInsertionData.push({
                      invitationId: invitedItems?.invitationId,
                      isActive: true,
                    });
                    return {
                      invitationId: String(invitedItems?.invitationId),
                      isInternalUSer: true,
                      emailType: [
                        AIEmailTemplates.AINewFormInvitation,
                        AIEmailTemplates.AINewOnboarding,
                      ],
                    };
                  }) as AIEmailInvitation[];

                const formSubmissionQueryInput = bulkInsertionData.map(
                  (item) => ({
                    invitationId: { _eq: item.invitationId },
                    isActive: { _eq: item.isActive },
                  }),
                );

                const formSubmissionResult =
                  await getFormSubmissionByInvitations({
                    variables: {
                      where: formSubmissionQueryInput,
                    },
                  });

                const isFormSubmissionExists =
                  formSubmissionResult.data &&
                  formSubmissionResult?.data?.FormSubmission.length > 0;

                // If data already exist to FormSubmission table then do not insert again.
                if (!isFormSubmissionExists) {
                  await bulkInsertFormSubmission({
                    variables: {
                      formSubmissionInput: bulkInsertionData,
                    },
                  });
                }

                // if (emailInviteData.length > 0 && isAIUser === true) {
                // await fetch("/warp/api/AI/email-invitation", {
                //   method: "POST",
                //   headers: {
                //     "content-type": "application/json",
                //   },
                //   body: JSON.stringify(emailInviteData),
                // });
                // }
              }
              // send data to API for company email invitation.
              for (const items of invitedStatusInvitation) {
                try {
                  await fetch("/warp/api/khaitan-email-invitation", {
                    method: "POST",
                    headers: {
                      "content-type": "application/json",
                    },
                    body: JSON.stringify({
                      id: items?.invitationId,
                      type: "ExistingReportingFormInvitation",
                      companyId: session?.company?.id,
                      formId: formId,
                      NewUser: true,
                      platformId: session?.platform?.id,
                    }),
                  });
                } catch (error) {
                  console.error(`[Khaitan Email] Failed to send for invitation ${items?.invitationId}:`, error);
                }
              }

              // Send Reviewer email (new functionality - isolated) - Only triggers if reviewer exists and has data
              for (const items of invitedStatusInvitation) {
                if (items?.reviewerDetails && items?.reviewerDetails?.email) {
                  try {
                    const emailType = items?.reviewerDetails?.isNewReviewer
                      ? "ReviewerReportingFormInvitation"
                      : "ExistingReviewerReportingFormInvitation";

                    await fetch("/warp/api/Reviewer-email-invitation", {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                      },
                      body: JSON.stringify({
                        id: items?.invitationId,
                        type: emailType,
                        companyId:
                          session?.user?.role === AppRoles.Consultant
                            ? selectedFormParentCompanyId
                            : session?.company?.id,
                        formId: formId,
                        NewUser: items?.reviewerDetails?.isNewReviewer,
                        platformId: session?.platform?.id,
                      }),
                    });
                  } catch (error) {
                    console.error(
                      `[Reviewer Email] Failed to send for invitation ${items?.invitationId}:`,
                      error
                    );
                  }
                }
              }
            }
            
            if (
              !!invitedStatusInvitation &&
              invitedStatusInvitation.length > 0 &&
              isSelfAssign == true
            ) {
              // Send Reviewer email (new functionality - isolated) - Only triggers if reviewer exists and has data
              for (const items of invitedStatusInvitation) {
                if (items?.reviewerDetails && items?.reviewerDetails?.email) {
                  try {
                    // Use different email type based on whether reviewer is new or existing
                    const emailType = items?.reviewerDetails?.isNewReviewer
                      ? "ReviewerReportingFormInvitation"
                      : "ExistingReviewerReportingFormInvitation";

                    await fetch("/warp/api/Reviewer-email-invitation", {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                      },
                      body: JSON.stringify({
                        id: items?.invitationId,
                        type: emailType,
                        companyId:
                          session?.user?.role === AppRoles.Consultant
                            ? selectedFormParentCompanyId
                            : session?.company?.id,
                        formId: formId,
                        NewUser: items?.reviewerDetails?.isNewReviewer,
                        platformId: session?.platform?.id,
                      }),
                    });
                  } catch (error) {
                    console.error(
                      `[Reviewer Email] Failed to send for invitation ${items?.invitationId}:`,
                      error
                    );
                    // Continue without throwing - reviewer email is optional
                  }
                }
              }
            }
            //#endregion
            reset({
              userForm: [
                {
                  location: "",
                  email: "",
                  fullName: "",
                  mobileNumber: "",
                  reviewerFullName: "",
                  reviewerEmail: "",
                },
              ],
            });
          }
          cancel();
          setIsLoading(false);
          setSubmitProgress(false);
          _success = true;
        }
      } else {
        postParentMessage(sendInvitationValidationFailedMessage());
        setIsLoading(false);
        setSubmitProgress(false);
        cancel();
      }
    } catch (error) {
      postParentMessage(sendInvitationValidationFailedMessage());
      setIsLoading(false);
      setSubmitProgress(false);
      cancel();
    } finally {
      setIsSubmitting(false);
    }
    if (_success === true) {
      postParentMessage(
        sendInvitationResponseMessage(
          true,
          formDetails,
          FormTypesPage.Report,
        ),
      );
    }
  };

  const formSubmitted = async () => {
    if (isSubmitting) {
      console.log("Form submission already in progress");
      return;
    }
    await new Promise<void>((resolve) => {
      setIsSubmitting(true);
      resolve();
    });
    await handleCaptchaValidation();
  };

  const renderMessage = () => {
    if (formIdError) return "Select Reporting Framework is required";
    if (oldInvitationSubmitted) return "Past assessment is not submitted yet for this questionnaire.";
    if (recomNewAssessmentPeriod) return "Please select the historical months only for assessment period.";
    if (assessmentPeriodRequired) return "Reporting period selection is mandatory";
    if (assessmentPeriodError) return "Select valid period.";
    if (existingEmailName) return `${existingEmailName} already exists.`;
    if (duplicateEmail) return `${duplicateEmail} is used multiple times.`;
    if (existingReviewerName) return `Reviewer ${existingReviewerName} already exists.`;
    return null;
  };

  const message = renderMessage();

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        void handleSubmit(formSubmitted)(e as any);
      }}
    >
      <Spinner visible={submitProgress} />
      <Stack gap="md" px={15}>
        {dynamicCompanyForm.map((item, index) => {
          return (
            <Stack key={item.id} style={{ gap: 0 }}>
              <input
                type="hidden"
                {...register(`userForm.${index}.location`)}
              />
              <Text
                className={classes.commonMargin}
                mb={8}
                mt={0}
                fz={12}
                c="#444"
              >
                Full Name and Email of Person Who Will Report
                <span style={{ color: "#FF0000" }}>*</span>
              </Text>

              {/* {IsFormLocationHide === false ? (
                <Controller
                  render={({
                    field: { name, onBlur, onChange, ref, value },
                  }) => (
                    <Select
                      placeholder="Search or select location"
                      defaultValue={defaultLocation}
                      searchable
                      nothingFoundMessage="No options"
                      data={locationList ?? []}
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(val) => {
                        onChange(val);
                      }}
                      //value={value}
                    />
                  )}
                  name={`userForm.${index}.location`}
                  control={control}
                />
              ) : (
                <></>
              )} */}
              <Stack gap={0}>
                <Controller<FormValues>
                  control={control}
                  name={`userForm.${index}.fullName` as const}
                  render={({ field }) => {
                    const selectedUser = filterUserNameList.find(
                      (u) => u.name === field.value,
                    );
                    return (
                      <MultiSelect
                        classNames={{ option: "darkDropdown"}}
                        withCheckIcon={false}
                        data={(() => {
                          const base = Array.from(
                            new Map(
                              filterUserNameList.map((item) => [
                                item.id,
                                { value: item.id, label: item.name },
                              ])
                            ).values()
                          );
                          const trimmed = (
                            userSearchValueByIndex[index] || ""
                          ).trim();
                          if (
                            trimmed &&
                            !base.some(
                              (o) =>
                                o.label === trimmed || o.value === trimmed
                            )
                          ) {
                            base.push({
                              value: `__create__:${trimmed}`,
                              label: `+ Create "${trimmed}"`,
                            });
                          }
                          return base;
                        })()}
                        placeholder="Full Name*"
                        searchable
                        searchValue={userSearchValueByIndex[index] || ""}
                        onSearchChange={(v) =>
                          setUserSearchValueByIndex((prev) => ({
                            ...prev,
                            [index]: v,
                          }))
                        }
                        value={
                          IsNewUserAdded === true
                            ? tempNewUser
                              ? [tempNewUser?.id]
                              : []
                            : selectedUser
                            ? [selectedUser.id]
                            : []
                        }
                        onChange={(value) => {
                          setIsSelfAssign(false);
                          setExistingEmailName(null);
                          setIsLoading(false);
                          setSubmitProgress(false);

                          clearErrors(`userForm.${index}.fullName`);

                          if (!value || value.length === 0) {
                            setIsNewUserAdded(false);
                            settempNewUser(null);
                            setValue(`userForm.${index}.fullName`, "");
                            setValue(`userForm.${index}.email`, "");
                            clearErrors(`userForm.${index}.email`);
                            return;
                          }

                          const picked = value[0];

                          if (picked && picked.startsWith("__create__:")) {
                            const query = picked.slice("__create__:".length);
                            const nameRegex = /^[A-Za-z\s]+$/;
                            if (!nameRegex.test(query)) {
                              setValue(`userForm.${index}.fullName`, query);
                              setError(`userForm.${index}.fullName`, {
                                type: "manual",
                                message:
                                  "Full Name must contain only alphabets",
                              });
                              return;
                            }
                            const newItem = {
                              id: `new-${Date.now()}`,
                              name: query,
                              email: "",
                            };
                            setFilterUserNameList((prev) => [
                              ...prev,
                              newItem,
                            ]);
                            setValue(
                              `userForm.${index}.fullName`,
                              newItem.name,
                            );
                            setValue(`userForm.${index}.email`, "");
                            clearErrors(`userForm.${index}.fullName`);
                            setIsNewUserAdded(true);
                            settempNewUser(newItem);
                            setUserSearchValueByIndex((prev) => ({
                              ...prev,
                              [index]: "",
                            }));
                            return;
                          }

                          const selectedUser = filterUserNameList.find(
                            (u) => u.id === picked,
                          );

                          if (selectedUser) {
                            const nameRegex = /^[A-Za-z\s]+$/;
                            if (!nameRegex.test(selectedUser.name)) {
                              setValue(
                                `userForm.${index}.fullName`,
                                selectedUser.name,
                              );
                              setError(`userForm.${index}.fullName`, {
                                type: "manual",
                                message:
                                  "Full Name must contain only alphabets",
                              });
                            } else {
                              if (selectedUser.id === session?.user?.id) {
                                setIsSelfAssign(true);
                              }
                              setIsNewUserAdded(false);
                              settempNewUser(null);
                              setValue(
                                `userForm.${index}.fullName`,
                                selectedUser.name,
                              );
                              setValue(
                                `userForm.${index}.email`,
                                selectedUser.email,
                              );
                              clearErrors(`userForm.${index}.fullName`);
                              clearErrors(`userForm.${index}.email`);
                            }
                          } else {
                            setValue(`userForm.${index}.fullName`, "");
                            setValue(`userForm.${index}.email`, "");
                          }
                        }}
                        maxValues={1}
                      />
                    );
                  }}
                />
                <Text
                  fz={12}
                  mt={5}
                  c="#FC4E4E"
                  style={{
                    minHeight: "20px",
                    display:
                      errors?.userForm && errors?.userForm[index]?.fullName
                        ? "block"
                        : "none",
                  }}
                >
                  {errors?.userForm && errors?.userForm[index]?.fullName
                    ? errors?.userForm[index]?.fullName?.message
                    : ""}
                </Text>
              </Stack>
              <Stack gap={0} mt={12}>
                <Controller
                  render={({ field }) => (
                    <TextInput
                      mt={0}
                      placeholder="Email id*"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        // Clear the error for this field when value changes
                        clearErrors(`userForm.${index}.email`);
                      }}
                    />
                  )}
                  name={`userForm.${index}.email`}
                  control={control}
                />
                {errors?.userForm && errors?.userForm[index]?.email && (
                  <Text fz={12} mt={5} c="#FC4E4E">
                    {errors?.userForm[index]?.email?.message}
                  </Text>
                )}
              </Stack>

              {/* Reviewer Section - Optional */}
              <Text mt={24} mb={12} fz={12} c="#444">
                Full Name and Email of Reviewer (Optional)
              </Text>

              <Stack gap={0}>
                <Controller<FormValues>
                  control={control}
                  name={`userForm.${index}.reviewerFullName` as const}
                  render={({ field }) => {
                    const selectedReviewer = filterReviewerNameList.find(
                      (u) => u.name === field.value,
                    );
                    const reporterFullName = watch(
                      `userForm.${index}.fullName`,
                    );

                    // Filter out the selected Reporter from Reviewer options
                    const availableReviewers = filterReviewerNameList.filter(
                      (reviewer) => reviewer.name !== reporterFullName,
                    );

                    return (
                      <MultiSelect
                        classNames={{ option: "darkDropdown"}}
                        withCheckIcon={false}
                        data={(() => {
                          const base = Array.from(
                            new Map(
                              availableReviewers.map((item) => [
                                item.id,
                                { value: item.id, label: item.name },
                              ])
                            ).values()
                          );
                          const trimmed = (
                            reviewerSearchValueByIndex[index] || ""
                          ).trim();
                          if (
                            trimmed &&
                            !base.some(
                              (o) =>
                                o.label === trimmed || o.value === trimmed
                            )
                          ) {
                            base.push({
                              value: `__create__:${trimmed}`,
                              label: `+ Create "${trimmed}"`,
                            });
                          }
                          return base;
                        })()}
                        placeholder="Full Name"
                        searchable
                        searchValue={reviewerSearchValueByIndex[index] || ""}
                        onSearchChange={(v) =>
                          setReviewerSearchValueByIndex((prev) => ({
                            ...prev,
                            [index]: v,
                          }))
                        }
                        value={
                          IsNewReviewerAdded === true
                            ? tempNewReviewer
                              ? [tempNewReviewer?.id]
                              : []
                            : selectedReviewer
                            ? [selectedReviewer.id]
                            : []
                        }
                        onChange={(value) => {
                          clearErrors(`userForm.${index}.reviewerFullName`);
                          setExistingReviewerName(null);

                          if (!value || value.length === 0) {
                            setIsNewReviewerAdded(false);
                            setTempNewReviewer(null);
                            setValue(`userForm.${index}.reviewerFullName`, "");
                            setValue(`userForm.${index}.reviewerEmail`, "");
                            clearErrors(`userForm.${index}.reviewerEmail`);
                            return;
                          }

                          const picked = value[0];

                          if (picked && picked.startsWith("__create__:")) {
                            const query = picked.slice("__create__:".length);
                            const nameRegex = /^[A-Za-z\s]+$/;
                            if (!nameRegex.test(query)) {
                              setValue(
                                `userForm.${index}.reviewerFullName`,
                                query,
                              );
                              setError(`userForm.${index}.reviewerFullName`, {
                                type: "manual",
                                message:
                                  "Full Name must contain only alphabets",
                              });
                              return;
                            }
                            const newItem = {
                              id: `new-reviewer-${Date.now()}`,
                              name: query,
                              email: "",
                            };
                            setFilterReviewerNameList((prev) => [
                              ...prev,
                              newItem,
                            ]);
                            setValue(
                              `userForm.${index}.reviewerFullName`,
                              newItem.name,
                            );
                            setValue(`userForm.${index}.reviewerEmail`, "");
                            clearErrors(`userForm.${index}.reviewerFullName`);
                            setIsNewReviewerAdded(true);
                            setTempNewReviewer(newItem);
                            setReviewerSearchValueByIndex((prev) => ({
                              ...prev,
                              [index]: "",
                            }));
                            return;
                          }

                          const selectedReviewer = filterReviewerNameList.find(
                            (u) => u.id === picked,
                          );

                          if (selectedReviewer) {
                            const nameRegex = /^[A-Za-z\s]+$/;
                            if (!nameRegex.test(selectedReviewer.name)) {
                              setValue(
                                `userForm.${index}.reviewerFullName`,
                                selectedReviewer.name,
                              );
                              setError(`userForm.${index}.reviewerFullName`, {
                                type: "manual",
                                message:
                                  "Full Name must contain only alphabets",
                              });
                            } else {
                              setIsNewReviewerAdded(false);
                              setTempNewReviewer(null);
                              setValue(
                                `userForm.${index}.reviewerFullName`,
                                selectedReviewer.name,
                              );
                              setValue(
                                `userForm.${index}.reviewerEmail`,
                                selectedReviewer.email,
                              );
                              clearErrors(`userForm.${index}.reviewerFullName`);
                              clearErrors(`userForm.${index}.reviewerEmail`);
                            }
                          } else {
                            setValue(`userForm.${index}.reviewerFullName`, "");
                            setValue(`userForm.${index}.reviewerEmail`, "");
                          }
                        }}
                        maxValues={1}
                      />
                    );
                  }}
                />
                <Text
                  fz={12}
                  mt={5}
                  c="#FC4E4E"
                  style={{
                    minHeight: "20px",
                    display:
                      errors?.userForm &&
                      errors?.userForm[index]?.reviewerFullName
                        ? "block"
                        : "none",
                  }}
                >
                  {errors?.userForm && errors?.userForm[index]?.reviewerFullName
                    ? errors?.userForm[index]?.reviewerFullName?.message
                    : ""}
                </Text>
              </Stack>

              <Stack gap={0} mt={12}>
                <Controller
                  render={({ field }) => (
                    <TextInput
                      mt={0}
                      placeholder="Email"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        clearErrors(`userForm.${index}.reviewerEmail`);
                        setExistingReviewerName(null);
                      }}
                    />
                  )}
                  name={`userForm.${index}.reviewerEmail`}
                  control={control}
                />
                {errors?.userForm && errors?.userForm[index]?.reviewerEmail && (
                  <Text fz={12} mt={5} c="#FC4E4E">
                    {errors?.userForm[index]?.reviewerEmail?.message}
                  </Text>
                )}
              </Stack>
            </Stack>
          );
        })}

        <>
          {message && (
            <Text fz={12}
                c="#FA5252"
                bg="#FFF5F5"
                p="8px 12px"
                m="4px 0"
                styles={{
                  root: {
                    border: "1px solid #FECACA",
                    borderRadius: "4px",
                  }
                }
              }
            >
              {message}
            </Text>
          )}
        </>
        <Group className={classes.actionButtons} justify="flex-end" gap="sm">
          <Button color="outlineBtn" onClick={cancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitProgress}
            color="solidBtn"
            loading={submitProgress}
          >
            {isSelfAssign ? "Start" : "Assign"}
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
export default CreateNewUserReports;
