import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { getNextJSServiceUrl, getUserPermision } from "../../config";
import * as RoleCodes from "../../rolecodes";
import jwt from "jsonwebtoken";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import { models } from "powerbi-client";
import { PowerBIEmbed } from "powerbi-client-react";

let params = "", invitationId = "";
class PredealESGReportDemo extends Component {
    constructor(props) {
        super(props)
        this.state = {
            dashboardUrls: [],
            loader: true,
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
                    pageNavigation: {
                        visible: false
                    },
                    panes: {
                        filters: {
                            expanded: false,
                            visible: false,
                        },
                    },
                    background: undefined,
                },
            },
            tokenExpiration: "",
            intervalinMiliseconds: 5 * 10 * 600000,
        }
    }

    componentDidMount = async () => {
        invitationId = this.getUrlParameter("formInvitationId");
        let reportName = "";
            if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST || JSON.parse(localStorage.userType) === RoleCodes.LOCATIONEXECUTIVE || JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN) {
              if (invitationId === false || invitationId === "") {
                reportName = "DemoCompany-New Predeal KPI v2 (Demo)";
              } else {
                reportName = "DemoCompany-Predeal Buyer-Supplier - Demo";
              }
            } else {
              reportName = "DemoCompany-Predeal Buyer-Supplier - Demo";
            }
        this.getPowerBIToken(reportName, false);


        if (localStorage.warpToken !== null && localStorage.warpToken !== "null"
            && localStorage.warpToken !== undefined && localStorage.warpToken !== "undefined") {
            const decodedToken = jwt.decode(localStorage.warpToken);

            const warpUserCompanyId =
                decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
            localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
            params = warpUserCompanyId;
        }
        else {
            params = localStorage.companyGuid;
        }


        this.timer = setTimeout(() => {
            console.log('1 hour has passed!');
            this.startInterval();
        }, 7200);
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
    startInterval = () => {
        clearInterval(this.interval); // Clear any existing interval

        if (this.state.tokenExpiration !== undefined && this.state.tokenExpiration !== null && this.state.tokenExpiration !== "") {
            console.log("this.state.tokenExpiration", this.state.tokenExpiration);
            const tokenExpiration = new Date(this.state.tokenExpiration);
            if (tokenExpiration !== undefined && tokenExpiration !== null) {
                console.log(tokenExpiration);

                const intervalinMiliseconds = this.getmiliseconds(tokenExpiration);

                this.interval = setInterval(() => {
                    console.log('1 hour has passed!Ather Materiality Assessment Beta', intervalinMiliseconds);
                    this.getPowerBIToken("DemoCompany-New Predeal KPI v2 (Demo)", true);
                }, intervalinMiliseconds);
            }
        }
    };



    // Function to update the interval time
    updateIntervalTime = (newTime) => {
        this.setState({ tokenExpiration: newTime }, this.startInterval);
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
            let filterData2 = ReportName === "DemoCompany-New Predeal KPI v2 (Demo)" ? JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + localStorage.warpUserCompanyId + '"'))
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
              tokenExpiration: response.data.date1
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

    handleChange = (event, value) => {
        this.setState({ value });
    };

    render() {
        console.log("reportConfig", this.state.reportConfig)
        let permissions = localStorage.permissions !== undefined ? JSON.parse(localStorage.permissions) : [];
        if (permissions.length === 0) {
            return <Redirect to="/home" />;
        } else if (getUserPermision(permissions, PageKeys.PredealESGReportDemo) === null) {
            return <Redirect to="/home" />;
        }

        return (


            <div className="">
                <div className="waterMarkContainer">
                <div className="waterMarkHide" style={{"height":"167px"}}></div>
                <div className="powerBiTrialNoteHide" style={{"height":"167px"}}></div>
                    {/* <div style={{ display: this.state.loader ? "block" : "none", position: "absolute", width: "100%", height: "100vh", background: "#fff" }}>
                        <Spinner></Spinner>
                    </div>
                    <div className="waterMarkHide"></div>
                    <div className="powerBiContainer">
                        <div className="powerBiTrialNoteHide"></div>
                        <PowerBIEmbed
                            embedConfig={this.state.reportConfig}
                            cssClassName={"power-bi-ghg-v4-hsbc-report-class"}
                        />
                    </div> */}
                    <iframe frameBorder={0} width={'100%'} height={1060} src="https://app.powerbi.com/view?r=eyJrIjoiYTUwZTg4ODMtNGQ4My00YzY1LWIxZjEtZWZhMDhjYmRmMGQzIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9" />
                </div>
            </div>


        );
    }
}
export default PredealESGReportDemo;