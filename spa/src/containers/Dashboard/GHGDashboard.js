/*import React from "react";

export default function App() {
    return (
        <div className="">
            <iframe
                scrolling="no"
                title="Dasboard"
                id="iframeDasboard"
                src="https://datastudio.google.com/embed/reporting/80102ff6-6ea6-4a5f-8dcc-ac12accf6414/page/EVOyC"
                frameBorder="0"
                style={{ width: '100%' }}
                height="1050"
                allowFullScreen
            />
        </div>
    );
}*/

import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { getNextJSServiceUrl, getUserPermision } from "../../config";
import * as RoleCodes from "../../rolecodes";
import jwt from "jsonwebtoken";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import { isFlipkartUser } from "../../ops/flipkartPOC.service";
import Tabs1 from '@material-ui/core/Tabs';
import Tab1 from '@material-ui/core/Tab';
import { Tabs, Tab } from "react-tabs-scrollable";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";
import { models } from "powerbi-client";
import PowerBiReportIframe from "./PowerBiReportIframe";


let params = "";
let ShowOtherCompanyDetails = false;
class GHGDashboard extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dashboardUrls: [],
            loader: true,
            tabValue: 0,
            value: 0,
            reportName: "",
            reportNameClass: "",
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
                    navContentPaneEnabled: false,
                    background: undefined,
                },
            },
            tokenExpiration: "",
            intervalinMiliseconds: 5 * 10 * 600000,
            dashboardiFrameHeight: "",
            isBorder: false,
            isPowerBiReport: true,
            sectionheights: [],
        }
    }

    componentDidMount = async () => {
        this.getDashboardUrl();

        //params = this.getUrlParameter("companyid");
        //if (params !== undefined) {
        //    if (params !== false) {
        //        if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
        //            ShowOtherCompanyDetails = true;
        //            await this.getDashboardUrl(params);
        //        } else {
        //            ShowOtherCompanyDetails = false;
        //            await this.getDashboardUrl(localStorage.warpUserCompanyId);
        //        }
        //    } else {
        //        ShowOtherCompanyDetails = false;
        //        params = localStorage.warpUserCompanyId;
        //        await this.getDashboardUrl(localStorage.warpUserCompanyId);
        //    }
        //} else {
        //    ShowOtherCompanyDetails = false;
        //    params = localStorage.warpUserCompanyId;
        //    await this.getDashboardUrl(localStorage.warpUserCompanyId);
        //}
        if (localStorage.warpToken !== null && localStorage.warpToken !== "null"
            && localStorage.warpToken !== undefined && localStorage.warpToken !== "undefined") {
            try {
                const decodedToken = jwt.decode(localStorage.warpToken);
                
                // Check if token was successfully decoded and has the required claims
                if (decodedToken && decodedToken["https://hasura.io/jwt/claims"] && decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"]) {
                    const warpUserCompanyId =
                        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
                    localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
                    params = warpUserCompanyId;
                } else {
                    console.warn("Invalid token or missing claims, falling back to companyGuid");
                    params = localStorage.companyGuid;
                }
            } catch (error) {
                console.error("Error decoding JWT token:", error);
                params = localStorage.companyGuid;
            }
        }
        else {
            params = localStorage.companyGuid;
        }
    }

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

    async getDashboardUrl() {
        
        var config = {
            headers: {
                Authorization: "Bearer " + localStorage.tokenId,
                "Content-Type": "application/json",
                "CompanyGuid": localStorage.companyGuid,
                "DashboardType": "ghgdashboard"
            }
        };
        await axios
            .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
            .then(json => {
                // console.log(json)
                if (json.status === 200) {
                    if (json.data !== undefined) {
                        //this.setState({ dashboardUrls: json.data[0].url, loader: false });

                        if (json.data !== undefined) {
                            let url = "", reportName = "";
                            if (
                                JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
                                JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
                                ShowOtherCompanyDetails === true
                            ) {
                                url = json.data.filter(
                                    (x) =>
                                        x.dashboardType === "ghgdashboard" &&
                                        x.companyType === "Portfolio Company"
                                );
                                reportName = json.data.filter(
                                    (x) =>
                                        x.dashboardType === "ghgdashboard" &&
                                        x.companyType === "Portfolio Company"
                                )[0].reportName;
                            } else if (
                                JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
                            ) {
                                url = json.data.filter(
                                    (x) =>
                                        x.dashboardType === "ghgdashboard" &&
                                        x.companyType === "VC Company"
                                );
                                reportName = json.data.filter(
                                    (x) =>
                                        x.dashboardType === "ghgdashboard" &&
                                        x.companyType === "VC Company"
                                )[0].reportName;
                            } else if (
                                JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN
                            ) {
                                url = json.data.filter(
                                    (x) =>
                                        x.dashboardType === "ghgdashboard" &&
                                        x.companyType === "Portfolio Company"
                                );
                                reportName = json.data.filter(
                                    (x) =>
                                        x.dashboardType === "ghgdashboard" &&
                                        x.companyType === "Portfolio Company"
                                )[0].reportName;
                            } else if (
                                JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE
                            ) {
                                url = json.data.filter(
                                    (x) =>
                                        x.dashboardType === "ghgdashboard" &&
                                        x.companyType === "VC Company"
                                );
                                reportName = json.data.filter(
                                    (x) =>
                                        x.dashboardType === "ghgdashboard" &&
                                        x.companyType === "VC Company"
                                )[0].reportName;
                            }

                            if (reportName !== undefined && reportName !== null &&
                                (localStorage.companyGuid === "8c2d2513-51fa-4024-a442-4bd8a6121a87"
                                    || localStorage.companyGuid === "7661607a-93fc-4950-a2e6-d9fd6a1e3794"
                                    || localStorage.companyGuid === "3cd092b2-d71c-4341-ab91-7535bf628719"
                                    || localStorage.companyGuid === "1b847b5d-140e-44b4-b037-4dd85ab43ec6")) {
                                this.getPowerBIToken(reportName, false)
                            } else if (localStorage.companyGuid === "8081ad1f-c4f1-4e80-ae13-ba556ec101bd") {
                                this.getPowerBIToken("GHG Dashboard v6  Logistics Operation", false)
                            }
                            setTimeout(() => {
                                this.setState({ loader: false })
                            }, 5000)
                            this.setState({
                                dashboardUrls: url,
                                dashboardiFrameHeight:url[0].dashboardHeight,
                                isBorder: url[0].isBorder,
                                isPowerBiReport: url[0].isPowerBiReport,
                                reportName: reportName
                            });

                            this.timer = setTimeout(() => {
                                console.log('1 hour has passed!');
                                this.startInterval(reportName);
                            }, 7200);
                        }
                    }
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

    tabChange = (event, tabValue) => {
        this.setState({ tabValue });
    };

    handleChange = (event, newValue) => {
        this.setState({ value: newValue }, () => {
            this.forceUpdate();
        });
    };
    //  reportMapping = {
    //     "GHG Dashboard v4": { name: "GHG Dashboard v4", iframeHeight: 1800 },
    //     "HDFC Capital OR IndusInd GHG V4": { name: "HDFC Capital OR IndusInd GHG V4", iframeHeight: 3136 },
    //     "GHG Dashboard v6  India Cement Sector": { name: "GHG Dashboard v6 India Cement Sector", iframeHeight: 2500 },
    //     "GHG Dashboard v6  Logistics Operation": { name: "GHG Dashboard v6 Logistics Operation", iframeHeight: 3191 },
    //     "IHC GHG V4": { name: "IHC GHG V4", iframeHeight: 2348 },
    // };
    reportMapping = {
        "GHG Dashboard v4": { name: "GHG Dashboard v4" },
        "HDFC Capital OR IndusInd GHG V4": { name: "HDFC Capital OR IndusInd GHG V4" },
        "GHG Dashboard v6  India Cement Sector": { name: "GHG Dashboard v6 India Cement Sector" },
        "GHG Dashboard v6  Logistics Operation": { name: "GHG Dashboard v6 Logistics Operation" },
        "IHC GHG V4": { name: "IHC GHG V4" },
    };
    getPowerBIToken = async (ReportName, Isupdate) => {
        // console.log("ReportName:", ReportName);
        
        const mappedReportName = this.reportMapping[ReportName] || { name: "Unknown Report" };
        this.setState({ reportNameClass: mappedReportName.name.replace(/ /g, "_") })
        const token = localStorage.tokenId;
        if (!token) {
            console.error("Token is missing");
            return;
        }
        const config = {
            headers: {
                Authorization: "Bearer " + token,
                "Content-Type": "application/json",
                rname: ReportName.trim()
            },
            maxBodyLength: Infinity,
        };
        try {
            const response = await axios.post(getNextJSServiceUrl() + "environmental-dashboard/PowerBiTokenGeneration", null, config);
            if (response.status === 200) {
                // Process response data here
                // console.log("API response:", response.data);
                if (response.status === 200) {
                    if (response.data !== undefined) {
                        //section url
                        if (response.data.value.sectionurl !== "") {
                            if (response.data.value.filters !== "" && response.data.value.filters !== null) {
                                let filterData = response.data.value.filters;
                                let filterData1 = JSON.parse(JSON.stringify(filterData))
                                let filterData2 = JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.warpUserCompanyId + '"'))

                                let sectionUrl = response.data.value.sectionurl;
                                let sectionUrls = JSON.parse(JSON.parse(JSON.stringify(sectionUrl)));
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
                            } else {
                                let sectionUrl = response.data.value.sectionurl;
                                let sectionUrls = JSON.parse(JSON.parse(JSON.stringify(sectionUrl)));
                                let sectionHeight = response.data.value.dashboardHeight;
                                let sectionHeights = JSON.parse(JSON.parse(JSON.stringify(sectionHeight)));

                                let data = this.state.reportConfig;
                                let data1 = {
                                    ...data,
                                    sectionurl: sectionUrls,
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
                            }
                        } else {
                            if (response.data.value.filters !== "" && response.data.value.filters !== null) {
                                let filterData = response.data.value.filters;
                                let filterData1 = JSON.parse(JSON.stringify(filterData))
                                let filterData2 = ReportName === "GHG Dashboard v6  India Cement Sector" ? JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.companyGuid + '"')) : JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.warpUserCompanyId + '"'))

                                let data = this.state.reportConfig;
                                let data1 = {
                                    ...data,
                                    filters: filterData2.filters,
                                    settings: filterData2.settings,
                                    embedUrl: response.data.value.embedUrl,
                                    accessToken: response.data.value.token,
                                    id: response.data.value.id,
                                }
                                this.setState({
                                    reportConfig: data1,
                                    loader: false,
                                    tokenExpiration: response.data.date1,
                                    dashboardiFrameHeight: response.data.value.dashboardHeight,
                                    isBorder: response.data.value.isBorder,
                                    isPowerBiReport: response.data.value.isPowerBiReport,
                                })
                            } else {
                                let data = this.state.reportConfig;
                                let data1 = {
                                    ...data,
                                    embedUrl: response.data.value.embedUrl,
                                    accessToken: response.data.value.token,
                                    id: response.data.value.id,
                                }
                                this.setState({
                                    reportConfig: data1,
                                    loader: false,
                                    tokenExpiration: response.data.date1,
                                    dashboardiFrameHeight: response.data.value.dashboardHeight,
                                    isBorder: response.data.value.isBorder,
                                    isPowerBiReport: response.data.value.isPowerBiReport,
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
                    }
                }
            }
        } catch (error) {
            console.error("Error in API call:", error);
        }
    };


    // getPowerBIToken1 = async (ReportName) => {
    //     var config = {
    //         headers: {
    //             Authorization: "Bearer " + localStorage.tokenId,
    //             "Content-Type": "application/json",
    //             rname: ReportName.trim(),
    //         },
    //         maxBodyLength: Infinity,
    //     };

    //     await axios
    //         .post(getServiceUrl() + "Users/PowerBIReportDetails", null, config)
    //         .then(response => {
    //             if (response.status === 200) {
    //                 if (response.data !== undefined) {
    //                     //section url
    //                     if (response.data.value.sectionurl !== "") {
    //                         if (response.data.value.filters !== "" && response.data.value.filters !== null) {
    //                             let filterData = response.data.value.filters;
    //                             let filterData1 = JSON.parse(JSON.stringify(filterData))
    //                             let filterData2 = JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.warpUserCompanyId + '"'))

    //                             let sectionUrl = response.data.value.sectionurl;
    //                             let sectionUrls = JSON.parse(JSON.parse(JSON.stringify(sectionUrl)));
    //                             let sectionHeight = response.data.value.dashboardHeight;
    //                             let sectionHeights = JSON.parse(JSON.parse(JSON.stringify(sectionHeight)));

    //                             let data = this.state.reportConfig;
    //                             let data1 = {
    //                                 ...data,
    //                                 filters: filterData2.filters,
    //                                 sectionurl: sectionUrls,
    //                                 settings: filterData2.settings,
    //                                 embedUrl: response.data.value.embedUrl,
    //                                 accessToken: response.data.value.token,
    //                                 id: response.data.value.id,
    //                             }
    //                             this.setState({
    //                                 reportConfig: data1,
    //                                 sectionurls: sectionUrls,
    //                                 dashboardiFrameHeight: response.data.value.dashboardHeight,
    //                                 isBorder: response.data.value.isBorder,
    //                                 isPowerBiReport: response.data.value.isPowerBiReport,
    //                                 sectionheights: sectionHeights
    //                             })
    //                         } else {
    //                             let sectionUrl = response.data.value.sectionurl;
    //                             let sectionUrls = JSON.parse(JSON.parse(JSON.stringify(sectionUrl)));
    //                             let sectionHeight = response.data.value.dashboardHeight;
    //                             let sectionHeights = JSON.parse(JSON.parse(JSON.stringify(sectionHeight)));

    //                             let data = this.state.reportConfig;
    //                             let data1 = {
    //                                 ...data,
    //                                 sectionurl: sectionUrls,
    //                                 embedUrl: response.data.value.embedUrl,
    //                                 accessToken: response.data.value.token,
    //                                 id: response.data.value.id,
    //                             }
    //                             this.setState({
    //                                 reportConfig: data1,
    //                                 sectionurls: sectionUrls,
    //                                 dashboardiFrameHeight: response.data.value.dashboardHeight,
    //                                 isBorder: response.data.value.isBorder,
    //                                 isPowerBiReport: response.data.value.isPowerBiReport,
    //                                 sectionheights: sectionHeights
    //                             })
    //                         }
    //                     } else {
    //                         if (response.data.value.filters !== "" && response.data.value.filters !== null) {
    //                             let filterData = response.data.value.filters;
    //                             let filterData1 = JSON.parse(JSON.stringify(filterData))
    //                             let filterData2 = JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.warpUserCompanyId + '"'))

    //                             let data = this.state.reportConfig;
    //                             let data1 = {
    //                                 ...data,
    //                                 filters: filterData2.filters,
    //                                 settings: filterData2.settings,
    //                                 embedUrl: response.data.value.embedUrl,
    //                                 accessToken: response.data.value.token,
    //                                 id: response.data.value.id,
    //                             }
    //                             this.setState({
    //                                 reportConfig: data1,
    //                                 dashboardiFrameHeight: response.data.value.dashboardHeight,
    //                                 isBorder: response.data.value.isBorder,
    //                                 isPowerBiReport: response.data.value.isPowerBiReport,
    //                             })
    //                         } else {
    //                             let data = this.state.reportConfig;
    //                             let data1 = {
    //                                 ...data,
    //                                 embedUrl: response.data.value.embedUrl,
    //                                 accessToken: response.data.value.token,
    //                                 id: response.data.value.id,
    //                             }
    //                             this.setState({
    //                                 reportConfig: data1,
    //                                 dashboardiFrameHeight: response.data.value.dashboardHeight,
    //                                 isBorder: response.data.value.isBorder,
    //                                 isPowerBiReport: response.data.value.isPowerBiReport,
    //                             })
    //                         }
    //                     }
    //                 }
    //             }
    //         })
    // }

    getReportCSS = (type) => {
        switch (type) {
            case "Carbon Inventory":
                return { className: "power-bi-ghg-v4-carbon-inventory-report-class"};
            case "Trends":
                return { className: "power-bi-ghg-v4-trends-report-class" };
            case "Product Carbon Benchmark":
                return { className: "power-bi-ghg-v4-product-benchmark-report-class" };
            case "Path to Net Zero":
                return { className: "power-bi-ghg-v4-path-net-zero-report-class" };
            case "M-Ceramics":
                return { className: "power-bi-ghg-v4-m-ceramics-report-class", height: 3400 };
            case "X-Ceramics":
                return { className: "power-bi-ghg-v4-x-ceramics-report-class", height: 3400 };
            case 'NhanceKPI':
                return { className: 'NhanceKPI-report-class' };
            case 'LogisticOperation':
                return { className: 'LogisticOperation-report-class', height: 2400 };
            case 'CementKPI':
                return { className: 'CementKPI-report-class', height: 2400 };
            case 'OilAndGasKNPC':
                return { className: 'OilAndGasKNPC-report-class', height: 2400 };
            case 'WellnFineKPI':
                return { className: 'WellnFineKPI-report-class', height: 2400 };
            default:
                return { className: "default-class", height: 1500 };
        }
    };

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
  startInterval = (reportName) => {
      clearInterval(this.interval); // Clear any existing interval

      if (this.state.tokenExpiration !== undefined && this.state.tokenExpiration !== null && this.state.tokenExpiration !== "") {
          console.log("this.state.tokenExpiration", this.state.tokenExpiration);
          const tokenExpiration = new Date(this.state.tokenExpiration);
          if (tokenExpiration !== undefined && tokenExpiration !== null) {
              console.log(tokenExpiration);

              const intervalinMiliseconds = this.getmiliseconds(tokenExpiration);

            // let reportName="";
            // if (localStorage.companyGuid === "8081ad1f-c4f1-4e80-ae13-ba556ec101bd") {
            //     reportName = "GHG Dashboard v6  Logistics Operation";
            // }else{

            // }
              this.interval = setInterval(() => {
                  console.log('1 hour has passed!'+reportName, intervalinMiliseconds);
                  this.getPowerBIToken(reportName, true);
              }, intervalinMiliseconds);
          }
      }
  };


  // Function to update the interval time
  updateIntervalTime = (newTime, ReportName) => {
      this.setState({ tokenExpiration: newTime }, this.startInterval(ReportName));
  };

    render() {
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
                // iFrameHeight: this.getReportCSS(this.state.sectionurls[i].section).height,
                iFrameHeight: this.state.sectionurls[i].section === this.state.sectionheights[i].section ? this.state.sectionheights[i].sectionHeight : 1500
            })
        }
        const { value } = this.state;
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/home" />;
        } else if (getUserPermision(permissions, PageKeys.ghgdashboard) === null) {
            return <Redirect to="/home" />;
        }
        let srcForIQOPs = "";
        if (
            JSON.parse(localStorage.userType) !== RoleCodes.ORGANIZATIONADMIN
        ) {
            srcForIQOPs = params + '%22%7D';
        }

        return (
            isFlipkartUser(localStorage.getItem('emailId')) ? <div className="">

                <div>
                    <Tabs1 value={this.state.tabValue} centered indicatorColor="secondary" onChange={this.tabChange}>
                        <Tab1 label="Summary" />
                        <Tab1 label="Transport" />
                        <Tab1 label="Energy" />
                        <Tab1 label="Waste" />
                        <Tab1 label="Water" />
                        <Tab1 label="Fleet Tracker" />
                        <Tab1 label="Outliers" />
                    </Tabs1>
                    <div className="waterMarkContainer">
                    <div className="waterMarkHide" style={{height:64}}></div>
                        {this.state.tabValue === 0 && <div>
                            <iframe
                                scrolling="no"
                                title="Dasboard"
                                id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiZTZjYTFmYmQtMjUwNy00ODgzLTg1NDAtMzYwMGEzMjk5MDU1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=bd1d924493c0c179a0e1&navContentPaneEnabled=false'}
                                frameBorder="0"
                                style={{ width: '100%' }}
                                height="850"
                                allowFullScreen
                                onLoad={() => this.setState({ loader: false })}
                            />
                        </div>}
                        {this.state.tabValue === 1 && <div>
                            <iframe
                                scrolling="no"
                                title="Dasboard"
                                id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiZTZjYTFmYmQtMjUwNy00ODgzLTg1NDAtMzYwMGEzMjk5MDU1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=14940ae3226a2a138a0a&navContentPaneEnabled=false'}
                                frameBorder="0"
                                style={{ width: '100%' }}
                                height="850"
                                allowFullScreen
                                onLoad={() => this.setState({ loader: false })}
                            />
                        </div>}
                        {this.state.tabValue === 2 && <div>
                            <iframe
                                scrolling="no"
                                title="Dasboard"
                                id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiZTZjYTFmYmQtMjUwNy00ODgzLTg1NDAtMzYwMGEzMjk5MDU1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=50633a2612c471bade2d&navContentPaneEnabled=false'}
                                frameBorder="0"
                                style={{ width: '100%' }}
                                height="850"
                                allowFullScreen
                                onLoad={() => this.setState({ loader: false })}
                            />
                        </div>}
                        {this.state.tabValue === 3 && <div>
                            <iframe
                                scrolling="no"
                                title="Dasboard"
                                id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiZTZjYTFmYmQtMjUwNy00ODgzLTg1NDAtMzYwMGEzMjk5MDU1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=22a224d639657a7091e3&navContentPaneEnabled=false'}
                                frameBorder="0"
                                style={{ width: '100%' }}
                                height="850"
                                allowFullScreen
                                onLoad={() => this.setState({ loader: false })}
                            />
                        </div>}
                        {this.state.tabValue === 4 && <div>
                            <iframe
                                scrolling="no"
                                title="Dasboard"
                                id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiZTZjYTFmYmQtMjUwNy00ODgzLTg1NDAtMzYwMGEzMjk5MDU1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=bf08a547678acc35657b&navContentPaneEnabled=false'}
                                frameBorder="0"
                                style={{ width: '100%' }}
                                height="850"
                                allowFullScreen
                                onLoad={() => this.setState({ loader: false })}
                            />
                        </div>}
                        {this.state.tabValue === 5 && <div>
                            <iframe
                                scrolling="no"
                                title="Dasboard"
                                id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiZTZjYTFmYmQtMjUwNy00ODgzLTg1NDAtMzYwMGEzMjk5MDU1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=dbdc5a86aaf3e0296300&navContentPaneEnabled=false'}
                                frameBorder="0"
                                style={{ width: '100%' }}
                                height="850"
                                allowFullScreen
                                onLoad={() => this.setState({ loader: false })}
                            />
                        </div>}
                        {this.state.tabValue === 6 && <div>
                            <iframe
                                scrolling="no"
                                title="Dasboard"
                                id="iframeDasboard"
                                src={'https://app.powerbi.com/view?r=eyJrIjoiZTZjYTFmYmQtMjUwNy00ODgzLTg1NDAtMzYwMGEzMjk5MDU1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=a66ca4eaaef6333384cd&navContentPaneEnabled=false'}
                                frameBorder="0"
                                style={{ width: '100%' }}
                                height="850"
                                allowFullScreen
                                onLoad={() => this.setState({ loader: false })}
                            />
                        </div>}
                    </div> 
                </div>
            </div> :
                localStorage.companyGuid === "e81aa366-bb9f-4c2d-89b8-0aaf38b5dcc9" ?
                    <div justify="center" className="">
                        <div>
                            <Tabs tabsContainerClassName="guidelines_tabs" leftBtnIcon={<ChevronLeft />}
                                rightBtnIcon={<ChevronRight />} activeTab={value} onTabClick={this.handleChange}>
                                {/* <Tab >GHG Emissions</Tab>
                                                        <Tab >Insights Into Emissions</Tab>*/}
                                {/* <Tab >GHG Emissions (KNPC)</Tab>
                                                        <Tab >GHG Emissions (U-58)</Tab> */}
                            </Tabs>
                            <div className="powerBiPaginationContainer">
                                {/* <div className="powerBiPaginationHide"></div> */}
                                {/* {value === 0 && <div>
                                                        <iframe frameBorder={0} width={'100%'} height={3200}  src="https://app.powerbi.com/view?r=eyJrIjoiYmMyNTJlYzItNzBlNS00OTI0LThkZjgtZjZmOWYwY2Y2NTM1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=d1db91f2ccc0948b8425" />
                                                        {/* <iframe frameBorder={0} width={'100%'} className="PowerBiGhgEmissionDash"  src="https://app.powerbi.com/view?r=eyJrIjoiYmMyNTJlYzItNzBlNS00OTI0LThkZjgtZjZmOWYwY2Y2NTM1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ReportSection" /> */}
                                {/* </div>} */}
                                {value === 0 && <div>
                                    <PowerBiReportIframe
                                        staticLink
                                        embedConfig="https://app.powerbi.com/view?r=eyJrIjoiYmMyNTJlYzItNzBlNS00OTI0LThkZjgtZjZmOWYwY2Y2NTM1IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=9008eafe516033a561d9"
                                        cssClassName="PowerBiGhgEmissionDash"
                                        iframeHeight={4729}
                                        isPowerBiReport={true}
                                        withBorder={false}
                                    />
                                </div>}
                            </div>
                        </div>
                    </div>
                    :
                    (localStorage.companyGuid === "8c2d2513-51fa-4024-a442-4bd8a6121a87" || localStorage.companyGuid === "7661607a-93fc-4950-a2e6-d9fd6a1e3794" || localStorage.companyGuid === "8081ad1f-c4f1-4e80-ae13-ba556ec101bd" || localStorage.companyGuid === "3cd092b2-d71c-4341-ab91-7535bf628719" || localStorage.companyGuid === "1b847b5d-140e-44b4-b037-4dd85ab43ec6") ?
                        <div className="">
                            <div style={{ display: this.state.loader ? "block" : "none", position: "absolute", width: "100%", height: "100vh", background: "#fff" }}>
                                <Spinner></Spinner>
                            </div>
                            {/* <div className="esg_report_header">
                                <h6>GHG Dashboard</h6>
                            </div> */}
                            {reportConfigArr && reportConfigArr.length > 0 ? (
                                <div>
                                    <Tabs tabsContainerClassName="guidelines_tabs" leftBtnIcon={<ChevronLeft />} rightBtnIcon={<ChevronRight />} activeTab={value} onTabClick={this.handleChange}>
                                        {reportConfigArr.map((item, index) => (
                                            <Tab key={index}>{item.section}</Tab>
                                        ))}
                                    </Tabs>
                                    <div>
                                        {reportConfigArr[value] && (
                                            <PowerBiReportIframe
                                                key={reportConfigArr[value].iFrameHeight}
                                                embedConfig={reportConfigArr[value].reportConfigData}
                                                cssClassName={`${reportConfigArr[value].cssClassName}_new1`}
                                                iframeHeight={reportConfigArr[value].iFrameHeight}
                                                powerBiPaginationHide
                                                withBorder
                                            />
                                        )}
                                    </div>
                                </div>
                            ) : (
                                this.state.dashboardiFrameHeight && (
                                    <PowerBiReportIframe
                                        embedConfig={this.state.reportConfig}
                                        cssClassName={`${this.state.reportNameClass}_new`}
                                        iframeHeight={this.state.dashboardiFrameHeight}
                                        isPowerBiReport={this.state.isPowerBiReport}
                                        withBorder={this.state.isBorder}
                                    />
                                )
                            )}
                        </div> :
                        this.state.dashboardUrls.length > 0 && this.state.dashboardUrls !== undefined //&& this.state.reportName === null && this.state.reportName === undefined
                            ? this.state.dashboardUrls.map((item) => {
                                const { className } = this.getReportCSS(item.iframeClassName);
                                return (
                                    <div className="ghg-dashboard">
                                        <PowerBiReportIframe
                                            staticLink
                                            loader={this.state.loader}
                                            embedConfig={item.url + srcForIQOPs}
                                            cssClassName={className}
                                            title="GHG Dashboard"
                                            iframeHeight={this.state.dashboardiFrameHeight}
                                            isPowerBiReport={this.state.isPowerBiReport}
                                            withBorder={this.state.isBorder}
                                        />
                                    </div>
                                )
                            })
                            : ""
        );
    }
}
export default GHGDashboard;