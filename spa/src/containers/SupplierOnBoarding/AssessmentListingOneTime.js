import React, { Component } from "react";
import { BreadCrumb, getOPsUrl  } from "../../utility";
import { getServiceUrl, getUserPermision } from "../../config";
import axios from "axios";
import { Redirect, withRouter } from "react-router-dom";
import * as PageKeys from "../../pagekeys";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import CloseIcon from "@material-ui/icons/Close";
import { withStyles } from "@material-ui/core/styles";
import Button from "../../components/Material/CustomButtons/Button";
import { OPsNavigatorOneTime } from "../../ops/ops.service";
import ThirdPartyCookieEnabled from "./ThirdPartyCookieEnabled_new";
import { popupAlert } from "../../UI/Popups/popup";
import {getOPsPUrl as configOpsURL} from "../../config"

let OPs_Link="";
let messageData = "";
var divOffsetTop = 0, divOffsetLeft = 0, divOffsetBottom = 0;

const drawerWidth = 393;
const styles = theme => ({
  root: {
    display: "flex"
  },
  hide: {
    display: "none"
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    top: '0px',
    zIndex: '1001'
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-end"
  },
  content: {
    flexGrow: 1,
    padding: '0',
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen
    }),
    marginRight: -drawerWidth
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen
    }),
    marginLeft: -375,
    marginRight: 0
  }
});
class Assessments extends Component {
  constructor(props) {
    super(props);
    this.state = {
      authGenerated: false,
      loading: false,
      message: "",
      open: false,
      FormSrc: "",
      assessmentFormName: "Assessments",
      iframeHeight: 60,
      thirdPartyCookieEnabled: null,
      OPsLink: null
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
        "emailId": localStorage.emailId,
      },
    };
    await axios
      .get(getServiceUrl() + "warp/GetOPsAuthToken", config)
      .then((json) => {
        localStorage.setItem("opsToken", json.data);
        this.setState({ authGenerated: true })
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  }

  async componentDidMount() {
    if (localStorage.opsToken === undefined && localStorage.opsToken === null && localStorage.opsToken === "null") {
      this.GetAuthToken();
    }

    let FormSrclink = window.location.href;
    if (FormSrclink.includes("view") || FormSrclink.includes("edit") || FormSrclink.includes("intro") || FormSrclink.includes("start")) {
      this.setState({ FormSrc: localStorage.getItem("FormSrc") });
    } else {
      localStorage.setItem("FormSrc", null);
      this.setState({ FormSrc: "" })
    }
    this.setState({ loading: true });
    window.addEventListener('message', (event) => {

      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          switch (type) {
            case "ops-content-resize":
              if (this.state.iframeHeight !== messageData.data.height && this.state.open === false) {
                this.setState({ iframeHeight: messageData.data.height + 50 })
              }
              break;
            case "ops-check-localStorage-access":
              this.setState({ thirdPartyCookieEnabled: messageData.data.success }, () => {
                if (document.getElementById('listIframe')) {
                  document.getElementById('listIframe').onload = () => {
                    this.setState({ loading: false });
                  }
                } else {
                  this.setState({ loading: false });
                }
              })
              break;
            case "ops-new-invitation-cancel":
              if (this.state.open === true) {
                this.setState({ open: false });
              } else {
                this.setState({ open: true });
              }
              break;
            case "ops-invitation-list-respond":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 2500)
              const invitationId = messageData.data.invitationId;
              const assessmentFormName = messageData.data.assessmentFormName;
              const comapnyName = messageData.data.comapnyName;
              this.setState({ assessmentFormName: assessmentFormName + " - " + comapnyName });
              OPsNavigatorOneTime.navigateToAssessment(this.props.history, "intro", invitationId, assessmentFormName, comapnyName);
                  break;
              case "ops-new-invitation-started":
                  this.setState({ loading: true });
                  break;
              case "ops-new-invitation-finished":
                  if (messageData.data.isSuccess === true) {
                      document.getElementById('listIframe').src = document.getElementById('listIframe').src
                      this.setState({ loading: false, open: false });
                      popupAlert('success', 'Success', 'Assessment Request sent successfully');
                  } else {
                      this.setState({ loading: false });
                      popupAlert('error', 'Error', 'Failed.');
                  }
                  break;
            case "ops-invitation-list-view":
              this.setState({ loading: true });
              setTimeout(() => {
                this.setState({ loading: false });
              }, 2500)
              const invitationId_view = messageData.data.invitationId;
              const assessmentFormName_view = messageData.data.assessmentFormName;
              const comapnyName_view = messageData.data.comapnyName;
              OPsNavigatorOneTime.navigateToAssessment(this.props.history, "view", invitationId_view, assessmentFormName_view, comapnyName_view);
              break;
            default:
              break;
          }
        } catch (error) {

        }

      }
    });
    
    if(localStorage.OPs_Link === undefined && localStorage.OPs_Link === null){
      await this.getOPsUrl(localStorage.companyGuid);
    }else{
        OPs_Link = localStorage.OPs_Link;
        this.setState({ OPsLink: OPs_Link+"test" }, () => {
          console.log(OPs_Link+"test")
        });
    }
  }

  sendMessage = () => { 
    const iframe = document.querySelector("iframe");
    iframe.contentWindow.postMessage("Hi Son!", process.env.WARP_URL);
  }

  handleDrawerClose = () => {
    this.setState({ open: false });
    this.setState({ collapse: 0 });
  };

  handleDrawerOpen = () => {
    this.setState({ open: true });
  };

  getBodyPosition = () => {
    divOffsetTop = 0;
    divOffsetLeft = 0;
    divOffsetBottom = - (document.body.scrollHeight);
  }

  resizeIframe = (iframe) => {
    let iFramevalue = document.getElementById("listIframe");
    if (iFramevalue) {
      let iFrameClientHeight = document.getElementById('__next');
      if (iFrameClientHeight) {
        iFramevalue.style.height = iFrameClientHeight.clientHeight + "px"
      }
    }
  }

  async getOPsUrl(companyId) {
    await getOPsUrl(companyId).then((list) => {
      OPs_Link = list;
      let OPs_Link1 = OPs_Link +"test";
      this.setState({ OPsLink: OPs_Link1 }, () => {
        console.log(OPs_Link1)
      });
    }).catch((err) => {
        console.log(err.response)
        OPs_Link = configOpsURL;
        this.setState({ OPsLink: OPs_Link+"test" }, () => {
          console.log(OPs_Link+"test")
        });
    });
}

    render() {
    const { classes, location } = this.props;
    const { open, assessmentFormName } = this.state;
    let FormLink = "";
    let AssessmentFormName = assessmentFormName;
    let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
    if (permissions && permissions.length === 0) {
      return <Redirect to="/not-found" />;
    } else if (getUserPermision(permissions, PageKeys.AssessmentsOneTime) === null) {
      return <Redirect to="/not-found" />;
    }
    if (location.state !== undefined && location.state !== null) {
      AssessmentFormName = location.state.assessmentFormName;
    }

    let breadCrumb = BreadCrumb([{ 'pageName': 'Home', 'url': '/Home' },
    { 'pageName': 'Assessments OneTime', 'url': '/#' },
    ])
    let url = window.location.href;
    breadCrumb = url.includes("view") || url.includes("edit") || url.includes("intro") || url.includes("start") ? BreadCrumb([{ 'pageName': 'Home', 'url': '/Home' },
    { 'pageName': 'Assessments One Time', 'url': '/assessmentsonetime/#/assessment_listing' },
    { 'pageName': 'Assessment Details', 'url': '/#' },
    ]) : url.includes("completion") ? BreadCrumb([{ 'pageName': 'Home', 'url': '/Home' },
    { 'pageName': 'Assessments One Time', 'url': '/assessmentsonetime/#/assessment_listing' },
    { 'pageName': 'Assessment Completion', 'url': '/#' },
    ]) : BreadCrumb([{ 'pageName': 'Home', 'url': '/Home' },
    { 'pageName': 'Assessments One Time', 'url': '/#' },
    ]);

    if (url.includes("view") || url.includes("edit") || url.includes("intro") || url.includes("start")) {
      let splitdata = url.split('/');
      let invitationId = splitdata[splitdata.length - 2];
      let StepName = splitdata[splitdata.length - 1];
      FormLink = OPs_Link + "embed/form/invitation/" + invitationId + "/" + StepName + "?accessToken=" + (localStorage.getItem("opsToken") || "");
    } else {
      FormLink = "";
      AssessmentFormName = "Assessments";
    }

    return <React.Fragment>
      {this.state.loading ?
        <div id="samletest" style={{ top: divOffsetTop, left: divOffsetLeft, right: divOffsetLeft, bottom: divOffsetBottom, zIndex: '9999999', position: 'fixed', background: "rgba(255,255,255,0.7)" }}>
          <div className="spinner" style={{ top: "200px" }}>
            <div className="double-bounce1"></div>
            <div className="double-bounce2"></div>
          </div>
        </div>
        : ""}

      <React.Fragment>
        <div className="breadtitle_wrap">
          {breadCrumb}
          {/* <div className="page_top_title" onClick={this.sendMessage}>
            <div className="page_heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', width: '100%' }}>
              <h4>{AssessmentFormName}</h4>
              {JSON.parse(localStorage.getItem("userType")) === "VENTURECAPITALIST" ?
                url.includes("view") || url.includes("edit") || url.includes("intro") ?
                  "" : <Button className="secondarydBtn" onClick={this.handleDrawerOpen} >Initiate Survey</Button> : ""
              }</div>
          </div> */}
        </div>
        <div className="">
          {this.state.thirdPartyCookieEnabled !== null ? this.state.thirdPartyCookieEnabled ? <>
            <iframe allow 
              title=" " id="listIframe" src={FormLink != "" ? FormLink : (OPs_Link + "embed/invitation/list?questionnaireTypes=One-Time&accessToken=" + (localStorage.getItem("opsToken") || ""))} allowFullScreen frameBorder="0"
              style={{ width: '100%' }}
              height={this.state.iframeHeight}
              loading='eager'
            ></iframe>
          </> :
            <ThirdPartyCookieEnabled /> : ''
          }
        </div>
        <iframe title="localstorage-access" style={{ display: 'none' }} src={this.state.OPsLink} />
        {/* <iframe title="localstorage-access" style={{ display: 'none' }} src="https://d2i6n4qp19iue6.cloudfront.net/test" /> */}

        {JSON.parse(localStorage.getItem("userType")) === "VENTURECAPITALIST" || JSON.parse(localStorage.getItem("userType")) === "SUPPLIER" ?
          <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="right"
            open={open}
            classes={{
              paper: classes.drawerPaper + ' ' + 'quick_view_pannel'
            }}
          >
            <div className='quick_view_header assessmentrequestbackicon'>
              <h4 style={{ marginBottom: 0, color: '#122f48' }}>Request Assessment</h4>
              <IconButton
                onClick={this.handleDrawerClose}
                style={{
                  backgroundColor: "transparent",
                }}
                className="close-button-custom"
              >
                <CloseIcon  />
              </IconButton>
            </div>
            
            <div className="quick_view" style={{ paddingBottom: "0px" }}>
              <iframe allow 
              title=" " id="listIframe" src={FormLink != "" ? FormLink : (OPs_Link + "embed/invitation/list?questionnaireTypes=One-Time&accessToken=" + (localStorage.getItem("opsToken") || ""))} allowFullScreen frameBorder="0"
              style={{ width: '100%' }}
              height={this.state.iframeHeight}
              loading='eager'
              ></iframe>
            </div>
          </Drawer> : ""}
      </React.Fragment>


    </React.Fragment>;
  }
}

export default withStyles(styles, { withTheme: true })(withRouter(Assessments));