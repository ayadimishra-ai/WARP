import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { getUserPermision } from "../../config";
import * as RoleCodes from "../../rolecodes";
import jwt from "jsonwebtoken";
import axios from "axios";
import { getServiceUrl } from "../../config";
import { models } from "powerbi-client";
import PowerBiReportIframe from "./PowerBiReportIframe";

let params = "";
class HealthnSafetyDashboard extends Component {
  constructor(props) {
    super(props);
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
            visible: false,
          },
          panes: {
            filters: {
              expanded: false,
              visible: false,
            },
          },
          navContentPaneEnabled: false,
          background: 1,
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
    this.getPowerBIToken("Health & Safety Dashboard Beta", false);

    if (
      localStorage.warpToken !== null &&
      localStorage.warpToken !== "null" &&
      localStorage.warpToken !== undefined &&
      localStorage.warpToken !== "undefined"
    ) {
      const decodedToken = jwt.decode(localStorage.warpToken);

      const warpUserCompanyId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
      localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
      params = warpUserCompanyId;
    } else {
      params = localStorage.companyGuid;
    }

    this.timer = setTimeout(() => {
      console.log("1 hour has passed!");
      this.startInterval();
    }, 7200);
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
    const tokenExpirationmilliseconds = new Date(
      tokenExpiration.getTime() + istOffset * 60 * 1000
    ); // Add offset to UTC time
    //  console.log("milliseconds", tokenExpirationmilliseconds);
    // console.log("currentmilliseconds", currentmilliseconds);
    let intervalinMiliseconds =
      tokenExpirationmilliseconds - currentmilliseconds;
    // console.log("intervalinMiliseconds", intervalinMiliseconds);
    if (isNaN(intervalinMiliseconds)) {
      intervalinMiliseconds = 5 * 10 * 600000;
    } else if (intervalinMiliseconds === 0) {
      intervalinMiliseconds = 5 * 10 * 600000;
    }
    // console.log("intervalinMiliseconds1", intervalinMiliseconds)
    this.setState({ intervalinMiliseconds: intervalinMiliseconds });
    return intervalinMiliseconds;
  };

  // Function to start the interval
  startInterval = () => {
    clearInterval(this.interval); // Clear any existing interval

    if (
      this.state.tokenExpiration !== undefined &&
      this.state.tokenExpiration !== null &&
      this.state.tokenExpiration !== ""
    ) {
      //    console.log("this.state.tokenExpiration", this.state.tokenExpiration);
      const tokenExpiration = new Date(this.state.tokenExpiration);
      if (tokenExpiration !== undefined && tokenExpiration !== null) {
        // console.log(tokenExpiration);

        const intervalinMiliseconds = this.getmiliseconds(tokenExpiration);

        this.interval = setInterval(() => {
          //   console.log('1 hour has passed! Health & Safety Assessment Beta', intervalinMiliseconds);
          this.getPowerBIToken("Health & Safety Dashboard Beta", true);
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
        rname: ReportName,
      },
      maxBodyLength: Infinity,
    };
    await axios
      .post(getServiceUrl() + "Users/PowerBiTokenGeneration", null, config)
      .then((response) => {
        if (response.status === 200) {
          if (response.data !== undefined) {
            // let filterData = response.data.value.filters;

            // let filterData1 = JSON.parse(JSON.stringify(filterData))
            // let filterData2 = JSON.parse(filterData1.replaceAll("@warpUserCompanyId", '"' + params + '"'));

            let sectionUrl = response.data.value.sectionurl;
            let sectionUrls =
              ReportName === "Health & Safety Dashboard Beta"
                ? ""
                : JSON.parse(JSON.parse(JSON.stringify(sectionUrl)));

            let data = this.state.reportConfig;
            let data1 = {
              ...data,
              //                            filters: filterData2.filters,
              sectionurl: sectionUrls,
              //                          settings: filterData2.settings,
              embedUrl: response.data.value.embedUrl,
              accessToken: response.data.value.token,
              id: response.data.value.id,
            };
            this.setState({
              reportConfig: data1,
              sectionurls: sectionUrls,
              loader: false,
              tokenExpiration: response.data.date1,
              dashboardiFrameHeight: response.data.value.dashboardHeight,
              isBorder: response.data.value.isBorder,
              isPowerBiReport: response.data.value.isPowerBiReport,
            });

            if (Isupdate !== undefined && Isupdate === true) {
              const tokenExpiration = new Date(response.data.date1);
              if (tokenExpiration !== undefined && tokenExpiration !== null) {
                //  console.log(tokenExpiration);
                this.updateIntervalTime(tokenExpiration);
              }
            }
          }
        }
      });
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions.length === 0) {
      return <Redirect to="/home" />;
    } else if (
      getUserPermision(permissions, PageKeys.HealthnSafetyDashboard) === null
    ) {
      return <Redirect to="/home" />;
    }

    return (
      <div className="health-safety-dashboard">
        <PowerBiReportIframe
          loader={this.state.loader}
          embedConfig={this.state.reportConfig}
          cssClassName="healthnSafety-new"
          iframeHeight={this.state.dashboardiFrameHeight}
          isPowerBiReport={this.state.isPowerBiReport}
          isBorder={this.state.isBorder}
        />
      </div>
    );
  }
}
export default HealthnSafetyDashboard;
