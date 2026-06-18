import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { Component } from "react";
import { Redirect } from "react-router";
import { Link } from "react-router-dom";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import BulkUploadDropdown from "../../components/BulkUploadBtn&DownloadTemplateDropdown/BulkUploadDropdown";
import DownloadTemplateDropdown from "../../components/BulkUploadBtn&DownloadTemplateDropdown/DownloadTemplateDropdown";
import Button from "../../components/Material/CustomButtons/Button";
import { GetGHGEstimationUrl, getUserPermision } from "../../config";
import * as PageKeys from "../../pagekeys";
import * as RoleCodes from "../../rolecodes";
import Spinner from "../../UI/Spinner/Spinner";
import DownloadEmissionFactors from "../../components/DownloadEmissionFactors/DownloadEmissionFactors";
import { BreadCrumb, decodeOpAccessToken, } from "../../utility";
import { popupAlert } from "../../UI/Popups/popup";

let messageData = "";

const GHGEstimate_Link = GetGHGEstimationUrl();

const Statuses = {
  Failure: "failure",
  Success: "successful",
};
const cancelToken = axios.CancelToken;
let source = cancelToken.source();
class GHGActivity extends Component {
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
      pendingUploadActivityCode: null,
      pendingAIActivityCode: null,
    };
    // this.handleFileChange = this.handleFileChange.bind(this);
    // this.handleDrop = this.handleDrop.bind(this);
    // this.handleDragOver = this.handleDragOver.bind(this);
  }

  componentDidMount = async () => {
    try {
      this.setState({ jwtToken: localStorage.opsToken }, () => {
        try {
          const decodedToken = decodeOpAccessToken(this.state.jwtToken);
          if (!decodedToken) return;
          const organizationId =
            decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
          this.setState({ organizationId: organizationId });
        } catch (error) {
          // Handle token decoding error
          console.error("Error decoding token: ", error);
        }
      });

      // Event listener for iframe height
      window.addEventListener("message", (event) => {
        event.preventDefault();
        if (!isNaN(event.data)) {
          if (this.state.iframeHeight !== event.data) {
            this.setState({ iframeHeight: event.data + 20 });
          }
        }
      });

      // Custom handle function
      this.newHandle();
    } catch (error) {
      console.error("Error in componentDidMount: ", error);
    }
  };

  componentDidUpdate(prevProps) {
    const previousActivityCode =
      prevProps.match && prevProps.match.params
        ? prevProps.match.params.activityCode
        : "";
    const currentActivityCode =
      this.props.match && this.props.match.params
        ? this.props.match.params.activityCode
        : "";

    if (previousActivityCode !== currentActivityCode && !this.state.loader) {
      this.setState({ loader: true });
    }
  }

  newHandle = () => {
    window.addEventListener("message", (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = "";
          messageData = event.data ? JSON.parse(event.data) : {};
          const { fileName } = messageData;
          const type = messageData.type;
          switch (type) {
            case "op-redirect-to-activity-data-records":
              this.props.history.push("/monthly-activity-data");
              break;
            case "op-redirect-to-data-upload-logs":
              this.props.history.push("/data-upload-logs");
              break;
            case "op-redirect-to-verify-extracted-data":
              const fileId = messageData.data.fileId;
              this.props.history.push({
                pathname: "/verify-extracted-data",
                search: `?fileId=${fileId}`,
                state: { fileId: fileId, isEdit: messageData.data.isEdit },
              });
              break;
            case "open-excel-bulk-upload":
              console.log('[GHGActivity] open-excel-bulk-upload received. messageData:', messageData);
              this.setState(
                {
                  pendingUploadActivityCode:
                    messageData.data && messageData.data.activityCode
                      ? messageData.data.activityCode
                      : null,
                },
                () => console.log('[GHGActivity] state after open-excel-bulk-upload:', this.state.pendingUploadActivityCode)
              );
              break;
            case "open-ai-upload":
              console.log('[GHGActivity] open-ai-upload received. messageData:', messageData);
              this.setState(
                {
                  pendingAIActivityCode:
                    messageData.data && messageData.data.activityCode
                      ? messageData.data.activityCode
                      : null,
                },
                () => console.log('[GHGActivity] state after open-ai-upload:', this.state.pendingAIActivityCode)
              );
              break;
            case "DeleteUploadHistoryRow":
              popupAlert(
                "DeleteConfirmPopup",
                `Delete “${fileName}”?`,
                "The file will be permanently removed.",
                () => {
                  let sendRemoveData = document.getElementById("listIframe1");
                  sendRemoveData.contentWindow.postMessage(
                    JSON.stringify({
                      type: "confirm-file-delete",
                      fileId: messageData.fileId,
                    }),
                    "*"
                  );
                },
                "No, Keep File",
                "Yes, Delete",
                () => {
                  this.setState({
                    showAlert: false,
                    alertMessage: "",
                    status: Statuses.Failure,
                  });
                }
              );
              break;
            case "manual-entry-confirm-cancel":
              popupAlert(
                "confirmPopup",
                "Confirm Cancel",
                "Discard unsaved changes?",
                () => {
                  let iframe = document.getElementById("listIframe1");
                  iframe.contentWindow.postMessage(
                    JSON.stringify({
                      type: "manual-entry-confirm-cancel-response",
                      data: { confirmedDiscard: false },
                    }),
                    "*"
                  );
                },
                "Yes, Discard",
                "No, Keep Editing",
                () => {
                  let iframe = document.getElementById("listIframe1");
                  iframe.contentWindow.postMessage(
                    JSON.stringify({
                      type: "manual-entry-confirm-cancel-response",
                      data: { confirmedDiscard: true },
                    }),
                    "*"
                  );
                }
              );
              break;
            // The data-upload-logs page embeds the same manual-entry listings
            // (Energy Grid, Fuel, Captive Power, Waste) that the dedicated
            // manual-entry containers do, so it needs to handle the same
            // form-updated success messages — otherwise no popup fires after
            // a save/delete on this route.
            case "energy-grid-power-form-updated":
            case "energy-fuel-purchased-form-updated":
            case "energy-captive-power-form-updated":
            case "waste-data-form-updated":
              popupAlert(
                "success",
                "Success",
                messageData.data && messageData.data.isDeleted
                  ? "Data Deleted Successfully"
                  : "Data Saved Successfully"
              );
              break;
            case "confirm-delete-form-entry":
              const deleteOrganizationAddressId = messageData.data.organizationAddressId;
              const deleteSelectedRowIds = messageData.data.selectedRowIdsToDelete;
              popupAlert(
                "deleteConfirmWarpPopupRedButton",
                "Delete Entry",
                "Are you sure want to delete this entry? Once deleted you won't be able to recover this data.",
                () => {
                  let iframe = document.getElementById("listIframe1");
                  iframe.contentWindow.postMessage(
                    JSON.stringify({
                      type: "confirm-delete-form-entry-true",
                      data: {
                        organizationAddressId: deleteOrganizationAddressId,
                        selectedRowIdsToDelete: deleteSelectedRowIds,
                      },
                    }),
                    "*"
                  );
                },
                "NO, KEEP IT",
                "YES, DELETE!"
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

  getSelectedActivityCode = () => {
    const activityCode =
      this.props.match && this.props.match.params
        ? this.props.match.params.activityCode
        : "";

    if (!activityCode) {
      return "";
    }

    try {
      return decodeURIComponent(activityCode);
    } catch (error) {
      return activityCode;
    }
  };

  iframeUrl = () => {
    const activityCode = this.getSelectedActivityCode();
    const queryString = activityCode
      ? `?activityCode=${encodeURIComponent(activityCode)}`
      : "";

    return (
      GHGEstimate_Link +
      localStorage.opsUserCompanyId +
      "/embed/v1/" +
      this.state.jwtToken +
      "/data-import/excel/history" +
      queryString
    );
  };

  // generateListItems = (buttonText, action) => {
  //     return this.state.bulkData.length !== 0 ? <CustomDropdown
  //         customId={buttonText.replace(/ /g, "_")}
  //         caret={false}
  //         noLiPadding
  //         hoverColor="dark"
  //         dropPlacement={"bottom-end"}
  //         buttonText={
  //             <Button
  //                 className={"secondarydBtn"}
  //                 type="button"
  //                 style={{
  //                     margin: 0,
  //                 }}
  //             >
  //                 {buttonText}
  //             </Button>
  //         }
  //         buttonProps={{
  //             color: "transparent",
  //         }}
  //         dropdownList={this.generateDropdownItems(action)}
  //     /> : <></>
  // };
  // generateDropdownItems = (action) => {
  //     return this.state.bulkData.map((item, index) => (
  //         <React.Fragment key={index}>
  //             <a
  //                 href="#"
  //                 className={this.props.classes.dropdownLink}
  //                 onClick={(e) => {
  //                     e.preventDefault();
  //                     if (action === "upload") {
  //                         this.handleOpen(item.activity, item.downloadLink);
  //                     } else {
  //                         item.activity.toLowerCase() === 'business travel' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'employee travel' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'captive power' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'fuel purchased' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'general details' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'grid power' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'waste' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'upstream transport' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'downstream transport' && window.open(item.downloadLink, "_blank");
  //                         item.activity.toLowerCase() === 'production' && window.open(item.downloadLink, "_blank");
  //                     }
  //                 }}
  //                 style={{
  //                     width: "200px",
  //                 }}
  //             >
  //                 {item.activityHeader}
  //             </a>
  //             {index !== this.state.bulkData.length - 1 && (
  //                 <Divider
  //                     style={{
  //                         backgroundColor: "#e3e3e3",
  //                         marginLeft: "13px",
  //                         height: 1.5,
  //                     }}
  //                     variant="middle"
  //                 />
  //             )}
  //         </React.Fragment>
  //     ));
  // }

  render() {
    const { classes } = this.props;
    const {
      open,
      selectedFile,
      uploadProgress,
      modalContent,
      showAlert,
      alertMessage,
      status,
    } = this.state;

    let progressText;
    let progressTextColor;
    let progressBarColor;
    switch (true) {
      case uploadProgress === 100 && status === Statuses.Success:
        progressText = "File Uploaded Succesfully";
        progressTextColor = "#00B41D";
        progressBarColor = "#00B41D";
        break;
      case uploadProgress === 100 && status === Statuses.Failure:
        if (this.state.isGenericError) {
          progressTextColor = "#FA0B0B";
          progressBarColor = "#FA0B0B";
          progressText =
            "Something went wrong on our end. Please try again later.";
        } else {
          progressText = "Errors encountered while uploading the file.";
          progressTextColor = "#FA0B0B";
          progressBarColor = "#FA0B0B";
        }
        break;
      case uploadProgress < 100 && status !== Statuses.Success:
        progressTextColor = "#666666";
        progressBarColor = "#FFA93C";
        progressText = "Please wait file is uploading...";
        break;
      default:
        progressBarColor = "#FFA93C";
        progressTextColor = "#666666";
        progressText = "";
    }

    const isDisabled = uploadProgress > 0 && uploadProgress < 100;

    const permissions =
      localStorage.permissions !== undefined
        ? JSON.parse(localStorage.permissions)
        : [];
    if (permissions && permissions.length === 0) {
      return <Redirect to="/not-found" />;
    } else if (getUserPermision(permissions, PageKeys.GHGActivity) === null) {
      return <Redirect to="/not-found" />;
    }
    let breadCrumb = BreadCrumb([
      { pageName: "Home", url: "/Home" },
      { pageName: "Data Update Logs", url: "/#" },
    ]);


    return (
      <React.Fragment>
        <div className="breadtitle_wrap">
          {breadCrumb}
          <div className="page_top_title">
            <div
              className="page_heading"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-end",
                width: "100%",
              }}
            >
              <h4>Data Update Logs</h4>
              <div
                className="breadCrumbActionButtons"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 15,
                  position: "relative",
                  top: "-10px",
                }}
              >
                <Button
                  className={"secondarydBtn"}
                  type="button"
                  style={{
                    margin: 0,
                  }}
                >
                  <Link to="monthly-activity-data">Monthly Activity Data</Link>
                </Button>

                {JSON.parse(localStorage.userType) !==
                RoleCodes.ORGANIZATIONADMIN ? (
                  <DownloadTemplateDropdown isIcon={false} />
                ) : (
                  ""
                )}
                { JSON.parse(localStorage.userType) === RoleCodes.ORGANIZATIONADMIN ?
                   <DownloadEmissionFactors /> : null
                }
                <span
                  style={
                    JSON.parse(localStorage.userType) ===
                    RoleCodes.ORGANIZATIONADMIN
                      ? { display: "none" }
                      : {}
                  }
                >
                  <BulkUploadDropdown
                    isIcon={false}
                    uploadActivityCode={this.state.pendingUploadActivityCode}
                    uploadAIActivityCode={this.state.pendingAIActivityCode}
                    onActivityCodeConsumed={() =>
                      this.setState({
                        pendingUploadActivityCode: null,
                        pendingAIActivityCode: null,
                      })
                    }
                  />
                </span>
              </div>
            </div>
          </div>
        </div>
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
            style={{
              width: "100%",
              height: [0, 20, "0", "20"].includes(this.state.iframeHeight)
                ? "100vh"
                : `${this.state.iframeHeight}px`,
            }}
            loading="eager"
            onLoad={() => this.setState({ loader: false })}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default withStyles(navbarsStyle)(GHGActivity);
