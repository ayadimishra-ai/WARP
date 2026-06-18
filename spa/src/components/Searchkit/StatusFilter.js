import React from "react";
import { HierarchicalMenuFilter } from "searchkit";
import { getLabelText } from "../../config";

const statusFilter = props => {
  return (
    <HierarchicalMenuFilter
      fields={["status_raw.raw"]}
      title={getLabelText(
        props.Resources.filter(x => {
          return x.resourceKey === "status_raw.raw";
        })[0],
        "Status"
      )}
      id="statusFilter"
    />
  );
};

export default statusFilter;
