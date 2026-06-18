import { yupResolver } from "@hookform/resolvers/yup";
import {
  ActionIcon,
  Autocomplete,
  Box,
  Button,
  createStyles,
  Flex,
  Group,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconMinus, IconPlus } from "@tabler/icons";
import { encryptionDecryption } from "@warp/client/hooks/encryption-decryption";
import { useUserSession } from "@warp/client/hooks/use-user-session";
import Spinner from "@warp/client/layouts/Spinner";
import {
  cancelInvitationMessage,
  sendInvitationLoadingStartedMessage,
  sendInvitationResponseMessage,
  sendInvitationValidationFailedMessage,
} from "@warp/client/services/platform-window-message.service";
import {
  CreateParentCompanyMappingMutationVariables,
  FormSubmission_Insert_Input,
  InputMaybe,
  InsertcompanyformfundtypeMutationVariables,
  InsertCompanyMutationVariables,
  InsertFormInvitationNewCompanyMutation,
  InsertFormInvitationNewCompanyMutationVariables,
  InsertInvitationConsultantMappingMutationVariables,
} from "@warp/graphql/generated/types";
import { useBulkInsertFormSubmissionMutation } from "@warp/graphql/mutations/generated/bulk-insert-form-submission";
import { useBulkinsertwebCurationMutation } from "@warp/graphql/mutations/generated/bulk-insert-webCuration";
import { useCreateParentCompanyMappingMutation } from "@warp/graphql/mutations/generated/create-ParentCompanyMapping";
import { useInsertCompanyMutation } from "@warp/graphql/mutations/generated/insert-company";
import { useInsertcompanyformfundtypeMutation } from "@warp/graphql/mutations/generated/insert-company-form-fundtype";
import { useInsertFormInvitationNewCompanyMutation } from "@warp/graphql/mutations/generated/insert-form-invitation-new-company";
import { useInsertInvitationConsultantMappingMutation } from "@warp/graphql/mutations/generated/insert-invitation-consultant-mapping";
import { useUpdateCompanyDetailsMutation } from "@warp/graphql/mutations/generated/update-company-manufacturing";
import { useUpdateParentCompanyMappingbyCompanyIdMutation } from "@warp/graphql/mutations/generated/update-parentcompanymapping-by-companyId";
import { useGetAssessorConsultantMappingQuery } from "@warp/graphql/queries/generated/get-assessor-consultant-mapping";
import { useGetCompanyByParentCompanyIdNullQuery } from "@warp/graphql/queries/generated/get-company-by-parent-company-id-null";
import { useGetcompanyfundtypeavailabilityQuery } from "@warp/graphql/queries/generated/get-company-fundtype-availability";
import { useGetCompanyDetailByIdQuery } from "@warp/graphql/queries/generated/get-companydetail-by-id";
import { useGetFormInvitationByFormIdLazyQuery } from "@warp/graphql/queries/generated/get-form-invitation-by-form-id";
import { useGetformInvitationdatabycustomwhereLazyQuery } from "@warp/graphql/queries/generated/get-formInvitation-data-by-custom-where";
import { useGetGlobalMasterByCountryQuery } from "@warp/graphql/queries/generated/get-global-master-by-country";
import { useGetGlobalMasterByTypeQuery } from "@warp/graphql/queries/generated/get-global-master-by-type";
import { useGetglobalmasterdataforfundtypeQuery } from "@warp/graphql/queries/generated/get-globalmaster-data-for-fundtype";
import { useGetParentCompanyByCompanyAndParentCompanyIdLazyQuery } from "@warp/graphql/queries/generated/get-parentcompany-by-company-and-parentcompany-id";
import { useGetUserDetailByEmailLazyQuery } from "@warp/graphql/queries/generated/get-userdetail-by-email";
import {
  AppRoles,
  FormInvitationStatus,
  FormTypesPage,
  invitationFormDetails,
} from "@warp/shared/constants/app.constants";
import {
  canEnableOPSToIQCuration,
  CompanyMetadata,
  getFormAIPlans,
  hasDocumentCuration,
  hasFullAICuration,
  hasWebCuration,
  isCarryForwardAsSuggestionsEnabled,
  isFormAIEnabled,
} from "@warp/shared/utils/jwt-ai.util";
import InvitationNewCompanySchema from "@warp/shared/validation/invitation-new-company.schema";
import dayjs from "dayjs";
import { concat } from "lodash";
import { useEffect, useMemo, useRef, useState } from "react";
//import "react-datepicker/dist/react-datepicker.css";
import { useCaptchaValidationBeforeSubmit } from "@warp/client/hooks/google-invisible-recaptcha";
import { sanitiseArrayValues } from "@warp/shared/utils/dom-purifier/dom-purify.client.util";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { MonthYearRangePickerValueType } from "../../../components/MonthYearPicker";
import { toTitleCase } from "../../form/utils";
import {
  initialState,
  useSendInvitationStore,
} from "./send-invitation-assessment/store";
const { choosemethod } = encryptionDecryption();
const useStyles = createStyles((theme) => ({
  commonMargin: {
    marginBottom: 10,
    marginTop: 0,
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
  SideDrawerSearch: {
    border: "1px solid #cdcdcd " + "!important",
    "&:focus": {
      border: "1px solid #038FC7" + "!important",
    },
    "&:focus-within": {
      border: "1px solid #038FC7" + "!important",
    },
  },
}));
type newCompanyForms = {
  companyId: string;
  companyName: string;
  country: string;
  primaryContactName: string;
  primaryContactEmail: string;
  primaryContactMobileNumber: string;
  applicationId: string;
  crn: string;
  industry: string;
  ismanufacturing: string;
  fundType: string;
  companySize: string;
};
const formInvitationWhereCondition: Record<string, any>[] = [];
const NewCompanyFormFields = () => {
  const { captchaValidationBeforeSubmitHandler } =
    useCaptchaValidationBeforeSubmit();
  const postParentMessage = (message: string) =>
    window.parent?.postMessage(message, "*");

  const { data: assessorConsultantMappingData } =
    useGetAssessorConsultantMappingQuery();

  const getUserExistingEmail = useGetUserDetailByEmailLazyQuery()[0];

  const allConsultantIds =
    assessorConsultantMappingData?.AssessorConsultantMapping?.map(
      (d: any) => d.consultantCompanyId
    )?.filter((val: any, i: any, arr: any) => arr.indexOf(val) === i);

  const cancel = useSendInvitationStore((store) => () => {
    store.init(initialState);
    postParentMessage(cancelInvitationMessage());
  });

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

  const session = useUserSession();

  const { data: recommendationNewResponce } = useGetGlobalMasterByTypeQuery({
    variables: { type: "Recommendation_new" },
  });
  const { data: isPredealFromId } = useGetGlobalMasterByTypeQuery({
    variables: { type: "IHCPredealFundTypeChange" },
  });
  // const isPredealFromId: any = session?.GlobalMaster?.filter(
  //   (x: any) => x.type === "IHCPredealFundTypeChange"
  // );
  const isPredealFrom = isPredealFromId?.GlobalMaster[0]?.data
    .filter((item: any) => item.formId)[0]
    ?.formId.some((id: any) => id === formId);
  const getFormInvitation = useGetFormInvitationByFormIdLazyQuery()[0];

  let recommendationNewData;
  let recommendationNewFormDetails: any;

  if (!!recommendationNewResponce?.GlobalMaster?.length && formId) {
    recommendationNewData = recommendationNewResponce?.GlobalMaster;

    recommendationNewFormDetails =
      recommendationNewResponce?.GlobalMaster[0].data.filter(
        (rec: any) => rec.FormId === formId
      );
  }

  const { choosemethod } = encryptionDecryption();
  const [selectedcompany, setselectedcompany] = useState("");
  // const groupId = useSendInvitationStore((store) => store.groupFormId);

  const { classes } = useStyles();
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
      companyForm: [
        {
          companyId: "",
          companyName: "",
          country: "IN",
          primaryContactName: "",
          primaryContactEmail: "",
          primaryContactMobileNumber: "",
          applicationId: "",
          crn: "",
          industry: "",
          ismanufacturing: "",
          fundType: "",
          companySize: "",
        },
      ],
    },
    resolver: yupResolver(InvitationNewCompanySchema),
  });

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

  const [assessmentPeriodRequired, setAssessmentPeriodRequired] =
    useState(false);
  const [recomNewAssessmentPeriod, setRecomNewAssessmentPeriod] =
    useState(false);
  const [oldInvitationSubmitted, setOldInvitationSubmitted] = useState(false);
  const [assessmentPeriodError, setAssessmentPeriodError] = useState(false);
  const [existingCompanyName, setExistingCompanyName] = useState(null);
  const [duplicateCompanyName, setDuplicateCompanyName] = useState(null);
  const [fundTypeRequired, setfundTypeRequired] = useState(false);
  const [fundTypeError, setfundTypeError] = useState(false);
  const companyExistRef = useRef<boolean | null>(null);
  const [CompanyName, setCompanyName] = useState(null);
  const [CompanySize, setCompanySize] = useState("large");
  const [countryName, setCountryName] = useState("IN");
  const [assessmentRequired, setAssessmentRequired] = useState(false);

  const { data: companyDetails } = useGetCompanyDetailByIdQuery({
    variables: {
      id: session?.company?.id,
    },
  });

  const { data: countryData } = useGetGlobalMasterByCountryQuery();
  // const { data: countryData } = globalMasterDataStorage?.GlobalMaster?.filter(
  //   (x: any) => x.type === "CountryMaster"
  // );
  const forms_DetailBycustomWhere =
    useGetformInvitationdatabycustomwhereLazyQuery()[0];
  const GetParentCompanyExists =
    useGetParentCompanyByCompanyAndParentCompanyIdLazyQuery()[0];
  // const { data: industryData } = useGetFormDetailByBulkFormIdQuery({
  //   variables: {
  //     formId: formIds.length > 0 ? formIds : formId,
  //   },
  // });

  const formParentCompanyId =
    session?.user?.role === AppRoles.Consultant
      ? selectedFormParentCompanyId
      : session?.company?.id;

  let { data: companySuggestedData } = useGetCompanyByParentCompanyIdNullQuery({
    variables: {
      parentCompanyId: formParentCompanyId,
      platformId: session?.platform?.id,
      allConsultantCompanyIds: allConsultantIds,
    },
  });

  let companySuggestedData1 = companySuggestedData?.Company.map((comp) => {
    let ind;
    if (session?.user?.role === AppRoles.Consultant) {
      // Added if condition for consultant.
      ind = comp.ParentCompanyMappings.findIndex(
        (comp2) => comp2.ParentCompanyId === selectedFormParentCompanyId
      );
    } else {
      ind = comp.ParentCompanyMappings.findIndex(
        (comp2) => comp2.ParentCompanyId === session?.company?.id
      );
    }

    if (ind === -1) {
      return comp;
    }
  });
  companySuggestedData1 = companySuggestedData1?.filter((m) => m != undefined);

  const formCompanyList = watch("companyForm");
  const selectedCompanyNames = formCompanyList?.map((m) => m.companyName);

  const companySuggestionList = useMemo(() => {
    let companyData =
      companySuggestedData1?.filter(
        (comp) => !selectedCompanyNames.some((m) => m === comp?.name)
      ) ?? [];

    return companyData;
  }, [companySuggestedData1, selectedCompanyNames]);

  const companyNameSuggestionList: any = companySuggestionList.map((m) => ({
    label: m?.name,
    value: m?.name,
  }));

  const [isLoading, setIsLoading] = useState(false);
  const [isSuccessError, setIsSuccessError] = useState("");
  const [submitProgress, setSubmitProgress] = useState(false);
  const insertCompany = useInsertCompanyMutation()[0];
  const insertFormInvitation = useInsertFormInvitationNewCompanyMutation()[0];
  const insertWebCuration = useBulkinsertwebCurationMutation()[0];
  const insertInvitationConsultantMapping =
    useInsertInvitationConsultantMappingMutation()[0];
  const insertCompanyFormFundType = useInsertcompanyformfundtypeMutation()[0];
  const insertParentCompanyMapping = useCreateParentCompanyMappingMutation()[0];
  const updateParentCompanyMapping =
    useUpdateParentCompanyMappingbyCompanyIdMutation()[0];
  const updateCompanyDetails = useUpdateCompanyDetailsMutation()[0];
  const bulkInsertFormSubmission = useBulkInsertFormSubmissionMutation()[0];
  const {
    fields: dynamicCompanyForm,
    append,
    remove,
    prepend, // Add prepend to destructuring
    swap, // Add swap for potential reordering
  } = useFieldArray({
    control,
    name: "companyForm",
  });
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
  let isenable = false;
  let dropdownvalue: any = [];
  // if (
  //   formId == "47859d80-4783-49a1-b7b0-a47b67e3bcc7" ||
  //   formId == "aa8335ef-63df-41e2-88fe-c030c5d3867f"
  // ) {
  let globaldata = globalMasterData?.data?.GlobalMaster[0]?.data?.filter(
    (x: any) =>
      x.companyId ==
        (session?.user?.role === AppRoles.Consultant
          ? selectedFormParentCompanyId
          : session?.company?.id) &&
      x.formId?.filter((d: any) => d == formId)?.length > 0
  );
  if (globaldata?.length > 0) {
    isenable = globaldata[0]?.IsEnable;
    dropdownvalue = globaldata[0]?.fundType;
    if (isenable) {
      if (dropdownvalue.length == 1) {
        isenable = false;
      }
    }
    if (selectedcompany != "") {
      if (selectedcompany != "00000000-0000-0000-0000-000000000000") {
        if (
          vcfundtypedata?.data?.CompanyFormFundtype?.filter(
            (x: any) => x.companyId == selectedcompany
          )?.length
        ) {
          isenable = false;
        } else {
          isenable = true;
        }
      }
    }
  }
  const countryList = useMemo(
    () =>
      countryData?.GlobalMaster?.flatMap((rec: any) => {
        return rec.data
          .filter((d: any) => d.isActive === true)
          .map((item: any) => ({
            value: item.code,
            label: item.name,
          }));
      }) ?? [],
    [countryData]
  );
  // const industryList = useMemo(
  //   () =>
  //     industryData?.FormDetails?.flatMap((rec) => {
  //       return (
  //         rec.industry?.map((item: any) => ({
  //           value: rec.formId,
  //           label: item,
  //         })) ?? []
  //       );
  //     }) ?? [],
  //   [industryData]
  // );

  const getGroupFormids = (GroupForms: any[]) => {
    let industry: any[] = [];
    let groupFormIds: any[] = [];
    const GroupData = GroupForms.map((index: any) => {
      groupFormIds = concat(groupFormIds, index.formId);
      const industryData: any =
        index.Form.Details.industry.length > 0 &&
        index.Form.Details.industry.map((x: any) => x);
      industry = concat(industry, industryData);
    });
    return { formId: groupFormIds, industry: industry };
  };
  const InvitationProcessAfterInsertion = async (
    formInvitationInsertionData: InsertFormInvitationNewCompanyMutation["insert_FormInvitation"]
  ) => {
    const processingInvitation = formInvitationInsertionData?.returning.filter(
      (items) => items.status == FormInvitationStatus.Processing
    );
    const invitedStatusInvitation = formInvitationInsertionData?.returning
      .filter((items) => items.status == FormInvitationStatus.Invited)
      .map((items) => {
        return {
          invitationId: items.id,
          // isNormalInvitation: true,
          // !!AITokenValue && AITokenValue.length > 0
          //   ? AITokenValue.filter(
          //       (datItems: any) =>
          //         datItems?.formId == items.formId &&
          //         datItems?.onlyDoc == true
          //     ).length == 0
          //   : true,
          companyId: items?.companyId,
          formId: items?.formId,
          platformId: session?.platform?.id,
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
    //         !!webCurationInsertion?.data?.insert_WebCuration?.returning &&
    //         webCurationInsertion?.data?.insert_WebCuration?.returning.length > 0
    //           ? webCurationInsertion?.data?.insert_WebCuration?.returning.filter(
    //               (curationItems) =>
    //                 curationItems?.formInvitationId == items?.id
    //             )[0]?.id
    //           : "",
    //     };
    //   }) as webCurationAPIDataType[];
    //   if (!!formInvitationData && formInvitationData.length > 0) {
    //     await callAIAPI(formInvitationData);
    //   }
    // }
    if (!!invitedStatusInvitation && invitedStatusInvitation.length > 0) {
      // if (
      //   invitedStatusInvitation.filter((items) => !items.isNormalInvitation)
      //     .length > 0
      // ) {
      //   const bulkInsertionData: FormSubmission_Insert_Input[] = [];
      //   const emailInviteData = invitedStatusInvitation
      //     .filter((items) => !items.isNormalInvitation)
      //     .map((invitedItems) => {
      //       bulkInsertionData.push({
      //         invitationId: invitedItems?.invitationId,
      //         isActive: true,
      //       });
      //       return {
      //         invitationId: String(invitedItems?.invitationId),
      //         isInternalUSer: false,
      //         emailType: [
      //           AIEmailTemplates.AINewFormInvitation,
      //           AIEmailTemplates.AINewOnboarding,
      //         ],
      //       };
      //     }) as AIEmailInvitation[];
      //   await bulkInsertFormSubmission({
      //     variables: {
      //       formSubmissionInput: bulkInsertionData,
      //     },
      //   });
      //   if (emailInviteData.length > 0) {
      //     await fetch("/api/AI/email-invitation", {
      //       method: "POST",
      //       headers: {
      //         "content-type": "application/json",
      //       },
      //       body: JSON.stringify(emailInviteData),
      //     });
      //   }
      // }
      const bulkInsertionData: FormSubmission_Insert_Input[] = invitedStatusInvitation.map((items) => ({
        invitationId: items.invitationId,
        isActive: true,
      }));
      await bulkInsertFormSubmission({
        variables: { formSubmissionInput: bulkInsertionData },
      });
      //send data to API for company email invitation.
      await Promise.all(
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
                type: "FormInvitation",
                companyId: items?.companyId,
                formId: items?.formId,
                platformId: session?.platform?.id,
              }),
            });
          })
      );
    }
  };
  const industryList = getGroupFormids(groupFormIds).industry.map((x: any) => {
    return {
      value: x,
      label: x,
    };
  });

  const checkIndustrySelected = (insertedCompanyData: any, FormData: any) => {
    let Final_formId = "";
    const data = insertedCompanyData;
    const getFormIds = getGroupFormids(groupFormIds);
    const FormSubmittedData = FormData;
    if (
      getFormIds.industry.length > 0 &&
      (data?.metadata ?? "") !== "" &&
      data?.metadata?.industry !== ""
    ) {
      groupFormIds.map((index: any) => {
        if (index.Form.Details.industry.length > 0) {
          if (index.Form.Details.industry[0] === data?.metadata?.industry) {
            Final_formId = index.formId;
          }
        }
      });

      return Final_formId !== "" ? Final_formId : formId;
    }

    if (FormSubmittedData) {
      if (FormSubmittedData.length > 0) {
        groupFormIds.map((index: any) => {
          if (index.Form.Details.industry.length > 0) {
            if (
              index.Form.Details.industry[0] === FormSubmittedData[0].industry
            ) {
              Final_formId = index.formId;
            }
          }
        });

        return Final_formId !== "" ? Final_formId : formId;
      }
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
  // const checkGroupOrFormid = (data: any) => {
  //   if (formIds.length > 0) {
  //     if (data.industry !== "") return data.industry;
  //     // return groupId;
  //   }
  //   return formId;
  // };
  const formSubmitted = async (data: any) => {
    setSubmitProgress(true);
    //console.log("DAta", data);
    let isError = false;
    setIsLoading(true);
    try {
      // Validation for assessment period.
      if (!duration || duration.fromDate > duration.toDate) {
        if (!duration) setAssessmentPeriodRequired(true);
        else setAssessmentPeriodError(true);
        isError = true;
        setSubmitProgress(false);
        setIsLoading(false);
        return;
      } else {
        setAssessmentPeriodError(false);
        setAssessmentPeriodRequired(false);
      }

      if (!formId) {
        isError = true;
        setAssessmentRequired(true);
        setIsLoading(false);
        return;
      }

      //if (!!recommendationNewFormDetails?.length) {
      // const newDate = new Date();
      let currentMonthYear = dayjs().startOf("month").toDate();

      currentMonthYear.setHours(currentMonthYear.getHours() + 5);
      currentMonthYear.setMinutes(currentMonthYear.getMinutes() + 30);

      // const fromMonthYear =
      //   duration.fromDate.getFullYear() +
      //   "-" +
      //   (duration.fromDate.getMonth() + 1);
      // const toMonthYear =
      //   duration.toDate.getFullYear() + "-" + (duration.toDate.getMonth() + 1);

      // const fromDate = new Date(fromMonthYear);
      // const toDate = new Date(toMonthYear);
      // const previousDate = new Date(currentMonthYear);

      //previousDate.setFullYear(newDate.getFullYear());
      //previousDate.setMonth(newDate.getMonth() + 1);
      //let date = new Date();
      let finalFromDate = duration.fromDate;
      // new Date(
      //   date.getFullYear(),
      //   duration.fromDate.getMonth(),
      //   1
      // );

      let finalToDate = duration.toDate;
      // new Date(
      //   date.getFullYear(),
      //   duration.toDate.getMonth() + 1,
      //   0
      // );

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
        setSubmitProgress(false);
        setIsLoading(false);
        return;
      }

      let fundtypevalue = "";
      if (dropdownvalue.length == 1) {
        fundtypevalue = dropdownvalue[0]?.value;
      } else {
        fundtypevalue = data?.companyForm[0]?.fundType;
      }
      if (isenable) {
        if (fundtypevalue == "") {
          setfundTypeRequired(true);
          setIsLoading(false);
          setSubmitProgress(false);
          return;
        } else {
          if (
            dropdownvalue.filter(
              (x: any) =>
                x.label.toString().toLowerCase() ==
                fundtypevalue.toString().toLowerCase()
            ).length == 0
          ) {
            setfundTypeError(true);
            setIsLoading(false);
          } else {
            setfundTypeError(false);
            setIsLoading(false);
          }
          setfundTypeRequired(false);
          setIsLoading(false);
          setSubmitProgress(false);
        }
      }
      for (
        let datalength = 0;
        datalength < data.companyForm.length;
        datalength++
      ) {
        data.companyForm[datalength].primaryContactEmail = await choosemethod(
          String(data.companyForm[datalength].primaryContactEmail)
            .toLowerCase()
            .trim(),
          "encrypt"
        );
      }
      // remove extra space between string. start and end of the staring also.
      data.companyForm.filter(async (rec: any) => {
        rec.companyName = rec.companyName.replace(/\s+/g, " ").trim();
        rec.primaryContactEmail = rec.primaryContactEmail.trim();
      });

      let companyNameList: InputMaybe<string | string[]> | undefined = [];
      companyNameList = data.companyForm.map((rec: any) => {
        return rec.companyName;
      });

      // checking of duplicate data for company
      const duplicateCompanyData = data.companyForm
        .map((item: any, index: any) => {
          if (
            companyNameList &&
            companyNameList.indexOf(item.companyName) !== index
          )
            return item.companyName;
          return null;
        })
        .filter((item: any) => !!item);

      if (!duplicateCompanyData || duplicateCompanyData.length > 0) {
        isError = true;
        setDuplicateCompanyName(duplicateCompanyData.join(", "));
        return;
      }
      setDuplicateCompanyName(null);
      // Checking for existing company to db.
      let decryptedEmail = "";
      let existingCompanyData: any = [];
      let CompanyData: any = [];
      let Email: any = "";
      for (let rec of data.companyForm) {
        if (rec.companyId === "") {
          // For new company only (Not Suggested Company).
          // let parentCompanyId: any = "771bfe1c-adcc-408d-a7e2-684b298623a7"; // session?.company?.id;

          Email = rec.primaryContactEmail;
          await fetch(
            `/api/get-company-by-name-and-primary-contact?companyName=${rec.companyName}&primaryContactEmail=${rec.primaryContactEmail}&primaryContactPhone=${rec.primaryContactMobileNumber}`,
            {
              method: "GET",
              headers: {
                "content-type": "application/json",
              },
            }
          )
            .then((response) => response.json())
            .then(async (data) => {
              CompanyData = data.data.Company;
              const existingData = data.data.Company.map((item: any) => {
                let rec1 = "";
                //item.ParentCompanyMappings.map((item1: any) => {
                // rec1 =
                //   item1.ParentCompanyId ===
                //     (session?.user?.role === AppRoles.Consultant
                //       ? selectedFormParentCompanyId
                //       : session?.company?.id)
                //     ? item
                //     : null;

                session?.user?.role === AppRoles.Consultant
                  ? item.ParentCompanyMappings.filter(
                      (x: any) =>
                        x.ParentCompanyId === selectedFormParentCompanyId
                    )?.map((item1: any) => {
                      if (
                        item1.ParentCompanyId !== undefined &&
                        item1.ParentCompanyId !== null &&
                        selectedFormParentCompanyId !== undefined
                      ) {
                        rec1 =
                          item1.ParentCompanyId === selectedFormParentCompanyId
                            ? item
                            : null;
                      } else {
                        rec1 = item;
                      }
                    })
                  : item.ParentCompanyMappings.map((item1: any) => {
                      // console.log(selectedFormParentCompanyId);
                      if (
                        item1.ParentCompanyId !== undefined &&
                        item1.ParentCompanyId !== null &&
                        selectedFormParentCompanyId !== undefined
                      ) {
                        rec1 =
                          item1.ParentCompanyId === selectedFormParentCompanyId
                            ? item
                            : null;
                      } else {
                        rec1 = item;
                      }
                    });

                return rec1;
              });

              if (
                existingData.filter(
                  (m: any) => m !== undefined && m !== "" && m !== null
                ).length > 0
              ) {
                const NewExistingData = existingData.filter(
                  (m: any) => m !== undefined && m !== "" && m !== null
                );

                NewExistingData.map(async (item: any) => {
                  if (
                    rec.companyName.toLowerCase() === item.name.toLowerCase()
                  ) {
                    existingCompanyData.push(rec.companyName);
                  }
                  if (rec.primaryContactEmail === item.primaryContact.email) {
                    let primaryContactEmail = await choosemethod(
                      rec.primaryContactEmail,
                      "decrypt"
                    );
                    existingCompanyData.push(primaryContactEmail);
                  }

                  if (
                    rec.primaryContactMobileNumber === item.primaryContact.phone
                  ) {
                    existingCompanyData.push(rec.primaryContactMobileNumber);
                  }
                });
              }
            })
            .catch((error) => {
              isError = true;
              console.error("Error:", error);
            });

          if (!existingCompanyData?.length) {
            // checking existing email to User table for user type Responder.
            const response = await getUserExistingEmail({
              variables: {
                newEmail: [rec.primaryContactEmail],
              },
            })
              .then((rec) => {
                return rec?.data;
              })
              .catch((error) => {
                console.log({ error });
              });
            if (!!response?.User.length) {
              decryptedEmail = await choosemethod(
                response?.User[0].email,
                "decrypt"
              );
              existingCompanyData.push(decryptedEmail);
            }
          }

          if (existingCompanyData.length > 0) {
            for (
              let datalength = 0;
              datalength < data.companyForm.length;
              datalength++
            ) {
              data.companyForm[datalength].primaryContactEmail =
                await choosemethod(
                  String(data.companyForm[datalength].primaryContactEmail)
                    .toLowerCase()
                    .trim(),
                  "decrypt"
                );
            }
            isError = true;
            setIsLoading(false);
            setSubmitProgress(false);
            setExistingCompanyName(
              decryptedEmail != ""
                ? decryptedEmail
                : existingCompanyData.join(" ")
            );
            setCompanyName(
              decryptedEmail != "" ? decryptedEmail : existingCompanyData[0]
            );
            break;
          } else {
            setExistingCompanyName(null);
          }
        }
      }
      if (existingCompanyData.length > 0) return;
      if (isError === false) {
        setSubmitProgress(true);
        postParentMessage(sendInvitationLoadingStartedMessage());
        // Inserting company data and getting inserted record.
        const existingData = CompanyData;
        if (existingData.length > 0) {
          let insertedCompanyData = existingData.map((item: any) => {
            let rec = item?.primaryContact?.email === Email ? item : null;
            if (rec !== null || rec !== "") {
              return rec;
            }
          });
          insertedCompanyData = insertedCompanyData.filter(
            (m: any) => m !== undefined && m !== "" && m !== null
          );
          // Inserting FormInvitation data
          let formInvitationDataArray: InsertFormInvitationNewCompanyMutationVariables =
            {
              object: [],
            };

          let invitationConsultantMappingDataArray: InsertInvitationConsultantMappingMutationVariables =
            {
              object: [],
            };

          // Inserting parent company mapping  data insertion
          let parentcompanymapping: CreateParentCompanyMappingMutationVariables =
            {
              input: [],
            };
          let forminvitationfundTypeArray: InsertcompanyformfundtypeMutationVariables =
            {
              object: [],
            };
          ///parent company mapping data insertion end
          if (insertedCompanyData) {
            const checkedData: any[] = insertedCompanyData.map(
              async (rec: any) => {
                const getparentcompanydata: any =
                  await checkParentCompanyExists(
                    rec.id,
                    session?.user?.role === AppRoles.Consultant
                      ? selectedFormParentCompanyId
                      : session?.company?.id
                  );
                if (getparentcompanydata?.ParentCompanyMapping.length > 0) {
                  const data1 = {
                    CompanyId: rec.id,
                    ParentCompanyId:
                      session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                    ParentCompanyMappingId:
                      getparentcompanydata?.ParentCompanyMapping[0]?.Id,
                  };
                  return data1;
                } else {
                  const data1 = {
                    CompanyId: rec.id,
                    ParentCompanyId:
                      session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                    ParentCompanyMappingId: "",
                  };
                  return data1;
                }
              }
            );

            const finalData: any = await Promise.all(checkedData);
            const newParentCompany = finalData.filter(
              (x: any) => x.ParentCompanyMappingId === ""
            );
            const existingParentCompany = finalData.filter(
              (x: any) => x.ParentCompanyMappingId !== ""
            );
            if (newParentCompany.length > 0) {
              parentcompanymapping.input = newParentCompany.map((rec: any) => {
                const data1 = {
                  CompanyId: rec.CompanyId,
                  ParentCompanyId: rec.ParentCompanyId,
                };
                return data1;
              });
            }

            ///parent company mapping data insertion start

            // parentcompanymapping.input = insertedCompanyData.map((rec: any) => {
            //   const data1 = {
            //     companyId: rec.id,
            //     parentcompanyid: session?.company?.id,
            //   };
            // });

            //- manufacturing Data Update
            // let updateCompanyDetails: UpdateCompanyDetailsMutationVariables = {
            //   companyId:Scalars['uuid'],
            //   IsManufacturing?:InputMaybe<boolean>
            // }

            // updateCompanyDetails = insertedCompanyData.map((rec: any) => {
            //   const data = {
            //     companyId: rec.id,
            //     isManufacturing: rec.isManufacturing
            //   };

            //   return data;
            // });
            //IsManufacturing: item.industry === 'Manufacturing' ? true : item.industry === 'Non Manufacturing' ? false : null

            let metadatanew = {};
            metadatanew = {
              applicationId: data.companyForm[0].applicationId ?? "",
              crn: data.companyForm[0].crn ?? "",
              industry: data.companyForm[0].industry,
            };

            let da = await updateCompanyDetails({
              variables: {
                companyId: data.companyForm[0].companyId,
                IsManufacturing:
                  data.companyForm[0].industry === "Manufacturing"
                    ? true
                    : data.companyForm[0].industry === "Non Manufacturing"
                    ? false
                    : null,
                metadata: metadatanew,
              },
            });
            let result1: any = [];
            if (newParentCompany.length > 0) {
              result1 = await insertParentCompanyMapping({
                variables: parentcompanymapping,
              });
            }
            if (
              result1 &&
              result1?.data?.insert_ParentCompanyMapping?.returning
            ) {
              result1?.data?.insert_ParentCompanyMapping?.returning.forEach(
                (items: Record<string, any>) => {
                  const formId = checkIndustrySelected(
                    insertedCompanyData.filter(
                      (x: any) => x.id === items.CompanyId
                    ),
                    data.companyForm.filter(
                      (x: any) =>
                        x.primaryContactEmail == items.primaryContact.email
                    )
                  );
                  formInvitationWhereCondition.push({
                    _and: {
                      companyId: { _eq: items.CompanyId },
                      formId: { _eq: formId },
                    },
                  });
                }
              );
            } else if (existingParentCompany.length > 0) {
              existingParentCompany.forEach((items: Record<string, any>) => {
                const formId = checkIndustrySelected(
                  insertedCompanyData.filter(
                    (x: any) => x.id === items.CompanyId
                  ),
                  data.companyForm.filter(
                    (x: any) =>
                      x.primaryContactEmail == items.primaryContact.email
                  )
                );
                formInvitationWhereCondition.push({
                  _and: {
                    companyId: { _eq: items.CompanyId },
                    formId: { _eq: formId },
                  },
                });
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
            if (
              result1 &&
              result1?.data?.insert_ParentCompanyMapping?.returning
            ) {
              formInvitationDataArray.object = await Promise.all(
                result1?.data?.insert_ParentCompanyMapping?.returning.map(
                  async (rec: any) => {
                    const currentData = insertedCompanyData.filter(
                      (x: any) => x.id === rec.CompanyId
                    );
                    let filterData = data.companyForm.filter(
                      (x: any) =>
                        x.primaryContactEmail == rec.primaryContact.email
                    );
                    const GetformId = checkIndustrySelected(
                      currentData,
                      filterData
                    );
                    const hasFormFullAICuration = hasFullAICuration(
                      session?.accessToken,
                      formId
                    );
                    const allowedAICuration: string[] = [];
                    if (
                      hasDocumentCuration(session?.accessToken, GetformId ?? "")
                    )
                      allowedAICuration.push("DocumentCuration");
                    if (hasWebCuration(session?.accessToken, GetformId ?? ""))
                      allowedAICuration.push("WebCuration");
                    const opsResult = await canEnableOPSToIQCuration(session?.accessToken, GetformId ?? "", session?.company?.id);
                    if (opsResult.eligible)
                      allowedAICuration.push("OPSToIQCuration");
                    const data_return703 = {
                      companyId: rec.CompanyId,
                      formId: GetformId,
                      email: currentData[0]?.primaryContact?.email,
                      status: FormInvitationStatus.Invited,
                      created_by: session?.user?.id,
                      updated_by: session?.user?.id,
                      durationFrom: finalFromDate,
                      durationTo: finalToDate,
                      parentcompanyId:
                        session?.user?.role === AppRoles.Consultant
                          ? selectedFormParentCompanyId
                          : session?.company?.id,
                      ParentCompanyMappingId: rec.Id,
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
                      // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                      interimCheck: {
                        isCarryForwardAsSuggestionsInvitation:
                          isCarryForwardAsSuggestionsEnabled(
                            session?.accessToken,
                            GetformId as string,
                            currentData[0]?.metadata as CompanyMetadata
                          ),
                      },
                    };

                    return data_return703;
                  }
                )
              );
            }

            if (existingParentCompany.length > 0) {
              formInvitationDataArray.object = await Promise.all(
                existingParentCompany.map(
                async (rec: any) => {
                  const currentData = insertedCompanyData.filter(
                    (x: any) => x.id === rec.CompanyId
                  );
                  let filterData = data.companyForm.filter(
                    (x: any) =>
                      x.primaryContactEmail == rec.primaryContact.email
                  );
                  const GetformId = checkIndustrySelected(
                    currentData,
                    filterData
                  );
                  const hasFormFullAICuration = hasFullAICuration(
                    session?.accessToken,
                    formId
                  );
                  const allowedAICuration: string[] = [];
                  if (
                    hasDocumentCuration(session?.accessToken, GetformId ?? "")
                  )
                    allowedAICuration.push("DocumentCuration");
                  if (hasWebCuration(session?.accessToken, GetformId ?? ""))
                    allowedAICuration.push("WebCuration");
                  const opsResult2 = await canEnableOPSToIQCuration(session?.accessToken, GetformId ?? "", session?.company?.id);
                  if (opsResult2.eligible)
                    allowedAICuration.push("OPSToIQCuration");
                  const data_return703 = {
                    companyId: rec.CompanyId,
                    formId: GetformId,
                    email: currentData[0]?.primaryContact?.email,
                    status: FormInvitationStatus.Invited,
                    created_by: session?.user?.id,
                    updated_by: session?.user?.id,
                    durationFrom: finalFromDate,
                    durationTo: finalToDate,
                    parentcompanyId:
                      session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                    ParentCompanyMappingId: rec.ParentCompanyMappingId,
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
                    // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                    interimCheck: {
                      isCarryForwardAsSuggestionsInvitation:
                        isCarryForwardAsSuggestionsEnabled(
                          session?.accessToken,
                          GetformId as string,
                          currentData[0]?.metadata as CompanyMetadata
                        ),
                    },
                  };

                  return data_return703;
                }
              )
              );
            }
            const result = await insertFormInvitation({
              variables: formInvitationDataArray,
            });

            // Insert record to InvitationConsultantMapping Table.
            if (session?.user?.role === AppRoles.Consultant) {
              if (result && result?.data?.insert_FormInvitation?.returning) {
                const data = result?.data?.insert_FormInvitation?.returning;

                await Promise.all(
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
                  })
                );
              }
            }

            forminvitationfundTypeArray.object = insertedCompanyData?.map(
              (rec: any) => {
                let filterData = data.companyForm.filter(
                  (x: any) => x.companyId == rec.companyId
                );
                const GetformId = checkIndustrySelected(rec, filterData);
                const datas = {
                  vcCompanyId:
                    session?.user?.role === AppRoles.Consultant
                      ? selectedFormParentCompanyId
                      : session?.company?.id,
                  companyId: rec.companyId,
                  formId: GetformId,
                  invitedBy: session?.user?.id,
                  fundType: {
                    fundType: fundtypevalue,
                  },
                };
                return datas;
              }
            );
            if (isenable) {
              const fundtypeinsertion = await insertCompanyFormFundType({
                variables: forminvitationfundTypeArray,
              });
            }
            if (result && result?.data?.insert_FormInvitation?.returning) {
              await InvitationProcessAfterInsertion(
                result?.data?.insert_FormInvitation
              );
              const formDetails: invitationFormDetails[] = [];
              // result?.data?.insert_FormInvitation?.returning.map(
              //   (inviteItems) => {
              //     const formData =
              //       !!AITokenValue && AITokenValue.length > 0
              //         ? AITokenValue?.filter(
              //             (items: any) =>
              //               items?.formId == inviteItems?.formId &&
              //               (items?.docWithAI == true ||
              //                 items?.onlyDoc == true)
              //           )
              //         : [];
              //     return {
              //       isAIForm: formData.length > 0,
              //       AIData: formData,
              //     };
              //   }
              // );
              reset({
                companyForm: [
                  {
                    companyId: "",
                    companyName: "",
                    country: "",
                    primaryContactName: "",
                    primaryContactEmail: "",
                    primaryContactMobileNumber: "",
                    applicationId: "",
                    crn: "",
                    industry: "",
                    fundType: "",
                  },
                ],
              });
              setIsLoading(false);
              postParentMessage(
                sendInvitationResponseMessage(
                  true,
                  formDetails,
                  FormTypesPage.Assessment
                )
              );
              setIsSuccessError("Success");
              setSubmitProgress(false);
              // cancel(); //added to refresh page
            }
          }
        } else {
          //postParentMessage(sendInvitationLoadingStartedMessage());
          // Inserting company data and getting inserted record.
          let companyDataArray: InsertCompanyMutationVariables = {
            insertObject: [],
            updateObject: [],
          };
          const insertCompanyData = data.companyForm.filter(
            (m: any) => m.companyId === "" // For new company only (Not Suggested Company).
          );
          companyDataArray.insertObject = insertCompanyData.map((item: any) => {
            //const GetformId = checkIndustrySelected(item, data);

            let rec = {
              name: item.companyName,
              primaryContact: {
                name: toTitleCase(item.primaryContactName),
                email: item.primaryContactEmail,
                phone: item.primaryContactMobileNumber,
                companysize:
                  formId === "a7755bf6-70e2-4263-9964-d090c9f611d1"
                    ? item.companySize
                    : CompanySize,
                //  OtherInfo: item.industry ?? "",
              },
              parentCompanyId:
                session?.user?.role === AppRoles.Consultant
                  ? selectedFormParentCompanyId
                  : session?.company?.id,
              platformId: session?.platform?.id,
              created_by: session?.user?.id,
              updated_by: session?.user?.id,
              country: item.country,
              metadata: {
                applicationId: item.applicationId ?? "",
                crn: item.crn ?? "",
                industry: item.industry ?? "",
              },
              IsManufacturing:
                item.industry === "Manufacturing"
                  ? true
                  : item.industry === "Non Manufacturing"
                  ? false
                  : null,
            };

            return rec;
          });
          let updateCompanyData = data.companyForm.filter(
            (m: any) => !!m.companyId // For Suggested Company only.
          );
          companyDataArray.updateObject = updateCompanyData.map((m: any) => {
            let newmetadata = {};

            newmetadata = {
              applicationId: m.applicationId ?? "",
              crn: m.crn ?? "",
              industry: m.industry ?? "",
            };

            const data = {
              where: {
                _and: {
                  id: { _eq: m?.companyId },
                  parentCompanyId: { _is_null: true },
                },
              },
              _set: {
                parentCompanyId:
                  session?.user?.role === AppRoles.Consultant
                    ? selectedFormParentCompanyId
                    : session?.company?.id,
                metadata: newmetadata,
                IsManufacturing:
                  m.industry === "Manufacturing"
                    ? true
                    : m.industry === "Non Manufacturing"
                    ? false
                    : null,
              },
            };
            return data;
          });

          const insertedCompany = await insertCompany({
            variables: companyDataArray,
          });
          let insertedCompanyData =
            insertedCompany?.data?.insert_Company?.returning;

          if (
            insertedCompanyData?.length === 0 &&
            updateCompanyData.length > 0
          ) {
            //  send invite to existing company from new invitition page.
            insertedCompanyData = updateCompanyData;

            // if (
            //   insertedCompany?.data?.update_Company_many &&
            //   insertedCompany?.data?.update_Company_many[0]?.returning
            // ) {
            //   Array.prototype.push.apply(
            //     insertedCompanyData,
            //     insertedCompany?.data?.update_Company_many[0]?.returning
            //   );
            // }
            // Inserting FormInvitation data
            let formInvitationDataArray: InsertFormInvitationNewCompanyMutationVariables =
              {
                object: [],
              };

            let invitationConsultantMappingDataArray: InsertInvitationConsultantMappingMutationVariables =
              {
                object: [],
              };

            // Inserting parent company mapping  data insertion
            let parentcompanymapping: CreateParentCompanyMappingMutationVariables =
              {
                input: [],
              };

            let forminvitationfundTypeArray: InsertcompanyformfundtypeMutationVariables =
              {
                object: [],
              };
            ///parent company mapping data insertion end

            if (updateCompanyData) {
              // parentcompanymappingremove.update_ParentCompanyMapping = updateCompanyData.map((rec: any) => {
              //   const data1 = {
              //     companyId: rec.companyId,
              //   };

              //   return data1;
              // });
              let companyid = "";

              parentcompanymapping.input = updateCompanyData.map((rec: any) => {
                if (rec.companyId) {
                  if (companyid === "") {
                    companyid = rec?.companyId;
                  }
                  const data1 = {
                    CompanyId: rec.companyId,
                    ParentCompanyId:
                      session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                  };
                  return data1;
                }
              });

              const result3 = await updateParentCompanyMapping({
                variables: { companyId: companyid },
              });

              ///parent company mapping data insertion end);
              const result1 = await insertParentCompanyMapping({
                variables: parentcompanymapping,
              });
              if (
                result1 &&
                result1?.data?.insert_ParentCompanyMapping?.returning
              ) {
                result1?.data?.insert_ParentCompanyMapping?.returning.forEach(
                  (items: Record<string, any>) => {
                    const formId = checkIndustrySelected(
                      updateCompanyData.filter(
                        (x: any) => x.id === items.CompanyId
                      ),
                      data.companyForm.filter(
                        (x: any) => x.companyId == items.CompanyId
                      )
                    );
                    formInvitationWhereCondition.push({
                      _and: {
                        companyId: { _eq: items.CompanyId },
                        formId: { _eq: formId },
                      },
                    });
                  }
                );
                let forms_FormInvitationDetail: any = [];
                if (formInvitationWhereCondition.length > 0) {
                  forms_FormInvitationDetail = await forms_DetailBycustomWhere({
                    variables: {
                      where: { _or: formInvitationWhereCondition },
                    },
                  });
                }
                formInvitationDataArray.object = await Promise.all(
                  result1?.data?.insert_ParentCompanyMapping?.returning.map(
                    async (rec: any) => {
                      const currentData = updateCompanyData.filter(
                        (x: any) => x.companyId === rec.CompanyId
                      );
                      let filterData = data.companyForm.filter(
                        (x: any) => x.companyId == rec.CompanyId
                      );
                      const GetformId = checkIndustrySelected(
                        currentData,
                        filterData
                      );

                      // Compute per-row curation flags using each row's resolved GetformId
                      const rowFormId = GetformId ?? undefined;
                      const hasDocCuration = hasDocumentCuration(
                        session?.accessToken,
                        rowFormId
                      );
                      const hasWebCuration_ = hasWebCuration(
                        session?.accessToken,
                        rowFormId
                      );

                      // Build per-row allowedAICuration array
                      const allowedAICuration: string[] = [];
                      if (hasWebCuration_) {
                        allowedAICuration.push("WebCuration");
                      }
                      if (hasDocCuration) {
                        allowedAICuration.push("DocumentCuration");
                      }
                      const opsResult3 = await canEnableOPSToIQCuration(session?.accessToken, rowFormId, session?.company?.id);
                      if (opsResult3.eligible) {
                        allowedAICuration.push("OPSToIQCuration");
                      }
                      const metadata = {
                        AIData: {
                          allowedAICuration: allowedAICuration,
                          triggeredCuration: [],
                        },
                        ...(opsResult3.eligible && {
                          opsData: {
                            opsCompanyId: opsResult3.opsCompanyId,
                            opsCompanyName: opsResult3.opsCompanyName,
                          },
                        }),
                      };

                      const data_return982 = {
                        companyId: rec.CompanyId,
                        formId: GetformId,
                        email: currentData[0]?.primaryContactEmail,
                        status: FormInvitationStatus.Invited,
                        created_by: session?.user?.id,
                        updated_by: session?.user?.id,
                        durationFrom: finalFromDate,
                        durationTo: finalToDate,
                        parentcompanyId:
                          session?.user?.role === AppRoles.Consultant
                            ? selectedFormParentCompanyId
                            : session?.company?.id,
                        ParentCompanyMappingId: rec.Id,
                        metadata: metadata,
                        // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                        interimCheck: {
                          isCarryForwardAsSuggestionsInvitation:
                            isCarryForwardAsSuggestionsEnabled(
                              session?.accessToken,
                              GetformId as string,
                              currentData[0]?.metadata as CompanyMetadata
                            ),
                        },
                      };
                      return data_return982;
                    }
                  )
                );
              }

              ///parent company mapping data insertion end
            }
            const result = await insertFormInvitation({
              variables: formInvitationDataArray,
            });
            // Insert record to InvitationConsultantMapping Table.

            if (session?.user?.role === AppRoles.Consultant) {
              if (result && result?.data?.insert_FormInvitation?.returning) {
                const data = result?.data?.insert_FormInvitation?.returning;

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

            forminvitationfundTypeArray.object = updateCompanyData?.map(
              (rec: any) => {
                let filterData = data.companyForm.filter(
                  (x: any) => x.companyId == rec.companyId
                );
                const GetformId = checkIndustrySelected(rec, filterData);
                const datas = {
                  vcCompanyId:
                    session?.user?.role === AppRoles.Consultant
                      ? selectedFormParentCompanyId
                      : session?.company?.id,
                  companyId: rec.companyId,
                  formId: GetformId,
                  invitedBy: session?.user?.id,
                  fundType: {
                    fundType: fundtypevalue,
                  },
                };
                return datas;
              }
            );
            if (isenable) {
              const fundtypeinsertion = await insertCompanyFormFundType({
                variables: forminvitationfundTypeArray,
              });
            }
            if (result && result?.data?.insert_FormInvitation?.returning) {
              await InvitationProcessAfterInsertion(
                result?.data?.insert_FormInvitation
              );
              const formDetails =
                result?.data?.insert_FormInvitation?.returning.map(
                  (inviteItems) => {
                    const hasAnyAICapabilities = isFormAIEnabled(
                      session?.accessToken,
                      inviteItems?.formId
                    );
                    const aiData = getFormAIPlans(
                      session?.accessToken,
                      inviteItems?.formId
                    );
                    const transformedAIData =
                      aiData.length > 0
                        ? [
                            {
                              formId: inviteItems?.formId,
                              docWithAI: hasFullAICuration(
                                session?.accessToken,
                                inviteItems?.formId
                              ), // Both DocumentCuration + WebCuration
                              onlyDoc:
                                hasDocumentCuration(
                                  session?.accessToken,
                                  inviteItems?.formId
                                ) &&
                                !hasWebCuration(
                                  session?.accessToken,
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
              reset({
                companyForm: [
                  {
                    companyId: "",
                    companyName: "",
                    country: "IN",
                    primaryContactName: "",
                    primaryContactEmail: "",
                    primaryContactMobileNumber: "",
                    applicationId: "",
                    crn: "",
                    industry: "",
                    ismanufacturing: "",
                    fundType: "",
                  },
                ],
              });
              setIsLoading(false);
              postParentMessage(
                sendInvitationResponseMessage(
                  true,
                  formDetails,
                  FormTypesPage.Assessment
                )
              );
              setIsSuccessError("Success");
              setSubmitProgress(false);
              // cancel(); //added to refresh page
            }
          } else {
            //  send invite to new company from new invitition page.
            // Merging two array into one array.
            if (
              insertedCompany?.data?.update_Company_many &&
              insertedCompany?.data?.update_Company_many[0]?.returning
            ) {
              Array.prototype.push.apply(
                insertedCompanyData,
                insertedCompany?.data?.update_Company_many[0]?.returning
              );
            }

            // Inserting FormInvitation data
            let formInvitationDataArray: InsertFormInvitationNewCompanyMutationVariables =
              {
                object: [],
              };

            let invitationConsultantMappingDataArray: InsertInvitationConsultantMappingMutationVariables =
              {
                object: [],
              };

            // Inserting parent company mapping  data insertion
            let parentcompanymapping: CreateParentCompanyMappingMutationVariables =
              {
                input: [],
              };
            let forminvitationfundTypeArray: InsertcompanyformfundtypeMutationVariables =
              {
                object: [],
              };
            ///parent company mapping data insertion end

            if (insertedCompanyData) {
              parentcompanymapping.input = insertedCompanyData.map(
                (rec: any) => {
                  const data1 = {
                    CompanyId: rec.id,
                    ParentCompanyId:
                      session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                  };
                  return data1;
                }
              );
              let platformid: any = session?.platform?.id;

              const result1 = await insertParentCompanyMapping({
                variables: parentcompanymapping,
              });
              if (
                result1 &&
                result1?.data?.insert_ParentCompanyMapping?.returning
              ) {
                result1?.data?.insert_ParentCompanyMapping?.returning.forEach(
                  (items: Record<string, any>) => {
                    const formId = checkIndustrySelected(
                      insertedCompanyData?.filter(
                        (x: any) => x.id === items.CompanyId
                      ),
                      data.companyForm.filter(
                        (x: any) => x.companyId == items.id
                      )
                    );
                    formInvitationWhereCondition.push({
                      _and: {
                        companyId: { _eq: items.CompanyId },
                        formId: { _eq: formId },
                      },
                    });
                  }
                );
                let forms_FormInvitationDetail: any = [];
                if (formInvitationWhereCondition.length > 0) {
                  forms_FormInvitationDetail = await forms_DetailBycustomWhere({
                    variables: {
                      where: { _or: formInvitationWhereCondition },
                    },
                  });
                }
                formInvitationDataArray.object = await Promise.all(
                  result1?.data?.insert_ParentCompanyMapping?.returning.map(
                    async (rec: any) => {
                      const currentData: any = insertedCompanyData?.filter(
                        (x: any) => x.id === rec.CompanyId
                      );
                      let filterData = data.companyForm.filter(
                        (x: any) => x.companyId == rec.id
                      );
                      const GetformId = checkIndustrySelected(
                        currentData,
                        filterData
                      );

                      // Compute per-row curation flags using each row's resolved GetformId
                      const rowFormId = GetformId ?? undefined;
                      const hasDocCuration = hasDocumentCuration(
                        session?.accessToken,
                        rowFormId
                      );
                      const hasWebCuration_ = hasWebCuration(
                        session?.accessToken,
                        rowFormId
                      );

                      // Build per-row allowedAICuration array
                      const allowedAICuration: string[] = [];
                      if (hasWebCuration_) {
                        allowedAICuration.push("WebCuration");
                      }
                      if (hasDocCuration) {
                        allowedAICuration.push("DocumentCuration");
                      }
                      const opsResult4 = await canEnableOPSToIQCuration(session?.accessToken, rowFormId, session?.company?.id);
                      if (opsResult4.eligible) {
                        allowedAICuration.push("OPSToIQCuration");
                      }
                      const metadata = {
                        AIData: {
                          allowedAICuration: allowedAICuration,
                          triggeredCuration: [],
                        },
                        ...(opsResult4.eligible && {
                          opsData: {
                            opsCompanyId: opsResult4.opsCompanyId,
                            opsCompanyName: opsResult4.opsCompanyName,
                          },
                        }),
                      };

                      const data_return = {
                        companyId: rec.CompanyId,
                        formId: GetformId,
                        email: currentData[0]?.primaryContact?.email,
                        status: FormInvitationStatus.Invited,
                        // forms_FormInvitationDetail?.data?.FormInvitation?.filter(
                        //   (items: Record<string, any>) =>
                        //     items.companyId == rec.CompanyId &&
                        //     items.formId == GetformId
                        // ).length == 0
                        //   ? hasFormFullAICuration
                        //     ? FormInvitationStatus.Processing
                        //     : FormInvitationStatus.Invited
                        //   : FormInvitationStatus.Invited,
                        created_by: session?.user?.id,
                        updated_by: session?.user?.id,
                        durationFrom: finalFromDate,
                        durationTo: finalToDate,
                        parentcompanyId:
                          session?.user?.role === AppRoles.Consultant
                            ? selectedFormParentCompanyId
                            : session?.company?.id,
                        ParentCompanyMappingId: rec.Id,
                        metadata: metadata,
                        // [CARRY-FORWARD-AS-SUGGESTIONS-FEATURE]
                        interimCheck: {
                          isCarryForwardAsSuggestionsInvitation:
                            isCarryForwardAsSuggestionsEnabled(
                              session?.accessToken,
                              GetformId as string,
                              currentData[0]?.metadata as CompanyMetadata
                            ),
                        },
                      };

                      return data_return;
                    }
                  )
                );
              }

              ///parent company mapping data insertion end

              forminvitationfundTypeArray.object = insertedCompanyData?.map(
                (rec: any) => {
                  let filterData = data.companyForm.filter(
                    (x: any) => x.companyId == rec.id
                  );
                  const GetformId = checkIndustrySelected(rec, filterData);
                  const datas = {
                    vcCompanyId:
                      session?.user?.role === AppRoles.Consultant
                        ? selectedFormParentCompanyId
                        : session?.company?.id,
                    companyId: rec.id,
                    formId: GetformId,
                    invitedBy: session?.user?.id,
                    fundType: {
                      fundType: fundtypevalue,
                    },
                  };
                  return datas;
                }
              );
            }
            const result = await insertFormInvitation({
              variables: formInvitationDataArray,
            });

            // Insert record to InvitationConsultantMapping Table.

            if (session?.user?.role === AppRoles.Consultant) {
              if (result && result?.data?.insert_FormInvitation?.returning) {
                const data = result?.data?.insert_FormInvitation?.returning;

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

            if (isenable) {
              const fundtypeinsertion = await insertCompanyFormFundType({
                variables: forminvitationfundTypeArray,
              });
            }
            if (result && result?.data?.insert_FormInvitation?.returning) {
              await InvitationProcessAfterInsertion(
                result?.data?.insert_FormInvitation
              );
              const formDetails =
                result?.data?.insert_FormInvitation?.returning.map(
                  (inviteItems) => {
                    const hasAnyAICapabilities = isFormAIEnabled(
                      session?.accessToken,
                      inviteItems?.formId
                    );
                    const aiData = getFormAIPlans(
                      session?.accessToken,
                      inviteItems?.formId
                    );
                    const transformedAIData =
                      aiData.length > 0
                        ? [
                            {
                              formId: inviteItems?.formId,
                              docWithAI: hasFullAICuration(
                                session?.accessToken,
                                inviteItems?.formId
                              ), // Both DocumentCuration + WebCuration
                              onlyDoc:
                                hasDocumentCuration(
                                  session?.accessToken,
                                  inviteItems?.formId
                                ) &&
                                !hasWebCuration(
                                  session?.accessToken,
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
              reset({
                companyForm: [
                  {
                    companyId: "",
                    companyName: "",
                    country: "IN",
                    primaryContactName: "",
                    primaryContactEmail: "",
                    primaryContactMobileNumber: "",
                    applicationId: "",
                    crn: "",
                    industry: "",
                    ismanufacturing: "",
                    fundType: "",
                  },
                ],
              });
              setIsLoading(false);
              postParentMessage(
                sendInvitationResponseMessage(
                  true,
                  formDetails,
                  FormTypesPage.Assessment
                )
              );
              setIsSuccessError("Success");
              setSubmitProgress(false);
              //cancel(); //added to refresh page
            }
          }
          //else
        }
      } else {
        setIsLoading(false);
        postParentMessage(sendInvitationValidationFailedMessage());
      }
    } catch (error) {
      setIsLoading(false);
      postParentMessage(sendInvitationValidationFailedMessage());
    }
  };

  const addFormFields = () => {
    prepend({
      companyId: "",
      companyName: "",
      country: "",
      primaryContactName: "",
      primaryContactEmail: "",
      primaryContactMobileNumber: "",
      applicationId: "",
      crn: "",
      industry: "",
      ismanufacturing: "",
      fundType: "",
      companySize: "",
    });
  };

  const selectCompanyName = async (
    index: number,
    rec: string,
    itemId: string
  ) => {
    const existCompany = companySuggestionList?.find(
      (m: any) => m.name === rec
    );
    // console.log("checking", index, rec, itemId, existCompany, existCompany?.id);
    if (companyExistRef.current !== !!existCompany) {
      companyExistRef.current = !!existCompany;

      setValue(`companyForm.${index}.companyId`, "");
      setValue(`companyForm.${index}.country`, "");
      setValue(`companyForm.${index}.primaryContactName`, "");
      setValue(`companyForm.${index}.primaryContactEmail`, "");
      setValue(`companyForm.${index}.primaryContactMobileNumber`, "");
      setValue(`companyForm.${index}.industry`, "");
      setValue(`companyForm.${index}.ismanufacturing`, "");
      setselectedcompany(existCompany?.id);
      if (
        vcfundtypedata?.data?.CompanyFormFundtype?.filter(
          (x: any) => x.companyId == existCompany?.id
        )?.length
      ) {
        isenable = false;
      } else {
        isenable = true;
      }
    } else {
      setselectedcompany("00000000-0000-0000-0000-000000000000");
      setCountryName("IN");
      setValue(`companyForm.${index}.country`, "IN");
      isenable = true;
      return;
    }

    if (existCompany) {
      setValue(`companyForm.${index}.companyId`, existCompany?.id);
      setValue(
        `companyForm.${index}.country`,
        countryList.find((a: any) => a.value === existCompany?.country)?.value
      );
      setCountryName(
        countryList.find((a: any) => a.value === existCompany?.country)?.value
      );
      setValue(
        `companyForm.${index}.primaryContactName`,
        existCompany?.primaryContact?.name
      );
      let emailid = await choosemethod(
        existCompany?.primaryContact?.email,
        "decrypt"
      );
      setValue(`companyForm.${index}.primaryContactEmail`, emailid);
      setValue(
        `companyForm.${index}.primaryContactMobileNumber`,
        existCompany?.primaryContact?.phone
      );
      let manufacturingMapping = existCompany?.IsManufacturing
        ? "Manufacturing"
        : existCompany?.IsManufacturing == false
        ? "Non Manufacturing"
        : null;
      setValue(
        `companyForm.${index}.ismanufacturing`,
        industryList.find((a) => a.value === manufacturingMapping)?.value
      );
      setValue(
        `companyForm.${index}.industry`,
        industryList.find((a) => a.value === manufacturingMapping)?.value
      );
    }
  };

  const checkExistCompany = (companyName: any, controllerValue: any) => {
    let result = false;
    if (!!companySuggestedData) {
      result =
        companySuggestedData?.Company.filter(
          (d) => d.name === getValues(companyName)
        ).length > 0
          ? true
          : false;
    }
    if (!getValues(controllerValue)) {
      result = false;
    }
    return result;
  };
  const removeerror = async (fundtypevalue: any) => {
    if (isenable) {
      if (
        fundtypevalue !== "" &&
        fundtypevalue != null &&
        fundtypevalue != undefined
      ) {
        await setfundTypeRequired(false);
      }
    }
  };
  const validateFundType = (data: any) => {
    setIsLoading(true);

    if (isenable) {
      let fundtypevalue = "";

      if (dropdownvalue.length === 1) {
        fundtypevalue = dropdownvalue[0]?.value;
      } else {
        fundtypevalue = data?.companyForm[0]?.fundType;
      }

      if (fundtypevalue === "") {
        setfundTypeRequired(true);
        setIsLoading(false);
        setSubmitProgress(false);
        return false;
      } else {
        const isValidFundType = dropdownvalue.some(
          (x: any) =>
            x.label.toString().toLowerCase() ===
            fundtypevalue.toString().toLowerCase()
        );

        if (!isValidFundType) {
          setfundTypeError(true);
          setIsLoading(false);
          return false;
        }

        setfundTypeError(false);
        setfundTypeRequired(false);
        setIsLoading(false);
        setSubmitProgress(false);
        return true;
      }
    }
    setIsLoading(false);
    return true;
  };

  const onSubmit = async (e: any) => {
    e.preventDefault();
    captchaValidationBeforeSubmitHandler(async () => {
      const formData = getValues();
      const data = sanitiseArrayValues<newCompanyForms>(formData.companyForm);

      data.forEach((item: any) => {
        item.primaryContactEmail = item.primaryContactEmail.toLowerCase();
      });

      const formSubmissionData = {
        companyForm: data,
      };
      setValue("companyForm", data);
      const isValidAllFields = await trigger();
      const isFundTypeValid = validateFundType(formSubmissionData);
      if (!isValidAllFields || !isFundTypeValid) return;
      await formSubmitted(formSubmissionData as any);
    }, "sendInviteIframe");
  };

  return (
    <form onSubmit={onSubmit}>
      {/* <LoadingOverlay visible={submitProgress} /> */}
      <Spinner visible={isLoading} />
      <Stack spacing={12}>
        {dynamicCompanyForm.map((item, index) => {
          return (
            <Stack key={item.id} spacing={15}>
              <input
                type="hidden"
                {...register(`companyForm.${index}.companyId`)}
              />
              <Flex justify="space-between" align="baseline">
                <Text
                  className={classes.commonMargin}
                  mt={0}
                  mb={0}
                  size={12}
                  fw={400}
                  color="dark.3"
                >
                  {watch(`companyForm.${index}.companyName`)
                    ? `Partner Information`
                    : "Enter New Partner information"}
                </Text>
                <Flex align="center">
                  {!errors.companyForm && index === 0 && (
                    <Group mb={0} position="right" spacing={2}>
                      <Text
                        size={12}
                        style={{ color: "#444444", fontWeight: "400" }}
                      >
                        Add Partners
                      </Text>
                      <ActionIcon color="#003B52" className="ActionIconStyles">
                        <IconPlus
                          className={classes.repeatFormIcon}
                          onClick={async () => {
                            // Validate all current fields before allowing a new form
                            const isValid = await trigger("companyForm");
                            if (!isValid) {
                              // If validation fails, return early and don't add new form
                              return;
                            }

                            // If validation passes, append new form
                            prepend({
                              companyId: "",
                              companyName: "",
                              country: "IN",
                              primaryContactName: "",
                              primaryContactEmail: "",
                              primaryContactMobileNumber: "",
                              applicationId: "",
                              crn: "",
                              industry: "",
                              ismanufacturing: "",
                              fundType: "",
                              companySize: "",
                            });
                          }}
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
                        Delete Partners
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

              <Controller
                render={({ field: { name, onChange, onBlur, ref, value } }) => (
                  <Stack spacing="xs" style={{ gap: "3px" }}>
                    <Autocomplete
                      classNames={{ dropdown: "mantine-Autocomplete-dropdown" }}
                      className={classes.SideDrawerSearch}
                      style={{
                        width: "100%",
                        backgroundColor: "#fff",
                        borderRadius: "5px",
                      }}
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
                      radius={0}
                      variant="unstyled"
                      name={name}
                      data={companyNameSuggestionList.sort((a: any, b: any) =>
                        a.label.localeCompare(b.label)
                      )}
                      placeholder="Company name*"
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(val) => {
                        onChange(val);
                        selectCompanyName(index, val, item.id);
                        clearErrors();
                        setRecomNewAssessmentPeriod(false);
                      }}
                      value={value}
                    />
                    {errors?.companyForm &&
                      errors?.companyForm[index]?.companyName && (
                        <Text size={12} color="radioCheckBoxError.0">
                          {errors?.companyForm[index]?.companyName?.message}
                        </Text>
                      )}
                  </Stack>
                )}
                name={`companyForm.${index}.companyName`}
                control={control}
              />

              {!isPredealFrom ? (
                <Controller
                  render={({
                    field: { name, onBlur, onChange, ref, value },
                  }) => (
                    <Select
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
                      placeholder="Search or select country"
                      searchable
                      defaultValue={countryName}
                      nothingFound="No options"
                      data={countryList}
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(val) => {
                        onChange(val);
                      }}
                      value={value}
                      disabled={checkExistCompany(
                        `companyForm.${index}.companyName`,
                        `companyForm.${index}.country`
                      )}
                    />
                  )}
                  name={`companyForm.${index}.country`}
                  control={control}
                />
              ) : (
                <input
                  type="hidden"
                  {...register(`companyForm.${index}.country`, { value: "IN" })}
                />
              )}

              <Controller
                render={({ field }) => (
                  <Stack spacing="xs" style={{ gap: "3px" }}>
                    <TextInput
                      placeholder="Full Name of Primary Contact"
                      {...field}
                      disabled={checkExistCompany(
                        `companyForm.${index}.companyName`,
                        `companyForm.${index}.primaryContactName`
                      )}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Only allow alphabets and spaces
                        const nameRegex = /^[A-Za-z\s]*$/;
                        if (nameRegex.test(value) || value === "") {
                          field.onChange(value);
                          clearErrors(
                            `companyForm.${index}.primaryContactName`
                          );
                        } else {
                          // If invalid input, keep the previous value and show error
                          setError(`companyForm.${index}.primaryContactName`, {
                            type: "manual",
                            message: "Full Name must contain only alphabets",
                          });
                        }
                      }}
                    />
                    {errors?.companyForm &&
                      errors?.companyForm[index]?.primaryContactName && (
                        <Text size={12} color="radioCheckBoxError.0">
                          {
                            errors?.companyForm[index]?.primaryContactName
                              ?.message
                          }
                        </Text>
                      )}
                  </Stack>
                )}
                name={`companyForm.${index}.primaryContactName`}
                control={control}
              />

              <Controller
                render={({ field }) => (
                  <Stack spacing="xs" style={{ gap: "3px" }}>
                    <TextInput
                      placeholder="Email Id. of Primary Contact*"
                      {...field}
                      disabled={checkExistCompany(
                        `companyForm.${index}.companyName`,
                        `companyForm.${index}.primaryContactEmail`
                      )}
                    />
                    {errors?.companyForm &&
                      errors?.companyForm[index]?.primaryContactEmail && (
                        <Text size={12} color="radioCheckBoxError.0">
                          {
                            errors?.companyForm[index]?.primaryContactEmail
                              ?.message
                          }
                        </Text>
                      )}
                  </Stack>
                )}
                name={`companyForm.${index}.primaryContactEmail`}
                control={control}
              />

              <Controller
                render={({ field }) => (
                  <Stack style={{ gap: "3px" }}>
                    <TextInput
                      placeholder="Mobile Number of Primary Contact"
                      {...field}
                      // disabled={checkExistCompany(
                      //   `companyForm.${index}.companyName`,
                      //   `companyForm.${index}.primaryContactMobileNumber`
                      // )}
                      onChange={(e) =>
                        field.onChange(
                          e.target.value.replace(/\D/g, "").slice(0, 10)
                        )
                      }
                    />
                    {errors?.companyForm &&
                      errors?.companyForm[index]
                        ?.primaryContactMobileNumber && (
                        <Text size={12} color="radioCheckBoxError.0">
                          {
                            errors?.companyForm[index]
                              ?.primaryContactMobileNumber?.message
                          }
                        </Text>
                      )}
                  </Stack>
                )}
                name={`companyForm.${index}.primaryContactMobileNumber`}
                control={control}
              />

              {industryList.length > 0 ? (
                <Controller
                  render={({
                    field: { name, onBlur, onChange, ref, value },
                  }) => (
                    <Select
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
                      placeholder="Search or select industry"
                      searchable
                      nothingFound="No options"
                      data={industryList}
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(val) => {
                        onChange(val);
                      }}
                      value={value}
                      disabled={checkExistCompany(
                        `companyForm.${index}.companyName`,
                        `companyForm.${index}.industry`
                      )}
                    />
                  )}
                  name={`companyForm.${index}.industry`}
                  control={control}
                />
              ) : (
                ""
              )}
              {isenable ? (
                <Controller
                  render={({
                    field: { name, onBlur, onChange, ref, value },
                  }) => (
                    <Stack style={{ gap: "3px" }}>
                      <Select
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
                        placeholder={
                          isPredealFrom
                            ? "Search or select country*"
                            : "Search or select fund type*"
                        }
                        searchable
                        nothingFound="No options"
                        data={dropdownvalue}
                        ref={ref}
                        onBlur={onBlur}
                        onChange={(val) => {
                          onChange(val);
                          removeerror(val);
                        }}
                        value={value}
                      />
                      {(fundTypeRequired && (
                        <Text size={12} color="radioCheckBoxError.0">
                          Fund type is required
                        </Text>
                      )) ||
                        (fundTypeError && (
                          <Text size={12} color="radioCheckBoxError.0">
                            Invalid fund type
                          </Text>
                        ))}
                    </Stack>
                  )}
                  name={`companyForm.${index}.fundType`}
                  control={control}
                />
              ) : (
                ""
              )}
              {formId == "a7755bf6-70e2-4263-9964-d090c9f611d1" ? (
                <Controller
                  render={({
                    field: { name, onBlur, onChange, ref, value },
                  }) => (
                    <Select
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
                      placeholder="Search or select company size"
                      searchable
                      nothingFound="No options"
                      data={[
                        { label: "Startup", value: "startup " },
                        { label: "Micro", value: "micro" },
                        { label: "Small-Medium", value: "small-medium" },
                        { label: "Large", value: "large" },
                      ]}
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(val) => {
                        onChange(val);
                      }}
                      value={value}
                      disabled={checkExistCompany(
                        `companyForm.${index}.companyName`,
                        `companyForm.${index}.companySize`
                      )}
                    />
                  )}
                  name={`companyForm.${index}.companySize`}
                  control={control}
                />
              ) : (
                <Controller
                  render={({
                    field: { name, onBlur, onChange, ref, value },
                  }) => (
                    <Select
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
                      rightSection={<span className="hiddenDownArrow" />}
                      hidden
                      placeholder="Search or select company size"
                      searchable
                      nothingFound="No options"
                      data={[
                        { label: "Startup", value: "startup " },
                        { label: "Micro", value: "micro" },
                        { label: "Small-Medium", value: "small-medium" },
                        { label: "Large", value: "large" },
                      ]}
                      ref={ref}
                      onBlur={onBlur}
                      onChange={(val) => {
                        onChange(val);
                      }}
                      defaultValue={CompanySize}
                      disabled={checkExistCompany(
                        `companyForm.${index}.companyName`,
                        `companyForm.${index}.companySize`
                      )}
                    />
                  )}
                  name={`companyForm.${index}.companySize`}
                  control={control}
                />
              )}
            </Stack>
          );
        })}

        <Stack spacing="xs" style={{ gap: "3px" }}>
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
              (assessmentRequired && (
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
                  Please select an Assessment
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
                  Assessment period selected is invalid. Please select valid
                  period.
                </Text>
              )) ||
              (existingCompanyName && (
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
                  Assessment company details for {CompanyName} already exists.
                  {/* Company name is already exist            */}
                </Text>
              )) ||
              (duplicateCompanyName && (
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
                  Assessment company {duplicateCompanyName} is duplicate.
                </Text>
              ))
          }
        </Stack>
        <Group
          className={classes.actionButtons}
          position="right"
          spacing="sm"
          pb={50}
        >
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

const NewCompanyForm = () => {
  return (
    <Box>
      <NewCompanyFormFields />
    </Box>
  );
};
export default NewCompanyForm;
