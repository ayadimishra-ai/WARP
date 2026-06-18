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
import { models } from "powerbi-client";
import PowerBiReportIframe from "../Dashboard/PowerBiReportIframe";

let IsVCUser = false;
let ShowOtherCompanyDetails = false;
let params = "", invitationId = "";
class PredealESGReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showExport: false,
      dashboardUrl: [],
      assessorCompanyGuid: "",
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
      reportName: true,
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
        const warpUserCompanyId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
        localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
      }
    }

    invitationId = this.getUrlParameter("formInvitationId");
    params = this.getUrlParameter("companyid");
    if (localStorage.emailId === "hawkins.india@yopmail.com" && (invitationId === false || invitationId === "")) {
      invitationId = "c1fada8b-3aab-48ff-9e8a-cf709b94e3c7";
      params = "9e3c02db-c8c6-4892-8bae-d8bda828bd7a";
    } else {
      invitationId = this.getUrlParameter("formInvitationId");
    }

    //let reportName = JSON.parse(localStorage.userType) === (RoleCodes.VENTURECAPITALIST || RoleCodes.LOCATIONEXECUTIVE || RoleCodes.ORGANIZATIONADMIN) ? (invitationId === false || invitationId === "") ? "New Predeal KPI v2 (Demo)" : "Predeal Buyer-Supplier - Demo" : "Predeal Buyer-Supplier - Demo";

    let reportName = "";
    if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
      if (invitationId === false || invitationId === "") {
        reportName = "New Predeal KPI v2 (Demo)";
      } else {
        if(params === "088e77be-26dd-42c8-8bba-47628593e231"){
          reportName = "Demo_IAG_OneSupplier_v1"
        }else{
          reportName = "Predeal Buyer-Supplier - Demo";
        }
      }
    } else {
      reportName = "Predeal Buyer-Supplier - Demo";
    }

    if(localStorage.emailId === "eaton@yopmail.com")
    {
      reportName = "Demo_IAG_OneSupplier_v1"
    }
    if (params !== undefined) {
      if (params !== false) {
        if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
          ShowOtherCompanyDetails = true;
          //await this.getPowerBIToken(reportName, false);
          await this.getDashboardUrl(params);
        } else {
          ShowOtherCompanyDetails = false;
          //await this.getPowerBIToken(reportName, false);
          await this.getDashboardUrl(localStorage.warpUserCompanyId);
        }
      } else {
        ShowOtherCompanyDetails = false;
        //await this.getPowerBIToken(reportName, false);
        params = localStorage.warpUserCompanyId;
        await this.getDashboardUrl(localStorage.warpUserCompanyId);
      }
    } else {
      ShowOtherCompanyDetails = false;
      params = localStorage.warpUserCompanyId;
     // await this.getPowerBIToken(reportName, false);
      await this.getDashboardUrl(localStorage.warpUserCompanyId);
    }

    setTimeout(() => {
      this.setState({ loader: false });
    }, 6800);

    this.timer = setTimeout(() => {
      console.log('1 hour has passed!');
      this.startInterval(reportName);
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

  getDashboardUrl = async (companyGuid) => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: companyGuid,
        DashboardType: "predealesgreport",//"predealesgreportpowerbi",
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
                  x.dashboardType === "predealesgreport" &&
                  //x.dashboardType === "predealesgreportIHC" &&
                  x.companyType === "Portfolio Company"
              );
            } else if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
              url = json.data.filter(
                (x) =>
                  x.dashboardType === "predealesgreport" &&
                  //x.dashboardType === "predealesgreportIHC" &&
                  x.companyType === "VC Company"
              );
            }
            
            this.setState({ 
                dashboardUrl: url,
                dashboardiFrameHeight:url[0].dashboardHeight,
                isBorder: url[0].isBorder,
                isPowerBiReport: url[0].isPowerBiReport,
                reportName: url[0].ReportName
            });
            
            if(!!url[0].reportName){
            this.getPowerBIToken(url[0].reportName ,false)
            }

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

  getAssessorCompany = async (params) => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        "CPanelCompanyId": params,
      }
    };
    await axios
      .get(getServiceUrl() + "Users/GetAssessorCompany", config)
      .then(json => {
        if (json.status === 200) {
          if (json.data !== undefined) {
            this.setState({ assessorCompanyGuid: json.data[0].assessorCompanyGuid })
          }
        }
      })
  }

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
            let filterData2 = ReportName === ("New Predeal KPI v2 (Demo)" || "IHC NEW Predeal KPI v2 (Demo)") ? JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.warpUserCompanyId + '"'))
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
  startInterval = (reportName) => {
    clearInterval(this.interval); // Clear any existing interval

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
  updateIntervalTime = (newTime, reportName) => {
    this.setState({ tokenExpiration: newTime }, this.startInterval(reportName));
  };

  render() {
    return (
      <div id="pdf-view">
        <React.Fragment>
          {this.state.loader && this.state.reportConfig.length === 0 ? (
            <Spinner />
          ) : (
            // this.state.dashboardUrl.length === 0  
            this.state.dashboardUrl.length > 0 && !!this.state.dashboardUrl[0].reportName ?
                <PowerBiReportIframe
                    embedConfig={this.state.reportConfig}
                    cssClassName={((invitationId === false || invitationId === "") && (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN)) ? "power-bi-report-class" : "power-bi-report-class-pc-new"}
                    iframeHeight={this.state.dashboardiFrameHeight}
                    isPowerBiReport={this.state.isPowerBiReport}
                    withBorder={this.state.isBorder}
                />
              : <></>
              // <div className=" esg_report_container">
              //   <div className="esg_report_header">
              //     {/* <h6>Predeal ESG Report</h6> */}
              //     {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
              //       JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
              //       ShowOtherCompanyDetails === true ? (
              //       <div
              //         data-html2canvas-ignore="true"
              //         className="esg_header_right"
              //       ></div>
              //     ) : (
              //       ""
              //     )}
              //   </div>
              //   {((JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
              //     JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
              //     ShowOtherCompanyDetails === true) || (invitationId === false || invitationId === "")) ? (
              //     <div>
              //       {params !== "" ? (
              //         <GridContainer className="top_esg_report">
              //           {this.state.dashboardUrl.length > 0
              //             ? this.state.dashboardUrl.map((item) => {
              //               return (
              //                 <GridItem md={item.columnSize}>
              //                   <div
              //                     className="first_class"
              //                     style={{ textAlign: "right" }}
              //                   >
              //                     {this.state.dashboardUrl && (
              //                       <PowerBiReportIframe
              //                         staticLink
              //                         onLoad={() => this.setState({ showExport: true })}
              //                         embedConfig={
              //                           //item.url + params +'%22%7D'
              //                           !!invitationId ?
              //                             item.url +
              //                             params +
              //                             '%22,%22df111%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580' +
              //                             invitationId +
              //                             '%22%7D' :
              //                             item.url +
              //                             params +
              //                             '%22%7D'
              //                         }
              //                         cssClassName="ESGReportPreDealDemoPC_New"
              //                         title="Overall Fund Performance"
              //                         iframeHeight={this.state.dashboardiFrameHeight}
              //                         isPowerBiReport={this.state.isPowerBiReport}
              //                         withBorder={this.state.isBorder}
              //                     />
              //                     )}
              //                   </div>
              //                 </GridItem>
              //               );
              //             })
              //             : ""}
              //         </GridContainer>
              //       ) : (
              //         ""
              //       )}
              //     </div>
              //   ) : (
              //     ""
              //   )}
              // </div>
          )}
        </React.Fragment>
      </div>
    );
  }
}
export default PredealESGReport;
