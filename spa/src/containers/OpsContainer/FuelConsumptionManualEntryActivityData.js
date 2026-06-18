import React, { Component } from "react";
import { decodeOpAccessToken } from "../../utility";
import { GetGHGEstimationUrl } from "../../config";
import Spinner from "../../UI/Spinner/Spinner";
import { withStyles } from "@material-ui/core/styles";
import {
  ReCaptchaContext,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
import { popupAlert } from "../../UI/Popups/popup";
const GHGEstimate_Link = GetGHGEstimationUrl();
class FuelConsumptionManualEntryActivityData extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
      iframeHeight: 60,
      organizationAddressId: "",
      selectedRowIdsToDelete: []
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

    window.addEventListener("message", this.handleMessage);
  };

  componentWillUnmount() {
    // Detach so listeners don't pile up across navigations between manual-entry
    // pages — stale instances would otherwise re-run popupAlert / postMessage
    // with empty state and break the delete + success-popup flows.
    window.removeEventListener("message", this.handleMessage);
  }

  handleMessage = async (event) => {
    let dataType = typeof event.data;
    if (dataType === "string") {
      let messageData = "";
      try {
        messageData = JSON.parse(event.data);
        const type = messageData.type;
        switch (type) {
            case "warp-content-resize":
              this.setState({ iframeHeight: messageData.data.height });
              break;
            case "confirm-delete-form-entry":
              this.setState({
                organizationAddressId: messageData.data.organizationAddressId,
                selectedRowIdsToDelete: messageData.data.selectedRowIdsToDelete
              });

              popupAlert(
                "deleteConfirmWarpPopupRedButton",
                "Delete Entry",
                "Are you sure want to delete this entry? Once deleted you won't be able to recover this data.",
                () => {
                  let sendRemoveData = document.getElementById("listIframe1");
                  sendRemoveData.contentWindow.postMessage(
                    JSON.stringify({
                      type: "confirm-delete-form-entry-true",
                      data: {
                        organizationAddressId: this.state.organizationAddressId,
                        selectedRowIdsToDelete: this.state.selectedRowIdsToDelete
                      }
                    }),
                    GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"
                  );
                },
                "NO, KEEP IT",
                "YES, DELETE!"
              )
              break;
            case "energy-fuel-purchased-form-updated":
              popupAlert(
                "success",
                "Success",
                messageData.data.isDeleted
                  ? "Data Deleted Successfully"
                  : "Data Saved Successfully"
              );
              break;
            case "manual-entry-confirm-cancel":
              popupAlert(
                "confirmPopup",
                "Confirm Cancel",
                "Discard unsaved changes?",
                () => {
                  // No, Keep Editing action
                  let sendRemoveData = document.getElementById("listIframe1");
                  sendRemoveData.contentWindow.postMessage(
                    JSON.stringify({
                      type: "manual-entry-confirm-cancel-response",
                      data: {
                        confirmedDiscard: false,
                      }
                    }),
                    GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"
                  );
                },
                "Yes, Discard",
                "No, Keep Editing",
                () => {
                  // Yes, Discard action
                  let sendRemoveData = document.getElementById("listIframe1");
                  sendRemoveData.contentWindow.postMessage(
                    JSON.stringify({
                      type: "manual-entry-confirm-cancel-response",
                      data: {
                        confirmedDiscard: true,
                      }
                    }),
                    GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"
                  );
                },
              );
              break;
            default:
              break;
          }
        } catch (error) {
          console.error(`Error in ${messageData.type}: `, error);
        }
      }
    };

  render() {
    return (
      <React.Fragment>
        <iframe
          title="Fuel Consumption Manual Activity Data"
          id="listIframe1"
          src={
            GetGHGEstimationUrl() +
            this.state.organizationId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/manual-entry-data/fuel-consumption/"
          }
          style={{ width: "100%", minHeight: 500, height: this.state.iframeHeight, border: "none" }}
        />
      </React.Fragment>
    );
  }
}
export default withStyles()(FuelConsumptionManualEntryActivityData);