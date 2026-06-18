import React, { Component } from "react";
import { decodeOpAccessToken } from "../../utility";
import { GetGHGEstimationUrl } from "../../config";
import Drawer from "@material-ui/core/Drawer";
import IconButton from "@material-ui/core/IconButton";
import ChevronLeft from "@material-ui/icons/ChevronLeft";
import CloseIcon from "@material-ui/icons/Close";
import Spinner from "../../UI/Spinner/Spinner";
import { popupAlert } from "../../UI/Popups/popup";
import { withStyles } from "@material-ui/core/styles";
import {
  ReCaptchaContext,
  captchaValidation,
} from "../../google-invisible-recaptcha/RecaptchaProvider";
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
class LocationListingTable extends Component {
  static contextType = ReCaptchaContext;
  constructor(props) {
    super(props);
    this.state = {
      jwtToken: "",
      organizationId: "",
      isOpen: false,
      address_id: "",
    };
  }

  componentDidMount = async () => {
    this.setState({ jwtToken: localStorage.opsToken });
    const decodedToken = decodeOpAccessToken(localStorage.opsToken);
    const organizationId =
      decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];
    localStorage.setItem("opsUserCompanyId", organizationId);
    this.setState({ organizationId: organizationId });
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
            case "add-edit-location":
              this.setState({
                isOpen: messageData.data.openDrawer,
                address_id: messageData.data.address_id,
              });
              break;
            case "location-form-submitted":
              this.setState({ isOpen: false });
              popupAlert(
                messageData.isFailed ? "error" : "success",
                messageData.isFailed ? "Error" : "Success",
                messageData.isFailed
                  ? "Something went wrong"
                  : this.state.address_id !== "" &&
                    this.state.address_id !== null &&
                    this.state.address_id !== undefined
                  ? "Location updated successfully"
                  : "Location added successfully"
              );
              document.getElementById(
                "locationListing"
              ).src = document.getElementById("locationListing").src;
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
            default:
              break;
          }
        } catch (error) {
          console.error(`Error in ${messageData.type}: `, error);
        }
      }
    });
  };
  render() {
    const { classes } = this.props;
    let iframeSrc =
      GetGHGEstimationUrl() +
      this.state.organizationId +
      "/embed/v1/" +
      localStorage.opsToken +
      "/add-location";
    if (
      this.state.address_id !== "" &&
      this.state.address_id !== null &&
      this.state.address_id !== undefined
    ) {
      iframeSrc =
        GetGHGEstimationUrl() +
        this.state.organizationId +
        "/embed/v1/" +
        localStorage.opsToken +
        "/add-location?address_id=" +
        this.state.address_id;
    }
    return (
      <React.Fragment>
        <iframe
          title="Location Listing"
          id="locationListing"
          src={
            GetGHGEstimationUrl() +
            localStorage.opsUserCompanyId +
            "/embed/v1/" +
            localStorage.opsToken +
            "/location-listing"
          }
          style={{ width: "100%", height: "100vh", border: "none" }}
        />
        {this.state.isOpen ? (
          <Drawer
            className={classes.drawer}
            // variant="persistent"
            anchor="right"
            open={this.state.isOpen}
            classes={{
              paper: `${classes.drawerPaper} quick_view_pannel`,
            }}
            onClick={() => this.setState({ isOpen: false })}
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
                {this.state.address_id !== "" &&
                this.state.address_id !== null &&
                this.state.address_id !== undefined
                  ? "Update Location"
                  : "Add New Location"}
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
                title="addEditLocation"
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
      </React.Fragment>
    );
  }
}
export default withStyles(styles)(LocationListingTable);
