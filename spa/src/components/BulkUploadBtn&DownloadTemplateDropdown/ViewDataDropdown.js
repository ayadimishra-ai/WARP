import { Divider } from "@material-ui/core";
import { withStyles } from "@material-ui/core/styles";
import axios from "axios";
import React, { useState, useEffect } from "react";
import { withRouter } from "react-router-dom";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import { GetGHGEstimationUrl } from "../../config";
import Button from "../Material/CustomButtons/Button";
import CustomDropdown from "../Material/CustomDropdown/CustomDropdown";
import { decodeOpAccessToken } from "../../utility";
import { Lock } from "@material-ui/icons";
import { showLockUpPopup } from "../../UI/Popups/lockUpPopUp";

const ViewDataDropdown = ({ classes, closefunction, history, roles }) => {
  const [open, setOpen] = useState(false);
  const [activities, setActivities] = useState([]);

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        const decodedToken = decodeOpAccessToken(localStorage.opsToken);
        if (!decodedToken) return;

        const orgId =
          decodedToken["https://hasura.io/jwt/claims"]["x-hasura-org-id"];

        const opConfig = {
          headers: {
            "x-sk-op-authorization": localStorage.opsToken,
            "Content-Type": "application/json",
          },
        };

        const buyerSupplierRoleResponse = await axios.post(
          GetGHGEstimationUrl() + "api/v1/users/buyer-supplier-role",
          { organizationId: orgId },
          opConfig,
        );

        const formData = {
          organizationId: orgId,
          userId:
            decodedToken["https://hasura.io/jwt/claims"]["x-hasura-user-id"],
        };

        const response = await axios.post(
          GetGHGEstimationUrl() + "api/v1/users/activity-permissions",
          formData,
          opConfig,
        );
        debugger

        // const allActivitiesData = response.data.allActivities
        //   .filter(
        //     (item) =>
        //       !(
        //         item.code === "buyer_share" &&
        //         buyerSupplierRoleResponse &&
        //         buyerSupplierRoleResponse.data &&
        //         buyerSupplierRoleResponse.data.data === "BUYER"
        //       ),
        //   )
        //   .map((item) => {
        //     // Only Grid Power and Captive Power are unlocked
        //     const isUnlocked = item.code === "energy_grid_power" || item.code === "energy_captive_power";

        //     return {
        //       activity: item.name,
        //       activityHeader: item.name,
        //       activity_code: item.code,
        //       section: item.category,
        //       isLocked: !isUnlocked,
        //     };
        //   });
        // Allowed activities
      const permittedCodes = response.data.data.map(
        item => item.sub_activity
      );
      const allowedCodes = [
        "energy_grid_power",
        "energy_captive_power",
        "energy_fuel_purchased",
        "waste",
      ];

      const unlockedCodes = permittedCodes.filter((code) =>
        allowedCodes.includes(code),
      );

      const allActivitiesData = response.data.allActivities
        .filter((item) => unlockedCodes.includes(item.code))
        .map((item) => ({
          activity: item.name,
          activityHeader: item.name,
          activity_code: item.code,
          section: item.parent_code,
          isLocked: false,
        }));

      // Sort activities based on isLocked status, if isLocked is false then show them first
      allActivitiesData.sort((a, b) => {
        if (a.isLocked === b.isLocked) {
          return 0;
        }
        return a.isLocked ? 1 : -1;
      });

      // Sort in alphabetical order for isLocked true activities
      allActivitiesData.sort((a, b) => {
        if (a.isLocked && b.isLocked) {
          return a.activity.localeCompare(b.activity);
        }
        return 0;
      });
      setActivities(allActivitiesData);
      } catch (error) {
        console.error("Error fetching activity permissions:", error);
      }
    };

    fetchActivities();
  }, []);

  useEffect(
    () => {
      // Add dropdown overlay listener
      const handleGlobalDropdownClose = (event) => {
        // Close this dropdown if the event is from overlay
        if (event.detail.dropdownId === "overlay-close" && open) {
          setOpen(false);
        }
      };

      document.addEventListener(
        "dropdownStateChange",
        handleGlobalDropdownClose,
      );

      return () => {
        document.removeEventListener(
          "dropdownStateChange",
          handleGlobalDropdownClose,
        );
      };
    },
    [open],
  );

  const getViewDataUrl = (activityCode) => {
    const urlMap = {
      energy_grid_power: "/ghg/activity/grid-power",
      energy_captive_power: "/ghg/activity/captive-power",
       energy_fuel_purchased: "/ghg/activity/fuel-consumption",
       waste: "/ghg/activity/waste",

    };

    return urlMap[activityCode] || "/ghg/activity";
  };

  const handleActivityClick = (item) => {
    if (item.isLocked) {
      showLockUpPopup({
        type: "view",
        activity: item.activityHeader,
      });
      return;
    }

    const path = getViewDataUrl(item.activity_code);
    history.push(path);
    setOpen(false);
  };

  const generateDropdownItems = () => {
    return activities.map((item, index) => (
      <React.Fragment key={index}>
        <Button
          className={`${classes.dropdownLink} ${
            item.isLocked ? "dropdown-item-locked" : ""
          }`}
          data-locked={item.isLocked ? "true" : "false"}
          onClick={(e) => {
            e.preventDefault();
            handleActivityClick(item);
          }}
        >
          <span>{item.activityHeader}</span>
          <span>{item && item.isLocked ? <Lock /> : null}</span>
        </Button>
        {index !== activities.length - 1 && (
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

  const generateListItems = (buttonText) => {
    return activities.length !== 0 ? (
      <CustomDropdown
        customId={buttonText.replace(/ /g, "_")}
        caret={false}
        noLiPadding
        hoverColor="dark"
        dropPlacement={"bottom-end"}
        buttonText={
          <Button
            className="outline_btn_new"
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
        dropdownList={generateDropdownItems()}
      />
    ) : (
      <></>
    );
  };

  const getButtonText = () => {
    if (roles && roles.isLocationExecutive()) {
      return "Add Data";
    }
    return "View Data";
  };

  return <>{generateListItems(getButtonText())}</>;
};

export default withRouter(withStyles(navbarsStyle)(ViewDataDropdown));
