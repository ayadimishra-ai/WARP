import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useCaptchaValidationBeforeSubmit } from "@/modules/warp/packages/client/hooks/google-invisible-recaptcha";
import { useFromFileUpload } from "@/modules/warp/packages/client/hooks/use-form-file-upload";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import {
  CreateParentCompanyMappingMutationVariables,
  FormInvitation_Insert_Input,
  FormSubmission_Insert_Input,
  ParentCompanyMapping_Insert_Input,
  User_Insert_Input,
  WebCuration_Insert_Input,
} from "@/modules/warp/packages/graphql/generated/types";
import { useBulkInsertFormSubmissionMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-form-submission";
import { useBulk_Insert_SourceFilesMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-source-files";
import { useBulkinsertwebCurationMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-webCuration";
import { useCreateParentCompanyMappingMutation } from "@/modules/warp/packages/graphql/mutations/generated/create-ParentCompanyMapping";
import { useCreateUserMutation } from "@/modules/warp/packages/graphql/mutations/generated/create-user";
import { useInsertFormInvitationNewCompanyMutation } from "@/modules/warp/packages/graphql/mutations/generated/insert-form-invitation-new-company";
import { useGetaddressesbyuser_IdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-address-by-userid";
import { useGetCompanyDetailByIdQuery } from "@/modules/warp/packages/graphql/queries/generated/get-companydetail-by-id";
import { useGetExistingFormInvitationByUserAndAddressIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-existing-form-invitation-user";
import { useGetFormInvitationByFormIdAndEmailIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-invitation-by-form-id-and-email-id";
import { useGetformInvitationdatabycustomwhereLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-formInvitation-data-by-custom-where";
import { useGetLastInvitationAnswerDetailsForCompanyByUserIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-last-invitation-answer-details-for-company-by-user-id";
import { useGetLastInvitationAnswerDetailsForUserByUserIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-last-invitation-answer-details-for-user-by-user-id";
import { useGetParentCompanyByUserAndAddressIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-parentcompany-by-user and address-id";
import { useGetParentCompanyMappingByAddressIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-user-email-by-ids";
import { useGetUserDetailByEmailLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-email";
import { useGetUserDetailByParentCompanyIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-userdetail-by-parentcompany-id";
import {
  AIEmailInvitation,
  AIEmailTemplates,
  AppRoles,
  FormInvitationStatus,
  FormTypesPage,
  invitationFormDetails,
  RecommendationStatus,
  WebDataCurationStatus,
} from "@/modules/warp/packages/shared/constants/app.constants";
import {
  CompanyMetadata,
  getCarryForwardPrecedence,
  getFormAIPlans,
  hasFullAICuration,
  isCarryForwardAsSuggestionsEnabled,
  isFormAIEnabled,
} from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import {
  SendInvitationSelectExistingUserSchema,
  SendInvitationSelectExistingUserType,
} from "@/modules/warp/packages/shared/validation/send-invitation-select-existing-user.schema";
import dayjs from "dayjs";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { encryptionDecryption } from "../../../hooks/encryption-decryption";
import { useUserSession } from "../../../hooks/use-user-session";
import { useCarryForwardSuggestions } from "../../../services/carry-forward-suggestions.service";
import {
  cancelInvitationMessage,
  raraGetTokenDetails,
  sendInvitationResponseMessage,
  sendInvitationValidationFailedMessage,
} from "../../../services/platform-window-message.service";
import {
  initialState,
  useSendInvitationStore,
} from "./send-invitation-assessment/store";
const useStyles = createStyles((theme) => ({
  yearMonthPicker: {
    flexWrap: "nowrap",
  },
  actionButtons: {
    marginTop: 0,
  },
  rightSection: {
    width: "50%",
  },
}));
const UpdateExistingUserFields = ({}) => {
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();

  // Add carry-forward suggestions hook
  const { processMultipleInvitations } = useCarryForwardSuggestions();

  const userSession = useUserSession();
  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: userSession?.company?.id,
    },
  });

  const { choosemethodForMultiple, choosemethod } = encryptionDecryption();
  const getParentUserList = useGetUserDetailByParentCompanyIdLazyQuery()[0];
  const getUserList = useGetParentCompanyMappingByAddressIdLazyQuery()[0];
  const lastInvitationForCompanyData =
    useGetLastInvitationAnswerDetailsForCompanyByUserIdLazyQuery()[0];
  const lastInvitationForUserData =
    useGetLastInvitationAnswerDetailsForUserByUserIdLazyQuery()[0];
  const getExistingFromInvitationDetails =
    useGetExistingFormInvitationByUserAndAddressIdLazyQuery()[0];
  const [getSelectedLocation, setSelectedLocation] = useState("");
  const GetParentCompanyExists =
    useGetParentCompanyByUserAndAddressIdLazyQuery()[0];
  const [filterUserList, setFilterUserList] = useState([]);
  const [parentUserIdForInvition, setparentUserIdForInvition] = useState();
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
  const [reviewerSearchValue, setReviewerSearchValue] = useState("");
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");
  //const formId = useSendInvitationStore((store) => store.formId);
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
  const [submitProgress, setSubmitProgress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [existingReviewerName, setExistingReviewerName] = useState<string | null>(null);
  const [clickcount, setclickcount] = useState(0);
  const insertFormInvitation = useInsertFormInvitationNewCompanyMutation()[0];
  const getFormInvitation =
    useGetFormInvitationByFormIdAndEmailIdLazyQuery()[0];
  const insertWebCuration = useBulkinsertwebCurationMutation()[0];
  const bulkInsertFormSubmission = useBulkInsertFormSubmissionMutation()[0];
  const forms_DetailBycustomWhere =
    useGetformInvitationdatabycustomwhereLazyQuery()[0];
  const getExistingEmailsForReviewer = useGetUserDetailByEmailLazyQuery()[0];
  const insertUser = useCreateUserMutation()[0];
  const insertParentCompanyMapping = useCreateParentCompanyMappingMutation()[0];
  const { uploadFile } = useFromFileUpload();
  const insertSourceFiles = useBulk_Insert_SourceFilesMutation()[0];
  const [getTokendetails, setTokendetails] = useState<{
    token?: string;
    serviceURL?: string;
  }>({});
  const searchParams = useSearchParams();
  const accessToken = searchParams?.get("accessToken");

  const { classes } = useStyles();
  const backToFormSelection = useSendInvitationStore(
    (store) => store.backToFormSelection
  );

  const locationDetail: any = useGetaddressesbyuser_IdQuery({
    variables: {
      userId: userSession?.user?.id,
      companyId:
        userSession?.user?.role === AppRoles.Consultant
          ? selectedFormParentCompanyId
          : userSession?.company?.id,
      // userSession?.company?.id,
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
    locationList[0]?.value || ""
  );

  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new"
  );

  const InternalRequestCompanyResponce: any = userSession?.GlobalMaster?.filter(
    (a: any) => a.type === "InternalRequestCompany"
  );

  const chkFormId: any = InternalRequestCompanyResponce[0]?.data.filter(
    (a: any) =>
      a.formId === formId &&
      (a.companyId === (userSession?.user?.role === AppRoles.Consultant)
        ? selectedFormParentCompanyId
        : userSession?.company?.id)
  );

  const IsFormLocationHide: any = chkFormId[0]?.IsFormLocationHide;

  let recommendationNewData;
  let recommendationNewFormDetails: any;
  if (!!recommendationNewResponce?.length && formId) {
    recommendationNewData = recommendationNewResponce;
  }
  const date = new Date();
  // const [duration, setDuration] = useState<MonthYearRangePickerValueType>({
  //   fromDate: dayjs(startDate || dayjs().startOf("month")).toDate(),
  //   toDate: dayjs(endDate || dayjs().endOf("month")).toDate(),
  // });

  let _fromDate = startDate
    ? dayjs(startDate).startOf("month").toDate()
    : undefined;
  let _toDate = endDate ? dayjs(endDate).endOf("month").toDate() : undefined;
  const defaultValues = useMemo(() => {
    const values = {
      duration: {
        fromDate: _fromDate,
        toDate: _toDate,
      },
      selectedLocationIds: defaultLocation,
      selectedCompanyIds: [],
      reviewerFullName: "",
      reviewerEmail: "",
    };
    return values;
  }, [_fromDate, _toDate, defaultLocation]);

  const cancel = useSendInvitationStore((store) => () => {
    store.init(initialState);
    postParentMessage(cancelInvitationMessage());
  });
  // let _fromDate = dayjs().startOf("month").toDate();
  // const _toDate = dayjs().endOf("month").toDate();
  const {
    setError,
    handleSubmit,
    control,
    reset,
    clearErrors,
    setValue,
    watch,
    formState: { errors },
  } = useForm<SendInvitationSelectExistingUserType>({
    resolver: yupResolver(SendInvitationSelectExistingUserSchema) as any,
    defaultValues,
    mode: "onSubmit",
  });

  // Make sure the form values update when the dates in the store change
  useEffect(() => {
    if (
      startDate !== undefined &&
      endDate !== undefined &&
      startDate &&
      endDate
    ) {
      const newFromDate = startDate;
      const newToDate = endDate;

      // Get current form values to preserve selectedEmailIds
      const currentValues = control._formValues || {};
      const currentselectedEmailIds = currentValues.selectedEmailIds || [];

      reset({
        duration: {
          fromDate: newFromDate,
          toDate: newToDate,
        },
        selectedLocationIds: defaultLocation,
        selectedEmailIds: currentselectedEmailIds,
      });
      setErrorMessage(null);
    }
  }, [startDate, endDate, reset, defaultLocation]);

  useEffect(() => {
    if (locationList.length > 0) {
      // const newuserList: any = userList.filter(
      //   (a) => a.addressId === locationList[0]?.value
      // );
      setDefaultLocation(locationList[0]?.value.toString());
      //setFilterUserList(newuserList);
      setSelectedLocation(locationList[0]?.value.toString());
    }
  }, [defaultLocation, locationList]);

  useEffect(() => {
    const fetchData = async () => {
      let parentUserId = null;
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
        setparentUserIdForInvition(
          parentUserList?.data?.ParentCompanyMapping[0]?.ParentUserId
        );
        parentUserId =
          parentUserList?.data?.ParentCompanyMapping[0]?.ParentUserId;
      }
      const newuserList: any = await getUserList({
        variables: {
          companyId:
            userSession?.user?.role === AppRoles.Consultant
              ? selectedFormParentCompanyId
              : userSession?.company?.id,
          // userSession?.company?.id,
          parentUserId:
            userSession?.user?.role === AppRoles.Consultant
              ? parentUserId
              : userSession?.user?.id,
          //userSession?.user?.id,
        },
        fetchPolicy: "no-cache",
      });

      // First get all addresses from newuserList
      const addresses = newuserList?.data?.Addresses || [];
      // Create location list from addresses
      const locationData = addresses.map((address: any) => ({
        value: address.id,
      }));

      // Get user mapping data
      const mappedData = newuserList?.data?.ParentCompanyMapping?.flatMap(
        (item: any) => {
          // Filter out users with 'Responder' role
          const hasResponderRole = item?.User?.UserRoles?.some(
            (userRole: any) => userRole.roleName === AppRoles.Responder
          );
          
          if (hasResponderRole) {
            return []; // Skip users with Responder role
          }
          
          return [{
            value: item?.User?.id,
            label: choosemethodForMultiple(
              item?.User?.email,
              "decryptForMultiple"
            ),
            addressId: item?.AddressId,
          }];
        }
      ) || [];
      //      Add session user to the mapped data for all locations
      if (userSession?.user?.id && userSession?.user?.email) {
        locationData.forEach((location: any) => {
          mappedData.push({
            value: userSession.user!.id,
            label: choosemethodForMultiple(
              userSession.user!.email,
              "decryptForMultiple"
            ),
            addressId: location.value,
          });
        });
      }
      //commented to resolve multilocation self assessement
      // Filter out duplicates based on user ID
      const distinctData = mappedData?.filter(
        (item: any, index: number, self: any[]) =>
          index ===
          self.findIndex(
            (t) => t.value === item.value && t.addressId === item.addressId
          )
      );
      setFilterUserList(distinctData || []);

      // Build reviewer lists from the same user data
      let reviewerData: any[] = [];

      // Add ParentCompanyMapping users for reviewers
      if (newuserList?.data?.ParentCompanyMapping) {
        reviewerData = [
          ...reviewerData,
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
                    "decryptForMultiple"
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

      // Filter and store reviewers with both name and email
      const filteredReviewerNames = reviewerData
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
              (t: any) => t.email === value.email && t.name === value.name
            )
        );

      setFilterReviewerEmailList(reviewerData);
      setFilterReviewerNameList(filteredReviewerNames);

      // Update location list with addresses
      if (locationData.length > 0) {
        setDefaultLocation(locationData[0].value.toString());
        setSelectedLocation(locationData[0].value.toString());
      }
    };
    fetchData();
  }, []);
  const clickHandler = (event: any) => {
    setclickcount(event.detail);
    if (event.detail == 1) {
      setclickcount(event.detail);
    }
  };
  const checkExistingFromInvitationDetails = async (
    selectedEmailIds: any[],
    addressId: any,
    formid: any,
    fromDate: Date,
    toDate: Date
  ) => {
    const getData = await getExistingFromInvitationDetails({
      variables: {
        userId: selectedEmailIds,
        addressId: addressId,
        companyId: userSession?.company?.id,
        formId: formid,
        durationFrom: fromDate,
        durationTo: toDate,
      },
    });
    return getData;
  };
  const checkParentCompanyExists = async (
    userId: any,
    parentUserId: any,
    addressId: any
  ) => {
    const { data, error } = await GetParentCompanyExists({
      variables: {
        userId: userId,
        parentUserId: parentUserId,
        addressId: addressId,
      },
    });
    return data;
  };
  const formInvitationWhereCondition: Record<string, any>[] = [];

  useEffect(() => {
    if (!getTokendetails.hasOwnProperty("token")) {
      postParentMessage(raraGetTokenDetails());
    }
    const handler = (event: MessageEvent) => {
      if (typeof event.data !== "string") return;
      try {
        const messageData = JSON.parse(event.data);
        if (messageData?.type === "snowkap-tokendetails") {
          setTokendetails({
            token: messageData.token,
            serviceURL: messageData.serviceurl,
          });
        }
      } catch {}
    };
    globalThis.addEventListener("message", handler);
    return () => globalThis.removeEventListener("message", handler);
  }, [getTokendetails]);

  const onSubmit = async (data: SendInvitationSelectExistingUserType) => {
    if (isSubmitting) {
      console.log("Form submission already in progress");
      return;
    }
    await new Promise<void>((resolve) => {
      setIsSubmitting(true);
      resolve();
    });
    captchaValidationBeforeSubmitHandler(async () => {
      let formDetails: invitationFormDetails[] = [];
      let isError = false;
      let _success = false;
      setSubmitProgress(true);
      // Check duration range
      // if (duration?.fromDate > data.duration.toDate) {
      //   isError = true;
      //   setError("duration", { message: "Select valid period" });
      //   setSubmitProgress(false);
      //   return;
      // }
      if (
        !data.duration ||
        Date.parse(data.duration.fromDate.toString()) >
          Date.parse(data.duration.toDate.toString())
      ) {
        if (!isError) {
          isError = true;
          setError("duration", {
            message:
              "Assessment period selected is invalid. Please select valid period.",
          });
          setSubmitProgress(false);
        }
        setIsSubmitting(false);
        return;
      }

      // Check if companies are selected first
      if (!data.selectedEmailIds || data.selectedEmailIds.length === 0) {
        if (!isError) {
          setSubmitProgress(false);
          isError = true;
          setErrorMessage("Select at-least one email to proceed");
        }
        setIsSubmitting(false);
        return;
      }
      if (clickcount === 1) {
        try {
          setSubmitProgress(true);

          let date = new Date();
          const previousMonthYear =
            date.getFullYear() + "-" + (date.getMonth() + 1);

          const fromMonthYear =
            data.duration.fromDate.getFullYear() +
            "-" +
            (data.duration.fromDate.getMonth() + 1);
          const toMonthYear =
            data.duration.toDate.getFullYear() +
            "-" +
            (data.duration.toDate.getMonth() + 1);

          const fromDate = new Date(fromMonthYear);
          const toDate = new Date(toMonthYear);
          const previousDate = new Date(previousMonthYear);

          let currentMonthYear = dayjs().startOf("month").toDate();

          currentMonthYear.setHours(currentMonthYear.getHours() + 5);
          currentMonthYear.setMinutes(currentMonthYear.getMinutes() + 30);

          //previousDate.setFullYear(date.getFullYear());
          // previousDate.setMonth(date.getMonth() + 1);
          let finalFromDate = data.duration.fromDate;
          // new Date(
          //   date.getFullYear(),
          //   data.duration.fromDate.getMonth(),
          //   1
          // );

          let finalToDate = data.duration.toDate;
          // new Date(
          //   date.getFullYear(),
          //   data.duration.toDate.getMonth() + 1,
          //   0
          // ); //last month
          finalFromDate.setHours(finalFromDate.getHours() + 5);
          finalFromDate.setMinutes(finalFromDate.getMinutes() + 30);

          finalToDate.setHours(finalToDate.getHours() + 5);
          finalToDate.setMinutes(finalToDate.getMinutes() + 30);

          let selectedUsersId: any = [];

          // Calculate financial year range (April to March)
          // const todayDayjs = dayjs();
          // const fiscalYearStart =
          //   todayDayjs.month() < 3
          //     ? dayjs(`${todayDayjs.year() - 1}-04-01`) // April 1st last year
          //     : dayjs(`${todayDayjs.year()}-04-01`); // April 1st this year
          // const fiscalYearEnd = dayjs(`${fiscalYearStart.year() + 1}-03-31`); // March 31st next year

          // // Check if dates are within the current financial year
          // const selectedStartMonth = dayjs(finalFromDate).startOf("month");
          // const selectedEndMonth = dayjs(finalToDate).endOf("month");

          // const isInFinancialYear =
          //   selectedStartMonth.valueOf() <= fiscalYearEnd.valueOf() &&
          //   selectedEndMonth.valueOf() >= fiscalYearStart.valueOf();

          if (
            currentMonthYear >= finalFromDate &&
            currentMonthYear >= finalToDate
          ) {
            let emails: any = filterUserList.filter(
              (x: any) =>
                x.addressId === getSelectedLocation &&
                data?.selectedEmailIds.find((eRec) => eRec === x.value)
            );

            emails.map((uRec: any) => {
              selectedUsersId.push(uRec.value);
            });

            let encryptedEmails: any = [];

            await emails.map((eRec: any) => {
              const emailCall = async () => {
                let encryptemail = await choosemethod(eRec?.label, "encrypt");
                encryptedEmails.push(encryptemail);
              };
              emailCall();
            });

            const response = await getFormInvitation({
              variables: {
                formId: formId,
                emailId: encryptedEmails,
              },
            })
              .then((rec) => {
                return rec.data;
              })
              .catch((error) => {
                console.log({ error });
              });

            if (!!response?.FormInvitation.length) {
              let unSubmittedForm: any = [];
              encryptedEmails.map((eRec: any) => {
                response?.FormInvitation.filter((rec) => {
                  if (rec.formId === formId && rec.email === eRec) {
                    unSubmittedForm.push(rec);
                  }
                });
              });

              if (!!unSubmittedForm.length) {
                if (!isError) {
                  isError = true;
                  setSubmitProgress(false);
                  setErrorMessage(
                    "Past assessment is not submitted yet for this questionnaire."
                  );
                  setSubmitProgress(false);
                }
                return;
              }
            }
          } else {
            if (!isError) {
              isError = true;
              setSubmitProgress(false);
              setErrorMessage(
                "Please select the historical months only for assessment period."
              );
              setSubmitProgress(false);
            }
            return;
          }
          // Validating existing data
          const result = await checkExistingFromInvitationDetails(
            data.selectedEmailIds,
            getSelectedLocation,
            formId,
            finalFromDate,
            finalToDate
          );
          // console.log({ result });
          if (result.error) {
            if (!isError) {
              isError = true;
              setErrorMessage(
                "Assessment is already taken for selected period"
              );
              setSubmitProgress(false);
            }
            return;
          }
          if (result.data && result.data.FormInvitation.length > 0) {
            if (!isError) {
              isError = true;
              setErrorMessage(
                "Assessment is already taken for selected period"
              );
              setSubmitProgress(false);
            }
            return;
          }
          if (isError === false) {
            setSubmitProgress(true);
            setErrorMessage(null);

            // Process reviewer if provided
            let reviewerDetails: any = null;
            let reviewerParentCompanyId: string | null = null;

            if (data.reviewerEmail && data.reviewerFullName) {
              // Check if this is a NEW reviewer (not selected from existing list)
              const isExistingReviewer = filterReviewerEmailList.some(
                (existingReviewer: any) =>
                  existingReviewer.email.toLowerCase() === data.reviewerEmail?.toLowerCase()
              );

              // Only validate if it's a NEW reviewer
              if (!isExistingReviewer) {
                // Encrypt reviewer email for validation
                const encryptedReviewerEmail = choosemethodForMultiple(
                  data.reviewerEmail.toLowerCase(),
                  "encryptformultiple"
                ) as string;

                // Check if NEW reviewer already exists in database
                const existingReviewerCheck = await getExistingEmailsForReviewer({
                  variables: {
                    newEmail: [encryptedReviewerEmail],
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
                        : userSession?.company?.id)
                  );

                  if (existingInSameCompany.length > 0) {
                    // Decrypt the existing reviewer emails to show in error message
                    const existingReviewerEmails = existingInSameCompany.map(
                      (user: any) =>
                        choosemethodForMultiple(user.email, "decryptForMultiple")
                    );
                    setExistingReviewerName(existingReviewerEmails.join(", "));
                    setSubmitProgress(false);
                    return;
                  }
                }
              }

              // Encrypt reviewer email
              const encryptedReviewerEmail = choosemethodForMultiple(
                data.reviewerEmail,
                "encryptformultiple"
              ) as string;

              // Check if reviewer already exists
              const existingReviewerQuery = await getExistingEmailsForReviewer({
                variables: {
                  newEmail: [encryptedReviewerEmail],
                },
              });

              let reviewerUserId: string;
              let isNewReviewer = false;

              if (
                existingReviewerQuery?.data?.User &&
                existingReviewerQuery.data.User.length > 0
              ) {
                // Reviewer exists
                reviewerUserId = existingReviewerQuery.data.User[0].id;
              } else {
                // Create new reviewer
                isNewReviewer = true;
                const newReviewerData: User_Insert_Input = {
                  name: data.reviewerFullName,
                  email: encryptedReviewerEmail,
                  phone: "",
                  companyId:
                    userSession?.user?.role === AppRoles.Consultant
                      ? selectedFormParentCompanyId
                      : userSession?.company?.id,
                  created_by: userSession?.user?.id,
                  updated_by: userSession?.user?.id,
                  UserRoles: {
                    data: {
                      roleName: AppRoles.Invitee,
                    },
                  },
                } as unknown as User_Insert_Input;

                const insertReviewerResult = await insertUser({
                  variables: {
                    input: [newReviewerData],
                  },
                });

                if (
                  !insertReviewerResult?.data?.insert_User?.returning ||
                  insertReviewerResult.data.insert_User.returning.length === 0
                ) {
                  setErrorMessage("Failed to create reviewer user");
                  setSubmitProgress(false);
                  return;
                }

                reviewerUserId =
                  insertReviewerResult.data.insert_User.returning[0].id;
              }

              // Create ParentCompanyMapping for reviewer if it doesn't exist
              const reviewerParentCompanyMapping: ParentCompanyMapping_Insert_Input =
                {
                  UserId: reviewerUserId,
                  CompanyId: userSession?.company?.id,
                  ParentCompanyId: userSession?.company?.id,
                  ParentUserId:
                    userSession?.user?.role === AppRoles.Consultant
                      ? parentUserIdForInvition
                      : userSession?.user?.id,
                  AddressId: getSelectedLocation,
                } as unknown as ParentCompanyMapping_Insert_Input;

              const insertParentCompanyMappingResult =
                await insertParentCompanyMapping({
                  variables: {
                    input: [reviewerParentCompanyMapping],
                  },
                });

              // Check if insertion was successful or if mapping already exists
              if (
                insertParentCompanyMappingResult?.data
                  ?.insert_ParentCompanyMapping?.returning &&
                insertParentCompanyMappingResult.data.insert_ParentCompanyMapping
                  .returning.length > 0
              ) {
                // New mapping created successfully
                reviewerParentCompanyId =
                  insertParentCompanyMappingResult.data.insert_ParentCompanyMapping.returning[0].Id;
              } else {
                // Mapping might already exist, query to find it
                const existingMapping = await GetParentCompanyExists({
                  variables: {
                    userId: [reviewerUserId],
                    parentUserId:
                      userSession?.user?.role === AppRoles.Consultant
                        ? parentUserIdForInvition
                        : userSession?.user?.id,
                    addressId: getSelectedLocation,
                  },
                });

                if (
                  existingMapping?.data?.ParentCompanyMapping &&
                  existingMapping.data.ParentCompanyMapping.length > 0
                ) {
                  reviewerParentCompanyId =
                    existingMapping.data.ParentCompanyMapping[0].Id;
                } else {
                  setErrorMessage(
                    "Failed to create or find parent company mapping for reviewer"
                  );
                  setSubmitProgress(false);
                  return;
                }
              }

              // Build reviewer details object
              reviewerDetails = {
                id: reviewerUserId,
                name: data.reviewerFullName,
                email:choosemethodForMultiple(
                          data.reviewerEmail,
                          "encryptformultiple",
                        ) ?? "",
                isNewReviewer: isNewReviewer,
              };
            }

            // Inserting FormInvitation data
            let formInvitationDataArray: FormInvitation_Insert_Input[] = [];
            // Inserting parent company mapping  data insertion
            let parentcompanymapping: CreateParentCompanyMappingMutationVariables =
              {
                input: [],
              };
            const getparentcompanydata: any = await checkParentCompanyExists(
              data.selectedEmailIds,
              userSession?.user?.role === AppRoles.Consultant
                ? parentUserIdForInvition
                : userSession?.user?.id,
              getSelectedLocation
            );

            const checkedData: any[] =
              getparentcompanydata?.ParentCompanyMapping?.map((rec: any) => {
                formInvitationWhereCondition.push({
                  _and: {
                    companyId: { _eq: userSession?.company?.id },
                    formId: { _eq: formId },
                    email: { _eq: rec?.User?.email },
                  },
                });
                return {
                  CompanyId: userSession?.company?.id,
                  ParentCompanyId: userSession?.company?.id,
                  UserId: rec.UserId, //,
                  ParentUserId: userSession?.user?.id,
                  AddressId: data.selectedLocationIds,
                  ParentCompanyMappingId: rec.Id,
                };
              });
            let forms_FormInvitationDetail: any = [];
            if (formInvitationWhereCondition.length > 0) {
              forms_FormInvitationDetail = await forms_DetailBycustomWhere({
                variables: {
                  where: { _or: formInvitationWhereCondition },
                },
              });
            }
            formInvitationDataArray = checkedData.map((item: any) => {
              const getemail: any = filterUserList.filter(
                (m: any) => m.value === item.UserId
              );
              let encryptemail = choosemethodForMultiple(
                getemail[0]?.label,
                "encryptformultiple"
              );
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
                    companyDetails?.Company[0]?.metadata as CompanyMetadata
                  ),
              };
              return {
                companyId:
                  userSession?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : userSession?.company?.id,
                formId: formId,
                email: encryptemail,
                status:
                  forms_FormInvitationDetail?.data?.FormInvitation?.filter(
                    (items: Record<string, any>) =>
                      items.companyId == userSession?.company?.id &&
                      items.formId == formId &&
                      items?.email == encryptemail
                  ).length == 0
                    ? hasFormFullAICuration
                      ? FormInvitationStatus.Processing
                      : FormInvitationStatus.Invited
                    : FormInvitationStatus.Invited,
                created_by: userSession?.user?.id,
                updated_by: userSession?.user?.id,
                durationFrom: finalFromDate,
                durationTo: finalToDate,
                parentcompanyId:
                  userSession?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : userSession?.company?.id,
                ParentCompanyMappingId: item.ParentCompanyMappingId,
                interimCheck: interimCheck,
                reviewerDetails: reviewerDetails,
                reviewerParentCompanyId: reviewerParentCompanyId,
              };
            });

            recommendationNewFormDetails =
              recommendationNewResponce[0]?.data?.filter(
                (rec: any) => rec.FormId === formId
              );

            let lastInvitationDataQuery: any = [];
            if (recommendationNewFormDetails.length > 0) {
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
              } else {
                lastInvitationDataQuery = await lastInvitationForCompanyData({
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

            const uniqueByCompanyId = formInvitationDataArray.filter(
              (item, index, self) =>
                index === self.findIndex((t) => t.companyId === item.companyId)
            );

            const resultFormInvitation = await insertFormInvitation({
              variables: {
                object: uniqueByCompanyId,
              },
            });
            let isCarryForwardApiHit: boolean = false;
            if (!!lastInvitationDataQuery?.data?.User)
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
                    return {
                      isAIForm: hasAnyAICapabilities,
                      AIData: aiData,
                    };
                  }
                ) as invitationFormDetails[];
              if (
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
                resultFormInvitation &&
                resultFormInvitation?.data?.insert_FormInvitation?.returning
              ) {
                const precedenceResult = getCarryForwardPrecedence(
                  resultFormInvitation?.data?.insert_FormInvitation
                    ?.returning || []
                );
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
                    }
                  );
                }
              }
              //#region for AI Functionality
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
                      isNormalInvitation:
                        (recommendationNewFormDetails.length > 0 &&
                          isCarryForwardApiHit) ||
                        !isFormAIEnabled(
                          userSession?.accessToken,
                          items.formId
                        ),
                      companyId: items?.companyId,
                      formId: items?.formId,
                      platformId: userSession?.platform?.id,
                      reviewerDetails: items?.reviewerDetails,
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
                    triggeredByUserId: userSession?.user?.id,
                    startAt: new Date(),
                  });
                });
                await bulkInsertFormSubmission({
                  variables: {
                    formSubmissionInput: bulkInsertionData,
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
                //   await replicateExistingSourceFileData(formInvitationData);
                // }
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
                  const emailInviteData = invitedStatusInvitation
                    .filter((items) => !items.isNormalInvitation)
                    .map((invitedItems) => {
                      return {
                        invitationId: String(invitedItems?.invitationId),
                        isInternalUSer: true,
                        emailType: [
                          AIEmailTemplates.AINewFormInvitation,
                          AIEmailTemplates.AINewOnboarding,
                        ],
                      };
                    }) as AIEmailInvitation[];
                  if (emailInviteData.length > 0) {
                    await fetch("/warp/api/AI/email-invitation", {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                      },
                      body: JSON.stringify(emailInviteData),
                    });
                  }
                }

                // Seed FormSubmission for all invited users (both normal and AI/email branches)
                const bulkInsertionData: FormSubmission_Insert_Input[] = invitedStatusInvitation.map((items) => ({
                  invitationId: items.invitationId,
                  isActive: true,
                }));
                if (bulkInsertionData.length > 0) {
                  await bulkInsertFormSubmission({
                    variables: { formSubmissionInput: bulkInsertionData },
                  });
                }

                // send data to API for company email invitation.
                const normalInvitations = invitedStatusInvitation.filter((itemsdata) => itemsdata.isNormalInvitation);
                for (const items of normalInvitations) {
                  try {
                    await fetch("/warp/api/khaitan-email-invitation", {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                      },
                      body: JSON.stringify({
                        id: items?.invitationId,
                        type: "FormInvitation",
                        companyId: userSession?.company?.id,
                        formId: formId,
                        NewUser: false,
                        platformId: userSession?.platform?.id,
                      }),
                    });
                  } catch (error) {
                    console.error(`[Khaitan Email] Failed to send for invitation ${items?.invitationId}:`, error);
                  }
                }

                // Send reviewer email invitation if reviewer exists
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
                            userSession?.user?.role === AppRoles.Consultant
                              ? selectedFormParentCompanyId
                              : userSession?.company?.id,
                          formId: formId,
                          NewUser: items?.reviewerDetails?.isNewReviewer,
                          platformId: userSession?.platform?.id,
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
            }
            cancel();
            reset();
            _success = true;

            setSubmitProgress(false);
          }
        } catch (error) {
          console.log("Send Invitation Submit Error", { error });
          //setErrorMessage("Something went wrong");
          postParentMessage(sendInvitationValidationFailedMessage());
          setSubmitProgress(false);
        } finally {
          setIsSubmitting(false);
        }
        if (_success === true) {
          postParentMessage(
            sendInvitationResponseMessage(
              _success,
              formDetails,
              FormTypesPage.Assessment
            )
          );
          setSubmitProgress(false);
        }
      } else {
        setIsSubmitting(false);
      }
    }, "sendInviteIframe");
  };
  const filterUserByAddress = async (addressId: any) => {
    // const userList: any = filterUserList;
    // if (userList.length > 0) {
    //   const newuserList: any = userList.filter(
    //     (a: any) => a.addressId === addressId
    //   );
    //   setFilterUserList(newuserList);
    // }
    setSelectedLocation(addressId);
  };

  // Add error handling to the onSubmit function
  const handleFormError = (
    errors: FieldErrors<SendInvitationSelectExistingUserType>
  ) => {
    captchaValidationBeforeSubmitHandler(async () => {
      console.log("Form validation failed with errors:", errors);
      setSubmitProgress(false);

      if (errors.duration?.fromDate || errors.duration?.toDate) {
        setErrorMessage("Assessment period selection is mandatory");
      }
    }, "sendInviteIframe");
  };

  return defaultLocation !== "" ? (
    <form onSubmit={handleSubmit(onSubmit, handleFormError)}>
      {/* <LoadingOverlay visible={submitProgress} /> */}
      <Spinner visible={submitProgress} />
      <Stack mt={12} gap="md">
        <Text fz={12} c="dark.3">
          Select one or multiple of the locations (registered on the snowkap)
          from the list
        </Text>
        {locationList !== undefined &&
        locationList !== null &&
        IsFormLocationHide === false ? (
          <Controller
            render={({ field: { name, onBlur, onChange, ref, value } }) => (
              <Select
                classNames={{ option: "darkDropdown"}}
                withCheckIcon={false}
                placeholder="Search or select location"
                searchable
                defaultValue={defaultLocation ?? ""}
                nothingFoundMessage="No options"
                data={locationList ?? []}
                ref={ref}
                onBlur={onBlur}
                onChange={(val) => {
                  filterUserByAddress(val);
                  onChange(val);
                }}
                //value={value}
              />
            )}
            name={`selectedLocationIds`}
            control={control}
          />
        ) : (
          <></>
        )}

        <Controller
          control={control}
          name="selectedEmailIds"
          //defaultValue={userSession?.user?.id ? [userSession.user.id] : []}
          defaultValue={[]}
          render={({ field, fieldState: { error } }) => {
            return (
              <Stack gap="xs">
                <MultiSelect
                  classNames={{ option: "darkDropdown"}}
                  withCheckIcon={false}
                  data={filterUserList.filter(
                    (x: any) => x.addressId === getSelectedLocation
                  )}
                  placeholder="Click to search or select partners"
                  searchable
                  clearable
                  {...field}
                  onChange={(val) => {
                    //setErrorMessage(null);
                    field.onChange(val);
                    clearErrors("selectedEmailIds");
                    if (val && val.length > 0) {
                      setErrorMessage(null);
                    }
                  }}
                  value={field.value}
                />
                {error && (
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
                  }}>
                    {error.message}
                  </Text>
                )}
              </Stack>
            );
          }}
        />

        {/* Reviewer Section - Optional */}
        <Text mt={24} fz={12} c="#444">
          Full Name and Email of Reviewer (Optional)
        </Text>

        <Stack gap={0}>
          <Controller<SendInvitationSelectExistingUserType>
            control={control}
            name="reviewerFullName"
            render={({ field }) => {
              const selectedReviewer = filterReviewerNameList.find(
                (u) => u.name === field.value
              );

              return (
                <MultiSelect
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
                  styles={(theme) => ({
                    option: {
                      color: "#666666",
                      "&[data-combobox-selected]": {
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
                  searchValue={reviewerSearchValue}
                  onSearchChange={setReviewerSearchValue}
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
                    clearErrors("reviewerFullName");
                    setExistingReviewerName(null);

                    if (!value || value.length === 0) {
                      setIsNewReviewerAdded(false);
                      setTempNewReviewer(null);
                      setValue("reviewerFullName", "");
                      setValue("reviewerEmail", "");
                      clearErrors("reviewerEmail");
                      return;
                    }

                    const picked = value[0];

                    if (picked && picked.startsWith("__create__:")) {
                      const query = picked.slice("__create__:".length);
                      const nameRegex = /^[A-Za-z\s]+$/;
                      if (!nameRegex.test(query)) {
                        setValue("reviewerFullName", query);
                        setError("reviewerFullName", {
                          type: "manual",
                          message: "Full Name must contain only alphabets",
                        });
                        return;
                      }
                      const newItem = {
                        id: `new-reviewer-${Date.now()}`,
                        name: query,
                        email: "",
                      };
                      setFilterReviewerNameList((prev) => [...prev, newItem]);
                      setValue("reviewerFullName", newItem.name);
                      setValue("reviewerEmail", "");
                      clearErrors("reviewerFullName");
                      setIsNewReviewerAdded(true);
                      setTempNewReviewer(newItem);
                      setReviewerSearchValue("");
                      return;
                    }

                    const selectedReviewer = filterReviewerNameList.find(
                      (u) => u.id === picked
                    );

                    if (selectedReviewer) {
                      const nameRegex = /^[A-Za-z\s]+$/;
                      if (!nameRegex.test(selectedReviewer.name)) {
                        setValue("reviewerFullName", selectedReviewer.name);
                        setError("reviewerFullName", {
                          type: "manual",
                          message: "Full Name must contain only alphabets",
                        });
                      } else {
                        setIsNewReviewerAdded(false);
                        setTempNewReviewer(null);
                        setValue("reviewerFullName", selectedReviewer.name);
                        setValue("reviewerEmail", selectedReviewer.email);
                        clearErrors("reviewerFullName");
                        clearErrors("reviewerEmail");
                      }
                    } else {
                      setValue("reviewerFullName", "");
                      setValue("reviewerEmail", "");
                    }
                  }}
                  maxValues={1}
                />
              );
            }}
          />
          {errors.reviewerFullName && (
            <Text fz={12} mt={5} c="#FC4E4E">
              {errors.reviewerFullName.message}
            </Text>
          )}
        </Stack>

        <Stack gap={0}>
          <Controller
            render={({ field }) => (
              <TextInput
                mt={0}
                placeholder="Email"
                {...field}
                onChange={(e) => {
                  field.onChange(e);
                  clearErrors("reviewerEmail");
                  setExistingReviewerName(null);
                }}
              />
            )}
            name="reviewerEmail"
            control={control}
          />
          {errors.reviewerEmail && (
            <Text fz={12} mt={5} c="#FC4E4E">
              {errors.reviewerEmail.message}
            </Text>
          )}
        </Stack>

        {/* <Text fz={12} style={{ color: "#444444", fontWeight: "400" }}>
          Select Period
        </Text>
        <Text fz={12} c="dark.3">
          Select the historical period, month-to-month, of which the data is
          sought
        </Text>
        <Text fz={12} c="dark.3">
          No partial months can be selected
        </Text> */}

        {/* <Controller
          control={control}
          name="duration"
          render={({ field, fieldState: { error } }) => {
            return (
              <Stack gap="xs">
                <Group
                  styles={{ root: { flexWrap: "nowrap" } }}
                  gap={160}
                  // gap="xs"
                  position="left"
                >
                  <Text
                    fz={12}
                    style={{ color: "#212529", fontWeight: "500" }}
                  >
                    From
                  </Text>
                  <Text
                    fz={12}
                    style={{ color: "#212529", fontWeight: "500" }}
                  >
                    To
                  </Text>
                </Group>
                <MonthYearRangePicker
                  // onChange={field.onChange}
                  onChange={(val) => {
                    setErrorMessage(null);
                    field.onChange(val);
                    setDuration(val);
                  }}
                  value={field.value}
                />
                {error && (
                  <Text fz={12} c="radioCheckBoxError.0">
                    {error.message}
                  </Text>
                )}
              </Stack>
            );
          }}
        /> */}

        {errorMessage && (
          <Text
            fz={12}
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
          }>
            {errorMessage}
          </Text>
        )}
        {existingReviewerName && (
          <Text
            fz={12}
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
          }>
            Reviewer {existingReviewerName} already exists.
          </Text>
        )}
        {/* {isSuccessError && (
              <Text fz={12} c="green">
                Assessment invitation send successfully.
              </Text>
            )} */}
        <Group className={classes.actionButtons} justify="flex-end" gap="sm">
          <Button color="outlineBtn" onClick={cancel}>
            Cancel
          </Button>
          {/* <Button color="outlineBtn" onClick={backToFormSelection}>
            Previous
          </Button> */}
          <Button
            color="solidBtn"
            type="submit"
            disabled={submitProgress}
            loading={submitProgress}
            // onClick={clickHandler}
            onClick={(e: any) => {
              clickHandler(e);
              console.log("Send Request button clicked");
              // The form's onSubmit handler will handle the submission
            }}
          >
            SEND REQUEST
          </Button>
        </Group>
      </Stack>
    </form>
  ) : (
    <></>
  );
};
const UpdateExistingUser = () => {
  return (
    <Box>
      <UpdateExistingUserFields />
    </Box>
  );
};

export default UpdateExistingUser;
