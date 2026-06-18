import React, { Component } from "react";
// import Tabs from '@material-ui/core/Tabs';
// import Tab from '@material-ui/core/Tab';
import { withStyles } from "@material-ui/core/styles";
import MoreVert from "@material-ui/icons/MoreVert";
import axios from "axios";
import jwt from "jsonwebtoken";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { getNextJSServiceUrl, getServiceUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb } from "../../utility";
import PowerBiReportIframe from "../Dashboard/PowerBiReportIframe";

let params = "";
let ShowOtherCompanyDetails = false;
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
class BankingReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      value: 0,
      dashboardUrl: null,
      showExport: false,
      dashboardiFrameHeight: "",
      isBorder: false,
      isPowerBiReport: false,
    };
  }

  async componentDidMount() {
    await this.getDashboardUrl("bankingreport");
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
      //await this.GetAuthToken();
      if (
        localStorage.warpUserCompanyId === undefined ||
        localStorage.warpUserCompanyId === "null"
      ) {
        const decodedToken = jwt.decode(localStorage.warpToken);
        // console.log({ decodedToken });
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
        // console.log({ decodedToken });
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
        } else {
          ShowOtherCompanyDetails = false;
        }
      } else {
        ShowOtherCompanyDetails = false;
        params = localStorage.warpUserCompanyId;
      }
    } else {
      ShowOtherCompanyDetails = false;
      params = localStorage.warpUserCompanyId;
    }
    setTimeout(() => {
      this.setState({ loader: false });
    }, 6800);
  }
  handleChange = (event, value) => {
    this.setState({ value, loader: true });
  };

  async getDashboardUrl(urlType) {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: localStorage.companyGuid,
        DashboardType: urlType,
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        // console.log("urls", json)
        if (json.status === 200) {
          if (json.data !== undefined) {
            let url = json.data;
            this.setState({
              dashboardUrl: url,
              isBorder: json.data[0].isBorder,
              isPowerBiReport: json.data[0].isPowerBiReport,
              dashboardiFrameHeight: json.data[0].dashboardHeight,
            });
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
  render() {
    let breadCrumb = BreadCrumb([
      { pageName: "Dashboard", url: "/Home" },
      { pageName: "Banking Report", url: "/#" },
    ]);
    return (
      <div>
        <div className="breadtitle_wrap">
          {breadCrumb}
          <div className="page_top_title">
            <div className="page_heading">Banking Report</div>
          </div>
        </div>
        {this.state.loader ? (
          <Spinner />
        ) : (
          <div className=" esg_report_container">
            <div className="esg_report_header">
              <h6>Banking Report</h6>
              {/* <div data-html2canvas-ignore="true" className="esg_header_right">
                                <span>request survey</span>
                                <span></span>
                                <span onClick={() => this.pdfDownload()}>
                                    <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export All
                                </span>
                            </div> */}
            </div>
            <div className="downloadKpis">
              <span>To download the KPIs as PDF please right click on</span>
              <MoreVert />
            </div>
            <GridContainer justify="center" className="top_esg_report">
              {this.state.dashboardUrl.length > 0
                ? this.state.dashboardUrl.map((item) => {
                    return (
                      <GridItem md={item.columnSize}>
                        <div
                          className="first_class"
                          style={{ textAlign: "right" }}
                        >
                          {this.state.dashboardUrl && (
                            <PowerBiReportIframe
                              staticLink
                              embedConfig={
                                item.url +
                                localStorage.getItem("warpUserCompanyId") +
                                "%22%7D"
                              }
                              cssClassName="banking_report_new"
                              // onLoad={() => this.setState({ showExport: true })}
                              title="Banking Report"
                              iframeHeight={this.state.dashboardiFrameHeight}
                              isPowerBiReport={this.state.isPowerBiReport}
                              isBorder={this.state.isBorder}
                            />
                          )}
                        </div>
                      </GridItem>
                    );
                  })
                : ""}
            </GridContainer>
          </div>
        )}
      </div>
    );
  }
}
export default withStyles(styles)(BankingReport);
