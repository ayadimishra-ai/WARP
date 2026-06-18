import {
  CircularProgress,
  Divider,
  Fade,
  Modal,
  Paper,
  Tooltip,
} from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import CloseIcon from "@material-ui/icons/Close";
import axios from "axios";
import React, { Component } from "react";
import { Redirect, withRouter } from "react-router-dom";
import CloudIcon from "../../assets/img/cloudIcon.svg";
import DocumentIcon from "../../assets/img/document.svg";
import DownloadIcon from "../../assets/img/download.svg";
import UploadBlue from "../../assets/img/uploadBlue.svg";
import UploadModeIcon from "../../assets/img/UploadModeIcon.svg";
import SparkleIcon from "../../assets/img/SparkleIcon.svg";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import { GetGHGEstimationUrl } from "../../config";
import SelectLocation from "../../containers/OpsContainer/SelectLocation";
import Button from "../Material/CustomButtons/Button";
import CustomDropdown from "../Material/CustomDropdown/CustomDropdown";
import {
  refreshIframe,
  UploadActivityCode,
  UploadAIActivityCode,
} from "../../store/actions/monthlyActivityData";
import { connect } from "react-redux";
import { decodeOpAccessToken, downloadExcelFile, isAIEnabled, toasterAlert } from "../../utility";
import toaster from "toasted-notes";
import { Lock } from "@material-ui/icons";
import { showLockUpPopup } from "../../UI/Popups/lockUpPopUp";
import AISparkleIcon from "../../assets/img/jsIcons/AISparkleIcon";

const GHGEstimate_Link = GetGHGEstimationUrl();

const Statuses = {
  Failure: "failure",
  Success: "successful",
};
const cancelToken = axios.CancelToken;
let source = cancelToken.source();
class BulkUploadBtnDownloadTemplateDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isFileUploaded: false,
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
      locationList: [],
      isAIEnabled: false,
      isAIModalOpen: false,
      isAIFilesModalOpen: false,
      shouldRedirect: false,
      selectedActivity: null,
      isAIModeLocked: false,
      selectedActivityName: null,
      formMode: "standard",
      redirectPath: "/data-upload-logs"
    };
    this.handleFileChange = this.handleFileChange.bind(this);
    this.handleDrop = this.handleDrop.bind(this);
    this.handleDragOver = this.handleDragOver.bind(this);
  }

  async componentDidMount() {
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      if(!decodedToken) return;
      this.setState({ isAIEnabled: isAIEnabled(decodedToken) });

      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];

      this.setState({ organizationId: organizationId });

      const opConfig = {
        headers: {
          "x-sk-op-authorization": localStorage.opsToken,
          "Content-Type": "application/json",
        },
      };

      const buyerSupplierRoleResponse = await axios.post(
        GetGHGEstimationUrl() + "api/v1/users/buyer-supplier-role",
        { organizationId: organizationId },
        opConfig
      );

      const formData = {
        organizationId: organizationId,
        userId:
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
        isPCFActivity:true
      };

      const response = await axios.post(
        GetGHGEstimationUrl() + "api/v1/users/activity-permissions",
        formData,
        opConfig
      );

      const activities = response.data.data
        .filter((item) => item.locations && item.locations.length > 0)
        .map((item) => ({
          activity: item.label,
          activityHeader: item.label,
          activity_code: item.sub_activity,
          section: item.main_activity,
          downloadLink: item.template_link,
          locations: item.locations,
          is_AI_Enabled: item.is_AI_enabled || false,
          isLocked:
          item.label === "Product Share Allocation"
            ? response.data.PCF !== true
            : false,
        }));


      const allActivitiesData = response.data.allActivities
        .filter((item) => !(item.code === "buyer_share" && buyerSupplierRoleResponse && buyerSupplierRoleResponse.data && buyerSupplierRoleResponse.data.data === "BUYER"))
        .map((item) => {
          const isExist = activities.filter((act) => act.activity_code === item.code)
          if (isExist && isExist.length > 0) {
            return {
              ...item,
              ...isExist[0],
            }
          }
          return {
            ...item,
          ...{ activity:  item.name },
          ...{activityHeader:  item.name},
          isLocked : true
          }
        });

      // Sort activities based on isLocked status, if isLocked is false then show them first
      allActivitiesData.sort((a, b) => {
        // First, sort by locked status (unlocked items first)
        if (a.isLocked !== b.isLocked) {
          return a.isLocked ? 1 : -1;
        }

        // Then sort alphabetically within each group
        const nameA = a.name || a.activity || '';
        const nameB = b.name || b.activity || '';
        return nameA.localeCompare(nameB);
      });

      // Sort in alphabetical order for isLocked true activities
      allActivitiesData.sort((a, b) => {
        if (a.isLocked && b.isLocked) {
          return a.name.localeCompare(b.name);
        }
        return 0;
      });

      this.setState({ activities: allActivitiesData });
      // Fetch form mode on component mount for specific activities only
      const hasFormActivities = allActivitiesData.some((item) =>
        ["energy_grid_power", "energy_captive_power", "energy_fuel_purchased", "waste"].includes(item.activity_code)
      );
      if (hasFormActivities) {
        this.fetchFormMode();
      }
    } catch (error) {
      // Handle error if needed
      console.error("Error fetching activity permissions:", error);
    }

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

  componentDidUpdate(prevProps, prevState) {
    const activitiesJustLoaded =
      prevState.activities.length === 0 && this.state.activities.length > 0;

    if (activitiesJustLoaded) {
      console.log('[BulkUpload] activities just loaded. Count:', this.state.activities.length);
    }

    if (
      (prevProps.uploadActivityCode !== this.props.uploadActivityCode ||
        activitiesJustLoaded) &&
      this.props.uploadActivityCode &&
      this.state.activities.length > 0
    ) {
      console.log('[BulkUpload] Attempting to open Excel modal for code:', this.props.uploadActivityCode);
      console.log('[BulkUpload] activities available:', this.state.activities.map(function(a) { return { code: a.activity_code || a.code, activity: a.activity, isLocked: a.isLocked }; }));
      const item = this.state.activities.find(
        (i) => (i.activity_code || i.code) === this.props.uploadActivityCode
      );
      if (this.props.onActivityCodeConsumed) {
        this.props.onActivityCodeConsumed();
      }
      if (item) {
        console.log('[BulkUpload] matched item:', item);
        if (item.isLocked) {
          console.log('[BulkUpload] item is locked, showing lock popup');
          showLockUpPopup({
            type: 'upload',
            activity: item.activity || item.label || 'Data Upload',
          });
        } else {
          console.log('[BulkUpload] opening bulk upload modal for:', item.activity);
          this.handleOpen(item.activity, item.downloadLink);
        }
      } else {
        console.warn('[BulkUpload] Activity not found for code:', this.props.uploadActivityCode);
      }
    }

    if (
      (prevProps.uploadAIActivityCode !== this.props.uploadAIActivityCode ||
        activitiesJustLoaded) &&
      this.props.uploadAIActivityCode &&
      this.state.activities.length > 0
    ) {
      console.log('[BulkUpload] Attempting to open AI modal for code:', this.props.uploadAIActivityCode);
      const item = this.state.activities.find(
        (i) => (i.activity_code || i.code) === this.props.uploadAIActivityCode
      );
      console.log('[BulkUpload] matched AI item:', item);
      if (this.props.onActivityCodeConsumed) {
        this.props.onActivityCodeConsumed();
      }
      if (item) {
        if (item.isLocked) {
          console.log('[BulkUpload] AI item is locked, showing lock popup');
          showLockUpPopup({
            type: 'upload',
            activity: item.activity || item.label || 'AI-Powered Upload',
          });
        } else {
          console.log('[BulkUpload] opening AI modal for:', item.activity);
          const isAIModeLocked = !(item.is_AI_Enabled && this.state.isAIEnabled) || false;
          if (isAIModeLocked) {
            showLockUpPopup({
              type: 'upload',
              activity: 'AI-Powered Upload',
            });
          } else {
            this.setState({
              isAIModalOpen: false,
              open: true,
              isAIFilesModalOpen: true,
              selectedActivity: item,
              isAIModeLocked: false,
              selectedFile: null,
              uploadProgress: 0,
              showAlert: false,
              alertMessage: "",
              isGenericError: false,
            });
          }
        }
      } else {
        console.warn('[BulkUpload] Activity not found for AI code:', this.props.uploadAIActivityCode);
      }
    }
  }
  handleActivityClick = (item) => {
    if (
      ["energy_grid_power", "energy_captive_power", "energy_fuel_purchased", "waste"].includes(item.activity_code)
    ) {
      this.setState({
        isAIModalOpen: true,
        selectedActivity: item,
        isAIModeLocked: !(item.is_AI_Enabled && this.state.isAIEnabled) || false
      });
    } else {
      this.handleOpen(item.activity, item.downloadLink);
    }
  };

  handleOpen = (modalContent, uploadedFilePath) => {
    const selectedActivity = this.state.activities.filter(
      (d) => d.activity === modalContent
    )[0].activity;
    console.log("selectedActivity", selectedActivity);

    const activityWiseLocation = this.state.activities.filter(
      (x) => x.activity === selectedActivity
    )[0].locations;
    console.log("this.state.activities", this.state.activities);
    console.log("activityWiseLocation", activityWiseLocation);
    const menuItems = activityWiseLocation;

    menuItems.sort((a, b) => a.label.localeCompare(b.label));
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
      selectedActivityName : selectedActivity
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
      isAIFilesModalOpen: false,
    });

    // Emit dropdown close event
    const closeEvent = new CustomEvent("dropdownStateChange", {
      detail: { isOpen: false, dropdownId: "bulk-upload-dropdown" },
    });
    document.dispatchEvent(closeEvent);

    if (this.props.UploadActivityCode) {
      this.props.UploadActivityCode();
    }
    if (this.props.UploadAIActivityCode) {
      this.props.UploadAIActivityCode();
    }
    if (this.state.isFileUploaded && this.props.submitDataHandle) {
      this.props.submitDataHandle();
      this.setState({ isFileUploaded: false });
    }

    const listIframe1 = document.getElementById("listIframe1");
    if (listIframe1 && listIframe1.contentWindow) {
      listIframe1.contentWindow.postMessage(
        JSON.stringify({ type: "bulk-page-refresh" }),
        "*"
      );
    }
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
      () => {
        // This callback runs after the state has been updated
        console.log("Updated this.state.location - ", this.state.location);
      }
    );

    // This log will show the old value since state hasn't updated yet
    console.log("Old this.state.location - ", this.state.location);
  };

  handleDragOver = (event) => {
    event.preventDefault();
  };

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
            let type = this.state.modalContent;
            let ApiURL = "";
            if (type === "General Details") {
              ApiURL = "api/v1/ghg-data-import/transaction/general/excel";
            }
            if (type === "Energy-Grid") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/energy-grid-power/excel";
            }
            if (type === "Energy-Captive Power") {
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
            if (type === "Waste Data") {
              ApiURL = "api/v1/ghg-data-import/transaction/waste/excel";
            }
            if (type === "Upstream Transport") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/transport-upstream/excel";
            }
            if (type === "Downstream Transport") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/transport-downstream/excel";
            }
            if (type === "Production Details") {
              ApiURL = "api/v1/ghg-data-import/transaction/production/excel";
            }
            if (type === "Buyer Share") {
              ApiURL = "api/v1/ghg-data-import/transaction/buyer-share/excel";
            }
            if (type === "Material Procurement") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/material-procurement/excel";
            }
            // if (type === "Water") {
            //   ApiURL =
            //     "api/v1/ghg-data-import/transaction/water/excel";
            // }
            if (type === "Wastewater Generation") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/wastewater-generation/excel";
            }
            if (type === "Water Withdrawal") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/water-withdrawal/excel";
            }
            if (type === "Water Consumption") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/water-consumption/excel";
            }
            if (type === "Waste Water Treatment") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/wastewater-treatment/excel";
            }
            if (type === "Fugitive Details") {
              ApiURL = "api/v1/ghg-data-import/transaction/fugitive/excel";
            }
            if (type === "Health and Safety") {
              ApiURL =
                "api/v1/esg-data-import/transaction/health-and-safety/excel";
            }
            if (type === "Human Resources") {
              ApiURL =
                "api/v1/esg-data-import/transaction/human-resources/excel";
            }
            if (type === "Governance and Board Composition") {
              ApiURL =
                "api/v1/esg-data-import/transaction/governance-and-board-composition/excel";
            }
            if (type === "CSR") {
              ApiURL = "api/v1/esg-data-import/transaction/csr/excel";
            }
            if (type === "Grievances") {
              ApiURL = "api/v1/esg-data-import/transaction/grievances/excel";
            }
            if (type === "Capital Goods") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/capital-goods/excel";
            }
            if (type === "Product Share Allocation") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/product-share-allocation/excel";
            }
            if (type === "Use of Sold Products") {
              ApiURL =
                "api/v1/ghg-data-import/transaction/use-of-sold-products/excel";
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
                    if (document.getElementById("listIframe1")) {
                      let iFrame = document.getElementById("listIframe1");

                      iFrame.contentWindow.postMessage(
                        JSON.stringify({
                          type: "manual-upload",
                        }),
                        "*"
                      );

                      iFrame.src = iFrame.src;
                    }
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
        // this.props.refreshIframe();
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

  //Dropdown items generation
  generateListItems = (buttonText, action, icon, bg) => {
    return this.state.activities.length !== 0 ? (
      <CustomDropdown
        customId={buttonText.replace(/ /g, "_")}
        caret={false}
        noLiPadding
        hoverColor="dark"
        dropPlacement={"bottom-end"}
        buttonText={
          <Button
            className={this.props.isIcon ? bg : "outline_btn_new"}
            type="button"
            style={{
              margin: 0,
            }}
          >
            {this.props.isIcon && icon} {buttonText}
          </Button>
        }
        buttonProps={{
          color: "transparent",
        }}
        dropdownList={this.generateDropdownItems(action)}
        isAIEnabled={this.state.isAIEnabled}
      />
    ) : (
      <></>
    );
  };
  generateDropdownItems = (action) => {
    return this.state.activities.map((item, index) => (
      <React.Fragment key={index}>
        <Button
          className={`${this.props.classes.dropdownLink} ${item.isLocked ? 'dropdown-item-locked' : ''}`}
          data-locked={item.isLocked ? 'true' : 'false'}
          onClick={(e) => {
            e.preventDefault();
            if (action === "upload") {

              if(item.isLocked){
                showLockUpPopup({
                  type: 'upload',
                  activity: item.activity || item.label || 'Data Upload'
                })
                return; // Prevent action if the item is locked
              }
              this.handleActivityClick(item);
              if (
                item.activity_code === "energy_grid_power" ||
                item.activity_code === "energy_captive_power" ||
                item.activity_code === "energy_fuel_purchased" ||
                item.activity_code === "waste"
              ) {
                this.setState({
                  isAIModalOpen: true,
                  selectedActivity: item,
                  isAIModeLocked: !(item.is_AI_Enabled && this.state.isAIEnabled) || false
                });
              } else {
                this.handleOpen(item.activity, item.downloadLink);
              }
              
            }
          }}
        >
          <span>{item.activityHeader}</span>
          <span>
            { item && item.isLocked ? <Lock /> : null } 
          </span>
          {item.is_AI_Enabled && this.state.isAIEnabled && !item.isLocked && (
            <Tooltip
              title="AI processing is available for this activity. Process various file formats (e.g. images, pdf)."
              className="aiChip"
              placement="bottom-end"
            >
              <div>AI</div>
            </Tooltip>
          )}
        </Button>
        {index !== this.state.activities.length - 1 && (
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

  handleAIClose = () => {
    this.setState({
      isAIModalOpen: false,
    });
  };

  handleManualUploadClick = () => {
    const { selectedActivity } = this.state;
    if (selectedActivity) {
      this.handleOpen(selectedActivity.activity, selectedActivity.downloadLink);
    }
    this.setState({
      isAIModalOpen: false,
      isAIFilesModalOpen: false,
      selectedFile: null,
      uploadProgress: 0,
      showAlert: false,
      alertMessage: "",
      isGenericError: false,
    });
  };

  handleAIUploadClick = () => {
    if(this.state.isAIModeLocked){
      showLockUpPopup({
        type: 'upload',
        activity: 'AI-Powered Upload'
      })
      return; // Prevent action if the item is locked
    }else{
      this.setState({
        isAIModalOpen: false,
        open: true,
        isAIFilesModalOpen: true,
        selectedFile: null,
        uploadProgress: 0,
        showAlert: false,
        alertMessage: "",
        isGenericError: false,
      });
    }
  };

  handleAIDrop = (event) => {
    event.preventDefault();
    const files = event.dataTransfer.files;
    this.handleAIFilesChange(files);
  };

  handleAIDragOver = (event) => {
    event.preventDefault();
  };

  handleAIFilesChange = (files) => {
    // const allowedTypes = [
    //   "application/pdf",
    //   "image/jpeg",
    //   "image/png",
    //   "image/tiff",
    // ];
    // const maxFileSize = 100 * 1024 * 1024; // 100 MB
    // const filesWithValidation = Array.from(files).map((file) => {
    //   let error = null;
    //   if (!allowedTypes.includes(file.type)) {
    //     error = `Invalid file type: ${file.type}`;
    //   } else if (file.size > maxFileSize) {
    //     error = `File size exceeds 100 MB: ${(
    //       file.size /
    //       (1024 * 1024)
    //     ).toFixed(2)} MB`;
    //   }
    //   // Attach validation error to file object
    //   file.validationError = error;
    //   return file;
    // });
    // Pass all files (with validationError property) to handleAIUpload
    // this.handleAIUpload(filesWithValidation);

    //Passing all files without validation for AI processing, As validation is handled in the backend
    this.handleAIUpload(files);
  };
  
  fetchFormMode = async () => {
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      if (!decodedToken) {
        this.setState({ formMode: "standard" });
        return;
      }

      const url = GHGEstimate_Link + "api/v1/activity-form/mode";

        const opConfig = {
          headers: {
            "x-sk-op-authorization": localStorage.opsToken,
            "Content-Type": "application/json",
          },
        };

      const response = await axios.get(url, opConfig)

      if (response.data && response.data.success) {
        this.setState({ formMode: response.data.formMode || "standard" });
      } else {
        this.setState({ formMode: "standard" });
      }
    } catch (error) {
      console.error("Error fetching form mode:", error);
      this.setState({ formMode: "standard" });
    }
  };
  getManualEntryUrl = (activityCode) => {
    const urlMap = {
      'energy_grid_power': '/ghg/activity/grid-power',
      'energy_captive_power': '/ghg/activity/captive-power',
      'waste': '/ghg/activity/waste',
      'energy_fuel_purchased': '/ghg/activity/fuel-consumption'
      // 'energy_fuel_purchased': '/manual-entry-data/fuel-consumption',
      // 'transport_employee_travel': '/manual-entry-data/employee-travel',
      // 'transport_business_travel': '/manual-entry-data/business-travel',
      // 'waste': '/manual-entry-data/waste',
      // 'transport_upstream': '/manual-entry-data/upstream-transport',
      // 'transport_downstream': '/manual-entry-data/downstream-transport',
      // 'production': '/manual-entry-data/production',
      // 'buyer_share': '/manual-entry-data/buyer-share',
      // 'material_procurement': '/manual-entry-data/material-procurement',
      // 'wastewater_generation': '/manual-entry-data/wastewater-generation',
      // 'water_withdrawal': '/manual-entry-data/water-withdrawal',
      // 'water_consumption': '/manual-entry-data/water-consumption',
      // 'wastewater_treatment': '/manual-entry-data/wastewater-treatment',
      // 'fugitive': '/manual-entry-data/fugitive',
      // 'health_and_safety': '/manual-entry-data/health-and-safety',
      // 'human_resources': '/manual-entry-data/human-resources',
      // 'governance_and_board_composition': '/manual-entry-data/governance',
      // 'csr': '/manual-entry-data/csr',
      // 'grievances': '/manual-entry-data/grievances',
      // 'general': '/manual-entry-data/general',
    };

    return urlMap[activityCode] || '/manual-entry-data';
  };

  getDataUploadLogsUrl = (activityCode) => {
    if (!activityCode) {
      return "/data-upload-logs";
    }

    return `/data-upload-logs/${encodeURIComponent(activityCode)}`;
  };

  handleAIUpload = async (files) => {
    this.setState({ loading: true, showAlert: false, alertMessage: "" });
    const formData = new FormData();
    formData.append("organizationId", this.state.organizationId);

    Array.from(files).forEach((file) => {
      formData.append("file", file);
    });

    try {
      const response = await fetch(
        GHGEstimate_Link + "api/v1/ai-monthly-activity-data",
        {
          method: "POST",
          body: formData,
          headers: {
            "x-sk-op-authorization": localStorage.opsToken,
          },
        }
      );
      const data = await response.json();

      if (data.success) {
        const selectedActivityCode =
          (this.state.selectedActivity &&
            (this.state.selectedActivity.activity_code ||
              this.state.selectedActivity.code)) ||
          "";

        this.setState({
          shouldRedirect: true,
          loading: false,
          redirectPath: this.getDataUploadLogsUrl(selectedActivityCode),
        });
        this.handleClose();
        let iFrame = document.getElementById("listIframe1");
        if (!!iFrame) {
          iFrame.contentWindow.window.postMessage(
            JSON.stringify({
              type: "ai-upload-pop-up-closed",
            }),
            "*"
          );
          iFrame.contentWindow.postMessage(JSON.stringify({
            type: "ai-upload",
          }),
            "*"
          );
        }
      } else {
        this.setState({ loading: false });
        toaster.notify(
          toasterAlert("FAIL", "Something went wrong. Please try again"),
          { duration: null }
        );
      }
    } catch (error) {
      console.error("Error uploading files:", error);
      this.setState({
        loading: false,
        showAlert: true,
        alertMessage: "Error uploading files. Please try again.",
      });
      toaster.notify(
        toasterAlert("FAIL", "Something went wrong. Please try again"),
        { duration: null }
      );
    }
  };

  generateProductShareAllocationTemplate = async (activity, downloadLink, location) => {
    const decodedToken = decodeOpAccessToken(localStorage.opsToken);
    
          if (decodedToken) {
            const formData = {
              organizationId:
                decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"],
              organizationAddressId: location, // Pass organizationAddressId if required
              filePath: downloadLink
            };
    
            const opConfig = {
              headers: {
                "x-sk-op-authorization": localStorage.opsToken,
                "Content-Type": "application/json",
              },
            };
            const response = await axios.post(
                    GetGHGEstimationUrl() + "api/v1/ghg-data-import/transaction/product-share-allocation/template",
                    formData,
                    opConfig
                  );
  
            if (response && response.data && response.data.data.fileData) {
                downloadExcelFile(response.data.data.fileData, response.data.data.fileName);
            }
  }
  };

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
      shouldRedirect,
      redirectPath,
    } = this.state;

    if (shouldRedirect) {
      if (
        this.props.location &&
        this.props.location.pathname !== redirectPath
      ) {
        return <Redirect to={redirectPath} />;
      }
    }

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
        progressBarColor = "#122f47";
        progressText = "Please wait file is uploading...";
        break;
      default:
        progressBarColor = "#122f47";
        progressTextColor = "#666666";
        progressText = "";
    }

    const isDisabled = uploadProgress > 0 && uploadProgress < 100;
    return (
      <>
        {" "}
        {this.generateListItems(
          "Add Data",
          "upload",
          <img src={UploadBlue} />,
          "solid_btn_new"
        )}
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
                <h4>
                  {!this.state.isAIFilesModalOpen
                    ? "Bulk Upload Data"
                    : "Upload Electricity bills for AI Processing"}
                </h4>
                <CloseIcon onClick={this.handleClose} />
              </div>
              <div className="ghgmodalBody">
                {!this.state.isAIFilesModalOpen ? (
                  <>
                    <p>
                      Please select a facility for which you wish to upload the
                      data <span>&#42;</span>
                    </p>
                    <SelectLocation
                      location={this.state.location}
                      handleChange={this.handleChange}
                      classes={classes}
                      isDisabled={isDisabled}
                      shrink={this.state.shrink}
                      locationList={this.state.locationList}
                    />
                    <Paper
                      elevation={0}
                      className={`ghgUploadBox ${this.state.location &&
                        "location"}`}
                    >
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
                            disabled={this.state.location ? false : true}
                            onClick={
                              uploadProgress > 0
                                ? this.cancelUpload
                                : this.state.location
                                  ? () =>
                                    document.getElementById("fileInput").click()
                                  : undefined
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
                          <p>
                            {selectedFile ? selectedFile.name : modalContent}
                          </p>
                        </Paper>
                        {this.state.uploadedFilePath !== "" ? (
                          this.state.selectedActivityName &&  this.state.selectedActivityName === "Product Share Allocation" ? (
                            <a
                              target="_blank"
                              disabled={this.state.location ? false : true}
                              style={{ pointerEvents: this.state.location ? "auto" : "none" }}
                              onClick={() => this.generateProductShareAllocationTemplate(this.state.selectedActivityName, this.state.uploadedFilePath, this.state.location)} 
                            >
                              <img alt="cloud" src={DownloadIcon} width="24px" />
                            </a>
                          ) : (
                            <a
                              target="_blank"
                              onClick={(e) => e.stopPropagation()}
                              href={this.state.uploadedFilePath}
                            >
                              <img alt="cloud" src={DownloadIcon} width="24px" />
                            </a>
                          )
                        ) : (
                          <img alt="cloud" src={DownloadIcon} width="24px" />
                        )}
                      </Paper>
                    </Paper>
                  </>
                ) : (
                  <>
                    <div className="aiFileUploadNote">
                      <p>
                        <b>Note:</b> Processing begins automatically. You can
                        view the status in <b>Upload History</b>.
                      </p>
                    </div>
                    <Paper elevation={0} className="ghgUploadBox location">
                      <Paper
                        onDrop={this.handleAIDrop}
                        onDragOver={this.handleAIDragOver}
                        elevation={0}
                        className="uploadfile"
                        style={{
                          borderBottom: "none",
                        }}
                      >
                        <Paper elevation={0} className="bulkUploadNotes">
                          <img alt="cloud" src={CloudIcon} width="80px" />
                          <input
                            type="file"
                            id="aiFileInput"
                            style={{ display: "none" }}
                            onChange={(e) =>
                              this.handleAIFilesChange(e.target.files)
                            }
                            multiple
                            accept=".pdf, .jpg, .jpeg, .png, .tiff, .tif"
                          />
                          <h4 className="dragText">Drag & Drop Files</h4>
                          <p className="dragPara">
                            Supported formats: PDF, JPG, JPEG, PNG, TIFF.
                            <br />
                            Max 20 MB per file
                          </p>
                          {showAlert && (
                            <div className="ghgfilerror">{alertMessage}</div>
                          )}
                        </Paper>
                        <Button
                          component="span"
                          className="solid_btn_new"
                          disabled={this.state.loading}
                          onClick={() =>
                            !this.state.loading &&
                            document.getElementById("aiFileInput").click()
                          }
                          style={{ width: "142px" }}
                        >
                          {this.state.loading ? (
                            <CircularProgress color="inherit" size={18} />
                          ) : (
                            "Choose Files"
                          )}
                        </Button>
                      </Paper>
                    </Paper>
                  </>
                )}
              </div>
            </div>
          </Fade>
        </Modal>
        <Modal
          open={this.state.isAIModalOpen}
          onClose={this.handleAIClose}
          aria-labelledby="simple-modal-title"
          aria-describedby="simple-modal-description"
          className="ghgmodal"
        >
          <Fade in={this.state.isAIModalOpen}>
            <div className="commonModal aiDecisionModal">
              <div className="aiDecisionModalHeader">
                <CloseIcon onClick={this.handleAIClose} />
              </div>
              <div className="aiDecisionModalBody">
                <h4>Select Upload Mode</h4>
                <img
                  src={UploadModeIcon}
                  height="125"
                  alt="Select upload mode"
                />
                <div className="buttonGroup">
                   {this.state.selectedActivity && this.state.selectedActivity.activity_code !== "energy_captive_power" && this.state.selectedActivity.activity_code !== "waste" &&
                    <Tooltip title="Choose AI to automatically extract and process data. Supports various file formats (e.g. images, pdf).">
                      <Button
                        onClick={this.handleAIUploadClick}
                        className="aiGradientBtn"
                        style={{ width: 180, height: 36, borderRadius:30 }}
                      >
                      <AISparkleIcon /> AI POWERED {this.state.isAIModeLocked && ( <Lock style={{ marginLeft: 5, height: 16, marginTop: -5, color:"#D9D9D9" }} />)}
                      </Button>
                    </Tooltip>}
                  {this.state.formMode === "standard" && (
                    <Tooltip title="Choose Manual to upload data in the specified format. Supports only .csv and .xls files.">
                      <Button
                        className="outline_btn_new"
                        onClick={this.handleManualUploadClick}
                        style={{ width: 180 }}
                        size="lg"
                      >
                        Excel Upload
                      </Button>
                    </Tooltip>
                  )}
                  <Tooltip title="You can manually enter data directly into the system without uploading any files.">
                    <Button
                      className="outline_btn_new"
                      onClick={() => {
                        if (this.props.history && this.state.selectedActivity) {
                          const url = this.getManualEntryUrl(this.state.selectedActivity.activity_code);
                          this.handleAIClose();
                          this.props.history.push(url);
                        }
                      }}
                      style={{ width: 180 }}
                      size="lg"
                    >
                      Manual Entry
                    </Button>
                  </Tooltip>
                </div>
              </div>
            </div>
          </Fade>
        </Modal>
      </>
    );
  }
  
}
const mapStateToProps = null;
const mapDispatchToProps = {
  refreshIframe,
  UploadActivityCode,
  UploadAIActivityCode,
};
export default withRouter(
  withStyles(navbarsStyle)(
    connect(
      mapStateToProps,
      mapDispatchToProps
    )(BulkUploadBtnDownloadTemplateDropdown)
  )
);
