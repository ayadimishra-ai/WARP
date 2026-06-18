import React, { Component } from "react";
import { decodeOpAccessToken } from "../../utility";
import { GetGHGEstimationUrl } from "../../config";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Spinner from "../../UI/Spinner/Spinner";
import { popupAlert } from "../../UI/Popups/popup";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
import { MESSAGE_BULK_UPLOAD_MATERIAL_MASTER } from "../../ops/message-constant";
import BulkUploadMaterialMaster from "./material-management/BulkUploadMaterialMaster";
let messageData = "";
const drawerWidth = 400;
const styles = (theme) => ({
  root: {
    display: "flex",
  },
  hide: {
    display: "none",
  },
  drawer: {
    width: drawerWidth,
    flexShrink: 0,
  },
  drawerPaper: {
    width: drawerWidth,
    top: "0px",
    zIndex: "1001",
  },
  drawerHeader: {
    display: "flex",
    alignItems: "center",
    padding: "0 8px",
    ...theme.mixins.toolbar,
    justifyContent: "flex-end",
  },
  content: {
    flexGrow: 1,
    padding: "0",
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    marginRight: -drawerWidth,
  },
  contentShift: {
    transition: theme.transitions.create("margin", {
      easing: theme.transitions.easing.easeOut,
      duration: theme.transitions.duration.enteringScreen,
    }),
    marginLeft: -375,
    marginRight: 0,
  },
});
class MaterialListingTable extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
      isOpen: false,
      materialId: "",
      sidebarLoader: false,
      isBulkUploadPopupOpen: false,
      bulkUploadTemplateUrl: "",
      bulkUploadModalContent: "Material Master",
      isLoadingTemplate: false,
    };
  }

  componentDidMount = async () => {
    this.setState({ jwtToken: localStorage.opsToken });
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      const organizationId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
      localStorage.setItem("opsUserCompanyId", organizationId);
      this.setState({ organizationId: organizationId });
      
      // Pre-fetch template data for bulk upload to avoid delay when opening popup
      this.fetchBulkUploadTemplate(organizationId, decodedToken);
    } catch (error) {
      this.setState({ organizationId: null });
    }

    this.newHandle();
  };
  
  fetchBulkUploadTemplate = async (organizationId, decodedToken) => {
    this.setState({ isLoadingTemplate: true });
    
    const formData = {
      organizationId: organizationId,
      userId: decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
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
      
      const activities = response.data.data
        .filter((item) =>
          item.main_activity
            .toLowerCase()
            .includes("material_details".toLowerCase())
        )
        .map((item) => ({
          activity: item.label,
          downloadLink: item.template_link,
        }));
        
      if (activities.length > 0) {
        this.setState({
          bulkUploadTemplateUrl: activities[0].downloadLink,
          bulkUploadModalContent: activities[0].activity,
          isLoadingTemplate: false,
        });
      } else {
        this.setState({
          bulkUploadTemplateUrl: "",
          bulkUploadModalContent: "Material Master",
          isLoadingTemplate: false,
        });
      }
    } catch (error) {
      console.error("Error fetching template:", error);
      this.setState({ isLoadingTemplate: false });
    }
  };
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
            case "add-edit-material":
              this.setState({
                isOpen: messageData.data.openDrawer,
                materialId: messageData.data.materialId,
                sidebarLoader: messageData.data.openDrawer,
              });
              break;
            case "material-form-submitted":
              this.setState({ isOpen: false, sidebarLoader: false });
              popupAlert(
                messageData.isFailed ? "error" : "success",
                messageData.isFailed ? "Error" : "Success",
                messageData.isFailed
                  ? "Something went wrong"
                  : this.state.materialId !== "" &&
                    this.state.materialId !== null &&
                    this.state.materialId !== undefined
                  ? "Material updated successfully"
                  : "Material added successfully"
              );
              document.getElementById(
                "materialListing"
              ).src = document.getElementById("materialListing").src;
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
            case MESSAGE_BULK_UPLOAD_MATERIAL_MASTER:
              this.showBulkUploadPopup();
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

  showBulkUploadPopup = () => {
    this.setState({ isBulkUploadPopupOpen: true });
  };

  hideBulkUploadPopup = () => {
    this.setState({ isBulkUploadPopupOpen: false });
  };

  submitDataHandle = () => {
    // Reload the material listing iframe after successful bulk upload
    document.getElementById(
      "materialListing"
    ).src = document.getElementById("materialListing").src;
  };

  handleDrawerClose = () => {
    this.setState({ isOpen: false, sidebarLoader: false });
  };

  render() {
    const { classes } = this.props;
    let iframeSrc =
      GetGHGEstimationUrl() +
      this.state.organizationId +
      "/embed/v1/" +
      localStorage.opsToken +
      "/add-material";
    if (
      this.state.materialId !== "" &&
      this.state.materialId !== null &&
      this.state.materialId !== undefined
    ) {
      iframeSrc =
        GetGHGEstimationUrl() +
        this.state.organizationId +
        "/embed/v1/" +
        localStorage.opsToken +
        "/add-material?id=" +
        this.state.materialId;
    }
    return (
      <React.Fragment>
        <iframe
          title="Material Listing"
          id="materialListing"
          src={
            GetGHGEstimationUrl() +
            this.state.organizationId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/material-listing"
          }
          style={{ width: "100%", height: "100vh", border: "none" }}
        />
        {this.state.isOpen ? (
          <Drawer
            className={classes.drawer}
            anchor="right"
            open={this.state.isOpen}
            classes={{
              paper: `${classes.drawerPaper} quick_view_pannel`,
            }}
            onClick={this.handleDrawerClose}
          >
            <div className="quick_view_header assessmentrequestbackicon">
              <h4
                style={{
                  marginBottom: 0,
                  color: "#003B52",
                  fontWeight: 500,
                  fontSize: 20,
                }}
              >
                {this.state.materialId !== "" &&
                this.state.materialId !== null &&
                this.state.materialId !== undefined
                  ? "Update Material"
                  : "Add New Material"}
              </h4>
              <IconButton
                onClick={this.handleDrawerClose}
                style={{
                  backgroundColor: "transparent",
                }}
                className="close-button-custom"
              >
                <CloseIcon  />
              </IconButton>
            </div>
            <div
              className="quick_view"
              style={{ paddingBottom: "0px", height: "90vh" }}
            >
              {this.state.sidebarLoader && <Spinner />}
              <iframe
                onLoad={() =>
                  setTimeout(
                    () => {
                      this.setState({ sidebarLoader: false });
                    },
                    [1000]
                  )
                }
                title="addEditMaterial"
                src={iframeSrc}
                allowfullscreen
                frameBorder="0"
                style={{ width: "100%", minHeight: "600px", height: "100%" }}
              />
            </div>
          </Drawer>
        ) : (
          ""
        )}
        {this.state.isBulkUploadPopupOpen ? (
          <BulkUploadMaterialMaster 
            hideBulkUploadPopup={this.hideBulkUploadPopup}
            submitDataHandle={this.submitDataHandle}
            organizationId={this.state.organizationId}
            templateUrl={this.state.bulkUploadTemplateUrl}
            modalContent={this.state.bulkUploadModalContent}
          />
        ) : null}
      </React.Fragment>
    );
  }
}
export default withStyles(styles)(MaterialListingTable);
