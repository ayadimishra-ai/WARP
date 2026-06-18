import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { GetGHGEstimationUrl, getNextJSServiceUrl, getUserPermision } from "../../config";
import axios from "axios";
import { getServiceUrl } from "../../config";
import { models } from "powerbi-client";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Tab, Tabs, Typography } from "@material-ui/core";
import { decodeOpAccessToken, isUUID } from "../../utility";
import PowerBiReportIframe from "../Dashboard/PowerBiReportIframe";

const params = {};
const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "transparent",
    marginBottom: "10px",
  },
  flexContainer: {
    paddingBottom: "10px",
  },
  scrollable: {
    overflowX: "hidden",
    marginTop: 0,
  },
  scrollButtonsAuto: {
    width: 36,
    height: 47.5,
    "&:hover": {
      color: "#122F47",
      backgroundColor: "#d3d3d3",
    },
  },
  tabsRoot: {
    borderBottom: "1px solid transparent",
    marginBottom: "10px",
  },
  tabsIndicator: {
    backgroundColor: "transparent",
  },
  tabRoot: {
    color: "#4D4D4F",
    textTransform: "initial",
    minWidth: 91,
    fontWeight: 700,
    marginRight: "10px",
    backgroundColor: "#fff",
    borderRadius: "30px",
    fontSize: "14px",
    lineHeight: "16px",
    border: "1px solid #999999",
    opacity: 1,
    "&:hover": {
      color: "#fff",
      background: "linear-gradient(184.76deg, #005C81 2.97%, #122F47 97.4%)",
      opacity: 1,
      border: "1px solid transparent",
    },
    "&$tabSelected": {
      color: "#fff",
      background: "linear-gradient(184.76deg, #005C81 2.97%, #122F47 97.4%)",
      border: "1px solid transparent",
    },
    "&:focus": {
      color: "#fff",
      background: "linear-gradient(184.76deg, #005C81 2.97%, #122F47 97.4%)",
      border: "1px solid transparent",
    },
  },
  tabSelected: {},
  typography: {
    padding: theme.spacing.unit * 3,
  },
});

const tabMapping = {
  general: 0,
  // environment_snapshot: 1,
  energy: 1,
  materials_and_suppliers: 2,
  transport: 3,
  waste: 4,
  water: 5,
  hr: 6,
  health_and_safety: 7,
  csr: 8,
  compliance: 9,
};

const urlParams = new URLSearchParams(window.location.search);

const tabUrl = urlParams.get("tab");
class SupplierTracker extends Component {
  constructor(props) {
    super(props);
    const Searchparams = new URLSearchParams(this.props.location.search);
    this.state = {
      dashboardUrls: [],
      loader: true,
      sectionurls: [],
      reportMapping: {},
      reportName: "", //reportMapping[Searchparams.get("tab") || "environment_snapshot"],
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
      value: tabMapping[Searchparams.get("tab") || "general"],
      dashboardiFrameHeight: "",
      isBorder: false,
      isPowerBiReport: true,
    };
  }
  componentDidMount = async () => {
    this.getDashboardUrl();
    if (
      localStorage.opsToken !== null &&
      localStorage.opsToken !== "null" &&
      localStorage.opsToken !== undefined &&
      localStorage.opsToken !== "undefined"
    ) {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      const activityPermissions = await this.getActivityPermission(
        decodedToken
      );

      const opsUserOrganizationAddressIds = activityPermissions
        .filter((a) => a.organization_address_id)
        .map((a) => a.organization_address_id);

      const opsUserCompanyId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", opsUserCompanyId);
      localStorage.setItem("opsUserAddressIds", opsUserCompanyId);
      params.opsUserCompanyId = opsUserCompanyId;
      params.opsUserOrganizationNames = activityPermissions
        .filter((a) => a.organization_address_name)
        .map((a) => a.organization_address_name);

      params.opsUserOrganizationAddressIds = opsUserOrganizationAddressIds;
    } else {
      params.opsUserCompanyId = localStorage.companyGuid;
      params.opsUserOrganizationAddressIds = JSON.parse(
        localStorage.opsUserOrganizationAddressIds
      );
    }
                     this.setState({                   
                    reportName: "Supplier_tracker_daimler",
                  });

    this.getPowerBIToken(true);

    this.timer = setTimeout(() => {
      console.log("1 hour has passed!");
      this.startInterval();
    }, 7200);
  };
  componentDidUpdate(prevProps, prevState) {
    if (
      this.state.reportName &&
      prevState.reportName !== this.state.reportName
    ) {
      this.getPowerBIToken(true);

      this.timer = setTimeout(() => {
        console.log("1 hour has passed!");
        this.startInterval();
      }, 7200);
    }
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
    const tokenExpirationmilliseconds = new Date(
      tokenExpiration.getTime() + istOffset * 60 * 1000
    ); // Add offset to UTC time
    let intervalinMiliseconds =
      tokenExpirationmilliseconds - currentmilliseconds;
    if (isNaN(intervalinMiliseconds)) {
      intervalinMiliseconds = 5 * 10 * 600000;
    } else if (intervalinMiliseconds === 0) {
      intervalinMiliseconds = 5 * 10 * 600000;
    }
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
      const tokenExpiration = new Date(this.state.tokenExpiration);
      if (tokenExpiration !== undefined && tokenExpiration !== null) {
        const intervalinMiliseconds = this.getmiliseconds(tokenExpiration);

        this.interval = setInterval(() => {
          this.getPowerBIToken(true);
        }, intervalinMiliseconds);
      }
    }
  };

  // Function to update the interval time
  updateIntervalTime = (newTime) => {
    this.setState({ tokenExpiration: newTime }, this.startInterval);
  };

  getPowerBIToken = (Isupdate) => {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
          rname: "Supplier_tracker_daimler",
        },
        maxBodyLength: Infinity,
      };
      axios.post(getNextJSServiceUrl() + "environmental-dashboard/PowerBiTokenGeneration", null, config)
        .then((response) => {
          if (response.status === 200) {
            if (response.data !== undefined) {
              const filterData = response.data.value.filters;
              const currentReportConfig = this.state.reportConfig;
              const updatedReportConfig = {
                ...currentReportConfig,
                filters: null,
                sectionurl: "",
                settings: null,
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
                  this.updateIntervalTime(tokenExpiration);
                }
              }
            }
          }
        })
        .catch((err) => console.log("err", err))
        .finally(() => this.setState({ loader: false }));
    
    this.setState({ loader: false });
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
    response.data.data.forEach((item) => {
      item.locations.forEach((location) => {
        if (!locationsMap.has(location.label)) {
          locationsMap.set(location.label, new Set());
        }
        if (!locationsMap.has(location.id)) {
          locationsMap.set(location.id, new Set());
        }
        locationsMap.get(location.id).add(item.main_activity);
        locationsMap.get(location.label).add(item.main_activity);
      });
    });

    // Convert Map to the desired output format
    locationsMap.forEach((activities, id) => {
      result.push({
        ...(isUUID(id)
          ? { organization_address_id: id }
          : { organization_address_name: id }),
        activities: Array.from(activities),
      });
    });
    return result;
  };
  handleTimer = () => {
    this.timer = setTimeout(() => {
      console.log("1 hour has passed!");
      this.startInterval();
    }, 7200);
  };
  
  async getDashboardUrl() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: localStorage.companyGuid,
        DashboardType: "suppliertracker",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        const reportdata = json.data;
        if (json.status === 200) {
          if (json.data !== undefined) {
            if (json.data !== undefined) {
              let reportDetails = json.data.filter(
                (x) =>
                  x.dashboardType === "suppliertracker" 
              )[0].reportName;
              let reportMappingData = {};
              if (!!reportdata) {
                reportMappingData = JSON.parse(reportdata[0].reportName);
              }
              if (
                reportDetails !== undefined &&
                reportDetails !== null &&
                localStorage.companyGuid === reportdata[0].companyGuid
              ) {
 
                setTimeout(() => {
                  this.setState({ loader: false });
                }, 5000);
 
                this.timer = setTimeout(() => {
                  console.log("1 hour has passed!");
                  if (
                    tabUrl !== "" &&
                    tabUrl !== undefined &&
                    tabUrl !== null
                  ) {
                    this.startInterval(reportMappingData);
                  } else {
                    this.startInterval(reportMappingData);
                  }
                }, 7200);
              }
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
  }

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions.length === 0) {
      return <Redirect to="/home" />;
    } else if (
      getUserPermision(permissions, PageKeys.SupplierTracker) === null
    ) {
      return <Redirect to="/home" />;
    }
    return (
      <>
        <div className="powerBiContainer" style={{ padding: "0px" }}>
          <div className={classes.root}> 
            {
              <>
                <PowerBiReportIframe
                  key={this.state.reportConfig.accessToken}
                  embedConfig={this.state.reportConfig}
                  cssClassName={
                    value === 1
                      ? "power-bi-ops-general-energy-transport-class-new"
                      : "power-bi-ops-waste-class-new"
                  }
                  iframeHeight={this.state.dashboardiFrameHeight}
                  isPowerBiReport={this.state.isPowerBiReport}
                  withBorder={this.state.isBorder}
                />
              </>
            }
          </div>
        </div>
      </>
    );
  }
}
SupplierTracker.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(SupplierTracker);
