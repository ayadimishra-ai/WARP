import React, { Component } from "react";
import { Redirect } from "react-router";
import {
  GetGHGEstimationUrl,
  getWebsiteUrl,
  getUserPermision,
  getServiceUrl,
} from "../../config";
import { withStyles } from "@material-ui/core/styles";
import { BreadCrumb, decodeOpAccessToken } from "../../utility";
import { Divider, Fade, Modal, Paper } from "@material-ui/core";
import CustomDropdown from "../../components/Material/CustomDropdown/CustomDropdown";
import Button from "../../components/Material/CustomButtons/Button";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import CloseIcon from "@material-ui/icons/Close";
import CloudIcon from "../../assets/img/cloudIcon.svg";
import DownloadIcon from "../../assets/img/download.svg";
import DocumentIcon from "../../assets/img/document.svg";
import * as PageKeys from "../../pagekeys";
import axios from "axios";
import Spinner from "../../UI/Spinner/Spinner";

const GHGEstimate_Link = GetGHGEstimationUrl();

const activites = [
  {
    activity: "General Details",
    activityHeader: "General Details",
    activity_code: "general",
    section: "general",
    downloadLink: getWebsiteUrl() + "ops/GeneralDetails.xlsx",
  },
  {
    activity: "Grid Power",
    activityHeader: "Energy-Grid",
    activity_code: "energy_grid_power",
    section: "energy",
    downloadLink: getWebsiteUrl() + "ops/GridPower.xlsx",
  },
  {
    activity: "Captive Power",
    activityHeader: "Energy - Captive Power",
    activity_code: "energy_captive_power",
    section: "energy",
    downloadLink: getWebsiteUrl() + "ops/CaptivePower.xlsx",
  },
  {
    activity: "Fuel Consumption",
    activityHeader: "Fuel Consumption",
    activity_code: "energy_fuel_purchased",
    section: "energy",
    downloadLink: getWebsiteUrl() + "ops/FuelPurchased.xlsx",
  },
  {
    activity: "Employee Travel",
    activityHeader: "Employee Travel",
    activity_code: "transport_employee_travel",
    section: "transport",
    downloadLink: getWebsiteUrl() + "ops/EmployeeTravel.xlsx",
  },
  {
    activity: "Business Travel",
    activityHeader: "Business Travel",
    activity_code: "transport_business_travel",
    section: "transport",
    downloadLink: getWebsiteUrl() + "ops/BusinessTravel.xlsx",
  },
  {
    activity: "Waste",
    activityHeader: "Waste Data",
    activity_code: "waste",
    section: "waste",
    downloadLink: getWebsiteUrl() + "ops/WasteDataTracking.xlsx",
  },
];

const Statuses = {
  Failure: "failure",
  Success: "successful",
};

const cancelToken = axios.CancelToken;
let source = cancelToken.source();
class GHGPOC extends Component {
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
      iframeHeight: 500,
      loader: true,
    };
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
  }

  componentDidMount() {
    this.setState({ jwtToken: localStorage.opsToken }, async () => {
      const decodedToken = decodeOpAccessToken(this.state.jwtToken);
      const activityPermissions = await this.getActivityPermission(decodedToken);
      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      this.setState({ organizationId: organizationId });
      const result = activityPermissions.map((a) => {
        return [...new Set(a.activities)];
      });

      const organizationAddressIds = activityPermissions.map((a) => {
        return a.organization_address_id;
      });

      const orgAddressIdsWithActivities = activityPermissions.map((a) => {
        return {
          organizationAddressId: a.organization_address_id,
          activities: a.activities,
        };
      });

      const data = {
        OpsOrganizationAddressId: organizationAddressIds,
        UserGuid: localStorage.userId,
      };

      var config = {
        headers: {
          Authorization: "Bearer " + localStorage.tokenId,
          "Content-Type": "application/json",
        },
      };

      axios
        .post(getServiceUrl() + "Ops/GetOrganizationAddress", data, config)
        .then((response) => {
          this.setState({ activityLocations: response.data });
        });

      const uniqueArray = result.flat().filter(function (item, pos) {
        return result.flat().indexOf(item) === pos;
      });
      const finalActivitiesArray = activites
        .filter((m) => uniqueArray.includes(m.section))
        .map(({ activity, downloadLink, activityHeader }) => ({
          activity,
          downloadLink,
          activityHeader,
        }));
      this.setState({ bulkData: finalActivitiesArray });
      this.setState({
        orgAddressIdsWithActivities: orgAddressIdsWithActivities,
      });
    });

    window.addEventListener("message", (event) => {
      event.preventDefault();
      if (!isNaN(event.data)) {
        if (this.state.iframeHeight !== event.data) {
          this.setState({ iframeHeight: event.data + 20 });
        }
      } else if (event.data.name === "ghgForms") {
        this.props.history.push({
          pathname: "/ghg-forms",
          state: {
            loc: event.data.location,
            date: event.data.date,
            id: event.data.id,
          },
        });
      }
    });
  }

  handleOpen = (modalContent, uploadedFilePath) => {
    const selectedActivity = activites.filter(
      (d) => d.activity === modalContent
    )[0].section;

    const activityWiseLocation = this.state.orgAddressIdsWithActivities.filter(
      (rec) => rec.activities.find((d) => d === selectedActivity)
    );

    const menuItems = [];

    this.state.activityLocations.forEach((rec) => {
      activityWiseLocation.forEach((a) => {
        if (
          a.organizationAddressId === rec.organizationAddressId.toLowerCase()
        ) {
          menuItems.push({
            label: rec.location,
            value: String(rec.organizationAddressId).toLowerCase(),
          });
        }
      });
    });

    this.setState({ locationList: menuItems });

    if (menuItems.length === 1) {
      this.setState({
        location: menuItems[0].value,
        selectedFile: null,
        uploadProgress: 0,
        showAlert: false,
        alertMessage: "",
        isGenericError: false,
      });
    }
    this.setState({
      open: true,
      modalContent: modalContent,
      uploadedFilePath: uploadedFilePath,
    });
  };

  handleClose = () => {
    this.cancelUpload();
    // Reset the state when closing the modal
    this.setState({
      open: false,
      location: "",
      selectedFile: null,
      uploadProgress: 0,
      showAlert: false,
      alertMessage: "",
      isGenericError: false,
    });
  };

  handleChange = (event) => {
    const newLocation = String(event.target.value).toLowerCase();
    this.labelShrink();

    this.setState(
      (prevState) => ({
        location: newLocation,
        selectedFile: null,
        uploadProgress: 0,
        showAlert: false,
        alertMessage: "",
        isGenericError: false,
      }),
      (afterState) => {
        console.log("this.state.location 170 - ", this.state.location);
      }
    );

    console.log("this.state.location 173 - ", this.state.location);
  };

  handleDragOver(event) {
    event.preventDefault();
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
        formData.append("organizationAddressId", this.state.location);
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
            GHGEstimate_Link +
            "api/v1/file-system/get-s3-upload-url/activity-excel-import",
            formData,
            config
          )
          .then(async (response) => {
            console.log(response);

            let type = this.state.modalContent;
            let ApiURL = "";
            if (type === "General Details") {
              ApiURL = "api/v1/ghg-data-import/transaction/general/excel";
            }
            if (type === "Grid Power") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/energy-grid-power/excel";
            }
            if (type === "Captive Power") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/energy-captive-power/excel";
            }
            if (type === "Fuel Consumption") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/energy-fuel-purchased/excel";
            }
            if (type === "Employee Travel") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/transport-employee-travel/excel";
            }
            if (type === "Business Travel") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/transport-business-travel/excel";
            }
            if (type === "Waste") {
              ApiURL = "api/v1/ghg-data-import/transaction/waste/excel";
            }
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
                      organizationAddressId: this.state.location,
                    },
                    configExcel
                  )
                  .then((response) => {
                    console.log("response_apiURL", response);
                    const dataImportDetail = response.data.data;
                    let uploadFilePathDetail = "";
                    if (dataImportDetail.status === Statuses.Failure)
                      uploadFilePathDetail =
                        dataImportDetail.status_data.file_url;
                    else uploadFilePathDetail = dataImportDetail.file_url;
                    this.setState({
                      loading: false,
                      failureErrorPath: uploadFilePathDetail,
                      status: dataImportDetail.status,
                      selectedFile: selectedFile,
                      uploadProgress: 100,
                    });

                    let iFrame = document.getElementById("listIframe1");
                    iFrame.src = iFrame.src;
                    // iFrame.contentWindow.postMessage(JSON.stringify({
                    //     type: "bulk-page-refresh",
                    // }), "*"
                    // );
                  })
                  .catch((err) => {
                    if (axios.isCancel(err)) {
                      this.resetCancelUpload();
                      console.log("Upload canceled3:", err.message);
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
    if (!this.state.location) {
      return;
    }

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

  handleUpload = (file) => {
    this.setState({
      uploadProgress: 20,
    });
    // const simulateUpload = () => {
    //     if (this.state.uploadProgress < 100 && !this.state.isGenericError) {
    //         this.setState((prevState) => ({
    //             uploadProgress: prevState.uploadProgress + 10,
    //         }));
    //         this.uploadTimeout = setTimeout(simulateUpload, 500);
    //     } else {
    //         //const isSuccess = Math.random() < 1;

    //         clearTimeout(this.uploadTimeout);
    //         // const status = isSuccess ? Statuses.Success : Statuses.Failure;
    //         // this.setState({
    //         //     status,
    //         // });
    //     }
    // };
    // this.uploadTimeout = setTimeout(simulateUpload, 500);
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

  handleUploadAnotherDocument = () => {
    this.setState({
      selectedFile: null,
      uploadProgress: 0,
      isGenericError: false,
    });
  };

  labelShrink = () => {
    this.setState({ shrink: true });
  };

  iframeUrl = () => {
    return GHGEstimate_Link + "embed/v1/ghg-emission";
  };

  generateListItems = (buttonText, action) => {
    return this.state.bulkData.length !== 0 ? (
      <CustomDropdown
        customId={buttonText.replace(/ /g, "_")}
        caret={false}
        noLiPadding
        hoverColor="dark"
        dropPlacement={"bottom-end"}
        buttonText={
          <Button
            className={"secondarydBtn"}
            type="button"
            style={{
              margin: 0,
            }}
          >
            {buttonText}
          </Button>
        }
        buttonProps={{
          color: "transparent",
        }}
        dropdownList={this.generateDropdownItems(action)}
      />
    ) : (
      <></>
    );
  };
  generateDropdownItems = (action) => {
    return this.state.bulkData.map((item, index) => (
      <React.Fragment key={index}>
        <a
          href="#"
          className={this.props.classes.dropdownLink}
          onClick={(e) => {
            e.preventDefault();
            if (action === "upload") {
              this.handleOpen(item.activity, item.downloadLink);
            } else {
              item.activity.toLowerCase() === "business travel" &&
                window.open(item.downloadLink, "_blank");
              item.activity.toLowerCase() === "employee travel" &&
                window.open(item.downloadLink, "_blank");
              item.activity.toLowerCase() === "captive power" &&
                window.open(item.downloadLink, "_blank");
              item.activity.toLowerCase() === "fuel consumption" &&
                window.open(item.downloadLink, "_blank");
              item.activity.toLowerCase() === "general details" &&
                window.open(item.downloadLink, "_blank");
              item.activity.toLowerCase() === "grid power" &&
                window.open(item.downloadLink, "_blank");
              item.activity.toLowerCase() === "waste" &&
                window.open(item.downloadLink, "_blank");
            }
          }}
          style={{
            width: "200px",
          }}
        >
          {item.activityHeader}
        </a>
        {index !== this.state.bulkData.length - 1 && (
          <Divider
            style={{
              backgroundColor: "#e3e3e3",
              marginLeft: "13px",
              height: 1.5,
            }}
            variant="middle"
          />
        )}
      </React.Fragment>
    ));
  };

  getActivityPermission = async (decodedToken) => {
    const formData = {
      organizationId:
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
      userId:
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
    };
    const opConfig = {
      headers: {
        "x-sk-op-authorization": localStorage.opsToken,
        "Content-Type": "application/json",
      },
    };

    const response = await axios.post(
      GetGHGEstimationUrl() + "api/v1/users/activity-permissions",
      formData,
      opConfig
    );

    // Process the data to match the required format
    const result = [];

    // Iterate over each location and collect the activities for each organization
    const locationsMap = new Map();
    response.data.data.forEach(item => {
        item.locations.forEach(location => {
            if (!locationsMap.has(location.id)) {
                locationsMap.set(location.id, new Set());
            }
            locationsMap.get(location.id).add(item.main_activity);
        });
    });

    // Convert Map to the desired output format
    locationsMap.forEach((activities, id) => {
        result.push({
            organization_address_id: id,
            activities: Array.from(activities)
        });
    });

    return result;
  }

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
      { pageName: "GHG Emission Reporting", url: "/#" },
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
              <h4>GHG Emission Reporting</h4>
            </div>
          </div>
        </div>
        <div className="">
          {this.state.loader && (
            <div
              style={{
                position: "absolute",
                width: "90%",
                height: "100%",
                background: "#fff",
              }}
            >
              <Spinner />
            </div>
          )}
          <iframe
            id="listIframe1"
            src={this.iframeUrl()}
            allowFullScreen
            frameBorder="0"
            style={{ width: "100%" }}
            height={this.state.iframeHeight}
            loading="eager"
            onLoad={() => this.setState({ loader: false })}
          />
        </div>
      </React.Fragment>
    );
  }
}
export default withStyles(navbarsStyle)(GHGPOC);
