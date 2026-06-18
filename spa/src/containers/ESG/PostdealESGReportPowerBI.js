import React, { Component } from "react";
import jwt from "jsonwebtoken";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb } from "../../utility";
import Export from "../../assets/img/export.png";
import * as RoleCodes from "../../rolecodes";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import axios from "axios";
import { getNextJSServiceUrl, getServiceUrl } from "../../config";
import { jsPDF } from "jspdf";
import html2canvas from "html2canvas";
import { BorderTop, ChevronLeft, ChevronRight } from "@material-ui/icons";
import MoreVert from "@material-ui/icons/MoreVert";
import { Tab, Tabs } from "react-tabs-scrollable";
import { models } from "powerbi-client";
import { filter } from "lodash";
import PowerBiReportIframe from "../Dashboard/PowerBiReportIframe";

let IsVCUser = false;
let ShowOtherCompanyDetails = false;
let params = "", invitationId = "";
class PostdealESGReport extends Component {
    constructor(props) {
        super(props);
        this.state = {
            loader: true,
            showExport: false,
            dashboardUrl: [],
            value: 0,
            sectionurls: [],
            reportConfig: {
                type: "report",
                embedUrl: undefined,
                accessToken: undefined,
                id: undefined,
                tokenType: models.TokenType.Embed,
                filters: [],
                settings: {
                    panes: {
                        filters: {
                            expanded: false,
                            visible: true,
                        },
                    },
                    background: undefined,
                    navContentPaneEnabled: false,
                },
            },
            tokenExpiration: "",
            intervalinMiliseconds: 5 * 10 * 600000,
            dashboardiFrameHeight: "",
            isBorder: false,
            isPowerBiReport: true,
            sectionheights: [],
        };
    }

    componentDidMount = async () => {
        if (document.querySelector("iframe")) {
            document.querySelector("iframe").addEventListener("load", function (e) {
                console.log(123);
            });
        }
        if (
            localStorage.warpToken === undefined ||
            localStorage.warpToken === null ||
            localStorage.warpToken === "null" ||
            localStorage.warpToken === ""
        ) {
            await this.GetAuthToken();
            if (
                localStorage.warpUserCompanyId === undefined ||
                localStorage.warpUserCompanyId === "null"
            ) {
                const decodedToken = jwt.decode(localStorage.warpToken);
                const warpUserCompanyId =
                    decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
                localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
            }
        } else {
            if (
                localStorage.warpUserCompanyId === undefined ||
                localStorage.warpUserCompanyId === "null"
            ) {
                const decodedToken = jwt.decode(localStorage.warpToken);
                const warpUserCompanyId =
                    decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
                localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
            }
        }

        params = this.getUrlParameter("companyid");
        invitationId = this.getUrlParameter("formInvitationId");
        if (localStorage.emailId === "hawkins.india@yopmail.com" && (invitationId === false || invitationId === "")) {
            invitationId = "0f4eced0-e165-4371-a745-7fe6ce3bccb4"
        } else {
            invitationId = this.getUrlParameter("formInvitationId");
        }

        // let reportName = JSON.parse(localStorage.userType) === (RoleCodes.VENTURECAPITALIST || RoleCodes.LOCATIONEXECUTIVE || RoleCodes.ORGANIZATIONADMIN) ? (invitationId === false || invitationId === "") ? "Post Deal KPI - Demo" : "Postdeal Buyer-Supplier - Demo" : "Postdeal Buyer-Supplier - Demo";
    let reportName = "";
    if(JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN)
    {
      if(invitationId === false || invitationId === ""){
      reportName = "Post Deal KPI - Demo";
      }else{
        reportName = "Postdeal Buyer-Supplier - Demo";
      }
    }else{
      reportName = "Postdeal Buyer-Supplier - Demo";
    }

        if (params !== undefined) {
            if (params !== false) {
                if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
                    ShowOtherCompanyDetails = true;
                    await this.getPowerBIToken(reportName, false);
                } else {
                    ShowOtherCompanyDetails = false;
                    await this.getPowerBIToken(reportName, false);
                }
            } else {
                ShowOtherCompanyDetails = false;
                params = localStorage.warpUserCompanyId;
                await this.getPowerBIToken(reportName, false);
            }
        } else {
            ShowOtherCompanyDetails = false;
            params = localStorage.warpUserCompanyId;
            await this.getPowerBIToken(reportName, false);
        }
        setTimeout(() => {
            this.setState({ loader: false })
        }, 6800)

        this.timer = setTimeout(() => {
            console.log('1 hour has passed!');
            this.startInterval();
        }, 7200);
    };

    getUrlParameter = (sParam) => {
        var sPageURL = window.location.search.substring(1),
            sURLVariables = sPageURL.split("&"),
            sParameterName,
            i;

        for (i = 0; i < sURLVariables.length; i++) {
            sParameterName = sURLVariables[i].split("=");

            if (sParameterName[0] === sParam) {
                return typeof sParameterName[1] === undefined
                    ? true
                    : decodeURIComponent(sParameterName[1]);
            }
        }
        return false;
    };

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
                localStorage.setItem("warpToken", json.data);
                const decodedToken = jwt.decode(json.data);
                const warpUserCompanyId =
                    decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
                localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
            })
            .catch((err) =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? (window.location.pathname = "/logout")
                        : ""
                    : ""
            );
    }

    pdfDownload = async (e, chartNo) => {
        window.print();
    };

    individualKPIdonwload = (e, gridValue) => {
        // console.log(1111,document.body.scrollWidth)
        var newWindowContent = e.target.parentNode.innerHTML;
        var newWindow = window.open(
            "",
            "",
            "width=" +
            document.body.scrollWidth +
            ", height=" +
            document.body.scrollHeight
        );
        newWindow.document.write(
            '<html><head><title>Click Export & Save as pdf</title><link rel="stylesheet" type="text/css" href="print.css"></head><body>'
        );
        newWindow.document.write(
            '<div class="pdf_new_window" style="position:relative;width:99%;padding-left:5px">'
        );
        newWindow.document.write(newWindowContent);
        newWindow.document.write("</div>");
        newWindow.document.write("</body></html>");
        if (gridValue === "grid_6") {
            newWindow.document.body.classList.add("grid_6");
        }
        if (newWindow.document.querySelector(".pdfClick")) {
            newWindow.document
                .querySelector(".pdfClick")
                .addEventListener("click", () => {
                    newWindow.print();
                });
        }
    };

    async getDashboardUrl(companyGuid) {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "CompanyGuid": companyGuid,
                "DashboardType": "postdealesgreportpowerbi"
            }
        };
        await axios
            .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
            .then(json => {
                if (json.status === 200) {
                    let url = "";
                    if (JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER || ShowOtherCompanyDetails === true) {
                        url = json.data.filter(
                            (x) =>
                                x.dashboardType === "postdealesgreportpowerbi" &&
                                x.companyType === "Portfolio Company"
                        );
                    }
                    else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
                        url = json.data.filter(
                            (x) =>
                                x.dashboardType === "postdealesgreportpowerbi" &&
                                x.companyType === "VC Company"
                        );
                    }
                    this.setState({ 
                        dashboardUrls: url,
                        dashboardiFrameHeight: url[0].dashboardHeight,
                        isBorder: url[0].isBorder,
                        isPowerBiReport: url[0].isPowerBiReport,
                    });
                }
            })
            .catch(err =>
                err.response !== undefined
                    ? err.response.status === 401
                        ? (window.location.pathname = "/logout")
                        : ""
                    : ""
            );
    }

    handleChange = (event, value) => {
        this.setState({ value });
    };

    getPowerBIToken = async (ReportName, Isupdate) => {
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                rname: ReportName
            },
            maxBodyLength: Infinity,
        };
        await axios
            .post(getNextJSServiceUrl() + "environmental-dashboard/PowerBiTokenGeneration", null, config)
            .then(response => {
                if (response.status === 200) {
                    if (response.data !== undefined) {
                        let filterData = response.data.value.filters;
                        let filterData1 = JSON.parse(JSON.stringify(filterData))
                        let filterData2 = ReportName === "Post Deal KPI - Demo" ? JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.warpUserCompanyId + '"'))
                            : JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + params + '"').replaceAll("@warpInvitationId", '"' + invitationId + '"'))

                        //section url
                        let sectionUrl = response.data.value.sectionurl;
                        let sectionUrls = ReportName === "Post Deal KPI - Demo" ? JSON.parse(JSON.parse(JSON.stringify(sectionUrl))) : "";
                        let sectionHeight = response.data.value.dashboardHeight;
                        let sectionHeights = JSON.parse(JSON.parse(JSON.stringify(sectionHeight)));

                        let data = this.state.reportConfig;
                        let data1 = {
                            ...data,
                            filters: filterData2.filters,
                            sectionurl: sectionUrls,
                            settings: filterData2.settings,
                            embedUrl: response.data.value.embedUrl,
                            accessToken: response.data.value.token,
                            id: response.data.value.id,
                        }
                        this.setState({
                            reportConfig: data1,
                            sectionurls: sectionUrls,
                            loader: false,
                            tokenExpiration: response.data.date1,
                            dashboardiFrameHeight: response.data.value.dashboardHeight,
                            isBorder: response.data.value.isBorder,
                            isPowerBiReport: response.data.value.isPowerBiReport,
                            sectionheights: sectionHeights
                        })

                        if (Isupdate !== undefined && Isupdate === true) {
                            const tokenExpiration = new Date(response.data.date1);
                            if (tokenExpiration !== undefined && tokenExpiration !== null) {
                                console.log(tokenExpiration);
                                this.updateIntervalTime(tokenExpiration, ReportName);
                            }
                        }
                    }
                }
            })
    }

    // Clean up the interval on component unmount
  componentWillUnmount() {
    clearTimeout(this.timer);
    clearInterval(this.interval);
    console.log("Interval cleared");
  }

  getmiliseconds = (tokenExpiration) => {
    // Convert to milliseconds
    const currentmilliseconds = new Date().getTime();
    // Convert UTC to IST (UTC + 5 hours 30 minutes)
    const istOffset = 5.4 * 60; // IST offset in minutes (5 hours 30 minutes)
    const tokenExpirationmilliseconds = new Date(tokenExpiration.getTime() + (istOffset * 60 * 1000)); // Add offset to UTC time
    console.log("milliseconds", tokenExpirationmilliseconds);
    console.log("currentmilliseconds", currentmilliseconds);
    let intervalinMiliseconds = tokenExpirationmilliseconds - currentmilliseconds;
    console.log("intervalinMiliseconds", intervalinMiliseconds);
    if (isNaN(intervalinMiliseconds)) {
        intervalinMiliseconds = 5 * 10 * 600000;
    } else if (intervalinMiliseconds === 0) {
        intervalinMiliseconds = 5 * 10 * 600000;
    }
    console.log("intervalinMiliseconds1", intervalinMiliseconds)
    this.setState({ intervalinMiliseconds: intervalinMiliseconds });
    return intervalinMiliseconds;
  };


  // Function to start the interval
  startInterval = (ReportName) => {
      clearInterval(this.interval); // Clear any existing interval

      if (this.state.tokenExpiration !== undefined && this.state.tokenExpiration !== null && this.state.tokenExpiration !== "") {
          console.log("this.state.tokenExpiration", this.state.tokenExpiration);
          const tokenExpiration = new Date(this.state.tokenExpiration);
          if (tokenExpiration !== undefined && tokenExpiration !== null) {
              console.log(tokenExpiration);

              const intervalinMiliseconds = this.getmiliseconds(tokenExpiration);
              
              let reportName = "";
              if(JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN)
              {
                if(invitationId === false || invitationId === ""){
                reportName = "Post Deal KPI - Demo";
                }else{
                  reportName = "Postdeal Buyer-Supplier - Demo";
                }
              }else{
                reportName = "Postdeal Buyer-Supplier - Demo";
              }
              this.interval = setInterval(() => {
                  console.log('1 hour has passed!'+ reportName, intervalinMiliseconds);
                  this.getPowerBIToken(reportName, true);
              }, intervalinMiliseconds);
          }
      }
  };


  // Function to update the interval time
  updateIntervalTime = (newTime, ReportName) => {
      this.setState({ tokenExpiration: newTime }, this.startInterval(ReportName));
  };

  getReportCSS = (type) => {
    switch (type) {
        case "Overall ESG Performance":
            return { className: "power-bi-postdeal-overall-esg-report-class" };
        case "Sector level ESG Performance":
            return { className: "power-bi-postdeal-sector-level-esg-report-class" };
        case "Portfolio ESg Risk Analysis":
            return { className: "power-bi-postdeal-portfolio-report-class" };
        case "Key data Points":
            return { className: "power-bi-postdeal-key-data-points-report-class" };
        default:
            return { className: "default-class" };
      }
    };

    render() {
        console.log("reportConfig", this.state.reportConfig, params)
        let reportConfigArr = [];
        for (let i = 0; i < this.state.sectionurls.length; i++) {
            reportConfigArr.push({
                section: this.state.sectionurls[i].section,
                reportConfigData: {
                    id: this.state.reportConfig.id,
                    type: this.state.reportConfig.type,
                    tokenType: this.state.reportConfig.tokenType,
                    settings: this.state.reportConfig.settings,
                    filters: this.state.reportConfig.filters,
                    embedUrl: this.state.reportConfig.embedUrl + this.state.sectionurls[i].url,
                    accessToken: this.state.reportConfig.accessToken
                },
                cssClassName: this.getReportCSS(this.state.sectionurls[i].section).className,
                iFrameHeight: this.state.sectionurls[i].section === this.state.sectionheights[i].section ? this.state.sectionheights[i].sectionHeight : 1500
            })
        }

        const { value } = this.state;
        return (
            <div id="pdf-view">
                <React.Fragment>
                    {this.state.loader && this.state.reportConfig.length === 0 ? (
                        <Spinner />
                    ) : (
                        <React.Fragment>
                            <div className="">
                                {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER ?
                                    <PowerBiReportIframe
                                        embedConfig={this.state.reportConfig}
                                        cssClassName={"power-bi-postdeal-report-class-pc-new"}
                                        iframeHeight={this.state.dashboardiFrameHeight}
                                        isPowerBiReport={this.state.isPowerBiReport}
                                        withBorder={this.state.isBorder}
                                    />
                                    :
                                    <div>
                                        {invitationId === false || invitationId === "" ? (
                                            <div>
                                                <Tabs
                                                    tabsContainerClassName="guidelines_tabs"
                                                    leftBtnIcon={<ChevronLeft />}
                                                    rightBtnIcon={<ChevronRight />}
                                                    activeTab={value}
                                                    onTabClick={this.handleChange}
                                                >
                                                    {reportConfigArr.map((item, index) => (
                                                        <Tab key={index}>{item.section}</Tab>
                                                    ))}
                                                </Tabs>
                                                {reportConfigArr[value] && (
                                                    <PowerBiReportIframe
                                                        key={reportConfigArr[value].iFrameHeight}
                                                        embedConfig={reportConfigArr[value].reportConfigData}
                                                        cssClassName={`${reportConfigArr[value].cssClassName}_new`}
                                                        iframeHeight={reportConfigArr[value].iFrameHeight}
                                                        isPowerBiReport={this.state.isPowerBiReport}
                                                        withBorder={this.state.isBorder}
                                                    />
                                                )}
                                            </div>
                                        ) : (
                                            <PowerBiReportIframe
                                                embedConfig={this.state.reportConfig}
                                                cssClassName="power-bi-postdeal-report-class-pc_newer"
                                                iframeHeight={this.state.dashboardiFrameHeight}
                                                isPowerBiReport={this.state.isPowerBiReport}
                                                withBorder={this.state.isBorder}
                                            />
                                        )}
                                    </div>
                                }
                            </div>
                        </React.Fragment>
                    )}
                </React.Fragment>
            </div>
        );
    }
}
export default PostdealESGReport;
