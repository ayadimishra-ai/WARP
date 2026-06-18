import React from "react";
import { withRouter, Link } from "react-router-dom";
import { withStyles } from "@material-ui/core/styles";
import Button from "../Material/CustomButtons/Button";
import DownloadTemplateDropdown from "../BulkUploadBtn&DownloadTemplateDropdown/DownloadTemplateDropdown";
import ViewDataDropdown from "../BulkUploadBtn&DownloadTemplateDropdown/ViewDataDropdown";
import BulkUploadDropdown from "../BulkUploadBtn&DownloadTemplateDropdown/BulkUploadDropdown";
import navbarsStyle from "../../assets/jss/material-kit-pro-react/views/componentsSections/navbarsStyle";
import { GetGHGEstimationUrl } from "../../config";
import axios from "axios";
import { decodeOpAccessToken } from "../../utility";
import { useEffect } from "react";
import { useState } from "react";

const ManualFormActivityHeaderButton = ({ roles, location }) => {
  const url = location.pathname;
   const [showViewData, setViewData] = useState(false);

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
        const permittedCodes = response.data.data.map(
          (item) => item.sub_activity,
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

        setViewData(unlockedCodes.length > 0);
      } catch (error) {
        console.error("Error fetching activity permissions:", error);
      }
    };

   fetchActivities();
  }, []);

  return (
    <>
      {/* Show Monthly Activity Data button on /ghg/activity/* pages*/}
      {url.includes("/ghg/activity") && (roles.isLocationExecutive() || roles.isOrganizationAdmin()) && (
        <Link to="/monthly-activity-data" className="">
          <Button color="transparent" className="outline_btn_new">
            Monthly Activity Data
          </Button>
        </Link>
      )}
      {url.includes("/ghg/activity/") && (
        <div className="HeaderNewBtnWrapper">
          {roles.isLocationExecutive() && (
            <>
              <DownloadTemplateDropdown isIcon={false} className="DownloadBtn" />
              <BulkUploadDropdown isIcon={false} className="UploadBtn" />
            </>
          )}
          {roles.isOrganizationAdmin() && showViewData && <ViewDataDropdown roles={roles} />}
        </div>
      )}

      {roles.isOrganizationAdmin() && url.includes("/ghgactivity") && showViewData && (
        <div className="HeaderNewBtnWrapper">
          <ViewDataDropdown roles={roles} />
        </div>
      )}

      {roles.isOrganizationAdmin() && url.includes("/monthly-activity-data") && showViewData && (
        <div className="HeaderNewBtnWrapper">
          <ViewDataDropdown roles={roles} />
        </div>
      )}
    </>
  );
};

export default withRouter(
  withStyles(navbarsStyle)(ManualFormActivityHeaderButton),
);
