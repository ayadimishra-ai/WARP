import React, { Component } from "react";
import { popupAlert } from "../../UI/Popups/popup";
import { GetGHGEstimationUrl } from "../../config";
import axios from "axios";
import Spinner from "../../UI/Spinner/Spinner";
import { decodeOpAccessToken } from "../../utility";
import { userRoles } from "../../userRoles.service";
import { withRouter } from "react-router-dom";

let messageData = "";
class GoalSetting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loader: true,
      organizationId: null,
    };
  }

  componentDidMount() {
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      this.setState({ organizationId: organizationId });
    } catch (error) {
      // Handle token decoding error
      console.error("Error decoding token: ", error);
      this.setState({ organizationId: null });
    }
    const roles = userRoles();
    if (!roles.isOrganizationAdmin()) {
      // redirect to home page
      this.setState({ loader: false });
      this.props.history.push("/");
      return;
    }
    this.newHandle();
  }

  handlePositiveButton = async (payload) => {
    const formData = payload;
    const opConfig = {
      headers: {
        "x-sk-op-authorization": localStorage.opsToken,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(
      GetGHGEstimationUrl() + "api/v1/net-zero-target-year/form",
      formData,
      opConfig
    );

    if (response && response.data && response.data.success) {
      popupAlert(
        "success",
        "Success",
        "Net Zero Target Settings updated successfully."
      );
      try {
        let sendRemoveData = document.getElementById(
          "Net Zero Target Year Form"
        );
        sendRemoveData.contentWindow.postMessage(
          JSON.stringify({
            type: "net-zero-target-year-success-message",
          }),
          "*"
        );
      } catch (error) {}
    } else {
      popupAlert(
        "error",
        "Error",
        "Something went wrong. Please try again later."
      );
    }
  };

  handleDeleteConfirmation = () => {
    try {
      let sendRemoveData = document.getElementById("Net Zero Target Year Form");
      sendRemoveData.contentWindow.postMessage(
        JSON.stringify({
          type: "confirm-delete-net-zero-target-year",
          data: messageData.data,
        }),
        "*"
      );
    } catch (error) {}
  };

  newHandle = () => {
    window.addEventListener("message", (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = "";
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          const payload = messageData.data;
          switch (type) {
            case "net-zero-target-year-form-submitted":
              popupAlert(
                "SubmitconfirmPopup",
                "Confirmation",
                "Are you sure you want to amend your goal settings?",
                () => {
                  this.handlePositiveButton(payload);
                },
                "No",
                "Yes, update targets",
                "",
                "",
                "",
                "Change in target settings will need a recalibration in your analytics module. This may take time to reflect on your dashboards. The dashboards will be recalibrated in maximum 48 hrs."
              );
              break;
            case "net-zero-target-year-delete-confirmation":
              popupAlert(
                "deleteConfirmWarpPopupGoalSetting",
                "Caution!!!",
                "Are you sure you want to remove this target?",
                () => {
                  this.handleDeleteConfirmation();
                },
                "CANCEL",
                "YES, REMOVE TARGET",
                "",
                "",
                "",
                `Removing this target will permanently delete the ${
                  payload.year
                } emission reduction goal of ${
                  payload.percentage
                }% from your organization's net zero roadmap.`
              );
              break;
            default:
              break;
          }
        } catch (error) {
          console.error(`Error in ${messageData.type}: `, error);
        }
      }
    });
  };

  render() {
    const opsUrl =
      GetGHGEstimationUrl() +
      this.state.organizationId +
      "/embed/v1/" +
      localStorage.opsToken +
      "/net-zero-target-setting";

    return (
      <React.Fragment>
        {this.state.loader && (
          <div style={{ position: "absolute", width: "90%" }}>
            <Spinner />
          </div>
        )}

        <iframe
          title="Net Zero Target Year Form"
          id="Net Zero Target Year Form"
          src={opsUrl}
          style={{ width: "100%", height: "100vh", border: "none" }}
          onLoad={() => this.setState({ loader: false })}
        />
      </React.Fragment>
    );
  }
}

export default withRouter(GoalSetting);
