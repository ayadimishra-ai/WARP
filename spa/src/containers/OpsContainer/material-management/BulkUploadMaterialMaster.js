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
import {
  materialMasterBulkUploadApiLink,
  materialMasterExcelUploadS3Link,
} from "./const";

const Statuses = {
  Failure: "failure",
  Success: "successful",
};

const cancelToken = axios.CancelToken;
let source = cancelToken.source();

const GHGEstimate_Link = GetGHGEstimationUrl();

class BulkUploadMaterialMaster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFileUploaded: false,
      open: false,
      selectedFile: null,
      uploadProgress: 0,
      showAlert: false,
      alertMessage: "",
      status: "",
      failureErrorPath: "",
      isGenericError: false,
      uploadSummary: null,
    };
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
  }

  async componentDidMount() {
    // Open modal immediately with data from props
    this.handleOpen(
      this.props.modalContent || "Material Master",
      this.props.templateUrl || ""
    );

    // Add dropdown overlay listener
    this.handleGlobalDropdownClose = this.handleGlobalDropdownClose.bind(this);
    document.addEventListener(
      "dropdownStateChange",
      this.handleGlobalDropdownClose
    );
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

  validateFile = (file) => {
    const validExtensions = [".xls", ".xlsx", ".csv"];
    const isValid = validExtensions.some((ext) => file.name.endsWith(ext));
    return isValid;
  };

  handleFileChange = async (event, file) => {
    const selectedFile = file;
    
    if (!selectedFile) {
      return;
    }

    if (!this.validateFile(selectedFile)) {
      this.setState({
        showAlert: true,
        alertMessage: "File format allow only .csv, .xls or .xlsx",
      });
      return;
    }

    this.setState({ showAlert: false });
    this.handleUpload(selectedFile);

    try {
      source = new cancelToken.source();
      this.setState({ loading: true });
      
      // Step 1: Get S3 upload URL
      const formData = new FormData();
      formData.append("organizationAddressId", this.props.organizationId);
      formData.append("files", selectedFile);
      
      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
          "x-sk-op-authorization": localStorage.opsToken,
        },
        cancelToken: source.token,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.min(
            Math.round((progressEvent.loaded * 100) / progressEvent.total),
            50 // First 50% for getting upload URL and uploading to S3
          );
          this.setState({ uploadProgress: percentCompleted });
        },
      };

      const uploadUrlResponse = await axios.post(
        GHGEstimate_Link + materialMasterExcelUploadS3Link,
        formData,
        config
      );

      if (uploadUrlResponse.data && uploadUrlResponse.data.data && uploadUrlResponse.data.data.length > 0) {
        const uploadData = uploadUrlResponse.data.data[0];
        const { uploadUrl, downloadUrl } = uploadData;
        
        // Step 2: Upload file to S3
        this.setState({ uploadProgress: 50 });
        
        const s3UploadConfig = {
          headers: {
            "Content-Type": selectedFile.type || "application/octet-stream",
            "Content-Length": selectedFile.size,
          },
          cancelToken: source.token,
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.min(
              50 + Math.round((progressEvent.loaded * 100) / progressEvent.total / 2),
              95 // 50% to 95% for S3 upload
            );
            this.setState({ uploadProgress: percentCompleted });
          },
        };

        await axios.put(uploadUrl, selectedFile, s3UploadConfig);
        
        // Step 3: Process the uploaded file using material master import API
        const processConfig = {
          headers: {
            "x-sk-op-authorization": localStorage.opsToken,
            "Content-Type": "application/json",
          },
        };

        const processPayload = {
          organizationId: this.props.organizationId,
          fileUrl: downloadUrl,
        };

        const processResponse = await axios.post(
          GHGEstimate_Link + materialMasterBulkUploadApiLink,
          processPayload,
          processConfig
        );

        // Handle response based on new API format
        if (processResponse.data && processResponse.data.success) {
          // Success case
          const summary = processResponse.data.data && 
            processResponse.data.data.status_data && 
            processResponse.data.data.status_data.summary;
          this.setState({
            uploadProgress: 100,
            status: Statuses.Success,
            isFileUploaded: true,
            uploadSummary: summary,
          });

          // Reload the material listing iframe if needed
          if (this.props.submitDataHandle) {
            setTimeout(() => {
              this.props.submitDataHandle();
            }, 1000);
          }
        } else {
          // Failure case
          const errorFileUrl = (processResponse.data && 
            processResponse.data.data && 
            processResponse.data.data.status_data && 
            processResponse.data.data.status_data.file_url) || "";
          const summary = processResponse.data.data && 
            processResponse.data.data.status_data && 
            processResponse.data.data.status_data.summary;
          this.setState({
            uploadProgress: 100,
            status: Statuses.Failure,
            failureErrorPath: errorFileUrl,
            isGenericError: !errorFileUrl,
            loading: false,
            uploadSummary: summary,
          });
        }
      }
    } catch (error) {
      console.error("Upload error:", error);
      
      let failurePath = "";
      let isGeneric = true;

      if (error.response && error.response.data) {
        // Check new API response format
        if (error.response.data.data && 
            error.response.data.data.status_data && 
            error.response.data.data.status_data.file_url) {
          failurePath = error.response.data.data.status_data.file_url;
          isGeneric = false;
        } else if (error.response.data.errorFilePath) {
          failurePath = error.response.data.errorFilePath;
          isGeneric = false;
        }
      }

      this.setState({
        uploadProgress: 100,
        status: Statuses.Failure,
        failureErrorPath: failurePath,
        isGenericError: isGeneric,
        loading: false,
      });
    } finally {
      this.setState({ loading: false });
    }
  };

  handleDrop = (event) => {
    event.preventDefault();

    const file = event.dataTransfer.files[0];
    if (file && this.validateFile(file)) {
      this.setState({ showAlert: false });
      this.handleFileChange(event, file);
    } else if (file) {
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
      selectedFile: file,
      uploadProgress: 20,
    });
  };

  handleUploadAnotherDocument = () => {
    this.setState({
      selectedFile: null,
      uploadProgress: 0,
      isGenericError: false,
      status: "",
      failureErrorPath: "",
      uploadSummary: null,
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
      status: "",
      uploadSummary: null,
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

  handleDownloadTemplate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    try {
      const opConfig = {
        headers: {
          "x-sk-op-authorization": localStorage.opsToken,
          "Content-Type": "application/json",
        },
      };

      const response = await axios.get(
        GHGEstimate_Link + "api/v1/master-data/activity/material_master/download-template",
        opConfig
      );

      if (response.data && response.data.success && response.data.response && response.data.response.url) {
        const link = document.createElement("a");
        link.href = response.data.response.url;
        link.target = "_blank";
        link.rel = "noopener noreferrer";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        console.error("Template URL not found in response");
      }
    } catch (error) {
      console.error("Error downloading template:", error);
    }
  };

  handleDownloadErrorLogs = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (this.state.failureErrorPath) {
      try {
        // Fetch the file as blob to allow custom filename
        const response = await fetch(this.state.failureErrorPath);
        const blob = await response.blob();
        
        // Create blob URL and download with custom name
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = blobUrl;
        link.download = "MaterialMaster_ErrorLogs.xlsx";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        // Clean up blob URL
        window.URL.revokeObjectURL(blobUrl);
      } catch (error) {
        console.error("Error downloading error logs:", error);
        // Fallback to direct download
        const link = document.createElement("a");
        link.href = this.state.failureErrorPath;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    }
  };

  render() {
    const {
      open,
      selectedFile,
      uploadProgress,
      showAlert,
      alertMessage,
      status,
    } = this.state;
    
    const { modalContent, templateUrl } = this.props;

    let progressText = "";
    let progressTextColor = "#666666";
    let progressBarColor = "#122f47";

    if (uploadProgress === 100 && status === Statuses.Success) {
      progressText = "File Uploaded Successfully";
      progressTextColor = "#00B41D";
      progressBarColor = "#00B41D";
    } else if (uploadProgress === 100 && status === Statuses.Failure) {
      progressText = this.state.isGenericError
        ? "File Upload Failed"
        : "File Upload Failed - ";
      progressTextColor = "#D32F2F";
      progressBarColor = "#D32F2F";
    } else if (uploadProgress < 100 && uploadProgress > 0) {
      progressText = "Uploading...";
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
                <h4>Bulk Upload Material Data</h4>
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
                            accept=".csv,.xls,.xlsx"
                          />
                          <h4 className="dragText">Drag & Drop File</h4>
                          <p className="dragPara">
                            Supported file formats: .csv, .xls or .xlsx
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
                            {uploadProgress === 100 &&
                            status === Statuses.Failure
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
                            className="completedText"
                            style={{
                              color: progressTextColor,
                              textWrap: "nowrap",
                            }}
                          >
                            {progressText}{" "}
                            {uploadProgress === 100 &&
                            status === Statuses.Failure &&
                            !this.state.isGenericError ? (
                              <span
                                style={{ color: "#1c9689", cursor: "pointer", textDecoration: "underline" }}
                                onClick={this.handleDownloadErrorLogs}
                              >
                                Download Error Logs
                              </span>
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
                        <img alt="document" src={DocumentIcon} width="24px" />
                        <p>Material Master</p>
                      </Paper>
                      <span
                        onClick={this.handleDownloadTemplate}
                        style={{ cursor: "pointer" }}
                      >
                        <img alt="download" src={DownloadIcon} width="24px" />
                      </span>
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
    )(BulkUploadMaterialMaster)
  )
);
