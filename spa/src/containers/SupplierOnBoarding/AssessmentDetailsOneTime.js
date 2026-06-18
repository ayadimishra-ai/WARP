import { Dialog, DialogContent, DialogTitle, IconButton, withStyles } from "@material-ui/core";
import CloseIcon from '@material-ui/icons/Close';
import axios from "axios";
import React, { Component } from "react";
import { confirmAlert } from "react-confirm-alert";
import { Redirect } from "react-router";
import Button from "../../components/Material/CustomButtons/Button";
import { getServiceUrl, getUserPermision } from "../../config";
import * as PageKeys from "../../pagekeys";
import { popupAlert } from "../../UI/Popups/popup";
import { BreadCrumb, getOPsUrl } from "../../utility";
import { OPsNavigatorOneTime } from "../../ops/ops.service";
import queryString from "query-string";
import history from "../../history";
import {getOPsPUrl as configOpsURL} from "../../config"

let OPs_Link = "";
let messageData = "";

var divOffsetTop = 0, divOffsetLeft = 0, divOffsetBottom = 0;
let startPageKey = "";


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
class AssessmentDetailsOneTime extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            message: "",
            FormSrc: "",
            assessmentFormName: "Assessments",
            comapnyName: "",
            iframeHeight: 60,
            thirdPartyCookieEnabled: false,
            queryOpen: false,
            IsShowCommentList: false,
            isPagerefreshed: false

        };
    }


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

    newHandle = () => {
        window.addEventListener('popstate', (event) => {
            // alert("popstate");
            startPageKey = "popstate";
            this.props.history.length = this.props.history.length - 1;
        });
        window.addEventListener('message', (event) => {
            event.preventDefault();

            let dataType = typeof event.data;
            if (dataType === "string") {
                try {
                    messageData = JSON.parse(event.data);
                    const type = messageData.type;
                    switch (type) {
                        case "ops-content-resize":
                            if (this.state.iframeHeight !== messageData.data.height) {
                                this.setState({ iframeHeight: messageData.data.height + 140 })
                            }
                            break;
                        case "ops-check-localStorage-access":
                            this.setState({ thirdPartyCookieEnabled: messageData.data.success })
                            break;
                        case "ops-new-invitation-cancel":
                            if (this.state.open === true) {
                                this.setState({ open: false });
                            } else {
                                this.setState({ open: true });
                            }
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
                        case "ops-new-invitation-validation-failed":
                            this.setState({ loading: false });
                            break;
                        case "ops-invitation-form-start":
                            this.setState({ loading: true });
                            setTimeout(() => {
                                this.setState({ loading: false });
                            }, 2500);
                            const invitationId_start = messageData.data.invitationId;
                            let questionId = '';
                            if (messageData.data.questionId !== '' && messageData.data.questionId !== undefined) {
                                questionId = messageData.data.questionId;
                            }
                            let AssessmentFormName = this.state.assessmentFormName;
                            let comapnyName = this.state.comapnyName;
                            if (this.props.location.state !== undefined && this.props.location.state !== null) {
                                AssessmentFormName = this.props.location.state.assessmentFormName;
                                comapnyName = this.props.location.state.comapnyName;
                                this.setState({ assessmentFormName: AssessmentFormName, comapnyName: comapnyName });
                            }
                            if (this.props.match.params.stepName === "start") {
                                startPageKey = "start";
                            } else if (startPageKey !== "" && this.props.match.params.stepName === "intro") {
                                if (questionId !== '' && questionId !== undefined) {
                                    window.location.href = `/assessmentsonetime/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                                }
                                else {
                                    window.location.href = `/assessmentsonetime/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                                }
                                startPageKey = "";
                            } else {
                                if (questionId !== '' && questionId !== undefined) {
                                    window.location.href = `/assessmentsonetime/scoring_test/${invitationId_start}/start?questionid=${questionId}&assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                                }
                                else {
                                    window.location.href = `/assessmentsonetime/scoring_test/${invitationId_start}/start?assessmentname=${AssessmentFormName}&companyname=${comapnyName}`;
                                }

                            }
                            break;

                        case "ops-invitation-form-submit":
                            popupAlert('success', 'Success', 'Assessment form submitted successfully');
                            OPsNavigatorOneTime.navigateToInvitationListingPage(this.props.history);
                            break;

                        case "ops-prevNextClick":
                            window.scroll({
                                top: 0,
                                left: 0,
                                behavior: "smooth",
                            });
                            const Currentparams = new URLSearchParams(window.location.search)
                            const params_new = Currentparams.get("questionid");
                            const params_assessmentname = Currentparams.get("assessmentname");
                            const params_companyname = Currentparams.get("companyname");

                            let questionId1 = '';
                            if (messageData.questionId !== '' && messageData.questionId !== undefined) {

                                questionId1 = messageData.questionId;
                                if (params_new !== questionId1 && this.state.isPagerefreshed === false) {
                                    let AssessmentFormName1 = this.state.assessmentFormName;
                                    let comapnyName1 = this.state.comapnyName;
                                    if (this.props.location.state !== undefined && this.props.location.state !== null) {
                                        AssessmentFormName1 = this.props.location.state.assessmentFormName;
                                        comapnyName1 = this.props.location.state.comapnyName;
                                        this.setState({ assessmentFormName: AssessmentFormName1, comapnyName: comapnyName1 });
                                    }else{
                                        AssessmentFormName1 = params_assessmentname;
                                        comapnyName1 = params_companyname;
                                        this.setState({ assessmentFormName: AssessmentFormName1, comapnyName: comapnyName1 });
                                    }
                                    if (!this.props.history) return;
                                    let url = '';
                                    if(this.props.match.params.stepName === "intro") return;
                                    if (questionId1 !== '' && questionId1 !== undefined) {
                                        url = `/assessmentsonetime/scoring_test/${this.props.match.params.opsInvitationId}/${this.props.match.params.stepName}?questionid=${questionId1}&assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                                    }
                                    else {
                                        url = `/assessmentsonetime/scoring_test/${this.props.match.params.opsInvitationId}/${this.props.match.params.stepName}?assessmentname=${AssessmentFormName1}&companyname=${comapnyName1}`;
                                    }
                                    history.push(url);
                                
                                }else if (this.state.isPagerefreshed === true) {
                                    const Currentparams = new URLSearchParams(window.location.search)
                                    const params_new = Currentparams.get("questionid");
                                    this.setState({ isPagerefreshed: false });
                        
                                    let iFrame = document.getElementById('listIframe1');
                                    iFrame.contentWindow.postMessage(JSON.stringify({
                                        type: "snowkap-isRefreshPage",
                                        questionId: params_new,
                                    }), "*"
                                    );
                                }

                            }
                            break;

                        case "ops-invitation-form-cancel":
                            confirmAlert({
                                customUI: ({ onClose }) => <div className="newConfirm_popup">
                                    <p className="primary_grey_12">
                                        <p>Are you sure you want to leave this page?</p>
                                    </p>

                                    <div className="newConfirm_popup_actionButton">
                                        <Button outlineBtnNew onClick={() => onClose()}>No</Button>
                                        <Button onClick={() => {
                                            onClose(); OPsNavigatorOneTime.navigateToInvitationListingPage(this.props.history); this.setState({ loading: true });
                                            setTimeout(() => {
                                                this.setState({ loading: false });
                                            }, 2500)
                                        }} solidBtnNew>Yes</Button>
                                    </div>
                                </div>
                            });
                            break;

                        case "ops-prevListingPageredirect":
                            OPsNavigatorOneTime.navigateToInvitationListingPage(this.props.history);
                            break;

                        case "ops-invitation-form-validation-failed":
                            const error_message = messageData.data.message;
                            this.setState({ loading: false });
                            popupAlert('error', 'Error', error_message);
                            break;

                        case "ops-ShowHide-CommentList":
                            const message = messageData.data.IsShow;
                            this.setState({ IsShowCommentList: message });
                            break;

                        case "ops-ClosePopup":
                            const closepopupmessage = messageData.data.isClose;
                            this.setState({ queryOpen: closepopupmessage });

                            break;


                        default:
                            break;
                    }
                } catch (error) {

                }

            }
        });
    };

    async componentDidMount() {
        window.onload = () => {
            this.setState({ isPagerefreshed: true });
        };
        if (localStorage.opsToken === undefined && localStorage.opsToken === "null") {
            this.GetAuthToken();
        }
        this.newHandle();
        if (document.getElementById('listIframe1')) {
            this.setState({ loading: true });
            document.getElementById('listIframe1').onload = () => {
                this.setState({ loading: false });
            };
        }
        if(localStorage.OPs_Link === undefined && localStorage.OPs_Link === null){
            await this.getOPsUrl(localStorage.companyGuid);
        }else{
            OPs_Link = localStorage.OPs_Link;
        }
    }

   
    handleClickOpen = () => {
        this.setState({ queryOpen: true });
    };

    handleClose = () => {
        this.setState({ queryOpen: false });
    };

    iframeUrl = (opsInvitationId, stepName) => {
        const Currentparams = new URLSearchParams(window.location.search)
        let params = queryString.parse(this.props.location.search);
        const params_new = Currentparams.get("questionid");
        if (stepName === "intro") {
            return OPs_Link+ "embed/form/invitation/" + opsInvitationId + "/" + "start" + "?accessToken=" + (localStorage.getItem("opsToken") || "")
        }
        else {
            return OPs_Link + "embed/form/invitation/" + opsInvitationId + "/" + stepName + "?accessToken=" + (localStorage.getItem("opsToken") || "")
        }

        //  return OPs_Link + "embed/form/invitation/" + opsInvitationId + "/" + stepName + "?accessToken=" + (localStorage.getItem("opsToken") || "")
    }

    showHeading = () => {
        let data = "";
        try {
            if (this.props.location.state !== undefined && this.props.location.state !== null) {
                if (this.props.location.state.assessmentFormName !== undefined && this.props.location.state.assessmentFormName !== null) {
                    data = (
                        <>
                            <h4>{this.props.location.state.assessmentFormName + ' - ' + this.props.location.state.comapnyName}</h4>
                            {this.props.location.state.assessmentFormName.toString().toLowerCase() !== "brsr questionnaire" ? "" :
                                this.props.match.params.stepName === "intro" ? "" :
                                    JSON.parse(localStorage.getItem("userType")) === "VENTURECAPITALIST" ?
                                        <Button className="secondarydBtn" onClick={this.handleClickOpen}>Reopen Assessment</Button>
                                        :
                                        this.state.IsShowCommentList === true ?
                                            <Button className="secondarydBtn" onClick={this.handleClickOpen}>View Comments</Button>
                                            : <></>}
                        </>

                    );
                }
            }
        } catch (error) {
            console.log(error);
        }

        if (data === "") {
            const Currentparams = new URLSearchParams(window.location.search);
            const assessmentname = Currentparams.get("assessmentname");
            const companyname = Currentparams.get("companyname");
            if (assessmentname !== null && assessmentname !== '' && assessmentname !== undefined && this.props.match.params.stepName !== "intro") {
                data = (
                    <>
                        <h4 className="pageHeadingH4">{assessmentname + ' - ' + companyname}</h4>
                        {assessmentname.toLowerCase() !== "brsr questionnaire" ? "" :
                            this.props.match.params.stepName === "intro" ? "" :
                                JSON.parse(localStorage.getItem("userType")) === "VENTURECAPITALIST" ?
                                    <Button className="secondarydBtn" onClick={this.handleClickOpen}>Reopen Assessment</Button>
                                    :
                                    this.state.IsShowCommentList === true ?
                                        <Button className="secondarydBtn" onClick={this.handleClickOpen}>View Comments</Button>
                                        : <></>}
                    </>

                );
            }
        }

        return data
    }

    async getOPsUrl(companyId) {
        console.log('getOPsUrl')
        await getOPsUrl(companyId).then((list) => {
        OPs_Link = list;
        }).catch((err) => {
            console.log(err.response)
            OPs_Link = configOpsURL;
        });
    }

    render() {
        const { location } = this.props;
        console.info({ location });
        const permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions && permissions.length === 0) {
            return <Redirect to="/not-found" />;
        } else if (getUserPermision(permissions, PageKeys.AssessmentsOneTime) === null) {
            return <Redirect to="/not-found" />;
        }

        const breadCrumb = BreadCrumb([{ 'pageName': 'Home', 'url': '/Home' },
        { 'pageName': 'Assessments One Time', 'url': '/assessmentsonetime/#/assessment_listing' },
        { 'pageName': 'Assessment Details', 'url': '/scoring_test/' },
        ]);


        

        return <React.Fragment>
            {this.state.loading ?
                <div id="samletest" style={{ top: divOffsetTop, left: divOffsetLeft, right: divOffsetLeft, bottom: divOffsetBottom, zIndex: '9999999', position: 'fixed', background: "rgba(255,255,255,0.7)" }}>
                    <div className="spinner" style={{ top: "200px" }}>
                        <div className="double-bounce1"></div>
                        <div className="double-bounce2"></div>
                    </div>
                </div>
                : ""}
            <div className="breadtitle_wrap">
                {breadCrumb}
                <div className="page_top_title">
                    <div className="page_heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%',maxHeight:44 }}>
                        {this.showHeading()}
                    </div>
                </div>
            </div>
            <div className=" questionairPage">
                <div className="assesment_header">
                    <Dialog
                        open={this.state.queryOpen}
                        onClose={this.handleClose}
                        fullWidth={true}
                        maxWidth="lg"
                        PaperProps={{ className: 'supplierinfo_popupcont raiseQueryQuestioanir_popup' }}>

                        <DialogTitle id="scroll-dialog-title" className='suppinfopop_heading'>
                            {JSON.parse(localStorage.getItem("userType")) === "VENTURECAPITALIST" ? 'Reopen Assessment' : 'Comment Logs'}
                            <IconButton className="suppinfopop_closebtn" aria-label="close" onClick={this.handleClose}>
                                <CloseIcon />
                            </IconButton>
                        </DialogTitle>
                        <DialogContent className="dialogueContent">
                            <iframe title=" "
                                id="listIframe"
                                src={OPs_Link + "embed/form/invitation/" + this.props.match.params.opsInvitationId + "/Query/invitationQuery?accessToken=" + localStorage.getItem("opsToken")} allowFullScreen frameBorder="0"                              
                                style={{ width: '100%', height: '260px' }}
                                loading='eager'
                            ></iframe>
                        </DialogContent>
                    </Dialog>
                </div>
                <iframe allow
                    title=" "
                    id="listIframe1"
                    src={this.iframeUrl(this.props.match.params.opsInvitationId, this.props.match.params.stepName)} allowFullScreen frameBorder="0"
                    style={{ width: '100%', minHeight:'550px' }}
                    // height={this.state.iframeHeight}
                    loading='eager'
                ></iframe>

            </div>


        </React.Fragment>
    }
}
export default withStyles(styles, { withTheme: true })(AssessmentDetailsOneTime);