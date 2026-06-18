import React, { Component } from "react";
import { Route, Switch, withRouter, Redirect } from "react-router-dom";
import axios from "axios";
import Spinner from "../../UI/Spinner/Spinner";
import NotFound from "../../containers/NotFound/NotFound";
import { GetGHGEstimationUrl } from "../../config";
import { decodeOpAccessToken } from "../../utility";
import DataLogSidebar from "./DataLogSidebar";
import { OPPrivateRoute } from "../CustomRoutes/PrivateRoute";
import GHGActivity from "../../containers/OpsContainer/GHGActivity";
import DataUploadLogSummary from "../../containers/OpsContainer/DataUploadLogSummary";

const LOADING_TIMEOUT_MS = 1000;
const GHG_ESTIMATION_URL = GetGHGEstimationUrl();
const SIDEBAR_BASE_PATH = "/data-upload-logs";
const DEFAULT_SIDEBAR_ITEMS = [];

const getSidebarItemUrl = (activityCode) => {
  if (!activityCode) {
    return SIDEBAR_BASE_PATH;
  }

  return `${SIDEBAR_BASE_PATH}/${encodeURIComponent(activityCode)}`;
};

const sortActivitiesByLockAndName = (activities) =>
  [...activities].sort((a, b) => {
    if (a.isLocked !== b.isLocked) {
      return a.isLocked ? 1 : -1;
    }

    const nameA = (a.activityHeader || a.activity || a.name || "").toLowerCase();
    const nameB = (b.activityHeader || b.activity || b.name || "").toLowerCase();
    return nameA.localeCompare(nameB);
  });

const buildSidebarItemsFromActivities = (activities) =>
  [
    {
      key: "all",
      label: "All Monthly Activity Summary",
      path: SIDEBAR_BASE_PATH,
      url: SIDEBAR_BASE_PATH,
      isLocked: false,
      lockType: "view",
      showDividerAfter: true,
    },
    ...activities.map((item, index) => {
    const key = item.activity_code || item.code || `activity_${index}`;
    const path = getSidebarItemUrl(key);

    return {
      key,
      label: item.activityHeader || item.activity || item.name || "Untitled Activity",
      path,
      url: path,
      isLocked: Boolean(item.isLocked),
      lockType: "view",
    };
    }),
  ];

class DataUploadLogSummaryLayout extends Component {
  state = {
    loading: true,
    sidebarItems: DEFAULT_SIDEBAR_ITEMS,
  };

  loadingTimeout = null;
  isUnmounted = false;

  componentDidMount() {
    this.scheduleLoadingFallback();
    this.fetchSidebarItems();
  }

  componentWillUnmount() {
    this.isUnmounted = true;
    this.clearLoadingFallback();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.location.pathname !== this.props.location.pathname) {
      this.setLoading(true);
      this.scheduleLoadingFallback();
    }
  }

  clearLoadingFallback = () => {
    if (this.loadingTimeout) {
      clearTimeout(this.loadingTimeout);
      this.loadingTimeout = null;
    }
  };

  scheduleLoadingFallback = () => {
    this.clearLoadingFallback();
    this.loadingTimeout = setTimeout(() => {
      this.setLoading(false);
    }, LOADING_TIMEOUT_MS);
  };

  setLoading = (loading) => {
    if (this.state.loading !== loading) {
      this.setState({ loading });
    }
  };

  fetchSidebarItems = async () => {
    try {
      const decodedToken = decodeOpAccessToken(localStorage.opsToken);
      if (!decodedToken) {
        if (!this.isUnmounted) {
          this.setState({ sidebarItems: [] });
        }
        return;
      }

      const orgId =
        decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];

      const opConfig = {
        headers: {
          "x-sk-op-authorization": localStorage.opsToken,
          "Content-Type": "application/json",
        },
      };

      const buyerSupplierRoleResponse = await axios.post(
        GHG_ESTIMATION_URL + "api/v1/users/buyer-supplier-role",
        { organizationId: orgId },
        opConfig
      );

      const formData = {
        organizationId: orgId,
        userId:
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
      };

      const response = await axios.post(
        GHG_ESTIMATION_URL + "api/v1/users/activity-permissions",
        formData,
        opConfig
      );

      const responseData = response && response.data ? response.data : {};
      const allActivities = Array.isArray(responseData.allActivities)
        ? responseData.allActivities
        : [];
      const permittedActivities = Array.isArray(responseData.data)
        ? responseData.data
            .filter((item) => item.locations && item.locations.length > 0)
            .map((item) => ({
              activity: item.label,
              activityHeader: item.label,
              activity_code: item.sub_activity,
              section: item.main_activity,
              locations: item.locations,
              is_AI_Enabled: item.is_AI_enabled || false,
            }))
        : [];

      const isBuyerOrganization =
        buyerSupplierRoleResponse &&
        buyerSupplierRoleResponse.data &&
        buyerSupplierRoleResponse.data.data === "BUYER";

      const allActivitiesData = allActivities
        .filter(
          (item) => !(item.code === "buyer_share" && isBuyerOrganization)
        )
        .map((item) => {
          const matchedActivity = permittedActivities.find(
            (activity) => activity.activity_code === item.code
          );

          if (matchedActivity) {
            return {
              ...item,
              ...matchedActivity,
              isLocked: false,
            };
          }

          return {
            ...item,
            activity: item.name,
            activityHeader: item.name,
            activity_code: item.code,
            section: item.category,
            isLocked: true,
          };
        });

      const sortedActivities = sortActivitiesByLockAndName(allActivitiesData);
      const sidebarItems = buildSidebarItemsFromActivities(sortedActivities);

      if (!this.isUnmounted) {
        this.setState({ sidebarItems });
      }
    } catch (error) {
      console.error("Error fetching activity permissions:", error);
      if (!this.isUnmounted) {
        this.setState({ sidebarItems: [] });
      }
    }
  };

  getActivePageFromUrl = () => {
    const path = this.props.location.pathname;
    const activePage = this.state.sidebarItems.find(
      ({ path: itemPath }) => itemPath && path === itemPath
    );

    if (activePage) {
      return activePage.key;
    }

    return "";
  };

  handlePageChange = (pageKey) => {
    const selectedItem = this.state.sidebarItems.find(
      ({ key }) => key === pageKey
    );
    const nextPath = selectedItem ? selectedItem.path : "";

    if (nextPath && nextPath !== this.props.location.pathname) {
      this.props.history.push(nextPath);
    }
  };

  render() {
    return (
      <div className="mainLayout">
        <div className="sideNav">
          <DataLogSidebar
            activePage={this.getActivePageFromUrl()}
            onPageChange={this.handlePageChange}
            items={this.state.sidebarItems}
          />
        </div>
        <div className="mainContent">
          {this.state.loading && (
            <div className="loader">
              <Spinner />
            </div>
          )}
          <Switch>
            <OPPrivateRoute
              exact
              path={`${SIDEBAR_BASE_PATH}/:activityCode`}
              component={GHGActivity}
            />
            <OPPrivateRoute
              exact
              path={SIDEBAR_BASE_PATH}
              component={DataUploadLogSummary}
            />
            <Route
              render={() =>
                localStorage.getItem("IsAuthentic") === "true" ? (
                  <NotFound />
                ) : (
                  <Redirect to="/" />
                )
              }
            />
          </Switch>
        </div>
      </div>
    );
  }
}

export default withRouter(DataUploadLogSummaryLayout);
