import React, { Component } from "react";
import { BreadCrumb } from "../../utility";
import { getNextJSServiceUrl, getServiceUrl, getUserPermision, GetWARPUrl } from "../../config";
import axios from "axios";
import { Redirect, withRouter } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import jwt from "jsonwebtoken";
import { WarpNavigator } from "../../warp/warp.service";
import { createBrowserHistory } from "history";
import Button from "../../components/Material/CustomButtons/Button";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import * as PageKeys from "../../pagekeys";
import { connect } from "react-redux";
import { viewRecommendationsOpen, viewRecommendationsUrl } from "../../store/actions/viewRecommedations";
import { QueryButtonShow, questionWithQuery } from "../../store/actions/questionWithQueries";

const createBrowserHistorypush = createBrowserHistory({ forceRefresh: true });

const WARP_Link = GetWARPUrl();
let messageData = "";
var divOffsetTop = 0,
  divOffsetLeft = 0,
  divOffsetBottom = 0;

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
});
class AssessmentRecommendation extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
      loading: false,
      message: "",
      open: false,
      FormSrc: "",
      assessmentFormName: "Recommendations",
      iframeHeight: 60,
      thirdPartyCookieEnabled: null,
      IsKhaitanInvitee: false,
      commonDialog: {},
      defaultIframe: true,
      invitationId: "",
      isDeviationReportOpened: false,
      progressReport: {},
      dashboardUrl: [],
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
          this.setState({ dashboardUrl: url });
          return true;
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

  componentDidMount() {
    if (
      localStorage.warpToken === undefined &&
      localStorage.warpToken === "null"
    ) {
      this.GetAuthToken();
    }
    if (localStorage.prelogin === "true") {
      window.location.pathname = "/logout";
    }

    localStorage.removeItem("stepName");
    // let FormSrclink = window.location.href;
    // if (FormSrclink.includes("view") || FormSrclink.includes("edit") || FormSrclink.includes("intro") || FormSrclink.includes("start")) {
    //   this.setState({ FormSrc: localStorage.getItem("FormSrc") });
    //   // console.log("intropage")
    // } else {
    //   localStorage.setItem("FormSrc", null);
    //   this.setState({ FormSrc: "" })
    //   // console.log("list Page");
    // }
    this.setState({ loading: true });
    this.GetUserRole();
    window.addEventListener("message", (event) => {
      // console.log("Message received from the child: " + event.data); // Message received from child
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          switch (type) {
            case "warp-content-resize":
              if (
                this.state.iframeHeight !== messageData.data.height &&
                this.state.open === false
              ) {
                this.setState({
                  iframeHeight: messageData.data.height + 120,
                  loading: false,
                });
              }
              break;
            case "warp-recommendation-invitation-list-view":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 2500);
              const invitationIdRecomm_view = messageData.data.invitationId;
              const assessmentFormNameRecomm_view =
                messageData.data.assessmentFormName;
              //const comapnyNameRecomm_view = messageData.data.comapnyName;
              let comapnyNameRecomm_view = "";
              comapnyNameRecomm_view =
                messageData.data.internalAssessmentCompanyName === null ||
                messageData.data.internalAssessmentCompanyName === undefined
                  ? messageData.data.comapnyName
                  : messageData.data.internalAssessmentCompanyName;
                  this.props.viewRecommendationsOpen(messageData.data.isRecommendationIcon);
                  this.props.QueryButtonShow(true);
                //   this.props.questionWithQueries({ commonDialog: {
                //     isOpened: false,
                // }})
              // const isRecommendationIcon_view =
              //   messageData.data.isRecommendationIcon;
              // const period_old = this.props.match.params.period;
              // const questionId = messageData.data.QuestionId;
              let url = `/AssessmentRecommendationDetails/scoring_test/${invitationIdRecomm_view}/viewrecommendation?assessmentname=${assessmentFormNameRecomm_view}&companyname=${comapnyNameRecomm_view}`;
              this.props.history.replace(url);
              break;
            case "Progress-Report-Message-Recommendation":
              this.setState({
                progressReport: {
                  isOpened: this.state.dashboardUrl
                    ? true
                    : this.setState({ loading: true }),
                  popupTitle: "Progress Report",
                  invitationId: this.props.match.params.InvitationId,
                  questionnare: this.props.match.params.questionnare,
                  period: this.props.match.params.period,
                  comapnyName: this.props.match.params.comapnyName,
                  submissionId: this.props.match.params.submissionID,
                },
              });
              this.getDashboardUrl();

              break;
            default:
              break;
          }
        } catch (error) { }
      }
    });
    // this.props.viewRecommendationsOpen(false)
  }

  resizeIframe = (iframe) => {
    let iFramevalue = document.getElementById("listIframeRcmd");
    if (iFramevalue) {
      let iFrameClientHeight = document.getElementById("__next");
      if (iFrameClientHeight) {
        iFramevalue.style.height = iFrameClientHeight.clientHeight + "px";
      }
    }
  };

  GetUserRole = () => {
    let warpToken = jwt.decode(localStorage.warpToken);
    if (warpToken !== null) {
      let UserRole = warpToken["https://hasura.io/jwt/claims"]["x-hasura-role"];
      if (UserRole === "Invitee") {
        this.setState({ IsKhaitanInvitee: true });
      }
    }
  };

  progressReportClose = () => {
    this.setState({ progressReport: { isOpened: false } });
  };

  deviationReportClose = () => {
    this.setState({ isDeviationReportOpened: false });
  };
  //   handleCommonDialogClose = () => {
  //     this.setState({ commonDialog: { isOpened: false } });
  // };
  render() {
    // console.log("this.props.match", this.props.match);
     const { open, assessmentFormName } = this.state;
    let FormLink = "";
    let AssessmentFormName = assessmentFormName;

    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions === null) {
      return <Redirect to="/login" />;
    } else if (getUserPermision(permissions, PageKeys.Assessments) === null && getUserPermision(permissions, PageKeys.Assessments_reporting) === null) {
      return <Redirect to="/not-found" />;
    }

    if (
      localStorage.userId === undefined ||
      localStorage.userId === null ||
      localStorage.userId === "undefined" ||
      localStorage.userId === "null"
    ) {
      return <Redirect to="/logout" />;
    }
    let breadCrumb = BreadCrumb([
      { pageName: "Home", url: "/Home" },
      { pageName: "Recommendations", url: "/#" },
    ]);
    let url = window.location.href;
    breadCrumb =
      url.includes("view") ||
      url.includes("edit") ||
      url.includes("intro") ||
      url.includes("start")
        ? BreadCrumb([
            { pageName: "Home", url: "/Home" },
            {
              pageName: "Recommendations",
              url: "/AssessmentRecommendation/#/AssessmentRecommendation",
            },
            { pageName: "Assessment Recommendation Details", url: "/#" },
          ])
        : BreadCrumb([
            { pageName: "Home", url: "/Home" },
            { pageName: "Recommendations", url: "/#" },
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
        <React.Fragment>
          <div className="breadtitle_wrap">
            {breadCrumb}
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
                {String(this.props.match.params.isCarryForward) === "true" &&
                  this.props.match.params.deviationCount > 0 ? (
                  <Button
                    className="secondarydBtn"
                    onClick={() => {
                      this.setState({ isDeviationReportOpened: true });
                    }}
                  >
                    Deviation Report
                  </Button>
                ) : (
                  ""
                )}
                {/* {JSON.parse(localStorage.getItem("userType")) ===
                "VENTURECAPITALIST" ? (
                  url.includes("view") ||
                  url.includes("edit") ||
                  url.includes("intro") ? (
                    ""
                  ) : this.state.IsKhaitanInvitee ? (
                    ""
                  ) : 
                ) : (
                  ""
                )} */}
              </div>
            </div>
          </div>
          <div className="">
            <iframe
              allow
              title=" "
              id="listIframeRcmd"
              src={
                FormLink != ""
                  ? FormLink
                  : WARP_Link +
                    "embed/invitation/RecommendationList?invitationId=" +
                    this.props.match.params.InvitationId +
                    "&qname=" +
                    this.props.match.params.questionnare +
                    "&tperiod=" +
                    this.props.match.params.period +
                    "&cname=" +
                    this.props.match.params.comapnyName +
                    "&sID=" +
                    this.props.match.params.submissionId +
                    "&score=" +
                    this.props.match.params.score +
                    "&isCarryForward=" +
                    this.props.match.params.isCarryForward +
                    "&deviationCount=" +
                    this.props.match.params.deviationCount +
                    "&accessToken=" +
                    (localStorage.getItem("warpToken") || "") + //sandbox="allow-popups allow-downloads allow-same-origin allow-scripts allow-storage-access-by-user-activation"
                    "&firstName=" +
                    this.props.match.params.firstName
                  }
              allowFullScreen
              frameBorder="0"
              style={{ width: "100%" }}
              height={this.state.iframeHeight}
              loading="eager"
            />
          </div>

          {this.state.isDeviationReportOpened === true ? (
            <Dialog
              open={this.state.isDeviationReportOpened}
              onClose={this.deviationReportClose}
              fullWidth={true}
              maxWidth="lg"
              PaperProps={{ className: "supplierinfo_popupcont" }}
            >
              <DialogTitle
                id="scroll-dialog-title"
                className="suppinfopop_heading"
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                  }}
                >
                  <div style={{ fontSize: 18, lineHeight: "20px" }}>
                    Deviation Report -{" "}
                    <span
                      className="primary_grey_14"
                      style={{ color: "#000", marginTop: 2, marginLeft: 5 }}
                    >
                      {" "}
                      Total {this.props.match.params.deviationCount} Questions
                    </span>
                    <div
                      style={{
                        color: "#000",
                        fontWeight: 600,
                        fontSize: 18,
                      }}
                    >
                      {this.props.match.params.questionnare}
                    </div>
                  </div>
                  <div
                    class="suppinfosub_heading primary_grey_12"
                    style={{ padding: "3%" }}
                  >
                    {this.props.match.params.comapnyName}{" "}
                    <b style={{ lineHeight: "10px", display: "block" }}>
                      <span
                        style={{
                          color: "rgb(28, 150, 137)",
                          fontWeight: "600",
                        }}
                      >
                        {this.props.match.params.period}
                      </span>
                    </b>
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
                  title="Deviation Report"
                  height={270}
                  width={"100%"}
                  frameBorder={0}
                  src={
                    WARP_Link +
                    "embed/NewPopUp/DeviationReportPopup?invitationId=" +
                    this.props.match.params.InvitationId
                  }
                />
              </DialogContent>
            </Dialog>
          ) : (
            ""
          )}
        </React.Fragment>
        <React.Fragment>
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
              <DialogContent className="ProgressReportDialogue dialogueContent">
                <div>
                  <h5>
                    {this.state.progressReport.questionnare}
                  </h5>
                  {/* <p style={{ fontSize: 10, color: "#666" }}>
                    Score in %{" "}
                    <span style={{ fontSize: 10 }}>
                      ( x-axis - Month Wise, y-axis - Company Score in % )
                    </span>
                  </p> */}
                </div>
                <iframe
                  title="Progress Report"
                  height={335}
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
                    this.props.match.params.deviationCount +
                    "&isCarryForward=" +
                    this.props.match.params.isCarryForward +
                    "&flag=Recommendation"
                  }
                />
              </DialogContent>
            </Dialog>
          ) : (
            ""
          )}
        </React.Fragment>
      </React.Fragment>
    );
  }
}

const mapDispatchToProps = {
  viewRecommendationsOpen,
  viewRecommendationsUrl,
  questionWithQuery,
  QueryButtonShow
};
//export default withStyles(styles, { withTheme: true })( withRouter(AssessmentRecommendation));
export default withRouter(connect(null, mapDispatchToProps)(withStyles(styles, { withTheme: true })(AssessmentRecommendation)));
