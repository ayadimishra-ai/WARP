import React, { Component } from "react";
import {
  getNextJSServiceUrl,
  getServiceUrl,
  getUserPermision,
  GetWARPUrl,
} from "../../config";
import axios from "axios";
import { Redirect, withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import { WarpNavigator } from "../../warp/warp.service";
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
class AssessmentsLock extends Component {
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

  // newHandle = async (type, event) => {
  //   if (type === "message") {

  //     let dataType = typeof event.data;
  //     const URL = window.location.href;
  //     if (!URL.includes("/assessments") && !URL.includes("/reports")) return;
  //     if (dataType === "string") {
  //       try {
  //         messageData = JSON.parse(event.data);
  //         const type = messageData.type;
  //         switch (type) {
  //           case "warp-content-resize":
  //             if (
  //               this.state.iframeHeight !== messageData.data.height &&
  //               !document.querySelector('[role="dialog"]') &&
  //               !document.querySelector('[role="presentation"]')
  //             ) {
  //               const newHeight = Math.min(
  //                 Math.max(messageData.data.height + 50, 500), // Minimum 500px
  //                 window.innerHeight * 0.9 // Maximum 90% of viewport height
  //               );
  //               this.setState({ iframeHeight: newHeight });
  //             }
  //             break;
  //           case "warp-check-localStorage-access":
  //             this.setState(
  //               { thirdPartyCookieEnabled: messageData.data.success },
  //               () => {
  //                 if (document.getElementById("listIframe")) {
  //                   document.getElementById("listIframe").onload = () => {
  //                     this.setState({ loading: false });
  //                   };
  //                 } else {
  //                   this.setState({ loading: false });
  //                 }
  //               }
  //             );
  //             break;
  //           case "warp-new-invitation-cancel":
  //             if (this.props.open === true) {
  //               this.props.isOpen(false);
  //             } else {
  //               this.props.isOpen(true);
  //             }
  //             break;
  //           case "warp-invitation-list-respond":
  //             this.setState({ loading: true });
  //             setTimeout(() => {
  //               this.setState({ loading: false });
  //             }, 900);
  //             this.setState({
  //               assessmentFormName:
  //                 messageData.data.assessmentFormName +
  //                 " - " +
  //                 messageData.data.comapnyName,
  //             });
  //             localStorage.setItem("isRecommendationIcon", false);
  //             localStorage.setItem("assessmentFormName2", "");
  //             localStorage.setItem("period", "");
  //             localStorage.setItem("comapnyName2", "");
  //             localStorage.setItem("deviationCount", 0);
  //             localStorage.setItem("isCarryForward", "");
  //             localStorage.setItem("submissionId", "");
  //             localStorage.setItem("score", "");
  //             let isIntro = false,
  //               isDocument = false,
  //               isUploadDoc = false,
  //               isDefaultPage = false;
  //             if (this.state.userRole === AppRoles.Inviter) {
  //               isIntro = true;
  //             } else {
  //               if (
  //                 (messageData.data.AIStatus.docWithAI ||
  //                   messageData.data.AIStatus.onlyDoc) &&
  //                 messageData.data.invitationStatus ==
  //                   FormInvitationUIStatus.Requested
  //               ) {
  //                 if (messageData.data.Sources.length == 0) {
  //                   if (messageData.data.AIStatus.docWithAI) {
  //                     isDefaultPage = true;
  //                   } else {
  //                     isUploadDoc = true;
  //                   }
  //                 } else {
  //                   if (
  //                     messageData.data.AIBulkDocumentProcessings.length == 0
  //                   ) {
  //                     isUploadDoc = true;
  //                   } else {
  //                     if (
  //                       messageData.data.AIBulkDocumentProcessings.filter(
  //                         (items) =>
  //                           items.requestStatus ==
  //                           bulkFileCurationStatus.Processing
  //                       ).length > 0
  //                     ) {
  //                       isDocument = true;
  //                     } else {
  //                       if (
  //                         messageData.data.Sources.filter(
  //                           (items) =>
  //                             items.SourceFile.status !=
  //                             SourceFilesStatus.Success
  //                         ).length > 0
  //                       ) {
  //                         isUploadDoc = true;
  //                       } else {
  //                         isIntro = true;
  //                       }
  //                     }
  //                   }
  //                 }
  //               } else {
  //                 isIntro = true;
  //               }
  //             }
  //             if (isIntro) {
  //               WarpNavigator.navigateToAssessment(
  //                 this.props.history,
  //                 "intro",
  //                 messageData.data.invitationId,
  //                 messageData.data.assessmentFormName,
  //                 messageData.data.comapnyName
  //               );
  //             } else {
  //               WarpNavigator.navigateToFileUpload(
  //                 this.props.history,
  //                 messageData.data.invitationId,
  //                 isDocument
  //                   ? AIActions.documentProcessing
  //                   : isUploadDoc
  //                   ? AIActions.uploadDocuments
  //                   : "",
  //                 messageData.data.assessmentFormName,
  //                 messageData.data.comapnyName,
  //                 messageData.data.AIStatus
  //               );
  //             }
  //             break;
  //           case "warp-new-invitation-started":
  //             this.setState({ loading: true });
  //             break;
  //           case "warp-new-invitation-finished":
  //             if (messageData.data.isSuccess === true) {
  //               document.getElementById(
  //                 "listIframe"
  //               ).src = document.getElementById("listIframe").src;
  //               this.setState({ loading: false });
  //               this.props.isOpen(false);
  //               let isAIpopup = false;
  //               let isDocWithAIpopup = false;
  //               if (
  //                 messageData.data.formDetails.filter(
  //                   (items) => items.isAIForm === true
  //                 ).length > 0
  //               ) {
  //                 isAIpopup = true;
  //                 if (
  //                   messageData.data.formDetails.filter(
  //                     (items) =>
  //                       items.isAIForm === true && items.AIData.length > 0
  //                   )
  //                 ) {
  //                   if (
  //                     messageData.data.formDetails.filter(
  //                       (items) =>
  //                         items.isAIForm === true &&
  //                         items.AIData[0].docWithAI === true
  //                     ).length > 0
  //                   ) {
  //                     isDocWithAIpopup = true;
  //                   }
  //                 }
  //               }
  //               if (isAIpopup) {
  //                 popupAlert(
  //                   "docwithaisuccess",
  //                   "Assessment Requested",
  //                   isDocWithAIpopup
  //                     ? "Our AI has started gathering data. An email invite will be sent shortly."
  //                     : "An email invite has been sent. Our AI will start gathering data once the suggested documents are uploaded."
  //                 );
  //               } else {
  //                 popupAlert(
  //                   "success",
  //                   "Success",
  //                   messageData.data.formtype === FormTypesPage.Reports
  //                     ? "The Reporting request was sent successfully"
  //                     : "The Assessment request was sent successfully"
  //                 );
  //               }
  //             } else {
  //               this.setState({ loading: false });
  //               popupAlert("error", "Error", "Failed.");
  //             }
  //             break;
  //           case "warp-invitation-list-view":
  //             this.setState({ loading: true });
  //             setTimeout(() => {
  //               this.setState({ loading: false });
  //             }, 900);
  //             const invitationId_view = messageData.data.invitationId;
  //             const assessmentFormName_view =
  //               messageData.data.assessmentFormName;
  //             const comapnyName_view = messageData.data.comapnyName;
  //             const isRecommendationIcon =
  //               messageData.data.isRecommendationIcon;
  //             const period = messageData.data.period;
  //             const requestedFrom = messageData.data.requestedFrom;
  //             const questionid = messageData.data.questionid;
  //             const deviationCount2 = messageData.data.DeviationCount;
  //             const isCarryForward2 = messageData.data.IsCarryForward;
  //             const submissionId2 = messageData.data.SubmissionId;
  //             const score2 = messageData.data.Score;

  //             if (
  //               isRecommendationIcon !== undefined &&
  //               isRecommendationIcon !== null
  //             ) {
  //               this.props.viewRecommendationsOpen(
  //                 isRecommendationIcon === "" ? false : isRecommendationIcon
  //               );
  //             } else {
  //               //localStorage.setItem("isRecommendationIcon", false);
  //               this.props.viewRecommendationsOpen(false);
  //             }

  //             if (
  //               assessmentFormName_view !== undefined &&
  //               assessmentFormName_view !== null &&
  //               assessmentFormName_view !== ""
  //             ) {
  //               localStorage.setItem(
  //                 "assessmentFormName2",
  //                 assessmentFormName_view
  //               );
  //             }

  //             if (period !== undefined && period !== null && period !== "") {
  //               localStorage.setItem("period", period);
  //             }

  //             if (
  //               comapnyName_view !== undefined &&
  //               comapnyName_view !== null &&
  //               comapnyName_view !== ""
  //             ) {
  //               localStorage.setItem("comapnyName2", comapnyName_view);
  //             }

  //             if (
  //               deviationCount2 !== undefined &&
  //               deviationCount2 !== "" &&
  //               deviationCount2 !== "null"
  //             ) {
  //               localStorage.setItem("deviationCount", deviationCount2);
  //             } else {
  //               localStorage.setItem("deviationCount", 0);
  //             }

  //             if (
  //               isCarryForward2 !== undefined &&
  //               isCarryForward2 !== null &&
  //               isCarryForward2 !== ""
  //             ) {
  //               localStorage.setItem("isCarryForward", isCarryForward2);
  //             }

  //             if (
  //               submissionId2 !== undefined &&
  //               submissionId2 !== null &&
  //               submissionId2 !== ""
  //             ) {
  //               localStorage.setItem("submissionId", submissionId2);
  //             }

  //             if (score2 !== undefined && score2 !== null && score2 !== "") {
  //               localStorage.setItem("score", score2);
  //             }

  //             if (questionid !== "" && questionid !== undefined) {
  //               this.props.history.replace(
  //                 `/assessmentDetails/scoring_test/${invitationId_view}/view?questionid=${questionid}&assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`
  //               );
  //             } else {
  //               this.props.history.replace(
  //                 `/assessmentDetails/scoring_test/${invitationId_view}/view?assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`
  //               );
  //             }
  //             break;
  //           case "warp-QuestionnaireReport":
  //             this.setState({
  //               commonDialog: {
  //                 isOpened: messageData.data.isOpenedPopup,
  //                 popupTitle: messageData.data.title,
  //                 invitationId: messageData.data.invitationId,
  //               },
  //             });
  //             break;
  //           case "warp-Recommendation-Listing":
  //             this.setState({ loading: true });
  //             setTimeout(() => {
  //               this.setState({ loading: false });
  //             }, 900);
  //             const invitationId_rcmd = messageData.data.invitationId;
  //             const questionnare_rcmd = messageData.data.questionnare;
  //             const period_rcmd = messageData.data.period;
  //             const comapnyName_rcmd = messageData.data.comapnyName;
  //             const deviationCount = messageData.data.deviationCount;
  //             const isCarryForward = messageData.data.isCarryForward;
  //             const submissionId = messageData.data.submissionId;
  //             const score = messageData.data.score;
  //             const firstName = localStorage.firstName;
  //             //localStorage.setItem("isRecommendationIcon", true);
  //             this.props.viewRecommendationsOpen(true);

  //             if (
  //               questionnare_rcmd !== undefined &&
  //               questionnare_rcmd !== null &&
  //               questionnare_rcmd !== ""
  //             ) {
  //               localStorage.setItem("assessmentFormName2", questionnare_rcmd);
  //             }

  //             if (
  //               period_rcmd !== undefined &&
  //               period_rcmd !== null &&
  //               period_rcmd !== ""
  //             ) {
  //               localStorage.setItem("period", period_rcmd);
  //             }

  //             if (
  //               comapnyName_rcmd !== undefined &&
  //               comapnyName_rcmd !== null &&
  //               comapnyName_rcmd !== ""
  //             ) {
  //               localStorage.setItem("comapnyName2", comapnyName_rcmd);
  //             }

  //             if (
  //               deviationCount !== undefined &&
  //               deviationCount !== "" &&
  //               deviationCount !== "null"
  //             ) {
  //               localStorage.setItem("deviationCount", deviationCount);
  //             } else {
  //               localStorage.setItem("deviationCount", 0);
  //             }

  //             if (
  //               isCarryForward !== undefined &&
  //               isCarryForward !== null &&
  //               isCarryForward !== ""
  //             ) {
  //               localStorage.setItem("isCarryForward", isCarryForward);
  //             }

  //             if (
  //               submissionId !== undefined &&
  //               submissionId !== null &&
  //               submissionId !== ""
  //             ) {
  //               localStorage.setItem("submissionId", submissionId);
  //             }

  //             if (score !== undefined && score !== null && score !== "") {
  //               localStorage.setItem("score", score);
  //             }

  //             let url = "";
  //             url = `/assessmentrecommendation/${invitationId_rcmd}/${questionnare_rcmd}/${period_rcmd}/${comapnyName_rcmd}/${deviationCount}/${isCarryForward}/${submissionId}/${score}/${firstName}`;
  //             //url = `/assessmentrecommendation/${invitationId_rcmd}/${questionnare_rcmd}/${period_rcmd}/${comapnyName_rcmd}`;
  //             //window.location.href = url;
  //             this.props.history.replace(url);
  //             break;
  //           case "Progress-Report-Message":
  //             this.setState({
  //               progressReport: {
  //                 isOpened: true,
  //                 popupTitle: "Progress Report Till Date",
  //                 invitationId: messageData.data.invitationId,
  //                 questionnare: messageData.data.questionnare,
  //                 period: messageData.data.period,
  //                 comapnyName: messageData.data.comapnyName,
  //                 submissionId: messageData.data.submissionId,
  //                 deviationCount: messageData.data.deviationCount,
  //                 isCarryForward: messageData.data.isCarryForward,
  //               },
  //             });
  //             this.getDashboardUrl();
  //             break;
  //           case "warp-DeviationReport":
  //             this.setState({
  //               deviationReport: {
  //                 isOpened: true,
  //                 popupTitle: messageData.data.title,
  //                 invitationId: messageData.data.invitationId,
  //                 deviationCount: messageData.data.deviationCount,
  //                 questionnare: messageData.data.questionnare,
  //                 period: messageData.data.period,
  //                 comapnyName: messageData.data.comapnyName,
  //               },
  //             });
  //             break;

  //           case "warp-new-invitation-started-New":
  //             this.setState({ loading: true });
  //             this.props.isOpen(true);
  //             break;
  //           case "warp-new-invitation-started-Report":
  //             debugger;
  //             this.setState({
  //               startReportDialog: {
  //                 isOpened: messageData.data.isOpenedPopup,
  //                 formType: messageData.data.formType,
  //               },
  //             });
  //           case "go-to-document-repository":
  //             // const currentPath = window.location.pathname;
  //             // const resolvedSource = messageData.data.formType

  //             // setLastNavigation(
  //             //   resolvedSource,
  //             //   currentPath,
  //             //   (this.props.location && this.props.location.state) || ""
  //             // );
  //             // this.props.history.push("/document-repository");
  //             WarpNavigator.navigateToDocumentRepository(
  //               this.props.history,
  //               messageData.data.formType,
  //               messageData.data.context
  //               // messageData.data.invitationId,
  //               // AIActions.uploadDocuments,
  //               // messageData.data.assessmentFormName,
  //               // messageData.data.comapnyName
  //             );
  //             break;
  //           case "go-to-upload-docs":
  //             WarpNavigator.navigateToFileUpload(
  //               this.props.history,
  //               messageData.data.invitationId,
  //               // AIActions.uploadDocuments,
  //               messageData.data.assessmentFormName,
  //               messageData.data.comapnyName
  //             );
  //             break;
  //           case "validate-recaptcha":
  //             const isCaptchaValid = await captchaValidation(this.context);
  //             if (isCaptchaValid) {
  //               let iFrame = document.getElementById(messageData.data.iframeId);
  //               iFrame.contentWindow.postMessage(
  //                 JSON.stringify({
  //                   type: "reCaptchaValidation",
  //                 }),
  //                 "*"
  //               );
  //             } else {
  //               alert("Captcha verification failed. Please try again.");
  //             }
  //             break;
  //           default:
  //             break;
  //         }
  //       } catch (error) {}
  //     }
  //   }
  // };

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
  }

  // componentWillUnmount() {
  //   window.removeEventListener("message", this.newHandle);
  // }

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
    let WARP_Link = GetWARPUrl();
    debugger
    isAssessmentPage = window.location.pathname.includes("/assessments")
      ? FormTypesPage.Assessments
      : FormTypesPage.Reports;
    const { classes, location } = this.props;
    const { assessmentFormName } = this.state;
  
    //} else if (getUserPermision(permissions, PageKeys.Assessments) === null) {
    // return <Redirect to="/not-found" />;
    // }
   
    return (
                   <iframe
                    allow
                    title=" "
                    id="listIframe"
                    src={isAssessmentPage === FormTypesPage.Assessments ? WARP_Link +"temp/blank-assessment-lock-actions/assessments" : WARP_Link +"temp/blank-assessment-lock-actions/reports"}
                    allowFullScreen
                    frameBorder="0"
                    style={{ width: "100%", paddingBottom: "20px", minHeight: "660px" }}
                    // height={(isAssessmentPage === 'reports' || isAssessmentPage === 'assessments') ? "720px" : this.state.iframeHeight}
                    loading="eager"
                  />
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
  )(withStyles(styles, { withTheme: true })(AssessmentsLock))
);
