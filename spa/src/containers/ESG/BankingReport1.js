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
    };
  }

  async componentDidMount() {
    await this.getDashboardUrl("bankingreport");
    if (document.querySelector("iframe")) {
      document.querySelector("iframe").addEventListener("load", function(e) {
        // console.log(123);
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
            let url =
              json.data.length > 0
                ? json.data[0].url
                : "https://datastudio.google.com/embed/reporting/0220d588-a6f3-48d4-b00d-98f4197c159c";
            this.setState({ dashboardUrl: url });
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

  /*async getPagePermissions() {
        var config = {
            headers: {
                'Authorization': 'Bearer ' + localStorage.tokenId,
                'Content-Type': 'application/json',
                'UserGuid': localStorage.userId,
            },
        };
        await axios.get(getServiceUrl() + 'Users/GetMappedPagesDetail', config)
            .then((json) => {
                if (json.data.filter(x => x.pageName === 'BankingReportManufacturing').length > 0) {
                    this.getDashboardUrl("BankingReportManufacturing");
                }
                if (json.data.filter(x => x.pageName === 'BankingReportNonManufacturing').length > 0) {
                    this.getDashboardUrl("BankingReportNonManufacturing");
                }
            }).catch((err) => {

            });
    }*/
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
    return (
      <div>
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
              <GridItem md={12}>
                <div className="first_class" style={{ textAlign: "right" }}>
                  {/* {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e,'grid_6')}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''} */}
                  <div
                    className="waterMarkHide"
                    style={{
                      background: "#fff",
                      width: "100%",
                      position: "absolute",
                      bottom: 0,
                      height: "25px",
                    }}
                  />
                  {this.state.dashboardUrl && (
                    <iframe
                      loading="eager"
                      //onLoad={() => this.setState({ showExport: true })}
                      title="Banking Report"
                      // src={this.state.dashboardUrl + "/page/p_0of6hner3c?params=%7B%22df98%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + localStorage.getItem("warpUserCompanyId") + "%22%7D"}
                      src={
                        this.state.dashboardUrl +
                        '/page/p_0of6hner3c?params=%7B"df98":"include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580"' +
                        localStorage.getItem("warpUserCompanyId") +
                        '"%7D'
                      }
                      frameborder="0"
                      style={{
                        border: "0px",
                        minHeight: "5500px",
                        minWidth: "1020px",
                        width: "100%",
                        height: "100%",
                      }}
                      allowfullscreen
                    />
                  )}
                  {/* <iframe onLoad={() => this.setState({ showExport: true })} title="Total ESG Score (in %)"  src={this.state.dashboardUrl + "/page/CcN8C?params=%7B%22df98%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "490px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe> */}
                </div>
              </GridItem>

              {/* <GridItem md={12}>
                                <div className="first_class" style={{ textAlign: 'right' }}>
                                    {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e)}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''}
                                    <div className="waterMarkHide" style={{
                                        background: '#fff',
                                        width: '100%',
                                        position: 'absolute',
                                        bottom: 0,
                                        height: '25px'
                                    }}></div>
                                    <iframe onLoad={() => this.setState({ showExport: true })} title="ESG Category - score in %" src={this.state.dashboardUrl + "/page/p_ajnilkst0c?params=%7B%22df101%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "580px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>
                                </div>
                            </GridItem>
                            <GridItem md={12}>
                                <div className="first_class" style={{ textAlign: 'right' }}>
                                    {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e)}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''}
                                    <div className="waterMarkHide" style={{
                                        background: '#fff',
                                        width: '100%',
                                        position: 'absolute',
                                        bottom: 0,
                                        height: '25px'
                                    }}></div>
                                    <iframe onLoad={() => this.setState({ showExport: true })} title="Themewise Scores - score in %"  src={this.state.dashboardUrl + "/page/p_0ttln0xk3c?params=%7B%22df121%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D" } frameborder="0" style={{ border: "0px", minHeight: "580px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>
                                </div>
                            </GridItem>
                            <GridItem md={6}>
                                <div className="first_class" style={{ textAlign: 'right' }}>
                                    {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e)}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''}
                                    <div className="waterMarkHide" style={{
                                        background: '#fff',
                                        width: '100%',
                                        position: 'absolute',
                                        bottom: 0,
                                        height: '25px'
                                    }}></div>
                                    <iframe onLoad={() => this.setState({ showExport: true })} title="Environment-Themewise Score (in %)" src={this.state.dashboardUrl + "/page/p_fhxqmy5l3c?params=%7B%22df48%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "580px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>
                                </div>
                            </GridItem>
                            <GridItem md={6}>
                                <div className="first_class" style={{ textAlign: 'right' }}>
                                    {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e)}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''}
                                    <div className="waterMarkHide" style={{
                                        background: '#fff',
                                        width: '100%',
                                        position: 'absolute',
                                        bottom: 0,
                                        height: '25px'
                                    }}></div>
                                    <iframe onLoad={() => this.setState({ showExport: true })} title="Social-Themewise Score (in %)" src={this.state.dashboardUrl + "/page/p_l3hsv65l3c?params=%7B%22df54%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "580px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>
                                </div>
                            </GridItem>
                            <GridItem md={6}>
                                <div className="first_class" style={{ textAlign: 'right' }}>
                                    {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e)}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''}
                                    <div className="waterMarkHide" style={{
                                        background: '#fff',
                                        width: '100%',
                                        position: 'absolute',
                                        bottom: 0,
                                        height: '25px'
                                    }}></div>
                                    <iframe onLoad={() => this.setState({ showExport: true })} title="Governance-Themewise Score (in %)" src={this.state.dashboardUrl + "/page/p_q0lmm95l3c?params=%7B%22df60%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "580px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>
                                </div>
                            </GridItem> */}

              {/*<GridItem md={12}>*/}
              {/*    <div className="first_class" style={{ textAlign: 'right' }}>*/}
              {/*        {this.state.showExport ? <span className="pdfClick" style={{*/}
              {/*            cursor: 'pointer',*/}
              {/*            border: '1px solid rgb(102, 102, 102)',*/}
              {/*            borderRadius: '3px',*/}
              {/*            padding: '10px',*/}
              {/*            display: 'inline-flex',*/}
              {/*            fontWeight: 600,*/}
              {/*            marginBottom: '5px'*/}
              {/*        }} onClick={(e) => this.individualKPIdonwload(e)}>*/}
              {/*            <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export*/}
              {/*        </span> : ''}*/}
              {/*        <div className="waterMarkHide" style={{*/}
              {/*            background: '#fff',*/}
              {/*            width: '100%',*/}
              {/*            position: 'absolute',*/}
              {/*            bottom: 0,*/}
              {/*            height: '25px'*/}
              {/*        }}></div>*/}
              {/*        <iframe onLoad={() => this.setState({ showExport: true })} title="Fund Level Themewise Score (in %)"  src={this.state.dashboardUrl + "/page/p_k3lz0ark3c?params=%7B%22df116%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "580px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>*/}
              {/*    </div>*/}
              {/*</GridItem>*/}

              {/* <GridItem md={12}>
                                <div className="first_class" style={{ textAlign: 'right' }}>
                                    {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e)}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''}
                                    <div className="waterMarkHide" style={{
                                        background: '#fff',
                                        width: '100%',
                                        position: 'absolute',
                                        bottom: 0,
                                        height: '25px'
                                    }}></div>
                                    <iframe onLoad={() => this.setState({ showExport: true })} title="Themewise Total Score (in %)"  src={this.state.dashboardUrl + "/page/p_c5bvuort0c?params=%7B%22df102%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "580px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>
                                </div>
                            </GridItem>
                            <GridItem md={12}>
                                <div className="first_class" style={{ textAlign: 'right' }}>
                                    {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e)}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''}
                                    <div className="waterMarkHide" style={{
                                        background: '#fff',
                                        width: '100%',
                                        position: 'absolute',
                                        bottom: 0,
                                        height: '25px'
                                    }}></div>
                                    <iframe onLoad={() => this.setState({ showExport: true })} title="Sub-Themewise Total Score (in %)"  src={this.state.dashboardUrl + "/page/p_u33qy00j3c?params=%7B%22df106%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "580px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>
                                </div>
                            </GridItem>
                            <GridItem md={12}>
                                <div className="first_class" style={{ textAlign: 'right' }}>
                                    {this.state.showExport ? <span className="pdfClick" style={{
                                        cursor: 'pointer',
                                        border: '1px solid rgb(102, 102, 102)',
                                        borderRadius: '3px',
                                        padding: '10px',
                                        display: 'inline-flex',
                                        fontWeight: 600,
                                        marginBottom: '5px'
                                    }} onClick={(e) => this.individualKPIdonwload(e)}>
                                        <img alt="" style={{ marginRight: '3px' }} src={Export} /> Export
                                    </span> : ''}
                                    <div className="waterMarkHide" style={{
                                        background: '#fff',
                                        width: '100%',
                                        position: 'absolute',
                                        bottom: 0,
                                        height: '25px'
                                    }}></div>
                                    <iframe onLoad={() => this.setState({ showExport: true })} title="ESG Risk"  src={this.state.dashboardUrl + "/page/p_e3wk4ouu0c?params=%7B%22df112%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580%22" + params + "%22%7D"} frameborder="0" style={{ border: "0px", minHeight: "480px", minWidth: "300px", width: "100%", height: "100%" }} allowfullscreen></iframe>
                                </div>
                            </GridItem> */}
            </GridContainer>
          </div>
        )}
      </div>
    );
  }
}
export default withStyles(styles)(BankingReport);
