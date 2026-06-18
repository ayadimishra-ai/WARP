import MoreVert from "@material-ui/icons/MoreVert";
import axios from "axios";
import jwt from "jsonwebtoken";
import React, { Component } from "react";
import GridContainer from "../../components/Material/Grid/GridContainer";
import GridItem from "../../components/Material/Grid/GridItem";
import { getNextJSServiceUrl, getServiceUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import { Tabs, Tab } from "react-tabs-scrollable";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import ChevronRight from "@material-ui/icons/ChevronRight";

let ShowOtherCompanyDetails = false;
let params = "",
  invitationId = "";
class AgTechReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showExport: false,
      dashboardUrl: [],
      value: 0,
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

  getDashboardUrl = async (companyGuid) => {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: companyGuid,
        DashboardType: "AgTech",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
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
                  x.dashboardType === "AgTech" &&
                  x.companyType === "Portfolio Company"
              );
            } else if (
              JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
            ) {
              url = json.data.filter(
                (x) =>
                  x.dashboardType === "AgTech" && x.companyType === "VC Company"
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
    const { value } = this.state;
    return (
      <div id="pdf-view">
        <React.Fragment>
          {this.state.loader && this.state.dashboardUrl.length === 0 ? (
            <Spinner />
          ) : (
            <div className=" esg_report_container">
              <div className="esg_report_header">
                {/* <h6>AgTech Report</h6> */}
                {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
                JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
                ShowOtherCompanyDetails === true ? (
                  <div
                    data-html2canvas-ignore="true"
                    className="esg_header_right"
                  />
                ) : (
                  ""
                )}
              </div>
              <div className="downloadKpis">
                {/* <span>To download the KPIs as PDF please right click on</span><MoreVert /> */}
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
                                      title="Overall Fund Performance"
                                      src={
                                        !!invitationId
                                          ? item.url +
                                            params +
                                            "%22,%22df111%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                                            invitationId +
                                            "%22%7D"
                                          : item.url + params + "%22%7D"
                                      }
                                      frameBorder="0"
                                      className="respHeightesgReport"
                                      style={JSON.parse(item.iframeStyle)}
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
                            {/*<div
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
                                  src={
									                  !!invitationId ? 
                                    item.url +
                                    localStorage.getItem("warpUserCompanyId") +
                                    '%22,%22df111%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580' +
                                    invitationId + 
                                    '%22%7D' : 
                                    item.url +
                                    localStorage.getItem("warpUserCompanyId") +
                                    '%22%7D'
                                  }
                                  frameBorder="0"
                                  className="respHeightesgReport"
                                  style={JSON.parse(item.iframeStyle)}
                                  allowFullscreen
                                />
                              )}
                            </div>*/}
                            <Tabs
                              tabsContainerClassName="guidelines_tabs"
                              leftBtnIcon={<ChevronLeft />}
                              rightBtnIcon={<ChevronRight />}
                              activeTab={value}
                              onTabClick={this.handleChange}
                            >
                              <Tab>Sales</Tab>
                              <Tab>Clients</Tab>
                              <Tab>Overall Income Changes (%)</Tab>
                              <Tab>Smallholder's Income Changes (%)</Tab>
                              <Tab>Smallholder Income Shift</Tab>
                              <Tab>Land in Control & Free Advisory Sales</Tab>
                            </Tabs>
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
                                  height={1060}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYjc1MDNiMDgtNWM4MS00YTVlLWFkOWMtZmY5MWMzOWQ2OTFkIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=5aabea26072d470c1520"
                                />
                              </div>
                            )}
                            {value === 1 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={960}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYjc1MDNiMDgtNWM4MS00YTVlLWFkOWMtZmY5MWMzOWQ2OTFkIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=7de3c23a1e16e7b14c07"
                                />
                              </div>
                            )}
                            {value === 2 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={1060}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYjc1MDNiMDgtNWM4MS00YTVlLWFkOWMtZmY5MWMzOWQ2OTFkIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=6b76174aee2559aa6050"
                                />
                              </div>
                            )}
                            {value === 3 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={1060}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYjc1MDNiMDgtNWM4MS00YTVlLWFkOWMtZmY5MWMzOWQ2OTFkIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=ba33145aecd878652986"
                                />
                              </div>
                            )}
                            {value === 4 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={1060}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYjc1MDNiMDgtNWM4MS00YTVlLWFkOWMtZmY5MWMzOWQ2OTFkIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=bdff48a1834d1039d43e"
                                />
                              </div>
                            )}
                            {value === 5 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={1160}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYjc1MDNiMDgtNWM4MS00YTVlLWFkOWMtZmY5MWMzOWQ2OTFkIiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=f6fef97a3cac5e7aa775"
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
export default AgTechReport;
