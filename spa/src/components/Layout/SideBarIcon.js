import { getAWSUrl,getWebsiteUrl } from "../../config"
import React, { useMemo } from 'react';

const ICONS_MAP = {
  Dashboard: "Dashboard",
  Home: "Home",
  Description:"Description",
  Measure: "Measure",
  Analyse: "Analyse",
  Assess: "Assess",
  Cart: "Cart",
  Wishlist: "Wishlist",
  Settings: "Settings",
  ShoppingCart: "ShoppingCart",
  Notifications: "Notifications",
  "Global Settings": "Settings",
  "Preference Setting": "Settings",
  Menu: "TextOutdent",
  "ESG Framework": "Report",
  Report: "Report",
  EnterpriseSetup: "EnterpriseSetup",
  Assessments_reporting: "Assessments_reporting",
  DocumentRepository: "DocumentRepository",
  ChatWithSnowkapAI: "ChatWithSnowkapAI",
  ManageUomConversionFactors: "ManageUomConversionFactors",
  ManageCarbonEmissionFactors: "ManageCarbonEmissionFactors",
};

const SideBarIcon = ({ icon, isActive }) => {
  const iconPath = useMemo(() => {
    const baseIcon = ICONS_MAP[icon] || "Dashboard"; 
    return `${getWebsiteUrl()}MenuIcon/${baseIcon}${isActive ? "Hover" : ""}.svg`;
  }, [icon, isActive]); 

  return (
    <img
      className="sidebarImg"
      alt={`${icon} Icon`}
      src={iconPath} 
    />
  );
};

export default SideBarIcon;

