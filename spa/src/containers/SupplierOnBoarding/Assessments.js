import React, { Component } from "react";
import {
  getNextJSServiceUrl,
  getServiceUrl,
  getUserPermision,
  GetWARPUrl,
} from "../../config";
import axios from "axios";
import { Redirect, withRouter } from "react-router-dom";
import * as PageKeys from "../../pagekeys";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import { withStyles } from "@material-ui/core/styles";
import { WarpNavigator } from "../../warp/warp.service";
import ThirdPartyCookieEnabled from "./ThirdPartyCookieEnabled_new";
import { popupAlert } from "../../UI/Popups/popup";
import CloseIcon from "@material-ui/icons/Close";
import { Dialog, DialogContent, DialogTitle } from "@material-ui/core";
import jwt from "jsonwebtoken";
import { connect } from "react-redux";
import { isOpen } from "../../store/actions/initiateAssessment";
import { viewRecommendationsOpen } from "../../store/actions/viewRecommedations";
import {
  QueryButtonShow,
  updateCount,
} from "../../store/actions/questionWithQueries";
import {
  FormInvitationUIStatus,
  AIActions,
  bulkFileCurationStatus,
  SourceFilesStatus,
  AppRoles,
  FormTypes,
  FormTypesPage,
} from "../../warp/warp.constant";
import Spinner from "../../UI/Spinner/Spinner";
import Button from "../../components/Material/CustomButtons/Button";
import InfoIcon from "../../components/Icons/InfoIcon";
import { setLastNavigation } from "../../utility";
import AIDocumentUploadBtn from "../../UI/Button/AIDocumentUploadBtn";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
const WARP_Link = GetWARPUrl();
let messageData = "";
var divOffsetTop = 0,
  divOffsetLeft = 0,
  divOffsetBottom = 0;

const drawerWidth = 393;

let isAssessmentPage = window.location.pathname.includes("/assessments")
  ? FormTypesPage.Assessments
  : FormTypesPage.Reports;

const styles = (theme) => ({
  root: {
    display: "flex",
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    top: "0px",
    zIndex: "1001",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: "0",
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: -375,
    marginRight: 0,
  },
});
class Assessments extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
      loading: false,
      message: "",
      // open: false,
      FormSrc: "",
      assessmentFormName: "Assessments",
      iframeHeight: 720,
      thirdPartyCookieEnabled: null,
      IsKhaitanInvitee: false,
      progressReport: { isOpened: false },
      commonDialog: { isOpened: false },
      startReportDialog: { isOpened: false, formType: "" },
      dashboardUrl: [],
      deviationReport: {},
      sidebarLoader: false,
      userRole: "",
      dashboardiFrameHeight: "",
      isBorder: false,
      isPowerBiReport: false,
      source: "",
      assignReviewerDetails: {formId: "", questionId: "", invitationId: "" ,SubmissionId: "",formType: "",page: "listingpage",
        AssessmentFormName: "",
        ComapnyName:"",
        AIStatus:"",
        invitationStatus: "",
        AIBulkDocumentProcessings:"",
        Sources:""
      },
    };
  }

  /// <summary>
  /// Author  :   ShriGanesh Singh
  /// Date    :   18th Feb 2021
  /// </summary>
  async GetAuthToken() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        emailId: localStorage.emailId,
      },
    };
    await axios
      .get(getServiceUrl() + "warp/GetAuthToken", config)
      .then((json) => {
        // console.log({ json });
        localStorage.setItem("warpToken", json.data);
        this.setState({ authGenerated: true });
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }

  async getDashboardUrl() {
    // let companyGuid = localStorage.companyGuid;
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: "C9AB9378-2648-454F-BCB5-8C5B18BD1394",
        DashboardType: "progressreport",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        if (json.status === 200) {
          let url = "";
          url = json.data.filter(
            (x) => x.dashboardType === "progressreport"
            // && x.companyType === "VC Company"
          );
          this.setState({
            dashboardUrl: url,
            isBorder: json.data[0].isBorder,
            isPowerBiReport: json.data[0].isPowerBiReport,
            dashboardiFrameHeight: json.data[0].dashboardHeight,
          });
        }
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }

  newHandle = async (type, event) => {
    if (type === "message") {
      // console.log("Message received from the child: " + event.data); // Message received from child
      let dataType = typeof event.data;
      const URL = window.location.href;
      if (!URL.includes("/assessments") && !URL.includes("/reports")) return;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          switch (type) {
            case "warp-content-resize":
              if (
                this.state.iframeHeight !== messageData.data.height &&
                !document.querySelector('[role="dialog"]') &&
                !document.querySelector('[role="presentation"]')
              ) {
                const newHeight = Math.min(
                  Math.max(messageData.data.height + 50, 500), // Minimum 500px
                  window.innerHeight * 0.9 // Maximum 90% of viewport height
                );
                this.setState({ iframeHeight: newHeight });
              }
              break;
            case "warp-check-localStorage-access":
              this.setState(
                { thirdPartyCookieEnabled: messageData.data.success },
                () => {
                  if (document.getElementById("listIframe")) {
                    document.getElementById("listIframe").onload = () => {
                      this.setState({ loading: false });
                    };
                  } else {
                    this.setState({ loading: false });
                  }
                }
              );
              break;
            case "warp-new-invitation-cancel":
              if (this.props.open === true) {
                this.props.isOpen(false);
              } else {
                this.props.isOpen(true);
              }
              break;
            case "warp-invitation-list-respond":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 900);
              this.setState({
                assessmentFormName:
                  messageData.data.assessmentFormName +
                  " - " +
                  messageData.data.comapnyName,
              });
              localStorage.setItem("isRecommendationIcon", false);
              localStorage.setItem("assessmentFormName2", "");
              localStorage.setItem("period", "");
              localStorage.setItem("comapnyName2", "");
              localStorage.setItem("deviationCount", 0);
              localStorage.setItem("isCarryForward", "");
              localStorage.setItem("submissionId", "");
              localStorage.setItem("score", "");
              let isIntro = false,
                isDocument = false,
                isUploadDoc = false,
                isDefaultPage = false;
              if (this.state.userRole === AppRoles.Inviter) {
                isIntro = true;
              } else {
                if (
                  (messageData.data.AIStatus.docWithAI ||
                    messageData.data.AIStatus.onlyDoc) &&
                  messageData.data.invitationStatus ==
                    FormInvitationUIStatus.Requested
                ) {
                  if (messageData.data.Sources.length == 0) {
                    if (messageData.data.AIStatus.docWithAI) {
                      isDefaultPage = true;
                    } else {
                      isUploadDoc = true;
                    }
                  } else {
                    if (
                      messageData.data.AIBulkDocumentProcessings.length == 0
                    ) {
                      isUploadDoc = true;
                    } else {
                      if (
                        messageData.data.AIBulkDocumentProcessings.filter(
                          (items) =>
                            items.requestStatus ==
                            bulkFileCurationStatus.Processing
                        ).length > 0
                      ) {
                        isDocument = true;
                      } else {
                        if (
                          messageData.data.Sources.filter(
                            (items) =>
                              items.SourceFile.status !=
                              SourceFilesStatus.Success
                          ).length > 0
                        ) {
                          isUploadDoc = true;
                        } else {
                          isIntro = true;
                        }
                      }
                    }
                  }
                } else {
                  isIntro = true;
                }
              }
              if (isIntro) {
                WarpNavigator.navigateToAssessment(
                  this.props.history,
                  "intro",
                  messageData.data.invitationId,
                  messageData.data.assessmentFormName,
                  messageData.data.comapnyName
                );
              } else {
                WarpNavigator.navigateToFileUpload(
                  this.props.history,
                  messageData.data.invitationId,
                  isDocument
                    ? AIActions.documentProcessing
                    : isUploadDoc
                    ? AIActions.uploadDocuments
                    : "",
                  messageData.data.assessmentFormName,
                  messageData.data.comapnyName,
                  messageData.data.AIStatus
                );
              }
              break;
            case "warp-new-invitation-started":
              this.setState({ loading: true });
              break;
            case "warp-new-invitation-finished":
              if (messageData.data.isSuccess === true) {
                document.getElementById("sendInviteIframe").src = document.getElementById("sendInviteIframe").src;
                this.setState({ loading: false });
                this.props.isOpen(false);
                let isAIpopup = false;
                let isDocWithAIpopup = false;
                if (
                  messageData.data.formDetails.filter(
                    (items) => items.isAIForm === true
                  ).length > 0
                ) {
                  isAIpopup = true;
                  if (
                    messageData.data.formDetails.filter(
                      (items) =>
                        items.isAIForm === true && items.AIData.length > 0
                    )
                  ) {
                    if (
                      messageData.data.formDetails.filter(
                        (items) =>
                          items.isAIForm === true &&
                          items.AIData[0].docWithAI === true
                      ).length > 0
                    ) {
                      isDocWithAIpopup = true;
                    }
                  }
                }
                if (isAIpopup) {
                  popupAlert(
                    "docwithaisuccess",
                    "Assessment Requested",
                    isDocWithAIpopup
                      ? "Our AI has started gathering data. An email invite will be sent shortly."
                      : "An email invite has been sent. Our AI will start gathering data once the suggested documents are uploaded."
                  );
                } else {
                  popupAlert(
                    "success",
                    "Success",
                    messageData.data.formtype === FormTypesPage.Reports
                      ? "The Reporting request was sent successfully"
                      : "The Assessment request was sent successfully"
                  );
                }
              } else {
                this.setState({ loading: false });
                popupAlert("error", "Error", "Failed.");
              }
              break;
            case "warp-invitation-list-view":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 900);
              const invitationId_view = messageData.data.invitationId;
              const assessmentFormName_view =
                messageData.data.assessmentFormName;
              const comapnyName_view = messageData.data.comapnyName;
              const isRecommendationIcon =
                messageData.data.isRecommendationIcon;
              const period = messageData.data.period;
              const requestedFrom = messageData.data.requestedFrom;
              const questionid = messageData.data.questionid;
              const deviationCount2 = messageData.data.DeviationCount;
              const isCarryForward2 = messageData.data.IsCarryForward;
              const submissionId2 = messageData.data.SubmissionId;
              const score2 = messageData.data.Score;

              if (
                isRecommendationIcon !== undefined &&
                isRecommendationIcon !== null
              ) {
                this.props.viewRecommendationsOpen(
                  isRecommendationIcon === "" ? false : isRecommendationIcon
                );
              } else {
                //localStorage.setItem("isRecommendationIcon", false);
                this.props.viewRecommendationsOpen(false);
              }

              if (
                assessmentFormName_view !== undefined &&
                assessmentFormName_view !== null &&
                assessmentFormName_view !== ""
              ) {
                localStorage.setItem(
                  "assessmentFormName2",
                  assessmentFormName_view
                );
              }

              if (period !== undefined && period !== null && period !== "") {
                localStorage.setItem("period", period);
              }

              if (
                comapnyName_view !== undefined &&
                comapnyName_view !== null &&
                comapnyName_view !== ""
              ) {
                localStorage.setItem("comapnyName2", comapnyName_view);
              }

              if (
                deviationCount2 !== undefined &&
                deviationCount2 !== "" &&
                deviationCount2 !== "null"
              ) {
                localStorage.setItem("deviationCount", deviationCount2);
              } else {
                localStorage.setItem("deviationCount", 0);
              }

              if (
                isCarryForward2 !== undefined &&
                isCarryForward2 !== null &&
                isCarryForward2 !== ""
              ) {
                localStorage.setItem("isCarryForward", isCarryForward2);
              }

              if (
                submissionId2 !== undefined &&
                submissionId2 !== null &&
                submissionId2 !== ""
              ) {
                localStorage.setItem("submissionId", submissionId2);
              }

              if (score2 !== undefined && score2 !== null && score2 !== "") {
                localStorage.setItem("score", score2);
              }

              if (questionid !== "" && questionid !== undefined) {
                this.props.history.replace(
                  `/assessmentDetails/scoring_test/${invitationId_view}/view?questionid=${questionid}&assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`
                );
              } else {
                this.props.history.replace(
                  `/assessmentDetails/scoring_test/${invitationId_view}/view?assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`
                );
              }
              break;
            case "warp-QuestionnaireReport":
              this.setState({
                commonDialog: {
                  isOpened: messageData.data.isOpenedPopup,
                  popupTitle: messageData.data.title,
                  invitationId: messageData.data.invitationId,
                },
              });
              break;
            case "warp-Recommendation-Listing":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 900);
              const invitationId_rcmd = messageData.data.invitationId;
              const questionnare_rcmd = messageData.data.questionnare;
              const period_rcmd = messageData.data.period;
              const comapnyName_rcmd = messageData.data.comapnyName;
              const deviationCount = messageData.data.deviationCount;
              const isCarryForward = messageData.data.isCarryForward;
              const submissionId = messageData.data.submissionId;
              const score = messageData.data.score;
              const firstName = localStorage.firstName;
              //localStorage.setItem("isRecommendationIcon", true);
              this.props.viewRecommendationsOpen(true);

              if (
                questionnare_rcmd !== undefined &&
                questionnare_rcmd !== null &&
                questionnare_rcmd !== ""
              ) {
                localStorage.setItem("assessmentFormName2", questionnare_rcmd);
              }

              if (
                period_rcmd !== undefined &&
                period_rcmd !== null &&
                period_rcmd !== ""
              ) {
                localStorage.setItem("period", period_rcmd);
              }

              if (
                comapnyName_rcmd !== undefined &&
                comapnyName_rcmd !== null &&
                comapnyName_rcmd !== ""
              ) {
                localStorage.setItem("comapnyName2", comapnyName_rcmd);
              }

              if (
                deviationCount !== undefined &&
                deviationCount !== "" &&
                deviationCount !== "null"
              ) {
                localStorage.setItem("deviationCount", deviationCount);
              } else {
                localStorage.setItem("deviationCount", 0);
              }

              if (
                isCarryForward !== undefined &&
                isCarryForward !== null &&
                isCarryForward !== ""
              ) {
                localStorage.setItem("isCarryForward", isCarryForward);
              }

              if (
                submissionId !== undefined &&
                submissionId !== null &&
                submissionId !== ""
              ) {
                localStorage.setItem("submissionId", submissionId);
              }

              if (score !== undefined && score !== null && score !== "") {
                localStorage.setItem("score", score);
              }

              let url = "";
              url = `/assessmentrecommendation/${invitationId_rcmd}/${questionnare_rcmd}/${period_rcmd}/${comapnyName_rcmd}/${deviationCount}/${isCarryForward}/${submissionId}/${score}/${firstName}`;
              //url = `/assessmentrecommendation/${invitationId_rcmd}/${questionnare_rcmd}/${period_rcmd}/${comapnyName_rcmd}`;
              //window.location.href = url;
              this.props.history.replace(url);
              break;
            // case "warp-recommendation-invitation-list-view":
            //   this.setState({ loading: true });
            //   setTimeout(() => {
            //     this.setState({ loading: false });
            //   }, 900);
            //   const invitationIdRecomm_view = messageData.data.invitationId;
            //   const assessmentFormNameRecomm_view =
            //     messageData.data.assessmentFormName;
            //   const comapnyNameRecomm_view = messageData.data.comapnyName;
            //   const isRecommendationIcon_view =
            //     messageData.data.isRecommendationIcon;
            //   const period_view = messageData.data.period;
            //   const requestedFrom_view = messageData.data.requestedFrom;
            //   const questionId = messageData.data.QuestionId;
            //   const deviationCount1 = messageData.data.deviationCount;
            //   const isCarryForward1 = messageData.data.isCarryForward;
            //   const submissionId1 = messageData.data.submissionId;
            //   const score1 = messageData.data.score;
            //   // WarpNavigator.navigateToAssessment(
            //   //   this.props.history,
            //   //   "viewrecommendation",
            //   //   invitationIdRecomm_view,
            //   //   assessmentFormNameRecomm_view,
            //   //   comapnyNameRecomm_view,
            //   //   isRecommendationIcon_view,
            //   //   period_view,
            //   //   requestedFrom_view,
            //   //   questionId,
            //   //   deviationCount1,
            //   //   isCarryForward1,
            //   //   submissionId1,
            //   //   score1
            //   // );

            //   if (isRecommendationIcon_view !== undefined && isRecommendationIcon_view !== null) {
            //     isRecommendationIcon_view === ""
            //       ? localStorage.setItem("isRecommendationIcon", false)
            //       : localStorage.setItem(
            //         "isRecommendationIcon",
            //         isRecommendationIcon_view
            //       );
            //   } else {
            //     localStorage.setItem("isRecommendationIcon", false);
            //   }

            //   if (
            //     assessmentFormNameRecomm_view !== undefined && assessmentFormNameRecomm_view !== null &&
            //     assessmentFormNameRecomm_view !== ""
            //   ) {
            //     localStorage.setItem(
            //       "assessmentFormName2",
            //       assessmentFormNameRecomm_view
            //     );
            //   }

            //   if (
            //     period_view !== undefined && period_view !== null &&
            //     period_view !== ""
            //   ) {
            //     localStorage.setItem("period", period_view);
            //   }

            //   if (
            //     comapnyName !== undefined && comapnyName !== null &&
            //     comapnyName !== ""
            //   ) {
            //     localStorage.setItem(
            //       "comapnyName2",
            //       comapnyName
            //     );
            //   }

            //   if (
            //     deviationCount1 !== undefined &&
            //     deviationCount1 !== "" &&
            //     deviationCount1 !== "null"
            //   ) {
            //     localStorage.setItem(
            //       "deviationCount",
            //       deviationCount1
            //     );
            //   } else {
            //     localStorage.setItem(
            //       "deviationCount",
            //       0
            //     );
            //   }

            //   if (
            //     isCarryForward1 !== undefined &&
            //     isCarryForward1 !== null &&
            //     isCarryForward1 !== ""
            //   ) {
            //     localStorage.setItem(
            //       "isCarryForward",
            //       isCarryForward1
            //     );
            //   }

            //   if (
            //     submissionId1 !== undefined &&
            //     submissionId1 !== null &&
            //     submissionId1 !== ""
            //   ) {
            //     localStorage.setItem(
            //       "submissionId",
            //       submissionId1
            //     );
            //   }

            //   if (
            //     score1 !== undefined &&
            //     score1 !== null &&
            //     score1 !== ""
            //   ) {
            //     localStorage.setItem("score", score1);
            //   }
            //   // if (questionId !== '' && questionId !== undefined) {
            //   //   //window.location.href = `/assessmentDetails/scoring_test/${invitationId_view}/view?questionid=${questionid}&assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`;
            //   //   window.location.assign(`/assessmentDetails/scoring_test/${invitationId_view}/view?questionid=${questionid}&assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`);
            //   // }
            //   // else {
            //   //   //window.location.href = `/assessmentDetails/scoring_test/${invitationId_view}/view?assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`;
            //   //   window.location.assign(`/assessmentDetails/scoring_test/${invitationId_view}/view?assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`);
            //   // }

            //   // this.props.history.push({ pathname: "/assessmentDetails/scoring_test/" + invitationId_view + "/view", state: { assessmentFormName: assessmentFormName_view + " - " + comapnyName_view } });
            //   break;
            case "warp-QuestionnaireReport":
              this.setState({
                commonDialog: {
                  isOpened: messageData.data.isOpenedPopup,
                  popupTitle: messageData.data.title,
                  invitationId: messageData.data.invitationId,
                },
              });
              break;
            case "Progress-Report-Message":
              this.setState({
                progressReport: {
                  isOpened: true,
                  popupTitle: "Progress Report Till Date",
                  invitationId: messageData.data.invitationId,
                  questionnare: messageData.data.questionnare,
                  period: messageData.data.period,
                  comapnyName: messageData.data.comapnyName,
                  submissionId: messageData.data.submissionId,
                  deviationCount: messageData.data.deviationCount,
                  isCarryForward: messageData.data.isCarryForward,
                },
              });
              this.getDashboardUrl();
              break;
            case "warp-DeviationReport":
              this.setState({
                deviationReport: {
                  isOpened: true,
                  popupTitle: messageData.data.title,
                  invitationId: messageData.data.invitationId,
                  deviationCount: messageData.data.deviationCount,
                  questionnare: messageData.data.questionnare,
                  period: messageData.data.period,
                  comapnyName: messageData.data.comapnyName,
                },
              });
              break;

            case "warp-new-invitation-started-New":
              this.setState({ loading: true });
              this.props.isOpen(true);
              break;
            case "warp-new-invitation-started-Report":
              this.setState({
                startReportDialog: {
                  isOpened: messageData.data.isOpenedPopup,
                  formType: messageData.data.formType,
                },
              });
            case "go-to-document-repository":
              // const currentPath = window.location.pathname;
              // const resolvedSource = messageData.data.formType

              // setLastNavigation(
              //   resolvedSource,
              //   currentPath,
              //   (this.props.location && this.props.location.state) || ""
              // );
              // this.props.history.push("/document-repository");
              WarpNavigator.navigateToDocumentRepository(
                this.props.history,
                messageData.data.formType,
                messageData.data.context
                // messageData.data.invitationId,
                // AIActions.uploadDocuments,
                // messageData.data.assessmentFormName,
                // messageData.data.comapnyName
              );
              break;
            case "go-to-upload-docs":
              WarpNavigator.navigateToFileUpload(
                this.props.history,
                messageData.data.invitationId,
                // AIActions.uploadDocuments,
                messageData.data.assessmentFormName,
                messageData.data.comapnyName
              );
              break;
            case "validate-recaptcha":
              const isCaptchaValid = await captchaValidation(this.context);
              if (isCaptchaValid) {
                let iFrame = document.getElementById(messageData.data.iframeId);
                iFrame.contentWindow.postMessage(
                  JSON.stringify({
                    type: "reCaptchaValidation",
                  }),
                  WARP_Link ? new URL(WARP_Link).origin : "*"
                );
              } else {
                alert("Captcha verification failed. Please try again.");
              }
              break;
            case "warp-AssignReviewer":
              this.setState({
              assignReviewerDetails: {
                formId: messageData.data.formDetails.formId,
                invitationId: messageData.data.formDetails.invitationId,
                questionId: messageData.data.formDetails.questionId,
                SubmissionId: messageData.data.formDetails.SubmissionId,
                formType: messageData.data.formDetails.formType,
                AssessmentFormName: messageData.data.formDetails.AssessmentFormName,
                CompanyName: messageData.data.formDetails.CompanyName,
                AIStatus: JSON.stringify(messageData.data.formDetails.AIStatus),
                invitationStatus: messageData.data.formDetails.invitationStatus,
                AIBulkDocumentProcessings: JSON.stringify(messageData.data.formDetails.AIBulkDocumentProcessings),
                Sources: JSON.stringify(messageData.data.formDetails.Sources),
                page: "listingpage",
              }
            })
              this.setState({
                iframeloader: false,
                iframeloader2: false,
                loading: this.state.commonDialog.isOpened ? false : true,
                commonDialog: {
                  height: 250,
                  isOpened: messageData.data.isOpenedPopup,
                  popupTitle: messageData.data.title,
                  dialogType: "assign-reviewer-assessment",
                  formId: messageData.data.formDetails.formId,
                  invitationId: messageData.data.formDetails.invitationId,
                  questionId: messageData.data.formDetails.questionId,
                  SubmissionId: messageData.data.formDetails.SubmissionId,
                },
              });
              break;
            default:
              break;
          }
        } catch (error) {}
      }
    }
  };

  componentDidUpdate(prevProps) {
    // Check if specific prop changed
    if (prevProps.open !== this.props.open) {
      this.setState({ sidebarLoader: true });
    }

    // keep `source` in sync with current route when pathname changes
    if (
      this.props.location &&
      prevProps.location &&
      this.props.location.pathname !== prevProps.location.pathname
    ) {
      const URL = window.location.href;
      const newSource = URL.includes("/assessments")
        ? FormTypesPage.Assessments
        : URL.includes("/reports")
        ? FormTypesPage.Reports
        : "";
      if (newSource && newSource !== this.state.source) {
        this.setState({ source: newSource });
      }
    }
  }

  componentDidMount() {
    const URL = window.location.href;
    if (URL.includes("/assessments")) {
      this.setState({ source: FormTypesPage.Assessments });
    } else if (URL.includes("/reports")) {
      this.setState({ source: FormTypesPage.Reports });
    }
    if (
      localStorage.warpToken === undefined &&
      localStorage.warpToken === "null"
    ) {
      this.GetAuthToken();
    }

    this.props.updateCount(0);
    this.props.QueryButtonShow(false);
    localStorage.removeItem("stepName");
    let FormSrclink = window.location.href;
    if (
      FormSrclink.includes("view") ||
      FormSrclink.includes("edit") ||
      FormSrclink.includes("intro") ||
      FormSrclink.includes("start")
    ) {
      this.setState({ FormSrc: localStorage.getItem("FormSrc") });
      // console.log("intropage")
    } else {
      localStorage.setItem("FormSrc", null);
      this.setState({ FormSrc: "" });
      // console.log("list Page");
    }
    this.setState({ loading: true });
    this.GetUserRole();
    if (
      localStorage.warpToken !== undefined &&
      localStorage.warpToken !== null &&
      localStorage.warpToken !== ""
    ) {
      const decodedToken = jwt.decode(localStorage.warpToken);
      this.setState({
        userRole: decodedToken["https://hasura.io/jwt/claims"]["x-hasura-role"],
      });
    }
    window.addEventListener("message", async (event) => {
      // console.log("Message received from the child: " + event.data); // Message received from child

      let dataType = typeof event.data;
      const URL = window.location.href;
      if (!URL.includes("/assessments") && !URL.includes("/reports")) return;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          switch (type) {
            case "warp-content-resize":
              if (
                (this.state.iframeHeight !== messageData.data.height &&
                !document.querySelector('[role="dialog"]') &&
                !document.querySelector('[role="presentation"]')) || this.state.iframeHeight !== messageData.data.height
              ) {
                this.setState({ iframeHeight: messageData.data.height + 70 });
              }
              break;
            case "warp-check-localStorage-access":
              this.setState(
                { thirdPartyCookieEnabled: messageData.data.success },
                () => {
                  if (document.getElementById("listIframe")) {
                    document.getElementById("listIframe").onload = () => {
                      this.setState({ loading: false });
                    };
                  } else {
                    this.setState({ loading: false });
                  }
                }
              );
              break;
            case "warp-new-invitation-cancel":
              if (this.props.open === true) {
                this.props.isOpen(false);
              } else {
                this.props.isOpen(true);
              }
              break;
            case "warp-invitation-list-respond":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 900);
              this.setState({
                assessmentFormName:
                  messageData.data.assessmentFormName +
                  " - " +
                  messageData.data.comapnyName,
              });
              localStorage.setItem("isRecommendationIcon", false);
              localStorage.setItem("assessmentFormName2", "");
              localStorage.setItem("period", "");
              localStorage.setItem("comapnyName2", "");
              localStorage.setItem("deviationCount", 0);
              localStorage.setItem("isCarryForward", "");
              localStorage.setItem("submissionId", "");
              localStorage.setItem("score", "");
              let isIntro = false,
                isDocument = false,
                isUploadDoc = false,
                isDefaultPage = false;
              //AITODO: modify logic for user roles
              if (this.state.userRole === AppRoles.Inviter) {
                isIntro = true;
              } else {
                if (messageData.invitationStatus !== "Processing") {
                  isIntro = true;
                }
              }
              if (isIntro) {
                WarpNavigator.navigateToAssessment(
                  this.props.history,
                  "intro",
                  messageData.data.invitationId,
                  messageData.data.assessmentFormName,
                  messageData.data.comapnyName
                );
              } else {
                WarpNavigator.navigateToFileUpload(
                  this.props.history,
                  messageData.data.invitationId,
                  // isDocument
                  //   ? AIActions.documentProcessing
                  //   : isUploadDoc
                  //   ? AIActions.uploadDocuments
                  //   : "",
                  messageData.data.assessmentFormName,
                  messageData.data.comapnyName
                  // messageData.data.AIStatus
                );
              }
              break;
            case "warp-new-invitation-started":
              this.setState({ loading: true });
              break;
            case "warp-new-invitation-finished":
              if (messageData.data.isSuccess === true) {
                document.getElementById("sendInviteIframe").src = document.getElementById("sendInviteIframe").src;
                this.setState({ loading: false });
                this.props.isOpen(false);
                popupAlert(
                  "success",
                  "Success",
                  messageData.data.formtype === FormTypesPage.Reports
                    ? "The Reporting request was sent successfully"
                    : "The Assessment request was sent successfully"
                );
              } else {
                this.setState({ loading: false });
                popupAlert("error", "Error", "Failed.");
              }
              break;
            case "warp-invitation-list-view":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 900);
              const invitationId_view = messageData.data.invitationId;
              const assessmentFormName_view =
                messageData.data.assessmentFormName;
              const comapnyName_view = messageData.data.comapnyName;
              const isRecommendationIcon =
                messageData.data.isRecommendationIcon;
              const period = messageData.data.period;
              const requestedFrom = messageData.data.requestedFrom;
              const questionid = messageData.data.questionid;
              const deviationCount2 = messageData.data.DeviationCount;
              const isCarryForward2 = messageData.data.IsCarryForward;
              const submissionId2 = messageData.data.SubmissionId;
              const score2 = messageData.data.Score;

              if (
                isRecommendationIcon !== undefined &&
                isRecommendationIcon !== null
              ) {
                localStorage.setItem(
                  "isRecommendationIcon",
                  isRecommendationIcon
                );
                this.props.viewRecommendationsOpen(
                  isRecommendationIcon === "" ? false : isRecommendationIcon
                );
              } else {
                localStorage.setItem("isRecommendationIcon", false);
                this.props.viewRecommendationsOpen(false);
              }

              if (
                assessmentFormName_view !== undefined &&
                assessmentFormName_view !== null &&
                assessmentFormName_view !== ""
              ) {
                localStorage.setItem(
                  "assessmentFormName2",
                  assessmentFormName_view
                );
              }

              if (period !== undefined && period !== null && period !== "") {
                localStorage.setItem("period", period);
              }

              if (
                comapnyName_view !== undefined &&
                comapnyName_view !== null &&
                comapnyName_view !== ""
              ) {
                localStorage.setItem("comapnyName2", comapnyName_view);
              }

              if (
                deviationCount2 !== undefined &&
                deviationCount2 !== "" &&
                deviationCount2 !== "null"
              ) {
                localStorage.setItem("deviationCount", deviationCount2);
              } else {
                localStorage.setItem("deviationCount", 0);
              }

              if (
                isCarryForward2 !== undefined &&
                isCarryForward2 !== null &&
                isCarryForward2 !== ""
              ) {
                localStorage.setItem("isCarryForward", isCarryForward2);
              }

              if (
                submissionId2 !== undefined &&
                submissionId2 !== null &&
                submissionId2 !== ""
              ) {
                localStorage.setItem("submissionId", submissionId2);
              }

              if (score2 !== undefined && score2 !== null && score2 !== "") {
                localStorage.setItem("score", score2);
              }

              if (questionid !== "" && questionid !== undefined) {
                this.props.history.replace(
                  `/assessmentDetails/scoring_test/${invitationId_view}/view?questionid=${questionid}&assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`
                );
              } else {
                this.props.history.replace(
                  `/assessmentDetails/scoring_test/${invitationId_view}/view?assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`
                );
              }
              break;
            case "warp-QuestionnaireReport":
              this.setState({
                commonDialog: {
                  isOpened: messageData.data.isOpenedPopup,
                  popupTitle: messageData.data.title,
                  invitationId: messageData.data.invitationId,
                },
              });
              break;
            case "warp-Recommendation-Listing":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 900);
              const invitationId_rcmd = messageData.data.invitationId;
              const questionnare_rcmd = messageData.data.questionnare;
              const period_rcmd = messageData.data.period;
              const comapnyName_rcmd = messageData.data.comapnyName;
              const deviationCount = messageData.data.deviationCount;
              const isCarryForward = messageData.data.isCarryForward;
              const submissionId = messageData.data.submissionId;
              const score = messageData.data.score;
              const firstName = localStorage.firstName;

              this.props.viewRecommendationsOpen(true);

              if (
                questionnare_rcmd !== undefined &&
                questionnare_rcmd !== null &&
                questionnare_rcmd !== ""
              ) {
                localStorage.setItem("assessmentFormName2", questionnare_rcmd);
              }

              if (
                period_rcmd !== undefined &&
                period_rcmd !== null &&
                period_rcmd !== ""
              ) {
                localStorage.setItem("period", period_rcmd);
              }

              if (
                comapnyName_rcmd !== undefined &&
                comapnyName_rcmd !== null &&
                comapnyName_rcmd !== ""
              ) {
                localStorage.setItem("comapnyName2", comapnyName_rcmd);
              }

              if (
                deviationCount !== undefined &&
                deviationCount !== "" &&
                deviationCount !== "null"
              ) {
                localStorage.setItem("deviationCount", deviationCount);
              } else {
                localStorage.setItem("deviationCount", 0);
              }

              if (
                isCarryForward !== undefined &&
                isCarryForward !== null &&
                isCarryForward !== ""
              ) {
                localStorage.setItem("isCarryForward", isCarryForward);
              }

              if (
                submissionId !== undefined &&
                submissionId !== null &&
                submissionId !== ""
              ) {
                localStorage.setItem("submissionId", submissionId);
              }

              if (score !== undefined && score !== null && score !== "") {
                localStorage.setItem("score", score);
              }

              let url = "";
              url = `/assessmentrecommendation/${invitationId_rcmd}/${questionnare_rcmd}/${period_rcmd}/${comapnyName_rcmd}/${deviationCount}/${isCarryForward}/${submissionId}/${score}/${firstName}`;
              this.props.history.replace(url);
              break;
            // case "warp-recommendation-invitation-list-view":
            //   this.setState({ loading: true });
            //   setTimeout(() => {
            //     this.setState({ loading: false });
            //   }, 900);
            //   const invitationIdRecomm_view = messageData.data.invitationId;
            //   const assessmentFormNameRecomm_view =
            //     messageData.data.assessmentFormName;
            //   const comapnyNameRecomm_view = messageData.data.comapnyName;
            //   const isRecommendationIcon_view =
            //     messageData.data.isRecommendationIcon;
            //   const period_view = messageData.data.period;
            //   const requestedFrom_view = messageData.data.requestedFrom;
            //   const questionId = messageData.data.QuestionId;
            //   const deviationCount1 = messageData.data.deviationCount;
            //   const isCarryForward1 = messageData.data.isCarryForward;
            //   const submissionId1 = messageData.data.submissionId;
            //   const score1 = messageData.data.score;
            //   // WarpNavigator.navigateToAssessment(
            //   //   this.props.history,
            //   //   "viewrecommendation",
            //   //   invitationIdRecomm_view,
            //   //   assessmentFormNameRecomm_view,
            //   //   comapnyNameRecomm_view,
            //   //   isRecommendationIcon_view,
            //   //   period_view,
            //   //   requestedFrom_view,
            //   //   questionId,
            //   //   deviationCount1,
            //   //   isCarryForward1,
            //   //   submissionId1,
            //   //   score1
            //   // );

            //   if (
            //     isRecommendationIcon_view !== undefined &&
            //     isRecommendationIcon_view !== null
            //   ) {
            //     isRecommendationIcon_view === ""
            //       ? localStorage.setItem("isRecommendationIcon", false)
            //       : localStorage.setItem("isRecommendationIcon",
            //           isRecommendationIcon_view
            //         );
            //   } else {
            //     localStorage.setItem("isRecommendationIcon", false);
            //   }

            //   if (
            //     assessmentFormNameRecomm_view !== undefined &&
            //     assessmentFormNameRecomm_view !== null &&
            //     assessmentFormNameRecomm_view !== ""
            //   ) {
            //     localStorage.setItem("assessmentFormName2",
            //       assessmentFormNameRecomm_view
            //     );
            //   }

            //   if (
            //     period_view !== undefined &&
            //     period_view !== null &&
            //     period_view !== ""
            //   ) {
            //     localStorage.setItem("period", period_view);
            //   }

            //   if (
            //     comapnyName !== undefined &&
            //     comapnyName !== null &&
            //     comapnyName !== ""
            //   ) {
            //     localStorage.setItem("comapnyName2", comapnyName);
            //   }

            //   if (
            //     deviationCount1 !== undefined &&
            //     deviationCount1 !== "" &&
            //     deviationCount1 !== "null"
            //   ) {
            //     localStorage.setItem("deviationCount", deviationCount1);
            //   } else {
            //     localStorage.setItem("deviationCount", 0);
            //   }

            //   if (
            //     isCarryForward1 !== undefined &&
            //     isCarryForward1 !== null &&
            //     isCarryForward1 !== ""
            //   ) {
            //     localStorage.setItem("isCarryForward", isCarryForward1);
            //   }

            //   if (
            //     submissionId1 !== undefined &&
            //     submissionId1 !== null &&
            //     submissionId1 !== ""
            //   ) {
            //     localStorage.setItem("submissionId", submissionId1);
            //   }

            //   if (score1 !== undefined && score1 !== null && score1 !== "") {
            //     localStorage.setItem("score", score1);
            //   }

            //   if (questionId !== "" && questionId !== undefined) {
            //     window.location.href = `/assessmentDetails/scoring_test/${invitationId_view}/view?questionid=${questionid}&assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`;
            //   } else {
            //     window.location.href = `/assessmentDetails/scoring_test/${invitationId_view}/view?assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`;
            //   }

            //   // this.props.history.push({ pathname: "/assessmentDetails/scoring_test/" + invitationId_view + "/view", state: { assessmentFormName: assessmentFormName_view + " - " + comapnyName_view } });
            //   break;
            case "warp-QuestionnaireReport":
              this.setState({
                commonDialog: {
                  isOpened: messageData.data.isOpenedPopup,
                  popupTitle: messageData.data.title,
                  invitationId: messageData.data.invitationId,
                },
              });
              break;
            case "Progress-Report-Message":
              this.setState({
                progressReport: {
                  isOpened: true,
                  popupTitle: "Progress Report",
                  invitationId: messageData.data.invitationId,
                  questionnare: messageData.data.questionnare,
                  period: messageData.data.period,
                  comapnyName: messageData.data.comapnyName,
                  submissionId: messageData.data.submissionId,
                  deviationCount: messageData.data.deviationCount,
                  isCarryForward: messageData.data.isCarryForward,
                },
              });
              this.getDashboardUrl();
              break;
            case "warp-DeviationReport":
              this.setState({
                deviationReport: {
                  isOpened: true,
                  popupTitle: messageData.data.title,
                  invitationId: messageData.data.invitationId,
                  deviationCount: messageData.data.deviationCount,
                  questionnare: messageData.data.questionnare,
                  period: messageData.data.period,
                  comapnyName: messageData.data.comapnyName,
                },
              });
              break;
            case "warp-new-invitation-started-New":
              this.setState({ loading: true });
              this.props.isOpen(true);
              break;
            case "warp-new-invitation-started-Report":
              this.setState({
                startReportDialog: {
                  isOpened: messageData.data.isOpenedPopup,
                  formType: messageData.data.formType,
                },
              });
              break;
            case "go-to-document-repository":
              WarpNavigator.navigateToDocumentRepository(
                this.props.history,
                messageData.data.formType,
                messageData.data.context
                // messageData.data.invitationId,
                // AIActions.uploadDocuments,
                // messageData.data.assessmentFormName,
                // messageData.data.comapnyName
              );
              break;
            case "go-to-upload-docs":
              WarpNavigator.navigateToFileUpload(
                this.props.history,
                messageData.data.invitationId,
                // AIActions.uploadDocuments,
                messageData.data.assessmentFormName,
                messageData.data.comapnyName
              );
              break;
            case "validate-recaptcha":
              const isCaptchaValid = await captchaValidation(this.context);
              if (isCaptchaValid) {
                let iFrame = document.getElementById(messageData.data.iframeId);
                iFrame.contentWindow.postMessage(
                  JSON.stringify({
                    type: "reCaptchaValidation",
                  }),
                  WARP_Link ? new URL(WARP_Link).origin : "*"
                );
              } else {
                alert("Captcha verification failed. Please try again.");
              }
              break;
              case "warp-AssignReviewer":
              this.setState({
              assignReviewerDetails: {
                formId: messageData.data.formDetails.formId,
                invitationId: messageData.data.formDetails.invitationId,
                questionId: messageData.data.formDetails.questionId,
                SubmissionId: messageData.data.formDetails.SubmissionId,
                formType: messageData.data.formDetails.formType,
                AssessmentFormName: messageData.data.formDetails.AssessmentFormName,
                CompanyName: messageData.data.formDetails.CompanyName,
                AIStatus: JSON.stringify(messageData.data.formDetails.AIStatus),
                invitationStatus: messageData.data.formDetails.invitationStatus,
                AIBulkDocumentProcessings: JSON.stringify(messageData.data.formDetails.AIBulkDocumentProcessings),
                Sources: JSON.stringify(messageData.data.formDetails.Sources),
                page: "listingpage",
              }
            });
              this.setState({
                iframeloader: false,
                iframeloader2: false,
                loading: this.state.commonDialog.isOpened ? false : true,
                commonDialog: {
                  height: 250,
                  isOpened: messageData.data.isOpenedPopup,
                  popupTitle: messageData.data.title,
                  dialogType: "assign-reviewer-assessment",
                },
              });
              break;
            default:
              break;
          }
        } catch (error) {}
      }
    });
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.newHandle);
  }

  sendMessage = () => {
    const iframe = document.querySelector("iframe");
    iframe.contentWindow.postMessage("Hi Son!", process.env.WARP_URL);
  };

  handleDrawerClose = () => {
    this.setState({ open: false });
    this.setState({ collapse: 0 });
  };
  getBodyPosition = () => {
    divOffsetTop = 0;
    divOffsetLeft = 0;
    divOffsetBottom = -document.body.scrollHeight;
  };

  resizeIframe = (iframe) => {
    let iFramevalue = document.getElementById("listIframe");
    if (iFramevalue) {
      let iFrameClientHeight = document.getElementById("__next");
      // console.log({ iFrameClientHeight });
      if (iFrameClientHeight) {
        iFramevalue.style.height = iFrameClientHeight.clientHeight + "px";
      }
    }
  };

  GetUserRole = () => {
    let warpToken = jwt.decode(localStorage.warpToken);
    if (warpToken !== null) {
      let UserRole = warpToken["https://hasura.io/jwt/claims"]["x-hasura-role"];
      if (UserRole === "Invitee" || UserRole === "Responder") {
        this.setState({ IsKhaitanInvitee: true });
      }
    }
  };

  handleCommonDialogClose = () => {
    this.setState({ commonDialog: { isOpened: false } });
  };

  handleStartReportDialogClose = () => {
    this.setState({ startReportDialog: { isOpened: false } });
  };

  progressReportClose = () => {
    this.setState({ progressReport: { isOpened: false } });
  };
  deviationReportClose = () => {
    this.setState({ deviationReport: { isOpened: false } });
  };

  getIframeSrc = () => {
    return `${WARP_Link}embed/invitation/list?accessToken=${localStorage.getItem(
      "warpToken"
    ) || ""}&formtype=${isAssessmentPage}`;
  };

  getInvitationPopupText = () => {
    const url = window.location.href;
    if (url.includes("/assessments")) {
      return "Request Assessment";
    } else if (url.includes("/reports")) {
      return "Start New Report";
    }
    return "Initiate Assessment";
  };

  handleUploadDocuments = () => {
    WarpNavigator.navigateToDocumentRepository(
      this.props.history,
      this.state.startReportDialog.formType === FormTypes.Report.toLowerCase()
        ? FormTypesPage.Reports
        : FormTypesPage.Assessments,
      "listing"
    );
  };

  handleStartNewReport = () => {
    // Open the drawer
    this.props.isOpen(true);
    // Close the dialog
    this.handleStartReportDialogClose();
  };

  render() {
    isAssessmentPage = window.location.pathname.includes("/assessments")
      ? FormTypesPage.Assessments
      : FormTypesPage.Reports;
    const { classes, location } = this.props;
    const { assessmentFormName } = this.state;
    let FormLink = "";
    let AssessmentFormName = assessmentFormName;
    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions === null) {
      return <Redirect to="/login" />;
    }
    //} else if (getUserPermision(permissions, PageKeys.Assessments) === null) {
    // return <Redirect to="/not-found" />;
    // }
    const URL = window.location.href;
    let assessment_accessment_check = getUserPermision(
      permissions,
      PageKeys.Assessments
    );
    let assessment_report_check = getUserPermision(
      permissions,
      PageKeys.Assessments_reporting
    );
    if (URL.includes(FormTypesPage.Reports) && assessment_report_check === null)
      return <Redirect to="/home" />;
    if (
      URL.includes(FormTypesPage.Assessments) &&
      assessment_accessment_check == null
    )
      return <Redirect to="/home" />;

    //changes token expiry
    if (
      localStorage.warpToken !== undefined &&
      localStorage.warpToken !== null &&
      localStorage.warpToken !== ""
    ) {
      var now = new Date();
      const todaydate = new Date(
        now.getTime() + now.getTimezoneOffset() * 60000
      );

      const token = jwt.decode(localStorage.warpToken);
      const tokendate = new Date(0);

      if (token != null) {
        tokendate.setUTCSeconds(token.exp);
      }

      const tokendateiat = new Date(0);
      if (token != null) {
        tokendateiat.setUTCSeconds(token.iat);
      }

      var starthour = parseInt(tokendate.getHours());
      var endhour = parseInt(todaydate.getHours());
      var houriat = parseInt(tokendateiat.getHours());

      //console.log("token timings", todaydate, tokendate);//for testing
      if (todaydate > tokendate) {
        //  if (houriat < endhour + 5 ) {
        // console.log("token expired!");
        return <Redirect to="/logout" />;
      }
    }

    if (location.state !== undefined && location.state !== null) {
      AssessmentFormName = location.state.assessmentFormName;
    }

    let url = window.location.href;

    if (
      url.includes("view") ||
      url.includes("edit") ||
      url.includes("intro") ||
      url.includes("start")
    ) {
      let splitdata = url.split("/");
      let invitationId = splitdata[splitdata.length - 2];
      let StepName = splitdata[splitdata.length - 1];
      StepName = StepName.includes("?") ? StepName.split("?")[0] : StepName;
      FormLink =
        WARP_Link +
        "embed/form/invitation/" +
        invitationId +
        "/" +
        StepName +
        "?accessToken=" +
        (localStorage.getItem("warpToken") || "");
    } else {
      FormLink = "";
      AssessmentFormName = "ESG Assessments";
    }

    return (
      <React.Fragment>
        <React.Fragment>
          <div className="breadtitle_wrap">
            <div className="page_top_title" onClick={this.sendMessage}>
              <div
                className="page_heading"
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-end",
                  width: "100%",
                }}
              >
                <h4>{AssessmentFormName}</h4>
              </div>
            </div>
          </div>

          <div className="">
            {this.state.thirdPartyCookieEnabled !== null ? (
              this.state.thirdPartyCookieEnabled ? (
                <>
                  {this.state.loader && (
                    <div style={{ position: "absolute", width: "90%" }}>
                      <Spinner />
                    </div>
                  )}
                  <iframe
                    allow
                    title=" "
                    id="listIframe"
                    src={FormLink !== "" ? FormLink : this.getIframeSrc()}
                    allowFullScreen
                    frameBorder="0"
                    style={{ width: "100%", paddingBottom: "20px", minHeight: "660px" }}
                    height={this.state.iframeHeight}
                    // height={(isAssessmentPage === 'reports' || isAssessmentPage === 'assessments') ? "720px" : this.state.iframeHeight}
                    loading="eager"
                  />
                </>
              ) : (
                <ThirdPartyCookieEnabled />
              )
            ) : (
              ""
            )}
          </div>
          <iframe
            title="localstorage-access_5"
            style={
              { display: "none" } //sandbox="allow-same-origin allow-scripts allow-storage-access-by-user-activation"
            }
            src={WARP_Link + "test"}
          />

          {JSON.parse(localStorage.getItem("userType")) ===
            "VENTURECAPITALIST" ||
            JSON.parse(localStorage.getItem("userType")) === "SUPPLIER" ||
            JSON.parse(localStorage.getItem("userType")) ===
            "ORGANIZATIONADMIN" ||
            JSON.parse(localStorage.getItem("userType")) ===
            "LOCATIONEXECUTIVE" ? (
            <Drawer
              className={classes.drawer}
              // variant="persistent"
              anchor="right"
              open={this.props.open}
              classes={{
                paper: classes.drawerPaper + " " + "quick_view_pannel",
              }}
              onClick={() => this.props.isOpen(false)}
            >
              {/*            {console.log("link2", (WARP_Link + "embed/invitation/send-invitation?accessToken=" + (localStorage.getItem("warpToken") || "")))}*/}
              <div className="quick_view_header assessmentrequestbackicon">
                <h4 style={{ marginBottom: 0, color: "#122f48" }}>
                  {this.getInvitationPopupText()}
                </h4>
                <IconButton
                  onClick={() => this.props.isOpen(false)}
                  style={{
                    backgroundColor: "transparent",
                  }}
                  className="close-button-custom"
                >
                  <CloseIcon />
                </IconButton>
              </div>
              <div
                className="quick_view"
                style={{ paddingBottom: "0px", height: "89vh" }}
              >
                {this.state.sidebarLoader && <Spinner />}
                <iframe
                  onLoad={() =>
                    setTimeout(
                      () => {
                        this.setState({ sidebarLoader: false });
                      },
                      [1000]
                    )
                  }
                  title="send-Invite"
                  id="sendInviteIframe"
                  src={
                    WARP_Link +
                    "embed/invitation/send-invitation-assessment-and-reports?accessToken=" +
                    (localStorage.getItem("warpToken") || "") +
                    `&formtype=${isAssessmentPage}`
                  }
                  allowfullscreen
                  frameBorder="0"
                  style={{ width: "100%", minHeight: "89vh", height: "100%" }}
                />
              </div>
            </Drawer>
          ) : (
            ""
          )}
        </React.Fragment>

        <Dialog
          open={this.state.commonDialog.isOpened && this.state.commonDialog.dialogType !== "assign-reviewer-assessment"}
          onClose={this.handleCommonDialogClose}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{
            className: "supplierinfo_popupcont questionnaire-report-popup",
          }}
        >
          <DialogTitle id="scroll-dialog-title" className="suppinfopop_heading">
            {this.state.commonDialog.popupTitle}
            <IconButton
              className="suppinfopop_closebtn"
              aria-label="close"
              onClick={this.handleCommonDialogClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="dialogueContent">
            <iframe
              title="questionnaire report"
              height={270}
              width={"100%"}
              frameBorder={0}
              src={
                WARP_Link +
                "embed/NewPopUp/QuestionnaireReportPopup?invitationId=" +
                this.state.commonDialog.invitationId
              }
            />
          </DialogContent>
        </Dialog>
        {this.state.progressReport !== undefined &&
        this.state.dashboardUrl &&
        this.state.dashboardUrl.length > 0 ? (
          <Dialog
            open={this.state.progressReport.isOpened}
            onClose={this.progressReportClose}
            fullWidth={true}
            maxWidth="md"
            PaperProps={{ className: "supplierinfo_popupcont progress_report" }}
          >
            <DialogTitle
              id="scroll-dialog-title"
              className="suppinfopop_heading"
            >
              {this.state.progressReport.popupTitle}
              <IconButton
                className="suppinfopop_closebtn"
                aria-label="close"
                onClick={this.progressReportClose}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent className="ProgressReportDialogue">
              <div>
                <h5>{this.state.progressReport.questionnare}</h5>
              </div>
              <iframe
                title="Progress Report"
                height={360}
                width={"100%"}
                frameBorder={0}
                src={
                  WARP_Link +
                  "embed/NewPopUp/ProgressReport?invitationId=" +
                  this.state.progressReport.invitationId +
                  "&questionnareName=" +
                  this.state.progressReport.questionnare +
                  "&period=" +
                  this.state.progressReport.period +
                  "&comapnyName=" +
                  this.state.progressReport.comapnyName +
                  "&submissionId=" +
                  this.state.progressReport.submissionId +
                  "&deviationCount=" +
                  this.state.progressReport.deviationCount +
                  "&isCarryForward=" +
                  this.state.progressReport.isCarryForward
                }
              />
            </DialogContent>
          </Dialog>
        ) : (
          ""
        )}
        {this.state.deviationReport !== undefined ? (
          <Dialog
            open={this.state.deviationReport.isOpened}
            onClose={this.deviationReportClose}
            fullWidth={true}
            maxWidth="lg"
            PaperProps={{
              className: "supplierinfo_popupcont Deviation-Report-Popup",
            }}
          >
            <DialogTitle
              id="scroll-dialog-title"
              className="suppinfopop_heading"
            >
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  flexDirection: "column",
                }}
              >
                <div
                  style={{ fontSize: 24, lineHeight: "20px", color: "#122F47" }}
                >
                  {this.state.deviationReport.popupTitle}
                  <span
                    className="primary_grey_14"
                    style={{ color: "#444", marginTop: 2, marginLeft: 5 }}
                  />
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    background: "#D6F3FF",
                    padding: "10px 15px",
                    marginTop: "15px",
                    borderRadius: "5px",
                  }}
                >
                  <div
                    style={{
                      color: "#122F47",
                      fontWeight: 400,
                      fontSize: 16,
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "20px",
                    }}
                  >
                    <span>{this.state.deviationReport.questionnare}</span>
                    <span
                      style={{
                        color: "#122F47",
                        fontWeight: 600,
                        fontSize: 16,
                      }}
                    >
                      Total {this.state.deviationReport.deviationCount}{" "}
                      Questions
                    </span>
                  </div>
                  <div
                    class="suppinfosub_heading primary_grey_12"
                    style={{
                      color: "#122F47",
                      fontWeight: 400,
                      fontSize: 16,
                      display: "flex",
                      flexDirection: "column",
                      lineHeight: "20px",
                    }}
                  >
                    <spa>{this.state.deviationReport.comapnyName} </spa>
                    <span
                      style={{
                        color: "#122F47",
                        fontWeight: 600,
                        fontSize: 16,
                        textAlign: "right",
                      }}
                    >
                      {this.state.deviationReport.period}
                    </span>
                  </div>
                </div>
              </div>
              <IconButton
                className="suppinfopop_closebtn"
                aria-label="close"
                onClick={this.deviationReportClose}
              >
                <CloseIcon />
              </IconButton>
            </DialogTitle>
            <DialogContent className="dialogueContent">
              <iframe
                //style={{ margin: "10px 0" }}
                title="Deviation Report"
                height={270}
                width={"100%"}
                frameBorder={0}
                src={
                  WARP_Link +
                  "embed/NewPopUp/DeviationReportPopup?invitationId=" +
                  this.state.deviationReport.invitationId
                }
              />
            </DialogContent>
          </Dialog>
        ) : (
          ""
        )}

        <Dialog
          open={this.state.startReportDialog.isOpened && this.state.commonDialog.dialogType !== "assign-reviewer-assessment"}
          onClose={this.handleStartReportDialogClose}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{
            className: "supplierinfo_popupcont upload-documents-popup",
          }}
        >
          <DialogTitle id="scroll-dialog-title" className="suppinfopop_heading">
            <IconButton
              className="suppinfopop_closebtn"
              aria-label="close"
              onClick={this.handleStartReportDialogClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="dialogueContent">
            <div
              className="report-dialog-content"
              style={{
                textAlign: "center",
                paddingTop: "50px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                gap: 20,
              }}
            >
              <InfoIcon />
              <h2
                style={{
                  fontSize: "20px",
                  color: "#444",
                  fontWeight: 600,
                  marginBottom: 0,
                }}
              >
                Recommended: Upload Documents!
              </h2>
              <p
                style={{
                  fontSize: "14px",
                  color: "#444",
                  fontWeight: 400,
                  marginBottom: 0,
                }}
              >
                Our AI will extract data from your documents to automatically
                suggest or pre-fill your responses in all AI-enabled reports and
                assessments. This will help save you time.
              </p>
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  gap: "24px",
                  alignItems: "center",
                  marginBottom: 10,
                }}
              >
                <AIDocumentUploadBtn
                  onClick={this.handleUploadDocuments}
                  buttonText="UPLOAD DOCUMENTS"
                />

                <Button
                  className="outline_btn_new"
                  onClick={this.handleStartNewReport}
                >
                  START NEW {this.state.startReportDialog.formType}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <Dialog
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.dialogType === "assign-reviewer-assessment"
          }
          onClose={this.handleCommonDialogClose}
          fullWidth={true}
          TransitionComponent={this.Transition}
          transitionDuration={900}
          maxWidth="md"
          PaperProps={{ className: "supplierinfo_popupcont" }}
          style={{ opacity: this.state.loading ? 0 : 1 }}
        >
          <DialogTitle id="scroll-dialog-title" className="suppinfopop_heading">
            {this.state.commonDialog.popupTitle}
            <IconButton
              className="suppinfopop_closebtn"
              aria-label="close"
              onClick={this.handleCommonDialogClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="dialogueContent" style={{paddingBottom:0}}>
            {this.props.QwcLoader ? <Spinner style={{ minHeight: 100 }} /> : ""}
            <iframe
              id={"assignReviewerAssessmentIframe"}
              className="customScroll"
              title="assign reviewer Assessment"
              height={this.state.iframeHeight - 80}
              onLoad={() =>
                setTimeout(() => {
                  this.setState({ loading: false });
                }, 500)
              }
              width={"100%"}
              frameBorder={0}
              src={
                WARP_Link +
                "embed/NewPopUp/AssignReviewerPopup?formId=" +
                this.state.assignReviewerDetails.formId +
                "&invitationId=" +
                this.state.assignReviewerDetails.invitationId +
                "&questionId=" +
                this.state.assignReviewerDetails.questionId +
                "&SubmissionId=" +
                this.state.assignReviewerDetails.SubmissionId +
                "&formType=" +
                this.state.assignReviewerDetails.formType +
                "&page=" +
                this.state.assignReviewerDetails.page +
                  "&AssessmentFormName=" +
                  this.state.assignReviewerDetails.AssessmentFormName +
                  "&CompanyName=" +
                  this.state.assignReviewerDetails.CompanyName +
                  "&AIStatus=" +
                  this.state.assignReviewerDetails.AIStatus +
                  "&invitationStatus=" +
                  this.state.assignReviewerDetails.invitationStatus +
                  "&AIBulkDocumentProcessings=" +
                  this.state.assignReviewerDetails.AIBulkDocumentProcessings +
                  "&Sources=" +
                  this.state.assignReviewerDetails.Sources +
                "&accessToken=" +
                localStorage.getItem("warpToken")
              }
            />
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => ({
  open: state.drawer.open,
});

// Mapping dispatch actions to props
const mapDispatchToProps = {
  isOpen,
  viewRecommendationsOpen,
  updateCount,
  QueryButtonShow,
};
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles, { withTheme: true })(Assessments))
);
