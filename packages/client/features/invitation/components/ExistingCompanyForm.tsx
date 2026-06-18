import { yupResolver } from "@hookform/resolvers/yup";
import {
  Box,
  Button,
  createStyles,
  Group,
  MultiSelect,
  Stack,
  Text,
} from "@mantine/core";
import { useCaptchaValidationBeforeSubmit } from "@warp/client/hooks/google-invisible-recaptcha";
import { useFromFileUpload } from "@warp/client/hooks/use-form-file-upload";
import Spinner from "@warp/client/layouts/Spinner";
import {
  CreateParentCompanyMappingMutationVariables,
  FormInvitation_Insert_Input,
  FormSubmission_Insert_Input,
  InsertcompanyformfundtypeMutationVariables,
  InsertInvitationConsultantMappingMutationVariables,
} from "@warp/graphql/generated/types";
import { useBulkInsertFormSubmissionMutation } from "@warp/graphql/mutations/generated/bulk-insert-form-submission";
import { useBulk_Insert_SourceFilesMutation } from "@warp/graphql/mutations/generated/bulk-insert-source-files";
import { useBulkinsertwebCurationMutation } from "@warp/graphql/mutations/generated/bulk-insert-webCuration";
import { useCreateParentCompanyMappingMutation } from "@warp/graphql/mutations/generated/create-ParentCompanyMapping";
import { useInsertcompanyformfundtypeMutation } from "@warp/graphql/mutations/generated/insert-company-form-fundtype";
import { useInsertFormInvitationMutation } from "@warp/graphql/mutations/generated/insert-form-invitation";
import { useInsertIntoSubmissionTableMutation } from "@warp/graphql/mutations/generated/insert-into-submission-table";
import { useInsertInvitationConsultantMappingMutation } from "@warp/graphql/mutations/generated/insert-invitation-consultant-mapping";
import { useGetAssessorConsultantMappingQuery } from "@warp/graphql/queries/generated/get-assessor-consultant-mapping";
import { useGetCompanyByParentCompanyIdAndPlatformIdQuery } from "@warp/graphql/queries/generated/get-company-by-parent-company-id-and-platform-id";
import { useGetcompanyfundtypeavailabilityQuery } from "@warp/graphql/queries/generated/get-company-fundtype-availability";
import {
  useGetCompanyDetailByIdLazyQuery,
  useGetCompanyDetailByIdQuery,
} from "@warp/graphql/queries/generated/get-companydetail-by-id";
import { useGetCompanyDetailByparentcompanyidLazyQuery } from "@warp/graphql/queries/generated/get-companydetail-by-parentcompanyid";
import { useGetExistingFormInvitationLazyQuery } from "@warp/graphql/queries/generated/get-existing-form-invitation";
import { useGetFormInvitationByFormIdLazyQuery } from "@warp/graphql/queries/generated/get-form-invitation-by-form-id";
import { useGetformInvitationdatabycustomwhereLazyQuery } from "@warp/graphql/queries/generated/get-formInvitation-data-by-custom-where";
import { useGetGlobalMasterByTypeQuery } from "@warp/graphql/queries/generated/get-global-master-by-type";
import { useGetglobalmasterdataforfundtypeQuery } from "@warp/graphql/queries/generated/get-globalmaster-data-for-fundtype";
import { useGetLastInvitationAnswerDetailsLazyQuery } from "@warp/graphql/queries/generated/get-last-invitation-answer-details";
import { useGetParentCompanyByCompanyAndParentCompanyIdLazyQuery } from "@warp/graphql/queries/generated/get-parentcompany-by-company-and-parentcompany-id";
import {
  AppRoles,
  FormInvitationStatus,
  FormTypesPage,
  invitationFormDetails,
  RecommendationStatus,
} from "@warp/shared/constants/app.constants";
import {
  canEnableOPSToIQCuration,
  CompanyMetadata,
  getCarryForwardPrecedence,
  hasDocumentCuration,
  hasFullAICuration,
  hasWebCuration,
  isCarryForwardAsSuggestionsEnabled,
  isFormAIEnabled,
} from "@warp/shared/utils/jwt-ai.util";
import {
  SendInvitationSelectExistingCompanySchema,
  SendInvitationSelectExistingCompanyType,
} from "@warp/shared/validation/send-invitation-select-existing-company.schema";
import dayjs from "dayjs";
import { concat } from "lodash";
import { useRouter } from "next/router";
import { useEffect, useMemo, useState } from "react";
import { Controller, FieldErrors, useForm } from "react-hook-form";
import { useUserSession } from "../../../hooks/use-user-session";
import { useCarryForwardSuggestions } from "../../../services/carry-forward-suggestions.service";
import {
  cancelInvitationMessage,
  raraGetTokenDetails,
  sendInvitationLoadingStartedMessage,
  sendInvitationResponseMessage,
  sendInvitationValidationFailedMessage,
} from "../../../services/platform-window-message.service";
import { isUserAllowedAIFeature } from "../../form/common-functions";
import { useSendInvitationStore } from "./send-invitation-assessment/store";
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
type parentcompanyMappingData = {
  CompanyId: string;
  parentcompanyId: string;
  ParentCompanyMappingId: string;
};
const ExistingCompanyFormFields = ({}) => {
  // Add carry-forward suggestions hook
  const { processMultipleInvitations } = useCarryForwardSuggestions();

  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");
  const formInvitationWhereCondition: Record<string, any>[] = [];
  const session = useUserSession();
  const forms_DetailBycustomWhere =
    useGetformInvitationdatabycustomwhereLazyQuery()[0];
  const { data: assessorConsultantMappingData } =
    useGetAssessorConsultantMappingQuery();
  const allConsultantIds =
    assessorConsultantMappingData?.AssessorConsultantMapping?.map(
      (d: any) => d.consultantCompanyId
    )?.filter((val: any, i: any, arr: any) => arr.indexOf(val) === i);

  const backToFormSelection = useSendInvitationStore(
    (store) => store.backToFormSelection
  );

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

  const { query } = useRouter();
  const { accessToken } = query;

  const cancel = () => {
    useSendInvitationStore.setState((state) => ({
      ...state,
      step: "selectExistingCompany",
      companyIds: [],
    }));
    postParentMessage(cancelInvitationMessage());
  };

  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: session?.company?.id,
    },
  });

  const { classes } = useStyles();

  const formParentCompanyId =
    session?.user?.role === AppRoles.Consultant
      ? selectedFormParentCompanyId
      : session?.company?.id;

  const { data: companyListData } =
    useGetCompanyByParentCompanyIdAndPlatformIdQuery({
      variables: {
        parentCompanyId: formParentCompanyId,
        platformId: session?.platform?.id,
        allConsultantCompanyIds: allConsultantIds,
      },
      fetchPolicy: "no-cache",
    });

  // Using formId and groupFormIds from the earlier store selection

  const globalMasterData = useGetglobalmasterdataforfundtypeQuery();
  const vcfundtypedata = useGetcompanyfundtypeavailabilityQuery({
    variables: {
      formId: formId,
      vcCompanyId:
        session?.user?.role === AppRoles.Consultant
          ? selectedFormParentCompanyId
          : session?.company?.id,
    },
  });
  let globaldata = globalMasterData?.data?.GlobalMaster[0]?.data?.filter(
    (x: any) =>
      x.companyId == session?.company?.id &&
      x.formId?.filter((d: any) => d == formId)?.length > 0
  );
  let secondformid: any = "";
  if (globaldata?.length > 0) {
    secondformid = globaldata[0]?.formId?.filter((d: any) => d !== formId)[0];
  }
  const vcfundtypedataforsecondform = useGetcompanyfundtypeavailabilityQuery({
    variables: {
      formId: secondformid,
      vcCompanyId:
        session?.user?.role === AppRoles.Consultant
          ? selectedFormParentCompanyId
          : session?.company?.id,
    },
  });
  // const groupId = useSendInvitationStore((store) => store.groupFormId);

  const getExistingFromInvitationDetails =
    useGetExistingFormInvitationLazyQuery()[0];
  const insertWebCuration = useBulkinsertwebCurationMutation()[0];
  const lastInvitationData = useGetLastInvitationAnswerDetailsLazyQuery()[0];
  const [submitProgress, setSubmitProgress] = useState(false);

  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  //const [clickcount, setclickcount] = useState(1);
  const [isSuccessError, setIsSuccessError] = useState(false);
  const today = new Date();
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
      selectedCompanyIds: [],
    };
    return values;
  }, [_fromDate, _toDate]);
  const { setError, handleSubmit, control, reset, clearErrors, formState } =
    useForm<SendInvitationSelectExistingCompanyType>({
      resolver: yupResolver(SendInvitationSelectExistingCompanySchema),
      defaultValues,
      mode: "onSubmit", // Ensure validation happens on submit
    });

  const insertFormInvitation = useInsertFormInvitationMutation()[0];
  const insertNewSubmissionMutation = useInsertIntoSubmissionTableMutation()[0];
  const insertInvitationConsultantMapping =
    useInsertInvitationConsultantMappingMutation()[0];
  const getCompanyDetailById = useGetCompanyDetailByIdLazyQuery()[0];
  const insertCompanyFormFundType = useInsertcompanyformfundtypeMutation()[0];
  const insertParentCompanyMapping = useCreateParentCompanyMappingMutation()[0];
  const useGetCompanyDetailByparentcompanyid =
    useGetCompanyDetailByparentcompanyidLazyQuery()[0];
  const bulkInsertFormSubmission = useBulkInsertFormSubmissionMutation()[0];
  const { uploadFile } = useFromFileUpload();
  const [getTokendetails, setTokendetails] = useState<{
    token?: string;
    serviceURL?: string;
  }>({});

  // Check if user is AI user and form is AI enabled
  const isAIUser = isUserAllowedAIFeature(accessToken as string);
  const isFormHasAIEnabled = isFormAIEnabled(
    session?.accessToken,
    formId ? formId : undefined
  );

  // Disable carryforward for AI users with AI-enabled forms
  const shouldDisableCarryForward = isAIUser && isFormHasAIEnabled;

  // Log whenever the form is reset or modified with new values
  useEffect(() => {
    console.log("Form reset or values changed");
  }, [reset]);

  // Make sure the form values update when the dates in the store change
  useEffect(() => {
    if (startDate !== undefined && endDate !== undefined) {
      const newFromDate = dayjs(startDate).startOf("month").toDate();
      const newToDate = dayjs(endDate).endOf("month").toDate();
      const currentValues = control._formValues || {};
      const currentSelectedCompanyIds = currentValues.selectedCompanyIds || [];

      reset({
        duration: {
          fromDate: newFromDate,
          toDate: newToDate,
        },
        selectedCompanyIds: currentSelectedCompanyIds,
      });
      setErrorMessage(null);
    }
  }, [startDate, endDate, reset]);
  const insertSourceFiles = useBulk_Insert_SourceFilesMutation()[0];

  const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
    variables: { type: "Recommendation_new" },
  });

  const getFormInvitation = useGetFormInvitationByFormIdLazyQuery()[0];

  let recommendationNewData;
  let recommendationNewFormDetails: any;

  if (!!recommendationNewResponce?.GlobalMaster?.length && formId) {
    recommendationNewData = recommendationNewResponce?.GlobalMaster;
  }
  const CheckIndustryDetails = async (companyId: string) => {
    const { data, error } = await getCompanyDetailById({
      variables: {
        id: companyId,
      },
    });
    return data;
  };
  const GetParentCompanyExists =
    useGetParentCompanyByCompanyAndParentCompanyIdLazyQuery()[0];
  const CompanyDetailByparentcompanyid = async (
    companyId: string,
    parentCompanyId: any
  ) => {
    const { data, error } = await useGetCompanyDetailByparentcompanyid({
      variables: {
        companyId: companyId,
        parentCompanyId: parentCompanyId,
      },
    });
    return data;
  };

  const checkExistingFromInvitationDetails = async (
    checkGroupOrFormid: any,
    fromDate: Date,
    toDate: Date,
    selectedCompanyIds: any[]
  ) => {
    try {
      const getData = await getExistingFromInvitationDetails({
        variables: {
          formId: checkGroupOrFormid,
          durationFrom: fromDate,
          durationTo: toDate,
          companyId: selectedCompanyIds,
          parentcompanyId:
            session?.user?.role === AppRoles.Consultant
              ? companyDetails?.Company[0].ParentCompany?.id
              : session?.company?.id,
        },
        fetchPolicy: "no-cache",
      }).catch((e) => {
        return e;
      });
      return getData;
    } catch (e) {
      console.log(e);
      return { error: true };
    }
  };

  const data = useMemo(() => {
    let consultantDetail: any = [];
    if (session?.user?.role === AppRoles.Inviter) {
      consultantDetail =
        companyDetails?.Company[0]?.AssessorConsultantMappings.filter(
          (rec: any) => rec.assessorCompanyId === session?.company?.id
        );
    }

    // adding condition for consultant and inviter.
    if (
      formId !== null &&
      formId === "012a2471-c0a3-46ea-b6a0-19c2d2bb6de5" &&
      session?.user?.role !== AppRoles.Consultant &&
      session?.user?.role !== AppRoles.Inviter
    ) {
      return (
        companyListData?.Company?.filter(
          (company) =>
            !!company?.primaryContact?.email && company?.IsManufacturing
        ).map((company) => ({ value: company.id, label: company.name })) ?? []
      );
    } else {
      return (
        companyListData?.Company?.filter(
          (company) =>
            !!company?.primaryContact?.email &&
            (session?.user?.role === AppRoles.Consultant // removing consultant company record.
              ? company.id !== session?.company?.id
              : company.id !== consultantDetail[0]?.consultantCompanyId)
        )
          .filter(
            (company) => !!company?.id && company?.id !== session?.company?.id
          )
          .map((company) => ({ value: company.id, label: company.name })) ?? []
      );
    }
  }, [
    companyListData,
    formId,
    session?.company?.id,
    session?.user?.role,
    companyDetails,
  ]);

  const userSession = useUserSession();

  const getGroupFormids = (GroupForms: any[]) => {
    let industry: any[] = [];
    let groupFormIds: any[] = [];
    const GroupData = GroupForms.map((index: any) => {
      groupFormIds = concat(groupFormIds, index.formId);
      const industryData: any =
        index?.Form?.Details?.industry?.length > 0 &&
        index?.Form?.Details?.industry?.map((x: any) => x);
      industry = concat(industry, industryData);
    });
    return { formId: groupFormIds, industry: industry };
  };

  const checkGroupOrFormid = () => {
    let newFormId: any = [];
    newFormId = concat(newFormId, formId);
    const getFormIds = getGroupFormids(groupFormIds);
    if (getFormIds?.formId?.length > 0) {
      const formArray = concat(getFormIds.formId, formId);
      return formArray;
    }
    return newFormId;
  };
  const checkIndustrySelected = async (companyId: any) => {
    let Final_formId = "";

    const data = await CheckIndustryDetails(companyId);

    const getFormIds = getGroupFormids(groupFormIds);
    if (
      getFormIds?.industry?.length > 0 &&
      (data?.Company[0]?.metadata ?? "") !== "" &&
      data?.Company[0]?.metadata?.industry !== ""
    ) {
      groupFormIds?.map((index: any) => {
        if (index?.Form?.Details?.industry?.length > 0) {
          if (
            index?.Form?.Details?.industry[0] ===
            data?.Company[0]?.metadata?.industry
          ) {
            Final_formId = index?.formId;
          }
        }
      });

      // if (data?.Company[0]?.metadata?.industry === "Agtech") {
      //   Final_formId = "c20eeb83-43a7-4bb4-9135-84c10b486ce6"; // Agtech
      // }

      // if (data?.Company[0]?.metadata?.industry === "Fintech") {
      //   Final_formId = "9d5c337b-303f-4af5-a830-75faeb5aef96"; // fintech
      // }
      return Final_formId !== "" ? Final_formId : formId;
    }

    // return groupId ?? "";
    return formId;
  };
  const checkParentCompanyExists = async (
    companyId: any,
    parentCompanyId: any
  ) => {
    const { data, error } = await GetParentCompanyExists({
      variables: {
        companyId: companyId,
        parentCompanyId: parentCompanyId,
      },
    });
    return data;
  };
  // const clickHandler = (event: any) => {
  //   setclickcount(event.detail);
  //   if (event.detail == 1) {
  //     setclickcount(event.detail);
  //   }
  // };

  useEffect(() => {
    if (!getTokendetails.hasOwnProperty("token")) {
      postParentMessage(raraGetTokenDetails());
    }

    globalThis.addEventListener("message", async (event: any) => {
      event.preventDefault();
      let messageData: any;
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          if (type === "snowkap-tokendetails") {
            setTokendetails({
              token: messageData.token,
              serviceURL: messageData.serviceurl,
            });
          }
        } catch (error) {}
      }
    });
  }, [getTokendetails]);

  const onSubmit = async (data: SendInvitationSelectExistingCompanyType) => {
    captchaValidationBeforeSubmitHandler(async () => {
      let formDetails: invitationFormDetails[] = [];
      setSubmitProgress(true);
      let isError = false;
      let _success = false;
      try {
        if (!formId) {
          if (!isError) {
            setSubmitProgress(false);
            isError = true;
            setErrorMessage("Please select an Assessment");
          }
          return;
        }

        // Check if companies are selected first
        if (!data.selectedCompanyIds || data.selectedCompanyIds.length === 0) {
          if (!isError) {
            setSubmitProgress(false);
            isError = true;
            setErrorMessage("Select atleast one company to proceed further");
          }
          return;
        }

        // Check duration range
        if (data.duration.fromDate > data.duration.toDate) {
          if (!isError) {
            setSubmitProgress(false);
            isError = true;
            setError("duration", {
              message:
                "Assessment period selected is invalid. Please select valid period.",
            });
          }
          return;
        }

        //if (!!recommendationNewFormDetails?.length) {
        // const newDate = new Date();
        // const previousMonthYear =
        //   newDate.getFullYear() + "-" + (newDate.getMonth() + 1);

        let currentMonthYear = dayjs().startOf("month").toDate();

        currentMonthYear.setHours(currentMonthYear.getHours() + 5);
        currentMonthYear.setMinutes(currentMonthYear.getMinutes() + 30);

        // const fromMonthYear =
        //   data.duration.fromDate.getFullYear() +
        //   "-" +
        //   (data.duration.fromDate.getMonth() + 1);
        // const toMonthYear =
        //   data.duration.toDate.getFullYear() +
        //   "-" +
        //   (data.duration.toDate.getMonth() + 1);

        // const fromDate = new Date(fromMonthYear);
        // const toDate = new Date(toMonthYear);
        // const previousDate = new Date(previousMonthYear);

        // let date = new Date();
        let finalFromDate = data.duration.fromDate;
        //  new Date(
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

        // Get emails of all selected companies
        const selectedCompanyEmails = data.selectedCompanyIds
          .map((companyId) => {
            const company = companyListData?.Company?.find(
              (c) => c.id === companyId
            );
            return {
              companyId: companyId,
              companyName: company?.name || "Unknown",
              email: company?.primaryContact?.email || "",
            };
          })
          .filter((item) => item.email !== "");

        // For now, we'll use the emails from the selected companies
        const selectedUserEmails = selectedCompanyEmails.map(
          (item) => item.email
        );

        // Check if there are any pending past assessments for the selected users
        const previousAssessmentCheck = await forms_DetailBycustomWhere({
          variables: {
            where: {
              _and: [
                { email: { _in: selectedUserEmails } }, // Use all selected emails
                { formId: { _eq: formId } },
                {
                  status: {
                    _in: [
                      FormInvitationStatus.Invited,
                      FormInvitationStatus.Draft,
                      FormInvitationStatus.Processing,
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
            isError = true;
            setErrorMessage(
              "Past assessment is not submitted yet for this questionnaire."
            );
            return;
          }
          const response = await getFormInvitation({
            variables: {
              formId: formId,
              companyId: data?.selectedCompanyIds,
            },
            fetchPolicy: "no-cache",
          })
            .then((rec) => {
              return rec.data;
            })
            .catch((error) => {
              console.log({ error });
            });

          if (!!response?.FormInvitation?.length) {
            let unSubmittedForm: any = [];
            data?.selectedCompanyIds?.map((cId) => {
              response?.FormInvitation?.filter((rec) => {
                if (rec.formId === formId && rec.companyId === cId) {
                  if (rec.status !== "Approved") {
                    unSubmittedForm.push(rec);
                  }
                }
              });
            });

            if (!!unSubmittedForm.length) {
              if (!isError) {
                setSubmitProgress(false);
                isError = true;
                setError("duration", {
                  message:
                    "Past assessment is not submitted yet for this questionnaire.",
                });
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
            // setError("duration", {
            //   message:
            //     "Please select the historical months only for assessment period.",
            // });
          }
          return;
        }
        //}

        // Validating existing data
        const result = await checkExistingFromInvitationDetails(
          checkGroupOrFormid(),
          finalFromDate,
          finalToDate,
          data.selectedCompanyIds
        );
        if (result?.error) {
          setSubmitProgress(false);
          if (!isError) {
            isError = true;
            setErrorMessage("Assessment is already taken for selected period");
          }
          return;
        }
        if (!!result?.data && result?.data?.FormInvitation?.length > 0) {
          setSubmitProgress(false);
          if (!isError) {
            isError = true;
            setErrorMessage("Assessment is already taken for selected period");
          }
          return;
        }
        let parentcompanymapping: CreateParentCompanyMappingMutationVariables =
          {
            input: [],
          };
        let forminvitationfundTypeArray: InsertcompanyformfundtypeMutationVariables =
          {
            object: [],
          };
        let invitationConsultantMappingDataArray: InsertInvitationConsultantMappingMutationVariables =
          {
            object: [],
          };
        if (isError === false) {
          setSubmitProgress(true);
          setErrorMessage(null);
          setIsSuccessError(false);
          const checkedData: parentcompanyMappingData[] = [];

          for (let g = 0; g < data.selectedCompanyIds.length; g++) {
            const getparentcompanydata = await checkParentCompanyExists(
              data.selectedCompanyIds[g],
              session?.company?.id
            );
            if (
              !!getparentcompanydata &&
              getparentcompanydata?.ParentCompanyMapping?.length > 0
            ) {
              getparentcompanydata?.ParentCompanyMapping.forEach((mapping) => {
                checkedData.push({
                  CompanyId: data.selectedCompanyIds[g],
                  parentcompanyId:
                    session?.user?.role === AppRoles.Consultant
                      ? companyDetails?.Company[0].ParentCompany?.id
                      : session?.company?.id,
                  ParentCompanyMappingId: mapping?.Id,
                });
              });
            } else {
              checkedData.push({
                CompanyId: data.selectedCompanyIds[g],
                parentcompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? companyDetails?.Company[0].ParentCompany?.id
                    : session?.company?.id,
                ParentCompanyMappingId: "",
              });
            }
          }
          const newParentCompany = checkedData.filter(
            (x: any) => x.ParentCompanyMappingId === ""
          );
          const existingParentCompany = checkedData.filter(
            (x: any) => x.ParentCompanyMappingId !== ""
          );
          let formInvitationDataArray: FormInvitation_Insert_Input[] = [];
          if (!!existingParentCompany.length) {
            for (let g = 0; g < existingParentCompany.length; g++) {
              const insertFormId = await checkIndustrySelected(
                existingParentCompany[g]?.CompanyId
              );
              formInvitationWhereCondition.push({
                _and: {
                  companyId: { _eq: existingParentCompany[g].CompanyId },
                  formId: { _eq: insertFormId },
                },
              });
            }
            let forms_FormInvitationDetail: any = [];
            if (formInvitationWhereCondition.length > 0) {
              forms_FormInvitationDetail = await forms_DetailBycustomWhere({
                variables: {
                  where: { _or: formInvitationWhereCondition },
                },
              });
            }
            for (let j = 0; j < existingParentCompany.length; j++) {
              const _company = companyListData?.Company?.find(
                (m) => m.id === existingParentCompany[j].CompanyId
              );
              if (!_company) throw setErrorMessage("Invalid company found");
              const GetformId = await checkIndustrySelected(
                existingParentCompany[j].CompanyId
              );

              //  Build allowedAICuration for existing companies
              const allowedAICuration: string[] = [];
              if (hasDocumentCuration(session?.accessToken, GetformId ?? ""))
                allowedAICuration.push("DocumentCuration");
              if (hasWebCuration(session?.accessToken, GetformId ?? ""))
                allowedAICuration.push("WebCuration");
              const opsResult = await canEnableOPSToIQCuration(session?.accessToken, GetformId ?? "", session?.company?.id);
              if (opsResult.eligible)
                allowedAICuration.push("OPSToIQCuration");
              const hasFormFullAICuration = hasFullAICuration(
                userSession?.accessToken,
                formId ? formId : undefined
              );
              // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
              // Build interimCheck object with carry-forward suggestions flag
              const interimCheck = {
                isCarryForwardAsSuggestionsInvitation:
                  isCarryForwardAsSuggestionsEnabled(
                    session?.accessToken,
                    GetformId as string,
                    companyDetails?.Company[0]?.metadata as CompanyMetadata
                  ),
              };

              formInvitationDataArray.push({
                companyId: existingParentCompany[j].CompanyId,
                formId: GetformId,
                email: _company?.primaryContact?.email,
                status:
                  forms_FormInvitationDetail?.data?.FormInvitation?.filter(
                    (items: Record<string, any>) =>
                      items.companyId == existingParentCompany[j].CompanyId &&
                      items.formId == GetformId
                  ).length == 0
                    ? hasFormFullAICuration
                      ? FormInvitationStatus.Processing
                      : FormInvitationStatus.Invited
                    : FormInvitationStatus.Invited,
                created_by: session?.user?.id,
                updated_by: session?.user?.id,
                durationFrom: finalFromDate,
                durationTo: finalToDate,
                parentcompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? companyDetails?.Company[0].ParentCompany?.id
                    : session?.company?.id,
                ParentCompanyMappingId:
                  existingParentCompany[j].ParentCompanyMappingId,
                metadata: {
                  AIData: {
                    allowedAICuration,
                    triggeredCuration: [],
                  },
                  ...(opsResult.eligible && {
                    opsData: {
                      opsCompanyId: opsResult.opsCompanyId,
                      opsCompanyName: opsResult.opsCompanyName,
                    },
                  }),
                },
                interimCheck: interimCheck,
              });
            }
          }
          if (newParentCompany?.length > 0) {
            parentcompanymapping.input = newParentCompany.map((rec: any) => {
              const data1 = {
                CompanyId: rec.CompanyId,
                ParentCompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : rec.parentcompanyId,
              };
              return data1;
            });
            const result1 = await insertParentCompanyMapping({
              variables: parentcompanymapping,
            });
            if (
              result1 &&
              result1?.data?.insert_ParentCompanyMapping?.returning
            ) {
              for (
                let h = 0;
                h <
                result1?.data?.insert_ParentCompanyMapping?.returning.length;
                h++
              ) {
                const insertFormId = await checkIndustrySelected(
                  result1?.data?.insert_ParentCompanyMapping?.returning[h]
                    ?.CompanyId
                );
                formInvitationWhereCondition.push({
                  _and: {
                    companyId: {
                      _eq: result1?.data?.insert_ParentCompanyMapping
                        ?.returning[h].CompanyId,
                    },
                    formId: { _eq: insertFormId },
                  },
                });
              }
              let forms_FormInvitationDetail: any = [];
              if (formInvitationWhereCondition.length > 0) {
                forms_FormInvitationDetail = await forms_DetailBycustomWhere({
                  variables: {
                    where: { _or: formInvitationWhereCondition },
                  },
                });
              }
              for (
                let invitationData = 0;
                invitationData <
                result1?.data?.insert_ParentCompanyMapping?.returning.length;
                invitationData++
              ) {
                const _company = companyListData?.Company?.find(
                  (m) =>
                    m.id ===
                    result1?.data?.insert_ParentCompanyMapping?.returning[
                      invitationData
                    ].CompanyId
                );
                if (!_company) throw setErrorMessage("Invalid company found");
                const GetformId = await checkIndustrySelected(
                  result1?.data?.insert_ParentCompanyMapping?.returning[
                    invitationData
                  ].CompanyId
                );
                const hasFormFullAICuration = hasFullAICuration(
                  userSession?.accessToken,
                  formId ? formId : undefined
                );
                const allowedAICuration: string[] = [];
                if (hasDocumentCuration(session?.accessToken, GetformId ?? ""))
                  allowedAICuration.push("DocumentCuration");
                if (hasWebCuration(session?.accessToken, GetformId ?? ""))
                  allowedAICuration.push("WebCuration");
                const opsResult2 = await canEnableOPSToIQCuration(session?.accessToken, GetformId ?? "", session?.company?.id);
                if (opsResult2.eligible)
                  allowedAICuration.push("OPSToIQCuration");
                // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                // Build interimCheck object with carry-forward suggestions flag
                const interimCheck = {
                  isCarryForwardAsSuggestionsInvitation:
                    isCarryForwardAsSuggestionsEnabled(
                      session?.accessToken,
                      GetformId as string,
                      companyDetails?.Company[0]?.metadata as CompanyMetadata
                    ),
                };
                formInvitationDataArray.push({
                  companyId:
                    result1?.data?.insert_ParentCompanyMapping?.returning[
                      invitationData
                    ].CompanyId,
                  formId: GetformId,
                  email: _company?.primaryContact?.email,
                  status:
                    forms_FormInvitationDetail?.data?.FormInvitation?.filter(
                      (items: Record<string, any>) =>
                        items.companyId ==
                          result1?.data?.insert_ParentCompanyMapping?.returning[
                            invitationData
                          ].CompanyId && items.formId == GetformId
                    ).length == 0
                      ? hasFormFullAICuration
                        ? FormInvitationStatus.Processing
                        : FormInvitationStatus.Invited
                      : FormInvitationStatus.Invited,
                  created_by: session?.user?.id,
                  updated_by: session?.user?.id,
                  durationFrom: finalFromDate,
                  durationTo: finalToDate,
                  parentcompanyId:
                    session?.user?.role === AppRoles.Consultant
                      ? companyDetails?.Company[0].ParentCompany?.id
                      : session?.company?.id,
                  ParentCompanyMappingId:
                    result1?.data?.insert_ParentCompanyMapping?.returning[
                      invitationData
                    ].Id,
                  metadata: {
                    AIData: {
                      allowedAICuration,
                      triggeredCuration: [],
                    },
                    ...(opsResult2.eligible && {
                      opsData: {
                        opsCompanyId: opsResult2.opsCompanyId,
                        opsCompanyName: opsResult2.opsCompanyName,
                      },
                    }),
                  },
                  interimCheck: interimCheck,
                });
              }
            }
            // const parentCompanyId = session?.company?.id;
            // const userId = session?.user?.id;

            // parentcompanymapping.input = {
            //   CompanyId: companyIds[0],
            //   ParentCompanyId: session?.company?.id,
            // };

            // const getparentcompanydata = await CompanyDetailByparentcompanyid(
            //   companyIds[0],
            //   parentCompanyId
            // );
            // if (getparentcompanydata?.Company.length === 0) {
            //   const result1 = await insertParentCompanyMapping({
            //     variables: parentcompanymapping,
            //   });
            // }
          }
          postParentMessage(sendInvitationLoadingStartedMessage());
          const companyIds = formInvitationDataArray.map(
            (item: FormInvitation_Insert_Input) => {
              return item.companyId;
            }
          );
          recommendationNewFormDetails =
            recommendationNewResponce?.GlobalMaster[0]?.data?.filter(
              (rec: any) => rec.FormId === formInvitationDataArray[0]?.formId
            );
          let lastInvitationDataQuery: any = [];
          if (
            recommendationNewFormDetails?.length > 0 &&
            !shouldDisableCarryForward
          ) {
            lastInvitationDataQuery = await lastInvitationData({
              variables: {
                companyId: companyIds,
                formId: formInvitationDataArray[0].formId,
                status: [RecommendationStatus.Closed, RecommendationStatus.NA],
                parentcompanyId: session?.company?.id,
              },
              fetchPolicy: "no-cache",
            });
          }
          const { data: insertFormInvitationResult } =
            await insertFormInvitation({
              variables: {
                object: formInvitationDataArray,
                companyId: companyIds[0],
                // parentCompanyId: parentCompanyId,
                //userId: userId,
              },
            });
          // Insert record to InvitationConsultantMapping Table.
          if (
            insertFormInvitationResult &&
            insertFormInvitationResult?.insert_FormInvitation?.returning
          ) {
            // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
            const precedenceResult = getCarryForwardPrecedence(
              insertFormInvitationResult.insert_FormInvitation.returning
            );
            // [TRADITIONAL CARRY-FORWARD] Only execute if precedence allows it
            if (
              !shouldDisableCarryForward &&
              !precedenceResult.shouldSkipTraditionalCarryForward &&
              recommendationNewFormDetails?.length > 0 &&
              lastInvitationDataQuery?.data?.LastFormInvitation[0]
                ?.FormInvitations?.length > 0
            ) {
              let bodyobject = {
                iscarryforwardImplemented: recommendationNewFormDetails,
                insertFormInvitationResult:
                  insertFormInvitationResult?.insert_FormInvitation?.returning,
                lastInvitationDataQuery: lastInvitationDataQuery?.data,
              };
              await fetch("/api/carry-forward-assessment-data", {
                method: "POST",
                body: JSON.stringify(bodyobject),
                headers: {
                  "Content-Type": "application/json",
                  Authorization: userSession?.accessToken ?? "",
                },
              });
            }

            //[CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
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
          if (session?.user?.role === AppRoles.Consultant) {
            if (
              insertFormInvitationResult &&
              insertFormInvitationResult?.insert_FormInvitation?.returning
            ) {
              const data =
                insertFormInvitationResult?.insert_FormInvitation?.returning;

              data.map(async (rec) => {
                invitationConsultantMappingDataArray.object = {
                  invitationId: rec?.id,
                  consultantUserId: session?.user?.id,
                  consultantCompanyId: session?.company?.id,
                };

                const resultCunsultantMapping =
                  await insertInvitationConsultantMapping({
                    variables: invitationConsultantMappingDataArray,
                  });
              });
            }
          }

          if (globaldata[0]?.IsEnable) {
            let insertfundtypearray: any = [];
            data.selectedCompanyIds.map(async (companyId: any) => {
              if (
                vcfundtypedata.data?.CompanyFormFundtype?.filter(
                  (x: any) => x.companyId === companyId
                )?.length === 0
              ) {
                // const GetformId = checkIndustrySelected(companyId);
                insertfundtypearray.push({
                  vcCompanyId:
                    session?.user?.role === AppRoles.Consultant
                      ? selectedFormParentCompanyId
                      : session?.company?.id,
                  companyId: companyId,
                  formId: formId,
                  invitedBy: session?.user?.id,
                  fundType: {
                    fundType:
                      vcfundtypedataforsecondform?.data?.CompanyFormFundtype?.filter(
                        (x: any) => x.companyId === companyId
                      )[0]?.fundType?.fundType,
                  },
                });
              }
            });
            forminvitationfundTypeArray.object = insertfundtypearray;
            const fundtypeinsertion = await insertCompanyFormFundType({
              variables: forminvitationfundTypeArray,
            });
          }
          const success =
            insertFormInvitationResult?.insert_FormInvitation?.returning &&
            insertFormInvitationResult?.insert_FormInvitation?.returning
              ?.length > 0;
          if (!success) {
            setErrorMessage("Failed to send invitation");
            postParentMessage(sendInvitationValidationFailedMessage());
          } else {
            const invitedStatusInvitation =
              insertFormInvitationResult?.insert_FormInvitation?.returning
                .filter((items) => items.status == FormInvitationStatus.Invited)
                .map((items) => {
                  const companyData =
                    lastInvitationDataQuery?.data?.LastFormInvitation.filter(
                      (inviteItems: any) => inviteItems.id == items?.companyId
                    );
                  let inviteData = [];
                  if (!!companyData && companyData.length > 0) {
                    inviteData = companyData[0]?.FormInvitations?.filter(
                      (inviteItems: any) => inviteItems?.id == items?.id
                    );
                  }
                  return {
                    invitationId: items.id,
                    companyId: items?.companyId,
                    formId: items?.formId,
                    platformId: session?.platform?.id,
                  };
                });
            if (
              !!invitedStatusInvitation &&
              invitedStatusInvitation.length > 0
            ) {
              const bulkInsertionData: FormSubmission_Insert_Input[] = invitedStatusInvitation.map((items) => ({
                invitationId: items.invitationId,
                isActive: true,
              }));
              await bulkInsertFormSubmission({
                variables: { formSubmissionInput: bulkInsertionData },
              });
              // send data to API for company email invitation.

              const sendInvitationEmailPromisses =
                invitedStatusInvitation
                  // .filter((items) => items.isNormalInvitation)
                  .map(async (items) => {
                    await fetch("/api/email-invitation", {
                      method: "POST",
                      headers: {
                        "content-type": "application/json",
                      },
                      body: JSON.stringify({
                        id: items?.invitationId,
                        type: "ExistingCompanyFormInvitation",
                        companyId: items?.companyId,
                        formId: formId,
                        platformId: session?.platform?.id,
                      }),
                    });
                  }) ?? [];

              await Promise.all(sendInvitationEmailPromisses);
            }
            setIsSuccessError(true);
            cancel();
            reset();
            _success = true;
          }
        }
      } catch (error) {
        console.log("Send Invitation Submit Error", { error });
        setErrorMessage("Something went wrong");
        postParentMessage(sendInvitationValidationFailedMessage());
      } finally {
        // Ensure loading state is always cleaned up
        setSubmitProgress(false);
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
    }, "sendInviteIframe");
  };

  // Add error handling to the onSubmit function
  const handleFormError = (
    errors: FieldErrors<SendInvitationSelectExistingCompanyType>
  ) => {
    captchaValidationBeforeSubmitHandler(async () => {
      console.log("Form validation failed with errors:", errors);
      setSubmitProgress(false);

      // Prioritize company selection error over date errors
      if (errors.selectedCompanyIds) {
        setErrorMessage("Select atleast one company to proceed further");
      } else if (errors.duration?.fromDate || errors.duration?.toDate) {
        setErrorMessage("Assessment period selection is mandatory");
      }
    }, "sendInviteIframe");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit, handleFormError)} noValidate>
      {/* <LoadingOverlay visible={submitProgress} /> */}
      <Spinner visible={submitProgress} />
      <Stack mt={8} spacing={8}>
        <Text size={12} color="#444444" fw={400}>
          Select Partners For Assessment
        </Text>
        <Controller
          control={control}
          name="selectedCompanyIds"
          defaultValue={[]}
          render={({
            field: { name, onBlur, onChange, ref, value },
            fieldState: { error },
          }) => {
            return (
              <Stack spacing="xs" style={{ gap: "3px" }}>
                <MultiSelect
                  dropdownPosition="flip"
                  data={data.sort((a, b) => a.label.localeCompare(b.label))}
                  placeholder="Click to search or select partners"
                  searchable
                  clearable
                  onChange={(val) => {
                    onChange(val);
                    clearErrors("selectedCompanyIds");
                    if (val && val.length > 0) {
                      setErrorMessage(null);
                    }
                  }}
                  onBlur={onBlur}
                  name={name}
                  value={value}
                  ref={ref}
                  // styles={{
                  //   input: {
                  //     fontSize: "14px",
                  //   },
                  // }}
                  styles={(theme) => ({
                    input: {
                      // height: "40px",
                      border: "1px solid #E6E6E6",
                      borderRadius: "4px",
                      "&:focus": {
                        borderColor: theme.colors.blue[6],
                      },
                    },
                    dropdown: {
                      border: "1px solid #E6E6E6",
                      borderRadius: "4px",
                    },
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
                />
                {error && (
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
                    {error.message}
                  </Text>
                )}
              </Stack>
            );
          }}
        />

        {errorMessage && (
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
            {errorMessage}
          </Text>
        )}
        {/* {isSuccessError && (
          <Text size={12} color="green">
            Assessment invitation send successfully.
          </Text>
        )} */}
        <Group
          className={classes.actionButtons}
          position="right"
          spacing="sm"
          mt={15}
        >
          <Button color="outlineBtn" onClick={cancel}>
            Cancel
          </Button>
          {/* <Button color="solidBtn" onClick={backToFormSelection}>
            Previous
          </Button> */}
          <Button
            type="submit"
            color="solidBtn"
            disabled={submitProgress}
            loading={submitProgress}
            onClick={(e: any) => {
              console.log("Send Request button clicked");
              // The form's onSubmit handler will handle the submission
            }}
          >
            SEND REQUEST
          </Button>
        </Group>
      </Stack>
    </form>
  );
};
const ExistingCompanyForm = () => {
  return (
    <Box>
      <ExistingCompanyFormFields />
    </Box>
  );
};
export default ExistingCompanyForm;
