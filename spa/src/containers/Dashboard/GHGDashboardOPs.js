import React, { Component } from "react";
import * as PageKeys from "../../pagekeys";
import { Redirect } from "react-router-dom";
import { getNextJSServiceUrl, getUserPermision, GetGHGEstimationUrl } from "../../config";
import * as RoleCodes from "../../rolecodes";
import axios from "axios";
import { getServiceUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import { decodeOpAccessToken } from "../../utility";

let messageData = "";
const GHGEstimate_Link = GetGHGEstimationUrl();
let ShowOtherCompanyDetails = false;
class GHGDashboardOPs extends Component {
  constructor(props) {
    super(props);
    this.state = {
      dashboardUrls: [],
      loader: true,
      iframeHeight: 0,
    };
  }

  componentDidMount = async () => {
    this.getDashboardUrl();

    window.addEventListener("message", (event) => {
      if (event.data === "up") {
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
      if (event.data === "loading") {
        this.setState({ loader: true });
      } else if (event.data === "noLoading") {
        this.setState({ loader: false });
      }
    });

    const decodedToken = decodeOpAccessToken(localStorage.opsToken);
    if (decodedToken !== null) {
      const opsUserCompanyId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", opsUserCompanyId);
    }
    window.onload = () => {
      let iFrame = document.getElementById("iframeDasboard");
      if (!!iFrame) {
        const CurrentparamsRedirect = new URLSearchParams(
          window.location.search
        );
        iFrame.contentWindow.postMessage(
          JSON.stringify({
            type: "getparams",
            params: CurrentparamsRedirect,
          }),
          GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"
        );
      }
    };
    this.newHandle();
  };
  newHandle = () => {
    window.addEventListener("message", (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = "";
          messageData = JSON.parse(event.data);
          console.log("messagedata=", messageData);
          const type = messageData.type;
          switch (type) {
            case "sendParamstoParent":
              const params = new URLSearchParams(window.location.search);
              if (!!messageData.data.params[0].region) {
                params.set("region", messageData.data.params[0].region);
              } else {
                params.delete("region");
              }
              if (!!messageData.data.params[0].FY) {
                params.set("FY", messageData.data.params[0].FY);
              } else {
                params.delete("FY");
              }
              if (
                !!messageData.data.params[0].value &&
                messageData.data.params[0].value.length > 0
              ) {
                params.set("value", messageData.data.params[0].value.join(","));
              } else {
                params.delete("value");
              }
              window.history.pushState(
                {},
                "",
                `${window.location.pathname}?${params.toString()}`
              );
              break;
            default:
              break;
          }
        } catch (error) {}
      }
    });
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
        DashboardType: "ghgdashboard",
      },
    };
    await axios
      .get(getNextJSServiceUrl() + "common/GetDashboardUrls", config)
      .then((json) => {
        console.log(json);
        if (json.status === 200) {
          if (json.data !== undefined) {
            if (json.data !== undefined) {
              let url = "";
              if (
                JSON.parse(localStorage.userType) === RoleCodes.SUPPLIER ||
                JSON.parse(localStorage.userType) === RoleCodes.BUYER ||
                ShowOtherCompanyDetails === true
              ) {
                url = json.data.filter(
                  (x) =>
                    x.dashboardType === "ghgdashboard" &&
                    x.companyType === "Portfolio Company"
                );
              } else if (
                JSON.parse(localStorage.userType) ===
                RoleCodes.VENTURECAPITALIST
              ) {
                url = json.data.filter(
                  (x) =>
                    x.dashboardType === "ghgdashboard" &&
                    x.companyType === "VC Company"
                );
              } else if (
                JSON.parse(localStorage.userType) ===
                RoleCodes.ORGANIZATIONADMIN
              ) {
                url = json.data.filter(
                  (x) =>
                    x.dashboardType === "ghgdashboard" &&
                    x.companyType === "Portfolio Company"
                );
              } else if (
                JSON.parse(localStorage.userType) ===
                RoleCodes.LOCATIONEXECUTIVE
              ) {
                url = json.data.filter(
                  (x) =>
                    x.dashboardType === "ghgdashboard" &&
                    x.companyType === "Portfolio Company"
                );
              }
              this.setState({
                dashboardUrls: url,
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
    debugger
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
    return this.state.dashboardUrls.length > 0 &&
      this.state.dashboardUrls !== undefined
      ? this.state.dashboardUrls.map((item) => {
          return (
            <div className="">
              <div className="waterMarkContainer">
                <div
                  style={{
                    display: this.state.loader ? "block" : "none",
                    position: "absolute",
                    width: "100%",
                    height: "100vh",
                    background: "rgba(255,255,255,.8)",
                  }}
                >
                  <Spinner />
                </div>
                <div className="waterMarkHide" />
                <iframe
                  scrolling="yes"
                  title="Dasboard"
                  id="iframeDasboard"
                  src={item.url.replace(
                    "embed/v1/ghg-dashboard",
                    localStorage.opsUserCompanyId +
                      "/embed/v1/" +
                      localStorage.opsToken +
                      "/ghg-dashboard"
                  )}
                  // src="http://localhost:3000/ce25acad-8602-4c9f-9365-ebf4ac2d5a8e/embed/v1/eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWRlZmF1bHQtcm9sZSI6IkxvY2F0aW9uRXhlY3V0aXZlIiwieC1oYXN1cmEtYWxsb3dlZC1yb2xlcyI6WyJMb2NhdGlvbkV4ZWN1dGl2ZSJdLCJ4LWhhc3VyYS11c2VyLWlkIjoiMTk0ZGE4NWQtMDc2ZS00OGY1LWE2OGItMDlkZTg1NzYyZjhlIiwieC1oYXN1cmEtb3JnLWlkIjoiY2UyNWFjYWQtODYwMi00YzlmLTkzNjUtZWJmNGFjMmQ1YThlIn0sInVzZXJfZW1haWwiOiJsb2NhdGlvbi1leGVjdXRpdmUxQHlvcG1haWwuY29tIiwibWFwcGluZ3MiOlt7Im9yZ2FuaXphdGlvbl9hZGRyZXNzX2lkIjoiN2M3NGQ5MjEtNjZhYy00MWE4LTkwYTYtNGViYzA1MzQwYjg3IiwiYWN0aXZpdGllcyI6WyJnZW5lcmFsIiwicHJvZHVjdGlvbiIsImVuZXJneSIsInRyYW5zcG9ydCIsIndhc3RlIl19LHsib3JnYW5pemF0aW9uX2FkZHJlc3NfaWQiOiJiZjQzYWZiMS0yYjliLTQwMWMtOTg5ZC03ZjA0NDA3NGUzYmEiLCJhY3Rpdml0aWVzIjpbImdlbmVyYWwiLCJlbmVyZ3kiLCJ0cmFuc3BvcnQiLCJwcm9kdWN0aW9uIl19LHsib3JnYW5pemF0aW9uX2FkZHJlc3NfaWQiOiI1NjVhNDNkNi1kNTJjLTRkZmEtOTc3Ni04NTYxMzVhMjc4ODMiLCJhY3Rpdml0aWVzIjpbImdlbmVyYWwiLCJwcm9kdWN0aW9uIiwiZW5lcmd5IiwidHJhbnNwb3J0Iiwid2FzdGUiXX1dLCJpYXQiOjE3MTY1NDA0MjQsImV4cCI6MTcxNjYyNjgyNH0.93wST69QCHHAboKwYvVSpEiYLx48eyQK9_oMs905Tzw/ghg-dashboard"
                  // onLoad={() => this.setState({ loader: false })}
                  frameBorder="0"
                  width="100%"
                  allowFullScreen
                  style={{
                    height: "calc(100vh - 45px)",
                  }}
                />
              </div>
            </div>
          );
        })
      : "";
  }
}
export default GHGDashboardOPs;
