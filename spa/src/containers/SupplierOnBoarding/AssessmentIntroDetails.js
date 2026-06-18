import { Slide, withStyles } from "@material-ui/core";
import axios from "axios";
import React, { Component } from "react";
import { Redirect, withRouter } from "react-router";
import { getServiceUrl, getUserPermision, GetWARPUrl } from "../../config";
import * as PageKeys from "../../pagekeys";
import {
  BreadCrumb,
  getCompanyInvitationDetail,
  setHeaderHeading,
} from "../../utility";
import jwt from "jsonwebtoken";
import { WarpNavigator } from "../../warp/warp.service";
import { viewRecommendationsOpen } from "../../store/actions/viewRecommedations";
import { set_sub_heading } from "../../store/actions/subheadings";
import { connect } from "react-redux";
import { popupAlert } from "../../UI/Popups/popup";
import { FormInvitationStatus, AIActions, AppRoles, FormInvitationUIStatus, bulkFileCurationStatus, SourceFilesStatus } from "../../warp/warp.constant";
import ProgressBar from "../../components/ProgressBar/ProgressBar";
import { de } from "date-fns/locale";
import { time } from "highcharts";
const WARP_Link = GetWARPUrl();
let messageData = "";

var divOffsetTop = 0,
  divOffsetLeft = 0,
  divOffsetBottom = 0;
let startPageKey = "";
let QuestionswithComments = "Q";

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
    marginLeft: "10px  !important",
  },
});

class AssessmentIntroDetails extends Component {
  constructor(props) {
    super(props);
    this.newHandle = this.newHandle.bind(this);
    this.state = {
      loading: false,
      message: "",
      FormSrc: "",
      assessmentFormName: "Assessments",
      comapnyName: "",
      iframeHeight: 60,
      thirdPartyCookieEnabled: false,
      queryOpen: false,
      commonDialog: { isOpened: false },
      questionId: "",
      qwcopen: false,
      companyFormInvitationDetail: [],
      userRole: "",
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
  async updateInvitationSkipStatus(invitationId) {
    var config = {
      headers: {
        "Content-Type": "text/plain",
      },
    };
    const body = {
      invitationStatus: FormInvitationStatus.Draft,
      invitationId: invitationId,
    };
    await axios
      .post(
        GetWARPUrl() + "api/AI/update-form-invitation",
        JSON.stringify(body),
        config
      )
      .then((json) => {
        if (json.status == 200) {
          this.setState({ loading: true });
        }
      })
      .catch((err) => {
        console.error(err);
      });
  }

async handleStartWithAI(invitationId, formId, AIData, companyId, userId) {
  const body = {
    invitationId: invitationId,
    formId: formId,
    AIData: AIData,
    companyId: companyId,
    userId: userId
  };

  try {
    const response = await fetch(
      GetWARPUrl() + "api/AI/update-invitation-web-curation-ai-bulk-processing",
      {
        method: "POST",
        headers: {
          "Content-Type": "text/plain",
        },
        body: JSON.stringify(body),
      }
    );

    if (response.ok) {
      this.setState({ loading: true });
      setTimeout(() => {
        this.setState({ loading: false });
      }, 900);
      // const invitationId = messageData.data.invitationId;
      // console.log('called redirect-to-document-processing messageData::', messageData)
      
      let AssessmentFormName = this.props.location.state.assessmentFormName;
      AssessmentFormName = AssessmentFormName.replace("&", ";amp;");
      let comapnyName = this.props.location.state.comapnyName;
      if (messageData.data) {
        const aiUrl = `/ai-statistics/${encodeURIComponent(invitationId)}/${encodeURIComponent(AssessmentFormName)}/${encodeURIComponent(comapnyName)}`;
          this.props.history.push(aiUrl);
        }
    } else {
      console.error("Error:", response.status, response.statusText);
    }
  } catch (err) {
    console.error("Fetch error:", err);
  }
}


  newHandle = () => {
    window.addEventListener("popstate", (event) => {
      // alert("popstate");

      startPageKey = "popstate";
      this.props.history.length = this.props.history.length - 1;
    });
    window.addEventListener("message", (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          switch (type) {
            case "warp-content-resize":
              if (
                this.state.iframeHeight !== messageData.data.height &&
                this.state.commonDialog.isOpened === false &&
                this.state.queryOpen === false
              ) {
                this.setState({ iframeHeight: messageData.data.height + 140 });
              }
              break;
            case "warp-check-localStorage-access":
              this.setState({
                thirdPartyCookieEnabled: messageData.data.success,
              });
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
              const companyId = messageData.data.companyId;
              const userId = messageData.data.userId;
              const formId = messageData.data.formId;
              const AIData = messageData.data.AIData;
              const formType = messageData.data.formType;
              if (
                this.props.location.state !== undefined &&
                this.props.location.state !== null
              ) {
                AssessmentFormName = this.props.location.state
                  .assessmentFormName;
                AssessmentFormName = AssessmentFormName.replace("&", ";amp;");
                comapnyName = this.props.location.state.comapnyName;
                this.setState({
                  assessmentFormName: AssessmentFormName,
                  comapnyName: comapnyName,
                });
              }
              if(messageData.data.isUnProcessDocument && messageData.data.documentLogsCount > 0 && !messageData.data.isStarted){
                 const docCount = (messageData.data.documentLogsCount || 0);
                const docLabel = docCount === 1 ? "Unprocessed document" : "Unprocessed documents";
                
                popupAlert(
                  "unprocessedDocumentConfirmPopup",
                  <div>
                    <strong>{docCount} {docLabel}! </strong>
                  </div>,
                  <div>You have <strong>{docCount} {docLabel}</strong> in your repository. Click <strong>‘Start with AI’</strong> to process your documents and get AI-powered suggestions for your responses. Once processing is complete, you will be able to start the report.</div>,
                  async () => {
                    //Start Manually click handle
                    
                    await this.updateInvitationSkipStatus(invitationId_start);
                    if (
                      startPageKey !== "" &&
                      this.props.match.params.stepName !== "intro"
                    ) {
                      if (questionId !== "" && questionId !== undefined) {
                        this.props.history.replace(
                          `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`
                        );
                        // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      } else {
                        this.props.history.replace(
                          `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`
                        );
                        // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      }

                      // }
                      startPageKey = "";
                    } else {
                      if (questionId !== "" && questionId !== undefined) {
                        //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                        window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      } else {
                        //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                        window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      }
                    }
                  },
                  "UPLOAD DOCUMENTS",
                  "START MANUALLY",
                  () => {
                    //Upload document click handle
                    WarpNavigator.navigateToDocumentRepository(
                      this.props.history,
                      formType,
                      "single"
                    );
                  },
                  "START WITH AI",
                  async () => {
                    //Start with AI click handle
                    this.setState({ loading: true });
                    setTimeout(() => {
                      this.setState({ loading: false });
                    }, 900);
                 
                    AssessmentFormName = this.props.location.state.assessmentFormName;
                    AssessmentFormName = AssessmentFormName.replace("&", ";amp;");
                    comapnyName = this.props.location.state.comapnyName;

                    await this.handleStartWithAI(invitationId_start,formId, AIData,companyId, userId);
                  // if (messageData.data ) {
                  //   const aiUrl = `/ai-statistics/${encodeURIComponent(invitationId)}/${encodeURIComponent(AssessmentFormName)}/${encodeURIComponent(comapnyName)}`;
                  //   this.props.history.push(aiUrl);
                    
                  // }
                  }
                );
              }
              else if (messageData.data.toPopup) {
                popupAlert(
                  "uploadDocumentConfirmPopup",
                  <div>
                    <strong>Recommended: Upload Documents!</strong>
                  </div>,
                  "Our AI will extract data from your documents to automatically suggest or pre-fill your responses in all AI-enabled reports and assessments. This will help save you time.",
                  async () => {
                    await this.updateInvitationSkipStatus(invitationId_start);
                    if (
                      startPageKey !== "" &&
                      this.props.match.params.stepName !== "intro"
                    ) {
                      if (questionId !== "" && questionId !== undefined) {
                        this.props.history.replace(
                          `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`
                        );
                        // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      } else {
                        this.props.history.replace(
                          `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`
                        );
                        // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      }

                      // }
                      startPageKey = "";
                    } else {
                      if (questionId !== "" && questionId !== undefined) {
                        //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                        window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      } else {
                        //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                        window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      }
                    }
                  },
                  "UPLOAD DOCUMENTS",
                  "START MANUALLY",
                  () => {
                    WarpNavigator.navigateToDocumentRepository(
                      this.props.history,
                      messageData.data.formType,
                      "single"
                    );
                  }
                );
              } else {
                if (
                  startPageKey !== "" &&
                  this.props.match.params.stepName !== "intro"
                ) {
                  if (questionId !== "" && questionId !== undefined) {
                    this.props.history.replace(
                      `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`
                    );
                    // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                  } else {
                    this.props.history.replace(
                      `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`
                    );
                    // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                  }

                  // }
                  startPageKey = "";
                } else {
                  if (questionId !== "" && questionId !== undefined) {
                    //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                    window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                  } else {
                    //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                    window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                  }
                }
              }
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
              let AssessmentFormName_review  = this.state.assessmentFormName;
              let comapnyName_review  = this.state.comapnyName;
              const companyId_review  = messageData.data.companyId;
              const userId_review  = messageData.data.userId;
              const formId_review  = messageData.data.formId;
              const AIData_review  = messageData.data.AIData;
              const formType_review  = messageData.data.formType;
              if (
                this.props.location.state !== undefined &&
                this.props.location.state !== null
              ) {
                AssessmentFormName_review = this.props.location.state
                  .assessmentFormName;
                AssessmentFormName_review = AssessmentFormName_review.replace("&", ";amp;");
                comapnyName_review = this.props.location.state.comapnyName;
                this.setState({
                  assessmentFormName: AssessmentFormName_review,
                  comapnyName: comapnyName_review,
                });
              }
              if(messageData.data.isUnProcessDocument && messageData.data.documentLogsCount > 0 && !messageData.data.isUnderReview){
                 const docCount = (messageData.data.documentLogsCount || 0);
                const docLabel = docCount === 1 ? "Unprocessed document" : "Unprocessed documents";
                
                popupAlert(
                  "unprocessedDocumentConfirmPopup",
                  <div>
                    <strong>{docCount} {docLabel}! </strong>
                  </div>,
                  <div>You have <strong>{docCount} {docLabel}</strong> in your repository. Click <strong>‘Start with AI’</strong> to process your documents and get AI-powered suggestions for your responses. Once processing is complete, you will be able to start the report.</div>,
                  async () => {
                    //Start Manually click handle
                    
                    await this.updateInvitationSkipStatus(invitationId_review);
                    if (
                      startPageKey !== "" &&
                      this.props.match.params.stepName !== "intro"
                    ) {
                      if (questionId_review !== "" && questionId_review !== undefined) {
                        this.props.history.replace(
                          `/assessmentDetails/scoring_test/${invitationId_review}/review?questionid=${questionId_review}&assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`
                        );
                        // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      } else {
                        this.props.history.replace(
                          `/assessmentDetails/scoring_test/${invitationId_review}/review?assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`
                        );
                        // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      }

                      // }
                      startPageKey = "";
                    } else {
                      if (questionId !== "" && questionId !== undefined) {
                        //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                        window.location.href = `/assessmentDetails/scoring_test/${invitationId_review}/review?questionid=${questionId_review}&assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`;
                      } else {
                        //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                        window.location.href = `/assessmentDetails/scoring_test/${invitationId_review}/review?assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`;
                      }
                    }
                  },
                  "UPLOAD DOCUMENTS",
                  "START MANUALLY",
                  () => {
                    //Upload document click handle
                    WarpNavigator.navigateToDocumentRepository(
                      this.props.history,
                      formType_review,
                      "single"
                    );
                  },
                  "START WITH AI",
                  async () => {
                    //Start with AI click handle
                    this.setState({ loading: true });
                    setTimeout(() => {
                      this.setState({ loading: false });
                    }, 900);
                 
                    AssessmentFormName_review = this.props.location.state.assessmentFormName;
                    AssessmentFormName_review = AssessmentFormName_review.replace("&", ";amp;");
                    comapnyName_review = this.props.location.state.comapnyName;

                    await this.handleStartWithAI(invitationId_review,formId_review, AIData_review,companyId_review, userId_review);
                  // if (messageData.data ) {
                  //   const aiUrl = `/ai-statistics/${encodeURIComponent(invitationId)}/${encodeURIComponent(AssessmentFormName)}/${encodeURIComponent(comapnyName)}`;
                  //   this.props.history.push(aiUrl);
                    
                  // }
                  }
                );
              }
              else if (messageData.data.toPopup) {
                popupAlert(
                  "uploadDocumentConfirmPopup",
                  <div>
                    <strong>Recommended: Upload Documents!</strong>
                  </div>,
                  "Our AI will extract data from your documents to automatically suggest or pre-fill your responses in all AI-enabled reports and assessments. This will help save you time.",
                  async () => {
                    await this.updateInvitationSkipStatus(invitationId_review);
                    if (
                      startPageKey !== "" &&
                      this.props.match.params.stepName !== "intro"
                    ) {
                      if (questionId_review !== "" && questionId_review !== undefined) {
                        this.props.history.replace(
                          `/assessmentDetails/scoring_test/${invitationId_review}/review?questionid=${questionId_review}&assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`
                        );
                        // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      } else {
                        this.props.history.replace(
                          `/assessmentDetails/scoring_test/${invitationId_review}/review?assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`
                        );
                        // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                      }

                      // }
                      startPageKey = "";
                    } else {
                      if (questionId !== "" && questionId !== undefined) {
                        //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                        window.location.href = `/assessmentDetails/scoring_test/${invitationId_review}/review?questionid=${questionId_review}&assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`;
                      } else {
                        //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                        window.location.href = `/assessmentDetails/scoring_test/${invitationId_review}/review?assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`;
                      }
                    }
                  },
                  "UPLOAD DOCUMENTS",
                  "START MANUALLY",
                  () => {
                    WarpNavigator.navigateToDocumentRepository(
                      this.props.history,
                      messageData.data.formType,
                      "single"
                    );
                  }
                );
              } else {
                if (
                  startPageKey !== "" &&
                  this.props.match.params.stepName !== "intro"
                ) {
                  if (questionId_review !== "" && questionId_review !== undefined) {
                    this.props.history.replace(
                      `/assessmentDetails/scoring_test/${invitationId_review}/review?questionid=${questionId_review}&assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`
                    );
                    // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                  } else {
                    this.props.history.replace(
                      `/assessmentDetails/scoring_test/${invitationId_review}/review?assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`
                    );
                    // window.location.href = `/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                  }

                  // }
                  startPageKey = "";
                } else {
                  if (questionId_review !== "" && questionId_review !== undefined) {
                    //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                    window.location.href = `/assessmentDetails/scoring_test/${invitationId_review}/review?questionid=${questionId_review}&assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`;
                  } else {
                    //this.props.history.push(`/assessmentDetails/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`);
                    window.location.href = `/assessmentDetails/scoring_test/${invitationId_review}/review?assessmentname=${AssessmentFormName_review}&companyname=${comapnyName_review}`;
                  }
                }
              }
              break;

            case "warp-prevListingPageredirect":
                WarpNavigator.navigateToListingPage(this.props.history,messageData.data.formType);
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
            case "redirect-to-document-processing":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 900);
              const invitationId = messageData.data.invitationId;
              console.log('called redirect-to-document-processing messageData::', messageData)
              
               AssessmentFormName = this.props.location.state.assessmentFormName;
                AssessmentFormName = AssessmentFormName.replace("&", ";amp;");
                comapnyName = this.props.location.state.comapnyName;
               if (messageData.data) {
                 const aiUrl = `/ai-statistics/${encodeURIComponent(invitationId)}/${encodeURIComponent(AssessmentFormName)}/${encodeURIComponent(comapnyName)}`;
                 console.log('aiUrl::',aiUrl)
                 this.props.history.push(aiUrl);
                 
               }
            break
            case "has-expired-documents-popup":
              console.log("messageData::", messageData);
              const formMode = messageData.data.formType;
              const expiredDocData = messageData.data; // Store the data in local variable
              popupAlert(
                "cautionConfirmPopup",
                <div>
                  <strong>Expired Documents Found</strong>
                </div>,
                <div>
                  Some documents in your repository have expired. We recommend updating them to ensure the most current information.
                </div>,
                async () => {
                  // Proceed Anyway click handler - Start with AI functionality
                  this.setState({ loading: true });
                  setTimeout(() => {
                    this.setState({ loading: false });
                  }, 900);
                  
                  const invitationId = expiredDocData.invitationId;
                  const formId = expiredDocData.formId;
                  const AIData = expiredDocData.AIData
                  const companyId = expiredDocData.companyId;
                  const userId = expiredDocData.userId;
                  
                  let AssessmentFormName = this.state.assessmentFormName;
                  
                  if (
                    this.props.location.state !== undefined &&
                    this.props.location.state !== null
                  ) {
                    AssessmentFormName = this.props.location.state.assessmentFormName;
                    AssessmentFormName = AssessmentFormName.replace("&", ";amp;");
                    comapnyName = this.props.location.state.comapnyName;
                  }

                  await this.handleStartWithAI(invitationId, formId, AIData, companyId, userId);
                },
                "Update Documents",
                "Proceed Anyway",
                () => {
                  //Update Documents click handler
                  WarpNavigator.navigateToDocumentRepository(
                    this.props.history,
                    formMode,
                    "single"
                  );
                }
              );
              break;
            case "warp-invitation-view":
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
              debugger;
              localStorage.setItem("isRecommendationIcon", false);
              localStorage.setItem("assessmentFormName2", "");
              localStorage.setItem("period", "");
              localStorage.setItem("comapnyName2", "");
              localStorage.setItem("deviationCount", 0);
              localStorage.setItem("isCarryForward", "");
              localStorage.setItem("submissionId", "");
              localStorage.setItem("score", "");

              const invitationId_view = messageData.data.invitationId;
              const assessmentFormName_view = messageData.data.assessmentFormName;
              const comapnyName_view = messageData.data.comapnyName;
              const questionId_view = messageData.data.questionId;

              let iFrame = document.getElementById('listIframe1');
              debugger;

              iFrame.contentWindow.postMessage(JSON.stringify({
                  type: "snowkap-isRefreshPage",
                  questionId: questionId_view,
                }), "*"
                );
                                    
              setTimeout(() => {
                this.props.history.replace(
                  `/assessmentDetails/scoring_test/${invitationId_view}/review?questionid=${questionId_view}&assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`
                );
              }, 1000);
              // window.location.href = `/assessmentDetails/scoring_test/${invitationId_view}/review?questionid=${questionId_view}&assessmentname=${assessmentFormName_view}&companyname=${comapnyName_view}`;
            
              break;
            default:
              break;
          }
        } catch (error) {}
      }
    });
  };

  async componentDidMount() {
    if (
      localStorage.warpToken === undefined &&
      localStorage.warpToken === "null"
    ) {
      this.GetAuthToken();
    }
    if (window.location.search.includes("isrview")) {
      //localStorage.setItem("isRecommendationIcon", window.location.search.includes("isrview"));
      this.props.viewRecommendationsOpen(
        window.location.search.includes("isrview")
      );
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
      if (invitationDetail != undefined) {
        this.setState({
          companyFormInvitationDetail: invitationDetail,
          userRole: role,
        });
      }
    }
    this.newHandle();
  }

  handleClickOpen = () => {
    this.setState({ queryOpen: true });
  };

  handleClose = () => {
    this.setState({ queryOpen: false });
    if (this.state.qwcopen === true) {
      this.setState({
        commonDialog: {
          height: 400,
          isOpened: true,
          popupTitle: QuestionswithComments,
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
  render() {
    const permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions.length === 0) {
      return <Redirect to="/logout" />;
    } else if (getUserPermision(permissions, PageKeys.Assessments) === null && getUserPermision(permissions, PageKeys.Assessments_reporting) === null) {
      return <Redirect to="/logout" />;
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
    //changes token expiry
    const breadCrumb = BreadCrumb([
      { pageName: "Home", url: "/Home" },
      { pageName: "Assessments", url: "/assessments" },
      { pageName: "Assessment Details", url: "/scoring_test/" },
    ]);

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
                alignItems: "center",
                width: "100%",
                maxHeight: 44,
              }}
            >
              {this.setHeading()}
            </div>
          </div>
        </div>
        <div className=" questionairPage">
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
            style={{ width: "100%", minHeight: "720px" }}
            height={this.state.iframeHeight}
            loading="eager"
            className="AssessmentIntorIframe"
          />
        </div>
      </React.Fragment>
    );
  }
}

// Mapping dispatch actions to props
const mapDispatchToProps = {
  viewRecommendationsOpen,
  set_sub_heading,
};
//export default withStyles(styles, { withTheme: true })(withRouter (AssessmentIntroDetails));
export default withRouter(
  connect(
    null,
    mapDispatchToProps
  )(withStyles(styles, { withTheme: true })(AssessmentIntroDetails))
);
