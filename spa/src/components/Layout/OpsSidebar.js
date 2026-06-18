import { Link } from "@material-ui/core";
import React from "react";
import { CheckIsDaimlerCompany } from "../../ops/ops.service";

const sidebarStyle = {
  background: "#E8F8F8",
  color: "#003B52",
  width: "238px",
  minHeight: "100vh",
  padding: "24px 0",
  fontFamily: "inherit",
  display: "flex",
  flexDirection: "column",
  gap: "10px"
};

const itemStyle = {
  padding: "12px 32px",
  fontWeight: 400,
  fontSize: "14px",
  cursor: "pointer",
  color: "#003B52",
  textDecoration: "none",
  display: "block",
  textAlign: "left",
  border: "none",
  background: "transparent",
  width: "100%",
  transition: "background-color 0.2s ease"
};
const itemStyleBlack = {
  padding: "12px 32px",
  fontWeight: 400,
  fontSize: "14px",
  cursor: "none",
  color: "#000000",
  textDecoration: "none",
  display: "block",
  textAlign: "left",
  border: "none",
  background: "transparent",
  width: "100%",
  transition: "background-color 0.2s ease"
};
const activeItemStyle = {
  ...itemStyle,
  backgroundColor: "none",
  fontWeight: 700
};

const dividerStyle = {
  border: "none",
  borderTop: "1px solid #72D0C6",
  margin: "0"
};

const subtextStyle = {
  fontSize: "11px",
  color: "#444444",
  opacity: 0.7,
  paddingLeft: "32px",
  marginTop: "-8px",
  marginBottom: "8px"
};

const OpsSidebar = ({ activePage, onPageChange }) => {
  const handleItemClick = (pageKey) => {
    onPageChange(pageKey);
  };

  const IsDaimlerOrganization = CheckIsDaimlerCompany();

  return (
    <aside style={sidebarStyle}>
      <Link 
        component="button" 
        style={activePage === "organization" ? activeItemStyle : itemStyle}
        onClick={() => handleItemClick("organization")}
      >
        Organization
      </Link>
      <Link 
        component="button" 
        style={activePage === "locations" ? activeItemStyle : itemStyle}
        onClick={() => handleItemClick("locations")}
      >
        Locations
      </Link>
      <Link 
        component="button" 
        style={activePage === "users" ? activeItemStyle : itemStyle}
        onClick={() => handleItemClick("users")}
      >
        Users
      </Link>
      <Link 
        component="button" 
        style={activePage === "materials" ? activeItemStyle : itemStyle}
        onClick={() => handleItemClick("materials")}
      >
        Materials
      </Link>
      <Link 
        component="button" 
        style={activePage === "suppliers" ? activeItemStyle : itemStyle}
        onClick={() => handleItemClick("suppliers")}
      >
        Suppliers
      </Link>
      <Link
        component="button"
        style={activePage === "supplier-location-master" ? activeItemStyle : itemStyle}
        onClick={() => handleItemClick("supplier-location-master")}
      >
        Supplier Locations
      </Link>
      
      <hr style={dividerStyle} />
      <div>
        <Link 
          component="button" 
          style={itemStyleBlack}
        >
          Activity Mapping
        </Link>
        <div style={subtextStyle}>Map activities and locations of <br /> users.</div>
      </div>
      <Link 
        component="button" 
        style={activePage === "activity-mapping" ? activeItemStyle : itemStyle}
        onClick={() => handleItemClick("activity-mapping")}
      >
        User &amp; Activity
      </Link>
      {IsDaimlerOrganization && (
      <Link
        component="button"
        style={activePage === "supplier-material-mapping" ? activeItemStyle : itemStyle}
        onClick={() => handleItemClick("supplier-material-mapping")}
      >
        Supplier Material
      </Link>)}
    </aside>
  );
};

export default OpsSidebar;
