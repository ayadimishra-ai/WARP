import React, { Component, useState } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import {
  GetGHGEstimationUrl,
  getNextJSServiceUrl,
  getUserPermision,
} from "../../config";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import { models } from "powerbi-client";
import { PowerBIEmbed } from "powerbi-client-react";
import { decodeOpAccessToken } from "../../utility";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { AppBar, Tab, Tabs, Typography } from "@material-ui/core";
import PowerBiReportIframe from "./PowerBiReportIframe";
import { isUUID } from "../../utility";
const params = {};

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "transparent !important",
    marginBottom: "10px",
    background: "transparent !important",
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
    marginBottom: "2px",
  },
  tabsIndicator: {
    backgroundColor: "transparent !important",
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
  energy: 1,
  materials_and_suppliers: 2,
  transport: 3,
  waste: 4,
  environmental_snapshot: 5,
  water: 6,
  hr: 7,
  health_and_safety: 8,
  csr: 9,
  compliance: 10,
};

const reportMapping = {
  general: "POC General KPIs Beta New",
  energy: "Beta_OP_GHG_Dashboard_Energy_v1",
  materials_and_suppliers: "Beta_OP_GHG_Dashboard_Material_and_Suppliers_v1",
  transport: "Beta_OP_GHG_Dashboard_Transportation_v1",
  waste: "Beta_OP_GHG_Dashboard_Waste_v1",
  environmental_snapshot:
    "IndiaServices_Beta_CorporateDashboard_Environment_Snapshot_v1",
  water: "IndiaServices_Beta_CorporateDashboard_Water_v1",
  hr: "IndiaServices_Beta_CorporateDashboard_HR_v1",
  health_and_safety:
    "IndiaServices_Beta_CorporateDashboard_Health_and_Safety_v1",
  csr: "IndiaServices_Beta_CorporateDashboard_CSR_v1",
  compliance: "IndiaServices_Beta_CorporateDashboard_Compliance_v1",
};

class PowerBiReportsDashboardOps extends Component {
  constructor(props) {
    super(props);
    const Searchparams = new URLSearchParams(this.props.location.search);
    this.state = {
      dashboardUrls: [],
      loader: true,
      sectionurls: [],
      reportName: reportMapping[Searchparams.get("tab") || "general"],
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

      const opsUserOrganizationAddressIds = activityPermissions.map((a) => {
        return a.organization_address_id;
      });

      const opsUserCompanyId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", opsUserCompanyId);
      localStorage.setItem("opsUserAddressIds", opsUserCompanyId);
      params.opsUserCompanyId = opsUserCompanyId;

      params.opsUserOrganizationAddressIds = opsUserOrganizationAddressIds.filter(
        (x) => x !== undefined
      );
      params.opsUserOrganizationNames = activityPermissions
        .filter((a) => a.organization_address_name)
        .map((a) => a.organization_address_name);
    } else {
      params.opsUserCompanyId = localStorage.companyGuid;
      try {
        params.opsUserOrganizationAddressIds = JSON.parse(
          localStorage.opsUserOrganizationAddressIds.filter(
            (x) => x !== undefined
          )
        );
      } catch (error) {
        // Handle JSON parsing error
        console.error("Error parsing organization address IDs:", error);
        params.opsUserOrganizationAddressIds = []
      }
    }
    this.getPowerBIToken(false);

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
      this.getPowerBIToken(false);

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
    //console.log("milliseconds", tokenExpirationmilliseconds);
    //console.log("currentmilliseconds", currentmilliseconds);
    let intervalinMiliseconds =
      tokenExpirationmilliseconds - currentmilliseconds;
    //console.log("intervalinMiliseconds", intervalinMiliseconds);
    if (isNaN(intervalinMiliseconds)) {
      intervalinMiliseconds = 5 * 10 * 600000;
    } else if (intervalinMiliseconds === 0) {
      intervalinMiliseconds = 5 * 10 * 600000;
    }
    //console.log("intervalinMiliseconds1", intervalinMiliseconds);
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
          //   "1 hour has passed!BETA_OP_Consumption_Dashboard_v1",
          //   intervalinMiliseconds
          // );
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
    if (this.state.reportName) {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
          rname: this.state.reportName,
        },
        maxBodyLength: Infinity,
      };
      axios
        .post(
          getNextJSServiceUrl() +
            "environmental-dashboard/PowerBiTokenGeneration",
          null,
          config
        )
        .then((response) => {
          if (response.status === 200) {
            if (response.data !== undefined) {
              let orgLocationName = "";
              params.opsUserOrganizationNames.map((x) => {
                orgLocationName += '"' + x + '",';
              });
              let str = orgLocationName;
              str = str.replace(/,\s*$/, "");
              let jsonArrayStr = `[${str}]`;

              const filterData = response.data.value.filters;

              let updatedFilterString;
              let parsedFilterData;
              let updatedFilters;

              if (this.state.reportName === reportMapping["general"]) {
                updatedFilterString = filterData
                  .replaceAll("@organization_address_name", jsonArrayStr)
                  .replaceAll(
                    "@opsUserCompanyId",
                    '"' + params.opsUserCompanyId + '"'
                  )
                  .replaceAll(
                    "@opsUserOrganizationAddressIds",
                    JSON.stringify("@opsUserOrganizationAddressIds")
                  );
                parsedFilterData = JSON.parse(updatedFilterString);

                updatedFilters = parsedFilterData.filters.map((filter) => {
                  return {
                    ...filter,
                    values:
                      filter.values === "@opsUserOrganizationAddressIds"
                        ? params.opsUserOrganizationAddressIds
                        : filter.values,
                  };
                });
                parsedFilterData = JSON.parse(updatedFilterString);
                updatedFilters = parsedFilterData.filters.map((filter) => {
                  return {
                    ...filter,
                    values:
                      filter.values === "@organization_address_name"
                        ? params.opsUserOrganizationNames
                        : filter.values,
                  };
                });
              } else {
                updatedFilterString = filterData
                  .replaceAll(
                    "@opsUserCompanyId",
                    '"' + params.opsUserCompanyId + '"'
                  )
                  .replaceAll(
                    "@opsUserOrganizationAddressIds",
                    JSON.stringify("@opsUserOrganizationAddressIds")
                  );
                parsedFilterData = JSON.parse(updatedFilterString);

                updatedFilters = parsedFilterData.filters.map((filter) => {
                  return {
                    ...filter,
                    values:
                      filter.values === "@opsUserOrganizationAddressIds"
                        ? params.opsUserOrganizationAddressIds
                        : filter.values,
                  };
                });
              }

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
                  this.updateIntervalTime(tokenExpiration);
                }
              }
            }
          }
        })
        .catch((err) => console.log("err", err))
        .finally(() => this.setState({ loader: false }));
    }
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
  handleTimer = (reportName) => {
    this.timer = setTimeout(() => {
      console.log("1 hour has passed!");
      this.startInterval(reportName);
    }, 7200);
  };
  handleChange = (event, value) => {
    let tabName = "general";
    switch (value) {
      case 0:
        tabName = "general";
        break;
      case 1:
        tabName = "energy";
        break;
      case 2:
        tabName = "materials_and_suppliers";
        break;
      case 3:
        tabName = "transport";
        break;
      case 4:
        tabName = "waste";
        break;
      case 5:
        tabName = "environmental_snapshot";
        break;
      case 6:
        tabName = "water";
        break;
      case 7:
        tabName = "hr";
        break;
      case 8:
        tabName = "health_and_safety";
        break;
      case 9:
        tabName = "csr";
        break;
      case 10:
        tabName = "compliance";
        break;
      default:
        break;
    }
    this.setState({ value, reportName: reportMapping[tabName] });
    const { history } = this.props;
    history.push(`/corporate-dashboard?tab=${tabName}`);
  };
  getIframeHeight = () => {
    const { value } = this.state;
    switch (value) {
      case 0: // General
        return 2710;
      case 1: // Energy
        return 3060;
      case 2: // Materials and Suppliers
        return 2050;
      case 3: // Transport
        return 1470;
      case 4: // Waste
        return 1860;
      case 5: // Environmental Snapshot
        return 1860;
      case 6: // Water
        return 1860;
      case 7: // HR
        return 1860;
      case 8: // Health & Safety
        return 1860;
      case 9: // CSR
        return 1860;
      case 10: // Compliance
        return 1860;
      default:
        return 1500;
    }
  };
  render() {
    console.log("report config", this.state.reportConfig);
    const { classes } = this.props;
    const { value } = this.state;
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
        {/* <div
              style={{
                display: this.state.loader ? "block" : "none",
                position: "absolute",
                width: "100%",
                height: "100vh",
                background: "#fff",
              }}
            >
              <Spinner />
            </div> */}
        <div className="powerBiContainer">
          <div className={classes.root}>
            <Tabs
              value={value}
              onChange={this.handleChange}
              classes={{
                root: classes.tabsRoot,
                indicator: classes.tabsIndicator,
                scrollButtonsAuto: classes.scrollButtonsAuto,
                scrollable: classes.scrollable,
                flexContainer: classes.flexContainer,
              }}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="General"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Energy and Fugitive"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Materials and Suppliers"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Transport"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Waste"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Environmental Snapshot"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Water"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="HR"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Health and Safety"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="CSR"
              />
              <Tab
                disableRipple
                classes={{
                  root: classes.tabRoot,
                  selected: classes.tabSelected,
                }}
                label="Compliance"
              />
            </Tabs>
            {value === 0 && <></>}
            {value === 1 && <></>}
            {[0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].includes(value) && (
              <PowerBiReportIframe
                key={this.state.reportConfig.accessToken}
                embedConfig={this.state.reportConfig}
                cssClassName={
                  value === 3
                    ? "power-bi-ops-general-energy-transport-class "
                    : "power-bi-ops-waste-class "
                }
                iframeHeight={this.getIframeHeight()}
                isPowerBiReport
              />
            )}
          </div>
        </div>
      </>
    );
  }
}
PowerBiReportsDashboardOps.propTypes = {
  classes: PropTypes.object.isRequired,
};
export default withStyles(styles)(PowerBiReportsDashboardOps);
