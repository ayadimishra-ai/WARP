import {
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
} from "@material-ui/core";
import React, { Component } from "react";
import CloseIcon from "@material-ui/icons/Close";
import { decodeOpAccessToken } from "../../utility";
import { popupAlert } from "../../UI/Popups/popup";
import { GetGHGEstimationUrl } from "../../config";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
let messageData = "";

class UserActivityMapping extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
      isOpen: false,
      userId: "",
    };
  }

  componentDidMount = () => {
    this.setState({ jwtToken: localStorage.opsToken });
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", organizationId);
      this.setState({ organizationId: organizationId });
    } catch (error) {
      // Handle error if needed
      console.error("Error decoding token:", error);
      this.setState({ organizationId: null });
    }

    this.newHandle();
  };

  newHandle = () => {
    window.addEventListener("message", async (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string" && event.data !== "") {
        try {
          messageData = "";
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          switch (type) {
            case "save-activity-popup":
              // open dialog first
              this.setState({ isOpen: messageData.isOpen });
              break;
            case "save-activity-data":
              this.setState({ isOpen: messageData.isOpen });
              popupAlert(
                messageData.isFailed ? "error" : "success",
                messageData.isFailed ? "Error" : "Success",
                messageData.isFailed
                  ? "Something went wrong"
                  : "Users permission updated successfully",
              );
              const iFrame = document.getElementById("UserActivityMapping");

              iFrame.contentWindow.postMessage(
                JSON.stringify({
                  type: "refetch-user-activity-mappings",
                }),
                "*",
              );
              break;
            case "blank-update-data":
              popupAlert(
                "warning",
                "Warning",
                "There is no data to show on Popup. Either add row or make changes in existing row or you have duplicate row",
              );
              break;
            case "validate-recaptcha":
              const isCaptchaValid = await captchaValidation(this.context);
              if (isCaptchaValid) {
                event.source.postMessage(
                  JSON.stringify({
                    type: "reCaptchaValidation",
                  }),
                  event.origin,
                );
              } else {
                alert("Captcha verification failed. Please try again.");
              }
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
    return (
      <>
        <iframe
          title="User and Activity Mapping"
          id="UserActivityMapping"
          src={
            GetGHGEstimationUrl() +
            this.state.organizationId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/user-activity-mapping"
          }
          style={{ width: "100%", height: "100vh", border: "none" }}
        />

        <Dialog
          open={this.state.isOpen}
          onClose={() => this.setState({ isOpen: false })}
          fullWidth={true}
          maxWidth="md"
          PaperProps={{
            style: {
              borderRadius: "20px",
              width: "47vw",
               height:"65vh",
            },
          }}
        >
          <DialogTitle id="scroll-dialog-title">
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                width: "100%",
              }}
            >
              <p
                style={{
                  marginBottom: 0,
                  fontSize: 24,
                  fontWeight: 400,
                  color: "#122F47",
                }}
              >
                Save Mapping?
              </p>
              <IconButton
                className="closebtn"
                aria-label="close"
                onClick={() => this.setState({ isOpen: false })}
              >
                <CloseIcon />
              </IconButton>
            </div>
          </DialogTitle>
          <DialogContent style={{ overflow: "hidden", height: "45vh" }}>
            <iframe
              title="User and Activity Mapping"
              id="UserActivityMappingPopup"
              ref={this.popupIframeRef}
              src={
                GetGHGEstimationUrl() +
                this.state.organizationId +
                "/embed/v1/" +
                localStorage.opsToken +
                "/save-mapping-popup"
              }
              style={{ width: "100%", height: "50vh", border: "none" }}
              onLoad={this.handlePopupLoad} // 👈 send message after load
            />
          </DialogContent>
        </Dialog>
      </>
    );
  }
}

export default UserActivityMapping;
