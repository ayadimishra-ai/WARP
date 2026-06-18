import React, { Component } from "react";
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
import { MESSAGE_BULK_UPLOAD_SUPPLIER_MASTER } from "../../ops/message-constant";
import BulkUploadSupplierMasterEnterpriseSetup from "./supplier-master/BulkUploadSupplierMasterEnterpriseSetup";

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

class SupplierMasterListingTable extends Component {
  static contextType = ReCaptchaContext;

  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
      isOpen: false,
      supplier_id: "",
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
          messageData = JSON.parse(event.data);
          const type = messageData.type;
          switch (type) {
            case "add-edit-supplier-master":
              this.setState({
                isOpen: messageData.data.openDrawer,
                supplier_id: messageData.data.supplier_id,
                sidebarLoader: messageData.data.openDrawer,
              });
              break;
            case "supplier-master-form-submitted":
              this.setState({ isOpen: false, sidebarLoader: false });
              popupAlert(
                messageData.isFailed ? "error" : "success",
                messageData.isFailed ? "Error" : "Success",
                messageData.isFailed
                  ? "Something went wrong"
                  : this.state.supplier_id !== "" &&
                    this.state.supplier_id !== null &&
                    this.state.supplier_id !== undefined
                  ? "Supplier updated successfully"
                  : "Supplier added successfully"
              );
              document.getElementById(
                "supplierMasterListing"
              ).src = document.getElementById("supplierMasterListing").src;
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
            case MESSAGE_BULK_UPLOAD_SUPPLIER_MASTER:
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
    document.getElementById(
      "supplierMasterListing"
    ).src = document.getElementById("supplierMasterListing").src;
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
      "/add-supplier-master";
    if (
      this.state.supplier_id !== "" &&
      this.state.supplier_id !== null &&
      this.state.supplier_id !== undefined
    ) {
      iframeSrc =
        GetGHGEstimationUrl() +
        this.state.organizationId +
        "/embed/v1/" +
        localStorage.opsToken +
        "/add-supplier-master?supplier_id=" +
        this.state.supplier_id;
    }

    return (
      <React.Fragment>
        <iframe
          title="Supplier Master Listing"
          id="supplierMasterListing"
          src={
            GetGHGEstimationUrl() +
            this.state.organizationId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/supplier-master-listing-enterprise-setup"
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
                {this.state.supplier_id !== "" &&
                this.state.supplier_id !== null &&
                this.state.supplier_id !== undefined
                  ? "Update Supplier"
                  : "Add New Supplier"}
              </h4>
              <IconButton
                onClick={this.handleDrawerClose}
                style={{
                  backgroundColor: "transparent",
                }}
                className="close-button-custom"
              >
                <CloseIcon />
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
                title="addEditSupplierMaster"
                src={iframeSrc}
                allowfullscreen
                frameBorder="0"
                style={{ width: "100%", minHeight: "680px", height: "100%" }}
              />
            </div>
          </Drawer>
        ) : (
          ""
        )}
        {this.state.isBulkUploadPopupOpen ? (
          <BulkUploadSupplierMasterEnterpriseSetup
            hideBulkUploadPopup={this.hideBulkUploadPopup}
            submitDataHandle={this.submitDataHandle}
          />
        ) : null}
      </React.Fragment>
    );
  }
}

export default withStyles(styles)(SupplierMasterListingTable);