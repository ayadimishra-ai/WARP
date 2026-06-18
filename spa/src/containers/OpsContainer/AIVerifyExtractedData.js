import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { Component } from "react";
import { Redirect } from "react-router";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import { GetGHGEstimationUrl, getUserPermision } from "../../config";
import * as PageKeys from "../../pagekeys";
import Spinner from "../../UI/Spinner/Spinner";
import { BreadCrumb, decodeOpAccessToken } from "../../utility";
import { popupAlert } from "../../UI/Popups/popup";

let messageData = "";

const GHGEstimate_Link = GetGHGEstimationUrl();
const cancelToken = axios.CancelToken;
let source = cancelToken.source();
class AIVerifyExtractedData extends Component {
  constructor(props) {
    super(props);
    this.state = {
      open: false,
      location: "",
      selectedFile: null,
      uploadProgress: 0,
      modalContent: "",
      showAlert: false,
      alertMessage: "",
      shrink: false,
      status: "",
      bulkData: [],
      jwtToken: "",
      organizationId: "",
      uploadedFilePath: "",
      failureErrorPath: "",
      isGenericError: false,
      iframeHeight: 0,
      loader: true,
      activities: [],
      mappings: [],
      orgRole: "BUYER",
      fileId: null,
      isEdit: false,
      // New state for navigation tracking
      currentFileName: "",
      currentIndex: 0,
      totalCount: 0,
    };
  }

  componentDidMount = async () => {
    try {
      // Get fileId from router state or URL param
      let fileId = null;
      let isEdit = false;

      if (
        this.props.location &&
        this.props.location.state &&
        this.props.location.state.fileId
      ) {
        fileId = this.props.location.state.fileId;
        isEdit = this.props.location.state.isEdit || false;
      } else if (
        this.props.match &&
        this.props.match.params &&
        this.props.match.params.fileId
      ) {
        fileId = this.props.match.params.fileId;
        isEdit = this.props.match.params.isEdit || false;
      }

      // NEW: Get fileId from URL search params if not found in router state
      if (!fileId) {
        const urlParams = new URLSearchParams(window.location.search);
        const urlFileId = urlParams.get("fileId");
        if (urlFileId) {
          fileId = urlFileId;
        }
      }

      if (fileId) {
        this.setState({
          fileId: fileId,
          isEdit: isEdit,
        });
      }

      this.setState({ jwtToken: localStorage.opsToken }, () => {
        const decodedToken = decodeOpAccessToken(this.state.jwtToken);
        const organizationId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
        this.setState({ organizationId: organizationId });
      });

      // Event listener for iframe height
      window.addEventListener(
        "message",
        function(event) {
          event.preventDefault();
          if (!isNaN(event.data)) {
            if (this.state.iframeHeight !== event.data) {
              this.setState({ iframeHeight: event.data + 20 });
            }
          }
        }.bind(this)
      );

      // Custom handle function
      this.newHandle();
    } catch (error) {
      console.error("Error in componentDidMount: ", error);
    }
  };
  handleIframeUrlChange = (message) => {
    // Update parent window URL to match iframe only if different
    const newUrl = `/verify-extracted-data?fileId=${message.fileId}`;
    if (window.location.pathname + window.location.search !== newUrl) {
      window.history.replaceState({}, "", newUrl);
    }
  };

  newHandle = () => {
    window.addEventListener("message", (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = "";
          messageData = JSON.parse(event.data);
          const { title, message, buttons, type } = messageData;

          // Default button texts and actions
          let negetiveActionBtn = buttons && buttons[0] ? buttons[0].text : "";
          let positiveActionBtn = buttons && buttons[1] ? buttons[1].text : "";
          let negetiveClickFunction = null;
          let positiveClickFunction = null;

          if (buttons && buttons[1] && buttons[1].action === "discard") {
            positiveClickFunction = () => {
              // Send a message to window
              let iFrame = document.getElementById("listIframe1");
              if (!!iFrame) {
                iFrame.contentWindow.window.postMessage(
                  JSON.stringify({
                    type: "ai-verify-discard-clicked",
                    fileId: this.state.fileId,
                  }),
                  "*"
                );
              }
            };
          }
          switch (type) {
            case "op-redirect-to-activity-data-records":
              this.props.history.push("/data-upload-logs");
              break;
            case "AIUploadHistoryPage":
              this.props.history.push("/data-upload-logs/energy_grid_power");
              break;
            case "AIDataVerifyPopup":
              popupAlert(
                "AIDataVerifyPopup",
                title,
                <div dangerouslySetInnerHTML={{ __html: message }} />,
                () => {
                  this.props.history.push("/data-upload-logs/energy_grid_power");
                },
                "Yes, Close",
                "Go to Upload History",
                () => {
                  let iFrame = document.getElementById("listIframe1");
                  if (!!iFrame) {
                    iFrame.contentWindow.window.postMessage(
                      JSON.stringify({
                        type: "ai-verify-extracted-data-close",
                        fileId: this.state.fileId,
                      }),
                      "*"
                    );
                  }
                }
              );
              break;
            case "AIExtractedDataValidationPopup":
              popupAlert(
                "AIExtractedDataValidationPopup",
                title,
                message,
                positiveClickFunction,
                negetiveActionBtn,
                positiveActionBtn,
                negetiveClickFunction
              );
              break;
            case "ai-verify-url-change":
              this.handleIframeUrlChange(messageData);
              break;
            case "DeleteMeterPopup":
              popupAlert(
                "DeleteConfirmPopup",
                title,
                message,
                () => {
                  let iFrame = document.getElementById("listIframe1");
                  if (!!iFrame) {
                    iFrame.contentWindow.window.postMessage(
                      JSON.stringify({
                        type: "DeleteMeterConfirmed",
                        meterIndex: messageData.meterIndex, // Pass the meter index back
                      }),
                      "*"
                    );
                  }
                },
                negetiveActionBtn,
                positiveActionBtn,
                negetiveClickFunction
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

  iframeUrl = () => {
    const params = [];
    if (this.state.fileId) params.push(`fileId=${this.state.fileId}`);
    if (this.state.isEdit) params.push(`isEdit=${this.state.isEdit}`);
    const queryString = params.length ? `?${params.join("&")}` : "";

    return (
      GHGEstimate_Link +
      this.state.organizationId +
      "/embed/v1/" +
      this.state.jwtToken +
      "/ai-verify-extracted-data" +
      queryString
    );
  };

  render() {
    const permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions && permissions.length === 0) {
      return <Redirect to="/not-found" />;
    } else if (
      getUserPermision(permissions, PageKeys.AIVerifyExtractedData) === null
    ) {
      return <Redirect to="/not-found" />;
    }
    return (
      <React.Fragment>
        <div className="">
          {this.state.loader && (
            <div style={{ position: "absolute", width: "90%" }}>
              <Spinner />
            </div>
          )}
          <iframe
            allow
            title=" "
            id="listIframe1"
            src={this.iframeUrl()}
            allowFullScreen
            frameBorder="0"
            style={{ width: "100%", height: "850px" }}
            height={"850px"}
            loading="eager"
            onLoad={() => this.setState({ loader: false })}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default withStyles(navbarsStyle)(AIVerifyExtractedData);
