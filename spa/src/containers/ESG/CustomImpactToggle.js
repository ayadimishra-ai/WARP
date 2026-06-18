import React, { Component } from "react";
import Tabs from "@material-ui/core/Tabs";
import Tab from "@material-ui/core/Tab";
import axios from "axios";
import { getNextJSServiceUrl, getServiceUrl } from "../../config";
import { withStyles } from "@material-ui/core/styles";
import jwt from "jsonwebtoken";
import * as RoleCodes from "../../rolecodes";
import AgTechReport from "./AgTechReport";
import FinTechReport from "./FinTechReport";

const styles = (theme) => ({
  root: {
    flexGrow: 1,
    backgroundColor: theme.palette.background.paper,
  },
  tabsRoot: {
    padding: "0 80px",
    marginTop: "25px",
  },
  tabsIndicator: {
    backgroundColor: "#FFA93C",
  },
  tabRoot: {
    textTransform: "initial",
    minWidth: 72,
    fontWeight: theme.typography.fontWeightRegular,
    marginRight: theme.spacing.unit * 2,
    opacity: 1,
    background: "#EBEBEB",
    color: "#4D4D4F",
    borderRadius: "5px 5px 0px 0px",
    "&$tabSelected": {
      color: "#fff",
      fontWeight: theme.typography.fontWeightMedium,
      background: "#FFA93C",
    },
  },
  tabSelected: {},
  typography: {
    padding: theme.spacing.unit * 3,
  },
});

let ShowOtherCompanyDetails = false;
let params = "";

class CustomImpactToggle extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showExport: false,
      value: 0,
      dashboardUrl: [],
      pagePermissions: [],
      dashboardiFrameHeight: "",
      isBorder: false,
      isPowerBiReport: false,
    };
  }

  componentDidMount = async () => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        UserGuid: localStorage.userId,
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "home-page/GetMappedPagesDetail", config)
      .then((json) => {
        this.setState({ pagePermissions: json.data });
      })
      .catch((err) => {});

    if (document.querySelector("iframe")) {
      document.querySelector("iframe").addEventListener("load", function(e) {
        console.log(123);
      });
    }
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
    params = this.getUrlParameter("companyid");
    if (params !== undefined) {
      if (params !== false) {
        if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
          ShowOtherCompanyDetails = true;
          await this.getDashboardUrl(params);
        } else {
          ShowOtherCompanyDetails = false;
          await this.getDashboardUrl(localStorage.companyGuid);
        }
      } else {
        ShowOtherCompanyDetails = false;
        params = localStorage.warpUserCompanyId;
        await this.getDashboardUrl(localStorage.companyGuid);
      }
    } else {
      ShowOtherCompanyDetails = false;
      params = localStorage.warpUserCompanyId;
      await this.getDashboardUrl(localStorage.companyGuid);
    }
    setTimeout(() => {
      this.setState({ loader: false });
    }, 6800);
  };

  handleChange = (event, value) => {
    this.setState({ value });
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

  async getDashboardUrl(companyGuid) {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: companyGuid,
        DashboardType: "customimpactdashboardreport",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        if (json.status === 200) {
          let url = "";
          if (
            JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
            JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
            ShowOtherCompanyDetails === true
          ) {
            url = json.data.filter(
              (x) =>
                x.dashboardType === "customimpactdashboardreport" &&
                x.companyType === "Portfolio Company"
            );
          } else if (
            JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
          ) {
            url = json.data.filter(
              (x) =>
                x.dashboardType === "customimpactdashboardreport" &&
                x.companyType === "VC Company"
            );
          }
          this.setState({
            dashboardUrl: url,
            isBorder: json.data[0].isBorder,
            isPowerBiReport: json.data[0].isPowerBiReport,
            dashboardiFrameHeight: json.data[0].dashboardHeight,
          });
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
    let preAndPostDealPermission = this.state.pagePermissions.filter(
      (x) => x.pageName === "CustomImpactDashboardReport"
    );

    const { value } = this.state;
    const { classes } = this.props;
    return (
      preAndPostDealPermission.length > 0 && (
        <div>
          <Tabs
            value={value}
            classes={{
              root: classes.tabsRoot,
              indicator: classes.tabsIndicator,
            }}
            onChange={this.handleChange}
          >
            <Tab
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="AgTech Report"
            />
            <Tab
              classes={{ root: classes.tabRoot, selected: classes.tabSelected }}
              label="FinTech Report"
            />
          </Tabs>
          {value === 0 && (
            <div>
              <AgTechReport />
            </div>
          )}
          {value === 1 && (
            <div>
              <FinTechReport />
            </div>
          )}
        </div>
      )
    );
  }
}
export default withStyles(styles)(CustomImpactToggle);
