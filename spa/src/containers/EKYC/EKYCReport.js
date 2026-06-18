
import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { getNextJSServiceUrl, getUserPermision } from "../../config";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import * as RoleCodes from "../../rolecodes";
import jwt from "jsonwebtoken";
import { models } from "powerbi-client";
import { ChevronLeft, ChevronRight } from "@material-ui/icons";
import { Tab, Tabs } from "react-tabs-scrollable";
import { BreadCrumb } from "../../utility";
import PowerBiReportIframe from "../Dashboard/PowerBiReportIframe";
let params = "";
let ShowOtherCompanyDetails = false;
class EKYCReport extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardUrls: [],
      loader: true,
      dashboardiFrameHeight: "",
      isBorder: false,
      isPowerBiReport: false,
    };
  }

  componentDidMount = async () => {
    this.getDashboardUrl();

    //params = this.getUrlParameter("companyid");
    //console.log("params", params)
    //if (params !== undefined) {
    //    if (params !== false) {
    //        if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
    //            ShowOtherCompanyDetails = true;
    //            await this.getDashboardUrl(params);
    //        } else {
    //            ShowOtherCompanyDetails = false;
    //            await this.getDashboardUrl(localStorage.warpUserCompanyId);
    //        }
    //    } else {
    //        ShowOtherCompanyDetails = false;
    //        params = localStorage.warpUserCompanyId;
    //        await this.getDashboardUrl(localStorage.warpUserCompanyId);
    //    }
    //} else {
    //    ShowOtherCompanyDetails = false;
    //    params = localStorage.warpUserCompanyId;
    //    await this.getDashboardUrl(localStorage.warpUserCompanyId);
    //}

    if (JSON.parse(localStorage.userType) === RoleCodes.VENTURECAPITALIST) {
      if (
        localStorage.warpToken !== "null" ||
        localStorage.warpToken !== "null"
      ) {
        const decodedToken = jwt.decode(localStorage.warpToken);

        const warpUserCompanyId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-company-id"];

        // localStorage.setItem("warpUserCompanyId", warpUserCompanyId);
        params = warpUserCompanyId;
      }
    } else {
      params = "2dbe8721-58cb-46f4-bde1-7822a91b5643";
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

  async getDashboardUrl() {
    var config = {
      headers: {
        Authorization: "Bearer " + localStorage.tokenId,
        "Content-Type": "application/json",
        CompanyGuid: localStorage.companyGuid,
        DashboardType: "EKYCReport",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        if (json.status === 200) {
          if (json.data !== undefined) {
            //this.setState({ dashboardUrls: json.data[0].url, loader: false });

            if (json.data !== undefined) {
              let url = "";
              if (
                JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
                JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
                ShowOtherCompanyDetails === true
              ) {
                url = json.data.filter(
                  (x) =>
                    x.dashboardType === "ekycreport" &&
                    x.companyType === "Portfolio Company"
                );
              } else if (
                JSON.parse(localStorage.userType) ===
                RoleCodes.VENTURECAPITALIST
              ) {
                url = json.data.filter(
                  (x) =>
                    x.dashboardType === "EKYCReport" &&
                    x.companyType === "VC Company"
                );
              }
              this.setState({
                dashboardUrls: url,
                loader: false,
                isBorder: json.data[0].isBorder,
                isPowerBiReport: json.data[0].isPowerBiReport,
                dashboardiFrameHeight: json.data[0].dashboardHeight,
              });
            }
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

  render() {
    let permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions.length === 0) {
      return <Redirect to="/home" />;
    } else if (getUserPermision(permissions, PageKeys.ekycreport) === null) {
      return <Redirect to="/home" />;
    }
    let breadCrumb = BreadCrumb([
      { pageName: "Dashboard", url: "/Home" },
      { pageName: "EKYC Report", url: "/#" },
    ]);
    return (
      <React.Fragment>
        <div className="breadtitle_wrap">
          {breadCrumb}
          <div className="page_top_title">
            <div className="page_heading">EKYC Report</div>
          </div>
        </div>
        {this.state.loader ? (
          <Spinner />
        ) : (
          <div className="ekyc-report-dashboard">
            {this.state.dashboardUrls.length > 0 &&
            this.state.dashboardUrls !== undefined
              ? this.state.dashboardUrls.map((item) => {
                  return (
                    <PowerBiReportIframe
                      staticLink
                      //  embedConfig={this.state.dashboardUrls}
                      embedConfig={item.url + params + "%22%7D"}
                      cssClassName="ekyc_new"
                      title="EKYC Report"
                      iframeHeight={this.state.dashboardiFrameHeight}
                      isPowerBiReport={this.state.isPowerBiReport}
                      isBorder={this.state.isBorder}
                      lsTabs
                    />
                  );
                })
              : ""}
          </div>
        )}
      </React.Fragment>
    );
  }
}
export default EKYCReport;