import React, { Component, } from "react";
import { Link, withRouter } from "react-router-dom";
import Button from "../../components/Material/CustomButtons/Button";
import { CircularProgress, ListItem } from "@material-ui/core";
import BulkUploadDropdown from "../../components/BulkUploadBtn&DownloadTemplateDropdown/BulkUploadDropdown";
import DownloadTemplateDropdown from "../../components/BulkUploadBtn&DownloadTemplateDropdown/DownloadTemplateDropdown";
import * as RoleCodes from "../../rolecodes";
import { connect } from 'react-redux';
import { isOpen } from '../../store/actions/initiateAssessment';
import axios from "axios";
import { userRoles } from '../../userRoles.service';
import { QueryButtonQwcLoader, QueryButtonQwcOpen, QueryButtonShow, questionWithQuery, updateIframe, UpdateQuestionsWithComments, updateTitle } from "../../store/actions/questionWithQueries";
import { WarpNavigator } from "../../warp/warp.service";
import {AIActions, FormTypes, FormTypesPage} from "../../warp/warp.constant";
import { GetGHGEstimationUrl, getNextJSServiceUrl, getServiceUrl } from "../../config";
import { popupAlert } from "../../UI/Popups/popup";
import XLSX from 'xlsx/dist/xlsx.full.min.js';
import { decodeOpAccessToken, getLastNavigation, getUploadDocumentButtonConfig, setLastNavigation } from "../../utility";
import { GetWARPUrl } from "../../config";
import { Lock } from "@material-ui/icons";
import { showLockUpPopup } from "../../UI/Popups/lockUpPopUp";
import ManualFormActivityHeaderButton from "./manual-form-activity-header-button";
import { de } from "date-fns/locale";
import { refreshIframe } from "../../store/actions/monthlyActivityData";
const WARP_Link = GetWARPUrl();

const FileSaver = require('file-saver');
class HeaderButtons extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLocationExecutive: false,
            btnLoading: false,
            uploadBtnConfig: null,
            isreviewer: false,
            enable: false,
            showViewRecommendation: true
        };
    }
    

    targetValues = new Set(["ghgactivity", "monthly-activity-data"]);
    // viewRecommendation = new Set(["assessments","assessment_listing", "home","ghgactivity", "monthly-activity-data","shop"]);
    viewRecommendation = new Set(["AssessmentRecommendationDetails", "assessmentDetails"]);

    componentDidMount() {
        this.updateButtonStyles();
        this.observeButtonChanges();
        this.setUploadBtnConfig();
        // Listen for approve report state changes
        window.addEventListener('approveReportStateChange', this.handleApproveReportStateChange);
        // Listen for hide view recommendation for reviewer
        window.addEventListener('message', this.handleHideViewRecommendation);
        this.setUploadBtnConfig();
    }
    componentDidUpdate(prevProps) {
        if (
            this.props.location &&
            prevProps.location &&
            this.props.location.pathname !== prevProps.location.pathname
        ) {
        // this.setState({ btnLoading: true });
        // setTimeout(() => {
        //     this.setState({ btnLoading: false });
        // }, 500);
        this.setUploadBtnConfig();
        }
    }

    componentWillUnmount() {
        // Clean up event listener
        window.removeEventListener('approveReportStateChange', this.handleApproveReportStateChange);
        window.removeEventListener('message', this.handleHideViewRecommendation);
    }

    handleApproveReportStateChange = (event) => {
        this.setState({
            isreviewer: event.detail.isreviewer,
            enable: event.detail.enable
        });
    }

    handleHideViewRecommendation = (event) => {
        try {
            let message = event.data;
            if (typeof message === 'string') {
                message = JSON.parse(message);
            }
            if (message.type === 'hide-view-recommendation-for-reviewer' && message.data) {
                this.setState({ showViewRecommendation: message.data.isopen });
            }
        } catch (error) {
            // Ignore parse errors from other message events
        }
    }

    observeButtonChanges() {
        const parent = document.querySelector(".left_header_links");
        if (!parent) return;

        const observer = new MutationObserver(() => {
            this.updateButtonStyles();
        });

        observer.observe(parent, { childList: true, subtree: true });
    }

    updateButtonStyles() {
        const parent = document.querySelector(".left_header_links");
        if (!parent) return;

        const buttons = parent.querySelectorAll(".outline_btn_new, .solid_btn_new");

        if (buttons.length > 0) {
            // Remove .solid_btn_new from any previously assigned button
            buttons.forEach(btn => btn.classList.replace("solid_btn_new", "outline_btn_new"));

            // Assign .solid_btn_new only to the last button
            const lastButton = buttons[buttons.length - 1];
            lastButton.classList.replace("outline_btn_new", "solid_btn_new");
        }
    }


    fetchEmissionFactorData = async () => {

        this.setState({ buttonLoader: true })
        const organizationName = await this.getUserDetails();
        const decodedToken = decodeOpAccessToken(localStorage.opsToken);
        const formData = {
            organization_id:
                decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
        };
        const opConfig = {
            headers: {
                "x-sk-op-authorization": localStorage.opsToken,
                "Content-Type": "application/json",
            },
        };
        axios
            .post(
                GetGHGEstimationUrl() + "api/v1/emission-factor/get-emission-factor",
                formData,
                opConfig
            ).then(response => {

                const EmissionFactor = response.data.data;
                const ws = EmissionFactor.length > 0 ? XLSX.utils.json_to_sheet(EmissionFactor) : XLSX.utils.aoa_to_sheet([['No Data Found']]);
                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, ws, 'Emission Factors');

                const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

                const excelBlob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });

                const filename = `Emission_Factors_${organizationName}_${new Date().toISOString().slice(0, 10)}.xlsx`;

                FileSaver.saveAs(excelBlob, filename);
            })
            .catch((error) => {
                popupAlert('error', 'Error', "Something went wrong.")
                console.log("error", error)
            })
            .finally(() => this.setState({ buttonLoader: false }))

    }
    getUserDetails = async () => {
        let organizationName = "";
        try {
            const config = {
                headers: {
                    Authorization: "Bearer " + localStorage.tokenId,
                    "Content-Type": "application/json",
                    UserGuid: localStorage.userId,
                    //CompanyGuid: localStorage.companyGuid,
                    LanguageGuid: localStorage.languageId,
                },
            };
            const response = await axios.get(
                getNextJSServiceUrl() + "my-account-page/GetUserAccountDetails",
                config
            );
            if (
                response &&
                response.data &&
                response.data.table1 &&
                response.data.table1[0] &&
                response.data.table1[0].organization
            ) {
                organizationName = response.data.table1[0].organization;
            }
        } catch (err) {
            console.log(err);
        } finally {
            this.setState({ buttonLoader: false });
            return organizationName;
        }
    };


    handleOpen = () => {
        this.props.questionWithQuery({
            commonDialog: {
                isOpened: true,
                height: 400,
            },
        });
        let count =
            this.props.count > 9
                ? this.props.count
                : "0" + this.props.count;
        const QuestionsWithComments = "Questions with Queries(" + count + ")";
        this.props.updateIframe(false);
        this.props.updateTitle(QuestionsWithComments);
        this.props.QueryButtonQwcOpen(true);
        this.props.QueryButtonQwcLoader(true);
        this.props.UpdateQuestionsWithComments(QuestionsWithComments);
    }

    handleApproveEntireReport = () => {
        const formType = localStorage.getItem("activeMenuName").indexOf("Reporting") > -1? "report":"assessment";
        const message = `Are you sure you want to approve the entire ${formType}?`;
        popupAlert(
            "ApproveconfirmPopup",
            "Confirmation", 
            message,
            () => {
                // Success callback - send approval message to iframe
                let iFrame = document.getElementById("listIframe1");
                if (iFrame && iFrame.contentWindow) {
                    iFrame.contentWindow.postMessage(
                        JSON.stringify({
                            type: "warp-approve-entire-report",
                            response: true,
                            invitationId: this.props.match.params.warpInvitationId
                        }), 
                        WARP_Link ? new URL(WARP_Link).origin : "*"
                    );
                }
            },
            "NO, GO BACK",
            "APPROVE",
            null,  // negetiveClickFunction
            null,  // startWithAIBtn
            null,  // startWIthAIButtonClick
            "By clicking on 'Approve', you confirm that you have reviewed all responses and accept them for reporting."  // warningMessage
        );
    }
    handleViewRecommendations = () => {
        // let recommendationUrl = this.props.recommendationUrl;
        let recommendationUrl = null;

        if (!recommendationUrl) {
            // Fallback: try to get invitationId from params or directly from the URL path
            let invitationId = this.props.match.params.warpInvitationId;
            
            if (!invitationId) {
                const pathParts = window.location.pathname.split('/');
                // Check if we are on assessmentDetails or AssessmentRecommendationDetails route
                // Path format: /assessmentDetails/scoring_test/:warpInvitationId/:stepName
                if (pathParts[1] === "assessmentDetails" || pathParts[1] === "AssessmentRecommendationDetails") {
                    invitationId = pathParts[3];
                }
            }

            if (invitationId && 
                localStorage.assessmentFormName2 !== undefined &&
                localStorage.period !== undefined &&
                localStorage.comapnyName2 !== undefined &&
                // localStorage.isCarryForward !== undefined &&
                localStorage.submissionId !== undefined &&
                localStorage.firstName !== undefined
            ) {
                recommendationUrl = `/assessmentrecommendation/${
                    invitationId
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
            }
        }

        console.log("Final recommendationUrl", recommendationUrl)
        
        if (recommendationUrl) {
            this.props.history.push(recommendationUrl)
            this.props.QueryButtonShow(false);
        } else {
            popupAlert('error', 'Error', "Recommendation details are missing.")
        }
    }
    getButtonforAI=()=>{
        const uploadBtnConfig = this.state.uploadBtnConfig || { visible: false };

        // const InvitationId = this.props.data.url.split("/")[this.props.data.url.split("/").length - 3]
        // const companyName = decodeURIComponent(this.props.data.url.includes("?") ? this.props.data.url.split("/")[this.props.data.url.split("/").length - 1].split("?")[0] : this.props.data.url.split("/")[this.props.data.url.split("/").length - 1]);
        // const formName = decodeURIComponent(this.props.data.url.split("/")[this.props.data.url.split("/").length - 2]);
        if (uploadBtnConfig.visible) {
            return (
                <Button disableRipple className="solid_btn_new" style={{ marginLeft: "10px" }}
                  onClick={() => {
                    if (uploadBtnConfig.targetUrl) {
                        this.props.history.push(uploadBtnConfig.targetUrl);
                    }
                    }}
                >
                    {uploadBtnConfig.text}
                </Button>
             
            );
        }
        
    }
     // Add this method to the HeaderButtons class
    getButtonText = () => {
        const url = window.location.href;
        if (url.includes('/assessments')) {
            return 'START ASSESSMENT';
        } else if (url.includes('/reports')) {
            return 'START NEW REPORT';
        }
        return 'Initiate Assessment'; // fallback
    }

    /**
     * Handles document repository button configuration on route changes
     * 
     * This method detects navigation to/from the document repository page and manages button state:
     * - When navigating TO document repository: Loads appropriate "Back to..." button config
     *   based on the user's previous navigation path
     * - When navigating AWAY from document repository: Clears the button configuration
     * 
     * The uploadBtnConfig determines visibility, text, and target URL for navigation buttons
     * in the document repository pages based on where the user came from (reports, assessments, etc.)
     */
    setUploadBtnConfig = () => {
        const newPath = this.props.location.pathname;
        if (newPath === "/document-repository") {
            const uploadBtnConfig = getUploadDocumentButtonConfig({
                currentPath: newPath,
                lastNavigation: getLastNavigation(),
            });
            this.setState({ uploadBtnConfig });
        } else if (this.state.uploadBtnConfig) {
            // clear config when leaving the document repository
            this.setState({ uploadBtnConfig: null });
        }
    }

    render() {

        const url = window.location.href;
        const isRecommendationBtnAllowed = window.location.pathname.split("/").filter(item => item)[0];
        const roles = userRoles();

        return (
            <>
                <ListItem style={{ visibility: this.state.btnLoading ? 'hidden' : 'visible' }} className="header_menu_list_new" >
                    {
                        roles.isVentureCapitaList() ? (
                            url.includes("view") || url.includes("edit") || url.includes("intro") ? ("") : roles.isKhaitanInvitee() ? (
                                ""
                            )  : url.includes(FormTypesPage.Assessments) ||url.includes(FormTypesPage.Reports) ? (
                                    <Button
                                    style={{ margin: 0, opacity: localStorage.getItem("isDiamlersupplier") === "true" ? 0.5 : 1 }}
                                    color="transparent"
                                    className="outline_btn_new"
                                    onClick={() => {
                                        if(localStorage.getItem("isDiamlersupplier") === "true"){
                                            showLockUpPopup()
                                        return;
                                        } 
                                        const isAIUser = (this.props.userAIStatus && this.props.userAIStatus.isAIUser === true) || 
                                                        (this.props.userAIStatus && this.props.userAIStatus.isAIUser === 'true');
                                        if (this.props.userAIStatus && isAIUser) {
                                        const formType = url.includes("/reports") ? FormTypes.Report.toLowerCase() : FormTypes.Assessment.toLowerCase();
                                        // Post message to trigger dialog
                                        window.postMessage(JSON.stringify({
                                                type: "warp-new-invitation-started-Report",
                                                data: {
                                                    isOpenedPopup: true,
                                                    formType: formType
                                                }
                                            }), window.location.origin);
                                        } else {
                                            this.props.isOpen(true);
                                        }
                                    }}
                                  >
                                    {this.getButtonText()}
                                   {localStorage.getItem("isDiamlersupplier") === "true" ?  <Lock style={{ fontSize: 14, marginLeft: 5 }} /> : null}
                                  </Button>
                                ) : (
                                  ""
                            )
                        ) :
                            (roles.isLocationExecutive() || roles.isOrganizationAdmin()) ?
                                (
                                    url.includes("view") ||
                                        url.includes("edit") ||
                                        url.includes("intro") ? (
                                        ""
                                    ) : roles.isKhaitanInvitee() ? (
                                        ""
                                    ) : url.includes(FormTypesPage.Assessments) || url.includes(FormTypesPage.Reports) ? (
                                  <Button
                                    style={{ margin: 0, opacity: localStorage.getItem("isDiamlersupplier") === "true" ? 0.5 : 1 }}
                                    color="transparent"
                                    className="outline_btn_new"
                                    onClick={() =>{
                                        if(localStorage.getItem("isDiamlersupplier") === "true"){
                                            showLockUpPopup()
                                        return;
                                        }
                                        const isAIUser = (this.props.userAIStatus && this.props.userAIStatus.isAIUser === true) || 
                                                        (this.props.userAIStatus && this.props.userAIStatus.isAIUser === 'true');
                                        if (this.props.userAIStatus && isAIUser) {
                                        const formType = url.includes("/reports") ? FormTypes.Report.toLowerCase() : FormTypes.Assessment.toLowerCase();
                                        // Post message to trigger dialog
                                        window.postMessage(JSON.stringify({
                                                type: "warp-new-invitation-started-Report",
                                                data: {
                                                    isOpenedPopup: true,
                                                    formType: formType
                                                }
                                            }), window.location.origin);
                                        } else {
                                            this.props.isOpen(true);
                                        }
                                    }}
                                  >
                                    {this.getButtonText()}
                                 {localStorage.getItem("isDiamlersupplier") === "true" ?
                                    <Lock style={{ fontSize: 14, marginLeft: 5 }} /> : null}
                                  </Button>
                                ) : (
                                  ""
                            )
                                )
                                : (
                                    ""
                                )}

                    {
                        (roles.isLocationExecutive() || roles.isOrganizationAdmin()) && url.includes("ghgactivity") ? (

                            <Link to="monthly-activity-data" className=""  >
                                <Button color="transparent" className="outline_btn_new"  >
                                    Monthly Activity Data
                                </Button>
                            </Link>

                        ) :
                            (roles.isLocationExecutive() || roles.isOrganizationAdmin()) && url.includes("monthly-activity-data") ? (
                                <>
                                    <Link to="data-upload-logs" className=""  >
                                        <Button color="transparent" className="outline_btn_new">
                                            Data Upload Logs
                                        </Button>
                                    </Link>

                                </>
                            ) : ""

                    }
                    {
                        roles.isOrganizationAdmin() && (url.includes("monthly-activity-data") || url.includes("ghgactivity")) ?
                            <>
                            </> : null
                            // <Button color="transparent" className="outline_btn_new" onClick={this.fetchEmissionFactorData}>
                            //     Download Emission Factors
                            //     {this.state.buttonLoader && <CircularProgress color="inherit" size={18} style={{ marginLeft: 12 }} />}

                            // </Button> : null
                    }
                    {
                        roles.isLocationExecutive() && !roles.isOrganizationAdmin() && this.targetValues.has(this.props.url) ? (

                            <div className="HeaderNewBtnWrapper">
                                <DownloadTemplateDropdown
                                    isIcon={false}
                                    className="DownloadBtn"
                                />
                                <BulkUploadDropdown
                                    uploadActivityCode={this.props.UploadActivityCode}
                                    // UploadActivityCode={
                                    // ()=> thisUploadActivityCode
                                    // }
                                    isIcon={false}
                                    className="UploadBtn"
                                    submitDataHandle={() =>{this.props.refreshIframe();}}
                                />

                            </div>
                        ) : null
                    }
                    {/* For manual entry form UI */}
                    <ManualFormActivityHeaderButton roles={roles} />

                    {/* For AI - Verify Extraction Data Upload History Button */}
                    {
                        (roles.isLocationExecutive() || roles.isOrganizationAdmin()) && url.includes("verify-extracted-data") && (
                            <Link to="data-upload-logs/energy_grid_power" className=""  >
                                <Button color="transparent" className="solid_btn_new"  >
                                    Upload History
                                </Button>
                            </Link>
                        )
                    }

                    {/* Document Repository Header Buttons */}
                    {
                        url.includes("document-repository") && (
                            <div className="HeaderNewBtnWrapper">
                                {(() => {
                                    // Simple approach - check current URL for the action parameter
                                    const currentUrl = window.location.href;
                                    const isOnDocumentLogs = currentUrl.includes('action=document-logs');
                                    
                                    if (isOnDocumentLogs) {
                                        return (
                                            <Button 
                                                color="transparent" 
                                                className="outline_btn_new"
                                                onClick={() => {
                                                    // Navigate back to document repository (remove query params)
                                                    window.location.href = '/document-repository';
                                                }}
                                            >
                                                Document Repository
                                            </Button>
                                        );
                                    } else {
                                        return (
                                            <Button 
                                                color="transparent" 
                                                className="outline_btn_new"
                                                onClick={() => {
                                                    // Navigate to document logs
                                                    window.location.href = '/document-repository?action=document-logs';
                                                }}
                                            >
                                                Document Logs
                                            </Button>
                                        );
                                    }
                                })()}
                            </div>
                        )
                    }

                    {(url.includes("review") && this.state.isreviewer === true) && (
                                        <Button
                                            color="transparent"
                                            className="outline_btn_new"
                                            disabled={!this.state.enable}
                                            onClick={this.handleApproveEntireReport}
                                        >
                                            Approve Entire Report
                                        </Button>
                    )}
                    
                    {this.props.match.params.stepName !== "intro" && (
                        <>
                            {this.props.count > 0 && this.props.QueryBtn && (
                                <Button
                                    color="transparent"
                                    className="outline_btn_new"
                                    onClick={this.handleOpen}
                                >
                                    Questions With Queries + {this.props.count > 9 ? this.props.count : `0${this.props.count}`}
                                </Button>
                            )}
                            {this.state.showViewRecommendation && (this.props.recommendationBtn || localStorage.getItem("isRecommendationIcon") === "true") && this.viewRecommendation.has(isRecommendationBtnAllowed) && (
                                <Button
                                color="transparent"
                                className="outline_btn_new"
                                onClick={this.handleViewRecommendations}
                                >
                                    View Recommendations
                                    </Button>
                                    )}
                                    </>
                                    )
                                    }
                                    {(url.includes("document-repository")) ?
                                    this.getButtonforAI():<></>
                                    }
                                    
                                        </ListItem >
                                        </>
                                        )
                                    }
                    }

                    

// Mapping Redux state to props
const mapStateToProps = (state) => ({
    open: state.drawer.open,
    commentData: state.questionWithQueries.questionWithQueriesData,
    count: state.questionWithQueries.count,
    popupTitle: state.questionWithQueries.popupTitle,
    recommendationUrl: state.viewRecommendations.url,
    recommendationBtn: state.viewRecommendations.recommendationBtn,
    QueryBtn: state.questionWithQueries.show,
    UploadActivityCode: state.BulkUploadStore.uploadActivityCode
});

// Mapping dispatch actions to props
const mapDispatchToProps = {
    isOpen,
    questionWithQuery,
    updateIframe,
    updateTitle,
    QueryButtonShow,
    QueryButtonQwcOpen,
    QueryButtonQwcLoader,
    UpdateQuestionsWithComments,
    refreshIframe

};
export default withRouter(connect(mapStateToProps, mapDispatchToProps)(HeaderButtons));