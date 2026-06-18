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
import { connect } from "react-redux";
import {
  QueryButtonQwcOpen,
  QueryButtonShow,
  questionWithQuery,
  updateCount,
  updateIframe,
  UpdateQuestionsWithComments,
  updateTitle,
} from "../../store/actions/questionWithQueries";
import {
  viewRecommendationsOpen,
  viewRecommendationsUrl,
} from "../../store/actions/viewRecommedations";
import { set_sub_heading } from "../../store/actions/subheadings";
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

class AssessmentDetails extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
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
      // qwcopen: false,
      formfieldcommentsClose: false,
      iframeloader: true,
      iframeloader2: true,
      iframeloader3: true,
      warpRole: "",
      companyFormInvitationDetail: [],
      selectedSuggestionId: "",
      aiSuggestionTitle: "",
      aiSuggestionMessage: "",
      allSuggestions: "",
      isHTMLSuggestion: false,
      isFile: false,
      isAPIHitted: false,
      userRole: "",
      isSelectedFromPopup: false,
      popupIframeHeight: 0,
      allowMultiple: false,
      acceptFiles: "*/*",
      popupTitle: "",
      isFileField: false,
      filesForPopup: [],
      isExpiredDocumentfound: false,
      assignReviewerDetails: {formId: "", questionId: "", invitationId: "" ,SubmissionId: "",formType: "",page: "detailspage"},
      isreviewer: false,
      enable: false,
      mode: "",
    };
    this.handlePopState = this.handlePopState.bind(this);
    this.handleMessage = this.handleMessage.bind(this);
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

  handlePopState(event) {
    startPageKey = "popstate";
    this.props.history.length = this.props.history.length - 1;
  }

  handleMessage = async (event) => {
    event.preventDefault();
    let dataType = typeof event.data;
    if (dataType === "string") {
      
      try {
        messageData = JSON.parse(event.data);
        const type = messageData.type;
        switch (type) {
          case "warp-popupIframeContent-resize":
            this.setState((prevState) => ({
              popupIframeHeight:
                messageData.data.height || prevState.popupIframeHeight,
            }));
            break;
          case "warp-content-resize":
            if (
              this.state.iframeHeight !== messageData.data.height &&
              !document.querySelector('[role="dialog"]')
            ) {
              this.setState({ iframeHeight: messageData.data.height });
            }
            break;
          case "warp-check-localStorage-access":
            this.setState({
              thirdPartyCookieEnabled: messageData.data.success,
            });
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
                commentcount: this.state.formfieldcommentscount,
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
            // localStorage.setItem(
            //   "isRecommendationIcon",
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
          case "warp-invitation-form-start":
            this.setState({ loading: true });
            setTimeout(() => {
              this.setState({ loading: false });
            }, 900);
            const invitationId_start = messageData.data.invitationId;
            let questionId = "";
            if (
              messageData.data.questionId !== "" &&
              messageData.data.questionId !== undefined
            ) {
              questionId = messageData.data.questionId;
            }
            let AssessmentFormName = this.state.assessmentFormName;
            let comapnyName = this.state.comapnyName;
            if (
              this.props.location.state !== undefined &&
              this.props.location.state !== null
            ) {
              AssessmentFormName = this.props.location.state.assessmentFormName;
              AssessmentFormName = AssessmentFormName.replace("&", ";amp;");
              comapnyName = this.props.location.state.comapnyName;
              this.setState({
                assessmentFormName: AssessmentFormName,
                comapnyName: comapnyName,
              });
            }
            if (this.props.match.params.stepName === "start") {
              startPageKey = "start";
            } else if (
              startPageKey !== "" &&
              this.props.match.params.stepName === "intro"
            ) {
              if (questionId !== "" && questionId !== undefined) {
                // this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
              } else {
                // this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
              }

              // }
              startPageKey = "";
            } else {
              // this.props.history.push({ pathname: "/assessmentDetails/scoring_test/" + invitationId_start + "/start", state: { assessmentFormName: AssessmentFormName, comapnyName: comapnyName, startKey: this.props.history.key } });
              //WarpNavigator.navigateToAssessment(this.props.history, "start", invitationId_start, AssessmentFormName, comapnyName, questionId);
              if (questionId !== "" && questionId !== undefined) {
                this.props.history.push(
                  `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`
                );
              } else {
                this.props.history.push(
                  `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`
                );
              }
            }
            // WarpNavigator.navigateToAssessment(this.props.history, "start", invitationId_start, AssessmentFormName, comapnyName);

            break;

          case "warp-invitation-form-review":
            this.setState({ loading: true });
            setTimeout(() => {
              this.setState({ loading: false });
            }, 900);
            const invitationId_review = messageData.data.invitationId;
            let questionId_review = "";
            if (
              messageData.data.questionId !== "" &&
              messageData.data.questionId !== undefined
            ) {
              questionId_review = messageData.data.questionId;
            }
            let AssessmentFormName_review = this.state.assessmentFormName;
            let comapnyName_review = this.state.comapnyName;
            if (
              this.props.location.state !== undefined &&
              this.props.location.state !== null
            ) {
              AssessmentFormName_review = this.props.location.state.assessmentFormName;
              AssessmentFormName_review = AssessmentFormName_review.replace("&", ";amp;");
              comapnyName_review = this.props.location.state.comapnyName;
              this.setState({
                assessmentFormName: AssessmentFormName_review,
                comapnyName: comapnyName_review,
              });
            }
            if (this.props.match.params.stepName === "start") {
              startPageKey = "start";
            } else if (
              startPageKey !== "" &&
              this.props.match.params.stepName === "intro"
            ) {
              if (questionId_review !== "" && questionId_review !== undefined) {
                // this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_review}/start?questionid=${questionId_review}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                window.location.href = `/assessmentDetails/scoring_test/${invitationId_review}/review?questionid=${questionId_review}&assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`;
              } else {
                // this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                window.location.href = `/assessmentDetails/scoring_test/${invitationId_review}/review?assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`;
              }

              // }
              startPageKey = "";
            } else {
              // this.props.history.push({ pathname: "/assessmentDetails/scoring_test/" + invitationId_start + "/start", state: { assessmentFormName: AssessmentFormName, comapnyName: comapnyName, startKey: this.props.history.key } });
              //WarpNavigator.navigateToAssessment(this.props.history, "start", invitationId_start, AssessmentFormName, comapnyName, questionId);
              if (questionId_review !== "" && questionId_review !== undefined) {
                this.props.history.push(
                  `/assessmentDetails/scoring_test/${invitationId_review}/review?questionid=${questionId_review}&assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`
                );
              } else {
                this.props.history.push(
                  `/assessmentDetails/scoring_test/${invitationId_review}/review?assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`
                );
              }
            }
            // WarpNavigator.navigateToAssessment(this.props.history, "start", invitationId_start, AssessmentFormName, comapnyName);

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
            //console.log({ locationState_start: this.props, AssessmentFormName_new, StartKey: this.props.location.state.startKey });
            let formmode = "start";
            if (
              JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
            ) {
              formmode = "view";
            } else {
              formmode = this.props.match.params.stepName;
            }
            if (questionId_new !== "" && questionId_new !== undefined) {
              // window.location.href = `/assessmentDetails/scoring_test/${invitationId_question_redirect}/${formmode}?questionid=${questionId_new}&assessmentname=${AssessmentFormName_new}&companyname=${comapnyName_new}`;
              this.props.history.push(
                `/assessmentDetails/scoring_test/${invitationId_question_redirect}/${formmode}?questionid=${questionId_new}&assessmentname=${AssessmentFormName_new}&companyname=${comapnyName_new}`
              );
              let iFrame2 = document.getElementById("listIframe1");
              iFrame2.src = iFrame2.src;
            } else {
              // window.location.href = `/assessmentDetails/scoring_test/${invitationId_question_redirect}/${formmode}?assessmentname=${AssessmentFormName_new}&companyname=${comapnyName_new}`;
              this.props.history.push(
                `/assessmentDetails/scoring_test/${invitationId_question_redirect}/${formmode}?assessmentname=${AssessmentFormName_new}&companyname=${comapnyName_new}`
              );
              let iFrame2 = document.getElementById("listIframe1");
              iFrame2.src = iFrame2.src;
            }

            break;

          case "warp-invitation-form-submit":
            popupAlert(
              "success",
              "Success",
              `${messageData.data.formType} form submitted successfully`
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
            let invitationId = "";
            if (
              messageData.invitationId !== "" &&
              messageData.invitationId !== undefined
            ) {
              invitationId = messageData.invitationId;
            }
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
                    url = `/assessmentDetails/scoring_test/${
                      this.props.match.params.warpInvitationId
                    }/${
                      this.props.match.params.stepName
                    }?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                  } else if (FormSrclink.includes("viewrecommendation")) {
                    url = `/assessmentDetails/scoring_test/${
                      this.props.match.params.warpInvitationId
                    }/${
                      this.props.match.params.stepName
                    }?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                  }else if (
                    FormSrclink.includes("review") &&
                    this.props.match.params.stepName === "review"
                  ) {
                    url = `/assessmentDetails/scoring_test/${
                      this.props.match.params.warpInvitationId
                    }/${
                      this.props.match.params.stepName
                    }?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                  } else {
                    if (invitationId !== "") {
                      url = `/assessmentDetails/scoring_test/${invitationId}/view?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                    } else {
                      url = `/assessmentDetails/scoring_test/${
                        this.props.match.params.warpInvitationId
                      }/view?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                    }
                  }
                } else {
                  url = `/assessmentDetails/scoring_test/${
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
                this.setState({
                  isPagerefreshed: false,
                });
                if (params_new !== questionId1) {
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
                      url = `/assessmentDetails/scoring_test/${
                        this.props.match.params.warpInvitationId
                      }/${
                        this.props.match.params.stepName
                      }?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                    }else if (
                      FormSrclink.includes("review") &&
                      this.props.match.params.stepName === "review"
                    ) {
                      url = `/assessmentDetails/scoring_test/${
                        this.props.match.params.warpInvitationId
                      }/${
                        this.props.match.params.stepName
                      }?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                    } else if (FormSrclink.includes("viewrecommendation")) {
                      url = `/assessmentDetails/scoring_test/${
                        this.props.match.params.warpInvitationId
                      }/${
                        this.props.match.params.stepName
                      }?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                    } else {
                      // url = `/assessmentDetails/scoring_test/${this.props.match.params.warpInvitationId
                      //   }/view?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                      url = window.location.href;
                    }
                  } else {
                    url = `/assessmentDetails/scoring_test/${
                      this.props.match.params.warpInvitationId
                    }/${
                      this.props.match.params.stepName
                    }?assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                  }
                  history.push(url);
                } else {
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
            popupAlert("AIExtractedDataValidationPopup", "Action Required", error_message);
            break;

          case "warp-ShowHide-CommentList":
            const message = messageData.data;
            this.setState({
              IsShowCommentList: message,
              totalQuestionWithComment: message.totalQuestions,
              totalCommentButton: message.totalCommentButton,
            });
            if (this.props.popupTitle === this.props.QuestionswithComments) {
              let count =
                message.totalQuestions > 9
                  ? message.totalQuestions
                  : "0" + message.totalQuestions;
              this.props.UpdateQuestionsWithComments(
                "Questions with Queries(" + count + ")"
              );
              // this.setState({
              //   commonDialog: {
              //     height: 400,
              //     isOpened: true,
              //     popupTitle: QuestionswithComments,
              //   },
              // });
              this.props.questionWithQuery({
                commonDialog: {
                  isOpened: true,
                  height: 400,
                },
              });
              this.props.updateTitle("Questions with Queries(" + count + ")");
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
              loading: this.state.commonDialog.isOpened ? false : true,
              commonDialog: {
                height: 250,
                isOpened: messageData.data.isOpenedPopup,
                popupTitle: messageData.data.title,
                dialogType: "assign-question",
                formId: messageData.data.formDetails.formId,
                invitationId: messageData.data.formDetails.invitationId,
                questionId: messageData.data.formDetails.questionId,
                SubmissionId: messageData.data.formDetails.SubmissionId,
              },
            });
            break;
          case "warp-AssignReviewer":
            this.setState({
              iframeloader: false,
              iframeloader2: false,
              loading: this.state.commonDialog.isOpened ? false : true,
              commonDialog: {
                height: 250,
                isOpened: messageData.data.isOpenedPopup,
                popupTitle: messageData.data.title,
                dialogType: "assign-reviewer",
                formId: messageData.data.formDetails.formId,
                invitationId: messageData.data.formDetails.invitationId,
                questionId: messageData.data.formDetails.questionId,
                SubmissionId: messageData.data.formDetails.SubmissionId,
              },
            });
            // Reload iframe when popup is closing
            if(messageData.data.isOpenedPopup === false){ 
              this.setState({ loading: true });
              let iframeDeclineAnswer = document.getElementById("listIframe1");
            iframeDeclineAnswer.contentWindow.postMessage(
                    JSON.stringify({
                      type: "warp-decline-re-submit-refresh",
                      response: true,
                    }),
                    "*"
                  );
                  setTimeout(() => {
                    this.setState({ loading: false });
                  }, 1200);

            }
            break;
            case "warp-Justify":
              this.setState({
              assignReviewerDetails: {
                formId: messageData.data.formDetails.formId,
                invitationId: messageData.data.formDetails.invitationId,
                questionId: messageData.data.formDetails.questionId,
                SubmissionId: messageData.data.formDetails.SubmissionId,
                page: "detailspage",
                loading: true
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
                  dialogType: "justify-popup",
                  formId: messageData.data.formDetails.formId,
                  invitationId: messageData.data.formDetails.invitationId,
                  questionId: messageData.data.formDetails.questionId,
                  SubmissionId: messageData.data.formDetails.SubmissionId,
                },
              });
              // Reload iframe when popup is closing
              if(messageData.data.isOpenedPopup === false && messageData.data.IsCancel === false){
                this.setState({ loading: true });
                let iframeDeclineAnswer = document.getElementById("listIframe1");
                if (iframeDeclineAnswer){
                  iframeDeclineAnswer.contentWindow.postMessage(
                    JSON.stringify({
                      type: "snowkap-isRefreshPage",
                      questionId: messageData.data.formDetails.questionId,
                      invitationId: messageData.data.formDetails.invitationId,
                    }),
                    "*"
                  );
                  iframeDeclineAnswer.src = iframeDeclineAnswer.src;
                  // iframeDeclineAnswer.contentWindow.postMessage(
                  //   JSON.stringify({
                  //     type: "warp-decline-re-submit-refresh",
                  //     response: true,
                  //   }),
                  //   "*"
                  // );
                  // setTimeout(() => {
                  //   this.setState({ loading: false });
                  // }, 1200);
                }
              }
              if(messageData.data.IsCancel === true){
this.setState({ loading: false });
                
            }
            break;
            case "warp-DeclineAnswer":
              this.setState({
              assignReviewerDetails: {
                formId: messageData.data.formDetails.formId,
                invitationId: messageData.data.formDetails.invitationId,
                questionId: messageData.data.formDetails.questionId,
                SubmissionId: messageData.data.formDetails.SubmissionId,
                page: "detailspage",
                loading: true
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
                  dialogType: "decline-answer-popup",
                  formId: messageData.data.formDetails.formId,
                  invitationId: messageData.data.formDetails.invitationId,
                  questionId: messageData.data.formDetails.questionId,
                  SubmissionId: messageData.data.formDetails.SubmissionId,
                },
              });
              // Reload iframe when popup is closing
              if(messageData.data.isOpenedPopup === false && messageData.data.IsCancel === false){
                this.setState({ loading: true });
                let iframeDeclineAnswer = document.getElementById("listIframe1");
                if (iframeDeclineAnswer){
                  // iframeDeclineAnswer.contentWindow.postMessage(
                  //   JSON.stringify({
                  //     type: "warp-decline-re-submit-refresh",
                  //     response: true,
                  //   }),
                  //   "*"
                  // );

                  // setTimeout(() => {
                  //   this.setState({ loading: false });
                  // }, 1200);

                  iframeDeclineAnswer.contentWindow.postMessage(
                    JSON.stringify({
                      type: "snowkap-isRefreshPage",
                      questionId: messageData.data.formDetails.questionId,
                      invitationId: messageData.data.formDetails.invitationId,
                    }),
                    "*"
                  );
                  iframeDeclineAnswer.src = iframeDeclineAnswer.src;

                }
              }
              if(messageData.data.IsCancel === true){
this.setState({ loading: false });
                
            }

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
          case "warp-FormSubmitConfirmation":
            this.setState({ loading: false });
            // Prepare reviewer status information
            const reviewerInfo = {
              isReviewer: messageData.data.reviewerDetails !== undefined && !!messageData.data.reviewerDetails ? true : false,
              isReviewerSelf: messageData.data.isReviewerSelf !== undefined && !!messageData.data.isReviewerSelf ? true : false,
              isInternalAssessment: messageData.data.isInternalAssessment !== undefined && !!messageData.data.isInternalAssessment ? true : false,
              role:messageData.data.role !== undefined && !!messageData.data.role ? messageData.data.role : "",
            };
            popupAlert(
              "formSubmitConfirmationPopup", 
              messageData.data.formType, 
              reviewerInfo,
              () => {
                // Submit callback
                const formSubmitIframe = document.getElementById("listIframe1");
                if (formSubmitIframe && formSubmitIframe.contentWindow) {                  
                  formSubmitIframe.contentWindow.postMessage({ isSubmitted: true }, "*");
                }
              },
              null, // negetiveActionBtn
              null, // positiveActionBtn
              () => {
                // Assign Reviewer callback
                this.setState({
                  loading: false,
                  commonDialog: {
                    height: 250,
                    isOpened: true,
                    popupTitle: "Assign Reviewer",
                    dialogType: "assign-reviewer-submit",
                    formId: messageData.data.formId || "",
                    invitationId: messageData.data.invitationId || this.props.match.params.warpInvitationId,
                    questionId: messageData.data.questionId || "",
                    SubmissionId: messageData.data.SubmissionId || "",
                    formType: messageData.data.formType || "",
                  },
                });
              }
            );
            this.setState({
              assignReviewerDetails: {
                formId: messageData.data.formId || "",
                invitationId: messageData.data.invitationId || this.props.match.params.warpInvitationId,
                questionId: messageData.data.questionId || "",
                SubmissionId: messageData.data.SubmissionId || "",
                formType: messageData.data.formType || "",
                page: "detailspage"
              }
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
              loading: true,
              // commonDialog: { isOpened: false },
            });
            this.props.questionWithQuery({
              commonDialog: {
                isOpened: false,
                height: 400,
              },
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
              // IFrame.contentWindow.postMessage(JSON.stringify({
              //     type: "snowkap-isRefreshPage",
              //     questionId: messageData.data.formDetails.questionId,
              //     commentcount: 0,
              //     invitationId: this.props.match.params.warpInvitationId
              // }), "*");
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
          case "suggestions_popup":
            this.setState({
              formFieldId: messageData.data.formFieldId,
              selectedSuggestionId: messageData.data.selectedId,
              isFile: messageData.data.isFile,
              isFileField: false, // Ensure this opens the "View All Suggestions" dialog
              commonDialog: {
                isOpened: true,
                popupTitle: !!messageData.data.isFile
                  ? "All Documents"
                  : "All Suggestions",
                dialogType: "suggestions",
              },
              iframeloader3: true,
            });
            break;
          case "set-store-suggestion-value-from-popup":
            let suggestionStoreIframe = document.getElementById("listIframe1");
            suggestionStoreIframe.contentWindow.postMessage(
              JSON.stringify({
                type: "set-suggestion-store-value",
                id: messageData.data.suggestionId,
                suggestion: messageData.data.value,
                isSelected: messageData.data.isSelected,
                formFieldId: this.state.formFieldId,
                selectedData: messageData.data.selectedData,
              }),
              "*"
            );
            break;
          case "suggestionCardText_Popup":
            this.setState({
              aiSuggestionTitle: messageData.data.aiSuggestionTitle,
              aiSuggestionMessage: messageData.data.aiSuggestionMessage,
              allSuggestions: messageData.data.value,
              selectedSuggestionId: messageData.data.suggestionId,
              formFieldId: messageData.data.formFieldId,
              isSelectedFromPopup: messageData.data.isSelected,
              isHTMLSuggestion: messageData.data.isHTMLSuggestion,
              mode: messageData.data.mode,
              commonDialog: {
                isOpened: true,
                popupTitle: "suggestionCardText",
              },
            });
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
                isSystemGenerated: messageData.data.isSystemGenerated || false,
                isExpiredDocumentfound: messageData.data.isExpiredDocumentfound || false,
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
          case "warp-saveClick":
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
              if (invitationDetail !== undefined) {
                this.setState({
                  companyFormInvitationDetail: invitationDetail,
                });
                this.setHeading(invitationDetail);
              }
            }
            break;
          case "Approve-entire-report":
            this.setState({
              isreviewer: messageData.data.isreviewer,
              enable: messageData.data.enable,
              invitationId: messageData.data.InvitationId,
              submissionId: messageData.data.SubmissionId
            });
            // Update HeaderButtons component with new state
            window.dispatchEvent(new CustomEvent('approveReportStateChange', {
              detail: {
                isreviewer: messageData.data.isreviewer,
                enable: messageData.data.enable
              }
            }));
            break;
          default:
            break;
        }
      } catch (error) {}
    }
  };

  async componentDidMount() {
    this.props.UpdateQuestionsWithComments("Q");
    window.onload = () => {
      this.setState({ isPagerefreshed: true });
    };
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
    window.addEventListener("popstate", this.handlePopState);
    window.addEventListener("message", this.handleMessage);
    // Set initial recommendation URL if localStorage values are available
    this.updateRecommendationUrl();
  }

  componentWillUnmount() {
    window.removeEventListener("popstate", this.handlePopState);
    window.removeEventListener("message", this.handleMessage);
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
    // Check if recommendation URL should be updated
    this.updateRecommendationUrl();
  }
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
  // hanldeQuestionWithQueries =()=>{
  //   setTimeout(() => {
  //     this.setState({ iframeloader2: false });
  //   }, 600);
  //   let count =
  //     this.state.totalQuestionWithComment > 9
  //       ? this.state.totalQuestionWithComment
  //       : "0" + this.state.totalQuestionWithComment;
  //   QuestionswithComments = "Questions with Queries(" + count + ")";
  //   this.setState({
  //     iframeloader2: true,
  //     commonDialog: {
  //       height: 400,
  //       isOpened: true,
  //       popupTitle: QuestionswithComments,
  //     },
  //     qwcloader: true,
  //     qwcopen: true,
  //   });

  // }

  // this.props.questionWithQuery(setTimeout(() => {
  //   this.setState({ iframeloader2: false });
  // }, 600);
  // let count =
  //   this.state.totalQuestionWithComment > 9
  //     ? this.state.totalQuestionWithComment
  //     : "0" + this.state.totalQuestionWithComment;
  // QuestionswithComments = "Questions with Queries(" + count + ")";
  // this.setState({
  //   iframeloader2: true,
  //   commonDialog: {
  //     height: 400,
  //     isOpened: true,
  //     popupTitle: QuestionswithComments,
  //   },
  //   qwcloader: true,
  //   qwcopen: true,
  // }));

  showHeadingData = (url) => {
    let commentButton = "";
    let totalQuestionWithComment = "";
    let recommendationIcon = "";
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
    //   totalQuestionWithComment = (
    //     // <Button
    //     //   style={{ margin: 0 }}
    //     //   className="actionButton"
    //     //   onClick={this.hanldeQuestionWithQueries}
    //     // >
    //     //   <p style={{ paddingLeft: "10px" }}>Questions with Queries</p>
    //     //   <span className="commentCount">
    //     //     {this.state.totalQuestionWithComment > 9
    //     //       ? this.state.totalQuestionWithComment
    //     //       : "0" + this.state.totalQuestionWithComment}
    //     //   </span>
    //     // </Button>
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
          {/* {totalQuestionWithComment} */}
          {/* {recommendationIcon} */}
        </Box>
      );
    }
    return <></>;
  };

  showHeading = () => {
    let data = "";
    let url = "";
    try {
      
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
            : 0
        }/${
                    localStorage.isCarryForward !== undefined && localStorage.isCarryForward !== ''
                        ? localStorage.isCarryForward
                        : "false"
                }/${localStorage.submissionId}/${
          localStorage.score
        }/${localStorage.firstName}`;
      }
    } catch (error) {
      console.log(error);
    }

    if (data === "") {
      // URL construction moved to updateRecommendationUrl method
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
        data = <>{this.showHeadingData(url)}</>;
      }
    }

    return data;
  };

  handleCommonDialogClose = () => {
    this.setState({
      commonDialog: { isOpened: false },
      qwcopen: false,
      iframeloader3: true,
    });
        // Cleanup dialog click listener
    if (this.dialogClickHandler && this.dialogElement) {
      this.dialogElement.removeEventListener("click", this.dialogClickHandler);
      this.dialogClickHandler = null;
      this.dialogElement = null;
    }
  };
  closeTextAreaPopup = (value, suggestionId, isSelectedFromPopupState) => {
    this.setState({ isSelectedFromPopup: isSelectedFromPopupState });
    this.setState({ commonDialog: { isOpened: false }, qwcopen: false });
    let suggestionStoreIframe = document.getElementById("listIframe1");
    suggestionStoreIframe.contentWindow.postMessage(
      JSON.stringify({
        type: "set-suggestion-store-value",
        id: suggestionId,
        suggestion: value,
        isSelected: isSelectedFromPopupState,
        formFieldId: this.state.formFieldId,
        selectedData: [],
        isHTMLSuggestion: this.state.isHTMLSuggestion,
      }),
      "*"
    );
  };
  handleQuestionWithQueriesClose = () => {
    this.props.questionWithQuery({
      commonDialog: {
        isOpened: false,
        height: 400,
      },
    });
    this.props.QueryButtonQwcOpen(false);
    this.props.updateIframe(true);
    this.props.UpdateQuestionsWithComments("Q");
  };
  Transition = React.forwardRef((props, ref) => {
    return <Slide ref={ref} {...props} />;
  });

  setHeading() {
    let headingData = setHeaderHeading(
      this.state.companyFormInvitationDetail,
      this.state.userRole
    );
    this.props.set_sub_heading(headingData);
  }

  updateRecommendationUrl = () => {
    // Only construct URL if all required localStorage values are available
    if (
      localStorage.assessmentFormName2 !== undefined &&
      localStorage.period !== undefined &&
      localStorage.comapnyName2 !== undefined &&
      localStorage.isCarryForward !== undefined &&
      localStorage.submissionId !== undefined &&
      localStorage.firstName !== undefined &&
      this.props.match.params.warpInvitationId
    ) {
      const url = `/assessmentrecommendation/${
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
        localStorage.score || "0"
      }/${localStorage.firstName}`;
      
      // Only dispatch if URL has changed to avoid unnecessary re-renders
      if (this.props.recommendationUrl !== url) {
        this.props.viewRecommendationsUrl(url);
      }
    }
  };

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
      if (
        !this.state.formField ||
        Object.keys(this.state.formField).length === 0
      ) {
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

    // Add this to your parent project
    window.addEventListener("message", function(event) {
      // Handle browser width requests from iframe
      if (event.data && event.data.type === "REQUEST_BROWSER_WIDTH") {
        // Send browser width back to iframe
        event.source.postMessage(
          {
            type: "BROWSER_WIDTH_RESPONSE",
            width: window.innerWidth,
            timestamp: Date.now(),
          },
          event.origin
        );
      }
    });

    // Also send width on window resize
    window.addEventListener("resize", function() {
      // Send updated width to all iframes
      const iframes = document.querySelectorAll("iframe");
      iframes.forEach(function(iframe) {
        if (iframe.contentWindow) {
          iframe.contentWindow.postMessage(
            {
              type: "BROWSER_WIDTH_RESPONSE",
              width: window.innerWidth,
              timestamp: Date.now(),
            },
            "*"
          );
        }
      });
    });

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
                  <iframe
                    title=" "
                    id="listIframe"
                    src={commenturl}
                    allowFullScreen
                    frameBorder="0"
                    onLoad={() =>
                      setTimeout(() => {
                        this.setState({ loading: false });
                      }, 800)
                    }
                    style={{
                      width: "100%",
                      // minHeight: 400,
                      // maxHeight: 500,
                      height: this.state.popupIframeHeight + 5,
                    }}
                    loading="eager"
                    // sandbox="allow-popups allow-downloads allow-same-origin allow-scripts allow-storage-access-by-user-activation"
                  />
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
            scrolling="no"
            frameBorder="0"
            style={{ width: "100%", minHeight: "650px" }}
            height={this.state.iframeHeight}
            loading="eager"
          />
        </div>
        <Dialog
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.dialogType === "assign-question"
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
          <DialogContent className="dialogueContent">
            {this.props.QwcLoader ? <Spinner style={{ minHeight: 100 }} /> : ""}
            <iframe
              id={"assignQuestionIframe"}
              className="customScroll"
              title="assign question"
              height={this.state.popupIframeHeight + 30}
              onLoad={() =>
                setTimeout(() => {
                  this.setState({ loading: false });
                }, 500)
              }
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
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.dialogType === "assign-reviewer"
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
              id={"assignReviewerIframe"}
              className="customScroll"
              title="assign reviewer"
              height={this.state.popupIframeHeight}
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
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.dialogType === "assign-reviewer-submit"
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
              id={"assignReviewerFromSubmitIframe"}
              className="customScroll"
              title="assign reviewer submit"
              height={this.state.popupIframeHeight}
              onLoad={() =>
                setTimeout(() => {
                  this.setState({ loading: false });
                }, 500)
              }
              width={"100%"}
              frameBorder={0}
              src={
                WARP_Link +
                "embed/NewPopUp/AssignReviewerPopupFromSubmit?formId=" +
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
                "&accessToken=" +
                localStorage.getItem("warpToken")
              }
            />
          </DialogContent>
        </Dialog>

        <Dialog
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.dialogType === "justify-popup"
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
              id={"justifyIframe"}
              className="customScroll"
              title="Justify"
              height={this.state.popupIframeHeight + 30}
              onLoad={() =>
                setTimeout(() => {
                  this.setState({ loading: false });
                }, 500)
              }
              width={"100%"}
              frameBorder={0}
              src={
                WARP_Link +
                "embed/NewPopUp/JustifyPopup?formId=" +
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
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.dialogType === "decline-answer-popup"
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
              id={"declineAnswerIframe"}
              className="customScroll"
              title="Decline Answer"
              height={this.state.popupIframeHeight + 30}
              onLoad={() =>
                setTimeout(() => {
                  this.setState({ loading: false });
                }, 500)
              }
              width={"100%"}
              frameBorder={0}
              src={
                WARP_Link +
                "embed/NewPopUp/DeclinePopup?formId=" +
                this.state.assignReviewerDetails.formId +
                "&invitationId=" +
                this.state.assignReviewerDetails.invitationId +
                "&questionId=" +
                this.state.assignReviewerDetails.questionId +
                "&SubmissionId=" +
                this.state.assignReviewerDetails.SubmissionId +
                "&page=" +
                this.state.assignReviewerDetails.page +
                "&accessToken=" +
                localStorage.getItem("warpToken")
              }
            />
          </DialogContent>
        </Dialog>
        <Dialog
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
          <DialogContent className="dialogueContent">
            {this.state.commonDialog.popupTitle === "Add Recommendation" && (
              <iframe
                id="addRecommendationIframe"
                className="customScroll"
                title="Add Recommendation"
                onLoad={() =>
                  setTimeout(() => {
                    this.setState({ loading: false });
                  }, 500)
                }
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
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.dialogType === "suggestions"
          }
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
            {!this.state.isFile && (
              <div className="ai_suggestions_block_notifications">
                <div class="item">
                  <span class="circle green" />
                  <span class="text green-text">Selected Answer</span>
                </div>
                <div class="item">
                  <span class="circle orange" />
                  <span class="text orange-text">
                    Conflicts in Selected Answers
                  </span>
                </div>
              </div>
            )}
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
            style={{ height: 375 }}
          >
            {this.state.iframeloader3 && <Spinner style={{ minHeight: 100 }} />}
            <iframe
              className="customScroll"
              title="All Suggestions"
              height="100%"
              width={"100%"}
              frameBorder={0}
              src={
                this.state.selectedSuggestionId == undefined ||
                this.state.selectedSuggestionId == "" ||
                this.state.selectedSuggestionId == null
                  ? WARP_Link +
                    "embed/NewPopUp/AISuggestionTablePopup?invitationId=" +
                    this.props.match.params.warpInvitationId +
                    "&formFieldId=" +
                    this.state.formFieldId +
                    "&isFile=" +
                    !!this.state.isFile +
                    ""
                  : WARP_Link +
                    "embed/NewPopUp/AISuggestionTablePopup?invitationId=" +
                    this.props.match.params.warpInvitationId +
                    "&formFieldId=" +
                    this.state.formFieldId +
                    "&SuggestionId=" +
                    this.state.selectedSuggestionId +
                    "&isFile=" +
                    !!this.state.isFile +
                    ""
              }
              onLoad={() => this.setState({ iframeloader3: false })}
              style={{
                display: this.state.commonDialog.isOpened ? "block" : "none",
              }}
            />
          </DialogContent>
        </Dialog>
        <Dialog
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.dialogType === "upload-documents"
          }
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
            <>
              <div className="ai_suggestions_block_notifications">
                {this.state.isSystemGenerated && <div class="item">
                  <span class="circle blue" />
                  <span class="text green-text">System Generated</span>
                </div>}
                {this.state.isExpiredDocumentfound && <div class="item">
                  <span class="circle lightRed" />
                  <span class="text green-text">Expired</span>
                </div>}
              </div>
            </>
            <IconButton className="closebtn" aria-label="close" onClick={this.handleCommonDialogClose}>
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
        <Dialog
          open={
            this.state.commonDialog.isOpened &&
            this.state.commonDialog.popupTitle === "suggestionCardText"
          }
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
            {this.state.aiSuggestionTitle}
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
            style={{ height: "250px" }}
          >
            {this.state.qwcloader ? <Spinner style={{ minHeight: 100 }} /> : ""}
            <div className="scrolledContent">
              {this.state.isHTMLSuggestion ? (
                <div
                  dangerouslySetInnerHTML={{
                    __html: this.state.allSuggestions || "",
                  }}
                />
              ) : (
                <p>{this.state.allSuggestions}</p>
              )}
            </div>
            <Button
              style={{ marginRight: 24 }}
              className="fourthBtn"
              onClick={this.handleCommonDialogClose}
            >
              CLOSE
            </Button>
            <Button
              style={{
                margin: 0,
                background: this.state.isSelectedFromPopup
                  ? "var(--Button_gradient, linear-gradient(95deg, #12B549 0.57%, #088532 95%)) !important"
                  : "",
              }}
              className="primaryBtn"
              disabled={this.state.mode === "view" || this.state.mode === "review"}
              onClick={() =>
                this.closeTextAreaPopup(
                  this.state.allSuggestions,
                  this.state.selectedSuggestionId,
                  !this.state.isSelectedFromPopup
                )
              }
            >
              {this.state.isSelectedFromPopup ? "SELECTED" : "USE THIS"}
            </Button>
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
  sub_heading: state.subHeadings.sub_heading,
  QwcOpen: state.questionWithQueries.QwcOpen,
  QwcLoader: state.questionWithQueries.QwcLoader,
  QuestionswithComments: state.questionWithQueries.QuestionsWithComments,
  recommendationUrl: state.viewRecommendations.url,
});

// Mapping dispatch actions to props
const mapDispatchToProps = {
  questionWithQuery,
  updateCount,
  updateIframe,
  updateTitle,
  viewRecommendationsOpen,
  viewRecommendationsUrl,
  QueryButtonShow,
  set_sub_heading,
  QueryButtonQwcOpen,
  UpdateQuestionsWithComments,
};
//export default withStyles(styles, { withTheme: true })(withRouter(AssessmentDetails));
export default withRouter(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withStyles(styles, { withTheme: true })(AssessmentDetails))
);
