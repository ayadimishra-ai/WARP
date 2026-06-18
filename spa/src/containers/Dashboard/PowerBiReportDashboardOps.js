import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { GetGHGEstimationUrl, getNextJSServiceUrl, getUserPermision } from "../../config";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import { models } from "powerbi-client";
import { PowerBIEmbed } from "powerbi-client-react";
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Tab, Tabs, Typography } from "@material-ui/core";
import { decodeOpAccessToken } from "../../utility";

const params = {};

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: "transparent",
    marginBottom:"10px"
  },
  tabsRoot: {
    borderBottom: '1px solid transparent',
    marginBottom:"2px"
    
  },
  tabsIndicator: {
    backgroundColor: 'transparent',
    
  },
  tabRoot: {
    color:"#4D4D4F",
    textTransform: 'initial',
    minWidth: 91,
    fontWeight: 700,
    marginRight: "10px",
    backgroundColor:"#fff",
    borderRadius:"30px",
    fontSize:"14px",
    lineHeight:"16px",
    border:"1px solid #999999",
    opacity: 1,
    '&:hover': {
      color: '#fff',
      background:"linear-gradient(184.76deg, #005C81 2.97%, #122F47 97.4%)",
      opacity: 1,
      border:"1px solid transparent",
    },
    '&$tabSelected': {
      color: '#fff',
      background:"linear-gradient(184.76deg, #005C81 2.97%, #122F47 97.4%)",
      border:"1px solid transparent",
    },
    '&:focus': {
      color: '#fff',
      background:"linear-gradient(184.76deg, #005C81 2.97%, #122F47 97.4%)",
      border:"1px solid transparent",
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
  waste: 4

};
const reportMapping = {
  general: "",
  energy: "",
  materials_and_suppliers: "",
  transport: "Live_OP_GHG_Dashboard_Transportation_v1",
  waste: "Live_OP_GHG_Dashboard_Waste_v1"

};
class PowerBiReportsDashboardOps extends Component {
  constructor(props) {
    super(props);
    const Searchparams = new URLSearchParams(this.props.location.search);
    this.state = {
      dashboardUrls: [],
      loader: true,
      sectionurls: [],
      reportName : reportMapping[Searchparams.get('tab') || 'general'],
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
        },
      },
      tokenExpiration: "",
      intervalinMiliseconds: 5 * 10 * 600000,
      value: tabMapping[Searchparams.get('tab') || 'general']
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
    this.getPowerBIToken(false);
   

    this.timer = setTimeout(() => {
      console.log("1 hour has passed!");
      this.startInterval();
    }, 7200);
  };
    componentDidUpdate(prevProps, prevState){
      if(this.state.reportName && prevState.reportName !== this.state.reportName){
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
    if(this.state.reportName){
    const config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        rname: this.state.reportName,
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
      .finally(() => this.setState({loader: false}));
    }
    this.setState({loader: false})
  };


  getActivityPermission = async (decodedToken) => {
    const formData = {
      organizationId:
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
      userId:
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
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
  handleTimer = () => {
    this.timer = setTimeout(() => {
      console.log("1 hour has passed!");
      this.startInterval();
    }, 7200);
  }
  handleChange = (event, value) => {
    let tabName = "general"
    switch(value){
        case 0:
        tabName = "general"
        break;
        case 1:
        tabName = "energy"
        break;
        case 2:
        tabName = "materials_and_suppliers"
        break;
        case 3:
        tabName = "transport"
        break;
        case 4:
        tabName = "waste"
        break;
        default:
        break;
    }
    this.setState({ value, reportName: reportMapping[tabName]});
    const { history } = this.props;
    history.push(`/ghg-dashboard?tab=${tabName}`);
  };

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
            {/* <div className="waterMarkHide"></div> */}
            <div className="powerBiContainer" style={{padding:"0px"}}>
            <div className="powerBiTrialNoteHide"></div>
              {/* <Box display="flex" flexDirection="row" flexWrap="nowrap">
                <Button className={classes.button}>General</Button>
                <Button className={classes.button}>Energy</Button>
                <Button className={classes.button}>Transport</Button>
              </Box> */}
              <div className={classes.root}>
                <Tabs
                  value={value}
                  onChange={this.handleChange}
                  classes={{ root: classes.tabsRoot, indicator: classes.tabsIndicator }}
                >
                  <Tab
                    disableRipple
                    
                    boxShadow={2}
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="General"
                  />
                  <Tab
                    disableRipple
                    
                    boxShadow={2}
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Energy"
                  />
                   <Tab
                    disableRipple
                    
                    boxShadow={2}
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Materials and Suppliers"
                  />
                  <Tab
                    disableRipple
                    
                    boxShadow={2}
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
                    label="Transport"
                  />
                   <Tab
                    disableRipple
                    style={{ boxShadow: "-1px 10px 11px -9px rgba(0, 0, 0, 0.3)" }}
                    boxShadow={2}
                    classes={{ root: classes.tabRoot, selected: classes.tabSelected, shadow: classes.shadowStyle }}
                    label="Waste"
                  />
                </Tabs>
                {value === 0 && <Typography className={classes.typography}></Typography>}
                {value === 1 && <Typography className={classes.typography}></Typography>}
                {value === 2 && <Typography className={classes.typography}></Typography>}
                {(value === 3 ||  value === 4 ) && 
                  <>
                    <div className="powerBiTrialNoteHide" />
                      <PowerBIEmbed
                        embedConfig={this.state.reportConfig}
                        cssClassName={value === 3 ? "power-bi-ops-general-energy-transport-class " : "power-bi-ops-waste-class "}
                      />
                  </>}
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

