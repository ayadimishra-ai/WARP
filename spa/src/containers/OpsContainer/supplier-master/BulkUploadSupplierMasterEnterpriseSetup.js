import { Fade, Modal, Paper, withStyles } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import axios from "axios";
import React from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import CloudIcon from "../../../assets/img/cloudIcon.svg";
import DocumentIcon from "../../../assets/img/document.svg";
import DownloadIcon from "../../../assets/img/download.svg";
import navbarsStyle from "../../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import Button from "../../../components/Material/CustomButtons/Button";
import { GetGHGEstimationUrl } from "../../../config";
import { decodeOpAccessToken } from "../../../utility";
import {
  supplierMasterBulkUploadApiLinkEnterpriseSetup,
  supplierMasterExcelUploadS3LinkEnterpriseSetup,
} from "./const";

const Statuses = {
  Failure: "failure",
  Success: "successful",
};
const cancelToken = axios.CancelToken;
let source = cancelToken.source();

const GHGEstimate_Link = GetGHGEstimationUrl();

const DEFAULT_ACTIVITY = {
  activity: "Supplier Master",
  downloadLink: "",
};

const matchesSupplierMasterActivity = ({ activity = "", activity_code = "", section = "" }) => {
  const normalizedValues = [activity, activity_code, section].map((value) =>
    String(value).toLowerCase()
  );

  return normalizedValues.some(
    (value) =>
      value.includes("supplier") ||
      value.includes("general details") ||
      value === "general"
  );
};

class BulkUploadSupplierMasterEnterpriseSetup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFileUploaded: false,
      open: false,
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
      isAIModalOpen: false,
      shouldRedirect: false,
      selectedActivity: null,
    };
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
  }

  async componentDidMount() {
    this.handleGlobalDropdownClose = this.handleGlobalDropdownClose.bind(this);
    document.addEventListener(
      "dropdownStateChange",
      this.handleGlobalDropdownClose
    );

    const decodedToken = decodeOpAccessToken(localStorage.opsToken);

    const organizationId =
      decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];

    this.setState({ organizationId: organizationId });

    const formData = {
      organizationId: organizationId,
      userId: decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
      isMasterActivityRequired:true
    };
    const opConfig = {
      headers: {
        "x-sk-op-authorization": localStorage.opsToken,
        "Content-Type": "application/json",
      },
    };

    try {
      const response = await axios.post(
        GetGHGEstimationUrl() + "api/v1/users/activity-permissions",
        formData,
        opConfig
      );
      console.log("response new", response);
      const activities = (response.data.data || [])
         .filter((item) =>
        item.main_activity
          .toLowerCase()
          .includes("supplier_master".toLowerCase())
      )
        .map((item) => ({
          activity: item.label,
          activityHeader: item.label,
          activity_code: item.sub_activity,
          section: item.main_activity,
          downloadLink: item.template_link,
        }));
        console.log("activities", activities);
      const initialActivity =
        activities.find(matchesSupplierMasterActivity) ||
        activities[0] ||
        DEFAULT_ACTIVITY;

      this.setState({ activities: activities });
      this.handleOpen(initialActivity.activity, initialActivity.downloadLink);
    } catch (error) {
      this.setState({ activities: [] });
      this.handleOpen(
        DEFAULT_ACTIVITY.activity,
        DEFAULT_ACTIVITY.downloadLink
      );
    }
  }

  componentWillUnmount() {
    document.removeEventListener(
      "dropdownStateChange",
      this.handleGlobalDropdownClose
    );
  }

  handleGlobalDropdownClose(event) {
    // Close this dropdown if the event is from overlay
    if (event.detail.dropdownId === "overlay-close" && this.state.open) {
      this.handleClose();
    }
  }

  handleFileChange = async (event, file) => {
    const selectedFile = file;
    if (
      selectedFile &&
      (selectedFile.name.endsWith(".xls") ||
        selectedFile.name.endsWith(".xlsx") ||
        selectedFile.name.endsWith(".csv"))
    ) {
      this.handleUpload(selectedFile);
      this.setState({ showAlert: false });
      try {
        source = new cancelToken.source();
        this.setState({ loading: true });
        const formData = new FormData();
        // formData.append("organizationAddressId", this.state.location);
        formData.append("files", selectedFile);
        var config = {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-sk-op-authorization": localStorage.opsToken,
          },
          cancelToken: source.token,
          onUploadProgress: (progressEvent) => {
            this.setState({
              uploadProgress: 50,
            });
          },
        };
        await axios
          .post(
            GHGEstimate_Link + supplierMasterExcelUploadS3LinkEnterpriseSetup,
            formData,
            config
          )
          .then(async (response) => {
            let ApiURL = supplierMasterBulkUploadApiLinkEnterpriseSetup;
            const uploadFileURL = response.data.data[0].uploadUrl;
            const downloadURL = response.data.data[0].downloadUrl;
            this.setState({ loading: false, uploadedFilePath: downloadURL });
            await axios
              .put(uploadFileURL, selectedFile, {
                headers: { "Content-Type": selectedFile.type },
                cancelToken: source.token,
                onUploadProgress: (progressEvent) => {
                  this.setState({
                    uploadProgress: 80,
                  });
                },
              })
              .then(async (response) => {
                console.log("response_put", response);
                var configExcel = {
                  headers: {
                    "x-sk-op-authorization": localStorage.opsToken,
                  },
                  cancelToken: source.token,
                };
                await axios
                  .post(
                    GHGEstimate_Link + ApiURL,
                    {
                      fileUrl: downloadURL,
                      //   organizationAddressId: this.state.location,
                    },
                    configExcel
                  )
                  .then((response) => {
                    console.log("response_apiURL", response);
                    const dataImportDetail = response.data.data;
                    let uploadFilePathDetail = "";
                    if (dataImportDetail.status === Statuses.Failure) {
                      uploadFilePathDetail =
                        dataImportDetail.status_data.file_url;
                    } else {
                      uploadFilePathDetail = dataImportDetail.file_url;
                      this.setState({ isFileUploaded: true });
                    }
                    this.setState({
                      loading: false,
                      failureErrorPath: uploadFilePathDetail,
                      status: dataImportDetail.status,
                      selectedFile: selectedFile,
                      uploadProgress: 100,
                    });
                    if (document.getElementById("supplierMasterListing")) {
                      let iFrame = document.getElementById(
                        "supplierMasterListing"
                      );

                      iFrame.contentWindow.postMessage(
                        JSON.stringify({
                          type: "manual-upload",
                        }),
                        GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"
                      );

                      iFrame.src = iFrame.src;
                    }
                  })
                  .catch((err) => {
                    if (axios.isCancel(err)) {
                      this.resetCancelUpload();
                      console.log("Upload canceled:", err.message);
                    } else {
                      this.setState({
                        isGenericError: true,
                        status: Statuses.Failure,
                        loading: false,
                        uploadProgress: 100,
                      });
                      console.log(err);
                    }
                  });
              })
              .catch((err) => {
                if (axios.isCancel(err)) {
                  this.resetCancelUpload();
                  console.log("Upload canceled2:", err.message);
                } else {
                  this.setState({
                    isGenericError: true,
                    status: Statuses.Failure,
                    loading: false,
                    uploadProgress: 100,
                  });
                  console.log(err);
                }
              });
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              this.resetCancelUpload();
              console.log("Upload canceled1:", err.message);
            } else {
              this.setState({
                isGenericError: true,
                status: Statuses.Failure,
                loading: false,
                uploadProgress: 100,
              });
              console.log(err);
            }
          });
      } catch (error) {
        this.setState({ loading: false, uploadProgress: 100 });
      } finally {
        this.setState({ loading: false });
      }
      // Trigger the upload process immediately after choosing the file
    } else {
      // Handle invalid file type (not .xls)
      this.setState({
        showAlert: true,
        alertMessage: "File format allow only .csv, .xls or .xlsx",
      });
    }
  };

  handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    if (
      file &&
      (file.name.endsWith(".xls") ||
        file.name.endsWith(".xlsx") ||
        file.name.endsWith(".csv"))
    ) {
      this.setState({ showAlert: false });

      // Trigger the upload process immediately after choosing the file
      this.handleFileChange(event, file);
      //this.handleUpload(file);
    } else {
      // Handle invalid file type (not .xls)
      this.setState({
        showAlert: true,
        alertMessage: "File format allow only .csv, .xls or .xlsx",
      });
    }
  };

  handleDragOver(event) {
    event.preventDefault();
  }

  handleOpen = (modalContent, uploadedFilePath) => {
    this.setState({
      open: true,
      modalContent: modalContent,
      uploadedFilePath: uploadedFilePath,
    });

    // Emit dropdown open event
    const openEvent = new CustomEvent("dropdownStateChange", {
      detail: { isOpen: true, dropdownId: "bulk-upload-dropdown" },
    });
    document.dispatchEvent(openEvent);

    if (this.props.closefunction) {
      this.props.closefunction();
    }
  };

  handleUpload = (file) => {
    this.setState({
      uploadProgress: 20,
    });
  };

  handleUploadAnotherDocument = () => {
    this.setState({
      selectedFile: null,
      uploadProgress: 0,
      isGenericError: false,
    });
  };

  handleClose = () => {
    this.cancelUpload();
    this.props.hideBulkUploadPopup();
    // Reset the state when closing the modal
    this.setState({
      open: false,
      selectedFile: null,
      uploadProgress: 0,
      showAlert: false,
      alertMessage: "",
      isGenericError: false,
    });

    // Emit dropdown close event
    const closeEvent = new CustomEvent("dropdownStateChange", {
      detail: { isOpen: false, dropdownId: "bulk-upload-dropdown" },
    });
    document.dispatchEvent(closeEvent);

    if (this.state.isFileUploaded && this.props.submitDataHandle) {
      this.props.submitDataHandle();
      this.setState({ isFileUploaded: false });
    }
  };

  resetCancelUpload = () => {
    clearTimeout(this.uploadTimeout);
    // Reset the state to cancel the upload
    this.setState({
      selectedFile: null,
      uploadProgress: 0,
      isGenericError: false,
    });
  };

  cancelUpload = () => {
    source.cancel("File upload canceled by user.");
    this.resetCancelUpload();
  };

  render() {
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
        progressText = "File Uploaded Successfully";
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
        progressBarColor = "#122f47";
        progressText = "Please wait file is uploading...";
        break;
      default:
        progressBarColor = "#122f47";
        progressTextColor = "#666666";
        progressText = "";
    }

    return (
      <>
        <Modal
          open={open}
          onClose={this.handleClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          className="ghgmodal"
        >
          <Fade in={open}>
            <div className="ghgmodalBox">
              <div className="ghgmodalHeader">
                <h4>Bulk Upload Data</h4>
                <CloseIcon onClick={this.handleClose} />
              </div>
              <div className="ghgmodalBody">
                <>
                  <Paper elevation={0} className={`ghgUploadBox location`}>
                    <Paper
                      onDrop={this.handleDrop}
                      onDragOver={this.handleDragOver}
                      elevation={0}
                      className="uploadfile"
                    >
                      {!uploadProgress ? (
                        <Paper elevation={0} className="bulkUploadNotes">
                          <img alt="cloud" src={CloudIcon} width="80px" />
                          <input
                            type="file"
                            id="fileInput"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              this.handleFileChange(e, e.target.files[0])
                            }
                          />
                          <h4 className="dragText">Drag & Drop File</h4>
                          <p className="dragPara">
                            Supported file formats: .csv or .xls
                            <br />
                            For easy upload, download the template below
                          </p>
                          {showAlert && (
                            <div className="ghgfilerror">{alertMessage}</div>
                          )}
                        </Paper>
                      ) : (
                        <Paper elevation={0} className="ghgProgressBar">
                          <p className="completed">
                            {this.state.uploadProgress === 100 &&
                            this.state.status === Statuses.Failure
                              ? "File Upload Failed"
                              : uploadProgress + "% Completed"}
                          </p>
                          <Paper elevation={0} className="progress-container">
                            <Paper
                              elevation={0}
                              className="progress-bar"
                              style={{
                                position: "absolute",
                                backgroundColor: "#E0E0E0",
                                zIndex: "1",
                                top: 0,
                                left: 0,
                                width: "100%",
                              }}
                            />
                            <Paper
                              elevation={0}
                              className="progress-bar"
                              style={{
                                position: "absolute",
                                backgroundColor: progressBarColor,
                                zIndex: "999",
                                top: 0,
                                left: 0,
                                width: `${uploadProgress}%`,
                              }}
                            />
                          </Paper>

                          <p
                            class="completedText"
                            style={{
                              color: progressTextColor,
                              textWrap: "nowrap",
                            }}
                          >
                            {progressText}{" "}
                            {this.state.uploadProgress === 100 &&
                            this.state.status === Statuses.Failure &&
                            !this.state.isGenericError ? (
                              <a
                                target="_blank"
                                style={{ color: "#1c9689" }}
                                onClick={(e) => e.stopPropagation()}
                                href={this.state.failureErrorPath}
                              >
                                Download Error Logs
                              </a>
                            ) : (
                              ""
                            )}
                          </p>
                        </Paper>
                      )}
                      {uploadProgress === 100 && status === Statuses.Success && (
                        <Button
                          className="outline_btn_new"
                          onClick={this.handleUploadAnotherDocument}
                        >
                          Upload Another Document
                        </Button>
                      )}
                      {uploadProgress === 100 && status === Statuses.Failure && (
                        <Button
                          className="outline_btn_new"
                          onClick={this.handleUploadAnotherDocument}
                        >
                          Upload Again
                        </Button>
                      )}

                      {uploadProgress !== 100 && (
                        <Button
                          component="span"
                          className={
                            uploadProgress > 0
                              ? "outline_btn_new"
                              : "solid_btn_new"
                          }
                          disabled={false}
                          onClick={
                            uploadProgress > 0
                              ? this.cancelUpload
                              : () =>
                                  document.getElementById("fileInput").click()
                          }
                        >
                          {uploadProgress > 0
                            ? "Cancel Uploading"
                            : "Choose File"}
                        </Button>
                      )}
                    </Paper>
                    <Paper elevation={0} className="downloadtemplate">
                      <Paper elevation={0} className="name">
                        <img alt="cloud" src={DocumentIcon} width="24px" />
                        <p>{selectedFile ? selectedFile.name : modalContent}</p>
                      </Paper>
                      {this.state.uploadedFilePath !== "" ? (
                        <a
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => e.stopPropagation()}
                          href={this.state.uploadedFilePath}
                        >
                          <img alt="cloud" src={DownloadIcon} width="24px" />
                        </a>
                      ) : (
                        <img alt="cloud" src={DownloadIcon} width="24px" />
                      )}
                    </Paper>
                  </Paper>
                </>
              </div>
            </div>
          </Fade>
        </Modal>
      </>
    );
  }
}

export default withRouter(
  withStyles(navbarsStyle)(
    connect(
      null,
      {}
    )(BulkUploadSupplierMasterEnterpriseSetup)
  )
);
