import React from "react";
import { GetGHGEstimationUrl } from "../../config";

const AddUsers = () => {
  return (
    <iframe
      title="Add Users"
      id="Add Users"
      src={
        GetGHGEstimationUrl() +
        localStorage.opsUserCompanyId +
        "/embed/v1/" +
        localStorage.opsToken +
        "/add-user"
      }
      style={{ width: "100%", height: "100vh", border: "none" }}
    />
  );
};

export default AddUsers;
