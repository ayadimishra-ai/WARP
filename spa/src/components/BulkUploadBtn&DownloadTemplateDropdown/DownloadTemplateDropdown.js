import { Divider, Fade,
  Modal, } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import React, { Component } from "react";
import DownloadWhite from "../../assets/img/downloadIcon.svg";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import Button from "../Material/CustomButtons/Button";
import CustomDropdown from "../Material/CustomDropdown/CustomDropdown";
import { GetGHGEstimationUrl } from "../../config";
import axios from "axios";
import { decodeOpAccessToken, downloadExcelFile, toasterAlert } from "../../utility";
import { Lock } from "@material-ui/icons";
import { showLockUpPopup } from "../../UI/Popups/lockUpPopUp";
import toaster from "toasted-notes";
import CloseIcon from "@material-ui/icons/Close";
import SelectLocation from "../../containers/OpsContainer/SelectLocation";

class BulkUploadBtnDownloadTemplateDropdown extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activities: [],
      locationList: [],
      isGenericError: false,
      location: "",
      uploadedFilePath: null,
      selectedActivity: null,
    };
  }
  async componentDidMount() {
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      if(!decodedToken) return;
      
      const opConfig = {
        headers: {
          "x-sk-op-authorization": localStorage.opsToken,
          "Content-Type": "application/json",
        },
      };

      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];

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

      // Sort activities based on isLocked status, if isLocked is false then show them first and alphabetically
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
    } catch (error) {
      // Handle error if needed
      console.error("Error fetching activity permissions:", error);
    }
  }
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
            className={`${this.props.isIcon ? bg : "outline_btn_new "}`}
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

            if(item.isLocked){
              showLockUpPopup({
                type: 'download',
                activity: item.activity || item.label || 'Template Download'
              })
              return; // Prevent action if the item is locked
            }

            var activityItem = null;
            if (this.state.activities) {
              activityItem = this.state.activities.find(function (act) {
                return act.activity_code &&
                  act.activity_code.toLowerCase() === "product_share_allocation";
              });
            }

            if (
              activityItem &&
              activityItem.locations &&
              activityItem.locations.length === 1 &&
              item.activity.toLowerCase() === "product share allocation"
            ) {
              const location = activityItem.locations[0].value;
              this.generateProductShareAllocationTemplate("product_share_allocation", item.downloadLink, location);
              return;
            }else  if (
              activityItem &&
              activityItem.locations &&
              activityItem.locations.length > 1 &&
              item.activity.toLowerCase() === "product share allocation"
            ) {
              this.handleOpen(item.activity, item.downloadLink);
              return;
            }

            item.activity.toLowerCase() === "business travel" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "employee travel" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "energy-captive power" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "fuel consumption" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "general details" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "energy-grid" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "waste data" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "upstream transport" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "downstream transport" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "production details" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "buyer share" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "material procurement" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "water" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "wastewater generation" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "water withdrawal" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "water consumption" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "waste water treatment" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "fugitive details" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() ===
              "governance and board composition" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "health and safety" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "human resources" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "csr" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "grievances" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "capital goods" &&
              window.open(item.downloadLink, "_parent");
            item.activity.toLowerCase() === "use of sold products" &&
              window.open(item.downloadLink, "_parent");
          }}
        >
          <span>{item.activityHeader}</span>
          <span> 
            { item && item.isLocked ? <Lock /> : null } 
          </span>
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
            console.log("Response: ", response);
  
            if (response && response.data && response.data.data.fileData) {
              downloadExcelFile(response.data.data.fileData, response.data.data.fileName);
            }
  }
}

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
        isGenericError: false,
      });
    } 
    this.setState({
      open: true,
      modalContent: modalContent,
      uploadedFilePath: uploadedFilePath,
      selectedActivity: selectedActivity,
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
    // Reset the state when closing the modal
    this.setState({
      open: false,
      location: "",
      isGenericError: false,
    });

    // Emit dropdown close event
    const closeEvent = new CustomEvent("dropdownStateChange", {
      detail: { isOpen: false, dropdownId: "bulk-upload-dropdown" },
    });
    document.dispatchEvent(closeEvent);

    if (this.props.UploadActivityCode) {
      this.props.UploadActivityCode();
    }
    if (this.state.isFileUploaded && this.props.submitDataHandle) {
      this.props.submitDataHandle();
      this.setState({ isFileUploaded: false });
    }
};

handleChange = (event) => {
    const newLocation = String(event.target.value).toLowerCase();

    this.setState(
      (prevState) => ({
        location: newLocation,
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

render() {
    const { classes } = this.props;
    const {
      open,
    } = this.state;
    return (
      <>
        {this.generateListItems(
          "Download Template",
          "download",
          <img src={DownloadWhite} />,
          "outline_btn_new"
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
                        <h4>Download Template Data</h4>
                        <CloseIcon onClick={this.handleClose} />
                      </div>
                      <div className="ghgmodalBody">
                          <>
                            <p>
                              Please select a facility for which you wish to download the
                              data
                            </p>
                            <SelectLocation
                              location={this.state.location}
                              handleChange={this.handleChange}
                              classes={classes}
                              shrink={this.state.shrink}
                              locationList={this.state.locationList}
                            />
                          </>
                          <Button
                            className="outline_btn_new"
                            onClick={() => this.generateProductShareAllocationTemplate(this.state.selectedActivity, this.state.uploadedFilePath, this.state.location)}                         
                          >
                            Download Template
                          </Button>                        
                      </div>
                    </div>
                  </Fade>
                </Modal>
      </>
    );
}
}
export default withStyles(navbarsStyle)(BulkUploadBtnDownloadTemplateDropdown);
