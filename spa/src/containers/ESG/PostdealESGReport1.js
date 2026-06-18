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

let IsVCUser = false;
let ShowOtherCompanyDetails = false;
let params = "";
class PostdealESGReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      showExport: false,
      dashboardUrl: null,
    };
  }

  componentDidMount = async () => {
    if (document.querySelector("iframe")) {
      document.querySelector("iframe").addEventListener("load", function(e) {
        //console.log(123);
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
        /*console.log({ decodedToken });*/
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
        /*console.log({ decodedToken });*/
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
        /*console.log({ json });*/
        localStorage.setItem("warpToken", json.data);
        const decodedToken = jwt.decode(json.data);
        /*console.log({ decodedToken });*/
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

  async getDashboardUrl(companyGuid) {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: companyGuid,
        DashboardType: "postdealesgreport",
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
            url =
              json.data.length > 0
                ? json.data.filter(
                    (x) =>
                      x.dashboardType === "postdealesgreport" &&
                      x.companyType === "Portfolio Company"
                  )[0].url
                : "https://datastudio.google.com/embed/reporting/7c74fb23-31b6-4310-b549-8309859a5ca4/";
          } else if (
            JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST
          ) {
            url =
              json.data.length > 0
                ? json.data.filter(
                    (x) =>
                      x.dashboardType === "postdealesgreport" &&
                      x.companyType === "VC Company"
                  )[0].url
                : "https://datastudio.google.com/embed/reporting/cded1598-369f-4fbd-9dca-21ba6f643b21/";
          }
          this.setState({ dashboardUrl: url });
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
    // let breadCrumb = BreadCrumb([
    //   { pageName: "Dashboard", url: "/Home" },
    //   { pageName: "Postdeal ESG Report", url: "/#" },
    // ]);

    return (
      <div id="pdf-view">
        <React.Fragment>
          {/* {!this.state.showExport ? <Spinner /> : null} */}
          {/* <div className='breadtitle_wrap'>
            {breadCrumb}
        </div> */}
          {this.state.loader ? (
            <Spinner />
          ) : (
            <React.Fragment>
              <div
                className=" esg_report_container"
                style={
                  !this.state.showExport
                    ? { display: "block" }
                    : { display: "none" }
                }
              >
                <Spinner />
              </div>
              <div
                className=" esg_report_container"
                style={
                  !this.state.showExport
                    ? { display: "none" }
                    : { display: "block" }
                }
              >
                <div className="esg_report_header">
                  <h6>Postdeal ESG Report</h6>
                  {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
                  JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
                  ShowOtherCompanyDetails === true ? (
                    <div
                      data-html2canvas-ignore="true"
                      className="esg_header_right"
                    >
                      {/* <span>request survey</span> */}
                      <span />
                      <span onClick={() => this.pdfDownload()}>
                        <img
                          alt=""
                          style={{ marginRight: "3px" }}
                          src={Export}
                        />{" "}
                        Export All
                      </span>
                    </div>
                  ) : (
                    ""
                  )}
                </div>
                {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
                JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
                ShowOtherCompanyDetails === true ? (
                  ""
                ) : (
                  <div className="downloadKpis">
                    <span>
                      To download the KPIs as PDF please right click on
                    </span>
                    <MoreVert />
                  </div>
                )}
                {JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
                JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
                ShowOtherCompanyDetails === true ? (
                  <div>
                    {params !== "" ? (
                      <GridContainer className="top_esg_report">
                        <GridItem md={6}>
                          <div
                            className="first_class"
                            style={{ textAlign: "right" }}
                          >
                            {this.state.showExport ? (
                              <span
                                className="pdfClick"
                                style={{
                                  cursor: "pointer",
                                  border: "1px solid rgb(102, 102, 102)",
                                  borderRadius: "3px",
                                  padding: "10px",
                                  display: "inline-flex",
                                  fontWeight: 600,
                                  marginBottom: "5px",
                                }}
                                onClick={(e) =>
                                  this.individualKPIdonwload(e, "grid_6")
                                }
                              >
                                <img
                                  alt=""
                                  style={{ marginRight: "3px" }}
                                  src={Export}
                                />
                                Export
                              </span>
                            ) : (
                              ""
                            )}
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
                                onLoad={() =>
                                  this.setState({ showExport: true })
                                }
                                title="."
                                src={
                                  this.state.dashboardUrl +
                                  "page/CcN8C?params=%7B%22df108%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                                  params +
                                  "%22%7D"
                                }
                                frameborder="0"
                                style={{
                                  border: "0px",
                                  minHeight: "370px",
                                  minWidth: "300px",
                                  width: "100%",
                                  height: "100%",
                                }}
                                allowfullscreen
                              />
                            )}
                          </div>
                        </GridItem>
                        <GridItem md={6}>
                          <div
                            className="first_class"
                            style={{ textAlign: "right" }}
                          >
                            {this.state.showExport ? (
                              <span
                                className="pdfClick"
                                style={{
                                  cursor: "pointer",
                                  border: "1px solid rgb(102, 102, 102)",
                                  borderRadius: "3px",
                                  padding: "10px",
                                  display: "inline-flex",
                                  fontWeight: 600,
                                  marginBottom: "5px",
                                }}
                                onClick={(e) =>
                                  this.individualKPIdonwload(e, "grid_6")
                                }
                              >
                                <img
                                  alt=""
                                  style={{ marginRight: "3px" }}
                                  src={Export}
                                />
                                Export
                              </span>
                            ) : (
                              ""
                            )}
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
                                onLoad={() =>
                                  this.setState({ showExport: true })
                                }
                                title="."
                                src={
                                  this.state.dashboardUrl +
                                  "page/p_lg8vp7673c?params=%7B%22df163%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                                  params +
                                  "%22%7D"
                                }
                                frameborder="0"
                                style={{
                                  border: "0px",
                                  minHeight: "370px",
                                  minWidth: "300px",
                                  width: "100%",
                                  height: "100%",
                                }}
                                allowfullscreen
                              />
                            )}
                          </div>
                        </GridItem>
                        <GridItem md={12}>
                          <div
                            className="first_class"
                            style={{ textAlign: "right" }}
                          >
                            {this.state.showExport ? (
                              <span
                                className="pdfClick"
                                style={{
                                  cursor: "pointer",
                                  border: "1px solid rgb(102, 102, 102)",
                                  borderRadius: "3px",
                                  padding: "10px",
                                  display: "inline-flex",
                                  fontWeight: 600,
                                  marginBottom: "5px",
                                }}
                                onClick={(e) =>
                                  this.individualKPIdonwload(e, "grid_6")
                                }
                              >
                                <img
                                  alt=""
                                  style={{ marginRight: "3px" }}
                                  src={Export}
                                />
                                Export
                              </span>
                            ) : (
                              ""
                            )}
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
                                onLoad={() =>
                                  this.setState({ showExport: true })
                                }
                                title="."
                                src={
                                  this.state.dashboardUrl +
                                  "page/p_oxxb0fqe4c?params=%7B%22df181%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                                  params +
                                  "%22%7D"
                                }
                                frameborder="0"
                                style={{
                                  border: "0px",
                                  minHeight: "620px",
                                  minWidth: "1020px",
                                  width: "100%",
                                  height: "100%",
                                }}
                                allowfullscreen
                              />
                            )}
                          </div>
                        </GridItem>
                        <GridItem md={12}>
                          <div
                            className="first_class"
                            style={{ textAlign: "right" }}
                          >
                            {this.state.showExport ? (
                              <span
                                className="pdfClick"
                                style={{
                                  cursor: "pointer",
                                  border: "1px solid rgb(102, 102, 102)",
                                  borderRadius: "3px",
                                  padding: "10px",
                                  display: "inline-flex",
                                  fontWeight: 600,
                                  marginBottom: "5px",
                                }}
                                onClick={(e) =>
                                  this.individualKPIdonwload(e, "grid_6")
                                }
                              >
                                <img
                                  alt=""
                                  style={{ marginRight: "3px" }}
                                  src={Export}
                                />
                                Export
                              </span>
                            ) : (
                              ""
                            )}
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
                            {this.state.dashboardUrl &&
                            <iframe
                              onLoad={() => this.setState({ showExport: true })}
                              title="."
                              src={
                                this.state.dashboardUrl+"page/p_5xewjghn1c?params=%7B%22df168%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + params +"%22%7D"
                              }
                              frameborder="0"
                              style={{
                                border: "0px",
                                minHeight: "650px",
                                minWidth: "1020px",
                                width: "100%",
                                height: "100%",
                              }}
                              allowfullscreen
                            />}
                          </div>
                        </GridItem>
                      </GridContainer>
                    ) : (
                      ""
                    )}
                  </div>
                ) : JSON.parse(localStorage.userType) ===
                  RoleCodes.VENTURECAPITALIST ? (
                  <GridContainer justify="center" className="top_esg_report">
                    <GridItem md={12}>
                      <div
                        className="first_class"
                        style={{ textAlign: "right" }}
                      >
                        {/* {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) =>
                              this.individualKPIdonwload(e, "grid_6")
                            }
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )} */}
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
                            onLoad={() => this.setState({ showExport: true })}
                            title="Overall Fund Performance"
                            className="postdealDashboard"
                            //src={this.state.dashboardUrl + "page/p_nvi0f2mr3c?params=%7B%22df61%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId") + "%22%7D"}
                            // src={this.state.dashboardUrl + "page/p_qwbrxw2n3c?params=%7B%22df305%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + "2dbe8721-58cb-46f4-bde1-7822a91b5643" + "%22%7D"}
                            src={
                              this.state.dashboardUrl +
                              'page/p_qwbrxw2n3c?params=%7B"df313":"include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580' +
                              localStorage.getItem("warpUserCompanyId") +
                              '"%7D'
                            }
                            frameborder="0"
                            style={{
                              border: "0px",
                              minWidth: "1020px",
                              width: "100%",
                              height: "100%",
                            }}
                            allowfullscreen
                          />
                        )}
                        {/* <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Sector wise - Total ESG Score (score in %)"
                          src={
                            //   "https://lookerstudio.google.com/embed/reporting/fc25b2c3-60ac-4c83-969c-a9682af0f317/page/CcN8C?params=%7B%22df61%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%" + localStorage.getItem("warpUserCompanyId")
                            //   "https://lookerstudio.google.com/embed/reporting/fc25b2c3-60ac-4c83-969c-a9682af0f317/page/CcN8C?params=%7B%22df61%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId")
                            this.state.dashboardUrl+"page/CcN8C?params=%7B%22df61%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId") + "%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "600px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        /> */}
                      </div>
                    </GridItem>

                    {/*<GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Top 5 portfolio companies : Sector wise (score in %)"
                          id="themwiseScore"
                          src={
                            this.state.dashboardUrl+"page/p_e3wk4ouu0c?params=%7B%22df64%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId") + "%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "535px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Bottom 5 portfolio companies : Sector wise (score in %)"
                          id="themwiseScore"
                          src={
                            //   "https://lookerstudio.google.com/embed/reporting/fc25b2c3-60ac-4c83-969c-a9682af0f317/page/p_a4eb6eku0c?params=%7B%22df63%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                            this.state.dashboardUrl+"page/p_6dhwx4i10c?params=%7B%22df65%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                            localStorage.getItem("warpUserCompanyId") + "%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "535px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Top 5 portfolio companies (score in %)"
                          id="themwiseScore"
                          src={
                            this.state.dashboardUrl+"page/p_c5bvuort0c?params=%7B%22df62%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                            localStorage.getItem("warpUserCompanyId") + "%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "535px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Bottom 5 portfolio companies (score in %)"
                          id="themwiseScore"
                          src={
                            this.state.dashboardUrl+"page/p_a4eb6eku0c?params=%7B%22df63%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                            localStorage.getItem("warpUserCompanyId") + "%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "535px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Top 5 portfolio companies : Category wise (score in %)"
                          id="themwiseScore"
                          src={
                            this.state.dashboardUrl+"page/p_gsbtcfp20c?params=%7B%22df68%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId") + "%22%7D"
                            // "https://lookerstudio.google.com/embed/reporting/fc25b2c3-60ac-4c83-969c-a9682af0f317/page/p_gsbtcfp20c?params=%7B%22df59%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" +
                            // localStorage.getItem("warpUserCompanyId") +"%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "515px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Bottom 5 portfolio companies : Category wise (score in %)"
                          id="themwiseScore"
                          src={
                            this.state.dashboardUrl+"page/p_xo46txc30c?params=%7B%22df59%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId") + "%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "535px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Top 5 portfolio companies : Theme wise (score in %)"
                          id="themwiseScore"
                          src={
                            this.state.dashboardUrl+"page/p_a5yq1z810c?params=%7B%22df66%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId") + "%22%7D"}
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "518px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Bottom 5 portfolio companies : Theme wise (score in %)"
                          id="themwiseScore"
                          src={
                            this.state.dashboardUrl+"page/p_anz0wto20c?params=%7B%22df67%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId") + "%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "535px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>
                    <GridItem md={12}>
                      <div className="first_class" style={{ textAlign: "right" }}>
                        {this.state.showExport ? (
                          <span
                            className="pdfClick"
                            style={{
                              cursor: "pointer",
                              border: "1px solid rgb(102, 102, 102)",
                              borderRadius: "3px",
                              padding: "10px",
                              display: "inline-flex",
                              fontWeight: 600,
                              marginBottom: "5px",
                            }}
                            onClick={(e) => this.individualKPIdonwload(e)}
                          >
                            <img
                              alt=""
                              style={{ marginRight: "3px" }}
                              src={Export}
                            />
                            Export
                          </span>
                        ) : (
                          ""
                        )}
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
                        <iframe
                          onLoad={() => this.setState({ showExport: true })}
                          title="Key Data Points"
                          id="themwiseScore"
                          src={
                            this.state.dashboardUrl+"page/p_8cla023y2c?params=%7B%22df65%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%25802dbe8721-58cb-46f4-bde1-7822a91b5643%22,%22df72%22:%22include%25EE%2580%25800%25EE%2580%2580IN%25EE%2580%2580" + localStorage.getItem("warpUserCompanyId") + "%22%7D"
                          }
                          frameborder="0"
                          style={{
                            border: "0px",
                            minHeight: "610px",
                            minWidth: "300px",
                            width: "100%",
                            height: "100%",
                          }}
                          allowfullscreen
                        />
                      </div>
                    </GridItem>*/}
                  </GridContainer>
                ) : (
                  ""
                )}
              </div>
            </React.Fragment>
          )}
        </React.Fragment>
      </div>
    );
  }
}
export default PostdealESGReport;
