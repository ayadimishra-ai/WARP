import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  Group,
  MultiSelect,
  Select,
  Stack,
  Text,
} from "@mantine/core";
import { createStyles } from "@mantine/emotion";
import { useFromFileUpload } from "@/modules/warp/packages/client/hooks/use-form-file-upload";
import Spinner from "@/modules/warp/packages/client/layouts/Spinner";
import {
  CreateParentCompanyMappingMutationVariables,
  FormInvitation_Insert_Input,
  FormSubmission_Insert_Input,
} from "@/modules/warp/packages/graphql/generated/types";
import { useBulkInsertFormSubmissionMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-form-submission";
import { useBulk_Insert_SourceFilesMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-source-files";
import { useBulkinsertwebCurationMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-webCuration";
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
import {
  FormInvitationStatus,
  FormTypesPage,
  invitationFormDetails,
  RecommendationStatus,
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
import { Controller, useForm } from "react-hook-form";
import { MonthYearRangePickerValueType } from "../../../components/MonthYearPicker";
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
  // Add carry-forward suggestions hook
  const { processMultipleInvitations } = useCarryForwardSuggestions();

  const userSession = useUserSession();
  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: userSession?.company?.id,
    },
  });
  const locationDetail: any = useGetaddressesbyuser_IdQuery({
    variables: {
      userId: userSession?.user?.id,
      companyId: userSession?.company?.id,
    },
  });
  const locationList = useMemo(
    () =>
      locationDetail?.data?.Addresses?.length > 0
        ? locationDetail?.data?.Addresses?.map((item: any) => ({
            value: item.id,
            label: item.addressLable,
          }))
        : (locationDetail?.data?.AddressesByCompanyId?.map((item: any) => ({
            value: item.id,
            label: item.addressLable,
          })).filter((x: any) => x.label !== null) ?? []),
    [locationDetail]
  );
  const [defaultLocation, setDefaultLocation] = useState(
    locationList[0]?.value || ""
  );

  const { choosemethodForMultiple, choosemethod } = encryptionDecryption();
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
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");
  //const formId = useSendInvitationStore((store) => store.formId);
  const {
    formId,
    groupFormIds,
    parentCompanyId: selectedFormParentCompanyId,
  } = useSendInvitationStore((store) => ({
    formId: store.formId,
    groupFormIds: store.groupFormIds,
    parentCompanyId: store.parentCompanyId,
  }));
  const [submitProgress, setSubmitProgress] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [clickcount, setclickcount] = useState(0);
  const insertFormInvitation = useInsertFormInvitationNewCompanyMutation()[0];
  const getFormInvitation =
    useGetFormInvitationByFormIdAndEmailIdLazyQuery()[0];
  const insertWebCuration = useBulkinsertwebCurationMutation()[0];
  const bulkInsertFormSubmission = useBulkInsertFormSubmissionMutation()[0];
  const forms_DetailBycustomWhere =
    useGetformInvitationdatabycustomwhereLazyQuery()[0];
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

  const recommendationNewResponce: any = userSession?.GlobalMaster?.filter(
    (x: any) => x.type === "Recommendation_new"
  );

  const InternalRequestCompanyResponce: any =
    userSession?.GlobalMaster?.filter(
      (a: any) => a.type === "InternalRequestCompany"
    ) ?? [];

  const chkFormId: any =
    InternalRequestCompanyResponce?.[0]?.data?.filter(
      (a: any) =>
        a.formId === formId && a.companyId === userSession?.company?.id
    ) ?? [];

  const IsFormLocationHide: any = chkFormId?.[0]?.IsFormLocationHide ?? false;

  let recommendationNewData;
  let recommendationNewFormDetails: any;
  if (!!recommendationNewResponce?.length && formId) {
    recommendationNewData = recommendationNewResponce;
  }
  const date = new Date();
  const [duration, setDuration] = useState<MonthYearRangePickerValueType>({
    fromDate: dayjs()
      .startOf("month")
      .set("month", date.getMonth() - 1)
      .toDate(),
    toDate: dayjs()
      .endOf("month")
      .set("month", date.getMonth() - 1)
      .toDate(),
  });

  const cancel = useSendInvitationStore((store) => () => {
    store.init(initialState);
    postParentMessage(cancelInvitationMessage());
  });
  // let _fromDate = dayjs().startOf("month").toDate();
  // const _toDate = dayjs().endOf("month").toDate();
  const { setError, handleSubmit, control, reset } =
    useForm<SendInvitationSelectExistingUserType>({
      resolver: yupResolver(SendInvitationSelectExistingUserSchema) as any,
      defaultValues: {
        duration: {
          fromDate: duration?.fromDate,
          toDate: duration?.toDate,
        },
        selectedLocationIds: defaultLocation,
        selectedEmailIds: [],
      },
    });

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
      const newuserList: any = await getUserList({
        variables: {
          companyId: userSession?.company?.id,
          parentUserId: userSession?.user?.id,
        },
        fetchPolicy: "no-cache",
      });
      const newData = newuserList?.data?.ParentCompanyMapping?.map(
        (item: any) => ({
          value: item?.User?.id,
          label: choosemethodForMultiple(
            item?.User?.email,
            "decryptForMultiple"
          ),
          addressId: item?.AddressId,
        })
      );
      setFilterUserList(newData);
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
      !duration ||
      Date.parse(duration.fromDate.toString()) >
        Date.parse(duration.toDate.toString())
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

        //previousDate.setFullYear(date.getFullYear());
        // previousDate.setMonth(date.getMonth() + 1);
        let finalFromDate = fromDate;
        // new Date(
        //   date.getFullYear(),
        //   data.duration.fromDate.getMonth(),
        //   1
        // );

        let finalToDate = toDate;
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

        if (previousDate >= fromDate && previousDate >= toDate) {
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
            setErrorMessage("Assessment is already taken for selected period");
            setSubmitProgress(false);
          }
          return;
        }
        if (result.data && result.data.FormInvitation.length > 0) {
          if (!isError) {
            isError = true;
            setErrorMessage("Assessment is already taken for selected period");
            setSubmitProgress(false);
          }
          return;
        }
        if (isError === false) {
          setSubmitProgress(true);
          setErrorMessage(null);

          // Inserting FormInvitation data
          let formInvitationDataArray: FormInvitation_Insert_Input[] = [];
          // Inserting parent company mapping  data insertion
          let parentcompanymapping: CreateParentCompanyMappingMutationVariables =
            {
              input: [],
            };
          const getparentcompanydata: any = await checkParentCompanyExists(
            data.selectedEmailIds,
            userSession?.user?.id,
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
              companyId: userSession?.company?.id,
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
              parentcompanyId: userSession?.company?.id,
              ParentCompanyMappingId: item.ParentCompanyMappingId,
              interimCheck: interimCheck,
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

          const resultFormInvitation = await insertFormInvitation({
            variables: {
              object: formInvitationDataArray,
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
                  const formData =
                    recommendationNewFormDetails.length > 0 &&
                    isCarryForwardApiHit //Business Logic: When there's carry forward data AND the carry forward API was hit, we don't need AI data because the assessment will use previous data.
                      ? []
                      : hasAnyAICapabilities
                        ? aiData // If form has AI capabilities → Use AI plan data
                        : []; // If no AI capabilities → Use empty array
                  return {
                    isAIForm: hasAnyAICapabilities,
                    AIData: formData,
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
            const bulkInsertionData: FormSubmission_Insert_Input[] =
              resultFormInvitation.data!.insert_FormInvitation!.returning.map((item) => ({
                invitationId: item.id,
                isActive: true,
              }));
            const submissionResult = await bulkInsertFormSubmission({
              variables: { formSubmissionInput: bulkInsertionData },
            });
            if (submissionResult.errors) {
              console.error(
                "Failed to create FormSubmission entries",
                submissionResult.errors,
              );
              // throw new Error("Failed to create FormSubmission entries");
              /**
               * @Note : Avoid thowing error here as the main FormInvitation entries are created successfully and throwing error would trigger a rollback of the transaction, deleting those entries. Instead, log the error and continue, but set a flag to indicate that there was an issue with form submissions which can be used for monitoring and alerting.
               */
            }
          }
          cancel();
          reset();
          _success = true;

          // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
          if (
            resultFormInvitation &&
            resultFormInvitation?.data?.insert_FormInvitation?.returning
          ) {
            const precedenceResult = getCarryForwardPrecedence(
              resultFormInvitation?.data?.insert_FormInvitation?.returning || []
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

          setSubmitProgress(false);
        }
      } catch (error) {
        console.log("Send Invitation Submit Error", { error });
        setErrorMessage("Something went wrong");
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
            FormTypesPage.Report
          )
        );
        setSubmitProgress(false);
      }
    } else {
      setIsSubmitting(false);
    }
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

  return defaultLocation !== "" ? (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      {/* <LoadingOverlay visible={submitProgress} /> */}
      <Spinner visible={submitProgress} />
      <Stack mt={10} gap="md">
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
            {errorMessage}
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
            onClick={clickHandler}
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
const UpdateExistingUserReports = () => {
  return (
    <Box>
      <UpdateExistingUserFields />
    </Box>
  );
};

export default UpdateExistingUserReports;
