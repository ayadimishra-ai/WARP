import React, { useState, useEffect, useCallback, useMemo, useRef } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { GetGHGEstimationUrl, getNextJSServiceUrl, getUserPermision } from "../../config";
import axios from "axios";
import { models } from "powerbi-client";
import PropTypes from "prop-types";
import { withStyles } from "@material-ui/core/styles";
import { Tab, Tabs } from "@material-ui/core";
import { decodeOpAccessToken, isUUID } from "../../utility";
import PowerBiReportIframe from "./PowerBiReportIframe";
import { useLayoutEffect } from "react";
import { Lock } from "@material-ui/icons";
import { showLockUpPopup } from "../../UI/Popups/lockUpPopUp";

const tabMapping = {
  general: "general",
  energy: "energy",
  materials_and_suppliers: "materials_and_suppliers",
  transport: "transport",
  waste: "waste",
  environmental_snapshot: "environmental_snapshot",
  water: "water",
  hr: "hr",
  health_and_safety: "health_and_safety",
  csr: "csr",
  compliance: "compliance",
};



const OPPowerBiCorporateDashboard = ({ classes, location, history }) => {
  // Get URL parameters
  const searchParams = useMemo(() => new URLSearchParams(location.search), [location.search]);

  const tabUrl = useMemo(() => searchParams.get("tab"), [searchParams]);

  // State management
  const [loading, setLoading] = useState(true);
  const [dashboardUrls, setDashboardUrls] = useState([]);
  const [loader, setLoader] = useState(true);
  const [sectionurls, setSectionurls] = useState([]);
  const [reportMapping, setReportMapping] = useState(null);
  const [reportName, setReportName] = useState("");
  const [reportConfig, setReportConfig] = useState({
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
  });
  const [tokenExpiration, setTokenExpiration] = useState("");
  const [intervalinMiliseconds, setIntervalinMiliseconds] = useState(5 * 10 * 600000);
  const [value, setValue] = useState(tabMapping[searchParams.get("tab") || "energy"]);
  const [dashboardiFrameHeight, setDashboardiFrameHeight] = useState("");
  const [isBorder, setIsBorder] = useState(false);
  const [isPowerBiReport, setIsPowerBiReport] = useState(true);
  const [hideTabs, setHideTabs] = useState([]);
  const [isPowerBIReportHidden, setIsPowerBIReportHidden] = useState(false);

  // Refs for timers
  const timerRef = useRef(null);
  const intervalRef = useRef(null);
  const paramsRef = useRef({});

  // console.log("corporate-dashboard", { hideTabs, reportMapping, reportName, value, paramsRef: paramsRef.current });


  // Permission check
  const hasPermissions = useCallback(() => {
    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions.length === 0) {
      return false;
    }

    if (!getUserPermision(permissions, PageKeys.corporatedashboardops)) {
      return false;
    }
    return true;
  }, []);

  // Utility function for milliseconds calculation
  const getmiliseconds = useCallback((tokenExpiration) => {
    const currentmilliseconds = new Date().getTime();
    const istOffset = 5.4 * 60;
    const tokenExpirationmilliseconds = new Date(
      tokenExpiration.getTime() + istOffset * 60 * 1000
    );
    let intervalinMiliseconds = tokenExpirationmilliseconds - currentmilliseconds;
    if (isNaN(intervalinMiliseconds)) {
      intervalinMiliseconds = 5 * 10 * 600000;
    } else if (intervalinMiliseconds === 0) {
      intervalinMiliseconds = 5 * 10 * 600000;
    }
    setIntervalinMiliseconds(intervalinMiliseconds);
    return intervalinMiliseconds;
  }, []);

  // Get activity permissions
  const getActivityPermission = useCallback(async (decodedToken) => {
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

    const result = [];
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

    locationsMap.forEach((activities, id) => {
      result.push({
        ...(isUUID(id)
          ? { organization_address_id: id }
          : { organization_address_name: id }),
        activities: Array.from(activities),
      });
    });
    return result;
  }, []);
  // Get Power BI Token
  const getPowerBIToken = useCallback(async (Isupdate = false) => {
    console.log("getPowerBIToken called with reportName:", reportName, "paramsRef:", paramsRef.current);
    // debugger;
    if (reportName) {
      const config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
          rname: reportName,
        },
        maxBodyLength: Infinity,
      };

      try {
        console.log("Making API call to PowerBiTokenGeneration");
        const response = await axios.post(
          getNextJSServiceUrl() + "environmental-dashboard/PowerBiTokenGeneration",
          null,
          config
        );

        if (response.status === 200 && response.data !== undefined) {
          // debugger;
          const filterData = response.data.value.filters;
          const orgAddressIds = paramsRef.current.opsUserOrganizationAddressIds || [];

          let updatedFilterString = filterData.replace(
            /@organization_address_id/g,
            orgAddressIds.length === 0
              ? '""'
              : orgAddressIds.length === 1
                ? '"' + orgAddressIds[0] + '"'
                : '"' + orgAddressIds.join('","') + '"'
          );

          const parsedFilterData = JSON.parse(updatedFilterString);
          const updatedFilters = parsedFilterData.filters.map((filter) => {
            return {
              ...filter,
              values:
                filter.values === "@organization_address_id"
                  ? paramsRef.current.opsUserOrganizationAddressIds || []
                  : filter.values,
            };
          });

          setReportConfig(prevConfig => ({
            ...prevConfig,
            filters: updatedFilters,
            sectionurl: "",
            settings: parsedFilterData.settings,
            embedUrl: response.data.value.embedUrl,
            accessToken: response.data.value.token,
            id: response.data.value.id,
          }));

          setSectionurls("");
          setLoader(false);
          setTokenExpiration(response.data.date1);
          setDashboardiFrameHeight(response.data.value.dashboardHeight);
          setIsBorder(response.data.value.isBorder);
          setIsPowerBiReport(response.data.value.isPowerBiReport);

          if (Isupdate) {
            const tokenExpirationDate = new Date(response.data.date1);
            if (tokenExpirationDate !== undefined && tokenExpirationDate !== null) {
              updateIntervalTime(tokenExpirationDate);
            }
          }
        }
      } catch (err) {
        console.log("err", err);
        setLoader(false);
      }
    } else {
      setLoader(false);
    }
  }, [reportName, updateIntervalTime]);

  // Update interval time
  const updateIntervalTime = useCallback((newTime) => {
    setTokenExpiration(newTime);
  }, []);

  // Start interval
  const startInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    if (tokenExpiration && tokenExpiration !== "") {
      const tokenExpirationDate = new Date(tokenExpiration);
      if (tokenExpirationDate && !isNaN(tokenExpirationDate)) {
        const intervalinMiliseconds = getmiliseconds(tokenExpirationDate);
        intervalRef.current = setInterval(() => {
          getPowerBIToken(true);
        }, intervalinMiliseconds);
      }
    }
  }, [tokenExpiration, getmiliseconds, getPowerBIToken]);

  // Handle tab change
  const handleChange = useCallback((event, newValue) => {
    // console.log("corporate-dashboard", { newValue });
    
    if (hideTabs.includes(newValue)){
      if (event){
        event.preventDefault();
      }
      showLockUpPopup()
      return;
    } else {
      let tabName = tabMapping[newValue] || "energy";
      setValue(newValue);
      setReportName(tabName);
      history.push(`/corporate-dashboard?tab=${tabName}`);
    }
     
  }, [tabMapping, history, hideTabs]);


  // Parse Report Name
  const parseDBRepoprtName = (reprotDetails) => {
    try {
      return JSON.parse(reprotDetails);
    } catch (error) { }
    return null;
  }

  // Get dashboard URLs
  const getDashboardUrl = useCallback(async () => {
    const config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: localStorage.companyGuid,
        DashboardType: "corporatedashboardnew",
      },
    };
    setLoading(true);
    try {
      const response = await axios.get(getNextJSServiceUrl() + "common/GetDashboardUrls", config);
      const reportdata = response.data;
      console.log("common/GetDashboardUrls", { response, tabUrl });

      let reportMappingData = null;
      let isSingleReportName = null;

      if (reportdata && reportdata.length > 0) {
        // console.log("reportdata[0]", reportdata[0]);
        const _report = reportdata[0];
        const reportName = _report.reportName
        reportMappingData = parseDBRepoprtName(reportName);
        isSingleReportName = reportMappingData === null;

        if (!reportMappingData) reportMappingData = reportName;

        setHideTabs(reportdata[0].hideTabs || []);
      }

      if (isSingleReportName) {
        setReportName(reportMappingData);
      } else {
        if (response.status === 200 && response.data !== undefined) {
          const filteredReports = response.data.filter(
            (x) =>
              x.dashboardType === "corporatedashboardnew" &&
              x.companyType === "VC Company"
          );
          const reportDetails = filteredReports.length > 0 ? filteredReports[0].reportName : null;

          // let reportMappingData = {};
          // if (reportdata) {
          //   reportMappingData = JSON.parse(reportdata[0].reportName);
          // }

          if (
            reportDetails !== undefined &&
            reportDetails !== null &&
            reportdata.length > 0 &&
            localStorage.companyGuid === reportdata[0].companyGuid
          ) {
            setReportMapping(reportMappingData);

            if (tabUrl !== "" && tabUrl !== undefined && tabUrl !== null) {
              console.log("Setting reportName from tabUrl:", reportMappingData[tabUrl]);
              setReportName(reportMappingData[tabUrl]);
            } else {
              console.log("Setting default reportName:", reportMappingData["energy"]);
              setReportName(reportMappingData["energy"]);
            }

            timerRef.current = setTimeout(() => {
              console.log("1 hour has passed!");
              // Will be handled by useEffect when tokenExpiration changes
            }, 7200);
          }
        }
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        window.location.pathname = "/logout";
      }
    }
    setLoading(false);
  }, [tabUrl]);

  // Setup user parameters and permissions
  useEffect(() => {
    const initializeComponent = async () => {
      // debugger;
      // First setup user parameters
      if (
        !!localStorage.opsToken
      ) {
        const decodedToken = decodeOpAccessToken(localStorage.opsToken);
        const activityPermissions = await getActivityPermission(decodedToken);

        const opsUserOrganizationAddressIds = activityPermissions
          .filter((a) => a.organization_address_id)
          .map((a) => a.organization_address_id);

        const opsUserCompanyId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];

        localStorage.setItem("opsUserCompanyId", opsUserCompanyId);
        localStorage.setItem("opsUserAddressIds", opsUserCompanyId);

        paramsRef.current.opsUserCompanyId = opsUserCompanyId;
        paramsRef.current.opsUserOrganizationNames = activityPermissions
          .filter((a) => a.organization_address_name)
          .map((a) => a.organization_address_name);
        paramsRef.current.opsUserOrganizationAddressIds = opsUserOrganizationAddressIds;
      } else {
        paramsRef.current.opsUserCompanyId = localStorage.companyGuid;
        paramsRef.current.opsUserOrganizationAddressIds = JSON.parse(
          localStorage.opsUserOrganizationAddressIds || "[]"
        );
      }

      // Then get dashboard URL after params are set
      await getDashboardUrl();

      // Setup initial timer
      timerRef.current = setTimeout(() => {
        console.log("1 hour has passed!");
        // startInterval will be called via useEffect when tokenExpiration changes
      }, 7200);
    };

    initializeComponent();

    // Cleanup on unmount
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      console.log("Interval cleared");
    };
  }, [getActivityPermission, getDashboardUrl]);

  // Effect for when reportName changes
  useEffect(() => {
    console.log("reportName changed:", reportName);
    if (reportName) {
      console.log("Calling getPowerBIToken with reportName:", reportName);
      console.log("paramsRef.current:", paramsRef.current);
      getPowerBIToken(false);

      timerRef.current = setTimeout(() => {
        console.log("1 hour has passed!");
        // startInterval will be called when tokenExpiration is updated
      }, 7200);
    }
  }, [reportName, getPowerBIToken]);

  // Effect for starting interval when tokenExpiration changes
  useEffect(() => {
    if (tokenExpiration) {
      startInterval();
    }
  }, [tokenExpiration, startInterval]);

  useLayoutEffect(() => {

    if (reportMapping && !loading && tabUrl) {
      const hasMultipleReports = typeof reportMapping === 'object'
      if (hasMultipleReports) {
        const reportKeys = Object.keys(reportMapping).filter(m => !hideTab(m))
        if (reportKeys.length > 0 && !reportKeys.includes(tabUrl)) {
          // console.log("corporate-dashboard", { tabUrl, reportMapping, loading, reportKeys, firstTab });
          setValue("energy");
          history.push(`/corporate-dashboard?tab=energy`);
        }
      }
    }
  }, [tabUrl, reportMapping, loading, history]);

  useEffect(() => {
    // Show showLockPopup and hide power bi dashboard/report if all tabs are hidden
    if(reportMapping){
      const tabMapping = [ "general", "energy", "materials_and_suppliers", "transport", "waste", "water", "hr", "health_and_safety", "csr", "compliance" ];
      const filteredTabs = tabMapping.filter((tabKey) => {
        const reportKeys = Object.keys(reportMapping || "");
        return hideTabs.includes(tabKey) || !reportKeys.includes(tabKey);  
      });

      if(filteredTabs && filteredTabs.length > 0 && filteredTabs.length === tabMapping.length){
        setIsPowerBIReportHidden(true);
        showLockUpPopup()
      }
    }
  }, [hideTabs, reportMapping]);

  // Render conditional based on permissions
  if (hasPermissions() === false) {
    return <Redirect to="/home" />;
  }

  const hideTab = useCallback((tabKey) => {
    const reportKeys = Object.keys(reportMapping || "");
    return hideTabs.includes(tabKey) || !reportKeys.includes(tabKey);
  }, [hideTabs, reportMapping]);
  

  // if (loading) return <div></div>;

  return (
    <div className="powerBiContainer" style={{ padding: "0px" }}>
      <div className="powerBiTrialNoteHide" />
      <div className={classes.root}>
        <Tabs
          value={value}
          onChange={handleChange}
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
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("general") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon                    
            }}
            label="General"
            value="general"
            icon={ reportMapping != null && hideTab("general") ? <Lock style={{height : "20px", width : "20px"}}/> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("energy") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="Energy and Fugitive"
            value="energy"
            icon={ reportMapping != null && hideTab("energy") ? <Lock fontSize="small" /> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("materials_and_suppliers") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="Materials and Suppliers"
            value="materials_and_suppliers"
            icon={ reportMapping != null && hideTab("materials_and_suppliers") ? <Lock fontSize="small" /> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("transport") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="Transport"
            value="transport"
            icon={ reportMapping != null && hideTab("transport") ? <Lock style={{height : "20px", width : "20px"}} /> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("waste") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="Waste"
            value="waste"
            icon={ reportMapping != null && hideTab("waste") ? <Lock fontSize="small" /> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("water") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="Water"
            value="water"
            icon={ reportMapping != null && hideTab("water") ? <Lock fontSize="small" /> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("hr") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="HR"
            value="hr"
            icon={ reportMapping != null && hideTab("hr") ? <Lock fontSize="small" /> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("health_and_safety") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="Health & Safety"
            value="health_and_safety"
            icon={ reportMapping != null && hideTab("health_and_safety") ? <Lock fontSize="small" /> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("csr") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="CSR"
            value="csr"
            icon={ reportMapping != null && hideTab("csr") ? <Lock fontSize="small" /> : null}
          />}
          {<Tab
            disableRipple
            classes={{
              root: reportMapping != null && hideTab("compliance") ? classes.tabRootLocked : classes.tabRoot,
              selected: classes.tabSelected,
              wrapper: classes.tabWrapper,
              labelContainer: classes.labelContainer,
              labelIcon: classes.labelIcon
            }}
            label="Compliance"
            value="compliance"
            icon={ reportMapping != null && hideTab("compliance") ? <Lock fontSize="small" /> : null}
          />}
        </Tabs>
        {
          !isPowerBIReportHidden ? 
          <PowerBiReportIframe
            key={reportConfig.accessToken}
            embedConfig={reportConfig}
            cssClassName={
              value === 1
                ? "power-bi-ops-general-energy-transport-class-new"
                : "power-bi-ops-waste-class-new"
            }
            iframeHeight={dashboardiFrameHeight}
            isPowerBiReport={isPowerBiReport}
            withBorder={isBorder}
          />
          : null
        }
      </div>
    </div>
  );
};

// Styles
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
  tabRootLocked: {
    color: "#888888",
    textTransform: "initial",
    minWidth: 91,
    fontWeight: 700,
    marginRight: "10px",
    backgroundColor: "#ffffff",
    borderRadius: "30px",
    fontSize: "14px",
    lineHeight: "16px",
    border: "1px solid #999999",
    opacity: 1,
    "&:hover": {
      color: "#fff",
      background: "linear-gradient(184.76deg, #005C81 2.97%, #122F47 97.4%)",
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
  tabWrapper: {
    display: "flex",
    flexDirection: "row-reverse",
    justifyContent: "space-between",
    padding: "9px 15px",
  },
  typography: {
    padding: theme.spacing.unit * 3,
  },
  labelContainer: {
    padding: "6px 15px !important",
  },
  labelIcon: {
    minHeight: "16px",
    padding:0
   },
});

// PropTypes
OPPowerBiCorporateDashboard.propTypes = {
  classes: PropTypes.object.isRequired,
  location: PropTypes.object.isRequired,
  history: PropTypes.object.isRequired,
};

export default withStyles(styles)(OPPowerBiCorporateDashboard);
