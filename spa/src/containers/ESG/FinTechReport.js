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
class FinTechReport extends Component {
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
        DashboardType: "FinTech",
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
                  x.dashboardType === "FinTech" &&
                  x.companyType === "Portfolio Company"
              );
            } else if (
              JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
            ) {
              url = json.data.filter(
                (x) =>
                  x.dashboardType === "FinTech" &&
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
    const { value } = this.state;
    return (
      <div id="pdf-view">
        <React.Fragment>
          {this.state.loader && this.state.dashboardUrl.length === 0 ? (
            <Spinner />
          ) : (
            <div className=" esg_report_container">
              <div className="esg_report_header">
                {/* <h6>FinTech Report</h6> */}
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
                              <Tab>Global Sales</Tab>
                              <Tab>India Sales</Tab>
                              <Tab>
                                Loan Sales - Critical Factors & Vital Rates
                              </Tab>
                              <Tab>MSME Client Organization Details</Tab>
                              <Tab>MSME Loan Sales</Tab>
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
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYWU2YWJmNzQtMzdmNS00NmE5LWExNGEtNmEwZTE0YjJmMGY3IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=f6242175e60cd0bb95a0"
                                />
                              </div>
                            )}
                            {value === 1 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={1560}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYWU2YWJmNzQtMzdmNS00NmE5LWExNGEtNmEwZTE0YjJmMGY3IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=08bc70c27b39a3255049"
                                />
                              </div>
                            )}
                            {value === 2 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={1160}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYWU2YWJmNzQtMzdmNS00NmE5LWExNGEtNmEwZTE0YjJmMGY3IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=139a753007a708d379a5"
                                />
                              </div>
                            )}
                            {value === 3 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={1460}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYWU2YWJmNzQtMzdmNS00NmE5LWExNGEtNmEwZTE0YjJmMGY3IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=d66f64e4660c54a732b6"
                                />
                              </div>
                            )}
                            {value === 4 && (
                              <div>
                                <iframe
                                  frameBorder={0}
                                  width={"100%"}
                                  height={1160}
                                  src="https://app.powerbi.com/view?r=eyJrIjoiYWU2YWJmNzQtMzdmNS00NmE5LWExNGEtNmEwZTE0YjJmMGY3IiwidCI6IjY0MGQ3N2VlLTRiNDEtNDc5Mi05YzQ0LTA2OTQ1MDAxOTE5OCJ9&pageName=d4d865ef90c96e0ce5bd"
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
export default FinTechReport;
