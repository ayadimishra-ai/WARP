import MoreVert from "@material-ui/icons/MoreVert";
import axios from "axios";
import jwt from "jsonwebtoken";
import React, { Component } from "react";
import Export from "../../assets/img/export.png";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { getNextJSServiceUrl, getServiceUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb } from "../../utility";
import { PowerBIEmbed } from "powerbi-client-react";
import { models } from "powerbi-client";
import PowerBiReportIframe from "../Dashboard/PowerBiReportIframe";

let IsVCUser = false;
let ShowOtherCompanyDetails = false;
let params = "", invitationId = "";
class ChirataeESGInvesteeQuestionnaireAnnual extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showExport: false,
      dashboardUrl: [],
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
    };
  }

  componentDidMount = async () => {
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
        console.log({ decodedToken });
        const warpUserCompanyId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
        localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
      }
    }
    params = this.getUrlParameter("companyid");
    invitationId = this.getUrlParameter("formInvitationId");
    let reportName = JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST ? (invitationId === false || invitationId === "") ? "Chiratae ESG Investee Questionnaire Annual -  VC Level KPIs (LIVE)" : "Chiratae ESG Investee Questionnaire Annual -  Portfolio Level KPIs (LIVE)" : "Chiratae ESG Investee Questionnaire Annual -  Portfolio Level KPIs (LIVE)";

    if (params !== undefined) {
      if (params !== false) {
        if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
          ShowOtherCompanyDetails = true;
          //await this.getDashboardUrl(params);
          //await this.getDashboardUrl(localStorage.companyGuid);
          await this.getPowerBIToken(reportName,false);
        } else {
          ShowOtherCompanyDetails = false;
          //await this.getDashboardUrl(localStorage.warpUserCompanyId);
          await this.getPowerBIToken(reportName,false);
        }
      } else {
        ShowOtherCompanyDetails = false;
        //await this.getDashboardUrl(localStorage.warpUserCompanyId);
        params = localStorage.warpUserCompanyId;
        await this.getPowerBIToken(reportName,false);
      }
    } else {
      ShowOtherCompanyDetails = false;
      params = localStorage.warpUserCompanyId;
      //await this.getDashboardUrl(localStorage.warpUserCompanyId);
      await this.getPowerBIToken(reportName,false);
    }

    setTimeout(() => {
      this.setState({ loader: false });
    }, 6800);
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
        console.log({ decodedToken });
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

  getDashboardUrl = async (companyGuid) => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: companyGuid,
        DashboardType: "chirataeesginvesteequestionnaireannual",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        if (json.status === 200) {
          if (json.data !== undefined) {
            let url = "";
            if (
              JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
              JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
              ShowOtherCompanyDetails === true
            ) {
              url = json.data.filter(
                (x) =>
                  x.dashboardType === "chirataeesginvesteequestionnaireannual" &&
                  x.companyType === "Portfolio Company"
              );
            } else if (
              JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
            ) {
              url = json.data.filter(
                (x) =>
                  x.dashboardType === "chirataeesginvesteequestionnaireannual" &&
                  x.companyType === "VC Company"
              );
            }
            this.setState({ dashboardUrl: url });
          }
        }
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  };
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
startInterval = () => {
    clearInterval(this.interval); // Clear any existing interval
    let reportName = JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST ? (invitationId === false || invitationId === "") ? "Chiratae ESG Investee Questionnaire Annual -  VC Level KPIs (LIVE)" : "Chiratae ESG Investee Questionnaire Annual -  Portfolio Level KPIs (LIVE)" : "Chiratae ESG Investee Questionnaire Annual -  Portfolio Level KPIs (LIVE)";
    if (this.state.tokenExpiration !== undefined && this.state.tokenExpiration !== null && this.state.tokenExpiration !== "") {
        console.log("this.state.tokenExpiration", this.state.tokenExpiration);
        const tokenExpiration = new Date(this.state.tokenExpiration);
        if (tokenExpiration !== undefined && tokenExpiration !== null) {
            console.log(tokenExpiration);

            const intervalinMiliseconds = this.getmiliseconds(tokenExpiration);

            this.interval = setInterval(() => {
                console.log('1 hour has passed!Ather Materiality Assessment', intervalinMiliseconds);
                this.getPowerBIToken(reportName, true);
            }, intervalinMiliseconds);
        }
    }
};


// Function to update the interval time
updateIntervalTime = (newTime) => {
    this.setState({ tokenExpiration: newTime }, this.startInterval);
};


  getPowerBIToken = async (ReportName,Isupdate) => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        rname: ReportName
      },
      maxBodyLength: Infinity,
    };
    await axios.post(getNextJSServiceUrl() + "environmental-dashboard/PowerBiTokenGeneration", null, config)
      .then(response => {
        console.log("response", response, ReportName)
        if (response.status === 200) {
          if (response.data !== undefined) {
            let filterData = response.data.value.filters;
            let filterData1 = JSON.parse(JSON.stringify(filterData))
            let filterData2 = ReportName === "Chiratae ESG Investee Questionnaire Annual -  VC Level KPIs (LIVE)" ? JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.warpUserCompanyId + '"'))
              : JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + params + '"').replaceAll("@warpInvitationId", '"' + invitationId + '"'))

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
              tokenExpiration: response.data.date1,
              dashboardiFrameHeight: response.data.value.dashboardHeight,
              isBorder: response.data.value.isBorder,
              isPowerBiReport: response.data.value.isPowerBiReport,

            })
            if (Isupdate !== undefined && Isupdate === true) {
              const tokenExpiration = new Date(response.data.date1);
              if (tokenExpiration !== undefined && tokenExpiration !== null) {
                  console.log(tokenExpiration);
                  this.updateIntervalTime(tokenExpiration);
              }
          }

          }
        }
      })
  }

  render() {
    console.log("reportConfig", this.state.reportConfig)
    return (
      <div id="pdf-view">
        <React.Fragment>
          {this.state.loader && this.state.reportConfig.length === 0 ? (
            <Spinner />
          ) : (
            <div className="">
              <div className="powerBiContainer">
                <div className="esg_report_header">
                  <h6>ESG Investee Dashboard</h6>
                </div>
                <div className="powerBiContainer">
                  <div className="powerBiTrialNoteHide"></div>
                  {/* <PowerBIEmbed
                    embedConfig={this.state.reportConfig}
                    cssClassName={((invitationId === false || invitationId === "") && JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) ? "power-bi-report-class" : "power-bi-report-class-pc"}
                  /> */}
                  <PowerBiReportIframe
                  loader={this.state.loader}
                  embedConfig={this.state.reportConfig}
                  cssClassName={((invitationId === false || invitationId === "") && JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) ? "power-bi-report-class" : "power-bi-report-class-pc"}
                  iframeHeight={this.state.dashboardiFrameHeight}
                  isPowerBiReport={this.state.isPowerBiReport}
                  isBorder={this.state.isBorder}
                  />
                </div>
              </div>
            </div>
          )}
        </React.Fragment>
      </div>
      // <div id="pdf-view">
      //   <React.Fragment>
      //     {this.state.loader && this.state.dashboardUrl.length === 0 ? (
      //       <Spinner />
      //     ) : (
      //       <div className="All_container esg_report_container">
      //         <div className="esg_report_header">
      //           <h6>ESG Investee Dashboard</h6>
      //           {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER || JSON.parse(localStorage.userType) === RoleCodes.BUYER || ShowOtherCompanyDetails === true ?
      //                                   <div data-html2canvas-ignore="true" className="esg_header_right">
      //                                       <span></span>
      //                                       <span onClick={() => this.pdfDownload()}>
      //                                           <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export All
      //                                       </span>
      //                                   </div> : ''}
      //         </div>
      //           <div
      //             style={{
      //               display: "flex",
      //               alignItems: "center",
      //               marginBottom: "10px",
      //             }}
      //           >
      //             <span>To download the KPIs as PDF please right click on</span>
      //             <MoreVert />
      //           </div>
      //         {/*)}*/}
      //         {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
      //         JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
      //         ShowOtherCompanyDetails === true ? (
      //           <div>
      //             {params !== "" ? (
      //               <GridContainer className="top_esg_report">
      //                 {this.state.dashboardUrl.length > 0
      //               ? this.state.dashboardUrl.map((item) => {
      //                   return (
      //                     <GridItem md={item.columnSize}>
      //                       <div
      //                         className="first_class"
      //                         style={{ textAlign: "right" }}
      //                       >
      //                         <div
      //                           className="waterMarkHide"
      //                           style={{
      //                             background: "#fff",
      //                             width: "100%",
      //                             position: "absolute",
      //                             bottom: 0,
      //                             height: "25px",
      //                           }}
      //                         />
      //                         {this.state.dashboardUrl && (
      //                           <iframe
      //                             loading="eager"
      //                             onLoad={() =>
      //                               this.setState({ showExport: true })
      //                             }
      //                             title="Overall Fund Performance"
      //                             src={
      //                               !!invitationId ? 
      //                               item.url +
      //                               params +
      //                               '%22,%22df19%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580' +
      //                               invitationId + 
      //                               '%22%7D' : 
      //                               item.url +
      //                               params +
      //                               '%22%7D'
      //                             }
      //                             frameBorder="0"
      //                             className="PCDashboardCSS"
      //                             // style={JSON.parse(item.iframeStyle)}
      //                             allowFullscreen
      //                           />
      //                         )}
      //                       </div>
      //                     </GridItem>
      //                   );
      //                 })
      //               : ""}
      //               </GridContainer>
      //             ) : (
      //               ""
      //             )}
      //           </div>
      //         ) : JSON.parse(localStorage.userType) ===
      //           RoleCodes.VENTURECAPITALIST ? (
      //           <GridContainer justify="center" className="top_esg_report">
      //             {this.state.dashboardUrl.length > 0
      //               ? this.state.dashboardUrl.map((item) => {
      //                   return (
      //                     <GridItem md={item.columnSize}>
      //                       <div
      //                         className="first_class"
      //                         style={{ textAlign: "right" }}
      //                       >
      //                         <div
      //                           className="waterMarkHide"
      //                           style={{
      //                             background: "#fff",
      //                             width: "100%",
      //                             position: "absolute",
      //                             bottom: 0,
      //                             height: "25px",
      //                           }}
      //                         />
      //                         {this.state.dashboardUrl && (
      //                           <iframe
      //                             loading="eager"
      //                             onLoad={() =>
      //                               this.setState({ showExport: true })
      //                             }
      //                             title="Overall Fund Performance"
      //                             src={
      //                               !!invitationId ? 
      //                               item.url +
      //                               localStorage.getItem("warpUserCompanyId") +
      //                               '%22,%22df19%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580' +
      //                               invitationId + 
      //                               '%22%7D' : 
      //                               item.url +
      //                               localStorage.getItem("warpUserCompanyId") +
      //                               '%22%7D'
      //                             }
      //                             frameBorder="0"
      //                             //className="chirataeESGInvesteeCSS"
      //                             style={JSON.parse(item.iframeStyle)}
      //                             allowFullscreen
      //                           />
      //                         )}
      //                       </div>
      //                     </GridItem>
      //                   );
      //                 })
      //               : ""}
      //           </GridContainer>
      //         ) : (
      //           ""
      //         )}
      //       </div>
      //     )}
      //   </React.Fragment>
      // </div>
    );
  }
}
export default ChirataeESGInvesteeQuestionnaireAnnual;
