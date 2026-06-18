import {
  ActionIcon,
  Box,
  Button,
  Group,
  LoadingOverlay,
  Menu,
  Modal,
  Select,
  Stack,
  Tooltip,
} from "@mantine/core";
import { IconDotsVertical, IconEye } from "@tabler/icons-react";
import AddRecommendationIcon from "@/modules/warp/packages/client/components/svgIcons/AddRecommendationIcon2";
import DashboardIcon from "@/modules/warp/packages/client/components/svgIcons/DashboardIcon";
import DeviationReportIcon from "@/modules/warp/packages/client/components/svgIcons/DeviationReportIcon";
import DocumentProcessingIcon from "@/modules/warp/packages/client/components/svgIcons/DocumentProcessingIcon";
import DownloadDocIcon from "@/modules/warp/packages/client/components/svgIcons/DownloadDocIcon";
import DownloadExcelIcon from "@/modules/warp/packages/client/components/svgIcons/DownloadExcelIcon";
import DownloadPDFIcon from "@/modules/warp/packages/client/components/svgIcons/DownloadPDFIcon";
import InitiateAgainIcon from "@/modules/warp/packages/client/components/svgIcons/InitiateAgainIcon";
import ProgressReportIcon from "@/modules/warp/packages/client/components/svgIcons/ProgressReportIcon";
import QuestionairReportIcon from "@/modules/warp/packages/client/components/svgIcons/QuestionairReportIcon";
import StartAssessmentIcon from "@/modules/warp/packages/client/components/svgIcons/StartAssessmentIcon";
import { useDownloadAssessmentExcel } from "@/modules/warp/packages/client/hooks/use-download-assessment-excel";
import { useDownloadAssessmentPDF } from "@/modules/warp/packages/client/hooks/use-download-assessment-pdf";
import { useDownloadBRSRAssessmentPDF } from "@/modules/warp/packages/client/hooks/use-download-brsr-assessment-pdf";
import {
  ProgressReportMessage,
  RecommendationListionPageMessage,
  gotoUploadDocs,
  startInvitationMessage,
  viewInvitationMessage,
  warpAssignReviewerforAssessment,
  warpDeviationReport,
  warpQuestionnaireReport
} from "@/modules/warp/packages/client/services/platform-window-message.service";
import { WebCuration_Insert_Input } from "@/modules/warp/packages/graphql/generated/types";
import { useBulkinsertwebCurationMutation } from "@/modules/warp/packages/graphql/mutations/generated/bulk-insert-webCuration";
import { useUpdateFormInvitationStatusMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-form-invitation-status";
import { useUpdateNewSubmissionByInvitationIdMutation } from "@/modules/warp/packages/graphql/mutations/generated/update-new-submission-by-invitation-id";
import { useGetFormDetailByBulkFormIdLazyQuery } from "@/modules/warp/packages/graphql/queries/generated/get-form-detail-by-bulk-form-id";
import {
  AppRoles,
  FormInvitationStatus,
  FormInvitationUIStatus,
  FormTypes,
  InvitationAIStatus,
  WebDataCurationStatus,
} from "@/modules/warp/packages/shared/constants/app.constants";
import { setLocalStorageData } from "@/modules/warp/packages/shared/utils/auth-session.util";
import { isAIUserFromMetadata } from "@/modules/warp/packages/shared/utils/jwt-ai.util";
import { SendInvitationSelectExistingCompanyType } from "@/modules/warp/packages/shared/validation/send-invitation-select-existing-company.schema";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useDownloadAssessmentDocs } from "../../../hooks/use-download-assessment-doc";
import { s3PublicUrl } from "@/modules/warp/packages/configs/s3bucket.config";

const postParentMessage = (message: string) =>
  window.parent?.postMessage(message, "*");

type Props = {
  row: any;
  userSession: any;
  globalMasterData: any;
  formListManualApproval: any;
  chkCompanyId: any;
  GlobalMaster_InviterFormAutoAppover: any;
  companyDetails: any;
  isDisable: boolean;
  isDisableforMakerChecker: boolean;
  AIStatus: InvitationAIStatus;
};

const InvitationButtons = ({
  row,
  userSession,
  globalMasterData,
  formListManualApproval,
  chkCompanyId,
  GlobalMaster_InviterFormAutoAppover,
  companyDetails,
  isDisable,
  isDisableforMakerChecker,
  AIStatus,
}: Props) => {
  const isAIUser = isAIUserFromMetadata(row?.original?.metadata);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { generateAndDownloadPdf, loading } = useDownloadAssessmentPDF();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const refetch = useGetFormDetailByBulkFormIdLazyQuery()[0];
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [originalId, setOriginalId] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [CompanyName, setCompanyname] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [opened, setOpened] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [Questionnaireselectedlist, setQuestionnairelist] = useState([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [invitionid, setinvitionid] = useState("");
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const { generateAndDownloadExcel, load } = useDownloadAssessmentExcel();
  const { generateAndDownloadBRSRPdf, loader } = useDownloadBRSRAssessmentPDF();
  const { generateDownloadAssessmentDoc } = useDownloadAssessmentDocs();
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [industryList, setindustryList] = useState([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [industrychanged, setindustrychanged] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [showMessageOpened, setshowMessageOpened] = useState(false);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [formidindustry, setformidindustry] = useState([]);
  // eslint-disable-next-line react-hooks/rules-of-hooks
  const [Industry, setIndustry] = useState("");
  const [Questionnaireselected, setQuestionnaire] = useState("");
  const setopopupOpened = () => {
    setOpened(true);
  };
  const insertWebCuration = useBulkinsertwebCurationMutation()[0];
  const updateFormInvitation = useUpdateFormInvitationStatusMutation()[0];
  const setinvitionidonopen = (invitionid: any) => {
    setinvitionid(invitionid);
  };

  const fType = row?.original?.formType;
  const capitalizedFormType = fType
    ? String(fType).charAt(0).toUpperCase() + String(fType).slice(1)
    : FormTypes.Assessment;

  const setstartdetails = async (Questionnaire: any, Company: any) => {
    setQuestionnairelist(Questionnaire);
    setCompanyname(Company);
  };
  const selectIndustry = (industry: any) => {
    let industryval: any = industryList.filter(
      (item: any) => item.value === industry,
    );
    setIndustry(industryval.length > 0 ? industryval[0].label : "");
    setformidindustry(industry);
    setindustrychanged(true);
    let formlist = Questionnaireselectedlist;
    let Formnamelist: any = formlist
      .filter((item: any) => item.formId.trim().toLowerCase() === industry)
      .map((item: any) => item)[0];
    const formName = Formnamelist.Form.name;
    setQuestionnaire(formName);
  };
  const setindustrydetails = async (formid: any, formdetails: any) => {
    //setformid(formid);
    const _formIds = formdetails?.map((index: any) => index.formId);
    //setgroupfromids(_formIds);
    const { data, error } = await refetch({
      variables: {
        formId: _formIds.length > 0 ? _formIds : formid,
      },
    });
    const industryList = data?.FormDetails?.flatMap((rec) => {
      return (
        rec.industry?.map((item: any) => ({
          value: rec.formId,
          label: item,
        })) ?? []
      );
    });

    let industryListnew: any;
    industryListnew = industryList;
    setindustryList(industryListnew);
  };
  const respondClickHandler = (
    invitationId: String,
    AssessmentFormName: string,
    CompanyName: string,
    invitationStatus: String,
    AIBulkDocumentProcessings: Record<string, any>[],
    Sources: Record<string, any>[],
    reviewerParentCompanyId: string | null,
    parentcompanyId: string | null,
    companyId: string | null,
    formType: string,
    formDetails: any,
  ) => {
    if (
      reviewerParentCompanyId === null &&
      parentcompanyId !== companyId &&
      formType === FormTypes.Assessment
      && userSession?.user?.role !== AppRoles.Responder
    ) {
      formDetails.invitationId = invitationId;
      formDetails.formType = formType;
      formDetails.companyId = companyId;
      formDetails.AssessmentFormName = AssessmentFormName;
      formDetails.CompanyName = CompanyName;
      formDetails.AIStatus = AIStatus;
      formDetails.invitationStatus = invitationStatus;
      formDetails.AIBulkDocumentProcessings = AIBulkDocumentProcessings;
      formDetails.Sources = Sources;
      postParentMessage(warpAssignReviewerforAssessment(true, formDetails));
    } else {
      postParentMessage(
        startInvitationMessage(
          invitationId,
          AssessmentFormName,
          CompanyName,
          AIStatus,
          invitationStatus,
          AIBulkDocumentProcessings,
          Sources,
        ),
      );
    }
  };

  const AIProcessingHandler = (
    invitationId: string,
    AssessmentFormName: string,
    CompanyName: string,
  ) => {
    postParentMessage(
      gotoUploadDocs(
        invitationId,
        AssessmentFormName,
        CompanyName,
        // use AI-capability flag
        true,
      ),
    );
  };

  const UpdateNewSubmissionMutation =
    useUpdateNewSubmissionByInvitationIdMutation()[0];

  const InviterFormAutoAppoverData = GlobalMaster_InviterFormAutoAppover
    ? {
      GlobalMaster: GlobalMaster_InviterFormAutoAppover,
    }
    : undefined;

  // const { data: InviterFormAutoAppoverData } =
  //   globalMasterDataStorage?.GlobalMaster?.filter(
  //     (x: any) => x.type === "InviterFormAutoAppover"
  //   );
  const { setError, handleSubmit, control, reset } =
    useForm<SendInvitationSelectExistingCompanyType>({
      //resolver: yupResolver(SendInvitationSelectExistingCompanySchema),
      defaultValues: {
        duration: { fromDate: new Date(), toDate: new Date() },
        selectedCompanyIds: [],
      },
    });
  const UpdateIndustry = async (
    messageresponse: string,
    invitationStatus: String,
    AIBulkDocumentProcessings: Record<string, any>[],
    Sources: Record<string, any>[],
  ) => {
    // If already approved then return;
    if (messageresponse === "Yes") {
      const formId = formidindustry;

      let invitationId: any;
      invitationId = invitionid;
      let metadatanew = {};
      if (!!companyDetails) {
        ////companyListData.data?.Company.map((item: any) => {
        metadatanew = {
          applicationId: companyDetails.metadata?.applicationId ?? "",
          crn: companyDetails.metadata?.crn ?? "",
          industry: Industry,
        };
        // });
      }

      let isManufacturing: any = null;
      isManufacturing =
        Industry !== null
          ? Industry === "Manufacturing"
            ? true
            : Industry === "Non Manufacturing"
              ? false
              : null
          : null;

      //update records

      const newSubmission = await UpdateNewSubmissionMutation({
        variables: {
          invitationId,
          formId,
          metadata: metadatanew,
          companyId: userSession?.company?.id,
          isManufacturing,
        },
      });

      setindustrychanged(false);
      setOpened(false);
      respondClickHandler(
        invitationId,
        Questionnaireselected,
        CompanyName,
        invitationStatus,
        AIBulkDocumentProcessings,
        Sources,
        row?.original?.reviewerParentCompanyId,
        row?.original?.parentcompanyId,
        row?.original?.companyId,
        row?.original?.formType,
        row?.original,
      );
    }
  };
  const onClickView = (
    invitationId: String,
    AssessmentFormName: string,
    ComapnyName: string,
    QuestionnareId: String,
    Status: String,
    isCarryForward: boolean,
    isRecommendationIcon: boolean,
    period: string,
    requestedFrom: string,
    Submission_Status: string,
    questionid: string,
    DeviationCount: number,
    IsCarryForward: Boolean,
    SubmissionId: string,
    Score: string,
  ) => {
    // Re-submitted: force the form to open on the 1st question of the 1st
    // section. Empty questionid drops any URL deep-link; the flag tells the
    // form iframe's `snowkap-isRefreshPage` handler to ignore the parent's
    // questionId for this one navigation.
    const isResubmitted =
      Status?.toLowerCase() ===
      FormInvitationUIStatus.Resubmitted.toLocaleLowerCase();

    setLocalStorageData(
      window.localStorage,
      "ForceFirstQuestionOnView",
      "null",
    );

    if (isResubmitted) {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", "null");
      setLocalStorageData(
        window.localStorage,
        "ForceFirstQuestionOnView",
        "true",
      );
    } else {
      setLocalStorageData(window.localStorage, "IsPageRefreshed", questionid);
    }
    const effectiveQuestionId = isResubmitted ? "" : questionid;

    const isRecommendationIcon_new =
      Status.toLowerCase() === "started" && isRecommendationIcon === true
        ? false
        : isRecommendationIcon;
    postParentMessage(
      viewInvitationMessage(
        invitationId,
        AssessmentFormName,
        ComapnyName,
        isRecommendationIcon_new,
        period,
        requestedFrom,
        effectiveQuestionId,
        DeviationCount,
        IsCarryForward,
        SubmissionId,
        Score,
      ),
    );
  };

  const onClickRecommendation = (
    invitationId: String,
    Questionnare: String,
    Period: String,
    ComapnyName: string,
    DeviationCount: number,
    IsCarryForward: Boolean,
    SubmissionId: string,
    Score: string,
  ) => {
    postParentMessage(
      RecommendationListionPageMessage(
        invitationId,
        Questionnare,
        Period,
        ComapnyName,
        DeviationCount,
        IsCarryForward,
        SubmissionId,
        Score,
      ),
    );
  };

  const onProgressReport = (
    invitationId: String,
    Questionnare: String,
    Period: String,
    ComapnyName: string,
    SubmissionId: string,
    DeviationCount: number,
    IsCarryForward: Boolean,
  ) => {
    postParentMessage(
      ProgressReportMessage(
        invitationId,
        Questionnare,
        Period,
        ComapnyName,
        SubmissionId,
        DeviationCount,
        IsCarryForward,
      ),
    );
  };

  const onDeviationReport = (
    invitationId: string,
    deviationCount: number,
    Questionnare: String,
    Period: String,
    ComapnyName: string,
  ) => {
    postParentMessage(
      warpDeviationReport(
        invitationId,
        deviationCount,
        Questionnare,
        Period,
        ComapnyName,
      ),
    );
  };
  useEffect(() => {
    if (!loading) setOriginalId("");
  }, [loading]);
  const downloadPdf = (
    _originalId: string,
    _submissionId: string,
    _questionaryName: string,
    _questionaryId: string,
    _GlobalMasterData: any,
  ) => {
    setOriginalId(_originalId);
    generateAndDownloadPdf(
      _originalId,
      _submissionId,
      _questionaryName,
      _questionaryId,
      _GlobalMasterData,
    );
  };
  const downloadExcel = (
    _originalId: string,
    _submissionId: string,
    _questionaryName: string,
  ) => {
    setOriginalId(_originalId);
    generateAndDownloadExcel(_originalId, _submissionId, _questionaryName);
  };
  const downloadPdf_brsr = async (
    invitationId: string,
    questionaryName: string,
  ) => {
    // Prepare s3 file config params
    // const res = await apiRequest.get(`/api/awss3/get-download-url`);
    // const downloadURL = res.data + invitationId + ".pdf";
    // const filename = questionaryName;
    // const response = await fetch(downloadURL);
    // const pdfBlob = await response.blob();
    // const url = URL.createObjectURL(pdfBlob);
    // const link = document.createElement("a");
    // link.href = url;
    // link.download = filename;
    // document.body.appendChild(link);
    // link.click();
    // document.body.removeChild(link);
    generateAndDownloadBRSRPdf(invitationId, questionaryName);
  };
  const downloadBrsrDoc = async (
    invitationId: string,
    questionaryName: string,
  ) => {
    let jsonData: any = "";
    if (!jsonData) {
      jsonData = await fetch(
        questionaryName === "BRSR Core"
          ? s3PublicUrl("templates/BRSR_Core.txt")
          : questionaryName === "BRSR Comprehensive Core"
            ? s3PublicUrl("templates/BRSR_Comprehensive_Core_Doc_Template.txt")
            : s3PublicUrl("templates/BRSR_Questionnaire.txt"),
      )
        .then((response) => {
          return response.text();
        })
        .then(async (data) => {
          try {
            // The file contains JavaScript object notation, not JSON
            // Wrap it in a function and evaluate it to get the object
            const jsObject = eval(`(${data})`);
            // Convert to proper JSON string
            return JSON.stringify(jsObject);
          } catch (error) {
            console.error("Error parsing JavaScript object:", error);
            return data; // Return original if eval fails
          }
        })
        .catch((error) => {
          console.error("Error fetching the file:", error);
        });
    }
    generateDownloadAssessmentDoc(invitationId, jsonData);
  };
  let showmenu: boolean = true;
  console.log("row?.original?.Status", row?.original?.Status);

  userSession?.user?.role === AppRoles.Invitee &&
    row?.original?.pcCompany === row?.original?.vcCompany;
  if (
    row?.original?.Status === FormInvitationUIStatus.Requested ||
    row?.original?.Status === FormInvitationUIStatus.Started ||
    row?.original?.Status === FormInvitationUIStatus.ReadyForReporting ||
    row?.original?.Status === FormInvitationUIStatus.ReadyForAssessment
  ) {
    console.log("FormInvitationUIStatus.Started 502", FormInvitationUIStatus.Started);
    if (row?.original?.Status === FormInvitationUIStatus.Started) {
      console.log("isQuestionReassigned 503", row?.original?.isQuestionReassigned);
      console.log("userSession?.user?.role 504", userSession?.user?.role);
      console.log("row?.original?.pcCompany 505", row?.original?.pcCompany);
      console.log("row?.original?.vcCompany 506", row?.original?.vcCompany);
      if (
        (row?.original?.isQuestionReassigned == null ||
          !row?.original?.isReviewer &&
          (row?.original?.isQuestionReassigned == undefined &&
            row?.original?.isQuestionReassigned == "") ||
          row?.original?.isQuestionReassigned == false ||
          row?.original?.ParentUserid !== userSession?.user?.id) &&
        userSession?.user?.role === AppRoles.Invitee &&
        row?.original?.pcCompany === row?.original?.vcCompany
      ) {
        showmenu = false;
        console.log("showmenu 517", showmenu);
      }

      if (
        userSession?.user?.role === AppRoles.Inviter ||
        userSession?.user?.role === AppRoles.Consultant
      ) {
        showmenu = false;
        console.log("showmenu 526", showmenu);
      }

      if (
        row?.original?.isQuestionReassigned === true &&
        (userSession?.user?.role === AppRoles.Invitee ||
          userSession?.user?.role === AppRoles.Inviter ||
          userSession?.user?.role === AppRoles.Responder ||
          userSession?.user?.role === AppRoles.Consultant) &&
        row?.original?.pcCompany === row?.original?.vcCompany
      ) {
        showmenu = true;
      }

      if (
        (row?.original?.isQuestionReassigned == null ||
          (row?.original?.isQuestionReassigned == undefined &&
            row?.original?.isQuestionReassigned == "") ||
          row?.original?.isQuestionReassigned == false) &&
        userSession?.user?.role === AppRoles.Invitee &&
        row?.original?.pcCompany !== row?.original?.vcCompany
      ) {
        showmenu = false;
        console.log("showmenu 549", showmenu);
      }

      if (
        row?.original?.isQuestionReassigned === true &&
        userSession?.user?.role === AppRoles.Inviter &&
        row?.original?.pcCompany === row?.original?.vcCompany
      ) {
        showmenu = true;
      }
    } else {
      if (userSession?.user?.role === AppRoles.Invitee) {
        if (
          row?.original?.isgroupform === true &&
          row?.original?.isindustryselected === false
        ) {
          showmenu = false;
          console.log("showmenu 565", showmenu);
        } else {
          if (row?.original?.isgroupform === false) {
            showmenu = false;
            console.log("showmenu 570", showmenu);
          }
        }
      } else {
        showmenu = false;
        console.log("showmenu 575", showmenu);
      }
    }
  }

  if (row?.original?.Status === FormInvitationUIStatus.Started || row?.original?.Status === FormInvitationUIStatus.PendingReview || row?.original?.Status === FormInvitationUIStatus.UnderReview || row?.original?.Status === FormInvitationUIStatus.Declined || row?.original?.Status === FormInvitationUIStatus.Resubmitted) {
    if (row?.original?.isQuestionReassigned === true && !row?.original?.isReviewer) {
      console.log("isReviewer 582", !!row?.original?.isReviewer);
      console.log("userSession?.user?.role 582", userSession?.user?.role);
      console.log("pcCompany 582", row?.original?.pcCompany);
      console.log("vcCompany 582", row?.original?.vcCompany);
      if (!!row?.original?.isReviewer === true &&
        row?.original?.pcCompany !== row?.original?.vcCompany) {
        showmenu = false;
        console.log("showmenu 585", showmenu);
      } else {
        showmenu = true;
      }
    } else {
      showmenu = false;
      console.log("showmenu 591", showmenu);
    }
  }

  // if (
  //   row?.original?.Status === FormInvitationUIStatus.Responded &&
  //   userSession?.user?.role === AppRoles.Invitee
  // ) {
  //   if (!!row?.original?.pcCompany) {
  //     if (
  //       row?.original?.ParentUserid !== userSession?.user?.id &&
  //       row?.original?.pcCompany === row?.original?.vcCompany
  //     ) {
  //       showmenu = false;
  //     }
  //   }
  // }
  if (
    row?.original?.Status === FormInvitationUIStatus.Failed ||
    row?.original?.Status === FormInvitationUIStatus.Processing
  ) {
    showmenu = false;
    console.log("showmenu 613", showmenu);
  }

  function showDashboardIcon(row: any) {
    {
      // Hide dashboard for reviewers
      if (row?.original?.isReviewer) {
        return null;
      }

      return globalMasterData
        ?.filter(
          (item1: any) =>
            item1.type.toLowerCase() ===
            "InvitationListDashboardActionPermission".toLowerCase(),
        )[0]
        ?.data?.filter((x: any) => x.formId === row?.original?.QuestionnareId)
        .map((rec: any) => {
          const data =
            formListManualApproval?.filter((x: any) => x?.formId == rec?.formId)
              .length > 0 ? (
              row?.original?.Status === FormInvitationUIStatus.Approved ? (
                <Menu.Item
                  style={{ fontSize: 12 }}
                  className="invation-btn"
                  leftSection={
                    <DashboardIcon
                      color="#666"
                    // style={{
                    //   width: "21px",
                    //   height: "22px",
                    //   marginLeft: "3px",
                    // }}
                    />
                  }
                  onClick={(e: any) => {
                    e.stopPropagation();
                    var url =
                      window.location != window.parent.location
                        ? document.referrer
                        : document.location.href;

                    window.open(
                      `${url +
                      rec?.formUrl +
                      row.original.InviteeCompanyId +
                      rec?.invitationIdUrl +
                      row?.original?.Id
                      }`,
                      "_ blank",
                    );
                  }}
                >
                  Dashboard
                </Menu.Item>
              ) : (
                ""
                // chkCompanyId?.filter(
                //   (item: any) => item.formId === row?.original?.QuestionnareId
                // )?.IsShowExternalAssessmentColumn === true && (
                //   <Menu.Item
                //     icon={
                //       <DashboardIcon
                //         style={{ width: "25px", height: "22px" }}
                //       />
                //     }
                //     onClick={(e: any) => {
                //       e.stopPropagation();
                //       var url =
                //         window.location != window.parent.location
                //           ? document.referrer
                //           : document.location.href;

                //       window.open(
                //         `${
                //           url +
                //           rec?.formUrl +
                //           row.original.InviteeCompanyId +
                //           rec?.invitationIdUrl +
                //           row.original.Id
                //         }`,
                //         "_ blank"
                //       );
                //     }}
                //   >
                //     Dashboard
                //   </Menu.Item>
              )
            ) : row?.original?.Status === FormInvitationUIStatus.Responded &&
              chkCompanyId?.filter(
                (item: any) => item.formId === row?.original?.QuestionnareId,
              )?.length === 0 ? (
              // userSession?.user?.role === AppRoles.Invitee &&
              // row.original.InviteeCompanyId ===
              //   "9e3c02db-c8c6-4892-8bae-d8bda828bd7a" ? (
              //   ""
              // ) :
              <Menu.Item
                style={{ fontSize: 12 }}
                className="invation-btn"
                leftSection={
                  <DashboardIcon
                    color="#666"
                  // style={{
                  //   width: "21px",
                  //   height: "22px",
                  //   marginLeft: "3px",
                  // }}
                  />
                }
                // style={{
                //   opacity: "0.2",
                //   pointerEvents: "none",
                //   fontSize: 12,
                // }}
                onClick={(e: any) => {
                  e.stopPropagation();
                  var url =
                    window.location != window.parent.location
                      ? document.referrer
                      : document.location.href;

                  window.open(
                    `${url +
                    rec?.formUrl +
                    row?.original?.InviteeCompanyId +
                    rec?.invitationIdUrl +
                    row?.original?.Id
                    }`,
                    "_ blank",
                  );
                }}
              >
                Dashboard
              </Menu.Item>
            ) : row?.original?.Status === FormInvitationUIStatus.Responded &&
              chkCompanyId?.filter(
                (item: any) => item.formId === row?.original?.QuestionnareId,
              )?.IsShowExternalAssessmentColumn === true ? (
              ""
            ) : (
              // : userSession?.user?.role === AppRoles.Invitee &&
              //   row.original.InviteeCompanyId ===
              //     "9e3c02db-c8c6-4892-8bae-d8bda828bd7a" ? (
              //   ""
              // )
              <Menu.Item
                style={{ fontSize: 12 }}
                className="invation-btn"
                leftSection={
                  <DashboardIcon
                    color="#666"
                  // style={{
                  //   width: "21px",
                  //   height: "22px",
                  //   marginLeft: "3px",
                  // }}
                  />
                }
                onClick={(e: any) => {
                  e.stopPropagation();
                  var url =
                    window.location != window.parent.location
                      ? document.referrer
                      : document.location.href;

                  window.open(
                    `${url +
                    rec?.formUrl +
                    row?.original?.InviteeCompanyId +
                    rec?.invitationIdUrl +
                    row?.original?.Id
                    }`,
                    "_ blank",
                  );
                }}
              >
                Dashboard
              </Menu.Item>
            );
          return data;
        });
    }
  }
  const retryCuration = async () => {
    await updateFormInvitation({
      variables: {
        invitationId: row?.original?.Id,
        invitationStatus: FormInvitationStatus.Processing,
      },
    });
    const webCurationInsertInput: WebCuration_Insert_Input[] = [];
    webCurationInsertInput.push({
      formInvitationId: row?.original?.Id,
      status: WebDataCurationStatus.Processing,
      triggeredByUserId: userSession?.user?.id,
      isRetry: true,
      startAt: new Date(),
    });
    const webCurationInsertion = await insertWebCuration({
      variables: {
        webCurationInsertInput: webCurationInsertInput,
      },
    });
    fetch("/warp/api/AI/AIprocessing", {
      method: "POST",
      headers: {
        "content-type": "application/json",
      },
      body: JSON.stringify({
        process: "newFormInvitation",
        data: [
          {
            company_id: row?.original?.pcCompanyId,
            form_id: row?.original?.formId,
            form_invitation_id: row?.original?.Id,
            web_curation_id:
              !!webCurationInsertion?.data?.insert_WebCuration?.returning &&
                webCurationInsertion?.data?.insert_WebCuration?.returning.length >
                0
                ? webCurationInsertion?.data?.insert_WebCuration?.returning[0]
                  ?.id
                : "",
          },
        ],
      }),
    });
  };

  return (
    <>
      {row?.original?.Status === FormInvitationUIStatus.PendingReview || ((row?.original?.Status === FormInvitationUIStatus.Declined || row?.original?.Status === FormInvitationUIStatus.Resubmitted) && row?.original?.isReviewer) ? (
        row?.original?.isReviewer ? (
          <Tooltip position="bottom-end" offset={0} label="Start">
            <ActionIcon
              variant="transparent"
              disabled={isDisable}
              onClick={(e: any) => {
                e.stopPropagation();
                respondClickHandler(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row?.original?.InviteeCompanyName,
                  row?.original?.OriginalStatus,
                  row?.original?.AIBulkDocumentProcessings,
                  row?.original?.Sources,
                  row?.original?.reviewerParentCompanyId,
                  row?.original?.parentcompanyId,
                  row?.original?.companyId,
                  row?.original?.formType,
                  row?.original,
                );
              }}
            >
              <StartAssessmentIcon color="#003B52" />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip position="bottom-end" offset={0} label="View">
            <ActionIcon
              style={{
                color: "#454545",
                "&:hover": {
                  color: "#FF9E1B",
                },
              }}
              variant="transparent"
              onClick={(e: any) => {
                e.stopPropagation();
                onClickView(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row.original["Requested From"] !== null &&
                    row.original["Requested From"] !== undefined &&
                    row.original["Requested From"] !== "NA"
                    ? row.original["Requested From"]
                    : row.original["Requested To"],
                  row?.original?.QuestionnareId,
                  row?.original?.Status,
                  row?.original?.isCarryForward,
                  row?.original?.isRecommendationIcon,
                  row?.original.Period,
                  row?.original["Requested From"],
                  row?.original?.Submission_Status,
                  row?.original?.lastAttemptedQuestionId,
                  row.original.deviationCount,
                  row.original.isCarryForward,
                  row.original.SubmissionId,
                  row.original.Score,
                );
              }}
            >
              <IconEye color="#003B52" />
            </ActionIcon>
          </Tooltip>
        )
      ) : (row?.original?.OriginalStatus === FormInvitationUIStatus.UnderReview && !row?.original?.isReviewer && (row?.original?.Status === FormInvitationUIStatus.Declined)) && (userSession?.user?.role !== AppRoles.Inviter || (!!row?.original?.ParentUserId && row?.original?.ParentUserId === row?.original?.UserId)) ||
        (row?.original?.OriginalStatus === FormInvitationUIStatus.UnderReview && userSession?.user?.role === AppRoles.Responder && (row?.original?.Status === FormInvitationUIStatus.Declined)) && userSession?.user?.role !== AppRoles.Inviter ?

        (
          <Tooltip position="bottom-end" offset={0} label="Start">
            <ActionIcon
              variant="transparent"
              onClick={(e: any) => {
                e.stopPropagation();
                respondClickHandler(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row?.original?.InviteeCompanyName,
                  row?.original?.OriginalStatus,
                  row?.original?.AIBulkDocumentProcessings,
                  row?.original?.Sources,
                  row?.original?.reviewerParentCompanyId,
                  row?.original?.parentcompanyId,
                  row?.original?.companyId,
                  row?.original?.formType,
                  row?.original,
                );
              }}
            >
              <StartAssessmentIcon color="#003B52" />
            </ActionIcon>
          </Tooltip>
        )
        : row?.original?.Status === FormInvitationUIStatus.Requested ||
          // Add condition for Inviter self-assessment with allowedAICuration
          (row?.original?.Status === FormInvitationUIStatus.Requested &&
            userSession?.user?.role === AppRoles.Inviter &&
            !!row?.original?.ParentUserId &&
            !!row?.original?.UserId &&
            String(row?.original?.ParentUserId) ===
            String(row?.original?.UserId) &&
            row?.original?.metadata?.AIData?.allowedAICuration?.length > 0) ||
          (!!row?.original?.ParentUserId &&
            row?.original?.ParentUserId === row?.original?.UserId
            ? row?.original?.Status ===
            FormInvitationUIStatus.ReadyForAssessment ||
            row?.original?.Status ===
            FormInvitationUIStatus.ReadyForReporting ||
            row?.original?.Status === FormInvitationUIStatus.Started
            : row?.original?.Status === FormInvitationUIStatus.Started) ? (
          userSession?.user?.role === AppRoles.Inviter ||
            userSession?.user?.role === AppRoles.Consultant ? (
            (!!row?.original?.ParentUserId &&
              row?.original?.ParentUserId === row?.original?.UserId &&
              (row?.original?.Status ===
                FormInvitationUIStatus.ReadyForAssessment ||
                row?.original?.Status ===
                FormInvitationUIStatus.ReadyForReporting ||
                row?.original?.Status === FormInvitationUIStatus.Started)) ||
              (row?.original?.Status === FormInvitationUIStatus.Requested &&
                userSession?.user?.role === AppRoles.Inviter &&
                !!row?.original?.ParentUserId &&
                !!row?.original?.UserId &&
                String(row?.original?.ParentUserId) ===
                String(row?.original?.UserId) &&
                row?.original?.metadata?.AIData?.allowedAICuration?.length > 0 &&
                (capitalizedFormType === FormTypes.Assessment ||
                  capitalizedFormType === FormTypes.Report)) ? (
              <Tooltip disabled position="bottom-end" offset={0} label="Start">
                <ActionIcon
                  variant="transparent"
                  disabled={isDisable}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    respondClickHandler(
                      row?.original?.Id,
                      row?.original?.Questionnaire,
                      row?.original?.InviteeCompanyName,
                      row?.original?.OriginalStatus,
                      row?.original?.AIBulkDocumentProcessings,
                      row?.original?.Sources,
                      row?.original?.reviewerParentCompanyId,
                      row?.original?.parentcompanyId,
                      row?.original?.companyId,
                      row?.original?.formType,
                      row?.original,
                    );
                  }}
                >
                  <StartAssessmentIcon color="#003B52" />
                </ActionIcon>
              </Tooltip>
            ) : (
              row?.original?.Status === FormInvitationUIStatus.Started && (
                <Tooltip position="bottom-end" offset={0} label="View">
                  <ActionIcon
                    style={{
                      color: "#454545",
                      "&:hover": {
                        color: "#FF9E1B",
                      },
                    }}
                    variant="transparent"
                    onClick={(e: any) => {
                      e.stopPropagation();
                      onClickView(
                        row?.original?.Id,
                        row?.original?.Questionnaire,
                        // row?.original?.ParentUserName ??
                        //   row?.original?.InviteeCompanyName,
                        row.original["Requested From"] !== null &&
                          row.original["Requested From"] !== undefined &&
                          row.original["Requested From"] !== "NA"
                          ? row.original["Requested From"]
                          : row.original["Requested To"],
                        row?.original?.QuestionnareId,
                        row?.original?.Status,
                        row?.original?.isCarryForward,
                        row?.original?.isRecommendationIcon,
                        row?.original.Period,
                        row?.original["Requested From"],
                        row?.original?.Submission_Status,
                        row?.original?.lastAttemptedQuestionId,
                        row.original.deviationCount,
                        row.original.isCarryForward,
                        row.original.SubmissionId,
                        row.original.Score,
                      );
                    }}
                  >
                    <IconEye color="#003B52" />
                  </ActionIcon>
                </Tooltip>
              )
            )
          ) : row?.original?.isFileCurating ? (
            <></>
          ) : row?.original?.isgroupform === true &&
            row?.original?.isindustryselected === false ? (
            <Button
              disabled={isDisable}
              fullWidth={false}
              radius={0}
              color="solidBtn"
              my="12px"
              onClick={(val: any) => {
                val.stopPropagation();
                setopopupOpened();
                setinvitionidonopen(row?.original?.Id);
                setindustrydetails(
                  row?.original?.QuestionnareId,
                  row?.original?.groupform,
                );
                setstartdetails(
                  row?.original?.groupform,
                  row?.original?.InviteeCompanyName,
                );
              }}
              className="SelectIndustryButton"
            >
              Select Industry
            </Button>
          ) : row?.original?.isReviewer ? (
            <Tooltip position="bottom-end" offset={0} label="View">
              <ActionIcon
                style={{
                  color: "#454545",
                  "&:hover": {
                    color: "#FF9E1B",
                  },
                }}
                variant="transparent"
                onClick={(e: any) => {
                  e.stopPropagation();
                  onClickView(
                    row?.original?.Id,
                    row?.original?.Questionnaire,
                    // row?.original?.ParentUserName ??
                    //   row?.original?.InviteeCompanyName,
                    row.original["Requested From"] !== null &&
                      row.original["Requested From"] !== undefined &&
                      row.original["Requested From"] !== "NA"
                      ? row.original["Requested From"]
                      : row.original["Requested To"],
                    row?.original?.QuestionnareId,
                    row?.original?.Status,
                    row?.original?.isCarryForward,
                    row?.original?.isRecommendationIcon,
                    row?.original.Period,
                    row?.original["Requested From"],
                    row?.original?.Submission_Status,
                    row?.original?.lastAttemptedQuestionId,
                    row.original.deviationCount,
                    row.original.isCarryForward,
                    row.original.SubmissionId,
                    row.original.Score,
                  );
                }}
              >
                <IconEye color="#003B52" />
              </ActionIcon>
            </Tooltip>
          ) : row?.original?.Status === FormInvitationUIStatus.Requested ? (
            <Button
              disabled={isDisable}
              onClick={(e: any) => {
                e.stopPropagation();
                respondClickHandler(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row?.original?.InviteeCompanyName,
                  row?.original?.OriginalStatus,
                  row?.original?.AIBulkDocumentProcessings,
                  row?.original?.Sources,
                  row?.original?.reviewerParentCompanyId,
                  row?.original?.parentcompanyId,
                  row?.original?.companyId,
                  row?.original?.formType,
                  row?.original,
                );
              }}
              style={{
                borderRadius: "20px",
                height: "28px",
                padding: "3px 15px",
              }}
              color="outlineBtn"
            >
              Respond
            </Button>
          ) : userSession?.user?.role !== AppRoles?.Responder && (row.original.Submission_Status === "Submitted" ||
            row.original.Submission_Status === "InProgress") ?
            (
              <Tooltip position="bottom-end" offset={0} label="View">
                <ActionIcon
                  style={{
                    color: "#454545",
                    "&:hover": {
                      color: "#FF9E1B",
                    },
                  }}
                  variant="transparent"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    onClickView(
                      row?.original?.Id,
                      row?.original?.Questionnaire,
                      // row?.original?.ParentUserName ??
                      //   row?.original?.InviteeCompanyName,
                      row.original["Requested From"] !== null &&
                        row.original["Requested From"] !== undefined &&
                        row.original["Requested From"] !== "NA"
                        ? row.original["Requested From"]
                        : row.original["Requested To"],
                      row?.original?.QuestionnareId,
                      row?.original?.Status,
                      row?.original?.isCarryForward,
                      row?.original?.isRecommendationIcon,
                      row?.original.Period,
                      row?.original["Requested From"],
                      row?.original?.Submission_Status,
                      row?.original?.lastAttemptedQuestionId,
                      row.original.deviationCount,
                      row.original.isCarryForward,
                      row.original.SubmissionId,
                      row.original.Score,
                    );
                  }}
                >
                  <IconEye color="#003B52" />
                </ActionIcon>
              </Tooltip>
            )
            : (
              <Tooltip disabled position="bottom-end" offset={0} label="Start">
                <ActionIcon
                  variant="transparent"
                  disabled={isDisable}
                  onClick={(e: any) => {
                    e.stopPropagation();
                    respondClickHandler(
                      row?.original?.Id,
                      row?.original?.Questionnaire,
                      row?.original?.InviteeCompanyName,
                      row?.original?.OriginalStatus,
                      row?.original?.AIBulkDocumentProcessings,
                      row?.original?.Sources,
                      row?.original?.reviewerParentCompanyId,
                      row?.original?.parentcompanyId,
                      row?.original?.companyId,
                      row?.original?.formType,
                      row?.original,
                    );
                  }}
                >
                  <StartAssessmentIcon color="#003B52" />
                </ActionIcon>
              </Tooltip>
            )
        ) : row?.original?.Status === FormInvitationUIStatus.Failed &&
          (userSession?.user?.role == AppRoles.Inviter ||
            userSession?.user?.role == AppRoles.Consultant) ? (
          <Tooltip position="bottom-end" offset={0} label="Initiate again">
            <ActionIcon
              variant="transparent"
              disabled={isDisable}
              onClick={async (e: any) => {
                e.stopPropagation();
                await retryCuration();
              }}
            >
              <InitiateAgainIcon />
            </ActionIcon>
          </Tooltip>
        ) : row?.original?.Status === FormInvitationUIStatus.Processing ? (
          <Tooltip position="bottom-end" offset={0} label={isAIUser ? "Processing with AI" : "Processing Activity Data"}>
            <ActionIcon
              style={{
                color: "#454545",
                "&:hover": {
                  color: "#FF9E1B",
                },
              }}
              variant="transparent"
              onClick={(e: any) => {
                e.stopPropagation();
                AIProcessingHandler(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row?.original?.ParentUserName ??
                  row?.original?.InviteeCompanyName,
                );
              }}
            >
              <DocumentProcessingIcon />
            </ActionIcon>
          </Tooltip>
        ) : row?.original?.Status === FormInvitationUIStatus.ReadyForAssessment ? (
          <Tooltip position="bottom-end" offset={0} label="View">
            <ActionIcon
              variant="transparent"
              onClick={(e: any) => {
                e.stopPropagation();
                onClickView(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row.original["Requested From"] !== null &&
                    row.original["Requested From"] !== undefined &&
                    row.original["Requested From"] !== "NA"
                    ? row.original["Requested From"]
                    : row.original["Requested To"],
                  row?.original?.QuestionnareId,
                  row?.original?.Status,
                  row?.original?.isCarryForward,
                  row?.original?.isRecommendationIcon,
                  row?.original.Period,
                  row?.original["Requested From"],
                  row?.original?.Submission_Status,
                  row?.original?.lastAttemptedQuestionId,
                  row.original.deviationCount,
                  row.original.isCarryForward,
                  row.original.SubmissionId,
                  row.original.Score,
                );
              }}
            >
              <IconEye color="#003B52" />
            </ActionIcon>
          </Tooltip>
        ) : row?.original?.Status === FormInvitationUIStatus.ReadyForReporting ? (
          <Tooltip disabled position="bottom-end" offset={0} label="Start">
            <ActionIcon
              variant="transparent"
              disabled={isDisable}
              onClick={(e: any) => {
                e.stopPropagation();
                respondClickHandler(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row?.original?.InviteeCompanyName,
                  row?.original?.OriginalStatus,
                  row?.original?.AIBulkDocumentProcessings,
                  row?.original?.Sources,
                  row?.original?.reviewerParentCompanyId,
                  row?.original?.parentcompanyId,
                  row?.original?.companyId,
                  row?.original?.formType,
                  row?.original,
                );
              }}
            >
              <StartAssessmentIcon color="#003B52" />
            </ActionIcon>
          </Tooltip>
        ) : userSession?.user?.role === AppRoles.Responder &&
          row?.original?.OriginalStatus === FormInvitationUIStatus.Started ? (
          <Tooltip disabled position="bottom-end" offset={0} label="Start">
            <ActionIcon
              variant="transparent"
              disabled={isDisable}
              onClick={(e: any) => {
                e.stopPropagation();
                respondClickHandler(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row?.original?.InviteeCompanyName,
                  row?.original?.OriginalStatus,
                  row?.original?.AIBulkDocumentProcessings,
                  row?.original?.Sources,
                  row?.original?.reviewerParentCompanyId,
                  row?.original?.parentcompanyId,
                  row?.original?.companyId,
                  row?.original?.formType,
                  row?.original,
                );
              }}
            >
              <StartAssessmentIcon color="#003B52" />
            </ActionIcon>
          </Tooltip>
        ) : (
          <Tooltip position="bottom-end" offset={0} label="View">
            <ActionIcon
              disabled={isDisable}
              style={{
                color: "#454545",
                "&:hover": {
                  color: "#FF9E1B",
                },
              }}
              variant="transparent"
              onClick={(e: any) => {
                e.stopPropagation();
                onClickView(
                  row?.original?.Id,
                  row?.original?.Questionnaire,
                  row.original["Requested From"] !== null &&
                    row.original["Requested From"] !== undefined &&
                    row.original["Requested From"] !== "NA"
                    ? row.original["Requested From"]
                    : row.original["Requested To"],
                  row?.original?.QuestionnareId,
                  row?.original?.Status,
                  row?.original?.isCarryForward,
                  row?.original?.isRecommendationIcon,
                  row?.original.Period,
                  row?.original["Requested From"],
                  row?.original.Submission_Status,
                  row.original?.lastAttemptedQuestionId,
                  row.original.deviationCount,
                  row.original.isCarryForward,
                  row.original.SubmissionId,
                  row.original.Score,
                );
              }}
            >
              <IconEye color="#003B52" />
            </ActionIcon>
          </Tooltip>
        )}
      {showmenu === true && !isDisable ? (
        <>
          <Box onClick={(e: any) => e.stopPropagation()}>
            <Menu
              disabled={isDisable}
              width="190px"
              position="bottom-end"
              offset={0}
              arrowOffset={5}
              shadow="md"
              styles={{
                // dropdown: { border: "1px solid #FF9E1B" },
                arrow: {
                  borderLeft: "solid 8px transparent !important",
                  borderRight: "solid 8px transparent !important",
                  borderBottom: "solid 8px #003B52 !important",
                  height: "0 !important",
                  width: "0 !important",
                  transform: "rotate(0deg) !important",
                  top: "-9px !important",
                  background: "transparent",
                  color: "#666",
                },
                item: {
                  color: "#444444",
                  "&:hover": {
                    color: "#fff",
                    background:
                      "linear-gradient(94.76deg, #005C81 0.57%, #122F47 95%) !important",
                  },
                },
              }}
            >
              {
                <Menu.Target>
                  <ActionIcon
                    style={{
                      color: "#454545",
                      "&:hover": {
                        color: "#003B52",
                      },
                    }}
                    variant="transparent"
                  >
                    <IconDotsVertical className="three-dots" />
                  </ActionIcon>
                </Menu.Target>
              }
              <Menu.Dropdown>
                {row?.original?.Status === FormInvitationUIStatus.Requested ||
                  row?.original?.Status === FormInvitationUIStatus.Started ||
                  row?.original?.Status === FormInvitationUIStatus.Resubmitted ||
                  row?.original?.Status === FormInvitationUIStatus.PendingReview ||
                  row?.original?.Status === FormInvitationUIStatus.UnderReview ||
                  row?.original?.Status === FormInvitationUIStatus.Declined ? (
                  ""
                ) : (
                  <>
                    {userSession?.user?.role == AppRoles?.Responder ? (
                      ""
                    ) : (
                      <Menu.Item
                        style={{ fontSize: 12 }}
                        className="invation-btn"
                        leftSection={<DownloadPDFIcon color="#666" />}
                        // loading={
                        //   originalId === row?.original?.Id && loading
                        // }
                        disabled={
                          (originalId === row?.original?.Id &&
                            row?.original?.Questionnaire ===
                            "BRSR Questionnaire") ||
                            row?.original?.Questionnaire === "BRSR Core"
                            ? loader
                            : loading
                        }
                        onClick={(e: any) => {
                          e.stopPropagation();
                          row?.original?.Questionnaire ===
                            "BRSR Questionnaire" ||
                            row?.original?.Questionnaire === "BRSR Core"
                            ? downloadPdf_brsr(
                              row?.original?.Id,
                              row?.original?.Questionnaire,
                            )
                            : downloadPdf(
                              row?.original?.Id,
                              row?.original?.SubmissionId,
                              row?.original?.Questionnaire,
                              row?.original?.QuestionnareId,
                              globalMasterData,
                            );
                        }}
                      >
                        {row?.original?.Questionnaire ===
                          "BRSR Questionnaire" ||
                          row?.original?.Questionnaire === "BRSR Core"
                          ? "BRSR Report (PDF)"
                          : "Download PDF"}
                      </Menu.Item>
                    )}

                    {(userSession?.user?.role == AppRoles?.Inviter ||
                      userSession?.user?.role == AppRoles?.Consultant) &&
                      (row?.original?.Questionnaire === "BRSR Questionnaire" ||
                        row?.original?.Questionnaire === "BRSR Core") && (
                        <Menu.Item
                          style={{ fontSize: 12, whiteSpace: "nowrap" }}
                          className="invation-btn"
                          leftSection={<DownloadDocIcon color="#666" />}
                          disabled={
                            originalId === row?.original?.Id &&
                              row?.original?.Questionnaire ===
                              "BRSR Questionnaire"
                              ? loader
                              : loading
                          }
                          onClick={(e: any) => {
                            e.stopPropagation();
                            downloadBrsrDoc(
                              row?.original?.Id,
                              row?.original?.Questionnaire,
                            );
                          }}
                        >
                          BRSR Report (Doc)
                        </Menu.Item>
                      )}

                    {userSession?.user?.role != AppRoles?.Responder &&
                      row?.original?.Questionnaire === "BRSR Questionnaire" && (
                        <Menu.Item
                          style={{ fontSize: 12, whiteSpace: "nowrap" }}
                          className="invation-btn"
                          leftSection={<DownloadPDFIcon color="#666" />}
                          disabled={
                            originalId === row?.original?.Id &&
                              row?.original?.Questionnaire ===
                              "BRSR Questionnaire"
                              ? loader
                              : loading
                          }
                          onClick={(e: any) => {
                            e.stopPropagation();
                            downloadPdf_brsr(
                              row?.original?.Id,
                              "BRSR Comprehensive Core",
                            );
                          }}
                        >
                          Core Checklist (PDF)
                        </Menu.Item>
                      )}

                    {(userSession?.user?.role == AppRoles?.Inviter ||
                      userSession?.user?.role == AppRoles?.Consultant) &&
                      row?.original?.Questionnaire === "BRSR Questionnaire" && (
                        <Menu.Item
                          style={{ fontSize: 12, whiteSpace: "nowrap" }}
                          className="invation-btn"
                          leftSection={<DownloadDocIcon color="#666" />}
                          disabled={
                            originalId === row?.original?.Id &&
                              row?.original?.Questionnaire ===
                              "BRSR Questionnaire"
                              ? loader
                              : loading
                          }
                          onClick={(e: any) => {
                            e.stopPropagation();
                            downloadBrsrDoc(
                              row?.original?.Id,
                              "BRSR Comprehensive Core",
                            );
                          }}
                        >
                          Core Checklist (Doc)
                        </Menu.Item>
                      )}

                    {userSession?.user?.role == AppRoles?.Responder
                      ? ""
                      : showDashboardIcon(row)}
                    {userSession?.user?.role == AppRoles?.Responder ? (
                      ""
                    ) : (
                      <Menu.Item
                        style={{ fontSize: 12 }}
                        className="invation-btn"
                        leftSection={
                          <DownloadExcelIcon
                            style={{ width: "25px", height: "24px" }}
                          />
                        }
                        // loading={
                        //   originalId === row?.original?.Id && load
                        // }
                        disabled={originalId === row?.original?.Id && load}
                        onClick={(e: any) => {
                          e.stopPropagation();
                          downloadExcel(
                            row?.original?.Id,
                            row?.original?.SubmissionId,
                            row?.original?.Questionnaire,
                          );
                        }}
                      >
                        Export to Excel
                      </Menu.Item>
                    )}
                  </>
                )}
                {/* changes */}
                {/* Questionnaire Report: For Internal Assessment */}
                {!!row?.original?.isQuestionReassigned &&
                  !row?.original?.isReviewer &&
                  (userSession?.user?.role === AppRoles.Invitee ||
                    userSession?.user?.role === AppRoles.Inviter ||
                    userSession?.user?.role === AppRoles.Responder ||
                    userSession?.user?.role === AppRoles.Consultant) &&
                  row?.original?.pcCompany === row?.original?.vcCompany && (
                    // row?.original?.ParentUserid === userSession?.user?.id &&
                    <Menu.Item
                      className="invation-btn"
                      leftSection={
                        <QuestionairReportIcon
                          style={{ width: "25px", height: "22px" }}
                        />
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        postParentMessage(
                          warpQuestionnaireReport(true, row?.original?.Id),
                        );
                      }}
                    >
                      Assigned Questions
                    </Menu.Item>
                  )}

                {/* Questionnaire Report: For External Assessment */}
                {!!row?.original?.isQuestionReassigned &&
                  !row?.original?.isReviewer &&
                  (userSession?.user?.role === AppRoles.Invitee ||
                    userSession?.user?.role === AppRoles.Responder) &&
                  row?.original?.pcCompany !== row?.original?.vcCompany && (
                    <Menu.Item
                      className="invation-btn"
                      leftSection={
                        <QuestionairReportIcon
                          style={{ width: "25px", height: "22px" }}
                        />
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        postParentMessage(
                          warpQuestionnaireReport(true, row?.original?.Id),
                        );
                      }}
                    >
                      Assigned Questions
                    </Menu.Item>
                  )}
                {!!row?.original?.isRecommendationIcon &&
                  !row?.original?.isReviewer &&
                  (row?.original?.Status === FormInvitationUIStatus.Responded ||
                    row?.original?.Status ===
                    FormInvitationUIStatus.Approved) && (
                    <Menu.Item
                      style={{ fontSize: 12 }}
                      className="invation-btn"
                      leftSection={
                        <AddRecommendationIcon
                          style={{ width: "25px", height: "22px" }}
                        />
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onClickRecommendation(
                          row?.original?.Id,
                          row?.original?.Questionnaire,
                          row?.original?.Period,
                          row.original["Requested From"] !== null &&
                            row.original["Requested From"] !== undefined &&
                            row.original["Requested From"] !== "NA"
                            ? row.original["Requested From"]
                            : row.original["Requested To"],
                          row.original.deviationCount,
                          row.original.isCarryForward,
                          row.original.SubmissionId,
                          row.original.Score,
                        );
                      }}
                    // className="assessment_listing_recommendation_icon"
                    >
                      Recommendations
                    </Menu.Item>
                  )}

                {!!row?.original?.isRecommendationIcon &&
                  !row?.original?.isReviewer &&
                  row?.original?.Score !== "NA" &&
                  (row?.original?.Status === FormInvitationUIStatus.Responded ||
                    row?.original?.Status ===
                    FormInvitationUIStatus.Approved) &&
                  (userSession?.user?.role == AppRoles.Inviter ||
                    userSession?.user?.role == AppRoles.Invitee) && (
                    <Menu.Item
                      style={{ fontSize: 12 }}
                      className="invation-btn"
                      leftSection={
                        <ProgressReportIcon
                          style={{ width: "25px", height: "22px" }}
                        />
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onProgressReport(
                          row?.original?.Id,
                          row?.original?.Questionnaire,
                          row?.original?.Period,
                          userSession?.user?.role === AppRoles.Inviter ||
                            userSession?.user?.role === AppRoles.Consultant
                            ? row.original.pcCompany
                            : row.original.vcCompany,
                          row.original.SubmissionId,
                          row.original.deviationCount,
                          row.original.isCarryForward,
                        );
                      }}
                    >
                      Progress Report
                    </Menu.Item>
                  )}
                {row?.original?.isDeviation &&
                  row?.original?.isCarryForward === true &&
                  (row?.original?.Status === FormInvitationUIStatus.Responded ||
                    row?.original?.Status ===
                    FormInvitationUIStatus.Approved) && (
                    <Menu.Item
                      style={{ fontSize: 12 }}
                      className="invation-btn"
                      leftSection={
                        <DeviationReportIcon
                          style={{ width: "25px", height: "22px" }}
                        />
                      }
                      onClick={(e: any) => {
                        e.stopPropagation();
                        onDeviationReport(
                          row?.original?.Id,
                          row?.original?.deviationCount,
                          row?.original?.Questionnaire,
                          row?.original?.Period,
                          userSession?.user?.role === AppRoles.Inviter ||
                            userSession?.user?.role === AppRoles.Consultant
                            ? row.original.pcCompany
                            : row.original.vcCompany,
                        );
                      }}
                    >
                      Deviation Report
                    </Menu.Item>
                  )}
              </Menu.Dropdown>
            </Menu>
          </Box>
        </>
      ) : (
        <Box></Box>
      )}

      <Stack>
        <Modal
          opened={opened}
          onClose={() => {
            setOpened(false);
            setindustrychanged(false);
          }}
          title="Select Industry"
          radius={20}
          styles={{
            content: {
              width: 700,
              padding: "20px 30px !important",
              height: "220px",
            },
            title: {
              fontSize: 24,
              fontWeight: 400,
              color: "#122F47",
            },
          }}
        >
          {/* Modal content */}

          <Box>
            <LoadingOverlay visible={false} />
            <Stack mt={10} gap="md">
              <Controller
                render={({ field: { name, onBlur, onChange, ref, value } }) => (
                  <Select
                    placeholder="Search or select industry"
                    searchable
                    nothingFoundMessage="No options"
                    data={industryList}
                    ref={ref}
                    onBlur={onBlur}
                    onChange={(val) => {
                      onChange(val);
                      selectIndustry(val);
                    }}
                    className="SearchCountrySelectMenu"
                    styles={{
                      dropdown: { height: "90px", overflowY: "auto" },
                    }}
                  //value={value}
                  />
                )}
                name="selectedCompanyIds"
                control={control}
              />
              <Group justify="flex-end" gap="sm">
                <Button
                  color="outlineBtn"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setOpened(false);
                    setindustrychanged(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!industrychanged}
                  color="solidBtn"
                  loading={false}
                  onClick={async (e: any) => {
                    e.stopPropagation();
                    setshowMessageOpened(true);
                    setOpened(false);
                    // await UpdateIndustrymessage();
                  }}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>
        <Modal
          opened={showMessageOpened}
          onClose={() => {
            setshowMessageOpened(false);
            setindustrychanged(false);
          }}
          title="Select industry"
          styles={{
            content: {
              width: 700,
              padding: "20px 30px !important",
              height: "220px",
            },
            title: {
              fontSize: 24,
              fontWeight: 400,
              color: "#122F47",
            },
          }}
        >
          <Box>
            <LoadingOverlay visible={false} />
            <Stack mt={10} gap="md">
              <h4>
                Are you sure you want to set this as your industry? Once
                industry is saved, it cannot be changed.
              </h4>
              <Group justify="flex-end" gap="sm">
                <Button
                  color="outlineBtn"
                  onClick={(e: any) => {
                    e.stopPropagation();
                    setOpened(false);
                    setshowMessageOpened(false);
                    setindustrychanged(false);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={!industrychanged}
                  color="solidBtn"
                  loading={false}
                  onClick={async (e: any) => {
                    e.stopPropagation();
                    setshowMessageOpened(false);
                    await UpdateIndustry(
                      "Yes",
                      row?.original?.Status,
                      row?.original?.AIBulkDocumentProcessings,
                      row?.original?.Sources,
                    );
                    // await UpdateIndustrymessage();
                  }}
                >
                  Submit
                </Button>
              </Group>
            </Stack>
          </Box>
        </Modal>
      </Stack>
    </>
  );
};
export default InvitationButtons;