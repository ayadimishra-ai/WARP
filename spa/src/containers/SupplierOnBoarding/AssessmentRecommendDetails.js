import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Slide,
  withStyles,
} from "@material-ui/core";
import { unstable_Box as Box } from "@material-ui/core/Box";
import CloseIcon from "@material-ui/icons/Close";
import axios from "axios";
import React, { Component } from "react";
import Button from "../../components/Material/CustomButtons/Button";
import { getServiceUrl, getUserPermision, GetWARPUrl } from "../../config";
import * as PageKeys from "../../pagekeys";
import { popupAlert } from "../../UI/Popups/popup";
import {
  BreadCrumb,
  getCompanyInvitationDetail,
  setHeaderHeading,
} from "../../utility";
import { WarpNavigator } from "../../warp/warp.service";
import history from "../../history";
import jwt from "jsonwebtoken";
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import { Redirect, withRouter } from "react-router-dom";
import { set_sub_heading } from "../../store/actions/subheadings";
import {
  QueryButtonQwcOpen,
  QueryButtonShow,
  questionWithQuery,
  updateCount,
  updateIframe,
  UpdateQuestionsWithComments,
  updateTitle,
} from "../../store/actions/questionWithQueries";
import { connect } from "react-redux";
import {
  viewRecommendationsOpen,
  viewRecommendationsUrl,
} from "../../store/actions/viewRecommedations";
import { FormTypesPage } from "../../warp/warp.constant";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
const WARP_Link = GetWARPUrl();
let messageData = "";
var divOffsetTop = 0,
  divOffsetLeft = 0,
  divOffsetBottom = 0;
let startPageKey = "";
// let isPagerefreshed = false;
// let QuestionswithComments = "Q";
const drawerWidth = 393;
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
  ml10: {
    marginLeft: "10px !important",
  },
});
class AssessmentRecommendDetails extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.newHandle = this.newHandle.bind(this);
    this.state = {
      loading: true,
      message: "",
      FormSrc: "",
      assessmentFormName: "Assessments",
      comapnyName: "",
      iframeHeight: 60,
      thirdPartyCookieEnabled: false,
      queryOpen: false,
      IsShowCommentList: false,
      isPagerefreshed: false,
      ReopenAssessment: null,
      commonDialog: { isOpened: false },
      isFormField: false,
      formFieldId: "",
      formField: {},
      totalQuestionWithComment: 0,
      formfieldcommentscount: 0,
      totalCommentButton: 0,
      questionId: "",
      qwcopen: false,
      formfieldcommentsClose: false,
      iframeloader: true,
      iframeloader2: true,
      warpRole: "",
      userRole: "",
      isSelectedFromPopup: false,
      companyFormInvitationDetail: [],
      popupIframeHeight: 0,
      allowMultiple: false,
      acceptFiles: "*/*",
      popupTitle: "",
      isFileField: false,
      filesForPopup: [],
      iframeloader3: true,
    };
  }
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
  newHandle = async (type, event) => {
    const URL = window.location.href;

    if (type === "popstate") {
      startPageKey = "popstate";
      this.props.history.length = this.props.history.length - 1;
    }
    if (
      type === "message" &&
      URL.includes("/AssessmentRecommendationDetails/") === true
    ) {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          console.log("AssessmentRecommendationDetails", type);
          switch (type) {
            case "warp-popupIframeContent-resize":
              this.setState({ popupIframeHeight: messageData.data.height })
              break;
            case "warp-content-resize":
              if (
                this.state.iframeHeight !== messageData.data.height &&
                this.state.commonDialog.isOpened === false &&
                this.state.queryOpen === false
              ) {
                this.setState({ iframeHeight: messageData.data.height + 140 });
              }
              break;
            case "warp-new-invitation-cancel":
              if (this.state.open === true) {
                this.setState({ open: false });
              } else {
                this.setState({ open: true });
              }
              break;
            case "warp-new-invitation-started":
              this.setState({ loading: true });
              break;
            case "warp-new-invitation-finished":
              if (messageData.data.isSuccess === true) {
                document.getElementById(
                  "listIframe"
                ).src = document.getElementById("listIframe").src;
                this.setState({ loading: false, open: false });
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
            case "warp-new-question-assigned-finished":
              if (messageData.data.isSuccess === true) {
                popupAlert(
                  "success",
                  "Success",
                  "Question assigned successfully"
                );
              } else {
                popupAlert("error", "Error", "Something went wrong.");
              }
              break;
            case "warp-refresh-question":
              let questionId_isRefreshPage = "";
              if (
                messageData.data.questionId !== "" &&
                messageData.data.questionId !== undefined
              ) {
                questionId_isRefreshPage = messageData.data.questionId;
              }
              //const CurrentparamsRefresh = new URLSearchParams(window.location.search)
              //const params_newRefresh = CurrentparamsRefresh.get("questionid");
              let iFrame = document.getElementById("listIframe1");
              iFrame.contentWindow.postMessage(
                JSON.stringify({
                  type: "snowkap-isRefreshPage",
                  questionId: questionId_isRefreshPage,
                  //commentcount: this.state.formfieldcommentscount,
                  invitationId: this.props.match.params.warpInvitationId,
                }),
                "*"
              );
              var iframe = document.getElementById("listIframe1");
              iframe.src = iframe.src;
              this.setState({ queryOpen: false });
              break;
            case "warp-refresh-question-after-comment":
              let questionId_Comment = "";
              if (
                messageData.data.questionId !== "" &&
                messageData.data.questionId !== undefined
              ) {
                questionId_Comment = messageData.data.questionId;
              }
              let iFrameComment = document.getElementById("listIframe1");
              iFrameComment.contentWindow.postMessage(
                JSON.stringify({
                  type: "snowkap-isRefreshPage",
                  questionId: questionId_Comment,
                  invitationId: this.props.match.params.warpInvitationId,
                }),
                "*"
              );
              var iframeCommentRecomm = document.getElementById("listIframe1");
              iframeCommentRecomm.src = iframeCommentRecomm.src;
              break;
            case "warp-show-recommendation-button":
              // localStorage.setItem("isRecommendationIcon",
              //   messageData.data.isRecommendationIcon
              // );
              this.props.viewRecommendationsOpen(
                messageData.data.isRecommendationIcon
              );
              break;
            case "warp-approved-successfully":
              popupAlert("success", "Success", "Approved Successfully.");
              break;
            case "warp-new-invitation-validation-failed":
              this.setState({ loading: false });
              break;
            case "warp-invitation-form-question-redirect":
              this.props.questionWithQuery({
                commonDialog: {
                  isOpened: false,
                  height: 400,
                },
              });
              this.props.UpdateQuestionsWithComments("Q");
              this.props.QueryButtonQwcOpen(false);
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 900);
              const invitationId_question_redirect =
                messageData.data.invitationId;
              let questionId_new = "";
              if (
                messageData.data.questionId !== "" &&
                messageData.data.questionId !== undefined
              ) {
                questionId_new = messageData.data.questionId;
              }
              let AssessmentFormName_new = this.state.assessmentFormName;
              let comapnyName_new = this.state.comapnyName;
              const CurrentparamsRedirect = new URLSearchParams(
                window.location.search
              );
              const params_assessmentnameRedirect = CurrentparamsRedirect.get(
                "assessmentname"
              );
              const params_companynameRedirect = CurrentparamsRedirect.get(
                "companyname"
              );
              if (
                this.props.location.state !== undefined &&
                this.props.location.state !== null
              ) {
                //AssessmentFormName_new = this.props.location.state.assessmentFormName;
                AssessmentFormName_new = params_assessmentnameRedirect;
                comapnyName_new = params_companynameRedirect;
                this.setState({
                  assessmentFormName: AssessmentFormName_new,
                  comapnyName: comapnyName_new,
                });
              } else {
                AssessmentFormName_new = params_assessmentnameRedirect;
                comapnyName_new = params_companynameRedirect;
                this.setState({
                  assessmentFormName: AssessmentFormName_new,
                  comapnyName: comapnyName_new,
                });
              }
              //  console.log({ locationState_start: this.props, AssessmentFormName_new, StartKey: this.props.location.state.startKey });
              let formmode = "start";
              if (
                JSON.parse(localStorage.userType) ===
                RoleCodes.VENTURECAPITALIST
              ) {
                if (this.state.warpRole === "Invitee") {
                  formmode = this.props.match.params.stepName;
                } else {
                  formmode = "view";
                }
              } else {
                formmode = this.props.match.params.stepName;
              }
              if (questionId_new !== "" && questionId_new !== undefined) {
                // window.location.href = `/AssessmentRecommendationDetails/scoring_test/${invitationId_question_redirect}/${formmode}?questionid=${questionId_new}&assessmentname=${AssessmentFormName_new}&companyname=${comapnyName_new}`;
                this.props.history.push(
                  `/AssessmentRecommendationDetails/scoring_test/${invitationId_question_redirect}/${formmode}?questionid=${questionId_new}&assessmentname=${AssessmentFormName_new}&companyname=${comapnyName_new}`
                );
                let iFrame2 = document.getElementById("listIframe1");
                iFrame2.src = iFrame2.src;
              } else {
                // window.location.href = `/AssessmentRecommendationDetails/scoring_test/${invitationId_question_redirect}/${formmode}?assessmentname=${AssessmentFormName_new}&companyname=${comapnyName_new}`;
                this.props.history.push(
                  `/AssessmentRecommendationDetails/scoring_test/${invitationId_question_redirect}/${formmode}?assessmentname=${AssessmentFormName_new}&companyname=${comapnyName_new}`
                );
                let iFrame2 = document.getElementById("listIframe1");
                iFrame2.src = iFrame2.src;
              }
              break;
            case "warp-invitation-form-submit":
              popupAlert(
                "success",
                "Success",
                "Assessment form submitted successfully"
              );
              WarpNavigator.navigateToListingPage(
                this.props.history,
                messageData.data.formType
              );
              break;
            case "warp-prevNextClick":
              window.scroll({
                top: 0,
                left: 0,
                behavior: "smooth",
              });
              const Currentparams = new URLSearchParams(window.location.search);
              const params_new = Currentparams.get("questionid");
              const params_assessmentname = Currentparams.get("assessmentname");
              const params_companyname = Currentparams.get("companyname");
              let questionId1 = "";
              if (
                messageData.questionId !== "" &&
                messageData.questionId !== undefined
              ) {
                questionId1 = messageData.questionId;
                if (
                  params_new !== questionId1 &&
                  this.state.isPagerefreshed === false
                ) {
                  let AssessmentFormName1 = this.state.assessmentFormName;
                  let comapnyName1 = this.state.comapnyName;
                  if (
                    this.props.location.state !== undefined &&
                    this.props.location.state !== null
                  ) {
                    AssessmentFormName1 = this.props.location.state
                      .assessmentFormName;
                    AssessmentFormName1 = AssessmentFormName1.replace(
                      "&",
                      ";amp;"
                    );
                    comapnyName1 = this.props.location.state.comapnyName;
                    this.setState({
                      assessmentFormName: AssessmentFormName1,
                      comapnyName: comapnyName1,
                    });
                  } else {
                    AssessmentFormName1 = params_assessmentname;
                    comapnyName1 = params_companyname;
                    this.setState({
                      assessmentFormName: AssessmentFormName1,
                      comapnyName: comapnyName1,
                    });
                  }
                  if (!this.props.history) return;
                  let url = "";
                  if (this.props.match.params.stepName === "intro") return;
                  if (questionId1 !== "" && questionId1 !== undefined) {
                    let FormSrclink = window.location.href;
                    // form mode changes
                    if (
                      FormSrclink.includes("start") &&
                      this.props.match.params.stepName === "start"
                    ) {
                      url = `/AssessmentRecommendationDetails/scoring_test/${
                        this.props.match.params.warpInvitationId
                      }/${
                        this.props.match.params.stepName
                      }?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                    } else if (FormSrclink.includes("viewrecommendation")) {
                      url = `/AssessmentRecommendationDetails/scoring_test/${
                        this.props.match.params.warpInvitationId
                      }/${
                        this.props.match.params.stepName
                      }?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                    } else {
                      url = `/AssessmentRecommendationDetails/scoring_test/${
                        this.props.match.params.warpInvitationId
                      }/view?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                    }
                  } else {
                    url = `/AssessmentRecommendationDetails/scoring_test/${
                      this.props.match.params.warpInvitationId
                    }/${
                      this.props.match.params.stepName
                    }?assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                  }
                  if (
                    localStorage.warpToken !== undefined &&
                    localStorage.warpToken !== null &&
                    localStorage.warpToken !== ""
                  ) {
                    const decodedToken = jwt.decode(localStorage.warpToken);
                    const warpUserCompanyId =
                      decodedToken["https://hasura.io/jwt/claims"][
                        "x-hasura-company-id"
                      ];
                    const userId =
                      decodedToken["https://hasura.io/jwt/claims"][
                        "x-hasura-user-id"
                      ];
                    let invitationDetail = await getCompanyInvitationDetail(
                      warpUserCompanyId,
                      userId,
                      this.props.match.params.warpInvitationId
                    );
                    if (invitationDetail != undefined) {
                      this.setState({
                        companyFormInvitationDetail: invitationDetail,
                      });
                      this.setHeading(invitationDetail);
                    }
                  }
                  history.push(url);
                } else if (this.state.isPagerefreshed === true) {
                  const Currentparams = new URLSearchParams(
                    window.location.search
                  );
                  const params_new = Currentparams.get("questionid");
                  this.setState({ isPagerefreshed: false });
                  let iFrame = document.getElementById("listIframe1");
                  iFrame.contentWindow.postMessage(
                    JSON.stringify({
                      type: "snowkap-isRefreshPage",
                      questionId: params_new,
                    }),
                    "*"
                  );
                }
              }
              break;
            case "warp-invitation-form-cancel":
              popupAlert(
                "confirmPopup",
                "Confirm",
                "Are you sure you want to leave this page?",
                () => {
                  WarpNavigator.navigateToInvitationListingPage(
                    this.props.history
                  );
                  this.setState({ loading: true });
                  setTimeout(() => {
                    this.setState({ loading: false });
                  }, 900);
                },
                "No",
                "Yes"
              );
              break;
            case "warp-prevListingPageredirect":
              WarpNavigator.navigateToListingPage(
                this.props.history,
                messageData.data.formType
              );
              break;
            case "warp-invitation-form-validation-failed":
              const error_message = messageData.data.message;
              this.setState({ loading: false });
              popupAlert("error", "Error", error_message);
              break;
            case "warp-ShowHide-CommentList":
              const message = messageData.data;
              this.setState({
                /* IsShowCommentList: message*/ totalQuestionWithComment:
                  message.totalQuestions,
                totalCommentButton: message.totalCommentButton,
              });
              // let count =
              //   message.totalQuestions > 9
              //     ? message.totalQuestions
              //     : "0" + message.totalQuestions;
              // QuestionswithComments = "Questions with Queries(" + count + ")";
              // this.setState({
              //   commonDialog: {
              //     height: 400,
              //     isOpened: true,
              //     popupTitle: QuestionswithComments,
              //   },
              // });
              // this.props.updateTitle(QuestionswithComments);
              // this.props.updateCount(message.totalQuestions);
              // this.props.QueryButtonShow(true);
              if (this.props.popupTitle === this.props.QuestionswithComments) {
                let count =
                  message.totalQuestions > 9
                    ? message.totalQuestions
                    : "0" + message.totalQuestions;
                this.props.UpdateQuestionsWithComments(
                  "Questions with Queries(" + count + ")"
                );
                this.props.questionWithQuery({
                  commonDialog: {
                    isOpened: true,
                    height: 400,
                  },
                });
                this.props.updateTitle(this.props.QuestionswithComments);
              }
              this.props.updateCount(message.totalQuestions);
              this.props.QueryButtonShow(true);
              break;
            case "warp-ClosePopup":
              const closepopupmessage = messageData.data.isClose;
              this.setState({ queryOpen: closepopupmessage });
              break;
            case "warp-Reopen-Assessment":
              const warpReopenmessage = messageData.data;
              if (
                warpReopenmessage !== null &&
                warpReopenmessage !== undefined &&
                warpReopenmessage.closePopUp &&
                warpReopenmessage.isShowComment &&
                warpReopenmessage.showSuccessMessage
              ) {
                this.handleClose();
                let IsEditComment = this.state.IsShowCommentList.IsEditComment;
                let objIsShowCommentList = {
                  IsShow: false,
                  IsShowComment: true,
                  IsEditComment: IsEditComment,
                };
                this.setState({ IsShowCommentList: objIsShowCommentList });
                popupAlert(
                  "success",
                  "Success",
                  "Assessment reopened successfully"
                );
              }
              break;
            case "warp-AssignQuestion":
              this.setState({
                iframeloader: false,
                iframeloader2: false,
                commonDialog: {
                  height: 250,
                  isOpened: messageData.data.isOpenedPopup,
                  popupTitle: messageData.data.title,
                  formId: messageData.data.formDetails.formId,
                  invitationId: messageData.data.formDetails.invitationId,
                  questionId: messageData.data.formDetails.questionId,
                  SubmissionId: messageData.data.formDetails.SubmissionId,
                },
              });
              break;
            case "warp-QuestionnaireReport":
              /*console.log(messageData.data)*/
              this.setState({
                commonDialog: {
                  isOpened: true,
                  popupTitle: messageData.data.title,
                },
              });
              break;
            case "warp-show-comments":
              let objIsShowCommentList = {
                IsShow: false,
                IsShowComment: true,
                IsEditComment: false,
              };
              setTimeout(() => {
                this.setState({ iframeloader: false });
              }, 900);
              this.setState({
                iframeloader: true,
                isFormField: messageData.data.isFormField,
                formFieldId: messageData.data.formFieldId,
                queryOpen: true,
                IsShowCommentList: objIsShowCommentList,
                formfieldcommentscount: messageData.data.formfieldcommentscount,
                questionId: messageData.data.questionId,
                commonDialog: { isOpened: false },
                loading: true
              });
              this.props.questionWithQuery({
                commonDialog: { isOpened: false },
              });
              break;
            case "send-comments-buttoncount":
              this.setState({
                formfieldcommentscount: messageData.data.formfieldcommentscount,
                formfieldcommentsClose: true,
              });
              break;
            case "warp-page-reload":
              WarpNavigator.navigateToInvitationListingPage(this.props.history);
              break;
            case "warp-Add-Recommendation":
              this.setState({
                loading: this.state.commonDialog.isOpened ? false : true,
                commonDialog: {
                  isOpened: messageData.data.isOpenedPopup,
                  popupTitle: messageData.data.title,
                  formDetails: messageData.data.formDetails,
                },
              });
              if (messageData.data.isSubmit) {
                popupAlert(
                  "success",
                  "Success",
                  "Recommendation added successfully"
                );
                this.setState({
                  loading: true,
                });
                let IFrame = document.getElementById("listIframe1");
                // IFrame.contentWindow.postMessage(
                //     JSON.stringify({
                //         type: "snowkap-isRefreshPage",
                //         questionId: messageData.data.formDetails.questionId,
                //         commentcount: 0,
                //         invitationId: this.props.match.params.warpInvitationId,
                //     }),
                //     "*"
                // );
                var iframeAddRecomm = document.getElementById("listIframe1");
                iframeAddRecomm.src = iframeAddRecomm.src;
              }
              break;
            case "warp-Recommendation-Approved":
              if (messageData.data.isSubmit) {
                popupAlert(
                  "success",
                  "Success",
                  "Recommendation approved successfully"
                );
              }
              break;
            case "warp-warninmessage":
              console.log("warp-warninmessage", messageData.data);
              const warning_message = messageData.data.message;
              const step = messageData.data.step;
              this.setState({ loading: false });
              popupAlert(
                "confirmPopup",
                "Confirm",
                warning_message,
                () => {
                  let iFrame = document.getElementById("listIframe1");
                  iFrame.contentWindow.postMessage(
                    JSON.stringify({
                      type: "snowkap-warningmessage",
                      response: true,
                      step: step,
                    }),
                    "*"
                  );
                },
                "I want to review",
                "I am fine with the entered values"
              );
              break;
            case "document-validation-alert":
              console.log("document-validation-alert", messageData.data);
              const buttonName = messageData.data.step;
              const activeTab = messageData.data.nextActivetabId;
              popupAlert(
                messageData.data.type,
                messageData.data.heading,
                messageData.data.message,
                () => {
                  let iFrame = document.getElementById("listIframe1");
                  iFrame.contentWindow.postMessage(
                    JSON.stringify({
                      type: "snowkap-warningmessage",
                      response: true,
                      step: buttonName,
                      nextActivetabId: activeTab,
                    }),
                    "*"
                  );
                },
                "Cancel",
                "OK",
                () => {
                  let iFrame = document.getElementById("listIframe1");
                  iFrame.contentWindow.postMessage(
                    JSON.stringify({
                      type: "snowkap-warningmessage",
                      response: false,
                      step: buttonName,
                      nextActivetabId: activeTab,
                    }),
                    "*"
                  );
                }
              );
              break;
            case "rara-get-token-details":
              let iFrame_1 = document.getElementById("listIframe1");
              iFrame_1.contentWindow.postMessage(
                JSON.stringify({
                  type: "snowkap-tokendetails",
                  token: localStorage.getItem("tokenId"),
                  serviceurl: getServiceUrl(),
                }),
                "*"
              );
              break;
            case "close-main-loader":
              this.setState({ loading: false });
              break;
              case "suggestions_file_uploads_popup":
            this.setState(
              {
                popupTitle: messageData.data.popupTitle,
                formField: messageData.data.formField,
                formFieldId: messageData.data.formFieldId,
                selectedSuggestionId: messageData.data.selectedId,
                allowMultiple: messageData.data.allowMultiple,
                isFileField: true, // Ensure this opens the "Uploaded Documents" dialog
                commonDialog: {
                  isOpened: true,
                  popupTitle: messageData.data.popupTitle,
                  dialogType: "upload-documents",
                },
                iframeloader3: true,
                questionId: messageData.data.questionId,
                filesForPopup: messageData.data.filesForPopup || [],
              },
              () => {
                this.postFilesForPopup();
              }
            );
            break;
          case "close-upload-document-popup":
            this.setState({
              commonDialog: {
                isOpened: false,
              },
            });
            break;
            case "validate-recaptcha":
              const isCaptchaValid = await captchaValidation(this.context);
              if (isCaptchaValid) {
                let iFrame = document.getElementById(messageData.data.iframeId);
                iFrame.contentWindow.postMessage(
                  JSON.stringify({
                    type: "reCaptchaValidation",
                  }),
                  "*"
                );
              } else {
                alert("Captcha verification failed. Please try again.");
              }
              break;
            default:
              break;
          }
        } catch (error) {}
      }
    }
  };
  async componentDidMount() {
    this.props.UpdateQuestionsWithComments("Q");
    window.onload = () => {
      this.setState({ isPagerefreshed: true });
      this.props.questionWithQuery({
        commonDialog: {
          isOpened: false,
        },
      });
    };
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
      this.setState({
        warpRole: token["https://hasura.io/jwt/claims"]["x-hasura-role"],
      });
      const tokendate = new Date(0);
      tokendate.setUTCSeconds(token.exp);
      const tokendateiat = new Date(0);
      tokendateiat.setUTCSeconds(token.iat);
      if (todaydate > tokendate) {
        return <Redirect to="/logout" />;
      }
    }
    if (
      localStorage.warpToken === undefined &&
      localStorage.warpToken === "null"
    ) {
      this.GetAuthToken();
    }
    if (
      localStorage.warpToken !== undefined &&
      localStorage.warpToken !== null &&
      localStorage.warpToken !== ""
    ) {
      const decodedToken = jwt.decode(localStorage.warpToken);
      const warpUserCompanyId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
      const role =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-role"];
      const userId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"];
      let invitationDetail = await getCompanyInvitationDetail(
        warpUserCompanyId,
        userId,
        this.props.match.params.warpInvitationId
      );
      this.setState({ isAPIHitted: true });
      if (invitationDetail != undefined) {
        this.setState({
          companyFormInvitationDetail: invitationDetail,
          userRole: role,
        });
      }
    }
    window.addEventListener("popstate", (event) =>
      this.newHandle("popstate", event)
    );
    window.addEventListener("message", (event) =>
      this.newHandle("message", event)
    );
  }
  componentWillUnmount() {
    console.log("componentWillUnmount AssessmentRecommendationDetails");
    window.removeEventListener("popstate", this.newHandle);
    window.removeEventListener("message", this.newHandle);
    this.props.QueryButtonShow(false);
  }
  componentDidUpdate() {
    if (
      this.state.companyFormInvitationDetail.length > 0 &&
      this.state.isAPIHitted == true
    ) {
      this.setHeading(this.state.companyFormInvitationDetail);
      this.setState({ isAPIHitted: false });
    }
  }
  setHeading() {
    let headingData = setHeaderHeading(
      this.state.companyFormInvitationDetail,
      this.state.userRole
    );
    console.log(headingData, "headingData");
    this.props.set_sub_heading(headingData);
  }
    //Send selected files
  postFilesForPopup = () => {
    try {
      const payload = {
        type: "send-selected-files-for-popup",
        filesForPopup: this.state.filesForPopup || [],
      };

      // prefer to target WARP origin instead of "*" when possible
      let targetOrigin = "*";
      try {
        targetOrigin = new URL(WARP_Link).origin;
      } catch (e) {
        // keep "*" as fallback
      }

      let attempts = 0;
      const maxAttempts = 3;
      const intervalMs = 200;
      let timer = null;

      const tryPost = () => {
        attempts++;
        const uploadFilesPopup = document.getElementById("listIframe4");
        if (uploadFilesPopup && uploadFilesPopup.contentWindow) {
          try {
            uploadFilesPopup.contentWindow.postMessage(
              JSON.stringify(payload),
              targetOrigin
            );
            console.log("postFilesForPopup: posted to listIframe4");
            if (timer) clearInterval(timer);
            return;
          } catch (err) {
            console.warn("postFilesForPopup: postMessage failed", err);
          }
        }
        if (attempts >= maxAttempts) {
          if (timer) clearInterval(timer);
          console.warn(
            "postFilesForPopup: iframe not available after attempts, giving up"
          );
        }
      };

      // immediate attempt + interval retries
      tryPost();
      timer = setInterval(tryPost, intervalMs);
    } catch (err) {
      console.error("postFilesForPopup error", err);
    }
  };
    //Send formField object with retry logic
  postFormFieldData = () => {
    try {
      if (!this.state.formField || Object.keys(this.state.formField).length === 0) {
        console.log("postFormFieldData: No formField data to send");
        return;
      }

      const payload = {
        type: "FORM_FIELD_DATA",
        formField: this.state.formField,
      };

      // prefer to target WARP origin instead of "*" when possible
      let targetOrigin = "*";
      try {
        targetOrigin = new URL(WARP_Link).origin;
      } catch (e) {
        // keep "*" as fallback
      }

      let attempts = 0;
      const maxAttempts = 5;
      const intervalMs = 300;
      let timer = null;

      const tryPost = () => {
        attempts++;
        const iframe = document.getElementById("listIframe4");
        if (iframe && iframe.contentWindow) {
          try {
            iframe.contentWindow.postMessage(payload, targetOrigin);
            if (timer) clearInterval(timer);
            return;
          } catch (err) {
            console.warn("postFormFieldData: postMessage failed", err);
          }
        }
        if (attempts >= maxAttempts) {
          if (timer) clearInterval(timer);
          console.warn(
            "postFormFieldData: iframe not available after attempts, giving up"
          );
        }
      };

      // immediate attempt + interval retries
      tryPost();
      timer = setInterval(tryPost, intervalMs);
    } catch (err) {
      console.error("postFormFieldData error", err);
    }
  };
  handleClickOpen = () => {
    this.setState({ queryOpen: true });
  };
  handleClose = () => {
    this.setState({ queryOpen: false });
    if (this.props.QwcOpen === true) {
      this.props.updateTitle(this.props.QuestionswithComments);
      this.props.questionWithQuery({
        commonDialog: {
          isOpened: true,
          height: 400,
        },
      });
    }
  };
  iframeUrl = (warpInvitationId, stepName) => {
    return (
      WARP_Link +
      "embed/form/invitation/" +
      warpInvitationId +
      "/" +
      stepName +
      "?accessToken=" +
      (localStorage.getItem("warpToken") || "")
    );
  };
  showHeadingData = (url) => {
    let commentButton = "";
    //let totalQuestionWithCommentBtn = "";
    //let recommendationIcon = "";
    if (
      this.state.totalCommentButton === 0 &&
      this.state.IsShowCommentList.IsShow === true &&
      this.state.IsShowCommentList.isAllowAssignQuestion === false
    ) {
      commentButton = (
        <Button
          style={{ margin: 0 }}
          className="secondarydBtn"
          onClick={this.handleClickOpen}
        >
          Reopen Assessment
        </Button>
      );
    }
    // if (this.state.totalQuestionWithComment > 0) {
    //   totalQuestionWithCommentBtn = (
    //     <Button
    //       style={{ margin: 0 }}
    //       className="actionButton"
    //       onClick={() => {
    //         setTimeout(() => {
    //           this.setState({ iframeloader2: false });
    //         }, 600);
    //         let count =
    //           this.state.totalQuestionWithComment > 9
    //             ? this.state.totalQuestionWithComment
    //             : "0" + this.state.totalQuestionWithComment;
    //         QuestionswithComments = "Questions with Queries(" + count + ")";
    //         this.setState({
    //           iframeloader2: true,
    //           commonDialog: {
    //             height: 400,
    //             isOpened: true,
    //             popupTitle: QuestionswithComments,
    //           },
    //           qwcloader: true,
    //           qwcopen: true,
    //         });
    //       }}
    //     >
    //       <p style={{ paddingLeft: "10px" }}>Questions with Queries</p>
    //       <span className="commentCount">
    //         {this.state.totalQuestionWithComment > 9
    //           ? this.state.totalQuestionWithComment
    //           : "0" + this.state.totalQuestionWithComment}
    //       </span>
    //     </Button>
    //   );
    // }
    // if (
    //   !!localStorage.isRecommendationIcon &&
    //   (localStorage.isRecommendationIcon === true ||
    //     localStorage.isRecommendationIcon === "true")
    // ) {
    //   recommendationIcon = (
    //     <Button
    //       style={{ margin: 0 }}
    //       className="actionButton"
    //       onClick={() => this.props.history.push(url)}
    //     >
    //       <p style={{ padding: "10px" }}>View Recommendations</p>
    //     </Button>
    //   );
    // } else if (this.state.isRecommendationIcon === true) {
    //   recommendationIcon = (
    //     <Button
    //       style={{ margin: 0 }}
    //       className="actionButton"
    //       onClick={() => this.props.history.push(url)}
    //     >
    //       <p style={{ padding: "10px" }}>View Recommendations</p>
    //     </Button>
    //   );
    // }
    if (this.props.match.params.stepName !== "intro") {
      return (
        <Box
          style={{ gap: 15, width: "max-content" }}
          display="flex"
          justifyContent="flex-end"
          alignItems="center"
        >
          {commentButton}
          {/* {totalQuestionWithCommentBtn} */}
          {/* {recommendationIcon} */}
        </Box>
      );
    }
    return <></>;
  };
  showHeading = () => {
    let data = "";
    try {
      let url = "";
      if (
        localStorage.assessmentFormName2 !== undefined &&
        localStorage.period !== undefined &&
        localStorage.comapnyName2 !== undefined &&
        localStorage.isCarryForward !== undefined &&
        localStorage.submissionId !== undefined
      ) {
        url = `/assessmentrecommendation/${
          this.props.match.params.warpInvitationId
        }/${localStorage.assessmentFormName2}/${localStorage.period}/${
          localStorage.comapnyName2
        }/${
          localStorage.deviationCount !== undefined
            ? localStorage.deviationCount
            : 0
        }/${
                    localStorage.isCarryForward !== undefined && localStorage.isCarryForward !== ''
                        ? localStorage.isCarryForward
                        : "false"
                }/${localStorage.submissionId}/${
          localStorage.score
        }/${localStorage.firstName}`;
      }
      if (
        this.props.location.state !== undefined &&
        this.props.location.state !== null
      ) {
        if (
          this.props.location.state.assessmentFormName !== undefined &&
          this.props.location.state.assessmentFormName !== null
        ) {
          let AssessmentFormName1 = this.props.location.state
            .assessmentFormName;
          data = (
            <>
              <h4 className="pageHeadingH4">
                {AssessmentFormName1.replace(";amp;", "&") +
                  " - " +
                  this.props.location.state.comapnyName}
              </h4>
            </>
          );
        }
      }
    } catch (error) {
      console.log(error);
    }
    if (data === "") {
      let url = "";
      if (
        localStorage.assessmentFormName2 !== undefined &&
        localStorage.period !== undefined &&
        localStorage.comapnyName2 !== undefined &&
        localStorage.isCarryForward !== undefined &&
        localStorage.submissionId !== undefined &&
        localStorage.firstName !== undefined
      ) {
        url = `/assessmentrecommendation/${
          this.props.match.params.warpInvitationId
        }/${localStorage.assessmentFormName2}/${localStorage.period}/${
          localStorage.comapnyName2
        }/${
          localStorage.deviationCount !== undefined
            ? localStorage.deviationCount
            : "0"
        }/${
                    localStorage.isCarryForward !== undefined && localStorage.isCarryForward !== ''
                        ? localStorage.isCarryForward
                        : "false"
                }/${localStorage.submissionId}/${
          localStorage.score
        }/${localStorage.firstName}`;
        this.props.viewRecommendationsUrl(url);
      }
      const Currentparams = new URLSearchParams(window.location.search);
      const assessmentname =
        Currentparams.size !== 0
          ? Currentparams.get("assessmentname").replace(";amp;", "&")
          : "";
      const companyname =
        Currentparams.size !== 0 ? Currentparams.get("companyname") : "";
      if (
        assessmentname !== null &&
        assessmentname !== "" &&
        assessmentname !== undefined &&
        this.props.match.params.stepName !== "intro"
      ) {
        data = (
          <>
            <h4 className="pageHeadingH4">
              {assessmentname + " - " + companyname}
            </h4>
            {this.showHeadingData(url)}
          </>
        );
      }
    }
    return data;
  };
  handleCommonDialogClose = () => {
    this.setState({ commonDialog: { isOpened: false }, qwcopen: false });
  };
  handleQuestionWithQueriesClose = () => {
    this.props.questionWithQuery({
      commonDialog: {
        isOpened: false,
        height: 400,
      },
    });
    this.props.updateIframe(true);
    this.props.QueryButtonQwcOpen(false);
    this.props.UpdateQuestionsWithComments("Q");
  };
  Transition = React.forwardRef((props, ref) => {
    return <Slide ref={ref} {...props} />;
  });
  render() {
    const permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions.length === 0) {
      return <Redirect to="/logout" />;
    } else if (
      getUserPermision(permissions, PageKeys.Assessments) === null &&
      getUserPermision(permissions, PageKeys.Assessments_reporting) === null
    ) {
      return <Redirect to="/logout" />;
    }
    //changes token expiry
    const breadCrumb = BreadCrumb([
      { pageName: "Home", url: "/Home" },
      { pageName: "Assessments", url: "/assessments" },
      { pageName: "Assessment Details", url: "/scoring_test/" },
    ]);
    let urlparameters = new URLSearchParams(window.location.search);
    let urlparametersquestionId = urlparameters.get("questionid");
    let commenturl =
      WARP_Link +
      "embed/form/invitation/" +
      this.props.match.params.warpInvitationId +
      "/Query/invitationQuery?questionId=" +
      urlparametersquestionId +
      "&accessToken=" +
      localStorage.getItem("warpToken");
    if (this.state.isFormField) {
      commenturl =
        WARP_Link +
        "embed/form/invitation/" +
        this.props.match.params.warpInvitationId +
        "/Query/invitationQuery?formfieldid=" +
        this.state.formFieldId +
        "&questionId=" +
        this.state.questionId +
        "&accessToken=" +
        localStorage.getItem("warpToken");
    }
    return (
      <React.Fragment>
        {this.state.loading ? (
          <div
            id="samletest"
            style={{
              top: divOffsetTop,
              left: divOffsetLeft,
              right: divOffsetLeft,
              bottom: divOffsetBottom,
              zIndex: "9999999",
              position: "fixed",
              background: "rgba(255,255,255,0.7)",
            }}
          >
            <div className="spinner" style={{ top: "200px" }}>
              <div className="double-bounce1" />
              <div className="double-bounce2" />
            </div>
          </div>
        ) : (
          ""
        )}
        <div className="breadtitle_wrap">
          {breadCrumb}
          <div className="page_top_title">
            <div
              className="page_heading"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                width: "100%",
              }}
            >
              {this.showHeading()}
            </div>
          </div>
        </div>
        <div className=" questionairPage">
          <div className="assesment_header">
            <Dialog
              open={this.state.queryOpen}
              onClose={this.handleClose}
              TransitionComponent={this.Transition}
              transitionDuration={900}
              fullWidth={true}
              maxWidth="xl"
              PaperProps={{
                className: "supplierinfo_popupcont raiseQueryQuestioanir_popup",
              }}
              style={{ opacity: this.state.loading ? 0 : 1 }}
            >
              <DialogTitle
                id="scroll-dialog-title"
                className="suppinfopop_heading"
              >
                {this.state.IsShowCommentList.IsShow === true
                  ? "Reopen Assessment"
                  : this.state.IsShowCommentList.IsShowComment === true
                  ? this.state.formfieldcommentscount === 0
                    ? "Add / View Queries"
                    : "All Queries (" +
                      (this.state.formfieldcommentscount > 9
                        ? this.state.formfieldcommentscount
                        : "0" + this.state.formfieldcommentscount) +
                      ")"
                  : this.state.IsShowCommentList.IsEditComment === true
                  ? this.state.formfieldcommentscount === 0
                    ? "Add / View Queries"
                    : "All Queries (" +
                      (this.state.formfieldcommentscount > 9
                        ? this.state.formfieldcommentscount
                        : "0" + this.state.formfieldcommentscount) +
                      ")"
                  : ""}
                <IconButton
                  className="suppinfopop_closebtn"
                  aria-label="close"
                  onClick={() => {
                    this.handleClose();
                    if (this.state.formfieldcommentsClose === true) {
                      this.setState({
                        formfieldcommentsClose: false,
                        loading: true,
                      });
                      let iframe = document.getElementById("listIframe1");
                      iframe.src = iframe.src;
                      if (
                        this.props.popupTitle ===
                        this.props.QuestionswithComments
                      ) {
                        var iframe2 = document.getElementById("listIframe2");
                        iframe2.src = iframe2.src;
                      }
                    }
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </DialogTitle>
              <DialogContent
                className="dialogueContent"
                classes={{ root: "MuiDialogContentRoot" }}
              >
                {this.state.iframeloader ? (
                  <Spinner />
                ) : (
                  <>
                    <iframe
                      title=" "
                      id="listIframe"
                      src={commenturl}
                      allowFullScreen
                      frameBorder="0"
                      onLoad={() => setTimeout(() => { this.setState({ loading: false }) }, 700)}
                      style={{
                        width: "100%",
                        // minHeight: 400,
                        // maxHeight: 500,
                        height: this.state.popupIframeHeight + 5,
                      }}
                      loading="eager"
                    />
                  </>
                )}
              </DialogContent>
            </Dialog>
          </div>
          <iframe
            allow
            title=" "
            id="listIframe1"
            src={this.iframeUrl(
              this.props.match.params.warpInvitationId,
              this.props.match.params.stepName
            )}
            allowFullScreen
            frameBorder="0"
            style={{ width: "100%", minHeight: "550px" }}
            height={this.state.iframeHeight}
            loading="eager"
          />
        </div>
        <Dialog
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.popupTitle === "Assign Question"
          }
          onClose={this.handleCommonDialogClose}
          fullWidth={true}
          TransitionComponent={this.Transition}
          transitionDuration={900}
          maxWidth="md"
          PaperProps={{ className: "supplierinfo_popupcont" }}
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
            {this.state.qwcloader ? <Spinner style={{ minHeight: 100 }} /> : ""}
            <iframe
              id={"assignQuestionIframe"}
              className="customScroll"
              title="assign question"
              height={205}
              width={"100%"}
              frameBorder={0}
              src={
                WARP_Link +
                "embed/NewPopUp/AssignQuestionPopup?formId=" +
                this.state.commonDialog.formId +
                "&invitationId=" +
                this.state.commonDialog.invitationId +
                "&questionId=" +
                this.state.commonDialog.questionId +
                "&SubmissionId=" +
                this.state.commonDialog.SubmissionId +
                "&accessToken=" +
                localStorage.getItem("warpToken")
              }
            />
          </DialogContent>
        </Dialog>
        <Dialog
          // open={
          //   this.state.commonDialog.isOpened &&
          //   this.state.commonDialog.popupTitle === QuestionswithComments
          // }
          open={
            this.props.commentData.commonDialog.isOpened &&
            this.props.popupTitle === this.props.QuestionswithComments
          }
          onClose={this.handleQuestionWithQueriesClose}
          fullWidth={true}
          TransitionComponent={this.Transition}
          transitionDuration={900}
          maxWidth="md"
          PaperProps={{ className: "supplierinfo_popupcont" }}
        >
          <DialogTitle id="scroll-dialog-title" className="suppinfopop_heading">
            {/* {this.state.commonDialog.popupTitle} */}
            {this.props.popupTitle}
            <IconButton
              className="suppinfopop_closebtn"
              aria-label="close"
              onClick={this.handleQuestionWithQueriesClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent className="dialogueContent">
            {this.props.iframeloader2 === true ? (
              <Spinner style={{ minHeight: 400 }} />
            ) : (
              <iframe
                id="listIframe2"
                className="customScroll"
                title="Questions with Comment(s)"
                width={"100%"}
                style={{ minHeight: 400, maxHeight: 500 }}
                frameBorder={0}
                src={
                  WARP_Link +
                  "embed/NewPopUp/CommentWithQuestionPopup?invitationId=" +
                  this.props.match.params.warpInvitationId +
                  "&accessToken=" +
                  localStorage.getItem("warpToken")
                }
              />
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.popupTitle === "Add Recommendation"
          }
          onClose={this.handleCommonDialogClose}
          fullWidth={true}
          TransitionComponent={this.Transition}
          transitionDuration={900}
          maxWidth="md"
          PaperProps={{
            className: "supplierinfo_popupcont_add_recommendation",
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
            {this.state.commonDialog.popupTitle === "Add Recommendation" && (
              <iframe
                id="addRecommendationIframe"
                className="customScroll"
                title="Add Recommendation"
                onLoad={() => setTimeout(() => { this.setState({ loading: false }) }, 700)}
                style={{ height: this.state.popupIframeHeight }}
                width={"100%"}
                frameBorder={0}
                src={
                  WARP_Link +
                  "embed/NewPopUp/AddRecommendationPopup?invitationId=" +
                  this.props.match.params.warpInvitationId +
                  "&formId=" +
                  this.state.commonDialog.formDetails.formId +
                  "&questionId=" +
                  this.state.commonDialog.formDetails.questionId +
                  "&interimAnswerId=" +
                  this.state.commonDialog.formDetails.interimAnswerId +
                  "&answerOption=" +
                  this.state.commonDialog.formDetails.answerOption +
                  "&accessToken=" +
                  localStorage.getItem("warpToken")
                }
              />
            )}
          </DialogContent>
        </Dialog>
        <Dialog
          open={this.state.commonDialog.isOpened && 
                this.state.commonDialog.dialogType === "upload-documents"}
          onClose={this.handleCommonDialogClose}
          fullWidth={true}
          TransitionComponent={this.Transition}
          transitionDuration={900}
          maxWidth="sm"
          PaperProps={{ className: "ai_suggestions_block" }}
        >
          <DialogTitle
            id="scroll-dialog-title"
            className="ai_suggestions_block_heading"
          >
            {this.state.commonDialog.popupTitle}
            <div />
            <IconButton
              className="closebtn"
              aria-label="close"
              onClick={this.handleCommonDialogClose}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent
            className="ai_suggestions_block_content"
            style={{ height: window.innerWidth <= 1366 ? 418 : 492 }}
          >
            {this.state.iframeloader3 && <Spinner style={{ minHeight: 100 }} />}
            <iframe
              id="listIframe4"
              className="customScroll"
              title="Uploaded Documents"
              height="100%"
              width={"100%"}
              frameBorder={0}
              src={
                WARP_Link +
                "embed/NewPopUp/UploadFilesPopup?invitationId=" +
                this.props.match.params.warpInvitationId +
                "&formFieldId=" +
                this.state.formFieldId +
                (this.state.questionId
                  ? "&questionId=" + this.state.questionId
                  : "") +
                "&allowMultiple=" +
                this.state.allowMultiple
              }
              onLoad={() => {
                console.log("AssessmentDetails: listIframe4 loaded: ", this.state.allowMultiple);
                this.postFilesForPopup();
                this.setState({ iframeloader3: false });
                 // Setup simple click listener for dialog
                const dialog = document.querySelector(".ai_suggestions_block");
                if (dialog) {
                  const handleDialogClick = (e) => {
                    const iframe = document.getElementById("listIframe4");
                    if (iframe && !iframe.contains(e.target)) {
                      iframe.contentWindow.postMessage(
                        {
                          type: "PARENT_CLICK_OUTSIDE",
                        },
                        "*"
                      );
                    }
                  };
 
                  dialog.addEventListener("click", handleDialogClick);
 
                  // Store reference for cleanup
                  this.dialogClickHandler = handleDialogClick;
                  this.dialogElement = dialog;
                }

                // Send formField object using the new helper with retry logic
                this.postFormFieldData();
              }}
            />
          </DialogContent>
        </Dialog>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => ({
  commentData: state.questionWithQueries.questionWithQueriesData,
  iframeloader2: state.questionWithQueries.iframeloader2,
  count: state.questionWithQueries.count,
  popupTitle: state.questionWithQueries.popupTitle,
  QwcOpen: state.questionWithQueries.QwcOpen,
  QwcLoader: state.questionWithQueries.QwcLoader,
  QuestionswithComments: state.questionWithQueries.QuestionsWithComments,
});
const mapDispatchToProps = {
  questionWithQuery,
  updateCount,
  updateIframe,
  updateTitle,
  viewRecommendationsUrl,
  viewRecommendationsOpen,
  QueryButtonShow,
  QueryButtonQwcOpen,
  UpdateQuestionsWithComments,
  set_sub_heading,
};
export default withStyles(styles, { withTheme: true })(
  withRouter(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(AssessmentRecommendDetails)
  )
);
