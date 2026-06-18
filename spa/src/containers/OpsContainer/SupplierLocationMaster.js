import React, { Component } from "react";
import { withRouter } from "react-router-dom";
import { decodeOpAccessToken } from "../../utility";
import { GetGHGEstimationUrl } from "../../config";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Spinner from "../../UI/Spinner/Spinner";
import { popupAlert } from "../../UI/Popups/popup";
import { withStyles } from "@material-ui/core/styles";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
import { MESSAGE_BULK_UPLOAD_SUPPLIER_LOCATION_MASTER } from "../../ops/message-constant";
import BulkUploadSupplierLocationMaster from "./supplier-location-master/BulkUploadSupplierLocationMaster";

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

class SupplierLocationMaster extends Component {
  static contextType = ReCaptchaContext;

  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
      isOpen: false,
      supplierLocation_id: "",
      sidebarLoader: false,
      isBulkUploadPopupOpen: false,
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
    } catch (error) {
      this.setState({ organizationId: null });
    }
    this.newHandle();
  };

  newHandle = () => {
    window.addEventListener("message", async (event) => {
      event.preventDefault();
      let dataType = typeof event.data;
      if (dataType === "string") {
        try {
          messageData = "";
          messageData = event.data ? JSON.parse(event.data) : "";
          console.log("Received message:", messageData); // Debug log
          const type = messageData.type;
          switch (type) {
            case "add-edit-supplier-location-master":
              this.setState({
                isOpen: messageData.data.openDrawer,
                supplierLocationId: messageData.data.supplierLocationId,
                sidebarLoader: messageData.data.openDrawer,
              });
              break;
            case "supplier-location-master-form-submitted":
              this.setState({ isOpen: false, sidebarLoader: false });
              // Check if this is a cancellation (only has type and isFailed properties)
              const messageKeys = Object.keys(messageData);
              const isCancel = messageKeys.length <= 2 && messageKeys.includes('type') && messageKeys.includes('isFailed') && !messageData.isFailed;

              const isEdit = !!this.state.supplierLocationId;
              const iFrame = document.getElementById("supplierLocationMasterListing");
              if (iFrame && iFrame.contentWindow) {
                const targetOrigin = GetGHGEstimationUrl().replace(/\/$/, '');
                iFrame.contentWindow.postMessage(
                  JSON.stringify({ type: "refresh-supplier-location-master-listing", data: { action: isEdit ? "edit" : "add" } }),
                  targetOrigin
                );
              }
              if (messageData.cancelled || messageData.action === "cancel" || isCancel) {
                // Just close the form without showing success popup
                const addEditIframe = document.querySelector('iframe[title="addEditSupplierLocationMaster"]');
                if (addEditIframe && addEditIframe.contentWindow) {
                  const targetOrigin = GetGHGEstimationUrl().replace(/\/$/, '');
                  addEditIframe.contentWindow.postMessage(
                    JSON.stringify({ type: "clearForm" }),
                    targetOrigin
                  );
                }
              } else if (!messageData.isFailed) {
                popupAlert(
                  "success",
                  "Success",
                  this.state.supplierLocationId !== "" &&
                    this.state.supplierLocationId !== null &&
                    this.state.supplierLocationId !== undefined
                    ? "Supplier Location updated successfully"
                    : "Supplier Location added successfully"
                );
              } else {
                popupAlert("error", "Error", "Something went wrong");
              }
              break;
            case "validate-recaptcha":
              const isCaptchaValid = await captchaValidation(this.context);
              if (isCaptchaValid) {
                event.source.postMessage(
                  JSON.stringify({ type: "reCaptchaValidation" }),
                  event.origin
                );
              } else {
                alert("Captcha verification failed. Please try again.");
              }
              break;
            case MESSAGE_BULK_UPLOAD_SUPPLIER_LOCATION_MASTER:
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

  handleDrawerClose = () => {
    this.setState({ isOpen: false, sidebarLoader: false });
  };

  render() {
    const { classes } = this.props;
    const { organizationId, supplierLocation_id, isOpen, sidebarLoader, isBulkUploadPopupOpen } =
      this.state;

    let iframeSrc =
      GetGHGEstimationUrl() +
      organizationId +
      "/embed/v1/" +
      localStorage.opsToken +
      "/supplier-location-master";

    if (
      supplierLocation_id !== "" &&
      supplierLocation_id !== null &&
      supplierLocation_id !== undefined
    ) {
      iframeSrc =
        GetGHGEstimationUrl() +
        organizationId +
        "/embed/v1/" +
        localStorage.opsToken +
        "/supplier-location-master?id=" +
        supplierLocation_id;
    }

    return (
      <React.Fragment>
        <iframe
          title="Supplier Location Master Listing"
          id="supplierLocationMasterListing"
          src={
            GetGHGEstimationUrl() +
            localStorage.opsUserCompanyId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/supplier-location-master-list"
          }
          style={{ width: "100%", height: "100vh", border: "none" }}
        />
        {isOpen ? (
          <Drawer
            className={classes.drawer}
            anchor="right"
            open={isOpen}
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
                {supplierLocation_id !== "" &&
                  supplierLocation_id !== null &&
                  supplierLocation_id !== undefined
                  ? "Update Supplier Location"
                  : "Add New Supplier Location"}
              </h4>
              <IconButton
                onClick={this.handleDrawerClose}
                style={{ backgroundColor: "transparent" }}
                className="close-button-custom"
              >
                <CloseIcon />
              </IconButton>
            </div>
            <div
              className="quick_view"
              style={{ paddingBottom: "0px", height: "90vh" }}
            >
              {sidebarLoader && <Spinner />}
              <iframe
                onLoad={() =>
                  setTimeout(() => {
                    this.setState({ sidebarLoader: false });
                  }, 1000)
                }
                title="addEditSupplierLocationMaster"
                src={iframeSrc}
                allowFullScreen
                frameBorder="0"
                style={{ width: "100%", minHeight: "680px", height: "100%" }}
              />
            </div>
          </Drawer>
        ) : (
          ""
        )}
        {isBulkUploadPopupOpen ? (
          <BulkUploadSupplierLocationMaster hideBulkUploadPopup={this.hideBulkUploadPopup} />
        ) : null}
      </React.Fragment>
    );
  }
}

export default withRouter(withStyles(styles)(SupplierLocationMaster));
