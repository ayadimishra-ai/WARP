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

let IsVCUser = false;
let ShowOtherCompanyDetails = false;
let params = "",invitationId="";
class PredealESGReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showExport: false,
      dashboardUrl: [],
      assessorCompanyGuid: ""
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
        console.log({ decodedToken });
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
        DashboardType: "predealesgreportpoc",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        console.log("json",json)
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
                  x.dashboardType === "predealesgreportpoc" &&
                  x.companyType === "Portfolio Company"
              );
            } else if (
              JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
            ) {
              url = json.data.filter(
                (x) =>
                  x.dashboardType === "predealesgreportpoc" &&
                  x.companyType === "VC Company"
              );
            }
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
  };

  getAssessorCompany = async (params) => {
    var config = {
        headers: {
            Authorization: "Bearer " + localStorage.tokenId,
            "Content-Type": "application/json",
            "CPanelCompanyId": params,
        }
    };
    await axios
        .get(getServiceUrl() + "Users/GetAssessorCompany", config)
        .then(json => {
            if (json.status === 200) {
                if (json.data !== undefined) {
                    this.setState({assessorCompanyGuid: json.data[0].assessorCompanyGuid})
                }
            }
        })
}

  render() {
    return (
      <div id="pdf-view">
        <React.Fragment>
          {this.state.loader && this.state.dashboardUrl.length === 0 ? (
            <Spinner />
          ) : (
            <div className=" esg_report_container">
              <div className="esg_report_header">
                <h6>Predeal ESG Report POC</h6>
                {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
                JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
                ShowOtherCompanyDetails === true ? (
                  <div
                    data-html2canvas-ignore="true"
                    className="esg_header_right"
                  >
                  </div>
                ) : (
                  ""
                )}
              </div>
              {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
              JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
              ShowOtherCompanyDetails === true ? (
                <div className="downloadKpis"><span>To download the KPIs as PDF please right click on</span><MoreVert /></div>
              ) : (
                <div className="downloadKpis"><span>To download the KPIs as PDF please right click on</span><MoreVert /></div>
              )}
              {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
              JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
              ShowOtherCompanyDetails === true ? (
                (localStorage.companyGuid === "b480d29d-d722-466c-babf-63b437188f79" || 
                this.state.assessorCompanyGuid === "b480d29d-d722-466c-babf-63b437188f79") ?
                                <div>
                                    <GridContainer className="top_esg_report">
                                    <GridItem md={12}>
                                                <div className="first_class" style={{ textAlign: 'right' }}>
                                                    <div className="waterMarkHide" style={{
                                                        background: '#fff',
                                                        width: '100%',
                                                        position: 'absolute',
                                                        bottom: 0,
                                                        height: '25px'
                                                    }}></div>
                                                    <iframe loading="eager" 
													onLoad={() => this.setState({ showExport: true })} title="Key Data Point" src={"https://datastudio.google.com/embed/reporting/e50cb78f-e45e-4c49-bd16-7210c4bf8ed4/page/p_853v7zut4c?params=%7B%22df67%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + params + "%22%7D"} 
                                                    frameborder="0" 
                                                    className="respHeightPredealESG"
                                                    style={{ border: "0px", minWidth: "300px", width: "100%", height: "100%" }} 
                                                    allowfullscreen></iframe>
                                                </div>
                                    </GridItem>
                                    </GridContainer>
                                </div>
                                :
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
                                    //item.url + params +'%22%7D'
									                  !!invitationId ? 
                                    item.url +
                                    params +
                                    '%22,%22df111%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580' +
                                    invitationId + 
                                    '%22%7D' : 
                                    item.url +
                                    params +
                                    '%22%7D'
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
                                    //item.url +
                                    //localStorage.getItem("warpUserCompanyId") +
                                    //'%22%7D'
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
          )}
        </React.Fragment>
      </div>
    );
  }
}
export default PredealESGReport;
