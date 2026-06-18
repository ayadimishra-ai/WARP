import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { GetGHGEstimationUrl, getNextJSServiceUrl, getUserPermision } from "../../config";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import { models } from "powerbi-client";
import { PowerBIEmbed } from "powerbi-client-react";
import { decodeOpAccessToken } from "../../utility";
import PowerBiReportIframe from "./PowerBiReportIframe";
const params = {};
class PowerBiDashboardOps extends Component {
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
      localStorage.opsToken !== null &&
      localStorage.opsToken !== "null" &&
      localStorage.opsToken !== undefined &&
      localStorage.opsToken !== "undefined"
    ) {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      const activityPermissions = await this.getActivityPermission(decodedToken);
      
      const opsUserOrganizationAddressIds = activityPermissions.map((a) => {
        return a.organization_address_id;
      });
      
      const opsUserCompanyId =
      decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", opsUserCompanyId);
      localStorage.setItem("opsUserAddressIds", opsUserCompanyId);
      params.opsUserCompanyId = opsUserCompanyId;
      // console.log("opsUserOrganizationAddressIds",opsUserOrganizationAddressIds);
      params.opsUserOrganizationAddressIds = opsUserOrganizationAddressIds;
    } else {
      params.opsUserCompanyId = localStorage.companyGuid;
      params.opsUserOrganizationAddressIds = JSON.parse(
        localStorage.opsUserOrganizationAddressIds
      );
      // console.log("opsUserOrganizationAddressIds else",localStorage.opsUserOrganizationAddressIds);
    }
    this.getPowerBIToken("LIVE_OP_Ather_Consumption_Dashboard_v1", false);

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
    console.log("milliseconds", tokenExpirationmilliseconds);
    console.log("currentmilliseconds", currentmilliseconds);
    let intervalinMiliseconds =
      tokenExpirationmilliseconds - currentmilliseconds;
    console.log("intervalinMiliseconds", intervalinMiliseconds);
    if (isNaN(intervalinMiliseconds)) {
      intervalinMiliseconds = 5 * 10 * 600000;
    } else if (intervalinMiliseconds === 0) {
      intervalinMiliseconds = 5 * 10 * 600000;
    }
    console.log("intervalinMiliseconds1", intervalinMiliseconds);
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
      //console.log("this.state.tokenExpiration", this.state.tokenExpiration);
      const tokenExpiration = new Date(this.state.tokenExpiration);
      if (tokenExpiration !== undefined && tokenExpiration !== null) {
        // console.log(tokenExpiration);
        const intervalinMiliseconds = this.getmiliseconds(tokenExpiration);
        this.interval = setInterval(() => {
          // console.log(
          //   "1 hour has passed!LIVE_OP_Ather_Consumption_Dashboard_v1",
          //   intervalinMiliseconds
          // );
          this.getPowerBIToken("LIVE_OP_Ather_Consumption_Dashboard_v1", true);
        }, intervalinMiliseconds);
      }
    }
  };
  // Function to update the interval time
  updateIntervalTime = (newTime) => {
    this.setState({ tokenExpiration: newTime }, this.startInterval);
  };
  getPowerBIToken = (ReportName, Isupdate) => {
    const config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        rname: ReportName,
      },
      maxBodyLength: Infinity,
    };
    axios.post(getNextJSServiceUrl() + "environmental-dashboard/PowerBiTokenGeneration", null, config)
      .then((response) => {
        if (response.status === 200) {
          if (response.data !== undefined) {
            const filterData = response.data.value.filters;
            const updatedFilterString = filterData
              .replaceAll(
                "@opsUserCompanyId",
                '"' + params.opsUserCompanyId + '"'
              )
              .replaceAll(
                "@opsUserOrganizationAddressIds",
                JSON.stringify("@opsUserOrganizationAddressIds")
              );
            const parsedFilterData = JSON.parse(updatedFilterString);
            const updatedFilters = parsedFilterData.filters.map((filter) => {
              return {
                ...filter,
                values:
                  filter.values == "@opsUserOrganizationAddressIds"
                    ? params.opsUserOrganizationAddressIds
                    : filter.values,
              };
            });
            // console.log("updatedFilters",params.opsUserOrganizationAddressIds);

            const currentReportConfig = this.state.reportConfig;
            const updatedReportConfig = {
              ...currentReportConfig,
              filters: updatedFilters,
              sectionurl: "",
              settings: parsedFilterData.settings,
              embedUrl: response.data.value.embedUrl,
              accessToken: response.data.value.token,
              id: response.data.value.id,
            };
            this.setState({
              reportConfig: updatedReportConfig,
              sectionurls: "",
              loader: false,
              tokenExpiration: response.data.date1,
              dashboardiFrameHeight: response.data.value.dashboardHeight,
              isBorder: response.data.value.isBorder,
              isPowerBiReport: response.data.value.isPowerBiReport,
            });
            if (Isupdate !== undefined && Isupdate === true) {
              const tokenExpiration = new Date(response.data.date1);
              if (tokenExpiration !== undefined && tokenExpiration !== null) {
                //console.log(tokenExpiration);
                this.updateIntervalTime(tokenExpiration);
              }
            }
          }
        }
      })
      .catch((err) => console.log("err", err));
  };
  handleChange = (event, value) => {
    this.setState({ value });
  };

  getActivityPermission = async (decodedToken) => {
    const formData = {
      organizationId:
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
      userId: decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
    };
    const opConfig = {
      headers: {
        "x-sk-op-authorization": localStorage.opsToken,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(
      GetGHGEstimationUrl() + "api/v1/users/activity-permissions",
      formData,
      opConfig
    );

    // Process the data to match the required format
    const result = [];

    // Iterate over each location and collect the activities for each organization
    const locationsMap = new Map();
    response.data.data.forEach(item => {
        item.locations.forEach(location => {
            if (!locationsMap.has(location.id)) {
                locationsMap.set(location.id, new Set());
            }
            locationsMap.get(location.id).add(item.main_activity);
        });
    });

    // Convert Map to the desired output format
    locationsMap.forEach((activities, id) => {
        result.push({
            organization_address_id: id,
            activities: Array.from(activities)
        });
    });

    return result;
  }

  render() {
    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions.length === 0) {
      return <Redirect to="/home" />;
    } else if (
      getUserPermision(permissions, PageKeys.ghgdashboardops) === null
    ) {
      return <Redirect to="/home" />;
    }
    return (
      <>
            <PowerBiReportIframe
            loader={this.state.loader}
            embedConfig={this.state.reportConfig}
            cssClassName={"power-bi-ops-report-class-new"}
            iframeHeight={this.state.dashboardiFrameHeight}
            isPowerBiReport={this.state.isPowerBiReport}
            isBorder={this.state.isBorder}
            />
      </>
    );
  }
}
export default PowerBiDashboardOps;
