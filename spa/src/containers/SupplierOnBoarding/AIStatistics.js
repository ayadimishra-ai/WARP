import { WarpNavigator } from "../../warp/warp.service";
import React, { Component } from "react";
import { BreadCrumb, getCompanyInvitationDetail, setHeaderHeading} from "../../utility";
import { getServiceUrl, getUserPermision, GetWARPUrl } from "../../config";
import axios from "axios";
import { Redirect, withRouter } from "react-router-dom";
import * as PageKeys from "../../pagekeys";
import { withStyles } from "@material-ui/core/styles";
import ThirdPartyCookieEnabled from "./ThirdPartyCookieEnabled_new";
import { popupAlert } from "../../UI/Popups/popup";
import jwt from "jsonwebtoken";
import {FormInvitationStatus, AICommonValues, AIActions, bulkFileCurationStatus} from "../../warp/warp.constant";
import { set_sub_heading } from "../../store/actions/subheadings";
import { connect } from "react-redux";
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
class AIStatistics extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
      loading: false,
      open: false,
      assessmentFormName: "AI-Statistics",
      iframeHeight: 60,
      thirdPartyCookieEnabled: null,
      IsKhaitanInvitee: false,
      isPageOpenValid:true,
      configId :"",
      sourceFileId:"",
      fileUrl: "",
      sourceId:"",
      submissionId:"",
      formId:"",
      cardArray:[],
      companyFormInvitationDetail:[],
      isAPIHitted:false,
      userRole:""
    };
    this.newHandle = this.newHandle.bind(this);
  }
  _isMounted = false;
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
  newHandle = async (event) => {
      let dataType = typeof event.data;
      const URL = window.location.href;
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
                this.setState({ iframeHeight: messageData.data.height + 20 });
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
              case "rara-get-token-details":
                  let iFrame_1 = document.getElementById("listIframe");
                  iFrame_1.contentWindow.postMessage(
                      JSON.stringify({
                          type: "snowkap-tokendetails",
                          token: localStorage.getItem("tokenId"),
                          serviceurl: getServiceUrl(),
                      }),
                      WARP_Link ? new URL(WARP_Link).origin : "*"
                  );
                  break;
            case "OPEN_YOUTUBE_VIDEO": {
              popupAlert(
                "commonModal",
                "How it works?",
                <iframe
                  width="100%"
                  height="415"
                  src={AICommonValues.youtubeLink}
                  title="YouTube video player"
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              );
              break;
            }
            case "delete-file-modal":
              this.setState({
                configId : messageData.data.configId, 
                sourceFileId : messageData.data.sourceFileId, 
                fileUrl: messageData.data.fileUrl, 
                cardArray: messageData.data.cardArray, 
                sourceId: messageData.data.sourceId, 
                submissionId: messageData.data.submissionId, 
                formId: messageData.data.formId,
                status: messageData.data.status
              })
            {
              popupAlert(
                "deleteConfirmWarpPopup",
                <div>
                      <strong>Caution!!!</strong>
                      <br />
                      Do you really want to delete the file?
                  </div>,
                  "",
                () => {
                  let sendRemoveData = document.getElementById("listIframe");
                  sendRemoveData.contentWindow.postMessage(
                    JSON.stringify({
                      type: "delete-file-from-modal-true",
                      configId: this.state.configId,
                      sourceFileId: this.state.sourceFileId,
                      sourceId: this.state.sourceId,
                      submissionId: this.state.submissionId,
                      fileUrl: this.state.fileUrl,
                      formId: this.state.formId,
                      cardArray: this.state.cardArray,
                      status: this.state.status
                    }),
                    "*"
                    );
                  },
                  "CANCEL",
                  "YES DELETE"
            )
              break;
            }
           case "warp-view-upload-document-page":
            WarpNavigator.navigateToFileUpload(
              this.props.history,
              this.props.match.params.warpInvitationId,
              messageData.data.actionName,
              this.props.match.params.assessmentFormName,
              this.props.match.params.comapnyName
            );
            let uploadDocumentIframe = document.getElementById("listIframe");
            uploadDocumentIframe.contentWindow.postMessage(
                JSON.stringify({
                    type: "warp-upload-document-page",
                    uploadPage: messageData.data.actionName
                }),
                WARP_Link ? new URL(WARP_Link).origin : "*"
            );
            break;
           
            case "warp-invitation-list-respond":
              WarpNavigator.navigateToAssessment(
                this.props.history,
                "intro",
                messageData.data.invitationId,
                messageData.data.assessmentFormName,
                messageData.data.comapnyName
                );
              break;
               case "warp-prevListingPageredirect":
                WarpNavigator.navigateToListingPage(this.props.history,messageData.data.formType);
                break;
              case "warp-navigate-to-listing-page":
                WarpNavigator.navigateToListingPage(this.props.history,messageData.data.formType);
                break;
              case "warp-truncate-loader":
                this.setState({
                  loading: messageData.data.loader,
                });
                break;
                default:
                  break;
          }
        } catch (error) {}
      }
  };
  async componentDidMount () {
    if (
      localStorage.warpToken === undefined &&
      localStorage.warpToken === "null"
      ) {
        this.GetAuthToken();
      }
      this.setState({ loading: true });
      // this.GetUserRole();
      window.addEventListener("message", this.newHandle);
      }
  componentWillUnmount() {
    this._isMounted = false;
    window.removeEventListener("message", this.newHandle);
  }
  componentDidUpdate() {
    if (
      this.state.companyFormInvitationDetail.length > 0 && this.state.isAPIHitted == true
    ) {
      this.setHeading();
      this.setState({isAPIHitted: false});
    }
  }

  // GetUserRole = () => {
  //   let warpToken = jwt.decode(localStorage.warpToken);
  //   if (warpToken !== null) {
  //     let UserRole = warpToken["https://hasura.io/jwt/claims"]["x-hasura-role"];
  //     if (UserRole === "Invitee" || UserRole === "Responder") {
  //       this.setState({ IsKhaitanInvitee: true });
  //     }
  //   }
  // };
  setHeading(){
    let headingData = setHeaderHeading(this.state.companyFormInvitationDetail, this.state.userRole);
    this.props.set_sub_heading(headingData);
}
  render() {
    const actionParams = new URLSearchParams(
      window.location.search
      ).get("action");
    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];

    if (permissions === null) {
      return <Redirect to="/login" />;
    } else if ((getUserPermision(permissions, PageKeys.Assessments) === null && getUserPermision(permissions, PageKeys.Assessments_reporting) === null) || this.state.isPageOpenValid == false) { 
      return <Redirect to="/not-found" />;
    } else if (!!actionParams) {
      if(actionParams === AIActions.uploadDocuments || actionParams === AIActions.documentProcessing){
      }else{
        return <Redirect to="/not-found" />;
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

      if (token != null) {
        tokendate.setUTCSeconds(token.exp);
      }

      const tokendateiat = new Date(0);
      if (token != null) {
        tokendateiat.setUTCSeconds(token.iat);
      }

      if (todaydate > tokendate) {
        //  if (houriat < endhour + 5 ) {
        // console.log("token expired!");
        return <Redirect to="/logout" />;
      }
    }
    
    let breadCrumb = BreadCrumb([
      { pageName: "Home", url: "/Home" },
      { pageName: "AI-Statistics", url: "/#" },
    ])
    let ChildIframeUrl = WARP_Link + "embed/form/invitation/"+this.props.match.params.warpInvitationId+"/AIBasedSections/AIStatistics?accessToken=" +(localStorage.getItem("warpToken") || "");
    if(actionParams === AIActions.uploadDocuments || actionParams === AIActions.documentProcessing){
      ChildIframeUrl = WARP_Link + "embed/form/invitation/"+this.props.match.params.warpInvitationId+"/AIBasedSections/AIStatistics?action="+actionParams+"&accessToken=" +(localStorage.getItem("warpToken") || "")
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
                <h4>{this.state.assessmentFormName}</h4>
              </div>
            </div>
          </div>
          <div className="AiStatisticsFullModule">
            {this.state.thirdPartyCookieEnabled !== null ? (
              this.state.thirdPartyCookieEnabled ? (
                
                <iframe
                allow
                title=" "
                id="listIframe"
                src={ChildIframeUrl}
                allowFullScreen
                frameBorder="0"
                style={{ minHeight:"400px", width: "100%" }}
                height={this.state.iframeHeight}
                loading="eager"
              />
              ) : (
                <ThirdPartyCookieEnabled />
              )
            ) : (
              ""
            )}
          </div>
          <iframe
            title="localstorage-access"
            style={
              { display: "none" } //sandbox="allow-same-origin allow-scripts allow-storage-access-by-user-activation"
            }
            src={WARP_Link + "test"}
          />
        </React.Fragment>
      </React.Fragment>
    );
  }
}
const mapDispatchToProps = {
  set_sub_heading
};
//export default withStyles(styles, { withTheme: true })(withRouter(AIStatistics));
export default withRouter(connect(null, mapDispatchToProps)(withStyles(styles, { withTheme: true })(AIStatistics)));