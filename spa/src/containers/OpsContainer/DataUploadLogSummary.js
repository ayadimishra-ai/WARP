import React, { Component } from "react";
import { decodeOpAccessToken } from "../../utility";
import { GetGHGEstimationUrl } from "../../config";
import { withStyles } from "@material-ui/core/styles";
import {
  ReCaptchaContext,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
import { popupAlert } from "../../UI/Popups/popup";
let messageData = "";
const GHGEstimate_Link = GetGHGEstimationUrl();
class DataUploadLogSummary extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
    };
  }

  componentDidMount = async () => {
    this.setState({ jwtToken: localStorage.opsToken });
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", organizationId);
      this.setState({ organizationId: organizationId });
    } catch (error) {
      this.setState({ organizationId: null });
    }

    this.newHandle();
  };
  
  componentWillUnmount() {
    window.removeEventListener("message", this.handleMessage);
  }

  handleMessage = async (event) => {
    event.preventDefault();
    let dataType = typeof event.data;
    if (dataType === "string") {
      try {
        messageData = "";
        messageData = JSON.parse(event.data);
        const type = messageData.type;
        switch (type) {
          case "warp-content-resize":
            this.setState({ iframeHeight: messageData.data.height + 100 });
            break;
          case "data-log-approval-confirm-popup": {
            const rowData = messageData.data;
            popupAlert(
              "ApproveconfirmPopup",
              "Confirmation",
              "Do you want to proceed with approving this data?",
              () => {
                const iFrame = document.getElementById("listIframe1");
                if (iFrame && iFrame.contentWindow) {
                  iFrame.contentWindow.postMessage(
                    JSON.stringify({ type: "data-log-approval-confirmed", data: rowData }),
                    GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"
                  );
                }
              },
              "CANCEL",
              "APPROVE"
            );
            break;
          }
          case "warp-approved-successfully":
            popupAlert("success", "Success", "Data Approved Successfully.");
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error handling message:", error);
      }
    }
  };

  newHandle = () => {
    window.addEventListener("message", this.handleMessage);
  };

  render() {
    const filterParams = new URLSearchParams(window.location.search).get("filters");
    return (
      <React.Fragment>
        <iframe
          title="Data Upload Log Summary"
          id="listIframe1"
          src={
            GHGEstimate_Link +
            localStorage.opsUserCompanyId +
            "/embed/v1/" +
            this.state.jwtToken +
            "/data-log-summary" +
            (filterParams ? `?filters=${filterParams}` : "")
          }
          style={{ width: "100%", minHeight: 500, height: this.state.iframeHeight, border: "none" }}
        />
      </React.Fragment>
    );
  }
}
export default withStyles()(DataUploadLogSummary);