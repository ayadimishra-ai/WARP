export const Activities = {
  General: "General",
  Production: "Production",
  EnergyGrid: "EnergyGrid",
  EnergyCaptivePower: "EnergyCaptivePower",
  EnergyFuelPurchased: "EnergyFuelPurchased",
  UpstreamTransport: "UpstreamTransport",
  DownstreamTransport: "DownstreamTransport",
  EmployeeTravelTransport: "EmployeeTravelTransport",
  BusinessTravelTransport: "BusinessTravelTransport",
  Waste: "Waste",
};

export type ActivityType = keyof typeof Activities;

export type ActivityExcelSheetNamesType = {
  [key in ActivityType]: string[];
};

export const ActivityExcelSheetNames: ActivityExcelSheetNamesType = {
  General: ["General Details"],
  Production: [""],
  EnergyGrid: ["Grid Power Details"],
  EnergyCaptivePower: ["Renewable Captive Power, Non Renewable Captive Power"],
  EnergyFuelPurchased: ["General Purpose, Heating Water, AUX Fuel"],
  UpstreamTransport: [""],
  DownstreamTransport: [""],
  EmployeeTravelTransport: ["Employee Travel"],
  BusinessTravelTransport: ["Business Travel"],
  Waste: ["Waste Produced Data"],
};

export const ProductionDetailsActivity = {
  name: "Production Details",
  code: "production",
  parent_code: null,
} as const;

export const ParentActivitiesType = {
  Energy: "Energy",
  Transport: "Transport",
  Waste: "Waste",
  Material: "Material",
  CapitalGoods: "CapitalGoods",
  Fugitive: "Fugitive",
  UseOfSoldProducts: "UseOfSoldProducts",
};
