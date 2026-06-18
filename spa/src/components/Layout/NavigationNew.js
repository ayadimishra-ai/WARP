import React, { Component } from "react";
import { Link, withRouter } from "react-router-dom";
import { connect } from "react-redux";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import CustomDropdown from "../Material/CustomDropdown/CustomDropdown";
import { Divider, Grid, Tooltip } from "@material-ui/core";
import history from "../../history";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import { withStyles } from "@material-ui/core/styles";
import HeaderButtons from "../Header/HeaderButtons";
import * as actionCreators from "../../store/actions/index";
import { updateCount } from "../../store/actions/questionWithQueries";
import { viewRecommendationsOpen } from "../../store/actions/viewRecommedations";
import InfoOutlined from "@material-ui/icons/InfoOutlined";
import { decodeOpAccessToken, isAdmin } from "../../utility";
import { getNextJSServiceUrl } from "../../config";
import axios from "axios";

class NavigationNew extends Component {
    constructor(props, context) {
        super(props, context);
        this.state = {
            forceUpdate: 0
        };
        this.logoutHandler = this.logoutHandler.bind(this);
        this.handleUrlChange = this.handleUrlChange.bind(this);
    }

    componentDidMount() {
        // Listen for browser back/forward navigation
        window.addEventListener('popstate', this.handleUrlChange);
        
        // Store current URL to detect changes
        this.currentUrl = window.location.href;
        
        // Check for URL changes every 300ms (optimized from 100ms for better performance)
        this.urlCheckInterval = setInterval(() => {
            if (this.currentUrl !== window.location.href) {
                this.currentUrl = window.location.href;
                this.handleUrlChange();
            }
        }, 300); // Reduced frequency for optimization
    }

    componentWillUnmount() {
        // Clean up event listeners and intervals
        window.removeEventListener('popstate', this.handleUrlChange);
        if (this.urlCheckInterval) {
            clearInterval(this.urlCheckInterval);
        }
    }

    handleUrlChange() {
        // Force component re-render to update page title
        this.setState(prevState => ({
            forceUpdate: prevState.forceUpdate + 1
        }));
    }

    logoutHandler() {
        this.props.onClearCount(0);
        this.props.onViewRecommendation(false);
        localStorage.setItem("isRecommendationIcon",false)
        localStorage.setItem("isDiamlersupplier", null);
        const Options = {
            method: "POST",
            url: getNextJSServiceUrl() + "session/UpdateUserSession",
            headers: {
                "Content-Type": "application/json",
                Authorization: "Bearer " + localStorage.getItem("tokenId"),
                BrowserToken: localStorage.getItem('BrowserToken'),
                userId:  localStorage.getItem('userId')
            },
            data: []
        };
        
        axios.request(Options).then((response) => {
            console.log("User session logged out successfully:", response);
        }).catch((error) => {
            console.error("Error creating user session:", error);
        });
        this.props.onAuthLogout();
        history.push("/");
    }

    getPageHeading=()=>{
        let url = window.location.href;
        const pageURL=url.split('/')[3]
        let pageTitle=this.props.SideMenu.filter(menu=>
            menu.url===pageURL).length>0?this.props.SideMenu.filter(menu=>
                menu.url===pageURL)[0].resourceValue:""
        if(!pageTitle){
            if(pageURL==="assessmentrecommendation")
                pageTitle = "Recommendation Listing"
            else if(pageURL==="AssessmentIntroDetails" || pageURL==="assessmentDetails" || pageURL==="AssessmentRecommendationDetails" || pageURL === "ai-statistics")
            pageTitle= this.props.sub_heading; 
            else if(pageURL==="assessments" || pageURL==="AssessmentRecommendationDetails")
            pageTitle="Assessments"
            else if(pageURL.includes("listing-page"))
            pageTitle= "Products"
            else if(pageURL.includes("product-details"))
            pageTitle= "Product Details"
            if(pageURL==="monthly-activity-data")
            pageTitle="Monthly Activity Data"
            if(pageURL==="myaccount")
            pageTitle="My Account"
            if(pageURL==="ghg-dashboard")
            pageTitle="GHG Dashboard"
            if(pageURL==="ghg-forms")
            pageTitle=<h4>GHG Forms {this.props.history.location.state && <>- {this.props.history.location.state.date}</>} {this.props.history.location.state && <>- {this.props.history.location.state.loc}</>}</h4>
            if(pageURL==="ghgactivity?isAI=false")
            pageTitle="Data Update Logs"
            if(pageURL.includes("verify-extracted-data"))
            pageTitle="Extracted Data"
            if(pageURL.includes("corporate-dashboard"))
            pageTitle="Corporate Dashboard"
            if(pageURL.includes("reports"))
            pageTitle="ESG Reporting";
            if(pageURL.includes("Questionnaire"))
            pageTitle="Questionnaire Management";
            if(pageURL.includes("document-repository?action=document-logs"))
            pageTitle="Document Logs"
            else if(pageURL.includes("document-repository"))
            pageTitle="Document Repository"
            if(pageURL.includes("Questionnaire"))
            pageTitle="Questionnaire Management";
            if(pageURL.includes("ghg"))
            pageTitle="Activity Data";
            if(pageURL.includes("data-upload-logs"))
            pageTitle="Data Upload Logs";
        }   
        if (pageTitle && typeof pageTitle === "string") {
            localStorage.setItem("activeMenuName", pageTitle);
        }
        return pageTitle
    }

    
    getInfoTooltip(pageTitle) {
        const tooltipMap = {
            "Document Repository": "Store your company documents in one place. Our AI can use your documents to provide suggestions and pre-fill responses in all AI-enabled reports and assessments.",
            "Assessments": "Evaluate and track your company's performance and progress toward specific environmental, social, and governance (ESG) goals.",
            "ESG Reporting": "Generate reports to disclose your company's environmental, social, and governance (ESG) data to investors, clients, and regulatory bodies.",
            "Document Logs": "View the complete history of all your uploaded and deleted files across all assessments and reports.",
            "Chat With Snowkap AI": "Engage with Snowkap's AI to get insights, suggestions, and assistance related to your ESG data and reporting needs."
        };
        if (pageTitle === "Extracted Data") {
            const isadmin = isAdmin(decodeOpAccessToken(localStorage.opsToken));
            return isadmin
                ? "View the extracted and verified data for this file."
                : "Review and confirm the data extracted from your uploaded file.";
        }
        return tooltipMap[pageTitle] || "";
    }


    render(){
        let url = window.location.href;
        const pageTitle= this.getPageHeading();
         const infoTooltip = this.getInfoTooltip(pageTitle);
        // Map page titles to tooltip messages
        // Example: show different tooltip for 'Extracted Data' page based on admin status
        return (
            <React.Fragment>
                <Grid className="new_header_UI_top">
                    <div className="left_header_links">
                        <List className={this.props.classes.list + ' left_header'}>
                            <ListItem className="title">
                                <div className="page_heading" style={{ textTransform: "capitalize"}}>
                                    {
                                        pageTitle?
                                        <h4>{pageTitle}</h4>:''
                                    }
                                    {infoTooltip && (
                                        <Tooltip placement="bottom-start" title={infoTooltip}>
                                            <InfoOutlined
                                                className={this.props.classes.infoIcon}
                                            />
                                        </Tooltip>
                                    )}
                                </div>
                            </ListItem>
                            <HeaderButtons
                                url={this.props.urlValue}
                                data={this.props.data}
                                userAIStatus={this.props.userAIStatus}
                            />
                        </List>
                    </div>
                    <div className="right_header_links">
                        <List className={this.props.classes.list  + ' my-acct-dropdwn-container'}>
                            <ListItem className={this.props.classes.listItem}>
                                <CustomDropdown
                                    caret={true}
                                    noLiPadding
                                    hoverColor="dark"
                                    dropPlacement={'bottom-end'}
                                    buttonText={
                                        <>
                                        <div className={' my_acct_dropdwn'}>
                                            {this.props.userInitial}
                                        </div>
                                        </>
                                    }
                                    buttonProps={{
                                        className:
                                            this.props.classes.navLink + ' my-acct-btn-div',
                                        color: "transparent"
                                    }}
                                    dropdownList={[
                                        <Link to='/myaccount' className={this.props.classes.dropdownLink + ' btn-link-acct'}>
                                            My Account
                                        </Link>,
                                        <Divider style={{ backgroundColor: '#e3e3e3', marginLeft: '13px', height: 1.5 }} variant="middle" />,
                                        <Link
                                            to="/"
                                            onClick={this.logoutHandler}
                                            className={this.props.classes.dropdownLink}
                                        >
                                            Sign out
                                        </Link>
                                    ]}
                                />
                            </ListItem>
                        </List>
                    </div>
                </Grid>
            </React.Fragment >
        );
    }
}
const mapStateToProps = state => {
    return {
        userInitial: state.login.userInitial,
        sub_heading:state.subHeadings.sub_heading
    };
};
const mapDispatchToProps = dispatch => {
    return {
        onAuthLogout: () => dispatch(actionCreators.logout()),
        onClearCount:()=>dispatch(updateCount()),
        onViewRecommendation:()=>dispatch(viewRecommendationsOpen())
    };
};

export default connect(
  mapStateToProps, mapDispatchToProps
)(withRouter(withStyles(navbarsStyle)(NavigationNew)));