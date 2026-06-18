import MoreVert from "@material-ui/icons/MoreVert";
import axios from "axios";
import jwt from "jsonwebtoken";
import React, { Component } from "react";
import Export from "../../assets/img/export.png";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { getNextJSServiceUrl, getServiceUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb } from "../../utility";
// import { Paper, Tab, Tabs } from "@material-ui/core";
import { withStyles } from "@material-ui/styles";
import { Tabs, Tab } from "react-tabs-scrollable";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";
import PowerBiReportIframe from "./PowerBiReportIframe";

let IsVCUser = false;
let ShowOtherCompanyDetails = false;
let params = "",
  invitationId = "";

// const styles = theme => ({
//     root: {
//         flexGrow: 1,
//         // backgroundColor: theme.palette.background.paper,
//     },
//     tabsRoot: {
//         borderBottom: '1px solid #e8e8e8',
//     },
//     tabsWidth: {
//         maxWidth: '100%',
//         textTransform: 'capitalize',
//     },
//     tabsIndicator: {
//         backgroundColor: '#72d0c6',
//     },
//     tabRoot: {
//         textTransform: 'capitalize',
//         minWidth: 72,
//         fontFamily: [
//             '-apple-system',
//             'BlinkMacSystemFont',
//             '"Segoe UI"',
//             'Roboto',
//             '"Helvetica Neue"',
//             'Arial',
//             'sans-serif',
//             '"Apple Color Emoji"',
//             '"Segoe UI Emoji"',
//             '"Segoe UI Symbol"',
//         ].join(','),
//         '&:hover': {
//             color: '#40a9ff',
//             opacity: 1,
//         },
//         '&$tabSelected': {
//             color: '#1890ff',
//         },
//         '&:focus': {
//             color: '#40a9ff',
//         },
//     },
//     scrollArrow: {
//         '&:empty': {
//             display: 'none'
//         }
//     },
//     tabSelected: {},
// });

class ChirataePowerBI extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showExport: false,
      dashboardUrl: [],
      value: 0,
      dashboardiFrameHeight: "",
      isBorder: false,
      isPowerBiReport: false,
    };
  }

  componentDidMount = async () => {
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
        console.log({ decodedToken });
        const warpUserCompanyId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];
        localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
      }
    }
    params = this.getUrlParameter("companyid");
    invitationId = this.getUrlParameter("formInvitationId");
    if (params !== undefined) {
      if (params !== false) {
        if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
          ShowOtherCompanyDetails = true;
          await this.getDashboardUrl(params);
          //await this.getDashboardUrl(localStorage.companyGuid);
        } else {
          ShowOtherCompanyDetails = false;
          await this.getDashboardUrl(localStorage.warpUserCompanyId);
        }
      } else {
        ShowOtherCompanyDetails = false;
        await this.getDashboardUrl(localStorage.warpUserCompanyId);
        params = localStorage.warpUserCompanyId;
      }
    } else {
      ShowOtherCompanyDetails = false;
      params = localStorage.warpUserCompanyId;
      await this.getDashboardUrl(localStorage.warpUserCompanyId);
    }

    setTimeout(() => {
      this.setState({ loader: false });
    }, 6800);
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
        console.log({ decodedToken });
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

  getDashboardUrl = async (companyGuid) => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: companyGuid,
        DashboardType: "chirataepowerbI",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        console.log("json", json);
        if (json.status === 200) {
          if (json.data !== undefined) {
            let url = "";
            if (
              JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
              JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
              ShowOtherCompanyDetails === true
            ) {
              url = json.data.filter(
                (x) =>
                  x.dashboardType === "chirataepowerbI" &&
                  x.companyType === "Portfolio Company"
              );
            } else if (
              JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
            ) {
              url = json.data.filter(
                (x) =>
                  x.dashboardType === "chirataepowerbI" &&
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
        }
      })
      .catch((err) =>
        err.response !== undefined
          ? err.response.status === 401
            ? (window.location.pathname = "/logout")
            : ""
          : ""
      );
  };

  handleChange = (event, value) => {
    this.setState({ value });
  };

  render() {
    const { classes } = this.props;
    const { value } = this.state;
    return (
      <div id="pdf-view">
        <React.Fragment>
          {this.state.loader && this.state.dashboardUrl.length === 0 ? (
            <Spinner />
          ) : (
            <div className=" esg_report_container">
              <div className="esg_report_header">
                <h6>ESG Investee Dashboard</h6>
              </div>
              {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
              JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
              ShowOtherCompanyDetails === true ? (
                <div>
                  {params !== "" ? (
                    <GridContainer className="top_esg_report">
                      {this.state.dashboardUrl.length > 0
                        ? this.state.dashboardUrl.map((item) => {
                            return (
                              <GridItem md={item.columnSize}>
                                <div
                                  className="first_class"
                                  style={{ textAlign: "right" }}
                                >
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
                                      onLoad={() =>
                                        this.setState({ showExport: true })
                                      }
                                      height={500}
                                      title="Overall Fund Performance"
                                      src={!!invitationId ? item.url : item.url}
                                      frameBorder="0"
                                      className="PCDashboardCSS"
                                      // style={JSON.parse(item.iframeStyle)}
                                      allowFullscreen
                                    />
                                  )}
                                </div>
                              </GridItem>
                            );
                          })
                        : ""}
                    </GridContainer>
                  ) : (
                    ""
                  )}
                </div>
              ) : JSON.parse(localStorage.userType) ===
                RoleCodes.VENTURECAPITALIST ? (
                <GridContainer justify="center" className="top_esg_report">
                  {this.state.dashboardUrl.length > 0
                    ? this.state.dashboardUrl.map((item) => {
                        return (
                          <GridItem md={item.columnSize}>
                            {/* <div
                                                        className="first_class"
                                                        style={{ textAlign: "right" }}
                                                    >
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
                                                                onLoad={() =>
                                                                    this.setState({ showExport: true })
                                                                }
                                                                title="Overall Fund Performance"
                                                                height={830}
                                                                width={'100%'}
                                                                src={
                                                                    !!invitationId ?
                                                                        item.url :
                                                                        item.url
                                                                }
                                                                frameBorder="0"
                                                                //className="chirataeESGInvesteeCSS"
                                                                // style={JSON.parse(item.iframeStyle)}
                                                                allowFullscreen
                                                            />
                                                        )}
                                                    </div> */}
                            {/* <Paper style={{ marginBottom: 10 }} square> */}
                            <Tabs
                              tabsContainerClassName="guidelines_tabs"
                              leftBtnIcon={<ChevronLeft />}
                              rightBtnIcon={<ChevronRight />}
                              activeTab={value}
                              onTabClick={this.handleChange}
                            >
                              <Tab>Environmental Impact</Tab>
                              <Tab>Gender Diversity</Tab>
                              <Tab>Governance</Tab>
                              <Tab>Overall ESG Performance</Tab>
                              <Tab>Performance of Investee Companies</Tab>
                              <Tab>IFC Standards & Policies in Place</Tab>
                              <Tab>EdTech</Tab>
                              <Tab>HealthTech</Tab>
                            </Tabs>
                            {/* </Paper> */}
                            <div
                              className="waterMarkHide"
                              style={{
                                height: "67px",
                              }}
                            />
                            {value === 0 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={860}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiNWExYTk1ZGUtOGNhZC00OTQ3LWI4NTAtMDNmYzU1NTRmNmMxIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ReportSection"
                                />
                              </div>
                            )}
                            {value === 1 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={860}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiNWExYTk1ZGUtOGNhZC00OTQ3LWI4NTAtMDNmYzU1NTRmNmMxIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ReportSectioncc2e9bbbe1d8d98e0a0c"
                                />
                              </div>
                            )}
                            {value === 2 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={860}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiNWExYTk1ZGUtOGNhZC00OTQ3LWI4NTAtMDNmYzU1NTRmNmMxIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ReportSection3f07c06eb03c249a6aac"
                                />
                              </div>
                            )}
                            {value === 3 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={860}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiNWExYTk1ZGUtOGNhZC00OTQ3LWI4NTAtMDNmYzU1NTRmNmMxIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ReportSection5d53b9d00b70e139141e"
                                />
                              </div>
                            )}
                            {value === 4 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={860}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiNWExYTk1ZGUtOGNhZC00OTQ3LWI4NTAtMDNmYzU1NTRmNmMxIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ReportSection0f43dcfa901b87ab64a1"
                                />
                              </div>
                            )}
                            {value === 5 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={860}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiNWExYTk1ZGUtOGNhZC00OTQ3LWI4NTAtMDNmYzU1NTRmNmMxIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ReportSection6ccd270077b741753170"
                                />
                              </div>
                            )}
                            {value === 6 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={860}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiNWExYTk1ZGUtOGNhZC00OTQ3LWI4NTAtMDNmYzU1NTRmNmMxIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=1995b4386b3c5cda8500"
                                />
                              </div>
                            )}
                            {value === 7 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={860}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiNWExYTk1ZGUtOGNhZC00OTQ3LWI4NTAtMDNmYzU1NTRmNmMxIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ReportSection6324e995640bc29e70be"
                                />
                              </div>
                            )}
                          </GridItem>
                        );
                      })
                    : ""}
                </GridContainer>
              ) : (
                ""
              )}
            </div>
          )}
        </React.Fragment>
      </div>
    );
  }
}
export default ChirataePowerBI;
