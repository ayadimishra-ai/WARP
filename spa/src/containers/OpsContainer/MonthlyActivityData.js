import React, { Component } from "react";
import { BreadCrumb, MaterialProcurementActivityBlock } from "../../utility";
import {  decodeOpAccessToken, } from "../../utility";
import AddData from "../../components/AddData/AddData";
import Add_data_page_icon from "../../assets/img/add_data_page_icon.svg";
import { popupAlert } from "../../UI/Popups/popup";
import { GetGHGEstimationUrl } from "../../config";
import axios from "axios";
import Spinner from "../../UI/Spinner/Spinner";
import * as RoleCodes from "../../rolecodes";
import DownloadEmissionFactors from "../../components/DownloadEmissionFactors/DownloadEmissionFactors";
import Button from "../../components/Material/CustomButtons/Button";
import { Link } from "react-router-dom";
import BulkUploadDropdown from "../../components/BulkUploadBtn&DownloadTemplateDropdown/BulkUploadDropdown";
import DownloadTemplateDropdown from "../../components/BulkUploadBtn&DownloadTemplateDropdown/DownloadTemplateDropdown";
import { connect } from "react-redux";
import { UploadActivityCode } from "../../store/actions/monthlyActivityData";

class MonthlyActivityData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      jwtToken: "",
      // uploadActivityCode: null,
      monthlyActivityData: [],
    };
  }
   
  fetchMonthlyActivityData = () => {
    try {
      const decodedToken = decodeOpAccessToken(this.state.jwtToken);

      if (decodedToken) {
        const formData = {
          organizationId:
            decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
        };

        const opConfig = {
          headers: {
            "x-sk-op-authorization": localStorage.opsToken,
            "Content-Type": "application/json",
          },
        };

        axios
          .post(
            GetGHGEstimationUrl() + "api/v1/monthly-activity-data",
            formData,
            opConfig
          )
          .then((response) => {
            this.setState({
              monthlyActivityData: response.data.data,
              loader: false,
            });
          })
          .catch(() => this.setState({ loader: false }));
      } else {
        this.setState({ loader: false });
      }
    } catch (error) {
      console.error("Error decoding token or setting organization ID:", error);
      this.setState({ loader: false });
    }
  };

  componentDidMount = async () => {
    this.setState({ jwtToken: localStorage.opsToken }, () => {
      try {
        const decodedToken = decodeOpAccessToken(this.state.jwtToken);
        if (decodedToken) {
          const organizationId =
            decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
          localStorage.setItem("opsUserCompanyId", organizationId);
          this.setState({ organizationId: organizationId });
        }
      } catch (error) {
        console.error(
          "Error decoding token or setting organization ID:",
          error
        );
      }
      this.fetchMonthlyActivityData();
    });

    window.addEventListener("message", this.handleMessage);
  };
  handleMessage = (event) => {
    event.preventDefault();

    if (event.data === "OpenBuyerShareDetails") {
      event.preventDefault();
      popupAlert(
        "commonModalWithActions",
        "Buyer's Share Details",
        <iframe
          id="buyerShareIframe"
          scrolling="yes"
          title="Buyer's Share Details"
          src={
            GetGHGEstimationUrl() +
            localStorage.opsUserCompanyId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/buyer-share-details"
          }
          frameBorder="0"
          allowFullScreen
          style={{
            width: "100%",
            padding: "0 25px 15px",
          }}
        />,
        () => {
          this.props.UploadActivityCode("buyer_share");
        },
        "Cancel",
        "Add Data"
      );
    } else if (event.data && event.data.contentHeight) {
      const iframe = document.getElementById("buyerShareIframe");
      if (iframe) {
        iframe.style.height = `${event.data.contentHeight + 40}px`;
      }
    }
  };
  //handleUploadActivityCode = () => this.setState({ uploadActivityCode: null });
  //handleUploadActivityCode = () =>  this.props.UploadActivityCode(null);
  componentDidUpdate(prevProps) {
    if (prevProps.refreshFlag !== this.props.refreshFlag) {
      document
        .getElementById("iframeDasboard")
        .contentWindow.postMessage("callApi", new URL(GetGHGEstimationUrl()).origin);
    }
  }
  componentWillUnmount = () =>
    window.removeEventListener("message", this.handleMessage);
  render() {
    return (
      <React.Fragment>
        <div className="">
          {this.state.loader ? (
            <div
              style={{
                display: "block",
                position: "absolute",
                width: "100%",
                height: "100vh",
                background: "rgba(255,255,255,.8)",
              }}
            >
              <Spinner />
            </div>
          ) : (
            <>
              {this.state.monthlyActivityData.length > 0 ||
              JSON.parse(localStorage.userType) ===
                RoleCodes.ORGANIZATIONADMIN ? (
                <iframe
                  scrolling="yes"
                  title="Dasboard"
                  id="iframeDasboard"
                  src={
                    GetGHGEstimationUrl() +
                    localStorage.opsUserCompanyId +
                    "/embed/v1/" +
                    localStorage.opsToken +
                    "/activity-data-records"
                  }
                  onLoad={() => this.setState({ loader: false })}
                  frameBorder="0"
                  width="100%"
                  allowFullScreen
                  style={{
                    height: "calc(100vh - 45px)",
                  }}
                />
              ) : (
                <AddData
                  submitDataHandle={this.fetchMonthlyActivityData}
                  pageIcon={Add_data_page_icon}
                  pageTitle={"Add Your Activity Data"}
                  pageContent={
                    <p className="AddActivityDataText">
                      When you add monthly activity data you'll see them here.
                      Download our sample template to learn the information you
                      need to add for your activity data. <br />
                      Supported file formats: .csv or .xls.
                    </p>
                  }
                  popupTitle={"How to add bulk data?"}
                  popupContent={
                    <iframe
                      width="100%"
                      height="415"
                      src="https://www.youtube.com/embed/GhblUfAVVHw?si=mHyAl0Iy_bjKF5FJ"
                      title="YouTube video player"
                      frameborder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                      referrerpolicy="strict-origin-when-cross-origin"
                      allowfullscreen
                    />
                  }
                />
              )}
            </>
          )}
        </div>
      </React.Fragment>
    );
  }
}
const mapStateToProps = (state) => ({
  refreshFlag: state.BulkUploadStore.refresh,
});
const mapDispatchToProps = {
  UploadActivityCode,
};
//export default MonthlyActivityData;
export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MonthlyActivityData);
