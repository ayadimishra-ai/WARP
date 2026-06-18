export const AppRoles = {
  LocationExecutive: "LocationExecutive",
  OrganizationAdmin: "OrganizationAdmin",
};

export const DataImportHistoryStatus = {
  Failure: "failure",
  Success: "successful",
  Uploaded: "Uploaded",
  "File Error": "File Error",
} as const;

export const CustomHeaderFilter = [
  {
    activity: "General Details",
    activityHeader: "General Details",
    activity_code: "general",
    section: "general",
    shortName: "G",
    count: 0,
  },
  {
    activity: "Production Details",
    activityHeader: "Production Details",
    activity_code: "production",
    section: "production",
    shortName: "P",
    count: 0,
  },
  {
    activity: "Energy-Grid",
    activityHeader: "Energy - Grid",
    activity_code: "energy_grid_power",
    section: "energy",
    shortName: "EG",
    count: 0,
  },
  {
    activity: "Energy-Captive Power",
    activityHeader: "Energy - Captive Power",
    activity_code: "energy_captive_power",
    section: "energy",
    shortName: "EC",
    count: 0,
  },
  {
    activity: "Fuel Consumption",
    activityHeader: "Fuel Consumption",
    activity_code: "energy_fuel_purchased",
    section: "energy",
    shortName: "FC",
    count: 0,
  },
  {
    activity: "Employee Travel",
    activityHeader: "Employee Travel",
    activity_code: "transport_employee_travel",
    section: "transport",
    shortName: "ET",
    count: 0,
  },
  {
    activity: "Business Travel",
    activityHeader: "Business Travel",
    activity_code: "transport_business_travel",
    section: "transport",
    shortName: "BT",
    count: 0,
  },
  {
    activity: "Waste Data",
    activityHeader: "Waste Data",
    activity_code: "waste",
    section: "waste",
    shortName: "W",
    count: 0,
  },
  {
    activity: "Buyer Share",
    activityHeader: "Buyer Share",
    activity_code: "buyer_share",
    section: "buyer_share",
    shortName: "BS",
    count: 0,
  },
  {
    activity: "Upstream Transport",
    activityHeader: "Upstream Transport",
    activity_code: "transport_upstream",
    section: "transport",
    shortName: "US",
    count: 0,
  },
  {
    activity: "Downstream Transport",
    activityHeader: "Downstream Transport",
    activity_code: "transport_downstream",
    section: "transport",
    shortName: "DS",
    count: 0,
  },
  {
    activity: "Material Procurement",
    activityHeader: "Material Procurement",
    activity_code: "material_procurement",
    section: "material",
    shortName: "MP",
    count: 0,
  },
  {
    activity: "CSR",
    activityHeader: "CSR",
    activity_code: "csr",
    section: "csr_master",
    shortName: "CSR",
    count: 0,
  },
  {
    activity: "Governance And Board Composition",
    activityHeader: "Governance And Board Composition",
    activity_code: "governance_and_board_composition",
    section: "boardandgovernance",
    shortName: "GBC",
    count: 0,
  },
  {
    activity: "Human Resources",
    activityHeader: "Human Resources",
    activity_code: "human_resources",
    section: "humanresources",
    shortName: "HR",
    count: 0,
  },
  {
    activity: "Health and Safety",
    activityHeader: "Health and Safety",
    activity_code: "health_and_safety",
    section: "healthandsafety",
    shortName: "HS",
    count: 0,
  },
  {
    activity: "Water Consumption",
    activityHeader: "Water Consumption",
    activity_code: "water_consumption",
    section: "water",
    shortName: "WCO",
    count: 0,
  },
  {
    activity: "Water Withdrawal",
    activityHeader: "Water Withdrawal",
    activity_code: "water_withdrawal",
    section: "water",
    shortName: "WWD",
    count: 0,
  },
  {
    activity: "Wastewater Generation",
    activityHeader: "Wastewater Generation",
    activity_code: "wastewater_generation",
    section: "water",
    shortName: "WWG",
    count: 0,
  },
  {
    activity: "Waste Water Treatment",
    activityHeader: "Wastewater Treatment",
    activity_code: "waste_water_treatment",
    section: "water",
    shortName: "WWT",
    count: 0,
  },
  {
    activity: "Fugitive Details",
    activityHeader: "Fugitive Details",
    activity_code: "fugitive_details",
    section: "fugitive",
    shortName: "FD",
    count: 0,
  },
  {
    activity: "Grievances",
    activityHeader: "Grievances",
    activity_code: "grievances_activity",
    section: "grievances",
    shortName: "GR",
    count: 0,
  },
  {
    activity: "Capital Goods",
    activityHeader: "Capital Goods",
    activity_code: "capital_goods",
    section: "capitalgoods",
    shortName: "CG",
    count: 0,
  },
  {
    activity: "Product Share Allocation",
    activityHeader: "Product Share Allocation",
    activity_code: "product_share_allocation",
    section: "product_share_allocation",
    shortName: "PSA",
    count: 0,
  },
  {
    activity: "Use of Sold Products",
    activityHeader: "Use of Sold Products",
    activity_code: "use_of_sold_products",
    section: "use_of_sold_products",
    shortName: "USP",
    count: 0,
  },
];

export const excludeArray = [
  "transport_downstream",
  "transport_employee_travel",
  "transport_business_travel",
  "general",
];
export const excludeONLActivities = ["transport_downstream", "production"];

export const ACTIVITY_CODES = {
  ENERGY_GRID_POWER: "energy_grid_power",
  ENERGY_CAPTIVE_POWER: "energy_captive_power",
  ENERGY_FUEL_PURCHASED: "energy_fuel_purchased",
  WASTE: "waste",
} as const;

export type ActivityCode = (typeof ACTIVITY_CODES)[keyof typeof ACTIVITY_CODES];

export const TAB_VALUES = {
  AI: "ai",
  BULK: "bulk",
  FORMS: "forms",
} as const;

export type TabValue = (typeof TAB_VALUES)[keyof typeof TAB_VALUES];

export const CAPTIVE_SUB_TABS = {
  RENEWABLE: "renewable",
  FUEL_NON_RENEWABLE: "fuel-non-renewable",
} as const;

export type CaptiveSubTab = (typeof CAPTIVE_SUB_TABS)[keyof typeof CAPTIVE_SUB_TABS];

export const MESSAGE_TYPES = {
  AI_UPLOAD: "ai-upload",
  MANUAL_UPLOAD: "manual-upload",
} as const;

export const UNLOCKED_FORM_CODES = [
  ACTIVITY_CODES.ENERGY_GRID_POWER,
  ACTIVITY_CODES.ENERGY_CAPTIVE_POWER,
  ACTIVITY_CODES.ENERGY_FUEL_PURCHASED,
  ACTIVITY_CODES.WASTE,
] as const;
