import { yupResolver } from "@hookform/resolvers/yup";
import {
  ActionIcon,
  Box,
  Button,
  createStyles,
  Flex,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons";
import { useCaptchaValidationBeforeSubmit } from "@warp/client/hooks/google-invisible-recaptcha";
import Spinner from "@warp/client/layouts/Spinner";
import {
  FormInvitation_Insert_Input,
  FormSubmission_Insert_Input,
  InputMaybe,
  ParentCompanyMapping_Insert_Input,
  User_Insert_Input,
  WebCuration_Insert_Input,
} from "@warp/graphql/generated/types";
import { useBulkInsertFormSubmissionMutation } from "@warp/graphql/mutations/generated/bulk-insert-form-submission";
import { useBulkinsertwebCurationMutation } from "@warp/graphql/mutations/generated/bulk-insert-webCuration";
import { useCreateParentCompanyMappingMutation } from "@warp/graphql/mutations/generated/create-ParentCompanyMapping";
import { useCreateUserMutation } from "@warp/graphql/mutations/generated/create-user";
import { useInsertFormInvitationNewCompanyMutation } from "@warp/graphql/mutations/generated/insert-form-invitation-new-company";
import { useGetaddressesbyuser_IdQuery } from "@warp/graphql/queries/generated/get-address-by-userid";
import { useGetCompanyDetailByIdQuery } from "@warp/graphql/queries/generated/get-companydetail-by-id";
import { useGetformInvitationdatabycustomwhereLazyQuery } from "@warp/graphql/queries/generated/get-formInvitation-data-by-custom-where";
import { useGetUserDetailByEmailLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-email";
import { useGetUserDetailByParentCompanyIdLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-parentcompany-id";
import { useGetUserDetailByPhoneLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-phone";
import {
  AIEmailInvitation,
  AIEmailTemplates,
  AppRoles,
  FormInvitationStatus,
  FormTypesPage,
  internalUserformFields,
  invitationFormDetails,
  WebDataCurationStatus,
} from "@warp/shared/constants/app.constants";
import { sanitiseArrayValues } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";
import {
  CompanyMetadata,
  getCarryForwardPrecedence,
  getFormAIPlans,
  hasDocumentCuration,
  hasFullAICuration,
  hasWebCuration,
  isCarryForwardAsSuggestionsEnabled,
  isFormAIEnabled,
} from "@warp/shared/utils/jwt-ai.util";
import InvitationNewUserSchema from "@warp/shared/validation/invitation-new-user.schema";
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
import {
  initialState,
  useSendInvitationStore,
} from "./send-invitation-assessment/store";
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
    background: theme.colors.darkNavy[0],
    color: theme.colors.gray[0],
    width: "20px",
    height: "20px",
    borderRadius: "100%",
    padding: "3px",
  },
  repeatFormIconMinus: {
    background: "#B72F31",
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

const CreateNewUserFields = () => {
  // Add carry-forward suggestions hook
  const { processMultipleInvitations } = useCarryForwardSuggestions();
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const [isLoading, setIsLoading] = useState(false);
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
  const [submitProgress, setSubmitProgress] = useState(false);
  const [duplicateEmail, setDuplicateEmail] = useState<string | null>(null);
  const [duplicatePhone, setDuplicatePhone] = useState(null);
  const [existingEmailName, setExistingEmailName] = useState(null);
  const [existingReviewerName, setExistingReviewerName] = useState<string | null>(null);
  const [oldInvitationSubmitted, setOldInvitationSubmitted] = useState(false);
  const [recomNewAssessmentPeriod, setRecomNewAssessmentPeriod] =
    useState(false);
  const [existingPhone, setExistingPhone] = useState(null);
  const insertParentCompanyMapping = useCreateParentCompanyMappingMutation()[0];
  const insertFormInvitation = useInsertFormInvitationNewCompanyMutation()[0];
  const insertUser = useCreateUserMutation()[0];
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
    [locationDetail]
  );
  const [defaultLocation, setDefaultLocation] = useState(
    locationList[0]?.value
  );
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
  
  type FormValues = {
    userForm: Array<{
      location: any;
      email: string;
      fullName: string;
      mobileNumber: string;
      reviewerFullName: string;
      reviewerEmail: string;
    }>;
  };
  
  const insertWebCuration = useBulkinsertwebCurationMutation()[0];
  const bulkInsertFormSubmission = useBulkInsertFormSubmissionMutation()[0];
  const forms_DetailBycustomWhere =
    useGetformInvitationdatabycustomwhereLazyQuery()[0];
  const getParentUserList = useGetUserDetailByParentCompanyIdLazyQuery()[0];
  const {
    register,
    control,
    handleSubmit,
    reset,
    formState: { errors },
    setValue,
    getValues,
    watch,
    trigger,
    clearErrors,
    setError,
  } = useForm({
    defaultValues: {
      userForm: [
        {
          location: defaultLocation || "",
          email: "",
          fullName: "",
          mobileNumber: "",
          reviewerFullName: "",
          reviewerEmail: "",
        },
      ],
    },
    resolver: yupResolver(InvitationNewUserSchema),
  });

  const {
    fields: dynamicCompanyForm,
    append,
    remove,
    prepend,
  } = useFieldArray({
    control,
    name: "userForm",
  });
  const addFormFields = async () => {
    // Validate current fields before adding a new form
    const isValid = await trigger("userForm");
    if (!isValid) {
      // If validation fails, return early and don't add new form
      return;
    }

    // Additional validation check for required fields
    const formValues = getValues();
    for (let i = 0; i < formValues.userForm.length; i++) {
      const user = formValues.userForm[i];
      if (!user.email || !user.fullName) {
        // Show error message or handle required fields not filled
        return;
      }
    }

    // If all validations pass, prepend new form (add at the top)
    prepend({
      location: defaultLocation || "",
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
    fromDate: dayjs(startDate || dayjs().startOf("month")).toDate(),
    toDate: dayjs(endDate || dayjs().endOf("month")).toDate(),
  });

  useEffect(() => {
    if (startDate && endDate) {
      setDuration({
        fromDate: dayjs(startDate).toDate(),
        toDate: dayjs(endDate).toDate(),
      });
      setRecomNewAssessmentPeriod(false);
      setAssessmentPeriodRequired(false);
    }
  }, [startDate, endDate]);

  const formInvitationWhereCondition: Record<string, any>[] = [];
  const [assessmentPeriodRequired, setAssessmentPeriodRequired] =
    useState(false);
  const [assessmentPeriodError, setAssessmentPeriodError] = useState(false);

  useEffect(() => {
    if (locationList.length > 0) {
      setDefaultLocation(locationList[0]?.value.toString());
    }
  }, [defaultLocation, locationList]);

  useEffect(() => {
    const fetchData = async () => {
      const newuserList: any = await getParentUserList({
        variables: {
          companyId:
            userSession?.user?.role === AppRoles.Consultant
              ? selectedFormParentCompanyId
              : userSession?.company?.id,
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

      // Set Reviewer lists (same as Reporter for now)
      setFilterReviewerEmailList(newData);
      setFilterReviewerNameList(filteredNames);
    };
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFormParentCompanyId]);

  const checkExistingEmails = async (emailIds: any[]) => {
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

  // Function to clear validation errors when form fields change
  const clearValidationErrors = () => {
    setExistingEmailName(null);
    setDuplicateEmail(null);
    setAssessmentPeriodError(false);
    setAssessmentPeriodRequired(false);
  };

  const InternalRequestCompanyResponce: any = userSession?.GlobalMaster?.filter(
    (a: any) => a.type === "InternalRequestCompany"
  );

  const chkFormId: any = InternalRequestCompanyResponce[0]?.data.filter(
    (a: any) => a.formId === formId && a.companyId === userSession?.company?.id
  );

  const IsFormLocationHide: any = chkFormId[0]?.IsFormLocationHide;

  const formSubmitted = async () => {
    captchaValidationBeforeSubmitHandler(async () => {
      let formDetails: invitationFormDetails[] = [];
      let isError = false;
      setIsLoading(true);
      setSubmitProgress(true);
      const formData = getValues();
      const data = {
        userForm: sanitiseArrayValues<internalUserformFields>(
          formData.userForm
        ).map((user) => ({
          ...user,
          reviewerFullName: user.reviewerFullName || "",
          reviewerEmail: user.reviewerEmail || "",
        })),
      };
      setValue("userForm", data.userForm);
      const isValidAllFields = await trigger();
      if (isValidAllFields) {
        try {
          // Validation for assessment period.
          if (
            !duration ||
            Date.parse(duration.fromDate.toString()) >
              Date.parse(duration.toDate.toString())
          ) {
            if (!duration) setAssessmentPeriodRequired(true);
            else setAssessmentPeriodError(true);
            isError = true;
            setSubmitProgress(false);
            return;
          } else {
            setAssessmentPeriodError(false);
            setAssessmentPeriodRequired(false);
          }

          let date = new Date();
          let previousMonthYear = "";
          if (date.getMonth() === 0) {
            previousMonthYear = date.getFullYear() - 1 + "-" + 12;
          } else {
            previousMonthYear = date.getFullYear() + "-" + date.getMonth();
          }
          let finalFromDate = duration.fromDate;
          // new Date(
          //   duration.fromDate.getFullYear(),
          //   duration.fromDate.getMonth(),
          //   1
          // );
          let finalToDate = duration.toDate;
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
            duration.toDate.getFullYear() +
            "-" +
            (duration.toDate.getMonth() + 1);

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

          // If startDate or endDate is null, show "Choose Assessment Period is Required" instead
          if (!startDate || !endDate) {
            setAssessmentPeriodRequired(true);
            setRecomNewAssessmentPeriod(false);
            isError = true;
            setSubmitProgress(false);
            setIsLoading(false);
            return;
          }

          if (
            currentMonthYear >= finalFromDate &&
            currentMonthYear >= finalToDate
          ) {
            setRecomNewAssessmentPeriod(false);
            //setOldInvitationSubmitted(false);
          } else {
            setRecomNewAssessmentPeriod(true);
            //setOldInvitationSubmitted(false);
            isError = true;
            setIsLoading(false);
            setSubmitProgress(false);
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
                return;
              }
            }
          }

          let emailList: InputMaybe<string | string[]> | undefined = [];
          emailList = data.userForm.map((rec: any) => {
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
            setSubmitProgress(false);
            return;
          } else {
            // Clear duplicate email error when no duplicates are found
            setDuplicateEmail(null);
          }

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

          for (
            let datalength = 0;
            datalength < data.userForm.length;
            datalength++
          ) {
            data.userForm[datalength].email = await choosemethod(
              String(data.userForm[datalength].email).toLowerCase().trim(),
              "encrypt"
            );
          }
          // Checking for existing email to db.
          let existingEmailData: any = [];
          const getEmails = data.userForm.map((rec: any) => {
            return rec.email;
          });
          const result = await checkExistingEmails(getEmails);
          if (result.error) {
            isError = true;
            return;
          }
          if (result.data && result.data.User.length > 0) {
            const decryptEmails: any = result?.data?.User?.map((rec: any) => {
              return choosemethodForMultiple(rec.email, "decryptForMultiple");
            });
            isError = true;
            setIsLoading(false);
            setSubmitProgress(false);
            setExistingEmailName(decryptEmails.join(", "));
            return;
          } else {
            setExistingEmailName(null);
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
                return;
              } else {
                setExistingReviewerName(null);
              }
            } else {
              setExistingReviewerName(null);
            }
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
          if (isError === false) {
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
                email: rec.email,
                phone: rec.mobileNumber,
                companyId:
                  userSession?.user?.role === AppRoles.Consultant
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

            for (let index = 0; index < data.userForm.length; index++) {
              const rec = data.userForm[index];
              if (rec.reviewerEmail && rec.reviewerFullName) {
                const encryptedEmail = await choosemethod(
                  rec.reviewerEmail.toLowerCase().trim(),
                  "encrypt"
                );
                reviewerEmailsToCheck.push(encryptedEmail);
                reviewerFormMap.set(rec.reviewerEmail.toLowerCase(), {
                  name: rec.reviewerFullName,
                  email: encryptedEmail,
                  index: index,
                });
                reviewerFormIndices.push(index);
              }
            }

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
            for (const rec of data?.userForm) {
              if (rec.reviewerEmail && rec.reviewerFullName) {
                const encryptedEmail = await choosemethod(
                  rec.reviewerEmail.toLowerCase().trim(),
                  "encrypt"
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
            }

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

            let parentUserId: any = null;
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
              parentUserId =
                parentUserList?.data?.ParentCompanyMapping[0]?.ParentUserId;
            }

            if (resultUser && resultUser?.data?.insert_User?.returning) {
              parentcompanymapping =
                resultUser?.data?.insert_User?.returning?.map((rec: any) => {
                  formInvitationWhereCondition.push({
                    _and: {
                      companyId: { _eq: userSession?.company?.id },
                      formId: { _eq: formId },
                      email: { _eq: rec.email },
                    },
                  });
                  return {
                    CompanyId:
                      userSession?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : userSession?.company?.id,
                    ParentCompanyId:
                      userSession?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                    UserId: rec.id,
                    ParentUserId:
                      userSession?.user?.role === AppRoles.Consultant
                        ? parentUserId
                        : session?.user?.id,
                    AddressId: insertInvitationData.filter(
                      (m: any) => m.email === rec.email
                    )[0].location,
                  };
                });
              
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
                    insertInvitationData.length > 0 &&
                    insertInvitationData[0].location != null &&
                    insertInvitationData[0].location !== ""
                      ? insertInvitationData[0].location
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
                //   await callAIAPI(formInvitationData);
                // }
              }
              if (
                resultParentCompany &&
                resultParentCompany?.data?.insert_ParentCompanyMapping
                  ?.returning
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

                formInvitationDataArray = reporterMappings?.map(
                  (rec: any, index: number) => {
                    const hasFormFullAICuration = hasFullAICuration(
                      userSession?.accessToken,
                      formId ? formId : undefined
                    );
                    // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                    // Build interimCheck object with carry-forward suggestions flag
                    const interimCheck = {
                      isCarryForwardAsSuggestionsInvitation:
                        isCarryForwardAsSuggestionsEnabled(
                          userSession?.accessToken,
                          formId as string,
                          companyDetails?.Company[0]
                            ?.metadata as CompanyMetadata
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

                        // Get encrypted email from reviewerFormMap (already encrypted earlier)
                        const encryptedReviewerEmail = reviewerFormMap.get(
                          formEntry.reviewerEmail.toLowerCase()
                        )?.email ?? "";

                        reviewerDetails = {
                          id: reviewerUser.id,
                          name: formEntry.reviewerFullName,
                          email: encryptedReviewerEmail,
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

                    // console.log("rec", rec);
                    const data2 = {
                      companyId:
                        userSession?.user?.role === AppRoles.Consultant
                          ? selectedFormParentCompanyId
                          : userSession?.company?.id,
                      formId: formId,
                      email: rec?.User?.email,
                      status:
                        forms_FormInvitationDetail?.data?.FormInvitation?.filter(
                          (items: Record<string, any>) =>
                            items.companyId == userSession?.company?.id &&
                            items.formId == formId &&
                            items?.email == rec?.User?.email
                        ).length == 0
                          ? hasFormFullAICuration
                            ? FormInvitationStatus.Processing
                            : FormInvitationStatus.Invited
                          : FormInvitationStatus.Invited,
                      created_by: session?.user?.id,
                      updated_by: session?.user?.id,
                      durationFrom: finalFromDate,
                      durationTo: finalToDate,
                      ParentCompanyMappingId: rec.Id,
                      parentcompanyId:
                        userSession?.user?.role === AppRoles.Consultant
                          ? selectedFormParentCompanyId
                          : session?.company?.id,
                      interimCheck: interimCheck,
                      reviewerDetails: reviewerDetails,
                      reviewerParentCompanyId: reviewerParentCompanyId,
                    };

                    return data2;
                  }
                );
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
                //#region for AI Functionality
                formDetails =
                  resultFormInvitation?.data?.insert_FormInvitation?.returning.map(
                    (inviteItems) => {
                      const hasAnyAICapabilities = isFormAIEnabled(
                        userSession?.accessToken,
                        inviteItems?.formId
                      );
                      const aiData = getFormAIPlans(
                        userSession?.accessToken,
                        inviteItems?.formId
                      );
                      const transformedAIData =
                        aiData.length > 0
                          ? [
                              {
                                formId: inviteItems?.formId,
                                docWithAI: hasFullAICuration(
                                  userSession?.accessToken,
                                  inviteItems?.formId
                                ), // Both DocumentCuration + WebCuration
                                onlyDoc:
                                  hasDocumentCuration(
                                    userSession?.accessToken,
                                    inviteItems?.formId
                                  ) &&
                                  !hasWebCuration(
                                    userSession?.accessToken,
                                    inviteItems?.formId
                                  ), // Only DocumentCuration
                              },
                            ]
                          : [];
                      return {
                        isAIForm: hasAnyAICapabilities,
                        AIData: transformedAIData,
                      };
                    }
                  ) as invitationFormDetails[];
                const processingInvitation =
                  resultFormInvitation?.data?.insert_FormInvitation?.returning.filter(
                    (items) => items.status == FormInvitationStatus.Processing
                  );
                const invitedStatusInvitation =
                  resultFormInvitation?.data?.insert_FormInvitation?.returning
                    .filter(
                      (items) => items.status == FormInvitationStatus.Invited
                    )
                    .map((items) => {
                      return {
                        invitationId: items.id,
                        isNormalInvitation: !isFormAIEnabled(
                          session?.accessToken,
                          items.formId
                        ),
                        companyId: items?.companyId,
                        formId: items?.formId,
                        platformId: session?.platform?.id,
                        reviewerDetails: (items as any)?.reviewerDetails,
                      };
                    });
                if (!!processingInvitation && processingInvitation.length > 0) {
                  const bulkInsertionData: FormSubmission_Insert_Input[] = [];
                  const webCurationInsertInput: WebCuration_Insert_Input[] = [];
                  processingInvitation?.forEach((items) => {
                    bulkInsertionData.push({
                      invitationId: items?.id,
                      isActive: true,
                    });
                    webCurationInsertInput.push({
                      formInvitationId: items?.id,
                      status: WebDataCurationStatus.Processing,
                      triggeredByUserId: session?.user?.id,
                      startAt: new Date(),
                    });
                  });
                  await bulkInsertFormSubmission({
                    variables: {
                      formSubmissionInput: bulkInsertionData,
                    },
                  });
                }
                if (
                  !!invitedStatusInvitation &&
                  invitedStatusInvitation.length > 0
                ) {
                  if (
                    invitedStatusInvitation.filter(
                      (items) => !items.isNormalInvitation
                    ).length > 0
                  ) {
                    const bulkInsertionData: FormSubmission_Insert_Input[] = [];
                    const emailInviteData = invitedStatusInvitation
                      .filter((items) => !items.isNormalInvitation)
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
                    await bulkInsertFormSubmission({
                      variables: {
                        formSubmissionInput: bulkInsertionData,
                      },
                    });
                    if (emailInviteData.length > 0) {
                      await fetch("/api/AI/email-invitation", {
                        method: "POST",
                        headers: {
                          "content-type": "application/json",
                        },
                        body: JSON.stringify(emailInviteData),
                      });
                    }
                  }
                  // send data to API for company email invitation.
                  // send data to API for company email invitation.
                  const normalInvitations = invitedStatusInvitation.filter((items) => items.isNormalInvitation);
                  if (normalInvitations.length > 0) {
                    const bulkInsertionData: FormSubmission_Insert_Input[] = normalInvitations.map((items) => ({
                      invitationId: items.invitationId,
                      isActive: true,
                    }));
                    await bulkInsertFormSubmission({
                      variables: { formSubmissionInput: bulkInsertionData },
                    });
                  }
                  for (const items of normalInvitations) {
                    try {
                      await fetch("/api/khaitan-email-invitation", {
                        method: "POST",
                        headers: {
                          "content-type": "application/json",
                        },
                        body: JSON.stringify({
                          id: items?.invitationId,
                          type: "FormInvitation",
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

                  // Send Reviewer email (new functionality - isolated) - Only triggers if reviewer exists and has data
                  for (const items of invitedStatusInvitation) {
                    if (items?.reviewerDetails && items?.reviewerDetails?.email) {
                      try {
                        const emailType = items?.reviewerDetails?.isNewReviewer
                          ? "ReviewerReportingFormInvitation"
                          : "ExistingReviewerReportingFormInvitation";

                        await fetch("/api/Reviewer-email-invitation", {
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

                // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                if (
                  resultFormInvitation &&
                  resultFormInvitation?.data?.insert_FormInvitation?.returning
                ) {
                  const precedenceResult = getCarryForwardPrecedence(
                    resultFormInvitation?.data?.insert_FormInvitation
                      ?.returning || []
                  );

                  if (precedenceResult.hasCarryForwardSuggestions) {
                    // Process carry-forward suggestions using the centralized service
                    await processMultipleInvitations(
                      precedenceResult.carryForwardSuggestionsInvitations,
                      {
                        accessToken: userSession?.accessToken ?? "",
                        globalMasterData: userSession?.GlobalMaster,
                      }
                    );
                  }
                }
                //#endregion
                reset({
                  userForm: [
                    {
                      location: defaultLocation || "",
                      email: "",
                      fullName: "",
                      mobileNumber: "",
                      reviewerFullName: "",
                      reviewerEmail: "",
                    },
                  ],
                });
              }
              postParentMessage(
                sendInvitationResponseMessage(
                  true,
                  formDetails,
                  FormTypesPage.Assessment
                )
              );
              setIsLoading(false);
              setSubmitProgress(false);
              cancel();
              cancel();
            }
          } else {
            postParentMessage(sendInvitationValidationFailedMessage());
            setIsLoading(false);
            setSubmitProgress(false);
          }
        } catch (error) {
          postParentMessage(sendInvitationValidationFailedMessage());
          setIsLoading(false);
          setSubmitProgress(false);
        }
      }
    }, "sendInviteIframe");
  };
  return (
    <form onSubmit={handleSubmit(formSubmitted)}>
      <Spinner visible={submitProgress} />
      <Stack spacing="md">
        {dynamicCompanyForm.map((item, index) => {
          return (
            <Stack spacing={0} key={item.id}>
              <input
                type="hidden"
                {...register(`userForm.${index}.location`)}
              />
              <Flex justify="space-between" align="baseline">
                <Text
                  className={classes.commonMargin}
                  mt={0}
                  mb={15}
                  size={12}
                  fw={400}
                  color="dark.3"
                >
                  {watch(`userForm.${index}.email`)
                    ? `User Information`
                    : "Enter New User Information"}
                </Text>
                <Flex align="center">
                  {!errors.userForm && index === 0 && (
                    <Group mb={0} position="right" spacing={2}>
                      <Text
                        size={12}
                        style={{ color: "#444444", fontWeight: "400" }}
                      >
                        Add User
                      </Text>
                      <ActionIcon color="#003B52" className="ActionIconStyles">
                        <IconPlus
                          className={classes.repeatFormIcon}
                          onClick={addFormFields}
                        />
                      </ActionIcon>
                    </Group>
                  )}
                  {index > 0 && (
                    <Group mb={0} position="right" style={{ gap: 0 }}>
                      <Text
                        size={12}
                        style={{
                          color: "#444444",
                          fontWeight: "400",
                          marginRight: "2px",
                        }}
                      >
                        Delete User
                      </Text>
                      <ActionIcon color="#B72F31" className="ActionIconStyles">
                        <IconMinus
                          onClick={() => remove(index)}
                          className={classes.repeatFormIconMinus}
                        />
                      </ActionIcon>
                    </Group>
                  )}
                </Flex>
              </Flex>

              {IsFormLocationHide === false ? (
                <Controller
                  render={({
                    field: { name, onBlur, onChange, ref, value },
                  }) => (
                    <Select
                      styles={(theme) => ({
                        item: {
                          fontSize: "12px",
                          fontWeight: 400,
                          color: "#666666",
                          "&[data-selected]": {
                            background:
                              "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                            color: "white",
                          },
                          "&:hover": {
                            background:
                              "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                            color: "white",
                          },
                        },
                      })}
                      mb={12}
                      placeholder="Search or select location"
                      defaultValue={defaultLocation}
                      searchable
                      nothingFound="No options"
                      data={locationList ?? []}
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(val) => {
                        onChange(val);
                        if (val) {
                          clearErrors(`userForm.${index}.location`);
                          clearValidationErrors();
                        }
                      }}
                      //value={value}
                    />
                  )}
                  name={`userForm.${index}.location`}
                  control={control}
                />
              ) : (
                <></>
              )}

              <Controller
                render={({ field }) => (
                  <TextInput
                    placeholder="Email id*"
                    {...field}
                    onChange={(e) => {
                      field.onChange(e);
                      if (e.target.value) {
                        clearErrors(`userForm.${index}.email`);
                        clearValidationErrors();
                      }
                    }}
                  />
                )}
                name={`userForm.${index}.email`}
                control={control}
              />
              {errors?.userForm && errors?.userForm[index]?.email && (
                <Text size={12} mt={5} color="#FC4E4E">
                  {errors?.userForm[index]?.email?.message}
                </Text>
              )}
              <Controller
                render={({ field }) => (
                  <TextInput
                    mt={12}
                    placeholder="Full Name of Primary Contact*"
                    {...field}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Only allow alphabets and spaces
                      const nameRegex = /^[A-Za-z\s]*$/;
                      if (nameRegex.test(value) || value === "") {
                        // If input is valid, update the field
                        field.onChange(value);
                        if (value) {
                          clearErrors(`userForm.${index}.fullName`);
                          clearValidationErrors();
                        }
                      } else {
                        // If invalid input, don't update the field and show error
                        setError(`userForm.${index}.fullName`, {
                          type: "manual",
                          message: "Full Name must contain only alphabets",
                        });
                      }
                    }}
                  />
                )}
                name={`userForm.${index}.fullName`}
                control={control}
              />
              {errors?.userForm && errors?.userForm[index]?.fullName && (
                <Text size={12} mt={5} color="#FC4E4E">
                  {errors?.userForm[index]?.fullName?.message}
                </Text>
              )}

              {/* Reviewer Section - Optional */}
              <Text mt={24} mb={12} size={12} color="#444">
                Full Name and Email of Reviewer (Optional)
              </Text>

              <Stack spacing={0}>
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
                        data={availableReviewers.map((item) => ({
                          value: item.id,
                          label: item.name,
                        }))}
                        styles={(theme) => ({
                          item: {
                            color: "#666666",
                            "&[data-selected]": {
                              background:
                                "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                              color: "white",
                            },
                            "&:hover": {
                              background:
                                "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%)",
                              color: "white",
                            },
                          },
                        })}
                        placeholder="Full Name"
                        searchable
                        creatable
                        value={
                          IsNewReviewerAdded === true
                            ? tempNewReviewer
                              ? [tempNewReviewer?.id]
                              : []
                            : selectedReviewer
                            ? [selectedReviewer.id]
                            : []
                        }
                        getCreateLabel={(query) => `+ Create "${query}"`}
                        onCreate={(query) => {
                          const nameRegex = /^[A-Za-z\s]+$/;
                          if (!nameRegex.test(query)) {
                            setTimeout(() => {
                              setValue(
                                `userForm.${index}.reviewerFullName`,
                                query,
                              );
                              setError(`userForm.${index}.reviewerFullName`, {
                                type: "manual",
                                message:
                                  "Full Name must contain only alphabets",
                              });
                            }, 0);
                            return null;
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

                          setTimeout(() => {
                            setValue(
                              `userForm.${index}.reviewerFullName`,
                              newItem.name,
                            );
                            setValue(`userForm.${index}.reviewerEmail`, "");
                            clearErrors(`userForm.${index}.reviewerFullName`);
                            setIsNewReviewerAdded(true);
                            setTempNewReviewer(newItem);
                          }, 0);

                          return { value: newItem.id, label: query };
                        }}
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

                          const selectedReviewer = filterReviewerNameList.find(
                            (u) => u.id === value[0],
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
                        maxSelectedValues={1}
                      />
                    );
                  }}
                />
                <Text
                  size={12}
                  mt={5}
                  color="#FC4E4E"
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

              <Stack spacing={0} mt={12}>
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
                  <Text size={12} mt={5} color="#FC4E4E">
                    {errors?.userForm[index]?.reviewerEmail?.message}
                  </Text>
                )}
              </Stack>

              {/* <Controller
                render={({ field }) => (
                  <TextInput
                    placeholder="Mobile Number of Primary Contact"
                    {...field}
                  />
                )}
                name={`userForm.${index}.mobileNumber`}
                control={control}
              />
              {errors?.userForm && errors?.userForm[index]?.mobileNumber && (
                <Text size={12} color="orange.5">
                  {errors?.userForm[index]?.mobileNumber?.message}
                </Text>
              )} */}

              {/* {dynamicCompanyForm.length > 1 && (
                <Group mb={10} position="right" spacing="sm">
                  <ActionIcon color="#003B52" className="ActionIconStyles">
                    <IconTrash
                      onClick={() => remove(index)}
                      className={classes.repeatFormIcon}
                    />
                  </ActionIcon>
                </Group>
              )} */}
            </Stack>
          );
        })}
        {/* {!errors.userForm && (
          <Group mb={10} position="right" spacing="sm">
            <Text size={12} style={{ color: "#444444", fontWeight: "400" }}>
              Add User
            </Text>
            <ActionIcon color="#003B52" className="ActionIconStyles">
              <IconPlus
                className={classes.repeatFormIcon}
                onClick={addFormFields}
              />
            </ActionIcon>
          </Group>
        )} */}

        {/* <Text size={12} style={{ color: "#444444", fontWeight: "400" }}>
          Select Period
        </Text>
        <Text size={12} color="dark.3">
          Select the historical period, month-to-month, of which the data is
          sought
        </Text>
        <Text size={12} color="dark.3">
          No partial months can be selected
        </Text> */}
        <Stack spacing="xs">
          {/* <Group
            sx={{ flexWrap: "nowrap" }}
            spacing={160}
            // spacing="xs"
            position="left"
          >
            <Text size={12} style={{ color: "#444444", fontWeight: "400" }}>
              From
            </Text>
            <Text size={12} style={{ color: "#444444", fontWeight: "400" }}>
              To
            </Text>
          </Group>
          <MonthYearRangePicker
            //onChange={setDuration}
            onChange={(val) => {
              setAssessmentPeriodError(false);
              setIsLoading(false);
              setDuration(val);
            }}
            value={duration}
          /> */}
          {
            // (oldInvitationSubmitted && (
            //   <Text size={12} color="orange.5">
            //     Past assessment is not submitted yet for this questionnaire.
            //   </Text>
            // )) ||
            (recomNewAssessmentPeriod && (
              <Text
                size={12}
                color="#FA5252"
                style={{
                  backgroundColor: "#FFF5F5",
                  border: "1px solid #FECACA",
                  borderRadius: "4px",
                  padding: "8px 12px",
                  margin: "4px 0",
                }}
              >
                Please select the historical months only for assessment period.
              </Text>
            )) ||
              (assessmentPeriodRequired && (
                <Text
                  size={12}
                  color="#FA5252"
                  style={{
                    backgroundColor: "#FFF5F5",
                    border: "1px solid #FECACA",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    margin: "4px 0",
                  }}
                >
                  Assessment period selection is mandatory
                </Text>
              )) ||
              (assessmentPeriodError && (
                <Text
                  size={12}
                  color="#FA5252"
                  style={{
                    backgroundColor: "#FFF5F5",
                    border: "1px solid #FECACA",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    margin: "4px 0",
                  }}
                >
                  Select valid period.
                </Text>
              )) ||
              (existingEmailName && (
                <Text
                  size={12}
                  color="#FA5252"
                  style={{
                    backgroundColor: "#FFF5F5",
                    border: "1px solid #FECACA",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    margin: "4px 0",
                  }}
                >
                  {existingEmailName} already exists.
                </Text>
              )) ||
              (existingReviewerName && (
                <Text
                  size={12}
                  color="#FA5252"
                  style={{
                    backgroundColor: "#FFF5F5",
                    border: "1px solid #FECACA",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    margin: "4px 0",
                  }}
                >
                  Reviewer {existingReviewerName} already exists.
                </Text>
              )) ||
              (duplicateEmail && (
                <Text
                  size={12}
                  color="#FA5252"
                  style={{
                    backgroundColor: "#FFF5F5",
                    border: "1px solid #FECACA",
                    borderRadius: "4px",
                    padding: "8px 12px",
                    margin: "4px 0",
                  }}
                >
                  {duplicateEmail} is used multiple times.
                </Text>
              ))
            // ||
            // (duplicatePhone && (
            //   <Text size={12} color="orange.5">
            //     Phone {duplicatePhone} is duplicate.
            //   </Text>
            // )) ||
            // (existingPhone && (
            //   <Text size={12} color="orange.5">
            //     Phone {existingPhone} is already exists.
            //   </Text>
            // ))
          }
        </Stack>
        <Group className={classes.actionButtons} position="right" spacing="sm">
          <Button color="outlineBtn" onClick={cancel}>
            Cancel
          </Button>
          <Button
            type="submit"
            disabled={submitProgress}
            color="solidBtn"
            loading={submitProgress}
          >
            SEND REQUEST
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
const CreateNewUser = () => {
  return (
    <Box>
      <CreateNewUserFields />
    </Box>
  );
};
export default CreateNewUser;
