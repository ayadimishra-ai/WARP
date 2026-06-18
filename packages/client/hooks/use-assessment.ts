import {
  Column,
  createColumnHelper,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  Header,
  Row,
  Updater,
  useReactTable,
} from "@tanstack/react-table";
// import assessmentListData from "./assessment.data";
import {
  AddressMapping_Bool_Exp,
  FormInvitation_Bool_Exp,
} from "@warp/graphql/generated/types";
import { useGetaddressesbyuser_IdQuery } from "@warp/graphql/queries/generated/get-address-by-userid";
import { useGetAssessmentListLazyQuery } from "@warp/graphql/queries/generated/get-assessment-list.query";
import { useGetAssessmentListingDetailsQuery } from "@warp/graphql/queries/generated/get-assessment-listing-details";
import { useGetAssessorConsultantMappingByConsultantCompanyIdQuery } from "@warp/graphql/queries/generated/get-assessor-consultant-mapping-by-consultant-company-id";
import { useGetConsultantAssessmentListLazyQuery } from "@warp/graphql/queries/generated/get-consultant-assessment-list";
import { useGetConsultantFormWithDetailsQuery } from "@warp/graphql/queries/generated/get-consultant-form-with-details";
import { useGetFormWithDetailsLazyQuery } from "@warp/graphql/queries/generated/get-form-with-details";
import { useGetGlobalMasterByInternalRequestCompanyQuery } from "@warp/graphql/queries/generated/get-global-master-by-InternalRequestCompany";
import { useGetGlobalMasterByTypeLazyQuery } from "@warp/graphql/queries/generated/get-global-master-by-type";
import {
  AppRoles,
  AtherCompanyid,
  bulkFileCurationStatus,
  FormInvitationStatus,
  FormInvitationUIStatus,
  FormTypes,
  InvitationAIStatus,
  SourcesType,
} from "@warp/shared/constants/app.constants";
import {
  hasDocumentCuration,
  hasWebCuration,
} from "@warp/shared/utils/jwt-ai.util";
import dayjs from "dayjs";
import { useRouter } from "next/router";
import React, { ReactNode, useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { useUserSession } from "./use-user-session";
export type ColumnType = {
  Id: string;
  SubmissionId: string;
  Questionnaire: string;
  "Requested By": string;
  QuestionnareId: string;
  "Requested From": string;
  "Requested From User": string;
  "Requested To": string;
  "Requested To User": string;
  Location: string;
  InviteeCompanyId: string;
  Period: string;
  "Requested On": string;
  Status: string;
  OriginalStatus: string;
  Score: string;
  "Completion (%)": number;
  Actions: string;
  InviteeCompanyName: string;
  isgroupform: boolean;
  isindustryselected: boolean;
  groupform: any;
  ParentUserName: any;
  commentCreated_at: any;
  isQuestionReassigned: boolean;
  isRecommendationIcon: boolean;
  isCarryForward: boolean;
  isDeviation: boolean;
  deviationCount: number;
  Submission_Status: string;
  lastAttemptedQuestionId: string;
  vcCompany: String;
  pcCompany: String;
  ParentUserId: any;
  UserId: any;
  AIStatus: InvitationAIStatus;
  pcCompanyId: String;
  formId: String;
  failedMessage: String;
  isFileCurating: boolean;
  AIBulkDocumentProcessings: Record<string, any>[];
  Sources: Record<string, any>[];
  metadata: { AIData: AIData };
  isReviewer: boolean;
  isSelf: boolean;
  parentcompanyId: string | null;
  companyId: string | null;
  reviewerParentCompanyId: string | null;
  formType: string;
  declinedCount: number;
  resubmittedCount: number;
  totalQuestions: number;
};

export type DataTableType = {
  tableHeadings: Header<ColumnType, unknown>[][];
  rows: Row<ColumnType>[];
  allData: ColumnType[];
  renderRow: (cell: any) => ReactNode | JSX.Element;
  renderHeader: (header: any, context: any) => ReactNode | JSX.Element;
  renderSort: (header: any) => string | null;
};

export type TableHeader = {
  tableHeadings: Header<ColumnType, unknown>[][];
  renderHeader: (header: any, context: any) => ReactNode | JSX.Element;
};

export type FilterType = (column: Column<ColumnType, unknown>) => {
  firstValue: unknown;
  columnFilterValue: {
    getMinNumber: number;
    getMaxNumber: number;
    getTextValue: string;
    setFilterValueNumber: (e: any, range: string) => void;
    setFilterValueText: (e: any) => void;
  };
};

export type PaginationType = {
  previous: () => void;
  next: () => void;
  page: number;
  onPageChange: (updater: Updater<number>) => void;
  getTotalCount: number;
  getPageSize: number;
  setPageSize: (updater: Updater<number>) => void;
};

export type StatesFilterType = {
  getRowsByStatus: (updater: string) => void;
  getRowsCountByStatus: (
    updater: string,
    searchFilter: {
      questionariesSearchValue?: String;
      organisationSearchValue?: String;
      globalSearchValue?: String;
      locationSearchValue?: String;
      organisationUserSearchValue?: String;
      isfiltersubmitValue?: Boolean;
    }
  ) => number;
  getSearchFilter: (
    updater: string,
    searchFilter: {
      questionariesSearchValue?: String;
      organisationSearchValue?: String;
      globalSearchValue?: String;
      locationSearchValue?: String;
      organisationUserSearchValue?: String;
    }
  ) => void;
  getOnSubmitSearchFilter: (
    updater: string,
    searchFilter: {
      questionariesSearchValue?: String;
      organisationSearchValue?: String;
      globalSearchValue?: String;
      locationSearchValue?: String;
      organisationUserSearchValue?: String;
    }
  ) => void;
  getQuestionariesFilterData: (
    organisationSearchValue?: String,
    activeTab?: String,
    location?: String
  ) => any[];
  getOrganisationFilterData: (
    questionariesSearchValue?: String,
    activeTab?: String,
    location?: String
  ) => any[];
  getGlobalFilterData: (globalSearchValue?: String) => any[];
  getSortByComment: (sortByComment: boolean) => any;
  getlocationFilterData: (
    questionariesSearchValue?: String,
    organisationSearchValue?: String,
    activeTab?: string
  ) => any[];
  getUserFilterData: (
    questionariesSearchValue?: String,
    activeTab?: String,
    location?: String,
    organisationSearch?: String,
    organisationUserSearchValue?: String
  ) => any[];
};
type AIData = {
  allowedAICuration: string[];
  triggeredCuration: string[];
};

const getStatus: any = (
  capitalizedFormType: string,
  formType: string,
  status: string,
  ParentUserId?: string,
  UserId?: string,
  userRole?: string,
  invitationId?: string,
  AssesseeUserMappings?: any[],
  formInvitationMetadata?: { AIData?: AIData },
  resUserId?: string,
  isReviewer?: string,
  ReviewerDetails?: any,
  submissionStatus?: string,
  chkCompanyIdLength?: number,
) => {
  const hasValidUserIds = !!ParentUserId && !!UserId;

  let isResponded = false;

  if (userRole === AppRoles.Responder) {
    if (AssesseeUserMappings && invitationId) {
      const relevantMappings = AssesseeUserMappings?.filter(
        (mapping: any) =>
          mapping.InvitationId === invitationId && mapping.userId === resUserId
      );

      if (relevantMappings.length > 0) {
        // isResponded = relevantMappings.every(
        //   (mapping: any) => mapping.Status === FormInvitationUIStatus.Responded
        // );
        // Updated to check ResponderStatus field
        isResponded = AssesseeUserMappings.filter(
          (item) => item.userId === resUserId
        ).every((item) => item.ResponderStatus === "Responded");
      }
    }
  }

  switch (status) {
    case "Draft":
      return userRole === AppRoles.Responder && isResponded
        ? "Responded"
        : submissionStatus === FormInvitationStatus.Submitted ? "Responded" : "Started";
    case "Invited":
      //AI conditions starts
      // Check if metadata has triggeredCuration with any values
      const aiData = formInvitationMetadata?.AIData;
      const triggeredCuration = aiData?.triggeredCuration || [];
      const allowedAICuration = aiData?.allowedAICuration || [];
      // If triggeredCuration has any value, show ready status
      // Check if allowedAICuration has length for self-assessment user
      if (triggeredCuration.length > 0) {
        // For Inviter users with triggeredCuration - show Ready status
        if (userRole === AppRoles.Inviter) {
          // Check if it's self-assessment/report first
          if (hasValidUserIds && String(ParentUserId) === String(UserId)) {
            return capitalizedFormType === FormTypes.Report &&
              formType === FormTypes.Report
              ? "Ready for Reporting"
              : capitalizedFormType === FormTypes.Assessment &&
                formType === FormTypes.Assessment
                ? "Ready for Assessment"
                : "Requested";
          }
          // For non-self Inviter users, still return "Requested"
          return "Requested";
        }

        // For Invitee users with triggeredCuration - show Ready status
        if (userRole === AppRoles.Invitee) {
          return capitalizedFormType === FormTypes.Report &&
            formType === FormTypes.Report
            ? "Ready for Reporting"
            : capitalizedFormType === FormTypes.Assessment &&
              formType === FormTypes.Assessment
              ? "Ready for Assessment"
              : "Requested";
        }
      }
      if (
        allowedAICuration.length > 0 &&
        userRole === AppRoles.Inviter &&
        hasValidUserIds &&
        String(ParentUserId) === String(UserId)
      ) {
        return "Requested";
      }
      // AI connditions ends

      // Fallback to original logic if no AI records or not completed
      return userRole === AppRoles.Inviter &&
        hasValidUserIds &&
        ParentUserId === UserId
        ? capitalizedFormType === FormTypes.Report &&
          formType === FormTypes.Report
          ? "Ready for Reporting"
          : capitalizedFormType === FormTypes.Assessment &&
            formType === FormTypes.Assessment
            ? "Ready for Assessment"
            : "Requested"
        : "Requested";
    case "Submitted":
      return FormInvitationUIStatus.Responded;
    case "Under Review":
      const isSelf = ParentUserId === resUserId && UserId === resUserId;
      if (
        userRole === AppRoles.Invitee ||
        userRole === AppRoles.Responder ||
        (userRole === AppRoles.Inviter && isSelf) ||
        userRole === AppRoles.Consultant
      ) {
        if (
          submissionStatus?.toLowerCase() ===
          FormInvitationUIStatus.Declined.toLowerCase()
        ) {
          return FormInvitationUIStatus.Declined;
        }
        if (
          submissionStatus?.toLowerCase() ===
          FormInvitationUIStatus.Resubmitted.toLowerCase()
        ) {
          return FormInvitationUIStatus.Resubmitted;
        }
        if (
          submissionStatus?.toLowerCase() ===
          FormInvitationUIStatus.Approved.toLowerCase()
        ) {
          return FormInvitationUIStatus.Approved;
        }
        // if (
        //   !!ReviewerDetails &&
        //   (userRole === AppRoles.Invitee || userRole === AppRoles.Consultant)
        // ) {
        //   return FormInvitationUIStatus.PendingReview;
        // }
        if (!!isReviewer && !!ReviewerDetails && ReviewerDetails?.id === resUserId && userRole === AppRoles.Invitee) {
          return FormInvitationUIStatus.PendingReview;
        } else {
          return FormInvitationUIStatus.UnderReview;
        }
      } else if (userRole === AppRoles.Inviter) {
        if (
          (formType === FormTypes.Report ||
            (formType === FormTypes.Assessment &&
              (chkCompanyIdLength ?? 0) > 0)) &&
          (submissionStatus?.toLowerCase() ===
            FormInvitationUIStatus.Declined.toLowerCase() ||
            submissionStatus?.toLowerCase() ===
            FormInvitationUIStatus.Resubmitted.toLowerCase())
        ) {
          if (
            submissionStatus?.toLowerCase() ===
            FormInvitationUIStatus.Declined.toLowerCase()
          ) {
            return FormInvitationUIStatus.Declined;
          }
          if (
            submissionStatus?.toLowerCase() ===
            FormInvitationUIStatus.Resubmitted.toLowerCase()
          ) {
            return FormInvitationUIStatus.Resubmitted;
          }
        }
        return FormInvitationUIStatus.UnderReview;
      }
    case "Processing":
      // For self-assessment/report users (Inviter with ParentUserId === UserId), show "Processing"
      if (
        userRole === AppRoles.Inviter &&
        hasValidUserIds &&
        String(ParentUserId) === String(UserId)
      ) {
        return "Processing";
      }
      if (userRole === AppRoles.Inviter) {
        return "Requested";
      }
      // If user is Invitee, show the raw "Processing" status
      if (userRole === AppRoles.Invitee) {
        return "Processing";
      }
    default:
      return status;
  }
};

const getOriginalStatus: any = (status: string) => {
  return status === "Draft" ? "Started" : status;
};

// Invitee - CompanyId == User.CompanyId
//Inviter - company.ParentCompanyId == user.CompanyId

export function useAssessment(companyId?: string, userRole?: string) {
  let mainLoader: boolean = true;
  const userSession = useUserSession();
  const [GetfinalAssessmentList, SetfinalAssessmentList] = useState();
  const { query } = useRouter();
  const { formtype } = query;

  const capitalizedFormType = formtype
    ? String(formtype).charAt(0).toUpperCase() + String(formtype).slice(1, -1)
    : FormTypes.Assessment;

  const { data: InternalCompanyData, loading: internalCompanyDataLoading } =
    useGetGlobalMasterByInternalRequestCompanyQuery();
  let where: FormInvitation_Bool_Exp;
  let consultantWhere: FormInvitation_Bool_Exp;
  let finalAssessmentList: any = [];
  let where2: AddressMapping_Bool_Exp;

  const chkCompanyId = InternalCompanyData?.GlobalMaster[0].data.filter(
    (a: any) => a.companyId === userSession?.company?.id
  );

  const chkCompanyIdather: any = chkCompanyId?.filter(
    (x: any) => x.companyId == AtherCompanyid?.id
  );

  // const { data: userCompanyDetails, loading: companyDetailsLoading } =
  //   useGetCompanyDetailByIdQuery({
  //     variables: {
  //       id: companyId,
  //     },
  //   });

  const { data: consultantFormsList, loading: consultantFormsListLoading } =
    useGetConsultantFormWithDetailsQuery({
      variables: {
        companyId: userSession?.company?.id,
      },
    });

  const {
    data: assessorConsultantMappingList,
    loading: assessorConsultantMappingLoading,
  } = useGetAssessorConsultantMappingByConsultantCompanyIdQuery({
    variables: {
      consultantCompanyId: userSession?.company?.id,
    },
  });

  let assessorConsultantMappingData =
    assessorConsultantMappingList?.AssessorConsultantMapping;

  const [
    fetchAssessmentList,
    { data: assessmentListData, loading: assessmentListDataloading },
  ] = useGetAssessmentListLazyQuery({
    pollInterval: 5000,
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });
  const [
    fetchConsultantAssessmentList,
    {
      data: consultantAssessmentList,
      loading: consultantAssessmentListloading,
    },
  ] = useGetConsultantAssessmentListLazyQuery({
    fetchPolicy: "cache-and-network",
    nextFetchPolicy: "cache-first",
  });

  const { data: assessmentsDetails, loading: assessmentsDetailsLoading } =
    useGetAssessmentListingDetailsQuery({
      variables: { companyId: userSession?.company?.id },
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    });

  const [fetchFormsList, { data: formsList, loading: loadingFormsList }] =
    useGetFormWithDetailsLazyQuery({
      fetchPolicy: "cache-and-network",
      nextFetchPolicy: "cache-first",
    });

  let consultantFormsIds: any = [];

  const [fetchRecommendationGlobalList, { data: recommendationGlobalData }] =
    useGetGlobalMasterByTypeLazyQuery({
      variables: { type: "Recommendation_new" },
    });

  // useEffect(() => {
  //   if (userRole === AppRoles.Consultant) {
  //     const asyncFunction = async () => {};
  //     asyncFunction();
  //   }
  // }, [userRole, companyDetails?.Company, userSession?.company?.id]);

  //if (userRole === AppRoles.Inviter)
  //  // where = { Company: { parentCompanyId: { _eq: companyId } } };
  //  where = {
  //    parentcompanyId: { _eq: companyId },
  //  };
  //else if (userRole === AppRoles.Invitee)
  //  where = { companyId: { _eq: companyId } };
  //else if (userRole === AppRoles.Consultant)
  //  where = {
  //    parentcompanyId: { _eq: companyDetails?.Company[0]?.ParentCompany?.id },
  //  };
  //else where = { companyId: { _eq: "" } };

  if (chkCompanyId !== undefined && chkCompanyId?.length > 0) {
    if (userRole === AppRoles.Inviter) {
      (where = {
        isActive: { _eq: true },
        _and: [
          {
            ParentCompanyMapping: {
              ParentCompanyId: { _eq: companyId },
              // ParentUserId: { _eq: userSession?.user?.id }, // Remove for BRSR testing
            },
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      }),
        (where2 = {
          UserId: { _eq: userSession?.user?.id },
        });
    } else if (userRole === AppRoles.Invitee) {
      where = {
        isActive: { _eq: true },
        _and: [
          {
            _or: [
              {
                AssesseeUserMappings: {
                  userId: { _eq: userSession?.user?.id },
                },
              },
              {
                _or: [
                  {
                    ParentCompanyMapping: {
                      ParentCompanyId: { _eq: companyId },
                      UserId: { _eq: userSession?.user?.id },
                    },
                  },
                  {
                    parentCompanyMappingByReviewerparentcompanyid: {
                      User: {
                        id: { _eq: userSession?.user?.id },
                      }
                    }
                  }
                ]
              },
            ],
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      };
      where2 = {
        UserId: { _eq: userSession?.user?.id },
      };
    } else if (userRole === AppRoles.Responder) {
      where = {
        _and: [
          {
            AssesseeUserMappings: {
              userId: { _eq: userSession?.user?.id },
            },
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      };
      where2 = {
        UserId: { _eq: userSession?.user?.id },
      };
    } else {
      where = {
        _and: [
          {
            companyId: { _eq: "" },
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      };
      where2 = { UserId: { _eq: userSession?.user?.id } };
    }
  } else {
    if (userRole === AppRoles.Inviter) {
      // where = { Company: { parentCompanyId: { _eq: companyId } } };
      where = {
        isActive: { _eq: true },
        _and: [
          {
            ParentCompanyMapping: {
              ParentCompanyId: { _eq: companyId },
            },
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      };
      where2 = {};
    } else if (userRole === AppRoles.Invitee) {
      where = {
        _and: [
          {
            _or: [
              {
                email: { _eq: userSession?.user?.email },
              },
              {
                reviewerDetails: {
                  _contains: { email: userSession?.user?.email },
                },
              },
            ],
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      };
      where2 = {};
    } else if (userRole === AppRoles.Responder) {
      where = {
        _and: [
          {
            _or: [
              {
                AssesseeUserMappings: {
                  userId: { _eq: userSession?.user?.id },
                },
              },
              {
                ParentCompanyMapping: {
                  ParentCompanyId: { _eq: companyId },
                  UserId: { _eq: userSession?.user?.id },
                },
              },
            ],
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      };
      where2 = {};
    } else if (userRole === AppRoles.Consultant) {
      where = {
        _and: [
          {
            parentcompanyId: {
              _eq: assessmentsDetails?.Company[0]?.ParentCompany?.id,
            },
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      };
      where2 = {};
    } else {
      where = {
        _and: [
          {
            companyId: { _eq: "" },
          },
          {
            Form: {
              formtype: {
                _eq: capitalizedFormType,
              },
            },
          },
        ],
      };
      where2 = { UserId: { _eq: "" } };
    }
  }
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
        : locationDetail?.data?.AddressesByCompanyId?.map((item: any) => ({
          value: item.id,
          label: item.addressLable,
        })).filter((x: any) => x.label !== null) ?? [],
    [locationDetail]
  );

  useEffect(() => {
    let conditionDataArray: any = [];
    let GroupfromDataArray: any = [];
    let ParentcomapanyID: any = "";
    if (userRole === AppRoles.Consultant) {
    }

    if (userRole === AppRoles.Consultant) {
      if (assessorConsultantMappingData) {
        assessorConsultantMappingData?.map((rec: any) => {
          ParentcomapanyID = rec.assessorCompanyId;
          conditionDataArray.push({
            _and: {
              ParentCompanyMapping: {
                ParentCompanyId: { _eq: rec.assessorCompanyId },
              },
              formId: { _eq: rec.formId },
              Form: {
                formtype: {
                  _eq: capitalizedFormType,
                },
              },
            },
          });
        });
      }

      fetchRecommendationGlobalList();

      ///////////change for consultant group form
      fetchFormsList({
        variables: { companyId: ParentcomapanyID },
      });
      GroupfromDataArray = formsList?.Form?.filter(
        (x) => x?.GroupForms?.length > 0
      );

      if (GroupfromDataArray?.length > 0) {
        GroupfromDataArray?.map((rec: any) => {
          rec?.GroupForms.map((rec1: any) => {
            conditionDataArray.push({
              _and: {
                ParentCompanyMapping: {
                  ParentCompanyId: { _eq: ParentcomapanyID },
                },
                formId: { _eq: rec1?.formId },
                Form: {
                  formtype: {
                    _eq: capitalizedFormType,
                  },
                },
              },
            });
          });
        });
      }

      ///////////change for consultant group form
      if (conditionDataArray?.length > 0) {
        fetchConsultantAssessmentList({
          variables: {
            where: {
              _or: conditionDataArray,
            },
            platformId: userSession?.platform?.id,
            companyId: userSession?.company?.id,
            invitationType: [
              "InvitationListDashboardActionPermission",
              "Recommendation_new",
              "PdfScorePermission",
            ],
            sourceType: SourcesType.Uploaded?.dbTittle,
          },
        });
      }
    } else {
      fetchAssessmentList({
        variables: {
          where,
          platformId: userSession?.platform?.id,
          companyId: userSession?.company?.id,
          where2,
          invitationType: [
            "InternalRequestCompany",
            "InvitationListDashboardActionPermission",
            "Recommendation_new",
          ],
          userId: userSession?.user?.id,
          sourceType: SourcesType.Uploaded?.dbTittle,
        },
      });
    }
  }, [
    consultantAssessmentList,
    assessmentListData,
    assessorConsultantMappingData,
  ]);
  const filteredFormInvitationData = assessmentListData?.FormInvitation?.filter(
    (item) => {
      return assessmentListData?.AssesseeUserMapping?.find(
        (itm) => itm.InvitationId === item.id
      );
    }
  );

  let invitationDeatils: any = {
    AddressMapping: assessmentListData?.AddressMapping,
    CompanyForm: assessmentListData?.CompanyForm,
    FormInvitation: filteredFormInvitationData,
    GlobalMaster: assessmentListData?.GlobalMaster,
  };
  if (userRole === AppRoles.Consultant) {
    finalAssessmentList = consultantAssessmentList;

    if (GetfinalAssessmentList) {
      SetfinalAssessmentList(finalAssessmentList);
    }
  } else {
    if (
      filteredFormInvitationData !== undefined &&
      filteredFormInvitationData.length > 0
    ) {
      if (userRole !== AppRoles.Invitee) {
        finalAssessmentList = invitationDeatils;
      } else {
        finalAssessmentList = assessmentListData;
      }
    } else {
      finalAssessmentList = assessmentListData;
    }
    if (GetfinalAssessmentList) {
      SetfinalAssessmentList(finalAssessmentList);
    }
  }

  let allowedFormIds =
    finalAssessmentList?.CompanyForm?.flatMap((m: any) => {
      const formIdList = m.Form.GroupForms.map((f: any) => f.formId);
      formIdList.push(m.formId);
      return formIdList;
    }) ?? [];

  if (userRole === AppRoles.Consultant) {
    // filter data Consultant user only.

    consultantFormsIds = consultantFormsList?.AssessorConsultantMapping?.map(
      (d) => d.Form.id
    );

    allowedFormIds = allowedFormIds.filter((d: any) =>
      consultantFormsIds?.includes(d)
    );
  }
  let locationCount: any = {
    Count: 0,
    buttoncount: 0,
  };
  const globalMasterData = finalAssessmentList?.GlobalMaster;
  locationCount.Count = finalAssessmentList?.AddressMapping?.length ?? 0;
  locationCount.IsSortButtonShow = finalAssessmentList?.FormInvitation?.filter(
    (item: any) => {
      if (item.InvitationComments?.length > 0) {
        return item;
      }
    }
  )?.length;

  const recommendationNewRecords =
    userRole === AppRoles.Consultant
      ? recommendationGlobalData?.GlobalMaster[0]?.data
      : assessmentListData?.GlobalMaster?.filter(
        (item) => item.type === "Recommendation_new"
      )[0]?.data;

  const data: ColumnType[] = useMemo<ColumnType[]>(() => {
    if (!finalAssessmentList) return [];

    const getPeriod = (date: any) => {
      if (dayjs(date).isValid()) {
        return dayjs(date).format("MMM YYYY");
      }
      return "";
    };

    const isLocationHide =
      chkCompanyId?.length > 0 &&
        chkCompanyId?.filter((a: any) => a.IsListingLocationHide === false)
          .length > 0
        ? false
        : true;

    let iHaveRecommnedation: boolean = false;
    return finalAssessmentList.FormInvitation.filter((m: any) => {
      if (userRole === AppRoles.Invitee || userRole === AppRoles.Responder) {
        if (m.status == FormInvitationStatus.Failed) {
          return false;
        }
        return true;
      }
      if (
        userRole === AppRoles.Inviter ||
        userRole === AppRoles.Approver ||
        userRole === AppRoles.Consultant
      ) {
        allowedFormIds.includes(m.Form.id);
        return allowedFormIds;
      }
      return false;
    }).map((formInvitation: any) => {
      let Asesseuserdata =
        (userRole === AppRoles.Invitee || userRole === AppRoles.Responder) &&
        formInvitation?.AssesseeUserMappings?.filter(
          (item: any) => item.userId === userSession?.user?.id
        );

      if (
        !!recommendationNewRecords &&
        recommendationNewRecords.filter(
          (rec: any) => rec.FormId === formInvitation?.Form?.id
        ).length > 0
      ) {
        let interimAnswersData: any = [];

        if (userSession?.user?.role == AppRoles.Responder) {
          iHaveRecommnedation = false;
          if (
            !!formInvitation.FormSubmissions[0]?.Interim_Answers &&
            formInvitation.FormSubmissions[0]?.Interim_Answers.length > 0
          ) {
            interimAnswersData =
              formInvitation.FormSubmissions[0]?.Interim_Answers;
          }
        }
        if (!!interimAnswersData && interimAnswersData.length > 0) {
          if (
            interimAnswersData?.filter(
              (d: any) => d.Interim_Recommendations?.length > 0
            ).length > 0
          ) {
            iHaveRecommnedation = true;
          } else {
            if (
              interimAnswersData?.filter((d: any) => !!d.Interim_Answer)
                .length > 0
            ) {
              interimAnswersData
                ?.filter((d: any) => !!d.Interim_Answer)
                .map((g: any) => {
                  if (g.Interim_Answer?.Interim_Recommendations?.length > 0) {
                    iHaveRecommnedation = true;
                  }
                });
            }
          }
        }
      }
      // =============================================================================
      // AI STATUS DETERMINATION - BUSINESS LOGIC CHANGE SUMMARY
      // =============================================================================

      /**
       * MIGRATION FROM USER-SPECIFIC TO FORM-SPECIFIC AI ACCESS
       *
       * OLD LOGIC:
       * - Complex user-specific AI access control per invitation
       * - Consultant vs non-consultant different access patterns
       * - Required consultants[] array and vcUserId fields in JWT
       * - Same form could show different AI capabilities to different users
       *
       * NEW LOGIC:
       * - Simple form-level AI access control
       * - Uniform AI visibility for all users accessing the same form
       * - Uses direct JWT aiPlanDetails array without user intermediaries
       *
       * BUSINESS IMPACT:
       *    LOST: Granular per-user AI access control
       *    GAINED: Simplified, consistent AI management at form level
       */
      const hasDoc = hasDocumentCuration(
        userSession?.accessToken,
        formInvitation.Form?.id
      );
      const hasWeb = hasWebCuration(
        userSession?.accessToken,
        formInvitation.Form?.id
      );
      const isReviewer = formInvitation?.reviewerDetails?.id === userSession?.user?.id;
      const ReviewerDetails = formInvitation?.reviewerDetails;

      return {
        Id: formInvitation.id,
        SubmissionId: formInvitation.FormSubmissions[0]?.id,
        Questionnaire: formInvitation.Form?.name,
        commentCreated_at:
          formInvitation.InvitationComments[0]?.created_at ?? "",
        ...(chkCompanyId?.length > 0 &&
          userRole === AppRoles.Consultant && {
          "Requested By":
            // formInvitation?.InvitationConsultantMappings[0]?.Company.name ||
            formInvitation?.ParentCompanyMapping?.companyByParentcompanyid
              ?.name,
        }),
        QuestionnareId: formInvitation.Form?.id,
        InviteeCompanyId: formInvitation.ParentCompanyMapping?.Company?.id,
        InviteeCompanyName:
          formInvitation.ParentCompanyMapping === null
            ? formInvitation.Company?.name
              ?.split(" ")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" ")
            : formInvitation.ParentCompanyMapping?.Company?.name
              ?.split(" ")
              .map(
                (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
              )
              .join(" "),
        isgroupform: formInvitation.Form.GroupForms?.length > 0 ? true : false,
        isindustryselected:
          (formInvitation.ParentCompanyMapping?.Company?.metadata ?? "") !== ""
            ? formInvitation.ParentCompanyMapping?.Company?.metadata
              ?.industry !== ""
              ? true
              : false
            : false,
        isQuestionReassigned: !!formInvitation?.AssesseeUserMappings?.length,
        isRecommendationIcon:
          userSession?.user?.role == AppRoles.Responder
            ? iHaveRecommnedation
            : formInvitation?.interimCheck?.isRecommendationIcon,
        isCarryForward: formInvitation?.interimCheck?.isCarryForward,
        groupform: formInvitation.Form.GroupForms,
        ParentUserName: formInvitation.ParentCompanyMapping?.User?.name,
        ParentUserId: formInvitation.ParentCompanyMapping?.ParentUserId,
        UserId: formInvitation.ParentCompanyMapping?.UserId,
        ...(!!chkCompanyId &&
          chkCompanyId[0]?.IsShowExternalAssessmentColumn === true &&
          (userRole === AppRoles.Inviter || userRole === AppRoles.Consultant) &&
          capitalizedFormType !== FormTypes.Report && {
          "Requested To":
            formInvitation.ParentCompanyMapping?.Company?.id !==
              userSession?.company?.id &&
              formInvitation.ParentCompanyMapping?.Company?.id !==
              formInvitation.ParentCompanyMapping?.ParentCompanyId
              ? formInvitation.ParentCompanyMapping?.Company?.name
                ?.split(" ")
                .map(
                  (word: string) =>
                    word.charAt(0).toUpperCase() + word.slice(1)
                )
                .join(" ")
              : "NA",
        }),
        ...(userRole === AppRoles.Responder && {
          "Requested From User":
            userRole === AppRoles.Responder &&
              formInvitation.ParentCompanyMapping?.Company?.id ===
              userSession?.company?.id
              ? formInvitation.AssesseeUserMappings[0]?.User?.name
                ? formInvitation.AssesseeUserMappings[0]?.User?.name
                  ?.split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")
                : "NA"
              : "NA",
        }),
        "Requested From":
          !!chkCompanyId && chkCompanyId?.length > 0
            ? userRole === AppRoles.Inviter || userRole === AppRoles.Consultant
              ? formInvitation.ParentCompanyMapping?.Company?.id ===
                userSession?.company?.id ||
                formInvitation.ParentCompanyMapping?.companyByParentcompanyid
                  ?.id === userSession?.company?.id
                ? formInvitation.ParentCompanyMapping?.User?.name
                  ? formInvitation.ParentCompanyMapping?.User?.name
                    ?.split(" ")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ")
                  : "NA"
                : userRole === AppRoles.Consultant
                  ? formInvitation.ParentCompanyMapping?.User?.name
                    ? formInvitation.ParentCompanyMapping?.User?.name
                      ?.split(" ")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")
                    : "NA"
                  : "NA"
              : userRole === AppRoles.Consultant
                ? formInvitation.ParentUser?.name
                  ?.split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")
                : userRole === AppRoles.Responder
                  ? formInvitation.ParentCompanyMapping?.Company?.id ===
                    userSession?.company?.id
                    ? formInvitation.ParentCompanyMapping?.Company?.name
                      ?.split(" ")
                      .map(
                        (word: string) =>
                          word.charAt(0).toUpperCase() + word.slice(1)
                      )
                      .join(" ")
                    : "NA"
                  : formInvitation.ParentCompanyMapping?.userByParentuserid?.name
                    ?.split(" ")
                    .map(
                      (word: string) =>
                        word.charAt(0).toUpperCase() + word.slice(1)
                    )
                    .join(" ")
            : userRole === AppRoles.Consultant
              ? formInvitation.ParentCompanyMapping?.ParentUserId ===
                formInvitation.ParentCompanyMapping?.UserId
                ? formInvitation.ParentCompanyMapping?.Company?.name
                  ?.split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")
                : formInvitation.ParentCompanyMapping?.User?.name
                  ?.split(" ")
                  .map(
                    (word: string) =>
                      word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")
              : formInvitation.ParentCompanyMapping?.companyByParentcompanyid
                ?.id === userSession?.company?.id
                ? formInvitation.ParentCompanyMapping?.Company?.name
                  ?.split(" ")
                  .map(
                    (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" ")
                : formInvitation.ParentCompanyMapping?.companyByParentcompanyid?.name
                  ?.split(" ")
                  .map(
                    (word: string) => word.charAt(0).toUpperCase() + word.slice(1)
                  )
                  .join(" "),
        isSelf:
          formInvitation.ParentCompanyMapping?.ParentUserId ===
            userSession?.user?.id
            ? formInvitation.ParentCompanyMapping?.ParentUserId ===
            userSession?.user?.id
            : formInvitation.ParentCompanyMapping?.UserId ===
            userSession?.user?.id,
        isDeviation:
          formInvitation?.ValidationWarningLogs_aggregate?.aggregate?.count > 0
            ? true
            : false,
        deviationCount:
          formInvitation?.ValidationWarningLogs_aggregate?.aggregate?.count,

        // ...(chkCompanyId !== undefined &&
        //   chkCompanyId?.length > 0 &&
        //   userRole === AppRoles.Inviter &&
        //   locationCount.Count > 1 && {
        //     "Requested To": formInvitation.ParentCompanyMapping?.User?.name,
        //   }),

        ...(chkCompanyId !== undefined &&
          chkCompanyId?.length > 0 &&
          chkCompanyIdather?.length == 0 &&
          locationCount.Count !== undefined &&
          locationCount.Count > 1 && {
          Location: formInvitation.ParentCompanyMapping?.Address?.addressLable
            ? formInvitation.ParentCompanyMapping?.Address?.addressLable
            : "NA",
        }),

        ...(chkCompanyId !== undefined &&
          chkCompanyId?.length > 0 &&
          isLocationHide === false &&
          userRole === AppRoles.Inviter &&
          locationCount.Count === 0 && {
          Location:
            formInvitation.ParentCompanyMapping?.Company?.id ===
              userSession?.company?.id
              ? formInvitation.ParentCompanyMapping?.Address?.addressLable
              : "NA",
        }),
        ...(chkCompanyId !== undefined &&
          chkCompanyId?.length > 0 &&
          isLocationHide === false &&
          userRole === AppRoles.Inviter &&
          locationCount.Count === 1 && {
          Location:
            formInvitation.ParentCompanyMapping?.Company?.id ===
              userSession?.company?.id
              ? formInvitation.ParentCompanyMapping?.Address?.addressLable
              : "NA",
        }),

        Period: `${getPeriod(formInvitation.durationFrom) +
          " - " +
          getPeriod(formInvitation.durationTo)
          }`,
        //"Requested On": dayjs(formInvitation.updated_at).format("DD MMM YYYY"),
        "Requested On": dayjs(formInvitation.created_at).format("DD MMM YYYY"),
        Status: getStatus(
          capitalizedFormType,
          formInvitation?.Form?.formtype,
          formInvitation.status,
          formInvitation?.ParentCompanyMapping?.ParentUserId,
          formInvitation?.ParentCompanyMapping?.UserId,
          userSession?.user?.role,
          formInvitation?.id,
          formInvitation?.AssesseeUserMappings,
          formInvitation?.metadata,
          userSession?.user?.id,
          isReviewer,
          ReviewerDetails,
          formInvitation.FormSubmissions[0]?.status,
          chkCompanyId?.length ?? 0,
        ),
        OriginalStatus: getOriginalStatus(formInvitation.status),
        Score: (() => {
          let score = "NA";
          switch (
          getStatus(
            capitalizedFormType,
            formInvitation?.Form?.formtype,
            formInvitation.status,
            formInvitation?.ParentCompanyMapping?.ParentUserId,
            formInvitation?.ParentCompanyMapping?.UserId,
            userSession?.user?.role,
            formInvitation?.id,
            formInvitation?.AssesseeUserMappings,
            formInvitation?.metadata,
            userSession?.user?.id,
            isReviewer,
            ReviewerDetails,
            formInvitation.FormSubmissions[0]?.status,
            chkCompanyId?.length ?? 0,
          )
          ) {
            case "Approved":
              score = formInvitation.FormSubmissions.map(
                (formSubmissions: any) =>
                  formSubmissions.FormResults.map((formResults: any) =>
                    formResults.score.toString()
                  )
              )[0][0];
            case "Responded":
              score = formInvitation.FormSubmissions.map(
                (formSubmissions: any) =>
                  formSubmissions.FormResults.map((formResults: any) =>
                    formResults.score.toString()
                  )
              )[0];
            default:
              if (formInvitation?.Form?.calc === null) {
                score = "NA";
              }
              return score;
          }
        })(),
        ...(userRole !== AppRoles.Responder && {
          "Completion (%)": Number(formInvitation.completion),
        }),
        Actions: "",
        vcCompany: formInvitation?.ParentUser?.Company?.name,
        pcCompany: formInvitation?.Company?.name,
        Submission_Status: formInvitation.FormSubmissions[0]?.status,
        lastAttemptedQuestionId:
          Asesseuserdata.length > 0
            ? Asesseuserdata[0]?.questionId
            : formInvitation.FormSubmissions[0]?.Answers?.length > 0
              ? formInvitation.FormSubmissions[0]?.Answers[0]?.questionId
              : "",
        AIStatus: {
          docWithAI: hasDoc && hasWeb, // Both Document and Web Curation
          onlyDoc: hasDoc && !hasWeb, // Only Document Curation
        },
        pcCompanyId: formInvitation?.Company?.id,
        formId: formInvitation?.Form?.id,
        isFileCurating:
          !!formInvitation?.AIBulkDocumentProcessings &&
            formInvitation?.AIBulkDocumentProcessings.length > 0
            ? formInvitation?.AIBulkDocumentProcessings?.filter(
              (items: any) =>
                items?.requestStatus == bulkFileCurationStatus?.Processing
            ).length > 0
              ? true
              : false
            : false,
        AIBulkDocumentProcessings: formInvitation?.AIBulkDocumentProcessings,
        Sources: formInvitation?.Sources,
        failedMessage:
          !!formInvitation?.WebCurations &&
            formInvitation?.WebCurations.length > 0 &&
            formInvitation?.WebCurations[0]?.error?.userMessage
            ? formInvitation?.WebCurations[0]?.error?.userMessage
            : "AI curation from public domain is failed. Please retry.",
        metadata: formInvitation?.metadata,
        isReviewer: isReviewer,
        parentcompanyId: formInvitation?.parentcompanyId,
        companyId: formInvitation?.companyId,
        reviewerParentCompanyId: formInvitation?.reviewerParentCompanyId,
        formType: formInvitation?.Form?.formtype,
        declinedCount: 0,
        resubmittedCount: 0,
        totalQuestions: 0,
      } as ColumnType;
    });
  }, [assessmentListData, consultantAssessmentList]);

  const [listingData, setlistingData] = useState<ColumnType[]>([]);
  const [listingData1, setlistingData1] = useState<ColumnType[]>([]);
  const [tableHeadings, settableHeadings] = useState<
    Header<ColumnType, unknown>[][]
  >([]);

  useEffect(() => {
    if (data && data.length > 0) {
      setlistingData(data);
      setlistingData1(data);
    }
  }, [data]);

  // useEffect(() => {
  //   if (data && data.length > 0) {
  //     //      setlistingData(data);
  //     setlistingData1(data);
  //   }
  // }, [data]);
  const columnHelper = createColumnHelper<ColumnType>();

  const columnData = listingData1[0]
    ? Object.keys(listingData1[0])
      .filter(
        (c: any) =>
          ![
            "Id",
            "SubmissionId",
            "InviteeCompanyId",
            "InviteeCompanyName",
            "QuestionnareId",
            "isgroupform",
            "isindustryselected",
            "groupform",
            "ParentUserName",
            "commentCreated_at",
            "isQuestionReassigned",
            "isRecommendationIcon",
            "isCarryForward",
            "isDeviation",
            "deviationCount",
            "Submission_Status",
            "lastAttemptedQuestionId",
            "vcCompany",
            "pcCompany",
            "ParentUserId",
            "UserId",
            "AIStatus",
            "pcCompanyId",
            "formId",
            "failedMessage",
            "isFileCurating",
            "AIBulkDocumentProcessings",
            "Sources",
            "metadata",
            "isReviewer",
            "isSelf",
            "parentcompanyId",
            "companyId",
            "reviewerParentCompanyId",
            "formType",
            "declinedCount",
            "resubmittedCount",
            "totalQuestions",
          ].includes(c)
      )
      .map((c: any) =>
        columnHelper.accessor(c, {
          header: c,
          footer: (props) => props.column.id,
        })
      )
    : [];
  const table = useReactTable({
    data: listingData ?? [],
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    columns: columnData,
  });

  const rows = table.getRowModel().rows;
  const renderRow = (cell: any) => {
    return flexRender(cell.column.columnDef.cell, cell.getContext());
  };

  const renderHeader = (header: any, context: any) => {
    return flexRender(header, context);
  };

  const renderSort = (header: any) => {
    return (
      {
        asc: " 🔼",
        desc: " 🔽",
      }[header.column.getIsSorted() as string] ?? null
    );
  };

  const filter = (column: Column<ColumnType, unknown>) => {
    const firstValue = table
      .getPreFilteredRowModel()
      .flatRows[0]?.getValue(column.id);

    const columnFilterValue = {
      getMinNumber: (column.getFilterValue() as [number, number])?.[0] ?? "",
      getMaxNumber: (column.getFilterValue() as [number, number])?.[1] ?? "",
      getTextValue: (column.getFilterValue() ?? "") as string,
      setFilterValueNumber: (e: any, range: string) => {
        return column.setFilterValue((old: [number, number]) => [
          e.target.value,
          range == "max" ? old?.[0] : old?.[1],
        ]);
      },
      setFilterValueText: (e: any) => {
        return column.setFilterValue(e.target.value);
      },
    };

    return { firstValue, columnFilterValue };
  };

  const pagination: PaginationType = {
    previous: () => table.previousPage(),
    next: () => table.nextPage(),
    page: table.getState().pagination.pageIndex + 1,
    onPageChange: (p: any) => {
      const page = p ? Number(p) - 1 : 0;
      table.setPageIndex(page);
    },
    getTotalCount: table.getPageCount(),
    getPageSize: table.getState().pagination.pageSize,
    setPageSize: (e: any) => table.setPageSize(Number(e.target.value)),
  };

  const datatable = {
    tableHeadings,
    rows,
    allData: listingData,
    renderRow,
    renderHeader,
    renderSort,
  };
  const tableheader = { tableHeadings, renderHeader };

  const statesFilter: StatesFilterType = React.useMemo(
    () => ({
      getRowsByStatus: (state: string) => {
        setlistingData(
          data.filter((r) => (state != "All" ? r.Status == state : r))
        );
      },
      getRowsCountByStatus: (
        state: string,
        searchFilter: {
          questionariesSearchValue?: String;
          organisationSearchValue?: String;
          globalSearchValue?: String;
          locationSearchValue?: String;
          organisationUserSearchValue?: String;
          isfiltersubmitValue?: Boolean;
        }
      ) => {
        return data
          .filter((o) => {
            if (!searchFilter.organisationSearchValue) return true;
            if (searchFilter.isfiltersubmitValue === true) {
              return (
                o["Requested From"]?.toLowerCase() ===
                searchFilter.organisationSearchValue?.toLowerCase()
              );
            } else {
              return o["Requested From"]
                ?.toLowerCase()
                .includes(
                  searchFilter.organisationSearchValue?.toLowerCase() ?? ""
                );
            }
          })
          .filter((m) => {
            if (!searchFilter.globalSearchValue) return true;

            if (
              m.Questionnaire?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              )
            ) {
              return m.Questionnaire?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              );
            } else if (
              (userRole === AppRoles.Invitee ||
                userRole === AppRoles.Responder) &&
              m["Requested From"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
            ) {
              return m["Requested From"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "");
            } else if (
              (userRole === AppRoles.Inviter ||
                userRole === AppRoles.Consultant) &&
              m["Requested From"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
            ) {
              return m["Requested From"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "");
            } else if (
              userRole === AppRoles.Consultant &&
              m["Requested By"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
            ) {
              return m["Requested By"]
                ?.toLowerCase()
                .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "");
            } else if (
              userRole === AppRoles.Inviter &&
              m.InviteeCompanyName?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              )
            ) {
              return m.InviteeCompanyName?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              );
            } else if (
              m.Location?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              )
            ) {
              return m.Location?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              );
            } else if (
              m.Status?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              )
            ) {
              return m.Status?.toLowerCase().includes(
                searchFilter.globalSearchValue?.toLowerCase() ?? ""
              );
            }
          })
          .filter((m) => {
            if (!searchFilter.questionariesSearchValue) return true;
            return m.Questionnaire?.toLowerCase().includes(
              searchFilter.questionariesSearchValue?.toLowerCase() ?? ""
            );
          })
          .filter((m) => {
            if (!searchFilter.locationSearchValue) return true;
            return m.Location?.toLowerCase().includes(
              searchFilter.locationSearchValue?.toLowerCase() ?? ""
            );
          })
          .filter((m) => {
            if (!searchFilter.organisationUserSearchValue) return true;
            if (searchFilter.isfiltersubmitValue === true) {
              return (
                m["Requested To"]?.toLowerCase() ===
                searchFilter.organisationUserSearchValue?.toLowerCase()
              );
            } else {
              return m["Requested To"]
                ?.toLowerCase()
                .includes(
                  searchFilter.organisationUserSearchValue?.toLowerCase() ?? ""
                );
            }
          })
          .filter((m) => {
            if (
              (locationCount.Count > 1 &&
                userRole === AppRoles.Invitee &&
                chkCompanyId?.length > 0 &&
                chkCompanyId !== undefined) ||
              (userRole === AppRoles.Inviter &&
                locationCount.Count > 1 &&
                chkCompanyId?.length > 0 &&
                chkCompanyId !== undefined)
            ) {
              if (
                m.Location?.toLowerCase().includes(
                  searchFilter.locationSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return m.Location?.toLowerCase().includes(
                  searchFilter.locationSearchValue?.toLowerCase() ?? ""
                );
              }
            }

            return true;
          })
          .filter((m) => {
            if (!searchFilter.locationSearchValue) return true;
            return m.Location?.toLowerCase().includes(
              searchFilter.locationSearchValue?.toLowerCase() ?? ""
            );
          })
          .filter((m) => {
            if (!searchFilter.organisationUserSearchValue) return true;
            if (searchFilter.isfiltersubmitValue === true) {
              return (
                m["Requested To"]?.toLowerCase() ===
                searchFilter.organisationUserSearchValue?.toLowerCase()
              );
            } else {
              return m["Requested To"]
                ?.toLowerCase()
                .includes(
                  searchFilter.organisationUserSearchValue?.toLowerCase() ?? ""
                );
            }
          })
          .filter((r) => (state != "All" ? r.Status == state : r))?.length;
      },
      getSearchFilter: (
        state: string,
        searchFilter: {
          questionariesSearchValue?: String;
          organisationSearchValue?: String;
          globalSearchValue?: String;
          locationSearchValue?: String;
          organisationUserSearchValue?: String;
        }
      ) => {
        setlistingData(
          data
            .filter((x) => x.InviteeCompanyName !== null)
            .filter((o) => {
              if (!searchFilter.organisationSearchValue) return true;
              if (
                userRole == AppRoles.Invitee ||
                userRole === AppRoles.Responder
              ) {
                return o["Requested From"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.organisationSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                chkCompanyId?.length === 0 &&
                userRole == AppRoles.Inviter
              ) {
                return o.InviteeCompanyName?.toLowerCase().includes(
                  searchFilter.organisationSearchValue?.toLowerCase() ?? ""
                );
              } else if (
                chkCompanyId &&
                (userRole == AppRoles.Inviter ||
                  userRole == AppRoles.Consultant)
              ) {
                return o["Requested From"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.organisationSearchValue?.toLowerCase() ?? ""
                  );
              }
            })
            .filter((m) => {
              // console.log("requested From", m["Requested From"]);
              if (!searchFilter.globalSearchValue) return true;

              if (
                m.Questionnaire?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return m.Questionnaire?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                );
              } else if (
                m["Requested From"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return m["Requested From"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                m["Requested To"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return m["Requested To"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                m["Requested By"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return m["Requested By"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                m.Status?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return m.Status?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                );
              } else if (
                m.Location?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return m.Location?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                );
              }
            })
            .filter((m) => {
              if (!searchFilter.questionariesSearchValue) return true;
              return m.Questionnaire?.toLowerCase().includes(
                searchFilter.questionariesSearchValue?.toLowerCase() ?? ""
              );
            })
            .filter((m) => {
              if (!searchFilter.locationSearchValue) return true;
              return m.Location?.toLowerCase().includes(
                searchFilter.locationSearchValue?.toLowerCase() ?? ""
              );
            })
            .filter((m) => {
              if (!searchFilter.organisationUserSearchValue) return true;
              return m["Requested To"]
                ?.toLowerCase()
                .includes(
                  searchFilter.organisationUserSearchValue?.toLowerCase() ?? ""
                );
            })
            .filter((r) => (state != "All" ? r.Status == state : r))
        );
      },
      getOnSubmitSearchFilter: (
        state: string,
        searchFilter: {
          questionariesSearchValue?: String;
          organisationSearchValue?: String;
          globalSearchValue?: String;
          locationSearchValue?: String;
          organisationUserSearchValue?: String;
        }
      ) => {
        setlistingData(
          data
            .filter((x) => x.InviteeCompanyName !== null)
            .filter((o) => {
              if (!searchFilter.organisationSearchValue) return true;
              if (
                userRole == AppRoles.Invitee ||
                userRole === AppRoles.Responder
              ) {
                return (
                  o["Requested From"]?.toLowerCase() ===
                  searchFilter.organisationSearchValue?.toLowerCase()
                );
              } else if (
                chkCompanyId?.length === 0 &&
                userRole == AppRoles.Inviter
              ) {
                return (
                  o.InviteeCompanyName?.toLowerCase() ===
                  searchFilter.organisationSearchValue?.toLowerCase()
                );
              } else if (
                chkCompanyId &&
                (userRole == AppRoles.Inviter ||
                  userRole == AppRoles.Consultant)
              ) {
                return (
                  o["Requested From"]?.toLowerCase() ===
                  searchFilter.organisationSearchValue?.toLowerCase()
                );
              }
            })
            .filter((m) => {
              if (!searchFilter.globalSearchValue) return true;

              if (
                m.Questionnaire?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return m.Questionnaire?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                );
              } else if (
                m["Requested From"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return m["Requested From"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                m["Requested To"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return m["Requested To"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                m["Requested By"]
                  ?.toLowerCase()
                  .includes(searchFilter.globalSearchValue?.toLowerCase() ?? "")
              ) {
                return m["Requested By"]
                  ?.toLowerCase()
                  .includes(
                    searchFilter.globalSearchValue?.toLowerCase() ?? ""
                  );
              } else if (
                m.Status?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return m.Status?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                );
              } else if (
                m.Location?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return m.Location?.toLowerCase().includes(
                  searchFilter.globalSearchValue?.toLowerCase() ?? ""
                );
              }
            })
            .filter((m) => {
              if (!searchFilter.questionariesSearchValue) return true;
              return m.Questionnaire?.toLowerCase().includes(
                searchFilter.questionariesSearchValue?.toLowerCase() ?? ""
              );
            })
            .filter((m) => {
              if (!searchFilter.locationSearchValue) return true;
              return m.Location?.toLowerCase().includes(
                searchFilter.locationSearchValue?.toLowerCase() ?? ""
              );
            })
            .filter((m) => {
              if (!searchFilter.organisationUserSearchValue) return true;
              return (
                m["Requested To"]?.toLowerCase() ===
                searchFilter.organisationUserSearchValue?.toLowerCase()
              );
            })
            .filter((r) => (state != "All" ? r.Status == state : r))
        );
      },
      getQuestionariesFilterData: (organisationSearch, activeTab, location) => {
        let FilterNames: any[] = [];
        const Questionariesdata = data
          .filter((x) => {
            if (!organisationSearch) return true;
            return x["Requested From"] === organisationSearch;
          })
          .filter((x) => {
            if (!location) return true;
            return x.Location === location;
          })
          .filter((r) => (activeTab != "All" ? r.Status == activeTab : r))
          .map((m: any) => {
            if ((m.Questionnaire ?? "") === "") return;
            var findItem = FilterNames.find((x) => x === m.Questionnaire);
            if (!findItem) {
              FilterNames.push(m.Questionnaire);
              return m.Questionnaire;
            }
          });
        return FilterNames;
      },
      getOrganisationFilterData: (QuestionariesSearch, activeTab, location) => {
        let FilterNames: any[] = [];
        const DataValue =
          data
            .filter((x) => {
              if (!QuestionariesSearch) return true;
              return x.Questionnaire === QuestionariesSearch;
            })
            .filter((x) => {
              if (!location) return true;
              return x.Location === location;
            })
            .filter((r) => (activeTab != "All" ? r.Status == activeTab : r))
            .map((m: any) => {
              if ((m.InviteeCompanyName ?? "") === "") return;
              if (chkCompanyId?.length === 0 && userRole == AppRoles.Inviter) {
                var findItem = FilterNames.find(
                  (x) => x === m.InviteeCompanyName
                );
                if (!findItem) {
                  FilterNames.push(m.InviteeCompanyName);
                  return m.InviteeCompanyName;
                }
              } else if (
                userRole == AppRoles.Invitee ||
                userRole === AppRoles.Responder
              ) {
                var findItem = FilterNames.find(
                  (x) => x === m["Requested From"]
                );
                if (!findItem) {
                  FilterNames.push(m["Requested From"]);
                  return m["Requested From"];
                }
              } else if (
                (userRole == AppRoles.Inviter ||
                  userRole == AppRoles.Consultant) &&
                chkCompanyId
              ) {
                var findItem = FilterNames.find(
                  (x) => x === m["Requested From"]
                );
                if (!findItem) {
                  if (m["Requested From"] != undefined) {
                    FilterNames.push(m["Requested From"]);
                    return m["Requested From"];
                  }
                }
              }
            }) ?? [];

        return FilterNames;
      },
      getGlobalFilterData: (globalSearchValue) => {
        let FilterNames: any[] = [];
        const DataValue =
          data
            .filter((x) => {
              if (!globalSearchValue) return true;

              if (
                x.Questionnaire?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return x.Questionnaire?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                );
              } else if (
                x["Requested From"]
                  ?.toLowerCase()
                  .includes(globalSearchValue?.toLowerCase() ?? "")
              ) {
                return x["Requested From"]
                  ?.toLowerCase()
                  .includes(globalSearchValue?.toLowerCase() ?? "");
              } else if (
                x["Requested By"]
                  ?.toLowerCase()
                  .includes(globalSearchValue?.toLowerCase() ?? "")
              ) {
                return x["Requested By"]
                  ?.toLowerCase()
                  .includes(globalSearchValue?.toLowerCase() ?? "");
              } else if (
                x.Status?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return x.Status?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                );
              } else if (
                x.Location?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                )
              ) {
                return x.Location?.toLowerCase().includes(
                  globalSearchValue?.toLowerCase() ?? ""
                );
              }
            })
            .map((m: any) => {
              if ((m.Questionnaire ?? "") === "") return;
              if (FilterNames.find((x) => x === m.Questionnaire)) {
                FilterNames.push(m.Questionnaire);
                return m.Questionnaire;
              } else if (FilterNames.find((x) => x === m["Requested From"])) {
                FilterNames.push(m["Requested From"]);
                return m["Requested From"];
              } else if (FilterNames.find((x) => x === m.Status)) {
                FilterNames.push(m.Status);
                return m.Status;
              } else if (FilterNames.find((x) => x === m.Location)) {
                FilterNames.push(m.Location);
                return m.Location;
              } else if (FilterNames.find((x) => x === m["Requested By"])) {
                FilterNames.push(m["Requested By"]);
                return m["Requested By"];
              }

              // var findItem = FilterNames.find(
              //   (x) => x === m.Questionnaire
              //   //||
              //   // x === m["Requested From"] ||
              //   //x == m.Status
              // );
              // if (!findItem) {
              //   FilterNames.push(m.Questionnaire);
              //   // FilterNames.push(m["Requested From"]);
              //   //FilterNames.push(m.Status);
              //   //return m.Questionnaire || m["Requested From"] || m.Status;
              //   return m.Questionnaire;
              // }
            }) ?? [];

        return FilterNames;
      },
      getSortByComment: (sortByComment) => {
        if (sortByComment) {
          let SortArray = [];
          let blankList: any = [];
          let dataArray = [];
          SortArray = data
            .filter((item) => {
              if (item.commentCreated_at !== "") {
                return item;
              }
            })
            .sort((a, b) =>
              new Date(b.commentCreated_at) < new Date(a.commentCreated_at)
                ? -1
                : 1
            );
          blankList = data.filter((item) => {
            if (item.commentCreated_at === "") {
              return item;
            }
          });
          dataArray = SortArray.concat(blankList);

          setlistingData(dataArray);
        } else {
          setlistingData(data);
        }
      },
      getlocationFilterData: (
        QuestionariesSearch,
        organisationSearch,
        activeTab
      ) => {
        let FilterNames: any[] = [];
        const DataValue =
          data
            .filter((x) => {
              if (!QuestionariesSearch) return true;
              return x.Questionnaire === QuestionariesSearch;
            })
            .filter((x) => {
              if (!organisationSearch) return true;
              return x["Requested From"] === organisationSearch;
            })
            .filter((r) => (activeTab != "All" ? r.Status == activeTab : r))
            .map((m: any) => {
              if ((m.Location ?? "") === "") return;
              var findItem = FilterNames.find((x) => x === m.Location);
              if (!findItem) {
                FilterNames.push(m.Location);
                return m.Location;
              }
            }) ?? [];

        return FilterNames;
      },
      getUserFilterData: (
        QuestionariesSearch,
        activeTab,
        location,
        organisationSearch,
        organisationUserSearchValue
      ) => {
        let FilterNames: any[] = [];
        const DataValue =
          data
            .filter((x) => {
              if (!QuestionariesSearch) return true;
              return x.Questionnaire === QuestionariesSearch;
            })
            .filter((x) => {
              if (!organisationSearch) return true;
              return x["Requested From"] === organisationSearch;
            })

            .filter((x) => {
              if (!location) return true;
              return x.Location === location;
            })
            .filter((r) => (activeTab != "All" ? r.Status == activeTab : r))
            .map((m: any) => {
              if ((m["Requested To"] ?? "") === "") return;
              var findItem = FilterNames.find((x) => x === m["Requested To"]);
              if (!findItem) {
                FilterNames.push(m["Requested To"]);
                return m["Requested To"];
              }
            }) ?? [];

        return FilterNames;
      },
    }),
    [data, setlistingData]
  );

  useEffect(() => {
    settableHeadings(
      table.getHeaderGroups().map((headerGroup) => {
        return headerGroup.headers.map((header) => {
          return header;
        });
      })
    );
  }, [listingData1, table]);

  if (
    !internalCompanyDataLoading &&
    !consultantFormsListLoading &&
    !assessorConsultantMappingLoading &&
    !loadingFormsList &&
    !assessmentsDetailsLoading &&
    !consultantAssessmentListloading &&
    !assessmentListDataloading
  ) {
    mainLoader = false;
  }

  const getExcelDownload = () => {
    const headerList = tableheader.tableHeadings[0]
      ?.filter(
        (m) =>
          ![
            "Id",
            "SubmissionId",
            "InviteeCompanyId",
            "InviteeCompanyName",
            "QuestionnareId",
            "isgroupform",
            "isindustryselected",
            "groupform",
            "ParentUserName",
            "ParentUserId",
            "UserId",
            "commentCreated_at",
            "isQuestionReassigned",
            "isRecommendationIcon",
            "isCarryForward",
            "Submission_Status",
            "Action",
          ].includes(m.id)
      )
      .map((heading) => heading.id);

    const order = headerList.map((m) => {
      if (m === "Requested From") {
        m = "Requested To";
      }
      return m;
    });
    let NewArray = [];
    let listingDataArray = [];
    listingDataArray.push(...listingData);
    NewArray = listingDataArray?.map((item: any) => {
      item["Score"] =
        item["Score"] !== "NA"
          ? Math.round(parseFloat(item["Score"]))
          : item["Score"];

      if (userSession?.user?.role === AppRoles.Inviter) {
        item["Requested To"] = item["Requested From"];
        let newObject: any = {};
        order.map((val) => {
          if (item.hasOwnProperty(val)) {
            newObject[val] = item[val];
          }
        });
        return newObject;
      } else {
        return item;
      }
    });
    listingDataArray = [];
    if (NewArray?.length > 0) {
      const today = new Date();
      let data = dayjs(today)
        .format("DD-MM-YYYYTHH:mm")
        .split(" ")
        .join("_")
        .split("-")
        .join("_")
        .split("T")
        .join("_")
        .split("T")
        .join("_")
        .split(":")
        .join("_")
        .split("+")
        .join("_");
      const sheetName = "Invitation_List";
      const worksheet = XLSX.utils.json_to_sheet(NewArray);
      if (worksheet["!ref"] && typeof worksheet["!ref"] === "string") {
        const headerRange = XLSX.utils.decode_range(worksheet["!ref"]);
        for (let i = headerRange.s.c; i <= headerRange.e.c; i++) {
          const headerCell = XLSX.utils.encode_cell({
            r: headerRange.s.r,
            c: i,
          });
          worksheet[headerCell].s = { font: { bold: true } };
        }
      }
      worksheet["!cols"] = [
        { width: 30 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
        { width: 20 },
      ];
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
      XLSX.writeFile(workbook, "Invitation_list_" + data + ".xlsx");
    }
  };

  const GlobalMaster_InviterFormAutoAppover =
    assessmentsDetails?.GlobalMaster_InviterFormAutoAppover;

  const userCompanyDetails: any = assessmentsDetails?.Company;

  return {
    tableheader,
    datatable,
    filter,
    statesFilter,
    pagination,
    mainLoader,
    globalMasterData,
    locationCount,
    getExcelDownload,
    userCompanyDetails,
    GlobalMaster_InviterFormAutoAppover,
    hasData: data?.length > 0,
  };
}