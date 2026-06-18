export const opsUserType = {
  OrganizationAdmin: {
    value: "OrganizationAdmin",
    label: "Organization Admin",
  },
  LocationExecutive: {
    value: "LocationExecutive",
    label: "Location Executive",
  },
  SuperAdmin: {
    value: "LocationExecutive",
    label: "Location Executive",
  },
};
export const locationOwnerShipType = {
  Own: "Own",
  Contract: "Contract",
};
export const locationType = {
  manufacturing: { value: "Manufacturing", label: "Manufacturing" },
  nonmanufacturing: { value: "NonManufacturing", label: "Non Manufacturing" },
};
export const Month: string[] = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY =
  "capital_goods_quantity_procured_uom";
export const MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY =
  "material_master_material_weight_uom";
export const MATERIAL_QUANTITY_PROCURED_UOM_KEY =
  "material_procurement_material_quantity_procured_uom";
export const TRANSPORT_UPSTREAM_MATERIAL_QUANTITY_PROCURED_UOM_KEY =
  "transport_upstream_Material_Quantity_Procured_UOM";

export const USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY =
  "use_of_sold_products_fuel_type_of_fuel_consumed";
export const USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY =
  "use_of_sold_products_fuel_type_of_fuel_consumed_uom";
export const USE_OF_SOLD_PRODUCTS_RATIONALE_KEY =
  "use_of_sold_products_rationale";
export const USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY =
  "use_of_sold_products_refrigerant_type";
export const USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY =
  "use_of_sold_products_refrigerant_consumed_uom";

export const ActivityMasterKey = {
  water: ["qty_water_use_uom"],
  transport_employee_travel: [
    "transport_employee_travel_distance_traveled_uom",
    "transport_employee_travel_ef_filters_default_fuel_type",
  ],
  waste: [
    "waste_disposal_managed_by",
    "waste_quantity_UOM",
    "waste_disposal_location_distance_uom",
    "waste_disposal_tansport_fuel_used",
    "waste_disposal_tansport_road_vehicle_type",
    "waste_transportation_managed_by",
    "waste_disposal_tansport_mode_of_transport",
    "waste_disposal_mechanism",
  ],
  energy_fuel_purchased: [
    "Energy_FuelPurchased_General_FuelType",
    "Energy_FuelPurchased_General_PointOfConsumption",
    "Energy_FuelPurchased_General_FuelType_UOM",
    "Energy_FuelPurchased_Auxiliary_FuelType_UOM",
    "Energy_FuelPurchased_Auxiliary_FuelType",
    "Energy_FuelPurchased_HeatingWater_FuelType_UOM",
    "Energy_FuelPurchased_HeatingWater_FuelType",
    "transport_upstream_mode_of_transport_fuel_used",
    "transport_upstream_quantity_of_fuel_consumed_UOM",
    "transport_upstream_road_vehicle_type",
    "Energy_FuelPurchased_Transportation_Type",
    "energy_fuelpurchased_transportation_type_of_fuel_uom",
    "energy_fuelpurchased_transportation_type_of_fuel",
  ],
  energy_captive_power: [
    "Energy_CaptivePower_Type_of_Technology_Used",
    "Energy_CaptivePower_NonRenewable_FuelType",
    "Energy_CaptivePower_NonRenewable_FuelType_UOM",
    "Energy_CaptivePower_Renewable_FuelType",
    "Energy_CaptivePower_Renewable_FuelType_UOM",
  ],
  transport_business_travel: [
    "transport_business_travel_mode_of_transport",
    "transport_business_travel_vehicle_type",
    "transport_business_travel_fuel_used",
    "transport_business_travel_distance_per_trip_UOM",
  ],
  transport_upstream: [
    "transport_upstream_Material_Quantity_Procured_UOM",
    "transport_upstream_Distance_per_Trip_UOM",
    "transport_upstream_quantity_of_fuel_consumed_UOM",
    "transport_upstream_supplier_status",
    "transport_upstream_mode_of_transport",
    "transport_upstream_road_vehicle_type",
    "transport_upstream_mode_of_transport_fuel_used",
    "transport_upstream_transport_managed_by",
  ],
  transport_downstream: [
    "transport_downstream_quantity_of_fuel_consumed_UOM",
    "transport_downstream_transport_managed_by",
    "transport_downstream_mode_of_transport",
    "transport_downstream_road_vehicle_type",
    "transport_downstream_fuel_used",
    "transport_downstream_Distance_per_Trip_UOM",
  ],
  buyer_share_attribution: [
    "buyer_share_by_mass_uom",
    "buyer_share_by_volume_uom",
    "buyer_share_by_revenue_uom",
  ],
  material_procurement: [MATERIAL_QUANTITY_PROCURED_UOM_KEY],
  capital_goods: [CAPITAL_GOODS_QUANTITY_PROCURED_UOM_KEY],
  material_master: [MATERIAL_MASTER_MATERIAL_WEIGHT_UOM_KEY],
  wastewater_generation: ["wastewater_uom", "point_of_wastewater_disposal"],
  water_consumption: ["water_consumption_uom"],
  water_withdrawal: ["water_withdrawal_uom", "water_withdrawal_Source"],
  waste_water_treatment: [
    "waste_water_treatment_uom_influent_effluent",
    "waste_water_treatment_uom_effluent",
    "waste_water_treatment_uom_bod",
    "waste_water_treatment_uom_cod",
    "waste_water_treatment_point_of_discharge",
    "waste_water_treatment_uom_sludgedisposedoff",
    "waste_water_treatment_type_of_sludge_disposal",
  ],
  fugitive: [
    "fugitive_type_of_refrigerant_used",
    "fugitive_gas_used_in_fire_extinguisher",
    "fugitive_type_of_refrigerant_uom",
    "fugitive_gas_used_in_fire_extinguisher_uom",
    "fugitive_type_of_industrial_gas_used_uom",
    "fugitive_type_of_industrial_gas_used",
  ],
  csr: ["csr_currency_uom", "csr_themes"],
  human_resources: [
    "human_resources_employment_type",
    "human_resources_employee_category",
  ],
  health_and_safety: [
    "Health_and_Safety_Workforce_Type",
    "Health_and_Safety_Workforce_Category",
    "Health_and_Safety_Training_Type",
    "Health_and_Safety_Agency",
    "Health_and_Safety_Assessed_By",
  ],
  governance_and_board_composition: [
    "Board_Composition_and_Governance_Director_Category",
    "Board_Composition_and_Governance_Compliance_Issues",
  ],
  grievances: ["Grievances_Stakeholder_Category"],
  supplier_master: ["supplier_category"],
  use_of_sold_products: [
    USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_KEY,
    USE_OF_SOLD_PRODUCTS_FUEL_TYPE_OF_FUEL_CONSUMED_UOM_KEY,
    USE_OF_SOLD_PRODUCTS_RATIONALE_KEY,
    USE_OF_SOLD_PRODUCTS_REFRIGERANT_TYPE_KEY,
    USE_OF_SOLD_PRODUCTS_REFRIGERANT_CONSUMED_UOM_KEY,
  ],
};

export const ImportFileStatus = {
  Success: {
    status: "Success",
  },
  Failure: {
    status: "Failure",
    Failurefileurl: "",
    Failurefilemetadata: "",
  },
};

export const TransportModes = {
  Road: "Road",
  Rail: "Rail",
  Air: "Air",
  Water: "Water",
};

export const ModeOfTransport = [
  TransportModes.Road,
  TransportModes.Rail,
  TransportModes.Air,
  TransportModes.Water,
];

export const TransportModesForAPI = [
  {
    name: "Road",
    value: "driving",
  },
  {
    name: "Rail",
    value: "transit",
    mode: [
      { name: "rail", value: "rail" },
      { name: "bus", value: "bus" },
      { name: "subway", value: "subway" },
      { name: "train", value: "train" },
      { name: "tram", value: "tram" },
    ],
  },
  {
    name: "Air",
    value: { flight: "true" },
  },
  {
    name: "Water",
    value: { sea: "true" },
  },
];

export const RoadTransportVehicleTypes = {
  LDV: "LDV",
  MDV: "MDV",
  HDV: "HDV",
};

export const DistancePerTripUOMType = {
  kilometer: "kilometer",
  Mile: "Mile",
};

export const TransportManagedby = {
  Self: "Self",
  Third_Party: "Third Party",
};

export const Activitylist = {
  general: "general",
  production: "production",
  energy: "energy",
  transport: "transport",
  waste: "waste",
  water: "water",
  healthandsafety: "healthandsafety",
};

export const addressTypeAllowedActivity = [
  {
    name: String(locationType?.manufacturing?.value).toLocaleLowerCase(),
    data: [
      {
        name: String(locationOwnerShipType?.Own).toLocaleLowerCase(),
        data: [
          "sng",
          "general",
          "production",
          "energy",
          "transport",
          "waste",
          "buyer_share",
          "material",
          "water",
          "wastewater_generation",
          "water_consumption",
          "water_withdrawal",
          "waste_water_treatment",
          "fugitive_details",
          "csr_master",
          "humanresources",
          "healthandsafety",
          "boardandgovernance",
          "grievances",
          "fugitive",
          "capitalgoods",
          "product_share_allocation",
          "use_of_sold_products",
        ],
        childActivity: [
          "general",
          "production",
          "energy_grid_power",
          "energy_captive_power",
          "energy_fuel_purchased",
          "transport_upstream",
          "transport_downstream",
          "transport_employee_travel",
          "transport_business_travel",
          "waste",
          "buyer_share",
          "material_procurement",
          "governance_and_board_composition",
          "health_and_safety",
          "csr",
          "human_resources",
          "wastewater_generation",
          "water_withdrawal",
          "waste_water_treatment",
          "water_consumption",
          "fugitive_details",
          "boardandgovernance",
          "grievances_activity",
          "capital_goods",
          "product_share_allocation",
          "use_of_sold_products",
        ],
        code: "OML",
      },
      {
        name: String(locationOwnerShipType?.Contract).toLocaleLowerCase(),
        data: [
          "sng",
          "general",
          "production",
          "energy",
          "transport",
          "waste",
          "buyer_share",
          "material",
          "water",
          "wastewater_generation",
          "water_consumption",
          "water_withdrawal",
          "waste_water_treatment",
          "fugitive_details",
          "csr_master",
          "humanresources",
          "healthandsafety",
          "boardandgovernance",
          "grievances",
          "water",
          "fugitive",
          "capitalgoods",
          "use_of_sold_products",
        ],
        childActivity: [
          "general",
          "production",
          "energy_grid_power",
          "energy_captive_power",
          "energy_fuel_purchased",
          "transport_upstream",
          "transport_downstream",
          "transport_employee_travel",
          "transport_business_travel",
          "waste",
          "buyer_share",
          "material_procurement",
          "governance_and_board_composition",
          "health_and_safety",
          "csr",
          "human_resources",
          "wastewater_generation",
          "water_withdrawal",
          "water_consumption",
          "waste_water_treatment",
          "fugitive_details",
          "boardandgovernance",
          "grievances_activity",
          "capital_goods",
          "use_of_sold_products",
        ],
        code: "CML",
      },
    ],
  },
  {
    name: String(locationType?.nonmanufacturing?.value).toLocaleLowerCase(),
    data: [
      {
        name: String(locationOwnerShipType?.Own).toLocaleLowerCase(),
        data: [
          "sng",
          "general",
          "energy",
          "transport",
          "waste",
          "material",
          "water",
          "wastewater_generation",
          "buyer_share",
          "water_consumption",
          "water_withdrawal",
          "waste_water_treatment",
          "fugitive_details",
          "csr_master",
          "humanresources",
          "healthandsafety",
          "boardandgovernance",
          "grievances",
          "water",
          "fugitive",
          "capitalgoods",
          "use_of_sold_products",
        ],
        childActivity: [
          "general",
          "energy_grid_power",
          "energy_captive_power",
          "energy_fuel_purchased",
          "transport_upstream",
          "transport_employee_travel",
          "transport_business_travel",
          "waste",
          "buyer_share",
          "material_procurement",
          "governance_and_board_composition",
          "health_and_safety",
          "csr",
          "human_resources",
          "wastewater_generation",
          "water_withdrawal",
          "waste_water_treatment",
          "water_consumption",
          "fugitive_details",
          "grievances_activity",
          "capital_goods",
          "product_share_allocation",
          "use_of_sold_products",
        ],
        code: "ONL",
      },
    ],
  },
];

export const transport_upstream_materiallist = {
  raw_material: "Raw material",
  packaging_material: "Packaging material",
  semi_finished_goods: "Semi-Finished Goods",
};

export const captive_energy_type = {
  renewable: "Renewable",
  nonrenewable: "Non Renewable",
};

export const transport_upstream_fuel_types = {
  diesel: "Diesel",
  gasoline: "Gasoline",
  cng: "CNG",
  electric: "Electric",
  jetFuel: "Jet Fuel",
  saf: "SAF",
};

export const EMAILQUEUE_STATUS = {
  new: "new",
  sent: "sent",
};

export const upstream_sheet_names = {
  Upstream_Road: "Upstream - Road",
  Upstream_Rail_Air_Water: "Upstream - Rail_Air_Water",
};

export const UPSTREAM_MAX_10000_SHEET_RECORDS_VALIDATION_ERROR_MESSAGE =
  "Maximum 10,000 records can be uploaded at a time";

export const cronJobKey = "EzqUt3IXQxidMdRA";

export const emissionFactorUnits = {
  gj: "/gj",
  kWh: "/kWh",
  paxKm: "/pax-km",
  kg: "/kg",
  tKm: "/t-km",
  lit: "/lit",
  km: "/km",
};
export type bulkEncryptionDecryptionResult = {
  email: string;
  decryptedString?: string;
  encryptedString?: string;
};
export const minimumYearforEmissionFactor = 2000;

export const factorUOMNeedToConvertToTonne = ["kgCO2e/kg", "kgco2/kg"];

export const restrictedMaterialTypesForMaterialProcurementActivity = [
  "Capital Goods",
];
