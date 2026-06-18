import React, { Component } from "react";
import { GetGHGEstimationUrl } from "../../config";
// import Spinner from "../../UI/Spinner/Spinner";
import { decodeOpAccessToken } from "../../utility";
import { popupAlert } from "../../UI/Popups/popup";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";

let messageData = "";
class OrganizationDetails extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
    };
  }

  componentDidMount() {
    this.setState({ jwtToken: localStorage.opsToken });
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", organizationId);
      this.setState({ organizationId: organizationId });
    } catch (error) {}
    this.newHandle();
  }

  newHandle = () => {
    window.addEventListener("message", async (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = "";
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          switch (type) {
            case "org-details-form-submitted":
              popupAlert(
                messageData.isFailed ? "error" : "success",
                messageData.isFailed ? "Error" : "Success",
                messageData.isFailed
                  ? "Something went wrong"
                  : "Organization details updated successfully"
              );
              break;
            case "validate-recaptcha":
              const isCaptchaValid = await captchaValidation(this.context);
              if (isCaptchaValid) {
                event.source.postMessage(
                  JSON.stringify({
                    type: "reCaptchaValidation",
                  }),
                  event.origin
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
    const { classes } = this.props;

    return (
      <iframe
        title="Organization Details Form"
        id="Organization Details Form"
        src={
          GetGHGEstimationUrl() +
          localStorage.opsUserCompanyId +
          "/embed/v1/" +
          localStorage.opsToken +
          "/organization-details"
        }
        style={{ width: "100%", height: "100vh", border: "none" }}
      />
    );
  }
}

export default OrganizationDetails;
