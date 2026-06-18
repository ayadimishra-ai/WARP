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

const Statuses = {
  Failure: "failure",
  Success: "successful",
};

const cancelToken = axios.CancelToken;
let source = cancelToken.source();

const GHGEstimate_Link = GetGHGEstimationUrl();
const SUPPLIER_LOCATION_MASTER_EXCEL_UPLOAD_S3_LINK =
  "api/v1/file-system/get-s3-upload-url/master-data-excel-import";
const SUPPLIER_LOCATION_MASTER_BULK_UPLOAD_API_LINK =
  "api/v1/master-data/org-supplier-location-master/excel";

const SUPPLIER_LOCATION_MASTER_TEMPLATE_API_LINK = "api/v1/master-data/org-supplier-location-master/template";

class BulkUploadSupplierLocationMaster extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isFileUploaded: false,
      open: true,
      selectedFile: null,
      uploadProgress: 0,
      showAlert: false,
      alertMessage: "",
      status: "",
      uploadedFilePath: "",
      failureErrorPath: "",
      isGenericError: false,
      loading: false,
    };
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
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
        formData.append("files", selectedFile);
        const config = {
          headers: {
            "Content-Type": "multipart/form-data",
            "x-sk-op-authorization": localStorage.opsToken,
          },
          cancelToken: source.token,
          onUploadProgress: () => {
            this.setState({ uploadProgress: 50 });
          },
        };
        await axios
          .post(GHGEstimate_Link + SUPPLIER_LOCATION_MASTER_EXCEL_UPLOAD_S3_LINK, formData, config)
          .then(async (response) => {
            const uploadFileURL = response.data.data[0].uploadUrl;
            const downloadURL = response.data.data[0].downloadUrl;
            this.setState({ loading: false, uploadedFilePath: downloadURL });
            await axios
              .put(uploadFileURL, selectedFile, {
                headers: { "Content-Type": selectedFile.type },
                cancelToken: source.token,
                onUploadProgress: () => {
                  this.setState({ uploadProgress: 80 });
                },
              })
              .then(async () => {
                const configExcel = {
                  headers: { "x-sk-op-authorization": localStorage.opsToken },
                  cancelToken: source.token,
                };
                await axios
                  .post(
                    GHGEstimate_Link + SUPPLIER_LOCATION_MASTER_BULK_UPLOAD_API_LINK,
                    { fileUrl: downloadURL },
                    configExcel
                  )
                  .then((response) => {
                    const dataImportDetail = response.data.data;
                    let uploadFilePathDetail = "";
                    if (dataImportDetail.status === Statuses.Failure) {
                      uploadFilePathDetail = dataImportDetail.status_data.file_url;
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
                    if (document.getElementById("supplierLocationMasterListing")) {
                      const iFrame = document.getElementById("supplierLocationMasterListing");
                      iFrame.contentWindow.postMessage(
                        JSON.stringify({ type: "bulk-page-refresh" }),
                        GHGEstimate_Link ? new URL(GHGEstimate_Link).origin : "*"
                      );
                    }
                  })
                  .catch((err) => {
                    if (axios.isCancel(err)) {
                      this.resetCancelUpload();
                    } else {
                      this.setState({
                        isGenericError: true,
                        status: Statuses.Failure,
                        loading: false,
                        uploadProgress: 100,
                      });
                    }
                  });
              })
              .catch((err) => {
                if (axios.isCancel(err)) {
                  this.resetCancelUpload();
                } else {
                  this.setState({
                    isGenericError: true,
                    status: Statuses.Failure,
                    loading: false,
                    uploadProgress: 100,
                  });
                }
              });
          })
          .catch((err) => {
            if (axios.isCancel(err)) {
              this.resetCancelUpload();
            } else {
              this.setState({
                isGenericError: true,
                status: Statuses.Failure,
                loading: false,
                uploadProgress: 100,
              });
            }
          });
      } catch (error) {
        this.setState({ loading: false, uploadProgress: 100 });
      } finally {
        this.setState({ loading: false });
      }
    } else {
      this.setState({
        showAlert: true,
        alertMessage: "File format allow only .csv, .xls or .xlsx",
      });
    }
  };

  handleTemplateDownload = async () => {
    try {
      const response = await axios.get(GHGEstimate_Link + SUPPLIER_LOCATION_MASTER_TEMPLATE_API_LINK, {
        headers: { "x-sk-op-authorization": localStorage.opsToken },
      });

      if (response && response.data && response.data.success && response.data.data && response.data.data.url) {
        const url = response.data.data.url;

        const urlPath = new URL(url).pathname;
        const filename = urlPath.substring(urlPath.lastIndexOf("/") + 1);

        const link = document.createElement("a");
        link.href = url;
        link.setAttribute("download", filename || "SupplierLocationMaster.xlsx");
        link.setAttribute("target", "_blank");
        document.body.appendChild(link);
        link.click();
        link.remove();
      }
    } catch (error) {
      console.error("Template download failed", error);
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
      this.handleFileChange(event, file);
    } else {
      this.setState({
        showAlert: true,
        alertMessage: "File format allow only .csv, .xls or .xlsx",
      });
    }
  };

  handleDragOver(event) {
    event.preventDefault();
  }

  handleUpload = () => {
    this.setState({ uploadProgress: 20 });
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
    this.setState({
      open: false,
      selectedFile: null,
      uploadProgress: 0,
      showAlert: false,
      alertMessage: "",
      isGenericError: false,
    });
  };

  resetCancelUpload = () => {
    clearTimeout(this.uploadTimeout);
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
    const { open, selectedFile, uploadProgress, showAlert, alertMessage, status } =
      this.state;

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
          progressText = "Something went wrong on our end. Please try again later.";
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
                <Paper elevation={0} className="ghgUploadBox location">
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
                          id="supplierLocationMasterFileInput"
                          style={{ display: "none" }}
                          onChange={(e) => this.handleFileChange(e, e.target.files[0])}
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
                          className="completedText"
                          style={{ color: progressTextColor, textWrap: "nowrap" }}
                        >
                          {progressText}{" "}
                          {this.state.uploadProgress === 100 &&
                            this.state.status === Statuses.Failure &&
                            !this.state.isGenericError ? (
                            <a
                              target="_blank"
                              rel="noopener noreferrer"
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
                        className={uploadProgress > 0 ? "outline_btn_new" : "solid_btn_new"}
                        disabled={false}
                        onClick={
                          uploadProgress > 0
                            ? this.cancelUpload
                            : () => document.getElementById("supplierLocationMasterFileInput").click()
                        }
                      >
                        {uploadProgress > 0 ? "Cancel Uploading" : "Choose File"}
                      </Button>
                    )}
                  </Paper>
                  <Paper
                    elevation={0}
                    className="downloadtemplate"
                    onClick={this.handleTemplateDownload}
                    style={{ cursor: "pointer" }}
                  >
                    <Paper elevation={0} className="name">
                      <img alt="document" src={DocumentIcon} width="24px" />
                      <p>{selectedFile ? selectedFile.name : "Supplier Location Details"}</p>
                    </Paper>
                    <img alt="download" src={DownloadIcon} width="24px" style={{ opacity: 0.4 }} />
                  </Paper>
                </Paper>
              </div>
            </div>
          </Fade>
        </Modal>
      </>
    );
  }
}

export default withRouter(
  withStyles(navbarsStyle)(connect(null, {})(BulkUploadSupplierLocationMaster))
);
