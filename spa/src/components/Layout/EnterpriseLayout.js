import React, { Component } from "react";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import OpsSidebar from "./OpsSidebar";
import OrganizationDetails from "../../containers/OpsContainer/OrganizationDetails";
import LocationListingTable from "../../containers/OpsContainer/LocationListingTable";
import UserListingTable from "../../containers/OpsContainer/UserListingTable";
import MaterialListingTable from "../../containers/OpsContainer/MaterialListingTable";
import UserActivityMapping from "../../containers/OpsContainer/UserActivityMapping";
import Spinner from "../../UI/Spinner/Spinner";
import { OPPrivateRoute } from "../CustomRoutes/PrivateRoute";
import SupplierMaterialMapping from "../../containers/OpsContainer/SupplierMaterialMapping";
import SupplierLocationMaster from "../../containers/OpsContainer/SupplierLocationMaster";
import SupplierMasterListingTable from "../../containers/OpsContainer/SupplierMasterListingTable";

let messageData = "";

class EnterpriseLayout extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
    };
  }

  componentDidMount() {
    window.addEventListener("message", this.handleMessage);

    // Initial timeout fallback in case no message is received
    setTimeout(() => {
      if (this.state.loading) {
        this.setState({ loading: false });
      }
    }, 1000);
  }

  componentWillUnmount() {
    window.removeEventListener("message", this.handleMessage);
  }

  componentDidUpdate(prevProps) {
    // Show loader when route changes
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setState({ loading: true });

      // Timeout for route changes
      setTimeout(() => {
        if (this.state.loading) {
          this.setState({ loading: false });
        }
      }, 1000);
    }
  }

  handleMessage = (event) => {
    let dataType = typeof event.data;
    const URL = window.location.href;

    if (!URL.includes("/enterprise-setup")) return;

    if (dataType === "string") {
      try {
        messageData = JSON.parse(event.data);
        const type = messageData.type;

        switch (type) {
          case "warp-check-localStorage-access":
          case "iframe-ready":
          case "content-loaded":
          case "org-details-ready":
          case "location-listing-ready":
          case "user-listing-ready":
            // Hide loader when iframe confirms it's ready
            this.setState({ loading: false });
            break;
          default:
            break;
        }
      } catch (error) {
        console.error("Error parsing message:", error);
      }
    }
  };

  // Get the current active page from URL
  getActivePageFromUrl = () => {
    const path = this.props.location.pathname;
    if (path.includes("/organization-details")) return "organization";
    if (path.includes("/locations")) return "locations";
    if (path.includes("/users")) return "users";
    if (path.includes("/materials")) return "materials";
    if (path.includes("/activity-mapping")) return "activity-mapping";
    if (path.includes("/user-activity")) return "user-activity";
    if (path.includes("/supplier-material-mapping")) return "supplier-material-mapping";
    if (path.includes("/supplier-location-master")) return "supplier-location-master";
    if (path.includes("/suppliers")) return "suppliers";
    return "organization"; // default
  };

  handlePageChange = (pageKey) => {
    const routeMap = {
      organization: "/enterprise-setup/organization-details",
      locations: "/enterprise-setup/locations",
      users: "/enterprise-setup/users",
      materials: "/enterprise-setup/materials",
      "activity-mapping": "/enterprise-setup/activity-mapping",
      "user-activity": "/enterprise-setup/user-activity",
      "supplier-material-mapping": "/enterprise-setup/supplier-material-mapping",
      "supplier-location-master": "/enterprise-setup/supplier-location-master",
      suppliers: "/enterprise-setup/suppliers",
    };

    this.props.history.push(routeMap[pageKey]);
  };

  render() {
    return (
      <div
        className="OPSContainers"
        style={{
          padding: 0,
          display: "flex",
          flexDirection: "row",
          justifyContent: "space-between",
          background: "#f7f9fb",
        }}
      >
        <div
          className="sideNavGreen"
          style={{ width: "238px", backgroundColor: "#E8F8F8" }}
        >
          <OpsSidebar
            activePage={this.getActivePageFromUrl()}
            onPageChange={this.handlePageChange}
          />
        </div>
        <div
          className="mainContent"
          style={{ width: "-webkit-fill-available", position: "relative" }}
        >
          {this.state.loading && (
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: "#fff",
                zIndex: 9999,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "600px",
              }}
            >
              <Spinner />
            </div>
          )}
          <Switch>
            <Route
              exact
              path="/enterprise-setup/organization-details"
              component={OrganizationDetails}
            />
            <Route
              exact
              path="/enterprise-setup/locations"
              component={LocationListingTable}
            />
            <Route
              exact
              path="/enterprise-setup/users"
              component={UserListingTable}
            />
            <Route
              exact
              path="/enterprise-setup/materials"
              component={MaterialListingTable}
            />
            <Route
              exact
              path="/enterprise-setup/suppliers"
              component={SupplierMasterListingTable}
            />
            <Route
              exact
              path="/enterprise-setup/activity-mapping"
              component={UserActivityMapping}
            />
            <Route
              exact
              path="/enterprise-setup/user-activity"
              component={UserListingTable}
            />
            <Route
              exact
              path="/enterprise-setup/supplier-material-mapping"
              component={SupplierMaterialMapping}
            />
            <Route
              exact
              path="/enterprise-setup/supplier-location-master"
              component={SupplierLocationMaster}
            />
            <Route
              exact
              path="/enterprise-setup/suppliers"
              component={SupplierMasterListingTable}
            />
            <Route exact path="/enterprise-setup">
              <Redirect to="/enterprise-setup/organization-details" />
            </Route>
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(EnterpriseLayout);
